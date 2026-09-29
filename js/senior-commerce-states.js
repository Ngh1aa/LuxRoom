/*
 * LuxRoom Senior Commerce State Layer — 2026-09-29
 * Portfolio-grade lifecycle/state proof for the commerce journey.
 * Keeps the production visual language intact while making empty/loading/error/success
 * behavior inspectable and recoverable for recruiters, QA and accessibility review.
 */

const stateParams = new URLSearchParams(window.location.search);
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const requestedState = stateParams.get('state');
const pinnedState = stateParams.get('pin') === '1';
const validStates = new Set(['empty', 'loading', 'error', 'success']);

function ensureCommerceStateStyles() {
  if (document.querySelector('link[data-senior-commerce-states]')) return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'css/senior-commerce-states.css?v=20260929-1';
  stylesheet.dataset.seniorCommerceStates = 'true';
  document.head.appendChild(stylesheet);
}

function clearStateQuery() {
  const next = new URL(window.location.href);
  next.searchParams.delete('state');
  next.searchParams.delete('pin');
  window.history.replaceState({}, '', `${next.pathname}${next.search}${next.hash}`);
}

function normalizeWishlistControls(root = document) {
  root.querySelectorAll('.product-card').forEach((card) => {
    const inner = card.querySelector('.product-card-inner');
    const thumb = card.querySelector('a.product-thumb');
    const heart = card.querySelector('.wishlist-heart[data-wishlist]');
    if (!inner || !thumb || !heart) return;

    let button = heart;
    if (heart.tagName !== 'BUTTON') {
      button = document.createElement('button');
      button.type = 'button';
      button.className = heart.className;
      button.dataset.wishlist = heart.dataset.wishlist;
      button.setAttribute('aria-label', heart.getAttribute('aria-label') || 'Save product');
      button.setAttribute('aria-pressed', heart.getAttribute('aria-pressed') || String(heart.classList.contains('is-wishlisted')));
      heart.remove();
    }

    if (!button.type) button.type = 'button';
    button.removeAttribute('role');
    button.removeAttribute('tabindex');
    button.dataset.seniorNormalized = 'true';
    if (button.parentElement !== inner) inner.append(button);
  });
}

function installWishlistSemanticGuard() {
  const grid = document.querySelector('#product-grid');
  if (!grid) return;
  normalizeWishlistControls(grid);
  let frame = 0;
  const observer = new MutationObserver(() => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      normalizeWishlistControls(grid);
      decorateNaturalEmptyState();
    });
  });
  observer.observe(grid, { childList: true, subtree: true });
}

function stateMarkup(state) {
  if (state === 'loading') {
    return `
      <div class="collection-state collection-state--loading" data-state-evidence="loading" role="status" aria-live="polite">
        <p class="collection-state__sr">Loading collection</p>
        <div class="collection-skeleton-grid" aria-hidden="true">
          ${Array.from({ length: 6 }, (_, index) => `
            <article class="collection-skeleton-card" style="--skeleton-index:${index}">
              <span class="collection-skeleton-media"></span>
              <span class="collection-skeleton-line collection-skeleton-line--title"></span>
              <span class="collection-skeleton-line collection-skeleton-line--meta"></span>
              <span class="collection-skeleton-line collection-skeleton-line--action"></span>
            </article>`).join('')}
        </div>
      </div>`;
  }

  if (state === 'error') {
    return `
      <div class="collection-state collection-state--message collection-state--error" data-state-evidence="error" role="alert">
        <p class="eyebrow">Collection / recoverable error</p>
        <h2>We couldn't refresh the collection.</h2>
        <p>Your filters are still here. Retry the catalogue instead of starting the room search again.</p>
        <button class="clear-filters-btn" type="button" data-collection-retry>Retry collection <span aria-hidden="true">↗</span></button>
        <small>Simulated prototype failure for recovery-state review.</small>
      </div>`;
  }

  if (state === 'empty') {
    return `
      <div class="empty-results collection-state--message" data-state-evidence="empty" role="status">
        <p class="eyebrow">The current selection / empty</p>
        <h2>No objects match this combination.</h2>
        <p>The room is not a dead end. Reset the edit and return to the full collection.</p>
        <button class="clear-filters-btn" type="button" data-collection-reset-state>Reset the edit <span aria-hidden="true">↗</span></button>
      </div>`;
  }

  return '';
}

function productGrid() {
  return document.querySelector('#product-grid');
}

function clearPagination() {
  const pagination = document.querySelector('#pagination-container');
  if (pagination) pagination.innerHTML = '';
}

