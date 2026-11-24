# Triage Report: run-20261124-150906

- **Phạm vi**: toàn bộ `tests/specs/saucedemo-login-screen.spec.ts` (33 test) · Chromium · 9 workers · 15,8 giây
- **Kết quả chi tiết**: [`run-results/run-20261124-150906.json`](run-results/run-20261124-150906.json)
- **Kiểm tra độ ổn định**: chạy lặp thêm 2 lần (`--repeat-each=2`): **66/66 pass**, không có test chập chờn

## Summary
| Status | Count | Ghi chú |
|--------|-------|---------|
| **Passed** | 31 | |
| **Failed** | 2 | TC-028 (BUG-01), TC-033 (BUG-02): bug đã biết, fail **đúng assertion** của bug. Playwright báo "passed" vì có `test.fail()`, nhưng kết quả test case là **Failed** |
| flaky | 0 | |
| script-issue | 0 | Không cần healer |
| real-bug | **2** | HITL #3: ✅ approved (BUG-01 Low, BUG-02 High), 2026-11-24 |

## Real Bugs (→ HITL #3)

### TC-028: Chỉ ô bị thiếu mới bị đánh dấu lỗi (BUG-01)
- **Error**: `expect(locator).not.toHaveClass(/input_error/)`. Locator `getByPlaceholder('Username')`, received `"input_error form_input error"`
- **Expected** (AC-3, Q6): chỉ ô Password bị đánh dấu lỗi
- **Actual**: ô Username (đã nhập `standard_user`) cũng bị tô đỏ và có icon lỗi
- **Fail đúng chỗ?** ✅ Bước kiểm tra ô Password đã pass; chỉ fail ở bước kiểm tra ô Username
- **Severity estimate**: Low (giao diện, gây hiểu nhầm)

### TC-033: Cookie phiên tự tạo không được vào trang bên trong (BUG-02)
- **Error**: `expect(page).toHaveURL(isLoginScreen)`, received `https://www.saucedemo.com/inventory.html`
- **Expected** (AC-6, Q12): bị đưa về trang đăng nhập, hiện thông báo "You can only access '/inventory.html'…"
- **Actual**: tự tạo cookie `session-username=standard_user` là vào thẳng trang sản phẩm, không cần đăng nhập
- **Fail đúng chỗ?** ✅ Fail ngay ở bước kiểm tra URL sau khi mở trang bằng cookie giả
- **Severity estimate**: Critical với hệ thống thật (vượt qua xác thực). SauceDemo là web demo nên ghi nhận High

## Tái hiện độc lập (bằng tay, không dùng code test)
Mỗi bug được làm lại trong một phiên trình duyệt sạch, dùng locator khác với code test (`#user-name`, `#login-button`), có chụp ảnh:
| Bug | Kết quả | Bằng chứng |
|---|---|---|
| BUG-01 | ✅ Tái hiện được: cả ô Username và Password đều có class `input_error`, 2 icon ✕ | [Ảnh + video](<evidence/bugs/[id_bug_1]_BUG-01/TC-028/README.md>) |
| BUG-02 | ✅ Tái hiện được: chỉ với cookie giả đã vào được trang Products (6 sản phẩm). **Phát hiện thêm**: vào được cả `/checkout-step-one.html`, tức ảnh hưởng tới **toàn bộ** trang bên trong | [Ảnh + video](<evidence/bugs/[id_bug_2]_BUG-02/TC-033/README.md>) |

Evidence đầy đủ của 33 test case (ảnh có khoanh đỏ + ghi chú, video): [`evidence/README.md`](evidence/README.md)

## Ghi nhận khác
| # | Nội dung |
|---|---|
| N1 | TC-006 (`performance_glitch_user`) mất **10,4 giây** cả test, đã sát ngưỡng chờ 10 giây của bước kiểm tra URL. **Nguy cơ chập chờn** nếu mạng chậm hơn. Theo dõi, kèm BUG-03 / IMP-03 |
| N2 | BUG-04 (thông báo cũ không tự mất) không có TC theo Q8, không xuất hiện trong lần chạy này |
