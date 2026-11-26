# Evidence: saucedemo-checkout-screen

> Tạo tự động bởi `npm run test:evidence` lúc 2026-11-26T07:35:02.480Z.
> Mỗi ảnh có **khung đỏ** khoanh vùng cần xem và dòng **"Cần xem"** nói rõ phải kiểm tra gì. Test case có bug (hoặc kết quả bất thường) có thêm video.
> Thư mục `manual/` trong từng bug: ảnh **tái hiện độc lập** (script riêng `npm run repro`, không dùng code test), tách khỏi ảnh của test tự động.

## Bug (theo ticket)
| Ticket_BUG | Màn hình của TC | Nội dung | Thư mục |
|---|---|---|---|
| [id_bug_2]_BUG-02 | Cả 3 | TC-038 | [bugs/[id_bug_2]_BUG-02/TC-038](<bugs/[id_bug_2]_BUG-02/TC-038/README.md>) |
| [id_bug_5]_BUG-05 | Thông tin + Tổng quan | TC-027 | [bugs/[id_bug_5]_BUG-05/TC-027](<bugs/[id_bug_5]_BUG-05/TC-027/README.md>) |
| [id_bug_7]_BUG-07 | Cả 3 | TC-043 | [bugs/[id_bug_7]_BUG-07/TC-043](<bugs/[id_bug_7]_BUG-07/TC-043/README.md>) |
| [id_bug_11]_BUG-11 | Tổng quan | TC-025 | [bugs/[id_bug_11]_BUG-11/TC-025](<bugs/[id_bug_11]_BUG-11/TC-025/README.md>) |
| [id_bug_16]_BUG-16 | Cả 3 | TC-044 | [bugs/[id_bug_16]_BUG-16/TC-044](<bugs/[id_bug_16]_BUG-16/TC-044/README.md>) |
| [id_bug_19]_BUG-19 | Thông tin | TC-042 | [bugs/[id_bug_19]_BUG-19/TC-042](<bugs/[id_bug_19]_BUG-19/TC-042/README.md>) |
| [id_bug_22]_BUG-22 | Thông tin | TC-003 | [bugs/[id_bug_22]_BUG-22/TC-003](<bugs/[id_bug_22]_BUG-22/TC-003/README.md>) |
| [id_bug_23]_BUG-23 | Thông tin | TC-009 | [bugs/[id_bug_23]_BUG-23/TC-009](<bugs/[id_bug_23]_BUG-23/TC-009/README.md>) |
| [id_bug_24]_BUG-24 | Tổng quan → Hoàn tất | TC-028 | [bugs/[id_bug_24]_BUG-24/TC-028](<bugs/[id_bug_24]_BUG-24/TC-028/README.md>) |
| [id_bug_24]_BUG-24 | Hoàn tất → Tổng quan | TC-029 | [bugs/[id_bug_24]_BUG-24/TC-029](<bugs/[id_bug_24]_BUG-24/TC-029/README.md>) |
| [id_bug_25]_BUG-25 | Tổng quan | TC-020 | [bugs/[id_bug_25]_BUG-25/TC-020](<bugs/[id_bug_25]_BUG-25/TC-020/README.md>) |
| [id_bug_26]_BUG-26 | Thông tin → Tổng quan | TC-040 | [bugs/[id_bug_26]_BUG-26/TC-040](<bugs/[id_bug_26]_BUG-26/TC-040/README.md>) |
| [id_bug_27]_BUG-27 | Hoàn tất | TC-041 | [bugs/[id_bug_27]_BUG-27/TC-041](<bugs/[id_bug_27]_BUG-27/TC-041/README.md>) |
| [id_bug_28]_BUG-28 | Thông tin → Tổng quan | TC-013 | [bugs/[id_bug_28]_BUG-28/TC-013](<bugs/[id_bug_28]_BUG-28/TC-013/README.md>) |
| [id_bug_29]_BUG-29 | Tổng quan → Hoàn tất | TC-026 | [bugs/[id_bug_29]_BUG-29/TC-026](<bugs/[id_bug_29]_BUG-29/TC-026/README.md>) |
| [id_bug_30]_BUG-30 | Tổng quan → Hoàn tất | TC-032 | [bugs/[id_bug_30]_BUG-30/TC-032](<bugs/[id_bug_30]_BUG-30/TC-032/README.md>) |
| [id_bug_31]_BUG-31 | Thông tin | TC-014 | [bugs/[id_bug_31]_BUG-31/TC-014](<bugs/[id_bug_31]_BUG-31/TC-014/README.md>) |
| [id_bug_32]_BUG-32 | Thông tin → Tổng quan | TC-015 | [bugs/[id_bug_32]_BUG-32/TC-015](<bugs/[id_bug_32]_BUG-32/TC-015/README.md>) |
| [id_bug_33]_BUG-33 | Tổng quan → Hoàn tất | TC-033 | [bugs/[id_bug_33]_BUG-33/TC-033](<bugs/[id_bug_33]_BUG-33/TC-033/README.md>) |
| [id_bug_34]_BUG-34 | Thông tin | TC-005 | [bugs/[id_bug_34]_BUG-34/TC-005](<bugs/[id_bug_34]_BUG-34/TC-005/README.md>) |
| [id_bug_35]_BUG-35 | Tổng quan → Hoàn tất | TC-051 | [bugs/[id_bug_35]_BUG-35/TC-051](<bugs/[id_bug_35]_BUG-35/TC-051/README.md>) |
| [id_bug_36]_BUG-36 | Cả 3 | TC-052 | [bugs/[id_bug_36]_BUG-36/TC-052](<bugs/[id_bug_36]_BUG-36/TC-052/README.md>) |

