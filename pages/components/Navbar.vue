<template>
  <header class="modern-header">
    <nav class="modern-navbar">
      <!-- LOGO -->
      <a href="/">
        <img src="/img/logo-rincon.png" alt="Cafe SanJuan" class="modern-logo" />
   </a>

      <!-- ENLACES PRINCIPALES -->
      <div class="modern-nav-links">
        <!-- INICIO -->
        <a href="/" class="modern-nav-link">Inicio</a>

        <!-- ENLACES CLIENTE (visible cuando NO es admin) -->
        <template v-if="!isAdmin">
          <span class="modern-separator">•</span>
          <a @click="handleReservasClick" class="modern-nav-link" style="cursor: pointer">Reservas</a>
          <span class="modern-separator">•</span>
          <a href="/menu" class="modern-nav-link">Menú</a>
          <span class="modern-separator">•</span>
          <a href="/mesas" class="modern-nav-link">Mesas</a>
          
          <!-- CARRITO (Solo para clientes logueados) -->
          <template v-if="usuario">
            <span class="modern-separator">•</span>
            <a href="/carrito" class="modern-nav-link">
              <i class="bi bi-cart3"></i> Carrito
            </a>
          </template>
        </template>

        <!-- ENLACES ADMIN (Solo visible cuando es admin logueado) -->
        <template v-if="isAdmin">
          <span class="modern-separator">•</span>
          <a href="/admin-facturacion" class="modern-nav-link admin-link">
            <i class="bi bi-receipt"></i> Gestión y Facturación
          </a>
          <span class="modern-separator">•</span>
          <a href="/admin-mesas" class="modern-nav-link admin-link">
            <i class="bi bi-table"></i> Mesas (Admin)
          </a>
          <span class="modern-separator">•</span>
          <a href="/admin-menu" class="modern-nav-link admin-link">
            <i class="bi bi-menu-button-wide"></i> Menú (Admin)
          </a>
          <span class="modern-separator">•</span>
          <a href="/admin-clientes" class="modern-nav-link admin-link">
            <i class="bi bi-people"></i> Clientes (Admin)
          </a>
          <span class="modern-separator">•</span>
          <a href="/admin-promociones" class="modern-nav-link admin-link">
            <i class="bi bi-percent"></i> Promociones (Admin)
          </a>
        </template>
      </div>

      <!-- AREA DE USUARIO -->
      <div class="modern-user-area">
        <!-- NO LOGUEADO -->
        <button v-if="!usuario" class="modern-login-btn" @click="openAuthModal">
          Iniciar sesión
        </button>

        <!-- LOGUEADO -->
        <template v-else>
          <span class="modern-user-name">
            {{ usuario.Nombre }}
            <span v-if="isAdmin" class="modern-admin-badge">
              <i class="bi bi-shield-check"></i> Admin
            </span>
          </span>
          <button class="modern-login-btn btn-logout" @click="logout">
            <i class="bi bi-box-arrow-right"></i> Cerrar sesión
    </button>
 </template>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'NavbarComponent',
  data() {
    return {
      usuario: null
    }
  },
  computed: {
    isAdmin() {
      return this.usuario && this.usuario.Rol === 'ADMIN'
    }
  },
  mounted() {
    // Cargar usuario del localStorage
    const usuarioGuardado = localStorage.getItem('usuario')
    if (usuarioGuardado) {
      try {
        this.usuario = JSON.parse(usuarioGuardado)
        console.log('✅ Usuario logueado:', this.usuario.Nombre)
        console.log('🔑 Rol:', this.usuario.Rol)
      } catch (error) {
        console.error('Error parseando usuario:', error)
      }
    }

    window.addEventListener('storage', this.onStorageChange)
    window.addEventListener('user-logged-in', this.handleUserLogin)
  window.addEventListener('user-logged-out', this.handleUserLogout)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorageChange)
    window.removeEventListener('user-logged-in', this.handleUserLogin)
    window.removeEventListener('user-logged-out', this.handleUserLogout)
  },
  methods: {
    onStorageChange(e) {
      if (e.key === 'usuario') {
        if (e.newValue) {
          this.usuario = JSON.parse(e.newValue)
        } else {
          this.usuario = null
        }
      }
    },
    handleUserLogin() {
      const usuarioGuardado = localStorage.getItem('usuario')
      if (usuarioGuardado) {
        this.usuario = JSON.parse(usuarioGuardado)
      }
    },
    handleUserLogout() {
      this.usuario = null
    },
    handleReservasClick(e) {
      e.preventDefault()
      if (!this.usuario) {
        // Si no está logueado, mostrar advertencia y abrir modal de login
        if (typeof window.showWarning === 'function') {
          window.showWarning('Debes iniciar sesión para acceder a Reservas.', 'Autenticación Requerida', () => {
            this.openAuthModal()
          })
        } else {
          this.openAuthModal()
        }
      } else {
        // Si está logueado, redirigir a reservas
        window.location.href = '/reservas'
      }
    },
    openAuthModal() {
      window.dispatchEvent(new CustomEvent('open-auth-modal'))
    },
    logout() {
      console.log('🚪 Intentando cerrar sesión...')
      
      const confirmar = () => {
        console.log('✅ Cerrando sesión confirmado')
        localStorage.removeItem('usuario')
        localStorage.removeItem('authToken')
        this.usuario = null
        window.dispatchEvent(new CustomEvent('user-logged-out'))
        
        if (typeof window.showSuccess === 'function') {
          window.showSuccess('Sesión cerrada correctamente', 'Hasta pronto', () => {
            window.location.href = '/'
          })
        } else {
          alert('Sesión cerrada')
          window.location.href = '/'
        }
      }

      const cancelar = () => {
        console.log('❌ Cierre de sesión cancelado')
      }

      if (typeof window.showConfirm === 'function') {
        console.log('✅ Usando showConfirm')
        window.showConfirm('¿Estás seguro de que deseas cerrar sesión?', confirmar, cancelar)
      } else {
        console.log('⚠️ showConfirm no disponible, usando confirm nativo')
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
          confirmar()
        }
      }
    }
  }
}
</script>

