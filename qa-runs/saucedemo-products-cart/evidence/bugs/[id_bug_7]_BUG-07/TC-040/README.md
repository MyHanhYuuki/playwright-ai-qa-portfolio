# TC-040 tài khoản khác không thấy và không sửa được giỏ của người trước

- **Kết quả**: ❌ Failed · Bug: BUG-07
- **Nhóm**: Chung: nhiều màn hình (tài khoản, giỏ, menu, kiểm soát truy cập)
- **Tags**: @AC-7 @list @cart @security @BUG-07
- **Thời điểm**: 2026-11-25T05:07:22.823Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1: visual_user vừa đăng nhập | Mong đợi: giỏ trống (không có số), không thấy giỏ của standard_user | ![01-bien-the-1-visual-user-vua-dang-nhap.jpg](01-bien-the-1-visual-user-vua-dang-nhap.jpg) |
| 2 | Biến thể 1: giỏ của visual_user | Mong đợi: giỏ trống, không có sản phẩm của standard_user | ![02-bien-the-1-gio-cua-visual-user.jpg](02-bien-the-1-gio-cua-visual-user.jpg) |
| 3 | Biến thể 2: giỏ của standard_user | Mong đợi: giỏ trống, không có Onesie của visual_user | ![03-bien-the-2-gio-cua-standard-user.jpg](03-bien-the-2-gio-cua-standard-user.jpg) |
| 4 | Biến thể 3: giỏ của standard_user sau khi visual_user thêm Onesie | Mong đợi: đúng 2 dòng Backpack, Bike Light, không có Onesie | ![04-bien-the-3-gio-cua-standard-user-sau-khi.jpg](04-bien-the-3-gio-cua-standard-user-sau-khi.jpg) |
