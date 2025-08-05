import React, { useState, useRef, useEffect } from 'react';
import { useEnhancedWakeLock } from '../hooks/useEnhancedWakeLock';
import ChangePasswordModal from './ChangePasswordModal';
import SecurityInfoModal from './SecurityInfoModal';
import BlockedUsersPanel from './BlockedUsersPanel';
import PhotoUpdateModal from './PhotoUpdateModal';
import EditUserModal from './EditUserModal';

const SettingsMenu = ({ onLogout, currentUser, onChangePassword, onUserUpdate }) => {
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWakeLockToggle = async () => {
    const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
    
    if (isSamsungBrowser && !isWakeLockActive) {
      // Para Samsung Internet, dar instrucciones específicas
      alert(`⚠️ Compatibilidad limitada detectada

Esta función puede no funcionar completamente en tu navegador.

Recomendaciones:
• Aumenta el tiempo de pantalla en Configuración del dispositivo
• Mantén la aplicación en primer plano
• Toca la pantalla ocasionalmente para evitar el apagado

¿Deseas activar el modo básico?`);
    }
    
    const success = await toggleWakeLock();
    
    if (!success && !isWakeLockActive) {
      if (isSamsungBrowser) {
        alert('✅ Modo básico activado. Para mejores resultados, sigue las recomendaciones anteriores.');
      } else {
        alert('✅ Modo pantalla encendida activado. Mantén la aplicación abierta para mejores resultados.');
      }
    } else if (success && isWakeLockActive) {
      console.log('✅ Pantalla encendida activada correctamente');
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleOpenChangePassword = () => {
    setIsOpen(false);
    setShowChangePasswordModal(true);
  };

  const handleOpenSecurityInfo = () => {
    setIsOpen(false);
    setShowSecurityInfoModal(true);
  };

  const handleOpenBlockedUsersPanel = () => {
    setIsOpen(false);
    setShowBlockedUsersPanel(true);
  };

  const handleChangePasswordSubmit = async (currentPassword, newPassword) => {
    if (onChangePassword) {
      return await onChangePassword(currentPassword, newPassword);
    }
    throw new Error('Función de cambio de contraseña no disponible');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón de configuración */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 sm:p-3 rounded-full transition-colors duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-2 border-red-500"
        title="Configuración"
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
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 6h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H3.75m0 6h9.75M10.5 18a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5" 
          />
        </svg>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {/* Encabezado del menú */}
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Configuración</h3>
            </div>

            {/* Opción Wake Lock */}
            <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <button
                onClick={handleWakeLockToggle}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <svg 
                    className="w-5 h-5 text-gray-600" 
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
                  <div>
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
              
              {/* Advertencia de compatibilidad */}
              <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                ⚠️ Esta función puede no estar disponible en todos los navegadores y dispositivos
              </div>
              
              {/* Opción de dimming de pantalla */}
              {isSupported && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={toggleDimming}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <svg 
                        className="w-5 h-5 text-gray-600" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 18.5A6.5 6.5 0 1 1 18.5 12 6.51 6.51 0 0 1 12 18.5ZM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                        <path d="M12 7a5 5 0 0 1 0 10Z" />
                      </svg>
                      <div>
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
                  
                  {/* Información adicional sobre dimming */}
                  <div className="mt-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    💡 Ayuda a ahorrar batería manteniendo la pantalla visible pero menos brillante
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />

            {/* Sección Perfil */}
            <div className="px-4 py-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Perfil
              </h4>
              
              {/* Editar perfil */}
              <button
                onClick={() => setShowEditUserModal(true)}
                className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors"
              >
                <svg 
                  className="w-5 h-5 text-gray-600" 
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
                <div>
                  <div className="text-sm font-medium text-gray-900">Editar Perfil</div>
                  <div className="text-xs text-gray-500">Actualizar información personal</div>
                </div>
              </button>

              {/* Cambiar foto de perfil */}
              <button
                onClick={() => setShowPhotoModal(true)}
                className="w-full flex items-center space-x-3 text-left py-2 hover:bg-gray-50 rounded-md px-2 transition-colors mt-1"
              >
                <svg 
                  className="w-5 h-5 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" 
                  />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-900">Cambiar Foto de Perfil</div>
                  <div className="text-xs text-gray-500">Actualizar imagen</div>
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
                  className="w-5 h-5 text-gray-600" 
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
                <div>
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
                  className="w-5 h-5 text-gray-600" 
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
                <div>
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
                    className="w-5 h-5 text-gray-600" 
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
                  <div>
                    <div className="text-sm font-medium text-gray-900">Panel de Seguridad</div>
                    <div className="text-xs text-gray-500">Gestionar usuarios bloqueados</div>
                  </div>
                </button>
              )}
            </div>

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
                    className="w-5 h-5" 
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
                  <div>
                    <div className="text-sm font-medium">Cerrar Sesión</div>
                    <div className="text-xs text-red-500">Salir de la aplicación</div>
                  </div>
                </button>
              </div>
            )}
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
          }}
        />
      )}
    </div>
  );
};

export default SettingsMenu;
