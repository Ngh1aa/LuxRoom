import fs from 'node:fs';

const runtime = fs.readFileSync('js/senior-commerce-depth.js', 'utf8');
const entry = fs.readFileSync('js/ui-feedback-init.js', 'utf8');
const css = fs.readFileSync('css/senior-commerce-depth.css', 'utf8');

const checks = {
  entry_loads_depth_layer: entry.includes('senior-commerce-depth.js'),
  detail_readiness_exists: runtime.includes('Confirm the room, not just the finish.'),
  cart_risk_summary_exists: runtime.includes('Before checkout') && runtime.includes('made-to-order'),
  checkout_draft_exists: runtime.includes('luxroom.checkout-draft.v1'),
  sensitive_card_fields_excluded: ['cardName','cardNumber','cardExpiry','cardCvc'].every((name) => runtime.includes(name)) && runtime.includes('SENSITIVE_FIELD_NAMES'),
  checkout_error_summary_exists: runtime.includes('senior-checkout-error-summary') && runtime.includes("querySelectorAll(':invalid')"),
  access_risk_exists: runtime.includes('oversized piece above ground floor'),
  responsive_styles_exist: css.includes('@media(max-width:760px)'),
};
const failed = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
console.log(JSON.stringify({ gate: 'SENIOR_COMMERCE_DEPTH', checks, failed, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
