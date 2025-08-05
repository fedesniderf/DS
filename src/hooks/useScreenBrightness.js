import { useState, useEffect, useRef } from 'react';

/**
 * Hook para controlar el brillo de la pantalla usando Screen Brightness API
 * o fallback con overlay
 */
export const useScreenBrightness = () => {
  const [currentBrightness, setCurrentBrightness] = useState(1);
  const [originalBrightness, setOriginalBrightness] = useState(1);
  const [isSupported, setIsSupported] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    // Verificar soporte para Screen Brightness API
    const checkSupport = () => {
      const hasScreenBrightness = 'screen' in navigator && 'brightness' in navigator.screen;
      setIsSupported(hasScreenBrightness);
      
      if (hasScreenBrightness) {
        try {
          // Intentar obtener el brillo actual
          navigator.screen.brightness.then(brightness => {
            setCurrentBrightness(brightness);
            setOriginalBrightness(brightness);
          }).catch(() => {
            // Si falla, usar fallback
            setIsSupported(false);
          });
        } catch (error) {
          setIsSupported(false);
        }
      }
    };

    checkSupport();
  }, []);

  // Crear overlay de dimming como fallback
  const createDimmingOverlay = (dimLevel) => {
    // Remover overlay existente si existe
    if (overlayRef.current) {
      document.body.removeChild(overlayRef.current);
      overlayRef.current = null;
    }

    if (dimLevel < 1) {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'black';
      overlay.style.opacity = (1 - dimLevel).toString();
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '9998'; // Debajo de cualquier modal pero encima del contenido
      overlay.style.transition = 'opacity 0.3s ease-in-out';
      overlay.setAttribute('data-brightness-overlay', 'true');

      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    }
  };

  // Función para establecer el brillo
  const setBrightness = async (brightness) => {
    try {
      // Asegurar que el valor esté entre 0.1 y 1
      const normalizedBrightness = Math.max(0.1, Math.min(1, brightness));
      
      if (isSupported && 'screen' in navigator && 'brightness' in navigator.screen) {
        // Usar Screen Brightness API si está disponible
        await navigator.screen.setBrightness(normalizedBrightness);
        setCurrentBrightness(normalizedBrightness);
        console.log(`🔅 Brillo establecido a ${Math.round(normalizedBrightness * 100)}% (API nativa)`);
      } else {
        // Usar overlay de dimming como fallback
        createDimmingOverlay(normalizedBrightness);
        setCurrentBrightness(normalizedBrightness);
        console.log(`🔅 Brillo establecido a ${Math.round(normalizedBrightness * 100)}% (overlay fallback)`);
      }
      
      return true;
    } catch (error) {
      console.error('Error estableciendo brillo:', error);
      // Intentar fallback si la API falla
      createDimmingOverlay(brightness);
      setCurrentBrightness(brightness);
      return false;
    }
  };

  // Función para dimear la pantalla al 50%
  const dimToHalf = async () => {
    return await setBrightness(0.5);
  };

  // Función para restaurar el brillo original
  const restoreOriginalBrightness = async () => {
    try {
      if (isSupported && 'screen' in navigator && 'brightness' in navigator.screen) {
        await navigator.screen.setBrightness(originalBrightness);
        setCurrentBrightness(originalBrightness);
        console.log(`🔆 Brillo restaurado a ${Math.round(originalBrightness * 100)}% (API nativa)`);
      } else {
        // Remover overlay
        if (overlayRef.current) {
          document.body.removeChild(overlayRef.current);
          overlayRef.current = null;
        }
        setCurrentBrightness(originalBrightness);
        console.log(`🔆 Brillo restaurado (overlay removido)`);
      }
      return true;
    } catch (error) {
      console.error('Error restaurando brillo:', error);
      // Intentar remover overlay como fallback
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
      setCurrentBrightness(originalBrightness);
      return false;
    }
  };

  // Función para incrementar/decrementar brillo
  const adjustBrightness = async (delta) => {
    const newBrightness = Math.max(0.1, Math.min(1, currentBrightness + delta));
    return await setBrightness(newBrightness);
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, []);

  return {
    currentBrightness,
    originalBrightness,
    isSupported,
    setBrightness,
    dimToHalf,
    restoreOriginalBrightness,
    adjustBrightness
  };
};
