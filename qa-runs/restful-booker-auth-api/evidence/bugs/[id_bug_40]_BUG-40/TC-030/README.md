# TC-030 HTTP thường bị chuyển hướng sang HTTPS hoặc bị từ chối; HTTPS có HSTS

- **Kết quả**: ❌ Failed · Bug: BUG-40
- **Nhóm**: Chung: cả 2 endpoint
- **Tags**: @AC-1 @AC-4 @security @auth @ping @bad-login @BUG-40
- **Thời điểm**: 2026-11-28T05:15:16.038Z
- **Số request**: 3 (đăng nhập thất bại: 1)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. GET http://…/ping (không theo chuyển hướng)

> 🔍 Cần xem: Phải 301 / 308 sang https://…/ping, hoặc bị từ chối; không 2xx (BUG-40: đang 201)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET http://restful-booker.herokuapp.com/ping` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 592 |

### 2. POST http://…/auth, tài khoản SAI (TD-24)

> 🔍 Cần xem: Không token, < 500; phải 307 / 308 sang https://…/auth hoặc bị từ chối (BUG-40: đang 200 Bad credentials)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST http://restful-booker.herokuapp.com/auth` | Content-Type: application/json | `{"username":"qa-rb101-no-such-user","password":"qa-rb101-wrong-pass"}` | **200** | content-type: application/json; charset=utf-8 · content-length: 28 | `{"reason":"Bad credentials"}` | 306 |

### 3. GET https://…/ping, đọc Strict-Transport-Security

> 🔍 Cần xem: Phải có HSTS max-age > 0 (BUG-40: đang không có)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /ping` | – | (trống) | **201** | content-type: text/plain; charset=utf-8 · content-length: 7 | `Created` | 915 |

## Lỗi ghi nhận

- `Error: Bước 1: http://…/ping phải chuyển hướng 301 / 308 sang https cùng host, cùng đường dẫn, hoặc bị từ chối; thực tế 201`
- `Error: Bước 2: http://…/auth phải chuyển hướng 307 / 308 sang https cùng host, cùng đường dẫn, hoặc bị từ chối (không qua kiểm tài khoản); thực tế 200`
- `Error: Bước 3: HTTPS có Strict-Transport-Security max-age > 0; thực tế (không có)`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| Bước 1 HTTP GET /ping | 201, Location (không có), body "Created" |
| Bước 2 HTTP POST /auth | 200, Location (không có), body "{"reason":"Bad credentials"}" |
| Bước 3 HSTS | (không có) |
| requests | 3 request, đăng nhập thất bại 1 |
