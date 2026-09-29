import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:8765';
const out = 'qa/evidence/state-coverage';
await fs.mkdir(out, { recursive: true });

const states = {
  empty: {
    text: 'No objects match this combination',
    action: 'Reset the edit',
  },
  loading: {
    text: 'Loading collection',
    action: null,
  },
  error: {
    text: "We couldn't refresh the collection",
    action: 'Retry collection',
  },
  success: {
    text: 'Added to cart',
    action: 'Review cart',
  },
};

const viewports = [
  ['desktop', { width: 1440, height: 1000 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }],
];

const launchOptions = { headless: true };
if (process.env.CHROME_BIN) launchOptions.executablePath = process.env.CHROME_BIN;
const browser = await chromium.launch(launchOptions);
const report = [];
let failed = false;

for (const [state, contract] of Object.entries(states)) {
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    const failedResponses = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });

    const route = `recruiter-state-lab.html?state=${state}&pin=1`;
    const item = { state, viewport: viewportName, route, assertions: {}, errors, failedResponses };

    try {
      await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const frame = page.frameLocator('#productFrame');
      const evidence = frame.locator(`[data-state-evidence="${state}"]`);
      await evidence.waitFor({ state: 'visible', timeout: 8000 });

      const evidenceText = (await evidence.innerText()).replace(/\s+/g, ' ').trim();
      item.assertions.stateVisible = true;
      item.assertions.primaryText = evidenceText.toLowerCase().includes(contract.text.toLowerCase());
      item.assertions.actionText = contract.action ? evidenceText.toLowerCase().includes(contract.action.toLowerCase()) : true;

      if (state === 'loading') {
        item.assertions.ariaBusy = await frame.locator('#product-grid').getAttribute('aria-busy') === 'true';
      }

      if (state === 'error') {
        item.assertions.alertRole = await evidence.getAttribute('role') === 'alert';
      }

      if (state === 'success') {
        item.assertions.statusRole = await evidence.getAttribute('role') === 'status';
        item.assertions.cartNextStep = await evidence.locator('a[href="cart.html"]').count() === 1;
      }

      if (state === 'empty') {
        item.assertions.resetControl = await evidence.locator('button[data-collection-reset-state]').count() === 1;
      }

      const outerOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      const innerOverflow = await frame.locator('html').evaluate((html) => html.scrollWidth > html.clientWidth + 1);
      item.assertions.outerNoHorizontalOverflow = !outerOverflow;
      item.assertions.innerNoHorizontalOverflow = !innerOverflow;

      await evidence.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `${out}/${state}-${viewportName}.png`,
        fullPage: false,
        animations: 'disabled',
        timeout: 10000,
      });
    } catch (error) {
      item.exception = error instanceof Error ? error.message : String(error);
    }

    const assertionPass = Object.values(item.assertions).every(Boolean);
    item.pass = !item.exception && assertionPass && errors.length === 0 && failedResponses.length === 0;
    if (!item.pass) failed = true;
    report.push(item);
    console.log(`${item.pass ? 'PASS' : 'FAIL'} state=${state} viewport=${viewportName}`);
    await context.close();
  }
}

async function verifyCheckoutCriticalAction() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  const failedResponses = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  const item = { state: 'checkout-critical-action', viewport: 'desktop', route: 'products → checkout → success', assertions: {}, errors, failedResponses };
  try {
    await page.goto(`${base}/products.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('.add-to-cart-action[data-product-id]').first().click();
    await page.goto(`${base}/checkout.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('link[data-senior-commerce-states]').waitFor({ state: 'attached', timeout: 8000 });

    const submit = page.locator('.place-order-btn');
    await submit.click();
    const invalidStatus = page.locator('.checkout-status--error');
    await invalidStatus.waitFor({ state: 'visible', timeout: 3000 });
    item.assertions.invalidSummaryVisible = (await invalidStatus.innerText()).includes('Check the highlighted details');
    item.assertions.invalidFieldMarked = await page.locator('[aria-invalid="true"]').count() > 0;

    await page.locator('#email').fill('designer@example.com');
    await page.locator('#phone').fill('+84 900 000 000');
    await page.locator('#full-name').fill('Product Designer');
    await page.locator('#address').fill('12 Prototype Street');
    await page.locator('#province').selectOption('Ho Chi Minh City');
    await page.locator('#district').fill('District 1');
    await page.locator('#ward').fill('Ben Nghe');

    await submit.click();
    const loadingStatus = page.locator('.checkout-status--loading');
    await loadingStatus.waitFor({ state: 'visible', timeout: 3000 });
    item.assertions.loadingStatusVisible = (await loadingStatus.innerText()).includes('Placing your order');
    item.assertions.formBusy = await page.locator('#checkout-form').getAttribute('aria-busy') === 'true';
    item.assertions.submitBusy = await submit.getAttribute('aria-busy') === 'true';

    await page.waitForURL(/success\.html\?order=LR-/, { timeout: 5000 });
    item.assertions.confirmationReached = true;
    item.assertions.cartClearedAfterSuccess = await page.evaluate(() => {
      try {
        const candidates = ['luxroom-cart', 'cart'];
        return candidates.every((key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return true;
          const parsed = JSON.parse(raw);
          return !Array.isArray(parsed) || parsed.length === 0;
        });
      } catch {
        return true;
      }
    });

    await page.screenshot({
      path: `${out}/checkout-confirmation-desktop.png`,
      fullPage: false,
      animations: 'disabled',
      timeout: 10000,
    });
  } catch (error) {
    item.exception = error instanceof Error ? error.message : String(error);
  }

  const assertionPass = Object.values(item.assertions).every(Boolean);
  item.pass = !item.exception && assertionPass && errors.length === 0 && failedResponses.length === 0;
  if (!item.pass) failed = true;
  report.push(item);
  console.log(`${item.pass ? 'PASS' : 'FAIL'} checkout critical action`);
  await context.close();
}

await verifyCheckoutCriticalAction();
await browser.close();
await fs.writeFile(`${out}/state-coverage-report.json`, JSON.stringify({
  generatedAt: new Date().toISOString(),
  base,
  passed: !failed,
  report,
}, null, 2));

if (failed) {
  console.error('Rendered commerce state coverage failed. See qa/evidence/state-coverage/state-coverage-report.json');
  process.exit(1);
}

console.log(`Rendered commerce state coverage passed (${report.length}/${report.length} checks).`);
