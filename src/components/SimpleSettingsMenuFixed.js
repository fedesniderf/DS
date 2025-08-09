import React, { useState } from 'react';

const SimpleSettingsMenuFixed = ({ onLogout, currentUser, isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  
  console.log('SimpleSettingsMenuFixed rendered', { isOpen, currentUser });
  
  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
      <h2 className="text-lg font-semibold mb-4">Configuración (Test)</h2>
      <div className="space-y-2">
        <button
          onClick={() => setShowModal(true)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
        >
          🔑 Test Modal
        </button>

        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-red-600"
        >
          🚪 Cerrar Sesión
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Test Modal</h3>
            <p>Modal de prueba funcionando</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSettingsMenuFixed;
