# Q&A: HITL #1, SD-101 Đăng nhập Swag Labs

- **Trạng thái**: ✅ Đã trả lời
- **Ngày**: 2026-11-24
- **Người duyệt**: MyHanhYuuki. Câu trả lời do AI (vai QC Lead) soạn theo các gợi ý đã được người duyệt xem xét, góp ý và chốt.

## Câu hỏi blocking
| # | Câu hỏi | Trả lời | Lý do | Ảnh hưởng tới test |
|---|---|---|---|---|
| Q1 | Nội dung thông báo lỗi chính xác? | Dùng **nguyên văn** câu chữ đang hiển thị trên web | Web không có tài liệu, câu chữ hiện tại là nguồn tin cậy nhất. So khớp nguyên văn bắt được cả sai chính tả, sai loại lỗi | Expected so khớp nguyên văn (O-02 → O-08, O-15) |
| Q2 | Phân biệt hoa thường? Cắt khoảng trắng? | **Password**: phân biệt, không cắt. **Username**: chấp nhận hành vi hiện tại (phân biệt, không cắt) | Password giữ nguyên là chuẩn. Username thực tế nên cắt khoảng trắng, nên ghi **đề xuất cải tiến** (IMP-01) | `STANDARD_USER`, `" standard_user"`, password thừa dấu cách đều phải báo sai thông tin |
| Q3 | Trống cả 2 ô báo lỗi nào? | Chỉ `Username is required` | Không sai chức năng. Chuẩn UX tốt hơn là báo lỗi tại từng ô, ghi đề xuất (IMP-02) | Bảng quyết định TVP-006 đủ expected |
| Q4 | Tài khoản khóa + sai mật khẩu? | Báo "không khớp", không lộ trạng thái khóa | Chống dò tài khoản (user enumeration) | TVP-011 có expected rõ |
| Q5 | Ngưỡng thời gian đăng nhập? | Test chức năng chỉ kiểm tra đăng nhập **thành công** (chờ tối đa 10 giây). **Báo riêng vấn đề hiệu năng** kèm số đo, đề xuất ngưỡng ≤ 3 giây (IMP-03) | QC không tự đặt ngưỡng để đánh fail, nhưng chậm khoảng 70 lần thì phải báo kèm bằng chứng và con số đề xuất | `performance_glitch_user` pass nếu vào được trang sản phẩm |

## Câu hỏi non-blocking
| # | Câu hỏi | Trả lời | Lý do | Ảnh hưởng tới test |
|---|---|---|---|---|
| Q6 | Thiếu Password mà ô Username cũng tô đỏ? | **Bug giao diện, mức Low** | Tô đỏ ô đã nhập đúng làm người dùng hiểu nhầm là username sai | Thêm **TVP-016**. Test fail thì đưa sang HITL #3 |
| Q7 | Xóa ô Password sau khi đăng nhập lỗi? | Không yêu cầu | Ticket không nêu. Không phải lỗi chức năng | Không viết test |
| Q8 | Lỗi "You can only access…" không tự mất? | Quan sát mức Low | Gây khó chịu nhẹ, không ảnh hưởng đăng nhập | Không viết test |
| Q9 | Test phiên hết hạn 10 phút? | Ngoài phạm vi SD-101 | Ticket không nêu, test tốn thời gian chờ. Tách ticket riêng nếu cần | Không viết test |
| Q10 | Accessibility (thiếu label)? | Ngoài phạm vi SD-101, **tách ticket accessibility riêng** (IMP-04) | Thiếu `<label>` là lỗi accessibility thật (WCAG) | Không viết test trong SD-101 |
| Q11 | Icon ✕ trong ô nhập có bị hiểu nhầm là nút xóa không? (O-20, người duyệt phát hiện) | Đúng, dễ gây nhầm. Ghi **đề xuất cải tiến UX** (IMP-05) | Icon ✕ trông giống nút "xóa nội dung" nhưng bấm không có tác dụng, và vẫn hiện khi người dùng đang gõ lại | Không viết test (không có AC) |

Danh sách đề xuất cải tiến: [`../improvements.md`](../improvements.md)
