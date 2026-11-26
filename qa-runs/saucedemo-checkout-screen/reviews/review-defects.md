# Review: defects, saucedemo-checkout-screen

- **Ngày**: 2026-11-26 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa nhẹ** (0 lỗi 🔴, 0 lỗi 🟠, 10 lỗi 🟡). Bug report đúng và đủ, sửa nhanh được; bài học số 9 có 3 chỗ sai sự thật / sai mẫu cần sửa trước khi commit.
- **Phạm vi**:
  - Bug report: `defects.md` (21 bug), `tests/repro/saucedemo-checkout-screen.repro.ts`, `evidence/bugs/*/manual/` (21 README, 53 ảnh), `rtm.md`.
  - Phần bug-reporter sửa ở `known-issues.md`, `triage.md`.
  - Tài liệu bài học: `docs/learning/09-luong-thanh-toan.md`, `README.md`, `docs/tong-quan-du-an.md`.
- **Nguồn đối chiếu**: `run-results/run-20261126-143604.json` (`error_details`, `annotations`), `known-issues.md` (gồm "Quyết định HITL #3"), `triage.md`, `test-cases.csv`, `spec-review.md`, `q-and-a.md`, `improvements.md`, `viewpoint.csv`, SD-101 / SD-102 `defects.md` (ticket gốc của biến thể), `CLAUDE.md`.
- **Cách kiểm** (theo "Soát đủ mà không tốn thừa": không chạy lại repro hay test vì không có điểm nào đáng ngờ):
  - Tự trích **Expected / Received** của 198 lỗi trong 22 test bug từ `error_details` của run JSON, so nguyên văn với dòng "Lần chạy chính thức" và cột "Thực tế" của từng bug.
  - Tự đếm lại:
    - lần quét 120 giỏ của TC-020: 26 giỏ sai định dạng, tương ứng 20 tổ hợp;
    - BUG-29: quy đổi cent sang `$` cho cả 6 giỏ;
    - severity / priority: 8 High, 7 Medium, 6 Low;
    - số O / IMP / viewpoint cho `tong-quan-du-an.md`.
  - Đọc `repro.ts` (cách so 2 lần, locator riêng), README tái hiện của BUG-22, 23, 25, 29, 30, 34, 35. Grep: cả 21 README ghi "2/2 lần, kết quả giống nhau", 0 README ghi "KHÁC".
  - Xem ảnh BUG-24 đường 3.
  - So priority của 6 biến thể với ticket gốc SD-101 / SD-102.
  - Kiểm neo (anchor) bug trong `rtm.md`.
  - Quét thông tin cá nhân.

