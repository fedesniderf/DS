-- PLAN B: Crear tabla temporal sin RLS
-- Solo si force_disable_rls.sql no funciona

-- 1. Crear tabla temporal sin RLS
CREATE TABLE social_posts_temp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255),
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. NO habilitar RLS en la tabla temporal
-- (por defecto está desactivado)

-- 3. Verificar que no tiene RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'social_posts_temp';

-- 4. Probar inserción
INSERT INTO social_posts_temp (user_id, content) VALUES ('test', 'Prueba temporal');

-- 5. Verificar
SELECT * FROM social_posts_temp;

SELECT 'Tabla temporal creada sin RLS' as status;
