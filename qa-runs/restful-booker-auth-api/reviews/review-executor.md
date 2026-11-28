# Review: bước executor, RB-101 Restful Booker auth (POST /auth + GET /ping)

- **Ngày**: 2026-11-28 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ✅ **Đạt** (0 lỗi 🔴, 0 lỗi 🟠, 3 lỗi 🟡, 0 ❓). Sang HITL #3 được; các điểm 🟡 sửa gộp, không chặn.
- **Phạm vi**:
  - `run-results/run-20261128-051405.json` (lần chạy chính thức), `triage.md`, `evidence/` (43 README + mục lục).
  - `run-results/run-20261127-143546.json`: chỉ kiểm nó **không** phải lần chạy chính thức và không chứa dữ liệu stub (người dùng đã chốt giữ, `triage.md` mục Evidence).
  - Điểm giao executor ở `reviews/review-script-gen.md`: evidence stub TC-004 phải được ghi đè hết.
- **Nguồn đối chiếu**: `known-issues.md` (BUG-37 → BUG-40), `test-cases.csv` (TC-026), `tests/specs/restful-booker-auth-api.spec.ts`, `tests/data/bugs.ts`, `.claude/agents/executor.md`, `CLAUDE.md`, `qa-reviewer.md` mục 5 (kết quả chạy) và L15, L18, L19.
- **Cách kiểm** (không gửi request nào lên máy chủ; không chạy `test:run`, `test:evidence`, `EVIDENCE=1`):
  - Tự đếm lại từ run JSON bằng script đọc file: 30 test; 17 `passed`/`passed`, 13 `failed`/`expected_status = failed`; `outcome` 30/30 `expected`, 0 `unexpected`, 0 `retry`. Cộng annotation `requests` của 30 test: **141** request, **30** đăng nhập thất bại (TC-004 1, TC-005 2, TC-006 2, TC-007 4, TC-008 4, TC-009 3, TC-010 5, TC-011 1, TC-012 1, TC-013 2, TC-014 3, TC-016 1, TC-030 1). Khớp annotation teardown: "8 booking trong sổ, dọn sót 0 · 141 request, đăng nhập thất bại 30 · teardown 1 request". Tổng thời gian 71 374 ms.
  - Đọc **đủ 38** `error_details` của 13 TC `test.fail()` (không chỉ dòng đầu). Dò dấu hiệu lỗi bị che: `Timeout`, `TypeError`, `ReferenceError`, cổng cứng `(a)–(d) phải đạt trước test.fail`, `EnvError`, `503`, ngân sách, `strict mode`: **0**.
  - Đọc spec: cả 13 TC bug gọi `hardGate()` **trước** `test.fail()` (spec dòng 178, 194, 210, 224, 242, 255, 270, 279, 293, 318, 346, 382, 643); `test.fail()` không nằm trong vòng lặp (L18).
  - Script so evidence với JSON: 30 README `all-cases` + 13 bản `bugs/`; thư mục bug của mỗi TC = đúng tag `@BUG-xx` trong spec; 13 bản copy giống hệt bản `all-cases` (so từng byte); "Kết quả", "Số request", số dòng "Lỗi ghi nhận" của 30/30 README khớp JSON; mục lục 30 dòng TC đúng trạng thái; "Thời điểm" 2026-11-28T05:14:07.639Z → 05:15:16.038Z.
  - Đọc tay README TC-022, TC-030 và code TC-025, TC-026 (oracle của test pass, L15).

