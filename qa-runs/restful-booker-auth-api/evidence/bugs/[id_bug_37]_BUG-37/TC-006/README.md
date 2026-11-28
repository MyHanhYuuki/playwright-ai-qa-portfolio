# TC-006 Phân biệt hoa thường ở tên đăng nhập và mật khẩu

- **Kết quả**: ❌ Failed · Bug: BUG-37
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @security @auth @bad-login @BUG-37
- **Thời điểm**: 2026-11-28T05:14:16.548Z
- **Số request**: 3 (đăng nhập thất bại: 2)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 964 |

### 1. Tên viết hoa chữ đầu + mật khẩu đúng

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"Admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 303 |

### 2. Tên đúng + mật khẩu viết hoa toàn bộ

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 303 |

## Lỗi ghi nhận

- `Error: 1. Tên viết hoa chữ đầu + mật khẩu đúng: (e) HTTP 401`
- `Error: 2. Tên đúng + mật khẩu viết hoa toàn bộ: (e) HTTP 401`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. Tên viết hoa chữ đầu + mật khẩu đúng: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 2. Tên đúng + mật khẩu viết hoa toàn bộ: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 3 request, đăng nhập thất bại 2 |
