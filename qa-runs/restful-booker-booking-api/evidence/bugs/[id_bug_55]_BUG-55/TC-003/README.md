# TC-003 additionalneeds khác chuỗi (số, object, mảng, boolean) bị từ chối 400, không tạo booking

- **Kết quả**: ❌ Failed · Bug: BUG-55
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-55
- **Thời điểm**: 2026-11-28T05:21:54.959Z
- **Số request**: 18 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1214 |

### additionalneeds 42 (TC-003-so)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-so","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":42}` | **200** | content-type: application/json; charset=utf-8 · content-length: 215 | `{"bookingid":478,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-so","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":42}}` | 308 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 19 | `[{"bookingid":478}]` | 736 |

### additionalneeds {"a":1} (TC-003-object)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-object","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":{"a":1}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":489,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-object","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":{"a":1}}}` | 287 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 37 | `[{"bookingid":478},{"bookingid":489}]` | 301 |

### additionalneeds ["x","y"] (TC-003-mang)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-mang","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":["x","y"]}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":494,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-mang","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":["x","y"]}}` | 306 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 55 | `[{"bookingid":478},{"bookingid":489},{"bookingid":494}]` | 309 |

### additionalneeds false (TC-003-boolean)

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-boolean","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":false}` | **200** | content-type: application/json; charset=utf-8 · content-length: 223 | `{"bookingid":500,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-boolean","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":false}}` | 292 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 73 | `[{"bookingid":478},{"bookingid":489},{"bookingid":494},{"bookingid":500}]` | 292 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/478` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-so","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":42}` | 388 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 319 |
| 3 | `DELETE /booking/478` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 299 |
| 4 | `GET /booking/489` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-object","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":{"a":1}}` | 306 |
| 5 | `DELETE /booking/489` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 320 |
| 6 | `GET /booking/494` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-mang","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":["x","y"]}` | 324 |
| 7 | `DELETE /booking/494` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 468 |
| 8 | `GET /booking/500` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-boolean","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":false}` | 332 |
| 9 | `DELETE /booking/500` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 458 |

## Lỗi ghi nhận

- `Error: additionalneeds 42 (TC-003-so): HTTP 400`
- `Error: additionalneeds 42 (TC-003-so): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: additionalneeds {"a":1} (TC-003-object): HTTP 400`
- `Error: additionalneeds {"a":1} (TC-003-object): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: additionalneeds ["x","y"] (TC-003-mang): HTTP 400`
- `Error: additionalneeds ["x","y"] (TC-003-mang): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: additionalneeds false (TC-003-boolean): HTTP 400`
- `Error: additionalneeds false (TC-003-boolean): không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | additionalneeds 42 (TC-003-so): 200 application/json; charset=utf-8 "{"bookingid":478,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-so","totalpr" |
| phản hồi | additionalneeds {"a":1} (TC-003-object): 200 application/json; charset=utf-8 "{"bookingid":489,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-object","tot" |
| phản hồi | additionalneeds ["x","y"] (TC-003-mang): 200 application/json; charset=utf-8 "{"bookingid":494,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-mang","total" |
| phản hồi | additionalneeds false (TC-003-boolean): 200 application/json; charset=utf-8 "{"bookingid":500,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-003-boolean","to" |
| cleanup | #478: DELETE 201 · #489: DELETE 201 · #494: DELETE 201 · #500: DELETE 201 |
| requests | 18 request, đăng nhập thất bại 0 |
