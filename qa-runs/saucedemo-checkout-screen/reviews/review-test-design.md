# Review: test-design, saucedemo-checkout-screen (SD-103)

- **Ngày**: 2026-11-25 · **Reviewer**: qa-reviewer (vai QC Lead, theo ISTQB) · **Kết luận**: ⚠️ **Cần sửa trước HITL #1**
- **Phạm vi**: `requirement/requirement.md` (7 AC), `spec-review.md` (O-01 → O-39, ma trận, Business Rules), `viewpoint.csv` (53 dòng), `q-and-a.md` (Q1 → Q11), `known-issues.md` (BUG-22 → BUG-34 + biến thể), `improvements.md` (IMP-01 → IMP-09).
- **Nguồn đối chiếu**: `CLAUDE.md` (mục "Bắt đầu chức năng mới"), `.claude/agents/test-design.md`, `knowledge-base/q-and-a-archive.md`, `qa-runs/saucedemo-login-screen/` (BUG-01 → BUG-04, Q6), `qa-runs/saucedemo-products-cart-screen/` (BUG-05 → BUG-21), `scripts/build-rtm.mjs` (cách RTM đọc cột `screen`), `tests/data/products.ts` (giá chuẩn).
- **Cách kiểm**: script Playwright riêng đặt **ngoài repo** (Chromium, viewport 1280×720), mỗi tình huống một context sạch, sau mỗi lần chuyển trang chờ phần tử riêng của trang đích (`firstName`, `finish`, `complete-header`, `checkout`, `inventory-list`). Mỗi bug mới chạy **2 lần** (trừ phép tính thuế: 1 lần quét toàn bộ, có lặp lại tổ hợp lỗi bằng giao diện 2 lần). Phép tính thuế: **63 tổ hợp giỏ × 5 tài khoản** (đặt `cart-contents` rồi mở Tổng quan) + 63 tổ hợp × 2 thứ tự cho `standard_user`. Đọc chữ trong file PDF bằng cách giải nén luồng nội dung (font WinAnsi). Không sửa file nào của dự án ngoài file này.
- **Tự đếm lại**: `viewpoint.csv` 53 dòng, 41 `in` / 12 `out`, đủ 8 cột; trục functional 18 · data 17 · flow 9 · non-functional 9. AC-1 → AC-7 đều có ≥ 1 viewpoint `in`. `q-and-a.md` 11 câu (5 blocking: Q1–Q5; 6 non-blocking: Q6–Q11), cả 11 `Open`. `known-issues.md` 13 số mới BUG-22 → BUG-34 (đủ, không trùng, nối tiếp BUG-21 của SD-102) + 6 biến thể (BUG-02, 03?, 05, 07, 11, 16) + 2 tham chiếu (BUG-19, BUG-01). Bug nào cũng có ít nhất 1 viewpoint.
- **Tóm tắt**: 0 🔴 · 7 🟠 · 15 🟡. Tài liệu kỹ, phần lớn quan sát tái hiện đúng (bảng kiểm chứng dưới). Vấn đề chính: **BUG-25 bị đánh giá thấp**: `standard_user` cũng thấy `Item total: $59.980000000000004` với giỏ 2 sản phẩm thông thường (A1); **đặt trùng đơn bằng 2 tab** chưa ghi (A2); ma trận chưa chứng minh "lỗi chung của mọi tài khoản" (B1); cột `screen` có tên trang ngoài feature, sẽ làm lệch thống kê theo màn hình của RTM (C1).

