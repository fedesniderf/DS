import React, { useState, useEffect } from 'react';
import { sortClientsByName } from '../utils/helpers';

const ClientDashboardAdmin = ({ clients, onSelectClient, onBack, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedClients, setSortedClients] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null); // Nuevo estado para el cliente expandido
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setInitialLoading(true);
    const filtered = clients.filter(client =>
      (client.full_name?.toLowerCase() || client.fullName?.toLowerCase() || client.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setSortedClients(sortClientsByName(filtered));
    // Simular un pequeño retraso para mostrar el loading
    setTimeout(() => setInitialLoading(false), 500);
  }, [clients, searchTerm]);

  const handleToggleExpand = (clientId) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Botón de atrás solo para admins, arriba a la izquierda, fuera del card */}
      {isAdmin && (
        <button
          onClick={onBack}
          className="fixed top-6 left-6 z-20 p-0 m-0 bg-transparent border-none outline-none hover:text-blue-600 text-gray-700"
          style={{ lineHeight: 0 }}
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-9 h-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      )}
      <div className="p-6 bg-white rounded-2xl shadow-md max-w-3xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Administración de Clientes</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          disabled={initialLoading}
        />
      </div>

      {/* Indicador de carga inicial */}
      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      ) : (
        <>
          {sortedClients.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No hay clientes registrados que coincidan con la búsqueda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Rutina</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedClients.map((client, index) => {
                    // Debug: verificar que cada cliente tenga un ID único
                    const clientKey = client.id || client.client_id || client.email || index;
                    console.log('ClientDashboardAdmin - client:', client, 'key:', clientKey);
                    
                    return (
                      <React.Fragment key={clientKey}>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <button
                              onClick={() => handleToggleExpand(clientKey)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {expandedClient === clientKey ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                              )}
                              {client.full_name || client.fullName || client.name || client.email}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastRoutine || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.progress || 0}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => onSelectClient(client)}
                              className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out text-xs font-semibold shadow-sm"
                            >
                              Ver Rutinas
                            </button>
                          </td>
                        </tr>
                        {expandedClient === clientKey && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                  <p><span className="font-semibold">Edad:</span> {client.age || 'N/A'}</p>
                                  <p><span className="font-semibold">Peso:</span> {client.weight || 'N/A'} kg</p>
                                  <p><span className="font-semibold">Altura:</span> {client.height || 'N/A'} cm</p>
                                </div>
                                <div>
                                  <p><span className="font-semibold">Teléfono:</span> {client.phone || 'N/A'}</p>
                                  <p><span className="font-semibold">Objetivos:</span>{" "}
                                    {Array.isArray(client.goals)
                                      ? client.goals.length > 0
                                        ? client.goals.join(', ')
                                        : 'N/A'
                                      : typeof client.goals === 'string' && client.goals.trim() !== ''
                                        ? client.goals
                                        : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
};

export default ClientDashboardAdmin;