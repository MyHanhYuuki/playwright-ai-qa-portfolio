import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object: Login screen (https://www.saucedemo.com/)
 * Locators verified on the live site (Playwright MCP) before writing.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  /** Red ✕ icons shown inside the input fields when there is an error (decorative SVG, no role/test id). */
  readonly fieldErrorIcons: Locator;

  constructor(page: Page) {
    this.page = page;
    // No <label> on the page (IMP-04), so placeholder is the most user-facing locator available.
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.getByTestId('error-button');
    this.fieldErrorIcons = page.locator('.error_icon');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Fill the form. Pass '' to leave a field empty. */
  async fill(username: string, password: string) {
    if (username) await this.usernameInput.fill(username);
    if (password) await this.passwordInput.fill(password);
  }

  async login(username: string, password: string) {
    await this.fill(username, password);
    await this.loginButton.click();
  }

  async loginWithEnter(username: string, password: string) {
    await this.fill(username, password);
    await this.passwordInput.press('Enter');
  }
}
