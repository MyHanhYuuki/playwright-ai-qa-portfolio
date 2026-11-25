# RTM: saucedemo-login-screen

> Ma trận truy vết **AC → viewpoint → test case → kết quả → bug**. Tạo tự động bởi `npm run rtm`, đừng sửa tay.
> Nguồn: [requirement](requirement/requirement.md) · [viewpoint.csv](viewpoint.csv) · [test-cases.csv](test-cases.csv) · kết quả [run-20261125-192636.json](run-results/run-20261125-192636.json) · [defects.md](defects.md)

## Tóm tắt
| Chỉ số | Giá trị |
|---|---|
| AC có test case | **7/7** (100%) |
| AC đạt (mọi TC liên quan đều Passed) | **5/7** (71%) |
| Test case | 33: ✅ Passed 31 · ❌ Failed 2 |
| Flaky · cần làm tay | 0 · 0 |
| Viewpoint | 20 trong phạm vi, đều có TC · 5 ngoài phạm vi |
| Bug đang mở | [BUG-01](defects.md#bug-01-login-báo-thiếu-một-ô-nhưng-cả-hai-ô-đều-bị-đánh-dấu-lỗi), [BUG-02](defects.md#bug-02-login-tự-tạo-cookie-là-vào-được-trang-bên-trong-không-cần-đăng-nhập) |

> **Kết quả** so với expected của test case. Test của bug đã biết dùng `test.fail()`: Playwright và file run ghi "passed" (fail đúng dự kiến), còn RTM ghi **Failed** vì web chưa làm đúng expected.

## Theo AC
| AC | Yêu cầu | Viewpoint | TC | Passed | Failed | Khác | Bug | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| AC-1 | Trang đăng nhập hiển thị ô Username, ô Password (nhập ẩn ký tự) và nút Login. | 2 (+1 ngoài phạm vi) | 2 | 2 | 0 | 0 | – | ✅ Đạt |
| AC-2 | Nhập đúng username và password hợp lệ, bấm Login thì chuyển tới trang danh sách sản phẩm. | 6 (+2 ngoài phạm vi) | 9 | 9 | 0 | 0 | – | ✅ Đạt |
| AC-3 | Bỏ trống Username hoặc Password thì hiển thị thông báo lỗi tương ứng và không đăng nhập. | 3 | 5 | 4 | 1 | 0 | [BUG-01](defects.md#bug-01-login-báo-thiếu-một-ô-nhưng-cả-hai-ô-đều-bị-đánh-dấu-lỗi) | ❌ Chưa đạt (có bug) |
| AC-4 | Nhập sai username hoặc password thì hiển thị thông báo lỗi và không đăng nhập. | 4 (+1 ngoài phạm vi) | 9 | 9 | 0 | 0 | – | ✅ Đạt |
| AC-5 | Tài khoản bị khóa thì không đăng nhập được và hiển thị thông báo cho biết tài khoản bị khóa. | 2 | 2 | 2 | 0 | 0 | – | ✅ Đạt |
| AC-6 | Người dùng chưa đăng nhập không truy cập được các trang bên trong (vd: trang sản phẩm). | 3 (+1 ngoài phạm vi) | 6 | 5 | 1 | 0 | [BUG-02](defects.md#bug-02-login-tự-tạo-cookie-là-vào-được-trang-bên-trong-không-cần-đăng-nhập) | ❌ Chưa đạt (có bug) |
| AC-7 | Người dùng đã đăng nhập có thể đăng xuất và quay về trang đăng nhập. | 3 | 3 | 3 | 0 | 0 | – | ✅ Đạt |

## Chi tiết
| AC | Viewpoint | Test case | Kỹ thuật | Tự động | Kết quả | Bug |
|---|---|---|---|---|---|---|
| AC-1 | TVP-001 | [TC-001](evidence/all-cases/TC-001/README.md) UI: trang đăng nhập hiển thị đủ ô Username, Password và nút Login | - | automatable | ✅ Passed | – |
| AC-1 | TVP-002 | [TC-002](evidence/all-cases/TC-002/README.md) UI: ô Password ẩn ký tự khi nhập | - | automatable | ✅ Passed | – |
| AC-2 | TVP-003 | [TC-003](evidence/all-cases/TC-003/README.md) Happy path: standard_user đăng nhập thành công | EP | automatable | ✅ Passed | – |
| AC-2 | TVP-004 | [TC-004](evidence/all-cases/TC-004/README.md) Đăng nhập bằng phím Enter | - | automatable | ✅ Passed | – |
| AC-2 | TVP-005 | [TC-005](evidence/all-cases/TC-005/README.md) User hợp lệ problem_user đăng nhập được | EP | automatable | ✅ Passed | – |
| AC-2 | TVP-005 | [TC-006](evidence/all-cases/TC-006/README.md) User hợp lệ performance_glitch_user đăng nhập được (chờ tối đa 10 giây) | EP | automatable | ✅ Passed | – |
| AC-2 | TVP-005 | [TC-007](evidence/all-cases/TC-007/README.md) User hợp lệ error_user đăng nhập được | EP | automatable | ✅ Passed | – |
| AC-2 | TVP-005 | [TC-008](evidence/all-cases/TC-008/README.md) User hợp lệ visual_user đăng nhập được | EP | automatable | ✅ Passed | – |
| AC-2 | TVP-017 | [TC-029](evidence/all-cases/TC-029/README.md) Đăng xuất rồi đăng nhập lại thành công | State Transition | automatable | ✅ Passed | – |
| AC-2 | TVP-018 | [TC-030](evidence/all-cases/TC-030/README.md) Thử lại sau khi lỗi: thông báo cập nhật, nhập đúng thì vào được | State Transition | automatable | ✅ Passed | – |
| AC-2 | TVP-019 | [TC-031](evidence/all-cases/TC-031/README.md) Tải lại trang vẫn giữ phiên đăng nhập | - | automatable | ✅ Passed | – |
| AC-3 | TVP-006 | [TC-009](evidence/all-cases/TC-009/README.md) Bảng quyết định R1: trống Username + trống Password | Decision Table | automatable | ✅ Passed | – |
| AC-3 | TVP-006 | [TC-010](evidence/all-cases/TC-010/README.md) Bảng quyết định R2: có Username + trống Password | Decision Table | automatable | ✅ Passed | – |
| AC-3 | TVP-006 | [TC-011](evidence/all-cases/TC-011/README.md) Bảng quyết định R3: trống Username + có Password | Decision Table | automatable | ✅ Passed | – |
| AC-3 | TVP-012 | [TC-022](evidence/all-cases/TC-022/README.md) Đóng thông báo lỗi bằng nút X | - | automatable | ✅ Passed | – |
| AC-3 | TVP-016 | [TC-028](evidence/all-cases/TC-028/README.md) Chỉ ô bị thiếu mới bị đánh dấu lỗi (cả 2 chiều) | - | automatable | ❌ Failed | [BUG-01](defects.md#bug-01-login-báo-thiếu-một-ô-nhưng-cả-hai-ô-đều-bị-đánh-dấu-lỗi) |
| AC-4 | TVP-007 | [TC-012](evidence/all-cases/TC-012/README.md) Sai mật khẩu | EP | automatable | ✅ Passed | – |
| AC-4 | TVP-007 | [TC-013](evidence/all-cases/TC-013/README.md) Username không tồn tại | EP | automatable | ✅ Passed | – |
| AC-4 | TVP-007 | [TC-014](evidence/all-cases/TC-014/README.md) Sai cả username và mật khẩu | EP | automatable | ✅ Passed | – |
| AC-4 | TVP-008 | [TC-015](evidence/all-cases/TC-015/README.md) Username viết hoa bị từ chối | Error Guessing | automatable | ✅ Passed | – |
| AC-4 | TVP-008 | [TC-016](evidence/all-cases/TC-016/README.md) Username có khoảng trắng đầu bị từ chối | Error Guessing | automatable | ✅ Passed | – |
| AC-4 | TVP-008 | [TC-017](evidence/all-cases/TC-017/README.md) Mật khẩu thừa khoảng trắng cuối bị từ chối | Error Guessing | automatable | ✅ Passed | – |
| AC-4 | TVP-008 | [TC-018](evidence/all-cases/TC-018/README.md) Mật khẩu viết hoa bị từ chối | Error Guessing | automatable | ✅ Passed | – |
| AC-4 | TVP-009 | [TC-019](evidence/all-cases/TC-019/README.md) Username rất dài (1000 ký tự) không làm lỗi trang | Error Guessing | automatable | ✅ Passed | – |
| AC-4 | TVP-018 | [TC-030](evidence/all-cases/TC-030/README.md) Thử lại sau khi lỗi: thông báo cập nhật, nhập đúng thì vào được | State Transition | automatable | ✅ Passed | – |
| AC-5 | TVP-010 | [TC-020](evidence/all-cases/TC-020/README.md) Tài khoản bị khóa không đăng nhập được | EP | automatable | ✅ Passed | – |
| AC-5 | TVP-011 | [TC-021](evidence/all-cases/TC-021/README.md) Tài khoản bị khóa + sai mật khẩu không lộ trạng thái khóa | Decision Table | automatable | ✅ Passed | – |
| AC-6 | TVP-013 | [TC-023](evidence/all-cases/TC-023/README.md) Chưa đăng nhập mở thẳng /inventory.html bị chặn | EP | automatable | ✅ Passed | – |
| AC-6 | TVP-013 | [TC-024](evidence/all-cases/TC-024/README.md) Chưa đăng nhập mở thẳng /cart.html bị chặn | EP | automatable | ✅ Passed | – |
| AC-6 | TVP-013 | [TC-025](evidence/all-cases/TC-025/README.md) Chưa đăng nhập mở thẳng /checkout-step-one.html bị chặn | EP | automatable | ✅ Passed | – |
| AC-6 | TVP-015 | [TC-027](evidence/all-cases/TC-027/README.md) Đăng xuất rồi bấm Back không xem lại được trang sản phẩm | State Transition | automatable | ✅ Passed | – |
| AC-6 | TVP-013 | [TC-032](evidence/all-cases/TC-032/README.md) Chưa đăng nhập mở thẳng trang chi tiết sản phẩm bị chặn | EP | automatable | ✅ Passed | – |
| AC-6 | TVP-020 | [TC-033](evidence/all-cases/TC-033/README.md) Cookie phiên tự tạo không được vào trang bên trong | Error Guessing | automatable | ❌ Failed | [BUG-02](defects.md#bug-02-login-tự-tạo-cookie-là-vào-được-trang-bên-trong-không-cần-đăng-nhập) |
| AC-7 | TVP-014 | [TC-026](evidence/all-cases/TC-026/README.md) Đăng xuất về trang đăng nhập và xóa phiên | State Transition | automatable | ✅ Passed | – |
| AC-7 | TVP-015 | [TC-027](evidence/all-cases/TC-027/README.md) Đăng xuất rồi bấm Back không xem lại được trang sản phẩm | State Transition | automatable | ✅ Passed | – |
| AC-7 | TVP-017 | [TC-029](evidence/all-cases/TC-029/README.md) Đăng xuất rồi đăng nhập lại thành công | State Transition | automatable | ✅ Passed | – |

## Viewpoint ngoài phạm vi (đã cân nhắc, không test lần này)
| Viewpoint | AC | Nội dung | Nguồn quyết định |
|---|---|---|---|
| TVP-021 | AC-2 | Hiệu năng: thời gian đăng nhập trong ngưỡng chấp nhận | O-14;Q5;IMP-03 |
| TVP-022 | AC-1 | Accessibility: ô nhập có label, có autocomplete, điều hướng được bằng bàn phím | O-01;Q10;IMP-04 |
| TVP-023 | AC-6 | Phiên hết hạn sau 10 phút thì phải đăng nhập lại | O-12;Q9 |
| TVP-024 | AC-2 | Đã đăng nhập mở lại trang / thì tự chuyển vào trang sản phẩm | O-23;Q13;IMP-06 |
| TVP-025 | AC-4 | Đăng nhập lỗi thì ô Password được xóa trắng | O-10;Q7 |
