# TC-008 Thiếu trường bắt buộc: 400, không cấp token

- **Kết quả**: ❌ Failed · Bug: BUG-37
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @auth @bad-login @BUG-37
- **Thời điểm**: 2026-11-28T05:14:21.466Z
- **Số request**: 5 (đăng nhập thất bại: 4)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 977 |

### 1. Thiếu password

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 301 |

### 2. Thiếu username

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 357 |

### 3. Body {}

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 259 |

### 4. Body rỗng 0 byte

> 🔍 Cần xem: Không có token, MSG-01, JSON, không 5xx; mã phải 400

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `(0 byte)` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 363 |

## Lỗi ghi nhận

- `Error: 1. Thiếu password: (e) HTTP 400`
- `Error: 2. Thiếu username: (e) HTTP 400`
- `Error: 3. Body {}: (e) HTTP 400`
- `Error: 4. Body rỗng 0 byte: (e) HTTP 400`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. Thiếu password: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 2. Thiếu username: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 3. Body {}: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 4. Body rỗng 0 byte: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 5 request, đăng nhập thất bại 4 |
