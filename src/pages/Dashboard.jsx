import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Box, FileText } from 'lucide-react';

export const Dashboard = () => {
  const { clientes, insumos, reportes } = useAppContext();

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '2rem' }}>Dashboard</h1>
        <p className="form-label" style={{ fontSize: '1rem' }}>Resumen de la operación de CODEALAMBRE</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div className="stat-card">
          <Users size={48} color="var(--primary)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
          <div className="stat-value">{clientes.length}</div>
          <div className="stat-label">Total Clientes</div>
        </div>

        <div className="stat-card">
          <Box size={48} color="var(--primary)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
          <div className="stat-value">{insumos.length}</div>
          <div className="stat-label">Total Insumos</div>
        </div>

        <div className="stat-card">
          <FileText size={48} color="var(--primary)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
          <div className="stat-value">{reportes.length}</div>
          <div className="stat-label">Total Reportes</div>
        </div>
      </div>

      <div className="card mt-4" style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Slogan de la Marca</h2>
        <blockquote style={{
          borderLeft: '4px solid var(--primary)',
          paddingLeft: '1rem',
          fontStyle: 'italic',
          color: 'var(--text-muted)'
        }}>
          "Convertimos en Arte sus gustos y mucho más"
        </blockquote>
      </div>
    </div>
  );
};
