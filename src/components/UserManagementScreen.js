import React, { useState } from 'react';
import ResetPasswordModal from './ResetPasswordModal';

const UserManagementScreen = ({ users, onDeleteUser, onResetPassword }) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [userToReset, setUserToReset] = useState(null);

  const handleResetClick = (user) => {
    setUserToReset(user);
    setShowResetModal(true);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Administrar Usuarios</h2>
      {users.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <div className="flex items-center justify-end space-x-2"> {/* Contenedor flex para los botones */}
                      <button
                        onClick={() => handleResetClick(user)}
                        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md flex items-center justify-center transform hover:scale-110"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-300 ease-in-out shadow-md flex items-center justify-center transform hover:scale-110"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L5.072 5.455m11.35.01L12 2.25 7.672 5.455m11.35.01C18.723 5.67 16.16 6.228 12 6.228s-6.723-.558-7.672-.772M9 12h6" />
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

      {showResetModal && userToReset && (
        <ResetPasswordModal
          user={userToReset}
          onResetPassword={onResetPassword}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagementScreen;