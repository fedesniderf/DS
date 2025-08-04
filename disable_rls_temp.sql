-- SOLUCIÓN TEMPORAL: Deshabilitar RLS para desarrollar
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estado actual de RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notifications';

-- 2. DESHABILITAR RLS temporalmente
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que se deshabilitó
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notifications';

-- 4. Probar inserción manual para verificar
-- INSERT INTO notifications (user_id, type, title, message) 
-- VALUES ('11111111-1111-1111-1111-111111111111', 'test', 'Prueba', 'Mensaje de prueba');

-- 5. Para REACTIVAR RLS después (cuando el sistema funcione):
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
