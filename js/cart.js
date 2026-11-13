const cartContainer = document.querySelector("#cart-items-container");
const subtotalNode = document.querySelector("#cart-subtotal");
const shippingNode = document.querySelector("#cart-shipping");
const totalNode = document.querySelector("#cart-total");
const discountRow = document.querySelector("#cart-discount-row");
const discountNode = document.querySelector("#cart-discount");
const discountLabel = document.querySelector("#cart-discount-label");
const cartCountLabels = document.querySelectorAll(".cart-intro [data-cart-count]");
const continueShopping = document.querySelector(".back-to-edit");
const checkoutLink = document.querySelector(".btn-checkout");
const deliveryLocation = document.querySelector("#cart-delivery-location");
const promoForm = document.querySelector("#promo-form");
const promoInput = document.querySelector("#promo-code");
const promoStatus = document.querySelector("#promo-status");
const promoApplied = document.querySelector("#promo-applied");
const savedSection = document.querySelector("#saved-for-later");
const savedList = document.querySelector("#saved-for-later-items");
const money = (value) => window.LuxRoom.formatMoney(value);
const escapeHtml = (value) => window.LuxRoom.escapeHtml(value);

function configurationUrl(item) {
  const params = new URLSearchParams({
    product: String(item.productId),
    variant: String(item.variantId),
  });
  if (item.sizeId && item.sizeId !== "std") params.set("size", item.sizeId);
  return `detail.html?${params.toString()}`;
}

function itemDescription(item) {
  const parts = [item.finish, item.material];
  if (item.sizeLabel && item.sizeLabel !== "One size") parts.push(`${item.sizeLabel}, W ${item.width} cm`);
  return parts.map(escapeHtml).join(" / ");
}

function setPromoStatus(message, state) {
  if (!promoStatus) return;
  promoStatus.textContent = message;
  promoStatus.dataset.state = state || "";
}

function renderPromo(totals) {
  const stored = window.LuxRoom.store.get(window.LuxRoom.storeKeys.promo, null);
  if (promoApplied) {
    if (stored) {
      const isActive = totals.discount > 0;
      promoApplied.hidden = false;
      promoApplied.innerHTML = `<span><strong>${escapeHtml(stored)}</strong> ${isActive ? `saves ${money(totals.discount)}` : "is saved but does not apply to this cart"}</span><button type="button" id="promo-remove">Remove code</button>`;
    } else {
      promoApplied.hidden = true;
      promoApplied.innerHTML = "";
    }
  }
  if (discountRow) discountRow.hidden = !(totals.discount > 0);
  if (discountNode) discountNode.textContent = `−${money(totals.discount)}`;
  if (discountLabel) discountLabel.textContent = totals.promo ? `Promo ${totals.promo.code}` : "Promo";
}

function renderSavedForLater() {
  if (!savedSection || !savedList) return;
  const saved = window.LuxRoom.savedForLater || [];
  savedSection.hidden = saved.length === 0;
  savedList.innerHTML = saved.map((item) => `
    <article class="saved-later-row" data-saved-row="${escapeHtml(item.key)}">
      <span class="saved-later-image" style="background-image:url('${escapeHtml(item.image)}')" role="img" aria-label="${escapeHtml(item.name)} in ${escapeHtml(item.finish)}"></span>
      <div class="saved-later-copy"><h3>${escapeHtml(item.name)}</h3><p>${itemDescription(item)}</p><p>${money(item.price)} each, quantity ${item.quantity}</p></div>
      <div class="saved-later-actions">
        <button type="button" data-saved-move="${escapeHtml(item.key)}">Move to cart</button>
        <button type="button" data-saved-remove="${escapeHtml(item.key)}" aria-label="Remove ${escapeHtml(item.name)} from saved for later">Remove</button>
      </div>
    </article>`).join("");
}

