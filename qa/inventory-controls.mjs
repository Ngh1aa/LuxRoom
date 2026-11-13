// Interactive-control inventory for the LuxRoom shop pages.
//
// Lists every visible interactive control on each site page (at 1440px and 390px),
// activates it on a freshly loaded page and records whether something meaningful
// happened: navigation, a DOM / state change, a focus move into a validation error,
// a download, or a new tab. Links are resolved without clicking: the target must
// load (HTTP 200) and in-page anchors must point at an existing id. `href="#"` is
// always reported as dead.
//
// Usage:
//   py -3 -m http.server 8923 --bind 127.0.0.1 --directory dist
//   NODE_PATH=<playwright node_modules> node qa/inventory-controls.mjs [--base http://127.0.0.1:8923] [--json out.json] [--page cart.html] [--concurrency 4]
//
// Exit code 1 when at least one dead control is found.
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const BASE = option('--base', 'http://127.0.0.1:8923').replace(/\/$/, '');
const JSON_OUT = option('--json', null);
const ONLY = option('--page', null);

export const SITE_PAGES = [
  'index.html', 'products.html', 'collection.html', 'rooms.html', 'detail.html', 'compare.html',
  'cart.html', 'checkout.html', 'success.html', 'tracking.html', 'wishlist.html', 'saved-room.html',
  'auth.html', 'profile.html', 'about.html', 'contact.html',
];
const WIDTHS = [1440, 390];
const CONTROL_SELECTOR = [
  'a[href]', 'button', '[role="button"]', '[role="tab"]', 'summary', 'select',
  'input[type="checkbox"]', 'input[type="radio"]', 'input[type="submit"]', '[onclick]',
].join(',');

const pages = ONLY ? [ONLY] : SITE_PAGES;
const browser = await chromium.launch();
const linkCache = new Map();
const results = [];

async function linkStatus(url) {
  if (linkCache.has(url)) return linkCache.get(url);
  let status = 0;
  for (let attempt = 1; attempt <= 4 && status === 0; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'GET' });
      status = response.status;
    } catch {
      status = 0;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  linkCache.set(url, status);
  return status;
}

