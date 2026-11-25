/**
 * SD-102: Products list, product detail, cart (SauceDemo)
 * Test cases: qa-runs/saucedemo-products-cart-screen/test-cases.csv (46 TC: 45 approved at HITL #2, TC-046 added for BUG-21 after review-defects)
 * Known bugs: qa-runs/saucedemo-products-cart-screen/known-issues.md (BUG-05 → BUG-21 + BUG-02 variant, expected to FAIL)
 *
 * Convention: 1 test = 1 TC, title starts with the TC id. Tags: @AC-x, screen (@list / @detail / @cart),
 * @smoke, @BUG-xx (known bug → test.fail()), @security.
 * Groups follow the screens (test.describe), like the Q&A and known-issues files.
 * Bug variants are checked with expect.soft + a short timeout, each variant from its own clean state,
 * so ONE failing variant never hides the others.
 */
import type { Locator, Page } from '@playwright/test';
import { test, expect, isLoginScreen } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { users } from '../data/users';
import { MSG, MSG_SHOP } from '../data/messages';
import type { Evidence } from '../utils/evidence';
import { products, allProducts, sortOrders, sortLabels, priceText, type Product } from '../data/products';

const { backpack, bikeLight, boltTShirt, onesie, redTShirt } = products;
/** Timeout for a soft check of a UI state that changes right after a click (bug variants). */
const QUICK = { timeout: 2_000 };
const names = (list: readonly Product[]) => list.map((p) => p.name);

// ---------- shared checks ----------
async function expectImages(inv: InventoryPage) {
  for (const p of allProducts) {
    await expect.soft(inv.image(p), `ảnh của ${p.name}`).toHaveAttribute('src', new RegExp(p.imgKey), QUICK);
  }
}
async function expectPrices(inv: InventoryPage) {
  for (const p of allProducts) {
    await expect.soft(inv.item(p).getByTestId('inventory-item-price'), `giá của ${p.name}`).toHaveText(priceText(p), QUICK);
  }
}
/**
 * Detail page shows product p (waits for an element unique to the detail page first).
 * Checks URL and name, and by default the description and price too (AC-5: "ảnh, tên, mô tả, giá giống ở danh sách").
 * `fieldsToo: false` only where another TC owns that field's bug (e.g. TC-024 wrong product, TC-032 description = BUG-21 / TC-046).
 */
