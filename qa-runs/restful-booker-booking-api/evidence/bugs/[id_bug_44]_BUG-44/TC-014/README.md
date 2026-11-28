# TC-014 Ngày có giờ / múi giờ / số mili giây ở POST: 400, không lưu ngày bị lệch

- **Kết quả**: ❌ Failed · Bug: BUG-44
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-44
- **Thời điểm**: 2026-11-28T05:22:59.388Z
- **Số request**: 14 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1086 |

### 1. checkin '2031-01-10T23:30:00Z'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10T23:30:00Z","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1070,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 414 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1070}]` | 307 |

### 2. checkin '2031-01-10T01:00:00+07:00'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10T01:00:00+07:00","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1077,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-09","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 303 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 39 | `[{"bookingid":1070},{"bookingid":1077}]` | 299 |

### 3. checkin số 1925078400000

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":1925078400000,"checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1083,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-02","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 309 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 58 | `[{"bookingid":1070},{"bookingid":1077},{"bookingid":1083}]` | 391 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1070` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 319 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 305 |
| 3 | `DELETE /booking/1070` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 302 |
| 4 | `GET /booking/1077` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-09","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |
| 5 | `DELETE /booking/1077` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 307 |
| 6 | `GET /booking/1083` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-02","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 301 |
| 7 | `DELETE /booking/1083` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 304 |

## Lỗi ghi nhận

- `Error: 1. checkin '2031-01-10T23:30:00Z': HTTP 400`
- `Error: 1. checkin '2031-01-10T23:30:00Z': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 2. checkin '2031-01-10T01:00:00+07:00': HTTP 400`
- `Error: 2. checkin '2031-01-10T01:00:00+07:00': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 2. checkin '2031-01-10T01:00:00+07:00': không lưu checkin lệch (2031-01-09, 2031-01-02); thực tế 2031-01-09`
- `Error: 3. checkin số 1925078400000: HTTP 400`
- `Error: 3. checkin số 1925078400000: không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 3. checkin số 1925078400000: không lưu checkin lệch (2031-01-09, 2031-01-02); thực tế 2031-01-02`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. checkin '2031-01-10T23:30:00Z': 200 application/json; charset=utf-8 "{"bookingid":1070,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-1","totalpr" |
| phản hồi | 2. checkin '2031-01-10T01:00:00+07:00': 200 application/json; charset=utf-8 "{"bookingid":1077,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-2","totalpr" |
| phản hồi | 3. checkin số 1925078400000: 200 application/json; charset=utf-8 "{"bookingid":1083,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-014-3","totalpr" |
| cleanup | #1070: DELETE 201 · #1077: DELETE 201 · #1083: DELETE 201 |
| requests | 14 request, đăng nhập thất bại 0 |
