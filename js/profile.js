/* Profile: order history, cancel / return requests, profile edit and address book. */
const app = window.LuxRoom;
const escapeHtml = (value) => app.escapeHtml(value);
const signedOut = document.querySelector("#profile-signed-out");
const greeting = document.querySelector("#profile-greeting");
const orderList = document.querySelector("#order-list");
const profileForm = document.querySelector("#profile-form");
const profileStatus = document.querySelector("#profile-status");
const addressList = document.querySelector("#address-list");
const addressForm = document.querySelector("#address-form");
const addressStatus = document.querySelector("#address-status");
const addressAdd = document.querySelector("#address-add");

function setStatus(node, message, state = "") {
  if (!node) return;
  node.textContent = message;
  node.dataset.state = state;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function statusClass(status) {
  if (status === "Delivered") return "status-delivered";
  if (status === "Cancelled" || status === "Return requested") return "status-closed";
  return "status-processing";
}

function orderCard(order) {
  const title = order.items.length === 1 ? order.items[0].name : `${order.items.length} objects for the room`;
  return `<article class="order-card" data-order-id="${escapeHtml(order.id)}">
    <header class="order-header"><div><span class="order-date">${formatDate(order.createdAt)} / ${escapeHtml(order.id)}</span><h3>${escapeHtml(title)}</h3></div><span class="order-status ${statusClass(order.status)}">${escapeHtml(order.status)}</span></header>
    <div class="order-items">${order.items.map((item) => `<div class="item-summary"><span>${escapeHtml(item.name)}, ${escapeHtml(item.finish)} / ${String(item.quantity).padStart(2, "0")}</span><span>${app.formatMoney(item.price * item.quantity)}</span></div>`).join("")}</div>
    <footer class="order-footer"><a class="view-detail-link" href="tracking.html?order=${encodeURIComponent(order.id)}">Track order <span aria-hidden="true">↗</span></a><strong>Total ${app.formatMoney(order.totals.total)}</strong></footer>
    <div class="order-card__request">${app.orderRequestMarkup(order)}</div>
  </article>`;
}

async function renderOrders() {
  if (!orderList) return;
  orderList.setAttribute("aria-busy", "true");
  orderList.innerHTML = '<div class="state-loading" role="status"><span class="state-loading__bar" aria-hidden="true"></span><p>Loading your orders…</p></div>';
  try {
    const orders = await app.request(() => app.listOrders(), { label: "Loading your orders", delay: 380 });
    orderList.innerHTML = orders.length
      ? orders.map(orderCard).join("")
      : '<div class="state-empty"><strong>No orders yet.</strong><p>When you place a demo order while signed in, it appears here with tracking and cancel options.</p><a class="text-link" href="products.html">Explore the collection <span aria-hidden="true">↗</span></a></div>';
  } catch (error) {
    orderList.innerHTML = `<div class="state-error" role="alert"><strong>Your orders did not load.</strong><p>${escapeHtml(error.message)}</p><button type="button" class="secondary-button" id="orders-retry">Try again</button></div>`;
  } finally {
    orderList.removeAttribute("aria-busy");
  }
}

function fillProfile(user) {
  if (!profileForm || !user) return;
  profileForm.elements.name.value = user.name || "";
  profileForm.elements.email.value = user.email || "";
  profileForm.elements.phone.value = user.phone || "";
  profileForm.elements.preferences.value = user.preferences || "";
}

function renderAddresses() {
  if (!addressList) return;
  const addresses = app.listAddresses();
  addressList.innerHTML = addresses.length
    ? addresses.map((address) => `<article class="address-card" data-address-id="${escapeHtml(address.id)}">
        <header><strong>${escapeHtml(address.label)}</strong>${address.isDefault ? '<span class="address-default">Default</span>' : ""}</header>
        <p>${escapeHtml(address.fullName)}${address.phone ? `, ${escapeHtml(address.phone)}` : ""}<br>${escapeHtml(address.address)}<br>${escapeHtml(address.ward)}, ${escapeHtml(address.district)}, ${escapeHtml(address.province)}</p>
        <div class="address-card__actions">
          <button type="button" data-address-edit="${escapeHtml(address.id)}">Edit</button>
          ${address.isDefault ? "" : `<button type="button" data-address-default="${escapeHtml(address.id)}">Make default</button>`}
          <button type="button" data-address-delete="${escapeHtml(address.id)}" aria-label="Delete ${escapeHtml(address.label)} address">Delete</button>
        </div>
      </article>`).join("")
    : '<div class="state-empty"><strong>No saved addresses.</strong><p>Add one to fill checkout in a single step.</p></div>';
}

function openAddressForm(address = null) {
  if (!addressForm) return;
  addressForm.reset();
  addressForm.hidden = false;
  addressForm.querySelectorAll(".field-error").forEach((node) => node.remove());
  addressForm.querySelector("#address-form-title").textContent = address ? `Edit ${address.label}` : "New address";
  addressForm.elements.id.value = address?.id || "";
  if (address) {
    ["label", "fullName", "phone", "address", "ward", "district", "province"].forEach((key) => { addressForm.elements[key].value = address[key] || ""; });
    addressForm.elements.isDefault.checked = address.isDefault;
  } else {
    const user = app.getCurrentUser();
    addressForm.elements.fullName.value = user?.name || "";
    addressForm.elements.phone.value = user?.phone || "";
  }
  if (addressAdd) addressAdd.hidden = true;
  addressForm.elements.label.focus();
}

function closeAddressForm() {
  if (!addressForm) return;
  addressForm.hidden = true;
  if (addressAdd) {
    addressAdd.hidden = false;
    addressAdd.focus();
  }
}

function markInvalid(form) {
  form.querySelectorAll(".field-error").forEach((node) => node.remove());
  const invalid = Array.from(form.querySelectorAll("input, select, textarea")).filter((field) => !field.checkValidity());
  invalid.forEach((field) => {
    field.setAttribute("aria-invalid", "true");
    const error = document.createElement("p");
    error.className = "field-error";
    error.textContent = field.validity.typeMismatch ? "Enter a valid email address." : `${form.querySelector(`label[for="${field.id}"]`)?.textContent.trim() || "This field"} is required.`;
    field.closest(".form-group")?.appendChild(error);
  });
  invalid[0]?.focus();
  return invalid.length === 0;
}

function renderAccount() {
  const user = app.getCurrentUser();
  document.querySelectorAll("[data-requires-account]").forEach((node) => { node.hidden = !user; });
  if (signedOut) signedOut.hidden = Boolean(user);
  if (!user) {
    if (greeting) greeting.innerHTML = "Your<br><em>account.</em>";
    return;
  }
  if (greeting) greeting.innerHTML = `Welcome back,<br><em>${escapeHtml(user.name.split(" ")[0])}.</em>`;
  fillProfile(user);
  renderAddresses();
  renderOrders();
}

orderList?.addEventListener("click", (event) => {
  if (event.target.closest("#orders-retry")) renderOrders();
});
app.bindOrderRequests(orderList, () => renderOrders());

profileForm?.addEventListener("input", (event) => event.target.removeAttribute("aria-invalid"));
profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!markInvalid(profileForm)) {
    setStatus(profileStatus, "Check the highlighted fields.", "error");
    return;
  }
  const button = profileForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  setStatus(profileStatus, "Saving…", "loading");
  try {
    const data = Object.fromEntries(new FormData(profileForm).entries());
    const user = await app.request(() => app.updateProfile(data), { label: "Saving your details" });
    setStatus(profileStatus, "Details saved.", "success");
    if (greeting) greeting.innerHTML = `Welcome back,<br><em>${escapeHtml(user.name.split(" ")[0])}.</em>`;
  } catch (error) {
    setStatus(profileStatus, error.message, "error");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
});

