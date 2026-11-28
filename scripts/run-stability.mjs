// Stability check of ONE feature: run its tests N times (no retries) and save a small summary.
// Usage: npm run test:stability -- <feature> [N=2] [--cpu 4] [-g "TC-022|TC-043"]
//   --cpu 4: slow the test page's CPU down 4x (Chromium) to reproduce races of a slow CI machine (fixture `page`, CPU_THROTTLE).
// Output: qa-runs/<feature>/run-results/stability-YYYYMMDD-HHMM.json (only counts per TC: no machine paths).
// API features (*-api): `api` project; the @bad-login group is EXCLUDED (--grep-invert @bad-login, RB-101 TD-27 /
//   HITL #1 Q12: never repeated) unless --include-bad-login is given. --cpu does not apply (no browser).
//   The @full group is also EXCLUDED unless --include-full is given or -g picks TCs; both go into ONE --grep-invert.
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
const isApi = feature.endsWith('-api');
const includeBadLogin = rest.includes('--include-bad-login');
if (includeBadLogin) rest.splice(rest.indexOf('--include-bad-login'), 1);
const includeFull = rest.includes('--include-full');
if (includeFull) rest.splice(rest.indexOf('--include-full'), 1);
const explicitGrep = rest.some((a) => a === '-g' || a === '--grep');
if (!rest.some((a) => a === '--project' || a.startsWith('--project='))) rest.unshift(`--project=${isApi ? 'api' : 'chromium'}`);
if (isApi) {
  const skip = [!includeBadLogin && '@bad-login', !includeFull && !explicitGrep && '@full'].filter(Boolean);
  if (skip.length) rest.push('--grep-invert', skip.join('|'));
}
const cpuAt = rest.indexOf('--cpu');
const cpu = cpuAt >= 0 ? Number(rest.splice(cpuAt, 2)[1]) : 0;
if (cpuAt >= 0 && isApi) {
  console.error('--cpu chỉ dùng cho test web (giả lập máy chậm trên trình duyệt); feature API không có trình duyệt');
  process.exit(2);
}
if (cpuAt >= 0 && !(cpu > 1)) {
  console.error('--cpu cần một số > 1, vd --cpu 4');
  process.exit(2);
}
const raw = path.join(os.tmpdir(), `stability-${process.pid}.json`);
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const args = [cli, 'test', spec, `--repeat-each=${n}`, '--retries=0', '--reporter=json', ...rest];
const run = spawnSync(process.execPath, args, { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 30, env: cpu ? { ...process.env, CPU_THROTTLE: String(cpu) } : process.env });
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
  for (const sp of s.specs ?? []) for (const t of sp.tests) if (t.projectName !== 'api-teardown') (perTest[sp.title.match(/TC-\d+/)?.[0] ?? sp.title] ??= []).push(t.status);
};
j.suites.forEach(walk);
const now = new Date();
const p2 = (x) => String(x).padStart(2, '0');
const id = `stability-${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}-${p2(now.getHours())}${p2(now.getMinutes())}`;
const out = {
  id,
  command: `npm run test:stability -- ${feature} ${n}${cpu ? ` --cpu ${cpu}` : ''}${rest.length ? ' ' + rest.join(' ') : ''}`,
  cpu_throttle: cpu || 1,
  stats: { expected: j.stats.expected, unexpected: j.stats.unexpected, flaky: j.stats.flaky, skipped: j.stats.skipped, duration_ms: Math.round(j.stats.duration) },
  not_expected: Object.entries(perTest).filter(([, v]) => v.some((x) => x !== 'expected')).map(([tc_id, outcomes]) => ({ tc_id, outcomes })),
  per_test: perTest,
};
const dir = path.join('qa-runs', feature, 'run-results');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(out, null, 2) + '\n');
console.log(`Ổn định: ${dir.replace(/\\/g, '/')}/${id}.json · ${out.stats.expected}/${out.stats.expected + out.stats.unexpected + out.stats.flaky} đúng như mong đợi · không ổn định: ${out.not_expected.length}`);
process.exit(out.not_expected.length ? 1 : 0);
