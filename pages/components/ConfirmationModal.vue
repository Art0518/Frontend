<template>
  <div v-if="show" class="notification-modal-overlay" :class="{ active: show }">
    <div class="notification-modal notification-warning">
      <div class="notification-icon-container">
        <i class="notification-icon bi bi-question-circle-fill"></i>
      </div>
 <h3 class="notification-title">{{ title }}</h3>
      <p class="notification-message">{{ message }}</p>
      <div class="confirmation-buttons">
        <button class="btn-confirmation-cancel" @click="handleCancel">Cancelar</button>
     <button class="btn-confirmation-ok" @click="handleConfirm">Aceptar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
name: 'ConfirmationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
    type: String,
      default: 'Confirmaci�n'
    },
    message: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
      this.$emit('close')
    },
  handleCancel() {
      this.$emit('cancel')
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
/* === MODAL DE CONFIRMACIÓN === */
.notification-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 10000 !important;
  backdrop-filter: blur(3px);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.notification-modal-overlay.active {
  opacity: 1 !important;
  pointer-events: auto !important;
}

.notification-modal {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  background-color: #fff;
  padding: 40px 50px;
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  color: #3e2f21;
  animation: modalSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-top: 5px solid #ff9800;
  z-index: 10001 !important;
}

@keyframes modalSlideIn {
  from {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.notification-icon-container {
  margin-bottom: 20px;
}

.notification-icon {
  font-size: 4.5rem;
  display: block;
  margin: 0 auto;
  color: #ff9800;
  animation: iconPulse 0.6s ease-out;
}

@keyframes iconPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.notification-title {
  font-family: "Playfair Display", serif;
  font-size: 1.8em;
  font-weight: 700;
  margin: 15px 0;
  color: #3e2f21;
}

.notification-message {
  font-size: 1.1em;
  color: #555;
  margin: 20px 0 30px;
  line-height: 1.6;
}

.confirmation-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.btn-confirmation-cancel,
.btn-confirmation-ok {
  border: none;
  font-weight: 700;
  font-size: 1.05em;
  border-radius: 30px;
  padding: 12px 35px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 130px;
}

.btn-confirmation-cancel {
  background: #e0e0e0;
  color: #555;
}

.btn-confirmation-cancel:hover {
  background: #d0d0d0;
  transform: scale(1.05);
}

.btn-confirmation-ok {
  background: linear-gradient(135deg, #ff9800, #ffc107);
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
}

.btn-confirmation-ok:hover {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.5);
}
</style>