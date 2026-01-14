<template>
  <div class="carrito-container">
    <div class="container my-5">
      <div class="row">
        <div class="col-lg-10 mx-auto">
          <!-- TARJETA PRINCIPAL DEL CARRITO -->
          <div class="carrito-card">
            <div class="carrito-header">
          <i class="bi bi-cart3"></i>
<h4>Mi Carrito de Reservas</h4>
            </div>

<div class="card-body">
  <!-- MENSAJE CUANDO ESTÁ VACÍO -->
         <div id="carrito-vacio" class="carrito-vacio-container" style="display: none;">
                <i class="bi bi-cart-x carrito-vacio-icon"></i>
        <h5>Tu carrito está vacío</h5>
           <p>Agrega algunas reservas para verlas aquí</p>
            <a href="/reservas" class="btn-hacer-reserva">
          <i class="bi bi-plus-circle"></i>
       Hacer una reserva
     </a>
   </div>

              <!-- LISTA DE RESERVAS EN EL CARRITO -->
       <div id="lista-carrito">
           <!-- SECCIÓN DE PROMOCIONES -->
         <div class="promociones-section">
         <div class="promociones-header">
    <i class="bi bi-percent"></i>
         <span>Promociones Disponibles</span>
      </div>
   <div id="promociones-container">
       <div class="text-center">
      <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Cargando promociones...</span>
        </div>
                </div>
              </div>
        </div>

  <!-- CONTROLES DE SELECCIÓN -->
       <div class="controles-seleccion">
            <div class="info-seleccion">
           <div id="info-seleccion">
          <span class="text-muted">No hay reservas seleccionadas</span>
              </div>
           </div>
                  <div class="btn-group" role="group">
        <button id="btn-seleccionar-todas" class="btn btn-sm btn-outline-primary" disabled>
    <i class="bi bi-check-all"></i> Seleccionar Todas
           </button>
  <button id="btn-deseleccionar-todas" class="btn btn-sm btn-outline-secondary" disabled>
       <i class="bi bi-x-square"></i> Deseleccionar Todas
     </button>
        </div>
   </div>

     <!-- TABLA DE RESERVAS -->
       <div class="tabla-reservas">
                  <table class="table table-hover table-reservas">
  <thead>
          <tr>
          <th>Selección</th>
          <th>Mesa</th>
            <th>Fecha</th>
         <th>Hora</th>
     <th>Personas</th>
 <th>Precio</th>
     <th>Acciones</th>
       </tr>
        </thead>
 <tbody id="carrito-items">
          <!-- Los items del carrito se cargan aquí -->
   </tbody>
              </table>
                </div>

    <!-- RESUMEN DEL CARRITO -->
    <div class="row mt-4">
        <div class="col-md-6 offset-md-6">
      <div class="resumen-card">
          <h6>Resumen de Seleccionadas</h6>

    <div class="resumen-linea">
 <span>Reservas seleccionadas:</span>
       <strong id="total-reservas-seleccionadas">0</strong>
           </div>

  <div class="resumen-linea text-muted" style="font-size: 0.9rem;">
        <small>Total en carrito:</small>
   <small id="total-reservas">0</small>
     </div>

      <hr class="my-2">

         <div class="resumen-linea">
               <span>Subtotal:</span>
       <span id="subtotal-carrito">$0.00</span>
         </div>

           <div class="resumen-linea descuento" id="descuento-row" style="display: none;">
                <span>Descuento (<span id="porcentaje-descuento">0</span>%):</span>
     <span id="monto-descuento">-$0.00</span>
         </div>

           <div class="resumen-linea" id="subtotal-descuento-row" style="display: none;">
          <span>Subtotal c/descuento:</span>
  <span id="subtotal-con-descuento">$0.00</span>
             </div>

           <div class="resumen-linea">
          <span>IVA (11.5%):</span>
   <span id="iva-carrito">$0.00</span>
 </div>

          <div class="resumen-linea total-final">
   <span>Total a pagar:</span>
        <span id="total-carrito">$0.00</span>
</div>

   <div class="acciones-carrito">
          <button id="btn-confirmar-carrito" class="btn-confirmar" disabled>
   <i class="bi bi-check-circle"></i> Confirmar Seleccionadas
      </button>
    <button id="btn-generar-factura" class="btn-factura" disabled>
              <i class="bi bi-receipt"></i> Generar Factura
     </button>
             <button id="btn-vaciar-carrito" class="btn-vaciar" disabled>
         <i class="bi bi-trash"></i> Vaciar Carrito
            </button>
        </div>
            </div>
        </div>
    </div>
       </div> <!-- FIN lista-carrito -->
            </div> <!-- FIN card-body -->
          </div> <!-- FIN carrito-card -->

          <!-- SECCIÓN DE RESERVAS CONFIRMADAS -->
   <div class="reservas-confirmadas-section">
       <div class="confirmadas-card">
  <div class="confirmadas-header">
  <h5>
    <i class="bi bi-check-circle"></i> Mis Reservas Confirmadas
      </h5>
     <small>Reservas que ya han sido confirmadas con método de pago</small>
    </div>
              <div class="card-body">
    <!-- Mensaje cuando no hay reservas confirmadas -->
    <div id="reservas-confirmadas-vacio" class="confirmadas-vacio" style="display: none;">
         <i class="bi bi-calendar-check"></i>
         <h6>No tienes reservas confirmadas</h6>
      <p>Las reservas aparecerán aquí cuando las confirmes con un método de pago.</p>
   </div>

<!-- Lista de reservas confirmadas -->
          <div id="lista-reservas-confirmadas">
    <!-- Controles de selección -->
          <div class="controles-seleccion" id="controles-confirmadas" style="display: none;">
        <div class="info-seleccion">
         <div id="info-seleccion-confirmadas">
   <span class="text-muted">No hay reservas confirmadas seleccionadas</span>
           </div>
       </div>
               <div class="btn-group" role="group">
      <button id="btn-seleccionar-todas-confirmadas" class="btn btn-sm btn-outline-success">
              <i class="bi bi-check-all"></i> Seleccionar Todas
         </button>
          <button id="btn-deseleccionar-todas-confirmadas" class="btn btn-sm btn-outline-secondary">
       <i class="bi bi-x-square"></i> Deseleccionar Todas
         </button>
         </div>
          </div>

             <!-- Tabla de reservas confirmadas -->
  <div class="tabla-reservas" id="tabla-confirmadas" style="display: none;">
    <table class="table table-hover table-reservas">
          <thead>
     <tr>
    <th>Selección</th>
         <th>Mesa</th>
         <th>Fecha</th>
        <th>Hora</th>
              <th>Personas</th>
   <th>Método de Pago</th>
    <th>Total</th>
                <th>Estado</th>
      </tr>
     </thead>
            <tbody id="reservas-confirmadas-items">
        <!-- Los items se cargan aquí -->
       </tbody>
     </table>
         </div>

         <!-- Resumen de confirmadas -->
         <div class="row mt-4" id="resumen-confirmadas" style="display: none;">
           <div class="col-md-6 offset-md-6">
          <div class="resumen-card">
         <h6>Resumen de Seleccionadas</h6>

      <div class="resumen-linea">
     <span>Reservas confirmadas seleccionadas:</span>
        <strong id="total-confirmadas-seleccionadas">0</strong>
             </div>

 <hr>

  <div class="resumen-linea">
 <span>Subtotal:</span>
              <span id="subtotal-confirmadas">$0.00</span>
   </div>

             <div class="resumen-linea">
                <span>IVA (11.5%):</span>
               <span id="iva-confirmadas">$0.00</span>
         </div>

   <div class="resumen-linea total-final">
   <span>Total:</span>
    <span id="total-confirmadas">$0.00</span>
     </div>

    <div class="acciones-carrito">
  <button id="btn-generar-factura-confirmadas" class="btn-factura" disabled>
       <i class="bi bi-receipt"></i> Generar Factura de Confirmadas
  </button>
   </div>
            </div>
      </div>
       </div>
          </div>
  </div>
            </div>
 </div>

          <!-- SECCIÓN DE FACTURA GENERADA -->
          <div class="factura-section">
   <div class="factura-card" id="seccion-factura" style="display: none;">
        <div class="factura-header">
   <h5>
 <i class="bi bi-receipt"></i> Factura Generada
                </h5>
     </div>
        <div class="card-body">
      <!-- Información de factura -->
       <div class="row mb-3">
         <div class="col-md-6">
  <div class="factura-info-box">
           <h6>Información de Factura</h6>
            <p><strong>Número:</strong> <span id="factura-numero"></span></p>
<p><strong>Fecha:</strong> <span id="factura-fecha"></span></p>
      <p><strong>Estado:</strong> <span id="factura-estado" class="badge"></span></p>
     <p><strong>Método de Pago:</strong> <span id="factura-metodo-pago"></span></p>
   </div>
       </div>
   <div class="col-md-6">
           <div class="factura-info-box">
      <h6>Cliente</h6>
       <p><strong>Nombre:</strong> <span id="factura-cliente"></span></p>
          <p><strong>Teléfono:</strong> <span id="factura-telefono"></span></p>
             <p><strong>Email:</strong> <span id="factura-email"></span></p>
            </div>
        </div>
                </div>

                <!-- Detalles de la factura -->
          <h6>Detalle de Reservas</h6>
                <div class="tabla-reservas">
       <table class="table table-sm">
            <thead>
   <tr>
       <th>Descripción</th>
   <th>Cantidad</th>
     <th>Precio Unit.</th>
      <th>Subtotal</th>
         </tr>
       </thead>
        <tbody id="factura-detalles">
    </tbody>
 </table>
       </div>

         <!-- Totales -->
                <div class="row">
           <div class="col-md-6 offset-md-6">
         <div class="resumen-card">
    <div class="resumen-linea">
          <span>Subtotal:</span>
              <span id="factura-subtotal"></span>
          </div>
      <div class="resumen-linea descuento" id="factura-descuento-row" style="display: none;">
          <span>Descuento:</span>
    <span id="factura-descuento"></span>
   </div>
     <div class="resumen-linea">
         <span>IVA (12%):</span>
               <span id="factura-iva"></span>
        </div>
          <div class="resumen-linea total-final">
  <span>Total:</span>
        <span id="factura-total"></span>
     </div>
     </div>
       </div>
        </div>

                <!-- Acciones de factura -->
    <div class="text-center mt-3">
 <button id="btn-descargar-factura" class="btn btn-outline-primary">
              <i class="bi bi-download"></i> Descargar Factura
       </button>
          <button id="btn-nueva-factura" class="btn btn-outline-secondary">
    <i class="bi bi-plus-circle"></i> Nueva Factura
          </button>
                </div>
    </div>
            </div>
 </div>

        </div>
      </div>
    </div>

    <!-- MODALES -->
  <div class="modal fade" id="modalConfirmar" tabindex="-1">
    <div class="modal-dialog">
   <div class="modal-content">
 <div class="modal-header">
            <h5 class="modal-title">Confirmar Reservas Seleccionadas</h5>
       <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
       <div class="modal-body">
 <p>¿Estás seguro de que deseas confirmar las reservas seleccionadas?</p>

       <div id="promocion-aplicada-info" class="alert alert-success" style="display: none;">
   <i class="bi bi-percent"></i>
   <strong>Promoción aplicada:</strong> <span id="promocion-nombre"></span>
          <br><strong>Descuento:</strong> <span id="promocion-porcentaje"></span>%
         </div>

     <div class="alert alert-warning">
            <strong>¡Aviso!</strong> Verifique los detalles antes de confirmar.
        </div>

 <div class="alert alert-info">
  <i class="bi bi-info-circle"></i>
        <strong>Nota:</strong> Al confirmar, las reservas cambiarán a estado "CONFIRMADA" y se aplicará el IVA de 12%.
            </div>

       <div class="form-group mt-3">
          <label for="metodo-pago" class="form-label">Método de Pago:</label>
        <select id="metodo-pago" class="form-select" required>
  <option value="">Seleccionar método de pago</option>
         <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
