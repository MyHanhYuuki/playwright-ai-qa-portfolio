import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object: Products screen (/inventory.html) + side menu.
 * Only the parts needed by the login screen tests (logout, session checks).
 */
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.inventoryList = page.getByTestId('inventory-list');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    // The link is hidden while the menu slides in, so a role locator is unreliable here.
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
