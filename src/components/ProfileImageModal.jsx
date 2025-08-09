import React from 'react';

// Componente Modal para mostrar imagen de perfil agrandada
const ProfileImageModal = ({ imageData, onClose }) => {
  if (!imageData) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="font-semibold text-gray-900">
              {imageData.userName}
            </div>
            {imageData.userEmail && (
              <div className="text-sm text-gray-500">
                {imageData.userEmail}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 flex items-center justify-center">
          {imageData.url ? (
            <img
              src={imageData.url}
              alt={`Imagen de perfil de ${imageData.userName}`}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-6xl font-bold">
              {imageData.initials}
            </div>
          )}
        </div>

        {/* Información adicional opcional */}
        <div className="px-4 py-3 bg-gray-50 border-t text-center text-sm text-gray-600">
          Haz clic fuera de la imagen o en la X para cerrar
        </div>
      </div>
    </div>
  );
};

export default ProfileImageModal;
