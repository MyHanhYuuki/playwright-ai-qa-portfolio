/**
 * SD-101: Login screen (SauceDemo)
 * Test cases: qa-runs/saucedemo-login-screen/test-cases.csv (33 TC, approved at HITL #2)
 * Known issues: qa-runs/saucedemo-login-screen/known-issues.md (KI-01, KI-02 expected to FAIL)
 *
 * Convention: 1 test = 1 TC, title starts with the TC id, tags = @AC-x (+ @smoke / @KI-xx).
 */
import { test, expect, isLoginScreen } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../data/users';
import { MSG, invalid, protectedPages } from '../data/messages';

const { standard } = users;

test.describe('AC-1: Login form UI', () => {
  test('TC-001 hiển thị đủ ô Username, Password và nút Login', { tag: ['@AC-1', '@smoke'] }, async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('TC-002 ô Password ẩn ký tự khi nhập', { tag: '@AC-1' }, async ({ loginPage }) => {
    await loginPage.passwordInput.fill('abc');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('AC-2: Successful login', () => {
  test('TC-003 standard_user đăng nhập thành công', { tag: ['@AC-2', '@smoke'] }, async ({ loginPage, page }) => {
    await loginPage.login(standard.username, standard.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(new InventoryPage(page).title).toHaveText('Products');
  });

  test('TC-004 đăng nhập bằng phím Enter', { tag: '@AC-2' }, async ({ loginPage, page }) => {
    await loginPage.loginWithEnter(standard.username, standard.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(new InventoryPage(page).title).toHaveText('Products');
  });

  // TC-005 → TC-008: each special user is its own partition (different known behaviour)
  const specialUsers = [
    { tc: 'TC-005', user: users.problem, timeout: undefined },
    // Q5: do not fail on speed; allow up to 10s (KI-03 records the ~5s delay)
    { tc: 'TC-006', user: users.performanceGlitch, timeout: 10_000 },
    { tc: 'TC-007', user: users.error, timeout: undefined },
    { tc: 'TC-008', user: users.visual, timeout: undefined },
  ];
  for (const { tc, user, timeout } of specialUsers) {
    test(`${tc} user hợp lệ ${user.username} đăng nhập được`, { tag: '@AC-2' }, async ({ loginPage, page }) => {
      await loginPage.login(user.username, user.password);
      await expect(page).toHaveURL(/\/inventory\.html$/, { timeout });
      await expect(new InventoryPage(page).title).toHaveText('Products');
    });
  }

  test('TC-029 đăng xuất rồi đăng nhập lại thành công', { tag: ['@AC-2', '@AC-7'] }, async ({ loggedInPage, page }) => {
    await loggedInPage.logout();
    await new LoginPage(page).login(standard.username, standard.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(loggedInPage.title).toHaveText('Products');
  });

  test('TC-031 tải lại trang vẫn giữ phiên đăng nhập', { tag: '@AC-2' }, async ({ loggedInPage, page }) => {
    await page.reload();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(loggedInPage.inventoryList).toBeVisible();
  });
});

test.describe('AC-3: Empty fields (decision table)', () => {
  test('TC-009 R1: trống Username + trống Password', { tag: '@AC-3' }, async ({ loginPage, page }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toHaveText(MSG.usernameRequired);
    await expect(page).toHaveURL(isLoginScreen);
  });

  test('TC-010 R2: có Username + trống Password', { tag: '@AC-3' }, async ({ loginPage, page }) => {
    await loginPage.login(standard.username, '');
    await expect(loginPage.errorMessage).toHaveText(MSG.passwordRequired);
    await expect(page).toHaveURL(isLoginScreen);
  });

  test('TC-011 R3: trống Username + có Password', { tag: '@AC-3' }, async ({ loginPage, page }) => {
    await loginPage.login('', standard.password);
    await expect(loginPage.errorMessage).toHaveText(MSG.usernameRequired);
    await expect(page).toHaveURL(isLoginScreen);
  });

  test('TC-022 đóng thông báo lỗi bằng nút X', { tag: '@AC-3' }, async ({ loginPage }) => {
    await loginPage.login(standard.username, '');
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toBeHidden();
    await expect(loginPage.fieldErrorIcons).toHaveCount(0);
    await expect(loginPage.usernameInput).toHaveValue(standard.username);
  });

  test('TC-028 chỉ ô bị thiếu mới bị đánh dấu lỗi', { tag: ['@AC-3', '@KI-01'] }, async ({ loginPage }) => {
    // KI-01 (O-03): the Username field is also marked as error. Known bug → expected to fail.
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'KI-01: ô Username bị tô đỏ dù đã nhập');
    await loginPage.login(standard.username, '');
    await expect(loginPage.passwordInput).toHaveClass(/input_error/);
    await expect(loginPage.usernameInput).not.toHaveClass(/input_error/);
  });
});

test.describe('AC-4: Wrong credentials', () => {
  const wrongCases = [
    { tc: 'TC-012', title: 'sai mật khẩu', username: standard.username, password: invalid.password },
    { tc: 'TC-013', title: 'username không tồn tại', username: invalid.username, password: standard.password },
    { tc: 'TC-014', title: 'sai cả username và mật khẩu', username: invalid.username, password: invalid.password },
    // Q2: case sensitive, no trimming
    { tc: 'TC-015', title: 'username viết hoa bị từ chối', username: standard.username.toUpperCase(), password: standard.password },
    { tc: 'TC-016', title: 'username có khoảng trắng đầu bị từ chối', username: ` ${standard.username}`, password: standard.password },
    { tc: 'TC-017', title: 'mật khẩu thừa khoảng trắng cuối bị từ chối', username: standard.username, password: `${standard.password} ` },
    { tc: 'TC-018', title: 'mật khẩu viết hoa bị từ chối', username: standard.username, password: standard.password.toUpperCase() },
    // Q14: no max length defined → extreme value only
    { tc: 'TC-019', title: 'username 1000 ký tự không làm lỗi trang', username: invalid.veryLongUsername, password: standard.password },
  ];
  for (const { tc, title, username, password } of wrongCases) {
    test(`${tc} ${title}`, { tag: '@AC-4' }, async ({ loginPage, page }) => {
      await loginPage.login(username, password);
      await expect(loginPage.errorMessage).toHaveText(MSG.mismatch);
      await expect(page).toHaveURL(isLoginScreen);
    });
  }

  test('TC-030 thử lại sau lỗi: thông báo cập nhật, nhập đúng thì vào được', { tag: ['@AC-2', '@AC-4'] }, async ({ loginPage, page }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toHaveText(MSG.usernameRequired);

    await loginPage.login(standard.username, invalid.password);
    await expect(loginPage.errorMessage).toHaveText(MSG.mismatch);

    await loginPage.passwordInput.fill(standard.password);
    await loginPage.loginButton.click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });
});

test.describe('AC-5: Locked account', () => {
  test('TC-020 tài khoản bị khóa không đăng nhập được', { tag: ['@AC-5', '@smoke'] }, async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await expect(loginPage.errorMessage).toHaveText(MSG.lockedOut);
    await expect(page).toHaveURL(isLoginScreen);
  });

  test('TC-021 tài khoản bị khóa + sai mật khẩu không lộ trạng thái khóa', { tag: '@AC-5' }, async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut.username, invalid.password);
    await expect(loginPage.errorMessage).toHaveText(MSG.mismatch);
    await expect(page).toHaveURL(isLoginScreen);
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
    test(`${tc} mở thẳng ${path} khi chưa đăng nhập bị chặn`, { tag: smoke ? ['@AC-6', '@smoke'] : '@AC-6' }, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveURL(isLoginScreen);
      await expect(new LoginPage(page).errorMessage).toHaveText(MSG.notLoggedIn(path));
    });
  }

  test('TC-033 cookie phiên tự tạo không được vào trang bên trong', { tag: ['@AC-6', '@KI-02', '@security'] }, async ({ page, context, baseURL }) => {
    // KI-02 (O-21): the site trusts the client-side cookie only. Known bug → expected to fail.
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'KI-02: tự tạo cookie session-username là vào được');
    await context.addCookies([{ name: 'session-username', value: standard.username, url: baseURL! }]);
    await page.goto(protectedPages.inventory);
    await expect(page).toHaveURL(isLoginScreen);
    await expect(new LoginPage(page).errorMessage).toHaveText(MSG.notLoggedIn(protectedPages.inventory));
    await expect(new InventoryPage(page).inventoryList).toBeHidden();
  });
});

test.describe('AC-7: Logout', () => {
  test('TC-026 đăng xuất về trang đăng nhập và xóa phiên', { tag: ['@AC-7', '@smoke'] }, async ({ loggedInPage, page, context }) => {
    await loggedInPage.logout();
    await expect(page).toHaveURL(isLoginScreen);
    await expect(new LoginPage(page).loginButton).toBeVisible();
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'session-username')).toBeUndefined();
  });

  test('TC-027 đăng xuất rồi bấm Back không xem lại được trang sản phẩm', { tag: ['@AC-6', '@AC-7'] }, async ({ loggedInPage, page }) => {
    await loggedInPage.logout();
    await page.goBack();
    await expect(page).toHaveURL(isLoginScreen);
    await expect(new LoginPage(page).errorMessage).toHaveText(MSG.notLoggedIn(protectedPages.inventory));
    await expect(loggedInPage.inventoryList).toBeHidden();
  });
});
