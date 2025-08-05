import { useState, useEffect, useRef } from 'react';
import { useUserPreferences } from './useUserPreferences';
import { useScreenBrightness } from './useScreenBrightness';

/**
 * Hook mejorado para Wake Lock con preferencias del usuario y control de brillo
 */
export const useEnhancedWakeLock = () => {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  
  const { preferences, updatePreference } = useUserPreferences();
  const { 
    currentBrightness, 
    dimToHalf, 
    restoreOriginalBrightness,
    isSupported: isBrightnessSupported 
  } = useScreenBrightness();

  // Verificar soporte al montar el componente
  useEffect(() => {
    const checkSupport = () => {
      const hasWakeLock = 'wakeLock' in navigator;
      const hasNavigator = typeof navigator !== 'undefined';
      const isSecureContext = window.isSecureContext;
      
      console.log('Enhanced Wake Lock Support Check:', {
        hasNavigator,
        hasWakeLock,
        isSecureContext,
        isBrightnessSupported,
        userAgent: navigator.userAgent
      });
      
      // Siempre decir que está soportado - usaremos fallbacks
      setIsSupported(true);
    };

    checkSupport();
  }, [isBrightnessSupported]);

  // Restaurar preferencia de Wake Lock al inicializar
  useEffect(() => {
    if (preferences.wakeLockEnabled && !isWakeLockActive) {
      console.log('🔄 Restaurando Wake Lock desde preferencias...');
      requestWakeLock();
    }
  }, [preferences.wakeLockEnabled]);

  // Método simple para crear video fallback
  const createSimpleWakeLock = () => {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    
    // Hacer el video completamente invisible pero aún funcional
    video.style.position = 'fixed';
    video.style.bottom = '0';
    video.style.right = '0';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-1';
    
    // Video mínimo que funciona
    video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWRhc2gAAAFYbW9vdgAAAGxtdmhkAAAAANWNdH/VjXR/AAAD6AAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAABhpb2RzAAAAABCAgIAQAE8AABAAAAAAATNtdHJhawAAAFx0a2hkAAAAANWNdH/VjXR/AAAAAQAAAAAAAAPpAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAABAAAAAAAGAAAABQAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAA+kAAAAAAAEAAAAAAdxtZGlhAAAAIG1kaGQAAAAA1Y10f9WNdH8AALvgAAC74FXEAAAAAAAAACtodGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAUJtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAACfcdH/';
    
    document.body.appendChild(video);
    videoRef.current = video;
    
    // Intentar reproducir
    video.play().catch(e => {
      console.log('Video simple play failed:', e);
    });

    return video;
  };

  // Método de actividad simple pero efectivo
  const createSimpleActivity = () => {
    const interval = setInterval(() => {
      try {
        // Solo hacer lo mínimo necesario
        const event = new Event('touchstart', { bubbles: false });
        document.dispatchEvent(event);
        
        // Pequeña manipulación DOM
        document.body.style.opacity = document.body.style.opacity === '0.99999' ? '1' : '0.99999';
        
        console.log('🟢 Enhanced wake lock ping');
      } catch (e) {
        console.log('Simple activity failed:', e);
      }
    }, 30000); // Cada 30 segundos
    
    intervalRef.current = interval;
    return interval;
  };

  // Activar wake lock con control de brillo
  const requestWakeLock = async () => {
    try {
      // Intentar Wake Lock API si está disponible
      if ('wakeLock' in navigator && window.isSecureContext) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setIsWakeLockActive(true);
          
          wakeLockRef.current.addEventListener('release', () => {
            setIsWakeLockActive(false);
            updatePreference('wakeLockEnabled', false);
            // Restaurar brillo al liberar wake lock
            if (preferences.dimScreenOnWakeLock) {
              restoreOriginalBrightness();
            }
            console.log('🔋 Enhanced Wake Lock API liberado');
          });
          
          console.log('✅ Enhanced Wake Lock API activado');
          
          // Aplicar dimming si está habilitado en preferencias
          if (preferences.dimScreenOnWakeLock) {
            setTimeout(() => {
              dimToHalf();
            }, 500); // Pequeño delay para mejor UX
          }
          
          // Guardar preferencia
          updatePreference('wakeLockEnabled', true);
          return true;
        } catch (e) {
          console.log('Wake Lock API no disponible, usando fallback');
        }
      }
      
      // Fallback simple
      createSimpleWakeLock();
      createSimpleActivity();
      setIsWakeLockActive(true);
      
      // Aplicar dimming si está habilitado
      if (preferences.dimScreenOnWakeLock) {
        setTimeout(() => {
          dimToHalf();
        }, 500);
      }
      
      // Guardar preferencia
      updatePreference('wakeLockEnabled', true);
      
      console.log('✅ Enhanced Simple Wake Lock activado');
      return true;
      
    } catch (error) {
      console.error('❌ Error activando enhanced wake lock:', error);
      return false;
    }
  };

  // Desactivar wake lock
  const releaseWakeLock = async () => {
    try {
      // Liberar Wake Lock API
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      
      // Liberar video fallback
      if (videoRef.current) {
        videoRef.current.pause();
        if (videoRef.current.parentNode) {
          videoRef.current.parentNode.removeChild(videoRef.current);
        }
        videoRef.current = null;
      }
      
      // Liberar intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Restaurar brillo
      if (preferences.dimScreenOnWakeLock) {
        restoreOriginalBrightness();
      }
      
      setIsWakeLockActive(false);
      updatePreference('wakeLockEnabled', false);
      
      console.log('🔋 Enhanced Wake Lock desactivado');
      return true;
    } catch (error) {
      console.error('❌ Error desactivando enhanced wake lock:', error);
      return false;
    }
  };

  // Toggle wake lock
  const toggleWakeLock = async () => {
    if (isWakeLockActive) {
      return await releaseWakeLock();
    } else {
      return await requestWakeLock();
    }
  };

  // Toggle preferencia de dimming
  const toggleDimming = () => {
    const newValue = !preferences.dimScreenOnWakeLock;
    updatePreference('dimScreenOnWakeLock', newValue);
    
    // Si wake lock está activo, aplicar o quitar dimming inmediatamente
    if (isWakeLockActive) {
      if (newValue) {
        dimToHalf();
      } else {
        restoreOriginalBrightness();
      }
    }
  };

  // Re-activar cuando la página vuelve a estar visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isWakeLockActive) {
        // Re-activar después de un pequeño delay
        setTimeout(() => {
          if (isWakeLockActive && !wakeLockRef.current && !videoRef.current) {
            requestWakeLock();
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWakeLockActive, preferences.dimScreenOnWakeLock]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  return {
    isWakeLockActive,
    isSupported,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock,
    // Nuevas funcionalidades
    preferences,
    updatePreference,
    toggleDimming,
    currentBrightness,
    isBrightnessSupported
  };
};
