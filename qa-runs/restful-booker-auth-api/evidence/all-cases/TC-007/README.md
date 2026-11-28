# TC-007 Khoảng trắng ở 4 vị trí (đầu / cuối tên, đầu / cuối mật khẩu) không được cắt

- **Kết quả**: ❌ Failed · Bug: BUG-37
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @auth @bad-login @BUG-37
- **Thời điểm**: 2026-11-28T05:14:19.115Z
- **Số request**: 5 (đăng nhập thất bại: 4)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 1297 |

### 1. " " + tên

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":" admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 302 |

### 2. tên + " "

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin ","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 298 |

### 3. " " + mật khẩu

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":" ***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 293 |

### 4. mật khẩu + " "

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"*** "}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 296 |

## Lỗi ghi nhận

- `Error: 1. " " + tên: (e) HTTP 401`
- `Error: 2. tên + " ": (e) HTTP 401`
- `Error: 3. " " + mật khẩu: (e) HTTP 401`
- `Error: 4. mật khẩu + " ": (e) HTTP 401`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. " " + tên: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 2. tên + " ": 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 3. " " + mật khẩu: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 4. mật khẩu + " ": 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 5 request, đăng nhập thất bại 4 |