## Checklist (mục 5: kết quả chạy)
| Mục | Kết quả |
|---|---|
| Đọc từng lỗi của từng test | ✅ 38/38 `error_details`. Mỗi lỗi có Expected / Received cụ thể, đúng tên assertion của bug |
| Test bug fail đúng assertion của bug, không có timeout / lỗi code / cổng cứng | ✅ BUG-37 (9 TC, 23 lỗi): `(e) HTTP 401/400`, mọi Received = 200. BUG-38: TC-012 `(d)` Content-Type `text/plain` + body không phải object JSON (mã 413 đạt trước cổng), TC-013 cùng 2 assertion × 2 biến thể (mã 400 đạt). BUG-39 TC-014: `(c)` 415 → 200 và `(e)` "Bad credentials" → có, × 3 biến thể (biến thể 3 có annotation TD-12: chỉ gửi `content-length`, `host`). BUG-40 TC-030: bước 1 `http://…/ping` 201, bước 2 `http://…/auth` 200 (tài khoản sai), bước 3 HSTS không có. 0 lỗi ngoài phần bug |
| Phân loại flaky / script-issue / real-bug có bằng chứng; chạy lặp | ⚠️ Phân loại đúng (0 / 0 / 0, 13 bug đã biết). **Không chạy lặp** ở bước này: hợp lý vì ngân sách 30 đăng nhập sai / ngày UTC đã dùng hết; lần chạy `run-20261127-143546` (code cũ hơn) cho cùng 30/30, 13 expected-fail, 141 request, 30 đăng nhập sai. Triage chưa ghi lý do không chạy lặp (E2) |
| Bug đã biết mà bỗng pass | ✅ Không có: 13/13 TC có tag `@BUG-xx` đều fail, 17/17 TC không tag đều pass |
| Kết quả CI / local | ⚠️ Chưa có lần chạy CI (job `api-full` chạy tay / hằng tuần, nhánh chưa gộp). Ghi nhận, không chặn |
| Bảng triage khớp nguồn | ✅ 13 dòng = đúng 13 TC `expected_status = failed`; bug, Expected → Received khớp JSON và `known-issues.md` (TC theo bug khớp 4/4 dòng). Dòng TC-013 thiếu một nửa nội dung lỗi (C1) |
| Oracle của test pass (L15) | ✅ TC-022: 6 request sai token đều 403 `Forbidden`, mỗi lần `GET` sau đó body giống hệt mốc, có bước 4 đối chứng dương (token đúng). TC-026: bước HEAD so mã, Content-Length, Content-Type **với GET** (không assert body rỗng, đúng CSV và review D2). TC-025 assert mã, Content-Type, body `Created` |
| Evidence đủ, đúng tag, không dữ liệu người khác, token che | ✅ 43 README; bug copy = tag; token `***` / `***(15 ký tự)`, mật khẩu quản trị `***`; tài khoản trong TC-030 là tài khoản sai của test. Booking trong README đều là `QA-RB101-20261128-051406` |
| Điểm giao executor (review-script-gen: evidence stub TC-004 phải ghi đè hết) | ✅ Không còn `stubuser`, `127.0.0.1` trong `evidence/` và cả 2 file run JSON; mọi README ghi giờ của lần chạy chính thức. `run-20261127-143546.json` là lần chạy thật (`triggered_by: script-gen-check`, cùng số liệu), không phải stub. Ghi chú: tên file này theo **giờ máy** (14:35:46, dữ liệu ghi `20261127-073546` UTC), khác quy ước tên file UTC hiện nay; không ảnh hưởng vì RTM lấy file có tên lớn nhất (`20261128-…`) |
| Riêng tư | ✅ Đã được orchestrator quét; mình kiểm thêm các README đọc tay: không đường dẫn máy, không token thật |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
Không có. Không gửi request mới (không có điểm nghi ngờ chỉ kiểm được trên máy chủ).

## B. Thiếu sót
Không có.

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | Dòng TC-013 của bảng "Bug đã biết" chỉ ghi `(d)` Content-Type, thiếu assertion thứ hai của mỗi biến thể (body đọc được thành object JSON: true → false). JSON có **4** lỗi, bảng đọc như 2. Dòng TC-012 thì ghi đủ cả hai. Các dòng TC-012, TC-013, TC-014, TC-030 không ghi số lỗi, khác cách ghi của RB-102 | `triage.md` bảng L18, dòng TC-013; run JSON TC-013 `error_details` 4 mục | 🟡 | Sửa thành "(d) Content-Type JSON + body là object JSON, ×2 biến thể (4)"; thêm số lỗi cho TC-012 (2), TC-014 (6), TC-030 (3) |

## D. Sai kỹ thuật / sai chuẩn
Không có.

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Mục lục evidence của feature API có 2 câu mẫu không đúng thực tế: "Tạo tự động bởi `npm run test:evidence`" (thật ra từ `test:run`, executor đã ghi nhận) và "Thư mục `manual/` trong từng bug: tái hiện độc lập (`npm run repro`)" trong khi **không có** thư mục `manual/` nào và `tests/repro/` chưa có script cho Restful Booker | `evidence/README.md` dòng 3, 6; `scripts/run-evidence.mjs:99-101`; `tests/repro/` chỉ có 2 file SauceDemo | 🟡 | `run-evidence.mjs`: ghi đúng lệnh đã chạy; chỉ in câu `manual/` khi có thư mục `manual/`. Làm chung với RB-102 (E1 bên đó) |
| E2 | Triage không nói vì sao bỏ bước chạy lặp loại chập chờn (checklist executor) | `triage.md` mục Flaky: "Không chạy lại test nào (không có kết quả bất thường)" | 🟡 | Thêm 1 câu: "Không chạy lặp: ngân sách đăng nhập sai ngày UTC đã dùng 30/30; lần chạy `run-20261127-143546` cho cùng kết quả (30/30, 13 expected-fail)". Lần chạy CI `api-full` đầu tiên sau khi gộp dùng làm lần lặp đối chiếu |
| E3 | Bước defects sẽ cần "tái hiện độc lập, tách khỏi evidence tự động" (checklist bug report), nhưng chưa có cách làm cho bug API (`npm run repro` chỉ có SauceDemo) | `tests/repro/`; checklist `qa-reviewer.md` mục 5 (Bug report) | 🟡 | Đưa lên HITL #3 thành câu hỏi: bug API tái hiện độc lập bằng gì (script `curl` / Node riêng ghi vào `bugs/<…>/manual/`), và với BUG-37, BUG-40 thì **không** gửi thêm đăng nhập sai trong ngày đã hết ngân sách |

