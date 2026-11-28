# TC-013 Ngày sai định dạng / không tồn tại / năm 10000 ở POST: 400, không lưu 0NaN-aN-aN hay ngày bị cuộn

- **Kết quả**: ❌ Failed · Bug: BUG-44
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @full @BUG-44
- **Thời điểm**: 2026-11-28T05:22:54.075Z
- **Số request**: 34 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1009 |

### 1. checkin '15/01/2031', checkout '2031-01-12'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"15/01/2031","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 223 | `{"bookingid":964,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 371 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 19 | `[{"bookingid":964}]` | 305 |

### 2. checkin '10/01/2031', checkout '2031-01-12'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"10/01/2031","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 223 | `{"bookingid":972,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-10-01","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 305 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 37 | `[{"bookingid":964},{"bookingid":972}]` | 303 |

### 3. checkin 'abc', checkout '2031-01-12'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"abc","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 223 | `{"bookingid":979,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 307 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 55 | `[{"bookingid":964},{"bookingid":972},{"bookingid":979}]` | 308 |

### 4. checkin '', checkout '2031-01-12'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 223 | `{"bookingid":985,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 605 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 73 | `[{"bookingid":964},{"bookingid":972},{"bookingid":979},{"bookingid":985}]` | 315 |

### 5. checkin '2031-02-30', checkout '2031-03-05'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-5","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-02-30","checkout":"2031-03-05"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 223 | `{"bookingid":994,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-5","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-03-02","checkout":"2031-03-05"},"additionalneeds":"Breakfast"}}` | 295 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 91 | `[{"bookingid":964},{"bookingid":972},{"bookingid":979},{"bookingid":985},{"bookingid":994}]` | 351 |

### 6. checkin '2046-04-31', checkout '2046-05-05'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-6","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2046-04-31","checkout":"2046-05-05"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1001,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-6","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2046-05-01","checkout":"2046-05-05"},"additionalneeds":"Breakfast"}}` | 278 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 110 | `[{"bookingid":964},{"bookingid":972},{"bookingid":979},{"bookingid":985},{"bookingid":994},{"bookingid":1001}]` | 291 |

### 7. checkin '2031-13-45', checkout '2031-01-12'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-7","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-13-45","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1007,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-7","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 301 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 129 | `[{"bookingid":964},{"bookingid":972},{"bookingid":979},{"bookingid":985},{"bookingid":994},{"bookingid":1001},{"bookingid":1007}]` | 300 |

