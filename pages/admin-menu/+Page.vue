<template>
  <div>
    <div class="contenedor">
      <div class="tarjeta">
     <h2 style="color: #5a4a3a; margin-bottom: 20px;">Administracion del Menu</h2>

        <!-- Filtros y b�squeda -->
        <div class="filtros-container">
          <input 
            v-model="busquedaPlato" 
            type="text" 
            placeholder="Buscar plato..."
            @input="filtrarPlatos"
          />
          <button class="btn-nuevo-plato" @click="abrirModalNuevo()">+ Nuevo Plato</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Cargando...</span>
          </div>
   <p class="mt-2 text-muted">Cargando platos...</p>
        </div>

        <!-- Grid de platos -->
        <div v-else-if="platosFiltrados.length > 0" class="grid-platos">
          <div v-for="plato in platosFiltrados" :key="plato.IdPlato" class="plato-card">
            <div class="plato-imagen-container">
              <img 
                v-if="plato.Imagen" 
                :src="plato.Imagen" 
                :alt="plato.Nombre" 
                class="plato-imagen"
                @error="$event.target.style.display='none'"
              />
              <div v-else class="plato-sin-imagen">
                <span>🍽️</span>
              </div>
            </div>
            <div class="plato-content">
   <h3 class="plato-nombre">{{ plato.Nombre }}</h3>
           <p class="plato-descripcion">{{ plato.Descripcion }}</p>
     <div class="plato-precio">${{ plato.Precio?.toFixed(2) || '0.00' }}</div>
        <span 
       :class="[
           'plato-estado',
         plato.Disponibilidad === 'Disponible' ? 'estado-disponible' : 'estado-no-disponible'
        ]"
   >
    {{ plato.Disponibilidad }}
 </span>
              <div class="plato-acciones">
                <button class="btn-editar" @click="editarPlato(plato)">
                  <i class="bi bi-pencil"></i> Editar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-else class="sin-resultados">
          <h3>No se encontraron platos</h3>
          <p>Intenta con otros filtros o agrega un nuevo plato.</p>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar plato -->
    <div class="modal" :style="{ display: mostrarModal ? 'block' : 'none' }">
      <div class="modal-content">
        <span class="close" @click="cerrarModal()">&times;</span>
        <h3>{{ platoEditando ? 'Editar Plato' : 'Nuevo Plato' }}</h3>

        <form @submit.prevent="guardarPlato()">
          <div class="form-group">
            <label for="nombrePlato">Nombre del Plato:</label>
            <input 
              v-model="platoForm.nombre" 
              type="text" 
              required
              @input="validarNombre"
              maxlength="100"
            />
            <small style="color: #888; font-size: 12px;">Solo letras, espacios, ñ y tildes (á, é, í, ó, ú)</small>
          </div>

          <div class="form-group">
            <label for="descripcionPlato">Descripción:</label>
            <textarea 
              v-model="platoForm.descripcion" 
              required
              @input="validarDescripcion"
              maxlength="500"
            ></textarea>
            <small style="color: #888; font-size: 12px;">Letras, números, ñ, tildes y puntuación básica (.,;:?!"-)</small>
          </div>

          <div class="form-group">
            <label for="precioPlato">Precio:</label>
            <input 
              v-model.number="platoForm.precio" 
              type="number" 
              step="0.01" 
              min="0.01" 
              required
              @keypress="validarNumero"
              @paste.prevent
            />
          </div>

          <div class="form-group">
            <label for="categoriaPlato">Categoría:</label>
            <select v-model="platoForm.categoria" required @change="platoForm.tipoComida = platoForm.categoria">
              <option value="">Seleccionar categoría</option>
              <option value="Otros">Otros</option>
              <option value="Postre">Postre</option>
              <option value="Bebida">Bebida</option>
            </select>
          </div>

          <div class="form-group">
            <label for="imagenPlatoFile">Subir Imagen (Cloudinary):</label>
            <input 
              type="file" 
              accept="image/*"
              @change="previewImagen($event)"
              ref="imagenInput"
            />
            <small style="color: #888; font-size: 12px;">Formatos: JPG, PNG. Máximo 10MB</small>
          </div>

          <div class="form-group" v-if="previewImagenUrl">
            <label>Vista previa:</label>
            <img 
              :src="previewImagenUrl" 
              alt="Preview" 
              style="max-width: 100%; max-height: 200px; display: block; border-radius: 8px; margin-top: 10px;"
            />
          </div>

          <div style="text-align: right;">
            <button type="submit" class="btn-guardar" :disabled="guardando || subiendoImagen">
              {{ subiendoImagen ? 'Subiendo imagen...' : guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

// Configuración de Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dt7fbonmg'
const CLOUDINARY_UPLOAD_PRESET = 'menu_upload'
const API_BASE_URL = 'https://menu-production-279b.up.railway.app'

export default {
  name: 'AdminMenuPage',
  setup() {
    const platos = ref([])
    const platosFiltrados = ref([])
    const busquedaPlato = ref('')
    const filtroEstado = ref('')
    const cargando = ref(false)
    const guardando = ref(false)
    const subiendoImagen = ref(false)
    const mostrarModal = ref(false)
    const platoEditando = ref(null)
    const previewImagenUrl = ref('')
    const imagenInput = ref(null)
    const imagenFile = ref(null)

    const platoForm = ref({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      tipoComida: '',
      imagenURL: '',
      estado: 'ACTIVO'
    })

    const cargarPlatos = async () => {
      cargando.value = true
      try {
        const response = await fetch(`${API_BASE_URL}/api/platos/listar`)
        const data = await response.json()

        // El API puede devolver array directamente o con estructura { success, data }
        if (Array.isArray(data)) {
          platos.value = data.map(normalizarPlato)
          platosFiltrados.value = platos.value
        } else if (data.success && Array.isArray(data.data)) {
          platos.value = data.data.map(normalizarPlato)
          platosFiltrados.value = platos.value
        } else if (data.data && Array.isArray(data.data)) {
          platos.value = data.data.map(normalizarPlato)
          platosFiltrados.value = platos.value
        } else {
          console.error('Formato de datos inesperado:', data)
          if (typeof window.showError === 'function') {
            window.showError('Error', 'No se pudieron cargar los platos')
          }
        }
      } catch (error) {
        console.error('Error cargando platos:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error', 'Error de conexión al cargar platos')
        }
      } finally {
        cargando.value = false
      }
    }

    // Normalizar los campos del plato (maneja diferentes formatos de API)
    const normalizarPlato = (plato) => {
      const estadoRaw = plato.Estado || plato.estado || 'ACTIVO'
      const estadoNormalizado = estadoRaw.toUpperCase()
      
      return {
        IdPlato: plato.IdPlato || plato.idPlato || plato.id,
        Nombre: plato.Nombre || plato.nombre || '',
        Descripcion: plato.Descripcion || plato.descripcion || '',
        Precio: plato.Precio || plato.precio || 0,
        Categoria: plato.Categoria || plato.categoria || '',
        TipoComida: plato.TipoComida || plato.tipoComida || plato.Categoria || plato.categoria || '',
        Imagen: plato.ImagenURL || plato.imagenURL || plato.imagenUrl || plato.Imagen || plato.imagen || '',
        Estado: estadoNormalizado,
        Disponibilidad: estadoNormalizado === 'ACTIVO' ? 'Disponible' : 'No Disponible'
      }
    }

    const filtrarPlatos = () => {
      const termino = busquedaPlato.value.toLowerCase()
      platosFiltrados.value = platos.value.filter(plato => {
        const coincideBusqueda = plato.Nombre.toLowerCase().includes(termino) ||
          plato.Descripcion.toLowerCase().includes(termino) ||
          plato.Categoria.toLowerCase().includes(termino)
        
        // Solo mostrar platos activos
        return coincideBusqueda && plato.Estado === 'ACTIVO'
      })
    }

    const abrirModalNuevo = () => {
      platoEditando.value = null
      platoForm.value = {
        nombre: '',
        descripcion: '',
        precio: 0,
        categoria: '',
        tipoComida: '',
        imagenURL: '',
        estado: 'ACTIVO'
      }
      previewImagenUrl.value = ''
      imagenFile.value = null
      if (imagenInput.value) {
        imagenInput.value.value = ''
      }
      mostrarModal.value = true
    }

    const editarPlato = (plato) => {
      platoEditando.value = plato
      platoForm.value = {
        nombre: plato.Nombre,
        descripcion: plato.Descripcion,
        precio: plato.Precio,
        categoria: plato.Categoria,
        tipoComida: plato.TipoComida || plato.Categoria,
        imagenURL: plato.Imagen,
        estado: plato.Estado
      }
      previewImagenUrl.value = plato.Imagen || ''
      imagenFile.value = null
      mostrarModal.value = true
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      platoEditando.value = null
      previewImagenUrl.value = ''
      imagenFile.value = null
      if (imagenInput.value) {
        imagenInput.value.value = ''
      }
    }

    const previewImagen = (event) => {
      const file = event.target.files[0]
      if (file) {
        imagenFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImagenUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const subirImagenCloudinary = async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      formData.append('folder', 'menu')

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        )

        if (!response.ok) {
          throw new Error('Error al subir imagen a Cloudinary')
        }

        const data = await response.json()
        return data.secure_url
      } catch (error) {
        console.error('Error subiendo imagen:', error)
        throw error
      }
    }

    const validarNombre = (event) => {
      const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]*$/
      if (!regex.test(event.target.value)) {
        platoForm.value.nombre = event.target.value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '')
      }
    }

    const validarDescripcion = (event) => {
      const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,;:?!"'\-]*$/
      if (!regex.test(event.target.value)) {
        platoForm.value.descripcion = event.target.value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,;:?!"'\-]/g, '')
      }
    }

    const validarNumero = (event) => {
      const char = String.fromCharCode(event.keyCode || event.which)
      // Solo permitir números y punto decimal, NO negativos ni otros caracteres
      const regex = /^[0-9.]$/
      if (!regex.test(char)) {
        event.preventDefault()
      }
      // Evitar múltiples puntos decimales
      if (char === '.' && event.target.value.includes('.')) {
        event.preventDefault()
      }
    }

    const guardarPlato = async () => {
      // Validaciones básicas
      if (!platoForm.value.nombre || platoForm.value.nombre.trim().length < 3) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'El nombre debe tener al menos 3 caracteres')
        }
        return
      }

      if (!platoForm.value.descripcion || platoForm.value.descripcion.trim().length < 10) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'La descripción debe tener al menos 10 caracteres')
        }
        return
      }

      if (!platoForm.value.precio || platoForm.value.precio <= 0) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'El precio debe ser mayor a 0')
        }
        return
      }

      if (!platoForm.value.categoria) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'Debe seleccionar una categoría')
        }
        return
      }

      if (!platoForm.value.estado) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'Debe seleccionar un estado')
        }
        return
      }

      guardando.value = true
      try {
        // Si hay un archivo de imagen, subirlo primero a Cloudinary
        if (imagenFile.value) {
          subiendoImagen.value = true
          try {
            platoForm.value.imagenURL = await subirImagenCloudinary(imagenFile.value)
          } catch (error) {
            if (typeof window.showError === 'function') {
              window.showError('Error', 'No se pudo subir la imagen a Cloudinary')
            }
            return
          } finally {
            subiendoImagen.value = false
          }
        }

        // Preparar datos para enviar
        const platoData = {
          nombre: platoForm.value.nombre.trim(),
          categoria: platoForm.value.categoria,
          tipoComida: platoForm.value.tipoComida || platoForm.value.categoria,
          descripcion: platoForm.value.descripcion.trim(),
          precio: parseFloat(platoForm.value.precio),
          imagenURL: platoForm.value.imagenURL || '',
          estado: platoForm.value.estado
        }

        let response
        if (platoEditando.value) {
          // Actualizar plato existente
          response = await fetch(`${API_BASE_URL}/api/platos/${platoEditando.value.IdPlato}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(platoData)
          })
        } else {
          // Crear nuevo plato
          response = await fetch(`${API_BASE_URL}/api/platos/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(platoData)
          })
        }

        const data = await response.json()

        if (response.ok || data.success) {
          if (typeof window.showSuccess === 'function') {
            window.showSuccess(
              'Éxito',
              platoEditando.value ? 'Plato actualizado correctamente' : 'Plato creado correctamente'
            )
          }
          cerrarModal()
          await cargarPlatos()
        } else {
          if (typeof window.showError === 'function') {
            window.showError('Error', data.mensaje || data.message || 'No se pudo guardar el plato')
          }
        }
      } catch (error) {
        console.error('Error guardando plato:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error', 'Error al guardar el plato')
        }
      } finally {
        guardando.value = false
      }
    }

    const eliminarPlato = (plato) => {
      if (typeof window.showConfirm === 'function') {
        window.showConfirm(
          `¿Está seguro de eliminar el plato "${plato.Nombre}"?`,
          async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/platos/${plato.IdPlato}`, {
                method: 'DELETE'
              })

              const data = await response.json()

              if (response.ok || data.success) {
                if (typeof window.showSuccess === 'function') {
                  window.showSuccess('Éxito', 'Plato eliminado correctamente')
                }
                await cargarPlatos()
              } else {
                if (typeof window.showError === 'function') {
                  window.showError('Error', data.mensaje || data.message || 'No se pudo eliminar el plato')
                }
              }
            } catch (error) {
              console.error('Error eliminando plato:', error)
              if (typeof window.showError === 'function') {
                window.showError('Error', 'Error al eliminar el plato')
              }
            }
          },
          () => {
            console.log('Eliminación cancelada')
          }
        )
      }
    }

    const toggleDisponibilidad = async (plato) => {
      const nuevoEstado = plato.Estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/platos/${plato.IdPlato}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: plato.Nombre,
            categoria: plato.Categoria,
            tipoComida: plato.TipoComida,
            descripcion: plato.Descripcion,
            precio: plato.Precio,
            imagenURL: plato.Imagen,
            estado: nuevoEstado
          })
        })

        const data = await response.json()

        if (response.ok || data.success) {
          if (typeof window.showSuccess === 'function') {
            window.showSuccess('Éxito', `Plato marcado como ${nuevoEstado}`)
          }
          await cargarPlatos()
        } else {
          if (typeof window.showError === 'function') {
            window.showError('Error', data.mensaje || data.message || 'No se pudo cambiar la disponibilidad')
          }
        }
      } catch (error) {
        console.error('Error cambiando disponibilidad:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error', 'Error al cambiar la disponibilidad')
        }
      }
    }

    onMounted(() => {
      cargarPlatos()
    })

    return {
      platos,
      platosFiltrados,
      busquedaPlato,
      filtroEstado,
      cargando,
      guardando,
      subiendoImagen,
      mostrarModal,
      platoEditando,
      previewImagenUrl,
      imagenInput,
      imagenFile,
      platoForm,
      cargarPlatos,
      filtrarPlatos,
      abrirModalNuevo,
      editarPlato,
      cerrarModal,
      previewImagen,
      validarNombre,
      validarDescripcion,
      validarNumero,
      guardarPlato,
      eliminarPlato,
      toggleDisponibilidad
    }
  }
}
</script>

<style scoped>
body {
  padding-top: 90px;
}

.contenedor {
  max-width: 1200px;
  margin: 30px auto;
  padding: 10px;
  padding-top: 100px;
}

.tarjeta {
  background: #fffaf2;
  border: 1px solid #e6d5b8;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.filtros-container {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.filtros-container input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid #d4c4a8;
  background: #fffdf7;
  font-size: 14px;
}

.filtros-container input:focus {
  outline: none;
  border-color: #6b8e23;
  box-shadow: 0 0 0 3px rgba(107, 142, 35, 0.1);
}

.grid-platos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.plato-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #f0e6d2;
  overflow: hidden;
  transition: all 0.3s ease;
}

.plato-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.plato-imagen-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f8f5f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plato-imagen {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #f8f5f0;
}

.plato-sin-imagen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0e6d2 0%, #e8dcc8 100%);
  font-size: 4em;
}

.plato-content {
  padding: 15px;
}

.plato-nombre {
  font-size: 16px;
  font-weight: 700;
  color: #5a4a3a;
  margin: 0 0 5px 0;
}

.plato-descripcion {
  font-size: 13px;
  color: #7a7a7a;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plato-precio {
  font-size: 18px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 10px;
}

.plato-estado {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-disponible {
  background: #c8e6c9;
  color: #2e7d32;
}

.estado-no-disponible {
  background: #ffcdd2;
  color: #d32f2f;
}

.plato-acciones {
  margin-top: 15px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-editar,
.btn-eliminar,
.btn-toggle-disponibilidad {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.2s;
}

.btn-editar {
  background: #1976d2;
  color: white;
flex: 1;
}

.btn-editar:hover {
  background: #1565c0;
}

.btn-eliminar {
  background: #d32f2f;
  color: white;
  flex: 1;
}

.btn-eliminar:hover {
  background: #c62828;
}

.btn-toggle-disponibilidad {
  background: #ff9800;
  color: white;
  flex: 2;
}

.btn-toggle-disponibilidad:hover {
  background: #f57c00;
}

.btn-nuevo-plato {
  background: #4caf50;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-nuevo-plato:hover {
  background: #388e3c;
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  margin: 50px auto;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  cursor: pointer;
  color: #888;
}

.close:hover {
  color: #000;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #5a4a3a;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d4c4a8;
  border-radius: 8px;
  box-sizing: border-box;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.btn-guardar {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #4caf50;
  color: white;
  font-weight: 600;
}

.btn-guardar:hover:not(:disabled) {
  background: #388e3c;
}

.btn-guardar:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  opacity: 0.6;
}

.sin-resultados {
  text-align: center;
  padding: 40px;
  color: #888;
}

@media (max-width: 768px) {
  .filtros-container {
    flex-direction: column;
  }

  .grid-platos {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 20px auto;
 padding: 15px;
  }
}
</style>
