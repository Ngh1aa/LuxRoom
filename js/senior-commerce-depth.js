const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const SENSITIVE_FIELD_NAMES = new Set(['cardName', 'cardNumber', 'cardExpiry', 'cardCvc']);
const CHECKOUT_DRAFT_KEY = 'luxroom.checkout-draft.v1';
const ROOM_READINESS_KEY = 'luxroom.room-readiness.v1';

function ensureStyles() {
  if (document.querySelector('link[data-senior-commerce-depth]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './css/senior-commerce-depth.css?v=20260929-1';
  link.dataset.seniorCommerceDepth = 'true';
  document.head.appendChild(link);
}

function safeRead(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}

function safeWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage is progressive enhancement */ }
}

function getCartRiskSummary(items = window.LuxRoom?.cartItems || []) {
  const oversized = items.filter((item) => item.oversized);
  const madeToOrder = items.filter((item) => item.madeToOrder || item.stockStatus === 'Made to order');
  const slowest = items.reduce((max, item) => Math.max(max, Number(item.leadTimeMax || 0)), 0);
  return { oversized, madeToOrder, slowest };
}

function initDetailReadiness() {
  const decisionFacts = document.querySelector('.decision-facts');
  const actions = document.querySelector('.di-actions');
  if (!decisionFacts || !actions || document.querySelector('.senior-readiness-card')) return;

  const state = { measured: false, access: false, ...safeRead(ROOM_READINESS_KEY) };
  const section = document.createElement('section');
  section.className = 'senior-readiness-card';
  section.setAttribute('aria-labelledby', 'room-readiness-title');
  section.innerHTML = `
    <div class="senior-readiness-head">
      <div><span class="object-index">04 / Purchase readiness</span><h2 id="room-readiness-title">Confirm the room, not just the finish.</h2></div>
      <strong class="senior-readiness-status" aria-live="polite"></strong>
    </div>
    <p>Two quick checks reduce the most expensive furniture mistakes. They never block purchase and stay on this device.</p>
    <div class="senior-readiness-checks">
      <label><input type="checkbox" data-readiness="measured"><span><strong>Room measured</strong><small>I checked the product dimensions against the intended space.</small></span></label>
      <label><input type="checkbox" data-readiness="access"><span><strong>Delivery path checked</strong><small>I considered the narrowest doorway, stairs, lift and turns.</small></span></label>
    </div>
    <a href="#dimensions-fit" class="text-link">Review dimensions & access guidance <span aria-hidden="true">↘</span></a>`;
  actions.insertAdjacentElement('beforebegin', section);

  const sync = () => {
    const checked = Number(state.measured) + Number(state.access);
    section.querySelector('.senior-readiness-status').textContent = `${checked}/2 confirmed`;
    section.dataset.state = checked === 2 ? 'ready' : checked === 1 ? 'partial' : 'open';
    safeWrite(ROOM_READINESS_KEY, state);
  };
  section.querySelectorAll('[data-readiness]').forEach((input) => {
    input.checked = Boolean(state[input.dataset.readiness]);
    input.addEventListener('change', () => {
      state[input.dataset.readiness] = input.checked;
      sync();
    });
  });
  sync();
}

function initCartReadiness() {
  const summary = document.querySelector('.order-summary-box');
  if (!summary || document.querySelector('.senior-cart-readiness')) return;
  const panel = document.createElement('section');
  panel.className = 'senior-cart-readiness';
  panel.setAttribute('aria-label', 'Checkout readiness');
  summary.querySelector('.btn-checkout')?.insertAdjacentElement('beforebegin', panel);

  const render = () => {
    const items = window.LuxRoom?.cartItems || [];
    if (!items.length) {
      panel.innerHTML = '<span class="object-index">Before checkout</span><strong>Add a piece to begin.</strong><p>Delivery, access and lead-time checks will appear here.</p>';
      return;
    }
    const risk = getCartRiskSummary(items);
    const location = window.LuxRoom?.deliveryLocations?.[window.LuxRoom?.deliveryPreferences?.location];
    const riskCount = Number(Boolean(risk.oversized.length)) + Number(Boolean(risk.madeToOrder.length));
    panel.innerHTML = `
      <div class="senior-cart-readiness-head"><span class="object-index">Before checkout</span><strong>${riskCount ? `${riskCount} practical check${riskCount > 1 ? 's' : ''}` : 'Ready for delivery review'}</strong></div>
      <ul>
        <li><span>Access</span><b>${risk.oversized.length ? `${risk.oversized.length} oversized object${risk.oversized.length > 1 ? 's' : ''} — confirm lift/doorway at checkout` : 'Standard access questions'}</b></li>
        <li><span>Lead time</span><b>${risk.madeToOrder.length ? `${risk.madeToOrder.length} made-to-order object${risk.madeToOrder.length > 1 ? 's' : ''}` : `Up to ${risk.slowest || '—'} days`}</b></li>
        <li><span>Destination</span><b>${location?.label || 'Current delivery destination'}${location?.surcharge ? ` · ${window.LuxRoom.formatMoney(location.surcharge)} adjustment` : ' · no destination surcharge'}</b></li>
      </ul>`;
  };
  render();
  document.addEventListener('luxroom-delivery-updated', render);
  const list = document.querySelector('#cart-items-container');
  if (list && 'MutationObserver' in window) new MutationObserver(render).observe(list, { childList: true, subtree: true });
}

