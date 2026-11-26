# Review: bước executor, SD-103 Thanh toán (Checkout)

- **Ngày**: 2026-11-26 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa** (0 lỗi 🔴, 3 lỗi 🟠, 8 lỗi 🟡)
- **Phạm vi**:
  - Đầu ra của executor: `triage.md`; `run-results/run-20261126-135457.json` (lần chạy chính thức), `stability-20261126-1401.json`, `manual-20261126-1416.json`; `evidence/` (README index, `all-cases/`, `bugs/`, `TC-035/manual/`); `rtm.md` (tạo trước khi có `defects.md`).
  - Các điểm giao executor ở review-script-gen: A2, D3.
  - Rủi ro thời gian CI (R1).
  - Phát hiện mới N1.
  - Thay đổi ngoài bước: `.claude/commands/qa-orchestrator.md`, quy tắc báo tiến độ.
- **Nguồn đối chiếu**: `known-issues.md`, `test-cases.csv`, `q-and-a.md` (Q6, Q11), `spec-review.md` (O-27), `test-data.md` (MSG-08), `.github/workflows/playwright.yml`, `playwright.config.ts`, `scripts/build-rtm.mjs`, `CLAUDE.md`, `.claude/agents/qa-reviewer.md`.
- **Cách kiểm** (theo quy tắc "Soát đủ mà không tốn thừa": không chạy lại cả spec):
  - Tự đếm lại từ run JSON: 53 test, 31 dương tính pass, 22 `expected_status = failed`, số lỗi từng test.
  - Dò mọi `errors` tìm dấu hiệu lỗi bị che: `Timeout`, `Target closed`, `strict mode`, `ReferenceError`, `TypeError`, "Điều kiện trước", "Blocked". Kết quả: **0**.
  - So từng dòng bảng triage với `known-issues.md` (màn hình, severity) và run JSON (số lỗi).
  - Xem ảnh PNG của lần chạy tay TC-035 và 1 ảnh bug (TC-051 biến thể 5).
  - Script Playwright riêng (ngoài repo) đặt hàng + tải biên nhận ở **4 múi giờ** để kiểm N1.
  - Spec thử riêng (ngoài repo) kiểm D3: annotation trong `finally` khi test hết giờ.
  - Quét thông tin cá nhân trong các file mới.

## Checklist (mục 5: kết quả chạy)
| Mục | Kết quả |
|---|---|
| Đọc từng lỗi của từng test | ✅ 22 test bug: mọi lỗi là assertion được đặt tên theo bug; số lỗi giống hệt lượt review-script-gen (18, 20, 21, 8, 3, 5, 11, 12, 7, 1, 2, 1, 7, 6, 33, 8, 2, 2, 8, 12, 7, 4) |
| Test bug fail đúng assertion của bug, không có timeout / locator / lỗi code | ✅ Dò toàn bộ `errors`: 0 dấu hiệu. TC-020 có annotation `đã quét 120/120 giỏ` (điều kiện chấp nhận của TC) |
| Phân loại flaky / script-issue / real-bug có bằng chứng; chạy lặp | ✅ `stability-20261126-1401.json`: cả bộ × 2, 106/106 đúng mong đợi, `not_expected` rỗng. Flaky 0, script-issue 0 |
| Bug đã biết mà bỗng pass | ✅ Không có. TC-046 pass đúng (BUG-03 biến thể chỉ ghi nhận: Cancel 5088 ms, Back Home 5100 ms) |
| Kết quả CI / local | ⚠️ Chưa chạy trên CI (nhánh chưa gộp). Rủi ro thời gian CI là R1 (E1) |
| Bảng triage khớp nguồn | ⚠️ 21 bug, 22 TC: TC, màn hình, số lỗi, severity khớp `known-issues.md` và run JSON từng dòng. Sai ở câu tổng (C2) và cột Actual bị cắt giữa câu (C3) |
| Chạy tay có bằng chứng | ⚠️ TC-035: README, JSON, ảnh khớp nhau; ảnh PNG đúng như mô tả. Chưa nói rõ ai "nhìn bằng mắt" (D1) |
| RTM | ⚠️ Nguồn ghi cả file chạy tay; TC-035 hiện `✅ Passed (tự động: Passed · tay: Passed)` (lỗi biểu tượng N1 của review-script-gen đã sửa). Gắn sai BUG-03 (C1) |
| Riêng tư | ✅ Quét `triage.md`, `rtm.md`, `rtm-report.html`, `run-results/*.json`, `evidence/**/README.md`: không có đường dẫn máy, tên máy, email. Annotation trong run JSON không chứa trường `location` (trường này có đường dẫn máy) |