<style scoped>
/* === HEADER Y NAVBAR MEJORADOS === */
.modern-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(135deg, #3e2f21 0%, #6b8e23 100%);
  color: white;
  z-index: 1000;
padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.modern-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 60px;
}

.modern-logo {
  height: 45px;
  border-radius: 8px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.modern-logo:hover {
  transform: scale(1.05);
}

.modern-nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
  margin: 0 20px;
}

.modern-nav-link {
  color: #f5d7a5;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
}

.modern-nav-link:hover {
  color: #ffffff;
  background: rgba(107, 142, 35, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 142, 35, 0.3);
}

.modern-separator {
  color: #f5d7a5;
  opacity: 0.6;
  font-size: 12px;
  margin: 0 2px;
}

.modern-user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.modern-login-btn {
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(107, 142, 35, 0.3);
}

.modern-login-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 15px rgba(107, 142, 35, 0.4);
}

.modern-user-name {
  color: #f5d7a5;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

.modern-admin-badge {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.cliente-links, .admin-links {
  display: none;
  align-items: center;
  gap: 8px;
}

.cliente-links.show, .admin-links.show {
  display: flex;
}

/* === BOTÓN ACCESO ADMIN === */
.btn-admin-access {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(192, 57, 43, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-admin-access:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 15px rgba(192, 57, 43, 0.5);
  background: linear-gradient(135deg, #a93226, #cb4335);
}

/* === BOTÓN VOLVER A CLIENTE === */
.btn-cliente-access {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cliente-access:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.5);
  background: linear-gradient(135deg, #2980b9, #21618c);
}

/* === ENLACES ADMIN === */
.admin-link {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.2)) !important;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.admin-link:hover {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.8), rgba(192, 57, 43, 0.8)) !important;
  border-color: #e74c3c;
}

/* === BOTÓN LOGOUT === */
.btn-logout {
  background: linear-gradient(135deg, #c0392b, #e74c3c) !important;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #a93226, #cb4335) !important;
}

/* Responsive */
@media (max-width: 1200px) {
  .modern-nav-link {
    font-size: 13px;
    padding: 6px 10px;
  }
  .modern-navbar {
    padding: 10px 15px;
}
}

@media (max-width: 992px) {
  .modern-navbar {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
  }
  .modern-nav-links {
    margin: 0;
    justify-content: center;
    gap: 5px;
  }
  .modern-separator {
    display: none;
  }
  .modern-nav-link {
    font-size: 12px;
    padding: 6px 8px;
  }
}

@media (max-width: 768px) {
  .modern-nav-links {
    flex-direction: column;
    gap: 8px;
  }
  .modern-nav-link {
    width: 100%;
    text-align: center;
  max-width: 200px;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
 opacity: 1;
    transform: translateY(0);
  }
}

.modern-header {
  animation: slideDown 0.5s ease-out;
}
</style>
