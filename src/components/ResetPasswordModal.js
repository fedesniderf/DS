import React, { useState } from 'react';

const roles = ['admin', 'client', 'coach'];
const ResetPasswordModal = ({ user, onResetPassword, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(user.role || 'client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Restablecer Contraseña para {user.email}</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">Contraseña restablecida correctamente.</p>}

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
  );
};

export default ResetPasswordModal;