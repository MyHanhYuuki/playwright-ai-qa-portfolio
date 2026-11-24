# Q&A Archive

Các câu hỏi đã được trả lời ở HITL #1, giữ lại để test-design dùng lại cho các chức năng sau.

| Ngày | Feature | Câu hỏi | Trả lời |
|------|---------|---------|---------|
| 2026-11-24 | saucedemo-login-screen | Requirement không nêu nội dung thông báo lỗi | Dùng nguyên văn câu chữ đang hiển thị trên web làm expected |
| 2026-11-24 | saucedemo-login-screen | Input có phân biệt hoa thường, có cắt khoảng trắng? | Password: phân biệt, không cắt. Username: theo hành vi hiện tại, đề xuất cắt khoảng trắng |
| 2026-11-24 | saucedemo-login-screen | Thông báo lỗi có được lộ thông tin tài khoản (tồn tại, bị khóa)? | Không. Sai thông tin thì luôn dùng thông báo chung |
| 2026-11-24 | saucedemo-login-screen | Không có AC hiệu năng mà phản hồi chậm bất thường? | Test chức năng chỉ kiểm tra thành công. Báo riêng vấn đề hiệu năng kèm số đo và đề xuất ngưỡng |
| 2026-11-24 | saucedemo-login-screen | Session timeout, accessibility có trong phạm vi không? | Ngoài phạm vi nếu ticket không nêu. Accessibility tách ticket riêng |
| 2026-11-24 | saucedemo-login-screen | Xác thực chỉ dựa vào cookie phía trình duyệt (tự tạo cookie là vào được)? | Là bug bảo mật. Luôn test truy cập bằng phiên giả mạo |
| 2026-11-24 | saucedemo-login-screen | Đã đăng nhập mở lại trang đăng nhập thì sao? | Không phải bug nếu AC không nêu. Đề xuất tự chuyển vào trang chính |
| 2026-11-24 | saucedemo-login-screen | Requirement không nêu độ dài tối đa của input? | Coi như không giới hạn, test chuỗi rất dài. Hỏi PO để làm BVA |
