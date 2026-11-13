// End-to-end test for the LuxRoom demo store (no backend; user data in sessionStorage).
//
// Covers: catalogue (filters, sort, search, pagination, loading + recoverable error),
// product detail (finish, size, stock cap, delivery estimate, reviews, not-found),
// compare, wishlist, saved rooms CRUD, cart (quantity, remove, promo valid / invalid /
// expired / minimum, save for later), checkout (validation, delivery slot, simulated
// payment, failed request + retry, success with order number), tracking + lookup,
// cancel / return requests, auth (sign up, sign in, sign out, forgot password),
// profile edit, address CRUD, contact form, "Reset demo data", and a sweep of every
// site page at 1440px and 390px for console errors and href="#".
//
// Usage:
//   py -3 -m http.server 8923 --bind 127.0.0.1 --directory dist
//   NODE_PATH=<playwright node_modules> node qa/e2e-full-prototype.mjs [--base http://127.0.0.1:8923]
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base');
const BASE = (baseIndex >= 0 ? args[baseIndex + 1] : 'http://127.0.0.1:8923').replace(/\/$/, '');
const SITE_PAGES = [
  'index.html', 'products.html', 'collection.html', 'rooms.html', 'detail.html', 'compare.html',
  'cart.html', 'checkout.html', 'success.html', 'tracking.html', 'wishlist.html', 'saved-room.html',
  'auth.html', 'profile.html', 'about.html', 'contact.html',
];
// The python static server occasionally refuses a connection under load. That is transport
// noise, not an application error, so a page showing it is reloaded once before judging.
const TRANSPORT_NOISE = /net::ERR_(CONNECTION_REFUSED|CONNECTION_RESET|EMPTY_RESPONSE)/;

let passed = 0;
const failures = [];
const consoleErrors = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function step(name, fn) {
  const started = Date.now();
  try {
    await fn();
    passed += 1;
    console.log(`  ok  ${name} (${Date.now() - started}ms)`);
  } catch (error) {
    failures.push({ name, error: error.message.split('\n')[0] });
    console.log(`  FAIL ${name}: ${error.message.split('\n')[0]}`);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(8000);
let currentErrors = [];
page.on('pageerror', (error) => currentErrors.push(`pageerror: ${error.message}`));
page.on('console', (message) => { if (message.type() === 'error') currentErrors.push(`console: ${message.text()}`); });
page.on('dialog', (dialog) => { currentErrors.push(`unexpected dialog: ${dialog.message()}`); dialog.dismiss(); });

// Navigation that tolerates the static server refusing a connection under load.
async function go(route, { reload = false } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      if (reload) await page.reload({ waitUntil: 'load' });
      else await page.goto(`${BASE}/${route}`, { waitUntil: 'load' });
      return;
    } catch (error) {
      if (attempt >= 4 || !TRANSPORT_NOISE.test(error.message) && !/interrupted by another navigation/.test(error.message)) throw error;
      await page.waitForTimeout(500 * attempt);
    }
  }
}

async function visit(route) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    currentErrors = [];
    await go(route);
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    if (!currentErrors.some((entry) => TRANSPORT_NOISE.test(entry)) || attempt === 3) break;
  }
  const appErrors = currentErrors.filter((entry) => !TRANSPORT_NOISE.test(entry));
  if (appErrors.length) consoleErrors.push(...appErrors.map((entry) => `${route}: ${entry}`));
  const deadHash = await page.locator('a[href="#"]').count();
  assert(deadHash === 0, `${route} has ${deadHash} href="#" links`);
}

const text = (selector) => page.locator(selector).first().innerText();
const session = (key) => page.evaluate((storageKey) => JSON.parse(sessionStorage.getItem(storageKey) || 'null'), key);
const armFailure = async () => {
  await page.locator('[data-demo-fail]').click();
  await page.waitForSelector('[data-demo-fail][aria-pressed="true"]');
};
const toast = (pattern) => page.waitForFunction((source) => Array.from(document.querySelectorAll('.toast-msg')).some((node) => new RegExp(source).test(node.textContent)), pattern.source);

