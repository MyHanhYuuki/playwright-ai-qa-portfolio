# Review: bước test-design (và bản nháp test case), SD-101 Đăng nhập

- **Ngày**: 2026-11-24 · **Reviewer**: AI (vai QC Lead, theo ISTQB) · **Người duyệt cuối**: MyHanhYuuki
- **Phạm vi**: requirement, spec-review, viewpoint, internal-question, q-and-a, improvements, test-cases (nháp), test-data
- **Kết luận**: ⚠️ **Cần sửa trước khi duyệt HITL #2**: 1 vấn đề nghiêm trọng (bảo mật), 4 thiếu sót viewpoint, 5 điểm không nhất quán.
- **Xử lý**: ✅ Người duyệt chấp nhận toàn bộ. **Đã sửa hết** (2026-11-24). Q12–Q14 đã chốt theo đề xuất.

## A. Phát hiện mới (đã kiểm chứng trên web)
| # | Phát hiện | Mức | Đề xuất |
|---|---|---|---|
| A1 | **Tự tạo cookie `session-username=standard_user` là vào được trang sản phẩm mà không cần đăng nhập** (O-21) | 🔴 Critical nếu là hệ thống thật | Thêm câu hỏi Q12. Liên quan trực tiếp AC-6 ("chưa đăng nhập không truy cập được") |
| A2 | Đã đăng nhập mà mở lại `/` thì vẫn thấy form đăng nhập, không tự chuyển vào trang sản phẩm (O-23) | Low | Thêm câu hỏi Q13 |
| A3 | Tải lại trang (F5) khi đã đăng nhập thì vẫn giữ phiên (O-22) | – | Thêm viewpoint |
| A4 | Đăng nhập lỗi xong, nhập lại đúng thì vào được. Thông báo lỗi cập nhật theo lần thử mới nhất (O-24) | – | Thêm viewpoint |

## B. Thiếu viewpoint
| # | Thiếu | Kỹ thuật | Đề xuất |
|---|---|---|---|
| B1 | Đăng nhập lại sau khi đăng xuất | State Transition | TVP-017 |
| B2 | Thử lại sau khi lỗi: thông báo cập nhật đúng, nhập đúng thì vào được (A4) | State Transition | TVP-018 |
| B3 | Giữ phiên khi tải lại trang (A3) | Flow | TVP-019 |
| B4 | Trang chi tiết sản phẩm `/inventory-item.html?id=4` cũng phải bị chặn khi chưa đăng nhập | EP (trang có tham số) | Bổ sung vào TVP-013 |
| B5 | Các viewpoint **ngoài phạm vi** (hiệu năng, accessibility, session timeout, bảo mật) chưa được ghi trong `viewpoint.csv` | – | Thêm cột `scope` (in/out), ghi cả viewpoint ngoài phạm vi để RTM thấy là đã cân nhắc |

## C. Không nhất quán giữa các file
| # | Vấn đề | Đề xuất |
|---|---|---|
| C1 | `internal-question.md` (10 câu) và `q-and-a.md` (11 câu, có Q11) **trùng nội dung câu hỏi** và đã lệch nhau | Gộp thành **1 file Q&A** (xem mục E) |
| C2 | `spec-review.md` vẫn đánh AC-3/4/5 là ⚠️ "chưa testable" dù HITL #1 đã chốt | Cập nhật thành ✅, ghi "đã làm rõ ở Q1–Q4" |
| C3 | `spec-review.md` ghi "5 câu blocking, 5 non-blocking", thực tế có 11 câu | Sửa số liệu |
| C4 | O-20 nằm trước O-19 | Sắp xếp lại |
| C5 | Ghi chú Bài 2 ghi "10 câu hỏi" | Sửa thành 11 (13 nếu thêm Q12, Q13) |

## D. Test case (bản nháp)
| # | Vấn đề | Đề xuất |
|---|---|---|
| D1 | TC-019 ghi kỹ thuật "BVA" nhưng không có biên (requirement không nêu độ dài tối đa) | Đổi thành "Error Guessing". Thêm câu hỏi "độ dài tối đa?" vào backlog |
| D2 | TC-005→008 test **cả 4** user cùng nhóm là trái nguyên tắc EP (1 đại diện/nhóm) | Giữ, nhưng ghi lý do: mỗi user có hành vi đặc biệt riêng nên là **các phân vùng khác nhau** |
| D3 | Chưa có TC cho B1–B4 | Thêm khoảng 4–5 TC sau khi chốt viewpoint |

## E. Quy trình
| # | Đề xuất |
|---|---|
| E1 | **Gộp Q&A**: `internal-question.md` thành **phiếu Q&A duy nhất**, mỗi câu có: câu hỏi, context, đề xuất, *trả lời*, *người trả lời*, *trạng thái* (Open/Answered). Bỏ `qa/q-and-a.md`. Ngoài thực tế gọi là **Q&A sheet**, chỉ một nguồn sự thật |
| E2 | Thêm agent **`qa-reviewer`** (QC Lead, ISTQB): chạy **sau mỗi bước, trước HITL**, ra `review-<bước>.md`. Lỗi nghiêm trọng thì trả về bước đó sửa |
