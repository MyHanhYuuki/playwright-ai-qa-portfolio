# TC-068 Kiểu xác thực hợp lệ khác cookie token thường (cookie kèm cookie khác, nháy kép, Basic) × PUT, PATCH, DELETE: được chấp nhận

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều endpoint
- **Tags**: @AC-7 @AC-4 @AC-5 @AC-6 @security @put @patch @delete
- **Thời điểm**: 2026-11-28T05:27:59.340Z
- **Số request**: 44 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Chuẩn bị: booking A (lastname TC-068) cho PUT / PATCH

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-068; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 222 | `{"bookingid":3636,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 1105 |

### Chuẩn bị: booking D (lastname TC-068-del-v06) cho DELETE

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-068-del-v06; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v06","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":3641,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v06","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 404 |

### Chuẩn bị: booking D (lastname TC-068-del-v07) cho DELETE

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-068-del-v07; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v07","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":3646,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v07","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 314 |

### Chuẩn bị: booking D (lastname TC-068-del-v09) cho DELETE

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-068-del-v09; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v09","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":3649,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v09","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 368 |

### Chuẩn bị: booking D (lastname TC-068-del-v13) cho DELETE

> 🔍 Cần xem: POST /booking (TD-03), lastname TC-068-del-v13; 200, bookingid nguyên dương, 7 giá trị đúng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v13","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 230 | `{"bookingid":3654,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v13","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}}` | 339 |

### GET A kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 193 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 279 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 259 |

### v06 Cookie: token=<token>; foo=bar: PUT A

> 🔍 Cần xem: 200, body và GET có 7 giá trị đúng body gửi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3636` | Content-Type: application/json · Accept: application/json · Cookie: token=***; foo=bar | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v06","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v06","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 358 |

### v06 Cookie: token=<token>; foo=bar: GET A sau PUT

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v06","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 305 |

### v06 Cookie: token=<token>; foo=bar: PATCH A {"totalprice": 401}

> 🔍 Cần xem: 200, totalprice mới, 6 giá trị còn lại giữ

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3636` | Content-Type: application/json · Accept: application/json · Cookie: token=***; foo=bar | `{"totalprice":401}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v06","totalprice":401,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 262 |

### v06 Cookie: token=<token>; foo=bar: GET A sau PATCH

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v06","totalprice":401,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 273 |

### v06 Cookie: token=<token>; foo=bar: GET D kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3641` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v06","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 258 |

### v06 Cookie: token=<token>; foo=bar: DELETE D

> 🔍 Cần xem: 201 Created; GET D sau đó 404

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3641` | Cookie: token=***; foo=bar | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 331 |
| 2 | `GET /booking/3641` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 335 |
| 3 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 296 |

### v07 Cookie: foo=bar; token=<token>: PUT A

> 🔍 Cần xem: 200, body và GET có 7 giá trị đúng body gửi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3636` | Content-Type: application/json · Accept: application/json · Cookie: foo=bar; token=*** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v07","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v07","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 269 |

### v07 Cookie: foo=bar; token=<token>: GET A sau PUT

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v07","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 345 |

### v07 Cookie: foo=bar; token=<token>: PATCH A {"totalprice": 402}

> 🔍 Cần xem: 200, totalprice mới, 6 giá trị còn lại giữ

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3636` | Content-Type: application/json · Accept: application/json · Cookie: foo=bar; token=*** | `{"totalprice":402}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v07","totalprice":402,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 391 |

### v07 Cookie: foo=bar; token=<token>: GET A sau PATCH

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v07","totalprice":402,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 315 |

### v07 Cookie: foo=bar; token=<token>: GET D kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3646` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v07","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 392 |

### v07 Cookie: foo=bar; token=<token>: DELETE D

> 🔍 Cần xem: 201 Created; GET D sau đó 404

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3646` | Cookie: foo=bar; token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |
| 2 | `GET /booking/3646` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 311 |
| 3 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 516 |

### v09 Cookie: token="<token>" (nháy kép): PUT A

> 🔍 Cần xem: 200, body và GET có 7 giá trị đúng body gửi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3636` | Content-Type: application/json · Accept: application/json · Cookie: token="***" | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v09","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v09","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 307 |

### v09 Cookie: token="<token>" (nháy kép): GET A sau PUT

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v09","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 298 |

### v09 Cookie: token="<token>" (nháy kép): PATCH A {"totalprice": 403}

> 🔍 Cần xem: 200, totalprice mới, 6 giá trị còn lại giữ

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3636` | Content-Type: application/json · Accept: application/json · Cookie: token="***" | `{"totalprice":403}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v09","totalprice":403,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 304 |

### v09 Cookie: token="<token>" (nháy kép): GET A sau PATCH

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v09","totalprice":403,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 316 |

### v09 Cookie: token="<token>" (nháy kép): GET D kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3649` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v09","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 499 |

### v09 Cookie: token="<token>" (nháy kép): DELETE D

> 🔍 Cần xem: 201 Created; GET D sau đó 404

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3649` | Cookie: token="***" | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 308 |
| 2 | `GET /booking/3649` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 410 |

### v13 Authorization: Basic đúng (ghép từ biến môi trường): PUT A

> 🔍 Cần xem: 200, body và GET có 7 giá trị đúng body gửi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /booking/3636` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v13","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v13","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 304 |

### v13 Authorization: Basic đúng (ghép từ biến môi trường): GET A sau PUT

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v13","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 262 |

### v13 Authorization: Basic đúng (ghép từ biến môi trường): PATCH A {"totalprice": 404}

> 🔍 Cần xem: 200, totalprice mới, 6 giá trị còn lại giữ

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /booking/3636` | Content-Type: application/json · Accept: application/json · Authorization: Basic *** | `{"totalprice":404}` | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v13","totalprice":404,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 352 |

### v13 Authorization: Basic đúng (ghép từ biến môi trường): GET A sau PATCH

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v13","totalprice":404,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 315 |

### v13 Authorization: Basic đúng (ghép từ biến môi trường): GET D kiểm chủ sở hữu (L17)

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3654` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 201 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-068-del-v13","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}` | 344 |

### v13 Authorization: Basic đúng (ghép từ biến môi trường): DELETE D

> 🔍 Cần xem: 201 Created; GET D sau đó 404

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /booking/3654` | Authorization: Basic *** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 270 |
| 2 | `GET /booking/3654` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 263 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/3636` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 205 | `{"firstname":"QA-RB102-261128052139-eq72-moi","lastname":"TC-068-v13","totalprice":404,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` | 268 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 312 |
| 3 | `DELETE /booking/3636` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 452 |
| 4 | `GET /booking/3641` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 257 |
| 5 | `GET /booking/3646` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 265 |
| 6 | `GET /booking/3649` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 296 |
| 7 | `GET /booking/3654` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 307 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #3636: DELETE 201 · #3641: không còn (GET 404) · #3646: không còn (GET 404) · #3649: không còn (GET 404) · #3654: không còn (GET 404) |
| requests | 44 request, đăng nhập thất bại 0 |