## Kiểm chứng bug mới trên web thật
| Bug | Kết quả | Cách kiểm (2 lần, context sạch) |
|---|---|---|
| BUG-22 | ✅ verified | 7 tổ hợp trống × `standard_user`, `visual_user`: luôn `input_error` trên **cả 3 ô** + 3 icon lỗi; thông báo đúng ô đầu tiên còn thiếu |
| BUG-23 | ✅ verified | Enter ở First / Last / Zip, khi đủ và khi trống → `/cart.html`, không thông báo, số giỏ giữ 2. Focus nút `Continue` rồi Enter → Tổng quan. Thêm: Enter ở First Name của `problem_user`, `error_user`, `visual_user`, `performance_glitch_user` cũng về giỏ (1 lần) |
| BUG-24 | ✅ verified | (1) giỏ trống qua Checkout; (2) mở thẳng `/checkout-step-two.html` giỏ trống; (3) đặt xong bấm Back: Tổng quan 0 sản phẩm, `Item total: $0`, `Tax: $0.00`, `Total: $0.00`, Finish → `Thank you for your order!`. Cả 3 đường. (3) cũng đúng với `visual_user`, `performance_glitch_user` |
| BUG-25 | ⚠️ partly: đúng nhưng **thiếu biến thể chính** | `$0` và `problem_user` `$95.93999999999998`: đúng. **Nhưng `standard_user` cũng bị** (A1) |
| BUG-26 | ✅ verified | Giỏ `[4]`, mở thẳng Tổng quan: `$29.99 / $2.40 / $32.39`, Finish → Hoàn tất, giỏ bị xóa. Mở thẳng `/checkout-step-one.html` khi giỏ trống: vào được |
| BUG-27 | ✅ verified | Giỏ `[4,2]`, mở thẳng `/checkout-complete.html`: `Thank you for your order!`, số giỏ `2`, `cart-contents` `[4,2]`, chỉ có nút `Back Home` (không có `Generate PDF order`) |
| BUG-28 | ✅ verified | `problem_user` gõ `Lee` vào Last Name → First Name `e`, Last Name trống; `fill('Lee')` → First Name `Lee`, Last Name trống; Continue → `Error: Last Name is required` |
| BUG-29 | ✅ verified | `problem_user`: **63/63** tổ hợp giỏ có Item total = 2 × tổng thật (vd Bike Light `$19.98`), Tax = 8 % của số sai. Giá dòng, tên, mô tả giống `standard_user` |
| BUG-30 | ✅ verified (ngoài danh sách bắt buộc) | `problem_user` Finish: số giỏ `3`, `cart-contents` `[4,0,2]`; Back Home: 3 nút `Remove` |
| BUG-31 | ✅ verified | `error_user` gõ `Lee` vào Last Name: ô trống, 3 `pageerror` `Cannot read properties of undefined (reading 'value')`, 3 `POST submit.backtrace.io` |
| BUG-32 | ✅ verified (ngoài danh sách bắt buộc) | `Ann` / trống / trống → `Error: Postal Code is required`; `Ann` / trống / `70000` → Tổng quan |
| BUG-33 | ✅ verified | `error_user` bấm Finish 2 lần: ở lại Tổng quan, 2 `pageerror` `wa.cesetRart is not a function`, 2 `POST submit.backtrace.io`, giỏ `[4,0,2]`, số giỏ 3 |
| BUG-34 | ✅ verified | `" "`×3; `"   "` ở từng ô; zip là ký tự tab: cả 5 trường hợp sang Tổng quan và **đặt hàng thành công** |
| Thuế 8 % / Total | ✅ verified | 63 tổ hợp × `standard_user`, `visual_user`, `performance_glitch_user`, `error_user`: **Tax = round(8 % × Item total) và Total = Item total + Tax đúng 63/63**. Thuế theo từng dòng cộng lại = thuế theo tổng ở cả 63 tổ hợp. Không có nửa cent: 8c ≡ 50 (mod 100) vô nghiệm (vế trái chia 4 dư 0 khi rút gọn, vế phải lẻ), nên ghi chú của O-12 đúng. **Chỉ Item total sai định dạng** (A1) |
| Biến thể cũ | ✅ verified | BUG-02 (cookie tự tạo vào cả 3 trang, Finish được), BUG-05 (Reset ở Tổng quan: số giỏ mất, `cart-contents` null, trang vẫn 2 sản phẩm `$41.02`, Finish được), BUG-07 (O-26, và **cả chiều ngược lại**, A3), BUG-11 (A6), BUG-03? (Back Home `performance_glitch_user` 5122 / 5116 ms; Continue 76–94 ms, Finish 66 ms), PDF có dấu: `Nguyễn Thị Ánh` thành `NguyÅn ThË Ánh` (O-28 đúng) |

Không có quan sát nào của test-design bị bác bỏ.

## Checklist (mục 5: Phân tích yêu cầu / thiết kế test)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Mọi AC đánh giá testable, từ mơ hồ thành câu hỏi | ✅ Đạt | `spec-review.md` bảng AC: 7 AC + dòng "chung"; AC-2/3/4/5 ⚠️ có Qn. Mơ hồ còn lại (A2: "đặt hàng" có được lặp lại không) ghi ở B2 |
| Quan sát tách khỏi yêu cầu; hành vi đáng ngờ thành câu hỏi / known-issue | ❌ Chưa đạt (nhỏ) | Business Rules sạch, thuế 8 %, Payment / Shipping ghi riêng "chờ Q1, Q2". Nhưng TVP-017 lấy "theo **thứ tự thêm**" (O-12) làm expected, AC-4 không nói thứ tự (B3) |
| Viewpoint phủ 4 trục, có viewpoint ngoài phạm vi kèm lý do | ✅ Đạt | 18 / 17 / 9 / 9; 12 dòng `out` đều có `source` |
| Luồng chuyển trạng thái (thành công → thoát → vào lại; lỗi → thử lại; tải lại; Back) | ❌ Chưa đạt | Thiếu: 2 tab (A2), đơn thứ 2 sau đơn thứ nhất, tải lại / đăng xuất / Reset ở **Hoàn tất** (B2) |
| Kiểm soát truy cập: mọi trang, phiên giả mạo | ⚠️ Gần đạt | TVP-035/036 đủ 3 trang. TVP-037 (đăng xuất rồi Back) chỉ có Thông tin + Tổng quan, thiếu Hoàn tất (reviewer đã thử: chặn đúng) |
| Ma trận tài khoản × trang × thao tác, mọi ô đã thử | ❌ Chưa đạt | Các thao tác của BUG-22 → BUG-27 (Enter, khoảng trắng, URL thẳng, Back sau khi đặt, Reset, Logout, tải lại) không có cột, chỉ ghi "lỗi chung của mọi tài khoản" không kèm bằng chứng (B1) |
| Câu hỏi có bối cảnh, đề xuất, ảnh hưởng; BR không chứa hành vi chưa xác nhận | ✅ Đạt | 11 câu đủ cột. BR-1 → BR-5 từ AC, BR-6 từ knowledge-base |
| Bug thấy sớm ghi vào known-issues kèm mọi biến thể | ❌ Chưa đạt | BUG-25 thiếu biến thể `standard_user` (A1); đặt trùng đơn 2 tab chưa ghi (A2); BUG-07 chiều ngược lại (A3); BUG-11 chỉ ghi 3/6 sản phẩm (A6) |

## A. Phát hiện mới (đã kiểm chứng trên web thật)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | **BUG-25 xảy ra với `standard_user` ở giỏ thông thường**, không chỉ giỏ rỗng và `problem_user`. Thêm `Bike Light` rồi `Fleece Jacket` từ danh sách → Tổng quan hiện `Item total: $59.980000000000004` (Tax `$4.80`, Total `$64.78` vẫn đúng). Lỗi phụ thuộc **tổ hợp và thứ tự thêm**: 20/63 tổ hợp bị ở ít nhất một thứ tự (26/126 thứ tự tăng + giảm), vd `[2,5]` `$57.980000000000004`, `[0,1,2,4]` `$63.959999999999994`, `[0,1,2,5]` `$83.96000000000001`, `[4,3,2,1,0]` `$79.94999999999999`. Giống hệt ở `visual_user`, `performance_glitch_user`, `error_user`. PDF lại in `59.98` (đã làm tròn) → **Tổng quan và biên nhận lệch nhau**. 8 giỏ của O-12 tình cờ không rơi vào tổ hợp nào bị lỗi nên kết luận "đúng cả 8 giỏ" đúng nhưng không đại diện | Giao diện thật (thêm từ danh sách → giỏ → Checkout → Continue), 2/2: `cart-contents` `[0,5]`, `Item total: $59.980000000000004`. Quét 63 tổ hợp × 2 thứ tự bằng `cart-contents` | 🟠 | Thêm O-xx (danh sách tổ hợp). Sửa BUG-25: ví dụ chính là `standard_user` `[0,5]`; `$95.93999999999998` của `problem_user` là **cùng nguyên nhân** (cộng số thực không làm tròn), không phải lỗi riêng của tài khoản. Đề xuất mức **Medium** (tài khoản chuẩn, giỏ 2 sản phẩm, số tiền là trường AC-4 liệt kê; bài học L12). Sửa context Q7 và xem xét chuyển Q7 sang Blocking (D1). TVP-021 phải có giỏ `[0,5]`, `[2,5]` |
| A2 | **Đặt trùng đơn bằng 2 tab**: mở Tổng quan ở tab 1 và tab 2 (cùng phiên, giỏ `[4,2]`), Finish ở tab 1 → giỏ bị xóa; tab 2 vẫn hiện 2 sản phẩm, `$37.98 / $3.04 / $41.02`, Finish → `Thank you for your order!` lần 2 **với đủ sản phẩm**. Không có O, TVP, Q, BUG nào nói tới. Cùng cơ chế với biến thể BUG-05 ở Tổng quan (O-25): Finish đặt theo danh sách đang hiện, không kiểm giỏ hiện tại | 2/2, context sạch, `ctx.newPage()` cho tab 2 | 🟠 | Thêm O-40, câu hỏi mới (xem cuối báo cáo, Q12), viewpoint `flow` "đặt hàng chỉ một lần: tab cũ / Back / sau Reset". Đề xuất cấp **BUG-35** (Medium: đơn trùng có tiền, khác BUG-24 là đơn rỗng) hoặc gộp với biến thể BUG-05 thành một lỗi "Finish không kiểm giỏ hiện tại": HITL #1 chốt |
| A3 | **BUG-07 biến thể chiều ngược lại** (bài học L1, L11): `visual_user` thêm Onesie, đăng xuất; `standard_user` đăng nhập thấy số giỏ `1`, Checkout đặt được Onesie; `visual_user` đăng nhập lại: giỏ trống. O-26 chỉ thử `standard_user` → `visual_user` | 2/2 | 🟡 | Bổ sung O-26 "cả 2 chiều". TVP-041 và ghi chú BUG-07 biến thể: TC kiểm cả 2 chiều |
| A4 | **Tải lại trang Hoàn tất sau khi đặt: mất nút `Generate PDF order`** (tiêu đề "Thank you…" vẫn hiện). Người mua tải lại là mất biên nhận. O-17 chỉ ghi "tải lại: trang vẫn hiện" | 2/2: số nút `generate-pdf-order` = 0 sau `reload()` | 🟡 | Thêm vào O-17 và context Q6. Nếu Q6 trả lời "trong phạm vi" thì thêm viewpoint; mức đề xuất Low hoặc IMP |
| A5 | PDF: cột tiêu đề `DESCRIPTION` nhưng in **tên** sản phẩm, không có mô tả; `problem_user` in `75.96 / 6.08 / 82.04` (số gấp đôi, BUG-29). `visual_user`, `performance_glitch_user`: nội dung giống `standard_user` (SHIP TO, sản phẩm, số tiền) | Giải nén luồng nội dung của 5 file PDF | 🟡 | Ghi vào O-27 (cột `DESCRIPTION`) và ma trận cột PDF. Câu hỏi nhỏ trong Q6 hoặc IMP |
| A6 | BUG-11 biến thể: `problem_user` bấm tên ở Tổng quan lệch **+1 với cả 6 sản phẩm** (4→5, 0→1, 2→3, 1→2, 3→4, **5→6 = không tồn tại**). O-32 chỉ ghi 3 sản phẩm. `visual_user`, `error_user`, `performance_glitch_user` mở đúng cả 6 | 1 lần × 6 sản phẩm × 4 tài khoản | 🟡 | Sửa O-32 và dòng BUG-11 biến thể: "cả 6 sản phẩm, Fleece Jacket → `id=6`" để TC phủ đủ 6 |
| A7 | Đã kiểm, **không thấy lỗi** (cần đưa vào tài liệu làm phủ dương tính): đăng xuất ở **Hoàn tất** rồi Back → `/` với `…'/checkout-complete.html' when you are logged in.`; Reset App State ở Hoàn tất → số giỏ và `cart-contents` mất; `All Items` ở Tổng quan → danh sách, số giỏ giữ; **đơn thứ 2** sau đơn thứ nhất: 3 ô trống, Onesie `$7.99 / $0.64 / $8.63`, giỏ trống; Back Home → Back → Hoàn tất → Forward → danh sách, không có số giỏ; mở thẳng 3 trang với 5 tài khoản: không có `pageerror`, không gọi `submit.backtrace.io` | 2/2 (mở trang: 2/2 × 5 tài khoản) | 🟡 | Ghi O-xx; thêm vào TVP-037 (Hoàn tất), TVP-026 / TVP-047 (Hoàn tất), viewpoint mới "đơn thứ 2" (B2) |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Ma trận chưa chứng minh "lỗi chung của mọi tài khoản"**. Ghi chú ma trận nói BUG-22 → BUG-27, biến thể BUG-02/05/07 "không ghi lại ở đây", nhưng không có cột Enter, khoảng trắng, mở thẳng URL, Back sau khi đặt, Reset, Logout, Back / Forward / tải lại, menu, biểu tượng giỏ. Không biết các ô đó đã thử với từng tài khoản hay chưa (checklist: "mọi ô đã thử"). Reviewer thử một phần: Enter (4 tài khoản đặc biệt: về giỏ), BUG-22 (`visual_user`: như `standard_user`), Back sau khi đặt (`visual_user`, `performance_glitch_user`: Tổng quan rỗng; `problem_user`: **1 sản phẩm, `$59.98`** do BUG-30 + BUG-29) | `spec-review.md` dòng ghi chú trên bảng ma trận | 🟠 | Thêm cột cho các thao tác này (hoặc một bảng phụ "thao tác chung × 5 tài khoản") với ✅/❌ thật. `problem_user` Back sau khi đặt khác các tài khoản khác: ghi rõ |
| B2 | **Viewpoint thiếu cho luồng trạng thái và trang Hoàn tất**: (1) 2 tab / Finish ở trang cũ (A2); (2) đơn thứ 2 sau đơn thứ nhất (A7, phủ hồi quy "giỏ trống sau đặt không làm hỏng lần sau"); (3) Hoàn tất: tải lại (A4), đăng xuất rồi Back (TVP-037 thiếu), Reset / menu (TVP-026, TVP-047 thiếu); (4) BUG-07 chiều ngược lại (A3). Requirement cũng không có AC "mỗi lần Finish tạo đúng một đơn": điểm mơ hồ cần hỏi | `viewpoint.csv` TVP-026, TVP-030, TVP-037, TVP-041, TVP-047 | 🟠 | Thêm 2–3 TVP `flow` (2 tab; đơn thứ 2; Hoàn tất tải lại / đăng xuất / Reset). Mở rộng TVP-037 thành `Cả 3`. Câu hỏi Q12 |
| B3 | TVP-017 đặt expected "theo **thứ tự thêm**" lấy từ O-12, AC-4 chỉ nói "liệt kê đúng các sản phẩm". Quan sát thành expected khi chưa hỏi | `viewpoint.csv` TVP-017 | 🟡 | Bỏ "thứ tự thêm" khỏi expected, hoặc thêm câu hỏi non-blocking (Q13) |
| B4 | Ma trận ghi `problem_user` cột "Finish" ✅ nhưng Finish đặt đơn với tổng gấp đôi và không làm trống giỏ; cột "PDF" ⚠️ chỉ nói số tiền sai mà không nói thiếu `SHIP TO` (vào bằng URL). Người đọc dễ hiểu Finish của `problem_user` "đúng như `standard_user`" | Bảng ma trận dòng `problem_user` | 🟡 | Ghi rõ "✅ chuyển trang được (đơn sai số tiền: BUG-29; giỏ còn: BUG-30)"; PDF "không có SHIP TO vì vào bằng URL, không phải lỗi riêng" |
| B5 | Q8 phần "độ dài" đã có trong knowledge-base ("coi như không giới hạn, test chuỗi rất dài; hỏi PO để làm BVA"); Q9 có tiền lệ SD-101 Q6 (đã chốt "bug giao diện Low") | `knowledge-base/q-and-a-archive.md`; `qa-runs/saucedemo-login-screen/q-and-a.md` Q6 | 🟡 | Q8 chỉ hỏi phần định dạng (zip có chữ, tên có số), ghi "độ dài: theo knowledge-base". Q9 ghi tiền lệ SD-101 Q6 và chỉ hỏi thêm việc đánh số (C6) |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | Cột `screen` dùng tên **trang ngoài feature**: `Giỏ → Thông tin` (TVP-001, TVP-040), `Thông tin → Giỏ` (TVP-011), `Tổng quan → Danh sách` (TVP-022), `Tổng quan → Chi tiết` (TVP-024), `Hoàn tất → Danh sách` (TVP-029); `-` (TVP-048, TVP-053). `scripts/build-rtm.mjs` lấy danh sách màn hình **từ dữ liệu** (tách theo `+ → ; ,`) và "Cả 3" = mọi màn hình tìm được. Nếu test-cases.csv chép các giá trị này, RTM sẽ có 6 "màn hình" (Giỏ, Danh sách, Chi tiết) và mọi TC "Cả 3" bị đếm cả ở 3 trang của SD-102 | `scripts/build-rtm.mjs` dòng 59–62; `viewpoint.csv` | 🟠 | Chỉ dùng 3 tên màn hình của feature trong `screen` (vd TVP-001 `Thông tin`, TVP-022 `Tổng quan`); điểm vào / ra ghi trong `description`. Ghi quy tắc này vào lưu ý cho test-impl. (Hoặc sửa RTM để chỉ nhận màn hình khai báo trong spec, việc của bước khác) |
| C2 | `known-issues.md` ghi "IMP-01 → IMP-08", `improvements.md` có IMP-09. O-18 không nhắc IMP-09 | `known-issues.md` dòng 53; `improvements.md` IMP-09 | 🟡 | Sửa thành IMP-01 → IMP-09; thêm IMP-09 vào ghi chú O-18 |
| C3 | O-12 ghi "7 giỏ" nhưng liệt kê 8 giỏ và 8 bộ số (Q2 ghi "8 giỏ"). O-30 ghi "7 giỏ" nhưng liệt kê 6 | `spec-review.md` O-12, O-30 | 🟡 | Sửa số đếm |
| C4 | **BUG-26 gộp 2 lỗi khác nhau**: (a) bỏ qua bước Thông tin khi giỏ có hàng (lỗi mới, AC-2); (c) mở thẳng `/checkout-step-one.html` khi giỏ trống = **cùng cổng chặn của BUG-19** (giỏ trống không được vào thanh toán) đi bằng URL thay vì nút. TVP-038 cũng gộp 2 expected. Q3 đề xuất (c) "chặn như BUG-19" nhưng known-issues lại để trong BUG-26 | `known-issues.md` BUG-26; `viewpoint.csv` TVP-038; `q-and-a.md` Q3 | 🟡 | (c) ghi là **biến thể BUG-19** (giữ số cũ, tag `@BUG-19`), viewpoint riêng `scope=in` (TVP-040 chỉ phủ đường nút ở SD-102 TC-030). BUG-26 chỉ còn (a) |
| C5 | **Mức không đồng nhất cho cùng ảnh hưởng**: BUG-28 (`problem_user` không đặt được hàng) **High**; BUG-33 (`error_user` không đặt được hàng) "**Critical** nếu là hệ thống thật". SD-102 xếp lỗi chặn mua của tài khoản đặc biệt (BUG-10, BUG-13) là High | `known-issues.md` BUG-28, BUG-33 | 🟡 | Thống nhất một mức (đề xuất High cho cả hai, theo tiền lệ SD-102), ghi lý do |
| C6 | Đánh số biến thể / số mới chưa có tiêu chí rõ: header `known-issues.md` ghi "bug đã có ở feature khác mà nay thấy thêm ở trang thanh toán được ghi là biến thể, giữ số cũ", nhưng BUG-22 (cùng kiểu với BUG-01: thiếu một ô mà tô đỏ mọi ô) lại cấp số mới. Ý kiến reviewer: **giữ BUG-22 là số mới là hợp lý** (form khác, AC khác, chỗ sửa khác; sửa form đăng nhập không đóng được lỗi này), khác các biến thể BUG-02/05/07/11/16 vốn là cùng cơ chế dùng chung (cookie, Reset, `localStorage`, link tên, header). Tương tự **BUG-24 không phải biến thể BUG-19**: BUG-19 là cổng ở trang giỏ, BUG-24 là cổng ở Finish; đường (3) "Back sau khi đặt" không liên quan BUG-19 | `known-issues.md` dòng 6, BUG-22, BUG-24 | 🟡 | Ghi tiêu chí vào header: "**cùng thành phần / cùng chỗ sửa → biến thể; khác form, khác cổng kiểm tra → số mới, ghi 'cùng kiểu với BUG-xx'**". Áp tiêu chí đó cho C4 và Q11 |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | **Phân vùng giỏ cho phép tính tiền chưa đúng rủi ro, và oracle sẽ che lỗi**. TVP-018 chọn giỏ theo "1 sản phẩm, cả 6, rẻ nhất, hỗn hợp", không có phân vùng "tổng có sai số dấu phẩy động" (đoán lỗi điển hình với tiền). Lưu ý 2 trong `known-issues.md` dặn so chuỗi `$x.xx`: nếu test-impl chọn giỏ `[0,5]` cho TVP-018 thì TC phép tính sẽ đỏ **vì BUG-25** (định dạng), lẫn với lỗi số học; nếu chọn như O-12 thì không TC nào bắt BUG-25 ở `standard_user` (false negative). Việc quét toàn bộ rất rẻ: 63 tổ hợp, đặt `cart-contents` rồi mở Tổng quan | A1; `viewpoint.csv` TVP-018, TVP-021; `known-issues.md` lưu ý 2 | 🟠 | TVP-018: kiểm **giá trị số** (parse rồi so theo cent) để chỉ bắt lỗi số học; TVP-021: kiểm **định dạng** với giỏ có lỗi số thực (`[0,5]`, `[2,5]`, `[0,1,2,4]`) và giỏ rỗng. Ghi rõ phân vùng trong TVP-018/021. Cân nhắc kiểm cả 63 tổ hợp ở tầng dữ liệu (nhanh, không cần UI cho từng giỏ) |
| D2 | Cột `axis` của TVP-045 (`performance_glitch_user`, ghi thời gian) là `data`; TVP-014/015/016 (chức năng nhập của tài khoản đặc biệt) cũng `data`. Không sai nặng nhưng lệch cách SD-102 dùng `data` cho phân vùng dữ liệu | `viewpoint.csv` | 🟡 | Giữ nếu quy ước "tài khoản = dữ liệu", ghi một dòng giải thích trong `spec-review.md`; TVP-045 nên là `non-functional` hoặc `flow` |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Phép tính tiền được kiểm bằng **8 giỏ chọn tay**, bỏ sót lỗi xuất hiện ở 20/63 tổ hợp | A1 | 🟡 | Thêm bài học **L13** vào `qa-reviewer.md` và checklist test-design: "Khi không gian tổ hợp nhỏ (≤ vài trăm) và kiểm rẻ (đặt dữ liệu rồi đọc), quét **toàn bộ** thay vì chọn tay; với số tiền, thử cả thứ tự cộng" |
| E2 | Không ai thử "tạo đối tượng 2 lần" (2 tab, Back, bấm lại) cho thao tác tạo đơn | A2 | 🟡 | Checklist test-design, mục luồng trạng thái: với thao tác **tạo / gửi** (đặt hàng, gửi form): thử 2 tab, Back rồi gửi lại, bấm 2 lần liên tiếp |
| E3 | Tiêu chí "biến thể hay số mới" đang ngầm hiểu, mỗi feature tự quyết | C4, C6, Q11 | 🟡 | Đưa tiêu chí của C6 vào `CLAUDE.md` mục "Bắt đầu chức năng mới" điểm 4 |

