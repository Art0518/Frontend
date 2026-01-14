<template>
  <div>
    <main class="clientes-container">
      <h1>Administración de Clientes</h1>

      <!-- BUSCADOR -->
   <div class="tarjeta">
    <input 
          v-model="buscador" 
          type="text" 
          placeholder="Buscar por nombre o email..."
   @input="filtrarClientes"
        />
      </div>

      <!-- TABLA -->
   <div v-if="cargando" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando clientes...</p>
 </div>

      <table v-else id="tabla-clientes">
        <thead>
       <tr>
            <th>ID</th>
            <th>Nombre</th>
  <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          <tr 
        v-for="cliente in clientesPaginados" 
   :key="cliente.IdUsuario"
        :class="{ 'fila-inactiva': cliente.Estado === 'Inactivo' }"
      >
   <td>{{ cliente.IdUsuario }}</td>
   <td>{{ cliente.Nombre }}</td>
        <td>{{ cliente.Email }}</td>
    <td>{{ cliente.Rol }}</td>
          <td>
          <span 
    :class="[
         'badge',
                  cliente.Estado === 'Activo' ? 'bg-success' : 'bg-warning'
 ]"
        >
                {{ cliente.Estado }}
    </span>
        </td>
         <td>{{ cliente.Telefono || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- PAGINACIÓN -->
      <div class="paginacion" v-if="clientesFiltrados.length > 0">
        <button 
          @click="cambiarPagina(paginaActual - 1)"
          :disabled="paginaActual === 1 || cargando"
        >
          Anterior
        </button>
        <span style="margin: 0 15px; color: #5b4230;">
          Página {{ paginaActual }} de {{ totalPaginas }} (Total: {{ clientesFiltrados.length }} clientes)
        </span>
        <button 
          @click="cambiarPagina(paginaActual + 1)"
          :disabled="paginaActual === totalPaginas || cargando"
        >
          Siguiente
        </button>
      </div>
    </main>

    <!-- MODAL EDITAR -->
    <div class="modal" :style="{ display: mostrarModal ? 'flex' : 'none' }">
  <div class="modal-content">
  <h2 style="text-align:center; color:#5c4323; margin-bottom: 20px;">
          Editar Cliente
     </h2>

        <div class="form-group">
  <label for="edit-nombre">Nombre Completo:</label>
   <input 
       v-model="clienteForm.Nombre" 
         type="text" 
     placeholder="Nombre y Apellido" 
       required
     />
    <small>Debe contener al menos nombre y apellido (solo letras, n y tildes)</small>
   </div>

 <div class="form-group">
      <label for="edit-email">Email:</label>
       <input 
   v-model="clienteForm.Email" 
            type="email" 
  placeholder="correo@ejemplo.com" 
  required
    disabled
   />
      <small>Debe ser un email valido</small>
   </div>

   <div class="form-group">
 <label for="edit-telefono">Telefono:</label>
        <input 
     v-model="clienteForm.Telefono" 
  type="tel" 
 placeholder="809-000-0000" 
    required
          />
   <small>Formato: 809/829/849-XXX-XXXX (10 digitos, el +1 es opcional)</small>
  </div>

          <div class="form-group">
      <label for="edit-direccion">Direccion:</label>
  <textarea 
     v-model="clienteForm.Direccion" 
   placeholder="Calle #001, Sector, Ciudad, Pais" 
 rows="3" 
      required
         ></textarea>
       <small>Debe incluir calle, numero, sector y ciudad (minimo 10 caracteres)</small>
    </div>

        <div class="modal-buttons">
   <button class="modal-close" @click="cerrarModal()">Cancelar</button>
          <button class="modal-save" @click="guardarCambios()" :disabled="guardando">
   {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
     </div>
   </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'AdminClientesPage',
  setup() {
    const clientes = ref([])
    const clientesFiltrados = ref([])
    const buscador = ref('')

    const cargando = ref(false)
    const guardando = ref(false)
    const mostrarModal = ref(false)
    const clienteEditando = ref(null)
    
    const paginaActual = ref(1)
    const itemsPorPagina = 50
    const totalRegistros = ref(0)

    const clienteForm = ref({
    Nombre: '',
      Email: '',
      Telefono: '',
      Direccion: ''
    })

    const totalPaginas = computed(() => {
      return Math.ceil(totalRegistros.value / itemsPorPagina)
    })

    const clientesPaginados = computed(() => {
      return clientesFiltrados.value
    })

    const cargarClientes = async () => {
      cargando.value = true
      try {
        const response = await fetch(`https://seguridad-production-279b.up.railway.app/api/usuarios/listar?pagina=${paginaActual.value}&tamanoPagina=${itemsPorPagina}`)
        const data = await response.json()
        
        console.log('📦 Datos recibidos del API:', data)

        // Manejar diferentes formatos de respuesta
        let usuariosData = []
        
        if (Array.isArray(data)) {
          // Si data es directamente un array
          usuariosData = data
        } else if (data.usuarios && Array.isArray(data.usuarios)) {
          // Si tiene la propiedad usuarios
          usuariosData = data.usuarios
        } else if (data.data && Array.isArray(data.data)) {
          // Si tiene la propiedad data
          usuariosData = data.data
        } else if (data.mensaje) {
          // Si hay un mensaje de error
          console.error('Error del backend:', data.mensaje)
          if (typeof window.showError === 'function') {
            window.showError(data.mensaje)
          }
          cargando.value = false
          return
        }

        if (usuariosData.length > 0) {
          // Normalizar los datos del API (minúsculas) a PascalCase esperado por el frontend
          const usuariosNormalizados = usuariosData.map(u => {
            let rol = u.Rol || u.rol || 'CLIENTE'
            // Normalizar Usuario a CLIENTE
            if (rol === 'Usuario') rol = 'CLIENTE'
            
            return {
              IdUsuario: u.IdUsuario || u.idUsuario,
              Nombre: u.Nombre || u.nombre || '',
              Email: u.Email || u.email || '',
              Cedula: u.Cedula || u.cedula || '',
              Rol: rol,
              Estado: u.Estado || u.estado || 'ACTIVO',
              Telefono: u.Telefono || u.telefono || '',
              Direccion: u.Direccion || u.direccion || ''
            }
          })
          
          clientes.value = usuariosNormalizados
          clientesFiltrados.value = usuariosNormalizados
          totalRegistros.value = data.total || usuariosNormalizados.length
          
          console.log('✅ Clientes cargados:', clientes.value.length)
          console.log('📊 Total registros:', totalRegistros.value)
        } else {
          console.warn('No se encontraron usuarios')
          clientes.value = []
          clientesFiltrados.value = []
          totalRegistros.value = 0
        }
      } catch (error) {
        console.error('Error cargando clientes:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error de conexión al cargar los clientes')
        }
      } finally {
        cargando.value = false
      }
    }

    const filtrarClientes = () => {
      const termino = buscador.value.toLowerCase()
      if (termino === '') {
        paginaActual.value = 1
        cargarClientes()
      } else {
        clientesFiltrados.value = clientes.value.filter(cliente => 
          cliente.Nombre.toLowerCase().includes(termino) ||
          cliente.Email.toLowerCase().includes(termino)
        )
      }
    }

    const editarCliente = (cliente) => {
      clienteEditando.value = cliente
      clienteForm.value = {
        Nombre: cliente.Nombre,
 Email: cliente.Email,
      Telefono: cliente.Telefono || '',
     Direccion: cliente.Direccion || ''
      }
      mostrarModal.value = true
}

    const cerrarModal = () => {
      mostrarModal.value = false
    clienteEditando.value = null
    }

    const guardarCambios = async () => {
   // Validaciones
  if (!clienteForm.value.Nombre || clienteForm.value.Nombre.trim().length < 3) {
  if (typeof window.showError === 'function') {
    window.showError('Error', 'El nombre debe tener al menos 3 caracteres')
   }
   return
  }

   if (!clienteForm.value.Telefono) {
     if (typeof window.showError === 'function') {
    window.showError('Error', 'El telefono es obligatorio')
  }
return
      }

  if (!clienteForm.value.Direccion || clienteForm.value.Direccion.length < 10) {
   if (typeof window.showError === 'function') {
   window.showError('Error', 'La direccion debe tener al menos 10 caracteres')
 }
 return
      }

  guardando.value = true
   try {
    const response = await fetch(`/api/usuarios/${clienteEditando.value.IdUsuario}`, {
     method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clienteForm.value)
   })

 const data = await response.json()

   if (data.success) {
     if (typeof window.showSuccess === 'function') {
     window.showSuccess('Exito', 'Cliente actualizado correctamente')
    }
    cerrarModal()
      await cargarClientes()
  } else {
     if (typeof window.showError === 'function') {
    window.showError('Error', data.message || 'No se pudo actualizar el cliente')
        }
   }
      } catch (error) {
     console.error('Error actualizando cliente:', error)
   if (typeof window.showError === 'function') {
       window.showError('Error', 'Error al actualizar el cliente')
}
 } finally {
 guardando.value = false
      }
 }

    const inactivarCliente = (cliente) => {
      if (typeof window.showConfirm === 'function') {
        window.showConfirm(
   `Esta seguro de inactivar al cliente ${cliente.Nombre}?`,
    async () => {
     await cambiarEstadoCliente(cliente.IdUsuario, 'Inactivo')
  },
  () => {
            console.log('Inactivacion cancelada')
  }
 )
 }
    }

    const activarCliente = async (cliente) => {
      await cambiarEstadoCliente(cliente.IdUsuario, 'Activo')
    }

const cambiarEstadoCliente = async (idUsuario, nuevoEstado) => {
    try {
        const response = await fetch(`/api/usuarios/estado/${idUsuario}`, {
          method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Estado: nuevoEstado })
        })

        const data = await response.json()

        if (data.success) {
          if (typeof window.showSuccess === 'function') {
    window.showSuccess('�xito', `Cliente ${nuevoEstado === 'Activo' ? 'activado' : 'inactivado'} correctamente`)
        }
   await cargarClientes()
        } else {
          if (typeof window.showError === 'function') {
    window.showError('Error', data.message || 'No se pudo cambiar el estado')
    }
   }
      } catch (error) {
        console.error('Error cambiando estado:', error)
        if (typeof window.showError === 'function') {
   window.showError('Error', 'Error al cambiar el estado del cliente')
   }
      }
    }

    const cambiarPagina = async (nuevaPagina) => {
      if (nuevaPagina < 1 || nuevaPagina > totalPaginas.value) return
      paginaActual.value = nuevaPagina
      await cargarClientes()
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    onMounted(() => {
      // Ya no verificamos autenticaci�n - permitir acceso sin login
      cargarClientes()
    })

    return {
      clientes,
      clientesFiltrados,
      buscador,
      cargando,
      guardando,
      mostrarModal,
      clienteEditando,
      clienteForm,
      paginaActual,
      totalPaginas,
      totalRegistros,
      clientesPaginados,
      cargarClientes,
      filtrarClientes,
      editarCliente,
      cerrarModal,
      guardarCambios,
      inactivarCliente,
      activarCliente,
      cambiarPagina
    }
  }
}
</script>

