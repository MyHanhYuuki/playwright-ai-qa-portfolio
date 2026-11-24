# Q&A sheet: SD-102 Sản phẩm, chi tiết, giỏ hàng

> **Phiếu hỏi đáp duy nhất** của chức năng: test-design đặt câu hỏi, người duyệt (PO/BA) trả lời ở HITL #1.
> Trạng thái: `Open` (chờ trả lời) · `Answered` (đã chốt).
> O-xx = quan sát trong [`spec-review.md`](spec-review.md). IMP-xx = [`improvements.md`](improvements.md). BUG-xx = [`known-issues.md`](known-issues.md).
> Câu có ghi "(knowledge-base)" là đề xuất dựa trên quy tắc đã chốt ở SD-101, vẫn cần người duyệt xác nhận.

**Tổng hợp**: 13 câu (6 blocking, 7 non-blocking) · Answered 0 · Open 13

## Câu hỏi blocking
| # | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|
| Q1 | **Các tài khoản đặc biệt (`problem_user`, `error_user`, `visual_user`, `performance_glitch_user`) có phải hoạt động giống `standard_user` không?** | Ticket chỉ nói "dùng lại 6 tài khoản". Thực tế 3 tài khoản này lỗi ảnh, sắp xếp, thêm/bỏ giỏ, mở sai chi tiết, giá sai (O-18 → O-25) | **Có.** Tài khoản nào đăng nhập được thì chức năng phải giống nhau. Lệch là bug | | Open | Có: ~9 bug (BUG-08 → BUG-16) và ~10 TC. Không: bỏ các TC này |
| Q2 | **Mở chi tiết sản phẩm không tồn tại (`?id=99`) thì sao?** | Trang vẫn có nút `Add to cart`. Bấm vào thì số giỏ thành 1 nhưng giỏ trống (O-08, O-09) | Không được thêm sản phẩm không tồn tại. **Số trên giỏ luôn bằng số sản phẩm thật trong giỏ** | | Open | BUG-06 + 1 TC |
| Q3 | **Giỏ hàng gắn với tài khoản hay với trình duyệt?** | Đăng xuất `standard_user`, đăng nhập `visual_user` trên cùng trình duyệt thì thấy giỏ của người trước (O-16) | **Theo tài khoản.** Người sau không được thấy giỏ người trước (lộ thông tin trên máy dùng chung) | | Open | BUG-07 + 1 TC |
| Q4 | **"Reset App State" (menu) có trong phạm vi không, mong đợi gì?** | Menu có ở cả 3 trang. Sau Reset, số giỏ bị xóa nhưng nút vẫn "Remove", trang giỏ vẫn hiện sản phẩm cho tới khi tải lại (O-17) | **Trong phạm vi.** Sau Reset: giỏ trống, mọi nút về "Add to cart", trang giỏ không còn sản phẩm, **không cần tải lại** | | Open | BUG-05 + 1 TC (3 trang) |
| Q5 | **Giỏ trống mà bấm Checkout thì sao?** | Hiện tại sang được bước thanh toán, không có thông báo (O-13). AC-6 không nói | Không cho thanh toán khi giỏ trống (ẩn / khóa nút hoặc báo lỗi). Ghi bug Low ở SD-102, test luồng thanh toán ở SD-103 | | Open | 1 TC + có thể thêm 1 bug |
| Q6 | **Sản phẩm cùng giá thì xếp thế nào?** | Bolt T-Shirt và Red T-Shirt cùng $15.99, luôn theo tên A → Z ở cả 2 chiều giá (O-03) | Cùng giá thì theo tên A → Z (đúng như hiện tại) | | Open | Viết expected chính xác cho TC sắp theo giá |

## Câu hỏi non-blocking
| # | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|
| Q7 | Kiểu sắp xếp có cần giữ khi vào chi tiết rồi quay lại, hoặc tải lại trang? | Hiện tại về lại A → Z (O-04). AC không nói | Không bắt buộc. Ghi đề xuất IMP-01 | | Open | `scope=out` |
| Q8 | Trang giỏ có cần tổng tiền, ảnh, sửa số lượng? | Hiện không có (O-10). AC-6 không nói | Không. Tổng tiền thuộc bước thanh toán. Ghi IMP-02 | | Open | `scope=out` |
| Q9 | Giỏ trống có cần thông báo "giỏ trống"? | Hiện chỉ là danh sách rỗng (O-13) | Nên có. Ghi IMP-03 | | Open | Không có TC |
| Q10 | `performance_glitch_user` sắp xếp mất ~5 giây | Đo 3 lần (O-26). Không có AC hiệu năng | (knowledge-base) Test chức năng chỉ kiểm tra **thành công**, không đánh fail theo thời gian. Báo riêng kèm số đo (BUG-17, IMP-04) | | Open | TC chờ đủ lâu, ghi lại thời gian |
| Q11 | Lỗi giao diện (biểu tượng giỏ lệch) có kiểm tự động không? | O-25 | **Có**: so vị trí biểu tượng với `standard_user` (tọa độ), không so ảnh từng pixel (dễ chập chờn vì font, trình duyệt) | | Open | 1 TC |
| Q12 | Thứ tự sản phẩm trong giỏ? | Hiện theo thứ tự thêm (O-11) | Theo thứ tự thêm (đúng như hiện tại) | | Open | Expected của TC giỏ hàng |
| Q13 | "Dynamic Catalog" trong menu không làm gì (O-27)? | Ticket ghi ngoài phạm vi | Ngoài phạm vi. Ghi nhận cho PO (IMP-05) | | Open | Không có TC |

**Người trả lời**: _(chờ HITL #1)_
