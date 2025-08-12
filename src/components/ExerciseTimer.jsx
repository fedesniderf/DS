import React, { useState, useEffect, useRef } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

const ExerciseTimer = ({ 
  exercise, 
  onClose, 
  onSaveTime,
  routineExercises = [], // Lista de ejercicios del día actual
  currentExerciseIndex = 0, // Índice del ejercicio actual
  onNextExercise = null, // Callback para pasar al siguiente ejercicio
  currentDay = null // Día actual
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
  const [showSessionCompleteModal, setShowSessionCompleteModal] = useState(false); // Modal de sesión completada
  const [sessionTotalTime, setSessionTotalTime] = useState(0); // Tiempo total de la sesión
  const [waitingForNextExercise, setWaitingForNextExercise] = useState(false); // Esperando siguiente ejercicio
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false); // Modal de confirmación para finalizar
  
  // Estados para arrastrar la ventana minimizada
  const [position, setPosition] = useState(() => {
    // Posición inicial centrada y segura
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    return { 
      x: Math.max(50, (windowWidth - 220) / 2), // Centrado horizontalmente
      y: Math.max(50, windowHeight / 3) // En el tercio superior
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false); // Para detectar si realmente se está arrastrando
  const animationFrameRef = useRef(null); // Para suavizar el movimiento
  
  // Hook para bloquear scroll cuando el cronómetro está abierto (no minimizado)
  useScrollLock(!isMinimized);
  
  // Hook para bloquear scroll cuando el modal de confirmación está abierto
  useScrollLock(showFinishConfirmation);
  
  // Hook para bloquear scroll cuando el modal de cierre está abierto
  useScrollLock(showCloseWarning);
  
  // Hook para bloquear scroll cuando el modal de sesión completada está abierto
  useScrollLock(showSessionCompleteModal);
  
  // Debug: Monitorear estados que afectan el scroll lock
  useEffect(() => {
    console.log('📱 Estados de scroll lock:', {
      isMinimized,
      showFinishConfirmation,
      showCloseWarning,
      showSessionCompleteModal,
      shouldLockScroll: !isMinimized || showFinishConfirmation || showCloseWarning || showSessionCompleteModal
    });
  }, [isMinimized, showFinishConfirmation, showCloseWarning, showSessionCompleteModal]);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      console.log('🧹 ExerciseTimer se está desmontando - limpiando scroll locks');
      // Asegurarse de que cualquier interval quede limpio
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Estados específicos para rounds
  const [currentExerciseInRound, setCurrentExerciseInRound] = useState(0); // Ejercicio actual dentro del round
  const [roundExercisesTimes, setRoundExercisesTimes] = useState([]); // Tiempos de cada ejercicio en el round actual
  
  const intervalRef = useRef(null);

  // Detectar si es un round o ejercicio individual (mover antes del useEffect)
  const isRound = exercise?.isRound || false;
  const isDropset = !isRound && (!exercise?.series || parseInt(exercise?.series) === 0) && exercise?.dropset;
  const totalSeries = isRound ? 
    parseInt(exercise?.cantidadRounds) || 1 : 
    parseInt(exercise?.series) || parseInt(exercise?.dropset) || 1;

  // Resetear estados específicos de rounds cuando cambie el ejercicio
  useEffect(() => {
    // Resetear variables específicas del round cuando cambie el ejercicio
    setCurrentExerciseInRound(0);
    setRoundExercisesTimes([]);
    
    console.log('🔄 ExerciseTimer: Ejercicio cambiado a:', exercise?.name, 'isRound:', isRound);
  }, [exercise?.id, exercise?.name, isRound]); // Se ejecuta cuando cambia el ejercicio

  // Información específica para rounds
  const roundExercises = isRound ? exercise?.exercises || [] : [];
  const totalExercisesInRound = roundExercises.length;
  const currentRoundExercise = isRound && roundExercises[currentExerciseInRound] ? roundExercises[currentExerciseInRound] : null;

  // Información de la rutina del día
  const totalExercises = routineExercises.length;
  const hasNextExercise = currentExerciseIndex < totalExercises - 1;
  const nextExercise = hasNextExercise ? routineExercises[currentExerciseIndex + 1] : null;
  const isLastExerciseOfDay = currentExerciseIndex === totalExercises - 1;
  
  // Determinar si debe mostrar botón de descanso
  const shouldShowRestButton = () => {
    // Si no está corriendo, no mostrar
    if (!isRunning) return false;
    
    // Si ya completó todas las series, no mostrar
    if (currentSeries > totalSeries) return false;
    
    // Si está esperando el siguiente ejercicio, no mostrar
    if (waitingForNextExercise) return false;
    
    // Si está en modo descanso, SIEMPRE mostrar el botón (para poder continuar)
    if (isResting) return true;
    
    // Si es el último ejercicio del día Y estamos en la última serie Y NO está descansando, no mostrar descanso
    if (isLastExerciseOfDay && currentSeries === totalSeries && !isResting) return false;
    
    // Si no hay ejercicios siguientes Y estamos en la última serie Y NO está descansando, no mostrar descanso  
    if (!hasNextExercise && currentSeries === totalSeries && !isResting) return false;
    
    // En todos los demás casos, mostrar
    return true;
  };

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

    return () => {
      clearInterval(intervalRef.current);
      // Limpiar animationFrame si existe
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Restaurar scroll del body por si acaso
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isRunning, isPaused]);

  // UseEffect para manejar eventos de arrastre globales
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleDragMove(e);
      const handleGlobalMouseUp = (e) => handleDragEnd(e);
      const handleGlobalTouchMove = (e) => handleDragMove(e);
      const handleGlobalTouchEnd = (e) => handleDragEnd(e);

      // Agregar event listeners globales
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);

      // Cleanup
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, hasMoved]);

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
        })),
        isDropset: isDropset // Agregar información sobre si es dropset
      };
      
      // Minimizar el cronómetro y mostrar modal de datos
      setIsMinimized(true);
      onSaveTime(timerData);
      
      // Resetear para el siguiente ejercicio PERO mantener el cronómetro funcionando
      resetForNextExercise();
      
      // Verificar si es el último ejercicio del día
      if (isLastExerciseOfDay) {
        // Si es el último ejercicio del día, mostrar solo opción de finalizar sesión
        setWaitingForNextExercise(false); // No esperar siguiente ejercicio
        setIsResting(false); // No poner en descanso
        console.log('🏁 Último ejercicio del día completado. Solo queda finalizar sesión.');
      } else if (hasNextExercise) {
        // Si hay siguiente ejercicio, marcar que estamos esperando Y poner en estado de descanso
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
        setTotalTime(0); // Resetear tiempo total para el nuevo ejercicio
        
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
    setTotalTime(0); // RESETEAR totalTime para el nuevo ejercicio (NO debe acumular entre ejercicios)
    
    // Resetear estados específicos de rounds
    setCurrentExerciseInRound(0);
    setRoundExercisesTimes([]);
    
    // NO tocar setIsResting - se manejará por separado según el contexto
    // NO cambiar isRunning - debe seguir corriendo
  };

  // Finalizar sesión completa
  const handleFinishSession = () => {
    // Mostrar modal de confirmación
    setShowFinishConfirmation(true);
  };

  // Confirmar finalización de sesión
  const confirmFinishSession = () => {
    // Detener el cronómetro y calcular tiempo total
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
    
    // Guardar el tiempo total de la sesión para mostrarlo en el modal
    setSessionTotalTime(totalTime);
    
    // Ocultar modal de confirmación
    setShowFinishConfirmation(false);
    
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
        })),
        isDropset: isDropset // Agregar información sobre si es dropset
      };
      
      // Minimizar el cronómetro y mostrar modal de datos
      setIsMinimized(true);
      onSaveTime(timerData);
    }
    
    // Mostrar modal de sesión completada
    setShowSessionCompleteModal(true);
  };

  // Función helper para cerrar el cronómetro y restaurar scroll
  const closeTimerAndRestoreScroll = () => {
    console.log('🚪 Cerrando cronómetro y restaurando scroll');
    // Asegurar que todos los estados de modal estén en false
    setShowCloseWarning(false);
    setShowSessionCompleteModal(false);
    setShowFinishConfirmation(false);
    
    onClose();
  };

  // Cerrar modal de sesión completada
  const handleCloseSessionCompleteModal = () => {
    setShowSessionCompleteModal(false);
    closeTimerAndRestoreScroll(); // Cerrar completamente el cronómetro
  };

  // Manejar cierre con advertencia
  const handleCloseWithWarning = () => {
    if (isRunning || totalTime > 0) {
      setShowCloseWarning(true);
    } else {
      closeTimerAndRestoreScroll();
    }
  };

  // Confirmar cierre
  const confirmClose = () => {
    setShowCloseWarning(false);
    // Detener el cronómetro
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
    closeTimerAndRestoreScroll();
  };

  // Cancelar cierre
  const cancelClose = () => {
    setShowCloseWarning(false);
  };

  // Funciones para arrastrar la ventana minimizada
  const handleDragStart = (e) => {
    // No iniciar arrastre si el evento viene de un botón
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    
    // No iniciar arrastre si es un SVG (iconos de botones)
    if (e.target.tagName === 'svg' || e.target.tagName === 'path' || e.target.closest('svg')) {
      return;
    }
    
    setIsDragging(true);
    setHasMoved(false);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    
    // Prevenir scroll del body durante el arrastre
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    // Prevenir comportamientos por defecto
    e.preventDefault();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    // Prevenir scroll del documento
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    // Solo procesar si hay movimiento real (no mover si el dedo está quieto)
    if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) {
      return; // No hay movimiento suficiente, no actualizar posición
    }
    
    // Marcar que se ha movido si hay cualquier movimiento
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      setHasMoved(true);
    }
    
    // Aplicar factor de sensibilidad muy reducida (0.05 = 5% de la velocidad original)
    const sensitivity = 0.05;
    const adjustedDeltaX = deltaX * sensitivity;
    const adjustedDeltaY = deltaY * sensitivity;
    
    // Aplicar suavizado adicional para evitar movimientos bruscos
    const smoothingFactor = 0.7;
    const finalDeltaX = adjustedDeltaX * smoothingFactor;
    const finalDeltaY = adjustedDeltaY * smoothingFactor;
    
    // Actualizar posición directamente con límites solo cuando hay movimiento real
    setPosition(prev => {
      const newX = prev.x + finalDeltaX;
      const newY = prev.y + finalDeltaY;
      
      // Aplicar límites inmediatamente para evitar salirse de pantalla
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Dimensiones aproximadas de la ventana minimizada
      const windowSizeX = 220; // Ancho de la ventana minimizada
      const windowSizeY = 120; // Alto de la ventana minimizada
      
      // Mantener siempre al menos 40px visibles en cada borde
      const margin = 40;
      const constrainedX = Math.max(-(windowSizeX - margin), Math.min(windowWidth - margin, newX));
      const constrainedY = Math.max(margin, Math.min(windowHeight - margin, newY));
      
      return {
        x: constrainedX,
        y: constrainedY
      };
    });
    
    // Solo actualizar dragStart cuando hay movimiento real
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setHasMoved(false);
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    // Limpiar animationFrame pendiente
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Aplicar ajuste suave a los límites si es necesario
    const constrained = getConstrainedPosition();
    if (constrained.x !== position.x || constrained.y !== position.y) {
      setPosition(constrained);
    }
    
    e.preventDefault();
  };

  // Limitar la posición para mantener la ventana visible
  const getConstrainedPosition = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Dimensiones aproximadas de la ventana minimizada
    const windowSizeX = 220; // Ancho de la ventana minimizada
    const windowSizeY = 120; // Alto de la ventana minimizada
    
    // Mantener siempre al menos 40px visibles en cada borde
    const margin = 40;
    const maxX = windowWidth - margin; // Borde derecho
    const minX = -(windowSizeX - margin); // Borde izquierdo (mantener 40px visibles)
    const maxY = windowHeight - margin; // Borde inferior  
    const minY = margin; // Borde superior
    
    return {
      x: Math.max(minX, Math.min(maxX, position.x)),
      y: Math.max(minY, Math.min(maxY, position.y))
    };
  };

  // Reposicionar ventana si cambia el tamaño de pantalla (orientación móvil)
  useEffect(() => {
    const handleResize = () => {
      setPosition(prevPosition => {
        const constrained = getConstrainedPosition();
        // Solo actualizar si la posición actual está fuera de los límites
        if (prevPosition.x < constrained.x || prevPosition.x > constrained.x ||
            prevPosition.y < constrained.y || prevPosition.y > constrained.y) {
          return constrained;
        }
        return prevPosition;
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Asegurar posición válida cuando se minimiza la ventana
  useEffect(() => {
    if (isMinimized) {
      // Forzar reposicionamiento cuando se minimiza
      setPosition(prevPosition => {
        const constrained = getConstrainedPosition();
        // Si la posición actual es válida, mantenerla; si no, usar la restringida
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const margin = 40;
        const isValidX = prevPosition.x >= -(220 - margin) && prevPosition.x <= (windowWidth - margin);
        const isValidY = prevPosition.y >= margin && prevPosition.y <= (windowHeight - margin);
        
        if (isValidX && isValidY) {
          return prevPosition;
        } else {
          // Si no es válida, usar una posición centrada segura
          const newPos = {
            x: Math.max(50, (windowWidth - 220) / 2),
            y: Math.max(50, windowHeight / 3)
          };
          return newPos;
        }
      });
    }
  }, [isMinimized]);

  // Limpiar intervalo al desmontar componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Bloquear recarga/cierre de página cuando el cronómetro está activo
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Si el cronómetro está corriendo o hay tiempo transcurrido, mostrar advertencia
      if (isRunning || totalTime > 0) {
        event.preventDefault();
        // Mensaje estándar de advertencia del navegador
        event.returnValue = 'El cronómetro está activo. Si sales ahora, perderás el progreso actual. ¿Estás seguro?';
        return event.returnValue;
      }
    };

    // Agregar el event listener para beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup al desmontar o cuando el cronómetro se termine
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, totalTime]); // Dependencias: cuando cambie el estado del cronómetro

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

      {/* Modal de sesión completada */}
      {showSessionCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="text-center">
              {/* Icono de éxito */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Título */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">🎉 ¡Sesión Completada!</h3>
              
              {/* Tiempo total */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Tiempo total de la rutina:</p>
                <div className="text-3xl font-mono font-bold text-green-600 mb-2">
                  {formatTime(sessionTotalTime)}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {Math.floor(sessionTotalTime / 60)} minutos y {sessionTotalTime % 60} segundos
                </p>
              </div>
              
              {/* Mensaje de felicitación */}
              <div className="mb-6">
                <p className="text-base text-gray-700 mb-2 font-medium">
                  ¡Excelente trabajo! Has completado tu rutina de entrenamiento.
                </p>
                <p className="text-sm text-gray-500">
                  Todos los datos han sido guardados automáticamente.
                </p>
              </div>
              
              {/* Botón para cerrar */}
              <button
                onClick={handleCloseSessionCompleteModal}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isMinimized ? (
        // Versión minimizada - flotante en la esquina (arrastrable)
        <div 
          className="fixed z-50"
          style={{
            left: `${Math.max(20, Math.min(window.innerWidth - 240, position.x))}px`,
            top: `${Math.max(20, Math.min(window.innerHeight - 140, position.y))}px`,
            transition: isDragging ? 'none' : 'all 0.2s ease-out',
            touchAction: 'none' // Prevenir gestos del navegador
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px] select-none">
            {/* Header arrastrable */}
            <div 
              className="flex items-center justify-between mb-2 cursor-move bg-gray-50 rounded px-2 py-1 hover:bg-gray-100 transition-colors"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              style={{ touchAction: 'none' }} // Prevenir scroll en el área de arrastre
            >
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs">⋮⋮</span>
                <h4 className="text-sm font-semibold text-gray-800">Cronómetro</h4>
                {/* Indicador de protección en miniatura */}
                {(isRunning || totalTime > 0) && (
                  <div 
                    className="bg-orange-100 text-orange-700 px-1 py-0.5 rounded text-xs flex items-center"
                    title="Página protegida contra recargas"
                  >
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
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
            <div className="text-sm text-gray-600 mb-2">
              {/* Progreso de la rutina */}
              {totalExercises > 1 && (
                <div className="text-blue-600 font-semibold mb-1">
                  {currentDay && `Día ${currentDay} - `}Ejercicio {currentExerciseIndex + 1} de {totalExercises}
                </div>
              )}
              
              {isRound ? 
                `${exercise?.name} (${exercise?.exercises?.length || 0} ejercicios)` : 
                exercise?.name
              }
              
              {currentSeries > totalSeries && !waitingForNextExercise && isLastExerciseOfDay && (
                <span className="text-orange-600 font-semibold"> - 🏁 Último ejercicio del día</span>
              )}
              
              {currentSeries > totalSeries && !waitingForNextExercise && !isLastExerciseOfDay && (
                <span className="text-green-600 font-semibold"> - ✅ Completado</span>
              )}
              
              {waitingForNextExercise && hasNextExercise && (
                <span className="text-blue-600 font-semibold"> - 🔄 Siguiente: {nextExercise?.name}</span>
              )}
            </div>
            
            {/* Tiempo actual y serie */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-2xl font-bold font-mono ${
                isRunning && !isPaused ? 
                  (isResting ? 'text-blue-600' : 'text-red-600') : 
                  'text-gray-600'
              }`}>{formatTime(time)}</span>
              <span className="text-sm text-gray-600 font-medium">
                {currentSeries > totalSeries ? 
                  '✅ Listo para siguiente' :
                  (isRound ? `Round ${currentSeries}/${totalSeries}` : 
                   isDropset ? `Dropset ${currentSeries}/${totalSeries}` : 
                   `Serie ${currentSeries}/${totalSeries}`)
                }
              </span>
            </div>
            
            {/* Estado actual */}
            <div className="text-sm text-center mb-2 font-medium">
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
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  !isRunning 
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : isPaused 
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {!isRunning ? '▶️ Iniciar' : isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
              </button>
              
              {/* Botón 2: Descanso/Continuar - Solo si debe mostrar el botón de descanso */}
              {shouldShowRestButton() && (
                <button
                  onClick={handleRestContinue}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isResting 
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={!isResting && time === 0}
                >
                  {isResting ? '▶️ Continuar' : '💤 Descanso'}
                </button>
              )}

              {/* Botón especial: Siguiente ejercicio (solo cuando está esperando y no es el último ejercicio del día) */}
              {waitingForNextExercise && hasNextExercise && !isLastExerciseOfDay && (
                <button
                  onClick={prepareForNextExercise}
                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  ⏭️ Siguiente
                </button>
              )}
              
              {/* Botón 3: Finalizar sesión */}
              <button
                onClick={handleFinishSession}
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
              >
                🏁 Finalizar
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Versión completa
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm h-[85vh] md:h-auto md:max-h-[80vh] flex flex-col">
            {/* Header fijo */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-800">Cronómetro</h3>
                  {/* Indicador de protección activa */}
                  {(isRunning || totalTime > 0) && (
                    <div 
                      className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-medium"
                      title="La página está protegida contra recargas accidentales mientras el cronómetro está activo"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Protegido</span>
                    </div>
                  )}
                </div>
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
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {/* Progreso de la rutina */}
                {totalExercises > 1 && (
                  <span className="text-blue-600 font-semibold">
                    {currentDay && `Día ${currentDay} - `}Ejercicio {currentExerciseIndex + 1} de {totalExercises} • 
                  </span>
                )}
                {isRound ? 
                  ` ${exercise?.name} (${exercise?.exercises?.length || 0} ejercicios)` : 
                  ` ${exercise?.name}`
                }
                {waitingForNextExercise && hasNextExercise && (
                  <span className="text-blue-600 font-semibold"> • Siguiente: {nextExercise?.name}</span>
                )}
                {isLastExerciseOfDay && currentSeries > totalSeries && (
                  <span className="text-orange-600 font-semibold"> • 🏁 Último ejercicio del día</span>
                )}
              </p>
              
              {/* Mostrar ejercicios del round */}
              {isRound && exercise?.exercises && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">
                    Ejercicios en este round (todos juntos):
                  </h4>
                  <div className="space-y-1">
                    {exercise.exercises.map((ex, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
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
          <div 
            id="cronometer-content"
            className="flex-1 overflow-y-auto overscroll-contain p-4 touch-pan-y cronometer-scroll min-h-0" 
            style={{
              WebkitOverflowScrolling: 'touch'
            }}>
            {/* Estado actual */}
            <div className="text-center mb-3">
              <div className="text-lg font-semibold text-gray-700 mb-2">
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
                        isDropset ? 
                          `Descanso - Dropset ${currentSeries}` :
                          `Descanso - Serie ${currentSeries}`
                    }
                  </span>
                ) : (
                  <span className="text-blue-600">
                    {isRound ? `Round ${currentSeries} de ${totalSeries}` : 
                     isDropset ? `Dropset ${currentSeries} de ${totalSeries}` : 
                     `Serie ${currentSeries} de ${totalSeries}`}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Tiempo total: {formatTime(totalTime)}
              </div>
            </div>

            {/* Cronómetro principal */}
            <div className="text-center mb-4">
              <div className="bg-gray-100 rounded-xl p-4 mb-3">
                <div className={`text-8xl font-mono font-bold mb-2 ${
                  isRunning && !isPaused ? 
                    (isResting ? 'text-blue-600' : 'text-red-600') : 
                    'text-gray-800'
                }`}>
                  {formatTime(time)}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {isRunning ? (isPaused ? 'En pausa' : (isResting ? 'Descansando' : 'Ejecutando')) : 'Detenido'}
                </div>
              </div>

              {/* Campo de peso para la serie actual - Solo para ejercicios individuales */}
              {!isRound && (!isRunning || (isRunning && isResting)) && currentSeries <= totalSeries && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso {isDropset ? `Dropset ${currentSeries}` : `Serie ${currentSeries}`} (kg)
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
                      {isLastExerciseOfDay ? '🏁' : waitingForNextExercise && hasNextExercise ? '🔄' : '🎉'}
                    </span>
                    <p className="text-sm font-medium text-green-700 mt-1">
                      {isLastExerciseOfDay ? 
                        '¡Último ejercicio del día completado!' :
                        waitingForNextExercise && hasNextExercise ? 
                        '¡Listo para el siguiente ejercicio!' : 
                        '¡Ejercicio completado!'
                      }
                    </p>
                    <p className="text-sm text-green-600 mt-1 font-medium">
                      {isLastExerciseOfDay ?
                        'Has completado todos los ejercicios del día. Guarda los datos y finaliza la sesión.' :
                        waitingForNextExercise && hasNextExercise ? 
                        `El cronómetro sigue funcionando. Guarda los datos y haz clic en "Siguiente" para continuar con: ${nextExercise?.name}` :
                        'El cronómetro sigue funcionando. Completa los datos y continúa con el siguiente ejercicio.'
                      }
                    </p>
                    
                    {/* Botón para siguiente ejercicio - No mostrar si es el último ejercicio del día */}
                    {waitingForNextExercise && hasNextExercise && !isLastExerciseOfDay && (
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

                {/* Botón 2: Descanso/Continuar - Solo si debe mostrar el botón de descanso */}
                {shouldShowRestButton() && (
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
                  Finalizar
                </button>
              </div>
            </div>

            {/* Información del ejercicio */}
            <div className="bg-blue-50 rounded-md p-3 mb-3">
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                {isRound ? 'Información del Round' : 'Información del Ejercicio'}
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">{isRound ? 'Rounds:' : 'Series:'}</span>
                  <div className="font-semibold text-lg text-blue-600">
                    {isRound ? exercise?.cantidadRounds : exercise?.series || 'N/A'}
                  </div>
                </div>
                {!isRound && (
                  <div>
                    <span className="text-gray-600">Repeticiones:</span>
                    <div className="font-semibold text-lg text-blue-600">
                      {exercise?.repetitions || 'N/A'}
                    </div>
                  </div>
                )}
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

            {/* Historial de series */}
            {seriesTimes.length > 0 && (
              <div className="bg-green-50 rounded-md p-3">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  {isRound ? 'Rounds Completados' : 'Series Completadas'}
                </h4>
                <div className="space-y-1">
                  {seriesTimes.map((serieTime, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">
                        {isRound ? `Round ${index + 1}:` : 
                         isDropset ? `Dropset ${index + 1}:` : 
                         `Serie ${index + 1}:`}
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
            
            {/* Espaciado adicional para móvil */}
            <div className="h-4"></div>
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

      {/* Modal de confirmación para finalizar sesión */}
      {showFinishConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¿Finalizar sesión?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Esta acción detendrá el cronómetro y finalizará la sesión de entrenamiento. 
                  ¿Estás seguro de que quieres continuar?
                </p>
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>Tiempo total actual:</strong> {formatTime(totalTime + (time && !isResting ? time : 0))}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowFinishConfirmation(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmFinishSession}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Sí, finalizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExerciseTimer;
