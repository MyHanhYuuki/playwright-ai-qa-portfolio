# Test Data Catalog: SD-103 Thanh toán (saucedemo-checkout-screen)

> Mật khẩu hợp lệ **không ghi trong test case**. Đọc từ biến môi trường `SAUCE_PASSWORD` (mặc định là mật khẩu demo công khai, xem `tests/data/users.ts`).
> Giá chuẩn của sản phẩm nằm trong `tests/data/products.ts` (TD-06). Số tiền mong đợi **tính từ dữ liệu này theo cent nguyên** (Q2: `Tax = round(Item total × 8 %)`, `Total = Item total + Tax`), **không** đọc số trên trang để so với chính trang.
> **Giỏ lưu ở `localStorage` khóa `cart-contents`** (mảng id theo **thứ tự thêm**; thứ tự này quyết định cả thứ tự dòng ở Tổng quan và kết quả cộng số thực của BUG-25). Giỏ còn lại sau khi đăng xuất, kể cả khi đổi tài khoản (BUG-07). Mỗi TC bắt đầu từ **phiên trình duyệt mới (hoặc cửa sổ ẩn danh), giỏ trống**. **Không** dùng Reset App State để làm sạch giỏ (BUG-05). Chạy tay nhiều TC liên tiếp trong cùng phiên sẽ ra kết quả sai. **Bản tự động** (TC-002, 016, 018, 024, 025, 026, 032): các biến thể cùng tài khoản dùng chung phiên, ghi đè toàn bộ `cart-contents` rồi tải lại trang, tương đương phiên mới (trạng thái ứng dụng chỉ gồm `cart-contents` + cookie phiên; các khóa `backtrace-*` khác là dữ liệu báo lỗi; đã kiểm ở review-script-gen C5).
> Đặt giỏ bằng `cart-contents` = mở trang đã đăng nhập, chạy `localStorage.setItem('cart-contents', '[4,2]')` (DevTools → Console khi chạy tay) rồi mở `/cart.html`. Thông tin nhập ở trang Thông tin **không** lưu ở đâu trong trình duyệt (O-11).

