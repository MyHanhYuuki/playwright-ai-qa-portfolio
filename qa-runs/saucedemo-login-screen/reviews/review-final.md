> Tiến độ: ✅ Hoàn tất

# Review: toàn bộ pipeline (review cuối), saucedemo-login-screen
- 2026-11-24 · Reviewer: qa-reviewer · Kết luận: ⚠️ Cần sửa (**kết quả màn Login đúng**, còn **4 điểm 🟠 phải sửa trước khi dùng làm mẫu** cho Cart → Checkout)

> Phạm vi: toàn bộ `qa-runs/saucedemo-login-screen/`, `tests/`, `playwright.config.ts`, `package.json`, `scripts/*.mjs`, `.github/workflows/playwright.yml`, `.claude/agents/*.md`, `.claude/commands/qa-orchestrator.md`, `CLAUDE.md`, `README.md`, `docs/`.
> Checklist đã dùng: test-design, test-impl, script-gen, executor, defects (qa-reviewer.md).

**Đã kiểm chứng, đạt (không cần sửa)**
- **Số liệu khớp xuyên suốt**: 7 AC · 25 quan sát (O-01→O-25) · 14 câu Q&A (6 blocking, 8 non-blocking, Open 0) · 25 viewpoint (20 in, 5 out) · 33 TC (mọi viewpoint `in` có TC) · 33 test trong spec + 1 seed = 34 · run JSON 33 TC, 2 `expected_status: failed` (TC-028, TC-033) · triage 31/2 · RTM 31 Passed / 2 Failed, AC 7/7 có TC, 5/7 đạt, 36 dòng chi tiết (`rtm-report.html` cùng số) · `tong-quan-du-an.md` §12 dòng 106–108, 111 · README.
- **Tag ↔ CSV**: `@smoke` đúng 5 TC (001, 003, 020, 023, 026). `@AC-x` khớp `linked_ac` cả 3 TC gắn 2 AC (TC-027, 029, 030). `@BUG-01`/`@BUG-02` + `test.fail()` ở spec:143, :252.
- **Link**: 303 link tương đối trong 74 file `.md`/`.html` (qa-runs/, docs/, README, CLAUDE.md, .claude/, knowledge-base/) đều trỏ tới file có thật, anchor `defects.md#bug-0x-…` khớp heading.
- **Chạy lại** `npx playwright test --reporter=line`: **34 passed (17.8s)**, khớp run-20261124-184137 (17,9 giây).
- **Privacy**: `git grep` trên file đã track (kể cả nhị phân trong qa-runs/) không có tên người dùng của máy, đường dẫn thư mục cá nhân, `AppData`, token (`ghp_`, `github_pat_`, `sk-ant`…), email thật. Email duy nhất là `users.noreply.github.com`.
- **Review cũ đã xử lý thật**: review-defects A1 (TC-028 kiểm tra 2 chiều bằng `expect.soft`, spec:155, :168), A2/B1 (`manual/` của 2 bug), B2, B3, B6, D8, E1; C1/B5/D1/D2/E3 (`build-rtm.mjs:43-50, 58-61, 113`). review-test-design C2, C3. review-executor E2 (§12 ghi "31 pass + 2 bug đã biết"). Chỉ còn sót 2 chỗ, xem C2, C4.

## A. Phát hiện mới (kiểm chứng trên web nếu có thể)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | Kết luận "TC-006 **sát ngưỡng** 10 giây, nguy cơ chập chờn" là **suy luận sai**. 10,4 giây là thời gian **cả test** (gồm mở trình duyệt, tải trang). Riêng bước chờ URL chỉ khoảng 5,1–5,2 giây, tức mới dùng khoảng 50% ngưỡng 10 giây | Web (Node script, context mới, đã đóng và xóa script): `performance_glitch_user` từ lúc bấm Login tới `/inventory.html` mất 5128 ms và 5101 ms, `standard_user` 64 ms. `evidence/all-cases/TC-006/README.md`: "sau 5.2 giây". Run JSON: TC-001 (chỉ mở trang) cũng mất 5112 ms. Câu sai nằm ở `triage.md:45` (N1), `known-issues.md:12`, `review-executor.md` E1, `docs/learning/05-chay-test-va-phan-loai.md:44` | 🟡 | Sửa N1: "bước đăng nhập ~5,2 giây / ngưỡng 10 giây, chưa có nguy cơ". Bài học: đo đúng **bước** cần đo, đừng lấy thời gian cả test |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Không có `review-test-impl.md`.** Orchestrator yêu cầu bước này, nhưng checklist test-impl chưa bao giờ được chạy chính thức (review-test-design chỉ xem "bản nháp test case"). Nếu đã chạy, nó bắt được D1 bên dưới (mật khẩu thật trong TC-028, thêm sau review-defects) | `qa-orchestrator.md:26, 84`. Thư mục chỉ có review-test-design, review-script-gen, review-executor, review-defects | 🟠 | Bản mẫu phải đủ 5 file review. Chạy bù review test-impl cho `test-cases.csv` hiện tại (hoặc ghi rõ trong review-test-design là đã gộp, kèm checklist test-impl) |
| B2 | **Không có tài liệu "bắt đầu màn hình mới".** Có nhiều quy ước ngầm mà nếu không biết thì Cart sẽ chạy sai, không báo lỗi: (1) AC phải viết đúng dạng `- **AC-n**: …` thì RTM mới đọc được. (2) Tên spec **phải trùng** tên thư mục `qa-runs/<feature>/`, vì evidence lấy thư mục từ tên file spec. (3) BUG-xx/TC-xxx đánh số riêng từng chức năng hay chung cả repo (xem D2, D3). (4) Bug ở cột `notes` của TC mới vào RTM | `build-rtm.mjs:22, 37`. `tests/utils/evidence.ts:32-34`. README, CLAUDE.md, `ai-agent-workflow.md` không có mục này | 🟠 | Thêm mục "Bắt đầu chức năng mới" (CLAUDE.md hoặc `ai-agent-workflow.md`): tạo `qa-runs/<feature>/requirement/requirement.md` theo mẫu SD-101 → `/qa-orchestrator <feature>` → các quy ước (1)–(4) |
| B3 | **Evidence không có trong pipeline của agent.** script-gen không biết fixture `evidence`, không biết phải import từ `../fixtures`, không biết `test.fail()` + tag `@BUG-xx` + `tests/data/bugs.ts`. Executor và orchestrator không có bước `npm run test:evidence`. Cả cách làm của Login hiện chỉ nằm trong code và Bài 5 | `script-gen.md:86` (mẫu import `@playwright/test`), grep `evidence\|test.fail\|bugs.ts` trong `script-gen.md`, `executor.md`: 0 kết quả. `qa-reviewer.md:49` lại bắt buộc `test.fail()` | 🟠 | script-gen.md: mẫu spec import `{ test, expect } from '../fixtures'`, gọi `evidence.shot()`, bug đã biết thì `test.fail(true, 'BUG-xx …')` + tag `@BUG-xx`. Orchestrator bước 6: chạy `test:evidence` cho feature, cập nhật `bugs.ts` |
| B4 | run JSON chỉ lưu **lỗi đầu tiên**. TC-028 dùng `expect.soft` nên có 2 lỗi, nhưng file chỉ có "Chiều 1". Khẳng định "TC-028 fail ở cả 2 chiều" không truy được về `run-results/` | `run-20261124-184137.json` TC-028 `error`: "Error: Chiều 1: ô Username đã nhập không được bị đánh dấu lỗi". `triage.md:19`, `defects.md:23` | 🟡 | Executor lưu `errors[]` (mọi lỗi của `results[].errors`), cập nhật schema trong `executor.md` |
| B5 | Bảng thuật ngữ chưa có `expect.soft`, evidence | `docs/thuat-ngu.md` (grep: 0) | 🟡 | Bổ sung |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | **Schema run JSON lệch giữa agent, file thật và script RTM.** `executor.md` không có `expected_status`, `outcome`, `expected_fail`, nhưng `build-rtm.mjs` cần các trường này để nhận ra "bug có vẻ đã sửa" và flaky. File thật lại ghi `summary.passed: 33` trong khi 2 test có `status: failed` | `executor.md:32-35`. `build-rtm.mjs:189-193`. Run JSON `summary` | 🟠 | Chốt schema trong `executor.md` đúng như file thật (`expected_status`, `outcome`, `errors[]`, `summary.expected_fail`) và ghi nghĩa của `summary.passed`. Executor cho Cart làm theo mẫu hiện tại thì RTM sẽ **không** cảnh báo khi bug được sửa |
| C2 | `triage.md` phần "Tái hiện độc lập (bằng tay)" vẫn link tới evidence **tự động** (`TC-028/`, `TC-033/`), không link `manual/`. Review-defects B1 mới sửa ở `defects.md` | `triage.md:37-38` | 🟡 | Đổi link sang `…/manual/README.md` |
| C3 | `defects.md:5` ghi evidence lấy từ lần chụp **17:23**, "cùng code test với lần chạy trên". Thực tế evidence gồm 3 lần chụp: TC-001 16:45, TC-033 17:23, TC-028 18:14 (sau khi sửa code TC-028, khác code của run-150906). `defects.md:23` lại nói đúng "18:14" | `evidence/all-cases/TC-001/README.md` (09:45Z), `bugs/[id_bug_2]_BUG-02/TC-033/README.md` (10:23Z), `TC-028/README.md` (11:14Z) | 🟡 | Sửa dòng 5: "evidence từ các lần chụp 16:45–18:14, TC-028 chụp lại sau khi sửa". Về sau chụp lại cả feature một lần trước khi viết defects |
| C4 | `spec-review.md` chưa cập nhật sau HITL #1: còn ghi "Còn mở: Q12, Q13, Q14" và "Độ dài tối đa chờ Q14", trong khi `q-and-a.md` đã Answered 14, Open 0 | `spec-review.md:12, 71`. `q-and-a.md:7` | 🟡 | Sửa thành "Đã chốt hết (Q1–Q14)" |
| C5 | Triage không có mục riêng cho lần chạy lại `run-20261124-184137`, mới chỉ là một ghi chú trong mục TC-028. RTM lại lấy kết quả từ chính lần chạy này | `triage.md:1-5, 19`. `rtm.md:4`. `executor.md:64` ("thêm một mục mới cho mỗi lần chạy") | 🟡 | Thêm mục ngắn "Triage Report: run-20261124-184137" (31/2, 0 script-issue) |
| C6 | `tong-quan-du-an.md` §12 lệch code: "2 fixture" nhưng có 3 (`evidence`, `loginPage`, `loggedInPage`). "5 test smoke" nhưng `npm run test:smoke` chạy 6 (gồm seed). "15,8 giây" là lần chạy cũ, lần mới nhất 17,9 giây | `docs/tong-quan-du-an.md:109-110`. `tests/fixtures/index.ts:16-40`. `tests/seed.spec.ts:11` | 🟡 | Sửa số liệu, ghi rõ lấy từ run nào |
| C7 | Tên cũ `KI` còn sót: cột "Ticket_KI" ở mục lục evidence, do script sinh ra nên chạy lại sẽ sinh tiếp. Mục lục cũng liệt kê `manual` như một test case | `scripts/run-evidence.mjs:178`. `evidence/README.md:7, 10, 12` | 🟡 | Đổi thành "Ticket_BUG". Cột "Test case" ghi `manual (tái hiện bằng tay)` |
| C8 | `ai-log.md`: bảng Tổng hợp chỉ có #1–#6, thiếu #7, #8. Phần chi tiết thiếu #3 | `docs/ai-log.md:11-16, 22-59` | 🟡 | Thêm #7, #8 vào bảng, thêm chi tiết #3 (hoặc ghi "chỉ có tóm tắt") |
| C9 | `ai-agent-workflow.md` lệch pipeline thật: Bài 7 ghi "problem_user" (thực tế làm BUG-01/02 của Login). Mermaid đi thẳng script-gen → executor → HITL, bỏ qua qa-reviewer ở 2 bước này và review defects. §4 thiếu `evidence/`, `rtm.md`. Dòng 54 không có bước `defects` | `docs/ai-agent-workflow.md:54, 81-92, 113-127, 142` | 🟡 | Cập nhật theo `qa-orchestrator.md` |
| C10 | Bài 7 vẫn ghi tần suất "100% (3/3)", số đã bỏ sau review-defects B4 | `docs/learning/07-bug-report-va-rtm.md:22` | 🟡 | Đổi thành "100% (2 lần chạy có file kết quả + tái hiện bằng tay)" |
| C11 | README: ".claude/agents/ 5 QA agents" (có 6 file). "Run locally" thiếu `test:evidence`, `rtm`. Cấu trúc thư mục thiếu `scripts/` | `README.md:54, 43-49` | 🟡 | Bổ sung |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | TC-028 ghi **mật khẩu thật** trong bước test, trái quy tắc ngay đầu test-data. Bước 4 ghi "Tải lại trang", còn code gọi `loginPage.goto()` | `test-cases.csv:29` ("nhập Password: secret_sauce"). `test-data.md:3`. Spec:158 | 🟡 | Đổi thành `<mật khẩu hợp lệ>` (TD-01). Bước 4 đổi thành "Mở lại trang /" |
| D2 | **`BUG_TICKETS` dùng chung cả repo, khóa chỉ là `BUG-01`.** Nếu Cart cũng đánh số từ BUG-01 thì evidence bug của Cart lấy ticket của Login (sai thư mục `bugs/<ticket>_BUG-01`). Khi Login log ticket thật (vd `SD-201`), bug Cart cũng mang `SD-201` | `tests/data/bugs.ts:5-8`. `tests/utils/evidence.ts:36-39` | 🟠 | Chọn 1 trong 2 cách trước khi làm Cart: BUG-xx đánh số **chung cả repo** (Cart bắt đầu từ BUG-05, ghi trong test-design.md), hoặc khóa theo feature `{ 'saucedemo-login-screen': { 'BUG-01': … } }` |
| D3 | **TC id lặp giữa các chức năng làm lệnh chạy nhầm.** Subset của executor là `--grep "TC-001\|TC-004"`, không giới hạn file spec, nên sẽ chạy cả TC-001 của Login lẫn Cart. `test:evidence` luôn chạy `tests/specs` (mọi feature). Thêm đường dẫn spec cũng không giúp gì, vì Playwright gộp các bộ lọc theo kiểu "hoặc". Hậu quả: chụp lại toàn bộ evidence Login (ảnh + video bị ghi đè) mỗi lần làm Cart | `executor.md:22`. `scripts/run-evidence.mjs:152` | 🟠 | Executor subset: `npx playwright test tests/specs/<feature>.spec.ts --grep …`. `run-evidence.mjs`: nhận `--feature <name>` và chỉ truyền `tests/specs/<feature>.spec.ts` |
| D4 | Mẫu trong agent lệch với cách làm thật nên dễ dạy sai: `script-gen.md` nhắc `BasePage.ts` (không có), `tests/data/<feature>.data.ts` (Login dùng `messages.ts`, `users.ts`). `test-design.md` mẫu `viewpoint.csv` thiếu cột `scope`, `source` mà RTM cần. `test-impl.md` mẫu dùng `TD-001`, tags `"smoke,regression"`, test-data dạng mục `## TD-001` (thật: `TD-01`, `smoke;regression`, dạng bảng). Orchestrator ghi `// BUG-001` | `script-gen.md:17, 36`. `test-design.md:79-83`. `test-impl.md:33, 46` (git grep). `qa-orchestrator.md:138` | 🟡 | Sửa mẫu theo đúng file của Login (Login là chuẩn) |
| D5 | Ghi chú evidence khẳng định kết quả **trước** khi assertion chạy: ảnh "Kết quả: BUG" của TC-033 được chụp trước `expect`, TC-028 cũng vậy. Khi bug được sửa, ảnh vẫn ghi "BUG-02: … vào được" (README có dòng "⚠️ Bug có vẻ đã được sửa" bù lại một phần) | Spec:151-155, :164-168, :258-262 | 🟡 | Ghi chú trung tính ("Kết quả sau khi mở trang bằng cookie giả"), hoặc chụp sau assertion bằng `expect.soft` |
| D6 | `qa-reviewer.md` không có `Bash` trong `tools`, nhưng checklist và các review đã làm đều cần chạy `--list` hoặc Node script để kiểm chứng | `qa-reviewer.md:4`. `review-script-gen.md` ("kiểm bằng `--list`"), `review-defects.md:5` | 🟡 | Thêm `Bash` (chỉ đọc: `--list`, chạy test, script kiểm chứng rồi xóa) hoặc ghi rõ việc này do orchestrator làm |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Các file review không cùng một format: review-test-design, review-script-gen, review-executor không có đủ mục A–E và cột Bằng chứng/Mức. Người học copy file nào cũng thành mẫu | So `review-script-gen.md`, `review-executor.md` với `qa-reviewer.md:15-25` | 🟡 | Khi làm Cart, chỉ copy theo mẫu `review-defects.md` / file này |
| E2 | `npm run rtm` không truyền feature thì tạo lại RTM của **mọi** feature. Khi làm Cart, RTM của Login cũng bị tạo lại (git báo đổi file nếu dữ liệu đã khác) | `build-rtm.mjs:11-13` | 🟡 | Ghi trong orchestrator bước 7: `npm run rtm -- <feature>` |
| E3 | Mục lục evidence không xóa thư mục TC đã bỏ, vì chỉ xóa thư mục của test đang chạy | `evidence.ts:40-44`. `run-evidence.mjs:187` | 🟡 | Khi đổi hoặc xóa TC, xóa tay `all-cases/TC-xxx` cũ. Hoặc script cảnh báo thư mục TC không có trong `test-cases.csv` |

## F. Sẵn sàng làm mẫu cho màn hình khác?
**Kết luận: ⚠️ Dùng được làm mẫu SAU KHI sửa 4 điểm chặn (D2, D3, C1, B3) và viết mục B2.** Nội dung QA của Login đã đúng và nhất quán. Các điểm chặn không nằm ở kết quả Login, mà ở chỗ **code và hướng dẫn chỉ đúng khi repo có một chức năng**. Thêm Cart vào là sai mà không báo lỗi.

### Chặn trước khi bắt đầu Cart → Checkout
- [ ] **D2**: chốt cách đánh số BUG-xx (chung cả repo, hoặc khóa `bugs.ts` theo feature)
- [ ] **D3**: lệnh subset của executor và `test:evidence` phải giới hạn theo file spec của feature
- [ ] **C1**: chốt schema run JSON trong `executor.md` (`expected_status`, `outcome`, `errors[]`)
- [ ] **B3**: đưa fixture `evidence`, import `../fixtures`, `test.fail()` + `@BUG-xx`, bước `test:evidence` vào `script-gen.md` và orchestrator
- [ ] **B2**: viết mục "Bắt đầu chức năng mới" (quy ước tên spec = tên thư mục, dạng AC, đánh số ID)

### Copy nguyên (đã đạt)
- Cấu trúc thư mục `qa-runs/<feature>/`: requirement → spec-review (có bảng O-xx) → viewpoint (có `scope`, `source`) → q-and-a (1 file duy nhất) → known-issues → improvements → test-cases (15 cột) → test-data (bảng TD/MSG) → triage → defects (bảng tổng hợp, mục "Khi log ticket thật", `manual/`) → RTM tự sinh.
- Cách viết `defects.md` (Severity/Priority có lý do riêng, tần suất trích được `run-results/`, bảng 2 chiều khi bug có biến thể) và `known-issues.md` (cột "Test phải bắt").
- `tests/fixtures/index.ts` (`loggedInPage` dùng làm điều kiện trước cho Cart), `isLoginScreen`, `LoginPage`, `InventoryPage` (chỉ thêm method mới).
- `scripts/build-rtm.mjs` (cảnh báo skip / flaky / lệch số đã có), `playwright.config.ts`, CI.

