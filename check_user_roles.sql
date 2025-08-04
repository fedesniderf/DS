-- Script para verificar el setup de usuarios y roles
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura de la tabla usuarios
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 2. Ver todos los usuarios y sus roles
SELECT id, email, role 
FROM usuarios 
LIMIT 10;

-- 3. Verificar el usuario actual (el que está logueado)
SELECT auth.uid() as current_user_id;

-- 4. Verificar si el usuario actual es admin
SELECT u.*, auth.uid() as current_auth_id
FROM usuarios u 
WHERE u.id = auth.uid();

-- 5. Probar la condición de la política
SELECT 
  auth.uid() as current_user,
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() AND role = 'admin'
  ) as is_admin;
