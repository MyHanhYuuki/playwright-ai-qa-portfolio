import fs from 'node:fs';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';
import { BUG_TICKETS } from '../data/bugs';
import { EVIDENCE_ENABLED } from '../utils/evidence';
import type { RbApi } from './rb-client';

/**
 * Lightweight evidence for API tests (no browser, no screenshot): one README per test case with the steps and a
 * summary of every request / response (method, path, status, key headers, body excerpt).
 * Tokens, cookies, Authorization and passwords are masked by RbApi.mask() before they are recorded.
 * Same layout as the web evidence, so `npm run test:evidence -- <feature>` builds the same index:
 *   qa-runs/<spec-name>/evidence/all-cases/TC-xxx/README.md
 *   qa-runs/<spec-name>/evidence/bugs/<ticket>_<BUG>/TC-xxx/README.md   (copies for @BUG-xx test cases)
 */
export function writeApiEvidence(api: RbApi, info: TestInfo) {
  if (!EVIDENCE_ENABLED) return;
  const tcId = info.title.match(/TC-\d+/)?.[0] ?? 'misc';
  const feature = path.basename(info.file).replace(/\.spec\.ts$/, '');
  const root = path.join(info.project.testDir, '..', 'qa-runs', feature, 'evidence');
  const dirs = [
    path.join(root, 'all-cases', tcId),
    ...info.tags
      .map((t) => t.match(/^@(BUG-\d+)$/)?.[1])
      .filter((id): id is string => !!id)
      .map((id) => path.join(root, 'bugs', `${BUG_TICKETS[id] ?? '[id_bug]'}_${id}`, tcId)),
  ];

  const bugs = info.tags.filter((t) => /^@BUG-\d+$/.test(t)).map((t) => t.slice(1)).join(', ');
  const s = info.status;
  const result = s === 'passed' ? '✅ Passed' : s === 'skipped' ? '⏭ Skipped' : s === 'timedOut' ? '❌ Failed (timeout)' : '❌ Failed';
  const remark =
    bugs && s === 'failed' ? ` · Bug: ${bugs}`
    : bugs && s === 'passed' ? ` · ⚠️ Bug ${bugs} có vẻ đã được sửa: kiểm tra lại rồi bỏ test.fail()`
    : '';
  // Same check as scripts/run-tests.mjs: test.fail() turns every error into "expected", incl. errors of the test code
  const SCRIPT_ERROR = /Test timeout of|ReferenceError|TypeError|SyntaxError|EnvError|Hết ngân sách/;
  const scriptError = info.errors
    .map((e) => api.mask((e.message ?? '').replace(/\x1b\[[0-9;]*m/g, '')))
    .filter((m) => SCRIPT_ERROR.test(m))
    .map((m) => `${m.split('\n')[0]} → ${m.match(SCRIPT_ERROR)![0]}`)[0];
  if (scriptError) console.warn(`⚠️  ${tcId}: lỗi giống lỗi code test / môi trường (${scriptError}). Evidence chưa đủ tin cậy.`);

  const cell = (v: string) => v.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  const code = (v: string) => (v ? `\`${cell(v).replace(/`/g, "'")}\`` : '(trống)');
  const hdr = (h: Record<string, string>) => Object.entries(h).map(([k, v]) => `${k}: ${v}`).join(' · ') || '–';
  const stepBlocks = api.steps.flatMap((st) => {
    const calls = api.calls.filter((c) => c.step === st.no);
    return [
      `### ${st.name}`,
      ...(st.note ? ['', `> 🔍 Cần xem: ${st.note}`] : []),
      '',
      ...(calls.length
        ? [
            '| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |',
            '|---|---|---|---|---|---|---|---|',
            ...calls.map(
              (c, i) =>
                `| ${i + 1} | ${code(`${c.method} ${c.target}`)}${c.via === 'APIRequestContext' ? '' : ` (${c.via})`} | ${cell(hdr(c.reqHeaders))} | ${code(c.reqBody)} | ${c.error ? `– (${cell(c.error)})` : `**${c.status}**`} | ${cell(hdr(c.resHeaders))} | ${code(c.resBody)} | ${c.ms} |`,
            ),
          ]
        : ['(không gửi request ở bước này)']),
      '',
    ];
  });
  const notes = info.annotations.filter((a) => a.type !== 'fail').map((a) => `| ${cell(a.type)} | ${cell(api.mask(a.description ?? ''))} |`);
  const readme = [
    `# ${info.title}`,
    '',
    `- **Kết quả**: ${result}${remark}`,
    ...(scriptError ? [`- ⚠️ **Lỗi code test / môi trường**: \`${cell(scriptError)}\` (không phải bug, cần xem lại rồi chạy lại)`] : []),
    `- **Nhóm**: ${info.titlePath.slice(1, -1).filter(Boolean).join(' › ') || '(không có)'}`,
    `- **Tags**: ${info.tags.join(' ')}`,
    `- **Thời điểm**: ${new Date().toISOString()}`,
    `- **Số request**: ${api.requestCount} (đăng nhập thất bại: ${api.failedLogins})`,
    '- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).',
    '',
    ...stepBlocks,
    ...(info.errors.length
      ? ['## Lỗi ghi nhận', '', ...info.errors.map((e) => `- \`${cell(api.mask((e.message ?? '').replace(/\x1b\[[0-9;]*m/g, '').split('\n')[0]))}\``), '']
      : []),
    ...(notes.length ? ['## Ghi nhận (annotation)', '', '| Loại | Nội dung |', '|---|---|', ...notes, ''] : []),
  ].join('\n');
  for (const d of dirs) {
    fs.rmSync(d, { recursive: true, force: true });
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'README.md'), readme);
  }
}
