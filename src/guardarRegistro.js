import { supabase } from './supabaseClient';

export async function guardarRegistro(nombre, email) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email }]);

  if (error) {
    console.error('Error guardando:', error);
  } else {
    console.log('Registro guardado:', data);
  }
}