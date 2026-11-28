# TC-054 DELETE hợp lệ (Cookie) trả 201 'Created', sau đó booking không còn và không sống lại

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 6: DELETE /booking/:id
- **Tags**: @AC-6 @smoke @delete @get-id
- **Thời điểm**: 2026-11-28T05:26:06.122Z
- **Số request**: 21 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-054

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-054; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-054","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2710,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-054","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 873 |

### 1. GET /booking/X kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2710` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-054","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 415 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 267 |

### 2. DELETE /booking/X (Cookie token)

> 🔍 Cần xem: 201, text/plain; charset=utf-8, body Created (MSG-03)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/2710` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 438 |

### 3. GET /booking/X

> 🔍 Cần xem: 404, Not Found

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 332 |

### 4. GET /booking?firstname=<run>&lastname=TC-054

> 🔍 Cần xem: []

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-054` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 307 |

### 5. GET /booking (không lọc)

> 🔍 Cần xem: 200, không có {"bookingid": X}

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 33855 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 33855 byte)` | 704 |

### 6. DELETE lần 2

> 🔍 Cần xem: Trước: GET X phải 404 (id chưa bị người khác dùng); không 2xx; GET sau vẫn 404

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 296 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 303 |
| 3 | `DELETE /booking/2710` | Cookie: token=*** | (trống) | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 306 |
| 4 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 310 |

### 6. PUT TD-04 (lastname TC-054-moi)

> 🔍 Cần xem: Trước: GET X phải 404 (id chưa bị người khác dùng); không 2xx; GET sau vẫn 404

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 271 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 286 |
| 3 | `PUT /booking/2710` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-054-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 375 |
| 4 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 293 |

### 6. PATCH {"totalprice": 1}

> 🔍 Cần xem: Trước: GET X phải 404 (id chưa bị người khác dùng); không 2xx; GET sau vẫn 404

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 302 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 340 |
| 3 | `PATCH /booking/2710` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":1}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 272 |
| 4 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 256 |

### 7. GET /booking?firstname=<run>-moi&lastname=TC-054-moi

> 🔍 Cần xem: [] (booking không sống lại)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72-moi&lastname=TC-054-moi` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 359 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2710` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 340 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 6. DELETE lần 2: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | 6. PUT TD-04 (lastname TC-054-moi): 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | 6. PATCH {"totalprice": 1}: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| cleanup | #2710: không còn (GET 404) |
| requests | 21 request, đăng nhập thất bại 0 |
