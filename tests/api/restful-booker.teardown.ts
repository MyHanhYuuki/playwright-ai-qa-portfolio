/**
 * Final sweep of the `api` project (project `api-teardown`, runs after the API tests; TD-26 RB-101 point 4, RB-102 point 6).
 * Reads every run ledger of THIS run (test-results/<code>-ledger-<run>.json): for each name the run sent, query
 * GET /booking?firstname=<name>, and delete a found booking only when its firstname / lastname / additionalneeds
 * EXACTLY equals a ledger name (never a prefix, L17). The query is repeated once and must be empty.
 * Normally finds nothing (each test cleans its own bookings): it catches requests cut off after the server stored them.
 */
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { RB_BASE_URL } from '../data/restful-booker';
import { RbApi } from './rb-client';
import { RunState, type LedgerEntry } from './rb-run';

test('api teardown: quét sổ lần chạy, dọn booking sót', async ({ playwright }, testInfo) => {
  // test-results/ is emptied when a run starts, so every ledger found here belongs to THIS run
  const files = RunState.ledgerFiles(testInfo.project.outputDir);
  const ctx = await playwright.request.newContext({ baseURL: RB_BASE_URL });
  let requests = 0;
  const report: string[] = [];
  try {
    for (const file of files) {
      const ledger = JSON.parse(fs.readFileSync(file, 'utf8')) as { feature: string; run: string; entries: LedgerEntry[] };
      const run = new RunState(testInfo.project.outputDir, `${ledger.feature}-teardown`, ledger.run);
      const api = new RbApi(ctx, run, 'teardown');
      const names = [...new Set(ledger.entries.flatMap((e) => e.names))];
      const owned = (b: Record<string, unknown>) => [b.firstname, b.lastname, b.additionalneeds].some((v) => typeof v === 'string' && names.includes(v));
      let cleaned = 0;
      const firstnames = new Set(ledger.entries.map((e) => e.firstname));
      for (const name of names) {
        // a run firstname → ?firstname=; any other ledger name (RB-102: lastname carrying the run name) → ?lastname=
        const field = firstnames.has(name) ? 'firstname' : 'lastname';
        for (let pass = 0; pass < 2; pass++) {
          const q = await api.send('GET', `/booking?${field}=${encodeURIComponent(name)}`, { headers: { Accept: 'application/json' } });
          const ids = Array.isArray(q.json) ? (q.json as { bookingid: number }[]).map((x) => x.bookingid) : [];
          if (!ids.length) break;
          if (pass === 1) report.push(`${ledger.feature}: còn ${ids.length} booking tên "${name}" sau khi dọn`);
          for (const id of ids) {
            const g = await api.getBooking(id);
            if (g.status !== 200 || !owned(g.json as Record<string, unknown>)) continue;
            const token = await api.freshToken();
            const d = await api.send('DELETE', `/booking/${id}`, { headers: { Cookie: `token=${token}` } });
            if (d.status === 201) cleaned++;
          }
        }
      }
      requests += api.requestCount;
      const st = new RunState(testInfo.project.outputDir, ledger.feature, ledger.run).stats();
      report.push(
        `${ledger.feature} ${ledger.run}: ${ledger.entries.length} booking trong sổ, dọn sót ${cleaned} · cả lần chạy (chưa tính teardown): ${st.requests} request, đăng nhập thất bại ${st.failedLogins}`,
      );
    }
  } finally {
    await ctx.dispose();
  }
  testInfo.annotations.push({ type: 'teardown', description: `${report.join(' | ') || 'không có sổ lần chạy'} · teardown ${requests} request` });
  console.log(`[api-teardown] ${report.join(' | ') || 'không có sổ lần chạy'} · teardown ${requests} request`);
  expect(report.filter((r) => r.includes('còn ')), 'booking của lần chạy phải được dọn hết').toEqual([]);
});