## Tất cả test case

### Màn hình 1: Thông tin (/checkout-step-one.html)
| Test case | Màn hình của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-001 Giỏ → Checkout mở trang Thông tin (giỏ 1 và 3 sản phẩm) | Thông tin | ✅ Passed | [all-cases/TC-001](all-cases/TC-001/README.md) |
| TC-002 Thiếu ô bắt buộc: báo lỗi ô đầu tiên còn thiếu (7 tổ hợp) | Thông tin | ✅ Passed | [all-cases/TC-002](all-cases/TC-002/README.md) |
| TC-003 Thiếu ô: chỉ ô còn thiếu bị tô đỏ, ô đã nhập không bị tô đỏ | Thông tin | ❌ Failed · Bug: BUG-22 | [all-cases/TC-003](all-cases/TC-003/README.md) |
| TC-004 Nút ✕ đóng thông báo lỗi, giá trị giữ nguyên, Continue lần sau báo ô tiếp theo | Thông tin | ✅ Passed | [all-cases/TC-004](all-cases/TC-004/README.md) |
| TC-005 Ô chỉ có khoảng trắng / ký tự tab bị coi như trống | Thông tin | ❌ Failed · Bug: BUG-34 | [all-cases/TC-005](all-cases/TC-005/README.md) |
| TC-006 Giá trị hợp lệ đa dạng được nhận, sang Tổng quan, script không chạy | Thông tin → Tổng quan | ✅ Passed | [all-cases/TC-006](all-cases/TC-006/README.md) |
| TC-007 Chuỗi 5000 ký tự ở cả 3 ô được nhận | Thông tin → Tổng quan | ✅ Passed | [all-cases/TC-007](all-cases/TC-007/README.md) |
| TC-009 Nhấn Enter trong ô nhập xử lý như Continue | Thông tin | ❌ Failed · Bug: BUG-23 | [all-cases/TC-009](all-cases/TC-009/README.md) |
| TC-010 Cancel ở Thông tin về trang giỏ, giỏ giữ nguyên | Thông tin | ✅ Passed | [all-cases/TC-010](all-cases/TC-010/README.md) |
| TC-011 Back, Forward, tải lại ở Thông tin | Thông tin | ✅ Passed | [all-cases/TC-011](all-cases/TC-011/README.md) |
| TC-012 3 ô trống lại sau Cancel, Back / Forward, tải lại | Thông tin | ✅ Passed | [all-cases/TC-012](all-cases/TC-012/README.md) |
| TC-013 problem_user: gõ được cả 3 ô, mỗi ô nhận đúng giá trị | Thông tin → Tổng quan | ❌ Failed · Bug: BUG-28 | [all-cases/TC-013](all-cases/TC-013/README.md) |
| TC-014 error_user: gõ được Last Name, không lỗi JavaScript, không gửi báo lỗi | Thông tin | ❌ Failed · Bug: BUG-31 | [all-cases/TC-014](all-cases/TC-014/README.md) |
| TC-015 error_user: thiếu Last Name thì báo lỗi, không sang Tổng quan | Thông tin → Tổng quan | ❌ Failed · Bug: BUG-32 | [all-cases/TC-015](all-cases/TC-015/README.md) |
| TC-040 Mở thẳng Tổng quan khi chưa nhập thông tin bị đưa về Thông tin | Thông tin → Tổng quan | ❌ Failed · Bug: BUG-26 | [all-cases/TC-040](all-cases/TC-040/README.md) |
| TC-042 Giỏ trống mở thẳng trang Thông tin bị chặn | Thông tin | ❌ Failed · Bug: BUG-19 | [all-cases/TC-042](all-cases/TC-042/README.md) |

