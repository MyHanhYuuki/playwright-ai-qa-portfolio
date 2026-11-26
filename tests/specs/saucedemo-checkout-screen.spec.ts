/**
 * SD-103: Checkout, 3 screens: Information, Overview, Complete (SauceDemo)
 * Test cases: qa-runs/saucedemo-checkout-screen/test-cases.csv (53 TC, approved at HITL #2)
 * Known bugs: qa-runs/saucedemo-checkout-screen/known-issues.md (BUG-22 → BUG-36 + variants of BUG-02, 05, 07, 11, 16, 19;
 * BUG-03 variant is RECORD ONLY: TC-046 must pass).
 *
 * Convention (same as SD-102): 1 test = 1 TC, title starts with the TC id. Tags: @AC-x, screen (@info / @overview / @complete),
 * @smoke, @security, @BUG-xx (known bug → test.fail()).
 * Groups: one describe per screen ("A → B" TCs go to the screen where the action is), "Chung" for "A + B" / "Cả 3".
 * Bug variants: expect.soft + short timeout, each variant from its own state, so ONE failing variant never hides the others.
 * "Does not appear = correct" checks wait up to 5 s for the WRONG state (known-issues "Ghi chú cho script-gen" 6).
 * Highlight oracle: class token `error` + `.error_icon` count, never `input_error` (always present, lesson L15).
 * Fresh state: the cart lives only in localStorage and typed info is stored nowhere (O-11), so variants of the same account
 * overwrite `cart-contents`; variants that need a NEW session (other account, cookies, logout) clear cookies + localStorage
 * on the same page (evidence screenshots only capture the test's own page).
 */
import type { Locator, Page } from '@playwright/test';
import { test, expect, isLoginScreen, login, type User } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { users } from '../data/users';
import { MSG, MSG_CHECKOUT as M, protectedPages } from '../data/messages';
import { products, allProducts, priceText, type Product } from '../data/products';
import {
  info, missingCombos, whitespaceInfo, variedInfo, longValue, carts, representativeCarts, floatCarts, emptyCartTotals,
  sweepCarts, expectedTotals, totalsText, textToCents, productById, receiptTexts, receiptLines, receiptDate, amount, cents,
  type CheckoutInfo, type MissingField, type Totals,
} from '../data/checkout';
import { readReceipt, inOrder, productLines } from '../utils/pdf';
import { ready, expectSamePlace, expectHeaderLike } from '../utils/layout';
import type { Evidence } from '../utils/evidence';

const { backpack, bikeLight, fleeceJacket, onesie } = products;
/** Soft check of a UI state right after an action (bug variants). */
const QUICK = { timeout: 2_000 };
/** How long a WRONG state is waited for before concluding "it does not appear" (known-issues, note 6). */
const NEG = 5_000;
/** performance_glitch_user: steps back to the product list take ~5 s (BUG-03 variant, Q11). */
const SLOW = 10_000;
/** TC-034: a fixed NON-UTC browser time zone for the receipt date check (review-executor B1). */
const RECEIPT_TZ = 'Asia/Ho_Chi_Minh';
const GUARD = 'Blocked: BUG-26 đã sửa (mở thẳng /checkout-step-two.html không còn hiện Tổng quan): executor xếp Blocked, không phải bug';
const MSG_OF: Record<MissingField, string> = { first: M.firstNameRequired, last: M.lastNameRequired, zip: M.postalCodeRequired };
/** class token `error` (NOT the substring: `input_error` is always there). */
const ERROR_CLASS = /(^|\s)error(\s|$)/;

// ---------- shared helpers ----------
/** true if `l` becomes visible within `ms` (explicit wait for a state that must NOT appear). */
const appears = (l: Locator, ms = NEG) => l.waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
const cartStorage = (page: Page) => page.evaluate(() => localStorage.getItem('cart-contents'));
const setCart = (page: Page, ids: readonly number[]) =>
  page.evaluate((v) => localStorage.setItem('cart-contents', v), JSON.stringify(ids));
const note = (type: string, description: string) => test.info().annotations.push({ type, description });
/**
 * isEnabled() that never waits for a missing element (review D1): a valid fix of BUG-19 may HIDE the Checkout button,
 * and a plain isEnabled() would then wait until the test timeout (hidden by test.fail(), lesson L4).
 */
const enabledNow = (l: Locator) => l.isEnabled({ timeout: QUICK.timeout }).catch(() => false);
/**
 * Finish as a PRECONDITION inside a test.fail() test (review D4): a named, short check instead of a hard wait,
 * so a broken Finish shows as "Điều kiện trước: …" (script-issue / Blocked) and not as a bare timeout.
 */
async function finishAsPrecondition(page: Page, why: string) {
  await new CheckoutOverviewPage(page).finishButton.click();
  await expect(new CheckoutCompletePage(page).header, `Điều kiện trước: ${why}`).toBeVisible({ timeout: NEG });
}

/** New session on THIS page: cookies + localStorage cleared, then log in (product list rendered). */
async function freshLogin(page: Page, user: User = users.standard) {
  await page.context().clearCookies();
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await new LoginPage(page).login(user.username, user.password);
  const inv = new InventoryPage(page);
  // performance_glitch_user needs ~5 s to log in (SD-101 BUG-03)
  await inv.inventoryList.waitFor({ timeout: 15_000 });
  return inv;
}

/** Cart set by storage → cart page → Checkout → Information page. */
async function toInfo(page: Page, ids: readonly number[]) {
  await setCart(page, ids);
  const cart = new CartPage(page);
  await cart.goto();
  await cart.checkout();
  return new CheckoutInfoPage(page);
}
/** … → Continue with `who` → Overview (Finish visible). */
async function toOverview(page: Page, ids: readonly number[], who: CheckoutInfo = info.a) {
  await (await toInfo(page, ids)).submit(who);
  return new CheckoutOverviewPage(page);
}
/** … → Finish → Complete page. */
async function placeOrder(page: Page, ids: readonly number[], who: CheckoutInfo = info.a) {
  await (await toOverview(page, ids, who)).finish();
  return new CheckoutCompletePage(page);
}

/** Information page as AC-1 / MSG-05 / MSG-11 describe it (soft). */
async function expectInfoPage(page: Page, ip: CheckoutInfoPage, label: string) {
  await expect.soft(page, `${label}: URL`).toHaveURL(/\/checkout-step-one\.html$/, QUICK);
  await expect.soft(ip.title, `${label}: tiêu đề`).toHaveText(M.titleInfo, QUICK);
  for (const [field, ph] of [[ip.firstName, M.placeholderFirst], [ip.lastName, M.placeholderLast], [ip.postalCode, M.placeholderZip]] as const) {
    await expect.soft(field, `${label}: ô ${ph} trống`).toHaveValue('', QUICK);
    await expect.soft(field, `${label}: placeholder ${ph}`).toHaveAttribute('placeholder', ph, QUICK);
  }
  await expect.soft(ip.cancelButton, `${label}: nút Cancel`).toBeVisible(QUICK);
  await expect.soft(ip.continueButton, `${label}: nút Continue`).toBeVisible(QUICK);
}

/** Still on the Information page after a refused Continue: First Name field there, no Finish button. */
async function expectStillOnInfo(page: Page, ip: CheckoutInfoPage, label: string) {
  await expect.soft(page, `${label}: vẫn ở /checkout-step-one.html`).toHaveURL(/\/checkout-step-one\.html$/, QUICK);
  await expect.soft(ip.firstName, `${label}: còn ô First Name`).toBeVisible(QUICK);
  await expect.soft(page.getByTestId('finish'), `${label}: không có nút Finish`).toHaveCount(0, QUICK);
}

/** Overview lines = `ids` in cart order, each QTY 1, name, description, price of TD-06 (soft). */
async function expectOverviewLines(ov: CheckoutOverviewPage, ids: readonly number[], label: string) {
  const ps = ids.map(productById);
  await expect.soft(ov.itemNames, `${label}: tên dòng theo thứ tự giỏ`).toHaveText(ps.map((p) => p.name), QUICK);
  for (const p of ps) {
    const line = ov.line(p);
    await expect.soft(line.getByTestId('item-quantity'), `${label}: QTY ${p.name}`).toHaveText('1', QUICK);
    await expect.soft(line.getByTestId('inventory-item-desc'), `${label}: mô tả ${p.name}`).toHaveText(p.description, QUICK);
    await expect.soft(line.getByTestId('inventory-item-price'), `${label}: giá ${p.name}`).toHaveText(priceText(p), QUICK);
  }
}

/** Payment / Shipping lines and "Price Total" verbatim (MSG-06, Q1). */
async function expectPaymentShipping(ov: CheckoutOverviewPage, label: string) {
  await expect.soft(ov.paymentLabel, `${label}: Payment Information`).toHaveText(M.paymentLabel, QUICK);
  await expect.soft(ov.paymentValue, `${label}: SauceCard`).toHaveText(M.paymentValue, QUICK);
  await expect.soft(ov.shippingLabel, `${label}: Shipping Information`).toHaveText(M.shippingLabel, QUICK);
  await expect.soft(ov.shippingValue, `${label}: Free Pony Express`).toHaveText(M.shippingValue, QUICK);
  await expect.soft(ov.priceTotalLabel, `${label}: Price Total`).toHaveText(M.priceTotalLabel, QUICK);
}

/** The 3 money lines as exact strings (only for carts that do NOT hit the float bug BUG-25, test-data TD-13 note). */
async function expectTotalsText(ov: CheckoutOverviewPage, t: Totals, label: string) {
  const s = totalsText(t);
  await expect.soft(ov.subtotal, `${label}: Item total`).toHaveText(s.item, QUICK);
  await expect.soft(ov.tax, `${label}: Tax`).toHaveText(s.tax, QUICK);
  await expect.soft(ov.total, `${label}: Total`).toHaveText(s.total, QUICK);
}

/** Read the 3 money lines → cents (value check, independent of the format bug BUG-25). */
async function readCents(ov: CheckoutOverviewPage): Promise<Totals> {
  await expect(ov.total).toHaveText(/\d/);
  return {
    item: textToCents(await ov.subtotal.innerText()),
    tax: textToCents(await ov.tax.innerText()),
    total: textToCents(await ov.total.innerText()),
  };
}

/** Complete page as AC-5 / MSG-05 / MSG-07 describe it (soft). */
async function expectCompletePage(page: Page, co: CheckoutCompletePage, label: string, badgeToo = true) {
  await expect.soft(page, `${label}: URL`).toHaveURL(/\/checkout-complete\.html$/, QUICK);
  await expect.soft(co.title, `${label}: tiêu đề`).toHaveText(M.titleComplete, QUICK);
  await expect.soft(co.header, `${label}: Thank you`).toHaveText(M.completeHeader, QUICK);
  await expect.soft(co.text, `${label}: đoạn dispatched`).toHaveText(M.completeText, QUICK);
  await expect.poll(() => co.imageWidth(), QUICK).toBeGreaterThan(0).catch(() => undefined); // wait only, judged below
  expect.soft(await co.imageWidth(), `${label}: ảnh dấu tick tải được (naturalWidth > 0)`).toBeGreaterThan(0);
  await expect.soft(co.backHomeButton, `${label}: nút Back Home`).toBeVisible(QUICK);
  await expect.soft(co.generatePdfButton, `${label}: nút Generate PDF order`).toBeVisible(QUICK);
  if (badgeToo) await expect.soft(co.cartBadge, `${label}: không còn số giỏ`).toBeHidden(QUICK);
}

/** Product list after leaving checkout with an EMPTY cart: 6 Add to cart, 0 Remove, no badge. */
async function expectEmptyList(page: Page, label: string) {
  const inv = new InventoryPage(page);
  await expect.soft(page, `${label}: URL`).toHaveURL(/\/inventory\.html$/, QUICK);
  await expect.soft(inv.items, `${label}: 6 sản phẩm`).toHaveCount(6, QUICK);
  await expect.soft(page.getByRole('button', { name: 'Add to cart', exact: true }), `${label}: 6 nút Add to cart`).toHaveCount(6, QUICK);
  await expect.soft(page.getByRole('button', { name: 'Remove', exact: true }), `${label}: 0 nút Remove`).toHaveCount(0, QUICK);
  await expect.soft(inv.cartBadge, `${label}: không có số giỏ`).toBeHidden(QUICK);
}

/** Collect uncaught JS errors and error reports sent to submit.backtrace.io (401 to events.backtrace.io is normal, O-38). */
function watchErrors(page: Page) {
  /**
   * Each entry is "<step> [<page path at that moment>]: <message or URL>", so the executor sees WHERE it happened.
   * The path is read when the event fires, so an error of the previous page is never filed under the next step.
   */
  const w = { step: '', pageErrors: [] as string[], reports: [] as string[], reset() { w.pageErrors = []; w.reports = []; } };
  const where = () => `${w.step || '-'} [${new URL(page.url()).pathname}]`;
  page.on('pageerror', (e) => w.pageErrors.push(`${where()}: ${e.message}`));
  page.on('request', (r) => { if (r.url().includes('submit.backtrace.io')) w.reports.push(`${where()}: ${r.url()}`); });
  return w;
}
/** Entries raised while the product DETAIL page was shown (SD-102 BUG-21 territory, not a checkout page). */
const onDetailPage = (entry: string) => entry.includes('[/inventory-item.html]');

/** Download the receipt of the Complete page and read it. */
async function receipt(co: CheckoutCompletePage, dir?: string) {
  return readReceipt(await co.downloadPdf(), test.info(), dir);
}

/**
 * 120-cart sweep (TD-16, HITL #2 decision 4): one context, cart-contents overwritten for every cart.
 * `check` returns a problem text or null. Annotation "đã quét n/120 giỏ" is written even on timeout (finally),
 * so a sweep cut by the timeout is visible (lesson L4).
 */
async function sweep(page: Page, check: (ids: readonly number[], text: { item: string; tax: string; total: string }) => string | null) {
  const ov = new CheckoutOverviewPage(page);
  const wrong: string[] = [];
  let n = 0;
  try {
    for (const ids of sweepCarts) {
      await toOverview(page, ids);
      await expect(ov.total).toHaveText(/\d/);
      const problem = check(ids, { item: await ov.subtotal.innerText(), tax: await ov.tax.innerText(), total: await ov.total.innerText() });
      if (problem) wrong.push(problem);
      n++;
    }
  } finally {
    note('sweep', `đã quét ${n}/${sweepCarts.length} giỏ`);
  }
  return { n, wrong };
}

