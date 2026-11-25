/**
 * SD-101: Login screen (SauceDemo)
 * Test cases: qa-runs/saucedemo-login-screen/test-cases.csv (33 TC, approved at HITL #2)
 * Known issues: qa-runs/saucedemo-login-screen/known-issues.md (BUG-01, BUG-02 expected to FAIL)
 *
 * Convention: 1 test = 1 TC, title starts with the TC id, tags = @AC-x (+ @smoke / @BUG-xx).
 * Evidence: `evidence.shot()` = annotated screenshot (only with npm run test:evidence).
 */
import { test, expect, isLoginScreen } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../data/users';
import { MSG, invalid, protectedPages } from '../data/messages';

const { standard } = users;

test.describe('AC-1: Login form UI', () => {
  test('TC-001 hiển thị đủ ô Username, Password và nút Login', { tag: ['@AC-1', '@smoke'] }, async ({ loginPage, evidence }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await evidence.shot('Form đăng nhập', {
      highlight: [loginPage.usernameInput, loginPage.passwordInput, loginPage.loginButton],
      note: 'Có đủ ô Username, ô Password và nút Login',
    });
  });

  test('TC-002 ô Password ẩn ký tự khi nhập', { tag: '@AC-1' }, async ({ loginPage, evidence }) => {
    await loginPage.passwordInput.fill('abc');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await evidence.shot('Nhập abc vào ô Password', {
      highlight: loginPage.passwordInput,
      note: 'Ký tự hiển thị dạng chấm (•••), không thấy chữ abc',
    });
  });
});

test.describe('AC-2: Successful login', () => {
  test('TC-003 standard_user đăng nhập thành công', { tag: ['@AC-2', '@smoke'] }, async ({ loginPage, page, evidence }) => {
    await loginPage.fill(standard.username, standard.password);
    await evidence.shot('Nhập thông tin hợp lệ', { highlight: [loginPage.usernameInput, loginPage.passwordInput], note: 'Username standard_user, có mật khẩu' });
    await loginPage.loginButton.click();
    const inventory = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventory.title).toHaveText('Products');
    await evidence.shot('Vào trang sản phẩm', { highlight: inventory.title, note: 'Tiêu đề "Products", URL /inventory.html' });
  });

  test('TC-004 đăng nhập bằng phím Enter', { tag: '@AC-2' }, async ({ loginPage, page, evidence }) => {
    await loginPage.fill(standard.username, standard.password);
    await evidence.shot('Nhập thông tin, chưa bấm Login', { highlight: loginPage.passwordInput, note: 'Sẽ nhấn Enter tại ô Password, KHÔNG bấm nút Login' });
    await loginPage.passwordInput.press('Enter');
    const inventory = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventory.title).toHaveText('Products');
    await evidence.shot('Vào trang sản phẩm', { highlight: inventory.title, note: 'Đăng nhập thành công bằng phím Enter' });
  });

  // TC-005 → TC-008: each special user is its own partition (different known behaviour)
  const specialUsers = [
    { tc: 'TC-005', user: users.problem, timeout: undefined },
    // Q5: do not fail on speed; allow up to 10s (BUG-03 records the ~5s delay)
    { tc: 'TC-006', user: users.performanceGlitch, timeout: 10_000 },
    { tc: 'TC-007', user: users.error, timeout: undefined },
    { tc: 'TC-008', user: users.visual, timeout: undefined },
  ];
  for (const { tc, user, timeout } of specialUsers) {
    test(`${tc} user hợp lệ ${user.username} đăng nhập được`, { tag: '@AC-2' }, async ({ loginPage, page, evidence }) => {
      await loginPage.fill(user.username, user.password);
      await evidence.shot('Nhập thông tin', { highlight: loginPage.usernameInput, note: `Username ${user.username}` });
      const start = Date.now();
      await loginPage.loginButton.click();
      const inventory = new InventoryPage(page);
      await expect(page).toHaveURL(/\/inventory\.html$/, { timeout });
      // Same allowance for the render: the URL changes first (client-side), the list can appear seconds later (CI run 45449039805)
      await expect(inventory.title).toHaveText('Products', { timeout });
      const seconds = ((Date.now() - start) / 1000).toFixed(1);
      await evidence.shot('Vào trang sản phẩm', { highlight: inventory.title, note: `Đăng nhập thành công sau ${seconds} giây` });
    });
  }

  test('TC-029 đăng xuất rồi đăng nhập lại thành công', { tag: ['@AC-2', '@AC-7'] }, async ({ loggedInPage, page, evidence }) => {
    await loggedInPage.logout();
    const loginPage = new LoginPage(page);
    await expect(loginPage.loginButton).toBeVisible();
    await evidence.shot('Đã đăng xuất', { highlight: loginPage.loginButton, note: 'Về lại trang đăng nhập' });
    await loginPage.login(standard.username, standard.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(loggedInPage.title).toHaveText('Products');
    await evidence.shot('Đăng nhập lại', { highlight: loggedInPage.title, note: 'Vào lại trang sản phẩm thành công' });
  });

  test('TC-031 tải lại trang vẫn giữ phiên đăng nhập', { tag: '@AC-2' }, async ({ loggedInPage, page, evidence }) => {
    await evidence.shot('Trước khi tải lại', { highlight: loggedInPage.title, note: 'Đang ở trang sản phẩm' });
    await page.reload();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(loggedInPage.inventoryList).toBeVisible();
    await evidence.shot('Sau khi tải lại (F5)', { highlight: loggedInPage.title, note: 'Vẫn ở trang sản phẩm, KHÔNG bị đẩy về trang đăng nhập' });
  });
});

