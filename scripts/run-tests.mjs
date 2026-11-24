// Run the tests of ONE feature and save a summary for triage + RTM.
// Usage: npm run test:run -- <feature> [-g "TC-001|TC-004"] [--triggered-by healer-round-1] [other playwright args]
// Output: qa-runs/<feature>/run-results/run-YYYYMMDD-HHMMSS.json (schema: .claude/agents/executor.md)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [feature, ...rest] = process.argv.slice(2);
const spec = `tests/specs/${feature}.spec.ts`;
if (!feature || !fs.existsSync(spec)) {
  console.error(`Usage: npm run test:run -- <feature> [-g "TC-001|TC-004"]\nKhông thấy ${spec}`);
  process.exit(2);
}
let triggeredBy = 'orchestrator';
const tbIndex = rest.indexOf('--triggered-by');
if (tbIndex >= 0) triggeredBy = rest.splice(tbIndex, 2)[1];
// The JSON reporter is required for the summary: drop any --reporter the caller passed (it would replace ours).
for (let i = rest.length - 1; i >= 0; i--) {
  if (rest[i].startsWith('--reporter=')) rest.splice(i, 1);
  else if (rest[i] === '--reporter') rest.splice(i, 2);
}
const gIndex = rest.findIndex((a) => a === '-g' || a === '--grep');
const scope = gIndex >= 0 ? `subset:${rest[gIndex + 1]}` : 'full';

const now = new Date();
const p2 = (n) => String(n).padStart(2, '0');
const runId = `run-${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}-${p2(now.getHours())}${p2(now.getMinutes())}${p2(now.getSeconds())}`;
const outDir = path.join('qa-runs', feature, 'run-results');
fs.mkdirSync(outDir, { recursive: true });
const raw = path.join(outDir, `raw-${runId}.json`);

// Spec path + --grep = only this feature's tests (Playwright applies BOTH filters). No shell → args stay intact.
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const run = spawnSync(process.execPath, [cli, 'test', spec, '--reporter=line,json,html', ...rest], {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: raw },
});
if (!fs.existsSync(raw)) {
  console.error('⚠️  Không có kết quả JSON, kiểm tra log ở trên.');
  process.exit(run.status ?? 1);
}

const j = JSON.parse(fs.readFileSync(raw, 'utf8'));
const clean = (s) => String(s ?? '').replace(/\x1b\[[0-9;]*m/g, '').split('\n')[0];
const tests = [];
const walk = (s) => {
  (s.suites ?? []).forEach(walk);
  for (const sp of s.specs ?? [])
    for (const t of sp.tests) {
      const r = t.results.at(-1) ?? {};
      const errors = (r.errors ?? []).map((e) => clean(e.message)).filter(Boolean);
      tests.push({
        tc_id: sp.title.match(/TC-\d+/)?.[0] ?? sp.title,
        title: sp.title,
        status: r.status, // what really happened: passed | failed | timedOut | skipped
        expected_status: t.expectedStatus, // "failed" = known bug marked with test.fail()
        outcome: t.status, // Playwright verdict: expected | unexpected | flaky | skipped
        duration_ms: r.duration,
        retry_count: r.retry ?? 0,
        error: errors[0] ?? null,
        errors, // every error, incl. expect.soft
      });
    }
};
j.suites.forEach(walk);
tests.sort((a, b) => a.tc_id.localeCompare(b.tc_id));
const count = (f) => tests.filter(f).length;
const summary = {
  run_id: runId,
  triggered_by: triggeredBy,
  scope,
  browser: 'chromium',
  summary: {
    total: tests.length,
    passed: count((t) => t.outcome === 'expected'), // Playwright view: includes known bugs that failed as expected
    failed: count((t) => t.outcome === 'unexpected'),
    flaky: count((t) => t.outcome === 'flaky'),
    skipped: count((t) => t.outcome === 'skipped'),
    expected_fail: count((t) => t.expected_status === 'failed' && t.status !== 'passed'), // known bugs still failing
  },
  total_duration_ms: Math.round(j.stats.duration),
  tests,
};
const out = path.join(outDir, `${runId}.json`);
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
fs.rmSync(raw);
const s = summary.summary;
console.log(`\nKết quả: ${out.replace(/\\/g, '/')} · ${s.total} test · Passed theo TC ${s.passed - s.expected_fail} · Failed theo TC ${s.failed + s.expected_fail} (bug đã biết ${s.expected_fail}) · flaky ${s.flaky} · skipped ${s.skipped}`);
process.exit(run.status ?? 1);