| ID | Tên | Dữ liệu | Dùng cho |
|---|---|---|---|
| TD-01 | `standard_user` | + mật khẩu hợp lệ | 40 TC: mọi TC trừ TC-013 → TC-015, TC-025, TC-026, TC-032, TC-033, TC-037, TC-038, TC-045 → TC-048. Mốc so sánh của TC-044, TC-049 |
| TD-02 | `problem_user` | + mật khẩu hợp lệ. Không qua được Thông tin (BUG-28): TC vào Tổng quan bằng **mở thẳng** `/checkout-step-two.html`, kèm **chốt chặn BUG-26**: chờ nút `Finish` tối đa 5 giây, không thấy thì **Blocked: BUG-26 đã sửa** (HITL #2 quyết định 3): TC bug một mục đích (TC-025, TC-026, TC-032, TC-033) chạy chốt chặn **trước**, chỉ gọi `test.fail()` sau khi chốt chặn qua; TC nhiều biến thể (TC-020 biến thể 9, 11) ghi annotation `blocked` và bỏ biến thể; TC dương tính (TC-047 → TC-049) chốt chặn đỏ là đỏ thật | TC-013, TC-020, TC-025, TC-026, TC-032, TC-047, TC-049 |
| TD-03 | `error_user` | + mật khẩu hợp lệ. Không gõ được Last Name (BUG-31): TC vào Tổng quan bằng mở thẳng URL, kèm chốt chặn BUG-26 như TD-02 | TC-014, TC-015, TC-020, TC-033, TC-048, TC-049 |
| TD-04 | `visual_user` | + mật khẩu hợp lệ | TC-020, TC-043, TC-044, TC-045, TC-049 |
| TD-05 | `performance_glitch_user` | + mật khẩu hợp lệ. Mọi bước **về trang danh sách** mất ~5 giây: chờ tối đa 10 giây (Q11) | TC-020, TC-046, TC-049 |
| TD-06 | Danh mục sản phẩm chuẩn | 6 sản phẩm: id, tên, giá, mô tả (bảng dưới; mô tả nguyên văn trong `tests/data/products.ts`) | TC-008, TC-016, TC-018, TC-019, TC-024 → TC-026, TC-045 → TC-048 |
| TD-07 | Giỏ `[4]` | Sauce Labs Backpack · Item total `$29.99` · Tax `$2.40` · Total `$32.39` | TC-016, TC-018, TC-021, TC-026, TC-040, TC-044, TC-047, TC-051 |
| TD-08 | Giỏ `[4,2]` | Sauce Labs Backpack, Sauce Labs Onesie · `$37.98` · `$3.04` · `$41.02` | TC-008, TC-018, TC-022, TC-023, TC-026, TC-027, TC-029 → TC-031, TC-035, TC-036, TC-041, TC-049 → TC-053 |
| TD-09 | Giỏ `[4,0,2]` (hỗn hợp) | Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Onesie · `$47.97` · `$3.84` · `$51.81` | TC-016, TC-018, TC-020, TC-026, TC-032, TC-033, TC-045 → TC-048 |
| TD-10 | Giỏ cả 6 `[4,0,1,5,2,3]` | `$129.94` · `$10.40` · `$140.34` | TC-016, TC-018, TC-024, TC-026 |
| TD-11 | Giỏ `[2]` (rẻ nhất) | Sauce Labs Onesie · `$7.99` · `$0.64` · `$8.63` | TC-016, TC-018, TC-026, TC-053 |
| TD-12 | Giỏ thứ tự thêm (Q13) | Thêm Onesie, Fleece Jacket, Bike Light; bỏ rồi thêm lại Onesie → `cart-contents` `[5,0,2]`, thứ tự hiển thị **Sauce Labs Fleece Jacket, Sauce Labs Bike Light, Sauce Labs Onesie** · `$67.97` · `$5.44` · `$73.41` | TC-017, TC-021, TC-034 |
| TD-13 | Giỏ gây lỗi số thực (BUG-25) | Bảng "TD-13" dưới: `[0,5]`, `[2,5]`, `[0,1,2,4]`, `[0,1,2,5]`, `[4,3,2,1,0]` (đúng thứ tự thêm) | TC-018, TC-020 |
| TD-14 | Giỏ rỗng | `cart-contents` không có / `[]` · mong đợi `Item total: $0.00`, `Tax: $0.00`, `Total: $0.00` (Q7) | TC-020, TC-028, TC-042 |
| TD-15 | Giỏ đại diện thêm cho phép tính | `[0]` Bike Light `$9.99` · `$0.80` · `$10.79`; `[3]` Red T-Shirt `$15.99` · `$1.28` · `$17.27`; `[4,5]` `$79.98` · `$6.40` · `$86.38`; `[0,1,5]` `$75.97` · `$6.08` · `$82.05` | TC-018 |
| TD-16 | Quét toàn bộ giỏ | **120 giỏ khác nhau**: 63 tổ hợp khác rỗng của 6 id; giỏ 1 sản phẩm 1 lượt (6), giỏ ≥ 2 sản phẩm 2 thứ tự thêm (id tăng dần, id giảm dần: 57 × 2 = 114). Chạy trong 1 context, ghi đè `cart-contents` mỗi giỏ, timeout riêng 180 giây, annotation `đã quét n/120 giỏ` (HITL #2 quyết định 4); mong đợi tính bằng công thức (cent nguyên) từ TD-06 | TC-019, TC-020 |
| TD-17 | Thông tin hợp lệ | Bộ A: First `An` / Last `Le` / Zip `70000`. Bộ B (người thứ 2, đơn thứ 2): `Vy` / `Tran` / `10000` | 37 TC đi qua trang Thông tin (xem cột `test_data_ref`) |
| TD-18 | 7 tổ hợp ô trống (giá trị dùng bộ A) | Bảng "TD-18" dưới | TC-002, TC-003 |
| TD-19 | Chỉ có khoảng trắng | `" "` (1 khoảng trắng, cả 3 ô); `"   "` (3 khoảng trắng, từng ô); 1 ký tự tab `"\t"` (ô Zip) | TC-005 |
| TD-20 | Giá trị hợp lệ đa dạng (Q8: không kiểm định dạng) | (1) `Nguyễn` / `Thị Ánh` / `ABC-xyz`; (2) `<script>alert(1)</script>` / `O'Brien; DROP TABLE` / `!@#$%^&*()`; (3) `123` / `456` / `abcdef`; (4) `  An  ` / `  Bình ` / `  70000  `; (5) `😀` / `李` / `０１２` (chữ số toàn chiều rộng) | TC-006, TC-021 |
| TD-21 | Chuỗi rất dài | `'a'.repeat(5000)` ở mỗi ô (knowledge-base: không giới hạn độ dài) | TC-007 |
| TD-22 | Cookie phiên tự tạo (như SD-101 TD-08, SD-102 TD-10) | `session-username=<tên>`, domain `www.saucedemo.com`, path `/`; tên: `standard_user`, `problem_user`, `error_user`, `visual_user`, `performance_glitch_user`; kèm `cart-contents` = `[4]` | TC-038 |
| TD-23 | Đường dẫn 3 trang thanh toán | `/checkout-step-one.html` (Thông tin), `/checkout-step-two.html` (Tổng quan), `/checkout-complete.html` (Hoàn tất). Trong code: thêm vào `protectedPages` của `tests/data/messages.ts` (đã có `checkout`) | TC-037, TC-038, TC-040 → TC-042 |

## TD-06: danh mục sản phẩm chuẩn
| id | Tên | Giá | Cent |
|---|---|---|---|
| 4 | Sauce Labs Backpack | $29.99 | 2999 |
| 0 | Sauce Labs Bike Light | $9.99 | 999 |
| 1 | Sauce Labs Bolt T-Shirt | $15.99 | 1599 |
| 5 | Sauce Labs Fleece Jacket | $49.99 | 4999 |
| 2 | Sauce Labs Onesie | $7.99 | 799 |
| 3 | Test.allTheThings() T-Shirt (Red) | $15.99 | 1599 |

## TD-13: giỏ gây lỗi số thực (định dạng, BUG-25)
Thứ tự trong `cart-contents` = thứ tự thêm (lỗi phụ thuộc thứ tự cộng). Cột "Hiện tại" chỉ để đối chiếu khi đọc lỗi, **không** dùng làm expected.

| Giỏ | Sản phẩm (thứ tự thêm) | Item total mong đợi | Tax | Total | Item total hiện tại (bug) |
|---|---|---|---|---|---|
| `[0,5]` | Bike Light, Fleece Jacket | `$59.98` | `$4.80` | `$64.78` | `$59.980000000000004` |
| `[2,5]` | Onesie, Fleece Jacket | `$57.98` | `$4.64` | `$62.62` | `$57.980000000000004` |
| `[0,1,2,4]` | Bike Light, Bolt T-Shirt, Onesie, Backpack | `$63.96` | `$5.12` | `$69.08` | `$63.959999999999994` |
| `[0,1,2,5]` | Bike Light, Bolt T-Shirt, Onesie, Fleece Jacket | `$83.96` | `$6.72` | `$90.68` | `$83.96000000000001` |
| `[4,3,2,1,0]` | Backpack, Red T-Shirt, Onesie, Bolt T-Shirt, Bike Light | `$79.95` | `$6.40` | `$86.35` | `$79.94999999999999` |
| `[]` | (giỏ rỗng) | `$0.00` | `$0.00` | `$0.00` | `$0` |

Kiểm tra lại cách tính (test-impl, 2026-11-25): cộng giá theo thứ tự giỏ bằng số thực ra đúng các chuỗi "hiện tại" ở trên; quy về cent rồi tính thuế 8 % ra đúng các cột mong đợi. Các giỏ TD-07 → TD-12, TD-15 cộng số thực **không** sinh phần lẻ, nên TC dương tính so chuỗi tiền với các giỏ đó an toàn (không đỏ vì BUG-25).

## TD-18: 7 tổ hợp ô trống
| # | First Name | Last Name | Zip | Thông báo mong đợi | Ô đã nhập (không được tô đỏ, TC-003) |
|---|---|---|---|---|---|
| 1 | | | | MSG-01 | (không có) |
| 2 | `An` | | | MSG-02 | First |
| 3 | | `Le` | | MSG-01 | Last |
| 4 | | | `70000` | MSG-01 | Zip |
| 5 | `An` | `Le` | | MSG-03 | First, Last |
| 6 | `An` | | `70000` | MSG-02 | First, Zip |
| 7 | | `Le` | `70000` | MSG-01 | Last, Zip |

## Thông báo nguyên văn
Lấy nguyên văn trên web (knowledge-base), test-impl đọc lại trên web thật ngày 2026-11-25. Trong code: thêm nhóm `MSG_CHECKOUT` vào `tests/data/messages.ts`; MSG-04 dùng `MSG.notLoggedIn(path)` có sẵn.

| ID | Nội dung |
|---|---|
| MSG-01 | `Error: First Name is required` (`[data-test=error]`) |
| MSG-02 | `Error: Last Name is required` |
| MSG-03 | `Error: Postal Code is required` (nhãn ô là `Zip/Postal Code`, khác chữ: IMP-03) |
| MSG-04 | `Epic sadface: You can only access '<path>' when you are logged in.` với `<path>` = `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html` (giống SD-101 MSG-05, SD-102 MSG-02) |
| MSG-05 | Tiêu đề trang (`[data-test=title]`): `Checkout: Your Information` · `Checkout: Overview` · `Checkout: Complete!` |
| MSG-06 | Tổng quan: cột `QTY`, `Description`; `[data-test=payment-info-label]` `Payment Information:`, `[data-test=payment-info-value]` `SauceCard #31337`; `[data-test=shipping-info-label]` `Shipping Information:`, `[data-test=shipping-info-value]` `Free Pony Express Delivery!`; `[data-test=total-info-label]` `Price Total`; `[data-test=subtotal-label]` `Item total: $x.xx`, `[data-test=tax-label]` `Tax: $x.xx`, `[data-test=total-label]` `Total: $x.xx` (Q1, Q7) |
| MSG-07 | Hoàn tất: `[data-test=complete-header]` `Thank you for your order!`; `[data-test=complete-text]` `Your order has been dispatched, and will arrive just as fast as the pony can get there!`; ảnh `[data-test=pony-express]` (alt `Pony Express`); nút `[data-test=back-to-products]` `Back Home`, `[data-test=generate-pdf-order]` `Generate PDF order` |
| MSG-08 | PDF: tên file `swag-labs-order-YYYY-MM-DD_HH-mm-ss.pdf` (regex `^swag-labs-order-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.pdf$`). Chữ theo thứ tự: `Swag Labs`, `Order Receipt`, `ORDER DETAILS`, `Order Date`, `<Tháng> <ngày>, <năm> at <giờ>:<phút> <AM/PM>`, `SHIP TO`, `<First> <Last>`, `<Zip>`, `ITEMS`, `DESCRIPTION`, `PRICE`, từng sản phẩm (tên, `$`, giá), `Item total` `$` `<số>`, `Tax` `$` `<số>`, `Total` `$` `<số>`, `Thank you for your order! It has been dispatched, and will arrive just as fast as the pony can get there.` Bỏ qua Thông tin (BUG-26) thì không có phần `SHIP TO` |
| MSG-09 | `Cannot read properties of undefined (reading 'value')` (pageerror của `error_user` mỗi lần gõ phím ở Last Name, bằng chứng BUG-31) |
| MSG-10 | `wa.cesetRart is not a function` (pageerror của `error_user` khi bấm Finish, bằng chứng BUG-33) |
| MSG-11 | Trang Thông tin: placeholder `First Name`, `Last Name`, `Zip/Postal Code`; nút `Cancel`, `Continue` |

## Cách đọc chữ trong file PDF (TC-026, TC-034, TC-045, TC-046, TC-051)
Luồng nội dung nén `FlateDecode`; chữ nằm trong mảng hex của toán tử `TJ`, vd `[<537761> 10 <67> 0 <204c> 0 <6162> 0 <73> 0] TJ` = `Swag Labs`. Giải nén từng `stream … endstream` bằng `zlib.inflateSync`, ghép các đoạn hex trong mỗi `TJ` (Latin-1) là đọc được (test-impl kiểm 2/2 ngày 2026-11-25). Font WinAnsi nên chữ ngoài Latin-1 (tiếng Việt) bị sai: ngoài phạm vi (TVP-034, IMP-05). Bố cục và độ dễ đọc: làm tay (TC-035, M2 / M3).