test.describe('AC-3: Empty fields (decision table)', () => {
  test('TC-009 R1: trống Username + trống Password', { tag: '@AC-3' }, async ({ loginPage, page, evidence }) => {
    await evidence.shot('Để trống cả 2 ô', { highlight: [loginPage.usernameInput, loginPage.passwordInput], note: 'Cả 2 ô đều trống' });
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText(MSG.usernameRequired);
    await expect(page).toHaveURL(isLoginScreen);
    await evidence.shot('Thông báo lỗi', { highlight: loginPage.errorMessage, note: `Đúng nguyên văn "${MSG.usernameRequired}"` });
  });

  test('TC-010 R2: có Username + trống Password', { tag: '@AC-3' }, async ({ loginPage, page, evidence }) => {
    await loginPage.fill(standard.username, '');
    await evidence.shot('Có Username, trống Password', { highlight: loginPage.passwordInput, note: 'Ô Password để trống' });
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText(MSG.passwordRequired);
    await expect(page).toHaveURL(isLoginScreen);
    await evidence.shot('Thông báo lỗi', { highlight: loginPage.errorMessage, note: `Đúng nguyên văn "${MSG.passwordRequired}"` });
  });

  test('TC-011 R3: trống Username + có Password', { tag: '@AC-3' }, async ({ loginPage, page, evidence }) => {
    await loginPage.fill('', standard.password);
    await evidence.shot('Trống Username, có Password', { highlight: loginPage.usernameInput, note: 'Ô Username để trống' });
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText(MSG.usernameRequired);
    await expect(page).toHaveURL(isLoginScreen);
    await evidence.shot('Thông báo lỗi', { highlight: loginPage.errorMessage, note: `Đúng nguyên văn "${MSG.usernameRequired}"` });
  });

  test('TC-022 đóng thông báo lỗi bằng nút X', { tag: '@AC-3' }, async ({ loginPage, evidence }) => {
    await loginPage.login(standard.username, '');
    await expect(loginPage.errorMessage).toBeVisible();
    await evidence.shot('Có thông báo lỗi', { highlight: loginPage.errorCloseButton, note: 'Sẽ bấm nút X trên khung thông báo đỏ' });
    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toBeHidden();
    await expect(loginPage.fieldErrorIcons).toHaveCount(0);
    await expect(loginPage.usernameInput).toHaveValue(standard.username);
    await evidence.shot('Sau khi bấm X', { highlight: loginPage.usernameInput, note: 'Khung lỗi và icon X biến mất; ô Username vẫn giữ standard_user' });
  });

  test('TC-028 chỉ ô bị thiếu mới bị đánh dấu lỗi (cả 2 chiều)', { tag: ['@AC-3', '@BUG-01'] }, async ({ loginPage, evidence }) => {
    // BUG-01 (O-03, review A1): with ANY "required" error, BOTH fields are marked as error. Known bug → expected to fail.
    // Both directions are checked with expect.soft, so the test keeps failing until BOTH are fixed.
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'BUG-01: ô đã nhập cũng bị tô đỏ (cả 2 chiều)');
    // Oracle (fixed 2026-11-25, SD-103 review-test-impl E1): the inputs ALWAYS carry class `input_error`, even before any error.
    // The error state adds the separate class `error` (whole word) and a red ✕ icon (.error_icon) in the field.
    const MARKED = /(^|\s)error(\s|$)/;

    // Chiều 1: có Username, trống Password
    // Baseline: before submitting, no field is marked (proves the oracle can tell marked from not marked)
    await expect(loginPage.usernameInput).not.toHaveClass(MARKED);
    await expect(loginPage.passwordInput).not.toHaveClass(MARKED);
    await expect(loginPage.fieldErrorIcons).toHaveCount(0);
    await loginPage.fill(standard.username, '');
    await evidence.shot('Chiều 1: có Username, trống Password', { highlight: loginPage.usernameInput, note: 'Ô Username ĐÃ nhập standard_user, ô Password để trống' });
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText(MSG.passwordRequired);
    await expect(loginPage.passwordInput).toHaveClass(MARKED);
    await evidence.shot('Chiều 1 kết quả: BUG', {
      highlight: loginPage.usernameInput,
      note: 'BUG-01 chiều 1: ô Username đã nhập nhưng vẫn bị viền đỏ + icon X. Mong đợi: chỉ ô Password bị đánh dấu',
    });
    await expect.soft(loginPage.usernameInput, 'Chiều 1: ô Username đã nhập không được bị đánh dấu lỗi').not.toHaveClass(MARKED);
    await expect.soft(loginPage.fieldErrorIcons, 'Chiều 1: chỉ 1 icon ✕ (ô Password)').toHaveCount(1);

    // Chiều 2: trống Username, có Password (trang sạch)
    await loginPage.goto();
    await loginPage.fill('', standard.password);
    await evidence.shot('Chiều 2: trống Username, có Password', { highlight: loginPage.passwordInput, note: 'Ô Password ĐÃ nhập, ô Username để trống' });
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText(MSG.usernameRequired);
    await expect(loginPage.usernameInput).toHaveClass(MARKED);
    await evidence.shot('Chiều 2 kết quả: BUG', {
      highlight: loginPage.passwordInput,
      note: 'BUG-01 chiều 2: ô Password đã nhập nhưng vẫn bị viền đỏ + icon X. Mong đợi: chỉ ô Username bị đánh dấu',
    });
    await expect.soft(loginPage.passwordInput, 'Chiều 2: ô Password đã nhập không được bị đánh dấu lỗi').not.toHaveClass(MARKED);
    await expect.soft(loginPage.fieldErrorIcons, 'Chiều 2: chỉ 1 icon ✕ (ô Username)').toHaveCount(1);
  });
});

