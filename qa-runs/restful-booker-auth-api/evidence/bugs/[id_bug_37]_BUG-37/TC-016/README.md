# TC-016 Tài khoản trên query string bị từ chối (400), không cấp token

- **Kết quả**: ❌ Failed · Bug: BUG-37
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @security @auth @bad-login @BUG-37
- **Thời điểm**: 2026-11-28T05:14:38.673Z
- **Số request**: 2 (đăng nhập thất bại: 1)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 894 |

### 1. POST /auth?username=…&password=… (fetch ngoài APIRequestContext, không body)

> 🔍 Cần xem: Không token, MSG-01, JSON, không 5xx; mã phải 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth?username=<TD-01 tên>&password=***` (fetch) | – | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 933 |

## Lỗi ghi nhận

- `Error: 1. Tài khoản trên query string: (e) HTTP 400`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. Tài khoản trên query string: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 2 request, đăng nhập thất bại 1 |
