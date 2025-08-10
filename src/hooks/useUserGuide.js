import { useState, useEffect } from 'react';
import { 
  USER_GUIDE_CONFIG, 
  shouldShowGuide, 
  getTimeouts,
  markGuideAsCompleted,
  markGuideAsSkipped,
  resetGuideState
} from '../config/userGuideConfig';

export const useUserGuide = (user) => {
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Verificar si debe mostrarse la guía
  useEffect(() => {
    // Si la guía está deshabilitada globalmente, no hacer nada
    if (!USER_GUIDE_CONFIG.ENABLED) {
      setShowGuide(false);
      return;
    }

    if (!user || user.role !== 'client') {
      return;
    }

    // Esperar un poco para que la página se cargue completamente
    const timer = setTimeout(() => {
      if (shouldShowGuide(user)) {
        setShowGuide(true);
      }
    }, getTimeouts().INITIAL_DELAY);

    return () => clearTimeout(timer);
  }, [user]);

  const handleGuideComplete = () => {
    setShowGuide(false);
    setCurrentStep(0);
    markGuideAsCompleted();
  };

  const handleGuideSkip = () => {
    setShowGuide(false);
    setCurrentStep(0);
    markGuideAsSkipped();
  };

  const startGuideManually = () => {
    // Solo permitir inicio manual si la guía está habilitada
    if (!USER_GUIDE_CONFIG.ENABLED) {
      console.warn('La guía de usuario está deshabilitada en la configuración');
      return;
    }
    
    setCurrentStep(0);
    setShowGuide(true);
  };

  const restartGuide = () => {
    // Solo permitir reinicio si la guía está habilitada
    if (!USER_GUIDE_CONFIG.ENABLED) {
      console.warn('La guía de usuario está deshabilitada en la configuración');
      return;
    }
    
    resetGuideState();
    setCurrentStep(0);
    setShowGuide(true);
  };

  return {
    showGuide: USER_GUIDE_CONFIG.ENABLED ? showGuide : false, // Forzar false si está deshabilitada
    currentStep,
    handleGuideComplete,
    handleGuideSkip,
    startGuideManually,
    restartGuide,
    isEnabled: USER_GUIDE_CONFIG.ENABLED // Exponer el estado de habilitación
  };
};