test.describe('AC-4: Wrong credentials', () => {
  const wrongCases = [
    { tc: 'TC-012', title: 'sai mật khẩu', username: standard.username, password: invalid.password, input: 'Mật khẩu sai: wrong_password' },
    { tc: 'TC-013', title: 'username không tồn tại', username: invalid.username, password: standard.password, input: 'Username không tồn tại: unknown_user' },
    { tc: 'TC-014', title: 'sai cả username và mật khẩu', username: invalid.username, password: invalid.password, input: 'Sai cả hai' },
    // Q2: case sensitive, no trimming
    { tc: 'TC-015', title: 'username viết hoa bị từ chối', username: standard.username.toUpperCase(), password: standard.password, input: 'Username viết hoa: STANDARD_USER' },
    { tc: 'TC-016', title: 'username có khoảng trắng đầu bị từ chối', username: ` ${standard.username}`, password: standard.password, input: 'Username có dấu cách ở đầu' },
    { tc: 'TC-017', title: 'mật khẩu thừa khoảng trắng cuối bị từ chối', username: standard.username, password: `${standard.password} `, input: 'Mật khẩu đúng + 1 dấu cách ở cuối' },
    { tc: 'TC-018', title: 'mật khẩu viết hoa bị từ chối', username: standard.username, password: standard.password.toUpperCase(), input: 'Mật khẩu viết hoa toàn bộ' },
    // Q14: no max length defined → extreme value only
    { tc: 'TC-019', title: 'username 1000 ký tự không làm lỗi trang', username: invalid.veryLongUsername, password: standard.password, input: 'Username 1000 ký tự a' },
  ];
  for (const { tc, title, username, password, input } of wrongCases) {
    test(`${tc} ${title}`, { tag: '@AC-4' }, async ({ loginPage, page, evidence }) => {
      await loginPage.fill(username, password);
      await evidence.shot('Nhập dữ liệu sai', { highlight: [loginPage.usernameInput, loginPage.passwordInput], note: input });
      await loginPage.loginButton.click();
      await expect(loginPage.errorMessage).toHaveText(MSG.mismatch);
      await expect(page).toHaveURL(isLoginScreen);
      await evidence.shot('Thông báo lỗi', { highlight: loginPage.errorMessage, note: 'Đúng nguyên văn "…do not match any user in this service", vẫn ở trang đăng nhập' });
    });
  }

  test('TC-030 thử lại sau lỗi: thông báo cập nhật, nhập đúng thì vào được', { tag: ['@AC-2', '@AC-4'] }, async ({ loginPage, page, evidence }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toHaveText(MSG.usernameRequired);
    await evidence.shot('Lần 1: trống cả 2 ô', { highlight: loginPage.errorMessage, note: 'Lỗi "Username is required"' });

    await loginPage.login(standard.username, invalid.password);
    await expect(loginPage.errorMessage).toHaveText(MSG.mismatch);
    await evidence.shot('Lần 2: sai mật khẩu', { highlight: loginPage.errorMessage, note: 'Thông báo ĐÃ ĐỔI thành "…do not match…"' });

    await loginPage.passwordInput.fill(standard.password);
    await loginPage.loginButton.click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await evidence.shot('Lần 3: nhập đúng', { highlight: new InventoryPage(page).title, note: 'Vào được trang sản phẩm' });
  });
});

