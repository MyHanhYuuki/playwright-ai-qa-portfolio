# TC-012 depositpaid JSON không phải boolean ("false", "true", "abc", 0, 1) ở POST: 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-42
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-42
- **Thời điểm**: 2026-11-28T05:22:42.117Z
- **Số request**: 22 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1216 |

### depositpaid "false" (TC-012-chuoi-false)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-false","totalprice":150,"depositpaid":"false","bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 232 | `{"bookingid":895,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-false","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 303 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 19 | `[{"bookingid":895}]` | 303 |

### depositpaid "true" (TC-012-chuoi-true)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-true","totalprice":150,"depositpaid":"true","bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 231 | `{"bookingid":902,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-true","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 309 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 37 | `[{"bookingid":895},{"bookingid":902}]` | 303 |

### depositpaid "abc" (TC-012-abc)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-abc","totalprice":150,"depositpaid":"abc","bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":908,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-abc","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 303 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 55 | `[{"bookingid":895},{"bookingid":902},{"bookingid":908}]` | 305 |

### depositpaid 0 (TC-012-0)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-0","totalprice":150,"depositpaid":0,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 223 | `{"bookingid":914,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-0","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 294 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 73 | `[{"bookingid":895},{"bookingid":902},{"bookingid":908},{"bookingid":914}]` | 320 |

### depositpaid 1 (TC-012-1)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-1","totalprice":150,"depositpaid":1,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":919,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-1","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 294 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 91 | `[{"bookingid":895},{"bookingid":902},{"bookingid":908},{"bookingid":914},{"bookingid":919}]` | 321 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/895` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 204 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-false","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 391 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 299 |
| 3 | `DELETE /booking/895` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 325 |
| 4 | `GET /booking/902` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 203 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-true","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 284 |
| 5 | `DELETE /booking/902` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 307 |
| 6 | `GET /booking/908` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-abc","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 308 |
| 7 | `DELETE /booking/908` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 393 |
| 8 | `GET /booking/914` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-0","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 312 |
| 9 | `DELETE /booking/914` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 312 |
| 10 | `GET /booking/919` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 194 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-1","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 301 |
| 11 | `DELETE /booking/919` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 330 |

## Lỗi ghi nhận

- `Error: depositpaid "false" (TC-012-chuoi-false): HTTP 400`
- `Error: depositpaid "false" (TC-012-chuoi-false): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: depositpaid "true" (TC-012-chuoi-true): HTTP 400`
- `Error: depositpaid "true" (TC-012-chuoi-true): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: depositpaid "abc" (TC-012-abc): HTTP 400`
- `Error: depositpaid "abc" (TC-012-abc): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: depositpaid 0 (TC-012-0): HTTP 400`
- `Error: depositpaid 0 (TC-012-0): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: depositpaid 1 (TC-012-1): HTTP 400`
- `Error: depositpaid 1 (TC-012-1): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | depositpaid "false" (TC-012-chuoi-false): 200 application/json; charset=utf-8 "{"bookingid":895,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-false"" |
| phản hồi | depositpaid "true" (TC-012-chuoi-true): 200 application/json; charset=utf-8 "{"bookingid":902,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-chuoi-true"," |
| phản hồi | depositpaid "abc" (TC-012-abc): 200 application/json; charset=utf-8 "{"bookingid":908,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-abc","totalp" |
| phản hồi | depositpaid 0 (TC-012-0): 200 application/json; charset=utf-8 "{"bookingid":914,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-0","totalpri" |
| phản hồi | depositpaid 1 (TC-012-1): 200 application/json; charset=utf-8 "{"bookingid":919,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-012-1","totalpri" |
| cleanup | #895: DELETE 201 · #902: DELETE 201 · #908: DELETE 201 · #914: DELETE 201 · #919: DELETE 201 |
| requests | 22 request, đăng nhập thất bại 0 |
