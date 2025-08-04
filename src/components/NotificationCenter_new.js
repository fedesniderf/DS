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
      case 'routine_assigned': return '🏋️';
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
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        title="Notificaciones"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-5-5V9a6 6 0 0 0-12 0v3l-5 5h5m7 0v1a3 3 0 0 1-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Notificaciones
              </h3>
              <span className="text-sm text-gray-500">
                {unreadCount} no leídas
              </span>
            </div>
            
            {/* Botones de acción */}
            <div className="flex items-center justify-between flex-wrap gap-2">
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
                        className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100 text-red-600"
                      >
                        🧹 Limpiar pruebas
                      </button>
                      <button
                        onClick={() => {
                          testEmailNotification();
                          setShowTestMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-green-600"
                      >
                        📧 Probar Email
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                        <span className="font-medium text-gray-800 text-sm">
                          {notification.title}
                        </span>
                        {notification.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
