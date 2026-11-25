# Triage Report: run-20261125-150817

- **Phạm vi**: toàn bộ `tests/specs/saucedemo-products-cart-screen.spec.ts` (46 test, 3 màn hình) · 84 giây
- **Môi trường**: Playwright 1.65.1 · Chromium (Desktop Chrome, 1280×720) · Node 26 · Windows 11 · https://www.saucedemo.com · 9 workers (mặc định của Playwright: một nửa số nhân, máy có 18 nhân logic; trên CI là 1), `--retries=0` khi chạy lặp
- **Kết quả chi tiết**: [`run-results/run-20261125-150817.json`](run-results/run-20261125-150817.json). Mỗi test có `errors` (tên assertion), `error_details` (đủ Expected / Received) và `annotations`. Mọi giá trị "Actual" dưới đây trích từ `error_details`.
- **Kiểm tra độ ổn định**: [`run-results/stability-20261125-1512.json`](run-results/stability-20261125-1512.json): cả bộ × 2 lần, 92/92 đúng như mong đợi, không test chập chờn. File này chỉ ghi "đúng như mong đợi / không", không chứa nội dung lỗi, nên chỉ chứng minh test ổn định.
- **Kiểm tra lỗi bị che**: `test:run` không cảnh báo lỗi code test (dò **toàn bộ** nội dung lỗi). Đọc `error_details` của 17 test bug đã biết: mọi lỗi đều là assertion của bug.
- **Evidence** là một lần chạy riêng (`npm run test:evidence`) ngay sau lần chạy chính thức, cùng code. Với BUG-14 giá đổi ngẫu nhiên mỗi lần tải, nên giá trên ảnh khác giá trong run JSON.
- Các lần chạy trước giữ lại làm lịch sử, không dùng cho RTM: `run-20261125-002432` (bản nháp code), `run-20261125-105852` (trước khi sửa theo review-executor, review-test-impl-r2), `run-20261125-123044` (45 test, trước review-defects), `run-20261125-140215` (trước review cuối: TC-046 chưa kiểm mô tả).

