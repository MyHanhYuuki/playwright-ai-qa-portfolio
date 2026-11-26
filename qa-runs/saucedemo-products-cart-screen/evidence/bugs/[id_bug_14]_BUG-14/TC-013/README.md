# TC-013 visual_user: giá ở danh sách đúng và khớp trang chi tiết, giỏ

- **Kết quả**: ❌ Failed · Bug: BUG-14
- **Nhóm**: Chung: nhiều màn hình (tài khoản, giỏ, menu, kiểm soát truy cập)
- **Tags**: @AC-1 @AC-5 @list @detail @cart @BUG-14
- **Thời điểm**: 2026-11-26T09:41:13.029Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Giá ở danh sách (visual_user) | Mong đợi: giá đúng TD-06 (Backpack $29.99, Bike Light $9.99…) | ![01-gia-o-danh-sach-visual-user.jpg](01-gia-o-danh-sach-visual-user.jpg) |
| 2 | Giá ở danh sách sau khi tải lại | Mong đợi: giá giữ nguyên và đúng TD-06. Lần 1: $5.49, $77.44, $89.08, $87.38, $98.73, $82.54 | ![02-gia-o-danh-sach-sau-khi-tai-lai.jpg](02-gia-o-danh-sach-sau-khi-tai-lai.jpg) |
| 3 | Giá ở chi tiết Backpack | Mong đợi: $29.99, bằng giá ở danh sách (danh sách hiện $80.25) | ![03-gia-o-chi-tiet-backpack.jpg](03-gia-o-chi-tiet-backpack.jpg) |
| 4 | Giá ở giỏ | Mong đợi: $29.99, bằng giá ở danh sách (danh sách hiện $80.25) | ![04-gia-o-gio.jpg](04-gia-o-gio.jpg) |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| giá ở danh sách (2 lần tải) | lần 1: $5.49, $77.44, $89.08, $87.38, $98.73, $82.54 · lần 2: $80.25, $37.19, $21.47, $46.49, $15, $34.45 |
