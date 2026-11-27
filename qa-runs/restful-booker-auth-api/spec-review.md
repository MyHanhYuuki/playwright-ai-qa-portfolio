# Spec Review: RB-101 Xác thực (Auth) và kiểm tra hệ thống (Ping) của Restful Booker API (restful-booker-auth-api)

## Tóm tắt
Hệ thống / nhân viên quản trị gửi tài khoản quản trị tới `POST /auth` để lấy **token**, rồi dùng token qua header `Cookie: token=<token>` cho các thao tác cần quyền của RB-102 (`PUT`, `PATCH`, `DELETE /booking/:id`). `GET /ping` cho biết API có đang hoạt động. Feature **API, không có màn hình**: cột `screen` của `viewpoint.csv` ghi **endpoint** (`POST /auth`, `GET /ping`, `Cả 2`).

Tên endpoint dùng trong mọi tài liệu của feature:
| Tên | Endpoint | Tên trong tài liệu API |
|---|---|---|
| `POST /auth` | `https://restful-booker.herokuapp.com/auth` | Auth - CreateToken |
| `GET /ping` | `https://restful-booker.herokuapp.com/ping` | Ping - HealthCheck |
| (booking) | `/booking`, `/booking/:id` | Endpoint của **RB-102**, chỉ dùng để kiểm token **dùng được** (AC-3). **Không** dùng làm giá trị cột `screen` (RTM sẽ đếm nhầm thành endpoint của feature, bài học SD-103 review C1): thao tác booking ghi trong phần mô tả viewpoint |

## Acceptance Criteria
| AC-ID | Mô tả | Testable? | Ghi chú |
|-------|-------|-----------|---------|
| AC-1 | `POST /auth` JSON đúng tài khoản quản trị → `200`, body `{"token": "<chuỗi không rỗng>"}` | ✅ | Đạt (O-04): token là chuỗi không rỗng (hiện trạng 15 ký tự hex, chỉ ghi annotation, không assert: review B5), mỗi lần một token mới (O-05) |
| AC-2 | Sai `username` / `password` hoặc thiếu trường → **không** cấp token | ⚠️ | Đạt về nội dung (không có `token`, O-08 → O-10), nhưng mã HTTP là `200`; HITL #1 chốt `401` / `400` (Q2) → BUG-37. Định dạng khác JSON với tài khoản đúng cũng bị báo `Bad credentials` (HITL #1 chốt `415`, Q4 → BUG-39: bug riêng, lỗi ở lớp đọc body). Thông báo: nguyên văn hiện hành (knowledge-base) |
| AC-3 | Token vừa cấp dùng được cho `PUT`, `PATCH`, `DELETE /booking/:id` qua `Cookie: token=<token>` | ✅ | Đạt trên booking tự tạo (O-18). Đối chứng âm TVP-028 (token giả bị từ chối `403`, RB-102 Q4). Ranh giới với RB-102 AC-7: Q7. Thời hạn token, chiến lược reset: Q6 (đã chốt) |
| AC-4 | `GET /ping` → mã thành công kèm thân `Created` | ⚠️ | Đạt: `201` `Created` (O-01). `201` là **hợp đồng tài liệu** (dòng `Default HTTP 201 response` + ví dụ `201 Created`); tiêu đề `Success 200` là lỗi trình bày tài liệu (IMP-06, Q1). Quy tắc chung với RB-102 Q6 |
| AC-5 | `POST /auth` trả JSON (`Content-Type: application/json`) | ⚠️ | Đạt cho phản hồi thành công và sai tài khoản; phản hồi lỗi `400` / `413` là `text/plain`; HITL #1 chốt mọi phản hồi là JSON (Q3) → BUG-38 |

