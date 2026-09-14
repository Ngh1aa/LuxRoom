document.addEventListener('DOMContentLoaded', () => {
  const revealItems = [...document.querySelectorAll('.reveal')]
    .filter((item) => item.dataset.luxroomMotionReady !== 'true');

  if (!revealItems.length) return;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const captureMode =
    new URLSearchParams(window.location.search).get('figma') === '1' ||
    document.documentElement.dataset.figmaCapture === 'true' ||
    navigator.webdriver === true ||
    /HeadlessChrome|Playwright|Puppeteer/i.test(navigator.userAgent);

  const revealNow = (item) => {
    item.classList.add('is-visible', 'visible');
  };

  if (reduceMotion || captureMode || !('IntersectionObserver' in window)) {
    revealItems.forEach(revealNow);
    return;
  }

  // `js/common.js` owns the canonical motion system. This observer is now only
  // a compatibility fallback for legacy `.reveal` nodes that were not prepared
  // by that shared runtime, preventing duplicate observers on the same element.
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealNow(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => observer.observe(item));
});
