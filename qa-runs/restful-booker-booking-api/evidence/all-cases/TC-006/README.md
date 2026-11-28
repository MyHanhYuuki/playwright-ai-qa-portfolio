# TC-006 Body JSON hỏng và body null: POST trả 400 'Bad Request'

- **Kết quả**: ✅ Passed
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post
- **Thời điểm**: 2026-11-28T05:22:05.742Z
- **Số request**: 2 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. JSON hỏng '{"firstname":'

> 🔍 Cần xem: 400, text/plain; charset=utf-8, body Bad Request (MSG-04)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{"firstname":` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 1205 |

### 2. Body 'null'

> 🔍 Cần xem: 400, text/plain; charset=utf-8, body Bad Request (MSG-04)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `null` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 294 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. JSON hỏng '{"firstname":': 400 text/plain; charset=utf-8 "Bad Request" |
| phản hồi | 2. Body 'null': 400 text/plain; charset=utf-8 "Bad Request" |
| requests | 2 request, đăng nhập thất bại 0 |
