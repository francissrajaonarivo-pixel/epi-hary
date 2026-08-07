// --- Rendu de la grille produits (page d'accueil) ---
const productsGrid = document.getElementById("productsGrid");
const categoryFiltersEl = document.getElementById("categoryFilters");

if (PRODUCTS.length === 0) {
  categoryFiltersEl.style.display = "none";
}

function renderProducts(category = "all") {
  const filtered = category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div class="products-empty">
        <div class="products-empty-icon">🧺</div>
        <h3>Notre catalogue arrive très bientôt</h3>
        <p>Nous préparons actuellement nos produits frais. Revenez très prochainement pour découvrir notre sélection !</p>
      </div>`;
    return;
  }

  productsGrid.innerHTML = filtered
    .map(
      (p) => `
    <div class="product-card">
      <a href="product.html?id=${p.id}" class="product-link">
        <div class="product-emoji">${p.emoji}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
      </a>
      <div class="product-footer">
        <span class="product-price">${formatPrice(p.price)}</span>
        <button class="add-btn" data-id="${p.id}">Ajouter</button>
      </div>
    </div>`
    )
    .join("");
}

productsGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-btn")) {
    addToCart(Number(e.target.dataset.id));
  }
});

// --- Filtres catégorie ---
document.getElementById("categoryFilters").addEventListener("click", (e) => {
  if (!e.target.classList.contains("filter-btn")) return;
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");
  renderProducts(e.target.dataset.category);
});

// --- Formulaire de contact (redirection WhatsApp) ---
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = e.target.querySelector('input[type="text"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  const message = e.target.querySelector("textarea").value;

  const text = `Bonjour EPI-HARY,\n\nNom : ${name}\nEmail : ${email}\nMessage : ${message}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  window.open(url, "_blank");
  e.target.reset();
});

// --- Carte Google Maps : vol animé depuis Madagascar entier jusqu'à EPI-HARY ---
const mapFrame = document.getElementById("mapFrame");

if (mapFrame) {
  const SHOP_LAT = -15.7084879;
  const SHOP_LNG = 46.3122439;
  // zoom 5 (et non 6) pour que le nord ET le sud de Madagascar restent visibles
  const MAP_START = { lat: -18.8, lng: 46.85, zoom: 5 }; // vue de Madagascar entier
  // position approximative d'EPI-HARY dans le cadre ci-dessus (doit correspondre à .wide-marker en CSS)
  const WIDE_MARKER_ORIGIN = "47.7% 27.6%";
  const HOLD_MS = 900; // temps d'affichage de Madagascar avant la plongée
  const DIVE_MS = 900; // durée de l'accélération (flou + zoom avant)
  const SETTLE_MS = 900; // durée de la stabilisation sur EPI-HARY

  let currentLat = MAP_START.lat;
  let currentLng = MAP_START.lng;
  let currentZoom = MAP_START.zoom;
  let currentView = "k"; // k = satellite, m = plan

  const wideMarker = document.getElementById("wideMarker");

  function buildMapUrl(lat, lng, zoom, view) {
    const typeParam = view === "k" ? "&t=k" : "";
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}&z=${zoom}${typeParam}&output=embed`;
  }

  function updateMap() {
    mapFrame.style.opacity = "0.85";
    mapFrame.src = buildMapUrl(currentLat, currentLng, Math.round(currentZoom), currentView);
  }

  mapFrame.addEventListener("load", () => {
    mapFrame.style.opacity = "1";
  });

  // Une seule vraie transition : Madagascar entier -> EPI-HARY.
  // Entre les deux, un effet de "plongée" (zoom + flou de mouvement en CSS)
  // simule le déplacement au lieu d'un simple changement de photo.
  function playMapFlight() {
    currentLat = MAP_START.lat;
    currentLng = MAP_START.lng;
    currentZoom = MAP_START.zoom;
    mapFrame.src = buildMapUrl(currentLat, currentLng, currentZoom, currentView);

    let started = false;
    const startDive = () => {
      if (started) return;
      started = true;
      mapFrame.removeEventListener("load", startDive);
      setTimeout(diveToShop, HOLD_MS);
    };
    mapFrame.addEventListener("load", startDive);
    setTimeout(startDive, 3000); // filet de sécurité si le chargement traîne

    function diveToShop() {
      // La plongée converge exactement sur le repère 📍 EPI-HARY affiché sur la vue large
      mapFrame.style.transformOrigin = WIDE_MARKER_ORIGIN;
      if (wideMarker) wideMarker.style.opacity = "0";

      // Phase 1 : accélération vers l'écran (zoom avant + flou de mouvement)
      mapFrame.style.transition = `transform ${DIVE_MS}ms cubic-bezier(0.55,0,1,0.45), filter ${DIVE_MS}ms ease`;
      mapFrame.style.transform = "scale(2.6)";
      mapFrame.style.filter = "blur(16px)";

      setTimeout(() => {
        // Phase 2 : on bascule sur EPI-HARY pendant que l'image est floutée/réduite
        mapFrame.style.transition = "none";
        mapFrame.style.transform = "scale(0.4)";
        mapFrame.style.filter = "blur(16px)";
        currentLat = SHOP_LAT;
        currentLng = SHOP_LNG;
        currentZoom = 18;
        mapFrame.src = buildMapUrl(currentLat, currentLng, currentZoom, currentView);

        void mapFrame.offsetWidth; // force le navigateur à appliquer le snap avant la transition suivante

        requestAnimationFrame(() => {
          // Phase 3 : la vue se stabilise et devient nette sur la boutique
          mapFrame.style.transition = `transform ${SETTLE_MS}ms cubic-bezier(0,0.55,0.45,1), filter ${SETTLE_MS}ms ease`;
          mapFrame.style.transform = "scale(1)";
          mapFrame.style.filter = "blur(0px)";

          setTimeout(() => {
            mapFrame.style.transition = "";
            mapFrame.style.transform = "";
            mapFrame.style.filter = "";
            mapFrame.style.transformOrigin = "";
          }, SETTLE_MS + 100);
        });
      }, DIVE_MS);
    }
  }

  const mapObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playMapFlight();
          mapObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  mapObserver.observe(mapFrame.closest(".contact-map"));

  // --- Contrôle de zoom manuel (+ / −) ---
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");

  zoomInBtn.addEventListener("click", () => {
    currentZoom = Math.min(currentZoom + 1, 20);
    updateMap();
  });

  zoomOutBtn.addEventListener("click", () => {
    currentZoom = Math.max(currentZoom - 1, 2);
    updateMap();
  });

  // --- Bascule Plan / Satellite ---
  const satelliteBtn = document.getElementById("satelliteBtn");
  satelliteBtn.addEventListener("click", () => {
    currentView = currentView === "k" ? "m" : "k";
    satelliteBtn.textContent = currentView === "k" ? "🗺️ Vue Plan" : "🛰️ Satellite";
    satelliteBtn.classList.toggle("active", currentView === "k");
    updateMap();
  });

  // --- Bascule vue 3D (inclinaison stylisée) ---
  const tilt3dBtn = document.getElementById("tilt3dBtn");
  let is3D = false;

  tilt3dBtn.addEventListener("click", () => {
    is3D = !is3D;
    mapFrame.classList.toggle("tilt-3d", is3D);
    mapFrame.closest(".contact-map").classList.toggle("is-tilted", is3D);
    tilt3dBtn.classList.toggle("active", is3D);
    tilt3dBtn.textContent = is3D ? "🧊 Vue à plat" : "🧊 Vue 3D";
  });
}

// --- Initialisation ---
renderProducts();
