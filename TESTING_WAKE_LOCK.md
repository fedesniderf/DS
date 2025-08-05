# 🧪 Guía de Testing - Wake Lock (Pantalla Siempre Encendida)

## 🚀 **Cómo Probar la Funcionalidad**

### **📱 PASO 1: Verificar en Dispositivo Móvil**

#### **Opción A: Con dispositivo físico (RECOMENDADO)**
1. **Conectar dispositivo móvil a la misma red WiFi que tu PC**
2. **Abrir navegador en el móvil** (Chrome, Safari, Edge)
3. **Navegar a:** `http://192.168.0.155:3002` 
   *(O la IP que muestre en tu terminal)*
4. **Iniciar sesión** en la aplicación

#### **Opción B: DevTools de Chrome (simulación)**
1. **Abrir:** `http://localhost:3002`
2. **Presionar F12** para abrir DevTools
3. **Click en ícono de móvil** (toggle device toolbar)
4. **Seleccionar un dispositivo móvil** (iPhone, Pixel, etc.)

### **📍 PASO 2: Localizar el Botón Wake Lock**

El botón debe aparecer en el **header superior** de la aplicación:

```
┌─────────────────────────────────────────┐
│  ←    App Title    🔋 OFF   🔔   👤     │ ← Aquí está el botón
└─────────────────────────────────────────┘
```

**Ubicación:** Entre el título y los otros botones del header  
**Estados:**
- 🔋 + "OFF" = Inactivo (pantalla puede apagarse)
- 🔆 + "ON" = Activo (pantalla siempre encendida)

### **⚡ PASO 3: Probar Activación**

1. **Click en el botón** 🔋
2. **Verificar cambio visual:**
   - Botón cambia de gris a verde
   - Ícono cambia de 🔋 a 🔆
   - Texto cambia de "OFF" a "ON"
3. **Verificar en consola del navegador:**
   ```
   🔆 Pantalla mantenida encendida
   ```

### **🕐 PASO 4: Probar que Funciona**

#### **Test Principal:**
1. **Activar Wake Lock** (botón verde 🔆)
2. **Dejar el dispositivo SIN TOCAR por 30-60 segundos**
3. **Verificar:** La pantalla NO debe apagarse
4. **Sin Wake Lock:** La pantalla se apagaría normalmente

#### **Test de Desactivación:**
1. **Click nuevamente en el botón** 🔆
2. **Verificar cambio:** Verde → Gris, 🔆 → 🔋
3. **Consola debe mostrar:** `🔋 Pantalla liberada`

### **🔍 PASO 5: Verificar Compatibilidad**

#### **Si el botón NO aparece:**
- El navegador no soporta Wake Lock API
- Probar con navegador diferente:
  - ✅ Chrome (Android/Desktop)
  - ✅ Safari (iOS 16.4+)
  - ✅ Edge
  - ❌ Firefox (no soportado aún)

#### **Verificar soporte manualmente:**
1. **Abrir consola del navegador** (F12)
2. **Ejecutar comando:**
   ```javascript
   console.log('wakeLock' in navigator ? '✅ Soportado' : '❌ No soportado');
   ```

### **📊 PASO 6: Tests Avanzados**

#### **Test de Re-activación:**
1. **Activar Wake Lock** 🔆
2. **Cambiar a otra pestaña** por unos segundos
3. **Regresar a la app**
4. **Verificar:** Debe reactivarse automáticamente

#### **Test de Persistencia:**
1. **Activar Wake Lock** 🔆
2. **Navegar a diferentes pantallas** de la app
3. **Verificar:** El botón debe mantener estado activo

#### **Test de Error Handling:**
1. **Activar Wake Lock** varias veces seguidas
2. **Verificar:** No debe generar errores
3. **Si hay error:** Debe mostrar mensaje informativo

### **🐛 PASO 7: Debugging**

#### **Si no funciona, verificar:**

1. **Consola de errores:**
   ```javascript
   // Buscar errores como:
   // "NotAllowedError: The request is not allowed"
   // "NotSupportedError: Wake Lock API not supported"
   ```

2. **Estado del navegador:**
   - ¿Está en modo incógnito? (puede no funcionar)
   - ¿Está la página en HTTPS? (requerido en algunos casos)
   - ¿El dispositivo tiene batería baja? (SO puede bloquear)

3. **Configuración del dispositivo:**
   - Verificar configuración de ahorro de energía
   - Verificar permisos del navegador

### **✅ PASO 8: Confirmar Éxito**

#### **Indicadores de que funciona correctamente:**

1. **Visual:**
   - ✅ Botón aparece en header
   - ✅ Cambia color y ícono al activar
   - ✅ Estados claros (ON/OFF)

2. **Funcional:**
   - ✅ Pantalla no se apaga con Wake Lock activo
   - ✅ Se puede activar/desactivar sin problemas
   - ✅ Se reactiva automáticamente

3. **Logs en consola:**
   ```
   🔆 Pantalla mantenida encendida
   🔋 Wake Lock liberado
   ```

### **📱 PASO 9: Test en Situación Real**

#### **Simulación de entrenamiento:**
1. **Abrir página de rutina** en la app
2. **Activar Wake Lock** 🔆
3. **Simular entrenamiento:**
   - Dejar dispositivo sobre mesa
   - Mirar ejercicios sin tocar pantalla
   - Esperar entre "series" por 1-2 minutos
4. **Verificar:** Pantalla permanece encendida todo el tiempo

---

## 🎯 **Resultado Esperado**

Al finalizar estas pruebas deberías tener:

- ✅ **Botón visible** en dispositivos compatibles
- ✅ **Funcionalidad activa** - pantalla no se apaga
- ✅ **Estados visuales claros** - ON/OFF obvios
- ✅ **Re-activación automática** funcionando
- ✅ **Sin errores** en consola

## 🚨 **Si Algo No Funciona**

1. **Verificar compatibilidad del navegador**
2. **Probar en dispositivo físico** (no solo simulador)
3. **Revisar configuración de ahorro de energía**
4. **Verificar logs en consola para errores específicos**

---

**URL de testing:** `http://localhost:3002` (desktop) o `http://192.168.0.155:3002` (móvil)  
**Navegadores recomendados:** Chrome Mobile, Safari iOS, Edge Mobile
