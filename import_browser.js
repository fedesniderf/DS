// 🚀 Script para importar datos a nuevo proyecto Supabase
// Usa este script después de crear tu nuevo proyecto

// 1. Actualiza estas variables con tu nuevo proyecto
const NUEVO_SUPABASE_URL = 'https://sggpxhuxhauzoophrlui.supabase.co';
const NUEVA_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZ3B4aHV4aGF1em9vcGhybHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjMxOTQsImV4cCI6MjA2ODI5OTE5NH0.Q5WS4Ls_-UEcl5ZcPJxAu_R0gwC-s_uKijKLqw5llFw';

// 2. Pega este código en la consola del navegador
async function importSupabaseData(backupData) {
  // Crear cliente para el nuevo proyecto
  const { createClient } = supabase;
  const newSupabase = createClient(NUEVO_SUPABASE_URL, NUEVA_SUPABASE_KEY);
  
  try {
    console.log('🔄 Importando datos al nuevo proyecto...');
    
    // Importar usuarios
    if (backupData.usuarios && backupData.usuarios.length > 0) {
      console.log('📤 Importando usuarios...');
      const { error: usuariosError } = await newSupabase
        .from('usuarios')
        .insert(backupData.usuarios);
      
      if (usuariosError) {
        console.error('❌ Error importando usuarios:', usuariosError);
        return;
      }
      console.log('✅ Usuarios importados correctamente');
    }
    
    // Importar rutinas
    if (backupData.rutinas && backupData.rutinas.length > 0) {
      console.log('📤 Importando rutinas...');
      const { error: rutinasError } = await newSupabase
        .from('rutinas')
        .insert(backupData.rutinas);
      
      if (rutinasError) {
        console.error('❌ Error importando rutinas:', rutinasError);
        return;
      }
      console.log('✅ Rutinas importadas correctamente');
    }
    
    console.log('🎉 Importación completada exitosamente!');
    console.log(`👥 Usuarios importados: ${backupData.usuarios?.length || 0}`);
    console.log(`📋 Rutinas importadas: ${backupData.rutinas?.length || 0}`);
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// 3. Cargar el archivo de backup
async function loadBackupFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          console.error('Error parseando archivo:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

// 4. Función principal
async function iniciarImportacion() {
  console.log('📁 Selecciona el archivo de backup...');
  const backupData = await loadBackupFile();
  
  if (backupData) {
    console.log('📄 Archivo cargado:', backupData.metadata);
    await importSupabaseData(backupData);
  }
}

// Ejecutar
iniciarImportacion();
