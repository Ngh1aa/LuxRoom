import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const root = resolve(process.cwd());
const html = await readFile(resolve(root, 'detail.html'), 'utf8');
const css = await readFile(resolve(root, 'css/detail.css'), 'utf8');
const js = await readFile(resolve(root, 'js/detail.js'), 'utf8');
const commonJs = await readFile(resolve(root, 'js/common.js'), 'utf8');

const requiredMarkup = [
  'id="detail-title"',
  'id="detail-price"',
  'id="qty-minus"',
  'id="qty-plus"',
  'id="add-to-cart"',
  'data-gallery-image="0"',
  'class="finish-option active"',
  'class="acc-item acc-open"',
  'class="topbar-actions"',
];

const requiredLogic = [
  'window.LuxRoom.addToCart',
  'setupQuantityControls',
  'setupAccordions',
  'setupFinishes',
  'setupGallery',
];

const requiredSharedHeaderLogic = [
  'function standardizeHeaderIcons',
  'data-cart-count',
  'aria-label="Cart"',
];

const localAssets = [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)]
  .map((match) => match[1])
  .filter((url) => !url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('#'));

for (const token of requiredMarkup) {
  if (!html.includes(token)) throw new Error(`Missing required markup: ${token}`);
}
for (const token of requiredLogic) {
  if (!js.includes(token)) throw new Error(`Missing required interaction: ${token}`);
}
for (const token of requiredSharedHeaderLogic) {
  if (!commonJs.includes(token)) throw new Error(`Missing shared header/cart behavior: ${token}`);
}
for (const asset of localAssets) {
  const path = resolve(dirname(resolve(root, 'detail.html')), asset);
  await access(path);
}
const radiusValues = [...css.matchAll(/border-radius:\s*([^;]+);/g)].map((match) => match[1].trim());
const allowedRadius = new Set(['0', '50%', 'var(--radius-0)', 'var(--radius-sm)']);
const nonSquareLayoutRadius = radiusValues.filter((value) => !allowedRadius.has(value));
if (nonSquareLayoutRadius.length > 0) {
  throw new Error(`Unexpected product-detail layout radius found: ${nonSquareLayoutRadius.join(', ')}`);
}

console.log(`PASS: ${requiredMarkup.length} required PDP markup hooks found.`);
console.log(`PASS: ${requiredLogic.length} PDP interaction hooks found.`);
console.log(`PASS: ${requiredSharedHeaderLogic.length} shared header/cart hooks found.`);
console.log(`PASS: ${localAssets.length} local dependencies resolve.`);
console.log('PASS: Product detail layout preserves the architectural corner system.');
