import * as XLSX from 'xlsx';

/**
 * Parses an Excel file and returns an array of JSON objects based on the first sheet.
 * @param {File} file 
 * @returns {Promise<Array>}
 */
export const readExcelAsJson = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve(rawJson);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Helper to find a value from a row given possible column names (case insensitive)
 */
export const findValueByPossibleKeys = (row, possibleKeys) => {
  const rowKeys = Object.keys(row);
  for (const pKey of possibleKeys) {
    const normalizedTarget = pKey.toLowerCase().trim();
    const match = rowKeys.find(rk => rk.toLowerCase().trim() === normalizedTarget);
    if (match && row[match] !== undefined && row[match] !== null && row[match] !== "") {
      return row[match];
    }
  }
  return "";
};
