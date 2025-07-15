import React, { useState } from 'react';
import { generateUniqueId } from '../utils/helpers';

const ClientRoutineList = ({
  client,
  routines = [],
  users = [],
  onSelectRoutine = () => {},
  onAddRoutine = () => {},
  isEditable,
  onDeleteRoutine = () => {},
  onUpdateRoutine = () => {},
}) => {
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineStartDate, setNewRoutineStartDate] = useState('');
  const [newRoutineEndDate, setNewRoutineEndDate] = useState('');
  const [showAddRoutineForm, setShowAddRoutineForm] = useState(false);

  const handleAddRoutine = () => {
    // Solo se puede agregar rutina si hay cliente seleccionado (admin o cliente)
    if (!client) {
      alert('Debes seleccionar un cliente para agregar una rutina.');
      return;
    }
    if (newRoutineName.trim() && newRoutineStartDate && newRoutineEndDate) {
      const newRoutine = {
        client_id: client.client_id,
        name: newRoutineName,
        startDate: newRoutineStartDate,
        endDate: newRoutineEndDate,
      };
      onAddRoutine(newRoutine);
      setNewRoutineName('');
      setNewRoutineStartDate('');
      setNewRoutineEndDate('');
      setShowAddRoutineForm(false);
    } else {
      alert('Por favor, completa todos los campos para la nueva rutina.');
    }
  };

  const calculateWeeks = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  };

  console.log('client:', client);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {/* Si hay cliente seleccionado, muestra su nombre/email. Si no, muestra "Todas las Rutinas" */}
        {client ? `Rutinas de ${client.fullName || client.email}` : 'Todas las Rutinas'}
      </h2>
      {Array.isArray(routines) && routines.length > 0 ? (
        <div className="space-y-4">
          {routines.map((routine) => {
            // Si client es null (admin), busca el cliente correspondiente a la rutina para mostrar su nombre/email.
            const cliente = client
              ? client
              : users?.find(u => u.client_id === routine.client_id);

            return (
              <div key={routine.id || routine.client_id + routine.name} className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-700">{routine.name}</h3>
                  {/* 
                    Si client es null (admin viendo todas las rutinas), muestra el nombre/email del cliente al que pertenece la rutina.
                    Si client está definido, no muestra este dato porque ya está en el encabezado.
                  */}
                  {!client && (
                    <span className="text-sm text-gray-500">
                      {cliente ? cliente.fullName || cliente.email : routine.client_id}
                    </span>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectRoutine(routine)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center"
                      title="Ver Detalles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {isEditable && (
                      <button
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold shadow-md flex items-center justify-center"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165M12 2.25h.007v.008H12V2.25z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Periodo: {routine.startDate} - {routine.endDate}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        // Si no hay rutinas para mostrar, se muestra este mensaje.
        <p className="text-gray-600 text-center py-4">No hay rutinas registradas aún.</p>
      )}

      {/* El formulario para agregar rutina solo aparece si isEditable es true */}
      {isEditable && (
        <div className="mt-6">
          <button
            onClick={() => setShowAddRoutineForm(!showAddRoutineForm)}
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md flex items-center justify-center"
            title={showAddRoutineForm ? 'Cancelar' : 'Agregar Nueva Rutina'}
          >
            {showAddRoutineForm ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </button>

          {showAddRoutineForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Nueva Rutina</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Rutina:</label>
                <input
                  type="text"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                  placeholder="Ej. Rutina de Fuerza - Mes 1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
                <input
                  type="date"
                  value={newRoutineStartDate}
                  onChange={(e) => setNewRoutineStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
                <input
                  type="date"
                  value={newRoutineEndDate}
                  onChange={(e) => setNewRoutineEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
              <button
                onClick={handleAddRoutine}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center"
                title="Crear Rutina"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientRoutineList;