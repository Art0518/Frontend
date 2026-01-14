<template>
  <div>
    <!-- Pantalla de carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="logo-wrapper">
          <img src="/img/logo-rincon.png" alt="Cafe SanJuan" class="logo-animado" />
        </div>
        <p class="loading-text">Cargando mesas disponibles...</p>
      </div>
    </div>

    <section class="section">
      <h2>Nuestras Mesas</h2>
      <p>Explora nuestra variedad de mesas disponibles</p>

      <!-- Filtros -->
      <div style="margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <select id="f-tipo-mesa" style="padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
      <option value="">Todos los tipos</option>
          <option value="Interior">Interior</option>
          <option value="Exterior">Exterior</option>
        </select>

        <select id="f-capacidad" style="padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
          <option value="">Todas las capacidades</option>
        </select>

 <input 
          id="f-numero" 
          type="text" 
      placeholder="Buscar por número de mesa..." 
          style="padding: 10px; border-radius: 8px; border: 1px solid #ccc; min-width: 250px;"
        />
    </div>

      <!-- Grid de Mesas -->
      <div id="lista-mesas" class="mesas-grid"></div>
    </section>

    <!-- Modal de Mesa -->
    <div id="modal-mesa" style="display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; justify-content: center; align-items: center;">
      <div style="background: white; padding: 25px; border-radius: 20px; max-width: 400px; width: 90%; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
        <button onclick="cerrarModalMesa()" style="position: absolute; top: -12px; right: -12px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">×</button>
        
        <div id="md-imagen-container" style="width: 100%; height: 180px; border-radius: 15px; margin-bottom: 15px; overflow: hidden; background: #f5f5f5;">
          <img id="md-imagen-mesa" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        
        <h2 id="md-numero-mesa" style="color: #3e2f21; margin-bottom: 12px; font-size: 1.5em; text-align: center;"></h2>
        
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; font-size: 0.95em;">
          <p><strong>Tipo:</strong> <span id="md-tipo"></span></p>
          <p><strong>Capacidad:</strong> <span id="md-capacidad"></span> pers.</p>
          <p><strong>Estado:</strong> <span id="md-estado"></span></p>
        </div>
     
        <p id="md-descripcion" style="line-height: 1.5; color: #666; margin-bottom: 15px; text-align: center; font-size: 0.9em;"></p>

        <button onclick="reservarMesa()" style="background: linear-gradient(135deg, #6b8e23, #8dbb35); color: white; border: none; padding: 12px 30px; border-radius: 30px; font-weight: 700; font-size: 1em; cursor: pointer; width: 100%; transition: all 0.3s ease;">
          Reservar esta mesa
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const API_MESAS = "https://reserva-production-279b.up.railway.app/api/reservas/mesas/2";
let mesasGlobal = [];

