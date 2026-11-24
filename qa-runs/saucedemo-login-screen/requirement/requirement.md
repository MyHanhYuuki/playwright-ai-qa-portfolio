# SD-101: Đăng nhập vào Swag Labs (SauceDemo)

> Ticket mô phỏng. SauceDemo là web demo công khai nên không có tài liệu đặc tả chính thức.
> Ticket này được viết theo đúng kiểu ticket ngoài thực tế: có user story, có AC, và còn vài chỗ chưa rõ.

- **Target URL**: https://www.saucedemo.com
- **Loại**: Feature · **Sprint**: 1 · **Priority**: High

## User story
**Là** khách hàng của Swag Labs,
**tôi muốn** đăng nhập bằng username và password,
**để** xem danh sách sản phẩm và mua hàng.

## Acceptance Criteria
- **AC-1**: Trang đăng nhập hiển thị ô Username, ô Password (nhập ẩn ký tự) và nút Login.
- **AC-2**: Nhập đúng username và password hợp lệ, bấm Login thì chuyển tới trang danh sách sản phẩm.
- **AC-3**: Bỏ trống Username hoặc Password thì hiển thị thông báo lỗi tương ứng và không đăng nhập.
- **AC-4**: Nhập sai username hoặc password thì hiển thị thông báo lỗi và không đăng nhập.
- **AC-5**: Tài khoản bị khóa thì không đăng nhập được và hiển thị thông báo cho biết tài khoản bị khóa.
- **AC-6**: Người dùng chưa đăng nhập không truy cập được các trang bên trong (vd: trang sản phẩm).
- **AC-7**: Người dùng đã đăng nhập có thể đăng xuất và quay về trang đăng nhập.

## Tài khoản test (hiển thị công khai trên trang đăng nhập)
`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`
Password chung: `secret_sauce`

## Ngoài phạm vi
- Đăng ký tài khoản, quên mật khẩu (web không có chức năng này)
- Kiểm thử hiệu năng, bảo mật chuyên sâu (SQL injection, brute force)
