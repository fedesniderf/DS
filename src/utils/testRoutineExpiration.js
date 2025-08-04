import { supabase } from '../supabaseClient';

/**
 * Script de utilidad para crear rutinas de prueba próximas a vencer
 * Útil para probar el sistema de notificaciones automáticas
 */

export const createTestExpiringRoutines = async () => {
  console.log('🧪 Creando rutinas de prueba próximas a vencer...');

  try {
    // Obtener un cliente de prueba
    const { data: clients, error: clientsError } = await supabase
      .from('usuarios')
      .select('client_id, email, full_name')
      .eq('role', 'client')
      .limit(1);

    if (clientsError || !clients || clients.length === 0) {
      console.error('No se encontraron clientes para prueba');
      return { success: false, error: 'No hay clientes disponibles' };
    }

    const testClient = clients[0];
    const today = new Date();

    // Crear rutinas que vencen en 7, 3 y 1 día
    const testRoutines = [
      {
        name: '🧪 Rutina Prueba - Vence en 7 días',
        client_id: testClient.client_id,
        startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Empezó hace 14 días
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Termina en 7 días
        description: 'Rutina de prueba para testing de notificaciones - vence en 7 días',
        exercises: []
      },
      {
        name: '🧪 Rutina Prueba - Vence en 3 días',
        client_id: testClient.client_id,
        startDate: new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Empezó hace 18 días
        endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Termina en 3 días
        description: 'Rutina de prueba para testing de notificaciones - vence en 3 días',
        exercises: []
      },
      {
        name: '🧪 Rutina Prueba - Vence en 1 día',
        client_id: testClient.client_id,
        startDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Empezó hace 20 días
        endDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Termina en 1 día
        description: 'Rutina de prueba para testing de notificaciones - vence en 1 día',
        exercises: []
      }
    ];

    // Insertar las rutinas de prueba
    const { data: createdRoutines, error: insertError } = await supabase
      .from('rutinas')
      .insert(testRoutines)
      .select();

    if (insertError) {
      console.error('Error creando rutinas de prueba:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Rutinas de prueba creadas exitosamente:', createdRoutines);
    return { 
      success: true, 
      routines: createdRoutines,
      client: testClient 
    };

  } catch (error) {
    console.error('Error en createTestExpiringRoutines:', error);
    return { success: false, error: error.message };
  }
};

export const cleanTestRoutines = async () => {
  console.log('🧹 Limpiando rutinas de prueba...');

  try {
    const { data: deletedRoutines, error } = await supabase
      .from('rutinas')
      .delete()
      .like('name', '🧪 Rutina Prueba%')
      .select();

    if (error) {
      console.error('Error eliminando rutinas de prueba:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Rutinas de prueba eliminadas:', deletedRoutines);
    return { success: true, deleted: deletedRoutines };

  } catch (error) {
    console.error('Error en cleanTestRoutines:', error);
    return { success: false, error: error.message };
  }
};

// Función para probar el sistema completo
export const testCompleteExpirationSystem = async () => {
  console.log('🚀 Iniciando prueba completa del sistema de notificaciones...');

  try {
    // 1. Crear rutinas de prueba
    const createResult = await createTestExpiringRoutines();
    if (!createResult.success) {
      console.error('❌ Error creando rutinas de prueba');
      return createResult;
    }

    console.log('✅ Paso 1: Rutinas de prueba creadas');

    // 2. Importar y ejecutar la verificación de rutinas
    const { NotificationService } = await import('../services/NotificationService');
    const checkResult = await NotificationService.checkExpiringRoutines();

    if (!checkResult.success) {
      console.error('❌ Error verificando rutinas');
      return checkResult;
    }

    console.log('✅ Paso 2: Verificación completada');
    console.log(`📊 Resultados: ${checkResult.checked} rutinas verificadas, ${checkResult.notifications} notificaciones enviadas`);

    return {
      success: true,
      created: createResult.routines.length,
      checked: checkResult.checked,
      notifications: checkResult.notifications,
      message: `Sistema funcionando correctamente. Se crearon ${createResult.routines.length} rutinas de prueba y se enviaron ${checkResult.notifications} notificaciones.`
    };

  } catch (error) {
    console.error('💥 Error en la prueba completa:', error);
    return { success: false, error: error.message };
  }
};