### Phải đổi cho Cart
- `requirement/requirement.md` mới (giữ dạng `- **AC-n**: …`), tên feature, ví dụ `saucedemo-cart-checkout`, trùng với `tests/specs/saucedemo-cart-checkout.spec.ts`.
- Dữ liệu: tách `tests/data/messages.ts` (hiện chỉ có thông báo của Login), đặt tên file data theo một quy ước (D4).
- `protectedPages`, MSG của Cart/Checkout. Page Object mới: `CartPage`, `CheckoutPage`.
- Khi làm Cart chỉ chạy `test:evidence`, `rtm` cho Cart (D3, E2), không chụp lại evidence của Login.

### Nên sửa nhưng không chặn
A1, B1, B4, B5, C2–C11, D1, D4–D6, E1, E3: chủ yếu là số liệu, link, mẫu tài liệu. Có thể gộp vào một commit `docs` trước khi bắt đầu Cart.

## Xử lý sau review (2026-11-24)
Người duyệt chọn sửa nhóm **chặn làm Cart** và nhóm **đang sai thông tin**. Nhóm còn lại để backlog.

**Kiểm chứng lại review:** 25/26 điểm đúng. Riêng D3, ý "thêm đường dẫn spec cũng không giúp gì, vì Playwright gộp các bộ lọc theo kiểu hoặc" là **sai**: đường dẫn file và `-g` được áp **cùng lúc** (thử `npx playwright test tests/seed.spec.ts -g "TC-001" --list` → 0 test). Cách sửa reviewer đề xuất vẫn đúng.

