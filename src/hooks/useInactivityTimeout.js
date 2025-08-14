import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para manejar el logout automático por inactividad
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 90 minutos)
 * @param {function} onTimeout - Función a ejecutar cuando se agote el tiempo
 * @param {boolean} isActive - Si el hook debe estar activo
 */
export const useInactivityTimeout = (
  timeout = 90 * 60 * 1000, // 90 minutos por defecto
  onTimeout,
  isActive = true
) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const warningModalTimeoutRef = useRef(null);

  // Crear modal de advertencia personalizado
  const createWarningModal = () => {
    return new Promise((resolve) => {
      // Crear elementos del modal
      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'inactivity-modal';
      modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: slideIn 0.3s ease-out;
      `;

      // Agregar animación CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      const title = document.createElement('h3');
      title.style.cssText = `
        color: #dc2626;
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
      `;
      title.textContent = '⚠️ Sesión por Expirar';

      const message = document.createElement('p');
      message.style.cssText = `
        color: #374151;
        margin-bottom: 1.5rem;
        line-height: 1.5;
      `;
      
      // Mensaje dinámico según el timeout
      if (timeout < 5 * 60 * 1000) {
        message.textContent = 'Tu sesión expirará en 20 segundos por inactividad. ¿Deseas continuar?';
      } else {
        message.textContent = 'Tu sesión expirará en 5 minutos por inactividad. ¿Deseas continuar?';
      }

      const countdown = document.createElement('div');
      countdown.style.cssText = `
        color: #dc2626;
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: center;
      `;

      const continueButton = document.createElement('button');
      continueButton.style.cssText = `
        background: #059669;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      continueButton.textContent = 'Continuar Sesión';
      continueButton.onmouseover = () => continueButton.style.background = '#047857';
      continueButton.onmouseout = () => continueButton.style.background = '#059669';

      const logoutButton = document.createElement('button');
      logoutButton.style.cssText = `
        background: #dc2626;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      logoutButton.textContent = 'Cerrar Sesión';
      logoutButton.onmouseover = () => logoutButton.style.background = '#b91c1c';
      logoutButton.onmouseout = () => logoutButton.style.background = '#dc2626';

      // Ensamblar el modal
      buttonContainer.appendChild(continueButton);
      buttonContainer.appendChild(logoutButton);
      modalContent.appendChild(title);
      modalContent.appendChild(message);
      modalContent.appendChild(countdown);
      modalContent.appendChild(buttonContainer);
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      // Variables para el countdown (20 segundos para pruebas, 5 minutos para producción)
      let timeLeft = timeout < 5 * 60 * 1000 ? 20 : 300; // 20 segundos o 5 minutos
      countdown.textContent = timeLeft > 60 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : `${timeLeft}s`;

      // Timer del countdown
      const countdownInterval = setInterval(() => {
        timeLeft--;
        
        // Formatear tiempo (mm:ss para minutos, ss para segundos)
        if (timeLeft > 60) {
          countdown.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        } else {
          countdown.textContent = `${timeLeft}s`;
        }
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          document.body.removeChild(modalOverlay);
          document.head.removeChild(style);
          resolve(false); // Auto-logout
        }
      }, 1000);

      // Event listeners para los botones
      continueButton.onclick = () => {
        clearInterval(countdownInterval);
        document.body.removeChild(modalOverlay);
        document.head.removeChild(style);
        resolve(true); // Continuar sesión
      };

      logoutButton.onclick = () => {
        clearInterval(countdownInterval);
        document.body.removeChild(modalOverlay);
        document.head.removeChild(style);
        resolve(false); // Logout inmediato
      };

      // Cleanup si se cierra desde fuera
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
          clearInterval(countdownInterval);
          document.body.removeChild(modalOverlay);
          document.head.removeChild(style);
          resolve(false); // Auto-logout si hace clic fuera
        }
      };
    });
  };

  // Reiniciar el temporizador
  const resetTimer = useCallback(() => {
    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (warningModalTimeoutRef.current) {
      clearTimeout(warningModalTimeoutRef.current);
    }

    if (!isActive || !onTimeout) return;

    // Timer de advertencia (5 minutos antes del logout para timeouts largos, 20 segundos para cortos)
    const warningOffset = timeout < 5 * 60 * 1000 ? 20000 : (5 * 60 * 1000); // 20 segundos para pruebas, 5 minutos normal
    const warningTime = timeout - warningOffset;
    
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(async () => {
        try {
          const shouldContinue = await createWarningModal();
          
          if (shouldContinue) {
            // Usuario decide continuar, reiniciar timer
            resetTimer();
          } else {
            // Usuario no respondió o decidió cerrar sesión
            onTimeout();
          }
        } catch (error) {
          console.error('Error mostrando modal de inactividad:', error);
          // En caso de error, cerrar sesión
          onTimeout();
        }
      }, warningTime);
    }

    // Timer principal de logout (sin advertencia adicional)
    timeoutRef.current = setTimeout(() => {
      // Si llegamos aquí, significa que el modal no se mostró correctamente
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
      if (warningModalTimeoutRef.current) {
        clearTimeout(warningModalTimeoutRef.current);
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
      if (warningModalTimeoutRef.current) {
        clearTimeout(warningModalTimeoutRef.current);
      }
    };
  }, [isActive, handleActivity, resetTimer]);

  // Función para resetear manualmente el timer (útil para acciones específicas)
  const resetInactivityTimer = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return { resetInactivityTimer };
};