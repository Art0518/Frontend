<template>
<div class="loading-overlay">
    <div class="loading-content">
      <div class="logo-wrapper">
    <img src="/img/logo-rincon.png" alt="Cafe SanJuan" class="logo-animado" />
      </div>
      <p class="loading-text">Preparando tu experiencia...</p>
 </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingComponent'
}
</script>

<style scoped>
/* === PANTALLA DE CARGA FULLSCREEN === */
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

/* Logo wrapper con animaci�n */
.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  animation: pulse 2s ease-in-out infinite;
}

/* Logo animado */
.logo-animado {
  width: 180px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.15));
}

/* Texto de carga */
.loading-text {
  font-size: 1.3em;
  font-weight: 600;
  color: #4a2c0a;
  font-family: 'Poppins', sans-serif;
  margin: 0;
  animation: fadeInOut 1.5s ease-in-out infinite;
}

/* Animaci�n de aparici�n inicial */
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

/* Animaci�n de pulso para el logo */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
transform: scale(1.05);
  }
}

/* Animaci�n de fade para el texto */
@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
