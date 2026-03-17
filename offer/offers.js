// Offer management helper functions for Admin UI
// Exposed via window.OfferService
(function () {
  const endpoints = {
    adminOffers: "/api/admin/offers"
  };

  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  async function list() {
    // Always use public offers for listing to avoid auth issues; admin auth is still required for mutations.
    const res = await fetchJSON("/api/offers");
    return { offers: res.offers, list: res.list || [] };
  }

  async function save(id, config) {
    return fetchJSON(endpoints.adminOffers, {
      method: "POST",
      body: JSON.stringify({ id, config })
    });
  }

  async function activate(id) {
    return fetchJSON(endpoints.adminOffers, {
      method: "PATCH",
      body: JSON.stringify({ id })
    });
  }

  async function remove(id) {
    return fetchJSON(`${endpoints.adminOffers}?id=${id}`, {
      method: "DELETE"
    });
  }

  function populateSelect(selectEl, offers = []) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    const newOpt = document.createElement("option");
    newOpt.value = "new";
    newOpt.textContent = "Add new offer";
    selectEl.appendChild(newOpt);

    offers.forEach((entry) => {
      const opt = document.createElement("option");
      opt.value = String(entry.id);
      opt.textContent = `${entry.config.title || "Untitled"} ${entry.active ? "(active)" : ""}`;
      if (entry.active) opt.dataset.active = "1";
      selectEl.appendChild(opt);
    });
  }

  window.OfferService = {
    list,
    save,
    activate,
    remove,
    populateSelect
  };
})();
