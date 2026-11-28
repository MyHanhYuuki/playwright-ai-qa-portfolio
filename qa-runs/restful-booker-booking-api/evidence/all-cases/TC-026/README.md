# TC-026 Không gửi Accept hoặc Accept */*: GET /booking/:id và POST /booking trả như bình thường (JSON đủ 6 trường)

- **Kết quả**: ❌ Failed · Bug: BUG-60
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-2 @AC-8 @AC-1 @post @get-id @BUG-60
- **Thời điểm**: 2026-11-28T05:26:51.446Z
- **Số request**: 10 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-026

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-026; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-026","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":3139,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-026","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1117 |

### 1. GET /booking/X KHÔNG có header Accept (node:https, chỉ gửi đúng header khai báo)

> 🔍 Cần xem: 200, MSG-10, 7 giá trị TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3139` (node:https) | content-length: 0 · host: restful-booker.herokuapp.com | (trống) | **418** | content-type: text/plain; charset=utf-8 · content-length: 12 | `I'm a Teapot` | 934 |

### 2. GET /booking/X với Accept: */*

> 🔍 Cần xem: 200, MSG-10, 7 giá trị TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3139` | Accept: */* | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-026","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 294 |

### 3. POST /booking KHÔNG có header Accept (node:https)

> 🔍 Cần xem: 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` (node:https) | content-type: application/json · content-length: 198 · host: restful-booker.herokuapp.com | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-026-post","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **418** | content-type: text/plain; charset=utf-8 · content-length: 12 | `I'm a Teapot` | 292 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-026-post` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":3162}]` | 304 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3139` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-026","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 313 |
| 3 | `DELETE /booking/3139` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 300 |
| 4 | `GET /booking/3162` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-026-post","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 307 |
| 5 | `DELETE /booking/3162` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 502 |

## Lỗi ghi nhận

- `Error: Bước 1 (không Accept): 200`
- `Error: Bước 1 (không Accept): Content-Type MSG-10`
- `Error: Bước 1 (không Accept): đúng 6 khóa, bookingdates 2 khóa, 7 giá trị TD-03`
- `Error: Bước 3 (POST không Accept): 200`
- `Error: Bước 3 (POST không Accept): Content-Type MSG-10`
- `Error: Bước 3 (POST không Accept): booking đúng 7 giá trị đã gửi`
- `Error: Bước 3 (POST không Accept): trả bookingid (client biết id của booking đã tạo)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 3. POST không Accept: 418 text/plain; charset=utf-8 "I'm a Teapot" |
| cleanup | #3139: DELETE 201 · #3162: DELETE 201 |
| requests | 10 request, đăng nhập thất bại 0 |