## Business Rules (rút ra từ requirement và câu trả lời HITL #1, 2026-11-26)
- BR-1: `POST /auth` với body JSON đúng tài khoản quản trị trả `200`, `Content-Type: application/json`, body có `token` là chuỗi không rỗng (AC-1, AC-5). Tài khoản đọc từ biến môi trường: tên đăng nhập và **mật khẩu quản trị từ biến môi trường (mặc định: giá trị công khai trong tài liệu)**; không ghi mật khẩu trong TC.
- BR-2: Sai tên đăng nhập, sai mật khẩu, thiếu trường → body **không** có `token` (AC-2). Mã HTTP: **`401`** khi sai tài khoản (chuỗi sai), **`400`** khi thiếu trường / sai kiểu (Q2; hiện trạng `200` là BUG-37). Thông báo: nguyên văn hiện hành `{"reason":"Bad credentials"}` (knowledge-base), **cùng một thông báo** cho mọi kiểu sai, không lộ tài khoản có tồn tại hay không (knowledge-base).
- BR-3: Mật khẩu **phân biệt hoa thường, không cắt khoảng trắng**; tên đăng nhập theo hiện trạng (hiện cũng phân biệt hoa thường, không cắt) (knowledge-base SD-101).
- BR-4: Token vừa cấp dùng được cho `PUT`, `PATCH`, `DELETE /booking/:id` qua `Cookie: token=<token>` (AC-3). Token không do hệ thống cấp (tự tạo, bị sửa) phải bị từ chối (knowledge-base: phiên giả mạo là bug bảo mật); mã từ chối **`403`** (RB-102 Q4: `403` là hợp đồng, `401` là cải tiến; một quyết định cho cả 2 feature). Token có hiệu lực trong cùng chu kỳ reset ~10 phút; token cũ vẫn dùng được khi đã cấp token mới là đúng; chiến lược reset 3 dấu hiệu (Q6, `known-issues.md`). Phân chia với RB-102 theo Q7.
- BR-5: `GET /ping` trả **`201`** kèm thân `Created` (AC-4; hợp đồng tài liệu, quyết định chung với RB-102 Q6; Q1 là dòng tham chiếu). Tiêu đề `Success 200` của tài liệu là lỗi trình bày (IMP-06).
- BR-6: **Mọi** phản hồi của `POST /auth` là JSON (AC-5), kể cả lỗi `400` / `413` (Q3; hiện trạng `text/plain` là BUG-38).
- BR-7: Body chính thức là JSON; URL-encoded được chấp nhận; định dạng không hỗ trợ trả **`415`** JSON, không báo `Bad credentials` (Q4; hiện trạng là BUG-39). Thông tin đăng nhập trên query string bị từ chối. Sai phương thức: tối thiểu **4xx**, không `5xx` (Q8; `405` là IMP-01). Trường thừa bị bỏ qua (Q10).
- BR-8 (knowledge-base): không có AC hiệu năng → test chỉ kiểm thành công, ghi số đo; độ dài input không nêu → thử chuỗi rất dài.
- BR-9: API **bắt buộc HTTPS**: `http://` chuyển hướng `308` hoặc bị từ chối, phản hồi HTTPS có HSTS (Q11; hiện trạng là BUG-40).
- BR-10: Không có yêu cầu giới hạn thử sai (Q5): không phải bug, ghi **IMP-05** (Medium, rủi ro bảo mật), không kiểm tự động. Header bảo mật còn lại, `Cache-Control`: cải tiến IMP-02 (Q9).
- BR-11: Ngân sách test: **≤ 30 lần đăng nhập thất bại / lần chạy**, tuần tự, nhóm sai tài khoản không chạy lặp, không retry (Q12).

