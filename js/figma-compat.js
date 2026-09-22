(() => {
  const query = new URLSearchParams(window.location.search);
  const userAgent = navigator.userAgent || '';
  const captureMode =
    query.get('figma') === '1' ||
    navigator.webdriver === true ||
    /HeadlessChrome|Playwright|Puppeteer/i.test(userAgent);
  const editableTextMode =
    query.get('figma') === '1' &&
    query.get('text') !== 'fidelity';

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

  const materializeEditableBackgrounds = (scope) => {
    if (!captureMode) return;

    const selector = [
      '[data-bg]',
      '[role="img"]',
      '[class*="image"]',
      '[class*="img"]',
      '[class*="thumb"]',
      '[class*="visual"]',
      '[class*="media"]'
    ].join(',');

    collect(scope, selector).forEach((node) => {
      if (!(node instanceof Element) || node instanceof HTMLImageElement) return;
      if (node.querySelector(':scope > img[data-figma-export-image="true"]')) return;

      const computed = window.getComputedStyle(node);
      const background = computed.backgroundImage;
      const sources = backgroundUrls(background);
      if (sources.length !== 1 || /gradient\(/i.test(background)) return;

      const source = sources[0];
      if (!source || source.startsWith('data:')) return;

      const image = document.createElement('img');
      image.dataset.figmaExportImage = 'true';
      image.className = 'figma-export-image';
      image.alt = node.getAttribute('aria-label') || '';
      image.loading = 'eager';
      image.decoding = 'sync';
      image.src = source;

      const backgroundSize = computed.backgroundSize.trim();
      image.style.objectFit = backgroundSize === 'contain' ? 'contain' : 'cover';
      image.style.objectPosition = computed.backgroundPosition || '50% 50%';

      if (computed.position === 'static') node.style.position = 'relative';
      node.classList.add('figma-export-surface');
      node.style.setProperty('background-image', 'none', 'important');

      if (node.getAttribute('role') === 'img') {
        node.removeAttribute('role');
        node.removeAttribute('aria-label');
      }

      node.prepend(image);
      preload(source);
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

  const normalizeEditableTypography = (scope) => {
    if (!editableTextMode) return;

    const selector = [
      'h1',
      'h2',
      'h3',
      '.brand',
      '.footer-brand',
      '.luxroom-wordmark'
    ].join(',');

    collect(scope, selector).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const computed = window.getComputedStyle(node);
      if (!computed.fontFamily.toLowerCase().includes('newsreader')) return;

      node.classList.add('figma-native-text-safe');
      node.dataset.figmaOriginalFont = 'Newsreader';

      /*
       * dMaya rasterizes LuxRoom display copy when the heading contains rich
       * inline structure such as <br>, <em> or nested spans. For capture mode,
       * collapse that structure into one plain text node while preserving
       * authored hard line breaks. This deliberately trades rich typography
       * for native Figma editability; production markup is never modified.
       */
      if (!node.dataset.figmaPlainTextNormalized) {
        const exportText = Array.from(node.childNodes)
          .map((child) => child.nodeName === 'BR' ? '\n' : child.textContent || '')
          .join('')
          .replace(/\u00a0/g, ' ')
          .trim();

        if (exportText) {
          node.textContent = exportText;
          node.dataset.figmaPlainTextNormalized = 'true';
          node.style.setProperty('white-space', 'pre-line', 'important');
        }
      }
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
    materializeEditableBackgrounds(scope);
    normalizeEditableTypography(scope);
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

      html[data-figma-capture="true"] .figma-export-surface {
        overflow: hidden;
      }

      html[data-figma-capture="true"] .figma-export-image {
        position: absolute;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        display: block;
        pointer-events: none;
      }

      /*
       * dMaya can rasterize display typography when a web font cannot be
       * recreated as a Figma text primitive. In Figma capture mode we prefer
       * native/editable text over exact display-font fidelity. DM Sans is
       * already used throughout LuxRoom UI copy and imports as native text.
       * Production routes never receive this override.
       */
      html[data-figma-capture="true"] .figma-native-text-safe,
      html[data-figma-capture="true"] .figma-native-text-safe * {
        font-family: "DM Sans", Inter, Arial, sans-serif !important;
        font-style: normal !important;
        font-synthesis: none !important;
        white-space: pre-line !important;
      }

      html[data-figma-capture="true"] h1.figma-native-text-safe,
      html[data-figma-capture="true"] h2.figma-native-text-safe,
      html[data-figma-capture="true"] h3.figma-native-text-safe {
        font-weight: 400 !important;
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

  window.LuxRoomFigmaCompat = {
    prepare,
    captureMode,
    editableTextMode,
    originalDisplayFont: 'Newsreader',
    exportDisplayFont: 'DM Sans',
  };
})();
