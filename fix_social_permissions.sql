-- SOLUCIÓN TEMPORAL: Políticas muy permisivas para debugging
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Everyone can view all posts initially" ON social_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON social_posts;

-- Crear políticas SUPER permisivas para testing
CREATE POLICY "Allow everything for testing" ON social_posts
    FOR ALL USING (true) WITH CHECK (true);

-- También para likes
DROP POLICY IF EXISTS "Users can view all likes" ON social_likes;
DROP POLICY IF EXISTS "Users can like posts" ON social_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON social_likes;

CREATE POLICY "Allow everything likes for testing" ON social_likes
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar que las tablas existen
SELECT 'social_posts exists' as status, count(*) as count FROM social_posts
UNION ALL
SELECT 'social_likes exists' as status, count(*) as count FROM social_likes;
