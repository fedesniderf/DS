/**
 * Configuración de la Guía de Usuario
 * 
 * Para habilitar/deshabilitar la guía de usuario en toda la aplicación
 */

export const USER_GUIDE_CONFIG = {
  // Cambiar a true para habilitar la guía de usuario
  ENABLED: false,
  
  // Versión actual de la guía (incrementar cuando se añadan nuevas funciones)
  VERSION: '3.0.4',
  
  // Configuración de timeouts y delays
  TIMEOUTS: {
    // Tiempo antes de mostrar la guía al cargar la página (ms)
    INITIAL_DELAY: 1000,
    
    // Tiempo para resaltar elementos (ms)
    HIGHLIGHT_DELAY: 800,
    
    // Tiempo entre pasos (ms)
    STEP_TRANSITION: 100,
    
    // Tiempo adicional para móvil (ms)
    MOBILE_EXTRA_DELAY: 300
  },
  
  // Configuración de z-index
  Z_INDEX: {
    OVERLAY: 2147483646,
    TOOLTIP: 2147483647,
    HIGHLIGHTED_ELEMENT: 2147483645,
    HIGHLIGHTED_ELEMENT_MOBILE: 2147483645
  },
  
  // Breakpoint para móvil (px)
  MOBILE_BREAKPOINT: 768,
  
  // Configuración de dimensiones
  DIMENSIONS: {
    DESKTOP: {
      TOOLTIP_WIDTH: 320,
      TOOLTIP_HEIGHT: 280,
      TOOLTIP_PADDING: 24
    },
    MOBILE: {
      TOOLTIP_WIDTH: '90vw',
      TOOLTIP_HEIGHT: '80vh',
      TOOLTIP_PADDING: 16
    }
  }
};

/**
 * Función para verificar si la guía debe mostrarse
 * @param {Object} user - Objeto del usuario actual
 * @returns {boolean} - true si la guía debe mostrarse
 */
export const shouldShowGuide = (user) => {
  // Si la guía está deshabilitada globalmente, no mostrar
  if (!USER_GUIDE_CONFIG.ENABLED) {
    return false;
  }
  
  // Solo mostrar para usuarios client
  if (!user || user.role !== 'client') {
    return false;
  }
  
  const guideCompleted = localStorage.getItem('ds-guide-completed');
  const guideSkipped = localStorage.getItem('ds-guide-skipped');
  const guideVersion = localStorage.getItem('ds-guide-version');
  
  // Mostrar guía si:
  // 1. Es un usuario nuevo (nunca completó ni saltó la guía)
  // 2. Hay una nueva versión con funcionalidades nuevas
  if (!guideCompleted && !guideSkipped) {
    return true;
  }
  
  if (guideVersion !== USER_GUIDE_CONFIG.VERSION) {
    // Nueva versión - resetear estados para mostrar nuevas funciones
    localStorage.removeItem('ds-guide-completed');
    localStorage.removeItem('ds-guide-skipped');
    return true;
  }
  
  return false;
};

/**
 * Función para verificar si es un dispositivo móvil
 * @returns {boolean} - true si es móvil
 */
export const isMobileDevice = () => {
  return window.innerWidth <= USER_GUIDE_CONFIG.MOBILE_BREAKPOINT;
};

/**
 * Función para obtener la configuración de timeouts
 * @returns {Object} - Configuración de timeouts
 */
export const getTimeouts = () => {
  const base = USER_GUIDE_CONFIG.TIMEOUTS;
  const isMobile = isMobileDevice();
  
  return {
    ...base,
    HIGHLIGHT_DELAY: base.HIGHLIGHT_DELAY + (isMobile ? base.MOBILE_EXTRA_DELAY : 0)
  };
};

/**
 * Función para marcar la guía como completada
 */
export const markGuideAsCompleted = () => {
  localStorage.setItem('ds-guide-completed', 'true');
  localStorage.setItem('ds-guide-version', USER_GUIDE_CONFIG.VERSION);
};

/**
 * Función para marcar la guía como saltada
 */
export const markGuideAsSkipped = () => {
  localStorage.setItem('ds-guide-skipped', 'true');
  localStorage.setItem('ds-guide-version', USER_GUIDE_CONFIG.VERSION);
};

/**
 * Función para resetear el estado de la guía
 */
export const resetGuideState = () => {
  localStorage.removeItem('ds-guide-completed');
  localStorage.removeItem('ds-guide-skipped');
  localStorage.removeItem('ds-guide-version');
};
