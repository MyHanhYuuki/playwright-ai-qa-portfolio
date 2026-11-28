# TC-023 Token cũ vẫn dùng được sau khi đã cấp token mới (cùng chu kỳ reset)

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-3 @auth @booking
- **Thời điểm**: 2026-11-28T05:15:01.598Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. Tạo booking của test (TD-18)

> 🔍 Cần xem: firstname QA-RB101-<run>, lastname TC-023; 200, bookingid nguyên dương, đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Accept: application/json · Content-Type: application/json | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-023","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 219 | `{"bookingid":2076,"booking":{"firstname":"QA-RB101-20261128-051406","lastname":"TC-023","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}}` | 1207 |

### 2. POST /auth → T1

> 🔍 Cần xem: 200, JSON, token là chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 345 |

### 3. POST /auth → T2

> 🔍 Cần xem: 200, JSON, token là chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 363 |

### 4. PATCH bằng token cũ T1

> 🔍 Cần xem: 200, JSON; totalprice 303, additionalneeds Dinner, 5 giá trị còn lại không đổi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2076` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":303,"additionalneeds":"Dinner"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-023","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 305 |

### 5. GET /booking/<id>

> 🔍 Cần xem: 200, booking giống bước trước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2076` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-023","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 308 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2076` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-023","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 304 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 412 |
| 3 | `DELETE /booking/2076` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 302 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2076: DELETE 201 |
| requests | 8 request, đăng nhập thất bại 0 |
