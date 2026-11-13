const detailParams = new URLSearchParams(window.location.search);
const productQuery = detailParams.get("product");
const variantQuery = detailParams.get("variant");
const sizeQuery = detailParams.get("size");
const productMissing = productQuery !== null && !window.LuxRoom.getProduct(Number(productQuery));
const selectedProduct = window.LuxRoom.getProduct(Number(productQuery)) || window.LuxRoom.products[0];
let selectedVariant = window.LuxRoom.getVariant(selectedProduct, variantQuery);
let selectedSize = window.LuxRoom.getSize(selectedProduct, sizeQuery);
let selectedGallery = selectedVariant.images.slice(0, 3);
let selectedQuantity = 1;

function renderNotFound() {
  const main = document.querySelector("main.product-detail-shell");
  document.title = "LuxRoom | Piece not found";
  if (!main) return;
  const suggestions = window.LuxRoom.products.slice(0, 3);
  main.innerHTML = `
    <section class="detail-not-found" aria-labelledby="not-found-title">
      <p class="eyebrow">Piece not found</p>
      <h1 id="not-found-title">This piece is not<br><em>in the collection.</em></h1>
      <p>We could not find a product with the reference <strong>${window.LuxRoom.escapeHtml(productQuery)}</strong>. It may have been retired, or the link may be incomplete.</p>
      <div class="detail-not-found__actions"><a class="primary-button" href="products.html">Browse the collection <span aria-hidden="true">↗</span></a><a class="secondary-button" href="contact.html?topic=product">Ask the studio</a></div>
      <div class="detail-not-found__suggestions">${suggestions.map((product) => `<a href="detail.html?product=${product.id}"><span style="background-image:url('${product.image}')" role="img" aria-label="${window.LuxRoom.escapeHtml(product.name)}"></span><strong>${window.LuxRoom.escapeHtml(product.name)}</strong><small>${window.LuxRoom.formatMoney(product.price)}</small></a>`).join("")}</div>
    </section>`;
}

const nodes = {
  title: document.querySelector("#detail-title"),
  price: document.querySelector("#detail-price"),
  mobilePrice: document.querySelector("#mobile-detail-price"),
  mobileFinish: document.querySelector("#mobile-detail-finish"),
  name: document.querySelector("#detail-name"),
  crumb: document.querySelector("#detail-crumb-name"),
  description: document.querySelector("#detail-description"),
  materialSummary: document.querySelector("#detail-material-summary"),
  dimensionSummary: document.querySelector("#detail-dimension-summary"),
  stockSummary: document.querySelector("#detail-stock-summary"),
  availability: document.querySelector("#detail-availability"),
  finishOptions: document.querySelector("#finish-options"),
  specImage: document.querySelector("#detail-spec-image"),
  quantity: document.querySelector("#qty-value"),
  location: document.querySelector("#detail-delivery-location"),
  arrival: document.querySelector("#detail-arrival"),
  deliveryType: document.querySelector("#detail-delivery-type"),
  placementNote: document.querySelector("#detail-placement-note"),
  dimensionCopy: document.querySelector("#detail-dimension-copy"),
  dimensionVisual: document.querySelector("#dimension-visual"),
  dimensionWidth: document.querySelector("#dimension-width"),
  dimensionHeight: document.querySelector("#dimension-height"),
  dimensionDepth: document.querySelector("#dimension-depth"),
  materials: document.querySelector("#detail-materials"),
  care: document.querySelector("#detail-care"),
  deliveryPolicy: document.querySelector("#detail-delivery-policy"),
  addedConfirmation: document.querySelector("#added-confirmation"),
};

const galleryButtons = Array.from(document.querySelectorAll("[data-gallery-image]"));

function syncVariantUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("product", String(selectedProduct.id));
  url.searchParams.set("variant", selectedVariant.variantId);
  if (selectedSize && selectedSize.sizeId !== "std") url.searchParams.set("size", selectedSize.sizeId);
  else url.searchParams.delete("size");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function dimensionSummary(product) {
  const { height } = product.dimensions;
  const width = selectedSize?.width ?? product.dimensions.width;
  const depth = selectedSize?.depth ?? product.dimensions.depth;
  return `W ${width} × D ${depth} × H ${height} cm`;
}

