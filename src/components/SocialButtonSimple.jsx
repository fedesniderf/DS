import React from 'react';

const SocialButton = ({ currentUser }) => {
  console.log('SocialButton renderizado con usuario:', currentUser);

  const handleClick = () => {
    alert('¡Botón Social funcionando!');
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
      title="Red Social DS"
    >
      🌐 Social
    </button>
  );
};

export default SocialButton;