## Đối chiếu bảng triage
| Điểm | Kết quả |
|---|---|
| Số lỗi từng bug = tổng `errors` của TC trong run JSON | ✅ 21/21 dòng. BUG-24 = TC-028 (2) + TC-029 (1) = 3 |
| Màn hình, severity theo `known-issues.md` | ✅ 22/22 dòng (gồm BUG-03 biến thể). BUG-29 ghi "Critical nếu là hệ thống thật": giữ nguyên chữ của `known-issues.md`, HITL #3 chốt mức |
| BUG-03 (biến thể) không có TC fail | ✅ Đúng chủ ý (Q11): TC-046 phải pass. Có ghi chú dưới bảng |
| Evidence | ✅ 53 thư mục `all-cases`; `bugs/` có **21** thư mục bug, chứa 22 thư mục TC (BUG-24 có TC-028 và TC-029); 44 video = 22 test bug × (all-cases + bugs). Lời dặn nói "22 bug folders" là đếm theo TC |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | **N1: dữ kiện đúng, nhưng phân loại "bug mới BUG-37" chưa có oracle.** Tên file biên nhận theo **UTC**, `Order Date` trong biên nhận theo **giờ máy**. Chưa tài liệu nào quyết điều này: Q6 chỉ chốt PDF "trong phạm vi **mức cơ bản**: tải được, nội dung khớp đơn"; O-27, MSG-08 chỉ ghi dạng tên file `YYYY-MM-DD_HH-mm-ss`, không nói múi giờ; `known-issues.md`, `improvements.md` không nhắc. Theo ISTQB, expected phải lấy từ oracle (AC, Q&A), không lấy từ ý kiến. Tiền lệ cùng chỗ (Q6): chi tiết PDF ngoài mức cơ bản (mất nút sau tải lại, cột `DESCRIPTION`, Unicode) đều được chốt là **cải tiến** (IMP-05, IMP-10) | Tự kiểm 4 múi giờ (`timezoneId`), mỗi múi đặt 1 đơn, đọc chữ trong PDF. Kết quả theo dạng tên file / `Order Date` / giờ trình duyệt: `Asia/Ho_Chi_Minh` `…_07-23-39` / `2:23 PM` / 14:23; `UTC` `…_07-23-41` / `7:23 AM` / 07:23; `America/New_York` `…_07-23-44` / `2:23 AM` / 02:23; `Pacific/Kiritimati` `…_07-23-46` / `9:23 PM` / 21:23. **Tên file luôn UTC; `Order Date` luôn đúng giờ địa phương** ở cả 4 múi. "Ngày hôm sau" (UTC−5 lúc 21:00) là **suy ra** từ phép tính, chưa quan sát trực tiếp (đúng về số học) | 🟠 | **Không cấp BUG-37 ở bước này.** Ghi thành quan sát **O-47** + cải tiến **IMP-12** (không dùng lại IMP-11 đã bỏ), đưa lên HITL #3 thành câu hỏi Q14, đề xuất "cải tiến" theo tiền lệ Q6. Lý do: lệch chỉ ở **siêu dữ liệu tên file**, nội dung đơn đúng; giờ UTC trong tên file là cách làm phổ biến; thiếu hậu tố `Z` mới là điểm gây hiểu nhầm. Nếu PO chốt là bug: **số mới BUG-37** (không có bug cũ nào ở chỗ đặt tên file, không phải biến thể), **Low / P4**. Sửa `triage.md` dòng N1 thành "đề xuất: cải tiến IMP-12; nếu PO coi là bug: BUG-37 Low" |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | `Order Date` **chỉ kiểm có mặt**, không kiểm giá trị, dù Q6 yêu cầu "nội dung khớp đơn vừa đặt". CI chạy ở UTC nên giờ địa phương = UTC, test không phân biệt được biên nhận ghi giờ địa phương hay UTC | `test-cases.csv` TC-034 notes "Order Date chỉ kiểm có mặt"; A1 cho thấy hiện `Order Date` đúng ở 4 múi giờ | 🟡 | Làm **dù N1 được chốt thế nào** (đây là kiểm nội dung, không phải N1): TC-034 (hoặc 1 biến thể) chạy với `timezoneId` khác UTC (vd `America/New_York`), kiểm `Order Date` = giờ trình duyệt lúc bấm (sai số 1 phút, đổi sang dạng `<Tháng> <ngày>, <năm> at <h>:<mm> <AM/PM>`). Test-impl sửa CSV, script-gen sửa code |
| B2 | README evidence của TC-048 không hiện annotation "BUG-21 (SD-102, tham khảo)" (3 báo lỗi ở trang chi tiết). Người duyệt chỉ đọc evidence sẽ không biết TC này có ghi nhận gì | `evidence/all-cases/TC-048/README.md`: chỉ có 1 ảnh bước 4; run JSON có annotation | 🟡 | `run-evidence.mjs` in thêm mục "Ghi nhận (annotation)" vào README từng TC (trừ `fail`), hoặc TC-048 chụp thêm 1 ảnh ở trang chi tiết kèm ghi chú BUG-21 |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | **RTM gắn BUG-03 vào TC-046 và AC-1 → AC-6, liệt kê BUG-03 ở "Bug đang mở"**, trái Q11 ("biến thể BUG-03, **chỉ ghi nhận**, không đưa vào bug report") và trái quy ước `CLAUDE.md` điểm 5 (câu đầu `notes` dành cho bug **TC bắt được**; TC-046 pass). Lặp lại bài học L7 | `rtm.md` dòng tóm tắt "Bug đang mở: … BUG-03 …" và cột Bug của AC-1 → AC-6. Câu đầu `notes` TC-046: "Ghi nhận biến thể BUG-03 (O-37, Q11): test phải PASS…"; `build-rtm.mjs` lấy BUG id từ câu đầu | 🟠 | Test-impl đổi câu đầu `notes` TC-046 thành câu không có BUG id (vd "Test dương tính, phải PASS, KHÔNG dùng test.fail(). Ghi nhận biến thể BUG-03 (O-37, Q11): …"). Tạo lại RTM sau khi có `defects.md`; kiểm "Bug đang mở" còn 21 bug |
| C2 | Câu tổng của triage: "real-bug **22 TC / 22 bug** (15 bug mới + **7** biến thể)". Đếm lại: 22 TC fail ứng với **21 bug** (15 mới + **6** biến thể: BUG-02, 05, 07, 11, 16, 19). BUG-03 biến thể chỉ ghi nhận, không có TC fail, không vào bug report | `triage.md` bảng Summary; bảng Real Bugs có 22 dòng, trong đó dòng BUG-03 ghi "–" | 🟡 | "real-bug: 22 TC / **21 bug** (15 mới BUG-22 → BUG-36 + 6 biến thể); thêm BUG-03 biến thể chỉ ghi nhận (Q11)" |
| C3 | Cột "Actual (tóm tắt)" bị cắt cứng giữa câu, mất ý | BUG-35: "…(3) **Back sau khi đặt**: với"; BUG-25: "…`[4,3,2,1,0]` `$79.9499999999" | 🟡 | Cắt ở cuối câu (hoặc ở dấu `;`), hoặc tóm tắt tay 1 câu; số tiền giữ nguyên vẹn |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | Lần chạy tay TC-035 có lý do M2 "**mắt người** đánh giá bố cục, chữ", nhưng phần "đọc bằng mắt" do agent đọc ảnh PNG. README ghi "đọc bằng mắt", người đọc hiểu là người đã xem | `manual-20261126-1416.json` `reason: M2;M3`, `browser: pdf.js 3.11.174`; README bước 3b. Mình tự xem ảnh PNG: đúng như mô tả (1 trang, chữ rõ, không chồng / cắt, tổng tiền thẳng cột giá, đủ các khối) | 🟡 | README và JSON ghi rõ "đánh giá bằng AI đọc ảnh pdf.js; người duyệt xem lại ảnh ở HITL #3". Kết quả **Passed** giữ được vì ảnh là bằng chứng kiểm lại được |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | **R1: thời gian CI.** Gộp vào `main`, job có `timeout-minutes: 20` (gồm cả cài đặt) chạy 1 worker, `retries: 2` | Tự cộng `duration_ms` của run JSON: 11,9 phút (đo với 9 worker; con số cộng dồn dưới tải nên hơi cao hơn chạy tuần tự). Phần lớn là thời gian chờ **cố định** của assertion mềm trong test bug (TC-020 86 s, TC-038 68 s, TC-009 51 s, TC-005 48 s, TC-003 46 s: mỗi điểm sai chờ 2 s), không phải CPU. Cộng 7,2 phút hiện có ≈ 19 phút + cài đặt ~1–2 phút: **vượt 20 phút**. Test dương tính hết giờ còn bị chạy lại 2 lần (vd TC-019 180 s × 3) | 🟠 | Chọn **(B) nâng `timeout-minutes` lên 30, giữ 1 worker**. Không chọn (A) 2 worker lúc này: (1) thời gian chủ yếu là chờ cố định, chạy song song trên runner 2 vCPU gây tranh CPU, mà các lỗi CI trước đây (TC-043 Logout, TC-006) đều là **race về thời gian** chỉ lộ khi máy chậm; (2) 2 worker còn làm thứ tự xen kẽ khác local. Nếu sau này cần nhanh hơn, dùng **shard** (`--shard=1/2` trên 2 job, mỗi máy vẫn 1 worker) thay vì 2 worker một máy. TC-019 vượt 180 s chỉ xảy ra dưới tải giả (8 bài quét chạy cùng lúc), không đại diện cho CI 1 worker (52–57 s). Người dùng quyết trước khi gộp |
| E2 | Quy tắc mới trong `qa-orchestrator.md` ("Soát đủ mà không tốn thừa") chưa có trong `qa-reviewer.md`. File agent vẫn ghi "Đọc hết, không lướt" (mục 1.1) và "bằng chứng do chính bạn lấy" (1.2). Reviewer làm theo file agent thì sẽ chạy lại cả spec | `.claude/commands/qa-orchestrator.md` mục "Review sau mỗi bước"; `.claude/agents/qa-reviewer.md` mục 1 | 🟡 | Thêm 1 dòng vào `qa-reviewer.md` mục 1 (hoặc mục 2 bước Kiểm chứng): "Khi orchestrator đưa sẵn kết quả chạy: đọc JSON gốc là bằng chứng; chỉ chạy lại `-g` chỗ nghi ngờ; soát sâu theo rủi ro, lướt phần đã pass ổn định; lượt 2 chỉ soát diff". Nội dung bullet orchestrator rõ, không mâu thuẫn `CLAUDE.md` |

