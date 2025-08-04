const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Resend
const resend = new Resend('re_NcNXp5hk_MZtHHJVxK3ED9o6NGz7mURqY');

// Endpoint para enviar emails
app.post('/api/send-email', async (req, res) => {
  try {
    const { from, to, subject, html } = req.body;

    console.log('📧 Enviando email via proxy server...', { to, subject });

    // Verificar si es un email de testing restringido
    const restrictedEmails = ['federicosch.fs@gmail.com'];
    if (!restrictedEmails.includes(to)) {
      console.warn('⚠️ Email restringido por Resend. Usando email de testing autorizado.');
      // En lugar de fallar, usar el email autorizado para testing
      const testingTo = 'federicosch.fs@gmail.com';
      
      const { data, error } = await resend.emails.send({
        from,
        to: [testingTo],
        subject: `[TESTING] ${subject} (Original: ${to})`,
        html: html + `<br><br><em>Este email era originalmente para: ${to}, pero se envió a ${testingTo} por restricciones de Resend.</em>`,
      });

      if (error) {
        console.error('❌ Error enviando email:', error);
        return res.status(400).json({ 
          success: false, 
          error: error.message,
          details: 'Email enviado al email de testing autorizado'
        });
      }

      console.log('✅ Email de prueba enviado a email autorizado:', data?.id);
      return res.json({ 
        success: true, 
        data,
        warning: `Email enviado a ${testingTo} por restricciones de Resend`
      });
    }

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      return res.status(400).json({ 
        success: false, 
        error: error.message || 'Error desconocido de Resend',
        details: error
      });
    }

    console.log('✅ Email enviado exitosamente:', data?.id);
    return res.json({ success: true, data });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error interno del servidor'
    });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Email Proxy Server' });
});

app.listen(port, () => {
  console.log(`🚀 Email proxy server corriendo en http://localhost:${port}`);
  console.log(`📧 Endpoint: http://localhost:${port}/api/send-email`);
});

module.exports = app;
