mapboxgl.accessToken = 'pk.eyJ1Ijoia2xvcGFiIiwiYSI6ImNtZmExeWk5NDE1bGoya3E1b3JkOXk0eWIifQ.FaUDJ9mHwP7j8P4iU1LOwg';

// Mostrar el mapa al presionar el botón de inicio
document.getElementById("enter-map").addEventListener("click", () => {
  const intro = document.getElementById("intro-screen");
  intro.style.opacity = "0";
  setTimeout(() => {
    intro.style.display = "none";
    document.getElementById("map-container").style.display = "block";

    // 👇 Inicializar mapa
    iniciarMapa();

    // 👇 Esperar a que se inicialice y forzar resize + animar
    setTimeout(() => {
      if (window.mapInstance) {
        window.mapInstance.resize();
      }
      document.getElementById('map').classList.add('visible');
    }, 400);

    // 👇 Mensaje personalizado
    function showIntroMessage(text, autoCloseSeconds = 6) {
      const msg = document.getElementById('intro-message');
      const textNode = document.getElementById('intro-text');
      if (!msg || !textNode) return;

      textNode.textContent = text;
      msg.classList.remove('hidden');

      const closeBtn = document.getElementById('close-intro');
      closeBtn.onclick = () => { msg.classList.add('hidden'); };

      if (autoCloseSeconds > 0) {
        setTimeout(() => {
          msg.classList.add('hidden');
        }, autoCloseSeconds * 1000);
      }
    }

    setTimeout(() => {
      showIntroMessage("Cada lugar aquí tiene un pedacito de nuestra historia... ¡Feliz cumpleaños, mi amor! 💞", 7);
    }, 900);
  }, 800);
});

function iniciarMapa() {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    center: [-3.7038, 40.4168],
    zoom: 2
  });

  window.mapInstance = map;

  fetch('lugares.json')
    .then(res => res.json())
    .then(lugares => {
      lugares.forEach(lugar => {
        const el = document.createElement('div');

        // 🩷 Marcador especial (corazón)
        if (lugar.corazon) {
          el.className = 'heart-marker';
          const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
    <path fill='#ff4d6d' d='M12 21s-7.5-4.9-10-8.1C-1 8.6 3.6 4 7.8 6.1 10 7.4 12 9.3 12 9.3s2-1.9 4.2-3.2C20.4 4 25 8.6 22 12.9 19.5 16.1 12 21 12 21z'/>
  </svg>
`;
el.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(svg)}")`;

          el.style.width = '40px';
          el.style.height = '40px';
          el.style.backgroundSize = 'contain';
        } 
        // 📍 Marcadores normales
        else {
          el.className = 'marker';
          el.style.backgroundImage = lugar.tipo === 'visitado' 
            ? "url('https://cdn-icons-png.flaticon.com/512/684/684908.png')" 
            : "url('https://cdn-icons-png.flaticon.com/512/854/854866.png')";
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.backgroundSize = 'cover';
        }

        // --- Popup ---
        let popupContent = `
          <h3>${lugar.nombre}</h3>
          <p>${lugar.mensaje}</p>
        `;

        if (lugar.fotos && lugar.fotos.length > 1) {
          popupContent += `
            <div class="popup-slider">
              <button class="prev">⟨</button>
              <div class="slides">
                ${lugar.fotos.map((f, i) => `
                  <img src="${f}" class="slide ${i === 0 ? 'active' : ''}" />
                `).join('')}
              </div>
              <button class="next">⟩</button>
            </div>
          `;
        } else if (lugar.foto) {
          popupContent += `
            <img src="${lugar.foto}" alt="${lugar.nombre}" 
                 style="width:100%; border-radius:8px;" />
          `;
        }

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(popupContent)
          .on("open", () => {
            const slider = document.querySelector('.popup-slider');
            if (!slider) return;

            let current = 0;
            const slides = slider.querySelectorAll('.slide');
            const prev = slider.querySelector('.prev');
            const next = slider.querySelector('.next');

            function showSlide(i) {
              slides.forEach(s => s.classList.remove('active'));
              slides[i].classList.add('active');
            }

            if (prev) {
              prev.addEventListener('click', () => {
                current = (current - 1 + slides.length) % slides.length;
                showSlide(current);
              });
            }

            if (next) {
              next.addEventListener('click', () => {
                current = (current + 1) % slides.length;
                showSlide(current);
              });
            }
          });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lugar.lng, lugar.lat])
          .setPopup(popup)
          .addTo(map);

        // 👇 Centrar automáticamente al tocar el marcador
        marker.getElement().addEventListener('click', () => {
          map.flyTo({
            center: [lugar.lng, lugar.lat],
            zoom: 12,
            speed: 0.8
          });
        });
      });
    })
    .catch(err => console.error('Error cargando lugares:', err));
}