function currentPrice() {
  return selectedVariant.price + (selectedSize?.priceDelta || 0);
}

function maxQuantity() {
  return window.LuxRoom.getMaxQuantity(selectedProduct, selectedVariant);
}

function stockMessage() {
  if (selectedVariant.stockStatus === "In stock") {
    return selectedVariant.stock <= 3
      ? `Only ${selectedVariant.stock} left in ${selectedVariant.finish}. Order soon.`
      : `${selectedVariant.stock} in stock in ${selectedVariant.finish}.`;
  }
  if (selectedVariant.stockStatus === "Made to order") return `Made to order in ${selectedVariant.finish}. Made for you in ${selectedVariant.leadTimeMin}–${selectedVariant.leadTimeMax} days, up to 10 per order.`;
  return `Pre-order in ${selectedVariant.finish}. The next batch ships in ${selectedVariant.leadTimeMin}–${selectedVariant.leadTimeMax} days.`;
}

function renderSizes() {
  const container = document.querySelector("#size-options");
  if (!container) return;
  const sizes = selectedProduct.sizes;
  container.innerHTML = sizes.length > 1
    ? sizes.map((size) => {
      const active = size.sizeId === selectedSize.sizeId;
      const delta = size.priceDelta ? ` (${size.priceDelta > 0 ? "+" : "−"}${window.LuxRoom.formatMoney(Math.abs(size.priceDelta))})` : "";
      return `<button type="button" class="size-option${active ? " active" : ""}" data-size-id="${size.sizeId}" aria-pressed="${active}"><strong>${size.label}</strong><small>W ${size.width} cm${delta}</small></button>`;
    }).join("")
    : `<p class="size-single">One size, W ${sizes[0].width} cm</p>`;
}

function syncQuantity() {
  const max = maxQuantity();
  if (selectedQuantity > max) selectedQuantity = max;
  if (nodes.quantity) nodes.quantity.textContent = String(selectedQuantity);
  const plus = document.querySelector("#qty-plus");
  if (plus) plus.setAttribute("aria-disabled", String(selectedQuantity >= max));
  const minus = document.querySelector("#qty-minus");
  if (minus) minus.setAttribute("aria-disabled", String(selectedQuantity <= 1));
  const note = document.querySelector("#detail-stock-note");
  if (note) {
    note.textContent = stockMessage();
    note.dataset.level = selectedVariant.stockStatus === "In stock" && selectedVariant.stock <= 3 ? "low" : "";
  }
}

function dimensionDetails(product) {
  const dimensionLabels = {
    seatHeight: "Seat height",
    seatDepth: "Seat depth",
    armHeight: "Arm height",
    legHeight: "Leg height",
    topThickness: "Top thickness",
    clearance: "Clearance",
    internalWidth: "Internal width",
    internalDepth: "Internal depth",
  };
  const details = Object.entries(dimensionLabels)
    .filter(([key]) => product.dimensions[key] !== undefined)
    .map(([key, label]) => `${label} ${product.dimensions[key]} cm`);
  return `${dimensionSummary(product)}.${details.length ? ` ${details.join(". ")}.` : ""}`;
}

function leadTimeLabel(variant) {
  if (variant.leadTimeMax <= 7) return "Ready to ship";
  if (variant.leadTimeMax <= 14) return "1–2 week arrival";
  if (variant.leadTimeMax <= 28) return "2–4 week arrival";
  return "4–8 week arrival";
}

function updateGallery() {
  selectedGallery = selectedVariant.images.slice(0, 3);
  galleryButtons.forEach((button, index) => {
    const image = selectedGallery[index] || selectedGallery[0] || selectedProduct.image;
    button.style.backgroundImage = `url('./${image}')`;
    button.setAttribute("aria-label", `View ${selectedProduct.name} in ${selectedVariant.finish}, image ${index + 1}`);
    button.classList.toggle("is-selected", index === 0);
    button.setAttribute("aria-pressed", String(index === 0));
  });
  if (nodes.specImage) {
    const nextUrl = `./${selectedGallery[0] || selectedProduct.image}`;
    if (window.LuxRoomMotion?.crossfadeBackground) {
      window.LuxRoomMotion.crossfadeBackground(nodes.specImage, nextUrl);
    } else {
      nodes.specImage.style.backgroundImage = `url('${nextUrl}')`;
    }
    nodes.specImage.setAttribute("aria-label", `${selectedProduct.name} in ${selectedVariant.finish}`);
  }
}

