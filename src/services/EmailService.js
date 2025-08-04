// EmailService para envío de emails usando servidor proxy

const apiKey = process.env.REACT_APP_RESEND_API_KEY || 're_NcNXp5hk_MZtHHJVxK3ED9o6NGz7mURqY';

if (!process.env.REACT_APP_RESEND_API_KEY) {
  console.warn('⚠️ Usando API key hardcodeada para desarrollo. Configura REACT_APP_RESEND_API_KEY en .env.local');
}

// EmailService para envío de emails usando servidor proxy
export const EmailService = {
  /**
   * Enviar notificación por email usando servidor proxy
   */
  async sendNotificationEmail({ to, subject, title, message, userName, routineId }) {
    try {
      console.log('📧 Enviando email via proxy server...', { to, subject });

      const appUrl = process.env.REACT_APP_APP_URL || 'http://localhost:3000';
      const fromEmail = process.env.REACT_APP_FROM_EMAIL || 'onboarding@resend.dev';
      const fromName = process.env.REACT_APP_FROM_NAME || 'DS Entrenamiento';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .footer { background-color: #e5e7eb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; }
            .button { background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
            .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${fromName}</h1>
              <p>Sistema de Entrenamiento Deportivo</p>
            </div>
            
            <div class="content">
              <h2>${title || subject}</h2>
              
              ${userName ? `<p>Hola ${userName},</p>` : '<p>Hola,</p>'}
              
              <div class="highlight">
                <p>${message}</p>
              </div>
              
              ${routineId ? `
                <a href="${appUrl}/routine/${routineId}" class="button">
                  Ver Rutina
                </a>
              ` : ''}
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>Saludos,<br>
              El equipo de ${fromName}</p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático del sistema ${fromName}</p>
              <p>Visita: <a href="${appUrl}">${appUrl}</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Llamar al servidor proxy en lugar de Resend directamente
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: to,
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor proxy:', errorData);
        return { success: false, error: errorData.error || 'Error del servidor' };
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Email enviado exitosamente via proxy:', result.data?.id);
        return { success: true, data: result.data };
      } else {
        console.error('❌ Error enviando email:', result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('❌ Error inesperado enviando email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Enviar email de bienvenida a nuevos usuarios
   */
  async sendWelcomeEmail({ to, userName }) {
    return this.sendNotificationEmail({
      to,
      subject: `¡Bienvenido a DS Entrenamiento!`,
      title: '¡Bienvenido a tu plataforma de entrenamiento!',
      message: `Nos alegra que te hayas unido a DS Entrenamiento. Tu cuenta ha sido creada exitosamente y ya puedes comenzar a disfrutar de nuestros servicios de entrenamiento personalizado.`,
      userName
    });
  },

  /**
   * Enviar email sobre rutina próxima a vencer
   */
  async sendRoutineExpiringEmail({ to, userName, routineName, expiryDate, routineId }) {
    return this.sendNotificationEmail({
      to,
      subject: 'Rutina próxima a vencer - Acción requerida',
      title: '⏰ Rutina próxima a vencer',
      message: `La rutina "${routineName}" vencerá el ${expiryDate}. Es necesario crear una nueva rutina para el cliente ${userName} para mantener la continuidad del entrenamiento.`,
      userName: 'Administrador',
      routineId
    });
  },

  /**
   * Enviar email de prueba
   */
  async sendTestEmail({ to }) {
    return this.sendNotificationEmail({
      to,
      subject: '🧪 Email de Prueba - Sistema de Notificaciones',
      title: '🧪 ¡Prueba Exitosa!',
      message: `Este es un email de prueba enviado desde DS Entrenamiento. Si recibes este mensaje, significa que el sistema de notificaciones por email está funcionando correctamente. Fecha y hora: ${new Date().toLocaleString()}`
    });
  }
};

export default EmailService;