| # | Xử lý |
|---|---|
| D2 | ✅ Chọn cách A: `BUG-xx` **đánh số chung cả repo** (feature sau bắt đầu từ BUG-05). Ghi trong `CLAUDE.md`, `test-design.md`, `tests/data/bugs.ts` |
| D3 | ✅ Script mới `npm run test:run -- <feature>` (đường dẫn spec + `-g`). `npm run test:evidence -- <feature>` bắt buộc có feature, chỉ chạy và chỉ tạo lại mục lục của feature đó. Executor, orchestrator, lệnh xác nhận flaky đều theo feature |
| C1 | ✅ Script `run-tests.mjs` tự ghi file kết quả, có `expected_status`, `outcome`, `errors[]`, `summary.expected_fail`. `executor.md` có schema đúng + bảng nghĩa từng trường (gồm nghĩa của `summary.passed`). Đã thử: subset TC-001, TC-028 → TC-028 có 2 lỗi trong `errors[]` (file thử đã xóa) |
| B3 | ✅ `script-gen.md`: import từ `../fixtures`, `evidence.shot()`, `test.fail()` + `@BUG-xx`, `expect.soft` cho biến thể, `bugs.ts`, bỏ `BasePage.ts` và `<feature>.data.ts`. Orchestrator bước 4 và 6 có bước chụp evidence |
| B2 | ✅ Mục "Bắt đầu chức năng mới" trong `CLAUDE.md`: tên feature = tên spec, dạng AC, cách đánh số từng loại ID, bug ghi ở cột `notes` |
| A1 | ✅ Sửa kết luận sai "TC-006 sát ngưỡng" ở `triage.md` N1, `known-issues.md`, `review-executor.md` E1, Bài 5 (kèm bài học: đo đúng bước) |
| C2 | ✅ `triage.md` link sang `manual/` |
| C4 | ✅ `spec-review.md`: Q1–Q14 đã chốt |
| C6 | ✅ §12: 3 fixture, smoke 5 (+1 seed), thời gian lấy từ run-20261124-184137 |
| C7 | ✅ Cột `Ticket_BUG`, dòng `manual` ghi "Tái hiện bằng tay" (thêm `--index-only` để tạo lại mục lục mà không chạy test) |
| C10, C11 | ✅ Bài 7 bỏ "3/3". README: 6 agent, lệnh `test:run` / `test:evidence` / `rtm`, thư mục `scripts/`, `utils/` |
| D1 | ✅ TC-028 và `defects.md` không còn mật khẩu thật, bước 4 ghi "Mở lại trang /" |
| B1, B4, B5, C3, C5, C8, C9, D4–D6, E1–E3 | ⏭ **Backlog** (không chặn, không sai thông tin). B4 đã có `errors[]` từ lần chạy sau; E2 đã giảm vì lệnh có `<feature>` |
