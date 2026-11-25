# CLAUDE.md: quy ước dự án

Dự án portfolio học test automation bằng **Playwright + TypeScript** với pipeline **AI agent**.
Đọc trước: [docs/tong-quan-du-an.md](docs/tong-quan-du-an.md) (mục đích, phạm vi, tiến độ) · [docs/ai-agent-workflow.md](docs/ai-agent-workflow.md) (pipeline).

## Cấu trúc
- `.claude/agents/`: 6 agent (test-design, test-impl, script-gen, executor, healer, bug-reporter) + `qa-reviewer` (soát sau mỗi bước). `.claude/commands/qa-orchestrator.md`: điều phối.
- `qa-runs/<feature>/`: tài liệu QA từng chức năng (requirement → spec-review → viewpoint → test case → triage → defects → RTM). Mọi file review của qa-reviewer nằm chung trong `qa-runs/<feature>/reviews/`.
- `tests/`: `pages/` (Page Object), `specs/`, `data/`, `fixtures/`, `seed.spec.ts` (seed cho Playwright MCP + smoke check).
- `docs/learning/NN-*.md`: ghi chú từng bài học. `docs/ai-log.md`: nhật ký dùng AI. `docs/thuat-ngu.md`: thuật ngữ.

## Lệnh
```bash
npm test               # chạy toàn bộ test
npm run test:smoke     # chỉ test @smoke
npm run test:ui        # UI mode
npm run test:run -- <feature>       # chạy test 1 feature, lưu kết quả vào qa-runs/<feature>/run-results/
npm run test:evidence -- <feature>  # chạy kèm evidence: ảnh khoanh đỏ + ghi chú + video → qa-runs/<feature>/evidence/
npm run rtm -- <feature>            # tạo RTM (rtm.md + rtm-report.html) của feature
npm run report         # mở báo cáo HTML
npm run typecheck      # kiểm tra kiểu TypeScript (Playwright không tự kiểm)
npm run repro          # tái hiện độc lập các bug (tests/repro/*.repro.ts) → evidence/bugs/*/manual/
```
Thêm `-g "TC-001|TC-004"` để chạy một nhóm test. Mọi lệnh có `<feature>` chỉ đụng tới feature đó.

## Bắt đầu chức năng mới (màn hình mới)
Làm mẫu theo `qa-runs/saucedemo-login-screen/` (đã qua review cuối: `reviews/review-final.md`).
1. Đặt tên `<feature>` theo màn hình, **kết thúc bằng `-screen`**, vd `saucedemo-login-screen`, `saucedemo-products-cart-screen`, `saucedemo-checkout-screen` (Bài 9). **Tên này dùng chung** cho thư mục `qa-runs/<feature>/` và file `tests/specs/<feature>.spec.ts` (evidence lấy thư mục theo tên spec).
2. Tạo `qa-runs/<feature>/requirement/requirement.md` theo mẫu SD-101. AC **phải** viết dạng `- **AC-n**: …` (RTM đọc theo dạng này).
3. Chạy `/qa-orchestrator <feature>`, đi qua từng bước và 3 điểm HITL.
4. Đánh số:
   - `TC-xxx`, `TVP-xxx`, `Qn`, `O-xx`, `IMP-xx`: **riêng từng feature**, bắt đầu từ 001 / 1.
   - `BUG-xx`: **chung cả repo**, nối tiếp số lớn nhất đã có trong mọi `known-issues.md` (Login đã dùng BUG-01 → BUG-04, sản phẩm + giỏ BUG-05 → BUG-21, feature sau bắt đầu từ **BUG-22**).
5. Bug đã biết: ghi `BUG-xx` vào **câu đầu** cột `notes` của TC, vd `Bug đã biết BUG-08 (O-18): dự kiến FAIL. …` (RTM chỉ đọc câu đầu; nhắc BUG id ở câu sau chỉ là tham khảo), thêm vào `tests/data/bugs.ts`, test dùng `test.fail()` + tag `@BUG-xx`.
6. Dữ liệu dùng chung: thêm vào `tests/data/users.ts`, `messages.ts` (nhóm mới cho feature), không tạo file trùng.
7. Feature gồm **nhiều màn hình**: mọi tài liệu phải **ghi rõ màn hình** để không nhầm. `q-and-a.md`, `known-issues.md` chia mục theo màn hình (mục "Chung" cho thứ ảnh hưởng nhiều màn hình); bảng quan sát, `improvements.md` có cột "Màn hình"; `viewpoint.csv`, `test-cases.csv` có cột `screen` (nhiều màn hình ghi `A + B`, `A → B` hoặc `Cả n`; RTM tự tách để đếm theo màn hình). Code: `test.describe('Màn hình n: …')` cho từng màn hình và `test.describe('Chung: …')` cho test đi qua nhiều màn hình (mục lục evidence nhóm theo tên describe), tag màn hình kiểu `@list` / `@detail` / `@cart`.