async function collectControls(page) {
  return page.evaluate((selector) => {
    const cssPath = (element) => {
      const parts = [];
      let node = element;
      while (node && node.nodeType === 1 && node !== document.documentElement) {
        if (node.id && document.querySelectorAll(`#${CSS.escape(node.id)}`).length === 1) {
          parts.unshift(`#${CSS.escape(node.id)}`);
          break;
        }
        const label = node.getAttribute('aria-label');
        if (label && document.querySelectorAll(`${node.tagName.toLowerCase()}[aria-label="${CSS.escape(label)}"]`).length === 1) {
          parts.unshift(`${node.tagName.toLowerCase()}[aria-label="${CSS.escape(label)}"]`);
          break;
        }
        // Anchor on a unique class so sections injected later by runtime modules
        // (which shift nth-of-type indexes) cannot change what the path points to.
        const tag = node.tagName.toLowerCase();
        const uniqueClass = Array.from(node.classList).find((name) => !/^(is-|motion-|active|show)/.test(name)
          && document.querySelectorAll(`${tag}.${CSS.escape(name)}`).length === 1);
        if (uniqueClass && node !== element) {
          parts.unshift(`${tag}.${CSS.escape(uniqueClass)}`);
          break;
        }
        const parent = node.parentElement;
        const index = parent ? Array.from(parent.children).filter((child) => child.tagName === node.tagName).indexOf(node) + 1 : 1;
        parts.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${index})`);
        node = parent;
      }
      return parts.join(' > ');
    };
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return false;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return false;
      return !element.closest('[hidden], [aria-hidden="true"], [inert]');
    };
    const seen = new Set();
    return Array.from(document.querySelectorAll(selector))
      .filter((element) => {
        if (seen.has(element)) return false;
        seen.add(element);
        // A control nested inside another control is exercised through its parent.
        return !element.parentElement?.closest('a[href], button');
      })
      .filter(isVisible)
      .map((element) => ({
        path: cssPath(element),
        tag: element.tagName.toLowerCase(),
        type: element.getAttribute('type') || '',
        href: element.getAttribute('href'),
        absoluteHref: element.href || null,
        label: (element.getAttribute('aria-label') || element.textContent || element.value || '').replace(/\s+/g, ' ').trim().slice(0, 70),
        disabled: element.disabled === true || element.getAttribute('aria-disabled') === 'true',
        // A control that already shows the selected state is a no-op by design when activated again.
        selected: element.getAttribute('aria-pressed') === 'true' || element.getAttribute('aria-selected') === 'true'
          || element.getAttribute('aria-current') === 'page' || element.getAttribute('aria-current') === 'true'
          || (element.type === 'radio' && element.checked),
      }));
  }, CONTROL_SELECTOR);
}

async function snapshot(page) {
  return page.evaluate(() => {
    const motionNoise = /\b(is-visible|motion-[\w-]+|is-pulsing|cart-updated|lux-[\w-]+|is-loaded)\b/g;
    const html = document.body.innerHTML.replace(motionNoise, '').replace(/style="[^"]*animation[^"]*"/g, '');
    let storage = '';
    try { storage = JSON.stringify(Object.entries(sessionStorage)); } catch { storage = ''; }
    const formValues = Array.from(document.querySelectorAll('input, select, textarea')).map((field) => (field.type === 'checkbox' || field.type === 'radio') ? field.checked : field.value).join('|');
    return { url: location.href, html, storage, formValues, active: document.activeElement ? document.activeElement.outerHTML.slice(0, 200) : '' };
  });
}

async function openPage(context, pageName, width) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  // python http.server has a small listen backlog; retry a refused connection under parallel load.
  for (let attempt = 1; ; attempt += 1) {
    try {
      await page.goto(`${BASE}/${pageName}`, { waitUntil: 'load' });
      break;
    } catch (error) {
      if (attempt >= 4 || !/ERR_CONNECTION_REFUSED|ERR_EMPTY_RESPONSE|ERR_CONNECTION_RESET|chromewebdata/.test(error.message)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  // Runtime modules inject sections after load; wait until the DOM has been quiet for 400ms
  // so element paths are identical between the listing pass and each activation pass.
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.evaluate(() => new Promise((resolve) => {
    let timer = setTimeout(done, 400);
    const deadline = setTimeout(done, 4000);
    const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(done, 400); });
    observer.observe(document.body, { childList: true, subtree: true });
    function done() { observer.disconnect(); clearTimeout(timer); clearTimeout(deadline); resolve(); }
  }));
  await page.waitForTimeout(150);
  return page;
}

// Activation can race a busy machine (scripts not yet run, server slow); give each control
// one fresh retry before calling it dead.
async function exerciseButton(context, pageName, width, control) {
  const first = await exerciseOnce(context, pageName, width, control);
  if (first.meaningful) return first;
  const second = await exerciseOnce(context, pageName, width, control);
  return second.meaningful ? { ...second, reason: `${second.reason} (on retry)` } : first;
}

async function exerciseOnce(context, pageName, width, control) {
  let page;
  try {
    page = await openPage(context, pageName, width);
  } catch (error) {
    return { meaningful: false, reason: `could not open page: ${error.message.split('\n')[0]}` };
  }
  const outcome = { meaningful: false, reason: 'no observable change' };
  try {
    const locator = page.locator(control.path).first();
    await locator.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(250);
    // Re-read the state the page scripts settled on: a control that is now disabled or
    // already selected is intentional, not dead.
    const live = await locator.evaluate((element) => ({
      disabled: element.disabled === true || element.getAttribute('aria-disabled') === 'true',
      selected: element.getAttribute('aria-pressed') === 'true' || element.getAttribute('aria-selected') === 'true' || (element.type === 'radio' && element.checked),
    })).catch(() => ({ disabled: false, selected: false }));
    if (live.disabled) return { meaningful: true, reason: 'disabled by state (intentional)' };
    const before = await snapshot(page);
    const selfMarker = await locator.evaluate((element) => element.outerHTML.slice(0, 200)).catch(() => '');
    const popupPromise = context.waitForEvent('page', { timeout: 900 }).catch(() => null);
    const downloadPromise = page.waitForEvent('download', { timeout: 900 }).catch(() => null);
    const navigationPromise = page.waitForEvent('framenavigated', { timeout: 900 }).catch(() => null);
    if (control.tag === 'select') {
      const values = await locator.evaluate((select) => Array.from(select.options).map((item) => item.value));
      const current = await locator.inputValue();
      const next = values.find((value) => value !== current);
      if (next === undefined) return { meaningful: true, reason: 'single-option select' };
      await locator.selectOption(next, { timeout: 5000 });
    } else {
      await locator.click({ timeout: 6000 });
    }
    const [popup, download, navigation] = await Promise.all([popupPromise, downloadPromise, navigationPromise]);
    if (popup) { await popup.close(); return { meaningful: true, reason: 'opened a new tab' }; }
    if (download) return { meaningful: true, reason: 'started a download' };
    await page.waitForTimeout(450);
    const after = await snapshot(page).catch(() => null);
    if (!after || navigation) return { meaningful: true, reason: `navigated to ${page.url().replace(BASE, '')}` };
    if (after.url !== before.url) return { meaningful: true, reason: `changed URL to ${after.url.replace(BASE, '')}` };
    if (after.storage !== before.storage) return { meaningful: true, reason: 'updated stored state' };
    if (after.html !== before.html) return { meaningful: true, reason: 'updated the page' };
    if (after.formValues !== before.formValues) return { meaningful: true, reason: 'changed a field value' };
    const invalidFocus = await page.evaluate(() => Boolean(document.activeElement?.matches(':invalid')));
    if (invalidFocus) return { meaningful: true, reason: 'surfaced form validation' };
    // Focus landing on the clicked control itself is not an outcome.
    if (after.active !== before.active && after.active !== selfMarker && control.tag !== 'summary') return { meaningful: true, reason: 'moved focus' };
    if (live.selected) return { meaningful: true, reason: 'already selected (state shown, no-op by design)' };
    return outcome;
  } catch (error) {
    return { meaningful: false, reason: `could not activate: ${error.message.split('\n')[0]}` };
  } finally {
    await page.close().catch(() => {});
  }
}

async function inventoryPage(pageName) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const seenPaths = new Set();
  for (const width of WIDTHS) {
    let page;
    for (let attempt = 1; !page; attempt += 1) {
      try {
        page = await openPage(context, pageName, width);
      } catch (error) {
        if (attempt >= 3) throw error;
      }
    }
    const controls = await collectControls(page);
    const ids = new Set(await page.evaluate(() => Array.from(document.querySelectorAll('[id]')).map((node) => node.id)));
    const names = new Set(await page.evaluate(() => Array.from(document.querySelectorAll('a[name]')).map((node) => node.getAttribute('name'))));
    await page.close();
    for (const control of controls) {
      const key = `${control.path}`;
      if (seenPaths.has(key)) continue;
      seenPaths.add(key);
      let outcome;
      if (control.disabled) {
        outcome = { meaningful: true, reason: 'disabled by state (intentional)' };
      } else if (control.selected && control.tag !== 'a') {
        const clicked = await exerciseButton(context, pageName, width, control);
        outcome = clicked.meaningful ? clicked : { meaningful: true, reason: 'already selected (state shown, no-op by design)' };
      } else if (control.tag === 'a' && control.href !== null) {
        const href = control.href.trim();
        if (href === '#' || href === '' || /^javascript:/i.test(href)) {
          const clicked = await exerciseButton(context, pageName, width, control);
          outcome = clicked.meaningful && !/^changed URL/.test(clicked.reason)
            ? { meaningful: false, reason: `href="${href}" (scripted: ${clicked.reason})` }
            : { meaningful: false, reason: `href="${href}" goes nowhere` };
        } else if (/^(mailto|tel):/i.test(href)) {
          outcome = { meaningful: true, reason: `opens ${href.split(':')[0]}` };
        } else if (href.startsWith('#')) {
          const target = decodeURIComponent(href.slice(1));
          outcome = ids.has(target) || names.has(target) || target === 'top'
            ? { meaningful: true, reason: `jumps to #${target}` }
            : { meaningful: false, reason: `anchor #${target} does not exist` };
        } else {
          const url = new URL(control.absoluteHref);
          if (url.origin !== new URL(BASE).origin) {
            outcome = { meaningful: true, reason: `external ${url.origin}` };
          } else {
            const status = await linkStatus(`${url.origin}${url.pathname}${url.search}`);
            outcome = status === 200
              ? { meaningful: true, reason: `links to ${url.pathname.slice(1)}${url.search}${url.hash}` }
              : { meaningful: false, reason: `broken link (${status}) ${url.pathname}` };
          }
        }
      } else {
        outcome = await exerciseButton(context, pageName, width, control);
      }
      results.push({ page: pageName, width, ...control, ...outcome });
    }
  }
  await context.close();
}

const CONCURRENCY = Number(option('--concurrency', '4'));
const queue = pages.slice();
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
  while (queue.length) await inventoryPage(queue.shift());
}));

for (const pageName of pages) {
  const pageResults = results.filter((result) => result.page === pageName);
  const dead = pageResults.filter((result) => !result.meaningful);
  console.log(`${pageName.padEnd(16)} ${String(pageResults.length).padStart(3)} controls  ${dead.length ? `${dead.length} DEAD` : 'all live'}`);
  for (const result of dead) console.log(`    DEAD @${result.width} <${result.tag}> "${result.label}" — ${result.reason}  [${result.path}]`);
}


await browser.close();
const deadTotal = results.filter((result) => !result.meaningful).length;
console.log(`\nInventory: ${results.length} controls on ${pages.length} pages, ${results.length - deadTotal} live, ${deadTotal} dead.`);
if (JSON_OUT) await writeFile(JSON_OUT, JSON.stringify(results, null, 2));
process.exitCode = deadTotal ? 1 : 0;
