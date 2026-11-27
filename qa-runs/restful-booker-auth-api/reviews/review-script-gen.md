# Review: bước script-gen, RB-101 Xác thực và kiểm tra hệ thống (restful-booker-auth-api)

- **Ngày**: 2026-11-27 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa** (0 lỗi 🔴, 3 lỗi 🟠, 8 lỗi 🟡; 1 điểm ❓)
- **Phạm vi**: thay đổi **chưa commit** trên nhánh `feat/bai10-restful-booker-api`.
  - Mới: `tests/specs/restful-booker-auth-api.spec.ts` (30 test), `tests/fixtures/api.ts`, `tests/api/` (`rb-client.ts`, `rb-run.ts`, `api-evidence.ts`, `restful-booker.teardown.ts`), `tests/data/restful-booker.ts`.
  - Sửa: `playwright.config.ts`, `package.json`, `scripts/run-tests.mjs`, `run-evidence.mjs`, `run-stability.mjs`, `.github/workflows/playwright.yml`, `tests/data/users.ts`, `messages.ts`, `bugs.ts`, `CLAUDE.md`.
  - Kết quả chạy `run-results/run-20261127-143546.json`, `evidence/`.
  - Mục riêng: các thay đổi quy tắc / tài liệu chưa soát.
- **Nguồn đối chiếu**:
  - RB-101: `test-cases.csv` (30 TC `approved`), `test-data.md` (TD-01 → TD-28, "Ghi chú cho script-gen"), `known-issues.md` (quyết định HITL #1, HITL #2), `reviews/review-test-impl.md`.
  - RB-102: `test-data.md` (TD-07, TD-29, "Ghi chú cho script-gen"), `known-issues.md`.
  - Quy ước: `CLAUDE.md`, `.claude/agents/qa-reviewer.md` (L9, L15 → L18).
- **Cách kiểm**:
  - Đọc toàn bộ spec và hạ tầng API. So tự động spec ↔ CSV:
    - 30/30 test;
    - tag `@AC-x` / `@BUG-xx` / `@smoke` / `@security` / `@bad-login` khớp cột `linked_ac` + `tags` (bỏ `regression`): 0 lệch;
    - `test.fail()` có ở đúng 13 TC có câu đầu "Bug đã biết";
    - không có `waitForTimeout`, `networkidle`, `skip` / `fixme` / `only`.
  - `npm run typecheck`: sạch. `--list`:
    - `--project=chromium` **133** test (không có test API, không có teardown);
    - `--project=api` 31 (30 + teardown);
    - `--project=api -g "TC-004"` vẫn kèm teardown (bộ lọc không bỏ teardown).
  - **Kiểm đột biến cổng cứng L18, offline**: stub HTTP cục bộ trong thư mục nháp ngoài repo, `RB_BASE_URL` trỏ vào stub, tài khoản giả qua `RB_ADMIN_*`, `--output` ra thư mục nháp. **0 request tới máy chủ công khai, 0 lần đăng nhập sai thật**; không sửa file nào của repo.
  - Đọc kết quả chạy: 30 test, 17 pass, 13 "fail như dự kiến". Đọc **từng lỗi**: mỗi TC bug chỉ fail ở phần bug ((e), (d), (c)/(e) hoặc 3 bước HTTP). Teardown: 8 booking trong sổ, dọn sót 0, 141 request, 30 lần đăng nhập thất bại.
  - Quét riêng tư `run-results/`, `evidence/`:
    - không có mật khẩu (kể cả không phân biệt hoa thường), chuỗi Basic, token 15 hex hay đường dẫn máy;
    - `Cookie: token=` chỉ có `***` hoặc `abc123` (giá trị công khai của tài liệu);
    - TC-016 chỉ hiện `password=***`.
  - Kiểm `git stash`: đối chiếu commit stash `8387427` (14:30:58) với cây làm việc.

## Kiểm đột biến cổng cứng (L18), trọng tâm 1
| Chế độ stub | Hành vi `/auth` khi đăng nhập sai | Kết quả TC-004, TC-010 | Đúng mong đợi? |
|---|---|---|---|
| `current` (như máy chủ hiện nay) | `200 {"reason":"Bad credentials"}` | ✘ "fail như dự kiến" (`expected`), toàn bộ lần chạy xanh | ✅ |
| `leak` (đột biến: phần **đang đúng** hỏng) | `200 {"reason":"Bad credentials","token":"…"}` | **`unexpected` (đỏ)**: `expectedStatus = passed`, vì cổng cứng `(a)–(d) phải đạt trước test.fail` ném lỗi **trước khi** tới `test.fail()`. Lỗi ghi đúng `(a) body không có trường token`, `(b) MSG-01`. Token rò rỉ **không** xuất hiện trong thông báo lỗi (che bằng `safeJson`) | ✅ |
| `fixed` (bug đã sửa) | `401` / `400` | "Expected to fail, but passed" (đỏ): báo bỏ `test.fail()` | ✅ |

Kết luận: cổng cứng hoạt động đúng như thiết kế TD-28. Lỗi của phần đang đúng làm test đỏ thật, không thành "fail như dự kiến". Đột biến `leak` làm lộ phát hiện P1 (mục D).

## Checklist (mục 5, code test)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Mỗi TC đúng 1 test, tên bắt đầu bằng TC id, tag khớp tài liệu | ✅ Đạt | So tự động 30/30, 0 lệch. Bỏ `@regression` (mọi TC đều có), không script nào lọc theo tag này |
| Assertion theo expected của TC (HITL #1, #2), không theo hiện trạng | ✅ Đạt | 401 / 400 (TC-009 rỗng = 400), 413 / 400 + JSON, 415, 201 `Created`, `RB_REJECT` 403 dùng chung, HTTP 301 / 308 (GET) và 307 / 308 (POST) với `Location` cùng host + đường dẫn, `426`, HSTS `max-age > 0` |
| Oracle phân biệt được đúng / sai (L15) | ✅ Đạt | Bước 0 đối chứng cứng ở mọi TC sai tài khoản; TC-022 có đối chứng dương cùng booking; TC-026 so `Content-Length` của HEAD với GET, không assert body; TC-003 kiểm token khác `abc123`; TC-006 chặn dữ liệu nếu biến thể viết hoa trùng gốc |
| Bug đã biết: TD-28 (gửi hết → soft → cổng cứng → `test.fail()` → soft phần bug), không `test.fail()` trong vòng lặp | ✅ Đạt | 13 TC, đã kiểm đột biến. TC-030 dùng `expect` cứng trước `test.fail()` (tương đương cổng) |
| Không chờ cứng; test độc lập; dữ liệu dùng chung ở `tests/data/` | ✅ Đạt | Không `beforeAll`; mỗi test tự tạo booking, lấy token mới; `rbAdmin`, `MSG_RB_AUTH`, `RB_REJECT`, `rb101Booking` |
| Reset (TD-26), chủ sở hữu, tên lần chạy, dọn dẹp | ✅ Đạt | `withResetGuard` 3 dấu hiệu (b) chỉ kiểm "không phải 403"; `guardToken` / `guardOwnBooking` đặt **trước** các `expect`; 404 sau DELETE không kích hoạt (TC-021, TC-029); dọn bằng GET + so khớp **chính xác** firstname + lastname, chấp nhận 403 / 404; sổ ghi chủ sở hữu **trước** request tạo; teardown quét theo tên |
| Ngân sách đăng nhập sai (TD-27) | ⚠️ Gần đạt | 30 / 30, có chặn lần thứ 31 (`badLogin: true` ở mọi request sai). Nhưng chỉ tính **trong một lần chạy**, quy tắc "một lần mỗi buổi" không được code bảo vệ (B1) |
| Riêng tư: token, cookie, Authorization, mật khẩu | ⚠️ Gần đạt | Che đúng ở evidence, annotation, lỗi thường; TC-016 qua `fetch`. Riêng thông báo của cổng cứng khi fail lộ đường dẫn máy vào `run-results` (P1) |
| Typecheck sạch, web không bị ảnh hưởng | ✅ Đạt | `tsc` sạch; `chromium` 133 test; job web CI giữ 1 worker / 30 phút / `retries: 2` (cấu hình chung), chỉ thêm `--project=chromium` và `if != schedule`; PR vẫn chạy job web |

## Đánh giá các điểm lệch script-gen tự khai
| Điểm lệch | Đánh giá |
|---|---|
| Bỏ tag `regression` | ✅ Chấp nhận: mọi TC đều có tag này nên không lọc được gì; spec web cũng không dùng; không script nào đọc |
| Reset xác nhận → làm lại **cả thân test** (không chỉ phần chuẩn bị) | ✅ Chấp nhận: tương đương "booking mới + token mới", đơn giản hơn. Lỗi `expect.soft` của lần 1 vẫn còn trong `test.info().errors`; hiện không sao vì các guard nằm **trước** mọi `expect`. Ghi chú để RB-102 giữ đúng thứ tự này |
| TC-023 dọn dẹp dùng token mới (CSV: T2) | ✅ Chấp nhận: `cleanupTracked` luôn lấy token mới, an toàn hơn khi có reset |
| TC-014 biến thể 3 qua `node:https` | ✅ Đúng TD-12: có assert cứng `sentHeaders['content-type']` là `undefined`, chứng minh thật sự không gửi `Content-Type` |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
Không có. Không gửi request tới máy chủ công khai (ngân sách đăng nhập sai của buổi đã hết).

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Ngân sách chỉ tính trong một lần chạy**. Bộ đếm nằm ở `test-results/` mà Playwright xóa đầu mỗi lần chạy, nên `test:run -- … -g TC-004` ngay sau đó lại có 30 lần mới. Quy tắc "nhóm `@bad-login` một lần mỗi buổi" (TD-27, HITL #1 Q12) chỉ dựa vào người chạy nhớ | `tests/api/rb-run.ts` (`RunState` ở `testInfo.project.outputDir`); `restful-booker.teardown.ts` ("test-results/ is emptied when a run starts") | 🟡 | Thêm bộ đếm theo **ngày UTC** ngoài `test-results/` (vd `.cache/rb-bad-login-<yyyyMMdd>.json`, thêm vào `.gitignore`), chặn khi vượt 30 / ngày, `RB_BAD_LOGIN_RESET=1` để người dùng chủ động mở lại. Hoặc ít nhất in cảnh báo khi đã có lần chạy `@bad-login` trong ngày |
| B2 | **Token "suy ra" không tự được che**: `mask()` chỉ che token đầy đủ (kể cả viết hoa, URL-encode). Token **bớt ký tự** (RB-102 v11), hay bất kỳ biến thể nào không chứa nguyên token, sẽ lộ 14/15 ký tự token thật. RB-101 TC-022 tự gọi `api.addSecret(modified)`, RB-102 phải nhớ làm giống | `rb-client.ts` `mask()`, `addSecret()`; RB-102 `test-data.md` TD-07 v10, v11, v24 | 🟡 | Thêm helper `api.derived(token, fn)` vừa tạo vừa đăng ký bí mật, hoặc `mask()` che mọi chuỗi hex ≥ 12 ký tự trùng tiền tố của một token đã biết. Ghi vào "Ghi chú cho script-gen" của RB-102 |
| B3 | ❓ **`.env.example` không có trong diff**, trong khi HITL #2 mục 4 chốt thêm `RB_ADMIN_USERNAME`, `RB_ADMIN_PASSWORD`, `RB_BASE_URL` (không có giá trị mật khẩu). Reviewer không đọc được nội dung file (bị chặn quyền đọc), nên chưa biết đã có sẵn hay còn thiếu | `git diff --stat`: không có `.env.example`; `known-issues.md` "Quyết định HITL #2" mục 4 | 🟡 | script-gen kiểm và thêm 3 khóa (để trống), ghi vào bảng "Xử lý sau review" |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | **Evidence của nhóm `@bad-login` không có đường làm mới hợp lệ.** `CLAUDE.md`, TD-27 và README evidence ghi "evidence của nhóm này lấy từ lần `test:run`". Nhưng `test:run` **không** đặt `EVIDENCE=1` (chỉ `run-evidence.mjs` đặt), còn `test:evidence` mặc định bỏ `@bad-login`. Lần chạy sau (executor, healer, xác nhận bug đã sửa) sẽ có run-results mới nhưng evidence của BUG-37 → BUG-40 vẫn là bản cũ, hoặc phải tốn thêm một buổi ngân sách | `scripts/run-tests.mjs` (không có `EVIDENCE`); `run-evidence.mjs:38`; `CLAUDE.md` đoạn "Web và API tách theo tên file"; `test-data.md` TD-27 | 🟠 | Với feature `-api`, `run-tests.mjs` tự đặt `EVIDENCE=1` (evidence API chỉ là README, không có trình duyệt nên gần như không tốn), rồi gọi dựng lại mục lục (`run-evidence.mjs --index-only`). Như vậy một lần `test:run` vừa cho kết quả vừa cho evidence. Sửa câu trong `CLAUDE.md` / TD-27 cho khớp |
| C2 | `npm run test:ui` và lệnh trần `npx playwright test` vẫn gồm project `api` (164 test). Bấm "chạy hết" trong UI mode sẽ gửi cả nhóm `@bad-login` lên máy chủ công khai | `package.json` (`test:ui` không có `--project`); `--list` không chỉ định project: 164 test | 🟡 | `test:ui` thêm `--project=chromium` (API mở bằng `npx playwright test --ui --project=api` khi cần), hoặc ghi cảnh báo trong `CLAUDE.md` |
| C3 | Tên file kết quả theo **giờ máy** (`run-20261127-143546`), còn tên lần chạy trong dữ liệu theo **UTC** (`QA-RB101-20261127-073546`). Khi đối chiếu booking sót với file kết quả rất dễ nhầm | `run-results/run-20261127-143546.json`; firstname trong evidence TC-015 | 🟡 | Ghi `rb_run` (UTC) vào JSON kết quả (vd lấy từ annotation teardown), hoặc ghi rõ múi giờ trong `CLAUDE.md` |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| P1 | **Khi cổng cứng fail, đường dẫn máy (có tên người dùng) lọt vào `run-results/*.json`, file được commit** (bài học L9). `expect(test.info().errors).toHaveLength(0)` in **cả mảng lỗi**, gồm `stack` đã escape (`C:\\Users\\…`). `detail()` của `run-tests.mjs` chỉ thay `repoRoot` dạng một dấu `\`, nên dạng escape còn nguyên | Đột biến `leak`: thông báo cổng chứa `at forEach (C:\\Users\\<user>\\…\\restful-booker-auth-api.spec.ts…)`; mô phỏng `detail()` trên thông báo đó: đường dẫn **vẫn còn** | 🟠 | (1) Cổng chỉ in câu đầu của mỗi lỗi: `expect(test.info().errors.map((e) => (e.message ?? '').split('\n')[0]), GATE).toEqual([])` (ngắn, dễ đọc, không stack). (2) `run-tests.mjs` `detail()` thay thêm dạng escape (`repoRoot.replace(/\\/g, '\\\\')`) và dạng `/`. Áp dụng cho cả RB-102 (TD-29 dùng cùng cổng) |
| D1 | **CI: lịch tuần và chạy tay dùng chung nhóm `concurrency` với push lên `main`** (`${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`). Push lên `main` trong lúc `api-full` đang chạy sẽ **hủy** lần chạy API giữa chừng: teardown không quét được, booking sót trên máy chủ dùng chung, nhóm `@bad-login` chạy dở. Ngược lại, lịch chạy có thể hủy lần chạy web của một push | `.github/workflows/playwright.yml` dòng `concurrency`, `schedule`, `api-full` | 🟠 | Tách nhóm theo sự kiện: `group: ${{ github.workflow }}-${{ github.ref }}-${{ github.event_name }}`, hoặc `cancel-in-progress: ${{ github.event_name == 'pull_request' }}` |
| D2 | Chú thích cron "03:20 UTC: ngoài cửa sổ x0:50 → x1:30" dễ hiểu nhầm là đã tránh được reset: job còn `npm ci` rồi chạy vài phút, nên vẫn đi qua các mốc x1 (03:21, 03:31…). Việc này không sai vì `withResetGuard` lo, nhưng chú thích nên nói đúng | `playwright.yml` chú thích `schedule` | 🟡 | Sửa chú thích: "giờ lẻ để tránh giờ cao điểm; reset giữa lần chạy do TD-26 xử lý" |

## E. Hạ tầng dùng chung cho RB-102 (trọng tâm 5)
| Nhu cầu của RB-102 | Hạ tầng hiện có | Đánh giá |
|---|---|---|
| TD-29: 5 bước, cổng cứng | Mẫu `hardGate()` nằm trong spec RB-101 (hàm cục bộ) | ✅ Dùng được; nên đưa `hardGate` (đã sửa theo P1) vào `tests/api/` để 2 spec dùng chung |
| TD-07: Basic, Bearer, cookie biến thể, `?token=` | `send()` nhận header / URL tùy ý; `mask()` che `Basic …`, `Bearer …`, token đầy đủ (kể cả viết hoa, trên URL) | ⚠️ Thiếu che token suy ra (B2) |
| BUG-51: nhiều bản ghi cùng id, dữ liệu chuyển sang id Y | `rbMaxDeletes` (option fixture, `test.use({ rbMaxDeletes: 5 })`), `api.track(Y, isOwner, …)` | ✅ |
| BUG-49: booking "ẩn" (lỗi nhưng vẫn tạo) | `createBooking(body, { headers })` ghi sổ **trước** request; teardown quét theo tên | ✅ với điều kiện mọi `POST /booking` của RB-102 đi qua `createBooking` (ghi vào "Ghi chú cho script-gen" RB-102) |
| Tên lần chạy `QA-RB102-<RUN>` + nonce; teardown quét `lastname` mang tên lần chạy | `RB_RUN.rb102`, `RB_FEATURES`, teardown chọn `?firstname=` / `?lastname=` theo sổ | ✅ |
| 403 / `Forbidden` một hằng số | `RB_REJECT` | ✅ |
| Lỗi nội bộ (MSG-14) | `internalErrorSigns()` (không bắt nhầm `Internal Server Error` vì cần `Error:`) | ✅ |

## Thay đổi quy tắc chưa soát
| File | Kết luận | Ghi chú |
|---|---|---|
| `.claude/agents/qa-reviewer.md` (L17, L18) | ⚠️ | Nội dung đúng, L18 khớp kết quả đột biến ở trên. **R1 🟡**: L17 ghi số tạm "RB-102 B11"; số chính thức là **BUG-51** |
| `.claude/agents/test-impl.md` (quy tắc L18) | ✅ | Đủ 2 cách (tách TC dương tính hoặc 5 bước), cấm `test.fail()` trong vòng lặp. Nên thêm nửa câu theo P1: cổng in câu đầu của lỗi, không in cả mảng |
| `.claude/agents/bug-reporter.md` (khối "Đọc nhanh") | ✅ | Đặt dưới tiêu đề, mong đợi ↔ hiện trạng cùng dòng, có nguồn, có mục checklist. Dòng bảng không bắt đầu bằng `[BUG-`, nên không làm lệch cách RTM đọc bảng tổng hợp. Bản trong repo học của người dùng giống hệt (đã đọc, không sửa) |
| `.claude/commands/qa-orchestrator.md` | ✅ | Chạy tuần tự mặc định; nháp riêng + số tạm riêng khi chạy song song; phiếu HITL tóm tắt phải qua qa-reviewer: đúng các sự việc đã xảy ra ở Bài 10 |
| `CLAUDE.md` | ⚠️ | Quy tắc `-api`, dải BUG-37 → 59 / tiếp theo BUG-60, lệnh mới: đúng. Câu "evidence của `@bad-login` lấy từ `test:run`" chưa đúng với code (C1). Nên thêm cảnh báo `test:ui` (C2) |
| `knowledge-base/q-and-a-archive.md` (9 dòng) | ⚠️ | 8 dòng khớp quyết định HITL #1 / #2 của 2 feature. **R2 🟡**: dòng HTTPS ghi "chuyển hướng 307/308", trong khi HITL #2 mục 6 chốt **GET 301 / 308, POST 307 / 308**. Sửa cho khớp |
| `git stash` / `stash pop` của script-gen | ✅ Không mất gì | Commit stash `8387427` chứa 10 file (`.claude/` 4 file, `CLAUDE.md`, `knowledge-base`, `playwright.config.ts`, 3 file `tests/data`). So với cây làm việc: mọi thay đổi trong stash **còn nguyên**, phần khác chỉ là phần thêm sau (workflow, `package.json`, 3 script, phần lệnh trong `CLAUDE.md`). Stash không có `-u` nên file chưa track không bị đụng |

## Việc cần làm trước khi sang executor (xếp theo mức độ)
1. 🟠 P1: cổng cứng chỉ in câu đầu của lỗi (dùng chung RB-101 / RB-102); `detail()` thay cả đường dẫn dạng escape và dạng `/`.
2. 🟠 D1: tách nhóm `concurrency` theo sự kiện (hoặc chỉ hủy cho PR).
3. 🟠 C1: `test:run` của feature `-api` tự tạo evidence (+ dựng lại mục lục); sửa `CLAUDE.md` / TD-27 cho khớp.
4. 🟡 B1, B2, B3 (❓ `.env.example`), C2, C3, D2, R1 (L17 → BUG-51), R2 (dòng HTTPS của knowledge-base).

## Xử lý sau review
| # | Xử lý |
|---|---|
| P1 | ✅ Cổng cứng `hardGate()` (spec) chỉ in dòng đầu của mỗi lỗi; `detail()` trong `scripts/run-tests.mjs` thay thêm dạng escape `\\` và dạng `/`. RB-102 dùng lại `hardGate()` (ghi trong doc của `rb-client.ts`). |
| D1 | ✅ `.github/workflows/playwright.yml`: nhóm `concurrency` thêm `github.event_name`, push lên `main` không hủy `api-full`. |
| C1 | ✅ `scripts/run-tests.mjs`: feature `-api` đặt `EVIDENCE=1` rồi gọi `run-evidence.mjs --index-only`. Đã sửa `CLAUDE.md` và `test-data.md` TD-27. Chưa chạy thật (hết ngân sách, không gọi API). |
| B1 | ✅ `tests/api/rb-run.ts`: bộ đếm theo ngày UTC ở thư mục tạm hệ điều hành (`rb-bad-login-<yyyymmdd>.json`, ngoài `test-results/`), từ chối khi quá 30; `RB_BAD_LOGIN_RESET=1` để mở lại. Ghi trong `CLAUDE.md`, TD-27. |
| B2 | ✅ `tests/api/rb-client.ts`: thêm `api.derived(token, fn)` (đăng ký biến thể bớt / thêm 1 ký tự, đổi hoa thường làm bí mật) + ghi chú cho RB-102 ở doc của lớp. Spec RB-101 (TC-022 vẫn dùng `addSecret`) chưa đổi sang `derived`, vì vẫn đúng. |
| B3 | ✅ (orchestrator) Máy này chặn sửa `.env*`; người dùng chọn (2026-11-27) ghi 3 biến `RB_*` vào bảng biến môi trường của `README.md` thay cho `.env.example`; ghi bổ sung vào "Quyết định HITL #2" mục 4 của 2 `known-issues.md` |
| C2 | ✅ `package.json`: `test:ui` thêm `--project=chromium`; `CLAUDE.md` ghi lệnh trần `npx playwright test` chạy cả 2 project. |
| C3 | ✅ `scripts/run-tests.mjs`: tên file và `run_id` dùng UTC; ghi chú trong `CLAUDE.md`. |
| D2 | ✅ `.github/workflows/playwright.yml`: chú thích cron nói đúng (chỉ bắt đầu ngoài cửa sổ reset, chạy dài có thể qua; `withResetGuard` lo). |
| R1, R2 | ✅ (orchestrator) L17 trong `qa-reviewer.md` ghi BUG-51; dòng HTTPS trong `knowledge-base/q-and-a-archive.md` ghi GET 301/308, POST 307/308 cùng host + đường dẫn |

## Kiểm lại lượt 2
- **Ngày**: 2026-11-27 · **Reviewer**: qa-reviewer · **Cách kiểm**:
  - Đọc code từng mục, chạy `npm run typecheck`: sạch.
  - Chạy offline bằng stub cục bộ: `RB_BASE_URL` trỏ vào `127.0.0.1`, tài khoản giả, `TMP` / `TEMP` / `TMPDIR` trỏ vào thư mục nháp. **0 request tới máy chủ công khai.** Bộ đếm thật của ngày không bị đụng.

| # | Kết luận | Bằng chứng |
|---|---|---|
| P1 | ✅ | `hardGate()` chỉ in `message.split('\n')[0]` của mỗi lỗi. `detail()` thay cả 3 dạng của repo root: `\`, `\\` và `/` |
| P1b (mới) | ⚠️ 🟠 | Lỗi "Hết ngân sách… NGÀY" (B1) chứa **đường dẫn tuyệt đối** của bộ đếm: `os.tmpdir()` = `C:\Users\<user>\AppData\Local\Temp\…`. Đường dẫn này nằm ở **dòng đầu** của lỗi, nên `clean()` / `hardGate` không cắt được. `detail()` cũng không thay, vì thư mục tạm nằm ngoài repo root. Mô phỏng `detail()` cho kết quả: `LEAK: …(bộ đếm: C:\Users\<user>\AppData\Local\Temp\rb-bad-login-….json)`. Hậu quả: đường dẫn này lọt vào `run-results/*.json` và mục "Lỗi ghi nhận" của evidence, đều là file được commit (L9). **Sửa**: thông báo chỉ ghi tên file `rb-bad-login-<yyyymmdd>.json (thư mục tạm của hệ điều hành)`, hoặc `detail()` thay thêm `os.tmpdir()` |
| D1 | ✅ | `group: …-${{ github.event_name }}`. Push và schedule / `workflow_dispatch` không còn chung nhóm, nên push không hủy `api-full` |
| D2 | ✅ | Chú thích cron ghi rõ: job chỉ **bắt đầu** ngoài cửa sổ reset, lần chạy dài vẫn có thể đi qua reset, khi đó `withResetGuard` (TD-26) xử lý |
| Job web | ✅ Không đổi | Vẫn 30 phút; 1 worker và `retries: 2` lấy từ `playwright.config.ts` khi có `CI`; vẫn chạy khi push và PR. Diff chỉ thêm `--project=chromium` và `if: != schedule` |
| C1 | ✅ (đã chạy) | `test:run -- restful-booker-auth-api -g "TC-004"` qua stub ghi `evidence/all-cases/TC-004/README.md` và `bugs/[id_bug_37]_BUG-37/TC-004/README.md`, rồi in `Evidence index: …/evidence/README.md` (mục lục được dựng lại). `CLAUDE.md` (lệnh `test:run`, đoạn "Web và API") và phần thân TD-27 khớp code. 🟡 Còn sót: dòng bảng TD-27 (dòng 38) và tiêu đề mục TD-27 (dòng 52) vẫn ghi "mỗi lần chạy", trong khi phần thân đã ghi giới hạn theo ngày |
| ⚠️ Tác dụng phụ của lần kiểm | Cần làm | Evidence API **ghi đè** README cũ, và evidence chưa track nên không khôi phục được từ git. Hiện 3 file trên chứa **dữ liệu stub** thay cho dữ liệu thật từ máy chủ: `stubuser`, thời điểm `2026-11-27T08:01Z`, không có header Heroku. **Không được commit 3 file này như hiện tại.** Phải làm mới TC-004 bằng lần chạy thật kế tiếp, lần đó tốn 1 lượt đăng nhập sai. Đã xóa `run-results/run-20261127-080106.json` do stub tạo; `git status` không còn file mới nào khác |
| B1 | ✅ (đã chạy) | Sau TC-004, file `rb-bad-login-20261127.json` (ngày UTC) xuất hiện trong thư mục tạm nháp với `failedLogins: 1`. Đặt bộ đếm = 30 rồi chạy lại: test từ chối **trước khi gửi**, bộ đếm giữ 30, test **đỏ** (không phải "fail như dự kiến"). Với `RB_BAD_LOGIN_RESET=1`: request được gửi, bộ đếm tăng lên 31 |
| B2 | ✅ | Đã có `api.derived(token, fn)`: đăng ký biến thể bớt / thêm 1 ký tự và đổi hoa thường làm bí mật. Doc của lớp có ghi chú cho RB-102 |
| C2 | ✅ | `test:ui` = `playwright test --ui --project=chromium`. `CLAUDE.md` có cảnh báo về lệnh trần |
| C3 | ✅ | Tên file kết quả lần chạy stub là `run-20261127-080106` (UTC; giờ máy lúc đó là 15:01). `utcDay()` và `inResetWindow()` đều dùng UTC |
| B3, R1, R2 | ✅ | `README.md` có `RB_BASE_URL` và `RB_ADMIN_*` (không có giá trị mật khẩu). Cả 2 `known-issues.md` có ghi bổ sung. L17 trong `qa-reviewer.md` ghi BUG-51. Dòng HTTPS trong knowledge-base ghi GET 301/308, POST 307/308 |

**Kết luận lượt 2: ⚠️**
- 10 mục cũ đã đạt.
- Còn 1 lỗi 🟠 mới: P1b, đường dẫn máy trong thông báo hết ngân sách.
- Còn 1 điểm 🟡: tiêu đề và dòng bảng TD-27.
- Còn 1 việc bắt buộc trước khi commit: làm mới evidence TC-004 (2 README + mục lục) bằng lần chạy thật.

### Xử lý sau lượt 2
| # | Xử lý |
|---|---|
| P1b | ✅ `tests/api/rb-run.ts`: thông báo "Hết ngân sách… NGÀY" chỉ ghi tên file `rb-bad-login-<yyyymmdd>.json` (thư mục tạm của hệ điều hành), không còn đường dẫn đầy đủ. `grep` cả `tests/` và `scripts/`: `dailyFile()` chỉ còn dùng để đọc / ghi file, không có trong thông báo nào; `os.tmpdir()` còn ở `run-stability.mjs` nhưng chỉ là file tạm, không in ra. Typecheck sạch |
| 🟡 TD-27 | ✅ `test-data.md` dòng bảng TD-27 và tiêu đề mục TD-27 ghi thêm "tối đa 30 lần mỗi ngày UTC" |
| Evidence TC-004 bị stub ghi đè | ✅ (cách xử lý) Không commit `evidence/` và `run-results/` của RB-101 ở lần commit code này. Bước executor sẽ chạy thật `test:run` (ngày UTC mới, nằm trong ngân sách), lần đó ghi lại toàn bộ evidence + mục lục bằng dữ liệu thật, không tốn thêm lượt đăng nhập sai |

## Kiểm lại lượt 3
Ngày: 2026-11-27 · Reviewer: qa-reviewer

| # | Kết luận | Bằng chứng |
|---|---|---|
| P1b 🟠 | ✅ Đã đóng | `rb-run.ts` dòng 96-100: thông báo chỉ ghi tên file `rb-bad-login-<ngày>.json`, có câu nói rõ không in đường dẫn đầy đủ. `grep tmpdir\|dailyFile\|homedir` trong `tests/` và `scripts/`: `dailyFile()` chỉ ở dòng 22, 26, 32 (đọc / ghi file), không nằm trong chuỗi thông báo hay console. `os.tmpdir()` còn ở `run-stability.mjs` dòng 36 chỉ để tạo file JSON tạm, không in ra; dòng in kết quả (70) chỉ in thư mục `qa-runs/...`. `npm run typecheck` sạch |
| TD-27 🟡 | ✅ Đã đóng | `test-data.md` dòng 38 ghi "≤ 30 lần mỗi lần chạy và ≤ 30 lần mỗi ngày UTC"; dòng 52 (tiêu đề mục) ghi "tối đa 30 lần mỗi ngày UTC". Khớp với code `assertBadLoginBudget` (kiểm tra cả ngày lẫn lần chạy) |
| Evidence TC-004 | ✅ Cách xử lý hợp lý | Không commit `evidence/` và `run-results/` của RB-101 là đúng: file đó đang là dữ liệu stub, commit vào sẽ giả như kết quả thật. Executor chạy thật ngày UTC mới sẽ ghi lại đủ, nằm trong ngân sách 30. Điều kiện: executor phải ghi đè hết cả hai thư mục, không giữ file stub cũ |

Kết luận lượt 3: ✅ Không còn lỗi mở. Có thể commit phần code.
