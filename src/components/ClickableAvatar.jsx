import React from 'react';

// Componente reutilizable para avatares clickables
const ClickableAvatar = ({ 
  user, 
  size = 'md', 
  onProfileImageClick, 
  className = '',
  showHoverEffect = true,
  onContextMenu,
  onKeyDown 
}) => {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
    '2xl': 'w-20 h-20 text-lg',
    '3xl': 'w-24 h-24 text-xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const hoverEffect = showHoverEffect ? 'hover:ring-2 hover:ring-blue-500 transition-all' : '';

  const handleClick = (e) => {
    if (onProfileImageClick) {
      const imageData = {
        url: user?.profilePhoto || user?.avatar_url || null,
        userName: user?.fullName || user?.name || user?.displayName || 'Usuario Anónimo',
        userEmail: user?.email,
        initials: (user?.fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase()
      };
      onProfileImageClick(imageData, e);
    }
  };

  const handleContextMenu = (e) => {
    if (onContextMenu) {
      onContextMenu(e);
    }
  };

  const handleKeyDown = (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  if (user?.profilePhoto || user?.avatar_url) {
    return (
      <img
        className={`${sizeClass} rounded-full object-cover cursor-pointer ${hoverEffect} ${className}`}
        src={user.profilePhoto || user.avatar_url}
        alt={`Avatar de ${user?.fullName || user?.name || 'Usuario'}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
    );
  }

  return (
    <div 
      className={`${sizeClass} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer ${hoverEffect} ${className}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {(user?.fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
    </div>
  );
};

export default ClickableAvatar;
