import React, { useState, useEffect, useRef } from 'react';

const ExerciseTimerSimple = ({ exercise, onClose, onSaveTime }) => {
  // Estado para manejar navegación entre ejercicios
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const [exerciseIndex, setExerciseIndex] = useState(exercise?.currentIndex || 0);
  const allExercises = exercise?.allExercises || [exercise];
  const isRoutineMode = allExercises.length > 1;
  
  // Clave única para localStorage basada en la rutina completa
  const storageKey = `timer_routine_${allExercises.map(ex => ex.id).join('_')}`;
  
  // Estados del cronómetro simplificado
  const [totalTime, setTotalTime] = useState(0); // Tiempo total continuo de la rutina
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false); // Estado de descanso (entre series o ejercicios)
  const [currentSeries, setCurrentSeries] = useState(1);
  const [seriesTimes, setSeriesTimes] = useState([]); // Tiempos de cada serie del ejercicio actual
  const [currentWeight, setCurrentWeight] = useState('');
  const [seriesWeights, setSeriesWeights] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Detectar si es un round o ejercicio individual
  const isRound = currentExercise?.exercises && Array.isArray(currentExercise.exercises);
  const totalSeries = isRound ? 
    (currentExercise?.sets || currentExercise?.series || 3) : 
    (currentExercise?.sets || currentExercise?.series || 3);

  const intervalRef = useRef(null);

  // Función para cargar estado desde localStorage
  const loadTimerState = () => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed && typeof parsed === 'object') {
          return {
            totalTime: parsed.totalTime || 0,
            currentSeries: parsed.currentSeries || 1,
            seriesTimes: Array.isArray(parsed.seriesTimes) ? parsed.seriesTimes : [],
            seriesWeights: Array.isArray(parsed.seriesWeights) ? parsed.seriesWeights : [],
            isRunning: parsed.isRunning || false,
            isResting: parsed.isResting || false,
            exerciseIndex: parsed.exerciseIndex || 0,
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
  const saveTimerState = () => {
    try {
      const stateToSave = {
        totalTime,
        currentSeries,
        seriesTimes,
        seriesWeights,
        isRunning,
        isResting,
        exerciseIndex,
        lastTimestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  // Inicializar estado desde localStorage
  useEffect(() => {
    const savedState = loadTimerState();
    if (savedState) {
      setTotalTime(savedState.totalTime);
      setCurrentSeries(savedState.currentSeries);
      setSeriesTimes(savedState.seriesTimes);
      setSeriesWeights(savedState.seriesWeights);
      setIsRunning(savedState.isRunning);
      setIsResting(savedState.isResting);
      
      // Recuperar ejercicio actual
      if (savedState.exerciseIndex >= 0 && savedState.exerciseIndex < allExercises.length) {
        setExerciseIndex(savedState.exerciseIndex);
        setCurrentExercise(allExercises[savedState.exerciseIndex]);
      }
    }
  }, []);

  // Efecto del cronómetro - siempre corre cuando isRunning es true
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    saveTimerState();
  }, [totalTime, currentSeries, seriesTimes, seriesWeights, isRunning, isResting, exerciseIndex]);

  // Función para formatear tiempo
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para ir al siguiente ejercicio
  const handleNextExercise = () => {
    if (exerciseIndex < allExercises.length - 1) {
      const nextIndex = exerciseIndex + 1;
      const nextExercise = allExercises[nextIndex];
      setCurrentExercise(nextExercise);
      setExerciseIndex(nextIndex);
      
      // Resetear datos del ejercicio actual pero mantener cronómetro corriendo
      setCurrentSeries(1);
      setSeriesTimes([]);
      setSeriesWeights([]);
      setCurrentWeight('');
      setIsResting(false);
    }
  };

  // 1. EMPEZAR/PAUSAR - Inicia o pausa el cronómetro sin resetearlo
  const handleStartPause = () => {
    if (isRunning) {
      // Pausar
      setIsRunning(false);
    } else {
      // Iniciar o reanudar
      setIsRunning(true);
      
      // Si es el primer inicio de una serie (no está en descanso)
      if (!isResting) {
        console.log(`Iniciando serie ${currentSeries} del ejercicio ${currentExercise?.name}`);
      }
    }
  };

  // 2. DESCANSO/CONTINUAR - Marca fin de serie e inicio de descanso, o viceversa
  const handleRestContinue = () => {
    if (isResting) {
      // CONTINUAR - Salir del descanso e iniciar nueva serie
      setIsResting(false);
      
      if (currentSeries <= totalSeries) {
        console.log(`Iniciando serie ${currentSeries} del ejercicio ${currentExercise?.name}`);
      }
    } else {
      // DESCANSO - Marcar fin de serie actual
      if (isRunning) {
        // Calcular tiempo de la serie actual desde el último tiempo guardado
        const currentSerieStartTime = seriesTimes.reduce((sum, time) => sum + time, 0);
        const serieTime = totalTime - currentSerieStartTime;
        const newSeriesTimes = [...seriesTimes, serieTime];
        setSeriesTimes(newSeriesTimes);
        
        // Guardar peso si no es round
        if (!isRound && currentWeight) {
          setSeriesWeights([...seriesWeights, currentWeight]);
          setCurrentWeight('');
        }
        
        console.log(`Finalizando serie ${currentSeries} del ejercicio ${currentExercise?.name} - Tiempo: ${formatTime(serieTime)}`);
        
        // Verificar si se completaron todas las series del ejercicio
        if (currentSeries >= totalSeries) {
          // Ejercicio completado, pasar al siguiente
          if (exerciseIndex < allExercises.length - 1) {
            console.log(`Ejercicio ${currentExercise?.name} completado. Pasando al siguiente ejercicio.`);
            handleNextExercise();
            return;
          }
        } else {
          // Incrementar serie
          setCurrentSeries(prev => prev + 1);
        }
        
        setIsResting(true);
      }
    }
  };

  // 3. FINALIZAR - Finaliza completamente y guarda en base de datos
  const handleFinish = () => {
    // Detener cronómetro
    setIsRunning(false);
    
    // Guardar tiempo final de la serie actual si hay una en progreso
    if (!isResting && totalTime > 0) {
      const currentSerieStartTime = seriesTimes.reduce((sum, time) => sum + time, 0);
      const finalSerieTime = totalTime - currentSerieStartTime;
      const finalSeriesTimes = [...seriesTimes, finalSerieTime];
      setSeriesTimes(finalSeriesTimes);
      
      if (!isRound && currentWeight) {
        setSeriesWeights([...seriesWeights, currentWeight]);
      }
    }
    
    // Enviar datos al componente padre para guardar en base de datos
    if (onSaveTime && totalTime > 0) {
      const timerData = {
        totalTime: totalTime,
        formattedTotalTime: formatTime(totalTime),
        exerciseData: allExercises.map((ex, index) => ({
          exerciseId: ex.id,
          name: ex.name,
          completed: index <= exerciseIndex
        }))
      };
      onSaveTime(timerData);
    }
    
    // Limpiar localStorage
    localStorage.removeItem(storageKey);
    
    // Cerrar modal
    onClose();
  };

  return (
    <div>
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
                  onClick={handleFinish}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Finalizar y cerrar"
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
              {isRoutineMode && (
                <div className="text-purple-600 text-xs mt-1">
                  Ejercicio {exerciseIndex + 1} de {allExercises.length}
                </div>
              )}
            </div>
            
            {/* Tiempo total y serie */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xl font-bold font-mono ${
                isRunning ? 'text-green-600' : 'text-gray-600'
              }`}>{formatTime(totalTime)}</span>
              <span className="text-xs text-gray-500">
                {isRound ? `Round ${currentSeries}/${totalSeries}` : `Serie ${currentSeries}/${totalSeries}`}
              </span>
            </div>
            
            {/* Estado actual */}
            <div className="text-xs text-center mb-2">
              {isResting ? (
                <span className="text-orange-600">⏸️ Descansando</span>
              ) : isRunning ? (
                <span className="text-green-600">▶️ Corriendo</span>
              ) : (
                <span className="text-gray-600">⏹️ Detenido</span>
              )}
            </div>
            
            {/* Controles básicos minimizados */}
            <div className="flex gap-1 justify-center">
              <button
                onClick={handleStartPause}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isRunning ? '⏸️' : '▶️'}
              </button>
              
              <button
                onClick={handleRestContinue}
                className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
              >
                {isResting ? '▶️' : '💤'}
              </button>
              
              <button
                onClick={handleFinish}
                className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
              >
                🏁
              </button>
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
                <h3 className="text-base font-bold text-gray-800">Cronómetro Simplificado</h3>
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
                    onClick={handleFinish}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Finalizar y cerrar"
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
                {isRoutineMode && (
                  <span className="text-purple-600 block mt-1">
                    Ejercicio {exerciseIndex + 1} de {allExercises.length}
                  </span>
                )}
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
                  {isResting ? (
                    <span className="text-orange-600">
                      🛑 Descansando - {isRound ? `Round ${currentSeries}` : `Serie ${currentSeries}`}
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
                    isRunning ? 'text-green-600' : 'text-gray-800'
                  }`}>
                    {formatTime(totalTime)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRunning ? (isResting ? 'Descansando' : 'Ejecutando') : 'Detenido'}
                  </div>
                  
                  {/* Información del modo rutina */}
                  {isRoutineMode && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="text-xs text-purple-600 font-medium">
                        🔄 Modo Rutina Activo
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo de peso para la serie actual - Solo para ejercicios individuales */}
                {!isRound && (
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

                {/* BOTONES PRINCIPALES SIMPLIFICADOS */}
                <div className="flex flex-col gap-3 justify-center">
                  {/* 1. EMPEZAR/PAUSAR */}
                  <button
                    onClick={handleStartPause}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isRunning 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      {isRunning ? (
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      )}
                    </svg>
                    {isRunning ? 'Pausar' : 'Empezar'}
                  </button>

                  {/* 2. DESCANSO/CONTINUAR */}
                  <button
                    onClick={handleRestContinue}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isResting 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      {isResting ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      ) : (
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      )}
                    </svg>
                    {isResting ? 'Continuar' : 'Descanso'}
                  </button>

                  {/* 3. FINALIZAR */}
                  <button
                    onClick={handleFinish}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Finalizar
                  </button>
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
                      <div className="font-semibold text-sm text-blue-600">
                        {currentExercise.rest}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseTimerSimple;