function renderCollectionState(state, { autoRecover = false } = {}) {
  const grid = productGrid();
  if (!grid || !validStates.has(state) || state === 'success') return;
  grid.dataset.prototypeState = state;
  grid.setAttribute('aria-busy', String(state === 'loading'));
  grid.innerHTML = stateMarkup(state);
  clearPagination();

  if (state === 'loading' && autoRecover) {
    window.clearTimeout(Number(grid.dataset.stateTimer || 0));
    grid.dataset.stateTimer = String(window.setTimeout(() => {
      grid.removeAttribute('data-prototype-state');
      grid.removeAttribute('data-state-timer');
      grid.setAttribute('aria-busy', 'false');
      window.renderProducts?.();
      normalizeWishlistControls(grid);
    }, 360));
  }
}

function decorateNaturalEmptyState() {
  const empty = productGrid()?.querySelector('.empty-results');
  if (!empty) return;
  empty.dataset.stateEvidence = 'empty';
  empty.setAttribute('role', 'status');
}

function ensureSuccessNotice(message, { pinned = false } = {}) {
  const results = document.querySelector('.collection-results');
  const head = document.querySelector('.collection-results-head');
  if (!results || !head) return;

  let notice = results.querySelector('.collection-success-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.className = 'collection-success-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    head.after(notice);
  }

  notice.dataset.stateEvidence = 'success';
  notice.innerHTML = `<span aria-hidden="true">✓</span><p><strong>Added to cart.</strong><small>${message}</small></p><a href="cart.html">Review cart ↗</a>`;
  notice.hidden = false;

  if (!pinned) {
    window.clearTimeout(Number(notice.dataset.hideTimer || 0));
    notice.dataset.hideTimer = String(window.setTimeout(() => {
      notice.hidden = true;
      delete notice.dataset.hideTimer;
    }, 3200));
  }
}

function markPinnedSuccess() {
  const first = document.querySelector('.add-to-cart-action');
  if (!first) return;
  first.classList.add('is-added');
  first.setAttribute('aria-label', 'Product added to cart');
  first.innerHTML = '<span aria-hidden="true">✓</span> Added <span aria-hidden="true">↗</span>';
}

function recoverCollection() {
  clearStateQuery();
  renderCollectionState('loading', { autoRecover: true });
}

function installCollectionInteractions() {
  if (currentPage !== 'products.html') return;
  const grid = productGrid();
  if (!grid) return;

  installWishlistSemanticGuard();
  decorateNaturalEmptyState();

  document.addEventListener('click', (event) => {
    const retry = event.target.closest('[data-collection-retry], [data-collection-reset-state]');
    if (retry) {
      event.preventDefault();
      recoverCollection();
      return;
    }

    const addButton = event.target.closest('.add-to-cart-action[data-product-id]');
    if (addButton) {
      const card = addButton.closest('.product-card');
      const name = card?.querySelector('h3')?.textContent?.trim() || 'Your selected product';
      ensureSuccessNotice(`${name} is ready in your cart. Continue browsing or review delivery details.`, { pinned: false });
      return;
    }

    if (pinnedState || validStates.has(requestedState)) return;
    const filterControl = event.target.closest('.collection-category, .filter-list li, .chip');
    if (filterControl) window.setTimeout(() => renderCollectionState('loading', { autoRecover: true }), 0);
  });

  document.addEventListener('change', (event) => {
    if (pinnedState || validStates.has(requestedState)) return;
    if (event.target.matches('#collection-sort, .range-min, .range-max')) {
      window.setTimeout(() => renderCollectionState('loading', { autoRecover: true }), 0);
    }
  });

  if (requestedState === 'empty') renderCollectionState('empty');
  if (requestedState === 'loading') renderCollectionState('loading', { autoRecover: !pinnedState });
  if (requestedState === 'error') renderCollectionState('error');
  if (requestedState === 'success') {
    window.renderProducts?.();
    normalizeWishlistControls(grid);
    ensureSuccessNotice('Miro Lounge Chair is ready in your cart. This pinned QA state does not mutate stored cart data.', { pinned: true });
    markPinnedSuccess();
  }
}

function checkoutStatusNode() {
  const forms = document.querySelector('.checkout-forms');
  if (!forms) return null;
  let status = forms.querySelector('.checkout-status');
  if (!status) {
    status = document.createElement('div');
    status.className = 'checkout-status';
    status.hidden = true;
    forms.prepend(status);
  }
  return status;
}