## Câu hỏi đề xuất thêm / sửa cho HITL #1
| # | Loại | Đề xuất |
|---|---|---|
| Q7 (sửa) | Non-blocking → **Blocking** | Context thêm: `standard_user` giỏ Bike Light + Fleece Jacket hiện `Item total: $59.980000000000004`, 20/63 tổ hợp bị; PDF lại in `59.98`. Ảnh hưởng: expected chính của AC-4 (TVP-018, TVP-021), mức BUG-25 (đề xuất Medium) |
| Q12 (mới) | Non-blocking (có đề xuất) | "Bấm Finish ở trang Tổng quan **đã cũ** (tab thứ 2 sau khi tab 1 đặt xong; sau Reset App State; Back sau khi đặt) có được tạo đơn không?" Context A2, O-25, O-18. Đề xuất: Finish phải dựa trên giỏ hiện tại; giỏ đã trống thì không tạo đơn. Ảnh hưởng: viewpoint 2 tab, BUG-35 hoặc gộp với biến thể BUG-05 |
| Q13 (mới) | Non-blocking | "Sản phẩm ở Tổng quan có phải theo thứ tự thêm vào giỏ?" (B3). Đề xuất: không bắt buộc thứ tự, chỉ kiểm đủ và đúng |
| Q6 (sửa) | Giữ Non-blocking | Context thêm: tải lại trang Hoàn tất là mất nút PDF (A4); cột `DESCRIPTION` in tên sản phẩm (A5); PDF làm tròn Item total còn Tổng quan thì không (A1) |
| Q3 (sửa) | Giữ Blocking | Tách (c) thành biến thể BUG-19 qua URL (C4); (a), (b) giữ cho BUG-26, BUG-27 |
| Q8 (sửa) | Giữ Non-blocking | Chỉ hỏi định dạng; độ dài theo knowledge-base (B5) |
| Q9 (sửa) | Giữ Non-blocking | Ghi tiền lệ SD-101 Q6 (đã chốt Low); hỏi thêm: ghi số mới BUG-22 (đề xuất) hay biến thể BUG-01 (C6) |

