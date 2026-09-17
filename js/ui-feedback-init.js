import './motion-system-v2.js?v=20260917-livefix1';

const params = new URLSearchParams(window.location.search);
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isCollectionPage = currentPage === 'products.html';

if (isCollectionPage) {
  /* Collection is the heaviest LuxRoom route. Keep production runtime lean:
     no Figma observer and no feedback-tool observer unless explicitly requested. */
  import('./products-performance.js?v=20260917-1').catch((error) => {
    console.warn('[LuxRoom] Collection performance layer failed to load.', error);
  });

  [
    './navigation-routes.js?v=20260901-rooms',
    './confidence-layer.js?v=20260914-1',
  ].forEach((path) => {
    import(path).catch((error) => {
      console.warn(`[LuxRoom] Optional module failed: ${path}`, error);
    });
  });

  if (params.get('figma') === '1') {
    import('./figma-compat.js?v=20260911-1').catch((error) => {
      console.warn('[LuxRoom] Figma compatibility layer failed to load.', error);
    });
  }

  if (params.get('feedback') === '1') {
    import('../ui-feedback.js?v=4ef8421')
      .then(({ createUIFeedback }) => {
        createUIFeedback({
          storageKey: 'luxroom-ui-feedback',
          githubRepo: 'Ngh1aa/LuxRoom',
        });
      })
      .catch((error) => {
        console.warn('[LuxRoom] UI feedback tool failed to load.', error);
      });
  }
} else {
  const optionalImports = [
    './figma-compat.js?v=20260911-1',
    './navigation-routes.js?v=20260901-rooms',
    './confidence-layer.js?v=20260914-1',
  ];

  optionalImports.forEach((path) => {
    import(path).catch((error) => {
      console.warn(`[LuxRoom] Optional module failed: ${path}`, error);
    });
  });

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
}
