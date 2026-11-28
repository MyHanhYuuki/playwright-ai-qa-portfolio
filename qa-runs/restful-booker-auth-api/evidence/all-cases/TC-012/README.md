# TC-012 Body quá lớn (~200 KB): 413, phản hồi lỗi là JSON

- **Kết quả**: ❌ Failed · Bug: BUG-38
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-5 @auth @bad-login @BUG-38
- **Thời điểm**: 2026-11-28T05:14:30.172Z
- **Số request**: 2 (đăng nhập thất bại: 1)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 894 |

### 1. Body ~200 KB (TD-10)

> 🔍 Cần xem: 413, không 5xx, không token, không stack trace; Content-Type phải JSON (BUG-38: đang text/plain)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***","pad":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa… (tổng 204854 byte)` | **413** | content-type: text/plain; charset=utf-8 · content-length: 17 | `Payload Too Large` | 1335 |

## Lỗi ghi nhận

- `Error: (d) Content-Type application/json`
- `Error: (d) body đọc được thành object JSON`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. Body ~200 KB: 413 text/plain; charset=utf-8 "Payload Too Large" |
| requests | 2 request, đăng nhập thất bại 1 |
