# TC-058 depositpaid false gửi bằng body urlencoded / XML phải lưu false (POST, PUT, PATCH)

- **Kết quả**: ❌ Failed · Bug: BUG-42
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-1 @AC-4 @AC-5 @AC-8 @post @put @patch @BUG-42
- **Thời điểm**: 2026-11-28T05:26:31.274Z
- **Số request**: 29 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST urlencoded depositpaid=false

> 🔍 Cần xem: 200; depositpaid false (boolean)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/x-www-form-urlencoded · Accept: application/json | `firstname=QA-RB102-261128052139-eq72&lastname=TC-058-ue-post&totalprice=150&depositpaid=false&bookingdates%5Bcheckin%5D=2031-01-10&bookingdates%5Bcheckout%5D=2031-01-12&additionalneeds=Breakfast` | **200** | content-type: application/json; charset=utf-8 · content-length: 229 | `{"bookingid":2906,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-ue-post","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 894 |

### 1. POST urlencoded: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2906` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 200 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-ue-post","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 303 |

### Chuẩn bị: booking U (JSON, depositpaid true)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-058-ue; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-ue","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":2911,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-ue","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 305 |

### GET U kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2911` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-ue","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 312 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 296 |

### 2. PUT U urlencoded (TD-04, depositpaid=false)

> 🔍 Cần xem: 200; depositpaid false

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2911` | Content-Type: application/x-www-form-urlencoded · Accept: application/json · Cookie: token=*** | `firstname=QA-RB102-261128052139-eq72-moi&lastname=TC-058-ue-moi&totalprice=275&depositpaid=false&bookingdates%5Bcheckin%5D=2032-02-01&bookingdates%5Bcheckout%5D=2032-02-05&additionalneeds=%C4%82n%20s%C3%A1ng%20chay` | **200** | content-type: application/json; charset=utf-8 · content-length: 208 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 304 |

### 2. PUT urlencoded: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2911` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 208 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 306 |

### 3. Chuẩn bị: đặt lại depositpaid true

> 🔍 Cần xem: PATCH JSON {"depositpaid": true}: 200, depositpaid true

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2911` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"depositpaid":true}` | **200** | content-type: application/json; charset=utf-8 · content-length: 208 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 305 |

### 3. PATCH U urlencoded 'depositpaid=false&totalprice=99'

> 🔍 Cần xem: 200; depositpaid false, totalprice 99

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2911` | Content-Type: application/x-www-form-urlencoded · Accept: application/json · Cookie: token=*** | `depositpaid=false&totalprice=99` | **200** | content-type: application/json; charset=utf-8 · content-length: 207 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":99,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 400 |

### 3. PATCH urlencoded: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2911` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 207 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":99,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 418 |

### 4. POST text/xml <depositpaid>false</depositpaid>

> 🔍 Cần xem: 200; depositpaid false

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: text/xml · Accept: application/json | `<booking><firstname>QA-RB102-261128052139-eq72</firstname><lastname>TC-058-xml-post</lastname><totalprice>150</totalprice><depositpaid>false</depositpaid><bookingdates><checkin>2031-01-10</checkin><checkout>2031-01-12</checkout></bookingdates><additionalneeds>Breakfast</additionalneeds></booking>` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":2929,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml-post","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 319 |

### 4. POST XML: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2929` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml-post","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 404 |

### Chuẩn bị: booking M (JSON, depositpaid true)

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-058-xml; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 225 | `{"bookingid":2943,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 299 |

### GET M kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2943` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 296 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 400 |

### 5. PATCH M text/xml '<booking><depositpaid>false</depositpaid></booking>'

> 🔍 Cần xem: 200; depositpaid false

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2943` | Content-Type: text/xml · Accept: application/json · Cookie: token=*** | `<booking><depositpaid>false</depositpaid></booking>` | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 328 |

### 5. PATCH XML: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2943` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 294 |

### 6. Chuẩn bị: đặt lại depositpaid true

> 🔍 Cần xem: PATCH JSON {"depositpaid": true}: 200, depositpaid true

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/2943` | Content-Type: application/json · Accept: application/json · Cookie: token=*** | `{"depositpaid":true}` | **200** | content-type: application/json; charset=utf-8 · content-length: 196 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 323 |

### 6. PUT M text/xml (TD-04, <depositpaid>false</depositpaid>)

> 🔍 Cần xem: 200; depositpaid false, 6 giá trị còn lại đúng TD-04

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/2943` | Content-Type: text/xml · Accept: application/json · Cookie: token=*** | `<booking><firstname>QA-RB102-261128052139-eq72-moi</firstname><lastname>TC-058-xml-moi</lastname><totalprice>275</totalprice><depositpaid>false</depositpaid><bookingdates><checkin>2032-02-01</checkin><checkout>2032-02-05</checkout></bookingdates><additionalneeds>Ăn sáng chay</additionalneeds></booki… (tổng 305 byte)` | **200** | content-type: application/json; charset=utf-8 · content-length: 209 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-xml-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 289 |

### 6. PUT XML: GET

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2943` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 209 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-xml-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 306 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/2906` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 200 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-ue-post","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 299 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 317 |
| 3 | `DELETE /booking/2906` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 384 |
| 4 | `GET /booking/2911` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 207 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":99,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 333 |
| 5 | `DELETE /booking/2911` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 386 |
| 6 | `GET /booking/2929` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml-post","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 305 |
| 7 | `DELETE /booking/2929` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |
| 8 | `GET /booking/2943` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 209 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-xml-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 528 |
| 9 | `DELETE /booking/2943` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 287 |

## Lỗi ghi nhận

- `Error: 1. POST urlencoded: body trả về: depositpaid false (boolean)`
- `Error: 1. POST urlencoded: GET: depositpaid false (boolean)`
- `Error: 2. PUT urlencoded: body trả về: depositpaid false (boolean)`
- `Error: 2. PUT urlencoded: GET: depositpaid false (boolean)`
- `Error: 3. PATCH urlencoded: body trả về: depositpaid false (boolean)`
- `Error: 3. PATCH urlencoded: GET: depositpaid false (boolean)`
- `Error: 4. POST XML: body trả về: depositpaid false (boolean)`
- `Error: 4. POST XML: GET: depositpaid false (boolean)`
- `Error: 5. PATCH XML: body trả về: depositpaid false (boolean)`
- `Error: 5. PATCH XML: GET: depositpaid false (boolean)`
- `Error: 6. PUT XML: body trả về: depositpaid false (boolean)`
- `Error: 6. PUT XML: GET: depositpaid false (boolean)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. POST urlencoded: 200 application/json; charset=utf-8 "{"bookingid":2906,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-ue-post","t" |
| phản hồi | 2. PUT urlencoded: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":275,"depositpa" |
| phản hồi | 3. PATCH urlencoded: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-ue-moi","totalprice":99,"depositpai" |
| phản hồi | 4. POST XML: 200 application/json; charset=utf-8 "{"bookingid":2929,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml-post","" |
| phản hồi | 5. PATCH XML: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-058-xml","totalprice":150,"depositpaid":tru" |
| phản hồi | 6. PUT XML: 200 application/json; charset=utf-8 "{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-058-xml-moi","totalprice":275,"depositp" |
| cleanup | #2906: DELETE 201 · #2911: DELETE 201 · #2929: DELETE 201 · #2943: DELETE 201 |
| requests | 29 request, đăng nhập thất bại 0 |
