# TC-063 Id sai định dạng có tiền tố số: GET 404; PUT, PATCH, DELETE không đụng tới booking

- **Kết quả**: ❌ Failed · Bug: BUG-54
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-2 @AC-4 @AC-5 @AC-6 @security @get-id @put @patch @delete @BUG-54
- **Thời điểm**: 2026-11-28T05:26:58.511Z
- **Số request**: 20 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-063

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-063; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":3183,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 902 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3183` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 310 |

### 2. GET /booking/X.9

> 🔍 Cần xem: 404, Not Found, không trả booking X

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3183.9` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 401 |

### 2. GET /booking/Xabc

> 🔍 Cần xem: 404, Not Found, không trả booking X

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3183abc` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 281 |

### 2. GET /booking/00X

> 🔍 Cần xem: 404, Not Found, không trả booking X

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/003183` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 335 |

### 2. GET /booking/X.5

> 🔍 Cần xem: 404, Not Found, không trả booking X

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3183.5` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 322 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 363 |

### 3. PUT /booking/00X (TD-04)

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/003183` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-063-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-063-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 339 |
| 2 | `GET /booking/3183` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-063-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 389 |

### 3. PUT /booking/00X (TD-04): khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 252 |
| 2 | `PUT /booking/3183` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 308 |

### 3. PUT /booking/00X (TD-04): khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3183` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 448 |

### 3. PATCH /booking/Xabc {"totalprice": 999}

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3183abc` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":999}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":999,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 343 |
| 2 | `GET /booking/3183` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":999,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 323 |

### 3. PATCH /booking/Xabc {"totalprice": 999}: khôi phục mốc

> 🔍 Cần xem: Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 272 |
| 2 | `PUT /booking/3183` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 329 |

### 3. PATCH /booking/Xabc {"totalprice": 999}: khôi phục mốc: mốc mới

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3183` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 294 |

### 3. DELETE /booking/X.9

> 🔍 Cần xem: Mong đợi bị từ chối; GET sau đó giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3183.9` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 257 |
| 2 | `GET /booking/3183` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 271 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3183` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 258 |

## Lỗi ghi nhận

- `Error: 2. GET /booking/X.9: 404`
- `Error: 2. GET /booking/X.9: body Not Found (MSG-01), không trả booking X`
- `Error: 2. GET /booking/Xabc: 404`
- `Error: 2. GET /booking/Xabc: body Not Found (MSG-01), không trả booking X`
- `Error: 2. GET /booking/00X: 404`
- `Error: 2. GET /booking/00X: body Not Found (MSG-01), không trả booking X`
- `Error: 2. GET /booking/X.5: 404`
- `Error: 2. GET /booking/X.5: body Not Found (MSG-01), không trả booking X`
- `Error: 3. PUT /booking/00X (TD-04): 404`
- `Error: 3. PUT /booking/00X (TD-04): GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-063-moi","totalprice":275,"depositpaid":true,"bookingdates"`
- `Error: 3. PATCH /booking/Xabc {"totalprice": 999}: 404`
- `Error: 3. PATCH /booking/Xabc {"totalprice": 999}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 200 {"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":999,"depositpaid":false,"bookingdates":{"chec`
- `Error: 3. DELETE /booking/X.9: 404`
- `Error: 3. DELETE /booking/X.9: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET 404 Not Found`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 2. GET /booking/X.9: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"" |
| phản hồi | 2. GET /booking/Xabc: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"" |
| phản hồi | 2. GET /booking/00X: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"" |
| phản hồi | 2. GET /booking/X.5: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":150,"depositpaid":false,"" |
| phản hồi | 3. PUT /booking/00X (TD-04): 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-063-moi","totalprice":275,"depositpaid"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-063-moi","totalpric" |
| phản hồi | 3. PATCH /booking/Xabc {"totalprice": 999}: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":999,"depositpaid":false,"" · booking ĐỔI: GET 200 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-063","totalprice":999,"" |
| phản hồi | 3. DELETE /booking/X.9: 201 text/plain; charset=utf-8 "Created" · booking ĐỔI: GET 404 "Not Found" |
| cleanup | #3183: không còn (GET 404) |
| requests | 20 request, đăng nhập thất bại 0 |
