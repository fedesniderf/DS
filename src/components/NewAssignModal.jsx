import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const NewAssignModal = ({ onAssign, onClose }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]); // Cambio: renombré de 'users' a 'clients'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Iniciando carga de clientes...');
        
        const { data, error: supabaseError } = await supabase
          .from('usuarios')
          .select('client_id, email, full_name')
          .eq('role', 'client');
        
        console.log('📊 Respuesta de Supabase:', { data, error: supabaseError });
        
        if (supabaseError) {
          throw supabaseError;
        }
        
        // Asegurar que siempre sea un array
        const clientList = data || [];
        setClients(clientList);
        console.log('✅ Clientes establecidos:', clientList);
        console.log('📋 Número de clientes:', clientList.length);
        
      } catch (err) {
        console.error('❌ Error cargando clientes:', err);
        setClients([]); // Fallback a array vacío
        setError('Error al cargar clientes');
      } finally {
        setLoading(false);
      }
    };
    
    loadClients();
  }, []);

  const handleAssign = () => {
    console.log('📋 handleAssign llamado con selectedClient:', selectedClient);
    console.log('📋 Tipo de selectedClient:', typeof selectedClient);
    console.log('📋 onAssign function:', typeof onAssign);
    
    if (selectedClient) {
      console.log('📋 Llamando a onAssign con:', selectedClient);
      onAssign(selectedClient);
      console.log('📋 Cerrando modal...');
      onClose();
    } else {
      console.log('❌ No hay cliente seleccionado');
      alert('Por favor, selecciona un cliente.');
    }
  };

  console.log('Render NewAssignModal - clients:', clients, 'loading:', loading);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Asignar Rutina a Cliente</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Cliente:
          </label>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Cargando clientes...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm py-4">
              {error}
            </div>
          ) : (
            <select
              value={selectedClient}
              onChange={(e) => {
                console.log('🔄 Cliente seleccionado cambiado:', e.target.value);
                setSelectedClient(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              <option value="">-- Selecciona un cliente --</option>
              {clients && clients.length > 0 ? (
                clients.map((client, index) => {
                  // Solo usar client_id
                  const clientId = client?.client_id;
                  const key = clientId || `client-${index}`;
                  const value = clientId || '';
                  const displayName = client?.full_name 
                    ? `${client.full_name} (${client.email})` 
                    : client?.email || 'Cliente sin nombre';
                  
                  console.log('🎯 Cliente mapeado:', { 
                    client, 
                    clientId, 
                    value, 
                    displayName 
                  });
                  
                  return (
                    <option key={key} value={value}>
                      {displayName}
                    </option>
                  );
                })
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
            onClick={handleAssign}
            disabled={loading || !selectedClient}
            className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAssignModal;
