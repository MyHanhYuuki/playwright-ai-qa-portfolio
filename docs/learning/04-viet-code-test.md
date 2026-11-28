# Bài 4: Viết code test (script-gen) theo Page Object Model

> Bước **[3] script-gen**. Kết quả: [`tests/`](../../tests/) · Review: [`review-script-gen.md`](../../qa-runs/saucedemo-login-screen/reviews/review-script-gen.md)

## 🎯 Tại sao học
Đây là phần "automation" thật sự: biến 33 test case trên giấy thành code chạy tự động. Code viết tốt thì UI đổi chỉ cần sửa **một chỗ**. Viết ẩu thì mỗi lần UI đổi lại phải sửa hàng chục test.

## 🏭 Ngoài thực tế
- Bộ test automation sống lâu hơn nhiều so với người viết ra nó. Người sau phải đọc hiểu và sửa được.
- Lỗi phổ biến nhất của người mới: copy-paste locator vào từng test. UI đổi một nút là phải sửa 30 chỗ.

## 👨‍🏫 Làm mẫu

### 1. Cấu trúc code
```
tests/
├── pages/                  ← Page Object: mỗi màn hình một class
│   ├── LoginPage.ts        ← ô nhập, nút Login, thông báo lỗi + thao tác login()
│   └── InventoryPage.ts    ← tiêu đề, danh sách sản phẩm, menu + thao tác logout()
├── data/                   ← dữ liệu test, tách khỏi code
│   ├── users.ts            ← tài khoản (mật khẩu đọc từ biến môi trường)
│   └── messages.ts         ← thông báo lỗi nguyên văn, dữ liệu sai, trang được bảo vệ
├── fixtures/index.ts       ← phần chuẩn bị dùng chung: loginPage (đã mở), loggedInPage (đã đăng nhập)
└── specs/saucedemo-login-screen.spec.ts   ← 33 test
```

### 2. Page Object Model (POM): vì sao?
```ts
// ❌ Không dùng POM: locator lặp lại trong mọi test
await page.locator('#user-name').fill('standard_user');

// ✅ Dùng POM: locator khai báo 1 lần trong LoginPage
await loginPage.login(standard.username, standard.password);
```
UI đổi thì chỉ sửa trong `LoginPage.ts`, 33 test giữ nguyên.

### 3. Chọn locator (đã kiểm tra trên web thật trước khi viết)
| Phần tử | Locator | Vì sao |
|---|---|---|
| Nút Login | `getByRole('button', { name: 'Login' })` | Ưu tiên số 1: giống cách người dùng nhìn thấy |
| Ô Username | `getByPlaceholder('Username')` | Trang không có `<label>`, nên placeholder là lựa chọn gần người dùng nhất |
| Thông báo lỗi | `getByTestId('error')` | SauceDemo có sẵn `data-test` |
| Link Logout | `getByTestId(...)` thay vì `getByRole` | Link bị ẩn trong lúc menu đang mở ra, nên role locator không ổn định |
| Icon ✕ trong ô | `locator('.error_icon')` | Không có cách nào khác (phương án cuối) |

### 4. Một test trông như thế nào
```ts
test('TC-020 tài khoản bị khóa không đăng nhập được', { tag: ['@AC-5', '@smoke'] }, async ({ loginPage, page }) => {
  await loginPage.login(users.lockedOut.username, users.lockedOut.password);   // Act
  await expect(loginPage.errorMessage).toHaveText(MSG.lockedOut);              // Assert: nguyên văn
  await expect(page).toHaveURL(isLoginScreen);                                  // vẫn ở trang đăng nhập
});
```
- **Tên bắt đầu bằng TC id**: lọc chạy riêng bằng `npx playwright test -g "TC-020"`.
- **Tag `@AC-5`**: truy vết về yêu cầu. `@smoke` để chạy nhanh bằng `npm run test:smoke`.
- **Fixture `loginPage`**: test nhận sẵn trang đăng nhập đã mở, không lặp lại bước mở trang.

### 5. Test có dữ liệu khác nhau nhưng cùng bước: dùng vòng lặp
TC-012 → TC-019 cùng bước "nhập sai rồi kiểm tra thông báo", chỉ khác dữ liệu, nên viết **một lần** rồi lặp qua danh sách dữ liệu (data-driven test).

### 6. Test của bug đã biết
```ts
test.fail(true, 'BUG-01: ô Username bị tô đỏ dù đã nhập');
```
Test vẫn kiểm tra **hành vi đúng**. Vì bug đang tồn tại nên test fail, và `test.fail()` biến kết quả đó thành "đúng như dự kiến", CI không đỏ. Khi dev sửa bug, test sẽ báo "pass bất ngờ" để mình biết mà bỏ `test.fail()`.
> ⚠️ Rủi ro: `test.fail()` cũng "pass" khi test fail vì **lỗi khác** (vd: locator sai). Ở Bài 5 phải kiểm tra test fail **đúng chỗ**.

