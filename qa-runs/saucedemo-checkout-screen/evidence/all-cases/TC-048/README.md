# TC-048 error_user: các thao tác không lỗi vẫn đúng như standard_user

- **Kết quả**: ✅ Passed
- **Nhóm**: Chung: nhiều màn hình (luồng chính, kiểm soát truy cập, tài khoản, nhiều tab)
- **Tags**: @AC-1 @AC-2 @AC-3 @AC-4 @AC-5 @info @overview
- **Thời điểm**: 2026-11-26T07:34:58.772Z
- **Video**: (chỉ quay video cho test có bug hoặc kết quả bất thường)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Bước 4: Tổng quan | 3 dòng đúng TD-06, $47.97 / $3.84 / $51.81 | ![01-buoc-4-tong-quan.jpg](01-buoc-4-tong-quan.jpg) |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| BUG-21 (SD-102, tham khảo) | 3 lỗi / báo lỗi khi ở trang chi tiết (bước 5): Bước 5 (chi tiết Sauce Labs Backpack) [/inventory-item.html]: https://submit.backtrace.io/UNIVERSE/TOKEN/json \| Bước 5 (chi tiết Sauce Labs Bike Light) [/inventory-item.html]: https://submit.backtrace.io/UNIVERSE/TOKEN/json \| Bước 5 (chi tiết Sauce Labs Onesie) [/inventory-item.html]: https://submit.backtrace.io/UNIVERSE/TOKEN/json |
