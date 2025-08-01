import React, { useState, useEffect } from 'react';
import { generateUniqueId } from '../utils/helpers';

const ClientRoutineList = ({
  client,
  routines = [],
  users = [],
  onSelectRoutine = () => {},
  onAddRoutine = () => {},
  isEditable,
  onDeleteRoutine,
  onUpdateRoutine = () => {},
}) => {
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineStartDate, setNewRoutineStartDate] = useState('');
  const [newRoutineEndDate, setNewRoutineEndDate] = useState('');
  const [showAddRoutineForm, setShowAddRoutineForm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Estado para edición de usuario (debe estar antes del return)
  const [showEditUser, setShowEditUser] = useState(false);
  const [editFullName, setEditFullName] = useState(client?.full_name || client?.fullName || client?.name || '');
  const [editEmail, setEditEmail] = useState(client?.email || '');
  const [editPhone, setEditPhone] = useState(client?.phone || '');
  const [editAge, setEditAge] = useState(client?.age || '');
  const [editGender, setEditGender] = useState(client?.gender || '');
  const [editWeight, setEditWeight] = useState(client?.weight || '');
  const [editHeight, setEditHeight] = useState(client?.height || '');
  
  // Estados para el proceso de edición de usuario
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Simular carga inicial
  useEffect(() => {
    setInitialLoading(true);
    setTimeout(() => setInitialLoading(false), 300);
  }, [routines]);

  // Función para manejar la actualización del usuario
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (isUpdatingUser) return; // Prevenir múltiples envíos
    
    setIsUpdatingUser(true);
    setUpdateMessage('');
    setUpdateSuccess(false);
    
    try {
      const { supabase } = await import('../supabaseClient');
      const { error } = await supabase
        .from('usuarios')
        .update({
          full_name: editFullName,
          email: editEmail,
          phone: editPhone,
          age: editAge,
          gender: editGender,
          weight: editWeight,
          height: editHeight,
        })
        .eq('client_id', client.client_id);
        
      if (error) {
        setUpdateMessage('Error al actualizar usuario: ' + error.message);
        setUpdateSuccess(false);
      } else {
        setUpdateSuccess(true);
        setUpdateMessage(`¡Datos de ${editFullName} actualizados correctamente!`);
        
        // Actualizar el objeto client local para reflejar los cambios inmediatamente
        if (client) {
          client.full_name = editFullName;  // Este es el campo real de la BD
          client.fullName = editFullName;   // Para compatibilidad
          client.name = editFullName;       // Para compatibilidad
          client.email = editEmail;
          client.phone = editPhone;
          client.age = editAge;
          client.gender = editGender;
          client.weight = editWeight;
          client.height = editHeight;
        }
      }
    } catch (err) {
      setUpdateMessage('Error inesperado: ' + err.message);
      setUpdateSuccess(false);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Función para cerrar el modal de edición y resetear estados
  const handleCloseEditModal = () => {
    setShowEditUser(false);
    setUpdateSuccess(false);
    setUpdateMessage('');
    setIsUpdatingUser(false);
    // Resetear campos a los valores originales del cliente
    setEditFullName(client?.full_name || client?.fullName || client?.name || '');
    setEditEmail(client?.email || '');
    setEditPhone(client?.phone || '');
    setEditAge(client?.age || '');
    setEditGender(client?.gender || '');
    setEditWeight(client?.weight || '');
    setEditHeight(client?.height || '');
  };

  const handleAddRoutine = async () => {
    // Solo se puede agregar rutina si hay cliente seleccionado (admin o cliente)
    if (!client) {
      alert('Debes seleccionar un cliente para agregar una rutina.');
      return;
    }
    if (newRoutineName.trim() && newRoutineStartDate && newRoutineEndDate) {
      // Fallback para client_id
      const clientId = client.client_id || client.id;
      if (!clientId) {
        alert('No se encontró el ID del cliente.');
        return;
      }
      setLoading(true);
      const newRoutine = {
        client_id: clientId,
        name: newRoutineName,
        startDate: newRoutineStartDate,
        endDate: newRoutineEndDate,
      };
      await onAddRoutine(newRoutine);
      setLoading(false);
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
      {/* Indicador de carga para operaciones */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Procesando...</p>
          </div>
        </div>
      )}

      {/* Sección principal con datos del usuario y botón editar */}
      {client && (
        <div className="mb-8 p-4 rounded-xl bg-gray-100 border border-gray-200 relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">{client.full_name || client.fullName || client.name || client.email}</h2>
            <button
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50"
              title="Editar usuario"
              onClick={() => setShowEditUser(true)}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border">
                <h3 className="text-lg font-bold mb-4">Editar usuario</h3>
                
                {/* Mostrar mensaje de éxito con icono si la actualización fue exitosa */}
                {updateSuccess ? (
                  <div className="text-center py-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-600 font-semibold mb-4">{updateMessage}</p>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                      onClick={handleCloseEditModal}
                    >
                      Aceptar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateUser}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={editFullName} 
                        onChange={e => setEditFullName(e.target.value)}
                        disabled={isUpdatingUser}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={editEmail} 
                        onChange={e => setEditEmail(e.target.value)}
                        disabled={isUpdatingUser}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={editPhone} 
                        onChange={e => setEditPhone(e.target.value)}
                        disabled={isUpdatingUser}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={editAge} 
                          onChange={e => setEditAge(e.target.value)}
                          disabled={isUpdatingUser}
                          min="1"
                          max="120"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={editGender} 
                          onChange={e => setEditGender(e.target.value)}
                          disabled={isUpdatingUser}
                        >
                          <option value="">Seleccionar</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={editWeight} 
                          onChange={e => setEditWeight(e.target.value)}
                          disabled={isUpdatingUser}
                          min="1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={editHeight} 
                          onChange={e => setEditHeight(e.target.value)}
                          disabled={isUpdatingUser}
                          min="50"
                          max="250"
                        />
                      </div>
                    </div>
                    
                    {/* Mensaje de error si existe */}
                    {updateMessage && !updateSuccess && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{updateMessage}</p>
                      </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex justify-end gap-2 mt-4">
                      <button 
                        type="button" 
                        className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors disabled:opacity-50"
                        onClick={handleCloseEditModal}
                        disabled={isUpdatingUser}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdatingUser}
                      >
                        {isUpdatingUser && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {isUpdatingUser ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Indicador de carga inicial para rutinas */}
      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Cargando rutinas...</p>
          </div>
        </div>
      ) : (
        <>
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
                          {cliente ? cliente.full_name || cliente.fullName || cliente.name || cliente.email : routine.client_id}
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log('ClientRoutineList - routine seleccionada:', routine);
                            console.log('ClientRoutineList - routine.id:', routine.id);
                            onSelectRoutine(routine);
                          }}
                          className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 disabled:opacity-50"
                          title="Ver Detalles"
                          disabled={loading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                          </svg>
                        </button>
                        {/* Botón para eliminar rutina, solo para admin */}
                        {isEditable && (
                          <button
                            onClick={() => {
                              if (typeof onDeleteRoutine === 'function') {
                                if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
                                  onDeleteRoutine(routine);
                                }
                              } else {
                                alert('Función de eliminación no disponible.');
                              }
                            }}
                            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
                            title="Eliminar rutina"
                            disabled={loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
        </>
      )}

      {/* El formulario para agregar rutina solo aparece si isEditable es true */}
      {isEditable && (
        <div className="mt-6">
          <button
            onClick={() => setShowAddRoutineForm(!showAddRoutineForm)}
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md flex items-center justify-center disabled:opacity-50"
            title={showAddRoutineForm ? 'Cancelar' : 'Agregar Nueva Rutina'}
            disabled={loading}
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
                className="w-full bg-green-900 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center justify-center disabled:opacity-50"
                title="Crear Rutina"
                disabled={loading}
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