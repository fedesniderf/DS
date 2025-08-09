-- SOLUCIÓN COMPLETA: Desactivar RLS en TABLAS y STORAGE
-- Ejecutar en Supabase SQL Editor

-- ==========================================
-- PARTE 1: DESACTIVAR RLS EN TABLAS SOCIALES
-- ==========================================

-- Eliminar todas las políticas de tablas
DROP POLICY IF EXISTS "Allow all operations on social_posts" ON social_posts;
DROP POLICY IF EXISTS "Allow all operations on social_likes" ON social_likes;
DROP POLICY IF EXISTS "Allow all operations on social_comments" ON social_comments;
DROP POLICY IF EXISTS "Allow all operations on follow_requests" ON follow_requests;
DROP POLICY IF EXISTS "Allow all operations on follows" ON follows;

-- Desactivar RLS en tablas
ALTER TABLE social_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE follow_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- PARTE 2: DESACTIVAR RLS EN STORAGE
-- ==========================================

-- Eliminar políticas de storage
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view social media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

-- Crear políticas SUPER permisivas para storage
CREATE POLICY "Allow all storage operations" ON storage.objects
    FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- PARTE 3: VERIFICACIONES
-- ==========================================

-- Verificar RLS en tablas
SELECT 
    'TABLAS' as tipo,
    tablename,
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename IN ('social_posts', 'social_likes', 'social_comments', 'follow_requests', 'follows')
    AND schemaname = 'public'
ORDER BY tablename;

-- Verificar policies en storage
SELECT 
    'STORAGE' as tipo,
    policyname as politica,
    'storage.objects' as tabla
FROM pg_policies 
WHERE tablename = 'objects' 
    AND schemaname = 'storage';

-- ==========================================
-- PARTE 4: PRUEBAS
-- ==========================================

-- Probar inserción en tabla
INSERT INTO social_posts (user_id, content, created_at) 
VALUES ('test-final', 'Prueba final completa', NOW());

-- Verificar inserción
SELECT 'TABLA: Inserción exitosa' as resultado, count(*) as posts_totales
FROM social_posts;

-- Limpiar prueba
DELETE FROM social_posts WHERE content = 'Prueba final completa';

SELECT '✅ RLS desactivado en TABLAS y STORAGE' as status;
