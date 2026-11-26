# Triage Report: run-20261126-143604

- **Phạm vi**: toàn bộ `tests/specs/saucedemo-checkout-screen.spec.ts` (53 test, 3 màn hình) · 126 giây
- **Môi trường**: Playwright 1.65.1 · Chromium (Desktop Chrome, 1280×720) · Node 26 · Windows 11 · https://www.saucedemo.com · 9 workers (trên CI là 1)
- **Kết quả chi tiết**: [`run-results/run-20261126-143604.json`](run-results/run-20261126-143604.json) (`errors`, `error_details`, `annotations` từng test).
- **Lịch sử, không dùng cho RTM**: `run-20261126-135457` (trước khi sửa theo review-executor B1, B2: khác TC-034 và cách ghi README evidence, cùng 53/53 đúng dự kiến), `run-20261126-143402` (chỉ TC-034, TC-048, bên sửa kiểm B1, B2).
- **Kiểm tra độ ổn định**: [`run-results/stability-20261126-1401.json`](run-results/stability-20261126-1401.json): cả bộ × 2 lần, **106/106** đúng như mong đợi, không test chập chờn (chạy trên code trước B1; sau đó TC-034 chạy thêm 2 lần, đều pass).
- **Kiểm tra lỗi bị che**: `test:run` không cảnh báo lỗi code test (dò toàn bộ nội dung lỗi: timeout, `ReferenceError`, `strict mode violation`, "Điều kiện trước"). Đọc lỗi của 22 test bug đã biết: mọi lỗi đều là assertion của bug.
- **Chạy tay**: [`run-results/manual-20261126-1416.json`](run-results/manual-20261126-1416.json) (TC-035 bước 3), xem mục "Chạy tay".
- **Evidence**: một lần chạy riêng (`npm run test:evidence`) ngay sau, cùng code: [`evidence/README.md`](evidence/README.md). Video chỉ cho 22 test có bug.

## Summary
| Status | Count | Ghi chú |
|--------|-------|---------|
| **Passed** | 31 | Gồm TC-048 (`error_user` dương tính): 3 báo lỗi ở trang chi tiết là BUG-21 của SD-102, chỉ ghi annotation (review-script-gen A1). TC-046 ghi thời gian BUG-03 biến thể: Cancel 5083 ms, Back Home 5104 ms |
| **Failed** | 22 | 22 test của 21 bug đã biết (BUG-24 có 2 TC), fail **đúng assertion** của bug. Playwright báo "passed" vì có `test.fail()`, nhưng kết quả test case là **Failed** |
| flaky | 0 | |
| script-issue | 0 | |
| real-bug | **22 TC / 21 bug**: 15 bug mới (BUG-22 → BUG-36) + 6 biến thể bug cũ (BUG-02, 05, 07, 11, 16, 19); BUG-24 có 2 TC. BUG-03 (biến thể) chỉ ghi nhận, không có TC fail. **1 phát hiện mới** chờ PO (N1 → Q14) | → HITL #3 |
| Chạy tay | 1 (TC-035): Passed | |

## Real Bugs (→ HITL #3: ✅ đã duyệt 2026-11-26)
Người duyệt: duyệt cả 21 bug theo mức đề xuất, **BUG-29: High**; Q14 (N1) = cải tiến IMP-12; biết và đồng ý TC-048, TC-034 được sửa; CI chọn B. Chi tiết: `known-issues.md` "Quyết định HITL #3".

"Lỗi bắt được" = số điểm kiểm sai trong `errors`. Màn hình, mô tả và severity theo `known-issues.md`.

