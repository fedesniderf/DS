import React, { useState, useEffect, createContext, useContext } from 'react';
import NotificationService from '../services/NotificationService';

// Context para notificaciones
const NotificationContext = createContext();

// Componente de Toast/Pop-up
const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, 5000); // Mostrar por 5 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'routine_created':
        return '🎯';
      case 'routine_assigned':
        return '📋';
      case 'routine_updated':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getColorClasses = (type) => {
    switch (type) {
      case 'routine_created':
        return 'bg-green-500 border-green-600';
      case 'routine_assigned':
        return 'bg-blue-500 border-blue-600';
      case 'routine_updated':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${getColorClasses(notification.type)} z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">{getIcon(notification.type)}</span>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Provider de notificaciones
export const NotificationProvider = ({ children, userId }) => {
  const [toasts, setToasts] = useState([]);
  const [lastCheck, setLastCheck] = useState(new Date().toISOString());

  // Función para mostrar un toast
  const showToast = (notification) => {
    const id = Date.now();
    const toast = { ...notification, id };
    setToasts(prev => [...prev, toast]);
  };

  // Función para remover un toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Función para verificar nuevas notificaciones
  const checkNewNotifications = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .gt('created_at', lastCheck)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Mostrar las nuevas notificaciones como toasts
        data.forEach(notification => {
          showToast(notification);
        });
        
        // Actualizar el timestamp de la última verificación
        setLastCheck(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error checking new notifications:', error);
    }
  };

  // Polling para verificar nuevas notificaciones cada 30 segundos
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(checkNewNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, lastCheck]);

  // Función manual para mostrar notificación
  const notify = async ({ type, title, message, routineId }) => {
    const notification = {
      type,
      title,
      message,
      routine_id: routineId,
      created_at: new Date().toISOString()
    };
    showToast(notification);
  };

  const contextValue = {
    notify,
    showToast,
    checkNewNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Renderizar toasts */}
      <div className="fixed top-0 right-0 z-50 space-y-4 p-4">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook para usar notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
