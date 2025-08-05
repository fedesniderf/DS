import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const EditUserModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editMedicalConditions, setEditMedicalConditions] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Inicializar campos cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      setEditFullName(user.fullName || user.full_name || user.name || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone || '');
      setEditAge(user.age || '');
      setEditGender(user.gender || '');
      setEditWeight(user.weight || '');
      setEditHeight(user.height || '');
      setEditMedicalConditions(user.medicalConditions || user.medical_conditions || '');
      setUpdateMessage('');
      setUpdateSuccess(false);
    }
  }, [isOpen, user]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdatingUser(true);
    setUpdateMessage('');

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          fullName: editFullName,
          email: editEmail,
          phone: editPhone,
          age: editAge ? parseInt(editAge) : null,
          gender: editGender,
          weight: editWeight ? parseFloat(editWeight) : null,
          height: editHeight ? parseInt(editHeight) : null,
          medicalConditions: editMedicalConditions
        })
        .eq('client_id', user.client_id);

      if (error) {
        throw error;
      }

      setUpdateSuccess(true);
      setUpdateMessage('Usuario actualizado correctamente');
      
      // Notificar al componente padre sobre la actualización
      if (onUpdate) {
        onUpdate({
          ...user,
          fullName: editFullName,
          email: editEmail,
          phone: editPhone,
          age: editAge ? parseInt(editAge) : null,
          gender: editGender,
          weight: editWeight ? parseFloat(editWeight) : null,
          height: editHeight ? parseInt(editHeight) : null,
          medicalConditions: editMedicalConditions
        });
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      setUpdateMessage('Error al actualizar usuario: ' + error.message);
      setUpdateSuccess(false);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleCloseModal = () => {
    setUpdateMessage('');
    setUpdateSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Perfil
            </h3>
            <button
              onClick={handleCloseModal}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
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
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={handleCloseModal}
              >
                Aceptar
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              {/* Nombre completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={editFullName} 
                  onChange={e => setEditFullName(e.target.value)}
                  disabled={isUpdatingUser}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)}
                  disabled={isUpdatingUser}
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={editPhone} 
                  onChange={e => setEditPhone(e.target.value)}
                  disabled={isUpdatingUser}
                />
              </div>

              {/* Edad y Género */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
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

              {/* Peso y Altura */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
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
              
              {/* Condiciones médicas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dolencias o Indicaciones médicas</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical" 
                  rows="3"
                  value={editMedicalConditions} 
                  onChange={e => setEditMedicalConditions(e.target.value)}
                  disabled={isUpdatingUser}
                  placeholder="Describe cualquier dolencia, lesión previa, indicación médica o condición de salud relevante..."
                />
              </div>
              
              {/* Mensaje de error si existe */}
              {updateMessage && !updateSuccess && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{updateMessage}</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer - Solo mostrar si no es mensaje de éxito */}
        {!updateSuccess && (
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              type="button" 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              onClick={handleCloseModal}
              disabled={isUpdatingUser}
            >
              Cancelar
            </button>
            <button 
              onClick={handleUpdateUser}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdatingUser}
            >
              {isUpdatingUser && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isUpdatingUser ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;
