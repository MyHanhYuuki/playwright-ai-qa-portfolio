/**
 * Test accounts for SauceDemo.
 * These are PUBLIC demo credentials shown on https://www.saucedemo.com.
 * The password can still be overridden with the SAUCE_PASSWORD env var (e.g. in CI secrets).
 */
const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password },
  lockedOut: { username: 'locked_out_user', password },
  problem: { username: 'problem_user', password },
  performanceGlitch: { username: 'performance_glitch_user', password },
  error: { username: 'error_user', password },
  visual: { username: 'visual_user', password },
} as const;
