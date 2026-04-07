import React from 'react';
import { Sidebar } from './Sidebar';

export const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-darker)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '260px', // width of sidebar
        padding: '2rem 3rem',
        overflowY: 'auto',
        height: '100vh'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