test.describe('AC-5: Locked account', () => {
  test('TC-020 tài khoản bị khóa không đăng nhập được', { tag: ['@AC-5', '@smoke'] }, async ({ loginPage, page, evidence }) => {
    await loginPage.fill(users.lockedOut.username, users.lockedOut.password);
    await evidence.shot('Nhập tài khoản bị khóa', { highlight: loginPage.usernameInput, note: 'locked_out_user + mật khẩu đúng' });
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText(MSG.lockedOut);
    await expect(page).toHaveURL(isLoginScreen);
    await evidence.shot('Thông báo bị khóa', { highlight: loginPage.errorMessage, note: `Đúng nguyên văn "${MSG.lockedOut}"` });
  });

  test('TC-021 tài khoản bị khóa + sai mật khẩu không lộ trạng thái khóa', { tag: '@AC-5' }, async ({ loginPage, page, evidence }) => {
    await loginPage.fill(users.lockedOut.username, invalid.password);
    await evidence.shot('Tài khoản khóa + sai mật khẩu', { highlight: loginPage.usernameInput, note: 'locked_out_user + wrong_password' });
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText(MSG.mismatch);
    await expect(page).toHaveURL(isLoginScreen);
    await evidence.shot('Thông báo chung', { highlight: loginPage.errorMessage, note: 'Báo "…do not match…", KHÔNG nhắc tới bị khóa' });
  });
});

