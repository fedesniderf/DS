import React, { useState, useEffect } from 'react';
import { NotificationService } from '../services/NotificationService';

const NotificationCenter = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTestMenu, setShowTestMenu] = useState(false);

  useEffect(() => {
    if (currentUser?.id || currentUser?.client_id) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.id || currentUser?.client_id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const result = await NotificationService.getUserNotifications(userId);
      
      // El servicio devuelve { success: true, notifications: data }
      const data = result?.success ? result.notifications : [];
      
      setNotifications(data || []);
      
      const unread = data?.filter(n => !n.read)?.length || 0;
      setUnreadCount(unread);
      
      console.log('📈 Notificaciones cargadas:', data?.length || 0, 'total,', unread, 'no leídas');
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      await loadNotifications(); // Recargar para actualizar el estado
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = currentUser?.id || currentUser?.client_id;
      if (!userId) return;

      await NotificationService.markAllAsRead(userId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Función de prueba para crear notificaciones
  const createTestNotification = async () => {
    try {
      const userId = currentUser?.id || currentUser?.client_id;
      if (!userId) {
        console.error('No user ID found for test notification');
        return;
      }
      
      const result = await NotificationService.createNotification({
        userId,
        adminId: userId, // Usar el mismo ID como admin para prueba
        type: 'routine_created',
        title: '🧪 Notificación de Prueba',
        message: 'Esta es una notificación de prueba creada desde el centro de notificaciones.',
        sendEmail: false
      });
      
      if (result.success) {
        await loadNotifications(); // Recargar notificaciones
        console.log('✅ Notificación de prueba creada exitosamente');
      } else {
        console.error('❌ Error creando notificación de prueba:', result.error);
      }
    } catch (error) {
      console.error('💥 Error en createTestNotification:', error);
    }
  };

  // Función para verificar rutinas próximas a vencer (solo para admins)
  const checkExpiringRoutines = async () => {
    try {
      if (currentUser?.role !== 'admin') {
        alert('Solo los administradores pueden verificar rutinas próximas a vencer');
        return;
      }

      console.log('🔍 Verificando rutinas próximas a vencer...');
      const result = await NotificationService.checkExpiringRoutines();
      
      if (result.success) {
        await loadNotifications(); // Recargar notificaciones
        alert(`Verificación completada. Se revisaron ${result.checked} rutinas y se enviaron ${result.notifications} notificaciones.`);
      } else {
        alert('Error verificando rutinas: ' + result.error);
      }
    } catch (error) {
      console.error('Error en checkExpiringRoutines:', error);
      alert('Error inesperado al verificar rutinas');
    }
  };

  // Función para crear rutinas de prueba próximas a vencer
  const createTestExpiringRoutines = async () => {
    try {
      if (currentUser?.role !== 'admin') {
        alert('Solo los administradores pueden crear rutinas de prueba');
        return;
      }

      if (!confirm('¿Crear rutinas de prueba próximas a vencer? Esto creará 3 rutinas de ejemplo para testing.')) {
        return;
      }

      console.log('🧪 Creando rutinas de prueba...');
      const { createTestExpiringRoutines } = await import('../utils/testRoutineExpiration');
      const result = await createTestExpiringRoutines();
      
      if (result.success) {
        alert(`Rutinas de prueba creadas exitosamente. Se crearon ${result.routines.length} rutinas para el cliente ${result.client.email}`);
      } else {
        alert('Error creando rutinas de prueba: ' + result.error);
      }
    } catch (error) {
      console.error('Error creando rutinas de prueba:', error);
      alert('Error inesperado al crear rutinas de prueba');
    }
  };

  // Función para limpiar rutinas de prueba
  const cleanTestRoutines = async () => {
    try {
      if (currentUser?.role !== 'admin') {
        alert('Solo los administradores pueden limpiar rutinas de prueba');
        return;
      }

      if (!confirm('¿Eliminar todas las rutinas de prueba?')) {
        return;
      }

      console.log('🧹 Limpiando rutinas de prueba...');
      const { cleanTestRoutines } = await import('../utils/testRoutineExpiration');
      const result = await cleanTestRoutines();
      
      if (result.success) {
        alert(`Rutinas de prueba eliminadas. Se eliminaron ${result.deleted?.length || 0} rutinas.`);
      } else {
        alert('Error eliminando rutinas de prueba: ' + result.error);
      }
    } catch (error) {
      console.error('Error eliminando rutinas de prueba:', error);
      alert('Error inesperado al eliminar rutinas de prueba');
    }
  };

  // Función para probar envío de email
  const testEmailNotification = async () => {
    try {
      if (!currentUser?.email) {
        alert('Tu usuario no tiene email configurado para la prueba');
        return;
      }

      if (!confirm(`¿Enviar email de prueba a ${currentUser.email}?`)) {
        return;
      }

      console.log('📧 Enviando email de prueba...');
      const { default: EmailService } = await import('../services/EmailService');
      const result = await EmailService.sendTestEmail({
        to: currentUser.email
      });
      
      if (result.success) {
        alert(`Email de prueba enviado exitosamente a ${currentUser.email}`);
      } else {
        alert('Error enviando email de prueba: ' + result.error);
      }
    } catch (error) {
      console.error('Error enviando email de prueba:', error);
      alert('Error inesperado al enviar email de prueba');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'routine_created':
        return '🎯';
      case 'routine_assigned':
        return '📋';
      case 'routine_updated':
        return '🔄';
      case 'routine_expiring':
        return '⏰';
      default:
        return '📢';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadNotifications();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Versión móvil - Panel full screen */}
          <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header móvil */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={createTestNotification}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  title="Crear notificación de prueba"
                >
                  🧪 Prueba
                </button>
                {currentUser?.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTestMenu(!showTestMenu)}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                      title="Herramientas de testing para rutinas"
                    >
                      ⚙️ Testing
                    </button>
                    {showTestMenu && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                        <button
                          onClick={() => {
                            checkExpiringRoutines();
                            setShowTestMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100"
                        >
                          ⏰ Verificar rutinas
                        </button>
                        <button
                          onClick={() => {
                            createTestExpiringRoutines();
                            setShowTestMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100"
                        >
                          🧪 Crear rutinas prueba
                        </button>
                        <button
                          onClick={() => {
                            cleanTestRoutines();
                            setShowTestMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-red-600"
                        >
                          🧹 Limpiar pruebas
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lista de notificaciones móvil */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Cargando notificaciones...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No tienes notificaciones
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(notification.created_at)}
                          </span>
                          {notification.routine?.name && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {notification.routine.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer móvil */}
            {notifications.length > 0 && (
              <div className="flex-shrink-0 p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>

          {/* Versión desktop - Panel dropdown */}
          <div className="hidden md:block absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notificaciones</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={createTestNotification}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  title="Crear notificación de prueba"
                >
                  🧪
                </button>
                {currentUser?.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTestMenu(!showTestMenu)}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                      title="Herramientas de testing para rutinas"
                    >
                      ⚙️
                    </button>
                    {showTestMenu && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                        <button
                          onClick={() => {
                            checkExpiringRoutines();
                            setShowTestMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100"
                        >
                          ⏰ Verificar rutinas
                        </button>
                        <button
                          onClick={() => {
                            createTestExpiringRoutines();
                            setShowTestMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100"
                        >
                          🧪 Crear rutinas prueba
                        </button>
                        <button
                          onClick={() => {
                            cleanTestRoutines();
                            setShowTestMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-red-600"
                        >
                          🧹 Limpiar pruebas
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Cargando notificaciones...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No tienes notificaciones
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(notification.created_at)}
                          </span>
                          {notification.routine?.name && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {notification.routine.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Aquí puedes agregar navegación a una página completa de notificaciones
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setShowTestMenu(false);
          }}
        />
      )}

      {/* Overlay para cerrar menú de testing */}
      {showTestMenu && !isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowTestMenu(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