<option value="Transferencia">Transferencia Bancaria</option>
        <option value="ATH_Movil">ATH Móvil</option>
</select>
            </div>
          </div>
      <div class="modal-footer">
  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
         <button type="button" id="confirmar-pago" class="btn btn-success">
         <i class="bi bi-credit-card"></i> Confirmar Pago
            </button>
    </div>
        </div>
      </div>
    </div>

    <!-- Modal para pago bancario -->
    <div class="modal fade" id="modalPagoBancario" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
    <div class="modal-header">
    <h5 class="modal-title">Pago Bancario - Restaurante</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
       </div>
 <div class="modal-body">
            <div id="pago-bancario-info">
          <p>Se realizará una transferencia bancaria con los siguientes datos:</p>

   <div class="alert alert-info">
 <strong>Total a pagar:</strong> <span id="monto-pago-bancario">$0.00</span>
           </div>

              <div class="form-group mb-3" style="display: none;">
    <label for="cedula-cliente" class="form-label">Cédula del Cliente:</label>
     <input type="text" id="cedula-cliente" class="form-control" placeholder="Ingresa tu cédula">
  <small class="text-muted">Se usará para procesar la transacción bancaria</small>
     </div>

              <div class="alert alert-warning">
           <i class="bi bi-info-circle"></i>
      <strong>Nota:</strong> La transacción se procesará desde tu cuenta bancaria registrada hacia la cuenta del restaurante.
</div>

    <div id="estado-pago-bancario" style="display: none;">
   <div id="mensaje-pago-bancario"></div>
   </div>
       </div>
          </div>
          <div class="modal-footer">
     <button type="button" id="confirmar-pago-bancario" class="btn btn-success">
            <i class="bi bi-credit-card"></i> Procesar Pago
            </button>
 </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarritoPage',
mounted() {
    console.log('🛒 Carrito montado correctamente')
    
 // Cargar CSS personalizado del carrito
    this.loadCarritoCSS()
    
    // Cargar script de carrito
    this.loadCarritoScript()
    
    // Inicializar carrito básico
    this.initCarritoBasico()
  },
  methods: {
  loadCarritoCSS() {
      // Cargar el archivo CSS personalizado del carrito
      if (!document.querySelector('link[href="/css/carrito.css"]')) {
   const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/css/carrito.css'
     document.head.appendChild(link)
     console.log('✅ CSS del carrito cargado')
      }
    },
    loadCarritoScript() {
      // Verificar si el script ya existe
      if (document.querySelector('script[src="/js/carrito.js"]')) {
        console.log('✅ Script de carrito ya cargado')
   return
      }

      const script = document.createElement('script')
   script.src = '/js/carrito.js'
      script.async = true
 script.onload = () => {
        console.log('✅ Script de carrito cargado exitosamente')
      }
      script.onerror = () => {
     console.warn('⚠️ No se pudo cargar carrito.js')
      }
      document.body.appendChild(script)
    },
    initCarritoBasico() {
      // Mostrar mensaje de carrito vacío por defecto
      const carritoVacio = document.getElementById('carrito-vacio')
      const listaCarrito = document.getElementById('lista-carrito')

      // Verificar si hay items en localStorage
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]')
      
      if (carrito.length === 0) {
 if (carritoVacio) carritoVacio.style.display = 'block'
        if (listaCarrito) listaCarrito.style.display = 'none'
      } else {
    if (carritoVacio) carritoVacio.style.display = 'none'
     if (listaCarrito) listaCarrito.style.display = 'block'
   }
      
      console.log(`🛒 Carrito tiene ${carrito.length} items`)
    }
  }
}
</script>

<style scoped>
/* Los estilos principales están en /css/carrito.css */
/* Aquí solo estilos específicos del componente Vue si son necesarios */
</style>
