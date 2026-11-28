# TC-038 Tham số lọc dạng object / mảng / toán tử: 400, không trả toàn bộ danh sách

- **Kết quả**: ❌ Failed · Bug: BUG-48
- **Nhóm**: Endpoint 3: GET /booking
- **Tags**: @AC-3 @security @get-list @BUG-48
- **Thời điểm**: 2026-11-28T05:24:27.665Z
- **Số request**: 7 (đăng nhập thất bại: 0)
- **Ghi chú**: test API, không có ảnh / video. Token, cookie, Authorization, mật khẩu đã được che (`***`).

### GET /booking?firstname[$ne]=x

> 🔍 Cần xem: 400, không 5xx; không 200 kèm mảng khác rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname[$ne]=x` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 23215 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 23215 byte)` | 1669 |

### GET /booking?firstname[$eq]=QA-RB102-261128052139-eq72-khong-ton-tai

> 🔍 Cần xem: 400, không 5xx; không 200 kèm mảng khác rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname[$eq]=QA-RB102-261128052139-eq72-khong-ton-tai` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 23291 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 23291 byte)` | 316 |

### GET /booking?lastname[$gt]=zzzz

> 🔍 Cần xem: 400, không 5xx; không 200 kèm mảng khác rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?lastname[$gt]=zzzz` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 23329 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 23329 byte)` | 290 |

### GET /booking?checkin[$gt]=2046-01-01

> 🔍 Cần xem: 400, không 5xx; không 200 kèm mảng khác rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkin[$gt]=2046-01-01` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 23386 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 23386 byte)` | 305 |

### GET /booking?checkout[$lt]=2046-01-01

> 🔍 Cần xem: 400, không 5xx; không 200 kèm mảng khác rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?checkout[$lt]=2046-01-01` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 23386 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 23386 byte)` | 274 |

### GET /booking?firstname[]=a

> 🔍 Cần xem: 400, không 5xx; không 200 kèm mảng khác rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname[]=a` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 23424 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 23424 byte)` | 372 |

### GET /booking?firstname[$regex]=.*

> 🔍 Cần xem: 400, không 5xx; không 200 kèm mảng khác rỗng

| # | Request | Header gửi | Body gửi | Mã | Header nhận | Body nhận (trích) | ms |
|---|---|---|---|---|---|---|---|
| 1 | `GET /booking?firstname[$regex]=.*` | Accept: application/json | (trống) | **200** | content-type: application/json; charset=utf-8 · content-length: 23481 | `[{"bookingid":1},{"bookingid":2},{"bookingid":3},{"bookingid":4},{"bookingid":5},{"bookingid":6},{"bookingid":7},{"bookingid":8},{"bookingid":9},{"bookingid":10},{"bookingid":11},{"bookingid":12},{"bookingid":13},{"bookingid":14},{"bookingid":15},{"bookingid":16},{"bookingid":17},{"bookingid":18},{"… (tổng 23481 byte)` | 280 |

## Lỗi ghi nhận

- `Error: GET /booking?firstname[$ne]=x: HTTP 400`
- `Error: GET /booking?firstname[$ne]=x: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế 200, 1263 phần tử`
- `Error: GET /booking?firstname[$eq]=QA-RB102-261128052139-eq72-khong-ton-tai: HTTP 400`
- `Error: GET /booking?firstname[$eq]=QA-RB102-261128052139-eq72-khong-ton-tai: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế 200, 1267 phần tử`
- `Error: GET /booking?lastname[$gt]=zzzz: HTTP 400`
- `Error: GET /booking?lastname[$gt]=zzzz: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế 200, 1269 phần tử`
- `Error: GET /booking?checkin[$gt]=2046-01-01: HTTP 400`
- `Error: GET /booking?checkin[$gt]=2046-01-01: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế 200, 1272 phần tử`
- `Error: GET /booking?checkout[$lt]=2046-01-01: HTTP 400`
- `Error: GET /booking?checkout[$lt]=2046-01-01: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế 200, 1272 phần tử`
- `Error: GET /booking?firstname[]=a: HTTP 400`
- `Error: GET /booking?firstname[]=a: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế 200, 1274 phần tử`
- `Error: GET /booking?firstname[$regex]=.*: HTTP 400`
- `Error: GET /booking?firstname[$regex]=.*: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế 200, 1277 phần tử`

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| phản hồi | GET /booking?firstname[$ne]=x: 200, mảng 1263 phần tử |
| phản hồi | GET /booking?firstname[$eq]=QA-RB102-261128052139-eq72-khong-ton-tai: 200, mảng 1267 phần tử |
| phản hồi | GET /booking?lastname[$gt]=zzzz: 200, mảng 1269 phần tử |
| phản hồi | GET /booking?checkin[$gt]=2046-01-01: 200, mảng 1272 phần tử |
| phản hồi | GET /booking?checkout[$lt]=2046-01-01: 200, mảng 1272 phần tử |
| phản hồi | GET /booking?firstname[]=a: 200, mảng 1274 phần tử |
| phản hồi | GET /booking?firstname[$regex]=.*: 200, mảng 1277 phần tử |
| requests | 7 request, đăng nhập thất bại 0 |
