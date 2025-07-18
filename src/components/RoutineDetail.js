// ...existing code...
import React from "react";

const RoutineDetail = ({
  routine,
  onUpdateRoutine = () => {},
  isEditable,
  onAddExerciseClick = () => {},
  canAddDailyTracking = false,
}) => {
  // Estado para colapsar/expandir rounds
  const [collapsedRounds, setCollapsedRounds] = React.useState({});

  // Función para colapsar/expandir un round
  const toggleRound = (day, section, round) => {
    const roundKey = `${day}-${section}-${round}`;
    setCollapsedRounds(prev => ({
      ...prev,
      [roundKey]: !prev[roundKey]
    }));
  };
  // Debug: Verificar que routine tiene ID
  console.log('RoutineDetail - routine recibida:', routine);
  console.log('RoutineDetail - routine.id:', routine?.id);
  console.log('RoutineDetail - isEditable:', isEditable);
  console.log('RoutineDetail - canAddDailyTracking:', canAddDailyTracking);

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
  const [exerciseRIR, setExerciseRIR] = React.useState(""); // Nuevo campo para RIR
  const [exerciseCadencia, setExerciseCadencia] = React.useState(""); // Nuevo campo para Cadencia
  const [exerciseRound, setExerciseRound] = React.useState(""); // Nuevo campo para Round
  const [exerciseCantidadRounds, setExerciseCantidadRounds] = React.useState(""); // Nuevo campo para cantidad de rounds
  const [exerciseNotes, setExerciseNotes] = React.useState(""); // Nuevo campo para notas adicionales

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
    setExerciseRIR(ex.rir || ""); // Incluir el campo RIR
    setExerciseCadencia(ex.cadencia || ""); // Incluir el campo Cadencia
    setExerciseRound(ex.round || ""); // Incluir el campo Round
    setExerciseCantidadRounds(ex.cantidadRounds || ""); // Incluir el campo cantidadRounds
    setExerciseNotes(ex.notes || ""); // Incluir el campo notas adicionales
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
      {ex.rir && <div><span className="font-semibold">RIR:</span> {ex.rir}</div>}
      {ex.cadencia && <div><span className="font-semibold">Cadencia:</span> {ex.cadencia}</div>}
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
    { value: 'Activación', label: 'Activación' },
    { value: 'Core', label: 'Core' },
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
  const [isEditingWeekly, setIsEditingWeekly] = React.useState(false);
  const [editingWeeklyData, setEditingWeeklyData] = React.useState(null);
  
  // Estado para colapsar seguimiento semanal por ejercicio - Inicializar con todos los ejercicios colapsados
  const [collapsedWeeklyTracking, setCollapsedWeeklyTracking] = React.useState(() => {
    // Crear un Set con todos los IDs de ejercicios para que inicien colapsados
    const allExerciseIds = new Set();
    exercises.forEach(ex => {
      allExerciseIds.add(ex.id);
    });
    return allExerciseIds;
  });

  // Estado para seguimiento diario general de rutina
  const [showDailyModal, setShowDailyModal] = React.useState(false);
  const [dailyDate, setDailyDate] = React.useState("");
  const [dailyPF, setDailyPF] = React.useState("");
  const [dailyPE, setDailyPE] = React.useState("");
  const [isEditingDaily, setIsEditingDaily] = React.useState(false);
  const [editingDailyDate, setEditingDailyDate] = React.useState("");

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
                  <th className="px-2 py-1 text-center w-20">Semana</th>
                  <th className="px-2 py-1 text-center w-24">Peso (kg)</th>
                  <th className="px-2 py-1 text-center w-auto">Notas</th>
                  <th className="px-2 py-1 text-center w-24">Fecha</th>
                  <th className="px-2 py-1 text-center w-20">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {weekOptions.map(week => {
                  const weekData = exercise.weeklyData?.[week.value];
                  return (
                    <tr key={week.value} className="border-t">
                      <td className="px-2 py-1 font-medium text-center">{week.label}</td>
                      <td className="px-2 py-1 text-center">
                        {weekData?.weight ? `${weekData.weight} kg` : '-'}
                      </td>
                      <td className="px-2 py-1 text-center max-w-0">
                        <div className="break-words whitespace-normal">
                          {weekData?.generalNotes || '-'}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500 text-center">
                        {weekData?.date || '-'}
                      </td>
                      <td className="px-2 py-1">
                        <div className="flex gap-1 justify-center">
                          {weekData ? (
                            <>
                              <button
                                className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                title="Editar seguimiento"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditWeeklyTracking(exercise, week.value, weekData);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                              </button>
                              <button
                                className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                                title="Eliminar seguimiento"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWeeklyTracking(exercise, week.value);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                              title="Agregar seguimiento"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWeeklyModal(exercise, week.value);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </button>
                          )}
                        </div>
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

  const handleOpenWeeklyModal = (exercise, weekValue = "") => {
    setWeeklyExercise(exercise);
    setWeekNumber(weekValue);
    setWeekWeight("");
    setWeekNotes("");
    setIsEditingWeekly(false);
    setEditingWeeklyData(null);
    setShowWeeklyModal(true);
  };

  const handleEditWeeklyTracking = (exercise, weekValue, weekData) => {
    console.log('handleEditWeeklyTracking called with:', { exercise, weekValue, weekData });
    try {
      setWeeklyExercise(exercise);
      setWeekNumber(weekValue);
      setWeekWeight(weekData.weight || "");
      setWeekNotes(weekData.generalNotes || "");
      setIsEditingWeekly(true);
      setEditingWeeklyData(weekData);
      setShowWeeklyModal(true);
    } catch (error) {
      console.error('Error in handleEditWeeklyTracking:', error);
      alert('Error al abrir el modal de edición: ' + error.message);
    }
  };

  const handleDeleteWeeklyTracking = (exercise, weekValue) => {
    console.log('handleDeleteWeeklyTracking called with:', { exercise, weekValue });
    try {
      if (!confirm('¿Estás seguro de que quieres eliminar este seguimiento semanal?')) {
        return;
      }
      
      // Obtener el ID de la rutina
      const routineId = routine?.id || routine?.routine_id || routine?.client_id;
      
      if (!routineId) {
        console.error('Error: ID de rutina no encontrado para eliminar seguimiento semanal', routine);
        alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
        return;
      }
      
      console.log('Deleting weekly tracking with data:', {
        id: routineId,
        action: 'deleteWeeklyTracking',
        data: {
          exerciseId: exercise.id,
          week: weekValue
        }
      });
      
      // Llamar a la función para eliminar el seguimiento semanal
      onUpdateRoutine({
        id: routineId,
        action: 'deleteWeeklyTracking',
        data: {
          exerciseId: exercise.id,
          week: weekValue
        }
      });
    } catch (error) {
      console.error('Error in handleDeleteWeeklyTracking:', error);
      alert('Error al eliminar el seguimiento: ' + error.message);
    }
  };

  const handleCloseWeeklyModal = () => {
    setShowWeeklyModal(false);
    setWeeklyExercise(null);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes("");
    setIsEditingWeekly(false);
    setEditingWeeklyData(null);
  };

  // Handlers para seguimiento diario general
  const handleOpenDailyModal = () => {
    setDailyDate(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
    setDailyPF("");
    setDailyPE("");
    setIsEditingDaily(false);
    setEditingDailyDate("");
    setShowDailyModal(true);
  };

  const handleEditDaily = (date, data) => {
    console.log('handleEditDaily called with:', { date, data });
    try {
      setDailyDate(date);
      setDailyPF(data?.pf != null ? data.pf.toString() : "");
      setDailyPE(data?.pe != null ? data.pe.toString() : "");
      setIsEditingDaily(true);
      setEditingDailyDate(date);
      setShowDailyModal(true);
    } catch (error) {
      console.error('Error in handleEditDaily:', error);
      console.error('Data received:', data);
      alert('Error al abrir el modal de edición: ' + error.message);
    }
  };

  const handleDeleteDaily = (date) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro diario?')) {
      return;
    }
    
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    
    if (!routineId) {
      console.error('Error: ID de rutina no encontrado para eliminar seguimiento diario', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }
    
    onUpdateRoutine({
      id: routineId,
      action: 'deleteDailyRoutineTracking',
      data: { date }
    });
  };

  const handleCloseDailyModal = () => {
    setShowDailyModal(false);
    setDailyDate("");
    setDailyPF("");
    setDailyPE("");
    setIsEditingDaily(false);
    setEditingDailyDate("");
  };

  const handleSaveDaily = () => {
    if (!dailyDate || !dailyPF || !dailyPE) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    // Intentar obtener el ID de diferentes formas
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    
    if (!routineId) {
      console.error('Error: ID de rutina no encontrado para seguimiento diario', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }
    
    try {
      // Crear el objeto de datos diarios para la rutina
      const dailyData = {
        date: dailyDate,
        pf: parseInt(dailyPF) || 0,
        pe: parseInt(dailyPE) || 0,
        timestamp: new Date().toISOString()
      };

      console.log('Saving daily data:', dailyData);
      console.log('Is editing:', isEditingDaily);

      // Llamar a la función para actualizar la rutina
      onUpdateRoutine({
        id: routineId,
        action: isEditingDaily ? 'updateDailyRoutineTracking' : 'addDailyRoutineTracking',
        data: isEditingDaily ? { ...dailyData, originalDate: editingDailyDate } : dailyData
      });

      handleCloseDailyModal();
    } catch (error) {
      console.error('Error in handleSaveDaily:', error);
      alert('Error al guardar el seguimiento diario: ' + error.message);
    }
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
    console.log('handleSaveWeekly called with:', {
      weekNumber,
      weeklyExercise,
      weekWeight,
      weekNotes,
      isEditingWeekly,
      editingWeeklyData
    });
    
    if (!weekNumber || !weeklyExercise) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    try {
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
        date: isEditingWeekly ? editingWeeklyData.date : new Date().toISOString().split('T')[0] // Mantener fecha original si se está editando
      };

      const updateData = {
        id: routineId,
        action: isEditingWeekly ? 'updateWeeklyTracking' : 'addWeeklyTracking',
        data: {
          exerciseId: weeklyExercise.id,
          weeklyData: weeklyData
        }
      };

      console.log('Calling onUpdateRoutine with:', updateData);

      // Llamar a la función para actualizar la rutina
      onUpdateRoutine(updateData);

      handleCloseWeeklyModal();
    } catch (error) {
      console.error('Error in handleSaveWeekly:', error);
      alert('Error al guardar el seguimiento: ' + error.message);
    }
  };

  // Handlers para eliminar ejercicios, días y secciones
  const handleDeleteExercise = (exerciseId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      return;
    }
    
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    
    if (!routineId) {
      console.error('Error: ID de rutina no encontrado para eliminar ejercicio', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }
    
    onUpdateRoutine({
      id: routineId,
      action: 'deleteExercise',
      data: { exerciseId }
    });
  };

  const handleDeleteDay = (day) => {
    console.log('handleDeleteDay called with day:', day);
    console.log('routine:', routine);
    console.log('isEditable:', isEditable);
    
    if (!confirm(`¿Estás seguro de que quieres eliminar todos los ejercicios del ${['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'día sin asignar'}?`)) {
      return;
    }
    
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    
    if (!routineId) {
      console.error('Error: ID de rutina no encontrado para eliminar día', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }
    
    console.log('Calling onUpdateRoutine with:', { id: routineId, action: 'deleteDay', data: { day } });
    
    onUpdateRoutine({
      id: routineId,
      action: 'deleteDay',
      data: { day }
    });
  };

  const handleDeleteSection = (day, section) => {
    console.log('handleDeleteSection called with:', { day, section });
    console.log('routine:', routine);
    console.log('isEditable:', isEditable);
    
    if (!confirm(`¿Estás seguro de que quieres eliminar todos los ejercicios de la sección "${section}" del ${['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'día sin asignar'}?`)) {
      return;
    }
    
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    
    if (!routineId) {
      console.error('Error: ID de rutina no encontrado para eliminar sección', routine);
      alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
      return;
    }
    
    console.log('Calling onUpdateRoutine with:', { id: routineId, action: 'deleteSection', data: { day, section } });
    
    onUpdateRoutine({
      id: routineId,
      action: 'deleteSection',
      data: { day, section }
    });
  };

  // Agrupar y renderizar ejercicios por día y sección
  let ejerciciosPorDia = null;
  if (exercises.length === 0) {
    ejerciciosPorDia = <p className="text-gray-600 text-center py-4">No hay ejercicios para seguimiento.</p>;
  } else {
    // Agrupar por día, sección y round
    const groupedByDay = exercises.reduce((acc, ex) => {
      const day = ex.day || 'Sin día';
      if (!acc[day]) acc[day] = {};

      const section = ex.section || 'Sin sección';
      if (!acc[day][section]) acc[day][section] = {};

      // Agrupar por round si existe, si no, usar 'Sin round'
      const round = ex.round ? `Round ${ex.round}` : 'Sin round';
      if (!acc[day][section][round]) acc[day][section][round] = [];
      acc[day][section][round].push(ex);

      return acc;
    }, {});

    // Orden específico de las secciones
    const sectionOrder = ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'];

    // Mapeo de colores degradé para cada sección
    const sectionGradientColors = {
      'Warm Up': 'bg-gradient-to-r from-purple-900 to-purple-800 text-white', // más oscuro
      'Activación': 'bg-gradient-to-r from-purple-800 to-purple-700 text-white',
      'Core': 'bg-gradient-to-r from-purple-700 to-purple-500 text-white',
      'Trabajo DS': 'bg-gradient-to-r from-purple-500 to-purple-300 text-white',
      'Out': 'bg-gradient-to-r from-purple-200 to-purple-100 text-purple-900', // más claro
    };
    
    // Ordenar días
    const orderedDays = [
      '1','2','3','4','5','6','7'
    ].filter(d => groupedByDay[d]).concat(Object.keys(groupedByDay).filter(d => !['1','2','3','4','5','6','7'].includes(d)));

    ejerciciosPorDia = orderedDays.map(day => (
      <div key={day} className="mb-6">
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center justify-between cursor-pointer p-1 sm:p-2 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex-1 min-h-[32px]"
            style={{ minHeight: '32px' }}
            onClick={() => toggleDay(day)}
          >
            <h4 className="text-base font-bold text-blue-700" style={{ fontSize: '15px' }}>
              {['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'Sin día asignado'}
            </h4>
            <div className="flex items-center gap-2">
              <svg 
                className={`w-4 h-4 text-blue-700 transform transition-transform ${collapsedDays.has(day) ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Botón para eliminar día completo - Fuera del contenedor como columna separada */}
          {isEditable && (
            <button
              onClick={(e) => {
                console.log('Delete day button clicked for day:', day);
                e.stopPropagation();
                handleDeleteDay(day);
              }}
              className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors flex-shrink-0"
              title="Eliminar día completo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
        
        {!collapsedDays.has(day) && (
          <div className="mt-4">
            {/* Renderizar secciones en orden específico */}
            {sectionOrder.map(sectionName => {
              if (!groupedByDay[day][sectionName]) return null;
              const sectionKey = `${day}-${sectionName}`;
              return (
                <div key={sectionName} className="mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-between cursor-pointer px-2 py-1 rounded-md transition-colors flex-1 text-sm ${sectionGradientColors[sectionName] || 'bg-purple-50 text-purple-900'}`}
                      onClick={() => toggleSection(sectionKey)}
                    >
                      <h5 className="font-semibold text-sm">{sectionName}</h5>
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-3 h-3 transform transition-transform ${collapsedSections.has(sectionKey) ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {isEditable && (
                      <button
                        onClick={(e) => {
                          console.log('Delete section button clicked for:', { day, section: sectionName });
                          e.stopPropagation();
                          handleDeleteSection(day, sectionName);
                        }}
                        className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors flex-shrink-0"
                        title="Eliminar sección completa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {!collapsedSections.has(sectionKey) && (
                    <div className="grid gap-4 mt-3">
                      {(() => {
                        // rounds: todos los keys salvo 'Sin round'
                        const allRounds = Object.keys(groupedByDay[day][sectionName]).filter(r => r !== 'Sin round');
                        // ejercicios sin round
                        const noRoundExercises = groupedByDay[day][sectionName]['Sin round'] || [];
                        // Renderizar rounds colapsables
                        const roundBlocks = allRounds
                          .sort((a, b) => {
                            const getRoundNumber = (roundStr) => {
                              if (roundStr.startsWith('Round ')) {
                                const num = parseInt(roundStr.replace('Round ', ''));
                                return isNaN(num) ? Infinity : num;
                              }
                              return Infinity;
                            };
                            return getRoundNumber(a) - getRoundNumber(b);
                          })
                          .map(roundName => {
                            const roundKey = `${day}-${sectionName}-${roundName}`;
                            const isCollapsed = collapsedRounds[roundKey];
                            // Buscar la cantidad de rounds del primer ejercicio del grupo
                            const firstExercise = groupedByDay[day][sectionName][roundName][0];
                            const cantidadRounds = firstExercise && firstExercise.cantidadRounds ? firstExercise.cantidadRounds : '';
                            return (
                              <div key={roundName} className="mb-2">
                                <div
                                  className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 transition-colors mb-1 text-sm"
                                  onClick={() => toggleRound(day, sectionName, roundName)}
                                >
                                  <span className="font-semibold text-purple-700 text-sm">
                                    {`${roundName}${cantidadRounds ? ` - x${cantidadRounds}` : ''}`}
                                  </span>
                                  <svg
                                    className={`w-4 h-4 text-gray-700 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                                {!isCollapsed && (
                                  <div>
                                    {Array.isArray(groupedByDay[day][sectionName][roundName]) && groupedByDay[day][sectionName][roundName].map((ex) => (
                                      <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow">
                                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col gap-1">
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
                              {ex.notes && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <span className="font-semibold">Notas: </span>{ex.notes}
                                </div>
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
                                            {/* Botón para eliminar ejercicio */}
                                            {isEditable && (
                                              <button
                                                className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                                                title="Eliminar ejercicio"
                                                onClick={() => handleDeleteExercise(ex.id)}
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
                          });
                        // Renderizar ejercicios sin round directamente
                        const noRoundBlocks = noRoundExercises.map((ex) => (
                          <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow mb-2">
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
                                {/* Botón para eliminar ejercicio */}
                                {isEditable && (
                                  <button
                                    className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                                    title="Eliminar ejercicio"
                                    onClick={() => handleDeleteExercise(ex.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
                        ));
                        return [
                          ...roundBlocks,
                          ...noRoundBlocks
                        ];
                      })()}
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
                    <div className="flex items-center gap-2">
                      {/* Botón para eliminar sección completa */}
                      {isEditable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(day, sectionName);
                          }}
                          className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                          title="Eliminar sección completa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                      <svg 
                        className={`w-4 h-4 text-gray-700 transform transition-transform ${collapsedSections.has(sectionKey) ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {!collapsedSections.has(sectionKey) && (
                    <div className="grid gap-4 mt-3">
                      {Array.isArray(groupedByDay[day][sectionName]) && groupedByDay[day][sectionName].map((ex) => (
                        <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow">
                          <div className="flex items-center justify-between mb-2">
                              <div className="flex flex-col gap-1 w-full">
                                <div className="bg-gray-100 rounded-lg px-4 py-1 w-full mx-[-16px] flex items-center" style={{marginLeft: '-16px', marginRight: '-16px'}}>
                                  <h6 className="text-md font-semibold text-gray-800 flex-1">{ex.name}</h6>
                                  {ex.media && (
                                    <button
                                      className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors ml-2"
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
                                {ex.notes && (
                                  <div className="text-xs text-gray-600 mt-1 ml-2">
                                    <span className="font-semibold">Notas: </span>{ex.notes}
                                  </div>
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
                              {/* Botón para eliminar ejercicio */}
                              {isEditable && (
                                <button
                                  className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                                  title="Eliminar ejercicio"
                                  onClick={() => handleDeleteExercise(ex.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
    <div className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-md w-full max-w-none mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {routine.name || 'Rutina sin nombre'}
        </h2>
        
        {/* Botón para editar rutina */}
        {isEditable && (
          <button
            onClick={handleOpenRoutineModal}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
            title="Editar rutina"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Información básica de la rutina */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Fecha de inicio:</span> {routine.startDate || 'No especificada'}
          </div>
          <div>
            <span className="font-semibold">Fecha de fin:</span> {routine.endDate || 'No especificada'}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Descripción:</span> {routine.description || 'Sin descripción'}
          </div>
        </div>
      </div>

      {/* Lista de ejercicios */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Ejercicios</h3>
          {/* Botón para agregar nuevo ejercicio */}
      {isEditable && (
        <button
          onClick={() => {
            setEditExercise(null);
            setExerciseDay(dayOptions[0]?.value || '');
            setExerciseSection(sectionOptions[0]?.value || '');
            setExerciseRound('');
            setExerciseCantidadRounds('');
            setExerciseName('');
            setExerciseSets('');
            setExerciseReps('');
            setExerciseWeight('');
            setExerciseTime('');
            setExerciseRest('');
            setExerciseRIR('');
            setExerciseCadencia('');
            setExerciseMedia('');
            setExerciseNotes('');
            setShowExerciseModal(true);
          }}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
          title="Agregar nuevo ejercicio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}
        </div>
        {ejerciciosPorDia}
      </div>

      {/* Sección de Percepciones (Seguimiento Diario) */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors mb-4"
        >
          <h3 className="text-lg font-semibold text-green-700">Percepciones</h3>
          <div className="flex items-center gap-2">
            {/* Botón para agregar seguimiento diario */}
            {canAddDailyTracking && (
              <button
                onClick={handleOpenDailyModal}
                className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                title="Agregar Seguimiento Diario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Tabla de seguimiento diario */}
        {routine.dailyTracking && Object.keys(routine.dailyTracking).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-green-300 rounded-lg overflow-hidden">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-2 py-1 text-center w-28">Fecha</th>
                  <th className="px-2 py-1 text-center w-16">PF</th>
                  <th className="px-2 py-1 text-center w-16">PE</th>
                  <th className="px-2 py-1 text-center w-20">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(routine.dailyTracking)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .map(([date, data]) => (
                    <tr key={date} className="border-t">
                      <td className="px-2 py-1 text-center text-xs">{date}</td>
                      <td className="px-2 py-1 text-center font-medium">{data.pf}</td>
                      <td className="px-2 py-1 text-center font-medium">{data.pe}</td>
                      <td className="px-2 py-1">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleEditDaily(date, data)}
                            className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                            title="Editar seguimiento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteDaily(date)}
                            className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                            title="Eliminar seguimiento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No hay percepciones registradas aún.
          </div>
        )}
      </div>

      {/* Modal para seguimiento diario general */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {isEditingDaily ? 'Editar seguimiento diario' : 'Seguimiento Diario de la Rutina'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isEditingDaily ? 'Modifica tu percepción de fatiga y esfuerzo' : 'Registra tu percepción de fatiga y esfuerzo'}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del entrenamiento
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dailyDate}
                onChange={e => setDailyDate(e.target.value)}
                disabled={isEditingDaily}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Fatiga (PF) - 1 a 10
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 7"
                value={dailyPF}
                onChange={e => setDailyPF(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Esfuerzo (PE) - 1 a 10
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 8"
                value={dailyPE}
                onChange={e => setDailyPE(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                value={exerciseNotes}
                onChange={(e) => setExerciseNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cualquier nota relevante sobre el ejercicio"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDaily}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditingDaily ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                onClick={handleCloseDailyModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para seguimiento semanal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {isEditingWeekly ? 'Editar seguimiento semanal' : 'Seguimiento Semanal'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ejercicio: <span className="font-semibold">{weeklyExercise?.name}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semana
              </label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isEditingWeekly}
              >
                <option value="">Selecciona una semana</option>
                {getWeekOptions().map(week => (
                  <option key={week.value} value={week.value}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weekWeight}
                onChange={(e) => setWeekWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 80.5"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas generales
              </label>
              <textarea
                value={weekNotes}
                onChange={(e) => setWeekNotes(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones, sensaciones, etc."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSaveWeekly}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditingWeekly ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                onClick={handleCloseWeeklyModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar información de rutina */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Rutina</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la rutina
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Rutina de fuerza"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={routineStartDate}
                onChange={(e) => setRoutineStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de fin
              </label>
              <input
                type="date"
                value={routineEndDate}
                onChange={(e) => setRoutineEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe los objetivos y características de la rutina"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSaveRoutine}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={handleCloseRoutineModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar ejercicio */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto text-xs" style={{ fontSize: '12px' }}>
            <h3 className="text-base font-bold mb-4">
              {editExercise ? 'Editar Ejercicio' : 'Agregar Ejercicio'}
            </h3>
            {/* Sección 1: Día, Sección, Round, Cant. rounds */}
            <div className="mb-6 border-b pb-4 bg-blue-50 rounded-lg p-3">
              <div className="flex gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Día</label>
                  <select value={exerciseDay} onChange={(e) => setExerciseDay(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" style={{ fontSize: '12px' }}>
                    {dayOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sección</label>
                  <select value={exerciseSection} onChange={(e) => setExerciseSection(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" style={{ fontSize: '12px' }}>
                    {sectionOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Round</label>
                  <input type="text" value={exerciseRound} onChange={(e) => setExerciseRound(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 1" style={{ fontSize: '12px' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cant. rounds</label>
                  <input type="number" value={exerciseCantidadRounds} onChange={(e) => setExerciseCantidadRounds(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 3" min="1" style={{ fontSize: '12px' }} />
                </div>
              </div>
            </div>
            {/* Sección 2: Resto de campos */}
            <div className="mb-6 bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del ejercicio</label>
                  <input type="text" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: Sentadilla" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Series</label>
                  <input type="text" value={exerciseSets} onChange={(e) => setExerciseSets(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 3" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Repeticiones</label>
                  <input type="text" value={exerciseReps} onChange={(e) => setExerciseReps(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 10-12" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input type="text" value={exerciseWeight} onChange={(e) => setExerciseWeight(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 80" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tiempo (seg)</label>
                  <input type="text" value={exerciseTime} onChange={(e) => setExerciseTime(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 30" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descanso (seg)</label>
                  <input type="text" value={exerciseRest} onChange={(e) => setExerciseRest(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 90" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">RIR (Reps in Reserve)</label>
                  <input type="text" value={exerciseRIR} onChange={(e) => setExerciseRIR(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 2" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cadencia</label>
                  <input type="text" value={exerciseCadencia} onChange={(e) => setExerciseCadencia(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 3-1-2-1" style={{ fontSize: '12px' }} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">URL de Media (video/imagen)</label>
                  <input type="url" value={exerciseMedia} onChange={(e) => setExerciseMedia(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: https://youtube.com/ejercicio" style={{ fontSize: '12px' }} />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notas adicionales</label>
                  <textarea value={exerciseNotes} onChange={(e) => setExerciseNotes(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Cualquier nota relevante sobre el ejercicio" rows={3} style={{ fontSize: '12px' }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const routineId = routine?.id || routine?.routine_id || routine?.client_id;
                  if (!routine || !routineId) {
                    alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
                    return;
                  }
                  const exerciseData = {
                    name: exerciseName,
                    sets: exerciseSets,
                    reps: exerciseReps,
                    weight: exerciseWeight,
                    time: exerciseTime,
                    rest: exerciseRest,
                    day: exerciseDay,
                    section: exerciseSection,
                    media: exerciseMedia,
                    rir: exerciseRIR,
                    cadencia: exerciseCadencia,
                    round: exerciseRound,
                    cantidadRounds: exerciseCantidadRounds,
                    notes: exerciseNotes,
                  };
                  if (editExercise && editExercise.id) {
                    // Editar ejercicio existente
                    const updatedExercises = Array.isArray(routine.exercises) ? routine.exercises.map(ex => ex.id === editExercise.id ? { ...exerciseData, id: editExercise.id } : ex) : [{ ...exerciseData, id: editExercise.id }];
                    onUpdateRoutine({
                      id: routineId,
                      exercises: updatedExercises
                    });
                  } else {
                    // Agregar nuevo ejercicio
                    const newId = '_' + Math.random().toString(36).substr(2, 9);
                    const updatedExercises = Array.isArray(routine.exercises) ? [...routine.exercises, { ...exerciseData, id: newId }] : [{ ...exerciseData, id: newId }];
                    onUpdateRoutine({
                      id: routineId,
                      exercises: updatedExercises
                    });
                  }
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
                  setExerciseMedia("");
                  setExerciseRIR("");
                  setExerciseCadencia("");
                  setExerciseRound("");
                  setExerciseCantidadRounds("");
                  setExerciseNotes("");
                }}
                disabled={!exerciseName.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
              >Guardar</button>
              <button
                onClick={() => {
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
                  setExerciseRIR(""); // Limpiar el campo RIR
                  setExerciseCadencia(""); // Limpiar el campo Cadencia
                  setExerciseRound(""); // Limpiar el campo Round
                  setExerciseCantidadRounds(""); // Limpiar el campo cantidadRounds
                  setExerciseNotes(""); // Limpiar el campo notas adicionales
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetail;
