import { type Page, type Locator } from '@playwright/test';
import { AppPage } from './AppPage';
import type { Product } from '../data/products';

/**
 * Page Object: Products screen (/inventory.html).
 * Header and side menu come from AppPage.
 */
export class InventoryPage extends AppPage {
  readonly inventoryList: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemDescriptions: Locator;
  readonly sortSelect: Locator;
  /** Text shown on the sort dropdown, e.g. "Name (A to Z)". */
  readonly activeSort: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.getByTestId('inventory-list');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemDescriptions = page.getByTestId('inventory-item-desc');
    this.sortSelect = page.getByRole('combobox');
    this.activeSort = page.getByTestId('active-option');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** One product row, found by its visible name. */
  item(p: Product) {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(p.name, { exact: true }) });
  }

  /**
   * The Add to cart / Remove button of a product row (its text tells the state).
   * Name filter needed: the image and title links of a row also have role="button".
   */
  cartButton(p: Product) {
    return this.item(p).getByRole('button', { name: /^(Add to cart|Remove)$/ });
  }

  addButton(p: Product) {
    return this.item(p).getByRole('button', { name: 'Add to cart' });
  }

  removeButton(p: Product) {
    return this.item(p).getByRole('button', { name: 'Remove' });
  }

  /** Link on the product name (keyboard focusable). */
  nameLink(p: Product) {
    return this.page.getByTestId(`item-${p.id}-title-link`);
  }

  /** Link on the product image. */
  imageLink(p: Product) {
    return this.page.getByTestId(`item-${p.id}-img-link`);
  }

  image(p: Product) {
    return this.item(p).getByRole('img');
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortSelect.selectOption(value);
  }
}
