# TC-034 Lọc checkout=D trả booking có checkout bằng đúng D

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list
- **Thời điểm**: 2026-11-28T05:24:13.134Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-034-d

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-034-d; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-034-d","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-15","checkout":"2047-08-20"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1755,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-034-d","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-15","checkout":"2047-08-20"},"additionalneeds":"Breakfast"}}` | 1013 |

### 1. GET /booking?checkout=2047-08-20

> 🔍 Cần xem: 200, MSG-10; có P

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkout=2047-08-20` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 21657 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 21657 byte)` | 816 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1755` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-034-d","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-08-15","checkout":"2047-08-20"},"additionalneeds":"Breakfast"}` | 304 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 312 |
| 3 | `DELETE /booking/1755` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 300 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1755: DELETE 201 |
| requests | 5 request, đăng nhập thất bại 0 |
