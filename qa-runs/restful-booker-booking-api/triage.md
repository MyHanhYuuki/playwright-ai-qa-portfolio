# Triage Report: run-20261128-052139

- **Feature**: RB-102 `restful-booker-booking-api` (POST / GET / PUT / PATCH / DELETE `/booking`) · **Lần chạy**: CHÍNH THỨC (orchestrator bước 4)
- **Lệnh**: `npm run test:run -- restful-booker-booking-api --include-full` (1 lần, gồm 2 TC `@full`: TC-013, TC-067)
- **Kết quả**: `run-results/run-20261128-052139.json` · scope `full` · project `api` · 1 worker · `retries: 0` · 390,6 giây (6,5 phút)
- **Thời gian (UTC)**: 05:21:39 → 05:28:11. Lần chạy được **hẹn giờ bắt đầu sau** cửa sổ reset 05:20:50 → 05:21:30 và xong trước cửa sổ sau (05:30:50), **0 test có annotation `env-reset`**
- **Tên lần chạy trong dữ liệu**: `QA-RB102-261128052139-eq72`
- **Thống kê của teardown**: 159 booking trong sổ, dọn sót 0 · **962 request** (chưa tính teardown) + 15 request teardown = **977** · **đăng nhập thất bại 0** (RB-102 không gửi đăng nhập sai có chủ ý; ngân sách ngày đã dùng hết ở RB-101 nhưng không bị chạm, không đặt `RB_BAD_LOGIN_RESET`)

## Summary
| Status | Count |
|--------|-------|
| passed (theo TC, đạt sạch) | 34 |
| expected-fail (bug đã biết, fail đúng chỗ của bug) | 35 |
| flaky | 0 |
| script-issue | 0 |
| real-bug (mới, ngoài bug đã biết) | 0 |
| env (EnvError / Heroku 503 / env-reset) | 0 |
| skipped | 0 |

Theo Playwright: 69 passed (gồm 35 `test.fail()` fail như dự kiến), 0 unexpected, 0 flaky, teardown passed. Theo TC: Passed 34 · Failed 35 (35 bug đã biết, 20 mã BUG-41 → BUG-60).

## Bug đã biết: kiểm từng lỗi (L18)
Đọc **mọi** `error_details` (263 lỗi của 35 TC): mỗi lỗi nằm ở assertion của đúng bug, Received khớp hiện trạng trong `known-issues.md`. Không có `Test timeout`, `TypeError` / `ReferenceError`, lỗi cổng cứng "phần đang đúng phải đạt trước test.fail", `ResetSuspect`, EnvError / 503 hay lỗi ngân sách. Script `run-tests.mjs` cũng không cảnh báo TC nào. Vì cổng cứng không bắn, mọi phần đang đúng (không 5xx khi đã đúng, không lộ lỗi nội bộ, 6 giá trị còn lại đúng, đối chứng) đều đạt trước `test.fail()`.

