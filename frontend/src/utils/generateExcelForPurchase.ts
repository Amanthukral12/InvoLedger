import { Purchase } from "../types/types";
import { monthNames } from "../constants/months";
export const generateExcelForPurchase = async (
  purchasesData: Purchase[],
  selectedMonth: number,
  selectedYear: number,
  companyName: string
) => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Purchases Data");

  worksheet.columns = [
    { header: "Invoice Number", key: "invoiceNumber", width: 15 },
    { header: "Invoice Date", key: "invoiceDate", width: 20 },
    { header: "Client Name", key: "clientName", width: 40 },
    { header: "Total Amount", key: "totalAmount", width: 15 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Cartage", key: "cartage", width: 10 },
    { header: "TotalGST", key: "totalGST", width: 10 },
    { header: "TotalCGST", key: "totalCGST", width: 10 },
    { header: "TotalSGST", key: "totalSGST", width: 10 },
    { header: "TotalIGST", key: "totalIGST", width: 10 },
    { header: "Item Description", key: "description", width: 25 },
    { header: "Qty", key: "quantity", width: 8 },
    { header: "Unit Price", key: "unitPrice", width: 10 },
    { header: "HSN Code", key: "hsnCode", width: 10 },
    { header: "Item Amount", key: "itemAmount", width: 12 },
    { header: "Item Tax Percent", key: "taxPercent", width: 20 },
    { header: "Item CGST Percent", key: "itemCgstPercent", width: 20 },
    { header: "Item SGST Percent", key: "itemSgstPercent", width: 20 },
    { header: "Item IGST Percent", key: "itemIgstPercent", width: 20 },
    { header: "Item CGST", key: "itemCgst", width: 10 },
    { header: "Item SGST", key: "itemSgst", width: 10 },
    { header: "Item IGST", key: "itemIgst", width: 10 },
  ];

  // Fill data
  purchasesData.forEach((purchase) => {
    purchase.purchaseItems.forEach((item, index) => {
      worksheet.addRow({
        invoiceNumber: index === 0 ? purchase.invoiceNumber : "",
        invoiceDate:
          index === 0
            ? new Date(purchase.invoiceDate).toLocaleDateString()
            : "",
        clientName: index === 0 ? purchase.client.name : "",
        totalAmount: index === 0 ? purchase.totalAmount : "",
        amount: index === 0 ? purchase.amount : "",
        cartage: index === 0 ? purchase.cartage : "",
        totalGST: index === 0 ? purchase.totalGST : "",
        totalCGST: index === 0 ? purchase.totalCGST : "",
        totalSGST: index === 0 ? purchase.totalSGST : "",
        totalIGST: index === 0 ? purchase.totalIGST : "",
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        hsnCode: item.hsnCode,
        itemAmount: item.amount,
        taxPercent: item.taxPercent,
        itemCgstPercent: item.cgstPercent,
        itemSgstPercent: item.sgstPercent,
        itemIgstPercent: item.igstPercent,
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

  const totalAmount = purchasesData.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0
  );

  const totalGST = purchasesData.reduce(
    (sum, inv) => sum + (inv.totalGST ?? 0),
    0
  );

  const totalCGST = purchasesData.reduce(
    (sum, inv) => sum + (inv.totalCGST ?? 0),
    0
  );
  const totalSGST = purchasesData.reduce(
    (sum, inv) => sum + (inv.totalSGST ?? 0),
    0
  );
  const totalIGST = purchasesData.reduce(
    (sum, inv) => sum + (inv.totalIGST ?? 0),
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
    totalCGST: totalCGST,
    totalSGST: totalSGST,
    totalIGST: totalIGST,
    totalGST: totalGST,
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
  a.download = `${companyName}-${
    monthNames[selectedMonth - 1]
  }-${selectedYear}-purchases-summary.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
