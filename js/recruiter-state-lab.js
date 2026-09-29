const STATES = ['empty', 'loading', 'error', 'success'];
const params = new URLSearchParams(window.location.search);
const requested = params.get('state');
const activeState = STATES.includes(requested) ? requested : 'empty';
const frame = document.querySelector('#productFrame');
const stateTitle = document.querySelector('#state-lab-active');
const stateDescription = document.querySelector('#state-lab-description');

const descriptions = {
  empty: 'A filtered collection with a useful recovery path instead of a blank grid.',
  loading: 'A deliberate skeleton state with semantic busy feedback while catalogue content is being refreshed.',
  error: 'A recoverable catalogue failure that preserves user context and exposes a clear retry action.',
  success: 'Immediate add-to-cart confirmation with a next step to review the cart.',
};

function setState(state, { replace = true } = {}) {
  const next = STATES.includes(state) ? state : 'empty';
  document.querySelectorAll('[data-state-option]').forEach((button) => {
    const selected = button.dataset.stateOption === next;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  if (stateTitle) stateTitle.textContent = next.charAt(0).toUpperCase() + next.slice(1);
  if (stateDescription) stateDescription.textContent = descriptions[next];
  if (frame) {
    frame.src = `products.html?state=${encodeURIComponent(next)}&pin=1`;
    frame.title = `LuxRoom collection — ${next} state`;
  }

  const url = new URL(window.location.href);
  url.searchParams.set('state', next);
  url.searchParams.set('pin', '1');
  if (replace) window.history.replaceState({ state: next }, '', `${url.pathname}${url.search}`);
  else window.history.pushState({ state: next }, '', `${url.pathname}${url.search}`);
}

document.querySelectorAll('[data-state-option]').forEach((button) => {
  button.addEventListener('click', () => setState(button.dataset.stateOption, { replace: false }));
});

window.addEventListener('popstate', () => {
  const url = new URL(window.location.href);
  setState(url.searchParams.get('state') || 'empty', { replace: true });
});

setState(activeState);
