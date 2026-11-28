# TC-009 Giá trị rỗng và null coi như thiếu trường: 400, không cấp token

- **Kết quả**: ❌ Failed · Bug: BUG-37
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @auth @bad-login @BUG-37
- **Thời điểm**: 2026-11-28T05:14:23.718Z
- **Số request**: 4 (đăng nhập thất bại: 3)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 1182 |

### 1. username ""

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 305 |

### 2. password ""

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":""}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 314 |

### 3. password null

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":null}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 384 |

## Lỗi ghi nhận

- `Error: 1. username "": (e) HTTP 400`
- `Error: 2. password "": (e) HTTP 400`
- `Error: 3. password null: (e) HTTP 400`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. username "": 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 2. password "": 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 3. password null: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 4 request, đăng nhập thất bại 3 |
