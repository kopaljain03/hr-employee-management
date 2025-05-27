// src/utils/exportUtils.js
import * as XLSX from "xlsx";

const getCurrentDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Converts JSON data to an Excel file and downloads it.
 * @param {Array} data - The JSON data to export.
 * @param {string} filenamePrefix - The base name for the file.
 */
export const downloadExcel = (data, filenamePrefix) => {
  if (!data || !data.length) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const filename = `${filenamePrefix}_${getCurrentDate()}.xlsx`;
  XLSX.writeFile(workbook, filename);
};
