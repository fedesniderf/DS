# Changelog - DS Training Management System

Todas las modificaciones importantes de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.0.0] - 2025-08-08

### ⭐ Características Principales
- **Sistema de configuración completo**: Implementación del `SettingsMenu` con todas las funcionalidades
- **Activación por foto de usuario**: Reemplazo del ícono de configuración por la foto del usuario como activador
- **Gestión de versiones**: Sistema completo de versionado automático con scripts de gestión
- **Configuración de desarrollo**: Utilidades avanzadas para debugging y testing

### ✅ Agregado
- `SettingsMenu.js` - Menú completo de configuración del usuario
- `ChangePasswordModal.js` - Modal para cambio de contraseña
- `SecurityInfoModal.js` - Panel de información de seguridad
- `BlockedUsersPanel.js` - Gestión de usuarios bloqueados
- `PhotoUpdateModal.js` - Modal para actualización de foto de perfil
- `EditUserModal.js` - Modal de edición de perfil de usuario
- `useEnhancedWakeLock.js` - Hook avanzado para Wake Lock con control de brillo
- `version.js` - Configuración centralizada de versiones
- `development.js` - Utilidades de desarrollo y debugging
- `version-manager.js` - Script automatizado de gestión de versiones
- Scripts npm para gestión de versiones (`npm run version:patch`, etc.)

### 🔄 Modificado
- `LayoutHeader.js` - Integración limpia con `SettingsMenu`, eliminación de lógica duplicada de avatar
- `package.json` - Actualización a versión 3.0.0 y agregado de scripts de versioning
- Estructura de imports/exports mejorada para evitar errores de tipo "Element type is invalid"

### 🗑️ Eliminado
- `SimpleSettingsMenu.js` - Reemplazado por `SettingsMenu` completo (archivo respaldado como .backup)
- Lógica duplicada de botón de avatar en `LayoutHeader.js`
- Imports/exports problemáticos que causaban errores de runtime

### 🐛 Corregido
- **Errores de runtime**: Resolución completa de "Element type is invalid" 
- **Problemas de imports**: Limpieza de la estructura de importación de componentes
- **Corrupción de archivos**: Prevención mediante sistema de respaldos
- **Inconsistencias de UI**: Estandarización del trigger de configuración

### 🔧 Técnico
- **Arquitectura**: Migración a componentes modulares con mejor separación de responsabilidades
- **Estado**: Gestión mejorada del estado de modales y configuraciones
- **Rendimiento**: Optimización de renders y gestión de memoria
- **Debugging**: Sistema completo de logs y utilidades de desarrollo
- **Versionado**: Implementación de semantic versioning con automatización

### 📚 Documentación
- `README.md` - Documentación completa del proyecto
- `version.json` - Changelog detallado con metadatos técnicos
- Comentarios de código mejorados en todos los componentes
- Guías de instalación y desarrollo

### 🔐 Seguridad
- Validación mejorada en modales de cambio de contraseña
- Panel de información de seguridad para usuarios
- Gestión segura de archivos de foto de perfil

---

## [2.1.0] - 2025-08-05

### ✨ Agregado
- **Panel de Administrador Rediseñado**: Dashboard profesional completo con diseño moderno
  - Fondo gradiente elegante (gris a azul suave)
  - Header mejorado con título y descripción
  - Iconos SVG profesionales en todas las secciones
  - Animaciones suaves y efectos hover
  - Diseño responsive (mobile-first)

- **Estadísticas en Tiempo Real**: Métricas dinámicas en el panel de administrador
  - **Clientes Activos**: Count automático de usuarios con role 'client'
  - **Rutinas Activas**: Count de rutinas vigentes (endDate >= fecha actual)
  - **Templates**: Count total de plantillas en rutinas_templates
  - Loading states con animación de pulso
  - Error handling independiente por consulta

### 🔧 Cambiado
- **Tabla de Clientes** (`UserManagementScreen.js`):
  - Eliminada columna "Email" para simplificar la vista
  - Centrados los títulos "Usuario" y "Acciones" 
  - Centrado el contenido de la columna "Acciones"
  - Resultado: Tabla más limpia con solo 2 columnas

