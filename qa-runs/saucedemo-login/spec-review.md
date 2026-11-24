# Spec Review: SD-101 Đăng nhập Swag Labs (SauceDemo)

## Tóm tắt
Người dùng đăng nhập bằng username và password để vào trang danh sách sản phẩm. Hệ thống phải báo lỗi khi bỏ trống, khi sai thông tin và khi tài khoản bị khóa. Đồng thời phải chặn người chưa đăng nhập vào các trang bên trong và cho phép đăng xuất.

## Acceptance Criteria
| AC-ID | Mô tả | Testable? | Ghi chú |
|-------|-------|-----------|---------|
| AC-1 | Hiển thị ô Username, ô Password (ẩn ký tự), nút Login | ✅ | |
| AC-2 | Đúng thông tin thì vào trang sản phẩm | ✅ | Chưa có ngưỡng thời gian phản hồi (Q5) |
| AC-3 | Bỏ trống thì báo lỗi "tương ứng" | ⚠️ | Không nêu nội dung lỗi, không nêu lỗi nào ưu tiên khi trống cả hai (Q1, Q3) |
| AC-4 | Sai thông tin thì báo lỗi | ⚠️ | Không nêu nội dung lỗi, không nói có phân biệt hoa thường hay cắt khoảng trắng không (Q1, Q2) |
| AC-5 | Tài khoản khóa thì báo bị khóa | ⚠️ | Không nói trường hợp tài khoản khóa và sai mật khẩu (Q4) |
| AC-6 | Chưa đăng nhập không vào được trang bên trong | ✅ | |
| AC-7 | Đăng xuất về trang đăng nhập | ✅ | Không nói phiên đăng nhập hết hạn (Q9) |

## Business Rules (rút ra từ requirement và quan sát)
- BR-1: Danh sách user hợp lệ gồm 6 user, dùng chung một mật khẩu.
- BR-2: Phiên đăng nhập lưu trong cookie `session-username`. Đăng xuất thì xóa cookie này.
- BR-3: Kiểm tra theo thứ tự: Username trống → Password trống → sai thông tin → tài khoản bị khóa.

## Quan sát thực tế (khám phá web ngày 2026-11-24, Chromium)
| # | Thao tác | Kết quả quan sát | Ghi chú |
|---|----------|------------------|---------|
| O-01 | Mở trang | Có ô `Username`, `Password` (type=password), nút `Login`. Có `data-test` cho cả 3 | Không có thẻ `<label>`, chỉ có placeholder (Q10) |
| O-02 | Bỏ trống cả 2, bấm Login | `Epic sadface: Username is required` | Chỉ báo lỗi Username (Q3) |
| O-03 | Có username, trống password | `Epic sadface: Password is required` | **Cả 2 ô** đều tô đỏ và có icon lỗi (Q6) |
| O-04 | Trống username, có password | `Epic sadface: Username is required` | |
| O-05 | Sai password / sai username / username 1000 ký tự | `Epic sadface: Username and password do not match any user in this service` | Cùng một thông báo, không lộ ô nào sai ✅ |
| O-06 | `STANDARD_USER` (viết hoa) | Báo sai thông tin | Có phân biệt hoa thường (Q2) |
| O-07 | `" standard_user"` / password thừa khoảng trắng cuối | Báo sai thông tin | Không cắt khoảng trắng (Q2) |
| O-08 | `locked_out_user` + đúng password | `Epic sadface: Sorry, this user has been locked out.` | |
| O-09 | `locked_out_user` + sai password | Báo sai thông tin (không nói bị khóa) | Không lộ trạng thái khóa (Q4) |
| O-10 | Bấm nút ✕ trên thông báo lỗi | Thông báo và icon lỗi biến mất, giá trị đã nhập (kể cả password) được giữ lại | (Q7) |
| O-11 | Đăng nhập bằng phím Enter | Vào `/inventory.html`, tiêu đề `Products` | |
| O-12 | Đăng nhập thành công | Tạo cookie `session-username=<user>`, hết hạn sau **10 phút** | (Q9) |
| O-13 | `standard_user`, `problem_user`, `error_user`, `visual_user` | Vào `/inventory.html` trong khoảng 70–90 ms | |
| O-14 | `performance_glitch_user` | Vào `/inventory.html` sau **khoảng 5,1 giây** | (Q5) |
| O-15 | Chưa đăng nhập, mở thẳng `/inventory.html`, `/cart.html`, `/checkout-step-one.html` | Bị đưa về `/` với thông báo `Epic sadface: You can only access '<path>' when you are logged in.` | ✅ |
| O-16 | Đăng xuất (Menu → Logout) | Về `/`, cookie bị xóa, ô Username trống | ✅ |
| O-17 | Đăng xuất rồi bấm Back | Ở lại `/` với thông báo "You can only access '/inventory.html'…", không thấy sản phẩm | ✅ |
| O-18 | Bị chặn ở O-15 rồi mở lại `/` | Thông báo lỗi cũ **vẫn còn** hiển thị | (Q8) |
| O-20 | Bị báo lỗi, rồi gõ lại vào ô / bấm vào icon ✕ trong ô | Icon ✕ (hình trang trí `svg role=img`) **vẫn hiện khi đang gõ**, bấm vào không có tác dụng | Dễ hiểu nhầm là nút xóa (Q11, người duyệt phát hiện) |
| O-19 | Console khi tải trang | 2 lỗi 401 tới `events.backtrace.io` (dịch vụ theo dõi lỗi bên thứ 3), cảnh báo thiếu `autocomplete` | Không ảnh hưởng chức năng (Q10) |

