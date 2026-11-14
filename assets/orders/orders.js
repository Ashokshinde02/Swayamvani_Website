const ordersModal = document.getElementById("ordersModal");
const ordersList = document.getElementById("ordersList");
const ordersEmpty = document.getElementById("ordersEmpty");
const closeOrdersModal = document.getElementById("closeOrdersModal");
const customerOrdersBtn = document.getElementById("customerOrdersBtn");
const cartOrderReference = document.getElementById("cartOrderReference");

let ordersCache = [];

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function escapeOrderHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function loadOrders() {
  if (!ordersModal) return;
  if (ordersEmpty) ordersEmpty.textContent = "Loading your orders...";
  try {
    const response = await fetch(requireBackendPath("/api/customer/orders"), { credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok) {
      // If backend still returns 401, surface a neutral message instead of stuck login text
      const msg = response.status === 401 ? "No Record Found." : data.error || "Could not load orders";
      ordersCache = [];
      renderOrders([]);
      if (ordersEmpty) ordersEmpty.textContent = msg;
      return;
    }
    ordersCache = data.orders || [];
    renderOrders(ordersCache);
  } catch (err) {
    if (ordersEmpty) ordersEmpty.textContent = err.message || "Could not load orders";
  }
}

function renderOrders(orders) {
  if (!ordersList || !ordersEmpty) return;
  ordersList.innerHTML = "";
  if (!orders || orders.length === 0) {
    ordersEmpty.textContent = "No Record Found.";
    return;
  }
  ordersEmpty.textContent = "";
  orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    const created = order.created_at ? new Date(order.created_at) : null;
    const dateText = created && !Number.isNaN(created.valueOf()) ? created.toLocaleDateString("en-IN") : "Pending date";
    const orderNumber = Number(order.order_number) || order.id;
    const itemsHTML = (order.items || []).map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const image = escapeOrderHTML(item.image || "assets/images/harmonium.svg");
      return `
        <div class="order-item-row">
          <img class="order-item-image" src="${image}" alt="${escapeOrderHTML(item.name)}" loading="lazy">
          <div class="order-item-info">
            <strong>${escapeOrderHTML(item.name || "Product")}</strong>
            <span>Quantity: ${quantity}</span>
            <span>Item total: ${formatINR(item.price || 0)}</span>
          </div>
        </div>`;
    }).join("");
    const addressHTML = escapeOrderHTML(order.address || "—").replace(/\n/g, "<br>");
    card.innerHTML = `
      <div class="order-card-head">
        <div>
          <p class="order-id">Order #${orderNumber || "new"}</p>
          <p class="order-date">${dateText}</p>
        </div>
        <span class="order-status">${escapeOrderHTML(order.status || "pending")}</span>
      </div>
      <div class="order-item-list">${itemsHTML}</div>
      <p class="order-shipping"><strong>Delivery mobile:</strong> ${escapeOrderHTML(order.mobile || "—")}</p>
      <p class="order-shipping"><strong>Shipping address:</strong><br>${addressHTML}</p>
      ${order.payment_ref ? `<p class="order-ref">Payment reference: ${escapeOrderHTML(order.payment_ref)}</p>` : ""}
      <p class="order-total">Total: ${formatINR(order.total || 0)}</p>
    `;
    card.setAttribute("aria-label", `Order reference ${orderNumber}. View its product in the Harmonium Collection.`);
    const openOrderProduct = () => {
      const firstItem = (order.items || [])[0];
      if (!firstItem) {
        alert("This order has no product details to open.");
        return;
      }
      closeOrders();
      const result = window.openOrderProductInCollection?.(firstItem);
      if (!result?.ok) {
        alert(result?.message || "Could not find this product in the Harmonium Collection.");
      }
    };
    card.addEventListener("click", openOrderProduct);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openOrderProduct();
      }
    });
    card.querySelectorAll(".order-item-image").forEach((image) => {
      image.addEventListener("error", () => {
        image.src = "assets/images/harmonium.svg";
      }, { once: true });
    });
    ordersList.appendChild(card);
  });
}

function openOrdersModal() {
  if (!ordersModal) return;
  if (typeof closeCartPanel === "function") {
    closeCartPanel();
  }
  ordersModal.classList.add("open");
  ordersModal.setAttribute("aria-hidden", "false");
  loadOrders();
}

function closeOrders() {
  if (!ordersModal) return;
  ordersModal.classList.remove("open");
  ordersModal.setAttribute("aria-hidden", "true");
}

if (closeOrdersModal) {
  closeOrdersModal.addEventListener("click", closeOrders);
}
if (customerOrdersBtn) {
  customerOrdersBtn.addEventListener("click", openOrdersModal);
}

if (ordersModal) {
  ordersModal.addEventListener("click", (event) => {
    if (event.target === ordersModal) {
      closeOrders();
    }
  });
}

window.onOrderCreated = function (order) {
  const orderNumber = Number(order?.order_number) || order?.id;
  if (cartOrderReference && orderNumber) {
    cartOrderReference.textContent = `Order reference: #${orderNumber}`;
    cartOrderReference.hidden = false;
  }
  if (ordersModal?.classList.contains("open")) {
    loadOrders();
  }
};

if (window.subscribeCustomerState) {
  window.subscribeCustomerState((customer) => {
    if (!customerOrdersBtn) return;
    customerOrdersBtn.hidden = !customer;
    if (!customer) {
      ordersCache = [];
      if (ordersEmpty) ordersEmpty.textContent = "Login to see your past orders.";
      if (ordersList) ordersList.innerHTML = "";
      closeOrders();
    }
  });
}
