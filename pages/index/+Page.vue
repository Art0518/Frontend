<template>
  <div>
    <!-- ===================== -->
    <!-- HERO SECTION -->
    <!-- ===================== -->
    <section class="home-hero">
      <div class="home-content">
        <h1>Bienvenido a Cafe SanJuan</h1>
   <p>
     Vive una experiencia caribeña única entre sabores, aromas y tradición.
        </p>
        <a href="/reservas">
    <button>Reservar una mesa</button>
        </a>
      </div>
    </section>

    <!-- ===================== -->
    <!-- NUESTRA HISTORIA -->
    <!-- ===================== -->
    <section class="section historia-section">
      <h2>Nuestra Historia</h2>

      <p>
        En el corazón de San Juan, nació Cafe SanJuan. Nuestro sueño comenzó con una simple idea: crear un espacio donde el aroma del café se mezcle con la calidez de nuestra gente y la pasión por la buena comida. Cada taza que servimos es un homenaje a nuestras tradiciones. Aquí, cada sabor cuenta una historia llena de amor y dedicación.
      </p>

      <div class="historia-imagen-container">
    <img src="/img/Fondo-historia.png"
       alt="Vista del Viejo San Juan al atardecer"
       class="historia-imagen" />
      </div>
    </section>

    <!-- ===================== -->
    <!-- ESPECIALIDADES -->
    <!-- ===================== -->
    <section class="section especialidades">
      <h2>Especialidades</h2>
      <p>Descubre nuestras delicias más queridas por los visitantes.</p>

      <div class="grid-especialidades">
  <!-- CAFÉS -->
 <div class="card-especialidad">
 <img src="https://apasionadosporelcafe.com/wp-content/uploads/2017/06/apasionados-espresso-caribe-cover.png" alt="Café Caribeño" />
          <h3>Café Caribeño</h3>
          <p>Suave mezcla puertorriqueña con notas de cacao y canela.</p>
        </div>

        <div class="card-especialidad">
          <img src="https://sanjuanfoodtours.com/wp-content/uploads/2023/04/san-juan-coffee-flavors-food-tours-1200x800-1-1024x683.jpg" alt="Espresso San Juan" />
     <h3>Espresso San Juan</h3>
          <p>Intenso y aromático, elaborado con granos tostados localmente.</p>
        </div>

    <div class="card-especialidad">
          <img src="https://www.brighteyedbaker.com/wp-content/uploads/2024/07/Dulce-de-Leche-Latte-Recipe.jpg" alt="Latte Borinqueño" />
          <h3>Latte Borinqueño</h3>
<p>Latte cremoso con espuma de leche y un toque de canela y vainilla.</p>
    </div>

        <!-- POSTRES -->
 <div class="card-especialidad">
     <img src="https://tiaclara.com/wp-content/uploads/2013/12/caribbean-guava-tart-DSC3240.jpg" alt="Pastel de Guayaba" />
          <h3>Pastel de Guayaba</h3>
          <p>Postre tradicional del Caribe con relleno de guayaba natural.</p>
  </div>

        <div class="card-especialidad">
   <img src="https://img.bestrecipes.com.au/IyKrHzG5/br/2017/11/1980-tropical-cheesecake-log-953767-1.jpg" alt="Cheesecake Tropical" />
          <h3>Cheesecake Tropical</h3>
        <p>Cremoso cheesecake con toques de coco y piña fresca.</p>
 </div>

        <div class="card-especialidad">
   <img src="https://www.recetasnestle.com.do/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/f4d0c7d20ba3edf480b0e92261be0320.jpg?itok=oCk0AlVG" alt="Flan de Coco" />
    <h3>Flan de Coco</h3>
  <p>Clásico flan casero con coco rallado y caramelo dorado al estilo boricua.</p>
        </div>
      </div>
    </section>

    <!-- ===================== -->
    <!-- CONTACTO -->
    <!-- ===================== -->
    <section class="section">
      <h2>Contáctanos</h2>

      <div class="contact-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>Calle del Sol #45, San Juan, Puerto Rico</span>
    </div>

      <div class="contact-item">
        <i class="fas fa-phone"></i>
        <span>+1 (787) 555-7890</span>
      </div>

  <div class="contact-item">
     <i class="fas fa-clock"></i>
        <span>Lunes a Domingo de 8:00 AM a 10:00 PM</span>
      </div>

      <!-- MAPA DE GOOGLE MAPS -->
      <div class="mapa-container">
   <h3>Nuestra Ubicación</h3>
      <iframe 
          class="mapa-iframe"
     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3785.5776856715047!2d-66.11663668503484!3d18.4655394874067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c036ff4c3db2e3b%3A0x3b5c9a79f7e0e2a1!2sCalle%20del%20Sol%2C%20San%20Juan%2C%2000901%2C%20Puerto%20Rico!5e0!3m2!1ses!2sus!4v1703875200000!5m2!1ses!2sus" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
