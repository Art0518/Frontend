<template>
  <div class="gestion-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <i class="bi bi-clipboard-check"></i>
          <h1>Gestion de Reservas - Administrador</h1>
        </div>
        <button class="btn-actualizar" @click="cargarTodasReservas">
          <i class="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>
      <p class="subtitle">Visualiza todas las reservas y gestiona la facturacion</p>
    </div>

    <!-- Tarjetas de Estadisticas -->
    <div class="stats-grid">
      <div class="stat-card stat-blue">
        <div class="stat-content">
          <div class="stat-info">
            <h4>Total Reservas</h4>
            <h2>{{ estadisticas.total }}</h2>
          </div>
          <div class="stat-icon">
            <i class="bi bi-calendar-event"></i>
          </div>
        </div>
      </div>

      <div class="stat-card stat-yellow">
        <div class="stat-content">
          <div class="stat-info">
            <h4>En Espera</h4>
            <h2>{{ estadisticas.hold }}</h2>
          </div>
          <div class="stat-icon">
            <i class="bi bi-clock-history"></i>
          </div>
        </div>
      </div>

      <div class="stat-card stat-green">
        <div class="stat-content">
          <div class="stat-info">
            <h4>Confirmadas</h4>
            <h2>{{ estadisticas.confirmadas }}</h2>
          </div>
          <div class="stat-icon">
            <i class="bi bi-check-circle"></i>
          </div>
        </div>
      </div>

      <div class="stat-card stat-cyan">
        <div class="stat-content">
          <div class="stat-info">
            <h4>Total Ingresos</h4>
            <h2>${{ estadisticas.ingresos }}</h2>
          </div>
          <div class="stat-icon">
            <i class="bi bi-currency-dollar"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Listado de Reservas -->
    <div class="reservas-card">
      <h3><i class="bi bi-table"></i> Listado de Reservas</h3>

      <!-- Loading -->
      <div v-if="cargando" class="loading-state">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando reservas...</p>
      </div>

      <!-- Tabla con reservas -->
      <div v-else-if="reservasFiltradas.length > 0" class="table-container">
        <table class="reservas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Fecha</th>
              <th>Personas</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reserva in reservasFiltradas" :key="reserva.IdReserva || reserva.idReserva">
              <td>{{ reserva.IdUsuario || reserva.idUsuario }}</td>
              <td>
                <div>
                  <strong>ID Usuario: {{ reserva.IdUsuario || reserva.idUsuario }}</strong>
                  <br>
                  {{ reserva.NombreCliente || reserva.NombreUsuario || reserva.nombreUsuario || '' }}
                </div>
              </td>
              <td>Mesa {{ reserva.NumeroMesa || reserva.numeroMesa }}</td>
              <td>{{ formatearFecha(reserva.Fecha || reserva.fecha) }}</td>
              <td>{{ reserva.NumeroPersonas || reserva.numeroPersonas }}</td>
              <td>${{ Number(reserva.Total || reserva.total || 0).toFixed(2) }}</td>
              <td>
                <span
                  :class="[
                    'badge',
                    (reserva.Estado || reserva.estado) === 'CONFIRMADA' ? 'badge-success' :
                    (reserva.Estado || reserva.estado) === 'HOLD' ? 'badge-warning' : 'badge-secondary'
                  ]"
                >
                  {{ reserva.Estado || reserva.estado || 'Pendiente' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado vacio -->
      <div v-else class="empty-state">
        <i class="bi bi-inbox"></i>
        <h3>No hay reservas</h3>
        <p>No se encontraron reservas con los filtros aplicados.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'AdminFacturacionPage',
  setup() {
    const reservas = ref([])
    const filtroEstado = ref('')
    const cargando = ref(false)

    const estadisticas = computed(() => {
      return {
        total: reservas.value.length,
        hold: reservas.value.filter(r => (r.Estado || r.estado) === 'HOLD').length,
        confirmadas: reservas.value.filter(r => (r.Estado || r.estado) === 'CONFIRMADA').length,
        ingresos: reservas.value.reduce((sum, r) => sum + (Number(r.Total || r.total) || 0), 0).toFixed(2)
      };
    })

    const reservasFiltradas = computed(() => {
      if (!filtroEstado.value) {
        return reservas.value
   }
      return reservas.value.filter(r => r.Estado === filtroEstado.value)
 })

    const cargarTodasReservas = async () => {
      cargando.value = true
      try {
        const response = await fetch('https://reserva-production-279b.up.railway.app/api/reservas')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          reservas.value = data.data;
        } else {
          throw new Error(data.mensaje || 'Error desconocido al cargar reservas');
        }
      } catch (error) {
        console.error('Error cargando reservas:', error);
        if (typeof window.showError === 'function') {
          window.showError('Error', error.message);
        }
      } finally {
        cargando.value = false;
      }
    }

    const aplicarFiltros = () => {
      if (typeof window.showSuccess === 'function') {
        window.showSuccess('Filtros aplicados', `Mostrando ${reservasFiltradas.value.length} reservas`)
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

    const verDetalles = (reserva) => {
      if (typeof window.showInfo === 'function') {
        const mensaje = `
  <strong>Cliente:</strong> ${reserva.NombreCliente}<br>
        <strong>Mesa:</strong> ${reserva.NumeroMesa}<br>
        <strong>Fecha:</strong> ${formatearFecha(reserva.Fecha)}<br>
<strong>Hora:</strong> ${reserva.Hora}<br>
          <strong>Personas:</strong> ${reserva.NumeroPersonas}<br>
          <strong>Total:</strong> $${(reserva.Total || 0).toFixed(2)}<br>
          <strong>Estado:</strong> ${reserva.Estado}<br>
          ${reserva.Observaciones ? `<strong>Observaciones:</strong> ${reserva.Observaciones}` : ''}
  `
        window.showInfo('Detalles de la Reserva', mensaje)
      }
  }

    const generarFactura = async (reserva) => {
      if (typeof window.showConfirm === 'function') {
        window.showConfirm(
    `Generar factura para la reserva #${reserva.IdReserva}?`,
          async () => {
      try {
   const response = await fetch('/api/facturas/generar', {
  method: 'POST',
    headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
       IdReserva: reserva.IdReserva,
         IdUsuario: reserva.IdUsuario
})
  })

              const data = await response.json()

        if (data.success) {
       if (typeof window.showSuccess === 'function') {
      window.showSuccess(
        'Factura generada',
              `Factura #${data.IdFactura} creada exitosamente`
              )
      }
       cargarTodasReservas()
     } else {
          if (typeof window.showError === 'function') {
 window.showError('Error', data.message || 'No se pudo generar la factura')
          }
        }
 } catch (error) {
        console.error('Error generando factura:', error)
 if (typeof window.showError === 'function') {
      window.showError('Error', 'Error al generar la factura')
 }
            }
     },
   () => {
       console.log('Generacion de factura cancelada')
     }
        )
    }
    }

    onMounted(() => {
      cargarTodasReservas()
    })

    return {
      reservas,
      filtroEstado,
      cargando,
      estadisticas,
      reservasFiltradas,
      cargarTodasReservas,
      aplicarFiltros,
      formatearFecha,
      verDetalles,
    generarFactura
    }
  }
}
</script>

