import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const read = (file) => readFile(path.join(root, file), 'utf8');

const init = await read('js/ui-feedback-init.js');
const motion = await read('js/motion-system-v2.js');
const checkout = await read('js/checkout.js');
const productsPerformance = await read('js/products-performance.js');

const checks = [
  ['motion runtime loads independently', init.includes("import './motion-system-v2.js")],
  ['Figma tooling is opt-in', init.includes("params.get('figma') === '1'")],
  ['UI feedback tooling is opt-in', init.includes("params.get('feedback') === '1'")],
  ['public runtime does not statically import Figma tooling', !init.includes("import './figma-compat.js")],
  ['public runtime does not statically import feedback tooling', !init.includes("import { createUIFeedback }")],
  ['motion mutation work is queued by changed roots', motion.includes('const pendingRoots = new Set()')],
  ['motion mutation work scopes decoration to changed roots', motion.includes('roots.forEach((root) => decorateMotion(root))')],
  ['motion observer no longer rescans the full document on every mutation', !motion.includes('requestAnimationFrame(() => decorateMotion());')],
  ['checkout input review is frame-batched', checkout.includes('checkoutForm.addEventListener("input", scheduleReview)')],
  ['checkout no longer runs review directly on every input event', !checkout.includes('checkoutForm.addEventListener("input", updateReview)')],
  ['collection cards use offscreen rendering containment', productsPerformance.includes('content-visibility: auto')],
  ['collection removes expensive card backdrop filters', productsPerformance.includes('backdrop-filter: none !important')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  throw new Error(`Runtime performance QA failed:\n${failed.map(([label]) => `- ${label}`).join('\n')}`);
}

console.log(`PASS: ${checks.length} runtime performance and production-tooling assertions.`);
