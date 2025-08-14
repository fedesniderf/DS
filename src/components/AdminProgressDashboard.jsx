import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Función para normalizar el formato de días
const normalizeDayFormat = (day) => {
  if (!day || day === '-') return '-';
  
  // Si es un número simple (1, 2, 3...), convertir a "Día X"
  if (/^\d+$/.test(day.toString())) {
    return `Día ${day}`;
  }
  
  // Si ya está en formato "Día X", mantenerlo
  if (/^Día \d+$/.test(day)) {
    return day;
  }
  
  // Para otros formatos (fechas, nombres personalizados), mantener como está
  return day;
};

const AdminProgressDashboard = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([
    { id: 'weekly', name: 'Semanal' },
    { id: 'daily', name: 'PF/PE' }
  ]);
  
  // Estados de filtros
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedRoutine, setSelectedRoutine] = useState('ALL');
  const [selectedExercise, setSelectedExercise] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedWeek, setSelectedWeek] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [data, selectedUser, selectedRoutine, selectedExercise, selectedDay, selectedWeek, selectedType, searchTerm]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar usuarios (clientes y admins)
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('client_id, fullName, email, role')
        .in('role', ['client', 'admin'])
        .order('fullName');

      if (usersError) throw usersError;

      // 2. Cargar rutinas con datos completos
      const { data: routinesData, error: routinesError } = await supabase
        .from('rutinas')
        .select('*')
        .order('name');

      if (routinesError) throw routinesError;

      // 3. Procesar datos de seguimiento desde las rutinas
      const allRecords = [];
      const uniqueExercises = new Set();
      const uniqueDays = new Set();
      const uniqueWeeks = new Set();

      routinesData?.forEach(routine => {
        // Buscar usuario de esta rutina
        const user = usersData?.find(u => u.client_id === routine.client_id);
        if (!user) return;

        // Procesar ejercicios con seguimiento semanal
        const exercises = routine.exercises || [];
        exercises.forEach(exercise => {
          if (exercise.name) {
            uniqueExercises.add(exercise.name);

            // Normalizar día y solo agregar a la lista si tiene datos de seguimiento semanal
            const normalizedDay = normalizeDayFormat(exercise.day);
            if (exercise.day && exercise.weeklyData && Object.keys(exercise.weeklyData).length > 0) {
              uniqueDays.add(normalizedDay);
            }

            // Procesar weeklyData
            if (exercise.weeklyData) {
              Object.entries(exercise.weeklyData).forEach(([week, weekData]) => {
                const weekNumber = week.replace('S', '');
                uniqueWeeks.add(weekNumber);
                
                const record = {
                  id: `${routine.id}-${exercise.id}-${week}`,
                  routine_id: routine.id,
                  routine_name: routine.name,
                  user_name: user.fullName,
                  user_email: user.email,
                  user_id: user.client_id,
                  ejercicio: exercise.name,
                  dia: normalizedDay,
                  semana: weekNumber,
                  fecha: weekData.date || new Date().toISOString().split('T')[0],
                  peso: weekData.weight || '',
                  repeticiones: weekData.series || '',
                  seriesWeights: weekData.seriesWeights || [],
                  observaciones: weekData.generalNotes || '',
                  pf: null,
                  pe: null,
                  type: 'weekly'
                };
                allRecords.push(record);
              });
            }
          }
        });

        // Procesar seguimiento diario PF/PE
        if (routine.dailyTracking) {
          Object.entries(routine.dailyTracking).forEach(([day, trackingData]) => {
            // Normalizar formato del día
            const normalizedDay = normalizeDayFormat(day);
            
            // Solo agregar día si tiene datos válidos de PF/PE
            const dayRecords = Array.isArray(trackingData) ? trackingData : [trackingData];
            const hasValidPFPE = dayRecords.some(data => 
              data && (
                (data.pf !== undefined || data.pe !== undefined) ||
                (data.PFPE && (data.PFPE.pf !== undefined || data.PFPE.pe !== undefined))
              )
            );
            
            if (hasValidPFPE) {
              uniqueDays.add(normalizedDay);
            }
            
            // Manejar tanto formato nuevo como antiguo
            const records = Array.isArray(trackingData) ? trackingData : [trackingData];
            
            records.forEach((data, index) => {
              if (data && (
                (data.pf !== undefined || data.pe !== undefined) ||
                (data.PFPE && (data.PFPE.pf !== undefined || data.PFPE.pe !== undefined))
              )) {
                // Extraer valores PF y PE desde diferentes formatos
                let pfValue = null;
                let peValue = null;
                let semanaValue = '-';
                let fechaValue = data.date || day;

                if (data.PFPE) {
                  // Formato con estructura PFPE
                  pfValue = data.PFPE.pf || data.PFPE.PF;
                  peValue = data.PFPE.pe || data.PFPE.PE;
                  semanaValue = data.PFPE.week || '-';
                  fechaValue = data.PFPE.timestamp || data.PFPE.date || data.date || day;
                  
                  // Agregar semana a la lista si es válida
                  if (data.PFPE.week && data.PFPE.week !== '-') {
                    const weekNum = data.PFPE.week.toString().replace('S', '');
                    uniqueWeeks.add(weekNum);
                  }
                } else {
                  // Formato directo
                  pfValue = data.pf;
                  peValue = data.pe;
                }

                const record = {
                  id: `${routine.id}-daily-${day}-${index}`,
                  routine_id: routine.id,
                  routine_name: routine.name,
                  user_name: user.fullName,
                  user_email: user.email,
                  user_id: user.client_id,
                  ejercicio: 'Seguimiento PF/PE General',
                  dia: normalizedDay,
                  semana: semanaValue,
                  fecha: fechaValue,
                  peso: '-',
                  repeticiones: '-',
                  seriesWeights: [],
                  observaciones: '',
                  pf: pfValue,
                  pe: peValue,
                  type: 'daily'
                };
                allRecords.push(record);
              }
            });
          });
        }
      });

      // Establecer estados
      setUsers(usersData || []);
      setRoutines(routinesData || []);
      setExercises([...uniqueExercises].sort());
      setAvailableDays([...uniqueDays].sort());
      setAvailableWeeks([...uniqueWeeks].sort((a, b) => parseInt(a) - parseInt(b)));
      setData(allRecords);

      console.log('📊 Datos procesados:', {
        usuarios: usersData?.length || 0,
        rutinas: routinesData?.length || 0,
        ejercicios: uniqueExercises.size,
        dias: uniqueDays.size,
        semanas: uniqueWeeks.size,
        registros: allRecords.length,
        registrosPFPE: allRecords.filter(r => r.type === 'daily').length,
        registrosSemanales: allRecords.filter(r => r.type === 'weekly').length
      });

      console.log('📊 Días únicos encontrados:', [...uniqueDays].sort());
      console.log('📊 Semanas únicas encontradas:', [...uniqueWeeks].sort((a, b) => parseInt(a) - parseInt(b)));
      console.log('📊 Muestra de registros:', allRecords.slice(0, 3));

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Filtrar por usuario
    if (selectedUser !== 'ALL') {
      filtered = filtered.filter(record => 
        record.user_id === selectedUser
      );
    }

    // Filtrar por rutina
    if (selectedRoutine !== 'ALL') {
      filtered = filtered.filter(record => 
        record.routine_id === parseInt(selectedRoutine)
      );
    }

    // Filtrar por ejercicio
    if (selectedExercise !== 'ALL') {
      filtered = filtered.filter(record => 
        record.ejercicio === selectedExercise
      );
    }

    // Filtrar por día
    if (selectedDay !== 'ALL') {
      filtered = filtered.filter(record => 
        record.dia === selectedDay
      );
    }

    // Filtrar por semana
    if (selectedWeek !== 'ALL') {
      filtered = filtered.filter(record => 
        record.semana === selectedWeek
      );
    }

    // Filtrar por tipo
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(record => 
        record.type === selectedType
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.ejercicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.routine_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset pagination
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatWeight = (weight) => {
    return weight ? `${weight} kg` : '-';
  };

  const formatReps = (reps) => {
    return reps || '-';
  };

  const formatPFPE = (value) => {
    return value ? `${value}/5` : '-';
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const clearFilters = () => {
    setSelectedUser('ALL');
    setSelectedRoutine('ALL');
    setSelectedExercise('ALL');
    setSelectedDay('ALL');
    setSelectedWeek('ALL');
    setSelectedType('ALL');
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const headers = [
      'Usuario',
      'Email',
      'Rutina',
      'Ejercicio',
      'Día',
      'Semana',
      'Fecha',
      'Peso',
      'Repeticiones',
      'PF',
      'PE',
      'Observaciones',
      'Tipo'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(record => [
        `"${record.user_name || ''}"`,
        `"${record.user_email || ''}"`,
        `"${record.routine_name || ''}"`,
        `"${record.ejercicio || ''}"`,
        `"${record.dia || ''}"`,
        `"${record.semana || ''}"`,
        `"${formatDate(record.fecha)}"`,
        record.peso || '',
        record.repeticiones || '',
        record.pf || '',
        record.pe || '',
        `"${record.observaciones || ''}"`,
        `"${record.type || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seguimiento_completo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de seguimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4">
      <div className="w-full">
        {/* Header */}
        <div className="w-full p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                📊 Dashboard de Seguimiento Completo
              </h1>
              <p className="text-gray-600">
                Monitorea el progreso detallado de todos tus clientes
              </p>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="w-full p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-6.708-3 4 4 0 016.708 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Registros</p>
                <p className="text-xl font-bold text-gray-900">{filteredData.length}</p>
              </div>
            </div>
          </div>

          <div className="w-full p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Clientes Activos</p>
                <p className="text-xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'client').length}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Rutinas Activas</p>
                <p className="text-xl font-bold text-gray-900">
                  {(() => {
                    const currentDate = new Date().toISOString().split('T')[0];
                    return routines.filter(r => r.endDate >= currentDate).length;
                  })()}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Ejercicios Únicos</p>
                <p className="text-xl font-bold text-gray-900">
                  {exercises.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="w-full p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🔍 Filtros Avanzados</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
            {/* Búsqueda */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuario, rutina o ejercicio..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Todos los usuarios</option>
                {users.map(user => (
                  <option key={user.client_id} value={user.client_id}>
                    {user.fullName} ({user.role === 'admin' ? 'Admin' : 'Cliente'})
                  </option>
                ))}
              </select>
            </div>

            {/* Rutina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rutina</label>
              <select
                value={selectedRoutine}
                onChange={(e) => setSelectedRoutine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Todas las rutinas</option>
                {routines
                  .filter(routine => selectedUser === 'ALL' || routine.client_id === selectedUser)
                  .map(routine => (
                    <option key={routine.id} value={routine.id}>
                      {routine.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Ejercicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ejercicio</label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Todos los ejercicios</option>
                {exercises.map(exercise => (
                  <option key={exercise} value={exercise}>
                    {exercise}
                  </option>
                ))}
              </select>
            </div>

            {/* Día */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Día</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Todos los días</option>
                {availableDays.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Semana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semana</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Todas las semanas</option>
                {availableWeeks.map(week => (
                  <option key={week} value={week}>
                    Semana {week}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Todos los tipos</option>
                {availableTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="w-full overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                📋 Registros de Entrenamiento
              </h2>
              <div className="text-sm text-gray-600">
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length} registros
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rutina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ejercicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Día
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-12 text-center text-gray-500">{/* Actualizado a 12 columnas */}
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-400 mb-2">No se encontraron registros</p>
                        <p className="text-sm text-gray-400">Intenta ajustar los filtros para ver más resultados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {record.user_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.user_email || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.routine_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={record.ejercicio}>
                          {record.ejercicio}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.dia}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {record.semana ? `S${record.semana}` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.peso ? formatWeight(record.peso) : 
                         record.seriesWeights?.length > 0 ? 
                         `${record.seriesWeights.join(', ')} kg` : 
                         '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatReps(record.repeticiones)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          record.pf >= 4 ? 'bg-green-100 text-green-800' :
                          record.pf >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          record.pf >= 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formatPFPE(record.pf)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          record.pe >= 4 ? 'bg-red-100 text-red-800' :
                          record.pe >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          record.pe >= 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formatPFPE(record.pe)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={record.observaciones}>
                          {record.observaciones || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.type === 'weekly' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {record.type === 'weekly' ? 'Semanal' : 'PF/PE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredData.length)}</span> de{' '}
                      <span className="font-medium">{filteredData.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Anterior</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNumber
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Siguiente</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProgressDashboard;