function setCheckoutStatus(kind, title, message) {
  const status = checkoutStatusNode();
  if (!status) return;
  status.hidden = false;
  status.className = `checkout-status checkout-status--${kind}`;
  status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  status.setAttribute('aria-live', kind === 'error' ? 'assertive' : 'polite');
  status.innerHTML = `<span class="checkout-status__mark" aria-hidden="true">${kind === 'error' ? '!' : kind === 'loading' ? '…' : '✓'}</span><div><strong>${title}</strong><p>${message}</p></div>`;
}

function fieldLabel(field) {
  if (!field?.id) return field?.name || 'Required field';
  return document.querySelector(`label[for="${CSS.escape(field.id)}"]`)?.textContent?.trim() || field.name || 'Required field';
}

function enhanceCheckoutStates() {
  if (currentPage !== 'checkout.html') return;
  const form = document.querySelector('#checkout-form');
  const submit = document.querySelector('.place-order-btn');
  if (!form || !submit) return;
  const defaultSubmitHtml = submit.innerHTML;
  let invalidTimer = 0;
  let fallbackTimer = 0;

  form.addEventListener('invalid', (event) => {
    const field = event.target;
    field.setAttribute('aria-invalid', 'true');
    window.clearTimeout(invalidTimer);
    invalidTimer = window.setTimeout(() => {
      const invalid = [...form.querySelectorAll(':invalid')].filter((node) => node.matches('input, select, textarea'));
      const labels = invalid.slice(0, 3).map(fieldLabel);
      const remainder = Math.max(0, invalid.length - labels.length);
      const summary = `${labels.join(', ')}${remainder ? ` and ${remainder} more` : ''}`;
      setCheckoutStatus('error', 'Check the highlighted details.', `${summary || 'A required detail'} needs attention. Your entered information has been kept.`);
    }, 0);
  }, true);

  form.addEventListener('input', (event) => {
    const field = event.target.closest('input, select, textarea');
    if (!field) return;
    if (field.checkValidity()) field.removeAttribute('aria-invalid');
  });

  form.addEventListener('submit', (event) => {
    if (form.dataset.seniorSubmitBypass === '1') {
      delete form.dataset.seniorSubmitBypass;
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      localStorage.setItem('luxroom-checkout-probe', '1');
      localStorage.removeItem('luxroom-checkout-probe');
    } catch {
      setCheckoutStatus('error', 'This browser cannot save the order yet.', 'Your checkout details are still on screen. Enable site storage or try again in a standard browsing window.');
      return;
    }

    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    submit.innerHTML = '<span class="checkout-submit-spinner" aria-hidden="true"></span> Placing order…';
    setCheckoutStatus('loading', 'Placing your order…', 'Keeping your delivery, access and payment choice together before confirmation.');

    window.setTimeout(() => {
      form.dataset.seniorSubmitBypass = '1';
      form.requestSubmit(submit);
      fallbackTimer = window.setTimeout(() => {
        if (!document.body.contains(form) || !window.location.pathname.endsWith('checkout.html')) return;
        form.removeAttribute('aria-busy');
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        submit.innerHTML = defaultSubmitHtml;
        setCheckoutStatus('error', 'The order did not complete.', 'Nothing was cleared. Review the details and retry the order when you are ready.');
      }, 1600);
    }, 620);
  }, true);

  window.addEventListener('pagehide', () => window.clearTimeout(fallbackTimer), { once: true });
}

function installStateProofLinks() {
  const addLinks = () => {
    const desk = document.querySelector('.decision-desk');
    if (desk && !desk.querySelector('[data-state-proof-link]')) {
      const link = document.createElement('a');
      link.href = 'recruiter-state-lab.html';
      link.className = 'state-proof-inline';
      link.dataset.stateProofLink = 'true';
      link.innerHTML = '<span>Prototype states</span><strong>Empty · Loading · Error · Success</strong><b aria-hidden="true">↗</b>';
      desk.append(link);
    }

    const workbench = document.querySelector('.collection-workbench');
    if (workbench && !workbench.querySelector('[data-state-proof-link]')) {
      const link = document.createElement('a');
      link.href = 'recruiter-state-lab.html';
      link.className = 'state-proof-workbench-link';
      link.dataset.stateProofLink = 'true';
      link.innerHTML = '<strong>Prototype states</strong><small>Empty · Loading · Error · Success</small><span aria-hidden="true">↗</span>';
      workbench.append(link);
    }
  };

  addLinks();
  let frame = 0;
  const observer = new MutationObserver(() => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      addLinks();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

ensureCommerceStateStyles();
installCollectionInteractions();
enhanceCheckoutStates();
installStateProofLinks();