console.log(`LuxRoom e2e against ${BASE}`);

await step('seed: first visit copies the data file into sessionStorage only', async () => {
  await visit('index.html');
  assert(await session('luxroom-seeded'), 'store was not seeded');
  const orders = await session('luxroom-orders');
  assert(orders.length === 2, `expected 2 seeded orders, found ${orders?.length}`);
  const local = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('luxroom-') && key !== 'luxroom-ui-feedback'));
  assert(local.length === 0, `user data leaked to localStorage: ${local.join(', ')}`);
});

await step('catalogue: loading skeleton then 9 cards and pagination', async () => {
  await go('products.html');
  await page.waitForSelector('.catalogue-loading, .product-card');
  await page.waitForSelector('#product-grid .product-card');
  assert(await page.locator('#product-grid .product-card').count() === 9, 'page 1 should show 9 cards');
  await page.locator('#pagination-container button[aria-label="Page 2"]').click();
  await page.waitForSelector('#pagination-container button.active[aria-label="Page 2"]');
  assert(await page.locator('#product-grid .product-card').count() === 8, 'page 2 should show 8 cards');
});

await step('catalogue: category filter, sort and room filter', async () => {
  await page.locator('.collection-category[data-category="Seating"]').click();
  await page.waitForSelector('.collection-category[data-category="Seating"][aria-pressed="true"]');
  const seating = await page.locator('#product-grid .product-card').count();
  assert(seating === 5, `Seating should show 5 cards, got ${seating}`);
  await page.selectOption('#collection-sort', 'price-asc');
  await page.waitForFunction(() => {
    const prices = Array.from(document.querySelectorAll('#product-grid .product-card .price')).map((node) => Number(node.textContent.replace(/\D/g, '')));
    return prices.length > 1 && prices.every((price, index) => index === 0 || prices[index - 1] <= price);
  });
  await page.locator('[data-filter-group="room"] li[data-filter-value="Dining"]').click();
  await page.waitForFunction(() => document.querySelectorAll('#product-grid .product-card').length === 1);
  assert((await text('#product-grid .product-card h3')) === 'Audo Dining Chair', 'Dining seating should be Audo Dining Chair');
  await page.locator('.clear-filters-chip').click();
  await page.waitForFunction(() => document.querySelectorAll('#product-grid .product-card').length === 9);
});

await step('catalogue: search with results and with the empty state', async () => {
  await page.fill('#collection-search-input', 'oak bed');
  await page.waitForFunction(() => document.querySelectorAll('#product-grid .product-card').length === 1);
  assert((await text('#product-grid .product-card h3')) === 'Rilo Oak Bed', 'search should find Rilo Oak Bed');
  assert(page.url().includes('search=oak'), 'search should be reflected in the URL');
  await page.fill('#collection-search-input', 'velvet piano');
  await page.waitForSelector('#product-grid .empty-results');
  assert((await text('#product-grid .empty-results')).includes('velvet piano'), 'empty state should name the query');
  await page.locator('#product-grid .clear-filters-btn').click();
  await page.waitForFunction(() => document.querySelectorAll('#product-grid .product-card').length === 9);
});

await step('catalogue: simulated failure shows a recoverable error', async () => {
  await armFailure();
  await go(null, { reload: true });
  await page.waitForSelector('#product-grid .catalogue-error');
  assert((await text('#product-grid .catalogue-error')).includes('did not load'), 'error copy missing');
  await page.locator('#catalogue-retry').click();
  await page.waitForSelector('#product-grid .product-card');
});

