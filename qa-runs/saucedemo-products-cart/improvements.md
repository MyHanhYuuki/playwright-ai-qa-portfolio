# Đề xuất cải tiến: SD-102 Sản phẩm, chi tiết, giỏ hàng

> Không phải bug theo AC hiện tại, nhưng nên cải thiện. Gửi PO xem xét đưa vào backlog.

| ID | Đề xuất | Bằng chứng | Mức ưu tiên đề xuất | Nguồn |
|---|---|---|---|---|
| IMP-01 | **Giữ kiểu sắp xếp** khi vào chi tiết rồi quay lại, hoặc khi tải lại trang | Hiện luôn về A → Z (O-04). Người dùng đang lọc theo giá phải chọn lại mỗi lần | Low | Q7 |
| IMP-02 | Trang giỏ hiện **ảnh** sản phẩm và **tổng tiền tạm tính** | Hiện chỉ có tên, mô tả, giá từng dòng (O-10) | Medium | Q8 |
| IMP-03 | Giỏ trống thì hiện thông báo "Giỏ hàng trống" và **khóa nút Checkout** | Hiện là danh sách rỗng, vẫn checkout được (O-13) | Medium | Q5, Q9 |
| IMP-04 | Đặt ngưỡng thời gian cho thao tác sắp xếp (vd ≤ 1 giây) để có AC hiệu năng | `performance_glitch_user` mất ~5 giây (O-26, BUG-17) | Low | Q10 |
| IMP-05 | Menu "Dynamic Catalog" không làm gì: ẩn đi hoặc hoàn thiện | `href="#"` (O-27) | Low | Q13 |
| IMP-06 | Trang sản phẩm không tồn tại hiện trang báo lỗi rõ ràng ("Không tìm thấy sản phẩm" + nút về danh sách), không hiện giá `$√-1` và nút thêm giỏ | O-08 | Low | Q2 |
