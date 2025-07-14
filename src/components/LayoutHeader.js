import React from 'react';

const LayoutHeader = ({ title, onBackClick, showBackButton }) => {
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
      {/* Nuevo logo agregado */}
      <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" alt="Nuevo Logo" className="h-10 w-auto" />
    </header>
  );
};

export default LayoutHeader;