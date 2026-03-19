const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const productForm = document.getElementById("productForm");
const videoForm = document.getElementById("videoForm");
const adminStatus = document.getElementById("adminStatus");
const productsEl = document.getElementById("adminProducts");
const videosEl = document.getElementById("adminVideos");
const inquiriesEl = document.getElementById("adminInquiries");
const customersEl = document.getElementById("adminCustomers");
const refreshInquiriesBtn = document.getElementById("refreshInquiriesBtn");
const refreshCustomersBtn = document.getElementById("refreshCustomersBtn");
const editOffersBtn = document.getElementById("editOffersBtn");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");
const OfferService = window.OfferService;
const adminHeaderActions = document.querySelector(".admin-header-actions");
const hasBackend = window.location.protocol === "http:" || window.location.protocol === "https:";
const adminModalOverlay = document.getElementById("adminModalOverlay");
const adminModal = document.getElementById("adminModal");
const adminModalTitle = document.getElementById("adminModalTitle");
const adminModalBody = document.getElementById("adminModalBody");
const adminModalClose = document.getElementById("adminModalClose");

let latestOrders = [];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildInquiryCardsHtml(inquiries = []) {
  if (!inquiries.length) {
    return "<p>No inquiries yet.</p>";
  }
  return inquiries
    .map((i) => {
      const createdAt = i.created_at ? new Date(i.created_at).toLocaleString() : "—";
      return `
        <div class="cart-item">
          <strong>${escapeHtml(i.name)} (${escapeHtml(i.email)})</strong>
          <p>${createdAt}</p>
          <p>${escapeHtml(i.message)}</p>
        </div>
      `;
    })
    .join("");
}

function buildCustomerCardsHtml(customers = []) {
  if (!customers.length) {
    return "<p>No customers yet.</p>";
  }
  return customers
    .map((customer) => {
      const createdAt = customer.created_at
        ? new Date(customer.created_at).toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        : "—";
      return `
        <div class="customer-card">
          <strong>${escapeHtml(customer.name)}</strong>
          <p>${escapeHtml(customer.email)}</p>
          <p>Joined ${createdAt}</p>
        </div>
      `;
    })
    .join("");
}

function createOffersFormHtml(current = {}, list = [], errorMessage = "") {
  const errorBlock = errorMessage
    ? `<p class="form-status" aria-live="assertive">${escapeHtml(errorMessage)}</p>`
    : "";
  return `
    <div class="admin-modal-scroll">
    ${errorBlock}
    <form id="adminOffersForm" class="admin-modal-form">
      <label>
        Existing offers
        <select id="offerSelect"></select>
      </label>
      <label>
        Offer type
        <select name="offerType" id="offerTypeSelect">
          <option value="discount" ${current.offerType === "lessons" || current.offerType === "coupon" ? "" : "selected"}>Discount</option>
          <option value="lessons" ${current.offerType === "lessons" ? "selected" : ""}>Free lessons</option>
          <option value="coupon" ${current.offerType === "coupon" ? "selected" : ""}>Coupon code</option>
        </select>
      </label>
      <label>
        Heading
        <input name="title" type="text" maxlength="120" required value="${escapeHtml(current.title || "")}" />
      </label>
      <label>
        Description
        <textarea name="desc" rows="3" required>${escapeHtml(current.desc || "")}</textarea>
      </label>
      <label data-offer-section="discount">
        Discount title
        <input name="discountTitle" type="text" maxlength="120" required value="${escapeHtml(current.discountTitle || "")}" />
      </label>
      <label data-offer-section="discount">
        Discount description
        <textarea name="discountDesc" rows="3" required>${escapeHtml(current.discountDesc || "")}</textarea>
      </label>
      <fieldset class="coupon-fieldset" data-offer-section="coupon">
        <legend>Coupon (optional)</legend>
        <div class="form-grid-2">
          <label>
            Code
            <input name="couponCode" type="text" maxlength="40" placeholder="e.g. RIYAAZ10" value="${escapeHtml(
              current.couponCode || ""
            )}" />
          </label>
          <label>
            % off
            <input name="couponPercent" type="number" min="1" max="90" step="1" value="${escapeHtml(
              current.couponPercent ?? ""
            )}" />
          </label>
        </div>
        <p class="form-hint">Shown in cart; leave blank to disable coupon.</p>
        <label class="toggle-line">
          <input name="couponEnabled" type="checkbox" ${current.couponEnabled === false ? "" : "checked"} />
          <span>Enable coupon for customers</span>
        </label>
      </fieldset>
      <label data-offer-section="lessons">
        Lessons title
        <input name="lessonsTitle" type="text" maxlength="120" required value="${escapeHtml(current.lessonsTitle || "")}" />
      </label>
      <label data-offer-section="lessons">
        Lessons description
        <textarea name="lessonsDesc" rows="3" required>${escapeHtml(current.lessonsDesc || "")}</textarea>
      </label>
      <div class="admin-modal-actions">
        <button type="button" id="removeOfferBtn" class="video-delete">Remove</button>
        <button type="button" id="activateOfferBtn" class="filter-btn">Set Active</button>
        <button type="submit">Save</button>
        <button type="button" class="filter-btn" data-modal-close>Cancel</button>
      </div>
    </form>
    </div>
  `;
}

