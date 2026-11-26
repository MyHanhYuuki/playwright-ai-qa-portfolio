/**
 * Independent reproduction of the SD-103 bugs (step "bug-reporter", after HITL #3).
 * NOT part of the test suite: own locators (id / CSS class, not the Page Objects), fresh browser context per scenario,
 * every scenario run TWICE and compared. Output: qa-runs/saucedemo-checkout-screen/evidence/bugs/<ticket>_<BUG>/manual/
 *   npm run repro -- saucedemo-checkout-screen   (helpers: ./repro-kit.ts)
 * Red boxes are drawn by the script on the elements that show the bug.
 * Result texts never contain times, file names or paths, so the 2 runs can be compared word for word.
 */
import { test, type Page } from '@playwright/test';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { reproKit, type Row, type Ctx } from './repro-kit';
import { users } from '../data/users';
import { allProducts } from '../data/products';

const { shot, reproduce } = reproKit('saucedemo-checkout-screen', 'tests/repro/saucedemo-checkout-screen.repro.ts');
/** Screenshot (viewport 1280×720) after scrolling the last boxed element into view: money lines sit below the fold. */
async function snap(c: Ctx, file: string, css = '') {
  if (c.shots && css && (await c.page.locator(css).count())) await c.page.locator(css).last().scrollIntoViewIfNeeded();
  return shot(c, file, css);
}

// ---------- helpers (own locators: id / CSS class) ----------
async function login(page: Page, user: string) {
  await page.goto('/');
  await page.fill('#user-name', user);
  await page.fill('#password', users.standard.password); // public demo password, from tests/data/users.ts (SAUCE_PASSWORD overrides)
  await page.click('#login-button');
  await page.locator('.inventory_list').waitFor({ timeout: 15_000 });
}
async function logout(page: Page) {
  await page.click('#react-burger-menu-btn');
  await page.click('#logout_sidebar_link');
  await page.locator('#login-button').waitFor();
}
async function resetAppState(page: Page) {
  await page.click('#react-burger-menu-btn');
  await page.click('#reset_sidebar_link');
  await page.click('#react-burger-cross-btn');
  await page.locator('#reset_sidebar_link').waitFor({ state: 'hidden' });
}
const setCart = (page: Page, raw: string) => page.evaluate((v) => localStorage.setItem('cart-contents', v), raw);
const cartKey = async (page: Page) => (await page.evaluate(() => localStorage.getItem('cart-contents'))) ?? '(không có khóa)';
const text = async (page: Page, css: string) => ((await page.locator(css).first().textContent()) ?? '').trim();
const count = (page: Page, css: string) => page.locator(css).count();
const badge = async (page: Page) => ((await count(page, '.shopping_cart_badge')) ? await text(page, '.shopping_cart_badge') : '(không có)');
const where = (page: Page) => new URL(page.url()).pathname;
const names = (page: Page) => page.locator('.cart_item .inventory_item_name').allTextContents();
/** true when `css` becomes visible within `timeout` (used for "must NOT appear" checks too). */
const appears = (page: Page, css: string, timeout = 3_000) => page.locator(css).first().waitFor({ state: 'visible', timeout }).then(() => true, () => false);
const yes = (b: boolean) => (b ? 'CÓ' : 'không');
/** Wait (max `ms`) until a counter collected by an event listener reaches its value. */
async function until(cond: () => boolean, ms = 4_000) {
  const end = Date.now() + ms;
  while (!cond() && Date.now() < end) await new Promise((r) => setTimeout(r, 100));
}

async function toInfo(page: Page) {
  await page.goto('/cart.html');
  await page.locator('.cart_list').waitFor();
  await page.click('#checkout');
  await page.locator('#first-name').waitFor();
}
async function fillInfo(page: Page, first: string, last: string, zip: string) {
  await page.fill('#first-name', first);
  await page.fill('#last-name', last);
  await page.fill('#postal-code', zip);
}
async function toOverview(page: Page, first = 'An', last = 'Le', zip = '70000') {
  await toInfo(page);
  await fillInfo(page, first, last, zip);
  await page.click('#continue');
  await page.locator('#finish').waitFor();
}
const totals = async (page: Page) => `\`${await text(page, '.summary_subtotal_label')}\`, \`${await text(page, '.summary_tax_label')}\`, \`${await text(page, '.summary_total_label')}\``;
/** Click Finish; true when "Thank you for your order!" shows within 5 s. */
async function finish(page: Page) {
  await page.click('#finish');
  return appears(page, '.complete-header', 5_000);
}

/** Text pieces of the PDF receipt: FlateDecode streams, each text = hex array of a TJ operator (own reader, not tests/utils). */
function pdfPieces(buf: Buffer) {
  const raw = buf.toString('latin1');
  const out: string[] = [];
  for (const m of raw.matchAll(/stream\r?\n/g)) {
    const start = m.index! + m[0].length;
    const end = raw.indexOf('endstream', start);
    let content = '';
    try { content = zlib.inflateSync(buf.subarray(start, end)).toString('latin1'); } catch { continue; }
    for (const t of content.matchAll(/\[(.*?)\]\s*TJ/gs)) out.push([...t[1].matchAll(/<([0-9a-fA-F]*)>/g)].map((h) => Buffer.from(h[1], 'hex').toString('latin1')).join(''));
  }
  return out;
}
/** Bấm Generate PDF order, đọc file: phần SHIP TO, sản phẩm, 3 số tiền (không lấy ngày giờ, tên file). */
async function receipt(page: Page) {
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#generate-pdf-order')]);
  const t = pdfPieces(fs.readFileSync((await download.path())!)).filter((s) => s !== '$');
  const between = (a: string, b: string) => (t.includes(a) ? t.slice(t.indexOf(a) + 1, t.indexOf(b)) : null);
  const ship = between('SHIP TO', 'ITEMS');
  const items = between('PRICE', 'Item total') ?? [];
  const at = (k: string) => t[t.indexOf(k) + 1];
  return `PDF: ${ship === null ? '**không có `SHIP TO`**' : `SHIP TO ${ship.map((s) => s.trim()).filter(Boolean).join(' / ') ? `\`${ship.map((s) => s.trim()).filter(Boolean).join(' / ')}\`` : `**không có chữ** (${ship.length} đoạn, chỉ khoảng trắng)`}`}; sản phẩm ${items.filter((_, i) => i % 2 === 0).join(', ') || '(không có)'}; Item total ${at('Item total')}, Tax ${at('Tax')}, Total ${at('Total')}`;
}
/** Collect uncaught JavaScript errors and error reports sent to submit.backtrace.io. */
function watchErrors(page: Page) {
  const errs: string[] = [];
  const reports: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('request', (r) => { if (new URL(r.url()).host === 'submit.backtrace.io') reports.push(r.url()); });
  return { errs, reports };
}

