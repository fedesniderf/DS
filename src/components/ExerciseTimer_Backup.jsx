import React, { useState, useEffect, useRef } from 'react';

const ExerciseTimer = ({ exercise, onClose, onSaveTime }) => {
  // Estado para manejar navegación entre ejercicios
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const [exerciseIndex, setExerciseIndex] = useState(exercise?.currentIndex || 0);
  const allExercises = exercise?.allExercises || [exercise];
  const isRoutineMode = allExercises && allExercises.length > 1;
  
  // Clave única para localStorage basada en la rutina completa
  const storageKey = `timer_routine_${allExercises.map(ex => ex.id).join('_')}`;
  
  // Estados simplificados del cronómetro
  const [totalTime, setTotalTime] = useState(0); // Tiempo total continuo
  const [isRunning, setIsRunning] = useState(false); // Si el cronómetro está corriendo
  const [isResting, setIsResting] = useState(false); // Si está en descanso (entre series o ejercicios)
  const [currentSeries, setCurrentSeries] = useState(1);
  const [seriesData, setSeriesData] = useState([]); // Array con datos de cada serie
  const [currentWeight, setCurrentWeight] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Referencias para el cronómetro
  const intervalRef = useRef(null);
  const seriesStartTimeRef = useRef(0); // Tiempo cuando empezó la serie actual
            currentSeries: parsed.currentSeries || 1,
            seriesTimes: Array.isArray(parsed.seriesTimes) ? parsed.seriesTimes : [],
            seriesWeights: Array.isArray(parsed.seriesWeights) ? parsed.seriesWeights : [],
            isRunning: parsed.isRunning || false,
            isPaused: parsed.isPaused || false,
            isResting: parsed.isResting || false,
            isRestingBetweenExercises: parsed.isRestingBetweenExercises || false, // Nuevo estado
            isRoutineMode: parsed.isRoutineMode || false,
            lastTimestamp: parsed.lastTimestamp || Date.now()
          };
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
    return null;
  };

  // Función para guardar estado en localStorage
  const saveTimerState = (state) => {
    try {
      const stateToSave = {
        ...state,
        lastTimestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  // Inicializar estado desde localStorage o valores por defecto
  const initialState = loadTimerState();
  
  // Si hay estado guardado, recuperar ejercicio actual
  useEffect(() => {
    if (initialState && initialState.exerciseIndex !== undefined) {
      const savedIndex = initialState.exerciseIndex;
      if (savedIndex >= 0 && savedIndex < allExercises.length) {
        setExerciseIndex(savedIndex);
        setCurrentExercise(allExercises[savedIndex]);
      }
    }
  }, []);
  
  const [time, setTime] = useState(initialState?.time || 0);
  const [isRunning, setIsRunning] = useState(initialState?.isRunning || false);
  const [isPaused, setIsPaused] = useState(initialState?.isPaused || false);
  const [currentSeries, setCurrentSeries] = useState(initialState?.currentSeries || 1);
  const [seriesTimes, setSeriesTimes] = useState(initialState?.seriesTimes || []);
  const [seriesWeights, setSeriesWeights] = useState(initialState?.seriesWeights || []);
  const [currentWeight, setCurrentWeight] = useState('');
  const [totalTime, setTotalTime] = useState(initialState?.totalTime || 0);
  const [isResting, setIsResting] = useState(initialState?.isResting || false);
  const [isRestingBetweenExercises, setIsRestingBetweenExercises] = useState(initialState?.isRestingBetweenExercises || false); // Nuevo: descanso entre ejercicios
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRoutineMode, setIsRoutineMode] = useState(initialState?.isRoutineMode || false); // Nuevo: modo rutina
  const intervalRef = useRef(null);

  // Detectar si es un round o ejercicio individual
  const isRound = currentExercise?.isRound || false;
  const totalSeries = isRound ? 
    parseInt(currentExercise?.cantidadRounds) || 1 : 
    parseInt(currentExercise?.sets) || 1;

  // Formatear tiempo en MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Efecto para recuperar tiempo perdido al cargar desde localStorage
  useEffect(() => {
    if (initialState && initialState.isRunning && !initialState.isPaused) {
      const timeDiff = Math.floor((Date.now() - initialState.lastTimestamp) / 1000);
      if (timeDiff > 0 && timeDiff < 3600) { // Solo si es menos de 1 hora
        setTime(prev => prev + timeDiff);
        setTotalTime(prev => prev + timeDiff);
      }
    }
  }, []);

  // Efecto para guardar estado automáticamente
  useEffect(() => {
    const currentState = {
      time,
      totalTime,
      currentSeries,
      seriesTimes,
      seriesWeights,
      isRunning,
      isPaused,
      isResting,
      isRestingBetweenExercises, // Agregar nuevo estado
      isRoutineMode,
      exerciseIndex, // Agregar índice del ejercicio actual
      currentExerciseId: currentExercise?.id // ID del ejercicio actual
    };
    saveTimerState(currentState);
  }, [time, totalTime, currentSeries, seriesTimes, seriesWeights, isRunning, isPaused, isResting, isRestingBetweenExercises, isRoutineMode, exerciseIndex, currentExercise]);

  // Efecto para manejar el cronómetro
  useEffect(() => {
    if (isRunning && !isPaused && !isRestingBetweenExercises) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
        setTotalTime(prevTotal => prevTotal + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, isRestingBetweenExercises]);

  // Iniciar cronómetro
  const handleStart = () => {
    // Guardar peso de la serie actual antes de iniciar (solo para ejercicios individuales)
    if (!isRound && currentWeight) {
      const newSeriesWeights = [...seriesWeights];
      newSeriesWeights[currentSeries - 1] = currentWeight;
      setSeriesWeights(newSeriesWeights);
    }
    
    setIsRunning(true);
    setIsPaused(false);
    setIsRoutineMode(true); // Activar modo rutina
  };

  // Pausar cronómetro
  const handlePause = () => {
    setIsPaused(true);
  };

  // Reanudar cronómetro
  const handleResume = () => {
    setIsPaused(false);
  };

  // Pasar a la siguiente serie/round (botón "Descanso"/"Siguiente Round")
  const handleNextSeries = () => {
    // Guardar tiempo de la serie/round actual
    const newSeriesTimes = [...seriesTimes, time];
    setSeriesTimes(newSeriesTimes);
    
    if (currentSeries < totalSeries) {
      // Hay más series, pasar al descanso
      setIsResting(true);
      setCurrentSeries(currentSeries + 1);
      setTime(0); // Resetear tiempo para contar el descanso
      setCurrentWeight(''); // Limpiar peso para preparar la siguiente serie
    } else {
      // Era la última serie, finalizar ejercicio
      handleStop();
    }
  };

  // Finalizar descanso y empezar siguiente serie
  const handleEndRest = () => {
    // Guardar peso de la serie actual antes de iniciar (solo para ejercicios individuales)
    if (!isRound && currentWeight) {
      const newSeriesWeights = [...seriesWeights];
      newSeriesWeights[currentSeries - 1] = currentWeight;
      setSeriesWeights(newSeriesWeights);
    }
    
    setIsResting(false);
    setTime(0); // Resetear tiempo para la nueva serie
  };

  // Finalizar ejercicio actual y ir al siguiente
  const handleStop = () => {
    // Si había una serie en progreso, agregarla
    let finalSeriesTimes = [...seriesTimes];
    let finalSeriesWeights = [...seriesWeights];
    if (time > 0 && !isResting && !isRestingBetweenExercises) {
      finalSeriesTimes = [...seriesTimes, time];
      if (!isRound) {
        finalSeriesWeights = [...seriesWeights, currentWeight || ''];
        setSeriesWeights(finalSeriesWeights);
      }
      setSeriesTimes(finalSeriesTimes);
    }
    
    // En modo rutina, enviar datos al modal y empezar descanso entre ejercicios
    if (isRoutineMode) {
      // Automáticamente enviar datos al modal de seguimiento semanal
      if (totalTime > 0 && onSaveTime) {
        const timerData = {
          totalTime: totalTime,
          seriesTimes: finalSeriesTimes,
          seriesWeights: isRound ? [] : finalSeriesWeights,
          formattedTotalTime: formatTime(totalTime),
          formattedSeriesTimes: finalSeriesTimes.map((serieTime, index) => ({
            serie: index + 1,
            time: formatTime(serieTime)
          }))
        };
        onSaveTime(timerData);
        
        // Verificar si hay más ejercicios
        if (exerciseIndex < allExercises.length - 1) {
          // Empezar descanso entre ejercicios
          handleStartExerciseRest();
        } else {
          // Era el último ejercicio, finalizar rutina
          handleFinishRoutine();
        }
      }
    } else {
      // Modo tradicional: detener completamente
      setIsRunning(false);
      setIsPaused(false);
      
      // Automáticamente enviar datos al modal de seguimiento semanal si hay tiempo registrado
      if (totalTime > 0 && onSaveTime) {
        const timerData = {
          totalTime: totalTime,
          seriesTimes: finalSeriesTimes,
          seriesWeights: isRound ? [] : finalSeriesWeights,
          formattedTotalTime: formatTime(totalTime),
          formattedSeriesTimes: finalSeriesTimes.map((serieTime, index) => ({
            serie: index + 1,
            time: formatTime(serieTime)
          }))
        };
        onSaveTime(timerData);
        onClose();
      }
    }
  };

  // Finalizar rutina completamente
  const handleFinishRoutine = () => {
    if (window.confirm('¿Estás seguro de que quieres finalizar la rutina completa? El cronómetro se detendrá completamente.')) {
      setIsRunning(false);
      setIsPaused(false);
      setIsRoutineMode(false);
      
      // Limpiar localStorage
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Error clearing timer state:', error);
      }
      
      // Cerrar cronómetro
      onClose();
    }
  };

  // Resetear todo
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear el cronómetro? Se perderán todos los datos.')) {
      setIsRunning(false);
      setIsPaused(false);
      setTime(0);
      setCurrentSeries(1);
      setSeriesTimes([]);
      setSeriesWeights([]);
      setCurrentWeight('');
      setTotalTime(0);
      setIsResting(false);
      setIsRoutineMode(false);
      clearInterval(intervalRef.current);
      
      // Limpiar localStorage
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Error clearing timer state:', error);
      }
    }
  };

  // Limpiar intervalo al desmontar componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {isMinimized ? (
        // Versión minimizada - flotante en la esquina
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">Cronómetro</h4>
              <div className="flex gap-1">
                {/* Botón para expandir */}
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Expandir"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                {/* Botón para cerrar */}
                <button
                  onClick={() => {
                    if (isRoutineMode && isRunning) {
                      if (window.confirm('El cronómetro está en modo rutina y corriendo. ¿Estás seguro de que quieres cerrar? El cronómetro se pausará.')) {
                        setIsPaused(true);
                        onClose();
                      }
                    } else {
                      onClose();
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Cerrar"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Estado del ejercicio minimizado */}
            <div className="text-xs text-gray-600 mb-2">
              {isRound ? 
                `${currentExercise?.name} (${currentExercise?.exercises?.length || 0} ejercicios)` : 
                currentExercise?.name
              }
              <div className="text-purple-600 text-xs mt-1">
                Ejercicio {exerciseIndex + 1} de {allExercises.length}
              </div>
            </div>
            
            {/* Tiempo actual y serie */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xl font-bold font-mono ${
                isRunning && !isPaused ? 
                  (isResting ? 'text-blue-600' : 'text-red-600') : 
                  'text-gray-600'
              }`}>{formatTime(time)}</span>
              <span className="text-xs text-gray-500">
                {isRound ? `Round ${currentSeries}/${totalSeries}` : `Serie ${currentSeries}/${totalSeries}`}
              </span>
            </div>
            
            {/* Estado actual */}
            <div className="text-xs text-center mb-2">
              {isRestingBetweenExercises ? (
                <span className="text-purple-600">🛑 Descanso entre ejercicios</span>
              ) : isResting ? (
                <span className="text-orange-600">⏸️ Descansando</span>
              ) : isRunning ? (
                <span className="text-green-600">▶️ Corriendo</span>
              ) : isPaused ? (
                <span className="text-yellow-600">⏸️ Pausado</span>
              ) : (
                <span className="text-gray-600">⏹️ Detenido</span>
              )}
              {/* Mostrar tiempo total en modo rutina */}
              {isRoutineMode && (
                <div className="text-purple-600 mt-1">
                  🔄 Rutina: {formatTime(totalTime)}
                </div>
              )}
            </div>
            
            {/* Controles básicos */}
            <div className="flex gap-1 justify-center">
              {isRestingBetweenExercises ? (
                // Botón para ir al siguiente ejercicio
                <button
                  onClick={handleNextExercise}
                  className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                  title="Ir al siguiente ejercicio"
                >
                  ➡️ Siguiente
                </button>
              ) : !isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                >
                  ▶️
                </button>
              ) : isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  ▶️
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
                  >
                    ⏸️
                  </button>
                  {!isResting && time > 0 && (
                    <button
                      onClick={handleNextSeries}
                      className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      title={currentSeries < totalSeries ? 
                        (isRound ? 'Siguiente Round' : 'Iniciar descanso') : 
                        'Finalizar ejercicio'
                      }
                    >
                      {currentSeries < totalSeries ? '💤' : '🏁'}
                      <span className="ml-1 text-xs">
                        {currentSeries < totalSeries ? 
                          (isRound ? 'Round' : 'Descanso') : 
                          'Finalizar'
                        }
                      </span>
                    </button>
                  )}
                  {isResting && (
                    <button
                      onClick={handleEndRest}
                      className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                      title="Terminar descanso"
                    >
                      ▶️
                    </button>
                  )}
                  {/* Botón Finalizar Rutina en vista minimizada */}
                  {isRoutineMode && (
                    <button
                      onClick={handleFinishRoutine}
                      className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                      title="Finalizar rutina completa"
                    >
                      🏁
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Versión completa
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm max-h-[80vh] flex flex-col">
            {/* Header fijo */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Cronómetro</h3>
                <div className="flex gap-1">
                  {/* Botón minimizar */}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Minimizar"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  {/* Botón cerrar */}
                  <button
                    onClick={() => {
                      if (isRoutineMode && isRunning) {
                        if (window.confirm('El cronómetro está en modo rutina y corriendo. ¿Estás seguro de que quieres cerrar? El cronómetro se pausará.')) {
                          setIsPaused(true);
                          onClose();
                        }
                      } else {
                        onClose();
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Cerrar"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isRound ? 
                  `${currentExercise?.name} (${currentExercise?.exercises?.length || 0} ejercicios)` : 
                  currentExercise?.name
                }
                <span className="text-purple-600 block mt-1">
                  Ejercicio {exerciseIndex + 1} de {allExercises.length}
                </span>
              </p>
              
              {/* Mostrar ejercicios del round */}
              {isRound && currentExercise?.exercises && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">Ejercicios en este round:</h4>
                  <div className="space-y-1">
                    {currentExercise.exercises.map((ex, index) => (
                      <div key={index} className="text-xs text-gray-600 flex justify-between">
                        <span>{ex.name}</span>
                        <span className="text-gray-500">
                          {ex.reps && `${ex.reps} reps`}
                          {ex.reps && ex.weight && ' | '}
                          {ex.weight && `${ex.weight} kg`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Estado actual */}
            <div className="text-center mb-3">
              <div className="text-sm font-medium text-gray-600 mb-1">
                {isRestingBetweenExercises ? (
                  <span className="text-purple-600">
                    🛑 Descanso entre ejercicios
                  </span>
                ) : isResting ? (
                  <span className="text-orange-600">
                    Descanso - {isRound ? `Round ${currentSeries}` : `Serie ${currentSeries}`}
                  </span>
                ) : (
                  <span className="text-blue-600">
                    {isRound ? `Round ${currentSeries} de ${totalSeries}` : `Serie ${currentSeries} de ${totalSeries}`}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Tiempo total: {formatTime(totalTime)}
              </div>
            </div>

            {/* Cronómetro principal */}
            <div className="text-center mb-4">
              <div className="bg-gray-100 rounded-xl p-4 mb-3">
                <div className={`text-6xl font-mono font-bold mb-1 ${
                  isRunning && !isPaused ? 
                    (isResting ? 'text-blue-600' : 'text-red-600') : 
                    'text-gray-800'
                }`}>
                  {formatTime(time)}
                </div>
                <div className="text-xs text-gray-500">
                  {isRunning ? (isPaused ? 'En pausa' : (isResting ? 'Descansando' : 'Ejecutando')) : 'Detenido'}
                </div>
                
                {/* Información del modo rutina y tiempo total */}
                {isRoutineMode && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="text-xs text-purple-600 font-medium mb-1">
                      🔄 Modo Rutina Activo
                    </div>
                    <div className="text-sm font-mono text-gray-700">
                      <span className="text-xs text-gray-500">Tiempo total rutina: </span>
                      <span className="font-bold">{formatTime(totalTime)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Campo de peso para la serie actual - Solo para ejercicios individuales */}
              {!isRound && (!isRunning || (isRunning && isResting)) && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Peso Serie {currentSeries} (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-24 mx-auto px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    placeholder="Ej: 80"
                  />
                </div>
              )}

              {/* Botones de control */}
              <div className="flex justify-center gap-2 flex-wrap">
                {isRestingBetweenExercises ? (
                  // Controles durante descanso entre ejercicios
                  <button
                    onClick={handleNextExercise}
                    className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Siguiente Ejercicio
                  </button>
                ) : !isRunning ? (
                  <>
                    <button
                      onClick={handleStart}
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Iniciar
                    </button>
                    {(totalTime > 0 || seriesTimes.length > 0) && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium text-sm"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Reset
                      </button>
                    )}
                  </>
                ) : isPaused ? (
                  <>
                    <button
                      onClick={handleResume}
                      className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Reanudar
                    </button>
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
                      </svg>
                      Parar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                      Pausar
                    </button>
                    
                    {/* Botón Descanso */}
                    {!isResting && time > 0 && (
                      <button
                        onClick={handleNextSeries}
                        className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {currentSeries < totalSeries ? 
                          (isRound ? 'Siguiente Round' : 'Descanso') : 
                          'Finalizar'
                        }
                      </button>
                    )}

                    {/* Botón para finalizar descanso */}
                    {isResting && (
                      <button
                        onClick={handleEndRest}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors font-medium text-sm"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        {isRound ? 'Empezar Round' : 'Empezar Serie'}
                      </button>
                    )}
                    
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {isRoutineMode ? 
                        (exerciseIndex < allExercises.length - 1 ? 'Siguiente Ejercicio' : 'Finalizar') : 
                        'Parar'
                      }
                    </button>
                    
                    {/* Botón Finalizar Rutina - Solo visible en modo rutina */}
                    {isRoutineMode && (
                      <button
                        onClick={handleFinishRoutine}
                        className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Finalizar Rutina
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Historial de series */}
            {seriesTimes.length > 0 && (
              <div className="bg-green-50 rounded-md p-3 mb-3">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  {isRound ? 'Rounds Completados' : 'Series Completadas'}
                </h4>
                <div className="space-y-1">
                  {seriesTimes.map((serieTime, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">
                        {isRound ? `Round ${index + 1}:` : `Serie ${index + 1}:`}
                      </span>
                      <div className="flex gap-2">
                        <span className="font-semibold text-green-600">{formatTime(serieTime)}</span>
                        {!isRound && seriesWeights[index] && (
                          <span className="font-semibold text-blue-600">{seriesWeights[index]} kg</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información del ejercicio */}
            <div className="bg-blue-50 rounded-md p-3">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Información del Ejercicio</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Series:</span>
                  <div className="font-semibold text-sm text-blue-600">
                    {currentExercise?.sets || currentExercise?.series || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Repeticiones:</span>
                  <div className="font-semibold text-sm text-blue-600">
                    {currentExercise?.reps || currentExercise?.repetitions || 'N/A'}
                  </div>
                </div>
                {currentExercise?.rest && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Descanso:</span>
                    <div className="font-semibold text-sm text-green-600">
                      {currentExercise.rest}
                    </div>
                  </div>
                )}
                {currentExercise?.weight && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Peso:</span>
                    <div className="font-semibold text-sm text-purple-600">
                      {currentExercise.weight}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={() => {
                if (isRoutineMode && isRunning) {
                  if (window.confirm('El cronómetro está en modo rutina y corriendo. ¿Estás seguro de que quieres cerrar? El cronómetro se pausará.')) {
                    setIsPaused(true);
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default ExerciseTimer;
