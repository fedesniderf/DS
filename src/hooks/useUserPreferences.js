import { useState, useEffect } from 'react';

/**
 * Hook para manejar preferencias del usuario con localStorage
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState({
    wakeLockEnabled: false,
    dimScreenOnWakeLock: true, // Nueva preferencia para dimming
    originalBrightness: null
  });

  // Cargar preferencias desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('ds_user_preferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (error) {
      console.error('Error cargando preferencias del usuario:', error);
    }
  }, []);

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem('ds_user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error guardando preferencias del usuario:', error);
    }
  }, [preferences]);

  // Función para actualizar una preferencia específica
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Función para resetear todas las preferencias
  const resetPreferences = () => {
    setPreferences({
      wakeLockEnabled: false,
      dimScreenOnWakeLock: true,
      originalBrightness: null
    });
    try {
      localStorage.removeItem('ds_user_preferences');
    } catch (error) {
      console.error('Error reseteando preferencias:', error);
    }
  };

  return {
    preferences,
    updatePreference,
    resetPreferences
  };
};
