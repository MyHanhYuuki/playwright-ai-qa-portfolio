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
| 2026-11-24 | saucedemo-products-cart | Tài khoản test "đặc biệt" (vai trò khác, dữ liệu khác) có phải hoạt động như tài khoản chuẩn? | Có. Tài khoản đăng nhập được thì chức năng phải giống nhau, lệch là bug. Thử đủ ma trận tài khoản × trang × thao tác |
| 2026-11-24 | saucedemo-products-cart | Dữ liệu người dùng (giỏ hàng…) lưu ở trình duyệt có gắn với tài khoản? | Phải gắn với tài khoản. Người đăng nhập sau trên cùng máy không được thấy dữ liệu người trước |
| 2026-11-24 | saucedemo-products-cart | Đối tượng không tồn tại / id sai định dạng trong URL? | Báo "không tìm thấy", không cho thao tác tiếp (thêm giỏ…). Bộ đếm luôn khớp dữ liệu thật |
| 2026-11-24 | saucedemo-products-cart | Chức năng tiện ích (Reset, xóa dữ liệu) không có trong AC nhưng có trên giao diện? | Trong phạm vi nếu nằm trên các trang của feature. Kết quả phải thấy ngay, không cần tải lại |
| 2026-11-24 | saucedemo-products-cart | Danh sách rỗng mà vẫn bấm được bước tiếp theo (vd giỏ trống → Checkout)? | Là bug (thường mức Low). Thông báo "rỗng" là cải tiến riêng |
| 2026-11-24 | saucedemo-products-cart | Thứ tự khi sắp xếp có giá trị bằng nhau? | Hỏi PO; mặc định theo tiêu chí phụ (tên A → Z) và viết expected chính xác |
| 2026-11-24 | saucedemo-products-cart | Lỗi bố cục / giao diện có kiểm tự động? | Có, so tọa độ phần tử với tài khoản chuẩn (có sai số), không so ảnh từng pixel |
