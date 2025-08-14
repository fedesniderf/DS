// 🔐 Configuración de Instagram API
// Este archivo contiene las credenciales para la integración con Instagram

// ==========================================
// INSTRUCCIONES DE CONFIGURACIÓN
// ==========================================

/*
Para obtener estas credenciales:

1. 🌐 Ir a Meta for Developers: https://developers.facebook.com/
2. 📱 Crear nueva app (tipo "Consumer")
3. ➕ Agregar producto "Instagram Basic Display"
4. ⚙️ Configurar:
   - Valid OAuth Redirect URIs: https://tu-dominio.com/instagram-callback.html
   - Deauthorize Callback URL: https://tu-dominio.com/
5. 📋 Copiar credenciales aquí abajo
6. 🚀 ¡Listo para usar!

📖 Ver INSTAGRAM_INTEGRATION_GUIDE.md para instrucciones detalladas
*/

// ==========================================
// CREDENCIALES (REEMPLAZAR CON TUS VALORES)
// ==========================================

export const INSTAGRAM_CONFIG = {
  // 🆔 App ID de Meta for Developers
  APP_ID: 'TU_APP_ID_AQUI', // ⚠️ REEMPLAZAR
  
  // 🔑 Client ID de Instagram Basic Display
  CLIENT_ID: 'TU_CLIENT_ID_AQUI', // ⚠️ REEMPLAZAR
  
  // 🔒 Client Secret de Instagram Basic Display
  CLIENT_SECRET: 'TU_CLIENT_SECRET_AQUI', // ⚠️ REEMPLAZAR
  
  // 🔗 URL de callback (actualizar con tu dominio)
  REDIRECT_URI: `${window.location.origin}/instagram-callback.html`,
  
  // 📋 Scopes requeridos
  SCOPES: 'user_profile,user_media',
  
  // 🌐 URLs de la API
  AUTH_URL: 'https://api.instagram.com/oauth/authorize',
  TOKEN_URL: 'https://api.instagram.com/oauth/access_token',
  GRAPH_URL: 'https://graph.instagram.com'
};

// ==========================================
// VALIDACIÓN DE CONFIGURACIÓN
// ==========================================

export const isConfigured = () => {
  return (
    INSTAGRAM_CONFIG.APP_ID !== 'TU_APP_ID_AQUI' &&
    INSTAGRAM_CONFIG.CLIENT_ID !== 'TU_CLIENT_ID_AQUI' &&
    INSTAGRAM_CONFIG.CLIENT_SECRET !== 'TU_CLIENT_SECRET_AQUI'
  );
};

export const getAuthUrl = () => {
  if (!isConfigured()) {
    return null; // Modo demo
  }
  
  const params = new URLSearchParams({
    client_id: INSTAGRAM_CONFIG.CLIENT_ID,
    redirect_uri: INSTAGRAM_CONFIG.REDIRECT_URI,
    scope: INSTAGRAM_CONFIG.SCOPES,
    response_type: 'code'
  });
  
  return `${INSTAGRAM_CONFIG.AUTH_URL}?${params.toString()}`;
};

// ==========================================
// CONFIGURACIÓN DE DESARROLLO
// ==========================================

export const DEV_CONFIG = {
  // 🧪 Modo demo habilitado cuando no hay credenciales
  DEMO_MODE: !isConfigured(),
  
  // 📊 Datos de demo para testing
  DEMO_PROFILE: {
    id: 'demo_user_instagram',
    username: 'ds_entrenamiento_demo',
    account_type: 'PERSONAL',
    media_count: 25
  },
  
  // 🎭 Posts de demo simulados
  DEMO_POSTS: [
    {
      id: 'demo_post_1',
      caption: '💪 Entrenamiento de pecho completado! #gym #fitness #DSEntrenamiento',
      media_type: 'IMAGE',
      media_url: 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Demo+Post+1',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // Ayer
      permalink: 'https://www.instagram.com/p/demo1'
    },
    {
      id: 'demo_post_2', 
      caption: '🏃‍♂️ Cardio matutino! Siempre es un buen día para entrenar. #cardio #morning #DSEntrenamiento',
      media_type: 'IMAGE',
      media_url: 'https://via.placeholder.com/400x400/059669/ffffff?text=Demo+Post+2',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
      permalink: 'https://www.instagram.com/p/demo2'
    },
    {
      id: 'demo_post_3',
      caption: '🎯 Nueva PR en sentadillas! Progreso constante con DS Entrenamiento 💯 #squat #pr #DSEntrenamiento #progress',
      media_type: 'IMAGE', 
      media_url: 'https://via.placeholder.com/400x400/dc2626/ffffff?text=Demo+Post+3',
      timestamp: new Date(Date.now() - 259200000).toISOString(), // Hace 3 días
      permalink: 'https://www.instagram.com/p/demo3'
    }
  ]
};

// ==========================================
// UTILIDADES
// ==========================================

export const getConfigStatus = () => {
  if (isConfigured()) {
    return {
      status: 'configured',
      message: '✅ Instagram está configurado correctamente',
      canConnect: true
    };
  } else {
    return {
      status: 'needs_config',
      message: '⚙️ Se requiere configuración de Instagram',
      canConnect: false,
      demoAvailable: true
    };
  }
};

export default INSTAGRAM_CONFIG;
