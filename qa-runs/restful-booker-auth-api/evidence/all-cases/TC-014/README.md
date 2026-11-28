# TC-014 Định dạng body không hỗ trợ (tài khoản đúng): 415 JSON, không báo Bad credentials

- **Kết quả**: ❌ Failed · Bug: BUG-39
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @AC-5 @auth @bad-login @BUG-39
- **Thời điểm**: 2026-11-28T05:14:34.061Z
- **Số request**: 4 (đăng nhập thất bại: 3)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 791 |

### 1. Content-Type: text/xml, body XML

> 🔍 Cần xem: (a) không token, (b) không 5xx, không stack trace; phải 415 JSON, không "Bad credentials" (BUG-39: đang 200 Bad credentials)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: text/xml | `<auth><username>admin</username><password>***</password></auth>` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 306 |

### 2. multipart/form-data

> 🔍 Cần xem: (a) không token, (b) không 5xx, không stack trace; phải 415 JSON, không "Bad credentials" (BUG-39: đang 200 Bad credentials)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | – | `multipart: username=admin, password=***` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 290 |

### 3. Không có header Content-Type (gửi bằng node:https)

> 🔍 Cần xem: (a) không token, (b) không 5xx, không stack trace; phải 415 JSON, không "Bad credentials" (BUG-39: đang 200 Bad credentials). Header thật sự gửi đi không có Content-Type

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` (node:https) | content-length: 45 · host: restful-booker.herokuapp.com | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 906 |

## Lỗi ghi nhận

- `Error: 1. text/xml: (c) HTTP 415`
- `Error: 1. text/xml: (e) body không chứa "Bad credentials"`
- `Error: 2. multipart/form-data: (c) HTTP 415`
- `Error: 2. multipart/form-data: (e) body không chứa "Bad credentials"`
- `Error: 3. không Content-Type: (c) HTTP 415`
- `Error: 3. không Content-Type: (e) body không chứa "Bad credentials"`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| TD-12 biến thể 3 | header đã gửi: content-length, host (+ host) |
| phản hồi | 1. text/xml: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 2. multipart/form-data: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 3. không Content-Type: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 4 request, đăng nhập thất bại 3 |