function bindOffersForm(form) {
  if (!form) return;
  const offerSelect = form.querySelector("#offerSelect");
  let currentOffers = [];
  let currentActiveId = null;

  const offerTypeSelect = form.querySelector("#offerTypeSelect");
  const sections = form.querySelectorAll("[data-offer-section]");
  const toggleSections = () => {
    const selected = offerTypeSelect?.value || "discount";
    sections.forEach((section) => {
      section.style.display = section.dataset.offerSection === selected ? "block" : "none";
    });
    // Toggle required fields based on visible section (remove attribute when hidden to avoid validity errors)
    const setRequired = (name, isRequired) => {
      const el = form.elements[name];
      if (!el) return;
      el.required = isRequired;
      if (isRequired) {
        el.setAttribute("required", "required");
      } else {
        el.removeAttribute("required");
      }
    };
    setRequired("discountTitle", selected === "discount");
    setRequired("discountDesc", selected === "discount");
    setRequired("lessonsTitle", selected === "lessons");
    setRequired("lessonsDesc", selected === "lessons");
    setRequired("couponCode", selected === "coupon");
    setRequired("couponPercent", selected === "coupon");
  };
  offerTypeSelect?.addEventListener("change", toggleSections);
  toggleSections();

  const fillForm = (offer = {}) => {
    form.elements.offerType.value = offer.offerType || "discount";
    form.elements.title.value = offer.title || "";
    form.elements.desc.value = offer.desc || "";
    form.elements.discountTitle.value = offer.discountTitle || "";
    form.elements.discountDesc.value = offer.discountDesc || "";
    form.elements.lessonsTitle.value = offer.lessonsTitle || "";
    form.elements.lessonsDesc.value = offer.lessonsDesc || "";
    form.elements.couponCode.value = offer.couponCode || "";
    form.elements.couponPercent.value = offer.couponPercent || "";
    if (form.elements.couponEnabled) {
      form.elements.couponEnabled.checked = offer.couponEnabled !== false;
    }
    toggleSections();
  };

  const loadOffers = async () => {
    let data = { offers: {}, list: [] };
    try {
      const resp = await OfferService.list();
      if (resp && typeof resp === "object") {
        data = resp;
      }
    } catch (err) {
      if (adminStatus) adminStatus.textContent = err.message || "Failed to load offers (are you logged in?).";
    }
    currentOffers = Array.isArray(data.list) ? data.list : [];
    const active = data.offers || {};
    currentActiveId = (currentOffers.find((o) => o.active) || {}).id || null;
    OfferService.populateSelect(offerSelect, currentOffers);
    if (offerSelect && currentActiveId) {
      offerSelect.value = String(currentActiveId);
    }
    fillForm(active);
    if (!currentOffers.length && adminStatus) {
      adminStatus.textContent = "No offers found or not logged in.";
    }
  };

  offerSelect?.addEventListener("change", () => {
    const val = offerSelect.value;
    if (val === "new") {
      fillForm({});
      return;
    }
    const selected = currentOffers.find((o) => String(o.id) === val);
    if (selected) {
      fillForm(selected.config || {});
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selectedId = offerSelect?.value === "new" ? 0 : Number(offerSelect?.value || 0);
    const payload = {
      offerType: form.elements.offerType?.value || "discount",
      title: (form.elements.title?.value || "").trim(),
      desc: (form.elements.desc?.value || "").trim(),
      discountTitle: (form.elements.discountTitle?.value || "").trim(),
      discountDesc: (form.elements.discountDesc?.value || "").trim(),
      lessonsTitle: (form.elements.lessonsTitle?.value || "").trim(),
      lessonsDesc: (form.elements.lessonsDesc?.value || "").trim(),
      couponCode: (form.elements.couponCode?.value || "").trim(),
      couponPercent: Number(form.elements.couponPercent?.value || 0),
      couponEnabled: form.elements.couponEnabled ? form.elements.couponEnabled.checked : true
    };
    try {
      await OfferService.save(selectedId, payload);
      if (adminStatus) adminStatus.textContent = "Offer saved.";
      await loadOffers();
    } catch (submitError) {
      if (adminStatus) adminStatus.textContent = submitError.message || "Failed to save offer.";
      const alert = document.createElement("p");
      alert.className = "form-status";
      alert.textContent = submitError.message || "Failed to save offer.";
      form.prepend(alert);
    }
  });

  form.querySelector("[data-modal-close]")?.addEventListener("click", closeAdminModal);

  const removeBtn = form.querySelector("#removeOfferBtn");
  removeBtn?.addEventListener("click", async () => {
    const val = offerSelect?.value;
    if (!val || val === "new") {
      if (adminStatus) adminStatus.textContent = "Select an offer to remove.";
      return;
    }
    try {
      await OfferService.remove(Number(val));
      if (adminStatus) adminStatus.textContent = "Offer removed.";
      await loadOffers();
      fillForm({});
    } catch (err) {
      if (adminStatus) adminStatus.textContent = err.message || "Failed to remove offer.";
    }
  });

  const activateBtn = form.querySelector("#activateOfferBtn");
  activateBtn?.addEventListener("click", async () => {
    const val = offerSelect?.value;
    if (!val || val === "new") {
      if (adminStatus) adminStatus.textContent = "Select an offer to activate.";
      return;
    }
    try {
      await OfferService.activate(Number(val));
      if (adminStatus) adminStatus.textContent = "Offer activated.";
      await loadOffers();
    } catch (err) {
      if (adminStatus) adminStatus.textContent = err.message || "Failed to activate offer.";
    }
  });

  loadOffers();
}

function openAdminModal(title, content) {
  if (!adminModalOverlay || !adminModalTitle || !adminModalBody) return;
  adminModalTitle.textContent = title;
  adminModalBody.innerHTML = content;
  adminModalOverlay.hidden = false;
  adminModalOverlay.classList.add("is-visible");
  document.body?.classList.add("modal-open");
  const focusable =
    adminModalBody.querySelector("input, textarea, button, select, [tabindex]:not([tabindex='-1'])");
  focusable?.focus();
}

function closeAdminModal() {
  if (!adminModalOverlay) return;
  adminModalOverlay.hidden = true;
  adminModalOverlay.classList.remove("is-visible");
  if (adminModalBody) {
    adminModalBody.innerHTML = "";
  }
  document.body?.classList.remove("modal-open");
}

function toggleLogoutButton(visible) {
  if (!logoutBtn) return;
  logoutBtn.classList.toggle("logout-hidden", !visible);
}

function toggleAdminHeaderActions(visible) {
  if (!adminHeaderActions) return;
  adminHeaderActions.classList.toggle("is-visible", visible);
  adminHeaderActions.setAttribute("aria-hidden", visible ? "false" : "true");
}

async function api(path, options = {}) {
  if (!hasBackend) {
    throw new Error("Backend API unavailable. Open admin via http://localhost:8080/admin");
  }
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function renderProducts(products) {
  if (!products.length) {
    productsEl.innerHTML = "<p>No products found.</p>";
    return;
  }

  productsEl.innerHTML = products
    .map(
      (p) => `
      <div class="cart-item">
        <strong>${p.name}</strong>
        <p>${p.category} | Rs ${new Intl.NumberFormat("en-IN").format(p.price)}</p>
        <p>${p.details}</p>
        <p>Photos: ${(p.images || []).length} | <a href="${p.video_url || "#"}" target="_blank" rel="noopener noreferrer">Video</a></p>
        <button data-edit="${p.id}" data-name="${encodeURIComponent(p.name)}" data-category="${encodeURIComponent(p.category)}" data-price="${p.price}" data-details="${encodeURIComponent(p.details)}" data-images="${encodeURIComponent(JSON.stringify(p.images || []))}" data-video="${encodeURIComponent(p.video_url || "")}">Edit</button>
        <button data-delete="${p.id}">Delete</button>
      </div>
    `
    )
    .join("");
}

function renderInquiries(inquiries) {
  if (!inquiriesEl) return;
  inquiriesEl.innerHTML = buildInquiryCardsHtml(inquiries);
}

function renderCustomers(customers) {
  if (!customersEl) return;
  customersEl.innerHTML = buildCustomerCardsHtml(customers);
}

function buildOrdersHtml(orders = []) {
  if (!orders.length) {
    return "<p>No orders found.</p>";
  }
  const fmtINR = (val) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);
  return `
    <div class="admin-modal-scroll">
      ${orders
        .map((o) => {
          const created = o.created_at ? new Date(o.created_at).toLocaleString("en-IN") : "—";
          const items = (o.items || [])
            .map((it) => `${escapeHtml(it.name)} (${fmtINR(it.price)})`)
            .join(" · ");
          return `
          <div class="cart-item order-admin-card">
            <div class="order-admin-head">
              <div>
                <strong>Order #${o.id}</strong>
                <p>${escapeHtml(o.customer_name || "")}</p>
                <p class="form-hint">${escapeHtml(o.customer_email || "")}</p>
                <p class="form-hint">${created}</p>
                <p class="form-hint">Mobile: ${escapeHtml(o.mobile || "—")}</p>
                <p class="form-hint">Address: ${escapeHtml(o.address || "—")}</p>
              </div>
              <label class="order-status-select">
                <span>Status</span>
                <select data-order-id="${o.id}">
                  ${["pending", "pending_payment", "confirmed", "shipped", "delivered", "cancelled"]
                    .map((status) => `<option value="${status}" ${o.status === status ? "selected" : ""}>${status}</option>`)
                    .join("")}
                </select>
              </label>
            </div>
            <p>${items}</p>
            <p><strong>Total:</strong> ${fmtINR(o.total || 0)}</p>
            <button type="button" class="filter-btn" data-invoice="${o.id}">Generate Invoice</button>
            ${o.payment_ref ? `<p class="form-hint">Payment Ref: ${escapeHtml(o.payment_ref)}</p>` : ""}
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

function renderInvoice(order) {
  const fmtINR = (val) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) {
    if (adminStatus) adminStatus.textContent = "Popup blocked. Allow popups to view invoice.";
    return;
  }
  const itemsRows = (order.items || [])
    .map(
      (it, idx) => `
        <tr>
          <td style="padding:6px 8px;border:1px solid #e0d6ca;">${idx + 1}</td>
          <td style="padding:6px 8px;border:1px solid #e0d6ca;">${escapeHtml(it.name)}</td>
          <td style="padding:6px 8px;border:1px solid #e0d6ca; text-align:right;">${fmtINR(it.price)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
  <html>
    <head>
      <title>Invoice #${order.id}</title>
      <style>
        :root {
          --accent: #c96a1b;
          --text: #2a1e16;
          --line: #e0d6ca;
          --bg: #fffaf3;
        }
        body { font-family: "Manrope", sans-serif; margin: 24px; color: var(--text); background: #fff; }
        h1 { margin: 0 0 6px; font-size: 1.4rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent); }
        .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .brand img { width: 52px; height: 52px; border-radius: 50%; border: 2px solid #d8c4a1; object-fit: cover; background: #000; }
        .brand .name { font-size: 1.2rem; font-weight: 800; color: var(--text); line-height: 1.2; }
        .brand .sub { font-size: 0.95rem; color: #5b3a2a; }
        .box { border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 12px; background: var(--bg); box-shadow: 0 8px 18px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { text-align: left; padding: 8px 10px; border:1px solid var(--line); background:#fff8ef; }
        td { font-size: 0.95rem; padding: 8px 10px; border:1px solid var(--line); }
        .totals { text-align: right; font-weight: 800; margin-top: 12px; color: var(--accent); }
        .meta { font-size: 0.95rem; line-height: 1.5; }
        .status { font-weight: 800; color: var(--accent); }
        .print-btn { margin-top: 14px; padding: 10px 16px; border-radius: 10px; background: var(--accent); color: #fff; border: none; cursor: pointer; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="brand">
        <img src="/logo.jpeg" alt="Swayamvani logo" onerror="this.style.display='none';">
        <div>
          <div class="name">Swayamvani</div>
          <div class="sub">Indian Classical Instruments</div>
          <div class="sub"><a href="https://www.swayamvani.com" target="_blank" rel="noopener noreferrer">www.swayamvani.com</a></div>
        </div>
      </div>
      <h1>Order Invoice</h1>
      <div class="box meta">
        <div><strong>Order #</strong> ${order.id}</div>
        <div><strong>Status:</strong> <span class="status">${order.status || "pending"}</span></div>
        <div><strong>Date:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : "—"}</div>
      </div>
      <div class="box meta">
        <div><strong>Customer:</strong> ${escapeHtml(order.customer_name || order.customer_email || "—")}</div>
        <div><strong>Email:</strong> ${escapeHtml(order.customer_email || "—")}</div>
        <div><strong>Mobile:</strong> ${escapeHtml(order.mobile || "—")}</div>
        <div><strong>Address:</strong> ${escapeHtml(order.address || "—")}</div>
      </div>
      <div class="box">
        <strong>Items</strong>
        <table>
          <thead>
            <tr>
              <th style="width:40px;">#</th>
              <th>Product</th>
              <th style="text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || `<tr><td colspan="3" style="padding:8px;">No items</td></tr>`}
          </tbody>
        </table>
        <div class="totals">Total: ${fmtINR(order.total || 0)}</div>
      </div>
      <button class="print-btn" onclick="window.print()">Print</button>
    </body>
  </html>
  `;
  win.document.write(html);
  win.document.close();
}

async function refreshInquiries() {
  try {
    const data = await api("/api/admin/inquiries");
    const inquiries = data.inquiries || [];
    renderInquiries(inquiries);
    if (adminStatus) adminStatus.textContent = "Inquiries refreshed.";
    return inquiries;
  } catch (error) {
    if (adminStatus) adminStatus.textContent = error.message || "Failed to refresh inquiries.";
    return [];
  }
}

async function refreshCustomers() {
  try {
    const data = await api("/api/admin/customers");
    const customers = data.customers || [];
    renderCustomers(customers);
    if (adminStatus) adminStatus.textContent = "Customer list refreshed.";
    return customers;
  } catch (error) {
    if (adminStatus) adminStatus.textContent = error.message || "Failed to refresh customers.";
    return [];
  }
}

async function openOffersModal() {
  openAdminModal("Edit Offers", "<p class=\"form-status\">Loading offers…</p>");
  try {
    const data = await OfferService.list();
    const offers = data.offers || {};
    const list = data.list || [];
    if (adminModalBody) {
      adminModalBody.innerHTML = createOffersFormHtml(offers, list);
      bindOffersForm(document.getElementById("adminOffersForm"));
    }
  } catch (error) {
    if (adminModalBody) {
      adminModalBody.innerHTML = createOffersFormHtml({}, [], error.message || "Could not load offers.");
      bindOffersForm(document.getElementById("adminOffersForm"));
    }
    if (adminStatus) adminStatus.textContent = error.message || "Failed to load offers.";
  }
}

async function openOrdersModal(status = "pending") {
  openAdminModal("Orders", "<p class=\"form-status\">Loading orders…</p>");
  try {
    const data = await api(`/api/admin/orders${status ? `?status=${encodeURIComponent(status)}` : ""}`);
    latestOrders = data.orders || [];
    if (adminModalBody) {
      adminModalBody.innerHTML = buildOrdersHtml(latestOrders);
    }
    if (adminStatus) adminStatus.textContent = `Loaded ${latestOrders.length} orders${status ? ` (${status})` : ""}.`;
  } catch (error) {
    if (adminModalBody) adminModalBody.innerHTML = `<p class="form-status">${escapeHtml(error.message || "Failed to load orders")}</p>`;
    if (adminStatus) adminStatus.textContent = error.message || "Failed to load orders.";
  }
}

function renderVideos(videos) {
  if (!videos.length) {
    videosEl.innerHTML = "<p>No videos yet.</p>";
    return;
  }

  videosEl.innerHTML = videos
    .map(
      (v) => `
      <div class="video-card">
        <video controls preload="metadata" playsinline>
          <source src="${v.url}" type="video/mp4" />
        </video>
        <div class="video-card-head">
          <p>${v.title}</p>
          <button class="video-delete" data-video-delete="${v.id}">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function loadAdminData() {
  const [productsData, videosData, inquiriesData, customersData] = await Promise.all([
    api("/api/admin/products"),
    api("/api/admin/videos"),
    api("/api/admin/inquiries"),
    api("/api/admin/customers")
  ]);
  renderProducts(productsData.products || []);
  renderVideos(videosData.videos || []);
  renderInquiries(inquiriesData.inquiries || []);
  renderCustomers(customersData.customers || []);
}

async function checkSession() {
  try {
    await api("/api/admin/me", { method: "GET" });
    loginSection.style.display = "none";
    adminSection.style.display = "block";
    adminStatus.textContent = "Logged in.";
    toggleLogoutButton(true);
    toggleAdminHeaderActions(true);
    await loadAdminData();
  } catch {
    loginSection.style.display = "block";
    adminSection.style.display = "none";
    toggleLogoutButton(false);
    toggleAdminHeaderActions(false);
  }
}

function togglePasswordById(targetId, button) {
  const input = document.getElementById(targetId);
  if (!input) return;
  const shouldShow = input.type === "password";
  input.type = shouldShow ? "text" : "password";
  if (button) {
    button.classList.toggle("is-visible", shouldShow);
    button.setAttribute("aria-pressed", String(shouldShow));
    button.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
  }
}
window.togglePasswordById = togglePasswordById;

function initPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.dataset.bound = "1";
    const targetId = button.getAttribute("data-target");
    if (!targetId) return;
    const input = document.getElementById(targetId);
    if (!input) return;

    button.addEventListener("click", () => {
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.classList.toggle("is-visible", shouldShow);
      button.setAttribute("aria-pressed", String(shouldShow));
      button.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    });
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminStatus.textContent = "";

  try {
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
      })
    });
    toggleLogoutButton(true);
    await checkSession();
  } catch (error) {
    toggleLogoutButton(false);
    adminStatus.textContent = error.message || "Login failed.";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", { method: "POST" });
  } finally {
    toggleLogoutButton(false);
    toggleAdminHeaderActions(false);
    loginSection.style.display = "block";
    adminSection.style.display = "none";
    adminStatus.textContent = "Logged out.";
  }
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("pName").value,
        category: document.getElementById("pCategory").value,
        price: Number(document.getElementById("pPrice").value),
        details: document.getElementById("pDetails").value,
        images: [
          document.getElementById("pImage1").value,
          document.getElementById("pImage2").value,
          document.getElementById("pImage3").value,
          document.getElementById("pImage4").value,
          document.getElementById("pImage5").value
        ],
        video_url: document.getElementById("pVideoUrl").value
      })
    });

    productForm.reset();
    adminStatus.textContent = "Product created.";
    await loadAdminData();
  } catch (error) {
    adminStatus.textContent = error.message || "Failed to create product.";
  }
});

videoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/admin/videos", {
      method: "POST",
      body: JSON.stringify({
        title: document.getElementById("vTitle").value,
        url: document.getElementById("vUrl").value
      })
    });

    videoForm.reset();
    adminStatus.textContent = "Video added.";
    await loadAdminData();
  } catch (error) {
    adminStatus.textContent = error.message || "Failed to add video.";
  }
});

refreshInquiriesBtn?.addEventListener("click", async () => {
  const inquiries = await refreshInquiries();
  const content = `<div class="admin-modal-scroll admin-modal-list">${buildInquiryCardsHtml(inquiries)}</div>`;
  openAdminModal("Inquiry Customers", content);
});
refreshCustomersBtn?.addEventListener("click", async () => {
  const customers = await refreshCustomers();
  const content = `<div class="admin-modal-scroll">${buildCustomerCardsHtml(customers)}</div>`;
  openAdminModal("Login Customers", content);
});
editOffersBtn?.addEventListener("click", openOffersModal);
refreshOrdersBtn?.addEventListener("click", () => openOrdersModal("pending"));

adminModalOverlay?.addEventListener("click", (event) => {
  if (event.target === adminModalOverlay) {
    closeAdminModal();
  }
});
adminModalClose?.addEventListener("click", closeAdminModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && adminModalOverlay?.classList?.contains("is-visible")) {
    closeAdminModal();
  }
});

adminModalBody?.addEventListener("change", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  const orderId = target.getAttribute("data-order-id");
  if (!orderId) return;
  const prev = target.value;
  target.disabled = true;
  try {
    await api(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: target.value })
    });
    if (adminStatus) adminStatus.textContent = `Order #${orderId} updated to ${target.value}.`;
  } catch (error) {
    target.value = prev;
    if (adminStatus) adminStatus.textContent = error.message || "Failed to update order.";
  } finally {
    target.disabled = false;
  }
});

adminModalBody?.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-invoice]");
  if (!btn) return;
  const orderId = btn.getAttribute("data-invoice");
  const order = latestOrders.find((o) => String(o.id) === String(orderId));
  if (!order) return;
  renderInvoice(order);
});

