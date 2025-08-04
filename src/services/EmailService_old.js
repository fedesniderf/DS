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
            .button { 
              background-color: #3b82f6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block;
              margin: 20px 0;
            }
            .routine-box {
              margin: 20px 0; 
              padding: 15px; 
              background-color: #dbeafe; 
              border-left: 4px solid #3b82f6;
              border-radius: 4px;
            }
            .emoji { font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🏋️‍♂️ DS Entrenamiento</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <h2 style="color: #1f2937;">¡Hola ${userName || 'Usuario'}!</h2>
              
              <h3 style="color: #3b82f6;">${title}</h3>
              
              <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                ${message}
              </p>
              
              ${routineId ? `
                <div class="routine-box">
                  <p style="margin: 0; color: #1e40af;">
                    <strong>💪 ¡Inicia sesión para ver tu nueva rutina!</strong>
                  </p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}" class="button">
                  🚀 Acceder a la aplicación
                </a>
              </div>
              
              <div style="margin-top: 30px; padding: 15px; background-color: #ecfccb; border-left: 4px solid #84cc16; border-radius: 4px;">
                <p style="margin: 0; color: #365314; font-size: 14px;">
                  <strong>💡 Consejo:</strong> Para obtener los mejores resultados, sigue tu rutina de entrenamiento de manera consistente y no olvides descansar adecuadamente.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p>Este es un mensaje automático de DS Entrenamiento.</p>
              <p>No responder a este email.</p>
              <p style="margin-top: 10px;">
                Si tienes preguntas, contacta a tu entrenador personal.
              </p>
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
        console.error('❌ Error enviando email con Resend:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email enviado exitosamente:', data);
      return { success: true, data };

    } catch (error) {
      console.error('💥 Error inesperado enviando email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail({ to, userName }) {
    return await this.sendNotificationEmail({
      to,
      subject: '¡Bienvenido a DS Entrenamiento! 🎯',
      title: '¡Bienvenido a tu nueva aventura fitness!',
      message: `Hola ${userName || 'Usuario'}, nos complace darte la bienvenida a DS Entrenamiento. Estamos aquí para ayudarte a alcanzar tus objetivos de fitness de manera efectiva y segura.`,
      userName
    });
  },

  /**
   * Enviar email de rutina próxima a vencer (para admins)
   */
  async sendRoutineExpiringEmail({ to, adminName, clientName, routineName, daysRemaining }) {
    return await this.sendNotificationEmail({
      to,
      subject: `⏰ Rutina próxima a vencer - ${clientName}`,
      title: '⚠️ Rutina próxima a vencer',
      message: `Hola ${adminName}, la rutina "${routineName}" del cliente ${clientName} vence en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}. Es momento de planificar y crear la siguiente rutina para mantener el progreso del cliente.`,
      userName: adminName
    });
  },

  /**
   * Probar envío de email (función de testing)
   */
  async sendTestEmail({ to }) {
    return await this.sendNotificationEmail({
      to,
      subject: '🧪 Email de prueba - DS Entrenamiento',
      title: '✅ Configuración de email funcionando',
      message: 'Este es un email de prueba para verificar que el servicio de notificaciones por email está funcionando correctamente. Si recibes este mensaje, ¡todo está configurado perfectamente!',
      userName: 'Tester'
    });
  }
};

export default EmailService;
