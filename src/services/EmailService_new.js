import { Resend } from 'resend';

// Configurar Resend con variables de React
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

export const EmailService = {
  /**
   * Enviar notificación por email usando Resend
   */
  async sendNotificationEmail({ to, subject, title, message, userName, routineId }) {
    try {
      console.log('📧 Enviando email con Resend...', { to, subject });

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

      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Error enviando email:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email enviado exitosamente:', data?.id);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Error inesperado enviando email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Enviar email de bienvenida a nuevos usuarios
   */
  async sendWelcomeEmail({ to, userName }) {
    const appUrl = process.env.REACT_APP_APP_URL || 'http://localhost:3000';
    const fromEmail = process.env.REACT_APP_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.REACT_APP_FROM_NAME || 'DS Entrenamiento';

    return this.sendNotificationEmail({
      to,
      subject: `¡Bienvenido a ${fromName}!`,
      title: '¡Bienvenido a tu plataforma de entrenamiento!',
      message: `Nos alegra que te hayas unido a ${fromName}. Tu cuenta ha sido creada exitosamente y ya puedes comenzar a disfrutar de nuestros servicios de entrenamiento personalizado.`,
      userName
    });
  },

  /**
   * Enviar email sobre rutina próxima a vencer
   */
  async sendRoutineExpiringEmail({ to, userName, routineName, expiryDate, routineId }) {
    const appUrl = process.env.REACT_APP_APP_URL || 'http://localhost:3000';
    const fromEmail = process.env.REACT_APP_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.REACT_APP_FROM_NAME || 'DS Entrenamiento';

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
    const appUrl = process.env.REACT_APP_APP_URL || 'http://localhost:3000';
    const fromEmail = process.env.REACT_APP_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.REACT_APP_FROM_NAME || 'DS Entrenamiento';

    return this.sendNotificationEmail({
      to,
      subject: '🧪 Email de Prueba - Sistema de Notificaciones',
      title: '🧪 ¡Prueba Exitosa!',
      message: `Este es un email de prueba enviado desde ${fromName}. Si recibes este mensaje, significa que el sistema de notificaciones por email está funcionando correctamente. Fecha y hora: ${new Date().toLocaleString()}`
    });
  }
};

export default EmailService;