### 🐛 Corregido
- **Bug Crítico en Rutinas Activas**: 
  - **Problema**: La métrica mostraba 0 cuando había rutinas vigentes
  - **Causa**: Query usaba `end_date` en lugar de `endDate` 
  - **Solución**: Corregido nombre de columna para usar camelCase
  - **Resultado**: Conteo correcto de rutinas activas

---

## [2.0.0] - 2025-08-04

### 🔒 Agregado - Sistema de Seguridad Completo
- **Cierre Automático por Inactividad**: 
  - Sesión se cierra automáticamente después de 2 horas de inactividad
  - Advertencia 5 minutos antes del cierre automático
  - Detección de actividad: mouse, clics, teclado, scroll y toques
  - Reset automático del timer con operaciones importantes

- **Bloqueo por Intentos Fallidos**:
  - Bloqueo automático después de 10 intentos fallidos
  - Bloqueo temporal de 30 minutos
  - Advertencias cuando quedan 3 intentos o menos
  - Registro completo en tabla `login_attempts`
  - Auto-desbloqueo después de 30 minutos

- **Panel de Administración de Usuarios Bloqueados**:
  - Vista completa de usuarios bloqueados para administradores
  - Información detallada: motivo, intentos fallidos, tiempo restante
  - Opción de desbloqueo manual para administradores
  - Integrado en la sección "Clientes"

- **Menú de Configuración**: Nuevo componente `SettingsMenu.js`
  - Botón de configuración con icono de ajustes
  - Menú desplegable responsive
  - Integración completa del Wake Lock con toggle visual
  - Opción de cerrar sesión integrada
  - Cierre automático al hacer clic fuera del menú
  - Estados visuales claros para cada opción

- **Fotos de Perfil de Usuario**:
  - Subida y almacenamiento de imágenes de perfil
  - Integración con Supabase Storage
  - Visualización en header y listas de usuarios
  - Fallback a iniciales cuando no hay foto
  - Auto-refresh al cambiar foto de perfil

### 🎨 Agregado - Mejoras de Interfaz Móvil
- **Iconos SVG Responsivos**: 
  - Reemplazo completo de emojis por iconos SVG profesionales
  - Iconos consistentes entre dispositivos
  - Tamaños optimizados para móvil (`w-4 h-4 sm:w-5 sm:h-5`)
  - Mejor rendimiento y legibilidad

---

## [1.0.0] - 2025-08-03

### ⭐ Lanzamiento Inicial
- Proyecto creado con Create React App
- Sistema de autenticación con Supabase
- Gestión básica de usuarios
- Configuración de Tailwind CSS
- Estructura básica de componentes

---

## Próximas Versiones

### [3.1.0] - Planificado
- **Temas personalizables**: Sistema de temas claro/oscuro
- **Configuración de notificaciones**: Panel avanzado de preferencias
- **Atajos de teclado**: Sistema de shortcuts personalizables
- **Backup/Restauración**: Funcionalidad de respaldo de configuración

### [3.2.0] - Planificado
- **Dashboard Analytics**: Métricas y estadísticas avanzadas
- **Integración de APIs**: Conectores con servicios externos
- **Sistema de plugins**: Arquitectura extensible
- **PWA**: Funcionalidades de Progressive Web App

### [4.0.0] - Futuro
- **Arquitectura de microservicios**: Migración a arquitectura distribuida
- **Sistema de tiempo real**: WebSockets y actualizaciones en vivo
- **Móvil nativo**: Aplicación móvil complementaria
- **IA/ML**: Integración de funcionalidades de inteligencia artificial

---

## Convenciones de Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/):

- **MAJOR** (X.y.z): Cambios incompatibles en la API
- **MINOR** (x.Y.z): Funcionalidades agregadas de manera compatible
- **PATCH** (x.y.Z): Correcciones de errores compatibles

### Tipos de Cambios

