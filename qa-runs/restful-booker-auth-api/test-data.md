# Test Data Catalog: RB-101 Xác thực và kiểm tra hệ thống (restful-booker-auth-api)

> Feature API, không có màn hình. Base URL: `https://restful-booker.herokuapp.com` (HTTPS). Riêng TC-030 gọi `http://restful-booker.herokuapp.com` (HTTP thường) và chỉ gửi tài khoản **sai** (TD-24).
> **Mật khẩu quản trị không ghi trong test case, tài liệu, code**: đọc từ biến môi trường `RB_ADMIN_PASSWORD` (mặc định là giá trị công khai trong tài liệu API, xem `requirement/apidoc.txt`), giống `SAUCE_PASSWORD` của SauceDemo. Không ghi token thật, chuỗi `Basic`, URL có mật khẩu vào log, annotation, attachment hay tài liệu (chỉ ghi độ dài / định dạng).
> Trong code: tài khoản thêm vào `tests/data/users.ts` (nhóm Restful Booker, **dùng chung với RB-102**), thông báo thêm vào `tests/data/messages.ts` (nhóm `MSG_RB_AUTH`), mã từ chối token sai (`403`) đọc từ dữ liệu dùng chung với RB-102 (TD-25), không viết số cứng.
> Mọi request chạy **tuần tự** (`workers: 1` cho project API), **không** `retries` (chiến lược reset, TD-26).
> `Content-Type` phản hồi so theo **media type** (`application/json`, `text/plain`), không so cả chuỗi `; charset=utf-8`.
> test-impl kiểm lại trên API thật ngày 2026-11-26 (16 request, 1 lần đăng nhập sai, booking `QA-RB101-TI` đã xóa, GET sau xóa `404`): payload TD-18 → TD-20 được lưu và trả về đúng 7 giá trị (kể cả `depositpaid: false` boolean ở `PUT`); token bị đổi ký tự cuối và `abc123` bị từ chối `403` `Forbidden` (`PUT`, `PATCH`, `DELETE`), booking không đổi; Cookie nhiều giá trị `PATCH` `200`; `DELETE` `201` `Created`, `GET` sau đó `404` `Not Found`; dấu hiệu (b) của TD-26 hiện trả `405`; khoảng trắng **đầu mật khẩu** (chưa thử lúc phân tích) → `200` `{"reason":"Bad credentials"}` (BUG-37, như các biến thể khác); `HEAD /ping` `201` body rỗng; HTTPS không có `Strict-Transport-Security`; phản hồi token chỉ có trường `token`, không có `Cache-Control`.

