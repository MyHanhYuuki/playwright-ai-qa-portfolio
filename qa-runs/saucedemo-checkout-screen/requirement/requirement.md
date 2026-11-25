# SD-103: Thanh toán (Checkout) và hoàn tất đơn hàng (Swag Labs)

> Ticket mô phỏng. SauceDemo là web demo công khai nên không có tài liệu đặc tả chính thức.
> Viết theo kiểu ticket ngoài thực tế: có user story, có AC, và còn vài chỗ chưa rõ.

- **Target URL**: https://www.saucedemo.com (trang `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html`; bắt đầu từ nút "Checkout" ở `/cart.html`)
- **Loại**: Feature · **Sprint**: 3 · **Priority**: High
- **Phụ thuộc**: SD-101 Đăng nhập, SD-102 Sản phẩm, chi tiết, giỏ hàng (đã xong)

## User story
**Là** khách hàng đã đăng nhập Swag Labs và có sản phẩm trong giỏ,
**tôi muốn** nhập thông tin giao hàng, xem lại đơn hàng và xác nhận mua,
**để** hoàn tất việc mua hàng.

## Acceptance Criteria
- **AC-1**: Từ trang giỏ hàng, bấm "Checkout" mở trang **Checkout: Your Information** có 3 ô bắt buộc: First Name, Last Name, Zip/Postal Code, nút "Continue" và nút "Cancel".
- **AC-2**: Bấm "Continue" khi còn ô bắt buộc để trống thì không sang bước sau và hiển thị thông báo lỗi cho ô đầu tiên còn thiếu (theo thứ tự First Name → Last Name → Zip/Postal Code).
- **AC-3**: Nhập đủ 3 ô rồi bấm "Continue" thì sang trang **Checkout: Overview**. "Cancel" ở trang thông tin quay về trang giỏ hàng, giỏ giữ nguyên.
- **AC-4**: Trang Overview liệt kê đúng các sản phẩm trong giỏ (số lượng, tên, mô tả, giá), thông tin thanh toán và giao hàng, **Item total** bằng tổng giá sản phẩm, **Tax** và **Total** = Item total + Tax.
- **AC-5**: Bấm "Finish" ở trang Overview thì sang trang **Checkout: Complete!** có thông báo đặt hàng thành công, giỏ hàng được làm trống (không còn số trên biểu tượng giỏ). "Cancel" ở trang Overview quay về danh sách sản phẩm, giỏ giữ nguyên.
- **AC-6**: Trang Complete có nút "Back Home" quay về danh sách sản phẩm; mọi nút ở danh sách là "Add to cart".
- **AC-7**: Chỉ người đã đăng nhập mới vào được các trang thanh toán.

## Tài khoản test
Dùng lại 6 tài khoản của SD-101 (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`), mật khẩu chung.

## Chưa rõ (ticket chưa nói)
- Tỷ lệ thuế, cách làm tròn.
- Giới hạn độ dài / ký tự cho First Name, Last Name, Zip/Postal Code.
- Thông tin thanh toán và giao hàng trên trang Overview lấy từ đâu (ticket không có màn hình nhập thẻ).
- Giỏ trống thì có được vào thanh toán không (SD-102 đã ghi BUG-19: hiện tại vào được).

## Ngoài phạm vi
- Thanh toán thật, cổng thanh toán, email xác nhận
- Thêm / bỏ sản phẩm ở danh sách, chi tiết, giỏ (đã test ở SD-102)
- Đăng nhập / đăng xuất (đã test ở SD-101)
