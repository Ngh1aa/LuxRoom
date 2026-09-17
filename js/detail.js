const productQuery = new URLSearchParams(window.location.search).get("product");
const selectedProduct = window.LuxRoom.getProduct(Number(productQuery)) || window.LuxRoom.products[0];
let selectedVariant = selectedProduct.variants[0];
let selectedGallery = selectedVariant.images.slice(0, 3);
let selectedQuantity = 1;

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

function dimensionSummary(product) {
  const { width, depth, height } = product.dimensions;
  return `W ${width} × D ${depth} × H ${height} cm`;
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
  const price = window.LuxRoom.formatMoney(selectedVariant.price);
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
  if (nodes.availability) nodes.availability.textContent = `${selectedVariant.stockStatus} · ${leadTimeLabel(selectedVariant)} · ${selectedVariant.sku}`;
  nodes.finishOptions?.querySelectorAll(".finish-option").forEach((button) => {
    const isActive = button.dataset.variantId === selectedVariant.variantId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
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
  if (nodes.dimensionWidth) nodes.dimensionWidth.textContent = `${selectedProduct.dimensions.width} cm`;
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
      galleryButtons.forEach((item, itemIndex) => item.classList.toggle("is-selected", itemIndex === index));
      if (nodes.specImage) nodes.specImage.style.backgroundImage = `url('./${selectedGallery[index] || selectedGallery[0]}')`;
    });
  });
}

function setupFinishes() {
  if (!nodes.finishOptions) return;
  nodes.finishOptions.innerHTML = selectedProduct.variants.map((variant, index) => `
    <button type="button" class="finish-option${index === 0 ? " active" : ""}" data-variant-id="${variant.variantId}" data-finish="${variant.finish}" aria-pressed="${index === 0}">
      <span class="swatch" style="background:${variant.swatch}" aria-hidden="true"></span>${variant.finish}
    </button>`).join("");
  nodes.finishOptions.addEventListener("click", (event) => {
    const button = event.target.closest(".finish-option[data-variant-id]");
    if (!button) return;
    selectedVariant = window.LuxRoom.getVariant(selectedProduct, button.dataset.variantId);
    renderProductInformation();
    updateVariantDetails();
  });
}

function setupQuantityControls() {
  document.querySelector("#qty-minus")?.addEventListener("click", () => {
    selectedQuantity = Math.max(1, selectedQuantity - 1);
    if (nodes.quantity) nodes.quantity.textContent = String(selectedQuantity);
  });
  document.querySelector("#qty-plus")?.addEventListener("click", () => {
    selectedQuantity += 1;
    if (nodes.quantity) nodes.quantity.textContent = String(selectedQuantity);
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
  window.LuxRoom.addToCart(selectedProduct.id, selectedQuantity, selectedVariant.variantId);
  window.LuxRoom.showToast(`${selectedProduct.name} in ${selectedVariant.finish} added to your selection.`);
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
  try {
    return JSON.parse(localStorage.getItem("luxroom-recently-viewed") || "[]").map(Number);
  } catch {
    return [];
  }
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
        <strong>${product.name}</strong><small>${window.LuxRoom.formatMoney(product.price)} · ${product.dimensions.width} × ${product.dimensions.depth} cm</small>
      </a>`).join("");
    section.hidden = false;
  }
  localStorage.setItem("luxroom-recently-viewed", JSON.stringify([selectedProduct.id, ...previous].slice(0, 8)));
}

setupFinishes();
setupGallery();
setupQuantityControls();
setupAccordions();
setupPurchaseControls();
setupDelivery();
renderProductInformation();
updateVariantDetails();
updateRecentlyViewed();
