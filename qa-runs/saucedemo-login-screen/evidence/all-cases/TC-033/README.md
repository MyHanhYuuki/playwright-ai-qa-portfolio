# TC-033 cookie phiên tự tạo không được vào trang bên trong

- **Kết quả**: ❌ Failed · Bug: BUG-02
- **Tags**: @AC-6 @BUG-02 @security
- **Thời điểm**: 2026-11-24T10:23:25.296Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Chưa đăng nhập | Đang ở trang đăng nhập, CHƯA đăng nhập | ![01-chua-dang-nhap.jpg](01-chua-dang-nhap.jpg) |
| 2 | Kết quả: BUG | BUG-02: chỉ tự tạo cookie session-username=standard_user là vào được trang Products. Mong đợi: bị chặn | ![02-ket-qua-bug.jpg](02-ket-qua-bug.jpg) |
