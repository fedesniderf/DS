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
    console.log('🔄 useInactivityTimeout: Reseteando timer, isActive:', isActive, 'onTimeout:', !!onTimeout);
    
    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      console.log('🧹 useInactivityTimeout: Timer principal limpiado');
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      console.log('🧹 useInactivityTimeout: Timer de advertencia limpiado');
    }

    if (!isActive || !onTimeout) {
      console.log('❌ useInactivityTimeout: Hook inactivo o sin callback');
      return;
    }

    console.log('⏰ useInactivityTimeout: Configurando timers con timeout:', timeout / (1000 * 60), 'minutos');

    // Timer de advertencia (5 minutos antes del logout, o 10 segundos si el timeout es menor a 1 minuto)
    const warningOffset = timeout < 60000 ? 10000 : (5 * 60 * 1000); // 10 segundos para pruebas, 5 minutos normal
    const warningTime = timeout - warningOffset;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        console.log('⚠️ useInactivityTimeout: Mostrando advertencia de sesión');
        const warningMessage = timeout < 60000 
          ? `Tu sesión expirará en ${warningOffset / 1000} segundos por inactividad.\n\n¿Deseas continuar con tu sesión?`
          : 'Tu sesión expirará en 5 minutos por inactividad.\n\n¿Deseas continuar con tu sesión?';
        
        const shouldContinue = window.confirm(warningMessage);
        
        if (shouldContinue) {
          console.log('✅ useInactivityTimeout: Usuario eligió continuar');
          // Usuario decide continuar, reiniciar timer
          resetTimer();
        } else {
          console.log('🚪 useInactivityTimeout: Usuario eligió cerrar sesión');
          // Usuario acepta cerrar sesión inmediatamente
          onTimeout();
        }
      }, warningTime);
      console.log('⏰ useInactivityTimeout: Timer de advertencia configurado para', warningTime / 1000, 'segundos');
    }

    // Timer principal de logout
    timeoutRef.current = setTimeout(() => {
      console.log('🔒 useInactivityTimeout: Tiempo agotado, ejecutando logout automático');
      alert('Tu sesión ha expirado por inactividad.');
      onTimeout();
    }, timeout);
    console.log('⏰ useInactivityTimeout: Timer principal configurado para', timeout / (1000 * 60), 'minutos');
  }, [timeout, onTimeout, isActive]);

  // Eventos que indican actividad del usuario
  const handleActivity = useCallback(() => {
    if (isActive) {
      console.log('👆 useInactivityTimeout: Actividad detectada, reseteando timer');
      resetTimer();
    }
  }, [resetTimer, isActive]);

  useEffect(() => {
    console.log('🔧 useInactivityTimeout: useEffect ejecutado, isActive:', isActive);
    
    if (!isActive) {
      console.log('❌ useInactivityTimeout: Hook desactivado, limpiando timers');
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

    console.log('🎯 useInactivityTimeout: Configurando listeners para eventos:', events);

    // Iniciar el timer
    resetTimer();

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      console.log('🧹 useInactivityTimeout: Cleanup - removiendo listeners y timers');
      
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
