const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-form-status");

function setContactStatus(message, state) {
  if (!contactStatus) return;
  contactStatus.textContent = message;
  contactStatus.dataset.state = state;
}

function markContactErrors() {
  contactForm.querySelectorAll(".field-error").forEach((node) => node.remove());
  const invalid = Array.from(contactForm.querySelectorAll("input, textarea")).filter((field) => !field.checkValidity());
  invalid.forEach((field) => {
    field.setAttribute("aria-invalid", "true");
    const error = document.createElement("p");
    error.className = "field-error";
    error.textContent = field.type === "checkbox"
      ? "Please agree to be contacted about this request."
      : field.validity.typeMismatch ? "Enter an email like name@domain.com." : "This field is required.";
    (field.closest(".form-group") || field.closest(".consent-check"))?.appendChild(error);
  });
  invalid[0]?.focus();
  return invalid.length === 0;
}

async function sendContact() {
  if (!markContactErrors()) {
    setContactStatus("Please complete the highlighted fields before sending your note.", "error");
    return;
  }
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const original = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitButton.textContent = "Sending…";
  setContactStatus("Sending your note…", "loading");
  try {
    const name = contactForm.querySelector("#first_name")?.value.trim();
    await window.LuxRoom.request(() => true, { label: "Sending your note", delay: 550 });
    contactForm.reset();
    setContactStatus(`Thank you${name ? `, ${name}` : ""}. Your note is with the studio. We reply within two working days.`, "success");
    window.LuxRoom.showToast("Your note is with the studio.");
  } catch (error) {
    contactStatus.innerHTML = "";
    contactStatus.dataset.state = "error";
    const message = document.createElement("span");
    message.textContent = `${error.message} Your note is still in the form. `;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "status-retry";
    retry.textContent = "Send again";
    retry.addEventListener("click", sendContact);
    contactStatus.append(message, retry);
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitButton.innerHTML = original;
  }
}

if (contactForm) {
  contactForm.setAttribute("novalidate", "");
  contactForm.addEventListener("input", (event) => {
    event.target.removeAttribute("aria-invalid");
    (event.target.closest(".form-group") || event.target.closest(".consent-check"))?.querySelector(".field-error")?.remove();
  });
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendContact();
  });
}
