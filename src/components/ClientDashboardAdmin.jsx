import React, { useState, useEffect } from 'react';
import { sortClientsByName } from '../utils/helpers';

const ClientDashboardAdmin = ({ clients, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedClients, setSortedClients] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null); // Nuevo estado para el cliente expandido

  useEffect(() => {
    const filtered = clients.filter(client =>
      (client.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setSortedClients(sortClientsByName(filtered));
  }, [clients, searchTerm]);

  const handleToggleExpand = (clientId) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Administración de Clientes</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        />
      </div>

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
              {sortedClients.map((client) => (
                <React.Fragment key={client.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleToggleExpand(client.id)}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {expandedClient === client.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        )}
                        {client.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastRoutine}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.progress}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => onSelectClient(client)}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out text-xs font-semibold shadow-sm"
                      >
                        Ver Rutinas
                      </button>
                    </td>
                  </tr>
                  {expandedClient === client.id && (
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
                            {client.medicalConditions && (
                              <p><span className="font-semibold">Dolencias médicas:</span> {client.medicalConditions}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientDashboardAdmin;