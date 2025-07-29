import React, { useState } from 'react';

const AssignRoutineModal = ({ clients, onAssign, onClose }) => {
  const [selectedClient, setSelectedClient] = useState('');

  const handleAssignClick = () => {
    if (selectedClient) {
      onAssign(selectedClient);
      onClose();
    } else {
      alert('Por favor, selecciona un cliente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Asignar Rutina a Cliente</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Seleccionar Cliente:</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          >
            <option value="">-- Selecciona un cliente --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
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