-- FORZAR DESACTIVACIÓN COMPLETA DE RLS - Red Social
-- Ejecutar línea por línea en Supabase SQL Editor si es necesario

-- 1. Eliminar TODAS las políticas primero
DROP POLICY IF EXISTS "Allow all operations on social_posts" ON social_posts;
DROP POLICY IF EXISTS "Allow all operations on social_likes" ON social_likes;
DROP POLICY IF EXISTS "Allow all operations on social_comments" ON social_comments;
DROP POLICY IF EXISTS "Allow all operations on follow_requests" ON follow_requests;
DROP POLICY IF EXISTS "Allow all operations on follows" ON follows;

-- 2. FORZAR desactivación de RLS
ALTER TABLE social_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE follow_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que RLS está desactivado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('social_posts', 'social_likes', 'social_comments', 'follow_requests', 'follows')
    AND schemaname = 'public'
ORDER BY tablename;

-- 4. Probar inserción directa en social_posts
INSERT INTO social_posts (user_id, content, created_at) 
VALUES ('test-123', 'Post de prueba desde SQL', NOW());

-- 5. Verificar que se insertó
SELECT * FROM social_posts ORDER BY created_at DESC LIMIT 1;

-- 6. Limpiar el post de prueba
DELETE FROM social_posts WHERE content = 'Post de prueba desde SQL';

SELECT 'RLS completamente desactivado y probado' as status;
