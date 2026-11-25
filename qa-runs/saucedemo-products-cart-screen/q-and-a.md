# Q&A sheet: SD-102 Sản phẩm, chi tiết, giỏ hàng

> **Phiếu hỏi đáp duy nhất** của chức năng: test-design đặt câu hỏi, người duyệt (PO/BA) trả lời ở HITL #1.
> Trạng thái: `Open` (chờ trả lời) · `Answered` (đã chốt).
> O-xx = quan sát trong [`spec-review.md`](spec-review.md). IMP-xx = [`improvements.md`](improvements.md). BUG-xx = [`known-issues.md`](known-issues.md). TVP-xxx = [`viewpoint.csv`](viewpoint.csv).
> Câu hỏi **chia theo màn hình** để không nhầm giữa các màn hình. Câu ảnh hưởng nhiều màn hình nằm ở mục "Chung". Cột "Loại": Blocking = phải trả lời trước khi viết test case.
> Câu có ghi "(knowledge-base)" là đề xuất dựa trên quy tắc đã chốt ở SD-101, vẫn cần người duyệt xác nhận.

**Tổng hợp**: 14 câu (6 blocking, 8 non-blocking) · Answered 14 · Open 0


## Chung: cả 3 màn hình (tài khoản, menu, dữ liệu giỏ)
| # | Loại | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|---|
| Q1 | Blocking | **Các tài khoản đặc biệt (`problem_user`, `error_user`, `visual_user`, `performance_glitch_user`) có phải hoạt động giống `standard_user` không?** | Ticket chỉ nói "dùng lại 6 tài khoản". Thực tế 3 tài khoản lỗi ảnh, giá, sắp xếp, thêm/bỏ giỏ (danh sách và chi tiết), mở sai chi tiết, lệch bố cục (O-18 → O-25, O-29; ma trận trong spec-review). `locked_out_user` không đăng nhập được nên không áp dụng | **Có.** Tài khoản nào đăng nhập được thì chức năng phải giống nhau. Lệch là bug | Theo đề xuất | Answered | Có: 11 bug BUG-08 → BUG-18 (BUG-17 phụ thuộc thêm Q10), viewpoint TVP-020 → TVP-026, TVP-034. Không: bỏ các viewpoint này |
| Q4 | Blocking | **"Reset App State" (menu) có trong phạm vi không, mong đợi gì?** | Menu có ở cả 3 trang. Sau Reset, số giỏ bị xóa nhưng nút vẫn "Remove", trang giỏ vẫn hiện sản phẩm cho tới khi tải lại (O-17) | **Trong phạm vi.** Sau Reset: giỏ trống, mọi nút về "Add to cart", trang giỏ không còn sản phẩm, **không cần tải lại** | Theo đề xuất | Answered | BUG-05, TVP-019 (3 trang) |
| Q11 | Non-blocking | Lỗi bố cục của `visual_user` (biểu tượng giỏ, nút Checkout, nút Add, biểu tượng menu) có kiểm tự động không? | O-25, O-29 | **Có**: so vị trí phần tử với `standard_user` (tọa độ, có sai số cho phép), không so ảnh từng pixel (dễ chập chờn vì font, trình duyệt) | Theo đề xuất | Answered | TVP-025 |
| Q13 | Non-blocking | "Dynamic Catalog" trong menu không làm gì (O-27)? | Ticket ghi ngoài phạm vi | Ngoài phạm vi. Ghi nhận cho PO (IMP-05) | Theo đề xuất | Answered | TVP-032 `scope=out` |
| Q14 | Non-blocking | Dữ liệu giỏ lưu trong trình duyệt bị hỏng thì sao? | Sửa tay thành chuỗi không phải JSON → cả 3 trang trắng, không còn menu để thoát (O-32) | Bỏ dữ liệu hỏng, coi như giỏ trống, trang vẫn dùng được. Ghi IMP-07. Người dùng thường khó gặp nên **không** tính là bug của SD-102 | Theo đề xuất | Answered | TVP-044 `scope=out`, IMP-07 |

