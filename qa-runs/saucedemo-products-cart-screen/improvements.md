# Đề xuất cải tiến: SD-102 Sản phẩm, chi tiết, giỏ hàng

> Không phải bug theo AC hiện tại, nhưng nên cải thiện. Gửi PO xem xét đưa vào backlog.

| ID | Màn hình | Đề xuất | Bằng chứng | Mức ưu tiên đề xuất | Nguồn |
|---|---|---|---|---|---|
| IMP-01 | Danh sách | **Giữ kiểu sắp xếp** khi vào chi tiết rồi quay lại, hoặc khi tải lại trang | Hiện luôn về A → Z (O-04). Người dùng đang lọc theo giá phải chọn lại mỗi lần | Low | Q7 |
| IMP-02 | Giỏ | Trang giỏ hiện **ảnh** sản phẩm và **tổng tiền tạm tính** | Hiện chỉ có tên, mô tả, giá từng dòng (O-10) | Medium | Q8 |
| IMP-03 | Giỏ | Giỏ trống thì hiện thông báo "Giỏ hàng trống" và gợi ý quay lại mua hàng. (Việc **khóa Checkout** khi giỏ trống là BUG-19, Q5 đã chốt) | Hiện là danh sách rỗng (O-13) | Low | Q9 |
| IMP-04 | Danh sách | Đặt ngưỡng thời gian cho thao tác sắp xếp (vd ≤ 1 giây) để có AC hiệu năng | `performance_glitch_user` mất ~5 giây (O-26, BUG-17) | Low | Q10 |
| IMP-05 | Chung (menu) | Menu "Dynamic Catalog" không làm gì: ẩn đi hoặc hoàn thiện | `href="#"` (O-27) | Low | Q13 |
| IMP-06 | Chi tiết | Trang sản phẩm không tồn tại hiện trang báo lỗi rõ ràng ("Không tìm thấy sản phẩm" + nút về danh sách), không hiện giá `$√-1` và nút thêm giỏ | O-08 | Low | Q2 |
| IMP-07 | Cả 3 | Dữ liệu giỏ lưu trong trình duyệt bị hỏng thì bỏ đi, coi như giỏ trống, thay vì làm trắng cả trang | O-32 | Low | Q14 |
| IMP-08 | Danh sách | Liên kết tên và ảnh sản phẩm dùng URL thật (`/inventory-item.html?id=<n>`) thay vì `href="#"`, để mở được trong tab mới và chia sẻ được | O-35 | Low | Review B6 |
