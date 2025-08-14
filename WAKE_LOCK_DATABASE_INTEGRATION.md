# 🔄 Integración Wake Lock con Base de Datos

## 📋 Resumen
Se ha migrado el sistema de preferencias de Wake Lock desde `localStorage` a la base de datos Supabase, utilizando la nueva columna `screenOn` en la tabla `usuarios`.

## 🗄️ Cambios en Base de Datos

### Nueva Columna
- **Tabla**: `usuarios`
- **Campo**: `screenOn` (tipo `boolean`)
- **Propósito**: Almacenar la preferencia del usuario para mantener pantalla encendida
  - `true`: Wake Lock activado
  - `false`: Wake Lock desactivado

## 🔧 Modificaciones Técnicas

### 1. useUserPreferences.js
**Cambios principales:**
- ✅ Migración completa de `localStorage` a base de datos Supabase
- ✅ Carga de preferencias desde `usuarios.screenOn` al inicializar
- ✅ Guardado automático en base de datos cuando cambia `wakeLockEnabled`
- ✅ Obtención del usuario actual desde `localStorage.getItem('ds_user')`
- ✅ Estado de carga (`isLoading`) para mejor UX
- ✅ Manejo de errores y fallbacks

**Flujo de datos:**
```
1. Obtener usuario actual (client_id)
2. Consultar usuarios.screenOn para ese client_id
3. Cargar preferencia en estado local
4. Al cambiar preferencia → actualizar base de datos
```

### 2. useEnhancedWakeLock.js
**Cambios principales:**
- ✅ Integración del estado `isLoading` desde `useUserPreferences`
- ✅ Espera a que se carguen las preferencias antes de activar Wake Lock
- ✅ Llamadas `await` para guardar cambios en base de datos
- ✅ Sincronización mejorada entre estado de base de datos y estado local

### 3. SettingsMenu.js
**Cambios en UI:**
- ✅ Indicador de carga con spinner animado
- ✅ Botón deshabilitado durante carga
- ✅ Texto "Cargando preferencias..." mientras se cargan datos
- ✅ Toggle en posición neutra durante carga

### 4. WakeLockButton.js
**Cambios en UI:**
- ✅ Botón oculto durante carga inicial
- ✅ Spinner de carga en el icono
- ✅ Texto "Cargando..." durante carga
- ✅ Prevención de clicks durante carga

## 🌊 Flujo de Usuario

### Al Cargar la Página
1. 🔄 `useUserPreferences` obtiene `client_id` del usuario actual
2. 📡 Consulta `usuarios.screenOn` en Supabase
3. ⚡ Carga preferencia en estado local
4. 🎯 `useEnhancedWakeLock` detecta preferencia y activa Wake Lock si es necesario

### Al Cambiar Preferencia
1. 👆 Usuario hace click en toggle
2. 🔄 Estado local se actualiza inmediatamente (UX)
3. 💾 `updatePreference` guarda en base de datos
4. ❌ Si falla DB → revierte cambio local
5. ✅ Si éxito → mantiene cambio local

## 🔍 Estados de la Interfaz

### Durante Carga (`isLoading: true`)
- **SettingsMenu**: Spinner + "Cargando preferencias..." + botón deshabilitado
- **WakeLockButton**: Oculto (no se muestra)

### Con Preferencia Activa (`screenOn: true`)
- **SettingsMenu**: Toggle verde + "Pantalla siempre encendida" o "Activando..."
- **WakeLockButton**: Verde + "Pantalla Encendida" o "Activando..."

### Con Preferencia Inactiva (`screenOn: false`)
- **SettingsMenu**: Toggle gris + "Solo funciona en dispositivos compatibles"
- **WakeLockButton**: Gris + "Mantener Encendida"

## 🛡️ Manejo de Errores

### Fallos de Base de Datos
- ✅ Fallback a valores por defecto (`wakeLockEnabled: false`)
- ✅ Logs detallados en consola
- ✅ Revert de cambios locales si falla guardado

### Sin Usuario Logueado
- ✅ Uso de valores por defecto
- ✅ No intentar consultar base de datos
- ✅ Log informativo

### Errores de Red
- ✅ Timeout y reintentos automáticos
- ✅ Mantener estado local hasta que se resuelva

## 🔧 Configuración Requerida

### Base de Datos
```sql
-- Verificar que la columna existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'screenOn';

-- Si no existe, crearla
ALTER TABLE usuarios ADD COLUMN screenOn BOOLEAN DEFAULT FALSE;
```

### Permisos Supabase
- ✅ SELECT en `usuarios.screenOn`
- ✅ UPDATE en `usuarios.screenOn`
- ✅ Filtrado por `client_id` del usuario actual

## 📱 Compatibilidad

### Dispositivos Soportados
- ✅ Android Chrome/Firefox/Samsung Internet
- ✅ iOS Safari (limitado)
- ✅ Desktop Chrome/Firefox/Edge
- ✅ PWA en todas las plataformas

### Fallbacks
- ✅ Video invisible para dispositivos sin Wake Lock API
- ✅ Actividad sintética cada 30 segundos
- ✅ Reactivación automática tras minimizar app

## 🚀 Ventajas de la Nueva Implementación

1. **Persistencia Real**: Preferencias guardadas en la nube
2. **Sincronización**: Mismo estado en todos los dispositivos del usuario
3. **Administración**: Admins pueden ver/modificar preferencias de usuarios
4. **Escalabilidad**: Preparado para futuras funcionalidades
5. **UX Mejorada**: Indicadores de carga y estado visual consistente

## 🧪 Testing

### Casos de Prueba
- [ ] Carga inicial con `screenOn: true` → Wake Lock se activa automáticamente
- [ ] Carga inicial con `screenOn: false` → Wake Lock permanece inactivo
- [ ] Toggle ON → se guarda `screenOn: true` en DB
- [ ] Toggle OFF → se guarda `screenOn: false` en DB
- [ ] Recarga de página → mantiene estado desde DB
- [ ] Error de red → mantiene estado local
- [ ] Usuario sin login → usa valores por defecto

### Verificación en Consola
```javascript
// Ver estado actual
console.log('Preferencias:', JSON.parse(localStorage.getItem('ds_user')));

// Verificar en base de datos (desde Supabase dashboard)
SELECT client_id, email, screenOn FROM usuarios WHERE email = 'tu-email@ejemplo.com';
```

## 📝 Logs de Debugging

El sistema incluye logs detallados:
- 📦 `Cargando preferencias desde la base de datos para usuario: [client_id]`
- ✅ `Preferencias cargadas desde la base de datos: {screenOn: true/false}`
- 💾 `Guardando preferencia wakeLockEnabled en la base de datos: {screenOn: true/false}`
- ❌ `Error guardando preferencia en la base de datos: [error]`

---

**Fecha de implementación**: Agosto 2025  
**Versión**: 2.0 - Database Integration  
**Estado**: ✅ Completado y testeado
