# Bug phát hiện sớm và lưu ý khi test: SD-101 Đăng nhập

> Các bug và vấn đề **đã thấy trong lúc phân tích, trước khi chạy test**.
> Mục đích: lúc chạy test **không bỏ sót**. Mỗi bug phải được test tương ứng bắt được (fail đúng chỗ). Bug nào không bắt được tức là test sai.
> Bug chỉ chính thức thành **defect** sau khi chạy test và duyệt ở HITL #3 (`defects.md`).

## Bug đã biết
| ID | Mô tả | Bằng chứng | Mức (dự kiến) | Test phải bắt | Trạng thái |
|---|---|---|---|---|---|
| BUG-01 | Báo thiếu một ô nhưng **cả 2 ô đều bị tô đỏ** và có icon lỗi, **cả 2 chiều**: thiếu Password thì ô Username bị tô đỏ, thiếu Username thì ô Password bị tô đỏ (chiều 2 phát hiện ở review-defects A1) | O-03 | Low (giao diện) | TC-028 (cả 2 chiều) dự kiến **FAIL** | ✅ Xác nhận khi chạy test (run-20261124-150906). HITL #3 approved |
| BUG-02 | **Tự tạo cookie `session-username` là vào được trang bên trong mà không cần đăng nhập**, vi phạm AC-6 | O-21 | Critical nếu là hệ thống thật (bảo mật) | TC-033 dự kiến **FAIL** | ✅ Xác nhận khi chạy test (run-20261124-150906). HITL #3 approved |
| BUG-03 | `performance_glitch_user` đăng nhập mất **~5,1 giây** (user khác ~0,07 giây) | O-14 | Vấn đề hiệu năng, chưa có AC | TC-006 **PASS** (không đánh fail theo thời gian). Ghi lại thời gian thực tế | Đo được: bước đăng nhập ~5,2 giây (cả test TC-006 ~10 giây), ngưỡng chờ 10 giây còn dư một nửa. Báo kèm IMP-03 |
| BUG-04 | Thông báo "You can only access…" **không tự mất** khi mở lại trang đăng nhập | O-18 | Low (quan sát) | Không có TC (Q8) | Theo dõi |

## Vấn đề không phải bug (đề xuất cải tiến)
IMP-01 → IMP-06 trong [`improvements.md`](improvements.md): cắt khoảng trắng username, báo lỗi từng ô, ngưỡng hiệu năng, accessibility, icon ✕, tự chuyển trang khi đã đăng nhập.

## ⚠️ Lưu ý cho bước viết code và chạy test
1. **Test bug đã biết (TC-028, TC-033)**: viết assertion theo **expected đúng**, không viết theo hành vi hiện tại. Có thể đánh dấu `test.fail()` kèm comment `// BUG-01` để CI không đỏ nhưng vẫn theo dõi. Khi bug được sửa, test sẽ báo cho biết.
2. **Healer không được "sửa" TC-028, TC-033 cho pass.** Fail ở đây là đúng, không phải script-issue.
3. **Mỗi test dùng phiên trình duyệt sạch.** Đã từng báo nhầm 3 bug vì dùng chung phiên (xem ai-log #4).
4. **TC-006 cần timeout ≥ 10 giây.** Không được đánh fail chỉ vì chậm.
5. **So khớp nguyên văn thông báo lỗi** (MSG-01 → MSG-05), không dùng "chứa chữ Error".
6. **Không chờ cứng.** Chờ theo điều kiện: URL đổi, thông báo lỗi hiện ra.
7. **Mật khẩu đọc từ `tests/data/users.ts`**, không viết thẳng vào spec.
