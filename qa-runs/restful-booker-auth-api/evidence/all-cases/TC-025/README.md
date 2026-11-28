# TC-025 GET /ping trả 201 Created

- **Kết quả**: ✅ Passed
- **Nhóm**: GET /ping: kiểm tra hệ thống
- **Tags**: @AC-4 @smoke @ping
- **Thời điểm**: 2026-11-28T05:15:05.795Z
- **Số request**: 1 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. GET /ping

> 🔍 Cần xem: 201, text/plain, body Created (MSG-02)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /ping` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 899 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| requests | 1 request, đăng nhập thất bại 0 |
