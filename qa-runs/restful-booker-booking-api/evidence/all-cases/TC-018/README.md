# TC-018 Chuỗi hợp lệ đa dạng (tiếng Việt, emoji, HTML, nháy, dấu \) lưu và đọc lại nguyên văn

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @get-id
- **Thời điểm**: 2026-11-28T05:23:22.739Z
- **Số request**: 9 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. Tiếng Việt + emoji

> 🔍 Cần xem: POST 200, GET 200; lastname, additionalneeds giống từng ký tự; 5 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 Nguyễn Thị Hồng","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Ăn sáng chay 🍜"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 254 | `{"bookingid":1302,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 Nguyễn Thị Hồng","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Ăn sáng chay 🍜"}}` | 1206 |

### 1. Tiếng Việt + emoji: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1302` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 225 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 Nguyễn Thị Hồng","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Ăn sáng chay 🍜"}` | 514 |

### 2. HTML + nháy + dấu \

> 🔍 Cần xem: POST 200, GET 200; lastname, additionalneeds giống từng ký tự; 5 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 <script>alert(1)</script>","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"O'Brien \"Jr\" a\\b"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 258 | `{"bookingid":1311,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 <script>alert(1)</script>","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"O'Brien \"Jr\" a\\b"}}` | 396 |

### 2. HTML + nháy + dấu \: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1311` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 229 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 <script>alert(1)</script>","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"O'Brien \"Jr\" a\\b"}` | 394 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1302` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 225 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 Nguyễn Thị Hồng","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Ăn sáng chay 🍜"}` | 320 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 306 |
| 3 | `DELETE /booking/1302` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 318 |
| 4 | `GET /booking/1311` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 229 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-018 <script>alert(1)</script>","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"O'Brien \"Jr\" a\\b"}` | 382 |
| 5 | `DELETE /booking/1311` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 313 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1302: DELETE 201 · #1311: DELETE 201 |
| requests | 9 request, đăng nhập thất bại 0 |
