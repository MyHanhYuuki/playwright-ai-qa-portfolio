# Thuật ngữ

> Tra nhanh các thuật ngữ dùng trong dự án. Sắp xếp theo nhóm, mỗi thuật ngữ có nghĩa ngắn gọn và ví dụ trong dự án.

## Quy trình QA
| Thuật ngữ | Nghĩa | Ví dụ trong dự án |
|---|---|---|
| **SUT / AUT** (System/Application Under Test) | Hệ thống đang được test | SauceDemo (saucedemo.com) |
| **Requirement** | Tài liệu mô tả chức năng cần làm | `qa-runs/saucedemo-login-screen/requirement/` |
| **User story** | Yêu cầu viết dạng "Là… tôi muốn… để…" | "Là khách hàng, tôi muốn đăng nhập để mua hàng" |
| **AC** (Acceptance Criteria) | Tiêu chí nghiệm thu: điều kiện để coi chức năng là "xong" | AC-3: bỏ trống thì báo lỗi |
| **Testable** | Đo lường được, kiểm tra được pass/fail | "Báo lỗi phù hợp" là **không** testable |
| **Spec review** | Review requirement để tìm chỗ thiếu, mơ hồ | `spec-review.md` |
| **Test Viewpoint** (TVP) | Góc nhìn cần kiểm tra ("test cái gì") | TVP-006: các tổ hợp ô trống |
| **Test case** (TC) | Cách kiểm tra cụ thể: bước, dữ liệu, kết quả mong đợi | TC-001 |
| **Test data** (TD) | Dữ liệu dùng để test | `tests/data/users.ts` |
| **Expected / Actual** | Kết quả mong đợi / kết quả thực tế | Expected "Swag Labs", Actual "Example Domain" |
| **Exploratory testing** | Vừa khám phá vừa thiết kế vừa chạy test, dựa trên quan sát | Bài 2: 19 quan sát O-01 → O-19 |
| **Happy path** | Luồng thành công, bình thường nhất | `standard_user` đăng nhập đúng |
| **Negative test** | Test với dữ liệu hoặc thao tác sai | Sai mật khẩu |
| **Smoke test** | Bộ test nhỏ kiểm tra hệ thống "còn sống", chạy trước tiên | `npm run test:smoke` |
| **Regression test** | Chạy lại test cũ để chắc thay đổi mới không làm hỏng cái cũ | Toàn bộ suite chạy trên CI |
| **Test Plan** | Kế hoạch kiểm thử: mục tiêu, phạm vi, cách làm, tiêu chí xong, rủi ro | `docs/tong-quan-du-an.md` |
| **Exit criteria** | Tiêu chí hoàn thành: khi nào coi là test xong | Mục 10 trong tổng quan dự án |
| **RTM** (Requirement Traceability Matrix) | Ma trận truy vết: requirement → AC → TC → kết quả → bug | `rtm-report.html` |
| **Q&A sheet** | Phiếu hỏi đáp: câu hỏi và câu trả lời nằm chung một file, có trạng thái Open/Answered | `qa-runs/saucedemo-login-screen/q-and-a.md` |
| **Known issue** | Bug đã biết từ trước khi chạy test. Test phải bắt được | `known-issues.md` (KI-xx) |
| **Peer review** (review chéo) | Người khác (hoặc agent khác) soát lại kết quả trước khi đi tiếp | Agent `qa-reviewer` |
| **Scope in / out** | Trong / ngoài phạm vi test. Ghi cả mục ngoài phạm vi để biết là đã cân nhắc | Cột `scope` trong `viewpoint.csv` |
| **Coverage** | Độ phủ: bao nhiêu % yêu cầu đã được test | % AC có ≥1 TC pass |

## Kỹ thuật thiết kế test case
| Thuật ngữ | Nghĩa | Ví dụ |
|---|---|---|
| **EP** (Equivalence Partitioning, phân vùng tương đương) | Chia dữ liệu thành nhóm hành xử giống nhau, mỗi nhóm test 1 đại diện | Nhóm "sai mật khẩu" chỉ cần test 1 giá trị sai |
| **BVA** (Boundary Value Analysis, giá trị biên) | Test tại biên: min-1, min, max, max+1 | Ô dài tối đa 50 ký tự thì test 49, 50, 51 |
| **Decision Table** (bảng quyết định) | Liệt kê tổ hợp nhiều điều kiện và kết quả tương ứng | (Username trống/có) × (Password trống/có) |
| **State Transition** (chuyển trạng thái) | Test các chuyển trạng thái hợp lệ và không hợp lệ | Đã đăng nhập → Đăng xuất → bấm Back |
| **Error Guessing** (đoán lỗi) | Dựa kinh nghiệm đoán chỗ hay lỗi | Khoảng trắng, viết hoa, bấm 2 lần |