## Việc cần làm trước khi sang bước sau (xếp theo mức độ)
1. 🟠 A1 + D1: sửa BUG-25 (ví dụ `standard_user`, mức đề xuất Medium), O-12, Q7; tách TVP-018 (giá trị) / TVP-021 (định dạng) với giỏ `[0,5]`, `[2,5]`, `[0,1,2,4]`, giỏ rỗng.
2. 🟠 A2 + B2: ghi O-40 (2 tab), Q12, viewpoint 2 tab / đơn thứ 2 / Hoàn tất (tải lại, đăng xuất, Reset); TVP-037 thành `Cả 3`; đề xuất BUG-35 hoặc gộp với biến thể BUG-05.
3. 🟠 B1: bổ sung cột hoặc bảng phụ "thao tác chung × 5 tài khoản" trong ma trận, với kết quả thật.
4. 🟠 C1: cột `screen` chỉ dùng Thông tin / Tổng quan / Hoàn tất (hoặc `Cả 3`); điểm vào / ra để trong mô tả.
5. 🟡 A3, A6: BUG-07 biến thể cả 2 chiều; BUG-11 biến thể cả 6 sản phẩm (Fleece → `id=6`).
6. 🟡 C4, C6, E3: tách (c) của BUG-26 thành biến thể BUG-19; ghi tiêu chí "biến thể / số mới" vào header `known-issues.md` (và `CLAUDE.md`).
7. 🟡 C5: thống nhất mức BUG-28 / BUG-33.
8. 🟡 A4, A5, A7, B3, B4, B5, C2, C3, D2: cập nhật O-17, O-27, O-32, ma trận, TVP-017, Q6/Q8/Q9, số đếm, danh sách IMP.
9. 🟡 E1, E2: thêm L13 và mục "tạo / gửi 2 lần" vào checklist (qa-reviewer + test-design).

