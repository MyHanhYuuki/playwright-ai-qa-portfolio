import fs from 'node:fs';
import path from 'node:path';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { BUG_TICKETS } from '../data/bugs';

/** Evidence is only captured when EVIDENCE=1 (npm run test:evidence). Normal runs and CI stay fast. */
export const EVIDENCE_ENABLED = !!process.env.EVIDENCE;
/** EVIDENCE_ALL_VIDEOS=1: also record a video for passing test cases (default: only known-bug / unexpected results). */
const ALL_VIDEOS = !!process.env.EVIDENCE_ALL_VIDEOS;

type ShotOptions = {
  /** Element(s) to circle in red. */
  highlight?: Locator | Locator[];
  /** What the reviewer must check on this screenshot (printed on the image). */
  note?: string;
};

/**
 * Captures annotated step screenshots + video for one test case.
 *
 * qa-runs/<spec-name>/evidence/
 *   all-cases/TC-xxx/  01-<step>.jpg, 02-<step>.jpg, README.md (+ video.webm for known-bug / unexpected results)
 *   bugs/<ticket>_<BUG>/  copies for test cases tagged @BUG-xx
 */
export class Evidence {
  private step = 0;
  private rows: string[] = [];
  readonly tcId: string;
  readonly dir: string;
  readonly bugDirs: string[];

  constructor(private page: Page, private info: TestInfo) {
    this.tcId = info.title.match(/TC-\d+/)?.[0] ?? 'misc';
    const feature = path.basename(info.file).replace(/\.spec\.ts$/, '');
    // project.testDir = <repo>/tests
    const root = path.join(info.project.testDir, '..', 'qa-runs', feature, 'evidence');
    this.dir = path.join(root, 'all-cases', this.tcId);
    this.bugDirs = info.tags
      .map((t) => t.match(/^@(BUG-\d+)$/)?.[1])
      .filter((id): id is string => !!id)
      .map((id) => path.join(root, 'bugs', `${BUG_TICKETS[id] ?? '[id_bug]'}_${id}`, this.tcId));
    if (EVIDENCE_ENABLED) {
      for (const d of [this.dir, ...this.bugDirs]) {
        fs.mkdirSync(d, { recursive: true });
        // Clear the previous run, but KEEP an existing video: passing test cases no longer record one,
        // and videos recorded by earlier runs stay (decision 2026-11-25). A new video overwrites it.
        for (const f of fs.readdirSync(d)) if (f !== 'video.webm') fs.rmSync(path.join(d, f), { recursive: true, force: true });
      }
    }
  }

