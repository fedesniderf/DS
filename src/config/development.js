/**
 * DS Training Management System - Configuración de Desarrollo
 * v3.0.0
 * 
 * Este archivo contiene utilidades y configuraciones para facilitar
 * el desarrollo y mantenimiento del proyecto.
 */

import { VERSION_CONFIG } from './version.js';

// Configuración de debugging
export const DEBUG_CONFIG = {
  enabled: true,
  level: 'info', // 'debug', 'info', 'warn', 'error'
  components: {
    auth: true,
    settings: true,
    notifications: true,
    wake_lock: true,
    routing: false
  }
};

// Logger personalizado para desarrollo
export const logger = {
  debug: (component, message, data = null) => {
    if (!DEBUG_CONFIG.enabled || !DEBUG_CONFIG.components[component]) return;
    
    console.group(`🔧 [${component.toUpperCase()}] ${message}`);
    if (data) console.log(data);
    console.groupEnd();
  },
  
  info: (component, message, data = null) => {
    if (!DEBUG_CONFIG.enabled) return;
    
    console.log(`ℹ️ [${component.toUpperCase()}] ${message}`, data || '');
  },
  
  warn: (component, message, data = null) => {
    console.warn(`⚠️ [${component.toUpperCase()}] ${message}`, data || '');
  },
  
  error: (component, message, error = null) => {
    console.error(`❌ [${component.toUpperCase()}] ${message}`, error || '');
  },
  
  success: (component, message, data = null) => {
    console.log(`✅ [${component.toUpperCase()}] ${message}`, data || '');
  }
};

// Utilidades de desarrollo
export const devUtils = {
  // Mostrar información del proyecto en consola
  showProjectInfo: () => {
    console.group('🚀 DS Training Management System');
    console.log(`Versión: ${VERSION_CONFIG.current.version}`);
    console.log(`Nombre: ${VERSION_CONFIG.current.name}`);
    console.log(`Fecha: ${VERSION_CONFIG.current.release_date}`);
    console.log(`API: v${VERSION_CONFIG.api.version}`);
    console.log('Features:', Object.keys(VERSION_CONFIG.features).filter(
      key => VERSION_CONFIG.features[key].enabled
    ));
    console.groupEnd();
  },
  
  // Verificar estado de componentes críticos
  checkComponents: () => {
    const components = [
      'SettingsMenu',
      'LayoutHeader', 
      'AuthForm',
      'NotificationCenter'
    ];
    
    console.group('🔍 Estado de Componentes');
    components.forEach(component => {
      try {
        // Verificar si el componente existe en el DOM o en el contexto
        const exists = document.querySelector(`[data-component="${component}"]`) !== null;
        console.log(`${exists ? '✅' : '❌'} ${component}`);
      } catch (error) {
        console.log(`❓ ${component} - No se pudo verificar`);
      }
    });
    console.groupEnd();
  },
  
  // Mostrar estadísticas de rendimiento
  showPerformanceStats: () => {
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      console.group('⚡ Estadísticas de Rendimiento');
      console.log(`Carga DOM: ${Math.round(navigation.domContentLoadedEventEnd)} ms`);
      console.log(`Carga completa: ${Math.round(navigation.loadEventEnd)} ms`);
      console.log(`Tiempo de navegación: ${Math.round(navigation.responseEnd - navigation.requestStart)} ms`);
      console.groupEnd();
    }
  },
  
  // Limpiar localStorage para testing
  clearStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
    logger.success('dev', 'Storage limpiado para testing');
  },
  
  // Simular diferentes estados de usuario
  simulateUserStates: {
    admin: () => {
      localStorage.setItem('userRole', 'admin');
      logger.info('dev', 'Simulando usuario admin');
    },
    
    client: () => {
      localStorage.setItem('userRole', 'client');
      logger.info('dev', 'Simulando usuario cliente');
    },
    
    guest: () => {
      localStorage.removeItem('userRole');
      logger.info('dev', 'Simulando usuario invitado');
    }
  }
};

// Configuración de hot reload para desarrollo
export const HOT_RELOAD_CONFIG = {
  enabled: true,
  watchFiles: [
    'src/components/**/*.js',
    'src/components/**/*.jsx',
    'src/config/**/*.js',
    'src/utils/**/*.js'
  ],
  excludeFiles: [
    'node_modules/**',
    'build/**',
    'public/**'
  ]
};

// Configuración de testing
export const TEST_CONFIG = {
  mock_data: true,
  auto_login: false,
  skip_animations: true,
  test_user: {
    email: 'test@example.com',
    password: 'testpassword123',
    role: 'admin'
  }
};

// Comandos de desarrollo disponibles en consola
export const devCommands = {
  // Mostrar ayuda
  help: () => {
    console.group('📚 Comandos de Desarrollo Disponibles');
    console.log('devUtils.showProjectInfo() - Info del proyecto');
    console.log('devUtils.checkComponents() - Estado de componentes');
    console.log('devUtils.showPerformanceStats() - Estadísticas de rendimiento');
    console.log('devUtils.clearStorage() - Limpiar localStorage');
    console.log('devUtils.simulateUserStates.admin() - Simular admin');
    console.log('devUtils.simulateUserStates.client() - Simular cliente');
    console.log('devCommands.toggleDebug() - Activar/desactivar debug');
    console.log('devCommands.exportLogs() - Exportar logs de debug');
    console.groupEnd();
  },
  
  // Toggle debug mode
  toggleDebug: () => {
    DEBUG_CONFIG.enabled = !DEBUG_CONFIG.enabled;
    logger.info('dev', `Debug ${DEBUG_CONFIG.enabled ? 'activado' : 'desactivado'}`);
  },
  
  // Exportar logs para análisis
  exportLogs: () => {
    const logs = {
      timestamp: new Date().toISOString(),
      version: VERSION_CONFIG.current.version,
      performance: window.performance ? {
        navigation: performance.getEntriesByType('navigation')[0],
        timing: performance.timing
      } : null,
      localStorage: { ...localStorage },
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ds-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.success('dev', 'Logs exportados correctamente');
  }
};

// Inicialización automática en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Mostrar info del proyecto al cargar
  setTimeout(() => {
    devUtils.showProjectInfo();
    console.log('💡 Escribe devCommands.help() para ver comandos disponibles');
  }, 1000);
  
  // Hacer utilidades disponibles globalmente en desarrollo
  window.devUtils = devUtils;
  window.devCommands = devCommands;
  window.logger = logger;
}

export default {
  DEBUG_CONFIG,
  logger,
  devUtils,
  devCommands,
  HOT_RELOAD_CONFIG,
  TEST_CONFIG
};
