import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const root = resolve(process.cwd());
const htmlPath = resolve(root, 'index.html');
const pageCssPath = resolve(root, 'css/index.css');
const systemCssPath = resolve(root, 'css/design-system.css');
const commonCssPath = resolve(root, 'css/common.css');
const html = readFileSync(htmlPath, 'utf8');
const pageCss = readFileSync(pageCssPath, 'utf8');
const systemCss = readFileSync(systemCssPath, 'utf8');
const commonCss = readFileSync(commonCssPath, 'utf8');
const css = `${systemCss}\n${commonCss}\n${pageCss}`;
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith('./')) {
    const localPath = value.split(/[?#]/, 1)[0];
    assert(existsSync(resolve(root, localPath)), `Missing local link or asset: ${value}`);
  }
}

for (const match of pageCss.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
  const value = match[1];
  if (value.startsWith('../img/')) {
    assert(existsSync(resolve(dirname(pageCssPath), value)), `Missing CSS image asset: ${value}`);
  }
}

[
  'home-hero',
  'discovery-rail',
  'edited-pieces',
  'room-edit',
  'commerce-assurance',
  'studio',
  'newsletter-form',
  'global-search-overlay',
].forEach((token) => assert(html.includes(token), `Missing required home component: ${token}`));

[
  'Newsreader',
  'DM Sans',
  '--clay',
  '--paper',
  '--hairline',
  '@media (max-width: 820px)',
  'prefers-reduced-motion',
].forEach((token) => assert(css.includes(token), `Missing required responsive/design token: ${token}`));

assert(html.includes('img/feedback/home-hero.jpg'), 'Missing image-led home hero asset');
assert(html.includes('products.html?room=Living'), 'Missing room-led discovery route');
assert(html.includes('products.html'), 'Missing collection discovery route');
assert(css.includes('grid-template-columns'), 'Missing intentional desktop composition grid');

if (failures.length) {
  console.error('Home QA failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Home QA passed: local links, image assets, current architectural components, semantic tokens and responsive rules verified.');
