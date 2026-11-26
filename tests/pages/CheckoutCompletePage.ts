import { type Page, type Locator, type Download } from '@playwright/test';
import { AppPage } from './AppPage';

/**
 * Page Object: Checkout step 3, Complete (/checkout-complete.html).
 * Unique element of this page (destination waits): [data-test=complete-header].
 */
export class CheckoutCompletePage extends AppPage {
  /** h2 "Thank you for your order!" */
  readonly header: Locator;
  readonly text: Locator;
  /** Tick image (alt "Pony Express", IMP-06: alt not checked). */
  readonly ponyImage: Locator;
  readonly backHomeButton: Locator;
  readonly generatePdfButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByTestId('complete-header');
    this.text = page.getByTestId('complete-text');
    this.ponyImage = page.getByTestId('pony-express');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home', exact: true });
    this.generatePdfButton = page.getByRole('button', { name: 'Generate PDF order', exact: true });
  }

  /** Open the URL directly (no wait: a fixed app may redirect, BUG-27). */
  async goto() {
    await this.page.goto('/checkout-complete.html');
  }

  /** Back Home → product list. performance_glitch_user needs ~5 s here (BUG-03 variant): pass a longer timeout. */
  async backHome(timeout?: number) {
    await this.backHomeButton.click();
    await this.page.getByTestId('inventory-list').waitFor({ timeout });
  }

  /** Click "Generate PDF order" and return the download. */
  async downloadPdf(): Promise<Download> {
    const [download] = await Promise.all([this.page.waitForEvent('download'), this.generatePdfButton.click()]);
    return download;
  }

  /** naturalWidth of the tick image (> 0 = image loaded; 0 if the image is not on the page). */
  async imageWidth() {
    return this.ponyImage.evaluate((img) => (img as HTMLImageElement).naturalWidth, undefined, { timeout: 2_000 }).catch(() => 0);
  }
}
