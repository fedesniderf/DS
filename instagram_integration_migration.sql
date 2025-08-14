-- =====================================================
-- MIGRACIÓN: INTEGRACIÓN INSTAGRAM CON RED SOCIAL DS
-- Fecha: 14 Agosto 2025
-- Versión: 1.0
-- =====================================================

-- 1. Agregar columnas para integración Instagram en social_posts
ALTER TABLE social_posts 
ADD COLUMN IF NOT EXISTS instagram_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS instagram_permalink TEXT,
ADD COLUMN IF NOT EXISTS is_instagram_import BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'local', -- 'local', 'synced', 'pending', 'error'
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_social_posts_instagram_id ON social_posts(instagram_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_instagram_import ON social_posts(is_instagram_import);
CREATE INDEX IF NOT EXISTS idx_social_posts_sync_status ON social_posts(sync_status);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_instagram ON social_posts(user_id, is_instagram_import);

-- 3. Crear tabla para configuración de Instagram por usuario
CREATE TABLE IF NOT EXISTS instagram_connections (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES usuarios(client_id) ON DELETE CASCADE,
    instagram_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    access_token_expires_at TIMESTAMPTZ,
    account_type VARCHAR(50), -- PERSONAL, BUSINESS, CREATOR
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    sync_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un usuario solo puede tener una conexión activa de Instagram
    UNIQUE(user_id)
);

-- 4. Crear índices para la tabla de conexiones
CREATE INDEX IF NOT EXISTS idx_instagram_connections_user_id ON instagram_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_connections_instagram_user_id ON instagram_connections(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_connections_is_active ON instagram_connections(is_active);

-- 5. Crear tabla para historial de sincronización
CREATE TABLE IF NOT EXISTS instagram_sync_history (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES usuarios(client_id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'import', 'export', 'full_sync'
    posts_processed INTEGER DEFAULT 0,
    posts_imported INTEGER DEFAULT 0,
    posts_exported INTEGER DEFAULT 0,
    posts_failed INTEGER DEFAULT 0,
    sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metadata JSONB -- Para almacenar datos adicionales del sync
);

-- 6. Crear índices para historial de sincronización
CREATE INDEX IF NOT EXISTS idx_instagram_sync_history_user_id ON instagram_sync_history(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_sync_history_sync_type ON instagram_sync_history(sync_type);
CREATE INDEX IF NOT EXISTS idx_instagram_sync_history_sync_status ON instagram_sync_history(sync_status);
CREATE INDEX IF NOT EXISTS idx_instagram_sync_history_started_at ON instagram_sync_history(started_at);

-- 7. Crear función para actualizar timestamp de última modificación
CREATE OR REPLACE FUNCTION update_instagram_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS trigger_update_instagram_connections_updated_at ON instagram_connections;
CREATE TRIGGER trigger_update_instagram_connections_updated_at
    BEFORE UPDATE ON instagram_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_instagram_connections_updated_at();

-- 9. Crear tabla para queue de publicaciones a Instagram
CREATE TABLE IF NOT EXISTS instagram_publish_queue (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES usuarios(client_id) ON DELETE CASCADE,
    social_post_id BIGINT REFERENCES social_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20), -- 'image', 'video'
    hashtags TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'manual_required', 'published', 'failed'
    instagram_post_id VARCHAR(255), -- ID del post en Instagram después de publicar
    instagram_permalink TEXT,
    instructions JSONB, -- Instrucciones para publicación manual
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ
);

-- 10. Crear índices para queue de publicaciones
CREATE INDEX IF NOT EXISTS idx_instagram_publish_queue_user_id ON instagram_publish_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_publish_queue_social_post_id ON instagram_publish_queue(social_post_id);
CREATE INDEX IF NOT EXISTS idx_instagram_publish_queue_status ON instagram_publish_queue(status);
CREATE INDEX IF NOT EXISTS idx_instagram_publish_queue_created_at ON instagram_publish_queue(created_at);

-- 11. Configurar RLS (Row Level Security) para las nuevas tablas

-- Habilitar RLS
ALTER TABLE instagram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_publish_queue ENABLE ROW LEVEL SECURITY;

-- Políticas para instagram_connections
DROP POLICY IF EXISTS "Users can view their own Instagram connections" ON instagram_connections;
CREATE POLICY "Users can view their own Instagram connections"
    ON instagram_connections FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert their own Instagram connections" ON instagram_connections;
CREATE POLICY "Users can insert their own Instagram connections"
    ON instagram_connections FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can update their own Instagram connections" ON instagram_connections;
CREATE POLICY "Users can update their own Instagram connections"
    ON instagram_connections FOR UPDATE
    USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can delete their own Instagram connections" ON instagram_connections;
CREATE POLICY "Users can delete their own Instagram connections"
    ON instagram_connections FOR DELETE
    USING (user_id = current_setting('app.current_user_id', true));

-- Políticas para instagram_sync_history
DROP POLICY IF EXISTS "Users can view their own sync history" ON instagram_sync_history;
CREATE POLICY "Users can view their own sync history"
    ON instagram_sync_history FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert their own sync history" ON instagram_sync_history;
CREATE POLICY "Users can insert their own sync history"
    ON instagram_sync_history FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Políticas para instagram_publish_queue
DROP POLICY IF EXISTS "Users can view their own publish queue" ON instagram_publish_queue;
CREATE POLICY "Users can view their own publish queue"
    ON instagram_publish_queue FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can insert into their own publish queue" ON instagram_publish_queue;
CREATE POLICY "Users can insert into their own publish queue"
    ON instagram_publish_queue FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "Users can update their own publish queue" ON instagram_publish_queue;
CREATE POLICY "Users can update their own publish queue"
    ON instagram_publish_queue FOR UPDATE
    USING (user_id = current_setting('app.current_user_id', true));

-- 12. Crear vistas útiles para reporting

-- Vista de estadísticas de Instagram por usuario
CREATE OR REPLACE VIEW instagram_user_stats AS
SELECT 
    ic.user_id,
    ic.username as instagram_username,
    ic.account_type,
    ic.is_active,
    ic.last_sync_at,
    COALESCE(posts_imported.count, 0) as posts_imported_count,
    COALESCE(posts_pending.count, 0) as posts_pending_count,
    COALESCE(sync_history.last_sync, ic.last_sync_at) as last_sync_attempt
FROM instagram_connections ic
LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM social_posts 
    WHERE is_instagram_import = true
    GROUP BY user_id
) posts_imported ON ic.user_id = posts_imported.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM instagram_publish_queue 
    WHERE status = 'pending'
    GROUP BY user_id
) posts_pending ON ic.user_id = posts_pending.user_id
LEFT JOIN (
    SELECT user_id, MAX(started_at) as last_sync
    FROM instagram_sync_history
    GROUP BY user_id
) sync_history ON ic.user_id = sync_history.user_id;

-- 13. Insertar datos de configuración inicial
INSERT INTO instagram_connections (user_id, instagram_user_id, username, account_type, is_active, created_at)
VALUES ('demo-user', 'demo-instagram-id', 'demo_account', 'PERSONAL', false, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 14. Comentarios para documentación
COMMENT ON TABLE instagram_connections IS 'Almacena las conexiones de usuarios con sus cuentas de Instagram';
COMMENT ON TABLE instagram_sync_history IS 'Historial de sincronizaciones entre DS y Instagram';
COMMENT ON TABLE instagram_publish_queue IS 'Cola de publicaciones pendientes para Instagram';
COMMENT ON COLUMN social_posts.instagram_id IS 'ID único del post en Instagram';
COMMENT ON COLUMN social_posts.is_instagram_import IS 'Indica si el post fue importado desde Instagram';
COMMENT ON COLUMN social_posts.sync_status IS 'Estado de sincronización del post (local, synced, pending, error)';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
    -- Verificar columnas añadidas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_posts' 
        AND column_name = 'instagram_id'
    ) THEN
        RAISE NOTICE 'Migration completed successfully!';
        RAISE NOTICE 'Instagram integration tables and columns created.';
        RAISE NOTICE 'RLS policies configured.';
        RAISE NOTICE 'Indexes created for optimal performance.';
    ELSE
        RAISE EXCEPTION 'Migration failed! Instagram columns not found.';
    END IF;
END $$;