## Xử lý sau review (2026-11-25)
**Kiểm chứng lại:** A1 đúng (`standard_user` thêm Bike Light rồi Fleece Jacket: `Item total: $59.980000000000004`, 2/2 lần). A2 đúng (2 tab: tab 2 bấm Finish sau khi tab 1 đặt xong vẫn ra "Thank you for your order!", 2/2 lần). Tự kiểm thêm BUG-23, 27, 28, 33: đúng.

| # | Xử lý |
|---|---|
| A1, D1 | ✅ BUG-25 viết lại (Medium, cả `standard_user`, giỏ thường), O-12 sửa, O-41 liệt kê giỏ lỗi, TVP-018 so giá trị số (cent), TVP-021 kiểm định dạng với giỏ `[0,5]`, `[2,5]`, `[0,1,2,4]`, giỏ trống; Q7 chuyển Blocking; ghi lệch giữa trang và PDF |
| A2 | ✅ O-40, **BUG-35** (tạm, Medium), TVP-055, Q12 (giữ riêng hay gộp BUG-05) |
| A3–A7 | ✅ BUG-07 cả 2 chiều; O-17 (mất nút PDF sau tải lại), O-27 (cột DESCRIPTION, PDF của `problem_user` nhân đôi); BUG-11 lệch +1 cả 6 sản phẩm; O-42 các trường hợp đúng; TVP-056, TVP-057 |
| B1–B5 | ✅ Bảng 2 trong ma trận: 15 thao tác chung × 5 tài khoản (O-43); TVP-037 phủ cả 3 trang; TVP-017 không giả định thứ tự, thêm Q13; ô Finish của `problem_user` ghi BUG-29/30; Q8 chỉ hỏi định dạng, Q9 dẫn tiền lệ SD-101 Q6 |
| C1–C6 | ✅ Cột `screen` chỉ còn Thông tin / Tổng quan / Hoàn tất (và kết hợp, Cả 3); IMP-01 → IMP-10; O-12, O-30 sửa số; điểm (c) của BUG-26 chuyển thành biến thể BUG-19 (TVP-054); BUG-28, BUG-33 cùng High; quy tắc "biến thể hay số mới" ghi ở đầu `known-issues.md` |
| D2 | ✅ Ghi rõ tài khoản đặc biệt là phân vùng dữ liệu; TVP-045 `non-functional` |
| E1, E2 | ✅ (làm ở file chung) `qa-reviewer.md` thêm L13 (không gian kết hợp nhỏ thì thử hết), L14 (thao tác tạo dữ liệu: 2 tab, Back rồi gửi lại, bấm 2 lần); `test-design.md` thêm mục 7 cùng nội dung |
| E3 | ✅ `CLAUDE.md` mục 4 thêm quy tắc "cùng thành phần / chỗ sửa → biến thể; khác form / điểm kiểm → số mới" |

