# TC-051 PATCH depositpaid không phải boolean ("false", 0): 400, booking giữ nguyên

- **Kết quả**: ❌ Failed · Bug: BUG-42
- **Nhóm**: Endpoint 5: PATCH /booking/:id
- **Tags**: @AC-5 @patch @get-id @BUG-42
- **Thời điểm**: 2026-11-28T05:25:45.953Z
- **Số request**: 15 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-051

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-051; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2551,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1118 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2551` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 316 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 394 |

### PATCH {"depositpaid": "false"}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2551` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"depositpaid":"false"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 384 |
| 2 | `GET /booking/2551` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 406 |

### Chuẩn bị: tạo booking TC-051-true

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-051-true; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 226 | `{"bookingid":2565,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 262 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2565` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 197 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 265 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 277 |

### PATCH {"depositpaid": 0}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2565` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"depositpaid":0}` | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 347 |
| 2 | `GET /booking/2565` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 325 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2551` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 318 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 270 |
| 3 | `DELETE /booking/2551` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 308 |
| 4 | `GET /booking/2565` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 483 |
| 5 | `DELETE /booking/2565` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 272 |

## Lỗi ghi nhận

- `Error: PATCH {"depositpaid": "false"}: 400`
- `Error: PATCH {"depositpaid": "false"}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":true,"bookingdates":{"check`
- `Error: PATCH {"depositpaid": 0}: 400`
- `Error: PATCH {"depositpaid": 0}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":false,"bookingdates":{`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PATCH {"depositpaid": "false"}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"depositpaid":true,"b" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051","totalprice":150,"" |
| phản hồi | PATCH {"depositpaid": 0}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":150,"depositpaid":fa" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-051-true","totalprice":" |
| cleanup | #2551: DELETE 201 · #2565: DELETE 201 |
| requests | 15 request, đăng nhập thất bại 0 |