| TC | Bug | Lỗi (số) | Expected → Received | Đúng lý do bug? |
|---|---|---|---|---|
| TC-003 | BUG-55 | 400 + không tạo booking, ×4 kiểu `additionalneeds` (8) | 400 → 200, booking được tạo | ✅ |
| TC-004 | BUG-41 | 400 + không 5xx, ×7 trường bỏ (14) | 400 → 500 | ✅ |
| TC-005 | BUG-41 | 400 + không 5xx, `{}` / `[]` (4) | 400 → 500 | ✅ |
| TC-007 | BUG-41 | 400 + không 5xx, ×4 (null / sai cấu trúc) (8) | 400 → 500 | ✅ |
| TC-008 | BUG-43 | 400 + không tạo booking, `"abc"` / `"150"` / `true` (6) | 400 → 200 | ✅ |
| TC-009 | BUG-43 | `99.99`, `0.01` bị cắt (body + GET); `0.005` 400 + không tạo (6) | 99.99 → 99; 0.01 → 0; 400 → 200 | ✅ |
| TC-011 | BUG-57 | 400 + không tạo booking, `-1` / `-100` (4) | 400 → 200 | ✅ |
| TC-012 | BUG-42 | 400 + không tạo booking, ×5 (`"false"`, `"true"`, `"abc"`, `0`, `1`) (10) | 400 → 200 | ✅ |
| TC-013 `@full` | BUG-44 | 400 + không tạo + không lưu ngày hỏng / cuộn, ×8 (24) | 400 → 200, lưu `0NaN-aN-aN` / ngày cuộn | ✅ |
| TC-014 | BUG-44 | 400 + không tạo ×3; lưu lệch ngày (+07:00 → `2031-01-09`, số → `2031-01-02`) (8) | 400 → 200 | ✅ |
| TC-016 | BUG-56 | 400 + không tạo, checkout trước / bằng checkin (4) | 400 → 200 | ✅ |
| TC-017 | BUG-55 | 400 + không tạo, ×4 tên rỗng / khoảng trắng / tab (8) | 400 → 200 | ✅ |
| TC-019 | BUG-59 | lastname nguyên văn (body + GET) (2) | `"  TC-019-Pad  "` → `"TC-019-Pad"` | ✅ (`additionalneeds` giữ nguyên, đạt trước cổng) |
| TC-023 | BUG-58 | 415 / 400 + không 5xx, ×4 (8) | 415 / 400 → 500 (biến thể 4 body 0 byte → 500) | ✅ |
| TC-026 | BUG-60 | Bước 1 `GET` không `Accept` (3) + bước 3 `POST` không `Accept` (4) | 200 JSON → 418 `text/plain`; POST không trả `bookingid` | ✅ (bước 2 `Accept: */*` đạt trước cổng) |
| TC-033 | BUG-47 | có P (checkin = D) (1) | true → false | ✅ |
| TC-035 | BUG-46 | có Q2 (D+1), không có Q1 (D-1) (2) | đảo chiều | ✅ |
| TC-037 | BUG-48 | 400 + không 5xx ×4 tham số; `08/03/2040` 400 (9) | 400 → 500 / 200 | ✅ |
| TC-038 | BUG-48 | 400 + không trả toàn bộ, ×7 tham số object / toán tử (14) | 400 → 200 kèm ~1263–1277 phần tử (chỉ đếm) | ✅ |
| TC-042 | BUG-53 | `additionalneeds` cũ vẫn còn (bước 3, 4) (2) | true → false | ✅ |
| TC-044 | BUG-43 | `PUT` 400 + giống hệt mốc, ×3 (6) | 400 → 200, booking đổi | ✅ |
| TC-045 | BUG-42 | `PUT` 400 + giống hệt mốc, `"false"` / `0` (4) | 400 → 200 | ✅ |
| TC-046 | BUG-56 | `PUT` 400 + giống hệt mốc, ×2 (4) | 400 → 200 | ✅ |
| TC-048 | BUG-45 | trường con còn lại giữ nguyên (body + GET), ×2 chiều (4) | ngày cũ → `0NaN-aN-aN` | ✅ |
| TC-050 | BUG-43 | `PATCH` 400 + giống hệt mốc ×5; `10.75` bị cắt (body + GET) (12) | 400 → 200; 10.75 → 10 | ✅ |
| TC-051 | BUG-42 | `PATCH` 400 + giống hệt mốc, `"false"` / `0` (4) | 400 → 200 | ✅ |
| TC-052 | BUG-44 | `PATCH` 400 + giống hệt mốc + không lưu ngày hỏng, ×3 (9) | 400 → 200 | ✅ |
| TC-053 | BUG-55 | `PATCH` 400 + giống hệt mốc, ×3 (6) | 400 → 200, lưu `null` / `""` / `"   "` | ✅ |
| TC-055 | BUG-52 | DELETE lần 2 / PUT / PATCH sau khi xóa (3) | 404 → 405 (không 5xx đạt trước cổng) | ✅ |
| TC-058 | BUG-42 | `depositpaid` false, urlencoded + XML × POST / PUT / PATCH (body + GET) (12) | false → true | ✅ |
| TC-061 | BUG-50 | Content-Type XML ở POST / GET / PUT (3) | `application\|text/xml` → `text/html; charset=utf-8` | ✅ |
| TC-062 | BUG-49 | 406 ×4; tìm theo tên `[]` ×2; không lộ lỗi nội bộ (3) (9) | 406 → 418 / 200; booking ẩn được tạo; `formurlencoded is not a function` | ✅ |
| TC-063 | BUG-54 | GET `X.9`, `Xabc`, `00X`, `X.5` 404 (8); PUT `00X`, PATCH `Xabc`, DELETE `X.9` 404 + giống hệt mốc (6) | 404 → 200 / 201, booking bị sửa / xóa | ✅ |
| TC-064 | BUG-51 | PUT, PATCH: 200, không `bookingid`, X giữ id, X có dữ liệu mới, Y giữ nguyên, lọc tên mới (12) | 200 → 405, X → 404 | ✅ (dọn Y cần 2 lần xóa: bản ghi trùng) |
| TC-065 | BUG-52 | PUT / PATCH / DELETE × 4 id không tồn tại (12) | 404 → 405 (không 5xx đạt trước cổng) | ✅ |

