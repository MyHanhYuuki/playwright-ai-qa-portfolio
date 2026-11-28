# TC-066 Không có / sai thông tin xác thực cơ bản (4 kiểu × PUT, PATCH, DELETE): 403 và booking giữ nguyên

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-7 @security @put @patch @delete
- **Thời điểm**: 2026-11-28T05:27:27.187Z
- **Số request**: 21 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-066

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-066; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":3433,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1093 |

### 1. GET /booking/X lưu mốc (TD-27)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3433` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |

### v01 không có thông tin xác thực: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3433` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-066-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 322 |

### v01 không có thông tin xác thực: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3433` | Content-Type: application/json · Accept: application/json | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 388 |

### v01 không có thông tin xác thực: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3433` | – | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 320 |
| 2 | `GET /booking/3433` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 312 |

### v02 Cookie: token=wrongtoken123: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3433` | Content-Type: application/json · Accept: application/json · Cookie: token=wrongtoken123 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-066-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 308 |

### v02 Cookie: token=wrongtoken123: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3433` | Content-Type: application/json · Accept: application/json · Cookie: token=wrongtoken123 | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 257 |

### v02 Cookie: token=wrongtoken123: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3433` | Cookie: token=wrongtoken123 | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 346 |
| 2 | `GET /booking/3433` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 319 |

### v03 Cookie: token= (rỗng): PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3433` | Content-Type: application/json · Accept: application/json · Cookie: token= | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-066-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 394 |

### v03 Cookie: token= (rỗng): PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3433` | Content-Type: application/json · Accept: application/json · Cookie: token= | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 294 |

### v03 Cookie: token= (rỗng): DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3433` | Cookie: token= | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 334 |
| 2 | `GET /booking/3433` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 317 |

### v14 Authorization: Basic sai mật khẩu: PUT

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3433` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-066-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 290 |

### v14 Authorization: Basic sai mật khẩu: PATCH

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3433` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"totalprice":999}` | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 280 |

### v14 Authorization: Basic sai mật khẩu: DELETE

> 🔍 Cần xem: 403 Forbidden

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3433` | Authorization: Basic *** | (trống) | **403** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Forbidden` | 308 |
| 2 | `GET /booking/3433` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 260 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3433` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-066","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 267 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 361 |
| 3 | `DELETE /booking/3433` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 318 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | v01 không có thông tin xác thực: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v01 không có thông tin xác thực: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v01 không có thông tin xác thực: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v02 Cookie: token=wrongtoken123: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v02 Cookie: token=wrongtoken123: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v02 Cookie: token=wrongtoken123: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v03 Cookie: token= (rỗng): PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v03 Cookie: token= (rỗng): PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v03 Cookie: token= (rỗng): DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v14 Authorization: Basic *** mật khẩu: PUT: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v14 Authorization: Basic *** mật khẩu: PATCH: 403 text/plain; charset=utf-8 "Forbidden" |
| phản hồi | v14 Authorization: Basic *** mật khẩu: DELETE: 403 text/plain; charset=utf-8 "Forbidden" |
| cleanup | #3433: DELETE 201 |
| requests | 21 request, đăng nhập thất bại 0 |
