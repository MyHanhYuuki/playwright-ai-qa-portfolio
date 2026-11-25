// Stability check of ONE feature: run its tests N times (no retries) and save a small summary.
// Usage: npm run test:stability -- <feature> [N=2] [-g "TC-022|TC-043"]
// Output: qa-runs/<feature>/run-results/stability-YYYYMMDD-HHMM.json (only counts per TC: no machine paths).
// It proves the tests are STABLE (same outcome every time). It does not store error text: the bug evidence is the official run (test:run).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';

const [feature, ...rest] = process.argv.slice(2);
const spec = `tests/specs/${feature}.spec.ts`;
if (!feature || !fs.existsSync(spec)) {
  console.error(`Usage: npm run test:stability -- <feature> [N=2] [-g "TC-001|TC-004"]\nKhông thấy ${spec}`);
  process.exit(2);
}
const n = /^\d+$/.test(rest[0] ?? '') ? Number(rest.shift()) : 2;
const raw = path.join(os.tmpdir(), `stability-${process.pid}.json`);
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const args = [cli, 'test', spec, `--repeat-each=${n}`, '--retries=0', '--reporter=json', ...rest];
const run = spawnSync(process.execPath, args, { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 30, env: process.env });
fs.writeFileSync(raw, run.stdout ?? '');
let j;
try {
  j = JSON.parse(fs.readFileSync(raw, 'utf8'));
} catch {
  console.error('⚠️  Không đọc được kết quả JSON của Playwright.');
  process.exit(run.status ?? 1);
} finally {
  fs.rmSync(raw, { force: true });
}
const perTest = {};
const walk = (s) => {
  (s.suites ?? []).forEach(walk);
  for (const sp of s.specs ?? []) for (const t of sp.tests) (perTest[sp.title.match(/TC-\d+/)?.[0] ?? sp.title] ??= []).push(t.status);
};
j.suites.forEach(walk);
const now = new Date();
const p2 = (x) => String(x).padStart(2, '0');
const id = `stability-${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}-${p2(now.getHours())}${p2(now.getMinutes())}`;
const out = {
  id,
  command: `npm run test:stability -- ${feature} ${n}${rest.length ? ' ' + rest.join(' ') : ''}`,
  stats: { expected: j.stats.expected, unexpected: j.stats.unexpected, flaky: j.stats.flaky, skipped: j.stats.skipped, duration_ms: Math.round(j.stats.duration) },
  not_expected: Object.entries(perTest).filter(([, v]) => v.some((x) => x !== 'expected')).map(([tc_id, outcomes]) => ({ tc_id, outcomes })),
  per_test: perTest,
};
const dir = path.join('qa-runs', feature, 'run-results');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(out, null, 2) + '\n');
console.log(`Ổn định: ${dir.replace(/\\/g, '/')}/${id}.json · ${out.stats.expected}/${out.stats.expected + out.stats.unexpected + out.stats.flaky} đúng như mong đợi · không ổn định: ${out.not_expected.length}`);
process.exit(out.not_expected.length ? 1 : 0);
