(() => {
  'use strict';

  if (!document.body.classList.contains('collection-page')) return;

  /*
   * Collection performance guard.
   * products.js intentionally owns filtering/rendering; this layer only prevents
   * high-frequency controls from rebuilding the entire catalogue on every input tick.
   */
  const originalRenderProducts = window.renderProducts;
  if (typeof originalRenderProducts === 'function' && !originalRenderProducts.__luxroomOptimized) {
    let timer = 0;
    let frame = 0;
    let queuedArgs = [];

    const optimizedRenderProducts = function optimizedRenderProducts(...args) {
      queuedArgs = args;
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);

      timer = window.setTimeout(() => {
        frame = window.requestAnimationFrame(() => {
          timer = 0;
          frame = 0;
          originalRenderProducts.apply(window, queuedArgs);
        });
      }, 64);
    };

    optimizedRenderProducts.__luxroomOptimized = true;
    window.renderProducts = optimizedRenderProducts;
  }

  /* Keep the Collection header in the same canonical order as the rest of LuxRoom. */
  const nav = document.querySelector('.topbar .main-nav');
  if (nav) {
    nav.setAttribute('aria-label', 'Main menu');

    const directHome = Array.from(nav.children).find((node) => node.matches?.('a[href*="index.html"]'));
    const shop = nav.querySelector('.nav-shop');
    const rooms = nav.querySelector('.nav-rooms');
    const about = Array.from(nav.children).find((node) => node.matches?.('a[href*="about.html"]'));
    const contact = Array.from(nav.children).find((node) => node.matches?.('a[href*="contact.html"]'));

    /* common.js normally removes Home and builds Shop + Rooms. If that enhancement
       succeeded, enforce one stable order so this route cannot drift visually. */
    if (shop && rooms) {
      directHome?.remove();
      [shop, rooms, about, contact].filter(Boolean).forEach((node) => nav.appendChild(node));
      shop.querySelector(':scope > a')?.classList.add('active');
      rooms.querySelector(':scope > a')?.classList.remove('active');
    }
  }

  document.querySelector('.topbar')?.setAttribute('aria-label', 'Primary navigation');

  /* Large catalogue thumbnails previously created multiple backdrop/filter layers.
     Those layers repaint while scrolling; opaque surfaces keep the same visual intent
     without forcing GPU blur on every card. */
  const style = document.createElement('style');
  style.id = 'luxroom-products-performance';
  style.textContent = `
    .collection-page .product-thumb,
    .collection-page .product-thumb:hover {
      filter: none !important;
    }
    .collection-page .product-card-label,
    .collection-page .wishlist-heart {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      background: color-mix(in srgb, var(--paper) 96%, transparent) !important;
    }
    .collection-page.collection-runtime-stable .product-card.motion-card-enter {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(style);

  window.setTimeout(() => {
    document.body.classList.add('collection-runtime-stable');
  }, 760);
})();
