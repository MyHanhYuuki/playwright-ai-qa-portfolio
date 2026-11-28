# TC-032 Lọc checkin=D: có booking checkin D+1, không có booking checkin D-1

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list
- **Thời điểm**: 2026-11-28T05:24:07.982Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-032-d-1

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-032-d-1; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-032-d-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-19","checkout":"2047-05-24"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 226 | `{"bookingid":1699,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-032-d-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-19","checkout":"2047-05-24"},"additionalneeds":"Breakfast"}}` | 904 |

### Chuẩn bị: tạo booking TC-032-d+1

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-032-d+1; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-032-d+1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-21","checkout":"2047-05-26"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 226 | `{"bookingid":1702,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-032-d+1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-21","checkout":"2047-05-26"},"additionalneeds":"Breakfast"}}` | 297 |

### 1. GET /booking?checkin=2047-05-20

> 🔍 Cần xem: 200, MSG-10; có P2, không có P1

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin=2047-05-20` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1702}]` | 258 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1699` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 197 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-032-d-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-19","checkout":"2047-05-24"},"additionalneeds":"Breakfast"}` | 311 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 408 |
| 3 | `DELETE /booking/1699` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 448 |
| 4 | `GET /booking/1702` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 197 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-032-d+1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2047-05-21","checkout":"2047-05-26"},"additionalneeds":"Breakfast"}` | 404 |
| 5 | `DELETE /booking/1702` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 478 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1699: DELETE 201 · #1702: DELETE 201 |
| requests | 8 request, đăng nhập thất bại 0 |
