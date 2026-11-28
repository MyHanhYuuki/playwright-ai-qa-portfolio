# TC-052 PATCH ngày không hợp lệ: 400, booking giữ nguyên, không lưu 0NaN-aN-aN

- **Kết quả**: ❌ Failed · Bug: BUG-44
- **Nhóm**: Endpoint 5: PATCH /booking/:id
- **Tags**: @AC-5 @patch @get-id @BUG-44
- **Thời điểm**: 2026-11-28T05:25:52.159Z
- **Số request**: 18 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-052

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-052; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2600,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 900 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2600` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 272 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 254 |

### PATCH {"bookingdates": {"checkin":"abc","checkout":"2031-01-12"}}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2600` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"bookingdates":{"checkin":"abc","checkout":"2031-01-12"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 258 |
| 2 | `GET /booking/2600` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 299 |

### PATCH {"bookingdates": {"checkin":"abc","checkout":"2031-01-12"}}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 372 |
| 2 | `PUT /booking/2600` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 327 |

### PATCH {"bookingdates": {"checkin":"abc","checkout":"2031-01-12"}}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2600` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 405 |

### PATCH {"bookingdates": {"checkin":"2031-02-30","checkout":"2031-03-05"}}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2600` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"bookingdates":{"checkin":"2031-02-30","checkout":"2031-03-05"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-03-02","checkout":"2031-03-05"},"additionalneeds":"Breakfast"}` | 309 |
| 2 | `GET /booking/2600` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-03-02","checkout":"2031-03-05"},"additionalneeds":"Breakfast"}` | 334 |

### PATCH {"bookingdates": {"checkin":"2031-02-30","checkout":"2031-03-05"}}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 315 |
| 2 | `PUT /booking/2600` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 276 |

### PATCH {"bookingdates": {"checkin":"2031-02-30","checkout":"2031-03-05"}}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2600` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 299 |

### PATCH {"bookingdates": {"checkin":"2031-01-10","checkout":"10000-01-01"}}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2600` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"bookingdates":{"checkin":"2031-01-10","checkout":"10000-01-01"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"0000-01-01"},"additionalneeds":"Breakfast"}` | 305 |
| 2 | `GET /booking/2600` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"0000-01-01"},"additionalneeds":"Breakfast"}` | 305 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2600` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"0000-01-01"},"additionalneeds":"Breakfast"}` | 303 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 299 |
| 3 | `DELETE /booking/2600` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 311 |

## Lỗi ghi nhận

- `Error: PATCH {"bookingdates": {"checkin":"abc","checkout":"2031-01-12"}}: 400`
- `Error: PATCH {"bookingdates": {"checkin":"abc","checkout":"2031-01-12"}}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"chec`
- `Error: PATCH {"bookingdates": {"checkin":"abc","checkout":"2031-01-12"}}: GET không có ngày hỏng / cuộn (0NaN-aN-aN, 2031-03-02, 0000-01-01)`
- `Error: PATCH {"bookingdates": {"checkin":"2031-02-30","checkout":"2031-03-05"}}: 400`
- `Error: PATCH {"bookingdates": {"checkin":"2031-02-30","checkout":"2031-03-05"}}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"chec`
- `Error: PATCH {"bookingdates": {"checkin":"2031-02-30","checkout":"2031-03-05"}}: GET không có ngày hỏng / cuộn (0NaN-aN-aN, 2031-03-02, 0000-01-01)`
- `Error: PATCH {"bookingdates": {"checkin":"2031-01-10","checkout":"10000-01-01"}}: 400`
- `Error: PATCH {"bookingdates": {"checkin":"2031-01-10","checkout":"10000-01-01"}}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"bookingdates":{"chec`
- `Error: PATCH {"bookingdates": {"checkin":"2031-01-10","checkout":"10000-01-01"}}: GET không có ngày hỏng / cuộn (0NaN-aN-aN, 2031-03-02, 0000-01-01)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PATCH {"bookingdates": {"checkin":"abc","checkout":"2031-01-12"}}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"" |
| phản hồi | PATCH {"bookingdates": {"checkin":"2031-02-30","checkout":"2031-03-05"}}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"" |
| phản hồi | PATCH {"bookingdates": {"checkin":"2031-01-10","checkout":"10000-01-01"}}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"depositpaid":false,"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-052","totalprice":150,"" |
| cleanup | #2600: DELETE 201 |
| requests | 18 request, đăng nhập thất bại 0 |