await step('product detail: finish and size update price, URL and dimensions', async () => {
  await visit('detail.html?product=8');
  await page.waitForSelector('#size-options .size-option');
  assert(await page.locator('#size-options .size-option').count() === 3, 'sofa should offer 3 sizes');
  await page.locator('#finish-options .finish-option[data-variant-id="8-2"]').click();
  await page.waitForSelector('#finish-options .finish-option[data-variant-id="8-2"][aria-pressed="true"]');
  await page.locator('#size-options .size-option[data-size-id="grand"]').click();
  await page.waitForSelector('#size-options .size-option[data-size-id="grand"][aria-pressed="true"]');
  assert((await text('#detail-price')) === '$320', `grand size in finish 2 should be $320, got ${await text('#detail-price')}`);
  assert(page.url().includes('variant=8-2') && page.url().includes('size=grand'), 'URL should keep variant and size');
  assert((await text('#detail-dimension-summary')).includes('W 290'), 'dimensions should reflect the grand width');
  assert((await text('#detail-arrival')).startsWith('Estimated'), 'delivery estimate missing');
  await page.selectOption('#detail-delivery-location', 'hanoi');
  await page.waitForFunction(() => document.querySelector('#detail-delivery-type').textContent.includes('$20'));
});

await step('product detail: stock caps the quantity and add to cart keeps the size', async () => {
  await visit('detail.html?product=12');
  await page.waitForSelector('#detail-stock-note');
  assert((await text('#detail-stock-note')).includes('Only 3 left'), 'low stock note expected for Dune Loveseat');
  await page.locator('#qty-plus').click();
  await page.locator('#qty-plus').click();
  await page.waitForSelector('#qty-plus[aria-disabled="true"]');
  await page.locator('#qty-plus').click({ force: true });
  await toast(/Only 3 available/);
  assert((await text('#qty-value')) === '3', 'quantity should cap at the 3 in stock');
  await page.locator('#size-options .size-option[data-size-id="compact"]').click();
  await page.locator('#add-to-cart').click();
  await page.waitForSelector('#added-confirmation:not([hidden])');
  const cart = await session('luxroom-cart-items');
  assert(cart.some((item) => item.productId === 12 && item.sizeId === 'compact' && item.quantity === 3), 'cart should hold 3 compact Dune Loveseats');
});

await step('product detail: reviews list, validation and new review', async () => {
  await visit('detail.html?product=1');
  await page.waitForSelector('#reviews-list .review-item');
  assert(await page.locator('#reviews-list .review-item').count() === 2, 'Miro should have 2 seeded reviews');
  await visit('detail.html?product=9');
  await page.waitForSelector('#reviews-summary');
  assert((await text('#reviews-summary')).includes('No reviews yet'), 'empty reviews state missing');
  await page.locator('#review-open').click();
  await page.locator('#review-form button[type="submit"]').click();
  await page.waitForSelector('#review-status[data-state="error"]');
  await page.locator('#review-form input[name="rating"][value="4"]').check();
  await page.fill('#review-name', 'QA Reviewer');
  await page.fill('#review-title', 'Solid little table');
  await page.fill('#review-body', 'Sturdy, the oil finish is lovely and it fits beside the sofa.');
  await page.locator('#review-form button[type="submit"]').click();
  await page.waitForSelector('#reviews-list .review-item');
  assert((await text('#reviews-summary')).includes('4.0 out of 5'), 'average should update to 4.0');
});

await step('product detail: unknown product shows the not-found state', async () => {
  await visit('detail.html?product=999');
  await page.waitForSelector('.detail-not-found');
  assert((await page.title()).includes('not found'), 'title should say not found');
});

await step('compare: add two pieces, remove one, then empty state', async () => {
  await go('products.html');
  await page.waitForSelector('#product-grid [data-compare-product="1"]');
  await page.locator('#product-grid [data-compare-product="1"]').click();
  await page.waitForSelector('#product-grid [data-compare-product="1"][aria-pressed="true"]');
  await page.locator('#product-grid [data-compare-product="3"]').click();
  await page.waitForSelector('#product-grid [data-compare-product="3"][aria-pressed="true"]');
  await visit('compare.html');
  await page.waitForSelector('.compare-product-head');
  assert(await page.locator('.compare-product-head').count() === 2, 'compare should show 2 products');
  await page.locator('[data-remove-compare="1"]').click();
  await page.waitForFunction(() => document.querySelectorAll('.compare-product-head').length === 1);
  await page.locator('[data-remove-compare="3"]').click();
  await page.waitForSelector('#compare-grid .confidence-empty');
});

