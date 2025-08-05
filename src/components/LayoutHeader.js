import React from 'react';
import NotificationCenter from './NotificationCenter';
import SettingsMenu from './SettingsMenu';

const LayoutHeader = ({ 
  title, 
  onBackClick, 
  showBackButton, 
  onLogout, 
  showLogoutButton = true,
  userId,
  currentUser, // Agregar currentUser como prop
  isAdmin = false,
  showNotifications = true,
  onChangePassword, // Nueva prop para cambiar contraseña
  onUserUpdate // Nueva prop para actualizar usuario
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
      <div className="flex items-center gap-3 flex-shrink-0">
        {showBackButton && (
          <button onClick={onBackClick} className="p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}
        
        {/* Título a la izquierda */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Sistema de notificaciones */}
        {showNotifications && (userId || currentUser) && (
          <NotificationCenter 
            currentUser={currentUser || { id: userId }} 
            isAdmin={isAdmin}
          />
        )}
        
        {/* Menú de configuración */}
        <SettingsMenu 
          onLogout={onLogout} 
          currentUser={currentUser} 
          onChangePassword={onChangePassword}
          onUserUpdate={onUserUpdate}
        />
        
        {/* Foto de perfil del usuario */}
        {currentUser && currentUser.profilePhoto && (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0">
            <img 
              src={currentUser.profilePhoto} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold hidden">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        )}
        
        {/* Avatar con iniciales si no hay foto */}
        {currentUser && !currentUser.profilePhoto && (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>
    </header>
  );
};

export default LayoutHeader;