export default {
  name: 'MesasPage',
  data() {
    return {
      loading: true
    }
  },
  mounted() {
    // Simular carga inicial - solo se ejecuta en el cliente
    setTimeout(() => {
      this.cargarMesas();
    }, 1500)
  },
  methods: {
    cargarMesas() {
      // Verificar que estamos en el navegador
      if (typeof window === 'undefined') {
        console.log('Código ejecutándose en servidor, omitiendo fetch');
        return;
      }
      
      fetch(API_MESAS)
        .then(r => r.json())
        .then(data => {
          console.log("Datos recibidos del API:", data);
          
          let mesas = [];
          
          // El endpoint devuelve un array directamente o { success, mensaje, data }
          if (Array.isArray(data)) {
            mesas = data;
          } else if (data.success && data.data) {
            mesas = data.data;
          } else if (data.data) {
            mesas = data.data;
          } else {
            console.error("No se pudieron cargar las mesas:", data.mensaje || data);
            this.loading = false;
            return;
          }
          
          // Normalizar los nombres de los campos (el API puede devolver en minúsculas o PascalCase)
          mesasGlobal = mesas.map(m => {
            const estadoRaw = m.Estado || m.estado || 'Disponible'
            // Normalizar estado a formato con primera letra mayúscula
            const estadoNormalizado = estadoRaw.charAt(0).toUpperCase() + estadoRaw.slice(1).toLowerCase()
            
            return {
              IdMesa: m.IdMesa || m.idMesa || m.id,
              NumeroMesa: m.NumeroMesa || m.numeroMesa || m.numero,
              TipoMesa: m.TipoMesa || m.tipoMesa || m.tipo || 'N/A',
              Capacidad: m.Capacidad || m.capacidad,
              Estado: estadoNormalizado,
              ImagenURL: m.ImagenURL || m.imagenURL || m.imagenUrl || m.imagen || ''
            }
          });
          
          console.log("Mesas normalizadas:", mesasGlobal);
          this.poblarCapacidades(mesasGlobal);
          this.renderMesas(mesasGlobal);
          this.loading = false;
        })
        .catch(err => {
          console.error("Error cargando mesas:", err);
          this.loading = false;
        });
    },
    poblarCapacidades(mesas) {
      const selectCapacidad = document.getElementById('f-capacidad');
      if (!selectCapacidad) return;
      
      // Obtener capacidades únicas y ordenarlas
      const capacidades = [...new Set(mesas.map(m => m.Capacidad))].sort((a, b) => a - b);
            console.log('Capacidades detectadas:', capacidades);
      console.log('Total mesas:', mesas.length);
            // Limpiar opciones excepto la primera ("Todas las capacidades")
      while (selectCapacidad.options.length > 1) {
        selectCapacidad.remove(1);
      }
      
      // Agregar opciones dinámicamente
      capacidades.forEach(cap => {
        const option = document.createElement('option');
        option.value = cap;
        option.textContent = `${cap} persona${cap !== 1 ? 's' : ''}`;
        selectCapacidad.appendChild(option);
      });
    },
    renderMesas(lista) {
      const cont = document.getElementById("lista-mesas");
      cont.innerHTML = "";

      if (lista.length === 0) {
    cont.innerHTML = '<p style="text-align: center; color: #5a4a3a; font-size: 1.2em; padding: 40px;">No se encontraron mesas</p>';
        return;
      }

    lista.forEach(m => {
        const estadoClass = m.Estado === 'Disponible' ? 'estado-disponible' : 'estado-ocupada';
        const tipoIcon = m.TipoMesa === 'Interior' ? '☕' : m.TipoMesa === 'Exterior' ? '🧋' : m.TipoMesa === 'Terraza' ? '🍵' : m.TipoMesa?.includes('VIP') ? '🥂' : '☕';
        
        cont.innerHTML += `
     <div class="mesa-btn" onclick="abrirModalMesa(${m.IdMesa})">
        <div class="mesa-icon">${tipoIcon}</div>
        <span class="mesa-numero">Mesa ${m.NumeroMesa}</span>
        <div class="mesa-detalles">
          <span class="detalle">${m.TipoMesa || 'N/A'}</span>
          <span class="detalle">👥 ${m.Capacidad}</span>
        </div>
        <span class="${estadoClass}">${m.Estado || 'Disponible'}</span>
    </div>
      `;
      });
      
      // Inicializar filtros después de renderizar
      this.setupFiltros();
    },
    setupFiltros() {
      document.getElementById("f-tipo-mesa").onchange = this.filtrar.bind(this);
   document.getElementById("f-capacidad").onchange = this.filtrar.bind(this);
      document.getElementById("f-numero").onkeyup = this.filtrar.bind(this);
    },
    filtrar() {
const tipo = document.getElementById("f-tipo-mesa").value;
      const capacidad = document.getElementById("f-capacidad").value;
      const numero = document.getElementById("f-numero").value.toLowerCase();

      let lista = mesasGlobal;

   if (tipo) lista = lista.filter(m => m.TipoMesa === tipo);
      if (capacidad) {
        if (capacidad === "8") {
          lista = lista.filter(m => m.Capacidad >= 8);
   } else {
          lista = lista.filter(m => m.Capacidad == capacidad);
     }
      }
      if (numero) {
        lista = lista.filter(m => 
        (m.NumeroMesa?.toString() || "").toLowerCase().includes(numero)
);
      }

    this.renderMesas(lista);
    }
  }
}

// Funciones globales para el modal
window.abrirModalMesa = function(idMesa) {
  const m = mesasGlobal.find(x => x.IdMesa == idMesa);
  if (!m) return;

  const imgSrc = m.ImagenURL?.trim();
  const imgContainer = document.getElementById("md-imagen-container");
  
  if (imgContainer) {
    if (imgSrc) {
      imgContainer.innerHTML = `<img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=\\'background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5em; font-weight: 700;\\'>Mesa ${m.NumeroMesa}</div>'">`;
    } else {
      imgContainer.innerHTML = `<div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5em; font-weight: 700;">Mesa ${m.NumeroMesa}</div>`;
    }
  }
  
  document.getElementById("md-numero-mesa").innerText = `Mesa ${m.NumeroMesa}`;
  document.getElementById("md-tipo").innerText = m.TipoMesa || "N/A";
  document.getElementById("md-capacidad").innerText = m.Capacidad || "N/A";
  
  const estadoTexto = m.Estado || "Disponible";
  const estadoClass = estadoTexto === 'Disponible' ? 'estado-disponible' : 'estado-ocupada';
  document.getElementById("md-estado").innerHTML = `<span class="${estadoClass}">${estadoTexto}</span>`;
  
  document.getElementById("md-descripcion").innerText = 
  `Mesa ${m.TipoMesa?.toLowerCase() || 'interior'} con capacidad para ${m.Capacidad} personas. ${estadoTexto === 'Disponible' ? 'Disponible para reservar.' : 'Actualmente ocupada.'}`;

  document.getElementById("modal-mesa").style.display = "flex";
  
  // Guardar ID de mesa para reservar
  window.mesaSeleccionadaId = idMesa;
}

