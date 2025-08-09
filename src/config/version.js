/**
 * DS Training Management System - Version Configuration
 * 
 * Este archivo contiene la configuración de versionado y metadatos del proyecto.
 * Se actualiza automáticamente con cada release.
 */

export const VERSION_CONFIG = {
  // Información actual de la versión
  current: {
    version: '3.0.0',
    name: 'Complete Settings Menu',
    release_date: '2025-08-08',
    stability: 'stable'
  },

  // Información del proyecto
  project: {
    name: 'DS Training Management System',
    description: 'Sistema de gestión de entrenamiento con menú de configuración completo',
    author: 'fedesniderf',
    repository: 'DS',
    license: 'Private'
  },

  // API de versiones para compatibilidad
  api: {
    version: '3',
    compatibility: ['3.x.x'],
    breaking_changes: [
      '3.0.0 - Migración de SimpleSettingsMenu a SettingsMenu'
    ]
  },

  // Features disponibles en esta versión
  features: {
    settings_menu: {
      version: '3.0.0',
      enabled: true,
      components: [
        'SettingsMenu',
        'ChangePasswordModal', 
        'SecurityInfoModal',
        'BlockedUsersPanel',
        'PhotoUpdateModal',
        'EditUserModal'
      ]
    },
    wake_lock: {
      version: '3.0.0',
      enabled: true,
      enhanced: true,
      hook: 'useEnhancedWakeLock'
    },
    notifications: {
      version: '2.0.0',
      enabled: true,
      component: 'NotificationCenter'
    },
    social_feed: {
      version: '2.0.0', 
      enabled: true,
      restricted: true
    }
  },

  // Configuración de desarrollo
  development: {
    hot_reload: true,
    source_maps: true,
    debug_mode: true,
    console_logs: true
  },

  // URLs y endpoints
  urls: {
    local: 'http://localhost:3000',
    network: 'http://192.168.0.155:3000',
    production: null // Se configura en deploy
  },

  // Dependencias críticas
  dependencies: {
    react: '^18.0.0',
    supabase: '^2.51.0',
    tailwindcss: '^3.4.1',
    'react-router-dom': '^7.7.0'
  }
};

// Función para obtener información de versión en runtime
export const getVersionInfo = () => {
  return {
    version: VERSION_CONFIG.current.version,
    build_date: VERSION_CONFIG.current.release_date,
    features: Object.keys(VERSION_CONFIG.features).filter(
      key => VERSION_CONFIG.features[key].enabled
    ),
    api_version: VERSION_CONFIG.api.version
  };
};

// Función para verificar compatibilidad
export const isCompatible = (requiredVersion) => {
  const current = VERSION_CONFIG.current.version;
  const [currentMajor] = current.split('.');
  const [requiredMajor] = requiredVersion.split('.');
  
  return currentMajor === requiredMajor;
};

// Exportar versión como default
export default VERSION_CONFIG.current.version;
