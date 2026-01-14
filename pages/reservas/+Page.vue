<template>
  <div class="pagina-reserva">
    <section class="reserva-form fondo-caribeno">
      <!-- PASO 1: SELECCIONAR ZONA -->
      <div v-show="step === 1" class="reserva-step fade-in">
        <h2>Selecciona tu zona favorita</h2>
   <div class="zona-opciones">
    <button @click="selectZona('Interior')">Interior</button>
     <button @click="selectZona('Exterior')">Exterior</button>
   </div>
      </div>

      <!-- PASO 2: SELECCIONAR MESA -->
      <div v-show="step === 2" class="reserva-step fade-in">
    <h2>Selecciona tu mesa</h2>
        <div id="listaMesas" class="lista-mesas"></div>
        <button class="volver-btn" @click="goBack(1)">← Volver</button>
      </div>

      <!-- PASO 3: FECHA Y HORA -->
      <div v-show="step === 3" class="reserva-step fade-in">
   <h2 style="color:white; text-shadow:0 0 6px rgba(0,0,0,0.6);">Selecciona fecha y hora</h2>
   <div class="contenedor-fecha-hora">
     <div class="campo">
        <label>Fecha</label>
    <input type="date" id="fechaSeleccion" v-model="fecha" @change="validarFecha" required>
     </div>
       <div class="campo">
    <label>Hora</label>
        <select id="horaSeleccion" v-model="hora" :disabled="!fecha" required>
   <option value="">-- Selecciona una hora --</option>
      </select>
  </div>
        </div>
   <button class="btn-verde" @click="confirmarFechaHora">Continuar</button>
   <button class="volver-btn" @click="goBack(2)">← Volver</button>
      </div>

   <!-- PASO 4: DETALLES -->
      <div v-show="step === 4" class="reserva-step fade-in">
   <h2>Detalles de tu reserva</h2>
        <form class="reserva-formulario">
  <label>Fecha: <input type="text" :value="fecha" readonly></label>
          <label>Hora: <input type="text" :value="hora" readonly></label>
     <label>Nombre completo: <input type="text" :value="usuario?.Nombre" readonly></label>
   <label>Correo: <input type="email" :value="usuario?.Email" readonly></label>
  <label>Teléfono: <input type="tel" :value="usuario?.Telefono" readonly></label>
          <label>Comentarios: <textarea v-model="comentarios" placeholder="Ej. Celebración, mesa especial"></textarea></label>
          <button type="button" class="btn-verde" @click="submitReserva">Reservar</button>
   </form>
   <button class="volver-btn" @click="goBack(3)">← Cambiar fecha y hora</button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ReservasPage',
  data() {
    return {
 step: 1,
      zona: null,
      mesaId: null,
      personas: null,
      fecha: null,
      hora: null,
 comentarios: '',
      usuario: null,
      mesasZona: [],
   horasOcupadas: []
    }
  },
  mounted() {
    const usuarioGuardado = localStorage.getItem('usuario')
    if (!usuarioGuardado) {
      // Redirigir inmediatamente si no hay usuario
      window.showWarning?.('Debes iniciar sesión para realizar una reserva.', 'Autenticación Requerida', () => {
        window.location.href = '/'
      })
      // Redirigir aunque no haya función de warning
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      return
    }
    this.usuario = JSON.parse(usuarioGuardado)
    
    // Verificar que el usuario NO sea admin
    if (this.usuario.Rol === 'ADMIN') {
      window.showWarning?.('Los administradores no pueden realizar reservas desde esta página.', 'Acceso Restringido', () => {
        window.location.href = '/'
      })
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      return
    }
    
    this.setupFechaMinima()
  },
  methods: {
    selectZona(zona) {
      this.zona = zona
      this.step = 2
      this.cargarMesasPorZona()
    },
    async cargarMesasPorZona() {
      try {
        console.log('🔍 Cargando mesas para zona:', this.zona)
        const response = await fetch(`https://reserva-production-279b.up.railway.app/api/reservas/mesas/2?tipo=${this.zona}`)
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('📦 Respuesta completa del API:', result)
        
        // El API devuelve { success, mensaje, data: [] }
        if (result.success && Array.isArray(result.data)) {
          this.mesasZona = result.data
          console.log('✅ Mesas encontradas:', this.mesasZona.length)
          
          if (this.mesasZona.length === 0) {
            if (typeof window.showWarning === 'function') {
              window.showWarning(`No hay mesas disponibles en la zona ${this.zona}`)
            }
          }
        } else {
          console.error('❌ Formato de respuesta inesperado:', result)
          this.mesasZona = []
        }
        
        this.renderMesas()
      } catch (err) {
        console.error('❌ Error cargando mesas:', err)
        if (typeof window.showError === 'function') {
          window.showError('Error al cargar las mesas. Por favor, intenta de nuevo.')
        } else {
          alert('Error al cargar las mesas')
        }
      }
    },
  renderMesas() {
      const cont = document.getElementById('listaMesas')
      cont.innerHTML = ''
      
      if (this.mesasZona.length === 0) {
        cont.innerHTML = '<p style="color: white; text-align: center; font-size: 18px;">No hay mesas disponibles en esta zona</p>'
        return
      }
      
      this.mesasZona.forEach(m => {
        const imgSrc = m.imagenURL?.trim() || 'https://via.placeholder.com/220x140?text=Mesa'
        const precio = m.precio || m.Precio || 0
        const div = document.createElement('div')
        div.id = `mesa-${m.idMesa}`
        div.style.cssText = 'width:220px; background:white; border-radius:15px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.25); cursor:pointer; display:inline-block; margin:10px;'
        div.innerHTML = `
          <img src="${imgSrc}" style="width:100%; height:140px; object-fit:cover;" alt="Mesa ${m.numeroMesa}">
          <div style="padding:10px; color:#000;">
            <h3 style="margin:0; color:#1a4d2e; font-size:18px;">Mesa ${m.numeroMesa}</h3>
            <p style="margin:4px 0; font-size:14px; color:#000;">Capacidad: <b>${m.capacidad} personas</b></p>
            <p style="margin:4px 0; font-size:16px; color:#1a4d2e; font-weight:bold;">Precio: $${precio.toFixed(2)}</p>
          </div>
        `
        div.addEventListener('click', () => this.seleccionarMesa(m.idMesa, m.capacidad))
        cont.appendChild(div)
      })
    },
    seleccionarMesa(idMesa, capacidad) {
      this.mesaId = idMesa
      this.personas = capacidad
      
      // Actualizar estilos de selección
      this.mesasZona.forEach(m => {
        const card = document.getElementById('mesa-' + m.idMesa)
        if (card) card.style.border = '3px solid transparent'
      })
      const selectedCard = document.getElementById('mesa-' + idMesa)
      if (selectedCard) selectedCard.style.border = '3px solid #1a4d2e'
      
      this.step = 3
    },
    async validarFecha() {
      if (!this.fecha) return
      if (!this.mesaId) {
        console.warn('⚠️ No hay mesa seleccionada')
        return
      }
      
      try {
        console.log('🔍 Cargando horas disponibles para mesa:', this.mesaId, 'fecha:', this.fecha)
        
        const select = document.getElementById('horaSeleccion')
        select.innerHTML = '<option value="">Cargando...</option>'
        
        // Verificar ocupación en paralelo con timeout de 2 segundos
        this.horasOcupadas = []
        const promesas = []
        
        for (let h = 8; h <= 22; h++) {
          const horaFormateada = `${h.toString().padStart(2, '0')}:00`
          
          const promesa = Promise.race([
            fetch(`https://reserva-production-279b.up.railway.app/api/mesas/${this.mesaId}/ocupada?fecha=${this.fecha}&hora=${horaFormateada}`)
              .then(response => response.ok ? response.json() : null)
              .then(result => {
                if (result && result.success && result.data && result.data.ocupada === true) {
                  return { hora: `${h.toString().padStart(2, '0')}:00:00`, ocupada: true }
                }
                return { hora: `${h.toString().padStart(2, '0')}:00:00`, ocupada: false }
              }),
            new Promise((resolve) => setTimeout(() => resolve({ hora: `${h.toString().padStart(2, '0')}:00:00`, ocupada: false }), 2000))
          ]).catch(() => ({ hora: `${h.toString().padStart(2, '0')}:00:00`, ocupada: false }))
          
          promesas.push(promesa)
        }
        
        // Esperar máximo 2.5 segundos por todas las respuestas
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve([]), 2500))
        const resultados = await Promise.race([
          Promise.all(promesas),
          timeoutPromise
        ])
        
        // Actualizar las horas ocupadas
        if (resultados.length > 0) {
          this.horasOcupadas = resultados
            .filter(r => r.ocupada === true)
            .map(r => r.hora)
          
          console.log('📋 Horas ocupadas encontradas:', this.horasOcupadas)
        }
        
        // Cargar las horas disponibles (filtrando las ocupadas)
        this.cargarHorasDisponibles()
        
      } catch (err) {
        console.error('❌ Error al cargar disponibilidad:', err)
        this.cargarHorasDisponibles()
      }
    },
    cargarHorasDisponibles() {
      const select = document.getElementById('horaSeleccion')
      select.innerHTML = '<option value="">-- Selecciona una hora --</option>'
      
      // Obtener la hora actual
      const ahora = new Date()
      const horaActual = ahora.getHours()
      const minutosActuales = ahora.getMinutes()
      
      // Verificar si la fecha seleccionada es dentro de 2 días
      const fechaSeleccionada = new Date(this.fecha + 'T00:00:00')
      const hoyMas2Dias = new Date()
      hoyMas2Dias.setDate(hoyMas2Dias.getDate() + 2)
      hoyMas2Dias.setHours(0, 0, 0, 0)
      
      const esDentroDe2Dias = fechaSeleccionada.getTime() === hoyMas2Dias.getTime()
      
      // Calcular hora mínima permitida (1 hora después de la hora actual)
      let horaMinima = 8 // Por defecto, desde las 8 AM
      
      if (esDentroDe2Dias) {
        // Si es para pasado mañana, la hora mínima es 1 hora después de ahora
        horaMinima = horaActual + 1
        // Si son más de X minutos, redondear a la siguiente hora
        if (minutosActuales > 0) {
          horaMinima = horaActual + 2
        }
      }
      
      console.log('⏰ Hora actual:', horaActual + ':' + minutosActuales)
      console.log('⏰ Es dentro de 2 días:', esDentroDe2Dias)
      console.log('⏰ Hora mínima permitida:', horaMinima)
      
      for (let h = 8; h <= 22; h++) {
        const horaSql = `${h.toString().padStart(2, '0')}:00:00`
        
        // Si esta hora está ocupada, saltarla
        if (this.horasOcupadas.includes(horaSql)) {
          console.log('⏰ Hora ocupada:', h + ':00')
          continue
        }
        
        // Si es dentro de 2 días y la hora es menor a la hora mínima permitida, saltarla
        if (esDentroDe2Dias && h < horaMinima) {
          console.log('⏰ Hora demasiado pronto:', h + ':00')
          continue
        }
        
        // Convertir a formato 12 horas con AM/PM
        const hora12 = h > 12 ? h - 12 : (h === 0 ? 12 : h)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const horaFormateada = `${h.toString().padStart(2, '0')}:00`
        const horaDisplay = `${hora12.toString().padStart(2, '0')}:00 ${ampm}`
        
        select.innerHTML += `<option value="${horaFormateada}">${horaDisplay}</option>`
      }
      
      console.log('✅ Horas disponibles cargadas')
    },
    async confirmarFechaHora() {
      if (!this.fecha || !this.hora) {
        if (typeof window.showWarning === 'function') {
          window.showWarning('Por favor, selecciona fecha y hora.')
        } else {
          alert('Por favor, selecciona fecha y hora.')
        }
        return
      }

      // Verificar si la mesa está ocupada en esa fecha y hora
      try {
        console.log('🔍 Verificando disponibilidad de mesa:', this.mesaId)
        const horaFormateada = this.convertirHoraA24(this.hora)
        const response = await fetch(`https://reserva-production-279b.up.railway.app/api/mesas/${this.mesaId}/ocupada?fecha=${this.fecha}&hora=${horaFormateada}`)
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('📦 Respuesta disponibilidad:', result)
        
        // Verificar si la mesa está ocupada
        if (result.success && result.data && result.data.ocupada === true) {
          console.log('❌ Mesa ocupada')
          if (typeof window.showError === 'function') {
            window.showError(`Lo sentimos, la mesa ya está ocupada para el ${this.fecha} a las ${this.hora}. Por favor, selecciona otra hora.`, 'Mesa No Disponible')
          } else {
            alert('Lo sentimos, la mesa ya está ocupada en ese horario. Por favor, selecciona otra hora.')
          }
          return
        }
        
        // Si la mesa está disponible, continuar
        console.log('✅ Mesa disponible, continuando...')
        this.step = 4
        
      } catch (err) {
        console.error('❌ Error verificando disponibilidad:', err)
        if (typeof window.showError === 'function') {
          window.showError('Error al verificar la disponibilidad de la mesa. Por favor, intenta de nuevo.')
        } else {
          alert('Error al verificar la disponibilidad')
        }
      }
    },
    async submitReserva() {
      console.log('📝 Creando reserva...')
      console.log('Usuario:', this.usuario)
      console.log('Mesa:', this.mesaId)
      console.log('Fecha:', this.fecha)
      console.log('Hora:', this.hora)
      
      const horaFormateada = this.convertirHoraA24(this.hora)
      
      const requestData = {
        idUsuario: this.usuario.IdUsuario,
        idMesa: this.mesaId,
        idRestaurante: 2,
        fechaReserva: this.fecha,
        horaReserva: horaFormateada,
        numeroPersonas: this.personas,
        notas: this.comentarios || '',
        estado: 'HOLD'
      }
      
      console.log('📤 Datos a enviar:', requestData)
      
      try {
        const response = await fetch('https://reserva-production-279b.up.railway.app/api/reservas/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })
        
        console.log('📥 Respuesta status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Error del servidor:', errorText)
          throw new Error(`Error ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('✅ Reserva creada:', result)
        
        // Guardar la reserva confirmada
        localStorage.setItem('reservaConfirmada', JSON.stringify({
          IdReserva: result.idReserva || result.data?.idReserva,
          Fecha: this.fecha,
          Hora: this.hora,
          NumeroPersonas: this.personas,
          Observaciones: this.comentarios,
          Estado: 'HOLD'
        }))
        
        if (typeof window.showSuccess === 'function') {
          window.showSuccess('Tu reserva ha sido creada exitosamente', '¡Reserva Confirmada!', () => {
            window.location.href = '/confirmacion'
          })
        } else {
          alert('¡Reserva creada exitosamente!')
          window.location.href = '/confirmacion'
        }
        
      } catch (err) {
        console.error('❌ Error al crear reserva:', err)
        if (typeof window.showError === 'function') {
          window.showError('Error al crear la reserva. Por favor, intenta de nuevo.')
        } else {
          alert('Error al crear la reserva')
        }
      }
    },
    convertirHoraA24(hora12) {
      // Limpiar la hora de espacios y caracteres extraños
      let horaLimpia = hora12.trim()
      
      // Si ya está en formato 24 horas (HH:MM o HH:MM:SS), retornarla
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(horaLimpia)) {
        const partes = horaLimpia.split(':')
        const hora = partes[0].padStart(2, '0')
        const minutos = partes[1]
        return `${hora}:${minutos}`
      }
      
      // Eliminar espacios extra y caracteres no imprimibles
      horaLimpia = horaLimpia.replace(/\s+/g, ' ').trim()
      
      // Extraer solo la parte HH:MM del string
      const match = horaLimpia.match(/(\d{1,2}):(\d{2})/)
      if (match) {
        const hora = match[1].padStart(2, '0')
        const minutos = match[2]
        return `${hora}:${minutos}`
      }
      
      // Fallback: intentar split por :
      const partes = horaLimpia.split(':')
      if (partes.length >= 2) {
        const hora = parseInt(partes[0]).toString().padStart(2, '0')
        const minutos = partes[1].replace(/\D/g, '').substring(0, 2).padStart(2, '0')
        return `${hora}:${minutos}`
      }
      
      console.error('❌ Formato de hora no reconocido:', hora12)
      return '12:00'
    },
    goBack(targetStep) {
      this.step = targetStep
    },
    setupFechaMinima() {
      const d = new Date()
      // Fecha mínima: pasado mañana (2 días desde hoy)
      d.setDate(d.getDate() + 2)
      const min = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      setTimeout(() => {
        const input = document.getElementById('fechaSeleccion')
        if (input) input.min = min
      }, 100)
    }
  }
}
</script>

<style scoped>
/* === FORMULARIO DE RESERVAS === */
.reserva-form {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fffaf2;
text-align: center;
  z-index: 0;
  background-image: url("/img/Cafe.png");
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.reserva-form::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 0;
}

.reserva-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
  background: transparent;
  padding: 20px;
  width: 100%;
  max-width: 900px;
  animation: fadeInUp 0.8s ease-out;
  position: relative;
z-index: 1;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.zona-opciones, .personas-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
  margin-bottom: 30px;
}

.zona-opciones button, .personas-grid button {
  background-color: #6b8e23;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 40px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
}

.zona-opciones button:hover, .personas-grid button:hover {
  background-color: #557a1b;
  transform: scale(1.08);
}

/* === FORMULARIO MEJORADO === */
.reserva-formulario {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin: 0 auto;
  gap: 20px;
  width: 100%;
  max-width: 480px;
  text-align: left;
}

.reserva-formulario label {
  color: #ffffff !important;
  font-weight: 600;
  font-size: 17px;
  margin-bottom: 5px;
  display: block;
}

.reserva-formulario input::placeholder,
.reserva-formulario textarea::placeholder {
  color: #eaeaea;
}

.reserva-formulario input,
.reserva-formulario select,
.reserva-formulario textarea {
  width: 100%;
  padding: 14px 18px;
  font-size: 1.05em;
  border-radius: 10px;
border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.45);
  color: #ffffff !important;
  outline: none;
transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.reserva-formulario input:focus,
.reserva-formulario select:focus,
.reserva-formulario textarea:focus {
  border-color: #9acd32;
  background: rgba(107, 142, 35, 0.3);
  box-shadow: 0 0 10px rgba(154, 205, 50, 0.4);
}

/* SELECT personalizado */
.reserva-formulario select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,<svg fill='white' height='20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5 7l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
}

.reserva-formulario select option {
  background-color: #3e2f21;
  color: #fff;
  padding: 10px;
  font-size: 1em;
}

/* Bot�n principal */
.btn-verde {
  background-color: #6b8e23;
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 35px;
  font-weight: 700;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.btn-verde:hover {
  background: linear-gradient(135deg, #8dbb35, #6b8e23);
  transform: scale(1.07);
}

/* Bot�n volver */
.volver-btn {
  font-size: 1.05em;
  padding: 12px 30px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  font-weight: 600;
  transition: all 0.3s ease;
}

.volver-btn:hover {
  background-color: #6b8e23;
  color: #fff;
  border-color: #6b8e23;
  transform: scale(1.05);
}

/* Animaciones */
.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.campo {
  background: rgba(255, 255, 255, 0.97) !important;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.campo label,
.campo input,
.campo select {
  color: #000000 !important;
  font-weight: 600;
}

.campo input,
.campo select {
  background: #fff !important;
  border: 2px solid #bbb !important;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 16px;
}

.contenedor-fecha-hora {
  display: flex;
  justify-content: center;
  gap: 45px;
  flex-wrap: wrap;
  margin: 20px 0 35px;
}

#listaMesas {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

/* === SCROLLBAR PERSONALIZADO === */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(107, 142, 35, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6b8e23, #8dbb35);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #8dbb35, #6b8e23);
}
</style>
