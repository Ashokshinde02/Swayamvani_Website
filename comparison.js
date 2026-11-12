(() => {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const selected = new Set();
  const tray = document.createElement("aside");
  tray.className = "compare-tray";
  tray.hidden = true;
  tray.setAttribute("aria-live", "polite");
  document.body.appendChild(tray);

  const productsFromCards = () => [...selected]
    .map((id) => grid.querySelector(`[data-product-id="${CSS.escape(id)}"]`))
    .filter(Boolean);

  const renderTray = () => {
    const cards = productsFromCards();
    tray.hidden = cards.length === 0;
    tray.replaceChildren();
    if (!cards.length) return;

    const head = document.createElement("div");
    head.className = "compare-tray-head";
    const title = document.createElement("strong");
    title.textContent = `Compare instruments (${cards.length}/3)`;
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "Clear";
    clear.addEventListener("click", () => {
      selected.clear();
      grid.querySelectorAll("[data-compare-id]").forEach((button) => {
        button.setAttribute("aria-pressed", "false");
        button.textContent = "Compare";
      });
      renderTray();
    });
    head.append(title, clear);
    tray.appendChild(head);

    const table = document.createElement("table");
    table.className = "compare-table";
    const rows = [
      ["Instrument", (card) => card.querySelector("h3")?.textContent || ""],
      ["Category", (card) => card.querySelector(".product-cta")?.dataset.category || card.dataset.category || ""],
      ["Price", (card) => card.querySelector(".price.deal")?.textContent || ""],
      ["Availability", (card) => card.querySelector(".availability-badge")?.textContent || ""],
      ["Details", (card) => card.dataset.details || "Open product for details"]
    ];
    rows.forEach(([label, value]) => {
      const row = table.insertRow();
      const heading = document.createElement("th");
      heading.scope = "row";
      heading.textContent = label;
      row.appendChild(heading);
      cards.forEach((card) => {
        const cell = row.insertCell();
        cell.textContent = value(card);
      });
    });
    tray.appendChild(table);
  };

  const decorateCards = () => {
    grid.querySelectorAll(".product-card").forEach((card) => {
      if (card.querySelector("[data-compare-id]")) return;
      const id = card.dataset.productId;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "compare-toggle";
      button.dataset.compareId = id;
      button.textContent = "Compare";
      button.setAttribute("aria-pressed", "false");
      card.querySelector(".product-bottom")?.appendChild(button);
    });
  };

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-compare-id]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const id = button.dataset.compareId;
    if (selected.has(id)) {
      selected.delete(id);
      button.setAttribute("aria-pressed", "false");
      button.textContent = "Compare";
    } else if (selected.size < 3) {
      selected.add(id);
      button.setAttribute("aria-pressed", "true");
      button.textContent = "Added";
    } else {
      button.textContent = "Limit is 3";
      window.setTimeout(() => { button.textContent = "Compare"; }, 1200);
    }
    renderTray();
  });

  new MutationObserver(() => {
    decorateCards();
    renderTray();
  }).observe(grid, { childList: true });
  decorateCards();
})();
