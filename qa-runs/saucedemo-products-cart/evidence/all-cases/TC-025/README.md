# TC-025 số trên giỏ luôn bằng số sản phẩm thật

- **Kết quả**: ❌ Failed · Bug: BUG-06
- **Nhóm**: Màn hình 2: Chi tiết sản phẩm (/inventory-item.html?id=<n>)
- **Tags**: @AC-3 @AC-5 @AC-6 @detail @cart @BUG-06
- **Thời điểm**: 2026-11-25T08:13:08.979Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Sản phẩm id=99 sau khi bấm nút | Mong đợi: báo không tìm thấy, KHÔNG có nút Add to cart, giỏ không có số | ![01-san-pham-id-99-sau-khi-bam-nut.jpg](01-san-pham-id-99-sau-khi-bam-nut.jpg) |
| 2 | Giỏ với dữ liệu trùng id [4,4] | Mong đợi: số giỏ 1, 1 dòng Backpack số lượng 1 | ![02-gio-voi-du-lieu-trung-id-4-4.jpg](02-gio-voi-du-lieu-trung-id-4-4.jpg) |
| 3 | Giỏ với dữ liệu id lạ [4,"x"] | Mong đợi: số giỏ 1, 1 dòng Backpack | ![03-gio-voi-du-lieu-id-la-4-x.jpg](03-gio-voi-du-lieu-id-la-4-x.jpg) |