function updateDelivery() {
  const locationKey = nodes.location?.value || window.LuxRoom.deliveryPreferences.location;
  const location = window.LuxRoom.deliveryLocations[locationKey] || window.LuxRoom.deliveryLocations.hcm;
  const arrival = window.LuxRoom.getArrivalWindow(selectedVariant, locationKey);
  if (nodes.arrival) nodes.arrival.textContent = `Estimated ${arrival.label}`;
  if (nodes.deliveryType) {
    nodes.deliveryType.textContent = location.surcharge === 0
      ? `${selectedProduct.deliveryType} included`
      : `${selectedProduct.deliveryType} ${window.LuxRoom.formatMoney(location.surcharge)}`;
  }
  if (nodes.placementNote) {
    nodes.placementNote.textContent = selectedProduct.oversized
      ? "Careful delivery into your chosen room. Placement is available at checkout."
      : "Carefully packed delivery, with room placement available at checkout.";
  }
}

function updateVariantDetails() {
  const price = window.LuxRoom.formatMoney(currentPrice());
  if (nodes.price) {
    nodes.price.textContent = price;
    window.LuxRoomMotion?.flashPrice(nodes.price);
  }
  if (nodes.mobilePrice) {
    nodes.mobilePrice.textContent = price;
    window.LuxRoomMotion?.flashPrice(nodes.mobilePrice);
  }
  if (nodes.mobileFinish) nodes.mobileFinish.textContent = selectedVariant.finish;
  if (nodes.materialSummary) nodes.materialSummary.textContent = `${selectedVariant.material} / ${Object.values(selectedProduct.materialDetails)[1] || selectedProduct.materialGroup}`;
  if (nodes.stockSummary) nodes.stockSummary.textContent = selectedVariant.stockStatus;
  if (nodes.availability) nodes.availability.textContent = `${selectedVariant.stockStatus}, ${leadTimeLabel(selectedVariant).toLowerCase()} / SKU ${selectedVariant.sku}`;
  if (nodes.dimensionSummary) nodes.dimensionSummary.textContent = dimensionSummary(selectedProduct);
  if (nodes.dimensionWidth) nodes.dimensionWidth.textContent = `${selectedSize.width} cm`;
  renderSizes();
  syncQuantity();
  nodes.finishOptions?.querySelectorAll(".finish-option").forEach((button) => {
    const isActive = button.dataset.variantId === selectedVariant.variantId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  syncVariantUrl();
  updateGallery();
  updateDelivery();
}

function renderProductInformation() {
  document.title = `LuxRoom | ${selectedProduct.name}`;
  if (nodes.title) nodes.title.textContent = selectedProduct.name;
  if (nodes.name) nodes.name.textContent = selectedProduct.name;
  if (nodes.crumb) nodes.crumb.textContent = selectedProduct.name;
  if (nodes.description) nodes.description.textContent = selectedProduct.description;
  if (nodes.dimensionSummary) nodes.dimensionSummary.textContent = dimensionSummary(selectedProduct);
  if (nodes.dimensionCopy) nodes.dimensionCopy.textContent = dimensionDetails(selectedProduct);
  if (nodes.dimensionWidth) nodes.dimensionWidth.textContent = `${selectedSize.width} cm`;
  if (nodes.dimensionHeight) nodes.dimensionHeight.textContent = `${selectedProduct.dimensions.height} cm`;
  if (nodes.dimensionDepth) nodes.dimensionDepth.textContent = `${selectedProduct.dimensions.depth} cm deep`;
  if (nodes.dimensionVisual) {
    nodes.dimensionVisual.dataset.shape = selectedProduct.dimensionType;
    nodes.dimensionVisual.setAttribute("aria-label", `Technical dimensions for ${selectedProduct.name}: ${dimensionSummary(selectedProduct)}`);
  }
  if (nodes.materials) {
    nodes.materials.innerHTML = [
      ["Selected finish", selectedVariant.finish],
      ...Object.entries(selectedProduct.materialDetails),
    ].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  }
  if (nodes.care) nodes.care.innerHTML = selectedProduct.care.map((item) => `<li>${item}</li>`).join("");
  if (nodes.deliveryPolicy) {
    nodes.deliveryPolicy.textContent = `${selectedProduct.deliveryType} includes careful handling${selectedProduct.oversized ? " into your chosen room" : ""}. Packaging removal is available with placement service. ${selectedProduct.returnable ? "Returns may be requested within 14 days." : "This made-to-order piece cannot be cancelled once production begins."} Report transit damage within 48 hours so our room team can arrange a remedy.`;
  }
}

function setupGallery() {
  galleryButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      galleryButtons.forEach((item, itemIndex) => {
        item.classList.toggle("is-selected", itemIndex === index);
        item.setAttribute("aria-pressed", String(itemIndex === index));
      });
      if (nodes.specImage) nodes.specImage.style.backgroundImage = `url('./${selectedGallery[index] || selectedGallery[0]}')`;
    });
  });
}

