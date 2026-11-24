# TC-016 username có khoảng trắng đầu bị từ chối

- **Kết quả**: ✅ Đúng như mong đợi · status=`passed`
- **Tags**: @AC-4
- **Thời điểm**: 2026-11-24T09:45:10.027Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Nhập dữ liệu sai | Username có dấu cách ở đầu | ![01-nhap-du-lieu-sai.jpg](01-nhap-du-lieu-sai.jpg) |
| 2 | Thông báo lỗi | Đúng nguyên văn "…do not match any user in this service", vẫn ở trang đăng nhập | ![02-thong-bao-loi.jpg](02-thong-bao-loi.jpg) |
