# Spec Review: SD-101 Đăng nhập Swag Labs (SauceDemo)

## Tóm tắt
Người dùng đăng nhập bằng username và password để vào trang danh sách sản phẩm. Hệ thống phải báo lỗi khi bỏ trống, khi sai thông tin và khi tài khoản bị khóa. Đồng thời phải chặn người chưa đăng nhập vào các trang bên trong và cho phép đăng xuất.

## Acceptance Criteria
| AC-ID | Mô tả | Testable? | Ghi chú |
|-------|-------|-----------|---------|
| AC-1 | Hiển thị ô Username, ô Password (ẩn ký tự), nút Login | ✅ | |
| AC-2 | Đúng thông tin thì vào trang sản phẩm | ✅ | Chưa có ngưỡng thời gian phản hồi. Đã chốt ở Q5 |
| AC-3 | Bỏ trống thì báo lỗi "tương ứng" | ✅ (sau Q&A) | Ban đầu ⚠️: không nêu nội dung lỗi. Đã làm rõ ở Q1, Q3 |
| AC-4 | Sai thông tin thì báo lỗi | ✅ (sau Q&A) | Ban đầu ⚠️: không nêu nội dung lỗi, hoa thường, khoảng trắng. Đã làm rõ ở Q1, Q2. Độ dài tối đa chờ Q14 |
| AC-5 | Tài khoản khóa thì báo bị khóa | ✅ (sau Q&A) | Ban đầu ⚠️: không nói trường hợp khóa + sai mật khẩu. Đã làm rõ ở Q4 |
| AC-6 | Chưa đăng nhập không vào được trang bên trong | ✅ | ⚠️ Cookie tự tạo vượt qua được (O-21, Q12, KB-02) |
| AC-7 | Đăng xuất về trang đăng nhập | ✅ | Không nói phiên hết hạn (Q9: ngoài phạm vi) |

## Business Rules (rút ra từ requirement và quan sát)
- BR-1: Danh sách user hợp lệ gồm 6 user, dùng chung một mật khẩu.
- BR-2: Phiên đăng nhập lưu trong cookie `session-username`. Đăng xuất thì xóa cookie này. ⚠️ Web chỉ dựa vào cookie này để xác thực, nên tự tạo cookie là vào được (O-21).
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
| O-19 | Console khi tải trang | 2 lỗi 401 tới `events.backtrace.io` (dịch vụ theo dõi lỗi bên thứ 3), cảnh báo thiếu `autocomplete` | Không ảnh hưởng chức năng (Q10) |
| O-20 | Bị báo lỗi, rồi gõ lại vào ô / bấm vào icon ✕ trong ô | Icon ✕ (hình trang trí `svg role=img`) **vẫn hiện khi đang gõ**, bấm vào không có tác dụng | Dễ hiểu nhầm là nút xóa (Q11, người duyệt phát hiện) |
| O-21 | Chưa đăng nhập, **tự tạo cookie** `session-username=standard_user` rồi mở `/inventory.html` | **Vào được**, thấy 6 sản phẩm | 🔴 Vượt qua đăng nhập (Q12, KB-02) |
| O-22 | Đã đăng nhập, tải lại trang (F5) | Vẫn ở `/inventory.html` | ✅ Giữ phiên |
| O-23 | Đã đăng nhập, mở lại `/` | Vẫn hiện form đăng nhập, không tự chuyển vào trang sản phẩm | (Q13) |
| O-24 | Bấm Login khi trống → nhập sai mật khẩu → nhập đúng | Thông báo đổi đúng theo từng lần thử, lần cuối vào `/inventory.html` | ✅ |
| O-25 | Chưa đăng nhập, mở `/inventory-item.html?id=4` | Bị đưa về `/`, thông báo `…'/inventory-item.html' when you are logged in.` | ✅ |

> **Bài học từ lần khám phá:** lần chạy đầu cho kết quả sai ở O-13/O-14 (user không chuyển trang, lỗi cũ dính sang bước sau). Nguyên nhân là **script khám phá** dùng chung một phiên trình duyệt và chờ chưa đủ lâu. Chạy lại với phiên sạch thì kết quả đúng.
> Đây là `script-issue`, không phải bug của web. Hãy nghi script của mình trước khi kết luận web có bug.

## Dependencies
- Cookie `session-username` (quản lý phiên đăng nhập)
- `events.backtrace.io`: dịch vụ theo dõi lỗi bên thứ 3, đang lỗi 401 (không ảnh hưởng đăng nhập)

## Phạm vi test
- **Trong phạm vi**: AC-1 → AC-7, 6 tài khoản test, đăng nhập bằng chuột và phím Enter, truy cập trực tiếp trang được bảo vệ (kể cả bằng cookie tự tạo), đăng xuất, nút Back, đăng nhập lại, giữ phiên khi tải lại trang.
- **Ngoài phạm vi** (đã ghi trong `viewpoint.csv` với `scope=out`): đăng ký, quên mật khẩu, hiệu năng (Q5), accessibility (Q10), phiên hết hạn (Q9), tự chuyển trang khi đã đăng nhập (Q13), bảo mật chuyên sâu.

## Review checklist
| Mục | Kết quả | Ghi chú |
|---|---|---|
| Chức năng được mô tả đầy đủ? | ⚠️ | Đủ luồng chính. Thiếu phiên hết hạn và hành vi sau khi đăng nhập thất bại |
| AC đo lường được, testable? | ⚠️ | AC-3/4/5 không nêu nội dung lỗi nên chưa viết được expected chính xác |
| Validation và error handling? | ⚠️ | Không nói phân biệt hoa thường, khoảng trắng, độ dài tối đa |
| Ràng buộc kỹ thuật / business? | ⚠️ | Thứ tự kiểm tra lỗi không được ghi (đã suy ra BR-3 từ quan sát) |
| Dependency được liệt kê? | ❌ | Requirement không nhắc cookie phiên, dịch vụ bên thứ 3 |
| Edge case, negative? | ❌ | Không đề cập. Đã bổ sung qua khám phá (O-05 → O-10, O-17, O-18, O-21 → O-25) |
| Có câu hỏi blocking? | ✅ | 14 câu (6 blocking, 8 non-blocking): xem [`q-and-a.md`](q-and-a.md). Còn mở: Q12, Q13, Q14 |

**Bug phát hiện sớm**: xem [`known-issues.md`](known-issues.md) (KB-01 → KB-04).
