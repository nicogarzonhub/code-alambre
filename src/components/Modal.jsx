import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
      }}
      onTransitionEnd={onAnimationEnd}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.2s ease-in-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{title}</h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};
