import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const read = (file) => readFile(path.join(root, file), 'utf8');

const init = await read('js/ui-feedback-init.js');
const motion = await read('js/motion-system-v2.js');
const checkout = await read('js/checkout.js');
const productsPerformance = await read('js/products-performance.js');
const figmaCompat = await read('js/figma-compat.js');

const checks = [
  ['motion runtime loads independently', init.includes("import './motion-system-v2.js")],
  ['Figma tooling is opt-in', init.includes("params.get('figma') === '1'")],
  ['UI feedback tooling is opt-in', init.includes("params.get('feedback') === '1'")],
  ['public runtime does not statically import Figma tooling', !init.includes("import './figma-compat.js")],
  ['public runtime does not statically import feedback tooling', !init.includes("import { createUIFeedback }")],
  ['Figma capture materializes simple CSS backgrounds as native image nodes', figmaCompat.includes('data-figma-export-image')],
  ['Figma background materialization is capture-only', figmaCompat.includes('if (!captureMode) return;')],
  ['Figma capture marks unsupported display typography for native-text fallback', figmaCompat.includes('figma-native-text-safe')],
  ['Figma capture uses the proven editable UI font for display-text fallback', figmaCompat.includes('exportDisplayFont: \'DM Sans\'')],
  ['Figma text fallback is opt-out for fidelity debugging', figmaCompat.includes("query.get('text') !== 'fidelity'")],
  ['Figma capture collapses rich display headings into plain text nodes', figmaCompat.includes("node.textContent = exportText")],
  ['Figma capture preserves authored heading line breaks', figmaCompat.includes("child.nodeName === 'BR' ? '\\n'")],
  ['motion mutation work is globally batched via animation frame', motion.includes('decorationFrame = requestAnimationFrame(() => {')],
  ['motion mutation work runs once per frame instead of per node', motion.includes('decorateMotion(document)')],
  ['motion observer no longer rescans the full document on every mutation', !motion.includes('requestAnimationFrame(() => decorateMotion());')],
  ['checkout input review is frame-batched', checkout.includes('checkoutForm.addEventListener("input", scheduleReview)')],
  ['checkout no longer runs review directly on every input event', !checkout.includes('checkoutForm.addEventListener("input", updateReview)')],
  ['collection cards remove expensive backdrop filters', productsPerformance.includes('backdrop-filter: none !important')],
  ['collection removes expensive card backdrop filters', productsPerformance.includes('backdrop-filter: none !important')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  throw new Error(`Runtime performance QA failed:\n${failed.map(([label]) => `- ${label}`).join('\n')}`);
}

console.log(`PASS: ${checks.length} runtime performance and production-tooling assertions.`);
