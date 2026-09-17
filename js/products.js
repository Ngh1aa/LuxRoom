const productGrid = document.querySelector("#product-grid");
const paginationContainer = document.querySelector("#pagination-container");
const filterToolbar = document.querySelector(".filter-toolbar");
const collectionCountLabel = document.querySelector("#collection-count-label");
const itemsPerPage = 9;

let currentPage = 1;

const activeFilters = {
  category: "All",
  collection: null,
  search: null,
  room: null,
  materialGroup: null,
  size: null,
  availability: null,
  delivery: null,
  colors: new Set(),
  materials: new Set(),
  priceMin: 0,
  priceMax: 1000,
  sort: "curated",
};

function getSizeBucket(product) {
  const width = Number(product.dimensions?.width || 0);
  if (width < 160) return "Under 160 cm";
  if (width <= 200) return "160–200 cm";
  return "200 cm+";
}

function getDeliveryBucket(product) {
  const leadTime = Number(product.variants?.[0]?.leadTimeMax ?? product.leadTimeMax ?? 0);
  if (leadTime <= 7) return "Ready to ship";
  if (leadTime <= 14) return "1–2 weeks";
  if (leadTime <= 28) return "2–4 weeks";
  return "4–8 weeks";
}

function productSearchText(product) {
  return [
    product.name,
    product.category,
    product.collection,
    product.room,
    product.materialGroup,
    product.style,
    ...product.colors,
    ...product.materials,
    ...product.variants.flatMap((variant) => [variant.finish, variant.material, variant.color]),
  ].join(" ").toLowerCase();
}

function productMatchesFilters(product) {
  if (activeFilters.category !== "All" && product.category !== activeFilters.category) return false;
  if (activeFilters.collection && product.collection !== activeFilters.collection) return false;
  if (activeFilters.search && !productSearchText(product).includes(activeFilters.search.toLowerCase())) return false;
  if (activeFilters.room && product.room !== activeFilters.room) return false;
  if (activeFilters.materialGroup && product.materialGroup !== activeFilters.materialGroup) return false;
  if (activeFilters.size && getSizeBucket(product) !== activeFilters.size) return false;
  if (activeFilters.availability && !product.variants.some((variant) => variant.stockStatus === activeFilters.availability)) return false;
  if (activeFilters.delivery && getDeliveryBucket(product) !== activeFilters.delivery) return false;
  if (activeFilters.colors.size > 0 && !Array.from(activeFilters.colors).some((color) => product.colors.includes(color))) return false;
  if (activeFilters.materials.size > 0 && !Array.from(activeFilters.materials).some((material) => product.materials.includes(material))) return false;
  if (product.price < activeFilters.priceMin || product.price > activeFilters.priceMax) return false;
  return true;
}

function getFilteredProducts() {
  const filtered = window.LuxRoom.products.filter(productMatchesFilters);

  if (activeFilters.sort === "price-asc") return filtered.sort((a, b) => a.price - b.price);
  if (activeFilters.sort === "price-desc") return filtered.sort((a, b) => b.price - a.price);
  if (activeFilters.sort === "name") return filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

function updateCategoryControls() {
  document.querySelectorAll(".collection-category").forEach((button) => {
    const isActive = button.dataset.category === activeFilters.category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-category-count]").forEach((node) => {
    const category = node.dataset.categoryCount;
    const count = category === "All"
      ? window.LuxRoom.products.length
      : window.LuxRoom.products.filter((product) => product.category === category).length;
    node.textContent = String(count).padStart(2, "0");
  });
}

function syncFilterAccessibility() {
  document.querySelectorAll(".filter-list li").forEach((item) => {
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-pressed", String(item.classList.contains("active")));
  });
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.classList.contains("is-selected")));
  });
}

