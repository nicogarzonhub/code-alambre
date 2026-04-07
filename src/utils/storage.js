// localStorage wrapper utilities

export const storageKeyClientes = "codealambre_clientes";
export const storageKeyInsumos = "codealambre_insumos";
export const storageKeyReportes = "codealambre_reportes";

// Generates an auto-incrementing ID for a given array of items
export const generateId = (items) => {
  if (!items || items.length === 0) return 1;
  const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
  return maxId + 1;
};

// Generates an auto-generated Report Code (e.g., REP-0001)
export const generateReportCode = (reports) => {
  const id = generateId(reports);
  return `REP-${id.toString().padStart(4, "0")}`;
};

export const getStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return [];
  }
};

export const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};
