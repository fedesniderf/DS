-- Script para agregar la columna admin_id a la tabla notifications existente
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar la columna admin_id si no existe
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- 3. Mostrar contenido actual (si hay alguna notificación)
SELECT * FROM notifications LIMIT 5;
