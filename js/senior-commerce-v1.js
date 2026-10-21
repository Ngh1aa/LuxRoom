const SENIOR_STYLE_HREF = 'css/senior-commerce-v1.css?v=20260929';
const CHECKOUT_DRAFT_KEY = 'luxroom-checkout-draft-v2';

function ensureStylesheet() {
  if ([...document.styleSheets].some((sheet) => sheet.href?.includes('senior-commerce-v1.css'))) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = SENIOR_STYLE_HREF;
  link.dataset.luxroomSeniorCommerce = 'true';
  document.head.appendChild(link);
}

function pageName() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function announceAction(message, actionLabel, action) {
  let region = document.querySelector('[data-senior-commerce-status]');
  if (!region) {
    region = document.createElement('div');
    region.className = 'senior-commerce-status';
    region.dataset.seniorCommerceStatus = 'true';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  region.replaceChildren();
  const copy = document.createElement('span');
  copy.textContent = message;
  region.appendChild(copy);
  if (actionLabel && action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = actionLabel;
    button.addEventListener('click', () => {
      action();
      region.remove();
    }, { once: true });
    region.appendChild(button);
  }
  requestAnimationFrame(() => region.classList.add('is-visible'));
  window.clearTimeout(announceAction.timer);
  announceAction.timer = window.setTimeout(() => region.remove(), 6500);
}

function enhancePdpDecisionConfidence() {
  if (pageName() !== 'detail.html') return;
  const facts = document.querySelector('.decision-facts');
  if (!facts || document.querySelector('.senior-decision-panel')) return;

  const panel = document.createElement('section');
  panel.className = 'senior-decision-panel';
  panel.setAttribute('aria-label', 'Purchase decision summary');
  panel.innerHTML = `
    <div class="senior-decision-panel__head">
      <span>Decision summary</span>
      <strong>Before adding this object</strong>
    </div>
    <div class="senior-decision-panel__grid">
      <article><span>01 / Fit</span><strong data-senior-fit>Check dimensions</strong><small>Measure the room and delivery path before quantity.</small></article>
      <article><span>02 / Arrival</span><strong data-senior-arrival>Estimate shown below</strong><small>Destination and service level can change the date.</small></article>
      <article><span>03 / Returns</span><strong data-senior-return>Confirm eligibility</strong><small>Return eligibility is not invented in this prototype; confirm terms before ordering.</small></article>
    </div>`;
  facts.insertAdjacentElement('afterend', panel);

  const sync = () => {
    const fit = document.querySelector('#detail-dimension-summary')?.textContent?.trim();
    const arrival = document.querySelector('#detail-arrival')?.textContent?.trim();
    const stock = document.querySelector('#detail-stock-summary')?.textContent?.trim();
    const fitNode = panel.querySelector('[data-senior-fit]');
    const arrivalNode = panel.querySelector('[data-senior-arrival]');
    const returnNode = panel.querySelector('[data-senior-return]');
    if (fitNode && fit) fitNode.textContent = fit;
    if (arrivalNode && arrival) arrivalNode.textContent = arrival;
    if (returnNode) returnNode.textContent = /made to order|pre-order/i.test(stock || '') ? 'Confirm made-to-order terms' : 'Confirm return eligibility';
  };
  sync();
  const observer = new MutationObserver(sync);
  ['detail-dimension-summary', 'detail-arrival', 'detail-stock-summary'].forEach((id) => {
    const node = document.getElementById(id);
    if (node) observer.observe(node, { childList: true, subtree: true, characterData: true });
  });
}

function enhanceCartRecovery() {
  if (pageName() !== 'cart.html') return;
  const container = document.querySelector('#cart-items-container');
  const checkout = document.querySelector('.btn-checkout');
  if (!container || !window.LuxRoom) return;

  const syncCheckout = () => {
    const empty = !(window.LuxRoom.cartItems || []).length;
    if (!checkout) return;
    if (!checkout.dataset.checkoutHref) checkout.dataset.checkoutHref = checkout.getAttribute('href') || 'checkout.html';
    if (empty) {
      checkout.removeAttribute('href');
      checkout.tabIndex = -1;
      checkout.setAttribute('aria-disabled', 'true');
    } else {
      checkout.setAttribute('href', checkout.dataset.checkoutHref);
      checkout.removeAttribute('tabindex');
      checkout.setAttribute('aria-disabled', 'false');
    }
  };

  const decorateRows = () => {
    container.querySelectorAll('.cart-row[data-cart-row]').forEach((row) => {
      if (row.querySelector('[data-save-for-later]')) return;
      const key = row.dataset.cartRow;
      const item = (window.LuxRoom.cartItems || []).find((entry) => entry.key === key);
      const info = row.querySelector('.cart-product-info');
      if (!item || !info) return;
      const save = document.createElement('button');
      save.type = 'button';
      save.className = 'senior-save-later';
      save.dataset.saveForLater = key;
      save.textContent = 'Save for later';
      save.addEventListener('click', () => {
        if (!window.LuxRoom.isWishlisted(item.productId)) window.toggleWishlist?.(item.productId);
        window.LuxRoom.updateCartItem(item.key, 0);
        announceAction(`${item.name} moved to Saved Room.`, 'Undo', () => {
          window.LuxRoom.addToCart(item.productId, item.quantity, item.variantId);
          if (window.LuxRoom.isWishlisted(item.productId)) window.toggleWishlist?.(item.productId);
        });
      });
      info.appendChild(save);
    });
    syncCheckout();
  };

  container.addEventListener('click', (event) => {
    const remove = event.target.closest('.cart-remove[data-cart-remove]');
    if (!remove) return;
    const item = (window.LuxRoom.cartItems || []).find((entry) => entry.key === remove.dataset.cartRemove);
    if (!item) return;
    queueMicrotask(() => announceAction(`${item.name} removed from your selection.`, 'Undo', () => {
      window.LuxRoom.addToCart(item.productId, item.quantity, item.variantId);
    }));
  }, true);

  const observer = new MutationObserver(decorateRows);
  observer.observe(container, { childList: true, subtree: true });
  document.addEventListener('luxroom-cart-updated', decorateRows);
  decorateRows();
}

function readCheckoutDraft() {
  try { return JSON.parse(localStorage.getItem(CHECKOUT_DRAFT_KEY) || '{}'); } catch { return {}; }
}

function saveCheckoutDraft(form) {
  const values = {};
  new FormData(form).forEach((value, key) => {
    if (key !== 'terms') values[key] = value;
  });
  localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(values));
}

