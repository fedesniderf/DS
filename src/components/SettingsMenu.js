import React, { useState, useRef, useEffect } from 'react';
import { useEnhancedWakeLock } from '../hooks/useEnhancedWakeLock';
import ChangePasswordModal from './ChangePasswordModal';
import SecurityInfoModal from './SecurityInfoModal';
import BlockedUsersPanel from './BlockedUsersPanel';
import PhotoUpdateModal from './PhotoUpdateModal';
import EditUserModal from './EditUserModal';

const SettingsMenu = ({ onLogout, currentUser, onChangePassword, onUserUpdate, onStartGuide, onRestartGuide }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSecurityInfoModal, setShowSecurityInfoModal] = useState(false);
  const [showBlockedUsersPanel, setShowBlockedUsersPanel] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  
  const { 
    isWakeLockActive, 
    isSupported, 
    toggleWakeLock, 
    preferences, 
    toggleDimming,
    currentBrightness,
    isBrightnessSupported 
  } = useEnhancedWakeLock();
  
  const menuRef = useRef(null);

  console.log('⚙️ SettingsMenu - Renderizado');

  // Función wrapper para interceptar el callback de actualización de usuario
  const handleUserUpdate = (updatedUser) => {
    console.log('⬆️ SettingsMenu - Usuario actualizado, propagando callback');
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    } else {
      console.warn('⚠️ SettingsMenu - onUserUpdate no está disponible');
    }
  };

  console.log('Enhanced SettingsMenu renderizado'); // Debug log
  console.log('Wake Lock Active:', isWakeLockActive);
  console.log('Dimming Enabled:', preferences.dimScreenOnWakeLock);
  console.log('Current Brightness:', Math.round(currentBrightness * 100) + '%');
  console.log('Device:', /SamsungBrowser/i.test(navigator.userAgent) ? 'Samsung Internet' : 'Other Browser');

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleLogout = () => {
    console.log('🚪 SettingsMenu - Iniciando logout');
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      console.warn('⚠️ SettingsMenu - onLogout no está disponible');
    }
  };

  const handleOpenPhotoModal = () => {
    console.log('📸 SettingsMenu - Abriendo modal de foto');
    setShowPhotoModal(true);
    setIsOpen(false);
  };

  const handleOpenEditUserModal = () => {
    console.log('✏️ SettingsMenu - Abriendo modal de editar usuario');
    setShowEditUserModal(true);
    setIsOpen(false);
  };

  const handleOpenChangePassword = () => {
    console.log('🔐 SettingsMenu - Intentando abrir modal de cambio de contraseña');
    
    if (onChangePassword) {
      console.log('🟢 SettingsMenu - Función onChangePassword disponible');
      setShowChangePasswordModal(true);
      setIsOpen(false);
    } else {
      console.warn('⚠️ SettingsMenu - onChangePassword no está disponible');
      alert('La función de cambio de contraseña no está disponible en este momento.');
    }
  };

  const handleOpenSecurityInfo = () => {
    console.log('🛡️ SettingsMenu - Abriendo información de seguridad');
    setShowSecurityInfoModal(true);
    setIsOpen(false);
  };

  const handleOpenBlockedUsersPanel = () => {
    console.log('🚫 SettingsMenu - Abriendo panel de usuarios bloqueados');
    setShowBlockedUsersPanel(true);
    setIsOpen(false);
  };

  const handleChangePasswordSubmit = (newPassword) => {
    console.log('🔄 SettingsMenu - Enviando cambio de contraseña');
    if (onChangePassword) {
      onChangePassword(newPassword);
    } else {
      console.warn('⚠️ SettingsMenu - onChangePassword no está disponible durante el submit');
    }
  };

  // Verificación de disponibilidad de función
  if (!onChangePassword) {
    console.warn('⚠️ SettingsMenu - La función onChangePassword no fue proporcionada como prop');
  }

  // Manejo de errores para funciones no disponibles
  const safeHandleChangePassword = () => {
    if (!onChangePassword) {
      throw new Error('Función de cambio de contraseña no disponible');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón con foto del usuario */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-shrink-0 border-2 border-gray-300 hover:border-blue-500 transition-colors rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title="Configuración"
      >
        <img
          src={currentUser?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.first_name || currentUser?.email || 'Usuario')}&background=3b82f6&color=fff&size=200`}
          alt={`${currentUser?.first_name || 'Usuario'}`}
          className="w-10 h-10 rounded-full object-cover"
        />
      </button>

      {/* Menú desplegable responsivo */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2">
          {/* Overlay para móvil */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel principal del menú */}
          <div className="absolute bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto bg-white rounded-t-2xl md:rounded-lg shadow-2xl border border-gray-200 md:w-72 lg:w-80 flex flex-col"
               style={{
                 maxHeight: 'min(90vh, 700px)', // Altura adaptativa para móvil y desktop
                 minHeight: 'min(50vh, 400px)'  // Altura mínima para asegurar usabilidad
               }}>
            
            {/* Indicador de arrastre para móvil */}
            <div className="md:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header fijo */}
            <div className="px-4 py-3 border-b border-gray-100 bg-white rounded-t-2xl md:rounded-t-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
              {/* Sección Usuario */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {currentUser?.name || currentUser?.email || 'Usuario'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {currentUser?.email || 'Sin email'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección Wake Lock */}
              <div className="px-4 py-2" data-guide="wake-lock-settings">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Pantalla
                </h4>
                
                {/* Control de Wake Lock */}
                <button
                  onClick={toggleWakeLock}
                  className="w-full flex items-center justify-between text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg 
                      className={`w-5 h-5 flex-shrink-0 ${isWakeLockActive ? 'text-yellow-600' : 'text-gray-600'}`}
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
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        Mantener pantalla encendida
                      </div>
                      <div className="text-xs text-gray-500">
                        {isWakeLockActive ? 'Pantalla siempre encendida' : 'Solo funciona en dispositivos compatibles'}
                      </div>
                    </div>
                  </div>
                  <div className={`ml-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isWakeLockActive ? 'bg-green-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isWakeLockActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </button>
                
                {/* Opción de dimming de pantalla */}
                {isSupported && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={toggleDimming}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <svg 
                          className="w-5 h-5 text-gray-600 flex-shrink-0" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 18.5A6.5 6.5 0 1 1 18.5 12 6.51 6.51 0 0 1 12 18.5ZM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                          <path d="M12 7a5 5 0 0 1 0 10Z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            Reducir brillo automáticamente
                          </div>
                          <div className="text-xs text-gray-500">
                            {preferences.dimScreenOnWakeLock 
                              ? `Brillo al 50% cuando esté activo (actual: ${Math.round(currentBrightness * 100)}%)`
                              : 'Mantener brillo normal cuando esté activo'
                            }
                          </div>
                        </div>
                      </div>
                      <div className={`ml-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.dimScreenOnWakeLock ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.dimScreenOnWakeLock ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1" />

              {/* Sección Perfil */}
              <div className="px-4 py-2" data-guide="profile-settings">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Perfil
                </h4>
                
                {/* Editar perfil */}
                <button
                  onClick={handleOpenEditUserModal}
                  className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors"
                >
                  <svg 
                    className="w-5 h-5 text-gray-600 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">Editar Perfil</div>
                    <div className="text-xs text-gray-500">Actualizar información personal</div>
                  </div>
                </button>

                {/* Cambiar foto de perfil */}
                <button
                  onClick={handleOpenPhotoModal}
                  className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors mt-1"
                >
                  <svg 
                    className="w-5 h-5 text-gray-600 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">Cambiar foto de perfil</div>
                    <div className="text-xs text-gray-500">Actualizar imagen de perfil</div>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1" />

              {/* Sección Seguridad */}
              <div className="px-4 py-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Seguridad
                </h4>
                
                {/* Cambiar contraseña */}
                <button
                  onClick={handleOpenChangePassword}
                  className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors"
                >
                  <svg 
                    className="w-5 h-5 text-gray-600 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" 
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">Cambiar Contraseña</div>
                    <div className="text-xs text-gray-500">Actualizar credenciales</div>
                  </div>
                </button>

                {/* Información de seguridad */}
                <button
                  onClick={handleOpenSecurityInfo}
                  className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors mt-1"
                >
                  <svg 
                    className="w-5 h-5 text-gray-600 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M9.879 7.519c0-1.425 1.154-2.579 2.579-2.579s2.579 1.154 2.579 2.579c0 1.425-1.154 2.579-2.579 2.579s-2.579-1.154-2.579-2.579zM15 12c0-1.657-1.343-3-3-3s-3 1.343-3 3v3h6v-3z" 
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">Información de Seguridad</div>
                    <div className="text-xs text-gray-500">Políticas y protección</div>
                  </div>
                </button>

                {/* Panel de usuarios bloqueados (Solo para admin) */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={handleOpenBlockedUsersPanel}
                    className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors mt-1"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-600 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75A11.96 11.96 0 0012 2.714z" 
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">Panel de Seguridad</div>
                      <div className="text-xs text-gray-500">Gestionar usuarios bloqueados</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1" />

              {/* Sección Ayuda - Solo para usuarios client */}
              {currentUser?.role === 'client' && (
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Ayuda
                  </h4>
                  
                  {/* Reiniciar Guía */}
                  <button
                    onClick={onRestartGuide}
                    className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors"
                    data-guide="restart-guide"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-600 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" 
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">Reiniciar Guía</div>
                      <div className="text-xs text-gray-500">Ver tutorial paso a paso</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100 my-1" />

              {/* Opción Cerrar Sesión */}
              {onLogout && (
                <div className="px-4 py-3 hover:bg-red-50 transition-colors">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 text-left text-red-600 hover:text-red-700"
                  >
                    <svg 
                      className="w-5 h-5 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 005.25 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" 
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">Cerrar Sesión</div>
                      <div className="text-xs text-red-500">Salir de la aplicación</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showChangePasswordModal && currentUser && (
        <ChangePasswordModal
          user={currentUser}
          onChangePassword={handleChangePasswordSubmit}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      {/* Modal de información de seguridad */}
      {showSecurityInfoModal && (
        <SecurityInfoModal
          isOpen={showSecurityInfoModal}
          onClose={() => setShowSecurityInfoModal(false)}
        />
      )}

      {/* Panel de usuarios bloqueados (Solo para admin) */}
      {showBlockedUsersPanel && currentUser?.role === 'admin' && (
        <BlockedUsersPanel
          isOpen={showBlockedUsersPanel}
          onClose={() => setShowBlockedUsersPanel(false)}
        />
      )}

      {/* Modal de cambio de foto de perfil */}
      {showPhotoModal && currentUser && (
        <PhotoUpdateModal
          user={currentUser}
          onClose={() => setShowPhotoModal(false)}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* Modal de editar usuario */}
      {showEditUserModal && currentUser && (
        <EditUserModal
          user={currentUser}
          isOpen={showEditUserModal}
          onClose={() => setShowEditUserModal(false)}
          onUpdate={(updatedUser) => {
            // Aquí podrías actualizar el currentUser si tienes un callback para eso
            console.log('Usuario actualizado:', updatedUser);
            handleUserUpdate(updatedUser);
          }}
        />
      )}
    </div>
  );
};

export default SettingsMenu;
