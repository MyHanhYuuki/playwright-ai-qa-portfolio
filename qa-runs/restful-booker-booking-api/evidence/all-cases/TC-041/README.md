# TC-041 PUT thiếu trường bắt buộc, body {} hoặc totalprice null: 400, booking giữ nguyên

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 4: PUT /booking/:id
- **Tags**: @AC-4 @put @get-id
- **Thời điểm**: 2026-11-28T05:24:42.133Z
- **Số request**: 24 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-041

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-041; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":1962,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 927 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 287 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 273 |

### PUT bỏ firstname

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"lastname":"TC-041-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 260 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 304 |

### PUT bỏ lastname

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 281 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 277 |

### PUT bỏ totalprice

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-041-moi","depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 264 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 260 |

### PUT bỏ depositpaid

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-041-moi","totalprice":275,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 413 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 308 |

### PUT bỏ bookingdates

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-041-moi","totalprice":275,"depositpaid":true,"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 274 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 343 |

### PUT bỏ bookingdates.checkin

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-041-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 280 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 269 |

### PUT bỏ bookingdates.checkout

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-041-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01"},"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 382 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 371 |

### PUT body {}

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 314 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 439 |

### PUT totalprice null

> 🔍 Cần xem: 400, MSG-11, Bad Request; GET giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1962` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-041-moi","totalprice":null,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 398 |
| 2 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 318 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1962` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-041","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 277 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 263 |
| 3 | `DELETE /booking/1962` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 265 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PUT bỏ firstname: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT bỏ lastname: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT bỏ totalprice: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT bỏ depositpaid: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT bỏ bookingdates: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT bỏ bookingdates.checkin: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT bỏ bookingdates.checkout: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT body {}: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| phản hồi | PUT totalprice null: 400 text/plain; charset=utf-8 "Bad Request" · booking giữ nguyên |
| cleanup | #1962: DELETE 201 |
| requests | 24 request, đăng nhập thất bại 0 |
