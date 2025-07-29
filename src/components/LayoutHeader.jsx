import React from 'react';

const LayoutHeader = ({ title, onBackClick, showBackButton, onLogout }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
      {showBackButton ? (
        <button onClick={onBackClick} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      ) : (
        <div className="w-6 h-6"></div> // Placeholder para mantener el espacio
      )}
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Botón de logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-6 py-3 text-white text-lg rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-300 font-bold shadow-lg border-4 border-yellow-400 transform hover:scale-105"
            title="Cerrar Sesión"
            style={{ backgroundColor: '#dc2626', borderColor: '#facc15' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 005.25 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"></path>
            </svg>
          </button>
        )}
        {/* Logo */}
        <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" alt="Nuevo Logo" className="h-10 w-auto" />
      </div>
    </header>
  );
};

export default LayoutHeader;