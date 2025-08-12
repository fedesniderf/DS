import React, { useState } from 'react';
import NotificationCenter from './NotificationCenter';
import SettingsMenu from './SettingsMenu';
import SocialFeed from './SocialFeed.jsx';
import UserGuide from './UserGuide.jsx';
import { useUserGuide } from '../hooks/useUserGuide.js';

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
  const [showSocialFeed, setShowSocialFeed] = useState(false);
  
  // Hook para la guía del usuario
  const {
    showGuide,
    currentStep,
    handleGuideComplete,
    handleGuideSkip,
    startGuideManually,
    restartGuide
  } = useUserGuide(currentUser);

  // Debug para verificar client_id del usuario
  React.useEffect(() => {
    if (currentUser) {
      console.log('🔍 LayoutHeader - Debug usuario actual:', {
        email: currentUser.email,
        client_id: currentUser.client_id,
        id: currentUser.id,
        'Mostrar Social': currentUser.client_id === '8cb68a35-4f55-4636-a0fa-c146f2ac592f'
      });
    }
  }, [currentUser]);

  console.log('🔍 LayoutHeader Debug:', {
    'currentUser existe': !!currentUser,
    'currentUser.client_id': currentUser?.client_id,
    'showNotifications && (userId || currentUser)': showNotifications && (userId || currentUser)
  });
  
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10" data-guide="navigation">
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
        {/* BOTÓN SOCIAL DS - Solo para usuario específico */}
        {currentUser && currentUser.client_id === '8cb68a35-4f55-4636-a0fa-c146f2ac592f' && (
          <button
            onClick={() => setShowSocialFeed(true)}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            title="Red Social DS"
          >
            🌐 Social
          </button>
        )}
        

        
        {/* Sistema de notificaciones */}
        {showNotifications && (userId || currentUser) && (
          <NotificationCenter 
            currentUser={currentUser || { id: userId }} 
            isAdmin={isAdmin}
          />
        )}
        
        {/* Menú de configuración - ELIMINADO, ahora está integrado en el avatar */}
        
        {/* Menú de configuración - Componente independiente */}
        {currentUser && (
          <SettingsMenu 
            data-guide="user-settings"
            onLogout={onLogout} 
            currentUser={currentUser} 
            onChangePassword={onChangePassword}
            onUserUpdate={onUserUpdate}
            onStartGuide={startGuideManually}
            onRestartGuide={restartGuide}
          />
        )}
      </div>
      
      {/* Modal de Red Social */}
      {showSocialFeed && (
        <SocialFeed 
          currentUser={currentUser}
          onClose={() => setShowSocialFeed(false)}
        />
      )}
      
      {/* Guía del Usuario */}
      <UserGuide 
        isVisible={showGuide}
        onComplete={handleGuideComplete}
        onSkip={handleGuideSkip}
        userRole={currentUser?.role}
        currentStep={currentStep}
      />
    </header>
  );
};

export default LayoutHeader;