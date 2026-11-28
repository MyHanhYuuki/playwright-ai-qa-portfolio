# TC-036 Lọc kết hợp tên + ngày và checkin + checkout là điều kiện 'và'

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list
- **Thời điểm**: 2026-11-28T05:24:21.531Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-036

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-036; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-036","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2048-03-10","checkout":"2048-03-20"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":1819,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-036","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2048-03-10","checkout":"2048-03-20"},"additionalneeds":"Breakfast"}}` | 1116 |

### 1. firstname=<run>&lastname=TC-036&checkin=2048-03-09

> 🔍 Cần xem: firstname=QA-RB102-261128052139-eq72&lastname=TC-036&checkin=2048-03-09

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-036&checkin=2048-03-09` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1819}]` | 307 |

### 2. lastname=TC-036&checkin=2048-03-11

> 🔍 Cần xem: lastname=TC-036&checkin=2048-03-11

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?lastname=TC-036&checkin=2048-03-11` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 305 |

### 3. checkin=2048-03-09&checkout=2048-03-20

> 🔍 Cần xem: checkin=2048-03-09&checkout=2048-03-20

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin=2048-03-09&checkout=2048-03-20` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1819}]` | 1230 |

### 4. checkin=2048-03-11&checkout=2048-03-20

> 🔍 Cần xem: checkin=2048-03-11&checkout=2048-03-20

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin=2048-03-11&checkout=2048-03-20` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 385 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1819` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-036","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2048-03-10","checkout":"2048-03-20"},"additionalneeds":"Breakfast"}` | 315 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 331 |
| 3 | `DELETE /booking/1819` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 381 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1819: DELETE 201 |
| requests | 8 request, đăng nhập thất bại 0 |
