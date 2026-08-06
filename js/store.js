// --- Données produits (partagées entre les pages) ---
// Catalogue vide en attente des vrais produits/photos EPI-HARY.
// Pour ajouter un produit : { id, name, desc, longDesc, price, emoji (ou image), category }
const PRODUCTS = [];

const CATEGORY_LABELS = {
  "fruits-legumes": "Fruits & Légumes",
  laitier: "Produits laitiers",
  boulangerie: "Boulangerie",
  epicerie: "Épicerie",
  boissons: "Boissons",
};

const euros = (n) => n.toFixed(2).replace(".", ",") + " €";

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === Number(id));
}

// --- État du panier (persisté en localStorage) ---
let cart = JSON.parse(localStorage.getItem("epifrais_cart") || "{}");

function saveCart() {
  localStorage.setItem("epifrais_cart", JSON.stringify(cart));
}

function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const newQty = (cart[id] || 0) + delta;
  if (newQty <= 0) {
    delete cart[id];
  } else {
    cart[id] = newQty;
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function cartCount() {
  return Object.values(cart).reduce((sum, q) => sum + q, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = getProductById(id);
    return sum + (product ? product.price * qty : 0);
  }, 0);
}

// --- Rendu panier (éléments communs à toutes les pages) ---
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");

function renderCart() {
  cartCountEl.textContent = cartCount();
  cartTotalEl.textContent = euros(cartTotal());

  const entries = Object.entries(cart);
  if (entries.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide.</p>';
    return;
  }

  cartItemsEl.innerHTML = entries
    .map(([id, qty]) => {
      const p = getProductById(id);
      if (!p) return "";
      return `
      <div class="cart-item">
        <div class="cart-item-emoji">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${euros(p.price)} x ${qty}</div>
        </div>
        <div class="qty-controls">
          <button data-action="dec" data-id="${p.id}">−</button>
          <span>${qty}</span>
          <button data-action="inc" data-id="${p.id}">+</button>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${p.id}">✕</button>
      </div>`;
    })
    .join("");
}

cartItemsEl.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const id = Number(e.target.dataset.id);
  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

// --- Ouverture / fermeture du panier ---
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCartDrawer);
cartOverlay.addEventListener("click", closeCartDrawer);

// --- Commande (démo) ---
const modalOverlay = document.getElementById("modalOverlay");

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cartCount() === 0) return;
  cart = {};
  saveCart();
  renderCart();
  closeCartDrawer();
  modalOverlay.classList.add("open");
});

document.getElementById("closeModal").addEventListener("click", () => {
  modalOverlay.classList.remove("open");
});

renderCart();
