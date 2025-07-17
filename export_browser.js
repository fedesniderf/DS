// 🚀 Script simple para exportar datos de Supabase
// Pega este código en la consola del navegador de tu aplicación

async function exportSupabaseData() {
  // Acceder al cliente de Supabase desde la aplicación
  const { supabase } = window.supabase || await import('./supabaseClient.js');
  
  try {
    console.log('🔄 Exportando datos...');
    
    // Verificar conexión
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    if (tablesError) {
      console.log('⚠️ No se pudo verificar tablas, continuando...');
    }
    
    // Exportar usuarios
    const { data: usuarios, error: usuariosError } = await supabase.from('usuarios').select('*');
    if (usuariosError) {
      console.error('❌ Error exportando usuarios:', usuariosError);
      return;
    }
    console.log('👥 Usuarios:', usuarios);
    
    // Exportar rutinas
    const { data: rutinas, error: rutinasError } = await supabase.from('rutinas').select('*');
    if (rutinasError) {
      console.error('❌ Error exportando rutinas:', rutinasError);
      return;
    }
    console.log('📋 Rutinas:', rutinas);
    
    // Crear objeto de exportación
    const exportData = {
      timestamp: new Date().toISOString(),
      usuarios: usuarios || [],
      rutinas: rutinas || [],
      metadata: {
        total_usuarios: usuarios?.length || 0,
        total_rutinas: rutinas?.length || 0
      }
    };
    
    // Descargar como archivo JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Exportación completada!');
    console.log(`👥 Usuarios exportados: ${exportData.metadata.total_usuarios}`);
    console.log(`📋 Rutinas exportadas: ${exportData.metadata.total_rutinas}`);
    
    return exportData;
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  // Recargar la página automáticamente después de la exportación
  setTimeout(() => window.location.reload(), 1000);
}

// Ejecutar la función
exportSupabaseData();
