import React from 'react';
import SettingsMenu from './SettingsMenu';

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
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Menú de configuración - NUEVO */}
        <SettingsMenu onLogout={onLogout} />
        
        {/* Botón de prueba para debug */}
        <button className="p-2 bg-red-500 text-white rounded">TEST</button>
        
        {/* Logo */}
        <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" alt="Nuevo Logo" className="h-8 w-auto sm:h-10" />
      </div>
    </header>
  );
};

export default LayoutHeader;