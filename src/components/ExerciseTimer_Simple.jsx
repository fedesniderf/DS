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

  // Detectar si es un round (conjunto de ejercicios) o ejercicio individual
  const isRound = currentExercise?.exercises && Array.isArray(currentExercise.exercises);
  const totalSeries = currentExercise?.sets || currentExercise?.series || 3;

  // Función para formatear tiempo en MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Función para cargar estado desde localStorage
  const loadTimerState = () => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed && typeof parsed === 'object') {
          return {
            totalTime: parsed.totalTime || 0,
            isRunning: parsed.isRunning || false,
            isResting: parsed.isResting || false,
            currentSeries: parsed.currentSeries || 1,
            seriesData: parsed.seriesData || [],
            currentWeight: parsed.currentWeight || '',
            exerciseIndex: parsed.exerciseIndex || 0,
            seriesStartTime: parsed.seriesStartTime || 0
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
    const state = {
      totalTime,
      isRunning,
      isResting,
      currentSeries,
      seriesData,
      currentWeight,
      exerciseIndex,
      seriesStartTime: seriesStartTimeRef.current
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  // Cargar estado inicial
  useEffect(() => {
    const savedState = loadTimerState();
    if (savedState) {
      setTotalTime(savedState.totalTime);
      setIsRunning(savedState.isRunning);
      setIsResting(savedState.isResting);
      setCurrentSeries(savedState.currentSeries);
      setSeriesData(savedState.seriesData);
      setCurrentWeight(savedState.currentWeight);
      setExerciseIndex(savedState.exerciseIndex);
      seriesStartTimeRef.current = savedState.seriesStartTime;
      
      // Restaurar ejercicio actual
      if (savedState.exerciseIndex >= 0 && savedState.exerciseIndex < allExercises.length) {
        setCurrentExercise(allExercises[savedState.exerciseIndex]);
      }
    }
  }, []);

  // Función para ir al siguiente ejercicio
  const handleNextExercise = () => {
    if (exerciseIndex < allExercises.length - 1) {
      const nextIndex = exerciseIndex + 1;
      const nextExercise = allExercises[nextIndex];
      setCurrentExercise(nextExercise);
      setExerciseIndex(nextIndex);
      
      // Resetear datos del ejercicio pero mantener cronómetro corriendo
      setCurrentSeries(1);
      setSeriesData([]);
      setCurrentWeight('');
      setIsResting(false);
      seriesStartTimeRef.current = totalTime; // Marcar inicio del nuevo ejercicio
    } else {
      // Último ejercicio completado
      handleFinish();
    }
  };

  // FUNCIONES PRINCIPALES DE LOS 3 BOTONES:

  // 1. Empezar/Pausar - Pausa el cronómetro sin resetearlo
  const handleStartPause = () => {
    if (!isRunning) {
      // Iniciar cronómetro
      setIsRunning(true);
      if (seriesData.length === 0) {
        seriesStartTimeRef.current = totalTime; // Marcar inicio de la primera serie
      }
    } else {
      // Pausar cronómetro
      setIsRunning(false);
    }
  };

  // 2. Descanso/Continuar - Marca fin/inicio de series y entre ejercicios
  const handleRestContinue = () => {
    if (!isResting) {
      // Iniciar descanso (fin de serie)
      const seriesTime = totalTime - seriesStartTimeRef.current;
      const newSeriesData = [...seriesData, {
        series: currentSeries,
        time: seriesTime,
        weight: currentWeight || '',
        startTime: seriesStartTimeRef.current,
        endTime: totalTime
      }];
      setSeriesData(newSeriesData);
      setIsResting(true);
      
      // Verificar si completó todas las series del ejercicio
      if (currentSeries >= totalSeries) {
        // Ejercicio completado, preparar para siguiente ejercicio o finalizar
        if (exerciseIndex < allExercises.length - 1) {
          // Hay más ejercicios, el cronómetro sigue corriendo
          console.log('Ejercicio completado, listo para el siguiente');
        } else {
          // Era el último ejercicio
          console.log('Último ejercicio completado');
        }
      }
    } else {
      // Continuar (inicio de nueva serie o nuevo ejercicio)
      setIsResting(false);
      
      if (currentSeries >= totalSeries) {
        // Pasar al siguiente ejercicio
        handleNextExercise();
      } else {
        // Nueva serie del mismo ejercicio
        setCurrentSeries(prev => prev + 1);
        setCurrentWeight(''); // Limpiar peso para la nueva serie
        seriesStartTimeRef.current = totalTime; // Marcar inicio de nueva serie
      }
    }
  };

  // 3. Finalizar - Finaliza completamente y guarda en base de datos
  const handleFinish = () => {
    // Guardar serie actual si estaba en progreso
    if (!isResting && isRunning) {
      const seriesTime = totalTime - seriesStartTimeRef.current;
      const finalSeriesData = [...seriesData, {
        series: currentSeries,
        time: seriesTime,
        weight: currentWeight || '',
        startTime: seriesStartTimeRef.current,
        endTime: totalTime
      }];
      setSeriesData(finalSeriesData);
    }

    // Detener cronómetro completamente
    setIsRunning(false);
    
    // Enviar datos al modal de seguimiento semanal
    if (totalTime > 0 && onSaveTime) {
      const timerData = {
        totalTime: totalTime,
        seriesData: seriesData,
        formattedTotalTime: formatTime(totalTime),
        formattedSeriesData: seriesData.map((serie, index) => ({
          serie: serie.series,
          time: formatTime(serie.time),
          weight: serie.weight
        }))
      };
      onSaveTime(timerData);
    }
    
    // Limpiar localStorage
    localStorage.removeItem(storageKey);
    
    // Cerrar modal
    onClose();
  };

  // Efecto para manejar el cronómetro
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

  // Guardar estado cada vez que cambie
  useEffect(() => {
    saveTimerState();
  }, [totalTime, isRunning, isResting, currentSeries, seriesData, currentWeight, exerciseIndex]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Cronómetro Simplificado</h3>
            <button
              onClick={handleFinish}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Cerrar"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
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
        </div>

        {/* Contenido principal */}
        <div className="p-4">
          {/* Estado actual */}
          <div className="text-center mb-4">
            <div className="text-sm font-medium text-gray-600 mb-2">
              {isResting ? (
                <span className="text-orange-600">🛑 Descansando</span>
              ) : (
                <span className="text-blue-600">
                  {isRound ? `Round ${currentSeries} de ${totalSeries}` : `Serie ${currentSeries} de ${totalSeries}`}
                </span>
              )}
            </div>
          </div>

          {/* Cronómetro principal */}
          <div className="text-center mb-6">
            <div className="bg-gray-100 rounded-xl p-6 mb-4">
              <div className={`text-5xl font-mono font-bold mb-2 ${
                isRunning ? 'text-red-600' : 'text-gray-800'
              }`}>
                {formatTime(totalTime)}
              </div>
              <div className="text-sm text-gray-500">
                {isRunning ? 'Corriendo' : 'Pausado'}
              </div>
            </div>
          </div>

          {/* Campo de peso para la serie actual */}
          {!isRound && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Serie {currentSeries} (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="Ej: 80"
              />
            </div>
          )}

          {/* LOS 3 BOTONES PRINCIPALES */}
          <div className="space-y-3">
            {/* 1. Botón Empezar/Pausar */}
            <button
              onClick={handleStartPause}
              className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                isRunning 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isRunning ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                  Pausar
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Empezar
                </>
              )}
            </button>

            {/* 2. Botón Descanso/Continuar */}
            <button
              onClick={handleRestContinue}
              disabled={!isRunning && !isResting}
              className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                isResting 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isResting ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Continuar
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  </svg>
                  Descanso
                </>
              )}
            </button>

            {/* 3. Botón Finalizar */}
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Finalizar
            </button>
          </div>

          {/* Historial de series */}
          {seriesData.length > 0 && (
            <div className="mt-6 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                {isRound ? 'Rounds Completados' : 'Series Completadas'}
              </h4>
              <div className="space-y-2">
                {seriesData.map((serie, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {isRound ? `Round ${serie.series}:` : `Serie ${serie.series}:`}
                    </span>
                    <div className="flex gap-3">
                      <span className="font-semibold text-green-600">{formatTime(serie.time)}</span>
                      {!isRound && serie.weight && (
                        <span className="font-semibold text-blue-600">{serie.weight} kg</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información del ejercicio */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Información del Ejercicio</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Series:</span>
                <div className="font-semibold text-blue-600">
                  {currentExercise?.sets || currentExercise?.series || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Repeticiones:</span>
                <div className="font-semibold text-blue-600">
                  {currentExercise?.reps || currentExercise?.repetitions || 'N/A'}
                </div>
              </div>
              {currentExercise?.rest && (
                <div className="col-span-2">
                  <span className="text-gray-600">Descanso:</span>
                  <div className="font-semibold text-blue-600">
                    {currentExercise.rest}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseTimer;