test.describe.configure({ mode: 'parallel' });

// ============ Chung ============

test('BUG-24', async ({ browser }) => {
  await reproduce(browser, 'BUG-24', 'Đặt được đơn không có sản phẩm (Tổng quan rỗng vẫn Finish được)', async (open) => {
    const rows: Row[] = [];
    let c = await open(true); await login(c.page, 'standard_user');
    await toOverview(c.page);
    rows.push({ action: 'Đường 1: giỏ trống, mở giỏ, bấm Checkout (BUG-19 cho bấm), nhập `An` / `Le` / `70000`, Continue', result: `Tổng quan ${await count(c.page, '.cart_item')} dòng sản phẩm; ${await totals(c.page)}; nút Finish: ${yes(await c.page.locator('#finish').isVisible())}` });
    rows.push({ action: 'Bấm Finish', result: `Ở \`${where(c.page)}\`, "Thank you for your order!": ${yes(await finish(c.page))}`, shot: await snap(c, '01-duong-1-gio-trong-finish.png', '.complete-header') });
    c = await open(true); await login(c.page, 'standard_user');
    await c.page.goto('/checkout-step-two.html'); await c.page.locator('#finish').waitFor();
    const lines2 = await count(c.page, '.cart_item'); const t2 = await totals(c.page);
    rows.push({ action: 'Đường 2: giỏ trống, mở thẳng `/checkout-step-two.html`, bấm Finish', result: `Tổng quan ${lines2} dòng, ${t2}; sau Finish "Thank you for your order!": ${yes(await finish(c.page))}`, shot: await snap(c, '02-duong-2-mo-thang-finish.png', '.complete-header') });
    c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('#add-to-cart-sauce-labs-onesie');
    await toOverview(c.page);
    const first = await finish(c.page);
    await c.page.goBack(); await c.page.locator('#finish').waitFor({ timeout: 5_000 }).catch(() => {});
    rows.push({ action: 'Đường 3: thêm Backpack, Onesie, đi tới Tổng quan, Finish (đơn 1), bấm **Back** của trình duyệt', result: `Đơn 1 "Thank you…": ${yes(first)}; Back về \`${where(c.page)}\`, ${await count(c.page, '.cart_item')} dòng, ${await totals(c.page)}, nút Finish: ${yes(await c.page.locator('#finish').isVisible())}`, shot: await snap(c, '03-duong-3-back-ve-tong-quan-rong.png', '.cart_list, .summary_info, #finish') });
    rows.push({ action: 'Bấm Finish lần 2', result: `"Thank you for your order!" lần 2: ${yes(await finish(c.page))}`, shot: await snap(c, '04-duong-3-finish-lan-2.png', '.complete-header') });
    return rows;
  }, 'cả 3 đường đều tới Tổng quan **0 dòng sản phẩm** (`Item total: $0`, `Tax: $0.00`, `Total: $0.00`), bấm Finish vẫn hiện "Thank you for your order!": đặt được đơn rỗng.');
});

test('BUG-35', async ({ browser }) => {
  test.setTimeout(300_000);
  await reproduce(browser, 'BUG-35', 'Finish tạo đơn từ Tổng quan đã cũ, không kiểm giỏ / phiên hiện tại', async (open) => {
    const rows: Row[] = [];
    /** Tab 1 at Overview with cart built from the list (ids by button id), tab 2 = new tab of the same session. */
    const start = async (buttons: string[]) => {
      const c = await open(true); await login(c.page, 'standard_user');
      for (const b of buttons) await c.page.click(`#add-to-cart-sauce-labs-${b}`);
      await toOverview(c.page);
      const tab2 = await c.page.context().newPage();
      return { c, tab2, c2: { ...c, page: tab2 } as Ctx };
    };
    // (1) 2 tabs
    let s = await start(['backpack', 'onesie']);
    await toOverview(s.tab2);
    const ok1 = await finish(s.c.page);
    rows.push({ action: '(1) 2 tab: giỏ Backpack + Onesie; tab 1 và tab 2 cùng đi tới Tổng quan (`An` / `Le` / `70000`); Finish ở **tab 1**', result: `Tab 1 "Thank you…": ${yes(ok1)}; \`cart-contents\` sau đó: ${await cartKey(s.c.page)}; tab 2 vẫn hiện ${await count(s.tab2, '.cart_item')} dòng, ${await totals(s.tab2)}` });
    const ok1b = await finish(s.tab2);
    rows.push({ action: 'Bấm Finish ở **tab 2** (giỏ đã trống)', result: `Tab 2 "Thank you…" (đơn thứ 2): ${yes(ok1b)}; ${ok1b ? await receipt(s.tab2) : ''}`, shot: await snap(s.c2, '01-hai-tab-finish-tab-2.png', '.complete-header') });
    // (2) after Reset App State
    s = await start(['backpack', 'onesie']);
    await resetAppState(s.c.page);
    const before2 = await cartKey(s.c.page); const lines2 = await count(s.c.page, '.cart_item');
    const ok2 = await finish(s.c.page);
    rows.push({ action: '(2) Giỏ Backpack + Onesie, ở Tổng quan: ☰ → **Reset App State**, đóng menu, bấm Finish', result: `Trước Finish: \`cart-contents\` ${before2}, trang vẫn ${lines2} dòng (BUG-05); "Thank you…": ${yes(ok2)}; ${ok2 ? await receipt(s.c.page) : ''}`, shot: await snap(s.c, '02-sau-reset-van-dat-duoc.png', '.complete-header') });
    // (4) cart gets one more item in another tab
    s = await start(['backpack']);
    await s.tab2.goto('/inventory.html'); await s.tab2.locator('.inventory_list').waitFor();
    await s.tab2.click('#add-to-cart-sauce-labs-onesie');
    const before4 = await cartKey(s.c.page);
    const ok4 = await finish(s.c.page);
    rows.push({ action: '(4) Tab 1: giỏ Backpack, đi tới Tổng quan; tab 2: danh sách, **thêm Onesie**; bấm Finish ở tab 1', result: `\`cart-contents\` trước Finish: ${before4}; "Thank you…": ${yes(ok4)}; ${ok4 ? await receipt(s.c.page) : ''}; \`cart-contents\` sau Finish: ${await cartKey(s.c.page)}`, shot: await snap(s.c, '03-gio-them-o-tab-khac.png', '.complete-header, .shopping_cart_link') });
    // (5) cart loses one item in another tab
    s = await start(['backpack', 'onesie']);
    await s.tab2.goto('/cart.html'); await s.tab2.locator('.cart_list').waitFor();
    await s.tab2.click('#remove-sauce-labs-onesie');
    const before5 = await cartKey(s.c.page);
    const ok5 = await finish(s.c.page);
    rows.push({ action: '(5) Tab 1: giỏ Backpack + Onesie, đi tới Tổng quan; tab 2: trang giỏ, **bỏ Onesie**; bấm Finish ở tab 1', result: `\`cart-contents\` trước Finish: ${before5}; "Thank you…": ${yes(ok5)}; ${ok5 ? await receipt(s.c.page) : ''}`, shot: await snap(s.c, '04-gio-bo-o-tab-khac.png', '.complete-header') });
    // (6) logout in another tab
    for (const button of ['#finish', '#cancel']) {
      s = await start(['backpack', 'onesie']);
      await s.tab2.goto('/inventory.html'); await s.tab2.locator('.inventory_list').waitFor();
      await logout(s.tab2);
      const before6 = await cartKey(s.c.page);
      await s.c.page.click(button);
      await s.c.page.locator('#login-button, .complete-header, .inventory_list').first().waitFor();
      const msg = (await count(s.c.page, '.error-message-container h3')) ? `, thông báo \`${await text(s.c.page, '.error-message-container h3')}\`` : '';
      rows.push({
        action: button === '#finish' ? '(6) Tab 1: giỏ Backpack + Onesie, đi tới Tổng quan; tab 2: ☰ → **Logout**; bấm **Finish** ở tab 1' : 'Đối chứng (6): như trên nhưng bấm **Cancel** ở tab 1',
        result: `\`cart-contents\` trước khi bấm: ${before6}; sau khi bấm ở \`${where(s.c.page)}\`${msg}; \`cart-contents\` sau: **${await cartKey(s.c.page)}**`,
        shot: button === '#finish' ? await snap(s.c, '05-dang-xuat-o-tab-khac-finish.png', '.error-message-container') : undefined,
      });
    }
    return rows;
  }, 'Finish đặt đơn theo trang Tổng quan đang hiện, không theo giỏ / phiên hiện tại: (1) tab 2 đặt được đơn thứ 2 đủ 2 sản phẩm sau khi tab 1 đã đặt; (2) giỏ đã Reset vẫn đặt được; (4) đơn chỉ có Backpack (`Total 32.39`) rồi Onesie thêm ở tab khác bị xóa khỏi giỏ; (5) đơn có cả Onesie đã bỏ (`Total 41.02`); (6) Finish bị chặn đúng về trang đăng nhập nhưng giỏ bị xóa, còn Cancel trong cùng tình huống thì giỏ còn `[4,2]`.');
});

