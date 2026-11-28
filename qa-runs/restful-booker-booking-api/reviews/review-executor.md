# Review: bước executor, RB-102 Restful Booker booking (POST / GET / PUT / PATCH / DELETE `/booking`)

- **Ngày**: 2026-11-28 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa** (0 lỗi 🔴, 1 lỗi 🟠, 5 lỗi 🟡, 0 ❓). Kết quả chạy và phân loại **đúng**; cần bổ sung tài liệu cho HITL #3 (B1) và sửa vài con số cũ. Không cần chạy lại test.
- **Phạm vi**:
  - `run-results/run-20261128-052139.json` (lần chạy chính thức, `--include-full`), `triage.md`, `evidence/` (104 README + mục lục).
  - Bảng "Ước lượng số request mỗi lần chạy" trong `test-data.md` (`git diff`, việc D1 của review script-gen giao cho executor; thay đổi tài liệu duy nhất của executor).
  - Điểm giao executor ở `reviews/review-script-gen.md`: D1 (bảng ước lượng), N1 (chạy chính thức có `--include-full`).
- **Nguồn đối chiếu**: `known-issues.md` (BUG-41 → BUG-60), `q-and-a.md` (Q9), `requirement/requirement.md` (AC-2, AC-8), `test-cases.csv` (TC-067), `tests/specs/restful-booker-booking-api.spec.ts`, `tests/api/restful-booker.teardown.ts`, `tests/data/bugs.ts`, `.claude/agents/executor.md`, `CLAUDE.md`, `qa-reviewer.md` mục 5 và L15, L17, L18.
- **Cách kiểm** (không gửi request nào lên máy chủ; không chạy `test:run`, `test:evidence`, `EVIDENCE=1`):
  - Tự đếm lại từ run JSON bằng script: 69 test; 34 `passed`/`passed`, 35 `failed`/`expected_status = failed`; `outcome` 69/69 `expected`. Cộng annotation `requests`: **962** request, **0** đăng nhập thất bại; teardown "159 booking trong sổ, dọn sót 0 · 962 request · teardown 15 request". Tổng thời gian 390 591 ms. Annotation `cleanup`: 59 + 1 `cleanup BUG-51`, mọi id `DELETE 201` / `GET 404` / "hết"; 0 annotation `env-reset`.
  - Đọc **đủ 263** `error_details` của 35 TC `test.fail()`. Dò `Timeout`, `TypeError`, `ReferenceError`, cổng cứng, `ResetSuspect`, `EnvError`, `503`, `strict mode`, `ECONN`: **0**. Chữ `undefined` xuất hiện 4 lần, đều là Received của assertion bug khi phản hồi không phải JSON (TC-026: 418 `text/plain`; TC-064: X đã 404), không phải lỗi code.
  - Đọc kỹ theo rủi ro: TC-026 (BUG-60), TC-013 `@full`, TC-050, TC-051, TC-055, TC-065, TC-062, TC-064, TC-023, TC-037, TC-038; test pass: TC-030, TC-067 `@full`, TC-069. Đọc code `patchRefused` / `writeVariants` (khôi phục mốc giữa các biến thể) và `rejectMatrix` / `checkRejectMatrix`.
  - Spec: 35/35 TC có `hardGate()` **trước** `test.fail()`, không TC nào gọi `test.fail()` trong vòng lặp.
  - Script so evidence với JSON: thư mục bug của mỗi TC = đúng tag `@BUG-xx` (20 mã, 35 bản copy), copy giống hệt bản `all-cases`; "Kết quả", "Số request", số dòng "Lỗi ghi nhận" khớp JSON 69/69; mục lục đúng trạng thái 69/69; "Thời điểm" 05:21:43.534Z → 05:28:04.661Z. Mã TC theo bug trong `known-issues.md` khớp tag 20/20.
  - Tự cộng lại bảng request theo `test.describe` của spec (D1).

