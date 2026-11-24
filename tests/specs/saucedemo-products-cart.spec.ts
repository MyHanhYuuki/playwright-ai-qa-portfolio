/**
 * SD-102: Products list, product detail, cart (SauceDemo)
 * Test cases: qa-runs/saucedemo-products-cart/test-cases.csv (45 TC, approved at HITL #2)
 * Known bugs: qa-runs/saucedemo-products-cart/known-issues.md (BUG-05 → BUG-20 + BUG-02 variant, expected to FAIL)
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
import { MSG } from '../data/messages';
import { products, allProducts, sortOrders, sortLabels, priceText, type Product } from '../data/products';

const { backpack, bikeLight, boltTShirt, onesie, redTShirt } = products;
/** Timeout for a soft check of a UI state that changes right after a click (bug variants). */
const QUICK = { timeout: 2_000 };
const CHECKOUT_TITLE = 'Checkout: Your Information';
const NOT_FOUND = 'ITEM NOT FOUND';
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
/** Detail page shows product p (waits for an element unique to the detail page first). */
async function expectDetailOf(page: Page, detail: ProductDetailPage, p: Product, label = p.name) {
  await expect(detail.backButton).toBeVisible();
  await expect.soft(page, `${label}: URL`).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${p.id}$`), QUICK);
  await expect.soft(detail.name, `${label}: tên`).toHaveText(p.name, QUICK);
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
  await cart.continueShoppingButton.click();
  await expect(inv.items.first()).toBeVisible();
  await inv.addButton(backpack).click();
  await inv.openCart();
  await cart.checkoutButton.click();
  await expect.soft(cart.title).toHaveText(CHECKOUT_TITLE);
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
    await expect(inv.itemNames).toHaveText(names(sortOrders.az));
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
      if (key === 'za') await evidence.shot('Đã chọn Name (Z to A)', { highlight: inv.activeSort, note: 'Mong đợi: dropdown "Name (Z to A)", Test.allTheThings() đứng đầu' });
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
    }
    await evidence.shot('Sau khi chọn sắp xếp', { highlight: inv.activeSort, note: 'Mong đợi: dropdown đổi theo kiểu đã chọn, không có hộp thoại lỗi' });
  });

  test('TC-013 visual_user: giá ở danh sách đúng và khớp trang chi tiết, giỏ', { tag: ['@AC-1', '@list', '@detail', '@cart', '@BUG-14'] }, async ({ page, loginAs, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-14: visual_user thấy giá sai, đổi ngẫu nhiên ở danh sách');
    const inv = await loginAs(users.visual);
    await evidence.shot('Giá ở danh sách (visual_user)', { highlight: inv.itemPrices, note: 'Mong đợi: giá đúng TD-06 (Backpack $29.99, Bike Light $9.99…)' });
    await expectPrices(inv);
    const listPrice = await inv.item(backpack).getByTestId('inventory-item-price').textContent();
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible();
    await expect.soft(detail.price, 'giá ở chi tiết').toHaveText(priceText(backpack));
    await detail.addButton.click();
    await detail.openCart();
    await expect(cart.cartList).toBeVisible();
    await expect.soft(cart.line(backpack).getByTestId('inventory-item-price'), 'giá ở giỏ').toHaveText(priceText(backpack));
    expect.soft(listPrice, 'giá ở danh sách = giá ở chi tiết, giỏ').toBe(priceText(backpack));
    void page;
  });

  test('TC-014 sắp xếp khi giỏ có hàng: nút Remove đi theo đúng sản phẩm', { tag: ['@AC-2', '@AC-3', '@list'] }, async ({ loggedInPage: inv, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(onesie).click();
    await inv.sortBy('hilo');
    await expect(inv.itemNames).toHaveText(names(sortOrders.hilo));
    await expect(inv.removeButton(backpack)).toBeVisible();
    await expect(inv.removeButton(onesie)).toBeVisible();
    await expect(inv.items.getByRole('button', { name: 'Remove' })).toHaveCount(2);
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

  test('TC-035 visual_user: bố cục giống standard_user ở cả 3 màn hình', { tag: ['@AC-1', '@AC-3', '@list', '@detail', '@cart', '@BUG-16'] }, async ({ page, loginAs, otherSession, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-16: visual_user lệch / xoay biểu tượng giỏ, menu, nút Add');
    const inv = await loginAs(users.visual);
    const base = await otherSession(users.standard);
    const baseInv = new InventoryPage(base);
    await evidence.shot('Danh sách (visual_user)', { highlight: [inv.cartIcon, inv.menuIcon, inv.cartButton(redTShirt)], note: 'Mong đợi: biểu tượng giỏ, menu, nút Add như standard_user, không xoay, không lệch' });
    await expectLayoutLike(inv, base, 'Danh sách');
    const [a, b] = [await box(inv.cartButton(redTShirt)), await box(baseInv.cartButton(redTShirt))];
    expect.soft(Math.abs(a.x - b.x), 'Danh sách: nút Add của Red T-Shirt lệch ngang (px)').toBeLessThanOrEqual(5);
    await detail.goto(backpack.id);
    await base.goto('/inventory-item.html?id=4');
    await expect(detail.backButton).toBeVisible();
    await expectLayoutLike(detail, base, 'Chi tiết');
    await cart.goto();
    await base.goto('/cart.html');
    await expect(cart.cartList).toBeVisible();
    await expectLayoutLike(cart, base, 'Giỏ');
    void page;
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
      if (p === backpack) await evidence.shot('Chi tiết Backpack', { highlight: [detail.name, detail.price, detail.image], note: 'Tên, giá, mô tả, ảnh khớp danh sách; có Add to cart và Back to products' });
      await detail.backButton.click();
      await expect(inv.items.first()).toBeVisible();
    }
  });

  test('TC-021 mở chi tiết bằng ảnh và bằng phím Enter', { tag: ['@AC-5', '@list', '@detail'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, evidence }) => {
    await inv.imageLink(bikeLight).click();
    await expectDetailOf(page, detail, bikeLight);
    await evidence.shot('Mở bằng ảnh', { highlight: detail.name, note: 'Bấm ảnh Bike Light mở đúng chi tiết Bike Light (id=0)' });
    await detail.backButton.click();
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
    await detail.backButton.click();
    await expect(inv.cartButton(backpack)).toHaveText('Remove');
    await inv.nameLink(backpack).click();
    await expect(detail.backButton).toBeVisible();
    await detail.removeButton.click();
    await expect(detail.addButton).toBeVisible();
    await expect(detail.cartBadge).toBeHidden();
    await detail.backButton.click();
    await expect(inv.cartButton(backpack)).toHaveText('Add to cart');
    await evidence.shot('Danh sách sau khi bỏ ở chi tiết', { highlight: inv.cartButton(backpack), note: 'Backpack ở danh sách về Add to cart' });
  });

  test('TC-023 quay lại danh sách bằng nút và bằng Back của trình duyệt', { tag: ['@AC-5', '@list', '@detail'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, evidence }) => {
    await inv.nameLink(backpack).click();
    await detail.backButton.click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await inv.nameLink(bikeLight).click();
    await expect(detail.backButton).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await evidence.shot('Sau khi bấm Back', { highlight: inv.inventoryList, note: 'Về danh sách, đủ 6 sản phẩm' });
  });

  test('TC-024 problem_user: bấm tên hoặc ảnh mở đúng trang chi tiết', { tag: ['@AC-5', '@list', '@detail', '@BUG-11'] }, async ({ page, loginAs, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-11: problem_user bấm sản phẩm mở sai trang chi tiết');
    const inv = await loginAs(users.problem);
    for (const p of allProducts) {
      for (const how of ['tên', 'ảnh'] as const) {
        await inv.goto();
        await (how === 'tên' ? inv.nameLink(p) : inv.imageLink(p)).click();
        await expectDetailOf(page, detail, p, `${p.name} (bấm ${how})`);
        if (p === backpack && how === 'tên') await evidence.shot('Bấm tên Backpack', { highlight: detail.name, note: 'Mong đợi: chi tiết Sauce Labs Backpack (id=4)' });
      }
    }
  });

  test('TC-025 số trên giỏ luôn bằng số sản phẩm thật', { tag: ['@AC-3', '@AC-5', '@AC-6', '@detail', '@cart', '@BUG-06'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-06: sản phẩm không tồn tại / dữ liệu giỏ sai làm số giỏ lệch giỏ thật');
    for (const id of [6, 99, -1]) {
      await inv.setCartStorage('[]');
      await detail.goto(id);
      await expect(detail.backButton).toBeVisible();
      await expect.soft(detail.name, `id=${id}: tên`).toHaveText(NOT_FOUND, QUICK);
      if (id === 99) await evidence.shot('Sản phẩm id=99', { highlight: [detail.name, detail.addButton], note: 'Mong đợi: báo không tìm thấy và KHÔNG có nút Add to cart' });
      await expect.soft(detail.addButton, `id=${id}: không được có nút Add to cart`).toHaveCount(0, QUICK);
      if (await detail.addButton.isVisible()) await detail.addButton.click();
      await expect.soft(detail.cartBadge, `id=${id}: không được có số giỏ`).toBeHidden(QUICK);
    }
    for (const [raw, label] of [['[4,4]', 'trùng id'], ['[4,"x"]', 'id lạ']] as const) {
      await inv.setCartStorage(raw);
      await cart.goto();
      await expect(cart.cartList).toBeVisible();
      await expect.soft(cart.cartBadge, `${label}: số giỏ`).toHaveText('1', QUICK);
      await expect.soft(cart.items, `${label}: số dòng trong giỏ`).toHaveCount(1, QUICK);
    }
    void page;
  });

  test('TC-026 id sai định dạng xử lý như sản phẩm không tồn tại', { tag: ['@AC-5', '@detail', '@BUG-20'] }, async ({ loggedInPage: _inv, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-20: id sai định dạng (4abc, 04, 4.9, 0x4) vẫn mở Backpack');
    for (const raw of ['abc', '', '4abc', '04', '4.9', '0x4']) {
      await detail.goto(raw);
      await expect(detail.backButton).toBeVisible();
      if (raw === '4abc') await evidence.shot('id=4abc', { highlight: detail.name, note: 'Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào' });
      await expect.soft(detail.name, `id=${raw || '(rỗng)'}`).toHaveText(NOT_FOUND, QUICK);
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
    await cart.continueShoppingButton.click();
    await expect(inv.cartButton(backpack)).toHaveText('Add to cart');
  });

  test('TC-029 điều hướng từ trang giỏ', { tag: ['@AC-6', '@cart'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.openCart();
    await cart.line(backpack).getByTestId('inventory-item-name').click();
    await expectDetailOf(page, detail, backpack);
    await cart.goto();
    await cart.continueShoppingButton.click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(inv.items).toHaveCount(6);
    await cart.goto();
    await cart.checkoutButton.click();
    await expect(page).toHaveURL(/checkout-step-one\.html$/);
    await expect(cart.title).toHaveText(CHECKOUT_TITLE);
    await evidence.shot('Sau khi bấm Checkout', { highlight: cart.title, note: 'Sang bước thanh toán "Checkout: Your Information"' });
  });

  test('TC-030 giỏ trống không sang được bước thanh toán', { tag: ['@AC-6', '@cart', '@BUG-19'] }, async ({ page, loggedInPage: _inv, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-19: giỏ trống vẫn bấm Checkout sang bước thanh toán');
    await cart.goto();
    await expect(cart.cartList).toBeVisible();
    await expect(cart.items).toHaveCount(0);
    await evidence.shot('Giỏ trống', { highlight: cart.checkoutButton, note: 'Mong đợi: nút Checkout bị khóa, hoặc bấm vào vẫn ở trang giỏ' });
    if (await cart.checkoutButton.isEnabled()) await cart.checkoutButton.click();
    await expect.soft(page, 'vẫn ở trang giỏ').toHaveURL(/cart\.html$/, QUICK);
    await expect.soft(cart.title, 'không sang bước thanh toán').not.toHaveText(CHECKOUT_TITLE, QUICK);
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
  test('TC-018 problem_user: thêm và bỏ được cả 6 sản phẩm ở danh sách và chi tiết', { tag: ['@AC-3', '@AC-4', '@AC-5', '@list', '@detail', '@BUG-10'] }, async ({ loginAs, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-10: problem_user không thêm / bỏ được 3 sản phẩm');
    test.setTimeout(120_000);
    await checkAddRemoveAllProducts(await loginAs(users.problem), detail, evidence);
  });

  test('TC-019 error_user: thêm và bỏ được cả 6 sản phẩm ở danh sách và chi tiết', { tag: ['@AC-3', '@AC-4', '@AC-5', '@list', '@detail', '@BUG-13'] }, async ({ loginAs, productDetailPage: detail, evidence }) => {
    test.fail(true, 'BUG-13: error_user không thêm / bỏ được 3 sản phẩm');
    test.setTimeout(120_000);
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
      await inv.nameLink(p).click();
      await expectDetailOf(page, detail, p);
      await inv.goto();
    }
    await expectCartFlow(page, inv, cart);
    await evidence.shot('Bước thanh toán', { highlight: cart.title, note: 'error_user: ảnh, giá, chi tiết, giỏ đều đúng' });
  });

  test('TC-033 visual_user: các thao tác không lỗi vẫn đúng (sắp theo tên, thêm / bỏ, mở chi tiết, trang giỏ)', { tag: ['@AC-3', '@AC-4', '@AC-5', '@AC-6', '@list', '@detail', '@cart'] }, async ({ page, loginAs, productDetailPage: detail, cartPage: cart, evidence }) => {
    const inv = await loginAs(users.visual);
    await inv.sortBy('za');
    await expect.soft(inv.itemNames).toHaveText(names(sortOrders.za));
    await inv.sortBy('az');
    await expect.soft(inv.itemNames).toHaveText(names(sortOrders.az));
    for (const [i, p] of sortOrders.az.entries()) {
      await inv.addButton(p).click();
      await expect.soft(inv.cartBadge).toHaveText(String(i + 1));
    }
    for (const p of sortOrders.az) await inv.removeButton(p).click();
    await expect.soft(inv.cartBadge).toBeHidden();
    await detail.goto(backpack.id);
    await detail.addButton.click();
    await expect.soft(detail.cartBadge).toHaveText('1');
    await detail.removeButton.click();
    await expect.soft(detail.cartBadge).toBeHidden();
    for (const p of allProducts) {
      await inv.goto();
      await inv.nameLink(p).click();
      await expectDetailOf(page, detail, p);
      await expect.soft(detail.price).toHaveText(priceText(p));
    }
    await inv.goto();
    await expectCartFlow(page, inv, cart);
    await evidence.shot('Bước thanh toán', { highlight: cart.title, note: 'visual_user: sắp theo tên, thêm / bỏ, chi tiết, giỏ đều đúng' });
  });

  test('TC-034 performance_glitch_user: mọi thao tác thành công (không đánh fail theo thời gian)', { tag: ['@AC-1', '@AC-2', '@AC-3', '@AC-5', '@AC-6', '@list', '@detail', '@cart'] }, async ({ loginAs, otherSession, productDetailPage: detail, cartPage: cart, evidence }) => {
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
      test.info().annotations.push({ type: 'thời gian sắp xếp (BUG-17)', description: `${sortLabels[key]}: ${Date.now() - t0} ms` });
    }
    await inv.addButton(backpack).click();
    await expect(inv.cartBadge).toHaveText('1');
    await inv.removeButton(backpack).click();
    await expect(inv.cartBadge).toBeHidden();
    await detail.goto(backpack.id);
    await detail.addButton.click();
    await expect(detail.cartBadge).toHaveText('1');
    await detail.removeButton.click();
    await expect(detail.cartBadge).toBeHidden();
    await detail.addButton.click();
    await detail.openCart();
    await cart.removeButton(backpack).click();
    await expect(cart.items).toHaveCount(0);
    await evidence.shot('Giỏ sau khi Remove', { highlight: cart.cartList, note: 'performance_glitch_user: mọi thao tác thành công (thời gian sắp xếp ghi trong báo cáo)' });
  });

  test('TC-037 menu All Items về danh sách từ trang chi tiết và trang giỏ', { tag: ['@AC-5', '@AC-6', '@detail', '@cart'] }, async ({ page, loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
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

  test('TC-038 giỏ giữ nguyên khi tải lại, chuyển trang, mở tab mới', { tag: ['@AC-7', '@list', '@detail', '@cart', '@smoke'] }, async ({ page, loggedInPage: inv, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.addButton(bikeLight).click();
    await page.reload();
    await expect(inv.cartBadge).toHaveText('2');
    await inv.nameLink(onesie).click();
    await expect(page.getByRole('button', { name: 'Back to products' })).toBeVisible();
    await expect(inv.cartBadge).toHaveText('2');
    await inv.openCart();
    await expect(cart.itemNames).toHaveText([backpack.name, bikeLight.name]);
    await evidence.shot('Giỏ sau khi tải lại, chuyển trang', { highlight: [cart.cartList, cart.cartBadge], note: 'Giỏ vẫn 2 sản phẩm Backpack, Bike Light' });
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

  test('TC-040 tài khoản khác không thấy giỏ của người trước', { tag: ['@AC-7', '@list', '@cart', '@security', '@BUG-07'] }, async ({ loggedInPage: inv, loginAs, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-07: người đăng nhập sau thấy giỏ của người trước');
    await inv.addButton(backpack).click();
    await inv.addButton(bikeLight).click();
    await inv.logout();
    const other = await loginAs(users.visual);
    await evidence.shot('visual_user vừa đăng nhập', { highlight: other.cartLink, note: 'Mong đợi: giỏ trống (không có số), không thấy giỏ của standard_user' });
    await expect.soft(other.cartBadge, 'không được có số giỏ').toBeHidden(QUICK);
    await other.openCart();
    await expect.soft(cart.items, 'giỏ phải trống').toHaveCount(0, QUICK);
  });

  test('TC-041 Reset App State cập nhật ngay ở danh sách, chi tiết, giỏ', { tag: ['@AC-3', '@AC-4', '@AC-7', '@list', '@detail', '@cart', '@BUG-05'] }, async ({ loggedInPage: inv, productDetailPage: detail, cartPage: cart, evidence }) => {
    test.fail(true, 'BUG-05: Reset App State không cập nhật giao diện');
    // Danh sách
    await inv.addButton(backpack).click();
    await inv.resetAppState();
    await evidence.shot('Danh sách sau Reset', { highlight: [inv.cartButton(backpack), inv.cartLink], note: 'Mong đợi: không còn số giỏ, nút Backpack về Add to cart' });
    await expect.soft(inv.cartBadge, 'Danh sách: số giỏ').toBeHidden(QUICK);
    await expect.soft(inv.cartButton(backpack), 'Danh sách: nút Backpack').toHaveText('Add to cart', QUICK);
    // Chi tiết (bắt đầu từ giỏ trống)
    await inv.setCartStorage('[]');
    await detail.goto(backpack.id);
    await detail.addButton.click();
    await detail.resetAppState();
    await expect.soft(detail.cartBadge, 'Chi tiết: số giỏ').toBeHidden(QUICK);
    await expect.soft(detail.addButton, 'Chi tiết: nút Add to cart').toBeVisible(QUICK);
    // Giỏ (bắt đầu từ giỏ trống, thêm ở danh sách)
    await inv.setCartStorage('[]');
    await inv.goto();
    await inv.addButton(backpack).click();
    await inv.openCart();
    await expect(cart.items).toHaveCount(1);
    await cart.resetAppState();
    await expect.soft(cart.cartBadge, 'Giỏ: số giỏ').toBeHidden(QUICK);
    await expect.soft(cart.items, 'Giỏ: số dòng').toHaveCount(0, QUICK);
  });

  test('TC-042 Back / Forward của trình duyệt sau khi đổi giỏ', { tag: ['@AC-4', '@AC-7', '@list', '@cart'] }, async ({ page, loggedInPage: inv, cartPage: cart, evidence }) => {
    await inv.addButton(backpack).click();
    await inv.openCart();
    await cart.removeButton(backpack).click();
    await page.goBack();
    await expect(inv.items.first()).toBeVisible();
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
    await evidence.shot('Back sau khi đăng xuất ở giỏ', { highlight: loginPage.errorMessage, note: "Ở trang đăng nhập: \"...'/cart.html' when you are logged in.\"" });
    await loginAs(users.standard);
    await detail.goto(backpack.id);
    await expect(detail.backButton).toBeVisible();
    await detail.logout();
    await expect(page).toHaveURL(isLoginScreen);
    await page.goBack();
    await expect(page).toHaveURL(isLoginScreen);
    await expect(loginPage.errorMessage).toHaveText(MSG.notLoggedIn('/inventory-item.html'));
  });

  test('TC-044 hai tab: thay đổi giỏ ở tab này, tab kia thấy đúng', { tag: ['@AC-7', '@list', '@cart'] }, async ({ page, loggedInPage: inv, evidence }) => {
    const tabB = await page.context().newPage();
    const invB = new InventoryPage(tabB);
    const cartB = new CartPage(tabB);
    await invB.goto();
    await expect(invB.items.first()).toBeVisible();
    await inv.addButton(backpack).click();
    await invB.openCart();
    await expect(cartB.cartBadge).toHaveText('1');
    await expect(cartB.itemNames).toHaveText([backpack.name]);
    await tabB.reload();
    await expect(cartB.cartBadge).toHaveText('1');
    await expect(cartB.itemNames).toHaveText([backpack.name]);
    await evidence.shot('Tab A sau khi thêm', { highlight: inv.cartBadge, note: 'Tab A đã thêm Backpack; tab B mở giỏ thấy Backpack (kiểm trong code)' });
  });

  test('TC-045 phiên giả mạo không vào được trang giỏ và trang chi tiết', { tag: ['@AC-5', '@AC-6', '@detail', '@cart', '@security', '@BUG-02'] }, async ({ page, context, baseURL, evidence }) => {
    test.fail(true, 'BUG-02 (biến thể): tự tạo cookie là vào được trang giỏ, chi tiết');
    const loginPage = new LoginPage(page);
    await context.addCookies([{ name: 'session-username', value: users.standard.username, url: baseURL! }]);
    for (const [path, shown] of [['/cart.html', '/cart.html'], ['/inventory-item.html?id=4', '/inventory-item.html']] as const) {
      await page.goto(path);
      await page.waitForLoadState('load');
      if (path === '/cart.html') await evidence.shot('Mở /cart.html bằng cookie giả', { note: 'Mong đợi: bị đưa về trang đăng nhập' });
      await expect.soft(page, `${path}: phải về trang đăng nhập`).toHaveURL(isLoginScreen, QUICK);
      await expect.soft(loginPage.errorMessage, `${path}: thông báo`).toHaveText(MSG.notLoggedIn(shown), QUICK);
    }
  });
});

/**
 * TC-018 / TC-019: 24 checks (6 products × Add / Remove × list / detail).
 * Every variant starts from its own state (cart storage set, page reloaded), so one broken variant never blocks the next.
 */
async function checkAddRemoveAllProducts(inv: InventoryPage, detail: ProductDetailPage, evidence: { shot: (n: string, o?: object) => Promise<void> }) {
  let shot = false;
  for (const p of allProducts) {
    // Danh sách: Add (giỏ trống)
    await inv.setCartStorage('[]');
    await inv.goto();
    await inv.addButton(p).click();
    await expect.soft(inv.cartButton(p), `Danh sách, Add ${p.name}: nút`).toHaveText('Remove', QUICK);
    await expect.soft(inv.cartBadge, `Danh sách, Add ${p.name}: số giỏ`).toHaveText('1', QUICK);
    if (!shot && !(await inv.cartBadge.isVisible())) {
      shot = true;
      await evidence.shot(`Bấm Add ${p.name}`, { highlight: [inv.cartButton(p), inv.cartLink], note: `Mong đợi: nút ${p.name} thành Remove, giỏ hiện 1` });
    }
    // Danh sách: Remove (giỏ chỉ có sản phẩm này)
    await inv.setCartStorage(`[${p.id}]`);
    await inv.goto();
    await expect.soft(inv.removeButton(p), `Danh sách, Remove ${p.name}: có nút Remove`).toBeVisible(QUICK);
    if (await inv.removeButton(p).isVisible()) await inv.removeButton(p).click();
    await expect.soft(inv.cartButton(p), `Danh sách, Remove ${p.name}: nút`).toHaveText('Add to cart', QUICK);
    await expect.soft(inv.cartBadge, `Danh sách, Remove ${p.name}: số giỏ`).toBeHidden(QUICK);
    // Chi tiết: Add (giỏ trống)
    await inv.setCartStorage('[]');
    await detail.goto(p.id);
    await expect(detail.backButton).toBeVisible();
    await detail.addButton.click();
    await expect.soft(detail.removeButton, `Chi tiết, Add ${p.name}: nút`).toBeVisible(QUICK);
    await expect.soft(detail.cartBadge, `Chi tiết, Add ${p.name}: số giỏ`).toHaveText('1', QUICK);
    // Chi tiết: Remove (giỏ chỉ có sản phẩm này)
    await inv.setCartStorage(`[${p.id}]`);
    await detail.goto(p.id);
    await expect(detail.backButton).toBeVisible();
    await expect.soft(detail.removeButton, `Chi tiết, Remove ${p.name}: có nút Remove`).toBeVisible(QUICK);
    if (await detail.removeButton.isVisible()) await detail.removeButton.click();
    await expect.soft(detail.addButton, `Chi tiết, Remove ${p.name}: nút`).toBeVisible(QUICK);
    await expect.soft(detail.cartBadge, `Chi tiết, Remove ${p.name}: số giỏ`).toBeHidden(QUICK);
  }
}
