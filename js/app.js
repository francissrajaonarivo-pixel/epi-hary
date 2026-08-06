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
        <span class="product-price">${euros(p.price)}</span>
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

// --- Animation "vidéo" de zoom sur la carte de localisation ---
const mapFrame = document.getElementById("mapFrame");

if (mapFrame) {
  const MAP_LAT = -15.7084879;
  const MAP_LNG = 46.3122439;
  const ZOOM_STEPS = [3, 6, 9, 12, 15, 17];

  function playMapZoom() {
    let i = 0;
    const step = () => {
      mapFrame.style.opacity = "0.4";
      mapFrame.src = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=${ZOOM_STEPS[i]}&output=embed`;
      i += 1;
      if (i < ZOOM_STEPS.length) {
        setTimeout(step, 700);
      }
    };
    step();
  }

  mapFrame.addEventListener("load", () => {
    mapFrame.style.opacity = "1";
  });

  const mapObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playMapZoom();
          mapObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  mapObserver.observe(mapFrame.closest(".contact-map"));
}

// --- Initialisation ---
renderProducts();
