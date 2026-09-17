const cartContainer = document.querySelector("#cart-items-container");
const subtotalNode = document.querySelector("#cart-subtotal");
const shippingNode = document.querySelector("#cart-shipping");
const totalNode = document.querySelector("#cart-total");
const cartCountLabels = document.querySelectorAll(".cart-intro [data-cart-count]");
const continueShopping = document.querySelector(".back-to-edit");
const checkoutLink = document.querySelector(".btn-checkout");
const deliveryLocation = document.querySelector("#cart-delivery-location");

function renderCart() {
  const items = window.LuxRoom.cartItems || [];
  const totals = window.LuxRoom.getCartTotals();

  cartCountLabels.forEach((node) => {
    node.textContent = String(items.reduce((count, item) => count + Number(item.quantity), 0));
    node.style.display = "inline";
  });
  if (subtotalNode) {
    subtotalNode.textContent = window.LuxRoom.formatMoney(totals.subtotal);
    window.LuxRoomMotion?.flashPrice(subtotalNode);
  }
  if (shippingNode) shippingNode.textContent = totals.shipping ? window.LuxRoom.formatMoney(totals.shipping) : "Included";
  if (totalNode) {
    totalNode.textContent = window.LuxRoom.formatMoney(totals.total);
    window.LuxRoomMotion?.flashPrice(totalNode);
  }
  if (deliveryLocation) deliveryLocation.value = window.LuxRoom.deliveryPreferences.location;
  if (checkoutLink) {
    checkoutLink.classList.toggle("is-disabled", items.length === 0);
    checkoutLink.setAttribute("aria-disabled", String(items.length === 0));
  }

  if (!cartContainer) return;
  if (!items.length) {
    cartContainer.innerHTML = '<div class="cart-empty"><strong>Your selection is empty.</strong><p>Explore the collection and keep the pieces that feel right for the room.</p><a href="products.html">Explore pieces <span aria-hidden="true">↗</span></a></div>';
  } else {
    cartContainer.innerHTML = items.map((item) => {
      const arrival = window.LuxRoom.getArrivalWindow(item).label;
      return `<article class="cart-row" data-cart-row="${item.key}">
        <div class="cart-product">
          <div class="cart-product-image" style="background-image:url('${item.image}')" role="img" aria-label="${item.name} in ${item.finish}"></div>
          <div class="cart-product-info"><strong>${item.name}</strong><span>${item.finish} · ${item.material}</span><small>Estimated arrival ${arrival}</small></div>
        </div>
        <div class="cart-qty" aria-label="Quantity for ${item.name}">
          <button type="button" data-cart-decrease="${item.key}" aria-label="Decrease ${item.name}">−</button>
          <span class="cart-qty-value">${item.quantity}</span>
          <button type="button" data-cart-increase="${item.key}" aria-label="Increase ${item.name}">+</button>
        </div>
        <span>${window.LuxRoom.formatMoney(Number(item.price) * Number(item.quantity))}</span>
        <button class="cart-remove" type="button" data-cart-remove="${item.key}" aria-label="Remove ${item.name}">×</button>
      </article>`;
    }).join("");
  }

  if (continueShopping) {
    continueShopping.href = "products.html";
    continueShopping.hidden = false;
    continueShopping.innerHTML = "Continue shopping <span aria-hidden=\"true\">↗</span>";
  }
}

cartContainer?.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-cart-decrease], button[data-cart-increase], button[data-cart-remove]");
  if (!target) return;
  const key = target.dataset.cartDecrease || target.dataset.cartIncrease || target.dataset.cartRemove;
  const item = (window.LuxRoom.cartItems || []).find((entry) => entry.key === key);
  if (!item) return;
  if (target.dataset.cartRemove) window.LuxRoom.updateCartItem(key, 0);
  else window.LuxRoom.updateCartItem(key, target.dataset.cartIncrease ? item.quantity + 1 : item.quantity - 1);
});

deliveryLocation?.addEventListener("change", () => {
  window.LuxRoom.updateDeliveryPreferences({ location: deliveryLocation.value });
});

checkoutLink?.addEventListener("click", (event) => {
  if ((window.LuxRoom.cartItems || []).length === 0) event.preventDefault();
});

document.addEventListener("luxroom-cart-updated", renderCart);
document.addEventListener("luxroom-delivery-updated", renderCart);
renderCart();
