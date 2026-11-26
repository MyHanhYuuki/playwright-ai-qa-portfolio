# TC-038 Phiên giả mạo (cookie tự tạo) không vào được trang thanh toán, không đặt được hàng

- **Kết quả**: ❌ Failed · Bug: BUG-02
- **Nhóm**: Chung: nhiều màn hình (luồng chính, kiểm soát truy cập, tài khoản, nhiều tab)
- **Tags**: @AC-7 @info @overview @complete @security @BUG-02
- **Thời điểm**: 2026-11-26T07:13:42.367Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1 (standard_user, /checkout-step-one.html) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-step-one.html'..." | ![01-bien-the-1-standard-user-checkout-step-o.jpg](01-bien-the-1-standard-user-checkout-step-o.jpg) |
| 2 | Biến thể 2 (standard_user, /checkout-step-two.html) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-step-two.html'..." | ![02-bien-the-2-standard-user-checkout-step-t.jpg](02-bien-the-2-standard-user-checkout-step-t.jpg) |
| 3 | Biến thể 3 (standard_user, /checkout-complete.html) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-complete.html'..." | ![03-bien-the-3-standard-user-checkout-comple.jpg](03-bien-the-3-standard-user-checkout-comple.jpg) |
| 4 | Biến thể 4 (standard_user, Finish) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-step-two.html'..." | ![04-bien-the-4-standard-user-finish.jpg](04-bien-the-4-standard-user-finish.jpg) |
| 5 | Biến thể 5 (problem_user, /checkout-step-one.html) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-step-one.html'..." | ![05-bien-the-5-problem-user-checkout-step-on.jpg](05-bien-the-5-problem-user-checkout-step-on.jpg) |
| 6 | Biến thể 6 (error_user, /checkout-step-one.html) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-step-one.html'..." | ![06-bien-the-6-error-user-checkout-step-one-.jpg](06-bien-the-6-error-user-checkout-step-one-.jpg) |
| 7 | Biến thể 7 (visual_user, /checkout-step-one.html) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-step-one.html'..." | ![07-bien-the-7-visual-user-checkout-step-one.jpg](07-bien-the-7-visual-user-checkout-step-one.jpg) |
| 8 | Biến thể 8 (performance_glitch_user, /checkout-step-one.html) | Mong đợi: bị đưa về trang đăng nhập, "...'/checkout-step-one.html'..." | ![08-bien-the-8-performance-glitch-user-check.jpg](08-bien-the-8-performance-glitch-user-check.jpg) |
