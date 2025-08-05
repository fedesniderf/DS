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

  const handleDeleteNotification = async (notificationId, event) => {
    // Prevenir que se marque como leída cuando se elimina
    event.stopPropagation();
    
    try {
      const result = await NotificationService.deleteNotification(notificationId);
      if (result.success) {
        // Recargar notificaciones para actualizar la lista
        await loadNotifications();
        console.log('✅ Notificación eliminada exitosamente');
      } else {
        console.error('❌ Error eliminando notificación:', result.error);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar todas las notificaciones? Esta acción no se puede deshacer.');
    
    if (!confirmDelete) return;

    try {
      const userId = currentUser?.id || currentUser?.client_id;
      if (!userId) return;

      const result = await NotificationService.deleteAllNotifications(userId);
      if (result.success) {
        // Recargar notificaciones para actualizar la lista
        await loadNotifications();
        console.log('✅ Todas las notificaciones eliminadas exitosamente');
      } else {
        console.error('❌ Error eliminando todas las notificaciones:', result.error);
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const createTestNotification = async () => {
    try {
      console.log('🧪 Creando notificación de prueba...');
      const userId = currentUser?.id || currentUser?.client_id;
      
      if (!userId) {
        alert('No se pudo identificar el usuario');
        return;
      }

      const result = await NotificationService.createNotification({
        user_id: userId,
        title: '🧪 Notificación de Prueba',
        message: `Esta es una notificación de prueba creada el ${new Date().toLocaleString()}`,
        type: 'test',
        priority: 'medium'
      });

      if (result.success) {
        console.log('✅ Notificación de prueba creada');
        await loadNotifications();
      } else {
        console.error('❌ Error creando notificación:', result.error);
        alert('Error creando notificación de prueba: ' + result.error);
      }
    } catch (error) {
      console.error('Error creando notificación de prueba:', error);
      alert('Error inesperado al crear notificación de prueba');
    }
  };

  // Función para verificar rutinas por vencer
  const checkExpiringRoutines = async () => {
    try {
      if (currentUser?.role !== 'admin') {
        alert('Solo los administradores pueden verificar rutinas');
        return;
      }

      console.log('⏰ Verificando rutinas por vencer...');
      const result = await NotificationService.checkExpiringRoutines();
      
      if (result.success) {
        const count = result.notificationsCreated || 0;
        alert(`Verificación completada. Se crearon ${count} notificaciones para rutinas por vencer.`);
        if (count > 0) {
          await loadNotifications();
        }
      } else {
        alert('Error verificando rutinas: ' + result.error);
      }
    } catch (error) {
      console.error('Error verificando rutinas por vencer:', error);
      alert('Error inesperado al verificar rutinas');
    }
  };

  // Función para crear rutinas de prueba que vencen
  const createTestExpiringRoutines = async () => {
    try {
      if (currentUser?.role !== 'admin') {
        alert('Solo los administradores pueden crear rutinas de prueba');
        return;
      }

      if (!confirm('¿Crear rutinas de prueba que vencen mañana?')) {
        return;
      }

      console.log('🧪 Creando rutinas de prueba...');
      const { createTestExpiringRoutines } = await import('../utils/testRoutineExpiration');
      const result = await createTestExpiringRoutines();
      
      if (result.success) {
        alert(`Rutinas de prueba creadas. Se crearon ${result.created?.length || 0} rutinas.`);
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
      // Verificar primero el estado de los emails
      const emailStatus = NotificationService.getEmailStatus();
      
      if (!emailStatus.enabled) {
        alert('🔇 Los emails están pausados. Solo se muestran notificaciones en la app.\n\nPara reactivar emails, cambia EMAIL_ENABLED = true en NotificationService.js');
        return;
      }

      // Usar el email registrado en Resend para testing
      const testEmail = 'federicosch.fs@gmail.com';
      
      if (!confirm(`¿Enviar email de prueba a ${testEmail}? (Este es el email registrado en Resend)`)) {
        return;
      }

      console.log('📧 Enviando email de prueba...');
      const { default: EmailService } = await import('../services/EmailService');
      const result = await EmailService.sendTestEmail({
        to: testEmail
      });
      
      if (result.success) {
        alert(`Email de prueba enviado exitosamente a ${testEmail}`);
      } else {
        alert('Error enviando email de prueba: ' + result.error);
      }
    } catch (error) {
      console.error('Error enviando email de prueba:', error);
      alert('Error inesperado al enviar email de prueba');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch {
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'routine_assigned': return '🏋️‍♂️';
      case 'routine_completed': return '✅';
      case 'routine_expiring': return '⏰';
      case 'system': return '⚙️';
      case 'test': return '🧪';
      default: return '📢';
    }
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isOpen 
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="Notificaciones"
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-200 ${unreadCount > 0 ? 'animate-pulse' : ''}`}
          fill="currentColor" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fillRule="evenodd" 
            d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" 
            clipRule="evenodd" 
          />
        </svg>
        
        {/* Badge de contador mejorado */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white shadow-lg transform scale-110 animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:absolute md:inset-auto md:right-0 md:mt-2 md:w-80">
          {/* Overlay para móvil */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Panel principal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl md:rounded-xl shadow-2xl border border-gray-200 max-h-[80vh] md:max-h-96 overflow-hidden transform transition-all duration-300 ease-out md:relative md:bottom-auto md:left-auto md:right-auto">
            {/* Indicador de arrastre para móvil */}
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl md:rounded-t-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Notificaciones
                  </h3>
                  {/* Indicador de estado de emails - Solo para admins */}
                  {currentUser?.role === 'admin' && !NotificationService.getEmailStatus().enabled && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      🔇 Emails pausados
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {unreadCount} no leídas
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cerrar notificaciones"
                  >
                    <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            
            {/* Botones de acción */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Botón de prueba - Solo para admins */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={createTestNotification}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  title="Crear notificación de prueba"
                >
                  🧪 Prueba
                </button>
              )}
              
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
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48 md:min-w-48 w-56 md:w-auto">
                      <button
                        onClick={() => {
                          checkExpiringRoutines();
                          setShowTestMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm md:text-xs hover:bg-gray-50 border-b border-gray-100"
                      >
                        ⏰ Verificar rutinas
                      </button>
                      <button
                        onClick={() => {
                          createTestExpiringRoutines();
                          setShowTestMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm md:text-xs hover:bg-gray-50 border-b border-gray-100"
                      >
                        🧪 Crear rutinas prueba
                      </button>
                      <button
                        onClick={() => {
                          cleanTestRoutines();
                          setShowTestMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm md:text-xs hover:bg-gray-50 border-b border-gray-100 text-red-600"
                      >
                        🧹 Limpiar pruebas
                      </button>
                      <button
                        onClick={() => {
                          testEmailNotification();
                          setShowTestMenu(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm md:text-xs hover:bg-gray-50 ${
                          NotificationService.getEmailStatus().enabled ? 'text-green-600' : 'text-orange-600'
                        }`}
                      >
                        {NotificationService.getEmailStatus().enabled ? '📧 Probar Email' : '🔇 Email Pausado'}
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
              
              {/* Botón para eliminar todas las notificaciones */}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAllNotifications}
                  className="text-sm text-red-600 hover:text-red-800 ml-4"
                  title="Eliminar todas las notificaciones"
                >
                  Eliminar todas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-64 md:max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 md:h-6 md:w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-base md:text-sm">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 md:p-6 text-center text-gray-500">
                <svg className="w-16 h-16 md:w-12 md:h-12 mx-auto mb-4 md:mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                <p className="text-base md:text-sm">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 md:p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200 ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl md:text-2xl">{getTypeIcon(notification.type)}</span>
                    </div>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer" 
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between mb-2 md:mb-1">
                        <h4 className="text-base md:text-sm font-semibold text-gray-900 pr-2 leading-tight">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <div className="flex flex-col md:flex-row items-end md:items-center space-y-1 md:space-y-0 md:space-x-2">
                            {!notification.read && (
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          {/* Botón de eliminar */}
                          <button
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                            className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar notificación"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm md:text-sm text-gray-600 mb-3 md:mb-2 line-clamp-3 md:line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                        <span className={`inline-flex items-center px-3 py-1 md:px-2.5 md:py-0.5 rounded-full text-sm md:text-xs font-medium ${
                          notification.type === 'routine_assigned' ? 'bg-green-100 text-green-800' :
                          notification.type === 'routine_completed' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'routine_expiring' ? 'bg-yellow-100 text-yellow-800' :
                          notification.type === 'system' ? 'bg-gray-100 text-gray-800' :
                          notification.type === 'test' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type === 'routine_assigned' ? 'Rutina Asignada' :
                           notification.type === 'routine_completed' ? 'Rutina Completada' :
                           notification.type === 'routine_expiring' ? 'Rutina Expirando' :
                           notification.type === 'system' ? 'Sistema' :
                           notification.type === 'test' ? 'Prueba' :
                           'General'}
                        </span>
                        {notification.priority && (
                          <span className={`px-3 py-1 md:px-2 md:py-1 rounded-full text-sm md:text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
