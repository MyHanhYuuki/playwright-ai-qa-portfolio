# TC-057 Body urlencoded (depositpaid=true) cho POST, PUT, PATCH: đọc lại đúng từng trường

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-1 @AC-4 @AC-5 @AC-8 @post @put @patch
- **Thời điểm**: 2026-11-28T05:26:20.936Z
- **Số request**: 10 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST /booking urlencoded (TD-20, depositpaid=true)

> 🔍 Cần xem: 200; 7 giá trị đúng TD-03 trừ depositpaid true

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/x-www-form-urlencoded · Accept: application/json | `firstname=QA-RB102-261128052139-eq72&lastname=TC-057&totalprice=150&depositpaid=true&bookingdates%5Bcheckin%5D=2031-01-10&bookingdates%5Bcheckout%5D=2031-01-12&additionalneeds=Breakfast` | **200** | content-type: application/json; charset=utf-8 · content-length: 221 | `{"bookingid":2873,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-057","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1110 |

### 1. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2873` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-057","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 300 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 302 |

### 2. PUT /booking/X urlencoded (TD-04, depositpaid=true)

> 🔍 Cần xem: 200; 7 giá trị đúng TD-04

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2873` | Content-Type: application/x-www-form-urlencoded · Accept: application/json · Cookie: token=*** | `firstname=QA-RB102-261128052139-eq72-moi&lastname=TC-057-moi&totalprice=275&depositpaid=true&bookingdates%5Bcheckin%5D=2032-02-01&bookingdates%5Bcheckout%5D=2032-02-05&additionalneeds=%C4%82n%20s%C3%A1ng%20chay` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-057-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 307 |

### 2. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2873` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-057-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 308 |

### 3. PATCH /booking/X urlencoded 'totalprice=310'

> 🔍 Cần xem: 200; totalprice 310 (number), 6 giá trị còn lại như bước 2

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2873` | Content-Type: application/x-www-form-urlencoded · Accept: application/json · Cookie: token=*** | `totalprice=310` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-057-moi","totalprice":310,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 310 |

### 3. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2873` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-057-moi","totalprice":310,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 302 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2873` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-057-moi","totalprice":310,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 321 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 301 |
| 3 | `DELETE /booking/2873` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 301 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2873: DELETE 201 |
| requests | 10 request, đăng nhập thất bại 0 |