## Điểm giao executor ở review-script-gen
| # | Kết luận | Bằng chứng |
|---|---|---|
| A2 | ⚠️ Đóng có điều kiện, xem "Trao đổi A2" | |
| D3 | ✅ Đúng | Executor: hạ timeout TC-020 xuống 40 s, annotation `đã quét 31/120 giỏ` vẫn ghi, `test:run` cảnh báo `Test timeout of`; code đã trả lại (lượt này `git status` không còn thay đổi ở `tests/`). Mình **tự kiểm độc lập** bằng spec thử ngoài repo (`test.fail()` + `setTimeout(3000)` + vòng lặp có `finally`): trạng thái `timedOut`, Playwright tính "fail như mong đợi", annotation `n=9` vẫn có. Kết luận: annotation trong `finally` tin được; executor phải đọc annotation và cảnh báo timeout (đã làm) |

## Thay đổi ngoài bước
| Điểm | Kết luận | Ghi chú |
|---|---|---|
| `.claude/commands/qa-orchestrator.md`: 2 bullet mới ("Vòng bắt buộc trước khi push", "Soát đủ mà không tốn thừa") | ✅ Rõ, nhất quán với `CLAUDE.md` mục Git (hỏi trước commit / push) và mục "Xử lý phát hiện của qa-reviewer" | Thiếu phản ánh sang `qa-reviewer.md` (E2) |
| `CLAUDE.md` mục mới "Báo cáo tiến độ cho người dùng" | ✅ Rõ: 4 phần ✅ / 🔄 / ⏭ / ⚠️, mốc báo, "chưa kiểm chứng thì không ghi xong", ước lượng phải nói là ước lượng | |
| R30 trong tài liệu yêu cầu hệ thống QA (repo học tập), mục 3.2 | ✅ Nội dung khớp `CLAUDE.md` từng ý (mốc báo, 4 phần, ước lượng, không báo "xong" khi chưa kiểm chứng) và **tự tham chiếu R17** ("ngắn gọn (R17)"), nên không mâu thuẫn quy tắc trả lời ngắn | 🟡 X1: cột "Lỗi đã gặp" của R30 ghi lời khen ("cách làm tốt, cần giữ"), khác các dòng khác (ghi lỗi đã gặp). Đề xuất: "Báo tiến độ rải rác, thiếu phần chưa xong, người dùng phải hỏi lại" |
| Độ căng với R17 | 🟡 X2 | "Mỗi lần báo **đủ** 4 phần" dễ bị hiểu là phần trống cũng phải có, làm câu trả lời dài. Đề xuất thêm vào cả 2 nơi: "phần nào không có thì bỏ (thường ⚠️, đôi khi 🔄)" |
| Riêng tư | ✅ | Không có đường dẫn máy, tên máy trong `CLAUDE.md` và trong tài liệu yêu cầu (đã quét). File review này cũng không ghi đường dẫn repo kia |

