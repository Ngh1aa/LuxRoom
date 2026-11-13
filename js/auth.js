const tabLogin = document.querySelector("#tab-login");
const tabRegister = document.querySelector("#tab-register");
const formLogin = document.querySelector("#form-login");
const formRegister = document.querySelector("#form-register");
const formForgot = document.querySelector("#form-forgot");
const forgotOpen = document.querySelector("#forgot-open");
const signedInPanel = document.querySelector("#auth-signed-in");
const nextPage = (() => {
  const next = new URLSearchParams(window.location.search).get("next") || "";
  return /^[a-z-]+\.html(#[a-z-]+)?$/.test(next) ? next : "profile.html";
})();

function setStatus(form, message, state = "") {
  const node = form?.querySelector(".form-status");
  if (!node) return;
  node.textContent = message;
  node.dataset.state = state;
}

function showPanel(panel) {
  [formLogin, formRegister, formForgot].forEach((form) => {
    if (!form) return;
    const active = form === panel;
    form.classList.toggle("active", active);
    form.hidden = !active;
  });
  tabLogin?.classList.toggle("active", panel !== formRegister);
  tabRegister?.classList.toggle("active", panel === formRegister);
  tabLogin?.setAttribute("aria-selected", String(panel !== formRegister));
  tabRegister?.setAttribute("aria-selected", String(panel === formRegister));
  forgotOpen?.setAttribute("aria-expanded", String(panel === formForgot));
}

function fieldsValid(form) {
  form.querySelectorAll(".field-error").forEach((node) => node.remove());
  const invalid = Array.from(form.querySelectorAll("input")).filter((field) => !field.checkValidity());
  invalid.forEach((field) => {
    field.setAttribute("aria-invalid", "true");
    const error = document.createElement("p");
    error.className = "field-error";
    const label = form.querySelector(`label[for="${field.id}"]`)?.textContent.trim() || "This field";
    error.textContent = field.validity.valueMissing
      ? `${label} is required.`
      : field.validity.typeMismatch ? "Enter an email like name@domain.com." : field.validity.tooShort ? "Use at least 8 characters." : field.validationMessage;
    field.closest(".form-group")?.appendChild(error);
  });
  invalid[0]?.focus();
  return invalid.length === 0;
}

async function submitWith(form, button, busyLabel, work, onSuccess) {
  if (!fieldsValid(form)) {
    setStatus(form, "Check the highlighted fields.", "error");
    return;
  }
  const original = button.innerHTML;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = busyLabel;
  setStatus(form, "", "loading");
  try {
    const result = await window.LuxRoom.request(work, { label: busyLabel.replace(/…$/, "") });
    onSuccess(result);
  } catch (error) {
    setStatus(form, error.message, "error");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.innerHTML = original;
  }
}

const continuePanel = document.querySelector("#auth-continue");

function renderContinue() {
  if (!continuePanel) return;
  const returning = window.LuxRoom.getReturningCustomer?.();
  const show = Boolean(returning) && !window.LuxRoom.getCurrentUser();
  continuePanel.hidden = !show;
  if (!show) return;
  continuePanel.querySelector("[data-continue-name]").textContent = returning.name;
  continuePanel.querySelector("[data-continue-email]").textContent = returning.email;
}

document.querySelector("#auth-continue-button")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const original = button.innerHTML;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = "Signing in…";
  try {
    const user = await window.LuxRoom.request(() => window.LuxRoom.continueAsReturningCustomer(), { label: "Signing in" });
    window.LuxRoom.setFlashMessage(`Welcome back, ${user.name.split(" ")[0]}.`);
    window.location.href = nextPage;
  } catch (error) {
    setStatus(formLogin, error.message, "error");
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.innerHTML = original;
  }
});

function renderSignedIn() {
  const user = window.LuxRoom.getCurrentUser();
  renderContinue();
  if (!signedInPanel) return;
  signedInPanel.hidden = !user;
  if (!user) return;
  signedInPanel.innerHTML = `<p>You are signed in as <strong>${window.LuxRoom.escapeHtml(user.name)}</strong> (${window.LuxRoom.escapeHtml(user.email)}).</p><div><a class="primary-button" href="profile.html">Go to your account <span aria-hidden="true">↗</span></a><button type="button" class="secondary-button" id="auth-sign-out">Sign out</button></div>`;
  signedInPanel.querySelector("#auth-sign-out")?.addEventListener("click", () => {
    window.LuxRoom.signOut();
    window.LuxRoom.showToast("You are signed out.");
    renderSignedIn();
  });
}

if (tabLogin && tabRegister && formLogin && formRegister) {
  tabLogin.addEventListener("click", () => showPanel(formLogin));
  tabRegister.addEventListener("click", () => showPanel(formRegister));
  forgotOpen?.addEventListener("click", () => {
    const email = formLogin.querySelector("#login-email")?.value;
    showPanel(formForgot);
    const forgotEmail = formForgot?.querySelector("#forgot-email");
    if (forgotEmail && email && !forgotEmail.value) forgotEmail.value = email;
    forgotEmail?.focus();
  });
  document.querySelector("#forgot-cancel")?.addEventListener("click", () => {
    showPanel(formLogin);
    forgotOpen?.focus();
  });

  [formLogin, formRegister, formForgot].forEach((form) => form?.addEventListener("input", (event) => {
    event.target.removeAttribute("aria-invalid");
    event.target.closest(".form-group")?.querySelector(".field-error")?.remove();
  }));

  formLogin.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(formLogin).entries());
    submitWith(formLogin, formLogin.querySelector("button[type='submit']"), "Signing in…", () => window.LuxRoom.signIn(data.email, data.password), (user) => {
      window.LuxRoom.setFlashMessage(`Welcome back, ${user.name.split(" ")[0]}.`);
      window.location.href = nextPage;
    });
  });

  formRegister.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(formRegister).entries());
    submitWith(formRegister, formRegister.querySelector("button[type='submit']"), "Creating account…", () => window.LuxRoom.signUp(data), (user) => {
      window.LuxRoom.setFlashMessage(`Account created. Welcome, ${user.name.split(" ")[0]}.`);
      window.location.href = nextPage;
    });
  });

  formForgot?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(formForgot).entries());
    submitWith(formForgot, formForgot.querySelector("button[type='submit']"), "Sending…", () => window.LuxRoom.requestPasswordReset(data.email), (result) => {
      setStatus(formForgot, `If an account exists for ${result.email}, a reset link is on its way. Check your inbox in the next few minutes.`, "success");
    });
  });

  if (window.location.hash === "#register") showPanel(formRegister);
  else showPanel(formLogin);
}

renderSignedIn();
