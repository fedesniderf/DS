-- Script para corregir las políticas RLS de notifications
-- Ejecutar en el SQL Editor de Supabase

-- 1. Primero verificar las políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';

-- 2. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;

-- 3. Crear nueva política más permisiva para INSERT
-- Permitir que cualquier usuario autenticado cree notificaciones
CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Alternativamente, si quieres mantener solo para admins:
-- CREATE POLICY "Admins can insert notifications" ON notifications
--   FOR INSERT WITH CHECK (
--     auth.uid() IN (
--       SELECT id FROM usuarios WHERE role = 'admin'
--     )
--   );

-- 5. Verificar que las políticas se aplicaron correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';

-- 6. Verificar estructura de la tabla usuarios para debugging
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
