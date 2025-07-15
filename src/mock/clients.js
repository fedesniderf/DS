import { supabase } from '../supabaseClient';

// Solo si necesitas datos de ejemplo
export const defaultClients = [];
export const defaultRoutines = [];

// Guardar una rutina y sus ejercicios
export async function guardarRutinaYejercicios(clienteId, nombreRutina, ejercicios) {
  // 1. Insertar rutina
  const { data: rutina, error: errorRutina } = await supabase
    .from('rutinas')
    .insert([{ client_id: clienteId, name: nombreRutina }])
    .select()
    .single();

  if (errorRutina) {
    alert('Error guardando rutina: ' + errorRutina.message);
    return;
  }

  // 2. Insertar ejercicios asociados a la rutina
  const ejerciciosConRutina = ejercicios.map(ej => ({
    ...ej,
    rutina_id: rutina.id,
  }));

  const { error: errorEjercicios } = await supabase
    .from('ejercicios')
    .insert(ejerciciosConRutina);

  if (errorEjercicios) {
    alert('Error guardando ejercicios: ' + errorEjercicios.message);
    return;
  }

  alert('Rutina y ejercicios guardados correctamente');
}

// Obtener todas las rutinas y ejercicios de un cliente
export async function obtenerRutinasYejercicios(clienteId) {
  // 1. Obtener rutinas del cliente
  const { data: rutinas, error: errorRutinas } = await supabase
    .from('rutinas')
    .select('*')
    .eq('client_id', clienteId);

  if (errorRutinas) {
    alert('Error consultando rutinas: ' + errorRutinas.message);
    return [];
  }

  // 2. Para cada rutina, obtener ejercicios
  for (let rutina of rutinas) {
    const { data: ejercicios } = await supabase
      .from('ejercicios')
      .select('*')
      .eq('rutina_id', rutina.id);
    rutina.ejercicios = ejercicios;
  }

  return rutinas;
}