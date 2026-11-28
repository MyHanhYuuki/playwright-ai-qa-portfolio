# TC-067 Ma trận 12 kiểu xác thực bị từ chối (abc123, token thừa / thiếu 1 ký tự, Bearer…) × PUT, PATCH, DELETE: 403, booking giữ nguyên

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-7 @security @full @put @patch @delete
- **Thời điểm**: 2026-11-28T05:27:44.184Z
- **Số request**: 54 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-067

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-067; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":3492,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 900 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 309 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 249 |

### v05 Cookie: TOKEN=<token> (tên cookie viết hoa): PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: TOKEN=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 317 |

### v05 Cookie: TOKEN=<token> (tên cookie viết hoa): PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: TOKEN=*** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 250 |

### v05 Cookie: TOKEN=<token> (tên cookie viết hoa): DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Cookie: TOKEN=*** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 270 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 300 |

### v08 Cookie: <token> (không có tên): PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: *** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 285 |

### v08 Cookie: <token> (không có tên): PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: *** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 466 |

### v08 Cookie: <token> (không có tên): DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Cookie: *** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 264 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 313 |

### v10 token viết hoa: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 437 |

### v10 token viết hoa: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 318 |

### v10 token viết hoa: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Cookie: token=*** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 266 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 343 |

### v11 token thiếu ký tự cuối: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 318 |

### v11 token thiếu ký tự cuối: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 294 |

### v11 token thiếu ký tự cuối: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Cookie: token=*** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 260 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 251 |

### v12 Authorization: Bearer <token>: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Bearer *** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 258 |

### v12 Authorization: Bearer <token>: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Bearer *** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 344 |

### v12 Authorization: Bearer <token>: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Authorization: Bearer *** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 315 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 363 |

### v15 Authorization: Basic !!!notbase64: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 250 |

### v15 Authorization: Basic !!!notbase64: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 264 |

### v15 Authorization: Basic !!!notbase64: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Authorization: Basic *** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 340 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 304 |

### v17 Basic, tên đăng nhập viết hoa chữ đầu: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 287 |

### v17 Basic, tên đăng nhập viết hoa chữ đầu: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 333 |

### v17 Basic, tên đăng nhập viết hoa chữ đầu: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Authorization: Basic *** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 301 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 305 |

### v18 ?token=<token> trên URL: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492?token=***` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 307 |

### v18 ?token=<token> trên URL: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492?token=***` | Content-Type: application/json · Accept: application/json | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 305 |

### v18 ?token=<token> trên URL: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492?token=***` | – | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 306 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 304 |

### v19 header token: <token>: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · token: *** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 380 |

### v19 header token: <token>: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · token: *** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 251 |

### v19 header token: <token>: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | token: *** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 301 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 303 |

### v21 'Authorization: Basic ' (rỗng): PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Basic  | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 248 |

### v21 'Authorization: Basic ' (rỗng): PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Authorization: Basic  | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 263 |

### v21 'Authorization: Basic ' (rỗng): DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Authorization: Basic  | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 294 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 321 |

### v23 Cookie: token=abc123: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=abc123 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 299 |

### v23 Cookie: token=abc123: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=abc123 | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 303 |

### v23 Cookie: token=abc123: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Cookie: token=abc123 | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 315 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 299 |

### v24 token thừa 1 ký tự 'x': PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-067-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 312 |

### v24 token thừa 1 ký tự 'x': PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3492` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 254 |

### v24 token thừa 1 ký tự 'x': DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3492` | Cookie: token=*** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 251 |
| 2 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 317 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3492` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-067","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 258 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 296 |
| 3 | `DELETE /booking/3492` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 316 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | v05 Cookie: TOKEN=<token> (tên cookie viết hoa): PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v05 Cookie: TOKEN=<token> (tên cookie viết hoa): PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v05 Cookie: TOKEN=<token> (tên cookie viết hoa): DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v08 Cookie: <token> (không có tên): PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v08 Cookie: <token> (không có tên): PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v08 Cookie: <token> (không có tên): DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v10 token viết hoa: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v10 token viết hoa: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v10 token viết hoa: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v11 token thiếu ký tự cuối: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v11 token thiếu ký tự cuối: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v11 token thiếu ký tự cuối: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v12 Authorization: Bearer *** PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v12 Authorization: Bearer *** PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v12 Authorization: Bearer *** DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v15 Authorization: Basic *** PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v15 Authorization: Basic *** PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v15 Authorization: Basic *** DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v17 Basic, tên đăng nhập viết hoa chữ đầu: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v17 Basic, tên đăng nhập viết hoa chữ đầu: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v17 Basic, tên đăng nhập viết hoa chữ đầu: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v18 ?token=<token> trên URL: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v18 ?token=<token> trên URL: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v18 ?token=<token> trên URL: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v19 header token: <token>: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v19 header token: <token>: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v19 header token: <token>: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v21 'Authorization: Basic *** (rỗng): PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v21 'Authorization: Basic *** (rỗng): PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v21 'Authorization: Basic *** (rỗng): DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v23 Cookie: token=abc123: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v23 Cookie: token=abc123: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v23 Cookie: token=abc123: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v24 token thừa 1 ký tự 'x': PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v24 token thừa 1 ký tự 'x': PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v24 token thừa 1 ký tự 'x': DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| cleanup | #3492: DELETE 201 |
| requests | 54 request, đăng nhập thất bại 0 |
