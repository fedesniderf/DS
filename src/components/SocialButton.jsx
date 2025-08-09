import React, { useState } from 'react';
// import SocialFeed from './SocialFeed'; // Temporal

const SocialButton = ({ currentUser }) => {
  const [showSocialFeed, setShowSocialFeed] = useState(false);

  // Debug temporal
  console.log('SocialButton - currentUser:', currentUser);

  const handleClick = () => {
    alert('¡Botón Social funcionando! Preparando red social...');
    setShowSocialFeed(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="p-2 rounded-lg transition-colors duration-200 text-white bg-blue-500 hover:bg-blue-600 relative shadow-md"
        title="Red Social DS"
      >
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        {/* Indicador de notificaciones */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          3
        </span>
      </button>

      {/* Modal simplificado temporal */}
      {showSocialFeed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Red Social DS</h2>
            <p className="mb-4">¡El botón está funcionando! La red social estará disponible pronto.</p>
            <button 
              onClick={() => setShowSocialFeed(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialButton;