test('BUG-36', async ({ browser }) => {
  await reproduce(browser, 'BUG-36', 'Bấm đúp Continue / Finish chạy 2 lần: phải bấm Back 2 lần mới về trang trước', async (open) => {
    const rows: Row[] = [];
    const hist = (page: Page) => page.evaluate(() => history.length);
    for (const dbl of [false, true]) {
      const c = await open(true); await login(c.page, 'standard_user');
      await setCart(c.page, '[4,2]'); await toInfo(c.page); await fillInfo(c.page, 'An', 'Le', '70000');
      const h0 = await hist(c.page);
      if (dbl) await c.page.dblclick('#continue'); else await c.page.click('#continue');
      await c.page.locator('#finish').waitFor();
      const h1 = await hist(c.page);
      await c.page.goBack();
      const back1 = (await appears(c.page, '#first-name')) ? 'trang Thông tin' : (await appears(c.page, '#finish', 500)) ? '**vẫn Tổng quan**' : where(c.page);
      rows.push({ action: dbl ? 'Biến thể 1: trang Thông tin đủ `An` / `Le` / `70000`, **bấm đúp** Continue, rồi bấm Back 1 lần' : 'Đối chứng: như trên nhưng bấm Continue **1 lần**, rồi Back 1 lần', result: `\`history.length\` tăng ${h1 - h0}; Back lần 1: ${back1}`, shot: dbl ? await snap(c, '01-bam-dup-continue-back-1-lan.png', '.title, #finish') : undefined });
      if (dbl) {
        await c.page.goBack();
        rows.push({ action: 'Bấm Back lần 2', result: `Về ${(await appears(c.page, '#first-name')) ? 'trang Thông tin' : where(c.page)}` });
      }
    }
    const c = await open(true); await login(c.page, 'standard_user');
    await setCart(c.page, '[4,2]'); await toOverview(c.page);
    const h0 = await hist(c.page);
    await c.page.dblclick('#finish'); await c.page.locator('.complete-header').waitFor();
    const h1 = await hist(c.page);
    const after = `số giỏ ${await badge(c.page)}, \`cart-contents\` ${await cartKey(c.page)}; ${await receipt(c.page)}`;
    await c.page.goBack();
    const still = await appears(c.page, '.complete-header', 1_000);
    rows.push({ action: 'Biến thể 2: Tổng quan giỏ Backpack + Onesie, **bấm đúp** Finish, rồi Back 1 lần', result: `\`history.length\` tăng ${h1 - h0}; ${after}; Back lần 1: ${still ? '**vẫn trang Hoàn tất**' : where(c.page)}`, shot: await snap(c, '02-bam-dup-finish-back-1-lan.png', '.complete-header') });
    await c.page.goBack(); await c.page.locator('#finish').waitFor({ timeout: 5_000 }).catch(() => {});
    rows.push({ action: 'Bấm Back lần 2', result: `Về \`${where(c.page)}\`, ${await count(c.page, '.cart_item')} dòng sản phẩm, ${await totals(c.page)}` });
    return rows;
  }, 'bấm đúp Continue hoặc Finish làm `history.length` tăng 2 (bấm 1 lần tăng 1), Back lần 1 vẫn ở cùng trang, phải Back lần 2 mới về trang trước (sau Finish: về Tổng quan rỗng). Đơn không bị nhân đôi: giỏ trống một lần, PDF đúng 2 sản phẩm `41.02`.');
});

test('BUG-26', async ({ browser }) => {
  await reproduce(browser, 'BUG-26', 'Mở thẳng Tổng quan là bỏ qua bước nhập thông tin, đặt được hàng không có tên, zip', async (open) => {
    const rows: Row[] = [];
    const c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack');
    await c.page.goto('/checkout-step-two.html'); await c.page.locator('.title').waitFor();
    rows.push({ action: 'Thêm Backpack ở danh sách (chưa vào trang Thông tin), mở thẳng `/checkout-step-two.html`', result: `Ở \`${where(c.page)}\`, tiêu đề \`${await text(c.page, '.title')}\`; ${(await names(c.page)).join(', ')}; ${await totals(c.page)}; nút Finish: ${yes(await c.page.locator('#finish').isVisible())}`, shot: await snap(c, '01-mo-thang-tong-quan.png', '.title, #finish') });
    const ok = await finish(c.page);
    rows.push({ action: 'Bấm Finish, bấm Generate PDF order', result: `"Thank you for your order!": ${yes(ok)}; số giỏ ${await badge(c.page)}; ${ok ? await receipt(c.page) : ''}`, shot: await snap(c, '02-finish-khong-co-thong-tin.png', '.complete-header, #generate-pdf-order') });
    return rows;
  }, 'mở thẳng URL vào được Tổng quan đầy đủ (Backpack, `Total: $32.39`) mà chưa nhập tên / zip; Finish đặt hàng thành công, biên nhận PDF **không có** phần `SHIP TO`.');
});

