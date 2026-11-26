# TC-026 problem_user: Item total, Tax, Total đúng như standard_user

- **Kết quả**: ❌ Failed · Bug: BUG-29
- **Nhóm**: Màn hình 2: Tổng quan (/checkout-step-two.html)
- **Tags**: @AC-4 @overview @complete @BUG-29
- **Thời điểm**: 2026-11-26T08:36:32.985Z
- **Video**: [video.webm](video.webm) (quay ở lần chạy ngày 2026-11-26, lần này không quay lại: EVIDENCE_KEEP_VIDEOS)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Giỏ [4] | Mong đợi như standard_user: Item total: $29.99, Tax: $2.40, Total: $32.39 | ![01-gio-4.jpg](01-gio-4.jpg) |
| 2 | Giỏ [0] | Mong đợi như standard_user: Item total: $9.99, Tax: $0.80, Total: $10.79 | ![02-gio-0.jpg](02-gio-0.jpg) |
| 3 | Giỏ [2] | Mong đợi như standard_user: Item total: $7.99, Tax: $0.64, Total: $8.63 | ![03-gio-2.jpg](03-gio-2.jpg) |
| 4 | Giỏ [4,2] | Mong đợi như standard_user: Item total: $37.98, Tax: $3.04, Total: $41.02 | ![04-gio-4-2.jpg](04-gio-4-2.jpg) |
| 5 | Giỏ [4,0,2] | Mong đợi như standard_user: Item total: $47.97, Tax: $3.84, Total: $51.81 | ![05-gio-4-0-2.jpg](05-gio-4-0-2.jpg) |
| 6 | Giỏ [4,0,1,5,2,3] | Mong đợi như standard_user: Item total: $129.94, Tax: $10.40, Total: $140.34 | ![06-gio-4-0-1-5-2-3.jpg](06-gio-4-0-1-5-2-3.jpg) |
| 7 | Biến thể PDF: đã tải biên nhận [4,2] | Mong đợi PDF: Item total 37.98, Tax 3.04, Total 41.02 (chữ trong file ở annotation "PDF problem_user") | ![07-bien-the-pdf-da-tai-bien-nhan-4-2.jpg](07-bien-the-pdf-da-tai-bien-nhan-4-2.jpg) |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| PDF problem_user | Swag Labs \| Order Receipt \| ORDER DETAILS \| Order Date \| November 26, 2026 at 3:36 PM \| ITEMS \| DESCRIPTION \| PRICE \| Sauce Labs Backpack \| $ \| 29.99 \| Sauce Labs Onesie \| $ \| 7.99 \| Item total \| $ \| 75.96 \| Tax \| $ \| 6.08 \| Total \| $ \| 82.04 \| Thank you for your order! It has been dispatched, and will arrive just as fast as the pony can get there. |
