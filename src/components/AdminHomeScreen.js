import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminHomeScreen = ({ onNavigateClientes, onNavigateTemplates, onNavigateProgressDashboard }) => {
  const [stats, setStats] = useState({
    clientesActivos: '--',
    rutinasActivas: '--',
    templates: '--'
  });
  const [loading, setLoading] = useState(true);

  // Función para cargar las estadísticas
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // 1. Contar clientes activos (usuarios con role 'client')
      const { data: clientes, error: clientesError } = await supabase
        .from('usuarios')
        .select('client_id')
        .eq('role', 'client');
      
      if (clientesError) {
        console.error('Error cargando clientes:', clientesError);
      }

      // 2. Contar rutinas activas (que no hayan finalizado)
      const currentDate = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
      const { data: rutinas, error: rutinasError } = await supabase
        .from('rutinas')
        .select('id')
        .gte('endDate', currentDate); // Rutinas cuya fecha de fin sea mayor o igual a hoy
      
      if (rutinasError) {
        console.error('Error cargando rutinas:', rutinasError);
      }

      // 3. Contar templates de rutinas
      const { data: templates, error: templatesError } = await supabase
        .from('rutinas_templates')
        .select('id');
      
      if (templatesError) {
        console.error('Error cargando templates:', templatesError);
      }

      // Actualizar estado con los conteos
      setStats({
        clientesActivos: clientes ? clientes.length : 0,
        rutinasActivas: rutinas ? rutinas.length : 0,
        templates: templates ? templates.length : 0
      });

    } catch (error) {
      console.error('Error general cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Panel de Administrador</h1>
        <p className="text-gray-600 text-base md:text-lg">Gestiona tu gimnasio de forma eficiente</p>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stats.clientesActivos
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rutinas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stats.rutinasActivas
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stats.templates
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {/* Gestión de Clientes */}
          <div 
            className="group bg-white rounded-3xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
            onClick={onNavigateClientes}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Gestión de Clientes</h2>
            <p className="text-gray-600 mb-4 leading-relaxed text-sm md:text-base">
              Administra todos tus clientes, visualiza sus rutinas, progreso y estadísticas de entrenamiento.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Ver perfiles</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Seguimiento</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Rutinas activas</span>
            </div>
          </div>

          {/* Templates de Rutinas */}
          <div 
            className="group bg-white rounded-3xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
            onClick={onNavigateTemplates}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Templates de Rutinas</h2>
            <p className="text-gray-600 mb-4 leading-relaxed text-sm md:text-base">
              Crea y gestiona plantillas de rutinas reutilizables para optimizar la asignación de entrenamientos.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">Crear templates</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">Biblioteca</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">Asignar rutinas</span>
            </div>
          </div>

          {/* Dashboard de Seguimiento */}
          <div 
            className="group bg-white rounded-3xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1"
            onClick={onNavigateProgressDashboard}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Dashboard de Seguimiento</h2>
            <p className="text-gray-600 mb-4 leading-relaxed text-sm md:text-base">
              Monitorea el progreso detallado de todos tus clientes con filtros avanzados y análisis completo.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">Análisis completo</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">Filtros avanzados</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">Exportar datos</span>
            </div>
          </div>
        </div>

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
  );
};

export default AdminHomeScreen;
