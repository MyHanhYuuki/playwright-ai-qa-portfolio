# SD-102: Xem sản phẩm, chi tiết sản phẩm và giỏ hàng (Swag Labs)

> Ticket mô phỏng. SauceDemo là web demo công khai nên không có tài liệu đặc tả chính thức.
> Viết theo kiểu ticket ngoài thực tế: có user story, có AC, và còn vài chỗ chưa rõ.

- **Target URL**: https://www.saucedemo.com (trang `/inventory.html`, `/inventory-item.html?id=<n>`, `/cart.html`)
- **Loại**: Feature · **Sprint**: 2 · **Priority**: High
- **Phụ thuộc**: SD-101 Đăng nhập (đã xong)

## User story
**Là** khách hàng đã đăng nhập Swag Labs,
**tôi muốn** xem danh sách sản phẩm, xem chi tiết từng sản phẩm và quản lý giỏ hàng,
**để** chọn được sản phẩm muốn mua trước khi thanh toán.

## Acceptance Criteria
- **AC-1**: Trang Products hiển thị danh sách sản phẩm. Mỗi sản phẩm có ảnh, tên, mô tả, giá và nút "Add to cart".
- **AC-2**: Người dùng sắp xếp được danh sách theo tên (A → Z, Z → A) và theo giá (thấp → cao, cao → thấp). Mặc định là tên A → Z.
- **AC-3**: Bấm "Add to cart" thì sản phẩm được thêm vào giỏ, nút đổi thành "Remove", biểu tượng giỏ hàng hiển thị số sản phẩm đang có trong giỏ.
- **AC-4**: Bấm "Remove" thì sản phẩm bị bỏ khỏi giỏ, nút trở lại "Add to cart", số trên biểu tượng giỏ giảm tương ứng. Giỏ trống thì không hiển thị số.
- **AC-5**: Bấm vào tên hoặc ảnh sản phẩm thì mở trang chi tiết **đúng sản phẩm đó** (ảnh, tên, mô tả, giá giống ở danh sách). Trang chi tiết có nút thêm / bỏ khỏi giỏ và nút quay lại danh sách.
- **AC-6**: Trang giỏ hàng liệt kê các sản phẩm đã thêm (số lượng, tên, mô tả, giá), cho phép bỏ sản phẩm, có nút "Continue Shopping" quay lại danh sách và nút "Checkout" sang bước thanh toán.
- **AC-7**: Giỏ hàng được giữ nguyên khi tải lại trang hoặc chuyển qua lại giữa các trang.

## Tài khoản test
Dùng lại 6 tài khoản của SD-101 (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`), mật khẩu chung.

## Ngoài phạm vi
- Các bước thanh toán sau nút "Checkout" (ticket SD-103)
- Menu: "About", "Dynamic Catalog"; liên kết mạng xã hội ở chân trang
- Đăng nhập / đăng xuất (đã test ở SD-101)
