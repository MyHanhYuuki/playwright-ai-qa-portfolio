# RB-102: Quản lý đặt phòng (Booking) của Restful Booker API

> **Lưu ý bảo mật**: [`apidoc.txt`](apidoc.txt) là bản sao **nguyên văn** tài liệu công khai, gồm cả thông tin đăng nhập demo công khai của tài liệu. Test **không** dùng giá trị trong file này: mật khẩu quản trị đọc từ biến môi trường (mặc định: giá trị công khai trong tài liệu).
> Ticket mô phỏng. Restful Booker là API luyện tập công khai. Nguồn đặc tả: tài liệu chính thức https://restful-booker.herokuapp.com/apidoc/index.html, bản chữ lưu ở [`apidoc.txt`](apidoc.txt) (lấy ngày 2026-11-26; trang tải bằng JavaScript nên đọc bằng trình duyệt).
> Viết theo kiểu ticket ngoài thực tế: có user story, có AC, và còn vài chỗ chưa rõ.

- **Base URL**: https://restful-booker.herokuapp.com
- **Endpoint**: `GET /booking` (GetBookingIds), `GET /booking/:id` (GetBooking), `POST /booking` (CreateBooking), `PUT /booking/:id` (UpdateBooking), `PATCH /booking/:id` (PartialUpdateBooking), `DELETE /booking/:id` (DeleteBooking)
- **Loại**: Feature (API, không có màn hình) · **Sprint**: 4 · **Priority**: High
- **Phụ thuộc**: RB-101 (token cho `PUT`, `PATCH`, `DELETE`)

## User story
**Là** hệ thống đặt phòng gọi Restful Booker API,
**tôi muốn** tạo, xem, tìm, sửa và xóa booking,
**để** quản lý việc đặt phòng của khách.

## Dữ liệu một booking
| Trường | Kiểu | Ví dụ |
|---|---|---|
| `firstname` | String | `Jim` |
| `lastname` | String | `Brown` |
| `totalprice` | Number | `111` |
| `depositpaid` | Boolean | `true` |
| `bookingdates.checkin` | Date `CCYY-MM-DD` | `2018-01-01` |
| `bookingdates.checkout` | Date `CCYY-MM-DD` | `2019-01-01` |
| `additionalneeds` | String | `Breakfast` |

## Acceptance Criteria
- **AC-1**: `POST /booking` với booking hợp lệ (JSON) trả **HTTP 200** và body `{"bookingid": <số>, "booking": {...}}`; `booking` trả về giống **từng trường** đã gửi.
- **AC-2**: `GET /booking/:id` trả **HTTP 200** và đúng booking có id đó (đủ 6 trường, `bookingdates` gồm `checkin`, `checkout`). Id không tồn tại thì báo không tìm thấy.
- **AC-3**: `GET /booking` trả **HTTP 200** và danh sách `[{"bookingid": <số>}, ...]`. Lọc theo `firstname`, `lastname` trả đúng các booking khớp; lọc `checkin` / `checkout` trả các booking có ngày **lớn hơn hoặc bằng** ngày lọc (định dạng `CCYY-MM-DD`).
- **AC-4**: `PUT /booking/:id` (có quyền) thay **toàn bộ** booking bằng dữ liệu mới, trả **HTTP 200** và booking đã cập nhật; đọc lại bằng `GET` thấy đúng dữ liệu mới.
- **AC-5**: `PATCH /booking/:id` (có quyền) chỉ đổi các trường được gửi, các trường khác **giữ nguyên**, trả **HTTP 200** và booking đã cập nhật.
- **AC-6**: `DELETE /booking/:id` (có quyền) xóa booking, trả mã thành công (tài liệu: `HTTP/1.1 201 Created`); sau đó `GET /booking/:id` báo không tìm thấy.
- **AC-7**: `PUT`, `PATCH`, `DELETE` **bắt buộc có quyền**: header `Cookie: token=<token của RB-101>` hoặc `Authorization: Basic <base64(username:password)>`. Không có quyền, token sai thì **bị từ chối** và booking **không đổi**.
- **AC-8**: Header `Accept` chọn định dạng phản hồi (`application/json` hoặc `application/xml`); `Content-Type` cho biết định dạng gửi lên (`application/json` hoặc `text/xml`).

## Chưa rõ (ticket chưa nói)
- Trường nào bắt buộc khi tạo / sửa; thiếu trường, sai kiểu (giá là chữ, ngày sai định dạng) thì trả mã lỗi gì.
- `checkout` trước `checkin`, giá âm, chuỗi rỗng, chuỗi rất dài có bị chặn không.
- Lọc theo tên có phân biệt hoa thường không; lọc nhiều điều kiện cùng lúc là "và" hay "hoặc".
- Mã trả về khi không có quyền (401? 403?) và khi id không tồn tại (404?).
- `DELETE` thành công trả 201 theo tài liệu: có phải chủ ý không (thường là 200 / 204).
- Dữ liệu dùng chung với mọi người dùng API công khai: booking có thể bị người khác sửa, xóa; dữ liệu có thể bị đặt lại định kỳ.

## Ngoài phạm vi
- Cấp token (RB-101). Ở đây chỉ dùng token làm điều kiện trước và kiểm **quyền** trên booking.
- Hiệu năng, tải, kiểm thử xâm nhập chuyên sâu.
- Giao diện web của Restful Booker.
