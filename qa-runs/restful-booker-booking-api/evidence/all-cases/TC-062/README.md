# TC-062 Accept không hỗ trợ: POST trả 406 và không tạo booking; GET /booking/:id trả 406

- **Kết quả**: ❌ Failed · Bug: BUG-49
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-8 @AC-1 @post @get-id @BUG-49
- **Thời điểm**: 2026-11-28T05:26:46.739Z
- **Số request**: 14 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-062

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-062; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-062","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":3091,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-062","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 959 |

### 1. POST Accept: text/plain

> 🔍 Cần xem: 406; tìm theo tên trả [] (không tạo booking ẩn)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: text/plain | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-062-text-plain","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **418** | content-type: text/plain; charset=utf-8 · content-length: 12 | `I'm a Teapot` | 255 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-062-text-plain` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":3092}]` | 355 |

### 2. POST Accept: application/x-www-form-urlencoded

> 🔍 Cần xem: 406; tìm theo tên trả [] (không tạo booking ẩn)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/x-www-form-urlencoded | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-062-urlencoded","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: text/html; charset=utf-8 · content-length: 32 | `formurlencoded is not a function` | 256 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-062-urlencoded` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":3097}]` | 357 |

### 3. GET /booking/X Accept: text/plain

> 🔍 Cần xem: 406; body không chứa lỗi nội bộ

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3091` | Accept: text/plain | (trống) | **418** | content-type: text/plain; charset=utf-8 · content-length: 12 | `I'm a Teapot` | 331 |

### 4. GET /booking/X Accept: application/x-www-form-urlencoded

> 🔍 Cần xem: 406; body không chứa lỗi nội bộ

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3091` | Accept: application/x-www-form-urlencoded | (trống) | **200** | content-type: text/html; charset=utf-8 · content-length: 32 | `formurlencoded is not a function` | 287 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3091` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-062","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 282 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 318 |
| 3 | `DELETE /booking/3091` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 285 |
| 4 | `GET /booking/3092` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-062-text-plain","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 338 |
| 5 | `DELETE /booking/3092` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 393 |
| 6 | `GET /booking/3097` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-062-urlencoded","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 305 |
| 7 | `DELETE /booking/3097` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 312 |

## Lỗi ghi nhận

- `Error: 1. POST Accept: text/plain: 406`
- `Error: 2. POST Accept: application/x-www-form-urlencoded: 406`
- `Error: 3. GET /booking/X Accept: text/plain: 406`
- `Error: 4. GET /booking/X Accept: application/x-www-form-urlencoded: 406`
- `Error: 1. POST Accept: text/plain: tìm theo tên trả [] (không tạo booking)`
- `Error: 2. POST Accept: application/x-www-form-urlencoded: tìm theo tên trả [] (không tạo booking)`
- `Error: 2. POST Accept: application/x-www-form-urlencoded: body không lộ lỗi nội bộ (MSG-14)`
- `Error: 4. GET /booking/X Accept: application/x-www-form-urlencoded: body không lộ lỗi nội bộ (MSG-14)`
- `Error: 4. GET /booking/X Accept: application/x-www-form-urlencoded: body không chứa 'formurlencoded is not a function' (MSG-08)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. POST Accept: text/plain: 418 text/plain; charset=utf-8 "I'm a Teapot" |
| phản hồi | 2. POST Accept: application/x-www-form-urlencoded: 200 text/html; charset=utf-8 "formurlencoded is not a function" |
| phản hồi | 3. GET /booking/X Accept: text/plain: 418 text/plain; charset=utf-8 "I'm a Teapot" |
| phản hồi | 4. GET /booking/X Accept: application/x-www-form-urlencoded: 200 text/html; charset=utf-8 "formurlencoded is not a function" |
| cleanup | #3091: DELETE 201 · #3092: DELETE 201 · #3097: DELETE 201 |
| requests | 14 request, đăng nhập thất bại 0 |
