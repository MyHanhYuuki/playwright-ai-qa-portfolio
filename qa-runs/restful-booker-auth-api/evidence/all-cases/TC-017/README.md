# TC-017 Header Accept: application/xml không đổi định dạng phản hồi của /auth

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-5 @auth
- **Thời điểm**: 2026-11-28T05:14:39.582Z
- **Số request**: 1 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. POST /auth, Accept: application/xml

> 🔍 Cần xem: 200, Content-Type JSON (không phải XML), token chuỗi không rỗng, không có reason

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json · Accept: application/xml | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 876 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| requests | 1 request, đăng nhập thất bại 0 |
