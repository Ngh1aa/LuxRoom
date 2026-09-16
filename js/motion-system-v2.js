const MOTION_STYLESHEET = '../css/motion-system-v2.css?v=20260917-1';
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
  ['.home-hero, .collection-hero, .story-hero, .auth-essay, .checkout-intro', 'hero'],
  ['.studio, .home-story, .story-image-essay, .contact-grid, .d-gallery', 'split'],
  ['.edited-pieces, .room-edit, .commerce-assurance, .collections, .related-products, .product-grid-masonry', 'stagger'],
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
];

function decorateMotion(scope = document) {
  sectionVariants.forEach(([selector, variant]) => {
    scope.querySelectorAll(selector).forEach((node) => {
      if (!node.dataset.motionV2) node.dataset.motionV2 = variant;
    });
  });

  scope.querySelectorAll('main > section').forEach((section) => {
    if (!section.dataset.motionV2) section.dataset.motionV2 = 'quiet';
  });

  cardSelectors.forEach((selector) => {
    scope.querySelectorAll(selector).forEach((node) => {
      node.dataset.motionCard = 'true';
    });
  });

  scope.querySelectorAll('.primary-button, .secondary-button, .text-link, .hero-room-link, .view-detail-link, .mini-cart-link, .page-back-link').forEach((node) => {
    node.dataset.motionAction = 'true';
  });

  scope.querySelectorAll('input, textarea, select').forEach((node) => {
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

function initMotionSystemV2() {
  ensureMotionStylesheet();
  setMotionPreference();
  decorateMotion();
  prepareUnmanagedSections();
  initFinePointerState();

  const observer = new MutationObserver((mutations) => {
    if (!mutations.some((mutation) => mutation.addedNodes.length)) return;
    requestAnimationFrame(() => decorateMotion());
  });
  observer.observe(document.body, { childList: true, subtree: true });

  reducedMotionQuery.addEventListener?.('change', () => {
    setMotionPreference();
    if (reducedMotionQuery.matches) {
      document.querySelectorAll('main > section').forEach((section) => section.classList.add('motion-v2-visible'));
    }
  });
}

initMotionSystemV2();
