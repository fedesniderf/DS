-- Script de debug para verificar el estado de las notificaciones
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que la tabla existe y tiene la estructura correcta
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- 2. Verificar todas las notificaciones existentes
SELECT 
  id,
  user_id,
  admin_id,
  type,
  title,
  message,
  routine_id,
  read,
  created_at
FROM notifications 
ORDER BY created_at DESC;

-- 3. Contar notificaciones por usuario
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_notifications
FROM notifications 
GROUP BY user_id;

-- 4. Verificar las políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';

-- 5. Verificar usuarios existentes (para reference)
SELECT id, email, role FROM usuarios LIMIT 10;
