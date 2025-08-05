import { useState, useEffect, useRef } from 'react';

/**
 * Hook personalizado para manejar Wake Lock API con fallback
 * Mantiene la pantalla encendida en dispositivos móviles
 */
export const useWakeLock = () => {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // Verificar soporte al montar el componente
  useEffect(() => {
    const checkSupport = () => {
      const hasWakeLock = 'wakeLock' in navigator;
      const hasNavigator = typeof navigator !== 'undefined';
      const isSecureContext = window.isSecureContext;
      
      console.log('Wake Lock Support Check:', {
        hasNavigator,
        hasWakeLock,
        isSecureContext,
        userAgent: navigator.userAgent
      });
      
      // Siempre decir que está soportado - usaremos fallbacks
      setIsSupported(true);
    };
    
    checkSupport();
  }, []);

  // Método más directo y efectivo para Samsung Internet
  const createNoSleepWakeLock = () => {
    // Crear un video visible pero muy pequeño que el usuario debe tocar
    const video = document.createElement('video');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('loop', '');
    video.setAttribute('controls', 'false');
    video.style.position = 'fixed';
    video.style.bottom = '10px';
    video.style.right = '10px';
    video.style.width = '2px';
    video.style.height = '2px';
    video.style.opacity = '0.01';
    video.style.pointerEvents = 'auto';
    video.style.zIndex = '9999';
    
    // Video de mayor duración (30 segundos)
    video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWRhc2gAAAYEbW9vdgAAAGxtdmhkAAAAANmLnK3Zi5ytAAGGoAAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAACJpb2RzAAAAABCAgIBQDUAABAAAAAABM3RyYWsAAABcdGtoZAAAAADZi5yt2YucrQAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAlgAAAGQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAPoAAAAAAAAQAAAAAABZW1kaWEAAAAgbWRoZAAAAADZi5yt2YucrQAArEQAAWAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAATNtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAPTc3RibAAAALNzdHNkAAAAAAAAAAEAAACjYXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAWgAZAASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFFhdmNDAWQAH//hABlnZAAfrNlAmDPl4QAAAwABAAADAGQPGDGWAQAGaOvjyyLAAAAAHHV1aWRraEDyXyRPxbo5pRvPAyPzAAAAAAAAABhzdHRzAAAAAAAAAAEAAAD6AAAD6QAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAAIxzdHN6AAAAAAAAAAAAAAAeAAADDwAAAAsAAAALAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAACgAAAA==';
    
    document.body.appendChild(video);
    videoRef.current = video;
    
    // Intentar reproducir automáticamente
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log('Video auto-play failed, user interaction required');
      });
    }
    
    return video;
  };

  // Método de vibración para mantener activo (Samsung específico)
  const createVibrationWakeLock = () => {
    if ('vibrate' in navigator) {
      const interval = setInterval(() => {
        // Vibración muy sutil cada 15 segundos
        navigator.vibrate(1);
        console.log('Vibration wake lock ping');
      }, 15000);
      
      intervalRef.current = interval;
      return interval;
    }
    return null;
  };

  // Método de notificación persistente para mantener activo
  const createNotificationWakeLock = () => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      // Crear una notificación silenciosa que se auto-actualiza
      const interval = setInterval(() => {
        try {
          // Solo mostrar la notificación si el documento no está visible
          if (document.hidden || document.visibilityState === 'hidden') {
            const notification = new Notification('Pantalla activa', {
              body: 'Manteniendo pantalla encendida...',
              icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTUuMDkgOC4yNkwyMiA5TDE3IDEyLjc0TDE4LjE4IDIyTDEyIDE4LjI4TDUuODIgMjJMNyAxMi43NEwyIDlMOC45MSA4LjI2TDEyIDJ6IiBmaWxsPSIjRkZEODAwIi8+Cjwvc3ZnPgo=',
              silent: true,
              tag: 'wake-lock'
            });
            
            // Auto-cerrar después de 1 segundo
            setTimeout(() => {
              notification.close();
            }, 1000);
          }
        } catch (e) {
          console.log('Notification wake lock failed:', e);
        }
      }, 20000);
      
      return interval;
    }
    return null;
  };

  // Método de intervalo súper agresivo para Samsung Internet
  const createIntervalWakeLock = () => {
    // Actividad cada 5 segundos para Samsung Internet
    const interval = setInterval(() => {
      try {
        // 1. Crear múltiples elementos DOM
        for (let i = 0; i < 3; i++) {
          const dummy = document.createElement('div');
          dummy.style.position = 'absolute';
          dummy.style.left = '-9999px';
          dummy.style.visibility = 'hidden';
          dummy.style.width = '1px';
          dummy.style.height = '1px';
          document.body.appendChild(dummy);
          
          setTimeout(() => {
            if (dummy.parentNode) {
              dummy.parentNode.removeChild(dummy);
            }
          }, 100);
        }
        
        // 2. Múltiples eventos simulados
        const events = ['touchstart', 'touchmove', 'mousemove', 'scroll'];
        events.forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          document.dispatchEvent(event);
        });
        
        // 3. Manipulación de focus más agresiva
        if (document.hasFocus && !document.hasFocus()) {
          window.focus();
        }
        
        // 4. Scroll en diferentes direcciones
        window.scrollBy(0, 1);
        setTimeout(() => window.scrollBy(0, -1), 100);
        
        // 5. Cambio de título para indicar actividad
        const originalTitle = document.title;
        document.title = originalTitle + ' •';
        setTimeout(() => {
          document.title = originalTitle;
        }, 500);
        
        // 6. Request animation frame para mantener la GPU activa
        requestAnimationFrame(() => {
          // Pequeña operación para mantener el hilo principal activo
          const temp = Math.random() * 1000;
        });
        
        console.log('🔄 Wake Lock interval activity - Samsung mode');
      } catch (error) {
        console.log('Interval wake lock activity failed:', error);
      }
    }, 5000); // Cada 5 segundos
    
    intervalRef.current = interval;
    return interval;
  };

  // Método adicional específico para Samsung Internet
  const createSamsungInternetWakeLock = () => {
    // Crear un audio silencioso en loop (muy efectivo en Samsung Internet)
    const audio = document.createElement('audio');
    audio.setAttribute('loop', '');
    audio.setAttribute('muted', '');
    audio.style.display = 'none';
    
    // Audio silencioso de 1 segundo
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Ltul0Xki2uovCcWhYLXarq7qZPEw1MqOLtt2AZC6Pq7qhTFAhAjNT1xnogBjN/w+nkiB0HIV+r5ohWFAhKltb3v3YdBSNEKRRoqtXdflUYA0Os1+/OnVEUAhCT0fzCXiMFKojAAYmjpTlwXoqvbrECOlwWqo8VAX2y1+LLXSIF2hUV7FXMJQESWRjlfAPFTQ/qf4vMcmsNGJjbxNOQvXFnqGjVTU5S4+fHrtyy9EBnO8qQOpZLnNrx5GVYUVZQNKGnZ9xZE6/TVYvlMPfHUGFDqI+8Xx1O6PdSWkkqhBHRi8FxODFbdcNXPXbFQlhBqo63Xh9r7ftZWElPpQrPi8F2OMlJeBJXQnLHRVNCqo6yOCUGLZP8zH5n/DJXQHLVflRCqo6yYxlR7fpTWUpNpxPPi8J6O8xPfBRdSHfOTFlPdgBgRhJQ7fldWUpLpRbPj8JyPslJdRJYU3XESlVJqo6dUhdpufJdVk5Np3rdkr99OdBUfRdXUXnOTl1Nqo6yYxlS6/laXE9KqBrOj8F+PcJAfBZbUnbDTUhLqo+cXCZh1PdeWVFR';
    
    document.body.appendChild(audio);
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log('Audio wakeLock fallback failed');
      });
    }
    
    return audio;
  };

  // Activar Wake Lock con enfoque directo para Samsung Internet
  const requestWakeLock = async () => {
    try {
      const isSamsungInternet = /SamsungBrowser/i.test(navigator.userAgent);
      
      // Para Samsung Internet, pedir permisos primero
      if (isSamsungInternet) {
        // Solicitar permiso de notificación si está disponible
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch (e) {
            console.log('Notification permission not available');
          }
        }
      }
      
      // Intentar Wake Lock API primero
      if ('wakeLock' in navigator && window.isSecureContext) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setIsWakeLockActive(true);
          
          wakeLockRef.current.addEventListener('release', () => {
            setIsWakeLockActive(false);
            console.log('🔋 Wake Lock liberado');
          });
          
          console.log('🔆 Wake Lock API activado');
          return true;
        } catch (wakeLockError) {
          console.log('Wake Lock API falló:', wakeLockError);
        }
      }
      
      // Para Samsung Internet: Estrategia combinada más agresiva
      if (isSamsungInternet) {
        console.log('🔧 Activando métodos Samsung Internet específicos...');
        
        // 1. Video que requiere interacción del usuario
        videoRef.current = createNoSleepWakeLock();
        
        // 2. Vibración sutil cada 15 segundos
        createVibrationWakeLock();
        
        // 3. Intervalo súper agresivo cada 5 segundos
        createIntervalWakeLock();
        
        // 4. Notificaciones periódicas si está permitido
        if (Notification.permission === 'granted') {
          createNotificationWakeLock();
        }
        
        setIsWakeLockActive(true);
        console.log('🔆 Samsung Internet Wake Lock combinado activado');
        
        // Mostrar instrucciones al usuario
        alert('Para mantener la pantalla encendida en Samsung Internet:\n\n1. Toca el video pequeño que aparece en la esquina inferior derecha\n2. Mantén la aplicación en primer plano\n3. La vibración sutil indicará que está activo');
        
        return true;
      }
      
      // Fallback estándar para otros navegadores
      videoRef.current = createNoSleepWakeLock();
      createIntervalWakeLock();
      setIsWakeLockActive(true);
      console.log('🔆 Fallback Wake Lock activado');
      return true;
    } catch (error) {
      console.error('❌ Error activando Wake Lock:', error);
      return false;
    }
  };

  // Desactivar Wake Lock y todos los fallbacks
  const releaseWakeLock = async () => {
    try {
      // Liberar Wake Lock API
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('🔋 Wake Lock API liberado');
      }
      
      // Liberar video fallback
      if (videoRef.current) {
        videoRef.current.pause();
        if (videoRef.current.parentNode) {
          videoRef.current.parentNode.removeChild(videoRef.current);
        }
        videoRef.current = null;
        console.log('🔋 Video Wake Lock liberado');
      }
      
      // Liberar audio fallback
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.parentNode) {
          audioRef.current.parentNode.removeChild(audioRef.current);
        }
        audioRef.current = null;
        console.log('🔋 Audio Wake Lock liberado');
      }
      
      // Liberar todos los intervalos
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('🔋 Interval Wake Lock liberado');
      }
      
      // Limpiar notificaciones si existen
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          registrations.forEach(registration => {
            // No desregistrar, solo limpiar notificaciones activas
          });
        } catch (e) {
          console.log('Service worker cleanup failed');
        }
      }
      
      setIsWakeLockActive(false);
      console.log('🔋 Todos los Wake Lock liberados');
      return true;
    } catch (error) {
      console.error('❌ Error liberando Wake Lock:', error);
      return false;
    }
  };

  // Toggle Wake Lock
  const toggleWakeLock = async () => {
    if (isWakeLockActive) {
      return await releaseWakeLock();
    } else {
      return await requestWakeLock();
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
      if (videoRef.current) {
        videoRef.current.pause();
        if (videoRef.current.parentNode) {
          videoRef.current.parentNode.removeChild(videoRef.current);
        }
      }
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.parentNode) {
          audioRef.current.parentNode.removeChild(audioRef.current);
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Re-activar Wake Lock cuando la página vuelve a estar visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isWakeLockActive && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWakeLockActive]);

  return {
    isWakeLockActive,
    isSupported,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock
  };
};
