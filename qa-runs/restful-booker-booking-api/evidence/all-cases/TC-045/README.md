# TC-045 PUT depositpaid không phải boolean ("false", 0): 400, booking giữ nguyên

- **Kết quả**: ❌ Failed · Bug: BUG-42
- **Nhóm**: Endpoint 4: PUT /booking/:id
- **Tags**: @AC-4 @put @get-id @BUG-42
- **Thời điểm**: 2026-11-28T05:25:04.835Z
- **Số request**: 13 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-045

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-045; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-045","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2193,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-045","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1376 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2193` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-045","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 309 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 758 |

### PUT depositpaid "false"

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2193` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":"false","bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 665 |
| 2 | `GET /booking/2193` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 266 |

### PUT depositpaid "false": khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 291 |
| 2 | `PUT /booking/2193` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-045","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-045","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 309 |

### PUT depositpaid "false": khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2193` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-045","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 347 |

### PUT depositpaid 0

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2193` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":0,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 206 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 411 |
| 2 | `GET /booking/2193` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 206 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 366 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2193` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 206 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 300 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 346 |
| 3 | `DELETE /booking/2193` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 308 |

## Lỗi ghi nhận

- `Error: PUT depositpaid "false": 400`
- `Error: PUT depositpaid "false": GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":true,"bookingdates"`
- `Error: PUT depositpaid 0: 400`
- `Error: PUT depositpaid 0: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid":false,"bookingdates`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PUT depositpaid "false": 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalpric" |
| phản hồi | PUT depositpaid 0: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalprice":275,"depositpaid"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-045-moi","totalpric" |
| cleanup | #2193: DELETE 201 |
| requests | 13 request, đăng nhập thất bại 0 |
