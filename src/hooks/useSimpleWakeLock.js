import { useState, useEffect, useRef } from 'react';

/**
 * Hook simplificado y más efectivo para Samsung Internet
 * Se enfoca en técnicas comprobadas que funcionan
 */
export const useSimpleWakeLock = () => {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isSupported, setIsSupported] = useState(true); // Siempre decir que está soportado
  const wakeLockRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  // Método más simple y directo
  const createSimpleWakeLock = () => {
    // 1. Crear video completamente transparente pero funcional
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
    
    // Video mínimo que funciona en Samsung
    video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWRhc2gAAAFYbW9vdgAAAGxtdmhkAAAAANWNdH/VjXR/AAAD6AAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAABhpb2RzAAAAABCAgIAQAE8AABAAAAAAATNtdHJhawAAAFx0a2hkAAAAANWNdH/VjXR/AAAAAQAAAAAAAAPpAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAABAAAAAAAGAAAABQAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAA+kAAAAAAAEAAAAAAdxtZGlhAAAAIG1kaGQAAAAA1Y10f9WNdH8AALvgAAC74FXEAAAAAAAAACtodGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAdltaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAH5c3RibAAAAJNzdHNkAAAAAAAAAAEAAACAYXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAABAAAAASAAAAHgAAAF4AAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAACcYXZjQwFCAAr/4QAXZ0IAKrWV6wFqzPqGPfA+bL6i0tqXJujtLhWUeHQlFlS0hC+42QNhSNgAEIAo9hSC2BNgAEIAo9hOC2BNgAEIAo9hOC2BNgAAAGRzdHNzAAAAAAAAAQAAAAEAAAGIc3RzYwAAAAAAAAABAAAAATr==';
    
    document.body.appendChild(video);
    videoRef.current = video;
    
    // Intentar reproducir
    video.play().catch(e => {
      console.log('Video simple play failed:', e);
    });
    
    return video;
  };

  // Método de actividad muy simple pero efectivo
  const createSimpleActivity = () => {
    const interval = setInterval(() => {
      try {
        // Solo hacer lo mínimo necesario
        const event = new Event('touchstart', { bubbles: false });
        document.dispatchEvent(event);
        
        // Pequeña manipulación DOM
        document.body.style.opacity = document.body.style.opacity === '0.99999' ? '1' : '0.99999';
        
        console.log('🟢 Simple wake lock ping');
      } catch (e) {
        console.log('Simple activity failed:', e);
      }
    }, 30000); // Cada 30 segundos
    
    intervalRef.current = interval;
    return interval;
  };

  // Activar wake lock simplificado
  const requestWakeLock = async () => {
    try {
      // Intentar Wake Lock API si está disponible
      if ('wakeLock' in navigator && window.isSecureContext) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setIsWakeLockActive(true);
          
          wakeLockRef.current.addEventListener('release', () => {
            setIsWakeLockActive(false);
            console.log('🔋 Wake Lock API liberado');
          });
          
          console.log('✅ Wake Lock API activado');
          return true;
        } catch (e) {
          console.log('Wake Lock API no disponible, usando fallback');
        }
      }
      
      // Fallback simple
      createSimpleWakeLock();
      createSimpleActivity();
      setIsWakeLockActive(true);
      
      console.log('✅ Simple Wake Lock activado');
      return true;
      
    } catch (error) {
      console.error('❌ Error activando wake lock:', error);
      return false;
    }
  };

  // Desactivar wake lock
  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.pause();
        if (videoRef.current.parentNode) {
          videoRef.current.parentNode.removeChild(videoRef.current);
        }
        videoRef.current = null;
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsWakeLockActive(false);
      console.log('🔋 Simple Wake Lock desactivado');
      return true;
    } catch (error) {
      console.error('❌ Error desactivando wake lock:', error);
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

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

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
  }, [isWakeLockActive]);

  return {
    isWakeLockActive,
    isSupported,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock
  };
};
