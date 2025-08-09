-- Investigar estructura real de usuario barbaramw.18@gmail.com
-- Ejecutar en Supabase SQL Editor

-- 1. Ver estructura de tabla usuarios PRIMERO
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver todos los datos sin asumir columna 'id'
SELECT * FROM usuarios LIMIT 3;

-- 3. Buscar usuario por email
SELECT * FROM usuarios 
WHERE email = 'barbaramw.18@gmail.com';