### Chung: lỗi ở nhiều màn hình
| Bug | TC | Màn hình | Lỗi bắt được | Actual (tóm tắt) | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-24 | TC-028, TC-029 | Tổng quan → Hoàn tất | 3 | **Đặt được đơn không có sản phẩm**: Tổng quan rỗng (`Item total: $0`, `Tax: $0.00`, `Total: $0.00`) vẫn bấm được `Finish` và hiện "Thank you for your order!". | Low |
| BUG-35 | TC-051 | Tổng quan → Hoàn tất | 7 | **Finish tạo đơn từ Tổng quan đã cũ**, không kiểm giỏ hiện tại: (1) **2 tab**: tab 1 đặt xong (giỏ bị xóa), tab 2 vẫn hiện 2 sản phẩm `$41.02`, Finish → đặt **lần 2 đủ sản phẩm**; (2) **sau Reset App State** ở Tổng quan (giỏ đã xóa) Finish vẫn đặt hàng với sản phẩm đang hiện (PDF liệt kê); (3) **Back sau khi đặt**: với `standard_user` Tổng quan rỗng nên rơi vào BUG-24, với `problem_user` giỏ không được làm trống (BUG-30) nên thành đơn trùng có tiền; (4) **giỏ thêm sản phẩm ở tab khác** sau khi mở Tổng quan (`[4]` → `[4,2]`): Finish đặt theo trang cũ (PDF chỉ Backpack, `Total 32.39`) rồi **xóa cả giỏ**, Onesie mất; (5) **giỏ bỏ sản phẩm ở tab khác** (`[4,2]` → `[4]`): Finish **đặt cả Onesie đã bỏ** (PDF `Total 41.02`); (6) **đăng xuất ở tab khác** rồi Finish ở Tổng quan cũ: bị chặn đúng về `/` (AC-7) nhưng `cart-contents` bị **xóa**, giỏ mất mà không có đơn (đối chứng: bấm Cancel trong cùng tình huống thì giỏ còn, nên giỏ mất do Finish: cùng chỗ sửa). | Medium |
| BUG-36 | TC-052 | Thông tin → Tổng quan; Tổng quan → Hoàn tất | 4 | **Bấm đúp `Continue` / `Finish` chạy trình xử lý 2 lần**: `history.length` tăng 2 (bấm 1 lần tăng 1, 2 lần `pushState` cùng URL), nên **Back lần 1 vẫn ở cùng trang**, phải bấm Back 2 lần mới về trang trước (sau Finish: lần 2 về Tổng quan rỗng). | **Low** |
| BUG-26 | TC-040 | Thông tin → Tổng quan | 8 | Đã đăng nhập, giỏ có hàng, **mở thẳng** `/checkout-step-two.html` là **bỏ qua bước nhập thông tin**: Tổng quan hiện đủ, Finish đặt hàng được mà không có tên, zip (PDF không có `SHIP TO`). | Medium |
| BUG-02 (biến thể) | TC-038 | Cả 3 | 33 | Bug của SD-101: tự tạo cookie `session-username` với tên tài khoản hợp lệ (đã thử cả 5 tên) là **vào được cả 3 trang thanh toán và đặt hàng được** (SD-101 TC-033 chỉ kiểm `/inventory.html`, SD-102 TC-045 kiểm giỏ và chi tiết). | High |
| BUG-05 (biến thể) | TC-027 | Thông tin + Tổng quan | 1 | Bug của SD-102: `Reset App State` ở **Tổng quan** xóa giỏ nhưng trang **vẫn liệt kê sản phẩm và số tiền** (5/5 tài khoản). | Medium |
| BUG-07 (biến thể) | TC-043 | Cả 3 | 8 | Bug của SD-102: giỏ không gắn tài khoản, nên tài khoản đăng nhập sau **đặt hàng bằng giỏ của tài khoản trước** và làm **trống** giỏ đó, **cả 2 chiều**: `standard_user` → `visual_user` (O-26) và `visual_user` → `standard_user` (review A3). | High |
| BUG-16 (biến thể) | TC-044 | Cả 3 | 12 | Bug của SD-102: `visual_user` biểu tượng giỏ lệch (x 1220, y 10 → x 1034, y 39) và xoay ~3°, nút menu xoay ~3°, ở **cả 3 trang thanh toán**. | Low |
| BUG-03 (biến thể) | – | Tổng quan + Hoàn tất | – | `performance_glitch_user`: `Back Home` và `Cancel` ở Tổng quan mất **~5,1 giây** để hiện danh sách (`standard_user` 61 ms). | Vấn đề hiệu năng, chưa có AC |

