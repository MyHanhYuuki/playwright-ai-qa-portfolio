# TC-011 totalprice âm bị từ chối 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-57
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-57
- **Thời điểm**: 2026-11-28T05:22:34.207Z
- **Số request**: 10 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1217 |

### totalprice -1

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-1","totalprice":-1,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 225 | `{"bookingid":857,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-1","totalprice":-1,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 301 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 19 | `[{"bookingid":857}]` | 407 |

### totalprice -100

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-100","totalprice":-100,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 229 | `{"bookingid":865,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-100","totalprice":-100,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 308 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 37 | `[{"bookingid":857},{"bookingid":865}]` | 309 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/857` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 197 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-1","totalprice":-1,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 402 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 400 |
| 3 | `DELETE /booking/857` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 311 |
| 4 | `GET /booking/865` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-100","totalprice":-100,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |
| 5 | `DELETE /booking/865` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 402 |

## Lỗi ghi nhận

- `Error: totalprice -1: HTTP 400`
- `Error: totalprice -1: không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: totalprice -100: HTTP 400`
- `Error: totalprice -100: không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | totalprice -1: 200 application/json; charset=utf-8 "{"bookingid":857,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-1","total" |
| phản hồi | totalprice -100: 200 application/json; charset=utf-8 "{"bookingid":865,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-011-am-100","tot" |
| cleanup | #857: DELETE 201 · #865: DELETE 201 |
| requests | 10 request, đăng nhập thất bại 0 |
