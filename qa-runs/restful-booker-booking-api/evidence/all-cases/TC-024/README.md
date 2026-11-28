# TC-024 Content-Type không khớp body: 400 'Bad Request', không tạo booking

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-8 @post
- **Thời điểm**: 2026-11-28T05:23:43.350Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1199 |

### 1. Content-Type: application/json, body XML

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `<booking><firstname>QA-RB102-261128052139-eq72</firstname><lastname>TC-024-json-xml</lastname><totalprice>150</totalprice><depositpaid>true</depositpaid><bookingdates><checkin>2031-01-10</checkin><checkout>2031-01-12</checkout></bookingdates><additionalneeds>Breakfast</additionalneeds></booking>` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 302 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 511 |

### 2. Content-Type: text/xml, body JSON

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: text/xml · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-024-xml-json","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 306 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 314 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. Content-Type: application/json, body XML: 400 text/plain; charset=utf-8 "Bad Request" |
| phản hồi | 2. Content-Type: text/xml, body JSON: 400 text/plain; charset=utf-8 "Bad Request" |
| requests | 5 request, đăng nhập thất bại 0 |