## Trao đổi A2
- **Phát hiện gốc** (review-script-gen A2, ❓): TC-045 và TC-047 mỗi test đỏ 1 lần, **cùng một đợt lặp** (lượt lặp thứ 2 của đợt `--repeat-each=5`, 9 worker, 17 test). Thông báo lỗi bị mất vì mình dùng reporter `line` và thư mục `test-results` bị lần chạy sau ghi đè.
- **Executor đã thử**: 17 lần mỗi test, 0 lỗi:
  - 1 lần chạy chính;
  - 2 lần kiểm độ ổn định;
  - `--repeat-each=10` có trace;
  - 4 lần chạy cùng 8 bài quét 120 giỏ dưới tải nặng.
- **Khác phát hiện gốc ở đâu**: không khác về cách chạy (cùng chạy song song, có tải). Khác duy nhất là thời điểm: lỗi gốc có thể do web demo / mạng chập chờn đúng lúc đó (2 test khác nhau cùng đỏ trong cùng một lượt).
- **Reviewer tự kiểm lại** (mục 6b): lượt review trước, ngay sau lần đỏ, đã chạy thêm 3 đợt (8 + 6 + 5 lần, JSON reporter): 0 lỗi. Cộng với executor: **0 / 36 lần mỗi test** kể từ lần đỏ.
- **Kết luận**: ⚠️ **đúng một phần**. Lỗi có xảy ra thật (2 / 41 lần, cùng một lượt), nhưng **không có bằng chứng là lỗi code test** và không tái hiện được. Nguyên nhân nhiều khả năng là môi trường (web demo / mạng), không phải mốc chờ: các điểm chuyển trang của 2 test đều dùng phần tử riêng của trang đích (đã soát ở review-script-gen).
- **Chốt ghi lại**:
  1. Đóng A2 với trạng thái "không tái hiện (0/36), nghi môi trường, theo dõi". **Không** ghi là flaky của bộ test, **không** tăng `retries`.
  2. Theo dõi: CI có `retries: 2` + `trace: on-first-retry`. Nếu TC-045 / TC-047 đỏ lại ở bất kỳ đâu thì lấy trace và mở lại A2.
  3. Bài học cho reviewer (ghi vào ghi chú cá nhân, không thành L mới): khi chạy lặp để tìm flaky, **luôn** dùng JSON reporter ra file riêng, để không mất thông báo lỗi.
