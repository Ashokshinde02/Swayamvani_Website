const ordersModal = document.getElementById("ordersModal");
const ordersList = document.getElementById("ordersList");
const ordersEmpty = document.getElementById("ordersEmpty");
const closeOrdersModal = document.getElementById("closeOrdersModal");
const customerOrdersBtn = document.getElementById("customerOrdersBtn");

let ordersCache = [];

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

async function loadOrders() {
  if (!ordersModal || !customerOrdersBtn || customerOrdersBtn.hidden) return;
  if (ordersEmpty) ordersEmpty.textContent = "Loading your orders...";
  try {
    const response = await fetch(requireBackendPath("/api/customer/orders"), { credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not load orders");
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
    ordersEmpty.textContent = "No orders yet.";
    return;
  }
  ordersEmpty.textContent = "";
  orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    const created = order.created_at ? new Date(order.created_at) : null;
    const dateText = created && !Number.isNaN(created.valueOf()) ? created.toLocaleDateString("en-IN") : "Pending date";
    const itemsText = (order.items || [])
      .map((it) => `${it.name} (${formatINR(it.price)})`)
      .join(" · ");
    card.innerHTML = `
      <div class="order-card-head">
        <div>
          <p class="order-id">Order #${order.id || "new"}</p>
          <p class="order-date">${dateText}</p>
        </div>
        <span class="order-status">${order.status || "pending"}</span>
      </div>
      <p class="order-items">${itemsText}</p>
      <p class="order-total">Total: ${formatINR(order.total || 0)}</p>
      ${order.payment_ref ? `<p class="order-ref">Payment Ref: ${order.payment_ref}</p>` : ""}
    `;
    ordersList.appendChild(card);
  });
}

function openOrdersModal() {
  if (!ordersModal) return;
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

window.onOrderCreated = function () {
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
