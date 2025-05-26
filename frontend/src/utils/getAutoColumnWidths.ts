// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAutoColumnWidths = (rows: any[][]) => {
  const colWidths: number[] = [];

  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const cellText = cell ? cell.toString() : "";
      const currentLength = cellText.length;

      if (!colWidths[i] || currentLength > colWidths[i]) {
        colWidths[i] = currentLength;
      }
    });
  });

  return colWidths.map((w) => ({ wch: w + 2 }));
};
