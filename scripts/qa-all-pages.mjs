import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const routes = {
  'index.html': ['home-hero', 'collection'],
  'products.html': ['product-grid', 'filter'],
  'rooms.html': ['rooms-hero', 'room-atlas'],
  'detail.html': ['d-gallery', 'add-to-cart'],
  'compare.html': ['compare-grid', 'compare-summary'],
  'saved-room.html': ['saved-room-measurements', 'saved-room-items'],
  'cart.html': ['cart-items', 'checkout'],
  'checkout.html': ['checkout-form', 'checkout-summary-items'],
  'success.html': ['order'],
  'tracking.html': ['tracking-timeline', 'tracking-items'],
  'wishlist.html': ['wishlist-grid', 'share-room'],
  'auth.html': ['form-login', 'form-register'],
  'profile.html': ['profile-layout'],
  'about.html': ['story-hero', 'material-triptych'],
  'contact.html': ['contact-form', 'contact-grid'],
};
let assertions = 0;
for (const [file, hooks] of Object.entries(routes)) {
  const source = await readFile(path.join(root, file), 'utf8');
  if (!source.includes('css/common.css')) throw new Error(`${file}: missing common stylesheet`);
  if (!source.includes('js/common.js')) throw new Error(`${file}: missing common runtime`);
  if (!source.includes('js/ui-feedback-init.js')) throw new Error(`${file}: missing shared motion/runtime bootstrap`);
  if (source.includes('>Journal<')) throw new Error(`${file}: stale Journal label`);
  for (const hook of hooks) {
    if (!source.includes(hook)) throw new Error(`${file}: missing ${hook}`);
    assertions += 1;
  }
  const assetPaths = [...source.matchAll(/(?:src|href)="(img\/[^"?#]+|css\/[^"?#]+|js\/[^"?#]+)"/g)].map((match) => match[1]);
  for (const asset of assetPaths) await access(path.join(root, asset));
  assertions += assetPaths.length + 3;
}

const architecturalSheets = ['css/common.css','css/products.css','css/cart.css','css/checkout.css','css/auth.css','css/profile.css','css/success.css','css/tracking.css','css/about.css','css/contact.css'];
function isExcessiveRadius(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized === '0' || normalized === '50%' || normalized.includes('var(--radius-0)') || normalized.includes('var(--radius-sm)') || normalized.includes('var(--radius-md)')) return false;
  const numeric = normalized.match(/^([0-9]*\.?[0-9]+)(px|rem|%)$/);
  if (!numeric) return false;
  const amount = Number(numeric[1]);
  const unit = numeric[2];
  if (unit === 'px') return amount > 6;
  if (unit === 'rem') return amount > 0.375;
  if (unit === '%') return amount !== 50;
  return false;
}

for (const sheet of architecturalSheets) {
  const source = await readFile(path.join(root, sheet), 'utf8');
  const radii = [...source.matchAll(/border-radius\s*:\s*([^;]+);/g)].map((match) => match[1].trim());
  const excessive = radii.filter(isExcessiveRadius);
  if (excessive.length) throw new Error(`${sheet}: contains excessive rounded layout radius: ${excessive.join(', ')}`);
  assertions += 1;
}
console.log(`PASS: ${assertions} structural, dependency and architectural-radius assertions.`);
