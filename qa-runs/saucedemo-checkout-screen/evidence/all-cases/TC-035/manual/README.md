# TC-035 · Bước 3 (chạy tay): mở biên nhận PDF bằng trình đọc PDF

> **Chạy tay** (executor, Phase 2b, lý do M2 + M3), ngày 2026-11-26. File: [`../swag-labs-order-2026-11-26_07-12-24.pdf`](../swag-labs-order-2026-11-26_07-12-24.pdf) do bước 1–2 tự động tạo (giỏ `[4,2]`, An / Le / 70000).

| Bước | Làm gì | Kết quả |
|---|---|---|
| 3a | Mở file bằng **pdf.js** (trình đọc PDF của Mozilla, bản 3.11.174, cũng là trình xem PDF của Firefox) | Mở được, 1 trang A4 (595 × 842 pt), không báo lỗi, 48 đoạn chữ, 2 font |
| 3b | Chụp trang ([01-bien-nhan-pdf-trang-1.png](01-bien-nhan-pdf-trang-1.png)); **người đánh giá: executor (AI) đọc ảnh trang do pdf.js vẽ**, qa-reviewer xem lại cùng ảnh và đồng ý (review-executor D1). Người dùng xem lại ảnh ở HITL #3 | Mọi chữ đọc được, không chồng, không bị cắt. Tiêu đề `Swag Labs` / `Order Receipt`; `ORDER DETAILS` · `Order Date` `November 26, 2026 at 2:12 PM`; `SHIP TO` `An Le` / `70000`; bảng `DESCRIPTION` / `PRICE`: `Sauce Labs Backpack` `$29.99`, `Sauce Labs Onesie` `$7.99`; `Item total` `$37.98`, `Tax` `$3.04`, `Total` `$41.02` thẳng cột giá; dòng cảm ơn cuối trang |

**Kết luận: Passed** (khớp expected của TC-035).

**Ghi nhận thêm (ngoài expected, đưa vào triage):** giờ trong **tên file** (`07-12-24`) là giờ **UTC**, còn `Order Date` trong biên nhận là **giờ máy người dùng** (`2:12 PM`, UTC+7). Kiểm thêm bằng 3 múi giờ (Asia/Ho_Chi_Minh, UTC, America/New_York): tên file luôn theo UTC.
