/**
 * Independent reproduction of the SD-102 bugs (step "bug-reporter", after HITL #3).
 * NOT part of the test suite: own locators (id / CSS class, not the Page Objects), fresh browser context per scenario,
 * every scenario run TWICE and compared. Output: qa-runs/saucedemo-products-cart-screen/evidence/bugs/<ticket>_<BUG>/manual/
 *   npm run repro -- saucedemo-products-cart-screen   (helpers: ./repro-kit.ts)
 * Red boxes are drawn by the script on the elements that show the bug.
 */
import { test, type Page } from '@playwright/test';
import { reproKit, type Row, type Ctx } from './repro-kit';

const PW = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

async function login(page: Page, user: string) {
  await page.goto('/');
  await page.fill('#user-name', user);
  await page.fill('#password', PW);
  await page.click('#login-button');
  await page.locator('.inventory_list').waitFor({ timeout: 15_000 });
}
async function logout(page: Page) {
  await page.click('#react-burger-menu-btn');
  await page.click('#logout_sidebar_link');
  await page.locator('#login-button').waitFor();
}
const text = async (page: Page, css: string) => ((await page.locator(css).first().textContent()) ?? '').trim();
const count = (page: Page, css: string) => page.locator(css).count();
const badge = async (page: Page) => ((await count(page, '.shopping_cart_badge')) ? await text(page, '.shopping_cart_badge') : '(không có)');
const names = (page: Page) => page.locator('.cart_item .inventory_item_name').allTextContents();
const search = (page: Page) => new URL(page.url()).search;

/** Screenshot with red boxes on every element matching `css` (only on the run that keeps evidence). */
const { shot, reproduce } = reproKit('saucedemo-products-cart-screen', 'tests/repro/saucedemo-products-cart-screen.repro.ts');

test.describe.configure({ mode: 'parallel' });

test('BUG-02 variant', async ({ browser }) => {
  await reproduce(browser, 'BUG-02', 'Biến thể SD-102: cookie tự tạo vào được trang giỏ và trang chi tiết', async (open) => {
    const rows: Row[] = [];
    for (const [url, file] of [['/cart.html', '01-cookie-gia-mo-gio.png'], ['/inventory-item.html?id=4', '02-cookie-gia-mo-chi-tiet.png']]) {
      const c = await open(true);
      await c.page.goto('/');
      await c.page.evaluate(() => (document.cookie = 'session-username=standard_user'));
      await c.page.goto(url);
      await c.page.locator('.cart_list, .inventory_details, #login-button').first().waitFor();
      const where = new URL(c.page.url()).pathname;
      rows.push({ action: `Trang đăng nhập, Console: \`document.cookie = "session-username=standard_user"\`, mở \`${url}\``, result: `Ở \`${where}\`, ${where === '/' ? 'bị đưa về trang đăng nhập' : 'thấy nội dung, không có thông báo đăng nhập'}`, shot: await shot(c, file, '.cart_list, .inventory_details') });
    }
    return rows;
  }, 'cookie tự tạo vào được cả `/cart.html` và `/inventory-item.html?id=4`, giống BUG-02 ở `/inventory.html` (SD-101).');
});

