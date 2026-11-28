# TC-033 Lọc checkin=D trả cả booking có checkin bằng đúng D (≥)

- **Kết quả**: ❌ Failed · Bug: BUG-47
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list @BUG-47
- **Thời điểm**: 2026-11-28T05:24:10.362Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-033-d

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-033-d; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-033-d","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-20","checkout":"2047-05-25"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1738,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-033-d","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-20","checkout":"2047-05-25"},"additionalneeds":"Breakfast"}}` | 1036 |

### 1. GET /booking?checkin=2047-05-20

> 🔍 Cần xem: 200, MSG-10, mảng [{bookingid}]; có P (checkin = D)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin=2047-05-20` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 306 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1738` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-033-d","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-20","checkout":"2047-05-25"},"additionalneeds":"Breakfast"}` | 273 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 318 |
| 3 | `DELETE /booking/1738` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 415 |

## Lỗi ghi nhận

- `Error: có P (checkin = D thỏa ≥)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1738: DELETE 201 |
| requests | 5 request, đăng nhập thất bại 0 |
