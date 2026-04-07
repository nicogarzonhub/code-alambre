import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  storageKeyClientes,
  storageKeyInsumos,
  storageKeyReportes,
  getStorageData,
  setStorageData
} from '../utils/storage';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State for Admin
  const [isAdmin, setIsAdmin] = useState(
    sessionStorage.getItem('codealambre_admin') === 'true'
  );

  // Data States
  const [clientes, setClientes] = useState(getStorageData(storageKeyClientes));
  const [insumos, setInsumos] = useState(getStorageData(storageKeyInsumos));
  const [reportes, setReportes] = useState(getStorageData(storageKeyReportes));

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Admin toggling
  const toggleAdmin = (status) => {
    setIsAdmin(status);
    sessionStorage.setItem('codealambre_admin', status);
  };

  // Toast functions
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Sync data to localStorage on change
  useEffect(() => {
    setStorageData(storageKeyClientes, clientes);
  }, [clientes]);

  useEffect(() => {
    setStorageData(storageKeyInsumos, insumos);
  }, [insumos]);

  useEffect(() => {
    setStorageData(storageKeyReportes, reportes);
  }, [reportes]);

  const value = {
    isAdmin,
    toggleAdmin,
    clientes,
    setClientes,
    insumos,
    setInsumos,
    reportes,
    setReportes,
    toasts,
    showToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
