import React from "react";
import { supabase } from "../supabaseClient";
import ExerciseTimer from "./ExerciseTimer.jsx";
import { useScrollLock } from '../hooks/useScrollLock';

const RoutineDetail = ({
  routine,
  onUpdateRoutine = () => {},
  isEditable,
  onAddExerciseClick = () => {},
  canAddDailyTracking = false,
}) => {
  // Estado para edición de ejercicio
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [editExercise, setEditExercise] = React.useState(null);
  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseSets, setExerciseSets] = React.useState("");
  const [exerciseReps, setExerciseReps] = React.useState("");
  const [exerciseWeight, setExerciseWeight] = React.useState("");
  const [exerciseTime, setExerciseTime] = React.useState("");
  const [exerciseRest, setExerciseRest] = React.useState("");

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
  const [exerciseDay, setExerciseDay] = React.useState("");

  // Estado para modales y formularios
  // Estado para seguimiento semanal
  const [showWeeklyModal, setShowWeeklyModal] = React.useState(false);
  const [weeklyExercise, setWeeklyExercise] = React.useState(null);
  const [weekNumber, setWeekNumber] = React.useState("");
  const [weekWeight, setWeekWeight] = React.useState("");
  const [weekNotes, setWeekNotes] = React.useState("");
  const [weekSeriesTimes, setWeekSeriesTimes] = React.useState([]); // Tiempos por series
  const [seriesWeights, setSeriesWeights] = React.useState([]); // Pesos por series

  // Estados para el cronómetro
  const [showTimer, setShowTimer] = React.useState(false);
  const [timerExercise, setTimerExercise] = React.useState(null);
  const [timerData, setTimerData] = React.useState(null); // Datos del cronómetro
  const [editingWeeklyData, setEditingWeeklyData] = React.useState(null); // Para editar datos existentes
  const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0); // Índice del ejercicio actual en el cronómetro

  // Hook para bloquear scroll cuando hay modales abiertos
  useScrollLock(showExerciseModal || showWeeklyModal);

  const handleOpenWeeklyModal = (exercise) => {
    setWeeklyExercise(exercise);
    
    // Usar la semana predeterminada del entrenamiento si está disponible
    const savedTrainingWeek = localStorage.getItem('ds_selectedTrainingWeek');
    if (savedTrainingWeek) {
      setWeekNumber(`S${savedTrainingWeek}`);
    } else {
      setWeekNumber("");
    }
    
    setWeekWeight("");
    setWeekNotes("");
    setWeekSeriesTimes([]); // Limpiar tiempos de series
    setSeriesWeights([]); // Limpiar pesos de series
    setEditingWeeklyData(null); // Limpiar datos de edición
    
    // Detectar si el ejercicio usa dropsets en lugar de series
    const isDropset = (!exercise?.sets || parseInt(exercise?.sets) === 0) && exercise?.dropset;
    
    // Crear timerData básico para saber si es dropset
    if (isDropset) {
      setTimerData({ isDropset: true });
    } else {
      setTimerData(null); // Limpiar datos del cronómetro para ejercicios normales
    }
    
    setShowWeeklyModal(true);
  };

  // Función para abrir el cronómetro
  const handleOpenTimer = (exercise) => {
    // Encontrar el índice del ejercicio en la lista
    const exerciseIndex = exercises.findIndex(ex => ex.id === exercise.id);
    setCurrentExerciseIndex(exerciseIndex >= 0 ? exerciseIndex : 0);
    setTimerExercise(exercise);
    setShowTimer(true);
  };

  const handleCloseTimer = () => {
    setShowTimer(false);
    setTimerExercise(null);
  };

  // Función para manejar el cambio al siguiente ejercicio
  const handleNextExercise = () => {
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < exercises.length) {
      const nextExercise = exercises[nextIndex];
      setCurrentExerciseIndex(nextIndex);
      setTimerExercise(nextExercise);
      // Mantener el cronómetro abierto
      return true; // Indica que se cambió al siguiente ejercicio
    }
    return false; // No hay más ejercicios
  };

  // Función para guardar tiempo del cronómetro en seguimiento semanal
  const handleSaveTimeFromTimer = (timeData) => {
    console.log('=== CRONÓMETRO JSX: Iniciando guardado ===');
    console.log('1. Datos del cronómetro recibidos:', timeData);
    console.log('2. Ejercicio del cronómetro:', timerExercise);
    
    // Guardar los datos del cronómetro y abrir el modal de seguimiento semanal
    setTimerData(timeData);
    setWeeklyExercise(timerExercise);
    
    // Usar la semana predeterminada del entrenamiento si está disponible
    const savedTrainingWeek = localStorage.getItem('ds_selectedTrainingWeek');
    if (savedTrainingWeek) {
      setWeekNumber(`S${savedTrainingWeek}`);
    } else {
      setWeekNumber("");
    }
    
    setWeekWeight("");
    setWeekNotes(""); // Limpiar notas para que el usuario las complete
    
    // Inicializar arrays de pesos según el número de series
    const numSeries = parseInt(timerExercise?.sets) || parseInt(timerExercise?.dropset) || 3;
    setSeriesWeights(new Array(numSeries).fill(""));
    setWeekSeriesTimes(timeData.seriesTimes || []);
    
    console.log('3. Abriendo modal de seguimiento semanal...');
    setShowWeeklyModal(true);
    console.log('=== CRONÓMETRO JSX: Configuración completada ===');
  };

  // Función para cerrar el modal de seguimiento semanal
  const handleCloseWeeklyModal = () => {
    setShowWeeklyModal(false);
    setWeeklyExercise(null);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes("");
    setSeriesWeights([]); // Limpiar pesos de series
    // Limpiar datos del cronómetro al cerrar el modal
    setTimerData(null);
    setEditingWeeklyData(null); // Limpiar datos de edición
  };

  // Función para manejar cambios en los pesos de cada serie
  const handleSeriesWeightChange = (index, value) => {
    const newWeights = [...seriesWeights];
    newWeights[index] = value;
    setSeriesWeights(newWeights);
  };

  // Función para abrir el modal para editar datos existentes
  const handleEditWeeklyData = (exercise, week, data) => {
    console.log('=== EDITANDO DATOS EXISTENTES ===');
    console.log('1. Ejercicio:', exercise);
    console.log('2. Semana:', week);
    console.log('3. Datos:', data);
    
    setWeeklyExercise(exercise);
    setWeekNumber(week);
    setWeekNotes(data.notes || data.generalNotes || "");
    setEditingWeeklyData({ week, data }); // Marcar que estamos editando
    
    // Detectar si el ejercicio usa dropsets en lugar de series
    const isDropset = (!exercise?.sets || parseInt(exercise?.sets) === 0) && exercise?.dropset;
    
    // Crear timerData básico para saber si es dropset al editar
    if (isDropset) {
      setTimerData({ isDropset: true });
    } else {
      setTimerData(null); // No hay datos del cronómetro al editar ejercicios normales
    }
    
    const numSeries = parseInt(exercise.sets) || parseInt(exercise.dropset) || 3;
    
    // Si hay datos de series estructurados, cargarlos
    if (data.seriesData && Array.isArray(data.seriesData)) {
      console.log('4. Cargando datos de seriesData:', data.seriesData);
      setSeriesWeights(data.seriesData.map(s => s.weight || ""));
      setWeekSeriesTimes(data.seriesData.map(s => s.time || ""));
    } else {
      // Si solo hay peso general (datos antiguos), distribuirlo
      console.log('5. Datos antiguos - solo peso general:', data.weight);
      if (data.weight) {
        // Repetir el peso para todas las series
        setSeriesWeights(new Array(numSeries).fill(data.weight));
      } else {
        setSeriesWeights(new Array(numSeries).fill(""));
      }
      setWeekSeriesTimes(new Array(numSeries).fill(""));
    }
    
    console.log('6. Estados configurados - abriendo modal');
    setShowWeeklyModal(true);
  };

  // Función para guardar el seguimiento semanal
  const handleSaveWeekly = () => {
    if (!weekNumber) {
      alert('Por favor selecciona una semana');
      return;
    }

    console.log('=== GUARDANDO SEGUIMIENTO SEMANAL ===');
    console.log('1. seriesWeights:', seriesWeights);
    console.log('2. weekSeriesTimes:', weekSeriesTimes);
    console.log('3. timerData:', timerData);
    console.log('4. editingWeeklyData:', editingWeeklyData);

    // Crear objeto con los datos a guardar
    const weeklyDataToSave = {
      week: weekNumber,
      notes: weekNotes,
      date: new Date().toISOString(),
      // Datos de las series con pesos y tiempos
      seriesData: seriesWeights.map((weight, index) => ({
        serie: index + 1,
        serieType: (timerData && timerData.isDropset) ? 'dropset' : 'serie', // Agregar tipo de serie
        weight: weight || "",
        // Priorizar tiempos del cronómetro, luego tiempos existentes
        time: (timerData && timerData.formattedSeriesTimes && timerData.formattedSeriesTimes[index]) 
              ? timerData.formattedSeriesTimes[index].time 
              : (weekSeriesTimes[index] || "")
      })),
      // Campo weight para compatibilidad (usar el primer peso no vacío o el peso promedio)
      weight: (() => {
        const validWeights = seriesWeights.filter(w => w && w.trim() !== "");
        if (validWeights.length === 0) return "";
        if (validWeights.length === 1) return validWeights[0];
        // Si hay varios pesos, usar el primero (podrías cambiar esto por promedio si prefieres)
        return validWeights[0];
      })(),
      // Mantener generalNotes para compatibilidad
      generalNotes: weekNotes
    };

    // Lógica mejorada para el tiempo total
    if (timerData && timerData.formattedTotalTime) {
      // Si hay datos del cronómetro, usar ese tiempo total
      weeklyDataToSave.totalTime = timerData.formattedTotalTime;
      console.log('6. Usando totalTime del cronómetro:', timerData.formattedTotalTime);
    } else if (editingWeeklyData && editingWeeklyData.data.totalTime) {
      // Si estamos editando y hay tiempo total previo, preservarlo
      weeklyDataToSave.totalTime = editingWeeklyData.data.totalTime;
      console.log('7. Preservando totalTime existente:', editingWeeklyData.data.totalTime);
    } else {
      console.log('8. No hay totalTime para guardar');
    }

    console.log('9. Datos finales a guardar:', weeklyDataToSave);
    
    // Guardar los datos realmente usando onUpdateRoutine
    if (editingWeeklyData) {
      // Actualizar datos existentes
      onUpdateRoutine({
        id: routine.id,
        action: 'updateWeeklyTracking',
        data: {
          exerciseId: weeklyExercise.id,
          weeklyData: weeklyDataToSave
        }
      });
      console.log('10. Actualizando datos existentes para semana:', weekNumber);
    } else {
      // Agregar nuevos datos
      onUpdateRoutine({
        id: routine.id,
        action: 'addWeeklyTracking',
        data: {
          exerciseId: weeklyExercise.id,
          weeklyData: weeklyDataToSave
        }
      });
      console.log('11. Agregando nuevos datos para semana:', weekNumber);
    }
    
    alert(`Seguimiento semanal ${editingWeeklyData ? 'actualizado' : 'guardado'} exitosamente para la semana ${weekNumber}`);
    
    handleCloseWeeklyModal();
  };

  // ...existing logic and handlers...

  // Agrupar y renderizar ejercicios por día
  let ejerciciosPorDia = null;
  if (exercises.length === 0) {
    ejerciciosPorDia = <p className="text-gray-600 text-center py-4">No hay ejercicios para seguimiento.</p>;
  } else {
    const grouped = exercises.reduce((acc, ex) => {
      const day = ex.day || 'Sin día';
      if (!acc[day]) acc[day] = [];
      acc[day].push(ex);
      return acc;
    }, {});
    const orderedDays = [
      '1','2','3','4','5','6','7'
    ].filter(d => grouped[d]).concat(Object.keys(grouped).filter(d => !['1','2','3','4','5','6','7'].includes(d)));
    ejerciciosPorDia = orderedDays.map(day => (
      <div key={day} className="mb-6">
        <h4 className="text-md font-bold text-blue-700 mb-2">{['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'Sin día asignado'}</h4>
        <div className="grid gap-4">
          {grouped[day].map((ex) => (
            <div key={ex.id} className="p-2 bg-gray-50 rounded-xl shadow">
              <div className="flex items-center justify-between">
                <h5 className="text-md font-semibold text-gray-800">{ex.name}</h5>
                <div className="flex gap-2">
                  {/* Ícono para agregar seguimiento semanal, solo para clientes */}
                  {!isEditable && canAddDailyTracking && (
                    <button
                      data-guide="weekly-tracking"
                      className="p-1 rounded-full"
                      style={{ 
                        backgroundColor: '#000000', 
                        color: '#ffffff' 
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                      title="Agregar seguimiento semanal"
                      onClick={() => handleOpenWeeklyModal(ex)}
                    >
                      {/* Ícono clipboard/plus */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div><span className="font-semibold">Series:</span> {ex.sets || '-'}</div>
                <div><span className="font-semibold">Repeticiones:</span> {ex.reps || '-'}</div>
                <div><span className="font-semibold">Peso (Kg):</span> {ex.weight || '-'}</div>
                <div><span className="font-semibold">Tiempo (seg):</span> {ex.time || '-'}</div>
                <div><span className="font-semibold">Descanso (seg):</span> {ex.rest || '-'}</div>
                <div><span className="font-semibold">Día:</span> {ex.day || '-'}</div>
              </div>
              
              {/* Botón del cronómetro alineado a la derecha */}
              <div className="flex justify-end mt-1">
                <button
                  data-guide="timer-button"
                  className="flex flex-col items-center p-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-slate-100 transition-colors"
                  title="Cronómetro del ejercicio"
                  onClick={() => handleOpenTimer(ex)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-xs font-medium">Timer</span>
                </button>
              </div>
              {ex.weeklyData ? (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">💡 Haz clic en cualquier fila para editar los datos</p>
                  <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-2 py-1">Semana</th>
                        <th className="px-2 py-1">Peso</th>
                        <th className="px-2 py-1">Tiempo</th>
                        <th className="px-2 py-1">Notas</th>
                      </tr>
                    </thead>
                  <tbody>
                    {Object.entries(ex.weeklyData).map(([week, data]) => {
                      console.log(`=== TABLA: Semana ${week} ===`);
                      console.log('data completo:', data);
                      console.log('data.weight:', data.weight);
                      console.log('data.totalTime:', data.totalTime);
                      console.log('data.seriesData:', data.seriesData);
                      return (
                        <tr 
                          key={week} 
                          className="border-t hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleEditWeeklyData(ex, week, data)}
                          title="Haz clic para editar este registro"
                        >
                          <td className="px-2 py-1">{week}</td>
                          <td className="px-2 py-1">
                            {(() => {
                              // Mostrar peso: priorizar seriesData, luego weight legacy
                              if (data.seriesData && data.seriesData.length > 0) {
                                // Si hay datos de series, mostrar el primer peso o un resumen
                                const weights = data.seriesData.map(s => s.weight).filter(w => w);
                                if (weights.length === 0) return '-';
                                if (weights.length === 1) return weights[0] + ' kg';
                                // Si todos los pesos son iguales, mostrar uno solo
                                const uniqueWeights = [...new Set(weights)];
                                if (uniqueWeights.length === 1) return uniqueWeights[0] + ' kg';
                                // Si hay varios pesos diferentes, mostrar rango
                                return `${Math.min(...weights.map(w => parseFloat(w) || 0))}-${Math.max(...weights.map(w => parseFloat(w) || 0))} kg`;
                              } else if (data.weight) {
                                // Datos legacy
                                return data.weight + ' kg';
                              }
                              return '-';
                            })()}
                          </td>
                          <td className="px-2 py-1">
                            {data.totalTime ? (
                              <span className="text-green-600 font-semibold">{data.totalTime}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-2 py-1">{data.generalNotes || data.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              ) : (
                <p className="text-gray-500">Sin datos de seguimiento semanal.</p>
              )}
              {/* Botón para editar ejercicio si esEditable */}
              {isEditable && (
                <button
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleEditExerciseClick(ex)}
                >
                  Editar ejercicio
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  }

  // Función para guardar la rutina actual como plantilla
  const handleSaveAsTemplate = async () => {
    if (!routine.name || exercises.length === 0) {
      alert('La rutina debe tener un nombre y al menos un ejercicio para guardar como plantilla.');
      return;
    }

    const templateName = prompt(`Ingresa el nombre para la plantilla (actual: "${routine.name}"):`);
    if (!templateName || templateName.trim() === '') {
      return; // Usuario canceló
    }

    try {
      // Crear la plantilla sin datos específicos del cliente
      const templateData = {
        name: templateName.trim(),
        description: routine.description || '',
        exercises: exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets,
          dropset: ex.dropset,
          reps: ex.reps,
          weight: ex.weight,
          time: ex.time,
          rest: ex.rest,
          day: ex.day,
          section: ex.section,
          media: ex.media,
          rir: ex.rir,
          cadencia: ex.cadencia,
          round: ex.round,
          cantidadRounds: ex.cantidadRounds,
          notes: ex.notes
        })),
        // No incluir datos específicos del cliente como startDate, endDate, client_id
      };

      const { data, error } = await supabase
        .from('rutinas_templates')
        .insert([templateData])
        .select();

      if (error) {
        alert('Error al guardar la plantilla: ' + error.message);
      } else {
        alert('Plantilla guardada exitosamente. Ahora está disponible en la sección de plantillas.');
      }
    } catch (error) {
      alert('Error inesperado al guardar la plantilla: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700">Ejercicios por Día</h3>
          {isEditable && exercises.length > 0 && (
            <button
              onClick={handleSaveAsTemplate}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm flex items-center gap-2"
              title="Guardar esta rutina como plantilla"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Guardar como plantilla
            </button>
          )}
        </div>
        {ejerciciosPorDia}
      </div>
      {/* Modal para agregar seguimiento semanal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl my-4 max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold">
                {editingWeeklyData ? 'Editar seguimiento semanal' : 'Agregar seguimiento semanal'}
              </h3>
              {timerData && (
                <p className="text-sm text-gray-600 mt-1">
                  Ejercicio: <span className="font-semibold">{weeklyExercise?.name}</span> - Datos del cronómetro
                </p>
              )}
              {editingWeeklyData && (
                <p className="text-sm text-gray-600 mt-1">
                  Editando: <span className="font-semibold">{weeklyExercise?.name}</span> - Semana {editingWeeklyData.week}
                </p>
              )}
            </div>
            
            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <select
                className="w-full border rounded px-4 py-3 mb-6 text-lg"
                value={weekNumber}
                onChange={e => setWeekNumber(e.target.value)}
              >
                <option value="">Selecciona la semana</option>
                {getWeekOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Datos por serie</label>
                {timerData && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-green-700">Tiempos registrados con cronómetro</span>
                    </div>
                    <p className="text-xs text-green-600">
                      Los tiempos han sido registrados automáticamente. Completa los pesos para cada serie.
                    </p>
                  </div>
                )}
                {editingWeeklyData && !timerData && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-700">Editando datos existentes</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Puedes modificar los pesos y notas. Los tiempos registrados previamente se muestran aquí.
                    </p>
                  </div>
                )}
                {Array.from({ 
                  length: parseInt(weeklyExercise?.sets) || 
                          parseInt(weeklyExercise?.dropset) || 
                          (timerData && timerData.seriesTimes ? timerData.seriesTimes.length : 3) 
                }, (_, index) => (
                  <div key={index} className="mb-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {(timerData && timerData.isDropset) ? `Dropset ${index + 1}` : `Serie ${index + 1}`}
                      </span>
                      {(timerData && timerData.formattedSeriesTimes && timerData.formattedSeriesTimes[index]) ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          ⏱️ {timerData.formattedSeriesTimes[index].time}
                        </span>
                      ) : weekSeriesTimes[index] ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          ⏱️ {weekSeriesTimes[index]}
                        </span>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {/* Campo de peso */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Peso (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Ej: 80.5"
                          value={seriesWeights[index] || ""}
                          onChange={(e) => handleSeriesWeightChange(index, e.target.value)}
                        />
                      </div>
                      {/* Campo de tiempo */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Tiempo</label>
                        {timerData && timerData.formattedSeriesTimes && timerData.formattedSeriesTimes[index] ? (
                          <div className="w-full px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-sm text-green-700 font-semibold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-8a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timerData.formattedSeriesTimes[index].time}
                          </div>
                        ) : weekSeriesTimes[index] ? (
                          <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-700 font-semibold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-8a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {weekSeriesTimes[index]}
                          </div>
                        ) : (
                          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500">
                            Sin tiempo registrado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Tiempo total si hay datos del cronómetro */}
                {timerData && timerData.formattedTotalTime && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-8a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Tiempo Total del Ejercicio:</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{timerData.formattedTotalTime}</span>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      Este tiempo será guardado junto con los datos de las series
                    </div>
                  </div>
                )}

                {/* Tiempo total si estamos editando datos existentes */}
                {editingWeeklyData && editingWeeklyData.data.totalTime && !timerData && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-green-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-8a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Tiempo Total Registrado:</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{editingWeeklyData.data.totalTime}</span>
                    </div>
                    <div className="mt-2 text-xs text-green-600">
                      Tiempo total del ejercicio guardado previamente
                    </div>
                  </div>
                )}
              </div>
              
              <textarea
                className="w-full border rounded px-4 py-3 mb-6 text-lg resize-none"
                rows="3"
                placeholder="Notas (máx 100 caracteres)"
                maxLength={100}
                value={weekNotes}
                onChange={e => setWeekNotes(e.target.value)}
              />
            </div>
            
            {/* Footer fijo con botones */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 text-lg font-medium"
                  onClick={handleCloseWeeklyModal}
                >Cancelar</button>
                <button
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-lg font-medium"
                  onClick={handleSaveWeekly}
                  disabled={!weekNumber}
                >
                  {timerData ? 'Guardar seguimiento con tiempos' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal para editar ejercicio */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md my-4 max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-bold">Editar ejercicio</h3>
            </div>
            
            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <input
                type="text"
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="Nombre del ejercicio"
                value={exerciseName}
                onChange={e => setExerciseName(e.target.value)}
              />
              <select
                className="w-full border rounded px-3 py-2 mb-2"
                value={exerciseDay}
                onChange={e => setExerciseDay(e.target.value)}
              >
                {dayOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Series"
                value={exerciseSets}
                onChange={e => setExerciseSets(e.target.value)}
              />
              <input
                type="number"
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Repeticiones"
                value={exerciseReps}
                onChange={e => setExerciseReps(e.target.value)}
              />
              <input
                type="number"
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Peso (Kg)"
                value={exerciseWeight}
                onChange={e => setExerciseWeight(e.target.value)}
              />
              <input
                type="number"
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Tiempo (segundos)"
                value={exerciseTime}
                onChange={e => setExerciseTime(e.target.value)}
              />
              <input
                type="number"
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="Descanso (segundos)"
                value={exerciseRest}
                onChange={e => setExerciseRest(e.target.value)}
              />
            </div>
            
            {/* Footer fijo con botones */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
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
                    // Guardar cambios (puedes personalizar la lógica)
                    if (routine.id) {
                      onUpdateRoutine({
                        id: routine.id,
                        action: 'editExercise',
                        data: {
                          ...editExercise,
                          name: exerciseName,
                          sets: exerciseSets,
                          reps: exerciseReps,
                          weight: exerciseWeight,
                          time: exerciseTime,
                          rest: exerciseRest,
                          day: exerciseDay,
                        }
                      });
                      setShowExerciseModal(false);
                      setEditExercise(null);
                    } else {
                      alert('No se encontró el ID de la rutina.');
                    }
                  }}
                  disabled={!exerciseName.trim()}
                >Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cronómetro del ejercicio */}
      {showTimer && timerExercise && (
        <ExerciseTimer 
          exercise={{
            name: timerExercise.name,
            series: timerExercise.sets,
            repetitions: timerExercise.reps,
            weight: timerExercise.weight,
            rest: timerExercise.rest
          }}
          onClose={handleCloseTimer}
          onSaveTime={handleSaveTimeFromTimer}
          routineExercises={exercises}
          currentExerciseIndex={currentExerciseIndex}
          onNextExercise={handleNextExercise}
        />
      )}
    </div>
  );
};
export default RoutineDetail;
