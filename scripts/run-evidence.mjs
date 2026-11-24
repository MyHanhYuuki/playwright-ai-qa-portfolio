// Run ONE feature's tests in evidence mode, then rebuild that feature's evidence index.
// Usage: npm run test:evidence -- <feature> [-g "TC-028|TC-033"] [other playwright args]
//        npm run test:evidence -- <feature> --index-only     (only rebuild evidence/README.md, no test run)
// Works on Windows, macOS, Linux.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

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
  const lines = [
    `# Evidence: ${feature}`,
    '',
    `> Tạo tự động bởi \`npm run test:evidence\` lúc ${new Date().toISOString()}.`,
    '> Mỗi ảnh có **khung đỏ** khoanh vùng cần xem và dòng **"Cần xem"** nói rõ phải kiểm tra gì. Mỗi test case có video.',
    '> Thư mục `manual/` trong từng bug: ảnh tái hiện bằng tay, không do test tự động sinh ra.',
    '',
    '## Bug (theo ticket)',
    '| Ticket_BUG | Nội dung | Thư mục |',
    '|---|---|---|',
    ...list('bugs').flatMap((b) =>
      list(path.join('bugs', b)).map((sub) => {
        const label = sub === 'manual' ? 'Tái hiện bằng tay' : sub;
        return `| ${b} | ${label} | [bugs/${b}/${sub}](<bugs/${b}/${sub}/README.md>) |`;
      })
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
process.exit(status);
