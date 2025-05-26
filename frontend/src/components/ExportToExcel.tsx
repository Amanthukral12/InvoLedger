import { saveAs } from "file-saver";
import XLSX from "xlsx";
import { getAutoColumnWidths } from "../utils/getAutoColumnWidths";
const ExportToExcel = ({
  data,
  balance,
  type,
  headers,
  title,
  clientName,
  year,
}: {
  data: Record<string, unknown>[];
  balance?: string;
  type: string;
  clientName?: string;
  headers: string[];
  title?: string;
  year: number;
}) => {
  const handleExport = () => {
    const headerRow = headers;
    const dataRows = data.map((row) => headers.map((key) => row[key]));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worksheetData: any[][] = [];

    if (title) {
      worksheetData.push([title]);
      worksheetData.push([balance]);
    }

    worksheetData.push(headerRow);
    worksheetData.push(...dataRows);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    if (title) {
      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 0, c: headers.length - 1 },
        },
      ];
    }

    worksheet["!cols"] = getAutoColumnWidths(worksheetData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${clientName}-${year}-Ledger.xlsx`);
  };
  return (
    <button
      onClick={handleExport}
      className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer"
    >
      Export to Excel
    </button>
  );
};

export default ExportToExcel;
