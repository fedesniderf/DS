import React from 'react';

const AdminHomeScreen = ({ onNavigateClientes, onNavigateTemplates }) => {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 pt-20">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-8 items-center max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Panel de Administrador</h1>
        <div className="flex flex-col gap-6 w-full">
          <button
            className="w-full py-4 bg-slate-800 text-white rounded-xl text-xl font-semibold shadow-md hover:bg-slate-900 transition-colors transform hover:scale-105 duration-200"
            onClick={onNavigateClientes}
          >
            Clientes
          </button>
          <button
            className="w-full py-4 bg-green-600 text-white rounded-xl text-xl font-semibold shadow-md hover:bg-green-700 transition-colors transform hover:scale-105 duration-200"
            onClick={onNavigateTemplates}
          >
            Templates de rutinas
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeScreen;