await step('wishlist: save from the collection, view, remove to empty state', async () => {
  await go('products.html');
  await page.waitForSelector('#product-grid [data-wishlist="5"]');
  await page.locator('#product-grid [data-wishlist="5"]').click();
  await page.waitForSelector('#product-grid [data-wishlist="5"].is-wishlisted');
  await visit('wishlist.html');
  await page.waitForSelector('#wishlist-grid .product-card');
  assert((await text('#wishlist-grid .product-card h3')) === 'Silo Writing Desk', 'wishlist should hold the desk');
  await page.locator('[data-remove-wishlist="5"]').click();
  await page.waitForSelector('#wishlist-empty', { state: 'visible' });
});

await step('saved rooms: create, validate, rename, add and remove a piece, delete', async () => {
  await visit('saved-room.html');
  await page.waitForSelector('.saved-rooms-tab');
  assert(await page.locator('.saved-rooms-tab').count() === 1, 'one seeded room expected');
  await page.locator('#room-create-form button[type="submit"]').click();
  await page.waitForSelector('#room-status[data-state="error"]');
  await page.fill('#room-create-name', 'Guest bedroom');
  await page.selectOption('#room-create-type', 'Bedroom');
  await page.locator('#room-create-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelectorAll('.saved-rooms-tab').length === 2);
  assert((await text('.saved-rooms-tab[aria-pressed="true"]')).includes('Guest bedroom'), 'new room should be active');
  await page.fill('#room-rename-name', 'Guest suite');
  await page.locator('#room-rename-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('.saved-rooms-tab[aria-pressed="true"]')?.textContent.includes('Guest suite'));
  await go('products.html');
  await page.waitForSelector('#product-grid [data-save-room-product="15"]', { timeout: 8000 }).catch(async () => {
    await page.locator('#pagination-container button[aria-label="Page 2"]').click();
    await page.waitForSelector('#product-grid [data-save-room-product="15"]');
  });
  await page.locator('#product-grid [data-save-room-product="15"]').click();
  await toast(/saved to Guest suite/);
  await visit('saved-room.html');
  await page.waitForSelector('#saved-room-items .saved-room-item');
  assert((await text('#saved-room-items .saved-room-item h2')) === 'Softline Linen Throw', 'throw should be in Guest suite');
  await page.locator('[data-remove-room-product="15"]').click();
  await page.waitForSelector('#saved-room-items .confidence-empty');
  await page.locator('#room-delete').click();
  await page.waitForSelector('#room-delete[data-confirming="true"]');
  await page.locator('#room-delete').click();
  await page.waitForFunction(() => document.querySelectorAll('.saved-rooms-tab').length === 1);
  assert((await text('.saved-rooms-tab[aria-pressed="true"]')).includes('Living room'), 'Living room should be active again');
});

await step('cart: quantity, remove, save for later and move back', async () => {
  await page.evaluate(() => { window.LuxRoom.clearCart(); window.LuxRoom.addToCart(9, 1, '9-1'); window.LuxRoom.addToCart(13, 2, '13-1'); });
  await visit('cart.html');
  await page.waitForSelector('#cart-items-container .cart-row');
  assert(await page.locator('#cart-items-container .cart-row').count() === 2, 'two lines expected');
  // The PDP step chose Hanoi (+$20); deliver to Ho Chi Minh City so delivery is included.
  await page.selectOption('#cart-delivery-location', 'hcm');
  await page.waitForFunction(() => document.querySelector('#cart-shipping')?.textContent === 'Included');
  await page.locator('[data-cart-increase="9:9-1"]').click();
  await page.waitForFunction(() => document.querySelector('[data-cart-row="9:9-1"] .cart-qty-value')?.textContent === '2');
  await page.locator('[data-cart-decrease="9:9-1"]').click();
  await page.waitForFunction(() => document.querySelector('[data-cart-row="9:9-1"] .cart-qty-value')?.textContent === '1');
  await page.locator('[data-cart-save="13:13-1"]').click();
  await page.waitForSelector('#saved-for-later [data-saved-row="13:13-1"]');
  assert(await page.locator('#cart-items-container .cart-row').count() === 1, 'lamp should leave the cart');
  await page.locator('[data-saved-move="13:13-1"]').click();
  await page.waitForSelector('[data-cart-row="13:13-1"]');
  await page.waitForSelector('#saved-for-later', { state: 'hidden' });
  await page.locator('[data-cart-remove="13:13-1"]').click();
  await page.waitForFunction(() => !document.querySelector('[data-cart-row="13:13-1"]'));
  assert((await text('#cart-total')) === '$460', `total should be $460, got ${await text('#cart-total')}`);
});

await step('cart: promo codes (invalid, expired, minimum not met, valid, removed)', async () => {
  await page.fill('#promo-code', 'NOPE');
  await page.locator('#promo-form button[type="submit"]').click();
  await page.waitForSelector('#promo-status[data-state="error"]');
  assert((await text('#promo-status')).includes('not a valid'), 'invalid code message');
  await page.fill('#promo-code', 'summer24');
  await page.locator('#promo-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#promo-status').textContent.includes('expired'));
  await page.fill('#promo-code', 'STUDIO50');
  await page.locator('#promo-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#promo-status').textContent.includes('$500'));
  await page.fill('#promo-code', 'WELCOME10');
  await page.locator('#promo-form button[type="submit"]').click();
  await page.waitForSelector('#promo-status[data-state="success"]');
  await page.waitForSelector('#cart-discount-row:not([hidden])');
  assert((await text('#cart-discount')) === '−$46', `10% of $460 should be −$46, got ${await text('#cart-discount')}`);
  assert((await text('#cart-total')) === '$414', 'total should drop to $414');
  await page.locator('#promo-remove').click();
  await page.waitForSelector('#cart-discount-row', { state: 'hidden' });
  await page.fill('#promo-code', 'WELCOME10');
  await page.locator('#promo-form button[type="submit"]').click();
  await page.waitForSelector('#cart-discount-row:not([hidden])');
});

