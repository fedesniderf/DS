import React from 'react';
import SettingsMenu from './SettingsMenu';
import SocialButtonSimple from './SocialButtonSimple';

const LayoutHeader = ({ title, onBackClick, showBackButton, onLogout, currentUser }) => {
  // Debug temporal
  console.log('LayoutHeader - currentUser:', currentUser);
  
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
      
      {/* TEXTO DEBUG VISIBLE */}
      <div className="bg-red-500 text-white px-4 py-2 font-bold">
        DEBUG: HEADER FUNCIONANDO
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        {/* BOTÓN MEGA VISIBLE */}
        <div className="bg-yellow-400 text-black px-4 py-2 font-bold border-2 border-black">
          BOTÓN SOCIAL AQUÍ
        </div>
        
        {/* BOTÓN SOCIAL - DIRECTO EN HEADER */}
        <button
          onClick={() => alert('¡Red Social DS funcionando!')}
          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          title="Red Social DS"
        >
          🌐 Social
        </button>
        
        {/* Red Social - Test Simple */}
        <SocialButtonSimple currentUser={currentUser || { id: 'test', name: 'Test User' }} />
        
        {/* Menú de configuración */}
        <SettingsMenu onLogout={onLogout} currentUser={currentUser} />
        
        {/* Logo */}
        <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" alt="Nuevo Logo" className="h-8 w-auto sm:h-10" />
      </div>
    </header>
  );
};

export default LayoutHeader;