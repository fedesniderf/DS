import { supabase } from '../supabaseClient';

// Guardar una rutina y sus ejercicios
export async function guardarRutinaYejercicios(clienteId, nombreRutina, ejercicios) {
  if (!clienteId) {
    alert('Error: clienteId no está definido');
    return;
  }
  console.log('clienteId:', clienteId);

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

export async function obtenerClientes() {
  const { data: clientes, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('role', 'client');

  if (error) {
    alert('Error consultando clientes: ' + error.message);
    return [];
  }

  return clientes;
}

// Ejemplo de uso correcto:
async function crearRutinaParaPrimerCliente() {
  const clientes = await obtenerClientes();
  const cliente = clientes[0]; // o selecciona el cliente adecuado
  const nombreRutina = "Rutina de fuerza";
  const ejercicios = [
    // ...array de ejercicios...
  ];

  if (cliente && cliente.id) {
    await guardarRutinaYejercicios(cliente.id, nombreRutina, ejercicios);
  } else {
    alert('No se encontró el cliente o el cliente no tiene id');
  }
}

// Llama a la función de ejemplo
crearRutinaParaPrimerCliente();