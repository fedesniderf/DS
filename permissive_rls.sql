-- ALTERNATIVA: Políticas RLS completamente permisivas
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

-- 2. Crear políticas completamente permisivas
CREATE POLICY "Allow all select" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON notifications FOR DELETE USING (true);

-- 3. Verificar las nuevas políticas
SELECT policyname, cmd, permissive, qual 
FROM pg_policies 
WHERE tablename = 'notifications';
