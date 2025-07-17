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

  // Estado para edición de usuario (debe estar antes del return)
  const [showEditUser, setShowEditUser] = useState(false);
  const [editFullName, setEditFullName] = useState(client?.fullName || client?.name || '');
  const [editEmail, setEditEmail] = useState(client?.email || '');
  const [editPhone, setEditPhone] = useState(client?.phone || '');
  const [editAge, setEditAge] = useState(client?.age || '');
  const [editGender, setEditGender] = useState(client?.gender || '');
  const [editWeight, setEditWeight] = useState(client?.weight || '');
  const [editHeight, setEditHeight] = useState(client?.height || '');

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
      {/* Sección principal con datos del usuario y botón editar */}
      {client && (
        <div className="mb-8 p-4 rounded-xl bg-gray-100 border border-gray-200 relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">{client.fullName || client.name || client.email}</h2>
            <button
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
              title="Editar usuario"
              onClick={() => setShowEditUser(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 17H9v-3z" />
              </svg>
            </button>
          </div>
          <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Email:</span> {client.email}</div>
          {client.phone && <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Teléfono:</span> {client.phone}</div>}
          {client.age && <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Edad:</span> {client.age}</div>}
          {client.gender && <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Género:</span> {client.gender}</div>}
          {client.weight && <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Peso:</span> {client.weight} kg</div>}
          {client.height && <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Altura:</span> {client.height} cm</div>}

          {/* Formulario de edición modal */}
          {showEditUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <form
                className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border"
                onSubmit={async (e) => {
                  e.preventDefault();
                  // Actualizar datos en Supabase
                  try {
                    const { error } = await import('../supabaseClient').then(({ supabase }) =>
                      supabase
                        .from('usuarios')
                        .update({
                          fullName: editFullName,
                          email: editEmail,
                          phone: editPhone,
                          age: editAge,
                          weight: editWeight,
                          height: editHeight,
                        })
                        .eq('client_id', client.client_id)
                    );
                    if (error) {
                      alert('Error actualizando usuario: ' + error.message);
                    } else {
                      alert('Datos actualizados correctamente.');
                      setShowEditUser(false);
                      // Opcional: recargar datos del usuario
                    }
                  } catch (err) {
                    alert('Error inesperado: ' + err.message);
                  }
                }}
              >
                <h3 className="text-lg font-bold mb-4">Editar usuario</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" className="w-full px-3 py-2 border rounded" value={editFullName} onChange={e => setEditFullName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border rounded" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" className="w-full px-3 py-2 border rounded" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                  <input type="number" className="w-full px-3 py-2 border rounded" value={editAge} onChange={e => setEditAge(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input type="number" className="w-full px-3 py-2 border rounded" value={editWeight} onChange={e => setEditWeight(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                  <input type="number" className="w-full px-3 py-2 border rounded" value={editHeight} onChange={e => setEditHeight(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setShowEditUser(false)}>Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold">Guardar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      {/* Eliminado el título de rutinas, solo se muestra el nombre en la sección principal */}
      {Array.isArray(routines) && routines.length > 0 ? (
        <div className="space-y-4">
          {routines.map((routine) => {
            // Si client es null (admin), busca el cliente correspondiente a la rutina para mostrar su nombre/email.
            const cliente = client
              ? client
              : users?.find(u => u.client_id === routine.client_id);

            return (
              <div key={routine.id || `${routine.client_id}-${routine.name}-${routine.startDate}`} className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
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
                      onClick={() => {
                        console.log('ClientRoutineList - routine seleccionada:', routine);
                        console.log('ClientRoutineList - routine.id:', routine.id);
                        onSelectRoutine(routine);
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center"
                      title="Ver Detalles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {/* Botón para eliminar rutina, solo para admin */}
                    {isEditable && (
                      <button
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
                            onDeleteRoutine(routine);
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold shadow-md flex items-center justify-center"
                        title="Eliminar Rutina"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L5.072 5.455m11.35.01L12 2.25 7.672 5.455m11.35.01C18.723 5.67 16.16 6.228 12 6.228s-6.723-.558-7.672-.772M9 12h6" />
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