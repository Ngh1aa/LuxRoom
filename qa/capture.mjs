import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = 'http://127.0.0.1:8765';
const out = 'qa/evidence/raw';
await fs.mkdir(out, { recursive: true });

const launchOptions = { headless: true };
if (process.env.CHROME_BIN) launchOptions.executablePath = process.env.CHROME_BIN;
const browser = await chromium.launch(launchOptions);

async function settlePage(page, route) {
  await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('load', { timeout: 8000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {});
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
}

async function capture(name, route, viewport, action) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  const failedResponses = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
  page.on('response', response => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  await settlePage(page, route);
  await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;scroll-behavior:auto!important}` });
  if (action) await action(page);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  const metrics = await page.evaluate(() => {
    const accent = document.querySelector('#home-title em');
    const accentRect = accent?.getBoundingClientRect();
    return {
      title: document.title,
      pageClass: document.body.className,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyHeight: document.body.scrollHeight,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      active: document.querySelector('.main-nav a.active')?.textContent?.trim() || '',
      heroAccentRight: accentRect ? Math.round(accentRect.right) : null,
      heroAccentClipped: accentRect ? accentRect.right > window.innerWidth + 1 || accentRect.left < -1 : false,
      compareCount: document.querySelectorAll('.compare-product-head').length,
      savedRoomCount: document.querySelectorAll('.saved-room-item').length,
      fitStatus: document.querySelector('#fit-result .fit-result__status')?.textContent?.trim() || null,
    };
  });
  await fs.writeFile(`${out}/${name}.json`, JSON.stringify({ ...metrics, errors, failedResponses }, null, 2));
  await context.close();
}

const desktop = { width: 1440, height: 1000 };
const mobile = { width: 390, height: 844 };
const tablet = { width: 768, height: 1024 };
const smallLaptop = { width: 1024, height: 900 };
const wide = { width: 1920, height: 1080 };
const mid = { width: 700, height: 900 };
const routes = [
  ['home','index.html'],
  ['rooms','rooms.html'],
  ['collection','products.html'],
  ['detail','detail.html?product=8'],
  ['compare','compare.html?products=8,12'],
  ['saved-room','saved-room.html'],
  ['about','about.html'],
  ['contact','contact.html'],
  ['cart','cart.html'],
  ['checkout','checkout.html'],
];

for (const [name, route] of routes) {
  await capture(`${name}-desktop`, route, desktop);
  await capture(`${name}-mobile`, route, mobile);
}

for (const [name, route] of routes.slice(0, 6)) {
  await capture(`${name}-tablet`, route, tablet);
  await capture(`${name}-1024`, route, smallLaptop);
}
await capture('home-wide', 'index.html', wide);
await capture('home-700', 'index.html', mid);

await capture('home-desktop-shop', 'index.html', desktop, async page => {
  const shopLink = page.locator('.nav-shop > a');
  await shopLink.hover();
  await page.locator('.nav-shop-flyout').waitFor({ state: 'visible' });
});
await capture('home-desktop-rooms', 'index.html', desktop, async page => {
  const roomsLink = page.locator('.nav-rooms > a');
  await roomsLink.hover();
  await page.locator('.nav-rooms-flyout').waitFor({ state: 'visible' });
});
await capture('collection-room-desktop', 'products.html?room=Living', desktop);
await capture('collection-room-mobile-menu', 'products.html?room=Living', mobile, async page => {
  await page.locator('.mobile-menu-toggle').click();
});
await capture('home-desktop-search', 'index.html', desktop, async page => {
  await page.locator('button[aria-label="Search"]').click();
  await page.locator('#global-search-overlay.show').waitFor({ state: 'visible' });
});
await capture('home-mobile-menu', 'index.html', mobile, async page => {
  await page.locator('.mobile-menu-toggle').click();
});
await capture('home-mobile-search', 'index.html', mobile, async page => {
  await page.locator('button[aria-label="Search"]').click();
});
await capture('collection-mobile-filter', 'products.html', mobile, async page => {
  await page.locator('.filter-toggle').click();
});
await capture('home-scrolled-desktop', 'index.html', desktop, async page => {
  await page.evaluate(() => window.scrollTo(0, 650));
});
await capture('detail-mobile-lower', 'detail.html?product=8', mobile, async page => {
  await page.locator('#will-it-fit').scrollIntoViewIfNeeded();
});
await capture('detail-fit-desktop', 'detail.html?product=8', desktop, async page => {
  await page.locator('#fit-form input[name="width"]').fill('420');
  await page.locator('#fit-form input[name="depth"]').fill('360');
  await page.locator('#fit-form input[name="doorway"]').fill('88');
  await page.locator('#fit-form input[name="clearance"]').fill('60');
  await page.locator('#fit-form button[type="submit"]').click();
  await page.locator('#fit-result[data-status]').waitFor();
  await page.locator('#will-it-fit').scrollIntoViewIfNeeded();
});
await capture('saved-room-seeded-desktop', 'saved-room.html', desktop, async page => {
  await page.evaluate(() => {
    localStorage.setItem('luxroom-saved-room', JSON.stringify({
      room: 'Living',
      measurements: { width: '420', depth: '360', doorway: '88', clearance: '60' },
      items: [
        { productId: 8, variantId: '8-1', finish: 'Warm linen' },
        { productId: 12, variantId: '12-1', finish: 'Olive bouclé' }
      ],
      updatedAt: new Date().toISOString()
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {});
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
});
await capture('saved-room-seeded-mobile', 'saved-room.html', mobile, async page => {
  await page.evaluate(() => {
    localStorage.setItem('luxroom-saved-room', JSON.stringify({
      room: 'Living',
      measurements: { width: '420', depth: '360', doorway: '88', clearance: '60' },
      items: [
        { productId: 8, variantId: '8-1', finish: 'Warm linen' },
        { productId: 12, variantId: '12-1', finish: 'Olive bouclé' }
      ],
      updatedAt: new Date().toISOString()
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {});
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
});

await browser.close();
