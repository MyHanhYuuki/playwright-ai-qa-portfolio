# TC-026 HEAD /ping cùng mã với GET, body rỗng

- **Kết quả**: ✅ Passed
- **Nhóm**: GET /ping: kiểm tra hệ thống
- **Tags**: @AC-4 @ping
- **Thời điểm**: 2026-11-28T05:15:07.025Z
- **Số request**: 2 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. GET /ping

> 🔍 Cần xem: 201, text/plain, Content-Length 7

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /ping` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 887 |

### 2. HEAD /ping

> 🔍 Cần xem: Cùng mã, cùng Content-Length, cùng Content-Type với GET

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `HEAD /ping` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | (trống) | 305 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| HEAD body | 0 byte (không assert, L15) |
| requests | 2 request, đăng nhập thất bại 0 |