let guestOrderId = '';
await step('checkout: validation, delivery slot, simulated payment, failure then retry', async () => {
  await visit('checkout.html');
  await page.waitForSelector('#checkout-summary-items .summary-item');
  assert(!(await page.locator('#card-number').count()), 'no card number field may exist');
  await page.locator('.place-order-btn').click();
  await page.waitForSelector('#checkout-alert:not([hidden])');
  assert(await page.locator('.field-error').count() >= 5, 'required fields should show inline errors');
  await page.fill('#email', 'guest@example.com');
  await page.fill('#phone', '+84 912 000 111');
  await page.fill('#full-name', 'Guest Tester');
  await page.fill('#address', '9 Le Loi');
  await page.selectOption('#province', 'Hanoi');
  await page.fill('#district', 'Hoan Kiem');
  await page.fill('#ward', 'Trang Tien');
  const firstDay = await page.locator('#delivery-date option').nth(1).getAttribute('value');
  await page.selectOption('#delivery-date', firstDay);
  await page.selectOption('#delivery-window', 'Afternoon, 13:00–17:00');
  await page.locator('input[name="paymentMethod"][value="Simulated card payment"]').check();
  await page.waitForSelector('#simulated-payment:not([hidden])');
  await page.locator('.place-order-btn').click();
  await page.waitForSelector('#simulated-consent[aria-invalid="true"]');
  await page.locator('#simulated-consent').check();
  await page.waitForFunction(() => document.querySelector('#review-slot').textContent.includes('Afternoon'));
  assert((await text('#checkout-discount')) === '−$46', 'promo should carry into checkout');
  await armFailure();
  await page.locator('.place-order-btn').click();
  await page.waitForSelector('#checkout-retry');
  assert((await text('#checkout-alert')).includes('did not go through'), 'failure message expected');
  assert((await session('luxroom-cart-items')).length === 1, 'cart must be untouched after a failed order');
  await Promise.all([page.waitForURL(/success\.html\?order=LR-/), page.locator('#checkout-retry').click()]);
  await page.waitForSelector('#success-order-id');
  guestOrderId = new URL(page.url()).searchParams.get('order');
  assert((await text('#success-order-id')).includes(guestOrderId), 'success page should show the order number');
  assert((await text('#success-demo-note')).includes('no payment was taken'), 'success must say no payment was taken');
  assert((await session('luxroom-cart-items')).length === 0, 'cart should be empty after ordering');
});