- ⭐ **Características Principales**: Funcionalidades importantes nuevas
- ✅ **Agregado**: Nuevas funcionalidades
- 🔄 **Modificado**: Cambios en funcionalidades existentes
- 🗑️ **Eliminado**: Funcionalidades removidas
- 🐛 **Corregido**: Corrección de errores
- 🔧 **Técnico**: Cambios internos, refactoring, optimizaciones
- 📚 **Documentación**: Cambios solo en documentación
- 🔐 **Seguridad**: Vulnerabilidades corregidas

---

## Mantenimiento

Para gestionar versiones:

```bash
# Información actual
npm run version:info

# Actualizar versiones
npm run version:patch    # 3.0.0 -> 3.0.1
npm run version:minor    # 3.0.0 -> 3.1.0
npm run version:major    # 3.0.0 -> 4.0.0

# Con nombre personalizado
node scripts/version-manager.js minor --name "Nueva funcionalidad"
```

---

Generado automáticamente por DS Training Management System v3.0.0
- **Panel de Administrador Rediseñado**: Dashboard profesional completo con diseño moderno
  - Fondo gradiente elegante (gris a azul suave)
  - Header mejorado con título y descripción
  - Iconos SVG profesionales en todas las secciones
  - Animaciones suaves y efectos hover
  - Diseño responsive (mobile-first)

- **Estadísticas en Tiempo Real**: Métricas dinámicas en el panel de administrador
  - **Clientes Activos**: Count automático de usuarios con role 'client'
  - **Rutinas Activas**: Count de rutinas vigentes (endDate >= fecha actual)
  - **Templates**: Count total de plantillas en rutinas_templates
  - Loading states con animación de pulso
  - Error handling independiente por consulta

- **Quick Stats**: 3 tarjetas de estadísticas con iconos temáticos
  - Tarjeta de Clientes Activos (icono azul)
  - Tarjeta de Rutinas Activas (icono verde)
  - Tarjeta de Templates (icono púrpura)

- **Main Actions Cards**: Cards interactivos para funciones principales
  - Card "Gestión de Clientes" con descripción y tags
  - Card "Templates de Rutinas" con características
  - Efectos hover con transformaciones y sombras
  - Gradientes en iconos para mayor atractivo visual

## [Sin versionar] - 2025-08-04

### 🔒 Agregado - Sistema de Seguridad Completo
- **Cierre Automático por Inactividad**: 
  - Sesión se cierra automáticamente después de 2 horas de inactividad
  - Advertencia 5 minutos antes del cierre automático
  - Detección de actividad: mouse, clics, teclado, scroll y toques
  - Reset automático del timer con operaciones importantes

- **Bloqueo por Intentos Fallidos**:
  - Bloqueo automático después de 10 intentos fallidos
  - Bloqueo temporal de 30 minutos
  - Advertencias cuando quedan 3 intentos o menos
  - Registro completo en tabla `login_attempts`
  - Auto-desbloqueo después de 30 minutos

- **Panel de Administración de Usuarios Bloqueados**:
  - Vista completa de usuarios bloqueados para administradores
  - Información detallada: motivo, intentos fallidos, tiempo restante
  - Opción de desbloqueo manual para administradores
  - Integrado en la sección "Clientes"

- **Bloqueo Manual por Administrador**:
  - Capacidad de bloquear manualmente cualquier cuenta
  - Bloqueos indefinidos hasta desbloqueo manual
  - Mensajes diferenciados para usuarios bloqueados por admin
  - Control completo desde panel de administración

- **Menú de Configuración**: Nuevo componente `SettingsMenu.js`
  - Botón de configuración con icono de ajustes
  - Menú desplegable responsive
  - Integración completa del Wake Lock con toggle visual
  - Opción de cerrar sesión integrada
  - Cierre automático al hacer clic fuera del menú
  - Estados visuales claros para cada opción

- **Fotos de Perfil de Usuario**:
  - Subida y almacenamiento de imágenes de perfil
  - Integración con Supabase Storage
  - Visualización en header y listas de usuarios
  - Fallback a iniciales cuando no hay foto
  - Auto-refresh al cambiar foto de perfil

