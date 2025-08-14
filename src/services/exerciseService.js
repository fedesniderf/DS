import { EXERCISES_LIST } from '../data/exercisesList';

const STORAGE_KEY = 'ds_custom_exercises';

class ExerciseService {
  // Obtener ejercicios personalizados del localStorage
  getCustomExercises() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar ejercicios personalizados:', error);
      return [];
    }
  }

  // Guardar ejercicio personalizado
  addCustomExercise(exerciseName) {
    try {
      const customExercises = this.getCustomExercises();
      const trimmedName = exerciseName.trim();
      
      // Verificar que no esté duplicado
      if (customExercises.includes(trimmedName)) {
        throw new Error('Este ejercicio ya existe en la lista personalizada');
      }

      // Verificar que no esté en la lista original
      if (EXERCISES_LIST.includes(trimmedName)) {
        throw new Error('Este ejercicio ya existe en la lista original');
      }

      customExercises.push(trimmedName);
      customExercises.sort(); // Mantener ordenado alfabéticamente
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customExercises));
      return true;
    } catch (error) {
      console.error('Error al guardar ejercicio personalizado:', error);
      throw error;
    }
  }

  // Obtener lista completa (original + personalizados)
  getAllExercises() {
    const customExercises = this.getCustomExercises();
    const allExercises = [...EXERCISES_LIST, ...customExercises];
    
    // Ordenar alfabéticamente y eliminar duplicados
    return [...new Set(allExercises)].sort();
  }

  // Eliminar ejercicio personalizado
  removeCustomExercise(exerciseName) {
    try {
      console.log('removeCustomExercise llamado con:', exerciseName);
      const customExercises = this.getCustomExercises();
      console.log('Ejercicios personalizados antes:', customExercises);
      
      const filteredExercises = customExercises.filter(ex => ex !== exerciseName);
      console.log('Ejercicios personalizados después:', filteredExercises);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredExercises));
      console.log('Guardado en localStorage exitosamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar ejercicio personalizado:', error);
      throw error;
    }
  }

  // Verificar si un ejercicio es personalizado
  isCustomExercise(exerciseName) {
    const customExercises = this.getCustomExercises();
    return customExercises.includes(exerciseName);
  }

  // Limpiar todos los ejercicios personalizados (para desarrollo)
  clearCustomExercises() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default new ExerciseService();
