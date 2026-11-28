# TC-007 null / sai kiểu cấu trúc ở trường bắt buộc: POST trả 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-41
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-41
- **Thời điểm**: 2026-11-28T05:22:09.947Z
- **Số request**: 10 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 997 |

### 1. totalprice null

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-007-gia-null","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 456 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 379 |

### 2. depositpaid null

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-007-coc-null","totalprice":150,"depositpaid":null,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 295 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 308 |

### 3. firstname là số 12345

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":12345,"lastname":"QA-RB102-261128052139-eq72-TC-007-ten-so","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 312 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 400 |
| 3 | `GET /booking?lastname=QA-RB102-261128052139-eq72-TC-007-ten-so` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 311 |

### 4. bookingdates là chuỗi

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-007-ngay-chuoi","totalprice":150,"depositpaid":false,"bookingdates":"2031-01-10","additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 299 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 407 |

## Lỗi ghi nhận

- `Error: 1. totalprice null: HTTP 400`
- `Error: 1. totalprice null: không 5xx`
- `Error: 2. depositpaid null: HTTP 400`
- `Error: 2. depositpaid null: không 5xx`
- `Error: 3. firstname là số 12345: HTTP 400`
- `Error: 3. firstname là số 12345: không 5xx`
- `Error: 4. bookingdates là chuỗi: HTTP 400`
- `Error: 4. bookingdates là chuỗi: không 5xx`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. totalprice null: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | 2. depositpaid null: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | 3. firstname là số 12345: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | 4. bookingdates là chuỗi: 500 text/plain; charset=utf-8 "Internal Server Error" |
| requests | 10 request, đăng nhập thất bại 0 |
