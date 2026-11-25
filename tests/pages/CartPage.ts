import { type Page, type Locator } from '@playwright/test';
import { AppPage } from './AppPage';
import type { Product } from '../data/products';

/** Page Object: Cart screen (/cart.html). */
export class CartPage extends AppPage {
  readonly cartList: Locator;
  readonly quantityLabel: Locator;
  readonly descriptionLabel: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartList = page.getByTestId('cart-list');
    this.quantityLabel = page.getByTestId('cart-quantity-label');
    this.descriptionLabel = page.getByTestId('cart-desc-label');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  /** One cart line, found by product name. */
  line(p: Product) {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(p.name, { exact: true }) });
  }

  /** "Continue Shopping", then wait until the list is rendered (see AppPage: destination waits). */
  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.page.getByTestId('inventory-list').waitFor();
  }

  removeButton(p: Product) {
    return this.line(p).getByRole('button', { name: 'Remove' });
  }
}
