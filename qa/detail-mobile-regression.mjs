import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8765';
const launchOptions = { headless: true };
if (process.env.CHROME_BIN) launchOptions.executablePath = process.env.CHROME_BIN;
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();

await page.goto(`${base}/detail.html?product=8`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(500);

const result = await page.evaluate(() => {
  const width = document.documentElement.clientWidth;
  const offenders = [...document.querySelectorAll('body *')]
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: typeof el.className === 'string' ? el.className.slice(0, 140) : '',
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        minWidth: style.minWidth,
        maxWidth: style.maxWidth,
        overflowX: style.overflowX,
        position: style.position,
      };
    })
    .filter((item) => item.width > 0 && (item.right > width + 2 || item.left < -2))
    .sort((a, b) => b.right - a.right)
    .slice(0, 20);
  const qaStyle = document.querySelector('link[data-luxroom-senior-commerce-qa]');
  return {
    viewportWidth: width,
    scrollWidth: document.documentElement.scrollWidth,
    qaStylesheetPresent: Boolean(qaStyle),
    qaStylesheetLoaded: Boolean(qaStyle?.sheet),
    offenders,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();

if (result.scrollWidth > result.viewportWidth + 2) process.exit(1);
