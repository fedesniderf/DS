import { useEffect } from 'react';

// Variable global para contar cuántos componentes están usando el scroll lock
let lockCount = 0;
let savedScrollPosition = { x: 0, y: 0 };
let originalBodyStyle = {};
let originalHtmlStyle = {};

/**
 * Hook personalizado para bloquear/desbloquear el scroll de la página
 * @param {boolean} isLocked - Si true, bloquea el scroll; si false, lo permite
 */
export const useScrollLock = (isLocked) => {
  useEffect(() => {
    console.log('🔒 useScrollLock - Estado cambiado:', isLocked, 'lockCount actual:', lockCount);
    
    if (isLocked) {
      console.log('🔒 useScrollLock - ACTIVANDO bloqueo de scroll');
      
      // Solo aplicar el bloqueo si es el primer componente que lo solicita
      if (lockCount === 0) {
        console.log('🔒 useScrollLock - Primer bloqueo, guardando estado original');
        try {
          // Guardar la posición actual del scroll
          savedScrollPosition.x = window.scrollX;
          savedScrollPosition.y = window.scrollY;
        
        // Guardar estilos originales
        originalBodyStyle = {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          top: document.body.style.top,
          left: document.body.style.left,
          width: document.body.style.width,
          height: document.body.style.height
        };
        
        originalHtmlStyle = {
          overflow: document.documentElement.style.overflow
        };
        
        // Función para prevenir scroll - pero permitir en elementos scrollables
        const preventDefault = (e) => {
          // Permitir scroll en elementos con clase cronometer-scroll o dentro del modal del cronómetro
          let target = e.target;
          while (target && target !== document) {
            if (target.classList && (
              target.classList.contains('cronometer-scroll') || 
              target.id === 'cronometer-content' ||
              target.closest('.cronometer-scroll')
            )) {
              return; // Permitir el scroll en este elemento
            }
            target = target.parentElement;
          }
          
          e.preventDefault();
          e.stopPropagation();
          return false;
        };
        
        // Función especial para touchmove que es más permisiva
        const preventTouchMove = (e) => {
          // Permitir scroll en elementos scrollables del cronómetro
          let target = e.target;
          while (target && target !== document) {
            if (target.classList && (
              target.classList.contains('cronometer-scroll') || 
              target.id === 'cronometer-content'
            )) {
              // Verificar si el elemento realmente puede hacer scroll
              const canScrollVertically = target.scrollHeight > target.clientHeight;
              if (canScrollVertically) {
                return; // Permitir el scroll
              }
            }
            target = target.parentElement;
          }
          
          e.preventDefault();
          e.stopPropagation();
          return false;
        };
        
        const preventDefaultForScrollKeys = (e) => {
          // Permitir teclas de scroll en elementos cronometer-scroll
          if (document.activeElement && document.activeElement.closest('.cronometer-scroll')) {
            return;
          }
          
          const scrollKeys = {37: 1, 38: 1, 39: 1, 40: 1, 33: 1, 34: 1, 35: 1, 36: 1};
          if (scrollKeys[e.keyCode]) {
            preventDefault(e);
            return false;
          }
        };
        
        // Aplicar bloqueo completo
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollPosition.y}px`;
        document.body.style.left = `-${savedScrollPosition.x}px`;
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        
        // También bloquear el html
        document.documentElement.style.overflow = 'hidden';
        
        // Prevenir eventos de scroll
        window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.addEventListener('wheel', preventDefault, { passive: false });
        window.addEventListener('mousewheel', preventDefault, { passive: false });
        window.addEventListener('touchmove', preventTouchMove, { passive: false });
        window.addEventListener('keydown', preventDefaultForScrollKeys, false);
        
        // Guardar las funciones para poder removerlas después
        window.scrollLockPreventDefault = preventDefault;
        window.scrollLockPreventTouchMove = preventTouchMove;
        window.scrollLockPreventDefaultForScrollKeys = preventDefaultForScrollKeys;
        } catch (error) {
          console.error('🔒 Error aplicando scroll lock:', error);
        }
      }
      
      // Incrementar el contador
      lockCount++;
      console.log('🔒 useScrollLock - lockCount incrementado a:', lockCount);
      
      // Cleanup: decrementar contador cuando se desbloquea
      return () => {
        console.log('🔒 useScrollLock - DESACTIVANDO bloqueo de scroll');
        lockCount--;
        console.log('🔒 useScrollLock - lockCount decrementado a:', lockCount);
        
        // Solo restaurar si es el último componente que libera el lock
        if (lockCount === 0) {
          console.log('🔒 useScrollLock - Último bloqueo liberado, restaurando scroll');
          
          try {
          // Remover event listeners
          if (window.scrollLockPreventDefault) {
            window.removeEventListener('DOMMouseScroll', window.scrollLockPreventDefault, false);
            window.removeEventListener('wheel', window.scrollLockPreventDefault, false);
            window.removeEventListener('mousewheel', window.scrollLockPreventDefault, false);
          }
          
          if (window.scrollLockPreventTouchMove) {
            window.removeEventListener('touchmove', window.scrollLockPreventTouchMove, false);
          }
          
          if (window.scrollLockPreventDefaultForScrollKeys) {
            window.removeEventListener('keydown', window.scrollLockPreventDefaultForScrollKeys, false);
          }
          
          // Restaurar estilos originales
          document.body.style.overflow = originalBodyStyle.overflow || '';
          document.body.style.position = originalBodyStyle.position || '';
          document.body.style.top = originalBodyStyle.top || '';
          document.body.style.left = originalBodyStyle.left || '';
          document.body.style.width = originalBodyStyle.width || '';
          document.body.style.height = originalBodyStyle.height || '';
          
          document.documentElement.style.overflow = originalHtmlStyle.overflow || '';
          
          // Restaurar la posición del scroll
          window.scrollTo(savedScrollPosition.x, savedScrollPosition.y);
          console.log('🔒 useScrollLock - Scroll restaurado a posición:', savedScrollPosition);
          
          // Limpiar referencias
          delete window.scrollLockPreventDefault;
          delete window.scrollLockPreventTouchMove;
          delete window.scrollLockPreventDefaultForScrollKeys;
          } catch (error) {
            console.error('🔒 Error restaurando scroll:', error);
            // Forzar restauración básica en caso de error
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.documentElement.style.overflow = '';
          }
        }
      };
    } else {
      console.log('🔒 useScrollLock - Modal cerrado, no hay bloqueo activo');
    }
  }, [isLocked]);
};

export default useScrollLock;
