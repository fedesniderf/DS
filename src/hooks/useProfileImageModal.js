import { useState } from 'react';

// Hook personalizado para manejar el modal de imagen de perfil
export const useProfileImageModal = () => {
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);

  const handleProfileImageClick = (imageData) => {
    console.log('🖼️ Abriendo modal de imagen de perfil:', imageData);
    setSelectedProfileImage(imageData);
    setShowProfileImageModal(true);
  };

  const closeModal = () => {
    setShowProfileImageModal(false);
    setSelectedProfileImage(null);
  };

  return {
    showProfileImageModal,
    selectedProfileImage,
    handleProfileImageClick,
    closeModal
  };
};
