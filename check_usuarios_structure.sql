-- Consultar estructura de tabla usuarios
-- Ejecutar en Supabase SQL Editor para entender la estructura

-- 1. Ver estructura de la tabla usuarios
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver algunos usuarios de ejemplo
SELECT id, email, role, 
       COALESCE(fullName, full_name, name, email) as nombre_mostrar
FROM usuarios 
LIMIT 5;

-- 3. Ver qué campos están disponibles
SELECT * FROM usuarios LIMIT 1;
