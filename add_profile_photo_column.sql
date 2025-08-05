-- Agregar columna de foto de perfil a la tabla usuarios
-- Este script debe ejecutarse en Supabase SQL Editor

ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS profilePhoto TEXT;

-- Comentario explicativo
COMMENT ON COLUMN public.usuarios.profilePhoto IS 'Foto de perfil del usuario en formato base64 (opcional)';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name = 'profilePhoto';