## Checklist (mục 5, "Bug report + RTM (defects)")
| Mục | Kết quả |
|---|---|
| Người chưa biết gì tái hiện được trong 2 phút | ✅ Mỗi bug có điều kiện trước chung + riêng, bước đánh số, dữ liệu cụ thể (giỏ, tên, URL, lệnh Console). Bug của tài khoản đặc biệt nói rõ vì sao vào bằng URL (BUG-28 / BUG-31 chặn trang Thông tin). Một lệnh DevTools của BUG-22 chưa đúng như mô tả (D1) |
| Expected trích từ AC / Q&A, không phải ý kiến | ✅ Mỗi "Mong đợi" ghi nguồn: AC-x, Q3 / Q4 / Q5 / Q7 / Q9 / Q12 (+ bổ sung HITL #2), HITL #2-1, quy tắc knowledge-base, MSG-xx |
| Actual mô tả đúng điều thấy được, nguyên văn | ✅ 21/21 bug: dòng "Lần chạy chính thức" khớp **nguyên văn** Expected / Received trong `error_details` (bảng đối chiếu bên dưới). Số đếm lỗi khớp: 18, 20, 21, 8, 3, 5, 11, 12, 7, 1, 2 + 1, 7, 6, 33, 8, 2, 2, 8, 12, 7, 4 |
| Severity tách priority, có lý do, khớp quyết định duyệt | ✅ Mỗi bug có lý do riêng cho severity và priority. BUG-29 High theo HITL #3 (ghi "Critical nếu là hệ thống thật"). 6 biến thể giữ đúng priority ticket gốc: BUG-02 P1, BUG-05 P2, BUG-07 P1, BUG-11 P1, BUG-16 P3, BUG-19 P3 (đã so `defects.md` SD-101, SD-102) |
| Tiêu đề `[Chức năng] hành vi sai` | ✅ 21/21 |
| Môi trường, tần suất, TC / AC, evidence mở được | ✅ Môi trường chung + tái hiện; tần suất 100% (chạy chính thức + 2/2 tái hiện); link evidence tự động + tái hiện cho cả 21 bug. README evidence tự động của 22 test bug được tạo trước khi `evidence.ts` ghi annotation (B1) |
| Biến thể đã thử, tái hiện độc lập tách khỏi tự động | ✅ Script riêng: locator id / class CSS, không dùng Page Object; mỗi tình huống một phiên mới; chạy 2 lần và so từng chữ (`repro-kit.ts` dòng 56). Có đối chứng `standard_user` hoặc thao tác đúng ở BUG-22, 23, 25, 29, 31, 32, 34, 35 (Cancel) |
| Biến thể bug cũ xử lý đúng quy tắc | ✅ 6 biến thể gộp ticket gốc, ghi "(biến thể SD-103)", nêu chỗ phải kiểm khi sửa (vd BUG-02: SD-101 TC-033, SD-102 TC-045, TC-038). Mục "Không đưa vào bug report" đúng: BUG-03 chỉ ghi nhận (Q11), BUG-21 chính là bug cũ (không cấp số), Q14 là cải tiến IMP-12, BUG-37 vẫn trống |
| RTM: mọi AC có TC; số liệu từ lần chạy mới nhất; bug gắn đúng AC | ✅ `run-20261126-143604` + `manual-20261126-1416`; 7/7 AC có TC, 0/7 đạt; TC 31 / 22; 21 bug đang mở, không còn BUG-03; 21 neo trong `rtm.md` trỏ đúng 21 tiêu đề trong `defects.md` (có thêm `<a id="bug-xx">`). TC-035 `✅ Passed (tự động: Passed · tay: Passed)`. Không có cảnh báo |
| Riêng tư | ✅ `defects.md`, `repro.ts`, 21 README tái hiện, `rtm.md`, bài học, `tong-quan-du-an.md`, `README.md`: không có đường dẫn máy, tên máy; mật khẩu lấy từ `tests/data/users.ts` |

## Đối chiếu "Lần chạy chính thức" với `error_details`
| Bug | Điểm đã so | Kết quả |
|---|---|---|
| BUG-07 | `visible`, `1`, `[]` | ✅ |
| BUG-02 | URL `…/checkout-step-one.html`, biến thể 4 `true` | ✅ |
| BUG-26 | `"Checkout: Overview"`, `true` | ✅ |
| BUG-35 | biến thể 1, 2 `true`; biến thể 3 PDF thiếu `Sauce Labs Onesie`, `7.99`, `Total`, `41.02`; biến thể 4 thiếu `32.39`, có Onesie; biến thể 5 `"[4,2]"` → `null` | ✅ |
| BUG-05 | `0` → `2` | ✅ |
| BUG-24 | 3 × `true` | ✅ |
| BUG-36 | `1` → `2`; `visible` | ✅ |
| BUG-16 | `186.019287109375`, `28.980690002441406`, `matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, 0)` | ✅ |
| BUG-28 | `"e"`, `""`, `"Lee"`, `"Checkout: Your Information"` | ✅ |
| BUG-31 | `""`; 3 pageerror `- [/checkout-step-one.html]: Cannot read properties of undefined (reading 'value')`; 3 request | ✅ |
| BUG-23 | `…/cart.html`, `"Your Cart"`; biến thể 4 → 6 | ✅ |
| BUG-34 | 20 = 4 × 5; `…/checkout-step-two.html` | ✅ |
| BUG-32 | `"Error: Postal Code is required"`; `…/checkout-step-two.html` | ✅ |
| BUG-22 | `"input_error form_input error"`, `0` → `1`; 18 = 2 × 9 ô đã nhập ở 6 tổ hợp | ✅ (sửa "6/6" của bug-reporter đúng) |
| BUG-19 | `true`, `1` | ✅ |
| BUG-29 | cent → `$`: `[4]` 5998 / 480 / 6478; `[0]` 1998 / 160 / 2158; `[2]` 1598 / 128 / 1726; `[4,2]` 7596 / 608 / 8204; `[4,0,2]` 9594 / 768 / 10362; cả 6 25988 / 2079 / 28067, tức `$20.79` / `$280.67` | ✅ (bổ sung Tax, Total của bug-reporter đúng) |
| BUG-33 | element not found, `…/checkout-step-two.html`, `"[4,0,2]"`, `wa.cesetRart is not a function` | ✅ |
| BUG-11 | 6 × (`?id=n+1`, tên); Fleece Jacket `ITEM NOT FOUND` | ✅ |
| BUG-25 | 9 chuỗi Item total; biến thể 10: 26 giỏ / 20 tổ hợp (tự đếm từ danh sách trong lỗi) | ✅ |
| BUG-30 | `"[4,0,2]"`, Add to cart `3`, Remove `3`, Tổng quan `3` dòng, `true` | ✅ |
| BUG-27 | `true`, `1` | ✅ |
| BUG-03 (không báo) | TC-046 annotation `5083 ms`, `5104 ms` | ✅ (sửa số của bug-reporter đúng) |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
Không có. Lượt này không chạy lại sản phẩm: mọi giá trị trong report đối chiếu được với run JSON và README tái hiện.

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | README evidence tự động của 22 test bug được tạo lúc `07:11Z → 07:12Z`, **trước** khi `evidence.ts` ghi mục "Ghi nhận (annotation)". Hệ quả: người duyệt mở evidence không thấy các annotation mà `defects.md` dựa vào: `đã quét 120/120 giỏ` (TC-020, điều kiện chấp nhận của TC), nội dung pageerror (TC-014, TC-033), chữ trong PDF (TC-026, TC-051). `defects.md` phải chỉ sang run JSON | `evidence/all-cases/TC-020/README.md`, `TC-014/README.md`: 0 mục "Ghi nhận (annotation)"; chỉ TC-034, TC-048 (`07:35Z`) có. `defects.md` dòng 5 ghi rõ giờ evidence | 🟡 | Chạy lại `npm run test:evidence -- saucedemo-checkout-screen` một lần (≈ 2 phút), sửa dòng 5 của `defects.md` (giờ evidence, bỏ câu "sau lần chạy `run-20261126-135457`") |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | Chú thích ảnh BUG-35 ghi "biến thể 5", nhưng ảnh là `04-gio-bo-o-tab-khac.png`. Đó là (5) theo cách đánh số của `known-issues.md`, tức **TC-051 biến thể 4**; còn "TC-051 biến thể 5" là đăng xuất ở tab khác. Bảng ngay trên dùng cả 2 cách đánh số, nên chú thích dễ hiểu nhầm | `defects.md` dòng 150 | 🟡 | "BUG-35 (5): giỏ bỏ Onesie ở tab khác (TC-051 biến thể 4)" |
| C2 | BUG-22 đã sửa thành "6/6 tổ hợp có ít nhất một ô đã nhập" ở `known-issues.md`, `triage.md`, `defects.md`, nhưng Q9 (`q-and-a.md`) và O-04 (`spec-review.md`) vẫn ghi "7/7 tổ hợp" | `q-and-a.md` dòng 25; `spec-review.md` dòng 54 | 🟡 | Thêm chú thích "(6/6 tổ hợp có ô đã nhập; trống cả 3 thì cả 3 đỏ là đúng, review-defects C2)" ở 2 chỗ. Giữ số 7/7 như lịch sử quan sát cũng được, miễn có chú thích |
| C3 | README tái hiện BUG-29 dòng 3 (đối chứng **`standard_user`**) ghi "(BUG-28 chặn trang Thông tin)". BUG-28 chỉ có ở `problem_user`; câu này do dùng chung mẫu câu của dòng `problem_user` | `evidence/bugs/[id_bug_29]_BUG-29/manual/README.md` dòng 3 | 🟡 | Trong `repro.ts` (BUG-29) chỉ thêm lý do BUG-28 khi tài khoản là `problem_user`; chạy lại `npm run repro -- saucedemo-checkout-screen -g BUG-29` |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | Bước tái hiện BUG-22 ghi "đếm `.error_icon` trong **từng** `.form_group`", nhưng lệnh kèm theo `document.querySelectorAll('.form_group .error_icon').length` đếm **tổng** cả 3 ô (ra 3), không cho biết ô nào có icon | `defects.md` dòng 409 | 🟡 | Dùng lệnh theo từng ô: `[...document.querySelectorAll('.form_group')].map(g => [g.querySelector('input').id, g.querySelector('input').className, g.querySelectorAll('.error_icon').length])` |

## E. Đề xuất quy trình
Không có.

## Tài liệu bài học
| # | File / chỗ | Vấn đề | Mức | Đề xuất |
|---|---|---|---|---|
| L1 | `09-luong-thanh-toan.md` dòng 35; `tong-quan-du-an.md` §12 dòng "Thanh toán: code test" | **Sai số học**: "6 sản phẩm → 63 giỏ × 2 thứ tự = 120 giỏ" (63 × 2 = 126). Đúng: 63 tổ hợp = 6 giỏ 1 sản phẩm (1 thứ tự) + 57 giỏ ≥ 2 sản phẩm × 2 thứ tự = 6 + 114 = **120** (TD-16). `tong-quan-du-an.md` ghi "120 giỏ (63 tổ hợp × 2 thứ tự)", cùng lỗi | 🟡 | Sửa câu ở cả 2 nơi theo cách tính đúng |
| L2 | `09-luong-thanh-toan.md` dòng 29-34 (mẫu code mục 2) | Mẫu code dạy **ngược** quy ước dự án: `expect.soft(await ov.subtotal.innerText()).toBe(…)` là assertion không tự thử lại. `CLAUDE.md` và `script-gen.md` cấm kiểu này, yêu cầu web-first. `Math.round(item * 0.08)` khác code thật `Math.round((item * 8) / 100)` (số nguyên), trong khi mục này dạy "theo cent nguyên" | 🟡 | `await expect.soft(ov.subtotal).toHaveText(\`Item total: ${money(item)}\`)`; `const tax = Math.round((item * 8) / 100)`; tham chiếu `expectedTotals()` trong `tests/data/checkout.ts` |
| L3 | `09-luong-thanh-toan.md` dòng 51 | **Sai trình tự sự việc**: "TC-034 chạy với `timezoneId: 'Asia/Ho_Chi_Minh'` mới thấy … tên file theo UTC (O-47)". Thực tế: executor thấy khi **làm tay TC-035** (tên file `07-12-24`, biên nhận `2:12 PM`), rồi thử 3 múi giờ, reviewer thử thêm 1 (O-47). TC-034 được chạy ở múi giờ khác UTC **sau đó** (review-executor B1), để kiểm `Order Date`; TC-034 không assert giờ tên file | 🟡 | "Làm tay TC-035 thấy tên file theo UTC còn `Order Date` theo giờ trình duyệt; thử 4 múi giờ (O-47). Sau đó TC-034 chạy ở `Asia/Ho_Chi_Minh` để kiểm `Order Date` đúng giờ địa phương (CI chạy UTC sẽ không phân biệt được)" |
| L4 | `09-luong-thanh-toan.md` khung bài | ✅ Đúng khung `CLAUDE.md` (🎯 / 🏭 / 👨‍🏫 / ⚠️ / ✅ / ❓ "Câu hỏi liên quan"). Phần "tự làm" tách mục "👉 Bạn tự làm" giống bài 8. Không có chữ "phỏng vấn". Các số khác đúng: 7 tổ hợp, 26/120 giỏ, ~12 + ~7 ≈ 19 phút, 30 phút, 1 worker, 53 TC, 21 bug, ~25 điểm dương tính (TC-048), L14 / L15 / L16, ai-log #15 | – | – |
| L5 | `tong-quan-du-an.md` §12 dòng "Thanh toán: phân tích yêu cầu" | "15 bug mới + 6 biến thể". Ở bước phân tích, `known-issues.md` có **7** biến thể (thêm BUG-03, chỉ ghi nhận) | 🟡 | "+ 6 biến thể bug cũ (BUG-02, 05, 07, 11, 16, 19) và BUG-03 chỉ ghi nhận". Các số còn lại tự đếm khớp: 7 AC, 47 O (O-01 → O-47), 58 viewpoint (47 trong phạm vi), 14 câu hỏi, 11 cải tiến (IMP-01 → 10, IMP-12); 53 TC, 47/47 viewpoint; 31 + 22, 106/106, 126 giây, 12,2 phút, 30 phút; 21 bug = 8 High + 7 Medium + 6 Low; RTM 7/7, 0/7, 21. §7 dòng 9 "🔄 Đang review bug report, review cuối" đúng thời điểm. `README.md` link bài 9 đúng đường dẫn, đúng thứ tự |
| L6 | `09-luong-thanh-toan.md` dòng 43 | "BUG-35 (6 biến thể …)": `known-issues.md` đánh số (1) → (6), nhưng (3) "Back sau khi đặt" thuộc BUG-24 / BUG-30; TC-051 kiểm **5** biến thể | 🟡 | "BUG-35: tạo đơn từ Tổng quan đã cũ (5 biến thể ở TC-051: 2 tab, sau Reset, thêm / bỏ hàng ở tab khác, đăng xuất ở tab khác)" |

## Việc cần làm trước khi sang bước sau (xếp theo mức độ)
1. 🟡 L1, L2, L3, L5, L6: sửa bài học và `tong-quan-du-an.md` trước khi commit (đây là tài liệu dạy, sai sự thật thì người học làm theo sai).
2. 🟡 B1: chạy lại evidence một lần, sửa dòng 5 `defects.md`.
3. 🟡 C1, C2, C3, D1: sửa câu chữ; C3 chạy lại repro BUG-29.

## Xử lý sau review
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| B1 | 🟡 | Chạy lại evidence để README có annotation; sửa dòng 5 `defects.md` | ✅ | Chạy lại evidence cho 22 test bug (`-g "@BUG"`) với cờ mới `EVIDENCE_KEEP_VIDEOS=1` (`playwright.config.ts`: tắt quay video; `evidence.ts`: README ghi video cũ giữ lại vì cờ này): README có mục "Ghi nhận (annotation)" (vd TC-020 "đã quét 120/120 giỏ"), **video không đổi** (so md5 trước / sau, tránh thêm ~60 MB vào lịch sử git). Dòng 5 `defects.md` ghi rõ ảnh + README `08:36Z` → `08:37Z`, video giữ bản `07:11Z` → `07:12Z` |
| C1 | 🟡 | Chú thích ảnh BUG-35 | ✅ | "BUG-35 (5) giỏ bỏ ở tab khác, TC-051 biến thể 4" |
| C2 | 🟡 | Q9, O-04: chú thích 6/6 | ✅ | Q9 (`q-and-a.md`) và O-04 (`spec-review.md`) thêm câu đính chính 6/6 tổ hợp có ít nhất 1 ô đã nhập |
| C3 | 🟡 | README tái hiện BUG-29: bỏ "BUG-28" ở dòng `standard_user` | ✅ | Sửa nguồn trong `saucedemo-checkout-screen.repro.ts`: chú thích "BUG-28 chặn trang Thông tin" chỉ cho `problem_user`; chạy lại `npm run repro -- saucedemo-checkout-screen -g BUG-29`: `same` 2/2, README dòng đối chứng `standard_user` không còn chú thích sai |
| D1 | 🟡 | Lệnh DevTools BUG-22 theo từng ô | ✅ | Lệnh đếm icon theo từng ô: `[...document.querySelectorAll('.form_group')].map((g) => g.querySelectorAll('.error_icon').length)` (thứ tự First, Last, Zip) |
| L1 | 🟡 | Cách tính 120 giỏ (bài 9, `tong-quan-du-an.md`) | ✅ | Bài 9 và `tong-quan-du-an.md`: 63 tổ hợp = 6 giỏ 1 sản phẩm + 57 giỏ nhiều sản phẩm × 2 thứ tự = 120 (khớp `sweepCarts` trong `checkout.ts`) |
| L2 | 🟡 | Mẫu code bài 9 mục 2: web-first, số nguyên | ✅ | Mẫu code lấy đúng `expectedTotals()` của dự án (cent nguyên, `Math.round((item * 8) / 100)`) và `expect.soft(locator).toHaveText(..., QUICK)` như `expectTotalsText` trong spec |
| L3 | 🟡 | Trình tự phát hiện O-47 trong bài 9 | ✅ | Viết lại theo đúng trình tự: thấy lệch khi làm tay TC-035 → thử 3 múi giờ (reviewer thêm 1) → Q14 → sau đó mới thêm bước múi giờ cho TC-034 (kiểm `Order Date`, tên file chỉ ghi lại) |
| L5 | 🟡 | `tong-quan-du-an.md`: 6 biến thể + BUG-03 ghi nhận | ✅ | "+ biến thể BUG-03 chỉ ghi nhận (hiệu năng, chưa có AC)" |
| L6 | 🟡 | Bài 9: BUG-35 5 biến thể ở TC-051 | ✅ | "TC-051 phủ 5 biến thể: tab kia đã đặt, Reset, thêm / bỏ hàng, đăng xuất ở tab khác" |

## Kiểm lại lượt 2 (2026-11-26)
- **Phạm vi**: `git diff` + file chưa track (`defects.md`, `repro.ts`, bài 9), đối chiếu 10 dòng của bảng "Xử lý sau review".
- **Cách kiểm**: không chạy lại test hay repro. Đã làm:
  - `npm run typecheck`: sạch;
  - so md5 ảnh ở `all-cases/` và bản sao ở `bugs/`;
  - đọc README evidence TC-020 (và so bản ở `bugs/`);
  - đọc README tái hiện BUG-29, `repro.ts` dòng 495-505, dòng 5 / 150 / 409 của `defects.md`, phần sửa của bài 9 và `tong-quan-du-an.md`.

| # | Kết luận | Bằng chứng |
|---|---|---|
| B1 | ✅ **Đồng ý cách làm khác đề xuất** | Mục tiêu của B1 là README evidence có annotation, không phải quay lại video. Cách của bên sửa đạt mục tiêu, không tốn thêm gì:<br>- README TC-020 (`08:37Z`) có mục "Ghi nhận (annotation)", dòng Video ghi rõ video giữ từ lần quay trước;<br>- bản ở `bugs/[id_bug_25]_BUG-25/TC-020/` giống hệt từng byte;<br>- 3 ảnh đổi (TC-026, TC-033, TC-052) có md5 giống bản sao trong `bugs/`.<br><br>Video cũ vẫn là bằng chứng đúng vì code 22 test bug không đổi giữa `07:12Z` và `08:37Z` (thay đổi giữa 2 lần chỉ ở TC-034, `evidence.ts`, config). Dòng 5 `defects.md` ghi rõ ảnh / README và video lấy từ 2 lần chạy khác nhau. Cờ `EVIDENCE_KEEP_VIDEOS` dùng chung được, mặc định tắt nên không đổi hành vi cũ. Lý do không thêm ~60 MB video trùng nội dung vào lịch sử git là hợp lý. Không cần mục "Trao đổi B1". Chi tiết nhỏ ở N1 |
| C1 | ✅ OK | `defects.md` dòng 150: "BUG-35 (5) giỏ bỏ ở tab khác, TC-051 biến thể 4" |
| C2 | ✅ OK | Q9 (`q-and-a.md`) và O-04 (`spec-review.md`) thêm câu đính chính 6/6, giữ số cũ làm lịch sử |
| C3 | ✅ OK | `repro.ts`: chú thích BUG-28 chỉ thêm khi `user === 'problem_user'`. README tái hiện BUG-29 dòng 3 (đối chứng `standard_user`) không còn câu sai; vẫn ghi "2/2 lần, kết quả giống nhau". Chi tiết nhỏ: dòng này còn thừa chữ ". đối chứng" ở cuối thao tác, do ghép nhãn giỏ; không ảnh hưởng nội dung |
| D1 | ✅ OK | `defects.md` dòng 409: lệnh đếm icon theo từng ô (`[...document.querySelectorAll('.form_group')].map(…)`), ghi thứ tự First, Last, Zip |
| L1 | ✅ OK | Bài 9: "6 + 57 × 2 = **120 giỏ**". `tong-quan-du-an.md`: "63 tổ hợp: 6 giỏ 1 sản phẩm + 57 giỏ nhiều sản phẩm × 2 thứ tự" |
| L2 | ✅ OK | Mẫu code là đúng `expectedTotals()` của `checkout.ts` (`Math.round((item * 8) / 100)`), assertion web-first `expect.soft(locator).toHaveText(…, QUICK)` như `expectTotalsText`; có chú thích "không đọc innerText() rồi so" |
| L3 | ✅ OK | Trình tự đúng: làm tay TC-035 thấy lệch → thử 3 múi giờ (reviewer thêm 1, O-47) → Q14 → PO chốt cải tiến → sau đó TC-034 mới chạy ở `Asia/Ho_Chi_Minh` để kiểm `Order Date`, tên file chỉ ghi lại |
| L5 | ✅ OK | "+ 6 biến thể … + biến thể BUG-03 chỉ ghi nhận (hiệu năng, chưa có AC)" |
| L6 | ✅ OK | "TC-051 phủ 5 biến thể: tab kia đã đặt, Reset, thêm / bỏ hàng, đăng xuất ở tab khác" |

### Phát hiện mới
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| N1 | `evidence.ts` ghi lý do "lần này không quay lại: EVIDENCE_KEEP_VIDEOS" dựa vào biến `keepVideo`, mà biến này có nghĩa là "test có bug / kết quả bất thường thì giữ video" (dòng 112), **không** phải cờ `EVIDENCE_KEEP_VIDEOS`. Hiện ra đúng vì chỉ khi bật cờ mới rơi vào nhánh này. Nhưng nếu sau này video của test bug không lưu được vì lý do khác, README sẽ ghi sai lý do | `tests/utils/evidence.ts` dòng 112, 161 | 🟡 | So thẳng `process.env.EVIDENCE_KEEP_VIDEOS` cho câu này (vd `KEEP_VIDEOS ? 'lần này không quay lại: EVIDENCE_KEEP_VIDEOS' : keepVideo ? 'không lưu được video lần này' : 'không quay lại vì test pass'`). Không chặn commit |

### Kết luận lượt 2
**✅ Đạt.** Cả 10 lỗi 🟡 đã sửa đúng; B1 làm khác đề xuất nhưng đạt mục tiêu, reviewer đồng ý. N1 là chi tiết nhỏ, sửa khi tiện, không chặn commit.

## Xử lý sau lượt 2
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| N1 | 🟡 | README evidence: lý do không quay video lấy từ `keepVideo` | ✅ | `evidence.ts`: đọc thẳng `process.env.EVIDENCE_KEEP_VIDEOS`; test có bug mà không lưu được video vì lý do khác thì ghi "lần này không lưu được video mới". Typecheck sạch |
| – | 🟡 | README tái hiện BUG-29: chữ ". đối chứng" thừa cuối thao tác dòng `standard_user` | Giữ | Chỉ là chữ, không đổi nội dung; sửa thì phải chạy lại tái hiện. Ghi nhận, không sửa lần này |
