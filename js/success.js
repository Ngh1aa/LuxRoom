const requestedId = new URLSearchParams(window.location.search).get("order");
const lastOrder = window.LuxRoom.store.get(window.LuxRoom.storeKeys.lastOrder, null);
const order = requestedId
  ? window.LuxRoom.findOrder(requestedId)
  : (lastOrder ? window.LuxRoom.findOrder(lastOrder.id) : null);

const orderIdNode = document.querySelector("#success-order-id");
const arrivalNode = document.querySelector("#success-arrival");
const deliveryNode = document.querySelector("#success-delivery");
const paymentNode = document.querySelector("#success-payment");
const trackLink = document.querySelector("#track-order-link");
const timeline = document.querySelector("#success-timeline");
const message = document.querySelector(".success-message");

const descriptions = {
  Confirmed: "Your order and delivery details are confirmed.",
  Preparing: "Each selected finish is checked and prepared.",
  "In production": "Your made-to-order piece is with the workshop.",
  "Quality check": "Materials, finish and construction are reviewed.",
  "Delivery scheduled": "The room team confirms your chosen delivery slot.",
  "Out for delivery": "Your objects begin their final journey to the room.",
  Delivered: "Placed with care according to your selected service.",
};

if (order) {
  document.title = `LuxRoom | Order ${order.id}`;
  if (orderIdNode) orderIdNode.textContent = `Order number / ${order.id}`;
  if (arrivalNode) arrivalNode.textContent = order.delivery.slot ? `${order.delivery.slot}` : order.delivery.arrival;
  if (deliveryNode) deliveryNode.textContent = order.delivery.methodLabel;
  if (paymentNode) paymentNode.textContent = `${order.payment.method}, nothing charged online`;
  const note = document.querySelector("#success-demo-note");
  if (note && order.contact?.email) note.innerHTML = `Your order is confirmed. We have sent the details to <strong>${window.LuxRoom.escapeHtml(order.contact.email)}</strong>. No payment has been taken online.`;
  if (trackLink) trackLink.href = `tracking.html?order=${encodeURIComponent(order.id)}`;
  const arrivalLabel = arrivalNode?.previousElementSibling;
  if (arrivalLabel && order.delivery.slot) arrivalLabel.textContent = "Requested slot";
  if (timeline) {
    timeline.innerHTML = order.timeline.map((step, index) => `
      <li class="${step.complete ? "is-complete" : ""}"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${step.status}</strong><p>${descriptions[step.status] || "We will share an update when this step begins."}</p></div></li>`).join("");
  }
} else if (message) {
  document.title = "LuxRoom | Order not found";
  message.innerHTML = `
    <p class="eyebrow" id="success-order-id">Order not found</p>
    <h1>We could not find<br><em>that order.</em></h1>
    <p>${requestedId ? `We could not find order <strong>${window.LuxRoom.escapeHtml(requestedId)}</strong>.` : "There is no recent order to show."} Check the number in your confirmation email, or look the order up with the email used at checkout.</p>
    <div class="success-actions"><a class="primary-button" id="track-order-link" href="tracking.html">Look up an order <span aria-hidden="true">↗</span></a><a class="secondary-button" href="products.html">Return to the collection</a></div>`;
  document.querySelector(".success-note")?.setAttribute("hidden", "");
}
