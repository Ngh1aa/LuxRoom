(() => {
  const query = new URLSearchParams(window.location.search);
  const userAgent = navigator.userAgent || '';
  const captureMode =
    query.get('figma') === '1' ||
    navigator.webdriver === true ||
    /HeadlessChrome|Playwright|Puppeteer/i.test(userAgent);

  const preloadCache = new Set();
  const preloadImages = [];
  window.__luxroomFigmaPreloads = preloadImages;

  const preload = (source) => {
    if (!source || preloadCache.has(source) || source.startsWith('data:')) return;
    preloadCache.add(source);
    const image = new Image();
    image.decoding = 'sync';
    image.src = source;
    preloadImages.push(image);
  };

  const backgroundUrls = (value) => {
    if (!value || value === 'none') return [];
    return [...value.matchAll(/url\((['"]?)(.*?)\1\)/g)]
      .map((match) => match[2])
      .filter(Boolean);
  };

  const collect = (scope, selector) => {
    const nodes = [];
    if (scope instanceof Element && scope.matches(selector)) nodes.push(scope);
    scope.querySelectorAll?.(selector).forEach((node) => nodes.push(node));
    return nodes;
  };

  const hydrateDataBackgrounds = (scope) => {
    collect(scope, '[data-bg]').forEach((node) => {
      const source = node.dataset.bg;
      if (!source) return;
      node.style.backgroundImage = `url("${source}")`;
      node.dataset.bgLoaded = 'true';
      node.classList.remove('lazy-bg');
      preload(source);
    });
  };

  const hydrateImages = (scope) => {
    const images = [];
    if (scope instanceof HTMLImageElement) images.push(scope);
    scope.querySelectorAll?.('img').forEach((image) => images.push(image));

    images.forEach((image) => {
      if (image.loading === 'lazy' || image.getAttribute('loading') === 'lazy') {
        image.loading = 'eager';
        image.setAttribute('loading', 'eager');
      }
      if (captureMode) image.decoding = 'sync';
      preload(image.currentSrc || image.src);
    });
  };

  const warmComputedBackgrounds = (scope) => {
    const selector = [
      '[role="img"]',
      '[class*="image"]',
      '[class*="img"]',
      '[class*="thumb"]',
      '[class*="visual"]',
      '[class*="media"]',
      '[class*="hero"]',
      '[class*="story"]',
      '[class*="material"]'
    ].join(',');

    collect(scope, selector).forEach((node) => {
      if (!(node instanceof Element)) return;
      backgroundUrls(window.getComputedStyle(node).backgroundImage).forEach(preload);
    });
  };

  const revealForCapture = (scope) => {
    if (!captureMode) return;
    collect(scope, '.reveal, .motion-reveal').forEach((node) => {
      node.classList.add('is-visible', 'visible', 'revealed');
      node.style.setProperty('opacity', '1', 'important');
      node.style.setProperty('transform', 'none', 'important');
      node.style.setProperty('visibility', 'visible', 'important');
      node.style.setProperty('animation', 'none', 'important');
      node.style.setProperty('transition', 'none', 'important');
    });
  };

  const prepare = (scope = document) => {
    hydrateDataBackgrounds(scope);
    hydrateImages(scope);
    warmComputedBackgrounds(scope);
    revealForCapture(scope);
  };

  if (captureMode) {
    document.documentElement.dataset.figmaCapture = 'true';
    const style = document.createElement('style');
    style.setAttribute('data-figma-capture-style', 'true');
    style.textContent = `
      html[data-figma-capture="true"] .reveal,
      html[data-figma-capture="true"] .motion-reveal {
        opacity: 1 !important;
        transform: none !important;
        visibility: visible !important;
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  prepare(document);

  let figmaFrame = 0;
  const observer = new MutationObserver(() => {
    if (figmaFrame) return;
    figmaFrame = requestAnimationFrame(() => {
      figmaFrame = 0;
      prepare(document);
    });
  });

  const startObserver = () => {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true });
    prepare(document.body);
  };

  if (document.body) startObserver();
  else document.addEventListener('DOMContentLoaded', startObserver, { once: true });

  window.addEventListener('load', () => {
    prepare(document);
    requestAnimationFrame(() => requestAnimationFrame(() => prepare(document)));
  }, { once: true });

  window.LuxRoomFigmaCompat = { prepare, captureMode };
})();
