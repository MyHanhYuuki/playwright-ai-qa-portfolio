import { defineConfig } from '@playwright/test';

/**
 * Independent bug reproduction (bug-reporter step), separate from the test suite.
 *   npm run repro -- <feature>              → only tests/repro/<feature>.repro.ts (always pass the feature)
 *   npm run repro -- <feature> -g BUG-07    → one bug
 * Writes screenshots + README into qa-runs/<feature>/evidence/bugs/<ticket>_<BUG>/manual/.
 */
export default defineConfig({
  testDir: './tests/repro',
  testMatch: '**/*.repro.ts',
  timeout: 120_000,
  retries: 0,
  reporter: 'line',
  outputDir: 'test-results/repro',
  use: { headless: true, baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com' },
});
