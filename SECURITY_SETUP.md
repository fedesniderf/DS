# 🔒 Configuración de Seguridad - DS Entrenamiento

## Nuevas Características de Seguridad Implementadas

### ✅ 1. Cierre Automático por Inactividad (2 horas)
- **Funcionalidad**: La sesión se cierra automáticamente después de 2 horas de inactividad
- **Advertencia**: El usuario recibe una alerta 5 minutos antes del cierre
- **Actividad**: Se detecta mediante movimientos del mouse, clics, teclado, scroll y toques
- **Reset**: El timer se resetea automáticamente con operaciones importantes (navegación, cambios, etc.)

### ✅ 2. Bloqueo por Intentos Fallidos (10 intentos)
- **Funcionalidad**: Después de 10 intentos fallidos, la cuenta se bloquea por 30 minutos
- **Advertencias**: Se muestran avisos cuando quedan 3 intentos o menos
- **Base de datos**: Se registran todos los intentos en la tabla `login_attempts`
- **Auto-desbloqueo**: El bloqueo expira automáticamente después de 30 minutos

### ✅ 3. Panel de Administración de Usuarios Bloqueados
- **Funcionalidad**: Los administradores pueden ver todos los usuarios bloqueados
- **Ubicación**: Disponible en la sección "Clientes" para administradores
- **Información**: Muestra motivo del bloqueo, intentos fallidos y tiempo restante
- **Acciones**: Permite desbloquear manualmente cuentas bloqueadas

### ✅ 4. Bloqueo Manual de Cuentas por Administrador
- **Funcionalidad**: Los administradores pueden bloquear manualmente cualquier cuenta
- **Duración**: Los bloqueos manuales son **indefinidos** hasta que sean desbloqueados
- **Ubicación**: Disponible en el modal "Gestionar Usuario" y panel de usuarios bloqueados
- **Base de datos**: Se almacenan con `locked_until = null` para indicar duración indefinida
- **Mensaje diferenciado**: Los usuarios ven un mensaje específico cuando fueron bloqueados por un admin

## 🚀 Configuración Requerida en Supabase

### Paso 1: Crear la tabla de intentos de login

1. **Accede al SQL Editor de Supabase**
2. **Ejecuta el siguiente script SQL:**

```sql
-- Crear la tabla login_attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    failed_attempts INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    last_attempt TIMESTAMP WITH TIME ZONE,
    locked_until TIMESTAMP WITH TIME ZONE, -- NULL para bloqueos indefinidos
    last_successful_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Nuevos campos para administración
    locked_by_admin BOOLEAN DEFAULT FALSE,
    admin_email VARCHAR(255), -- Email del admin que realizó el bloqueo
    lock_reason TEXT -- Motivo del bloqueo (automático o manual)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked ON public.login_attempts(is_locked, locked_until);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_login_attempts_updated_at 
    BEFORE UPDATE ON public.login_attempts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Política temporal (permitir todo acceso)
CREATE POLICY "Users can manage their own login attempts" ON public.login_attempts
    FOR ALL USING (true);

-- Función auxiliar para compatibilidad
CREATE OR REPLACE FUNCTION create_login_attempts_table()
RETURNS void AS $$
BEGIN
    RETURN;
END;
$$ LANGUAGE plpgsql;
```

### Paso 2: Verificar la configuración

1. **Verifica que la tabla se creó correctamente:**
   ```sql
   SELECT * FROM public.login_attempts LIMIT 5;
   ```

2. **Verifica los índices:**
   ```sql
   SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'login_attempts';
   ```

## 🎛️ Características de la Interfaz

### Menu de Configuración Mejorado
- **Nueva sección de Seguridad** con dos opciones:
  - **Cambiar Contraseña**: Funcionalidad existente mejorada
  - **Información de Seguridad**: Modal informativo sobre las políticas implementadas

### Modal de Información de Seguridad
- Explica las políticas de auto-logout
- Detalla el sistema de bloqueo por intentos fallidos
- Proporciona consejos de seguridad
- Diseño visual claro con iconos y colores

## 🔧 Componentes Agregados

### Archivos Nuevos:
1. **`src/hooks/useInactivityTimeout.js`** - Hook para manejo de inactividad
2. **`src/services/LoginSecurityService.js`** - Servicio para gestión de intentos fallidos
3. **`src/components/SecurityInfoModal.jsx`** - Modal informativo de seguridad
4. **`create_login_attempts_table.sql`** - Script SQL para Supabase

