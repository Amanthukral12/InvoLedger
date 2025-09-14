import { monthNames } from "../constants/months";
import { TransactionDataGroupedByClient } from "../types/types";

export const generateExcelForTransactions = async (
  transactionsData: TransactionDataGroupedByClient[],
  selectedMonth: number,
  selectedYear: number,
  companyName: string
) => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions Data");

  worksheet.columns = [
    { key: "date", width: 15 },
    { key: "clientName", width: 30 },
    { key: "description", width: 40 },
    { key: "debit", width: 15 },
    { key: "credit", width: 15 },
    { key: "bankName", width: 25 },
  ];

  const firstRow = worksheet.addRow([companyName]);
  firstRow.font = { size: 16, bold: true };
  firstRow.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.mergeCells(`A1:F1`);

  transactionsData.forEach((transaction) => {
    worksheet.addRow([]);

    const clientRow = worksheet.addRow([transaction.clientName]);
    clientRow.font = { bold: true, size: 14 };
    clientRow.alignment = { vertical: "middle", horizontal: "left" };
    worksheet.mergeCells(`A${clientRow.number}:F${clientRow.number}`);

    const headerRow = worksheet.addRow([
      "Date",
      "Client Name",
      "Description",
      "Debit",
      "Credit",
      "Bank Name",
    ]);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };

    transaction.transactions.forEach((tx) => {
      worksheet.addRow([
        new Date(tx.date).toLocaleDateString(),
        transaction.clientName,
        tx.description,
        tx.type === "DEBIT" ? tx.amount : "-",
        tx.type === "CREDIT" ? tx.amount : "-",
        tx.bankName,
      ]);
    });

    const totalRow = worksheet.addRow([
      "",
      "Total",
      "",
      "",
      transaction.total,
      "",
    ]);
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "E2EFDA" },
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${companyName}-${
    monthNames[selectedMonth - 1]
  }-${selectedYear}-transactions-summary.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
