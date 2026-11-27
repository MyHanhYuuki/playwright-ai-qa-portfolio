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

/**
 * Restful Booker admin account (RB-101 TD-01, RB-102 TD-05; shared by both API features).
 * PUBLIC demo credentials of the API documentation (qa-runs/restful-booker-auth-api/requirement/apidoc.txt).
 * Override with RB_ADMIN_USERNAME / RB_ADMIN_PASSWORD (.env.example, CI: GitHub Secrets).
 * The password value must not appear anywhere else (test cases, docs, annotations, evidence: masked).
 */
export const rbAdmin = {
  username: process.env.RB_ADMIN_USERNAME || 'admin',
  password: process.env.RB_ADMIN_PASSWORD || 'password123',
} as const;
