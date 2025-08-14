# 🔧 Fix Wake Lock Mobile - Mantener Activo al Minimizar App

## ❌ **Problema Identificado**

Cuando el usuario activaba "Mantener pantalla encendida" y luego minimizaba la app en móvil, al volver a la app la opción se había desactivado automáticamente.

## 🔍 **Causa Raíz**

- El Wake Lock se libera automáticamente cuando la app se minimiza (comportamiento normal del sistema)
- El hook anterior solo diferenciaba entre activación/desactivación manual pero no distinguía entre liberación manual del usuario vs liberación automática del sistema
- Solo escuchaba evento `visibilitychange` que no cubre todos los casos de minimización en móvil

## ✅ **Solución Implementada**

### 🎯 **1. Estado de Intención del Usuario**
```javascript
const [userIntendedActive, setUserIntendedActive] = useState(false);
```
- Rastrea si el usuario **quiere** que Wake Lock esté activo
- Se mantiene `true` incluso cuando el sistema libera automáticamente el Wake Lock
- Solo se pone `false` cuando el usuario desactiva manualmente

### 🔄 **2. Múltiples Eventos de Reactivación**
```javascript
// Eventos monitoreados:
- 'visibilitychange' // Cambio de pestaña/app
- 'focus'           // App recibe focus
- 'resize'          // Cambio de orientación móvil
- 'touchstart'      // Actividad del usuario
- 'mousedown'       // Actividad del usuario
- 'keydown'         // Actividad del usuario
```

### 💓 **3. Sistema de Heartbeat**
```javascript
// Verificación cada 10 segundos
- Detecta si Wake Lock se perdió inesperadamente
- Reactiva automáticamente si userIntendedActive = true
- Verifica tanto API nativa como fallback de video
```

### 🧠 **4. Lógica Mejorada en Event Listeners**
```javascript
wakeLockRef.current.addEventListener('release', () => {
  setIsWakeLockActive(false);
  // NO cambiar userIntendedActive - podría ser liberación del sistema
});
```

## 🎯 **Comportamiento Nuevo**

### **Escenario 1: Usuario activa Wake Lock**
1. ✅ `userIntendedActive = true`
2. ✅ `isWakeLockActive = true`
3. ✅ Heartbeat iniciado

### **Escenario 2: Usuario minimiza app**
1. 🔄 Sistema libera Wake Lock automáticamente
2. ✅ `userIntendedActive = true` (sin cambios)
3. ❌ `isWakeLockActive = false` (por liberación del sistema)
4. 💓 Heartbeat sigue activo detectando inconsistencia

### **Escenario 3: Usuario vuelve a la app**
1. 🔄 Eventos de reactivación se disparan
2. ✅ `userIntendedActive = true` → Reactivar Wake Lock
3. ✅ `isWakeLockActive = true` restaurado
4. 💓 Heartbeat verifica que todo funcione

### **Escenario 4: Usuario desactiva manualmente**
1. ❌ `userIntendedActive = false`
2. ❌ `isWakeLockActive = false`
3. 🛑 Heartbeat detenido

## 🛠️ **Funciones Nuevas Agregadas**

### **`startHeartbeat()`**
- Monitoreo continuo cada 10 segundos
- Detecta cuando Wake Lock se pierde sin intención del usuario
- Reactiva automáticamente si es necesario

### **`stopHeartbeat()`**
- Detiene el monitoreo cuando no es necesario
- Se ejecuta al desactivar manualmente o al cleanup

### **Estados de Debugging**
```javascript
return {
  // ... estados existentes
  userIntendedActive // Para debugging y control avanzado
}
```

## 🎉 **Resultado Final**

✅ **Problema resuelto**: Al minimizar la app y volver, Wake Lock se reactiva automáticamente

✅ **Sin efectos secundarios**: Mantiene toda la funcionalidad existente

✅ **Robusto**: Múltiples mecanismos de detección y reactivación

✅ **Eficiente**: Heartbeat solo activo cuando es necesario

---

**🔧 Archivos modificados:**
- `src/hooks/useEnhancedWakeLock.js` - Lógica principal mejorada

**⚡ Compatibilidad:**
- ✅ Mantiene interfaz pública existente
- ✅ No requiere cambios en componentes que usan el hook
- ✅ Funciona en todos los navegadores compatibles
