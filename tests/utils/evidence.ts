import fs from 'node:fs';
import path from 'node:path';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { BUG_TICKETS } from '../data/bugs';

/** Evidence is only captured when EVIDENCE=1 (npm run test:evidence). Normal runs and CI stay fast. */
export const EVIDENCE_ENABLED = !!process.env.EVIDENCE;

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
 *   all-cases/TC-xxx/  01-<step>.jpg, 02-<step>.jpg, video.webm, README.md
 *   bugs/<ticket>_<KI>/  copies for test cases tagged @KI-xx
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
      .map((t) => t.match(/^@(KI-\d+)$/)?.[1])
      .filter((ki): ki is string => !!ki)
      .map((ki) => path.join(root, 'bugs', `${BUG_TICKETS[ki] ?? '[id_bug]'}_${ki}`, this.tcId));
    if (EVIDENCE_ENABLED) {
      for (const d of [this.dir, ...this.bugDirs]) {
        fs.rmSync(d, { recursive: true, force: true });
        fs.mkdirSync(d, { recursive: true });
      }
    }
  }

  /** Take an annotated screenshot of the current step. */
  async shot(name: string, opts: ShotOptions = {}) {
    if (!EVIDENCE_ENABLED) return;
    this.step++;
    const marks = opts.highlight ? ([] as Locator[]).concat(opts.highlight) : [];
    const boxes = [];
    for (const m of marks) {
      const b = await m.boundingBox().catch(() => null);
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
    const video = page.video();
    if (video) {
      await page.close();
      const target = path.join(this.dir, 'video.webm');
      await video.saveAs(target);
      for (const d of this.bugDirs) fs.copyFileSync(target, path.join(d, 'video.webm'));
    }
    const status = this.info.status === this.info.expectedStatus ? '✅ Đúng như mong đợi' : '❌ Khác mong đợi';
    const expectedFail = this.info.expectedStatus === 'failed' ? ' (bug đã biết: test được dự kiến FAIL)' : '';
    const readme = [
      `# ${this.info.title}`,
      '',
      `- **Kết quả**: ${status} · status=\`${this.info.status}\`${expectedFail}`,
      `- **Tags**: ${this.info.tags.join(' ')}`,
      `- **Thời điểm**: ${new Date().toISOString()}`,
      `- **Video**: ${video ? '[video.webm](video.webm)' : '(không có)'}`,
      '',
      '| Bước | Thao tác | Cần xem | Ảnh |',
      '|---|---|---|---|',
      ...this.rows,
      '',
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
