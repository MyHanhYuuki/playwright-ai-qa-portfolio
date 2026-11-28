# TC-010 Sai kiểu dữ liệu và thử vượt xác thực không cấp token, không 5xx

- **Kết quả**: ❌ Failed · Bug: BUG-37
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-2 @security @auth @bad-login @BUG-37
- **Thời điểm**: 2026-11-28T05:14:26.386Z
- **Số request**: 6 (đăng nhập thất bại: 5)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### Bước 0: đối chứng đăng nhập đúng (L15)

> 🔍 Cần xem: Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 27 | `{"token":"***(15 ký tự)"}` | 887 |

### 1. username là mảng

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":["admin"],"password":"***"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 309 |

### 2. password là mảng

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":["***"]}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 301 |

### 3. password là object {"$ne":""}

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin","password":{"$ne":""}}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 324 |

### 4. body là mảng JSON

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `[{"username":"admin","password":"***"}]` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 366 |

### 5. Chuỗi kiểu SQL ' OR '1'='1

> 🔍 Cần xem: Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /auth` | Content-Type: application/json | `{"username":"admin' OR '1'='1","password":"x' OR '1'='1"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 398 |

## Lỗi ghi nhận

- `Error: 1. username là mảng: (e) HTTP 400`
- `Error: 2. password là mảng: (e) HTTP 400`
- `Error: 3. password là object {"$ne":""}: (e) HTTP 400`
- `Error: 4. body là mảng JSON: (e) HTTP 400`
- `Error: 5. Chuỗi kiểu SQL ' OR '1'='1: (e) HTTP 401`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. username là mảng: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 2. password là mảng: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 3. password là object {"$ne":""}: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 4. body là mảng JSON: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| phản hồi | 5. Chuỗi kiểu SQL ' OR '1'='1: 200 application/json; charset=utf-8 "{"reason":"Bad credentials"}" |
| requests | 6 request, đăng nhập thất bại 5 |
