# TC-013 Body không phân tích được: 400, phản hồi lỗi là JSON

- **Kết quả**: ❌ Failed · Bug: BUG-38
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-5 @auth @bad-login @BUG-38
- **Thời điểm**: 2026-11-28T05:14:31.703Z
- **Số request**: 3 (đăng nhập thất bại: 2)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 888 |

### 1. JSON hỏng (cắt cụt)

> 🔍 Cần xem: 400, không 5xx, không token, không stack trace; Content-Type phải JSON (BUG-38: đang text/plain)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username": "admin", ` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 303 |

### 2. Body XML với Content-Type JSON

> 🔍 Cần xem: 400, không 5xx, không token, không stack trace; Content-Type phải JSON (BUG-38: đang text/plain)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `<auth><username>admin</username><password>***</password></auth>` | **400** | content-type: text/plain; charset=utf-8 · content-length: 11 | `Bad Request` | 288 |

## Lỗi ghi nhận

- `Error: 1. JSON hỏng (cắt cụt): (d) Content-Type application/json`
- `Error: 1. JSON hỏng (cắt cụt): (d) body đọc được thành object JSON`
- `Error: 2. Body XML với Content-Type JSON: (d) Content-Type application/json`
- `Error: 2. Body XML với Content-Type JSON: (d) body đọc được thành object JSON`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. JSON hỏng (cắt cụt): 400 text/plain; charset=utf-8 "Bad Request" |
| phản hồi | 2. Body XML với Content-Type JSON: 400 text/plain; charset=utf-8 "Bad Request" |
| requests | 3 request, đăng nhập thất bại 2 |
