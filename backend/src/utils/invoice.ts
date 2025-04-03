import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { InvoiceDocument } from "../types/types";
import { format } from "date-fns";

export const generateInvoicePdf = (
  invoiceData: InvoiceDocument,
  copyName: string,
  res: any
) => {
  const doc = new PDFDocument({ size: "A4", margin: 30 });
  const pageWidth = doc.page.width - 0.2 * doc.page.width;
  let yPosition;
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoiceData.client.name}_${copyName}_${invoiceData.invoiceNumber}.pdf"`
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(`${invoiceData.company.name}`, { align: "center" });
  doc.fontSize(10).font("Helvetica").text(`${copyName}`, { align: "right" });

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`${invoiceData.company.Address}`, { align: "center" });

  doc
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .text(`GSTIN: ${invoiceData.company.GST}`, { align: "center" });
  doc
    .moveUp(0.5)
    .fontSize(10)
    .font("Helvetica")
    .text(`State: ${invoiceData.company.state}`, { align: "right" });
  doc.moveDown(1);
  yPosition = doc.y;

  doc
    .fillColor("lightblue")
    .rect(0.1 * doc.page.width, yPosition, pageWidth, 25) // (x, y, width, height)
    .fill();

  doc
    .moveDown(0.5)
    .fontSize(14)
    .fillColor("black")
    .text("TAX INVOICE", { align: "center" });

  doc.moveDown(0.5).fillColor("black").fontSize(10);

  doc.moveDown(1);

  yPosition = doc.y;

  doc
    .fontSize(11)
    .text(`Invoice No: ${invoiceData.invoiceNumber}`, 50, yPosition);
  doc.text(
    `Invoice Date: ${format(new Date(invoiceData.invoiceDate), "dd/MM/yyyy")}`,
    50,
    doc.y
  );
  doc.text(
    `Reverse Charge(Y/N): ${invoiceData.reverseCharge === false ? "N" : "Y"}`,
    50,
    doc.y
  );
  doc.y = yPosition;
  doc.text(`Transport Mode: ${invoiceData.transportMode}`, 350, yPosition);
  doc.text(
    `Vehicle Number: ${invoiceData.vehicleNumber.toUpperCase()}`,
    350,
    doc.y
  );
  doc.text(`Place of Supply: ${invoiceData.placeOfSupply}`, 350, doc.y);

  doc.moveDown(1);
  yPosition = doc.y;

  doc.font("Helvetica-Bold").text("Bill to Party", 50, yPosition);
  doc.font("Helvetica").text(`Name: ${invoiceData.client.name}`, 50, doc.y);
  doc
    .text(`Address: ${invoiceData.client.address}`, 50, doc.y, {
      width: 250,
      align: "left",
    })
    .text(`GSTIN No: ${invoiceData.client.GSTIN}`, 50, doc.y)
    .text(`State: ${invoiceData.client.state}`, 50, doc.y);

  if (invoiceData.shipToParty) {
    doc.y = yPosition;
    doc.font("Helvetica-Bold").text("Ship to Party", 350, yPosition);

    doc
      .font("Helvetica")
      .text(`Name: ${invoiceData?.shipToParty.name}`, 350, doc.y);
    doc
      .text(`Address: ${invoiceData.shipToParty.address}`, 350, doc.y, {
        width: 200,
      })
      .text(`GSTIN No: ${invoiceData.shipToParty.GSTIN}`, 350, doc.y)
      .text(`State: ${invoiceData.shipToParty.state}`, 350, doc.y);
  }
  doc.moveDown(2);

  const centerX = pageWidth / 2 + 30;
  doc
    .font("Helvetica-Bold")
    .text("Invoice Items", centerX, doc.y, { underline: true });

  doc.moveDown(1);
  doc.fontSize(10);

  const tableStartY = doc.y;

  const columnPositions = {
    serialNo: 50,
    description: 100,
    hsnCode: 250,
    quantity: 320,
    rate: 400,
    amount: 480,
  };

  doc
    .text("Serial No.", columnPositions.serialNo, tableStartY, {
      width: 40,
      align: "left",
    })
    .text("Product Description", columnPositions.description, tableStartY, {
      width: 140,
      align: "left",
    })
    .text("HSN Code", columnPositions.hsnCode, tableStartY, {
      width: 60,
      align: "center",
    })
    .text("Quantity", columnPositions.quantity, tableStartY, {
      width: 50,
      align: "center",
    })
    .text("Rate", columnPositions.rate, tableStartY, {
      width: 60,
      align: "center",
    })
    .text("Amount", columnPositions.amount, tableStartY, {
      width: 80,
      align: "right",
    });

  doc.moveDown(1);

  doc
    .strokeColor("black")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(560, doc.y)
    .stroke();

  invoiceData.invoiceItems.forEach((item, index) => {
    const rowY = doc.y + 10;

    doc
      .text(`${index + 1}`, columnPositions.serialNo, rowY, {
        width: 40,
        align: "left",
      })
      .text(item.description, columnPositions.description, rowY, {
        width: 140,
        align: "left",
      })
      .text(item.hsnCode, columnPositions.hsnCode, rowY, {
        width: 60,
        align: "center",
      })
      .text(item.quantity.toString(), columnPositions.quantity, rowY, {
        width: 50,
        align: "center",
      })
      .text(item.unitPrice.toFixed(2), columnPositions.rate, rowY, {
        width: 60,
        align: "center",
      })
      .text(item.amount.toFixed(2), columnPositions.amount, rowY, {
        width: 80,
        align: "right",
      });

    doc.moveDown(0.5);
  });

  doc
    .strokeColor("black")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(560, doc.y)
    .stroke();

  doc.moveDown(1);

  yPosition = doc.y;

  doc.font("Helvetica-Bold").text("Total Amount in Words:", 50, yPosition);
  doc.font("Helvetica").text(invoiceData.totalAmountInWords, 50, doc.y);

  const labelX = 400;
  const valueX = 520;

  doc.y = yPosition;

  doc.font("Helvetica").text("Amount:", labelX, yPosition);
  doc
    .font("Helvetica")
    .text(`${invoiceData.amount}`, valueX, yPosition, { align: "right" });

  if (invoiceData.cartage) {
    doc.font("Helvetica").text(`Cartage:`, labelX, yPosition + 10);
    doc
      .font("Helvetica")
      .text(`${invoiceData.cartage}`, valueX, yPosition + 10, {
        align: "right",
      });
  }

  if (invoiceData.cgst) {
    doc
      .font("Helvetica")
      .text("CGST:", labelX, yPosition + 20)
      .text(`${invoiceData.cgst}`, valueX, yPosition + 20, {
        align: "right",
      });
  }

  if (invoiceData.sgst) {
    doc
      .font("Helvetica")
      .text("SGST:", labelX, yPosition + 30)
      .text(`${invoiceData.sgst}`, valueX, yPosition + 30, {
        align: "right",
      });
  }

  if (invoiceData.igst) {
    doc
      .font("Helvetica")
      .text("IGST:", labelX, yPosition + 40)
      .text(`${invoiceData.igst}`, valueX, yPosition + 40, {
        align: "right",
      });
  }

  doc
    .moveTo(labelX, doc.y)
    .lineTo(valueX + 50, doc.y)
    .stroke();
  doc.moveDown(1);

  doc
    .font("Helvetica-Bold")
    .text("Total Amount:", labelX, yPosition + 50)
    .text(`${invoiceData.totalAmount}`, valueX, yPosition + 50, {
      align: "right",
    });

  if (invoiceData.company.companyBankAccountNumber) {
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(11).text("Bank Details", 50, doc.y);
    doc
      .font("Helvetica")
      .text(`Bank Name: ${invoiceData.company.companyBankName}`, 50, doc.y);
    doc.text(
      `Account No: ${invoiceData.company.companyBankAccountNumber}`,
      50,
      doc.y
    );
    doc.text(`IFSC Code: ${invoiceData.company.companyBankIFSC}`, 50, doc.y);
    doc.moveDown(2);
  } else {
    doc.moveDown(5);
  }

  doc.text(`${invoiceData.company.name}`, 400, doc.y, { align: "right" });
  doc.fontSize(10).text("Authorized Signatory", 400, doc.y, { align: "right" });
  doc.end();
};