await step('tracking: follow the order, cancel it', async () => {
  await Promise.all([page.waitForURL(/tracking\.html\?order=/), page.locator('#track-order-link').click()]);
  await page.waitForSelector('#tracking-timeline li');
  assert((await text('#tracking-order-id')).includes(guestOrderId), 'tracking should show the order');
  assert((await text('#tracking-slot')).includes('Afternoon'), 'slot should be shown');
  await page.locator('[data-order-request-open]').click();
  await page.locator('.order-request__form select').selectOption('Delivery timing does not work');
  await page.locator('.order-request__confirm').click();
  await page.waitForFunction(() => document.querySelector('#tracking-current-status').textContent === 'Cancelled');
  await page.waitForSelector('.order-request-state');
});

await step('tracking: lookup not found and found by number + email', async () => {
  await visit('tracking.html');
  await page.fill('#lookup-order', 'LR-000000');
  await page.fill('#lookup-email', 'nobody@example.com');
  await page.locator('#tracking-lookup-form button[type="submit"]').click();
  await page.waitForSelector('#tracking-lookup-status[data-state="error"]');
  await page.waitForSelector('#tracking-empty:not([hidden])');
  await page.fill('#lookup-order', 'lr-demo-0115');
  await page.fill('#lookup-email', 'demo@luxroom.com');
  await page.locator('#tracking-lookup-form button[type="submit"]').click();
  await page.waitForSelector('#tracking-content:not([hidden])');
  assert((await text('#tracking-order-id')).includes('LR-DEMO-0115'), 'seeded order should be found');
});

await step('auth: forgot password, wrong password, duplicate sign-up', async () => {
  await visit('auth.html');
  await page.locator('#forgot-open').click();
  await page.waitForSelector('#form-forgot.active');
  await page.locator('#form-forgot button[type="submit"]').click();
  await page.waitForSelector('#form-forgot .field-error');
  await page.fill('#forgot-email', 'demo@luxroom.com');
  await page.locator('#form-forgot button[type="submit"]').click();
  await page.waitForSelector('#forgot-status[data-state="success"]');
  assert((await text('#forgot-status')).includes('does not send email'), 'forgot password must be honest about the demo');
  await page.locator('#forgot-cancel').click();
  await page.fill('#login-email', 'demo@luxroom.com');
  await page.fill('#login-password', 'wrong-password');
  await page.locator('#form-login button[type="submit"]').click();
  await page.waitForSelector('#login-status[data-state="error"]');
  await page.locator('#tab-register').click();
  await page.fill('#reg-name', 'Second Demo');
  await page.fill('#reg-email', 'demo@luxroom.com');
  await page.fill('#reg-password', 'longenough');
  await page.locator('#form-register button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#register-status').textContent.includes('already exists'));
});

