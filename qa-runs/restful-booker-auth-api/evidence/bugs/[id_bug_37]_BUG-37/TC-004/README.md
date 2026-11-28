# TC-004 Sai mật khẩu: 401, không cấp token, thông báo Bad credentials

- **Kết quả**: ❌ Failed · Bug: BUG-37
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @security @auth @bad-login @BUG-37
- **Thời điểm**: 2026-11-28T05:14:13.364Z
- **Số request**: 2 (đăng nhập thất bại: 1)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 886 |

### 1. Sai mật khẩu (TD-02)

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"qa-rb101-wrong-pass"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 292 |

## Lỗi ghi nhận

- `Error: 1. Sai mật khẩu (TD-02): (e) HTTP 401`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. Sai mật khẩu (TD-02): 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 2 request, đăng nhập thất bại 1 |
