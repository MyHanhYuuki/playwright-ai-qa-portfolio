# Evidence: saucedemo-login-screen

> Tạo tự động bởi `npm run test:evidence` lúc 2026-11-24T09:45:19.062Z.
> Mỗi ảnh có **khung đỏ** khoanh vùng cần xem và dòng **"Cần xem"** nói rõ phải kiểm tra gì. Mỗi test case có video.

## Bug (theo ticket)
| Ticket_KI | Test case | Thư mục |
|---|---|---|
| [id_bug_1]_KI-01 | TC-028 | [bugs/[id_bug_1]_KI-01/TC-028](<bugs/[id_bug_1]_KI-01/TC-028/README.md>) |
| [id_bug_2]_KI-02 | TC-033 | [bugs/[id_bug_2]_KI-02/TC-033](<bugs/[id_bug_2]_KI-02/TC-033/README.md>) |

## Tất cả test case
| Test case | Kết quả | Thư mục |
|---|---|---|
| TC-001 hiển thị đủ ô Username, Password và nút Login | ✅ Đúng như mong đợi | [all-cases/TC-001](all-cases/TC-001/README.md) |
| TC-002 ô Password ẩn ký tự khi nhập | ✅ Đúng như mong đợi | [all-cases/TC-002](all-cases/TC-002/README.md) |
| TC-003 standard_user đăng nhập thành công | ✅ Đúng như mong đợi | [all-cases/TC-003](all-cases/TC-003/README.md) |
| TC-004 đăng nhập bằng phím Enter | ✅ Đúng như mong đợi | [all-cases/TC-004](all-cases/TC-004/README.md) |
| TC-005 user hợp lệ problem_user đăng nhập được | ✅ Đúng như mong đợi | [all-cases/TC-005](all-cases/TC-005/README.md) |
| TC-006 user hợp lệ performance_glitch_user đăng nhập được | ✅ Đúng như mong đợi | [all-cases/TC-006](all-cases/TC-006/README.md) |
| TC-007 user hợp lệ error_user đăng nhập được | ✅ Đúng như mong đợi | [all-cases/TC-007](all-cases/TC-007/README.md) |
| TC-008 user hợp lệ visual_user đăng nhập được | ✅ Đúng như mong đợi | [all-cases/TC-008](all-cases/TC-008/README.md) |
| TC-009 R1: trống Username + trống Password | ✅ Đúng như mong đợi | [all-cases/TC-009](all-cases/TC-009/README.md) |
| TC-010 R2: có Username + trống Password | ✅ Đúng như mong đợi | [all-cases/TC-010](all-cases/TC-010/README.md) |
| TC-011 R3: trống Username + có Password | ✅ Đúng như mong đợi | [all-cases/TC-011](all-cases/TC-011/README.md) |
| TC-012 sai mật khẩu | ✅ Đúng như mong đợi | [all-cases/TC-012](all-cases/TC-012/README.md) |
| TC-013 username không tồn tại | ✅ Đúng như mong đợi | [all-cases/TC-013](all-cases/TC-013/README.md) |
| TC-014 sai cả username và mật khẩu | ✅ Đúng như mong đợi | [all-cases/TC-014](all-cases/TC-014/README.md) |
| TC-015 username viết hoa bị từ chối | ✅ Đúng như mong đợi | [all-cases/TC-015](all-cases/TC-015/README.md) |
| TC-016 username có khoảng trắng đầu bị từ chối | ✅ Đúng như mong đợi | [all-cases/TC-016](all-cases/TC-016/README.md) |
| TC-017 mật khẩu thừa khoảng trắng cuối bị từ chối | ✅ Đúng như mong đợi | [all-cases/TC-017](all-cases/TC-017/README.md) |
| TC-018 mật khẩu viết hoa bị từ chối | ✅ Đúng như mong đợi | [all-cases/TC-018](all-cases/TC-018/README.md) |
| TC-019 username 1000 ký tự không làm lỗi trang | ✅ Đúng như mong đợi | [all-cases/TC-019](all-cases/TC-019/README.md) |
| TC-020 tài khoản bị khóa không đăng nhập được | ✅ Đúng như mong đợi | [all-cases/TC-020](all-cases/TC-020/README.md) |
| TC-021 tài khoản bị khóa + sai mật khẩu không lộ trạng thái khóa | ✅ Đúng như mong đợi | [all-cases/TC-021](all-cases/TC-021/README.md) |
| TC-022 đóng thông báo lỗi bằng nút X | ✅ Đúng như mong đợi | [all-cases/TC-022](all-cases/TC-022/README.md) |
| TC-023 mở thẳng /inventory.html khi chưa đăng nhập bị chặn | ✅ Đúng như mong đợi | [all-cases/TC-023](all-cases/TC-023/README.md) |
| TC-024 mở thẳng /cart.html khi chưa đăng nhập bị chặn | ✅ Đúng như mong đợi | [all-cases/TC-024](all-cases/TC-024/README.md) |
| TC-025 mở thẳng /checkout-step-one.html khi chưa đăng nhập bị chặn | ✅ Đúng như mong đợi | [all-cases/TC-025](all-cases/TC-025/README.md) |
| TC-026 đăng xuất về trang đăng nhập và xóa phiên | ✅ Đúng như mong đợi | [all-cases/TC-026](all-cases/TC-026/README.md) |
| TC-027 đăng xuất rồi bấm Back không xem lại được trang sản phẩm | ✅ Đúng như mong đợi | [all-cases/TC-027](all-cases/TC-027/README.md) |
| TC-028 chỉ ô bị thiếu mới bị đánh dấu lỗi | ✅ Đúng như mong đợi | [all-cases/TC-028](all-cases/TC-028/README.md) |
| TC-029 đăng xuất rồi đăng nhập lại thành công | ✅ Đúng như mong đợi | [all-cases/TC-029](all-cases/TC-029/README.md) |
| TC-030 thử lại sau lỗi: thông báo cập nhật, nhập đúng thì vào được | ✅ Đúng như mong đợi | [all-cases/TC-030](all-cases/TC-030/README.md) |
| TC-031 tải lại trang vẫn giữ phiên đăng nhập | ✅ Đúng như mong đợi | [all-cases/TC-031](all-cases/TC-031/README.md) |
| TC-032 mở thẳng /inventory-item.html khi chưa đăng nhập bị chặn | ✅ Đúng như mong đợi | [all-cases/TC-032](all-cases/TC-032/README.md) |
| TC-033 cookie phiên tự tạo không được vào trang bên trong | ✅ Đúng như mong đợi | [all-cases/TC-033](all-cases/TC-033/README.md) |
