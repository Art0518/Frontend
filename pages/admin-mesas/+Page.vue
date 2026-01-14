<template>
  <div>
    <main class="contenedor">
      <h1 class="titulo-pagina">☕ Administración de Mesas</h1>
      
      <button class="btn-agregar" @click="abrirModal()">
        <span>➕</span> Agregar Mesa
      </button>

      <div class="tarjeta filtros-card">
        <h3>🔍 Filtros</h3>
        <div class="filtros-grid">
          <select v-model="filtroTipo">
            <option value="">Todos los tipos</option>
            <option value="Interior">Interior</option>
            <option value="Exterior">Exterior</option>
          </select>
          <select v-model="filtroEstado">
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Inactiva">Inactiva</option>
          </select>
          <select v-model="filtroCapacidad">
            <option value="">Todas las capacidades</option>
            <option v-for="cap in capacidadesUnicas" :key="cap" :value="cap">
              {{ cap }} persona{{ cap !== 1 ? 's' : '' }}
            </option>
          </select>
        </div>
      </div>

      <div id="lista-mesas">
        <!-- Loading -->
        <div v-if="cargando" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando mesas...</p>
        </div>

        <!-- Lista de mesas -->
        <div v-else-if="mesasFiltradas.length > 0" class="mesas-grid">
          <div v-for="mesa in mesasFiltradas" :key="mesa.IdMesa" class="mesa-card">
            <div class="mesa-imagen">
              <img 
                :src="mesa.ImagenURL || defaultImage" 
                :alt="'Mesa ' + mesa.NumeroMesa"
                @error="handleImageError($event)"
              />
              <span :class="['estado-badge', getEstadoClass(mesa.Estado)]">
                {{ mesa.Estado }}
              </span>
            </div>
            <div class="mesa-info">
              <h3>Mesa {{ mesa.NumeroMesa }}</h3>
              <div class="mesa-detalles">
                <span>📍 {{ mesa.TipoMesa }}</span>
                <span>👥 {{ mesa.Capacidad }}</span>
                <span>💰 ${{ mesa.Precio?.toFixed(2) || '0.00' }}</span>
              </div>
            </div>
            <div class="mesa-acciones">
              <button class="btn-editar" @click="editarMesa(mesa)" title="Editar">
                ✏️
              </button>
              <button 
                v-if="mesa.Estado.toUpperCase() !== 'INACTIVA'" 
                class="btn-inactivar" 
                @click="cambiarEstadoMesa(mesa, 'Inactiva')"
                title="Inactivar"
              >
                🚫
              </button>
              <button 
                v-else 
                class="btn-activar" 
                @click="cambiarEstadoMesa(mesa, 'Disponible')"
                title="Activar"
              >
                ✅
              </button>
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-else class="sin-resultados">
          <span class="icono-vacio">🍽️</span>
          <h5>No hay mesas</h5>
          <p>No se encontraron mesas con los filtros aplicados.</p>
        </div>
      </div>

      <!-- MODAL -->
      <div class="modal-overlay" v-if="mostrarModal" @click.self="cerrarModal">
        <div class="modal-content">
          <button class="modal-close" @click="cerrarModal">×</button>
          <h2>{{ mesaEditando ? '✏️ Editar Mesa' : '➕ Nueva Mesa' }}</h2>

          <div class="campo">
            <label>Número de Mesa</label>
            <input 
              v-model.number="mesaForm.numeroMesa" 
              type="number" 
              placeholder="Ej: 1, 2, 3..." 
              min="1"
              step="1"
              @keypress="validarSoloEnteros"
              required 
            />
          </div>

          <div class="campo">
            <label>Tipo de Mesa</label>
            <select v-model="mesaForm.tipoMesa" required>
              <option value="Interior">Interior</option>
              <option value="Exterior">Exterior</option>
            </select>
          </div>

          <div class="campo">
            <label>Capacidad (personas)</label>
            <input 
              v-model.number="mesaForm.capacidad" 
              type="number" 
              placeholder="2-10 personas" 
              min="2" 
              max="10"
              step="1"
              @keypress="validarSoloEnteros"
              required 
            />
          </div>

          <div class="campo">
            <label>Precio por Reserva ($)</label>
            <input 
              v-model.number="mesaForm.precio" 
              type="number" 
              step="0.01" 
              placeholder="Ej: 25.00" 
              min="0"
            />
          </div>

          <div class="campo" v-if="mesaEditando">
            <label>Estado</label>
            <select v-model="mesaForm.estado">
              <option value="Disponible">Disponible</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>

          <div class="campo">
            <label>Imagen de la Mesa</label>
            <div class="imagen-upload">
              <input 
                type="file" 
                accept="image/*" 
                @change="seleccionarImagen($event)" 
                ref="imagenInput"
                id="imagen-input"
              />
              <label for="imagen-input" class="btn-upload">
                📷 {{ subiendoImagen ? 'Subiendo...' : 'Seleccionar imagen' }}
              </label>
            </div>
            <div v-if="previewImagen" class="imagen-preview">
              <img :src="previewImagen" alt="Preview" />
              <button class="btn-quitar-imagen" @click="quitarImagen">🗑️ Quitar</button>
            </div>
          </div>

          <div class="modal-buttons">
            <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
            <button class="btn-guardar" @click="guardarMesa()" :disabled="guardando || subiendoImagen">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { subirImagenMesa } from '../utils/cloudinary.js'

