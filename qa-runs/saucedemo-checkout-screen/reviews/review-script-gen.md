# Review: bước script-gen, SD-103 Thanh toán (Checkout)

- **Ngày**: 2026-11-25 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa** (0 lỗi 🔴, 4 lỗi 🟠, 12 lỗi 🟡; 2 điểm ❓ cần kiểm thêm)
- **Phạm vi**: commit `900e6dd` trên nhánh `feat/checkout-sd103`: `tests/specs/saucedemo-checkout-screen.spec.ts` (53 test), `tests/pages/CheckoutInfoPage.ts`, `CheckoutOverviewPage.ts`, `CheckoutCompletePage.ts`, `tests/data/checkout.ts`, `tests/utils/pdf.ts`, phần thêm vào `tests/data/bugs.ts`, `messages.ts`, `tests/fixtures/index.ts`, `tests/pages/CartPage.ts` (`git diff 4293c80 -- tests/`). Kèm kiểm lại phần test case chưa được review: áp dụng quyết định HITL #2 và BUG-36 / TC-052 / TVP-058.
- **Nguồn đối chiếu**: `test-cases.csv` (53 TC `approved`), `viewpoint.csv`, `known-issues.md` (mục "Quyết định HITL #2", "Ghi chú cho script-gen", "Lưu ý cho bước viết code"), `test-data.md`, `q-and-a.md`, `spec-review.md`, `requirement/requirement.md`, `CLAUDE.md`, `.claude/agents/script-gen.md`; SD-102 `defects.md` (BUG-21), `tests/specs/saucedemo-products-cart-screen.spec.ts` (tiền lệ).
- **Cách kiểm**:
  - Đọc từng test, so từng bước / expected với CSV; so tự động bằng script: số test, tag `@AC-x`, `@BUG-xx`, `@smoke`, `@security`, `test.fail()` với cột `linked_ac`, `tags`, câu đầu `notes`.
  - `npm run typecheck`: sạch. Grep `waitForTimeout`, `networkidle`, `skip`/`fixme`/`only`, `.nth(`, XPath: không có.
  - Chạy cả spec 1 lần (JSON reporter, đọc **từng lỗi** của 22 test `test.fail()`); chạy lặp các test dương tính có chuyển trang: 3 đợt `--repeat-each` 5 / 6 / 5 (16 test) và 1 đợt 8 lần (TC-044 → TC-047).
  - Script Playwright riêng trên web thật (không lưu trong repo): tái hiện TC-048 bước 5 với `error_user` và `standard_user` (2/2 mỗi tài khoản); liệt kê khóa `localStorage` / `sessionStorage` / IndexedDB / cookie trong luồng thanh toán; đo hành vi `locator.isEnabled()` khi phần tử không có.
  - Quét thông tin cá nhân trong 2 commit `4293c80`, `900e6dd`: không có đường dẫn máy, tên máy, email thật, mật khẩu.