<style scoped>
.gestion-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 20px 40px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header */
.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title-section i {
  font-size: 2.5rem;
  color: #2563eb;
}

.title-section h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.btn-actualizar {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-actualizar:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

/* Tarjetas de Estadisticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  border-radius: 12px;
  padding: 25px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-yellow {
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
}

.stat-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.stat-cyan {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info h4 {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  opacity: 0.95;
}

.stat-info h2 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
}

.stat-icon {
  font-size: 3.5rem;
  opacity: 0.3;
}

/* Tarjeta de Reservas */
.reservas-card {
  background: white;
  border-radius: 12px;
  padding: 0;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.reservas-card > h3 {
  background: #3b82f6;
  color: white;
  padding: 18px 24px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tabla */
.table-container {
  overflow-x: auto;
}

.reservas-table {
  width: 100%;
  border-collapse: collapse;
}

.reservas-table thead {
  background: #1e293b;
  color: white;
}

.reservas-table th {
  padding: 14px 12px;
text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reservas-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.reservas-table tbody tr:hover {
  background: #f8fafc;
}

.badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-info {
  background: #3b82f6;
}

.btn-info:hover {
  background: #2563eb;
}

.btn-success {
  background: #22c55e;
}

.btn-success:hover {
  background: #16a34a;
}

/* Estados */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-state .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
}

.empty-state i {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 15px;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #64748b;
  margin: 15px 0 8px;
}

.empty-state p {
  color: #94a3b8;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .gestion-page {
    padding-top: 100px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filtros-content {
 grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: scroll;
  }

  .reservas-table {
    font-size: 0.85rem;
  }
}
</style>
