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
                                  {client.medicalConditions && (
                                    <p><span className="font-semibold">Dolencias médicas:</span> {client.medicalConditions}</p>
                                  )}
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

      {/* Footer Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Logo DS Entrenamiento */}
          <div className="flex items-center gap-2">
            <img 
              src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" 
              alt="DS Entrenamiento Logo" 
              className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
            />
            <span className="text-gray-500 text-sm font-medium">DS Entrenamiento</span>
          </div>

          {/* WhatsApp */}
          <a 
            href="https://wa.me/5491135732817" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
            title="Contactar por WhatsApp"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
            </svg>
            <span className="hidden md:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </div>
);
};

export default ClientDashboardAdmin;