test('BUG-02 variant', async ({ browser }) => {
  await reproduce(browser, 'BUG-02', 'Biến thể SD-103: cookie tự tạo vào được cả 3 trang thanh toán và đặt được hàng', async (open) => {
    const rows: Row[] = [];
    const fake = async (user: string, url: string) => {
      const c = await open(true);
      await c.page.goto('/');
      await c.page.evaluate((u) => { document.cookie = `session-username=${u}`; localStorage.setItem('cart-contents', '[4]'); }, user);
      await c.page.goto(url);
      await c.page.locator('.title, #login-button').first().waitFor();
      const blocked = await c.page.locator('#login-button').isVisible();
      return { c, res: blocked ? `Ở \`${where(c.page)}\`, **bị chặn**: \`${await text(c.page, '.error-message-container h3')}\`` : `Ở \`${where(c.page)}\`, thấy trang \`${await text(c.page, '.title')}\`, không có thông báo đăng nhập` };
    };
    const pages: [string, string][] = [['/checkout-step-one.html', '01'], ['/checkout-step-two.html', '02'], ['/checkout-complete.html', '03']];
    for (const [url, n] of pages) {
      const { c, res } = await fake('standard_user', url);
      rows.push({ action: `Chưa đăng nhập. Trang đăng nhập, Console: \`document.cookie = "session-username=standard_user"\`, \`localStorage.setItem("cart-contents","[4]")\`; mở \`${url}\``, result: res, shot: await snap(c, `${n}-cookie-gia-${url.slice(1, -5)}.png`, '.title') });
    }
    const { c } = await fake('standard_user', '/checkout-step-two.html');
    const t = await totals(c.page); const ok = await finish(c.page);
    rows.push({ action: 'Như trên, mở `/checkout-step-two.html`, bấm Finish', result: `Tổng quan Backpack, ${t}; "Thank you for your order!": ${yes(ok)}`, shot: await snap(c, '04-cookie-gia-dat-hang.png', '.complete-header') });
    for (const user of ['problem_user', 'error_user', 'visual_user', 'performance_glitch_user', 'locked_out_user']) {
      const { res } = await fake(user, '/checkout-step-one.html');
      rows.push({ action: `${user === 'locked_out_user' ? 'Đối chứng: cookie' : 'Cookie'} \`session-username=${user}\`, mở \`/checkout-step-one.html\``, result: res });
    }
    return rows;
  }, 'cookie `session-username` tự tạo với tên tài khoản hợp lệ (5 tên) vào được cả 3 trang thanh toán, đặt được hàng; chỉ tên `locked_out_user` bị chặn. Giống BUG-02 ở `/inventory.html` (SD-101) và biến thể SD-102 (giỏ, chi tiết).');
});

test('BUG-05 variant', async ({ browser }) => {
  await reproduce(browser, 'BUG-05', 'Biến thể SD-103: Reset App State ở Tổng quan xóa giỏ nhưng trang vẫn liệt kê sản phẩm và số tiền', async (open) => {
    const rows: Row[] = [];
    let c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('#add-to-cart-sauce-labs-onesie');
    await toInfo(c.page); await resetAppState(c.page);
    rows.push({ action: 'Đối chứng: thêm Backpack, Onesie; trang **Thông tin**: ☰ → Reset App State', result: `Số giỏ ${await badge(c.page)}; \`cart-contents\` ${await cartKey(c.page)}; trang Thông tin có ${await count(c.page, '.cart_item')} dòng sản phẩm` });
    c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('#add-to-cart-sauce-labs-onesie');
    await toOverview(c.page); await resetAppState(c.page);
    rows.push({ action: 'Thêm Backpack, Onesie; đi tới **Tổng quan**; ☰ → Reset App State, đóng menu', result: `Số giỏ ${await badge(c.page)}; \`cart-contents\` ${await cartKey(c.page)}; trang **vẫn ${await count(c.page, '.cart_item')} dòng** (${(await names(c.page)).join(', ')}), ${await totals(c.page)}`, shot: await snap(c, '01-tong-quan-sau-reset.png', '.cart_item, .summary_total_label') });
    await c.page.reload(); await c.page.locator('#finish').waitFor();
    rows.push({ action: 'Tải lại trang Tổng quan', result: `${await count(c.page, '.cart_item')} dòng, ${await totals(c.page)}` });
    return rows;
  }, 'Reset ở Tổng quan xóa giỏ (`cart-contents` mất, không còn số giỏ) nhưng trang vẫn hiện 2 sản phẩm và `Total: $41.02` cho tới khi tải lại; bấm Finish lúc này là BUG-35 (2).');
});

test('BUG-07 variant', async ({ browser }) => {
  await reproduce(browser, 'BUG-07', 'Biến thể SD-103: người đăng nhập sau đặt hàng bằng giỏ của người trước và làm trống giỏ đó', async (open) => {
    const rows: Row[] = [];
    const dirs: [string, string, string, string, [string, string, string]][] = [
      ['standard_user', 'visual_user', 'backpack', '01', ['Vy', 'Tran', '10000']],
      ['visual_user', 'standard_user', 'onesie', '02', ['An', 'Le', '70000']],
    ];
    for (const [a, b, item, n, info] of dirs) {
      const c = await open(true); await login(c.page, a);
      await c.page.click(`#add-to-cart-sauce-labs-${item}`);
      if (a === 'standard_user') await toOverview(c.page);
      await logout(c.page);
      await login(c.page, b); await c.page.goto('/cart.html'); await c.page.locator('.cart_list').waitFor();
      const seen = (await names(c.page)).join(', ') || '(trống)';
      let ok = false;
      if (seen !== '(trống)') { await toOverview(c.page, ...info); ok = await finish(c.page); }
      rows.push({ action: `Chiều ${n === '01' ? 1 : 2}: \`${a}\` thêm ${item === 'backpack' ? 'Backpack' : 'Onesie'}${a === 'standard_user' ? ', đi tới Tổng quan' : ''}, Logout; \`${b}\` đăng nhập, mở giỏ, Checkout → \`${info.join(' / ')}\` → Continue → Finish`, result: `Giỏ của \`${b}\`: ${seen}; \`${b}\` đặt hàng: ${yes(ok)}`, shot: await snap(c, `${n}-chieu-${n === '01' ? 1 : 2}-nguoi-sau-dat-hang.png`, '.complete-header') });
      await logout(c.page); await login(c.page, a);
      await c.page.goto('/cart.html'); await c.page.locator('.cart_list').waitFor();
      rows.push({ action: `\`${a}\` đăng nhập lại, mở giỏ`, result: `Số giỏ ${await badge(c.page)}; giỏ: ${(await names(c.page)).join(', ') || '**(trống)**'}`, shot: await snap(c, `${n}-chieu-${n === '01' ? 1 : 2}-nguoi-truoc-mat-gio.png`, '.cart_list, .shopping_cart_link') });
    }
    return rows;
  }, 'cả 2 chiều: người đăng nhập sau thấy giỏ của người trước, đặt hàng được bằng giỏ đó, và người trước đăng nhập lại thấy giỏ trống.');
});

