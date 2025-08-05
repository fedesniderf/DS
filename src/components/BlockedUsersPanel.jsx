import React, { useState, useEffect } from 'react';
import { LoginSecurityService } from '../services/LoginSecurityService';

const BlockedUsersPanel = ({ isOpen, onClose }) => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Cargar usuarios bloqueados
  const loadBlockedUsers = async () => {
    setLoading(true);
    try {
      const users = await LoginSecurityService.getAdminAllBlockedUsers();
      setBlockedUsers(users);
    } catch (error) {
      console.error('Error cargando usuarios bloqueados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBlockedUsers();
    }
  }, [isOpen]);

  // Desbloquear usuario
  const handleUnlockUser = async (email) => {
    setActionLoading(email);
    try {
      const success = await LoginSecurityService.adminUnlockAccount(email);
      if (success) {
        // Recargar la lista
        await loadBlockedUsers();
      }
    } catch (error) {
      console.error('Error desbloqueando usuario:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Bloquear usuario manualmente
  const handleLockUser = async (email) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres bloquear la cuenta de ${email}?\n\nLa cuenta será bloqueada indefinidamente hasta que sea desbloqueada manualmente.`
    );
    
    if (!confirmed) return;

    setActionLoading(email);
    try {
      const success = await LoginSecurityService.adminLockAccount(email);
      if (success) {
        // Recargar la lista
        await loadBlockedUsers();
      }
    } catch (error) {
      console.error('Error bloqueando usuario:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            �️ Panel de Gestión de Seguridad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Cargando información de seguridad...</span>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Excelente!</h3>
              <p className="text-gray-600">No hay usuarios con problemas de seguridad en este momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Se encontraron {blockedUsers.length} usuario(s) con actividad de seguridad
                </p>
              </div>

              {blockedUsers.map((user, index) => (
                <div 
                  key={user.email} 
                  className={`border rounded-lg p-4 ${
                    user.isLocked ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Email y estado */}
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{user.email}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isLocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isLocked ? '🔒 Bloqueada' : '⚠️ Intentos fallidos'}
                        </span>
                      </div>

                      {/* Detalles */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Intentos fallidos:</span>
                          <span className={`ml-2 font-semibold ${
                            user.failedAttempts >= 7 ? 'text-red-600' : 
                            user.failedAttempts >= 4 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {user.failedAttempts} / 10
                          </span>
                        </div>

                        {user.isLocked && (
                          <div>
                            <span className="font-medium text-gray-700">Duración del bloqueo:</span>
                            <span className="ml-2 font-semibold text-red-600">
                              {user.isIndefinite ? 'Indefinido' : `${user.remainingTime} min`}
                            </span>
                          </div>
                        )}

                        {user.lastAttempt && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Último intento:</span>
                            <span className="ml-2 text-gray-600">
                              {new Date(user.lastAttempt).toLocaleString()}
                            </span>
                          </div>
                        )}

                        {user.adminUnlocked && (
                          <div className="col-span-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              🔓 Desbloqueada por admin
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="ml-4">
                      {user.isLocked ? (
                        <button
                          onClick={() => handleUnlockUser(user.email)}
                          disabled={actionLoading === user.email}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            actionLoading === user.email
                              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                              : 'bg-yellow-500 text-white hover:bg-yellow-600'
                          }`}
                        >
                          {actionLoading === user.email ? 'Desbloqueando...' : '🔓 Desbloquear'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLockUser(user.email)}
                          disabled={actionLoading === user.email}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            actionLoading === user.email
                              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {actionLoading === user.email ? 'Bloqueando...' : '� Bloquear'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón de refrescar */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={loadBlockedUsers}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockedUsersPanel;
