// ============================================================
// SISTEMA DE NOTIFICACIONES MODALES PARA VUE
// ============================================================

export function setupNotifications(app) {
  // Estado global para modales
  const state = {
    notification: {
      show: false,
      type: 'info',
      title: '',
      message: '',
      callback: null
    },
    confirmation: {
      show: false,
      title: 'Confirmación',
      message: '',
      onConfirm: null,
      onCancel: null
    }
  }

  // Función para mostrar notificación
  window.showNotification = function(message, type = 'info', title = null, onClose = null) {
    const defaultTitles = {
      success: '¡Éxito!',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    }

    state.notification.show = true
    state.notification.type = type
    state.notification.title = title || defaultTitles[type] || 'Notificación'
    state.notification.message = message
    state.notification.callback = onClose

    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        type,
        title: state.notification.title,
        message,
        callback: onClose
      }
    }))
  }

  // Función para mostrar confirmación
  window.showConfirm = function(message, onConfirm, onCancel = null, title = 'Confirmación') {
    state.confirmation.show = true
    state.confirmation.title = title
    state.confirmation.message = message
    state.confirmation.onConfirm = onConfirm
    state.confirmation.onCancel = onCancel

    console.log('📢 Emitiendo evento show-confirmation con:', { title, message })

    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('show-confirmation', {
      detail: {
        title,
        message,
        onConfirm,
        onCancel
      }
    }))
  }

  // Funciones auxiliares
  window.showSuccess = function(message, title = null, onClose = null) {
    window.showNotification(message, 'success', title, onClose)
  }

  window.showError = function(message, title = null, onClose = null) {
    window.showNotification(message, 'error', title, onClose)
  }

  window.showWarning = function(message, title = null, onClose = null) {
    window.showNotification(message, 'warning', title, onClose)
  }

  window.showInfo = function(message, title = null, onClose = null) {
    window.showNotification(message, 'info', title, onClose)
  }

  // Compatibilidad con código antiguo
  window.showAlert = function(message, type = 'info') {
    window.showNotification(message, type)
  }

  console.log('✅ Sistema de notificaciones modales cargado correctamente')

  return state
}

// Exportar funciones individuales
export function showNotification(message, type = 'info', title = null, onClose = null) {
  if (window.showNotification) {
    window.showNotification(message, type, title, onClose)
  }
}

export function showConfirm(message, onConfirm, onCancel = null) {
  if (window.showConfirm) {
    window.showConfirm(message, onConfirm, onCancel)
  }
}

export function showSuccess(message, title = null, onClose = null) {
  if (window.showSuccess) {
    window.showSuccess(message, title, onClose)
  }
}

export function showError(message, title = null, onClose = null) {
  if (window.showError) {
    window.showError(message, title, onClose)
  }
}

export function showWarning(message, title = null, onClose = null) {
  if (window.showWarning) {
    window.showWarning(message, title, onClose)
  }
}

export function showInfo(message, title = null, onClose = null) {
  if (window.showInfo) {
    window.showInfo(message, title, onClose)
  }
}
