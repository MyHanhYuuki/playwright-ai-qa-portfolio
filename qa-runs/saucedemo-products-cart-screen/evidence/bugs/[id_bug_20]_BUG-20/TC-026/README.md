# TC-026 id sai định dạng xử lý như sản phẩm không tồn tại

- **Kết quả**: ❌ Failed · Bug: BUG-20
- **Nhóm**: Màn hình 2: Chi tiết sản phẩm (/inventory-item.html?id=<n>)
- **Tags**: @AC-5 @detail @BUG-20
- **Thời điểm**: 2026-11-25T08:13:05.258Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | id=abc | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![01-id-abc.jpg](01-id-abc.jpg) |
| 2 | id=(rỗng) | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![02-id-rong.jpg](02-id-rong.jpg) |
| 3 | id=4abc | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![03-id-4abc.jpg](03-id-4abc.jpg) |
| 4 | id=04 | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![04-id-04.jpg](04-id-04.jpg) |
| 5 | id=4.9 | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![05-id-4-9.jpg](05-id-4-9.jpg) |
| 6 | id=0x4 | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![06-id-0x4.jpg](06-id-0x4.jpg) |
| 7 | id=%204 | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![07-id-204.jpg](07-id-204.jpg) |
| 8 | id=%2B4 | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![08-id-2b4.jpg](08-id-2b4.jpg) |
| 9 | id=-0 | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![09-id-0.jpg](09-id-0.jpg) |
| 10 | id=4e0 | Mong đợi: ITEM NOT FOUND, không mở sản phẩm nào | ![10-id-4e0.jpg](10-id-4e0.jpg) |