test('BUG-05', async ({ browser }) => {
  const reset = async (page: Page) => {
    await page.click('#react-burger-menu-btn');
    await page.click('#reset_sidebar_link');
    await page.click('#react-burger-cross-btn');
    await page.locator('#reset_sidebar_link').waitFor({ state: 'hidden' });
  };
  await reproduce(browser, 'BUG-05', 'Reset App State xóa giỏ nhưng giao diện không cập nhật', async (open) => {
    const rows: Row[] = [];
    let c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await reset(c.page);
    rows.push({ action: 'Danh sách: thêm Backpack, menu ☰ → **Reset App State**', result: `Số giỏ: ${await badge(c.page)}; nút Backpack vẫn là \`${await text(c.page, '.inventory_item:first-child .btn_inventory')}\``, shot: await shot(c, '01-danh-sach-sau-reset.png', '.inventory_item:first-child .btn_inventory, .shopping_cart_link') });
    c = await open(true); await login(c.page, 'standard_user');
    await c.page.goto('/inventory-item.html?id=4'); await c.page.locator('#back-to-products').waitFor();
    await c.page.click('.btn_inventory'); await reset(c.page);
    rows.push({ action: 'Chi tiết Backpack (`?id=4`): bấm Add to cart, Reset App State', result: `Số giỏ: ${await badge(c.page)}; nút vẫn là \`${await text(c.page, '.btn_inventory')}\``, shot: await shot(c, '02-chi-tiet-sau-reset.png', '.btn_inventory, .shopping_cart_link') });
    c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
    await reset(c.page);
    rows.push({ action: 'Danh sách: thêm Backpack, mở giỏ, Reset App State', result: `Số giỏ: ${await badge(c.page)}; giỏ vẫn hiện ${await count(c.page, '.cart_item')} dòng`, shot: await shot(c, '03-gio-sau-reset.png', '.cart_item, .shopping_cart_link') });
    await c.page.reload(); await c.page.locator('.cart_list').waitFor();
    rows.push({ action: 'Tải lại trang giỏ', result: `Giỏ còn ${await count(c.page, '.cart_item')} dòng (dữ liệu đã xóa, chỉ giao diện chưa cập nhật)` });
    return rows;
  }, 'ở cả 3 trang, số trên giỏ mất nhưng nút / dòng giỏ vẫn như cũ cho tới khi tải lại trang.');
});

test('BUG-06', async ({ browser }) => {
  await reproduce(browser, 'BUG-06', 'Giỏ không kiểm tra dữ liệu: thêm được sản phẩm không tồn tại, hiện dữ liệu trùng, số giỏ sai', async (open) => {
    const rows: Row[] = [];
    for (const id of [99, 6, -1]) {
      const c = await open(true); await login(c.page, 'standard_user');
      await c.page.goto(`/inventory-item.html?id=${id}`); await c.page.locator('#back-to-products').waitFor();
      const name = await text(c.page, '.inventory_details_name'); const btns = await count(c.page, '.btn_inventory');
      if (btns) await c.page.click('.btn_inventory');
      rows.push({ action: `Mở \`/inventory-item.html?id=${id}\`, bấm Add to cart (nếu có)`, result: `Tên \`${name}\`; ${btns ? 'CÓ nút Add to cart' : 'không có nút'}; sau khi bấm số giỏ: ${await badge(c.page)}`, shot: await shot(c, `0${rows.length + 1}-id-${id < 0 ? 'am-1' : id}-bam-add.png`, '.inventory_details_name, .shopping_cart_link') });
      if (id === 99) {
        await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
        rows.push({ action: 'Mở giỏ (sau id=99)', result: `Số giỏ ${await badge(c.page)} nhưng giỏ có ${await count(c.page, '.cart_item')} dòng`, shot: await shot(c, `0${rows.length + 1}-gio-sau-id-99.png`, '.cart_list, .shopping_cart_link') });
      }
    }
    for (const [raw, label] of [['[4,4]', 'trung-id'], ['[4,"x"]', 'id-la']]) {
      const c = await open(true); await login(c.page, 'standard_user');
      await c.page.evaluate((v) => localStorage.setItem('cart-contents', v), raw);
      await c.page.goto('/cart.html'); await c.page.locator('.cart_list').waitFor();
      const qty = await c.page.locator('.cart_quantity').allTextContents();
      rows.push({ action: `Console: \`localStorage.setItem("cart-contents",'${raw}')\`, mở giỏ`, result: `Số giỏ ${await badge(c.page)}; ${await count(c.page, '.cart_item')} dòng (${(await names(c.page)).join(', ')}), số lượng: ${qty.join(', ')}`, shot: await shot(c, `0${rows.length + 1}-du-lieu-${label}.png`, '.cart_item, .shopping_cart_link') });
    }
    return rows;
  }, 'trang sản phẩm không tồn tại vẫn có nút Add to cart, bấm vào thì số giỏ tăng mà giỏ trống; dữ liệu trùng `[4,4]` hiện 2 dòng cùng sản phẩm, số giỏ 2 (mong đợi theo Q2 bổ sung: 1 dòng, số giỏ 1); dữ liệu `[4,"x"]` số giỏ 2 nhưng chỉ 1 dòng.');
});

