# BUG-01: tái hiện bằng tay (2026-11-24)

Trình duyệt sạch (context mới cho mỗi lần thử), dùng locator khác code test (`#user-name`, `#password`, `#login-button`).

| # | Thao tác | Thông báo | Class ô Username | Class ô Password | Ảnh |
|---|---|---|---|---|---|
| 1 | Chỉ nhập Username, bấm Login | `Password is required` | `input_error` ❌ (không nên có) | `input_error` ✅ | ![](01-chi-nhap-username.png) |
| 2 | Chỉ nhập Password, bấm Login | `Username is required` | `input_error` ✅ | `input_error` ❌ (không nên có) | ![](02-chi-nhap-password.png) |

Kết luận: lỗi xảy ra **cả hai chiều**. Với mọi lỗi "required", cả 2 ô đều bị tô đỏ.
