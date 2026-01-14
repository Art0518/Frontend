<template>
  <div class="mis-reservas-page">
    <h1>Mis Reservas</h1>
    <div id="mis-reservas-container">
 <!-- El HTML se renderizar� mediante JavaScript -->
 </div>
  </div>
</template>

<script>
export default {
  name: 'MisReservasPage',
  mounted() {
    const script = document.createElement('script')
  script.src = '/js/mis-reservas.js'
    document.body.appendChild(script)
  }
}
</script>

<style scoped>
/* === P�GINA MIS RESERVAS === */
.mis-reservas-page {
  width: 100%;
  min-height: 90vh;
  padding: 100px 20px;
  background-color: #fffaf2;
}

.mis-reservas-page h1 {
  font-family: "Playfair Display", serif;
  font-size: 2.8em;
  text-align: center;
  margin-bottom: 40px;
  color: #3e2f21;
}

#mis-reservas-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Estilos para las tarjetas de reservas (generadas por JS) */
:deep(.reserva-card) {
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 25px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

:deep(.reserva-card:hover) {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

:deep(.reserva-card h3) {
  font-family: "Playfair Display", serif;
  color: #3e2f21;
  font-size: 1.5em;
  margin-bottom: 15px;
}

:deep(.reserva-info) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

:deep(.reserva-info p) {
  color: #4a3b2e;
  font-size: 1em;
  margin: 5px 0;
}

:deep(.reserva-info strong) {
  color: #2e2418;
  font-weight: 700;
}

/* Estados de reserva */
:deep(.estado-confirmada) {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9em;
  display: inline-block;
  box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3);
}

:deep(.estado-hold) {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
font-weight: 700;
  font-size: 0.9em;
  display: inline-block;
  box-shadow: 0 3px 10px rgba(255, 193, 7, 0.4);
}

:deep(.estado-cancelada) {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9em;
  display: inline-block;
  box-shadow: 0 3px 10px rgba(220, 53, 69, 0.4);
}

/* Botones de acci�n */
:deep(.btn-cancelar) {
  background: linear-gradient(135deg, #dc3545, #e74c3c);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(220, 53, 69, 0.3);
}

:deep(.btn-cancelar:hover) {
  background: linear-gradient(135deg, #e74c3c, #dc3545);
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
}

:deep(.btn-detalle) {
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(107, 142, 35, 0.3);
  margin-right: 10px;
}

:deep(.btn-detalle:hover) {
  background: linear-gradient(135deg, #8dbb35, #6b8e23);
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(107, 142, 35, 0.4);
}

/* Mensaje cuando no hay reservas */
:deep(.no-reservas) {
  text-align: center;
  padding: 60px 20px;
  background: rgba(107, 142, 35, 0.05);
  border-radius: 15px;
  margin: 40px auto;
  max-width: 600px;
}

:deep(.no-reservas h3) {
font-family: "Playfair Display", serif;
font-size: 1.8em;
  color: #3e2f21;
  margin-bottom: 15px;
}

:deep(.no-reservas p) {
  color: #5a4a3a;
  font-size: 1.1em;
  margin-bottom: 25px;
}

:deep(.no-reservas a) {
  display: inline-block;
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  color: white;
  padding: 12px 35px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 142, 35, 0.3);
}

:deep(.no-reservas a:hover) {
  background: linear-gradient(135deg, #8dbb35, #6b8e23);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(107, 142, 35, 0.4);
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

/* Responsive */
@media (max-width: 768px) {
  .mis-reservas-page {
    padding: 80px 15px;
  }

  .mis-reservas-page h1 {
    font-size: 2.2em;
  }

  :deep(.reserva-info) {
    grid-template-columns: 1fr;
  }

  :deep(.btn-detalle),
  :deep(.btn-cancelar) {
    width: 100%;
    margin: 5px 0;
  }
}
</style>
