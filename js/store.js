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

// --- Coordonnées & conditions de vente EPI-HARY ---
const WHATSAPP_NUMBER = "261389510134"; // 03 89 51 01 34 (Madagascar, +261)

const PAYMENT_METHODS = [
  { name: "Mvola", number: "038 95 101 34", holder: "Rajaonarivo Harinaivo Jean Francis" },
  { name: "Orange Money", number: "032 90 426 87", holder: "Rajaonarivo Harinaivo Jean Francis" },
];

const DELIVERY_FEE = 3000; // Ariary
const DELIVERY_LABEL = "Livraison le jour même — 3 000 Ar";

const HAS_ORDERED_KEY = "epifrais_has_ordered";
function isFirstOrder() {
  return !localStorage.getItem(HAS_ORDERED_KEY);
}
function markOrdered() {
  localStorage.setItem(HAS_ORDERED_KEY, "1");
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

// --- Commande (envoi WhatsApp + instructions de paiement) ---
const modalOverlay = document.getElementById("modalOverlay");
const modalBody = document.getElementById("modalBody");

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cartCount() === 0) return;

  const freeDelivery = isFirstOrder();
  const deliveryFee = freeDelivery ? 0 : DELIVERY_FEE;
  const productsTotal = cartTotal();
  const grandTotal = productsTotal + deliveryFee;

  const orderLines = Object.entries(cart)
    .map(([id, qty]) => {
      const p = getProductById(id);
      return p ? `- ${p.name} x${qty} — ${euros(p.price * qty)}` : "";
    })
    .filter(Boolean)
    .join("\n");

  const text =
    `Bonjour EPI-HARY, je souhaite commander :\n\n${orderLines}\n\n` +
    `Sous-total : ${euros(productsTotal)}\n` +
    `Livraison : ${freeDelivery ? "Offerte (1ère commande)" : euros(deliveryFee)}\n` +
    `Total : ${euros(grandTotal)}\n\n` +
    `Merci de me confirmer la commande.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");

  const paymentList = PAYMENT_METHODS.map((m) => `<li><strong>${m.name}</strong> : ${m.number} (${m.holder})</li>`).join("");
  modalBody.innerHTML = `
    <p>Votre commande a été préparée et envoyée sur WhatsApp. Confirmez l'envoi dans l'application, puis réglez par :</p>
    <ul class="payment-list">${paymentList}</ul>
    <p>${freeDelivery ? "🎉 Livraison offerte pour votre première commande !" : DELIVERY_LABEL}</p>
  `;

  markOrdered();
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
