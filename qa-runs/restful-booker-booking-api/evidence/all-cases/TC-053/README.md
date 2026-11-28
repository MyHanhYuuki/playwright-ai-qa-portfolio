# TC-053 PATCH firstname / lastname thành null, rỗng, chỉ khoảng trắng: 400, booking giữ nguyên

- **Kết quả**: ❌ Failed · Bug: BUG-55
- **Nhóm**: Endpoint 5: PATCH /booking/:id
- **Tags**: @AC-5 @patch @get-id @BUG-55
- **Thời điểm**: 2026-11-28T05:25:58.415Z
- **Số request**: 18 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-053

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-053; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 246 | `{"bookingid":2651,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}}` | 975 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2651` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 217 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 296 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 257 |

### PATCH {"firstname": null}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2651` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":null}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":null,"lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 286 |
| 2 | `GET /booking/2651` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":null,"lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 365 |

### PATCH {"firstname": null}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 346 |
| 2 | `PUT /booking/2651` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 217 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 305 |

### PATCH {"firstname": null}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2651` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 217 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 297 |

### PATCH {"lastname": ""}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2651` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"lastname":""}` | **200** | content-type: application/json; charset=utf-8 · content-length: 211 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 365 |
| 2 | `GET /booking/2651` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 211 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 256 |

### PATCH {"lastname": ""}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 273 |
| 2 | `PUT /booking/2651` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 217 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 276 |

### PATCH {"lastname": ""}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2651` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 217 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 381 |

### PATCH {"firstname": "   "}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2651` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"   "}` | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"   ","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 393 |
| 2 | `GET /booking/2651` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"   ","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 264 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2651` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"   ","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"QA-RB102-261128052139-eq72-TC-053"}` | 258 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 301 |
| 3 | `DELETE /booking/2651` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |

## Lỗi ghi nhận

- `Error: PATCH {"firstname": null}: 400`
- `Error: PATCH {"firstname": null}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":null,"lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","check`
- `Error: PATCH {"lastname": ""}: 400`
- `Error: PATCH {"lastname": ""}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"`
- `Error: PATCH {"firstname": "   "}: 400`
- `Error: PATCH {"firstname": "   "}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"   ","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","chec`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PATCH {"firstname": null}: 200 application/json; charset=utf-8 "{"firstname":null,"lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin"" · booking ĐỔI: GET 200 "{"firstname":null,"lastname":"TC-053","totalprice":150,"depositpaid":false,"book" |
| phản hồi | PATCH {"lastname": ""}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"depositpaid":false,"bookin" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"","totalprice":150,"deposi" |
| phản hồi | PATCH {"firstname": "   "}: 200 application/json; charset=utf-8 "{"firstname":"   ","lastname":"TC-053","totalprice":150,"depositpaid":false,"bookingdates":{"checkin" · booking ĐỔI: GET 200 "{"firstname":"   ","lastname":"TC-053","totalprice":150,"depositpaid":false,"boo" |
| cleanup | #2651: DELETE 201 |
| requests | 18 request, đăng nhập thất bại 0 |
