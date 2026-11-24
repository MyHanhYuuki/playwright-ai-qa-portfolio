# Bài 3: Thiết kế test case (test-impl) và HITL #2

> Bước **[2] test-impl** trong pipeline. Kết quả: [`test-cases.csv`](../../qa-runs/saucedemo-login-screen/test-cases.csv) (mở bằng Excel), [`test-data.md`](../../qa-runs/saucedemo-login-screen/test-data.md)

## 🎯 Tại sao học
Viewpoint mới nói **"test cái gì"**. Test case nói **"test thế nào"**: bước, dữ liệu, kết quả mong đợi. Test case chính là đầu vào để viết code automation. Test case sai hoặc thiếu thì code đúng cũng vô ích.

## 🏭 Ngoài thực tế
- Test case phải để **người khác chạy được mà không cần hỏi lại**: bước rõ ràng, expected cụ thể.
- Test case luôn được **review trước khi automation** (HITL #2), vì sửa test case thì rẻ, sửa code thì đắt.
- Không cần test **mọi** giá trị. Dùng kỹ thuật thiết kế để chọn **ít test nhất mà vẫn bắt được nhiều lỗi nhất**.

## 👨‍🏫 Làm mẫu: từ 20 viewpoint (trong phạm vi) ra 33 test case

| Kỹ thuật | Áp dụng ở đâu | Số TC |
|---|---|---|
| **EP**: phân vùng tương đương | Mỗi loại user hợp lệ, mỗi loại thông tin sai, mỗi trang bị chặn: lấy 1 đại diện | 12 |
| **Decision Table**: bảng quyết định | Tổ hợp ô trống (TC-009 → 011); tài khoản khóa × mật khẩu đúng/sai (TC-021) | 4 |
| **Error Guessing**: đoán lỗi | Viết hoa, dấu cách thừa (TC-015 → 018), chuỗi rất dài (TC-019), cookie tự tạo (TC-033) | 6 |
| **State Transition**: chuyển trạng thái | Đăng xuất, bấm Back, đăng nhập lại, thử lại sau lỗi (TC-026, 027, 029, 030) | 4 |
| **BVA**: giá trị biên | Không áp dụng được: requirement không nêu độ dài tối đa (Q14) | 0 |

**Ví dụ bảng quyết định cho TVP-006 (ô trống):**
| Rule | Username | Password | Kết quả mong đợi | TC |
|---|---|---|---|---|
| R1 | trống | trống | `Username is required` | TC-009 |
| R2 | có | trống | `Password is required` | TC-010 |
| R3 | trống | có | `Username is required` | TC-011 |
| R4 | có (đúng) | có (đúng) | Vào trang Products | TC-003 |

**Độ phủ:** 20/20 viewpoint trong phạm vi, 7/7 AC, 2/2 bug đã biết có TC bắt (BUG-01, BUG-02). Ưu tiên: 14 high, 16 medium, 3 low. Gắn tag `smoke` cho 5 TC quan trọng nhất (TC-001, 003, 020, 023, 026).

**Những điểm cần chú ý:**
- Expected ghi **nguyên văn** thông báo lỗi (theo Q1), không ghi "hiện lỗi phù hợp".
- Mật khẩu không ghi vào test case, chỉ ghi `<mật khẩu hợp lệ>` và lấy từ test data.
- TC-028 (BUG-01) và TC-033 (BUG-02) **dự kiến fail**. Vẫn viết, vì test để **bắt bug**, không phải để xanh.
- TC-005 → 008 test cả 4 user: mỗi user có hành vi đặc biệt riêng nên là **các phân vùng khác nhau**, không trái nguyên tắc EP.
- Bản đầu ghi TC-019 là "BVA". Review chỉ ra là **sai**, vì không có biên. Đã sửa thành Error Guessing.
- TC-019: requirement không nêu độ dài tối đa nên **không làm được BVA đầy đủ** (min/max ±1), chỉ test giá trị cực lớn. Đây là giới hạn cần ghi rõ.

## 👉 Bạn tự làm: HITL #2
Mở `test-cases.csv` bằng Excel, kiểm tra:
1. Mỗi TC có **chạy được mà không phải hỏi lại** không?
2. Expected có **cụ thể, đo được** không?
3. Có TC nào **thừa** (trùng nhau) hoặc **thiếu** không? Gợi ý: chưa có TC "đăng nhập lại sau khi đăng xuất".
4. Priority có hợp lý không?

## ⚠️ Lỗi hay gặp
| Lỗi | Cách tránh |
|---|---|
| Expected mơ hồ ("hiển thị đúng") | Ghi nguyên văn text, URL, trạng thái |
| Một TC kiểm tra quá nhiều thứ | Mỗi TC một mục đích. Fail thì biết ngay sai ở đâu |
| Test mọi giá trị có thể | Dùng EP và BVA để chọn đại diện |
| Ghi mật khẩu thật vào test case | Tham chiếu test data, đọc từ biến môi trường |
| Bỏ test vì "biết chắc sẽ fail" | Vẫn viết. Test fail đúng chỗ là test có giá trị |

## ✅ Checklist
- [ ] Giải thích được EP, BVA, Decision Table, State Transition, mỗi cái 1 ví dụ trong bài
- [ ] Hiểu vì sao TC-028, TC-033 dự kiến fail mà vẫn viết
- [x] Đã duyệt HITL #2 (2026-11-24: approved 33 test case)

## ❓ Câu hỏi liên quan

### Q1. Phân vùng tương đương (EP) là gì? Vì sao chỉ cần 1 đại diện?
**Trả lời:**
- Chia dữ liệu thành các **nhóm mà hệ thống xử lý giống nhau**. Mỗi nhóm chỉ cần test 1 giá trị đại diện.
- Ví dụ: mọi mật khẩu sai đều được xử lý như nhau (báo "không khớp"), nên chỉ cần test `wrong_password`, không cần test 100 mật khẩu sai.
- Tiết kiệm số test mà vẫn phủ được mọi loại hành vi.

### Q2. Khi nào dùng bảng quyết định?
**Trả lời:**
- Khi **từ 2 điều kiện trở lên cùng ảnh hưởng** tới kết quả. Liệt kê mọi tổ hợp, mỗi tổ hợp (rule) là một test case.
- Ví dụ: Username (trống/có) × Password (trống/có) = 4 rule. Bảng giúp **không bỏ sót tổ hợp** nào.

### Q3. Giá trị biên (BVA) là gì? Vì sao bài này không làm đầy đủ được?
**Trả lời:**
- Lỗi hay nằm ở **biên**. Với giới hạn max = 50 ký tự, test 49, 50, 51.
- Requirement không nêu độ dài tối đa nên không có biên để test. Chỉ test được giá trị cực lớn (1000 ký tự) để chắc trang không bị lỗi. Ngoài thực tế, nên **hỏi PO độ dài tối đa**.

### Q4. Test case biết trước sẽ fail thì có nên viết không?
**Trả lời:**
- **Có.** Mục đích của test là **phát hiện sai lệch so với yêu cầu**, không phải để báo cáo xanh.
- Test fail đúng chỗ là **bằng chứng cho bug report**. Khi dev sửa xong, test chuyển sang xanh, xác nhận bug đã được sửa.