**Hành vi hiện tại lúc phân tích** (nay đã chốt ở HITL #1, xem BR ở trên): sai / thiếu thông tin trả `200` + `Bad credentials` (Q2); ping trả `201` (khớp tài liệu, Q1); `http://` được phục vụ (Q11); lỗi body trả `text/plain` (Q3); URL-encoded được cấp token, XML không (Q4); token sống tới khi API reset ở phút x1 UTC (Q6).

## Quan sát thực tế (khám phá API ngày 2026-11-26)
Cách khám phá: script Node nhỏ dùng `fetch` (không theo chuyển hướng), ghi đủ **mã, header, body** từng lần gọi; script để ngoài repo, không commit. Quan sát lạ đã chạy lại **ít nhất 2 lần**, kết quả giống nhau (ghi "2/2"). Header chung của mọi phản hồi (O-17) không nhắc lại ở từng dòng.

**An toàn khi khám phá** (API công khai dùng chung): chỉ tạo **3 booking** riêng (firstname `QA-RB101`), sửa / xóa đúng 3 booking đó và đã xóa hết (GET sau xóa `404`); không đụng booking của người khác (kiểm token bằng booking không tồn tại, O-22). **15 lần** đăng nhập sai tài khoản (tính cả lần gửi trên query string và 2 lần qua HTTP thường ở O-24) + 7 lần thiếu trường / sai kiểu; không load test; không gửi mật khẩu thật qua HTTP thường.

| # | Endpoint | Thao tác | Kết quả quan sát | Ghi chú |
|---|---|---|---|---|
| O-01 | GET /ping | `GET /ping` (lặp > 10 lần trong các lượt khám phá) | `201` (không có reason phrase), `Content-Type: text/plain; charset=utf-8`, `Content-Length: 7`, body `Created`. Lần gọi đầu mỗi lượt ~1 giây, sau đó ~250–320 ms | ✅ AC-4. Khớp tài liệu: `Default HTTP 201 response` và ví dụ `HTTP/1.1 201 Created`; chỉ tiêu đề `Success 200` lệch (lỗi tài liệu IMP-06, Q1; review A2) |
| O-02 | GET /ping | `HEAD /ping`; `GET /ping/`; `GET /PING`; `GET /ping?x=1`; `GET /ping` với `Accept: application/json` | `HEAD`: `201`, `Content-Length: 7`, body rỗng. Các biến thể còn lại: `201` `Created` `text/plain` (đường dẫn không phân biệt hoa thường, bỏ qua `/` cuối và query; bỏ qua `Accept`) | ✅ |
| O-03 | GET /ping | `POST`, `PUT`, `PATCH`, `DELETE /ping`; `OPTIONS /ping` | 4 phương thức đầu: `404`, `text/plain; charset=utf-8`, body `Not Found` (giống đường dẫn không tồn tại `/nope-…`). `OPTIONS`: `200`, `Allow: GET, HEAD`, body `GET, HEAD` | ⚠️ `404` thay vì `405` (Q8, IMP-01) |
| O-04 | POST /auth | JSON đúng tài khoản, `Content-Type: application/json` | `200`, `Content-Type: application/json; charset=utf-8`, `Content-Length: 27`, body `{"token":"<15 ký tự hex>"}`, **chỉ một trường**. Không có `Set-Cookie`, không có `Cache-Control`. Thời gian ~250–330 ms (lần đầu ~1 giây) | ✅ AC-1, AC-5. Token ~60 bit (IMP-03) |
| O-05 | POST /auth | Gọi 5 lần liên tiếp; rồi dùng token **đầu tiên** sau khi đã cấp thêm > 10 token | 5/5 token khác nhau, cùng định dạng 15 ký tự hex (cả > 15 lần cấp trong các lượt khác cũng không trùng). Token đầu tiên **vẫn dùng được**: `PATCH` booking A `200`, `DELETE` booking B `201`, kiểm bằng booking không tồn tại `405` (O-22) lúc 3,5 phút sau khi cấp. 2/2 | Mỗi lần cấp token mới, token cũ không bị thu hồi (Q6) |
| O-06 | POST /auth | Tài khoản đúng kèm: trường thừa `role`, `token`; đảo thứ tự trường; JSON có xuống dòng / khoảng trắng; `Content-Type: application/json; charset=utf-8`; `Content-Type: APPLICATION/JSON`; `Accept: application/xml` | Tất cả `200` + token mới. Với `Accept: application/xml` phản hồi **vẫn JSON** | ✅ (Q10) |
| O-07 | POST /auth | Khóa trùng: `{"username":"x","username":"<tên đúng>","password":"<đúng>"}` | `200` + token (lấy giá trị **sau cùng**) | Ghi tham khảo (IMP-08) |
| O-08 | POST /auth | Tên đúng, **sai mật khẩu** | `200` (**mã thành công**), `Content-Type: application/json; charset=utf-8`, `Content-Length: 28`, body `{"reason":"Bad credentials"}`, không có `token`. 2/2 | 🔴 AC-2 đạt về nội dung nhưng mã `200` (Q2, BUG-37) |
| O-09 | POST /auth | Sai tài khoản các kiểu: tên viết hoa chữ đầu; mật khẩu viết hoa; khoảng trắng đầu tên; khoảng trắng cuối mật khẩu; tài khoản không tồn tại; tên `""`; mật khẩu `""`; mật khẩu `null`; tên 10 000 ký tự; mật khẩu `{"$ne":""}`; tên `["<tên đúng>"]`; mật khẩu `["<đúng>"]`; body là mảng JSON `[{…đúng…}]` | **Giống hệt O-08** ở mọi trường hợp: `200` `{"reason":"Bad credentials"}`, không token, không `5xx`, thời gian ~250–300 ms. Phân biệt hoa thường cả tên lẫn mật khẩu, không cắt khoảng trắng; kiểu mảng / object không vượt được xác thực; cùng một thông báo, không lộ tài khoản tồn tại | ✅ AC-2 (nội dung), 🔴 mã `200` (BUG-37) |
| O-10 | POST /auth | Thiếu `password`; thiếu `username`; body `{}`; body rỗng với `Content-Type: application/json` | `200` `{"reason":"Bad credentials"}` (như O-08) | ✅ AC-2 (nội dung), 🔴 mã `200` (Q2, BUG-37) |
| O-11 | POST /auth | 20 lần đăng nhập thất bại liên tiếp trong ~10 giây (O-08 → O-10), rồi đăng nhập đúng | Không có `429`, không khóa, không chậm dần (~250–300 ms mỗi lần); đăng nhập đúng ngay sau đó vẫn được token (O-12 lượt 1) | ⚠️ Không chống dò mật khẩu: không có yêu cầu (Q5) → cải tiến IMP-05 (Medium, rủi ro bảo mật). Không thử thêm để tránh dò trên API dùng chung |
| O-12 | POST /auth | Tài khoản đúng, `Content-Type: application/x-www-form-urlencoded` | `200` + token, JSON. Token này dùng được: `PATCH` booking C `200`, `DELETE` `201`. 2/2 | Không có trong tài liệu (Q4) |
| O-13 | POST /auth | Tài khoản **đúng** gửi dạng: `text/xml` (`<auth><username>…</username><password>…</password></auth>`); `application/xml`; `multipart/form-data`; không có `Content-Type` (body JSON); `text/plain` (body JSON); tài khoản trên query string `?username=…&password=…`, không body | Tất cả `200` `{"reason":"Bad credentials"}`, không token. 2/2 | 🔴 Thông báo gây hiểu lầm: lỗi định dạng bị báo là sai tài khoản (Q4, BUG-39). Query string bị từ chối là đúng (mã `200`: BUG-37) |
| O-14 | POST /auth | JSON hỏng `{"username": "admin", ` với `Content-Type: application/json`; `Content-Type: application/json` mà body XML | `400`, `Content-Type: text/plain; charset=utf-8`, `Content-Length: 11`, body `Bad Request`. 2/2 | 🔴 Không phải JSON (AC-5, Q3, BUG-38) |
| O-15 | POST /auth | Body JSON ~200 KB (tài khoản đúng kèm trường đệm) | `413`, `text/plain; charset=utf-8`, body `Payload Too Large`, ~1,3 giây. (Tên 10 000 ký tự ở O-09 vẫn được đọc, nên giới hạn nằm giữa ~10 KB và ~200 KB) | 🔴 Không phải JSON (Q3, BUG-38). Chỉ thử 1 lần để không tải nặng API |
| O-16 | POST /auth | `GET`, `PUT`, `PATCH`, `DELETE`, `HEAD /auth`; `GET /auth/`; `OPTIONS /auth` (kèm `Origin`, `Access-Control-Request-Method: POST`) | `GET`/`PUT`/`PATCH`/`DELETE`: `404` `Not Found` `text/plain`; `HEAD`: `404` body rỗng; `GET /auth/`: `404`. `OPTIONS`: `200`, `Allow: POST`, body `POST`, **không** có `Access-Control-Allow-Origin` | ⚠️ `404` thay vì `405` (Q8, IMP-01) |
| O-17 | Cả 2 | Đọc toàn bộ header phản hồi | Mọi phản hồi: `X-Powered-By: Express`, `Server: Heroku`, `Via: 2.0 heroku-router`, `Nel`, `Report-To`, `Reporting-Endpoints`, `Etag`. **Không** có `Strict-Transport-Security`, `Cache-Control` (kể cả phản hồi chứa token); `X-Content-Type-Options: nosniff` chỉ có ở `OPTIONS`; không có header CORS | `Cache-Control` của phản hồi token: TVP-037 (Q9); header khác ngoài phạm vi (TVP-020, IMP-02). HSTS / HTTP thường: O-24 |
| O-18 | POST /auth | Token vừa cấp (`Cookie: token=<token>`) trên booking **tự tạo** A, B, C | `PUT` → `200`, body là booking đã thay (vd `firstname` `QA-RB101-put`, `totalprice` `102`), `application/json`; `PATCH` → `200`, chỉ đổi `firstname`; `DELETE` → `201`, `text/plain`, body `Created`; `GET` sau đó `404` `Not Found`. A và B 2/2, C dùng token URL-encoded | ✅ AC-3 |
| O-19 | POST /auth | Token **sai** trên booking tự tạo: không có token; `token=invalid-qa`; `token=` rỗng; `token=abc123` (ví dụ trong tài liệu); token đúng viết hoa; bớt 1 ký tự cuối; thêm 1 ký tự; `Authorization: Bearer <token đúng>`; `?token=<token đúng>` trên URL; tên cookie `TOKEN=<token đúng>` | `PUT` (A, B), `PATCH` + `DELETE` (C): **tất cả** `403`, `text/plain; charset=utf-8`, body `Forbidden`; `GET` sau đó: booking **không đổi** | ✅ Token tự tạo / bị sửa bị chặn (knowledge-base). `403` là hợp đồng (RB-102 Q4; `401` là cải tiến). Ranh giới với RB-102 AC-7 (Q7): RB-101 chỉ giữ `abc123` + 1 token bị sửa làm đối chứng (TVP-028) |
| O-20 | POST /auth | `Cookie: a=b; token=<token>; c=d`; `Authorization: Basic <base64(tên:mật khẩu)>` | Cả hai `PATCH` `200` (A, B) | ✅. Basic là cách thay thế trong tài liệu, thuộc RB-102 AC-7 |
| O-21 | POST /auth | Dùng lại token cũ sau một thời gian: (1) token đầu tiên (O-05) dùng ở 3,5 phút rồi ở lượt sau; (2) theo dõi nhẹ 16 phút: một token mới, mỗi phút 1 lần kiểm token (O-22) + đếm `GET /booking` | (1) Lúc 3,5 phút: `405` (còn hợp lệ); lượt sau: `PUT` booking C `403`, đồng thời id booking mới quay về `53` (trước đó `3926`, `3990`). (2) Token mới kiểm 6 lần liên tiếp đều `405`; phút 1 `405`, **phút 2 `403`** và từ đó luôn `403`; cùng lúc số booking tụt **3311 → 16** (11:01 UTC) rồi lại **3297 → 278** (11:11 UTC). API **tự reset dữ liệu và xóa mọi token khoảng 10 phút một lần, đúng phút x1 của đồng hồ UTC** (3 lần reset quan sát được: ~10:51, ~11:01, ~11:11 UTC; reviewer thấy thêm lần 12:11, trong khoảng 12:10:19 → 12:11:20, và booking tự tạo **cũng bị xóa**: GET `404`). Giữa 2 lần reset, người dùng khác tạo ~360 booking / phút | Token sống **tối đa ~10 phút, có thể chỉ vài giây** nếu cấp ngay trước lúc reset. Không có `expires_in` (Q6, IMP-04). Rủi ro test chập chờn và bước dọn dẹp gặp `403` / `404`: chiến lược reset 3 dấu hiệu trong `known-issues.md`, lưu ý (Q6) |
| O-22 | POST /auth | Kiểm token mà không đụng booking của người khác: `PATCH /booking/999999999` (GET trước và sau đều `404`) | Token hợp lệ → `405` `Method Not Allowed`; token sai → `403` `Forbidden`. API kiểm quyền **trước** khi tìm booking | Cách kiểm token hợp lệ cho test-impl (`known-issues.md`, lưu ý) |
| O-23 | POST /auth | `DELETE` lần 2 trên booking đã xóa, cùng token | `405` `Method Not Allowed` `text/plain` | Thuộc RB-102, ghi tham khảo |
| O-24 | Cả 2 | HTTP thường (thêm sau review A1): `GET http://…/ping`; `POST http://…/auth` với tài khoản **sai** (không gửi mật khẩu thật dạng rõ); đọc `Strict-Transport-Security` của phản hồi HTTPS | `GET`: `201` `Created` `text/plain`; `POST`: `200` `{"reason":"Bad credentials"}` JSON. Không chuyển hướng (`301` / `308`), không `Location`; HTTPS cũng không có HSTS. 2/2. Reviewer thử `POST http://…/auth` với tài khoản **đúng**: `200` + token (1/1) | 🔴 Tài khoản và token có thể đi dạng rõ (Q11, BUG-40) |

## Ma trận endpoint × lớp input
✅ đúng như AC / quyết định HITL #1 · 🔴 lệch (bug đã xác nhận ở HITL #1) · ⚠️ chạy được nhưng nên cải tiến · – không áp dụng. Bản API của ma trận "tài khoản × trang × thao tác": **mọi endpoint × mọi phương thức**, **mọi lớp input của `POST /auth`**, **mọi lớp token × mọi thao tác cần quyền** (bài học L10, L13: thử hết, không chọn theo triệu chứng).

**Bảng 1: endpoint × phương thức HTTP × giao thức** (O-01 → O-03, O-16, O-24)

| Endpoint | GET | HEAD | POST | PUT | PATCH | DELETE | OPTIONS |
|---|---|---|---|---|---|---|---|
| `/ping` | ✅ `201` `Created` | ✅ `201`, body rỗng | ⚠️ `404` | ⚠️ `404` | ⚠️ `404` | ⚠️ `404` | ✅ `200` `Allow: GET, HEAD` |
| `/auth` | ⚠️ `404` | ⚠️ `404` | ✅ xem bảng 2 | ⚠️ `404` | ⚠️ `404` | ⚠️ `404` | ✅ `200` `Allow: POST` |
| `http://…/ping` | 🔴 `201` `Created` (không chuyển hướng) | – | – | – | – | – | – |
| `http://…/auth` | – | – | 🔴 được xử lý như HTTPS (tài khoản sai: `200` `Bad credentials`; reviewer: tài khoản đúng → token) | – | – | – | – |

Trên HTTP chỉ thử `GET /ping` và `POST /auth` (đủ chứng minh API phục vụ trên HTTP, không gửi thêm request; BUG-40, Q11).

**Bảng 2: `POST /auth` × lớp input** (mọi phản hồi không ghi khác là `Content-Type: application/json; charset=utf-8`)

| Nhóm | Lớp input | Mã | Body | Token? | Đánh giá | Nguồn |
|---|---|---|---|---|---|---|
| Hợp lệ | JSON đúng tài khoản | `200` | `{"token":"<15 hex>"}` | Có | ✅ | O-04 |
| Hợp lệ | + trường thừa; đảo thứ tự; JSON có xuống dòng; `charset=utf-8`; `APPLICATION/JSON`; `Accept: application/xml` | `200` | token | Có | ✅ | O-06 |
| Hợp lệ | Khóa trùng, giá trị sau đúng | `200` | token | Có | ⚠️ IMP-08 | O-07 |
| Sai giá trị | Sai mật khẩu; sai tên; tài khoản không tồn tại | `200` | `{"reason":"Bad credentials"}` | Không | 🔴 mã (BUG-37) | O-08, O-09 |
| Sai giá trị | Hoa thường (tên, mật khẩu); khoảng trắng đầu tên / cuối tên (review) / cuối mật khẩu | `200` | `Bad credentials` | Không | 🔴 mã (BUG-37) | O-09; review B4 |
| Rỗng / thiếu | `""`; `null`; thiếu `username`; thiếu `password`; `{}`; body rỗng | `200` | `Bad credentials` | Không | 🔴 mã (BUG-37) | O-09, O-10 |
| Sai kiểu | Mảng `["…"]`; object `{"$ne":""}`; body là mảng JSON; chuỗi kiểu SQL injection ở tên / mật khẩu (review) | `200` | `Bad credentials` | Không | 🔴 mã (BUG-37); ✅ không vượt xác thực | O-09; review B4 |
| Biên | Tên 10 000 ký tự | `200` | `Bad credentials` | Không | 🔴 mã (BUG-37); ✅ không `5xx` | O-09 |
| Biên | Body ~200 KB | `413` | `Payload Too Large` (`text/plain`) | Không | 🔴 định dạng (BUG-38) | O-15 |
| Định dạng | URL-encoded, tài khoản đúng | `200` | token | Có | ⚠️ ngoài tài liệu (Q4) | O-12 |
| Định dạng | `text/xml`; `application/xml`; multipart; thiếu `Content-Type`; `text/plain`, tài khoản đúng | `200` | `Bad credentials` | Không | 🔴 thông báo sai (BUG-39) | O-13 |
| Định dạng | Tài khoản trên query string, không body | `200` | `Bad credentials` | Không | ✅ không nhận mật khẩu qua URL; 🔴 mã (BUG-37) | O-13 |
| Định dạng | JSON hỏng; `Content-Type` JSON mà body XML | `400` | `Bad Request` (`text/plain`) | Không | 🔴 định dạng (BUG-38) | O-14 |
| Tần suất | 20 lần thất bại liên tiếp | `200` | `Bad credentials` | Không | ⚠️ không giới hạn (IMP-05, Q5: không có yêu cầu) | O-11 |
| Giao thức | `http://` thay vì `https://` (tài khoản sai) | `200` | `Bad credentials` | Không | 🔴 không chuyển hướng (BUG-40) | O-24 |

**Bảng 3: lớp token × thao tác cần quyền** (trên booking **tự tạo**; ✅ = được nhận / bị từ chối đúng như mong đợi; `403` là hợp đồng theo RB-102 Q4)

| Lớp token | `PUT` | `PATCH` | `DELETE` | Nguồn |
|---|---|---|---|---|
| Token vừa cấp (JSON) | ✅ `200` | ✅ `200` | ✅ `201` | O-18 |
| Token cấp qua URL-encoded | – | ✅ `200` | ✅ `201` | O-12 |
| Token cũ (đã cấp thêm > 10 token), cùng chu kỳ reset | – | ✅ `200` | ✅ `201` | O-05 |
| Token cũ, **sau khi API reset** | ✅ `403` | ✅ `403` (kiểm bằng booking không tồn tại, O-22) | – | O-21 |
| Cookie nhiều giá trị `a=b; token=…; c=d` | – | ✅ `200` | – | O-20 |
| Không có token; `invalid`; rỗng; `abc123`; viết hoa; bớt / thêm 1 ký tự | ✅ `403` | ✅ `403` | ✅ `403` | O-19 |
| `Bearer <token đúng>`; `?token=<đúng>`; cookie tên `TOKEN` | ✅ `403` | ✅ `403` | ✅ `403` (trừ query: chỉ thử `PUT`) | O-19 |
| `Authorization: Basic` (RB-102) | – | ✅ `200` | – | O-20 |

Sau mỗi lần bị `403`, `GET` kiểm lại: booking **không đổi** (O-19).

## Dependencies
- Restful Booker API công khai (`https://restful-booker.herokuapp.com`), dùng chung với người khác (~360 booking mới / phút); **tự reset dữ liệu và xóa mọi token khoảng 10 phút một lần** (O-21): test không được giả định dữ liệu / token còn từ lần chạy trước, và một test có thể rơi đúng lúc reset (token vừa cấp bị `403`, booking vừa tạo bị `404`).
- RB-102 (Booking): `POST /booking` để tạo booking test, `PUT`/`PATCH`/`DELETE`/`GET /booking/:id` để kiểm AC-3 và dọn dẹp. Ranh giới kiểm soát truy cập: Q7 (RB-101 sở hữu cấp token, vòng đời token TVP-026, AC-3 dương tính, đối chứng TVP-028; RB-102 sở hữu ma trận quyền đầy đủ và Basic). Mã từ chối: RB-102 Q4. Hợp đồng `201`: RB-102 Q6.
- Biến môi trường cho tài khoản quản trị (tên và mật khẩu; mặc định là giá trị công khai trong tài liệu).
- Playwright `request` (APIRequestContext) cho test API, không cần trình duyệt.

## Phạm vi test
- **Trong phạm vi**: AC-1 → AC-5; mọi lớp input của `POST /auth` ở bảng 2 (trừ tần suất); mọi phương thức trên 2 endpoint (bảng 1); token vừa cấp / token cũ / token giả trên `PUT`, `PATCH`, `DELETE` của booking tự tạo; luồng smoke ping → auth → dùng token (TVP-035); kiểm thụ động HTTP thường (TVP-036, chỉ tài khoản sai) và `Cache-Control` của phản hồi token (TVP-037).
- **Ngoài phạm vi** (ghi trong `viewpoint.csv` với `scope=out`): giới hạn thử sai / dò mật khẩu (TVP-019, Q5); header bảo mật còn lại, CORS (TVP-020, Q9); Unicode ở tên / mật khẩu (TVP-038, Q12); thời gian phản hồi (TVP-021, knowledge-base); token hết hạn sau reset (TVP-022, Q6); ma trận quyền đầy đủ thuộc RB-102 AC-7 (TVP-029, Q7); ping khi API sập (TVP-034). Theo ticket: nghiệp vụ booking (RB-102), hiệu năng / tải, kiểm thử xâm nhập chuyên sâu, giao diện web.

## Review checklist
| Mục | Kết quả | Ghi chú |
|---|---|---|
| Chức năng được mô tả đầy đủ? | ⚠️ | Đủ luồng chính 2 endpoint. Thiếu: mã lỗi, định dạng body ngoài JSON, thời hạn token, giới hạn thử sai (ticket tự ghi "Chưa rõ") |
| AC đo lường được, testable? | ⚠️ | AC-1, AC-3 rõ. AC-2 không nêu mã HTTP (Q2); AC-4 "mã thành công" không nêu số, chốt `201` theo tài liệu (Q1, quyết định chung với RB-102 Q6); AC-5 không nói phản hồi lỗi (Q3) |
| Validation và error handling? | ✅ | Ticket không nêu mã / thông báo lỗi; HITL #1 đã chốt: `401` / `400` (Q2), JSON cho mọi phản hồi (Q3), `415` (Q4), 4xx cho sai phương thức (Q8), `403` khi token sai (RB-102 Q4). Thông báo lấy nguyên văn hiện hành (knowledge-base) |
| Ràng buộc kỹ thuật / business? | ✅ | BR-1 → BR-6 từ AC và HITL #1; BR-3, BR-8 từ knowledge-base; BR-7 → BR-11 từ HITL #1 (Q4, Q5, Q8 → Q12) |
| Dependency được liệt kê? | ✅ | RB-102 có trong ticket. Bổ sung: API tự reset (O-21), biến môi trường |
| Edge case, negative? | ⚠️ | Ticket chỉ gợi ý sai tài khoản, XML / URL-encoded. Bổ sung qua khám phá: bảng 2 (sai kiểu, rỗng, rất dài, body quá lớn, JSON hỏng, query string, khóa trùng; sau review: SQL, khoảng trắng cuối tên), bảng 1 (mọi phương thức, HTTP thường), bảng 3 (mọi lớp token) |
| Kiểm soát truy cập? | ⚠️ | Token tự tạo / bị sửa / sai chỗ đều bị từ chối (`403`, hợp đồng theo RB-102 Q4), booking không đổi (O-19); không có lỗi kiểu BUG-02 của SD-101. Ranh giới với RB-102: Q7. API phục vụ cả HTTP thường, HITL #1 chốt bắt buộc HTTPS (O-24, Q11, BUG-40) |
| Có câu hỏi blocking? | ✅ | 12 câu (7 blocking, 4 non-blocking, 1 tham chiếu Q1), **11 đã trả lời ở HITL #1** (2026-11-26, "theo đề xuất hết"; Q5 theo đính chính của qa-reviewer), xem [`q-and-a.md`](q-and-a.md). Câu đã có quy tắc chung trong knowledge-base không hỏi lại |

**Bug phát hiện sớm** (đã xác nhận ở HITL #1): xem [`known-issues.md`](known-issues.md) (BUG-37 → BUG-40; bảng số tạm → số chính thức trong file đó; giới hạn thử sai là IMP-05, `/ping` trả `201` là lỗi tài liệu IMP-06). **Cải tiến**: [`improvements.md`](improvements.md) (IMP-01 → IMP-08; IMP-09 đã chuyển thành BUG-40).