## Bug
| Thuật ngữ | Nghĩa | Ví dụ |
|---|---|---|
| **Bug / Defect** | Hệ thống hoạt động khác với yêu cầu | Ô Username bị tô đỏ khi chỉ thiếu Password |
| **Severity** | Mức nghiêm trọng (QC đánh giá) | Critical / High / Medium / Low |
| **Priority** | Độ ưu tiên sửa (PO/PM quyết định) | P1 / P2 / P3 |
| **Defect triage** | Họp hoặc duyệt để phân loại bug, chốt severity và priority | HITL #3 |
| **False positive** | Báo có bug nhưng thật ra không phải bug | Script khám phá báo nhầm 3 user không đăng nhập được |
| **Reproduce** (tái hiện) | Làm lại theo các bước để thấy bug xảy ra lần nữa | "Steps to reproduce" trong bug report |

## Automation và Playwright
| Thuật ngữ | Nghĩa | Ví dụ |
|---|---|---|
| **Playwright** | Framework test tự động web của Microsoft | |
| **Locator** | Cách tìm một phần tử trên trang | `page.getByRole('button', { name: 'Login' })` |
| **Assertion** | Câu kiểm tra kết quả, sai thì test fail | `await expect(page).toHaveTitle('Swag Labs')` |
| **Web-first assertion** | Assertion tự chờ và thử lại tới khi đúng hoặc hết thời gian | `toBeVisible()`, `toHaveText()` |
| **Hard wait** (chờ cứng) | Chờ một khoảng cố định. **Không nên dùng** | `waitForTimeout(3000)` |
| **POM** (Page Object Model) | Mỗi trang web là một class chứa locator và thao tác. UI đổi thì sửa một chỗ | `tests/pages/LoginPage.ts` |
| **Fixture** | Phần chuẩn bị dùng chung cho nhiều test | Trang đã đăng nhập sẵn |
| **Headless / Headed** | Chạy trình duyệt ẩn / hiện trên màn hình | `npm run test:headed` |
| **Trace** | "Hộp đen" ghi lại từng bước, ảnh chụp, network khi test chạy | Mở bằng `npx playwright show-trace` |
| **Flaky test** | Test lúc pass lúc fail dù code không đổi | Do chờ chưa đủ, phụ thuộc thứ tự test |
| **Seed test** | Test khởi đầu để AI agent mở trình duyệt ở đúng trang | `tests/seed.spec.ts` |
| **Tag** | Nhãn để lọc test | `@smoke`, `@AC-1` |
| **Codegen** | Thao tác tay trên web, Playwright tự ghi thành code | `npx playwright codegen` |

## AI agent
| Thuật ngữ | Nghĩa | Ví dụ |
|---|---|---|
| **AI agent** | AI được giao vai trò cụ thể, có công cụ riêng, tự làm nhiều bước | `test-design`, `healer` |
| **Orchestrator** | Thành phần điều phối, gọi các agent theo thứ tự | `/qa-orchestrator` |
| **HITL** (Human-in-the-loop) | Điểm quy trình tự động dừng lại để người duyệt | HITL #1, #2, #3 |
| **MCP** (Model Context Protocol) | Giao thức để AI dùng công cụ bên ngoài | Playwright MCP: AI điều khiển trình duyệt |
| **Triage** | Phân loại test fail: flaky / script-issue / real-bug | `triage.md` |
| **Script-issue** | Test fail do code test sai, không phải web lỗi | Locator sai, chờ chưa đủ |
| **Real-bug** | Test fail do web hoạt động sai so với yêu cầu | |
| **Self-healing** | Tự sửa test khi UI thay đổi | Agent `healer` |

## Git và CI
| Thuật ngữ | Nghĩa | Ví dụ |
|---|---|---|
| **Repository** (repo) | Kho chứa mã nguồn và lịch sử thay đổi | `playwright-ai-qa-portfolio` |
| **Commit** | Một lần lưu thay đổi kèm mô tả | `docs: add lesson 0` |
| **Push** | Đẩy commit từ máy lên GitHub | |
| **Conventional Commits** | Quy ước đặt tên commit: `feat:`, `fix:`, `test:`, `docs:`, `ci:`, `chore:` | |
| **CI** (Continuous Integration) | Tự động chạy test mỗi khi push code | GitHub Actions |
| **Cache** (trong CI) | Lưu lại thứ đã tải để lần sau không tải lại | Cache Chromium: CI từ 11 phút xuống 36 giây |
| **Badge** | Huy hiệu trên README hiển thị trạng thái CI | ![badge](https://img.shields.io/badge/tests-passing-brightgreen) |
| **Environment variable** (biến môi trường) | Giá trị cấu hình đặt bên ngoài code | `BASE_URL`, `SAUCE_PASSWORD` (`.env.example`) |
