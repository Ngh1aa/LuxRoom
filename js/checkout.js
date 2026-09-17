const checkoutSummaryItems = document.querySelector("#checkout-summary-items");
const checkoutSubtotal = document.querySelector("#checkout-subtotal");
const checkoutShipping = document.querySelector("#checkout-shipping");
const checkoutTotal = document.querySelector("#checkout-total");
const checkoutArrival = document.querySelector("#checkout-arrival");
const checkoutDeliveryLabel = document.querySelector("#checkout-delivery-label");
const checkoutForm = document.querySelector("#checkout-form");
const placeOrderButton = document.querySelector(".place-order-btn");
const provinceField = document.querySelector("#province");
const accessFields = document.querySelector("#access-fields");
const cardFields = document.querySelector("#card-fields");

const locationByProvince = {
  "Ho Chi Minh City": "hcm",
  Hanoi: "hanoi",
  "Da Nang": "danang",
  "Other province": "province",
};
const provinceByLocation = Object.fromEntries(Object.entries(locationByProvince).map(([province, location]) => [location, province]));

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
          <span class="summary-item-img" style="background-image:url('${item.image}')" role="img" aria-label="${item.name} in ${item.finish}"></span>
          <span class="summary-item-details"><strong>${item.name}</strong><small>${item.finish} · Qty ${item.quantity}</small></span>
          <span class="summary-item-price">${window.LuxRoom.formatMoney(item.price * item.quantity)}</span>
        </div>`).join("")
      : '<div class="summary-empty"><strong>Nothing selected yet.</strong><a href="products.html">Explore pieces <span aria-hidden="true">↗</span></a></div>';
  }

  if (checkoutSubtotal) {
    checkoutSubtotal.textContent = window.LuxRoom.formatMoney(totals.subtotal);
    window.LuxRoomMotion?.flashPrice(checkoutSubtotal);
  }
  if (checkoutShipping) checkoutShipping.textContent = totals.shipping ? window.LuxRoom.formatMoney(totals.shipping) : "Included";
  if (checkoutTotal) {
    checkoutTotal.textContent = window.LuxRoom.formatMoney(totals.total);
    window.LuxRoomMotion?.flashPrice(checkoutTotal);
  }
  if (checkoutArrival) checkoutArrival.textContent = arrival?.label || "—";
  if (checkoutDeliveryLabel) checkoutDeliveryLabel.textContent = window.LuxRoom.deliveryPreferences.method === "placement" ? "Room delivery + placement" : "Room delivery";
  if (placeOrderButton) {
    placeOrderButton.disabled = items.length === 0;
    placeOrderButton.textContent = items.length ? "Place order ↗" : "Your selection is empty";
  }

  const roomFee = document.querySelector("#room-delivery-fee");
  const location = window.LuxRoom.deliveryLocations[window.LuxRoom.deliveryPreferences.location];
  if (roomFee) roomFee.textContent = location?.surcharge ? `+${window.LuxRoom.formatMoney(location.surcharge)}` : "Included";
}

function toggleCardFields() {
  const useCard = selectedRadioValue("paymentMethod") === "Credit / Debit Card";
  if (cardFields) cardFields.hidden = !useCard;
  cardFields?.querySelectorAll("input").forEach((input) => { input.required = useCard; });
}

function reviewValue(id, fallback = "") {
  return document.querySelector(`#${id}`)?.value.trim() || fallback;
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
  const payment = selectedRadioValue("paymentMethod") || "Bank transfer / QR";

  const contactReview = document.querySelector("#review-contact");
  const addressReview = document.querySelector("#review-address");
  const deliveryReview = document.querySelector("#review-delivery");
  const paymentReview = document.querySelector("#review-payment");
  if (contactReview) contactReview.textContent = email || phone ? [email, phone].filter(Boolean).join(" · ") : "Add your email and phone above.";
  if (addressReview) addressReview.textContent = address ? [fullName, address, ward, district, province].filter(Boolean).join(", ") : "Add your delivery address above.";
  if (deliveryReview) deliveryReview.textContent = `${method} · Estimated ${arrival}`;
  if (paymentReview) paymentReview.textContent = payment;
}

function syncDeliveryPreference() {
  const method = selectedRadioValue("deliveryMethod") || "room";
  const location = locationByProvince[provinceField?.value] || window.LuxRoom.deliveryPreferences.location;
  window.LuxRoom.updateDeliveryPreferences({ method, location });
  renderCheckoutSummary();
  updateReview();
}

function createOrder() {
  const formData = new FormData(checkoutForm);
  const items = window.LuxRoom.cartItems.map((item) => ({ ...item }));
  const totals = window.LuxRoom.getCartTotals();
  const arrival = combinedArrivalWindow(items);
  const orderId = `LR-${String(Date.now()).slice(-6)}`;
  return {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: "Confirmed",
    items,
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
      elevator: formData.get("elevator"),
      floor: formData.get("floor"),
      accessNotes: formData.get("accessNotes"),
      arrival: arrival.label,
    },
    payment: { method: formData.get("paymentMethod") },
    totals,
    timeline: [
      { status: "Confirmed", complete: true },
      { status: items.some((item) => item.stockStatus === "Made to order") ? "In production" : "Processing", complete: false },
      { status: "Quality check", complete: false },
      { status: "Delivery scheduled", complete: false },
      { status: "Out for delivery", complete: false },
      { status: "Delivered", complete: false },
    ],
  };
}

function saveOrder(order) {
  localStorage.setItem("luxroom-last-order", JSON.stringify(order));
  let orders = [];
  try { orders = JSON.parse(localStorage.getItem("luxroom-orders") || "[]"); } catch { orders = []; }
  localStorage.setItem("luxroom-orders", JSON.stringify([order, ...orders].slice(0, 10)));
}

if (checkoutForm) {
  const initialProvince = provinceByLocation[window.LuxRoom.deliveryPreferences.location];
  if (provinceField && initialProvince) provinceField.value = initialProvince;
  const selectedMethod = checkoutForm.querySelector(`input[name="deliveryMethod"][value="${window.LuxRoom.deliveryPreferences.method}"]`);
  if (selectedMethod) selectedMethod.checked = true;
  if (accessFields) accessFields.hidden = !(window.LuxRoom.cartItems || []).some((item) => item.oversized);
  const depositPayment = document.querySelector("#deposit-payment");
  if (depositPayment) depositPayment.hidden = !(window.LuxRoom.cartItems || []).some((item) => item.stockStatus === "Made to order");

  checkoutForm.addEventListener("input", updateReview);
  checkoutForm.addEventListener("change", (event) => {
    if (event.target.matches('input[name="paymentMethod"]')) toggleCardFields();
    if (event.target.matches('input[name="deliveryMethod"], #province')) syncDeliveryPreference();
    updateReview();
  });
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!window.LuxRoom.cartItems.length) return;
    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }
    const order = createOrder();
    saveOrder(order);
    window.LuxRoom.clearCart();
    window.location.href = `success.html?order=${encodeURIComponent(order.id)}`;
  });
}

toggleCardFields();
renderCheckoutSummary();
updateReview();
