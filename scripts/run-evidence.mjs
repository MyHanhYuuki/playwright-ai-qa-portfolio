// Run tests in evidence mode, then build an index of all evidence.
// Usage: npm run test:evidence [-- <playwright args>]   (works on Windows, macOS, Linux)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// Run the Playwright CLI with Node directly, WITHOUT a shell.
// (With a shell, Windows cmd treats | & < > as commands: -g "TC-028|TC-033" was cut at "|" and no test ran.)
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const args = process.argv.slice(2);
const run = spawnSync(process.execPath, [cli, 'test', 'tests/specs', ...args], {
  stdio: 'inherit',
  env: { ...process.env, EVIDENCE: '1' },
});
if (run.status !== 0) {
  console.error(`\n⚠️  Playwright exit code ${run.status}: có test Failed hoặc KHÔNG có test nào chạy. Đọc kỹ log ở trên trước khi tin evidence.\n`);
}

// Build qa-runs/<feature>/evidence/README.md
const qaRuns = path.resolve('qa-runs');
for (const feature of fs.readdirSync(qaRuns)) {
  const evDir = path.join(qaRuns, feature, 'evidence');
  if (!fs.existsSync(evDir)) continue;
  const list = (sub) => {
    const d = path.join(evDir, sub);
    return fs.existsSync(d) ? fs.readdirSync(d).sort() : [];
  };
  const firstLine = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n')[0].replace(/^# /, '') : '');
  const resultLine = (p) => (fs.existsSync(p) ? (fs.readFileSync(p, 'utf8').match(/\*\*Kết quả\*\*: (.+)/)?.[1] ?? '').trim() : '');
  const lines = [
    `# Evidence: ${feature}`,
    '',
    `> Tạo tự động bởi \`npm run test:evidence\` lúc ${new Date().toISOString()}.`,
    '> Mỗi ảnh có **khung đỏ** khoanh vùng cần xem và dòng **"Cần xem"** nói rõ phải kiểm tra gì. Mỗi test case có video.',
    '',
    '## Bug (theo ticket)',
    '| Ticket_KI | Test case | Thư mục |',
    '|---|---|---|',
    ...list('bugs').flatMap((b) =>
      list(path.join('bugs', b)).map((tc) => `| ${b} | ${tc} | [bugs/${b}/${tc}](<bugs/${b}/${tc}/README.md>) |`)
    ),
    '',
    '## Tất cả test case',
    '| Test case | Kết quả | Thư mục |',
    '|---|---|---|',
    ...list('all-cases').map((tc) => {
      const readme = path.join(evDir, 'all-cases', tc, 'README.md');
      return `| ${firstLine(readme)} | ${resultLine(readme)} | [all-cases/${tc}](all-cases/${tc}/README.md) |`;
    }),
    '',
  ];
  fs.writeFileSync(path.join(evDir, 'README.md'), lines.join('\n'));
  console.log(`Evidence index: ${path.relative(process.cwd(), path.join(evDir, 'README.md'))}`);
}
process.exit(run.status ?? 1);
