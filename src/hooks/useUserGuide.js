import { useState, useEffect } from 'react';

export const useUserGuide = (user) => {
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Verificar si debe mostrarse la guía
  useEffect(() => {
    if (!user || user.role !== 'client') {
      return;
    }

    const checkShouldShowGuide = () => {
      const guideCompleted = localStorage.getItem('ds-guide-completed');
      const guideSkipped = localStorage.getItem('ds-guide-skipped');
      const guideVersion = localStorage.getItem('ds-guide-version');
      const currentVersion = '3.0.4';

      // Mostrar guía si:
      // 1. Es un usuario nuevo (nunca completó ni saltó la guía)
      // 2. Hay una nueva versión con funcionalidades nuevas
      // 3. El usuario solicita ver la guía manualmente

      if (!guideCompleted && !guideSkipped) {
        // Usuario nuevo
        return true;
      }

      if (guideVersion !== currentVersion) {
        // Nueva versión - resetear estados para mostrar nuevas funciones
        localStorage.removeItem('ds-guide-completed');
        localStorage.removeItem('ds-guide-skipped');
        return true;
      }

      return false;
    };

    // Esperar un poco para que la página se cargue completamente
    const timer = setTimeout(() => {
      if (checkShouldShowGuide()) {
        setShowGuide(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleGuideComplete = () => {
    setShowGuide(false);
    setCurrentStep(0);
    // El localStorage se actualiza en el componente UserGuide
  };

  const handleGuideSkip = () => {
    setShowGuide(false);
    setCurrentStep(0);
    // El localStorage se actualiza en el componente UserGuide
  };

  const startGuideManually = () => {
    setCurrentStep(0);
    setShowGuide(true);
  };

  const restartGuide = () => {
    localStorage.removeItem('ds-guide-completed');
    localStorage.removeItem('ds-guide-skipped');
    setCurrentStep(0);
    setShowGuide(true);
  };

  return {
    showGuide,
    currentStep,
    handleGuideComplete,
    handleGuideSkip,
    startGuideManually,
    restartGuide
  };
};
