import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8765';
const launchOptions = { headless: true };
if (process.env.CHROME_BIN) launchOptions.executablePath = process.env.CHROME_BIN;

const browser = await chromium.launch(launchOptions);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function openPage(context, route = 'index.html') {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  await page.goto(`${base}/${route}`, { waitUntil: 'commit', timeout: 15000 });
  await page.locator('body').waitFor({ state: 'attached', timeout: 8000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('lux-motion-v2'), null, { timeout: 8000 });
  await page.waitForFunction(() => {
    const stylesheet = document.querySelector('link[data-luxroom-motion-v2]');
    return Boolean(stylesheet?.sheet);
  }, null, { timeout: 8000 });
  await page.waitForTimeout(120);
  return { page, errors };
}

async function testDesktopMotion() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const { page, errors } = await openPage(context);

  const setup = await page.evaluate(() => ({
    mode: document.documentElement.dataset.luxroomMotion,
    stylesheet: Boolean(document.querySelector('link[data-luxroom-motion-v2]')),
    heroVariant: document.querySelector('.home-hero')?.dataset.motionV2,
    motionCards: document.querySelectorAll('[data-motion-card="true"]').length,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  assert(setup.mode === 'full', `Expected full motion mode, got ${setup.mode}`);
  assert(setup.stylesheet, 'Motion v2 stylesheet was not mounted.');
  assert(setup.heroVariant === 'hero', `Home hero motion variant missing: ${setup.heroVariant}`);
  assert(setup.motionCards >= 6, `Expected decorated motion cards, got ${setup.motionCards}`);
  assert(setup.scrollWidth <= setup.clientWidth + 1, `Desktop horizontal overflow: ${setup.scrollWidth} > ${setup.clientWidth}`);

  const revealTarget = page.locator('.room-edit').first();
  await revealTarget.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const node = document.querySelector('.room-edit');
    return Boolean(node?.classList.contains('is-visible') || node?.classList.contains('motion-v2-visible'));
  }, null, { timeout: 3000 });

  const card = page.locator('.feature-product').first();
  await card.scrollIntoViewIfNeeded();
  const media = card.locator('.product-image').first();
  const beforeTransform = await media.evaluate((node) => getComputedStyle(node).transform);
  await card.hover();
  await page.waitForTimeout(260);
  const afterTransform = await media.evaluate((node) => getComputedStyle(node).transform);
  assert(beforeTransform !== afterTransform, `Card image hover did not change transform (${beforeTransform}).`);

  assert(errors.length === 0, `Desktop motion page errors:\n${errors.join('\n')}`);
  await context.close();
}

async function testMobileMotion() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const { page, errors } = await openPage(context);
  const metrics = await page.evaluate(() => ({
    mode: document.documentElement.dataset.luxroomMotion,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert(metrics.mode === 'full', `Expected full motion on mobile, got ${metrics.mode}`);
  assert(metrics.scrollWidth <= metrics.clientWidth + 1, `Mobile horizontal overflow: ${metrics.scrollWidth} > ${metrics.clientWidth}`);
  assert(errors.length === 0, `Mobile motion page errors:\n${errors.join('\n')}`);
  await context.close();
}

async function testReducedMotion() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const { page, errors } = await openPage(context);
  const state = await page.evaluate(() => {
    const heroCopy = document.querySelector('.home-hero .hero-copy > *');
    const card = document.querySelector('[data-motion-card="true"]');
    const heroStyle = heroCopy ? getComputedStyle(heroCopy) : null;
    const cardStyle = card ? getComputedStyle(card) : null;
    return {
      mode: document.documentElement.dataset.luxroomMotion,
      heroOpacity: heroStyle?.opacity,
      heroTransform: heroStyle?.transform,
      cardOpacity: cardStyle?.opacity,
      cardTransform: cardStyle?.transform,
    };
  });

  assert(state.mode === 'reduced', `Expected reduced motion mode, got ${state.mode}`);
  assert(state.heroOpacity === '1', `Reduced-motion hero content hidden: opacity ${state.heroOpacity}`);
  assert(state.heroTransform === 'none', `Reduced-motion hero transform should be none, got ${state.heroTransform}`);
  assert(state.cardOpacity === '1', `Reduced-motion card hidden: opacity ${state.cardOpacity}`);
  assert(state.cardTransform === 'none', `Reduced-motion card transform should be none, got ${state.cardTransform}`);
  assert(errors.length === 0, `Reduced-motion page errors:\n${errors.join('\n')}`);
  await context.close();
}

try {
  await testDesktopMotion();
  await testMobileMotion();
  await testReducedMotion();
  console.log('Motion behavior QA passed: full motion, responsive overflow, hover feedback, reveal activation, and reduced-motion fallback.');
} finally {
  await browser.close();
}
