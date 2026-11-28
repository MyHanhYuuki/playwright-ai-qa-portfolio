# TC-042 PUT không gửi additionalneeds thì xóa giá trị cũ

- **Kết quả**: ❌ Failed · Bug: BUG-53
- **Nhóm**: Endpoint 4: PUT /booking/:id
- **Tags**: @AC-4 @put @get-id @BUG-53
- **Thời điểm**: 2026-11-28T05:24:45.576Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-042

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-042; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-042","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2036,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-042","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 982 |

### 1. GET /booking/X kiểm chủ sở hữu

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2036` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-042","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 303 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 312 |

### 2. PUT /booking/X, body TD-04 bỏ additionalneeds

> 🔍 Cần xem: 200; additionalneeds không còn giá trị; 6 giá trị còn lại đúng TD-04

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2036` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-042-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 200 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-042-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Breakfast"}` | 299 |

### 4. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2036` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 200 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-042-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Breakfast"}` | 294 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2036` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 200 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-042-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Breakfast"}` | 416 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 408 |
| 3 | `DELETE /booking/2036` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 403 |

## Lỗi ghi nhận

- `Error: Bước 3: additionalneeds không có giá trị (không còn 'Breakfast')`
- `Error: Bước 4: additionalneeds không có giá trị (không còn 'Breakfast')`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2036: DELETE 201 |
| requests | 8 request, đăng nhập thất bại 0 |