function showAddedButtonState(button, productName) {
  if (!button) return;
  window.clearTimeout(Number(button.dataset.restoreTimer));
  button.dataset.originalLabel = button.dataset.originalLabel || button.innerHTML;
  button.classList.add("is-added");
  button.innerHTML = '<span aria-hidden="true">✓</span> Added <span aria-hidden="true">↗</span>';
  button.setAttribute("aria-label", `${productName} added to cart`);
  button.dataset.restoreTimer = String(window.setTimeout(() => {
    button.classList.remove("is-added");
    button.innerHTML = button.dataset.originalLabel;
    button.removeAttribute("aria-label");
    delete button.dataset.restoreTimer;
  }, 1900));
}

function refreshProductGridMotion() {
  if (!productGrid) return;
  const cards = productGrid.querySelectorAll(".product-card");
  cards.forEach((card, index) => {
    card.style.animationDelay = `${Math.min(index * 35, 220)}ms`;
    card.classList.add("motion-card-enter");
  });
}

function syncActiveFilterChips(totalItems) {
  const toolbar = document.querySelector(".active-filters");
  if (!toolbar) return;

  const parts = [];
  if (activeFilters.category !== "All") parts.push(activeFilters.category);
  if (activeFilters.collection) parts.push(activeFilters.collection);
  if (activeFilters.search) parts.push(`“${activeFilters.search}”`);
  if (activeFilters.room) parts.push(activeFilters.room);
  if (activeFilters.materialGroup) parts.push(activeFilters.materialGroup);
  if (activeFilters.size) parts.push(activeFilters.size);
  if (activeFilters.availability) parts.push(activeFilters.availability);
  if (activeFilters.delivery) parts.push(activeFilters.delivery);
  activeFilters.colors.forEach((color) => parts.push(color));
  activeFilters.materials.forEach((material) => parts.push(material));
  if (activeFilters.priceMin > 0 || activeFilters.priceMax < 1000) {
    parts.push(`$${activeFilters.priceMin} — $${activeFilters.priceMax}`);
  }

  toolbar.innerHTML = parts.length === 0
    ? `<span class="active-chip empty-chip">${totalItems} objects available</span>`
    : `${parts.map((part) => `<span class="active-chip">${part}</span>`).join("")}<button class="clear-filters-chip" onclick="window.clearFilters()" type="button" aria-label="Clear all filters">Clear all ↗</button>`;
}

function updateCollectionCount(totalItems) {
  if (!collectionCountLabel) return;
  const label = totalItems === 1 ? "object" : "objects";
  collectionCountLabel.textContent = `The current edit / ${totalItems} ${label}`;
}

