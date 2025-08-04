-- Tabla para gestionar notificaciones del sistema
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'routine_created', 'routine_assigned', 'routine_updated', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  routine_id UUID REFERENCES rutinas(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Índices para optimizar consultas
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los administradores puedan crear notificaciones
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- Política para que los usuarios puedan marcar como leídas sus notificaciones
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
