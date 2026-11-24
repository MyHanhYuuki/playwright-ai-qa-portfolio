import { test, expect } from '@playwright/test';

/**
 * Seed test, with two purposes:
 * 1. Starting point for Playwright MCP (AI agents call setup_page with this file
 *    and the browser opens at the system under test).
 * 2. Smoke check: the site is up and the login form is rendered.
 *    If this fails, the other tests will fail for environment reasons, not app bugs.
 */
test.describe('Seed', () => {
  test('site is reachable and login form is rendered', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Swag Labs');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