### 7. Kiểm tra code biên dịch được (chưa chạy test)
```bash
npx playwright test --list tests/specs/saucedemo-login-screen.spec.ts   # → Total: 33 tests
```
Chạy test và phân loại kết quả là việc của **Bài 5 (executor)**.

## 👉 Bạn tự làm
1. Mở `tests/specs/saucedemo-login-screen.spec.ts`, đối chiếu 3 test bất kỳ với `test-cases.csv`: bước và expected có khớp không?
2. Thử: `npx playwright test -g "TC-003" --headed` để xem trình duyệt tự chạy test.
3. Thử làm test fail: sửa `MSG.lockedOut` thành chữ khác, chạy `-g "TC-020"`, xem báo lỗi, rồi sửa lại.

## ⚠️ Lỗi hay gặp
| Lỗi | Cách tránh |
|---|---|
| Copy locator vào từng test | Khai báo trong Page Object |
| `waitForTimeout(3000)` | Dùng `expect(...).toBeVisible()`, `toHaveURL()`: tự chờ |
| Assertion theo hành vi web đang làm | Assertion theo **expected trong test case** |
| Test phụ thuộc nhau (test B dùng kết quả test A) | Mỗi test tự chuẩn bị bằng fixture |
| Viết mật khẩu thẳng vào test | Lấy từ `tests/data` |
| `check()` hết giờ dù locator đúng: tick xong thì ô biến mất (vd danh sách chỉ hiện việc chưa xong) | `check()` = click **rồi tự kiểm lại** ô đã tick. Ô biến mất thì Playwright tìm lại locator: không còn gì khớp thì chờ tới hết giờ, **còn khớp ô khác thì tick nhầm ô đó** mà không báo lỗi. Dùng `click()`: trước đó khẳng định `await expect(o).not.toBeChecked()`, sau đó kiểm kết quả mong đợi (ô biến mất, bộ đếm giảm). Debug theo thứ tự: locator → giao diện sau thao tác → hàm thao tác làm gì phía sau |
| Test AI viết **pass nhưng kiểm sai** (assertion drift), vd kiểm chữ "thành công" vốn nằm sẵn ở tiêu đề hoặc trong ô nhập | Đối chứng **trước** thao tác (chữ đó chưa có), chỉ đọc phần **mới xuất hiện**; nghi ngờ thì cố tình làm hỏng tính năng một lần (`page.route` trả 500) xem test có đỏ không. Soát thêm 4 kiểu lệch chuẩn khác của code AI: locator, dữ liệu bịa, import, cấu trúc (checklist trong `qa-reviewer.md`) |

## ✅ Checklist
- [ ] Giải thích được Page Object Model và lợi ích
- [ ] Biết thứ tự ưu tiên locator, giải thích được vì sao Logout dùng `getByTestId`
- [ ] Hiểu fixture `loginPage`, `loggedInPage` làm gì
- [ ] Hiểu `test.fail()` dùng khi nào và rủi ro của nó

## ❓ Câu hỏi liên quan

### Q1. Page Object Model là gì? Lợi ích?
**Trả lời:**
- Mỗi màn hình là một class, chứa **locator** và **thao tác** của màn hình đó.
- Test chỉ gọi thao tác (`loginPage.login(...)`), không đụng locator.
- Lợi ích: UI đổi thì sửa **một chỗ**; test ngắn, dễ đọc như kịch bản test case.

### Q2. Vì sao ưu tiên `getByRole` hơn CSS hay XPath?
**Trả lời:**
- `getByRole` tìm phần tử **theo cách người dùng thấy** (nút tên "Login"), nên ít bị ảnh hưởng khi dev đổi class, id hay cấu trúc HTML.
- CSS, XPath bám vào cấu trúc kỹ thuật, nên đổi giao diện là gãy.
- Thêm một lợi ích: nếu `getByRole` không tìm được, thường là trang có **vấn đề accessibility**.

### Q3. Fixture là gì? Khác `beforeEach` thế nào?
**Trả lời:**
- Fixture là phần chuẩn bị mà test **khai báo cần dùng** (`async ({ loginPage }) => ...`). Playwright chỉ chuẩn bị đúng những gì test cần.
- `beforeEach` chạy cho **mọi** test trong nhóm, kể cả test không cần.
- Fixture dùng lại được ở nhiều file, gom chung vào `tests/fixtures`.

### Q4. Data-driven test là gì?
**Trả lời:**
- Viết **một** kịch bản test rồi chạy với **nhiều bộ dữ liệu**.
- Ví dụ TC-012 → TC-019: cùng bước "nhập sai, kiểm tra thông báo", khác dữ liệu, nên lặp qua một mảng dữ liệu.
- Thêm trường hợp mới chỉ cần thêm một dòng dữ liệu.
