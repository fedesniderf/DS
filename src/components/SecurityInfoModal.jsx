import React from 'react';

const SecurityInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            🔒 Información de Seguridad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Auto-logout por inactividad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900">Cierre Automático de Sesión</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Tu sesión se cerrará automáticamente después de <strong>2 horas de inactividad</strong> para proteger tu cuenta.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Recibirás una advertencia 5 minutos antes del cierre.
                </p>
              </div>
            </div>
          </div>

          {/* Protección contra intentos fallidos */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-amber-900">Protección de Cuenta</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Después de <strong>10 intentos fallidos</strong> de inicio de sesión, tu cuenta se bloqueará temporalmente.
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  El bloqueo dura 30 minutos y se puede intentar nuevamente después.
                </p>
              </div>
            </div>
          </div>

          {/* Cambio de contraseña */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-green-900">Cambio de Contraseña</h3>
                <p className="text-sm text-green-700 mt-1">
                  Puedes cambiar tu contraseña en cualquier momento desde la sección <strong>Seguridad</strong> del menú.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  La nueva contraseña debe cumplir con todas las políticas de seguridad.
                </p>
              </div>
            </div>
          </div>

          {/* Consejos de seguridad */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Consejos de Seguridad</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-gray-400">•</span>
                <span>Mantén tu sesión activa interactuando regularmente con la aplicación</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-gray-400">•</span>
                <span>Cierra sesión manualmente cuando termines de usar la aplicación</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-gray-400">•</span>
                <span>No compartas tus credenciales de acceso con terceros</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-gray-400">•</span>
                <span>Cambia tu contraseña regularmente para mayor seguridad</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityInfoModal;
