import fs from 'node:fs/promises';
import path from 'node:path';

const rawDir = path.resolve('qa/evidence/raw');
const entries = await fs.readdir(rawDir, { withFileTypes: true });
const reports = [];

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
  const file = path.join(rawDir, entry.name);
  const report = JSON.parse(await fs.readFile(file, 'utf8'));
  reports.push({ capture: entry.name.replace(/\.json$/, ''), ...report });
}

const blockers = reports.filter((report) =>
  (Array.isArray(report.errors) && report.errors.length > 0) ||
  (Array.isArray(report.failedResponses) && report.failedResponses.length > 0) ||
  Number(report.scrollWidth || 0) > Number(report.clientWidth || 0) + 2
);

if (blockers.length) {
  console.error(`Runtime quality gate failed for ${blockers.length} capture(s).`);
  for (const blocker of blockers) {
    console.error(JSON.stringify({
      capture: blocker.capture,
      scrollWidth: blocker.scrollWidth,
      clientWidth: blocker.clientWidth,
      errors: blocker.errors || [],
      failedResponses: blocker.failedResponses || [],
    }));
  }
  process.exit(1);
}

console.log(`Runtime quality gate passed for ${reports.length} rendered capture(s).`);
