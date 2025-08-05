// Script para agregar la columna profilePhoto a la tabla usuarios
// Ejecutar este archivo con Node.js desde la terminal

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseServiceKey = 'TU_SUPABASE_SERVICE_KEY'; // Necesitas usar la service key, no la anon key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addProfilePhotoColumn() {
  try {
    console.log('🔄 Agregando columna profilePhoto a la tabla usuarios...');
    
    // Ejecutar el comando SQL para agregar la columna
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE public.usuarios 
        ADD COLUMN IF NOT EXISTS profilePhoto TEXT;
        
        COMMENT ON COLUMN public.usuarios.profilePhoto IS 'Foto de perfil del usuario en formato base64 (opcional)';
      `
    });

    if (error) {
      console.error('❌ Error al agregar la columna:', error);
      return;
    }

    console.log('✅ Columna profilePhoto agregada exitosamente');
    console.log('📋 Puedes verificar en tu panel de Supabase > Table Editor > usuarios');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

// Ejecutar la migración
addProfilePhotoColumn();