## Summary
| Status | Count | Ghi chú |
|--------|-------|---------|
| **Passed** | 29 | Gồm TC-034: pass như thiết kế, chỉ ghi lại thời gian của BUG-17 |
| **Failed** | 17 | 17 bug đã biết (16 duyệt ở HITL #3 + BUG-21), fail **đúng assertion** của bug. Playwright báo "passed" vì có `test.fail()`, nhưng kết quả test case là **Failed** |
| flaky | 0 | |
| script-issue | 0 | Đã sửa hết trong bước này, xem mục "Lỗi code test đã sửa" |
| real-bug | **17** | HITL #3: ✅ approved cả 16 bug (2026-11-25), giữ mức đề xuất, riêng **BUG-06 nâng lên Medium**. **BUG-21** phát hiện ở review-defects A3, người duyệt chốt Low, sau review cuối (mất mô tả) nâng **Medium** (2026-11-25) |

## Real Bugs (→ HITL #3: ✅ đã duyệt 2026-11-25)
"Lỗi bắt được" = số điểm kiểm sai trong `error_details`. Màn hình theo `known-issues.md`.

### Chung: lỗi ở nhiều màn hình
| Bug | TC | Màn hình | Lỗi bắt được | Actual | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-05 | TC-041 | Cả 3 | 3 | Sau Reset App State: danh sách, nút Backpack vẫn `Remove`; chi tiết, vẫn `Remove` (không có `Add to cart`); giỏ, vẫn 1 dòng. Số trên giỏ **đã** mất ở cả 3 trang | Medium |
| BUG-06 | TC-025 | Chi tiết + Giỏ | 11 | id=6, 99, -1: có nút `Add to cart`, bấm xong giỏ hiện số. `[4,4]`: số giỏ 2, 2 dòng Backpack (mỗi dòng số lượng 1). `[4,"x"]`: số giỏ 2 nhưng giỏ đúng 1 dòng Backpack | **Medium** (HITL #3 nâng từ Low) |
| BUG-07 | TC-040 | Danh sách + Giỏ | 8 | Biến thể 1: `visual_user` thấy số giỏ và 2 sản phẩm của `standard_user`. Biến thể 2 (chiều ngược): `standard_user` thấy 1 sản phẩm của `visual_user`. Biến thể 3 (ghi): `standard_user` đăng nhập lại có số giỏ 3, thêm Onesie do `visual_user` thêm. Biến thể 4 (xóa): `standard_user` mất Backpack do `visual_user` bỏ | High |
| BUG-10 | TC-018 | Danh sách + Chi tiết | 24 | `problem_user`: Remove không ăn (Backpack, Bike Light, Onesie), Add không ăn (Bolt T-Shirt, Fleece Jacket, Red T-Shirt), ở **cả** danh sách và chi tiết: 12 biến thể × (nút + số giỏ) | High |
| BUG-11 | TC-024 | Danh sách + Giỏ → Chi tiết | 36 | `problem_user`: bấm tên, ảnh ở danh sách **và** tên ở giỏ đều mở sản phẩm **id + 1**: Bike Light (0) → id 1, Bolt (1) → 2, Onesie (2) → 3, Red (3) → 4, Backpack (4) → 5, Fleece (5) → 6 `ITEM NOT FOUND`. 18 điểm × (URL + tên) | High |
| BUG-13 | TC-019 | Danh sách + Chi tiết | 24 | `error_user`: giống BUG-10, cùng 3 + 3 sản phẩm, cả 2 trang. Mỗi lần thao tác không ăn, trang ném lỗi JavaScript (`pageerror`, ghi trong `annotations`): MSG-05 `Failed to add item to the cart.`, MSG-06 `Failed to remove item from cart.` | High |
| BUG-14 | TC-013 | Cả 3 | 7 | `visual_user`: giá 6 sản phẩm ở danh sách sai (lần chạy này Backpack $72.82…); giá chi tiết, giỏ đúng $29.99 nên danh sách khác chi tiết, giỏ | Critical với hệ thống thật (sai giá) |
| BUG-16 | TC-035 | Cả 3 | 13 | `visual_user`, ở cả 3 trang: biểu tượng giỏ lệch 186 px ngang, 29 px dọc và xoay 3° (`matrix(0.99863, 0.052336, …)`), biểu tượng menu xoay 3°; nút Add của Red T-Shirt lệch 54 px ngang | Low |
| BUG-02 (biến thể) | TC-045 | Chi tiết + Giỏ | 6 | Cookie tự tạo vào được `/cart.html` và `/inventory-item.html?id=4`: không về trang đăng nhập, không có thông báo, thấy nội dung | High (như BUG-02) |

### Màn hình 1: Danh sách sản phẩm
| Bug | TC | Màn hình | Lỗi bắt được | Actual | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-08 | TC-004 | Danh sách | 6 | `problem_user`: cả 6 ảnh là `sl-404` | Medium |
| BUG-09 | TC-011 | Danh sách | 6 | `problem_user`: 3 kiểu sắp xếp, nhãn dropdown và thứ tự đều không đổi | High |
| BUG-12 | TC-012 | Danh sách | 9 | `error_user`: 3 kiểu sắp xếp, nhãn và thứ tự không đổi; mỗi lần hiện hộp thoại `Sorting is broken! This error has been reported to Backtrace.` (đúng MSG-01, ghi trong `annotations`) | High |
| BUG-15 | TC-005 | Danh sách | 1 | `visual_user`: chỉ ảnh Backpack là `sl-404` | Low |

### Màn hình 2: Chi tiết sản phẩm
| Bug | TC | Màn hình | Lỗi bắt được | Actual | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-20 | TC-026 | Chi tiết | 8 | `4abc`, `04`, `4.9`, `0x4`, ` 4`, `+4`, `4e0` mở Backpack; `-0` mở Bike Light. `abc` và rỗng báo `ITEM NOT FOUND` đúng | Low |
| BUG-21 | TC-046 | Chi tiết | 18 | `error_user`, cả 6 trang chi tiết: **không có mô tả sản phẩm**, console báo `Error: This component failed to render!` (MSG-07, ghi trong `annotations`), 1 request tới `submit.backtrace.io`; tên, giá đúng. Thử test với `standard_user`: pass (test phân biệt đúng / sai) | Medium (người duyệt nâng từ Low sau review cuối) |

### Màn hình 3: Giỏ hàng
| Bug | TC | Màn hình | Lỗi bắt được | Actual | Severity (dự kiến) |
|---|---|---|---|---|---|
| BUG-18 | TC-036 | Giỏ | 1 | `visual_user`: nút Checkout cao hơn Continue Shopping 412 px (bị đẩy lên vùng tiêu đề). Mốc `standard_user` cùng hàng (pass) | Medium |
| BUG-19 | TC-030 | Giỏ | 2 | Giỏ trống bấm Checkout vẫn sang `/checkout-step-one.html`, tiêu đề `Checkout: Your Information` | Low |

## Bug chỉ ghi nhận, không đánh fail
| Bug | TC | Kết quả | Ghi chú |
|---|---|---|---|
| BUG-17 | TC-034 | ✅ Passed | `performance_glitch_user` sắp xếp (trích `annotations`): Z→A 5 033 ms, giá thấp→cao 5 032 ms, giá cao→thấp 5 030 ms, A→Z 5 030 ms (`standard_user` ~18 ms). Theo Q10: ghi nhận, không đánh fail; báo kèm IMP-04 |

## Lỗi code test đã sửa trong bước này (không phải bug của web)
| # | Lỗi | Phát hiện | Xử lý |
|---|---|---|---|
| S1 | TC-043 fail trên CI (3/3 lần), pass trên máy | CI của commit `abd6dc5` | Đăng xuất đổi URL trước, form đăng nhập hiện sau; test bấm Back quá sớm. `logout()` chờ nút Login |
| S2 | TC-024 hết giờ, 5/12 biến thể không chạy, bị `test.fail()` che | review-script-gen D1 | Tăng giới hạn thời gian (nay 120 giây cho 18 điểm) |
| S3 | TC-022 đọc nút của trang chi tiết (trang cũ còn trên màn hình) nên pass mà không kiểm | review-script-gen D2 | Page Object tự chờ phần tử riêng của trang đích |
| S4 | TC-025 `ReferenceError` do biến bị xóa sót, bị tính nhầm là bug | Đọc lỗi | Sửa; thêm `npm run typecheck` |
| S5 | Chụp evidence TC-018/019 chờ khoanh một nút không tồn tại tới hết 120 giây, chỉ có 1/12 ảnh | Đếm số ảnh trong evidence | Evidence chờ tối đa 1 giây; cảnh báo lỗi code test trong evidence |
| S6 | SD-101 TC-006 chập chờn trên CI (bước chờ tiêu đề chỉ 5 giây) | CI của commit `abd6dc5` | Ngưỡng 10 giây áp cho cả bước đó |
| S7 | TC-025 kiểm số lượng gặp `strict mode violation` (2 dòng cùng tên), cảnh báo cũ không thấy vì chỉ đọc dòng đầu của lỗi | review-executor C1, D1 | Kiểm số lượng từng dòng; cảnh báo dò toàn bộ nội dung lỗi |
| S8 | Run JSON mới thêm `annotations` chứa **đường dẫn máy** (`location.file`) | Quét thông tin cá nhân trước khi commit | `run-tests.mjs` chỉ giữ `type`, `description`, thay đường dẫn repo trong lỗi bằng `<repo>` |

## Tái hiện độc lập
✅ Xong (2026-11-25) cho cả 17 bug: script riêng `tests/repro/saucedemo-products-cart-screen.repro.ts` (`npm run repro`), không dùng code test, mỗi tình huống phiên trình duyệt mới, chạy 2 lần (16 bug 2/2 giống nhau; BUG-14 2/2 đều sai giá, giá trị đổi đúng bản chất bug). Ảnh và README trong `evidence/bugs/<bug>/manual/`. Chi tiết từng bug: [`defects.md`](defects.md).

Evidence đầy đủ của 46 test case, chia theo màn hình (ảnh có khoanh đỏ + ghi chú; video cho test có bug): [`evidence/README.md`](evidence/README.md)

## Ghi nhận khác
| # | Nội dung |
|---|---|
| N1 | CI: commit `3af64b2` đỏ vì chạy trên code chưa có bản sửa S1; từ commit `444b65d` CI xanh (79/79, ~7 phút). Code cuối của tính năng (46 test) chạy CI khi commit cùng review cuối. CI ~7 phút vẫn trên mục tiêu "dưới 2 phút" (§10), xử lý ở Bài 11 |
| N2 | Test dài nhất: TC-024 78 giây (giới hạn 120), TC-018, TC-019 57 giây (giới hạn 120), TC-040 28 giây (giới hạn 90) |
| N3 | Video: chỉ quay cho test có bug hoặc kết quả bất thường; video cũ của test pass giữ nguyên (quyết định 2026-11-25) |
