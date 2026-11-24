import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../data/users';
import { Evidence } from '../utils/evidence';

type Fixtures = {
  /** Annotated screenshots + video per test case (active only with EVIDENCE=1). */
  evidence: Evidence;
  /** Login screen, already opened. */
  loginPage: LoginPage;
  /** Products screen, logged in as standard_user (precondition "Đã đăng nhập"). */
  loggedInPage: InventoryPage;
};

export const test = base.extend<Fixtures>({
  evidence: [
    async ({ page }, use, testInfo) => {
      const evidence = new Evidence(page, testInfo);
      await use(evidence);
      await evidence.finish(page);
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.title).toHaveText('Products');
    await use(inventoryPage);
  },
});

export { expect };

/** URL predicate: we are on the login screen (path "/"), independent of baseURL. */
export const isLoginScreen = (url: URL) => url.pathname === '/';
