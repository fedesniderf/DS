import React from "react";

const RoutineDetail = ({
  routine,
  onUpdateRoutine = () => {},
  isEditable,
  onAddExerciseClick = () => {},
  canAddDailyTracking = false,
}) => {
  // Debug: Verificar que routine tiene ID
  console.log('RoutineDetail - routine recibida:', routine);
  console.log('RoutineDetail - routine.id:', routine?.id);

  // ✅ CORRECTO - Todos los hooks DENTRO de la función del componente
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [editExercise, setEditExercise] = React.useState(null);
  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseSets, setExerciseSets] = React.useState("");
  const [exerciseReps, setExerciseReps] = React.useState("");
  const [exerciseWeight, setExerciseWeight] = React.useState("");
  const [exerciseTime, setExerciseTime] = React.useState("");
  const [exerciseRest, setExerciseRest] = React.useState("");
  const [exerciseDay, setExerciseDay] = React.useState("");
  const [exerciseSection, setExerciseSection] = React.useState("");
  const [exerciseMedia, setExerciseMedia] = React.useState(""); // Nuevo campo para media

  // Handler para editar ejercicio
  const handleEditExerciseClick = (ex) => {
    setEditExercise(ex);
    setExerciseName(ex.name || "");
    setExerciseSets(ex.sets || "");
    setExerciseReps(ex.reps || "");
    setExerciseWeight(ex.weight || "");
    setExerciseTime(ex.time || "");
    setExerciseRest(ex.rest || "");
    setExerciseDay(ex.day || "");
    setExerciseSection(ex.section || "");
    setExerciseMedia(ex.media || ""); // Incluir el campo media
    setShowExerciseModal(true);
  };

  // Calcular semanas de la rutina
  const getWeekOptions = () => {
    if (!routine.startDate || !routine.endDate) return [];
    const start = new Date(routine.startDate);
    const end = new Date(routine.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numWeeks = Math.max(1, Math.ceil(diffDays / 7));
    return Array.from({ length: numWeeks }, (_, i) => ({ value: (i + 1).toString(), label: `Semana ${i + 1}` }));
  };
  // Definir exercises al inicio para evitar ReferenceError
  const exercises = Array.isArray(routine.exercises) ? routine.exercises : [];

  // Estados para colapso/expansión - Inicializar con todos los días y secciones colapsadas
  const [collapsedDays, setCollapsedDays] = React.useState(() => {
    // Crear un Set con todos los días que tienen ejercicios
    const allDays = new Set();
    exercises.forEach(ex => {
      const day = ex.day || 'Sin día';
      allDays.add(day);
    });
    return allDays;
  });

  // Función para renderizar detalles del ejercicio
  const renderExerciseDetails = (ex) => (
    <div className="grid grid-cols-2 gap-2 mb-2 text-sm text-gray-700">
      {ex.sets && <div><span className="font-semibold">Series:</span> {ex.sets}</div>}
      {ex.reps && <div><span className="font-semibold">Reps:</span> {ex.reps}</div>}
      {ex.time && <div><span className="font-semibold">Tiempo (seg):</span> {ex.time}</div>}
      {ex.rest && <div><span className="font-semibold">Descanso (seg):</span> {ex.rest}</div>}
      {ex.weight && <div><span className="font-semibold">Peso (Kg):</span> {ex.weight}</div>}
    </div>
  );

  const [collapsedSections, setCollapsedSections] = React.useState(() => {
    // Crear un Set con todas las combinaciones día-sección que tienen ejercicios
    const allSections = new Set();
    exercises.forEach(ex => {
      const day = ex.day || 'Sin día';
      const section = ex.section || 'Sin sección';
      allSections.add(`${day}-${section}`);
    });
    return allSections;
  });

  // Opciones para el desplegable de día
  const dayOptions = [
    { value: '', label: 'Selecciona un día' },
    { value: '1', label: 'Día 1' },
    { value: '2', label: 'Día 2' },
    { value: '3', label: 'Día 3' },
    { value: '4', label: 'Día 4' },
    { value: '5', label: 'Día 5' },
    { value: '6', label: 'Día 6' },
    { value: '7', label: 'Día 7' },
  ];

  // Opciones para el desplegable de sección (igual que en AddExerciseScreen)
  const sectionOptions = [
    { value: '', label: 'Selecciona una sección' },
    { value: 'Warm Up', label: 'Warm Up' },
    { value: 'Trabajo DS', label: 'Trabajo DS' },
    { value: 'Out', label: 'Out' },
  ];

  // Estado para modales y formularios
  // Estado para seguimiento semanal
  const [showWeeklyModal, setShowWeeklyModal] = React.useState(false);
  const [weeklyExercise, setWeeklyExercise] = React.useState(null);
  const [weekNumber, setWeekNumber] = React.useState("");
  const [weekWeight, setWeekWeight] = React.useState("");
  const [weekNotes, setWeekNotes] = React.useState("");
  
  // Estado para colapsar seguimiento semanal por ejercicio
  const [collapsedWeeklyTracking, setCollapsedWeeklyTracking] = React.useState(new Set());

  // Estado para seguimiento diario general de rutina
  const [showDailyModal, setShowDailyModal] = React.useState(false);
  const [dailyDate, setDailyDate] = React.useState("");
  const [dailyPF, setDailyPF] = React.useState("");
  const [dailyPE, setDailyPE] = React.useState("");

  // Estado para editar información de rutina
  const [showRoutineModal, setShowRoutineModal] = React.useState(false);
  const [routineName, setRoutineName] = React.useState("");
  const [routineStartDate, setRoutineStartDate] = React.useState("");
  const [routineEndDate, setRoutineEndDate] = React.useState("");
  const [routineDescription, setRoutineDescription] = React.useState("");

  // Funciones para manejar colapso/expansión
  const toggleDay = (day) => {
    const newCollapsedDays = new Set(collapsedDays);
    if (newCollapsedDays.has(day)) {
      newCollapsedDays.delete(day);
    } else {
      newCollapsedDays.add(day);
    }
    setCollapsedDays(newCollapsedDays);
  };

  const toggleSection = (daySection) => {
    const newCollapsedSections = new Set(collapsedSections);
    if (newCollapsedSections.has(daySection)) {
      newCollapsedSections.delete(daySection);
    } else {
      newCollapsedSections.add(daySection);
    }
    setCollapsedSections(newCollapsedSections);
  };

  const toggleWeeklyTracking = (exerciseId) => {
    const newCollapsedWeeklyTracking = new Set(collapsedWeeklyTracking);
    if (newCollapsedWeeklyTracking.has(exerciseId)) {
      newCollapsedWeeklyTracking.delete(exerciseId);
    } else {
      newCollapsedWeeklyTracking.add(exerciseId);
    }
    setCollapsedWeeklyTracking(newCollapsedWeeklyTracking);
  };

  // Función para calcular el mayor peso levantado por ejercicio
  const getMaxWeightForExercise = (exercise) => {
    if (!exercise.weeklyData) return 0;
    const weights = Object.values(exercise.weeklyData)
      .map(data => parseFloat(data.weight) || 0)
      .filter(weight => weight > 0);
    return weights.length > 0 ? Math.max(...weights) : 0;
  };

  // Función para renderizar todas las semanas del seguimiento
  const renderWeeklyTracking = (exercise) => {
    if (!routine.startDate || !routine.endDate) return null;
    
    const weekOptions = getWeekOptions();
    const isCollapsed = collapsedWeeklyTracking.has(exercise.id);
    const maxWeight = getMaxWeightForExercise(exercise);
    
    return (
      <div className="mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          onClick={() => toggleWeeklyTracking(exercise.id)}
        >
          <h6 className="text-sm font-semibold text-purple-700">
            Seguimiento Semanal {maxWeight > 0 && `(Máximo: ${maxWeight} kg)`}
          </h6>
          <svg 
            className={`w-4 h-4 text-purple-700 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {!isCollapsed && (
          <div className="mt-2">
            <table className="w-full text-sm border border-purple-300 rounded-lg overflow-hidden">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-2 py-1">Semana</th>
                  <th className="px-2 py-1">Peso (kg)</th>
                  <th className="px-2 py-1">Notas</th>
                  <th className="px-2 py-1">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {weekOptions.map(week => {
                  const weekData = exercise.weeklyData?.[week.value];
                  return (
                    <tr key={week.value} className="border-t">
                      <td className="px-2 py-1 font-medium">{week.label}</td>
                      <td className="px-2 py-1">
                        {weekData?.weight ? `${weekData.weight} kg` : '-'}
                      </td>
                      <td className="px-2 py-1">
                        {weekData?.generalNotes || '-'}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500">
                        {weekData?.date || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {maxWeight > 0 && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                <span className="font-semibold text-green-700">
                  Mayor peso levantado: {maxWeight} kg
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleOpenWeeklyModal = (exercise) => {
    setWeeklyExercise(exercise);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes("");
    setShowWeeklyModal(true);
  };

  const handleCloseWeeklyModal = () => {
    setShowWeeklyModal(false);
    setWeeklyExercise(null);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes("");
  };

  // Handlers para seguimiento diario general
  const handleOpenDailyModal = () => {
    setDailyDate(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
    setDailyPF("");
    setDailyPE("");
    setShowDailyModal(true);
  };

  const handleCloseDailyModal = () => {
    setShowDailyModal(false);
    setDailyDate("");
    setDailyPF("");
    setDailyPE("");
  };

  const handleSaveDaily = () => {
    if (!dailyDate || !dailyPF || !dailyPE) return;
    
    // Intentar obtener el ID de diferentes formas
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    
    if (!routineId) {
      console.error('Error: ID de rutina no encontrado para seguimiento diario', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }
    
    // Crear el objeto de datos diarios para la rutina
    const dailyData = {
      date: dailyDate,
      pf: parseInt(dailyPF),
      pe: parseInt(dailyPE),
      timestamp: new Date().toISOString()
    };

    // Llamar a la función para actualizar la rutina
    onUpdateRoutine({
      id: routineId,
      action: 'addDailyRoutineTracking',
      data: dailyData
    });

    handleCloseDailyModal();
  };

  // Handlers para editar información de rutina
  const handleOpenRoutineModal = () => {
    setRoutineName(routine.name || "");
    setRoutineStartDate(routine.startDate || "");
    setRoutineEndDate(routine.endDate || "");
    setRoutineDescription(routine.description || "");
    setShowRoutineModal(true);
  };

  const handleCloseRoutineModal = () => {
    setShowRoutineModal(false);
    setRoutineName("");
    setRoutineStartDate("");
    setRoutineEndDate("");
    setRoutineDescription("");
  };

  const handleSaveRoutine = () => {
    // Debug adicional al momento de guardar
    console.log('handleSaveRoutine - routine completa:', routine);
    console.log('handleSaveRoutine - routine.id:', routine?.id);
    console.log('handleSaveRoutine - typeof routine.id:', typeof routine?.id);
    
    // Intentar obtener el ID de diferentes formas
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    console.log('handleSaveRoutine - routineId encontrado:', routineId);
    
    // Validar que exista el ID de la rutina
    if (!routine || !routineId) {
      console.error('Error: ID de rutina no encontrado', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }

    // Crear el objeto de datos de la rutina
    const routineData = {
      name: routineName,
      startDate: routineStartDate,
      endDate: routineEndDate,
      description: routineDescription
    };

    console.log('Guardando rutina:', {
      id: routineId,
      action: 'updateRoutineInfo',
      data: routineData
    });

    // Llamar a la función para actualizar la rutina
    onUpdateRoutine({
      id: routineId,
      action: 'updateRoutineInfo',
      data: routineData
    });

    handleCloseRoutineModal();
  };

  const handleSaveWeekly = () => {
    if (!weekNumber || !weeklyExercise) return;
    
    // Intentar obtener el ID de diferentes formas
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    
    if (!routineId) {
      console.error('Error: ID de rutina no encontrado para seguimiento semanal', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }
    
    // Crear el objeto de datos semanales
    const weeklyData = {
      week: weekNumber,
      weight: weekWeight,
      generalNotes: weekNotes,
      date: new Date().toISOString().split('T')[0] // Fecha actual
    };

    // Llamar a la función para actualizar la rutina
    onUpdateRoutine({
      id: routineId,
      action: 'addWeeklyTracking',
      data: {
        exerciseId: weeklyExercise.id,
        weeklyData: weeklyData
      }
    });

    handleCloseWeeklyModal();
  };

  // Agrupar y renderizar ejercicios por día y sección
  let ejerciciosPorDia = null;
  if (exercises.length === 0) {
    ejerciciosPorDia = <p className="text-gray-600 text-center py-4">No hay ejercicios para seguimiento.</p>;
  } else {
    // Agrupar por día y luego por sección
    const groupedByDay = exercises.reduce((acc, ex) => {
      const day = ex.day || 'Sin día';
      if (!acc[day]) acc[day] = {};
      
      const section = ex.section || 'Sin sección';
      if (!acc[day][section]) acc[day][section] = [];
      acc[day][section].push(ex);
      
      return acc;
    }, {});

    // Orden específico de las secciones
    const sectionOrder = ['Warm Up', 'Trabajo DS', 'Out'];
    
    // Ordenar días
    const orderedDays = [
      '1','2','3','4','5','6','7'
    ].filter(d => groupedByDay[d]).concat(Object.keys(groupedByDay).filter(d => !['1','2','3','4','5','6','7'].includes(d)));

    ejerciciosPorDia = orderedDays.map(day => (
      <div key={day} className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          onClick={() => toggleDay(day)}
        >
          <h4 className="text-lg font-bold text-blue-700">
            {['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'Sin día asignado'}
          </h4>
          <svg 
            className={`w-5 h-5 text-blue-700 transform transition-transform ${collapsedDays.has(day) ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {!collapsedDays.has(day) && (
          <div className="mt-4">
            {/* Renderizar secciones en orden específico */}
            {sectionOrder.map(sectionName => {
              if (!groupedByDay[day][sectionName]) return null;
              
              const sectionKey = `${day}-${sectionName}`;
              
              return (
                <div key={sectionName} className="mb-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <h5 className="text-md font-semibold text-purple-700">{sectionName}</h5>
                    <svg 
                      className={`w-4 h-4 text-purple-700 transform transition-transform ${collapsedSections.has(sectionKey) ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {!collapsedSections.has(sectionKey) && (
                    <div className="grid gap-4 mt-3">
                      {groupedByDay[day][sectionName].map((ex) => (
                        <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h6 className="text-md font-semibold text-gray-800">{ex.name}</h6>
                              {ex.media && (
                                <button
                                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                  title="Ver video del ejercicio"
                                  onClick={() => window.open(ex.media, '_blank')}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {/* Botón para seguimiento semanal */}
                              {canAddDailyTracking && (
                                <button
                                  className="p-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                                  title="Agregar seguimiento semanal"
                                  onClick={() => handleOpenWeeklyModal(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              )}
                              {/* Botón para editar ejercicio si esEditable */}
                              {isEditable && (
                                <button
                                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                  title="Editar ejercicio"
                                  onClick={() => handleEditExerciseClick(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Mostrar detalles del ejercicio */}
                          {renderExerciseDetails(ex)}

                          {/* Mostrar seguimiento semanal */}
                          {renderWeeklyTracking(ex)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Mostrar ejercicios de secciones no estándar */}
            {Object.keys(groupedByDay[day]).filter(section => !sectionOrder.includes(section)).map(sectionName => {
              const sectionKey = `${day}-${sectionName}`;
              
              return (
                <div key={sectionName} className="mb-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <h5 className="text-md font-semibold text-gray-700">{sectionName}</h5>
                    <svg 
                      className={`w-4 h-4 text-gray-700 transform transition-transform ${collapsedSections.has(sectionKey) ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {!collapsedSections.has(sectionKey) && (
                    <div className="grid gap-4 mt-3">
                      {groupedByDay[day][sectionName].map((ex) => (
                        <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h6 className="text-md font-semibold text-gray-800">{ex.name}</h6>
                              {ex.media && (
                                <button
                                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                  title="Ver video del ejercicio"
                                  onClick={() => window.open(ex.media, '_blank')}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {/* Botón para seguimiento semanal */}
                              {canAddDailyTracking && (
                                <button
                                  className="p-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                                  title="Agregar seguimiento semanal"
                                  onClick={() => handleOpenWeeklyModal(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              )}
                              {/* Botón para editar ejercicio si esEditable */}
                              {isEditable && (
                                <button
                                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                  title="Editar ejercicio"
                                  onClick={() => handleEditExerciseClick(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Mostrar detalles del ejercicio */}
                          {renderExerciseDetails(ex)}

                          {/* Mostrar seguimiento semanal */}
                          {renderWeeklyTracking(ex)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    ));
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* Sección de información de la rutina */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-700">Información de la rutina</h2>
          {/* Botón para editar información de rutina, solo para admin y si existe ID */}
          {isEditable && (routine?.id || routine?.routine_id || routine?.client_id) && (
            <button
              onClick={handleOpenRoutineModal}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
              title="Editar información de rutina"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Fecha de inicio:</span>
            <p className="text-gray-600">{routine.startDate ? new Date(routine.startDate).toLocaleDateString() : "No definida"}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Fecha de fin:</span>
            <p className="text-gray-600">{routine.endDate ? new Date(routine.endDate).toLocaleDateString() : "No definida"}</p>
          </div>
        </div>
        
        {routine.description && routine.description.trim() !== "" && (
          <div className="mt-4">
            <span className="font-semibold text-gray-700">Descripción:</span>
            <p className="text-gray-600 mt-1">{routine.description}</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700">Ejercicios</h3>
          <div className="flex items-center gap-3">
            {/* Botón para seguimiento diario general de rutina */}
            {canAddDailyTracking && (
              <button
                onClick={handleOpenDailyModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 21 9v7.5m-9-13.5h.008v.008H12V8.25Z" />
                </svg>
                PF y PE
              </button>
            )}
            {/* Botón ícono para agregar ejercicio, solo para admin */}
            {isEditable && (
              <button
                onClick={() => onAddExerciseClick()}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
                title="Agregar Ejercicio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {ejerciciosPorDia}
        
        {/* Mostrar seguimiento diario general de la rutina */}
        {routine.dailyTracking && Object.keys(routine.dailyTracking).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-bold text-blue-700 mb-4">Percepciones</h4>
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-sm border border-blue-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">PF (0-5)</th>
                    <th className="px-3 py-2">PE (0-5)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(routine.dailyTracking)
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .map(([date, data]) => (
                      <tr key={date} className="border-t">
                        <td className="px-3 py-2">{date}</td>
                        <td className="px-3 py-2">{data.pf}</td>
                        <td className="px-3 py-2">{data.pe}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal para seguimiento diario general */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Seguimiento Diario de la Rutina</h3>
            <p className="text-sm text-gray-600 mb-4">Registra tu percepción de fatiga y esfuerzo</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del entrenamiento
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={dailyDate}
                onChange={e => setDailyDate(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Fatiga (PF): {dailyPF}/5
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={dailyPF}
                onChange={e => setDailyPF(e.target.value)}
              >
                <option value="">Selecciona PF (0-5)</option>
                <option value="0">0 - Sin fatiga</option>
                <option value="1">1 - Muy poca fatiga</option>
                <option value="2">2 - Poca fatiga</option>
                <option value="3">3 - Fatiga moderada</option>
                <option value="4">4 - Mucha fatiga</option>
                <option value="5">5 - Fatiga extrema</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Esfuerzo (PE): {dailyPE}/5
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={dailyPE}
                onChange={e => setDailyPE(e.target.value)}
              >
                <option value="">Selecciona PE (0-5)</option>
                <option value="0">0 - Sin esfuerzo</option>
                <option value="1">1 - Muy poco esfuerzo</option>
                <option value="2">2 - Poco esfuerzo</option>
                <option value="3">3 - Esfuerzo moderado</option>
                <option value="4">4 - Mucho esfuerzo</option>
                <option value="5">5 - Esfuerzo extremo</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCloseDailyModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSaveDaily}
                disabled={!dailyDate || !dailyPF || !dailyPE}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para agregar seguimiento semanal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Agregar seguimiento semanal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ejercicio: <span className="font-semibold">{weeklyExercise?.name}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semana del entrenamiento
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={weekNumber}
                onChange={e => setWeekNumber(e.target.value)}
              >
                <option value="">Selecciona la semana</option>
                {getWeekOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso levantado (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: 50.5"
                value={weekWeight}
                onChange={e => setWeekWeight(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales ({weekNotes.length}/100)
              </label>
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Observaciones sobre el entrenamiento..."
                maxLength={100}
                rows={3}
                value={weekNotes}
                onChange={e => setWeekNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCloseWeeklyModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                onClick={handleSaveWeekly}
                disabled={!weekNumber || !weekWeight}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para editar información de rutina */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar información de rutina</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la rutina
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Nombre de la rutina"
                value={routineName}
                onChange={e => setRoutineName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={routineStartDate}
                onChange={e => setRoutineStartDate(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de fin
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={routineEndDate}
                onChange={e => setRoutineEndDate(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción ({routineDescription.length}/250)
              </label>
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Descripción de la rutina (máx 250 caracteres)"
                maxLength={250}
                rows={4}
                value={routineDescription}
                onChange={e => setRoutineDescription(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCloseRoutineModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSaveRoutine}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para editar ejercicio */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar ejercicio</h3>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Nombre:</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Nombre del ejercicio"
                  value={exerciseName}
                  onChange={e => setExerciseName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Sección:</label>
                <select
                  className="flex-1 border rounded px-3 py-2"
                  value={exerciseSection}
                  onChange={e => setExerciseSection(e.target.value)}
                >
                  {sectionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Día:</label>
                <select
                  className="flex-1 border rounded px-3 py-2"
                  value={exerciseDay}
                  onChange={e => setExerciseDay(e.target.value)}
                >
                  {dayOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Series:</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Series"
                  value={exerciseSets}
                  onChange={e => setExerciseSets(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Repeticiones:</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Repeticiones"
                  value={exerciseReps}
                  onChange={e => setExerciseReps(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Peso (Kg):</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Peso (Kg)"
                  value={exerciseWeight}
                  onChange={e => setExerciseWeight(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Tiempo (seg):</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Tiempo (segundos)"
                  value={exerciseTime}
                  onChange={e => setExerciseTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Descanso (seg):</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Descanso (segundos)"
                  value={exerciseRest}
                  onChange={e => setExerciseRest(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Media:</label>
                <input
                  type="url"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="URL del video o imagen"
                  value={exerciseMedia}
                  onChange={e => setExerciseMedia(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowExerciseModal(false);
                  setEditExercise(null);
                }}
              >Cancelar</button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  // DEBUG: Información completa sobre el ejercicio a editar
                  console.log('=== DEBUG EDITAR EJERCICIO ===');
                  console.log('editExercise:', editExercise);
                  console.log('routine completa:', routine);
                  console.log('routine.id:', routine?.id);
                  console.log('routine.routine_id:', routine?.routine_id);
                  console.log('routine.client_id:', routine?.client_id);
                  console.log('Todas las propiedades de routine:', Object.keys(routine || {}));
                  
                  // Intentar obtener el ID de diferentes formas
                  const routineId = routine?.id || routine?.routine_id || routine?.client_id;
                  console.log('routineId detectado:', routineId);
                  
                  // Validar que exista el ID de la rutina
                  if (!routine || !routineId) {
                    console.error('Error: ID de rutina no encontrado', {
                      routine,
                      routineId,
                      availableKeys: Object.keys(routine || {}),
                      routineType: typeof routine,
                      routineConstructor: routine?.constructor?.name
                    });
                    alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
                    return;
                  }

                  // Datos del ejercicio a guardar
                  const exerciseData = {
                    ...editExercise,
                    name: exerciseName,
                    sets: exerciseSets,
                    reps: exerciseReps,
                    weight: exerciseWeight,
                    time: exerciseTime,
                    rest: exerciseRest,
                    day: exerciseDay,
                    section: exerciseSection,
                    media: exerciseMedia, // Incluir el campo media
                  };
                  
                  console.log('Datos a guardar:', exerciseData);
                  console.log('Llamando onUpdateRoutine con:', {
                    id: routineId,
                    action: 'editExercise',
                    data: exerciseData
                  });

                  // Guardar cambios - CORRIGIENDO EL FORMATO
                  onUpdateRoutine({
                    id: routineId,
                    action: 'editExercise',
                    data: exerciseData
                  });
                  setShowExerciseModal(false);
                  setEditExercise(null);
                  setExerciseName("");
                  setExerciseSets("");
                  setExerciseReps("");
                  setExerciseWeight("");
                  setExerciseTime("");
                  setExerciseRest("");
                  setExerciseDay("");
                  setExerciseSection("");
                  setExerciseMedia(""); // Limpiar el campo media
                }}
                disabled={!exerciseName.trim()}
              >Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetail;
