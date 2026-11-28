# TC-028 Sai phương thức trên /ping: 4xx, không trả Created

- **Kết quả**: ✅ Passed
- **Nhóm**: GET /ping: kiểm tra hệ thống
- **Tags**: @AC-4 @ping
- **Thời điểm**: 2026-11-28T05:15:10.721Z
- **Số request**: 4 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### POST /ping

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body khác Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /ping` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 904 |

### PUT /ping

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body khác Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PUT /ping` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 309 |

### PATCH /ping

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body khác Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `PATCH /ping` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 303 |

### DELETE /ping

> 🔍 Cần xem: 400 ≤ mã ≤ 499, body khác Created

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `DELETE /ping` | – | (trống) | **404** | content-type: text/plain; charset=utf-8 · content-length: 9 | `Not Found` | 314 |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | POST /ping: 404 text/plain; charset=utf-8 "Not Found" |
| phản hồi | PUT /ping: 404 text/plain; charset=utf-8 "Not Found" |
| phản hồi | PATCH /ping: 404 text/plain; charset=utf-8 "Not Found" |
| phản hồi | DELETE /ping: 404 text/plain; charset=utf-8 "Not Found" |
| requests | 4 request, đăng nhập thất bại 0 |
