import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = 'http://127.0.0.1:8765';
const out = 'qa/evidence/raw';
await fs.mkdir(out, { recursive: true });

const launchOptions = { headless: true };
if (process.env.CHROME_BIN) launchOptions.executablePath = process.env.CHROME_BIN;
const browser = await chromium.launch(launchOptions);

async function openSeededContext(viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  await page.goto(`${base}/detail.html?product=8`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.LuxRoom?.products?.length && window.LuxRoom?.addToCart);
  const seeded = await page.evaluate(() => {
    const product = window.LuxRoom.getProduct(8) || window.LuxRoom.products[0];
    const variant = product.variants[1] || product.variants[0];
    window.LuxRoom.clearCart();
    window.LuxRoom.addToCart(product.id, 1, variant.variantId);
    return { productId: product.id, variantId: variant.variantId, finish: variant.finish };
  });
  return { context, page, seeded };
}

async function captureProof(name, route, viewport) {
  const { context, page, seeded } = await openSeededContext(viewport);
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  try {
    await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'attached' });
    await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;scroll-behavior:auto!important}` });
    await page.waitForTimeout(250);

    const selector = route.startsWith('cart') ? '.cart-edit-configuration' : '.summary-edit-configuration';
    const editLink = page.locator(selector).first();
    await editLink.waitFor({ state: 'visible' });
    const href = await editLink.getAttribute('href');
    const expectedQuery = `product=${seeded.productId}&variant=${seeded.variantId}`;
    if (!href?.includes(expectedQuery)) throw new Error(`${name}: edit link lost exact configuration: ${href}`);

    await page.screenshot({ path: `${out}/${name}.png`, fullPage: false, animations: 'disabled' });

    await editLink.click();
    await page.waitForURL(url => url.pathname.endsWith('/detail.html') && url.searchParams.get('variant') === seeded.variantId);
    const selected = await page.locator(`.finish-option[data-variant-id="${seeded.variantId}"]`).getAttribute('aria-pressed');
    if (selected !== 'true') throw new Error(`${name}: PDP did not restore ${seeded.variantId}`);

    await fs.writeFile(`${out}/${name}.json`, JSON.stringify({
      productId: seeded.productId,
      variantId: seeded.variantId,
      finish: seeded.finish,
      editHref: href,
      restoredVariant: selected === 'true',
      errors,
    }, null, 2));
  } finally {
    await context.close();
  }
}

await captureProof('cart-seeded-configuration-desktop', 'cart.html', { width: 1440, height: 1000 });
await captureProof('cart-seeded-configuration-mobile', 'cart.html', { width: 390, height: 844 });
await captureProof('checkout-seeded-configuration-desktop', 'checkout.html', { width: 1440, height: 1000 });
await captureProof('checkout-seeded-configuration-mobile', 'checkout.html', { width: 390, height: 844 });

await browser.close();
console.log('Commerce configuration visual proof captured successfully.');
