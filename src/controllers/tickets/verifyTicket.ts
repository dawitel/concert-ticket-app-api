import { Request, Response } from "express";
import { supabase } from "services/supabase";
import { logger } from "utils/logger";
import { APIErrorResponse, APISuccessResponse } from "types/req-res";

type PartialTicket = {
  ticket_id: string;
  status: string;
  qr_code_data: string;
};

export const VerifyTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData || typeof qrCodeData !== "string") {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: "Invalid QR code data",
          details: "QR code data must be a non-empty string",
          code: 400,
          hint: "Provide valid QR code data in the request body",
        },
      };
      res.status(400).json(errorResponse);
      return;
    }

    const tables = ["special_vip_tickets", "vip_tickets", "regular_tickets"];
    let ticket: PartialTicket | null = null;
    let tableName: string | null = null;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("ticket_id, status, qr_code_data")
        .eq("qr_code_data", qrCodeData)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error(
          `[VerifyTicket] Failed to query ${table}: ${error.message}`,
        );
        const errorResponse: APIErrorResponse = {
          success: false,
          error: {
            message: "Database query failed",
            details: error.message,
            code: 500,
            hint: "Try again or contact support",
          },
        };
        res.status(500).json(errorResponse);
        return;
      }

      if (data) {
        ticket = data;
        tableName = table;
        break;
      }
    }

    if (!ticket || !tableName) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: "Ticket not found",
          details: "No ticket matches the provided QR code data",
          code: 404,
          hint: "Ensure the QR code is valid",
        },
      };
      res.status(404).json(errorResponse);
      return;
    }

    if (ticket.status !== "active") {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: `Ticket is ${ticket.status}`,
          details: `This ticket cannot be used as it is already ${ticket.status}`,
          code: 400,
          hint: "Use a valid, active ticket",
        },
      };
      res.status(400).json(errorResponse);
      return;
    }

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("ticket_id", ticket.ticket_id);

    if (updateError) {
      logger.error(
        `[VerifyTicket] Failed to update ticket ${ticket.ticket_id}: ${updateError.message}`,
      );
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: "Failed to invalidate ticket",
          details: updateError.message,
          code: 500,
          hint: "Try again or contact support",
        },
      };
      res.status(500).json(errorResponse);
      return;
    }

    logger.info(
      `[VerifyTicket] Ticket ${ticket.ticket_id} verified and invalidated`,
    );
    const successResponse: APISuccessResponse = {
      success: true,
      message: "Ticket verified and invalidated",
      data: { ticket_id: ticket.ticket_id },
    };
    res.status(200).json(successResponse);
  } catch (error: any) {
    logger.error(`[VerifyTicket] Unexpected error: ${error.message}`);
    const errorResponse: APIErrorResponse = {
      success: false,
      error: {
        message: "Failed to verify ticket",
        details: error.message,
        code: 500,
        hint: "Please try again or contact support",
      },
    };
    res.status(500).json(errorResponse);
  }
};
