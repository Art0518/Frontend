<template>
  <div>
    <div class="contenedor">
      <div class="header-seccion">
        <h1>Gestión de Promociones</h1>
        <select v-model="estadoFiltro" @change="cargarPromociones" class="filtro-estado">
          <option value="">Todas</option>
          <option value="ACTIVA">Activas</option>
          <option value="INACTIVA">Inactivas</option>
        </select>
        <button class="btn-agregar" @click="abrirModal()">Nueva Promoción</button>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando promociones...</p>
      </div>

      <!-- Tabla de Promociones -->
      <div v-else-if="promociones.length > 0" class="tabla-promociones">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descuento (%)</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promocion in promociones" :key="promocion.IdPromocion">
              <td>{{ promocion.IdPromocion }}</td>
              <td>{{ promocion.Descuento }}%</td>
              <td>{{ formatearFecha(promocion.FechaInicio) }}</td>
              <td>{{ formatearFecha(promocion.FechaFin) }}</td>
              <td>
                <span 
                  :class="[
                    'estado-badge',
                    promocion.Estado === 'Activa' ? 'estado-activa' : 'estado-inactiva'
                  ]"
                >
                  {{ promocion.Estado }}
                </span>
              </td>
              <td>
                <div class="acciones">
                  <button class="btn-editar" @click="editarPromocion(promocion)">
                    <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button class="btn-eliminar" @click="eliminarPromocion(promocion)">
                    <i class="bi bi-trash"></i> Inactivar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

   <!-- Mensaje vac�o -->
      <div v-else class="mensaje-vacio">
        <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
        <h3>No hay promociones registradas</h3>
        <p>Crea una nueva promocion para comenzar.</p>
      </div>
  </div>

    <!-- Modal -->
    <div class="modal" :style="{ display: mostrarModal ? 'flex' : 'none' }">
      <div class="modal-content">
    <div class="modal-header">
          <h2>{{ promocionEditando ? 'Editar Promocion' : 'Nueva Promocion' }}</h2>
          <button class="btn-cerrar" @click="cerrarModal()">&times;</button>
      </div>

        <form @submit.prevent="guardarPromocion()">
          <div class="campo">
            <label>Descuento (%) *</label>
            <input 
              v-model.number="promocionForm.porcentajeDescuento" 
              type="number" 
              placeholder="Ej: 25" 
              min="0.01" 
              max="100" 
              step="0.01" 
              required
              @paste.prevent
            />
          </div>

          <div class="campo">
            <label>Fecha de Inicio *</label>
            <input 
              v-model="promocionForm.fechaInicio" 
              type="date" 
              :min="fechaMinimaInicio"
              required
            />
          </div>

          <div class="campo">
            <label>Fecha de Fin *</label>
            <input 
              v-model="promocionForm.fechaFin" 
              type="date" 
              :min="fechaMinimaFin"
              required
            />
          </div>

          <div class="campo" v-if="promocionEditando">
            <label>Estado *</label>
            <select v-model="promocionForm.estado" required>
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>

          <div class="botones-modal">
            <button type="submit" class="btn-guardar" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" class="btn-cancelar" @click="cerrarModal()">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

const API_BASE_URL = 'https://menu-production-279b.up.railway.app'

