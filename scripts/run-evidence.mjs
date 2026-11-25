// Run ONE feature's tests in evidence mode, then rebuild that feature's evidence index.
// Usage: npm run test:evidence -- <feature> [-g "TC-028|TC-033"] [other playwright args]
//        npm run test:evidence -- <feature> --index-only     (only rebuild evidence/README.md, no test run)
// Works on Windows, macOS, Linux.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { csv } from './lib/csv.mjs';

const [feature, ...args] = process.argv.slice(2);
const spec = `tests/specs/${feature}.spec.ts`;
if (!feature || feature.startsWith('-') || !fs.existsSync(spec)) {
  console.error(`Usage: npm run test:evidence -- <feature> [-g "TC-001|TC-004"] [--index-only]\nKhông thấy ${spec}`);
  process.exit(2);
}

let status = 0;
const indexOnly = args.includes('--index-only');
if (!indexOnly) {
  // Run the Playwright CLI with Node directly, WITHOUT a shell.
  // (With a shell, Windows cmd treats | & < > as commands: -g "TC-028|TC-033" was cut at "|" and no test ran.)
  // Spec path + -g = only this feature's tests, so other features' evidence is never overwritten.
  const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
  const run = spawnSync(process.execPath, [cli, 'test', spec, ...args], {
    stdio: 'inherit',
    env: { ...process.env, EVIDENCE: '1' },
  });
  status = run.status ?? 1;
  if (status !== 0) {
    console.error(`\n⚠️  Playwright exit code ${status}: có test Failed hoặc KHÔNG có test nào chạy. Đọc kỹ log ở trên trước khi tin evidence.\n`);
  }
}

// Build qa-runs/<feature>/evidence/README.md
const evDir = path.resolve('qa-runs', feature, 'evidence');
if (fs.existsSync(evDir)) {
  const list = (sub) => {
    const d = path.join(evDir, sub);
    return fs.existsSync(d) ? fs.readdirSync(d).sort() : [];
  };
  const firstLine = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n')[0].replace(/^# /, '') : '');
  const resultLine = (p) => (fs.existsSync(p) ? (fs.readFileSync(p, 'utf8').match(/\*\*Kết quả\*\*: (.+)/)?.[1] ?? '').trim() : '');
  const field = (p, name) => (fs.existsSync(p) ? (fs.readFileSync(p, 'utf8').match(new RegExp(String.raw`\*\*${name}\*\*: (.+)`))?.[1] ?? '').trim() : '');
  // Screen of each TC (multi-screen features have a `screen` column in test-cases.csv, CLAUDE.md point 7)
  const csvPath = path.resolve('qa-runs', feature, 'test-cases.csv');
  const screenOf = Object.fromEntries(
    (fs.existsSync(csvPath) ? csv(fs.readFileSync(csvPath, 'utf8')) : []).filter((r) => r.screen).map((r) => [r.tc_id, r.screen])
  );
  const hasScreens = Object.keys(screenOf).length > 0;
  const caseReadme = (tc) => path.join(evDir, 'all-cases', tc, 'README.md');
  // Group = the test.describe of the spec (= screen section, same split as q-and-a / known-issues)
  const groupOf = (tc) => field(caseReadme(tc), 'Nhóm') || '(chưa có nhóm: chạy lại evidence)';
  const cases = list('all-cases');
  // Screen sections first (Màn hình 1, 2, 3…), the shared "Chung" section last, like q-and-a / known-issues
  const groups = [...new Set(cases.map(groupOf))].sort((a, b) => Number(a.startsWith('Chung')) - Number(b.startsWith('Chung')) || a.localeCompare(b, 'vi', { numeric: true }));
  const bugNo = (b) => Number(b.match(/BUG-(\d+)/)?.[1] ?? 0);
  const bugRows = list('bugs')
    .sort((a, b) => bugNo(a) - bugNo(b))
    .flatMap((b) =>
      list(path.join('bugs', b)).map((sub) => {
        const label = sub === 'manual' ? 'Tái hiện độc lập' : sub;
        const screen = hasScreens ? ` ${screenOf[sub] ?? ''} |` : '';
        return `| ${b} |${screen} ${label} | [bugs/${b}/${sub}](<bugs/${b}/${sub}/README.md>) |`;
      })
    );
  const caseRow = (tc) => `| ${firstLine(caseReadme(tc))} |${hasScreens ? ` ${screenOf[tc] ?? ''} |` : ''} ${resultLine(caseReadme(tc))} | [all-cases/${tc}](all-cases/${tc}/README.md) |`;
  const caseHead = hasScreens ? ['| Test case | Màn hình của TC | Kết quả | Thư mục |', '|---|---|---|---|'] : ['| Test case | Kết quả | Thư mục |', '|---|---|---|'];
  const lines = [
    `# Evidence: ${feature}`,
    '',
    `> Tạo tự động bởi \`npm run test:evidence\` lúc ${new Date().toISOString()}.`,
    '> Mỗi ảnh có **khung đỏ** khoanh vùng cần xem và dòng **"Cần xem"** nói rõ phải kiểm tra gì. Test case có bug (hoặc kết quả bất thường) có thêm video.',
    '> Thư mục `manual/` trong từng bug: ảnh **tái hiện độc lập** (script riêng `npm run repro`, không dùng code test), tách khỏi ảnh của test tự động.',
    '',
    '## Bug (theo ticket)',
    hasScreens ? '| Ticket_BUG | Màn hình của TC | Nội dung | Thư mục |' : '| Ticket_BUG | Nội dung | Thư mục |',
    hasScreens ? '|---|---|---|---|' : '|---|---|---|',
    ...bugRows,
    '',
    '## Tất cả test case',
    ...(groups.length > 1
      ? groups.flatMap((g) => ['', `### ${g}`, ...caseHead, ...cases.filter((tc) => groupOf(tc) === g).map(caseRow)])
      : [...caseHead, ...cases.map(caseRow)]),
    '',
  ];
  fs.writeFileSync(path.join(evDir, 'README.md'), lines.join('\n'));
  console.log(`Evidence index: ${path.relative(process.cwd(), path.join(evDir, 'README.md'))}`);
}
process.exit(status);
