# TC-051 Finish chỉ tạo đơn theo giỏ / phiên hiện tại (2 tab, sau Reset, giỏ đổi ở tab khác, đăng xuất ở tab khác)

- **Kết quả**: ❌ Failed · Bug: BUG-35
- **Nhóm**: Màn hình 2: Tổng quan (/checkout-step-two.html)
- **Tags**: @AC-5 @overview @complete @BUG-35
- **Thời điểm**: 2026-11-26T08:36:57.391Z
- **Video**: [video.webm](video.webm) (quay ở lần chạy ngày 2026-11-26, lần này không quay lại: EVIDENCE_KEEP_VIDEOS)

| Bước | Thao tác | Cần xem | Ảnh |
|---|---|---|---|
| 1 | Biến thể 1: Finish ở tab 2 sau khi tab 1 đã đặt | Mong đợi: tab 2 không hiện "Thank you for your order!" | ![01-bien-the-1-finish-o-tab-2-sau-khi-tab-1-.jpg](01-bien-the-1-finish-o-tab-2-sau-khi-tab-1-.jpg) |
| 2 | Biến thể 2: Finish sau Reset App State | Mong đợi: không hiện "Thank you for your order!" | ![02-bien-the-2-finish-sau-reset-app-state.jpg](02-bien-the-2-finish-sau-reset-app-state.jpg) |
| 3 | Biến thể 3: Finish sau khi tab khác thêm Onesie | Mong đợi: đơn (PDF) có cả Onesie, Total 41.02; hoặc không đặt và giỏ giữ [4,2] | ![03-bien-the-3-finish-sau-khi-tab-khac-them-.jpg](03-bien-the-3-finish-sau-khi-tab-khac-them-.jpg) |
| 4 | Biến thể 4: Finish sau khi tab khác bỏ Onesie | Mong đợi: đơn (PDF) chỉ Backpack, Total 32.39; hoặc không đặt và giỏ giữ [4] | ![04-bien-the-4-finish-sau-khi-tab-khac-bo-on.jpg](04-bien-the-4-finish-sau-khi-tab-khac-bo-on.jpg) |
| 5 | Biến thể 5: Finish sau khi tab khác đăng xuất | Mong đợi: bị chặn về trang đăng nhập và giỏ giữ nguyên | ![05-bien-the-5-finish-sau-khi-tab-khac-dang-.jpg](05-bien-the-5-finish-sau-khi-tab-khac-dang-.jpg) |
| 6 | Biến thể 5: đăng nhập lại | Mong đợi: số giỏ = 2 (giá trị ngay trước Finish) | ![06-bien-the-5-dang-nhap-lai.jpg](06-bien-the-5-dang-nhap-lai.jpg) |

## Ghi nhận (annotation)

| Loại | Nội dung |
|---|---|
| Biến thể 3 PDF | Swag Labs \| Order Receipt \| ORDER DETAILS \| Order Date \| November 26, 2026 at 3:36 PM \| SHIP TO \| An Le \| 70000 \| ITEMS \| DESCRIPTION \| PRICE \| Sauce Labs Backpack \| $ \| 29.99 \| Item total \| $ \| 29.99 \| Tax \| $ \| 2.40 \| Total \| $ \| 32.39 \| Thank you for your order! It has been dispatched, and will arrive just as fast as the pony can get there. |
| Biến thể 4 PDF | Swag Labs \| Order Receipt \| ORDER DETAILS \| Order Date \| November 26, 2026 at 3:36 PM \| SHIP TO \| An Le \| 70000 \| ITEMS \| DESCRIPTION \| PRICE \| Sauce Labs Backpack \| $ \| 29.99 \| Sauce Labs Onesie \| $ \| 7.99 \| Item total \| $ \| 37.98 \| Tax \| $ \| 3.04 \| Total \| $ \| 41.02 \| Thank you for your order! It has been dispatched, and will arrive just as fast as the pony can get there. |
| Biến thể 5: cart-contents ngay trước Finish | [4,2] |
