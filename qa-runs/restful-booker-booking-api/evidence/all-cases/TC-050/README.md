# TC-050 PATCH totalprice: sai kiểu / null / 3 chữ số lẻ → 400; 2 chữ số lẻ (10.75) lưu đúng

- **Kết quả**: ❌ Failed · Bug: BUG-43
- **Nhóm**: Endpoint 5: PATCH /booking/:id
- **Tags**: @AC-5 @patch @get-id @BUG-43
- **Thời điểm**: 2026-11-28T05:25:40.156Z
- **Số request**: 34 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-050

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-050; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":2448,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 905 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 388 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 330 |

### PATCH {"totalprice": "abc"}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":"abc"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 289 |
| 2 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 307 |

### PATCH {"totalprice": "abc"}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 490 |
| 2 | `PUT /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 267 |

### PATCH {"totalprice": "abc"}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 261 |

### PATCH {"totalprice": "150"}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":"150"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 349 |
| 2 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 261 |

### PATCH {"totalprice": "150"}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 325 |
| 2 | `PUT /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 263 |

### PATCH {"totalprice": "150"}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 430 |

### PATCH {"totalprice": true}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":true}` | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 506 |
| 2 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 343 |

### PATCH {"totalprice": true}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 305 |
| 2 | `PUT /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 378 |

### PATCH {"totalprice": true}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |

### PATCH {"totalprice": null}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":null}` | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 260 |
| 2 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 290 |

### PATCH {"totalprice": null}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 272 |
| 2 | `PUT /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 392 |

### PATCH {"totalprice": null}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 260 |

### PATCH {"totalprice": 0.005}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":0.005}` | **200** | content-type: application/json; charset=utf-8 · content-length: 191 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 353 |
| 2 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 191 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 342 |

### PATCH {"totalprice": 0.005}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 324 |
| 2 | `PUT /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 539 |

### PATCH {"totalprice": 0.005}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":275,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 334 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 260 |

### 3. PATCH {"totalprice": 10.75} (hợp lệ)

> 🔍 Cần xem: 200; totalprice 10.75 ở body và GET; 6 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2448` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":10.75}` | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":10,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 344 |

### 3. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":10,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2448` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":10,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 292 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 393 |
| 3 | `DELETE /booking/2448` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 320 |

## Lỗi ghi nhận

- `Error: PATCH {"totalprice": "abc"}: 400`
- `Error: PATCH {"totalprice": "abc"}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"che`
- `Error: PATCH {"totalprice": "150"}: 400`
- `Error: PATCH {"totalprice": "150"}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":150,"depositpaid":false,"bookingdates":{"chec`
- `Error: PATCH {"totalprice": true}: 400`
- `Error: PATCH {"totalprice": true}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"che`
- `Error: PATCH {"totalprice": null}: 400`
- `Error: PATCH {"totalprice": null}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false,"bookingdates":{"che`
- `Error: PATCH {"totalprice": 0.005}: 400`
- `Error: PATCH {"totalprice": 0.005}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":0,"depositpaid":false,"bookingdates":{"checki`
- `Error: Bước 3: body: totalprice đúng 10.75 (không phải 10)`
- `Error: Bước 3: GET: totalprice đúng 10.75 (không phải 10)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PATCH {"totalprice": "abc"}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false," · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null," |
| phản hồi | PATCH {"totalprice": "150"}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":150,"depositpaid":false,"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":150,"" |
| phản hồi | PATCH {"totalprice": true}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false," · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null," |
| phản hồi | PATCH {"totalprice": null}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null,"depositpaid":false," · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":null," |
| phản hồi | PATCH {"totalprice": 0.005}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":0,"depositpaid":false,"bo" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-050","totalprice":0,"de" |
| cleanup | #2448: DELETE 201 |
| requests | 34 request, đăng nhập thất bại 0 |
