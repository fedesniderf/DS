import { supabase } from '../supabaseClient';

// Guardar una rutina y sus ejercicios
export async function guardarRutinaYejercicios(clienteId, nombreRutina, ejercicios, startDate, endDate) {
  if (!clienteId) {
    alert('Error: clienteId no está definido');
    return;
  }
  console.log('clienteId:', clienteId, typeof clienteId);

  const { data: rutina, error: errorRutina } = await supabase
    .from('rutinas')
    .insert([{
      client_id: clienteId, // uuid del usuario
      name: nombreRutina,
      startDate,
      endDate,
      exercises: JSON.stringify(ejercicios), // guarda la lista como texto
    }])
    .select()
    .single();

  if (errorRutina) {
    alert('Error guardando rutina: ' + errorRutina.message);
    return;
  }

  alert('Rutina guardada correctamente');
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
  const cliente = clientes[0];
  console.log('Clientes:', clientes);
  console.log('Primer cliente:', cliente);
  console.log('client_id:', cliente?.client_id);

  const nombreRutina = "Rutina de fuerza";
  const ejercicios = [
    // ...array de ejercicios...
  ];

  const startDate = "2024-07-15"; // o la fecha que corresponda
  const endDate = "2024-08-15";   // o la fecha que corresponda

  if (cliente && cliente.client_id) {
    await guardarRutinaYejercicios(cliente.client_id, nombreRutina, ejercicios, startDate, endDate);
  } else {
    alert('No se encontró el cliente o el cliente no tiene client_id');
  }
}

// Llama a la función de ejemplo
crearRutinaParaPrimerCliente();