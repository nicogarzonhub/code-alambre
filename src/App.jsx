import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import { Layout } from './components/Layout';

// Placeholder imports for pages
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Insumos } from './pages/Insumos';
import { GenerarReporte } from './pages/GenerarReporte';
import { ArchivoReportes } from './pages/ArchivoReportes';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/generar-reporte" element={<GenerarReporte />} />
            <Route path="/archivo" element={<ArchivoReportes />} />
          </Routes>
        </Layout>
        <ToastContainer />
      </Router>
    </AppProvider>
  );
}

export default App;
