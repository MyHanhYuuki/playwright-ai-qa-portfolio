# TC-002 additionalneeds là tùy chọn: không gửi hoặc gửi null vẫn tạo được, 6 giá trị còn lại đúng

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @get-id
- **Thời điểm**: 2026-11-28T05:21:47.630Z
- **Số request**: 9 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Biến thể 1: không gửi additionalneeds: POST /booking

> 🔍 Cần xem: 200, MSG-10; additionalneeds không có giá trị; 6 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-khong-gui","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"bookingid":436,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-khong-gui","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"}}}` | 1305 |

### Biến thể 1: không gửi additionalneeds: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/436` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 173 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-khong-gui","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"}}` | 299 |

### Biến thể 2: additionalneeds null: POST /booking

> 🔍 Cần xem: 200, MSG-10; additionalneeds không có giá trị; 6 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-null","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":null}` | **200** | content-type: application/json; charset=utf-8 · content-length: 219 | `{"bookingid":443,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-null","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":null}}` | 302 |

### Biến thể 2: additionalneeds null: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/443` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 191 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-null","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":null}` | 309 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/436` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 173 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-khong-gui","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"}}` | 501 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 319 |
| 3 | `DELETE /booking/436` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 404 |
| 4 | `GET /booking/443` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 191 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-002-null","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":null}` | 301 |
| 5 | `DELETE /booking/443` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 310 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #436: DELETE 201 · #443: DELETE 201 |
| requests | 9 request, đăng nhập thất bại 0 |