| ID | Tên | Dữ liệu | Dùng cho |
|---|---|---|---|
| TD-01 | Tài khoản quản trị | Tên: biến môi trường `RB_ADMIN_USERNAME` (mặc định `admin`, giá trị công khai của tài liệu); mật khẩu: `RB_ADMIN_PASSWORD` (mặc định: giá trị công khai trong tài liệu, **không ghi ở đây**). Body JSON chuẩn: `{"username":"<TD-01 tên>","password":"<TD-01 mật khẩu>"}`, header `Content-Type: application/json` | Mọi TC trừ TC-025 → TC-028, TC-030 |
| TD-02 | Mật khẩu sai | `qa-rb101-wrong-pass` (không gần mật khẩu thật, **không** dò mật khẩu) | TC-004, TC-005 |
| TD-03 | Tên đăng nhập sai / không tồn tại | (1) `<TD-01 tên>x` (tên đúng thêm `x`); (2) `qa-rb101-no-such-user` | TC-005, TC-030 |
| TD-04 | Sai hoa thường | (1) tên viết hoa chữ đầu (`<TD-01 tên>` với ký tự đầu `toUpperCase()`, mặc định `Admin`) + mật khẩu đúng; (2) tên đúng + mật khẩu `toUpperCase()` toàn bộ. **Chốt dữ liệu**: nếu biến thể viết hoa trùng giá trị gốc (không có chữ cái thường) thì test báo lỗi dữ liệu, không gửi request | TC-006 |
| TD-05 | Khoảng trắng 4 vị trí | (1) `" " + tên`; (2) `tên + " "`; (3) `" " + mật khẩu`; (4) `mật khẩu + " "` (phần còn lại đúng). Mật khẩu không cắt khoảng trắng, tên theo hiện trạng (knowledge-base) | TC-007 |
| TD-06 | Thiếu trường | (1) `{"username":"<tên>"}`; (2) `{"password":"<mật khẩu>"}`; (3) `{}`; (4) body rỗng (0 byte) kèm `Content-Type: application/json` | TC-008 |
| TD-07 | Rỗng / null (coi như thiếu trường) | (1) `{"username":"","password":"<mật khẩu>"}` → 400; (2) `{"username":"<tên>","password":""}` → 400; (3) `{"username":"<tên>","password":null}` → 400. Rỗng = thiếu theo knowledge-base, cùng cách hiểu với RB-102 Q1 (c) (review-test-impl C1, orchestrator chốt, báo người dùng ở HITL #2) | TC-009 |
| TD-08 | Sai kiểu, thử vượt xác thực | (1) `{"username":["<tên>"],"password":"<mật khẩu>"}` → 400; (2) `{"username":"<tên>","password":["<mật khẩu>"]}` → 400; (3) `{"username":"<tên>","password":{"$ne":""}}` → 400; (4) body là mảng `[{"username":"<tên>","password":"<mật khẩu>"}]` → 400; (5) `{"username":"<tên>' OR '1'='1","password":"x' OR '1'='1"}` → 401 | TC-010 |
| TD-09 | Chuỗi rất dài | `username` = `'a'.repeat(10000)` + mật khẩu đúng (knowledge-base: không có giới hạn độ dài thì thử chuỗi rất dài) | TC-011 |
| TD-10 | Body quá lớn | `{"username":"<tên>","password":"<mật khẩu>","pad":"<'a'.repeat(204800)>"}` (~200 KB). Chỉ gửi 1 lần (không tải nặng API; phản hồi ~1,3 giây) | TC-012 |
| TD-11 | Body không phân tích được (`Content-Type: application/json`) | (1) JSON hỏng: `{"username": "<tên>", ` (cắt cụt); (2) body XML `<auth><username><tên></username><password><mật khẩu></password></auth>` | TC-013 |
| TD-12 | Định dạng không hỗ trợ, tài khoản **đúng** (3 đại diện, HITL #1 Q12) | (1) `Content-Type: text/xml`, body `<auth><username><tên></username><password><mật khẩu></password></auth>`; (2) `multipart/form-data` với 2 trường `username`, `password`; (3) **không có** header `Content-Type`, body là chuỗi JSON TD-01. `application/xml`, `text/plain` cho cùng kết quả (O-13), không viết TC (tốn thêm lần thất bại). Lưu ý script-gen: `request.post` với `data` là chuỗi tự thêm `Content-Type` (`application/octet-stream`); biến thể (3) phải kiểm header thật sự gửi đi (vd gửi bằng `node:https`), không gửi được thì đổi sang `application/octet-stream` và ghi annotation | TC-014 |
| TD-13 | URL-encoded (chấp nhận, Q4) | Header `Content-Type: application/x-www-form-urlencoded`, body `username=<tên>&password=<mật khẩu>` (giá trị được URL-encode, dùng tùy chọn `form`) | TC-015 |
| TD-14 | Tài khoản trên query string | `POST /auth?username=<tên>&password=<mật khẩu>` (URL-encode), **không body**, không `Content-Type`. URL chứa mật khẩu thật (review-test-impl B1): gửi bằng `fetch` của Node **ngoài** `APIRequestContext` (không sinh bước trong báo cáo, không vào trace, không vào `run-results/*.json`); annotation chỉ ghi mã, `Content-Type`, body; lỗi mạng bắt lại, ghi thông báo **không kèm URL**. **Trước khi commit** (executor / script-gen): quét `run-results/` và `evidence/` tìm giá trị của `RB_ADMIN_PASSWORD` và chuỗi `password=` (chỉ in tên file, vd `grep -rlF -- "$RB_ADMIN_PASSWORD" run-results evidence`, không in dòng chứa mật khẩu); có thì xóa file / dòng đó rồi quét lại | TC-016 |
| TD-15 | Biến thể hợp lệ JSON (Q10) | (1) thêm trường thừa: `{"username":"<tên>","password":"<mật khẩu>","role":"admin","token":"abc123"}`; (2) đảo thứ tự: `{"password":"<mật khẩu>","username":"<tên>"}`; (3) JSON nhiều dòng, thụt lề 2 khoảng trắng (`JSON.stringify(body, null, 2)`); (4) `Content-Type: application/json; charset=utf-8`; (5) `Content-Type: APPLICATION/JSON` | TC-003 |
| TD-16 | Sai phương thức | `/auth`: `GET`, `PUT` (body TD-01), `PATCH` (body TD-01), `DELETE`, `HEAD`, `GET /auth/`. `/ping`: `POST`, `PUT`, `PATCH`, `DELETE` (không body). Không phải `POST /auth` nên **không** tính vào ngân sách | TC-018, TC-028 |
| TD-17 | Tên lần chạy | `firstname` = `QA-RB101-<run>`, `<run>` = thời điểm bắt đầu lần chạy theo UTC dạng `yyyyMMdd-HHmmss` (vd `QA-RB101-20261126-134000`); `lastname` = mã TC (vd `TC-019`). Mọi booking của một lần chạy tìm được bằng `GET /booking?firstname=QA-RB101-<run>`. `PUT` / `PATCH` **không** đổi `firstname`, `lastname` (để bước dọn kiểm được chủ sở hữu). test-impl kiểm tay dùng `QA-RB101-TI` | TC-015, TC-019 → TC-024, TC-029 |
| TD-18 | Booking tạo cho AC-3 | `POST /booking`, header `Content-Type: application/json`, `Accept: application/json`, body `{"firstname":"QA-RB101-<run>","lastname":"<mã TC>","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}`. Expected `200`, body `{"bookingid":<số nguyên dương>,"booking":{…đúng 7 giá trị đã gửi…}}`. Chọn để **không** dính bug RB-102 (bài học L16): giá nguyên (BUG-43), boolean JSON (BUG-42), ngày có thật và `checkout` sau `checkin` (BUG-44, BUG-56), không khoảng trắng đầu cuối (BUG-59), `Accept: application/json` (BUG-49) | TC-015, TC-019 → TC-024, TC-029 |
| TD-19 | Body `PUT` (thay toàn bộ) | `{"firstname":"QA-RB101-<run>","lastname":"<mã TC>","totalprice":202,"depositpaid":false,"bookingdates":{"checkin":"2031-06-10","checkout":"2031-06-12"},"additionalneeds":"Late checkout"}`. Gửi đủ `additionalneeds` (tránh BUG-53) | TC-019, TC-022 |
| TD-20 | Body `PATCH` | `{"totalprice":303,"additionalneeds":"Dinner"}`: 2 trường cấp 1, không `PATCH` `bookingdates` (tránh BUG-45). Sau `PATCH`: 7 giá trị = TD-18 với `totalprice` 303, `additionalneeds` `Dinner`, 5 giá trị còn lại không đổi | TC-015, TC-020, TC-022 → TC-024, TC-029 |
| TD-21 | Token giả (đối chứng âm AC-3, Q7) | (1) `abc123` (ví dụ trong tài liệu); (2) token **vừa cấp** đổi ký tự cuối: cuối là `a` thì thay bằng `b`, khác thì thay bằng `a` (luôn khác token gốc). Header `Cookie: token=<token giả>` | TC-022 |
| TD-22 | Cookie nhiều giá trị | `Cookie: a=b; token=<token vừa cấp>; c=d` | TC-024 |
| TD-23 | Biến thể của `/ping` | `GET /ping/` (dấu `/` cuối), `GET /PING`, `GET /ping?x=1`, `GET /ping` kèm `Accept: application/json`; `HEAD /ping` | TC-026, TC-027 |
| TD-24 | HTTP thường (chỉ tài khoản sai) | `GET http://restful-booker.herokuapp.com/ping`; `POST http://restful-booker.herokuapp.com/auth`, `Content-Type: application/json`, body `{"username":"qa-rb101-no-such-user","password":"qa-rb101-wrong-pass"}` (TD-03 (2) + TD-02: **không** gửi tên hay mật khẩu thật dạng rõ). Không theo chuyển hướng (`maxRedirects: 0`) | TC-030 |
| TD-25 | Mã từ chối khi token sai | `403` (HITL #1, RB-102 Q4: hợp đồng chung RB-101 / RB-102; `401` là cải tiến). Đọc từ dữ liệu dùng chung với RB-102, không viết số cứng trong test | TC-022 |
| TD-26 | Chiến lược reset và dọn dẹp (chung RB-101 / RB-102, HITL #1 Q6) | Mục "TD-26" bên dưới | TC-015, TC-019 → TC-024, TC-029 |
| TD-27 | Ngân sách đăng nhập thất bại (HITL #1 Q12) | Mục "TD-27" bên dưới: **≤ 30** lần mỗi lần chạy và **≤ 30 lần mỗi ngày UTC** (bộ đếm theo ngày), nhóm `@bad-login` chạy **một lần mỗi buổi** | TC-004 → TC-014, TC-016, TC-030 |
| TD-28 | Thứ tự kiểm cho TC có bug đã biết (review-test-impl D1) | Mục "Ghi chú cho script-gen" bên dưới: soft (a)–(d) mọi biến thể → chặn cứng `test.info().errors` → `test.fail()` → soft phần dự kiến FAIL | TC-004 → TC-014, TC-016, TC-030 |

## TD-26: chiến lược reset và dọn dẹp
API tự reset dữ liệu và xóa mọi token khoảng 10 phút một lần, đúng phút x1 UTC (O-21). Áp dụng cho mọi TC có booking:
1. **Không** `retries` của Playwright cho spec này; **không** lấy token trong `beforeAll`. Mỗi test tạo booking của mình trước, rồi lấy token **mới** ngay trước bước dùng token (khoảng "cấp token → dùng" vài giây), không dùng token của test khác.
2. Chỉ khi gặp `403` / `404` **không mong đợi** (bước dùng token vừa cấp bị `403`, hoặc `GET` booking của chính test trả `404` khi test **chưa** xóa nó): kiểm **đủ 3 dấu hiệu**. Sau `DELETE` thành công (`201`), `404` ở `GET` là **oracle** (TC-021 bước 4, TC-029 bước 7), **không** kích hoạt kiểm reset (review-test-impl D3). Ba dấu hiệu:
   - (a) `GET /booking/<id>` của chính test trả `404`;
   - (b) một token **mới** (`POST /auth`, TD-01) dùng cho `PATCH /booking/999999999` (body `{"totalprice":1}`) **không bị `403`** (hiện trạng `405` là BUG-52 của RB-102; không assert `405`, chỉ assert "không phải `403`");
   - (c) thời điểm lỗi nằm trong cửa sổ **x0:50 → x1:30 UTC** (vd 13:00:50 → 13:01:30).
3. Đủ 3 dấu hiệu → làm lại phần chuẩn bị (booking mới + token mới) **một lần** ngay trong test, gắn annotation `env-reset`. Thiếu một dấu hiệu, hoặc gặp reset **lần 2** trong cùng test → test **fail** như lỗi thật. Executor báo số test có `env-reset` (không tính là "đạt sạch").
4. **Dọn dẹp** (`finally` / `afterEach`, chạy cả khi test fail): `GET /booking/<id>`; **chỉ** `DELETE` (Cookie token mới) khi `firstname` = `QA-RB101-<run>` **và** `lastname` = mã TC, **so khớp chính xác, không so tiền tố** (sau reset, id cũ có thể thuộc người khác: bài học L17; RB-102 dùng `QA-RB102-<RUN>` cũng so khớp chính xác, nên bước dọn của 2 feature không xóa booking của nhau). Bước dọn chấp nhận `403` / `404` (ghi annotation), không làm test fail vì bước dọn.
5. Heroku `503` / ứng dụng đang ngủ (lần gọi đầu ~1 giây, lỗi `H1x`) là **lỗi môi trường**, không phải bug; thời gian chờ request đủ cho lần gọi đầu.

## TD-27: ngân sách đăng nhập thất bại (≤ 30 lần `POST /auth` không cấp token mỗi lần chạy, tối đa 30 lần mỗi ngày UTC)
Gọi **tuần tự**, không retry. Đăng nhập **đúng** (đối chứng, cấp token, dấu hiệu (b) của TD-26) không tính.

**Một lần mỗi buổi** (review-test-impl B2, orchestrator chốt): một vòng pipeline có nhiều lần chạy (`test:run`, `test:evidence`, `test:stability`, `repro`, reviewer chạy lại), nên nhóm `@bad-login` chỉ chạy **một lần mỗi buổi**, bằng `test:run`. `test:evidence`, `test:stability` và mọi lần chạy lại **loại** nhóm này bằng `--grep-invert @bad-login`, trừ khi người dùng yêu cầu; `test:run` của feature `-api` tự ghi evidence API và dựng lại mục lục, nên lần chạy đó vừa cho kết quả vừa làm mới evidence của nhóm này (BUG-37 → BUG-40). **Bộ đếm theo ngày UTC** nằm ngoài `test-results/` (file tạm hệ điều hành `rb-bad-login-<yyyymmdd>.json`): quá 30 lần/ngày thì client từ chối gửi; chỉ khi người dùng đồng ý mở lại thì đặt `RB_BAD_LOGIN_RESET=1`. Cần chạy lại thì chỉ `-g` đúng TC nghi ngờ (tính vào ngân sách của buổi). `repro` của BUG-37 chỉ gửi 1 request sai.

| TC | Viewpoint | Số lần thất bại | Lớp chặn |
|---|---|---|---|
| TC-004 | TVP-004 | 1 | kiểm tài khoản |
| TC-005 | TVP-005 | 2 | kiểm tài khoản |
| TC-006 | TVP-006 | 2 | kiểm tài khoản |
| TC-007 | TVP-007 | 4 | kiểm tài khoản |
| TC-008 | TVP-008 | 4 | kiểm tài khoản |
| TC-009 | TVP-009 | 3 | kiểm tài khoản |
| TC-010 | TVP-010 | 5 | kiểm tài khoản |
| TC-011 | TVP-011 | 1 | kiểm tài khoản |
| TC-014 | TVP-014 | 3 | đọc body (BUG-39) |
| TC-016 | TVP-016 | 1 | kiểm tài khoản |
| TC-030 | TVP-036 | 1 | kiểm tài khoản (qua HTTP; tính kể cả khi bị chuyển hướng) |
| TC-012 | TVP-012 | 1 | đọc body (413) |
| TC-013 | TVP-013 | 2 | đọc body (400) |
| **Tổng** | | **30** | 27 qua bước kiểm tài khoản / định dạng + 3 bị lớp đọc body chặn (khớp Q12) |

Không còn chỗ trống trong ngân sách: thêm biến thể sai tài khoản phải bỏ biến thể khác hoặc hỏi người duyệt. Sau review-test-impl: TC-009 đổi expected `401` → `400` (C1), số lần không đổi (vẫn 30).

## Ghi chú cho script-gen (TD-28: thứ tự kiểm khi có bug đã biết)
`test.fail()` đánh dấu **cả test** là "phải fail", gọi lúc nào cũng vậy: lỗi `expect.soft` ghi **trước** `test.fail()` vẫn bị tính là "fail như mong đợi". Vì vậy các bước đang đạt (không cấp token, body MSG-01, JSON, không 5xx, không lộ stack trace) phải qua một **chặn cứng** trước khi gọi `test.fail()` (review-test-impl D1, bài học L4). Thứ tự bắt buộc cho TC-004 → TC-014, TC-016 (TC-030 dùng cùng mẫu, xem notes):

1. Gửi **mọi** biến thể, lưu phản hồi (kèm bước 0 đối chứng, `expect` cứng).
2. `expect.soft` các bước đang đạt ((a)–(d), hoặc (a)–(c) / (a), (b) như ghi trong TC) của **mọi** biến thể, để thấy đủ lỗi.
3. Chặn cứng: `expect(test.info().errors, '(a)–(d) phải đạt trước test.fail').toHaveLength(0)`.
4. `test.fail()`.
5. `expect.soft` phần dự kiến FAIL ((e), hoặc (d) / (c)–(e)) của mọi biến thể.

Không được gọi `test.fail()` trong vòng lặp biến thể. Reviewer bước script-gen kiểm bằng cách cố ý làm hỏng một bước (a): test phải **đỏ** (fail thật), không được thành "fail như mong đợi".

**Body lỗi không lộ stack trace** (TC-012 → TC-014, IMP-10): body không có dòng bắt đầu bằng `at ` và không có đường dẫn file (`/app/…`, `.js:<số>`); kiểm ở bước 2 (đang đạt).

## Nhóm `test.describe` (cột `screen`)
| `screen` | `test.describe` | TC | Tag endpoint |
|---|---|---|---|
| `POST /auth` | `POST /auth: …` | TC-001 → TC-024 (TC-019 → TC-024 gọi thêm `/booking` của RB-102 chỉ để kiểm token dùng được) | `@auth` |
| `GET /ping` | `GET /ping: …` | TC-025 → TC-028 | `@ping` |
| `Cả 2` | `Chung: …` | TC-029, TC-030 | `@auth` `@ping` |

Tag thêm: `@bad-login` (TD-27), `@booking` (tạo booking, TD-26), `@smoke`, `@security`, `@BUG-xx`.

## Thông báo nguyên văn
Lấy nguyên văn từ `known-issues.md` / `spec-review.md` (hiện hành, knowledge-base), test-impl kiểm lại 2026-11-26.

| ID | Nội dung |
|---|---|
| MSG-01 | `{"reason":"Bad credentials"}` (`POST /auth` không cấp token; JSON, 28 byte). HITL #1 Q2: **giữ nguyên văn** ở cả `401` và `400`. So bằng JSON: object có đúng 1 trường `reason` = `Bad credentials` |
| MSG-02 | `Created` (`text/plain`): body của `GET /ping` (`201`) và `DELETE /booking/:id` (`201`, hợp đồng tài liệu) |
| MSG-03 | `Forbidden` (`text/plain`): body `403` khi token sai (RB-102 Q4) |
| MSG-04 | `Not Found` (`text/plain`): body `404` của `GET /booking/:id` đã xóa |

**Chỉ để đối chiếu hiện trạng, KHÔNG dùng làm expected**: `Bad Request` (`400` `text/plain`, BUG-38), `Payload Too Large` (`413` `text/plain`, BUG-38), `Method Not Allowed` (`405` của `PATCH /booking/999999999`, BUG-52 RB-102), `Not Found` của sai phương thức trên `/auth`, `/ping` (`404`, IMP-01). Body JSON của lỗi `400` / `413` / `415` chưa chốt nguyên văn (Q3 chỉ ví dụ `{"reason":"Bad Request"}`): test chỉ kiểm `Content-Type` JSON và body đọc được thành object JSON, nội dung ghi annotation.
