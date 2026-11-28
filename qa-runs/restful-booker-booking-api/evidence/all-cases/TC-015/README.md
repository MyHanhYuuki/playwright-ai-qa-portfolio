# TC-015 Ngày hợp lệ đặc biệt (29/02 năm nhuận, năm 0001, năm 9999, quá khứ) được nhận và đọc lại đúng

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @get-id
- **Thời điểm**: 2026-11-28T05:23:06.174Z
- **Số request**: 17 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. 2032-02-29 → 2032-03-01

> 🔍 Cần xem: POST 200, GET 200, ngày đúng nguyên văn, 5 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2032-02-29","checkout":"2032-03-01"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1127,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2032-02-29","checkout":"2032-03-01"},"additionalneeds":"Breakfast"}}` | 1391 |

### 1. 2032-02-29 → 2032-03-01: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1127` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2032-02-29","checkout":"2032-03-01"},"additionalneeds":"Breakfast"}` | 311 |

### 2. 0001-01-01 → 0001-01-02

> 🔍 Cần xem: POST 200, GET 200, ngày đúng nguyên văn, 5 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0001-01-01","checkout":"0001-01-02"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1135,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0001-01-01","checkout":"0001-01-02"},"additionalneeds":"Breakfast"}}` | 314 |

### 2. 0001-01-01 → 0001-01-02: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1135` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0001-01-01","checkout":"0001-01-02"},"additionalneeds":"Breakfast"}` | 792 |

### 3. 9999-12-30 → 9999-12-31

> 🔍 Cần xem: POST 200, GET 200, ngày đúng nguyên văn, 5 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"9999-12-30","checkout":"9999-12-31"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1144,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"9999-12-30","checkout":"9999-12-31"},"additionalneeds":"Breakfast"}}` | 256 |

### 3. 9999-12-30 → 9999-12-31: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1144` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"9999-12-30","checkout":"9999-12-31"},"additionalneeds":"Breakfast"}` | 272 |

### 4. 1999-01-01 → 1999-01-05

> 🔍 Cần xem: POST 200, GET 200, ngày đúng nguyên văn, 5 giá trị còn lại đúng TD-03

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"1999-01-01","checkout":"1999-01-05"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1147,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"1999-01-01","checkout":"1999-01-05"},"additionalneeds":"Breakfast"}}` | 303 |

### 4. 1999-01-01 → 1999-01-05: GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1147` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"1999-01-01","checkout":"1999-01-05"},"additionalneeds":"Breakfast"}` | 267 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1127` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-1","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2032-02-29","checkout":"2032-03-01"},"additionalneeds":"Breakfast"}` | 262 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 383 |
| 3 | `DELETE /booking/1127` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 304 |
| 4 | `GET /booking/1135` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-2","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"0001-01-01","checkout":"0001-01-02"},"additionalneeds":"Breakfast"}` | 307 |
| 5 | `DELETE /booking/1135` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 307 |
| 6 | `GET /booking/1144` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-3","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"9999-12-30","checkout":"9999-12-31"},"additionalneeds":"Breakfast"}` | 324 |
| 7 | `DELETE /booking/1144` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 289 |
| 8 | `GET /booking/1147` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-015-4","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"1999-01-01","checkout":"1999-01-05"},"additionalneeds":"Breakfast"}` | 306 |
| 9 | `DELETE /booking/1147` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 325 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1127: DELETE 201 · #1135: DELETE 201 · #1144: DELETE 201 · #1147: DELETE 201 |
| requests | 17 request, đăng nhập thất bại 0 |