### Archivos Modificados:
1. **`src/App.js`** - Integración de hooks de seguridad y lógica de login mejorada con bloqueos indefinidos
2. **`src/components/SettingsMenu.js`** - Sección de seguridad expandida
3. **`src/services/LoginSecurityService.js`** - Servicios de administración y bloqueos indefinidos
4. **`src/components/ResetPasswordModal.js`** - Gestión manual de bloqueos por administradores
5. **`src/components/BlockedUsersPanel.jsx`** - Panel completo de administración de usuarios bloqueados

## ⚡ Funciones Implementadas

### Hook de Inactividad:
```javascript
const { resetInactivityTimer } = useInactivityTimeout(
  2 * 60 * 60 * 1000, // 2 horas
  handleInactivityLogout,
  !!currentUser // Solo activo cuando hay usuario logueado
);
```

### Servicio de Seguridad:
```javascript
// Verificar bloqueo antes del login (actualizado para bloqueos indefinidos)
const lockStatus = await LoginSecurityService.checkAccountLock(email);

// Registrar intento fallido
const failureStatus = await LoginSecurityService.recordFailedAttempt(email);

// Resetear intentos después de login exitoso
await LoginSecurityService.resetFailedAttempts(email);

// NUEVOS MÉTODOS DE ADMINISTRACIÓN:

// Bloquear cuenta manualmente (indefinido)
await LoginSecurityService.adminLockAccount(email);

// Desbloquear cuenta manualmente
await LoginSecurityService.adminUnlockAccount(email);

// Obtener información de bloqueo para administradores
const info = await LoginSecurityService.getAdminUserLockInfo(email);

// Obtener todos los usuarios bloqueados
const blockedUsers = await LoginSecurityService.getAdminAllBlockedUsers();
```

## 🔄 Reset Automático de Timer

El timer de inactividad se resetea automáticamente en:
- Login exitoso
- Navegación entre páginas
- Operaciones importantes (cambios de rutina, contraseña, etc.)
- Actividad del usuario (mouse, teclado, touch)

## ⚠️ Consideraciones de Seguridad

1. **Almacenamiento Local**: Las credenciales no se almacenan en localStorage
2. **Timeouts**: Los timeouts son configurables según necesidades
3. **Base de Datos**: Los intentos fallidos se registran de manera segura
4. **Políticas RLS**: Se recomienda configurar políticas más restrictivas según el caso de uso

## 🧪 Pruebas Recomendadas

### Pruebas Básicas:
1. **Probar auto-logout**: Dejar la aplicación inactiva por 2 horas
2. **Probar bloqueo automático**: Intentar login con credenciales incorrectas 10 veces
3. **Verificar alertas**: Confirmar que aparecen las advertencias apropiadas
4. **Probar desbloqueo automático**: Esperar 30 minutos después del bloqueo
5. **Verificar reset**: Confirmar que los intentos se resetean después de login exitoso

### Pruebas de Administración:
6. **Bloqueo manual**: Como admin, bloquear manualmente una cuenta desde "Gestionar Usuario"
7. **Verificar bloqueo indefinido**: Intentar login con la cuenta bloqueada manualmente
8. **Panel de usuarios bloqueados**: Verificar que aparece en la lista con "Indefinido"
9. **Desbloqueo manual**: Como admin, desbloquear la cuenta manualmente
10. **Verificar desbloqueo**: Confirmar que el usuario puede volver a ingresar
11. **Distinción de mensajes**: Verificar que los mensajes son diferentes para bloqueos automáticos vs manuales

## 📱 Compatibilidad

- ✅ Funciona en navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Compatible con dispositivos móviles
- ✅ Mantiene funcionalidad offline (timer local)
- ✅ Integración completa con sistema existente

---

## 🆕 Últimas Actualizaciones (Agosto 2025)

### Sistema de Bloqueo Indefinido por Administrador
- ✅ **Bloqueo manual**: Los administradores pueden bloquear cuentas indefinidamente
- ✅ **Base de datos mejorada**: Soporte para `locked_until = null` (indefinido)
- ✅ **Panel de administración**: Visualización completa de usuarios bloqueados
- ✅ **Mensajes diferenciados**: Los usuarios ven mensajes específicos según el tipo de bloqueo
- ✅ **Verificación de login**: Sistema actualizado para manejar bloqueos indefinidos correctamente

### Funcionalidades Clave Implementadas:
1. **Botón de bloqueo manual** en modal "Gestionar Usuario"
2. **Panel de usuarios bloqueados** con acciones de administrador
3. **Detección automática** de bloqueos indefinidos vs temporales
4. **Mensajes personalizados** para cada tipo de bloqueo
5. **Verificación robusta** en el proceso de autenticación

**Nota**: Recuerda configurar la tabla en Supabase antes de utilizar las nuevas características de seguridad.
