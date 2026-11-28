# TC-064 PUT / PATCH có bookingid trong body bị bỏ qua: booking giữ id, booking kia không đổi

- **Kết quả**: ❌ Failed · Bug: BUG-51
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-4 @AC-5 @security @put @patch @BUG-51
- **Thời điểm**: 2026-11-28T05:27:13.462Z
- **Số request**: 43 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị PUT: X (lastname TC-064-put-x)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-064-put-x; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-x","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 228 | `{"bookingid":3251,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-x","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1272 |

### Chuẩn bị PUT: Y (lastname TC-064-put-y)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-064-put-y; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 228 | `{"bookingid":3255,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 291 |

### PUT 1. GET X, GET Y ngay trước request (L17)

> 🔍 Cần xem: Cả hai đúng firstname <run> + lastname của biến thể; lưu mốc Y

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3251` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-x","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 313 |
| 2 | `GET /booking/3255` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 399 |
| 3 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 521 |

### PUT 2. PUT /booking/X với "bookingid": Y

> 🔍 Cần xem: 200, body không có bookingid; X nhận dữ liệu mới; Y giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3251` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-x-moi","totalprice":333,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast","bookingid":3255}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 476 |

### PUT 3. GET X, GET Y

> 🔍 Cần xem: X: dữ liệu mới; Y: giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3251` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 657 |
| 2 | `GET /booking/3255` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 203 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-x-moi","totalprice":333,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 336 |

### PUT 4. Lọc theo tên mới của X và tên của Y

> 🔍 Cần xem: firstname=<run> + lastname (tên lần chạy để không lẫn booking của lần chạy khác)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-put-x-moi` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":3255}]` | 249 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-put-y` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":3255}]` | 251 |

### Chuẩn bị PATCH: X (lastname TC-064-patch-x)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-064-patch-x; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-x","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":3279,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-x","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 256 |

### Chuẩn bị PATCH: Y (lastname TC-064-patch-y)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-064-patch-y; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":3282,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 250 |

### PATCH 1. GET X, GET Y ngay trước request (L17)

> 🔍 Cần xem: Cả hai đúng firstname <run> + lastname của biến thể; lưu mốc Y

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3279` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-x","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 249 |
| 2 | `GET /booking/3282` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 254 |
| 3 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 269 |

### PATCH 2. PATCH /booking/X với "bookingid": Y

> 🔍 Cần xem: 200, body không có bookingid; X nhận dữ liệu mới; Y giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3279` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"lastname":"TC-064-patch-x-moi","bookingid":3282}` | **405** | content-type: text/plain; charset=utf-8 · content-length: 18 | `Method Not Allowed` | 347 |

### PATCH 3. GET X, GET Y

> 🔍 Cần xem: X: dữ liệu mới; Y: giống hệt mốc

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3279` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 384 |
| 2 | `GET /booking/3282` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-x-moi","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 266 |

### PATCH 4. Lọc theo tên mới của X và tên của Y

> 🔍 Cần xem: firstname=<run> + lastname (tên lần chạy để không lẫn booking của lần chạy khác)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-patch-x-moi` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":3282}]` | 251 |
| 2 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-patch-y` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 20 | `[{"bookingid":3282}]` | 319 |

### Dọn dẹp BUG-51 (lưu ý 2)

> 🔍 Cần xem: Mỗi id: GET → đúng chủ sở hữu → DELETE, lặp tới 404 (tối đa 5); rồi tìm theo lastname, xóa bản sót

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3251` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 307 |
| 2 | `GET /booking/3255` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 203 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-x-moi","totalprice":333,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 306 |
| 3 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 315 |
| 4 | `DELETE /booking/3255` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 299 |
| 5 | `GET /booking/3255` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 199 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-put-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 270 |
| 6 | `DELETE /booking/3255` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 347 |
| 7 | `GET /booking/3255` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 301 |
| 8 | `GET /booking/3279` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 306 |
| 9 | `GET /booking/3282` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-x-moi","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 309 |
| 10 | `DELETE /booking/3282` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 303 |
| 11 | `GET /booking/3282` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-064-patch-y","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 323 |
| 12 | `DELETE /booking/3282` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 368 |
| 13 | `GET /booking/3282` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 315 |
| 14 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-put-x` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 321 |
| 15 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-put-y` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 306 |
| 16 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-put-x-moi` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 308 |
| 17 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-patch-x` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 307 |
| 18 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-patch-y` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 307 |
| 19 | `GET /booking?firstname=QA-RB102-261128052139-eq72&lastname=TC-064-patch-x-moi` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 288 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3251` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 408 |
| 2 | `GET /booking/3255` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 317 |
| 3 | `GET /booking/3279` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 305 |
| 4 | `GET /booking/3282` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 299 |

## Lỗi ghi nhận

- `Error: PUT: 200`
- `Error: PUT: body trả về là booking, không có khóa bookingid`
- `Error: PUT: GET X 200 (X giữ id)`
- `Error: PUT: GET X có dữ liệu mới`
- `Error: PUT: GET Y 200 và giống hệt mốc Y`
- `Error: PUT: lọc tên mới của X → đúng [{"bookingid": X}]`
- `Error: PATCH: 200`
- `Error: PATCH: body trả về là booking, không có khóa bookingid`
- `Error: PATCH: GET X 200 (X giữ id)`
- `Error: PATCH: GET X có dữ liệu mới`
- `Error: PATCH: GET Y 200 và giống hệt mốc Y`
- `Error: PATCH: lọc tên mới của X → đúng [{"bookingid": X}]`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | PUT 2. PUT /booking/X với "bookingid": Y: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| phản hồi | PATCH 2. PATCH /booking/X với "bookingid": Y: 405 text/plain; charset=utf-8 "Method Not Allowed" |
| cleanup BUG-51 | #3251: hết (sau 0 lần xóa) · #3255: hết (sau 2 lần xóa) · #3279: hết (sau 0 lần xóa) · #3282: hết (sau 2 lần xóa) |
| cleanup | #3251: không còn (GET 404) · #3255: không còn (GET 404) · #3279: không còn (GET 404) · #3282: không còn (GET 404) |
| requests | 43 request, đăng nhập thất bại 0 |
