# TC-030 Lọc tên khác hoa thường, khớp một phần, có khoảng trắng đầu, giá trị rỗng: trả []

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list
- **Thời điểm**: 2026-11-28T05:24:01.775Z
- **Số request**: 10 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: tạo booking TC-030

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-030; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-030","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":1646,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-030","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1209 |

### 0. Đối chứng: firstname=<run>&lastname=TC-030

> 🔍 Cần xem: Đúng [{"bookingid": X}] (booking có thật, bước sau mới có nghĩa)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-030` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":1646}]` | 303 |

### 1. firstname viết thường

> 🔍 Cần xem: 200, MSG-10, body '[]'

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=qa-rb102-261128052139-eq72&lastname=TC-030` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 404 |

### 2. firstname bỏ ký tự cuối

> 🔍 Cần xem: 200, MSG-10, body '[]'

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq7&lastname=TC-030` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 306 |

### 3. firstname có %20 ở đầu

> 🔍 Cần xem: 200, MSG-10, body '[]'

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=%20QA-RB102-261128052139-eq72&lastname=TC-030` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 605 |

### 4. firstname= (rỗng)

> 🔍 Cần xem: 200, MSG-10, mảng JSON; không có X; id trả về (nếu có) đều có firstname rỗng; không trả toàn bộ danh sách

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 316 |

### 5. lastname tc-030 (viết thường)

> 🔍 Cần xem: 200, MSG-10, body '[]'

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=tc-030` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 311 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1646` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-030","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 292 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 313 |
| 3 | `DELETE /booking/1646` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 307 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| firstname= rỗng | 0 phần tử; đọc 0: firstname === '' đúng 0, sai 0, không đọc được 0; không kiểm (≤ 3 phần tử) |
| cleanup | #1646: DELETE 201 |
| requests | 10 request, đăng nhập thất bại 0 |
