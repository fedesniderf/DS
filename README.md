# DS Training Management System

## 🚀 Versión 3.0.0

Sistema completo de gestión de entrenamiento con menú de configuración avanzado y gestión de usuarios.

---

## 📋 Características Principales

### 🎛️ **Menú de Configuración Completo (v3.0)**
- **👤 Activación por foto de usuario** - Acceso intuitivo mediante avatar
- **⚡ Wake Lock avanzado** - Mantener pantalla encendida con control de brillo
- **🔑 Gestión de contraseñas** - Cambio seguro con validación
- **📸 Actualización de fotos** - Subida y gestión de imágenes de perfil
- **✏️ Edición de perfil** - Información personal completa
- **🛡️ Panel de seguridad** - Información y políticas de protección
- **🚫 Gestión de usuarios** - Panel de administración para usuarios bloqueados
- **📱 Diseño responsive** - Optimizado para móvil y desktop

### 🔧 **Funcionalidades Técnicas**
- **🔄 Estado persistente** - Configuraciones guardadas en localStorage
- **⌨️ Accesibilidad** - Navegación por teclado y cierre automático
- **🎨 UI/UX moderna** - Diseño limpio con Tailwind CSS
- **🔒 Integración Supabase** - Backend completo para autenticación y datos
- **📊 Sistema de notificaciones** - Centro de notificaciones integrado
- **🌐 Red social** - Funcionalidad social para usuarios específicos

---

## 🛠️ Instalación y Configuración

### Prerrequisitos
- **Node.js** >= 16.0.0
- **npm** o **yarn**
- **Cuenta Supabase** (para backend)

### Pasos de instalación

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/fedesniderf/DS.git
   cd DS
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   REACT_APP_SUPABASE_URL=tu_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Iniciar desarrollo**
   ```bash
   npm start
   ```

5. **Iniciar con servidor de email (opcional)**
   ```bash
   npm run start:all
   ```

---

## 📁 Estructura del Proyecto

```
DS_entrenamiento/
├── src/
│   ├── components/           # Componentes React
│   │   ├── LayoutHeader.js   # Header principal con navegación
│   │   ├── SettingsMenu.js   # Menú de configuración completo ⭐
│   │   ├── ChangePasswordModal.jsx
│   │   ├── SecurityInfoModal.jsx
│   │   ├── BlockedUsersPanel.jsx
│   │   ├── PhotoUpdateModal.jsx
│   │   ├── EditUserModal.jsx
│   │   └── NotificationCenter.js
│   ├── hooks/                # Hooks personalizados
│   │   └── useEnhancedWakeLock.js ⭐
│   ├── utils/
│   └── supabaseClient.js
├── public/
├── package.json              # v3.0.0
├── version.json              # Historial de versiones ⭐
└── README.md                 # Este archivo ⭐
```

---

## 🔄 Changelog

### v3.0.0 (2025-08-08) - **VERSIÓN ACTUAL**

#### ✨ **Nuevas Características**
- **🎛️ SettingsMenu completo** - Reemplaza SimpleSettingsMenu con funcionalidad avanzada
- **👤 Botón de foto de usuario** - Avatar como trigger del menú de configuración
- **⚡ Wake Lock mejorado** - Hook useEnhancedWakeLock con control de brillo
- **📱 Diseño responsive** - Menú adaptativo para móvil y desktop
- **🔐 Modales de gestión** - Sistema completo de modales para cada funcionalidad

#### 🐛 **Correcciones**
- **✅ Error "Element type is invalid"** - Resuelto problema de imports
- **✅ Arquitectura mejorada** - Componentes modulares y mantenibles
- **✅ Optimización de rendimiento** - Menos re-renders y mejor gestión de estado

#### 🔧 **Cambios Técnicos**
- **📦 Nuevos componentes modulares** - Separación de responsabilidades
- **🔄 Hook personalizado** - useEnhancedWakeLock para gestión avanzada
- **🗃️ Persistencia mejorada** - localStorage para configuraciones de usuario
- **🎨 UI/UX actualizada** - Diseño moderno y accesible

---

## 🧪 Testing

### Funcionalidades a probar:

1. **🎛️ Menú de configuración**
   - Clic en foto de usuario abre menú
   - Navegación por teclado (Tab, Escape)
   - Cierre automático al hacer clic fuera

2. **⚡ Wake Lock**
   - Toggle funciona correctamente
   - Persistencia en localStorage
   - Fallback para dispositivos no compatibles

3. **👤 Gestión de perfil**
   - Cambio de contraseña con validación
   - Actualización de foto de perfil
   - Edición de información personal

4. **📱 Responsive Design**
   - Menú se adapta en móvil/desktop
   - Touch-friendly en dispositivos táctiles
   - Overlay completo en móvil

---

## 🚀 Próximas Versiones

### v3.1.0 (Planificado)
- [ ] Temas oscuro/claro
- [ ] Configuración de notificaciones
- [ ] Shortcuts de teclado
- [ ] Animaciones de transición

### v3.2.0 (Planificado)
- [ ] Multi-idioma (i18n)
- [ ] Configuración avanzada de Wake Lock
- [ ] Dashboard de administración expandido
- [ ] Analytics de uso

---

## 👨‍💻 Desarrollo

### Comandos útiles

```bash
# Desarrollo
npm start                    # Iniciar servidor de desarrollo
npm run start:email         # Servidor de email
npm run start:all           # Ambos servidores

# Producción
npm run build               # Build para producción
npm test                    # Ejecutar tests
```

### Estructura de versionado

- **Major (3.x.x)** - Cambios incompatibles o rediseños completos
- **Minor (x.1.x)** - Nuevas funcionalidades compatibles
- **Patch (x.x.1)** - Correcciones de bugs y mejoras menores

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

## 👤 Autor

**fedesniderf** - [GitHub Profile](https://github.com/fedesniderf)

---

## 🔗 Links Útiles

- **Repositorio:** [DS](https://github.com/fedesniderf/DS)
- **Supabase:** [Documentación](https://supabase.com/docs)
- **Tailwind CSS:** [Documentación](https://tailwindcss.com/docs)
- **React:** [Documentación](https://react.dev)

---

*Última actualización: 8 de agosto de 2025 - v3.0.0*
