// Test rápido del EmailService
import EmailService from './src/services/EmailService.js';

const testEmail = async () => {
  try {
    console.log('🧪 Probando EmailService...');
    
    const result = await EmailService.sendTestEmail({
      to: 'test@example.com' // Email de prueba
    });
    
    console.log('Resultado:', result);
    
    if (result.success) {
      console.log('✅ EmailService funcionando correctamente!');
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Error del test:', error);
  }
};

testEmail();
