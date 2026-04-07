import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State for Admin
  const [isAdmin, setIsAdmin] = useState(
    sessionStorage.getItem('codealambre_admin') === 'true'
  );

  // Data States (start empty, will be populated by Firestore)
  const [clientes, setClientesState] = useState([]);
  const [insumos, setInsumosState] = useState([]);
  const [reportes, setReportesState] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Refs for tracking local state without infinite loops in snapshots
  const clientesRef = useRef(clientes);
  const insumosRef = useRef(insumos);
  const reportesRef = useRef(reportes);

  useEffect(() => { clientesRef.current = clientes; }, [clientes]);
  useEffect(() => { insumosRef.current = insumos; }, [insumos]);
  useEffect(() => { reportesRef.current = reportes; }, [reportes]);

  // Migrate local storage on first load if Firestore is empty 
  // (We use a one-time timeout to let snapshot fire first)
  useEffect(() => {
    const migrate = async () => {
      const localClientes = JSON.parse(localStorage.getItem('codealambre_clientes') || '[]');
      if (localClientes.length > 0 && clientesRef.current.length === 0) {
        await setDoc(doc(db, 'data', 'clientes'), { items: localClientes }, { merge: true });
        localStorage.removeItem('codealambre_clientes');
      }

      const localInsumos = JSON.parse(localStorage.getItem('codealambre_insumos') || '[]');
      if (localInsumos.length > 0 && insumosRef.current.length === 0) {
        await setDoc(doc(db, 'data', 'insumos'), { items: localInsumos }, { merge: true });
        localStorage.removeItem('codealambre_insumos');
      }

      const localReportes = JSON.parse(localStorage.getItem('codealambre_reportes') || '[]');
      if (localReportes.length > 0 && reportesRef.current.length === 0) {
        await setDoc(doc(db, 'data', 'reportes'), { items: localReportes }, { merge: true });
        localStorage.removeItem('codealambre_reportes');
      }
    };
    setTimeout(migrate, 2000);
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubClientes = onSnapshot(doc(db, 'data', 'clientes'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteItems = docSnap.data().items || [];
        // Only update if data actually changed to prevent infinite loops
        if (JSON.stringify(remoteItems) !== JSON.stringify(clientesRef.current)) {
          setClientesState(remoteItems);
        }
      }
    });

    const unsubInsumos = onSnapshot(doc(db, 'data', 'insumos'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteItems = docSnap.data().items || [];
        if (JSON.stringify(remoteItems) !== JSON.stringify(insumosRef.current)) {
          setInsumosState(remoteItems);
        }
      }
    });

    const unsubReportes = onSnapshot(doc(db, 'data', 'reportes'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteItems = docSnap.data().items || [];
        if (JSON.stringify(remoteItems) !== JSON.stringify(reportesRef.current)) {
          setReportesState(remoteItems);
        }
      }
    });

    return () => {
      unsubClientes();
      unsubInsumos();
      unsubReportes();
    };
  }, []);

  // Wrapper Functions to intercept React Setters and push to Firestore
  const setClientes = async (updater) => {
    const newVal = typeof updater === 'function' ? updater(clientesRef.current) : updater;
    setClientesState(newVal);
    await setDoc(doc(db, 'data', 'clientes'), { items: newVal });
  };

  const setInsumos = async (updater) => {
    const newVal = typeof updater === 'function' ? updater(insumosRef.current) : updater;
    setInsumosState(newVal);
    await setDoc(doc(db, 'data', 'insumos'), { items: newVal });
  };

  const setReportes = async (updater) => {
    const newVal = typeof updater === 'function' ? updater(reportesRef.current) : updater;
    setReportesState(newVal);
    await setDoc(doc(db, 'data', 'reportes'), { items: newVal });
  };

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
