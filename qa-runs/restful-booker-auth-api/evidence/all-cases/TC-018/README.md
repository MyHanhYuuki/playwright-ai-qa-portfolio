# TC-018 Sai phương thức trên /auth: 4xx, không token, không 5xx

- **Kết quả**: ✅ Passed
- **Nhóm**: POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
- **Tags**: @AC-1 @auth
- **Thời điểm**: 2026-11-28T05:14:42.043Z
- **Số request**: 6 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### 1. GET /auth

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body không chứa token (HEAD: body rỗng)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /auth` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 902 |

### 2. PUT /auth (body TD-01)

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body không chứa token (HEAD: body rỗng)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 306 |

### 3. PATCH /auth (body TD-01)

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body không chứa token (HEAD: body rỗng)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /auth` | Content-Type: application/json | `{"username":"admin","password":"***"}` | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 302 |

### 4. DELETE /auth

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body không chứa token (HEAD: body rỗng)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /auth` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 305 |

### 5. HEAD /auth

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body không chứa token (HEAD: body rỗng)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `HEAD /auth` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | (trống) | 303 |

### 6. GET /auth/

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body không chứa token (HEAD: body rỗng)

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /auth/` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 309 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | 1. GET /auth: 404 text/plain; charset=utf-8 "Not Found" |
| phản hồi | 2. PUT /auth (body TD-01): 404 text/plain; charset=utf-8 "Not Found" |
| phản hồi | 3. PATCH /auth (body TD-01): 404 text/plain; charset=utf-8 "Not Found" |
| phản hồi | 4. DELETE /auth: 404 text/plain; charset=utf-8 "Not Found" |
| phản hồi | 5. HEAD /auth: 404 text/plain; charset=utf-8 (body rỗng) |
| phản hồi | 6. GET /auth/: 404 text/plain; charset=utf-8 "Not Found" |
| requests | 6 request, đăng nhập thất bại 0 |
