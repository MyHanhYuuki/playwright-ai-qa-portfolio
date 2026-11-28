# TC-005 Body {} và [] (JSON hợp lệ nhưng sai cấu trúc): POST trả 400

- **Kết quả**: ❌ Failed · Bug: BUG-41
- **Nhóm**: Endpoint 1: POST /booking
- **Tags**: @AC-1 @post @BUG-41
- **Thời điểm**: 2026-11-28T05:22:04.210Z
- **Số request**: 3 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)

> 🔍 Cần xem: Danh sách id của lần chạy trước biến thể đầu

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname=QA-RB102-261128052139-eq72` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 2 | `[]` | 1265 |

### Body '{}'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `{}` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 736 |

### Body '[]'

> 🔍 Cần xem: Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `POST /booking` | Content-Type: application/json · Accept: application/json | `[]` | **500** | content-type: text/plain; charset=utf-8 · content-length: 21 | `Internal Server Error` | 409 |

## Lỗi ghi nhận

- `Error: Body '{}': HTTP 400 (không 2xx)`
- `Error: Body '{}': không 5xx`
- `Error: Body '[]': HTTP 400 (không 2xx)`
- `Error: Body '[]': không 5xx`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | Body '{}': 500 text/plain; charset=utf-8 "Internal Server Error" |
| phản hồi | Body '[]': 500 text/plain; charset=utf-8 "Internal Server Error" |
| requests | 3 request, đăng nhập thất bại 0 |