## Trao đổi HITL #1: Q11, Q13
Người duyệt giao QA chốt 2 câu. Reviewer đo lại trên web thật (Chromium, context sạch, chờ phần tử riêng của trang đích, **2 lần**) và đối chiếu tiền lệ SD-101, SD-102.

### Q11: `performance_glitch_user` chậm ~5,1 giây khi về danh sách
**Đo lại** (ms, lần 1 / lần 2; `standard_user` trong ngoặc):

| Thao tác | Đích | `performance_glitch_user` | (`standard_user`) |
|---|---|---|---|
| Đăng nhập | Danh sách | 5210 / 5136 | (103 / 115) |
| Sắp xếp Z → A | Danh sách (vẽ lại) | 5070 / 5053 | (18 / 16) |
| `Continue Shopping` ở giỏ | Danh sách | 5138 / 5095 | (73 / 67) |
| Back của trình duyệt từ giỏ | Danh sách | 5027 / 5030 | (18 / 25) |
| `Back to products` ở chi tiết | Danh sách | 5129 / 5123 | (65 / 76) |
| Menu `All Items` (từ Thông tin) | Danh sách | 5946 / 5981 | (958 / 1016) |
| Mở thẳng `/inventory.html` | Danh sách | 5568 / 5517 | (607 / 466) |
| `Cancel` ở Tổng quan | Danh sách | 5099 / 5118 | (70 / 62) |
| `Back Home` ở Hoàn tất | Danh sách | 5109 / 5102 | (60 / 59) |
| Thêm giỏ · mở giỏ · mở chi tiết · `Checkout` · `Continue` · `Finish` | Trang khác | 58 → 102 | (49 → 103) |

