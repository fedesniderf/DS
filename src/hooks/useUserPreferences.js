import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook para manejar preferencias del usuario con base de datos Supabase
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState({
    wakeLockEnabled: false,
    dimScreenOnWakeLock: true, // Nueva preferencia para dimming
    originalBrightness: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Obtener el usuario actual desde localStorage
  const getCurrentUser = () => {
    try {
      const savedUser = localStorage.getItem('ds_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
    }
    return null;
  };

  // Cargar preferencias desde la base de datos al inicializar
  useEffect(() => {
    const loadUserPreferences = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser?.client_id) {
        console.log('📦 No hay usuario logueado, usando valores por defecto');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('📦 Cargando preferencias desde la base de datos para usuario:', currentUser.client_id);
        
        const { data, error } = await supabase
          .from('usuarios')
          .select('screenOn, brightOn')
          .eq('client_id', currentUser.client_id)
          .single();

        if (error) {
          console.error('❌ Error cargando preferencias de la base de datos:', error);
          // Usar valores por defecto si hay error
          setPreferences(prev => ({
            ...prev,
            wakeLockEnabled: false,
            dimScreenOnWakeLock: true
          }));
        } else {
          const wakeLockEnabled = data?.screenOn === true; // Convertir a boolean
          const dimScreenOnWakeLock = data?.brightOn === true; // Convertir a boolean
          console.log('✅ Preferencias cargadas desde la base de datos:', { 
            screenOn: data?.screenOn, 
            brightOn: data?.brightOn,
            wakeLockEnabled, 
            dimScreenOnWakeLock 
          });
          
          setPreferences(prev => ({
            ...prev,
            wakeLockEnabled,
            dimScreenOnWakeLock
          }));
        }
      } catch (error) {
        console.error('❌ Error inesperado cargando preferencias:', error);
        setPreferences(prev => ({
          ...prev,
          wakeLockEnabled: false,
          dimScreenOnWakeLock: true
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, []);

  // Función para actualizar una preferencia específica
  const updatePreference = async (key, value) => {
    const currentUser = getCurrentUser();
    
    // Actualizar estado local inmediatamente para mejor UX
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));

    // Actualizar en la base de datos si es una preferencia que se persiste
    if ((key === 'wakeLockEnabled' || key === 'dimScreenOnWakeLock') && currentUser?.client_id) {
      try {
        const dbField = key === 'wakeLockEnabled' ? 'screenOn' : 'brightOn';
        console.log(`💾 Guardando preferencia ${key} en la base de datos:`, { [dbField]: value });
        
        const { error } = await supabase
          .from('usuarios')
          .update({ [dbField]: value })
          .eq('client_id', currentUser.client_id);

        if (error) {
          console.error('❌ Error guardando preferencia en la base de datos:', error);
          // Revertir cambio local si falla la base de datos
          setPreferences(prev => ({
            ...prev,
            [key]: !value
          }));
        } else {
          console.log('✅ Preferencia guardada exitosamente en la base de datos');
        }
      } catch (error) {
        console.error('❌ Error inesperado guardando preferencia:', error);
        // Revertir cambio local si falla
        setPreferences(prev => ({
          ...prev,
          [key]: !value
        }));
      }
    }
  };

  // Función para resetear todas las preferencias
  const resetPreferences = async () => {
    const currentUser = getCurrentUser();
    
    setPreferences({
      wakeLockEnabled: false,
      dimScreenOnWakeLock: true,
      originalBrightness: null
    });

    // Resetear en la base de datos si hay usuario
    if (currentUser?.client_id) {
      try {
        console.log('🔄 Reseteando preferencias en la base de datos');
        
        const { error } = await supabase
          .from('usuarios')
          .update({ 
            screenOn: false,
            brightOn: true // Resetear a true porque es el valor por defecto
          })
          .eq('client_id', currentUser.client_id);

        if (error) {
          console.error('❌ Error reseteando preferencias en la base de datos:', error);
        } else {
          console.log('✅ Preferencias reseteadas exitosamente en la base de datos');
        }
      } catch (error) {
        console.error('❌ Error inesperado reseteando preferencias:', error);
      }
    }
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    isLoading
  };
};
