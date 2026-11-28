# TC-029 Lọc firstname, lastname khớp chính xác, kết hợp là 'và', tham số lạ bị bỏ qua

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @smoke @get-list
- **Thời điểm**: 2026-11-28T05:23:57.364Z
- **Số request**: 15 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: A (lastname TC-029-a)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-029-a; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-029-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1586,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-029-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1204 |

### Chuẩn bị: B (lastname TC-029-b)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-029-b; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-029-b","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1589,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-029-b","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 305 |

### Chuẩn bị: C (firstname <run>-khac, lastname TC-029-a)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-029-a; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72-khac","lastname":"TC-029-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 229 | `{"bookingid":1591,"booking":{"firstname":"QA-RB102-261128052139-eq72-khac","lastname":"TC-029-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 396 |

### 1. firstname=<run>&lastname=TC-029-a

> 🔍 Cần xem: firstname=QA-RB102-261128052139-eq72&lastname=TC-029-a

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-029-a` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1586}]` | 516 |

### 2. lastname=TC-029-b

> 🔍 Cần xem: lastname=TC-029-b

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?lastname=TC-029-b` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1589}]` | 326 |

### 3. firstname=<run>

> 🔍 Cần xem: firstname=QA-RB102-261128052139-eq72

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 39 | `[{"bookingid":1586},{"bookingid":1589}]` | 390 |

### 4. firstname=<run>-khac&lastname=TC-029-b

> 🔍 Cần xem: firstname=QA-RB102-261128052139-eq72-khac&lastname=TC-029-b

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72-khac&lastname=TC-029-b` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 307 |

### 5. firstname=<run>&lastname=TC-029-a&foo=bar

> 🔍 Cần xem: firstname=QA-RB102-261128052139-eq72&lastname=TC-029-a&foo=bar

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-029-a&foo=bar` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1586}]` | 305 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1586` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-029-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 298 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 619 |
| 3 | `DELETE /booking/1586` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 309 |
| 4 | `GET /booking/1589` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-029-b","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |
| 5 | `DELETE /booking/1589` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 409 |
| 6 | `GET /booking/1591` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 200 | `{"firstname":"QA-RB102-261128052139-eq72-khac","lastname":"TC-029-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 298 |
| 7 | `DELETE /booking/1591` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 408 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1586: DELETE 201 · #1589: DELETE 201 · #1591: DELETE 201 |
| requests | 15 request, đăng nhập thất bại 0 |
