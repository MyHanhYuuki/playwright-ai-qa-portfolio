# TC-055 Sau khi xóa: DELETE lần 2, PUT, PATCH trả 404

- **Kết quả**: ❌ Failed · Bug: BUG-52
- **Nhóm**: Endpoint 6: DELETE /booking/:id
- **Tags**: @AC-6 @delete @put @patch @BUG-52
- **Thời điểm**: 2026-11-28T05:26:10.852Z
- **Số request**: 12 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-055

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-055; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-055","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2774,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-055","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1080 |

### Chuẩn bị: GET /booking/X kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2774` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-055","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 389 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 274 |

### Chuẩn bị: DELETE /booking/X

> 🔍 Cần xem: 201

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/2774` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 341 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 404 |

### 1. DELETE /booking/X lần 2

> 🔍 Cần xem: Trước: GET X phải 404; mong đợi 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2774` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 313 |
| 2 | `DELETE /booking/2774` | Cookie: token=*** | (trống) | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 308 |

### 2. PUT /booking/X (TD-04)

> 🔍 Cần xem: Trước: GET X phải 404; mong đợi 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2774` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 298 |
| 2 | `PUT /booking/2774` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-055-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 269 |

### 3. PATCH /booking/X {"totalprice": 1}

> 🔍 Cần xem: Trước: GET X phải 404; mong đợi 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2774` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 342 |
| 2 | `PATCH /booking/2774` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":1}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 360 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2774` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 306 |

## Lỗi ghi nhận

- `Error: 1. DELETE /booking/X lần 2: 404 (không phải 405)`
- `Error: 2. PUT /booking/X (TD-04): 404 (không phải 405)`
- `Error: 3. PATCH /booking/X {"totalprice": 1}: 404 (không phải 405)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. DELETE /booking/X lần 2: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | 2. PUT /booking/X (TD-04): 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | 3. PATCH /booking/X {"totalprice": 1}: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| cleanup | #2774: không còn (GET 404) |
| requests | 12 request, đăng nhập thất bại 0 |
