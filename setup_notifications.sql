-- Script para crear la tabla de notificaciones y configurar RLS
-- Ejecutar este script completo en el SQL Editor de Supabase

-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  routine_id BIGINT REFERENCES rutinas(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 3. Configurar RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;

-- 5. Política: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Política: Los usuarios pueden marcar como leídas sus propias notificaciones
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Política: Solo admins pueden crear notificaciones
CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Insertar una notificación de prueba (opcional - puedes comentar esto)
-- Reemplaza 'TU_USER_ID_AQUI' con un ID real de usuario de tu tabla usuarios
/*
INSERT INTO notifications (user_id, type, title, message)
VALUES (
  (SELECT id FROM usuarios WHERE role = 'client' LIMIT 1),
  'info',
  'Bienvenido al sistema de notificaciones',
  'Este es un mensaje de prueba para verificar que las notificaciones funcionan correctamente.'
);
*/
