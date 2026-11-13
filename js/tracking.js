const params = new URLSearchParams(window.location.search);
const requestedOrder = params.get("order");
const content = document.querySelector("#tracking-content");
const empty = document.querySelector("#tracking-empty");
const emptyCopy = document.querySelector("#tracking-empty-copy");
const lookupForm = document.querySelector("#tracking-lookup-form");
const lookupStatus = document.querySelector("#tracking-lookup-status");
const requestPanel = document.querySelector("#tracking-request");
const escapeHtml = (value) => window.LuxRoom.escapeHtml(value);

function ownsOrder(order) {
  if (!order) return false;
  const user = window.LuxRoom.getCurrentUser();
  const last = window.LuxRoom.store.get(window.LuxRoom.storeKeys.lastOrder, null);
  // Guests can open orders placed in this tab; signed-in users can open their own.
  return !order.userId || order.userId === user?.id || last?.id === order.id;
}

function showEmpty(message) {
  if (content) content.hidden = true;
  if (empty) empty.hidden = false;
  if (emptyCopy && message) emptyCopy.textContent = message;
  document.querySelector("#tracking-order-id").textContent = "Order / not found";
  document.querySelector("#tracking-current-status").textContent = "—";
  document.querySelector("#tracking-arrival").textContent = "—";
}

function renderOrder(order) {
  if (empty) empty.hidden = true;
  if (content) content.hidden = false;
  document.title = `LuxRoom | Track ${order.id}`;
  document.querySelector("#tracking-order-id").textContent = `Demo order / ${order.id}`;
  document.querySelector("#tracking-current-status").textContent = order.status;
  document.querySelector("#tracking-arrival").textContent = order.status === "Cancelled" ? "Not scheduled" : order.delivery.arrival;
  document.querySelector("#tracking-delivery").textContent = order.delivery.methodLabel;
  document.querySelector("#tracking-slot").textContent = order.delivery.slot || "To be confirmed by phone";
  document.querySelector("#tracking-payment").textContent = `${order.payment.method}, nothing charged`;
  document.querySelector("#tracking-total").textContent = window.LuxRoom.formatMoney(order.totals.total);
  document.querySelector("#tracking-address").textContent = [order.address.address, order.address.ward, order.address.district, order.address.province].filter(Boolean).join(", ");

  const timeline = document.querySelector("#tracking-timeline");
  timeline.innerHTML = order.timeline.map((step, index) => `
    <li class="${step.complete ? "is-complete" : ""}${step.current ? " is-current" : ""}"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${step.status}</strong><small>${step.complete ? (step.current ? "Current step" : "Complete") : (order.status === "Cancelled" ? "Will not happen, order cancelled" : "We will notify you when this step begins.")}</small></div></li>`).join("");

  const items = document.querySelector("#tracking-items");
  items.innerHTML = order.items.map((item) => `
    <article><span style="background-image:url('${escapeHtml(item.image)}')" role="img" aria-label="${escapeHtml(item.name)}"></span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.finish)}, quantity ${item.quantity}</small></div><em>${window.LuxRoom.formatMoney(item.price * item.quantity)}</em></article>`).join("");

  if (requestPanel) requestPanel.innerHTML = window.LuxRoom.orderRequestMarkup(order);
}

window.LuxRoom.bindOrderRequests(requestPanel, (order) => renderOrder(order));

function loadFromUrl() {
  if (!requestedOrder) {
    const last = window.LuxRoom.store.get(window.LuxRoom.storeKeys.lastOrder, null);
    const order = last ? window.LuxRoom.findOrder(last.id) : null;
    if (order) renderOrder(order);
    else {
      if (content) content.hidden = true;
      document.querySelector("#tracking-order-id").textContent = "Order / look up";
      document.querySelector("#tracking-current-status").textContent = "—";
      document.querySelector("#tracking-arrival").textContent = "—";
    }
    return;
  }
  const order = window.LuxRoom.findOrder(requestedOrder);
  if (order && ownsOrder(order)) renderOrder(order);
  else showEmpty(`There is no demo order ${requestedOrder} you can view in this tab. Look it up with the email used at checkout, or sign in.`);
}

lookupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const orderField = lookupForm.querySelector("#lookup-order");
  const emailField = lookupForm.querySelector("#lookup-email");
  if (!orderField.value.trim() || !emailField.checkValidity() || !emailField.value.trim()) {
    lookupStatus.dataset.state = "error";
    lookupStatus.textContent = "Enter the order number and a valid email address.";
    (orderField.value.trim() ? emailField : orderField).focus();
    return;
  }
  const button = lookupForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  lookupStatus.dataset.state = "loading";
  lookupStatus.textContent = "Looking up the order…";
  try {
    const order = await window.LuxRoom.request(() => window.LuxRoom.findOrder(orderField.value, emailField.value), { label: "The order lookup" });
    if (!order) {
      lookupStatus.dataset.state = "error";
      lookupStatus.textContent = "No order matches that number and email. Check both and try again.";
      showEmpty("No order matches that number and email.");
      return;
    }
    lookupStatus.dataset.state = "success";
    lookupStatus.textContent = `Showing ${order.id}.`;
    window.history.replaceState(null, "", `tracking.html?order=${encodeURIComponent(order.id)}`);
    renderOrder(order);
  } catch (error) {
    lookupStatus.dataset.state = "error";
    lookupStatus.textContent = error.message;
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
});

loadFromUrl();
