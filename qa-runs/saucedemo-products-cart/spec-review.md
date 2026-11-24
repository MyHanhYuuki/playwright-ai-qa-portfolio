# Spec Review: SD-102 Sản phẩm, chi tiết sản phẩm, giỏ hàng (SauceDemo)

## Tóm tắt
Người dùng đã đăng nhập xem danh sách 6 sản phẩm, sắp xếp, mở trang chi tiết, thêm / bỏ sản phẩm vào giỏ và xem giỏ hàng trước khi thanh toán. Giỏ hàng phải đúng ở mọi trang và giữ nguyên khi tải lại.

## Acceptance Criteria
| AC-ID | Mô tả | Testable? | Ghi chú |
|-------|-------|-----------|---------|
| AC-1 | Danh sách sản phẩm: ảnh, tên, mô tả, giá, nút "Add to cart" | ✅ | Không nêu số sản phẩm, giá đúng là bao nhiêu. Lấy dữ liệu của `standard_user` làm chuẩn (O-01) |
| AC-2 | Sắp xếp theo tên / giá, mặc định A → Z | ⚠️ | Không nói sản phẩm cùng giá xếp thế nào (Q6), có giữ kiểu sắp xếp khi quay lại không (Q7) |
| AC-3 | Add to cart: nút thành "Remove", biểu tượng giỏ hiện số sản phẩm | ⚠️ | Không nói trường hợp sản phẩm không tồn tại hoặc dữ liệu giỏ sai (Q2) |
| AC-4 | Remove: nút về "Add to cart", số giảm, giỏ trống không hiện số | ✅ | |
| AC-5 | Bấm tên / ảnh mở **đúng** chi tiết, có nút thêm/bỏ và quay lại | ✅ | |
| AC-6 | Trang giỏ: liệt kê, bỏ sản phẩm, Continue Shopping, Checkout | ⚠️ | Không nói giỏ trống thì Checkout ra sao (Q5), có tổng tiền / sửa số lượng không (Q8) |
| AC-7 | Giỏ giữ khi tải lại, chuyển trang | ⚠️ | Không nói giỏ gắn với tài khoản hay trình duyệt (Q3), "Reset App State" ở menu (Q4). **Giỏ theo tài khoản (TVP-018) là yêu cầu bổ sung từ Q3, không có trong AC-7** |
| (chung) | Áp dụng cho tài khoản nào? | ⚠️ | Ticket chỉ nói "dùng lại 6 tài khoản". Các tài khoản đặc biệt có phải hoạt động như `standard_user` không (Q1)? `locked_out_user` không đăng nhập được nên không áp dụng |

## Business Rules (rút ra từ requirement)
- BR-1: Có 6 sản phẩm, id 0 → 5. Trang chi tiết đọc id từ URL `?id=<n>` (suy ra từ AC-5 và quan sát O-06).

**Hành vi hiện tại, chưa phải quy tắc** (chờ trả lời, không dùng làm expected):
- Giỏ lưu ở `localStorage` khóa `cart-contents` (mảng id theo thứ tự thêm), **không gắn với tài khoản** (O-14, O-16). Chờ Q3.
- Mỗi sản phẩm chỉ thêm được 1 lần qua giao diện, số lượng hiện là 1. Sửa tay dữ liệu thì có thể ra 2 dòng cùng sản phẩm (O-31). Chờ Q2.

## Quan sát thực tế (khám phá web ngày 2026-11-24, Chromium, mỗi tình huống một phiên trình duyệt sạch)
Cột **Màn hình**: Danh sách = `/inventory.html` · Chi tiết = `/inventory-item.html?id=<n>` · Giỏ = `/cart.html` · Cả 3 = mọi màn hình của chức năng.

