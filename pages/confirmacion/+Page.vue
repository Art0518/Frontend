<template>
  <div class="confirmacion-container">
    <div class="confirmacion-box">
      <h2>¡Reserva Confirmada!</h2>
      <div id="detalleReserva"></div>
    <a href="/" class="btn-verde" style="display:inline-block; margin-top:20px; text-decoration:none;">Volver al inicio</a>
      <a href="/mis-reservas" class="btn-verde" style="display:inline-block; margin-top:20px; margin-left:10px; text-decoration:none;">Ver mis reservas</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmacionPage',
  mounted() {
    const reservaConfirmada = JSON.parse(localStorage.getItem('reservaConfirmada'))
  if (!reservaConfirmada) {
      window.location.href = '/'
      return
    }
    
    const detalle = document.getElementById('detalleReserva')
    detalle.innerHTML = `
      <p><strong>Fecha:</strong> ${reservaConfirmada.Fecha}</p>
      <p><strong>Hora:</strong> ${reservaConfirmada.Hora}</p>
      <p><strong>Número de Personas:</strong> ${reservaConfirmada.NumeroPersonas}</p>
      <p><strong>Mesa:</strong> ${reservaConfirmada.IdMesa}</p>
      <p><strong>Observaciones:</strong> ${reservaConfirmada.Observaciones || 'Ninguno'}</p>
      <p><strong>Estado:</strong> <span class="estado-hold">${reservaConfirmada.Estado}</span></p>
    `
  }
}
</script>

<style scoped>
/* === CONFIRMACI�N DE RESERVA � ESTILOS ESPECIALIZADOS === */
.confirmacion-container {
  margin-top: 20px !important;
  min-height: calc(100vh - 300px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #fffaf2 0%, #fdf7ec 100%);
  flex: 1;
}

.confirmacion-box {
  background: #ffffff;
  padding: 60px 80px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  text-align: center;
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  border: 1px solid rgba(107, 142, 35, 0.1);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.confirmacion-box:hover {
  transform: translateY(-5px);
}

/* Efecto decorativo superior */
.confirmacion-box::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #6b8e23, #8dbb35, #6b8e23);
  border-radius: 30px 30px 0 0;
}

/* Icono de �xito decorativo */
.confirmacion-box::after {
  content: "?";
  position: absolute;
  top: -15px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.confirmacion-box h2 {
  font-family: "Playfair Display", serif !important;
  color: #3e2f21 !important;
  font-size: 2.8em !important;
  margin: 30px 0 40px 0 !important;
  font-weight: 700 !important;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Contenedor de detalles mejorado */
#detalleReserva {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  padding: 40px;
  margin: 30px 0;
  border-left: 6px solid #6b8e23;
  text-align: left;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
}

#detalleReserva p {
  font-size: 1.3em !important;
  color: #3e2f21 !important;
  margin: 20px 0 !important;
  font-weight: 500 !important;
  line-height: 1.8;
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(107, 142, 35, 0.1);
}

#detalleReserva p:last-child {
  border-bottom: none;
}

#detalleReserva strong {
  color: #2e2418 !important;
  font-weight: 700 !important;
  display: inline-block;
  min-width: 180px;
  margin-right: 20px;
  font-size: 1.1em;
}

/* Iconos sin emojis - usando s�mbolos simples */
#detalleReserva p:nth-child(1) strong::before,
#detalleReserva p:nth-child(2) strong::before,
#detalleReserva p:nth-child(3) strong::before,
#detalleReserva p:nth-child(4) strong::before,
#detalleReserva p:nth-child(5) strong::before,
#detalleReserva p:nth-child(6) strong::before {
  content: "� ";
  color: #6b8e23;
}

/* Valores de los campos */
#detalleReserva p span:not([style]) {
  color: #495057;
  font-weight: 600;
  background: rgba(107, 142, 35, 0.1);
  padding: 5px 12px;
  border-radius: 15px;
  display: inline-block;
}

/* Estado confirmada especial */
#detalleReserva p .estado-confirmada {
  background: linear-gradient(135deg, #28a745, #20c997) !important;
  color: white !important;
  padding: 8px 20px !important;
  border-radius: 25px !important;
  font-weight: 700 !important;
  box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3) !important;
}

/* Estado HOLD (en espera) */
#detalleReserva p .estado-hold {
  background: linear-gradient(135deg, #ffc107, #ff9800) !important;
  color: white !important;
  padding: 8px 20px !important;
  border-radius: 25px !important;
  font-weight: 700 !important;
  box-shadow: 0 3px 10px rgba(255, 193, 7, 0.4) !important;
}

/* Estado cancelada */
#detalleReserva p .estado-cancelada {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
  color: white !important;
  padding: 8px 20px !important;
  border-radius: 25px !important;
  font-weight: 700 !important;
  box-shadow: 0 3px 10px rgba(220, 53, 69, 0.4) !important;
}

/* Estado general para cualquier estado */
#detalleReserva p .estado-badge {
  padding: 8px 20px !important;
  border-radius: 25px !important;
  font-weight: 700 !important;
  color: white !important;
  text-transform: uppercase;
  font-size: 0.9em;
  letter-spacing: 0.5px;
}

/* Bot�n verde */
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
</style>
