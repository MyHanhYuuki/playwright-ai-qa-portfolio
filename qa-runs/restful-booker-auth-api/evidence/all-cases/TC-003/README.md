# TC-003 Biến thể hợp lệ của body / header JSON vẫn cấp token

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-1 @auth
- **Thời điểm**: 2026-11-28T05:14:12.143Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. Trường thừa role, token

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***","role":"admin","token":"***(6 ký tự)"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 930 |

### 2. Đảo thứ tự trường

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"password":"***","username":"admin"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 313 |

### 3. JSON nhiều dòng, thụt lề 2

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{   "username": "admin",   "password": "***" }` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 304 |

### 4. Content-Type có charset

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json; charset=utf-8 | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 407 |

### 5. Content-Type viết hoa

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: APPLICATION/JSON | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 309 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| requests | 5 request, đăng nhập thất bại 0 |
