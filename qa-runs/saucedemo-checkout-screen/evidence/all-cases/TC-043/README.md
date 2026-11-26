# TC-043 Tài khoản đăng nhập sau không đặt hàng bằng giỏ của tài khoản trước (2 chiều)

- **Kết quả**: ❌ Failed · Bug: BUG-07
- **Nhóm**: Chung: nhiều màn hình (luồng chính, kiểm soát truy cập, tài khoản, nhiều tab)
- **Tags**: @AC-5 @info @overview @complete @security @BUG-07
- **Thời điểm**: 2026-11-26T08:37:13.203Z
- **Video**: [video.webm](video.webm) (quay ở lần chạy ngày 2026-11-26, lần này không quay lại: EVIDENCE_KEEP_VIDEOS)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1: giỏ của visual_user | Mong đợi: giỏ trống, không có Sauce Labs Backpack của standard_user | ![01-bien-the-1-gio-cua-visual-user.jpg](01-bien-the-1-gio-cua-visual-user.jpg) |
| 2 | Biến thể 1: standard_user đăng nhập lại | Mong đợi: số giỏ 1, còn Sauce Labs Backpack | ![02-bien-the-1-standard-user-dang-nhap-lai.jpg](02-bien-the-1-standard-user-dang-nhap-lai.jpg) |
| 3 | Biến thể 2: giỏ của standard_user | Mong đợi: giỏ trống, không có Sauce Labs Onesie của visual_user | ![03-bien-the-2-gio-cua-standard-user.jpg](03-bien-the-2-gio-cua-standard-user.jpg) |
| 4 | Biến thể 2: visual_user đăng nhập lại | Mong đợi: số giỏ 1, còn Sauce Labs Onesie | ![04-bien-the-2-visual-user-dang-nhap-lai.jpg](04-bien-the-2-visual-user-dang-nhap-lai.jpg) |
