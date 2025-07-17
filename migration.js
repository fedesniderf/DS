import { supabase } from './src/supabaseClient.js';
import fs from 'fs';

// Script para exportar datos de Supabase
async function exportData() {
  try {
    console.log('🔄 Iniciando exportación de datos...');
    
    // Exportar usuarios
    console.log('📥 Exportando usuarios...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*');
    
    if (usuariosError) {
      console.error('❌ Error exportando usuarios:', usuariosError);
      return;
    }
    
    // Exportar rutinas
    console.log('📥 Exportando rutinas...');
    const { data: rutinas, error: rutinasError } = await supabase
      .from('rutinas')
      .select('*');
    
    if (rutinasError) {
      console.error('❌ Error exportando rutinas:', rutinasError);
      return;
    }
    
    // Exportar ejercicios (si existen)
    console.log('📥 Exportando ejercicios...');
    const { data: ejercicios, error: ejerciciosError } = await supabase
      .from('ejercicios')
      .select('*');
    
    // No mostrar error si la tabla no existe
    if (ejerciciosError && !ejerciciosError.message.includes('does not exist')) {
      console.error('❌ Error exportando ejercicios:', ejerciciosError);
    }
    
    // Crear el objeto de exportación
    const exportData = {
      timestamp: new Date().toISOString(),
      usuarios: usuarios || [],
      rutinas: rutinas || [],
      ejercicios: ejercicios || [],
      metadata: {
        total_usuarios: usuarios?.length || 0,
        total_rutinas: rutinas?.length || 0,
        total_ejercicios: ejercicios?.length || 0
      }
    };
    
    // Guardar en archivo JSON
    const fileName = `supabase_export_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(fileName, JSON.stringify(exportData, null, 2));
    
    console.log('✅ Exportación completada!');
    console.log(`📄 Archivo guardado: ${fileName}`);
    console.log(`👥 Usuarios exportados: ${exportData.metadata.total_usuarios}`);
    console.log(`📋 Rutinas exportadas: ${exportData.metadata.total_rutinas}`);
    console.log(`🏋️ Ejercicios exportados: ${exportData.metadata.total_ejercicios}`);
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Script para importar datos a nuevo proyecto
async function importData(fileName) {
  try {
    console.log('🔄 Iniciando importación de datos...');
    
    // Leer archivo de exportación
    const data = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    
    // Importar usuarios
    if (data.usuarios && data.usuarios.length > 0) {
      console.log('📤 Importando usuarios...');
      const { error: usuariosError } = await supabase
        .from('usuarios')
        .insert(data.usuarios);
      
      if (usuariosError) {
        console.error('❌ Error importando usuarios:', usuariosError);
        return;
      }
    }
    
    // Importar rutinas
    if (data.rutinas && data.rutinas.length > 0) {
      console.log('📤 Importando rutinas...');
      const { error: rutinasError } = await supabase
        .from('rutinas')
        .insert(data.rutinas);
      
      if (rutinasError) {
        console.error('❌ Error importando rutinas:', rutinasError);
        return;
      }
    }
    
    // Importar ejercicios (si existen)
    if (data.ejercicios && data.ejercicios.length > 0) {
      console.log('📤 Importando ejercicios...');
      const { error: ejerciciosError } = await supabase
        .from('ejercicios')
        .insert(data.ejercicios);
      
      if (ejerciciosError) {
        console.error('❌ Error importando ejercicios:', ejerciciosError);
        return;
      }
    }
    
    console.log('✅ Importación completada!');
    console.log(`👥 Usuarios importados: ${data.metadata.total_usuarios}`);
    console.log(`📋 Rutinas importadas: ${data.metadata.total_rutinas}`);
    console.log(`🏋️ Ejercicios importados: ${data.metadata.total_ejercicios}`);
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar según el argumento
const action = process.argv[2];
const fileName = process.argv[3];

if (action === 'export') {
  exportData();
} else if (action === 'import' && fileName) {
  importData(fileName);
} else {
  console.log('📖 Uso:');
  console.log('  node migration.js export                    # Exportar datos');
  console.log('  node migration.js import [archivo.json]     # Importar datos');
}
