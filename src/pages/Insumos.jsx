import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateId } from '../utils/storage';
import { Modal } from '../components/Modal';
import { Search, Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { readExcelAsJson, findValueByPossibleKeys } from '../utils/excel';

export const Insumos = () => {
  const { insumos, setInsumos, isAdmin, showToast } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ label: '', product: '', price: '' });

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelAsJson(file);
      if (data && data.length > 0) {
        let currentId = generateId(insumos);
        const newInsumos = data.map(row => {
          const label = findValueByPossibleKeys(row, ['Etiqueta', 'Categoria', 'Tipo', 'Tag', 'Label', 'Grupo']);
          const product = findValueByPossibleKeys(row, ['Producto', 'Nombre', 'Insumo', 'Material', 'Product', 'Descripcion']);
          const priceRaw = findValueByPossibleKeys(row, ['Precio', 'Valor', 'Costo', 'Price']);
          
          if (!product) return null; // Skip if no product name found
          
          let cleanPrice = 0;
          if (typeof priceRaw === 'number') {
            cleanPrice = priceRaw;
          } else if (typeof priceRaw === 'string') {
            const numStr = priceRaw.replace(/[^\d.-]/g, '');
            cleanPrice = parseFloat(numStr) || 0;
          }
          
          return {
            id: currentId++,
            label: label.toString(),
            product: product.toString(),
            price: cleanPrice
          };
        }).filter(Boolean);

        if (newInsumos.length > 0) {
          setInsumos([...insumos, ...newInsumos]);
          showToast(`${newInsumos.length} insumos importados`, 'success');
        } else {
          showToast('No se encontraron datos válidos (columna Producto)', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Error al procesar el archivo Excel', 'error');
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredInsumos = insumos.filter(i => 
    i.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (insumo = null) => {
    if (insumo) {
      setEditingInsumo(insumo);
      setFormData({ label: insumo.label, product: insumo.product, price: insumo.price });
    } else {
      setEditingInsumo(null);
      setFormData({ label: '', product: '', price: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInsumo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.product.trim()) {
      showToast('El nombre del producto es requerido', 'error');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;

    const dataToSave = {
      ...formData,
      price: priceNum
    };

    if (editingInsumo) {
      setInsumos(insumos.map(i => 
        i.id === editingInsumo.id ? { ...i, ...dataToSave } : i
      ));
      showToast('Insumo actualizado', 'success');
    } else {
      const newInsumo = { id: generateId(insumos), ...dataToSave };
      setInsumos([...insumos, newInsumo]);
      showToast('Insumo creado exitosamente', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este insumo?')) {
      setInsumos(insumos.filter(i => i.id !== id));
      showToast('Insumo eliminado', 'success');
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '2rem' }}>Lista de Insumos</h1>
          <p className="form-label" style={{ fontSize: '1rem' }}>Inventario de materiales y productos</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button className="btn-secondary flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload size={20} /> Importar Excel
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} /> Nuevo Insumo
          </button>
        </div>
      </header>

      <div className="card mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por etiqueta o producto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Etiqueta</th>
                <th>Producto</th>
                <th>Precio</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInsumos.length > 0 ? (
                filteredInsumos.map(i => (
                  <tr key={i.id}>
                    <td>
                      <span style={{ 
                        background: 'rgba(215, 43, 31, 0.1)', 
                        color: 'var(--primary)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {i.label || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{i.product}</td>
                    <td>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(i.price)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-between items-center" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(i)}>
                          <Edit2 size={18} />
                        </button>
                        {isAdmin && (
                          <button className="btn-icon danger" onClick={() => handleDelete(i.id)}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted" style={{ padding: '2rem' }}>
                    No se encontraron insumos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Etiqueta (Opcional)</label>
            <input 
              type="text" 
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              placeholder="Ej: Alambre, Base, Herramienta"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre del Producto *</label>
            <input 
              type="text" 
              required
              value={formData.product}
              onChange={(e) => setFormData({...formData, product: e.target.value})}
              placeholder="Ej: Alambre de Cobre 1mm"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Precio</label>
            <input 
              type="number" 
              min="0"
              step="50"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="Ej: 15000"
            />
          </div>
          <div className="flex justify-between" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