// =====================================================================
test.describe('Màn hình 1: Thông tin (/checkout-step-one.html)', () => {
  test('TC-001 Giỏ → Checkout mở trang Thông tin (giỏ 1 và 3 sản phẩm)', { tag: ['@AC-1', '@info'] }, async ({ page, cartPage: cart, infoPage: ip, evidence }) => {
    for (const [name, list] of [['Biến thể 1 (1 sản phẩm)', [backpack]], ['Biến thể 2 (3 sản phẩm)', [backpack, bikeLight, onesie]]] as const) {
      const inv = await freshLogin(page);
      for (const p of list) await inv.addButton(p).click();
      await inv.openCart();
      await cart.checkout();
      await expectInfoPage(page, ip, name);
      await expect.soft(ip.cartBadge, `${name}: số giỏ giữ nguyên`).toHaveText(String(list.length), QUICK);
      await evidence.shot(`${name}: trang Thông tin`, { highlight: [ip.title, ip.firstName, ip.lastName, ip.postalCode, ip.cartBadge], note: `Tiêu đề "Checkout: Your Information", 3 ô trống, nút Cancel / Continue, số giỏ ${list.length}` });
    }
  });

  test('TC-002 Thiếu ô bắt buộc: báo lỗi ô đầu tiên còn thiếu (7 tổ hợp)', { tag: ['@AC-2', '@info', '@smoke'] }, async ({ page, loggedInPage: _inv, infoPage: ip, evidence }) => {
    for (const c of missingCombos) {
      await toInfo(page, carts.backpack);
      await ip.fill(c.values);
      await ip.continueButton.click();
      await expect.soft(ip.error, `${c.name}: thông báo`).toHaveText(MSG_OF[c.missing], QUICK);
      await expectStillOnInfo(page, ip, c.name);
      await expect.soft(ip.firstName, `${c.name}: First Name giữ nguyên`).toHaveValue(c.values.first, QUICK);
      await expect.soft(ip.lastName, `${c.name}: Last Name giữ nguyên`).toHaveValue(c.values.last, QUICK);
      await expect.soft(ip.postalCode, `${c.name}: Zip giữ nguyên`).toHaveValue(c.values.zip, QUICK);
      await evidence.shot(`Tổ hợp ${c.name}`, { highlight: ip.error, note: `Thông báo "${MSG_OF[c.missing]}", vẫn ở trang Thông tin` });
    }
  });

  test('TC-003 Thiếu ô: chỉ ô còn thiếu bị tô đỏ, ô đã nhập không bị tô đỏ', { tag: ['@AC-2', '@info', '@BUG-22'] }, async ({ page, loggedInPage: _inv, infoPage: ip, evidence }) => {
    test.fail(true, 'BUG-22: thiếu 1 ô thì cả 3 ô đều bị tô đỏ (class error + icon)');
    // 3 filled fields per combo can fail (class + icon) × 2 s, 7 combos (script-gen.md timeout formula)
    test.setTimeout(90_000);
    for (const c of missingCombos) {
      await toInfo(page, carts.backpack);
      // Bước 0: oracle distinguishes the 2 states (before the error: no class token "error", no icon)
      for (const [key, field] of Object.entries(ip.fields)) {
        await expect.soft(field, `${c.name}, bước 0: ô ${key} chưa có class error`).not.toHaveClass(ERROR_CLASS, QUICK);
      }
      await expect.soft(ip.errorIcons, `${c.name}, bước 0: chưa có icon lỗi`).toHaveCount(0, QUICK);
      await ip.fill(c.values);
      await ip.continueButton.click();
      await expect(ip.error).toBeVisible();
      for (const [key, field] of Object.entries(ip.fields) as [MissingField, Locator][]) {
        if (key === c.missing) {
          await expect.soft(field, `${c.name}: ô thiếu ${key} có class error`).toHaveClass(ERROR_CLASS, QUICK);
          await expect.soft(ip.errorIconOf(field), `${c.name}: ô thiếu ${key} có 1 icon`).toHaveCount(1, QUICK);
        } else if (c.values[key]) {
          await expect.soft(field, `${c.name}: ô đã nhập ${key} không có class error`).not.toHaveClass(ERROR_CLASS, QUICK);
          await expect.soft(ip.errorIconOf(field), `${c.name}: ô đã nhập ${key} không có icon`).toHaveCount(0, QUICK);
        }
      }
      await evidence.shot(`Tổ hợp ${c.name}`, { highlight: [ip.firstName, ip.lastName, ip.postalCode], note: `Mong đợi: chỉ ô ${c.missing} viền đỏ + icon ✕; ô đã nhập không bị tô đỏ` });
    }
  });

  test('TC-004 Nút ✕ đóng thông báo lỗi, giá trị giữ nguyên, Continue lần sau báo ô tiếp theo', { tag: ['@AC-2', '@info'] }, async ({ page, loggedInPage: _inv, infoPage: ip, evidence }) => {
    await toInfo(page, carts.backpack);
    // Bước 1
    await ip.firstName.fill(info.a.first);
    await ip.continueButton.click();
    await expect(ip.error).toHaveText(M.lastNameRequired);
    await expect(ip.lastName).toHaveClass(ERROR_CLASS);
    await expect(ip.errorIconOf(ip.lastName)).toHaveCount(1);
    await evidence.shot('Bước 1: thiếu Last Name', { highlight: [ip.error, ip.lastName], note: '"Error: Last Name is required", ô Last Name tô đỏ' });
    // Bước 2
    await ip.errorCloseButton.click();
    await expect(ip.error).toBeHidden({ timeout: NEG });
    for (const field of Object.values(ip.fields)) await expect(field).not.toHaveClass(ERROR_CLASS);
    await expect(ip.errorIcons).toHaveCount(0);
    await expect(ip.firstName).toHaveValue(info.a.first);
    await evidence.shot('Bước 2: bấm ✕', { highlight: [ip.firstName, ip.lastName, ip.postalCode], note: 'Thông báo đóng, không ô nào tô đỏ, First Name vẫn "An"' });
    // Bước 3
    await ip.lastName.fill(info.a.last);
    await ip.continueButton.click();
    await expect(ip.error).toHaveText(M.postalCodeRequired);
    await expect(ip.firstName).toHaveValue(info.a.first);
    await expect(ip.lastName).toHaveValue(info.a.last);
    await evidence.shot('Bước 3: thiếu Zip', { highlight: ip.error, note: '"Error: Postal Code is required", First / Last giữ nguyên' });
  });

  test('TC-005 Ô chỉ có khoảng trắng / ký tự tab bị coi như trống', { tag: ['@AC-2', '@info', '@BUG-34'] }, async ({ page, loggedInPage: _inv, infoPage: ip, evidence }) => {
    test.fail(true, 'BUG-34: ô chỉ có khoảng trắng / tab được coi là đã nhập, sang Tổng quan');
    test.setTimeout(75_000);
    for (const [i, v] of whitespaceInfo.entries()) {
      const name = `Biến thể ${i + 1} (${v.name})`;
      await toInfo(page, carts.backpack);
      await ip.fill(v.values); // fill() types the tab character itself (manual run: paste it, do not press Tab)
      await ip.continueButton.click();
      await expect.soft(ip.error, `${name}: thông báo`).toHaveText(MSG_OF[v.missing], QUICK);
      await expectStillOnInfo(page, ip, name);
      await evidence.shot(name, { highlight: [ip.error, ip.title], note: `Mong đợi: ở lại trang Thông tin, "${MSG_OF[v.missing]}"` });
    }
  });

  test('TC-006 Giá trị hợp lệ đa dạng được nhận, sang Tổng quan, script không chạy', { tag: ['@AC-3', '@info', '@overview', '@security'] }, async ({ page, loggedInPage: _inv, infoPage: ip, overviewPage: ov, evidence }) => {
    test.setTimeout(60_000);
    const dialogs: string[] = [];
    page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
    const errors = watchErrors(page);
    for (const v of variedInfo) {
      dialogs.length = 0;
      errors.reset();
      await toInfo(page, carts.backpack);
      await ip.fill(v.values);
      await ip.continueButton.click();
      await expect.soft(ov.finishButton, `${v.name}: sang Tổng quan (nút Finish)`).toBeVisible(QUICK);
      await expect.soft(page, `${v.name}: URL`).toHaveURL(/\/checkout-step-two\.html$/, QUICK);
      await expect.soft(ov.title, `${v.name}: tiêu đề`).toHaveText(M.titleOverview, QUICK);
      await expect.soft(ov.itemNames, `${v.name}: 1 dòng Backpack`).toHaveText([backpack.name], QUICK);
      await expect.soft(ip.error, `${v.name}: không có thông báo lỗi`).toHaveCount(0, QUICK);
      expect.soft(dialogs, `${v.name}: 0 hộp thoại (script không chạy)`).toEqual([]);
      expect.soft(errors.pageErrors, `${v.name}: 0 pageerror`).toEqual([]);
      await evidence.shot(`Bộ ${v.name}`, { highlight: ov.title, note: 'Sang Tổng quan, không hộp thoại, không lỗi JavaScript' });
    }
  });

  test('TC-007 Chuỗi 5000 ký tự ở cả 3 ô được nhận', { tag: ['@AC-3', '@info', '@overview'] }, async ({ page, loggedInPage: _inv, infoPage: ip, overviewPage: ov, evidence }) => {
    const errors = watchErrors(page);
    await toInfo(page, carts.backpack);
    await ip.fill({ first: longValue, last: longValue, zip: longValue });
    for (const field of Object.values(ip.fields)) await expect(field).toHaveValue(longValue);
    await evidence.shot('Bước 2: 3 ô 5000 ký tự', { highlight: [ip.firstName, ip.lastName, ip.postalCode], note: 'Mỗi ô có đủ 5000 ký tự (kiểm trong code)' });
    await ip.continueToOverview();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(ov.title).toHaveText(M.titleOverview);
    expect(errors.pageErrors, '0 pageerror').toEqual([]);
    await evidence.shot('Bước 3: Tổng quan', { highlight: ov.title, note: 'Sang Tổng quan' });
  });

  test('TC-009 Nhấn Enter trong ô nhập xử lý như Continue', { tag: ['@AC-2', '@AC-3', '@info', '@BUG-23'] }, async ({ page, loggedInPage: _inv, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    test.fail(true, 'BUG-23: Enter ở ô nào cũng về trang giỏ (Cancel là nút submit đứng trước Continue)');
    test.setTimeout(90_000);
    const keys = ['first', 'last', 'zip'] as const;
    for (const filled of [true, false]) {
      for (const key of keys) {
        const name = `Biến thể ${(filled ? 1 : 4) + keys.indexOf(key)} (${filled ? 'đủ 3 ô' : 'trống'}, Enter ở ô ${key})`;
        await toInfo(page, carts.backpack);
        if (filled) await ip.fill(info.a);
        await ip.fields[key].press('Enter');
        if (filled) {
          await expect.soft(ov.finishButton, `${name}: sang Tổng quan`).toBeVisible(QUICK);
          await expect.soft(page, `${name}: URL`).toHaveURL(/\/checkout-step-two\.html$/, QUICK);
          await expect.soft(ov.title, `${name}: tiêu đề`).toHaveText(M.titleOverview, QUICK);
          await expect.soft(ov.itemNames, `${name}: 1 dòng Backpack`).toHaveText([backpack.name], QUICK);
        } else {
          await expect.soft(ip.error, `${name}: thông báo`).toHaveText(M.firstNameRequired, QUICK);
          await expect.soft(ip.firstName, `${name}: còn ô First Name`).toBeVisible(QUICK);
        }
        await expect.soft(cart.checkoutButton, `${name}: không về trang giỏ`).toBeHidden(QUICK);
        await evidence.shot(name, { highlight: filled ? [ov.title, cart.checkoutButton] : [ip.error, cart.checkoutButton], note: filled ? 'Mong đợi: sang Tổng quan như bấm Continue' : 'Mong đợi: ở lại Thông tin, "Error: First Name is required"' });
      }
    }
  });

  test('TC-010 Cancel ở Thông tin về trang giỏ, giỏ giữ nguyên', { tag: ['@AC-3', '@info', '@smoke'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.fill(info.a);
    await ip.cancel();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cart.checkoutButton).toBeVisible();
    await expect(cart.itemNames).toHaveText([backpack.name, onesie.name]);
    await expect(cart.cartBadge).toHaveText('2');
    await evidence.shot('Sau khi bấm Cancel', { highlight: [cart.cartList, cart.cartBadge], note: 'Về trang giỏ, 2 dòng Backpack, Onesie, số giỏ 2' });
  });

  test('TC-011 Back, Forward, tải lại ở Thông tin', { tag: ['@AC-3', '@info'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    // Bước 1: Back
    await page.goBack();
    await expect(cart.checkoutButton).toBeVisible();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cart.items).toHaveCount(2);
    await expect(cart.cartBadge).toHaveText('2');
    // Bước 2: Forward
    await page.goForward();
    await expect(ip.firstName).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(ip.title).toHaveText(M.titleInfo);
    for (const field of Object.values(ip.fields)) await expect(field).toBeVisible();
    // Bước 3: reload (server answers 404 but the single-page app renders, O-11: check the page, not the HTTP code)
    await page.reload();
    await expect(ip.firstName).toBeVisible();
    await expect(ip.title).toHaveText(M.titleInfo);
    for (const field of Object.values(ip.fields)) await expect(field).toBeEditable();
    await expect(ip.cartBadge).toHaveText('2');
    await evidence.shot('Bước 3: sau khi tải lại', { highlight: [ip.title, ip.firstName, ip.lastName, ip.postalCode, ip.cartBadge], note: 'Vẫn trang Thông tin, 3 ô dùng được, số giỏ 2' });
    // Bước 4
    await ip.submit(info.a);
    await expect(ov.title).toHaveText(M.titleOverview);
    await expect(ov.itemNames).toHaveText([backpack.name, onesie.name]);
  });

  test('TC-012 3 ô trống lại sau Cancel, Back / Forward, tải lại', { tag: ['@AC-3', '@info'] }, async ({ page, loggedInPage: _inv, cartPage: cart, infoPage: ip, evidence }) => {
    const variants: [string, () => Promise<void>][] = [
      ['Biến thể 1 (Cancel rồi Checkout lại)', async () => { await ip.cancel(); await cart.checkout(); }],
      ['Biến thể 2 (Back rồi Forward)', async () => {
        await page.goBack();
        await expect(cart.checkoutButton).toBeVisible();
        await page.goForward();
        await expect(ip.firstName).toBeVisible();
      }],
      ['Biến thể 3 (tải lại)', async () => { await page.reload(); await expect(ip.firstName).toBeVisible(); }],
    ];
    for (const [name, action] of variants) {
      await toInfo(page, carts.backpack);
      await ip.fill(info.a);
      await action();
      await expect.soft(ip.title, `${name}: tiêu đề`).toHaveText(M.titleInfo, QUICK);
      for (const [key, field] of Object.entries(ip.fields)) await expect.soft(field, `${name}: ô ${key} trống`).toHaveValue('', QUICK);
      await evidence.shot(name, { highlight: [ip.firstName, ip.lastName, ip.postalCode], note: '3 ô trống (Q10: không giữ giá trị là đúng)' });
    }
  });

  test('TC-013 problem_user: gõ được cả 3 ô, mỗi ô nhận đúng giá trị', { tag: ['@AC-1', '@AC-3', '@info', '@overview', '@BUG-28'] }, async ({ page, loginAs, infoPage: ip, overviewPage: ov, evidence }) => {
    test.fail(true, 'BUG-28: problem_user gõ ở Last Name thì ký tự đi vào First Name');
    test.setTimeout(60_000);
    await loginAs(users.problem);
    // Biến thể 1: gõ từng phím
    await toInfo(page, carts.backpack);
    await ip.firstName.fill(info.a.first);
    await ip.lastName.click();
    await ip.lastName.pressSequentially('Lee');
    await evidence.shot('Biến thể 1: gõ phím "Lee" vào Last Name', { highlight: [ip.firstName, ip.lastName], note: 'Mong đợi: First Name "An", Last Name "Lee"' });
    await expect.soft(ip.firstName, 'Biến thể 1: First Name').toHaveValue(info.a.first, QUICK);
    await expect.soft(ip.lastName, 'Biến thể 1: Last Name').toHaveValue('Lee', QUICK);
    // Biến thể 2: fill
    await toInfo(page, carts.backpack);
    await ip.fill({ first: info.a.first, last: 'Lee', zip: info.a.zip });
    await expect.soft(ip.firstName, 'Biến thể 2: First Name').toHaveValue(info.a.first, QUICK);
    await expect.soft(ip.lastName, 'Biến thể 2: Last Name').toHaveValue('Lee', QUICK);
    await expect.soft(ip.postalCode, 'Biến thể 2: Zip').toHaveValue(info.a.zip, QUICK);
    await ip.continueButton.click();
    await expect.soft(ov.finishButton, 'Biến thể 2: sang Tổng quan').toBeVisible(QUICK);
    await expect.soft(page, 'Biến thể 2: URL').toHaveURL(/\/checkout-step-two\.html$/, QUICK);
    await expect.soft(ov.title, 'Biến thể 2: tiêu đề').toHaveText(M.titleOverview, QUICK);
    await expect.soft(page.getByText(M.lastNameRequired), 'Biến thể 2: không có "Last Name is required"').toHaveCount(0, QUICK);
    await evidence.shot('Biến thể 2: bấm Continue', { highlight: [ip.error, ov.title], note: 'Mong đợi: sang Tổng quan, không có "Error: Last Name is required"' });
  });

  test('TC-014 error_user: gõ được Last Name, không lỗi JavaScript, không gửi báo lỗi', { tag: ['@AC-1', '@AC-3', '@info', '@BUG-31'] }, async ({ page, loginAs, infoPage: ip, evidence }) => {
    test.fail(true, 'BUG-31: error_user không gõ được Last Name, mỗi phím 1 pageerror + 1 báo lỗi backtrace');
    await loginAs(users.error);
    await toInfo(page, carts.backpack);
    const errors = watchErrors(page);
    await ip.firstName.fill(info.a.first);
    await ip.lastName.click();
    await ip.lastName.pressSequentially('Lee');
    await ip.postalCode.fill(info.a.zip);
    await evidence.shot('Sau khi gõ "Lee" vào Last Name', { highlight: [ip.firstName, ip.lastName, ip.postalCode], note: 'Mong đợi: Last Name "Lee", không lỗi JavaScript' });
    await expect.soft(ip.lastName, 'Last Name').toHaveValue('Lee', QUICK);
    await expect.soft(ip.firstName, 'First Name').toHaveValue(info.a.first, QUICK);
    await expect.soft(ip.postalCode, 'Zip').toHaveValue(info.a.zip, QUICK);
    if (errors.pageErrors.length) note('pageerror (MSG-09?)', errors.pageErrors.join(' | '));
    expect.soft(errors.pageErrors, '0 pageerror').toEqual([]);
    expect.soft(errors.reports, '0 request tới submit.backtrace.io').toEqual([]);
  });

  test('TC-015 error_user: thiếu Last Name thì báo lỗi, không sang Tổng quan', { tag: ['@AC-2', '@info', '@overview', '@BUG-32'] }, async ({ page, loginAs, infoPage: ip, evidence }) => {
    test.fail(true, 'BUG-32: error_user bỏ qua kiểm tra Last Name');
    await loginAs(users.error);
    for (const [name, v] of [
      ['Biến thể 1 (Ann / trống / trống)', { first: 'Ann', last: '', zip: '' }],
      ['Biến thể 2 (Ann / trống / 70000)', { first: 'Ann', last: '', zip: info.a.zip }],
    ] as const) {
      await toInfo(page, carts.backpack);
      await ip.fill(v); // never touches Last Name (BUG-31 is TC-014)
      await ip.continueButton.click();
      await expect.soft(ip.error, `${name}: thông báo`).toHaveText(M.lastNameRequired, QUICK);
      await expectStillOnInfo(page, ip, name);
      await evidence.shot(name, { highlight: [ip.error, ip.title], note: 'Mong đợi: ở lại Thông tin, "Error: Last Name is required"' });
    }
  });

  test('TC-040 Mở thẳng Tổng quan khi chưa nhập thông tin bị đưa về Thông tin', { tag: ['@AC-2', '@AC-3', '@info', '@overview', '@security', '@BUG-26'] }, async ({ page, loggedInPage: inv, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    test.fail(true, 'BUG-26: mở thẳng /checkout-step-two.html bỏ qua bước nhập thông tin, Finish đặt được hàng');
    // firstName 5 s + 5 checks × 2 s + appears(header) 5 s + badge 2 s + ~4 s loads = 26 s, +30 % ≈ 34 s > 30 s default (review D2)
    test.setTimeout(45_000);
    await inv.addButton(backpack).click();
    await ov.goto();
    // Bước 1
    await expect.soft(ip.firstName, 'Bước 1: được đưa về trang Thông tin').toBeVisible({ timeout: NEG });
    await expect.soft(ip.title, 'Bước 1: tiêu đề').toHaveText(M.titleInfo, QUICK);
    for (const [key, field] of Object.entries(ip.fields)) await expect.soft(field, `Bước 1: ô ${key} trống`).toHaveValue('', QUICK);
    await expect.soft(ov.finishButton, 'Bước 1: không có nút Finish').toBeHidden(QUICK);
    await evidence.shot('Bước 1: mở thẳng Tổng quan', { highlight: ov.title, note: 'Mong đợi: bị đưa về "Checkout: Your Information"' });
    // Bước 2
    if (await ov.finishButton.isVisible()) {
      await ov.finishButton.click();
      expect.soft(await appears(co.header), 'Bước 2: không được hiện "Thank you for your order!"').toBe(false);
      await evidence.shot('Bước 2: bấm Finish', { highlight: co.header, note: 'Mong đợi: không đặt được hàng khi chưa nhập thông tin' });
    }
    await expect.soft(inv.cartBadge, 'Bước 2: số giỏ vẫn 1').toHaveText('1', QUICK);
  });

  test('TC-042 Giỏ trống mở thẳng trang Thông tin bị chặn', { tag: ['@AC-1', '@info', '@BUG-19'] }, async ({ page, loggedInPage: _inv, infoPage: ip, evidence }) => {
    test.fail(true, 'BUG-19 (biến thể URL): giỏ trống mở thẳng /checkout-step-one.html vẫn vào trang Thông tin');
    await ip.goto();
    await expect(page.getByTestId('primary-header')).toBeVisible();
    expect.soft(await appears(ip.firstName), 'không có ô First Name (chờ 5 giây)').toBe(false);
    await expect.soft(page.getByText(M.titleInfo, { exact: true }), 'không có tiêu đề "Checkout: Your Information"').toHaveCount(0, QUICK);
    await evidence.shot('Mở thẳng /checkout-step-one.html khi giỏ trống', { highlight: ip.title, note: 'Mong đợi: không vào được trang Thông tin' });
  });
});

// =====================================================================
test.describe('Màn hình 2: Tổng quan (/checkout-step-two.html)', () => {
  test('TC-016 Tổng quan liệt kê đủ và đúng sản phẩm (4 giỏ)', { tag: ['@AC-4', '@overview'] }, async ({ page, loggedInPage: _inv, overviewPage: ov, evidence }) => {
    test.setTimeout(60_000);
    for (const ids of [carts.backpack, carts.all6, carts.cheapest, carts.mixed]) {
      const name = `Giỏ [${ids.join(',')}]`;
      await toOverview(page, ids);
      await expect.soft(ov.quantityLabel, `${name}: cột QTY`).toHaveText(M.qtyLabel, QUICK);
      await expect.soft(ov.descriptionLabel, `${name}: cột Description`).toHaveText(M.descLabel, QUICK);
      await expect.soft(ov.items, `${name}: số dòng`).toHaveCount(ids.length, QUICK);
      await expectOverviewLines(ov, ids, name);
      await evidence.shot(name, { highlight: ov.items, note: `${ids.length} dòng theo thứ tự giỏ, QTY 1, mô tả, giá đúng TD-06` });
    }
  });

  test('TC-017 Tổng quan giữ thứ tự của giỏ = thứ tự thêm vào', { tag: ['@AC-4', '@overview'] }, async ({ loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    const order = carts.addOrder.map(productById).map((p) => p.name); // Fleece Jacket, Bike Light, Onesie
    for (const p of [onesie, fleeceJacket, bikeLight]) await inv.addButton(p).click();
    await inv.removeButton(onesie).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await expect(cart.itemNames).toHaveText(order);
    await cart.checkout();
    await ip.submit(info.a);
    await expect(ov.itemNames).toHaveText(order);
    await expectTotalsText(ov, expectedTotals(carts.addOrder), 'Bước 4');
    await evidence.shot('Bước 4: Tổng quan', { highlight: [ov.items, ov.subtotal, ov.tax, ov.total], note: 'Fleece Jacket, Bike Light, Onesie (như trang giỏ); $67.97 / $5.44 / $73.41' });
  });

  test('TC-018 Item total, Tax 8 %, Total đúng giá trị (13 giỏ đại diện)', { tag: ['@AC-4', '@overview'] }, async ({ page, loggedInPage: _inv, overviewPage: ov, evidence }) => {
    test.setTimeout(90_000);
    for (const c of representativeCarts) {
      const name = `Giỏ [${c.ids.join(',')}]`;
      await toOverview(page, c.ids);
      const got = await readCents(ov);
      expect.soft(got, `${name}: Item total / Tax / Total (cent)`).toEqual(c.expected);
    }
    await evidence.shot('Giỏ cuối [4,3,2,1,0]', { highlight: [ov.subtotal, ov.tax, ov.total], note: 'Giá trị (cent) của 13 giỏ so trong code với bảng TD-07 → TD-15' });
  });

  test('TC-019 Item total, Tax, Total đúng giá trị: quét cả 63 tổ hợp × 2 thứ tự', { tag: ['@AC-4', '@overview'] }, async ({ page, loggedInPage: _inv, overviewPage: ov, evidence }) => {
    // HITL #2 decision 4: 120 carts, one context, own timeout 180 s, no retries
    test.setTimeout(180_000);
    const { n, wrong } = await sweep(page, (ids, text) => {
      const want = expectedTotals(ids);
      const got = { item: textToCents(text.item), tax: textToCents(text.tax), total: textToCents(text.total) };
      return JSON.stringify(got) === JSON.stringify(want) ? null : `[${ids.join(',')}] mong đợi ${JSON.stringify(want)}, thực tế ${JSON.stringify(got)}`;
    });
    await evidence.shot('Kết thúc quét', { highlight: [ov.subtotal, ov.tax, ov.total], note: `Đã quét ${n}/120 giỏ, ${wrong.length} giỏ sai giá trị` });
    expect(n, 'đã quét đủ 120 giỏ').toBe(120);
    expect(wrong, `Giỏ sai giá trị (${wrong.length}):\n${wrong.join('\n')}`).toEqual([]);
  });

  test('TC-020 Số tiền luôn dạng $x.xx (giỏ gây lỗi số thực, giỏ rỗng, mọi tài khoản)', { tag: ['@AC-4', '@overview', '@BUG-25'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    test.fail(true, 'BUG-25: Item total in số thực chưa làm tròn ($59.980000000000004), giỏ rỗng "$0"');
    // HITL #2 decision 4: own timeout 180 s. Estimate: 120-cart sweep ~45 s + 10 variants (3 logins, one ~5 s; ~11 failing soft
    // checks × 2 s) ~40 s = ~85 s, +30 % ≈ 110 s (one local run: 80 s)
    test.setTimeout(180_000);
    const expectStrings = async (name: string, s: { item: string; tax: string; total: string }) => {
      await expect.soft(ov.subtotal, `${name}: Item total`).toHaveText(s.item, QUICK);
      await expect.soft(ov.tax, `${name}: Tax`).toHaveText(s.tax, QUICK);
      await expect.soft(ov.total, `${name}: Total`).toHaveText(s.total, QUICK);
      await evidence.shot(name, { highlight: [ov.subtotal, ov.tax, ov.total], note: `Mong đợi: "${s.item}", "${s.tax}", "${s.total}"` });
    };
    const FORMAT = /^\$\d+\.\d{2}$/;
    const amountPart = (text: string) => text.replace(/^[^$]*/, '');
    // Biến thể 1: thêm từ danh sách Bike Light rồi Fleece Jacket
    await inv.addButton(bikeLight).click();
    await inv.addButton(fleeceJacket).click();
    await inv.openCart();
    await cart.checkout();
    await ip.submit(info.a);
    await expectStrings('Biến thể 1 [0,5] qua giao diện', floatCarts[0]);
    // Biến thể 2–5
    for (const [i, c] of floatCarts.slice(1).entries()) {
      await toOverview(page, c.ids);
      await expectStrings(`Biến thể ${i + 2} [${c.ids.join(',')}]`, c);
    }
    // Biến thể 6: giỏ rỗng (đường BUG-19, dự phòng Back sau khi đặt; HITL #2 decision 8)
    await setCart(page, carts.empty);
    await cart.goto();
    let reached = false;
    if (await enabledNow(cart.checkoutButton)) {
      await cart.checkoutButton.click();
      if (await appears(ip.firstName)) {
        await ip.fill(info.a);
        await ip.continueButton.click();
        reached = await appears(ov.finishButton);
      }
    }
    if (!reached) {
      await placeOrder(page, carts.backpackOnesie);
      await page.goBack();
      reached = await appears(ov.finishButton);
    }
    if (reached) await expectStrings('Biến thể 6 giỏ rỗng', emptyCartTotals);
    else note('Biến thể 6', 'không áp dụng: không tới được Tổng quan rỗng bằng đường BUG-19 lẫn Back sau khi đặt');
    // Biến thể 7–9: visual_user, performance_glitch_user, error_user với [0,5]
    for (const [i, user] of [users.visual, users.performanceGlitch, users.error].entries()) {
      const name = `Biến thể ${i + 7} ${user.username} [0,5]`;
      await freshLogin(page, user);
      await setCart(page, floatCarts[0].ids);
      if (user === users.error) {
        // error_user cannot pass the Information page (BUG-31): open the Overview by URL, guard BUG-26 (decision 3b)
        await ov.goto();
        if (!(await appears(ov.finishButton))) { note('blocked', `${name}: blocked: BUG-26 đã sửa`); continue; }
      } else {
        await toOverview(page, floatCarts[0].ids);
      }
      await expectStrings(name, floatCarts[0]);
    }
    // Biến thể 10: 120 giỏ, kiểm chuỗi (standard_user)
    await freshLogin(page);
    const { n, wrong } = await sweep(page, (ids, text) => {
      const bad = Object.entries(text).filter(([, t]) => !FORMAT.test(amountPart(t)));
      return bad.length ? `[${ids.join(',')}] ${bad.map(([, t]) => t).join(' / ')}` : null;
    });
    await evidence.shot('Biến thể 10: kết thúc quét 120 giỏ', { highlight: [ov.subtotal, ov.tax, ov.total], note: `Đã quét ${n}/120 giỏ, ${wrong.length} giỏ sai định dạng $x.xx` });
    expect.soft(n, 'Biến thể 10: đã quét đủ 120 giỏ (thiếu = script-issue, lesson L4)').toBe(120);
    expect.soft(wrong, `Biến thể 10: giỏ sai định dạng (${wrong.length}):\n${wrong.join('\n')}`).toEqual([]);
    // Biến thể 11: problem_user [4,0,2], chỉ kiểm định dạng (giá trị gấp đôi là BUG-29, TC-026)
    await freshLogin(page, users.problem);
    await setCart(page, carts.mixed);
    await ov.goto();
    if (!(await appears(ov.finishButton))) {
      note('blocked', 'Biến thể 11 problem_user: blocked: BUG-26 đã sửa');
    } else {
      for (const [what, l] of [['Item total', ov.subtotal], ['Tax', ov.tax], ['Total', ov.total]] as const) {
        expect.soft(amountPart(await l.innerText()), `Biến thể 11 problem_user: ${what} dạng $x.xx`).toMatch(FORMAT);
      }
      await evidence.shot('Biến thể 11 problem_user [4,0,2]', { highlight: [ov.subtotal, ov.tax, ov.total], note: 'Mong đợi: cả 3 số dạng $x.xx (không kiểm giá trị)' });
    }
  });

  test('TC-021 Payment / Shipping Information là 2 dòng cố định nguyên văn', { tag: ['@AC-4', '@overview'] }, async ({ page, loggedInPage: _inv, overviewPage: ov, evidence }) => {
    for (const [name, ids, who] of [
      ['Giỏ 1 [4], An / Le / 70000', carts.backpack, info.a],
      ['Giỏ 2 [5,0,2], tiếng Việt', carts.addOrder, variedInfo[0].values],
    ] as const) {
      await toOverview(page, ids, who);
      await expectPaymentShipping(ov, name);
      await evidence.shot(name, { highlight: [ov.paymentValue, ov.shippingValue, ov.priceTotalLabel], note: '"SauceCard #31337", "Free Pony Express Delivery!", "Price Total"' });
    }
  });

  test('TC-022 Cancel ở Tổng quan về danh sách, giỏ giữ nguyên', { tag: ['@AC-5', '@overview'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.submit(info.a);
    await ov.cancel();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await expect(inv.cartBadge).toHaveText('2');
    await expect(page.getByRole('button', { name: 'Remove', exact: true })).toHaveCount(2);
    await expect(inv.removeButton(backpack)).toBeVisible();
    await expect(inv.removeButton(onesie)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to cart', exact: true })).toHaveCount(4);
    await evidence.shot('Sau khi bấm Cancel', { highlight: [inv.cartButton(backpack), inv.cartButton(onesie), inv.cartBadge], note: 'Danh sách, số giỏ 2, Backpack / Onesie là Remove' });
  });

  test('TC-024 Bấm tên sản phẩm ở Tổng quan mở đúng trang chi tiết (cả 6, standard_user)', { tag: ['@AC-4', '@overview'] }, async ({ page, loggedInPage: _inv, overviewPage: ov, productDetailPage: detail, evidence }) => {
    test.setTimeout(60_000);
    for (const p of allProducts) {
      await toOverview(page, carts.all6);
      await ov.openProduct(p);
      await expect.soft(page, `${p.name}: URL ?id=${p.id}`).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${p.id}$`), QUICK);
      await expect.soft(detail.name, `${p.name}: tên`).toHaveText(p.name, QUICK);
      await expect.soft(detail.price, `${p.name}: giá`).toHaveText(priceText(p), QUICK);
      await expect.soft(detail.backButton, `${p.name}: nút Back to products`).toBeVisible(QUICK);
    }
    await evidence.shot('Chi tiết sản phẩm cuối', { highlight: [detail.name, detail.price], note: 'Mỗi tên mở đúng chi tiết của chính nó (6 sản phẩm kiểm trong code)' });
  });

  test('TC-025 problem_user: bấm tên sản phẩm ở Tổng quan mở đúng trang chi tiết (cả 6)', { tag: ['@AC-4', '@overview', '@BUG-11'] }, async ({ page, loginAs, overviewPage: ov, productDetailPage: detail, evidence }) => {
    test.setTimeout(60_000);
    await loginAs(users.problem);
    for (const [i, p] of allProducts.entries()) {
      await setCart(page, [p.id]);
      await ov.goto();
      if (i === 0) {
        // Bước 0: guard BEFORE test.fail() (HITL #2 decision 3): a failing guard is a real failure (Blocked), not an expected one
        await expect(ov.finishButton, GUARD).toBeVisible({ timeout: NEG });
        test.fail(true, 'BUG-11 (biến thể ở Tổng quan): problem_user bấm tên mở sai chi tiết, lệch +1');
      }
      await expect(ov.finishButton).toBeVisible();
      await ov.openProduct(p);
      await expect.soft(page, `${p.name}: URL ?id=${p.id}`).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${p.id}$`), QUICK);
      await expect.soft(detail.name, `${p.name}: tên`).toHaveText(p.name, QUICK);
      await evidence.shot(`Bấm ${p.name}`, { highlight: detail.name, note: `Mong đợi: ?id=${p.id}, tên "${p.name}"` });
    }
  });

  test('TC-026 problem_user: Item total, Tax, Total đúng như standard_user', { tag: ['@AC-4', '@overview', '@complete', '@BUG-29'] }, async ({ page, loginAs, overviewPage: ov, completePage: co, evidence }) => {
    test.setTimeout(90_000);
    await loginAs(users.problem);
    const list = [carts.backpack, [0], carts.cheapest, carts.backpackOnesie, carts.mixed, carts.all6] as const;
    for (const [i, ids] of list.entries()) {
      const name = `Giỏ [${ids.join(',')}]`;
      await setCart(page, ids);
      await ov.goto();
      if (i === 0) {
        await expect(ov.finishButton, GUARD).toBeVisible({ timeout: NEG });
        test.fail(true, 'BUG-29: problem_user có Item total gấp đôi, Tax / Total tính theo số sai');
      }
      await expect(ov.finishButton).toBeVisible();
      for (const p of ids.map(productById)) {
        await expect.soft(ov.line(p).getByTestId('inventory-item-price'), `${name}: giá ${p.name}`).toHaveText(priceText(p), QUICK);
      }
      expect.soft(await readCents(ov), `${name}: Item total / Tax / Total (cent)`).toEqual(expectedTotals(ids));
      await evidence.shot(name, { highlight: [ov.subtotal, ov.tax, ov.total], note: `Mong đợi như standard_user: ${Object.values(totalsText(expectedTotals(ids))).join(', ')}` });
    }
    // Biến thể PDF: giỏ [4,2]
    await setCart(page, carts.backpackOnesie);
    await ov.goto();
    await expect(ov.finishButton).toBeVisible();
    await finishAsPrecondition(page, 'problem_user Finish sang Hoàn tất (không phải BUG-29)');
    const pdf = await receipt(co);
    const t = expectedTotals(carts.backpackOnesie);
    const want = ['Item total', amount(t.item), 'Tax', amount(t.tax), 'Total', amount(t.total)];
    expect.soft(inOrder(pdf.texts, want), 'PDF: Item total 37.98, Tax 3.04, Total 41.02').toEqual(want);
    note('PDF problem_user', pdf.texts.join(' | '));
    await evidence.shot('Biến thể PDF: đã tải biên nhận [4,2]', { highlight: co.generatePdfButton, note: 'Mong đợi PDF: Item total 37.98, Tax 3.04, Total 41.02 (chữ trong file ở annotation "PDF problem_user")' });
  });

  test('TC-028 Tổng quan không có sản phẩm thì không đặt được đơn (giỏ trống qua Checkout, mở thẳng URL)', { tag: ['@AC-5', '@overview', '@complete', '@BUG-24'] }, async ({ page, cartPage: cart, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    test.fail(true, 'BUG-24: Tổng quan rỗng vẫn Finish được, hiện "Thank you for your order!"');
    test.setTimeout(60_000);
    // Đường 1: giỏ trống → Checkout (BUG-19 cho bấm)
    await freshLogin(page);
    await cart.goto();
    await expect(cart.cartList).toBeVisible();
    let onInfo = false;
    if (await enabledNow(cart.checkoutButton)) {
      await cart.checkoutButton.click();
      onInfo = await appears(ip.firstName);
    }
    if (onInfo) {
      await ip.fill(info.a);
      await ip.continueButton.click();
      if (await appears(ov.finishButton)) {
        await ov.finishButton.click();
        expect.soft(await appears(co.header), 'Đường 1: không được hiện "Thank you for your order!"').toBe(false);
        await evidence.shot('Đường 1: Finish khi giỏ trống', { highlight: co.header, note: 'Mong đợi: không tạo được đơn rỗng' });
      } else note('Đường 1', 'không tới được Tổng quan: đúng');
    } else note('Đường 1', 'không vào được trang Thông tin: đúng');
    // Đường 2: mở thẳng /checkout-step-two.html
    await freshLogin(page);
    await ov.goto();
    if (await appears(ov.finishButton)) {
      await ov.finishButton.click();
      expect.soft(await appears(co.header), 'Đường 2: không được hiện "Thank you for your order!"').toBe(false);
      await evidence.shot('Đường 2: Finish ở Tổng quan mở thẳng, giỏ trống', { highlight: co.header, note: 'Mong đợi: không tạo được đơn rỗng' });
    } else note('Đường 2', 'không thấy nút Finish: đúng');
  });

  test('TC-030 Finish sang trang Hoàn tất, giỏ được làm trống', { tag: ['@AC-5', '@overview', '@complete', '@smoke'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.submit(info.a);
    await ov.finish();
    await expect.poll(() => co.imageWidth()).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(co.title).toHaveText(M.titleComplete);
    await expect(co.header).toHaveText(M.completeHeader);
    await expect(co.text).toHaveText(M.completeText);
    await expect(co.ponyImage).toBeVisible();
    await expect(co.backHomeButton).toBeVisible();
    await expect(co.generatePdfButton).toBeVisible();
    await expect(co.cartBadge).toBeHidden();
    expect(await cartStorage(page), 'không còn khóa cart-contents').toBeNull();
    await evidence.shot('Trang Hoàn tất', { highlight: [co.header, co.text, co.ponyImage, co.cartLink], note: '"Thank you for your order!", đoạn dispatched, ảnh, 2 nút, không còn số giỏ' });
  });

  test('TC-032 problem_user: Finish làm trống giỏ, Back Home toàn \'Add to cart\', không đặt lại được', { tag: ['@AC-5', '@AC-6', '@overview', '@complete', '@BUG-30'] }, async ({ page, loginAs, overviewPage: ov, completePage: co, evidence }) => {
    test.setTimeout(60_000);
    await loginAs(users.problem);
    const startVariant = async (first = false) => {
      await setCart(page, carts.mixed);
      await ov.goto();
      if (first) {
        await expect(ov.finishButton, GUARD).toBeVisible({ timeout: NEG });
        test.fail(true, 'BUG-30: problem_user Finish xong giỏ không được làm trống');
      }
      await expect(ov.finishButton).toBeVisible();
      await finishAsPrecondition(page, 'problem_user Finish sang Hoàn tất (không phải BUG-30)');
    };
    // Biến thể 1
    await startVariant(true);
    await expect.soft(co.cartBadge, 'Biến thể 1: không còn số giỏ').toBeHidden(QUICK);
    expect.soft(await cartStorage(page), 'Biến thể 1: không còn khóa cart-contents').toBeNull();
    await evidence.shot('Biến thể 1: sau Finish', { highlight: co.cartLink, note: 'Mong đợi: không còn số giỏ' });
    // Biến thể 2
    await startVariant();
    await co.backHome();
    await expectEmptyList(page, 'Biến thể 2');
    await evidence.shot('Biến thể 2: Back Home', { highlight: [new InventoryPage(page).inventoryList, co.cartLink], note: 'Mong đợi: 6 Add to cart, 0 Remove, không có số giỏ' });
    // Biến thể 3
    await startVariant();
    await page.goBack();
    if (await appears(ov.finishButton)) {
      await expect.soft(ov.items, 'Biến thể 3: Tổng quan không còn dòng sản phẩm').toHaveCount(0, QUICK);
      await evidence.shot('Biến thể 3: Back về Tổng quan', { highlight: ov.items, note: 'Mong đợi: không còn sản phẩm' });
      await ov.finishButton.click();
      expect.soft(await appears(co.header), 'Biến thể 3: không đặt được đơn lần 2').toBe(false);
      await evidence.shot('Biến thể 3: Finish lần 2', { highlight: co.header, note: 'Mong đợi: không hiện "Thank you for your order!" lần nữa' });
    } else note('Biến thể 3', 'Back không về Tổng quan có nút Finish: đúng');
  });

  test('TC-033 error_user: Finish sang Hoàn tất, giỏ trống, không lỗi JavaScript', { tag: ['@AC-5', '@overview', '@complete', '@BUG-33'] }, async ({ page, loginAs, overviewPage: ov, completePage: co, evidence }) => {
    await loginAs(users.error);
    await setCart(page, carts.mixed);
    await ov.goto();
    await expect(ov.finishButton, GUARD).toBeVisible({ timeout: NEG });
    test.fail(true, 'BUG-33: error_user bấm Finish không có tác dụng, lỗi JavaScript');
    const errors = watchErrors(page);
    await ov.finishButton.click();
    await expect.soft(co.header, 'sang Hoàn tất, "Thank you for your order!"').toHaveText(M.completeHeader, { timeout: NEG });
    await expect.soft(page, 'URL').toHaveURL(/\/checkout-complete\.html$/, QUICK);
    await evidence.shot('Sau khi bấm Finish', { highlight: [ov.finishButton, co.header, co.cartLink], note: 'Mong đợi: trang Hoàn tất, không còn số giỏ' });
    await expect.soft(co.cartBadge, 'không còn số giỏ').toBeHidden(QUICK);
    expect.soft(await cartStorage(page), 'không còn khóa cart-contents').toBeNull();
    if (errors.pageErrors.length) note('pageerror (MSG-10?)', errors.pageErrors.join(' | '));
    expect.soft(errors.pageErrors, '0 pageerror').toEqual([]);
    expect.soft(errors.reports, '0 request tới submit.backtrace.io').toEqual([]);
  });

  test('TC-051 Finish chỉ tạo đơn theo giỏ / phiên hiện tại (2 tab, sau Reset, giỏ đổi ở tab khác, đăng xuất ở tab khác)', { tag: ['@AC-5', '@overview', '@complete', '@BUG-35'] }, async ({ page, overviewPage: ov, completePage: co, evidence }) => {
    test.fail(true, 'BUG-35: Finish đặt đơn theo Tổng quan đã cũ, không kiểm giỏ / phiên hiện tại');
    test.setTimeout(120_000);
    const loginPage = new LoginPage(page);
    // Biến thể 1 (2 tab). The bug shows in tab 2, so tab 2 is the test's own page (evidence) and tab 1 a new page.
    await freshLogin(page);
    let tab = await page.context().newPage();
    await tab.goto('/inventory.html');
    await toOverview(tab, carts.backpackOnesie);
    await toOverview(page, carts.backpackOnesie);
    await finishAsPrecondition(tab, 'tab 1 đặt đơn đầu tiên (không phải BUG-35)');
    await ov.finishButton.click();
    expect.soft(await appears(co.header), 'Biến thể 1: tab 2 không đặt được đơn lần 2').toBe(false);
    await evidence.shot('Biến thể 1: Finish ở tab 2 sau khi tab 1 đã đặt', { highlight: co.header, note: 'Mong đợi: tab 2 không hiện "Thank you for your order!"' });
    await tab.close();
    // Biến thể 2 (sau Reset App State)
    await freshLogin(page);
    await toOverview(page, carts.backpackOnesie);
    await ov.resetAppState();
    await ov.closeMenu();
    await ov.finishButton.click();
    expect.soft(await appears(co.header), 'Biến thể 2: giỏ đã trống thì không tạo đơn').toBe(false);
    await evidence.shot('Biến thể 2: Finish sau Reset App State', { highlight: co.header, note: 'Mong đợi: không hiện "Thank you for your order!"' });
    // Biến thể 3 (giỏ thêm Onesie ở tab khác)
    await freshLogin(page);
    await toOverview(page, carts.backpack);
    tab = await page.context().newPage();
    const inv2 = new InventoryPage(tab);
    await inv2.goto();
    await inv2.addButton(onesie).click();
    await expect(inv2.removeButton(onesie)).toBeVisible();
    await ov.finishButton.click();
    if (await appears(co.header)) {
      const pdf = await receipt(co);
      const want = [backpack.name, amount(cents(backpack)), onesie.name, amount(cents(onesie)), 'Total', '41.02'];
      expect.soft(inOrder(pdf.texts, want), 'Biến thể 3: PDF khớp giỏ hiện tại (Backpack, Onesie, Total 41.02)').toEqual(want);
      note('Biến thể 3 PDF', pdf.texts.join(' | '));
    } else {
      expect.soft(await cartStorage(page), 'Biến thể 3: không đặt thì giỏ vẫn [4,2]').toBe('[4,2]');
    }
    await evidence.shot('Biến thể 3: Finish sau khi tab khác thêm Onesie', { highlight: [co.header, co.cartLink], note: 'Mong đợi: đơn (PDF) có cả Onesie, Total 41.02; hoặc không đặt và giỏ giữ [4,2]' });
    await tab.close();
    // Biến thể 4 (giỏ bỏ Onesie ở tab khác)
    await freshLogin(page);
    await toOverview(page, carts.backpackOnesie);
    tab = await page.context().newPage();
    const cart2 = new CartPage(tab);
    await cart2.goto();
    await cart2.removeButton(onesie).click();
    await expect(cart2.items).toHaveCount(1);
    await ov.finishButton.click();
    if (await appears(co.header)) {
      const pdf = await receipt(co);
      const want = [backpack.name, amount(cents(backpack)), 'Total', '32.39'];
      expect.soft(inOrder(pdf.texts, want), 'Biến thể 4: PDF chỉ có Backpack, Total 32.39').toEqual(want);
      expect.soft(pdf.texts, 'Biến thể 4: PDF không có Onesie đã bỏ').not.toContain(onesie.name);
      note('Biến thể 4 PDF', pdf.texts.join(' | '));
    } else {
      expect.soft(await cartStorage(page), 'Biến thể 4: không đặt thì giỏ vẫn [4]').toBe('[4]');
    }
    await evidence.shot('Biến thể 4: Finish sau khi tab khác bỏ Onesie', { highlight: [co.header, co.cartLink], note: 'Mong đợi: đơn (PDF) chỉ Backpack, Total 32.39; hoặc không đặt và giỏ giữ [4]' });
    await tab.close();
    // Biến thể 5 (đăng xuất ở tab khác)
    await freshLogin(page);
    await toOverview(page, carts.backpackOnesie);
    tab = await page.context().newPage();
    const inv3 = new InventoryPage(tab);
    await inv3.goto();
    await inv3.logout();
    const before = await cartStorage(page);
    note('Biến thể 5: cart-contents ngay trước Finish', String(before));
    await ov.finishButton.click();
    await expect.soft(loginPage.loginButton, 'Biến thể 5: về trang đăng nhập').toBeVisible({ timeout: NEG });
    await expect.soft(page, 'Biến thể 5: URL /').toHaveURL(isLoginScreen, QUICK);
    await expect.soft(loginPage.errorMessage, 'Biến thể 5: thông báo').toHaveText(MSG.notLoggedIn(protectedPages.checkoutComplete), QUICK);
    expect.soft(await cartStorage(page), 'Biến thể 5: giỏ sau Finish giống hệt ngay trước Finish').toBe(before);
    await evidence.shot('Biến thể 5: Finish sau khi tab khác đăng xuất', { highlight: loginPage.errorMessage, note: 'Mong đợi: bị chặn về trang đăng nhập và giỏ giữ nguyên' });
    await tab.close();
    const again = await login(page, users.standard);
    const count = (JSON.parse(before ?? '[]') as number[]).length;
    if (count) await expect.soft(again.cartBadge, `Biến thể 5: đăng nhập lại thấy số giỏ ${count}`).toHaveText(String(count), QUICK);
    else await expect.soft(again.cartBadge, 'Biến thể 5: đăng nhập lại không có số giỏ').toBeHidden(QUICK);
    await evidence.shot('Biến thể 5: đăng nhập lại', { highlight: again.cartLink, note: `Mong đợi: số giỏ = ${count} (giá trị ngay trước Finish)` });
  });
});

// =====================================================================
test.describe('Màn hình 3: Hoàn tất (/checkout-complete.html)', () => {
  test('TC-029 Đặt xong bấm Back rồi Finish lại: không đặt được đơn lần 2', { tag: ['@AC-5', '@overview', '@complete', '@BUG-24'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    test.fail(true, 'BUG-24 (đường 3): Back sau khi đặt về Tổng quan rỗng, Finish lại được');
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.submit(info.a);
    // Bước 1
    await ov.finish();
    await expect(co.cartBadge).toBeHidden();
    // Bước 2
    await page.goBack();
    const onOverview = await appears(ov.finishButton);
    await expect.soft(ov.cartBadge, 'Bước 2: không có số giỏ (giỏ không bị khôi phục)').toBeHidden(QUICK);
    // Bước 3
    if (onOverview) {
      await evidence.shot('Bước 2: Back về Tổng quan', { highlight: [ov.items, ov.subtotal, ov.finishButton], note: 'Tổng quan rỗng nhưng còn nút Finish' });
      await ov.finishButton.click();
      expect.soft(await appears(co.header), 'Bước 3: không đặt được đơn lần 2').toBe(false);
      await evidence.shot('Bước 3: Finish lần 2', { highlight: co.header, note: 'Mong đợi: không hiện "Thank you for your order!" lần nữa' });
    } else note('Bước 3', 'không còn nút Finish để bấm: đúng');
  });

  test('TC-031 Back Home về danh sách với giỏ trống', { tag: ['@AC-6', '@complete'] }, async ({ page, loggedInPage: _inv, completePage: co, evidence }) => {
    await placeOrder(page, carts.backpackOnesie);
    await co.backHome();
    const inv = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Add to cart', exact: true })).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Remove', exact: true })).toHaveCount(0);
    await expect(inv.cartBadge).toBeHidden();
    await evidence.shot('Sau khi bấm Back Home', { highlight: [inv.inventoryList, inv.cartLink], note: '6 nút Add to cart, không có số giỏ' });
  });

  // Anonymous describe only to set the browser time zone (no title: the evidence group stays "Màn hình 3").
  // A non-UTC zone makes "receipt printed in UTC instead of local time" visible even when CI runs in UTC (review-executor B1).
  test.describe(() => {
    test.use({ timezoneId: RECEIPT_TZ });

    test('TC-034 Generate PDF order: tải file, nội dung khớp đơn vừa đặt', { tag: ['@AC-5', '@complete'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
      const downloads: string[] = [];
      page.on('download', (d) => downloads.push(d.suggestedFilename()));
      for (const p of [onesie, fleeceJacket, bikeLight]) await inv.addButton(p).click();
      await inv.removeButton(onesie).click();
      await inv.addButton(onesie).click();
      await inv.openCart();
      await cart.checkout();
      await ip.submit(info.a);
      const finishedAt = Date.now();
      await ov.finish();
      const pdf = await receipt(co, evidence.dir);
      // Order Date = local date / time of the browser (RECEIPT_TZ) when Finish was clicked, ±1 minute
      const orderDate = pdf.texts[pdf.texts.indexOf('Order Date') + 1] ?? '(không có)';
      const accepted = [-60_000, 0, 60_000].map((d) => receiptDate(finishedAt + d, RECEIPT_TZ));
      expect.soft(accepted, `Order Date "${orderDate}" = giờ ${RECEIPT_TZ} lúc bấm Finish (±1 phút)`).toContain(orderDate);
      // File name time: observation only, NOT asserted (local time or UTC is pending a PO decision, Q14)
      note('Tên file', `giờ ${pdf.name.match(/_(\d{2}-\d{2}-\d{2})\.pdf$/)?.[1] ?? '?'} (UTC); Order Date trong file: ${orderDate} (${RECEIPT_TZ})`);
      expect.soft(pdf.name, 'tên file swag-labs-order-YYYY-MM-DD_HH-mm-ss.pdf').toMatch(M.pdfFileName);
      expect.soft(pdf.size, 'kích thước > 0').toBeGreaterThan(0);
      const want = [...receiptTexts(carts.addOrder, info.a), M.pdfThanks];
      expect.soft(inOrder(pdf.texts, want), 'chữ trong PDF theo đúng thứ tự').toEqual(want);
      expect.soft(productLines(pdf.texts), 'dòng sản phẩm đúng bằng giỏ: 3 sản phẩm, không thừa, không trùng').toEqual(receiptLines(carts.addOrder));
      // "Đúng 1 file": wait up to 5 s for a WRONG second download (known-issues note 6), none must arrive (review B1)
      const second = await page.waitForEvent('download', { timeout: NEG }).then(() => true, () => false);
      expect.soft(second, 'không có file thứ 2').toBe(false);
      expect.soft(downloads, 'đúng 1 file').toHaveLength(1);
      note('PDF', pdf.texts.join(' | '));
      await evidence.shot('Sau khi bấm Generate PDF order', { highlight: co.generatePdfButton, note: `Đã tải ${pdf.name} (nội dung kiểm trong code, file lưu cạnh ảnh)` });
    });
  });

  test('TC-035 Biên nhận PDF mở bằng trình đọc PDF: bố cục, chữ đọc được', { tag: ['@AC-5', '@complete'] }, async ({ page, loggedInPage: _inv, completePage: co, evidence }) => {
    // semi-auto (M1): steps 1–2 automated here; step 3 (open the file in a PDF reader, check layout / readability) is MANUAL,
    // done by the executor in its manual phase with the file saved in the evidence folder (npm run test:evidence).
    note('manual', 'Bước 3 làm tay: mở file PDF (evidence/all-cases/TC-035/ hoặc file đính kèm báo cáo) bằng trình đọc PDF, chụp ảnh trang; kiểm bố cục, chữ không chồng / không cắt, Item total / Tax / Total thẳng cột giá');
    await placeOrder(page, carts.backpackOnesie);
    const pdf = await receipt(co, evidence.dir);
    // Basic automated text check only (the human-eyes part stays manual)
    expect(pdf.name).toMatch(M.pdfFileName);
    expect(pdf.size).toBeGreaterThan(0);
    const want = [...receiptTexts(carts.backpackOnesie, info.a), M.pdfThanks];
    expect.soft(inOrder(pdf.texts, want), 'chữ trong PDF (kiểm cơ bản)').toEqual(want);
    expect.soft(productLines(pdf.texts), 'dòng sản phẩm đúng bằng giỏ: Backpack, Onesie').toEqual(receiptLines(carts.backpackOnesie));
    await evidence.shot('Đã tải biên nhận PDF', { highlight: co.generatePdfButton, note: `File ${pdf.name} lưu cạnh ảnh: mở bằng trình đọc PDF để kiểm bố cục (làm tay)` });
  });

  test('TC-036 Hoàn tất: tải lại, Reset App State, All Items, Back / Forward sau Back Home', { tag: ['@AC-5', '@AC-6', '@complete'] }, async ({ page, completePage: co, evidence }) => {
    test.setTimeout(60_000);
    const inv = new InventoryPage(page);
    // Biến thể 1: tải lại (Q6: nút PDF mất sau tải lại là IMP-10, không kiểm)
    await freshLogin(page);
    await placeOrder(page, carts.backpackOnesie);
    await page.reload();
    await expect.soft(co.header, 'Biến thể 1: "Thank you for your order!"').toHaveText(M.completeHeader, QUICK);
    await expect.soft(co.title, 'Biến thể 1: tiêu đề').toHaveText(M.titleComplete, QUICK);
    await expect.soft(co.cartBadge, 'Biến thể 1: không có số giỏ').toBeHidden(QUICK);
    await evidence.shot('Biến thể 1: tải lại', { highlight: [co.title, co.header], note: 'Vẫn trang Hoàn tất, không có số giỏ' });
    // Biến thể 2: Reset App State
    await freshLogin(page);
    await placeOrder(page, carts.backpackOnesie);
    await co.resetAppState();
    await co.closeMenu();
    await expect.soft(co.cartBadge, 'Biến thể 2: không có số giỏ').toBeHidden(QUICK);
    expect.soft(await cartStorage(page), 'Biến thể 2: không có khóa cart-contents').toBeNull();
    await evidence.shot('Biến thể 2: Reset App State', { highlight: co.cartLink, note: 'Không có số giỏ, không có khóa cart-contents (kiểm trong code)' });
    // Biến thể 3: All Items
    await freshLogin(page);
    await placeOrder(page, carts.backpackOnesie);
    await co.openMenuItem(co.allItemsLink);
    await expect(inv.inventoryList).toBeVisible();
    await expectEmptyList(page, 'Biến thể 3');
    await evidence.shot('Biến thể 3: All Items', { highlight: [inv.inventoryList, inv.cartLink], note: '6 Add to cart, không có số giỏ' });
    // Biến thể 4: Back Home, Back, Forward
    await freshLogin(page);
    await placeOrder(page, carts.backpackOnesie);
    await co.backHome();
    await page.goBack();
    await expect.soft(co.header, 'Biến thể 4: Back về Hoàn tất').toHaveText(M.completeHeader, QUICK);
    await page.goForward();
    await expect(inv.inventoryList).toBeVisible();
    await expectEmptyList(page, 'Biến thể 4');
    await evidence.shot('Biến thể 4: Forward', { highlight: [inv.inventoryList, inv.cartLink], note: 'Về danh sách, 6 Add to cart, không có số giỏ' });
  });

  test('TC-041 Mở thẳng Hoàn tất khi chưa Finish không báo đặt hàng thành công', { tag: ['@AC-5', '@complete', '@BUG-27'] }, async ({ page, loggedInPage: inv, completePage: co, evidence }) => {
    test.fail(true, 'BUG-27: mở thẳng /checkout-complete.html khi chưa đặt vẫn hiện "Thank you for your order!"');
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await co.goto();
    expect.soft(await appears(co.header), 'không hiện "Thank you for your order!"').toBe(false);
    await expect.soft(page.getByText(M.completeText), 'không có đoạn dispatched').toHaveCount(0, QUICK);
    await evidence.shot('Mở thẳng /checkout-complete.html', { highlight: [co.header, co.text, co.cartLink], note: 'Mong đợi: không báo đặt hàng thành công, giỏ vẫn 2' });
    await expect.soft(co.cartBadge, 'số giỏ vẫn 2').toHaveText('2', QUICK);
    expect.soft(await cartStorage(page), 'cart-contents vẫn [4,2]').toBe('[4,2]');
  });
});

// =====================================================================
test.describe('Chung: nhiều màn hình (luồng chính, kiểm soát truy cập, tài khoản, nhiều tab)', () => {
  test('TC-008 Luồng chính: Giỏ → Thông tin → Tổng quan → Hoàn tất → danh sách', { tag: ['@AC-1', '@AC-3', '@AC-4', '@AC-5', '@AC-6', '@info', '@overview', '@complete', '@smoke'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await expect(ip.title).toHaveText(M.titleInfo);
    await ip.submit(info.a);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(ov.title).toHaveText(M.titleOverview);
    await expectOverviewLines(ov, carts.backpackOnesie, 'Bước 4');
    await expect(ov.items).toHaveCount(2);
    await expectTotalsText(ov, expectedTotals(carts.backpackOnesie), 'Bước 4');
    await evidence.shot('Bước 4: Tổng quan', { highlight: [ov.items, ov.subtotal, ov.tax, ov.total], note: 'Backpack $29.99, Onesie $7.99; $37.98 / $3.04 / $41.02' });
    await ov.finish();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(co.title).toHaveText(M.titleComplete);
    await expect(co.header).toHaveText(M.completeHeader);
    await expect(co.cartBadge).toBeHidden();
    await evidence.shot('Bước 5: Hoàn tất', { highlight: co.header, note: '"Thank you for your order!", không còn số giỏ' });
    await co.backHome();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByRole('button', { name: 'Add to cart', exact: true })).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Remove', exact: true })).toHaveCount(0);
    await expect(inv.cartBadge).toBeHidden();
  });

  test('TC-023 Back, Forward, tải lại ở Tổng quan', { tag: ['@AC-4', '@info', '@overview'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.submit(info.a);
    // Bước 1: Back
    await page.goBack();
    await expect(ip.firstName).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(ip.title).toHaveText(M.titleInfo);
    for (const field of Object.values(ip.fields)) await expect(field).toHaveValue('');
    // Bước 2: Forward
    await page.goForward();
    await expect(ov.finishButton).toBeVisible();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(ov.title).toHaveText(M.titleOverview);
    await expect(ov.itemNames).toHaveText([backpack.name, onesie.name]);
    // Bước 3: reload (server 404 but page renders, O-15)
    await page.reload();
    await expect(ov.finishButton).toBeVisible();
    await expect(ov.title).toHaveText(M.titleOverview);
    await expect(ov.itemNames).toHaveText([backpack.name, onesie.name]);
    await expectTotalsText(ov, expectedTotals(carts.backpackOnesie), 'Bước 3');
    await expect(ov.cartBadge).toHaveText('2');
    await evidence.shot('Bước 3: sau khi tải lại', { highlight: [ov.items, ov.total, ov.cartBadge], note: '2 dòng, $37.98 / $3.04 / $41.02, số giỏ 2' });
  });

  test('TC-027 Reset App State ở Thông tin và Tổng quan cập nhật ngay', { tag: ['@AC-4', '@AC-5', '@info', '@overview', '@BUG-05'] }, async ({ page, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    test.fail(true, 'BUG-05 (biến thể ở Tổng quan): Reset App State không cập nhật trang Tổng quan');
    // Thông tin
    let inv = await freshLogin(page);
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.resetAppState();
    await ip.closeMenu();
    await expect.soft(ip.cartBadge, 'Thông tin (dự kiến đúng): không còn số giỏ').toBeHidden({ timeout: NEG });
    await evidence.shot('Thông tin sau Reset', { highlight: ip.cartLink, note: 'Không còn số giỏ' });
    // Tổng quan
    inv = await freshLogin(page);
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.submit(info.a);
    await ov.resetAppState();
    await ov.closeMenu();
    await expect.soft(ov.cartBadge, 'Tổng quan (BUG-05): không còn số giỏ').toBeHidden({ timeout: NEG });
    await expect.soft(ov.items, 'Tổng quan (BUG-05): không còn dòng sản phẩm').toHaveCount(0, { timeout: NEG });
    expect.soft(await cartStorage(page), 'Tổng quan (BUG-05): không còn khóa cart-contents').toBeNull();
    await evidence.shot('Tổng quan sau Reset', { highlight: [ov.items, ov.total, ov.cartLink], note: 'Mong đợi: không còn sản phẩm, không còn số giỏ' });
  });

  test('TC-037 Chưa đăng nhập mở thẳng 3 trang thanh toán bị chặn', { tag: ['@AC-7', '@info', '@overview', '@complete', '@smoke', '@security'] }, async ({ page, evidence }) => {
    test.setTimeout(60_000);
    const loginPage = new LoginPage(page);
    const paths = [protectedPages.checkout, protectedPages.checkoutOverview, protectedPages.checkoutComplete];
    for (const withCart of [false, true]) {
      for (const [i, path] of paths.entries()) {
        const name = `Biến thể ${i + 1 + (withCart ? 3 : 0)} (${path}${withCart ? ', có cart-contents [4]' : ''})`;
        await page.context().clearCookies();
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        if (withCart) await setCart(page, carts.backpack);
        await page.goto(path);
        await expect.soft(loginPage.loginButton, `${name}: thấy nút Login`).toBeVisible(QUICK);
        await expect.soft(page, `${name}: về /`).toHaveURL(isLoginScreen, QUICK);
        await expect.soft(loginPage.errorMessage, `${name}: thông báo`).toHaveText(MSG.notLoggedIn(path), QUICK);
        await expect.soft(page.getByTestId('title'), `${name}: không thấy tiêu đề trang thanh toán`).toHaveCount(0, QUICK);
        await expect.soft(page.getByTestId('finish'), `${name}: không có nút Finish`).toHaveCount(0, QUICK);
        await expect.soft(page.getByText(M.completeHeader), `${name}: không có "Thank you"`).toHaveCount(0, QUICK);
        await evidence.shot(name, { highlight: loginPage.errorMessage, note: `Trang đăng nhập, "...'${path}' when you are logged in."` });
      }
    }
  });

  test('TC-038 Phiên giả mạo (cookie tự tạo) không vào được trang thanh toán, không đặt được hàng', { tag: ['@AC-7', '@info', '@overview', '@complete', '@security', '@BUG-02'] }, async ({ page, context, baseURL, completePage: co, evidence }) => {
    test.fail(true, 'BUG-02 (biến thể ở 3 trang thanh toán): cookie tự tạo vào được trang thanh toán và đặt được hàng');
    test.setTimeout(120_000);
    const loginPage = new LoginPage(page);
    const fake = async (username: string) => {
      await context.clearCookies();
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await context.addCookies([{ name: 'session-username', value: username, url: baseURL! }]);
      await page.goto('/');
      await setCart(page, carts.backpack);
    };
    const expectBlocked = async (name: string, path: string) => {
      await expect.soft(loginPage.loginButton, `${name}: về trang đăng nhập`).toBeVisible(QUICK);
      await expect.soft(page, `${name}: URL /`).toHaveURL(isLoginScreen, QUICK);
      await expect.soft(loginPage.errorMessage, `${name}: thông báo`).toHaveText(MSG.notLoggedIn(path), QUICK);
      await expect.soft(page.getByTestId('title'), `${name}: không thấy nội dung trang thanh toán`).toHaveCount(0, QUICK);
      await evidence.shot(name, { highlight: [loginPage.errorMessage, page.getByTestId('title')], note: `Mong đợi: bị đưa về trang đăng nhập, "...'${path}'..."` });
    };
    // Biến thể 1–3: standard_user, 3 trang
    for (const [i, path] of [protectedPages.checkout, protectedPages.checkoutOverview, protectedPages.checkoutComplete].entries()) {
      await fake(users.standard.username);
      await page.goto(path);
      await expectBlocked(`Biến thể ${i + 1} (standard_user, ${path})`, path);
    }
    // Biến thể 4: Tổng quan rồi Finish
    await fake(users.standard.username);
    await page.goto(protectedPages.checkoutOverview);
    const finish = page.getByTestId('finish');
    if (await appears(finish)) {
      await finish.click();
      expect.soft(await appears(co.header), 'Biến thể 4: không đặt được hàng bằng cookie giả').toBe(false);
    }
    await expectBlocked('Biến thể 4 (standard_user, Finish)', protectedPages.checkoutOverview);
    // Biến thể 5–8: các tên khác, Thông tin
    for (const [i, user] of [users.problem, users.error, users.visual, users.performanceGlitch].entries()) {
      await fake(user.username);
      await page.goto(protectedPages.checkout);
      await expectBlocked(`Biến thể ${i + 5} (${user.username}, ${protectedPages.checkout})`, protectedPages.checkout);
    }
  });

  test('TC-039 Đăng xuất ở Thông tin, Tổng quan, Hoàn tất rồi Back không xem lại được', { tag: ['@AC-7', '@info', '@overview', '@complete', '@security'] }, async ({ page, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    test.setTimeout(60_000);
    const loginPage = new LoginPage(page);
    for (const [i, path] of [protectedPages.checkout, protectedPages.checkoutOverview, protectedPages.checkoutComplete].entries()) {
      const name = `Biến thể ${i + 1} (${path})`;
      const inv = await freshLogin(page);
      await inv.addButton(backpack).click();
      await inv.openCart();
      await cart.checkout();
      if (i >= 1) await ip.submit(info.a);
      if (i === 2) await ov.finish();
      await ip.logout(); // waits for the Login button before Back (lesson L2)
      await page.goBack();
      await expect.soft(page, `${name}: vẫn ở /`).toHaveURL(isLoginScreen, QUICK);
      await expect.soft(loginPage.loginButton, `${name}: nút Login`).toBeVisible(QUICK);
      await expect.soft(loginPage.errorMessage, `${name}: thông báo`).toHaveText(MSG.notLoggedIn(path), QUICK);
      await expect.soft(page.getByTestId('title'), `${name}: không thấy nội dung trang thanh toán`).toHaveCount(0, QUICK);
      await evidence.shot(name, { highlight: loginPage.errorMessage, note: `Back sau khi đăng xuất: trang đăng nhập, "...'${path}'..."` });
    }
  });

  test('TC-043 Tài khoản đăng nhập sau không đặt hàng bằng giỏ của tài khoản trước (2 chiều)', { tag: ['@AC-5', '@info', '@overview', '@complete', '@security', '@BUG-07'] }, async ({ page, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    test.fail(true, 'BUG-07 (biến thể ở thanh toán): người sau đặt hàng bằng giỏ của người trước và làm trống giỏ đó');
    test.setTimeout(90_000);
    const variant = async (name: string, first: User, second: User, p: Product, secondInfo: CheckoutInfo) => {
      const inv = await freshLogin(page, first);
      await inv.addButton(p).click();
      if (first === users.standard) {
        await inv.openCart();
        await cart.checkout();
        await ip.submit(info.a);
      }
      await inv.logout();
      const inv2 = await login(page, second);
      await expect.soft(inv2.cartBadge, `${name}: ${second.username} không có số giỏ`).toBeHidden(QUICK);
      await inv2.openCart();
      await expect.soft(cart.items, `${name}: giỏ của ${second.username} 0 dòng`).toHaveCount(0, QUICK);
      await evidence.shot(`${name}: giỏ của ${second.username}`, { highlight: [cart.cartList, cart.cartLink], note: `Mong đợi: giỏ trống, không có ${p.name} của ${first.username}` });
      if (await cart.items.count()) {
        await cart.checkout();
        await ip.submit(secondInfo);
        await ov.finish();
      }
      await cart.logout();
      const inv3 = await login(page, first);
      await expect.soft(inv3.cartBadge, `${name}: ${first.username} đăng nhập lại số giỏ 1`).toHaveText('1', QUICK);
      await inv3.openCart();
      await expect.soft(cart.itemNames, `${name}: giỏ của ${first.username} còn ${p.name}`).toHaveText([p.name], QUICK);
      await evidence.shot(`${name}: ${first.username} đăng nhập lại`, { highlight: [cart.cartList, cart.cartLink], note: `Mong đợi: số giỏ 1, còn ${p.name}` });
    };
    await variant('Biến thể 1', users.standard, users.visual, backpack, info.b);
    await variant('Biến thể 2', users.visual, users.standard, onesie, info.a);
  });

  test('TC-044 visual_user: bố cục 3 trang thanh toán giống standard_user', { tag: ['@AC-1', '@AC-4', '@AC-5', '@info', '@overview', '@complete', '@BUG-16'] }, async ({ page, loginAs, otherSession, evidence }) => {
    test.fail(true, 'BUG-16 (biến thể ở 3 trang thanh toán): visual_user lệch / xoay biểu tượng giỏ, menu');
    test.setTimeout(90_000);
    await loginAs(users.visual);
    const base = await otherSession(users.standard);
    for (const p of [page, base]) await toInfo(p, carts.backpack);
    const pages = [
      ['Thông tin', async (p: Page) => { const ip = new CheckoutInfoPage(p); return [ip.firstName, ip.lastName, ip.postalCode, ip.cancelButton, ip.continueButton]; }, null],
      ['Tổng quan', async (p: Page) => { const ov = new CheckoutOverviewPage(p); return [ov.line(backpack), ov.subtotal, ov.tax, ov.total, ov.cancelButton, ov.finishButton]; },
        async (p: Page) => { await new CheckoutInfoPage(p).submit(info.a); }],
      ['Hoàn tất', async (p: Page) => { const co = new CheckoutCompletePage(p); return [co.header, co.text, co.backHomeButton, co.generatePdfButton]; },
        async (p: Page) => { await new CheckoutOverviewPage(p).finish(); }],
    ] as const;
    for (const [where, elements, go] of pages) {
      if (go) for (const p of [page, base]) await go(p);
      await ready(page);
      await ready(base);
      const app = new InventoryPage(page);
      await evidence.shot(`${where} (visual_user)`, { highlight: [app.cartIcon, app.menuIcon], note: 'Mong đợi: biểu tượng giỏ, menu như standard_user, không xoay, không lệch' });
      await expectHeaderLike(page, base, where);
      const [mine, ref] = [await elements(page), await elements(base)];
      for (const [i, l] of mine.entries()) await expectSamePlace(l, ref[i], `${where}: ${String(l)}`);
    }
  });

  test('TC-045 visual_user: cả luồng thanh toán đúng như standard_user (mọi trường AC)', { tag: ['@AC-1', '@AC-2', '@AC-3', '@AC-4', '@AC-5', '@AC-6', '@info', '@overview', '@complete'] }, async ({ page, loginAs, evidence }) => {
    test.setTimeout(90_000);
    await fullFlowLikeStandard(page, await loginAs(users.visual), evidence, 'visual_user');
  });

  test('TC-046 performance_glitch_user: cả luồng thanh toán thành công, ghi lại thời gian về danh sách', { tag: ['@AC-1', '@AC-2', '@AC-3', '@AC-4', '@AC-5', '@AC-6', '@info', '@overview', '@complete'] }, async ({ page, loginAs, evidence }) => {
    // BUG-03 variant is RECORDED only (Q11): this test must PASS, no test.fail(), no @BUG tag. Steps back to the list wait ≤ 10 s.
    test.setTimeout(120_000);
    await fullFlowLikeStandard(page, await loginAs(users.performanceGlitch), evidence, 'performance_glitch_user', SLOW);
  });

  test('TC-047 problem_user: các thao tác không lỗi vẫn đúng như standard_user', { tag: ['@AC-1', '@AC-2', '@AC-3', '@AC-4', '@AC-5', '@info', '@overview', '@complete'] }, async ({ page, loginAs, otherSession, cartPage: cart, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await loginAs(users.problem);
    const base = await otherSession(users.standard);
    await ready(base);
    // Bước 1
    await toInfo(page, carts.backpack);
    await expectInfoPage(page, ip, 'Bước 1');
    await ready(page);
    await expectHeaderLike(page, base, 'Bước 7 (Thông tin)');
    // Bước 2
    await ip.continueButton.click();
    await expect.soft(ip.error, 'Bước 2').toHaveText(M.firstNameRequired, QUICK);
    // Bước 3
    await ip.cancel();
    await expect.soft(page, 'Bước 3: URL').toHaveURL(/\/cart\.html$/, QUICK);
    await expect.soft(cart.itemNames, 'Bước 3: 1 dòng Backpack').toHaveText([backpack.name], QUICK);
    await expect.soft(cart.cartBadge, 'Bước 3: số giỏ 1').toHaveText('1', QUICK);
    // Bước 4 (by URL: BUG-28 blocks the Information page; guard BUG-26 = named assertion, decision 3c)
    await setCart(page, carts.mixed);
    await ov.goto();
    const guarded = await appears(ov.finishButton);
    expect.soft(guarded, GUARD).toBe(true);
    if (guarded) {
      await expectOverviewLines(ov, carts.mixed, 'Bước 4');
      await expectPaymentShipping(ov, 'Bước 4');
      await ready(page);
      await expectHeaderLike(page, base, 'Bước 7 (Tổng quan)');
      await evidence.shot('Bước 4: Tổng quan', { highlight: ov.items, note: '3 dòng Backpack, Bike Light, Onesie đúng TD-06 (số tiền là BUG-29, TC-026)' });
      // Bước 5
      await ov.cancel();
      await expect.soft(new InventoryPage(page).cartBadge, 'Bước 5: số giỏ 3').toHaveText('3', QUICK);
      // Bước 6
      await ov.goto();
      if (await appears(ov.finishButton)) {
        await ov.finish();
        await expectCompletePage(page, co, 'Bước 6', false); // cart after Finish = BUG-30, owned by TC-032
        await ready(page);
        await expectHeaderLike(page, base, 'Bước 7 (Hoàn tất)');
        await evidence.shot('Bước 6: Hoàn tất', { highlight: [co.header, co.text], note: 'Hoàn tất đúng như standard_user (giỏ sau Finish là BUG-30, TC-032)' });
      } else expect.soft(false, `Bước 6: ${GUARD}`).toBe(true);
    }
    // Bước 8
    expect.soft(errors.pageErrors, 'Bước 8: 0 pageerror').toEqual([]);
    expect.soft(errors.reports, 'Bước 8: 0 request tới submit.backtrace.io').toEqual([]);
  });

  test('TC-048 error_user: các thao tác không lỗi vẫn đúng như standard_user', { tag: ['@AC-1', '@AC-2', '@AC-3', '@AC-4', '@AC-5', '@info', '@overview'] }, async ({ page, loginAs, otherSession, cartPage: cart, infoPage: ip, overviewPage: ov, productDetailPage: detail, evidence }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await loginAs(users.error);
    const base = await otherSession(users.standard);
    await ready(base);
    // Bước 1
    errors.step = 'Bước 1-3 (Thông tin)';
    await toInfo(page, carts.mixed);
    await expectInfoPage(page, ip, 'Bước 1');
    await ready(page);
    await expectHeaderLike(page, base, 'Bước 7 (Thông tin)');
    // Bước 2 (Last Name never touched: BUG-31 / BUG-32 are TC-014 / TC-015)
    await ip.continueButton.click();
    await expect.soft(ip.error, 'Bước 2: thông báo').toHaveText(M.firstNameRequired, QUICK);
    await ip.fill({ first: info.a.first, last: '', zip: info.a.zip });
    await expect.soft(ip.firstName, 'Bước 2: First Name').toHaveValue(info.a.first, QUICK);
    await expect.soft(ip.postalCode, 'Bước 2: Zip').toHaveValue(info.a.zip, QUICK);
    // Bước 3
    await ip.cancel();
    await expect.soft(page, 'Bước 3: URL').toHaveURL(/\/cart\.html$/, QUICK);
    await expect.soft(cart.items, 'Bước 3: 3 dòng').toHaveCount(3, QUICK);
    await expect.soft(cart.cartBadge, 'Bước 3: số giỏ 3').toHaveText('3', QUICK);
    // Bước 4 (by URL + guard BUG-26, decision 3c)
    errors.step = 'Bước 4 (Tổng quan)';
    await ov.goto();
    let guarded = await appears(ov.finishButton);
    expect.soft(guarded, GUARD).toBe(true);
    if (guarded) {
      await expectOverviewLines(ov, carts.mixed, 'Bước 4');
      await expectPaymentShipping(ov, 'Bước 4');
      await expectTotalsText(ov, expectedTotals(carts.mixed), 'Bước 4');
      await ready(page);
      await expectHeaderLike(page, base, 'Bước 7 (Tổng quan)');
      await evidence.shot('Bước 4: Tổng quan', { highlight: [ov.items, ov.subtotal, ov.tax, ov.total], note: '3 dòng đúng TD-06, $47.97 / $3.84 / $51.81' });
      // Bước 5
      for (const p of [backpack, bikeLight, onesie]) {
        errors.step = `Bước 5 (chi tiết ${p.name})`;
        await ov.openProduct(p);
        await expect.soft(page, `Bước 5: ${p.name} ?id=${p.id}`).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${p.id}$`), QUICK);
        await expect.soft(detail.name, `Bước 5: tên ${p.name}`).toHaveText(p.name, QUICK);
        // Checkout label set only now, after the detail page has rendered and been checked; anything still fired
        // while the detail URL is shown is filed as detail page anyway (watchErrors reads the path at event time).
        errors.step = 'Bước 5 (mở lại Tổng quan)';
        await ov.goto();
        guarded = await appears(ov.finishButton);
        expect.soft(guarded, `Bước 5: ${GUARD}`).toBe(true);
        if (!guarded) break;
      }
      // Bước 6
      if (guarded) {
        errors.step = 'Bước 6 (Cancel)';
        await ov.cancel();
        await expect.soft(page, 'Bước 6: URL').toHaveURL(/\/inventory\.html$/, QUICK);
        await expect.soft(new InventoryPage(page).cartBadge, 'Bước 6: số giỏ 3').toHaveText('3', QUICK);
      }
    }
    // Bước 8: only errors raised on the CHECKOUT pages count (review A1). The product detail page of error_user is SD-102 BUG-21
    // (render error + 1 report per detail page, caught by SD-102 TC-046): recorded as an annotation, not asserted, no test.fail().
    const detailErrors = [...errors.pageErrors, ...errors.reports].filter(onDetailPage);
    if (detailErrors.length) note('BUG-21 (SD-102, tham khảo)', `${detailErrors.length} lỗi / báo lỗi khi ở trang chi tiết (bước 5): ${detailErrors.join(' | ')}`);
    expect.soft(errors.pageErrors.filter((e) => !onDetailPage(e)), 'Bước 8: 0 pageerror ở trang thanh toán').toEqual([]);
    expect.soft(errors.reports.filter((e) => !onDetailPage(e)), 'Bước 8: 0 request tới submit.backtrace.io ở trang thanh toán').toEqual([]);
  });

  test('TC-049 Không lỗi JavaScript, không gửi báo lỗi khi đi luồng thanh toán (mọi tài khoản)', { tag: ['@AC-1', '@AC-4', '@AC-5', '@info', '@overview', '@complete'] }, async ({ page, cartPage: cart, overviewPage: ov, completePage: co, evidence }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    const check = (name: string) => {
      expect.soft(errors.pageErrors, `${name}: 0 pageerror`).toEqual([]);
      expect.soft(errors.reports, `${name}: 0 request tới submit.backtrace.io`).toEqual([]);
    };
    // Biến thể 1–3
    for (const [i, user] of [users.standard, users.visual, users.performanceGlitch].entries()) {
      const name = `Biến thể ${i + 1} (${user.username})`;
      errors.reset();
      await freshLogin(page, user);
      await placeOrder(page, carts.backpackOnesie);
      await co.backHome(SLOW);
      check(name);
      await evidence.shot(name, { highlight: new InventoryPage(page).inventoryList, note: 'Đi hết luồng, 0 lỗi JavaScript, 0 báo lỗi (kiểm trong code)' });
    }
    // Biến thể 4: problem_user
    errors.reset();
    await freshLogin(page, users.problem);
    await setCart(page, carts.backpackOnesie);
    await cart.goto();
    await cart.checkout();
    await ov.goto();
    const guarded = await appears(ov.finishButton);
    expect.soft(guarded, `Biến thể 4: ${GUARD}`).toBe(true);
    if (guarded) {
      await ov.finish();
      check('Biến thể 4 (problem_user)');
      await evidence.shot('Biến thể 4 (problem_user)', { highlight: co.header, note: 'Finish xong, 0 lỗi JavaScript, 0 báo lỗi (kiểm trong code)' });
    }
    // Biến thể 5: error_user, mở thẳng 3 trang (không gõ Last Name, không bấm Finish)
    errors.reset();
    await freshLogin(page, users.error);
    await setCart(page, carts.backpackOnesie);
    for (const path of [protectedPages.checkout, protectedPages.checkoutOverview, protectedPages.checkoutComplete]) {
      await page.goto(path);
      await expect(page.getByTestId('primary-header')).toBeVisible();
      await expect(page.getByTestId('title')).toBeVisible();
    }
    check('Biến thể 5 (error_user)');
    await evidence.shot('Biến thể 5 (error_user)', { highlight: page.getByTestId('title'), note: 'Đã mở thẳng 3 trang thanh toán, 0 lỗi JavaScript, 0 báo lỗi (kiểm trong code)' });
  });

  test('TC-050 Rời luồng thanh toán bằng All Items và biểu tượng giỏ, giỏ giữ nguyên', { tag: ['@AC-3', '@AC-5', '@info', '@overview'] }, async ({ page, cartPage: cart, infoPage: ip, overviewPage: ov, evidence }) => {
    test.setTimeout(60_000);
    const variants = [
      ['Biến thể 1 (Thông tin → All Items)', false, 'menu'],
      ['Biến thể 2 (Tổng quan → All Items)', true, 'menu'],
      ['Biến thể 3 (Thông tin → biểu tượng giỏ)', false, 'cart'],
      ['Biến thể 4 (Tổng quan → biểu tượng giỏ)', true, 'cart'],
    ] as const;
    for (const [name, overview, how] of variants) {
      const inv = await freshLogin(page);
      await inv.addButton(backpack).click();
      await inv.addButton(onesie).click();
      await inv.openCart();
      await cart.checkout();
      if (overview) await ip.submit(info.a);
      const app = overview ? ov : ip;
      if (how === 'menu') {
        await app.openMenuItem(app.allItemsLink);
        await expect(inv.inventoryList).toBeVisible();
        await expect.soft(page, `${name}: URL`).toHaveURL(/\/inventory\.html$/, QUICK);
        await expect.soft(inv.cartBadge, `${name}: số giỏ 2`).toHaveText('2', QUICK);
        await expect.soft(inv.removeButton(backpack), `${name}: Backpack là Remove`).toBeVisible(QUICK);
        await expect.soft(inv.removeButton(onesie), `${name}: Onesie là Remove`).toBeVisible(QUICK);
        await evidence.shot(name, { highlight: [inv.cartButton(backpack), inv.cartButton(onesie), inv.cartBadge], note: 'Danh sách, số giỏ 2, Backpack / Onesie là Remove' });
      } else {
        await app.openCart();
        await expect.soft(page, `${name}: URL`).toHaveURL(/\/cart\.html$/, QUICK);
        await expect.soft(cart.itemNames, `${name}: 2 dòng`).toHaveText([backpack.name, onesie.name], QUICK);
        await expect.soft(cart.cartBadge, `${name}: số giỏ 2`).toHaveText('2', QUICK);
        await evidence.shot(name, { highlight: [cart.cartList, cart.cartBadge], note: 'Trang giỏ, 2 dòng, số giỏ 2' });
      }
    }
  });

  test('TC-052 Bấm đúp Continue / Finish chỉ chuyển trang một lần, Back một lần về trang trước', { tag: ['@AC-3', '@AC-5', '@info', '@overview', '@complete', '@BUG-36'] }, async ({ page, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    test.fail(true, 'BUG-36: bấm đúp Continue / Finish chạy 2 lần, history.length tăng 2, Back lần 1 vẫn ở cùng trang');
    test.setTimeout(60_000);
    const errors = watchErrors(page);
    const historyLength = () => page.evaluate(() => history.length);
    // Biến thể 1 (Continue)
    await freshLogin(page);
    await toInfo(page, carts.backpackOnesie);
    await ip.fill(info.a);
    let before = await historyLength();
    await ip.continueButton.dblclick();
    await expect(ov.finishButton).toBeVisible();
    expect.soft(await historyLength() - before, 'Biến thể 1 (BUG-36): history.length tăng đúng 1').toBe(1);
    await expect.soft(ov.title, 'Biến thể 1 dương tính (dự kiến đúng): tiêu đề').toHaveText(M.titleOverview, QUICK);
    await expect.soft(ov.itemNames, 'Biến thể 1 dương tính (dự kiến đúng): 2 dòng không trùng').toHaveText([backpack.name, onesie.name], QUICK);
    await expect.soft(ov.total, 'Biến thể 1 dương tính (dự kiến đúng): Total').toHaveText('Total: $41.02', QUICK);
    await page.goBack();
    await expect.soft(ip.firstName, 'Biến thể 1 (BUG-36): 1 lần Back về trang Thông tin').toBeVisible({ timeout: NEG });
    await evidence.shot('Biến thể 1: bấm đúp Continue rồi Back 1 lần', { highlight: [ip.title], note: 'Mong đợi: về trang Thông tin sau 1 lần Back' });
    // Biến thể 2 (Finish)
    await freshLogin(page);
    await toOverview(page, carts.backpackOnesie);
    before = await historyLength();
    await ov.finishButton.dblclick();
    await expect(co.header).toBeVisible();
    expect.soft(await historyLength() - before, 'Biến thể 2 (BUG-36): history.length tăng đúng 1').toBe(1);
    await expect.soft(co.title, 'Biến thể 2 dương tính (dự kiến đúng): tiêu đề').toHaveText(M.titleComplete, QUICK);
    await expect.soft(co.header, 'Biến thể 2 dương tính (dự kiến đúng): Thank you').toHaveText(M.completeHeader, QUICK);
    await expect.soft(co.cartBadge, 'Biến thể 2 dương tính (dự kiến đúng): không còn số giỏ').toBeHidden(QUICK);
    expect.soft(await cartStorage(page), 'Biến thể 2 dương tính (dự kiến đúng): không có cart-contents').toBeNull();
    const pdf = await receipt(co);
    const want = [backpack.name, '29.99', onesie.name, '7.99', 'Total', '41.02'];
    expect.soft(inOrder(pdf.texts, want), 'Biến thể 2 dương tính (dự kiến đúng): PDF 2 sản phẩm, Total 41.02').toEqual(want);
    expect.soft(pdf.texts.filter((t) => t === backpack.name), 'Biến thể 2 dương tính (dự kiến đúng): PDF không trùng dòng').toHaveLength(1);
    await page.goBack();
    await expect.soft(co.header, 'Biến thể 2 (BUG-36): 1 lần Back đã rời trang Hoàn tất').toBeHidden({ timeout: NEG });
    await evidence.shot('Biến thể 2: bấm đúp Finish rồi Back 1 lần', { highlight: [co.header, co.title], note: 'Mong đợi: đã rời trang Hoàn tất sau 1 lần Back' });
    expect.soft(errors.pageErrors, 'dương tính (dự kiến đúng): 0 pageerror').toEqual([]);
  });

  test('TC-053 Đơn thứ 2 sau đơn thứ nhất trong cùng phiên', { tag: ['@AC-3', '@AC-4', '@AC-5', '@info', '@overview', '@complete'] }, async ({ page, loggedInPage: inv, cartPage: cart, infoPage: ip, overviewPage: ov, completePage: co, evidence }) => {
    // Bước 1
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.checkout();
    await ip.submit(info.a);
    await ov.finish();
    // Bước 2
    await co.backHome();
    await inv.addButton(onesie).click();
    // Bước 3
    await inv.openCart();
    await cart.checkout();
    for (const field of Object.values(ip.fields)) await expect(field).toHaveValue('');
    // Bước 4
    await ip.submit(info.b);
    await expect(ov.itemNames).toHaveText([onesie.name]);
    await expect(ov.line(onesie).getByTestId('inventory-item-price')).toHaveText(priceText(onesie));
    await expectTotalsText(ov, expectedTotals(carts.cheapest), 'Bước 4');
    await evidence.shot('Bước 4: Tổng quan đơn thứ 2', { highlight: [ov.items, ov.subtotal, ov.tax, ov.total], note: 'Chỉ Onesie $7.99; $7.99 / $0.64 / $8.63' });
    // Bước 5
    await ov.finish();
    await expect(co.header).toHaveText(M.completeHeader);
    await expect(co.cartBadge).toBeHidden();
    expect(await cartStorage(page), 'không có khóa cart-contents').toBeNull();
  });
});

/**
 * TC-045 / TC-046: the whole checkout flow of an account, every AC field compared with standard data (lesson L12).
 * `slow`: timeout of the steps back to the product list (performance_glitch_user, Q11); their time is recorded, not judged.
 */
async function fullFlowLikeStandard(page: Page, inv: InventoryPage, evidence: Evidence, who: string, slow?: number) {
  const cart = new CartPage(page);
  const ip = new CheckoutInfoPage(page);
  const ov = new CheckoutOverviewPage(page);
  const co = new CheckoutCompletePage(page);
  const detail = new ProductDetailPage(page);
  const ids = carts.mixed;
  // Bước 1
  for (const p of [backpack, bikeLight, onesie]) await inv.addButton(p).click();
  // Bước 2
  await inv.openCart();
  await cart.checkout();
  await expectInfoPage(page, ip, 'Bước 2');
  // Bước 3
  await ip.continueButton.click();
  await expect.soft(ip.error, 'Bước 3: trống cả 3').toHaveText(M.firstNameRequired, QUICK);
  await ip.firstName.fill(info.a.first);
  await ip.continueButton.click();
  await expect.soft(ip.error, 'Bước 3: có First').toHaveText(M.lastNameRequired, QUICK);
  await ip.lastName.fill(info.a.last);
  await ip.continueButton.click();
  await expect.soft(ip.error, 'Bước 3: có First, Last').toHaveText(M.postalCodeRequired, QUICK);
  await expect.soft(ip.firstName, 'Bước 3: First Name đúng ô').toHaveValue(info.a.first, QUICK);
  await expect.soft(ip.lastName, 'Bước 3: Last Name đúng ô').toHaveValue(info.a.last, QUICK);
  // Bước 4
  await ip.cancel();
  await expect.soft(page, 'Bước 4: URL').toHaveURL(/\/cart\.html$/, QUICK);
  await expect.soft(cart.items, 'Bước 4: 3 dòng').toHaveCount(3, QUICK);
  await expect.soft(cart.cartBadge, 'Bước 4: số giỏ 3').toHaveText('3', QUICK);
  // Bước 5
  await cart.checkout();
  await ip.submit(info.a);
  await expect.soft(ov.title, 'Bước 5: tiêu đề').toHaveText(M.titleOverview, QUICK);
  await expectOverviewLines(ov, ids, 'Bước 5');
  await expectPaymentShipping(ov, 'Bước 5');
  await expectTotalsText(ov, expectedTotals(ids), 'Bước 5');
  await evidence.shot(`Bước 5: Tổng quan (${who})`, { highlight: [ov.items, ov.subtotal, ov.tax, ov.total], note: '3 dòng đúng TD-06; $47.97 / $3.84 / $51.81' });
  // Bước 6
  await ov.openProduct(bikeLight);
  await expect.soft(page, 'Bước 6: ?id=0').toHaveURL(/inventory-item\.html\?id=0$/, QUICK);
  await expect.soft(detail.name, 'Bước 6: tên').toHaveText(bikeLight.name, QUICK);
  await expect.soft(detail.price, 'Bước 6: giá').toHaveText(priceText(bikeLight), QUICK);
  // Bước 7
  await detail.openCart();
  await cart.checkout();
  await ip.submit(info.a);
  let t0 = Date.now();
  await ov.cancel(slow);
  if (slow) note('thời gian Cancel ở Tổng quan → danh sách (BUG-03 biến thể, chỉ ghi nhận)', `${Date.now() - t0} ms`);
  await expect.soft(page, 'Bước 7: URL').toHaveURL(/\/inventory\.html$/, QUICK);
  await expect.soft(inv.cartBadge, 'Bước 7: số giỏ 3').toHaveText('3', QUICK);
  await expect.soft(page.getByRole('button', { name: 'Remove', exact: true }), 'Bước 7: 3 nút Remove').toHaveCount(3, QUICK);
  // Bước 8
  await inv.openCart();
  await cart.checkout();
  await ip.submit(info.a);
  await ov.finish();
  await expectCompletePage(page, co, 'Bước 8');
  await evidence.shot(`Bước 8: Hoàn tất (${who})`, { highlight: [co.header, co.text, co.ponyImage], note: '"Thank you for your order!", đoạn dispatched, ảnh, 2 nút, không còn số giỏ' });
  // Bước 9
  const pdf = await receipt(co);
  const want = receiptTexts(ids, info.a).filter((t) => !['Swag Labs', 'Order Receipt', 'ORDER DETAILS', 'Order Date', 'ITEMS', 'DESCRIPTION', 'PRICE'].includes(t));
  expect.soft(pdf.name, 'Bước 9: tên file').toMatch(M.pdfFileName);
  expect.soft(inOrder(pdf.texts, want), 'Bước 9: PDF có An Le, 70000, 3 sản phẩm theo thứ tự giỏ, 47.97 / 3.84 / 51.81').toEqual(want);
  expect.soft(productLines(pdf.texts), 'Bước 9: dòng sản phẩm đúng bằng giỏ (3 sản phẩm, không thừa, không trùng)').toEqual(receiptLines(ids));
  // Bước 10
  t0 = Date.now();
  await co.backHome(slow);
  if (slow) note('thời gian Back Home → danh sách (BUG-03 biến thể, chỉ ghi nhận)', `${Date.now() - t0} ms`);
  await expectEmptyList(page, 'Bước 10');
}
