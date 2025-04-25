import { supabase } from "services/supabase";
import QRCode from "qrcode";
import { randomUUID } from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import { config } from "config";

// Generate unique ticket ID
const generateTicketId = (): string => randomUUID();

// Generate QR code data
const generateQRCodeData = (ticketId: string): string =>
  `${config.API_DOMAIN}/verify/${ticketId}`;

// Generate tickets for a category
async function generateTickets(
  category: string,
  quantity: number,
  tableName: string,
  pdfFileName: string,
) {
  const pdfTickets: {
    ticket_id: string;
    qr_code_image: string;
    qr_code_data: string;
  }[] = [];
  const batchTickets: {
    ticket_id: string;
    qr_code_image: string;
    qr_code_data: string;
  }[] = [];
  const batchSize = 50; // Insert in batches to avoid Supabase limits

  // Generate and collect tickets
  for (let i = 0; i < quantity; i++) {
    const ticketId = generateTicketId();
    const qrCodeData = generateQRCodeData(ticketId);

    // Generate QR code image (base64)
    let qrCodeImage: string;
    try {
      qrCodeImage = await QRCode.toDataURL(qrCodeData);
    } catch (err: any) {
      console.error(
        `Failed to generate QR code for ${ticketId}: ${err.message}`,
      );
      throw err;
    }

    const ticket = {
      ticket_id: ticketId,
      qr_code_image: qrCodeImage,
      qr_code_data: qrCodeData,
    };
    pdfTickets.push(ticket); // Store for PDF generation
    batchTickets.push(ticket); // Store for batch insertion

    // Insert batch when size is reached or at the end
    if (batchTickets.length === batchSize || i === quantity - 1) {
      try {
        const { error } = await supabase.from(tableName).insert(
          batchTickets.map((ticket) => ({
            ticket_id: ticket.ticket_id,
            qr_code_data: ticket.qr_code_data,
            qr_code_image: ticket.qr_code_image,
            status: "active",
          })),
        );

        if (error) {
          console.error(
            `Failed to save tickets to ${tableName}: ${error.message}`,
          );
          throw error;
        }

        console.log(`Inserted ${batchTickets.length} tickets to ${tableName}`);
        batchTickets.length = 0; // Clear batch
      } catch (err: any) {
        console.error(
          `Batch insertion failed for ${tableName}: ${err.message}`,
        );
        throw err;
      }
    }
  }

  // Generate PDF
  const doc = new PDFDocument({ size: "LETTER" }); // 612 x 792 points
  doc.pipe(fs.createWriteStream(`files/${pdfFileName}`));

  // Page settings
  const pageHeight = 792;
  const qrCodeSize = 200;
  const gap = 100; // Adjusted to fit 2 tickets per page
  const textWidth = 50; // Approximate width for ticket number (e.g., "1.")
  const marginTop = 50;
  const marginBottom = 50;
  let yPosition = marginTop;
  let isFirstPage = true;

  // First page header
  doc.fontSize(20).text("Concert Ticket", { align: "center" });
  doc.fontSize(16).text(`Category: ${category}`, { align: "center" });
  doc.fontSize(12).text(`number: ${quantity}`, { align: "center" });
  doc.moveDown(2);
  yPosition += 80; // Approximate height of header

  pdfTickets.forEach((ticket, index) => {
    // Check if there's enough space for QR code and gap
    if (yPosition + qrCodeSize + gap > pageHeight - marginBottom) {
      doc.addPage();
      yPosition = marginTop;
      isFirstPage = false;
    }

    // Add ticket number and QR code side by side
    const ticketNumberText = `${index + 1}.`;
    const xPosition = (612 - (textWidth + 10 + qrCodeSize)) / 2; // Center text + QR code
    doc
      .fontSize(12)
      .text(ticketNumberText, xPosition, yPosition + (qrCodeSize - 12) / 2); // Align text vertically with QR code
    doc.image(
      Buffer.from(ticket.qr_code_image.split(",")[1], "base64"),
      xPosition + textWidth + 10,
      yPosition,
      { fit: [qrCodeSize, qrCodeSize] },
    );

    yPosition += qrCodeSize + gap; // Move down by QR code size plus gap
  });

  doc.end();
  console.log(`Generated ${pdfFileName} with ${pdfTickets.length} tickets`);
}

// Main function
async function main() {
  try {
    // Create files directory
    fs.mkdirSync("files", { recursive: true });

    await generateTickets(
      "Special VIP",
      300,
      "special_vip_tickets",
      "special_vip_tickets.pdf",
    );
    await generateTickets("VIP", 300, "vip_tickets", "vip_tickets.pdf");
    await generateTickets(
      "Regular",
      400,
      "regular_tickets",
      "regular_tickets.pdf",
    );

    console.log("All tickets generated successfully");
  } catch (error: any) {
    console.error(`Error generating tickets: ${error.message}`);
  }
}

main();
