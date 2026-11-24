# Đề xuất cải tiến: SD-101 Đăng nhập

> Không phải bug theo AC hiện tại, nhưng nên cải thiện. Gửi PO xem xét đưa vào backlog.

| ID | Đề xuất | Bằng chứng | Mức ưu tiên đề xuất | Nguồn |
|---|---|---|---|---|
| IMP-01 | Cắt khoảng trắng đầu/cuối của **username** trước khi kiểm tra | `" standard_user"` bị báo sai thông tin (O-07). Người dùng hay copy-paste dính dấu cách | Medium | Q2 |
| IMP-02 | Báo lỗi tại **từng ô cùng lúc** thay vì từng lỗi một | Trống cả 2 ô chỉ báo "Username is required" (O-02) | Low | Q3 |
| IMP-03 | Bổ sung AC hiệu năng: đăng nhập **≤ 3 giây**. Điều tra `performance_glitch_user` | Mất khoảng 5,1 giây, các user khác khoảng 0,07 giây, chậm khoảng 70 lần (O-14) | High | Q5 |
| IMP-04 | Ticket accessibility: thêm `<label>` cho ô nhập, thêm `autocomplete` (`username`, `current-password`) | Chỉ có placeholder (O-01). Console cảnh báo thiếu autocomplete (O-19) | Medium | Q10 |
| IMP-05 | Icon ✕ báo lỗi trong ô nhập dễ bị hiểu nhầm là nút xóa. Nên **ẩn icon khi người dùng bắt đầu gõ lại**, hoặc đổi sang icon cảnh báo (⚠) | Icon là hình trang trí (`svg role=img`), bấm không có tác dụng, vẫn hiện khi đang gõ (O-20) | Low | Q11 |
| IMP-06 | Đã đăng nhập mà mở lại `/` thì **tự chuyển vào trang sản phẩm**, không hiện lại form đăng nhập | Hiện vẫn thấy form đăng nhập dù phiên còn hiệu lực (O-23) | Low | Q13 |
