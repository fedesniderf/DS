# 📧 Sistema de Emails - Guía de Uso

## ✅ **Estado Actual**
- **Problema de CORS resuelto** ✅
- **Servidor proxy funcionando** ✅  
- **EmailService actualizado** ✅
- **Sistema listo para usar** ✅

## 🚀 **Para usar el sistema de emails:**

### 1. Iniciar ambos servidores

#### Opción A: Manual (recomendado para desarrollo)
```bash
# Terminal 1 - Servidor de emails
npm run start:email

# Terminal 2 - Aplicación React  
npm start
```

#### Opción B: Automático
```bash
npm run start:all
```

### 2. Verificar que ambos estén corriendo
- ✅ React App: `http://localhost:3000`
- ✅ Email Server: `http://localhost:3001`

### 3. Probar el sistema
1. Abre la aplicación en `http://localhost:3000`
2. Inicia sesión como administrador
3. Haz clic en el centro de notificaciones (🔔)
4. Selecciona "⚙️ Testing" → "📧 Probar Email"
5. Ingresa tu email y verifica la bandeja de entrada

## 🔧 **Arquitectura del Sistema**

```
┌─────────────────┐    HTTP Request    ┌─────────────────┐    API Call    ┌─────────────────┐
│   React App     │ ──────────────────▶ │  Email Server   │ ─────────────▶ │  Resend API     │
│ (localhost:3000)│                    │ (localhost:3001)│               │                 │
└─────────────────┘                    └─────────────────┘               └─────────────────┘
```

### ¿Por qué esta arquitectura?
- **CORS**: El navegador bloquea llamadas directas a APIs externas
- **Seguridad**: La API key de Resend se mantiene en el servidor
- **Flexibilidad**: Podemos agregar validaciones y lógica adicional

## 📁 **Archivos principales**

- **`email-server.js`**: Servidor proxy que maneja las llamadas a Resend
- **`src/services/EmailService.js`**: Cliente que llama al servidor proxy
- **`src/services/NotificationService.js`**: Integra emails con notificaciones
- **`src/components/NotificationCenter.js`**: UI para probar emails

## ⚙️ **Configuración**

### Variables de entorno (`.env.local`)
```env
REACT_APP_RESEND_API_KEY=re_tu_api_key_aqui
REACT_APP_FROM_EMAIL=onboarding@resend.dev
REACT_APP_FROM_NAME=DS Entrenamiento
REACT_APP_APP_URL=http://localhost:3000
```

### API Key en el servidor
El archivo `email-server.js` usa directamente la API key. En producción, deberías usar variables de entorno del servidor.

## 🧪 **Funciones disponibles**

### EmailService
- ✅ `sendNotificationEmail()` - Email genérico con template HTML
- ✅ `sendWelcomeEmail()` - Email de bienvenida
- ✅ `sendRoutineExpiringEmail()` - Alertas de rutinas por vencer
- ✅ `sendTestEmail()` - Email de prueba

### NotificationService  
- ✅ `sendEmailNotification()` - Integra emails con notificaciones
- ✅ `checkExpiringRoutines()` - Verifica y notifica rutinas por vencer

## 🚨 **Solución de problemas**

### Email Server no inicia
```bash
# Verificar que el puerto 3001 esté libre
netstat -an | findstr :3001

# Reiniciar el servidor
npm run start:email
```

### React App muestra errores de CORS
- ✅ **Solucionado**: Ahora usa el servidor proxy
- Verifica que el email server esté corriendo en puerto 3001

### Emails no llegan
1. Verifica que ambos servidores estén corriendo
2. Revisa la consola del navegador para errores
3. Revisa la consola del email server para logs
4. Verifica tu bandeja de spam

## 🎯 **Próximos pasos**

1. **Producción**: Configurar variables de entorno del servidor
2. **Seguridad**: Agregar autenticación al endpoint del email server
3. **Escalabilidad**: Considerar usar una cola de emails para volumen alto
4. **Monitoreo**: Agregar logs más detallados y métricas

---

## 🎉 **¡El sistema está completamente funcional!**

Ahora puedes enviar emails automáticamente cuando:
- ✅ Se asignen rutinas a clientes
- ✅ Las rutinas estén próximas a vencer  
- ✅ Se registren nuevos usuarios
- ✅ Cualquier otra notificación del sistema