document.addEventListener("click", async (event) => {
  const toggleBtn = event.target.closest(".password-toggle");
  if (toggleBtn) {
    const targetId = toggleBtn.getAttribute("data-target");
    const input = targetId ? document.getElementById(targetId) : null;
    if (input) {
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      toggleBtn.classList.toggle("is-visible", shouldShow);
      toggleBtn.setAttribute("aria-pressed", String(shouldShow));
      toggleBtn.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    }
    return;
  }

  const videoDeleteId = event.target.getAttribute("data-video-delete");
  if (videoDeleteId) {
    if (!window.confirm("Delete this video?")) return;
    try {
      await api(`/api/admin/videos/${videoDeleteId}`, { method: "DELETE" });
      adminStatus.textContent = "Video deleted.";
      await loadAdminData();
    } catch (error) {
      adminStatus.textContent = error.message || "Failed to delete video.";
    }
  }

  const deleteId = event.target.getAttribute("data-delete");
  if (deleteId) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api(`/api/admin/products/${deleteId}`, { method: "DELETE" });
      adminStatus.textContent = "Product deleted.";
      await loadAdminData();
    } catch (error) {
      adminStatus.textContent = error.message || "Failed to delete product.";
    }
  }

  const editId = event.target.getAttribute("data-edit");
  if (editId) {
    const name = window.prompt("Product name", decodeURIComponent(event.target.getAttribute("data-name") || ""));
    if (name === null) return;
    const category = window.prompt("Category", decodeURIComponent(event.target.getAttribute("data-category") || ""));
    if (category === null) return;
    const priceValue = window.prompt("Price (INR)", event.target.getAttribute("data-price") || "");
    if (priceValue === null) return;
    const details = window.prompt("Details", decodeURIComponent(event.target.getAttribute("data-details") || ""));
    if (details === null) return;
    const imagesJSON = decodeURIComponent(event.target.getAttribute("data-images") || "[]");
    const images = (() => {
      try {
        return JSON.parse(imagesJSON);
      } catch {
        return [];
      }
    })();
    const image1 = window.prompt("Photo URL 1", images[0] || "");
    if (image1 === null) return;
    const image2 = window.prompt("Photo URL 2", images[1] || "");
    if (image2 === null) return;
    const image3 = window.prompt("Photo URL 3", images[2] || "");
    if (image3 === null) return;
    const image4 = window.prompt("Photo URL 4", images[3] || "");
    if (image4 === null) return;
    const image5 = window.prompt("Photo URL 5", images[4] || "");
    if (image5 === null) return;
    const videoURL = window.prompt("Making Video URL", decodeURIComponent(event.target.getAttribute("data-video") || ""));
    if (videoURL === null) return;

    try {
      await api(`/api/admin/products/${editId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          category,
          price: Number(priceValue),
          details,
          images: [image1, image2, image3, image4, image5],
          video_url: videoURL
        })
      });
      adminStatus.textContent = "Product updated.";
      await loadAdminData();
    } catch (error) {
      adminStatus.textContent = error.message || "Failed to update product.";
    }
  }
});

checkSession();
initPasswordToggles();