### 8. checkin '2031-01-10', checkout '10000-01-01'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-8","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"10000-01-01"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1014,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-8","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"0000-01-01"},"additionalneeds":"Breakfast"}}` | 357 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 148 | `[{"bookingid":964},{"bookingid":972},{"bookingid":979},{"bookingid":985},{"bookingid":994},{"bookingid":1001},{"bookingid":1007},{"bookingid":1014}]` | 361 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/964` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 471 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 307 |
| 3 | `DELETE /booking/964` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 311 |
| 4 | `GET /booking/972` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-10-01","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 302 |
| 5 | `DELETE /booking/972` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |
| 6 | `GET /booking/979` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 311 |
| 7 | `DELETE /booking/979` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |
| 8 | `GET /booking/985` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 299 |
| 9 | `DELETE /booking/985` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 308 |
| 10 | `GET /booking/994` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-5","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-03-02","checkout":"2031-03-05"},"additionalneeds":"Breakfast"}` | 316 |
| 11 | `DELETE /booking/994` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 298 |
| 12 | `GET /booking/1001` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-6","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2046-05-01","checkout":"2046-05-05"},"additionalneeds":"Breakfast"}` | 313 |
| 13 | `DELETE /booking/1001` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |
| 14 | `GET /booking/1007` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-7","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 307 |
| 15 | `DELETE /booking/1007` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 308 |
| 16 | `GET /booking/1014` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-8","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"0000-01-01"},"additionalneeds":"Breakfast"}` | 426 |
| 17 | `DELETE /booking/1014` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 288 |

## Lỗi ghi nhận

- `Error: 1. checkin '15/01/2031', checkout '2031-01-12': HTTP 400`
- `Error: 1. checkin '15/01/2031', checkout '2031-01-12': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 1. checkin '15/01/2031', checkout '2031-01-12': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`
- `Error: 2. checkin '10/01/2031', checkout '2031-01-12': HTTP 400`
- `Error: 2. checkin '10/01/2031', checkout '2031-01-12': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 2. checkin '10/01/2031', checkout '2031-01-12': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`
- `Error: 3. checkin 'abc', checkout '2031-01-12': HTTP 400`
- `Error: 3. checkin 'abc', checkout '2031-01-12': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 3. checkin 'abc', checkout '2031-01-12': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`
- `Error: 4. checkin '', checkout '2031-01-12': HTTP 400`
- `Error: 4. checkin '', checkout '2031-01-12': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 4. checkin '', checkout '2031-01-12': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`
- `Error: 5. checkin '2031-02-30', checkout '2031-03-05': HTTP 400`
- `Error: 5. checkin '2031-02-30', checkout '2031-03-05': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 5. checkin '2031-02-30', checkout '2031-03-05': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`
- `Error: 6. checkin '2046-04-31', checkout '2046-05-05': HTTP 400`
- `Error: 6. checkin '2046-04-31', checkout '2046-05-05': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 6. checkin '2046-04-31', checkout '2046-05-05': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`
- `Error: 7. checkin '2031-13-45', checkout '2031-01-12': HTTP 400`
- `Error: 7. checkin '2031-13-45', checkout '2031-01-12': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 7. checkin '2031-13-45', checkout '2031-01-12': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`
- `Error: 8. checkin '2031-01-10', checkout '10000-01-01': HTTP 400`
- `Error: 8. checkin '2031-01-10', checkout '10000-01-01': không tạo booking (TD-28: S1 \ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`
- `Error: 8. checkin '2031-01-10', checkout '10000-01-01': không lưu ngày hỏng / bị cuộn (0NaN-aN-aN, 2031-03-02, 2046-05-01, 0000-01-01, 2031-10-01)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. checkin '15/01/2031', checkout '2031-01-12': 200 application/json; charset=utf-8 "{"bookingid":964,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-1","totalpri" |
| phản hồi | 2. checkin '10/01/2031', checkout '2031-01-12': 200 application/json; charset=utf-8 "{"bookingid":972,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-2","totalpri" |
| phản hồi | 3. checkin 'abc', checkout '2031-01-12': 200 application/json; charset=utf-8 "{"bookingid":979,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-3","totalpri" |
| phản hồi | 4. checkin '', checkout '2031-01-12': 200 application/json; charset=utf-8 "{"bookingid":985,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-4","totalpri" |
| phản hồi | 5. checkin '2031-02-30', checkout '2031-03-05': 200 application/json; charset=utf-8 "{"bookingid":994,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-5","totalpri" |
| phản hồi | 6. checkin '2046-04-31', checkout '2046-05-05': 200 application/json; charset=utf-8 "{"bookingid":1001,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-6","totalpr" |
| phản hồi | 7. checkin '2031-13-45', checkout '2031-01-12': 200 application/json; charset=utf-8 "{"bookingid":1007,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-7","totalpr" |
| phản hồi | 8. checkin '2031-01-10', checkout '10000-01-01': 200 application/json; charset=utf-8 "{"bookingid":1014,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-013-8","totalpr" |
| cleanup | #964: DELETE 201 · #972: DELETE 201 · #979: DELETE 201 · #985: DELETE 201 · #994: DELETE 201 · #1001: DELETE 201 · #1007: DELETE 201 · #1014: DELETE 201 |
| requests | 34 request, đăng nhập thất bại 0 |