### 🎨 Agregado - Mejoras de Interfaz Móvil
- **Iconos SVG Responsivos**: 
  - Reemplazo completo de emojis por iconos SVG profesionales
  - Iconos consistentes entre dispositivos
  - Tamaños optimizados para móvil (`w-4 h-4 sm:w-5 sm:h-5`)
  - Mejor rendimiento y legibilidad

- **Corrección de Visibilidad Móvil**:
  - Eliminadas clases CSS que ocultaban elementos en pantallas pequeñas
  - Botones y controles visibles en todos los dispositivos
  - Responsive design mejorado

### 🔧 Cambiado

#### 2025-08-05
- **Tabla de Clientes** (`UserManagementScreen.js`):
  - Eliminada columna "Email" para simplificar la vista
  - Centrados los títulos "Usuario" y "Acciones" 
  - Centrado el contenido de la columna "Acciones"
  - Resultado: Tabla más limpia con solo 2 columnas

- **Panel de Administrador** (`AdminHomeScreen.js`):
  - Transformación completa de diseño básico a dashboard profesional
  - Reemplazados 2 botones simples por cards interactivos descriptivos
  - Implementación de useState/useEffect para manejo de estado
  - Integración con Supabase para datos en tiempo real

#### 2025-08-04
- **LayoutHeader** (`LayoutHeader.jsx`):
  - Removidos botones individuales de Wake Lock y Logout
  - Integrado nuevo `SettingsMenu` para interfaz más limpia
  - Mejorada organización del layout del header
  - Agregada visualización de foto de perfil del usuario actual

- **Sistema de Autenticación**:
  - Integración completa con `LoginSecurityService`
  - Manejo robusto de errores de login
  - Validación mejorada de credenciales
  - Registro automático de intentos fallidos

- **Base de Datos**:
  - Creada tabla `login_attempts` para seguimiento de seguridad
  - Agregados campos para bloqueos manuales por administrador
  - Integración con Supabase Storage para fotos de perfil
  - Optimización de queries para mejor rendimiento
- **Tabla de Clientes** (`UserManagementScreen.js`):
  - Eliminada columna "Email" para simplificar la vista
  - Centrados los títulos "Usuario" y "Acciones" 
  - Centrado el contenido de la columna "Acciones"
  - Resultado: Tabla más limpia con solo 2 columnas

- **Panel de Administrador** (`AdminHomeScreen.js`):
  - Transformación completa de diseño básico a dashboard profesional
  - Reemplazados 2 botones simples por cards interactivos descriptivos
  - Implementación de useState/useEffect para manejo de estado
  - Integración con Supabase para datos en tiempo real

### 🐛 Corregido

#### 2025-08-05
- **Bug Crítico en Rutinas Activas**: 
  - **Problema**: La métrica mostraba 0 cuando había rutinas vigentes
  - **Causa**: Query usaba `end_date` en lugar de `endDate` 
  - **Solución**: Corregido nombre de columna para usar camelCase
  - **Resultado**: Conteo correcto de rutinas activas

#### 2025-08-04
- **Iconos no visibles en móvil**:
  - **Problema**: Emojis no se renderizaban consistentemente entre dispositivos
  - **Causa**: Dependencia de fuentes del sistema para emojis
  - **Solución**: Reemplazados todos los emojis por iconos SVG
  - **Resultado**: Iconos consistentes y profesionales en todos los dispositivos

- **Elementos ocultos en pantallas pequeñas**:
  - **Problema**: Controles importantes no visibles en móvil
  - **Causa**: Clases CSS `md:block` ocultaban elementos en móvil
  - **Solución**: Cambiadas a `block` para visibilidad completa
  - **Resultado**: Interfaz completamente funcional en móvil

- **Vulnerabilidades de seguridad**:
  - **Problema**: Sin protección contra ataques de fuerza bruta
  - **Causa**: Falta de límites en intentos de login
  - **Solución**: Implementado sistema completo de bloqueo por intentos
  - **Resultado**: Aplicación segura contra ataques comunes

### 🗑️ Eliminado

