import { type Page, type Locator } from '@playwright/test';
import { AppPage } from './AppPage';
import type { CheckoutInfo } from '../data/checkout';

/**
 * Page Object: Checkout step 1, Information (/checkout-step-one.html).
 * Header and side menu come from AppPage. Locators verified on the live site (standard_user, problem_user, error_user).
 * Unique element of this page (destination waits): the First Name field ([data-test=firstName]).
 */
export class CheckoutInfoPage extends AppPage {
  /** Fields have an aria-label; `exact` is required: getByLabel('Name') matches 2 fields. */
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  /** Error message box ([data-test=error], role=alert). */
  readonly error: Locator;
  /** ✕ button of the error message. */
  readonly errorCloseButton: Locator;
  /** Red ✕ icons inside the fields (decorative SVG, no role / test id → CSS). */
  readonly errorIcons: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByLabel('First Name', { exact: true });
    this.lastName = page.getByLabel('Last Name', { exact: true });
    this.postalCode = page.getByLabel('Zip/Postal Code', { exact: true });
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.error = page.getByTestId('error');
    this.errorCloseButton = page.getByTestId('error-button');
    this.errorIcons = page.locator('.error_icon');
  }

  /** The 3 fields in screen order. */
  get fields() {
    return { first: this.firstName, last: this.lastName, zip: this.postalCode } as const;
  }

  /** Open the URL directly (no wait: the app may redirect, e.g. empty cart / not logged in). */
  async goto() {
    await this.page.goto('/checkout-step-one.html');
  }

  /** Red ✕ icon(s) in the same .form_group as `field`. */
  errorIconOf(field: Locator) {
    return this.page.locator('.form_group').filter({ has: field }).locator('.error_icon');
  }

  /** Fill the form. '' = do NOT touch that field (e.g. error_user TC-015: never touch Last Name). */
  async fill(v: CheckoutInfo) {
    if (v.first) await this.firstName.fill(v.first);
    if (v.last) await this.lastName.fill(v.last);
    if (v.zip) await this.postalCode.fill(v.zip);
  }

  /** Continue and wait until the Overview is rendered (its Finish button). Use continueButton.click() when it must NOT navigate. */
  async continueToOverview() {
    await this.continueButton.click();
    await this.page.getByTestId('finish').waitFor();
  }

  async submit(v: CheckoutInfo) {
    await this.fill(v);
    await this.continueToOverview();
  }

  /** Cancel → cart page (its Checkout button: `cart-list` is NOT unique, the Overview has it too). */
  async cancel() {
    await this.cancelButton.click();
    await this.page.getByTestId('checkout').waitFor();
  }

  /** Cart icon → cart page (waits for the Checkout button). */
  async openCart() {
    await this.cartLink.click();
    await this.page.getByTestId('checkout').waitFor();
  }
}
