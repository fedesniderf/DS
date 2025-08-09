-- Migración para Red Social DS
-- Ejecutar estos comandos en Supabase SQL Editor

-- Tabla para las publicaciones sociales
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para los likes de publicaciones
CREATE TABLE IF NOT EXISTS social_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Tabla para los comentarios de publicaciones
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para las solicitudes de seguimiento
CREATE TABLE IF NOT EXISTS follow_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, requested_id)
);

-- Tabla para las relaciones de seguimiento
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_likes_post_id ON social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user_id ON social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_requested_id ON follow_requests(requested_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_status ON follow_requests(status);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Políticas de seguridad RLS (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Políticas para social_posts (versión simplificada para inicio)
CREATE POLICY "Everyone can view all posts initially" ON social_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON social_posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts" ON social_posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON social_posts
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para social_likes
CREATE POLICY "Users can view all likes" ON social_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON social_likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike their own likes" ON social_likes
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para social_comments (versión simplificada)
CREATE POLICY "Everyone can view all comments initially" ON social_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON social_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON social_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON social_comments
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para follow_requests
CREATE POLICY "Users can view requests sent to them" ON follow_requests
    FOR SELECT USING (requested_id = auth.uid() OR requester_id = auth.uid());

CREATE POLICY "Users can send follow requests" ON follow_requests
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update requests sent to them" ON follow_requests
    FOR UPDATE USING (requested_id = auth.uid());

-- Políticas para follows
CREATE POLICY "Users can view their follows and followers" ON follows
    FOR SELECT USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can create follow relationships" ON follows
    FOR INSERT WITH CHECK (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can delete their follow relationships" ON follows
    FOR DELETE USING (follower_id = auth.uid());

-- Crear bucket para almacenamiento de media social
INSERT INTO storage.buckets (id, name, public) 
VALUES ('social-media', 'social-media', true) 
ON CONFLICT (id) DO NOTHING;

-- Política de almacenamiento para el bucket social-media (simplificada)
CREATE POLICY "Authenticated users can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'social-media' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Anyone can view social media" ON storage.objects
    FOR SELECT USING (bucket_id = 'social-media');

CREATE POLICY "Users can update their own media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'social-media' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their own media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'social-media' AND 
        auth.role() = 'authenticated'
    );

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_social_posts_updated_at 
    BEFORE UPDATE ON social_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_comments_updated_at 
    BEFORE UPDATE ON social_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_requests_updated_at 
    BEFORE UPDATE ON follow_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
