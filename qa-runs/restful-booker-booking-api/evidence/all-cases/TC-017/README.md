# TC-017 firstname / lastname rỗng hoặc chỉ khoảng trắng ở POST: 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-55
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-55
- **Thời điểm**: 2026-11-28T05:23:18.539Z
- **Số request**: 20 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1396 |

### 1. firstname ''

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"","lastname":"QA-RB102-261128052139-eq72-TC-017-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 225 | `{"bookingid":1228,"booking":{"firstname":"","lastname":"QA-RB102-261128052139-eq72-TC-017-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 348 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 369 |
| 3 | `GET /booking?lastname=QA-RB102-261128052139-eq72-TC-017-1` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1228}]` | 307 |

### 2. lastname ''

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-017-2"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 242 | `{"bookingid":1234,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-017-2"}}` | 537 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1234}]` | 282 |

### 3. lastname '   ' (3 khoảng trắng)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"   ","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-017-3"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 242 | `{"bookingid":1241,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-017-3"}}` | 514 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 39 | `[{"bookingid":1234},{"bookingid":1241}]` | 294 |

### 4. firstname '\t' (1 tab)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"\t","lastname":"QA-RB102-261128052139-eq72-TC-017-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 225 | `{"bookingid":1248,"booking":{"firstname":"","lastname":"QA-RB102-261128052139-eq72-TC-017-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 378 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 39 | `[{"bookingid":1234},{"bookingid":1241}]` | 338 |
| 3 | `GET /booking?lastname=QA-RB102-261128052139-eq72-TC-017-4` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1248}]` | 306 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1228` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"","lastname":"QA-RB102-261128052139-eq72-TC-017-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 293 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 502 |
| 3 | `DELETE /booking/1228` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 525 |
| 4 | `GET /booking/1234` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 213 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-017-2"}` | 299 |
| 5 | `DELETE /booking/1234` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 253 |
| 6 | `GET /booking/1241` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 213 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-017-3"}` | 262 |
| 7 | `DELETE /booking/1241` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 300 |
| 8 | `GET /booking/1248` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"","lastname":"QA-RB102-261128052139-eq72-TC-017-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 305 |
| 9 | `DELETE /booking/1248` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 300 |

## Lỗi ghi nhận

- `Error: 1. firstname '': HTTP 400`
- `Error: 1. firstname '': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 2. lastname '': HTTP 400`
- `Error: 2. lastname '': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 3. lastname '   ' (3 khoảng trắng): HTTP 400`
- `Error: 3. lastname '   ' (3 khoảng trắng): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 4. firstname '\t' (1 tab): HTTP 400`
- `Error: 4. firstname '\t' (1 tab): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. firstname '': 200 application/json; charset=utf-8 "{"bookingid":1228,"booking":{"firstname":"","lastname":"QA-RB102-261128052139-eq72-TC-017-1","totalp" |
| phản hồi | 2. lastname '': 200 application/json; charset=utf-8 "{"bookingid":1234,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150" |
| phản hồi | 3. lastname '   ' (3 khoảng trắng): 200 application/json; charset=utf-8 "{"bookingid":1241,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150" |
| phản hồi | 4. firstname '\t' (1 tab): 200 application/json; charset=utf-8 "{"bookingid":1248,"booking":{"firstname":"","lastname":"QA-RB102-261128052139-eq72-TC-017-4","totalp" |
| cleanup | #1228: DELETE 201 · #1234: DELETE 201 · #1241: DELETE 201 · #1248: DELETE 201 |
| requests | 20 request, đăng nhập thất bại 0 |
