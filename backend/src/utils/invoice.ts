import PDFDocument from "pdfkit";
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

  doc.moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(
      `${invoiceData.company.Address}`,
      (doc.page.width - 250) / 2,
      undefined,
      {
        width: 250,
        align: "center",
      }
    );

  doc.x = 30;

  doc
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .text(`GSTIN: ${invoiceData.company.GST}`, {
      align: "center",
      indent: 0,
    });
  doc
    .moveUp(0.5)
    .fontSize(10)
    .font("Helvetica")
    .text(`State: ${invoiceData.company.state}`, { align: "right" });
  doc.moveDown(1);
  yPosition = doc.y;

  doc
    .fillColor("lightblue")
    .rect(0.1 * doc.page.width, yPosition, pageWidth, 25)
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
  if (invoiceData.transportMode) {
    doc.text(`Transport Mode: ${invoiceData.transportMode}`, 350, yPosition);
  }
  if (invoiceData.vehicleNumber) {
    doc.text(
      `Vehicle Number: ${invoiceData.vehicleNumber.toUpperCase()}`,
      350,
      doc.y
    );
  }
  doc.text(`Place of Supply: ${invoiceData.placeOfSupply}`, 350, doc.y);
  doc.text(
    `E-way Bill Number: ${invoiceData.ewayBillNumber !== null ? invoiceData.ewayBillNumber : ""}`,
    350,
    doc.y
  );

  if (invoiceData.transportMode && invoiceData.vehicleNumber) {
    doc.moveDown(1);
  } else {
    doc.moveDown(3);
  }

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

  const centerX = (pageWidth + 30) / 2;
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Invoice Items", centerX, doc.y, { underline: true });

  doc.moveDown(1);
  doc.fontSize(10);

  const tableStartY = doc.y;

  const columnPositions = {
    serialNo: 50,
    description: 100,
    hsnCode: 220,
    quantity: 260,
    rate: 310,
    amount: 340,
    sgst: 410,
    cgst: 460,
    igst: 510,
  };

  doc
    .text("Serial No.", columnPositions.serialNo, tableStartY, {
      width: 50,
      align: "left",
    })
    .text("Product Description", columnPositions.description, tableStartY, {
      width: 120,
      align: "left",
    })
    .text("HSN Code", columnPositions.hsnCode, tableStartY, {
      width: 40,
      align: "center",
    })
    .text("Quantity", columnPositions.quantity, tableStartY, {
      width: 50,
      align: "center",
    })
    .text("Rate", columnPositions.rate, tableStartY, {
      width: 30,
      align: "center",
    })
    .text("Amount", columnPositions.amount, tableStartY, {
      width: 70,
      align: "center",
    })
    .text("SGST", columnPositions.sgst, tableStartY, {
      width: 50,
      align: "center",
    })
    .text("CGST", columnPositions.cgst, tableStartY, {
      width: 50,
      align: "center",
    })
    .text("IGST", columnPositions.igst, tableStartY, {
      width: 50,
      align: "center",
    });

  doc.moveDown(1.5);

  doc
    .strokeColor("black")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(570, doc.y)
    .stroke();

  invoiceData.invoiceItems.forEach((item, index) => {
    const rowY = doc.y + 10;

    doc
      .font("Helvetica")
      .text(`${index + 1}`, columnPositions.serialNo, rowY, {
        width: 50,
        align: "left",
      })
      .text(item.description, columnPositions.description, rowY, {
        width: 120,
        align: "left",
      })
      .text(item.hsnCode, columnPositions.hsnCode, rowY, {
        width: 40,
        align: "center",
      })
      .text(item.quantity.toString(), columnPositions.quantity, rowY, {
        width: 50,
        align: "center",
      })
      .text(item.unitPrice.toFixed(2), columnPositions.rate, rowY, {
        width: 30,
        align: "center",
      })
      .text(item.amount.toFixed(2), columnPositions.amount, rowY, {
        width: 70,
        align: "center",
      })
      .text(
        item.sgst ? item.sgst.toFixed(2).toString() : "0",
        columnPositions.sgst,
        rowY,
        {
          width: 50,
          align: "center",
        }
      )
      .text(
        item.sgstPercent !== null ? `(${item.sgstPercent.toString()}%)` : "(0)",
        columnPositions.sgst,
        rowY + 15,
        {
          width: 50,
          align: "center",
        }
      )
      .text(
        item.cgst ? item.cgst.toFixed(2).toString() : "0",
        columnPositions.cgst,
        rowY,
        {
          width: 50,
          align: "center",
        }
      )
      .text(
        item.cgstPercent !== null ? `(${item.cgstPercent.toString()}%)` : "(0)",
        columnPositions.cgst,
        rowY + 15,
        {
          width: 50,
          align: "center",
        }
      )
      .text(
        item.igst ? item.igst.toFixed(2).toString() : "0",
        columnPositions.igst,
        rowY,
        {
          width: 50,
          align: "center",
        }
      )
      .text(
        item.igstPercent !== null ? `(${item.igstPercent.toString()}%)` : "(0)",
        columnPositions.igst,
        rowY + 15,
        {
          width: 50,
          align: "center",
        }
      );
  });
  doc.moveDown(0.5);
  doc
    .strokeColor("black")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(570, doc.y)
    .stroke();

  doc.moveDown(2);

  yPosition = doc.y;

  doc.font("Helvetica-Bold").text("Total Amount in Words:", 50, yPosition);
  doc
    .font("Helvetica")
    .text(invoiceData.totalAmountInWords, 50, doc.y, { width: 250 });

  const labelX = 400;
  const valueX = 520;

  doc.y = yPosition;

  doc.font("Helvetica").text("Amount:", labelX, yPosition);
  doc
    .font("Helvetica")
    .text(`${invoiceData.amount}`, valueX, yPosition, { align: "right" });

  doc.font("Helvetica").text(`Cartage:`, labelX, yPosition + 20);
  doc.font("Helvetica").text(`${invoiceData.cartage}`, valueX, yPosition + 20, {
    align: "right",
  });

  doc.font("Helvetica").text(`Total CGST:`, labelX, yPosition + 40);
  doc.text(`${invoiceData.totalCgst}`, valueX, yPosition + 40, {
    align: "right",
  });

  doc.font("Helvetica").text(`Total SGST:`, labelX, yPosition + 60);
  doc.text(`${invoiceData.totalSgst}`, valueX, yPosition + 60, {
    align: "right",
  });

  doc.font("Helvetica").text(`Total IGST:`, labelX, yPosition + 80);
  doc.text(`${invoiceData.totalIgst}`, valueX, yPosition + 80, {
    align: "right",
  });

  doc
    .moveTo(labelX, doc.y)
    .lineTo(valueX + 50, doc.y)
    .stroke();
  doc.moveDown(1);

  doc
    .font("Helvetica-Bold")
    .text("Total Amount:", labelX, yPosition + 100)
    .text(`${invoiceData.totalAmount}`, valueX, yPosition + 100, {
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

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`${invoiceData.company.name}`, 400, doc.y, { align: "right" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Authorized Signatory", 400, doc.y + 50, { align: "right" });
  doc.end();
};
