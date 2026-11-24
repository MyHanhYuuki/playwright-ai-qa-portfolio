# Internal Questions: SD-101 Đăng nhập Swag Labs

Các câu hỏi cần người duyệt (PO/BA) trả lời trước khi viết test case.
Mỗi câu có **đề xuất mặc định**. Đồng ý thì chỉ cần trả lời "theo đề xuất".

## Câu hỏi blocking (bắt buộc trả lời trước khi tiếp tục)

### Q1: Nội dung thông báo lỗi chính xác là gì?
**Context**: AC-3/4/5 chỉ ghi "thông báo lỗi tương ứng", không có câu chữ cụ thể.
**Impact nếu không có**: Không viết được expected đo lường được. Test chỉ kiểm tra "có lỗi" mà không kiểm tra "đúng lỗi".
**Đề xuất mặc định**: Lấy đúng câu chữ đang hiển thị trên web (O-02 → O-08, O-15) làm expected chuẩn.

### Q2: Username/password có phân biệt hoa thường không? Có cắt khoảng trắng đầu/cuối không?
**Context**: Hiện tại web phân biệt hoa thường và không cắt khoảng trắng (O-06, O-07).
**Impact nếu không có**: Không biết `STANDARD_USER` bị từ chối là đúng hay là bug.
**Đề xuất mặc định**: Hành vi hiện tại là đúng: phân biệt hoa thường, không cắt khoảng trắng.

### Q3: Bỏ trống cả 2 ô thì báo lỗi nào?
**Context**: Hiện chỉ báo "Username is required" (O-02).
**Impact nếu không có**: Bảng quyết định TVP-006 thiếu expected cho tổ hợp trống cả hai.
**Đề xuất mặc định**: Đúng. Kiểm tra Username trước, chỉ hiện một lỗi.

### Q4: Tài khoản bị khóa nhưng nhập sai mật khẩu thì báo gì?
**Context**: Hiện báo "không khớp" chứ không báo "bị khóa" (O-09), nên người ngoài không dò được tài khoản nào đang bị khóa.
**Impact nếu không có**: TVP-011 chưa có expected.
**Đề xuất mặc định**: Đúng, vì không lộ trạng thái khóa (tốt cho bảo mật).

### Q5: Có ngưỡng thời gian đăng nhập tối đa không?
**Context**: `performance_glitch_user` mất khoảng 5,1 giây, các user khác dưới 0,1 giây (O-13, O-14).
**Impact nếu không có**: Không biết 5 giây là chấp nhận được hay là bug hiệu năng.
**Đề xuất mặc định**: AC chưa có ngưỡng nên chỉ kiểm tra đăng nhập **thành công** (cho phép chờ tới 10 giây). Thời gian 5 giây được ghi nhận là quan sát và đề xuất bổ sung AC về hiệu năng ở sprint sau.

## Câu hỏi non-blocking (vẫn tiếp tục được, nhưng cần làm rõ)

### Q6: Thiếu Password mà ô Username cũng bị tô đỏ. Là thiết kế hay bug giao diện?
**Context**: O-03. Người dùng có thể hiểu nhầm là username sai.
**Đề xuất mặc định**: Ghi nhận là **bug giao diện mức Low**, đưa vào HITL #3.

### Q7: Đăng nhập thất bại thì có cần xóa ô Password không?
**Context**: O-10. Password vẫn được giữ lại sau khi đăng nhập lỗi.
**Đề xuất mặc định**: Không yêu cầu. Không viết test.

### Q8: Thông báo "You can only access…" vẫn còn khi mở lại trang chủ. Có chấp nhận được không?
**Context**: O-18. Thông báo lỗi cũ không tự mất.
**Đề xuất mặc định**: Ghi nhận là quan sát mức Low, không viết test.

### Q9: Có test phiên đăng nhập hết hạn (cookie 10 phút) không?
**Context**: O-12.
**Đề xuất mặc định**: Ngoài phạm vi SD-101.

### Q10: Accessibility (thiếu `<label>`, thiếu `autocomplete`) có trong phạm vi không?
**Context**: O-01, O-19.
**Đề xuất mặc định**: Ngoài phạm vi. Ghi nhận làm đề xuất cải tiến.
