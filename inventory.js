(() => {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const availabilityText = {
    available: "In stock",
    made_to_order: "Made to order",
    out_of_stock: "Out of stock"
  };

  const decorateCards = () => {
    grid.querySelectorAll(".product-card").forEach((card) => {
      const status = card.dataset.availability || "available";
      const badge = card.querySelector(".availability-badge") || document.createElement("span");
      badge.className = `availability-badge availability-${status}`;
      badge.textContent = availabilityText[status] || availabilityText.available;
      if (!badge.isConnected) card.querySelector("h3")?.after(badge);
    });
  };

  new MutationObserver(decorateCards).observe(grid, { childList: true });
  decorateCards();
})();