function serializeCheckoutDraft(form) {
  const draft = {};
  new FormData(form).forEach((value, name) => {
    if (!SENSITIVE_FIELD_NAMES.has(name)) draft[name] = value;
  });
  return draft;
}

function restoreCheckoutDraft(form) {
  const draft = safeRead(CHECKOUT_DRAFT_KEY, {});
  Object.entries(draft).forEach(([name, value]) => {
    if (SENSITIVE_FIELD_NAMES.has(name)) return;
    const fields = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
    fields.forEach((field) => {
      if (field.type === 'radio' || field.type === 'checkbox') field.checked = field.value === value;
      else field.value = value;
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

function initCheckoutRecovery() {
  const form = document.querySelector('#checkout-form');
  if (!form || document.querySelector('.senior-checkout-readiness')) return;

  const intro = document.querySelector('.checkout-intro');
  const readiness = document.createElement('section');
  readiness.className = 'senior-checkout-readiness';
  readiness.setAttribute('aria-label', 'Checkout readiness');
  readiness.innerHTML = `
    <div><span class="object-index">Order readiness</span><strong class="js-readiness-copy">Review required details</strong></div>
    <ol>
      <li data-step="contact"><span>01</span> Contact <b>Open</b></li>
      <li data-step="delivery"><span>02</span> Delivery <b>Open</b></li>
      <li data-step="payment"><span>03</span> Payment <b>Selected</b></li>
      <li data-step="review"><span>04</span> Review <b>Open</b></li>
    </ol>
    <p class="js-checkout-persistence">Progress is saved on this device. Card fields are never stored.</p>`;
  intro?.insertAdjacentElement('afterend', readiness);

  const errorSummary = document.createElement('div');
  errorSummary.className = 'senior-checkout-error-summary';
  errorSummary.setAttribute('role', 'alert');
  errorSummary.setAttribute('tabindex', '-1');
  errorSummary.hidden = true;
  form.prepend(errorSummary);

  const accessNote = document.createElement('div');
  accessNote.className = 'senior-access-risk';
  accessNote.setAttribute('role', 'status');
  document.querySelector('#access-fields')?.appendChild(accessNote);

  restoreCheckoutDraft(form);

  const valid = (selector) => [...form.querySelectorAll(selector)].every((field) => !field.required || field.checkValidity());
  const sync = () => {
    const contactReady = valid('#contact-step input');
    const deliveryReady = valid('#delivery-step input, #delivery-step select');
    const paymentReady = Boolean(form.querySelector('input[name="paymentMethod"]:checked')) && valid('#payment-step input');
    const reviewReady = contactReady && deliveryReady && paymentReady;
    const states = { contact: contactReady, delivery: deliveryReady, payment: paymentReady, review: reviewReady };
    Object.entries(states).forEach(([key, done]) => {
      const node = readiness.querySelector(`[data-step="${key}"]`);
      node?.classList.toggle('is-complete', done);
      const badge = node?.querySelector('b');
      if (badge) badge.textContent = done ? 'Ready' : key === 'payment' ? 'Check' : 'Open';
    });
    readiness.querySelector('.js-readiness-copy').textContent = reviewReady ? 'Ready for final review' : `${Object.values(states).filter(Boolean).length}/4 checkpoints ready`;

    const risk = getCartRiskSummary();
    if (accessNote) {
      if (!risk.oversized.length) accessNote.textContent = 'No oversized access check is required for this selection.';
      else {
        const elevator = form.querySelector('#elevator')?.value;
        const floor = form.querySelector('#floor')?.value;
        const notes = form.querySelector('#access-notes')?.value.trim();
        const unresolved = elevator !== 'Yes' && Number(floor || 0) > 0 && !notes;
        accessNote.dataset.state = unresolved ? 'attention' : 'clear';
        accessNote.textContent = unresolved
          ? 'Access check: this order includes an oversized piece above ground floor without a confirmed elevator. Add stairs/doorway notes so delivery can be planned.'
          : `${risk.oversized.length} oversized object${risk.oversized.length > 1 ? 's' : ''} in this order. Access details will travel with the delivery record.`;
      }
    }
  };

  const save = () => {
    safeWrite(CHECKOUT_DRAFT_KEY, serializeCheckoutDraft(form));
    sync();
  };
  form.addEventListener('input', save);
  form.addEventListener('change', save);
  form.addEventListener('submit', (event) => {
    if (form.checkValidity()) {
      localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      return;
    }
    event.preventDefault();
    const invalid = [...form.querySelectorAll(':invalid')];
    errorSummary.hidden = false;
    errorSummary.innerHTML = `<strong>Complete ${invalid.length} required field${invalid.length === 1 ? '' : 's'} before placing the order.</strong><button type="button">Review the first missing detail</button>`;
    errorSummary.querySelector('button')?.addEventListener('click', () => invalid[0]?.focus(), { once: true });
    errorSummary.focus();
  }, true);
  sync();
}

ensureStyles();
if (currentPage === 'detail.html') initDetailReadiness();
if (currentPage === 'cart.html') initCartReadiness();
if (currentPage === 'checkout.html') initCheckoutRecovery();
