# TC-004 Thiếu từng trường bắt buộc (7 biến thể): POST trả 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-41
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-41
- **Thời điểm**: 2026-11-28T05:22:01.761Z
- **Số request**: 16 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1589 |

### Bỏ firstname

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"lastname":"QA-RB102-261128052139-eq72-TC-004-firstname","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 323 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 395 |
| 3 | `GET /booking?lastname=QA-RB102-261128052139-eq72-TC-004-firstname` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 255 |

### Bỏ lastname

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 355 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 465 |

### Bỏ totalprice

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-004-totalprice","depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 252 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 304 |

### Bỏ depositpaid

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-004-depositpaid","totalprice":150,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 306 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 461 |

### Bỏ bookingdates

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-004-bookingdates","totalprice":150,"depositpaid":false,"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 296 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 369 |

### Bỏ bookingdates.checkin

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-004-checkin","totalprice":150,"depositpaid":false,"bookingdates":{"checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 252 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 396 |

### Bỏ bookingdates.checkout

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-004-checkout","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 280 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 434 |

## Lỗi ghi nhận

- `Error: Bỏ firstname: HTTP 400`
- `Error: Bỏ firstname: không 5xx`
- `Error: Bỏ lastname: HTTP 400`
- `Error: Bỏ lastname: không 5xx`
- `Error: Bỏ totalprice: HTTP 400`
- `Error: Bỏ totalprice: không 5xx`
- `Error: Bỏ depositpaid: HTTP 400`
- `Error: Bỏ depositpaid: không 5xx`
- `Error: Bỏ bookingdates: HTTP 400`
- `Error: Bỏ bookingdates: không 5xx`
- `Error: Bỏ bookingdates.checkin: HTTP 400`
- `Error: Bỏ bookingdates.checkin: không 5xx`
- `Error: Bỏ bookingdates.checkout: HTTP 400`
- `Error: Bỏ bookingdates.checkout: không 5xx`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | Bỏ firstname: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | Bỏ lastname: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | Bỏ totalprice: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | Bỏ depositpaid: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | Bỏ bookingdates: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | Bỏ bookingdates.checkin: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | Bỏ bookingdates.checkout: 500 text/plain; charset=utf-8 "Internal Server Error" |
| requests | 16 request, đăng nhập thất bại 0 |
