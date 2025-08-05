import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const PhotoUpdateModal = ({ user, onClose, onUserUpdate }) => {
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState(user.profilePhoto || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB.');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setProfilePhoto(base64);
      setPhotoPreview(base64);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfilePhoto('');
    setPhotoPreview('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ profilePhoto: photoPreview })
        .eq('client_id', user.client_id);

      if (error) {
        throw error;
      }

      // Actualizar el usuario en el localStorage y el estado
      const updatedUser = { ...user, profilePhoto: photoPreview };
      console.log('📸 PhotoUpdateModal - Usuario actualizado:', updatedUser);
      localStorage.setItem('ds_user', JSON.stringify(updatedUser));
      
      // Llamar a la función de callback para actualizar el estado en el componente padre
      if (onUserUpdate) {
        console.log('⬆️ PhotoUpdateModal - Llamando onUserUpdate callback');
        onUserUpdate(updatedUser);
      } else {
        console.warn('⚠️ PhotoUpdateModal - onUserUpdate callback no encontrado');
      }
      
      alert('Foto de perfil actualizada correctamente');
      onClose();
      
    } catch (error) {
      console.error('Error al actualizar foto de perfil:', error);
      setError('Error al actualizar la foto de perfil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Cambiar Foto de Perfil
            </h3>
            <button
              onClick={onClose}
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
          {/* Preview actual */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Foto actual:</h4>
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Vista previa" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
                  />
                  {profilePhoto && (
                    <button
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Input de archivo */}
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="profilePhotoUpdate"
              />
              <label
                htmlFor="profilePhotoUpdate"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors"
              >
                {photoPreview ? 'Cambiar foto' : 'Seleccionar foto'}
              </label>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF (máx. 5MB)</p>
              
              {/* Opción para eliminar foto */}
              {user.profilePhoto && !profilePhoto && photoPreview && (
                <button
                  onClick={() => setPhotoPreview('')}
                  className="mt-2 text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Eliminar foto actual
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || (!profilePhoto && photoPreview === user.profilePhoto)}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpdateModal;
