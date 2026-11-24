# Test Data Catalog: SD-102 Sản phẩm, chi tiết, giỏ hàng

> Mật khẩu hợp lệ **không ghi trong test case**. Đọc từ biến môi trường `SAUCE_PASSWORD` (mặc định là mật khẩu demo công khai, xem `tests/data/users.ts`).
> Dữ liệu chuẩn của sản phẩm nằm trong `tests/data/products.ts` (TD-06). Test so trang web với dữ liệu này, **không** so trang với chính nó.

| ID | Tên | Dữ liệu | Dùng cho |
|---|---|---|---|
| TD-01 | User chuẩn | `standard_user` + mật khẩu hợp lệ | Hầu hết TC; TC-035, TC-036, TC-040 làm mốc so sánh |
| TD-02 | `problem_user` | + mật khẩu hợp lệ | TC-004, 011, 018, 024, 031 |
| TD-03 | `error_user` | + mật khẩu hợp lệ | TC-012, 019, 032 |
| TD-04 | `visual_user` | + mật khẩu hợp lệ | TC-005, 013, 033, 035, 036, 040 |
| TD-05 | `performance_glitch_user` | + mật khẩu hợp lệ | TC-034 |
| TD-06 | Danh mục sản phẩm chuẩn (lấy từ `standard_user`, O-01) | 6 sản phẩm: id, tên, giá, mô tả, khóa ảnh (xem bảng dưới; mô tả đầy đủ trong `tests/data/products.ts`) | Mọi TC kiểm tên, giá, ảnh, thứ tự |
| TD-07 | id ngoài khoảng 0–5 | `6`, `99`, `-1` | TC-025 |
| TD-08 | id sai định dạng | `abc`, rỗng, `4abc`, `04`, `4.9`, `0x4` | TC-026 |
| TD-09 | Dữ liệu giỏ sửa tay (`localStorage` khóa `cart-contents`) | `[4,4]` (trùng id), `[4,"x"]` (id lạ) | TC-025 |
| TD-10 | Cookie phiên tự tạo (giống SD-101 TD-08) | `session-username=standard_user`, domain `www.saucedemo.com`, path `/` | TC-045 |

## TD-06: danh mục sản phẩm chuẩn
| id | Tên | Giá | Khóa ảnh (một phần tên file) |
|---|---|---|---|
| 4 | Sauce Labs Backpack | $29.99 | `sauce-backpack` |
| 0 | Sauce Labs Bike Light | $9.99 | `bike-light` |
| 1 | Sauce Labs Bolt T-Shirt | $15.99 | `bolt-shirt` |
| 5 | Sauce Labs Fleece Jacket | $49.99 | `sauce-pullover` |
| 2 | Sauce Labs Onesie | $7.99 | `red-onesie` |
| 3 | Test.allTheThings() T-Shirt (Red) | $15.99 | `red-tatt` |

Thứ tự đúng của 4 kiểu sắp xếp tính từ bảng này (cùng giá thì theo tên A → Z, Q6). Tên file ảnh có thêm mã build (vd `sauce-backpack-1200x1500-<mã>.jpg`) nên chỉ so **khóa ảnh**.

## Thông báo nguyên văn
| ID | Nội dung |
|---|---|
| MSG-01 | `Sorting is broken! This error has been reported to Backtrace.` (hộp thoại của `error_user`, dùng làm bằng chứng BUG-12) |
| MSG-02 | `Epic sadface: You can only access '<path>' when you are logged in.` (giống SD-101 MSG-05; trong code dùng `MSG.notLoggedIn(path)` có sẵn, không tạo hằng mới). Đường dẫn **không có** `?id=` |
| MSG-03 | `ITEM NOT FOUND` (tên hiển thị ở trang sản phẩm không tồn tại) |
