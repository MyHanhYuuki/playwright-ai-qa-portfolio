# TC-060 Accept application/xml: POST, GET /booking/:id, PUT trả XML đúng dữ liệu

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-8 @get-id @post @put
- **Thời điểm**: 2026-11-28T05:26:38.337Z
- **Số request**: 8 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST /booking, Accept: application/xml (TD-03)

> 🔍 Cần xem: 200; XML <created-booking>

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/xml | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-060","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: text/html; charset=utf-8 · content-length: 477 | `<?xml version='1.0'?> <created-booking>     <bookingid>3033</bookingid>     <booking>         <firstname>QA-RB102-261128052139-eq72</firstname>         <lastname>TC-060</lastname>         <totalprice>150</totalprice>         <depositpaid>false</depositpaid>         <bookingdates>             <checki… (tổng 477 byte)` | 905 |

### 2. GET /booking/X, Accept: application/xml

> 🔍 Cần xem: 200; XML <booking>

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3033` | Accept: application/xml | (trống) | **200** | content-type: text/html; charset=utf-8 · content-length: 364 | `<?xml version='1.0'?> <booking>     <firstname>QA-RB102-261128052139-eq72</firstname>     <lastname>TC-060</lastname>     <totalprice>150</totalprice>     <depositpaid>false</depositpaid>     <bookingdates>         <checkin>2031-01-10</checkin>         <checkout>2031-01-12</checkout>     </bookingda… (tổng 364 byte)` | 304 |

### GET /booking/X kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3033` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-060","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 312 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 298 |

### 3. PUT /booking/X (JSON), Accept: application/xml (TD-04)

> 🔍 Cần xem: 200; XML <booking>

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3033` | Content-Type: application/json · Accept: application/xml · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-060-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: text/html; charset=utf-8 · content-length: 376 | `<?xml version='1.0'?> <booking>     <firstname>QA-RB102-261128052139-eq72-moi</firstname>     <lastname>TC-060-moi</lastname>     <totalprice>275</totalprice>     <depositpaid>true</depositpaid>     <bookingdates>         <checkin>2032-02-01</checkin>         <checkout>2032-02-05</checkout>     </bo… (tổng 376 byte)` | 259 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3033` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-060-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 252 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 520 |
| 3 | `DELETE /booking/3033` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 286 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #3033: DELETE 201 |
| requests | 8 request, đăng nhập thất bại 0 |
