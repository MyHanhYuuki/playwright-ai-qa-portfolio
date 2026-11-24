# Spec Review: SD-102 Sản phẩm, chi tiết sản phẩm, giỏ hàng (SauceDemo)

## Tóm tắt
Người dùng đã đăng nhập xem danh sách 6 sản phẩm, sắp xếp, mở trang chi tiết, thêm / bỏ sản phẩm vào giỏ và xem giỏ hàng trước khi thanh toán. Giỏ hàng phải đúng ở mọi trang và giữ nguyên khi tải lại.

## Acceptance Criteria
| AC-ID | Mô tả | Testable? | Ghi chú |
|-------|-------|-----------|---------|
| AC-1 | Danh sách sản phẩm: ảnh, tên, mô tả, giá, nút "Add to cart" | ✅ | Không nêu số sản phẩm, giá đúng là bao nhiêu. Lấy dữ liệu của `standard_user` làm chuẩn (O-01) |
| AC-2 | Sắp xếp theo tên / giá, mặc định A → Z | ⚠️ | Không nói sản phẩm cùng giá xếp thế nào (Q6), có giữ kiểu sắp xếp khi quay lại không (Q7) |
| AC-3 | Add to cart: nút thành "Remove", biểu tượng giỏ hiện số sản phẩm | ⚠️ | Không nói trường hợp sản phẩm không tồn tại (Q2) |
| AC-4 | Remove: nút về "Add to cart", số giảm, giỏ trống không hiện số | ✅ | |
| AC-5 | Bấm tên / ảnh mở **đúng** chi tiết, có nút thêm/bỏ và quay lại | ✅ | |
| AC-6 | Trang giỏ: liệt kê, bỏ sản phẩm, Continue Shopping, Checkout | ⚠️ | Không nói giỏ trống thì Checkout ra sao (Q5), có tổng tiền / sửa số lượng không (Q8) |
| AC-7 | Giỏ giữ khi tải lại, chuyển trang | ⚠️ | Không nói giỏ gắn với tài khoản hay trình duyệt (Q3), "Reset App State" ở menu (Q4) |
| (chung) | Áp dụng cho tài khoản nào? | ⚠️ | Ticket chỉ nói "dùng lại 6 tài khoản". Các tài khoản đặc biệt có phải hoạt động như `standard_user` không (Q1)? |

## Business Rules (rút ra từ requirement và quan sát)
- BR-1: Có 6 sản phẩm, id 0 → 5. Trang chi tiết đọc id từ URL `?id=<n>`.
- BR-2: Giỏ hàng lưu ở `localStorage` khóa `cart-contents` (mảng id theo **thứ tự thêm**), **không gắn với tài khoản**.
- BR-3: Mỗi sản phẩm chỉ thêm được 1 lần, số lượng luôn là 1 (không có ô sửa số lượng).

