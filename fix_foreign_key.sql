-- Script para corregir la foreign key de notifications
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar las foreign keys actuales
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='notifications';

-- 2. Eliminar la foreign key problemática
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- 3. Verificar qué tabla de usuarios usas en tu app
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'usuarios') 
AND column_name = 'id';

-- 4. Crear nueva foreign key apuntando a tu tabla usuarios
-- (Si usas la tabla 'usuarios' en lugar de 'auth.users')
ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- 5. Verificar que se aplicó correctamente
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='notifications';
