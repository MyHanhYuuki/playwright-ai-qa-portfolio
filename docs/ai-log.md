# Nhật ký dùng AI (AI usage log)

> Ghi lại **AI đã làm gì, sai ở đâu, người kiểm soát thế nào**.
> Mục đích: chứng minh AI được dùng có kiểm soát. Mọi kết quả AI đều được kiểm chứng trước khi chấp nhận.

**Công cụ:** Claude Code (AI trợ lý chính, kèm subagent) · Playwright MCP (AI điều khiển trình duyệt)

## Tổng hợp
| # | Ngày | Việc | AI đóng góp | Sai sót / rủi ro phát hiện | Kiểm soát của người |
|---|---|---|---|---|---|
| 1 | 2026-11-24 | Thiết kế pipeline AI agent | Đề xuất ghép pipeline v1 với 3 agent của Playwright | Bản ghép đầu tiên **trùng vai và lệch định dạng** | Yêu cầu AI cân nhắc lại hiệu quả, chọn phương án ghép có chọn lọc |
| 2 | 2026-11-24 | Script hướng dẫn agent | Viết hướng dẫn cho agent `script-gen` | Hướng dẫn gọi `npx tsc` khi dự án **chưa cài TypeScript** | Phát hiện khi chạy thử, sửa hướng dẫn |
| 3 | 2026-11-24 | Tối ưu CI | Phân tích thời gian từng bước, đề xuất cache | **Kết luận vội từ một lần đo**: lần sau bước apt mất 5,5 phút | Ghi nhận, để Bài 10 đo nhiều lần rồi mới chốt số liệu |
| 4 | 2026-11-24 | Khám phá web (Bài 2) | Khám phá SauceDemo bằng trình duyệt, khoảng 20 tình huống | Lần đầu **báo nhầm 3 user không đăng nhập được** (script-issue) | Chạy lại với phiên sạch, xác nhận không phải bug |
| 5 | 2026-11-24 | Seed test | – | Test seed mặc định **rỗng nhưng vẫn pass**, làm CI xanh giả | Đổi thành smoke check, **chứng minh test fail được** khi đổi URL sai |
| 6 | 2026-11-24 | Review sau bước test-design | Review lại toàn bộ theo vai QC Lead + ISTQB | AI **tự bỏ sót** ở bước trước: lỗ hổng cookie, 4 viewpoint, 2 file câu hỏi trùng, ghi sai kỹ thuật BVA | Người yêu cầu thêm bước review sau mỗi bước, tạo agent `qa-reviewer` |

---

## Chi tiết

### #1: Thiết kế pipeline: không ghép máy móc
- **Bối cảnh**: có 2 bộ agent: pipeline QA của repo v1 (5 agent, 3 HITL, RTM) và 3 agent có sẵn của Playwright (planner, generator, healer).
- **AI đề xuất lần đầu**: ghép cả hai thành 7 bước.
- **Vấn đề**: khi được yêu cầu cân nhắc lại, AI chỉ ra `generator` chỉ đọc kế hoạch dạng Markdown của `planner`, không đọc `test-cases.csv`. `planner` trùng vai với `test-design`. `healer` của Playwright tự `test.fixme()` nên giẫm lên bước phân loại lỗi.
- **Quyết định**: giữ khung QA của v1, chỉ lấy **công cụ** Playwright MCP gắn vào các agent cần trình duyệt.
- **Bài học**: hỏi AI "phương án này có hiệu quả không?" thường lộ ra vấn đề mà lần trả lời đầu bỏ qua.

### #2: AI dùng công cụ chưa được cài
- **Chuyện xảy ra**: hướng dẫn của `script-gen` bảo kiểm tra code bằng `npx tsc`. Dự án không cài TypeScript compiler, nên `npx` tải nhầm một package tên `tsc` đã bị bỏ, không liên quan.
- **Xử lý**: đổi sang `npx playwright test --list`, lệnh này tự biên dịch TypeScript.
- **Bài học**: AI hay giả định môi trường có sẵn công cụ. Luôn **chạy thử** hướng dẫn AI viết ra.

### #4: Báo nhầm bug khi khám phá
- **Chuyện xảy ra**: script khám phá dùng **chung một phiên trình duyệt** cho mọi tình huống và chờ cố định 300 ms. Kết quả: `performance_glitch_user`, `error_user`, `visual_user` "không đăng nhập được", và thông báo lỗi cũ dính sang bước sau.
- **Kiểm chứng**: chạy lại, mỗi tình huống một phiên sạch, chờ theo điều kiện (URL đổi hoặc lỗi hiện ra). Cả 5 user đều đăng nhập được. `performance_glitch_user` chỉ chậm (khoảng 5,1 giây).
- **Phân loại**: `script-issue` (false positive), **không** phải bug của web.
- **Bài học**: test phải độc lập (lời dặn số 7). Trước khi báo bug, nghi script của mình trước.

### #5: Test xanh mà không kiểm tra gì
- **Chuyện xảy ra**: `tests/seed.spec.ts` do Playwright tạo sẵn không có bước nào nhưng vẫn **pass**, nên CI xanh mà không test gì.
- **Xử lý**: đổi thành smoke check (mở trang, kiểm tra tiêu đề và nút Login). Chạy với `BASE_URL=https://example.com` thì test **fail đúng như mong đợi**.
- **Bài học**: lời dặn số 4: test không thể fail là test vô dụng.

### #6: AI bỏ sót ở bước trước, chỉ lộ ra khi review lại
- **Chuyện xảy ra**: sau khi chốt HITL #1, người duyệt yêu cầu review lại toàn bộ theo góc nhìn QC Lead. AI phát hiện chính nó đã bỏ sót: **tự tạo cookie là vượt qua được đăng nhập** (lỗi bảo mật, vi phạm AC-6), 4 viewpoint (đăng nhập lại, thử lại sau lỗi, tải lại trang, trang có tham số URL), 2 file câu hỏi trùng nhau, và ghi sai kỹ thuật "BVA" cho TC không có biên.
- **Xử lý**: bổ sung viewpoint, test case, phiếu Q&A gộp, `known-issues.md`. Thêm agent `qa-reviewer` chạy **sau mỗi bước, trước HITL**.
- **Bài học**: AI làm một lượt thường **thiếu chiều sâu ở các luồng chuyển trạng thái và bảo mật**. Một vòng review riêng, có checklist, bắt được nhiều hơn hẳn.

### #7: Lệnh chạy evidence không chạy test nào mà không ai để ý
- **Chuyện xảy ra**: `npm run test:evidence -- -g "TC-028|TC-033"` trên Windows bị cmd cắt ở dấu `|` (hiểu là "nối lệnh"), nên **0 test chạy**. Script vẫn tạo lại mục lục evidence như bình thường, AI chỉ đọc vài dòng cuối nên suýt báo "đã chụp lại xong".
- **Nguyên nhân gốc**: script gọi `npx` qua shell (`shell: true`). Ký tự đặc biệt `| & < > ^` bị shell xử lý trước khi tới Playwright.
- **Xử lý**: gọi thẳng Playwright bằng Node, **không qua shell**, nên tham số đi nguyên vẹn trên mọi hệ điều hành. Thêm cảnh báo khi exit code khác 0 (có test fail hoặc không có test nào chạy).
- **Bài học**: sau mỗi lần chạy, **đối chiếu số test đã chạy với số dự kiến** (chọn 2 TC thì phải thấy "2 passed"). Không thấy dòng đó thì chưa được kết luận gì.
