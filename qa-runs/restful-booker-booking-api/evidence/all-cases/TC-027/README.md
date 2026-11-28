# TC-027 GET /booking/:id với id không tồn tại (rất lớn, 0, âm, chữ, khoảng trắng) trả 404 'Not Found'

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 2: GET /booking/:id
- **Tags**: @AC-2 @get-id
- **Thời điểm**: 2026-11-28T05:23:48.665Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### GET /booking/999999999

> 🔍 Cần xem: 404, MSG-11, body Not Found

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/999999999` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 1113 |

### GET /booking/0

> 🔍 Cần xem: 404, MSG-11, body Not Found

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/0` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 304 |

### GET /booking/-1

> 🔍 Cần xem: 404, MSG-11, body Not Found

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/-1` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 308 |

### GET /booking/abc

> 🔍 Cần xem: 404, MSG-11, body Not Found

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/abc` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 499 |

### GET /booking/%20

> 🔍 Cần xem: 404, MSG-11, body Not Found

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking/%20` | Accept: application/json | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 420 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| requests | 5 request, đăng nhập thất bại 0 |
