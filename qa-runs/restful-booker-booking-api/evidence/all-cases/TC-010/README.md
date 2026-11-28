# TC-010 Biên totalprice hợp lệ (0, 1, -0, 1e20) được nhận và đọc lại đúng; 2^53 + 1 chỉ ghi nhận

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @get-id
- **Thời điểm**: 2026-11-28T05:22:29.794Z
- **Số request**: 21 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. totalprice 0

> 🔍 Cần xem: POST 200, GET 200, totalprice đọc lại 0

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-0","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 221 | `{"bookingid":770,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-0","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 897 |

### 1. totalprice 0: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/770` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-0","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 248 |

### 2. totalprice 1

> 🔍 Cần xem: POST 200, GET 200, totalprice đọc lại 1

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1","totalprice":1,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 221 | `{"bookingid":776,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1","totalprice":1,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 306 |

### 2. totalprice 1: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/776` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1","totalprice":1,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |

### 3. totalprice -0

> 🔍 Cần xem: POST 200, GET 200, totalprice đọc lại 0

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-am-0","totalprice":-0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":781,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-am-0","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 273 |

### 3. totalprice -0: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/781` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-am-0","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 304 |

### 4. totalprice 1e20

> 🔍 Cần xem: POST 200, GET 200, totalprice đọc lại 100000000000000000000

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1e20","totalprice":1e20,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 244 | `{"bookingid":787,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1e20","totalprice":100000000000000000000,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 340 |

### 4. totalprice 1e20: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/787` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 216 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1e20","totalprice":100000000000000000000,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 372 |

### 5. totalprice 9007199254740993 (2^53 + 1)

> 🔍 Cần xem: POST 200; chỉ ghi annotation giá trị đọc lại (Q2 e)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-2mu53","totalprice":9007199254740993,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 240 | `{"bookingid":795,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-2mu53","totalprice":9007199254740992,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 301 |

### 5. totalprice 9007199254740993 (2^53 + 1): GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/795` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 212 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-2mu53","totalprice":9007199254740992,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 349 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/770` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-0","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 292 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 310 |
| 3 | `DELETE /booking/770` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 517 |
| 4 | `GET /booking/776` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1","totalprice":1,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 313 |
| 5 | `DELETE /booking/776` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 294 |
| 6 | `GET /booking/781` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-am-0","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 401 |
| 7 | `DELETE /booking/781` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 413 |
| 8 | `GET /booking/787` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 216 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-1e20","totalprice":100000000000000000000,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 430 |
| 9 | `DELETE /booking/787` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 290 |
| 10 | `GET /booking/795` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 212 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-010-2mu53","totalprice":9007199254740992,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 299 |
| 11 | `DELETE /booking/795` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 399 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| totalprice đọc lại (2^53 + 1) | 9007199254740992 |
| cleanup | #770: DELETE 201 · #776: DELETE 201 · #781: DELETE 201 · #787: DELETE 201 · #795: DELETE 201 |
| requests | 21 request, đăng nhập thất bại 0 |
