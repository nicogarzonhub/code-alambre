import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateReportCode } from '../utils/storage';
import { Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GenerarReporte = () => {
  const { clientes, insumos, reportes, setReportes, showToast } = useAppContext();
  const navigate = useNavigate();

  // Form State
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [notas, setNotas] = useState('');
  const [manoObra, setManoObra] = useState(0);
  const [descuentoToggle, setDescuentoToggle] = useState(false);
  const [descuentoTipo, setDescuentoTipo] = useState('porcentaje'); // 'porcentaje' or 'fijo'
  const [descuentoValor, setDescuentoValor] = useState(0);

  // Selected Insumos table
  const [reporteInsumos, setReporteInsumos] = useState([]); // { insumoId, cantidad, precioSubtotal }

  const clienteSeleccionado = clientes.find(c => c.id.toString() === selectedClienteId);

  // Calculate totals
  const subtotalInsumos = reporteInsumos.reduce((sum, item) => sum + item.precioSubtotal, 0);
  const subtotal = subtotalInsumos + (parseFloat(manoObra) || 0);
  
  let valorDescuento = 0;
  if (descuentoToggle) {
    const dVal = parseFloat(descuentoValor) || 0;
    if (descuentoTipo === 'porcentaje') {
      valorDescuento = subtotal * (dVal / 100);
    } else {
      valorDescuento = dVal;
    }
  }
  
  const precioFinal = Math.max(0, subtotal - valorDescuento);

  const handleAddInsumo = () => {
    setReporteInsumos([...reporteInsumos, { insumoId: '', cantidad: 1, precioSubtotal: 0 }]);
  };

  const handleRemoveInsumo = (index) => {
    setReporteInsumos(reporteInsumos.filter((_, i) => i !== index));
  };

  const handleInsumoChange = (index, field, value) => {
    const updated = [...reporteInsumos];
    const row = updated[index];
    
    if (field === 'insumoId') {
      row.insumoId = value;
      const insumo = insumos.find(i => i.id.toString() === value);
      if (insumo) {
        row.precioSubtotal = (insumo.price || 0) * (row.cantidad || 1);
      } else {
        row.precioSubtotal = 0;
      }
    } else if (field === 'cantidad') {
      const qty = parseInt(value) || 0;
      row.cantidad = qty;
      const insumo = insumos.find(i => i.id.toString() === row.insumoId);
      if (insumo) {
        row.precioSubtotal = (insumo.price || 0) * qty;
      }
    }
    
    setReporteInsumos(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      showToast('Por favor seleccione un cliente', 'error');
      return;
    }
    if (reporteInsumos.length === 0 && manoObra === 0) {
      showToast('El reporte debe tener insumos o mano de obra', 'error');
      return;
    }

    const reportCode = generateReportCode(reportes);
    
    const newReport = {
      id: Date.now(), // Unique UI ID
      codigo: reportCode,
      fecha,
      cliente: clienteSeleccionado,
      notas,
      insumosUsados: reporteInsumos.map(ri => {
        const ins = insumos.find(i => i.id.toString() === ri.insumoId);
        return {
          ...ins,
          cantidad: ri.cantidad,
          precioSubtotal: ri.precioSubtotal
        };
      }),
      manoObra: parseFloat(manoObra) || 0,
      descuento: descuentoToggle ? { tipo: descuentoTipo, valor: parseFloat(descuentoValor) || 0, valorCalculado: valorDescuento } : null,
      subtotal,
      precioFinal
    };

    setReportes([...reportes, newReport]);
    showToast(`Reporte ${reportCode} guardado exitosamente`, 'success');
    navigate('/archivo');
  };

  return (
    <div className="animate-fade-in pb-10">
      <header className="mb-4">
        <h1 style={{ color: 'var(--text-main)', fontSize: '2rem' }}>Generador de Reportes</h1>
        <p className="form-label" style={{ fontSize: '1rem' }}>Cree un nuevo reporte de servicio o venta</p>
      </header>

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Left Column: Client & Basic Info */}
          <div>
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select 
                value={selectedClienteId} 
                onChange={(e) => setSelectedClienteId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha del Reporte *</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Ubicación</label>
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-darker)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', minHeight: '38px' }}>
                  {clienteSeleccionado?.location || '-'}
                </div>
              </div>
              <div>
                <label className="form-label">Teléfono</label>
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-darker)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', minHeight: '38px' }}>
                  {clienteSeleccionado?.phone || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Notes */}
          <div className="form-group flex" style={{ flexDirection: 'column' }}>
            <label className="form-label text-warning" style={{ color: '#ffd700' }}>Notas Importantes</label>
            <textarea 
              className="notes-textarea"
              style={{ flex: 1, minHeight: '120px', resize: 'vertical' }}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles sobre el diseño, medidas, solicitudes especiales..."
            />
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

        {/* Insumos Table */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ fontSize: '1.2rem' }}>Insumos</h3>
            <button type="button" className="btn-secondary flex items-center gap-2" onClick={handleAddInsumo} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
              <Plus size={16} /> Agregar Insumo
            </button>
          </div>
          
          {reporteInsumos.length > 0 ? (
            <div style={{ overflowX: 'auto', background: 'var(--bg-darker)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th style={{ width: '100px' }}>Cantidad</th>
                    <th style={{ width: '150px' }}>Subtotal</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {reporteInsumos.map((ri, index) => (
                    <tr key={index}>
                      <td>
                        <select 
                          value={ri.insumoId} 
                          onChange={(e) => handleInsumoChange(index, 'insumoId', e.target.value)}
                          required
                          style={{ marginBottom: 0 }}
                        >
                          <option value="">-- Seleccionar --</option>
                          {insumos.map(i => (
                            <option key={i.id} value={i.id}>{i.label ? `[${i.label}] ` : ''}{i.product} - ${i.price}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          value={ri.cantidad} 
                          onChange={(e) => handleInsumoChange(index, 'cantidad', e.target.value)}
                          required
                          style={{ marginBottom: 0 }}
                        />
                      </td>
                      <td>
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(ri.precioSubtotal)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="btn-icon danger" onClick={() => handleRemoveInsumo(index)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No se han agregado insumos.</p>
          )}
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

        {/* Pricing / Final Calculations */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          <div style={{ width: '45%' }}>
            <div className="form-group">
              <label className="form-label">Mano de Obra (COP)</label>
              <input 
                type="number" 
                min="0"
                step="1000"
                value={manoObra}
                onChange={(e) => setManoObra(e.target.value)}
              />
            </div>
            
            <div className="form-group flex items-center gap-2 mt-4" style={{ background: 'var(--bg-darker)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <input 
                type="checkbox" 
                id="applyDiscount"
                checked={descuentoToggle}
                onChange={(e) => setDescuentoToggle(e.target.checked)}
              />
              <label htmlFor="applyDiscount" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Aplicar Descuento</label>
            </div>
            
            {descuentoToggle && (
              <div className="flex gap-2 mt-2">
                <select 
                  value={descuentoTipo} 
                  onChange={(e) => setDescuentoTipo(e.target.value)}
                  style={{ width: '120px' }}
                >
                  <option value="porcentaje">%</option>
                  <option value="fijo">$ Fijo</option>
                </select>
                <input 
                  type="number" 
                  min="0"
                  step={descuentoTipo === 'porcentaje' ? '1' : '1000'}
                  max={descuentoTipo === 'porcentaje' ? '100' : undefined}
                  value={descuentoValor}
                  onChange={(e) => setDescuentoValor(e.target.value)}
                  placeholder={descuentoTipo === 'porcentaje' ? 'Ej: 10' : 'Ej: 5000'}
                />
              </div>
            )}
          </div>

          {/* Totals Box */}
          <div style={{ 
            width: '45%', 
            background: 'rgba(215, 43, 31, 0.05)', 
            border: '1px solid var(--primary)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)', textAlign: 'center' }}>Resumen del Reporte</h3>
            
            <div className="flex justify-between mb-2 text-muted">
              <span>Subtotal Insumos:</span>
              <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalInsumos)}</span>
            </div>
            <div className="flex justify-between mb-2 text-muted">
              <span>Mano de Obra:</span>
              <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(parseFloat(manoObra) || 0)}</span>
            </div>
            
            {descuentoToggle && valorDescuento > 0 && (
              <div className="flex justify-between mb-2 text-warning" style={{ color: '#ffd700' }}>
                <span>Descuento ({descuentoTipo === 'porcentaje' ? `${descuentoValor}%` : 'Fijo'}):</span>
                <span>-{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valorDescuento)}</span>
              </div>
            )}

            <hr style={{ borderColor: 'var(--primary)', margin: '1rem 0', opacity: 0.3 }} />
            
            <div className="flex justify-between items-center" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              <span>Total Final:</span>
              <span style={{ color: 'var(--primary)' }}>
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(precioFinal)}
              </span>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary flex items-center justify-center gap-2 mt-6" 
              style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
            >
              <Save size={20} /> GUARDAR REPORTE
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};
