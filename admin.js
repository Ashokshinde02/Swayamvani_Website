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
const adminHeaderActions = document.querySelector(".admin-header-actions");
const hasBackend = window.location.protocol === "http:" || window.location.protocol === "https:";
const adminModalOverlay = document.getElementById("adminModalOverlay");
const adminModal = document.getElementById("adminModal");
const adminModalTitle = document.getElementById("adminModalTitle");
const adminModalBody = document.getElementById("adminModalBody");
const adminModalClose = document.getElementById("adminModalClose");

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

function createOffersFormHtml(offers = {}, errorMessage = "") {
  const errorBlock = errorMessage
    ? `<p class="form-status" aria-live="assertive">${escapeHtml(errorMessage)}</p>`
    : "";
  return `
    ${errorBlock}
    <form id="adminOffersForm" class="admin-modal-form">
      <label>
        Heading
        <input name="title" type="text" maxlength="120" required value="${escapeHtml(offers.title || "")}" />
      </label>
      <label>
        Description
        <textarea name="desc" rows="3" required>${escapeHtml(offers.desc || "")}</textarea>
      </label>
      <label>
        Discount title
        <input name="discountTitle" type="text" maxlength="120" required value="${escapeHtml(offers.discountTitle || "")}" />
      </label>
      <label>
        Discount description
        <textarea name="discountDesc" rows="3" required>${escapeHtml(offers.discountDesc || "")}</textarea>
      </label>
      <label>
        Lessons title
        <input name="lessonsTitle" type="text" maxlength="120" required value="${escapeHtml(offers.lessonsTitle || "")}" />
      </label>
      <label>
        Lessons description
        <textarea name="lessonsDesc" rows="3" required>${escapeHtml(offers.lessonsDesc || "")}</textarea>
      </label>
      <div class="admin-modal-actions">
        <button type="submit">Save</button>
        <button type="button" class="filter-btn" data-modal-close>Cancel</button>
      </div>
    </form>
  `;
}

function bindOffersForm(form) {
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: (form.elements.title?.value || "").trim(),
      desc: (form.elements.desc?.value || "").trim(),
      discountTitle: (form.elements.discountTitle?.value || "").trim(),
      discountDesc: (form.elements.discountDesc?.value || "").trim(),
      lessonsTitle: (form.elements.lessonsTitle?.value || "").trim(),
      lessonsDesc: (form.elements.lessonsDesc?.value || "").trim()
    };
    try {
      await api("/api/admin/offers", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (adminStatus) adminStatus.textContent = "Offers updated.";
      closeAdminModal();
    } catch (submitError) {
      if (adminStatus) adminStatus.textContent = submitError.message || "Failed to update offers.";
      const alert = document.createElement("p");
      alert.className = "form-status";
      alert.textContent = submitError.message || "Failed to update offers.";
      form.prepend(alert);
    }
  });
  form.querySelector("[data-modal-close]")?.addEventListener("click", closeAdminModal);
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
    const data = await api("/api/offers");
    const offers = data.offers || {};
    if (adminModalBody) {
      adminModalBody.innerHTML = createOffersFormHtml(offers);
      bindOffersForm(document.getElementById("adminOffersForm"));
    }
  } catch (error) {
    if (adminModalBody) {
      adminModalBody.innerHTML = createOffersFormHtml({}, error.message || "Could not load offers.");
      bindOffersForm(document.getElementById("adminOffersForm"));
    }
    if (adminStatus) adminStatus.textContent = error.message || "Failed to load offers.";
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