export default {
  name: 'AdminPromocionesPage',
  setup() {
    const promociones = ref([])
    const estadoFiltro = ref('')
    const cargando = ref(false)
    const guardando = ref(false)
    const mostrarModal = ref(false)
    const promocionEditando = ref(null)

    const promocionForm = ref({
      nombre: '',
      porcentajeDescuento: 0,
      fechaInicio: '',
      fechaFin: '',
      estado: 'Activa'
    })

    // Fecha mínima para inicio: mañana
    const fechaMinimaInicio = computed(() => {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const manana = new Date(hoy)
      manana.setDate(hoy.getDate() + 1)
      const year = manana.getFullYear()
      const month = String(manana.getMonth() + 1).padStart(2, '0')
      const day = String(manana.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    // Fecha mínima para fin: día siguiente a fecha de inicio
    const fechaMinimaFin = computed(() => {
      if (!promocionForm.value.fechaInicio) {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const manana = new Date(hoy)
        manana.setDate(hoy.getDate() + 1)
        const year = manana.getFullYear()
        const month = String(manana.getMonth() + 1).padStart(2, '0')
        const day = String(manana.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      const fechaInicio = new Date(promocionForm.value.fechaInicio + 'T00:00:00')
      fechaInicio.setDate(fechaInicio.getDate() + 1)
      const year = fechaInicio.getFullYear()
      const month = String(fechaInicio.getMonth() + 1).padStart(2, '0')
      const day = String(fechaInicio.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    const cargarPromociones = async () => {
      cargando.value = true
      try {
        let url = `${API_BASE_URL}/api/promociones/listar`
        
        if (estadoFiltro.value) {
          url = `${API_BASE_URL}/api/promociones/por-estado/${estadoFiltro.value}`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (Array.isArray(data)) {
          promociones.value = data.map(normalizarPromocion).sort((a, b) => a.IdPromocion - b.IdPromocion)
        } else if (data.success && Array.isArray(data.data)) {
          promociones.value = data.data.map(normalizarPromocion).sort((a, b) => a.IdPromocion - b.IdPromocion)
        } else if (data.data && Array.isArray(data.data)) {
          promociones.value = data.data.map(normalizarPromocion).sort((a, b) => a.IdPromocion - b.IdPromocion)
        } else {
          console.error('Formato inesperado:', data)
          if (typeof window.showError === 'function') {
            window.showError('Error', 'No se pudieron cargar las promociones')
          }
        }
      } catch (error) {
        console.error('Error cargando promociones:', error)
      } finally {
        cargando.value = false
      }
    }

    const normalizarPromocion = (promo) => {
      return {
        IdPromocion: promo.IdPromocion || promo.idPromocion || promo.id,
        Nombre: promo.Nombre || promo.nombre || '',
        Descuento: promo.Descuento || promo.descuento || promo.PorcentajeDescuento || promo.porcentajeDescuento || 0,
        FechaInicio: promo.FechaInicio || promo.fechaInicio || '',
        FechaFin: promo.FechaFin || promo.fechaFin || '',
        Estado: promo.Estado || promo.estado || (promo.Activo || promo.activo ? 'Activa' : 'Inactiva')
      }
    }

    const formatearFecha = (fecha) => {
      if (!fecha) return 'N/A'
  const date = new Date(fecha)
      return date.toLocaleDateString('es-ES', {
     day: '2-digit',
        month: '2-digit',
  year: 'numeric'
      })
    }

    const abrirModal = () => {
      promocionEditando.value = null
      promocionForm.value = {
        nombre: '',
        porcentajeDescuento: 0,
        fechaInicio: '',
        fechaFin: '',
        estado: 'Activa'
      }
      mostrarModal.value = true
    }

    const editarPromocion = (promocion) => {
      promocionEditando.value = promocion
      promocionForm.value = {
        nombre: promocion.Nombre,
        porcentajeDescuento: promocion.Descuento,
        fechaInicio: promocion.FechaInicio ? promocion.FechaInicio.split('T')[0] : '',
        fechaFin: promocion.FechaFin ? promocion.FechaFin.split('T')[0] : '',
        estado: promocion.Estado
      }
      mostrarModal.value = true
    }

  const cerrarModal = () => {
      mostrarModal.value = false
      promocionEditando.value = null
    }

    const guardarPromocion = async () => {
      if (!promocionForm.value.porcentajeDescuento || promocionForm.value.porcentajeDescuento <= 0 || promocionForm.value.porcentajeDescuento > 100) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'El descuento debe estar entre 0.01 y 100')
        }
        return
      }

      if (!promocionForm.value.fechaInicio || !promocionForm.value.fechaFin) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'Debe seleccionar las fechas')
        }
        return
      }

      if (new Date(promocionForm.value.fechaFin) <= new Date(promocionForm.value.fechaInicio)) {
        if (typeof window.showError === 'function') {
          window.showError('Error', 'La fecha de fin debe ser posterior')
        }
        return
      }

      guardando.value = true
      try {
        const promoData = {
          nombre: "a",
          porcentajeDescuento: parseFloat(promocionForm.value.porcentajeDescuento),
          fechaInicio: promocionForm.value.fechaInicio,
          fechaFin: promocionForm.value.fechaFin
        }

        let response
        if (promocionEditando.value) {
          response = await fetch(`${API_BASE_URL}/api/promociones/admin/${promocionEditando.value.IdPromocion}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: "a",
              porcentajeDescuento: promoData.porcentajeDescuento,
              fechaInicio: promoData.fechaInicio,
              fechaFin: promoData.fechaFin,
              estado: promocionForm.value.estado
            })
          })
        } else {
          response = await fetch(`${API_BASE_URL}/api/promociones/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promoData)
          })
        }

        const data = await response.json()

        if (response.ok || data.success) {
          if (typeof window.showSuccess === 'function') {
            window.showSuccess('Éxito', promocionEditando.value ? 'Promoción actualizada' : 'Promoción creada')
          }
          cerrarModal()
          await cargarPromociones()
        } else {
          if (typeof window.showError === 'function') {
            window.showError('Error', data.mensaje || 'No se pudo guardar')
          }
        }
      } catch (error) {
        console.error('Error:', error)
        if (typeof window.showError === 'function') {
          window.showError('Error', 'Error al guardar')
        }
      } finally {
        guardando.value = false
      }
    }

    const eliminarPromocion = (promocion) => {
      if (typeof window.showConfirm === 'function') {
        window.showConfirm(
          `¿Está seguro de inactivar esta promoción?`,
          async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/promociones/admin/${promocion.IdPromocion}`, {
                method: 'DELETE'
              })

              if (!response.ok) {
                throw new Error('Error al inactivar')
              }

              const data = await response.json()

              if (data.success) {
                if (typeof window.showSuccess === 'function') {
                  window.showSuccess('Promoción inactivada correctamente')
                }
                await cargarPromociones()
              } else {
                if (typeof window.showError === 'function') {
                  window.showError(data.mensaje || 'No se pudo inactivar')
                }
              }
            } catch (error) {
              console.error('Error:', error)
              if (typeof window.showError === 'function') {
                window.showError('Error al inactivar la promoción')
              }
            }
          },
          () => {
            console.log('Cancelado')
          }
        )
      }
    }

    onMounted(() => {
      cargarPromociones()
    })

    return {
      promociones,
      estadoFiltro,
      cargando,
      guardando,
      mostrarModal,
      promocionEditando,
      promocionForm,
      cargarPromociones,
      formatearFecha,
      abrirModal,
      editarPromocion,
      cerrarModal,
      guardarPromocion,
      eliminarPromocion,
      fechaMinimaInicio,
      fechaMinimaFin
    }
  }
}
</script>

<style scoped>
* {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  padding-top: 80px;
  background-color: #fffaf2;
}

.contenedor {
  max-width: 1100px;
  margin: 30px auto;
  padding: 20px;
  padding-top: 100px;
}

.header-seccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 15px;
}

.header-seccion h1 {
  color: #3e2f21;
  font-size: 2.2em;
  margin: 0;
  font-weight: 600;
}

.filtro-estado {
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #d4c4a8;
  background: white;
  font-size: 1em;
  cursor: pointer;
}

.filtro-estado:focus {
  outline: none;
  border-color: #6b8e23;
}

.btn-agregar {
  background: #6b8e23;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(107, 142, 35, 0.3);
}

.btn-agregar:hover {
  background: #557a1b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(107, 142, 35, 0.4);
}

.tabla-promociones {
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.tabla-promociones table {
  width: 100%;
  border-collapse: collapse;
}

.tabla-promociones thead {
  background: linear-gradient(to right, #3e2f21, #6b8e23);
  color: white;
}

.tabla-promociones th,
.tabla-promociones td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.tabla-promociones th {
  font-weight: 600;
  font-size: 0.95em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tabla-promociones tbody tr {
  transition: background 0.2s ease;
}

.tabla-promociones tbody tr:hover {
  background: #fffaf2;
}

.estado-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
}

.estado-activa {
  background: #d4edda;
  color: #155724;
}

.estado-inactiva {
  background: #f8d7da;
  color: #721c24;
}

.estado-programada {
  background: #fff3cd;
  color: #856404;
}

.acciones {
  display: flex;
  gap: 8px;
}

.btn-editar,
.btn-eliminar {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-editar {
  background: #007bff;
  color: white;
}

.btn-editar:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.btn-eliminar {
  background: #dc3545;
  color: white;
}

.btn-eliminar:hover {
  background: #c82333;
  transform: scale(1.05);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow-y: auto;
}

.modal-content {
  width: 500px;
  max-width: 90%;
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  margin: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #6b8e23;
}

.modal-header h2 {
  margin: 0;
  color: #3e2f21;
  font-size: 1.8em;
  font-weight: 600;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
}

.btn-cerrar:hover {
  color: #333;
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
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.campo input:focus,
.campo select:focus {
  outline: none;
  border-color: #6b8e23;
  box-shadow: 0 0 0 3px rgba(107, 142, 35, 0.1);
}

.botones-modal {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn-guardar,
.btn-cancelar {
  flex: 1;
  padding: 12px;
border: none;
  border-radius: 8px;
font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-guardar {
  background: #6b8e23;
  color: white;
}

.btn-guardar:hover:not(:disabled) {
  background: #557a1b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 142, 35, 0.3);
}

.btn-guardar:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-cancelar {
  background: #6c757d;
  color: white;
}

.btn-cancelar:hover {
  background: #5a6268;
}

.mensaje-vacio {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .tabla-promociones {
    overflow-x: auto;
  }

  .acciones {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    padding: 20px;
  }

  body {
    padding-top: 200px !important;
  }
}

@media screen and (max-width: 1200px) {
  body {
    padding-top: 140px !important;
  }
}

@media screen and (max-width: 1400px) {
  body {
    padding-top: 120px !important;
  }
}

@media screen and (max-width: 1600px) {
  body {
 padding-top: 100px !important;
  }
}
</style>
