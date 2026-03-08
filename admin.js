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
const hasBackend = window.location.protocol === "http:" || window.location.protocol === "https:";

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
  if (!inquiries.length) {
    inquiriesEl.innerHTML = "<p>No inquiries yet.</p>";
    return;
  }

  inquiriesEl.innerHTML = inquiries
    .map(
      (i) => `
      <div class="cart-item">
        <strong>${i.name} (${i.email})</strong>
        <p>${new Date(i.created_at).toLocaleString()}</p>
        <p>${i.message}</p>
      </div>
    `
    )
    .join("");
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
  const [productsData, videosData, inquiriesData] = await Promise.all([
    api("/api/admin/products"),
    api("/api/admin/videos"),
    api("/api/admin/inquiries")
  ]);
  renderProducts(productsData.products || []);
  renderVideos(videosData.videos || []);
  renderInquiries(inquiriesData.inquiries || []);
}

async function checkSession() {
  try {
    await api("/api/admin/me", { method: "GET" });
    loginSection.style.display = "none";
    adminSection.style.display = "block";
    adminStatus.textContent = "Logged in.";
    await loadAdminData();
  } catch {
    loginSection.style.display = "block";
    adminSection.style.display = "none";
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
    await checkSession();
  } catch (error) {
    adminStatus.textContent = error.message || "Login failed.";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", { method: "POST" });
  } finally {
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
