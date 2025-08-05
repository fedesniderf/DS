import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ResetPasswordModal from './ResetPasswordModal';

const roles = ['admin', 'client', 'coach']; // Agrega los roles que necesites

const UserManagementScreen = ({ users, onDeleteUser, onResetPassword, onRoleChange, onViewProfile, isAdmin = false, onBack = null }) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Simular carga inicial
  useEffect(() => {
    setInitialLoading(true);
    setTimeout(() => setInitialLoading(false), 500);
  }, [users]);

  // Ordenar usuarios por nombre
  const sortedUsers = [...users].sort((a, b) => {
    const nameA = (a.full_name || a.fullName || a.name || '').toLowerCase();
    const nameB = (b.full_name || b.fullName || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const handleResetClick = (user) => {
    setUserToReset(user);
    setShowResetModal(true);
  };

  const handleDeleteUser = async (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      if (window.confirm('Esta acción es irreversible. ¿Deseas continuar y eliminar el usuario definitivamente?')) {
        setLoading(true);
        await onDeleteUser(clientId);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-2 px-2">
      <div className="max-w-6xl mx-auto px-2 py-4">
        {/* Indicador de carga para operaciones */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Procesando...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Gestión de Clientes</h1>
            <p className="text-gray-600 text-base md:text-lg">Administra y supervisa todos tus clientes</p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 md:p-6">
          {/* Indicador de carga inicial */}
          {initialLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Cargando usuarios...</p>
              </div>
            </div>
          ) : sortedUsers.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedUsers.map((user) => (
                    <tr key={user.client_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* Foto de perfil */}
                          {user.profilePhoto ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0 mr-3">
                              <img 
                                src={user.profilePhoto} 
                                alt="Foto de perfil" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold hidden">
                                {(user.full_name || user.fullName || user.name) ? (user.full_name || user.fullName || user.name).charAt(0).toUpperCase() : '?'}
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mr-3">
                              {(user.full_name || user.fullName || user.name) ? (user.full_name || user.fullName || user.name).charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{user.full_name || user.fullName || user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Ver rutinas */}
                          <button
                            className="p-2 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                            onClick={() => onViewProfile(user)}
                            disabled={loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-700">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          {/* Restablecer contraseña */}
                          <button
                            className="p-2 rounded-full hover:bg-orange-100 transition-colors ml-2 disabled:opacity-50"
                            onClick={() => handleResetClick(user)}
                            disabled={loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-800">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3" />
                              <rect width="15" height="8" x="4.5" y="10.5" rx="2" />
                            </svg>
                          </button>
                          {/* Eliminar usuario (mismo ícono que eliminar día en rutinas) */}
                          <button
                            className="p-2 rounded-full hover:bg-red-100 transition-colors ml-2 disabled:opacity-50"
                            onClick={() => handleDeleteUser(user.client_id)}
                            disabled={loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-red-700">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V6.75A2.25 2.25 0 0 1 8.25 4.5h7.5A2.25 2.25 0 0 1 18 6.75V7.5M19.5 7.5h-15M9.75 10.5v6m4.5-6v6M5.25 7.5l.545 9.267A2.25 2.25 0 0 0 8.04 19.5h7.92a2.25 2.25 0 0 0 2.245-2.733L18.75 7.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de restablecer contraseña */}
        {showResetModal && userToReset && (
          <ResetPasswordModal
            user={userToReset}
            onResetPassword={onResetPassword}
            onClose={() => setShowResetModal(false)}
          />
        )}

        {/* Footer Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-center gap-6">
            {/* Logo DS Entrenamiento */}
            <div className="flex items-center gap-2">
              <img 
                src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" 
                alt="DS Entrenamiento Logo" 
                className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
              <span className="text-gray-500 text-sm font-medium">DS Entrenamiento</span>
            </div>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/5491135732817" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
              title="Contactar por WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
              </svg>
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementScreen;
