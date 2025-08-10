import React, { useState, useEffect, useRef } from 'react';

const ExerciseTimer = ({ exercise, onClose, onSaveTime }) => {
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
  const intervalRef = useRef(null);

  const totalSeries = parseInt(exercise?.series) || 1;

  // Formatear tiempo en MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Efecto para manejar el cronómetro
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
  const handleStart = () => {
    // Guardar peso de la serie actual antes de iniciar
    if (currentWeight) {
      const newSeriesWeights = [...seriesWeights];
      newSeriesWeights[currentSeries - 1] = currentWeight;
      setSeriesWeights(newSeriesWeights);
    }
    
    setIsRunning(true);
    setIsPaused(false);
  };

  // Pausar cronómetro
  const handlePause = () => {
    setIsPaused(true);
  };

  // Reanudar cronómetro
  const handleResume = () => {
    setIsPaused(false);
  };

  // Pasar a la siguiente serie (botón "Vuelta")
  const handleNextSeries = () => {
    // Guardar tiempo de la serie actual
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
    // Guardar peso de la serie actual antes de iniciar
    if (currentWeight) {
      const newSeriesWeights = [...seriesWeights];
      newSeriesWeights[currentSeries - 1] = currentWeight;
      setSeriesWeights(newSeriesWeights);
    }
    
    setIsResting(false);
    setTime(0); // Resetear tiempo para la nueva serie
  };

  // Parar y resetear cronómetro
  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Si había una serie en progreso, agregarla
    let finalSeriesTimes = [...seriesTimes];
    let finalSeriesWeights = [...seriesWeights];
    if (time > 0 && !isResting) {
      finalSeriesTimes = [...seriesTimes, time];
      finalSeriesWeights = [...seriesWeights, currentWeight || ''];
      setSeriesTimes(finalSeriesTimes);
      setSeriesWeights(finalSeriesWeights);
    }
    
    // Automáticamente enviar datos al modal de seguimiento semanal si hay tiempo registrado
    if (totalTime > 0 && onSaveTime) {
      const timerData = {
        totalTime: totalTime,
        seriesTimes: finalSeriesTimes,
        seriesWeights: finalSeriesWeights, // Incluir pesos por serie
        formattedTotalTime: formatTime(totalTime),
        formattedSeriesTimes: finalSeriesTimes.map((serieTime, index) => ({
          serie: index + 1,
          time: formatTime(serieTime)
        }))
      };
      onSaveTime(timerData);
      onClose();
    }
  };

  // Resetear todo
  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    setCurrentSeries(1);
    setSeriesTimes([]);
    setSeriesWeights([]); // Limpiar pesos también
    setCurrentWeight(''); // Limpiar peso actual
    setTotalTime(0);
    setIsResting(false);
    clearInterval(intervalRef.current);
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
                  onClick={onClose}
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
            <div className="text-xs text-gray-600 mb-2">{exercise?.name}</div>
            
            {/* Tiempo actual y serie */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-lg font-bold ${
                isRunning && !isPaused ? 
                  (isResting ? 'text-blue-600' : 'text-red-600') : 
                  'text-gray-600'
              }`}>{formatTime(time)}</span>
              <span className="text-xs text-gray-500">Serie {currentSeries}/{totalSeries}</span>
            </div>
            
            {/* Estado actual */}
            <div className="text-xs text-center mb-2">
              {isResting ? (
                <span className="text-orange-600">⏸️ Descansando</span>
              ) : isRunning ? (
                <span className="text-green-600">▶️ Corriendo</span>
              ) : isPaused ? (
                <span className="text-yellow-600">⏸️ Pausado</span>
              ) : (
                <span className="text-gray-600">⏹️ Detenido</span>
              )}
            </div>
            
            {/* Controles básicos */}
            <div className="flex gap-1 justify-center">
              {!isRunning ? (
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
                  {!isResting && (
                    <button
                      onClick={handleNextSeries}
                      className="flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
                    >
                      ↻
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Cronómetro</h3>
                <div className="flex gap-2">
                  {/* Botón minimizar */}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Minimizar"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  {/* Botón cerrar */}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Cerrar"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{exercise?.name}</p>
            </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Estado actual */}
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-gray-600 mb-2">
                {isResting ? (
                  <span className="text-orange-600">Descanso - Serie {currentSeries}</span>
                ) : (
                  <span className="text-blue-600">Serie {currentSeries} de {totalSeries}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Tiempo total: {formatTime(totalTime)}
              </div>
            </div>

            {/* Cronómetro principal */}
            <div className="text-center mb-8">
              <div className="bg-gray-100 rounded-2xl p-8 mb-6">
                <div className={`text-6xl font-mono font-bold mb-2 ${
                  isRunning && !isPaused ? 
                    (isResting ? 'text-blue-600' : 'text-red-600') : 
                    'text-gray-800'
                }`}>
                  {formatTime(time)}
                </div>
                <div className="text-sm text-gray-500">
                  {isRunning ? (isPaused ? 'En pausa' : (isResting ? 'Descansando' : 'Ejecutando')) : 'Detenido'}
                </div>
              </div>

              {/* Campo de peso para la serie actual - Disponible cuando no está ejecutando */}
              {(!isRunning || (isRunning && isResting)) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Serie {currentSeries} (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-32 mx-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="Ej: 80"
                  />
                </div>
              )}

              {/* Botones de control */}
              <div className="flex justify-center gap-2 flex-wrap">
                {!isRunning ? (
                  <>
                    <button
                      onClick={handleStart}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Iniciar
                    </button>
                    {(totalTime > 0 || seriesTimes.length > 0) && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Reanudar
                    </button>
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
                      </svg>
                      Parar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                      Pausar
                    </button>
                    
                    {/* Botón Vuelta */}
                    {!isResting && time > 0 && (
                      <button
                        onClick={handleNextSeries}
                        className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {currentSeries < totalSeries ? 'Vuelta' : 'Finalizar'}
                      </button>
                    )}

                    {/* Botón para finalizar descanso */}
                    {isResting && (
                      <button
                        onClick={handleEndRest}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Empezar Serie
                      </button>
                    )}
                    
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
                      </svg>
                      Parar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Historial de series */}
            {seriesTimes.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Series Completadas</h4>
                <div className="space-y-2">
                  {seriesTimes.map((serieTime, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Serie {index + 1}:</span>
                      <div className="flex gap-4">
                        <span className="font-semibold text-green-600">{formatTime(serieTime)}</span>
                        {seriesWeights[index] && (
                          <span className="font-semibold text-blue-600">{seriesWeights[index]} kg</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información del ejercicio */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Información del Ejercicio</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Series:</span>
                  <div className="font-semibold text-lg text-blue-600">
                    {exercise?.series || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Repeticiones:</span>
                  <div className="font-semibold text-lg text-blue-600">
                    {exercise?.repetitions || 'N/A'}
                  </div>
                </div>
                {exercise?.rest && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Descanso:</span>
                    <div className="font-semibold text-lg text-green-600">
                      {exercise.rest}
                    </div>
                  </div>
                )}
                {exercise?.weight && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Peso:</span>
                    <div className="font-semibold text-lg text-purple-600">
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
              onClick={onClose}
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