test.describe('AC-6: Access control (not logged in)', () => {
  const blocked = [
    { tc: 'TC-023', path: protectedPages.inventory, url: protectedPages.inventory, smoke: true },
    { tc: 'TC-024', path: protectedPages.cart, url: protectedPages.cart, smoke: false },
    { tc: 'TC-025', path: protectedPages.checkout, url: protectedPages.checkout, smoke: false },
    { tc: 'TC-032', path: protectedPages.itemDetail, url: `${protectedPages.itemDetail}?id=4`, smoke: false },
  ];
  for (const { tc, path, url, smoke } of blocked) {
    test(`${tc} mở thẳng ${path} khi chưa đăng nhập bị chặn`, { tag: smoke ? ['@AC-6', '@smoke'] : '@AC-6' }, async ({ page, evidence }) => {
      await page.goto(url);
      const loginPage = new LoginPage(page);
      await expect(page).toHaveURL(isLoginScreen);
      await expect(loginPage.errorMessage).toHaveText(MSG.notLoggedIn(path));
      await evidence.shot(`Mở thẳng ${url}`, { highlight: loginPage.errorMessage, note: `Bị đưa về trang đăng nhập, báo "You can only access '${path}'…"` });
    });
  }

  test('TC-033 cookie phiên tự tạo không được vào trang bên trong', { tag: ['@AC-6', '@BUG-02', '@security'] }, async ({ page, context, baseURL, evidence }) => {
    // BUG-02 (O-21): the site trusts the client-side cookie only. Known bug → expected to fail.
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'BUG-02: tự tạo cookie session-username là vào được');
    await page.goto('/');
    const loginPage = new LoginPage(page);
    await evidence.shot('Chưa đăng nhập', { highlight: loginPage.loginButton, note: 'Đang ở trang đăng nhập, CHƯA đăng nhập' });
    await context.addCookies([{ name: 'session-username', value: standard.username, url: baseURL! }]);
    await page.goto(protectedPages.inventory);
    await evidence.shot('Kết quả: BUG', {
      highlight: new InventoryPage(page).title,
      note: 'BUG-02: chỉ tự tạo cookie session-username=standard_user là vào được trang Products. Mong đợi: bị chặn',
    });
    await expect(page).toHaveURL(isLoginScreen);
    await expect(loginPage.errorMessage).toHaveText(MSG.notLoggedIn(protectedPages.inventory));
    await expect(new InventoryPage(page).inventoryList).toBeHidden();
  });
});

test.describe('AC-7: Logout', () => {
  test('TC-026 đăng xuất về trang đăng nhập và xóa phiên', { tag: ['@AC-7', '@smoke'] }, async ({ loggedInPage, page, context, evidence }) => {
    await loggedInPage.menuButton.click();
    await expect(loggedInPage.logoutLink).toBeVisible();
    await evidence.shot('Mở menu', { highlight: loggedInPage.logoutLink, note: 'Sẽ bấm Logout' });
    await loggedInPage.logoutLink.click();
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(isLoginScreen);
    await expect(loginPage.loginButton).toBeVisible();
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'session-username')).toBeUndefined();
    await evidence.shot('Đã đăng xuất', { highlight: loginPage.loginButton, note: 'Về trang đăng nhập; cookie session-username đã bị xóa (kiểm tra trong code)' });
  });

  test('TC-027 đăng xuất rồi bấm Back không xem lại được trang sản phẩm', { tag: ['@AC-6', '@AC-7'] }, async ({ loggedInPage, page, evidence }) => {
    await loggedInPage.logout();
    await page.goBack();
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(isLoginScreen);
    await expect(loginPage.errorMessage).toHaveText(MSG.notLoggedIn(protectedPages.inventory));
    await expect(loggedInPage.inventoryList).toBeHidden();
    await evidence.shot('Bấm Back sau khi đăng xuất', { highlight: loginPage.errorMessage, note: 'Không thấy sản phẩm; báo "You can only access \'/inventory.html\'…"' });
  });
});
