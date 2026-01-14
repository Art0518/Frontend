<template>
  <div>
    <!-- Pantalla de carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="logo-wrapper">
          <img src="/img/logo-rincon.png" alt="Un Rincon" class="logo-animado" />
        </div>
        <p class="loading-text">Cargando menu del Caribe...</p>
      </div>
    </div>

    <section class="section">
      <h2>Nuestro Menu</h2>
      <p>Explora nuestra seleccion de platillos del Caribe</p>

      <!-- Filtros -->
      <div style="margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <select id="f-categoria" style="padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
          <option value="">Todas las categorias</option>
        </select>

        <input 
          id="f-buscar" 
          type="text" 
          placeholder="Buscar plato..." 
          style="padding: 10px; border-radius: 8px; border: 1px solid #ccc; min-width: 250px;"
        />
      </div>

      <!-- Grid de Menu -->
      <div id="lista-menu" class="menu-grid"></div>
    </section>

    <!-- Modal de Plato -->
    <div id="modal-plato" style="display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; justify-content: center; align-items: center;">
      <div style="background: white; padding: 25px; border-radius: 20px; max-width: 400px; width: 90%; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
        <button onclick="cerrarModalPlato()" style="position: absolute; top: -12px; right: -12px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">×</button>
        
        <div id="md-imagen-container" style="width: 100%; height: 180px; border-radius: 15px; margin-bottom: 15px; overflow: hidden; background: #f5f5f5;">
          <img id="md-imagen-plato" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        
        <h2 id="md-nombre" style="color: #3e2f21; margin-bottom: 12px; font-size: 1.5em; text-align: center;"></h2>
        
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; font-size: 0.95em;">
          <p><strong>Categoria:</strong> <span id="md-categoria"></span></p>
          <p><strong>Precio:</strong> $<span id="md-precio"></span></p>
        </div>
     
        <p id="md-descripcion" style="line-height: 1.5; color: #666; text-align: center; font-size: 0.9em;"></p>
      </div>
    </div>
  </div>
</template>

<script>
const API_PLATOS = "https://menu-production-279b.up.railway.app/api/platos/listar";
let platosGlobal = [];

export default {
  name: 'MenuPage',
  data() {
    return {
      loading: true
    }
  },
  mounted() {
    // Simular carga inicial - solo se ejecuta en el cliente
    setTimeout(() => {
      this.cargarMenu();
    }, 1500)
  },
  methods: {
    cargarMenu() {
      // Verificar que estamos en el navegador
      if (typeof window === 'undefined') {
        console.log('Codigo ejecutandose en servidor, omitiendo fetch');
        return;
      }
      
      fetch(API_PLATOS)
        .then(r => r.json())
        .then(data => {
          console.log("Datos recibidos del API:", data);
          
          let platos = [];
          
          // El endpoint puede devolver array directamente o { success, data }
          if (Array.isArray(data)) {
            platos = data;
          } else if (data.success && Array.isArray(data.data)) {
            platos = data.data;
          } else if (data.data && Array.isArray(data.data)) {
            platos = data.data;
          } else {
            console.error("No se pudieron cargar los platos:", data.mensaje || data);
            this.loading = false;
            return;
          }
          
          // Normalizar los nombres de los campos
          platosGlobal = platos.map(p => ({
            IdPlato: p.IdPlato || p.idPlato || p.id,
            Nombre: p.Nombre || p.nombre,
            Descripcion: p.Descripcion || p.descripcion || '',
            Precio: p.Precio || p.precio || 0,
            Categoria: p.Categoria || p.categoria || 'Sin categoria',
            ImagenURL: p.ImagenURL || p.imagenURL || p.imagenUrl || p.imagen || ''
          }));
          
          console.log("Platos normalizados:", platosGlobal);
          this.poblarCategorias(platosGlobal);
          this.renderMenu(platosGlobal);
          this.loading = false;
        })
        .catch(err => {
          console.error("Error cargando menu:", err);
          this.loading = false;
        });
    },
    poblarCategorias(platos) {
      const selectCategoria = document.getElementById('f-categoria');
      if (!selectCategoria) return;
      
      // Obtener categorias unicas y ordenarlas
      const categorias = [...new Set(platos.map(p => p.Categoria))].sort();
      
      console.log('Categorias detectadas:', categorias);
      
      // Limpiar opciones excepto la primera ("Todas las categorias")
      while (selectCategoria.options.length > 1) {
        selectCategoria.remove(1);
      }
      
      // Agregar opciones dinamicamente
      categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
      });
    },
    renderMenu(lista) {
      const cont = document.getElementById("lista-menu");
      cont.innerHTML = "";

      if (lista.length === 0) {
        cont.innerHTML = '<p style="text-align: center; color: #5a4a3a; font-size: 1.2em; padding: 40px;">No se encontraron platos</p>';
        return;
      }

      lista.forEach(p => {
        const categoriaIcon = p.Categoria === 'Bebida' ? '☕' : p.Categoria === 'Entrada' ? '🍽️' : p.Categoria === 'Postre' ? '🍰' : p.Categoria === 'Plato Fuerte' ? '🍲' : '🍴';
        
        // Crear card con estructura identica a mesas
        cont.innerHTML += `
          <div class="menu-btn" onclick="abrirModalPlato(${p.IdPlato})">
            <div class="menu-icon">${categoriaIcon}</div>
            <span class="menu-nombre">${p.Nombre}</span>
            <div class="menu-detalles">
              <span class="detalle">${p.Categoria}</span>
            </div>
            <span class="estado-disponible">$${p.Precio.toFixed(2)}</span>
          </div>
        `;
      });
      
      // Inicializar filtros despues de renderizar
      this.setupFiltros();
    },
    setupFiltros() {
      document.getElementById("f-categoria").onchange = this.filtrar.bind(this);
      document.getElementById("f-buscar").onkeyup = this.filtrar.bind(this);
    },
    filtrar() {
      const categoria = document.getElementById("f-categoria").value;
      const buscar = document.getElementById("f-buscar").value.toLowerCase();

      let lista = platosGlobal;

      if (categoria) {
        lista = lista.filter(p => p.Categoria === categoria);
      }
      
      if (buscar) {
        lista = lista.filter(p =>
          p.Nombre.toLowerCase().includes(buscar) ||
          (p.Descripcion || '').toLowerCase().includes(buscar)
        );
      }

      this.renderMenu(lista);
    }
  }
}

