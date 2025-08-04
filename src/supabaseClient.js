import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno para mayor seguridad
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';

// Verificar si las credenciales están configuradas
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️  Supabase no está configurado correctamente. Por favor, configura las variables de entorno en el archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);