| # | Màn hình | Thao tác | Kết quả quan sát | Ghi chú |
|---|---|----------|------------------|---------|
| O-01 | Danh sách | `standard_user` mở trang Products | Tiêu đề `Products`, 6 sản phẩm: Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99. Mỗi sản phẩm có ảnh, tên, mô tả, giá, nút `Add to cart` | Dữ liệu chuẩn |
| O-02 | Danh sách | Chọn 4 kiểu sắp xếp | Dropdown có `Name (A to Z)` (mặc định), `Name (Z to A)`, `Price (low to high)`, `Price (high to low)`. Cả 4 kiểu sắp đúng | ✅ |
| O-03 | Danh sách | Sắp theo giá khi có 2 sản phẩm cùng $15.99 | Bolt T-Shirt luôn đứng trước Test.allTheThings() T-Shirt ở **cả 2 chiều** giá | (Q6) |
| O-04 | Danh sách → Chi tiết | Sắp xếp rồi vào chi tiết, quay lại; hoặc tải lại trang | Kiểu sắp xếp về lại `Name (A to Z)` | (Q7) |
| O-05 | Danh sách | Thêm lần lượt 6 sản phẩm, rồi bỏ hết | Số trên giỏ 1 → 6, nút đổi `Remove`. Bỏ hết: số giảm về 5 → 1, rồi **biến mất** | ✅ |
| O-06 | Danh sách → Chi tiết | Bấm tên và bấm ảnh từng sản phẩm | Mở `/inventory-item.html?id=<n>` đúng sản phẩm: tên, giá, mô tả, ảnh khớp danh sách (6/6). Có nút `Back to products` | ✅ |
| O-07 | Chi tiết | Thêm ở trang chi tiết rồi quay lại | Nút chi tiết thành `Remove`, số giỏ 1, ở danh sách sản phẩm đó cũng là `Remove`. Nút Back của trình duyệt về danh sách | ✅ |
| O-08 | Chi tiết | Mở chi tiết id không tồn tại: `6`, `99`, `-1`, `abc`, rỗng | Tên `ITEM NOT FOUND`, giá `$√-1`, ảnh 404, **vẫn có nút `Add to cart`** | (Q2, IMP-06) |
| O-09 | Chi tiết + Giỏ | Bấm `Add to cart` ở sản phẩm id=99, rồi mở giỏ | Số trên giỏ là **1** nhưng trang giỏ **không có sản phẩm nào** | 🔴 Số giỏ ≠ giỏ thật (BUG-06) |
| O-10 | Giỏ | Thêm Backpack, Onesie rồi mở giỏ | Tiêu đề `Your Cart`, cột `QTY` / `Description`. Mỗi dòng: số lượng 1, tên, mô tả, giá. Không có ảnh, không có tổng tiền, không sửa được số lượng | (Q8) |
| O-11 | Giỏ | Thêm theo thứ tự Red T-Shirt, Backpack, Bolt T-Shirt | Giỏ hiện đúng thứ tự thêm | (Q12) |
| O-12 | Giỏ | Trong giỏ: Remove, bấm tên sản phẩm, Continue Shopping, Checkout | Remove: mất dòng, số giỏ giảm. Tên → trang chi tiết. Continue Shopping → `/inventory.html`. Checkout → `/checkout-step-one.html` | ✅ |
| O-13 | Giỏ | Giỏ trống, mở giỏ, bấm Checkout | Không có thông báo "giỏ trống". Nút Checkout bấm được, sang `/checkout-step-one.html` | (Q5, BUG-19) |
| O-14 | Cả 3 | Có hàng trong giỏ: tải lại trang, mở tab mới | Giỏ giữ nguyên | ✅ |
| O-15 | Cả 3 | Đăng xuất rồi đăng nhập lại **cùng** tài khoản | Giỏ còn nguyên | ✅ |
| O-16 | Cả 3 | `standard_user` thêm 2 sản phẩm, đăng xuất, **`visual_user`** đăng nhập trên cùng trình duyệt | `visual_user` thấy giỏ **2 sản phẩm của người trước** | 🔴 Lộ giỏ sang tài khoản khác (Q3, BUG-07) |
| O-17 | Cả 3 | Menu → `Reset App State` ở danh sách, chi tiết, giỏ | Số giỏ và `localStorage` bị xóa, **nhưng** nút vẫn là `Remove` (danh sách, chi tiết) và trang giỏ **vẫn hiện sản phẩm**. Tải lại trang mới đúng | 🔴 Giao diện không cập nhật (Q4, BUG-05) |
| O-18 | Danh sách | `problem_user`: xem danh sách | **Cả 6 ảnh** là cùng một ảnh lỗi `sl-404` | 🔴 (Q1, BUG-08) |
| O-19 | Danh sách | `problem_user`: chọn 4 kiểu sắp xếp | Danh sách **không đổi**, dropdown vẫn `Name (A to Z)`, không báo lỗi | 🔴 (Q1, BUG-09) |
| O-20 | Danh sách + Chi tiết | `problem_user`: thêm / bỏ từng sản phẩm ở **danh sách** và **trang chi tiết** (2 lần, mỗi lần phiên sạch) | `Add` **không có tác dụng** với Bolt T-Shirt, Fleece Jacket, Test.allTheThings() T-Shirt. `Remove` **không có tác dụng** với Backpack, Bike Light, Onesie. **Giống nhau ở danh sách và trang chi tiết.** Bỏ ở **trang giỏ** thì được | 🔴 (Q1, BUG-10). Trang chi tiết bổ sung sau review A1 |
| O-21 | Danh sách → Chi tiết | `problem_user`: bấm từng sản phẩm | **Mở sai** chi tiết: Backpack → id 5 (Fleece Jacket), Bike Light → id 1 (Bolt), Bolt → id 2 (Onesie), Fleece → id 6 (`ITEM NOT FOUND`), Onesie → id 3 (Red T-Shirt), Red T-Shirt → id 4 (Backpack) | 🔴 (Q1, BUG-11) |
| O-22 | Danh sách | `error_user`: chọn kiểu sắp xếp | Hộp thoại `Sorting is broken! This error has been reported to Backtrace.`, danh sách không đổi | 🔴 (Q1, BUG-12) |
| O-23 | Danh sách + Chi tiết | `error_user`: thêm / bỏ từng sản phẩm ở danh sách và trang chi tiết (2 lần) | Giống O-20, cùng 3 + 3 sản phẩm, **cả ở trang chi tiết** (Add và Remove). Console: `Failed to add item to the cart.` / `Failed to remove item from cart.` Ảnh và mở chi tiết đúng | 🔴 (Q1, BUG-13) |
| O-24 | Danh sách | `visual_user`: xem danh sách, tải lại 2 lần | Giá ở danh sách **sai và đổi ngẫu nhiên** mỗi lần tải / sắp xếp (vd Backpack $39.54 → $98.71). Trang chi tiết và giỏ vẫn đúng $29.99 | 🔴 (Q1, BUG-14) |
| O-25 | Danh sách | `visual_user`: so với `standard_user` | Ảnh Backpack là ảnh lỗi `sl-404` (BUG-15). Biểu tượng giỏ lệch vị trí (x 1034, y 39 so với x 1220, y 10), nút Add của Red T-Shirt lệch phải ~54 px, biểu tượng menu xoay ~3° (BUG-16) | 🔴 (Q1, Q11) |
| O-26 | Danh sách | `performance_glitch_user`: đo 3 lần | Sắp xếp **~5,04 giây** (3/3 lần, `standard_user` 18 ms). Thêm giỏ, mở chi tiết, mở giỏ ~60–85 ms | (Q10, BUG-17) |
| O-27 | Chi tiết + Giỏ (menu) | Menu ở trang chi tiết / giỏ | `All Items` về `/inventory.html`. `Dynamic Catalog` có `href="#"`, bấm không làm gì | (Q13) |
| O-28 | Giỏ | Tải lại `/cart.html` | Server trả mã 404 nhưng trang vẫn hiển thị đúng (ứng dụng một trang) | Không ảnh hưởng người dùng |
| O-29 | Giỏ | `visual_user`: mở trang giỏ | Nút **`Checkout` bị đẩy lên góc trên** (x 1060, y 0, vùng tiêu đề), thay vì cùng hàng với `Continue Shopping` (`standard_user`: x 1045, y 392). Vẫn bấm được | 🔴 (Q1, BUG-18). Phát hiện ở review A2 |
| O-30 | Chi tiết + Giỏ | Chưa đăng nhập, tự tạo cookie `session-username=standard_user`, mở `/cart.html`, `/inventory-item.html?id=4` | **Vào được** cả 2 trang. Cookie tên lạ hoặc `locked_out_user` thì bị chặn về `/` | 🔴 Biến thể của BUG-02 (SD-101 chỉ kiểm `/inventory.html`). Phát hiện ở review A3 |
| O-31 | Giỏ | Sửa tay `cart-contents` thành `[4,4]` hoặc `[4,"x"]` | Số trên giỏ là **2** (đếm độ dài mảng). `[4,4]` hiện 2 dòng Backpack | Cùng nguyên nhân BUG-06 (Q2). Review A4 |
| O-32 | Cả 3 | Sửa tay `cart-contents` thành chuỗi không phải JSON (vd `abc`) | **Cả 3 trang trắng**, lỗi `SyntaxError`. Không còn menu để Logout / Reset | (Q14, IMP-07). Review A5 |
| O-33 | Chi tiết | Mở `?id=04`, `?id=4abc`, `?id=4.9`, `?id=0x4` | Đều mở Backpack (id được đọc dễ dãi) | 🔴 (Q2 đã chốt: id sai định dạng phải báo không tìm thấy, BUG-20). Review A6 |
| O-34 | Cả 3 | Trang giỏ của 4 tài khoản đặc biệt; Remove rồi Back / Forward; đăng xuất ở trang giỏ rồi Back; sắp xếp khi giỏ có hàng; Enter trên tên sản phẩm | **Không thấy lỗi**: giỏ liệt kê, giá, Remove, Continue Shopping, Checkout đúng; Back / Forward giữ đúng trạng thái giỏ; đăng xuất rồi Back bị chặn; nút `Remove` đi theo đúng sản phẩm khi sắp xếp; Enter mở chi tiết | ✅ Dùng làm test dương tính, phát hiện hồi quy. Review A7 |
| O-35 | Danh sách | Liên kết tên và ảnh sản phẩm | Có `href="#"`: không mở được trong tab mới, không chia sẻ được link | (IMP-08). Review B6 |