## Việc cần làm trước HITL #3 (xếp theo mức độ)
1. 🟡 C1, E2: sửa vài câu trong `triage.md` (không cần chạy lại).
2. 🟡 E1: sửa `run-evidence.mjs` gộp với RB-102, dựng lại mục lục ở lần chạy sau (không chạy lại riêng cho việc này).
3. 🟡 E3: đưa vào phiếu HITL #3 (cách tái hiện độc lập bug API cho bước defects).

Điểm cần người dùng quyết ở HITL #3 cho RB-101: không có bug mới; 4 bug BUG-37 → BUG-40 (đã duyệt ở HITL #1) tái hiện đúng ở lần chạy này. Chỉ còn E3.

## Xử lý sau review
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| C1 | 🟡 | Dòng TC-013 ghi đủ 2 assertion × 2 biến thể (4); thêm số lỗi TC-012, TC-014, TC-030 | ✅ | `triage.md:37-40`: TC-012 (2), TC-013 (4, 2 assertion × 2 biến thể), TC-014 (6), TC-030 (3); đếm lại từ run JSON |
| E1 | 🟡 | Mục lục evidence API: đúng tên lệnh, câu `manual/` chỉ khi có thư mục | ✅ | `scripts/run-evidence.mjs` (madeBy / hasBadLogin / hasManual, dòng ~91-105) + `scripts/run-tests.mjs:139` (truyền `EVIDENCE_INDEX_CMD`); đã dựng lại mục lục cả 2 feature bằng `--index-only`, không chạy test |
| E2 | 🟡 | Triage ghi lý do không chạy lặp | ✅ | `triage.md:43` |
| E3 | 🟡 | Câu hỏi HITL #3: cách tái hiện độc lập bug API | ✅ | `triage.md:56` mục "Cần quyết ở HITL #3" |

## Kiểm lại lượt 2
- **Ngày**: 2026-11-28 · **Reviewer**: qa-reviewer · **Phạm vi**: chỉ phần thay đổi (`git diff` của `scripts/run-evidence.mjs`, `scripts/run-tests.mjs`; đọc trực tiếp `triage.md`, `evidence/README.md` vì chưa được git theo dõi). Không gửi request nào, không chạy `test:run` / `test:evidence` / `EVIDENCE=1`.
- **Cách kiểm**:
  - Đếm lại `error_details` theo TC từ `run-results/run-20261128-051405.json`: TC-012 2, TC-013 4, TC-014 6, TC-030 3, BUG-37 9 TC = 23, tổng 38.
  - `node --check` 2 script: sạch.
  - Chạy `run-evidence.mjs <feature> --index-only` trên **bản sao** evidence trong thư mục nháp (không đụng `qa-runs/`): thân mục lục (trừ dòng 3) **giống hệt** bản trong repo; khi không đặt `EVIDENCE_INDEX_CMD`, dòng 3 ghi `npm run test:evidence -- restful-booker-auth-api --index-only`; thêm thử thư mục `manual/` thì câu `manual/` và dòng "Tái hiện độc lập" hiện đúng.
  - Mục lục: 43 link, mỗi link trỏ tới README có thật, và cả 43 README của TC đều có trong mục lục (so 2 chiều). Cột "Kết quả": 17 Passed, 13 Failed (BUG-37 ×9, BUG-38 ×2, BUG-39, BUG-40), khớp run JSON. README của TC không bị ghi lại (giờ sửa file 05:14–05:15 UTC, "Thời điểm" 05:14:07.639Z → 05:15:16.038Z).

