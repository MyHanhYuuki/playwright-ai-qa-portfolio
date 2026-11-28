# TC-016 checkout trước hoặc bằng checkin ở POST: 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-56
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-56
- **Thời điểm**: 2026-11-28T05:23:10.354Z
- **Số request**: 10 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1093 |

### checkout trước checkin (2031-01-12 → 2031-01-10)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-truoc","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-12","checkout":"2031-01-10"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 228 | `{"bookingid":1186,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-truoc","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-12","checkout":"2031-01-10"},"additionalneeds":"Breakfast"}}` | 304 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1186}]` | 305 |

### checkout bằng checkin (2031-01-10 → 2031-01-10)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-bang","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-10"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 227 | `{"bookingid":1191,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-bang","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-10"},"additionalneeds":"Breakfast"}}` | 304 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 39 | `[{"bookingid":1186},{"bookingid":1191}]` | 313 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1186` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-truoc","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-12","checkout":"2031-01-10"},"additionalneeds":"Breakfast"}` | 310 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 320 |
| 3 | `DELETE /booking/1186` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 366 |
| 4 | `GET /booking/1191` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-bang","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-10"},"additionalneeds":"Breakfast"}` | 344 |
| 5 | `DELETE /booking/1191` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 482 |

## Lỗi ghi nhận

- `Error: checkout trước checkin (2031-01-12 → 2031-01-10): HTTP 400`
- `Error: checkout trước checkin (2031-01-12 → 2031-01-10): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: checkout bằng checkin (2031-01-10 → 2031-01-10): HTTP 400`
- `Error: checkout bằng checkin (2031-01-10 → 2031-01-10): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | checkout trước checkin (2031-01-12 → 2031-01-10): 200 application/json; charset=utf-8 "{"bookingid":1186,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-truoc","tot" |
| phản hồi | checkout bằng checkin (2031-01-10 → 2031-01-10): 200 application/json; charset=utf-8 "{"bookingid":1191,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-016-bang","tota" |
| cleanup | #1186: DELETE 201 · #1191: DELETE 201 |
| requests | 10 request, đăng nhập thất bại 0 |
