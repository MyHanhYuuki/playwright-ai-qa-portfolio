// Build the RTM (Requirement Traceability Matrix): AC → viewpoint → TC → result → bug.
// Usage: npm run rtm [-- <feature>]   (default: every folder in qa-runs/ that has test-cases.csv)
// Sources (all inside qa-runs/<feature>/):
//   requirement/requirement.md  "- **AC-n**: ..."      viewpoint.csv   test-cases.csv
//   run-results/run-*.json      newest run (tests[].tc_id, status)    defects.md (bug titles + status, optional)
// Output: rtm.md (readable on GitHub) + rtm-report.html (open in a browser).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('qa-runs');
const features = process.argv[2]
  ? [process.argv[2]]
  : fs.readdirSync(root).filter((f) => fs.existsSync(path.join(root, f, 'test-cases.csv')));

for (const feature of features) build(path.join(root, feature), feature);

function build(dir, feature) {
  const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
  const has = (f) => fs.existsSync(path.join(dir, f));

  // 1. Sources
  const acs = [...read('requirement/requirement.md').matchAll(/^- \*\*(AC-\d+)\*\*: (.+)$/gm)].map((m) => ({ id: m[1], text: m[2].replace(/\*\*/g, '') }));
  const tvps = csv(read('viewpoint.csv'));
  const tcs = csv(read('test-cases.csv'));
  const runDir = path.join(dir, 'run-results');
  const runFile = fs.readdirSync(runDir).filter((f) => /^run-.*\.json$/.test(f)).sort().pop();
  if (!runFile) throw new Error(`${feature}: no run-results/run-*.json`);
  const run = JSON.parse(fs.readFileSync(path.join(runDir, runFile), 'utf8'));
  const resultOf = Object.fromEntries(run.tests.map((t) => [t.tc_id, qcResult(t)]));
  const defects = has('defects.md') ? read('defects.md') : '';
  const bugTitle = Object.fromEntries([...defects.matchAll(/^### (BUG-\d+): (.+)$/gm)].map((m) => [m[1], m[2]]));
  // Summary table row: | [BUG-01](...) | ... | <status> |
  const bugStatus = Object.fromEntries(
    defects.split('\n').map((l) => l.match(/^\| \[?(BUG-\d+)\]?.*\| ([^|]+) \|$/)).filter(Boolean).map((m) => [m[1], m[2].trim()])
  );
  const split = (s) => (s ?? '').split(';').map((x) => x.trim()).filter(Boolean);
  const bugsOf = (tc) => [...new Set((tc.notes ?? '').match(/BUG-\d+/g) ?? [])];
  const evidence = (id) => (fs.existsSync(path.join(dir, 'evidence', 'all-cases', id)) ? `evidence/all-cases/${id}/README.md` : null);
  const anchor = (b) => (bugTitle[b] ? `defects.md#${slug(`${b}: ${bugTitle[b]}`)}` : null);

  // 2. Sanity checks: the RTM must not silently hide missing or extra results
  const warnings = [];
  if (run.scope && run.scope !== 'full') warnings.push(`Lần chạy ${runFile} có scope "${run.scope}", không phải full: TC không chạy sẽ hiện "Not run"`);
  if (run.summary?.total !== undefined && run.summary.total !== tcs.length) warnings.push(`Số test trong lần chạy (${run.summary.total}) khác số TC trong test-cases.csv (${tcs.length})`);
  const extra = run.tests.filter((t) => !tcs.some((tc) => tc.tc_id === t.tc_id)).map((t) => t.tc_id);
  if (extra.length) warnings.push(`Có trong lần chạy nhưng không có trong test-cases.csv: ${extra.join(', ')}`);
  const notRunIds = tcs.filter((tc) => !resultOf[tc.tc_id]).map((tc) => tc.tc_id);
  if (notRunIds.length) warnings.push(`TC chưa có kết quả: ${notRunIds.join(', ')}`);
  const noReport = [...new Set(tcs.flatMap(bugsOf))].filter((b) => !bugTitle[b]);
  if (has('defects.md') && noReport.length) warnings.push(`Bug được TC nhắc tới nhưng chưa có trong defects.md: ${noReport.join(', ')}`);

  // 3. Matrix: one row per (AC, TC). A TC linked to 2 ACs appears under both.
  // AC is "pass" only if EVERY linked TC is plainly Passed. Skipped / flaky / not run / "bug seems fixed" → needs a look.
  const perAc = acs.map((ac) => {
    const rows = tcs
      .filter((tc) => split(tc.linked_ac).includes(ac.id))
      .map((tc) => ({ ...tc, result: resultOf[tc.tc_id] ?? 'Not run', bugs: bugsOf(tc) }));
    const passed = rows.filter((r) => r.result === 'Passed').length;
    const failed = rows.filter((r) => r.result.startsWith('Failed')).length;
    const other = rows.length - passed - failed;
    const status = !rows.length ? 'gap' : failed ? 'fail' : other ? 'partial' : 'pass';
    return { ...ac, rows, vps: tvps.filter((v) => split(v.linked_ac).includes(ac.id)), passed, failed, other, status, bugs: [...new Set(rows.flatMap((r) => r.bugs))] };
  });
  const outScope = tvps.filter((v) => v.scope === 'out');
  const inScopeNoTc = tvps.filter((v) => v.scope === 'in' && !tcs.some((tc) => split(tc.viewpoint_id).includes(v.viewpoint_id)));
  const results = tcs.map((tc) => resultOf[tc.tc_id] ?? 'Not run');
  const count = (f) => results.filter(f).length;
  const openBugs = [...new Set(tcs.flatMap(bugsOf))].filter((b) => !/closed|fixed|done|đóng|đã sửa/i.test(bugStatus[b] ?? ''));
  const sum = {
    acTotal: acs.length,
    acCovered: perAc.filter((a) => a.rows.length).length,
    acPass: perAc.filter((a) => a.status === 'pass').length,
    tc: tcs.length,
    passed: count((r) => r === 'Passed'),
    failed: count((r) => r.startsWith('Failed')),
    skipped: count((r) => r === 'Skipped'),
    flaky: count((r) => r === 'Flaky'),
    check: count((r) => r.startsWith('Passed (')),
    notRun: count((r) => r === 'Not run'),
    manual: tcs.filter((tc) => tc.automation_feasibility && tc.automation_feasibility !== 'automatable').length,
    vpIn: tvps.length - outScope.length,
    vpOut: outScope.length,
  };
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const label = { pass: '✅ Đạt', fail: '❌ Chưa đạt (có bug)', partial: '⚠️ Cần xem lại (skip / flaky / chưa chạy)', gap: '⛔ Chưa có test case' };
  const extras = [
    sum.skipped && `⏭ Skipped ${sum.skipped}`,
    sum.flaky && `🔁 Flaky ${sum.flaky}`,
    sum.check && `⚠️ Bug có vẻ đã sửa ${sum.check}`,
    sum.notRun && `Not run ${sum.notRun}`,
  ].filter(Boolean);

  // 4. Markdown
  const c = (s) => String(s ?? '').replace(/\|/g, '\\|'); // escape table cells
  const mdBug = (b) => (anchor(b) ? `[${b}](${anchor(b)})` : b);
  const md = [
    `# RTM: ${feature}`,
    '',
    `> Ma trận truy vết **AC → viewpoint → test case → kết quả → bug**. Tạo tự động bởi \`npm run rtm\`, đừng sửa tay.`,
    `> Nguồn: [requirement](requirement/requirement.md) · [viewpoint.csv](viewpoint.csv) · [test-cases.csv](test-cases.csv) · kết quả [${runFile}](run-results/${runFile}) · [defects.md](defects.md)`,
    '',
    ...(warnings.length ? ['## ⚠️ Cảnh báo', ...warnings.map((w) => `- ${w}`), ''] : []),
    '## Tóm tắt',
    '| Chỉ số | Giá trị |',
    '|---|---|',
    `| AC có test case | **${sum.acCovered}/${sum.acTotal}** (${pct(sum.acCovered, sum.acTotal)}%) |`,
    `| AC đạt (mọi TC liên quan đều Passed) | **${sum.acPass}/${sum.acTotal}** (${pct(sum.acPass, sum.acTotal)}%) |`,
    `| Test case | ${sum.tc}: ✅ Passed ${sum.passed} · ❌ Failed ${sum.failed}${extras.length ? ` · ${extras.join(' · ')}` : ''} |`,
    `| Flaky · cần làm tay | ${sum.flaky} · ${sum.manual} |`,
    `| Viewpoint | ${sum.vpIn} trong phạm vi${inScopeNoTc.length ? ` (⛔ ${inScopeNoTc.length} chưa có TC: ${inScopeNoTc.map((v) => v.viewpoint_id).join(', ')})` : ', đều có TC'} · ${sum.vpOut} ngoài phạm vi |`,
    `| Bug đang mở | ${openBugs.length ? openBugs.map(mdBug).join(', ') : '0'} |`,
    '',
    '> **Kết quả** so với expected của test case. Test của bug đã biết dùng `test.fail()`: Playwright và file run ghi "passed" (fail đúng dự kiến), còn RTM ghi **Failed** vì web chưa làm đúng expected.',
    '',
    '## Theo AC',
    '| AC | Yêu cầu | Viewpoint | TC | Passed | Failed | Khác | Bug | Trạng thái |',
    '|---|---|---|---|---|---|---|---|---|',
    ...perAc.map((a) => `| ${a.id} | ${c(a.text)} | ${vpCount(a.vps)} | ${a.rows.length} | ${a.passed} | ${a.failed} | ${a.other} | ${a.bugs.map(mdBug).join(', ') || '–'} | ${label[a.status]} |`),
    '',
    '## Chi tiết',
    '| AC | Viewpoint | Test case | Kỹ thuật | Tự động | Kết quả | Bug |',
    '|---|---|---|---|---|---|---|',
    ...perAc.flatMap((a) =>
      a.rows.map((r) => {
        const ev = evidence(r.tc_id);
        const tc = `${ev ? `[${r.tc_id}](${ev})` : r.tc_id} ${c(r.title)}`;
        return `| ${a.id} | ${r.viewpoint_id} | ${tc} | ${c(r.technique || '–')} | ${c(r.automation_feasibility)} | ${icon(r.result)} | ${r.bugs.map(mdBug).join(', ') || '–'} |`;
      })
    ),
    '',
    '## Viewpoint ngoài phạm vi (đã cân nhắc, không test lần này)',
    '| Viewpoint | AC | Nội dung | Nguồn quyết định |',
    '|---|---|---|---|',
    ...outScope.map((v) => `| ${v.viewpoint_id} | ${c(v.linked_ac)} | ${c(v.description)} | ${c(v.source)} |`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'rtm.md'), md);

  // 5. HTML (same data, colored)
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const cls = (r) => (r === 'Passed' ? 'ok' : r.startsWith('Failed') ? 'ng' : 'na');
  const htmlBug = (b) => (anchor(b) ? `<a href="${esc(anchor(b))}">${b}</a>` : b);
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RTM ${esc(feature)}</title><style>
:root{--bg:#fff;--fg:#1a1a1a;--mute:#666;--line:#ddd;--ok:#1a7f37;--okbg:#dafbe1;--ng:#cf222e;--ngbg:#ffebe9;--na:#9a6700;--nabg:#fff8c5}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--fg:#e6edf3;--mute:#8b949e;--line:#30363d;--okbg:#12261e;--ngbg:#3c1618;--nabg:#3a2e00;--ok:#3fb950;--ng:#f85149;--na:#d29922}}
body{background:var(--bg);color:var(--fg);font:14px/1.5 system-ui,sans-serif;margin:0 auto;padding:16px;max-width:1200px}
h1{font-size:22px}h2{font-size:17px;margin-top:28px}.mute{color:var(--mute)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.card{border:1px solid var(--line);border-radius:8px;padding:10px}.card b{display:block;font-size:22px}
.warn{border:2px solid var(--na);background:var(--nabg);border-radius:8px;padding:8px 12px}
.wrap{overflow-x:auto}table{border-collapse:collapse;width:100%}th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
th{background:color-mix(in srgb,var(--line) 40%,transparent)}
.ok{background:var(--okbg);color:var(--ok);font-weight:600}.ng{background:var(--ngbg);color:var(--ng);font-weight:600}.na{background:var(--nabg);color:var(--na);font-weight:600}
td:first-child,.nw{white-space:nowrap}
a{color:inherit}</style></head><body>
<h1>RTM: ${esc(feature)}</h1>
<p class="mute">Ma trận truy vết AC → viewpoint → test case → kết quả → bug · kết quả từ ${esc(runFile)} · tạo bởi <code>npm run rtm</code></p>
${warnings.length ? `<div class="warn"><b>⚠️ Cảnh báo</b><ul>${warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
<div class="cards">
<div class="card">AC có test case<b>${sum.acCovered}/${sum.acTotal}</b></div>
<div class="card">AC đạt<b>${sum.acPass}/${sum.acTotal}</b></div>
<div class="card">Test case Passed<b>${sum.passed}/${sum.tc}</b></div>
<div class="card">Test case Failed<b>${sum.failed}</b></div>
<div class="card">Skipped · Flaky · Not run<b>${sum.skipped} · ${sum.flaky} · ${sum.notRun}</b></div>
<div class="card">Bug đang mở<b>${openBugs.length}</b></div></div>
<p class="mute">Kết quả so với expected của test case. Test bug đã biết dùng <code>test.fail()</code>: Playwright ghi "passed", RTM ghi Failed. Link tới file <code>.md</code> nên xem trên GitHub (trình duyệt chỉ hiện text thô).</p>
<h2>Theo AC</h2><div class="wrap"><table><tr><th>AC</th><th>Yêu cầu</th><th>Viewpoint</th><th>TC</th><th>Passed</th><th>Failed</th><th>Khác</th><th>Bug</th><th>Trạng thái</th></tr>
${perAc.map((a) => `<tr><td>${a.id}</td><td>${esc(a.text)}</td><td>${esc(vpCount(a.vps))}</td><td>${a.rows.length}</td><td>${a.passed}</td><td>${a.failed}</td><td>${a.other}</td><td class="nw">${a.bugs.map(htmlBug).join(', ') || '–'}</td><td class="${{ pass: 'ok', fail: 'ng' }[a.status] ?? 'na'}">${label[a.status]}</td></tr>`).join('\n')}
</table></div>
<h2>Chi tiết</h2><div class="wrap"><table><tr><th>AC</th><th>Viewpoint</th><th>Test case</th><th>Kỹ thuật</th><th>Tự động</th><th>Kết quả</th><th>Bug</th></tr>
${perAc.flatMap((a) => a.rows.map((r) => { const ev = evidence(r.tc_id); return `<tr><td>${a.id}</td><td>${r.viewpoint_id}</td><td>${ev ? `<a href="${ev}">${r.tc_id}</a>` : r.tc_id} ${esc(r.title)}</td><td>${esc(r.technique || '–')}</td><td>${esc(r.automation_feasibility)}</td><td class="${cls(r.result)}">${esc(r.result)}</td><td class="nw">${r.bugs.map(htmlBug).join(', ') || '–'}</td></tr>`; })).join('\n')}
</table></div>
<h2>Viewpoint ngoài phạm vi</h2><div class="wrap"><table><tr><th>Viewpoint</th><th>AC</th><th>Nội dung</th><th>Nguồn quyết định</th></tr>
${outScope.map((v) => `<tr><td>${v.viewpoint_id}</td><td>${esc(v.linked_ac)}</td><td>${esc(v.description)}</td><td>${esc(v.source)}</td></tr>`).join('\n')}
</table></div></body></html>
`;
  fs.writeFileSync(path.join(dir, 'rtm-report.html'), html);
  console.log(`RTM: ${path.relative(process.cwd(), path.join(dir, 'rtm.md'))} + rtm-report.html · AC ${sum.acPass}/${sum.acTotal} đạt · TC ${sum.passed}/${sum.tc} Passed · ${openBugs.length} bug mở`);
  for (const w of warnings) console.warn(`⚠️  ${w}`);

  function vpCount(vps) {
    const out = vps.filter((v) => v.scope === 'out').length;
    return `${vps.length - out}${out ? ` (+${out} ngoài phạm vi)` : ''}`;
  }
}

/** QC result vs the TC expected result. A test.fail() test that failed = Failed (known bug). */
function qcResult(t) {
  if (t.outcome === 'flaky' || t.status === 'flaky') return 'Flaky';
  if (t.status === 'passed') return t.expected_status === 'failed' ? 'Passed (bug có vẻ đã sửa, kiểm tra lại)' : 'Passed';
  if (t.status === 'skipped') return 'Skipped';
  return t.status === 'timedOut' ? 'Failed (timeout)' : 'Failed';
}

function icon(r) {
  return r === 'Passed' ? '✅ Passed' : r.startsWith('Failed') ? `❌ ${r}` : `⚠️ ${r}`;
}

/** GitHub heading anchor: lowercase, drop punctuation (keep letters, marks, digits, space, _ and -), space → -. */
function slug(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
}

/** Minimal CSV parser (quotes, commas and newlines inside quotes). */
function csv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}
