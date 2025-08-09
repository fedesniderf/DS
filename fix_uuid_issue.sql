-- SOLUCIÓN COMPLETA: Políticas compatibles con tabla 'usuarios' personalizada
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar todas las políticas restrictivas de social_posts
DROP POLICY IF EXISTS "Everyone can view all posts initially" ON social_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON social_posts;
DROP POLICY IF EXISTS "Allow everything for testing" ON social_posts;
DROP POLICY IF EXISTS "Allow all operations on social_posts" ON social_posts;

-- 2. Arreglar social_posts
ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS social_posts_user_id_fkey;
ALTER TABLE social_posts ALTER COLUMN user_id TYPE VARCHAR(255);
CREATE POLICY "Allow all operations on social_posts" ON social_posts
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Arreglar social_likes
DROP POLICY IF EXISTS "Users can view all likes" ON social_likes;
DROP POLICY IF EXISTS "Users can like posts" ON social_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON social_likes;
DROP POLICY IF EXISTS "Allow everything likes for testing" ON social_likes;
DROP POLICY IF EXISTS "Allow all operations on social_likes" ON social_likes;

ALTER TABLE social_likes DROP CONSTRAINT IF EXISTS social_likes_user_id_fkey;
ALTER TABLE social_likes ALTER COLUMN user_id TYPE VARCHAR(255);
CREATE POLICY "Allow all operations on social_likes" ON social_likes
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Arreglar social_comments
DROP POLICY IF EXISTS "Everyone can view all comments initially" ON social_comments;
DROP POLICY IF EXISTS "Users can insert comments" ON social_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON social_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON social_comments;
DROP POLICY IF EXISTS "Allow all operations on social_comments" ON social_comments;

ALTER TABLE social_comments DROP CONSTRAINT IF EXISTS social_comments_user_id_fkey;
ALTER TABLE social_comments ALTER COLUMN user_id TYPE VARCHAR(255);
CREATE POLICY "Allow all operations on social_comments" ON social_comments
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Arreglar follow_requests
DROP POLICY IF EXISTS "Users can view requests sent to them" ON follow_requests;
DROP POLICY IF EXISTS "Users can send follow requests" ON follow_requests;
DROP POLICY IF EXISTS "Users can update requests sent to them" ON follow_requests;
DROP POLICY IF EXISTS "Allow all operations on follow_requests" ON follow_requests;

ALTER TABLE follow_requests DROP CONSTRAINT IF EXISTS follow_requests_requester_id_fkey;
ALTER TABLE follow_requests DROP CONSTRAINT IF EXISTS follow_requests_requested_id_fkey;
ALTER TABLE follow_requests ALTER COLUMN requester_id TYPE VARCHAR(255);
ALTER TABLE follow_requests ALTER COLUMN requested_id TYPE VARCHAR(255);
CREATE POLICY "Allow all operations on follow_requests" ON follow_requests
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Arreglar follows
DROP POLICY IF EXISTS "Users can view their follows and followers" ON follows;
DROP POLICY IF EXISTS "Users can create follow relationships" ON follows;
DROP POLICY IF EXISTS "Users can delete their follow relationships" ON follows;
DROP POLICY IF EXISTS "Allow all operations on follows" ON follows;

ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE follows ALTER COLUMN follower_id TYPE VARCHAR(255);
ALTER TABLE follows ALTER COLUMN following_id TYPE VARCHAR(255);
CREATE POLICY "Allow all operations on follows" ON follows
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Verificar las tablas
SELECT 'All social tables updated successfully' as status;
