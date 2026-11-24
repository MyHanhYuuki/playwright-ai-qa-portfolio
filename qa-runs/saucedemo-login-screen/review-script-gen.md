# Review: bước script-gen, SD-101 Đăng nhập

- **Ngày**: 2026-11-24 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ✅ **Đạt**, có 3 lưu ý cho bước executor
- **Phạm vi**: `tests/pages/LoginPage.ts`, `tests/pages/InventoryPage.ts`, `tests/fixtures/index.ts`, `tests/data/messages.ts`, `tests/specs/saucedemo-login-screen.spec.ts`

## Checklist
| Mục | Kết quả |
|---|---|
| Mỗi TC automatable có đúng 1 test, tên bắt đầu bằng TC id, có tag @AC | ✅ 33/33 (kiểm bằng `--list`) |
| Locator theo thứ tự ưu tiên, không XPath, không chờ cứng, không `networkidle` | ✅ (2 ngoại lệ có lý do, xem D1) |
| Assertion theo expected trong test case (nguyên văn thông báo, URL) | ✅ |
| Test bug đã biết dùng `test.fail()` kèm KI id | ✅ TC-028 (KI-01), TC-033 (KI-02) |
| Mỗi test độc lập (mỗi test một phiên trình duyệt mới) | ✅ |
| Page Object không chứa assertion nghiệp vụ | ✅ Chỉ fixture `loggedInPage` kiểm tra điều kiện trước (đã vào trang Products) |
| Mật khẩu không viết thẳng trong spec | ✅ Lấy từ `tests/data/users.ts` |
| Tag @smoke khớp test-cases.csv | ✅ TC-001, 003, 020, 023, 026 |

## D. Lưu ý
| # | Vấn đề | Mức | Đề xuất |
|---|---|---|---|
| D1 | 2 locator dùng CSS: `.error_icon` (icon ✕ không có role hay test id) và class `input_error` (TC-028) | 🟡 Minor | Chấp nhận: web không có cách nào khác. Nếu là dự án thật, nhờ dev thêm `data-test` |
| D2 | **`test.fail()` sẽ "pass" khi test fail vì BẤT KỲ lý do gì**, kể cả locator sai. Có thể che lỗi của chính script | 🟠 Major | Ở bước executor phải **mở báo cáo, kiểm tra TC-028 và TC-033 fail đúng ở dòng assertion của bug**, không phải lỗi khác |
| D3 | TC-026 kiểm tra cookie bằng `context.cookies()`: không phải web-first assertion | 🟡 Minor | Chấp nhận: cookie không phải phần tử trên trang, không cần chờ |
