import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8765';
const launchOptions = { headless: true };
if (process.env.CHROME_BIN) launchOptions.executablePath = process.env.CHROME_BIN;
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

async function open(route) {
  runtimeErrors.length = 0;
  const response = await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  if (!response || response.status() >= 400) throw new Error(`${route}: bad response ${response?.status()}`);
  await page.waitForTimeout(450);
}

async function assertNoOverflow(label) {
  const report = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')].map((node) => {
      const rect = node.getBoundingClientRect();
      return { tag: node.tagName.toLowerCase(), cls: node.className || '', id: node.id || '', left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
    }).filter((item) => item.right > width + 2 || item.left < -2).sort((a,b) => (b.right - width) - (a.right - width)).slice(0,12);
    return { width, scrollWidth: document.documentElement.scrollWidth, offenders };
  });
  if (report.scrollWidth > report.width + 2) throw new Error(`${label}: horizontal overflow ${report.scrollWidth}/${report.width}\n${JSON.stringify(report.offenders, null, 2)}`);
}

try {
  await open('detail.html?product=8');
  await page.locator('.senior-readiness-card').waitFor({ state: 'visible' });
  await assertNoOverflow('detail mobile');
  const checks = page.locator('.senior-readiness-card [data-readiness]');
  await checks.nth(0).check();
  await checks.nth(1).check();
  if ((await page.locator('.senior-readiness-status').textContent())?.trim() !== '2/2 confirmed') throw new Error('PDP readiness did not reach 2/2 confirmed');

  await page.evaluate(() => localStorage.setItem('luxroom-cart-items', JSON.stringify([{ productId: 8, variantId: '8-1', quantity: 1 }])));
  await open('cart.html');
  await page.locator('.senior-cart-readiness').waitFor({ state: 'visible' });
  const cartCopy = await page.locator('.senior-cart-readiness').innerText();
  if (!/oversized/i.test(cartCopy) || !/made-to-order/i.test(cartCopy)) throw new Error(`Bag risk summary missing real product risks: ${cartCopy}`);
  await assertNoOverflow('cart mobile');

  await open('checkout.html');
  await page.locator('.senior-checkout-readiness').waitFor({ state: 'visible' });
  await page.locator('#email').fill('qa@example.com');
  await page.locator('#phone').fill('+84900000000');
  await page.locator('input[name="paymentMethod"][value="Credit / Debit Card"]').check();
  await page.locator('#card-name').fill('QA Person');
  await page.locator('#card-number').fill('4242 4242 4242 4242');
  await page.locator('#card-expiry').fill('12 / 30');
  await page.locator('#card-cvc').fill('123');
  await page.waitForTimeout(100);
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('luxroom.checkout-draft.v1') || '{}'));
  for (const key of ['cardName','cardNumber','cardExpiry','cardCvc']) {
    if (Object.prototype.hasOwnProperty.call(draft, key)) throw new Error(`Sensitive checkout field persisted: ${key}`);
  }
  await assertNoOverflow('checkout mobile');
  if (runtimeErrors.length) throw new Error(`Checkout runtime errors: ${runtimeErrors.join(' | ')}`);

  console.log(JSON.stringify({ gate: 'SENIOR_COMMERCE_BROWSER', passed: true, detail_readiness: true, cart_risk_summary: true, sensitive_draft_exclusion: true, mobile_overflow: false }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
