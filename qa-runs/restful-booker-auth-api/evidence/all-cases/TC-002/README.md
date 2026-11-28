# TC-002 Mỗi lần gọi cấp một token mới (5 lần liên tiếp)

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-1 @auth
- **Thời điểm**: 2026-11-28T05:14:09.854Z
- **Số request**: 5 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST /auth lần 1

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 1002 |

### 2. POST /auth lần 2

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 304 |

### 3. POST /auth lần 3

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 304 |

### 4. POST /auth lần 4

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 251 |

### 5. POST /auth lần 5

> 🔍 Cần xem: 200, JSON, token chuỗi không rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 322 |

### 6. So 5 token

> 🔍 Cần xem: 5 token đôi một khác nhau

(không gửi request ở bước này)

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| requests | 5 request, đăng nhập thất bại 0 |
