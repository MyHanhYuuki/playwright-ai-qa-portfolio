# TC-065 PUT / PATCH / DELETE id không tồn tại (lớn, 0, âm, chữ) với quyền hợp lệ: 404

- **Kết quả**: ❌ Failed · Bug: BUG-52
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-4 @AC-5 @AC-6 @put @patch @delete @BUG-52
- **Thời điểm**: 2026-11-28T05:27:19.721Z
- **Số request**: 18 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### GET /booking/999999999

> 🔍 Cần xem: Phải 404 trước khi gửi request ghi (L17); khác 404 thì bỏ id này

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/999999999` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 903 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 403 |

### PUT /booking/999999999

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/999999999` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-065-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 303 |

### PATCH /booking/999999999

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/999999999` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":1}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 372 |

### DELETE /booking/999999999

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/999999999` | Cookie: token=*** | (trống) | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 265 |

### GET /booking/0

> 🔍 Cần xem: Phải 404 trước khi gửi request ghi (L17); khác 404 thì bỏ id này

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/0` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 293 |

### PUT /booking/0

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/0` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-065-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 298 |

### PATCH /booking/0

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/0` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":1}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 406 |

### DELETE /booking/0

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/0` | Cookie: token=*** | (trống) | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 311 |

### GET /booking/-1

> 🔍 Cần xem: Phải 404 trước khi gửi request ghi (L17); khác 404 thì bỏ id này

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/-1` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 278 |

### PUT /booking/-1

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/-1` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-065-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 287 |

### PATCH /booking/-1

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/-1` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":1}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 356 |

### DELETE /booking/-1

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/-1` | Cookie: token=*** | (trống) | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 307 |

### GET /booking/abc

> 🔍 Cần xem: Phải 404 trước khi gửi request ghi (L17); khác 404 thì bỏ id này

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/abc` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 254 |

### PUT /booking/abc

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/abc` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-065-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 379 |

### PATCH /booking/abc

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/abc` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"totalprice":1}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 254 |

### DELETE /booking/abc

> 🔍 Cần xem: 404 (BUG-52: đang 405)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/abc` | Cookie: token=*** | (trống) | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 274 |

### 5. GET /booking?firstname=<run>-moi&lastname=TC-065-moi

> 🔍 Cần xem: [] (PUT không tạo booking mới)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72-moi&lastname=TC-065-moi` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 254 |

## Lỗi ghi nhận

- `Error: PUT /booking/999999999: 404`
- `Error: PATCH /booking/999999999: 404`
- `Error: DELETE /booking/999999999: 404`
- `Error: PUT /booking/0: 404`
- `Error: PATCH /booking/0: 404`
- `Error: DELETE /booking/0: 404`
- `Error: PUT /booking/-1: 404`
- `Error: PATCH /booking/-1: 404`
- `Error: DELETE /booking/-1: 404`
- `Error: PUT /booking/abc: 404`
- `Error: PATCH /booking/abc: 404`
- `Error: DELETE /booking/abc: 404`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PUT /booking/999999999: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PATCH /booking/999999999: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | DELETE /booking/999999999: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PUT /booking/0: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PATCH /booking/0: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | DELETE /booking/0: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PUT /booking/-1: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PATCH /booking/-1: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | DELETE /booking/-1: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PUT /booking/abc: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PATCH /booking/abc: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | DELETE /booking/abc: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| requests | 18 request, đăng nhập thất bại 0 |
