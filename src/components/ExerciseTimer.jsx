import React, { useState, useEffect, useRef } from 'react';

const ExerciseTimer = ({ 
  exercise, 
  onClose, 
  onSaveTime,
  routineExercises = [], // Lista completa de ejercicios de la rutina
  currentExerciseIndex = 0, // Índice del ejercicio actual
  onNextExercise = null // Callback para pasar al siguiente ejercicio
}) => {
  const [time, setTime] = useState(0); // Tiempo en segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(1);
  const [seriesTimes, setSeriesTimes] = useState([]); // Tiempos de cada serie
  const [seriesWeights, setSeriesWeights] = useState([]); // Pesos de cada serie
  const [currentWeight, setCurrentWeight] = useState(''); // Peso actual en curso
  const [totalTime, setTotalTime] = useState(0); // Tiempo total del ejercicio
  const [isResting, setIsResting] = useState(false); // Estado de descanso
  const [isMinimized, setIsMinimized] = useState(false); // Estado minimizado
  const [showCloseWarning, setShowCloseWarning] = useState(false); // Advertencia de cierre
  const [waitingForNextExercise, setWaitingForNextExercise] = useState(false); // Esperando siguiente ejercicio
  
  // Estados específicos para rounds
  const [currentExerciseInRound, setCurrentExerciseInRound] = useState(0); // Ejercicio actual dentro del round
  const [roundExercisesTimes, setRoundExercisesTimes] = useState([]); // Tiempos de cada ejercicio en el round actual
  
  const intervalRef = useRef(null);

  // Detectar si es un round o ejercicio individual
  const isRound = exercise?.isRound || false;
  const totalSeries = isRound ? 
    parseInt(exercise?.cantidadRounds) || 1 : 
    parseInt(exercise?.series) || 1;

  // Información específica para rounds
  const roundExercises = isRound ? exercise?.exercises || [] : [];
  const totalExercisesInRound = roundExercises.length;
  const currentRoundExercise = isRound && roundExercises[currentExerciseInRound] ? roundExercises[currentExerciseInRound] : null;

  // Información de la rutina
  const totalExercises = routineExercises.length;
  const hasNextExercise = currentExerciseIndex < totalExercises - 1;
  const nextExercise = hasNextExercise ? routineExercises[currentExerciseIndex + 1] : null;

  // Formatear tiempo en MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Efecto para manejar el cronómetro - NUNCA se detiene hasta finalizar sesión
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
        setTotalTime(prevTotal => prevTotal + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  // Iniciar cronómetro
  const handleStartPause = () => {
    if (!isRunning) {
      // Iniciar por primera vez
      if (!isRound && currentWeight) {
        const newSeriesWeights = [...seriesWeights];
        newSeriesWeights[currentSeries - 1] = currentWeight;
        setSeriesWeights(newSeriesWeights);
      }
      setIsRunning(true);
      setIsPaused(false);
    } else if (isPaused) {
      // Reanudar
      setIsPaused(false);
    } else {
      // Pausar
      setIsPaused(true);
    }
  };

  // Manejar Descanso/Continuar
  const handleRestContinue = () => {
    if (isResting) {
      // Continuar - terminar descanso y empezar siguiente serie/ejercicio
      if (!isRound && currentWeight) {
        const newSeriesWeights = [...seriesWeights];
        newSeriesWeights[currentSeries - 1] = currentWeight;
        setSeriesWeights(newSeriesWeights);
      }
      setIsResting(false);
      setTime(0); // Resetear tiempo para la nueva serie/ejercicio
    } else {
      if (isRound) {
        // Lógica simplificada para rounds: todos los ejercicios del round se hacen en el mismo tiempo
        // Funciona igual que un ejercicio individual, pero muestra todos los ejercicios del round
        const newSeriesTimes = [...seriesTimes, time];
        setSeriesTimes(newSeriesTimes);
        
        if (currentSeries < totalSeries) {
          // Hay más rounds, pasar al descanso
          setIsResting(true);
          setCurrentSeries(currentSeries + 1);
          setTime(0); // Resetear tiempo para contar el descanso
        } else {
          // Era el último round, finalizar ejercicio
          handleFinishCurrentExercise();
        }
      } else {
        // Lógica original para ejercicios individuales
        const newSeriesTimes = [...seriesTimes, time];
        setSeriesTimes(newSeriesTimes);
        
        if (currentSeries < totalSeries) {
          // Hay más series, pasar al descanso
          setIsResting(true);
          setCurrentSeries(currentSeries + 1);
          setTime(0); // Resetear tiempo para contar el descanso
          setCurrentWeight(''); // Limpiar peso para preparar la siguiente serie
        } else {
          // Era la última serie, finalizar ejercicio PERO continuar cronómetro
          handleFinishCurrentExercise();
        }
      }
    }
  };

  // Nueva función: Finalizar ejercicio actual pero continuar cronómetro para siguiente ejercicio
  const handleFinishCurrentExercise = () => {
    // Guardar datos del ejercicio actual
    let finalSeriesTimes = [...seriesTimes];
    let finalSeriesWeights = [...seriesWeights];
    if (time > 0 && !isResting) {
      finalSeriesTimes = [...seriesTimes, time];
      if (!isRound) {
        finalSeriesWeights = [...seriesWeights, currentWeight || ''];
        setSeriesWeights(finalSeriesWeights);
      }
      setSeriesTimes(finalSeriesTimes);
    }
    
    // Enviar datos al modal de seguimiento semanal si hay tiempo registrado
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
      
      // Minimizar el cronómetro y mostrar modal de datos
      setIsMinimized(true);
      onSaveTime(timerData);
      
      // Resetear para el siguiente ejercicio PERO mantener el cronómetro funcionando
      resetForNextExercise();
      
      // Si hay siguiente ejercicio, marcar que estamos esperando Y poner en estado de descanso
      if (hasNextExercise) {
        setWaitingForNextExercise(true);
        setIsResting(true); // Poner en estado de descanso al finalizar ejercicio
        setTime(0); // Resetear el tiempo para el descanso
        console.log('Ejercicio completado. Pasando al estado de descanso antes del siguiente ejercicio.');
      }
    }
  };

  // Función para preparar el siguiente ejercicio (llamada desde el componente padre)
  const prepareForNextExercise = () => {
    console.log('Preparando cronómetro para siguiente ejercicio');
    
    if (hasNextExercise && onNextExercise) {
      // Llamar al callback del componente padre para cambiar al siguiente ejercicio
      const success = onNextExercise();
      
      if (success) {
        // Resetear estado de espera y expandir cronómetro
        setWaitingForNextExercise(false);
        setIsMinimized(false);
        setIsResting(false); // Salir del estado de descanso al cambiar al siguiente ejercicio
        setTime(0); // Empezar desde 0 para el nuevo ejercicio
        
        console.log('Cambiando al siguiente ejercicio:', nextExercise?.name);
      } else {
        console.log('No se pudo cambiar al siguiente ejercicio');
      }
    } else {
      console.log('No hay más ejercicios en la rutina');
    }
  };

  // Exponer función para uso externo
  useEffect(() => {
    window.timerNextExercise = prepareForNextExercise;
    return () => {
      delete window.timerNextExercise;
    };
  }, [hasNextExercise, onNextExercise, currentExerciseIndex]);

  // Resetear valores para el siguiente ejercicio pero mantener cronómetro funcionando
  const resetForNextExercise = () => {
    // Mantener isRunning = true para que el cronómetro siga funcionando
    // Solo resetear las variables específicas del ejercicio
    setTime(0); // Resetear tiempo de serie
    setCurrentSeries(1); // Volver a serie 1
    setSeriesTimes([]); // Limpiar tiempos de series
    setSeriesWeights([]); // Limpiar pesos de series
    setCurrentWeight(''); // Limpiar peso actual
    
    // NO tocar setIsResting - se manejará por separado según el contexto
    // NO resetear totalTime - debe seguir acumulando
    // NO cambiar isRunning - debe seguir corriendo
  };

  // Finalizar sesión completa
  const handleFinishSession = () => {
    // Confirmar si realmente quiere finalizar
    if (window.confirm('¿Estás seguro de que quieres finalizar la sesión? Se guardará el tiempo registrado.')) {
      setIsRunning(false);
      setIsPaused(false);
      
      // Si había una serie en progreso, agregarla
      let finalSeriesTimes = [...seriesTimes];
      let finalSeriesWeights = [...seriesWeights];
      if (time > 0 && !isResting) {
        finalSeriesTimes = [...seriesTimes, time];
        if (!isRound) {
          finalSeriesWeights = [...seriesWeights, currentWeight || ''];
          setSeriesWeights(finalSeriesWeights);
        }
        setSeriesTimes(finalSeriesTimes);
      }
      
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
        
        // Minimizar el cronómetro y mostrar modal de datos
        setIsMinimized(true);
        onSaveTime(timerData);
        
        // No cerrar el cronómetro automáticamente, dejar que el usuario lo cierre manualmente
      } else {
        onClose();
      }
    }
  };

  // Manejar cierre con advertencia
  const handleCloseWithWarning = () => {
    if (isRunning || totalTime > 0) {
      setShowCloseWarning(true);
    } else {
      onClose();
    }
  };

  // Confirmar cierre
  const confirmClose = () => {
    setShowCloseWarning(false);
    // Detener el cronómetro
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
    onClose();
  };

  // Cancelar cierre
  const cancelClose = () => {
    setShowCloseWarning(false);
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
      {/* Modal de advertencia de cierre */}
      {showCloseWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ Advertencia</h3>
            <p className="text-sm text-gray-600 mb-6">
              {isRunning || totalTime > 0 
                ? "El cronómetro está en funcionamiento. Si cierras ahora, perderás el progreso actual. ¿Estás seguro?"
                : "¿Estás seguro de que quieres cerrar el cronómetro?"
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClose}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
                {/* Botón para cerrar con advertencia */}
                <button
                  onClick={handleCloseWithWarning}
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
              {/* Progreso de la rutina */}
              {totalExercises > 1 && (
                <div className="text-blue-600 font-semibold mb-1">
                  Ejercicio {currentExerciseIndex + 1} de {totalExercises}
                </div>
              )}
              
              {isRound ? 
                `${exercise?.name} (${exercise?.exercises?.length || 0} ejercicios)` : 
                exercise?.name
              }
              
              {currentSeries > totalSeries && !waitingForNextExercise && (
                <span className="text-green-600 font-semibold"> - ✅ Completado</span>
              )}
              
              {waitingForNextExercise && hasNextExercise && (
                <span className="text-blue-600 font-semibold"> - 🔄 Siguiente: {nextExercise?.name}</span>
              )}
            </div>
            
            {/* Tiempo actual y serie */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xl font-bold font-mono ${
                isRunning && !isPaused ? 
                  (isResting ? 'text-blue-600' : 'text-red-600') : 
                  'text-gray-600'
              }`}>{formatTime(time)}</span>
              <span className="text-xs text-gray-500">
                {currentSeries > totalSeries ? 
                  '✅ Listo para siguiente' :
                  (isRound ? `Round ${currentSeries}/${totalSeries}` : `Serie ${currentSeries}/${totalSeries}`)
                }
              </span>
            </div>
            
            {/* Estado actual */}
            <div className="text-xs text-center mb-2">
              {waitingForNextExercise && hasNextExercise ? (
                <span className="text-blue-600">🔄 Listo para siguiente ejercicio</span>
              ) : currentSeries > totalSeries ? (
                <span className="text-green-600">🎯 Ejercicio Completado</span>
              ) : isResting ? (
                <span className="text-orange-600">
                  {waitingForNextExercise ? '🔄 Descanso entre ejercicios' : 
                   isRound ? '⏸️ Descanso entre rounds' : '⏸️ Descansando'}
                </span>
              ) : isRunning ? (
                <span className="text-green-600">▶️ Corriendo</span>
              ) : isPaused ? (
                <span className="text-yellow-600">⏸️ Pausado</span>
              ) : (
                <span className="text-gray-600">⏹️ Detenido</span>
              )}
            </div>
            
            {/* Controles básicos - Solo 3 botones */}
            <div className="flex gap-1 justify-center flex-wrap">
              {/* Botón 1: Iniciar/Pausar */}
              <button
                onClick={handleStartPause}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  !isRunning 
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : isPaused 
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {!isRunning ? '▶️ Iniciar' : isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
              </button>
              
              {/* Botón 2: Descanso/Continuar - Solo si el ejercicio no está completado */}
              {isRunning && currentSeries <= totalSeries && !waitingForNextExercise && (
                <button
                  onClick={handleRestContinue}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    isResting 
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={!isResting && time === 0}
                >
                  {isResting ? '▶️ Continuar' : '💤 Descanso'}
                </button>
              )}

              {/* Botón especial: Siguiente ejercicio (solo cuando está esperando) */}
              {waitingForNextExercise && hasNextExercise && (
                <button
                  onClick={prepareForNextExercise}
                  className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  ⏭️ Siguiente
                </button>
              )}
              
              {/* Botón 3: Finalizar sesión */}
              <button
                onClick={handleFinishSession}
                className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
              >
                🏁 Finalizar
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
                  {/* Botón cerrar con advertencia */}
                  <button
                    onClick={handleCloseWithWarning}
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
                {/* Progreso de la rutina */}
                {totalExercises > 1 && (
                  <span className="text-blue-600 font-semibold">
                    Ejercicio {currentExerciseIndex + 1} de {totalExercises} • 
                  </span>
                )}
                {isRound ? 
                  ` ${exercise?.name} (${exercise?.exercises?.length || 0} ejercicios)` : 
                  ` ${exercise?.name}`
                }
                {waitingForNextExercise && hasNextExercise && (
                  <span className="text-blue-600 font-semibold"> • Siguiente: {nextExercise?.name}</span>
                )}
              </p>
              
              {/* Mostrar ejercicios del round */}
              {isRound && exercise?.exercises && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">
                    Ejercicios en este round (todos juntos):
                  </h4>
                  <div className="space-y-1">
                    {exercise.exercises.map((ex, index) => (
                      <div key={index} className="text-xs text-gray-600 flex justify-between">
                        <span>• {ex.name}</span>
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
                {waitingForNextExercise && hasNextExercise ? (
                  <span className="text-blue-600">
                    🔄 Listo para siguiente ejercicio: {nextExercise?.name}
                  </span>
                ) : currentSeries > totalSeries ? (
                  <span className="text-green-600">
                    🎯 Ejercicio Completado - {hasNextExercise ? 'Listo para siguiente' : 'Rutina terminada'}
                  </span>
                ) : isResting ? (
                  <span className="text-orange-600">
                    {waitingForNextExercise ? 
                      '🔄 Descanso entre ejercicios' : 
                      isRound ? 
                        `Descanso entre rounds - Round ${currentSeries} de ${totalSeries}` :
                        `Descanso - Serie ${currentSeries}`
                    }
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
              </div>

              {/* Campo de peso para la serie actual - Solo para ejercicios individuales */}
              {!isRound && (!isRunning || (isRunning && isResting)) && currentSeries <= totalSeries && (
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

              {/* Mensaje especial cuando el ejercicio está completado */}
              {(currentSeries > totalSeries || waitingForNextExercise) && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <span className="text-2xl">
                      {waitingForNextExercise && hasNextExercise ? '🔄' : '🎉'}
                    </span>
                    <p className="text-sm font-medium text-green-700 mt-1">
                      {waitingForNextExercise && hasNextExercise ? 
                        '¡Listo para el siguiente ejercicio!' : 
                        '¡Ejercicio completado!'
                      }
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {waitingForNextExercise && hasNextExercise ? 
                        `El cronómetro sigue funcionando. Guarda los datos y haz clic en "Siguiente" para continuar con: ${nextExercise?.name}` :
                        'El cronómetro sigue funcionando. Completa los datos y continúa con el siguiente ejercicio.'
                      }
                    </p>
                    
                    {/* Botón para siguiente ejercicio */}
                    {waitingForNextExercise && hasNextExercise && (
                      <button
                        onClick={prepareForNextExercise}
                        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm"
                      >
                        ⏭️ Continuar con {nextExercise?.name}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de control - Solo 3 botones principales */}
              <div className="flex justify-center gap-2 flex-wrap">
                {/* Botón 1: Iniciar/Pausar */}
                <button
                  onClick={handleStartPause}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                    !isRunning 
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : isPaused 
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    {!isRunning || isPaused ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    )}
                  </svg>
                  {!isRunning ? 'Iniciar' : isPaused ? 'Reanudar' : 'Pausar'}
                </button>

                {/* Botón 2: Descanso/Continuar - Solo si el ejercicio no está completado */}
                {isRunning && currentSeries <= totalSeries && !waitingForNextExercise && (
                  <button
                    onClick={handleRestContinue}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                      isResting 
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    disabled={!isResting && time === 0}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      {isResting ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      )}
                    </svg>
                    {isResting ? 'Continuar' : 'Descanso'}
                  </button>
                )}

                {/* Botón 3: Finalizar sesión */}
                <button
                  onClick={handleFinishSession}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
                  </svg>
                  Finalizar sesión
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
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                {isRound ? 'Información del Round' : 'Información del Ejercicio'}
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">{isRound ? 'Rounds:' : 'Series:'}</span>
                  <div className="font-semibold text-sm text-blue-600">
                    {isRound ? exercise?.cantidadRounds : exercise?.series || 'N/A'}
                  </div>
                </div>
                {!isRound && (
                  <div>
                    <span className="text-gray-600">Repeticiones:</span>
                    <div className="font-semibold text-sm text-blue-600">
                      {exercise?.repetitions || 'N/A'}
                    </div>
                  </div>
                )}
                {exercise?.rest && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Descanso:</span>
                    <div className="font-semibold text-sm text-green-600">
                      {exercise.rest}
                    </div>
                  </div>
                )}
                {exercise?.weight && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Peso:</span>
                    <div className="font-semibold text-sm text-purple-600">
                      {exercise.weight}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleCloseWithWarning}
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
