# Triage Report: run-20261128-051405

- **Feature**: RB-101 `restful-booker-auth-api` (POST /auth + GET /ping) · **Lần chạy**: CHÍNH THỨC (orchestrator bước 4)
- **Lệnh**: `npm run test:run -- restful-booker-auth-api --include-full` (1 lần, gồm nhóm `@bad-login`; feature không có TC `@full`)
- **Kết quả**: `run-results/run-20261128-051405.json` · scope `full` · project `api` · 1 worker · `retries: 0` · 71,4 giây
- **Thời gian (UTC)**: 05:14:05 → 05:15:17. không đi qua cửa sổ reset nào (05:10:50 → 05:11:30 đã qua trước khi chạy, cửa sổ sau bắt đầu 05:20:50), **0 test có annotation `env-reset`**
- **Tên lần chạy trong dữ liệu**: `QA-RB101-20261128-051406`
- **Thống kê của teardown**: 8 booking trong sổ, dọn sót 0 · **141 request** (chưa tính teardown) + 1 request teardown · **đăng nhập thất bại 30** (= ngân sách TD-27; bộ đếm ngày UTC 20261128 = 30, không đặt `RB_BAD_LOGIN_RESET`)

## Summary
| Status | Count |
|--------|-------|
| passed (theo TC, đạt sạch) | 17 |
| expected-fail (bug đã biết, fail đúng chỗ của bug) | 13 |
| flaky | 0 |
| script-issue | 0 |
| real-bug (mới, ngoài bug đã biết) | 0 |
| env (EnvError / Heroku 503 / env-reset) | 0 |
| skipped | 0 |

Theo Playwright: 30 passed (gồm 13 `test.fail()` fail như dự kiến), 0 unexpected, 0 flaky. Theo TC: Passed 17 · Failed 13 (13 bug đã biết).

## Bug đã biết: kiểm từng lỗi (L18)
Đọc **mọi** `error_details`: 13/13 TC chỉ fail ở assertion của đúng bug, Received đúng hiện trạng đã ghi trong `known-issues.md`. Không có `Test timeout`, `ReferenceError`, lỗi cổng cứng `(a)–(d) phải đạt trước test.fail`, lỗi ngân sách hay EnvError. Phần đang đúng (không có `token`, body `{"reason":"Bad credentials"}`, JSON, không 5xx, đối chứng bước 0 có token) đều đạt trước `test.fail()`.

| TC | Bug | Lỗi (số assertion) | Expected → Received | Đúng lý do bug? |
|---|---|---|---|---|
| TC-004 | BUG-37 | (e) HTTP 401 (1) | 401 → 200 | ✅ |
| TC-005 | BUG-37 | (e) HTTP 401 (2) | 401 → 200 | ✅ |
| TC-006 | BUG-37 | (e) HTTP 401 (2) | 401 → 200 | ✅ |
| TC-007 | BUG-37 | (e) HTTP 401 (4 vị trí khoảng trắng) | 401 → 200 | ✅ |
| TC-008 | BUG-37 | (e) HTTP 400 (4: thiếu password, thiếu username, `{}`, body rỗng) | 400 → 200 | ✅ |
| TC-009 | BUG-37 | (e) HTTP 400 (3: `""`, `""`, `null`) | 400 → 200 | ✅ |
| TC-010 | BUG-37 | (e) HTTP 400 ×4 + 401 ×1 (chuỗi SQL) | 400/401 → 200 | ✅ |
| TC-011 | BUG-37 | (e) HTTP 401 (1) | 401 → 200 | ✅ |
| TC-016 | BUG-37 | (e) HTTP 400 (1) | 400 → 200 | ✅ |
| TC-012 | BUG-38 | (d) Content-Type JSON + body là object JSON (2) | `application/json` → `text/plain`; true → false (mã 413 đạt) | ✅ |
| TC-013 | BUG-38 | (d) Content-Type JSON + body đọc được thành object JSON, ×2 biến thể (JSON hỏng, XML với Content-Type JSON) (4) | `application/json` → `text/plain`; true → false (mã 400 đạt) | ✅ |
| TC-014 | BUG-39 | (c) HTTP 415 + (e) không chứa `Bad credentials`, ×3 biến thể (6) | 415 → 200; false → true | ✅ (biến thể 3 thật sự không gửi `Content-Type`, annotation TD-12) |
| TC-030 | BUG-40 | Bước 1 `http://…/ping` → 201; Bước 2 `http://…/auth` (tài khoản SAI) → 200; Bước 3 HSTS (không có) (3) | chuyển hướng / từ chối, HSTS > 0 → không | ✅ |

## Flaky
Không có. Không chạy lại test nào (không có kết quả bất thường). Không chạy lặp: ngân sách đăng nhập sai của ngày UTC đã dùng 30/30; lần chạy `run-20261127-143546` (code cũ hơn) cho cùng kết quả (30/30, 13 expected-fail). Lần chạy CI `api-full` đầu tiên sau khi gộp dùng làm lần lặp đối chiếu.