### Từng dòng "Xử lý sau review"
| # | Kết quả | Bằng chứng |
|---|---|---|
| C1 | ✅ | `triage.md:37-40`: TC-012 (2), TC-013 "2 assertion ×2 biến thể (4)", TC-014 (6), TC-030 (3); khớp run JSON. Cộng cột số lỗi: 23 + 2 + 4 + 6 + 3 = 38 = số `error_details` |
| E1 | ❌ (sửa một phần, L8) | Phần script **đúng**: `run-evidence.mjs:89-91` (madeBy / hasBadLogin / hasManual), `run-tests.mjs:139` truyền `EVIDENCE_INDEX_CMD: 'npm run test:run'`; câu `manual/` đã ẩn (không có thư mục `manual/`), câu `@bad-login` giữ đúng (spec có tag này). **Nhưng** file đã nộp `evidence/README.md:3` ghi "Tạo tự động bởi `npm run test:run` lúc 2026-11-28T05:50:57.542Z": lúc đó **không có** lần `test:run` nào (lần chạy chính thức 05:14:05 → 05:15:17; không có run JSON nào lúc 05:50). Theo mã, chỉ ra được chữ `test:run` khi `EVIDENCE_INDEX_CMD` được đặt tay lúc dựng lại; chạy `--index-only` thường sẽ ghi `npm run test:evidence -- … --index-only` (đã thử trên bản sao). Người đọc phiếu HITL / bước defects sẽ đi tìm một lần chạy lúc 05:50 không tồn tại. Thêm: 2 câu trong `triage.md` nay sai theo (N1) |
| E2 | ✅ | `triage.md:43`: lý do ngân sách 30/30, lần chạy `run-20261127-143546` cùng kết quả, CI `api-full` làm lần đối chiếu |
| E3 | ✅ | `triage.md:56-58` mục "Cần quyết ở HITL #3": câu hỏi cách tái hiện độc lập bug API + lưu ý không gửi thêm đăng nhập sai trong ngày đã hết ngân sách |

### Phát hiện mới
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| N1 | Dòng đầu mục lục gộp 2 sự thật khác nhau vào một câu ("lệnh tạo evidence" + "giờ dựng mục lục") nên sai ngay khi mục lục được dựng lại riêng; mục Evidence của triage không còn đúng sau khi dựng lại | `evidence/README.md:3` (05:50:57Z, `test:run`); `triage.md:64` "mục lục `evidence/README.md`, đều ghi lúc 2026-11-28T05:14:07Z → 05:15:17Z"; `triage.md:67` "Nhỏ: dòng đầu mục lục ghi … `test:evidence`" (nay ghi `test:run`, câu này đã lỗi thời) | 🟡 | (1) Không đặt tay `EVIDENCE_INDEX_CMD` khi dựng lại; tốt nhất tách dòng 3 thành 2 câu do script tự tính: "Evidence của lần chạy: <min → max "Thời điểm" của README TC>" và "Mục lục dựng lại lúc <giờ> bằng `<lệnh>`". Tối thiểu: dựng lại `--index-only` không đặt biến (dòng 3 sẽ ghi đúng lệnh và giờ dựng). (2) `triage.md:64`: tách "README TC 05:14:07Z → 05:15:16Z" và "mục lục dựng lại 05:5x bằng `--index-only` sau review executor"; xóa `triage.md:67`. Không cần chạy test |

### Kết luận lượt 2
✅ **Đạt** (0 🔴, 0 🟠). 3/4 dòng được chấp nhận; **E1 chưa chấp nhận** (script đúng, file mục lục ghi sai lệnh / giờ) và gộp với N1 🟡: sửa dòng 3 của mục lục + 2 câu triage trước khi commit (≤ 10 phút, không chạy test). Không chặn HITL #3, nhưng nên sửa trước khi đưa phiếu HITL #3 vì phiếu dẫn tới evidence và triage. Sau khi sửa, orchestrator tự kiểm lại 3 chỗ (`evidence/README.md:3`, `triage.md:64`, `triage.md:67`), không cần lượt 3.

## Orchestrator tự kiểm (sau lượt 2)
Lượt 2 chỉ còn 🟡, nên theo quy tắc 2026-11-27 orchestrator tự sửa và tự kiểm, không chạy lượt 3.

| # | Xử lý | Kiểm |
|---|---|---|
| E1 + N1 | `scripts/run-evidence.mjs:95-98`: chạy tay `--index-only` (không có `EVIDENCE_INDEX_CMD`) thì dòng đầu ghi "Mục lục dựng lại bằng `npm run test:evidence -- <feature> --index-only` lúc … từ evidence có sẵn (không chạy test)"; gọi từ `test:run` vẫn ghi "Tạo tự động bởi `npm run test:run`". Đã dựng lại mục lục (dòng 3 đúng câu mới, vẫn đủ 43 mục TC) | ✅ `node --check`, đọc lại dòng 3 `evidence/README.md`, đếm 43 |
| N1 (triage) | `triage.md:64` bỏ giờ mục lục khỏi câu evidence; `:67` thay câu "Nhỏ: … test:evidence" bằng ghi chú mục lục dựng lại sau review | ✅ đọc lại |
