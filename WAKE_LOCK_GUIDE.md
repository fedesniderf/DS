# 🔋 Wake Lock - Mantener Pantalla Encendida

## 🎯 **¿Qué es Wake Lock?**

Wake Lock es una funcionalidad que permite mantener la pantalla del dispositivo encendida mientras se usa la aplicación, evitando que se apague automáticamente debido a la falta de actividad. Es especialmente útil durante entrenamientos donde necesitas consultar la rutina sin tocar constantemente la pantalla.

## 🚀 **Funcionalidades Implementadas**

### 🔧 **Hook Personalizado: `useWakeLock`**
```javascript
const { isWakeLockActive, isSupported, toggleWakeLock } = useWakeLock();
```

**Características:**
- ✅ **Detección automática de compatibilidad** - Solo funciona en navegadores compatibles
- ✅ **Estado persistente** - Mantiene el estado durante la sesión
- ✅ **Auto-reactivación** - Se reactiva cuando vuelves a la app
- ✅ **Limpieza automática** - Se libera al cerrar o cambiar de página
- ✅ **Manejo de errores** - Gestión robusta de errores de la API

### 🎨 **Componente Visual: `WakeLockButton`**
- **Botón toggle intuitivo** - ON/OFF con colores distintivos
- **Iconos expresivos** - 🔆 (activo) / 🔋 (inactivo)
- **Responsive design** - Texto completo en desktop, abreviado en móvil
- **Estados visuales claros** - Verde cuando activo, gris cuando inactivo
- **Tooltips informativos** - Explican la funcionalidad

## 📱 **Compatibilidad**

### ✅ **Navegadores Compatibles:**
- Chrome 84+ (Android/Desktop)
- Edge 84+ (Android/Desktop)
- Opera 70+ (Android/Desktop)
- Safari 16.4+ (iOS/macOS)

### ❌ **No Compatible:**
- Firefox (aún no soporta Wake Lock API)
- Navegadores antiguos
- Algunos navegadores de apps embebidas

## 🎯 **Casos de Uso Ideales**

### 🏋️ **Durante Entrenamientos:**
- Ver rutinas sin que se apague la pantalla
- Consultar ejercicios entre series
- Seguir temporizadores de descanso
- Revisar técnicas y videos instructivos

### 📚 **Otras Situaciones:**
- Lectura prolongada de contenido
- Seguimiento de métricas en tiempo real
- Presentaciones o demostraciones
- Cualquier actividad que requiera pantalla constante

## 🔄 **Cómo Funciona**

### **Activación:**
1. Usuario hace clic en el botón 🔋
2. Se solicita Wake Lock al navegador
3. El botón cambia a estado activo 🔆
4. La pantalla permanece encendida

### **Desactivación:**
- **Manual:** Click en el botón 🔆
- **Automática:** Al cerrar pestaña/navegador
- **Sistema:** Si el SO lo requiere (batería baja, etc.)

### **Re-activación:**
- Si la app pierde visibilidad y vuelve a estar visible
- El sistema intentará reactivar automáticamente el Wake Lock
- El usuario será notificado del estado actual

## 🛠️ **Implementación Técnica**

### **Ubicación del Botón:**
```jsx
// En LayoutHeader.jsx
<WakeLockButton className="md:block" />
```

### **API Utilizada:**
```javascript
// Activar
navigator.wakeLock.request('screen');

// Desactivar
wakeLock.release();
```

### **Eventos Monitoreados:**
- `visibilitychange` - Para reactivación automática
- `release` - Para actualizar estado UI

## ⚡ **Rendimiento y Batería**

### **Impacto en Batería:**
- 🟡 **Moderado** - La pantalla consume más batería
- 🟢 **Optimizado** - Solo activo cuando el usuario lo solicita
- 🔄 **Inteligente** - Se desactiva automáticamente al salir

### **Recomendaciones:**
- Usar solo cuando sea necesario
- Desactivar al terminar el entrenamiento
- El botón es fácilmente accesible para toggle rápido

## 🔒 **Seguridad y Privacidad**

- ✅ **Sin permisos especiales** - No requiere permisos del usuario
- ✅ **Control total del usuario** - Fácil activación/desactivación
- ✅ **Sin datos enviados** - Funcionalidad completamente local
- ✅ **Respeta configuración del sistema** - No interfiere con configuraciones de ahorro de energía

## 🧪 **Testing**

### **Probar la Funcionalidad:**
1. Abrir la app en un dispositivo móvil compatible
2. Buscar el botón 🔋 en el header
3. Hacer clic para activar
4. Verificar que el ícono cambia a 🔆
5. Dejar el dispositivo sin tocar por más de 30 segundos
6. Confirmar que la pantalla permanece encendida

### **Verificar Compatibilidad:**
```javascript
if ('wakeLock' in navigator) {
  console.log('✅ Wake Lock API compatible');
} else {
  console.log('❌ Wake Lock API no compatible');
}
```

---

**Estado:** ✅ Implementado y funcional  
**Compatibilidad:** Navegadores modernos con Wake Lock API  
**Ubicación:** Header global de la aplicación  
**Uso recomendado:** Entrenamientos y actividades que requieren pantalla constante
