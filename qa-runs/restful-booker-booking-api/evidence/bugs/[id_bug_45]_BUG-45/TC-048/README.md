# TC-048 PATCH một trường con của bookingdates giữ nguyên trường con còn lại

- **Kết quả**: ❌ Failed · Bug: BUG-45
- **Nhóm**: Endpoint 5: PATCH /booking/:id
- **Tags**: @AC-5 @patch @get-id @BUG-45
- **Thời điểm**: 2026-11-28T05:25:24.289Z
- **Số request**: 14 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: X1 (lastname TC-048-checkin)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-048-checkin; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkin","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":2369,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkin","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1009 |

### Chuẩn bị: X2 (lastname TC-048-checkout)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-048-checkout; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkout","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 231 | `{"bookingid":2373,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkout","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 296 |

### GET X1 kiểm chủ sở hữu

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2369` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkin","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 317 |

### GET X2 kiểm chủ sở hữu

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2373` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 202 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkout","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 294 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 305 |

### PATCH {"bookingdates": {"checkin": "2031-01-11"}}

> 🔍 Cần xem: 200; checkin mới, checkout giữ nguyên

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2369` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"bookingdates":{"checkin":"2031-01-11"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkin","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-11","checkout":"0NaN-aN-aN"},"additionalneeds":"Breakfast"}` | 302 |

### PATCH {"bookingdates": {"checkin": "2031-01-11"}}: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2369` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkin","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-11","checkout":"0NaN-aN-aN"},"additionalneeds":"Breakfast"}` | 403 |

### PATCH {"bookingdates": {"checkout": "2031-01-20"}}

> 🔍 Cần xem: 200; checkout mới, checkin giữ nguyên

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2373` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"bookingdates":{"checkout":"2031-01-20"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 202 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkout","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-20"},"additionalneeds":"Breakfast"}` | 319 |

### PATCH {"bookingdates": {"checkout": "2031-01-20"}}: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2373` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 202 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkout","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-20"},"additionalneeds":"Breakfast"}` | 295 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2369` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkin","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-11","checkout":"0NaN-aN-aN"},"additionalneeds":"Breakfast"}` | 313 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 291 |
| 3 | `DELETE /booking/2369` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 256 |
| 4 | `GET /booking/2373` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 202 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-048-checkout","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-20"},"additionalneeds":"Breakfast"}` | 256 |
| 5 | `DELETE /booking/2373` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 301 |

## Lỗi ghi nhận

- `Error: PATCH {"bookingdates": {"checkin": "2031-01-11"}}: body trả về: checkout giữ nguyên '2031-01-12' (không phải 0NaN-aN-aN)`
- `Error: PATCH {"bookingdates": {"checkin": "2031-01-11"}}: GET: checkout giữ nguyên '2031-01-12' (không phải 0NaN-aN-aN)`
- `Error: PATCH {"bookingdates": {"checkout": "2031-01-20"}}: body trả về: checkin giữ nguyên '2031-01-10' (không phải 0NaN-aN-aN)`
- `Error: PATCH {"bookingdates": {"checkout": "2031-01-20"}}: GET: checkin giữ nguyên '2031-01-10' (không phải 0NaN-aN-aN)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #2369: DELETE 201 · #2373: DELETE 201 |
| requests | 14 request, đăng nhập thất bại 0 |
