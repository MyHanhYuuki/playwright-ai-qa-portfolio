# TC-020 Số tiền luôn dạng $x.xx (giỏ gây lỗi số thực, giỏ rỗng, mọi tài khoản)

- **Kết quả**: ❌ Failed · Bug: BUG-25
- **Nhóm**: Màn hình 2: Tổng quan (/checkout-step-two.html)
- **Tags**: @AC-4 @overview @BUG-25
- **Thời điểm**: 2026-11-26T07:13:30.157Z
- **Video**: [video.webm](video.webm)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1 [0,5] qua giao diện | Mong đợi: "Item total: $59.98", "Tax: $4.80", "Total: $64.78" | ![01-bien-the-1-0-5-qua-giao-dien.jpg](01-bien-the-1-0-5-qua-giao-dien.jpg) |
| 2 | Biến thể 2 [2,5] | Mong đợi: "Item total: $57.98", "Tax: $4.64", "Total: $62.62" | ![02-bien-the-2-2-5.jpg](02-bien-the-2-2-5.jpg) |
| 3 | Biến thể 3 [0,1,2,4] | Mong đợi: "Item total: $63.96", "Tax: $5.12", "Total: $69.08" | ![03-bien-the-3-0-1-2-4.jpg](03-bien-the-3-0-1-2-4.jpg) |
| 4 | Biến thể 4 [0,1,2,5] | Mong đợi: "Item total: $83.96", "Tax: $6.72", "Total: $90.68" | ![04-bien-the-4-0-1-2-5.jpg](04-bien-the-4-0-1-2-5.jpg) |
| 5 | Biến thể 5 [4,3,2,1,0] | Mong đợi: "Item total: $79.95", "Tax: $6.40", "Total: $86.35" | ![05-bien-the-5-4-3-2-1-0.jpg](05-bien-the-5-4-3-2-1-0.jpg) |
| 6 | Biến thể 6 giỏ rỗng | Mong đợi: "Item total: $0.00", "Tax: $0.00", "Total: $0.00" | ![06-bien-the-6-gio-rong.jpg](06-bien-the-6-gio-rong.jpg) |
| 7 | Biến thể 7 visual_user [0,5] | Mong đợi: "Item total: $59.98", "Tax: $4.80", "Total: $64.78" | ![07-bien-the-7-visual-user-0-5.jpg](07-bien-the-7-visual-user-0-5.jpg) |
| 8 | Biến thể 8 performance_glitch_user [0,5] | Mong đợi: "Item total: $59.98", "Tax: $4.80", "Total: $64.78" | ![08-bien-the-8-performance-glitch-user-0-5.jpg](08-bien-the-8-performance-glitch-user-0-5.jpg) |
| 9 | Biến thể 9 error_user [0,5] | Mong đợi: "Item total: $59.98", "Tax: $4.80", "Total: $64.78" | ![09-bien-the-9-error-user-0-5.jpg](09-bien-the-9-error-user-0-5.jpg) |
| 10 | Biến thể 10: kết thúc quét 120 giỏ | Đã quét 120/120 giỏ, 26 giỏ sai định dạng $x.xx | ![10-bien-the-10-ket-thuc-quet-120-gio.jpg](10-bien-the-10-ket-thuc-quet-120-gio.jpg) |
| 11 | Biến thể 11 problem_user [4,0,2] | Mong đợi: cả 3 số dạng $x.xx (không kiểm giá trị) | ![11-bien-the-11-problem-user-4-0-2.jpg](11-bien-the-11-problem-user-4-0-2.jpg) |
