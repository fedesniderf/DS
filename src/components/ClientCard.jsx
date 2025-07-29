import React from 'react';

const ClientCard = ({ client, onClick, onDeleteClient }) => {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{client.name}</h3>
      <p className="text-gray-600 text-sm mb-3">{client.email}</p>
      <div className="flex items-center justify-between text-sm text-gray-700">
        <span>Última rutina:</span>
        <span className="font-medium">{client.lastRoutine}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
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