test('BUG-07', async ({ browser }) => {
  await reproduce(browser, 'BUG-07', 'Giỏ không gắn với tài khoản: người sau thấy, sửa, xóa được giỏ người trước', async (open) => {
    const rows: Row[] = [];
    let c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('#add-to-cart-sauce-labs-bike-light'); await logout(c.page);
    await login(c.page, 'visual_user'); await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
    rows.push({ action: '1. Đọc: `standard_user` thêm Backpack, Bike Light, đăng xuất; `visual_user` đăng nhập, mở giỏ', result: `Giỏ của \`visual_user\`: ${(await names(c.page)).join(', ') || '(trống)'}`, shot: await shot(c, '01-nguoi-sau-thay-gio.png', '.cart_item, .shopping_cart_link') });
    c = await open(true); await login(c.page, 'visual_user');
    await c.page.click('#add-to-cart-sauce-labs-onesie'); await logout(c.page);
    await login(c.page, 'standard_user'); await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
    rows.push({ action: '2. Đọc, chiều ngược: `visual_user` thêm Onesie, đăng xuất; `standard_user` đăng nhập, mở giỏ', result: `Giỏ của \`standard_user\`: ${(await names(c.page)).join(', ') || '(trống)'}`, shot: await shot(c, '02-chieu-nguoc.png', '.cart_item, .shopping_cart_link') });
    c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('#add-to-cart-sauce-labs-bike-light'); await logout(c.page);
    await login(c.page, 'visual_user'); await c.page.click('#add-to-cart-sauce-labs-onesie'); await logout(c.page);
    await login(c.page, 'standard_user'); await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
    rows.push({ action: '3. Ghi: `standard_user` thêm Backpack, Bike Light; `visual_user` thêm Onesie; `standard_user` đăng nhập lại, mở giỏ', result: `Giỏ của \`standard_user\`: ${(await names(c.page)).join(', ')} (số giỏ ${await badge(c.page)})`, shot: await shot(c, '03-nguoi-sau-sua-gio.png', '.cart_item:last-child, .shopping_cart_link') });
    c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('#add-to-cart-sauce-labs-bike-light'); await logout(c.page);
    await login(c.page, 'visual_user'); await c.page.click('#remove-sauce-labs-backpack'); await logout(c.page);
    await login(c.page, 'standard_user'); await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
    rows.push({ action: '4. Xóa: `standard_user` thêm Backpack, Bike Light; `visual_user` bỏ Backpack; `standard_user` đăng nhập lại, mở giỏ', result: `Giỏ của \`standard_user\`: ${(await names(c.page)).join(', ')} (số giỏ ${await badge(c.page)})`, shot: await shot(c, '04-nguoi-sau-xoa-gio.png', '.cart_list, .shopping_cart_link') });
    return rows;
  }, 'người đăng nhập sau thấy giỏ của người trước (cả 2 chiều), thêm được hàng vào và bỏ được hàng khỏi giỏ đó; người trước đăng nhập lại thấy giỏ đã bị đổi.');
});