test('BUG-16 variant', async ({ browser }) => {
  await reproduce(browser, 'BUG-16', 'Biến thể SD-103: `visual_user` biểu tượng giỏ lệch và xoay, menu xoay ở cả 3 trang thanh toán', async (open) => {
    const rows: Row[] = [];
    for (const user of ['standard_user', 'visual_user']) {
      const c = await open(true); await login(c.page, user);
      await setCart(c.page, '[4]');
      for (const step of ['Thông tin', 'Tổng quan', 'Hoàn tất']) {
        if (step === 'Thông tin') await toInfo(c.page);
        if (step === 'Tổng quan') { await fillInfo(c.page, 'An', 'Le', '70000'); await c.page.click('#continue'); await c.page.locator('#finish').waitFor(); }
        if (step === 'Hoàn tất') { await c.page.click('#finish'); await c.page.locator('.complete-header').waitFor(); }
        await c.page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
        await c.page.evaluate(() => document.fonts.ready);
        const b = (await c.page.locator('.shopping_cart_container').boundingBox())!;
        const tf = (css: string) => c.page.locator(css).evaluate((e) => getComputedStyle(e).transform);
        rows.push({
          action: `\`${user}\`, trang ${step}: DevTools Console \`document.querySelector('.shopping_cart_container').getBoundingClientRect()\`, \`getComputedStyle(…).transform\` (giỏ và \`.bm-icon\`)`,
          result: `Giỏ x=${Math.round(b.x)}, y=${Math.round(b.y)}, transform \`${await tf('.shopping_cart_container')}\`; menu transform \`${await tf('.bm-icon')}\``,
          shot: user === 'visual_user' || step === 'Thông tin' ? await snap(c, `0${rows.length + 1}-${user}-${step === 'Thông tin' ? 'thong-tin' : step === 'Tổng quan' ? 'tong-quan' : 'hoan-tat'}.png`, '.shopping_cart_container, .bm-burger-button') : undefined,
        });
      }
    }
    return rows;
  }, '`visual_user` ở cả 3 trang: biểu tượng giỏ lệch so với `standard_user` (bảng trên) và xoay (`matrix(0.99863, 0.052336, …)` ≈ 3°), menu xoay như vậy; `standard_user` không xoay (`none`).');
});

// ============ Màn hình 1: Thông tin ============

test('BUG-22', async ({ browser }) => {
  await reproduce(browser, 'BUG-22', 'Thiếu một ô bắt buộc thì cả 3 ô đều bị tô đỏ, kể cả ô đã nhập đúng', async (open) => {
    const rows: Row[] = [];
    const state = async (page: Page) => {
      const parts: string[] = [];
      for (const [id, label] of [['first-name', 'First'], ['last-name', 'Last'], ['postal-code', 'Zip']]) {
        const red = await page.locator(`#${id}`).evaluate((e) => e.classList.contains('error'));
        const icon = await count(page, `.form_group:has(#${id}) .error_icon`);
        parts.push(`${label}: ${red ? 'class `error`' : 'không đỏ'}, ${icon} icon`);
      }
      return parts.join('; ');
    };
    for (const [first, last, zip, n] of [['An', '', '', '01'], ['An', '', '70000', '02'], ['', 'Le', '70000', '03']]) {
      const c = await open(true); await login(c.page, 'standard_user');
      await setCart(c.page, '[4]'); await toInfo(c.page);
      await fillInfo(c.page, first, last, zip); await c.page.click('#continue');
      await c.page.locator('.error-message-container h3').waitFor();
      const input = `\`${first || '(trống)'}\` / \`${last || '(trống)'}\` / \`${zip || '(trống)'}\``;
      rows.push({ action: `Trang Thông tin, nhập ${input}, bấm Continue; DevTools: \`document.querySelector('#first-name').classList\`, đếm \`.error_icon\` trong từng \`.form_group\``, result: `Thông báo \`${await text(c.page, '.error-message-container h3')}\`; ${await state(c.page)}`, shot: await snap(c, `${n}-thieu-o-ca-3-o-do.png`, '#first-name, #last-name, #postal-code') });
    }
    return rows;
  }, 'thông báo đúng ô thiếu, nhưng **cả 3 ô** đều có class `error` và 1 icon lỗi, kể cả ô đã nhập đúng.');
});

test('BUG-23', async ({ browser }) => {
  await reproduce(browser, 'BUG-23', 'Nhấn Enter trong ô nhập về trang giỏ (như Cancel), không kiểm tra, không sang Tổng quan', async (open) => {
    const rows: Row[] = [];
    const cases: [string, boolean, string][] = [['#first-name', true, '01'], ['#postal-code', true, '02'], ['#last-name', false, '03'], ['#continue', true, '']];
    for (const [focus, full, n] of cases) {
      const c = await open(true); await login(c.page, 'standard_user');
      await setCart(c.page, '[4]'); await toInfo(c.page);
      if (full) await fillInfo(c.page, 'An', 'Le', '70000');
      await c.page.focus(focus); await c.page.keyboard.press('Enter');
      await c.page.locator('#checkout, #finish, .error-message-container h3').first().waitFor();
      const err = (await count(c.page, '.error-message-container h3')) ? `, thông báo \`${await text(c.page, '.error-message-container h3')}\`` : '';
      rows.push({ action: focus === '#continue' ? 'Đối chứng: đủ `An` / `Le` / `70000`, Tab tới nút **Continue**, nhấn Enter' : `${full ? 'Đủ `An` / `Le` / `70000`' : '3 ô trống'}, bấm vào ô \`${focus}\`, nhấn **Enter**`, result: `Ở \`${where(c.page)}\`, tiêu đề \`${await text(c.page, '.title')}\`${err}`, shot: n ? await snap(c, `${n}-enter-o-${focus.slice(1)}.png`, '.title, #checkout') : undefined });
    }
    return rows;
  }, 'Enter ở ô nào (đủ hay trống) cũng về `/cart.html` "Your Cart", không báo lỗi, không sang Tổng quan; Enter khi đang đứng ở nút Continue thì đúng (sang Tổng quan).');
});

