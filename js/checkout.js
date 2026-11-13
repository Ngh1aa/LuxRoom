const checkoutSummaryItems = document.querySelector("#checkout-summary-items");
const checkoutSubtotal = document.querySelector("#checkout-subtotal");
const checkoutShipping = document.querySelector("#checkout-shipping");
const checkoutTotal = document.querySelector("#checkout-total");
const checkoutDiscountRow = document.querySelector("#checkout-discount-row");
const checkoutDiscount = document.querySelector("#checkout-discount");
const checkoutDiscountLabel = document.querySelector("#checkout-discount-label");
const checkoutArrival = document.querySelector("#checkout-arrival");
const checkoutDeliveryLabel = document.querySelector("#checkout-delivery-label");
const checkoutForm = document.querySelector("#checkout-form");
const checkoutAlert = document.querySelector("#checkout-alert");
const placeOrderButton = document.querySelector(".place-order-btn");
const provinceField = document.querySelector("#province");
const accessFields = document.querySelector("#access-fields");
const simulatedPayment = document.querySelector("#simulated-payment");
const deliveryDate = document.querySelector("#delivery-date");
const savedAddressPicker = document.querySelector("#saved-address-picker");
const savedAddressSelect = document.querySelector("#saved-address");
const accountNote = document.querySelector("#checkout-account-note");
const escapeHtml = (value) => window.LuxRoom.escapeHtml(value);

const locationByProvince = {
  "Ho Chi Minh City": "hcm",
  Hanoi: "hanoi",
  "Da Nang": "danang",
  "Other province": "province",
};
const provinceByLocation = Object.fromEntries(Object.entries(locationByProvince).map(([province, location]) => [location, province]));
let placingOrder = false;

function configurationUrl(item) {
  const params = new URLSearchParams({
    product: String(item.productId),
    variant: String(item.variantId),
  });
  if (item.sizeId && item.sizeId !== "std") params.set("size", item.sizeId);
  return `detail.html?${params.toString()}`;
}

