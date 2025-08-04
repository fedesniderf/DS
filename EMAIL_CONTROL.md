# 📧 Control de Emails - Guía de Uso

## 🔇 **Estado Actual: EMAILS PAUSADOS**

Los emails están actualmente **pausados** para evitar el envío accidental de correos durante el desarrollo y testing. Solo se mostrarán las notificaciones dentro de la aplicación.

## 🚫 **¿Qué está pausado?**

- ✅ **Notificaciones en la app** - Funcionan normalmente
- 🔇 **Emails de bienvenida** - Pausados
- 🔇 **Emails de rutinas asignadas** - Pausados  
- 🔇 **Emails de rutinas próximas a vencer** - Pausados
- 🔇 **Emails de prueba** - Pausados

## 🔄 **Cómo reactivar los emails**

### Opción 1: Activación permanente
1. Abre el archivo: `src/services/NotificationService.js`
2. Busca la línea: `const EMAIL_ENABLED = false;`
3. Cámbiala a: `const EMAIL_ENABLED = true;`
4. Guarda el archivo
5. La aplicación se actualizará automáticamente

### Opción 2: Activación temporal para pruebas
Si solo quieres probar emails sin cambiar la configuración permanente, puedes:
1. Comentar la línea actual
2. Agregar una línea temporal
```javascript
// const EMAIL_ENABLED = false; // Pausado por defecto
const EMAIL_ENABLED = true; // Temporal para pruebas
```

## 🎯 **Verificar el estado actual**

### En la interfaz (Solo administradores):
- Abre el centro de notificaciones (🔔)
- Si eres **admin** y los emails están pausados, verás un badge "🔇 Emails pausados"
- El botón de prueba dirá "🔇 Email Pausado" en lugar de "📧 Probar Email"
- Los botones de testing solo son visibles para administradores

### Para clientes:
- Los clientes ven un centro de notificaciones limpio
- No ven indicadores de estado de emails
- No ven botones de prueba o testing
- Solo ven sus notificaciones y funciones básicas

### En la consola:
- Las notificaciones mostrarán: `🔇 Envío de email pausado (EMAIL_ENABLED = false)`
- En lugar de: `📧 Enviando email de notificación...`

## 🧪 **Testing**

### Con emails pausados:
- Las notificaciones aparecen normalmente en la app
- No se envían emails reales
- El botón "Probar Email" mostrará un mensaje explicativo

### Con emails activados:
- Funciona todo el sistema completo
- Se envían emails reales
- Usa las funciones de prueba con cuidado

## 🔧 **Funciones que controlan esto**

```javascript
// En NotificationService.js
const EMAIL_ENABLED = false; // Configuración principal

// En createNotification()
if (sendEmail && EMAIL_ENABLED) {
  // Envía email
} else if (sendEmail && !EMAIL_ENABLED) {
  console.log('🔇 Envío de email pausado');
}

// En checkExpiringRoutines()
if (admin.email && EMAIL_ENABLED) {
  // Envía email al admin
} else if (admin.email && !EMAIL_ENABLED) {
  console.log('🔇 Envío pausado');
}
```

## 👥 **Experiencia por tipo de usuario**

### 👤 **Clientes (role: 'client')**
- ✅ Ven sus notificaciones normalmente
- ✅ Pueden marcar como leídas
- ✅ Botón "Marcar todas como leídas"
- ✅ Botón para cerrar el panel
- ❌ NO ven botones de testing
- ❌ NO ven indicadores de estado de emails
- ❌ NO ven herramientas de administración

### 👨‍💼 **Administradores (role: 'admin')**
- ✅ Todo lo que ven los clientes
- ✅ Botón "🧪 Prueba" para crear notificaciones de testing
- ✅ Menú "⚙️ Testing" con herramientas avanzadas
- ✅ Indicador "🔇 Emails pausados" (cuando corresponde)
- ✅ Botón "📧 Probar Email" o "🔇 Email Pausado"
- ✅ Acceso completo a funciones de debugging

## ⚠️ **Importante**

- Los emails están pausados por seguridad durante el desarrollo
- Las notificaciones dentro de la app funcionan normalmente
- Para producción, asegúrate de activar `EMAIL_ENABLED = true`
- Ten cuidado con las pruebas cuando reactives emails

## 🚀 **Para ir a producción**

1. Cambiar `EMAIL_ENABLED = true`
2. Verificar configuración de variables de entorno
3. Probar con emails reales
4. Verificar que el servidor proxy esté funcionando
5. Confirmar que Resend esté configurado correctamente

---

**Última actualización:** Agosto 2025  
**Estado:** Emails pausados por defecto para desarrollo seguro
