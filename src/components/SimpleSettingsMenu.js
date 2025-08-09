import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const SimpleSettingsMenu = ({ onLogout, currentUser, isOpen, onClose }) => {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSecurityInfoModal, setShowSecurityInfoModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [dimScreenOnWakeLock, setDimScreenOnWakeLock] = useState(false);
  
  const menuRef = useRef(null);
  const wakeLockRef = useRef(null);
  const hiddenVideoRef = useRef(null);
  
  console.log('SimpleSettingsMenuDebug rendered', { onLogout, currentUser, isOpen, onClose });
  
  // Initialize wake lock state from localStorage
  useEffect(() => {
    console.log('SimpleSettingsMenuDebug: Component mounted, initializing wake lock state');
    const savedWakeLockState = localStorage.getItem('wakeLockActive') === 'true';
    const savedDimState = localStorage.getItem('dimScreenOnWakeLock') === 'true';
    
    console.log('SimpleSettingsMenuDebug: Loaded from localStorage - wakeLockActive:', savedWakeLockState, 'dimScreenOnWakeLock:', savedDimState);
    
    setIsWakeLockActive(savedWakeLockState);
    setDimScreenOnWakeLock(savedDimState);
  }, []);
  
  if (!isOpen) return null;

  const handleWakeLockToggle = async () => {
    console.log('SimpleSettingsMenuDebug: Wake lock toggle clicked');
    
    try {
      if (isWakeLockActive) {
        // Desactivar wake lock
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
        
        // Parar video si existe
        if (hiddenVideoRef.current) {
          hiddenVideoRef.current.pause();
          hiddenVideoRef.current.currentTime = 0;
        }
        
        setIsWakeLockActive(false);
        localStorage.setItem('wakeLockActive', 'false');
        console.log('Wake Lock desactivado');
      } else {
        // Activar wake lock
        await activateWakeLock();
      }
    } catch (error) {
      console.error('Error con Wake Lock:', error);
    }
  };

  const activateWakeLock = async () => {
    console.log('SimpleSettingsMenuDebug: Attempting to activate wake lock');
    
    try {
      if ('wakeLock' in navigator) {
        console.log('SimpleSettingsMenuDebug: Using native Wake Lock API');
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('SimpleSettingsMenuDebug: Native wake lock activated successfully');
        
        wakeLockRef.current.addEventListener('release', () => {
          console.log('SimpleSettingsMenuDebug: Native wake lock was released');
        });
        
        setIsWakeLockActive(true);
        localStorage.setItem('wakeLockActive', 'true');
      } else {
        console.log('SimpleSettingsMenuDebug: Wake Lock API not supported, using video fallback');
        // Fallback usando video invisible
        if (hiddenVideoRef.current) {
          try {
            await hiddenVideoRef.current.play();
            setIsWakeLockActive(true);
            localStorage.setItem('wakeLockActive', 'true');
            console.log('SimpleSettingsMenuDebug: Video fallback activated successfully');
          } catch (videoError) {
            console.error('SimpleSettingsMenuDebug: Video fallback failed:', videoError);
            throw videoError;
          }
        }
      }
    } catch (error) {
      console.error('SimpleSettingsMenuDebug: Failed to activate wake lock:', error);
      throw error;
    }
  };

  const handleChangePassword = async () => {
    console.log('Cambiar contraseña - usando supabase:', !!supabase);
    setShowChangePasswordModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
      <h2 className="text-lg font-semibold mb-4">Configuración (Debug + Supabase)</h2>
      <div className="space-y-2">
        {/* Wake Lock Control */}
        <button
          onClick={handleWakeLockToggle}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center justify-between"
        >
          <span>⚡ Wake Lock</span>
          <span className={`text-sm ${isWakeLockActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isWakeLockActive ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Cambiar Contraseña */}
        <button
          onClick={handleChangePassword}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
          </svg>
          Cambiar Contraseña
        </button>

        {/* Cambiar Foto de Perfil */}
        <button
          onClick={() => setShowPhotoModal(true)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
          </svg>
          Cambiar Foto de Perfil
        </button>

        {/* Información de Seguridad */}
        <button
          onClick={() => setShowSecurityInfoModal(true)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Información de Seguridad
        </button>

        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-red-600 flex items-center"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>

      {/* Modal de Cambiar Contraseña */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
            <p>Supabase client disponible: {supabase ? '✅ Sí' : '❌ No'}</p>
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Foto de Perfil */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Cambiar Foto de Perfil</h3>
            <p>Funcionalidad de cambio de foto</p>
            <button
              onClick={() => setShowPhotoModal(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Información de Seguridad */}
      {showSecurityInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Información de Seguridad</h3>
            <p>Información de seguridad del usuario</p>
            <button
              onClick={() => setShowSecurityInfoModal(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* Video invisible para Wake Lock fallback */}
      <video
        ref={hiddenVideoRef}
        muted
        loop
        playsInline
        style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          opacity: 0, 
          pointerEvents: 'none',
          left: '-9999px'
        }}
      >
        <source src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzEAAAAIZnJlZQAAAuhtZGF0AAACrwYF//+c3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2MSByMzAyNyA0MDE5ZjI4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCB0aCAWAAAAJWVJRECgHAAcAQAAACBEaUQcAQAAACBEaUQcAQAAACBEaUQcAQAAACBEaUQcAAAABEZpbHNlAQAAACJFaUQcAQAAACJFaUQcAQAAACJFaUQcAQAAACJFaUQcAQAAACJFaUQ=" type="video/mp4" />
      </video>
    </div>
  );
};

export default SimpleSettingsMenu;
