# TC-027 Biến thể URL / header của /ping cho cùng kết quả

- **Kết quả**: ✅ Passed
- **Nhóm**: GET /ping: kiểm tra hệ thống
- **Tags**: @AC-4 @ping
- **Thời điểm**: 2026-11-28T05:15:08.867Z
- **Số request**: 4 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. GET /ping/

> 🔍 Cần xem: 201, text/plain, body Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /ping/` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 902 |

### 2. GET /PING

> 🔍 Cần xem: 201, text/plain, body Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /PING` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |

### 3. GET /ping?x=1

> 🔍 Cần xem: 201, text/plain, body Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /ping?x=1` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |

### 4. GET /ping, Accept: application/json

> 🔍 Cần xem: 201, text/plain, body Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /ping` | Accept: application/json | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 306 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| requests | 4 request, đăng nhập thất bại 0 |
