# TC-037 Chưa đăng nhập mở thẳng 3 trang thanh toán bị chặn

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều màn hình (luồng chính, kiểm soát truy cập, tài khoản, nhiều tab)
- **Tags**: @AC-7 @info @overview @complete @smoke @security
- **Thời điểm**: 2026-11-26T07:12:35.086Z
- **Video**: (chỉ quay video cho test có bug hoặc kết quả bất thường)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1 (/checkout-step-one.html) | Trang đăng nhập, "...'/checkout-step-one.html' when you are logged in." | ![01-bien-the-1-checkout-step-one-html.jpg](01-bien-the-1-checkout-step-one-html.jpg) |
| 2 | Biến thể 2 (/checkout-step-two.html) | Trang đăng nhập, "...'/checkout-step-two.html' when you are logged in." | ![02-bien-the-2-checkout-step-two-html.jpg](02-bien-the-2-checkout-step-two-html.jpg) |
| 3 | Biến thể 3 (/checkout-complete.html) | Trang đăng nhập, "...'/checkout-complete.html' when you are logged in." | ![03-bien-the-3-checkout-complete-html.jpg](03-bien-the-3-checkout-complete-html.jpg) |
| 4 | Biến thể 4 (/checkout-step-one.html, có cart-contents [4]) | Trang đăng nhập, "...'/checkout-step-one.html' when you are logged in." | ![04-bien-the-4-checkout-step-one-html-co-car.jpg](04-bien-the-4-checkout-step-one-html-co-car.jpg) |
| 5 | Biến thể 5 (/checkout-step-two.html, có cart-contents [4]) | Trang đăng nhập, "...'/checkout-step-two.html' when you are logged in." | ![05-bien-the-5-checkout-step-two-html-co-car.jpg](05-bien-the-5-checkout-step-two-html-co-car.jpg) |
| 6 | Biến thể 6 (/checkout-complete.html, có cart-contents [4]) | Trang đăng nhập, "...'/checkout-complete.html' when you are logged in." | ![06-bien-the-6-checkout-complete-html-co-car.jpg](06-bien-the-6-checkout-complete-html-co-car.jpg) |