test('BUG-08 BUG-15', async ({ browser }) => {
  for (const [bug, user, file] of [['BUG-08', 'problem_user', '01-anh-problem-user.png'], ['BUG-15', 'visual_user', '01-anh-visual-user.png']]) {
    await reproduce(browser, bug, bug === 'BUG-08' ? '`problem_user`: cả 6 ảnh sản phẩm là ảnh lỗi' : '`visual_user`: ảnh Backpack là ảnh lỗi', async (open) => {
      const c = await open(true); await login(c.page, user);
      const srcs = await c.page.locator('.inventory_item_img img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src.split('/').pop() ?? ''));
      const bad = srcs.filter((s) => s.startsWith('sl-404')).length;
      return [{ action: `Đăng nhập \`${user}\`, xem ảnh 6 sản phẩm`, result: `${bad}/6 ảnh là \`sl-404\` (ảnh lỗi)`, shot: await shot(c, file, '.inventory_item_img img[src*="sl-404"]') }];
    }, bug === 'BUG-08' ? 'cả 6 ảnh là ảnh lỗi `sl-404` (`standard_user`: 0/6).' : 'ảnh Backpack là ảnh lỗi `sl-404`, 5 ảnh còn lại đúng.');
  }
});

test('BUG-09 BUG-12', async ({ browser }) => {
  for (const [bug, user] of [['BUG-09', 'problem_user'], ['BUG-12', 'error_user']]) {
    await reproduce(browser, bug, bug === 'BUG-09' ? '`problem_user`: sắp xếp không hoạt động' : '`error_user`: sắp xếp báo lỗi, danh sách không đổi', async (open) => {
      const rows: Row[] = [];
      for (const [value, label] of [['za', 'Name (Z to A)'], ['lohi', 'Price (low to high)'], ['hilo', 'Price (high to low)']]) {
        const c = await open(true); await login(c.page, user);
        const dialogs: string[] = []; c.page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
        await c.page.selectOption('.product_sort_container', value);
        if (bug === 'BUG-12') await c.page.waitForEvent('dialog', { timeout: 2_000 }).catch(() => {});
        rows.push({ action: `Đăng nhập \`${user}\`, chọn **${label}**`, result: `Nhãn dropdown \`${await text(c.page, '.active_option')}\`; đứng đầu \`${await text(c.page, '.inventory_item_name')}\`${dialogs.length ? `; hộp thoại: \`${dialogs[0]}\`` : '; không có thông báo'}`, shot: await shot(c, `0${rows.length + 1}-chon-${value}.png`, '.active_option, .inventory_item:first-child .inventory_item_name') });
      }
      return rows;
    }, bug === 'BUG-09' ? 'cả 3 kiểu sắp xếp: nhãn vẫn `Name (A to Z)`, Sauce Labs Backpack vẫn đứng đầu, không có thông báo.' : 'cả 3 kiểu: hiện hộp thoại lỗi của trình duyệt (MSG-01), nhãn và thứ tự không đổi. Ảnh không thấy hộp thoại (hộp thoại của trình duyệt), nội dung ghi ở cột kết quả.');
  }
});

test('BUG-10 BUG-13', async ({ browser }) => {
  for (const [bug, user] of [['BUG-10', 'problem_user'], ['BUG-13', 'error_user']]) {
    await reproduce(browser, bug, `\`${user}\`: Add / Remove không có tác dụng với 3 + 3 sản phẩm`, async (open) => {
      const rows: Row[] = [];
      const jsErr = (errs: string[]) => (errs.length ? `; lỗi JavaScript: \`${errs.at(-1)}\`` : '');
      let c = await open(true); await login(c.page, user);
      let errs: string[] = []; c.page.on('pageerror', (e) => errs.push(e.message));
      await c.page.click('#add-to-cart-sauce-labs-bolt-t-shirt');
      await c.page.waitForEvent('pageerror', { timeout: 1_500 }).catch(() => {});
      rows.push({ action: 'Danh sách: bấm Add to cart ở Bolt T-Shirt', result: `Nút: \`${await text(c.page, '.inventory_item:has-text("Bolt T-Shirt") .btn_inventory')}\`; số giỏ: ${await badge(c.page)}${jsErr(errs)}`, shot: await shot(c, '01-danh-sach-add-bolt.png', '.inventory_item:has-text("Bolt T-Shirt") .btn_inventory, .shopping_cart_link') });
      c = await open(true); await login(c.page, user);
      errs = []; c.page.on('pageerror', (e) => errs.push(e.message));
      await c.page.evaluate(() => localStorage.setItem('cart-contents', '[4]')); await c.page.reload(); await c.page.locator('.inventory_list').waitFor();
      await c.page.click('#remove-sauce-labs-backpack');
      await c.page.waitForEvent('pageerror', { timeout: 1_500 }).catch(() => {});
      rows.push({ action: 'Giỏ có sẵn Backpack; danh sách: bấm Remove ở Backpack', result: `Nút: \`${await text(c.page, '.inventory_item:first-child .btn_inventory')}\`; số giỏ: ${await badge(c.page)}${jsErr(errs)}`, shot: await shot(c, '02-danh-sach-remove-backpack.png', '.inventory_item:first-child .btn_inventory, .shopping_cart_link') });
      c = await open(true); await login(c.page, user);
      errs = []; c.page.on('pageerror', (e) => errs.push(e.message));
      await c.page.goto('/inventory-item.html?id=5'); await c.page.locator('#back-to-products').waitFor();
      await c.page.click('.btn_inventory');
      await c.page.waitForEvent('pageerror', { timeout: 1_500 }).catch(() => {});
      rows.push({ action: 'Chi tiết Fleece Jacket (`?id=5`): bấm Add to cart', result: `Nút: \`${await text(c.page, '.btn_inventory')}\`; số giỏ: ${await badge(c.page)}${jsErr(errs)}`, shot: await shot(c, '03-chi-tiet-add-fleece.png', '.btn_inventory, .shopping_cart_link') });
      c = await open(true); await login(c.page, user);
      await c.page.evaluate(() => localStorage.setItem('cart-contents', '[4]')); await c.page.goto('/cart.html'); await c.page.locator('.cart_list').waitFor();
      await c.page.click('#remove-sauce-labs-backpack');
      rows.push({ action: 'Đối chứng: giỏ có Backpack, bấm Remove **ở trang giỏ**', result: `Giỏ còn ${await count(c.page, '.cart_item')} dòng; số giỏ: ${await badge(c.page)} (đúng)` });
      return rows;
    }, `Add không ăn với Bolt T-Shirt, Fleece Jacket, Red T-Shirt; Remove không ăn với Backpack, Bike Light, Onesie, ở danh sách và chi tiết (thử đại diện; đủ 24 điểm ở test tự động). Bỏ ở trang giỏ thì được.${bug === 'BUG-13' ? ' Mỗi lần không ăn, trang ném lỗi JavaScript (MSG-05 / MSG-06).' : ''}`);
  }
});

test('BUG-11', async ({ browser }) => {
  await reproduce(browser, 'BUG-11', '`problem_user`: bấm sản phẩm mở trang chi tiết của sản phẩm có id + 1', async (open) => {
    const rows: Row[] = [];
    let c = await open(true); await login(c.page, 'problem_user');
    await c.page.click('[data-test="item-4-title-link"]'); await c.page.locator('#back-to-products').waitFor();
    rows.push({ action: 'Danh sách: bấm **tên** Sauce Labs Backpack (id 4)', result: `Mở \`${search(c.page)}\`: \`${await text(c.page, '.inventory_details_name')}\``, shot: await shot(c, '01-bam-ten-backpack.png', '.inventory_details_name') });
    c = await open(true); await login(c.page, 'problem_user');
    await c.page.click('[data-test="item-5-img-link"]'); await c.page.locator('#back-to-products').waitFor();
    rows.push({ action: 'Danh sách: bấm **ảnh** Fleece Jacket (id 5)', result: `Mở \`${search(c.page)}\`: \`${await text(c.page, '.inventory_details_name')}\``, shot: await shot(c, '02-bam-anh-fleece.png', '.inventory_details_name') });
    c = await open(true); await login(c.page, 'problem_user');
    await c.page.evaluate(() => localStorage.setItem('cart-contents', '[0]')); await c.page.goto('/cart.html'); await c.page.locator('.cart_list').waitFor();
    await c.page.click('.cart_item .inventory_item_name'); await c.page.locator('#back-to-products').waitFor();
    rows.push({ action: 'Giỏ chỉ có Bike Light (id 0): bấm **tên** trong giỏ', result: `Mở \`${search(c.page)}\`: \`${await text(c.page, '.inventory_details_name')}\``, shot: await shot(c, '03-gio-bam-ten-bike-light.png', '.inventory_details_name') });
    return rows;
  }, 'mỗi lần bấm mở sản phẩm có id lớn hơn **đúng 1 đơn vị** (id + 1); Fleece Jacket (id 5) mở id 6 không tồn tại. Xảy ra ở danh sách (tên, ảnh) và trang giỏ.');
});

test('BUG-14', async ({ browser }) => {
  await reproduce(browser, 'BUG-14', '`visual_user`: giá ở danh sách sai và đổi mỗi lần tải', async (open) => {
    const rows: Row[] = [];
    const c = await open(true); await login(c.page, 'visual_user');
    for (const i of [1, 2]) {
      if (i === 2) { await c.page.reload(); await c.page.locator('.inventory_list').waitFor(); }
      const prices = await c.page.locator('.inventory_item_price').allTextContents();
      rows.push({ action: i === 1 ? 'Đăng nhập `visual_user`, xem giá' : 'Tải lại trang (F5)', result: `Giá: ${prices.join(', ')} (đúng: $29.99, $9.99, $15.99, $49.99, $7.99, $15.99)`, shot: await shot(c, `0${i}-gia-lan-${i}.png`, '.inventory_item_price') });
    }
    await c.page.click('[data-test="item-4-title-link"]'); await c.page.locator('#back-to-products').waitFor();
    rows.push({ action: 'Bấm tên Backpack mở chi tiết', result: `Giá ở chi tiết: \`${await text(c.page, '.inventory_details_price')}\``, shot: await shot(c, '03-gia-chi-tiet.png', '.inventory_details_price') });
    await c.page.click('.btn_inventory'); await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
    rows.push({ action: 'Bấm Add to cart, mở giỏ', result: `Giá ở giỏ: \`${await text(c.page, '.inventory_item_price')}\``, shot: await shot(c, '04-gia-gio.png', '.inventory_item_price') });
    return rows;
  }, 'giá ở danh sách sai và khác nhau giữa 2 lần tải; giá ở trang chi tiết và giỏ đúng.', true);
});

test('BUG-16 BUG-18', async ({ browser }) => {
  const measure = async (open: (s: boolean) => Promise<Ctx>, user: string, url: string) => {
    const c = await open(true); await login(c.page, user);
    if (url !== '/inventory.html') { await c.page.evaluate(() => localStorage.setItem('cart-contents', '[4]')); await c.page.goto(url); await c.page.locator('.cart_list').waitFor(); }
    // Measure on the final layout: images loaded and web fonts applied (an early read gave y=392 instead of 412)
    await c.page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
    await c.page.evaluate(() => document.fonts.ready);
    return c;
  };
  await reproduce(browser, 'BUG-16', '`visual_user`: biểu tượng giỏ, menu lệch và bị xoay', async (open) => {
    const rows: Row[] = [];
    for (const user of ['standard_user', 'visual_user']) {
      const c = await measure(open, user, '/inventory.html');
      const b = await c.page.locator('.shopping_cart_container').boundingBox();
      const tf = await c.page.locator('.shopping_cart_container').evaluate((e) => getComputedStyle(e).transform);
      rows.push({ action: `\`${user}\`: danh sách, đo biểu tượng giỏ (DevTools Console: \`document.querySelector('.shopping_cart_container').getBoundingClientRect()\`, \`getComputedStyle(…).transform\`)`, result: `x=${Math.round(b!.x)}, y=${Math.round(b!.y)}, transform \`${tf}\``, shot: await shot(c, `0${rows.length + 1}-${user}.png`, '.shopping_cart_container, .bm-burger-button') });
    }
    return rows;
  }, 'biểu tượng giỏ của `visual_user` lệch vị trí và bị xoay (transform khác `none`). Test tự động đo thêm biểu tượng menu, nút Add, ở cả 3 trang.');
  await reproduce(browser, 'BUG-18', '`visual_user`: nút Checkout bị đẩy lên vùng tiêu đề', async (open) => {
    const rows: Row[] = [];
    for (const user of ['standard_user', 'visual_user']) {
      const c = await measure(open, user, '/cart.html');
      const co = await c.page.locator('#checkout').boundingBox(); const cs = await c.page.locator('#continue-shopping').boundingBox();
      rows.push({ action: `\`${user}\`: giỏ có Backpack, đo nút Checkout và Continue Shopping (\`getBoundingClientRect().y\`)`, result: `Checkout y=${Math.round(co!.y)}, Continue Shopping y=${Math.round(cs!.y)} (lệch ${Math.round(Math.abs(co!.y - cs!.y))} px)`, shot: await shot(c, `0${rows.length + 1}-${user}.png`, '#checkout, #continue-shopping') });
    }
    return rows;
  }, 'ở `visual_user`, nút Checkout không cùng hàng với Continue Shopping mà nằm ở vùng tiêu đề phía trên.');
});

test('BUG-19', async ({ browser }) => {
  await reproduce(browser, 'BUG-19', 'Giỏ trống vẫn sang được bước thanh toán', async (open) => {
    const rows: Row[] = [];
    const c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('.shopping_cart_link'); await c.page.locator('.cart_list').waitFor();
    rows.push({ action: 'Giỏ trống, mở giỏ', result: `${await count(c.page, '.cart_item')} dòng; nút Checkout ${(await c.page.locator('#checkout').isEnabled()) ? 'bấm được' : 'bị khóa'}`, shot: await shot(c, '01-gio-trong.png', '#checkout') });
    await c.page.click('#checkout'); await c.page.locator('.checkout_info').waitFor();
    rows.push({ action: 'Bấm Checkout', result: `Sang \`${new URL(c.page.url()).pathname}\`, tiêu đề \`${await text(c.page, '.title')}\``, shot: await shot(c, '02-sau-khi-bam-checkout.png', '.title, .checkout_info') });
    return rows;
  }, 'giỏ trống vẫn bấm Checkout và sang bước nhập thông tin thanh toán.');
});

test('BUG-20', async ({ browser }) => {
  await reproduce(browser, 'BUG-20', 'id sai định dạng vẫn mở sản phẩm', async (open) => {
    const rows: Row[] = [];
    const c = await open(true); await login(c.page, 'standard_user');
    for (const [raw, file] of [['4abc', '01-id-4abc.png'], ['-0', '02-id-tru-0.png'], ['abc', '']]) {
      await c.page.goto(`/inventory-item.html?id=${raw}`); await c.page.locator('#back-to-products').waitFor();
      rows.push({ action: raw === 'abc' ? 'Đối chứng: mở `?id=abc`' : `Mở \`/inventory-item.html?id=${raw}\``, result: raw === 'abc' ? `Hiện \`${await text(c.page, '.inventory_details_name')}\` (đúng)` : `Hiện sản phẩm \`${await text(c.page, '.inventory_details_name')}\``, shot: file ? await shot(c, file, '.inventory_details_name') : undefined });
    }
    return rows;
  }, 'id sai định dạng được đọc như số (`4abc` → 4, `-0` → 0) nên mở sản phẩm thay vì báo không tìm thấy. Test tự động thử đủ 10 giá trị.');
});

test('BUG-21', async ({ browser }) => {
  await reproduce(browser, 'BUG-21', '`error_user`: trang chi tiết mất mô tả sản phẩm, console báo lỗi render, trang gửi báo lỗi ra ngoài', async (open) => {
    const rows: Row[] = [];
    for (const user of ['error_user', 'standard_user']) {
      const c = await open(true); await login(c.page, user);
      const errors: string[] = []; const reports: string[] = [];
      c.page.on('console', (m) => { if (m.type() === 'error' && !/Permissions policy|Failed to load resource/.test(m.text())) errors.push(m.text().split('\n')[0]); });
      c.page.on('request', (r) => { if (new URL(r.url()).host === 'submit.backtrace.io') reports.push('submit.backtrace.io'); });
      await c.page.click('[data-test="item-4-title-link"]'); await c.page.locator('#back-to-products').waitFor();
      await c.page.waitForEvent('console', { predicate: (m) => m.type() === 'error' && !/Permissions policy|Failed to load resource/.test(m.text()), timeout: 2_000 }).catch(() => {});
      const desc = (await count(c.page, '.inventory_details_desc')) ? `có mô tả "${(await text(c.page, '.inventory_details_desc')).slice(0, 25)}…"` : '**KHÔNG có mô tả**';
      rows.push({ action: `\`${user}\`: bấm tên Backpack mở chi tiết, xem trang, tab Console và tab Network (DevTools)`, result: `Trang: tên \`${await text(c.page, '.inventory_details_name')}\`, ${desc}; console: ${errors.length ? `\`${errors[0]}\`` : 'không có lỗi'}; request báo lỗi: ${reports.length ? reports.join(', ') : 'không có'}`, shot: await shot(c, `0${rows.length + 1}-${user}.png`, user === 'error_user' ? '.inventory_details_name, .inventory_details_price' : '.inventory_details_desc') });
    }
    return rows;
  }, '`error_user` mở trang chi tiết: **mất phần mô tả sản phẩm** (phần bị lỗi render), console báo `Error: This component failed to render!` và có 1 request báo lỗi tới `submit.backtrace.io`; `standard_user` (đối chứng) có mô tả, không lỗi.');
});