test('BUG-34', async ({ browser }) => {
  await reproduce(browser, 'BUG-34', 'Ô chỉ có khoảng trắng / ký tự tab được coi là đã nhập', async (open) => {
    const rows: Row[] = [];
    const cases: [string, string, string, string, string][] = [
      [' ', ' ', ' ', 'cả 3 ô 1 khoảng trắng', '01'], ['An', '   ', '70000', 'Last 3 khoảng trắng', '02'], ['An', 'Le', '\t', 'Zip 1 ký tự tab', '03'], ['', 'Le', '70000', 'Đối chứng: First trống', ''],
    ];
    for (const [first, last, zip, label, n] of cases) {
      const c = await open(true); await login(c.page, 'standard_user');
      await setCart(c.page, '[4]'); await toInfo(c.page);
      await fillInfo(c.page, first, last, zip); await c.page.click('#continue');
      await c.page.locator('#finish, .error-message-container h3').first().waitFor();
      const err = (await count(c.page, '.error-message-container h3')) ? `thông báo \`${await text(c.page, '.error-message-container h3')}\`, ` : '';
      let res = `${err}ở \`${where(c.page)}\` (\`${await text(c.page, '.title')}\`)`;
      const shotFile = n ? await snap(c, `${n}-khoang-trang-sang-tong-quan.png`, '.title, #finish') : undefined;
      if (n === '01' && (await c.page.locator('#finish').isVisible())) {
        const ok = await finish(c.page);
        res += `; Finish → "Thank you…": ${yes(ok)}; ${ok ? await receipt(c.page) : ''}`;
      }
      rows.push({ action: `${label}: nhập (dán) First / Last / Zip = \`${JSON.stringify(first)}\` / \`${JSON.stringify(last)}\` / \`${JSON.stringify(zip)}\`, bấm Continue${n === '01' ? '; rồi Finish, Generate PDF order' : ''}`, result: res, shot: shotFile });
    }
    return rows;
  }, 'ô chỉ có khoảng trắng hoặc ký tự tab không bị báo `… is required`, trang sang Tổng quan và đặt được hàng (PDF `SHIP TO` không có chữ); ô trống thật thì báo lỗi đúng.');
});

test('BUG-19 variant', async ({ browser }) => {
  await reproduce(browser, 'BUG-19', 'Biến thể SD-103: giỏ trống mở thẳng `/checkout-step-one.html` vẫn vào trang Thông tin', async (open) => {
    const c = await open(true); await login(c.page, 'standard_user');
    await c.page.goto('/checkout-step-one.html'); await c.page.locator('.title').waitFor();
    return [{ action: 'Đăng nhập `standard_user`, giỏ trống (không có số giỏ), mở thẳng `/checkout-step-one.html`', result: `Số giỏ ${await badge(c.page)}; ở \`${where(c.page)}\`, tiêu đề \`${await text(c.page, '.title')}\`, ô First Name: ${yes(await c.page.locator('#first-name').isVisible())}`, shot: await snap(c, '01-gio-trong-mo-thang-thong-tin.png', '.title, .checkout_info') }];
  }, 'giỏ trống vẫn vào được trang Thông tin bằng URL (cùng cổng "giỏ trống không vào thanh toán" của BUG-19 ở nút Checkout).');
});

test('BUG-28', async ({ browser }) => {
  await reproduce(browser, 'BUG-28', '`problem_user`: gõ vào Last Name thì ký tự đi vào First Name, không đặt được hàng', async (open) => {
    const rows: Row[] = [];
    for (const user of ['problem_user', 'standard_user']) {
      const c = await open(true); await login(c.page, user);
      await setCart(c.page, '[4]'); await toInfo(c.page);
      await c.page.fill('#first-name', 'An'); await c.page.click('#last-name'); await c.page.keyboard.type('Lee');
      const vals = `First \`${await c.page.inputValue('#first-name')}\`, Last \`${await c.page.inputValue('#last-name')}\``;
      await c.page.fill('#postal-code', '70000'); await c.page.click('#continue');
      await c.page.locator('#finish, .error-message-container h3').first().waitFor();
      const err = (await count(c.page, '.error-message-container h3')) ? `thông báo \`${await text(c.page, '.error-message-container h3')}\`` : `sang \`${where(c.page)}\``;
      rows.push({ action: `${user === 'standard_user' ? 'Đối chứng: ' : ''}\`${user}\`: First Name nhập \`An\`, bấm vào Last Name, **gõ từng phím** \`L\`, \`e\`, \`e\`; Zip \`70000\`; Continue`, result: `Sau khi gõ: ${vals}; ${err}`, shot: user === 'problem_user' ? await snap(c, '01-go-last-name-vao-first-name.png', '#first-name, #last-name, .error-message-container') : undefined });
    }
    return rows;
  }, '`problem_user`: mỗi phím gõ ở Last Name thay toàn bộ First Name (gõ `Lee` → First `e`), Last Name luôn trống, Continue luôn báo `Error: Last Name is required`; `standard_user` nhận đúng.');
});

test('BUG-31', async ({ browser }) => {
  await reproduce(browser, 'BUG-31', '`error_user`: ô Last Name không nhận ký tự, mỗi phím một lỗi JavaScript và một báo lỗi gửi ra ngoài', async (open) => {
    const rows: Row[] = [];
    for (const user of ['error_user', 'standard_user']) {
      const c = await open(true); await login(c.page, user);
      await setCart(c.page, '[4]'); await toInfo(c.page);
      const w = watchErrors(c.page);
      await c.page.fill('#first-name', 'An'); await c.page.click('#last-name'); await c.page.keyboard.type('Lee');
      if (user === 'error_user') await until(() => w.errs.length >= 3 && w.reports.length >= 3);
      rows.push({ action: `${user === 'standard_user' ? 'Đối chứng: ' : ''}\`${user}\`: First \`An\`, bấm vào Last Name, gõ \`L\`, \`e\`, \`e\`; xem tab Console và Network (DevTools)`, result: `Last Name \`${await c.page.inputValue('#last-name')}\`; ${w.errs.length} lỗi JavaScript${w.errs.length ? ` \`${w.errs[0]}\`` : ''}; ${w.reports.length} request tới \`submit.backtrace.io\``, shot: user === 'error_user' ? await snap(c, '01-last-name-khong-nhan-ky-tu.png', '#last-name') : undefined });
    }
    return rows;
  }, '`error_user`: Last Name luôn trống, mỗi phím sinh 1 lỗi JavaScript `Cannot read properties of undefined (reading \'value\')` và 1 request tới `submit.backtrace.io` (3 phím → 3 + 3); `standard_user` nhận `Lee`, không lỗi.');
});

