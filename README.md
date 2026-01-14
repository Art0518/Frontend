# 🍽️ Café San Juan - Frontend Vue 3

Frontend migrado de HTML/CSS/JS vanilla a Vue 3 con Vike, manteniendo **exactamente** la misma funcionalidad y diseño.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Backend de microservicios corriendo (puertos 5001-5004)

## 🚀 Instalación y Ejecución

```powershell
# 1. Navegar al proyecto Vue
cd CafeSanJuanVue

# 2. Instalar dependencias
npm install

# 3. Copiar assets del frontend HTML (JavaScript e imágenes)
cd ..
.\copy-frontend-assets.ps1

# 4. Ejecutar en desarrollo
cd CafeSanJuanVue
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 📦 Build para Producción

```powershell
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## ✅ Páginas Creadas

1. ✅ **Home** (`/`) - Página principal
2. ✅ **Menú** (`/menu`) - Catálogo de platos
3. ✅ **Reservas** (`/reservas`) - Sistema de reservas por pasos
4. ✅ **Carrito** (`/carrito`) - Gestión de reservas pendientes
5. ✅ **Confirmación** (`/confirmacion`) - Confirmación de reserva
6. ✅ **Mi Perfil** (`/mi-perfil`) - Datos del usuario
7. ✅ **Mis Reservas** (`/mis-reservas`) - Historial de reservas

## 🔧 Componentes Creados

- ✅ **Navbar** - Navegación principal con roles (Cliente/Admin)
- ✅ **Footer** - Pie de página
- ✅ **Loading** - Pantalla de carga animada
- ✅ **AuthModal** - Login y registro
- ✅ **NotificationModal** - Alertas personalizadas
- ✅ **ConfirmationModal** - Confirmaciones con botones

## 🎨 CSS y Estilos

✅ `style.css` copiado sin cambios  
✅ Todos los estilos originales preservados  
✅ Responsive design mantenido  
✅ Animaciones y transiciones intactas  

## 📝 JavaScript Original Preservado

Todos los archivos `.js` del frontend HTML se copian a `public/js/` para mantener la lógica exacta:

- `auth.js` - Autenticación
- `carrito.js` - Gestión de carrito
- `reservas.js` - Sistema de reservas
- `notifications.js` - Sistema de notificaciones
- Y más...

## 🚀 Publicar en Monster

```powershell
.\publish-vue-monster.ps1
```

Luego sube el contenido de `dist/` a Monster usando FTP o File Manager.

---

**Un Rincón en San Juan** 🇵🇷

