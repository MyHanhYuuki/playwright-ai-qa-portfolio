import { test as base, expect } from '@playwright/test';
import { RB_BASE_URL, RB_RUN } from '../data/restful-booker';
import { RbApi } from '../api/rb-client';
import { RunState, cleanupTracked } from '../api/rb-run';
import { writeApiEvidence } from '../api/api-evidence';

/**
 * Fixtures of the `api` project (specs named *-api.spec.ts). No `page`: an API test never launches a browser
 * (the web `evidence` fixture of ./index.ts is auto + uses page, so API specs import from HERE, not from ../fixtures).
 */
type ApiFixtures = {
  /**
   * Restful Booker client of this test (own APIRequestContext, no shared cookies). After the test:
   * cleanup of the bookings it created (TD-26) → annotation `requests` → API evidence (EVIDENCE=1) → dispose.
   */
  api: RbApi;
  /** Bookings left by the test are deleted up to this many times per id (RB-102 BUG-51 needs 5). */
  rbMaxDeletes: number;
};

/** Run code + run id per feature (spec file name). RB-102 adds its own line. */
const RB_FEATURES: Record<string, { code: string; run: string }> = {
  'restful-booker-auth-api': { code: 'rb101', run: RB_RUN.rb101 },
  'restful-booker-booking-api': { code: 'rb102', run: RB_RUN.rb102 },
};

export const test = base.extend<ApiFixtures>({
  rbMaxDeletes: [1, { option: true }],

  api: [
    async ({ playwright, rbMaxDeletes }, use, testInfo) => {
      const feature = testInfo.file.replace(/\\/g, '/').split('/').pop()!.replace(/\.spec\.ts$/, '');
      const f = RB_FEATURES[feature] ?? { code: 'rb', run: RB_RUN.rb101 };
      const run = new RunState(testInfo.project.outputDir, f.code, f.run);
      const ctx = await playwright.request.newContext({ baseURL: RB_BASE_URL });
      const api = new RbApi(ctx, run, testInfo.title.match(/TC-\d+/)?.[0] ?? testInfo.title);
      await use(api);
      if (api.tracked.length) {
        api.step('Dọn dẹp (TD-26)', 'GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận');
        const notes = await cleanupTracked(api, rbMaxDeletes);
        testInfo.annotations.push({ type: 'cleanup', description: notes.join(' · ') });
      }
      testInfo.annotations.push({ type: 'requests', description: `${api.requestCount} request, đăng nhập thất bại ${api.failedLogins}` });
      writeApiEvidence(api, testInfo);
      await ctx.dispose();
    },
    { auto: true },
  ],
});

export { expect };