### Màn hình 1: Thông tin (`/checkout-step-one.html`)
| Bug | TC | Màn hình | Lỗi bắt được | Actual (tóm tắt) | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-22 | TC-003 | Thông tin | 18 | Thiếu **một** ô bắt buộc mà **cả 3 ô** đều viền đỏ và có icon lỗi, kể cả ô đã nhập đúng (6/6 tổ hợp có ít nhất 1 ô đã nhập; tổ hợp trống cả 3 thì cả 3 ô đỏ là đúng; 5/5 tài khoản). | Low |
| BUG-23 | TC-009 | Thông tin | 21 | Nhấn **Enter** trong bất kỳ ô nào **về trang giỏ** (như bấm Cancel), không kiểm tra và không sang Tổng quan; mất thông tin đã nhập. | Medium |
| BUG-34 | TC-005 | Thông tin → Tổng quan | 20 | Ô **chỉ có khoảng trắng** (hoặc ký tự tab) được coi là đã nhập: cả 3 ô `" "` vẫn sang Tổng quan và đặt hàng được, PDF có `SHIP TO` trống. | Medium |
| BUG-19 (biến thể) | TC-042 | Thông tin | 2 | Bug của SD-102: **giỏ trống** vẫn vào được bước thanh toán, nay bằng cách **mở thẳng** `/checkout-step-one.html` (SD-102 TC-030 chỉ kiểm nút Checkout). | Low |
| BUG-28 | TC-013 | Thông tin | 8 | `problem_user`: gõ vào **Last Name** thì ký tự **đi vào First Name** (mỗi phím thay toàn bộ First Name), Last Name luôn trống → luôn báo `Error: Last Name is required`, **không thể đặt hàng** | High |
| BUG-31 | TC-014 | Thông tin | 3 | `error_user`: ô **Last Name không nhận ký tự**; mỗi phím sinh lỗi JavaScript `Cannot read properties of undefined (reading 'value')` và 1 request tới `submit.backtrace.io` | High |
| BUG-32 | TC-015 | Thông tin → Tổng quan | 5 | `error_user`: **bỏ qua kiểm tra Last Name**: `Ann` / trống / trống báo `Error: Postal Code is required`; `Ann` / trống / `70000` **sang Tổng quan** | Medium |

