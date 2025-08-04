# Configuración del Servicio de Email con Resend 📧

## ¿Qué es Resend?
Resend es un servicio moderno de email transaccional que permite enviar emails programáticamente de forma confiable y escalable.

## Paso 1: Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Haz clic en "Sign Up" y crea tu cuenta
3. Verifica tu email
4. Accede al dashboard

## Paso 2: Obtener API Key

1. En el dashboard de Resend, ve a "API Keys"
2. Haz clic en "Create API Key"
3. Dale un nombre descriptivo (ej: "DS-Entrenamiento-App")
4. Copia la API key generada (empieza con `re_`)

## Paso 3: Configurar dominio (Opcional pero recomendado)

### Para producción:
1. Ve a "Domains" en el dashboard
2. Agrega tu dominio (ej: `miapp.com`)
3. Configura los registros DNS según las instrucciones
4. Verifica el dominio

### Para desarrollo:
- Puedes usar el dominio por defecto de Resend
- Los emails se enviarán desde `onboarding@resend.dev`

## Paso 4: Configurar variables de entorno

Edita el archivo `.env.local` con tus datos:

```env
# Resend Email Service Configuration
RESEND_API_KEY=re_tu_api_key_aqui
FROM_EMAIL=tu-email@tudominio.com
FROM_NAME=DS Entrenamiento
```

### Valores para desarrollo:
```env
RESEND_API_KEY=re_tu_api_key_aqui
FROM_EMAIL=onboarding@resend.dev
FROM_NAME=DS Entrenamiento
```

## Paso 5: Probar la configuración

1. Inicia la aplicación: `npm start`
2. Inicia sesión como administrador
3. Abre el centro de notificaciones (🔔)
4. Haz clic en "⚙️ Testing"
5. Selecciona "📧 Probar Email"
6. Revisa tu bandeja de entrada

## Características implementadas

### ✅ Emails automáticos
- **Bienvenida**: Cuando un usuario se registra
- **Rutina asignada**: Cuando se asigna una rutina nueva
- **Rutina por vencer**: Notificación a admins 3 días antes

### ✅ Templates HTML incluidos
- Diseño responsive
- Estilo profesional
- Información clara y útil

### ✅ Funciones de prueba
- Envío de emails de prueba
- Verificación de rutinas por vencer
- Creación de datos de prueba

## Límites del plan gratuito de Resend

- **3,000 emails/mes** (perfecto para desarrollo y proyectos pequeños)
- Hasta **100 emails/día**
- Soporte completo de APIs
- Analytics básicos

## Solución de problemas

### ❌ "API key inválida"
- Verifica que la API key sea correcta
- Asegúrate de que no tenga espacios al inicio/final
- Reinicia la aplicación después de cambiar `.env.local`

### ❌ "Dominio no verificado"
- Si usas tu propio dominio, verifica que esté configurado correctamente
- Para desarrollo, usa `onboarding@resend.dev`

### ❌ "Email no llega"
- Revisa la carpeta de spam
- Verifica que el email destino sea válido
- Consulta los logs en el dashboard de Resend

## Estructura de archivos

```
src/
├── services/
│   ├── EmailService.js          # Servicio principal de email
│   └── NotificationService.js   # Integra email con notificaciones
├── components/
│   └── NotificationCenter.js    # UI con botones de prueba
└── utils/
    └── testRoutineExpiration.js # Utilidades de prueba
```

## Variables de entorno completas

```env
# Database (Supabase)
REACT_APP_SUPABASE_URL=tu_url_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_key_supabase

# Email Service (Resend)
RESEND_API_KEY=re_tu_api_key_aqui
FROM_EMAIL=tu-email@tudominio.com
FROM_NAME=DS Entrenamiento

# App Configuration
REACT_APP_APP_NAME=DS Entrenamiento
REACT_APP_APP_URL=http://localhost:3000
```

---

## 🚀 ¡Listo para usar!

Una vez configurado, tu aplicación podrá:
- ✅ Enviar emails de bienvenida automáticamente
- ✅ Notificar por email cuando se asignen rutinas
- ✅ Alertar a administradores sobre rutinas próximas a vencer
- ✅ Probar el sistema de emails desde la interfaz

### Próximos pasos sugeridos:
1. Personalizar los templates de email
2. Agregar más tipos de notificaciones
3. Implementar programación automática de verificaciones
4. Configurar webhooks para tracking de emails
