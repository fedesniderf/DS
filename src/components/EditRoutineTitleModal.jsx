import React, { useState, useEffect } from 'react';

const EditRoutineTitleModal = ({ currentTitle, onSave, onClose }) => {
  const [newTitle, setNewTitle] = useState(currentTitle);

  useEffect(() => {
    setNewTitle(currentTitle);
  }, [currentTitle]);

  const handleSaveClick = () => {
    if (newTitle.trim()) {
      onSave(newTitle.trim());
    } else {
      alert('El título no puede estar vacío.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Título de Rutina</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nuevo Título:</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ingresa el nuevo título"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            className="px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoutineTitleModal;