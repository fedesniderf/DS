import React from 'react';
import NotificationCenter from './NotificationCenter';

const LayoutHeader = ({ 
  title, 
  onBackClick, 
  showBackButton, 
  onLogout, 
  showLogoutButton = true,
  userId,
  currentUser, // Agregar currentUser como prop
  isAdmin = false,
  showNotifications = true
}) => {
  console.log('🎯 LayoutHeader - Props recibidos:', {
    userId, 
    currentUser,
    showNotifications,
    isAdmin,
    'userId existe': !!userId,
    'currentUser existe': !!currentUser,
    'showNotifications && (userId || currentUser)': showNotifications && (userId || currentUser)
  });
  
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
      {showBackButton ? (
        <button onClick={onBackClick} className="p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      ) : (
        <div className="w-6 h-6 flex-shrink-0"></div> // Placeholder para mantener el espacio
      )}
      
      {/* Título responsive */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center flex-1 mx-2 truncate">{title}</h1>
      
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Sistema de notificaciones */}
        {showNotifications && (userId || currentUser) && (
          <NotificationCenter 
            currentUser={currentUser || { id: userId }} 
            isAdmin={isAdmin}
          />
        )}
        {showLogoutButton && onLogout && (
          <button
            onClick={onLogout}
            className="hidden sm:flex px-4 py-2 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-sm items-center"
            style={{ backgroundColor: '#183E0C' }}
            title="Cerrar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 005.25 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        )}
        {/* Botón de logout solo ícono para móvil */}
        {showLogoutButton && onLogout && (
          <button
            onClick={onLogout}
            className="sm:hidden p-2 rounded-full text-white hover:bg-gray-800 transition-colors"
            style={{ backgroundColor: '#183E0C' }}
            title="Cerrar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 005.25 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        )}
        <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" alt="Nuevo Logo" className="h-12 md:h-14 w-auto" />
      </div>
    </header>
  );
};

export default LayoutHeader;