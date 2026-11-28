// Run the tests of ONE feature and save a summary for triage + RTM.
// Usage: npm run test:run -- <feature> [-g "TC-001|TC-004"] [--triggered-by healer-round-1] [other playwright args]
// Project: a feature named *-api runs in the `api` project (no browser, + api-teardown sweep), others in `chromium`.
// API features: test:run is THE run that includes the @bad-login group (once per session, RB-101 TD-27).
//   The @full group (e.g. RB-102 TC-013, TC-067) is excluded unless --include-full is given or -g picks TCs (HITL #2 item 11).
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
// Web and API are separate Playwright projects (playwright.config.ts): pick the feature's project unless given
const isApi = feature.endsWith('-api');
const project = isApi ? 'api' : 'chromium';
if (!rest.some((a) => a === '--project' || a.startsWith('--project='))) rest.unshift(`--project=${project}`);
const fullAt = rest.indexOf('--include-full');
const includeFull = fullAt >= 0;
if (includeFull) rest.splice(fullAt, 1);
const explicitGrep = rest.some((a) => a === '-g' || a === '--grep');
if (isApi && !includeFull && !explicitGrep) rest.push('--grep-invert', '@full');
const gIndex = rest.findIndex((a) => a === '-g' || a === '--grep');
// 'full' only when nothing is filtered out; the default API run drops @full (RTM then warns: those TCs show "Not run", review N1)
const scope = gIndex >= 0 ? `subset:${rest[gIndex + 1]}` : isApi && !includeFull ? 'default:không @full' : 'full';

const now = new Date();
const p2 = (n) => String(n).padStart(2, '0');
// UTC, same clock as the run name inside the API data (QA-RB101-<yyyymmdd>-<hhmmss>, review C3)
const runId = `run-${now.getUTCFullYear()}${p2(now.getUTCMonth() + 1)}${p2(now.getUTCDate())}-${p2(now.getUTCHours())}${p2(now.getUTCMinutes())}${p2(now.getUTCSeconds())}`;
const outDir = path.join('qa-runs', feature, 'run-results');
fs.mkdirSync(outDir, { recursive: true });
const raw = path.join(outDir, `raw-${runId}.json`);

// Spec path + --grep = only this feature's tests (Playwright applies BOTH filters). No shell → args stay intact.
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const run = spawnSync(process.execPath, [cli, 'test', spec, '--reporter=line,json,html', ...rest], {
  stdio: 'inherit',
  // API features also write the API evidence (README only, no browser, ~free): ONE run gives results + evidence (review C1)
  env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: raw, ...(isApi ? { EVIDENCE: '1' } : {}) },
});
if (!fs.existsSync(raw)) {
  console.error('⚠️  Không có kết quả JSON, kiểm tra log ở trên.');
  process.exit(run.status ?? 1);
}

