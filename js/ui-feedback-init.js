import './motion-system-v2.js?v=20260917-livefix1';

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
