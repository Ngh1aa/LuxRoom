import { readFile } from 'node:fs/promises';

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

const files = {
  runtime: await read('js/senior-commerce-states.js'),
  loader: await read('js/ui-feedback-init.js'),
  lab: await read('recruiter-state-lab.html'),
  labController: await read('js/recruiter-state-lab.js'),
  styles: await read('css/senior-commerce-states.css'),
  contract: JSON.parse(await read('uiux-state-coverage.json')),
  packageJson: JSON.parse(await read('package.json')),
};

const checks = [
  ['senior commerce runtime is loaded', files.loader.includes('senior-commerce-states.js')],
  ['wishlist uses native button normalization', files.runtime.includes("document.createElement('button')") && files.runtime.includes("button.type = 'button'")],
  ['wishlist is moved outside product link', files.runtime.includes("button.parentElement !== inner") && files.runtime.includes('inner.append(button)')],
  ['wishlist mobile target is at least 44px', files.styles.includes('min-width: 44px') && files.styles.includes('min-height: 44px')],
  ['empty state has semantic evidence', files.runtime.includes('data-state-evidence="empty"')],
  ['loading state has semantic evidence', files.runtime.includes('data-state-evidence="loading"') && files.runtime.includes("aria-busy', String(state === 'loading')")],
  ['error state is recoverable', files.runtime.includes('data-state-evidence="error"') && files.runtime.includes('data-collection-retry')],
  ['success state exposes next action', files.runtime.includes("notice.dataset.stateEvidence = 'success'") && files.runtime.includes('Review cart')],
  ['checkout preserves and reports invalid input', files.runtime.includes("form.addEventListener('invalid'") && files.runtime.includes('Your entered information has been kept')],
  ['checkout exposes submitting state', files.runtime.includes("form.setAttribute('aria-busy', 'true')") && files.runtime.includes('Placing order…')],
  ['checkout has recoverable storage failure', files.runtime.includes('This browser cannot save the order yet')],
  ['recruiter state lab exposes all four states', ['empty','loading','error','success'].every((state) => files.lab.includes(`data-state-option="${state}"`))],
  ['state lab controller pins state routes', files.labController.includes("&pin=1")],
  ['state contract owns four semantic states', files.contract.states?.length === 4 && ['empty','loading','error','success'].every((state) => files.contract.states.some((entry) => entry.id === state && entry.assertions?.length >= 2))],
  ['state contract covers desktop tablet mobile', files.contract.viewports?.length === 3 && ['desktop-1440','tablet-768','mobile-390'].every((name) => files.contract.viewports.some((entry) => entry.name === name))],
  ['qa script is registered', String(files.packageJson.scripts?.qa || '').includes('qa-senior-commerce-states.mjs')],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);

if (failures.length) {
  console.error(`Senior commerce state QA failed: ${failures.map(([label]) => label).join(', ')}`);
  process.exit(1);
}

console.log(`Senior commerce state source QA passed (${checks.length}/${checks.length}).`);