  /** Take an annotated screenshot of the current step. */
  async shot(name: string, opts: ShotOptions = {}) {
    if (!EVIDENCE_ENABLED) return;
    this.step++;
    // Let images finish loading so boxes are measured on the final layout (TC-005 box was a sliver).
    await this.page
      .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 3_000 })
      .catch(() => {});
    // A locator may match several elements (e.g. all 6 prices): box EACH one.
    // boundingBox() on a multi-match throws a strict-mode error, and the .catch below used to hide it (no red box).
    const marks: Locator[] = [];
    for (const m of opts.highlight ? ([] as Locator[]).concat(opts.highlight) : []) marks.push(...(await m.all()));
    const boxes = [];
    for (const m of marks) {
      // Short timeout: an element that is NOT on the page (often the very sign of the bug) must not block the test.
      // Without it, boundingBox() waited until the test timeout and hid the remaining checks (TC-018 evidence run).
      const b = await m.boundingBox({ timeout: 1_000 }).catch(() => null);
      if (b) boxes.push(b);
    }
    const header = `${this.tcId} · Bước ${this.step}: ${name}`;
    await this.page.evaluate(
      ({ boxes, header, note }) => {
        const root = document.createElement('div');
        root.id = '__evidence__';
        root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
        const tag = document.createElement('div');
        tag.textContent = header;
        tag.style.cssText =
          'position:fixed;left:8px;top:8px;background:#111;color:#fff;font:600 13px/1.4 sans-serif;padding:4px 8px;border-radius:4px;opacity:.9';
        root.appendChild(tag);
        for (const b of boxes) {
          const d = document.createElement('div');
          d.style.cssText = `position:fixed;left:${b.x - 5}px;top:${b.y - 5}px;width:${b.width + 10}px;height:${b.height + 10}px;border:3px solid #e60000;border-radius:6px;box-shadow:0 0 0 2px #fff`;
          root.appendChild(d);
        }
        if (note) {
          const n = document.createElement('div');
          n.textContent = '🔍 Cần xem: ' + note;
          n.style.cssText =
            'position:fixed;left:8px;right:8px;bottom:8px;background:#fff3cd;border:2px solid #e60000;color:#000;font:600 14px/1.4 sans-serif;padding:6px 10px;border-radius:6px';
          root.appendChild(n);
        }
        document.body.appendChild(root);
      },
      { boxes, header, note: opts.note }
    );
    const file = `${String(this.step).padStart(2, '0')}-${slug(name)}.jpg`;
    const full = path.join(this.dir, file);
    await this.page.screenshot({ path: full, type: 'jpeg', quality: 70 });
    await this.page.evaluate(() => document.getElementById('__evidence__')?.remove());
    for (const d of this.bugDirs) fs.copyFileSync(full, path.join(d, file));
    await this.info.attach(header, { path: full, contentType: 'image/jpeg' });
    this.rows.push(`| ${this.step} | ${name} | ${opts.note ?? ''} | ![${file}](${file}) |`);
  }

  /** Called by the fixture after the test: save video + README. */
  async finish(page: Page) {
    if (!EVIDENCE_ENABLED) return;
    // Video only where it helps: test cases of a known bug, or a test that did not end as expected (to debug it).
    // Passing test cases keep their screenshots only (videos made the evidence folder ~5x larger).
    const keepVideo = ALL_VIDEOS || this.bugDirs.length > 0 || this.info.status !== this.info.expectedStatus;
    const video = page.video();
    let savedVideo = false;
    if (video) {
      await page.close();
      if (keepVideo) {
        const target = path.join(this.dir, 'video.webm');
        await video.saveAs(target);
        for (const d of this.bugDirs) fs.copyFileSync(target, path.join(d, 'video.webm'));
        savedVideo = true;
      } else {
        await video.delete();
      }
    }
    // QC result = compared with the EXPECTED RESULT of the test case (not Playwright's "expected status").
    const bugs = this.info.tags.filter((t) => /^@BUG-\d+$/.test(t)).map((t) => t.slice(1)).join(', ');
    const s = this.info.status;
    const result =
      s === 'passed' ? '✅ Passed' : s === 'skipped' ? '⏭ Skipped' : s === 'timedOut' ? '❌ Failed (timeout)' : '❌ Failed';
    const remark =
      bugs && s === 'failed' ? ` · Bug: ${bugs}`
      : bugs && s === 'passed' ? ` · ⚠️ Bug ${bugs} có vẻ đã được sửa: kiểm tra lại rồi bỏ test.fail()`
      : '';
    // test.fail() turns every error into "expected": flag errors that come from the test code, not from the app.
    // Same pattern as scripts/run-tests.mjs (SCRIPT_ERROR).
    // Scan the FULL message: with expect.soft(x, 'name') the first line is only the name (review-executor D1).
    const SCRIPT_ERROR = /Test timeout of|Target page.*closed|ReferenceError|TypeError|SyntaxError|strict mode violation/;
    const scriptError = this.info.errors
      .map((e) => (e.message ?? '').replace(/\x1b\[[0-9;]*m/g, ''))
      .filter((m) => SCRIPT_ERROR.test(m))
      .map((m) => `${m.split('\n')[0]} → ${m.match(SCRIPT_ERROR)![0]}`)[0];
    if (scriptError) console.warn(`⚠️  ${this.tcId}: lỗi giống lỗi code test (${scriptError}). Evidence chưa đủ tin cậy, kiểm tra lại.`);
    // Every annotation of the test (timings, BUG references, PDF text, sweep counts…) so a reviewer reading only the
    // evidence sees them too (review-executor B2). 'fail' is already shown as the result / bug remark.
    const cell = (v: string) => v.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    const notes = this.info.annotations
      .filter((a) => a.type !== 'fail')
      .map((a) => `| ${cell(a.type)} | ${cell(a.description ?? '')} |`);
    const readme = [
      `# ${this.info.title}`,
      '',
      `- **Kết quả**: ${result}${remark}`,
      ...(scriptError ? [`- ⚠️ **Lỗi code test**: \`${scriptError}\` (không phải bug, cần sửa test rồi chạy lại)`] : []),
      // filter(Boolean): an anonymous test.describe (used only for test.use, e.g. TC-034 time zone) has an empty title
      `- **Nhóm**: ${this.info.titlePath.slice(1, -1).filter(Boolean).join(' › ') || '(không có)'}`,
      `- **Tags**: ${this.info.tags.join(' ')}`,
      `- **Thời điểm**: ${new Date().toISOString()}`,
      `- **Video**: ${
        savedVideo ? '[video.webm](video.webm)'
        : fs.existsSync(path.join(this.dir, 'video.webm')) ? `[video.webm](video.webm) (quay ở lần chạy ngày ${fs.statSync(path.join(this.dir, 'video.webm')).mtime.toISOString().slice(0, 10)}, ${process.env.EVIDENCE_KEEP_VIDEOS ? 'lần này không quay lại: EVIDENCE_KEEP_VIDEOS' : keepVideo ? 'lần này không lưu được video mới' : 'không quay lại vì test pass'})`
        : '(chỉ quay video cho test có bug hoặc kết quả bất thường)'
      }`,
      '',
      '| Bước | Thao tác | Cần xem | Ảnh |',
      '|---|---|---|---|',
      ...this.rows,
      '',
      ...(notes.length ? ['## Ghi nhận (annotation)', '', '| Loại | Nội dung |', '|---|---|', ...notes, ''] : []),
    ].join('\n');
    for (const d of [this.dir, ...this.bugDirs]) fs.writeFileSync(path.join(d, 'README.md'), readme);
  }
}

function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}
