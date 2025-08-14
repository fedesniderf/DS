import { useState, useEffect, useRef } from 'react';
import { useUserPreferences } from './useUserPreferences';
import { useScreenBrightness } from './useScreenBrightness';

/**
 * Hook mejorado para Wake Lock con preferencias del usuario y control de brillo
 */
export const useEnhancedWakeLock = () => {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [userIntendedActive, setUserIntendedActive] = useState(false); // Rastrear intención del usuario
  const wakeLockRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const heartbeatRef = useRef(null); // Para monitoreo continuo
  
  const { preferences, updatePreference, isLoading } = useUserPreferences();
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

  // Sincronizar userIntendedActive con preferencias cuando se cargan por primera vez
  useEffect(() => {
    // Solo procesar cuando las preferencias ya se cargaron desde la base de datos
    if (isLoading) {
      console.log('🔄 Esperando a que se carguen las preferencias desde la base de datos...');
      return;
    }

    // Solo sincronizar cuando se cargan las preferencias desde la base de datos
    if (preferences.wakeLockEnabled) {
      console.log('🔄 Detectadas preferencias de Wake Lock activas - configurando intención del usuario...');
      setUserIntendedActive(true);
      
      // Si no está activo actualmente, intentar reactivar
      if (!isWakeLockActive) {
        console.log('🔄 Reactivando Wake Lock desde preferencias...');
        setTimeout(() => {
          requestWakeLock();
        }, 500); // Delay más corto para mejor UX
      }
    } else {
      console.log('🔄 Preferencias de Wake Lock inactivas - manteniendo estado off');
      setUserIntendedActive(false);
    }
  }, [preferences.wakeLockEnabled, isLoading]); // Incluir isLoading en dependencias

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

  // Heartbeat para detectar cuando Wake Lock se pierde inesperadamente
  const startHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    heartbeatRef.current = setInterval(() => {
      // Solo verificar si el usuario quiere Wake Lock activo
      if (userIntendedActive) {
        const hasNativeWakeLock = wakeLockRef.current && !wakeLockRef.current.released;
        const hasFallback = videoRef.current && !videoRef.current.paused;
        
        if (!hasNativeWakeLock && !hasFallback && !isWakeLockActive) {
          console.log('💓 Heartbeat detectó Wake Lock perdido - reactivando...');
          requestWakeLock();
        }
      }
    }, 10000); // Verificar cada 10 segundos
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  // Activar wake lock con control de brillo
  const requestWakeLock = async () => {
    try {
      setUserIntendedActive(true); // El usuario quiere que Wake Lock esté activo
      
      // Intentar Wake Lock API si está disponible
      if ('wakeLock' in navigator && window.isSecureContext) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setIsWakeLockActive(true);
          
          wakeLockRef.current.addEventListener('release', () => {
            setIsWakeLockActive(false);
            // NO cambiar userIntendedActive aquí - podría ser liberación automática del sistema
            console.log('🔋 Enhanced Wake Lock API liberado automáticamente');
          });
          
          console.log('✅ Enhanced Wake Lock API activado');
          
          // Aplicar dimming si está habilitado en preferencias
          if (preferences.dimScreenOnWakeLock) {
            setTimeout(() => {
              dimToHalf();
            }, 500); // Pequeño delay para mejor UX
          }
          
          // Guardar preferencia en la base de datos
          await updatePreference('wakeLockEnabled', true);
          
          // Iniciar heartbeat para monitoreo continuo
          startHeartbeat();
          
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
      
      // Guardar preferencia en la base de datos
      await updatePreference('wakeLockEnabled', true);
      
      // Iniciar heartbeat para monitoreo continuo
      startHeartbeat();
      
      console.log('✅ Enhanced Simple Wake Lock activado');
      return true;
      
    } catch (error) {
      console.error('❌ Error activando enhanced wake lock:', error);
      return false;
    }
  };

  // Función para limpiar recursos sin afectar la base de datos (para cleanup)
  const cleanupResources = () => {
    try {
      // Liberar Wake Lock API (sin cambiar userIntendedActive)
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
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
      
      // Detener heartbeat
      stopHeartbeat();
      
      // Restaurar brillo
      if (preferences.dimScreenOnWakeLock) {
        restoreOriginalBrightness();
      }
      
      setIsWakeLockActive(false);
      // NO llamar updatePreference aquí - es solo cleanup
      
      console.log('🧹 Enhanced Wake Lock recursos limpiados (sin afectar preferencias)');
    } catch (error) {
      console.error('❌ Error limpiando recursos de wake lock:', error);
    }
  };

  // Desactivar wake lock (acción manual del usuario)
  const releaseWakeLock = async () => {
    try {
      setUserIntendedActive(false); // El usuario ya no quiere Wake Lock activo
      
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
      
      // Detener heartbeat
      stopHeartbeat();
      
      // Restaurar brillo
      if (preferences.dimScreenOnWakeLock) {
        restoreOriginalBrightness();
      }
      
      setIsWakeLockActive(false);
      await updatePreference('wakeLockEnabled', false);
      
      console.log('🔋 Enhanced Wake Lock desactivado manualmente');
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

  // Re-activar cuando la página vuelve a estar visible o el usuario interactúa
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('📱 Visibility changed:', {
        visibilityState: document.visibilityState,
        userIntendedActive,
        isWakeLockActive,
        hasWakeLock: !!wakeLockRef.current,
        hasVideo: !!videoRef.current
      });
      
      if (document.visibilityState === 'visible' && userIntendedActive && !isWakeLockActive) {
        console.log('🔄 Re-activando Wake Lock después de volver a la app...');
        // Re-activar después de un pequeño delay
        setTimeout(() => {
          if (userIntendedActive && !wakeLockRef.current && !videoRef.current) {
            requestWakeLock();
          }
        }, 1000);
      }
    };

    const handleFocus = () => {
      console.log('👀 App focused - checking Wake Lock state');
      if (userIntendedActive && !isWakeLockActive) {
        console.log('🔄 Re-activando Wake Lock en focus...');
        setTimeout(() => {
          if (userIntendedActive && !wakeLockRef.current && !videoRef.current) {
            requestWakeLock();
          }
        }, 500);
      }
    };

    const handleResize = () => {
      // Resize puede indicar cambio de orientación en móvil
      if (userIntendedActive && !isWakeLockActive) {
        console.log('🔄 Re-activando Wake Lock después de resize...');
        setTimeout(() => {
          if (userIntendedActive && !wakeLockRef.current && !videoRef.current) {
            requestWakeLock();
          }
        }, 1000);
      }
    };

    const handleUserActivity = () => {
      // Actividad del usuario mientras quiere Wake Lock activo
      if (userIntendedActive && !isWakeLockActive) {
        console.log('🔄 Re-activando Wake Lock por actividad del usuario...');
        setTimeout(() => {
          if (userIntendedActive && !wakeLockRef.current && !videoRef.current) {
            requestWakeLock();
          }
        }, 100);
      }
    };

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', handleResize);
    
    // Eventos de actividad del usuario para reactivación
    const userEvents = ['touchstart', 'mousedown', 'keydown'];
    userEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', handleResize);
      userEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [userIntendedActive, isWakeLockActive]);

  // Sincronizar userIntendedActive con preferencias al inicializar
  useEffect(() => {
    // Solo verificar al cargar la página cuando las preferencias ya se cargaron
    if (isLoading) {
      return; // Esperar a que se carguen las preferencias
    }

    console.log('🔄 Verificando preferencias iniciales:', {
      wakeLockEnabled: preferences.wakeLockEnabled,
      userIntendedActive,
      isWakeLockActive,
      isLoading
    });
    
    if (preferences.wakeLockEnabled && !userIntendedActive) {
      console.log('🔄 Sincronizando intención del usuario con preferencias guardadas...');
      setUserIntendedActive(true);
    }
  }, [isLoading]); // Solo cuando termine de cargar las preferencias

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopHeartbeat();
      cleanupResources(); // Usar la nueva función que no afecta la base de datos
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
    isBrightnessSupported,
    userIntendedActive, // Nuevo estado para debugging y control avanzado
    isLoading // Exponer estado de carga
  };
};