> **Lưu ý từ lần khám phá:** lần chạy đầu có 6 tình huống lỗi do **script khám phá** (đọc trang trước khi chuyển trang xong, vòng lặp bấm theo danh sách đã thay đổi). Reviewer cũng gặp kết quả giả khi bấm Back trước khi trang chi tiết vẽ xong. Quy tắc: sau mỗi lần chuyển trang phải chờ **phần tử riêng của trang đích**, không chỉ chờ URL; quan sát lạ phải chạy lại ≥2 lần.

## Ma trận tài khoản × trang × thao tác
Kết quả khám phá + review (✅ đúng như `standard_user` · ❌ lỗi · – không áp dụng). Mỗi ô ❌ phải có TC bắt; mỗi ô ✅ của tài khoản đặc biệt có TC dương tính để phát hiện hồi quy. **test-impl tách TC theo từng tài khoản**, mỗi TC một bug.

| Tài khoản | Danh sách: ảnh | Danh sách: giá | Sắp xếp | Add (danh sách / chi tiết) | Remove (danh sách / chi tiết) | Mở đúng chi tiết | Trang giỏ: liệt kê, Remove | Bố cục |
|---|---|---|---|---|---|---|---|---|
| `standard_user` | ✅ | ✅ | ✅ | ✅ / ✅ | ✅ / ✅ | ✅ | ✅ | ✅ |
| `problem_user` | ❌ BUG-08 | ✅ | ❌ BUG-09 | ❌ 3 SP / ❌ 3 SP (BUG-10) | ❌ 3 SP / ❌ 3 SP (BUG-10) | ❌ BUG-11 | ✅ | ✅ |
| `error_user` | ✅ | ✅ | ❌ BUG-12 | ❌ 3 SP / ❌ 3 SP (BUG-13) | ❌ 3 SP / ❌ 3 SP (BUG-13) | ✅ | ✅ | ✅ |
| `visual_user` | ❌ 1 SP (BUG-15) | ❌ BUG-14 | ✅ (theo giá sai) | ✅ / ✅ | ✅ / ✅ | ✅ | ✅ | ❌ BUG-16, BUG-18 |
| `performance_glitch_user` | ✅ | ✅ | ✅ chậm ~5 giây (BUG-17) | ✅ / ✅ | ✅ / ✅ | ✅ | ✅ | ✅ |
| `locked_out_user` | – | – | – | – | – | – | – | – (không đăng nhập được, SD-101) |

