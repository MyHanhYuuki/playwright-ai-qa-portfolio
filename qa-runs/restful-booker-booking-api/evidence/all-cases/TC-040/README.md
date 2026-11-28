# TC-040 PUT hợp lệ (Cookie token) thay toàn bộ booking, GET thấy đúng 7 giá trị mới

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 4: PUT /booking/:id
- **Tags**: @AC-4 @AC-7 @smoke @put @get-id
- **Thời điểm**: 2026-11-28T05:24:34.016Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-040

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-040; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-040","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":1939,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-040","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1925 |

### 1. GET /booking/X kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1939` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-040","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 259 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 272 |

### 2. PUT /booking/X (Cookie token, TD-04)

> 🔍 Cần xem: 200, MSG-10, đúng 6 khóa, 7 giá trị TD-04

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1939` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-040 Trần","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 208 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-040 Trần","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 269 |

### 4. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1939` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 208 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-040 Trần","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 325 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1939` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 208 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-040 Trần","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 259 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 268 |
| 3 | `DELETE /booking/1939` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 264 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1939: DELETE 201 |
| requests | 8 request, đăng nhập thất bại 0 |
