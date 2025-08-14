import React from 'react';

const NotificationToast = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2 min-w-[200px] transform transition-all duration-300 ease-in-out`}>
      <span className="text-sm">{icon}</span>
      <span className="flex-1 text-xs font-medium" style={{ fontSize: '12px' }}>{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 ml-2 text-xs"
      >
        ×
      </button>
    </div>
  );
};

export default NotificationToast;
