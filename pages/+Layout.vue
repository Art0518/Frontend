<!-- https://vike.dev/Layout -->

<template>
  <div id="app">
    <!-- Loading Screen -->
    <Loading v-if="showLoading" />

    <!-- Navbar Component -->
    <Navbar />

    <!-- Page Content -->
    <div class="content">
      <slot />
    </div>

    <!-- Footer Component -->
    <Footer />

    <!-- Modals -->
    <AuthModal :show="showAuthModal" @close="showAuthModal = false" />
    <NotificationModal 
      :show="notificationData.show"
      :type="notificationData.type"
      :title="notificationData.title"
      :message="notificationData.message"
      @ok="handleNotificationOk"
      @close="notificationData.show = false"
    />
    <ConfirmationModal
      :show="confirmationData.show"
      :title="confirmationData.title"
      :message="confirmationData.message"
      @confirm="handleConfirmationConfirm"
      @cancel="handleConfirmationCancel"
      @close="confirmationData.show = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Loading from './components/Loading.vue'
import AuthModal from './components/AuthModal.vue'
import NotificationModal from './components/NotificationModal.vue'
import ConfirmationModal from './components/ConfirmationModal.vue'
import { setupNotifications } from './utils/notifications.js'

const showLoading = ref(true)
const showAuthModal = ref(false)
const notificationData = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  callback: null
})
const confirmationData = ref({
  show: false,
  title: 'Confirmación',
  message: '',
  onConfirm: null,
  onCancel: null
})

onMounted(() => {
  // Ocultar loading después de 3 segundos
  setTimeout(() => {
    showLoading.value = false
  }, 3000)

  setupNotifications()

  window.addEventListener('open-auth-modal', () => {
    showAuthModal.value = true
  })

  window.addEventListener('show-notification', (e) => {
    notificationData.value = {
      show: true,
      type: e.detail.type,
      title: e.detail.title,
      message: e.detail.message,
      callback: e.detail.callback
    }
  })

  window.addEventListener('show-confirmation', (e) => {
    console.log('📩 Evento show-confirmation recibido:', e.detail)
    confirmationData.value = {
      show: true,
      title: e.detail.title || 'Confirmación',
      message: e.detail.message,
      onConfirm: e.detail.onConfirm,
      onCancel: e.detail.onCancel
    }
    console.log('✅ confirmationData actualizado:', confirmationData.value)
  })
})

const handleNotificationOk = () => {
  if (notificationData.value.callback) {
    notificationData.value.callback()
  }
  notificationData.value.show = false
}

const handleConfirmationConfirm = () => {
  console.log('✅ Confirmación aceptada')
  if (confirmationData.value.onConfirm) {
    console.log('🔄 Ejecutando callback de confirmación')
    confirmationData.value.onConfirm()
  }
  confirmationData.value.show = false
}

const handleConfirmationCancel = () => {
  console.log('❌ Confirmación cancelada')
  if (confirmationData.value.onCancel) {
    confirmationData.value.onCancel()
  }
  confirmationData.value.show = false
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');

body {
  margin: 0;
  font-family: 'Poppins', sans-serif;
}
* {
  box-sizing: border-box;
}
a {
  text-decoration: none;
}
</style>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex-grow: 1;
}

/* Page Transition Animation */
#page-content {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
body.page-transition #page-content {
  opacity: 0;
}
</style>