addressAdd?.addEventListener("click", () => openAddressForm());
document.querySelector("#address-cancel")?.addEventListener("click", closeAddressForm);

addressList?.addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-address-edit]");
  const makeDefault = event.target.closest("[data-address-default]");
  const remove = event.target.closest("[data-address-delete]");
  if (edit) {
    openAddressForm(app.listAddresses().find((address) => address.id === edit.dataset.addressEdit));
    return;
  }
  if (makeDefault) {
    try {
      await app.request(() => app.setDefaultAddress(makeDefault.dataset.addressDefault), { label: "Updating the default address" });
      setStatus(addressStatus, "Default address updated.", "success");
      renderAddresses();
    } catch (error) {
      setStatus(addressStatus, error.message, "error");
    }
    return;
  }
  if (remove) {
    if (remove.dataset.confirming !== "true") {
      remove.dataset.confirming = "true";
      remove.textContent = "Confirm delete";
      setStatus(addressStatus, "Press Confirm delete to remove this address.", "warning");
      return;
    }
    remove.disabled = true;
    try {
      const removed = await app.request(() => app.deleteAddress(remove.dataset.addressDelete), { label: "Deleting the address" });
      setStatus(addressStatus, `${removed.label} address deleted.`, "success");
      renderAddresses();
    } catch (error) {
      remove.disabled = false;
      setStatus(addressStatus, error.message, "error");
    }
  }
});

addressForm?.addEventListener("input", (event) => event.target.removeAttribute("aria-invalid"));
addressForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!markInvalid(addressForm)) {
    setStatus(addressStatus, "Complete the highlighted address fields.", "error");
    return;
  }
  const data = Object.fromEntries(new FormData(addressForm).entries());
  data.isDefault = addressForm.elements.isDefault.checked;
  const button = addressForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  setStatus(addressStatus, "Saving the address…", "loading");
  try {
    const saved = await app.request(() => app.saveAddress(data), { label: "Saving the address" });
    setStatus(addressStatus, `${saved.label} address saved.`, "success");
    closeAddressForm();
    renderAddresses();
  } catch (error) {
    setStatus(addressStatus, error.message, "error");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
});

document.querySelector("#sign-out")?.addEventListener("click", () => {
  app.signOut();
  app.setFlashMessage("You are signed out. Your cart stays in this tab.");
  window.location.href = "auth.html";
});

document.querySelectorAll(".profile-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".profile-nav a").forEach((item) => item.classList.toggle("active", item === link));
  });
});

renderAccount();
