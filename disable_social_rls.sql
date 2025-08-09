-- TEMPORAL: Desactivar RLS para testing de red social
-- Ejecutar en Supabase SQL Editor

-- Desactivar RLS en todas las tablas sociales temporalmente
ALTER TABLE social_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE follow_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;

-- Verificar estado de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('social_posts', 'social_likes', 'social_comments', 'follow_requests', 'follows')
    AND schemaname = 'public';

-- Esto debería mostrar rowsecurity = false para todas las tablas

SELECT 'RLS disabled for all social tables - ready for testing' as status;
