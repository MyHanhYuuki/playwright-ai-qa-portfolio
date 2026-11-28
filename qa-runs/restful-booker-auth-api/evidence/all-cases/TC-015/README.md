# TC-015 Body URL-encoded được cấp token và token đó dùng được

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-1 @AC-3 @auth @booking
- **Thời điểm**: 2026-11-28T05:14:36.815Z
- **Số request**: 7 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. Tạo booking của test (TD-18)

> 🔍 Cần xem: firstname QA-RB101-<run>, lastname TC-015; 200, bookingid nguyên dương, đúng 7 giá trị

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Accept: application/json · Content-Type: application/json | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-015","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 219 | `{"bookingid":1858,"booking":{"firstname":"QA-RB101-20261128-051406","lastname":"TC-015","totalprice":101,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Breakfast"}}` | 858 |

### 2. POST /auth URL-encoded (TD-13)

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | – | `form: username=admin&password=***` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 325 |

### 3. PATCH bằng token URL-encoded (TD-20)

> 🔍 Cần xem: 200, JSON; totalprice 303, additionalneeds Dinner, 5 giá trị còn lại không đổi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/1858` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":303,"additionalneeds":"Dinner"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-015","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 313 |

### 4. GET /booking/<id>

> 🔍 Cần xem: 200, booking giống bước trước

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1858` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-015","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 294 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1858` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 187 | `{"firstname":"QA-RB101-20261128-051406","lastname":"TC-015","totalprice":303,"depositpaid":true,"bookingdates":{"checkin":"2031-05-01","checkout":"2031-05-03"},"additionalneeds":"Dinner"}` | 306 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 314 |
| 3 | `DELETE /booking/1858` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 297 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1858: DELETE 201 |
| requests | 7 request, đăng nhập thất bại 0 |
