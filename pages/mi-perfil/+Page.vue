<template>
  <div>
    <h1>Mi Perfil</h1>
    <div id="perfilContainer">
      <!-- El HTML del perfil se renderizar� mediante JavaScript -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiPerfilPage',
  mounted() {
    const script = document.createElement('script')
    script.src = '/js/perfil.js'
 document.body.appendChild(script)
  }
}
</script>

<style scoped>
/* ?? ESTILOS PARA MI PERFIL */
#perfilContainer {
  max-width: 600px !important;
  margin: 0 auto !important;
  background: rgba(255, 255, 255, 0.95) !important;
  padding: 40px !important;
  border-radius: 20px !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(107, 142, 35, 0.2) !important;
}

#perfilContainer label {
  color: #3e2f21 !important;
  font-weight: 600;
  font-size: 16px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: block;
}

#perfilContainer input {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 5px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  color: #3e2f21 !important;
  background-color: #fafafa;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

#perfilContainer input:focus {
  outline: none;
  border-color: #6b8e23;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(107, 142, 35, 0.3);
}

#perfilContainer input.valid {
  border-color: #28a745 !important;
  background-color: #f8fff8 !important;
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.3) !important;
}

#perfilContainer input.error {
  border-color: #dc3545 !important;
  background-color: #fff5f5 !important;
  box-shadow: 0 0 8px rgba(220, 53, 69, 0.3) !important;
}

#perfilContainer small {
  display: block;
  font-size: 0.85em;
  color: #666;
  margin-bottom: 5px;
  font-style: italic;
}

#perfilContainer .validation-message {
  font-size: 0.85em;
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  display: none;
}

#perfilContainer .validation-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  display: block;
}

#perfilContainer .validation-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  display: block;
}

/* ?? ESTILOS PARA NOTIFICACIONES DEL PERFIL */
.mensaje-error, .mensaje-exito {
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  white-space: pre-line; /* Para saltos de l�nea */
}

.mensaje-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-left: 4px solid #dc3545;
}

.mensaje-exito {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-left: 4px solid #28a745;
}

#notificacionesPerfil {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
</style>
