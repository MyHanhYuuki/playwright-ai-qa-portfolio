# Bug phát hiện sớm và lưu ý khi test: SD-102 Sản phẩm, chi tiết, giỏ hàng

> Các bug và vấn đề **đã thấy trong lúc phân tích, trước khi chạy test**. Mỗi bug phải được test tương ứng bắt được (fail đúng chỗ). Bug nào không bắt được tức là test sai.
> Bug chỉ chính thức thành **defect** sau khi chạy test và duyệt ở HITL #3 (`defects.md`).
> **BUG-xx đánh số chung cả repo**: SD-101 đã dùng BUG-01 → BUG-04, nên ở đây là BUG-05 → BUG-20.
> HITL #1 (2026-11-24) đồng ý mọi đề xuất: các bug dưới đây đều giữ, tài khoản đặc biệt phải hoạt động như `standard_user` (Q1). Cột "Viewpoint / TC phải bắt": TC do test-impl điền.

## Bug đã biết (chia theo màn hình)

### Chung: lỗi ở nhiều màn hình
| ID | Màn hình | Mô tả | Bằng chứng | Mức (dự kiến) | Viewpoint / TC phải bắt | Trạng thái |
|---|---|---|---|---|---|---|
| BUG-05 | Cả 3 | **Reset App State** xóa giỏ nhưng giao diện không cập nhật: nút vẫn `Remove` (danh sách, chi tiết), trang giỏ vẫn hiện sản phẩm, tới khi tải lại trang | O-17 | Medium (người dùng tưởng giỏ còn hàng) | TVP-019 · TC-041, kiểm **cả 3 trang**, dự kiến **FAIL** | Q4 đã chốt: là bug |
| BUG-06 | Chi tiết + Giỏ | Số trên giỏ **không khớp** giỏ thật: trang chi tiết sản phẩm không tồn tại (`?id=99`) vẫn cho `Add to cart`, số giỏ là 1 nhưng giỏ trống. Biến thể: dữ liệu giỏ `[4,4]` hiện 2 dòng cùng sản phẩm, số giỏ đếm theo độ dài dữ liệu (O-31) | O-08, O-09, O-31 | Low (phải sửa URL / dữ liệu tay mới gặp) | TVP-011 · TC-025 (+ TVP-036 nếu Q14 đưa vào phạm vi), dự kiến **FAIL** | Q2 đã chốt: là bug |
| BUG-07 | Giỏ (số giỏ ở mọi trang) | Giỏ hàng **không gắn với tài khoản**: người đăng nhập sau trên cùng trình duyệt thấy giỏ của người trước | O-16 | High nếu là hệ thống thật (lộ thông tin trên máy dùng chung) | TVP-018 · TC-040, dự kiến **FAIL** | Q3 đã chốt: là bug |
| BUG-10 | Danh sách + Chi tiết | `problem_user`: **Add to cart không có tác dụng** với Bolt T-Shirt, Fleece Jacket, Red T-Shirt; **Remove không có tác dụng** với Backpack, Bike Light, Onesie. Lỗi ở **danh sách và trang chi tiết**; bỏ ở trang giỏ thì được | O-20 | High (không mua được 3/6 sản phẩm) | TVP-022 · TC-018: thêm và bỏ **cả 6 sản phẩm ở cả 2 trang** (`expect.soft`), dự kiến **FAIL** | Q1 đã chốt: là bug |
| BUG-13 | Danh sách + Chi tiết | `error_user`: Add / Remove lỗi giống BUG-10 (cùng 3 + 3 sản phẩm, **danh sách và trang chi tiết**). Console `Failed to add item to the cart.` | O-23 | High | TVP-022 · TC-019: cả 6 sản phẩm ở cả 2 trang, dự kiến **FAIL** | Q1 đã chốt: là bug |
| BUG-02 (biến thể) | Chi tiết + Giỏ | Bug của SD-101: tự tạo cookie phiên là vào được **trang giỏ** và **trang chi tiết** (SD-101 TC-033 chỉ kiểm `/inventory.html`). Không cấp số mới | O-30 | High (như BUG-02) | TVP-037 · TC-045, dự kiến **FAIL**, tag `@BUG-02` | Đã duyệt ở SD-101 |
| BUG-16 | Cả 3 | `visual_user`: **lệch bố cục** ở cả 3 màn hình: biểu tượng giỏ lệch vị trí và xoay ~3°, biểu tượng menu xoay ~3°, nút Add của Red T-Shirt lệch phải ~54 px | O-25 | Low (giao diện) | TVP-025 · TC-035, so tọa độ với `standard_user`, dự kiến **FAIL** | Q1, Q11 đã chốt: là bug |