// Funciones globales para el modal
window.abrirModalPlato = function(idPlato) {
  const p = platosGlobal.find(x => x.IdPlato == idPlato);
  if (!p) return;

  const imgSrc = p.ImagenURL?.trim();
  const imgContainer = document.getElementById("md-imagen-container");
  
  if (imgContainer) {
    if (imgSrc) {
      imgContainer.innerHTML = `<img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=&quot;background: linear-gradient(135deg, #D2691E 0%, #CD853F 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5em; font-weight: 700;&quot;>${p.Nombre}</div>'">`;
    } else {
      imgContainer.innerHTML = `<div style="background: linear-gradient(135deg, #D2691E 0%, #CD853F 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5em; font-weight: 700;">${p.Nombre}</div>`;
    }
  }

  document.getElementById("md-nombre").innerText = p.Nombre;
  document.getElementById("md-categoria").innerText = p.Categoria;
  document.getElementById("md-precio").innerText = p.Precio.toFixed(2);
  document.getElementById("md-descripcion").innerText = p.Descripcion || 'Delicioso plato del Caribe';

  document.getElementById("modal-plato").style.display = "flex";
  
  // Guardar ID de plato para agregar al carrito
  window.platoSeleccionadoId = idPlato;
}

window.cerrarModalPlato = function() {
  document.getElementById("modal-plato").style.display = "none";
}

window.agregarAlCarrito = function() {
  const plato = platosGlobal.find(p => p.IdPlato == window.platoSeleccionadoId);
  if (!plato) return;

  // Verificar si el usuario esta logueado
  const usuario = localStorage.getItem('usuario');
  if (!usuario) {
    window.showWarning?.('Debes iniciar sesion para agregar platos al carrito.', 'Autenticacion Requerida', () => {
      window.location.href = '/';
    });
    return;
  }

  // Agregar al carrito en localStorage
  let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
  const existe = carrito.find(item => item.IdPlato === plato.IdPlato);
  
  if (existe) {
    existe.Cantidad++;
  } else {
    carrito.push({
      IdPlato: plato.IdPlato,
      Nombre: plato.Nombre,
      Precio: plato.Precio,
      Cantidad: 1,
      ImagenURL: plato.ImagenURL
    });
  }
  
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  window.showSuccess?.(`${plato.Nombre} agregado al carrito`, 'Plato agregado', () => {
    cerrarModalPlato();
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
  max-width: 700px;
  line-height: 1.7em;
  font-size: 1.1em;
  color: #4a3b2e;
  margin-bottom: 20px;
}

/* === GRID DE MENU === */
.menu-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  justify-content: center;
}

.menu-btn {
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

.menu-btn:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 35px rgba(107, 142, 35, 0.3);
  border-color: #6b8e23;
  background: linear-gradient(145deg, #ffffff, #f5f9ed);
}

.menu-btn:active {
  transform: scale(0.97);
}

.menu-icon {
  font-size: 2.2em;
  margin-bottom: 3px;
}

.menu-nombre {
  font-family: "Playfair Display", serif;
  font-size: 1.2em;
  font-weight: 700;
  color: #3e2f21;
}

.menu-detalles {
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

/* Estados de disponibilidad */
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

/* Estados en el modal */
#modal-plato .estado-disponible {
  padding: 6px 16px;
  font-size: 0.9em;
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

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .section {
    padding: 80px 15px;
  }

  .section h2 {
    font-size: 2em;
  }

  .menu-grid {
    gap: 15px;
    padding: 0 15px;
  }

  .menu-btn {
    min-width: 140px;
    padding: 18px 25px;
  }

  .menu-icon {
    font-size: 2em;
  }

  .menu-nombre {
    font-size: 1.1em;
  }

  .detalle {
    font-size: 0.75em;
  }
}

@media (min-width: 1200px) {
  .menu-grid {
    max-width: 1400px;
  }
}
</style>