function setupFinishes() {
  if (!nodes.finishOptions) return;
  nodes.finishOptions.innerHTML = selectedProduct.variants.map((variant) => {
    const isActive = variant.variantId === selectedVariant.variantId;
    return `
    <button type="button" class="finish-option${isActive ? " active" : ""}" data-variant-id="${variant.variantId}" data-finish="${variant.finish}" aria-pressed="${isActive}">
      <span class="swatch" style="background:${variant.swatch}" aria-hidden="true"></span>${variant.finish}
    </button>`;
  }).join("");
  nodes.finishOptions.addEventListener("click", (event) => {
    const button = event.target.closest(".finish-option[data-variant-id]");
    if (!button) return;
    selectedVariant = window.LuxRoom.getVariant(selectedProduct, button.dataset.variantId);
    renderProductInformation();
    updateVariantDetails();
  });
}

function setupSizes() {
  document.querySelector("#size-options")?.addEventListener("click", (event) => {
    const button = event.target.closest(".size-option[data-size-id]");
    if (!button) return;
    selectedSize = window.LuxRoom.getSize(selectedProduct, button.dataset.sizeId);
    renderProductInformation();
    updateVariantDetails();
  });
}

function setupQuantityControls() {
  document.querySelector("#qty-minus")?.addEventListener("click", () => {
    selectedQuantity = Math.max(1, selectedQuantity - 1);
    syncQuantity();
  });
  document.querySelector("#qty-plus")?.addEventListener("click", () => {
    if (selectedQuantity >= maxQuantity()) {
      window.LuxRoom.showToast(`Only ${maxQuantity()} available in ${selectedVariant.finish}.`);
      return;
    }
    selectedQuantity += 1;
    syncQuantity();
  });
}

function setupAccordions() {
  document.querySelectorAll(".acc-head").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".acc-item");
      const isOpen = item.classList.toggle("acc-open");
      button.setAttribute("aria-expanded", String(isOpen));
      button.querySelector(".acc-icon").textContent = isOpen ? "−" : "+";
    });
  });
}

function addSelectedToCart() {
  window.LuxRoom.addToCart(selectedProduct.id, selectedQuantity, selectedVariant.variantId, selectedSize.sizeId);
  window.LuxRoom.showToast(`${selectedProduct.name} in ${selectedVariant.finish}${selectedSize.label !== "One size" ? `, ${selectedSize.label}` : ""} added to your selection.`);
  window.LuxRoomMotion?.pulseCartBadge();
  if (nodes.addedConfirmation) nodes.addedConfirmation.hidden = false;
}

function setupPurchaseControls() {
  document.querySelector("#add-to-cart")?.addEventListener("click", addSelectedToCart);
  document.querySelector("#mobile-add-to-cart")?.addEventListener("click", addSelectedToCart);
  document.querySelector("#continue-browsing")?.addEventListener("click", () => {
    if (nodes.addedConfirmation) nodes.addedConfirmation.hidden = true;
  });
}

