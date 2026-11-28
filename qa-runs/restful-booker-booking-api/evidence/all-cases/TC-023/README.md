# TC-023 Thiếu / sai Content-Type (415) và body rỗng (400): không 5xx, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-58
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-8 @AC-1 @post @BUG-58
- **Thời điểm**: 2026-11-28T05:23:40.676Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 967 |

### 1. Không có header Content-Type, body JSON

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` (node:https) | accept: application/json · content-length: 202 · host: restful-booker.herokuapp.com | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-023-khong-ct","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 980 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 254 |

### 2. Content-Type: text/plain, body JSON

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: text/plain · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-023-text-plain","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 360 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 310 |

### 3. Content-Type: application/xml, body XML

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/xml · Accept: application/json | `<booking><firstname>QA-RB102-261128052139-eq72</firstname><lastname>TC-023-app-xml</lastname><totalprice>150</totalprice><depositpaid>true</depositpaid><bookingdates><checkin>2031-01-10</checkin><checkout>2031-01-12</checkout></bookingdates><additionalneeds>Breakfast</additionalneeds></booking>` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 299 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 356 |

### 4. Content-Type: application/json, body rỗng thật (0 byte)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `(0 byte)` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 355 |

## Lỗi ghi nhận

- `Error: 1. Không có header Content-Type, body JSON: HTTP 415`
- `Error: 1. Không có header Content-Type, body JSON: không 5xx`
- `Error: 2. Content-Type: text/plain, body JSON: HTTP 415`
- `Error: 2. Content-Type: text/plain, body JSON: không 5xx`
- `Error: 3. Content-Type: application/xml, body XML: HTTP 415`
- `Error: 3. Content-Type: application/xml, body XML: không 5xx`
- `Error: 4. Content-Type: application/json, body rỗng thật (0 byte): HTTP 400`
- `Error: 4. Content-Type: application/json, body rỗng thật (0 byte): không 5xx`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. Không có header Content-Type, body JSON: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | 2. Content-Type: text/plain, body JSON: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | 3. Content-Type: application/xml, body XML: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | 4. Content-Type: application/json, body rỗng thật (0 byte): 500 text/plain; charset=utf-8 "Internal Server Error" |
| requests | 8 request, đăng nhập thất bại 0 |