function restoreCheckoutDraft(form) {
  const draft = readCheckoutDraft();
  Object.entries(draft).forEach(([name, value]) => {
    form.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach((field) => {
      if (field.type === 'radio') field.checked = field.value === value;
      else if (field.type !== 'checkbox') field.value = value;
    });
  });
}

function enhanceCheckoutTrust() {
  if (pageName() !== 'checkout.html') return;
  const form = document.querySelector('#checkout-form');
  const payment = document.querySelector('.payment-methods');
  const paymentSection = document.querySelector('#payment-step .form-content');
  const review = document.querySelector('#review-step .form-content');
  if (!form || !payment || !review) return;

  payment.innerHTML = `
    <legend>Payment method</legend>
    <label class="choice-row"><input type="radio" name="paymentMethod" value="Cash on delivery" checked /><span><strong>Cash on delivery</strong><small>Recorded as pending on this device. No live payment is processed.</small></span></label>
    <label class="choice-row"><input type="radio" name="paymentMethod" value="Bank transfer" /><span><strong>Bank transfer</strong><small>Recorded as awaiting transfer. No bank or QR transaction is initiated here.</small></span></label>`;
  document.querySelector('#card-fields')?.remove();

  if (!document.querySelector('.checkout-reality-note')) {
    const note = document.createElement('div');
    note.className = 'checkout-reality-note';
    note.setAttribute('role', 'note');
    note.innerHTML = '<strong>Prototype boundary</strong><p>This checkout stores a local order record in this browser. It does not charge a card, open VNPay, create an account or send the order to fulfilment.</p>';
    paymentSection?.querySelector('.form-heading')?.insertAdjacentElement('afterend', note);
  }

  if (!document.querySelector('#checkout-terms')) {
    const consent = document.createElement('label');
    consent.className = 'senior-checkout-consent';
    consent.innerHTML = '<input id="checkout-terms" name="terms" type="checkbox" required><span>I reviewed the order, delivery details and prototype limitation above.</span>';
    review.appendChild(consent);
  }

  let error = document.querySelector('#senior-checkout-error');
  if (!error) {
    error = document.createElement('p');
    error.id = 'senior-checkout-error';
    error.className = 'senior-checkout-error';
    error.setAttribute('role', 'alert');
    error.tabIndex = -1;
    review.appendChild(error);
  }

  let status = document.querySelector('.senior-draft-status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'senior-draft-status';
    status.setAttribute('role', 'status');
    status.textContent = 'Checkout progress is saved in this browser until the local order is recorded.';
    document.querySelector('#contact-step .form-heading')?.insertAdjacentElement('afterend', status);
  }

  restoreCheckoutDraft(form);
  form.dispatchEvent(new Event('input', { bubbles: true }));

  const persist = () => {
    try {
      saveCheckoutDraft(form);
      status.textContent = 'Progress saved on this device.';
    } catch {
      status.textContent = 'Progress could not be saved. Keep this tab open while completing checkout.';
    }
  };
  form.addEventListener('input', persist);
  form.addEventListener('change', persist);

  form.addEventListener('submit', (event) => {
    if (form.checkValidity()) {
      localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    const invalid = [...form.elements].filter((field) => typeof field.checkValidity === 'function' && !field.checkValidity());
    error.textContent = invalid.length === 1 ? 'Review the highlighted field before continuing.' : `Review ${invalid.length} highlighted fields before continuing.`;
    error.focus();
    invalid[0]?.focus({ preventScroll: false });
  }, true);

  const syncOrderButton = () => {
    const button = document.querySelector('.place-order-btn');
    if (button && !button.disabled) button.textContent = 'Record order on this device ↗';
  };
  syncOrderButton();
  document.addEventListener('luxroom-delivery-updated', syncOrderButton);
  form.addEventListener('change', () => setTimeout(syncOrderButton, 0));
}

export function initSeniorCommerce() {
  ensureStylesheet();
  document.documentElement.dataset.luxroomProductLevel = 'senior-commerce-v1';
  enhancePdpDecisionConfidence();
  enhanceCartRecovery();
  enhanceCheckoutTrust();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSeniorCommerce, { once: true });
else initSeniorCommerce();
