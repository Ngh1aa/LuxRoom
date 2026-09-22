import './motion-system-v2.js?v=20260917-sitewide1';

const params = new URLSearchParams(window.location.search);
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isCollectionPage = currentPage === 'products.html';

/* Keep public production routes lean. Design/debug tooling is opt-in via query
   parameters so Figma/UI-feedback observers cannot affect normal browsing. */
const runtimeImports = [
  './navigation-routes.js?v=20260901-rooms',
  './confidence-layer.js?v=20260914-1',
];

if (isCollectionPage) {
  runtimeImports.push('./products-performance.js?v=20260917-2');
}

runtimeImports.forEach((path) => {
  import(path).catch((error) => {
    console.warn(`[LuxRoom] Optional runtime module failed: ${path}`, error);
  });
});

if (params.get('figma') === '1') {
  import('./figma-compat.js?v=20260922-native-text1').catch((error) => {
    console.warn('[LuxRoom] Figma compatibility layer failed to load.', error);
  });
}

if (params.get('feedback') === '1') {
  const loadFeedback = () => {
    import('../ui-feedback.js?v=4ef8421')
      .then(({ createUIFeedback }) => {
        createUIFeedback({
          storageKey: 'luxroom-ui-feedback',
          githubRepo: 'Ngh1aa/LuxRoom',
        });
      })
      .catch((error) => {
        console.warn('[LuxRoom] UI feedback tool failed to load; product motion remains available.', error);
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadFeedback, { timeout: 2000 });
  } else {
    window.setTimeout(loadFeedback, 1200);
  }
}
