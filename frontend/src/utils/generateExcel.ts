import ExcelJS from "exceljs";
import { Invoice } from "../types/types";
export const generateExcel = async (invoicesData: Invoice[]) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Invoices Data");

  worksheet.columns = [
    { header: "Invoice Number", key: "invoiceNumber", width: 15 },
    { header: "Invoice Date", key: "invoiceDate", width: 20 },
    { header: "Client Name", key: "clientName", width: 40 },
    { header: "Total Amount", key: "totalAmount", width: 15 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Cartage", key: "cartage", width: 10 },
    { header: "TotalCGST", key: "totalCgst", width: 10 },
    { header: "TotalSGST", key: "totalSgst", width: 10 },
    { header: "TotalIGST", key: "totalIgst", width: 10 },
    { header: "Item Description", key: "description", width: 25 },
    { header: "Qty", key: "quantity", width: 8 },
    { header: "Unit Price", key: "unitPrice", width: 10 },
    { header: "HSN Code", key: "hsnCode", width: 10 },
    { header: "Item Amount", key: "itemAmount", width: 12 },
    { header: "Item CGST", key: "itemCgst", width: 10 },
    { header: "Item SGST", key: "itemSgst", width: 10 },
    { header: "Item IGST", key: "itemIgst", width: 10 },
  ];

  // Fill data
  invoicesData.forEach((invoice) => {
    invoice.invoiceItems.forEach((item) => {
      worksheet.addRow({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString(),
        clientName: invoice.client.name,
        totalAmount: invoice.totalAmount,
        amount: invoice.amount,
        cartage: invoice.cartage,
        totalCgst: invoice.totalCgst,
        totalSgst: invoice.totalSgst,
        totalIgst: invoice.totalIgst,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        hsnCode: item.hsnCode,
        itemAmount: item.amount,
        itemCgst: item.cgst,
        itemSgst: item.sgst,
        itemIgst: item.igst,
      });
    });
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4472C4" },
  };
  headerRow.alignment = { horizontal: "center" };

  const totalAmount = invoicesData.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0
  );
  const totalCgst = invoicesData.reduce(
    (sum, inv) => sum + (inv.totalCgst ?? 0),
    0
  );
  const totalSgst = invoicesData.reduce(
    (sum, inv) => sum + (inv.totalSgst ?? 0),
    0
  );
  const totalIgst = invoicesData.reduce(
    (sum, inv) => sum + (inv.totalIgst ?? 0),
    0
  );

  worksheet.addRow({});
  const summaryRow = worksheet.addRow({
    invoiceNumber: "",
    invoiceDate: "",
    clientName: "TOTAL",
    description: "",
    hsnCode: "",
    quantity: "",
    unitPrice: "",
    amount: "",
    totalCgst: totalCgst,
    totalSgst: totalSgst,
    totalIgst: totalIgst,
    totalAmount: totalAmount,
  });

  // Style summary row
  summaryRow.font = { bold: true };
  summaryRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "E2EFDA" },
  };

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoices-summary.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