function renderProducts() {
  if (!productGrid) return;

  const filtered = getFilteredProducts();
  const totalItems = filtered.length;
  const roomBackTarget = activeFilters.room
    ? `?room=${activeFilters.room}#room=${activeFilters.room}`
    : "";
  const roomBackContext = roomBackTarget ? `&from=${encodeURIComponent(roomBackTarget)}` : "";
  const roomBackFragment = roomBackTarget ? `&from=${encodeURIComponent(roomBackTarget)}` : "";
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (currentPage > totalPages) currentPage = totalPages || 1;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  if (totalItems === 0) {
          productGrid.innerHTML = '<div class="empty-results"><p class="eyebrow">The current selection</p><h2>A quieter edit for now.</h2><p>No objects match this combination. Clear one filter and the room will open up again.</p><button class="clear-filters-btn" onclick="window.clearFilters()" type="button">Reset the edit <span aria-hidden="true">↗</span></button></div>';

  } else {
    productGrid.innerHTML = currentProducts.map((product, index) => `
                <article class="product-card" style="animation-delay: ${index * 0.05}s">

        <div class="product-card-inner">
          <a href="./detail.html?product=${product.id}${roomBackContext}#product=${product.id}${roomBackFragment}" class="product-thumb ${product.tone}" style="background-image: url('./${product.image}');" aria-label="View ${product.name}">
            <span class="product-card-label">${product.category.toUpperCase()}</span>
            <span class="product-media-arrow product-media-arrow-prev" aria-hidden="true">←</span>
            <span class="product-media-arrow product-media-arrow-next" aria-hidden="true">→</span>
            <span class="product-media-dots" aria-hidden="true"><i class="is-active"></i><i></i></span>
            <span class="wishlist-heart ${window.LuxRoom.isWishlisted(product.id) ? "is-wishlisted" : ""}" data-wishlist="${product.id}" aria-label="Save ${product.name} to wishlist" role="button" tabindex="0"></span>
          </a>
          <div class="product-info-wrapper">
            <div class="product-meta-row">
              <h3>${product.name}</h3>
              <span class="price">$${product.price}</span>
              <span class="product-fit-meta">${product.dimensions.width} × ${product.dimensions.depth} cm · ${product.variants.length} ${product.variants.length === 1 ? "finish" : "finishes"}</span>
            </div>
            <div class="product-actions-row">
              <button class="add-to-cart-action" type="button" data-product-id="${product.id}" aria-label="Add ${product.name} to cart">
                <span aria-hidden="true">+</span> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join("");
  }

  renderPagination(totalPages);
  updateCategoryControls();
  updateCollectionCount(totalItems);
  syncActiveFilterChips(totalItems);
  syncFilterAccessibility();
  refreshProductGridMotion();
}

function renderPagination(totalPages) {
  if (!paginationContainer) return;
  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn ${currentPage === 1 ? "disabled" : ""}" onclick="window.setPage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>`;
  for (let page = 1; page <= totalPages; page += 1) {
    html += `<button class="page-btn ${page === currentPage ? "active" : ""}" onclick="window.setPage(${page})" aria-label="Page ${page}">${page}</button>`;
  }
  html += `<button class="page-btn ${currentPage === totalPages ? "disabled" : ""}" onclick="window.setPage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next page"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>`;
  paginationContainer.innerHTML = html;
}

window.setPage = function setPage(page) {
  currentPage = page;
  renderProducts();
  const toolbarOffset = filterToolbar ? filterToolbar.offsetTop - 90 : 0;
  window.scrollTo({ top: toolbarOffset, behavior: "smooth" });
};

window.clearFilters = function clearFilters() {
  activeFilters.category = "All";
  activeFilters.collection = null;
  activeFilters.search = null;
  activeFilters.room = null;
  activeFilters.materialGroup = null;
  activeFilters.size = null;
  activeFilters.availability = null;
  activeFilters.delivery = null;
  activeFilters.colors.clear();
  activeFilters.materials.clear();
  activeFilters.priceMin = 0;
  activeFilters.priceMax = 1000;
  activeFilters.sort = "curated";

  const rangeMin = document.querySelector(".range-min");
  const rangeMax = document.querySelector(".range-max");
  const sortSelect = document.querySelector("#collection-sort");
  if (rangeMin) rangeMin.value = "0";
  if (rangeMax) rangeMax.value = "1000";
  if (sortSelect) sortSelect.value = "curated";

  document.querySelectorAll(".filter-list li").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".filter-list li:first-child").forEach((item) => item.classList.add("active"));
  document.querySelectorAll(".chip.is-selected").forEach((chip) => chip.classList.remove("is-selected"));
  if (window.history?.replaceState) window.history.replaceState({}, "", "products.html");
  updatePriceSlider();
  currentPage = 1;
  renderProducts();
};

const filterToggle = document.querySelector(".filter-toggle");
const expandedFilters = document.querySelector(".expanded-filters");
if (filterToggle && expandedFilters) {
  const mobileFilterQuery = window.matchMedia("(max-width: 820px)");
  const closeButton = document.createElement("button");
  closeButton.className = "mobile-filter-close";
  closeButton.type = "button";
  closeButton.innerHTML = '<span>Refine the edit</span><span aria-hidden="true">×</span>';
  closeButton.setAttribute("aria-label", "Close collection filters");
  expandedFilters.prepend(closeButton);

  const setFilterOpen = (isOpen) => {
    expandedFilters.classList.toggle("show", isOpen);
    filterToggle.setAttribute("aria-expanded", String(isOpen));
    const icon = filterToggle.querySelector(".filter-toggle-icon");
    if (icon) icon.textContent = isOpen ? "−" : "+";
    document.body.classList.toggle("collection-filter-open", mobileFilterQuery.matches && isOpen);
  };

  if (mobileFilterQuery.matches) setFilterOpen(false);
  filterToggle.addEventListener("click", () => setFilterOpen(!expandedFilters.classList.contains("show")));
  closeButton.addEventListener("click", () => {
    setFilterOpen(false);
    filterToggle.focus();
  });
  mobileFilterQuery.addEventListener?.("change", (event) => setFilterOpen(!event.matches));
}

document.querySelectorAll(".collection-category").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilters.category = button.dataset.category || "All";
    activeFilters.collection = null;
    activeFilters.search = null;
    if (window.history?.replaceState) {
      const categoryUrl = activeFilters.category === "All" ? "products.html" : `products.html?category=${encodeURIComponent(activeFilters.category)}`;
      window.history.replaceState({}, "", categoryUrl);
    }
    currentPage = 1;
    renderProducts();
    productGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function activateFilterListItem(item) {
  const group = item.closest(".filter-col");
  const groupKey = group?.dataset.filterGroup;
  group?.querySelectorAll("li").forEach((sibling) => {
    sibling.classList.remove("active");
    sibling.setAttribute("aria-pressed", "false");
  });
  item.classList.add("active");
  item.setAttribute("aria-pressed", "true");

  if (groupKey && Object.hasOwn(activeFilters, groupKey)) {
    activeFilters[groupKey] = item.dataset.filterValue || null;
  }
  currentPage = 1;
  renderProducts();
}

document.querySelectorAll(".filter-list li").forEach((item) => {
  item.addEventListener("click", () => activateFilterListItem(item));
  item.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateFilterListItem(item);
  });
});