await step('auth: sign up, land on profile, sign out', async () => {
  await page.fill('#reg-email', 'new.customer@example.com');
  await Promise.all([page.waitForURL(/profile\.html/), page.locator('#form-register button[type="submit"]').click()]);
  await page.waitForSelector('#order-list .state-empty');
  assert((await text('#profile-greeting')).includes('Second'), 'greeting should use the new name');
  assert((await page.locator('.topbar-actions a[aria-label="Account"]').getAttribute('href')) === 'profile.html', 'account icon should point to profile');
  await Promise.all([page.waitForURL(/auth\.html/), page.locator('#sign-out').click()]);
  await visit('profile.html');
  await page.waitForSelector('#profile-signed-out:not([hidden])');
});

await step('auth + order history: sign in as demo, cancel and return seeded orders', async () => {
  await visit('auth.html?next=profile.html');
  await page.fill('#login-email', 'demo@luxroom.com');
  await page.fill('#login-password', 'luxroom123');
  await Promise.all([page.waitForURL(/profile\.html/), page.locator('#form-login button[type="submit"]').click()]);
  await page.waitForSelector('#order-list .order-card');
  assert(await page.locator('#order-list .order-card').count() === 2, 'demo account has 2 orders');
  const processing = page.locator('.order-card[data-order-id="LR-DEMO-0115"]');
  await processing.locator('[data-order-request-open]').click();
  await processing.locator('.order-request__confirm').click();
  await page.waitForSelector('.order-card[data-order-id="LR-DEMO-0115"] .order-status:text("Cancelled")');
  const delivered = page.locator('.order-card[data-order-id="LR-DEMO-0192"]');
  await delivered.locator('[data-order-request-open]').click();
  await delivered.locator('.order-request__form select').selectOption('Too large for the space');
  await delivered.locator('.order-request__confirm').click();
  await page.waitForSelector('.order-card[data-order-id="LR-DEMO-0192"] .order-status:text("Return requested")');
});

await step('order history: failed load shows retry', async () => {
  await armFailure();
  await go(null, { reload: true });
  await page.waitForSelector('#order-list .state-error');
  await page.locator('#orders-retry').click();
  await page.waitForSelector('#order-list .order-card');
});

await step('profile: edit details with validation', async () => {
  await page.fill('#profile-email', 'not-an-email');
  await page.locator('#profile-form button[type="submit"]').click();
  await page.waitForSelector('#profile-status[data-state="error"]');
  await page.fill('#profile-email', 'demo@luxroom.com');
  await page.fill('#profile-phone', '+84 909 111 222');
  await page.locator('#profile-form button[type="submit"]').click();
  await page.waitForSelector('#profile-status[data-state="success"]');
  const users = await session('luxroom-users');
  assert(users.find((user) => user.id === 'u-demo').phone === '+84 909 111 222', 'phone should persist');
});

