-- Script SQL para crear la tabla de intentos de login
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear la tabla login_attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    failed_attempts INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    last_attempt TIMESTAMP WITH TIME ZONE,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_successful_login TIMESTAMP WITH TIME ZONE,
    admin_unlocked BOOLEAN DEFAULT FALSE,
    admin_unlock_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar performance en consultas por email
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);

-- Crear índice para consultas por estado de bloqueo
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked ON public.login_attempts(is_locked, locked_until);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_login_attempts_updated_at 
    BEFORE UPDATE ON public.login_attempts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Política de seguridad RLS (Row Level Security)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Política para permitir operaciones solo en registros del mismo email
-- (esto requerirá ajustes según tu sistema de autenticación)
CREATE POLICY "Users can manage their own login attempts" ON public.login_attempts
    FOR ALL USING (true); -- Temporal: permitir todo acceso

-- Función auxiliar para crear la tabla desde la aplicación
CREATE OR REPLACE FUNCTION create_login_attempts_table()
RETURNS void AS $$
BEGIN
    -- Esta función ya no hace nada porque la tabla ya existe
    -- Solo existe para compatibilidad con el código JavaScript
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE public.login_attempts IS 'Tabla para rastrear intentos de login fallidos y bloqueos de cuenta';
COMMENT ON COLUMN public.login_attempts.email IS 'Email del usuario';
COMMENT ON COLUMN public.login_attempts.failed_attempts IS 'Número de intentos fallidos consecutivos';
COMMENT ON COLUMN public.login_attempts.is_locked IS 'Indica si la cuenta está bloqueada';
COMMENT ON COLUMN public.login_attempts.last_attempt IS 'Timestamp del último intento de login';
COMMENT ON COLUMN public.login_attempts.locked_until IS 'Timestamp hasta cuando está bloqueada la cuenta';
COMMENT ON COLUMN public.login_attempts.last_successful_login IS 'Timestamp del último login exitoso';
COMMENT ON COLUMN public.login_attempts.admin_unlocked IS 'Indica si fue desbloqueada manualmente por un administrador';
COMMENT ON COLUMN public.login_attempts.admin_unlock_timestamp IS 'Timestamp de cuando fue desbloqueada por el admin';