### Màn hình 1: Danh sách sản phẩm (`/inventory.html`)
| ID | Màn hình | Mô tả | Bằng chứng | Mức (dự kiến) | Viewpoint / TC phải bắt | Trạng thái |
|---|---|---|---|---|---|---|
| BUG-08 | Danh sách | `problem_user`: **cả 6 ảnh** sản phẩm là ảnh lỗi `sl-404` | O-18 | Medium | TVP-020 · TC-004, dự kiến **FAIL** | Q1 đã chốt: là bug |
| BUG-09 | Danh sách | `problem_user`: **sắp xếp không hoạt động** (danh sách không đổi, không báo lỗi) | O-19 | High (chức năng chính) | TVP-021 · TC-011, dự kiến **FAIL** (3 kiểu khác A → Z) | Q1 đã chốt: là bug |
| BUG-12 | Danh sách | `error_user`: chọn sắp xếp hiện hộp thoại `Sorting is broken!…`, danh sách không đổi | O-22 | High | TVP-021 · TC-012, dự kiến **FAIL** | Q1 đã chốt: là bug |
| BUG-14 | Danh sách | `visual_user`: **giá ở danh sách sai, đổi ngẫu nhiên** mỗi lần tải; khác giá ở trang chi tiết và giỏ | O-24 | Critical nếu là hệ thống thật (hiển thị sai giá) | TVP-024 · TC-013, dự kiến **FAIL** | Q1 đã chốt: là bug |
| BUG-15 | Danh sách | `visual_user`: ảnh Backpack là ảnh lỗi `sl-404` | O-25 | Low | TVP-020 · TC-005 (ảnh của mọi tài khoản), dự kiến **FAIL** | Q1 đã chốt: là bug |
| BUG-17 | Danh sách | `performance_glitch_user`: sắp xếp mất **~5,04 giây** (`standard_user` 18 ms) | O-26 | Vấn đề hiệu năng, chưa có AC | TVP-026 · TC-034 **PASS** (không đánh fail theo thời gian), ghi lại thời gian | Q10 đã chốt: ghi nhận, không đánh fail. Báo kèm IMP-04 |

### Màn hình 2: Chi tiết sản phẩm (`/inventory-item.html?id=<n>`)
| ID | Màn hình | Mô tả | Bằng chứng | Mức (dự kiến) | Viewpoint / TC phải bắt | Trạng thái |
|---|---|---|---|---|---|---|
| BUG-11 | Danh sách → Chi tiết | `problem_user`: bấm **tên hoặc ảnh** sản phẩm **mở sai trang chi tiết** (lệch id; Fleece Jacket mở `ITEM NOT FOUND`) | O-21 | High | TVP-023 · TC-024: mở chi tiết **cả 6 sản phẩm**, dự kiến **FAIL** | Q1 đã chốt: là bug |
| BUG-20 | Chi tiết | Tham số `id` sai định dạng (`4abc`, `04`, `4.9`, `0x4`) vẫn **mở sản phẩm** (Backpack) thay vì báo không tìm thấy | O-33 | Low (phải sửa URL tay mới gặp) | TVP-035 · TC-026, dự kiến **FAIL** | Q2 đã chốt: là bug (thêm sau HITL #1) |

### Màn hình 3: Giỏ hàng (`/cart.html`)
| ID | Màn hình | Mô tả | Bằng chứng | Mức (dự kiến) | Viewpoint / TC phải bắt | Trạng thái |
|---|---|---|---|---|---|---|
| BUG-18 | Giỏ | `visual_user`: ở trang giỏ, nút **Checkout bị đẩy lên vùng tiêu đề** (góc trên), không nằm cùng hàng với Continue Shopping | O-29 | Medium (nút chính của trang khó thấy) | TVP-025 · TC-036, dự kiến **FAIL** | Q1, Q11 đã chốt: là bug |
| BUG-19 | Giỏ | Giỏ trống vẫn bấm được **Checkout** và sang bước thanh toán | O-13 | Low | TVP-015 · TC-030, dự kiến **FAIL** | Q5 đã chốt: là bug |

## Vấn đề không phải bug (đề xuất cải tiến)
IMP-01 → IMP-08 trong [`improvements.md`](improvements.md).

## ⚠️ Lưu ý cho bước viết code và chạy test
1. **Bug có biến thể thì TC phủ mọi biến thể** (R7): BUG-10, BUG-13 thử **cả 6 sản phẩm** (thêm và bỏ) ở **danh sách và trang chi tiết**, BUG-11 mở **cả 6** trang chi tiết, BUG-05 kiểm **cả 3 trang**, BUG-02 kiểm cả trang giỏ và trang chi tiết. Dùng `expect.soft` để chạy hết các biến thể.
2. **Mỗi TC một tài khoản, một bug** (review D3): TVP-021 và TVP-022 gộp 2 tài khoản ở mức viewpoint, nhưng test-impl tách TC theo từng tài khoản.
3. **Test bug đã biết**: assertion theo **expected đúng** (giống `standard_user`), `test.fail(true, 'BUG-xx: …')` + tag `@BUG-xx`. Đọc lỗi để chắc test fail **đúng assertion của bug**.
4. **Dữ liệu chuẩn** (tên, giá, ảnh) lấy từ `standard_user` (O-01). Không đọc giá từ trang để so với chính trang.
5. **Mỗi test dùng phiên sạch**: giỏ nằm trong `localStorage`. Playwright tạo context mới cho mỗi test nên đã đảm bảo; **không** dùng chung `storageState` có giỏ.
6. **Không chờ cứng**: chờ số trên giỏ, chờ nút đổi chữ, chờ URL **và phần tử riêng của trang đích**. `performance_glitch_user` sắp xếp ~5 giây: tăng timeout **riêng** bước đó (≥ 10 giây), không tăng `retries`.
7. `error_user` bật hộp thoại khi sắp xếp. Playwright **tự đóng** hộp thoại nếu không bắt, test không treo, nhưng sẽ mất bằng chứng. Phải bắt hộp thoại (`page.on('dialog')`) để **kiểm nội dung** `Sorting is broken!…` (BUG-12).
8. **Không kiểm vị trí bằng ảnh chụp từng pixel** (Q11). So tọa độ phần tử giữa 2 tài khoản, cho phép sai số nhỏ.