## Flaky
Không có. Không chạy lại test nào (không có kết quả bất thường). Không chạy lặp: mỗi lần 977 request trên máy chủ công khai; các lần chạy thử ở bước script-gen cho cùng phân loại; lần CI `api-full` đầu tiên dùng làm lần đối chiếu.

## Script Issues (→ healer)
Không có.

## Real Bugs (→ HITL #3)
Không có bug **mới**. 35 TC fail đều là bug đã biết BUG-41 → BUG-59 (đã xác nhận ở HITL #1) và **BUG-60** (phát hiện ở script-gen, **chờ xác nhận HITL #3**: lần chạy này tái hiện lại `GET` và `POST` không `Accept` → 418, `POST` vẫn tạo booking, đã dọn). Evidence ở `evidence/bugs/<ticket>_BUG-xx/TC-xxx/`.

## Môi trường
- Không có EnvError / Heroku `503`, không có annotation `env-reset` (TD-26).
- Dọn dẹp: 59 annotation `cleanup`, mọi id `DELETE 201` hoặc đã `GET 404` (test tự xóa: TC-054, TC-055, TC-063, TC-064, TC-068); TC-064 annotation `cleanup BUG-51`: 2 id Y cần 2 lần xóa (bản ghi trùng, đúng BUG-51). Teardown dọn sót 0.
- Dữ liệu người khác: không assertion nào phụ thuộc booking của người khác (L17). TC-030 bước 4 (`firstname=` rỗng) trả 0 phần tử; TC-038 chỉ ghi **số** phần tử của danh sách chung.
- Ghi chú (annotation, không phải lỗi): TC-010 `totalprice` `2^53 + 1` đọc lại `9007199254740992` (HITL #2 mục 10: chỉ ghi nhận); TC-069 cả 4 phương thức không hỗ trợ trả 404 `Not Found`, không 403 (không cần xem tay).

## Số request (review D1)
962 request trong 69 test + 15 teardown = 977 (ước lượng cũ ~864 với `@full`, +13 %). TC-013 = 34, TC-067 = 54, nên lần chạy mặc định (bỏ `@full`) khoảng 874 + 15 = ~889 (ước lượng cũ ~778, +14 %). Bảng theo describe đã cập nhật trong `test-data.md` mục "Ước lượng số request mỗi lần chạy".

## Cần quyết ở HITL #3
1. **BUG-60 (không gửi `Accept` → 418) chưa có oracle được duyệt, mức Medium đề xuất**. AC-8 chỉ nói `Accept` chọn JSON / XML; Q9 (đã trả lời) chỉ chốt `Accept` **không hỗ trợ** → 406, không nói trường hợp **không gửi**. Expected "200 JSON như `Accept: */*`" là đề xuất của tester (`known-issues.md:37`), nay có **Q13** (Open) trong `q-and-a.md`. Bằng chứng: lần chạy này (TC-026: `GET` 418, `POST` 418 + booking #3162 tạo ngầm, tìm theo tên, đã dọn), script-gen 3/3 lần `GET`, 2/2 lần `POST`. **Cần quyết**: có phải bug không, mức độ; có thêm biến thể `PUT` (418 mà vẫn ghi) / `PATCH` (500 mà vẫn ghi) không `Accept` vào TC-026 (hoặc TC mới) ở vòng sau không (+6 request, trên booking của mình, sau khi PO xác nhận). Hai biến thể này mới đo 1 lần, chưa có TC.
2. **Tải request vượt mức duyệt ở HITL #2**: mặc định ~889 (suy từ số đo) so với ~778, `@full` 977 so với ~864 (+13 – 14 %). **Cần quyết**: chấp nhận ~889 / 977 hoặc giảm (chạy bản cục bộ qua `RB_BASE_URL`, xem `test-data.md`).
3. **Tái hiện độc lập bug API**: `npm run repro` chỉ có SauceDemo; bug API tái hiện độc lập bằng gì (script `curl` / Node riêng ghi vào `bugs/<…>/manual/`)? Xem RB-101 triage mục cùng tên.

## Chạy tay (Phase 2b)
Không cần: 69/69 TC `automatable`, API không có phần cần mắt người / ngoài phạm vi Playwright (M1–M7 không xảy ra), không có kết quả đáng ngờ (M6).

## Evidence
- `test:run` của feature `-api` tự ghi evidence: 104 README (69 `all-cases/TC-001…069` + 35 `bugs/<ticket>_BUG-xx/TC-xxx`, 20 thư mục bug BUG-41 → BUG-60) và mục lục `evidence/README.md`. "Thời điểm" của cả 104 README nằm trong 2026-11-28T05:21:43Z → 05:28:04Z (mục lục dựng lại sau review, xem dưới): tất cả thuộc lần chạy này. Không có file nào khác README (API không có ảnh / video).
- `run-results/` chỉ có `run-20261128-052139.json`.
- Mục lục `evidence/README.md` đã **dựng lại sau review** bằng `--index-only` (không chạy test): dòng đầu ghi rõ "Mục lục dựng lại … từ evidence có sẵn", thời điểm chạy của từng TC nằm trong README của TC (review-executor E1, N1).

## Riêng tư
Quét `run-results/run-20261128-052139.json` và `evidence/`: không có đường dẫn máy (`C:\`, `Users`, `AppData`; JSON chỉ có `<repo>\…`), tên người dùng máy, mật khẩu quản trị, chuỗi hex dạng token. Token / Basic / Bearer đều là `***` hoặc `<token>`; giá trị token còn lại là dữ liệu sai công khai của test (`abc123`, `wrongtoken123`, rỗng). Mọi `firstname` / `lastname` trong phản hồi là booking của chính lần chạy (`QA-RB102-261128052139-eq72…`, hoặc tên rỗng / khoảng trắng / tab do TC-017, TC-053 tự tạo); không ghi tên booking của người khác.

## Kết quả HITL #3 (2026-11-28)
Người duyệt trả lời **"theo đề xuất"**: (1) chuyển BUG-37 → BUG-60 (24 bug) sang bước bug report; (2) BUG-60 là bug, mong đợi như `Accept: */*`, Medium, biến thể `PUT` / `PATCH` chỉ ghi trong bug report (test ở Bài 11); (3) chấp nhận tải ~889 request mặc định / 977 có `@full`; (4) tái hiện độc lập bằng script Node riêng `tests/repro/restful-booker.repro.ts`; BUG-37 → BUG-40 (8 lần đăng nhập sai) tái hiện ở ngày UTC kế tiếp.
