# TC-009 totalprice số lẻ: tối đa 2 chữ số lẻ lưu đúng, 3 chữ số lẻ bị từ chối

- **Kết quả**: ❌ Failed · Bug: BUG-43
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @get-id @BUG-43
- **Thời điểm**: 2026-11-28T05:22:22.075Z
- **Số request**: 16 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1544 |

### Biến thể 99.99

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-99-99","totalprice":99.99,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 226 | `{"bookingid":716,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-99-99","totalprice":99,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 472 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 19 | `[{"bookingid":716}]` | 262 |

### Biến thể 0.01

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-01","totalprice":0.01,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":722,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-01","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 345 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 37 | `[{"bookingid":716},{"bookingid":722}]` | 403 |

### Biến thể 0.005

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-005","totalprice":0.005,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 225 | `{"bookingid":733,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-005","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 340 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 55 | `[{"bookingid":716},{"bookingid":722},{"bookingid":733}]` | 377 |

### Biến thể 99.99: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/716` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-99-99","totalprice":99,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 298 |

### Biến thể 0.01: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/722` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-01","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 303 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/716` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-99-99","totalprice":99,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 260 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 341 |
| 3 | `DELETE /booking/716` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 307 |
| 4 | `GET /booking/722` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-01","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 307 |
| 5 | `DELETE /booking/722` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 356 |
| 6 | `GET /booking/733` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 197 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-005","totalprice":0,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 466 |
| 7 | `DELETE /booking/733` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 353 |

## Lỗi ghi nhận

- `Error: Biến thể 99.99: body trả về: totalprice đúng 99.99`
- `Error: Biến thể 99.99: GET: totalprice đúng 99.99`
- `Error: Biến thể 0.01: body trả về: totalprice đúng 0.01`
- `Error: Biến thể 0.01: GET: totalprice đúng 0.01`
- `Error: Biến thể 0.005: HTTP 400`
- `Error: Biến thể 0.005: không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | Biến thể 99.99: 200 application/json; charset=utf-8 "{"bookingid":716,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-99-99","tota" |
| phản hồi | Biến thể 0.01: 200 application/json; charset=utf-8 "{"bookingid":722,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-01","total" |
| phản hồi | Biến thể 0.005: 200 application/json; charset=utf-8 "{"bookingid":733,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-009-0-005","tota" |
| cleanup | #716: DELETE 201 · #722: DELETE 201 · #733: DELETE 201 |
| requests | 16 request, đăng nhập thất bại 0 |
