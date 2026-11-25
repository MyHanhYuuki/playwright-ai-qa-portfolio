/**
 * Generic kit for independent bug reproduction (bug-reporter step). Feature-agnostic:
 * each feature has its own tests/repro/<feature>.repro.ts with its scenarios and login helpers.
 *   npm run repro -- <feature> [-g "BUG-07"]     (the <feature> argument limits the run to that file)
 * Screenshots + README go to qa-runs/<feature>/evidence/bugs/<ticket>_<BUG>/manual/.
 */
import { test, type Page, type Browser } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { BUG_TICKETS } from '../data/bugs';

export type Row = { action: string; result: string; shot?: string };
export type Ctx = { page: Page; shots: boolean; bug: string };

export function reproKit(feature: string, scriptFile: string) {
  const ROOT = path.resolve('qa-runs', feature, 'evidence', 'bugs');
  const DATE = new Date().toISOString().slice(0, 10);
  const dirOf = (bug: string) => path.join(ROOT, `${BUG_TICKETS[bug] ?? '[id_bug]'}_${bug}`, 'manual');

  async function shot({ page, shots, bug }: Ctx, file: string, css = '') {
    if (!shots) return undefined;
    const boxes = css ? await page.locator(css).evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height }))) : [];
    await page.evaluate((bs) => {
      const root = document.createElement('div');
      root.id = '__repro__';
      root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
      for (const b of bs) {
        const d = document.createElement('div');
        d.style.cssText = `position:fixed;left:${b.x - 4}px;top:${b.y - 4}px;width:${b.w + 8}px;height:${b.h + 8}px;border:3px solid #e60000;border-radius:6px`;
        root.appendChild(d);
      }
      document.body.appendChild(root);
    }, boxes);
    fs.mkdirSync(dirOf(bug), { recursive: true });
    await page.screenshot({ path: path.join(dirOf(bug), file) });
    await page.evaluate(() => document.getElementById('__repro__')?.remove());
    return file;
  }

  /**
   * Run a scenario twice, each time in fresh contexts; keep screenshots of the 2nd run; write README.
   * `random`: results are expected to differ between runs (e.g. random prices) → compare only that the bug shows.
   */
  async function reproduce(browser: Browser, bug: string, title: string, scenario: (c: (shots: boolean) => Promise<Ctx>) => Promise<Row[]>, conclusion: string, random = false) {
    const runs: Row[][] = [];
    for (const shots of [false, true]) {
      const contexts: Awaited<ReturnType<Browser['newContext']>>[] = [];
      const open = async (s: boolean) => {
        const ctx = await browser.newContext({ baseURL: test.info().project.use.baseURL, viewport: { width: 1280, height: 720 } });
        contexts.push(ctx);
        return { page: await ctx.newPage(), shots: s, bug };
      };
      runs.push(await scenario(() => open(shots)));
      for (const c of contexts) await c.close();
    }
    const same = JSON.stringify(runs[0].map((r) => r.result)) === JSON.stringify(runs[1].map((r) => r.result));
    const repeat = same ? '**2/2 lần, kết quả giống nhau**' : random ? '**2/2 lần đều có lỗi** (giá trị đổi giữa 2 lần, đúng bản chất bug)' : '**2 lần cho kết quả KHÁC nhau**, xem bảng lần 1 bên dưới';
    const rows = runs[1];
    const lines = [
      `# ${bug}: tái hiện độc lập (${DATE})`,
      '',
      `**${title}**`,
      '',
      `Script riêng [\`${scriptFile}\`](../../../../../../${scriptFile}) (\`npm run repro -- ${feature}\`), **không** dùng code test: locator id / class CSS, mỗi tình huống một phiên trình duyệt mới (giỏ trống), Chromium 1280×720. Mỗi tình huống chạy 2 lần: ${repeat}. Ảnh của lần 2, khung đỏ do script vẽ để chỉ chỗ lỗi. Các bước làm bằng tay nằm trong \`defects.md\`.`,
      '',
      '| # | Thao tác | Kết quả thấy được | Ảnh |',
      '|---|---|---|---|',
      ...rows.map((r, i) => `| ${i + 1} | ${r.action} | ${r.result} | ${r.shot ? `![](${r.shot})` : ''} |`),
      ...(same ? [] : ['', 'Lần 1:', '', ...runs[0].map((r, i) => `${i + 1}. ${r.result}`)]),
      '',
      `Kết luận: ${conclusion}`,
      '',
    ];
    fs.mkdirSync(dirOf(bug), { recursive: true });
    for (const f of fs.readdirSync(dirOf(bug))) if (f.endsWith('.png') && !rows.some((r) => r.shot === f)) fs.rmSync(path.join(dirOf(bug), f));
    fs.writeFileSync(path.join(dirOf(bug), 'README.md'), lines.join('\n'));
    console.log('DONE', bug, same ? 'same' : 'DIFF', JSON.stringify(rows.map((r) => r.result)));
  }

  return { shot, reproduce };
}