function renderCart() {
  const items = window.LuxRoom.cartItems || [];
  const totals = window.LuxRoom.getCartTotals();

  cartCountLabels.forEach((node) => {
    node.textContent = String(items.reduce((count, item) => count + Number(item.quantity), 0));
    node.style.display = "inline";
  });
  if (subtotalNode) {
    subtotalNode.textContent = money(totals.subtotal);
    window.LuxRoomMotion?.flashPrice(subtotalNode);
  }
  if (shippingNode) shippingNode.textContent = totals.shipping ? money(totals.shipping) : "Included";
  if (totalNode) {
    totalNode.textContent = money(totals.total);
    window.LuxRoomMotion?.flashPrice(totalNode);
  }
  renderPromo(totals);
  if (deliveryLocation) deliveryLocation.value = window.LuxRoom.deliveryPreferences.location;
  if (checkoutLink) {
    checkoutLink.classList.toggle("is-disabled", items.length === 0);
    checkoutLink.setAttribute("aria-disabled", String(items.length === 0));
  }
  if (promoForm) promoForm.hidden = items.length === 0;

  if (cartContainer) {
    if (!items.length) {
      const savedCount = (window.LuxRoom.savedForLater || []).length;
      cartContainer.innerHTML = `<div class="cart-empty"><strong>Your selection is empty.</strong><p>${savedCount ? "Pieces you saved for later are waiting below." : "Explore the collection and keep the pieces that feel right for the room."}</p><a href="products.html">Explore pieces <span aria-hidden="true">↗</span></a></div>`;
    } else {
      cartContainer.innerHTML = items.map((item) => {
        const arrival = window.LuxRoom.getArrivalWindow(item).label;
        const atMax = item.quantity >= item.maxQuantity;
        const stockNote = item.stockStatus === "In stock" ? `${item.maxQuantity} in stock` : item.stockStatus;
        return `<article class="cart-row cart-item" data-cart-row="${escapeHtml(item.key)}">
        <div class="cart-product cart-item-product">
          <div class="cart-product-image cart-item-image" style="background-image:url('${escapeHtml(item.image)}')" role="img" aria-label="${escapeHtml(item.name)} in ${escapeHtml(item.finish)}"></div>
          <div class="cart-product-info cart-item-info">
            <h3>${escapeHtml(item.name)}</h3>
            <p class="cart-item-variant">${itemDescription(item)}</p>
            <p class="cart-item-meta">Estimated arrival ${arrival}. ${escapeHtml(stockNote)}.</p>
            <div class="cart-item-links">
              <a class="cart-edit-configuration" href="${configurationUrl(item)}">Edit configuration <span aria-hidden="true">↗</span></a>
              <button type="button" class="cart-save-later" data-cart-save="${escapeHtml(item.key)}">Save for later</button>
            </div>
          </div>
        </div>
        <div class="cart-qty cart-item-quantity" role="group" aria-label="Quantity for ${escapeHtml(item.name)}">
          <button type="button" data-cart-decrease="${escapeHtml(item.key)}" aria-label="Decrease ${escapeHtml(item.name)}">−</button>
          <span class="cart-qty-value" aria-live="polite">${item.quantity}</span>
          <button type="button" data-cart-increase="${escapeHtml(item.key)}" aria-label="Increase ${escapeHtml(item.name)}" ${atMax ? 'aria-disabled="true" title="Maximum available quantity"' : ""}>+</button>
        </div>
        <span class="cart-item-total">${money(Number(item.price) * Number(item.quantity))}</span>
        <button class="cart-remove cart-item-remove" type="button" data-cart-remove="${escapeHtml(item.key)}" aria-label="Remove ${escapeHtml(item.name)}">×</button>
      </article>`;
      }).join("");
    }
  }

  renderSavedForLater();

  if (continueShopping) {
    continueShopping.href = "products.html";
    continueShopping.hidden = false;
    continueShopping.innerHTML = "Continue shopping <span aria-hidden=\"true\">↗</span>";
  }
}

cartContainer?.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-cart-decrease], button[data-cart-increase], button[data-cart-remove], button[data-cart-save]");
  if (!target) return;
  const key = target.dataset.cartDecrease || target.dataset.cartIncrease || target.dataset.cartRemove || target.dataset.cartSave;
  const item = (window.LuxRoom.cartItems || []).find((entry) => entry.key === key);
  if (!item) return;
  if (target.dataset.cartSave) {
    window.LuxRoom.moveToSavedForLater(key);
    window.LuxRoom.showToast(`${item.name} saved for later.`);
    return;
  }
  if (target.dataset.cartRemove) {
    window.LuxRoom.updateCartItem(key, 0);
    window.LuxRoom.showToast(`${item.name} removed from your selection.`);
    return;
  }
  if (target.dataset.cartIncrease && item.quantity >= item.maxQuantity) {
    window.LuxRoom.showToast(`Only ${item.maxQuantity} of ${item.name} in ${item.finish} available.`);
    return;
  }
  window.LuxRoom.updateCartItem(key, target.dataset.cartIncrease ? item.quantity + 1 : item.quantity - 1);
});

savedList?.addEventListener("click", (event) => {
  const move = event.target.closest("button[data-saved-move]");
  const remove = event.target.closest("button[data-saved-remove]");
  if (move) {
    const item = window.LuxRoom.moveSavedToCart(move.dataset.savedMove);
    if (item) window.LuxRoom.showToast(`${item.name} moved back to your selection.`);
  } else if (remove) {
    window.LuxRoom.removeSavedForLater(remove.dataset.savedRemove);
    window.LuxRoom.showToast("Removed from saved for later.");
  }
});

promoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = promoForm.querySelector("button[type='submit']");
  const code = promoInput?.value || "";
  try {
    window.LuxRoom.validatePromoCode(code);
  } catch (error) {
    setPromoStatus(error.message, "error");
    promoInput?.setAttribute("aria-invalid", "true");
    promoInput?.focus();
    return;
  }
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = "Checking…";
  setPromoStatus("Checking the code…", "loading");
  try {
    const promo = await window.LuxRoom.request(() => window.LuxRoom.applyPromoCode(code), { label: "Applying the promo code" });
    setPromoStatus(`${promo.code} applied: ${promo.label}.`, "success");
    promoInput?.removeAttribute("aria-invalid");
    promoForm.reset();
  } catch (error) {
    setPromoStatus(error.message, "error");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent = "Apply";
  }
});

promoInput?.addEventListener("input", () => {
  promoInput.removeAttribute("aria-invalid");
  if (promoStatus?.dataset.state === "error") setPromoStatus("", "");
});

promoApplied?.addEventListener("click", (event) => {
  if (!event.target.closest("#promo-remove")) return;
  window.LuxRoom.removePromoCode();
  setPromoStatus("Promo code removed.", "");
});

deliveryLocation?.addEventListener("change", () => {
  window.LuxRoom.updateDeliveryPreferences({ location: deliveryLocation.value });
});

checkoutLink?.addEventListener("click", (event) => {
  if ((window.LuxRoom.cartItems || []).length === 0) {
    event.preventDefault();
    window.LuxRoom.showToast("Add a piece to your selection before checkout.");
  }
});

document.addEventListener("luxroom-cart-updated", renderCart);
document.addEventListener("luxroom-delivery-updated", renderCart);
renderCart();
