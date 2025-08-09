import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const SimpleSettingsMenuTest = ({ onLogout, currentUser, isOpen, onClose }) => {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSecurityInfoModal, setShowSecurityInfoModal] = useState(false);
  const [showBlockedUsersPanel, setShowBlockedUsersPanel] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [dimScreenOnWakeLock, setDimScreenOnWakeLock] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    instagram: currentUser?.instagram || '',
    phone: currentUser?.phone || ''
  });
  
  const menuRef = useRef(null);
  const wakeLockRef = useRef(null);
  const hiddenVideoRef = useRef(null);

  console.log('SimpleSettingsMenuTest: Component rendering', { isOpen, currentUser });

  // Initialize wake lock state from localStorage
  useEffect(() => {
    console.log('SimpleSettingsMenuTest: Component mounted, initializing wake lock state');
    const savedWakeLockState = localStorage.getItem('wakeLockActive') === 'true';
    const savedDimState = localStorage.getItem('dimScreenOnWakeLock') === 'true';
    
    console.log('SimpleSettingsMenuTest: Loaded from localStorage - wakeLockActive:', savedWakeLockState, 'dimScreenOnWakeLock:', savedDimState);
    
    setIsWakeLockActive(savedWakeLockState);
    setDimScreenOnWakeLock(savedDimState);
    
    if (savedWakeLockState) {
      console.log('SimpleSettingsMenuTest: Auto-activating wake lock based on saved state');
      activateWakeLock();
    }
  }, []);

  // Wake Lock Implementation
  const activateWakeLock = async () => {
    console.log('SimpleSettingsMenuTest: Attempting to activate wake lock');
    
    try {
      if ('wakeLock' in navigator) {
        console.log('SimpleSettingsMenuTest: Using native Wake Lock API');
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('SimpleSettingsMenuTest: Native wake lock activated successfully');
        
        wakeLockRef.current.addEventListener('release', () => {
          console.log('SimpleSettingsMenuTest: Native wake lock was released');
        });
      } else {
        console.log('SimpleSettingsMenuTest: Wake Lock API not supported, using video fallback');
        activateVideoFallback();
      }
      
      if (dimScreenOnWakeLock) {
        console.log('SimpleSettingsMenuTest: Applying screen dimming');
        applyScreenDimming();
      }
      
    } catch (err) {
      console.error('SimpleSettingsMenuTest: Failed to activate wake lock:', err);
      console.log('SimpleSettingsMenuTest: Falling back to video method');
      activateVideoFallback();
    }
  };

  const activateVideoFallback = () => {
    console.log('SimpleSettingsMenuTest: Setting up video fallback for wake lock');
    
    if (!hiddenVideoRef.current) {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.style.position = 'fixed';
      video.style.top = '-1000px';
      video.style.left = '-1000px';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0';
      video.style.pointerEvents = 'none';
      
      // Create a minimal video data URL
      video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzENAAABaW1kYXQAAAGrBSYyoAIAmAAAAAClAAEFARtN';
      
      document.body.appendChild(video);
      hiddenVideoRef.current = video;
    }
    
    hiddenVideoRef.current.play().then(() => {
      console.log('SimpleSettingsMenuTest: Video fallback started successfully');
    }).catch(err => {
      console.error('SimpleSettingsMenuTest: Video fallback failed:', err);
    });
  };

  const releaseWakeLock = async () => {
    console.log('SimpleSettingsMenuTest: Releasing wake lock');
    
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('SimpleSettingsMenuTest: Native wake lock released');
      }
      
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.pause();
        hiddenVideoRef.current.remove();
        hiddenVideoRef.current = null;
        console.log('SimpleSettingsMenuTest: Video fallback stopped and removed');
      }
      
      removeScreenDimming();
      
    } catch (err) {
      console.error('SimpleSettingsMenuTest: Error releasing wake lock:', err);
    }
  };

  const applyScreenDimming = () => {
    console.log('SimpleSettingsMenuTest: Applying screen dimming effect');
    
    let overlay = document.getElementById('screen-dim-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'screen-dim-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '9999';
      overlay.style.transition = 'opacity 0.3s ease';
      document.body.appendChild(overlay);
      console.log('SimpleSettingsMenuTest: Screen dimming overlay created and applied');
    }
  };

  const removeScreenDimming = () => {
    console.log('SimpleSettingsMenuTest: Removing screen dimming effect');
    const overlay = document.getElementById('screen-dim-overlay');
    if (overlay) {
      overlay.remove();
      console.log('SimpleSettingsMenuTest: Screen dimming overlay removed');
    }
  };

  const toggleWakeLock = async () => {
    console.log('SimpleSettingsMenuTest: Toggle wake lock called, current state:', isWakeLockActive);
    
    const newState = !isWakeLockActive;
    setIsWakeLockActive(newState);
    localStorage.setItem('wakeLockActive', newState.toString());
    
    console.log('SimpleSettingsMenuTest: Wake lock state updated to:', newState);
    
    if (newState) {
      await activateWakeLock();
    } else {
      await releaseWakeLock();
    }
  };

  const toggleDimOnWakeLock = () => {
    console.log('SimpleSettingsMenuTest: Toggle dim on wake lock called, current state:', dimScreenOnWakeLock);
    
    const newDimState = !dimScreenOnWakeLock;
    setDimScreenOnWakeLock(newDimState);
    localStorage.setItem('dimScreenOnWakeLock', newDimState.toString());
    
    console.log('SimpleSettingsMenuTest: Dim on wake lock state updated to:', newDimState);
    
    if (isWakeLockActive) {
      if (newDimState) {
        applyScreenDimming();
      } else {
        removeScreenDimming();
      }
    }
  };

  // Change Password functionality
  const handleChangePassword = async () => {
    console.log('SimpleSettingsMenuTest: Change password function called');
    
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      console.log('SimpleSettingsMenuTest: Attempting to update password');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('SimpleSettingsMenuTest: Password update error:', error);
        alert('Error al cambiar la contraseña: ' + error.message);
      } else {
        console.log('SimpleSettingsMenuTest: Password updated successfully');
        alert('Contraseña cambiada exitosamente');
        setShowChangePasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      }
    } catch (error) {
      console.error('SimpleSettingsMenuTest: Unexpected error during password change:', error);
      alert('Error inesperado al cambiar la contraseña');
    }
  };

  // Edit User functionality
  const handleEditUser = async () => {
    console.log('SimpleSettingsMenuTest: Edit user function called with data:', editFormData);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editFormData.name,
          instagram: editFormData.instagram,
          phone: editFormData.phone
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('SimpleSettingsMenuTest: User update error:', error);
        alert('Error al actualizar el perfil: ' + error.message);
      } else {
        console.log('SimpleSettingsMenuTest: User profile updated successfully');
        alert('Perfil actualizado exitosamente');
        setShowEditUserModal(false);
      }
    } catch (error) {
      console.error('SimpleSettingsMenuTest: Unexpected error during user update:', error);
      alert('Error inesperado al actualizar el perfil');
    }
  };

  // Photo upload functionality
  const handlePhotoUpload = async (event) => {
    console.log('SimpleSettingsMenuTest: Photo upload function called');
    
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es muy grande. El tamaño máximo es 5MB.');
      return;
    }

    try {
      console.log('SimpleSettingsMenuTest: Uploading photo to storage');
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('SimpleSettingsMenuTest: Photo upload error:', uploadError);
        alert('Error al subir la foto: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo: urlData.publicUrl })
        .eq('id', currentUser.id);

      if (updateError) {
        console.error('SimpleSettingsMenuTest: Profile photo URL update error:', updateError);
        alert('Error al actualizar la foto de perfil: ' + updateError.message);
      } else {
        console.log('SimpleSettingsMenuTest: Profile photo updated successfully');
        alert('Foto de perfil actualizada exitosamente');
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('SimpleSettingsMenuTest: Unexpected error during photo upload:', error);
      alert('Error inesperado al subir la foto');
    }
  };

  // Logout functionality
  const handleLogout = async () => {
    console.log('SimpleSettingsMenuTest: Logout function called');
    
    try {
      await releaseWakeLock();
      console.log('SimpleSettingsMenuTest: Wake lock released before logout');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SimpleSettingsMenuTest: Logout error:', error);
      } else {
        console.log('SimpleSettingsMenuTest: Logout successful');
        onLogout();
      }
    } catch (error) {
      console.error('SimpleSettingsMenuTest: Unexpected error during logout:', error);
    }
  };

  // Security Info functionality
  const showSecurityInfo = () => {
    console.log('SimpleSettingsMenuTest: Security info function called');
    setShowSecurityInfoModal(true);
  };

  // Blocked Users functionality
  const showBlockedUsers = () => {
    console.log('SimpleSettingsMenuTest: Blocked users function called');
    setShowBlockedUsersPanel(true);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('SimpleSettingsMenuTest: Component unmounting, cleaning up');
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.pause();
        hiddenVideoRef.current.remove();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="relative">
      <div ref={menuRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
        
        {/* Wake Lock Controls */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Mantener pantalla activa</span>
            <button
              onClick={toggleWakeLock}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isWakeLockActive ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isWakeLockActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {isWakeLockActive && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Atenuar pantalla</span>
              <button
                onClick={toggleDimOnWakeLock}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  dimScreenOnWakeLock ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    dimScreenOnWakeLock ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {/* Change Password */}
          <button
            onClick={() => {
              console.log('SimpleSettingsMenuTest: Change password button clicked');
              setShowChangePasswordModal(true);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
            </svg>
            <span className="ml-3">Cambiar contraseña</span>
          </button>

          {/* Edit Profile */}
          <button
            onClick={() => {
              console.log('SimpleSettingsMenuTest: Edit profile button clicked');
              setShowEditUserModal(true);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="ml-3">Editar perfil</span>
          </button>

          {/* Upload Photo */}
          <button
            onClick={() => {
              console.log('SimpleSettingsMenuTest: Upload photo button clicked');
              setShowPhotoModal(true);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
            <span className="ml-3">Subir foto</span>
          </button>

          {/* Security Info */}
          <button
            onClick={() => {
              console.log('SimpleSettingsMenuTest: Security info button clicked');
              showSecurityInfo();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="ml-3">Información de seguridad</span>
          </button>

          {/* Blocked Users */}
          <button
            onClick={() => {
              console.log('SimpleSettingsMenuTest: Blocked users button clicked');
              showBlockedUsers();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span className="ml-3">Usuarios bloqueados</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              console.log('SimpleSettingsMenuTest: Logout button clicked');
              handleLogout();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
            </svg>
            <span className="ml-3">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Repite la nueva contraseña"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={editFormData.instagram}
                  onChange={(e) => setEditFormData({...editFormData, instagram: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditUserModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Subir Foto de Perfil</h3>
            
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
              </svg>
              
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Seleccionar archivo
              </label>
              
              <p className="text-sm text-gray-500 mt-2">
                Máximo 5MB. Formatos: JPG, PNG, GIF
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Info Modal */}
      {showSecurityInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Información de Seguridad</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Tu cuenta está protegida con autenticación segura</p>
              <p>• Cambia tu contraseña regularmente</p>
              <p>• No compartas tus credenciales con nadie</p>
              <p>• Cierra sesión en dispositivos compartidos</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSecurityInfoModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Users Panel */}
      {showBlockedUsersPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Usuarios Bloqueados</h3>
            
            <div className="text-center text-gray-500">
              <p>No tienes usuarios bloqueados</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowBlockedUsersPanel(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSettingsMenuTest;
