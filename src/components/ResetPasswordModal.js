import React, { useState, useEffect } from 'react';
import { LoginSecurityService } from '../services/LoginSecurityServiceSimple';

const roles = ['admin', 'client', 'coach'];
const ResetPasswordModal = ({ user, onResetPassword, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(user.role || 'client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);
  const [loadingLockInfo, setLoadingLockInfo] = useState(true);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  // Cargar información de bloqueo al abrir el modal
  useEffect(() => {
    const loadLockInfo = async () => {
      setLoadingLockInfo(true);
      try {
        const info = await LoginSecurityService.getAdminUserLockInfo(user.email);
        setLockInfo(info);
      } catch (error) {
        console.error('Error cargando información de bloqueo:', error);
      } finally {
        setLoadingLockInfo(false);
      }
    };

    if (user.email) {
      loadLockInfo();
    }
  }, [user.email]);

  // Función para desbloquear cuenta
  const handleUnlockAccount = async () => {
    setUnlockLoading(true);
    try {
      const success = await LoginSecurityService.adminUnlockAccount(user.email);
      if (success) {
        // Recargar información de bloqueo
        const updatedInfo = await LoginSecurityService.getAdminUserLockInfo(user.email);
        setLockInfo(updatedInfo);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al desbloquear la cuenta.');
      }
    } catch (error) {
      setError('Error al desbloquear la cuenta.');
      console.error('Error desbloqueando cuenta:', error);
    } finally {
      setUnlockLoading(false);
    }
  };

  // Función para bloquear cuenta manualmente
  const handleLockAccount = async () => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres bloquear la cuenta de ${user.email}?\n\nLa cuenta será bloqueada indefinidamente hasta que sea desbloqueada manualmente.`
    );
    
    if (!confirmed) return;

    setLockLoading(true);
    try {
      const success = await LoginSecurityService.adminLockAccount(user.email);
      if (success) {
        // Recargar información de bloqueo
        const updatedInfo = await LoginSecurityService.getAdminUserLockInfo(user.email);
        setLockInfo(updatedInfo);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al bloquear la cuenta.');
      }
    } catch (error) {
      setError('Error al bloquear la cuenta.');
      console.error('Error bloqueando cuenta:', error);
    } finally {
      setLockLoading(false);
    }
  };

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Llama a la función de reset y pasa también el nuevo rol
      await onResetPassword(user.client_id, newPassword, role);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      setError('Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Gestionar Usuario: {user.email}
        </h2>

        {/* Información de Seguridad */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
            </svg>
            Estado de Seguridad
          </h3>
          
          {loadingLockInfo ? (
            <div className="text-gray-500">Cargando información de seguridad...</div>
          ) : lockInfo ? (
            <div className="space-y-3">
              {/* Estado de bloqueo */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado de la cuenta:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  lockInfo.isLocked 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {lockInfo.isLocked ? '🔒 Bloqueada' : '✅ Activa'}
                </span>
              </div>

              {/* Intentos fallidos */}
              {lockInfo.hasRecord && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Intentos fallidos:</span>
                  <span className={`text-sm font-semibold ${
                    lockInfo.failedAttempts >= 7 ? 'text-red-600' : 
                    lockInfo.failedAttempts >= 4 ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {lockInfo.failedAttempts} / 10
                  </span>
                </div>
              )}

              {/* Tiempo restante de bloqueo */}
              {lockInfo.isLocked && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Duración del bloqueo:</span>
                  <span className="text-sm font-semibold text-red-600">
                    {lockInfo.isIndefinite ? 'Indefinido' : `${lockInfo.remainingTime} minutos`}
                  </span>
                </div>
              )}

              {/* Último intento */}
              {lockInfo.lastAttempt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Último intento:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(lockInfo.lastAttempt).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Botón de desbloqueo */}
              {lockInfo.isLocked && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleUnlockAccount}
                    disabled={unlockLoading}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                      unlockLoading 
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {unlockLoading ? 'Desbloqueando...' : '🔓 Desbloquear Cuenta Inmediatamente'}
                  </button>
                </div>
              )}

              {/* Botón de bloqueo manual */}
              {!lockInfo.isLocked && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleLockAccount}
                    disabled={lockLoading}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                      lockLoading 
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {lockLoading ? 'Bloqueando...' : '🔒 Bloquear Cuenta Manualmente'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Bloqueará la cuenta indefinidamente
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No se pudo cargar la información de seguridad.</div>
          )}
        </div>

        {/* Sección de cambio de contraseña */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Restablecer Contraseña</h3>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-4">
            {lockInfo?.isLocked ? 'Cuenta desbloqueada correctamente.' : 'Contraseña restablecida correctamente.'}
          </p>}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Rol:</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              disabled={loading || success}
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Mínimo 6 caracteres"
              disabled={loading || success}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Repite la nueva contraseña"
              disabled={loading || success}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleReset}
              className={`px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loading || success}
            >
              {loading ? 'Restableciendo...' : 'Restablecer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;