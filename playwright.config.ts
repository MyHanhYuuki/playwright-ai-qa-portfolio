import { defineConfig, devices } from '@playwright/test';

/*
 * Restful Booker API run id (RB-101 TD-17, RB-102 TD-02): set ONCE here, in the main process, before workers start.
 * Workers inherit the env, so every test (and a worker restarted after a failure) shares the same run id.
 */
process.env.RB_RUN_AT ??= new Date().toISOString();
process.env.RB_RUN_NONCE ??= Math.random().toString(36).slice(2, 6).padEnd(4, '0');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',

    /* SauceDemo marks elements with data-test="..." → page.getByTestId('...') */
    testIdAttribute: 'data-test',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Keep evidence for failed tests (used by executor triage & bug reports) */
    screenshot: 'only-on-failure',

    /* Evidence mode (npm run test:evidence): record a video of every test case.
       EVIDENCE_KEEP_VIDEOS=1: refresh screenshots + README only, keep the videos already saved
       (re-recording adds ~60 MB of new video blobs to git history for no new information). */
    video:
      process.env.EVIDENCE && !process.env.EVIDENCE_KEEP_VIDEOS ? { mode: 'on', size: { width: 1280, height: 720 } } : 'off',
  },

  /*
   * Projects. Web and API are separated by FILE NAME:
   *   chromium      = web (SauceDemo) specs, everything except *-api.spec.ts
   *   api           = Restful Booker API specs (*-api.spec.ts): no browser, public shared server
   *   api-teardown  = final sweep of the API run ledgers (runs after `api`)
   * `npm test` / `npm run test:smoke` / the CI web job pass --project=chromium; API runs only when asked:
   * `npm run test:api`, `npm run test:run -- <feature>-api`, or the CI api job (.github/workflows/playwright.yml).
   */
  projects: [
    {
      name: 'chromium',
      testIgnore: ['**/*-api.spec.ts', '**/api/**'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testMatch: '**/*-api.spec.ts',
      /* HITL #2 item 9: no retries for the API (reset strategy TD-26 redoes the setup inside the test instead) */
      retries: 0,
      /* Sequential on the shared public server (TD-26, TD-27 bad-login budget): one worker, file order */
      workers: 1,
      fullyParallel: false,
      timeout: 60_000,
      teardown: 'api-teardown',
      use: {
        baseURL: (process.env.RB_BASE_URL || 'https://restful-booker.herokuapp.com').replace(/\/+$/, ''),
        trace: 'off',
        video: 'off',
        screenshot: 'off',
      },
    },
    {
      name: 'api-teardown',
      testMatch: '**/api/*.teardown.ts',
      retries: 0,
      workers: 1,
      use: { trace: 'off', video: 'off', screenshot: 'off' },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