const API_BASE = 'https://reserva-production-279b.up.railway.app'

export default {
  name: 'AdminMesasPage',
  setup() {
    const mesas = ref([])
    const filtroTipo = ref('')
    const filtroEstado = ref('')
    const filtroCapacidad = ref('')
    const cargando = ref(false)
    const guardando = ref(false)
    const subiendoImagen = ref(false)
    const mostrarModal = ref(false)
    const mesaEditando = ref(null)
    const previewImagen = ref('')
    const imagenInput = ref(null)
    const archivoImagen = ref(null)
    const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%238B4513" width="300" height="200"/%3E%3Ctext x="150" y="110" text-anchor="middle" fill="white" font-size="20"%3EMesa%3C/text%3E%3C/svg%3E'

    const mesaForm = ref({
      idRestaurante: 2,
      numeroMesa: '',
      tipoMesa: 'Interior',
      capacidad: 4,
      precio: 0,
      imagenURL: '',
      estado: 'Disponible'
    })

    const mesasFiltradas = computed(() => {
      let resultado = mesas.value

      if (filtroTipo.value) {
        resultado = resultado.filter(m => m.TipoMesa === filtroTipo.value)
      }

      if (filtroEstado.value) {
        resultado = resultado.filter(m => m.Estado === filtroEstado.value)
      }

      if (filtroCapacidad.value) {
        resultado = resultado.filter(m => m.Capacidad === parseInt(filtroCapacidad.value))
      }

      // Ordenar por número de mesa
      return resultado.sort((a, b) => a.NumeroMesa - b.NumeroMesa)
    })

    const capacidadesUnicas = computed(() => {
      const capacidades = [...new Set(mesas.value.map(m => m.Capacidad))]
      return capacidades.sort((a, b) => a - b)
    })

    const getEstadoClass = (estado) => {
      switch (estado) {
        case 'Disponible': return 'estado-disponible'
        case 'Ocupada': return 'estado-ocupada'
        case 'Inactiva': return 'estado-inactiva'
        default: return ''
      }
    }

    const handleImageError = (event) => {
      event.target.src = defaultImage
    }

    const cargarMesas = async () => {
      cargando.value = true
      try {
        // Usar endpoint de administración que devuelve TODAS las mesas (incluidas inactivas)
        const response = await fetch(`${API_BASE}/api/mesas/admin/listar?idRestaurante=2`)
        const data = await response.json()

        console.log('📥 Respuesta API:', data)

        let mesasArray = []
        
        if (Array.isArray(data)) {
          mesasArray = data
        } else if (data.success && Array.isArray(data.data)) {
          mesasArray = data.data
        } else if (data.data && Array.isArray(data.data)) {
          mesasArray = data.data
        }

        mesas.value = mesasArray.map(m => {
          const estadoRaw = m.estado || m.Estado || 'Disponible'
          // Normalizar estado a formato con primera letra mayúscula
          const estadoNormalizado = estadoRaw.charAt(0).toUpperCase() + estadoRaw.slice(1).toLowerCase()
          
          return {
            IdMesa: m.idMesa || m.IdMesa,
            NumeroMesa: m.numeroMesa || m.NumeroMesa,
            TipoMesa: m.tipoMesa || m.TipoMesa,
            Capacidad: m.capacidad || m.Capacidad,
            Precio: m.precio || m.Precio || 0,
            ImagenURL: m.imagenURL || m.ImagenURL || '',
            Estado: estadoNormalizado
          }
        })
        
        console.log('✅ Mesas cargadas:', mesas.value.length, 'total')
        console.log('📊 Estados:', {
          disponibles: mesas.value.filter(m => m.Estado === 'Disponible').length,
          ocupadas: mesas.value.filter(m => m.Estado === 'Ocupada').length,
          inactivas: mesas.value.filter(m => m.Estado === 'Inactiva').length
        })
      } catch (error) {
        console.error('Error cargando mesas:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error al cargar las mesas')
        } else {
          alert('Error al cargar las mesas')
        }
      } finally {
        cargando.value = false
      }
    }

    const abrirModal = () => {
      mesaEditando.value = null
      mesaForm.value = {
        idRestaurante: 2,
        numeroMesa: '',
        tipoMesa: 'Interior',
        capacidad: 4,
        precio: 0,
        imagenURL: '',
        estado: 'Disponible'
      }
      previewImagen.value = ''
      archivoImagen.value = null
      mostrarModal.value = true
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      mesaEditando.value = null
      previewImagen.value = ''
      archivoImagen.value = null
      if (imagenInput.value) {
        imagenInput.value.value = ''
      }
    }

    const editarMesa = (mesa) => {
      mesaEditando.value = mesa
      mesaForm.value = {
        idMesa: mesa.IdMesa,
        idRestaurante: 2,
        numeroMesa: mesa.NumeroMesa,
        tipoMesa: mesa.TipoMesa,
        capacidad: mesa.Capacidad,
        precio: mesa.Precio || 0,
        imagenURL: mesa.ImagenURL || '',
        estado: mesa.Estado
      }
      previewImagen.value = mesa.ImagenURL || ''
      archivoImagen.value = null
      mostrarModal.value = true
    }

    const seleccionarImagen = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        previewImagen.value = e.target.result
      }
      reader.readAsDataURL(file)
      
      archivoImagen.value = file
    }

    const quitarImagen = () => {
      previewImagen.value = ''
      mesaForm.value.imagenURL = ''
      archivoImagen.value = null
      if (imagenInput.value) {
        imagenInput.value.value = ''
      }
    }

    const guardarMesa = async () => {
      if (!mesaForm.value.numeroMesa || mesaForm.value.numeroMesa < 1) {
        if (typeof window.showWarning === 'function') {
          window.showWarning('El numero de mesa debe ser mayor a 0')
        } else {
          alert('El numero de mesa debe ser mayor a 0')
        }
        return
      }

      if (mesaForm.value.capacidad < 2 || mesaForm.value.capacidad > 10) {
        if (typeof window.showWarning === 'function') {
          window.showWarning('La capacidad debe estar entre 2 y 6 personas')
        } else {
          alert('La capacidad debe estar entre 2 y 10 personas')
        }
        return
      }

      guardando.value = true
      
      try {
        // Subir imagen a Cloudinary si hay una nueva
        if (archivoImagen.value) {
          subiendoImagen.value = true
          try {
            const resultado = await subirImagenMesa(archivoImagen.value, 'mesas')
            mesaForm.value.imagenURL = resultado.url
            console.log('✅ Imagen subida a Cloudinary:', resultado.url)
          } catch (error) {
            console.error('❌ Error subiendo imagen:', error)
            if (typeof window.showError === 'function') {
              window.showError('Error al subir la imagen: ' + error.message)
            } else {
              alert('Error al subir la imagen: ' + error.message)
            }
            guardando.value = false
            subiendoImagen.value = false
            return
          }
          subiendoImagen.value = false
        }

        const datosEnviar = {
          IdRestaurante: 2,
          NumeroMesa: parseInt(mesaForm.value.numeroMesa),
          TipoMesa: mesaForm.value.tipoMesa,
          Capacidad: parseInt(mesaForm.value.capacidad),
          Precio: parseFloat(mesaForm.value.precio) || 0,
          ImagenURL: mesaForm.value.imagenURL || ''
        }

        if (mesaEditando.value) {
          datosEnviar.IdMesa = mesaEditando.value.IdMesa
          datosEnviar.Estado = mesaForm.value.estado
        } else {
          datosEnviar.Estado = 'Disponible'
        }

        console.log('Enviando datos:', datosEnviar)

        const response = await fetch(`${API_BASE}/api/mesas/admin/gestionar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosEnviar)
        })

        const data = await response.json()
        console.log('Respuesta del servidor:', data)

        if (response.ok && (data.success || data.Success)) {
          if (typeof window.showSuccess === 'function') {
            window.showSuccess(mesaEditando.value ? 'Mesa actualizada correctamente' : 'Mesa creada correctamente')
          } else {
            alert(mesaEditando.value ? 'Mesa actualizada correctamente' : 'Mesa creada correctamente')
          }
          cerrarModal()
          await cargarMesas()
        } else {
          let mensaje = data.mensaje || data.Mensaje || data.message || 'No se pudo guardar la mesa'
          // Corregir problemas de codificación en mensajes del servidor
          mensaje = mensaje.replace(/n�mero/g, 'número')
          if (typeof window.showError === 'function') {
            window.showError(mensaje)
          } else {
            alert(mensaje)
          }
        }
      } catch (error) {
        console.error('Error guardando mesa:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error al guardar la mesa')
        } else {
          alert('Error al guardar la mesa')
        }
      } finally {
        guardando.value = false
      }
    }

    const cambiarEstadoMesa = async (mesa, nuevoEstado) => {
      await ejecutarCambioEstado(mesa, nuevoEstado)
    }

    const ejecutarCambioEstado = async (mesa, nuevoEstado) => {
      try {
        const datosEnviar = {
          IdMesa: mesa.IdMesa,
          IdRestaurante: 2,
          NumeroMesa: parseInt(mesa.NumeroMesa),
          TipoMesa: mesa.TipoMesa,
          Capacidad: parseInt(mesa.Capacidad),
          Precio: parseFloat(mesa.Precio) || 0,
          ImagenURL: mesa.ImagenURL || '',
          Estado: nuevoEstado
        }

        const response = await fetch(`${API_BASE}/api/mesas/admin/gestionar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosEnviar)
        })

        const data = await response.json()

        if (response.ok && (data.success || data.Success)) {
          if (typeof window.showSuccess === 'function') {
            window.showSuccess(`Mesa ${nuevoEstado === 'Inactiva' ? 'inactivada' : 'activada'} correctamente`)
          } else {
            alert(`Mesa ${nuevoEstado === 'Inactiva' ? 'inactivada' : 'activada'} correctamente`)
          }
          await cargarMesas()
        } else {
          if (typeof window.showError === 'function') {
            window.showError(data.mensaje || 'No se pudo cambiar el estado')
          } else {
            alert(data.mensaje || 'No se pudo cambiar el estado')
          }
        }
      } catch (error) {
        console.error('Error cambiando estado:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error al cambiar el estado de la mesa')
        } else {
          alert('Error al cambiar el estado de la mesa')
        }
      }
    }

    const validarSoloEnteros = (event) => {
      // Prevenir el ingreso de punto, coma y signo menos
      const char = String.fromCharCode(event.keyCode || event.which)
      if (char === '.' || char === ',' || char === '-' || char === 'e' || char === 'E') {
        event.preventDefault()
      }
    }

    onMounted(() => {
      cargarMesas()
    })

    return {
      mesas,
      filtroTipo,
      filtroEstado,
      filtroCapacidad,
      cargando,
      guardando,
      subiendoImagen,
      mostrarModal,
      mesaEditando,
      previewImagen,
      imagenInput,
      mesaForm,
      mesasFiltradas,
      capacidadesUnicas,
      defaultImage,
      getEstadoClass,
      handleImageError,
      cargarMesas,
      abrirModal,
      cerrarModal,
      editarMesa,
      seleccionarImagen,
      quitarImagen,
      guardarMesa,
      cambiarEstadoMesa,
      ejecutarCambioEstado,
      validarSoloEnteros
    }
  }
}
</script>

