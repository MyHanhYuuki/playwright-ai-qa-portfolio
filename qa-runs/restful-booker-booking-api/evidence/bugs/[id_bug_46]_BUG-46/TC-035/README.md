# TC-035 Lọc checkout=D: có booking checkout D+1, không có booking checkout D-1 (≥)

- **Kết quả**: ❌ Failed · Bug: BUG-46
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list @BUG-46
- **Thời điểm**: 2026-11-28T05:24:17.134Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-035-d-1

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-035-d-1; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-035-d-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-14","checkout":"2047-08-19"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 226 | `{"bookingid":1781,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-035-d-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-14","checkout":"2047-08-19"},"additionalneeds":"Breakfast"}}` | 1358 |

### Chuẩn bị: tạo booking TC-035-d+1

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-035-d+1; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-035-d+1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-16","checkout":"2047-08-21"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 226 | `{"bookingid":1786,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-035-d+1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-16","checkout":"2047-08-21"},"additionalneeds":"Breakfast"}}` | 362 |

### 1. GET /booking?checkout=2047-08-20

> 🔍 Cần xem: 200, MSG-10, mảng [{bookingid}]; có Q2, không có Q1

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkout=2047-08-20` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 22075 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 22075 byte)` | 650 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1781` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 197 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-035-d-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-14","checkout":"2047-08-19"},"additionalneeds":"Breakfast"}` | 394 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 382 |
| 3 | `DELETE /booking/1781` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 263 |
| 4 | `GET /booking/1786` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 197 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-035-d+1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-16","checkout":"2047-08-21"},"additionalneeds":"Breakfast"}` | 257 |
| 5 | `DELETE /booking/1786` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 302 |

## Lỗi ghi nhận

- `Error: có Q2 (checkout D+1)`
- `Error: không có Q1 (checkout D-1)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1781: DELETE 201 · #1786: DELETE 201 |
| requests | 8 request, đăng nhập thất bại 0 |
