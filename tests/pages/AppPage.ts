import { type Page, type Locator } from '@playwright/test';

/**
 * Base Page Object for every screen AFTER login (products list, product detail, cart…):
 * header (cart icon + badge), side menu (All Items, Reset App State, Logout), page title.
 * Locators verified on the live site before writing.
 */
export class AppPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartLink: Locator;
  /** Number on the cart icon. Not rendered at all when the cart is empty. */
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly allItemsLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly logoutLink: Locator;
  /** Decorative icons, used only for layout checks (visual_user, BUG-16): no role / test id → CSS. */
  readonly cartIcon: Locator;
  readonly menuIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    // Menu links are hidden while the menu slides in, so role locators are unreliable here (see LoginPage notes).
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.cartIcon = page.locator('.shopping_cart_container');
    this.menuIcon = page.locator('.bm-icon');
  }

  async openCart() {
    await this.cartLink.click();
  }

  async openMenuItem(item: Locator) {
    await this.menuButton.click();
    await item.click();
  }

  async logout() {
    await this.openMenuItem(this.logoutLink);
  }

  async resetAppState() {
    await this.openMenuItem(this.resetAppStateLink);
  }

  /** Write the cart storage directly (error guessing: tampered data). Reload the page afterwards. */
  async setCartStorage(raw: string) {
    await this.page.evaluate((v) => localStorage.setItem('cart-contents', v), raw);
  }

  /** Computed CSS transform of an element ('none' = not rotated). */
  async transformOf(locator: Locator) {
    return locator.evaluate((el) => getComputedStyle(el).transform);
  }
}