<style scoped>
.clientes-container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 10px;
  padding-top: 100px;
}

.tarjeta {
  background: #fffaf2;
  border: 1px solid #e6d5b8;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #5b4230;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fffdf7;
  border-radius: 16px;
  overflow: hidden;
  font-size: 15px;
}

th {
  background: #2c3e50;
  color: white;
  padding: 12px;
  font-weight: bold;
  text-align: left;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e6d5b8;
  color: #5b4230;
}

tr:hover {
background: #fff7ec;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #c9b18a;
  margin-bottom: 5px;
  background: #fffdf7;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  margin-right: 5px;
}

.acciones-cell {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
}

.btn-editar {
  background: #6b8e23;
  color: white;
  white-space: nowrap;
}

.btn-editar:hover {
  opacity: 0.9;
}

.btn-eliminar {
  background: #d9534f;
  color: white;
  white-space: nowrap;
}

.btn-eliminar:hover {
  opacity: 0.9;
}

.btn-activar {
  background: #6b8e23 !important;
  color: white !important;
  padding: 8px 14px !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  font-weight: bold !important;
  min-width: 110px !important;
  text-align: center !important;
  white-space: nowrap !important;
}

.btn-activar:hover {
  opacity: .9;
}

.paginacion {
  margin-top: 18px;
  text-align: center;
}