- **Báo người dùng** (3 ý):
  1. Executor không tái hiện được ở 17 lần; lỗi gốc chỉ xuất hiện 1 lần trong 1 đợt.
  2. Đã chốt đóng có theo dõi, không sửa code.
  3. Phương án tối ưu: để CI theo dõi bằng trace sẵn có, không tốn thêm token chạy lặp.

## Việc cần làm trước HITL #3 (xếp theo mức độ)
1. 🟠 A1: đổi dòng N1 trong `triage.md` thành "O-47 / IMP-12, câu hỏi Q14 cho PO; nếu là bug thì BUG-37 Low"; thêm Q14 vào `q-and-a.md` (mục Màn hình 3) để người duyệt trả lời ở HITL #3.
2. 🟠 C1: sửa câu đầu `notes` TC-046, tạo lại RTM sau `defects.md`.
3. 🟠 E1: người dùng chọn phương án CI trước khi gộp (đề xuất B).
4. 🟡 C2, C3, D1: sửa câu chữ `triage.md`, README / JSON chạy tay.
5. 🟡 B1, B2, E2, X1, X2: gom một lần, không chặn HITL #3 (B1 cần test-impl + script-gen nên làm sau HITL #3 cùng quyết định N1).

## Xử lý sau review
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| A1 | 🟠 | N1 thành O-47 / IMP-12 + Q14; BUG-37 chỉ khi PO chốt là bug | ✅ | `spec-review.md` O-47; `improvements.md` IMP-12; `q-and-a.md` Q14 (Open, hỏi ở HITL #3) + dòng Tổng hợp 14 câu / Open 1; `triage.md` N1 viết lại theo kết luận trao đổi |
| B1 | 🟡 | TC-034 kiểm giá trị `Order Date` ở múi giờ khác UTC | ✅ | TC-034 chạy ở `timezoneId` `Asia/Ho_Chi_Minh` (`RECEIPT_TZ`), so `Order Date` với giờ địa phương lúc bấm Finish ±1 phút (`receiptDate()` trong `checkout.ts`); giờ tên file chỉ ghi annotation (chờ Q14). CSV TC-034 expected bổ sung. Chạy: pass, tên file 07-36-56 (UTC), Order Date 2:36 PM (UTC+7) |
| B2 | 🟡 | Annotation hiện trong README evidence (TC-048) | ✅ | `evidence.ts` `finish()` ghi mục "Ghi nhận (annotation)" cho **mọi** test có annotation (trừ `fail`); dòng "Nhóm" bỏ tên describe rỗng. README TC-048 hiện "BUG-21 (SD-102, tham khảo)", TC-034 hiện "Tên file" |
| C1 | 🟠 | Câu đầu `notes` TC-046 không chứa BUG-03; RTM tạo lại | ✅ | Câu đầu `notes` TC-046: "Test phải PASS, KHÔNG dùng test.fail(): chỉ ghi nhận thời gian (O-37, Q11)."; BUG-03 chuyển sang câu sau. RTM tạo lại: không còn BUG-03. RTM cuối tạo lại sau `defects.md` |
| C2 | 🟡 | Câu tổng triage: 22 TC / 21 bug (15 + 6) + BUG-03 ghi nhận | ✅ | "22 TC / 21 bug: 15 bug mới + 6 biến thể (BUG-02, 05, 07, 11, 16, 19); BUG-24 có 2 TC; BUG-03 chỉ ghi nhận" |
| C3 | 🟡 | Cột Actual không cắt giữa câu | ✅ | Bảng tạo lại từ `known-issues.md`, giữ nguyên câu đầu, không cắt ký tự |
| D1 | 🟡 | Ghi rõ ai đánh giá phần "bằng mắt" của TC-035 | ✅ | README manual + `manual-*.json` (`judged_by`): executor (AI) đọc ảnh trang do pdf.js vẽ, qa-reviewer xem lại đồng ý, người dùng xem lại ở HITL #3 |
| E1 | 🟠 | Người dùng chọn phương án thời gian CI | ✅ | Người dùng chọn **B** (2026-11-26): giữ 1 worker, nâng `timeout-minutes` lên 30. Sửa `.github/workflows` cùng đợt |
| E2 | 🟡 | `qa-reviewer.md` phản ánh quy tắc "Soát đủ mà không tốn thừa" | ✅ | `qa-reviewer.md` mục 1 nguyên tắc 1: thêm đoạn "Soát đủ mà không tốn thừa" (phạm vi được giao, chạy lại bằng `-g`, đào sâu theo rủi ro, lượt 2 soát `git diff`, chạy lặp ghi JSON ra file riêng) |
| X1 | 🟡 | R30 cột "Lỗi đã gặp" | ✅ | R30 cột "Lỗi đã gặp": người dùng phải hỏi lại nhiều lần "tiến độ", "review tới đâu rồi", "xong chưa" khi AI chỉ báo lúc xong hẳn |
| X2 | 🟡 | "Phần nào không có thì bỏ" ở `CLAUDE.md` và R30 | ✅ | Thêm "phần nào không có nội dung thì bỏ hẳn" ở `CLAUDE.md` và R30 (dẫn R17) |
| A2 | – | Đóng có theo dõi (mục "Trao đổi A2") | ✅ | Ghi vào `triage.md` mục "Điểm review giao executor": đóng ở trạng thái không tái hiện, nghi môi trường, theo dõi |

## Kiểm lại lượt 2 (2026-11-26)
- **Phạm vi**: `git diff` (code, CSV, tài liệu) và các file chưa track (`triage.md`, `rtm.md`, `run-results/run-20261126-143604.json`, `evidence/`); repo học tập: chỉ dòng R30.
- **Cách kiểm**: đọc diff; tự đếm lại run JSON mới (53/53, 22 `expected_status = failed`, số lỗi từng test giống hệt lần trước, 0 dấu hiệu lỗi code test, tổng thời gian 12,2 phút); đọc README evidence TC-034, TC-048 mới sinh; câu đầu `notes` TC-046 tách bằng đúng quy tắc của `build-rtm.mjs`. Không chạy lại test (dữ kiện chạy đã có, không có điểm nghi ngờ).
- **Lưu ý**: bảng "Xử lý sau review" ở trên **vẫn trống** trong file hiện tại (không có câu ✅ nào để đối chiếu). Mình kiểm thẳng trên diff và **không đụng** vào bảng; bên sửa cần điền lại (có thể bản điền trước đã bị ghi đè).

| # | Kết luận | Bằng chứng |
|---|---|---|
| A1 | ✅ OK | `q-and-a.md` thêm Q14 (Open, đề xuất cải tiến, nếu là bug thì BUG-37 Low), dòng Tổng hợp 14 câu / Open 1; `spec-review.md` thêm O-47 (4 múi giờ, ghi rõ "ngày hôm sau" là suy ra); `improvements.md` thêm IMP-12 (không dùng lại IMP-11); `triage.md` dòng N1 ghi "chưa có oracle", chờ Q14 |
| B1 | ✅ OK | TC-034 chạy trong `test.describe` không tên với `timezoneId = Asia/Ho_Chi_Minh`; `Order Date` so với `receiptDate()` lúc bấm Finish, chấp nhận 3 giá trị (−1 / 0 / +1 phút). Test **phân biệt được** đúng / sai: nếu biên nhận in UTC thì sẽ là `7:36 AM` thay vì `2:36 PM`. Giờ tên file chỉ ghi annotation, không assert (đúng vì Q14 còn mở). CSV TC-034 expected ghi thêm điều kiện này. Run mới: TC-034 pass, annotation đúng như dữ kiện. Ghi chú nhỏ, không bắt buộc: múi giờ này trùng múi giờ máy dev; một múi khác cả UTC lẫn máy dev (vd `America/New_York`) thì chạy local cũng phát hiện được trường hợp trang dùng giờ máy thay vì giờ trình duyệt |
| B2 | ✅ OK | `evidence.ts` thêm mục "Ghi nhận (annotation)" cho **mọi** feature: chỉ in `type` và `description` (không in `location`, trường chứa đường dẫn máy), bỏ `fail`, thoát `\|` và xuống dòng nên không vỡ bảng. `filter(Boolean)` cho describe không tên: README TC-034 vẫn ghi "Nhóm: Màn hình 3", index evidence xếp đúng nhóm. README TC-048 hiện dòng "BUG-21 (SD-102, tham khảo)". An toàn cho SD-101 / SD-102: lần chạy evidence sau chỉ thêm mục này |
| C1 | ✅ OK | Câu đầu `notes` TC-046: "Test phải PASS, KHÔNG dùng test.fail(): chỉ ghi nhận thời gian (O-37, Q11)", không còn BUG id. `rtm.md` mới: "Bug đang mở" 21 bug, không có BUG-03; TC-046 ở AC-1 → AC-6 cột Bug là "–" |
| C2 | ✅ OK | "22 TC / 21 bug: 15 mới + 6 biến thể …; BUG-03 chỉ ghi nhận" |
| C3 | ✅ OK | Cột Actual của BUG-35, BUG-25 kết thúc ở cuối câu, số tiền đủ (`$79.94999999999999`) |
| D1 | ✅ OK | README và JSON chạy tay ghi "executor (AI) đọc ảnh trang do pdf.js vẽ; qa-reviewer xem lại cùng ảnh, đồng ý; người dùng xem lại ở HITL #3" (đúng: mình đã xem ảnh ở lượt 1). Dòng TC-035 trong `triage.md` chưa nhắc điều này nhưng có link tới README, chấp nhận |
| E1 | ⏳ Chờ người dùng (HITL #3) | Không phải việc của bên sửa. `triage.md` dòng R1 ghi đủ 2 phương án và đề xuất B của reviewer |
| E2 | ✅ OK | `qa-reviewer.md` mục 1 thêm đoạn "Soát đủ mà không tốn thừa": "đọc hết" là đọc hết phạm vi được giao, dùng run JSON có sẵn, chỉ chạy lại `-g` khi nghi ngờ, lượt 2 chỉ soát diff, chạy lặp thì ghi JSON ra file riêng. Không mâu thuẫn mục 1.2 vì đọc JSON gốc vẫn là bằng chứng tự lấy |
| X1 | ✅ OK | R30 cột "Lỗi đã gặp" nay mô tả vấn đề (người dùng phải hỏi lại nhiều lần "tiến độ", "xong chưa"), kèm ghi chú người dùng chốt giữ cách làm |
| X2 | ✅ OK | `CLAUDE.md` và R30 cùng thêm "phần nào không có nội dung thì bỏ hẳn, không ghi 'không có'". Hai nơi khớp nhau, R30 dẫn R17 |
| A2 | ✅ OK | `triage.md` ghi đúng thỏa thuận ở "Trao đổi A2" (0/17 + 0/19, đóng ở trạng thái không tái hiện, nghi môi trường, theo dõi) |
| Riêng tư | ✅ OK | Quét `CLAUDE.md`, `qa-reviewer.md`, `qa-orchestrator.md`, các file `qa-runs/` thay đổi / mới, R30: không có đường dẫn máy, tên máy |

### Phát hiện mới
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| N1 | `triage.md` dòng R1 vẫn ghi "tổng thời gian … **11,9 phút** (lần chạy này)", nhưng "lần chạy này" nay là `run-20261126-143604` với tổng **12,2 phút** (tự cộng `duration_ms`) | `triage.md` dòng R1; run JSON mới | 🟡 | Sửa thành 12,2 phút (kết luận R1 không đổi: ≈ 19,4 phút + cài đặt, vẫn vượt 20 phút) |
| N2 | Bảng "Xử lý sau review" trống (xem lưu ý trên) | File review hiện tại | 🟡 | Bên sửa điền lại từng dòng (✅ cho A1, B1, B2, C1, C2, C3, D1, E2, X1, X2, A2; ⏳ cho E1), không sửa phần khác của file |

### Kết luận lượt 2
**✅ Đạt**: cả 2 lỗi 🟠 bên sửa phải làm (A1, C1) và 8 lỗi 🟡 đã sửa đúng; E1 là quyết định của người dùng ở HITL #3 (đề xuất B). Có thể sang HITL #3 sau khi làm 2 việc nhỏ: sửa con số ở R1 (N1) và điền bảng "Xử lý sau review" (N2).

## Xử lý sau lượt 2
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| N1 | 🟡 | `triage.md` R1: số phút của lần chạy mới | ✅ | "12,2 phút (lần chạy này; lần trước 11,9 phút)" |
| N2 | 🟡 | Bảng "Xử lý sau review" trống | ✅ | Điền lại. **Nguyên nhân thật**: lỗi script điền bảng của bên sửa (regex trong template literal mất dấu gạch chéo ngược, chữ bị chèn vào dòng tiêu đề), không phải reviewer ghi đè; cùng lỗi ở `review-script-gen.md` (đã sửa cả 2 file). Script mới điền theo từng ô, dừng nếu không thấy dòng |

## Kiểm lại lượt 3 (2026-11-26)
Phạm vi: chỉ `git diff` của các sửa nhỏ sau lượt 2, không chạy test.

| # | Kết luận | Bằng chứng |
|---|---|---|
| 1. Hai file review | ✅ OK | **`review-script-gen.md`**:<br>- Dòng tiêu đề trở lại `# Review: bước script-gen, SD-103 Thanh toán (Checkout)`; diff cho thấy chuỗi ghi chú bị chèn đã gỡ hết.<br>- Bảng 17 dòng điền đủ, mỗi ô ghi chú khớp với cái mình đã kiểm ở lượt 2 của file đó.<br>- A2, D3 ghi "✅ Executor" kèm kết quả: A2 0/36 lần, đóng có theo dõi; D3 "31/120", reviewer kiểm độc lập.<br>- N3 đính chính đúng nguyên nhân.<br>- Ngoài 3 chỗ đó, phần thân file không đổi.<br><br>**`review-executor.md`**:<br>- Dòng tiêu đề đúng, mỗi file còn đúng 1 tiêu đề `#`.<br>- Không còn dòng dài bất thường ngoài bảng.<br>- Bảng 12 dòng điền đủ.<br>- Bảng "Xử lý sau lượt 2" ghi N1, N2 kèm nguyên nhân thật.<br><br>Câu "có thể bản điền trước đã bị ghi đè" trong lượt 2 của mình là phỏng đoán có rào trước, nay đã có đính chính ngay bên dưới, giữ nguyên làm lịch sử.<br><br>Lưu ý: bản lỗi của `review-script-gen.md` vẫn nằm trong commit `0195e69`. Commit sửa nên ghi rõ "sửa dòng tiêu đề bị chèn do script điền bảng" |
| 2. `docs/ai-log.md` #15 | ✅ OK | Nối đúng số sau #14. Chuyện xảy ra, cách phát hiện, cách xử lý khớp với diff thật: tiêu đề hai file, bảng, đính chính N3 / N2. Bài học "đọc lại kết quả sau khi sửa file bằng script; kiểm phần việc của mình trước khi đổ lỗi" đúng trọng tâm. Không có thông tin cá nhân. Chi tiết nhỏ: có 2 dòng trống trước tiêu đề #15 (các mục khác 1 dòng), không cần sửa |
| 3. CI `timeout-minutes` | ✅ OK | `playwright.yml`: 20 → 30, chú thích ghi lý do và quyết định B của người dùng. `playwright.config.ts` không đổi (CI vẫn 1 worker), đúng phương án B. Dòng E1 trong bảng ✅ khớp |
| 4. `triage.md` R1 | ✅ OK | "**12,2 phút** (lần chạy này; lần trước 11,9 phút)". Khớp tổng `duration_ms` của `run-20261126-143604` mình tự cộng ở lượt 2 |
| Riêng tư | ✅ OK | Quét `docs/ai-log.md`, `playwright.yml`, 4 file review, `triage.md`: không có đường dẫn máy, tên máy |

**Kết luận lượt 3: ✅ Đạt.** Không có phát hiện mới. Bước executor sẵn sàng cho HITL #3.