window.cerrarModalMesa = function() {
document.getElementById("modal-mesa").style.display = "none";
}

window.reservarMesa = function() {
  const mesa = mesasGlobal.find(m => m.IdMesa == window.mesaSeleccionadaId);
  if (!mesa) return;

if (mesa.Estado !== 'Disponible') {
    window.showWarning?.('Esta mesa no está disponible en este momento.', 'Mesa Ocupada');
    return;
  }

  // Verificar si el usuario está logueado
  const usuario = localStorage.getItem('usuario');
  if (!usuario) {
    window.showWarning?.('Debes iniciar sesión para reservar una mesa.', 'Autenticación Requerida', () => {
    window.location.href = '/';
    });
    return;
  }

  // Redirigir a reservas con la mesa preseleccionada
  localStorage.setItem('mesaPreseleccionada', JSON.stringify({
    IdMesa: mesa.IdMesa,
    NumeroMesa: mesa.NumeroMesa,
    TipoMesa: mesa.TipoMesa,
  Capacidad: mesa.Capacidad
  }));
  
  window.showSuccess?.(`Mesa ${mesa.NumeroMesa} seleccionada correctamente`, 'Continuar con la reserva', () => {
    window.location.href = '/reservas';
  });
}
</script>

<style>
/* === SECCIONES GENERALES === */
.section {
  width: 100%;
  min-height: 90vh;
  padding: 100px 20px;
  background-color: #fffaf2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.section h2 {
  font-family: "Playfair Display", serif;
  font-size: 2.4em;
  margin-bottom: 20px;
  color: #3e2f21;
}

.section p {
  max-width: 900px;
  line-height: 1.7em;
  font-size: 1.1em;
  color: #4a3b2e;
  text-align: center;
  margin-bottom: 10px;
}

/* === GRID DE MESAS === */
.mesas-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  justify-content: center;
}

.mesa-btn {
  background: linear-gradient(145deg, #ffffff, #faf7f2);
  border-radius: 50px;
  box-shadow: 0 6px 20px rgba(62, 47, 33, 0.15);
  padding: 20px 30px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  transition: all 0.3s ease;
  border: 3px solid #e8e0d5;
  position: relative;
}

.mesa-btn:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 35px rgba(107, 142, 35, 0.3);
  border-color: #6b8e23;
  background: linear-gradient(145deg, #ffffff, #f5f9ed);
}

.mesa-btn:active {
  transform: scale(0.97);
}

.mesa-icon {
  font-size: 2.2em;
  margin-bottom: 3px;
}

.mesa-numero {
  font-family: "Playfair Display", serif;
  font-size: 1.2em;
  font-weight: 700;
  color: #3e2f21;
}

.mesa-detalles {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.detalle {
  font-size: 0.82em;
  color: #6b5a48;
  background: rgba(107, 142, 35, 0.12);
  padding: 4px 10px;
  border-radius: 15px;
  font-weight: 500;
}

/* Estados de mesas */
.estado-disponible {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 6px 16px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.78em;
  margin-top: 8px;
  box-shadow: 0 3px 10px rgba(40, 167, 69, 0.35);
  letter-spacing: 0.3px;
}

.estado-ocupada {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 6px 16px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.78em;
  margin-top: 8px;
  box-shadow: 0 3px 10px rgba(220, 53, 69, 0.35);
  letter-spacing: 0.3px;
}

/* Estados en el modal */
#modal-mesa .estado-disponible,
#modal-mesa .estado-ocupada {
  padding: 6px 16px;
  font-size: 0.9em;
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

/* === PANTALLA DE CARGA === */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #fffaf2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  overflow: hidden;
}

.loading-content {
  text-align: center;
  animation: fadeInScale 0.8s ease-out;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  animation: pulse 2s ease-in-out infinite;
}

.logo-animado {
  width: 180px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.15));
}

.loading-text {
  font-size: 1.3em;
  font-weight: 600;
  color: #4a2c0a;
  font-family: 'Poppins', sans-serif;
  margin: 0;
  animation: fadeInOut 1.5s ease-in-out infinite;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .section {
    padding: 80px 15px;
  }

  .section h2 {
    font-size: 2em;
  }

  .mesas-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
    padding: 0 15px;
  }

  .mesa-image-container {
    height: 120px;
  }

  .mesa-content {
    padding: 10px 12px;
  }

  .mesa-card h3 {
    font-size: 1.1em;
  }

  .mesa-detalles {
    font-size: 0.85em;
  }
}

@media (min-width: 1200px) {
  .mesas-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .mesa-image-container {
    height: 160px;
  }
}
</style>