## Quy ước viết test
- Locator: `getByRole` → `getByLabel`/`getByPlaceholder` → `getByTestId` (thuộc tính `data-test`) → CSS. Không dùng XPath, không dùng `.nth()` cố định.
- Web-first assertion (`await expect(locator).toBeVisible()`). **Không** dùng `waitForTimeout`, `networkidle`.
- Sau mỗi lần đổi trang: chờ phần tử **chỉ trang đích mới có**, không chỉ chờ URL (Page Object tự chờ: `openCart`, `backToProducts`, `continueShopping`, `logout`).
- Chạy `npm run typecheck` sau khi sửa code test.
- Tên test bắt đầu bằng TC id (`TC-001 ...`), gắn tag `@AC-x`. Mỗi test độc lập.
- Không hardcode mật khẩu. Dùng `tests/data/`, đọc `process.env` (xem `.env.example`).
- **Không bao giờ sửa expected hay dùng `test.skip`/`fixme` để che bug.**

## Xử lý phát hiện của qa-reviewer
- Sửa theo review rồi ghi bảng "Xử lý sau review" cuối file review. Chỉ ghi ✅ khi mọi chỗ liên quan đã sửa.
- **Không tái hiện được / không làm được một phát hiện: không tự đóng.** Quay lại trao đổi với qa-reviewer, hai bên chốt giải pháp (ghi mục `## Trao đổi <mã>` trong file review), rồi báo người dùng 3 ý: (1) không tái hiện được ở điểm nào, khác reviewer ở đâu; (2) sau trao đổi chốt thế nào, sẽ làm gì; (3) phương án tối ưu đề xuất để người dùng quyết. Chi tiết: `.claude/commands/qa-orchestrator.md`, `.claude/agents/qa-reviewer.md` mục 6b.

## Quy ước tài liệu
- Tài liệu tiếng Việt. README tiếng Anh.
- Mỗi bài học trong `docs/learning/` theo khung: 🎯 Tại sao học · 🏭 Ngoài thực tế · 👨‍🏫 Làm mẫu → giải thích → tự làm · ⚠️ Lỗi hay gặp · ✅ Checklist · ❓ Câu hỏi liên quan. Thêm link vào README.
- Tiêu đề phần hỏi đáp dùng "Câu hỏi liên quan".
- Xong một bài hoặc chức năng: cập nhật mục 7 (tiến độ) và mục 12 (số liệu) trong `docs/tong-quan-du-an.md`, thêm mục mới vào `docs/ai-log.md` nếu AI có sai sót hoặc có quyết định quan trọng.

## Git
- **Luôn hỏi người dùng xác nhận trước mỗi lần `git commit` và `git push`.** Trình bày danh sách file, commit message, có push hay không, rồi chờ đồng ý.
- Commit nhỏ, mỗi commit một việc, theo [Conventional Commits](https://www.conventionalcommits.org).
- **Commit message: loại (tiếng Anh) + mô tả tiếng Việt dễ hiểu**, kèm phần thân giải thích *trước/sau* hoặc *vì sao*:
  ```
  <loại>(<phạm vi>): <làm gì, viết tiếng Việt, ngắn gọn>

  - Vì sao / trước thế nào
  - Thay đổi gì / sau thế nào
  ```
  Loại: `feat` (tính năng mới) · `fix` (sửa lỗi) · `test` (thêm hoặc sửa test) · `docs` (tài liệu) · `ci` (cấu hình chạy tự động) · `chore` (việc lặt vặt: cấu hình, công cụ) · `refactor` (sắp xếp lại code, không đổi hành vi).
  Phạm vi (tùy chọn): chức năng bị ảnh hưởng, vd `test(login)`.
- Tác giả commit: `MyHanhYuuki <87911349+MyHanhYuuki@users.noreply.github.com>` (đã cấu hình trong repo). **Không** thêm dòng `Co-Authored-By`.
- Không commit thông tin cá nhân (email thật, đường dẫn máy, token). Quét trước khi commit.
