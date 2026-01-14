<template>
  <div v-if="show" class="auth-modal-overlay" @click.self="close">
    <div class="auth-modal">
      <button class="close-btn" @click="close">×</button>

  <h2>{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</h2>

      <!-- LOGIN -->
      <div v-if="isLogin">
        <label>Email</label>
        <input v-model="loginData.email" type="email" @keyup.enter="handleLogin" :disabled="isLoading">

        <label>Contraseña</label>
        <input v-model="loginData.password" type="password" @keyup.enter="handleLogin" :disabled="isLoading">

        <button class="btn-verde" @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p>
          ¿No tienes cuenta?
   <a href="#" @click.prevent="isLogin = false">Registrarse</a>
        </p>
      </div>

      <!-- REGISTRO -->
      <div v-else>
  <label>Nombre Completo</label>
 <input v-model="registerData.nombre" placeholder="Ej: Juan Pérez">
        <small>Debe incluir nombre y apellido</small>

        <label>Cédula</label>
  <input v-model="registerData.cedula" placeholder="001-1234567-8" maxlength="13" @input="formatCedula">
  <small>Formato: XXX-XXXXXXX-X</small>

        <label>Email</label>
        <input v-model="registerData.email" type="email" placeholder="ejemplo@correo.com">

        <label>Contraseña</label>
        <input v-model="registerData.password" type="password" placeholder="Mínimo 8 caracteres">
<small>Debe tener mayúscula, minúscula y número</small>

  <label>Teléfono</label>
        <input v-model="registerData.telefono" placeholder="809-555-1234" maxlength="12" @input="formatTelefono">
        <small>Formato: 809/829/849 + 7 dígitos</small>

     <label>Dirección</label>
        <input v-model="registerData.direccion" placeholder="Calle, sector, número">
     <small>Dirección completa con números y letras</small>

        <button class="btn-verde" @click="handleRegister" :disabled="isLoading">
          {{ isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>

      <p>
          ¿Ya tienes cuenta?
   <a href="#" @click.prevent="isLogin = true">Iniciar sesión</a>
        </p>
  </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'AuthModal',
  props: {
    show: {
   type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLogin: true,
      isLoading: false,
      loginData: {
        email: '',
        password: ''
      },
      registerData: {
        nombre: '',
        cedula: '',
        email: '',
        password: '',
        telefono: '',
        direccion: ''
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    formatCedula(event) {
      let valor = this.registerData.cedula.replace(/\D/g, '')
    if (valor.length > 11) valor = valor.substring(0, 11)
      
      if (valor.length > 3 && valor.length <= 10) {
        valor = valor.substring(0, 3) + '-' + valor.substring(3)
      }
      if (valor.length > 11) {
        valor = valor.substring(0, 11) + '-' + valor.substring(11)
      }
      
      this.registerData.cedula = valor
    },
    formatTelefono(event) {
      let valor = this.registerData.telefono.replace(/\D/g, '')
      if (valor.length > 10) valor = valor.substring(0, 10)
      
      if (valor.length > 3 && valor.length <= 6) {
        valor = valor.substring(0, 3) + '-' + valor.substring(3)
      } else if (valor.length > 6) {
        valor = valor.substring(0, 3) + '-' + valor.substring(3, 6) + '-' + valor.substring(6)
      }
      
      this.registerData.telefono = valor
    },
    async handleLogin() {
      if (this.isLoading) {
        console.log('⏳ Ya hay una petición en proceso, ignorando...')
        return
      }

      console.log('🔐 Intentando login...')
      const { email, password } = this.loginData

      if (!email || !password) {
        console.log('❌ Campos vacíos')
        if (typeof window.showWarning === 'function') {
          window.showWarning('Por favor, completa todos los campos')
        } else {
          alert('Por favor, completa todos los campos')
        }
        return
      }

      this.isLoading = true

      try {
        console.log('📡 Enviando petición a:', 'https://seguridad-production-279b.up.railway.app/api/usuarios/login')
        const response = await fetch('https://seguridad-production-279b.up.railway.app/api/usuarios/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Email: email, Contrasena: password })
        })

        console.log('📥 Respuesta recibida:', response.status)
        const data = await response.json()
        console.log('📦 Datos completos:', data)
        console.log('👤 Usuario:', data.usuario)
        console.log('🔍 Estado del usuario (mayúscula):', data.usuario?.Estado)
        console.log('🔍 Estado del usuario (minúscula):', data.usuario?.estado)

        if (!response.ok || data.mensaje !== 'Login exitoso') {
          console.log('❌ Login fallido:', data.mensaje)
          if (typeof window.showError === 'function') {
            window.showError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.')
          } else {
            alert('Credenciales incorrectas')
          }
          return
        }

        console.log('✅ Mensaje correcto: Login exitoso')

        // Verificar estado - normalizar a mayúsculas y quitar espacios
        // El API devuelve 'estado' en minúsculas
        const estado = (data.usuario?.estado || data.usuario?.Estado || '').toString().trim().toUpperCase()
        console.log('🔍 Estado normalizado:', estado)
        
        if (estado !== 'ACTIVO') {
          console.log('❌ Usuario inactivo. Estado recibido:', estado)
          if (typeof window.showError === 'function') {
            window.showError('Tu cuenta está INACTIVA. Por favor, contacta al administrador.')
          } else {
            alert('Tu cuenta está INACTIVA')
          }
          return
        }

        console.log('✅ Usuario activo, continuando...')

        // Guardar usuario y token en localStorage
        const usuario = {
          IdUsuario: data.usuario.idUsuario,
          Nombre: data.usuario.nombre,
          Email: data.usuario.email,
          Cedula: data.usuario.cedula,
          Telefono: data.usuario.telefono,
          Rol: data.usuario.rol,
          Estado: data.usuario.estado,
          Direccion: data.usuario.direccion ?? ''
        }
        
        console.log('💾 Guardando usuario:', usuario)
        localStorage.setItem('usuario', JSON.stringify(usuario))
        
        // Guardar token JWT
        if (data.token) {
          localStorage.setItem('authToken', data.token)
          console.log('🔑 Token guardado')
        }

        // Disparar evento de usuario logueado
        window.dispatchEvent(new CustomEvent('user-logged-in'))
        console.log('✅ Login exitoso')

        if (typeof window.showSuccess === 'function') {
          window.showSuccess('¡Bienvenido!', 'Inicio de sesión exitoso', () => {
            this.close()
            location.reload()
          })
        } else {
          alert('¡Bienvenido!')
          this.close()
          location.reload()
        }
      } catch (err) {
        console.error('❌ Error en login:', err)
        if (typeof window.showError === 'function') {
          window.showError('Error de conexión. Por favor, verifica tu conexión a internet.')
        } else {
          alert('Error de conexión')
        }
      } finally {
        this.isLoading = false
      }
    },
    async handleRegister() {
      if (this.isLoading) {
        console.log('⏳ Ya hay una petición de registro en proceso, ignorando...')
        return
      }

      console.log('📝 Iniciando proceso de registro...')
      const { nombre, cedula, email, password, telefono, direccion } = this.registerData
      console.log('📋 Datos del formulario:', { nombre, cedula, email, telefono, direccion })

      // Validaciones
      if (!nombre || !cedula || !email || !password || !telefono || !direccion) {
        console.log('❌ Validación: Campos vacíos')
        if (typeof window.showWarning === 'function') {
          window.showWarning('Todos los campos son obligatorios')
        } else {
          alert('Todos los campos son obligatorios')
        }
        return
      }

      const palabras = nombre.split(' ').filter(p => p.length > 0)
      if (palabras.length < 2) {
        console.log('❌ Validación: Nombre incompleto - palabras:', palabras.length)
        if (typeof window.showWarning === 'function') {
          window.showWarning('Debes ingresar nombre y apellido')
        } else {
          alert('Debes ingresar nombre y apellido')
        }
        return
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
        console.log('❌ Validación: Nombre con caracteres inválidos')
        if (typeof window.showWarning === 'function') {
          window.showWarning('El nombre solo puede contener letras')
        } else {
          alert('El nombre solo puede contener letras')
        }
        return
      }

      const cedulaLimpia = cedula.replace(/[-\s]/g, '')
      console.log('🔍 Cédula limpia:', cedulaLimpia, 'longitud:', cedulaLimpia.length)
      if (!/^\d{11}$/.test(cedulaLimpia)) {
        console.log('❌ Validación: Cédula inválida')
        if (typeof window.showWarning === 'function') {
          window.showWarning('La cédula debe tener 11 dígitos (formato: XXX-XXXXXXX-X)')
        } else {
          alert('La cédula debe tener 11 dígitos')
        }
        return
      }

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        console.log('❌ Validación: Email inválido')
        if (typeof window.showWarning === 'function') {
          window.showWarning('Formato de correo electrónico inválido')
        } else {
          alert('Formato de correo electrónico inválido')
        }
        return
      }

      if (password.length < 8) {
        console.log('❌ Validación: Contraseña muy corta - longitud:', password.length)
        if (typeof window.showWarning === 'function') {
          window.showWarning('La contraseña debe tener al menos 8 caracteres')
        } else {
          alert('La contraseña debe tener al menos 8 caracteres')
        }
        return
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        console.log('❌ Validación: Contraseña sin requisitos')
        if (typeof window.showWarning === 'function') {
          window.showWarning('La contraseña debe tener al menos una mayúscula, una minúscula y un número')
        } else {
          alert('La contraseña debe tener al menos una mayúscula, una minúscula y un número')
        }
        return
      }

      const telefonoLimpio = telefono.replace(/[\s\-\(\)\+]/g, '')
      let telefonoFinal = telefonoLimpio
      if (telefonoLimpio.length === 11 && telefonoLimpio.startsWith('1')) {
        telefonoFinal = telefonoLimpio.substring(1)
      }
      console.log('🔍 Teléfono limpio:', telefonoLimpio, '=> final:', telefonoFinal)
      
      if (!/^(809|829|849)\d{7}$/.test(telefonoFinal)) {
        console.log('❌ Validación: Teléfono inválido')
        if (typeof window.showWarning === 'function') {
          window.showWarning('Teléfono inválido. Debe comenzar con 809, 829 o 849 y tener 10 dígitos')
        } else {
          alert('Teléfono inválido')
        }
        return
      }

      if (direccion.length < 10) {
        console.log('❌ Validación: Dirección muy corta - longitud:', direccion.length)
        if (typeof window.showWarning === 'function') {
          window.showWarning('La dirección debe tener al menos 10 caracteres')
        } else {
          alert('La dirección debe tener al menos 10 caracteres')
        }
        return
      }
      if (!/.*\d.*/.test(direccion) || !/.*[a-zA-Z].*/.test(direccion)) {
        console.log('❌ Validación: Dirección sin números o letras')
        if (typeof window.showWarning === 'function') {
          window.showWarning('La dirección debe incluir números y letras')
        } else {
          alert('La dirección debe incluir números y letras')
        }
        return
      }

      console.log('✅ Todas las validaciones pasaron')

      // Separar nombre y apellido
      const palabrasNombre = nombre.trim().split(' ')
      const primerNombre = palabrasNombre[0]
      const apellido = palabrasNombre.slice(1).join(' ')

      const requestData = {
        Nombre: primerNombre,
        Apellido: apellido,
        Email: email,
        Contrasena: password,
        Telefono: telefono,
        Cedula: cedula,
        Direccion: direccion,
        Rol: 'Usuario'
      }

      this.isLoading = true

      try {
        console.log('📝 Registrando usuario:', requestData.Email)
        console.log('📡 Request data completo:', requestData)
        const response = await fetch('https://seguridad-production-279b.up.railway.app/api/usuarios/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })

        console.log('📥 Respuesta registro:', response.status)
        const data = await response.json()
        console.log('📦 Datos registro:', data)

        if (response.ok && data.mensaje && data.mensaje.includes('correctamente')) {
          // Limpiar campos
          this.registerData = {
            nombre: '',
            cedula: '',
            email: '',
            password: '',
            telefono: '',
            direccion: ''
          }

          console.log('✅ Registro exitoso')
          if (typeof window.showSuccess === 'function') {
            window.showSuccess('Usuario registrado correctamente', '¡Registro Exitoso!', () => {
              this.isLogin = true
            })
          } else {
            alert('Usuario registrado correctamente')
            this.isLogin = true
          }
        } else {
          console.log('❌ Error en registro:', data.mensaje)
          
          // Detectar si el error es por email duplicado
          const mensaje = data.mensaje || 'Error en el registro'
          const esEmailDuplicado = mensaje.toLowerCase().includes('email') || 
                                   mensaje.toLowerCase().includes('correo') || 
                                   mensaje.toLowerCase().includes('existe') ||
                                   mensaje.toLowerCase().includes('duplicado') ||
                                   mensaje.toLowerCase().includes('ya está registrado') ||
                                   mensaje.toLowerCase().includes('ya esta registrado')
          
          if (typeof window.showError === 'function') {
            if (esEmailDuplicado) {
              window.showError('Este correo electrónico ya está registrado. Por favor, usa otro correo o inicia sesión.', 'Email Duplicado')
            } else {
              window.showError(mensaje, 'Error en Registro')
            }
          } else {
            alert(mensaje)
          }
        }
      } catch (err) {
        console.error('❌ Error en registro:', err)
        if (typeof window.showError === 'function') {
          window.showError('Error de conexión. Por favor, verifica tu conexión a internet.')
        } else {
          alert('Error de conexión')
        }
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
/* === MODAL DE AUTENTICACI�N === */
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.auth-modal {
  position: relative;
  background-color: #fff;
  padding: 50px 40px 40px;
  border-radius: 20px;
  width: 90%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  color: #3e2f21;
  animation: slideInModal 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideInModal {
  from {
    transform: scale(0.8) translateY(-50px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background-color: #6b8e23;
  color: #fff;
  font-size: 26px;
  font-weight: bold;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(107, 142, 35, 0.4);
  transition: all 0.3s ease;
  line-height: 1;
  padding: 0;
}

.close-btn:hover {
  background-color: #557a1b;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 16px rgba(107, 142, 35, 0.5);
}

.auth-modal h2 {
  margin-top: 15px;
  margin-bottom: 25px;
  font-family: "Playfair Display", serif;
  font-weight: 700;
  font-size: 1.8em;
  color: #3e2f21;
}

.auth-modal label {
  display: block;
  text-align: left;
  margin-top: 15px;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.95em;
  color: #3e2f21;
}

.auth-modal input {
  width: 100%;
  padding: 12px 15px;
  margin-top: 0;
  border-radius: 10px;
  border: 2px solid #ddd;
  background-color: #f9f9f9;
  font-size: 1rem;
  color: #3e2f21;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.auth-modal input:focus {
  outline: none;
  border-color: #6b8e23;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(107, 142, 35, 0.3);
}

.auth-modal small {
  display: block;
  font-size: 0.8em;
  color: #777;
  margin-top: 4px;
  margin-bottom: 8px;
  text-align: left;
  font-style: italic;
}

.btn-verde {
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 1.15em;
  border-radius: 30px;
  padding: 14px 40px;
  width: 100%;
  margin-top: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 142, 35, 0.4);
}

.btn-verde:hover {
  transform: scale(1.03);
  background: linear-gradient(135deg, #8dbb35, #6b8e23);
  box-shadow: 0 6px 20px rgba(107, 142, 35, 0.5);
}

.auth-modal p {
  margin-top: 20px;
  color: #555;
  font-size: 0.95em;
}

.auth-modal a {
  color: #6b8e23;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.auth-modal a:hover {
  text-decoration: underline;
  color: #557a1b;
}

/* Scrollbar del modal */
.auth-modal::-webkit-scrollbar {
  width: 8px;
}

.auth-modal::-webkit-scrollbar-track {
  background: rgba(107, 142, 35, 0.1);
  border-radius: 10px;
}

.auth-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6b8e23, #8dbb35);
  border-radius: 10px;
}

.auth-modal::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #8dbb35, #6b8e23);
}
</style>
