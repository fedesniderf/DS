import React, { useState, useEffect, useRef } from 'react';

const UserGuide = ({ 
  isVisible, 
  onComplete, 
  onSkip, 
  userRole,
  currentStep = 0 
}) => {
  const [step, setStep] = useState(currentStep);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const overlayRef = useRef(null);

  // Pasos de la guía para usuarios client
  const guideSteps = [
    {
      id: 'welcome',
      title: '¡Bienvenido a DS Training!',
      description: 'Te guiaremos paso a paso para que puedas aprovechar todas las funciones de la aplicación.',
      target: null,
      position: 'center',
      action: null
    },
    {
      id: 'routine-overview',
      title: 'Vista de Rutina',
      description: 'Aquí puedes ver todos los ejercicios de tu rutina organizados por días. Cada ejercicio muestra series, repeticiones, peso y tiempo.',
      target: '[data-guide="routine-exercises"]',
      position: 'bottom',
      action: null
    },
    {
      id: 'timer-button',
      title: 'Cronómetro del Ejercicio',
      description: 'Haz clic en este botón amarillo para abrir el cronómetro. Te permite registrar tiempos y pesos en tiempo real.',
      target: '[data-guide="timer-button"]',
      position: 'left',
      action: 'highlight-timer'
    },
    {
      id: 'timer-usage',
      title: 'Uso del Cronómetro',
      description: 'En el cronómetro puedes:\n• Ingresar el peso antes de cada serie\n• Cronometrar el tiempo de ejecución\n• Ver el progreso serie por serie\n• Minimizar para seguir viendo tu rutina',
      target: null,
      position: 'center',
      action: null
    },
    {
      id: 'weekly-tracking',
      title: 'Seguimiento Semanal',
      description: 'Usa este botón para registrar manualmente tu progreso semanal con pesos, tiempos y notas.',
      target: '[data-guide="weekly-tracking"]',
      position: 'left',
      action: 'highlight-weekly'
    },
    {
      id: 'pfpe-tracking',
      title: 'Registro PF/PE/Notas',
      description: 'Registra tu Peso Final (PF), Peso Estimado (PE) y notas diarias aquí. Es importante para el seguimiento.',
      target: '[data-guide="pfpe-button"]',
      position: 'left',
      action: 'highlight-pfpe'
    },
    {
      id: 'progress-stats',
      title: 'Estadísticas de Progreso',
      description: 'Estas métricas muestran tu evolución: Máximo (mayor peso usado), Promedio (peso promedio) y Tonelaje (peso total acumulado).',
      target: '[data-guide="progress-stats"]',
      position: 'top',
      action: 'highlight-stats'
    },
    {
      id: 'user-settings',
      title: 'Configuración de Usuario',
      description: 'Haz clic en tu foto de perfil para acceder a configuraciones: cambiar contraseña, editar perfil, actualizar foto.',
      target: '[data-guide="user-settings"]',
      position: 'bottom-left',
      action: 'highlight-settings'
    },
    {
      id: 'navigation',
      title: 'Navegación',
      description: 'Usa el menú superior para navegar entre rutinas, calendario y otras secciones de la aplicación.',
      target: '[data-guide="navigation"]',
      position: 'bottom',
      action: null
    },
    {
      id: 'completion',
      title: '¡Guía Completada!',
      description: 'Ya conoces las funciones principales. Puedes reactivar esta guía desde Configuración → Ayuda cuando necesites.',
      target: null,
      position: 'center',
      action: null
    }
  ];

  const currentStepData = guideSteps[step];

  // Función para resaltar elementos
  const highlightElement = (selector) => {
    if (!selector) return;
    
    const element = document.querySelector(selector);
    if (element) {
      setIsHighlighting(true);
      element.style.position = 'relative';
      element.style.zIndex = '999998';
      element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.3)';
      element.style.borderRadius = '8px';
      element.style.pointerEvents = 'auto';
      element.style.isolation = 'isolate';
      element.style.WebkitTransform = 'translate3d(0, 0, 0)';
      element.style.transform = 'translate3d(0, 0, 0)';
      
      // Scroll suave hacia el elemento
      setTimeout(() => {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }, 100);
    }
  };

  // Función para quitar resaltado
  const removeHighlight = () => {
    const highlightedElements = document.querySelectorAll('[style*="box-shadow"]');
    highlightedElements.forEach(el => {
      el.style.boxShadow = '';
      el.style.zIndex = '';
      el.style.pointerEvents = '';
      el.style.isolation = '';
      el.style.WebkitTransform = '';
      el.style.transform = '';
    });
    setIsHighlighting(false);
  };

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    removeHighlight();
    if (step < guideSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  // Función para retroceder
  const prevStep = () => {
    removeHighlight();
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Función para completar la guía
  const handleComplete = () => {
    removeHighlight();
    // Marcar la guía como completada en localStorage
    localStorage.setItem('ds-guide-completed', 'true');
    localStorage.setItem('ds-guide-version', '3.0.4');
    onComplete();
  };

  // Función para saltar la guía
  const handleSkip = () => {
    removeHighlight();
    localStorage.setItem('ds-guide-skipped', 'true');
    localStorage.setItem('ds-guide-version', '3.0.4');
    onSkip();
  };

  // Efecto para resaltar elementos cuando cambia el paso
  useEffect(() => {
    if (isVisible && currentStepData.target) {
      // Delay más largo para asegurar que la página esté lista
      const timer = setTimeout(() => {
        highlightElement(currentStepData.target);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (!isVisible) {
        removeHighlight();
      }
    };
  }, [step, isVisible, currentStepData.target]);

  // Efecto para limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      removeHighlight();
    };
  }, []);

  // Función para obtener la posición del tooltip
  const getTooltipPosition = () => {
    if (!currentStepData.target) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002
      };
    }

    const element = document.querySelector(currentStepData.target);
    if (!element) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002
      };
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 250; // Aumentado para mejor espacio

    let position = {};

    switch (currentStepData.position) {
      case 'top':
        position = {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        };
        break;
      case 'bottom':
        position = {
          top: rect.bottom + 20,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        };
        break;
      case 'left':
        position = {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.left - tooltipWidth - 20
        };
        break;
      case 'right':
        position = {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.right + 20
        };
        break;
      case 'bottom-left':
        position = {
          top: rect.bottom + 20,
          left: rect.left
        };
        break;
      default:
        position = {
          top: rect.bottom + 20,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        };
    }

    // Asegurar que el tooltip esté dentro de la ventana con mejor lógica
    const margin = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ajustar horizontalmente
    if (position.left < margin) {
      position.left = margin;
    } else if (position.left + tooltipWidth > viewportWidth - margin) {
      position.left = viewportWidth - tooltipWidth - margin;
    }
    
    // Ajustar verticalmente - si no cabe arriba, ponerlo abajo
    if (position.top < margin) {
      position.top = rect.bottom + 20;
    } else if (position.top + tooltipHeight > viewportHeight - margin) {
      position.top = rect.top - tooltipHeight - 20;
      if (position.top < margin) {
        position.top = margin;
      }
    }

    return {
      position: 'fixed',
      zIndex: 10002,
      ...position
    };
  };

  if (!isVisible || userRole !== 'client') {
    return null;
  }

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-60"
        style={{ 
          zIndex: 999999,
          pointerEvents: 'none',
          cursor: 'default'
        }}
      />
      
      {/* Tooltip de la guía */}
      <div 
        className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm min-h-[250px]"
        style={{
          ...tooltipStyle,
          zIndex: 1000000,
          pointerEvents: 'auto',
          userSelect: 'none',
          position: 'fixed',
          isolation: 'isolate',
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)'
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{currentStepData.title}</h3>
              <p className="text-xs text-gray-500">Paso {step + 1} de {guideSteps.length}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Saltar guía"
            style={{ pointerEvents: 'auto' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {currentStepData.description}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{Math.round(((step + 1) / guideSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / guideSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between gap-3">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                style={{ pointerEvents: 'auto' }}
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              Saltar
            </button>
          </div>
          
          <button
            onClick={nextStep}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            style={{ pointerEvents: 'auto' }}
          >
            {step === guideSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserGuide;