## Quan sát thực tế (khám phá web ngày 2026-11-24, Chromium, mỗi tình huống một phiên trình duyệt sạch)
| # | Thao tác | Kết quả quan sát | Ghi chú |
|---|----------|------------------|---------|
| O-01 | `standard_user` mở trang Products | Tiêu đề `Products`, 6 sản phẩm: Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99. Mỗi sản phẩm có ảnh, tên, mô tả, giá, nút `Add to cart` | Dữ liệu chuẩn (TD) |
| O-02 | Chọn 4 kiểu sắp xếp | Dropdown có `Name (A to Z)` (mặc định), `Name (Z to A)`, `Price (low to high)`, `Price (high to low)`. Cả 4 kiểu sắp đúng | ✅ |
| O-03 | Sắp theo giá khi có 2 sản phẩm cùng $15.99 | Bolt T-Shirt luôn đứng trước Test.allTheThings() T-Shirt ở **cả 2 chiều** giá | (Q6) |
| O-04 | Sắp xếp rồi vào chi tiết, quay lại; hoặc tải lại trang | Kiểu sắp xếp về lại `Name (A to Z)` | (Q7) |
| O-05 | Thêm lần lượt 6 sản phẩm, rồi bỏ hết | Số trên giỏ 1 → 6, nút đổi `Remove`. Bỏ hết: số giảm về 5 → 1, rồi **biến mất** | ✅ |
| O-06 | Bấm tên và bấm ảnh từng sản phẩm | Mở `/inventory-item.html?id=<n>` đúng sản phẩm: tên, giá, mô tả, ảnh khớp danh sách (6/6). Có nút `Back to products` | ✅ |
| O-07 | Thêm ở trang chi tiết rồi quay lại | Nút chi tiết thành `Remove`, số giỏ 1, ở danh sách sản phẩm đó cũng là `Remove`. Nút Back của trình duyệt về danh sách | ✅ |
| O-08 | Mở chi tiết id không tồn tại: `6`, `99`, `-1`, `abc`, rỗng | Tên `ITEM NOT FOUND`, giá `$√-1`, ảnh 404, **vẫn có nút `Add to cart`** | (Q2) |
| O-09 | Bấm `Add to cart` ở sản phẩm id=99, rồi mở giỏ | Số trên giỏ là **1** nhưng trang giỏ **không có sản phẩm nào** | 🔴 Số giỏ ≠ giỏ thật (BUG-06) |
| O-10 | Thêm Backpack, Onesie rồi mở giỏ | Tiêu đề `Your Cart`, cột `QTY` / `Description`. Mỗi dòng: số lượng 1, tên, mô tả, giá. Không có ảnh, không có tổng tiền, không sửa được số lượng | (Q8) |
| O-11 | Thêm theo thứ tự Red T-Shirt, Backpack, Bolt T-Shirt | Giỏ hiện đúng thứ tự thêm | ✅ |
| O-12 | Trong giỏ: Remove, bấm tên sản phẩm, Continue Shopping, Checkout | Remove: mất dòng, số giỏ giảm. Tên → trang chi tiết. Continue Shopping → `/inventory.html`. Checkout → `/checkout-step-one.html` | ✅ |
| O-13 | Giỏ trống, mở giỏ, bấm Checkout | Không có thông báo "giỏ trống". Nút Checkout bấm được, sang `/checkout-step-one.html` | (Q5) |
| O-14 | Có hàng trong giỏ: tải lại trang, mở tab mới | Giỏ giữ nguyên | ✅ |
| O-15 | Đăng xuất rồi đăng nhập lại **cùng** tài khoản | Giỏ còn nguyên | ✅ |
| O-16 | `standard_user` thêm 2 sản phẩm, đăng xuất, **`visual_user`** đăng nhập trên cùng trình duyệt | `visual_user` thấy giỏ **2 sản phẩm của người trước** | 🔴 Lộ giỏ sang tài khoản khác (Q3, BUG-07) |
| O-17 | Menu → `Reset App State` ở danh sách, chi tiết, giỏ | Số giỏ và `localStorage` bị xóa, **nhưng** nút vẫn là `Remove` (danh sách, chi tiết) và trang giỏ **vẫn hiện sản phẩm**. Tải lại trang mới đúng | 🔴 Giao diện không cập nhật (Q4, BUG-05) |
| O-18 | `problem_user`: xem danh sách | **Cả 6 ảnh** là cùng một ảnh lỗi `sl-404` | 🔴 (Q1, BUG-08) |
| O-19 | `problem_user`: chọn 4 kiểu sắp xếp | Danh sách **không đổi**, dropdown vẫn `Name (A to Z)`, không báo lỗi | 🔴 (Q1, BUG-09) |
| O-20 | `problem_user`: thêm / bỏ từng sản phẩm (2 lần, mỗi lần phiên sạch) | `Add` **không có tác dụng** với Bolt T-Shirt, Fleece Jacket, Test.allTheThings() T-Shirt. `Remove` ở danh sách **không có tác dụng** với Backpack, Bike Light, Onesie. Bỏ ở **trang giỏ** thì được. 2 lần giống nhau | 🔴 (Q1, BUG-10) |
| O-21 | `problem_user`: bấm từng sản phẩm | **Mở sai** chi tiết: Backpack → id 5 (Fleece Jacket), Bike Light → id 1 (Bolt), Bolt → id 2 (Onesie), Fleece → id 6 (`ITEM NOT FOUND`), Onesie → id 3 (Red T-Shirt), Red T-Shirt → id 4 (Backpack) | 🔴 (Q1, BUG-11) |
| O-22 | `error_user`: chọn kiểu sắp xếp | Hộp thoại `Sorting is broken! This error has been reported to Backtrace.`, danh sách không đổi | 🔴 (Q1, BUG-12) |
| O-23 | `error_user`: thêm / bỏ từng sản phẩm (2 lần) | Giống O-20, cùng 3 + 3 sản phẩm. Console: `Failed to add item to the cart.` / `Failed to remove item from cart.` Ở trang chi tiết, Add cũng lỗi với 3 sản phẩm đó. Ảnh, mở chi tiết đúng | 🔴 (Q1, BUG-13) |
| O-24 | `visual_user`: xem danh sách, tải lại 2 lần | Giá ở danh sách **sai và đổi ngẫu nhiên** mỗi lần tải / sắp xếp (vd Backpack $39.54 → $98.71). Trang chi tiết và giỏ vẫn đúng $29.99 | 🔴 (Q1, BUG-14) |
| O-25 | `visual_user`: so với `standard_user` | Ảnh Backpack là ảnh lỗi `sl-404`. Biểu tượng giỏ lệch vị trí (x 1034, y 39 so với x 1220, y 10) | 🔴 (Q1, Q11, BUG-15, BUG-16) |
| O-26 | `performance_glitch_user`: đo 3 lần | Sắp xếp **~5,04 giây** (3/3 lần, `standard_user` 18 ms). Thêm giỏ, mở chi tiết, mở giỏ ~60–85 ms | (Q10, BUG-17) |
| O-27 | Menu ở trang chi tiết / giỏ | `All Items` về `/inventory.html`. `Dynamic Catalog` có `href="#"`, bấm không làm gì | Ngoài phạm vi (ticket) |
| O-28 | Tải lại `/cart.html` | Server trả mã 404 nhưng trang vẫn hiển thị đúng (ứng dụng một trang) | Không ảnh hưởng người dùng |