function setupDelivery() {
  if (!nodes.location) return;
  nodes.location.value = window.LuxRoom.deliveryPreferences.location;
  nodes.location.addEventListener("change", () => {
    window.LuxRoom.updateDeliveryPreferences({ location: nodes.location.value });
    updateDelivery();
  });
  document.addEventListener("luxroom-delivery-updated", () => {
    nodes.location.value = window.LuxRoom.deliveryPreferences.location;
    updateDelivery();
  });
}

function readRecentlyViewed() {
  return (window.LuxRoom.store.get(window.LuxRoom.storeKeys.recentlyViewed, []) || []).map(Number);
}

function updateRecentlyViewed() {
  const previous = readRecentlyViewed().filter((id) => id !== selectedProduct.id);
  const recentProducts = previous.map((id) => window.LuxRoom.getProduct(id)).filter(Boolean).slice(0, 4);
  const section = document.querySelector("#recently-viewed");
  const grid = document.querySelector("#recently-viewed-grid");
  if (section && grid && recentProducts.length) {
    grid.innerHTML = recentProducts.map((product) => `
      <a class="recently-viewed-item" href="detail.html?product=${product.id}">
        <span class="recently-viewed-image" style="background-image:url('${product.image}')" role="img" aria-label="${product.name}"></span>
        <strong>${product.name}</strong><small>${window.LuxRoom.formatMoney(product.price)}, ${product.dimensions.width} × ${product.dimensions.depth} cm</small>
      </a>`).join("");
    section.hidden = false;
  }
  window.LuxRoom.store.set(window.LuxRoom.storeKeys.recentlyViewed, [selectedProduct.id, ...previous].slice(0, 8));
}

function stars(rating) {
  return `<span class="review-meter" style="--rating:${Number(rating).toFixed(1)}" aria-hidden="true"></span>`;
}

function renderReviews() {
  const summary = document.querySelector("#reviews-summary");
  const list = document.querySelector("#reviews-list");
  if (!summary || !list) return;
  const reviews = window.LuxRoom.getReviews(selectedProduct.id);
  if (!reviews.length) {
    summary.innerHTML = `<p><strong>No reviews yet.</strong> Be the first to share how ${window.LuxRoom.escapeHtml(selectedProduct.name)} lives in a room.</p>`;
    list.innerHTML = "";
    return;
  }
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  summary.innerHTML = `<p class="reviews-average">${stars(average)}<strong>${average.toFixed(1)} out of 5</strong><span>${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}</span></p>`;
  list.innerHTML = reviews.map((review) => `
    <article class="review-item">
      <header>${stars(review.rating)}<span class="sr-only">${review.rating} out of 5</span><strong>${window.LuxRoom.escapeHtml(review.title || "Review")}</strong></header>
      <p>${window.LuxRoom.escapeHtml(review.body)}</p>
      <footer>${window.LuxRoom.escapeHtml(review.name)}, ${new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(review.date))}${review.local ? " (your review)" : ""}</footer>
    </article>`).join("");
}

function setupReviews() {
  const form = document.querySelector("#review-form");
  const toggle = document.querySelector("#review-open");
  const status = document.querySelector("#review-status");
  if (!form) return;
  const setReviewStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };
  toggle?.addEventListener("click", () => {
    form.hidden = false;
    toggle.hidden = true;
    toggle.setAttribute("aria-expanded", "true");
    form.querySelector("input[name='rating']")?.focus();
  });
  form.querySelector("#review-cancel")?.addEventListener("click", () => {
    form.hidden = true;
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setReviewStatus("Posting your review…", "loading");
    try {
      await window.LuxRoom.request(() => window.LuxRoom.addReview(selectedProduct.id, data), { label: "Posting your review" });
      form.reset();
      form.hidden = true;
      if (toggle) toggle.hidden = false;
      setReviewStatus("Thank you. Your review is posted.", "success");
      renderReviews();
    } catch (error) {
      setReviewStatus(error.message, "error");
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
}

if (productMissing) {
  renderNotFound();
} else {
  setupFinishes();
  setupSizes();
  setupGallery();
  setupQuantityControls();
  setupAccordions();
  setupPurchaseControls();
  setupDelivery();
  setupReviews();
  renderProductInformation();
  updateVariantDetails();
  renderReviews();
  updateRecentlyViewed();
}