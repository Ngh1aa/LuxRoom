const MOTION_STYLESHEET = '../css/motion-system-v2.css?v=20260917-2';
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function ensureMotionStylesheet() {
  if (document.querySelector('link[data-luxroom-motion-v2]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL(MOTION_STYLESHEET, import.meta.url).href;
  link.dataset.luxroomMotionV2 = 'true';
  document.head.appendChild(link);
}

function setMotionPreference() {
  document.documentElement.classList.add('lux-motion-v2');
  document.documentElement.dataset.luxroomMotion = reducedMotionQuery.matches ? 'reduced' : 'full';
}

const sectionVariants = [
  ['.home-hero, .collection-hero, .rooms-hero, .story-hero, .auth-essay, .checkout-intro', 'hero'],
  ['.studio, .home-story, .story-image-essay, .contact-grid, .d-gallery', 'split'],
  ['.edited-pieces, .room-edit, .commerce-assurance, .collections, .related-products, .product-grid-masonry, .room-index', 'stagger'],
  ['.newsletter, .newsletter-band, .signup, .cart-assurance, .contact-quiet', 'quiet'],
];

const cardSelectors = [
  '.feature-product',
  '.room-card',
  '.product-card',
  '.discovery-item',
  '.assurance-grid article',
  '.material-triptych article',
  '.order-card',
  '.saved-card',
  '.compare-card',
  '.room-index a',
  '.room-atlas article',
];

function forEachMatch(scope, selector, callback) {
  if (scope instanceof Element && scope.matches(selector)) callback(scope);
  scope.querySelectorAll?.(selector).forEach(callback);
}

function decorateMotion(scope = document) {
  sectionVariants.forEach(([selector, variant]) => {
    forEachMatch(scope, selector, (node) => {
      if (!node.dataset.motionV2) node.dataset.motionV2 = variant;
    });
  });

  forEachMatch(scope, 'main > section', (section) => {
    if (!section.dataset.motionV2) section.dataset.motionV2 = 'quiet';
  });

  cardSelectors.forEach((selector) => {
    forEachMatch(scope, selector, (node) => {
      node.dataset.motionCard = 'true';
    });
  });

  forEachMatch(scope, '.primary-button, .secondary-button, .text-link, .hero-room-link, .view-detail-link, .mini-cart-link, .page-back-link', (node) => {
    node.dataset.motionAction = 'true';
  });

  forEachMatch(scope, 'input, textarea, select', (node) => {
    node.dataset.motionField = 'true';
  });
}

function prepareUnmanagedSections() {
  const reduce = reducedMotionQuery.matches;
  const candidates = Array.from(document.querySelectorAll('main > section'))
    .filter((section) => !section.classList.contains('motion-reveal') && !section.classList.contains('reveal'));

  if (!candidates.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    candidates.forEach((section) => section.classList.add('motion-v2-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('motion-v2-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  candidates.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) section.classList.add('motion-v2-visible');
    else observer.observe(section);
  });
}

function initFinePointerState() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const sync = () => document.documentElement.classList.toggle('lux-fine-pointer', finePointer.matches);
  sync();
  finePointer.addEventListener?.('change', sync);
}

function initScrollState() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  let ticking = false;
  const updateScroll = () => {
    const isScrolled = window.scrollY > 20;
    topbar.classList.toggle('is-scrolled', isScrolled);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });

  updateScroll();
}

function pulseCartBadge() {
  if (reducedMotionQuery.matches) return;
  const badges = document.querySelectorAll('.cart-badge, [data-cart-count]');
  badges.forEach((badge) => {
    badge.classList.remove('has-pulse');
    void badge.offsetWidth;
    badge.classList.add('has-pulse');
    setTimeout(() => badge.classList.remove('has-pulse'), 400);
  });
}

function flashPrice(element) {
  if (!element || reducedMotionQuery.matches) return;
  element.classList.remove('price-flash');
  void element.offsetWidth;
  element.classList.add('price-flash');
  setTimeout(() => element.classList.remove('price-flash'), 550);
}

function crossfadeBackground(element, newUrl) {
  if (!element) return;
  if (reducedMotionQuery.matches) {
    element.style.backgroundImage = `url('${newUrl}')`;
    return;
  }
  element.classList.remove('lux-image-crossfade');
  void element.offsetWidth;
  element.style.backgroundImage = `url('${newUrl}')`;
  element.classList.add('lux-image-crossfade');
  setTimeout(() => element.classList.remove('lux-image-crossfade'), 350);
}

function initMotionSystemV2() {
  ensureMotionStylesheet();
  setMotionPreference();
  decorateMotion();
  prepareUnmanagedSections();
  initFinePointerState();
  initScrollState();

  document.addEventListener('luxroom-cart-updated', () => {
    pulseCartBadge();
  });

  /* Dynamic routes such as Collection, Compare and Saved Room replace subtrees.
     Only decorate the nodes that were actually added; rescanning the whole document
     on every mutation causes avoidable work and competes with route rendering. */
  let decorationFrame = 0;
  const observer = new MutationObserver(() => {
    if (decorationFrame) return;
    decorationFrame = requestAnimationFrame(() => {
      decorationFrame = 0;
      decorateMotion(document);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  reducedMotionQuery.addEventListener?.('change', () => {
    setMotionPreference();
    if (reducedMotionQuery.matches) {
      document.querySelectorAll('main > section').forEach((section) => section.classList.add('motion-v2-visible'));
    }
  });
}

window.LuxRoomMotion = {
  pulseCartBadge,
  flashPrice,
  crossfadeBackground,
  decorateMotion,
};

initMotionSystemV2();
