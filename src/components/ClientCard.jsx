import React from 'react';

const ClientCard = ({ client, onClick, onDeleteClient }) => {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
    >
      {/* Foto de perfil y datos del cliente */}
      <div className="flex items-center mb-4">
        {/* Foto de perfil */}
        {client.profilePhoto ? (
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0 mr-3">
            <img 
              src={client.profilePhoto} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold hidden">
              {client.name ? client.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mr-3">
            {client.name ? client.name.charAt(0).toUpperCase() : client.email ? client.email.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        
        {/* Información del cliente */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{client.name}</h3>
          <p className="text-gray-600 text-sm">{client.email}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
        <span>Última rutina:</span>
        <span className="font-medium">{client.lastRoutine}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-black h-2.5 rounded-full transition-all duration-500" // Botón negro
          style={{ width: `${client.progress}%` }}
        ></div>
      </div>
      <p className="text-right text-xs text-gray-500 mt-1">Progreso: {client.progress}%</p>
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evita que se active el onClick del ClientCard
            onDeleteClient(client.id);
          }}
          className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L5.072 5.455m11.35.01L12 2.25 7.672 5.455m11.35.01C18.723 5.67 16.16 6.228 12 6.228s-6.723-.558-7.672-.772M9 12h6" />
          </svg>
        </button>
      </div>
      <div className="absolute inset-0" onClick={() => onClick(client)}></div> {/* Overlay para el click del card */}
    </div>
  );
};

export default ClientCard;