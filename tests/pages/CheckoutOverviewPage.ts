import { type Page, type Locator } from '@playwright/test';
import { AppPage } from './AppPage';
import type { Product } from '../data/products';

/**
 * Page Object: Checkout step 2, Overview (/checkout-step-two.html).
 * Unique element of this page (destination waits): the Finish button.
 * NOT unique: `cart-list` and `inventory-item` (the cart page has them too, lesson L3).
 */
export class CheckoutOverviewPage extends AppPage {
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly quantityLabel: Locator;
  readonly descriptionLabel: Locator;
  readonly paymentLabel: Locator;
  readonly paymentValue: Locator;
  readonly shippingLabel: Locator;
  readonly shippingValue: Locator;
  readonly priceTotalLabel: Locator;
  /** "Item total: $x.xx" */
  readonly subtotal: Locator;
  /** "Tax: $x.xx" */
  readonly tax: Locator;
  /** "Total: $x.xx" */
  readonly total: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.getByRole('button', { name: 'Finish', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.quantityLabel = page.getByTestId('cart-quantity-label');
    this.descriptionLabel = page.getByTestId('cart-desc-label');
    this.paymentLabel = page.getByTestId('payment-info-label');
    this.paymentValue = page.getByTestId('payment-info-value');
    this.shippingLabel = page.getByTestId('shipping-info-label');
    this.shippingValue = page.getByTestId('shipping-info-value');
    this.priceTotalLabel = page.getByTestId('total-info-label');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
  }

  /** Open the URL directly (no wait: BUG-26 lets it open, a fixed app may redirect). */
  async goto() {
    await this.page.goto('/checkout-step-two.html');
  }

  /** One product line, found by name. */
  line(p: Product) {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(p.name, { exact: true }) });
  }

  /**
   * Product name link: <a role=button href=#> named "View details for <name>" (getByRole('link') finds nothing).
   * Test id uses the REAL product id even for problem_user (verified), so the link is found by product.
   */
  nameLink(p: Product) {
    return this.page.getByTestId(`item-${p.id}-title-link`);
  }

  /** Click a product name, wait for the detail page ("Back to products" exists only there). */
  async openProduct(p: Product) {
    await this.nameLink(p).click();
    await this.page.getByRole('button', { name: 'Back to products' }).waitFor();
  }

  /** Finish and wait for the Complete page header (the old Finish button stays in the DOM for a moment). */
  async finish() {
    await this.finishButton.click();
    await this.page.getByTestId('complete-header').waitFor();
  }

  /** Cancel → product list. performance_glitch_user needs ~5 s here (BUG-03 variant): pass a longer timeout. */
  async cancel(timeout?: number) {
    await this.cancelButton.click();
    await this.page.getByTestId('inventory-list').waitFor({ timeout });
  }

  /** Cart icon → cart page. Overridden: the AppPage marker `cart-list` is already on the Overview (lesson L3). */
  async openCart() {
    await this.cartLink.click();
    await this.page.getByTestId('checkout').waitFor();
  }
}