async function expectDetailOf(page: Page, detail: ProductDetailPage, p: Product, label = p.name, fieldsToo = true) {
  await expect(detail.backButton).toBeVisible();
  await expect.soft(page, `${label}: URL`).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${p.id}$`), QUICK);
  await expect.soft(detail.name, `${label}: tên`).toHaveText(p.name, QUICK);
  if (fieldsToo) {
    await expect.soft(detail.description, `${label}: mô tả`).toHaveText(p.description, QUICK);
    await expect.soft(detail.price, `${label}: giá`).toHaveText(priceText(p), QUICK);
  }
}
/** Wait until every image on the page has finished loading, so element positions are final. */
async function imagesLoaded(page: Page) {
  await expect.poll(() => page.evaluate(() => [...document.images].every((i) => i.complete))).toBe(true);
}
async function box(l: Locator) {
  await expect(l).toBeVisible();
  const b = await l.boundingBox();
  if (!b) throw new Error('no bounding box');
  return b;
}
/** Layout like standard_user: cart icon at the same place (≤ 5 px), cart and menu icons not rotated. */
async function expectLayoutLike(app: InventoryPage | ProductDetailPage | CartPage, base: Page, where: string) {
  const ref = new InventoryPage(base);
  const [a, b] = [await box(app.cartIcon), await box(ref.cartIcon)];
  expect.soft(Math.abs(a.x - b.x), `${where}: biểu tượng giỏ lệch ngang (px)`).toBeLessThanOrEqual(5);
  expect.soft(Math.abs(a.y - b.y), `${where}: biểu tượng giỏ lệch dọc (px)`).toBeLessThanOrEqual(5);
  expect.soft(await app.transformOf(app.cartIcon), `${where}: biểu tượng giỏ bị xoay`).toBe('none');
  expect.soft(await app.transformOf(app.menuIcon), `${where}: biểu tượng menu bị xoay`).toBe('none');
}
/** Cart page flow that must work for every account: line, Remove, Continue Shopping, Checkout. */
async function expectCartFlow(page: Page, inv: InventoryPage, cart: CartPage) {
  await inv.addButton(backpack).click();
  await inv.openCart();
  await expect(cart.cartList).toBeVisible();
  await expect.soft(cart.line(backpack).getByTestId('inventory-item-price')).toHaveText(priceText(backpack));
  await cart.removeButton(backpack).click();
  await expect.soft(cart.items).toHaveCount(0);
  await cart.continueShopping();
  await inv.addButton(backpack).click();
  await inv.openCart();
  await cart.checkoutButton.click();
  await expect.soft(cart.title).toHaveText(MSG_SHOP.checkoutTitle);
  await expect.soft(page).toHaveURL(/checkout-step-one\.html/);
}

// =====================================================================
test.describe('Màn hình 1: Danh sách sản phẩm (/inventory.html)', () => {
  test('TC-001 danh sách hiển thị đủ 6 sản phẩm', { tag: ['@AC-1', '@list', '@smoke'] }, async ({ loggedInPage: inv, evidence }) => {
    await expect(inv.title).toHaveText('Products');
    await expect(inv.items).toHaveCount(6);
    for (const item of await inv.items.all()) {
      await expect.soft(item.getByRole('img')).toBeVisible();
      await expect.soft(item.getByTestId('inventory-item-name')).not.toBeEmpty();
      await expect.soft(item.getByTestId('inventory-item-desc')).not.toBeEmpty();
      await expect.soft(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect.soft(item.getByRole('button', { name: /^(Add to cart|Remove)$/ })).toHaveText('Add to cart');
    }
    await evidence.shot('Danh sách sản phẩm', { highlight: inv.inventoryList, note: '6 sản phẩm, mỗi sản phẩm có ảnh, tên, mô tả, giá, nút Add to cart' });
  });

  test('TC-002 tên và giá 6 sản phẩm đúng dữ liệu chuẩn', { tag: ['@AC-1', '@list'] }, async ({ loggedInPage: inv, evidence }) => {
    await expect(inv.items).toHaveCount(6);
    for (const p of allProducts) await expect.soft(inv.item(p), `có sản phẩm ${p.name}`).toHaveCount(1);
    await expectPrices(inv);
    await evidence.shot('Tên và giá', { highlight: inv.itemPrices, note: 'Tên, giá khớp dữ liệu chuẩn TD-06 (vd Backpack $29.99)' });
  });

  test('TC-003 ảnh 6 sản phẩm đúng (standard_user)', { tag: ['@AC-1', '@list'] }, async ({ loggedInPage: inv, evidence }) => {
    await expectImages(inv);
    await evidence.shot('Ảnh sản phẩm', { highlight: inv.items.getByRole('img'), note: 'Mỗi ảnh là ảnh của chính sản phẩm đó' });
  });

  test('TC-004 ảnh 6 sản phẩm đúng (problem_user)', { tag: ['@AC-1', '@list', '@BUG-08'] }, async ({ loginAs, evidence }) => {
    test.fail(true, 'BUG-08: problem_user thấy ảnh lỗi sl-404 cho cả 6 sản phẩm');
    const inv = await loginAs(users.problem);
    await evidence.shot('Ảnh sản phẩm (problem_user)', { highlight: inv.items.getByRole('img'), note: 'Mong đợi: mỗi ảnh là ảnh của chính sản phẩm đó' });
    await expectImages(inv);
  });

  test('TC-005 ảnh 6 sản phẩm đúng (visual_user)', { tag: ['@AC-1', '@list', '@BUG-15'] }, async ({ loginAs, evidence }) => {
    test.fail(true, 'BUG-15: ảnh Backpack của visual_user là ảnh lỗi sl-404');
    const inv = await loginAs(users.visual);
    await evidence.shot('Ảnh sản phẩm (visual_user)', { highlight: inv.image(backpack), note: 'Mong đợi: ảnh Backpack là ảnh balo' });
    await expectImages(inv);
  });

  test('TC-006 mặc định sắp xếp theo tên A → Z', { tag: ['@AC-2', '@list', '@smoke'] }, async ({ loggedInPage: inv, evidence }) => {
    await expect(inv.activeSort).toHaveText(sortLabels.az);
    await expect(inv.itemNames).toHaveText(names(sortOrders.az));
    await evidence.shot('Mặc định', { highlight: inv.activeSort, note: 'Dropdown "Name (A to Z)", tên xếp A → Z' });
  });

  for (const [tc, key, tags] of [
    ['TC-007', 'za', ['@AC-2', '@list']],
    ['TC-008', 'lohi', ['@AC-2', '@list']],
    ['TC-009', 'hilo', ['@AC-2', '@list']],
  ] as const) {
    test(`${tc} sắp xếp ${sortLabels[key]}`, { tag: [...tags] }, async ({ loggedInPage: inv, evidence }) => {
      await inv.sortBy(key);
      await expect(inv.activeSort).toHaveText(sortLabels[key]);
      await expect(inv.itemNames).toHaveText(names(sortOrders[key]));
      await evidence.shot(`Sau khi chọn ${sortLabels[key]}`, { highlight: inv.itemNames, note: `Thứ tự đúng ${sortLabels[key]} (cùng giá thì theo tên A → Z)` });
    });
  }

  test('TC-010 chọn lại A → Z sau khi đã sắp kiểu khác', { tag: ['@AC-2', '@list'] }, async ({ loggedInPage: inv, evidence }) => {
    await inv.sortBy('hilo');
    await expect(inv.itemNames.first()).toHaveText(sortOrders.hilo[0].name);
    await inv.sortBy('az');
    await expect(inv.activeSort).toHaveText(sortLabels.az);
    await expect(inv.itemNames).toHaveText(names(sortOrders.az));
    await evidence.shot('Chọn lại A → Z', { highlight: inv.activeSort, note: 'Thứ tự trở lại tên A → Z' });
  });

  test('TC-011 problem_user: sắp xếp hoạt động', { tag: ['@AC-2', '@list', '@BUG-09'] }, async ({ loginAs, evidence }) => {
    test.fail(true, 'BUG-09: problem_user chọn sắp xếp nhưng danh sách không đổi');
    const inv = await loginAs(users.problem);
    for (const key of ['za', 'lohi', 'hilo'] as const) {
      await inv.sortBy(key);
      await expect.soft(inv.activeSort, `${key}: nhãn dropdown`).toHaveText(sortLabels[key], QUICK);
      await expect.soft(inv.itemNames, `${key}: thứ tự`).toHaveText(names(sortOrders[key]), QUICK);
      await evidence.shot(`Đã chọn ${sortLabels[key]}`, { highlight: [inv.activeSort, inv.itemNames.first()], note: `Mong đợi: dropdown "${sortLabels[key]}", đứng đầu là ${sortOrders[key][0].name}` });
    }
  });

  test('TC-012 error_user: sắp xếp hoạt động với cả 3 kiểu, không báo lỗi', { tag: ['@AC-2', '@list', '@BUG-12'] }, async ({ page, loginAs, evidence }) => {
    test.fail(true, 'BUG-12: error_user chọn sắp xếp bị hộp thoại "Sorting is broken!"');
    const dialogs: string[] = [];
    page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
    const inv = await loginAs(users.error);
    for (const key of ['za', 'lohi', 'hilo'] as const) {
      dialogs.length = 0;
      await inv.sortBy(key);
      await expect.soft(inv.activeSort, `${key}: nhãn dropdown`).toHaveText(sortLabels[key], QUICK);
      await expect.soft(inv.itemNames, `${key}: thứ tự`).toHaveText(names(sortOrders[key]), QUICK);
      for (const d of dialogs) test.info().annotations.push({ type: `hộp thoại (${key})`, description: d });
      expect.soft(dialogs, `${key}: không được có hộp thoại lỗi`).toEqual([]);
      // Known-issues note 7: record WHICH dialog appeared. A dialog other than MSG-01 means the bug changed.
      expect.soft(dialogs.filter((d) => d !== MSG_SHOP.sortingBroken), `${key}: hộp thoại lạ (khác MSG-01)`).toEqual([]);
      await evidence.shot(`Sau khi chọn ${sortLabels[key]}`, {
        highlight: inv.activeSort,
        note: `Mong đợi: dropdown "${sortLabels[key]}", không có hộp thoại. Hộp thoại đã hiện: ${dialogs.length ? dialogs.map((d) => `"${d}"`).join(', ') : 'không có'}`,
      });
    }
  });

  test('TC-014 sắp xếp khi giỏ có hàng: nút Remove đi theo đúng sản phẩm', { tag: ['@AC-2', '@AC-3', '@list'] }, async ({ loggedInPage: inv, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.sortBy('hilo');
    await expect(inv.itemNames).toHaveText(names(sortOrders.hilo));
    await expect(inv.removeButton(backpack)).toBeVisible();
    await expect(inv.removeButton(onesie)).toBeVisible();
    await expect(inv.items.getByRole('button', { name: 'Remove' })).toHaveCount(2);
    for (const p of allProducts.filter((x) => x !== backpack && x !== onesie)) await expect.soft(inv.cartButton(p)).toHaveText('Add to cart');
    await expect(inv.cartBadge).toHaveText('2');
    await evidence.shot('Sau khi sắp giá cao → thấp', { highlight: [inv.removeButton(backpack), inv.removeButton(onesie)], note: 'Nút Remove vẫn ở đúng Backpack và Onesie' });
  });

  test('TC-015 thêm 1 sản phẩm vào giỏ', { tag: ['@AC-3', '@list', '@smoke'] }, async ({ loggedInPage: inv, evidence }) => {
    await inv.addButton(backpack).click();
    await expect(inv.cartButton(backpack)).toHaveText('Remove');
    await expect(inv.cartBadge).toHaveText('1');
    await evidence.shot('Đã thêm Backpack', { highlight: [inv.cartButton(backpack), inv.cartBadge], note: 'Nút đổi thành Remove, giỏ hiện số 1' });
  });

  test('TC-016 thêm lần lượt cả 6 sản phẩm: số giỏ đếm đúng', { tag: ['@AC-3', '@list'] }, async ({ loggedInPage: inv, evidence }) => {
    for (const [i, p] of sortOrders.az.entries()) {
      await inv.addButton(p).click();
      await expect(inv.cartBadge).toHaveText(String(i + 1));
    }
    await expect(inv.items.getByRole('button', { name: 'Remove' })).toHaveCount(6);
    await evidence.shot('Đã thêm 6 sản phẩm', { highlight: inv.cartBadge, note: 'Giỏ hiện số 6, cả 6 nút là Remove' });
  });

  test('TC-017 bỏ sản phẩm ở danh sách, giỏ trống thì không hiện số', { tag: ['@AC-4', '@list'] }, async ({ loggedInPage: inv, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(bikeLight).click();
    await inv.removeButton(backpack).click();
    await expect(inv.cartButton(backpack)).toHaveText('Add to cart');
    await expect(inv.cartBadge).toHaveText('1');
    await inv.removeButton(bikeLight).click();
    await expect(inv.cartBadge).toBeHidden();
    await evidence.shot('Đã bỏ hết', { highlight: inv.cartLink, note: 'Giỏ trống: không còn số trên biểu tượng giỏ' });
  });

});

// =====================================================================
test.describe('Màn hình 2: Chi tiết sản phẩm (/inventory-item.html?id=<n>)', () => {
  test('TC-020 bấm tên mở đúng trang chi tiết (cả 6 sản phẩm)', { tag: ['@AC-5', '@list', '@detail'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, evidence }) => {
    for (const p of allProducts) {
      await inv.nameLink(p).click();
      await expectDetailOf(page, detail, p);
      await expect.soft(detail.price).toHaveText(priceText(p));
      await expect.soft(detail.description).toHaveText(p.description);
      await expect.soft(detail.image).toHaveAttribute('src', new RegExp(p.imgKey));
      await expect.soft(detail.addButton).toBeVisible();
      if (p === backpack) await evidence.shot('Chi tiết Backpack', { highlight: [detail.name, detail.price, detail.image], note: 'Tên, giá, mô tả, ảnh khớp dữ liệu chuẩn TD-06; có Add to cart và Back to products' });
      await detail.backToProducts();
    }
  });

  test('TC-021 mở chi tiết bằng ảnh và bằng phím Enter', { tag: ['@AC-5', '@list', '@detail'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, evidence }) => {
    await inv.imageLink(bikeLight).click();
    await expectDetailOf(page, detail, bikeLight);
    await evidence.shot('Mở bằng ảnh', { highlight: detail.name, note: 'Bấm ảnh Bike Light mở đúng chi tiết Bike Light (id=0)' });
    await detail.backToProducts();
    await inv.nameLink(onesie).focus();
    await page.keyboard.press('Enter');
    await expectDetailOf(page, detail, onesie);
    await evidence.shot('Mở bằng Enter', { highlight: detail.name, note: 'Enter trên tên Onesie mở chi tiết Onesie (id=2)' });
  });

  test('TC-022 thêm / bỏ ở trang chi tiết đồng bộ với danh sách', { tag: ['@AC-3', '@AC-4', '@AC-5', '@list', '@detail'] }, async ({ loggedInPage: inv, productDetailPage: detail, evidence }) => {
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible();
    await detail.addButton.click();
    await expect(detail.removeButton).toBeVisible();
    await expect(detail.cartBadge).toHaveText('1');
    await evidence.shot('Thêm ở chi tiết', { highlight: [detail.removeButton, detail.cartBadge], note: 'Nút Remove, giỏ hiện 1' });
    await detail.backToProducts();
    await expect(inv.cartButton(backpack)).toHaveText('Remove');
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible();
    await detail.removeButton.click();
    await expect(detail.addButton).toBeVisible();
    await expect(detail.cartBadge).toBeHidden();
    await detail.backToProducts();
    await expect(inv.cartButton(backpack)).toHaveText('Add to cart');
    await evidence.shot('Danh sách sau khi bỏ ở chi tiết', { highlight: inv.cartButton(backpack), note: 'Backpack ở danh sách về Add to cart' });
  });

  test('TC-023 quay lại danh sách bằng nút và bằng Back của trình duyệt', { tag: ['@AC-5', '@list', '@detail'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, evidence }) => {
    await inv.nameLink(backpack).click();
    await detail.backToProducts();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await inv.nameLink(bikeLight).click();
    await expect(detail.backButton).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await evidence.shot('Sau khi bấm Back', { highlight: inv.inventoryList, note: 'Về danh sách, đủ 6 sản phẩm' });
  });

  test('TC-024 problem_user: bấm tên hoặc ảnh ở danh sách và bấm tên ở trang giỏ mở đúng trang chi tiết', { tag: ['@AC-5', '@list', '@detail', '@cart', '@BUG-11'] }, async ({ page, loginAs, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-11: problem_user bấm sản phẩm mở sai trang chi tiết');
    test.setTimeout(120_000); // 18 checks, each a full page load: 18 × ~1.5 s + 36 soft checks × 2 s ≈ 81 s, + 30%
    const inv = await loginAs(users.problem);
    for (const p of allProducts) {
      for (const how of ['tên', 'ảnh', 'tên ở giỏ'] as const) {
        if (how === 'tên ở giỏ') {
          // Cart variant (review-test-impl-r2 A1): cart holds only this product, click its name on the cart page
          await inv.setCartStorage(`[${p.id}]`);
          await cart.goto();
          await expect(cart.cartList).toBeVisible();
          await cart.line(p).getByTestId('inventory-item-name').click();
        } else {
          await inv.goto();
          await (how === 'tên' ? inv.nameLink(p) : inv.imageLink(p)).click();
        }
        await expectDetailOf(page, detail, p, `${p.name} (bấm ${how})`, false); // BUG-11 = wrong product: URL + name are enough
        if (!page.url().endsWith(`id=${p.id}`)) {
          await evidence.shot(`Bấm ${how} ${p.name}`, { highlight: detail.name, note: `Mong đợi: chi tiết ${p.name} (id=${p.id}). Đang mở: ${new URL(page.url()).search}` });
        }
      }
    }
  });

  test('TC-025 số trên giỏ luôn bằng số sản phẩm thật', { tag: ['@AC-3', '@AC-5', '@AC-6', '@detail', '@cart', '@BUG-06'] }, async ({ loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-06: sản phẩm không tồn tại / dữ liệu giỏ sai làm số giỏ lệch giỏ thật');
    test.setTimeout(60_000);
    for (const id of [6, 99, -1]) {
      await inv.setCartStorage('[]');
      await detail.goto(id);
      await expect(detail.backButton).toBeVisible();
      await expect.soft(detail.name, `id=${id}: tên`).toHaveText(MSG_SHOP.itemNotFound, QUICK);
      await expect.soft(detail.addButton, `id=${id}: không được có nút Add to cart`).toHaveCount(0, QUICK);
      // The button should not exist; if it does, press it to show what a user would get (cart badge for a product that does not exist)
      if (await detail.addButton.isVisible()) await detail.addButton.click();
      await expect.soft(detail.cartBadge, `id=${id}: không được có số giỏ`).toBeHidden(QUICK);
      if (id === 99) await evidence.shot('Sản phẩm id=99 sau khi bấm nút', { highlight: [detail.name, detail.cartLink], note: 'Mong đợi: báo không tìm thấy, KHÔNG có nút Add to cart, giỏ không có số' });
    }
    for (const [raw, label] of [['[4,4]', 'trùng id'], ['[4,"x"]', 'id lạ']] as const) {
      await inv.setCartStorage(raw);
      await cart.goto();
      await expect(cart.cartList).toBeVisible();
      await expect.soft(cart.cartBadge, `${label}: số giỏ`).toHaveText('1', QUICK);
      await expect.soft(cart.items, `${label}: số dòng trong giỏ`).toHaveCount(1, QUICK);
      await expect.soft(cart.itemNames, `${label}: dòng là Backpack`).toHaveText([backpack.name], QUICK);
      // Quantity of every line: expected exactly one line, quantity 1 (review-executor C1: line(backpack) matched 2 lines)
      if (raw === '[4,4]') await expect.soft(cart.items.getByTestId('item-quantity'), `${label}: số lượng`).toHaveText(['1'], QUICK);
      await evidence.shot(`Giỏ với dữ liệu ${label} ${raw}`, { highlight: [cart.cartList, cart.cartBadge], note: `Mong đợi: số giỏ 1, 1 dòng Backpack${raw === '[4,4]' ? ' số lượng 1' : ''}` });
    }
  });

  test('TC-046 error_user: trang chi tiết hiển thị đủ thông tin, không có lỗi JavaScript hay báo lỗi', { tag: ['@AC-5', '@detail', '@BUG-21'] }, async ({ page, loginAs, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-21: error_user mở trang chi tiết thì mất mô tả sản phẩm, console báo lỗi render, gửi báo lỗi ra ngoài');
    // Browser noise seen for every account on page load, not app errors: excluded
    const NOISE = /Permissions policy violation|Failed to load resource/;
    const errors: string[] = [];
    const reports: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text().split('\n')[0]); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    // Only submit.backtrace.io = an error report. events.backtrace.io is sent at login for EVERY account (not an error)
    page.on('request', (r) => { if (new URL(r.url()).host === 'submit.backtrace.io') reports.push(r.url()); });
    const inv = await loginAs(users.error);
    for (const p of allProducts) {
      errors.length = 0;
      reports.length = 0;
      await inv.nameLink(p).click();
      // The render error comes right after the page appears: wait for it (bounded), not a fixed sleep
      await page.waitForEvent('console', { predicate: (m) => m.type() === 'error' && !NOISE.test(m.text()), timeout: 2_000 }).catch(() => {});
      await expectDetailOf(page, detail, p); // name, description, price like standard_user
      for (const e of errors) test.info().annotations.push({ type: `lỗi ở chi tiết ${p.name}`, description: e });
      expect.soft(errors, `${p.name}: không được có lỗi console / JavaScript`).toEqual([]);
      expect.soft(reports.length, `${p.name}: không được gửi báo lỗi tới submit.backtrace.io`).toBe(0);
      await evidence.shot(`Chi tiết ${p.name} (error_user)`, {
        highlight: [detail.name, detail.price],
        note: `Mong đợi: có mô tả "${p.description.slice(0, 30)}…", không lỗi. Thực tế: mô tả ${(await detail.description.count()) ? 'có' : 'KHÔNG có'}; console: ${errors.length ? errors.join(' | ') : 'không lỗi'}; báo lỗi gửi đi: ${reports.length}`,
      });
      await detail.backToProducts();
    }
  });

  test('TC-026 id sai định dạng xử lý như sản phẩm không tồn tại', { tag: ['@AC-5', '@detail', '@BUG-20'] }, async ({ loggedInPage: _inv, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-20: id sai định dạng (4abc, 04, 4.9, 0x4, khoảng trắng, +4, 4e0, -0) vẫn mở sản phẩm');
    test.setTimeout(60_000);
    // %204 = ' 4', %2B4 = '+4' (URL-encoded on purpose, review-test-impl-r2 A3)
    for (const raw of ['abc', '', '4abc', '04', '4.9', '0x4', '%204', '%2B4', '-0', '4e0']) {
      await detail.goto(raw);
      await expect(detail.backButton).toBeVisible();
      await expect.soft(detail.name, `id=${raw || '(rỗng)'}`).toHaveText(MSG_SHOP.itemNotFound, QUICK);
      await evidence.shot(`id=${raw || '(rỗng)'}`, { highlight: detail.name, note: 'Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào' });
    }
  });
});

// =====================================================================
test.describe('Màn hình 3: Giỏ hàng (/cart.html)', () => {
  test('TC-027 trang giỏ liệt kê đúng sản phẩm theo thứ tự thêm', { tag: ['@AC-6', '@cart', '@smoke'] }, async ({ loggedInPage: inv, cartPage: cart, evidence }) => {
    const added = [redTShirt, backpack, boltTShirt];
    for (const p of added) await inv.addButton(p).click();
    await inv.openCart();
    await expect(cart.title).toHaveText('Your Cart');
    await expect(cart.quantityLabel).toHaveText('QTY');
    await expect(cart.descriptionLabel).toHaveText('Description');
    await expect(cart.itemNames).toHaveText(names(added));
    for (const p of added) {
      const line = cart.line(p);
      await expect.soft(line.getByTestId('item-quantity')).toHaveText('1');
      await expect.soft(line.getByTestId('inventory-item-desc')).toHaveText(p.description);
      await expect.soft(line.getByTestId('inventory-item-price')).toHaveText(priceText(p));
    }
    await evidence.shot('Giỏ hàng', { highlight: cart.cartList, note: '3 dòng theo thứ tự thêm: Red T-Shirt, Backpack, Bolt T-Shirt; số lượng 1, giá đúng' });
  });

  test('TC-028 bỏ sản phẩm ở trang giỏ', { tag: ['@AC-4', '@AC-6', '@cart'] }, async ({ loggedInPage: inv, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.openCart();
    await cart.removeButton(backpack).click();
    await expect(cart.itemNames).toHaveText([onesie.name]);
    await expect(cart.cartBadge).toHaveText('1');
    await evidence.shot('Đã bỏ Backpack trong giỏ', { highlight: [cart.cartList, cart.cartBadge], note: 'Còn 1 dòng Onesie, giỏ hiện 1' });
    await cart.continueShopping();
    await expect(inv.cartButton(backpack)).toHaveText('Add to cart');
  });

  test('TC-029 điều hướng từ trang giỏ', { tag: ['@AC-6', '@cart'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.openCart();
    await cart.line(backpack).getByTestId('inventory-item-name').click();
    await expectDetailOf(page, detail, backpack);
    await cart.goto();
    await cart.continueShopping();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await cart.goto();
    await cart.checkoutButton.click();
    await expect(page).toHaveURL(/checkout-step-one\.html$/);
    await expect(cart.title).toHaveText(MSG_SHOP.checkoutTitle);
    await evidence.shot('Sau khi bấm Checkout', { highlight: cart.title, note: 'Sang bước thanh toán "Checkout: Your Information"' });
  });

  test('TC-030 giỏ trống không sang được bước thanh toán', { tag: ['@AC-6', '@cart', '@BUG-19'] }, async ({ page, loggedInPage: _inv, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-19: giỏ trống vẫn bấm Checkout sang bước thanh toán');
    await cart.goto();
    await expect(cart.cartList).toBeVisible();
    await expect(cart.items).toHaveCount(0);
    if (await cart.checkoutButton.isEnabled()) await cart.checkoutButton.click();
    await expect.soft(page, 'vẫn ở trang giỏ').toHaveURL(/cart\.html$/, QUICK);
    await expect.soft(cart.title, 'không sang bước thanh toán').not.toHaveText(MSG_SHOP.checkoutTitle, QUICK);
    await evidence.shot('Bấm Checkout khi giỏ trống', { highlight: cart.title, note: 'Mong đợi: nút Checkout bị khóa, hoặc bấm vào vẫn ở trang giỏ' });
  });

  test('TC-036 visual_user: nút Checkout ở trang giỏ đúng vị trí', { tag: ['@AC-6', '@cart', '@BUG-18'] }, async ({ loginAs, otherSession, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-18: visual_user có nút Checkout bị đẩy lên vùng tiêu đề');
    const inv = await loginAs(users.visual);
    await inv.addButton(backpack).click();
    await inv.openCart();
    const base = new CartPage(await otherSession(users.standard));
    await new InventoryPage(base.page).addButton(backpack).click();
    await base.openCart();
    const [co, cs] = [await box(cart.checkoutButton), await box(cart.continueShoppingButton)];
    const [bco, bcs] = [await box(base.checkoutButton), await box(base.continueShoppingButton)];
    await evidence.shot('Trang giỏ (visual_user)', { highlight: [cart.checkoutButton, cart.continueShoppingButton], note: 'Mong đợi: nút Checkout cùng hàng với Continue Shopping' });
    expect.soft(Math.abs(bco.y - bcs.y), 'standard_user: 2 nút cùng hàng (mốc so sánh)').toBeLessThanOrEqual(5);
    expect.soft(Math.abs(co.y - cs.y), 'visual_user: Checkout cùng hàng với Continue Shopping (px)').toBeLessThanOrEqual(5);
  });
});

// =====================================================================
test.describe('Chung: nhiều màn hình (tài khoản, giỏ, menu, kiểm soát truy cập)', () => {
  test('TC-013 visual_user: giá ở danh sách đúng và khớp trang chi tiết, giỏ', { tag: ['@AC-1', '@AC-5', '@list', '@detail', '@cart', '@BUG-14'] }, async ({ loginAs, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-14: visual_user thấy giá sai, đổi ngẫu nhiên ở danh sách');
    const inv = await loginAs(users.visual);
    await evidence.shot('Giá ở danh sách (visual_user)', { highlight: inv.itemPrices, note: 'Mong đợi: giá đúng TD-06 (Backpack $29.99, Bike Light $9.99…)' });
    await expectPrices(inv);
    const listPrice = await inv.item(backpack).getByTestId('inventory-item-price').textContent();
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible();
    await evidence.shot('Giá ở chi tiết Backpack', { highlight: detail.price, note: `Mong đợi: $29.99, bằng giá ở danh sách (danh sách hiện ${listPrice})` });
    await expect.soft(detail.price, 'giá ở chi tiết').toHaveText(priceText(backpack));
    await detail.addButton.click();
    await detail.openCart();
    await evidence.shot('Giá ở giỏ', { highlight: cart.line(backpack).getByTestId('inventory-item-price'), note: `Mong đợi: $29.99, bằng giá ở danh sách (danh sách hiện ${listPrice})` });
    await expect.soft(cart.line(backpack).getByTestId('inventory-item-price'), 'giá ở giỏ').toHaveText(priceText(backpack));
    expect.soft(listPrice, 'giá ở danh sách = giá ở chi tiết, giỏ').toBe(priceText(backpack));
  });

  test('TC-035 visual_user: bố cục giống standard_user ở cả 3 màn hình', { tag: ['@AC-1', '@AC-3', '@AC-6', '@list', '@detail', '@cart', '@BUG-16'] }, async ({ page, loginAs, otherSession, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-16: visual_user lệch / xoay biểu tượng giỏ, menu, nút Add');
    const inv = await loginAs(users.visual);
    const base = await otherSession(users.standard);
    const baseInv = new InventoryPage(base);
    await imagesLoaded(page);
    await imagesLoaded(base);
    await evidence.shot('Danh sách (visual_user)', { highlight: [inv.cartIcon, inv.menuIcon, inv.cartButton(redTShirt)], note: 'Mong đợi: biểu tượng giỏ, menu, nút Add như standard_user, không xoay, không lệch' });
    await expectLayoutLike(inv, base, 'Danh sách');
    const [a, b] = [await box(inv.cartButton(redTShirt)), await box(baseInv.cartButton(redTShirt))];
    expect.soft(Math.abs(a.x - b.x), 'Danh sách: nút Add của Red T-Shirt lệch ngang (px)').toBeLessThanOrEqual(5);
    expect.soft(Math.abs(a.y - b.y), 'Danh sách: nút Add của Red T-Shirt lệch dọc (px)').toBeLessThanOrEqual(5);
    await inv.cartButton(redTShirt).scrollIntoViewIfNeeded();
    await evidence.shot('Nút Add của Red T-Shirt (visual_user)', { highlight: inv.cartButton(redTShirt), note: `Mong đợi: cùng vị trí với standard_user (đang lệch ngang ${Math.round(Math.abs(a.x - b.x))} px)` });
    await detail.goto(backpack.id);
    await base.goto('/inventory-item.html?id=4');
    await expect(detail.backButton).toBeVisible();
    await expect(new ProductDetailPage(base).backButton).toBeVisible();
    await imagesLoaded(page);
    await imagesLoaded(base);
    await evidence.shot('Chi tiết (visual_user)', { highlight: [detail.cartIcon, detail.menuIcon], note: 'Mong đợi: biểu tượng giỏ, menu như standard_user' });
    await expectLayoutLike(detail, base, 'Chi tiết');
    await cart.goto();
    await base.goto('/cart.html');
    await expect(cart.cartList).toBeVisible();
    await expect(new CartPage(base).cartList).toBeVisible();
    await imagesLoaded(page);
    await imagesLoaded(base);
    await evidence.shot('Giỏ (visual_user)', { highlight: [cart.cartIcon, cart.menuIcon], note: 'Mong đợi: biểu tượng giỏ, menu như standard_user' });
    await expectLayoutLike(cart, base, 'Giỏ');
  });

  test('TC-018 problem_user: thêm và bỏ được cả 6 sản phẩm ở danh sách và chi tiết', { tag: ['@AC-3', '@AC-4', '@AC-5', '@list', '@detail', '@BUG-10'] }, async ({ loginAs, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-10: problem_user không thêm / bỏ được 3 sản phẩm');
    test.setTimeout(120_000);
    await checkAddRemoveAllProducts(await loginAs(users.problem), detail, evidence);
  });

  test('TC-019 error_user: thêm và bỏ được cả 6 sản phẩm ở danh sách và chi tiết', { tag: ['@AC-3', '@AC-4', '@AC-5', '@list', '@detail', '@BUG-13'] }, async ({ page, loginAs, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-13: error_user không thêm / bỏ được 3 sản phẩm');
    test.setTimeout(120_000);
    // Evidence only (not a fail condition): the app throws MSG-05 / MSG-06 as an uncaught JS error, not a console message
    const msgId = (m: string) => (m === MSG_SHOP.addFailed ? 'MSG-05' : m === MSG_SHOP.removeFailed ? 'MSG-06' : 'khác');
    page.on('pageerror', (e) => test.info().annotations.push({ type: `pageerror (${msgId(e.message)})`, description: e.message }));
    await checkAddRemoveAllProducts(await loginAs(users.error), detail, evidence);
  });

  test('TC-031 problem_user: các thao tác không lỗi vẫn đúng (giá, bố cục, trang giỏ)', { tag: ['@AC-1', '@AC-6', '@list', '@cart'] }, async ({ page, loginAs, otherSession, cartPage: cart, evidence }) => {
    const inv = await loginAs(users.problem);
    await expectPrices(inv);
    await expectLayoutLike(inv, await otherSession(users.standard), 'Danh sách');
    await expectCartFlow(page, inv, cart);
    await evidence.shot('Bước thanh toán', { highlight: cart.title, note: 'problem_user: giỏ, Remove, Continue Shopping, Checkout đều đúng' });
  });

  test('TC-032 error_user: các thao tác không lỗi vẫn đúng (ảnh, giá, bố cục, mở chi tiết, trang giỏ)', { tag: ['@AC-1', '@AC-5', '@AC-6', '@list', '@detail', '@cart'] }, async ({ page, loginAs, otherSession, productDetailPage: detail, cartPage: cart, evidence }) => {
    const inv = await loginAs(users.error);
    await expectImages(inv);
    await expectPrices(inv);
    await expectLayoutLike(inv, await otherSession(users.standard), 'Danh sách');
    for (const p of allProducts) {
      for (const link of [inv.nameLink(p), inv.imageLink(p)]) {
        await link.click();
        // Description of error_user's detail page is missing: BUG-21, owned by TC-046 (not hidden: TC-046 fails on it)
        await expectDetailOf(page, detail, p, p.name, false);
        await inv.goto();
      }
    }
    await expectCartFlow(page, inv, cart);
    await evidence.shot('Bước thanh toán', { highlight: cart.title, note: 'error_user: ảnh, giá, chi tiết, giỏ đều đúng' });
  });

  test('TC-033 visual_user: các thao tác không lỗi vẫn đúng (sắp xếp, thêm / bỏ, mở chi tiết, trang giỏ)', { tag: ['@AC-2', '@AC-3', '@AC-4', '@AC-5', '@AC-6', '@list', '@detail', '@cart'] }, async ({ page, loginAs, productDetailPage: detail, cartPage: cart, evidence }) => {
    const inv = await loginAs(users.visual);
    // Price sorts: the NAME order is right (sorted by the real price); only the shown prices are wrong (BUG-14)
    for (const key of ['za', 'lohi', 'hilo', 'az'] as const) {
      await inv.sortBy(key);
      await expect.soft(inv.activeSort).toHaveText(sortLabels[key]);
      await expect.soft(inv.itemNames).toHaveText(names(sortOrders[key]));
    }
    for (const [i, p] of sortOrders.az.entries()) {
      await inv.addButton(p).click();
      await expect.soft(inv.cartButton(p)).toHaveText('Remove');
      await expect.soft(inv.cartBadge).toHaveText(String(i + 1));
    }
    for (const p of sortOrders.az) {
      await inv.removeButton(p).click();
      await expect.soft(inv.cartButton(p)).toHaveText('Add to cart');
    }
    await expect.soft(inv.cartBadge).toBeHidden();
    await detail.goto(backpack.id);
    await detail.addButton.click();
    await expect.soft(detail.cartBadge).toHaveText('1');
    await detail.backToProducts();
    await expect.soft(inv.cartButton(backpack), 'danh sách đồng bộ sau khi thêm ở chi tiết').toHaveText('Remove');
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible();
    await detail.removeButton.click();
    await expect.soft(detail.cartBadge).toBeHidden();
    await detail.backToProducts();
    await expect.soft(inv.cartButton(backpack), 'danh sách đồng bộ sau khi bỏ ở chi tiết').toHaveText('Add to cart');
    for (const p of allProducts) {
      for (const how of ['tên', 'ảnh'] as const) {
        await inv.goto();
        await (how === 'tên' ? inv.nameLink(p) : inv.imageLink(p)).click();
        await expectDetailOf(page, detail, p, `${p.name} (bấm ${how})`);
        await expect.soft(detail.price).toHaveText(priceText(p));
      }
    }
    await inv.goto();
    await expectCartFlow(page, inv, cart);
    await evidence.shot('Bước thanh toán', { highlight: cart.title, note: 'visual_user: sắp theo tên, thêm / bỏ, chi tiết, giỏ đều đúng' });
  });

  test('TC-034 performance_glitch_user: mọi thao tác thành công (không đánh fail theo thời gian)', { tag: ['@AC-1', '@AC-2', '@AC-3', '@AC-5', '@AC-6', '@list', '@detail', '@cart'] }, async ({ page, loginAs, otherSession, productDetailPage: detail, cartPage: cart, evidence }) => {
    // BUG-17 is only RECORDED here (Q10): this test must PASS, no test.fail().
    test.setTimeout(120_000);
    const inv = await loginAs(users.performanceGlitch);
    await expectImages(inv);
    await expectPrices(inv);
    await expectLayoutLike(inv, await otherSession(users.standard), 'Danh sách');
    for (const key of ['za', 'lohi', 'hilo', 'az'] as const) {
      const t0 = Date.now();
      await inv.sortBy(key);
      await expect(inv.itemNames).toHaveText(names(sortOrders[key]), { timeout: 10_000 });
      await expect(inv.activeSort).toHaveText(sortLabels[key]);
      test.info().annotations.push({ type: 'thời gian sắp xếp (BUG-17)', description: `${sortLabels[key]}: ${Date.now() - t0} ms` });
    }
    // Bước 3: danh sách
    await inv.addButton(backpack).click();
    await expect(inv.cartButton(backpack)).toHaveText('Remove');
    await expect(inv.cartBadge).toHaveText('1');
    await inv.removeButton(backpack).click();
    await expect(inv.cartButton(backpack)).toHaveText('Add to cart');
    await expect(inv.cartBadge).toBeHidden();
    // Bước 4: mở chi tiết bằng cách bấm tên (ô "Mở đúng chi tiết" của ma trận)
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/inventory-item\.html\?id=4$/);
    await expect(detail.name).toHaveText(backpack.name);
    await detail.addButton.click();
    await expect(detail.removeButton).toBeVisible();
    await expect(detail.cartBadge).toHaveText('1');
    await detail.removeButton.click();
    await expect(detail.addButton).toBeVisible();
    await expect(detail.cartBadge).toBeHidden();
    // Bước 5: trang giỏ
    await detail.addButton.click();
    await detail.openCart();
    await expect(cart.itemNames).toHaveText([backpack.name]);
    await expect(cart.line(backpack).getByTestId('inventory-item-price')).toHaveText(priceText(backpack));
    await expect(cart.line(backpack).getByTestId('item-quantity')).toHaveText('1');
    await cart.removeButton(backpack).click();
    await expect(cart.items).toHaveCount(0);
    await expect(cart.cartBadge).toBeHidden();
    await evidence.shot('Giỏ sau khi Remove', { highlight: cart.cartList, note: 'performance_glitch_user: mọi thao tác thành công (thời gian sắp xếp ghi trong báo cáo)' });
  });

  test('TC-037 menu All Items về danh sách từ trang chi tiết và trang giỏ', { tag: ['@AC-5', '@AC-6', '@list', '@detail', '@cart'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible();
    await detail.openMenuItem(detail.allItemsLink);
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await cart.goto();
    await expect(cart.cartList).toBeVisible();
    await cart.openMenuItem(cart.allItemsLink);
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await evidence.shot('Sau khi bấm All Items', { highlight: inv.inventoryList, note: 'Về danh sách, đủ 6 sản phẩm' });
  });

  test('TC-038 giỏ giữ nguyên khi tải lại, chuyển trang, mở tab mới', { tag: ['@AC-7', '@list', '@detail', '@cart', '@smoke'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(bikeLight).click();
    // Bước 2: tải lại danh sách
    await page.reload();
    await expect(inv.inventoryList).toBeVisible();
    await expect(inv.cartBadge).toHaveText('2');
    await expect(inv.cartButton(backpack)).toHaveText('Remove');
    await expect(inv.cartButton(bikeLight)).toHaveText('Remove');
    // Bước 3: chi tiết Onesie, tải lại (server trả 404 nhưng trang vẫn đúng, O-28)
    await inv.nameLink(onesie).click();
    await expect(detail.backButton).toBeVisible();
    await page.reload();
    await expect(detail.backButton).toBeVisible();
    await expect(detail.cartBadge).toHaveText('2');
    await expect(detail.addButton).toBeVisible();
    // Bước 4: giỏ, tải lại
    await detail.openCart();
    await page.reload();
    await expect(cart.cartList).toBeVisible();
    await expect(cart.cartBadge).toHaveText('2');
    await expect(cart.itemNames).toHaveText([backpack.name, bikeLight.name]);
    await evidence.shot('Giỏ sau khi tải lại ở cả 3 trang', { highlight: [cart.cartList, cart.cartBadge], note: 'Giỏ vẫn 2 sản phẩm Backpack, Bike Light' });
    const tab = await page.context().newPage();
    await tab.goto('/inventory.html');
    await expect(new InventoryPage(tab).cartBadge).toHaveText('2');
  });

  test('TC-039 giỏ giữ nguyên sau khi đăng xuất rồi đăng nhập lại cùng tài khoản', { tag: ['@AC-7', '@list', '@cart'] }, async ({ loggedInPage: inv, loginAs, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(bikeLight).click();
    await inv.logout();
    const again = await loginAs(users.standard);
    await expect(again.cartBadge).toHaveText('2');
    await again.openCart();
    await expect(cart.itemNames).toHaveText([backpack.name, bikeLight.name]);
    await evidence.shot('Giỏ sau khi đăng nhập lại', { highlight: cart.cartList, note: 'Vẫn Backpack, Bike Light' });
  });

  test('TC-040 tài khoản khác không thấy, không sửa, không xóa được giỏ của người trước', { tag: ['@AC-7', '@list', '@cart', '@security', '@BUG-07'] }, async ({ page, loggedInPage: inv, loginAs, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-07: người đăng nhập sau thấy, sửa, xóa được giỏ của người trước');
    test.setTimeout(90_000);
    /** Back to a fresh state: logged out, empty cart (the cart lives in localStorage and survives logout). */
    const restart = async (app: InventoryPage | CartPage) => {
      await app.logout();
      await page.evaluate(() => localStorage.removeItem('cart-contents'));
    };
    // Biến thể 1 (đọc): standard_user → visual_user
    await inv.addButton(backpack).click();
    await inv.addButton(bikeLight).click();
    await inv.logout();
    const visual = await loginAs(users.visual);
    await expect.soft(visual.cartBadge, 'Biến thể 1: visual_user không được có số giỏ').toBeHidden(QUICK);
    await evidence.shot('Biến thể 1: visual_user vừa đăng nhập', { highlight: visual.cartLink, note: 'Mong đợi: giỏ trống (không có số), không thấy giỏ của standard_user' });
    await visual.openCart();
    await expect.soft(cart.items, 'Biến thể 1: giỏ của visual_user phải trống').toHaveCount(0, QUICK);
    await evidence.shot('Biến thể 1: giỏ của visual_user', { highlight: [cart.cartList, cart.cartLink], note: 'Mong đợi: giỏ trống, không có sản phẩm của standard_user' });
    await restart(cart);
    // Biến thể 2 (đọc, chiều ngược): visual_user → standard_user
    const visual2 = await loginAs(users.visual);
    await visual2.addButton(onesie).click();
    await visual2.logout();
    const standard2 = await loginAs(users.standard);
    await expect.soft(standard2.cartBadge, 'Biến thể 2: standard_user không được có số giỏ').toBeHidden(QUICK);
    await standard2.openCart();
    await expect.soft(cart.items, 'Biến thể 2: giỏ của standard_user phải trống').toHaveCount(0, QUICK);
    await evidence.shot('Biến thể 2: giỏ của standard_user', { highlight: [cart.cartList, cart.cartLink], note: 'Mong đợi: giỏ trống, không có Onesie của visual_user' });
    await restart(cart);
    // Biến thể 3 (ghi): visual_user sửa giỏ, standard_user đăng nhập lại
    const standard3 = await loginAs(users.standard);
    await standard3.addButton(backpack).click();
    await standard3.addButton(bikeLight).click();
    await standard3.logout();
    const visual3 = await loginAs(users.visual);
    if (await visual3.addButton(onesie).isVisible()) await visual3.addButton(onesie).click();
    await visual3.logout();
    const standard3b = await loginAs(users.standard);
    await expect.soft(standard3b.cartBadge, 'Biến thể 3: số giỏ của standard_user').toHaveText('2', QUICK);
    await standard3b.openCart();
    await expect.soft(cart.itemNames, 'Biến thể 3: giỏ của standard_user không bị người sau sửa').toHaveText([backpack.name, bikeLight.name], QUICK);
    await evidence.shot('Biến thể 3: giỏ của standard_user sau khi visual_user thêm Onesie', { highlight: [cart.cartList, cart.cartLink], note: 'Mong đợi: đúng 2 dòng Backpack, Bike Light, không có Onesie' });
    await restart(cart);
    // Biến thể 4 (xóa, review-defects A2): visual_user bỏ một món trong giỏ của standard_user
    const standard4 = await loginAs(users.standard);
    await standard4.addButton(backpack).click();
    await standard4.addButton(bikeLight).click();
    await standard4.logout();
    const visual4 = await loginAs(users.visual);
    if (await visual4.removeButton(backpack).isVisible()) await visual4.removeButton(backpack).click();
    await visual4.logout();
    const standard4b = await loginAs(users.standard);
    await expect.soft(standard4b.cartBadge, 'Biến thể 4: số giỏ của standard_user').toHaveText('2', QUICK);
    await standard4b.openCart();
    await expect.soft(cart.itemNames, 'Biến thể 4: giỏ của standard_user không bị người sau xóa').toHaveText([backpack.name, bikeLight.name], QUICK);
    await evidence.shot('Biến thể 4: giỏ của standard_user sau khi visual_user bỏ Backpack', { highlight: [cart.cartList, cart.cartLink], note: 'Mong đợi: vẫn đủ 2 dòng Backpack, Bike Light' });
  });

  test('TC-041 Reset App State cập nhật ngay ở danh sách, chi tiết, giỏ', { tag: ['@AC-3', '@AC-4', '@AC-7', '@list', '@detail', '@cart', '@BUG-05'] }, async ({ loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-05: Reset App State không cập nhật giao diện');
    // Danh sách
    await inv.addButton(backpack).click();
    await expect(inv.cartBadge).toHaveText('1');
    await inv.resetAppState();
    await inv.closeMenu();
    await expect.soft(inv.cartBadge, 'Danh sách: số giỏ').toBeHidden(QUICK);
    await expect.soft(inv.cartButton(backpack), 'Danh sách: nút Backpack').toHaveText('Add to cart', QUICK);
    await evidence.shot('Danh sách sau Reset', { highlight: [inv.cartButton(backpack), inv.cartLink], note: 'Mong đợi: không còn số giỏ, nút Backpack về Add to cart' });
    // Chi tiết (bắt đầu từ giỏ trống)
    await inv.setCartStorage('[]');
    await detail.goto(backpack.id);
    await expect(detail.backButton).toBeVisible();
    await detail.addButton.click();
    await expect(detail.cartBadge).toHaveText('1');
    await detail.resetAppState();
    await detail.closeMenu();
    await expect.soft(detail.cartBadge, 'Chi tiết: số giỏ').toBeHidden(QUICK);
    await expect.soft(detail.addButton, 'Chi tiết: nút Add to cart').toBeVisible(QUICK);
    await evidence.shot('Chi tiết sau Reset', { highlight: [detail.removeButton, detail.addButton, detail.cartLink], note: 'Mong đợi: không còn số giỏ, nút về Add to cart' });
    // Giỏ (bắt đầu từ giỏ trống, thêm ở danh sách)
    await inv.setCartStorage('[]');
    await inv.goto();
    await inv.addButton(backpack).click();
    await inv.openCart();
    await expect(cart.items).toHaveCount(1);
    await cart.resetAppState();
    await cart.closeMenu();
    await expect.soft(cart.cartBadge, 'Giỏ: số giỏ').toBeHidden(QUICK);
    await expect.soft(cart.items, 'Giỏ: số dòng').toHaveCount(0, QUICK);
    await evidence.shot('Giỏ sau Reset', { highlight: [cart.cartList, cart.cartLink], note: 'Mong đợi: giỏ trống, không còn số giỏ' });
  });

  test('TC-042 Back / Forward của trình duyệt sau khi đổi giỏ', { tag: ['@AC-4', '@AC-7', '@list', '@cart'] }, async ({ page, loggedInPage: inv, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.openCart();
    await cart.removeButton(backpack).click();
    await page.goBack();
    await expect(inv.inventoryList).toBeVisible();
    await expect(inv.cartButton(backpack)).toHaveText('Add to cart');
    await expect(inv.cartBadge).toBeHidden();
    await evidence.shot('Sau khi bấm Back', { highlight: inv.cartButton(backpack), note: 'Backpack là Add to cart, không có số giỏ' });
    await page.goForward();
    await expect(cart.cartList).toBeVisible();
    await expect(cart.items).toHaveCount(0);
  });

  test('TC-043 đăng xuất ở trang giỏ hoặc chi tiết rồi bấm Back không xem lại được', { tag: ['@AC-6', '@detail', '@cart', '@security'] }, async ({ page, loggedInPage: _inv, loginAs, productDetailPage: detail, cartPage: cart, evidence }) => {
    const loginPage = new LoginPage(page);
    await cart.goto();
    await expect(cart.cartList).toBeVisible();
    await cart.logout();
    await expect(page).toHaveURL(isLoginScreen);
    await page.goBack();
    await expect(page).toHaveURL(isLoginScreen);
    await expect(loginPage.errorMessage).toHaveText(MSG.notLoggedIn('/cart.html'));
    await expect(cart.cartList).toBeHidden();
    await evidence.shot('Back sau khi đăng xuất ở giỏ', { highlight: loginPage.errorMessage, note: "Ở trang đăng nhập: \"...'/cart.html' when you are logged in.\"" });
    await loginAs(users.standard);
    await detail.goto(backpack.id);
    await expect(detail.backButton).toBeVisible();
    await detail.logout();
    await expect(page).toHaveURL(isLoginScreen);
    await page.goBack();
    await expect(page).toHaveURL(isLoginScreen);
    await expect(loginPage.errorMessage).toHaveText(MSG.notLoggedIn('/inventory-item.html'));
    await expect(detail.backButton).toBeHidden();
    await evidence.shot('Back sau khi đăng xuất ở chi tiết', { highlight: loginPage.errorMessage, note: "Ở trang đăng nhập: \"...'/inventory-item.html' when you are logged in.\"" });
  });

  test('TC-044 hai tab: thay đổi giỏ ở tab này, tab kia thấy đúng', { tag: ['@AC-7', '@list', '@cart'] }, async ({ page, loggedInPage: inv, evidence }) => {
    const tabB = await page.context().newPage();
    const invB = new InventoryPage(tabB);
    const cartB = new CartPage(tabB);
    await invB.goto();
    await expect(invB.inventoryList).toBeVisible();
    await inv.addButton(backpack).click();
    await invB.openCart();
    await expect(cartB.cartBadge).toHaveText('1');
    await expect(cartB.itemNames).toHaveText([backpack.name]);
    await tabB.reload();
    await expect(cartB.cartList).toBeVisible();
    await expect(cartB.cartBadge).toHaveText('1');
    await expect(cartB.itemNames).toHaveText([backpack.name]);
    // Bước 5-6: tab B (cũ) ghi vào giỏ, tab A tải lại: không mất Backpack (không bị ghi đè)
    await cartB.continueShopping();
    await invB.addButton(onesie).click();
    await page.reload();
    await expect(inv.inventoryList).toBeVisible();
    await expect(inv.cartBadge).toHaveText('2');
    await expect(inv.cartButton(backpack)).toHaveText('Remove');
    await expect(inv.cartButton(onesie)).toHaveText('Remove');
    await evidence.shot('Tab A sau khi tab B thêm Onesie và tải lại', { highlight: [inv.cartBadge, inv.cartButton(backpack), inv.cartButton(onesie)], note: 'Số giỏ 2, Backpack và Onesie đều là Remove (tab B đã kiểm trong code)' });
  });

  test('TC-045 phiên giả mạo không vào được trang giỏ và trang chi tiết', { tag: ['@AC-5', '@AC-6', '@detail', '@cart', '@security', '@BUG-02'] }, async ({ page, context, baseURL, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-02 (biến thể): tự tạo cookie là vào được trang giỏ, chi tiết');
    const loginPage = new LoginPage(page);
    await context.addCookies([{ name: 'session-username', value: users.standard.username, url: baseURL! }]);
    for (const [path, shown] of [['/cart.html', '/cart.html'], ['/inventory-item.html?id=4', '/inventory-item.html']] as const) {
      await page.goto(path);
      await expect.soft(page, `${path}: phải về trang đăng nhập`).toHaveURL(isLoginScreen, QUICK);
      await expect.soft(loginPage.errorMessage, `${path}: thông báo`).toHaveText(MSG.notLoggedIn(shown), QUICK);
      await expect.soft(path === '/cart.html' ? cart.cartList : detail.backButton, `${path}: không được thấy nội dung`).toBeHidden(QUICK);
      await evidence.shot(`Mở ${shown} bằng cookie giả`, { note: 'Mong đợi: bị đưa về trang đăng nhập, không thấy nội dung' });
    }
  });
});

/**
 * TC-018 / TC-019: 24 checks (6 products × Add / Remove × list / detail).
 * Every variant starts from its own state (cart storage set, page reloaded), so one broken variant never blocks the next.
 */
async function checkAddRemoveAllProducts(inv: InventoryPage, detail: ProductDetailPage, evidence: Evidence) {
  /** Evidence only for variants that went wrong (a passing variant needs no screenshot). */
  const shotIfWrong = async (ok: boolean, name: string, highlight: Locator[], note: string) => {
    if (!ok) await evidence.shot(name, { highlight, note });
  };
  for (const p of allProducts) {
    // Danh sách: Add (giỏ trống)
    await inv.setCartStorage('[]');
    await inv.goto();
    await expect.soft(inv.addButton(p), `Danh sách, Add ${p.name}: có nút Add to cart`).toBeVisible(QUICK);
    if (await inv.addButton(p).isVisible()) await inv.addButton(p).click();
    await expect.soft(inv.cartButton(p), `Danh sách, Add ${p.name}: nút`).toHaveText('Remove', QUICK);
    await expect.soft(inv.cartBadge, `Danh sách, Add ${p.name}: số giỏ`).toHaveText('1', QUICK);
    await shotIfWrong(await inv.cartBadge.isVisible(), `Danh sách, bấm Add ${p.name}`, [inv.cartButton(p), inv.cartLink], `Mong đợi: nút ${p.name} thành Remove, giỏ hiện 1`);
    // Danh sách: Remove (giỏ chỉ có sản phẩm này)
    await inv.setCartStorage(`[${p.id}]`);
    await inv.goto();
    await expect.soft(inv.removeButton(p), `Danh sách, Remove ${p.name}: có nút Remove`).toBeVisible(QUICK);
    if (await inv.removeButton(p).isVisible()) await inv.removeButton(p).click();
    await expect.soft(inv.cartButton(p), `Danh sách, Remove ${p.name}: nút`).toHaveText('Add to cart', QUICK);
    await expect.soft(inv.cartBadge, `Danh sách, Remove ${p.name}: số giỏ`).toBeHidden(QUICK);
    await shotIfWrong(!(await inv.cartBadge.isVisible()), `Danh sách, bấm Remove ${p.name}`, [inv.cartButton(p), inv.cartLink], `Mong đợi: nút ${p.name} về Add to cart, giỏ không còn số`);
    // Chi tiết: Add (giỏ trống)
    await inv.setCartStorage('[]');
    await detail.goto(p.id);
    await expect(detail.backButton).toBeVisible();
    await expect.soft(detail.addButton, `Chi tiết, Add ${p.name}: có nút Add to cart`).toBeVisible(QUICK);
    if (await detail.addButton.isVisible()) await detail.addButton.click();
    await expect.soft(detail.removeButton, `Chi tiết, Add ${p.name}: nút`).toBeVisible(QUICK);
    await expect.soft(detail.cartBadge, `Chi tiết, Add ${p.name}: số giỏ`).toHaveText('1', QUICK);
    await shotIfWrong(await detail.cartBadge.isVisible(), `Chi tiết, bấm Add ${p.name}`, [detail.addButton, detail.removeButton, detail.cartLink], 'Mong đợi: nút thành Remove, giỏ hiện 1');
    // Chi tiết: Remove (giỏ chỉ có sản phẩm này)
    await inv.setCartStorage(`[${p.id}]`);
    await detail.goto(p.id);
    await expect(detail.backButton).toBeVisible();
    await expect.soft(detail.removeButton, `Chi tiết, Remove ${p.name}: có nút Remove`).toBeVisible(QUICK);
    if (await detail.removeButton.isVisible()) await detail.removeButton.click();
    await expect.soft(detail.addButton, `Chi tiết, Remove ${p.name}: nút`).toBeVisible(QUICK);
    await expect.soft(detail.cartBadge, `Chi tiết, Remove ${p.name}: số giỏ`).toBeHidden(QUICK);
    await shotIfWrong(!(await detail.cartBadge.isVisible()), `Chi tiết, bấm Remove ${p.name}`, [detail.addButton, detail.removeButton, detail.cartLink], 'Mong đợi: nút về Add to cart, giỏ không còn số');
  }
}