### Màn hình 2: Tổng quan (/checkout-step-two.html)
| Test case | Màn hình của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-016 Tổng quan liệt kê đủ và đúng sản phẩm (4 giỏ) | Tổng quan | ✅ Passed | [all-cases/TC-016](all-cases/TC-016/README.md) |
| TC-017 Tổng quan giữ thứ tự của giỏ = thứ tự thêm vào | Tổng quan | ✅ Passed | [all-cases/TC-017](all-cases/TC-017/README.md) |
| TC-018 Item total, Tax 8 %, Total đúng giá trị (13 giỏ đại diện) | Tổng quan | ✅ Passed | [all-cases/TC-018](all-cases/TC-018/README.md) |
| TC-019 Item total, Tax, Total đúng giá trị: quét cả 63 tổ hợp × 2 thứ tự | Tổng quan | ✅ Passed | [all-cases/TC-019](all-cases/TC-019/README.md) |
| TC-020 Số tiền luôn dạng $x.xx (giỏ gây lỗi số thực, giỏ rỗng, mọi tài khoản) | Tổng quan | ❌ Failed · Bug: BUG-25 | [all-cases/TC-020](all-cases/TC-020/README.md) |
| TC-021 Payment / Shipping Information là 2 dòng cố định nguyên văn | Tổng quan | ✅ Passed | [all-cases/TC-021](all-cases/TC-021/README.md) |
| TC-022 Cancel ở Tổng quan về danh sách, giỏ giữ nguyên | Tổng quan | ✅ Passed | [all-cases/TC-022](all-cases/TC-022/README.md) |
| TC-024 Bấm tên sản phẩm ở Tổng quan mở đúng trang chi tiết (cả 6, standard_user) | Tổng quan | ✅ Passed | [all-cases/TC-024](all-cases/TC-024/README.md) |
| TC-025 problem_user: bấm tên sản phẩm ở Tổng quan mở đúng trang chi tiết (cả 6) | Tổng quan | ❌ Failed · Bug: BUG-11 | [all-cases/TC-025](all-cases/TC-025/README.md) |
| TC-026 problem_user: Item total, Tax, Total đúng như standard_user | Tổng quan → Hoàn tất | ❌ Failed · Bug: BUG-29 | [all-cases/TC-026](all-cases/TC-026/README.md) |
| TC-028 Tổng quan không có sản phẩm thì không đặt được đơn (giỏ trống qua Checkout, mở thẳng URL) | Tổng quan → Hoàn tất | ❌ Failed · Bug: BUG-24 | [all-cases/TC-028](all-cases/TC-028/README.md) |
| TC-030 Finish sang trang Hoàn tất, giỏ được làm trống | Tổng quan → Hoàn tất | ✅ Passed | [all-cases/TC-030](all-cases/TC-030/README.md) |
| TC-032 problem_user: Finish làm trống giỏ, Back Home toàn 'Add to cart', không đặt lại được | Tổng quan → Hoàn tất | ❌ Failed · Bug: BUG-30 | [all-cases/TC-032](all-cases/TC-032/README.md) |
| TC-033 error_user: Finish sang Hoàn tất, giỏ trống, không lỗi JavaScript | Tổng quan → Hoàn tất | ❌ Failed · Bug: BUG-33 | [all-cases/TC-033](all-cases/TC-033/README.md) |
| TC-051 Finish chỉ tạo đơn theo giỏ / phiên hiện tại (2 tab, sau Reset, giỏ đổi ở tab khác, đăng xuất ở tab khác) | Tổng quan → Hoàn tất | ❌ Failed · Bug: BUG-35 | [all-cases/TC-051](all-cases/TC-051/README.md) |

