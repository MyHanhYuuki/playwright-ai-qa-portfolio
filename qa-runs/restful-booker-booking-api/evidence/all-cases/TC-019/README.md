# TC-019 Khoảng trắng đầu cuối được lưu nguyên văn (server không cắt)

- **Kết quả**: ❌ Failed · Bug: BUG-59
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @get-id @BUG-59
- **Thời điểm**: 2026-11-28T05:23:25.505Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST /booking, lastname "␣␣TC-019-Pad␣␣", additionalneeds "␣␣Pad␣␣"

> 🔍 Cần xem: 200; 2 chuỗi giữ nguyên khoảng trắng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"  TC-019-Pad  ","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"  Pad  "}` | **200** | content-type: application/json; charset=utf-8 · content-length: 224 | `{"bookingid":1333,"booking":{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-019-Pad","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"  Pad  "}}` | 1418 |

### 3. GET /booking/<id>

> 🔍 Cần xem: 200, 7 giá trị mong đợi

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1333` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-019-Pad","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"  Pad  "}` | 404 |

### Dọn dẹp (TD-26)

> 🔍 Cần xem: GET trước, chỉ DELETE khi firstname + lastname khớp chính xác; 403 / 404 chấp nhận

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/1333` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 195 | `{"firstname":"QA-RB102-261128052139-eq72","lastname":"TC-019-Pad","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"  Pad  "}` | 310 |
| 2 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 304 |
| 3 | `DELETE /booking/1333` | Cookie: token=*** | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 303 |

## Lỗi ghi nhận

- `Error: Bước 2 body trả về: lastname đúng '  TC-019-Pad  ' (14 ký tự)`
- `Error: Bước 3 GET: lastname đúng '  TC-019-Pad  ' (14 ký tự)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| cleanup | #1333: DELETE 201 |
| requests | 5 request, đăng nhập thất bại 0 |
