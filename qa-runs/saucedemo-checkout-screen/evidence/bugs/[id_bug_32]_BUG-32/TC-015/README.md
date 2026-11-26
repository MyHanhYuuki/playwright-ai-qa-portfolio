# TC-015 error_user: thiếu Last Name thì báo lỗi, không sang Tổng quan

- **Kết quả**: ❌ Failed · Bug: BUG-32
- **Nhóm**: Màn hình 1: Thông tin (/checkout-step-one.html)
- **Tags**: @AC-2 @info @overview @BUG-32
- **Thời điểm**: 2026-11-26T08:36:37.007Z
- **Video**: [video.webm](video.webm) (quay ở lần chạy ngày 2026-11-26, lần này không quay lại: EVIDENCE_KEEP_VIDEOS)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1 (Ann / trống / trống) | Mong đợi: ở lại Thông tin, "Error: Last Name is required" | ![01-bien-the-1-ann-trong-trong.jpg](01-bien-the-1-ann-trong-trong.jpg) |
| 2 | Biến thể 2 (Ann / trống / 70000) | Mong đợi: ở lại Thông tin, "Error: Last Name is required" | ![02-bien-the-2-ann-trong-70000.jpg](02-bien-the-2-ann-trong-70000.jpg) |