### Màn hình 3: Hoàn tất (/checkout-complete.html)
| Test case | Màn hình của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-029 Đặt xong bấm Back rồi Finish lại: không đặt được đơn lần 2 | Hoàn tất → Tổng quan | ❌ Failed · Bug: BUG-24 | [all-cases/TC-029](all-cases/TC-029/README.md) |
| TC-031 Back Home về danh sách với giỏ trống | Hoàn tất | ✅ Passed | [all-cases/TC-031](all-cases/TC-031/README.md) |
| TC-034 Generate PDF order: tải file, nội dung khớp đơn vừa đặt | Hoàn tất | ✅ Passed | [all-cases/TC-034](all-cases/TC-034/README.md) |
| TC-035 Biên nhận PDF mở bằng trình đọc PDF: bố cục, chữ đọc được | Hoàn tất | ✅ Passed | [all-cases/TC-035](all-cases/TC-035/README.md) |
| TC-036 Hoàn tất: tải lại, Reset App State, All Items, Back / Forward sau Back Home | Hoàn tất | ✅ Passed | [all-cases/TC-036](all-cases/TC-036/README.md) |
| TC-041 Mở thẳng Hoàn tất khi chưa Finish không báo đặt hàng thành công | Hoàn tất | ❌ Failed · Bug: BUG-27 | [all-cases/TC-041](all-cases/TC-041/README.md) |

### Chung: nhiều màn hình (luồng chính, kiểm soát truy cập, tài khoản, nhiều tab)
| Test case | Màn hình của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-008 Luồng chính: Giỏ → Thông tin → Tổng quan → Hoàn tất → danh sách | Cả 3 | ✅ Passed | [all-cases/TC-008](all-cases/TC-008/README.md) |
| TC-023 Back, Forward, tải lại ở Tổng quan | Thông tin + Tổng quan | ✅ Passed | [all-cases/TC-023](all-cases/TC-023/README.md) |
| TC-027 Reset App State ở Thông tin và Tổng quan cập nhật ngay | Thông tin + Tổng quan | ❌ Failed · Bug: BUG-05 | [all-cases/TC-027](all-cases/TC-027/README.md) |
| TC-037 Chưa đăng nhập mở thẳng 3 trang thanh toán bị chặn | Cả 3 | ✅ Passed | [all-cases/TC-037](all-cases/TC-037/README.md) |
| TC-038 Phiên giả mạo (cookie tự tạo) không vào được trang thanh toán, không đặt được hàng | Cả 3 | ❌ Failed · Bug: BUG-02 | [all-cases/TC-038](all-cases/TC-038/README.md) |
| TC-039 Đăng xuất ở Thông tin, Tổng quan, Hoàn tất rồi Back không xem lại được | Cả 3 | ✅ Passed | [all-cases/TC-039](all-cases/TC-039/README.md) |
| TC-043 Tài khoản đăng nhập sau không đặt hàng bằng giỏ của tài khoản trước (2 chiều) | Cả 3 | ❌ Failed · Bug: BUG-07 | [all-cases/TC-043](all-cases/TC-043/README.md) |
| TC-044 visual_user: bố cục 3 trang thanh toán giống standard_user | Cả 3 | ❌ Failed · Bug: BUG-16 | [all-cases/TC-044](all-cases/TC-044/README.md) |
| TC-045 visual_user: cả luồng thanh toán đúng như standard_user (mọi trường AC) | Cả 3 | ✅ Passed | [all-cases/TC-045](all-cases/TC-045/README.md) |
| TC-046 performance_glitch_user: cả luồng thanh toán thành công, ghi lại thời gian về danh sách | Cả 3 | ✅ Passed | [all-cases/TC-046](all-cases/TC-046/README.md) |
| TC-047 problem_user: các thao tác không lỗi vẫn đúng như standard_user | Cả 3 | ✅ Passed | [all-cases/TC-047](all-cases/TC-047/README.md) |
| TC-048 error_user: các thao tác không lỗi vẫn đúng như standard_user | Thông tin + Tổng quan | ✅ Passed | [all-cases/TC-048](all-cases/TC-048/README.md) |
| TC-049 Không lỗi JavaScript, không gửi báo lỗi khi đi luồng thanh toán (mọi tài khoản) | Cả 3 | ✅ Passed | [all-cases/TC-049](all-cases/TC-049/README.md) |
| TC-050 Rời luồng thanh toán bằng All Items và biểu tượng giỏ, giỏ giữ nguyên | Thông tin + Tổng quan | ✅ Passed | [all-cases/TC-050](all-cases/TC-050/README.md) |
| TC-052 Bấm đúp Continue / Finish chỉ chuyển trang một lần, Back một lần về trang trước | Cả 3 | ❌ Failed · Bug: BUG-36 | [all-cases/TC-052](all-cases/TC-052/README.md) |
| TC-053 Đơn thứ 2 sau đơn thứ nhất trong cùng phiên | Cả 3 | ✅ Passed | [all-cases/TC-053](all-cases/TC-053/README.md) |
