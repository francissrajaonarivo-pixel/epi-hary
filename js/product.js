// --- Récupération du produit depuis l'URL (?id=) ---
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));
const product = getProductById(productId);

const detailEl = document.getElementById("productDetail");
const relatedGrid = document.getElementById("relatedGrid");

if (!product) {
  detailEl.innerHTML = `
    <div class="product-not-found">
      <h2>Produit introuvable</h2>
      <p>Ce produit n'existe pas ou plus.</p>
      <a href="index.html" class="btn btn-primary">Retour aux produits</a>
    </div>`;
} else {
  document.title = `${product.name} — EPI-HARY`;
  document.getElementById("breadcrumbName").textContent = product.name;

  detailEl.innerHTML = `
    <div class="product-image">${product.emoji}</div>
    <div class="product-info">
      <span class="product-category-tag">${CATEGORY_LABELS[product.category] || ""}</span>
      <h1>${product.name}</h1>
      <div class="product-detail-price">${euros(product.price)}</div>

      <div class="qty-selector">
        <span>Quantité</span>
        <div class="qty-controls">
          <button id="qtyDec">−</button>
          <span id="qtyValue">1</span>
          <button id="qtyInc">+</button>
        </div>
      </div>

      <button class="btn btn-primary btn-full" id="detailAddBtn">Ajouter au panier</button>

      <div class="product-tabs">
        <div class="product-tab-title">Description</div>
        <p class="product-tab-content">${product.longDesc}</p>
      </div>
    </div>
  `;

  let qty = 1;
  const qtyValueEl = document.getElementById("qtyValue");

  document.getElementById("qtyInc").addEventListener("click", () => {
    qty += 1;
    qtyValueEl.textContent = qty;
  });

  document.getElementById("qtyDec").addEventListener("click", () => {
    if (qty > 1) qty -= 1;
    qtyValueEl.textContent = qty;
  });

  document.getElementById("detailAddBtn").addEventListener("click", () => {
    addToCart(product.id, qty);
    openCart();
  });

  // --- Produits similaires (même catégorie) ---
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  relatedGrid.innerHTML = related
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

  relatedGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-btn")) {
      addToCart(Number(e.target.dataset.id));
    }
  });
}