document.querySelectorAll(".color-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const color = chip.dataset.color;
    chip.classList.toggle("is-selected");
    if (chip.classList.contains("is-selected")) activeFilters.colors.add(color);
    else activeFilters.colors.delete(color);
    chip.setAttribute("aria-pressed", String(chip.classList.contains("is-selected")));
    currentPage = 1;
    renderProducts();
  });
});

document.querySelectorAll(".material-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const material = chip.dataset.material;
    chip.classList.toggle("is-selected");
    if (chip.classList.contains("is-selected")) activeFilters.materials.add(material);
    else activeFilters.materials.delete(material);
    chip.setAttribute("aria-pressed", String(chip.classList.contains("is-selected")));
    currentPage = 1;
    renderProducts();
  });
});

const rangeMin = document.querySelector(".range-min");
const rangeMax = document.querySelector(".range-max");
const priceFill = document.querySelector("#price-fill");
const priceMinVal = document.querySelector("#price-min-val");
const priceMaxVal = document.querySelector("#price-max-val");

function updatePriceSlider(event) {
  if (!rangeMin || !rangeMax) return;
  const minGap = 25;
  let minVal = Number(rangeMin.value);
  let maxVal = Number(rangeMax.value);

  if (maxVal - minVal < minGap) {
    if (event?.target.classList.contains("range-min")) {
      minVal = maxVal - minGap;
      rangeMin.value = String(minVal);
    } else {
      maxVal = minVal + minGap;
      rangeMax.value = String(maxVal);
    }
  }

  activeFilters.priceMin = minVal;
  activeFilters.priceMax = maxVal;
  if (priceMinVal) priceMinVal.textContent = `$${minVal}`;
  if (priceMaxVal) priceMaxVal.textContent = `$${maxVal}`;

  if (priceFill) {
    const percentMin = (minVal / Number(rangeMin.max)) * 100;
    const percentMax = 100 - (maxVal / Number(rangeMax.max)) * 100;
    priceFill.style.left = `${percentMin}%`;
    priceFill.style.right = `${percentMax}%`;
  }
}

