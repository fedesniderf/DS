import React from 'react';
import { useEnhancedWakeLock } from '../hooks/useEnhancedWakeLock';

const WakeLockButton = ({ className = "" }) => {
  const { isWakeLockActive, isSupported, toggleWakeLock, preferences, currentBrightness } = useEnhancedWakeLock();

  // No mostrar el botón si no es compatible
  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    const success = await toggleWakeLock();
    if (!success && !isWakeLockActive) {
      alert('No se pudo activar el modo pantalla encendida. Asegúrate de que el navegador lo soporte.');
    }
  };

  // Mostrar información adicional en el tooltip
  const tooltipText = isWakeLockActive 
    ? `Desactivar pantalla siempre encendida${preferences.dimScreenOnWakeLock ? ` (Brillo: ${Math.round(currentBrightness * 100)}%)` : ''}`
    : 'Mantener pantalla encendida durante entrenamiento';

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
        isWakeLockActive
          ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      } ${className}`}
      title={tooltipText}
    >
      {/* Icono SVG en lugar de emoji para mejor compatibilidad móvil */}
      <svg 
        className="w-4 h-4 sm:w-5 sm:h-5" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        {isWakeLockActive ? (
          // Icono de sol para "encendido"
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        ) : (
          // Icono de batería para "apagado"
          <path d="M4.5 9.75V6A1.5 1.5 0 016 4.5h12A1.5 1.5 0 0119.5 6v3.75M4.5 9.75H18a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5zm15 0V6a.75.75 0 00-.75-.75H6a.75.75 0 00-.75.75v3.75h14.25z" />
        )}
      </svg>
      <span className="hidden sm:inline">
        {isWakeLockActive ? 'Pantalla Encendida' : 'Mantener Encendida'}
      </span>
      <span className="sm:hidden">
        {isWakeLockActive ? 'ON' : 'OFF'}
      </span>
    </button>
  );
};

export default WakeLockButton;
