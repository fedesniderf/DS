-- SOLUCIÓN SIMPLE: Remover foreign key completamente
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar foreign keys actuales
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'notifications' 
AND constraint_name LIKE '%fkey%';

-- 2. Eliminar TODAS las foreign keys de notifications (temporal para desarrollo)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_admin_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_routine_id_fkey;

-- 3. Verificar que se eliminaron
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'notifications' 
AND constraint_name LIKE '%fkey%';

-- 4. Probar inserción manual
-- INSERT INTO notifications (user_id, type, title, message) 
-- VALUES ('79af7ea8-7527-4751-97c7-2d09671d4f46', 'test', 'Prueba', 'Mensaje de prueba');
