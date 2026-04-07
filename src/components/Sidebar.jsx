import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Box, FileText, Archive } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Sidebar = () => {
  const location = useLocation();
  const { toggleAdmin, showToast } = useAppContext();
  const [clickCount, setClickCount] = React.useState(0);
  
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 3) {
      setClickCount(0);
      const password = prompt('Admin Access: Enter Password');
      if (password === 'admin123') {
        toggleAdmin(true);
        showToast('Admin access granted', 'success');
      } else if (password !== null) {
        showToast('Incorrect password', 'error');
      }
    }
    
    // reset click count if they stop clicking after 2 seconds
    setTimeout(() => {
      setClickCount((prev) => (prev > 0 ? 0 : prev));
    }, 2000);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Lista de Clientes', path: '/clientes', icon: <Users size={20} /> },
    { name: 'Lista de Insumos', path: '/insumos', icon: <Box size={20} /> },
    { name: 'Generador de Reportes', path: '/generar-reporte', icon: <FileText size={20} /> },
    { name: 'Archivo de Reportes', path: '/archivo', icon: <Archive size={20} /> }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-dark)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed'
    }}>
      <div 
        onClick={handleLogoClick}
        style={{
          padding: '2rem 1.5rem',
          cursor: 'pointer',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-color)',
          userSelect: 'none'
        }}
      >
        <h1 style={{ 
          margin: 0, 
          color: 'var(--text-main)', 
          fontSize: '1.5rem',
          letterSpacing: '1px'
        }}>
          <span style={{ color: 'var(--primary)', fontSize: '2.5rem', lineHeight: '1', display: 'block', marginBottom: '-5px' }}>C</span>
          ODEALAMBRE
        </h1>
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.65rem',
          marginTop: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Convertimos en Arte sus gustos<br/>y mucho más
        </p>
      </div>
      
      <nav style={{ flex: 1, padding: '1.5rem 0' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'rgba(215, 43, 31, 0.05)' : 'transparent',
                    borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    fontWeight: isActive ? 600 : 400
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} CODEALAMBRE</p>
      </div>
    </aside>
  );
};
