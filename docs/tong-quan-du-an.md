# Tổng quan dự án: Playwright AI QA Portfolio

> Tài liệu giới thiệu dự án, kiêm **Test Plan rút gọn**. Đọc file này đầu tiên.
> Cập nhật lần cuối: 2026-11-24

## 1. Mục đích
1. **Học và chứng minh** khả năng tự thiết kế, xây dựng test automation bằng **Playwright**, có **AI agent** hỗ trợ.
2. Làm theo **quy trình QA chuẩn**: phân tích yêu cầu → thiết kế test → viết code → chạy → phân loại lỗi → báo bug → truy vết. Không phải kiểu "AI cứ thế sinh code".

## 2. Thông tin chung
| Mục | Nội dung |
|---|---|
| Người thực hiện | MyHanhYuuki (QC tester) |
| Vai trò AI | Claude Code: hướng dẫn, làm mẫu, chạy pipeline agent |
| Vai trò người thực hiện | **Kiểm tra và duyệt mọi kết quả AI tạo ra** trước khi dùng: trả lời câu hỏi, duyệt test case, xác nhận bug, quyết định commit/push |
| Bắt đầu | 2026-11-23 · Dự kiến khoảng 6 tuần |
| Repo | https://github.com/MyHanhYuuki/playwright-ai-qa-portfolio |
| Phiên bản trước | [learn-ai-automation-test](https://github.com/MyHanhYuuki/learn-ai-automation-test) (v1: pipeline QA với form đăng nhập đơn giản) |

## 3. Hệ thống được test
| Hệ thống | Loại | Phạm vi test | Lý do chọn |
|---|---|---|---|
| [SauceDemo (Swag Labs)](https://www.saucedemo.com) | Web bán hàng (UI) | Đăng nhập, sản phẩm, giỏ hàng, thanh toán, đăng xuất | Có bug cố ý, có `data-test`, ổn định |
| [Restful Booker](https://restful-booker.herokuapp.com) | REST API | Xác thực, CRUD đặt phòng | Có tài liệu API, có bug cố ý |
| [The Internet](https://the-internet.herokuapp.com) | Web (UI) | iframe, alert, upload, nội dung động | Luyện các tình huống khó |

## 4. Công cụ và ngôn ngữ
| Hạng mục | Công cụ | Ghi chú |
|---|---|---|
| Framework test | **Playwright Test 1.65** | UI và API test |
| Ngôn ngữ | **TypeScript** | Chạy trên Node.js |
| Trình duyệt | Chromium | Firefox/WebKit bổ sung sau |
| AI agent | **Claude Code** + 5 agent tự định nghĩa + 1 agent review | `.claude/agents/` |
| Cầu nối AI ↔ trình duyệt | **Playwright MCP** | Agent thao tác trên web thật |
| Quản lý mã nguồn | Git + GitHub | |
| CI | **GitHub Actions** | Tự chạy test mỗi lần push |
| IDE | VS Code + extension Playwright Test | |
| Tài liệu | Markdown, CSV, HTML | Test case dạng CSV mở được bằng Excel |

## 5. Phạm vi
- **Trong phạm vi**: kiểm thử chức năng (functional), dữ liệu đúng/sai/biên, luồng end-to-end, kiểm soát truy cập, API.
- **Ngoài phạm vi**: kiểm thử hiệu năng, bảo mật chuyên sâu, kiểm thử trên mobile thật. Các mục này chỉ ghi nhận quan sát, không đánh pass/fail.

## 6. Cách tiếp cận
**Pipeline 5 AI agent, có 3 điểm người duyệt (HITL):**
```
Requirement → [1] Phân tích yêu cầu → ⏸ Làm rõ yêu cầu → [2] Thiết kế test case → ⏸ Duyệt test case
           → [3] Viết code test → [4] Chạy và phân loại lỗi → [5] Sửa test sai → ⏸ Duyệt bug → Bug report + RTM
```
Chi tiết: [Sơ đồ AI agent](ai-agent-workflow.md) · [Bản tương tác](ai-agent-workflow.html)

**Nguyên tắc kỹ thuật:**
- Thiết kế test case theo kỹ thuật: phân vùng tương đương, giá trị biên, bảng quyết định, chuyển trạng thái.
- Code theo **Page Object Model**. Locator ưu tiên `getByRole` → `getByLabel` → `getByTestId`.
- Không dùng chờ cứng. Mỗi test độc lập. Truy vết **AC → viewpoint → test case → kết quả → bug**.
- AI làm, **người duyệt**. AI không được sửa test để che bug.

## 7. Hạng mục công việc và tiến độ
| # | Hạng mục | Kết quả đầu ra | Trạng thái |
|---|---|---|---|
| 0 | Lời dặn, nguyên tắc làm việc | `docs/learning/00-…` | ✅ |
| 1 | Dựng dự án, CI, pipeline AI agent | Cấu trúc repo, CI chạy tự động | ✅ |
| 2 | Phân tích yêu cầu: Đăng nhập | spec-review, viewpoint, Q&A, đề xuất cải tiến | ✅ |
| 3 | Thiết kế test case: Đăng nhập | test-cases.csv, test-data | ✅ |
| 4 | Viết code test (POM) | `tests/pages`, `tests/specs` | ✅ |
| 5 | Chạy test và phân loại lỗi | triage.md, báo cáo HTML | ✅ |
| 6 | Sửa test hỏng (healer) | healing-log.md | ⏭ Lần này không có script-issue |
| 7 | Bug report + RTM | defects.md, rtm.md / rtm-report.html (`npm run rtm`) | ✅ |
| 8 | Giỏ hàng → Thanh toán (cả pipeline) | Bộ test E2E mua hàng | ⏳ |
| 9 | Test API: Restful Booker | `tests/api` | ⏳ |
| 10 | Hoàn thiện CI, README, tổng kết | Báo cáo tổng kết | ⏳ |

## 8. Sản phẩm bàn giao
- **Tài liệu QA** cho mỗi chức năng (`qa-runs/<feature>/`): requirement, spec review, viewpoint, test case, triage, bug report, RTM.
- **Code test automation** (`tests/`): Page Object, spec, test data.
- **CI** tự động chạy và lưu báo cáo HTML sau mỗi lần push.
- **Ghi chú học tập** (`docs/learning/`): giải thích từng bước bằng tiếng Việt. Kèm [bảng thuật ngữ](thuat-ngu.md).
- **Nhật ký dùng AI** ([`docs/ai-log.md`](ai-log.md)): AI làm gì, sai ở đâu, người kiểm soát thế nào.

## 9. Kết quả đạt được sau dự án
| Nhóm | Kỹ năng |
|---|---|
| Tư duy QA | Review requirement, thiết kế test case bằng các kỹ thuật chuẩn, viết bug report, truy vết RTM |
| Automation | Playwright + TypeScript, Page Object Model, locator ổn định, xử lý test chập chờn, test API |
| AI trong kiểm thử | Thiết kế pipeline AI agent, dùng Playwright MCP, kiểm soát và duyệt kết quả AI |
| DevOps cơ bản | Git, GitHub, CI với GitHub Actions, tối ưu thời gian chạy |

## 10. Tiêu chí hoàn thành
- 100% AC có ít nhất 1 test case. Mỗi test case truy vết được về AC.
- Mọi test case `automatable` đã có code, và hoặc **pass**, hoặc **fail kèm bug report đã duyệt**.
- Không còn test chập chờn chưa rõ nguyên nhân.
- CI xanh, thời gian chạy dưới 2 phút.

## 11. Rủi ro và cách xử lý
| Rủi ro | Cách xử lý |
|---|---|
| Web demo thay đổi giao diện hoặc tạm ngưng | Locator ổn định, healer sửa script, chạy lại sau |
| AI sinh kết quả sai nhưng trông hợp lý | 3 điểm người duyệt (HITL). Người thực hiện tự kiểm tra lại mọi kết quả AI |
| Test chập chờn do mạng | Chờ theo điều kiện, retry chỉ trên CI, phân loại flaky riêng |
| Chi phí token AI | Làm theo từng chức năng nhỏ, không chạy lại cả pipeline khi không cần |

## 12. Số liệu nổi bật (cập nhật dần)
| Chỉ số | Giá trị |
|---|---|
| Thời gian CI | 11 phút 8 giây → 36 giây ở lần đo đầu. Lần sau 5,5 phút do bước apt của Ubuntu không ổn định. **Đo lại và xử lý ở Bài 10** (dùng Docker image Playwright) |
| Đăng nhập: phân tích yêu cầu | 7 AC, 25 quan sát, 25 viewpoint (20 trong phạm vi), 14 câu hỏi, 6 đề xuất cải tiến |
| Đăng nhập: bug phát hiện sớm (trước khi chạy test) | 4, trong đó 1 lỗi bảo mật: vượt đăng nhập bằng cookie tự tạo |
| Đăng nhập: test case | 33 TC, phủ 20/20 viewpoint, 7/7 AC |
| Đăng nhập: code test | 33 test (POM: 2 Page Object, 2 fixture), 5 test smoke |
| Đăng nhập: kết quả chạy | 31 pass + 2 bug đã biết fail đúng chỗ, 0 chập chờn (chạy lặp 66/66), 15,8 giây |
| Đăng nhập: RTM | 7/7 AC có test case, 5/7 AC đạt, 2 bug đang mở (1 High bảo mật, 1 Low giao diện) |
