# TC-005 Ô chỉ có khoảng trắng / ký tự tab bị coi như trống

- **Kết quả**: ❌ Failed · Bug: BUG-34
- **Nhóm**: Màn hình 1: Thông tin (/checkout-step-one.html)
- **Tags**: @AC-2 @info @BUG-34
- **Thời điểm**: 2026-11-26T08:37:08.370Z
- **Video**: [video.webm](video.webm) (quay ở lần chạy ngày 2026-11-26, lần này không quay lại: EVIDENCE_KEEP_VIDEOS)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1 (cả 3 ô 1 khoảng trắng) | Mong đợi: ở lại trang Thông tin, "Error: First Name is required" | ![01-bien-the-1-ca-3-o-1-khoang-trang.jpg](01-bien-the-1-ca-3-o-1-khoang-trang.jpg) |
| 2 | Biến thể 2 (First 3 khoảng trắng) | Mong đợi: ở lại trang Thông tin, "Error: First Name is required" | ![02-bien-the-2-first-3-khoang-trang.jpg](02-bien-the-2-first-3-khoang-trang.jpg) |
| 3 | Biến thể 3 (Last 3 khoảng trắng) | Mong đợi: ở lại trang Thông tin, "Error: Last Name is required" | ![03-bien-the-3-last-3-khoang-trang.jpg](03-bien-the-3-last-3-khoang-trang.jpg) |
| 4 | Biến thể 4 (Zip 3 khoảng trắng) | Mong đợi: ở lại trang Thông tin, "Error: Postal Code is required" | ![04-bien-the-4-zip-3-khoang-trang.jpg](04-bien-the-4-zip-3-khoang-trang.jpg) |
| 5 | Biến thể 5 (Zip 1 ký tự tab) | Mong đợi: ở lại trang Thông tin, "Error: Postal Code is required" | ![05-bien-the-5-zip-1-ky-tu-tab.jpg](05-bien-the-5-zip-1-ky-tu-tab.jpg) |
