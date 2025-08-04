import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AssignRoutineModal = ({ onAssign, onClose }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [users, setUsers] = useState([]); // Inicializar como array vacío
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  // Cargar usuarios desde Supabase cuando se abre el modal
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError('');
        
        const { data, error } = await supabase
          .from('usuarios')
          .select('client_id, email, full_name')
          .eq('role', 'client'); // Solo clientes
        
        if (error) {
          throw error;
        }
        
        const validUsers = data && Array.isArray(data) ? data : [];
        setUsers(validUsers);
        console.log('Usuarios cargados en modal:', validUsers);
        console.log('Array.isArray(data):', Array.isArray(data));
        console.log('typeof data:', typeof data);
        console.log('data:', data);
        
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        setUsers([]); // Asegurar que siempre sea un array
        setUsersError('No se pudo cargar la lista de usuarios');
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleAssignClick = () => {
    if (selectedClient) {
      onAssign(selectedClient);
      onClose();
    } else {
      alert('Por favor, selecciona un cliente.');
    }
  };

  // Debug: log de render
  console.log('Renderizando AssignRoutineModal');
  console.log('users state:', users);
  console.log('usersLoading:', usersLoading);
  console.log('usersError:', usersError);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Asignar Rutina a Cliente</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Seleccionar Cliente:</label>
          {usersLoading ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : usersError ? (
            <p className="text-red-600 text-sm">{usersError}</p>
          ) : (
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="">-- Selecciona un cliente --</option>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user, index) => (
                  <option key={user?.client_id || index} value={user?.client_id || ''}>
                    {user?.full_name ? `${user.full_name} (${user.email})` : user?.email || 'Usuario sin datos'}
                  </option>
                ))
              ) : (
                <option disabled>No hay clientes disponibles</option>
              )}
            </select>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssignClick}
            className="px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignRoutineModal;