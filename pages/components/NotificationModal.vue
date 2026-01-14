<template>
  <div v-if="show" class="notification-modal-overlay" :class="{ active: show }">
    <div class="notification-modal" :class="`notification-${type}`">
      <div class="notification-icon-container">
        <i :class="iconClass" class="notification-icon"></i>
 </div>
      <h3 class="notification-title">{{ title }}</h3>
      <p class="notification-message">{{ message }}</p>
      <button class="btn-notification-ok" @click="handleOk">Aceptar</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationModal',
  props: {
    show: {
 type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info' // success, error, warning, info
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconClass() {
      const icons = {
        success: 'bi bi-check-circle-fill',
        error: 'bi bi-x-circle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
info: 'bi bi-info-circle-fill'
      }
      return icons[this.type] || icons.info
    }
  },
  methods: {
    handleOk() {
    this.$emit('ok')
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
.notification-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
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
  position: relative !important;
  background-color: #fff !important;
  padding: 40px 50px;
  border-radius: 20px;
  width: 90% !important;
  max-width: 450px !important;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  color: #3e2f21;
  animation: modalSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-top: 5px solid #6b8e23;
  z-index: 10001 !important;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.7);
    opacity: 0;
  }
  to {
    transform: scale(1);
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

.btn-notification-ok {
  background: linear-gradient(135deg, #6b8e23, #8dbb35);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 1.1em;
  border-radius: 30px;
  padding: 14px 50px;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 142, 35, 0.4);
}

.btn-notification-ok:hover {
  background: linear-gradient(135deg, #8dbb35, #a0d548);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 142, 35, 0.6);
}

.btn-notification-ok:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(107, 142, 35, 0.4);
}

/* Estilos según tipo */
.notification-success .notification-icon {
  color: #6b8e23;
}

.notification-error .notification-icon {
  color: #dc3545;
}

.notification-warning .notification-icon {
  color: #ffc107;
}

.notification-info .notification-icon {
  color: #17a2b8;
}

.notification-success {
  border-top-color: #6b8e23;
}

.notification-error {
  border-top-color: #dc3545;
}

.notification-warning {
  border-top-color: #ffc107;
}

.notification-info {
  border-top-color: #17a2b8;
}
</style>