# TC-029 Luồng smoke: ping → tạo booking → auth → PATCH bằng token → xóa

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: cả 2 endpoint
- **Tags**: @AC-1 @AC-3 @AC-4 @smoke @auth @ping @booking
- **Thời điểm**: 2026-11-28T05:15:14.192Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. GET /ping

> 🔍 Cần xem: 201, text/plain, Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /ping` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 985 |

### 1. Tạo booking của test (TD-18)

> 🔍 Cần xem: firstname QA-RB101-<run>, lastname TC-029; 200, bookingid nguyên dương, đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Accept: application/json · Content-Type: application/json | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-029","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 219 | `{"bookingid":2187,"booking":{"firstname":"QA-RB101-20261128-051406","lastname":"TC-029","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}}` | 301 |

### 3. POST /auth → token T

> 🔍 Cần xem: 200, JSON, token là chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 306 |

### 4. PATCH /booking/<id> bằng T (TD-20)

> 🔍 Cần xem: 200, JSON; totalprice 303, additionalneeds Dinner, 5 giá trị còn lại không đổi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2187` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":303,"additionalneeds":"Dinner"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-029","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 302 |

### 5. GET /booking/<id>

> 🔍 Cần xem: 200, booking giống bước trước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2187` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-029","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 307 |

### 6. DELETE /booking/<id> bằng T

> 🔍 Cần xem: 201, text/plain, Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/2187` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 304 |

### 7. GET /booking/<id> sau khi xóa

> 🔍 Cần xem: 404, Not Found

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2187` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 520 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2187` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 397 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2187: không còn (GET 404) |
| requests | 8 request, đăng nhập thất bại 0 |
