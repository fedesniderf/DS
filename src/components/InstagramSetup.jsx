import React, { useState, useEffect } from 'react';
import instagramService from '../services/instagramService';
import { INSTAGRAM_CONFIG, DEV_CONFIG, isConfigured, getAuthUrl, getConfigStatus } from '../config/instagramConfig';

const InstagramSetup = ({ onClose, currentUser }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [profileInfo, setProfileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(() => {
    // Verificar si se necesita configuración
    const configStatus = getConfigStatus();
    return configStatus.canConnect ? 1 : 'config';
  });
  const [syncStats, setSyncStats] = useState(null);

  // Configuración de Instagram OAuth
  const authUrl = getAuthUrl();
  const configStatus = getConfigStatus();

  useEffect(() => {
    checkConnection();
    
    // Escuchar mensaje del popup de autenticación
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
        handleAuthSuccess(event.data.accessToken, event.data.userId);
      } else if (event.data.type === 'INSTAGRAM_AUTH_ERROR') {
        setError('Error en la autenticación de Instagram');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      
      if (instagramService.isInstagramConnected()) {
        const isValid = await instagramService.validateToken();
        
        if (isValid) {
          const profile = await instagramService.getProfileInfo();
          setProfileInfo(profile);
          setIsConnected(true);
          setStep(2);
        } else {
          // Token inválido, desconectar
          instagramService.disconnect();
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error('Error verificando conexión:', error);
      setError('Error verificando la conexión con Instagram');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectInstagram = () => {
    // Verificar si está configurado correctamente
    if (!isConfigured()) {
      console.log('🧪 Activando modo demo - credenciales no configuradas');
      handleDemoMode();
      return;
    }

    if (!authUrl) {
      setError('❌ No se pudo generar la URL de autenticación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Abrir popup de Instagram OAuth
      const popup = window.open(
        authUrl,
        'instagram-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Verificar si el popup se abrió correctamente
      if (!popup) {
        throw new Error('No se pudo abrir la ventana de autenticación');
      }

      // Verificar si el popup se cerró sin completar la autenticación
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setLoading(false);
          // El usuario cerró el popup sin autenticarse
        }
      }, 1000);

      console.log('📱 Popup de Instagram abierto');
    } catch (err) {
      console.error('❌ Error al conectar Instagram:', err);
      setError('Error al abrir la autenticación de Instagram');
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (accessToken, userId) => {
    try {
      setLoading(true);
      setError('');
      
      // Configurar el servicio de Instagram
      instagramService.configure(accessToken, userId);
      
      // Obtener información del perfil
      const profile = await instagramService.getProfileInfo();
      setProfileInfo(profile);
      setIsConnected(true);
      setStep(2);
      
    } catch (error) {
      console.error('Error configurando Instagram:', error);
      setError('Error configurando la conexión con Instagram');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPosts = async () => {
    if (!currentUser?.id) {
      setError('Usuario no identificado');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStep(3);
      
      const result = await instagramService.syncInstagramPosts(currentUser.id);
      setSyncStats(result);
      
    } catch (error) {
      console.error('Error sincronizando posts:', error);
      setError('Error sincronizando posts de Instagram');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    instagramService.disconnect();
    setIsConnected(false);
    setProfileInfo(null);
    setStep(1);
    setSyncStats(null);
  };

  // Función para modo demo
  const handleDemoMode = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simular conexión con datos de demo de configuración
      const demoProfile = DEV_CONFIG.DEMO_PROFILE;
      
      // Configurar servicio con datos demo
      instagramService.configure('demo_token_123', demoProfile.id);
      setProfileInfo(demoProfile);
      setIsConnected(true);
      setStep(2);
      
    } catch (error) {
      setError('Error en modo demo');
    } finally {
      setLoading(false);
    }
  };

  // Función para simular sincronización demo
  const handleDemoSync = async () => {
    try {
      setLoading(true);
      setError('');
      setStep(3);
      
      // Simular resultado de sincronización
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular loading
      
      const demoStats = {
        imported: DEV_CONFIG.DEMO_POSTS.length,
        total: DEV_CONFIG.DEMO_PROFILE.media_count,
        newPosts: DEV_CONFIG.DEMO_POSTS
      };
      
      setSyncStats(demoStats);
      
    } catch (error) {
      setError('Error en sincronización demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
            Conectar Instagram
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step: Configuration Required */}
          {step === 'config' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración de Instagram Requerida
              </h3>
              
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Para conectar con Instagram necesitas configurar las credenciales de la API de Instagram. 
                Este es un proceso que debe hacer el desarrollador.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-blue-900 mb-3">📋 Pasos para configurar:</h4>
                <ol className="text-blue-800 text-sm space-y-2">
                  <li><strong>1.</strong> Crear app en Meta for Developers</li>
                  <li><strong>2.</strong> Configurar Instagram Basic Display</li>
                  <li><strong>3.</strong> Obtener Client ID y Client Secret</li>
                  <li><strong>4.</strong> Actualizar credenciales en el código</li>
                </ol>
                <p className="text-xs text-blue-600 mt-3">
                  📖 Ver <code>INSTAGRAM_INTEGRATION_GUIDE.md</code> para instrucciones detalladas
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDemoMode}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando modo demo...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Probar Modo Demo
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Volver
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-xs">
                  <strong>💡 Modo Demo:</strong> Te permite probar la funcionalidad sin credenciales reales. 
                  Los datos son simulados pero la interfaz funciona exactamente igual.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Connection Setup */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Conecta tu cuenta de Instagram
              </h3>
              
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Sincroniza automáticamente tus posts de Instagram con la Red Social DS. 
                Tus publicaciones aparecerán automáticamente en el feed.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">✨ Funcionalidades:</h4>
                <ul className="text-blue-800 text-sm space-y-1 text-left">
                  <li>• 📥 Importar automáticamente tus posts de Instagram</li>
                  <li>• 🔄 Sincronización bidireccional</li>
                  <li>• 📱 Preparar contenido para publicar en Instagram</li>
                  <li>• 🏷️ Hashtags automáticos relevantes</li>
                </ul>
              </div>

              <button
                onClick={handleConnectInstagram}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.90-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                    Conectar con Instagram
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4">
                Se abrirá una ventana de Instagram para autorizar la conexión
              </p>
            </div>
          )}

          {/* Step 2: Connection Success */}
          {step === 2 && isConnected && profileInfo && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Conexión exitosa!
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {profileInfo.username?.charAt(0)?.toUpperCase() || 'IG'}
                    </span>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">@{profileInfo.username}</p>
                <p className="text-sm text-gray-600">{profileInfo.account_type}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {profileInfo.media_count} publicaciones
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={!isConfigured() ? handleDemoSync : handleSyncPosts}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sincronizar Posts
                    </>
                  )}
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Desconectar Instagram
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sync Results */}
          {step === 3 && syncStats && (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sincronización completada
              </h3>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{syncStats.imported}</p>
                    <p className="text-sm text-purple-800">Posts importados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{syncStats.total}</p>
                    <p className="text-sm text-purple-800">Posts analizados</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                {syncStats.imported > 0 
                  ? `Se importaron ${syncStats.imported} nuevas publicaciones a tu feed de DS.`
                  : 'No se encontraron publicaciones nuevas para importar.'
                }
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Volver a opciones
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ver posts en el feed
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstagramSetup;
