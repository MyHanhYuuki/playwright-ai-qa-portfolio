# TC-001 Happy path: tài khoản quản trị đúng (JSON) được cấp token

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-1 @AC-5 @smoke @auth
- **Thời điểm**: 2026-11-28T05:14:07.639Z
- **Số request**: 1 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST /auth tài khoản đúng (TD-01)

> 🔍 Cần xem: 200, JSON, có token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 1096 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| Cache-Control | (không có), cải tiến IMP-02 |
| token | 15 ký tự, hex; các trường: token |
| requests | 1 request, đăng nhập thất bại 0 |
