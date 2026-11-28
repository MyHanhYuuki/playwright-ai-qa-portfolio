# Review: bước script-gen, RB-102 Quản lý đặt phòng (restful-booker-booking-api)

- **Ngày**: 2026-11-27 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa** (0 lỗi 🔴, 4 lỗi 🟠, 7 lỗi 🟡; 2 điểm ❓)
- **Phạm vi**: thay đổi **chưa commit** trên nhánh `feat/bai10-restful-booker-api`.
  - Mới: `tests/specs/restful-booker-booking-api.spec.ts` (69 test).
  - Sửa (hạ tầng dùng chung với RB-101): `tests/api/rb-client.ts` (`createBookingVia`, `bookingIdOf`, kiểu `isOwner`), `tests/api/rb-run.ts` (`cleanupTracked` bỏ qua body không phải object), `tests/data/bugs.ts`, `messages.ts`, `restful-booker.ts`.
- **Nguồn đối chiếu**: `test-cases.csv` (69 TC `approved`), `test-data.md` (TD-01 → TD-29, MSG-01 → MSG-14, bảng ước lượng request), `known-issues.md` (BUG-41 → BUG-59, HITL #1, HITL #2), `q-and-a.md` (Q7), `spec-review.md` (O-02, O-08, O-14, O-17); RB-101 `reviews/review-script-gen.md` (ghi chú để RB-102 giữ thứ tự guard); `CLAUDE.md`; bài học L15, L17, L18 trong `qa-reviewer.md`.
- **Cách kiểm**:
  - Đọc toàn bộ spec (2308 dòng) và diff hạ tầng. So tự động spec ↔ CSV bằng script trong thư mục nháp: 69/69 test, tiêu đề, tag `@AC-x`, `@smoke` / `@security` / `@full`, `@BUG-xx` khớp câu đầu `notes`, `test.fail()` có ở đúng 34 TC "Bug đã biết": **0 lệch**. Describe khớp cột `screen`. Không có `waitForTimeout`, `networkidle`, `skip` / `fixme` / `only`.
  - So "Thứ tự TD-29" ở cuối `notes` của 34 TC (phần đang đúng / phần dự kiến FAIL) với code từng test: khớp, trừ 2 điểm ở D2, A3.
  - Đọc kết quả chạy thử script-gen do orchestrator đưa (thư mục nháp ngoài repo): `run-5` (cả spec, 69 test: 68 expected, 1 unexpected), `run-2`, `run-3`, `run-4`, `run-6-rb101`. Đọc **từng lỗi** của 34 TC bug ở `run-5`: mỗi TC chỉ fail ở phần bug, cổng cứng không bắn (phần đang đúng đạt).
  - Chạy lại có chọn lọc: `npx playwright test … --project=api -g "TC-026|TC-030" --reporter=json` (ra thư mục nháp): TC-026 lại fail (418), TC-030 pass, teardown dọn sót 0.
  - Thử trên API thật bằng `node:https` (booking tên `QA-RB102-REVIEW-<ngẫu nhiên>` của mình, đã xóa hết, lọc lại `[]`): `POST` không có `Accept` (2 lần); `POST` `Content-Type: application/json` body rỗng thật (0 byte) và body `""`; `POST` firstname / lastname / additionalneeds có khoảng trắng đầu cuối. Kiểm offline bằng server cục bộ: Playwright `data: ''` gửi gì.
  - Tổng request reviewer gửi tới máy chủ công khai: khoảng 35. **0 lần đăng nhập sai** (chỉ `POST /auth` với tài khoản đúng). Không chạy nhóm `@bad-login` của RB-101, không chạy `test:run` / `test:evidence` / `EVIDENCE=1`.
  - **Sơ suất của reviewer (đã khắc phục)**: script đọc CSV trong thư mục nháp lỡ ghi file tạm `tc.json` vào thư mục làm việc trong repo 2 lần (thư mục feature và gốc repo). Đã xóa ngay; `git status` sau đó không có file lạ.
  - Không làm lại kiểm đột biến cổng cứng: `hardGate()` giống hệt bản RB-101 đã kiểm đột biến ở review RB-101 lượt 1. Cấu trúc 34 TC: `hardGate()` đứng ngay trước `test.fail()`, không `test.fail()` nào nằm trong vòng lặp.

## Checklist (mục 5, code test)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Mỗi TC đúng 1 test, tên bắt đầu bằng TC id, tag khớp tài liệu | ✅ Đạt | So tự động 69/69, 0 lệch (tiêu đề, AC, cờ, BUG, `test.fail`) |
| Assertion theo expected của TC (HITL #1), không theo hiện trạng | ⚠️ Gần đạt | Đúng ở 68 TC. TC-030 bước 4 theo CSV nhưng oracle phụ thuộc dữ liệu người khác (B1). TC-064, TC-069 lệch CSV có lý do, đã ghi trong code (C1) |
| Oracle phân biệt được đúng / sai (L15) | ⚠️ Gần đạt | Có đối chứng: TC-030 bước 0, TC-021 Y, TC-023 kiểm header thật sự gửi, TC-026 kiểm không có `Accept`. **Không đạt**: TC-023 biến thể 4 không gửi body rỗng (A1). TC-050 `"150"` và TC-051 `0` không phân biệt được bằng "giống hệt mốc" (D4) |
| Bug đã biết: TD-29 5 bước, không `test.fail()` trong vòng lặp | ⚠️ Gần đạt | 34/34 có cổng cứng trước `test.fail()`. Phần đang đúng nằm sau `test.fail()`: TC-019 `additionalneeds` (A3), TC-055 / TC-065 "không 5xx" (D2) |
| L17: chỉ đụng booking của mình, ghi sổ trước request, dọn theo chủ sở hữu | ✅ Đạt | Mọi `POST` qua `post()` → `createBookingVia` (sổ ghi **trước** `send`). `PUT` / `PATCH` đặt tên mới gọi `ledger()` trước. Request ghi đều sau `snapshot()` / `GET` kiểm chủ sở hữu. TC-021, TC-064 kiểm cả X, Y ngay trước khi gửi `bookingid`. TC-054, TC-055, TC-065 kiểm id phải 404 trước khi ghi. TC-069 không gửi thông tin xác thực. Dọn dẹp: `isMine` khớp **chính xác** tên đã gửi. `run-5`: sổ 157 booking, dọn sót 0; TC-064 xóa Y 2 lần (bản ghi trùng BUG-51) |
| Bộ lọc trên máy chủ dùng chung chỉ khẳng định booking của mình | ⚠️ Gần đạt | TC-032 → TC-036, TC-038, TD-28 S0 / S1 đúng. TC-064, TC-069 đã thêm tên lần chạy. **Không đạt**: TC-030 bước 4 (B1) |
| Reset guard (TD-26) | ⚠️ Gần đạt | Đặt đúng ở mọi test có booking của mình; 404 sau DELETE thành công không kích hoạt (TC-054, TC-063, TC-068). Lỗi `expect.soft` của lần 1 còn lại sau khi làm lại ở test dương tính (D3) |
| Không đăng nhập sai có chủ ý | ✅ Đạt | Chỉ `api.freshToken()`. Basic sai (TC-066 v14) không đi qua `/auth`. `run-5`: "đăng nhập thất bại 0" ở mọi test |
| Riêng tư | ⚠️ Gần đạt | Token biến thể qua `api.derived()`, Basic qua `addSecret`. TC-030 ghi firstname booking người khác vào annotation (D5) |
| Typecheck, hạ tầng dùng chung không làm đổi RB-101 | ✅ Đạt | `createBooking` giữ nguyên tham số sổ, `isOwner`, nhãn; `bookingIdOf` đọc JSON như cũ, chỉ thêm XML; `cleanupTracked` chỉ đổi lỗi ném thành ghi chú khi body không phải object. `run-6-rb101` (TC-019/021/022/029 + teardown) đều expected |
| Tải lên máy chủ công khai | ⚠️ | 1015 request (gồm `@full`), vượt ước lượng ~864 khoảng 17 %; mặc định chưa bỏ `@full` (B2, D1) |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | **TC-023 biến thể 4 không gửi body rỗng, mà gửi chuỗi `""` (2 byte)**, nên bỏ lọt BUG-58 biến thể 4 (false negative). Đề xuất "cập nhật known-issues: biến thể 4 nay là 400" (câu hỏi 4 của script-gen) là **sai**: bug vẫn còn | Server cục bộ: Playwright `fetch(…, { data: '' })` gửi `Content-Length: 2`, body `""`; `data: Buffer.alloc(0)` gửi 0 byte. API thật: `POST /booking` `application/json` 0 byte → **500** `Internal Server Error`; body `""` → 400 `Bad Request`. Spec dòng 860 `req: { data: '' }`. RB-101 TC-009 đã dùng đúng `Buffer.alloc(0)` (`restful-booker-auth-api.spec.ts:238`). `rb-client.ts` `send()` còn ghi vào evidence "(chuỗi rỗng)" trong khi thực tế gửi `""` | 🟠 | Biến thể 4 gửi `data: Buffer.alloc(0)` (hoặc `sendRaw` với `Content-Type: application/json`). Trong `send()` đổi `data === ''` thành `Buffer.alloc(0)` để thư viện không tự thêm `""` (RB-101 không dùng `''`, không đổi hành vi). **Không** sửa `known-issues.md` BUG-58 |
| A2 | **Không gửi `Accept`: `GET /booking/:id` trả 418, `POST /booking` trả 418 mà vẫn tạo booking ẩn.** TC-026 bước 1 đỏ thật, không phải lỗi script. O-02 lúc khám phá ghi "không gửi → 200" nhưng nhiều khả năng công cụ đã tự gửi `Accept: */*`. `POST` không `Accept` chưa có TC nào bắt | TC-026: `run-3`, `run-5`, lần chạy lại của reviewer đều 418 `text/plain`, header thật sự gửi không có `accept`. Bước 2 (`Accept: */*`) 200 JSON đúng. Thử thật: `POST` không `Accept` 2/2 → 418 `I'm a Teapot`, tìm theo tên thấy **2 booking** (đã xóa). `GET /booking?firstname=…` không `Accept` → 200 JSON (đúng) | 🟠 | Xem trả lời câu hỏi 1: cấp **BUG-60** (Medium, "cùng kiểu với BUG-49"), ghi `known-issues.md`, `bugs.ts`, câu đầu `notes` TC-026. TC-026 chuyển sang TD-29: bước 2 là phần đang đúng → cổng → `test.fail()` → bước 1. Thêm biến thể `POST` không `Accept` (qua `post()`, tìm theo tên để dọn như TC-062). test-impl thử thêm `PUT` / `PATCH` không `Accept` (❓1) |
| A3 | **BUG-59 ghi sai phạm vi**: server cắt khoảng trắng ở **firstname và lastname**, **không** cắt `additionalneeds`. TC-019 kiểm `additionalneeds` (đang đúng) **sau** `test.fail()` (L18): nếu sau này server cắt cả `additionalneeds`, test vẫn "fail như dự kiến". firstname chưa có TC | `run-2`, `run-5`: TC-019 chỉ lỗi ở lastname, `additionalneeds` giữ `"  Pad  "`. Thử thật: firstname `"  QA-RB102-REVIEW-…  "` → lưu không còn khoảng trắng; lastname → cắt; `additionalneeds` → giữ nguyên (body trả về và `GET`) | 🟡 | `known-issues.md` BUG-59 và `test-data.md` TD-12: ghi "firstname, lastname bị cắt; additionalneeds giữ nguyên (2026-11-27)". TC-019: chuyển kiểm `additionalneeds` lên phần đang đúng (trước cổng), sửa "Thứ tự TD-29" trong `notes`. Cân nhắc thêm biến thể firstname (L1) |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **TC-030 bước 4 (`firstname=` rỗng → `[]`) phụ thuộc dữ liệu người khác**, trái TD-26 mục 8 ("chỉ khẳng định booking của mình"). Server khớp chính xác nên trả booking có firstname rỗng của người khác (BUG-55 cho phép tạo). Kết quả lúc đỏ lúc xanh | `run-3`: đỏ, `[{"bookingid":3274},{"bookingid":3284}]`; 2 id này không có trong sổ, không có trong phần dọn của TC-017 lần chạy trước (`run-2` dọn 2395 → 2412), nên là booking người khác. `run-5` và lần chạy lại của reviewer: xanh | 🟠 | Xem trả lời câu hỏi 2. Oracle mới: 200, mảng JSON; **không có X**; mỗi id trả về (đọc ≤ 3, chỉ `GET`) có `firstname === ''`; nếu nhiều hơn 3 phần tử thì số phần tử nhỏ hơn `GET /booking` không lọc (bộ lọc không bị bỏ). Đây là cách hiểu Q7 (d) theo Q7 (a) "khớp chính xác": orchestrator ghi làm rõ vào `q-and-a.md` Q7 và sửa expected TC-030 trong CSV |
| B2 | **Lệnh mặc định không bỏ `@full`**, trái HITL #2 mục 11 và `test-data.md` ("Mặc định = mọi TC trừ tag `@full`"). `test:run`, `test:api`, `test:evidence`, `test:stability` đều chạy TC-013 (41 request) và TC-067 (54 request) | `grep` `full` trong `package.json`, `scripts/run-*.mjs`: chỉ có `--grep-invert @bad-login`, không có `@full`. `run-5`: TC-013, TC-067 đều chạy | 🟠 | Feature API: mặc định `--grep-invert "@full"`; nơi đã bỏ `@bad-login` thì gộp thành **một** biểu thức `@bad-login|@full` (Playwright chỉ nhận một `--grep-invert`). Thêm cờ `--include-full`. Job CI `api-full` giữ chạy đủ. Ghi vào `CLAUDE.md` (đoạn "Web và API") |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | Hai điểm lệch CSV có lý do, mới ghi trong chú thích code, chưa vào tài liệu: TC-064 bước 4 lọc thêm `firstname=<run>`; TC-069 lastname của `PUT` / `POST` mang tên lần chạy `QA-RB102-<RUN>-TC-069-put` / `-post` | Spec dòng 2001-2005, 2171-2175; CSV TC-064 bước 4 `?lastname=TC-064-put-x-moi`, TC-069 lastname `TC-069-put` | 🟡 | Chấp nhận cả hai (lọc chỉ theo lastname trần có thể trùng booking của lần chạy khác). Sửa CSV TC-064, TC-069 cho khớp code. Thêm vào TD-02: "lọc **chỉ** theo lastname thì lastname phải mang `QA-RB102-<RUN>`, hoặc lọc kèm firstname của lần chạy". Không cần HITL (đổi dữ liệu, không đổi kết quả mong đợi) |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | **Số request vượt ước lượng** ngoài biên ±15 %: 1015 request (1000 + teardown 15) so với ~864 (cả `@full`, hiện tại). Mặc định (bỏ `@full`) sẽ khoảng 920 so với ~778. Phần dôi chủ yếu do `cleanupTracked` lấy **token mới cho mỗi booking** (157 booking trong sổ → khoảng 157 `POST /auth` thêm), trong khi bảng ước lượng tính 2 request mỗi booking | `run-5` annotation `requests` theo describe: POST 335 (ước lượng ~278), PUT 93 (~79), PATCH 119 (~91), DELETE 33 (~24), Chung 318 (~279), GET list 86 (~83), GET id 16 (~15). `rb-run.ts` `cleanupTracked`: `api.freshToken()` trong vòng lặp | 🟡 | (1) `cleanupTracked` dùng **một** token cho cả lượt dọn, chỉ lấy lại khi DELETE bị 403 (RB-101 cũng được lợi). (2) Bỏ `@full` mặc định (B2). Hai việc này đưa lần chạy mặc định về khoảng 770. (3) Cập nhật bảng "Ước lượng số request" trong `test-data.md` bằng số đo thật |
| D2 | **TC-055, TC-065: "không 5xx" đang đúng (hiện 405) nhưng kiểm sau `test.fail()`** (L18). Nếu server đổi sang 500, test vẫn "fail như dự kiến" | Spec dòng 1641, 2065 (`softNo5xx` sau `test.fail`); CSV `notes` của 2 TC cũng không liệt kê "không 5xx" ở phần đang đúng, dù EXP có "kiểm chung phản hồi lỗi" | 🟡 | Chuyển `softNo5xx` lên trước `hardGate()` ở 2 TC; sửa "Thứ tự TD-29" trong `notes` CSV |
| D3 | **Sau `env-reset`, lỗi `expect.soft` của lần 1 vẫn còn** ở các test dương tính: assertion mềm nằm **trước** guard trong cùng thân `withResetGuard`. Ví dụ TC-040: reset trước `PUT` → `PUT` 405 (không phải 403, `guardToken` không bắt) → `expect.soft(200)` ghi lỗi → `readOwn` 404 mới phát hiện reset → làm lại đạt, nhưng test vẫn đỏ vì lỗi cũ. Review RB-101 đã ghi chú "RB-102 giữ thứ tự guard trước mọi expect" | TC-001, 002, 010, 015, 018, 020, 021, 022, 026, 028, 029, 040, 043, 047, 049, 056, 057, 059: `expect.soft` xen giữa các bước còn guard phía sau. Test bug đã làm đúng: gom phản hồi trong guard, assert sau (TC-009, 019, 033, 042, 048, 058…) | 🟡 | Gom phản hồi trong `withResetGuard`, đặt mọi `expect.soft` **sau** khi guard trả về (như các test bug). Hoặc `withResetGuard` ghi số lỗi trước mỗi lần chạy và báo rõ "lỗi của lần 1, đã reset" (không xóa được lỗi khỏi `testInfo`) |
| D4 | **"Giống hệt mốc" không phân biệt được ở 2 biến thể** (L15): TC-050 `PATCH {"totalprice": "150"}` trên mốc `totalprice 150`; TC-051 `PATCH {"depositpaid": 0}` trên mốc `depositpaid false`. Giá trị bị ép kiểu trùng giá trị mốc, nên "booking không đổi" đúng cả khi server **nhận và ghi**. Hiện chỉ mã 200 bắt được bug | `run-5`: TC-050 `"150"` chỉ lỗi `400`, không lỗi "giống hệt mốc"; TC-051 `0` tương tự | 🟡 | test-impl: mốc của 2 biến thể khác giá trị ép kiểu (vd `"275"` cho TC-050, hoặc booking `depositpaid true` cho biến thể `0` của TC-051). Sửa CSV + code |
| D5 | TC-030 ghi **firstname của booking người khác** vào annotation (→ `run-results/`, file được commit) | Spec dòng 1007-1013: `seen.push(… firstname ${JSON.stringify(…)})` | 🟡 | Chỉ ghi dạng có / không: "`firstname === ''`: đúng / sai", không ghi giá trị. Gộp vào việc sửa B1 |

## E. Đề xuất quy trình
| # | Vấn đề | Đề xuất |
|---|---|---|
| E1 | Hiện trạng "đúng" của khám phá (O-02, O-08 `""`) lệch khi gửi request **thật sự** không có header / body rỗng 0 byte: công cụ khám phá tự thêm `Accept: */*`, thư viện tự đổi `''` thành `""` | Thêm vào checklist khám phá / test-impl: biến thể "không gửi header X" và "body rỗng" phải chứng minh bằng header / byte **thật sự gửi** (`sendRaw`, `sentHeaders`, server cục bộ). Đề xuất thêm bài học L20 vào `qa-reviewer.md` |

## ❓ Điểm nghi ngờ
| # | Nghi ngờ | Cách kiểm |
|---|---|---|
| ❓1 | `PUT` / `PATCH` không `Accept` có trả 418 mà vẫn ghi dữ liệu không (giống BUG-49) | test-impl thử trên booking của mình (2 request + `GET` so mốc), ghi vào `known-issues.md` cùng BUG-60 |
| ❓2 | TC-005 dọn dẹp với `isOwner` = "mọi trường `null` / không có" (không phải khớp tên chính xác, L17). Nếu sau này `{}` tạo được booking và id bị dùng lại sau reset, có thể xóa nhầm booking rỗng của người khác | Rủi ro thấp (id lấy ngay từ phản hồi của chính test). Có thể giữ, hoặc chỉ dọn khi `GET` ngay sau `POST` trong cùng test |

## Trả lời các câu hỏi mở của script-gen
| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | TC-026 không `Accept` → 418: bug mới hay biến thể BUG-49? `test.fail` + tag? | Hành vi có thật (A2), kể cả `POST` tạo booking ẩn. Đề xuất **BUG-60** (Medium), ghi "cùng kiểu với BUG-49": cùng khâu chọn định dạng phản hồi nhưng **expected khác** (thiếu `Accept` → mặc định 200 JSON, không phải 406), TC khác. Đây là cùng lập luận đã dùng khi tách BUG-46 / BUG-47 (cùng hàm, expected khác, 2 số). Orchestrator có thể gộp vào BUG-49 nếu muốn, nhưng khi đó expected của BUG-49 có 2 vế. **Có** `test.fail()` + `@BUG-60`, **sau khi** orchestrator ghi số vào `known-issues.md`, `bugs.ts`, câu đầu `notes` TC-026; theo TD-29 (bước 2 trước cổng). Không để TC-026 đỏ "unexpected" tới executor |
| 2 | TC-030 bước 4 đổi oracle? | **Có** (B1): không có X; các id trả về đều có `firstname` rỗng (đọc ≤ 3); không trả toàn bộ danh sách. Ghi làm rõ Q7 (d) và sửa CSV. Annotation không ghi giá trị firstname người khác (D5) |
| 3 | Không lệnh nào bỏ `@full`: chấp nhận được? | **Không** (B2): trái HITL #2 mục 11; thêm khoảng 95 request mỗi lần chạy |
| 4 | TC-019 `additionalneeds` không bị cắt; TC-023 biến thể 4 nay 400: cập nhật known-issues? | TC-019: **có**, và mở rộng: firstname cũng bị cắt (A3); chuyển `additionalneeds` lên phần đang đúng. TC-023: **không**: lỗi của script (gửi `""`), body rỗng thật vẫn 500 (A1) |
| 5 | Lastname TC-069 và bộ lọc TC-064 có tên lần chạy: ghi vào CSV / test-data? | **Có** (C1), kèm quy tắc chung ở TD-02 |
| – | ~1000 request có chấp nhận được? | Chạy tuần tự khoảng 2,7 request/giây trong ~6 phút: chấp nhận cho lần chạy thỉnh thoảng (theo buổi, theo tuần), **không** cho chạy lặp. Nhưng vượt mức đã duyệt: cần D1 + B2 để về khoảng 770 mặc định |
| – | `rb-client.ts` có CRLF? | Không ảnh hưởng: cả file đều CRLF (388/388 dòng, không lẫn), `core.autocrlf` + `.gitattributes` chuẩn hóa về LF khi commit, `git diff` chỉ hiện đúng các đoạn sửa. Nên đổi lại LF cho đồng bộ với các file khác (tùy chọn) |

## Việc cần làm trước khi sang executor (xếp theo mức độ)
1. 🟠 A1: TC-023 biến thể 4 gửi 0 byte (`Buffer.alloc(0)`); `send()` đổi `''` thành buffer rỗng. Không sửa BUG-58.
2. 🟠 A2: orchestrator cấp BUG-60 (`known-issues.md`, `bugs.ts`, CSV TC-026); TC-026 theo TD-29 + `test.fail()`; thêm biến thể `POST` không `Accept`.
3. 🟠 B1: oracle mới cho TC-030 bước 4 + làm rõ Q7 (d) + sửa CSV.
4. 🟠 B2: lệnh mặc định bỏ `@full`, cờ `--include-full`.
5. 🟡 A3, C1, D1, D2, D3, D4, D5; ❓1, ❓2.

## Xử lý sau review
| # | Xử lý |
|---|---|
| A1 | ✅ `restful-booker-booking-api.spec.ts:903-904` TC-023 biến thể 4 gửi `Buffer.alloc(0)` (0 byte); `rb-client.ts:232` `send()` đổi `data === ''` thành buffer rỗng. `known-issues.md` BUG-58 không sửa. Chạy thử: TC-023 expected (biến thể 4 nay bắt được 500) |
| A2 | ✅ `known-issues.md` BUG-60 (dòng 37) + `tests/data/bugs.ts:68` + CSV TC-026 (title, steps, expected, `notes` mở đầu BUG-60); spec `:1970-2016` TC-026 theo TD-29 (bước 2 trước cổng, `test.fail`, tag `@BUG-60`) + biến thể `POST` không `Accept` (tìm theo tên để dọn). Chạy thử: expected (fail đúng phần bug) |
| A3 | ✅ Spec `:814-818` TC-019 kiểm `additionalneeds` trước cổng, `test.fail` chỉ còn lastname; `known-issues.md` BUG-59 phạm vi firstname + lastname; `test-data.md` TD-12; CSV TC-019 `notes` / thứ tự TD-29. Chưa thêm biến thể firstname riêng ("cân nhắc", không ép) |
| B1 | ✅ Spec TC-030 `:1007-1070` bước 4 oracle mới (mảng, không có X, id đọc ≤ 3 đều `firstname === ''`, không bỏ bộ lọc); CSV TC-030 steps / expected; `q-and-a.md` Q7 làm rõ (d). Chạy thử: pass |
| B2 | ✅ `package.json:10` (`test:api` có `--grep-invert @full`), `scripts/run-evidence.mjs`, `scripts/run-stability.mjs` (cờ `--include-full`, gộp một biểu thức với `@bad-login`), `CLAUDE.md`, `README.md` |
| C1 | ✅ CSV TC-064 bước 4 (kèm `firstname=QA-RB102-<RUN>`), TC-069 steps (lastname `QA-RB102-<RUN>-TC-069-put` / `-post`); `test-data.md` TD-02 thêm quy tắc lọc chỉ theo lastname |
| D1 | ⚠️ Một phần: `rb-run.ts:196-210` `cleanupTracked` dùng một token cho cả lượt dọn, lấy lại khi DELETE 403; bỏ `@full` mặc định (B2). **Chưa** cập nhật bảng "Ước lượng số request" trong `test-data.md` bằng số đo thật (cần một lần chạy đủ, bị cấm trong lượt này) |
| D2 | ✅ Spec `:1682` (TC-055) và `:2151` (TC-065) `softNo5xx` trước `hardGate()`; CSV `notes` TC-055, TC-065 thêm "không 5xx (hiện 405)" vào phần đang đúng. Chạy thử: expected |
| D3 | ✅ Spec `:255-292` `softExpect` + `guarded()`: `expect.soft` trong thân guard được xếp hàng và chỉ chạy sau lần làm lại cuối; khoảng 50 chỗ dùng `guarded`. Chạy thử TC-040, TC-009 (+ các TC khác): expected. Chưa mô phỏng một lần `env-reset` thật (không gây reset trên máy chủ công khai) |
| D4 | ✅ Spec `:1506-1560`: TC-050 mốc `totalprice 275` (`"150"` khác mốc); TC-051 biến thể `0` chạy trên booking `depositpaid true`; CSV TC-050, TC-051 steps / expected / notes. Chạy thử: nay lỗi cả "giống hệt mốc" lẫn mã 200, tức oracle phân biệt được |
| D5 | ✅ Spec `:1055-1068` annotation TC-030 chỉ ghi số đếm, không ghi firstname của người khác |
| ❓1 | ✅ Đo 2026-11-28 (1 booking của mình, xóa sau khi GET xác nhận tên, 0 sót): `PUT` không `Accept` → 418 mà dữ liệu vẫn ghi; `PATCH` không `Accept` → 500 mà dữ liệu vẫn ghi. Ghi vào `known-issues.md` BUG-60 (biến thể). Không thêm TC |
| ❓2 | ✅ Giữ nguyên, rủi ro thấp: TC-005 chỉ dọn id lấy ngay từ phản hồi `POST` của chính test, `isOwner` đòi mọi trường rỗng, cần đồng thời (id bị dùng lại sau reset) và (người khác cũng tạo booking rỗng) mới xóa nhầm; sửa theo phương án "GET ngay sau POST" cần đổi `postVariants` (rủi ro hồi quy hơn lợi ích) |

## Kiểm lại lượt 2
- **Ngày**: 2026-11-28 · **Reviewer**: qa-reviewer · **Kết luận**: ⚠️ **Gần đạt** (0 🔴, 0 🟠; 12/13 dòng ✅, D1 ⚠️ một phần; 3 lỗi 🟡 mới; 1 ❓). Sang executor được sau khi chốt N1 (cách executor chạy `@full`); nên sửa N3 trước lần chạy đủ.
- **Phạm vi**: chỉ phần thay đổi (`git diff` + spec mới chưa track) so với từng dòng "Xử lý sau review". Không review lại toàn bộ.
- **Cách kiểm**:
  - Đọc diff `package.json`, `scripts/run-{tests,evidence,stability}.mjs`, `tests/api/rb-client.ts`, `tests/api/rb-run.ts`, `tests/data/*`, `known-issues.md`, `q-and-a.md`, `test-data.md`, `CLAUDE.md`, `README.md`. Đọc trong spec: helper (dòng 1-330), TC-019, TC-023, TC-026, TC-030, TC-050, TC-051, TC-055, TC-065. Tách CSV bằng script (69 TC + dòng tiêu đề, 16 cột) và so 10 TC liên quan với code.
  - D3: script quét spec (thư mục nháp): 44 lời gọi `guarded()`, **không** lồng nhau (kể cả qua `patchRefused`, `rejectMatrix`); **0** `hardGate()`, `test.fail(`, `expect.soft(` trực tiếp, `test.info().errors` nằm trong thân `guarded()`; liệt kê đối số của mọi `softExpect` bị hoãn: đều là giá trị nguyên thủy, bản sao (`bad.slice`) hoặc JSON phản hồi không bị sửa sau đó.
  - Đọc lần chạy thử của orchestrator (TC-009, 019, 023, 026, 030, 040, 050, 051, 055, 065 + teardown: 11 expected, 0 unexpected), đọc **từng lỗi** của 8 TC bug.
  - Chạy lại có chọn lọc (ra thư mục nháp): RB-101 `-g "TC-019 |TC-029 " --grep-invert @bad-login` để kiểm `cleanupTracked` mới trên RB-101: 3 expected; TC-019 `DELETE 201`, TC-029 `GET 404` (test tự xóa); teardown "2 booking trong sổ, dọn sót 0"; 15 request, 0 đăng nhập sai. Không chạy `test:run` / `test:evidence` / `EVIDENCE=1`, không chạy nhóm `@bad-login`; `git status` sau khi chạy không có file lạ.

### Đối chiếu bảng "Xử lý sau review"
| # | Kết quả | Bằng chứng |
|---|---|---|
| A1 | ✅ | `rb-client.ts:231-232` đổi `data === ''` thành `Buffer.alloc(0)` (RB-101 không dùng `data: ''`: `grep` chỉ thấy chú thích); bỏ nhãn "(chuỗi rỗng)" sai. Spec `:903-904` biến thể 4 gửi `Buffer.alloc(0)`. Lần chạy thử: biến thể 4 nay lỗi "HTTP 400" + "không 5xx" (server trả 500 với body 0 byte, BUG-58 bắt được). `known-issues.md` BUG-58 không đổi. Ghi chú chữ trong CSV ở N2 |
| A2 | ✅ | BUG-60 khớp 3 nơi: `known-issues.md:37`, `bugs.ts:68`, CSV `:27` câu đầu `notes` "Bug đã biết BUG-60"; tag `@BUG-60` ở spec `:1970`; `CLAUDE.md` đổi số trống thành BUG-61. **Thứ tự TD-29** (spec `:2000-2015`): bước 2 (`Accept: */*`) 200 / MSG-10 / 7 giá trị + không lộ lỗi nội bộ (bước 1, 3) → `hardGate()` → `test.fail()` → bước 1 và bước 3; khớp "Thứ tự TD-29" trong CSV. Đối chứng "thật sự không gửi `Accept`" là `expect` cứng trong guard (`sentHeaders`), đúng L15. **L17 biến thể `POST`**: đi qua `post()` → `createBookingVia`, sổ ghi **trước** `sendRaw` (firstname `QA-RB102-<RUN>`, teardown quét theo tên này); phản hồi 418 không có id nên tìm theo `firstname=<run>&lastname=TC-026-post` rồi `track` với `isMine` khớp chính xác. Lần chạy thử: dọn `#999` (X) và `#1015` (booking ẩn của `POST`), cả hai `DELETE 201`. Riêng `spec-review.md` O-02 chưa sửa: N2 |
| A3 | ✅ | Spec `:814-818` `additionalneeds` (đang đúng) trước `hardGate()`, sau `test.fail` chỉ còn lastname; lần chạy thử TC-019 chỉ lỗi 2 dòng lastname. `known-issues.md:26`, `test-data.md:21` TD-12, CSV `notes` TC-019 đã ghi phạm vi firstname + lastname. Không thêm biến thể firstname riêng: chấp nhận (lượt 1 ghi "cân nhắc") |
| B1 | ✅ | Spec `:1033-1056`. Oracle mới không bị dữ liệu người khác làm đỏ: (1) booking người khác có firstname rỗng là **đúng** theo Q7 (d) đã làm rõ; (2) id bị xóa giữa lúc lấy danh sách và lúc `GET` → đếm "không đọc được", không fail; (3) chỉ ghi số đếm (D5). Vẫn đỏ được khi sai thật: bộ lọc bị bỏ → trong 3 id đầu có firstname khác rỗng (`notEmpty`) và số phần tử không nhỏ hơn danh sách không lọc; X xuất hiện → đỏ. Chỉ `GET` trên booking người khác (L17). Rủi ro còn lại (booking người khác bị sửa firstname đúng trong vài trăm ms giữa 2 request) không đáng kể. `q-and-a.md:36` Q7 làm rõ (d), CSV `:31` steps / expected khớp code. Lần chạy thử: bước 4 trả 0 phần tử, nhánh "> 3 phần tử" mới kiểm bằng đọc code |
| B2 | ✅ | `package.json:10` `test:api` thêm `--grep-invert @full` (vẫn chạy `@bad-login`, đúng `CLAUDE.md`). `run-evidence.mjs`, `run-stability.mjs`: **một** `--grep-invert` gộp `@bad-login|@full`, cờ `--include-full`, có `-g` thì không tự bỏ `@full`. `run-tests.mjs`: **không** đưa `@bad-login` vào biểu thức bỏ (RB-101 `test:run` vẫn là lần chạy của nhóm này), chỉ bỏ `@full`. RB-101 không có test `@full` (`grep` 0) nên không đổi. CI `api-full` (`npx playwright test --project=api`) vẫn chạy đủ. Hệ quả cho executor / RTM: N1 |
| C1 | ✅ | CSV TC-064 bước 4 kèm `firstname=QA-RB102-<RUN>`, TC-069 lastname `QA-RB102-<RUN>-TC-069-put` / `-post`; `test-data.md:11` TD-02 thêm quy tắc lọc chỉ theo lastname |
| D1 | ⚠️ Một phần (chấp nhận hoãn, có điều kiện) | Code: `rb-run.ts:185-211` một token cho cả lượt dọn; **vẫn** `GET` + `isOwner` khớp chính xác ngay trước mỗi `DELETE` đầu; vòng `maxDeletes` vẫn `GET` lại. An toàn cho RB-101 (lần chạy lại RB-101 ở trên: dọn đúng, dọn sót 0). **Lỗi mới N3**: nhánh thử lại sau 403 xóa mà không `GET` lại. Bảng ước lượng request (`test-data.md:157`): **chấp nhận** lấy số từ lần chạy đủ của executor, vì reviewer / test-impl không được chạy cả spec. Điều kiện: (a) mở việc trong bảng "Xử lý sau lượt 2" (orchestrator làm sau executor); (b) lần chạy đó có đủ số cho cả cột mặc định lẫn cột `@full` (xem N1), nếu không bảng chỉ cập nhật được một nửa |
| D2 | ✅ | Spec `:1682` (TC-055), `:2151` (TC-065) `softNo5xx` trước `hardGate()` (`:1684`, `:2154`); CSV `notes` 2 TC ghi "không 5xx (hiện 405)" ở phần đang đúng |
| D3 | ✅ | Spec `:254-292`. `guarded()` xếp hàng `softExpect` (giá trị lấy **ngay lúc gọi**), mỗi lần làm lại tạo hàng mới (`queue = []`), `finally` chạy hàng của lần **cuối**: lỗi mềm của lần bị `env-reset` bị bỏ. **Không che lỗi thật**: (1) lỗi cứng hoặc lỗi không phải `ResetSuspect` vẫn ném ra, hàng của lần đó vẫn chạy trong `finally`; (2) reset lần 2 / thiếu dấu hiệu → fail như cũ, hàng vẫn chạy; (3) quét spec: không `hardGate()` / `test.fail()` nào nằm trong `guarded()`, nên cổng cứng luôn thấy lỗi mềm của phần đang đúng (L18 giữ nguyên); không `guarded()` lồng nhau (lồng sẽ làm `softSink` về `null` sớm). Ngoài `guarded()` là `expect.soft` thường. Chưa mô phỏng reset thật: chấp nhận (đọc code + quét đủ). Evidence không gắn lỗi theo bước (`api-evidence.ts:79`) nên hoãn assert không làm lệch evidence. Xem ❓3 |
| D4 | ✅ | Spec `:1508-1509` TC-050 mốc `totalprice 275`, `patchRefused` khôi phục mốc sau mỗi biến thể nên `"150"` (ép thành 150) khác mốc; `:1545-1546` TC-051 biến thể `0` chạy trên booking `depositpaid true`. Lần chạy thử: `"150"` và `0` nay lỗi **cả** "400" **và** "giống hệt mốc", tức oracle phân biệt được nhận / từ chối. CSV `:51-52` steps / expected / notes khớp |
| D5 | ✅ | Spec `:1052-1055` annotation chỉ có số đếm; lần chạy thử: "0 phần tử; đọc 0: …" |
| ❓1 | ✅ | `known-issues.md:37` BUG-60 ghi biến thể `PUT` (418, vẫn ghi) và `PATCH` (500, vẫn ghi), đo trên booking của mình, đã xóa. Không thêm TC: chấp nhận ở bước này (đã ghi "chưa lặp"); bug-reporter / HITL #3 quyết có thêm TC hay không |
| ❓2 | ✅ | Đồng ý giữ nguyên, lý do trong bảng hợp lý |

### Phát hiện mới ở lượt 2
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| N1 | **Lần chạy chính thức của executor sẽ thiếu TC-013, TC-067 mà vẫn ghi `scope: "full"`**. `test:run` mặc định nay bỏ `@full`, nhưng `scope` chỉ xét `-g` nên vẫn là `full`; RTM chỉ cảnh báo "Số test (67) khác số TC (69)", "TC chưa có kết quả: TC-013, TC-067" và hiện 2 TC "Not run". `executor.md`, `qa-orchestrator.md` chưa nói gì về `@full` / `--include-full` | `run-tests.mjs:30-36`; `build-rtm.mjs:55-60`; `grep "@full\|include-full" .claude/` → 0 | 🟡 | Orchestrator chốt **trước** executor: lần chạy chính thức RB-102 (dùng cho RTM / HITL #3, tương đương "trước release" của HITL #2 mục 11) dùng `npm run test:run -- restful-booker-booking-api --include-full`, ghi vào brief executor; lần đó cũng cho đủ số đo cho D1 (cả 2 cột). `run-tests.mjs`: `scope` = `full` chỉ khi không bỏ `@full`, còn lại ghi rõ (vd `default (bỏ @full)`) để RTM cảnh báo đúng nguyên nhân. Tùy chọn: dò cả dạng `--grep=` / `-g=` khi tính `explicitGrep` |
| N2 | **Tài liệu chưa theo BUG-60 / A1**: CSV TC-026 `notes` ghi "O-02 sửa lại 2026-11-27" nhưng `spec-review.md:62` O-02 vẫn ghi `Accept` "không gửi" → 200; `spec-review.md:200` và đầu spec (`restful-booker-booking-api.spec.ts:5`) vẫn ghi "BUG-41 → BUG-59"; RB-101 `known-issues.md:5` "RB-102 dùng tiếp BUG-41 → BUG-59". CSV TC-023 bước 4 vẫn ghi "body chuỗi rỗng ''" (đúng cách hiểu đã gây A1) | `grep` các dòng nêu | 🟡 | O-02: ghi "không gửi `Accept` → 418 (BUG-60, đo lại 2026-11-27; lúc khám phá công cụ tự thêm `Accept: */*`)". Đổi các chỗ "BUG-41 → BUG-59" thành "BUG-41 → BUG-60". CSV TC-023 bước 4: "body rỗng 0 byte (không phải chuỗi JSON `""`)" |
| N3 | **`cleanupTracked` thử lại `DELETE` sau 403 mà không kiểm lại chủ sở hữu** (L17). Token đang dùng lại bị 403 gần như chỉ xảy ra khi server vừa reset, đúng lúc id có thể đã thuộc về người khác; nhánh này lấy token mới rồi `DELETE` ngay | `rb-run.ts:204-207` | 🟡 | Khi 403 với token dùng lại: lấy token mới rồi **quay lại đầu vòng** (`GET` + `isOwner` khớp chính xác) thay vì xóa ngay, vd đặt cờ rồi `continue` mà không tính vào `maxDeletes`. Hàm dùng chung với RB-101 nên chạy lại RB-101 `-g "TC-019 |TC-029 "` sau khi sửa |

### ❓ Điểm nghi ngờ lượt 2
| # | Nghi ngờ | Đánh giá |
|---|---|---|
| ❓3 | `softSink` là biến cấp module: nếu một test hết giờ **trong** `guarded()` mà worker được dùng lại, `softSink` còn trỏ tới hàng cũ, các `softExpect` ngoài `guarded()` của test sau bị xếp hàng rồi mất | Rủi ro rất thấp: `test.fail()` luôn gọi **sau** `guarded()` (đã quét), nên hết giờ trong `guarded()` luôn là "unexpected" và Playwright thay worker mới. Không bắt buộc sửa; muốn chắc thì thêm `test.beforeEach(() => { softSink = null; })` |

### Kết luận lượt 2
- 12/13 dòng đạt; D1 phần code đạt, phần bảng ước lượng hoãn tới sau executor là **chấp nhận được** (cần lần chạy đủ, reviewer / test-impl không được chạy).
- Không còn 🔴 / 🟠. Ba lỗi 🟡 mới: N1 là **quyết định trước executor** (có chạy `--include-full` hay không), N3 sửa nhỏ, nên làm trước lần chạy đủ (lần đó dọn khoảng 150 booking), N2 là tài liệu, làm trước commit.
- **Sang executor được** khi N1 đã chốt và ghi vào brief executor. N2, N3 orchestrator tự kiểm được (diff vài dòng + chạy lại RB-101 `-g`), không cần lượt 3 đầy đủ, chỉ cần điền bảng dưới.

### Xử lý sau lượt 2
| # | Xử lý |
|---|---|
| N1 | ✅ Lần chạy chính thức của feature `-api` dùng `--include-full` (gồm TC-013, TC-067): ghi vào `.claude/agents/executor.md` (lệnh chạy) và `.claude/commands/qa-orchestrator.md:124` (bước executor). `scripts/run-tests.mjs:36-37`: `scope` chỉ là `full` khi không lọc gì; mặc định API ghi `default:không @full` (RTM cảnh báo TC "Not run") |
| N2 | ✅ `spec-review.md:62` O-02 thêm đính chính (không `Accept` thật → 418, BUG-60); `spec-review.md:200`, đầu spec (dòng 5), RB-101 `known-issues.md:5` thêm BUG-60; CSV TC-023 bước 4 "body rỗng thật (0 byte)" |
| N3 | ✅ `tests/api/rb-run.ts:190-213`: DELETE 403 với token dùng chung → bỏ token, `i--`, `continue` → vòng sau **GET + so chủ sở hữu lại** rồi mới xóa bằng token mới; chỉ làm lại 1 lần (`retried`). Chạy thử RB-102 `-g "TC-040|TC-026"` + teardown: 3 expected, DELETE 201 cả 3 booking, sót 0, đăng nhập thất bại 0 |
| D1 (bảng ước lượng) | ⏭ Mở, chuyển sang executor: cập nhật bảng "Ước lượng số request" trong `test-data.md` từ lần chạy chính thức có `--include-full` (đo được cả 2 cột) |

## Orchestrator tự kiểm
Lượt 2 chỉ còn 🟡 / ❓, nên theo quy tắc 2026-11-27 orchestrator tự kiểm, không chạy lượt 3.

| # | Kiểm thế nào | Kết quả |
|---|---|---|
| N1 | Đọc lại `run-tests.mjs:30-37`, `executor.md`, `qa-orchestrator.md:124` sau khi sửa | ✅ |
| N2 | `grep` lại 4 chỗ "BUG-41 → BUG-59" và O-02, TC-023 bước 4 trong CSV | ✅ |
| N3 | Đọc lại `rb-run.ts:186-220`; chạy thử RB-102 `-g "TC-040|TC-026"` (kết quả ra thư mục nháp, không `EVIDENCE`) | ✅ 3 expected, sót 0 |
| ❓3 | `softSink` sót sang test sau: rủi ro rất thấp, reviewer không bắt buộc sửa | Giữ nguyên |
| Chung | `npm run typecheck` sạch; không file lạ trong repo | ✅ |

Còn mở: D1 (bảng ước lượng), làm ở bước executor.