> **Lưu ý từ lần khám phá:** lần chạy đầu có 6 tình huống lỗi do **script khám phá** (đọc trang trước khi chuyển trang xong, vòng lặp bấm theo danh sách đã thay đổi). Đã sửa script (chờ URL / phần tử) và chạy lại. Kết quả bảng trên là từ lần chạy đã sửa.

## Dependencies
- SD-101 Đăng nhập (dùng fixture đã đăng nhập).
- `localStorage` của trình duyệt (giỏ hàng).
- `events.backtrace.io`: dịch vụ theo dõi lỗi bên thứ 3 (thông báo lỗi của `error_user` gửi tới đây).

## Phạm vi test
- **Trong phạm vi**: AC-1 → AC-7 với `standard_user`; các tài khoản đặc biệt theo Q1; sản phẩm không tồn tại; giỏ trống; giữ giỏ khi tải lại / đăng nhập lại / đổi tài khoản; Reset App State (Q4).
- **Ngoài phạm vi** (ghi trong `viewpoint.csv` với `scope=out`): bước thanh toán (SD-103), hiệu năng (Q10), giữ kiểu sắp xếp (Q7), tổng tiền / sửa số lượng (Q8), About, Dynamic Catalog, mạng xã hội, accessibility.

## Review checklist
| Mục | Kết quả | Ghi chú |
|---|---|---|
| Chức năng được mô tả đầy đủ? | ⚠️ | Đủ luồng chính. Thiếu giỏ trống, Reset App State, giỏ theo tài khoản |
| AC đo lường được, testable? | ⚠️ | AC-1 không nêu dữ liệu chuẩn; không nói các tài khoản đặc biệt (Q1) |
| Validation và error handling? | ❌ | Không nói sản phẩm không tồn tại (Q2), giỏ trống (Q5) |
| Ràng buộc kỹ thuật / business? | ⚠️ | Đã suy ra BR-1 → BR-3 từ quan sát |
| Dependency được liệt kê? | ⚠️ | Có SD-101. Không nhắc `localStorage` |
| Edge case, negative? | ❌ | Không đề cập. Đã bổ sung qua khám phá (O-03, O-08, O-09, O-13, O-16, O-17) |
| Có câu hỏi blocking? | ✅ | 13 câu (6 blocking, 7 non-blocking): xem [`q-and-a.md`](q-and-a.md). Đang chờ trả lời (HITL #1) |

**Bug phát hiện sớm**: xem [`known-issues.md`](known-issues.md) (BUG-05 → BUG-17).
