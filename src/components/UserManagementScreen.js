import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import ResetPasswordModal from './ResetPasswordModal';

const roles = ['admin', 'client', 'coach']; // Agrega los roles que necesites

const UserManagementScreen = ({ users, onDeleteUser, onResetPassword, onRoleChange, onViewProfile }) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [userToReset, setUserToReset] = useState(null);

  // Ordenar usuarios por nombre
  const sortedUsers = [...users].sort((a, b) => {
    const nameA = (a.fullName || a.name || '').toLowerCase();
    const nameB = (b.fullName || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const handleResetClick = (user) => {
    setUserToReset(user);
    setShowResetModal(true);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h2>
      {sortedUsers.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.client_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName || user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Ver rutinas */}
                      <button
                        className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                        onClick={() => onViewProfile(user)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-700">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      {/* Restablecer contraseña */}
                      <button
                        className="p-2 rounded-full hover:bg-orange-100 transition-colors ml-2"
                        onClick={() => handleResetClick(user)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-800">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3" />
                          <rect width="15" height="8" x="4.5" y="10.5" rx="2" />
                        </svg>
                      </button>
                      {/* Eliminar usuario (mismo ícono que eliminar día en rutinas) */}
                      <button
                        className="p-2 rounded-full hover:bg-red-100 transition-colors ml-2"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                            if (window.confirm('Esta acción es irreversible. ¿Deseas continuar y eliminar el usuario definitivamente?')) {
                              onDeleteUser(user.client_id);
                            }
                          }
                        }}
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
      {/* Modal de restablecer contraseña */}
      {showResetModal && userToReset && (
        <ResetPasswordModal
          user={userToReset}
          onResetPassword={onResetPassword}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}

export default UserManagementScreen;