## Checklist (mục 5: kết quả chạy)
| Mục | Kết quả |
|---|---|
| Đọc từng lỗi của từng test | ✅ 263/263. Số lỗi từng TC trong bảng triage khớp JSON 35/35 dòng (TC-062: 4 + 2 + 3 = 9) |
| Test bug fail đúng assertion của bug, không timeout / lỗi code / cổng cứng | ✅ Mẫu rủi ro cao: **TC-026** 7 lỗi đều sau cổng: bước 1 `GET` không `Accept` 418 / `text/plain` / không body; bước 3 `POST` không `Accept` 418, không `bookingid`; bước 2 `Accept: */*` 200 đạt trước cổng; booking ẩn #3162 tìm thấy theo tên, đã `DELETE 201`. **TC-013** 24 lỗi = 8 biến thể × (200 thay 400, tạo booking, lưu `0NaN-aN-aN` / ngày cuộn). **TC-050** 12 lỗi: 5 biến thể × (200, booking đổi) + 10.75 → 10 ở body và GET; mốc 275 khác giá trị bị ép "150" (L15), `writeVariants` khôi phục mốc giữa các biến thể nên mỗi so sánh độc lập. **TC-051** 4 lỗi, 2 booking mốc khác nhau ("false" trên mốc false, 0 trên mốc true). **TC-055** 3 lỗi, **TC-065** 12 lỗi: đều 405 thay 404, không 5xx đạt trước cổng |
| Phân loại flaky / script-issue / real-bug có bằng chứng; chạy lặp | ⚠️ Phân loại đúng (0 / 0 / 0). Không chạy lặp ở bước này (977 request mỗi lần trên máy chủ công khai); triage chưa ghi lý do (E2) |
| Bug đã biết mà bỗng pass | ✅ Không có: 35/35 TC có tag fail, 34/34 TC không tag pass; mỗi mã BUG-41 → BUG-60 có ≥ 1 TC fail |
| Kết quả CI / local | ⚠️ Chưa có lần chạy CI `api-full`. Ghi nhận, không chặn |
| Bảng triage khớp nguồn | ✅ 35 dòng = đúng 35 TC `expected_status = failed`; Expected → Received khớp `error_details`; câu "263 lỗi của 35 TC" đúng |
| Oracle của test pass (L15) | ✅ TC-030: bước 0 đối chứng (lọc đúng tên trả đúng `[{bookingid: X}]`) trước 5 biến thể `[]`. TC-067: 12 kiểu × 3 phương thức = 36 phản hồi 403 `Forbidden` (README đếm được 36 mã **403**), mỗi kiểu `GET` so mốc; 403 phân biệt được với 405 (id không tồn tại, BUG-52), đối chứng dương là TC-068 (pass). TC-069: 4 phương thức 404, booking giữ nguyên |
| Dữ liệu người khác (L17) | ✅ TC-038 chỉ ghi **số** phần tử (1263 → 1277); TC-030 bước 4 trả 0 phần tử; mọi tên trong README là của lần chạy (`QA-RB102-261128052139-eq72…`) |
| Điểm giao executor: N1 (`--include-full`) | ✅ `scope: full`, TC-013 và TC-067 có kết quả |
| Điểm giao executor: D1 (bảng ước lượng) | ✅ Số đo đúng (xem bảng dưới); 3 lỗi 🟡 về câu chữ / số cũ (C1, C2, D1) |
| Riêng tư | ✅ Orchestrator đã quét; README đọc tay: token `***`, `***(15 ký tự)`, không đường dẫn máy |

## Đối chiếu bảng request (D1 của review script-gen)
Tự cộng annotation `requests` theo `test.describe` của spec:

| Nhóm | Số TC | `@full` (đo) | Mặc định (đo − TC `@full`) | Bảng của executor |
|---|---|---|---|---|
| Endpoint 1 `POST /booking` | 25 | 299 | 265 (− TC-013 = 34) | 299 / 265 ✅ |
| Endpoint 2 `GET /booking/:id` | 2 | 10 | 10 | ✅ |
| Endpoint 3 `GET /booking` | 11 | 82 | 82 | ✅ |
| Endpoint 4 `PUT` | 7 | 93 | 93 | ✅ |
| Endpoint 5 `PATCH` | 7 | 123 | 123 | ✅ |
| Endpoint 6 `DELETE` | 2 | 33 | 33 | ✅ |
| Chung | 15 | 322 | 268 (− TC-067 = 54) | ✅ |
| **Tổng test** | 69 | **962** | **874** | ✅ |

