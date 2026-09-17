import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFile(resolve(root, path), "utf8");

const files = {
  css: await read("css/motion-system-v2.css"),
  js: await read("js/motion-system-v2.js"),
  productsJs: await read("js/products.js"),
  detailJs: await read("js/detail.js"),
  cartJs: await read("js/cart.js"),
  checkoutJs: await read("js/checkout.js"),
  packageJson: await read("package.json"),
};

const checks = [
  // Motion Tokens
  ["Motion token: micro duration defined", files.css.includes("--motion-micro: 130ms;")],
  ["Motion token: fast duration defined", files.css.includes("--motion-fast: 190ms;")],
  ["Motion token: standard duration defined", files.css.includes("--motion-standard: 280ms;")],
  ["Motion token: section duration defined", files.css.includes("--motion-section: 480ms;")],
  ["Motion token: image duration defined", files.css.includes("--motion-image: 650ms;")],
  ["Motion token: ease-spring defined", files.css.includes("--motion-ease-spring:")],
  ["Motion token: ease-enter defined", files.css.includes("--motion-ease-enter:")],
  ["Motion token: distance scale defined", files.css.includes("--motion-distance-xs:") && files.css.includes("--motion-distance-lg:")],

  // Hero Choreography
  ["Hero: image reveal scale 1.035", files.css.includes("transform: scale(1.035);")],
  ["Hero: staggered delays for copy elements", files.css.includes("transition-delay: 50ms;") && files.css.includes("transition-delay: 190ms;")],

  // Navigation & Scroll State
  ["Navigation: adaptive is-scrolled state defined", files.css.includes(".topbar.is-scrolled")],
  ["Navigation: scroll handler in motion JS", files.js.includes("function initScrollState()")],
  ["Navigation: rAF-debounced scroll listener", files.js.includes("window.requestAnimationFrame(updateScroll)")],

  // Tactile Controls & Swatches
  ["Tactile: primary/secondary button active press", files.css.includes(".primary-button:active") && files.css.includes("scale(.99)")],
  ["Tactile: cart quantity button active press", files.css.includes(".cart-qty button:active")],
  ["Tactile: swatch selector active ring & scale", files.css.includes(".finish-option.active .swatch")],
  ["Tactile: filter chip active press", files.css.includes(".chip:active") || files.css.includes(".filter-chip:active")],

  // Cart Badge Pulse
  ["Cart: badge pulse keyframe animation", files.css.includes("@keyframes luxCartPulse")],
  ["Cart: cart-updated event hook", files.js.includes("luxroom-cart-updated")],
  ["Cart: pulseCartBadge method exposed", files.js.includes("pulseCartBadge")],

  // Transitions & Staggers
  ["Catalog: staggered product card enter keyframes", files.css.includes("@keyframes luxGridCardEnter")],
  ["Catalog: refreshProductGridMotion applies stagger", files.productsJs.includes("motion-card-enter")],
  ["Auth: tab crossfade enter keyframes", files.css.includes("@keyframes luxAuthTabEnter")],
  ["PDP: image crossfade animation", files.css.includes("@keyframes luxImageCrossfade")],
  ["Feedback: price flash highlight keyframes", files.css.includes("@keyframes luxPriceFlash")],
  ["Tracking: order status pulse keyframes", files.css.includes("@keyframes luxStatusPulse")],

  // Detail Page Hooks
  ["Detail: image crossfade on gallery update", files.detailJs.includes("crossfadeBackground")],
  ["Detail: price flash on variant update", files.detailJs.includes("flashPrice")],
  ["Detail: cart pulse on add-to-cart", files.detailJs.includes("pulseCartBadge")],

  // Cart & Checkout Hooks
  ["Cart: price flash on totals update", files.cartJs.includes("flashPrice")],
  ["Checkout: price flash on totals update", files.checkoutJs.includes("flashPrice")],

  // Utility Export
  ["Utility: window.LuxRoomMotion exported", files.js.includes("window.LuxRoomMotion =")],

  // Accessibility & Reduced Motion
  ["A11y: prefers-reduced-motion media query present", files.css.includes("@media (prefers-reduced-motion: reduce)")],
  ["A11y: reduced-motion disables animations", files.css.includes("animation: none !important;")],
  ["A11y: reduced-motion resets duration to instant", files.css.includes("transition-duration: .01ms !important;")],
  ["A11y: reduced-motion ensures elements are 100% visible", files.css.includes("opacity: 1 !important;") && files.css.includes("transform: none !important;")],
  ["A11y: JS checks reduced motion query", files.js.includes("matchMedia('(prefers-reduced-motion: reduce)')")],
];

const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL: ${name}`);
  throw new Error(`${failed.length} motion-upgrade QA checks failed.`);
}

console.log(`Motion-upgrade QA passed: ${checks.length} assertions verified.`);
