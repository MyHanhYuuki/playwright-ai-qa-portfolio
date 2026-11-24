# Bug phát hiện sớm và lưu ý khi test: SD-102 Sản phẩm, chi tiết, giỏ hàng

> Các bug và vấn đề **đã thấy trong lúc phân tích, trước khi chạy test**. Mỗi bug phải được test tương ứng bắt được (fail đúng chỗ). Bug nào không bắt được tức là test sai.
> Bug chỉ chính thức thành **defect** sau khi chạy test và duyệt ở HITL #3 (`defects.md`).
> **BUG-xx đánh số chung cả repo**: SD-101 đã dùng BUG-01 → BUG-04, nên ở đây bắt đầu từ BUG-05.
> Mọi bug của tài khoản đặc biệt (BUG-08 → BUG-17) **phụ thuộc câu trả lời Q1**.

## Bug đã biết
| ID | Mô tả | Bằng chứng | Mức (dự kiến) | Test phải bắt | Trạng thái |
|---|---|---|---|---|---|
| BUG-05 | **Reset App State** xóa giỏ nhưng giao diện không cập nhật: nút vẫn `Remove` (danh sách, chi tiết), trang giỏ vẫn hiện sản phẩm, tới khi tải lại trang | O-17 | Medium (người dùng tưởng giỏ còn hàng) | TC kiểm tra cả 3 trang, dự kiến **FAIL** | Chờ Q4 |
| BUG-06 | Trang chi tiết sản phẩm **không tồn tại** (`?id=99`) vẫn có nút `Add to cart`. Bấm vào: số trên giỏ là 1 nhưng giỏ **trống** | O-08, O-09 | Low (phải sửa URL tay mới gặp) | TC dự kiến **FAIL** | Chờ Q2 |
| BUG-07 | Giỏ hàng **không gắn với tài khoản**: người đăng nhập sau trên cùng trình duyệt thấy giỏ của người trước | O-16 | High nếu là hệ thống thật (lộ thông tin trên máy dùng chung) | TC dự kiến **FAIL** | Chờ Q3 |
| BUG-08 | `problem_user`: **cả 6 ảnh** sản phẩm là ảnh lỗi `sl-404` | O-18 | Medium | TC dự kiến **FAIL** | Chờ Q1 |
| BUG-09 | `problem_user`: **sắp xếp không hoạt động** (danh sách không đổi, không báo lỗi) | O-19 | High (chức năng chính) | TC dự kiến **FAIL** (cả 3 kiểu khác A → Z) | Chờ Q1 |
| BUG-10 | `problem_user`: **Add to cart không có tác dụng** với Bolt T-Shirt, Fleece Jacket, Red T-Shirt; **Remove ở danh sách không có tác dụng** với Backpack, Bike Light, Onesie (bỏ ở trang giỏ thì được) | O-20 | High (không mua được 3/6 sản phẩm) | TC thêm và bỏ **cả 6 sản phẩm** (`expect.soft`), dự kiến **FAIL** | Chờ Q1 |
| BUG-11 | `problem_user`: bấm sản phẩm **mở sai trang chi tiết** (lệch id; Fleece Jacket mở `ITEM NOT FOUND`) | O-21 | High | TC mở chi tiết **cả 6 sản phẩm**, dự kiến **FAIL** | Chờ Q1 |
| BUG-12 | `error_user`: chọn sắp xếp hiện hộp thoại `Sorting is broken!…`, danh sách không đổi | O-22 | High | TC dự kiến **FAIL** | Chờ Q1 |
| BUG-13 | `error_user`: Add / Remove lỗi giống BUG-10 (cùng 3 + 3 sản phẩm), cả ở trang chi tiết. Console báo `Failed to add item to the cart.` | O-23 | High | TC thêm và bỏ cả 6 sản phẩm, dự kiến **FAIL** | Chờ Q1 |
| BUG-14 | `visual_user`: **giá ở danh sách sai, đổi ngẫu nhiên** mỗi lần tải; khác giá ở trang chi tiết và giỏ | O-24 | Critical nếu là hệ thống thật (hiển thị sai giá) | TC so giá danh sách với dữ liệu chuẩn, dự kiến **FAIL** | Chờ Q1 |
| BUG-15 | `visual_user`: ảnh Backpack là ảnh lỗi `sl-404` | O-25 | Low | TC kiểm ảnh cả 6 sản phẩm, dự kiến **FAIL** | Chờ Q1 |
| BUG-16 | `visual_user`: biểu tượng giỏ hàng **lệch vị trí** so với `standard_user` | O-25 | Low (giao diện) | TC so tọa độ, dự kiến **FAIL** | Chờ Q1, Q11 |
| BUG-17 | `performance_glitch_user`: sắp xếp mất **~5,04 giây** (`standard_user` 18 ms) | O-26 | Vấn đề hiệu năng, chưa có AC | TC sắp xếp **PASS** (không đánh fail theo thời gian), ghi lại thời gian | Chờ Q10. Báo kèm IMP-04 |

## Vấn đề không phải bug (đề xuất cải tiến)
IMP-01 → IMP-05 trong [`improvements.md`](improvements.md).

## ⚠️ Lưu ý cho bước viết code và chạy test
1. **Bug có biến thể thì TC phủ mọi biến thể** (R7): BUG-10, BUG-13 thử **cả 6 sản phẩm** (thêm và bỏ), BUG-11 mở **cả 6** trang chi tiết, BUG-05 kiểm **cả 3 trang**. Dùng `expect.soft` để chạy hết các biến thể.
2. **Test bug đã biết**: assertion theo **expected đúng** (giống `standard_user`), `test.fail(true, 'BUG-xx: …')` + tag `@BUG-xx`. Đọc lỗi để chắc test fail **đúng assertion của bug**.
3. **Dữ liệu chuẩn** (tên, giá, mô tả, ảnh) lấy từ `standard_user` (O-01), để trong `tests/data/products.ts`. Không đọc giá từ trang để so với chính trang.
4. **Mỗi test dùng phiên sạch**: giỏ nằm trong `localStorage`, test này không được để lại giỏ cho test khác. Playwright tạo context mới cho mỗi test nên đã đảm bảo; **không** dùng chung `storageState` có giỏ.
5. **Không chờ cứng**: chờ số trên giỏ, chờ nút đổi chữ, chờ URL. `performance_glitch_user` sắp xếp ~5 giây: tăng timeout **riêng** bước đó (≥ 10 giây), không tăng `retries`.
6. `error_user` bật hộp thoại khi sắp xếp: test phải bắt hộp thoại (`page.on('dialog')`) để kiểm tra nội dung và đóng nó, nếu không test sẽ treo.
7. **Không kiểm vị trí bằng ảnh chụp từng pixel** (Q11). So tọa độ biểu tượng giỏ giữa 2 tài khoản, cho phép sai số nhỏ.
