import { type Page, type Locator } from '@playwright/test';
import { AppPage } from './AppPage';

/** Page Object: Product detail screen (/inventory-item.html?id=<n>). */
export class ProductDetailPage extends AppPage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    // data-test is item-<slug>-img, unknown for a not-found product → match by pattern
    this.image = page.getByTestId(/^item-.*-img$/);
    this.addButton = page.getByRole('button', { name: 'Add to cart' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
    this.backButton = page.getByRole('button', { name: 'Back to products' });
  }

  /** Open by raw id value (string so that invalid ids like "4abc" can be tested). */
  async goto(id: number | string) {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }

  /** "Back to products", then wait until the list is rendered (see AppPage: destination waits). */
  async backToProducts() {
    await this.backButton.click();
    await this.page.getByTestId('inventory-list').waitFor();
  }
}