await step('addresses: create with validation, edit, make default, delete', async () => {
  await page.waitForSelector('#address-list .address-card');
  assert(await page.locator('#address-list .address-card').count() === 2, '2 seeded addresses');
  await page.locator('#address-add').click();
  await page.fill('#address-fullname', '');
  await page.locator('#address-form button[type="submit"]').click();
  await page.waitForSelector('#address-form .field-error');
  await page.fill('#address-label', 'Parents');
  await page.fill('#address-fullname', 'Tran Family');
  await page.fill('#address-street', '22 Hang Bai');
  await page.fill('#address-ward', 'Hang Bai');
  await page.fill('#address-district', 'Hoan Kiem');
  await page.selectOption('#address-province', 'Hanoi');
  await page.locator('#address-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelectorAll('#address-list .address-card').length === 3);
  const created = page.locator('#address-list .address-card', { hasText: 'Parents' });
  await created.locator('[data-address-edit]').click();
  await page.fill('#address-label', 'Family home');
  await page.locator('#address-form button[type="submit"]').click();
  await page.waitForSelector('#address-list .address-card:has-text("Family home")');
  await page.locator('#address-list .address-card:has-text("Family home") [data-address-default]').click();
  await page.waitForSelector('#address-list .address-card:has-text("Family home") .address-default');
  const removable = page.locator('#address-list .address-card:has-text("Studio") [data-address-delete]');
  await removable.click();
  await page.waitForSelector('#address-list .address-card:has-text("Studio") [data-address-delete][data-confirming="true"]');
  await removable.click();
  await page.waitForFunction(() => document.querySelectorAll('#address-list .address-card').length === 2);
});

await step('checkout signed in: saved address prefills the delivery form', async () => {
  await page.evaluate(() => window.LuxRoom.addToCart(16, 1, '16-1'));
  await visit('checkout.html');
  await page.waitForSelector('#saved-address-picker:not([hidden])');
  assert((await page.inputValue('#address')) === '22 Hang Bai', 'default address should prefill');
  assert((await page.inputValue('#province')) === 'Hanoi', 'province should prefill');
  assert((await page.inputValue('#email')) === 'demo@luxroom.com', 'email should prefill');
});

await step('contact: validation, failed send with retry, success', async () => {
  await visit('contact.html');
  await page.locator('#contact-form button[type="submit"]').click();
  await page.waitForSelector('#contact-form-status[data-state="error"]');
  await page.fill('#first_name', 'Linh');
  await page.fill('#last_name', 'Tran');
  await page.fill('#email', 'demo@luxroom.com');
  await page.fill('#message', 'We are planning a small living room and need help with scale.');
  await page.locator('input[name="contact_consent"]').check();
  await armFailure();
  await page.locator('#contact-form button[type="submit"]').click();
  await page.waitForSelector('#contact-form-status .status-retry');
  assert((await page.inputValue('#message')).includes('small living room'), 'message must survive the failure');
  await page.locator('#contact-form-status .status-retry').click();
  await page.waitForSelector('#contact-form-status[data-state="success"]');
});

await step('reset demo data restores the seed', async () => {
  await visit('cart.html');
  await page.locator('[data-demo-reset]').click();
  await page.waitForLoadState('load');
  await page.waitForSelector('.toast-msg');
  assert((await session('luxroom-cart-items')).length === 0, 'cart should be empty after reset');
  assert((await session('luxroom-session')) === null, 'session should be signed out after reset');
  const orders = await session('luxroom-orders');
  assert(orders.length === 2 && orders.every((order) => !['Cancelled', 'Return requested'].includes(order.status)), 'orders should be back to the seed');
  assert((await session('luxroom-saved-rooms')).length === 1, 'saved rooms should be back to the seed');
  assert((await session('luxroom-addresses')).length === 2, 'addresses should be back to the seed');
  assert(!(await session('luxroom-promo')), 'promo should be cleared');
});

await step('state survives reload within the tab', async () => {
  await page.evaluate(() => window.LuxRoom.addToCart(5, 1, '5-1'));
  await go(null, { reload: true });
  await page.waitForSelector('#cart-items-container .cart-row');
  assert(await page.locator('[data-cart-count]').first().innerText() === '1', 'badge should show 1 after reload');
});

for (const width of [1440, 390]) {
  await step(`every site page at ${width}px: no console errors, no href="#"`, async () => {
    await page.setViewportSize({ width, height: width > 600 ? 900 : 844 });
    for (const route of SITE_PAGES) await visit(route);
    await visit('detail.html?product=999');
    await visit('success.html?order=LR-NOPE');
    await visit('tracking.html?order=LR-NOPE');
  });
}

await browser.close();

if (consoleErrors.length) {
  failures.push({ name: 'console errors', error: consoleErrors.join(' | ') });
  console.log(`  FAIL console errors:\n    ${consoleErrors.join('\n    ')}`);
}
console.log(`\n${passed} steps passed, ${failures.length} failed.`);
process.exitCode = failures.length ? 1 : 0;