const j = JSON.parse(fs.readFileSync(raw, 'utf8'));
const strip = (s) => String(s ?? '').replace(/\x1b\[[0-9;]*m/g, '');
const clean = (s) => strip(s).split('\n')[0];
// Full message without the call log: keeps Expected / Received so triage can quote real values.
// The repo path is removed too, so no machine path ends up in the committed JSON.
const repoRoot = process.cwd();
// Three forms of the root: backslash, JSON-escaped (double backslash) and forward slash (review P1).
const rootForms = [...new Set([repoRoot, repoRoot.replace(/\\/g, '\\\\'), repoRoot.replace(/\\/g, '/')])];
const detail = (s) => rootForms.reduce((t, f) => t.split(f).join('<repo>'), strip(s).split(/\n\s*Call log:/)[0]).trim().slice(0, 1500);
const tests = [];
const teardown = []; // api-teardown: not a test case, kept as run info (ledger sweep, request / failed-login counts)
const walk = (s) => {
  (s.suites ?? []).forEach(walk);
  for (const sp of s.specs ?? [])
    for (const t of sp.tests) {
      if (t.projectName === 'api-teardown') {
        const r = t.results.at(-1) ?? {};
        teardown.push({ status: r.status, annotations: (r.annotations ?? []).map((a) => ({ type: a.type, description: a.description })) });
        continue;
      }
      const r = t.results.at(-1) ?? {};
      const errors = (r.errors ?? []).map((e) => clean(e.message)).filter(Boolean);
      const error_details = (r.errors ?? []).map((e) => detail(e.message)).filter(Boolean);
      tests.push({
        tc_id: sp.title.match(/TC-\d+/)?.[0] ?? sp.title,
        title: sp.title,
        status: r.status, // what really happened: passed | failed | timedOut | skipped
        expected_status: t.expectedStatus, // "failed" = known bug marked with test.fail()
        outcome: t.status, // Playwright verdict: expected | unexpected | flaky | skipped
        duration_ms: r.duration,
        retry_count: r.retry ?? 0,
        error: errors[0] ?? null,
        errors, // every error, incl. expect.soft (first line = assertion name)
        error_details, // same errors, full text with Expected / Received
        // test.info().annotations (e.g. BUG-17 timings, BUG-12 dialog text), without duplicates
        // Only type + description: Playwright adds `location.file` = absolute path on THIS machine (must not be committed)
        annotations: [...(t.annotations ?? []), ...(r.annotations ?? [])]
          .map((a) => ({ type: a.type, description: a.description }))
          .filter((a, i, all) => all.findIndex((b) => b.type === a.type && b.description === a.description) === i),
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
  browser: isApi ? 'none (api)' : 'chromium',
  project,
  summary: {
    total: tests.length,
    passed: count((t) => t.outcome === 'expected'), // Playwright view: includes known bugs that failed as expected
    failed: count((t) => t.outcome === 'unexpected'),
    flaky: count((t) => t.outcome === 'flaky'),
    skipped: count((t) => t.outcome === 'skipped'),
    expected_fail: count((t) => t.expected_status === 'failed' && t.status !== 'passed'), // known bugs still failing
  },
  total_duration_ms: Math.round(j.stats.duration),
  ...(teardown.length ? { api_teardown: teardown } : {}),
  tests,
};
const out = path.join(outDir, `${runId}.json`);
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
fs.rmSync(raw);
const s = summary.summary;
// test.fail() turns EVERY error into "expected", including errors of the test code itself.
// Flag known-bug tests whose errors look like a script problem, so they are not reported as the bug (executor: script-issue).
// API: EnvError = Heroku 503 / network (environment, not a bug); "Hết ngân sách" = bad-login budget used up (TD-27).
const SCRIPT_ERROR = /Test timeout of|Target page.*closed|ReferenceError|TypeError|SyntaxError|strict mode violation|EnvError|Hết ngân sách/;
// Scan the FULL text: with expect.soft(x, 'name') the first line is only the name (review-executor D1).
for (const t of tests.filter((x) => x.expected_status === 'failed' && x.error_details.some((e) => SCRIPT_ERROR.test(e)))) {
  const hit = t.error_details.find((e) => SCRIPT_ERROR.test(e));
  console.warn(`⚠️  ${t.tc_id}: test bug đã biết nhưng có lỗi giống lỗi code test (${hit.split('\n')[0]} → ${hit.match(SCRIPT_ERROR)[0]}). Phân loại script-issue, đừng tính là bug.`);
}
for (const t of teardown) console.log(`api-teardown (${t.status}): ${t.annotations.map((a) => a.description).join(' | ')}`);
console.log(`\nKết quả: ${out.replace(/\\/g, '/')} · ${s.total} test · Passed theo TC ${s.passed - s.expected_fail} · Failed theo TC ${s.failed + s.expected_fail} (bug đã biết ${s.expected_fail}) · flaky ${s.flaky} · skipped ${s.skipped}`);
// API: rebuild the evidence index (README) from the evidence just written (review C1)
if (isApi) {
  const ev = spawnSync(process.execPath, ['scripts/run-evidence.mjs', feature, '--index-only'], { stdio: 'inherit', env: { ...process.env, EVIDENCE_INDEX_CMD: 'npm run test:run' } });
  if (ev.status) console.warn(`⚠️  Dựng lại mục lục evidence lỗi, chạy tay: npm run test:evidence -- ${feature} --index-only`);
}
process.exit(run.status ?? 1);
