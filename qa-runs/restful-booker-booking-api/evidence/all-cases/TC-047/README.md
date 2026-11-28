# TC-047 PATCH một trường cấp 1 chỉ đổi trường đó, 6 giá trị còn lại giữ nguyên

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 5: PATCH /booking/:id
- **Tags**: @AC-5 @smoke @patch @get-id
- **Thời điểm**: 2026-11-28T05:25:19.272Z
- **Số request**: 14 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-047

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-047; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-047","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2308,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-047","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 3812 |

### GET /booking/X kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2308` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-047","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 713 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 452 |

### 1. PATCH {"firstname":"QA-RB102-261128052139-eq72-patch"}

> 🔍 Cần xem: 200, MSG-10; trường gửi có giá trị mới, 6 giá trị còn lại giữ như trước bước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2308` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-patch"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 457 |

### 1. PATCH {"firstname":"QA-RB102-261128052139-eq72-patch"}: GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2308` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 266 |

### 2. PATCH {"totalprice":200}

> 🔍 Cần xem: 200, MSG-10; trường gửi có giá trị mới, 6 giá trị còn lại giữ như trước bước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2308` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":200}` | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":200,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 259 |

### 2. PATCH {"totalprice":200}: GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2308` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":200,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 272 |

### 3. PATCH {"depositpaid":true}

> 🔍 Cần xem: 200, MSG-10; trường gửi có giá trị mới, 6 giá trị còn lại giữ như trước bước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2308` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"depositpaid":true}` | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":200,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 267 |

### 3. PATCH {"depositpaid":true}: GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2308` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":200,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 321 |

### 4. PATCH {"additionalneeds":"Lunch"}

> 🔍 Cần xem: 200, MSG-10; trường gửi có giá trị mới, 6 giá trị còn lại giữ như trước bước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2308` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"additionalneeds":"Lunch"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":200,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Lunch"}` | 299 |

### 4. PATCH {"additionalneeds":"Lunch"}: GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2308` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":200,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Lunch"}` | 286 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2308` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72-patch","lastname":"TC-047","totalprice":200,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Lunch"}` | 403 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 306 |
| 3 | `DELETE /booking/2308` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2308: DELETE 201 |
| requests | 14 request, đăng nhập thất bại 0 |
