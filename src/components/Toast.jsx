import React from 'react';
import { useAppContext } from '../context/AppContext';
import { XCircle, CheckCircle, AlertCircle } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useAppContext();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 9999
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{
          backgroundColor: 'var(--bg-panel)',
          color: 'var(--text-main)',
          borderLeft: `4px solid ${
            toast.type === 'success' ? 'var(--success)' : 
            toast.type === 'danger' ? 'var(--danger)' : 'var(--primary)'
          }`,
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'slideInUp 0.3s ease-out'
        }}>
          {toast.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
          {toast.type === 'error' && <XCircle size={20} color="var(--danger)" />}
          {toast.type === 'info' && <AlertCircle size={20} color="var(--primary)" />}
          <span style={{ fontWeight: 500 }}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
