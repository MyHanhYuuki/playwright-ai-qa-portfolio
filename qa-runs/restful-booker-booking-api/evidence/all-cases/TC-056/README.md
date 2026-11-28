# TC-056 Phân vùng hợp lệ đọc lại đúng qua POST, PUT, PATCH (depositpaid true / false, giá nguyên, ngày hợp lệ)

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-1 @AC-4 @AC-5 @smoke @post @put @patch
- **Thời điểm**: 2026-11-28T05:26:17.043Z
- **Số request**: 18 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST A (depositpaid false, totalprice 150)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-056-a; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-056-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":2819,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-056-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1024 |

### 1. POST B (depositpaid true, totalprice 1)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-056-b; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-056-b","totalprice":1,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 221 | `{"bookingid":2822,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-056-b","totalprice":1,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 301 |

### 1. GET A

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2819` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-056-a","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 303 |

### 1. GET B

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2822` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-056-b","totalprice":1,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 308 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 277 |

### 2. PUT A (TD-04, depositpaid true)

> 🔍 Cần xem: 200; body và GET đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2819` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-a","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 203 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-a","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 329 |

### 2. PUT A (TD-04, depositpaid true): GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2819` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 203 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-a","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 277 |

### 3. PATCH A {"depositpaid": false}

> 🔍 Cần xem: 200; body và GET đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2819` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"depositpaid":false}` | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-a","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 253 |

### 3. PATCH A {"depositpaid": false}: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2819` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-a","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 258 |

### 2. PUT B (TD-04, depositpaid false, totalprice 99)

> 🔍 Cần xem: 200; body và GET đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2822` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-b","totalprice":99,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 203 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-b","totalprice":99,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 334 |

### 2. PUT B (TD-04, depositpaid false, totalprice 99): GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2822` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 203 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-b","totalprice":99,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 310 |

### 3. PATCH B {"totalprice": 300, "bookingdates": …}

> 🔍 Cần xem: 200; body và GET đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2822` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":300,"bookingdates":{"checkin":"2033-05-01","checkout":"2033-05-03"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-b","totalprice":300,"depositpaid":false,"bookingdates":{"checkin":"2033-05-01","checkout":"2033-05-03"},"additionalneeds":"Ăn sáng chay"}` | 302 |

### 3. PATCH B {"totalprice": 300, "bookingdates": …}: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2822` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-b","totalprice":300,"depositpaid":false,"bookingdates":{"checkin":"2033-05-01","checkout":"2033-05-03"},"additionalneeds":"Ăn sáng chay"}` | 316 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2819` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-a","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 306 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 305 |
| 3 | `DELETE /booking/2819` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 296 |
| 4 | `GET /booking/2822` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-056-b","totalprice":300,"depositpaid":false,"bookingdates":{"checkin":"2033-05-01","checkout":"2033-05-03"},"additionalneeds":"Ăn sáng chay"}` | 310 |
| 5 | `DELETE /booking/2822` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 305 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2819: DELETE 201 · #2822: DELETE 201 |
| requests | 18 request, đăng nhập thất bại 0 |