<style>
.contenedor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 40px;
}

.titulo-pagina {
  font-family: "Playfair Display", serif;
  color: #3e2f21;
  font-size: 2em;
  margin-bottom: 25px;
  text-align: center;
}

.btn-agregar {
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 142, 35, 0.3);
}

.btn-agregar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 142, 35, 0.4);
}

.filtros-card {
  background: #fffaf2;
  border: 2px solid #e8e0d5;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
}

.filtros-card h3 {
  margin: 0 0 15px 0;
  color: #3e2f21;
  font-size: 1.1em;
}

.filtros-grid {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filtros-grid select {
  padding: 10px 15px;
  border-radius: 10px;
  border: 2px solid #e8e0d5;
  background: white;
  color: #3e2f21;
  font-size: 0.95em;
  min-width: 180px;
  cursor: pointer;
}

.filtros-grid select:focus {
  outline: none;
  border-color: #6b8e23;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e8e0d5;
  border-top-color: #6b8e23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.mesas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.mesa-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.mesa-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.mesa-imagen {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.mesa-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.estado-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
  color: white;
}

.estado-disponible { background: linear-gradient(135deg, #28a745, #20c997); }
.estado-ocupada { background: linear-gradient(135deg, #f0ad4e, #ec971f); }
.estado-inactiva { background: linear-gradient(135deg, #6c757d, #545b62); }

.mesa-info {
  padding: 15px;
}

.mesa-info h3 {
  margin: 0 0 10px 0;
  color: #3e2f21;
  font-family: "Playfair Display", serif;
}

.mesa-detalles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mesa-detalles span {
  background: #f5f0e8;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.85em;
  color: #6b5a48;
}

.mesa-acciones {
  display: flex;
  gap: 8px;
  padding: 0 15px 15px;
}

.mesa-acciones button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-editar { background: #e3f2fd; }
.btn-editar:hover { background: #bbdefb; transform: scale(1.05); }

.btn-inactivar { background: #ffebee; }
.btn-inactivar:hover { background: #ffcdd2; transform: scale(1.05); }

.btn-activar { background: #e8f5e9; }
.btn-activar:hover { background: #c8e6c9; transform: scale(1.05); }

.sin-resultados {
  text-align: center;
  padding: 60px 20px;
  color: #8b7355;
}

.icono-vacio {
  font-size: 4em;
  display: block;
  margin-bottom: 15px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  padding: 30px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 1.5em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #ffebee;
  color: #dc3545;
}

.modal-content h2 {
  margin: 0 0 25px 0;
  color: #3e2f21;
  font-family: "Playfair Display", serif;
}

.campo {
  margin-bottom: 18px;
}

.campo label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #3e2f21;
  font-size: 0.95em;
}

.campo input,
.campo select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e8e0d5;
  border-radius: 10px;
  font-size: 1em;
  background: #fafafa;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.campo input:focus,
.campo select:focus {
  outline: none;
  border-color: #6b8e23;
  background: white;
}

.imagen-upload {
  position: relative;
}

.imagen-upload input[type="file"] {
  display: none;
}

.btn-upload {
  display: inline-block;
  padding: 12px 20px;
  background: #f5f0e8;
  border: 2px dashed #c9b18a;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.btn-upload:hover {
  background: #efe8dc;
  border-color: #6b8e23;
}

.imagen-preview {
  margin-top: 15px;
  position: relative;
}

.imagen-preview img {
  width: 100%;
  border-radius: 10px;
  max-height: 200px;
  object-fit: cover;
}

.btn-quitar-imagen {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85em;
  cursor: pointer;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn-cancelar,
.btn-guardar {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background: #f5f5f5;
  color: #666;
}

.btn-cancelar:hover {
  background: #e0e0e0;
}

.btn-guardar {
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  color: white;
  box-shadow: 0 4px 15px rgba(107, 142, 35, 0.3);
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 142, 35, 0.4);
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .filtros-grid {
    flex-direction: column;
  }
  
  .filtros-grid select {
    width: 100%;
  }
  
  .mesas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
