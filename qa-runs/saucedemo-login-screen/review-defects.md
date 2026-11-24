# Review: defects, saucedemo-login-screen
- 2026-11-24 · Reviewer: qa-reviewer · Kết luận: ⚠️ Cần sửa

> Phạm vi: `defects.md`, `rtm.md`, `rtm-report.html`, `scripts/build-rtm.mjs`. Đối chiếu với requirement, q-and-a, known-issues, viewpoint.csv, test-cases.csv, triage.md, `run-results/run-20261124-150906.json`, evidence/, spec.
> Kiểm chứng trên web: Node script dùng `chromium` của `@playwright/test`, mỗi lần kiểm tra một context mới, đóng trình duyệt sau khi xong, script đã xóa.

**Những phần đã đạt, không cần sửa**
- Mọi link tương đối trong `defects.md` và `rtm.md` đều trỏ tới file có thật. 4 anchor `defects.md#bug-0x-...` khớp heading theo quy tắc slug của GitHub (file ở dạng NFC, xuống dòng LF).
- Số liệu RTM khớp nguồn: 33 TC, 31 Passed / 2 Failed (TC-028, TC-033) khớp `triage.md:10-11`. Số viewpoint và số TC của từng AC đều khớp `viewpoint.csv` và `test-cases.csv` (TC gắn 2 AC được tính ở cả 2 AC). Có 20 viewpoint trong phạm vi, 5 viewpoint ngoài phạm vi, viewpoint nào cũng có nguồn quyết định.
- Severity khớp HITL #3 (`triage.md:14`: BUG-01 Low, BUG-02 High). Cột "Liên quan" (AC, TVP, TC, Q, O) khớp q-and-a và known-issues. Phiên bản Playwright 1.65.1 khớp `node_modules`. Spec có `test.fail()` kèm BUG id ở dòng 142 và 235.
- Đã làm lại bước tái hiện BUG-01 và BUG-02 theo `defects.md` trên trình duyệt sạch: **cả 2 bug đều tái hiện được**.