### Màn hình 2: Tổng quan (`/checkout-step-two.html`)
| Bug | TC | Màn hình | Lỗi bắt được | Actual (tóm tắt) | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-25 | TC-020 | Tổng quan | 11 | `Item total` **không làm tròn / không định dạng 2 chữ số lẻ**, ngay cả với **`standard_user` ở giỏ thông thường**: thêm Bike Light rồi Fleece Jacket → `Item total: $59.980000000000004` (Tax `$4.80`, Total `$64.78` vẫn đúng); `[2,5]` `$57.980000000000004`; `[0,1,2,4]` `$63.959999999999994`; `[4,3,2,1,0]` `$79.94999999999999`; giỏ rỗng `$0`. | **Medium** |
| BUG-29 | TC-026 | Tổng quan | 7 | `problem_user`: **Item total gấp đôi** tổng giá thật (vd Backpack $59.98 thay vì $29.99; cả 6 sản phẩm $259.88 thay vì $129.94; 63/63 tổ hợp), Tax và Total tính theo số sai; giá từng dòng vẫn đúng; PDF in số sai | High (HITL #3; Critical nếu là hệ thống thật) |
| BUG-33 | TC-033 | Tổng quan | 6 | `error_user`: bấm **Finish không có tác dụng**: ở lại Tổng quan, lỗi JavaScript `wa.cesetRart is not a function`, 1 request tới `submit.backtrace.io` mỗi lần bấm, giỏ không trống | High |
| BUG-11 (biến thể) | TC-025 | Tổng quan | 12 | Bug của SD-102: `problem_user` bấm **tên sản phẩm ở Tổng quan** mở **sai** chi tiết, lệch +1 với **cả 6 sản phẩm** (Backpack → Fleece Jacket, Bike Light → Bolt, Onesie → Red T-Shirt, Bolt → Onesie, Red T-Shirt → Backpack, **Fleece Jacket → `id=6` không tồn tại**). | High |

### Màn hình 3: Hoàn tất (`/checkout-complete.html`)
| Bug | TC | Màn hình | Lỗi bắt được | Actual (tóm tắt) | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-27 | TC-041 | Hoàn tất | 2 | **Mở thẳng** `/checkout-complete.html` khi **chưa đặt hàng** vẫn hiện `Thank you for your order!` và "dispatched…", trong khi giỏ còn nguyên (số giỏ 2). | Low |
| BUG-30 | TC-032 | Hoàn tất | 7 | `problem_user`: Finish hiện trang thành công nhưng **giỏ không được làm trống** (số giỏ còn, `cart-contents` còn); Back Home còn nút `Remove`; Back của trình duyệt về Tổng quan còn sản phẩm, đặt lại được | High |

> BUG-03 (biến thể) không có TC fail: TC-046 pass, chỉ ghi thời gian (chưa có AC hiệu năng, quyết định HITL #1).

## Phát hiện mới trong bước chạy (→ HITL #3, câu hỏi Q14)
| # | Màn hình | Phát hiện | Bằng chứng | Đề xuất |
|---|---|---|---|---|
| N1 | Hoàn tất (PDF) | **Giờ trong tên file biên nhận là UTC**, còn `Order Date` trong biên nhận là **giờ máy người dùng**: file `swag-labs-order-2026-11-26_07-12-24.pdf` nhưng biên nhận ghi `November 26, 2026 at 2:12 PM` (UTC+7). Người dùng ở UTC−5 đặt lúc 21:00 sẽ có file mang **ngày hôm sau** | Thử 3 múi giờ (`timezoneId` Asia/Ho_Chi_Minh, UTC, America/New_York): tên file luôn theo UTC (`07-16-10`, `07-16-13`, `07-16-15`), giờ trình duyệt 14:16 / 07:16 / 02:16. Ảnh biên nhận: [TC-035 manual](evidence/all-cases/TC-035/manual/README.md) | Sau trao đổi với qa-reviewer (review-executor A1): **chưa có oracle** (Q6, O-27, MSG-08 chỉ chốt định dạng tên file) nên ghi **O-47 + IMP-12**, hỏi PO ở **Q14**, đề xuất **cải tiến**. PO coi là bug thì cấp **BUG-37**, Low (số mới, không phải biến thể). Reviewer thử thêm 1 múi giờ: `Order Date` luôn đúng giờ máy. Dù chọn gì, TC-034 đã kiểm `Order Date` đúng giờ địa phương ở múi giờ khác UTC (B1). **Kết quả Q14 (HITL #3, 2026-11-26): cải tiến IMP-12, không cấp số bug** |

## Chạy tay (Phase 2b)
| TC | Lý do | Kết quả | Ghi chú |
|---|---|---|---|
| TC-035 bước 3 | M2 (mắt người đánh giá bố cục, chữ), M3 (mở file bằng trình đọc PDF) | **Passed** | Mở bằng pdf.js 3.11.174: 1 trang A4, không lỗi; chữ rõ, không chồng, không cắt; đủ khối tiêu đề, SHIP TO, ITEMS, tổng tiền thẳng cột, dòng cảm ơn. [README + ảnh](evidence/all-cases/TC-035/manual/README.md). Phát hiện thêm N1 |

## Điểm review giao executor (review-script-gen)
| # | Việc | Kết quả |
|---|---|---|
| A2 | TC-045, TC-047 đỏ 1/24 lần lúc review, không rõ lỗi | **Không tái hiện được**: 0 lỗi / 17 lần mỗi test (executor) + 0 / 19 (reviewer). Đã trao đổi (review-executor "Trao đổi A2"): đóng ở trạng thái **không tái hiện, nghi môi trường, theo dõi**; không sửa code, không tăng `retries`; lỗi lại thì trace của CI (`on-first-retry`) sẽ có, mở lại A2 |
| D3 | Annotation "đã quét n/120 giỏ" có còn khi TC-020 hết giờ | **Có**: tạm hạ timeout TC-020 xuống 40 giây, test bị cắt, annotation `đã quét 31/120 giỏ` vẫn ghi; `test:run` cảnh báo `Test timeout of`. Đã trả code về như cũ |

## Rủi ro quy trình (không phải bug của web)
| # | Vấn đề | Bằng chứng | Đề xuất |
|---|---|---|---|
| R1 | **Thời gian CI có thể vượt giới hạn 20 phút** khi gộp vào `main` | CI chạy 1 worker: tổng thời gian các test checkout cộng dồn **12,2 phút** (lần chạy này; lần trước 11,9 phút), cộng 80 test cũ (CI hiện 7,2 phút) ≈ 19 phút, sát `timeout-minutes: 20`; CI có `retries: 2`. Dưới tải nặng (8 bài quét 120 giỏ cùng lúc), TC-019 vượt 180 giây 3/4 lần (bình thường 52–57 giây) | Người dùng quyết trước khi gộp (HITL #3): (A) CI 2 worker + giới hạn 30 phút; (B) giữ 1 worker, nâng giới hạn 30 phút. qa-reviewer đề xuất **B**: thời gian thêm chủ yếu là chờ cố định 2 giây của assertion mềm trong test bug (2 worker lợi ít), lỗi CI cũ (TC-043, TC-006) là tranh chấp thời gian trên máy chậm; cần nhanh hơn thì chia 2 job (sharding), mỗi job 1 worker |
