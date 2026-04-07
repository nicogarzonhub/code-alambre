import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Search, Eye, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ArchivoReportes = () => {
  const { reportes, setReportes, isAdmin, showToast } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReporte, setSelectedReporte] = useState(null);

  const filteredReportes = reportes.filter(r => 
    r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.cliente?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fecha.includes(searchTerm)
  );

  const handleOpenModal = (reporte) => {
    setSelectedReporte(reporte);
  };

  const handleCloseModal = () => {
    setSelectedReporte(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevents row click
    if (window.confirm('¿Está seguro de eliminar permanentemente este reporte?')) {
      setReportes(reportes.filter(r => r.id !== id));
      showToast('Reporte eliminado del archivo', 'success');
      if (selectedReporte && selectedReporte.id === id) {
        handleCloseModal();
      }
    }
  };

  const exportPDF = () => {
    const element = document.getElementById('report-detail-content');
    if (!element) return;

    html2canvas(element, { 
      scale: 2,
      backgroundColor: '#1A1A1A' // dark theme bg
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedReporte.codigo}.pdf`);
      showToast('Reporte exportado a PDF', 'success');
    });
  };

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '2rem' }}>Archivo de Reportes</h1>
          <p className="form-label" style={{ fontSize: '1rem' }}>Historial y consulta de reportes generados</p>
        </div>
      </header>

      <div className="card mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por código, cliente o fecha..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '350px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReportes.length > 0 ? (
                filteredReportes.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenModal(r)}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.codigo}</td>
                    <td>{r.fecha}</td>
                    <td>{r.cliente?.name || 'Cliente Eliminado'}</td>
                    <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(r.precioFinal)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-between items-center" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon">
                          <Eye size={18} />
                        </button>
                        {isAdmin && (
                          <button className="btn-icon danger" onClick={(e) => handleDelete(e, r.id)}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                    No se encontraron reportes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedReporte} 
        onClose={handleCloseModal} 
        title={`Detalle de Reporte - ${selectedReporte?.codigo}`}
      >
        {selectedReporte && (
          <div>
            <div className="flex justify-end mb-4">
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={exportPDF}
                style={{ fontSize: '0.85rem' }}
              >
                <Download size={16} /> Exportar PDF
              </button>
            </div>
            
            <div id="report-detail-content" style={{ padding: '1.5rem', background: 'var(--bg-darker)', borderRadius: 'var(--radius-lg)' }}>
              {/* Header Branding */}
              <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', letterSpacing: '1px' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '2rem', lineHeight: '1' }}>C</span>ODEALAMBRE
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Convertimos en Arte sus gustos y mucho más</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.25rem' }}>{selectedReporte.codigo}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fecha: {selectedReporte.fecha}</p>
                </div>
              </div>

              {/* Client Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                  <p className="form-label" style={{ marginBottom: '0.2rem' }}>Cliente:</p>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedReporte.cliente?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="form-label" style={{ marginBottom: '0.2rem' }}>Contacto:</p>
                  <p>{selectedReporte.cliente?.location || 'Sin ubicación'}</p>
                  <p>{selectedReporte.cliente?.phone || 'Sin teléfono'}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedReporte.notas && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 215, 0, 0.05)', borderLeft: '3px solid #ffd700', borderRadius: 'var(--radius-sm)' }}>
                  <p className="form-label text-warning" style={{ color: '#ffd700', marginBottom: '0.5rem' }}>Notas del Servicio:</p>
                  <p style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', fontSize: '0.95rem' }}>{selectedReporte.notas}</p>
                </div>
              )}

              {/* Insumos */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Materiales e Insumos</h3>
                <table style={{ background: 'var(--bg-panel)' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem' }}>Ítem</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Cant.</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReporte.insumosUsados?.map((ins, i) => (
                      <tr key={i}>
                        <td style={{ padding: '0.5rem' }}>{ins.label ? `[${ins.label}] ` : ''}{ins.product}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{ins.cantidad}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(ins.precioSubtotal)}</td>
                      </tr>
                    ))}
                    {(!selectedReporte.insumosUsados || selectedReporte.insumosUsados.length === 0) && (
                      <tr><td colSpan={3} style={{ padding: '0.5rem', textAlign: 'center', fontStyle: 'italic' }}>Sin materiales descritos.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px', background: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <span>Mano de Obra:</span>
                    <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(selectedReporte.manoObra)}</span>
                  </div>
                  {selectedReporte.descuento && selectedReporte.descuento.valorCalculado > 0 && (
                    <div className="flex justify-between mb-2" style={{ fontSize: '0.9rem', color: '#ffd700' }}>
                      <span>Descuento:</span>
                      <span>-{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(selectedReporte.descuento.valorCalculado)}</span>
                    </div>
                  )}
                  <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
                  <div className="flex justify-between items-center" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    <span>TOTAL:</span>
                    <span style={{ color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(selectedReporte.precioFinal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button className="btn-secondary" onClick={handleCloseModal}>Cerrar Detalle</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
