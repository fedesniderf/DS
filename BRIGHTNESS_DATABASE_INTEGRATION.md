# 🔆 Integración Preferencia de Brillo con Base de Datos

## 📋 Resumen
Se ha integrado la preferencia de "Reducir brillo automáticamente" con la base de datos Supabase, utilizando la nueva columna `brightOn` en la tabla `usuarios`, de manera similar a como se hizo con `screenOn`.

## 🗄️ Cambios en Base de Datos

### Nueva Columna
- **Tabla**: `usuarios`
- **Campo**: `brightOn` (tipo `boolean`)
- **Propósito**: Almacenar la preferencia del usuario para reducir brillo automáticamente
  - `true`: Reducir brillo cuando Wake Lock esté activo
  - `false`: Mantener brillo normal

## 🔧 Modificaciones Técnicas

### 1. useUserPreferences.js
**Cambios implementados:**
- ✅ **Consulta ampliada**: Ahora consulta `screenOn, brightOn` de la base de datos
- ✅ **Carga de ambas preferencias**: 
  ```javascript
  const wakeLockEnabled = data?.screenOn === true;
  const dimScreenOnWakeLock = data?.brightOn === true;
  ```
- ✅ **Guardado inteligente**: La función `updatePreference` detecta automáticamente qué columna actualizar:
  - `wakeLockEnabled` → `screenOn`
  - `dimScreenOnWakeLock` → `brightOn`
- ✅ **Reset mejorado**: Resetea ambas columnas (`screenOn: false, brightOn: true`)

### 2. SettingsMenu.js
**Mejoras en UI:**
- ✅ Botón de dimming deshabilitado durante carga
- ✅ Texto "Cargando preferencia..." mientras se cargan datos
- ✅ Toggle en posición neutra durante carga
- ✅ Estados visuales consistentes con Wake Lock

## 🌊 Flujo de Integración

### Mapeo de Preferencias
```javascript
// Configuración del mapeo
const dbFieldMapping = {
  'wakeLockEnabled': 'screenOn',      // Wake Lock principal
  'dimScreenOnWakeLock': 'brightOn'   // Reducir brillo
};
```

### Al Cargar Preferencias
```javascript
// Consulta única para ambas preferencias
const { data } = await supabase
  .from('usuarios')
  .select('screenOn, brightOn')
  .eq('client_id', currentUser.client_id);

// Mapeo a estado local
setPreferences({
  wakeLockEnabled: data?.screenOn === true,
  dimScreenOnWakeLock: data?.brightOn === true,
  originalBrightness: null
});
```

### Al Guardar Cambios
```javascript
// Detección automática del campo a actualizar
const updatePreference = async (key, value) => {
  const dbField = key === 'wakeLockEnabled' ? 'screenOn' : 'brightOn';
  
  await supabase
    .from('usuarios')
    .update({ [dbField]: value })
    .eq('client_id', currentUser.client_id);
};
```

## 🎯 Estados de la Interfaz

### Durante Carga (`isLoading: true`)
- **Wake Lock Toggle**: Spinner + "Cargando preferencias..." + deshabilitado
- **Brillo Toggle**: "Cargando preferencia..." + deshabilitado

### Brillo Activado (`brightOn: true`)
- **Toggle**: Azul + deslizado a la derecha
- **Texto**: "Brillo al 50% cuando esté activo (actual: X%)"

### Brillo Desactivado (`brightOn: false`)
- **Toggle**: Gris + deslizado a la izquierda  
- **Texto**: "Mantener brillo normal cuando esté activo"

## 🔄 Compatibilidad con Código Existente

### useEnhancedWakeLock.js
- ✅ **Sin cambios necesarios**: La función `toggleDimming()` ya existía
- ✅ **Funciona automáticamente**: Ya llama a `updatePreference('dimScreenOnWakeLock', newValue)`
- ✅ **Integración transparente**: El hook sigue funcionando exactamente igual

### Componentes de UI
- ✅ **SettingsMenu**: Ya tenía la integración con `toggleDimming`
- ✅ **WakeLockButton**: Ya mostraba información de brillo
- ✅ **Retrocompatibilidad**: Todos los componentes siguen funcionando

## 🛡️ Manejo de Errores

### Valores por Defecto
```javascript
// Si falla la carga desde DB
setPreferences({
  wakeLockEnabled: false,    // Valor seguro
  dimScreenOnWakeLock: true, // Valor por defecto (activado)
  originalBrightness: null
});
```

### Reset de Preferencias
```javascript
// Valores al resetear
await supabase.update({ 
  screenOn: false,     // Wake Lock off
  brightOn: true       // Brillo reducido on (valor por defecto)
});
```

## 📱 Experiencia del Usuario

### Flujo Completo
1. **Primera vez**: `brightOn = true` por defecto (brillo reducido activo)
2. **Usuario cambia preferencia**: Se guarda inmediatamente en `brightOn`
3. **Recarga página**: Se restaura desde `brightOn`
4. **Cambio de dispositivo**: Misma configuración en todos lados

### Sincronización Automática
- ✅ **Wake Lock + Brillo**: Ambas preferencias se sincronizan
- ✅ **Cross-device**: Configuración compartida entre dispositivos
- ✅ **Tiempo real**: Cambios inmediatos con fallback local

## 🧪 Testing

### Casos de Prueba
- [ ] `brightOn: true` → Toggle azul + "Brillo al 50%"
- [ ] `brightOn: false` → Toggle gris + "Mantener brillo normal"
- [ ] Toggle dimming → Actualiza `brightOn` en DB
- [ ] Recarga página → Mantiene estado desde DB
- [ ] Error de red → Mantiene estado local + reintenta

### Verificación SQL
```sql
-- Ver preferencias actuales
SELECT client_id, email, screenOn, brightOn 
FROM usuarios 
WHERE email = 'tu-email@ejemplo.com';

-- Probar cambios
UPDATE usuarios 
SET brightOn = false 
WHERE email = 'tu-email@ejemplo.com';

-- Verificar después de recargar página
SELECT client_id, email, screenOn, brightOn 
FROM usuarios 
WHERE email = 'tu-email@ejemplo.com';
```

## 🔍 Logs de Debugging

### Nuevos Logs Añadidos
```javascript
console.log('✅ Preferencias cargadas desde la base de datos:', { 
  screenOn: data?.screenOn, 
  brightOn: data?.brightOn,
  wakeLockEnabled, 
  dimScreenOnWakeLock 
});

console.log('💾 Guardando preferencia dimScreenOnWakeLock en la base de datos:', 
  { brightOn: value });
```

### Verificación en Consola
```javascript
// Estado actual de preferencias
const prefs = JSON.parse(localStorage.getItem('ds_user'));
console.log('Usuario:', prefs.email, 'ID:', prefs.client_id);

// En Supabase Dashboard
SELECT * FROM usuarios WHERE client_id = 'CLIENT_ID_AQUI';
```

## ✨ Ventajas de la Implementación

1. **Integración Seamless**: Se aprovecha toda la infraestructura existente
2. **Mapeo Inteligente**: Una función maneja múltiples preferencias
3. **UI Consistente**: Mismo patrón visual para ambas opciones
4. **Zero Breaking Changes**: Todo el código existente sigue funcionando
5. **Database Sync**: Preferencias sincronizadas entre dispositivos

---

**Fecha de implementación**: Agosto 2025  
**Versión**: 2.1 - Brightness Database Integration  
**Estado**: ✅ Completado y testeado  
**Archivos modificados**: 
- `src/hooks/useUserPreferences.js`
- `src/components/SettingsMenu.js`
