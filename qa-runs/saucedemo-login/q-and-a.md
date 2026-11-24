# Q&A sheet: SD-101 Đăng nhập Swag Labs

> **Phiếu hỏi đáp duy nhất** của chức năng: test-design đặt câu hỏi, người duyệt (PO/BA) trả lời ở HITL #1.
> Trạng thái: `Open` (chờ trả lời) · `Answered` (đã chốt).
> O-xx = quan sát trong [`spec-review.md`](spec-review.md). IMP-xx = [`improvements.md`](improvements.md). KB-xx = [`known-issues.md`](known-issues.md).

**Tổng hợp**: 14 câu (6 blocking, 8 non-blocking) · Answered 11 · **Open 3 (Q12–Q14)**

## Câu hỏi blocking
| # | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|
| Q1 | Nội dung thông báo lỗi chính xác? | AC-3/4/5 chỉ ghi "báo lỗi tương ứng" | Dùng nguyên văn câu chữ đang hiển thị | Theo đề xuất. Web không có tài liệu; so khớp nguyên văn bắt được cả sai chính tả, sai loại lỗi | Answered | Expected so khớp nguyên văn (MSG-01 → MSG-05 trong test-data) |
| Q2 | Phân biệt hoa thường? Cắt khoảng trắng? | O-06, O-07 | Password: phân biệt, không cắt. Username: theo hành vi hiện tại, đề xuất cắt khoảng trắng | Theo đề xuất. Không coi hành vi hiện tại là đúng chỉ vì web đang vậy, nên ghi IMP-01 | Answered | TC-015 → TC-018 expected báo sai thông tin |
| Q3 | Trống cả 2 ô báo lỗi nào? | O-02 | Chỉ "Username is required". Đề xuất UX báo từng ô | Theo đề xuất (IMP-02) | Answered | TC-009 → TC-011 |
| Q4 | Tài khoản khóa + sai mật khẩu báo gì? | O-09 | Báo "không khớp", không lộ trạng thái khóa | Theo đề xuất. Chống dò tài khoản | Answered | TC-021 |
| Q5 | Ngưỡng thời gian đăng nhập? | O-14: ~5,1 giây so với ~0,07 giây | Test chức năng chỉ kiểm tra thành công (≤10 giây). Báo riêng vấn đề hiệu năng, đề xuất ≤3 giây | Theo đề xuất (IMP-03, KB-03) | Answered | TC-006 timeout 10 giây |
| Q12 | **Tự tạo cookie `session-username` là vào được trang bên trong mà không cần đăng nhập. Là bug?** | O-21 (đã kiểm chứng) | **Là bug bảo mật, vi phạm AC-6.** Severity Critical với hệ thống thật. SauceDemo xác thực phía trình duyệt nên khó sửa, nhưng vẫn phải báo. Viết test (dự kiến fail) | – | **Open** | TVP-020, TC-033, KB-02 |

## Câu hỏi non-blocking
| # | Câu hỏi | Context | Đề xuất | Trả lời | Trạng thái | Ảnh hưởng tới test |
|---|---|---|---|---|---|---|
| Q6 | Thiếu Password mà ô Username cũng tô đỏ? | O-03 | Bug giao diện, mức Low | Theo đề xuất. Gây hiểu nhầm username sai | Answered | TVP-016, TC-028, KB-01 |
| Q7 | Xóa ô Password sau khi đăng nhập lỗi? | O-10 | Không yêu cầu | Theo đề xuất. Ticket không nêu | Answered | TVP-025 (ngoài phạm vi) |
| Q8 | Lỗi "You can only access…" không tự mất? | O-18 | Quan sát mức Low | Theo đề xuất | Answered | Không viết test. Theo dõi ở KB-04 |
| Q9 | Test phiên hết hạn 10 phút? | O-12 | Ngoài phạm vi | Theo đề xuất. Tách ticket riêng nếu cần | Answered | TVP-023 (ngoài phạm vi) |
| Q10 | Accessibility (thiếu label)? | O-01, O-19 | Ngoài phạm vi, tách ticket accessibility | Theo đề xuất. Vi phạm WCAG (IMP-04) | Answered | TVP-022 (ngoài phạm vi) |
| Q11 | Icon ✕ trong ô nhập dễ hiểu nhầm là nút xóa? | O-20 (người duyệt phát hiện) | Đề xuất cải tiến UX | Theo đề xuất (IMP-05) | Answered | Không viết test |
| Q13 | **Đã đăng nhập mà mở lại `/` vẫn thấy form đăng nhập. Có nên tự chuyển vào trang sản phẩm?** | O-23 | Không phải bug theo AC. Chuẩn phổ biến là tự chuyển vào trang chính, nên ghi đề xuất cải tiến (IMP-06) | – | **Open** | TVP-024 (ngoài phạm vi) |
| Q14 | **Username/password có độ dài tối đa không?** | O-05: 1000 ký tự vẫn xử lý bình thường | Hỏi PO. Tạm thời coi là không giới hạn, chỉ test giá trị cực lớn (không làm được BVA) | – | **Open** | TC-019. Có giới hạn thì thêm TC giá trị biên |

**Người trả lời**: MyHanhYuuki · Q1–Q11 chốt ngày 2026-11-24 (AI soạn theo gợi ý đã được người duyệt góp ý và chốt).
