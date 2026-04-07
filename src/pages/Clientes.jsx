import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateId } from '../utils/storage';
import { Modal } from '../components/Modal';
import { Search, Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { readExcelAsJson, findValueByPossibleKeys } from '../utils/excel';

export const Clientes = () => {
  const { clientes, setClientes, isAdmin, showToast } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // Form State
  // Form State
  const [formData, setFormData] = useState({ name: '', city: '', address: '', phone: '' });

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelAsJson(file);
      if (data && data.length > 0) {
        let currentId = generateId(clientes);
        const newClientes = data.map(row => {
          const name = findValueByPossibleKeys(row, ['Nombre', 'Cliente', 'Name', 'Razon Social']);
          const city = findValueByPossibleKeys(row, ['Ciudad', 'Ubicacion', 'Ubicación', 'Location']);
          const address = findValueByPossibleKeys(row, ['Direccion', 'Dirección', 'Address']);
          const phone = findValueByPossibleKeys(row, ['Telefono', 'Teléfono', 'Celular', 'Phone']);
          
          if (!name) return null; // Skip if no name found
          
          return {
            id: currentId++,
            name: name.toString(),
            city: city?.toString() || '',
            address: address?.toString() || '',
            phone: phone.toString()
          };
        }).filter(Boolean);

        if (newClientes.length > 0) {
          setClientes([...clientes, ...newClientes]);
          showToast(`${newClientes.length} clientes importados`, 'success');
        } else {
          showToast('No se encontraron datos válidos (columna Nombre)', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Error al procesar el archivo Excel', 'error');
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredClientes = clientes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({ 
        name: client.name, 
        city: client.city || client.location || '', 
        address: client.address || '',
        phone: client.phone 
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', city: '', address: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('El nombre del cliente es requerido', 'error');
      return;
    }

    if (editingClient) {
      setClientes(clientes.map(c => 
        c.id === editingClient.id ? { ...c, ...formData } : c
      ));
      showToast('Cliente actualizado', 'success');
    } else {
      const newClient = { id: generateId(clientes), ...formData };
      setClientes([...clientes, newClient]);
      showToast('Cliente creado exitosamente', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
      showToast('Cliente eliminado', 'success');
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '2rem' }}>Lista de Clientes</h1>
          <p className="form-label" style={{ fontSize: '1rem' }}>Gestione sus clientes</p>
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
            <Plus size={20} /> Nuevo Cliente
          </button>
        </div>
      </header>

      <div className="card mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Ciudad</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.city || c.location || '-'}</td>
                    <td>{c.address || '-'}</td>
                    <td>{c.phone || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-between items-center" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(c)}>
                          <Edit2 size={18} />
                        </button>
                        {isAdmin && (
                          <button className="btn-icon danger" onClick={() => handleDelete(c.id)}>
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
                    No se encontraron clientes.
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
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Cliente *</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ej: Juan Pérez"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ciudad</label>
            <input 
              type="text" 
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Ej: Bogotá, Centro"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Ej: Calle 123 #45-67"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Teléfono</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Ej: 300 123 4567"
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