test('BUG-32', async ({ browser }) => {
  await reproduce(browser, 'BUG-32', '`error_user`: bỏ qua kiểm tra Last Name', async (open) => {
    const rows: Row[] = [];
    const cases: [string, string, string][] = [['error_user', '', '01'], ['error_user', '70000', '02'], ['standard_user', '70000', '']];
    for (const [user, zip, n] of cases) {
      const c = await open(true); await login(c.page, user);
      await setCart(c.page, '[4]'); await toInfo(c.page);
      await c.page.fill('#first-name', 'Ann'); if (zip) await c.page.fill('#postal-code', zip);
      await c.page.click('#continue');
      await c.page.locator('#finish, .error-message-container h3').first().waitFor();
      const res = (await count(c.page, '.error-message-container h3')) ? `Thông báo \`${await text(c.page, '.error-message-container h3')}\`` : `**Sang \`${where(c.page)}\`** (\`${await text(c.page, '.title')}\`)`;
      rows.push({ action: `${n ? '' : 'Đối chứng: '}\`${user}\`: First \`Ann\`, **không chạm** Last Name, Zip \`${zip || '(trống)'}\`, Continue`, result: res, shot: n ? await snap(c, `${n}-bo-qua-last-name.png`, '.error-message-container, .title') : undefined });
    }
    return rows;
  }, '`error_user` thiếu Last Name: lúc thì báo lỗi của ô Zip (`Error: Postal Code is required`), lúc thì sang Tổng quan; `standard_user` cùng thao tác báo đúng `Error: Last Name is required`.');
});

// ============ Màn hình 2: Tổng quan ============

test('BUG-25', async ({ browser }) => {
  await reproduce(browser, 'BUG-25', 'Item total không làm tròn / không định dạng 2 chữ số lẻ', async (open) => {
    const rows: Row[] = [];
    let c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-bike-light'); await c.page.click('#add-to-cart-sauce-labs-fleece-jacket');
    await toOverview(c.page);
    const t1 = await totals(c.page);
    const s1 = await snap(c, '01-bike-light-fleece-jacket.png', '.summary_subtotal_label');
    rows.push({ action: '`standard_user`: danh sách bấm Add to cart ở **Bike Light** rồi **Fleece Jacket**, giỏ → Checkout → `An` / `Le` / `70000` → Continue', result: t1, shot: s1 });
    const ok = await finish(c.page);
    rows.push({ action: 'Bấm Finish, Generate PDF order', result: ok ? await receipt(c.page) : 'không tới được Hoàn tất' });
    for (const [raw, n] of [['[2,5]', '02'], ['[4,3,2,1,0]', ''], ['[]', '03'], ['[4,2]', '']]) {
      c = await open(true); await login(c.page, 'standard_user');
      await setCart(c.page, raw); await toOverview(c.page);
      rows.push({ action: `${raw === '[4,2]' ? 'Đối chứng: ' : ''}Console \`localStorage.setItem("cart-contents","${raw}")\`, giỏ → Checkout → \`An\` / \`Le\` / \`70000\` → Continue${raw === '[]' ? ' (giỏ rỗng, BUG-19 cho vào)' : ''}`, result: await totals(c.page), shot: n ? await snap(c, `${n}-gio-${raw === '[]' ? 'rong' : raw.replace(/\D/g, '')}.png`, '.summary_subtotal_label') : undefined });
    }
    return rows;
  }, 'Item total in số thực chưa làm tròn (`$59.980000000000004`, `$57.980000000000004`, `$79.94999999999999`), giỏ rỗng `$0`; Tax, Total vẫn 2 chữ số; PDF in `59.98` nên biên nhận khác Tổng quan; giỏ `[4,2]` đúng `$37.98`.');
});

test('BUG-29', async ({ browser }) => {
  await reproduce(browser, 'BUG-29', '`problem_user`: Item total gấp đôi, Tax và Total tính theo số sai', async (open) => {
    const rows: Row[] = [];
    const cases: [string, string, string, string][] = [
      ['problem_user', '[4]', '01', 'Backpack ($29.99): mong đợi `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39`'],
      ['problem_user', '[4,0,1,5,2,3]', '02', 'cả 6 sản phẩm: mong đợi `$129.94`, `$10.40`, `$140.34`'],
      ['standard_user', '[4]', '', 'mong đợi `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39`'],
      ['problem_user', '[4,2]', '03', 'Backpack + Onesie: mong đợi `$37.98`, `$3.04`, `$41.02`'],
    ];
    for (const [user, raw, n, want] of cases) {
      const c = await open(true); await login(c.page, user);
      await setCart(c.page, raw); await c.page.goto('/checkout-step-two.html'); await c.page.locator('#finish').waitFor();
      const prices = (await c.page.locator('.cart_item .inventory_item_price').allTextContents()).join(', ');
      let res = `Giá từng dòng: ${prices}; ${await totals(c.page)}`;
      const s = n ? await snap(c, `${n}-gio-${raw.replace(/\D/g, '')}.png`, '.summary_subtotal_label, .summary_total_label') : undefined;
      if (raw === '[4,2]') { const ok = await finish(c.page); res += `; Finish → ${ok ? await receipt(c.page) : 'không tới được Hoàn tất'}`; }
      rows.push({ action: `${user === 'standard_user' ? 'Đối chứng: ' : ''}\`${user}\`: Console \`localStorage.setItem("cart-contents","${raw}")\`, mở \`/checkout-step-two.html\`${user === 'problem_user' ? ' (BUG-28 chặn trang Thông tin)' : ''}${raw === '[4,2]' ? ', Finish, Generate PDF order' : ''}. ${want}`, result: res, shot: s });
    }
    return rows;
  }, '`problem_user`: giá từng dòng đúng nhưng Item total **gấp đôi** tổng giá (`$59.98` thay vì `$29.99`; cả 6 sản phẩm `$259.88` thay vì `$129.94`), Tax và Total tính theo số sai; PDF in `75.96`, `6.08`, `82.04` (đúng: `37.98`, `3.04`, `41.02`); `standard_user` cùng giỏ đúng.');
});