## Script Issues (→ healer)
Không có.

## Real Bugs (→ HITL #3)
Không có bug **mới**. 13 TC fail đều là bug đã biết BUG-37 → BUG-40 (đã xác nhận ở HITL #1), xác nhận lại bằng lần chạy thật này; evidence ở `evidence/bugs/<ticket>_BUG-xx/TC-xxx/`.

## Môi trường
- Không có EnvError / Heroku `503`, không có annotation `env-reset` (TD-26).
- Dọn dẹp: 8 annotation `cleanup`, teardown dọn sót 0.
- Ghi chú (annotation, không phải lỗi): TC-001 `Cache-Control` không có (cải tiến IMP-02); token 15 ký tự hex (chỉ ghi định dạng); TC-026 HEAD body 0 byte (không assert, L15).

## Cần quyết ở HITL #3
- Không có bug mới; 4 bug BUG-37 → BUG-40 (đã duyệt ở HITL #1) tái hiện đúng.
- **Tái hiện độc lập bug API**: bước defects cần tái hiện tách khỏi evidence tự động, nhưng `npm run repro` hiện chỉ có SauceDemo. Bug API tái hiện độc lập bằng gì (script `curl` / Node riêng ghi vào `bugs/<…>/manual/`)? Lưu ý: BUG-37 và BUG-40 **không** được gửi thêm đăng nhập sai trong ngày UTC đã dùng hết ngân sách (30/30).

## Chạy tay (Phase 2b)
Không cần: 30/30 TC `automatable`, API không có phần cần mắt người / ngoài phạm vi Playwright (M1–M7 không xảy ra), không có kết quả đáng ngờ (M6).

## Evidence
- `test:run` của feature `-api` tự ghi evidence: 43 README (30 `all-cases/TC-001…030` + 13 `bugs/…/TC-xxx`), đều ghi lúc 2026-11-28T05:14:07Z → 05:15:17Z (thuộc lần chạy này; mục lục dựng lại sau review, xem dưới). README của TC ghi "Thời điểm" (UTC), không ghi `run_id`; TC có booking ghi thêm tên lần chạy dữ liệu `QA-RB101-20261128-051406`. Đã kiểm cả 43 README: "Thời điểm" đều trong 05:14:07Z → 05:15:16Z.
- Không còn file evidence nào cũ hơn lần chạy; không còn dấu vết dữ liệu stub (`stubuser`, `127.0.0.1`, `2026-11-27`). Evidence TC-004 giả từ lần chạy stub đã được thay bằng dữ liệu thật.
- `run-results/run-20261127-143546.json`: lần chạy **cũ** (2026-11-27), trên code **trước** review script-gen lượt 2–3, **không phải** lần chạy chính thức. Evidence của nó đã bị lần chạy stub ghi đè rồi được tạo lại toàn bộ bởi lần chạy này. Giữ trong repo làm lịch sử (người dùng chốt 2026-11-28, theo qa-reviewer: các feature SauceDemo cũng giữ lần chạy đã bị thay thế; `reviews/review-script-gen.md` dẫn file này làm bằng chứng). **Lần chạy chính thức: `run-20261128-051405`** (RTM tự lấy lần chạy mới nhất, `scripts/build-rtm.mjs:29`).
- Mục lục `evidence/README.md` đã **dựng lại sau review** bằng `--index-only` (không chạy test): dòng đầu ghi rõ "Mục lục dựng lại … từ evidence có sẵn", thời điểm chạy của từng TC nằm trong README của TC (review-executor E1, N1).

## Riêng tư
Quét `run-results/run-20261128-051405.json` và `evidence/`: không có đường dẫn máy (`C:\`, `Users`, `AppData`), tên người dùng máy, mật khẩu quản trị, chuỗi `Basic` / `Bearer`, chuỗi hex dạng token. Token / cookie đều là `***`, `***(15 ký tự)` hoặc `abc123` (giá trị công khai của tài liệu, TC-022). TC-016 chỉ hiện `username=…&password=…`. TC-030 chỉ gửi tài khoản **sai** qua HTTP. Mật khẩu xuất hiện chỉ là dữ liệu sai của test (`qa-rb101-wrong-pass`).

## Kết quả HITL #3 (2026-11-28)
Người duyệt trả lời **"theo đề xuất"**: (1) chuyển BUG-37 → BUG-60 (24 bug) sang bước bug report; (2) BUG-60 là bug, mong đợi như `Accept: */*`, Medium, biến thể `PUT` / `PATCH` chỉ ghi trong bug report (test ở Bài 11); (3) chấp nhận tải ~889 request mặc định / 977 có `@full`; (4) tái hiện độc lập bằng script Node riêng `tests/repro/restful-booker.repro.ts`; BUG-37 → BUG-40 (8 lần đăng nhập sai) tái hiện ở ngày UTC kế tiếp.