#### 2025-08-05
- **Sección "Acciones Rápidas"**: Removida del panel de administrador
  - Eliminados 4 botones de acciones rápidas (Nuevo Cliente, Estadísticas, Notificaciones, Configuración)
  - Ajustado spacing del grid principal
  - Resultado: Panel más enfocado y limpio

#### 2025-08-04
- **Botones individuales en header**:
  - Removido `WakeLockButton` independiente
  - Removido botón de logout directo
  - Reemplazados por `SettingsMenu` unificado
  - Resultado: Header más limpio y organizado

- **Emojis como iconos**:
  - Eliminados todos los emojis usados como iconos (🔆, 🔋, ⚙️, etc.)
  - Reemplazados por iconos SVG profesionales
  - Resultado: Consistencia visual mejorada

### 🔐 Seguridad

#### 2025-08-04
- **Implementado sistema completo de autenticación segura**:
  - Protección contra ataques de fuerza bruta
  - Cierre automático de sesiones inactivas
  - Bloqueo temporal y manual de cuentas
  - Registro completo de actividad de login
  - Alertas y advertencias proactivas

- **Creada infraestructura de base de datos segura**:
  - Tabla `login_attempts` con campos de seguridad
  - Encriptación y validación de datos sensibles
  - Logs de auditoría para actividad administrativa

### 🎯 Mejorado

#### 2025-08-05
- **Experiencia de Usuario**:
  - Panel de administración más profesional y funcional
  - Información valiosa disponible de inmediato
  - Mejor organización visual de las funciones principales
  - Interfaz más intuitiva y moderna

- **Performance**:
  - Queries optimizadas a Supabase
  - Carga eficiente de estadísticas
  - Estados de loading apropiados

#### 2025-08-04
- **Seguridad de la Aplicación**:
  - Protección robusta contra ataques comunes
  - Sistema de alertas proactivo
  - Control administrativo completo
  - Monitoreo de actividad en tiempo real

- **Experiencia Móvil**:
  - Iconos consistentes en todos los dispositivos
  - Interfaz completamente funcional en móvil
  - Responsive design optimizado
  - Controles accesibles en pantallas pequeñas

- **Gestión de Usuarios**:
  - Fotos de perfil personalizadas
  - Identificación visual mejorada
  - Sistema de configuración centralizado
  - Wake Lock integrado para sesiones largas

### 📊 Impacto
- **Antes**: Aplicación básica sin protecciones de seguridad, iconos inconsistentes en móvil, panel de administrador simple
- **Después**: Sistema completo con seguridad robusta, interfaz profesional, dashboard con datos en tiempo real
- **Beneficio**: Aplicación profesional lista para producción con todas las características de seguridad y UX necesarias

### 🗂️ Archivos Modificados

#### 2025-08-05
- `src/components/UserManagementScreen.js` - Optimización tabla de clientes
- `src/components/AdminHomeScreen.js` - Rediseño completo del panel

#### 2025-08-04
- `src/components/LayoutHeader.jsx` - Integración del menú de configuración
- `src/components/SettingsMenu.js` - Nuevo componente de configuración
- `src/services/LoginSecurityService.js` - Nuevo servicio de seguridad
- `src/App.js` - Integración del sistema de seguridad y fotos de perfil
- `src/components/AuthScreen.js` - Mejorado con validaciones de seguridad
- `src/components/UserManagementScreen.js` - Agregado panel de usuarios bloqueados
- Base de datos: Tabla `login_attempts` y configuración de Storage

### 🚀 Configuración Requerida
- **Supabase**: Tabla `login_attempts` con campos de seguridad
- **Storage**: Bucket configurado para fotos de perfil
- **Políticas RLS**: Configuradas para seguridad de datos
- **Triggers**: Auto-actualización de timestamps

---

## Formato de Versiones Futuras

### [Unreleased]
- Cambios próximos...

### [X.Y.Z] - YYYY-MM-DD
#### Added
- Nuevas características

#### Changed  
- Cambios en funcionalidades existentes

#### Deprecated
- Características que serán removidas

#### Removed
- Características removidas

#### Fixed
- Corrección de bugs

#### Security
- Correcciones de seguridad
