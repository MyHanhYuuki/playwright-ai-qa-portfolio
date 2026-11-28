# TC-022 Đối chứng âm AC-3: token abc123 và token bị sửa bị từ chối 403, booking không đổi

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-3 @security @auth @booking
- **Thời điểm**: 2026-11-28T05:14:58.013Z
- **Số request**: 19 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. Tạo booking của test (TD-18)

> 🔍 Cần xem: firstname QA-RB101-<run>, lastname TC-022; 200, bookingid nguyên dương, đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Accept: application/json · Content-Type: application/json | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 219 | `{"bookingid":2006,"booking":{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}}` | 896 |

### 2. Lấy token mới ngay trước khi dùng

> 🔍 Cần xem: 200, JSON, token là chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 321 |

### 3. PUT với token abc123

> 🔍 Cần xem: Mã 403, text/plain, body Forbidden; GET sau đó: booking không đổi (TD-18)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2006` | Content-Type: application/json · Accept: application/json · Cookie: token=abc123 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":202,"depositpaid":false,"bookingdates":{"checkin":"2031-06-10","checkout":"2031-06-12"},"additionalneeds":"Late checkout"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 493 |
| 2 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 190 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | 315 |

### 3. PUT với token T' (token vừa cấp đổi ký tự cuối)

> 🔍 Cần xem: Mã 403, text/plain, body Forbidden; GET sau đó: booking không đổi (TD-18)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2006` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":202,"depositpaid":false,"bookingdates":{"checkin":"2031-06-10","checkout":"2031-06-12"},"additionalneeds":"Late checkout"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 391 |
| 2 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 190 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | 304 |

### 3. PATCH với token abc123

> 🔍 Cần xem: Mã 403, text/plain, body Forbidden; GET sau đó: booking không đổi (TD-18)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2006` | Content-Type: application/json · Accept: application/json · Cookie: token=abc123 | `{"totalprice":303,"additionalneeds":"Dinner"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 541 |
| 2 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 190 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | 375 |

### 3. PATCH với token T' (token vừa cấp đổi ký tự cuối)

> 🔍 Cần xem: Mã 403, text/plain, body Forbidden; GET sau đó: booking không đổi (TD-18)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2006` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":303,"additionalneeds":"Dinner"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 303 |
| 2 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 190 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | 316 |

### 3. DELETE với token abc123

> 🔍 Cần xem: Mã 403, text/plain, body Forbidden; GET sau đó: booking không đổi (TD-18)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/2006` | Content-Type: application/json · Accept: application/json · Cookie: token=abc123 | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 396 |
| 2 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 190 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | 304 |

### 3. DELETE với token T' (token vừa cấp đổi ký tự cuối)

> 🔍 Cần xem: Mã 403, text/plain, body Forbidden; GET sau đó: booking không đổi (TD-18)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/2006` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 305 |
| 2 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 190 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | 413 |

### 4. Đối chứng dương: PATCH với token T (L15)

> 🔍 Cần xem: 200, JSON; totalprice 303, additionalneeds Dinner, 5 giá trị còn lại không đổi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2006` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":303,"additionalneeds":"Dinner"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 402 |

### 5. GET /booking/<id>

> 🔍 Cần xem: 200, booking giống bước trước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 352 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2006` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-022","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 259 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 404 |
| 3 | `DELETE /booking/2006` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 305 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2006: DELETE 201 |
| requests | 19 request, đăng nhập thất bại 0 |
