# TC-045 phiên giả mạo không vào được trang giỏ và trang chi tiết

- **Kết quả**: ❌ Failed · Bug: BUG-02
- **Nhóm**: Chung: nhiều màn hình (tài khoản, giỏ, menu, kiểm soát truy cập)
- **Tags**: @AC-5 @AC-6 @detail @cart @security @BUG-02
- **Thời điểm**: 2026-11-25T08:13:28.527Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Mở /cart.html bằng cookie giả | Mong đợi: bị đưa về trang đăng nhập, không thấy nội dung | ![01-mo-cart-html-bang-cookie-gia.jpg](01-mo-cart-html-bang-cookie-gia.jpg) |
| 2 | Mở /inventory-item.html bằng cookie giả | Mong đợi: bị đưa về trang đăng nhập, không thấy nội dung | ![02-mo-inventory-item-html-bang-cookie-gia.jpg](02-mo-inventory-item-html-bang-cookie-gia.jpg) |
