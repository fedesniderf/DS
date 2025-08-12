import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para manejar el logout automático por inactividad
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 2 horas)
 * @param {function} onTimeout - Función a ejecutar cuando se agote el tiempo
 * @param {boolean} isActive - Si el hook debe estar activo
 */
export const useInactivityTimeout = (
  timeout = 2 * 60 * 60 * 1000, // 2 horas por defecto
  onTimeout,
  isActive = true
) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Reiniciar el temporizador
  const resetTimer = useCallback(() => {
    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (!isActive || !onTimeout) return;

    // Timer de advertencia (5 minutos antes del logout, o 10 segundos si el timeout es menor a 1 minuto)
    const warningOffset = timeout < 60000 ? 10000 : (5 * 60 * 1000); // 10 segundos para pruebas, 5 minutos normal
    const warningTime = timeout - warningOffset;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        const warningMessage = timeout < 60000 
          ? `Tu sesión expirará en ${warningOffset / 1000} segundos por inactividad.\n\n¿Deseas continuar con tu sesión?`
          : 'Tu sesión expirará en 5 minutos por inactividad.\n\n¿Deseas continuar con tu sesión?';
        
        const shouldContinue = window.confirm(warningMessage);
        
        if (shouldContinue) {
          // Usuario decide continuar, reiniciar timer
          resetTimer();
        } else {
          // Usuario acepta cerrar sesión inmediatamente
          onTimeout();
        }
      }, warningTime);
    }

    // Timer principal de logout
    timeoutRef.current = setTimeout(() => {
      alert('Tu sesión ha expirado por inactividad.');
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout, isActive]);

  // Eventos que indican actividad del usuario
  const handleActivity = useCallback(() => {
    if (isActive) {
      resetTimer();
    }
  }, [resetTimer, isActive]);

  useEffect(() => {
    if (!isActive) {
      // Limpiar timers si el hook se desactiva
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }

    // Lista de eventos que indican actividad
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Iniciar el timer
    resetTimer();

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      // Remover listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Limpiar timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isActive, handleActivity, resetTimer]);

  // Función para resetear manualmente el timer (útil para acciones específicas)
  const resetInactivityTimer = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return { resetInactivityTimer };
};