## Checklist (mục 5, code test)
| Mục | Kết quả |
|---|---|
| Mỗi TC automatable có đúng 1 test, tên bắt đầu bằng TC id, tag truy vết khớp tài liệu | ✅ 53/53 test (52 `automatable` + TC-035 `semi-auto`, bước làm tay ghi bằng annotation `manual`), không trùng id. `@AC-x` khớp `linked_ac` 53/53; `@BUG-xx` khớp câu đầu `notes` 22/22; `@smoke` (TC-002, 008, 010, 030, 037) và `@security` (TC-006, 037, 038, 039, 040, 043) khớp cột `tags` |
| Assertion theo expected của TC, không hạ expected | ✅ Không thấy chỗ hạ expected. TC dương tính so đủ trường AC (TC-008, 045, 046: dòng sản phẩm QTY / tên / mô tả / giá, Payment / Shipping / Price Total, 3 dòng tiền, trang Hoàn tất đủ tiêu đề / header / đoạn / ảnh / 2 nút / số giỏ). Thiếu nhỏ ở oracle PDF và đếm file tải (B1, B2) |
| `test.fail()` chỉ ở TC có bug đã biết, fail đúng assertion của bug | ✅ 22/22 TC bug có `test.fail()`, không TC nào khác có. Lần chạy đầy đủ: 22/22 fail **đúng** assertion được đặt tên theo bug, **0** lỗi hết giờ / locator / lỗi code (bảng lỗi từng test ở mục "Kết quả chạy"). TC-046 không `test.fail()`, pass, ghi 5120 / 5097 ms ✅ |
| Chốt chặn BUG-26 chạy trước `test.fail()` (HITL #2 quyết định 3) | ✅ TC-025 (dòng 725-729), TC-026 (746-749), TC-032 (825-828), TC-033 (857-858). TC-020 biến thể 9, 11: annotation `blocked` (649, 668-669). TC-047, TC-048, TC-049: assertion `GUARD` đặt tên riêng, không `test.fail()` |
| Locator theo thứ tự ưu tiên | ✅ `getByLabel(…, { exact: true })` cho 3 ô, `getByRole('button', { name, exact: true })` cho nút, `getByTestId` cho phần còn lại. CSS chỉ ở `.error_icon`, `.form_group`, `.shopping_cart_container`, `.bm-icon` (có lý do ghi trong PO) |
| Chờ phần tử riêng của trang đích sau mỗi lần đổi trang (L2, L3) | ✅ `cart.checkout()` chờ `firstName`; `submit()` chờ `finish`; `finish()` chờ `complete-header`; `cancel()` (Thông tin) chờ `checkout`; `cancel()` (Tổng quan) và `backHome()` chờ `inventory-list`; `openProduct()` chờ nút `Back to products`; `openCart()` được **ghi đè** ở Thông tin và Tổng quan để chờ `checkout` (vì Tổng quan có `cart-list`, L3). Back / Forward / tải lại đều chờ phần tử riêng (TC-011, 012, 023, 029, 032, 036, 052). Chạy lặp 16 test × 16 lần: không lỗi chuyển trang (xem A2) |
| Không chờ cứng. Ngưỡng chờ đặc biệt áp cho mọi bước liên quan | ✅ Không có `waitForTimeout`. `SLOW` 10 giây cho mọi bước về danh sách của `performance_glitch_user` (TC-046 bước 7, 10; TC-049 biến thể 3). ⚠️ `isEnabled()` không đặt timeout, chờ vô hạn khi nút không có (D1) |
| Biến thể bug: `expect.soft` + timeout ngắn, mỗi biến thể từ trạng thái riêng | ✅ `QUICK` 2 giây, `NEG` 5 giây cho expected phủ định (ghi chú 6). Mỗi biến thể tự dựng lại trạng thái (xem đánh giá điểm lệch 1) |
| Ước lượng thời gian chạy | ⚠️ Đủ ở mọi test nhiều biến thể (bảng thời gian ở mục "Đánh giá điểm lệch" 6). Thiếu ở TC-040 (D2) |
| Type check | ✅ `npm run typecheck` sạch |
| Test độc lập; PO không chứa assertion nghiệp vụ; dữ liệu ở `tests/data` | ✅ Mỗi test một context. PO chỉ có locator, thao tác, chờ trang đích. Dữ liệu ở `tests/data/checkout.ts`, `messages.ts` (`MSG_CHECKOUT`), `bugs.ts` (BUG-22 → BUG-36) |
| Evidence chụp sau thao tác gây lỗi, đủ biến thể | ⚠️ Đủ ở hầu hết TC bug. Vài chỗ thiếu / khoanh sai phần tử (B3) |
| Riêng tư | ✅ Không có đường dẫn máy, tài khoản cá nhân trong code và tài liệu của 2 commit |

## Kết quả chạy (lần chạy đầy đủ, máy local, 2026-11-25)
**52 đúng mong đợi + 1 sai** (TC-048). 30 test dương tính pass; 22 test `test.fail()` fail như mong đợi. Đọc từng lỗi:

| TC | Bug | Số lỗi | Lỗi nằm ở đâu | Đúng chỗ bug? |
|---|---|---|---|---|
| TC-003 | BUG-22 | 18 | 9 ô đã nhập × (class `error`, icon) ở 6 tổ hợp; bước 0 (mốc) pass cả 7 tổ hợp | ✅ |
| TC-005 | BUG-34 | 20 | 5 biến thể × (thông báo, URL, ô First Name, không có Finish) | ✅ |
| TC-009 | BUG-23 | 21 | 6 biến thể, mỗi biến thể có "không về trang giỏ" | ✅ |
| TC-013 | BUG-28 | 8 | 2 biến thể: giá trị ô, không sang Tổng quan | ✅ |
| TC-014 | BUG-31 | 3 | Last Name, pageerror (annotation MSG-09), request | ✅ |
| TC-015 | BUG-32 | 5 | biến thể 1: thông báo; biến thể 2: thông báo + sang Tổng quan | ✅ |
| TC-020 | BUG-25 | 11 | Item total ở biến thể 1 → 9, biến thể 10 (26 giỏ sai định dạng, annotation `đã quét 120/120 giỏ`), biến thể 11 | ✅ |
| TC-025 | BUG-11 | 12 | 6 sản phẩm × (URL, tên) | ✅ |
| TC-026 | BUG-29 | 7 | 6 giỏ (giá trị gấp đôi, vd `[4]` nhận 5998 / 480 / 6478) + PDF | ✅ |
| TC-027 | BUG-05 | 1 | "Tổng quan (BUG-05): không còn dòng sản phẩm"; phần Thông tin pass | ✅ |
| TC-028, TC-029 | BUG-24 | 2, 1 | "không được hiện Thank you" | ✅ |
| TC-032 | BUG-30 | 7 | 3 biến thể | ✅ |
| TC-033 | BUG-33 | 6 | không sang Hoàn tất, giỏ, pageerror (MSG-10), request | ✅ |
| TC-038 | BUG-02 | 33 | 8 biến thể × 4 điểm + Finish | ✅ |
| TC-040, 041, 042 | BUG-26, 27, 19 | 8, 2, 2 | đúng các bước của bug | ✅ |
| TC-043 | BUG-07 | 8 | 2 chiều × 4 điểm | ✅ |
| TC-044 | BUG-16 | 12 | 3 trang × (lệch x, lệch y, xoay giỏ, xoay menu); 0 lỗi ở phần tử khác của trang | ✅ |
| TC-051 | BUG-35 | 7 | biến thể 1 → 5 | ✅ |
| TC-052 | BUG-36 | 4 | 2 biến thể × (history.length, Back); phần "dương tính (dự kiến đúng)" pass | ✅ |
| **TC-048** | (dương tính) | 1 | "Bước 8: 0 request tới submit.backtrace.io": **3 request**, mỗi lần mở trang chi tiết ở bước 5 một request (Backpack, Bike Light, Onesie). Mọi điểm khác pass | ❌ xem A1 |

> Ghi chú số liệu: báo lỗi Playwright ghi `+ Received + 5` là **5 dòng diff** (3 phần tử + 2 dòng ngoặc), không phải 5 request. Đúng là **3 request**, khớp 3 trang chi tiết.

## Đánh giá các điểm lệch script-gen tự khai
| # | Điểm lệch | Kết luận | Lý do / bằng chứng |
|---|---|---|---|
| 1 | Biến thể cùng tài khoản dùng chung phiên, ghi đè `cart-contents` thay vì phiên mới (TC-002, 016, 018, 024, 025, 026, 032) | ✅ **Chấp nhận**, kèm C5 | Trạng thái ứng dụng chỉ nằm ở `cart-contents` + cookie `session-username`: script đọc sau một lượt đặt hàng (`problem_user`, đang gõ ở Thông tin): `localStorage` = `cart-contents`, `backtrace-guid`, `backtrace-last-active` (2 khóa sau là telemetry của thư viện báo lỗi, không ảnh hưởng giao diện), `sessionStorage` rỗng, IndexedDB rỗng; thông tin đã gõ không lưu ở đâu (O-11). Mỗi biến thể ghi đè **toàn bộ** giỏ rồi `page.goto` (tải lại cả trang, trạng thái React mất), nên tương đương phiên mới. TC-002 thật ra không lệch: TC chỉ yêu cầu "trang Thông tin mới mở". Giỏ đặt bằng `cart-contents` thay cho "thêm từ danh sách" ở điều kiện trước là cách `test-data.md` đã cho phép |
| 2 | TC-051 biến thể 1 đổi vai tab (trang của test là tab 2, tab mới là tab 1) | ✅ Chấp nhận | Cùng context, đúng thứ tự thao tác của TC (tab 1 tới Tổng quan, tab 2 tới Tổng quan, Finish tab 1 chờ Hoàn tất, Finish tab 2). Lợi: ảnh evidence chụp đúng tab có bug |
| 3 | TC-034 "đếm file tải tới cuối test" | ⚠️ **Phải sửa** (B1) | Code không đếm tới cuối test: dòng 1009 kiểm `downloads` **ngay sau** file đầu tiên, file thứ 2 tới trễ vài trăm ms sẽ không bị bắt |
| 4 | TC-047 bỏ kiểm số giỏ sau Finish (BUG-30 thuộc TC-032) | ✅ Chấp nhận | Không phải lệch: expected bước 6 của TC-047 không có "không còn số giỏ", `notes` ghi rõ "Không kiểm … giỏ sau Finish (TC-032)". Đúng quy tắc "mỗi TC một bug" |
| 5 | Nhóm describe: `A → B` vào màn hình có thao tác, `A + B` / `Cả 3` vào "Chung" | ✅ Chấp nhận, cần ghi thành quy tắc (E2) | `CLAUDE.md` mục 7 chỉ nói "Chung cho test đi qua nhiều màn hình"; SD-102 lại xếp "Danh sách → Chi tiết" vào màn hình **đích** (TC-020, 021). Hai feature theo hai cách khác nhau |
| 6 | Timeout riêng từng test | ✅ Đủ, trừ TC-040 (D2) | Đo lần chạy đầy đủ (thời gian / timeout): TC-003 43 / 90 s; TC-005 46 / 75 s; TC-009 47 / 90 s; TC-013 18 / 60 s; TC-019 52 / 180 s; TC-020 81 / 180 s; TC-025 30 / 60 s; TC-038 68 / 120 s; TC-043 23 / 90 s; TC-046 20 / 120 s; TC-051 13 / 120 s. Mọi test nhiều biến thể dùng ≤ 61 % ngân sách |

## Khuyến nghị TC-048 (`error_user` dương tính, đỏ ở bước 8)
**Bằng chứng tự lấy:**
- Lần chạy đầy đủ + 2 đợt lặp 5 lần: TC-048 đỏ **11/11**, luôn đúng 1 lỗi "Bước 8: 0 request tới submit.backtrace.io", 3 request đều gắn nhãn `Bước 5 (chi tiết …)`.
- Script riêng, mỗi tài khoản 2 lần, mở thẳng Tổng quan giỏ `[4,0,2]` rồi bấm từng tên: `error_user` mỗi trang chi tiết đều có (1) console `Error: This component failed to render!`, (2) **1 request** `submit.backtrace.io`, (3) **không có phần mô tả** (`inventory-item-desc` = 0). Ghi nhãn theo pha cho thấy request phát sinh ở pha **trang chi tiết**, không phải lúc mở lại Tổng quan. `standard_user`: 0 lỗi, có mô tả. TC-049 biến thể 5 (`error_user` mở thẳng 3 trang thanh toán) và TC-048 bước 1 → 4 đều 0 request.
- SD-102 `defects.md` BUG-21: "`error_user` **mỗi lần mở trang chi tiết** (cả 6 sản phẩm): không có phần mô tả; console `This component failed to render!`; 1 request tới `submit.backtrace.io`". Ba dấu hiệu trùng khớp.

**Phân loại theo quy tắc "cùng thành phần / cùng chỗ sửa → giữ số cũ; khác → số mới":** đây **chính là BUG-21**, không phải bug mới, cũng không cần gọi là biến thể. Lỗi nằm ở trang `/inventory-item.html` (thành phần chi tiết sản phẩm), cùng chỗ sửa; Tổng quan chỉ là **một đường vào khác** tới cùng trang lỗi (SD-102 vào từ danh sách). Sửa BUG-21 thì lỗi này tự hết. Cấp số mới sẽ thành bug trùng.

**Không dùng `test.fail()` + `@BUG-21` cho TC-048**, vì:
1. TC-048 là test dương tính hồi quy của các ô ✅ của `error_user` (khoảng 25 điểm kiểm ở trang thanh toán). Đánh dấu "fail như mong đợi" sẽ **che mọi lỗi mới** ở các điểm đó (bài học L4), và khi BUG-21 được sửa thì TC-048 lại đỏ "pass ngoài mong đợi".
2. RTM của SD-103 sẽ gắn BUG-21 (lỗi trang chi tiết, SD-102 AC-5) vào AC-1 → AC-5 của thanh toán: sai truy vết.
3. BUG-21 đã có TC bắt riêng, đủ 6 trang (SD-102 TC-046). Trái quy tắc "mỗi TC một tài khoản, một bug" (lưu ý 4).

**Cách làm đề xuất: TC sửa (oracle theo phạm vi bước), giữ số BUG-21:**
- `test-cases.csv` TC-048 (test-impl sửa, báo người dùng ở HITL #3 vì TC đã duyệt): bước 8 đổi thành "Đếm pageerror và request `submit.backtrace.io` phát sinh ở **trang thanh toán** (bước 1 → 4, 6). Lỗi phát sinh khi đang ở **trang chi tiết** (bước 5) là BUG-21 của SD-102: chỉ ghi annotation, không tính". Expected bước 8 tương ứng. `notes` thêm ở **câu sau** (không phải câu đầu, để RTM không gắn bug): "Trang chi tiết của `error_user` dính BUG-21 (SD-102, TC-046 bắt): không kiểm lỗi ở bước 5". Không dùng `test.fail()`.
- Code (`spec` dòng 1400-1422): đã có nhãn `errors.step`. Tách 2 mảng: lỗi có nhãn `Bước 5 (chi tiết …)` → `note('BUG-21 (SD-102, tham khảo)', …)`; lỗi còn lại → `expect.soft(…).toEqual([])` như hiện tại. Phải chắc lỗi của bước 5 không bị đếm nhầm sang bước 6: đặt `errors.step` của lần mở lại Tổng quan (dòng 1405) thành nhãn trang thanh toán **sau khi** trang chi tiết đã xử lý xong (request gửi khi trang chi tiết vẽ, đã thấy trong 2/2 lần đo, trước khi bấm sang trang khác). Bỏ comment `NOTE` dòng 1419-1420 khi đã sửa.
- `known-issues.md` mục "Bug liên quan đã có" (dòng 53-57): thêm dòng BUG-21 | SD-102 (Chi tiết) | "Bấm tên ở Tổng quan mở trang chi tiết: `error_user` dính BUG-21 (mất mô tả, lỗi render, 1 request báo lỗi), kiểm 2/2 ngày 2026-11-25" | "Không cấp số, không viết TC mới; TC-048 không kiểm lỗi ở bước 5".
- `spec-review.md` O-32 (dòng 82), O-39 (dòng 89): sửa "`error_user` … link tên đúng" thành "mở đúng chi tiết, **nhưng trang chi tiết dính BUG-21**".
- Không cần quay lại người duyệt để quyết "bug hay không": BUG-21 đã được duyệt (Medium, P2). Chỉ báo người dùng ở HITL #3 rằng expected của TC-048 bước 8 được thu hẹp có lý do.

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | **TC-048 đỏ vì BUG-21 (SD-102) ở trang đích, không phải lỗi trang thanh toán.** Bước 5 mở 3 trang chi tiết, mỗi trang gửi 1 báo lỗi, mất mô tả. Test viết đúng expected của TC, nhưng **expected của TC** sai phạm vi: bắt một bug đã có TC riêng ở feature khác | Mục "Khuyến nghị TC-048": 11/11 lần chạy; script 2/2 × `error_user` / `standard_user`; `spec` dòng 1422 | 🟠 | Theo mục "Khuyến nghị TC-048": giữ số BUG-21, sửa TC-048 bước 8 theo phạm vi bước, không `test.fail()` |
| A2 | ❓ TC-045 và TC-047 mỗi test đỏ **1 lần** ở đợt lặp đầu tiên (cùng lượt lặp thứ 2, chạy song song nhiều worker), không tái hiện ở 3 đợt sau. Không đọc được thông báo lỗi (thư mục `test-results` bị lần chạy sau ghi đè) | Tổng: TC-045 1/24, TC-047 1/24 lần đỏ; 3 đợt sau 0/19 mỗi test. Các test dương tính khác 0 lỗi / 16-24 lần | 🟡 | Executor chạy `--repeat-each=10` cho TC-045, TC-047 với `--trace retain-on-failure`, đọc lỗi trước khi phân loại. Nếu là lỗi mạng của web demo thì ghi flaky có bằng chứng; nếu là chuyển trang thì sửa mốc chờ |

## B. Thiếu sót (test chưa kiểm đủ expected của TC)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | TC-034 "đúng 1 file": kiểm ngay sau khi nhận file đầu tiên, không chờ file thứ 2. Nếu nút tải 2 lần (kiểu BUG-36), file thứ 2 tới sau assertion và test vẫn pass | `spec` dòng 995-996, 1004, 1009 | 🟡 | Sau `receipt()`: `const second = await page.waitForEvent('download', { timeout: NEG }).then(() => true, () => false)`; `expect.soft(second, 'không có file thứ 2').toBe(false)` (đúng ghi chú 6: chờ trạng thái sai tối đa 5 giây) |
| B2 | Oracle PDF `inOrder()` chỉ kiểm **dãy con theo thứ tự**: dòng sản phẩm thừa hoặc trùng chen giữa vẫn pass. TC-034 mong "**3** sản phẩm theo thứ tự giỏ"; TC-035, TC-045, TC-046 tương tự. Chỉ TC-051 biến thể 4 và TC-052 có kiểm thêm "không có / không trùng" | `tests/utils/pdf.ts` dòng 42-47; `spec` dòng 1008, 1024, 1637 | 🟡 | Thêm hàm lấy đoạn chữ giữa `PRICE` và `Item total` rồi so **bằng nhau** với danh sách (tên, `$`, giá) mong đợi; giữ `inOrder` cho phần đầu / cuối |
| B3 | Evidence: TC-009 biến thể 4 → 6 khoanh `ov.title` (trang Tổng quan, không phải trang đang thấy); TC-049 biến thể 4, 5 không có ảnh; TC-036 biến thể 2 không có ảnh; TC-026 phần PDF không có ảnh / annotation riêng ngoài nội dung chữ | `spec` dòng 385, 1442-1464, 1039-1045, 757-765 | 🟡 | Khoanh `ip.error` / `cart.checkoutButton` cho biến thể 4 → 6; thêm `evidence.shot()` cho các biến thể còn thiếu |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | Phân tích bỏ sót BUG-21 ở trang đích: TC-048 `notes` ghi "các bước còn lại không được sinh lỗi JavaScript"; `spec-review.md` O-32, O-39 ghi `error_user` "link tên đúng"; `known-issues.md` mục "Bug liên quan đã có" không có BUG-21 | `test-cases.csv` dòng 49; `spec-review.md` dòng 82, 89; `known-issues.md` dòng 53-57 | 🟠 | Sửa 3 file như mục "Khuyến nghị TC-048" |
| C2 | `q-and-a.md` dòng "Tổng hợp" chỉ ghi "HITL #2 bổ sung 1 quy tắc cho Q12", thiếu quyết định HITL #2-1 (BUG-36) đã có ở bảng cuối file | `q-and-a.md` dòng 10 | 🟡 | "… HITL #2 (2026-11-25): bổ sung 1 quy tắc cho Q12, 1 quyết định mới (HITL #2-1: BUG-36)" |
| C3 | Quyết định HITL #2 số 5 ghi "sai số **5 px, một hằng số dùng chung** (như `expectLayoutLike` SD-102)". Code định nghĩa hằng **riêng** trong spec, SD-102 vẫn viết số `5` cứng; hàm `ready()`, `box()` chép lại từ spec SD-102 | `spec` dòng 45, 181-193; `saucedemo-products-cart-screen.spec.ts` dòng 57-70 | 🟡 | Đưa `TOLERANCE_PX`, `ready()`, `box()`, phần so tọa độ / xoay vào `tests/utils/layout.ts`, 2 spec cùng import |
| C4 | `CLAUDE.md` vẫn ghi "feature sau bắt đầu từ **BUG-22**", trong khi SD-103 đã dùng tới BUG-36 | `CLAUDE.md` dòng 33 | 🟡 | "… thanh toán BUG-22 → BUG-36, feature sau bắt đầu từ **BUG-37**" |
| C5 | Điểm lệch 1 (dùng chung phiên, ghi đè `cart-contents`) chỉ ghi trong comment đầu spec. TC-016, 018, 024, 025, 026, 032 vẫn ghi "mỗi giỏ / biến thể bắt đầu từ **phiên mới**", người chạy tay và người đọc evidence không biết bản tự động làm khác | `spec` dòng 13-15; `test-cases.csv` cột `steps` các TC trên | 🟡 | Thêm 1 câu vào phần đầu `test-data.md`: "Bản tự động: biến thể cùng tài khoản dùng chung phiên, ghi đè toàn bộ `cart-contents` rồi tải lại trang = tương đương phiên mới (chỉ `cart-contents` là trạng thái ứng dụng; đã kiểm ở review-script-gen)". Không cần sửa code |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | **`cart.checkoutButton.isEnabled()` chờ vô hạn khi nút không có.** Một cách sửa hợp lệ của BUG-19 là ẩn nút Checkout khi giỏ trống (SD-102 Q5 chỉ yêu cầu chặn). Khi đó TC-028 treo tới hết 60 giây, TC-020 treo tới hết 180 giây; cả 2 có `test.fail()` nên được tính "fail như mong đợi" và **che** TC-028 đường 2, TC-020 biến thể 6 → 11 (gồm cả quét 120 giỏ): đúng kiểu lỗi L4 | `spec` dòng 626 (TC-020), 776 (TC-028). Đo: `locator.isEnabled({ timeout: 3000 })` trên trang không có phần tử: ném lỗi sau 3015 ms (tức là có chờ); không truyền timeout thì chờ tới hết giờ test. `isVisible()` trả `false` ngay (21 ms) | 🟠 | `if (await appears(cart.checkoutButton, QUICK) && await cart.checkoutButton.isEnabled())`, hoặc `isEnabled({ timeout: QUICK.timeout }).catch(() => false)`. Kiểm lại: tạm đổi locator nút thành tên sai, chạy TC-028, phải thấy đường 2 vẫn chạy |
| D2 | TC-040 không đặt `test.setTimeout`. Theo công thức `script-gen.md`: điểm có thể fail = `firstName` 5 s + 5 điểm × 2 s + `appears(header)` 5 s + số giỏ 2 s = 22 s, cộng tải trang ~4 s, × 1,3 ≈ 34 s > 30 s mặc định. Lần chạy local 18,3 s vì vài điểm fail nhanh; CI chậm hơn hoặc bug đổi dạng thì có thể hết giờ | `spec` dòng 515-532 | 🟡 | `test.setTimeout(45_000)` |
| D3 | ❓ Annotation "đã quét n/120 giỏ" ghi trong `finally`. Khi test **hết giờ**, chưa chắc `finally` còn chạy trước khi Playwright chốt kết quả, nên lúc cần nhất (quét bị cắt) có thể không có annotation. Reviewer chưa kiểm được (không tạo file thử trong repo) | `spec` dòng 222-232 | 🟡 | Executor kiểm 1 lần: tạm hạ `test.setTimeout` của TC-020 xuống 40 giây, xem annotation có ra không. Nếu không: thêm ngân sách thời gian trong vòng lặp (còn < 15 giây thì dừng, `expect.soft(n).toBe(120)` báo "quét bị cắt"), không dựa vào `finally` |
| D4 | Trong test `test.fail()`, bước dựng điều kiện trước dùng hàm chờ cứng (`ov.finish()`): TC-026 phần PDF, TC-032 cả 3 biến thể, TC-051 phần dựng 2 tab. Nếu Finish của tài khoản đó hỏng theo kiểu khác, test hết giờ và được tính "fail như mong đợi", executor chỉ thấy `Timeout` | `spec` dòng 760, 829, 881 | 🟡 | Thay bằng `click()` + `await expect(co.header, 'Điều kiện trước: Finish sang Hoàn tất (không phải BUG-xx)').toBeVisible({ timeout: NEG })` để lỗi có tên, executor xếp đúng loại (script-issue / Blocked) thay vì đọc timeout |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Lỗi lọt qua 3 bước (test-design, test-impl, 2 lần review) tới tận lúc chạy: TC dương tính đi **qua trang của feature khác** (trang chi tiết, SD-102) đặt oracle "0 lỗi suốt test" mà không đối chiếu bug đã biết của trang đó | A1, C1 | 🟠 | Thêm bài học **L16** vào `qa-reviewer.md` mục 8 và checklist test-impl: "TC đi qua trang của feature khác: liệt kê bug đã biết của trang đó (`known-issues.md` / `defects.md` feature gốc) theo **từng tài khoản**; oracle lỗi console / mạng chỉ tính trên trang của feature đang test" |
| E2 | Quy tắc xếp describe cho TC `A → B` chưa được ghi, SD-102 và SD-103 làm khác nhau | Điểm lệch 5 | 🟡 | Ghi vào `CLAUDE.md` mục 7 một quy tắc (đề xuất: `A → B` vào màn hình A, nơi có thao tác; `A + B`, `Cả n` vào "Chung"), cập nhật SD-102 khi tiện |
| E3 | Cây làm việc đang có thay đổi chưa commit **không thuộc** bước này (`.claude/agents/executor.md`, `scripts/build-rtm.mjs`) | `git status` lúc review | 🟡 | Bên sửa tách riêng khi commit, không gộp vào commit sửa review |

## Kiểm lại thay đổi test case chưa được review (HITL #2, BUG-36 / TC-052 / TVP-058)
| Điểm | Kết quả |
|---|---|
| BUG-36 nhất quán giữa các file | ✅ `known-issues.md` (dòng mô tả, mục quy tắc số mới, quyết định HITL #2 số 1), `q-and-a.md` (bảng HITL #2-1), `spec-review.md` (O-45, BR-14), `improvements.md` (IMP-11 chuyển thành BUG-36, IMP-01 → IMP-10 còn lại), `viewpoint.csv` TVP-058 (`low`, `in`, `Cả 3`), TVP-055 trỏ sang TVP-058, `test-cases.csv` TC-052 (`low`, câu đầu `notes` "Bug đã biết BUG-36", `Cả 3`), `knowledge-base/q-and-a-archive.md` dòng 38, `bugs.ts`, code (`test.fail()` + `@BUG-36`, phần dương tính đặt tên riêng). Chỉ thiếu ở dòng "Tổng hợp" của `q-and-a.md` (C2) |
| Quyết định HITL #2 số 1 → 9 áp vào CSV và code | ✅ 1: TC-052. 2: TC-051 biến thể 5 so với giá trị ngay trước Finish, không số cứng (code dòng 940-952). 3: chốt chặn (xem checklist). 4: TC-019 / TC-020 biến thể 10: 120 giỏ (tự đếm `sweepCarts`: 63 + 57 = 120), 1 context, 180 s, annotation, không `@slow`, không smoke. 5: 5 px, `document.fonts.ready` + ảnh, không dùng `visual_failure` (hằng số chưa dùng chung, C3). 6: không có TC PDF tiếng Việt. 7: chấp nhận, không ảnh hưởng code. 8: TC-020 biến thể 6 đường BUG-19, dự phòng Back, annotation "không áp dụng" (dòng 622-640). 9: locator theo "Ghi chú cho script-gen" |
| Số liệu trong `test-data.md` | ✅ Tự đếm: TD-01 dùng ở 40 TC, TD-17 ở 37 TC, khớp chữ trong bảng; 53 TC `approved`; mọi viewpoint `in` có ≥ 1 TC, không TC nào trỏ viewpoint `out` |
| Biến thể BUG-35 (4), (5), (6) | ✅ CSV TC-051, `known-issues.md`, `q-and-a.md` Q12 bổ sung, BR-10 khớp nhau và khớp code; chạy: 7 lỗi đúng 5 biến thể |

## Việc cần làm trước khi sang executor (xếp theo mức độ)
1. 🟠 A1, C1: TC-048 sửa theo mục "Khuyến nghị TC-048" (giữ BUG-21, oracle theo phạm vi bước, không `test.fail()`); cập nhật `test-cases.csv`, `known-issues.md`, `spec-review.md`. Chạy lại TC-048: pass, annotation ghi 3 báo lỗi của BUG-21.
2. 🟠 D1: bỏ `isEnabled()` chờ vô hạn ở TC-020, TC-028; kiểm bằng cách cố tình làm mất nút.
3. 🟠 E1: thêm bài học L16.
4. 🟡 B1, B2, D2, D4 nên sửa cùng đợt (ít dòng, tăng khả năng test bắt được lỗi). D3, A2 giao executor kiểm.
5. 🟡 B3, C2 → C5, E2, E3 gom một lần sửa, không chặn executor.

## Xử lý sau review
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| A1 | 🟠 | TC-048 oracle theo phạm vi bước, giữ BUG-21 | ✅ | `watchErrors` gắn bước + đường dẫn trang lúc sự kiện phát sinh; lỗi ở `/inventory-item.html` vào annotation `BUG-21 (SD-102, tham khảo)`, chỉ assert lỗi ở trang thanh toán; bỏ NOTE. Chạy: TC-048 pass, annotation 3 báo lỗi đều ở bước 5 |
| A2 | 🟡 | Chạy lặp TC-045, TC-047 có trace | ✅ Executor | Không tái hiện (0 / 36 lần mỗi test), đóng ở trạng thái theo dõi: xem `review-executor.md` "Trao đổi A2" |
| B1 | 🟡 | TC-034 chờ file thứ 2 tối đa 5 giây | ✅ | TC-034 chờ `download` thứ 2 tối đa NEG (5 s), `expect.soft` "không có file thứ 2" |
| B2 | 🟡 | So đúng danh sách dòng sản phẩm trong PDF | ✅ | `productLines()` (`pdf.ts`) + `receiptLines()` (`checkout.ts`), so bằng nhau ở TC-034, 035 và luồng chung TC-045, 046 |
| B3 | 🟡 | Evidence thiếu / khoanh sai | ✅ | TC-009 biến thể 4–6 khoanh `ip.error` / `cart.checkoutButton`; thêm ảnh TC-036 biến thể 2, TC-049 biến thể 4, 5, TC-026 phần PDF |
| C1 | 🟠 | CSV TC-048, `spec-review.md` O-32 / O-39, `known-issues.md` BUG-21 | ✅ | CSV TC-048 bước 8 + expected + câu sau của `notes` (không phải câu đầu); `spec-review.md` O-32, O-39; `known-issues.md` thêm dòng BUG-21. Báo người dùng ở HITL #3 |
| C2 | 🟡 | `q-and-a.md` dòng Tổng hợp | ✅ | Thêm "1 quyết định mới (HITL #2-1: BUG-36)" |
| C3 | 🟡 | Hằng số sai số + hàm đo bố cục dùng chung | ✅ | `tests/utils/layout.ts` (`TOLERANCE_PX`, `ready`, `box`, `expectNear`, `expectSamePlace`, `transformOf`, `expectHeaderLike`); 2 spec cùng import, SD-102 không còn số 5 cứng. SD-102 chạy lại 46/46 đúng dự kiến, TC-035/036 fail cùng giá trị như trước |
| C4 | 🟡 | `CLAUDE.md` số BUG tiếp theo | ✅ | `CLAUDE.md`: thanh toán BUG-22 → BUG-36, feature sau từ BUG-37 |
| C5 | 🟡 | Ghi điểm lệch 1 vào `test-data.md` | ✅ | `test-data.md` thêm câu "Bản tự động" ở phần đầu |
| D1 | 🟠 | `isEnabled()` có giới hạn chờ | ✅ | `enabledNow()` = `isEnabled({ timeout: 2 s })`, lỗi → false; dùng ở TC-020, TC-028. Kiểm: đổi tạm tên nút sai, TC-028 xong trong 7 s, đường 2 vẫn chạy; đã trả lại `CartPage.ts` |
| D2 | 🟡 | TC-040 `test.setTimeout` | ✅ | `test.setTimeout(45_000)` TC-040 |
| D3 | 🟡 | Kiểm annotation quét khi hết giờ | ✅ Executor | Hạ tạm timeout TC-020 xuống 40 s: annotation "đã quét 31/120 giỏ" vẫn ghi; reviewer kiểm độc lập cũng đúng (`review-executor.md` D3) |
| D4 | 🟡 | Đặt tên assertion điều kiện trước trong test `test.fail()` | ✅ | `finishAsPrecondition()`: `click()` + `expect(co.header, "Điều kiện trước: …")`, dùng ở TC-026 phần PDF, TC-032, TC-051 |
| E1 | 🟠 | Bài học L16 | ✅ | L16 vào `qa-reviewer.md` mục 8 và quy tắc `notes` của `test-impl.md` |
| E2 | 🟡 | Quy tắc describe cho `A → B` | ✅ | `CLAUDE.md` mục 7: `A → B` vào màn hình A, `A + B` / `Cả n` vào "Chung"; SD-102 giữ nguyên |
| E3 | 🟡 | Tách thay đổi không liên quan khi commit | ✅ | `executor.md`, `build-rtm.mjs` tách commit riêng |

## Kiểm lại lượt 2 (2026-11-25)
- **Phạm vi**: thay đổi chưa commit (`git diff` + file mới `tests/utils/layout.ts`), đối chiếu 17 mục của bảng "Xử lý sau review" (A1 → E3).
- **Cách kiểm**:
  - Đọc từng hunk của diff. `npm run typecheck`: sạch.
  - Chạy chọn lọc, không chạy lại cả spec: checkout TC-028, TC-034, TC-035, TC-036, TC-044, TC-048 và SD-102 TC-028, TC-034, TC-035, TC-036, TC-044. Kết quả: 11/11 đúng mong đợi, 0 ngoài mong đợi.
  - `build-rtm.mjs` chạy trên **bản sao** `qa-runs/` đặt ngoài repo (bản cũ ở `HEAD`, bản mới ở cây làm việc), không đụng file trong repo.
- **Lưu ý**: bảng "Xử lý sau review" ở trên **vẫn trống** (cột Trạng thái, Ghi chú chưa điền), nên không có câu "✅" nào để đối chiếu. Mình kiểm thẳng trên diff. Bên sửa phải điền bảng (N3).

### Kết luận từng mục
| # | Kết luận | Bằng chứng |
|---|---|---|
| A1 | ✅ OK | `watchErrors` ghi đường dẫn trang **lúc sự kiện xảy ra** (`[<pathname>]`), nên lỗi của trang chi tiết không bị tính sang bước sau. `onDetailPage` lọc lỗi ở `[/inventory-item.html]` thành annotation "BUG-21 (SD-102, tham khảo)"; assertion chỉ tính trang thanh toán. Không `test.fail()`. Chạy: TC-048 **pass**, annotation ghi đúng 3 báo lỗi (Backpack, Bike Light, Onesie). Hướng an toàn: báo lỗi tới trễ sau khi đã về Tổng quan sẽ bị **tính** (đỏ), không bị che |
| A2 | ⏳ Giao executor | Không có thay đổi, đúng như đề xuất. Executor chạy lặp TC-045, TC-047 có trace |
| B1 | ✅ OK | TC-034 chờ file thứ 2 tối đa `NEG` (5 giây), `expect.soft(second).toBe(false)`. Chạy: pass, 10,6 giây (thêm 5 giây chờ, chấp nhận được) |
| B2 | ✅ OK | `productLines()` lấy đoạn giữa `PRICE` và `Item total`; so **bằng nhau** với `receiptLines()` (tên, `$`, giá) ở TC-034, TC-035, TC-045/046. Đối chiếu annotation PDF của TC-034: đoạn đó đúng là `Fleece Jacket, $, 49.99, Bike Light, $, 9.99, Onesie, $, 7.99`, test pass |
| B3 | ✅ OK | TC-009 khoanh `ip.error` / `cart.checkoutButton` theo biến thể; thêm ảnh TC-026 (PDF), TC-036 biến thể 2, TC-049 biến thể 4, 5 |
| C1 | ✅ OK | TC-048: bước 8 và expected ghi "ở trang thanh toán"; `notes` nhắc BUG-21 ở **câu sau** (câu đầu vẫn là "Test dương tính…", RTM lấy bug từ câu đầu, `build-rtm.mjs` dòng 49: không gắn BUG-21). `known-issues.md` thêm dòng BUG-21 vào "Bug liên quan đã có", đúng kết luận "chính là BUG-21, không phải biến thể". `spec-review.md` O-32, O-39 đã sửa |
| C2 | ✅ OK | `q-and-a.md` dòng 10 thêm "1 quyết định mới (HITL #2-1: BUG-36)" |
| C3 | ✅ OK, kèm N2 | `tests/utils/layout.ts`: `TOLERANCE_PX`, `ready`, `box`, `expectNear`, `expectSamePlace`, `expectHeaderLike`; 2 spec cùng import, không còn số `5` cứng. SD-102 TC-035 (13 lỗi), TC-036 (1 lỗi) fail **đúng các điểm như trước**, nhãn lỗi giữ nguyên chữ; TC-044 checkout 12 lỗi như lượt 1 |
| C4 | ✅ OK | `CLAUDE.md`: "thanh toán BUG-22 → BUG-36, feature sau bắt đầu từ **BUG-37**" |
| C5 | ✅ OK | `test-data.md` thêm câu "Bản tự động…" kèm danh sách TC và lý do (chỉ `cart-contents` + cookie là trạng thái ứng dụng) |
| D1 | ✅ OK | `enabledNow()` = `isEnabled({ timeout: 2000 }).catch(() => false)` ở cả 2 chỗ (TC-020, TC-028). Đúng với phép đo lượt 1 (`isEnabled` có timeout thì ném lỗi đúng hạn). Chạy: TC-028 fail đúng 2 điểm của BUG-24 trong 6,4 giây. Mình không tự đổi tên nút để thử lại (không sửa code); cách thử bên sửa đã báo đúng với đề xuất |
| D2 | ✅ OK | TC-040 `test.setTimeout(45_000)`, có ghi cách tính |
| D3 | ⏳ Giao executor | Không có thay đổi, đúng như đề xuất (executor kiểm annotation quét khi hết giờ) |
| D4 | ✅ OK | `finishAsPrecondition()`: bấm Finish + `expect(header, 'Điều kiện trước: …')` chờ 5 giây, dùng ở TC-026 (PDF), TC-032 (mọi biến thể), TC-051 (tab 1). Còn 1 dòng `expect(ov.finishButton).toBeVisible()` không tên ở trước đó (TC-026, TC-032), lỗi vẫn đọc được nhờ locator `finish`, không cần sửa |
| E1 | ✅ OK | L16 thêm vào `qa-reviewer.md` mục 8 và `test-impl.md` (quy tắc tra bug đã biết của trang feature khác theo từng tài khoản, bug trang kia ghi ở câu sau của `notes`). Câu chữ khớp nhau và khớp cách đã sửa TC-048 |
| E2 | ✅ OK | `CLAUDE.md` mục 7: "một màn hình hoặc `A → B` vào **màn hình A**; `A + B`, `Cả n` vào Chung (từ SD-103; SD-102 giữ nguyên)". Spec SD-103 khớp quy tắc: TC-029 (`Hoàn tất → Tổng quan`) ở Màn hình 3, TC-040 ở Màn hình 1, các TC `Tổng quan → Hoàn tất` ở Màn hình 2 |
| E3 | ✅ OK (theo kế hoạch) | `build-rtm.mjs` và `executor.md` sẽ đi commit riêng (xem mục dưới) |

### Phát hiện mới
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| N1 | `build-rtm.mjs`: TC có cả 2 kết quả mà đều Passed hiện biểu tượng **⚠️** thay vì ✅ | Bản sao ngoài repo, thêm `manual-*.json` giả 3 TC → cột Kết quả: `⚠️ Passed (tự động: Passed · tay: Passed)`, `⚠️ Blocked (…)`, `❌ Failed (tự động: Failed · tay: Passed)`. Nguyên nhân: `icon(shown(…))` nhận chuỗi đã thêm phần "(tự động: …)", mà `icon()` so `r === 'Passed'`. Bản HTML không bị (dùng `cls(r.result)`) | 🟡 | `${icon(r.result)}${manualOf[id] ? ` (tự động: … · tay: …)` : ''}`, tức là tính biểu tượng từ kết quả gốc rồi mới nối phần chú thích. Đi cùng commit RTM |
| N2 | `saucedemo-products-cart-screen.spec.ts` import `ready as imagesLoaded`: tên cũ nhưng hàm mới làm thêm (cuộn lên đầu trang, chờ font). Hiện chưa đổi kết quả (TC-035/036 SD-102 như trước), nhưng người đọc dễ hiểu sai | `saucedemo-products-cart-screen.spec.ts` dòng 21, 469-490 | 🟡 | Dùng thẳng tên `ready`. Ngoài ra `layout.ts` lặp lại chuỗi CSS `.shopping_cart_container`, `.bm-icon` và `transformOf` đã có trong `AppPage`; chấp nhận được (hàm dùng chung không phụ thuộc PO), có thể gom sau |
| N3 | Bảng "Xử lý sau review" chưa được điền (trái `CLAUDE.md` mục "Xử lý phát hiện của qa-reviewer") | Bảng ở trên: cột Trạng thái, Ghi chú trống | 🟡 | Bên sửa điền từng dòng (✅ / ⏳ giao executor cho A2, D3); chỉ ghi ✅ khi mọi chỗ liên quan đã sửa (L8) |

### Thay đổi ngoài bước này (commit riêng): `scripts/build-rtm.mjs`, `.claude/agents/executor.md`
| Điểm | Kết luận | Bằng chứng |
|---|---|---|
| Feature không có file làm tay: kết quả **giống hệt từng byte** | ✅ Đúng | Chạy bản `HEAD` và bản mới trên cùng bản sao `saucedemo-login-screen`, `saucedemo-products-cart-screen`: `cmp` 4/4 file (`rtm.md`, `rtm-report.html`) giống nhau |
| Đọc `manual-*.json` mới nhất, TC có 2 kết quả lấy kết quả xấu hơn | ✅ Đúng | Thử 3 TC: tự động Passed + tay Blocked → Blocked; tự động Failed + tay Passed → Failed; dòng nguồn ghi thêm "+ chạy tay [manual-….json]"; tóm tắt "⏭ Skipped / Blocked 1", "đã chạy tay 3". `Blocked` tính vào nhóm cần xem lại của AC (không thành "Đạt") |
| Biểu tượng trong `rtm.md` | ⚠️ Lỗi N1 | Xem N1 |
| Chi tiết nhỏ | 🟡 | Regex `/^manual-.*.json$/` thiếu `\` trước dấu `.` (vô hại, nên sửa cho nhất quán với `run-`). Thứ hạng: "Passed (bug có vẻ đã sửa…)" xếp ngang Blocked (hạng 2), hợp lý nhưng `executor.md` chưa nói; có thể thêm 1 câu |
| `executor.md` | ✅ Đúng | Mô tả khớp code: đọc cả 2 file, kết quả xấu hơn thắng (Failed > Blocked / Skipped / Flaky > Passed), ghi "(tự động: … · tay: …)", `status` tay là `passed` / `failed` / `blocked` |

### Kết luận lượt 2
**✅ Đạt** cho bước script-gen: cả 4 lỗi 🟠 (A1, C1, D1, E1) và 11/13 lỗi 🟡 đã xử lý đúng (E3 theo kế hoạch commit riêng), kiểm bằng chạy thật. A2, D3 giao executor như đề xuất.

> Đính chính lượt 1: dòng kết luận đầu file ghi "12 lỗi 🟡", đếm lại đúng là **13** (A2, B1, B2, B3, C2, C3, C4, C5, D2, D3, D4, E2, E3), khớp 17 dòng của bảng "Xử lý sau review". Có thể sang executor, với 2 điều kiện nhỏ:
1. Bên sửa điền bảng "Xử lý sau review" (N3) trước khi commit.
2. Sửa N1 trong commit RTM riêng. N2 sửa khi tiện.

## Xử lý sau lượt 2
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| N1 | 🟡 | RTM: TC có cả 2 kết quả Passed hiện ⚠️ | ✅ | Biểu tượng lấy từ `r.result`, ghi chú "(tự động: … · tay: …)" nối sau. Thử bằng file làm tay giả: `✅ Passed (tự động: Passed · tay: Passed)`, `❌ Failed (tự động: Passed · tay: Failed)`; RTM 2 feature cũ tạo lại không đổi byte nào |
| N2 | 🟡 | SD-102 import `ready as imagesLoaded` gây hiểu nhầm | ✅ | Dùng thẳng tên `ready`. Chạy lại SD-102 TC-035, TC-036: đúng dự kiến |
| N3 | 🟡 | Bảng "Xử lý sau review" để trống | ✅ | Điền lại 2026-11-26. **Nguyên nhân thật** (đính chính): script điền bảng của bên sửa viết regex trong template literal, dấu gạch chéo ngược trước `|` bị mất (phép "hoặc" rỗng), nên chữ bị chèn vào **dòng tiêu đề** thay vì vào bảng; không phải reviewer ghi đè. Sửa: script mới điền theo từng ô trong đúng mục, dừng nếu không tìm thấy dòng; luôn đọc lại file sau khi sửa |
| – | 🟡 | Regex `manual-` thiếu `\` trước dấu chấm; `executor.md` chưa nói "Passed (bug có vẻ đã sửa)" xếp ngang Blocked | ✅ | Sửa `/^manual-.*\.json$/`; `executor.md` ghi thứ tự đầy đủ |
