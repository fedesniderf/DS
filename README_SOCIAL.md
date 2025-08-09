# Red Social DS - Guía de Configuración

## Descripción
Sistema de red social integrado en la aplicación DS que permite a los clientes:
- Compartir publicaciones con texto, imágenes y videos
- Interactuar con likes y comentarios
- Seguir a otros usuarios
- Gestionar solicitudes de seguimiento
- Explorar y descubrir nuevos usuarios

## Instalación y Configuración

### 1. Ejecutar Migración de Base de Datos
1. Abrir Supabase Dashboard
2. Ir a SQL Editor
3. Ejecutar el archivo `social_migration.sql` completo
4. Verificar que todas las tablas se crearon correctamente:
   - `social_posts`
   - `social_likes` 
   - `social_comments`
   - `follow_requests`
   - `follows`

### 2. Configurar Storage Bucket
El script de migración automáticamente:
- Crea el bucket `social-media`
- Configura las políticas de acceso
- Habilita acceso público para visualización

### 3. Verificar Políticas RLS
Las siguientes políticas están configuradas:
- **Publicaciones**: Todos pueden ver, solo el autor puede editar/eliminar
- **Likes**: Todos pueden ver, usuarios autenticados pueden dar like
- **Comentarios**: Todos pueden ver, usuarios autenticados pueden comentar
- **Seguimientos**: Solo el usuario puede gestionar sus relaciones
- **Solicitudes**: Solo involucrados pueden ver/gestionar

### 4. Componentes Creados

#### `SocialFeed.jsx`
- Componente principal de la red social
- Feed de publicaciones
- Creación de posts con media
- Gestión de solicitudes de seguimiento

#### `SocialButton.jsx`
- Botón para abrir la red social desde el header
- Integrado en `LayoutHeader`

#### `UserExplorer.jsx`
- Modal para descubrir usuarios
- Envío de solicitudes de seguimiento
- Búsqueda de usuarios

### 5. Funcionalidades Implementadas

#### ✅ Publicaciones
- Crear posts con texto
- Subir fotos y videos
- Like/Unlike posts
- Contador de likes y comentarios
- Vista cronológica

#### ✅ Sistema de Seguimiento
- Enviar solicitudes de seguimiento
- Aceptar/rechazar solicitudes
- Ver solicitudes pendientes
- Dejar de seguir usuarios

#### ✅ Exploración
- Descubrir usuarios de la plataforma
- Búsqueda por nombre/email
- Estados de seguimiento (siguiendo, pendiente, seguir)

#### ✅ Interfaz Responsiva
- Modal adaptativo mobile/desktop
- Tabs para navegación
- Loading states
- Error handling

## Uso de la Red Social

### Acceso
1. Los usuarios ven un nuevo botón de red social en el header (icono de usuarios)
2. Solo usuarios autenticados pueden acceder
3. El botón aparece junto a las notificaciones

### Navegación
- **Feed**: Vista principal con publicaciones
- **Solicitudes**: Gestión de solicitudes de seguimiento  
- **Descubrir**: Explorar y buscar usuarios

### Crear Publicaciones
1. Escribir texto en el área de texto
2. Opcionalmente agregar foto/video
3. Hacer clic en "Publicar"
4. La publicación aparece inmediatamente en el feed

### Gestionar Seguimientos
1. Ir a "Descubrir" para encontrar usuarios
2. Hacer clic en "Seguir" para enviar solicitud
3. El usuario receptor ve la solicitud en "Solicitudes"
4. Puede aceptar o rechazar

## Estructura de Datos

### Tablas Principales
```sql
social_posts      -> Publicaciones
social_likes      -> Likes de publicaciones  
social_comments   -> Comentarios (futura implementación)
follow_requests   -> Solicitudes de seguimiento
follows          -> Relaciones de seguimiento activas
```

### Storage
```
social-media/     -> Bucket para fotos y videos
```

## Características Técnicas

### Seguridad
- Row Level Security (RLS) habilitado
- Políticas restrictivas por usuario
- Validación de ownership para modificaciones

### Performance  
- Índices optimizados para consultas frecuentes
- Lazy loading de publicaciones
- Caching de relaciones de seguimiento

### Escalabilidad
- Arquitectura preparada para millones de usuarios
- Paginación implementada
- Optimización de queries

## Próximas Funcionalidades

### 🔄 En Desarrollo
- [ ] Sistema de comentarios completo
- [ ] Notificaciones push
- [ ] Stories temporales
- [ ] Mensajería directa
- [ ] Hashtags y menciones
- [ ] Trending topics

### 🎯 Futuras Mejoras
- [ ] Algoritmo de feed personalizado
- [ ] Recomendaciones de usuarios
- [ ] Estadísticas de engagement
- [ ] Moderación automática
- [ ] Live streaming
- [ ] Integración con rutinas de ejercicio

## Troubleshooting

### Errores Comunes

1. **No se ven publicaciones**
   - Verificar que RLS esté configurado correctamente
   - Comprobar que el usuario esté autenticado

2. **Error al subir media**
   - Verificar que el bucket `social-media` exista
   - Comprobar políticas de storage

3. **Solicitudes no funcionan**
   - Verificar tabla `follow_requests`
   - Comprobar políticas de la tabla

## Soporte
Para reportar bugs o solicitar funcionalidades, contactar al equipo de desarrollo.