function selectedRadioValue(name) {
  return checkoutForm?.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function combinedArrivalWindow(items) {
  const source = items.reduce((slowest, item) => ({
    leadTimeMin: Math.max(slowest.leadTimeMin, Number(item.leadTimeMin)),
    leadTimeMax: Math.max(slowest.leadTimeMax, Number(item.leadTimeMax)),
  }), { leadTimeMin: 0, leadTimeMax: 0 });
  return window.LuxRoom.getArrivalWindow(source);
}

function renderCheckoutSummary() {
  const items = window.LuxRoom.cartItems || [];
  const totals = window.LuxRoom.getCartTotals();
  const arrival = items.length ? combinedArrivalWindow(items) : null;

  if (checkoutSummaryItems) {
    checkoutSummaryItems.innerHTML = items.length
      ? items.map((item) => `
        <div class="summary-item">
          <span class="summary-item-img" style="background-image:url('${escapeHtml(item.image)}')" role="img" aria-label="${escapeHtml(item.name)} in ${escapeHtml(item.finish)}"></span>
          <span class="summary-item-details"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.finish)}${item.sizeLabel && item.sizeLabel !== "One size" ? `, ${escapeHtml(item.sizeLabel)}` : ""}, quantity ${item.quantity}</small><a class="summary-edit-configuration" href="${configurationUrl(item)}">Edit configuration <span aria-hidden="true">↗</span></a></span>
          <span class="summary-item-price">${window.LuxRoom.formatMoney(item.price * item.quantity)}</span>
        </div>`).join("")
      : '<div class="summary-empty"><strong>Nothing selected yet.</strong><p>Your cart is empty, so there is nothing to check out.</p><a href="products.html">Explore pieces <span aria-hidden="true">↗</span></a></div>';
  }

  if (checkoutSubtotal) {
    checkoutSubtotal.textContent = window.LuxRoom.formatMoney(totals.subtotal);
    window.LuxRoomMotion?.flashPrice(checkoutSubtotal);
  }
  if (checkoutDiscountRow) checkoutDiscountRow.hidden = !(totals.discount > 0);
  if (checkoutDiscount) checkoutDiscount.textContent = `−${window.LuxRoom.formatMoney(totals.discount)}`;
  if (checkoutDiscountLabel) checkoutDiscountLabel.textContent = totals.promo ? `Promo ${totals.promo.code}` : "Promo";
  if (checkoutShipping) checkoutShipping.textContent = totals.shipping ? window.LuxRoom.formatMoney(totals.shipping) : "Included";
  if (checkoutTotal) {
    checkoutTotal.textContent = window.LuxRoom.formatMoney(totals.total);
    window.LuxRoomMotion?.flashPrice(checkoutTotal);
  }
  if (checkoutArrival) checkoutArrival.textContent = arrival?.label || "—";
  if (checkoutDeliveryLabel) checkoutDeliveryLabel.textContent = window.LuxRoom.deliveryPreferences.method === "placement" ? "Room delivery + placement" : "Room delivery";
  if (placeOrderButton && !placingOrder) {
    placeOrderButton.disabled = items.length === 0;
    placeOrderButton.innerHTML = items.length ? 'Place demo order <span aria-hidden="true">↗</span>' : "Your selection is empty";
  }

  const roomFee = document.querySelector("#room-delivery-fee");
  const location = window.LuxRoom.deliveryLocations[window.LuxRoom.deliveryPreferences.location];
  if (roomFee) roomFee.textContent = location?.surcharge ? `+${window.LuxRoom.formatMoney(location.surcharge)}` : "Included";
}

function renderDeliveryDates() {
  if (!deliveryDate) return;
  const items = window.LuxRoom.cartItems || [];
  const previous = deliveryDate.value;
  const start = items.length ? combinedArrivalWindow(items).start : new Date();
  const options = [];
  const cursor = new Date(start);
  while (options.length < 8) {
    if (cursor.getDay() !== 0) {
      options.push({
        value: cursor.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short" }).format(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  deliveryDate.innerHTML = '<option value="">Choose a day</option>' + options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("");
  if (options.some((option) => option.value === previous)) deliveryDate.value = previous;
  const hint = document.querySelector("#delivery-slot-hint");
  if (hint) hint.textContent = `Earliest day is ${options[0].label}, once every piece is ready. Sundays are closed. The room team confirms the slot by phone.`;
}

function toggleSimulatedPayment() {
  const simulated = selectedRadioValue("paymentMethod") === "Simulated card payment";
  if (simulatedPayment) simulatedPayment.hidden = !simulated;
  const consent = document.querySelector("#simulated-consent");
  if (consent) consent.required = simulated;
}

function reviewValue(id, fallback = "") {
  return document.querySelector(`#${id}`)?.value.trim() || fallback;
}

function slotLabel() {
  const day = deliveryDate?.selectedOptions?.[0];
  if (!deliveryDate?.value || !day) return "";
  return `${day.textContent}, ${reviewValue("delivery-window")}`;
}

function updateReview() {
  const email = reviewValue("email");
  const phone = reviewValue("phone");
  const fullName = reviewValue("full-name");
  const address = reviewValue("address");
  const ward = reviewValue("ward");
  const district = reviewValue("district");
  const province = reviewValue("province");
  const arrival = (window.LuxRoom.cartItems || []).length ? combinedArrivalWindow(window.LuxRoom.cartItems).label : "—";
  const method = selectedRadioValue("deliveryMethod") === "placement" ? "Room delivery + placement" : "Room delivery";
  const payment = selectedRadioValue("paymentMethod") || "Pay on delivery";

  const contactReview = document.querySelector("#review-contact");
  const addressReview = document.querySelector("#review-address");
  const deliveryReview = document.querySelector("#review-delivery");
  const slotReview = document.querySelector("#review-slot");
  const paymentReview = document.querySelector("#review-payment");
  if (contactReview) contactReview.textContent = email || phone ? [email, phone].filter(Boolean).join(", ") : "Add your email and phone above.";
  if (addressReview) addressReview.textContent = address ? [fullName, address, ward, district, province].filter(Boolean).join(", ") : "Add your delivery address above.";
  if (deliveryReview) deliveryReview.textContent = `${method}. Estimated ${arrival}`;
  if (slotReview) slotReview.textContent = slotLabel() || "Choose a delivery day above.";
  if (paymentReview) paymentReview.textContent = `${payment}. Nothing is charged in this demo.`;
}

let reviewFrame = 0;
function scheduleReview() {
  if (reviewFrame) return;
  reviewFrame = window.requestAnimationFrame(() => {
    reviewFrame = 0;
    updateReview();
  });
}

function syncDeliveryPreference() {
  const method = selectedRadioValue("deliveryMethod") || "room";
  const location = locationByProvince[provinceField?.value] || window.LuxRoom.deliveryPreferences.location;
  window.LuxRoom.updateDeliveryPreferences({ method, location });
  renderCheckoutSummary();
  scheduleReview();
}

function fillAddress(address) {
  if (!address) return;
  const set = (id, value) => { const field = document.querySelector(`#${id}`); if (field && value !== undefined) field.value = value; };
  set("full-name", address.fullName);
  set("address", address.address);
  set("ward", address.ward);
  set("district", address.district);
  if (provinceField && locationByProvince[address.province]) provinceField.value = address.province;
  if (address.phone) set("phone", document.querySelector("#phone")?.value || address.phone);
  clearFieldErrors();
  syncDeliveryPreference();
}

function setupAccount() {
  const user = window.LuxRoom.getCurrentUser();
  if (accountNote) {
    accountNote.innerHTML = user
      ? `<p>Signed in as <strong>${escapeHtml(user.name)}</strong>. This demo order will appear in your <a href="profile.html#orders">order history</a>.</p>`
      : '<p>Checking out as a guest. <a href="auth.html?next=checkout.html">Sign in</a> to use saved addresses and keep the order in your history.</p>';
  }
  if (!user) return;
  const email = document.querySelector("#email");
  const phone = document.querySelector("#phone");
  if (email && !email.value) email.value = user.email;
  if (phone && !phone.value) phone.value = user.phone || "";
  const addresses = window.LuxRoom.listAddresses();
  if (!addresses.length || !savedAddressSelect || !savedAddressPicker) return;
  savedAddressPicker.hidden = false;
  savedAddressSelect.innerHTML = addresses.map((address) => `<option value="${escapeHtml(address.id)}">${escapeHtml(address.label)}: ${escapeHtml(address.address)}, ${escapeHtml(address.province)}${address.isDefault ? " (default)" : ""}</option>`).join("") + '<option value="">Enter a new address</option>';
  const preferred = addresses.find((address) => address.isDefault) || addresses[0];
  savedAddressSelect.value = preferred.id;
  fillAddress(preferred);
  savedAddressSelect.addEventListener("change", () => {
    const chosen = addresses.find((address) => address.id === savedAddressSelect.value);
    if (chosen) fillAddress(chosen);
    else ["full-name", "address", "ward", "district"].forEach((id) => { const field = document.querySelector(`#${id}`); if (field) field.value = ""; });
    scheduleReview();
  });
}

function createOrder() {
  const formData = new FormData(checkoutForm);
  const items = window.LuxRoom.cartItems.map((item) => ({ ...item }));
  const totals = window.LuxRoom.getCartTotals();
  const arrival = combinedArrivalWindow(items);
  const user = window.LuxRoom.getCurrentUser();
  const orderId = `LR-${String(Date.now()).slice(-6)}${Math.floor(Math.random() * 10)}`;
  return {
    id: orderId,
    userId: user?.id || null,
    createdAt: new Date().toISOString(),
    status: "Confirmed",
    demo: true,
    items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, sizeId: item.sizeId, quantity: item.quantity, price: item.price })),
    contact: { email: formData.get("email"), phone: formData.get("phone") },
    address: {
      fullName: formData.get("fullName"),
      address: formData.get("address"),
      province: formData.get("province"),
      district: formData.get("district"),
      ward: formData.get("ward"),
      note: formData.get("deliveryNote"),
    },
    delivery: {
      method: formData.get("deliveryMethod"),
      methodLabel: formData.get("deliveryMethod") === "placement" ? "Room delivery + placement" : "Room delivery",
      slot: slotLabel(),
      elevator: formData.get("elevator"),
      floor: formData.get("floor"),
      accessNotes: formData.get("accessNotes"),
      arrival: arrival.label,
    },
    payment: { method: formData.get("paymentMethod"), charged: false },
    promo: totals.promo?.code || null,
    totals,
    timelineStep: 0,
  };
}

function saveOrder(order) {
  // Stored as "luxroom-orders" / "luxroom-last-order" in sessionStorage via the demo store.
  window.LuxRoom.saveOrderRecord(order);
}

function fieldErrorNode(field) {
  const group = field.closest(".form-group, .consent-check, .choice-group") || field.parentElement;
  let node = group.querySelector(".field-error");
  if (!node) {
    node = document.createElement("p");
    node.className = "field-error";
    node.id = `${field.id || field.name}-error`;
    group.appendChild(node);
  }
  return node;
}

function clearFieldErrors() {
  checkoutForm?.querySelectorAll(".field-error").forEach((node) => node.remove());
  checkoutForm?.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
}

function fieldMessage(field) {
  if (field.validity.valueMissing) {
    if (field.type === "checkbox") return "Confirm that you understand this payment is simulated.";
    const label = checkoutForm.querySelector(`label[for="${field.id}"]`)?.textContent.trim() || "This field";
    return `${label} is required.`;
  }
  if (field.validity.typeMismatch && field.type === "email") return "Enter an email like name@example.com.";
  return field.validationMessage || "Check this field.";
}

function validateCheckout() {
  clearFieldErrors();
  const invalid = Array.from(checkoutForm.querySelectorAll("input, select, textarea")).filter((field) => !field.disabled && !field.closest("[hidden]") && !field.checkValidity());
  invalid.forEach((field) => {
    field.setAttribute("aria-invalid", "true");
    const node = fieldErrorNode(field);
    node.textContent = fieldMessage(field);
    field.setAttribute("aria-describedby", node.id);
  });
  return invalid;
}

function showAlert(message, { retry = false } = {}) {
  if (!checkoutAlert) return;
  checkoutAlert.hidden = false;
  checkoutAlert.innerHTML = `<p>${escapeHtml(message)}</p>${retry ? '<button type="button" class="checkout-retry" id="checkout-retry">Try again</button>' : ""}`;
  checkoutAlert.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideAlert() {
  if (!checkoutAlert) return;
  checkoutAlert.hidden = true;
  checkoutAlert.innerHTML = "";
}

async function placeOrder() {
  if (placingOrder) return;
  if (!window.LuxRoom.cartItems.length) {
    showAlert("Your cart is empty, so there is nothing to order.");
    return;
  }
  const invalid = validateCheckout();
  if (invalid.length) {
    showAlert(`Check ${invalid.length === 1 ? "the highlighted field" : `the ${invalid.length} highlighted fields`} before placing the order.`);
    invalid[0].focus({ preventScroll: false });
    return;
  }
  hideAlert();
  placingOrder = true;
  placeOrderButton.disabled = true;
  placeOrderButton.setAttribute("aria-busy", "true");
  placeOrderButton.textContent = selectedRadioValue("paymentMethod") === "Simulated card payment" ? "Approving simulated payment…" : "Placing demo order…";
  try {
    const order = await window.LuxRoom.request(() => {
      const created = createOrder();
      saveOrder(created);
      window.LuxRoom.clearCart();
      return created;
    }, { label: "Placing the order", delay: 650 });
    window.location.href = `success.html?order=${encodeURIComponent(order.id)}`;
  } catch (error) {
    placingOrder = false;
    placeOrderButton.removeAttribute("aria-busy");
    renderCheckoutSummary();
    showAlert(error.message, { retry: true });
  }
}

if (checkoutForm) {
  const initialProvince = provinceByLocation[window.LuxRoom.deliveryPreferences.location];
  if (provinceField && initialProvince) provinceField.value = initialProvince;
  const selectedMethod = checkoutForm.querySelector(`input[name="deliveryMethod"][value="${window.LuxRoom.deliveryPreferences.method}"]`);
  if (selectedMethod) selectedMethod.checked = true;
  if (accessFields) accessFields.hidden = !(window.LuxRoom.cartItems || []).some((item) => item.oversized);

  checkoutForm.addEventListener("input", scheduleReview);
  checkoutForm.addEventListener("input", (event) => {
    if (event.target.getAttribute("aria-invalid") === "true" && event.target.checkValidity()) {
      event.target.removeAttribute("aria-invalid");
      event.target.closest(".form-group, .consent-check")?.querySelector(".field-error")?.remove();
    }
  });
  checkoutForm.addEventListener("change", (event) => {
    if (event.target.matches('input[name="paymentMethod"]')) toggleSimulatedPayment();
    if (event.target.matches('input[name="deliveryMethod"], #province')) syncDeliveryPreference();
    else scheduleReview();
  });
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    placeOrder();
  });
  checkoutAlert?.addEventListener("click", (event) => {
    if (event.target.closest("#checkout-retry")) placeOrder();
  });
  setupAccount();
}

document.addEventListener("luxroom-cart-updated", () => {
  renderCheckoutSummary();
  renderDeliveryDates();
});

renderDeliveryDates();
toggleSimulatedPayment();
renderCheckoutSummary();
updateReview();