**Kết luận từ số đo**: chậm **chỉ xảy ra khi vẽ danh sách sản phẩm** (+~5 giây cố định, mọi đường vào, kể cả sắp xếp). Mọi bước của chính luồng thanh toán (`Checkout`, `Continue`, `Finish`) nhanh như `standard_user`. Vậy BUG-03 (đăng nhập), BUG-17 (sắp xếp) và quan sát O-37 là **cùng một nguyên nhân** ở trang danh sách (thuộc SD-102), không phải lỗi của SD-103.

| Phương án | Nội dung | Đánh giá |
|---|---|---|
| **A (đề xuất)** | Ghi O-37 là **biến thể BUG-03** (số nhỏ nhất của cùng nguyên nhân; không cấp số mới, không gắn BUG-17). **Chỉ ghi nhận**: không đưa vào bug report, nằm ở mục "Không đưa vào bug report" của `defects.md` như SD-101 BUG-03 và SD-102 BUG-17. TC dương tính TVP-045: kiểm luồng **thành công**, ghi thời gian từng bước (annotation), **không assert ngưỡng**; ngưỡng chờ riêng **10 giây** cho mọi bước về danh sách (như SD-101 TC-006, SD-102 TC-034) | Nhất quán cả 2 feature trước và knowledge-base ("test chức năng chỉ kiểm thành công, báo riêng kèm số đo"). Không có AC hiệu năng nên không có oracle cho một ngưỡng pass/fail |
| B | Cấp số mới (BUG-35…) và đưa vào `defects.md` | Không đề xuất: trùng nguyên nhân với BUG-03 / BUG-17, ngược tiền lệ đã duyệt 2 lần, và lỗi không nằm ở màn hình của SD-103 |

**Ngưỡng**: **không assert ngưỡng thời gian** (không có AC; knowledge-base). Ngưỡng chờ 10 giây chỉ là giới hạn "vẫn chạy được", không phải tiêu chí hiệu năng; số đo hiện tại (≤ 6 giây) còn dư. Đề xuất ngưỡng thuộc IMP: sửa **IMP-08** thành "trang danh sách hiển thị ≤ 1 giây sau mọi thao tác dẫn tới nó (không tính đăng nhập)", ghi rõ là **cùng đề xuất với SD-102 IMP-04** (sắp xếp ≤ 1 giây) và bổ sung cho SD-101 IMP-03 (đăng nhập ≤ 3 giây), để PO quyết một AC hiệu năng chung thay vì 3 đề xuất rời. Gợi ý thêm: `known-issues.md` của SD-102 ghi chú BUG-17 "cùng nguyên nhân với BUG-03" (chỉ ghi chú, không đổi số).

### Q13: thứ tự sản phẩm ở trang Tổng quan
**Kiểm hiện trạng** (`standard_user`, 2/2): thêm Onesie → Fleece Jacket → Bike Light, bỏ Onesie rồi thêm lại. `cart-contents` = `[5,0,2]`; trang giỏ và Tổng quan đều là **Fleece Jacket, Bike Light, Onesie**: đúng thứ tự thêm (món thêm lại xếp cuối), **khác** thứ tự tên (Bike, Fleece, Onesie), giá (Onesie, Bike, Fleece) và id (Bike, Onesie, Fleece). PDF cũng theo thứ tự này (vd giỏ `[5,0]` in Fleece Jacket rồi Bike Light).

| Phương án | Nội dung | Đánh giá |
|---|---|---|
| **A (đề xuất)** | **Tổng quan giữ đúng thứ tự của giỏ = thứ tự thêm vào giỏ** (món bỏ rồi thêm lại xếp theo lần thêm sau cùng). PDF theo cùng thứ tự | Nhất quán với SD-102 Q12 (đã chốt, TC-027). Thực tế thương mại điện tử: trang "xem lại đơn" là bản sao của giỏ để người mua nhận ra đúng những gì vừa chọn; đổi thứ tự giữa giỏ và bước xác nhận dễ gây nhầm ngay trước khi trả tiền. Không cần đổi gì ở sản phẩm |
| B | Sắp theo tên (hoặc giá) | Không đề xuất: lệch với giỏ (SD-102 Q12), không có lợi rõ cho người mua ở 1 đơn vài món, và sẽ biến hiện trạng thành bug mà không có yêu cầu nào đòi |

**Cách test** (TVP-017, `standard_user`, thao tác qua giao diện): thêm Onesie, Fleece Jacket, Bike Light; bỏ Onesie rồi thêm lại; đi Checkout → Continue. Expected: tên trên Tổng quan **đúng thứ tự** `Fleece Jacket, Bike Light, Onesie` (so mảng tên nguyên văn, `toHaveText([...])`) **và** bằng danh sách ở trang giỏ. Bộ dữ liệu này cố ý làm thứ tự thêm khác thứ tự tên, giá, id, để test **fail** nếu web đổi sang sắp theo tiêu chí khác (một bộ như TC-027 mà thứ tự thêm trùng thứ tự tên thì không bắt được). Tài khoản đặc biệt: chỉ kiểm danh sách đủ và đúng (thứ tự đã phủ bởi `standard_user`).

**Hiện trạng với quy tắc A: PASS**, không phải bug. Cập nhật Q13 `Answered`, B3 coi như đóng (TVP-017 giữ "thứ tự thêm" với nguồn Q13).