- Cột "khi đã sửa": số đo − chênh lệch của bảng cũ (POST 66 / 89, PUT 6, PATCH 11, Chung 16): 199 / 210, 87, 112, 252 / 306; tổng 790 / 855 (kèm teardown 15). ✅ đúng phép tính, ghi rõ là ước lượng.
- Phần trăm: 889 / 778 = +14 %, 977 / 864 = +13 %, PATCH 123 / 91 = +35 %, DELETE 33 / 24 = +38 %, PUT 93 / 79 = +18 %. ✅
- Trung thực: ô đo và ô ước lượng tách rõ ("(đo)", "(ước lượng)", "~"); giả định teardown 15 ở lần chạy mặc định được ghi là chưa đo. Hợp lý: teardown gửi 1 `GET` cho mỗi tên trong sổ (`restful-booker.teardown.ts:28-33`), số tên gần như không đổi khi bỏ 2 TC.

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
Không có. Không gửi request mới (dữ kiện trong JSON và README đủ để kết luận).

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Triage chưa có mục "Cần quyết ở HITL #3"**, trong khi có 3 việc người dùng phải quyết: (1) **BUG-60 chưa có oracle được duyệt**: AC-8 chỉ nói `Accept` chọn giữa JSON / XML; Q9 (đã trả lời) chỉ chốt `Accept` **không hỗ trợ** → 406, không nói trường hợp **không gửi** `Accept`. Expected "200 JSON như `Accept: */*`" hiện là đề xuất của tester (`known-issues.md:37`), chưa có câu hỏi nào trong `q-and-a.md` (Q1 → Q12). (2) **Hai biến thể BUG-60 chưa có TC**: `PUT` không `Accept` → 418 mà vẫn ghi, `PATCH` → 500 mà vẫn ghi; mỗi biến thể đo 1 lần (`known-issues.md:37`), triage không nhắc. (3) **Tải request vượt mức đã duyệt ở HITL #2**: mặc định ~889 (suy từ số đo) so với ~778, `@full` 977 so với ~864 | `triage.md` dòng 71 (chỉ ghi "chờ xác nhận HITL #3"); `requirement.md` AC-8; `q-and-a.md` dòng 22 (Q9); `known-issues.md:37`; `test-data.md` bảng mới | 🟠 | Thêm mục "Cần quyết ở HITL #3" vào `triage.md`, mỗi việc kèm bằng chứng và đề xuất: (1) thêm **Q13** (Open, mục Chung) vào `q-and-a.md`: "Không gửi `Accept` thì trả gì?", đề xuất 200 JSON giống `Accept: */*` (RFC 9110: không có `Accept` nghĩa là chấp nhận mọi định dạng), mức Medium như BUG-49 vì `POST` vẫn tạo booking mà client không biết id. Bằng chứng sẵn có: lần chạy này (TC-026: `GET` 418, `POST` 418 + booking #3162 tìm theo tên), script-gen 3/3 lần `GET`, 2/2 lần `POST`. (2) Đề xuất thêm 2 biến thể `PUT` / `PATCH` vào TC-026 (hoặc TC mới) ở vòng sau, +6 request, trên booking của mình, sau khi PO xác nhận BUG-60. (3) Người dùng chấp nhận mức ~889 / 977, hoặc chọn giảm (chạy bản cục bộ qua `RB_BASE_URL` như `test-data.md` đã gợi ý) |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | `known-issues.md` dòng 140 (mục 11 "Chạy ở đâu") vẫn ghi số ước lượng cũ: "RB-102 ~778 mặc định (~679 khi đã sửa bug), `@full` thêm ~86" | Số mới trong `test-data.md`: mặc định ~889 (~790 khi đã sửa), `@full` thêm 88 (TC-013 34 + TC-067 54) | 🟡 | Sửa dòng 140 theo số mới, dẫn tới `test-data.md` mục "Ước lượng số request" |
| C2 | Đoạn văn ngay dưới bảng trong `test-data.md` vẫn nói "lần chạy mặc định giảm khoảng 11 % … (~778)" như con số hiện hành | `test-data.md` đoạn "Sau HITL #2 …" (ngay sau bảng mới) | 🟡 | Thêm "(ước lượng lúc HITL #2; số suy từ lần chạy đo được: ~889, xem bảng)" |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | So sánh theo nhóm không cùng phạm vi: TC-026 (10 request) chuyển từ `GET /booking/:id` sang Chung, nên "Chung +19 %" bị phóng to và `GET /booking/:id` 10 so với ~15 không so được. Bỏ TC-026: Chung 258 / 226 = **+14 %** | `test-data.md`: câu "Nhóm vượt nhiều nhất … Chung (+19 %)"; chính bảng ghi "TC-026 nằm trong describe Chung (bảng cũ xếp vào `GET /booking/:id`)" | 🟡 | Ghi "Chung +19 % (+14 % nếu không tính TC-026 vừa chuyển nhóm)" và đánh dấu dòng `GET /booking/:id` "không so được (khác số TC)" |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Mục lục evidence dùng câu mẫu sai cho feature này: "Tạo tự động bởi `npm run test:evidence`" (executor đã ghi nhận), "Nhóm `@bad-login` …" (RB-102 không có nhóm này), "Thư mục `manual/` trong từng bug" (không có thư mục `manual/` nào, `tests/repro/` chưa có script API) | `evidence/README.md` dòng 3, 5, 6; `scripts/run-evidence.mjs:99-101` | 🟡 | Sửa chung với RB-101 E1: in đúng lệnh; câu `@bad-login` chỉ khi spec có tag này; câu `manual/` chỉ khi có thư mục. Bước defects cần cách tái hiện độc lập cho bug API (đưa vào phiếu HITL #3, xem RB-101 E3) |
| E2 | Triage không nói vì sao bỏ bước chạy lặp loại chập chờn | `triage.md` mục Flaky | 🟡 | Thêm 1 câu: không chạy lặp vì mỗi lần 977 request trên máy chủ công khai; các lần chạy ở bước script-gen cho cùng phân loại; lần CI `api-full` đầu tiên dùng làm lần đối chiếu |

## Việc cần làm trước HITL #3 (xếp theo mức độ)
1. 🟠 B1: mục "Cần quyết ở HITL #3" trong `triage.md` + Q13 (Open) trong `q-and-a.md` cho BUG-60.
2. 🟡 C1, C2, D1: sửa số / câu chữ trong `known-issues.md`, `test-data.md`.
3. 🟡 E1, E2: gộp với RB-101 (script mục lục, 1 câu trong triage).

**Điểm người dùng quyết ở HITL #3** (RB-102):
- BUG-60: có phải bug không (Q13), mức Medium; có thêm biến thể `PUT` / `PATCH` không `Accept` vào test không.
- Tải request: chấp nhận ~889 mặc định / 977 `@full` (vượt mức duyệt ở HITL #2 khoảng 14 %) hay giảm.
- 19 bug BUG-41 → BUG-59 (đã duyệt ở HITL #1) tái hiện đúng ở lần chạy này; không có bug mới khác.

## Xử lý sau review
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| B1 | 🟠 | Mục "Cần quyết ở HITL #3" trong triage; Q13 cho BUG-60 | ✅ | `triage.md:82` mục "Cần quyết ở HITL #3" (3 việc); `q-and-a.md:25` Q13 (Open) |
| C1 | 🟡 | `known-issues.md:140` số request mới | ✅ | `known-issues.md:140` |
| C2 | 🟡 | Đoạn dưới bảng `test-data.md` nói rõ ~778 là ước lượng cũ | ✅ | `test-data.md:178` |
| D1 | 🟡 | So sánh nhóm Chung / `GET /booking/:id` ghi rõ khác phạm vi | ✅ | `test-data.md:176` |
| E1 | 🟡 | Mục lục evidence API: đúng lệnh, bỏ câu `@bad-login` / `manual/` khi không áp dụng | ✅ | `scripts/run-evidence.mjs` (madeBy / hasBadLogin / hasManual, dòng ~91-105) + `scripts/run-tests.mjs:139` (truyền `EVIDENCE_INDEX_CMD`); đã dựng lại mục lục cả 2 feature bằng `--index-only`, không chạy test |
| E2 | 🟡 | Triage ghi lý do không chạy lặp | ✅ | `triage.md:65` |

## Kiểm lại lượt 2
- **Ngày**: 2026-11-28 · **Reviewer**: qa-reviewer · **Phạm vi**: chỉ phần thay đổi (`git diff` của `known-issues.md`, `q-and-a.md`, `test-data.md`, `scripts/run-evidence.mjs`, `scripts/run-tests.mjs`; đọc trực tiếp `triage.md`, `evidence/README.md`). Không gửi request nào, không chạy `test:run` / `test:evidence` / `EVIDENCE=1`.
- **Cách kiểm**:
  - Đếm lại `error_details` từ `run-results/run-20261128-052139.json`: 35 TC, 263 lỗi (khớp lượt 1).
  - Chạy `run-evidence.mjs restful-booker-booking-api --index-only` trên **bản sao** evidence trong thư mục nháp: thân mục lục (trừ dòng 3) giống hệt bản trong repo; câu `@bad-login` không in (spec không có tag, đếm 0); thêm thử `bugs/…/manual/` thì câu `manual/` hiện, bỏ đi thì ẩn.
  - Mục lục: 104 link, so 2 chiều với 104 README của TC: không thiếu, không thừa, không link hỏng. Cột "Kết quả": 34 Passed + 35 Failed, số TC theo bug cộng lại 35 (BUG-42 ×4, BUG-43 ×4, BUG-41 / 44 / 55 ×3, BUG-48 / 52 / 56 ×2, 12 mã còn lại ×1), khớp run JSON. README TC không bị ghi lại ("Thời điểm" 05:21:43.534Z → 05:28:04.661Z).

### Từng dòng "Xử lý sau review"
| # | Kết quả | Bằng chứng |
|---|---|---|
| B1 🟠 | ✅ | `triage.md:82-85` mục "Cần quyết ở HITL #3" đủ 3 việc: (1) BUG-60 chưa có oracle, dẫn Q13 + bằng chứng (TC-026, booking #3162, script-gen 3/3, 2/2) + biến thể `PUT` / `PATCH` chưa có TC, +6 request, sau khi PO xác nhận; (2) tải request ~889 / 977 so với ~778 / ~864; (3) tái hiện độc lập bug API. `q-and-a.md:25` Q13: đủ 8 cột, mục "Chung", Trả lời trống, `Open`, đề xuất 200 JSON dẫn RFC 9110 mục 12.5.1 (đúng mục `Accept`: không có `Accept` = chấp nhận mọi định dạng), mức Medium như BUG-49. Hai chỗ liên quan chưa theo kịp, ghi thành N2 (không mở lại B1) |
| C1 | ✅ | `known-issues.md:140`: ~889 mặc định (~790 khi đã sửa), 977 với `@full` (thêm 88 = 34 + 54), dẫn `test-data.md`; khớp bảng `test-data.md:174` |
| C2 | ✅ | `test-data.md:178`: "~778; ước lượng lúc HITL #2, số suy từ lần chạy đo được là ~889, xem bảng" |
| D1 | ✅ | `test-data.md:176`: "Chung (+19 %, +14 % nếu không tính TC-026 …: 258 / 226)" (268 − 10 = 258 ✅) và "Dòng `GET /booking/:id` không so được với bảng cũ (khác số TC)". Đánh dấu bằng câu văn thay vì trong ô bảng: chấp nhận |
| E1 | ❌ (sửa một phần, L8) | Script đúng (`run-evidence.mjs:89-91`, `run-tests.mjs:139`): câu `@bad-login` và `manual/` đã bỏ cho feature này. **Nhưng** `evidence/README.md:3` ghi "Tạo tự động bởi `npm run test:run` lúc 2026-11-28T05:50:57.700Z": lúc đó không có lần `test:run` nào (lần chạy chính thức 05:21:39 → 05:28:11), chữ `test:run` chỉ ra được khi đặt tay `EVIDENCE_INDEX_CMD` lúc dựng lại (chạy `--index-only` thường ghi `npm run test:evidence -- … --index-only`, đã thử trên bản sao). `triage.md:91` ("mục lục 05:28:11Z") và `triage.md:93` ("Nhỏ: … ghi `test:evidence`") nay sai theo. Cách sửa: xem RB-101 `reviews/review-executor.md` lượt 2 N1 (sửa chung) |
| E2 | ✅ | `triage.md:65`: không chạy lặp vì 977 request / lần trên máy chủ công khai; lần CI `api-full` đầu tiên làm lần đối chiếu |

### Phát hiện mới
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| N1 | Mục lục ghi lệnh / giờ không đúng thực tế sau khi dựng lại; triage mục Evidence lỗi thời | `evidence/README.md:3`; `triage.md:91`, `:93` | 🟡 | Như RB-101 lượt 2 N1: dựng lại không đặt tay `EVIDENCE_INDEX_CMD` (tốt hơn: script ghi riêng "evidence của lần chạy <min → max Thời điểm>" và "mục lục dựng lại lúc … bằng …"); `triage.md:91` tách giờ README TC với giờ dựng mục lục; xóa `:93` |
| N2 | Q13 mới thêm nhưng 2 chỗ đối chiếu chưa cập nhật: (a) dòng **Tổng hợp** của Q&A vẫn "12 dòng · 10 câu (7 blocking, 3 non-blocking) · Answered 10 · **Open 0**"; (b) mục BUG-60 trong `known-issues.md` không nhắc Q13 (liên kết một chiều: Q13 → BUG-60 có, BUG-60 → Q13 không) | `q-and-a.md:13`; `known-issues.md:37` cột ghi chú "chờ xác nhận HITL #3" | 🟡 | (a) Sửa thành "13 dòng · 11 câu (7 blocking, 4 non-blocking) · Answered 10 · **Open 1 (Q13)** · 2 dòng tham chiếu"; (b) thêm "oracle chờ **Q13**" vào cột ghi chú của BUG-60. Người duyệt HITL #3 đọc dòng Tổng hợp trước tiên: "Open 0" sẽ làm sót Q13 |

### Kết luận lượt 2
✅ **Đạt** (0 🔴, 0 🟠). B1 🟠 đã đóng; C1, C2, D1, E2 chấp nhận; **E1 chưa chấp nhận** (gộp N1 🟡); thêm N2 🟡. Còn 3 việc sửa tài liệu ≤ 10 phút, không chạy test: dòng 3 mục lục, `triage.md:91` / `:93`, `q-and-a.md:13` + `known-issues.md:37`. HITL #3 bắt đầu được sau khi sửa N2 (dòng Tổng hợp là chỗ người duyệt đọc đầu tiên); orchestrator tự kiểm lại các dòng trên, không cần lượt 3.

## Soát thêm: bài học check() (2026-11-28)
Ngoài feature, không ảnh hưởng kết luận RB-102. Phạm vi: `.claude/agents/script-gen.md:126`, `.claude/agents/healer.md:26`, `:28`, `docs/learning/04-viet-code-test.md:87`. Đối chiếu mã nguồn `playwright-core` **1.65.1** đang cài (`lib/coreBundle.js`), không chạy thử trình duyệt.

**Kiểm mã nguồn** ✅:
- `_setChecked` (≈ dòng 22089): đọc trạng thái → đã đúng thì `done` (không click) → `_click` → đọc lại; phần tử đã rời DOM thì `throwElementIsNotAttached()` ném `Error` thường; đọc được mà sai trạng thái thì `NonRecoverableDOMError("Clicking the checkbox did not change its state")`.
- `retryWithProgressAndTimeouts` (≈ 25630) chỉ ném ra ngoài lỗi `isNonRetriableError` (≈ 25655); lỗi "not attached" **không** thuộc loại đó → `_retryWithProgressIfNotConnected` (≈ 25666) tìm lại selector: 0 phần tử → chờ tiếp tới hết timeout; có phần tử khớp → chạy lại `_setChecked` trên **phần tử mới**.
- `check()` / `uncheck()` (≈ 25885) và `setChecked()` đi cùng đường này. Câu "đã kiểm trong mã nguồn Playwright 1.65" đúng với bản đang cài.

**Nhất quán quy ước dự án** ✅: không đề xuất `.nth()` cố định (`count()` / `highlight()` ghi rõ chỉ để chẩn đoán), không `waitForTimeout`, cấm `force: true` và tăng timeout, dùng web-first assertion cho kết quả mong đợi, bảo kiểm trên web thật trước khi viết. Hiện `tests/` chưa dùng `check()` nên đây là quy tắc phòng ngừa, không có code phải sửa.

| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| P1 | "Biến mất / **bị thay**" → hết giờ là nói quá: nếu phần tử bị render lại mà phần tử mới **vẫn khớp locator** và đã checked thì vòng thử lại đọc `checked` → `done`, test pass; chỉ hết giờ khi **không còn gì khớp** locator. Ngược lại, phần tử mới khớp mà chưa checked thì Playwright **click thêm lần nữa** | `_setChecked` trả `done` khi `checkedState.matches === state`; healer.md:26 cột nguyên nhân, script-gen.md:126 | 🟡 | Ghi: "phần tử bị gỡ khỏi DOM (biến mất, hoặc bị thay bằng phần tử không còn khớp locator) → hết giờ; locator còn khớp phần tử khác → thao tác trên phần tử đó" |
| P2 | Dấu hiệu chẩn đoán ở healer.md dễ hiểu ngược: "locator vẫn đúng (`highlight()`, `count()` thấy đúng phần tử)". Nếu healer gọi `count()` ở chỗ test dừng (sau `check()`) thì kết quả là **0**, trông như "locator sai" và đi nhầm sang bước (1) | healer.md:26, :28 | 🟡 | Ghi rõ thời điểm: "**trước** `check()` locator khớp đúng 1 phần tử; **sau** khi hết giờ `count()` = 0 (hoặc trỏ sang phần tử khác)". Thêm dấu hiệu trong call log: đã có dòng `click action done` (mã ≈ dòng 21728), sau đó không có bước nào nữa tới hết giờ = click đã xảy ra, lỗi ở bước tự kiểm |
| P3 | "Kiểm trạng thái **trước** khi click" chưa nói kiểm bằng gì; người đọc dễ viết `if (!(await cb.isChecked())) await cb.click()`: rẽ nhánh theo trạng thái hiện tại, che mất lỗi trạng thái đầu sai | script-gen.md:126, healer.md:26 | 🟡 | Ghi rõ: "khẳng định trạng thái đầu bằng web-first assertion `await expect(cb).not.toBeChecked()` rồi `click()`; không dùng `if` để rẽ nhánh" |
| P4 | Bài học cho người học chỉ nói hết giờ, bỏ trường hợp nguy hiểm hơn: locator còn khớp phần tử khác (`.first()`, hoặc locator chung chỉ còn 1 phần tử khớp) thì Playwright tick **nhầm phần tử khác** mà không báo lỗi | `04-viet-code-test.md:87`; script-gen.md:126 có nói, bài học không có | 🟡 | Thêm nửa câu: "locator còn khớp ô khác (vd `.first()`) thì Playwright tick nhầm ô đó, không báo lỗi". ❓ Suy từ mã, chưa chạy: với danh sách lọc "chưa xong" và `.first()`, vòng thử lại có thể tick **lần lượt mọi** việc còn lại rồi mới hết giờ (mỗi ô vừa tick lại biến mất). Kiểm bằng 1 lần chạy TodoMVC demo trong thư mục nháp nếu muốn dùng làm ví dụ |
| P5 | ❓ Locator **không** có `.first()` mà sau click còn khớp ≥ 2 phần tử: lỗi có thể là `strict mode violation` chứ không phải hết giờ, bảng healer chưa nối dòng này với dòng `strict mode violation` | Đọc mã: `_retryWithProgressIfNotConnected` gọi `callOnSelectorHandle` với `strict` của locator; chưa chạy thử | 🟡 | Không cần sửa ngay; nếu thêm thì 1 câu "(sau click còn nhiều phần tử khớp: có thể thấy `strict mode violation`)" |

Ghi chú ngoài phạm vi: `git diff` còn có thay đổi ở `.claude/agents/qa-reviewer.md` (2 dòng checklist "drift"), không có trong phạm vi được giao và không có lúc bắt đầu lượt này; chưa soát.

**Kết luận**: ✅ **Đạt về kỹ thuật**: mô tả cơ chế (`check()` = click + tự đọc lại, mất phần tử thì tìm lại locator, hết giờ hoặc thao tác lên phần tử khác) đúng với mã nguồn 1.65.1; cách sửa đề xuất hợp quy ước dự án. 4 điểm 🟡 câu chữ (P1–P4) nên sửa trước khi commit để agent không chẩn đoán nhầm (P2) hoặc viết rẽ nhánh `if` (P3); P5 tùy chọn.

## Orchestrator tự kiểm (sau lượt 2 và phần soát bài học check())
Chỉ còn 🟡, nên orchestrator tự sửa và tự kiểm (quy tắc 2026-11-27), không chạy lượt 3.

| # | Xử lý | Kiểm |
|---|---|---|
| E1 + N1 | `scripts/run-evidence.mjs:95-98`: chạy tay `--index-only` (không có `EVIDENCE_INDEX_CMD`) thì dòng đầu ghi "Mục lục dựng lại bằng `npm run test:evidence -- <feature> --index-only` lúc … từ evidence có sẵn (không chạy test)"; gọi từ `test:run` vẫn ghi "Tạo tự động bởi `npm run test:run`". Đã dựng lại mục lục (dòng 3 đúng câu mới, vẫn đủ 104 mục TC); `triage.md:91` bỏ giờ mục lục, `:93` thay câu "Nhỏ: …" bằng ghi chú mục lục dựng lại | ✅ `node --check`, đọc lại, đếm 104 |
| N2 | `q-and-a.md:13` Tổng hợp: 13 dòng · 11 câu (7 blocking, 4 non-blocking) · Answered 10 · **Open 1** (Q13), tự đếm lại từ bảng; `known-issues.md:37` BUG-60 ghi expected là đề xuất, chờ Q13 ở HITL #3 | ✅ đếm bằng script |
| P1 | `script-gen.md` Quy tắc + `healer.md` bảng: "rời khỏi trang"; hết giờ chỉ khi **không còn gì khớp**; phần tử chỉ bị vẽ lại, vẫn khớp và đã checked thì không sao | ✅ đọc lại |
| P2 | `healer.md`: gọi `highlight()` / `count()` **trước** thao tác; gọi sau ra 0, đừng hiểu là locator sai | ✅ |
| P3 | `script-gen.md`, `healer.md`, `04-viet-code-test.md`: `await expect(cb).not.toBeChecked()` trước `click()`, **không** rẽ nhánh `if (!(await cb.isChecked()))` | ✅ |
| P4 | `04-viet-code-test.md`: thêm "còn khớp ô khác thì tick nhầm ô đó mà không báo lỗi" | ✅ |
| P5 ❓ | `healer.md` thêm nửa câu: còn khớp ≥ 2 phần tử thì có thể ra `strict mode violation` | ✅ |

Còn chưa soát: 2 dòng checklist "drift" mới trong `.claude/agents/qa-reviewer.md` và 1 dòng "assertion drift" trong `04-viet-code-test.md` (bài chia sẻ thứ hai, 2026-11-28): gửi qa-reviewer soát cùng phiếu HITL #3.

## Soát thêm: bài học drift + nguyên nhân gốc (2026-11-28)
Ngoài feature, không ảnh hưởng kết luận RB-102. Phạm vi: `git diff` của `.claude/agents/qa-reviewer.md` (2 dòng checklist "Code test"), `.claude/agents/script-gen.md` (Quy tắc "Fail gần nguyên nhân gốc"), `.claude/agents/executor.md` (1 dòng mục real-bug), `docs/thuat-ngu.md` (2 dòng), `docs/learning/04-viet-code-test.md` (1 dòng), `docs/learning/05-chay-test-va-phan-loai.md` (1 dòng). Đối chiếu: spec hiện có, `known-issues.md` / `spec-review.md` của SauceDemo, L15, L18, L19, quy ước `CLAUDE.md`. Không chạy test, không gửi request.

| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| 1 | Quy tắc `waitForResponse` thiếu thứ tự bắt buộc: phải **đăng ký chờ trước** thao tác gây ra request (`const resp = page.waitForResponse(...)`, rồi thao tác, rồi `await resp`; hoặc `Promise.all`). Đăng ký sau thì bỏ lỡ response, test hết giờ. Cũng thiếu: điều kiện lọc phải cụ thể (URL + method), nếu không bắt nhầm request khác | `script-gen.md` dòng "Fail gần nguyên nhân gốc"; `04-viet-code-test.md` và `05-...md` chỉ nhắc tên hàm | 🟠 | Thêm nửa câu về thứ tự "chờ trước, thao tác sau" và điều kiện lọc URL + method; thêm ví dụ 3 dòng ở bài 04 |
| 2 | Chỉ ghi "giao diện hiện đúng giá trị lấy từ response đó (không gõ cứng)": so UI với response chỉ chứng minh hai bên **khớp nhau**. Nếu response sai mà UI hiển thị đúng như response sai, test vẫn xanh. Expected phải lấy từ oracle (AC, dữ liệu test), không từ hành vi hiện tại | `qa-reviewer.md` mục 3.2 (oracle), L15 | 🟠 | Ghi rõ 2 lớp: (1) response kiểm theo oracle (mã, trường chính đúng giá trị mong đợi); (2) UI khớp response. Không bỏ lớp (1) |
| 3 | `thuat-ngu.md`, dòng Root cause: trộn khái niệm. Theo ISTQB, **defect** (chỗ sai trong sản phẩm) gây ra **failure**, còn **root cause** là lý do sâu hơn khiến người làm tạo ra defect (vd thiếu yêu cầu, hiểu sai, thiếu review). Câu "chỗ hỏng thật gây ra triệu chứng ... ISTQB: error → defect → failure" làm hai thứ này thành một. Chuỗi error → defect → failure tự nó đúng | Cùng dòng; `qa-reviewer.md` mục 3.7 dùng error / defect / failure | 🟡 | Tách: "Defect: chỗ hỏng trong sản phẩm (tầng backend / frontend) gây failure. Root cause (ISTQB): nguyên nhân khiến defect được tạo ra. Trong test tự động, 'fail gần nguyên nhân gốc' nghĩa là fail gần **defect** nhất" |
| 4 | Ví dụ BUG-21 ghi "lỗi JavaScript `pageerror`". Tài liệu chỉ ghi **console** `Error: This component failed to render!` + request `submit.backtrace.io`, chưa nói là `pageerror`; và chưa ai xác định nguyên nhân trong code của trang. Gọi là "root cause" là nói quá | `qa-runs/saucedemo-products-cart-screen/known-issues.md:36` | 🟡 | Đổi thành "triệu chứng: mất mô tả; dấu hiệu gần nhất quan sát được: lỗi console 'failed to render' (nguyên nhân trong code chưa xác định)" |
| 5 | Claim "SauceDemo không lấy dữ liệu qua API nên không áp dụng": **chưa kiểm chứng**. Repo chỉ ghi giỏ nằm ở `localStorage` (`spec-review.md` SD-102:22) và liệt kê request **ra ngoài** (`events.backtrace.io`, `submit.backtrace.io`; SD-103 O-38). Không có ghi chú nào nói trang danh sách / chi tiết có hay không gọi API dữ liệu sản phẩm (có thể dữ liệu nằm trong gói JavaScript) | Grep `spec-review.md`, `known-issues.md` của 3 feature SauceDemo: không có mục khảo sát request dữ liệu | 🟡 | Hoặc sửa thành "chưa thấy request dữ liệu trong ghi chú khảo sát SauceDemo; nếu không có API thì kiểu test này không áp dụng", hoặc khảo sát một lần (xem tab Network) rồi ghi vào `spec-review.md` |
| 6 | Dòng drift #1 của `qa-reviewer.md` chỉ ghi import từ `../fixtures`; spec API import từ `../fixtures/api` | `restful-booker-*-api.spec.ts:14` / `:23` | 🟡 | Ghi "`../fixtures` (web) hoặc `../fixtures/api` (API)" |
| 7 | Dòng drift #2: cách "trỏ `RB_BASE_URL` sang máy chủ giả" dễ lặp lại L19 (chạy có `EVIDENCE=1` đè evidence thật) | `qa-reviewer.md` L19 | 🟡 | Thêm "chỉ `npx playwright test -g`, kết quả ra thư mục nháp, không `EVIDENCE=1` (L19)" |
| 8 | Nội dung đúng và nhất quán, không cần sửa: `page.route` (chặn / trả 500 bằng `route.fulfill`) và `page.waitForResponse` là API Playwright có thật; không dùng `.nth()` cố định, `waitForTimeout`, `networkidle`; câu "không gửi request riêng" hợp lý; "Test `test.fail()` vẫn theo L18" khớp; dòng executor "chưa rõ tầng thì ghi 'chưa rõ', không đoán" khớp nguyên tắc 6 của reviewer | `script-gen.md` Quy tắc; `executor.md` | ✅ | Giữ |

**Kết luận**: ⚠️ **Cần sửa nhẹ trước khi commit** (0 🔴, 2 🟠, 5 🟡). Phần (a) "assertion drift" và 2 dòng checklist đúng kỹ thuật, hợp L15 / L18, đủ rõ cho người học (chỉ thêm #6, #7). Phần (b) đúng hướng nhưng #1 và #2 có thể khiến người học viết test hết giờ hoặc test xanh giả; #3 và #5 là nói quá về thuật ngữ / bằng chứng, nên sửa câu chữ. Số liệu: 8 dòng kiểm, đã tự đối chiếu với file nguồn.


### Kiểm lại lượt 2 (bài học)
Đối chiếu từng mục với file hiện tại (chỉ đọc, không chạy test, không gửi request).

| # | Kết quả | Bằng chứng |
|---|---|---|
| 1 🟠 | ✅ | `.claude/agents/script-gen.md:127`: "Đăng ký chờ trước thao tác", lọc `r.url().endsWith(...)` + `r.request().method()`, ví dụ `respP` → thao tác → `await respP`, nói rõ đăng ký sau thì có thể lỡ response |
| 2 🟠 | ✅ | `script-gen.md:127`: thứ tự (1) mã (2) trường chính so với expected độc lập từ test case / `tests/data` (3) giao diện; nêu rõ "response sai mà giao diện hiện đúng cái sai đó thì test vẫn xanh"; fail ở (1)-(2) = backend, (3) = frontend |
| 3 🟡 | ✅ | `docs/thuat-ngu.md:46`: root cause = lý do dẫn tới error; chuỗi error → defect → failure; không còn gộp root cause với defect. Dòng 45 (Failure) đúng ISTQB |
| 4 🟡 | ✅ | `thuat-ngu.md:45`: ví dụ BUG-21 chỉ ghi console `This component failed to render!` là triệu chứng, không còn gọi `pageerror` hay root cause; `:46` dùng TC-028 / L15, khớp `qa-reviewer.md:224` (SD-101 TC-028) và `qa-runs/saucedemo-login-screen/known-issues.md:10` |
| 5 🟡 | ✅ | `script-gen.md:127`: SauceDemo "chưa kiểm chứng", xem tab network trước khi áp |
| 6 🟡 | ✅ | `qa-reviewer.md:152`: `../fixtures` (web) hoặc `../fixtures/api` (API); khớp `tests/specs/restful-booker-*-api.spec.ts` (import `../fixtures/api`) |
| 7 🟡 | ✅ | `qa-reviewer.md:153`: "chỉ `npx playwright test -g`, kết quả ra thư mục nháp, không `EVIDENCE=1` / `test:run`, xem L19"; khớp `qa-reviewer.md:228` (L19) |

Kiểm nhất quán các bài học cũ:
- Bài `check()`: `script-gen.md:126`, `healer.md:26`, `docs/learning/04-viet-code-test.md:87` vẫn thống nhất (không còn gì khớp thì hết giờ; còn khớp ô khác thì tick nhầm; dùng `expect(...).not.toBeChecked()` + `click()`, không rẽ nhánh `isChecked`). Không mâu thuẫn với quy tắc mới.
- `04-viet-code-test.md:88` (assertion drift) khớp `qa-reviewer.md:153`.
- `.claude/agents/executor.md:73` ("chưa rõ tầng thì ghi chưa rõ, không đoán") khớp quy tắc backend / frontend ở `script-gen.md:127`.
- `docs/learning/05-chay-test-va-phan-loai.md:88`: không mâu thuẫn nhưng ngắn hơn quy tắc mới (xem N1).

Phát hiện mới:
| # | Vấn đề | Mức | Đề xuất |
|---|---|---|---|
| N1 | `05-chay-test-va-phan-loai.md:88` chỉ nói "kiểm response trước khi kiểm giao diện", chưa nhắc 2 điểm sống còn của quy tắc mới: đăng ký `waitForResponse` trước thao tác, và so trường chính với expected độc lập (không chỉ với giao diện). Người học chỉ đọc bài 05 có thể viết test hết giờ hoặc xanh giả | 🟡 | Thêm nửa câu "đăng ký chờ trước thao tác; so với expected từ test case, không chỉ so với giao diện; chi tiết ở `script-gen.md`" |

**Kết luận**: ✅ 7/7 mục đã sửa đúng, không còn 🟠. Còn 1 🟡 (N1, câu chữ bài học, không chặn commit). Số liệu: 7 mục + 4 điểm nhất quán đã đối chiếu.

#### Orchestrator tự kiểm (N1 bài học)
| # | Xử lý | Kiểm |
|---|---|---|
| N1 | `docs/learning/05-chay-test-va-phan-loai.md:88`: thêm "đăng ký chờ trước thao tác" và "so với expected độc lập, không chỉ so giao diện với response" | ✅ đọc lại |
