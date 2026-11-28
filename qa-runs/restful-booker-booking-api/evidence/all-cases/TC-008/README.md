# TC-008 totalprice sai kiểu (chuỗi chữ, chuỗi số, boolean) ở POST: 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-43
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-43
- **Thời điểm**: 2026-11-28T05:22:15.274Z
- **Số request**: 14 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1107 |

### totalprice "abc" (TC-008-chu)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chu","totalprice":"abc","depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 226 | `{"bookingid":668,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chu","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 312 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 19 | `[{"bookingid":668}]` | 304 |

### totalprice "150" (TC-008-chuoi-so)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chuoi-so","totalprice":"150","depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":675,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chuoi-so","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 296 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 37 | `[{"bookingid":668},{"bookingid":675}]` | 302 |

### totalprice true (TC-008-boolean)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-boolean","totalprice":true,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":680,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-boolean","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 304 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 55 | `[{"bookingid":668},{"bookingid":675},{"bookingid":680}]` | 260 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/668` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chu","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 451 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 313 |
| 3 | `DELETE /booking/668` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 301 |
| 4 | `GET /booking/675` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 202 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chuoi-so","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 299 |
| 5 | `DELETE /booking/675` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 327 |
| 6 | `GET /booking/680` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 202 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-boolean","totalprice":null,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 391 |
| 7 | `DELETE /booking/680` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 314 |

## Lỗi ghi nhận

- `Error: totalprice "abc" (TC-008-chu): HTTP 400`
- `Error: totalprice "abc" (TC-008-chu): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: totalprice "150" (TC-008-chuoi-so): HTTP 400`
- `Error: totalprice "150" (TC-008-chuoi-so): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: totalprice true (TC-008-boolean): HTTP 400`
- `Error: totalprice true (TC-008-boolean): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | totalprice "abc" (TC-008-chu): 200 application/json; charset=utf-8 "{"bookingid":668,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chu","totalp" |
| phản hồi | totalprice "150" (TC-008-chuoi-so): 200 application/json; charset=utf-8 "{"bookingid":675,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-chuoi-so","t" |
| phản hồi | totalprice true (TC-008-boolean): 200 application/json; charset=utf-8 "{"bookingid":680,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-008-boolean","to" |
| cleanup | #668: DELETE 201 · #675: DELETE 201 · #680: DELETE 201 |
| requests | 14 request, đăng nhập thất bại 0 |
