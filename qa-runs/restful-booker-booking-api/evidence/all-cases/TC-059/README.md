# TC-059 Content-Type text/xml (body XML, depositpaid true): POST tạo, PUT / PATCH sửa, đọc lại đúng từng trường

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-8 @AC-1 @AC-4 @AC-5 @post @put @patch
- **Thời điểm**: 2026-11-28T05:26:35.160Z
- **Số request**: 10 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST /booking text/xml (TD-19, depositpaid true)

> 🔍 Cần xem: 200 JSON; 7 giá trị đúng (totalprice number 150, depositpaid boolean true)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: text/xml · Accept: application/json | `<booking><firstname>QA-RB102-261128052139-eq72</firstname><lastname>TC-059</lastname><totalprice>150</totalprice><depositpaid>true</depositpaid><bookingdates><checkin>2031-01-10</checkin><checkout>2031-01-12</checkout></bookingdates><additionalneeds>Breakfast</additionalneeds></booking>` | **200** | content-type: application/json; charset=utf-8 · content-length: 221 | `{"bookingid":3001,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-059","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1108 |

### 1. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3001` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 192 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-059","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 300 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 305 |

### 2. PUT /booking/X text/xml (TD-04)

> 🔍 Cần xem: 200 JSON; 7 giá trị đúng TD-04

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3001` | Content-Type: text/xml · Accept: application/json · Cookie: token=*** | `<booking><firstname>QA-RB102-261128052139-eq72-moi</firstname><lastname>TC-059-moi</lastname><totalprice>275</totalprice><depositpaid>true</depositpaid><bookingdates><checkin>2032-02-01</checkin><checkout>2032-02-05</checkout></bookingdates><additionalneeds>Ăn sáng chay</additionalneeds></booking>` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-059-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 306 |

### 2. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3001` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-059-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 305 |

### 3. PATCH /booking/X text/xml '<booking><totalprice>310</totalprice></booking>'

> 🔍 Cần xem: 200 JSON; totalprice 310, 6 giá trị như bước 2

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3001` | Content-Type: text/xml · Accept: application/json · Cookie: token=*** | `<booking><totalprice>310</totalprice></booking>` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-059-moi","totalprice":310,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 306 |

### 3. GET /booking/X

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3001` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-059-moi","totalprice":310,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 457 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3001` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-059-moi","totalprice":310,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 256 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 253 |
| 3 | `DELETE /booking/3001` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 252 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #3001: DELETE 201 |
| requests | 10 request, đăng nhập thất bại 0 |
