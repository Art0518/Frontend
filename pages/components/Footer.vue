<template>
  <footer>
    © 2025 Un Rincón en San Juan | Sabores del Caribe y tradición puertorriqueña
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
}
</script>

<style scoped>
footer {
  background: linear-gradient(135deg, #3e2f21 0%, #6b8e23 100%);
  color: #f5d7a5;
  text-align: center;
  padding: 25px 20px;
  font-size: 0.95em;
  font-weight: 500;
  border-top: 3px solid #8dbb35;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
  margin-top: auto;
  width: 100%;
}

footer:hover {
  background: linear-gradient(135deg, #6b8e23 0%, #3e2f21 100%);
  transition: background 0.5s ease;
}

@media (max-width: 768px) {
  footer {
    font-size: 0.85em;
    padding: 20px 15px;
  }
}
</style>