.paginacion button {
  padding: 8px 15px;
  border-radius: 10px;
  border: none;
  background: #6b8e23;
  color: white;
  cursor: pointer;
  margin: 0 5px;
  font-weight: bold;
}

.paginacion button:hover:not(:disabled) {
  opacity: .9;
}

.paginacion button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  opacity: 0.6;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.55);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: #fff8e8;
  width: 450px;
  padding: 30px;
  border-radius: 18px;
  border: 1px solid #e3c69c;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  animation: aparecer 0.25s ease;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes aparecer {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #5c4323;
  margin-bottom: 6px;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #c9b18a;
  background: #fffdf7;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6b8e23;
  box-shadow: 0 0 0 3px rgba(107, 142, 35, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group small {
  display: block;
  margin-top: 4px;
  color: #8b7355;
  font-size: 12px;
  font-style: italic;
}

.fila-inactiva {
  background: #fff2cc !important;
}

.modal-buttons {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.modal-save {
  background: #6b8e23;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  transition: all 0.3s ease;
}

.modal-save:hover:not(:disabled) {
  background: #5a7a1e;
  transform: translateY(-2px);
}

.modal-save:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-close {
  background: #d9534f;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #c9302c;
  transform: translateY(-2px);
}

.badge {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 0.5rem;
  color: white;
}

.bg-success {
  background-color: #6b8e23;
}

.bg-warning {
  background-color: #f0ad4e;
}

@media (max-width: 768px) {
  .modal-content {
    width: 90%;
    max-width: 450px;
  }

  table {
 font-size: 13px;
  }

  th, td {
 padding: 8px;
  }
}
</style>
