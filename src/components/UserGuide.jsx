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

  // Añadir estilos CSS específicos para móvil cuando el componente se monta
  useEffect(() => {
    if (isVisible) {
      // Crear y añadir estilos CSS específicos para la guía
      const style = document.createElement('style');
      style.id = 'user-guide-mobile-styles';
      style.textContent = `
        @media (max-width: 768px) {
          .user-guide-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483646 !important;
            background: rgba(0, 0, 0, 0.8) !important;
            pointer-events: none !important;
          }
          
          .user-guide-tooltip {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            -webkit-transform: translate(-50%, -50%) translate3d(0, 0, 0) !important;
            z-index: 2147483647 !important;
            width: 90vw !important;
            max-width: 90vw !important;
            max-height: 80vh !important;
            pointer-events: auto !important;
            isolation: isolate !important;
          }
          
          .user-guide-tooltip * {
            pointer-events: auto !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('user-guide-mobile-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isVisible]);

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
    
    // Limpiar resaltados anteriores
    removeHighlight();
    
    const element = document.querySelector(selector);
    if (element) {
      console.log(`Resaltando elemento: ${selector}`, element);
      setIsHighlighting(true);
      
      // Aplicar estilos de resaltado con z-index más alto para móvil
      element.style.position = 'relative';
      element.style.zIndex = window.innerWidth <= 768 ? '2147483645' : '999998'; // Máximo z-index para móvil
      element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 8px rgba(59, 130, 246, 0.4)';
      element.style.borderRadius = '8px';
      element.style.pointerEvents = 'auto';
      element.style.isolation = 'isolate';
      element.style.WebkitTransform = 'translate3d(0, 0, 0)';
      element.style.transform = 'translate3d(0, 0, 0)';
      
      // Marcar el elemento para identificarlo después
      element.setAttribute('data-guide-highlighted', 'true');
      
      // Scroll suave hacia el elemento con mejor configuración para móvil
      setTimeout(() => {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Segundo scroll para asegurar que esté en vista (especialmente importante en móvil)
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
          );
          
          if (!isInViewport) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
          }
        }, 500); // Más tiempo para móvil
      }, window.innerWidth <= 768 ? 500 : 200); // Más delay en móvil
    } else {
      console.warn(`Elemento no encontrado para el selector: ${selector}`);
      // Intentar con selectores alternativos comunes
      const alternativeSelectors = [
        selector.replace('[data-guide="', '[data-guide*="'),
        selector.replace('"', ''),
        `*${selector}*`
      ];
      
      for (const altSelector of alternativeSelectors) {
        const altElement = document.querySelector(altSelector);
        if (altElement) {
          console.log(`Elemento encontrado con selector alternativo: ${altSelector}`, altElement);
          highlightElement(altSelector);
          break;
        }
      }
    }
  };

  // Función para quitar resaltado
  const removeHighlight = () => {
    // Buscar elementos por el atributo personalizado que agregamos
    const highlightedElements = document.querySelectorAll('[data-guide-highlighted="true"]');
    highlightedElements.forEach(el => {
      el.style.boxShadow = '';
      el.style.zIndex = '';
      el.style.pointerEvents = '';
      el.style.isolation = '';
      el.style.WebkitTransform = '';
      el.style.transform = '';
      el.removeAttribute('data-guide-highlighted');
    });
    
    // Método de respaldo por si acaso
    const elementsWithBoxShadow = document.querySelectorAll('[style*="box-shadow"]');
    elementsWithBoxShadow.forEach(el => {
      if (el.style.boxShadow.includes('rgba(59, 130, 246')) {
        el.style.boxShadow = '';
        el.style.zIndex = '';
        el.style.pointerEvents = '';
        el.style.isolation = '';
        el.style.WebkitTransform = '';
        el.style.transform = '';
      }
    });
    
    setIsHighlighting(false);
  };

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    removeHighlight();
    
    if (step < guideSteps.length - 1) {
      // Pequeño delay para limpiar el estado anterior antes de avanzar
      setTimeout(() => {
        setStep(step + 1);
      }, 100);
    } else {
      handleComplete();
    }
  };

  // Función para retroceder
  const prevStep = () => {
    removeHighlight();
    
    if (step > 0) {
      // Pequeño delay para limpiar el estado anterior antes de retroceder
      setTimeout(() => {
        setStep(step - 1);
      }, 100);
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

  // Efecto para bloquear scroll de fondo en móvil cuando la guía está visible
  useEffect(() => {
    if (isVisible && window.innerWidth <= 768) {
      // Bloquear scroll del body
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restaurar scroll
        document.body.style.overflow = originalStyle;
        document.body.style.position = originalPosition;
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restaurar posición de scroll
        const scrollY = document.body.style.top;
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isVisible]);

  // Efecto para resaltar elementos cuando cambia el paso
  useEffect(() => {
    if (isVisible && currentStepData.target) {
      // Delay más largo para asegurar que la página esté lista
      const timer = setTimeout(() => {
        highlightElement(currentStepData.target);
      }, 800); // Aumentado de 500 a 800ms
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (!isVisible) {
        removeHighlight();
      }
    };
  }, [step, isVisible, currentStepData.target]);

  // Efecto adicional para manejar cambios de paso y reposicionamiento
  useEffect(() => {
    if (isVisible) {
      // Pequeño delay para reposicionar el tooltip después de cambios
      const repositionTimer = setTimeout(() => {
        // Forzar un re-render del tooltip si hay un elemento target
        if (currentStepData.target) {
          const element = document.querySelector(currentStepData.target);
          if (element) {
            // Verificar si el elemento está en vista y reposicionar si es necesario
            const rect = element.getBoundingClientRect();
            const isInViewport = (
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
            
            if (!isInViewport) {
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'center'
              });
            }
          }
        }
      }, 100);
      
      return () => clearTimeout(repositionTimer);
    }
  }, [step, isVisible, currentStepData]);

  // Efecto para limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      removeHighlight();
    };
  }, []);

  // Función para obtener la posición del tooltip
  const getTooltipPosition = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (!currentStepData.target || isMobile) {
      // En móvil, siempre centrar el tooltip
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000000
      };
    }

    const element = document.querySelector(currentStepData.target);
    if (!element) {
      console.warn(`Elemento no encontrado para selector: ${currentStepData.target}`);
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000000
      };
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 280;

    let position = {};
    let transformOrigin = 'center';

    switch (currentStepData.position) {
      case 'top':
        position = {
          top: rect.top - tooltipHeight - 15,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        };
        transformOrigin = 'bottom center';
        break;
      case 'bottom':
        position = {
          top: rect.bottom + 15,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        };
        transformOrigin = 'top center';
        break;
      case 'left':
        position = {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.left - tooltipWidth - 15
        };
        transformOrigin = 'right center';
        break;
      case 'right':
        position = {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.right + 15
        };
        transformOrigin = 'left center';
        break;
      case 'bottom-left':
        position = {
          top: rect.bottom + 15,
          left: rect.left
        };
        transformOrigin = 'top left';
        break;
      default:
        position = {
          top: rect.bottom + 15,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        };
        transformOrigin = 'top center';
    }

    // En desktop, ajustar para mantener en pantalla
    const margin = 15;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ajustar horizontalmente
    if (position.left < margin) {
      position.left = margin;
    } else if (position.left + tooltipWidth > viewportWidth - margin) {
      position.left = viewportWidth - tooltipWidth - margin;
    }
    
    // Ajustar verticalmente
    if (position.top < margin) {
      position.top = rect.bottom + 15;
      transformOrigin = 'top center';
    } else if (position.top + tooltipHeight > viewportHeight - margin) {
      position.top = rect.top - tooltipHeight - 15;
      transformOrigin = 'bottom center';
      
      if (position.top < margin) {
        position.top = Math.max(margin, (viewportHeight - tooltipHeight) / 2);
        transformOrigin = 'center';
      }
    }

    return {
      position: 'fixed',
      zIndex: 1000000,
      transformOrigin,
      ...position
    };
  };

  if (!isVisible || userRole !== 'client') {
    return null;
  }

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Overlay oscuro con mejor z-index para móvil */}
      <div 
        ref={overlayRef}
        className={`fixed inset-0 bg-black bg-opacity-70 ${window.innerWidth <= 768 ? 'user-guide-overlay' : ''}`}
        style={{ 
          zIndex: 2147483646,
          pointerEvents: 'none',
          cursor: 'default',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          isolation: 'isolate',
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)'
        }}
      />
      
      {/* Tooltip de la guía */}
      <div 
        className={`fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-4 ${window.innerWidth <= 768 ? 'user-guide-tooltip' : ''}`}
        style={{
          ...(window.innerWidth <= 768 ? {} : tooltipStyle),
          zIndex: 2147483647,
          pointerEvents: 'auto',
          userSelect: 'none',
          position: 'fixed',
          isolation: 'isolate',
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)',
          width: window.innerWidth <= 768 ? '90vw' : '320px',
          maxWidth: window.innerWidth <= 768 ? '90vw' : '320px',
          maxHeight: window.innerWidth <= 768 ? '80vh' : '90vh',
          overflow: 'auto',
          // Forzar posición central en móvil
          ...(window.innerWidth <= 768 && {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            WebkitTransform: 'translate(-50%, -50%) translate3d(0, 0, 0)'
          })
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{currentStepData.title}</h3>
              <p className="text-xs text-gray-500">Paso {step + 1} de {guideSteps.length}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Saltar guía"
            style={{ pointerEvents: 'auto' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {currentStepData.description}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-3">
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
        <div className="flex justify-between gap-2">
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
