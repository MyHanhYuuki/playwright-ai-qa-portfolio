# RB-101: Xác thực (Auth) và kiểm tra hệ thống (Ping) của Restful Booker API

> Ticket mô phỏng. Restful Booker là API luyện tập công khai. Nguồn đặc tả: tài liệu chính thức https://restful-booker.herokuapp.com/apidoc/index.html, bản chữ lưu ở [`apidoc.txt`](apidoc.txt) (lấy ngày 2026-11-26; trang tải bằng JavaScript nên đọc bằng trình duyệt).
> `apidoc.txt` chép **nguyên văn** tài liệu công khai, kể cả tài khoản demo công khai trong tài liệu. Code test **không** ghi mật khẩu: đọc từ biến môi trường (mặc định là giá trị công khai), giống SauceDemo.
> Viết theo kiểu ticket ngoài thực tế: có user story, có AC, và còn vài chỗ chưa rõ.

- **Base URL**: https://restful-booker.herokuapp.com
- **Endpoint**: `POST /auth` (CreateToken), `GET /ping` (HealthCheck)
- **Loại**: Feature (API, không có màn hình) · **Sprint**: 4 · **Priority**: High
- **Phụ thuộc**: không. RB-102 (Booking) dùng token của RB-101 cho `PUT`, `PATCH`, `DELETE`.

## User story
**Là** hệ thống / nhân viên quản trị gọi Restful Booker API,
**tôi muốn** đổi tài khoản quản trị lấy một token, và kiểm tra nhanh API có đang hoạt động không,
**để** chỉ người có quyền mới sửa, xóa được booking, và biết khi nào API ngừng hoạt động.

## Acceptance Criteria
- **AC-1**: `POST /auth` với body JSON `{"username": "...", "password": "..."}` đúng tài khoản quản trị (`Content-Type: application/json`) trả **HTTP 200** và body `{"token": "<chuỗi>"}`; token là chuỗi không rỗng.
- **AC-2**: Sai `username` hoặc `password`, hoặc thiếu trường bắt buộc, thì **không** cấp token (body không có trường `token` hợp lệ).
- **AC-3**: Token vừa cấp dùng được cho các thao tác cần quyền của RB-102 (`PUT`, `PATCH`, `DELETE /booking/:id`) qua header `Cookie: token=<token>`.
- **AC-4**: `GET /ping` cho biết API đang hoạt động: trả mã thành công kèm thân `Created`.
- **AC-5**: Phản hồi dùng định dạng nhất quán: `POST /auth` trả JSON (`Content-Type: application/json`).

## Tài khoản test
Tài khoản quản trị mặc định ghi trong tài liệu công khai của API. **Không** ghi mật khẩu trong test case: đọc từ biến môi trường (mặc định là giá trị công khai của tài liệu), giống cách làm với SauceDemo.

## Chưa rõ (ticket chưa nói)
- Tài liệu ghi `GET /ping` "Success 200" nhưng ví dụ phản hồi là `HTTP/1.1 201 Created`: mã đúng là gì?
- Sai tài khoản thì trả mã lỗi nào (401? 200 kèm thông báo?), nội dung thông báo ra sao.
- Token hết hạn khi nào; mỗi lần gọi `/auth` có cấp token mới không; token cũ còn dùng được không.
- Có giới hạn số lần thử sai không (chống dò mật khẩu).
- `POST /auth` có nhận định dạng khác JSON (XML, URL-encoded) không.

## Ngoài phạm vi
- Nghiệp vụ booking (RB-102). Ở đây chỉ kiểm token **cấp ra** và **dùng được**.
- Hiệu năng, tải (load test), kiểm thử xâm nhập chuyên sâu.
- Giao diện web của Restful Booker.