## A. Phát hiện mới (kiểm chứng trên web nếu có thể)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | BUG-01 rộng hơn mô tả. Ở chiều ngược lại (trống Username, có Password), **ô Password đã nhập cũng bị gắn `input_error`**. Thực tế web luôn tô đỏ **cả 2 ô** với mọi lỗi "required". `defects.md:27-34` chỉ mô tả chiều R2. TC-011 (R3) không kiểm tra class nên không bắt được. Nếu dev chỉ sửa ô Username thì TC-028 sẽ pass dù lỗi vẫn còn ở R3 | Chạy trên web: R2 `standard_user` + trống mật khẩu → class của Username và Password đều là `input_error form_input error`. R3 trống Username + có mật khẩu → class của **Password** cũng là `input_error form_input error` | 🟠 | Sửa Actual / tiêu đề BUG-01 thành "chỉ thiếu 1 ô mà cả 2 ô đều bị đánh dấu lỗi" và ghi thêm biến thể R3. Quay lại test-impl: thêm TC cho R3 (hoặc tách TC-028 thành 2 bộ dữ liệu). Người duyệt chốt ở HITL |
| A2 | BUG-02 đã được kiểm chứng trên **6 trang bên trong**, chứ không chỉ 2 trang như `defects.md:62` ghi. Bằng chứng còn củng cố "nguyên nhân dự đoán" (`defects.md:64`) | Cookie tạo bằng `document.cookie` vào được: `/inventory.html` (6 sản phẩm), `/cart.html`, `/inventory-item.html?id=4`, `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html`. Trang nào cũng giữ nguyên URL và không có thông báo lỗi. Cookie thật sau khi đăng nhập có `httpOnly:false`, `secure:false` | 🟡 | Ghi danh sách trang đã thử vào Actual, kèm nhận xét cookie không có `HttpOnly` (thứ JS đọc và ghi được) |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | Ý "tái hiện bằng tay" và "vào được cả `/checkout-step-one.html`" **không có bằng chứng lưu lại**. Link "Ảnh + video" trong phần tái hiện độc lập lại trỏ tới evidence do test tự động sinh ra, không phải ảnh tái hiện bằng tay | `defects.md:22,50,62`. `triage.md:33-37`. README trong `evidence/bugs/.../TC-028` và `TC-033` mang tag `@AC-3 @BUG-01` / `@AC-6 @BUG-02`, tức được sinh từ `npm run test:evidence` | 🟠 | Lưu ảnh tái hiện bằng tay (ít nhất ảnh trang checkout khi dùng cookie giả) vào thư mục riêng, ví dụ `evidence/bugs/<ticket>_BUG-02/manual/`, rồi link từ defects. Nếu không có ảnh thì bỏ phần khẳng định chưa có bằng chứng |
| B2 | Bước 2 tái hiện BUG-02 có thể làm người mới bị kẹt. Chrome chặn dán vào Console với người chưa dùng DevTools (phải gõ `allow pasting` trước). Điều kiện "trình duyệt sạch" chưa nói cách làm | `defects.md:53,57`. Điểm này dựa trên hành vi đã biết của Chrome, chưa kiểm chứng bằng script | 🟡 | Ghi chú: "gõ tay lệnh, hoặc gõ `allow pasting` rồi mới dán". Thêm cách khác: DevTools → Application → Cookies → thêm `session-username`. Trình duyệt sạch = mở cửa sổ ẩn danh mới |
| B3 | Priority chưa có lý do riêng. Lý do đang ghi là lý do của Severity (ảnh hưởng), chưa nói vì sao sửa sớm hay muộn | `defects.md:20,48` | 🟡 | Thêm lý do Priority, ví dụ BUG-01 P3: có cách đi vòng, không chặn đăng nhập. BUG-02 P1: chặn release nếu là hệ thống thật |
| B4 | Tần suất "3/3 lần chạy" chỉ truy được 1 lần. 2 lần lặp `--repeat-each=2` không lưu kết quả | `defects.md:22,50`. `triage.md:5`. Trong `run-results/` chỉ có 1 file JSON | 🟡 | Lưu JSON của lần lặp, hoặc ghi rõ "1 lần chạy có lưu + 2 lần lặp (triage.md:5) + tái hiện bằng tay" |
| B5 | RTM thiếu chỉ số mà bước 7 yêu cầu: số TC flaky và số TC needs-manual-fix. Chỉ số "% AC có ≥1 TC pass" được thay bằng "AC đạt (mọi TC Passed)" mà không ghi chú vì sao đổi | `.claude/commands/qa-orchestrator.md:141`. `rtm.md:9-13` | 🟡 | Generator in thêm dòng flaky / needs-manual-fix (đọc từ run JSON và triage). Giữ chỉ số "mọi TC Passed" (chặt hơn) nhưng cập nhật spec của orchestrator cho khớp |
| B6 | Mục BUG-03 có nhắc IMP-03 nhưng không có link | `defects.md:77` | 🟡 | Link `improvements.md` giống cách BUG-04 đang link `known-issues.md` |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | Run JSON ghi `passed: 33, failed: 0, expected_fail: 2` còn RTM ghi Passed 31 · Failed 2. Về nghĩa thì đúng (`triage.md:11` có giải thích), nhưng `rtm.md` không có chú thích. Người đọc đối chiếu với JSON sẽ thấy lệch | `run-20261124-150906.json` (summary). `rtm.md:11` | 🟡 | Generator in thêm ghi chú: "N TC có `test.fail()` (Playwright báo passed) được tính là Failed theo expected của TC". Nên thêm bước tự đối chiếu `run.summary.total` |
| C2 | Evidence của bug không thuộc lần chạy mà defects nêu. `defects.md:3` ghi bug lấy từ `run-20261124-150906` (15:09 giờ +07), nhưng README evidence ghi thời điểm `2026-11-24T10:23Z` (17:23 giờ +07), tức là một lần chạy `test:evidence` khác và không có file trong `run-results/` | `defects.md:3`. `evidence/bugs/*/TC-0xx/README.md` dòng "Thời điểm" | 🟡 | Ghi rõ evidence lấy từ lần chạy `test:evidence` lúc 17:23, hoặc lưu JSON của lần chạy đó |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | Kết quả `Skipped` bị tính là đạt. TC bị skip không được tính vào Failed, cũng không vào "Not run", nên **AC vẫn hiện ✅ Đạt**. Dòng tổng TC cũng không in số Skipped nên các số cộng lại không ra tổng. Như vậy RTM che luôn việc dùng `test.skip` để giấu bug, trái quy tắc trong CLAUDE.md | `build-rtm.mjs:42-44` (chỉ xét `Failed` và `=== 'Not run'`), `:49,73`, `:151` | 🟠 | Coi Skipped (và Not run) là `partial` (⚠️), in thêm "Skipped n" ở phần tóm tắt |
| D2 | Trường hợp `Passed (bug có vẻ đã sửa?)` (test có `test.fail()` mà lại pass) được đếm không thống nhất. Phần tóm tắt đếm là Passed (`startsWith`), còn số Passed theo AC dùng `===` nên bỏ qua. Kết quả là Passed + Failed < TC, AC hiện ✅ Đạt không có cảnh báo, trong khi bug vẫn nằm ở "Bug đang mở" | `build-rtm.mjs:45` so với `:49,150` | 🟡 | Thêm trạng thái AC riêng "⚠️ Cần xác nhận bug đã sửa", đếm dùng chung một hàm |
| D3 | "Bug đang mở" được lấy từ cột `notes` của TC, không đọc cột Trạng thái trong `defects.md`. Bug đã Closed, hoặc BUG-xx bị loại ở HITL #3 mà notes vẫn còn, vẫn bị hiện là "đang mở" | `build-rtm.mjs:33,50,75` | 🟡 | Đọc bảng tổng hợp trong `defects.md` để lấy trạng thái. Chỉ coi là bug những BUG-xx có trong defects |
| D4 | Generator chọn run JSON mới nhất theo tên file và bỏ qua `scope`. Khi executor chạy lại một nhóm TC (vòng healer), những TC còn lại sẽ thành "Not run" hàng loạt. Run có TC không có trong CSV cũng bị bỏ qua mà không báo | `build-rtm.mjs:25,28` | 🟡 | Ưu tiên run `scope: full` mới nhất, hoặc lấy kết quả mới nhất của từng TC. Cảnh báo khi có TC lạc (có trong run, không có trong CSV) |
| D5 | Generator dễ vỡ ở 2 chỗ. Hàm `slug()` bỏ ký tự `_` và dấu kết hợp (`\p{M}`), trong khi GitHub giữ lại cả hai, và không xử lý heading trùng (thêm `-1`). Bảng markdown không escape ký tự `\|`. Hiện chưa gây lỗi, 4/4 anchor đang khớp | `build-rtm.mjs:161`, `:80,89,96` | 🟡 | Giữ `\p{M}` và `_` trong regex. Escape `\|` trong mọi ô bảng |
| D6 | Link trong `rtm-report.html` chưa tốt. Cột Bug ở bảng "Theo AC" không có link. Bảng "Chi tiết" link tới `defects.md` không có anchor. Link `.md` mở trong trình duyệt chỉ hiện text thô | `build-rtm.mjs:126,129` | 🟡 | Thêm anchor giống bản md. Ghi chú trong HTML rằng link `.md` nên xem trên GitHub |
| D7 | Ảnh evidence BUG-01: khung khoanh vùng màu đỏ trùng với triệu chứng "viền đỏ" của bug. Người xem khó phân biệt đâu là khung khoanh, đâu là lỗi | `evidence/bugs/[id_bug_1]_BUG-01/TC-028/02-ket-qua-bug.jpg` | 🟡 | Khoanh vùng bằng màu khác (xanh hoặc tím) cho những bug về màu lỗi, hoặc ghi chú "khung dày là khoanh vùng" |
| D8 | Tiêu đề BUG-01 thiếu điều kiện xảy ra lỗi ("dù đã nhập" nhưng không nói trong tình huống nào) | `defects.md:9,16` | 🟡 | Ví dụ: `[Login] Chỉ thiếu 1 ô nhưng cả 2 ô đều bị đánh dấu lỗi` (gộp với A1) |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Khi đổi `[id_bug_n]` sang ticket thật, `defects.md:4` chỉ nhắc sửa defects và `bugs.ts`. Còn các chỗ khác cũng phải sửa theo: tên thư mục `evidence/bugs/[id_bug_n]_...`, link ở `defects.md:36-38,66-68`, `triage.md:36-37`, `evidence/README.md` | `defects.md:4`. `tests/data/bugs.ts` | 🟡 | Ghi rõ các bước: sửa `bugs.ts` → chạy `npm run test:evidence` → sửa link → grep `[id_bug_` cả repo phải ra 0 kết quả |
| E2 | Ảnh tái hiện bằng tay và ảnh test tự động chưa được tách riêng (liên quan B1) | `triage.md:33` | 🟡 | Đưa vào checklist bước defects: tái hiện bằng tay thì phải lưu ảnh vào `manual/` và ghi lần chạy, giờ chạy |
| E3 | Generator RTM chưa tự kiểm tra số liệu | `build-rtm.mjs:49-57` | 🟡 | Thêm cảnh báo khi `passed + failed + skipped + notRun != tc` hoặc khi số TC khác `run.summary.total` |

