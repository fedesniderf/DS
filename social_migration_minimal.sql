-- Migración MÍNIMA para Red Social DS
-- Ejecutar en Supabase SQL Editor

-- Tabla básica para publicaciones
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla básica para likes  
CREATE TABLE IF NOT EXISTS social_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Habilitar RLS básico
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_likes ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (muy permisivas para testing)
CREATE POLICY "Allow all social_posts" ON social_posts FOR ALL USING (true);
CREATE POLICY "Allow all social_likes" ON social_likes FOR ALL USING (true);
