# TC-037 Giá trị lọc sai (ngày sai định dạng, DD/MM/YYYY, lặp tham số): 400, không 5xx

- **Kết quả**: ❌ Failed · Bug: BUG-48
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @get-list @BUG-48
- **Thời điểm**: 2026-11-28T05:24:24.103Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### GET /booking?checkin=abc

> 🔍 Cần xem: 400, không 5xx, không 200

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin=abc` | Accept: application/json | (trống) | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 1318 |

### GET /booking?checkin=2040-13-45

> 🔍 Cần xem: 400, không 5xx, không 200

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin=2040-13-45` | Accept: application/json | (trống) | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 298 |

### GET /booking?checkout=abc

> 🔍 Cần xem: 400, không 5xx, không 200

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkout=abc` | Accept: application/json | (trống) | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 246 |

### GET /booking?checkin=08/03/2040

> 🔍 Cần xem: 400, không 5xx, không 200

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin=08/03/2040` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 378 |

### GET /booking?firstname=a&firstname=b

> 🔍 Cần xem: 400, không 5xx, không 200

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=a&firstname=b` | Accept: application/json | (trống) | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 298 |

## Lỗi ghi nhận

- `Error: GET /booking?checkin=abc: HTTP 400 (không 200)`
- `Error: GET /booking?checkin=abc: không 5xx`
- `Error: GET /booking?checkin=2040-13-45: HTTP 400 (không 200)`
- `Error: GET /booking?checkin=2040-13-45: không 5xx`
- `Error: GET /booking?checkout=abc: HTTP 400 (không 200)`
- `Error: GET /booking?checkout=abc: không 5xx`
- `Error: GET /booking?checkin=08/03/2040: HTTP 400 (không 200)`
- `Error: GET /booking?firstname=a&firstname=b: HTTP 400 (không 200)`
- `Error: GET /booking?firstname=a&firstname=b: không 5xx`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | GET /booking?checkin=abc: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | GET /booking?checkin=2040-13-45: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | GET /booking?checkout=abc: 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | GET /booking?checkin=08/03/2040: 200 application/json; charset=utf-8 "[]" |
| phản hồi | GET /booking?firstname=a&firstname=b: 500 text/plain; charset=utf-8 "Internal Server Error" |
| requests | 5 request, đăng nhập thất bại 0 |