## Xử lý sau review (2026-11-24)
| # | Xử lý |
|---|---|
| A1 | ✅ Tái hiện cả 2 chiều (`evidence/bugs/[id_bug_1]_BUG-01/manual/`), viết lại tiêu đề và mô tả BUG-01. Người duyệt chọn **không thêm TC mới**: sửa TC-028 kiểm tra cả 2 chiều (`expect.soft`), cập nhật test-cases.csv, viewpoint TVP-016, known-issues, triage, chụp lại evidence cả 2 chiều. Kiểm chứng: bỏ `test.fail()` thì test fail đúng 2 chỗ (chiều 1 và chiều 2) |
| A2, B1, E2 | ✅ Ảnh tái hiện bằng tay trên 4 trang trong `manual/`, liệt kê đủ 6 trang và `httpOnly: false` trong BUG-02 |
| B2 | ✅ Thêm cửa sổ ẩn danh và `allow pasting` vào bước tái hiện |
| B3 | ✅ Priority có lý do riêng |
| B4, C2 | ✅ Ghi rõ nguồn tần suất và lần chụp evidence. Chỉ 1 lần chạy có file kết quả: chấp nhận |
| B5, D1–D6, E3, C1 | ✅ Sửa `build-rtm.mjs`: skip / flaky / chưa chạy / "bug có vẻ đã sửa" không tính AC đạt; thêm số Skipped, Flaky, cần làm tay; cảnh báo khi run không full, số TC lệch, TC thừa; bug mở đọc trạng thái từ `defects.md`; escape `\|`; slug giữ `_`; link bug có anchor trong HTML; chú thích `test.fail()`. Kiểm chứng: cố tình skip TC-001, xóa TC-026, cho TC-028 pass → RTM báo đúng cả 3 |
| B6, D8, E1 | ✅ Link `improvements.md`, tiêu đề BUG-01 nêu tình huống, thêm mục "Khi log ticket thật" |
| D7 | ⏭ Backlog: khung khoanh vùng đổi màu khác đỏ (cần chụp lại toàn bộ evidence) |
