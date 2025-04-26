import { Request, Response } from "express";
import { supabase } from "services/supabase";
import { APIErrorResponse, APISuccessResponse } from "types/req-res";
import { Database } from "types/supabase";

type PartialTicket = {
  ticket_id: string;
  status: string;
  qr_code_data: string;
  out_count: number;
};

function getTicketCategory(tableName: string): string {
  return tableName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const VerifyTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { qrCodeData, invalidate } = req.body;

    if (
      !qrCodeData ||
      typeof qrCodeData !== "string" ||
      qrCodeData.trim() === ""
    ) {
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

    const queryPromises = tables.map(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select("ticket_id, status, qr_code_data, out_count")
        .eq("qr_code_data", qrCodeData)
        .maybeSingle();

      return { table, data, error };
    });

    const queryResults = await Promise.all(queryPromises);

    let ticket: PartialTicket | null = null;
    let tableName: string | null = null;

    for (const { table, data, error } of queryResults) {
      if (error && error.code !== "PGRST116") {
        console.error(
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

    if (ticket.status === "used") {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: "Ticket already used",
          details: "This ticket has been fully invalidated and is out of use",
          code: 400,
          hint: "Use a valid, active ticket",
        },
      };
      res.status(400).json(errorResponse);
      return;
    }

    let updateData: { status: string; used_at?: string; out_count?: number };
    let successMessage: string;

    if (ticket.status === "active") {
      updateData = {
        status: "got_out",
        out_count: ticket.out_count + 1,
        used_at: new Date().toISOString(),
      };
      successMessage = "Ticket successfully verified for first entry";
    } else if (ticket.status === "got_out") {
      if (invalidate) {
        updateData = {
          status: "used",
          used_at: new Date().toISOString(),
        };
        successMessage = "Ticket fully invalidated";
      } else {
        updateData = {
          status: "got_out",
          out_count: ticket.out_count + 1,
          used_at: new Date().toISOString(),
        };
        successMessage = `Ticket re-entered (out_count: ${updateData.out_count})`;
      }
    } else {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: "Invalid ticket status",
          details: `Ticket has an unexpected status: ${ticket.status}`,
          code: 500,
          hint: "Contact support",
        },
      };
      res.status(500).json(errorResponse);
      return;
    }

    const { error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("ticket_id", ticket.ticket_id);

    if (updateError) {
      console.error(
        `[VerifyTicket] Failed to update ticket ${ticket.ticket_id}: ${updateError.message}`,
      );
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: "Failed to update ticket",
          details: updateError.message,
          code: 500,
          hint: "Try again or contact support",
        },
      };
      res.status(500).json(errorResponse);
      return;
    }

    console.log(
      `[VerifyTicket] Ticket ${ticket.ticket_id} updated to ${updateData.status}`,
    );
    const successResponse: APISuccessResponse = {
      success: true,
      message: successMessage,
      data: {
        ticket_id: ticket.ticket_id,
        status: updateData.status,
        out_count: updateData.out_count ?? ticket.out_count,
        category: getTicketCategory(tableName),
      },
    };
    res.status(200).json(successResponse);
  } catch (error: any) {
    console.error(`[VerifyTicket] Unexpected error: ${error.message}`);
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