> **Bài học từ lần khám phá:** lần chạy đầu cho kết quả sai ở O-13/O-14 (user không chuyển trang, lỗi cũ dính sang bước sau). Nguyên nhân là **script khám phá** dùng chung một phiên trình duyệt và chờ chưa đủ lâu. Chạy lại với phiên sạch thì kết quả đúng.
> Đây là `script-issue`, không phải bug của web. Hãy nghi script của mình trước khi kết luận web có bug.

## Dependencies
- Cookie `session-username` (quản lý phiên đăng nhập)
- `events.backtrace.io`: dịch vụ theo dõi lỗi bên thứ 3, đang lỗi 401 (không ảnh hưởng đăng nhập)

## Phạm vi test
- **Trong phạm vi**: AC-1 → AC-7, 6 tài khoản test, đăng nhập bằng chuột và bằng phím Enter, truy cập trực tiếp trang được bảo vệ, đăng xuất và nút Back.
- **Ngoài phạm vi**: đăng ký, quên mật khẩu, kiểm thử hiệu năng và bảo mật chuyên sâu. Các mục Q5, Q9, Q10 chờ trả lời ở HITL #1.

## Review checklist
| Mục | Kết quả | Ghi chú |
|---|---|---|
| Chức năng được mô tả đầy đủ? | ⚠️ | Đủ luồng chính. Thiếu phiên hết hạn và hành vi sau khi đăng nhập thất bại |
| AC đo lường được, testable? | ⚠️ | AC-3/4/5 không nêu nội dung lỗi nên chưa viết được expected chính xác |
| Validation và error handling? | ⚠️ | Không nói phân biệt hoa thường, khoảng trắng, độ dài tối đa |
| Ràng buộc kỹ thuật / business? | ⚠️ | Thứ tự kiểm tra lỗi không được ghi (đã suy ra BR-3 từ quan sát) |
| Dependency được liệt kê? | ❌ | Requirement không nhắc cookie phiên, dịch vụ bên thứ 3 |
| Edge case, negative? | ❌ | Không đề cập. Đã bổ sung qua khám phá (O-05 → O-10, O-17, O-18) |
| Có câu hỏi blocking? | ✅ | 5 câu blocking, 5 câu non-blocking: xem `internal-question.md` |
