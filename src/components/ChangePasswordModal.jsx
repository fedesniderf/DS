import React, { useState } from 'react';

const ChangePasswordModal = ({ user, onChangePassword, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password) => {
    // Validaciones de las políticas de registro
    
    // Debe tener al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe tener al menos una letra mayúscula.';
    }

    // Debe tener al menos un caracter especial
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return 'La contraseña debe tener al menos un caracter especial.';
    }

    // No debe contener datos personales del usuario
    const lowerPassword = password.toLowerCase();
    const personalData = [user.fullName || user.full_name, user.email, user.phone].map(x => (x || '').toLowerCase());
    if (personalData.some(data => data && lowerPassword.includes(data))) {
      return 'La contraseña no debe contener tu nombre, email o teléfono.';
    }

    // No debe contener números en escala
    const escalas = ['012','123','234','345','456','567','678','789','890','098','987','876','765','654','543','432','321','210'];
    if (escalas.some(seq => password.includes(seq))) {
      return 'La contraseña no debe contener números en escala (ej: 123, 456, 789, etc).';
    }

    return null; // Válida
  };

  const handleChangePassword = async () => {
    setError('');

    // Validar campos
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Aplicar políticas de contraseña
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (e) {
      setError(e.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Cambiar Contraseña</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✅ Contraseña cambiada correctamente.
          </div>
        )}

        <div className="space-y-4">
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Ingresa tu contraseña actual"
              disabled={loading || success}
            />
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Mínimo 6 caracteres"
              disabled={loading || success}
            />
            <div className="mt-2 text-xs text-gray-500">
              <p className="font-medium mb-1">La contraseña debe tener:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Al menos una letra mayúscula</li>
                <li>Al menos un caracter especial (!@#$%^&*)</li>
                <li>No debe contener tu nombre, email ni teléfono</li>
                <li>No debe contener números en escala (123, 456, etc.)</li>
              </ul>
            </div>
          </div>

          {/* Confirmar nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Repite la nueva contraseña"
              disabled={loading || success}
            />
          </div>
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
            onClick={handleChangePassword}
            className={`px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={loading || success}
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
