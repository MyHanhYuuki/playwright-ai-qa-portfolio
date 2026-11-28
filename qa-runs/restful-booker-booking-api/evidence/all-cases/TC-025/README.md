# TC-025 GET /booking không lọc: 200, mảng [{bookingid}] có id vừa tạo

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-3 @smoke @post @get-list
- **Thời điểm**: 2026-11-28T05:23:45.998Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-025

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-025; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-025","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":1515,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-025","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1079 |

### 1. GET /booking (không tham số)

> 🔍 Cần xem: 200, MSG-10, mảng khác rỗng, mọi phần tử đúng 1 khóa bookingid nguyên dương, có X

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 18712 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 18712 byte)` | 615 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1515` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-025","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 304 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 303 |
| 3 | `DELETE /booking/1515` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 307 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1515: DELETE 201 |
| requests | 5 request, đăng nhập thất bại 0 |
