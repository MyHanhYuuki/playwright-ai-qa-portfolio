# Bug report: SD-103 Thanh toán (Thông tin, Tổng quan, Hoàn tất)

> **Người báo**: MyHanhYuuki (QC) · **Ngày**: 2026-11-26 · **Trạng thái duyệt**: HITL #3 (2026-11-26) duyệt **21 bug** theo mức đề xuất trong [`triage.md`](triage.md): 15 bug mới (BUG-22 → BUG-36) + 6 biến thể bug cũ (BUG-02, BUG-05, BUG-07, BUG-11, BUG-16, BUG-19); **BUG-29 chốt High**. Q14 là cải tiến IMP-12, không phải bug. Biến thể BUG-03 chỉ ghi nhận (mục cuối).
> **Lần chạy**: [`run-20261126-143604`](run-results/run-20261126-143604.json) (53 test, 22 test bug fail đúng assertion của bug; nội dung lỗi trong `error_details`, giá trị phụ như nội dung PDF trong `annotations`) · chạy lặp [`stability-20261126-1401`](run-results/stability-20261126-1401.json) (106/106 đúng như mong đợi) · phân loại: [`triage.md`](triage.md).
> **Evidence tự động** (`npm run test:evidence`): ảnh + README của 22 test bug làm mới ngày 2026-11-26 lúc `08:36Z` → `08:37Z` (cùng code với lần chạy chính thức `run-20261126-143604`, README có mục "Ghi nhận (annotation)": số giỏ đã quét, lỗi JavaScript, chữ trong PDF…); **video giữ bản quay lúc `07:11Z` → `07:12Z`** (`EVIDENCE_KEEP_VIDEOS=1`, không quay lại để khỏi thêm ~60 MB video trùng nội dung vào lịch sử git; code của 22 test bug không đổi giữa 2 lần). **Tái hiện độc lập** (2026-11-26): script riêng [`tests/repro/saucedemo-checkout-screen.repro.ts`](../../tests/repro/saucedemo-checkout-screen.repro.ts) (`npm run repro -- saucedemo-checkout-screen`), **không** dùng code test (locator id / class CSS, không dùng Page Object), mỗi tình huống phiên trình duyệt mới, chạy 2 lần; ảnh và bảng kết quả trong thư mục `manual/` của từng bug. Các bước dưới đây viết để làm **bằng tay**; script làm đúng các bước đó bằng locator riêng.
> Ticket chưa log lên hệ thống quản lý bug nên tạm ghi `[id_bug_n]` (xem `tests/data/bugs.ts`). Biến thể của bug cũ **gộp vào ticket gốc** (SD-101, SD-102), không tạo ticket mới (tiền lệ SD-102 BUG-02).
> **Tài khoản đặc biệt**: trên SauceDemo, `problem_user`, `error_user`, `visual_user` được làm lỗi **cố ý** để luyện test. Theo quy tắc chung (`knowledge-base/q-and-a-archive.md`), mọi tài khoản đăng nhập được phải hoạt động như `standard_user`, nên các lỗi này được báo như bug thật.

