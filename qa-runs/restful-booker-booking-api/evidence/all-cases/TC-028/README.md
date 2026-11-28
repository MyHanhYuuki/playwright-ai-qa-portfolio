# TC-028 Accept application/xml với ký tự đặc biệt của XML: escape đúng, đọc ra đúng chuỗi đã gửi

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 2: GET /booking/:id
- **Tags**: @AC-8 @security @get-id
- **Thời điểm**: 2026-11-28T05:23:50.920Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-028

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-028; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-028","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"a<b & c]]>\"d'"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 227 | `{"bookingid":1567,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-028","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"a<b & c]]>\"d'"}}` | 907 |

### 1. GET /booking/X, Accept: application/xml

> 🔍 Cần xem: 200; XML gốc <booking>; escape đúng; đọc ra đúng chuỗi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1567` | Accept: application/xml | (trống) | **200** | content-type: text/html; charset=utf-8 · content-length: 378 | `<?xml version='1.0'?> <booking>     <firstname>QA-RB102-261128052139-eq72</firstname>     <lastname>TC-028</lastname>     <totalprice>150</totalprice>     <depositpaid>false</depositpaid>     <bookingdates>         <checkin>2031-01-10</checkin>         <checkout>2031-01-12</checkout>     </bookingda… (tổng 378 byte)` | 404 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1567` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 198 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-028","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"a<b & c]]>\"d'"}` | 302 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 310 |
| 3 | `DELETE /booking/1567` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 309 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1567: DELETE 201 |
| requests | 5 request, đăng nhập thất bại 0 |
