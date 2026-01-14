<template>
  <div class="carrito-container">
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-9 col-xl-8">
          <div class="carrito-card">
            <div class="carrito-header">
              <i class="bi bi-cart3"></i>
              <h4>Mi Carrito de Reservas</h4>
            </div>
            <div class="card-body">
              <!-- Mensaje cuando está vacío -->
              <div v-if="carritoVacio" class="carrito-vacio-container">
                <i class="bi bi-cart-x carrito-vacio-icon"></i>
                <h5>Tu carrito está vacío</h5>
                <p>Agrega algunas reservas para verlas aquí</p>
                <a href="/reservas" class="btn-hacer-reserva">
                  <i class="bi bi-plus-circle"></i> Hacer una reserva
                </a>
              </div>

              <!-- Lista de reservas en el carrito -->
              <div v-else id="lista-carrito">
                <!-- SECCION DE PROMOCIONES -->
                <div v-if="esUsuarioLogueado && (promocionesVigentes.length > 0 || cargandoPromociones)" class="mb-4">
                  <h6 class="mb-3">
                    <i class="bi bi-percent"></i> Promociones Disponibles
                  </h6>
                  
                  <div v-if="cargandoPromociones" class="text-center py-3">
                    <div class="spinner-border text-success" role="status">
                      <span class="visually-hidden">Cargando promociones...</span>
                    </div>
                  </div>
                  
                  <div v-else class="promociones-grid">
                    <div 
                      v-for="promo in promocionesVigentes" 
                      :key="promo.idPromocion || promo.IdPromocion" 
                      class="promo-card"
                      :class="{'promo-card-selected': promocionSeleccionada === (promo.idPromocion || promo.IdPromocion)}"
                      @click="seleccionarPromocion(promo.idPromocion || promo.IdPromocion)"
                    >
                      <div class="promo-icon">
                        <i class="bi bi-percent"></i>
                      </div>
                      <div class="promo-descuento">{{ (promo.descuento || promo.Descuento || 0) }}%</div>
                      <div class="promo-badge" v-if="promocionSeleccionada === (promo.idPromocion || promo.IdPromocion)">
                        Aplicada
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Instrucción -->
                <div class="row mb-3">
                  <div class="col-md-12">
                    <div class="alert alert-info mb-0">
                      <i class="bi bi-info-circle"></i> Selecciona una reserva a la vez para confirmar
                    </div>
                  </div>
                </div>

                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
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
                      <template v-for="(reserva, index) in todasReservas" :key="esUsuarioLogueado ? (reserva.idReserva || reserva.IdReserva) : index">
                        <tr>
                          <td>
                            <div class="form-check">
                              <input 
                                class="form-check-input" 
                                type="radio" 
                                name="reservaSeleccionada"
                                :value="esUsuarioLogueado ? (reserva.idReserva || reserva.IdReserva) : index" 
                                :id="`radio_${esUsuarioLogueado ? (reserva.idReserva || reserva.IdReserva) : 'temp_' + index}`"
                                v-model="reservaSeleccionada"
                                @click="toggleSeleccionReserva(esUsuarioLogueado ? (reserva.idReserva || reserva.IdReserva) : index)"
                              >
                              <label class="form-check-label" :for="`radio_${esUsuarioLogueado ? (reserva.idReserva || reserva.IdReserva) : 'temp_' + index}`">
                                Seleccionar
                              </label>
                            </div>
                          </td>
                          <td>
                            <strong>Mesa {{ reserva.numeroMesa || reserva.NumeroMesa || 'No asignada' }}</strong>
                            <br>
                            <small class="text-muted">Capacidad: {{ reserva.capacidadMesa || reserva.CapacidadMesa || 'N/A' }} personas</small>
                          </td>
                          <td>{{ formatearFecha(reserva.fecha || reserva.Fecha) }}</td>
                          <td>{{ reserva.hora || reserva.Hora }}</td>
                          <td>
                            <i class="bi bi-people"></i> {{ reserva.numeroPersonas || reserva.NumeroPersonas || 'N/A' }}
                          </td>
                          <td>
                            <div class="text-end">
                              <div><small class="text-muted">Subtotal: ${{ Number(reserva.subtotal || reserva.Subtotal || reserva.precioMesa || reserva.PrecioMesa || 0).toFixed(2) }}</small></div>
                              <div><small class="text-muted">IVA (11.5%): ${{ Number(reserva.iva || reserva.Iva || 0).toFixed(2) }}</small></div>
                              <div><strong>Total: ${{ Number(reserva.totalFinal || reserva.TotalFinal || 0).toFixed(2) }}</strong></div>
                            </div>
                          </td>
                          <td>
                            <button 
                              v-if="(reserva.estado || reserva.Estado) !== 'Confirmada'"
                              class="btn btn-sm btn-outline-danger" 
                              @click="eliminarReserva(esUsuarioLogueado ? (reserva.idReserva || reserva.IdReserva) : index)"
                              title="Eliminar del carrito"
                            >
                              <i class="bi bi-trash"></i> Eliminar
                            </button>
                            <span v-else class="badge bg-success">Confirmada</span>
                          </td>
                        </tr>
                        <tr v-if="(reserva.observaciones || reserva.Observaciones) && (reserva.observaciones || reserva.Observaciones).trim() !== ''" class="table-light">
                          <td colspan="7">
                            <small><strong>Observaciones:</strong> {{ reserva.observaciones || reserva.Observaciones }}</small>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>

                <!-- Resumen del carrito -->
                <div class="row mt-4">
                  <div class="col-md-5 offset-md-7 col-lg-4 offset-lg-8">
                    <div class="mini-resumen-card">
                      <div class="mini-resumen-header">
                        <h6><i class="bi bi-calculator me-1"></i>Resumen</h6>
                      </div>
                      <div class="mini-resumen-body" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; padding: 12px;">
                        <div class="resumen-linea d-flex justify-content-between align-items-center">
                          <span class="resumen-label fw-bold">Reserva seleccionada:</span>
                          <span class="resumen-valor badge bg-primary">{{ reservaSeleccionada ? 1 : 0 }}</span>
                        </div>
                        
                        <div v-if="resumenCalculado" class="resumen-linea d-flex justify-content-between align-items-center">
                          <span class="resumen-label fw-bold">Subtotal:</span>
                          <span class="resumen-valor fw-bold">${{ resumenCalculado.subtotal?.toFixed(2) || '0.00' }}</span>
                        </div>

                        <div v-if="resumenCalculado?.promocionAplicada" class="resumen-linea d-flex justify-content-between align-items-center text-success">
                          <span class="resumen-label fw-bold"><i class="bi bi-percent me-1"></i>Descuento ({{ resumenCalculado.porcentajeDescuento }}%):</span>
                          <span class="resumen-valor fw-bold">-${{ resumenCalculado.montoDescuentoTotal?.toFixed(2) || '0.00' }}</span>
                        </div>
                        
                        <div v-if="resumenCalculado" class="resumen-linea d-flex justify-content-between align-items-center">
                          <span class="resumen-label fw-bold">IVA (11.5%):</span>
                          <span class="resumen-valor fw-bold">${{ resumenCalculado.iva?.toFixed(2) || '0.00' }}</span>
                        </div>
                        
                        <hr class="my-2" style="border-top: 1px solid #28a745;">
                        
                        <div v-if="resumenCalculado" class="resumen-linea resumen-total d-flex justify-content-between align-items-center">
                          <span class="resumen-label fw-bold text-success"><i class="bi bi-cash-coin me-1"></i>Total:</span>
                          <span class="resumen-valor fw-bold fs-6 text-success">${{ resumenCalculado.totalCarrito?.toFixed(2) || '0.00' }}</span>
                        </div>
                        
                        <div v-if="!resumenCalculado" class="text-center text-muted py-3">
                          <small>Selecciona una reserva para ver el resumen</small>
                        </div>
                      </div>
                      
                      <div class="mini-resumen-acciones">
                        <button 
                          class="btn-mini btn-mini-success" 
                          :disabled="!reservaSeleccionada || !esUsuarioLogueado || cargandoFactura"
                          @click="abrirModalConfirmarManual"
                        >
                          <i class="bi bi-check-circle"></i> Confirmar
                        </button>
                        
                        <button 
                          class="btn-mini btn-mini-primary" 
                          :disabled="!reservaSeleccionada || !esUsuarioLogueado || cargandoFactura"
                          @click="generarFacturaDesdeCarrito"
                        >
                          <template v-if="cargandoFactura">
                            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Generando PDF...
                          </template>
                          <template v-else>
                            <i class="bi bi-receipt"></i> Facturar
                          </template>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RESERVAS CONFIRMADAS -->
          <div v-if="esUsuarioLogueado" class="row" style="margin-top: 3rem;">
            <div class="col-lg-12">
              <div class="carrito-card">
                <div class="carrito-header">
                  <i class="bi bi-check-circle-fill text-success"></i>
                  <h4>Mis Reservas Confirmadas</h4>
                </div>

                <div class="card-body">
                  <div class="alert alert-info mb-4">
                    <i class="bi bi-info-circle"></i>
                    <strong>Reservas confirmadas:</strong> Aquí puedes ver todas las reservas que ya han sido confirmadas con método de pago.
                  </div>
                  
                  <div v-if="todasReservasConfirmadas.length === 0" class="empty-state-confirmadas">
                    <div class="empty-icon">
                      <i class="bi bi-calendar-check-fill"></i>
                    </div>
                    <h4 class="empty-title">No tienes reservas confirmadas</h4>
                    <p class="empty-text">Las reservas aparecerán aquí cuando las confirmes con un método de pago.</p>
                    <div class="empty-action">
                      <a href="/reservas" class="btn btn-primary">
                        <i class="bi bi-calendar-plus"></i> Hacer una Reserva
                      </a>
                    </div>
                  </div>
                  
                  <div v-else>
                    <!-- Controles -->
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <div class="mb-2">
                          <span v-if="!reservaConfirmadaSeleccionada" class="text-muted">
                            <i class="bi bi-info-circle"></i> No hay reserva confirmada seleccionada
                          </span>
                          <span v-else class="badge bg-success fs-6">
                            <i class="bi bi-check2-square"></i> 1 reserva seleccionada
                          </span>
                        </div>
                      </div>
                    </div>

                  <!-- Tabla -->
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
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
                      <tbody>
                        <template v-for="reserva in todasReservasConfirmadas" :key="reserva.idReserva">
                          <tr>
                            <td>
                              <div class="form-check">
                                <input 
                                  class="form-check-input" 
                                  type="radio" 
                                  name="reservaConfirmadaSeleccionada"
                                  :value="reserva.idReserva"
                                  v-model="reservaConfirmadaSeleccionada"
                                  @click="toggleSeleccionConfirmada(reserva.idReserva)"
                                >
                              </div>
                            </td>
                            <td>
                              <strong>Mesa {{ reserva.numeroMesa }}</strong>
                              <br>
                              <small class="text-muted">Capacidad: {{ reserva.numeroPersonas }} personas</small>
                            </td>
                            <td>{{ formatearFecha(reserva.fecha) }}</td>
                            <td>{{ reserva.hora }}</td>
                            <td><i class="bi bi-people-fill"></i> {{ reserva.numeroPersonas }}</td>
                            <td><span class="badge bg-info">{{ reserva.metodoPago || 'No especificado' }}</span></td>
                            <td><strong class="text-success">${{ Number(reserva.total || 0).toFixed(2) }}</strong></td>
                            <td><span class="badge bg-success">{{ reserva.estado }}</span></td>
                          </tr>
                          <tr v-if="reserva.observaciones" class="table-light">
                            <td colspan="8">
                              <small><strong>Observaciones:</strong> {{ reserva.observaciones }}</small>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>

                  <!-- Resumen confirmadas -->
                  <div v-if="reservaConfirmadaSeleccionada" class="row mt-4">
                    <div class="col-md-5 offset-md-7 col-lg-4 offset-lg-8">
                      <div class="mini-resumen-card">
                        <div class="mini-resumen-header">
                          <h6><i class="bi bi-calculator"></i> Resumen de Seleccionadas</h6>
                        </div>
                        <div class="mini-resumen-body">
                          <div class="resumen-item">
                            <span class="resumen-label">Reservas seleccionadas:</span>
                            <span class="resumen-valor">1</span>
                          </div>
                          <div class="resumen-separator"></div>
                          <div class="resumen-item">
                            <span class="resumen-label">Subtotal:</span>
                            <span class="resumen-valor">${{ subtotalConfirmadas.toFixed(2) }}</span>
                          </div>
                          <div class="resumen-item">
                            <span class="resumen-label">IVA (11.5%):</span>
                            <span class="resumen-valor">${{ ivaConfirmadas.toFixed(2) }}</span>
                          </div>
                          <div class="resumen-separator"></div>
                          <div class="resumen-item-total">
                            <span class="resumen-label-total">Total:</span>
                            <span class="resumen-valor-total">${{ totalConfirmadas.toFixed(2) }}</span>
                          </div>
                        </div>
                        <div class="min PDFi-resumen-acciones">
                          <button 
                            class="btn-mini btn-mini-success w-100"
                            :disabled="!reservaConfirmadaSeleccionada || cargandoFactura"
                            @click="generarFacturaConfirmadas"
                          >
                            <template v-if="cargandoFactura">
                              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Generando...
                            </template>
                            <template v-else>
                              <i class="bi bi-receipt"></i> Generar Factura
                            </template>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FACTURA GENERADA -->
          <div v-if="facturaActual" class="row mt-4">
            <div class="col-lg-12">
              <div class="card border-primary">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">
                    <i class="bi bi-receipt"></i> Factura Generada
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Información básica -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <h6>Información de Factura</h6>
                      <p class="mb-1"><strong>Número:</strong> {{ facturaActual.IdFactura }}</p>
                      <p class="mb-1"><strong>Fecha:</strong> {{ new Date().toLocaleDateString('es-ES') }}</p>
                      <p class="mb-1"><strong>Estado:</strong> <span class="badge bg-warning">Emitida</span></p>
                      <p class="mb-1"><strong>Método de Pago:</strong> {{ facturaActual.MetodoPago || 'Todavía no realiza el pago' }}</p>
                    </div>
                    <div class="col-md-6">
                      <h6>Cliente</h6>
                      <p class="mb-1"><strong>Nombre:</strong> {{ usuario?.Nombre || 'Cliente' }}</p>
                      <p class="mb-1"><strong>Teléfono:</strong> {{ usuario?.Telefono || 'No especificado' }}</p>
                      <p class="mb-1"><strong>Email:</strong> {{ usuario?.Email || 'No especificado' }}</p>
                    </div>
                  </div>

                  <!-- Detalles -->
                  <h6>Detalle de Reservas</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead class="table-light">
                        <tr>
                          <th>Descripción</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="detalle in facturaDetalles" :key="detalle.id">
                          <td>{{ detalle.Descripcion }}</td>
                          <td>{{ detalle.Cantidad }}</td>
                          <td>${{ detalle.PrecioUnitario?.toFixed(2) }}</td>
                          <td>${{ detalle.Subtotal?.toFixed(2) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Totales -->
                  <div class="row">
                    <div class="col-md-6 offset-md-6">
                      <div class="table-responsive">
                        <table class="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>Subtotal:</strong></td>
                              <td class="text-end">${{ facturaSubtotal.toFixed(2) }}</td>
                            </tr>
                            <tr v-if="facturaDescuento > 0" class="text-success">
                              <td><strong>Descuento:</strong></td>
                              <td class="text-end">-${{ facturaDescuento.toFixed(2) }}</td>
                            </tr>
                            <tr>
                              <td><strong>IVA (12%):</strong></td>
                              <td class="text-end">${{ facturaIva.toFixed(2) }}</td>
                            </tr>
                            <tr class="table-primary">
                              <td><strong>Total:</strong></td>
                              <td class="text-end"><strong>${{ facturaTotal.toFixed(2) }}</strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- Acciones -->
                  <div class="text-center mt-3">
                    <button class="btn btn-outline-primary" @click="descargarFactura">
                      <i class="bi bi-download"></i> Descargar Factura
                    </button>
                    <button class="btn btn-outline-secondary" @click="nuevaFactura">
                      <i class="bi bi-plus-circle"></i> Nueva Factura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación Personalizado -->
    <div v-if="mostrarModalConfirmar" class="modal-custom-overlay" @click.self="cerrarModalConfirmar">
      <div class="modal-custom">
        <div class="modal-custom-header">
          <h5>Confirmar Reservas</h5>
          <button class="modal-custom-close" @click="cerrarModalConfirmar">×</button>
        </div>
        <div class="modal-custom-body">
          <h6>Resumen de Reserva Seleccionada</h6>
          <p><strong>Reserva a confirmar:</strong> 1</p>
          <p><strong>Subtotal:</strong> ${{ (resumenCalculado?.subtotal || 0).toFixed(2) }}</p>
          <p v-if="resumenCalculado?.promocionAplicada"><strong>Descuento ({{ resumenCalculado.porcentajeDescuento }}%):</strong> -${{ (resumenCalculado.montoDescuentoTotal || 0).toFixed(2) }}</p>
          <p><strong>IVA (11.5%):</strong> ${{ (resumenCalculado?.iva || 0).toFixed(2) }}</p>
          <p class="modal-total"><strong>Total a pagar:</strong> ${{ (resumenCalculado?.totalCarrito || 0).toFixed(2) }}</p>
          
          <div class="alert-info-custom">
            <i class="bi bi-info-circle"></i>
            <strong>Nota:</strong> Al confirmar, se procesará el pago bancario y las reservas serán confirmadas.
          </div>
        </div>
        <div class="modal-custom-footer">
          <button class="btn-custom btn-custom-secondary" @click="cerrarModalConfirmar">Cancelar</button>
          <button class="btn-custom btn-custom-success" @click="confirmarPago" :disabled="cargandoPago">
            <span v-if="cargandoPago" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-credit-card"></i> 
            {{ cargandoPago ? 'Procesando...' : 'Confirmar Pago' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Procesamiento de Pago Personalizado -->
    <div v-if="mostrarModalProcesando" class="modal-custom-overlay">
      <div class="modal-custom modal-custom-processing">
        <div class="modal-custom-body text-center py-4">
          <div v-if="estadoPago === 'procesando'">
            <div class="spinner-custom mb-3"></div>
            <h5>Procesando pago...</h5>
            <p class="text-muted mb-0">Por favor espera mientras procesamos tu transacción bancaria</p>
          </div>
          <div v-else-if="estadoPago === 'exito'">
            <div class="text-success mb-3">
              <i class="bi bi-check-circle" style="font-size: 4rem;"></i>
            </div>
            <h5 class="text-success">Pago exitoso</h5>
            <p class="text-muted">{{ mensajePago }}</p>
            <button type="button" class="btn-custom btn-custom-success mt-3" @click="cerrarModalProcesando">
              Continuar
            </button>
          </div>
          <div v-else-if="estadoPago === 'error'">
            <div class="text-danger mb-3">
              <i class="bi bi-x-circle" style="font-size: 4rem;"></i>
            </div>
            <h5 class="text-danger">Error en el pago</h5>
            <p class="text-muted">{{ mensajePago }}</p>
            <button type="button" class="btn-custom btn-custom-primary mt-3" @click="cerrarModalProcesando">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Factura -->
    <div v-if="mostrarModalFactura" class="modal-custom-overlay" @click.self="cerrarModalFactura">
      <!-- Loading Overlay -->
      <div v-if="cargandoFactura" class="loading-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(3px);
      ">
        <div class="loading-content text-center" style="
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 300px;
        ">
          <div class="spinner-border text-success mb-3" role="status" style="width: 4rem; height: 4rem;">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <h5 class="fw-bold text-dark mb-2">Generando Factura</h5>
          <p class="text-muted mb-0">Por favor espera un momento...</p>
        </div>
      </div>
      
      <div v-else class="modal-custom" style="max-width: 700px; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);">
        <div class="modal-custom-header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border-radius: 15px 15px 0 0; padding: 20px; position: relative; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h4 class="mb-0 fw-bold text-center" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <i class="bi bi-receipt-cutoff me-3" style="font-size: 1.5em;"></i> 
            Factura {{ tipoFactura === 'HOLD' ? 'Emitida' : 'Confirmada' }}
          </h4>
          <button 
            class="btn-close-custom" 
            @click="cerrarModalFactura" 
            style="
              position: absolute;
              top: 15px;
              right: 20px;
              background: rgba(255,255,255,0.2); 
              border-radius: 50%; 
              width: 40px; 
              height: 40px; 
              border: none; 
              color: white;
              font-size: 20px; 
              font-weight: bold;
              cursor: pointer;
              transition: all 0.3s ease;
            "
            onmouseover="this.style.background='rgba(255,255,255,0.3)'"
            onmouseout="this.style.background='rgba(255,255,255,0.2)'"
          >
            ×
          </button>
        </div>
        <div class="modal-custom-body" style="padding: 0; background: #fff; max-height: 80vh; overflow-y: auto;">
          <div v-if="cargandoFactura" class="text-center py-5" style="background: #fff; margin: 30px;">
            <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status"></div>
            <h5 class="mt-3 fw-bold" style="color: #28a745;">Generando Factura...</h5>
            <p class="text-muted">Por favor espera un momento</p>
          </div>
          
          <div v-else-if="facturaGenerada" style="padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            
            <!-- Header Moderno de Factura -->
            <div class="modern-header mb-4" style="
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
              margin: -30px -30px 30px -30px; 
              padding: 30px; 
              color: white;
              position: relative;
              overflow: hidden;
            ">
              <div style="position: absolute; top: 0; right: 0; opacity: 0.1; font-size: 8rem;">
                <i class="bi bi-receipt"></i>
              </div>
              <div class="row align-items-center position-relative">
                <div class="col-md-8">
                  <h2 class="mb-2 fw-bold" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    FACTURA #{{ facturaGenerada.idFactura }}
                  </h2>
                  <div class="d-flex align-items-center gap-3 flex-wrap">
                    <span class="badge badge-large" style="
                      font-size: 1rem; 
                      padding: 10px 20px; 
                      border-radius: 25px;
                      background: rgba(255,255,255,0.2);
                      backdrop-filter: blur(10px);
                    ">
                      <i class="bi me-2" :class="tipoFactura === 'HOLD' ? 'bi-clock-fill' : 'bi-check-circle-fill'"></i>
                      {{ tipoFactura === 'HOLD' ? 'EMITIDA' : 'PAGADA' }}
                    </span>
                    <span style="opacity: 0.9;">
                      <i class="bi bi-calendar3 me-1"></i>
                      {{ new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-4 text-md-end">
                  <div class="customer-card" style="
                    background: rgba(255,255,255,0.15); 
                    backdrop-filter: blur(10px); 
                    border-radius: 15px; 
                    padding: 20px;
                    border: 1px solid rgba(255,255,255,0.2);
                  ">
                    <h6 class="mb-1 fw-bold">
                      <i class="bi bi-person-circle me-2"></i>
                      {{ usuario?.Nombre || 'Cliente' }}
                    </h6>
                    <small style="opacity: 0.8;">{{ usuario?.Email || 'No especificado' }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== CONTENIDO COMPLETO DE LA FACTURA ===== -->
            
            <!-- Detalles de Reserva -->
            <div class="reservation-section mb-4">
              <div class="section-header mb-3" style="border-bottom: 3px solid #28a745; padding-bottom: 10px;">
                <h5 class="fw-bold mb-0" style="color: #495057;">
                  <i class="bi bi-table me-2" style="color: #28a745; font-size: 1.3em;"></i>
                  Detalles de la Reserva
                </h5>
              </div>
              
              <div class="modern-table" style="
                background: #fff; 
                border-radius: 15px; 
                overflow: hidden; 
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                border: 1px solid #e9ecef;
              ">
                <div class="table-header" style="
                  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                  padding: 20px 25px; 
                  border-bottom: 2px solid #dee2e6;
                ">
                  <div class="row fw-bold" style="color: #495057;">
                    <div class="col-5">DESCRIPCIÓN</div>
                    <div class="col-2 text-center">CANT.</div>
                    <div class="col-2 text-end">PRECIO</div>
                    <div class="col-3 text-end">TOTAL</div>
                  </div>
                </div>
                <div class="table-body" style="padding: 25px;">
                  <div class="row align-items-center" style="min-height: 60px;">
                    <div class="col-5">
                      <div class="d-flex align-items-center">
                        <div class="icon-container me-3" style="
                          width: 45px; 
                          height: 45px; 
                          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                          border-radius: 12px; 
                          display: flex; 
                          align-items: center; 
                          justify-content: center;
                        ">
                          <i class="bi bi-grid-3x3-gap-fill text-white" style="font-size: 1.3em;"></i>
                        </div>
                        <div>
                          <h6 class="mb-1 fw-bold" style="color: #28a745;">
                            Mesa {{ 
                              tipoFactura === 'HOLD' 
                                ? (todasReservas.find(r => (r.IdReserva || r.idReserva) === reservaSeleccionada)?.numeroMesa || todasReservas.find(r => (r.IdReserva || r.idReserva) === reservaSeleccionada)?.NumeroMesa)
                                : (todasReservasConfirmadas.find(r => r.idReserva === reservaConfirmadaSeleccionada)?.numeroMesa)
                            }}
                          </h6>
                          <small class="text-muted">Reserva de mesa</small>
                        </div>
                      </div>
                    </div>
                    <div class="col-2 text-center">
                      <span class="badge bg-secondary" style="
                        font-size: 1rem; 
                        padding: 8px 16px; 
                        border-radius: 20px;
                      ">1</span>
                    </div>
                    <div class="col-2 text-end">
                      <span class="fw-bold" style="color: #495057; font-size: 1.1em;">
                        ${{ (facturaGenerada.subtotal || facturaGenerada.subtotalBruto || 0).toFixed(2) }}
                      </span>
                    </div>
                    <div class="col-3 text-end">
                      <span class="fw-bold" style="color: #28a745; font-size: 1.2em;">
                        ${{ (facturaGenerada.subtotal || facturaGenerada.subtotalBruto || 0).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen de Totales -->
            <div class="totals-section">
              <div class="row justify-content-end">
                <div class="col-lg-6 col-md-8">
                  <div class="totals-card" style="
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); 
                    border-radius: 20px; 
                    padding: 30px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
                    border: 1px solid #e9ecef;
                    position: relative;
                    overflow: hidden;
                  ">
                    <!-- Decorative background -->
                    <div style="
                      position: absolute; 
                      top: -50px; 
                      right: -50px; 
                      width: 150px; 
                      height: 150px; 
                      background: linear-gradient(135deg, rgba(40, 167, 69, 0.05) 0%, rgba(32, 201, 151, 0.05) 100%);
                      border-radius: 50%;
                    "></div>
                    
                    <div class="position-relative">
                      <h5 class="text-center mb-4 fw-bold" style="color: #495057;">
                        <i class="bi bi-calculator-fill me-2" style="color: #28a745; font-size: 1.3em;"></i>
                        Resumen Financiero
                      </h5>
                      
                      <div class="totals-breakdown">
                        <!-- Subtotal -->
                        <div class="total-line d-flex justify-content-between align-items-center py-3" style="
                          border-bottom: 1px solid #e9ecef;
                        ">
                          <span class="fw-semibold" style="color: #6c757d; font-size: 1.1em;">
                            <i class="bi bi-calculator me-2" style="color: #6c757d;"></i>Subtotal
                          </span>
                          <span class="fw-bold" style="color: #495057; font-size: 1.2em;">
                            ${{ (facturaGenerada.subtotal || facturaGenerada.subtotalBruto || 0).toFixed(2) }}
                          </span>
                        </div>
                        
                        <!-- Descuento -->
                        <div v-if="(facturaGenerada.descuento || 0) > 0" class="total-line d-flex justify-content-between align-items-center py-3" style="
                          border-bottom: 1px solid #e9ecef;
                        ">
                          <span class="fw-semibold text-success" style="font-size: 1.1em;">
                            <i class="bi bi-percent me-2"></i>Descuento
                          </span>
                          <span class="fw-bold text-success" style="font-size: 1.2em;">
                            -${{ (facturaGenerada.descuento || 0).toFixed(2) }}
                          </span>
                        </div>
                        
                        <!-- IVA -->
                        <div class="total-line d-flex justify-content-between align-items-center py-3" style="
                          border-bottom: 1px solid #e9ecef;
                        ">
                          <span class="fw-semibold" style="color: #6c757d; font-size: 1.1em;">
                            <i class="bi bi-receipt me-2" style="color: #6c757d;"></i>IVA (11.5%)
                          </span>
                          <span class="fw-bold" style="color: #495057; font-size: 1.2em;">
                            ${{ (facturaGenerada.iva || 0).toFixed(2) }}
                          </span>
                        </div>
                        
                        <!-- Total Final -->
                        <div class="final-total mt-4 p-4" style="
                          background: linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(32, 201, 151, 0.15) 100%); 
                          border-radius: 20px; 
                          border: 3px solid #28a745;
                          text-align: center;
                          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.2);
                          position: relative;
                          overflow: hidden;
                        ">
                          <!-- Animated background -->
                          <div style="
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                            animation: shimmer 3s infinite;
                          "></div>
                          
                          <div class="position-relative">
                            <div style="margin-bottom: 15px;">
                              <span class="fw-bold" style="color: #28a745; font-size: 1.4em; letter-spacing: 2px; text-transform: uppercase;">
                                💰 Total a Pagar 💰
                              </span>
                            </div>
                            <div class="d-flex align-items-center justify-content-center">
                              <i class="bi bi-cash-coin" style="color: #28a745; font-size: 2.5em; margin-right: 20px; animation: bounce 2s infinite;"></i>
                              <span class="fw-bold" style="
                                color: #28a745; 
                                font-size: 3.5em; 
                                text-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
                                font-family: 'Arial Black', Arial, sans-serif;
                              ">
                                ${{ (facturaGenerada.total || 0).toFixed(2) }}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Método de Pago -->
                        <div v-if="tipoFactura === 'CONFIRMADA'" class="payment-info mt-4 p-3" style="
                          background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
                          border-radius: 10px; 
                          border-left: 4px solid #007bff;
                          text-align: center;
                        ">
                          <div class="d-flex align-items-center justify-content-center">
                            <i class="bi bi-credit-card-2-front me-2" style="color: #007bff; font-size: 1.2em;"></i>
                            <span class="fw-semibold" style="color: #007bff;">
                              Pagado via TRANSFERENCIA BANCARIA
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-custom-footer" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 0 0 15px 15px; padding: 25px; border-top: 1px solid #dee2e6;">
          <div class="d-flex justify-content-end gap-3">
            <button 
              class="btn btn-outline-secondary" 
              @click="cerrarModalFactura" 
              style="border-radius: 25px; padding: 12px 24px; font-weight: bold; border: 2px solid #6c757d;"
            >
              <i class="bi bi-x-circle me-2"></i> Cerrar
            </button>
            <button 
              class="btn btn-danger" 
              @click="generarPDF" 
              :disabled="!facturaGenerada" 
              style="
                border-radius: 25px; 
                padding: 12px 24px; 
                font-weight: bold;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                border: none;
                box-shadow: 0 3px 10px rgba(220, 53, 69, 0.3);
              "
            >
              <i class="bi bi-file-earmark-pdf me-2"></i> Generar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// URLs de las APIs
const BASES = {
  SEGURIDAD: 'https://seguridad-production-279b.up.railway.app',
  MENU: 'https://menu-production-279b.up.railway.app',
  RESERVAS: 'https://reserva-production-279b.up.railway.app',
  FACTURACION: 'https://factura-production-279b.up.railway.app',
  BANCO: 'http://mibanca.runasp.net'
}

// Configuración de cuentas bancarias
const CUENTA_ORIGEN = 304  // Cuenta del cliente
const CUENTA_DESTINO = 302 // Cuenta del restaurante

// Variables reactivas
const usuario = ref(null)
const esUsuarioLogueado = ref(false)
const todasReservas = ref([])
const reservaSeleccionada = ref(null)
const promocionesDisponibles = ref([])
const promocionSeleccionada = ref(null)
const cargandoPromociones = ref(false)
const todasReservasConfirmadas = ref([])
const reservaConfirmadaSeleccionada = ref(null)
const facturaActual = ref(null)
const facturaDetalles = ref([])
const resumenCarrito = ref(null)
const estadoPago = ref('') // 'procesando', 'exito', 'error'
const mensajePago = ref('')
const mostrarModalConfirmar = ref(false)
const mostrarModalProcesando = ref(false)

// Variables para facturación
const mostrarModalFactura = ref(false)
const facturaGenerada = ref(null)
const cargandoFactura = ref(false)
const tipoFactura = ref('') // 'HOLD' o 'CONFIRMADA'

// Computed
const carritoVacio = computed(() => todasReservas.value.length === 0)

const promocionesVigentes = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  return promocionesDisponibles.value.filter(promo => {
    const fechaFin = new Date(promo.fechaFin || promo.FechaFin)
    fechaFin.setHours(0, 0, 0, 0)
    return fechaFin >= hoy && (promo.estado === 'Activa' || promo.Estado === 'Activa')
  })
})

const subtotal = computed(() => {
  let total = 0
  reservasSeleccionadas.value.forEach(id => {
    const reserva = esUsuarioLogueado.value 
      ? todasReservas.value.find(r => r.IdReserva === id)
      : todasReservas.value[id]
    if (reserva) {
      total += reserva.PrecioBase || 50
    }
  })
  return total
})

const porcentajeDescuento = computed(() => {
  if (!promocionSeleccionada.value) return 0
  const promo = promocionesDisponibles.value.find(p => (p.idPromocion || p.IdPromocion) === promocionSeleccionada.value)
  return promo ? (promo.descuento || promo.Descuento || promo.Porcentaje || 0) : 0
})

const descuento = computed(() => {
  return (subtotal.value * porcentajeDescuento.value) / 100
})

const subtotalConDescuento = computed(() => {
  return subtotal.value - descuento.value
})

const iva = computed(() => {
  return subtotalConDescuento.value * 0.115
})

const totalFinal = computed(() => {
  return subtotalConDescuento.value + iva.value
})

const nombrePromocionSeleccionada = computed(() => {
  if (!promocionSeleccionada.value) return ''
  const promo = promocionesDisponibles.value.find(p => p.IdPromocion === promocionSeleccionada.value)
  return promo ? promo.Nombre : ''
})

const subtotalConfirmadas = computed(() => {
  if (!reservaConfirmadaSeleccionada.value) return 0
  
  const reserva = todasReservasConfirmadas.value.find(r => r.idReserva === reservaConfirmadaSeleccionada.value)
  if (reserva) {
    return (reserva.total || 0) / 1.115
  }
  return 0
})

const ivaConfirmadas = computed(() => {
  return subtotalConfirmadas.value * 0.115
})

const totalConfirmadas = computed(() => {
  return subtotalConfirmadas.value + ivaConfirmadas.value
})

const facturaSubtotal = computed(() => {
  return facturaDetalles.value.reduce((sum, d) => sum + (d.Subtotal || 0), 0)
})

const facturaDescuento = computed(() => {
  return 0 // Calcular si hay descuento en los detalles
})

const facturaIva = computed(() => {
  return facturaSubtotal.value * 0.12
})

const facturaTotal = computed(() => {
  return facturaSubtotal.value - facturaDescuento.value + facturaIva.value
})

// Computed para resumen general del carrito con descuento calculado localmente
const resumenCalculado = computed(() => {
  // Solo calcular si hay una reserva seleccionada
  if (!reservaSeleccionada.value) return null
  
  // Obtener la reserva seleccionada
  const reserva = todasReservas.value.find(r => (r.IdReserva || r.idReserva) === reservaSeleccionada.value)
  if (!reserva) return null
  
  // Usar el subtotal de la reserva (precio sin IVA)
  const subtotal = reserva.subtotal || reserva.Subtotal || reserva.precioMesa || reserva.PrecioMesa || 0
  
  let montoDescuento = 0
  let porcentaje = 0
  
  // Calcular descuento si hay promoción seleccionada
  if (promocionSeleccionada.value) {
    const promo = promocionesVigentes.value.find(p => 
      (p.IdPromocion || p.idPromocion) === promocionSeleccionada.value
    )
    if (promo) {
      porcentaje = promo.descuento || promo.Descuento || promo.PorcentajeDescuento || promo.porcentajeDescuento || 0
      montoDescuento = (subtotal * porcentaje) / 100
    }
  }
  
  const subtotalConDescuento = subtotal - montoDescuento
  const iva = subtotalConDescuento * 0.115
  const total = subtotalConDescuento + iva
  
  return {
    subtotal: subtotal,
    promocionAplicada: promocionSeleccionada.value ? true : false,
    porcentajeDescuento: porcentaje,
    montoDescuentoTotal: montoDescuento,
    iva: iva,
    totalCarrito: total
  }
})

// Métodos
const cargarCarritoUsuario = async () => {
  if (!esUsuarioLogueado.value || !usuario.value?.IdUsuario) return
  
  try {
    let url = `${BASES.RESERVAS}/api/carrito/usuario/${usuario.value.IdUsuario}`
    if (promocionSeleccionada.value) {
      url += `?promocionId=${promocionSeleccionada.value}`
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.success && data.reservas) {
      todasReservas.value = data.reservas
      resumenCarrito.value = data.resumen || null
    } else {
      todasReservas.value = []
      resumenCarrito.value = null
    }
  } catch (error) {
    console.error('Error cargando carrito:', error)
    if (typeof window.showError === 'function') {
      window.showError('Error al cargar el carrito')
    }
  }
}

const cargarCarritoTemporal = () => {
  const carritoTemp = JSON.parse(localStorage.getItem('carritoTemporal')) || []
  todasReservas.value = carritoTemp
}

const cargarPromocionesActivas = async () => {
  cargandoPromociones.value = true
  try {
    const response = await fetch(`${BASES.RESERVAS}/api/carrito/promociones`)
    const data = await response.json()
    
    if (data.success && data.promociones) {
      promocionesDisponibles.value = data.promociones
    }
  } catch (error) {
    // Silenciar error - las promociones son opcionales
    promocionesDisponibles.value = []
  } finally {
    cargandoPromociones.value = false
  }
}

const cargarReservasConfirmadas = async () => {
  if (!esUsuarioLogueado.value || !usuario.value?.IdUsuario) return
  
  try {
    const url = `${BASES.RESERVAS}/api/reservas/confirmadas/${usuario.value.IdUsuario}`
    console.log('Cargando reservas confirmadas desde:', url)
    
    const response = await fetch(url)
    const result = await response.json()
    
    console.log('Respuesta reservas confirmadas:', result)
    
    if (result.success && result.data) {
      todasReservasConfirmadas.value = result.data
      console.log(`${result.data.length} reservas confirmadas cargadas`)
    } else {
      todasReservasConfirmadas.value = []
    }
  } catch (error) {
    console.error('Error cargando reservas confirmadas:', error)
    todasReservasConfirmadas.value = []
  }
}

const seleccionarPromocion = (idPromocion) => {
  if (promocionSeleccionada.value === idPromocion) {
    promocionSeleccionada.value = null
  } else {
    promocionSeleccionada.value = idPromocion
  }
}

const actualizarTotales = () => {
  // Ya no es necesario actualizar totales porque el resumenCalculado lo hace automáticamente
}

const toggleSeleccionReserva = (id) => {
  // Si la reserva ya está seleccionada, deseleccionarla
  if (reservaSeleccionada.value === id) {
    reservaSeleccionada.value = null
  }
  // Si no está seleccionada, el v-model la seleccionará automáticamente
}

const toggleSeleccionConfirmada = (id) => {
  // Si la reserva ya está seleccionada, deseleccionarla
  if (reservaConfirmadaSeleccionada.value === id) {
    reservaConfirmadaSeleccionada.value = null
  }
  // Si no está seleccionada, el v-model la seleccionará automáticamente
}

const eliminarReserva = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta reserva del carrito?')) {
    return
  }
  
  if (esUsuarioLogueado.value) {
    // Usuario logueado - eliminar del servidor
    try {
      const response = await fetch(`${BASES.RESERVAS}/api/carrito/eliminar/${usuario.value.IdUsuario}/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        if (typeof window.showSuccess === 'function') {
          window.showSuccess('Reserva eliminada del carrito')
        }
        await cargarCarritoUsuario()
      }
    } catch (error) {
      console.error('Error eliminando reserva:', error)
    }
  } else {
    // Usuario no logueado - eliminar de localStorage
    let carritoTemp = JSON.parse(localStorage.getItem('carritoTemporal')) || []
    carritoTemp.splice(id, 1)
    localStorage.setItem('carritoTemporal', JSON.stringify(carritoTemp))
    cargarCarritoTemporal()
    if (typeof window.showSuccess === 'function') {
      window.showSuccess('Reserva eliminada del carrito')
    }
  }
}

const vaciarCarrito = () => {
  if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
    return
  }
  
  if (esUsuarioLogueado.value) {
    // Implementar vaciar carrito en servidor
  } else {
    localStorage.removeItem('carritoTemporal')
    todasReservas.value = []
    reservaSeleccionada.value = null
  }
}

const abrirModalConfirmarManual = () => {
  if (!esUsuarioLogueado.value) {
    alert('Debes iniciar sesión para confirmar reservas')
    return
  }
  
  if (!reservaSeleccionada.value) {
    alert('Selecciona una reserva para confirmar')
    return
  }
  
  mostrarModalConfirmar.value = true
}

const cerrarModalConfirmar = () => {
  mostrarModalConfirmar.value = false
}

const confirmarPago = async () => {
  // Cerrar modal de confirmación
  cerrarModalConfirmar()
  
  // Abrir modal de procesamiento
  abrirModalProcesando()
  estadoPago.value = 'procesando'
  
  try {
    // 1. Realizar pago bancario
    const montoPagar = resumenCalculado.value?.totalCarrito || totalFinal.value
    const resultadoBanco = await procesarPagoBancario(montoPagar)
    
    if (!resultadoBanco.ok) {
      // Error en el pago bancario
      estadoPago.value = 'error'
      mensajePago.value = resultadoBanco.mensaje || 'Error al procesar el pago bancario'
      return
    }
    
    // 2. Confirmar reserva en el sistema
    const reservasIdsString = String(reservaSeleccionada.value)
    
    // Obtener descuento del resumen calculado
    const montoDescuento = resumenCalculado.value?.montoDescuentoTotal || 0.00
    
    const requestBody = {
      idUsuario: parseInt(usuario.value.IdUsuario),
      reservasIds: String(reservasIdsString),
      metodoPago: String('Transferencia Bancaria'),
      montoDescuento: Number(montoDescuento.toFixed(2)),
      total: Number(montoPagar.toFixed(2))
    }
    
    console.log('[DEBUG] Confirmando carrito con:', requestBody)
    console.log('[DEBUG] Tipos:', {
      idUsuario: typeof requestBody.idUsuario,
      reservasIds: typeof requestBody.reservasIds,
      metodoPago: typeof requestBody.metodoPago,
      montoDescuento: typeof requestBody.montoDescuento,
      total: typeof requestBody.total
    })
    console.log('[DEBUG] JSON enviado:', JSON.stringify(requestBody, null, 2))
    console.log('[DEBUG] Usuario completo:', usuario.value)
    console.log('[DEBUG] Promocion seleccionada:', promocionSeleccionada.value)
    console.log('[DEBUG] Monto a pagar:', montoPagar)
    
    const response = await fetch(`${BASES.RESERVAS}/api/carrito/confirmar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    
    console.log('[DEBUG] Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DEBUG] Error response:', errorText)
      estadoPago.value = 'error'
      mensajePago.value = `Error del servidor: ${errorText || response.statusText}`
      return
    }
    
    const data = await response.json()
    console.log('[DEBUG] Response data:', data)
    
    if (data.success) {
      // Éxito total
      estadoPago.value = 'exito'
      mensajePago.value = 'Tu pago ha sido procesado y las reservas confirmadas exitosamente'
      
      // Recargar datos
      await cargarCarritoUsuario()
      await cargarReservasConfirmadas()
      reservaSeleccionada.value = null
      promocionSeleccionada.value = null
    } else {
      // Error al confirmar reservas (pero el pago se hizo)
      estadoPago.value = 'error'
      mensajePago.value = 'El pago fue procesado pero hubo un error al confirmar las reservas. Contacta con soporte.'
    }
  } catch (error) {
    console.error('Error confirmando reservas:', error)
    estadoPago.value = 'error'
    mensajePago.value = 'Error al procesar la transacción. Por favor inténtalo nuevamente.'
  }
}

const procesarPagoBancario = async (monto) => {
  try {
    const response = await fetch(`${BASES.FACTURACION}/api/facturas/proxy-banco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cuenta_origen: CUENTA_ORIGEN.toString(),
        cuenta_destino: CUENTA_DESTINO.toString(),
        monto: monto
      })
    })
    const respuestaTexto = await response.text()
    // Verificar si fue exitoso
    if (response.ok || respuestaTexto.toLowerCase().includes('correctamente')) {
      return { ok: true, mensaje: respuestaTexto || 'Transacción realizada correctamente' }
    } else {
      return { ok: false, mensaje: respuestaTexto || 'Error en la transacción bancaria' }
    }
  } catch (error) {
    console.error('Error en pago bancario:', error)
    return { ok: false, mensaje: 'Error de conexión con el banco' }
  }
}

const abrirModalProcesando = () => {
  mostrarModalProcesando.value = true
}

const cerrarModalProcesando = () => {
  mostrarModalProcesando.value = false
  estadoPago.value = ''
  mensajePago.value = ''
}

const generarFacturaDesdeCarrito = async () => {
  if (!reservaSeleccionada.value) {
    if (typeof window.showAlert === 'function') {
      window.showAlert('Selecciona una reserva para generar la factura', 'warning')
    }
    return
  }
  
  // Evitar clicks múltiples
  if (cargandoFactura.value) {
    return
  }
  
  cargandoFactura.value = true
  tipoFactura.value = 'HOLD'
  
  try {
    const payload = {
      IdUsuario: parseInt(usuario.value.IdUsuario || usuario.value.idUsuario),
      ReservasIds: String(reservaSeleccionada.value),
      PromocionId: promocionSeleccionada.value ? parseInt(promocionSeleccionada.value) : null,
      MetodoPago: 'TARJETA'
    }
    
    console.log('Payload being sent to API:', payload)
    
    const response = await fetch(`${BASES.FACTURACION}/api/facturas/generar-carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    console.log('API Response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error Response:', errorData)
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }
    
    const data = await response.json()
    console.log('API Response data:', data)
    
    if (data.success && data.estado === 'SUCCESS') {
      facturaGenerada.value = data
      await generarPDF()
      if (typeof window.showSuccess === 'function') {
        window.showSuccess('Factura generada y descargada exitosamente')
      }
    } else {
      throw new Error(data.mensaje || 'Error al generar factura')
    }
  } catch (error) {
    console.error('Error generando factura:', error)
    if (typeof window.showError === 'function') {
      window.showError('Error al generar la factura')
    }
  } finally {
    cargandoFactura.value = false
  }
}

const generarFacturaConfirmadas = async () => {
  if (!reservaConfirmadaSeleccionada.value) {
    alert('Selecciona una reserva confirmada para facturar')
    return
  }
  
  // Evitar clicks múltiples
  if (cargandoFactura.value) {
    return
  }
  
  cargandoFactura.value = true
  tipoFactura.value = 'CONFIRMADA'
  
  try {
    // Obtener la reserva seleccionada y calcular totales
    const reserva = todasReservasConfirmadas.value.find(r => r.idReserva === reservaConfirmadaSeleccionada.value)
    
    if (!reserva) {
      throw new Error('No se encontró la reserva seleccionada')
    }
    
    // Calcular totales
    const total = Number(reserva.total || 0)
    const subtotal = total / 1.115
    const iva = subtotal * 0.115
    
    const payload = {
      IdUsuario: parseInt(usuario.value.IdUsuario || usuario.value.idUsuario),
      ReservasIds: String(reservaConfirmadaSeleccionada.value),
      TipoFactura: 'CONFIRMADA',
      Subtotal: subtotal,
      Iva: iva,
      Total: total
    }
    
    console.log('Payload for confirmadas:', payload)
    
    // Generar factura de confirmadas
    const response = await fetch(`${BASES.FACTURACION}/api/facturas/generar-confirmadas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error Response:', errorData)
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }
    
    const data = await response.json()
    console.log('API Response data:', data)
    
    if (data.success && data.estado === 'SUCCESS') {
      // Marcar como pagada automáticamente
      const pagarPayload = {
        IdFactura: parseInt(data.idFactura),
        MetodoPago: 'TRANSFERENCIA'
      }
      
      console.log('Payload for marcar-pagada:', pagarPayload)
      
      const pagarResponse = await fetch(`${BASES.FACTURACION}/api/facturas/marcar-pagada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pagarPayload)
      })
      
      if (pagarResponse.ok) {
        const pagarData = await pagarResponse.json()
        console.log('Marcar-pagada response:', pagarData)
        data.Estado = 'Pagada'
        data.MetodoPago = 'TRANSFERENCIA'
      } else {
        console.error('Error marking as paid:', await pagarResponse.text())
      }
      
      facturaGenerada.value = data
      await generarPDF()
      if (typeof window.showSuccess === 'function') {
        window.showSuccess('Factura generada y descargada exitosamente')
      }
    } else {
      throw new Error(data.mensaje || 'Error al generar factura')
    }
  } catch (error) {
    console.error('Error generando factura confirmada:', error)
    if (typeof window.showError === 'function') {
      window.showError('Error al generar la factura')
    }
  } finally {
    cargandoFactura.value = false
  }
}

const cerrarModalFactura = () => {
  mostrarModalFactura.value = false
  facturaGenerada.value = null
  tipoFactura.value = ''
}

const generarPDF = async () => {
  if (!facturaGenerada.value) return
  
  const doc = new jsPDF()
  const factura = facturaGenerada.value
  
  // Cargar logo real
  try {
    const logoImg = new Image()
    logoImg.src = '/img/logo-rincon.png'
    await new Promise((resolve) => {
      logoImg.onload = resolve
      logoImg.onerror = resolve // Continúa aunque falle el logo
    })
    
    // Agregar logo si se cargó correctamente
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      doc.addImage(logoImg, 'PNG', 20, 15, 25, 25)
    }
  } catch (error) {
    console.warn('Error cargando logo:', error)
  }
  
  // Header con logo real o fallback
  doc.setTextColor(139, 69, 19)
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.text('CAFÉ SAN JUAN', 55, 28)
  
  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Calle del Sol #45, San Juan, Puerto Rico | +1 (787) 555-7890', 55, 35)
  doc.text('Lunes a Domingo de 8:00 AM a 10:00 PM', 55, 42)
  
  // Línea separadora
  doc.setDrawColor(220, 220, 220)
  doc.line(20, 50, 190, 50)
  
  // Información de factura
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('FACTURA', 20, 65)
  
  // Número de factura destacado con fondo
  const numeroFactura = factura.IdFactura || factura.idFactura || 'Sin número'
  doc.setDrawColor(139, 69, 19)
  doc.setFillColor(139, 69, 19)
  doc.roundedRect(140, 55, 50, 15, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text(`# ${numeroFactura}`, 150, 65)
  
  // Información de factura
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(60, 60, 60)
  const fechaActual = new Date().toLocaleDateString('es-ES')
  
  doc.text(`Fecha: ${fechaActual}`, 20, 80)
  doc.text(`Estado: ${factura.Estado || factura.EstadoFactura || 'Emitida'}`, 20, 90)
  doc.text(`Tipo: ${tipoFactura.value}`, 20, 100)
  
  // Cliente - información completa
  const clienteId = usuario.value?.IdUsuario || usuario.value?.idUsuario || 'N/A'
  const clienteNombre = usuario.value?.Nombre || usuario.value?.nombre || 'No especificado'
  const clienteEmail = usuario.value?.Email || usuario.value?.email || 'No especificado'
  const clienteTelefono = usuario.value?.Telefono || usuario.value?.telefono || 'No especificado'
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Cliente #: ${clienteId}`, 20, 115)
  doc.text(`Nombre del Cliente: ${clienteNombre}`, 20, 125)
  doc.text(`Correo del Cliente: ${clienteEmail}`, 20, 135)
  doc.text(`Número de teléfono: ${clienteTelefono}`, 20, 145)
  
  // Calcular totales correctos
  const subtotal = factura.subtotal || factura.subtotalBruto || 0
  const descuento = factura.descuento || 0
  const iva = factura.iva || 0
  const total = factura.total || 0
  
  // Detalles de reservas
  const reservaData = tipoFactura.value === 'HOLD' 
    ? todasReservas.value.find(r => (r.IdReserva || r.idReserva) === reservaSeleccionada.value)
    : todasReservasConfirmadas.value.find(r => r.idReserva === reservaConfirmadaSeleccionada.value)
  
  // Tabla de items con total correcto
  const tableData = []
  if (reservaData) {
    tableData.push([
      `Mesa ${reservaData.numeroMesa || reservaData.NumeroMesa}`,
      '1',
      `$${subtotal.toFixed(2)}`,
      `$${total.toFixed(2)}` // Aquí debe ir el total final, no el subtotal
    ])
  }
  
  autoTable(doc, {
    startY: 160,
    head: [['Descripción', 'Cantidad', 'Precio Unit.', 'Total']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: [139, 69, 19], 
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 10,
      textColor: [60, 60, 60],
      halign: 'center'
    },
    styles: { 
      lineColor: [139, 69, 19],
      lineWidth: 0.8,
      cellPadding: 5
    },
    columnStyles: {
      0: { halign: 'left' },
      3: { fontStyle: 'bold', textColor: [139, 69, 19] }
    }
  })
  
  // Recuadro de totales mejorado
  const finalY = doc.lastAutoTable.finalY + 20
  const boxHeight = descuento > 0 ? 55 : 45
  
  doc.setDrawColor(139, 69, 19)
  doc.setFillColor(252, 248, 245)
  doc.roundedRect(120, finalY, 70, boxHeight, 5, 5, 'FD')
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Subtotal:`, 125, finalY + 12)
  doc.text(`$${subtotal.toFixed(2)}`, 165, finalY + 12)
  
  let offsetY = 0
  if (descuento > 0) {
    doc.text(`Descuento:`, 125, finalY + 22)
    doc.text(`-$${descuento.toFixed(2)}`, 165, finalY + 22)
    offsetY = 10
  }
  
  doc.text(`IVA (11.5%):`, 125, finalY + 22 + offsetY)
  doc.text(`$${iva.toFixed(2)}`, 165, finalY + 22 + offsetY)
  
  // Línea separadora en totales
  doc.setDrawColor(139, 69, 19)
  doc.line(125, finalY + 28 + offsetY, 185, finalY + 28 + offsetY)
  
  // Total destacado
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(139, 69, 19)
  doc.text(`TOTAL:`, 125, finalY + 40 + offsetY)
  doc.text(`$${total.toFixed(2)}`, 165, finalY + 40 + offsetY)
  
  // Método de pago en recuadro
  if (factura.MetodoPago) {
    doc.setDrawColor(220, 220, 220)
    doc.setFillColor(248, 248, 248)
    doc.roundedRect(20, finalY + 60, 170, 15, 3, 3, 'FD')
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(`Método de Pago: ${factura.MetodoPago}`, 25, finalY + 70)
  }
  
  // Footer profesional
  doc.setDrawColor(139, 69, 19)
  doc.line(20, 270, 190, 270)
  doc.setFontSize(9)
  doc.setTextColor(139, 69, 19)
  doc.setFont(undefined, 'bold')
  doc.text('CAFÉ SAN JUAN', 20, 280)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text('Gracias por su preferencia', 120, 280)
  
  // Descargar PDF
  const filename = `Factura_${numeroFactura}_${new Date().getTime()}.pdf`
  doc.save(filename)
}

const obtenerDetallesFactura = async (idFactura) => {
  try {
    const response = await fetch(`${BASES.FACTURACION}/api/facturas/detallada/${idFactura}`)
    const data = await response.json()
    
    if (data.success && data.detalles) {
      facturaDetalles.value = data.detalles
    }
  } catch (error) {
    console.error('Error obteniendo detalles de factura:', error)
  }
}

const descargarFactura = () => {
  // Implementar descarga de factura
  if (typeof window.showInfo === 'function') {
    window.showInfo('Funcionalidad de descarga en desarrollo')
  }
}

const nuevaFactura = () => {
  facturaActual.value = null
  facturaDetalles.value = []
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

// Lifecycle
onMounted(() => {
  // Verificar autenticación
  const usuarioStorage = localStorage.getItem('usuario')
  if (usuarioStorage) {
    usuario.value = JSON.parse(usuarioStorage)
    esUsuarioLogueado.value = true
    cargarPromocionesActivas()
    cargarCarritoUsuario()
    cargarReservasConfirmadas()
  } else {
    esUsuarioLogueado.value = false
    cargarCarritoTemporal()
  }
})

// Watch para recargar carrito cuando cambia la promoción seleccionada
watch(promocionSeleccionada, async (nuevaPromocion, viejaPromocion) => {
  if (esUsuarioLogueado.value && usuario.value?.IdUsuario) {
    await cargarCarritoUsuario()
  }
})
</script>

<style>
/* Reset y base */
* {
  box-sizing: border-box;
}

/* Contenedor principal - fondo beige claro */
.carrito-container {
  background: #f5f3f0 !important;
  min-height: 100vh !important;
  padding: 6rem 0 2rem 0 !important;
  margin: 0 !important;
}

.container {
  max-width: 1100px !important;
  margin: 0 auto !important;
  padding: 0 1.5rem !important;
  width: 100% !important;
}

/* Card principal - más compacto y centrado */
.carrito-card {
  background: white !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) !important;
  overflow: hidden !important;
  border: 1px solid #e5e7eb !important;
  max-width: 1000px !important;
  margin: 0 auto !important;
  width: 100% !important;
}

/* Header azul brillante */
.carrito-header {
  background: #2563eb !important;
  color: white !important;
  padding: 1rem 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.carrito-header h4 {
  margin: 0 !important;
  font-size: 1.375rem !important;
  font-weight: 600 !important;
  color: white !important;
  letter-spacing: -0.025em !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

.carrito-header i {
  font-size: 1.5rem !important;
  color: white !important;
}

/* Body del card */
.card-body {
  padding: 1.5rem !important;
  background: white !important;
  min-height: auto !important;
}

/* Banner de bienvenida */
.alert-info {
  background-color: #d1ecf1 !important;
  border-color: #bee5eb !important;
  color: #0c5460 !important;
  border-radius: 0.375rem !important;
  padding: 1rem 1.25rem !important;
  margin-bottom: 1.5rem !important;
  font-size: 0.95rem !important;
}

.alert-info a {
  color: #0c5460 !important;
  font-weight: 600 !important;
  text-decoration: underline !important;
}

/* Carrito vacío - centrado y elegante */
.carrito-vacio-container {
  text-align: center !important;
  padding: 3.5rem 2rem !important;
  background: white !important;
}

.carrito-vacio-icon {
  font-size: 5rem !important;
  color: #9ca3af !important;
  display: block !important;
  margin: 0 auto 1.5rem !important;
  opacity: 0.8 !important;
}

.carrito-vacio-container h5 {
  color: #1f2937 !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  margin: 0 0 0.75rem 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  letter-spacing: -0.025em !important;
}

.carrito-vacio-container p {
  color: #6b7280 !important;
  font-size: 1rem !important;
  margin: 0 0 2rem 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  line-height: 1.5 !important;
}

/* Botón principal - azul brillante */
.btn-hacer-reserva {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  padding: 0.875rem 2rem !important;
  background: #2563eb !important;
  color: white !important;
  text-decoration: none !important;
  border-radius: 0.5rem !important;
  font-weight: 500 !important;
  font-size: 1rem !important;
  border: none !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

.btn-hacer-reserva:hover {
  background: #1d4ed8 !important;
  color: white !important;
  text-decoration: none !important;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
  transform: translateY(-1px) !important;
}

.btn-hacer-reserva i {
  font-size: 1.1rem !important;
}

/* Tablas */
.table-responsive {
  border-radius: 0.5rem !important;
  overflow: hidden !important;
}

.table {
  margin: 0 !important;
  font-size: 0.9rem !important;
  color: #344054 !important;
}

.table thead {
  background: #f9fafb !important;
}

.table th {
  font-weight: 600 !important;
  color: #344054 !important;
  padding: 0.875rem 1rem !important;
  border-bottom: 2px solid #e5e7eb !important;
  font-size: 0.875rem !important;
}

.table td {
  padding: 1rem !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #f3f4f6 !important;
}

.table tbody tr:hover {
  background: #f9fafb !important;
}

/* Botones */
.btn-outline-primary {
  color: #2563eb !important;
  border-color: #2563eb !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  letter-spacing: -0.01em !important;
}

.btn-outline-primary:hover {
  background: #2563eb !important;
  color: white !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(37,99,235,0.2) !important;
}

.btn-outline-danger {
  color: #dc2626 !important;
  border-color: #dc2626 !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  letter-spacing: -0.01em !important;
}

.btn-outline-danger:hover {
  background: #dc2626 !important;
  color: white !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(220,38,38,0.2) !important;
}

.btn-primary {
  background: #2563eb !important;
  border-color: #2563eb !important;
  color: white !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  letter-spacing: -0.01em !important;
}

.btn-primary:hover {
  background: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(37,99,235,0.25) !important;
}

.btn-success {
  background: #16a34a !important;
  border-color: #16a34a !important;
  color: white !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  letter-spacing: -0.01em !important;
}

.btn-success:hover {
  background: #15803d !important;
  border-color: #15803d !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(22,163,74,0.25) !important;
}

/* Botones pequeños */
.btn-sm {
  font-size: 0.75rem !important;
  padding: 0.375rem 0.75rem !important;
  border-radius: 0.25rem !important;
  font-weight: 500 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  letter-spacing: -0.01em !important;
}

.btn-sm:hover {
  transform: translateY(-1px) !important;
}

/* Botones outline secondary */
.btn-outline-secondary {
  color: #6b7280 !important;
  border-color: #d1d5db !important;
  border-radius: 0.375rem !important;
  font-size: 0.8125rem !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  letter-spacing: -0.01em !important;
}

.btn-outline-secondary:hover {
  background: #6b7280 !important;
  color: white !important;
  border-color: #6b7280 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(107,114,128,0.2) !important;
}

/* Grupo de botones */
.btn-group {
  gap: 0.5rem !important;
  display: flex !important;
}

.btn-group .btn {
  flex: 0 0 auto !important;
}

/* Botones deshabilitados */
.btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.btn:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

.text-primary {
  color: #2563eb !important;
}

/* Mini Resumen Compacto */
.mini-resumen-card {
  background: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  border: 1px solid #e5e7eb !important;
  overflow: hidden !important;
}

.mini-resumen-header {
  background: #f9fafb !important;
  padding: 0.75rem 1rem !important;
  border-bottom: 1px solid #e5e7eb !important;
}

.mini-resumen-header h6 {
  margin: 0 !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: #374151 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

.mini-resumen-body {
  padding: 0.75rem 1rem !important;
}

.resumen-linea {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 0.5rem !important;
  font-size: 0.875rem !important;
}

.resumen-linea:last-child {
  margin-bottom: 0 !important;
}

.resumen-label {
  color: #6b7280 !important;
  font-weight: 400 !important;
}

.resumen-valor {
  color: #1f2937 !important;
  font-weight: 500 !important;
}

.resumen-total {
  border-top: 2px solid #e5e7eb !important;
  padding-top: 0.5rem !important;
  margin-top: 0.5rem !important;
  font-size: 0.9375rem !important;
}

.resumen-total .resumen-label,
.resumen-total .resumen-valor {
  font-weight: 700 !important;
  color: #2563eb !important;
}

.mini-resumen-acciones {
  padding: 0.75rem 1rem !important;
  background: #f9fafb !important;
  border-top: 1px solid #e5e7eb !important;
  display: flex !important;
  gap: 0.5rem !important;
  flex-wrap: wrap !important;
}

/* Botones mini */
.btn-mini {
  flex: 1 !important;
  min-width: 0 !important;
  padding: 0.5rem 0.75rem !important;
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.375rem !important;
  white-space: nowrap !important;
}

.btn-mini i {
  font-size: 0.875rem !important;
}

.btn-mini-success {
  background: #16a34a !important;
  color: white !important;
}

.btn-mini-success:hover:not(:disabled) {
  background: #15803d !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(22,163,74,0.2) !important;
}

.btn-mini-primary {
  background: #2563eb !important;
  color: white !important;
}

.btn-mini-primary:hover:not(:disabled) {
  background: #1d4ed8 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(37,99,235,0.2) !important;
}

.btn-mini-danger {
  background: #dc2626 !important;
  color: white !important;
}

.btn-mini-danger:hover:not(:disabled) {
  background: #b91c1c !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(220,38,38,0.2) !important;
}

.btn-mini:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* Promociones Cards Compactas */
.promociones-grid {
  display: flex !important;
  gap: 0.75rem !important;
  flex-wrap: wrap !important;
  margin-bottom: 1.5rem !important;
}

.promo-card {
  background: white !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 1rem !important;
  padding: 1rem !important;
  min-width: 120px !important;
  max-width: 140px !important;
  text-align: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
  position: relative !important;
}

.promo-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
  border-color: #16a34a !important;
}

.promo-card-selected {
  border-color: #16a34a !important;
  background: #f0fdf4 !important;
  box-shadow: 0 4px 8px rgba(22,163,74,0.15) !important;
}

.promo-icon {
  font-size: 1.75rem !important;
  color: #16a34a !important;
  margin-bottom: 0.5rem !important;
}

.promo-descuento {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: #16a34a !important;
  line-height: 1 !important;
  margin-bottom: 0.25rem !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

.promo-nombre {
  font-size: 0.75rem !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  margin-top: 0.25rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.promo-badge {
  position: absolute !important;
  top: -8px !important;
  right: -8px !important;
  background: #16a34a !important;
  color: white !important;
  font-size: 0.625rem !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 1rem !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
}

/* Fix para modales */
.modal {
  z-index: 1055 !important;
}

.modal-backdrop {
  z-index: 1050 !important;
}

.modal.show {
  display: block !important;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem 0.5rem !important;
  }
  
  .card-body {
    padding: 2rem 1rem !important;
  }

  .mini-resumen-acciones {
    flex-direction: column !important;
  }

  .btn-mini {
    width: 100% !important;
  }

  .promo-card {
    min-width: 100px !important;
    max-width: 120px !important;
  }
}

/* Estilos del Modal Personalizado */
.modal-custom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  overflow-y: auto;
  padding: 1rem;
}

.modal-custom {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-custom-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 0.5rem 0.5rem 0 0;
}

.modal-custom-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #000;
  opacity: 0.5;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-custom:hover {
  opacity: 0.75;
}

.modal-custom-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-custom-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0 0 0.5rem 0.5rem;
}

.btn-custom {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-custom-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-custom-secondary:hover {
  background-color: #5c636a;
}

.btn-custom-success {
  background-color: #28a745;
  color: white;
}

.btn-custom-success:hover {
  background-color: #218838;
}

.btn-custom-success:disabled {
  background-color: #94d3a2;
  cursor: not-allowed;
}

.form-select-custom {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-select-custom:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.alert-info-custom {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #b6effb;
  border-radius: 0.375rem;
  background-color: #cff4fc;
  color: #055160;
  font-size: 0.875rem;
}

.spinner-custom {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spinnerRotate 0.75s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spinnerRotate {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State - Reservas Confirmadas */
.empty-state-confirmadas {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  margin: 1.5rem 0;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

.empty-icon i {
  font-size: 5rem;
  color: #10b981;
  opacity: 0.2;
  filter: drop-shadow(0 4px 6px rgba(16, 185, 129, 0.1));
}

.empty-title {
  color: #1f2937;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.empty-text {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.empty-action {
  margin-top: 1.5rem;
}

.empty-action .btn {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-action .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.text-center-custom {
  text-align: center;
}

.alert-success-custom {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #badbcc;
  border-radius: 0.375rem;
  background-color: #d1e7dd;
  color: #0f5132;
  font-size: 0.875rem;
}

.alert-danger-custom {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #f5c2c7;
  border-radius: 0.375rem;
  background-color: #f8d7da;
  color: #842029;
  font-size: 0.875rem;
}

/* Animaciones para el modal de factura */
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-custom {
  animation: fadeInUp 0.3s ease-out;
}

.totals-card {
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

.modern-table {
  animation: fadeInUp 0.4s ease-out 0.05s both;
}
</style>