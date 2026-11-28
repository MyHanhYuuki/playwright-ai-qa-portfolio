# TC-031 Lọc tên tiếng Việt có dấu và dấu cách (mã hóa %20 và +): tìm được booking

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list
- **Thời điểm**: 2026-11-28T05:24:04.430Z
- **Số request**: 6 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-031

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-031; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72 Nguyễn Văn","lastname":"TC-031","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 236 | `{"bookingid":1677,"booking":{"firstname":"QA-RB102-261128052139-eq72 Nguyễn Văn","lastname":"TC-031","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 951 |

### 1. dấu cách mã hóa %20

> 🔍 Cần xem: firstname=QA-RB102-261128052139-eq72%20Nguy%E1%BB%85n%20V%C4%83n&lastname=TC-031 → [{"bookingid": X}]

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72%20Nguy%E1%BB%85n%20V%C4%83n&lastname=TC-031` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1677}]` | 366 |

### 2. dấu cách mã hóa '+'

> 🔍 Cần xem: firstname=QA-RB102-261128052139-eq72+Nguy%E1%BB%85n+V%C4%83n&lastname=TC-031 → [{"bookingid": X}]

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72+Nguy%E1%BB%85n+V%C4%83n&lastname=TC-031` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1677}]` | 361 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1677` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 207 | `{"firstname":"QA-RB102-261128052139-eq72 Nguyễn Văn","lastname":"TC-031","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 257 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 285 |
| 3 | `DELETE /booking/1677` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 409 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1677: DELETE 201 |
| requests | 6 request, đăng nhập thất bại 0 |
