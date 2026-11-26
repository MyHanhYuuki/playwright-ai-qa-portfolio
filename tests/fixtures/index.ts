import { test as base, expect, type Browser, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { users } from '../data/users';
import { Evidence } from '../utils/evidence';

export type User = (typeof users)[keyof typeof users];

type Fixtures = {
  /** Annotated screenshots + video per test case (active only with EVIDENCE=1). */
  evidence: Evidence;
  /** Login screen, already opened. */
  loginPage: LoginPage;
  /** Products screen, logged in as standard_user (precondition "Đã đăng nhập"). */
  loggedInPage: InventoryPage;
  /** Log in on THIS test's page as any user, land on the Products screen. */
  loginAs: (user: User) => Promise<InventoryPage>;
  /** A SECOND, independent browser session logged in as `user` (e.g. a standard_user baseline for layout checks). Closed after the test. */
  otherSession: (user: User) => Promise<Page>;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  /** SD-103 checkout pages (not opened: the test navigates). */
  infoPage: CheckoutInfoPage;
  overviewPage: CheckoutOverviewPage;
  completePage: CheckoutCompletePage;
};

/** Log in on `page` and wait until the product list is rendered. */
export async function login(page: Page, user: User) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user.username, user.password);
  const inventoryPage = new InventoryPage(page);
  // performance_glitch_user needs ~5 s to log in (SD-101 BUG-03)
  await expect(inventoryPage.items.first()).toBeVisible({ timeout: 15_000 });
  return inventoryPage;
}

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

  loginAs: async ({ page }, use) => {
    await use((user) => login(page, user));
  },

  otherSession: async ({ browser }, use) => {
    const contexts: Awaited<ReturnType<Browser['newContext']>>[] = [];
    await use(async (user) => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      contexts.push(context);
      const page = await context.newPage();
      await login(page, user);
      return page;
    });
    for (const c of contexts) await c.close();
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  infoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },

  overviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },

  completePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
});

export { expect };

/** URL predicate: we are on the login screen (path "/"), independent of baseURL. */
export const isLoginScreen = (url: URL) => url.pathname === '/';
