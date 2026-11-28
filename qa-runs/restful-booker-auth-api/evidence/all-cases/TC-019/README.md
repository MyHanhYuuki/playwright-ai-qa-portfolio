# TC-019 AC-3: token vừa cấp dùng được cho PUT booking tự tạo

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-3 @auth @booking
- **Thời điểm**: 2026-11-28T05:14:45.112Z
- **Số request**: 7 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. Tạo booking của test (TD-18)

> 🔍 Cần xem: firstname QA-RB101-<run>, lastname TC-019; 200, bookingid nguyên dương, đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Accept: application/json · Content-Type: application/json | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-019","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 219 | `{"bookingid":1926,"booking":{"firstname":"QA-RB101-20261128-051406","lastname":"TC-019","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}}` | 1006 |

### 2. Lấy token mới ngay trước khi dùng

> 🔍 Cần xem: 200, JSON, token là chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 429 |

### 3. PUT /booking/<id> bằng token (TD-19)

> 🔍 Cần xem: 200, JSON, body bằng đúng 7 giá trị TD-19

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/1926` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-019","totalprice":202,"depositpaid":false,"bookingdates":{"checkin":"2031-06-10","checkout":"2031-06-12"},"additionalneeds":"Late checkout"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-019","totalprice":202,"depositpaid":false,"bookingdates":{"checkin":"2031-06-10","checkout":"2031-06-12"},"additionalneeds":"Late checkout"}` | 378 |

### 4. GET /booking/<id>

> 🔍 Cần xem: 200, booking giống bước trước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1926` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-019","totalprice":202,"depositpaid":false,"bookingdates":{"checkin":"2031-06-10","checkout":"2031-06-12"},"additionalneeds":"Late checkout"}` | 305 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1926` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-019","totalprice":202,"depositpaid":false,"bookingdates":{"checkin":"2031-06-10","checkout":"2031-06-12"},"additionalneeds":"Late checkout"}` | 304 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 308 |
| 3 | `DELETE /booking/1926` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 304 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1926: DELETE 201 |
| requests | 7 request, đăng nhập thất bại 0 |