if (rangeMin && rangeMax) {
  const handleRangeUpdate = (event) => {
    updatePriceSlider(event);
    currentPage = 1;
    renderProducts();
  };
  rangeMin.addEventListener("input", handleRangeUpdate);
  rangeMax.addEventListener("input", handleRangeUpdate);
  updatePriceSlider();
}

const sortSelect = document.querySelector("#collection-sort");
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    activeFilters.sort = sortSelect.value;
    currentPage = 1;
    renderProducts();
  });
}

if (productGrid) {
  productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest(".add-to-cart-action[data-product-id]");
    if (addButton) {
      event.preventDefault();
      event.stopPropagation();
      const productId = Number(addButton.dataset.productId);
      const product = window.LuxRoom.products.find((item) => item.id === productId);
      if (product) {
        window.LuxRoom.addToCart(productId, 1);
        window.LuxRoom.showToast(`Added 1x ${product.name} to cart.`);
        showAddedButtonState(addButton, product.name);
      }
      return;
    }

    const heart = event.target.closest(".wishlist-heart[data-wishlist]");
    if (!heart) return;
    event.preventDefault();
    event.stopPropagation();
    window.toggleWishlist(Number(heart.dataset.wishlist));
  });
}

window.LuxRoom.refreshWishlistState = function refreshWishlistState() {
  document.querySelectorAll("[data-wishlist]").forEach((control) => {
    const id = Number(control.dataset.wishlist);
    const wishlisted = window.LuxRoom.isWishlisted(id);
    control.classList.toggle("is-wishlisted", wishlisted);
    control.setAttribute("aria-pressed", String(wishlisted));
  });
  document.querySelectorAll("[data-wishlist-count]").forEach((node) => {
    const count = window.LuxRoom.wishlistItems.length;
    node.textContent = String(count);
    node.style.display = count > 0 ? "flex" : "none";
  });
};

function applyUrlFilters() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const requestedRoom = query.get("room") || hash.get("room");
  const requestedCategory = query.get("category");
  const requestedCollection = query.get("collection");
  const requestedSearch = query.get("search");
  let applied = false;

  const room = ["Living", "Dining", "Bedroom", "Bathroom", "Office"]
    .find((option) => option.toLowerCase() === requestedRoom?.trim().toLowerCase());
  if (room) {
    activeFilters.room = room;
    applied = true;
  }

  const category = ["Seating", "Tables", "Lighting", "Storage", "Textiles", "Objects"]
    .find((option) => option.toLowerCase() === requestedCategory?.trim().toLowerCase());
  if (category) {
    activeFilters.category = category;
    applied = true;
  }

  const collection = [...new Set(window.LuxRoom.products.map((product) => product.collection))]
    .find((option) => option.toLowerCase() === requestedCollection?.trim().toLowerCase());
  if (collection) {
    activeFilters.collection = collection;
    applied = true;
  }

  if (requestedSearch?.trim()) {
    activeFilters.search = requestedSearch.trim();
    applied = true;
  }

  document.querySelectorAll(".filter-col[data-filter-group]").forEach((group) => {
    const value = activeFilters[group.dataset.filterGroup];
    group.querySelectorAll("li").forEach((item) => {
      const isActive = (item.dataset.filterValue || null) === (value || null);
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  });
  return applied;
}

const urlFilterApplied = applyUrlFilters();
currentPage = urlFilterApplied ? 1 : currentPage;
renderProducts();
window.addEventListener("wishlist-updated", window.LuxRoom.refreshWishlistState);
window.LuxRoom.refreshWishlistState();
