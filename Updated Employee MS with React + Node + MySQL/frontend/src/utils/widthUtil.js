export const measureTextWidth = (text, font = "14px Roboto") => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  return context.measureText(text).width;
};

export const getColumnWidths = (data, padding = 35) => {
  const columnWidths = {};
  if (!data || data.length === 0) return columnWidths;

  Object.keys(data[0]).forEach((key) => {
    let maxLength = measureTextWidth(
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
    data.forEach((row) => {
      const text =
        row[key] !== null && row[key] !== undefined ? String(row[key]) : "";
      const length = measureTextWidth(text);
      if (length > maxLength) maxLength = length;
    });
    columnWidths[key] = maxLength + padding;
  });

  return columnWidths;
};