## Dependencies
- SD-101 Đăng nhập (dùng fixture đã đăng nhập; kiểm soát truy cập khi chưa đăng nhập đã có ở SD-101 TC-023, TC-024, TC-032).
- `localStorage` của trình duyệt (giỏ hàng).
- `events.backtrace.io`: dịch vụ theo dõi lỗi bên thứ 3 (thông báo lỗi của `error_user` gửi tới đây).

## Phạm vi test
- **Trong phạm vi**: AC-1 → AC-7 với `standard_user`; ma trận tài khoản đặc biệt theo Q1; sản phẩm không tồn tại và id sai định dạng; giỏ trống; giữ giỏ khi tải lại / đăng nhập lại / đổi tài khoản / Back-Forward / 2 tab; Reset App State (Q4); phiên giả mạo vào trang giỏ và chi tiết.
- **Ngoài phạm vi** (ghi trong `viewpoint.csv` với `scope=out`): bước thanh toán (SD-103), chưa đăng nhập vào 3 trang (đã có ở SD-101), `locked_out_user`, hiệu năng (Q10), giữ kiểu sắp xếp (Q7), tổng tiền / sửa số lượng (Q8), About, Dynamic Catalog, mạng xã hội, accessibility.

## Review checklist
| Mục | Kết quả | Ghi chú |
|---|---|---|
| Chức năng được mô tả đầy đủ? | ⚠️ | Đủ luồng chính. Thiếu giỏ trống, Reset App State, giỏ theo tài khoản |
| AC đo lường được, testable? | ⚠️ | AC-1 không nêu dữ liệu chuẩn; không nói các tài khoản đặc biệt (Q1) |
| Validation và error handling? | ❌ | Không nói sản phẩm không tồn tại, id sai định dạng (Q2), giỏ trống (Q5), dữ liệu giỏ hỏng (Q14) |
| Ràng buộc kỹ thuật / business? | ⚠️ | Chỉ BR-1 rút được từ requirement. Hành vi hiện tại của giỏ chờ Q2, Q3 |
| Dependency được liệt kê? | ⚠️ | Có SD-101. Không nhắc `localStorage` |
| Edge case, negative? | ❌ | Không đề cập. Đã bổ sung qua khám phá và review (O-03, O-08, O-09, O-13, O-16, O-17, O-29 → O-33) |
| Kiểm soát truy cập? | ⚠️ | Chưa đăng nhập: đã có ở SD-101. Phiên giả mạo vào trang giỏ, chi tiết: vào được (O-30) |
| Có câu hỏi blocking? | ✅ | 14 câu (6 blocking, 8 non-blocking): xem [`q-and-a.md`](q-and-a.md). Đã chốt hết ở HITL #1 (Q1–Q14, Open 0) |

**Bug phát hiện sớm**: xem [`known-issues.md`](known-issues.md) (BUG-05 → BUG-20, kèm biến thể của BUG-02).