test('BUG-33', async ({ browser }) => {
  await reproduce(browser, 'BUG-33', '`error_user`: bấm Finish không có tác dụng, lỗi JavaScript', async (open) => {
    const c = await open(true); await login(c.page, 'error_user');
    await setCart(c.page, '[4,0,2]'); await c.page.goto('/checkout-step-two.html'); await c.page.locator('#finish').waitFor();
    const w = watchErrors(c.page);
    const ok = await finish(c.page);
    await until(() => w.errs.length >= 1 && w.reports.length >= 1);
    return [{ action: '`error_user`: Console `localStorage.setItem("cart-contents","[4,0,2]")`, mở `/checkout-step-two.html` (BUG-31 chặn trang Thông tin), bấm **Finish**; xem tab Console, Network', result: `"Thank you…": ${yes(ok)}; vẫn ở \`${where(c.page)}\`; số giỏ ${await badge(c.page)}, \`cart-contents\` ${await cartKey(c.page)}; ${w.errs.length} lỗi JavaScript${w.errs.length ? ` \`${w.errs[0]}\`` : ''}; ${w.reports.length} request tới \`submit.backtrace.io\``, shot: await snap(c, '01-finish-khong-tac-dung.png', '#finish') }];
  }, '`error_user` bấm Finish: ở lại Tổng quan, giỏ còn nguyên `[4,0,2]`, trang ném lỗi JavaScript `wa.cesetRart is not a function` và gửi 1 báo lỗi tới `submit.backtrace.io`.');
});

test('BUG-11 variant', async ({ browser }) => {
  await reproduce(browser, 'BUG-11', 'Biến thể SD-103: `problem_user` bấm tên sản phẩm ở Tổng quan mở sai trang chi tiết (id + 1)', async (open) => {
    const rows: Row[] = [];
    for (const p of [...allProducts].sort((a, b) => a.id - b.id)) {
      const c = await open(true); await login(c.page, 'problem_user');
      await setCart(c.page, `[${p.id}]`); await c.page.goto('/checkout-step-two.html'); await c.page.locator('#finish').waitFor();
      await c.page.click(`#item_${p.id}_title_link`); await c.page.locator('#back-to-products').waitFor();
      rows.push({ action: `Giỏ chỉ có ${p.name} (id ${p.id}), mở \`/checkout-step-two.html\`, bấm **tên** sản phẩm`, result: `Mở \`${new URL(c.page.url()).search}\`: \`${await text(c.page, '.inventory_details_name')}\``, shot: p.id === 4 || p.id === 5 ? await snap(c, `0${p.id === 4 ? 1 : 2}-bam-${p.id === 4 ? 'backpack' : 'fleece-jacket'}.png`, '.inventory_details_name') : undefined });
    }
    return rows;
  }, 'cả 6 sản phẩm mở trang của sản phẩm id + 1; Fleece Jacket (id 5) mở `?id=6` `ITEM NOT FOUND`. Cùng quy luật với BUG-11 ở danh sách và giỏ (SD-102).');
});

// ============ Màn hình 3: Hoàn tất ============

test('BUG-27', async ({ browser }) => {
  await reproduce(browser, 'BUG-27', 'Mở thẳng trang Hoàn tất khi chưa đặt hàng vẫn báo đặt hàng thành công', async (open) => {
    const c = await open(true); await login(c.page, 'standard_user');
    await c.page.click('#add-to-cart-sauce-labs-backpack'); await c.page.click('#add-to-cart-sauce-labs-onesie');
    await c.page.goto('/checkout-complete.html'); await c.page.locator('.title').waitFor();
    return [{ action: 'Thêm Backpack, Onesie (chưa Checkout, chưa Finish), mở thẳng `/checkout-complete.html`', result: `Tiêu đề \`${await text(c.page, '.title')}\`; \`${(await c.page.locator('.complete-header').count()) ? await text(c.page, '.complete-header') : '(không có)'}\`, \`${(await c.page.locator('.complete-text').count()) ? await text(c.page, '.complete-text') : '(không có)'}\`; số giỏ ${await badge(c.page)}, \`cart-contents\` ${await cartKey(c.page)}; nút Generate PDF order: ${yes((await count(c.page, '#generate-pdf-order')) > 0)}`, shot: await snap(c, '01-mo-thang-hoan-tat.png', '.complete-header, .complete-text, .shopping_cart_link') }];
  }, 'chưa đặt hàng mà trang vẫn hiện "Thank you for your order!" và "Your order has been dispatched…", trong khi giỏ còn 2 sản phẩm (số giỏ 2).');
});

test('BUG-30', async ({ browser }) => {
  await reproduce(browser, 'BUG-30', '`problem_user`: Finish báo thành công nhưng giỏ không được làm trống, đặt lại được', async (open) => {
    const rows: Row[] = [];
    const start = async () => {
      const c = await open(true); await login(c.page, 'problem_user');
      await setCart(c.page, '[4,0,2]'); await c.page.goto('/checkout-step-two.html'); await c.page.locator('#finish').waitFor();
      return { c, ok: await finish(c.page) };
    };
    let s = await start();
    rows.push({ action: '`problem_user`: Console `localStorage.setItem("cart-contents","[4,0,2]")`, mở `/checkout-step-two.html` (BUG-28 chặn trang Thông tin), bấm Finish', result: `"Thank you…": ${yes(s.ok)}; số giỏ **${await badge(s.c.page)}**; \`cart-contents\` **${await cartKey(s.c.page)}**`, shot: await snap(s.c, '01-sau-finish-gio-con.png', '.complete-header, .shopping_cart_link') });
    await s.c.page.click('#back-to-products'); await s.c.page.locator('.inventory_list').waitFor();
    rows.push({ action: 'Bấm Back Home', result: `${await count(s.c.page, '.inventory_item button:text-is("Add to cart")')} nút \`Add to cart\`, ${await count(s.c.page, '.inventory_item button:text-is("Remove")')} nút \`Remove\`; số giỏ ${await badge(s.c.page)}`, shot: await snap(s.c, '02-back-home-con-remove.png', '.inventory_item button:text-is("Remove"), .shopping_cart_link') });
    s = await start();
    await s.c.page.goBack(); await s.c.page.locator('#finish').waitFor({ timeout: 5_000 }).catch(() => {});
    rows.push({ action: 'Phiên mới, như trên đến khi đặt xong; bấm **Back** của trình duyệt', result: `Ở \`${where(s.c.page)}\`, ${await count(s.c.page, '.cart_item')} dòng, ${await totals(s.c.page)}` });
    rows.push({ action: 'Bấm Finish lần 2', result: `"Thank you…" lần 2: ${yes(await finish(s.c.page))}`, shot: await snap(s.c, '03-dat-lai-lan-2.png', '.complete-header') });
    return rows;
  }, '`problem_user` Finish xong: số giỏ còn 3, `cart-contents` còn `[4,0,2]`, Back Home còn 3 nút `Remove`; Back của trình duyệt về Tổng quan còn 3 sản phẩm và đặt lại được (đơn trùng).');
});