/* === HERO SECTION === */
.home-hero {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  background-image: url("/img/fondo-playa.png");
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* capa de oscurecimiento */
.home-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 0;
}

/* contenido centrado */
.home-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  padding: 40px;
  color: #fff;
}

.home-content h1 {
  font-family: "Playfair Display", serif;
  font-size: 3.8rem;
  line-height: 1.2;
  font-weight: 700;
  margin-bottom: 20px;
}

.home-content p {
  font-size: 1.2rem;
  color: #f5f5f5;
  margin-bottom: 35px;
}

button {
  background-color: #6b8e23;
  color: white;
  border: none;
  padding: 14px 45px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
}

button:hover {
  background-color: #557a1b;
  transform: translateY(-3px) scale(1.05);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

/* === HISTORIA === */
.historia-section {
  text-align: center;
  padding-bottom: 60px;
}

.historia-section h2 {
  font-family: "Playfair Display", serif;
  font-size: 2.4em;
  margin-bottom: 20px;
  color: #3e2f21;
}

.historia-section p {
  max-width: 850px;
  margin: 0 auto 40px auto;
  line-height: 1.8em;
  font-size: 1.1em;
  color: #4a3b2e;
}

.historia-imagen-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.historia-imagen {
  width: 90%;
  max-width: 1000px;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.historia-imagen:hover {
transform: scale(1.03);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

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

.section:nth-child(even) {
  background-color: #fdf7ec;
}

.section h2 {
  font-family: "Playfair Display", serif;
  font-size: 2.4em;
  margin-bottom: 20px;
  color: #3e2f21;
}

.section p {
  max-width: 900px;
  line-height: 1.7em;
  font-size: 1.1em;
  color: #4a3b2e;
  text-align: justify;
}

/* === GALER�A DE ESPECIALIDADES === */
.grid-especialidades {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
margin-top: 50px;
  width: 90%;
  max-width: 1100px;
  justify-content: center;
}

.card-especialidad {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-especialidad img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-bottom: 4px solid #6b8e23;
  transition: transform 0.5s ease;
}

.card-especialidad:hover img {
  transform: scale(1.1);
}

.card-especialidad:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.card-especialidad h3 {
  font-family: "Playfair Display", serif;
  color: #3e2f21;
  font-size: 1.4em;
  margin: 15px 0 5px 0;
}

.card-especialidad p {
  font-size: 1em;
  color: #5a4a3a;
  margin-bottom: 20px;
  padding: 0 15px;
}

/* === CONTACTO === */
.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin: 10px 0;
  font-size: 1.1em;
}

.contact-item i {
  color: #6b8e23;
}

/* === MAPA === */
.mapa-container {
  width: 100%;
  max-width: 800px;
  margin: 40px auto 0;
  text-align: center;
}

.mapa-container h3 {
  font-family: "Playfair Display", serif;
  font-size: 1.8em;
  color: #3e2f21;
  margin-bottom: 20px;
}

.mapa-iframe {
  width: 100%;
  height: 300px;
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mapa-iframe:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
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
  .home-content h1 {
    font-size: 2.3rem;
  }

  .home-content p {
    font-size: 1rem;
  }

  button {
    width: 100%;
  }

  .grid-especialidades {
    gap: 25px;
  }
}
</style>
