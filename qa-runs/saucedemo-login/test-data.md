# Test Data Catalog: SD-101 Đăng nhập

> Mật khẩu hợp lệ **không ghi trong test case**. Đọc từ biến môi trường `SAUCE_PASSWORD` (mặc định là mật khẩu demo công khai, xem `tests/data/users.ts`).

| ID | Tên | Dữ liệu | Dùng cho |
|---|---|---|---|
| TD-01 | User chuẩn | `standard_user` + mật khẩu hợp lệ | TC-003, 004, 010, 011, 022, 026→031 |
| TD-02 | Các user hợp lệ có hành vi đặc biệt (mỗi user một phân vùng) | `problem_user`, `performance_glitch_user`, `error_user`, `visual_user` + mật khẩu hợp lệ | TC-005 → TC-008 |
| TD-03 | User bị khóa | `locked_out_user` | TC-020, TC-021 |
| TD-04 | Thông tin sai | username `unknown_user`, mật khẩu `wrong_password` | TC-012, 013, 014, 021, 030 |
| TD-05 | Biến thể hoa thường, khoảng trắng | `STANDARD_USER`, `" standard_user"`, mật khẩu thừa dấu cách cuối, mật khẩu viết hoa | TC-015 → TC-018 |
| TD-06 | Chuỗi rất dài | Username = 1000 ký tự `a` | TC-019 |
| TD-07 | Trang được bảo vệ | `/inventory.html`, `/cart.html`, `/checkout-step-one.html`, `/inventory-item.html?id=4` | TC-023 → TC-025, TC-032 |
| TD-08 | Cookie phiên tự tạo | Cookie `session-username=standard_user`, domain `www.saucedemo.com`, path `/` | TC-033 |

## Thông báo lỗi chuẩn (expected, so khớp nguyên văn theo Q1)
| Mã | Nội dung |
|---|---|
| MSG-01 | `Epic sadface: Username is required` |
| MSG-02 | `Epic sadface: Password is required` |
| MSG-03 | `Epic sadface: Username and password do not match any user in this service` |
| MSG-04 | `Epic sadface: Sorry, this user has been locked out.` |
| MSG-05 | `Epic sadface: You can only access '<path>' when you are logged in.` |