## Màn hình 1: Danh sách sản phẩm (`/inventory.html`)
| # | Loại | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|---|
| Q6 | Blocking | **Sản phẩm cùng giá thì xếp thế nào?** | Bolt T-Shirt và Red T-Shirt cùng $15.99, luôn theo tên A → Z ở cả 2 chiều giá (O-03) | Cùng giá thì theo tên A → Z (đúng như hiện tại) | Theo đề xuất | Answered | Expected của TVP-004. Dữ liệu `sortOrders` trong `tests/data/products.ts` đang viết theo đề xuất này: trả lời khác thì phải sửa |
| Q7 | Non-blocking | Kiểu sắp xếp có cần giữ khi vào chi tiết rồi quay lại, hoặc tải lại trang? | Hiện tại về lại A → Z (O-04). AC không nói | Không bắt buộc. Ghi đề xuất IMP-01 | Theo đề xuất | Answered | TVP-029 `scope=out` |
| Q10 | Non-blocking | `performance_glitch_user` sắp xếp mất ~5 giây | Đo 3 lần (O-26). Không có AC hiệu năng | (knowledge-base) Test chức năng chỉ kiểm tra **thành công**, không đánh fail theo thời gian. Báo riêng kèm số đo (BUG-17, IMP-04) | Theo đề xuất | Answered | TVP-026 chờ đủ lâu, ghi lại thời gian |

## Màn hình 2: Chi tiết sản phẩm (`/inventory-item.html?id=<n>`)
| # | Loại | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|---|
| Q2 | Blocking | **Sản phẩm không tồn tại / id sai định dạng / dữ liệu giỏ sai thì sao?** | `?id=99` vẫn có nút `Add to cart`, bấm vào thì số giỏ là 1 nhưng giỏ trống (O-08, O-09). `?id=4abc`, `04` vẫn mở Backpack (O-33). Sửa tay giỏ `[4,4]` hiện 2 dòng cùng sản phẩm, số giỏ đếm theo độ dài dữ liệu (O-31) | Không được thêm sản phẩm không tồn tại; **số trên giỏ luôn bằng số sản phẩm thật trong giỏ**. id sai định dạng thì báo "không tìm thấy" như id ngoài khoảng. Trang báo lỗi rõ ràng (IMP-06) | Theo đề xuất. **Bổ sung 2026-11-25** (review-defects A1, người duyệt chọn A): dữ liệu giỏ trùng id (vd `[4,4]`) thì **bỏ qua phần trùng**: 1 dòng, số lượng 1, số trên giỏ 1 (mỗi sản phẩm tối đa 1, web không có tăng số lượng) | Answered | BUG-06 (kèm biến thể O-31), BUG-20 (id sai định dạng, thêm sau khi chốt), TVP-011, TVP-035, TVP-036 |

## Màn hình 3: Giỏ hàng (`/cart.html`)
| # | Loại | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|---|
| Q3 | Blocking | **Giỏ hàng gắn với tài khoản hay với trình duyệt?** | Đăng xuất `standard_user`, đăng nhập `visual_user` trên cùng trình duyệt thì thấy giỏ của người trước (O-16). AC-7 không nói | **Theo tài khoản.** Người sau không được thấy giỏ người trước (lộ thông tin trên máy dùng chung). Đây là yêu cầu bổ sung ngoài AC-7 | Theo đề xuất | Answered | BUG-07, TVP-018 |
| Q5 | Blocking | **Giỏ trống mà bấm Checkout thì sao?** | Hiện tại sang được bước thanh toán (O-13). AC-6 không nói | **Không cho thanh toán khi giỏ trống** (khóa nút hoặc báo lỗi). Nếu đồng ý: là bug Low (BUG-19), TC ở SD-102. Phần thông báo "giỏ trống" là cải tiến riêng (Q9, IMP-03) | Theo đề xuất | Answered | BUG-19, TVP-015 |
| Q8 | Non-blocking | Trang giỏ có cần tổng tiền, ảnh, sửa số lượng? | Hiện không có (O-10). AC-6 không nói | Không. Tổng tiền thuộc bước thanh toán. Ghi IMP-02 | Theo đề xuất | Answered | TVP-030 `scope=out` |
| Q9 | Non-blocking | Giỏ trống có cần thông báo "giỏ trống"? | Hiện chỉ là danh sách rỗng (O-13) | Nên có. Ghi IMP-03 | Theo đề xuất | Answered | TVP-031 `scope=out` |
| Q12 | Non-blocking | Thứ tự sản phẩm trong giỏ? | Hiện theo thứ tự thêm (O-11) | Theo thứ tự thêm (đúng như hiện tại) | Theo đề xuất | Answered | Expected của TVP-012 |

**Người trả lời**: MyHanhYuuki · HITL #1 ngày 2026-11-24: "đồng ý tất cả đề xuất" (Q1–Q14).