**Môi trường chung**: https://www.saucedemo.com · Chromium (Playwright 1.65.1, Desktop Chrome, 1280×720) · Windows 11 · 2026-11-26. Tái hiện độc lập: Chromium headless 1280×720.
**Điều kiện trước chung**: phiên trình duyệt mới (cửa sổ ẩn danh), giỏ trống. Mật khẩu hợp lệ in sẵn trên trang đăng nhập (trong code: `tests/data/users.ts`). Giỏ lưu ở `localStorage` khóa `cart-contents` và còn lại sau đăng xuất, nên **mỗi lần tái hiện phải mở phiên mới**.
**Dữ liệu chung** ([`test-data.md`](test-data.md)): thông tin hợp lệ TD-17 bộ A `An` / `Le` / `70000`, bộ B `Vy` / `Tran` / `10000`. id sản phẩm (TD-06): 0 Bike Light `$9.99`, 1 Bolt T-Shirt `$15.99`, 2 Onesie `$7.99`, 3 Red T-Shirt `$15.99`, 4 Backpack `$29.99`, 5 Fleece Jacket `$49.99`. Số tiền mong đợi tính theo cent nguyên, Tax = 8 % làm tròn tới cent (Q2).
**Bước dùng DevTools Console**: F12 → tab Console. Nếu Chrome chặn dán lệnh, gõ `allow pasting` rồi Enter trước. Đặt giỏ bằng tay: `localStorage.setItem("cart-contents","[4,2]")` (sau khi đăng nhập). Đọc PDF biên nhận: bấm `Generate PDF order` ở trang Hoàn tất, mở file tải về.
**Tần suất**: mọi bug **100%**: lần chạy chính thức (đọc `error_details`: fail đúng assertion của bug) và tái hiện độc lập **2/2 lần, kết quả giống nhau** (21/21 bug). Chạy lặp ×2 chỉ ghi "đúng như mong đợi / không", dùng để chứng minh test không chập chờn, không dùng làm bằng chứng nội dung lỗi.
**"5 tài khoản"** (HITL #2 quyết định 7): test tự động và tái hiện độc lập dùng `standard_user` (trừ bug của tài khoản đặc biệt). Câu "cả 5 tài khoản" dẫn nguồn phân tích O-43 trong [`spec-review.md`](spec-review.md) (1 lần / tài khoản), không phải kết quả chạy. Khi bug được sửa, **confirmation test** chạy lại thao tác với cả 5 tài khoản.

## Tổng hợp
| Bug | Màn hình | Ticket | Test case | Tiêu đề | Severity | Priority (đề xuất) | Trạng thái |
|---|---|---|---|---|---|---|---|
| [BUG-07](#bug-07) | Cả 3 | `[id_bug_7]` | TC-043 | (biến thể) Người đăng nhập sau đặt hàng bằng giỏ của người trước, làm trống giỏ đó | High | P1 | Open (gộp ticket BUG-07) |
| [BUG-02](#bug-02) | Cả 3 | `[id_bug_2]` | TC-038 | (biến thể) Cookie tự tạo vào được cả 3 trang thanh toán và đặt được hàng | High | P1 | Open (gộp ticket BUG-02) |
| [BUG-26](#bug-26) | Thông tin → Tổng quan | `[id_bug_26]` | TC-040 | Mở thẳng Tổng quan bỏ qua bước nhập thông tin, đặt hàng không có tên, zip | Medium | P2 | Open |
| [BUG-35](#bug-35) | Tổng quan → Hoàn tất | `[id_bug_35]` | TC-051 | Finish tạo đơn theo Tổng quan đã cũ, không theo giỏ / phiên hiện tại | Medium | P2 | Open |
| [BUG-05](#bug-05) | Thông tin + Tổng quan | `[id_bug_5]` | TC-027 | (biến thể) Reset App State ở Tổng quan xóa giỏ nhưng trang vẫn liệt kê sản phẩm, số tiền | Medium | P2 | Open (gộp ticket BUG-05) |
| [BUG-24](#bug-24) | Tổng quan → Hoàn tất | `[id_bug_24]` | TC-028, TC-029 | Đặt được đơn không có sản phẩm | Low | P3 | Open |
| [BUG-36](#bug-36) | Thông tin → Tổng quan; Tổng quan → Hoàn tất | `[id_bug_36]` | TC-052 | Bấm đúp Continue / Finish: phải bấm Back 2 lần mới về trang trước | Low | P3 | Open |
| [BUG-16](#bug-16) | Cả 3 | `[id_bug_16]` | TC-044 | (biến thể) `visual_user`: biểu tượng giỏ lệch và xoay, menu xoay ở 3 trang thanh toán | Low | P3 | Open (gộp ticket BUG-16) |
| [BUG-28](#bug-28) | Thông tin | `[id_bug_28]` | TC-013 | `problem_user`: gõ Last Name thì ký tự vào First Name, không đặt được hàng | High | P1 | Open |
| [BUG-31](#bug-31) | Thông tin | `[id_bug_31]` | TC-014 | `error_user`: Last Name không nhận ký tự, mỗi phím một lỗi JavaScript | High | P1 | Open |
| [BUG-23](#bug-23) | Thông tin | `[id_bug_23]` | TC-009 | Nhấn Enter trong ô nhập về trang giỏ thay vì Continue | Medium | P2 | Open |
| [BUG-34](#bug-34) | Thông tin | `[id_bug_34]` | TC-005 | Ô chỉ có khoảng trắng / ký tự tab được coi là đã nhập | Medium | P2 | Open |
| [BUG-32](#bug-32) | Thông tin | `[id_bug_32]` | TC-015 | `error_user`: bỏ qua kiểm tra Last Name | Medium | P2 | Open |
| [BUG-22](#bug-22) | Thông tin | `[id_bug_22]` | TC-003 | Thiếu một ô thì cả 3 ô bị tô đỏ, kể cả ô đã nhập đúng | Low | P3 | Open |
| [BUG-19](#bug-19) | Thông tin | `[id_bug_19]` | TC-042 | (biến thể) Giỏ trống mở thẳng URL vẫn vào trang Thông tin | Low | P3 | Open (gộp ticket BUG-19) |
| [BUG-29](#bug-29) | Tổng quan | `[id_bug_29]` | TC-026 | `problem_user`: Item total gấp đôi, Tax và Total sai | High | P1 | Open |
| [BUG-33](#bug-33) | Tổng quan | `[id_bug_33]` | TC-033 | `error_user`: bấm Finish không có tác dụng, lỗi JavaScript | High | P1 | Open |
| [BUG-11](#bug-11) | Tổng quan | `[id_bug_11]` | TC-025 | (biến thể) `problem_user` bấm tên sản phẩm ở Tổng quan mở trang của sản phẩm id + 1 | High | P1 | Open (gộp ticket BUG-11) |
| [BUG-25](#bug-25) | Tổng quan | `[id_bug_25]` | TC-020 | Item total không làm tròn, không định dạng 2 chữ số lẻ | Medium | P2 | Open |
| [BUG-30](#bug-30) | Hoàn tất | `[id_bug_30]` | TC-032 | `problem_user`: Finish báo thành công nhưng giỏ không được làm trống | High | P1 | Open |
| [BUG-27](#bug-27) | Hoàn tất | `[id_bug_27]` | TC-041 | Mở thẳng trang Hoàn tất khi chưa đặt hàng vẫn báo thành công | Low | P3 | Open |

> **Severity** (mức nghiêm trọng): QC đánh giá theo ảnh hưởng, người duyệt chốt ở HITL #3. **Priority** (mức ưu tiên sửa): PO/PM chốt, QC chỉ đề xuất. P1 sửa trước release · P2 nên sửa trong đợt này · P3 sửa khi tiện. Mỗi bug ghi lý do cho cả hai.
> **Cách chọn priority** ở đây (như SD-102): P1 = chặn mua hàng, sai tiền, hoặc lỗ hổng bảo mật / dữ liệu; P2 = chức năng sai nhưng vẫn mua được (có cách khác), hoặc đơn thiếu / sai dữ liệu khi thao tác không thường gặp; P3 = giao diện, hoặc phải thao tác bất thường (sửa URL, Back, bấm đúp) mới gặp và không mất tiền.
> Biến thể bug cũ giữ priority của ticket gốc (SD-101, SD-102), trừ khi ghi rõ khác.

---

## Chung: lỗi ở nhiều màn hình

<a id="bug-07"></a>
### BUG-07: [Giỏ hàng] (biến thể SD-103) Người đăng nhập sau đặt hàng bằng giỏ của người trước và làm trống giỏ đó
| | |
|---|---|
| **Ticket** | `[id_bug_7]` (**gộp vào ticket BUG-07** của SD-102, không tạo ticket mới) |
| **Severity** | **High** như BUG-07: tài khoản khác đặt hàng bằng giỏ của người trước, người trước mất giỏ (với hệ thống thật là lỗi bảo mật, quyền riêng tư) |
| **Priority** | **P1** như BUG-07: lỗi toàn vẹn dữ liệu, chỉ cần đổi người dùng trên cùng trình duyệt; ở bước thanh toán còn tạo **đơn** sai người |
| **Liên quan** | AC-5 · TVP-041 · TC-043 · O-26 · SD-102 [`defects.md`](../saucedemo-products-cart-screen/defects.md) BUG-07 · bài học L1, L11 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`, TD-04 `visual_user`; TD-17 bộ A, bộ B; mỗi chiều **một** phiên trình duyệt cho 2 tài khoản |

| | Chiều 1 | Chiều 2 (ngược lại) |
|---|---|---|
| **Các bước** | 1. Đăng nhập `standard_user`, thêm Sauce Labs Backpack, giỏ → Checkout → `An` / `Le` / `70000` → Continue (đang ở Tổng quan)<br>2. ☰ → Logout<br>3. Đăng nhập `visual_user`, mở giỏ, Checkout → `Vy` / `Tran` / `10000` → Continue → Finish<br>4. Logout, đăng nhập lại `standard_user`, mở giỏ | 1. Đăng nhập `visual_user`, thêm Sauce Labs Onesie, Logout<br>2. Đăng nhập `standard_user`, mở giỏ, Checkout → `An` / `Le` / `70000` → Continue → Finish<br>3. Logout, đăng nhập lại `visual_user`, mở giỏ |
| **Mong đợi** (AC-5, quy tắc "dữ liệu gắn tài khoản") | Giỏ `visual_user` trống (không có số giỏ, không có gì để đặt); giỏ `standard_user` vẫn Backpack, số giỏ 1 | Giỏ `standard_user` trống; giỏ `visual_user` vẫn Onesie, số giỏ 1 |
| **Thực tế** | `visual_user` thấy **Sauce Labs Backpack**, đặt hàng thành công ("Thank you for your order!"); `standard_user` đăng nhập lại: **không có số giỏ, giỏ trống** | `standard_user` thấy **Sauce Labs Onesie**, đặt hàng thành công; `visual_user` đăng nhập lại: **giỏ trống** |

Lần chạy chính thức (TC-043, 8 lỗi): `visual_user không có số giỏ` → Received `visible`; `giỏ của visual_user 0 dòng` → Received `1`; `giỏ của standard_user còn Sauce Labs Backpack` → Received `[]` (chiều 2 tương tự với Onesie).

**Nguyên nhân dự đoán**: như BUG-07: giỏ lưu ở `localStorage` khóa `cart-contents` (chung cho trình duyệt), không gắn tài khoản, không xóa khi đăng xuất; Finish xóa khóa này.

![BUG-07 chiều 1](<evidence/bugs/[id_bug_7]_BUG-07/manual/01-chieu-1-nguoi-sau-dat-hang.png>)

**Evidence**: [tự động: 2 chiều](<evidence/bugs/[id_bug_7]_BUG-07/TC-043/README.md>) · [tái hiện độc lập: 2 chiều](<evidence/bugs/[id_bug_7]_BUG-07/manual/README.md>)
**Test tự động**: TC-043, 2 chiều bằng `expect.soft`, `test.fail()`, tag `@BUG-07`. Khi sửa BUG-07 phải kiểm cả giỏ (SD-102 TC-040) và thanh toán (TC-043).

---

<a id="bug-02"></a>
### BUG-02: [Kiểm soát truy cập] (biến thể SD-103) Cookie tự tạo vào được cả 3 trang thanh toán và đặt được hàng
| | |
|---|---|
| **Ticket** | `[id_bug_2]` (**gộp vào ticket BUG-02** của SD-101, không tạo ticket mới) |
| **Severity** | **High** như BUG-02 (với hệ thống thật là Critical: đặt hàng không cần đăng nhập) |
| **Priority** | **P1**: lỗ hổng bảo mật, vượt qua đăng nhập, nay **tạo được đơn** |
| **Liên quan** | AC-7 · TVP-036 · TC-038 · O-23, O-43 · MSG-04 · SD-101 [`defects.md`](../saucedemo-login-screen/defects.md) BUG-02 · SD-102 TC-045 · tag `@security` |
| **Tài khoản / dữ liệu** | Chưa đăng nhập; TD-22 cookie `session-username=<tên>` (5 tên), `cart-contents` = `[4]`; TD-23 3 đường dẫn |

**Các bước**: 1. Mở https://www.saucedemo.com (chưa đăng nhập) · 2. DevTools Console: `document.cookie = "session-username=standard_user"` và `localStorage.setItem("cart-contents","[4]")` · 3. Mở lần lượt `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html` · 4. Mở lại `/checkout-step-two.html`, bấm Finish · 5. Lặp bước 1 → 3 (chỉ trang Thông tin) với tên `problem_user`, `error_user`, `visual_user`, `performance_glitch_user`.

**Mong đợi** (AC-7, như BUG-02, MSG-04): về trang đăng nhập, thông báo nguyên văn `Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.` (tương tự với `/checkout-step-two.html`, `/checkout-complete.html`); không đặt được hàng.

**Thực tế**: vào thẳng cả 3 trang (`Checkout: Your Information`, `Checkout: Overview`, `Checkout: Complete!`), không có thông báo; Tổng quan hiện Backpack `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39`, bấm Finish hiện "Thank you for your order!". Cả 5 tên tài khoản hợp lệ đều vào được. Đối chứng: cookie `locked_out_user` bị chặn đúng (`Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.`).

Lần chạy chính thức (TC-038, 33 lỗi, 8 biến thể): vd biến thể 1 `URL /` → Received `"https://www.saucedemo.com/checkout-step-one.html"`; biến thể 4 `không đặt được hàng bằng cookie giả` → Received `true`.

![BUG-02 biến thể](<evidence/bugs/[id_bug_2]_BUG-02/manual/04-cookie-gia-dat-hang.png>)

**Evidence**: [tự động: 8 biến thể](<evidence/bugs/[id_bug_2]_BUG-02/TC-038/README.md>) · [tái hiện độc lập: 3 trang, Finish, 4 tên khác + đối chứng](<evidence/bugs/[id_bug_2]_BUG-02/manual/README.md>)
**Test tự động**: TC-038, `test.fail()`, tag `@BUG-02`. Khi sửa BUG-02 phải kiểm cả trang Products (SD-101 TC-033), giỏ, chi tiết (SD-102 TC-045) và 3 trang thanh toán (TC-038).

---

<a id="bug-26"></a>
### BUG-26: [Luồng thanh toán] Mở thẳng Tổng quan là bỏ qua bước nhập thông tin, đặt được hàng không có tên, zip
| | |
|---|---|
| **Ticket** | `[id_bug_26]` |
| **Severity** | **Medium**: đơn không có thông tin giao hàng, vô hiệu kiểm tra bắt buộc của AC-2 |
| **Priority** | **P2**: đơn tạo ra không giao được; chỉ gặp khi gõ URL tay nên chưa tới P1. Nên sửa cùng đợt với BUG-24, BUG-27 (cùng kiểu "mở thẳng URL bỏ qua bước", Q3) |
| **Liên quan** | AC-2, AC-3 · Q3 (a) · TVP-038 · TC-040 · O-20, O-43 · MSG-05 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; TD-07 giỏ `[4]`; TD-23 |

**Các bước**: 1. Đăng nhập `standard_user` · 2. Danh sách: Add to cart ở Sauce Labs Backpack (**không** vào giỏ, không Checkout) · 3. Mở thẳng `https://www.saucedemo.com/checkout-step-two.html` · 4. Bấm Finish · 5. Bấm `Generate PDF order`, mở file.

**Mong đợi** (Q3 a): bước 3 bị đưa về trang Thông tin (`Checkout: Your Information`, 3 ô trống), không có nút Finish; không đặt được hàng khi chưa nhập thông tin; giỏ vẫn 1.

**Thực tế**: bước 3 ở `/checkout-step-two.html`, tiêu đề `Checkout: Overview`, Sauce Labs Backpack, `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39`, có nút Finish. Bước 4 hiện "Thank you for your order!", số giỏ mất. PDF **không có** phần `SHIP TO` (chỉ có sản phẩm và `Item total 29.99`, `Tax 2.40`, `Total 32.39`). Cả 5 tài khoản (O-43).

Lần chạy chính thức (TC-040, 8 lỗi): `Bước 1: tiêu đề` → Expected `"Checkout: Your Information"`, Received `"Checkout: Overview"`; `Bước 2: không được hiện "Thank you for your order!"` → Received `true`.

![BUG-26](<evidence/bugs/[id_bug_26]_BUG-26/manual/01-mo-thang-tong-quan.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_26]_BUG-26/TC-040/README.md>) · [tái hiện độc lập, có nội dung PDF](<evidence/bugs/[id_bug_26]_BUG-26/manual/README.md>)
**Test tự động**: TC-040, 2 bước bằng `expect.soft`, `test.fail()`. **Lưu ý khi sửa**: TC-025, TC-026, TC-032, TC-033 (và TC-020 biến thể 9, 11) vào Tổng quan bằng URL này, có **chốt chặn BUG-26**: sửa BUG-26 xong các TC đó báo "Blocked: BUG-26 đã sửa", cần đổi đường vào (HITL #2 quyết định 3).

---

<a id="bug-35"></a>
### BUG-35: [Đặt hàng] Finish tạo đơn theo Tổng quan đã cũ, không theo giỏ / phiên hiện tại
| | |
|---|---|
| **Ticket** | `[id_bug_35]` |
| **Severity** | **Medium**: đơn trùng có tiền, đơn sai sản phẩm, giỏ bị xóa mà không có đơn (khác BUG-24 là đơn rỗng) |
| **Priority** | **P2**: đơn sai tiền nhưng chỉ gặp khi dùng 2 tab, Reset hoặc Back, không ở luồng chính. Với hệ thống thanh toán thật đề nghị PO cân nhắc P1 (khách bị thu tiền đơn thứ 2 / sản phẩm đã bỏ) |
| **Liên quan** | AC-5 · Q12 (+ bổ sung HITL #2) · TVP-055 · TC-051 · O-40, O-25, O-43, O-44, O-46 · MSG-04, MSG-07, MSG-08 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; TD-07 giỏ `[4]`, TD-08 giỏ `[4,2]`; TD-17 bộ A. "Tab 2" = mở tab mới **cùng cửa sổ** (Ctrl+T, cùng phiên) |

Mỗi biến thể từ một phiên mới; "đi tới Tổng quan" = giỏ → Checkout → `An` / `Le` / `70000` → Continue. Đánh số theo `known-issues.md`; biến thể (3) "Back sau khi đặt" thuộc BUG-24 (`standard_user`) và BUG-30 (`problem_user`), không lặp lại ở đây.

| | Các bước | Mong đợi (Q12) | Thực tế |
|---|---|---|---|
| **(1) 2 tab** (TC-051 biến thể 1) | Giỏ Backpack + Onesie; tab 1 và tab 2 cùng đi tới Tổng quan; Finish ở tab 1; rồi Finish ở tab 2 | Tab 2 không tạo đơn (giỏ đã trống): báo giỏ trống hoặc về danh sách | Tab 2 vẫn hiện 2 dòng, `Total: $41.02`; Finish ở tab 2 hiện "Thank you…" lần 2, PDF đủ Backpack, Onesie, `Total 41.02` |
| **(2) Sau Reset App State** (biến thể 2) | Giỏ Backpack + Onesie, đi tới Tổng quan; ☰ → Reset App State, đóng menu; bấm Finish | Giỏ đã trống thì không tạo đơn | `cart-contents` đã mất nhưng trang vẫn 2 dòng (BUG-05); Finish hiện "Thank you…", PDF đủ 2 sản phẩm, `Total 41.02` |
| **(4) Giỏ thêm ở tab khác** (biến thể 3) | Giỏ Backpack, đi tới Tổng quan ở tab 1; tab 2 mở danh sách, Add to cart ở Onesie; Finish ở tab 1, mở PDF | Đơn theo giỏ hiện tại `[4,2]`: Backpack, Onesie, `Total 41.02` | `cart-contents` trước Finish `[4,2]`; PDF **chỉ có Backpack**, `Item total 29.99`, `Tax 2.40`, `Total 32.39`; sau Finish `cart-contents` bị xóa: **Onesie mất** mà không có trong đơn |
| **(5) Giỏ bỏ ở tab khác** (biến thể 4) | Giỏ Backpack + Onesie, đi tới Tổng quan ở tab 1; tab 2 mở giỏ, Remove ở Onesie; Finish ở tab 1, mở PDF | Đơn theo giỏ hiện tại `[4]`: chỉ Backpack, `Total 32.39` | `cart-contents` trước Finish `[4]`; PDF **có cả Onesie đã bỏ**, `Item total 37.98`, `Tax 3.04`, `Total 41.02` |
| **(6) Đăng xuất ở tab khác** (biến thể 5) | Giỏ Backpack + Onesie, đi tới Tổng quan ở tab 1; tab 2 mở danh sách, ☰ → Logout; Finish ở tab 1; đăng nhập lại | Bị chặn về trang đăng nhập (AC-7) **và** giỏ giữ nguyên `[4,2]` (Q12 bổ sung: không tạo được đơn thì giỏ phải giữ nguyên) | Bị chặn đúng: `/`, `Epic sadface: You can only access '/checkout-complete.html' when you are logged in.`; nhưng `cart-contents` `[4,2]` → **bị xóa**, đăng nhập lại không có số giỏ. Đối chứng: bấm **Cancel** thay Finish trong cùng tình huống thì giỏ vẫn `[4,2]` |

Lần chạy chính thức (TC-051, 7 lỗi): `Biến thể 1: tab 2 không đặt được đơn lần 2` → Received `true`; `Biến thể 2: giỏ đã trống thì không tạo đơn` → Received `true`; biến thể 3 PDF thiếu `Sauce Labs Onesie`, `7.99`, `Total`, `41.02` (annotation PDF: `Item total 29.99`, `Tax 2.40`, `Total 32.39`); biến thể 4 PDF có `Sauce Labs Onesie`, `Total 41.02`; `Biến thể 5: giỏ sau Finish giống hệt ngay trước Finish` → Expected `"[4,2]"`, Received `null`. Mọi tài khoản đặt hàng được đều bị (1), (2) (O-43).

**Nguyên nhân dự đoán**: Finish dựng đơn từ dữ liệu trang Tổng quan đã tải, không đọc lại giỏ / phiên lúc bấm, rồi xóa `cart-contents` bất kể có tạo được đơn hay không.

![BUG-35 (5) giỏ bỏ ở tab khác, TC-051 biến thể 4](<evidence/bugs/[id_bug_35]_BUG-35/manual/04-gio-bo-o-tab-khac.png>)

**Evidence**: [tự động: 5 biến thể + ảnh đăng nhập lại](<evidence/bugs/[id_bug_35]_BUG-35/TC-051/README.md>) · [tái hiện độc lập: 5 biến thể + đối chứng Cancel, có nội dung PDF](<evidence/bugs/[id_bug_35]_BUG-35/manual/README.md>)
**Test tự động**: TC-051, 5 biến thể bằng `expect.soft`, `test.fail()`. Sửa BUG-35 nên kiểm lại BUG-24 đường 3, BUG-30 biến thể 3 (cùng điểm kiểm "Finish theo giỏ hiện tại").

---

<a id="bug-05"></a>
### BUG-05: [Menu] (biến thể SD-103) Reset App State ở Tổng quan xóa giỏ nhưng trang vẫn liệt kê sản phẩm và số tiền
| | |
|---|---|
| **Ticket** | `[id_bug_5]` (**gộp vào ticket BUG-05** của SD-102, không tạo ticket mới) |
| **Severity** | **Medium** như BUG-05: người dùng tưởng đơn còn sản phẩm; bấm Finish lúc này còn tạo đơn (BUG-35 (2)) |
| **Priority** | **P2** như BUG-05: chức năng phụ, tải lại trang thì đúng |
| **Liên quan** | AC-4, AC-5 · TVP-026 · TC-027 · O-25, O-43 · SD-102 [`defects.md`](../saucedemo-products-cart-screen/defects.md) BUG-05 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; TD-08 giỏ `[4,2]`; TD-17 bộ A |

**Các bước**: 1. Đăng nhập `standard_user`, thêm Sauce Labs Backpack và Sauce Labs Onesie · 2. Giỏ → Checkout → `An` / `Le` / `70000` → Continue (Tổng quan) · 3. ☰ → **Reset App State**, đóng menu (không tải lại).

**Mong đợi** (quy tắc "Reset phải thấy ngay", như BUG-05): Tổng quan không còn dòng sản phẩm, số tiền về 0 (hoặc báo giỏ trống), không cần tải lại.

**Thực tế**: số giỏ mất, `cart-contents` mất (dữ liệu đã xóa) nhưng trang **vẫn 2 dòng** (Sauce Labs Backpack, Sauce Labs Onesie), `Item total: $37.98`, `Tax: $3.04`, `Total: $41.02`. Tải lại trang thì `0` dòng, `Item total: $0`. Đối chứng: Reset ở trang **Thông tin** (không liệt kê sản phẩm) thì số giỏ mất, đúng. 5/5 tài khoản (O-43).

Lần chạy chính thức (TC-027, 1 lỗi): `Tổng quan (BUG-05): không còn dòng sản phẩm` → Expected `0`, Received `2`.

![BUG-05 biến thể](<evidence/bugs/[id_bug_5]_BUG-05/manual/01-tong-quan-sau-reset.png>)

**Evidence**: [tự động: Thông tin (đúng) + Tổng quan](<evidence/bugs/[id_bug_5]_BUG-05/TC-027/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_5]_BUG-05/manual/README.md>)
**Test tự động**: TC-027, `test.fail()`, tag `@BUG-05`. Khi sửa BUG-05 phải kiểm cả danh sách, chi tiết, giỏ (SD-102 TC-041) và Tổng quan (TC-027).

---

<a id="bug-24"></a>
### BUG-24: [Đặt hàng] Đặt được đơn không có sản phẩm khi Tổng quan rỗng
| | |
|---|---|
| **Ticket** | `[id_bug_24]` |
| **Severity** | **Low**: đơn rỗng không có tiền; thông báo thành công sai (quy tắc "danh sách rỗng vẫn bấm được bước tiếp") |
| **Priority** | **P3**: không mất tiền; đường 1, 2 cần giỏ trống + BUG-19 hoặc sửa URL. Đường 3 (Back sau khi đặt) là thao tác thường gặp hơn, nên sửa cùng BUG-35 (cùng điểm kiểm "Finish theo giỏ hiện tại") |
| **Liên quan** | AC-5 · TVP-027, TVP-030 · TC-028, TC-029 · O-18, O-19, O-43 · MSG-07 · BUG-19 (điểm bắt đầu đường 1), BUG-35, BUG-30 · IMP-09 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; TD-14 giỏ rỗng; TD-08 giỏ `[4,2]` (đường 3); TD-17 bộ A |

| | Đường 1: giỏ trống qua Checkout (TC-028) | Đường 2: mở thẳng URL (TC-028) | Đường 3: Back sau khi đặt (TC-029) |
|---|---|---|---|
| **Các bước** | 1. Đăng nhập, không thêm gì<br>2. Mở giỏ, bấm Checkout (BUG-19 cho bấm)<br>3. `An` / `Le` / `70000` → Continue<br>4. Bấm Finish | 1. Đăng nhập, không thêm gì<br>2. Mở thẳng `/checkout-step-two.html`<br>3. Bấm Finish | 1. Thêm Backpack, Onesie, đi tới Tổng quan, bấm Finish<br>2. Bấm **Back** của trình duyệt<br>3. Bấm Finish |
| **Mong đợi** (AC-5, MSG-07) | Không tạo được đơn rỗng: không hiện "Thank you for your order!" (khóa Finish hoặc báo giỏ trống) | Như đường 1 | Không đặt được đơn lần 2 (IMP-09 đề xuất đưa về danh sách thay vì Tổng quan rỗng) |
| **Thực tế** | Tổng quan **0 dòng**, `Item total: $0`, `Tax: $0.00`, `Total: $0.00`, có nút Finish; Finish hiện "Thank you for your order!" | Như đường 1 | Back về `/checkout-step-two.html` 0 dòng, `Item total: $0`, có nút Finish; Finish hiện "Thank you for your order!" **lần 2** (đơn rỗng) |

Lần chạy chính thức: TC-028 (2 lỗi) `Đường 1: không được hiện "Thank you for your order!"` → Received `true`, đường 2 tương tự; TC-029 (1 lỗi) `Bước 3: không đặt được đơn lần 2` → Received `true`. `visual_user`, `performance_glitch_user` giống `standard_user` (O-43); `problem_user` ở đường 3 thành đơn trùng **có tiền** (BUG-30); `error_user` không Finish được (BUG-33).

![BUG-24 đường 3](<evidence/bugs/[id_bug_24]_BUG-24/manual/03-duong-3-back-ve-tong-quan-rong.png>)

**Evidence**: tự động [TC-028: đường 1, 2](<evidence/bugs/[id_bug_24]_BUG-24/TC-028/README.md>), [TC-029: đường 3](<evidence/bugs/[id_bug_24]_BUG-24/TC-029/README.md>) · [tái hiện độc lập: 3 đường](<evidence/bugs/[id_bug_24]_BUG-24/manual/README.md>)
**Test tự động**: TC-028 (2 đường), TC-029 (đường 3), `test.fail()`.

---

<a id="bug-36"></a>
### BUG-36: [Điều hướng] Bấm đúp Continue / Finish chạy 2 lần, phải bấm Back 2 lần mới về trang trước
| | |
|---|---|
| **Ticket** | `[id_bug_36]` |
| **Severity** | **Low**: phiền khi điều hướng, không thấy đơn trùng, không mất dữ liệu |
| **Priority** | **P3** (người dùng chốt ở HITL #2): sửa khi tiện; một chỗ sửa chung cho 2 nút (chặn bấm lặp) |
| **Liên quan** | AC-3, AC-5 · HITL #2 quyết định 1 (O-45) · TVP-058 · TC-052 · MSG-07, MSG-08 · (IMP-11 cũ đã chuyển thành bug này) |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; TD-08 giỏ `[4,2]`; TD-17 bộ A |

**Các bước**: Biến thể 1: 1. Giỏ Backpack + Onesie, giỏ → Checkout, nhập `An` / `Le` / `70000` · 2. Console: `history.length` (ghi lại) · 3. **Bấm đúp** Continue · 4. Console: `history.length` · 5. Bấm Back của trình duyệt 1 lần. Biến thể 2: 1. Đi tới Tổng quan, đọc `history.length` · 2. **Bấm đúp** Finish · 3. Đọc `history.length`, số giỏ, PDF · 4. Bấm Back 1 lần, rồi lần 2.

**Mong đợi** (HITL #2-1): nút chỉ xử lý **một lần** dù bấm lặp: `history.length` tăng đúng 1, **một** lần Back về trang trước.

**Thực tế**:
| | `history.length` | Back lần 1 | Back lần 2 |
|---|---|---|---|
| Biến thể 1: bấm đúp Continue | tăng **2** | **vẫn Tổng quan** | về Thông tin |
| Biến thể 2: bấm đúp Finish | tăng **2** | **vẫn Hoàn tất** | về `/checkout-step-two.html` rỗng (`Item total: $0`) |
| Đối chứng: bấm Continue 1 lần | tăng 1 | về Thông tin (đúng) | |

Phần đúng (không phải bug): không có đơn thứ 2 quan sát được, giỏ được làm trống một lần, PDF đúng Backpack, Onesie, `Total 41.02`, không có lỗi JavaScript.

Lần chạy chính thức (TC-052, 4 lỗi): `Biến thể 1 (BUG-36): history.length tăng đúng 1` → Expected `1`, Received `2`; `Biến thể 2 (BUG-36): 1 lần Back đã rời trang Hoàn tất` → Received `visible`.

**Nguyên nhân dự đoán**: trình xử lý Continue / Finish chạy cho mỗi lần bấm và gọi `pushState` cùng URL 2 lần; nút không bị khóa sau lần bấm đầu.

![BUG-36 biến thể 2](<evidence/bugs/[id_bug_36]_BUG-36/manual/02-bam-dup-finish-back-1-lan.png>)

**Evidence**: [tự động: 2 biến thể](<evidence/bugs/[id_bug_36]_BUG-36/TC-052/README.md>) · [tái hiện độc lập: 2 biến thể + đối chứng](<evidence/bugs/[id_bug_36]_BUG-36/manual/README.md>)
**Test tự động**: TC-052, 2 biến thể bằng `expect.soft`, `test.fail()`.

---

<a id="bug-16"></a>
### BUG-16: [Giao diện] (biến thể SD-103) `visual_user`: biểu tượng giỏ lệch và xoay, menu xoay ở cả 3 trang thanh toán
| | |
|---|---|
| **Ticket** | `[id_bug_16]` (**gộp vào ticket BUG-16** của SD-102, không tạo ticket mới) |
| **Severity** | **Low** như BUG-16: lỗi giao diện, vẫn dùng được |
| **Priority** | **P3** như BUG-16: thẩm mỹ, không chặn thao tác |
| **Liên quan** | AC-1, AC-4, AC-5 · TVP-042 · TC-044 · O-36 · SD-102 [`defects.md`](../saucedemo-products-cart-screen/defects.md) BUG-16 |
| **Tài khoản / dữ liệu** | TD-04 `visual_user`, mốc TD-01 `standard_user`; TD-07 giỏ `[4]`; TD-17 bộ A; 2 cửa sổ cùng cỡ 1280×720 |

**Các bước**: 1. Mở 2 cửa sổ 1280×720, đăng nhập `standard_user` và `visual_user`, giỏ Backpack · 2. Ở mỗi cửa sổ đi lần lượt Thông tin (giỏ → Checkout), Tổng quan (`An` / `Le` / `70000` → Continue), Hoàn tất (Finish) · 3. Ở mỗi trang, chờ trang tải xong, DevTools Console: `document.querySelector('.shopping_cart_container').getBoundingClientRect()` (vị trí), `getComputedStyle(document.querySelector('.shopping_cart_container')).transform` và `getComputedStyle(document.querySelector('.bm-icon')).transform` (xoay).

**Mong đợi** (so tọa độ với `standard_user`, sai số 5 px, HITL #2 quyết định 5): biểu tượng giỏ cùng vị trí, không xoay (`none`); menu không xoay.

**Thực tế** (giống nhau ở cả 3 trang):
| | Giỏ x, y | Giỏ `transform` | Menu `transform` |
|---|---|---|---|
| `standard_user` | 1220, 10 | `none` | `none` |
| `visual_user` | **1034, 39** (lệch 186 px ngang, 29 px dọc) | `matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, 0)` (≈ 3°) | `matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, 0)` |

Lần chạy chính thức (TC-044, 12 lỗi = 4 điểm × 3 trang): vd `Thông tin: biểu tượng giỏ lệch ngang (px)` → Received `186.019287109375`; `lệch dọc` → `28.980690002441406`; `bị xoay` → `"matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, 0)"`. Các phần tử khác của 3 trang khớp `standard_user`.

![BUG-16 biến thể](<evidence/bugs/[id_bug_16]_BUG-16/manual/05-visual_user-tong-quan.png>)

**Evidence**: [tự động: 3 trang](<evidence/bugs/[id_bug_16]_BUG-16/TC-044/README.md>) · [tái hiện độc lập, so 2 tài khoản ở 3 trang](<evidence/bugs/[id_bug_16]_BUG-16/manual/README.md>)
**Test tự động**: TC-044 so tọa độ và `transform` với `standard_user`, `test.fail()`, tag `@BUG-16`. Khi sửa BUG-16 phải kiểm cả SD-102 TC-035 và TC-044.

---

## Màn hình 1: Thông tin (`/checkout-step-one.html`)

<a id="bug-28"></a>
### BUG-28: [Form thông tin] `problem_user`: gõ vào Last Name thì ký tự đi vào First Name, không đặt được hàng
| | |
|---|---|
| **Ticket** | `[id_bug_28]` |
| **Severity** | **High**: không thể đặt hàng (Last Name luôn trống); tiền lệ SD-102 BUG-10, BUG-13 |
| **Priority** | **P1**: chặn luồng mua hàng chính của tài khoản này, không có cách khác qua giao diện |
| **Liên quan** | AC-1, AC-3 · TVP-014 · TC-013 · O-29 · MSG-02 |
| **Tài khoản / dữ liệu** | TD-02 `problem_user`; giỏ `[4]`; First `An`, Last `Lee`, Zip `70000` |

**Các bước**: 1. Đăng nhập `problem_user`, thêm Sauce Labs Backpack · 2. Giỏ → Checkout · 3. Nhập First Name `An` · 4. Bấm vào ô Last Name, **gõ từng phím** `L`, `e`, `e` · 5. Nhập Zip `70000`, bấm Continue.

**Mong đợi** (AC-1, AC-3, như `standard_user`): First Name `An`, Last Name `Lee`; Continue sang `Checkout: Overview`.

**Thực tế**: sau bước 4 First Name = **`e`** (mỗi phím thay toàn bộ First Name), Last Name **trống**; bước 5 báo `Error: Last Name is required`, ở lại trang Thông tin. Dán / `fill` `Lee` vào Last Name cũng vậy: First Name thành `Lee`, Last Name trống. Đối chứng `standard_user` cùng thao tác: First `An`, Last `Lee`, sang Tổng quan.

Lần chạy chính thức (TC-013, 8 lỗi): `Biến thể 1: First Name` → Expected `"An"`, Received `"e"`; `Last Name` → Received `""`; biến thể 2 First Name Received `"Lee"`, tiêu đề Received `"Checkout: Your Information"`, có `Error: Last Name is required`.

![BUG-28](<evidence/bugs/[id_bug_28]_BUG-28/manual/01-go-last-name-vao-first-name.png>)

**Evidence**: [tự động: 2 biến thể](<evidence/bugs/[id_bug_28]_BUG-28/TC-013/README.md>) · [tái hiện độc lập + đối chứng](<evidence/bugs/[id_bug_28]_BUG-28/manual/README.md>)
**Test tự động**: TC-013, `test.fail()`. Lỗi này buộc TC-025, TC-026, TC-032 vào Tổng quan bằng URL (BUG-26).

---

<a id="bug-31"></a>
### BUG-31: [Form thông tin] `error_user`: ô Last Name không nhận ký tự, mỗi phím một lỗi JavaScript và một báo lỗi gửi ra ngoài
| | |
|---|---|
| **Ticket** | `[id_bug_31]` |
| **Severity** | **High**: không nhập được ô bắt buộc; trang ném lỗi JavaScript |
| **Priority** | **P1**: chặn luồng mua hàng của tài khoản này (chỉ đi tiếp được nhờ BUG-32, cũng là lỗi) |
| **Liên quan** | AC-1, AC-3 · TVP-015, TVP-044 · TC-014 · O-33, O-38 · MSG-09 |
| **Tài khoản / dữ liệu** | TD-03 `error_user`; giỏ `[4]`; First `An`, Last `Lee`, Zip `70000` |

**Các bước**: 1. Đăng nhập `error_user`, thêm Sauce Labs Backpack · 2. Giỏ → Checkout · 3. Mở DevTools tab Console và Network · 4. Nhập First Name `An` · 5. Bấm vào ô Last Name, gõ `L`, `e`, `e`.

**Mong đợi** (AC-1, như `standard_user`): Last Name `Lee`, không có lỗi JavaScript, không có request báo lỗi.

**Thực tế**: Last Name **trống**. Mỗi phím: 1 lỗi JavaScript không được bắt (Playwright bắt qua `pageerror`) nguyên văn `Cannot read properties of undefined (reading 'value')` (MSG-09) và 1 request tới `https://submit.backtrace.io/…/json`. 3 phím → **3** lỗi + **3** request. Đối chứng `standard_user`: Last `Lee`, 0 lỗi, 0 request. (401 tới `events.backtrace.io` và cảnh báo `unload` có ở mọi tài khoản, O-38, không tính.)

Lần chạy chính thức (TC-014, 3 lỗi): `Last Name` → Expected `"Lee"`, Received `""`; `0 pageerror` → Received 3 × `"- [/checkout-step-one.html]: Cannot read properties of undefined (reading 'value')"`; `0 request tới submit.backtrace.io` → Received 3 request.

![BUG-31](<evidence/bugs/[id_bug_31]_BUG-31/manual/01-last-name-khong-nhan-ky-tu.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_31]_BUG-31/TC-014/README.md>) · [tái hiện độc lập, có nội dung lỗi + đối chứng](<evidence/bugs/[id_bug_31]_BUG-31/manual/README.md>) · nội dung lỗi trong `annotations` của TC-014 trong run JSON
**Test tự động**: TC-014, 3 điểm bằng `expect.soft`, `test.fail()`.

---

<a id="bug-23"></a>
### BUG-23: [Form thông tin] Nhấn Enter trong ô nhập về trang giỏ (như Cancel) thay vì Continue
| | |
|---|---|
| **Ticket** | `[id_bug_23]` |
| **Severity** | **Medium**: người dùng bàn phím không đặt hàng được, tưởng bị đá ra, mất thông tin đã nhập |
| **Priority** | **P2**: vẫn đặt được bằng chuột (bấm Continue); sửa nhanh (thứ tự / loại nút trong form) |
| **Liên quan** | AC-2, AC-3 · Q5 · TVP-010 · TC-009 · O-09, O-02, O-43 · MSG-01 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; giỏ `[4]`; TD-17 bộ A |

**Các bước**: 1. Đăng nhập `standard_user`, thêm Sauce Labs Backpack, giỏ → Checkout · 2. Nhập `An` / `Le` / `70000` · 3. Bấm vào ô First Name (hoặc Last Name, Zip), nhấn **Enter**. Lặp lại với 3 ô **trống**.

**Mong đợi** (Q5: Enter = Continue, như form đăng nhập SD-101): đủ 3 ô → sang `Checkout: Overview`; 3 ô trống → báo `Error: First Name is required`, ở lại trang Thông tin.

**Thực tế**: cả 6 trường hợp (Enter ở 3 ô, khi đủ và khi trống) về **`/cart.html`, tiêu đề `Your Cart`**, không báo lỗi, không sang Tổng quan; quay lại Checkout thì 3 ô trống. Đối chứng: Tab tới nút Continue rồi Enter thì sang `Checkout: Overview` (đúng). Cả 5 tài khoản (O-43).

Lần chạy chính thức (TC-009, 21 lỗi): vd `Biến thể 1 (đủ 3 ô, Enter ở ô first): URL` → Received `"https://www.saucedemo.com/cart.html"`; `tiêu đề` → Expected `"Checkout: Overview"`, Received `"Your Cart"`; biến thể 4 → 6 (trống): không có `Error: First Name is required`, nút Checkout của trang giỏ hiện.

**Nguyên nhân dự đoán** (O-02): nút `Cancel` là `type=submit` đứng **trước** `Continue` trong form, nên Enter kích hoạt Cancel.

![BUG-23](<evidence/bugs/[id_bug_23]_BUG-23/manual/01-enter-o-first-name.png>)

**Evidence**: [tự động: 6 biến thể](<evidence/bugs/[id_bug_23]_BUG-23/TC-009/README.md>) · [tái hiện độc lập: 3 biến thể + đối chứng](<evidence/bugs/[id_bug_23]_BUG-23/manual/README.md>)
**Test tự động**: TC-009, 6 biến thể bằng `expect.soft`, `test.fail()`.

---

<a id="bug-34"></a>
### BUG-34: [Form thông tin] Ô chỉ có khoảng trắng / ký tự tab được coi là đã nhập
| | |
|---|---|
| **Ticket** | `[id_bug_34]` |
| **Severity** | **Medium**: đơn không có thông tin giao hàng (PDF `SHIP TO` không có chữ) |
| **Priority** | **P2**: dữ liệu đơn sai nhưng người dùng phải cố ý nhập khoảng trắng; sửa nhanh (cắt khoảng trắng trước khi kiểm) |
| **Liên quan** | AC-2 · Q4 · TVP-005 · TC-005 · O-06, O-43 · MSG-01, MSG-02, MSG-03, MSG-08 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; giỏ `[4]`; TD-19 (`" "`, `"   "`, ký tự tab) |

**Các bước**: 1. Đăng nhập `standard_user`, thêm Sauce Labs Backpack, giỏ → Checkout · 2. Nhập 1 khoảng trắng vào cả 3 ô, bấm Continue · 3. Bấm Finish, Generate PDF order. Biến thể: First `An`, Last `"   "` (3 khoảng trắng), Zip `70000`; First `An`, Last `Le`, Zip là 1 ký tự tab (dán, không nhấn phím Tab).

**Mong đợi** (Q4: cắt khoảng trắng đầu cuối rồi mới kiểm): báo như ô trống, nguyên văn `Error: First Name is required` / `Error: Last Name is required` / `Error: Postal Code is required` theo ô đầu tiên chỉ có khoảng trắng; ở lại trang Thông tin.

**Thực tế**: cả 5 biến thể **sang `/checkout-step-two.html`** (`Checkout: Overview`), không báo lỗi; Finish đặt hàng được, PDF có tiêu đề `SHIP TO` nhưng phần tên / zip **không có chữ** (2 đoạn chỉ có khoảng trắng). Đối chứng: First trống thật thì báo `Error: First Name is required` (đúng). `visual_user`, `performance_glitch_user`, `error_user` giống nhau; `problem_user` bị BUG-28 che (O-43).

Lần chạy chính thức (TC-005, 20 lỗi = 4 điểm × 5 biến thể): vd `Biến thể 1 (cả 3 ô 1 khoảng trắng): thông báo` → Expected `"Error: First Name is required"`, element not found; `vẫn ở /checkout-step-one.html` → Received `"https://www.saucedemo.com/checkout-step-two.html"`.

![BUG-34](<evidence/bugs/[id_bug_34]_BUG-34/manual/01-khoang-trang-sang-tong-quan.png>)

**Evidence**: [tự động: 5 biến thể](<evidence/bugs/[id_bug_34]_BUG-34/TC-005/README.md>) · [tái hiện độc lập: 3 biến thể + PDF + đối chứng](<evidence/bugs/[id_bug_34]_BUG-34/manual/README.md>)
**Test tự động**: TC-005, 5 biến thể bằng `expect.soft`, `test.fail()`.

---

<a id="bug-32"></a>
### BUG-32: [Form thông tin] `error_user`: bỏ qua kiểm tra Last Name
| | |
|---|---|
| **Ticket** | `[id_bug_32]` |
| **Severity** | **Medium**: vi phạm AC-2, đơn thiếu họ; báo sai ô thiếu |
| **Priority** | **P2**: chỉ ở `error_user`; nên sửa cùng BUG-31 (cùng ô Last Name của tài khoản này) |
| **Liên quan** | AC-2 · TVP-016 · TC-015 · O-34 · MSG-02, MSG-03 |
| **Tài khoản / dữ liệu** | TD-03 `error_user`; giỏ `[4]`; First `Ann`, Zip `70000` |

**Các bước**: 1. Đăng nhập `error_user`, thêm Sauce Labs Backpack, giỏ → Checkout · 2. First Name `Ann`, **không chạm** Last Name, Zip trống, bấm Continue · 3. Mở lại trang Thông tin, First `Ann`, Zip `70000`, Last Name không chạm, bấm Continue.

**Mong đợi** (AC-2, thứ tự First → Last → Zip): cả 2 lần báo `Error: Last Name is required`, ở lại trang Thông tin.

**Thực tế**: bước 2 báo **`Error: Postal Code is required`** (bỏ qua ô Last Name đang trống); bước 3 **sang `/checkout-step-two.html`** (`Checkout: Overview`), đơn không có họ. Đối chứng `standard_user` cùng thao tác bước 3: `Error: Last Name is required` (đúng). Không gõ Last Name để tách khỏi BUG-31.

Lần chạy chính thức (TC-015, 5 lỗi): `Biến thể 1 (Ann / trống / trống): thông báo` → Expected `"Error: Last Name is required"`, Received `"Error: Postal Code is required"`; biến thể 2 `vẫn ở /checkout-step-one.html` → Received `"https://www.saucedemo.com/checkout-step-two.html"`.

![BUG-32](<evidence/bugs/[id_bug_32]_BUG-32/manual/02-bo-qua-last-name.png>)

**Evidence**: [tự động: 2 biến thể](<evidence/bugs/[id_bug_32]_BUG-32/TC-015/README.md>) · [tái hiện độc lập + đối chứng](<evidence/bugs/[id_bug_32]_BUG-32/manual/README.md>)
**Test tự động**: TC-015, 2 biến thể bằng `expect.soft`, `test.fail()`.

---

<a id="bug-22"></a>
### BUG-22: [Form thông tin] Thiếu một ô bắt buộc thì cả 3 ô bị tô đỏ, kể cả ô đã nhập đúng
| | |
|---|---|
| **Ticket** | `[id_bug_22]` |
| **Severity** | **Low**: lỗi giao diện, người dùng không biết ô nào sai (thông báo chữ vẫn đúng); tiền lệ SD-101 Q6 (BUG-01) |
| **Priority** | **P3**: thẩm mỹ, thông báo chữ vẫn chỉ đúng ô |
| **Liên quan** | AC-2 · Q9 · TVP-003 · TC-003 · O-04, O-43 · cùng kiểu SD-101 BUG-01 (khác form nên số mới) |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; giỏ `[4]`; TD-18 (7 tổ hợp ô trống, giá trị bộ A) |

**Các bước**: 1. Đăng nhập `standard_user`, thêm Sauce Labs Backpack, giỏ → Checkout · 2. Nhập First `An`, để trống Last, Zip; bấm Continue · 3. DevTools Console: `document.querySelector('#first-name').classList` (tương tự `#last-name`, `#postal-code`), đếm `.error_icon` trong **từng** `.form_group` (`[...document.querySelectorAll('.form_group')].map((g) => g.querySelectorAll('.error_icon').length)`, kết quả theo thứ tự First, Last, Zip). Lặp lại với các tổ hợp khác của TD-18.

**Mong đợi** (Q9, tiền lệ SD-101 Q6): chỉ ô còn thiếu có viền đỏ (class `error`) và icon lỗi; ô đã nhập không bị tô đỏ. (Class `input_error` luôn có, không dùng làm dấu hiệu.)

**Thực tế**: thông báo đúng ô thiếu (vd `Error: Last Name is required`), nhưng **cả 3 ô** có class `error` (`input_error form_input error`) và 1 icon lỗi, kể cả ô `An` đã nhập. Lặp lại ở **6/6 tổ hợp có ít nhất một ô đã nhập** (tổ hợp trống cả 3 thì tô cả 3 là đúng). Cả 5 tài khoản (O-43).

Lần chạy chính thức (TC-003, 18 lỗi = 2 điểm × mỗi ô đã nhập ở 6 tổ hợp): vd `chỉ có First: ô đã nhập first không có class error` → Received `"input_error form_input error"`; `ô đã nhập first không có icon` → Expected `0`, Received `1`.

![BUG-22](<evidence/bugs/[id_bug_22]_BUG-22/manual/01-thieu-o-ca-3-o-do.png>)

**Evidence**: [tự động: 7 tổ hợp](<evidence/bugs/[id_bug_22]_BUG-22/TC-003/README.md>) · [tái hiện độc lập: 3 tổ hợp](<evidence/bugs/[id_bug_22]_BUG-22/manual/README.md>)
**Test tự động**: TC-003, 7 tổ hợp bằng `expect.soft`, `test.fail()`.

---

<a id="bug-19"></a>
### BUG-19: [Trang thông tin] (biến thể SD-103) Giỏ trống mở thẳng URL vẫn vào trang Thông tin
| | |
|---|---|
| **Ticket** | `[id_bug_19]` (**gộp vào ticket BUG-19** của SD-102, không tạo ticket mới) |
| **Severity** | **Low** như BUG-19: không mất dữ liệu, chỉ vào một bước vô nghĩa (nhưng là điểm bắt đầu của BUG-24 đường 1) |
| **Priority** | **P3** như BUG-19: phải gõ URL tay |
| **Liên quan** | AC-1 · TVP-054 · TC-042 · O-20, O-43 · SD-102 [`defects.md`](../saucedemo-products-cart-screen/defects.md) BUG-19 (Q5 của SD-102) · BUG-24 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; TD-14 giỏ rỗng; TD-23 |

**Các bước**: đăng nhập `standard_user`, không thêm sản phẩm (không có số giỏ), mở thẳng `https://www.saucedemo.com/checkout-step-one.html`.
**Mong đợi** (SD-102 Q5, quy tắc "giỏ trống không vào thanh toán"): bị chặn, không vào trang Thông tin (không ép trang đích).
**Thực tế**: ở `/checkout-step-one.html`, tiêu đề `Checkout: Your Information`, có 3 ô nhập. Cả 5 tài khoản (O-43).

Lần chạy chính thức (TC-042, 2 lỗi): `không có ô First Name (chờ 5 giây)` → Received `true`; `không có tiêu đề "Checkout: Your Information"` → Received `1`.

![BUG-19 biến thể](<evidence/bugs/[id_bug_19]_BUG-19/manual/01-gio-trong-mo-thang-thong-tin.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_19]_BUG-19/TC-042/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_19]_BUG-19/manual/README.md>) · **Test tự động**: TC-042, `test.fail()`, tag `@BUG-19`. Khi sửa BUG-19 phải kiểm cả nút Checkout (SD-102 TC-030) và URL (TC-042).

---

## Màn hình 2: Tổng quan (`/checkout-step-two.html`)

<a id="bug-29"></a>
### BUG-29: [Tổng tiền] `problem_user`: Item total gấp đôi, Tax và Total tính theo số sai
| | |
|---|---|
| **Ticket** | `[id_bug_29]` |
| **Severity** | **High** (HITL #3 chốt cho web demo). Với hệ thống thật là **Critical** vì thu sai tiền (tiền lệ SD-102 BUG-14) |
| **Priority** | **P1**: sai tiền, mọi giỏ (63/63 tổ hợp, O-30), cả biên nhận |
| **Liên quan** | AC-4 · Q2 · TVP-025 · TC-026 · O-30 · MSG-08 · BUG-25 (định dạng, cùng màn hình), BUG-28 |
| **Tài khoản / dữ liệu** | TD-02 `problem_user`; TD-07 `[4]`, TD-11 `[2]`, TD-15 `[0]`, TD-08 `[4,2]`, TD-09 `[4,0,2]`, TD-10 `[4,0,1,5,2,3]` |

**Các bước** (`problem_user` không qua được trang Thông tin do BUG-28, nên vào Tổng quan bằng URL, nhờ BUG-26): 1. Đăng nhập `problem_user` · 2. Console: `localStorage.setItem("cart-contents","[4]")` · 3. Mở `/checkout-step-two.html`, đọc 3 dòng tiền · 4. Lặp với giỏ khác · 5. Giỏ `[4,2]`: bấm Finish, Generate PDF order.

**Mong đợi** (AC-4, Q2, tính từ TD-06 theo cent): như `standard_user` cùng giỏ.

**Thực tế**: giá từng dòng đúng, nhưng Item total **gấp đôi** tổng giá thật; Tax, Total tính theo số sai:

| Giỏ | Mong đợi (Item total / Tax / Total) | Thực tế |
|---|---|---|
| `[4]` Backpack | `$29.99` / `$2.40` / `$32.39` | `$59.98` / `$4.80` / `$64.78` |
| `[0]` Bike Light | `$9.99` / `$0.80` / `$10.79` | `$19.98` / `$1.60` / `$21.58` |
| `[2]` Onesie | `$7.99` / `$0.64` / `$8.63` | `$15.98` / `$1.28` / `$17.26` |
| `[4,2]` | `$37.98` / `$3.04` / `$41.02` | `$75.96` / `$6.08` / `$82.04` |
| `[4,0,2]` | `$47.97` / `$3.84` / `$51.81` | `$95.94` / `$7.68` / `$103.62` (trang in `$95.93999999999998`: BUG-25) |
| cả 6 `[4,0,1,5,2,3]` | `$129.94` / `$10.40` / `$140.34` | `$259.88` / `$20.79` / `$280.67` |
| PDF giỏ `[4,2]` | `37.98` / `3.04` / `41.02` | `75.96` / `6.08` / `82.04` (không có `SHIP TO` vì vào bằng URL) |

Đối chứng: `standard_user` giỏ `[4]` cùng cách vào: `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39`.

Lần chạy chính thức (TC-026, 7 lỗi): so theo cent, vd `Giỏ [4]` → Expected `item 2999, tax 240, total 3239`, Received `item 5998, tax 480, total 6478`; `Giỏ [4,0,1,5,2,3]` → Received `25988 / 2079 / 28067`; PDF (annotation) `Item total | $ | 75.96 | Tax | $ | 6.08 | Total | $ | 82.04`. Hiện chỉ tới được bằng URL do BUG-28.

![BUG-29 cả 6 sản phẩm](<evidence/bugs/[id_bug_29]_BUG-29/manual/02-gio-401523.png>)

**Evidence**: [tự động: 6 giỏ + PDF](<evidence/bugs/[id_bug_29]_BUG-29/TC-026/README.md>) · [tái hiện độc lập: 3 giỏ + PDF + đối chứng](<evidence/bugs/[id_bug_29]_BUG-29/manual/README.md>)
**Test tự động**: TC-026, 7 điểm, so giá trị số (cent) để tách khỏi BUG-25, có chốt chặn BUG-26, `test.fail()`.

---

<a id="bug-33"></a>
### BUG-33: [Đặt hàng] `error_user`: bấm Finish không có tác dụng, trang ném lỗi JavaScript
| | |
|---|---|
| **Ticket** | `[id_bug_33]` |
| **Severity** | **High**: không đặt được hàng; cùng mức BUG-28 và tiền lệ SD-102 BUG-10, BUG-13 |
| **Priority** | **P1**: chặn bước cuối của luồng mua hàng, không có cách khác |
| **Liên quan** | AC-5 · TVP-032, TVP-044 · TC-033 · O-35 · MSG-07, MSG-10 |
| **Tài khoản / dữ liệu** | TD-03 `error_user`; TD-09 giỏ `[4,0,2]` |

**Các bước** (`error_user` không qua được trang Thông tin do BUG-31, nên vào bằng URL): 1. Đăng nhập `error_user` · 2. Console: `localStorage.setItem("cart-contents","[4,0,2]")` · 3. Mở `/checkout-step-two.html`, mở DevTools tab Console, Network · 4. Bấm **Finish**.

**Mong đợi** (AC-5, MSG-07): sang `/checkout-complete.html`, "Thank you for your order!", không còn số giỏ; không có lỗi JavaScript.

**Thực tế**: vẫn ở `/checkout-step-two.html`, không có "Thank you…"; số giỏ **3**, `cart-contents` `[4,0,2]`; 1 lỗi JavaScript không được bắt nguyên văn `wa.cesetRart is not a function` (MSG-10) và 1 request tới `submit.backtrace.io` mỗi lần bấm.

Lần chạy chính thức (TC-033, 6 lỗi): `sang Hoàn tất` → element not found; `URL` → Received `"https://www.saucedemo.com/checkout-step-two.html"`; `không còn khóa cart-contents` → Received `"[4,0,2]"`; `0 pageerror` → Received `"- [/checkout-step-two.html]: wa.cesetRart is not a function"`.

![BUG-33](<evidence/bugs/[id_bug_33]_BUG-33/manual/01-finish-khong-tac-dung.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_33]_BUG-33/TC-033/README.md>) · [tái hiện độc lập, có nội dung lỗi](<evidence/bugs/[id_bug_33]_BUG-33/manual/README.md>) · nội dung lỗi trong `annotations` của TC-033 trong run JSON
**Test tự động**: TC-033, có chốt chặn BUG-26, `test.fail()`.

---

<a id="bug-11"></a>
### BUG-11: [Mở chi tiết] (biến thể SD-103) `problem_user` bấm tên sản phẩm ở Tổng quan mở trang của sản phẩm id + 1
| | |
|---|---|
| **Ticket** | `[id_bug_11]` (**gộp vào ticket BUG-11** của SD-102, không tạo ticket mới) |
| **Severity** | **High** như BUG-11: người dùng xem sai sản phẩm ngay trước khi xác nhận mua |
| **Priority** | **P1** như BUG-11: mọi sản phẩm, nay thêm trang thứ 3 (bài học L10) |
| **Liên quan** | AC-4 · TVP-024 · TC-025 · O-32 · SD-102 [`defects.md`](../saucedemo-products-cart-screen/defects.md) BUG-11 · TD-06 |
| **Tài khoản / dữ liệu** | TD-02 `problem_user`; giỏ 1 sản phẩm `[id]` cho từng id 0 → 5 |

**Các bước** (vào Tổng quan bằng URL do BUG-28): 1. Đăng nhập `problem_user` · 2. Console: `localStorage.setItem("cart-contents","[4]")` · 3. Mở `/checkout-step-two.html`, bấm **tên** Sauce Labs Backpack · 4. Lặp với 5 sản phẩm còn lại (phiên mới mỗi lần).

**Mong đợi** (AC-4, như `standard_user`): mở đúng chi tiết sản phẩm vừa bấm (`?id=` đúng TD-06).

**Thực tế**: luôn mở sản phẩm có id **lớn hơn đúng 1** (cùng quy luật BUG-11 ở danh sách và giỏ):

| Bấm | id đúng | Mở | Hiện |
|---|---|---|---|
| Sauce Labs Bike Light | 0 | `?id=1` | Sauce Labs Bolt T-Shirt |
| Sauce Labs Bolt T-Shirt | 1 | `?id=2` | Sauce Labs Onesie |
| Sauce Labs Onesie | 2 | `?id=3` | Test.allTheThings() T-Shirt (Red) |
| Test.allTheThings() T-Shirt (Red) | 3 | `?id=4` | Sauce Labs Backpack |
| Sauce Labs Backpack | 4 | `?id=5` | Sauce Labs Fleece Jacket |
| Sauce Labs Fleece Jacket | 5 | `?id=6` | `ITEM NOT FOUND` |

Lần chạy chính thức (TC-025, 12 lỗi = URL + tên × 6): vd `Sauce Labs Backpack: URL ?id=4` → Received `"https://www.saucedemo.com/inventory-item.html?id=5"`; `Sauce Labs Fleece Jacket: tên` → Received `"ITEM NOT FOUND"`.

![BUG-11 biến thể](<evidence/bugs/[id_bug_11]_BUG-11/manual/02-bam-fleece-jacket.png>)

**Evidence**: [tự động: 6 sản phẩm](<evidence/bugs/[id_bug_11]_BUG-11/TC-025/README.md>) · [tái hiện độc lập: 6 sản phẩm](<evidence/bugs/[id_bug_11]_BUG-11/manual/README.md>)
**Test tự động**: TC-025, có chốt chặn BUG-26, `test.fail()`, tag `@BUG-11`. Khi sửa BUG-11 phải kiểm cả SD-102 TC-024 và TC-025.

---

<a id="bug-25"></a>
### BUG-25: [Tổng tiền] Item total không làm tròn, không định dạng 2 chữ số lẻ
| | |
|---|---|
| **Ticket** | `[id_bug_25]` |
| **Severity** | **Medium** (Q7): tài khoản chuẩn, giỏ thông thường, trường số tiền AC-4 liệt kê; Tổng quan và biên nhận lệch nhau |
| **Priority** | **P2**: số tiền thực thu (Tax, Total) vẫn đúng, chỉ cách hiển thị Item total sai; nhưng người dùng nào cũng có thể gặp (20/63 tổ hợp), sửa rẻ (định dạng `$x.xx`) |
| **Liên quan** | AC-4 · Q7 · TVP-021 · TC-020 · O-41, O-19, O-30, O-43 · MSG-06, MSG-08 · bài học L12 · BUG-29 (giá trị gấp đôi của `problem_user`) |
| **Tài khoản / dữ liệu** | TD-01 `standard_user` (+ TD-02 → TD-05 ở test tự động); TD-13 giỏ gây lỗi số thực, TD-14 giỏ rỗng, TD-16 quét 120 giỏ; TD-17 bộ A |

**Các bước**: 1. Đăng nhập `standard_user` · 2. Danh sách: Add to cart ở **Sauce Labs Bike Light** rồi **Sauce Labs Fleece Jacket** · 3. Giỏ → Checkout → `An` / `Le` / `70000` → Continue, đọc 3 dòng tiền · 4. Bấm Finish, Generate PDF order. Biến thể: đặt giỏ bằng Console (`localStorage.setItem("cart-contents","[2,5]")`…), giỏ rỗng (giỏ trống → Checkout, BUG-19).

**Mong đợi** (Q7): mọi số tiền dạng `$x.xx`, làm tròn tới cent; giỏ rỗng `Item total: $0.00`.

**Thực tế**: Tax, Total đúng định dạng nhưng Item total in số thực chưa làm tròn; PDF in `59.98` nên **biên nhận khác Tổng quan**:

| Giỏ (thứ tự thêm) | Mong đợi | Thực tế (`Item total`) |
|---|---|---|
| `[0,5]` Bike Light, Fleece Jacket | `Item total: $59.98` | `Item total: $59.980000000000004` (Tax `$4.80`, Total `$64.78` đúng; PDF `59.98`) |
| `[2,5]` | `Item total: $57.98` | `Item total: $57.980000000000004` |
| `[0,1,2,4]` | `Item total: $63.96` | `Item total: $63.959999999999994` |
| `[0,1,2,5]` | `Item total: $83.96` | `Item total: $83.96000000000001` |
| `[4,3,2,1,0]` | `Item total: $79.95` | `Item total: $79.94999999999999` |
| giỏ rỗng | `Item total: $0.00` | `Item total: $0` |
| `visual_user`, `performance_glitch_user`, `error_user` `[0,5]` | `Item total: $59.98` | `Item total: $59.980000000000004` |
| `problem_user` `[4,0,2]` (giá trị gấp đôi là BUG-29) | dạng `$x.xx` | `$95.93999999999998` |

Quét 120 giỏ (TD-16): **26 giỏ** sai định dạng, tức **20/63 tổ hợp**, phụ thuộc tổ hợp và thứ tự thêm. Đối chứng: giỏ `[4,2]` đúng `Item total: $37.98`.

Lần chạy chính thức (TC-020, 11 lỗi, annotation `đã quét 120/120 giỏ`): vd `Biến thể 1 [0,5] qua giao diện: Item total` → Expected `"Item total: $59.98"`, Received `"Item total: $59.980000000000004"`; `Biến thể 6 giỏ rỗng` → Received `"Item total: $0"`.

**Nguyên nhân dự đoán**: Item total cộng giá bằng số thực (floating point) rồi in thẳng, không `toFixed(2)`; Tax, Total có làm tròn.

![BUG-25](<evidence/bugs/[id_bug_25]_BUG-25/manual/01-bike-light-fleece-jacket.png>)

**Evidence**: [tự động: 11 biến thể](<evidence/bugs/[id_bug_25]_BUG-25/TC-020/README.md>) · [tái hiện độc lập: 4 giỏ + PDF + đối chứng](<evidence/bugs/[id_bug_25]_BUG-25/manual/README.md>)
**Test tự động**: TC-020, 11 biến thể bằng `expect.soft` (biến thể 10 quét 120 giỏ), `test.fail()`.

---

## Màn hình 3: Hoàn tất (`/checkout-complete.html`)

<a id="bug-30"></a>
### BUG-30: [Đặt hàng] `problem_user`: Finish báo thành công nhưng giỏ không được làm trống, đặt lại được
| | |
|---|---|
| **Ticket** | `[id_bug_30]` |
| **Severity** | **High**: vi phạm AC-5, AC-6; dễ đặt trùng đơn **có tiền** |
| **Priority** | **P1**: nguy cơ thu tiền 2 lần chỉ bằng nút Back; ảnh hưởng mọi đơn của tài khoản này |
| **Liên quan** | AC-5, AC-6 · TVP-031 · TC-032 · O-31, O-43 · MSG-07 · BUG-24 (đường 3), BUG-35 (3) |
| **Tài khoản / dữ liệu** | TD-02 `problem_user`; TD-09 giỏ `[4,0,2]` |

**Các bước** (vào Tổng quan bằng URL do BUG-28): 1. Đăng nhập `problem_user` · 2. Console: `localStorage.setItem("cart-contents","[4,0,2]")` · 3. Mở `/checkout-step-two.html`, bấm Finish · 4. Xem số giỏ, Console `localStorage.getItem("cart-contents")` · 5. Bấm Back Home · 6. (Phiên mới, lặp bước 1 → 3) bấm **Back** của trình duyệt, rồi Finish lần nữa.

**Mong đợi** (AC-5, AC-6): sau Finish không còn số giỏ, `cart-contents` không còn; Back Home mọi nút là `Add to cart`; Back về Tổng quan không còn sản phẩm, không đặt lại được.

**Thực tế**: "Thank you for your order!" hiện nhưng số giỏ **3**, `cart-contents` **`[4,0,2]`**; Back Home: 3 nút `Add to cart`, **3 nút `Remove`**, số giỏ 3; Back của trình duyệt về `/checkout-step-two.html` **còn 3 dòng** (`Item total: $95.93999999999998`, `Tax: $7.68`, `Total: $103.62`), Finish hiện "Thank you…" **lần 2** (đơn trùng có tiền).

Lần chạy chính thức (TC-032, 7 lỗi): `Biến thể 1: không còn khóa cart-contents` → Received `"[4,0,2]"`; `Biến thể 2: 0 nút Remove` → Received `3`; `Biến thể 3: không đặt được đơn lần 2` → Received `true`.

![BUG-30](<evidence/bugs/[id_bug_30]_BUG-30/manual/01-sau-finish-gio-con.png>)

**Evidence**: [tự động: 3 biến thể](<evidence/bugs/[id_bug_30]_BUG-30/TC-032/README.md>) · [tái hiện độc lập: 3 biến thể](<evidence/bugs/[id_bug_30]_BUG-30/manual/README.md>)
**Test tự động**: TC-032, 3 biến thể bằng `expect.soft`, có chốt chặn BUG-26, `test.fail()`.

---

<a id="bug-27"></a>
### BUG-27: [Trang hoàn tất] Mở thẳng trang Hoàn tất khi chưa đặt hàng vẫn báo đặt hàng thành công
| | |
|---|---|
| **Ticket** | `[id_bug_27]` |
| **Severity** | **Low**: thông báo thành công sai, không tạo đơn, giỏ không đổi |
| **Priority** | **P3**: phải sửa URL tay mới gặp; nên sửa cùng BUG-26 (Q3) |
| **Liên quan** | AC-5 · Q3 (b) · TVP-039 · TC-041 · O-21, O-43 · MSG-07 |
| **Tài khoản / dữ liệu** | TD-01 `standard_user`; TD-08 giỏ `[4,2]`; TD-23 |

**Các bước**: 1. Đăng nhập `standard_user`, thêm Sauce Labs Backpack, Sauce Labs Onesie (không Checkout, không Finish) · 2. Mở thẳng `https://www.saucedemo.com/checkout-complete.html`.

**Mong đợi** (Q3 b): không hiện thông báo thành công (đưa về danh sách hoặc giỏ); giỏ vẫn 2.

**Thực tế**: tiêu đề `Checkout: Complete!`, `Thank you for your order!` và `Your order has been dispatched, and will arrive just as fast as the pony can get there!`, trong khi số giỏ vẫn **2**, `cart-contents` `[4,2]`; không có nút `Generate PDF order`. Cả 5 tài khoản (O-43).

Lần chạy chính thức (TC-041, 2 lỗi): `không hiện "Thank you for your order!"` → Received `true`; `không có đoạn dispatched` → Expected `0`, Received `1`.

![BUG-27](<evidence/bugs/[id_bug_27]_BUG-27/manual/01-mo-thang-hoan-tat.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_27]_BUG-27/TC-041/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_27]_BUG-27/manual/README.md>) · **Test tự động**: TC-041, `test.fail()`.

---

## Không đưa vào bug report
| Mã | Lý do |
|---|---|
| BUG-03 (biến thể) | `performance_glitch_user`: Cancel ở Tổng quan và Back Home mất ~5,1 giây để hiện danh sách (lần chạy chính thức TC-046 annotation: Cancel `5083 ms`, Back Home `5104 ms`; `standard_user` 61 ms, O-37). Q11 đã chốt: biến thể BUG-03, **chỉ ghi nhận**, TC-046 PASS; ngưỡng hiệu năng là IMP-08 trong [`improvements.md`](improvements.md) |
| BUG-21 | `error_user` bấm tên sản phẩm ở Tổng quan mở trang chi tiết bị BUG-21 của SD-102 (mất mô tả, `This component failed to render!`). Cùng trang, cùng chỗ sửa: chính là BUG-21, không phải biến thể, không cấp số (TC-048 chỉ ghi annotation) |
| BUG-01 | Chỉ tham khảo: cùng kiểu lỗi với BUG-22 nhưng ở form đăng nhập (SD-101) |
| Q14 (O-47) | Giờ trong tên file PDF là UTC: HITL #3 chốt **cải tiến IMP-12**, không cấp số bug (BUG-37 vẫn là số trống tiếp theo) |
| BUG-19 (nút Checkout) | Đường "giỏ trống bấm Checkout" đã báo ở SD-102 (TC-030); SD-103 chỉ báo đường URL (biến thể ở trên) |
