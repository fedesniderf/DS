import React from "react";
import PFPETable from "./PFPETable";
import { supabase } from "../supabaseClient";
import ExerciseTimer from "./ExerciseTimer.jsx";

// Utilidad para limpiar datos antiguos de dailyTracking
function cleanOldDailyTracking(dailyTracking) {
  if (!dailyTracking || typeof dailyTracking !== 'object') return {};
  const validKeys = /^Día \d$/;
  const cleaned = {};
  Object.entries(dailyTracking).forEach(([key, value]) => {
    if (validKeys.test(key) && value) {
      if (Array.isArray(value)) {
        // Filtrar solo los objetos válidos con PFPE
        const validArray = value.filter(v => v && typeof v === 'object' && v.PFPE);
        if (validArray.length > 0) cleaned[key] = validArray;
      } else if (typeof value === 'object' && value.PFPE) {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
}

// Ordenar los registros de PF/PE por semana antes de pasarlos a la tabla
function sortPFPEByWeek(recordsArray) {
  if (!Array.isArray(recordsArray)) return recordsArray;
  // Ordenar por el campo week (S1, S2, S3, ...)
  return recordsArray.slice().sort((a, b) => {
    // Extraer el número de semana, si no existe, poner al final
    const getWeekNum = (rec) => {
      const wk = rec?.PFPE?.week;
      if (typeof wk === 'string' && /^S\d+$/.test(wk)) {
        const num = parseInt(wk.replace('S', ''));
        return isNaN(num) ? 999 : num;
      }
      return 999;
    };
    const numA = getWeekNum(a);
    const numB = getWeekNum(b);
    // Si ambos tienen semana, comparar
    if (numA !== numB) return numA - numB;
    // Si son iguales, mantener el orden original
    return 0;
  });
}

// ...existing code...

const RoutineDetail = (props) => {
// Handler para limpiar registros antiguos de dailyTracking
  // const handleCleanOldDailyTracking = () => {
// (handleCleanOldDailyTracking function and all references removed)
  // Desestructurar props para evitar ReferenceError
  const {
    routine = {},
    onUpdateRoutine,
    isEditable = false,
    canAddDailyTracking = false
  } = props;
// ...existing code...
// (Botón de limpiar registros antiguos de PF/PE/Notas oculto de la UI)
    const handleEditPFPE = (dayKey, idx, newPFPE) => {
      console.log('RoutineDetail handleEditPFPE called:', { dayKey, idx, newPFPE });
      const prevArray = Array.isArray(routine.dailyTracking?.[dayKey]) ? routine.dailyTracking[dayKey] : [];
      const updatedArray = prevArray.map((row, i) => {
        if (i === idx) {
          return { PFPE: newPFPE };
        }
        return row;
      });
      const newDailyTracking = {
        ...(routine.dailyTracking || {}),
        [dayKey]: updatedArray
      };
      if (typeof onUpdateRoutine === 'function') {
        onUpdateRoutine({
          id: routine.id,
          action: 'updateDailyTracking',
          data: { dailyTracking: newDailyTracking }
        });
      }
    };

    const handleDeletePFPE = (dayKey, idx) => {
      if (!window.confirm('¿Estás seguro de que quieres eliminar este registro de seguimiento semanal (PF y PE)?')) {
        return;
      }
      console.log('RoutineDetail handleDeletePFPE called:', { dayKey, idx });
      const prevArray = Array.isArray(routine.dailyTracking?.[dayKey]) ? routine.dailyTracking[dayKey] : [];
      const updatedArray = prevArray.filter((_, i) => i !== idx);
      const newDailyTracking = {
        ...(routine.dailyTracking || {}),
        [dayKey]: updatedArray
      };
      if (typeof onUpdateRoutine === 'function') {
        onUpdateRoutine({
          id: routine.id,
          action: 'updateDailyTracking',
          data: { dailyTracking: newDailyTracking }
        });
      }
    };

  // Función para calcular semanas restantes
  const calculateRemainingWeeks = () => {
    if (!routine.endDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación precisa
    
    const endDate = new Date(routine.endDate);
    endDate.setHours(23, 59, 59, 999); // Fin del día de la fecha de fin
    
    // Si la rutina ya terminó, devolver 0
    if (today > endDate) return 0;
    
    // Calcular la diferencia en milisegundos y convertir a semanas
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.ceil(diffDays / 7);
    
    return Math.max(0, diffWeeks);
  };

  // Función para formatear fecha a DD/MM/AA
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
    return `${day}/${month}/${year}`;
  };

  // Helper to render PFPE tables
  const [showPFPENotesModal, setShowPFPENotesModal] = React.useState({ open: false, notes: '' });
  const renderPFPETables = (cleanedDailyTracking) => {
    return Object.entries(cleanedDailyTracking).map(([day, records]) => {
      // Asegurar que records siempre sea un array
      let safeRecords = [];
      if (Array.isArray(records)) {
        safeRecords = records;
      } else if (records && typeof records === 'object') {
        safeRecords = [records];
      }
      return (
        <div key={day} className="mb-4">
          {/* Ocultar el título del día solo para la tabla de Seguimiento semanal - PF y PE */}
          {!(day && day.startsWith('Día')) && (
            <h5 className="font-semibold text-green-700 mb-2">{day}</h5>
          )}
          <div className="w-full overflow-x-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden text-center text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-center">Semana</th>
                    <th className="px-2 py-1 text-center">PF</th>
                    <th className="px-2 py-1 text-center">PE</th>
                    {/* Ocultar columna Notas */}
                    {/* <th className="px-2 py-1 text-center">Notas</th> */}
                    <th className="px-2 py-1 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortPFPEByWeek(safeRecords).map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 text-center">{row.PFPE?.week || ''}</td>
                      <td className="px-2 py-1 text-center">{row.PFPE?.pf ?? ''}</td>
                      <td className="px-2 py-1 text-center">{row.PFPE?.pe ?? ''}</td>
                      {/* Ocultar celda Notas */}
                      {/* <td className="px-2 py-1 text-center">{row.PFPE?.notes ?? ''}</td> */}
                      <td className="px-2 py-1 text-center flex gap-1 justify-center">
                        {/* Ícono de ver notas si existen */}
                        {row.PFPE?.notes && row.PFPE.notes.trim() !== '' && (
                          <button
                            className="p-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700"
                            title="Ver notas"
                            onClick={() => setShowPFPENotesModal({ open: true, notes: row.PFPE.notes })}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                            </svg>
                          </button>
                        )}
                        <button className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 mr-1" title="Editar" onClick={() => {
                          setEditExercise(null);
                          setExerciseDay(day);
                          setWeekNumber(row.PFPE?.week || "");
                          setDailyPF(row.PFPE?.pf ?? "");
                          setDailyPE(row.PFPE?.pe ?? "");
                          setExerciseNotes(row.PFPE?.notes ?? "");
                          setIsEditingDaily(true);
                          setEditingDailyDate(row.PFPE?.timestamp || "");
                          setShowDailyModal(true);
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700" title="Eliminar" onClick={() => handleDeletePFPE(day, idx)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modal para ver notas de PF/PE */}
          {showPFPENotesModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold mb-4 text-purple-700">Notas</h3>
                <div className="mb-6 text-gray-800 whitespace-pre-line text-sm">{showPFPENotesModal.notes}</div>
                <button
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  onClick={() => setShowPFPENotesModal({ open: false, notes: '' })}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      );
    });
  };
  // Estado para mostrar el modal de notas y fecha de seguimiento semanal
  const [showWeeklyNotesModal, setShowWeeklyNotesModal] = React.useState({ open: false, notes: '', date: '', week: '' });
  // Estado para colapsar/expandir rounds
  const [collapsedRounds, setCollapsedRounds] = React.useState({});
  // Estado para colapso PF/PE/Notas: inicializar todos los días colapsados al montar el componente
  const [collapsedPFPE, setCollapsedPFPE] = React.useState(() => {
    const collapsed = {};
    if (routine && routine.dailyTracking) {
      Object.keys(routine.dailyTracking).forEach(dayKey => {
        collapsed[dayKey] = true;
      });
    }
    // También incluir días de ejercicios aunque no tengan dailyTracking
    if (Array.isArray(routine?.exercises)) {
      routine.exercises.forEach(ex => {
        const dayKey = ['1','2','3','4','5','6','7'].includes(ex.day) ? `Día ${ex.day}` : (ex.day || 'Sin día');
        if (collapsed[dayKey] === undefined) collapsed[dayKey] = true;
      });
    }
    return collapsed;
  });

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
  const [pfpeData, setPfpeData] = React.useState({});

  // Handler para editar ejercicio
  const handleEditExerciseClick = (ex) => {
    setEditExercise(ex);
    setExerciseName(ex.name || "");
    setExerciseSets(ex.sets || "");
    setExerciseReps(ex.reps || "");
    setExerciseDropset(ex.dropset || "");
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
    
    // Si estamos creando un nuevo registro (no editando)
    if (!isEditingWeekly && weeklyExercise) {
      const existingWeeks = weeklyExercise.weeklyData ? Object.keys(weeklyExercise.weeklyData) : [];
      
      // Si viene del cronómetro, filtrar solo semanas que NO tienen tiempos registrados
      if (timerData) {
        const weeksWithTimes = existingWeeks.filter(week => {
          const weekData = weeklyExercise.weeklyData[week];
          // Verificar si tiene tiempos registrados (formattedTotalTime, totalTime o seriesTimes)
          return weekData && (
            weekData.formattedTotalTime || 
            weekData.totalTime || 
            (weekData.seriesTimes && weekData.seriesTimes.length > 0 && weekData.seriesTimes.some(time => time && time.trim() !== ""))
          );
        });
        return Array.from({ length: numWeeks }, (_, i) => ({ value: `S${i + 1}`, label: `S${i + 1}` }))
          .filter(week => !weeksWithTimes.includes(week.value));
      } else {
        // Para registro manual, filtrar todas las semanas ya utilizadas
        return Array.from({ length: numWeeks }, (_, i) => ({ value: `S${i + 1}`, label: `S${i + 1}` }))
          .filter(week => !existingWeeks.includes(week.value));
      }
    }
    
    return Array.from({ length: numWeeks }, (_, i) => ({ value: `S${i + 1}`, label: `S${i + 1}` }));
  };

  // Calcular semanas disponibles para PF/PE
  const getWeekOptionsForPFPE = () => {
    if (!routine.startDate || !routine.endDate) return [];
    const start = new Date(routine.startDate);
    const end = new Date(routine.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numWeeks = Math.max(1, Math.ceil(diffDays / 7));
    
    // Si estamos creando un nuevo registro (no editando), filtrar semanas ya utilizadas
    if (!isEditingDaily && exerciseDay) {
      // Normalizar clave del día
      let normalizedDay = exerciseDay;
      if (["1","2","3","4","5","6","7"].includes(exerciseDay)) {
        normalizedDay = `Día ${exerciseDay}`;
      }
      
      // Obtener semanas ya utilizadas para este día
      const existingRecords = routine.dailyTracking?.[normalizedDay] || [];
      const existingWeeks = [];
      
      if (Array.isArray(existingRecords)) {
        existingRecords.forEach(record => {
          if (record.PFPE && record.PFPE.week) {
            existingWeeks.push(record.PFPE.week);
          }
        });
      } else if (existingRecords.PFPE && existingRecords.PFPE.week) {
        existingWeeks.push(existingRecords.PFPE.week);
      }
      
      return Array.from({ length: numWeeks }, (_, i) => ({ value: `S${i + 1}`, label: `S${i + 1}` }))
        .filter(week => !existingWeeks.includes(week.value));
    }
    
    return Array.from({ length: numWeeks }, (_, i) => ({ value: `S${i + 1}`, label: `S${i + 1}` }));
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
    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
      {/* Orden fijo: Series, Dropset, Repeticiones */}
      {ex.sets && <div><span className="font-semibold">Series:</span> {ex.sets}</div>}
      {ex.dropset && <div><span className="font-semibold">Dropset:</span> {ex.dropset}</div>}
      {ex.reps && <div><span className="font-semibold">Repeticiones:</span> {ex.reps}</div>}
      {/* El resto igual que antes */}
      {ex.time && <div><span className="font-semibold">Tiempo:</span> {ex.time}</div>}
      {ex.rest && !ex.hideRest && <div><span className="font-semibold">Descanso:</span> {ex.rest}</div>}
      {ex.weight && <div><span className="font-semibold">Peso (Kg):</span> {ex.weight}</div>}
      {ex.rir && <div><span className="font-semibold">RIR:</span> {ex.rir}</div>}
      {ex.cadencia && <div><span className="font-semibold">Cadencia:</span> {ex.cadencia}</div>}
      {ex.notes && <div className="col-span-2"><span className="font-semibold">Notas:</span> {ex.notes}</div>}
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
  const [weekSeries, setWeekSeries] = React.useState(1);
  const [seriesWeights, setSeriesWeights] = React.useState([""]);
  const [seriesTimes, setSeriesTimes] = React.useState([""]);
  const [weekNotes, setWeekNotes] = React.useState("");
  const [weekTotalTime, setWeekTotalTime] = React.useState("");
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
  const [isEditingDaily, setIsEditingDaily] = React.useState(false);
  const [editingDailyDate, setEditingDailyDate] = React.useState("");
  // Estado para los valores de PF y PE diarios
  const [dailyPF, setDailyPF] = React.useState("");
  const [dailyPE, setDailyPE] = React.useState("");

  // Estado para editar información de rutina

  // Estado para el campo Dropset en el modal de ejercicio
  const [exerciseDropset, setExerciseDropset] = React.useState("");
  const [showRoutineModal, setShowRoutineModal] = React.useState(false);
  const [routineName, setRoutineName] = React.useState("");
  const [routineStartDate, setRoutineStartDate] = React.useState("");
  const [routineEndDate, setRoutineEndDate] = React.useState("");
  const [routineDescription, setRoutineDescription] = React.useState("");

  // Estados para el cronómetro
  const [showTimer, setShowTimer] = React.useState(false);
  const [timerExercise, setTimerExercise] = React.useState(null);
  const [timerData, setTimerData] = React.useState(null); // Datos del cronómetro

  // Estados para sectionOrder - Movidos fuera del bloque condicional
  const routineId = routine?.id || routine?.routine_id || routine?.client_id || 'default';
  
  const getInitialSectionOrderByDay = React.useCallback(() => {
    if (routine && routine.sectionOrderByDay && typeof routine.sectionOrderByDay === 'object') {
      return routine.sectionOrderByDay;
    }
    return {};
  }, [routine]);

  const [sectionOrderByDay, setSectionOrderByDay] = React.useState(getInitialSectionOrderByDay);
  const prevRoutineSectionOrder = React.useRef(routine && routine.sectionOrderByDay);

  // Sincronizar el estado local con la rutina cada vez que cambie routine.sectionOrderByDay
  React.useEffect(() => {
    if (routine && routine.sectionOrderByDay && typeof routine.sectionOrderByDay === 'object') {
      setSectionOrderByDay(routine.sectionOrderByDay);
    }
  }, [routine && routine.id, routine && routine.sectionOrderByDay]);

  // Sincronizar con base de datos cada vez que cambia el objeto
  React.useEffect(() => {
    if (
      typeof onUpdateRoutine === 'function' &&
      routineId &&
      sectionOrderByDay &&
      JSON.stringify(sectionOrderByDay) !== JSON.stringify(prevRoutineSectionOrder.current)
    ) {
      onUpdateRoutine({
        id: routineId,
        action: 'updateSectionOrder',
        data: { sectionOrderByDay }
      });
      prevRoutineSectionOrder.current = sectionOrderByDay;
    }
  }, [routineId, sectionOrderByDay, onUpdateRoutine]);

  // Sincronizar sectionOrder cuando cambian las secciones de los ejercicios
  React.useEffect(() => {
    if (exercises.length > 0) {
      const groupedByDay = exercises.reduce((acc, ex) => {
        const day = ex.day || 'Sin día';
        if (!acc[day]) acc[day] = {};
        const section = ex.section || 'Sin sección';
        if (!acc[day][section]) acc[day][section] = {};
        return acc;
      }, {});

      setSectionOrderByDay(prev => {
        let hasChanges = false;
        const newSectionOrder = { ...prev };

        Object.keys(groupedByDay).forEach(day => {
          const allSections = Object.keys(groupedByDay[day]);
          let newOrder = prev[day] ? [...prev[day]] : ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'];
          
          // Añadir nuevas secciones
          allSections.forEach(sec => {
            if (!newOrder.includes(sec)) {
              newOrder.push(sec);
              hasChanges = true;
            }
          });
          
          // Remover secciones que ya no existen
          newOrder = newOrder.filter(sec => allSections.includes(sec));
          
          if (JSON.stringify(newOrder) !== JSON.stringify(prev[day])) {
            newSectionOrder[day] = newOrder;
            hasChanges = true;
          }
        });

        return hasChanges ? newSectionOrder : prev;
      });
    }
  }, [exercises]);

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

  // Alternar colapso/expansión de PF/PE/Notas para un día
  const togglePFPE = (dayKey) => {
    setCollapsedPFPE(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
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
    if (!exercise.weeklyData) return '0.00';
    const weights = Object.values(exercise.weeklyData)
      .map(data => parseFloat(data.weight) || 0)
      .filter(weight => weight > 0);
    return weights.length > 0 ? Math.max(...weights).toFixed(2) : '0.00';
  };

  // Función para renderizar todas las semanas del seguimiento
  const renderWeeklyTracking = (exercise) => {
    const weeklyData = exercise.weeklyData || {};
    const weeks = Object.keys(weeklyData);
    if (weeks.length === 0) return null;
    
    // Calculate weights considering both series weights and legacy single weight
    const allWeights = [];
    weeks.forEach(week => {
      const weekData = weeklyData[week];
      if (weekData.seriesWeights && Array.isArray(weekData.seriesWeights)) {
        // Use series weights
        weekData.seriesWeights.forEach(weight => {
          const w = parseFloat(weight);
          if (!isNaN(w) && w > 0) allWeights.push(w);
        });
      } else if (weekData.weight) {
        // Use legacy single weight
        const w = parseFloat(weekData.weight);
        if (!isNaN(w) && w > 0) allWeights.push(w);
      }
    });
    
    const averageWeight = allWeights.length > 0 ? (allWeights.reduce((a, b) => a + b, 0) / allWeights.length).toFixed(2) : '0.00';
    const tonelaje = allWeights.length > 0 ? allWeights.reduce((a, b) => a + b, 0).toFixed(2) : '0.00';
    return (
      <div className="mt-1">
        <div
          className="flex items-center justify-between mb-1 cursor-pointer select-none w-full"
          onClick={() => toggleWeeklyTracking(exercise.id)}
          title={collapsedWeeklyTracking.has(exercise.id) ? 'Expandir tabla' : 'Contraer tabla'}
        >
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold text-xs shadow w-full justify-center transition-colors"
          >
            <span>Seguimiento semanal</span>
          </div>
          <button
            className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 ml-2"
            tabIndex={-1}
            style={{ pointerEvents: 'none' }}
          >
            <svg className={`w-4 h-4 transform transition-transform ${collapsedWeeklyTracking.has(exercise.id) ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {!collapsedWeeklyTracking.has(exercise.id) && (
          <>
            <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden mb-2">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1">Semana</th>
                  <th className="px-2 py-1">Series</th>
                  <th className="px-2 py-1">Pesos (kg)</th>
                  <th className="px-2 py-1">Tiempo</th>
                  <th className="px-2 py-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map(week => {
                  const weekData = weeklyData[week];
                  const displayWeights = weekData.seriesWeights && Array.isArray(weekData.seriesWeights) 
                    ? weekData.seriesWeights.filter(w => w && w.trim() !== "").join(", ") 
                    : weekData.weight || "0";
                  const seriesCount = weekData.series || (weekData.seriesWeights ? weekData.seriesWeights.length : 1);
                  
                  return (
                    <tr key={week}>
                      <td className="px-2 py-1 text-center">{week}</td>
                      <td className="px-2 py-1 text-center">{seriesCount}</td>
                      <td className="px-2 py-1 text-center">{displayWeights}</td>
                      <td className="px-2 py-1 text-center">
                        {weekData.formattedTotalTime ? (
                          <span className="text-green-600 font-semibold">{weekData.formattedTotalTime}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-1 flex gap-2 justify-center">
                        <button
                          className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                          title="Ver detalle"
                          onClick={() => setShowWeeklyNotesModal({ open: true, notes: weeklyData[week].generalNotes, date: weeklyData[week].date, week })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                          </svg>
                        </button>
                        <button
                          className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                          title="Editar"
                          onClick={() => handleEditWeeklyTracking(exercise, week, weeklyData[week])}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                          title="Eliminar"
                          onClick={() => handleDeleteWeeklyTracking(exercise, week)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-center gap-2 mt-2" data-guide="progress-stats">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-semibold shadow w-[100px] text-[10px] flex items-center justify-center whitespace-nowrap">
                <span className="font-bold">Máx:</span>&nbsp;<span>{allWeights.length > 0 ? Math.max(...allWeights).toFixed(2) : '0.00'} kg</span>
              </div>
              <div className="bg-green-100/60 text-green-800 px-3 py-2 rounded-lg font-semibold shadow w-[100px] text-[10px] flex items-center justify-center whitespace-nowrap">
                <span className="font-bold">Promedio:</span>&nbsp;<span>{averageWeight} kg</span>
              </div>
              <div className="bg-purple-100/60 text-purple-800 px-3 py-2 rounded-lg font-semibold shadow w-[100px] text-[10px] flex items-center justify-center whitespace-nowrap">
                <span className="font-bold">Tonelaje:</span>&nbsp;<span>{tonelaje} kg</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const handleOpenWeeklyModal = (exercise, weekValue = "") => {
    setWeeklyExercise(exercise);
    setWeekNumber(weekValue);
    setWeekWeight("");
    
    // Get series count from exercise, default to 1 if not specified
    const exerciseSeries = parseInt(exercise.sets) || 1;
    setWeekSeries(exerciseSeries);
    setSeriesWeights(Array(exerciseSeries).fill(""));
    setSeriesTimes(Array(exerciseSeries).fill(""));
    
    setWeekNotes("");
    setWeekTotalTime("");
    setIsEditingWeekly(false);
    setEditingWeeklyData(null);
    setShowWeeklyModal(true);
  };

  const handleEditWeeklyTracking = (exercise, weekValue, weekData) => {
    console.log('handleEditWeeklyTracking called with:', { exercise, weekValue, weekData });
    try {
      setWeeklyExercise(exercise);
      setWeekNumber(weekValue);
      
      // Get series count from exercise, default to 1 if not specified
      const exerciseSeries = parseInt(exercise.sets) || 1;
      setWeekSeries(exerciseSeries);
      
      // Handle series data - check if we have series weights or just a single weight
      if (weekData.seriesWeights && Array.isArray(weekData.seriesWeights)) {
        // Use existing series weights, but adjust to match current exercise series count
        const existingWeights = [...weekData.seriesWeights];
        while (existingWeights.length < exerciseSeries) {
          existingWeights.push("");
        }
        if (existingWeights.length > exerciseSeries) {
          existingWeights.splice(exerciseSeries);
        }
        setSeriesWeights(existingWeights);
        setWeekWeight("");
      } else {
        // Legacy single weight support - distribute to first series
        const newSeriesWeights = Array(exerciseSeries).fill("");
        if (weekData.weight) {
          newSeriesWeights[0] = weekData.weight;
        }
        setSeriesWeights(newSeriesWeights);
        setWeekWeight("");
      }
      
      // Handle series times - similar to weights
      if (weekData.seriesTimes && Array.isArray(weekData.seriesTimes)) {
        // Use existing series times, but adjust to match current exercise series count
        const existingTimes = [...weekData.seriesTimes];
        while (existingTimes.length < exerciseSeries) {
          existingTimes.push("");
        }
        if (existingTimes.length > exerciseSeries) {
          existingTimes.splice(exerciseSeries);
        }
        setSeriesTimes(existingTimes);
      } else {
        // Initialize empty times for all series
        setSeriesTimes(Array(exerciseSeries).fill(""));
      }
      
      setWeekNotes(weekData.generalNotes || "");
      setWeekTotalTime(weekData.formattedTotalTime || "");
      setIsEditingWeekly(true);
      setEditingWeeklyData(weekData);
      setShowWeeklyModal(true);
    } catch (error) {
      console.error('Error in handleEditWeeklyTracking:', error);
      alert('Error al abrir el modal de edición: ' + error.message);
    }
  };

  const handleDeleteWeeklyTracking = (exercise, weekValue) => {
    // Confirmación para eliminar seguimiento semanal
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro de seguimiento semanal?')) {
      return;
    }
    try {
      // Obtener el ID de la rutina
      const routineId = routine?.id || routine?.routine_id || routine?.client_id;
      if (!routineId) {
        console.error('Error: ID de rutina no encontrado para eliminar seguimiento semanal', routine);
        alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
        return;
      }
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
    setWeekSeries(1);
    setSeriesWeights([""]);
    setSeriesTimes([""]);
    setWeekNotes("");
    setWeekTotalTime("");
    setIsEditingWeekly(false);
    setEditingWeeklyData(null);
    // Limpiar datos del cronómetro al cerrar el modal
    setTimerData(null);
  };

  // Function to handle weight change for a specific series
  const handleSeriesWeightChange = (seriesIndex, weight) => {
    const newSeriesWeights = [...seriesWeights];
    newSeriesWeights[seriesIndex] = weight;
    setSeriesWeights(newSeriesWeights);
  };

  // Function to handle time change for a specific series
  const handleSeriesTimeChange = (seriesIndex, time) => {
    const newSeriesTimes = [...seriesTimes];
    newSeriesTimes[seriesIndex] = time;
    setSeriesTimes(newSeriesTimes);
  };

  // Funciones para manejar el cronómetro
  const handleOpenTimer = (exercise) => {
    setTimerExercise(exercise);
    setShowTimer(true);
  };

  // Función específica para manejar el timer de rounds
  const handleOpenTimerForRound = (roundExercises, roundNumber, cantidadRounds) => {
    // Crear un objeto especial que representa el round completo
    const roundTimer = {
      id: `round-${roundNumber}`,
      name: `Round ${roundNumber}`,
      isRound: true,
      roundNumber: roundNumber,
      exercises: roundExercises,
      sets: cantidadRounds || 1, // Usar cantidadRounds como número de series
      cantidadRounds: cantidadRounds
    };
    
    setTimerExercise(roundTimer);
    setShowTimer(true);
  };

  const handleCloseTimer = () => {
    setShowTimer(false);
    setTimerExercise(null);
  };

  // Función para guardar tiempo del cronómetro en seguimiento semanal
  const handleSaveTimeFromTimer = (timeData) => {
    console.log('=== CRONÓMETRO: Iniciando guardado ===');
    console.log('1. Datos del cronómetro recibidos:', timeData);
    console.log('2. Ejercicio del cronómetro:', timerExercise);
    
    // Guardar los datos del cronómetro y abrir el modal de seguimiento semanal
    setTimerData(timeData);
    setWeeklyExercise(timerExercise);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes(""); // Limpiar notas para que el usuario las complete
    setWeekTotalTime(""); // Se usará el tiempo del cronómetro automáticamente
    
    // Configurar el número de series basado en el ejercicio del cronómetro
    const exerciseSeries = parseInt(timerExercise?.sets) || timeData.seriesTimes.length || 1;
    setWeekSeries(exerciseSeries);
    
    // Configurar pesos de las series desde el cronómetro si están disponibles
    if (timeData.seriesWeights && timeData.seriesWeights.length > 0) {
      console.log('5. Aplicando pesos del cronómetro:', timeData.seriesWeights);
      setSeriesWeights(timeData.seriesWeights);
    } else {
      setSeriesWeights(Array(exerciseSeries).fill(""));
    }
    // Los tiempos de series se obtienen del cronómetro, no necesitan inicialización manual
    setSeriesTimes(Array(exerciseSeries).fill(""));
    
    console.log('3. Series configuradas:', exerciseSeries);
    console.log('4. Abriendo modal de seguimiento semanal...');
    
    setShowWeeklyModal(true);
    console.log('=== CRONÓMETRO: Configuración completada ===');
  };

  // Función para manejar cambio de semana y cargar datos existentes
  const handleWeekNumberChange = (selectedWeek) => {
    setWeekNumber(selectedWeek);
    
    // Si hay datos existentes para esta semana, cargarlos cuando corresponda
    if (selectedWeek && weeklyExercise && weeklyExercise.weeklyData && weeklyExercise.weeklyData[selectedWeek]) {
      const existingData = weeklyExercise.weeklyData[selectedWeek];
      
      // Si viene del cronómetro, solo cargar datos si la semana NO tiene tiempos registrados
      if (timerData) {
        const hasExistingTimes = existingData.formattedTotalTime || 
                               existingData.totalTime || 
                               (existingData.seriesTimes && existingData.seriesTimes.length > 0 && 
                                existingData.seriesTimes.some(time => time && time.trim() !== ""));
        
        if (!hasExistingTimes) {
          // Combinar pesos del cronómetro con datos existentes
          if (timerData.seriesWeights && timerData.seriesWeights.length > 0) {
            // Priorizar pesos del cronómetro, completar con existentes si es necesario
            const finalWeights = [...timerData.seriesWeights];
            if (existingData.seriesWeights && existingData.seriesWeights.length > 0) {
              // Rellenar posiciones vacías del cronómetro con datos existentes
              existingData.seriesWeights.forEach((weight, index) => {
                if (index < finalWeights.length && (!finalWeights[index] || finalWeights[index].trim() === "")) {
                  finalWeights[index] = weight;
                }
              });
            }
            setSeriesWeights(finalWeights);
          } else if (existingData.seriesWeights && existingData.seriesWeights.length > 0) {
            setSeriesWeights(existingData.seriesWeights);
          }
          
          if (existingData.generalNotes && (!weekNotes || weekNotes.trim() === "")) {
            setWeekNotes(existingData.generalNotes);
          }
          if (existingData.series) {
            setWeekSeries(existingData.series);
          }
          console.log('Cronómetro: Cargando datos combinados para semana sin tiempos:', selectedWeek);
        }
      } else {
        // Para registro manual normal, cargar todos los datos
        console.log('Cargando datos existentes para semana', selectedWeek, ':', existingData);
        
        if (existingData.seriesWeights && existingData.seriesWeights.length > 0) {
          setSeriesWeights(existingData.seriesWeights);
        }
        if (existingData.generalNotes && (!weekNotes || weekNotes.trim() === "")) {
          setWeekNotes(existingData.generalNotes);
        }
        if (existingData.series) {
          setWeekSeries(existingData.series);
        }
      }
    }
  };

  // Función auxiliar para formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handlers para seguimiento diario general
  const handleOpenDailyModal = (day) => {
    setDailyDate(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
    setIsEditingDaily(false);
    setEditingDailyDate("");
    setExerciseDay(day || "");
    setShowDailyModal(true);
  };

  const handleEditDaily = (date, data) => {
    console.log('handleEditDaily called with:', { date, data });
    try {
      setDailyDate(date);
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
    setExerciseDay(""); // Fix: 'day' is not defined, reset to empty string
  };

  const handleSaveDaily = () => {
    if (!weekNumber || !dailyPF || !dailyPE || !exerciseDay) {
      alert('Completa todos los campos para registrar PF/PE/Notas.');
      return;
    }
    
    // Normalizar clave del día para validación
    let normalizedDay = exerciseDay;
    if (["1","2","3","4","5","6","7"].includes(exerciseDay)) {
      normalizedDay = `Día ${exerciseDay}`;
    }
    
    // Validar que no se dupliquen datos para la misma semana (solo para nuevos registros)
    if (!isEditingDaily) {
      const existingRecords = routine.dailyTracking?.[normalizedDay] || [];
      let weekExists = false;
      
      if (Array.isArray(existingRecords)) {
        weekExists = existingRecords.some(record => 
          record.PFPE && record.PFPE.week === weekNumber
        );
      } else if (existingRecords.PFPE && existingRecords.PFPE.week === weekNumber) {
        weekExists = true;
      }
      
      if (weekExists) {
        alert(`Ya existen datos de PF/PE para la semana ${weekNumber}. Puedes editarlos desde el botón "Editar" en la tabla de seguimiento.`);
        return;
      }
    }
    
    // Validación PF y PE entre 1 y 5
    const pfNum = Number(dailyPF);
    const peNum = Number(dailyPE);
    if (
      isNaN(pfNum) || isNaN(peNum) ||
      pfNum < 1 || pfNum > 5 ||
      peNum < 1 || peNum > 5
    ) {
      alert('PF y PE deben ser valores entre 1 y 5.');
      return;
    }
    const routineId = routine?.id || routine?.routine_id || routine?.client_id;
    if (!routineId) {
      alert('No se encontró el ID de la rutina.');
      return;
    }
    // Normalizar clave del día
    if (["1","2","3","4","5","6","7"].includes(exerciseDay)) {
      normalizedDay = `Día ${exerciseDay}`;
    }
    // Crear el objeto de registro diario
    const dailyRecord = {
      PFPE: {
        week: weekNumber,
        day: normalizedDay,
        pf: pfNum,
        pe: peNum,
        notes: exerciseNotes || "",
        timestamp: isEditingDaily && editingDailyDate ? editingDailyDate : new Date().toISOString()
      }
    };
    const prevTracking = routine.dailyTracking && routine.dailyTracking[normalizedDay];
    let newArray;
    if (isEditingDaily && editingDailyDate) {
      // Buscar el índice del registro a editar por timestamp
      if (Array.isArray(prevTracking)) {
        newArray = prevTracking.map(item => {
          if (item.PFPE && item.PFPE.timestamp === editingDailyDate) {
            return dailyRecord;
          }
          return item;
        });
      } else if (prevTracking && prevTracking.PFPE && prevTracking.PFPE.timestamp === editingDailyDate) {
        newArray = [dailyRecord];
      } else if (prevTracking) {
        newArray = [prevTracking];
      } else {
        newArray = [dailyRecord];
      }
    } else {
      // Agregar nuevo registro
      if (Array.isArray(prevTracking)) {
        newArray = [...prevTracking, dailyRecord];
      } else if (prevTracking) {
        newArray = [prevTracking, dailyRecord];
      } else {
        newArray = [dailyRecord];
      }
    }
    const newDailyTracking = {
      ...(routine.dailyTracking || {}),
      [normalizedDay]: newArray
    };
    onUpdateRoutine({
      id: routineId,
      dailyTracking: newDailyTracking
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
    console.log('handleSaveWeekly called with:', {
      weekNumber,
      weeklyExercise,
      weekWeight,
      weekSeries,
      seriesWeights,
      weekNotes,
      isEditingWeekly,
      editingWeeklyData
    });
    if (!weekNumber || !weeklyExercise) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    // Validar que no se dupliquen datos para la misma semana (solo para nuevos registros)
    if (!isEditingWeekly && weeklyExercise.weeklyData && weeklyExercise.weeklyData[weekNumber]) {
      // Si viene del cronómetro, verificar que no tenga tiempos registrados
      if (timerData) {
        const existingData = weeklyExercise.weeklyData[weekNumber];
        const hasExistingTimes = existingData.formattedTotalTime || 
                               existingData.totalTime || 
                               (existingData.seriesTimes && existingData.seriesTimes.length > 0 && 
                                existingData.seriesTimes.some(time => time && time.trim() !== ""));
        
        if (hasExistingTimes) {
          alert(`La semana ${weekNumber} ya tiene tiempos registrados. Solo se pueden agregar tiempos a semanas sin registros de tiempo.`);
          return;
        }
        console.log('Cronómetro: Agregando tiempo a semana con datos de peso únicamente');
      } else {
        alert(`Ya existen datos para la semana ${weekNumber}. Puedes editarlos desde el botón "Editar" en la tabla de seguimiento.`);
        return;
      }
    }

    try {
      const routineId = routine?.id || routine?.routine_id || routine?.client_id;
      if (!routineId) {
        console.error('Error: ID de rutina no encontrado para seguimiento semanal', routine);
        alert('Error: No se encontró el ID de la rutina. Por favor, recarga la página.');
        return;
      }
      
      // Calcular peso promedio para compatibilidad
      const validWeights = seriesWeights.filter(weight => weight && weight.trim() !== "").map(weight => parseFloat(weight));
      const averageWeight = validWeights.length > 0 ? validWeights.reduce((sum, weight) => sum + weight, 0) / validWeights.length : 0;
      
      // Preparar tiempos por serie si están disponibles
      const seriesTimesData = timerData && timerData.formattedSeriesTimes ? 
        timerData.formattedSeriesTimes.map(serieTime => serieTime.time) : 
        seriesTimes.filter(time => time && time.trim() !== ""); // Usar tiempos manuales si no hay cronómetro
      
      const weeklyData = {
        week: weekNumber,
        weight: averageWeight.toFixed(2), // Keep for backward compatibility
        seriesWeights: seriesWeights,
        seriesTimes: seriesTimesData, // Tiempos por serie
        series: weekSeries,
        generalNotes: weekNotes,
        date: isEditingWeekly ? editingWeeklyData?.date : new Date().toISOString().split('T')[0],
        // Incluir tiempo total del cronómetro si está disponible, o el tiempo manual
        ...(timerData && {
          totalTime: timerData.totalTime,
          formattedTotalTime: timerData.formattedTotalTime
        }),
        // Si no hay datos del cronómetro pero sí tiempo manual, usarlo
        ...(!timerData && weekTotalTime && {
          formattedTotalTime: weekTotalTime
        })
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
      // Eliminar el refresco visual, confiar en el estado y props para actualizar la tabla
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

    // Paleta de colores por posición de sección (degradé)
    const sectionGradientColorsByIndex = [
      'bg-gradient-to-r from-green-950 to-[#183E0C] text-white', // 0 - más oscuro
      'bg-gradient-to-r from-[#183E0C] to-green-800 text-white', // 1
      'bg-gradient-to-r from-green-900 to-green-600 text-white', // 2
      'bg-gradient-to-r from-green-800 to-green-300 text-white', // 3
      'bg-gradient-to-r from-green-700 to-green-300 text-white', // 4 - más claro
      'bg-gradient-to-r from-green-400 to-green-200 text-green-900', // 5 - extra
      'bg-gradient-to-r from-green-200 to-green-100 text-green-900', // 6 - extra
    ];
    
    // Ordenar días
    const orderedDays = [
      '1','2','3','4','5','6','7'
    ].filter(d => groupedByDay[d]).concat(Object.keys(groupedByDay).filter(d => !['1','2','3','4','5','6','7'].includes(d)));

    // Filtrar dailyTracking para cada día
    const cleanedDailyTracking = cleanOldDailyTracking(routine.dailyTracking);

    ejerciciosPorDia = orderedDays.map(day => {
      // Normalizar clave de día para dailyTracking
      const dayKey = ['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : day;
      // Solo pasar los registros de ese día
      const pfpeRecords = cleanedDailyTracking[dayKey] || [];
      // Detectar si el día actual es solo para PF/PE/Notas
      const isPFPEGroup =
        groupedByDay[day] &&
        Object.keys(groupedByDay[day]).length === 1 &&
        (Object.keys(groupedByDay[day])[0] === 'PFPE' || Object.keys(groupedByDay[day])[0] === 'Seguimiento semanal - PF y PE');
      // Asegurar que sectionOrder tenga todas las secciones presentes en el día
      const allSections = Object.keys(groupedByDay[day]);
      // Obtener el orden actual para este día
      const sectionOrder = sectionOrderByDay[day] || ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'];
      
      // Función para mover secciones
      const moveSection = (direction, sectionName) => {
        setSectionOrderByDay(prev => {
          const currentOrder = prev[day] ? [...prev[day]] : ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'];
          const idx = currentOrder.indexOf(sectionName);
          if (direction === 'up' && idx > 0) {
            [currentOrder[idx - 1], currentOrder[idx]] = [currentOrder[idx], currentOrder[idx - 1]];
          } else if (direction === 'down' && idx < currentOrder.length - 1) {
            [currentOrder[idx], currentOrder[idx + 1]] = [currentOrder[idx + 1], currentOrder[idx]];
          }
          // El nuevo objeto será sincronizado con la base de datos por el useEffect
          return { ...prev, [day]: currentOrder };
        });
      };
      return (
  // Estado para colapso PF/PE/Notas: inicializar todos los días colapsados al montar el componente

        <div key={day} className="mb-6">
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center justify-between cursor-pointer p-1 sm:p-2 bg-black rounded-md hover:bg-gray-900 transition-colors flex-1 min-h-[32px]"
              style={{ minHeight: '32px' }}
              onClick={() => toggleDay(day)}
            >
              {/* Ocultar el título del Día solo para la tabla de seguimiento semanal PF y PE */}
              {!isPFPEGroup && (
                <h4 className="text-base font-bold text-white pl-1" style={{ fontSize: '15px' }}>
                  {['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'Sin día asignado'}
                </h4>
              )}
              <div className="flex items-center gap-2">
                <svg 
                  className={`w-4 h-4 text-white transform transition-transform ${collapsedDays.has(day) ? 'rotate-180' : ''}`}
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
              {sectionOrder.map((sectionName, sectionIdx) => {
                if (!groupedByDay[day][sectionName]) return null;
                const sectionKey = `${day}-${sectionName}`;
                // Color según el orden, no el nombre
                const colorClass = sectionGradientColorsByIndex[sectionIdx] || 'bg-purple-50 text-purple-900';
                return (
                  <div key={sectionName} className="mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center justify-between cursor-pointer px-2 py-1 rounded-md transition-colors flex-1 text-sm ${colorClass}`}
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
                        <>
                          <button
                            onClick={(e) => {
                              console.log('Delete section button clicked for:', { day, section: sectionName });
                              e.stopPropagation();
                              handleDeleteSection(day, sectionName);
                            }}
                            className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors flex-shrink-0 ml-1"
                            title="Eliminar sección completa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                          <div className="flex flex-col ml-1">
                            <button
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 mb-0.5 disabled:opacity-40"
                              title="Subir sección"
                              disabled={sectionIdx === 0}
                              onClick={e => { e.stopPropagation(); moveSection('up', sectionName); }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 mt-0.5 disabled:opacity-40"
                              title="Bajar sección"
                              disabled={sectionIdx === sectionOrder.length - 1}
                              onClick={e => { e.stopPropagation(); moveSection('down', sectionName); }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {!collapsedSections.has(sectionKey) && (
                      <div className="grid gap-4 mt-3">
                        {(() => {
                          // Obtener ejercicios directamente del array original preservando el orden de inserción
                          const exercisesInOriginalOrder = exercises.filter(ex => {
                            const exDay = ex.day || 'Sin día';
                            const exSection = ex.section || 'Sin sección';
                            return exDay === day && exSection === sectionName;
                          });

                          // Primero, agrupar ejercicios por round manteniendo el orden cronológico
                          const roundGroups = new Map();
                          const singleExercises = [];
                          
                          exercisesInOriginalOrder.forEach(exercise => {
                            const isRoundExercise = exercise.round && exercise.round !== '';
                            
                            if (isRoundExercise) {
                              const roundNumber = exercise.round;
                              if (!roundGroups.has(roundNumber)) {
                                roundGroups.set(roundNumber, []);
                              }
                              roundGroups.get(roundNumber).push(exercise);
                            } else {
                              singleExercises.push(exercise);
                            }
                          });

                          // Crear grupos de renderizado manteniendo el orden de aparición
                          const renderGroups = [];
                          const processedRounds = new Set();
                          
                          // Procesar ejercicios en orden original, pero agrupando rounds completos
                          exercisesInOriginalOrder.forEach(exercise => {
                            const isRoundExercise = exercise.round && exercise.round !== '';
                            
                            if (isRoundExercise) {
                              const roundNumber = exercise.round;
                              if (!processedRounds.has(roundNumber)) {
                                // Agregar todo el grupo de este round
                                renderGroups.push({
                                  type: 'round',
                                  roundName: `Round ${roundNumber}`,
                                  exercises: roundGroups.get(roundNumber)
                                });
                                processedRounds.add(roundNumber);
                              }
                            } else {
                              // Ejercicio individual sin round
                              renderGroups.push({
                                type: 'single',
                                exercise: exercise
                              });
                            }
                          });

                          // Renderizar los grupos en orden original
                          return renderGroups.map((group, groupIndex) => {
                            if (group.type === 'round') {
                              // Renderizar grupo de round
                              const roundKey = `${day}-${sectionName}-${group.roundName}`;
                              const isCollapsed = collapsedRounds[roundKey];
                              const firstExercise = group.exercises[0];
                              const cantidadRounds = firstExercise && firstExercise.cantidadRounds ? firstExercise.cantidadRounds : '';
                              const descansoRound = firstExercise && firstExercise.rest ? firstExercise.rest : '';
                              
                              return (
                                <div key={`${group.roundName}-${groupIndex}`} className="mb-2">
                                  <div
                                    className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 transition-colors mb-1 text-sm"
                                    onClick={() => toggleRound(day, sectionName, group.roundName)}
                                  >
                                    <span className="font-semibold text-gray-700 text-sm flex gap-4 items-center">
                                      <span>{group.roundName}</span>
                                      {cantidadRounds && <span className="text-gray-700">x{cantidadRounds}</span>}
                                      {descansoRound && <span className="text-gray-700">Descanso: {descansoRound}</span>}
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
                                      {Array.isArray(group.exercises) && (
                                        <div className="p-2 bg-gray-50 rounded-xl shadow flex flex-col gap-2">
                                          {group.exercises.map((ex, exerciseIndex) => {
                                            const isFirstExerciseInRound = exerciseIndex === 0; // Solo el primer ejercicio del round tendrá timer
                                            
                                            return (
                                            <div key={ex.id} className="flex flex-col gap-1 border-b last:border-b-0 pb-1 last:pb-0">
                                              <div className="flex justify-between items-start gap-4">
                                                {/* Columna izquierda: título y detalles del ejercicio */}
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-2">
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
                                                  {renderExerciseDetails({ ...ex, hideRest: true })}
                                                  {/* Seguimiento semanal solo en el primer ejercicio del round */}
                                                  {isFirstExerciseInRound && renderWeeklyTracking(ex)}
                                                </div>
                                                
                                                {/* Columna derecha: botones de acción en vertical */}
                                                <div className="flex flex-col gap-2">
                                                  {/* Timer solo en el primer ejercicio del round */}
                                                  {isFirstExerciseInRound && (
                                                    <button
                                                      data-guide="timer-button"
                                                      className="p-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                                                      title="Cronómetro del round"
                                                      onClick={() => handleOpenTimerForRound(group.exercises, ex.round, cantidadRounds)}
                                                    >
                                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                      </svg>
                                                    </button>
                                                  )}
                                                  
                                                  {/* Seguimiento semanal para cada ejercicio */}
                                                  {canAddDailyTracking && (
                                                    <button
                                                      data-guide="weekly-tracking"
                                                      className="p-1 rounded-full bg-black hover:bg-gray-800 text-white"
                                                      title="Agregar seguimiento semanal"
                                                      onClick={() => handleOpenWeeklyModal(ex)}
                                                    >
                                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                      </svg>
                                                    </button>
                                                  )}
                                                  
                                                  {isEditable && (
                                                    <button
                                                      className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                                      title="Editar ejercicio"
                                                      onClick={() => handleEditExerciseClick(ex)}
                                                    >
                                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.287 4.287 0 0 1-1.897 1.13L6 18l.8-2.685a4.287 4.287 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                      </svg>
                                                    </button>
                                                  )}
                                                  
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
                                            </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              // Renderizar ejercicio individual sin round
                              const ex = group.exercise;
                              return (
                                <div key={ex.id} className="p-2 bg-gray-50 rounded-xl shadow mb-1">
                                  <div className="flex justify-between items-start gap-4">
                                    {/* Columna izquierda: título y detalles del ejercicio */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
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
                                      {renderExerciseDetails(ex)}
                                      {renderWeeklyTracking(ex)}
                                    </div>
                                    
                                    {/* Columna derecha: botones de acción en vertical */}
                                    <div className="flex flex-col gap-2">
                                      <button
                                        data-guide="timer-button"
                                        className="p-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                                        title="Cronómetro del ejercicio"
                                        onClick={() => handleOpenTimer(ex)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                      </button>
                                      
                                      {canAddDailyTracking && (
                                        <button
                                          data-guide="weekly-tracking"
                                          className="p-1 rounded-full bg-black hover:bg-gray-800 text-white"
                                          title="Agregar seguimiento semanal"
                                          onClick={() => handleOpenWeeklyModal(ex)}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                          </svg>
                                        </button>
                                      )}
                                      
                                      {isEditable && (
                                        <button
                                          className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                          title="Editar ejercicio"
                                          onClick={() => handleEditExerciseClick(ex)}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.287 4.287 0 0 1-1.897 1.13L6 18l.8-2.685a4.287 4.287 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                          </svg>
                                        </button>
                                      )}
                                      
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
                                </div>
                              );
                            }
                          });
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
                    {/* ...existing code... */}
                    {/* ...sección y ejercicios... */}
                  </div>
                );
              })}
              {/* Agrupador para PF/PE/Notas */}
              <div className="w-full overflow-x-auto mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none px-2 py-1 rounded-md transition-colors text-sm bg-green-100 text-black-900 hover:bg-blue-100 flex-1"
                    onClick={() => togglePFPE(dayKey)}
                    style={{ minHeight: '32px' }}
                  >
                    <span className="font-semibold text-green-700 text-sm">Seguimiento semanal - PF y PE</span>
                    <svg
                      className={`w-3 h-3 transform transition-transform ${collapsedPFPE[dayKey] ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <button
                    data-guide="pfpe-button"
                    className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                    title="Registrar PF/PE/Notas"
                    onClick={() => handleOpenDailyModal(day)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {!collapsedPFPE[dayKey] && (
                  <>
                    {renderPFPETables({
                      [dayKey]: Array.isArray(pfpeRecords) ? pfpeRecords : (pfpeRecords ? [pfpeRecords] : [])
                    })}
                    {/* Modal para editar PF/PE/Notas ya está implementado abajo y se reutiliza para edición */}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      );
    });
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
    <div className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-md w-full max-w-none mx-auto" data-guide="routine-exercises">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {routine.name || 'Rutina sin nombre'}
        </h2>
        <div className="flex gap-2">
          {/* Botón para guardar como plantilla */}
          {isEditable && exercises.length > 0 && (
            <button
              onClick={handleSaveAsTemplate}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
              title="Guardar como plantilla"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          )}
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
      </div>
      
      {/* Información básica de la rutina */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">Fecha de inicio:</span> {formatDate(routine.startDate)}
          </div>
          <div>
            <span className="font-semibold">Fecha de fin:</span> {formatDate(routine.endDate)}
          </div>
          <div>
            <span className="font-semibold">Semanas restantes:</span> 
            <span className={`ml-1 font-semibold ${
              calculateRemainingWeeks() === 0 ? 'text-red-600' : 
              calculateRemainingWeeks() <= 2 ? 'text-orange-600' : 
              'text-gray-900'
            }`}>
              {calculateRemainingWeeks()}
              {calculateRemainingWeeks() === 0 ? ' (Finalizada)' : ''}
            </span>
          </div>
          <div className="col-span-3">
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
            setExerciseDropset('');
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
        </div>
        {ejerciciosPorDia}
      </div>

      {/* Modal para ver notas y fecha de seguimiento semanal */}
      {showWeeklyNotesModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Detalle del Seguimiento</h3>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">Semana:</span>
                <span className="text-lg">{showWeeklyNotesModal.week}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">Fecha:</span>
                <span className="text-lg">{showWeeklyNotesModal.date || 'Sin fecha'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">Notas:</span>
                <div className="bg-gray-50 p-3 rounded-lg border min-h-[80px]">
                  <span className="text-gray-800">{showWeeklyNotesModal.notes || 'Sin notas'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowWeeklyNotesModal({ open: false, notes: '', date: '', week: '' })}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal para seguimiento diario general */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-6">
              {isEditingDaily ? 'Editar PF/PE/Notas' : 'Registrar PF/PE/Notas'}
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semana de entrenamiento
              </label>
              {getWeekOptionsForPFPE().length === 0 && !isEditingDaily ? (
                <div className="w-full px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-700">
                  No hay semanas disponibles. Ya se han registrado datos para todas las semanas.
                </div>
              ) : (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={weekNumber}
                  onChange={e => handleWeekNumberChange(e.target.value)}
                  disabled={isEditingDaily}
                >
                  <option value="">Selecciona una semana</option>
                  {getWeekOptionsForPFPE().map(week => (
                    <option key={week.value} value={week.value}>{week.label}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Fatiga (PF) - 1 a 5
              </label>
              <input
                type="number"
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Ej: 3"
                value={dailyPF}
                onChange={e => setDailyPF(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Esfuerzo (PE) - 1 a 5
              </label>
              <input
                type="number"
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Ej: 4"
                value={dailyPE}
                onChange={e => setDailyPE(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                value={exerciseNotes}
                onChange={(e) => setExerciseNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Cualquier nota relevante sobre el ejercicio"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDaily}
                disabled={!isEditingDaily && getWeekOptionsForPFPE().length === 0}
                className={`flex-1 py-3 px-4 rounded-lg transition-colors text-sm font-medium ${
                  !isEditingDaily && getWeekOptionsForPFPE().length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditingDaily ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                onClick={handleCloseDailyModal}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para seguimiento semanal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg my-4 max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-bold">{isEditingWeekly ? 'Editar seguimiento semanal' : 'Seguimiento Semanal'}</h3>
              <p className="text-sm text-gray-600">
                Ejercicio: <span className="font-semibold">{weeklyExercise?.name}</span>
              </p>
              {timerData && (
                <div className="mt-2 px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-sm text-green-700">
                  ⏱️ Datos del cronómetro guardados. Solo se muestran semanas sin registros de tiempo existentes.
                </div>
              )}
              {timerData && weekNumber && weeklyExercise?.weeklyData?.[weekNumber] && !weeklyExercise.weeklyData[weekNumber].formattedTotalTime && !weeklyExercise.weeklyData[weekNumber].totalTime && (
                <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-700">
                  📋 Datos de peso cargados para la semana {weekNumber}. Se agregará el tiempo del cronómetro.
                </div>
              )}
            </div>
            
            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Semana</label>
                {getWeekOptions().length === 0 && !isEditingWeekly && !timerData ? (
                  <div className="w-full px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-700">
                    No hay semanas disponibles. Ya se han registrado datos para todas las semanas.
                  </div>
                ) : (
                  <select
                    value={weekNumber}
                    onChange={(e) => handleWeekNumberChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isEditingWeekly}
                  >
                    <option value="">Selecciona una semana</option>
                    {getWeekOptions().map(week => (
                      <option key={week.value} value={week.value}>{week.label}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Series</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">
                  {weekSeries} serie{weekSeries > 1 ? 's' : ''} (del ejercicio)
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Datos por serie</label>
                {Array.from({ length: weekSeries }, (_, index) => (
                  <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Serie {index + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Campo de peso */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Peso (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={seriesWeights[index] || ""}
                          onChange={(e) => handleSeriesWeightChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Ej: 80.5"
                        />
                      </div>
                      {/* Campo de tiempo */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Tiempo</label>
                        {timerData && timerData.formattedSeriesTimes && timerData.formattedSeriesTimes[index] ? (
                          <div className="w-full px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-sm text-green-700 font-semibold">
                            {timerData.formattedSeriesTimes[index].time}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={seriesTimes[index] || ""}
                            onChange={(e) => handleSeriesTimeChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="mm:ss"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Tiempo total */}
                {timerData && timerData.formattedTotalTime ? (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Tiempo Total del Ejercicio:</span>
                      <span className="font-bold text-blue-600">{timerData.formattedTotalTime}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Tiempo Total (mm:ss)</label>
                    </div>
                    <input
                      type="text"
                      value={weekTotalTime || ""}
                      onChange={(e) => setWeekTotalTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ej: 02:30"
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas generales</label>
                <textarea
                  value={weekNotes}
                  onChange={(e) => setWeekNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Observaciones, sensaciones, etc."
                />
              </div>
            </div>
            
            {/* Footer fijo con botones */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveWeekly}
                  disabled={!isEditingWeekly && getWeekOptions().length === 0 && !timerData}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors text-sm font-medium ${
                    !isEditingWeekly && getWeekOptions().length === 0 && !timerData
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >{isEditingWeekly ? 'Actualizar' : 'Guardar'}</button>
                <button
                  onClick={handleCloseWeeklyModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                >Cancelar</button>
              </div>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dropset</label>
                  <input type="text" value={exerciseDropset} onChange={(e) => setExerciseDropset(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 2" style={{ fontSize: '12px' }} />
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tiempo</label>
                  <input type="text" value={exerciseTime} onChange={(e) => setExerciseTime(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 30" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descanso</label>
                  <input type="text" value={exerciseRest} onChange={(e) => setExerciseRest(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 90" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">RIR</label>
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
                    dropset: exerciseDropset,
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
                  setExerciseDropset("");
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
                  setExerciseDropset("");
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
        />
      )}
    </div>
  );
}
export default RoutineDetail;
