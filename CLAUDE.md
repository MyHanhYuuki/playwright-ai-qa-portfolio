# CLAUDE.md: quy ước dự án

Dự án portfolio học test automation bằng **Playwright + TypeScript** với pipeline **AI agent**.
Đọc trước: [docs/tong-quan-du-an.md](docs/tong-quan-du-an.md) (mục đích, phạm vi, tiến độ) · [docs/ai-agent-workflow.md](docs/ai-agent-workflow.md) (pipeline).

## Cấu trúc
- `.claude/agents/`: 5 agent (test-design, test-impl, script-gen, executor, healer). `.claude/commands/qa-orchestrator.md`: điều phối.
- `qa-runs/<feature>/`: tài liệu QA từng chức năng (requirement → spec-review → viewpoint → test case → triage → defects → RTM).
- `tests/`: `pages/` (Page Object), `specs/`, `data/`, `fixtures/`, `seed.spec.ts` (seed cho Playwright MCP + smoke check).
- `docs/learning/NN-*.md`: ghi chú từng bài học. `docs/ai-log.md`: nhật ký dùng AI. `docs/thuat-ngu.md`: thuật ngữ.

## Lệnh
```bash
npm test               # chạy toàn bộ test
npm run test:smoke     # chỉ test @smoke
npm run test:ui        # UI mode
npm run report         # mở báo cáo HTML
```

## Quy ước viết test
- Locator: `getByRole` → `getByLabel`/`getByPlaceholder` → `getByTestId` (thuộc tính `data-test`) → CSS. Không dùng XPath, không dùng `.nth()` cố định.
- Web-first assertion (`await expect(locator).toBeVisible()`). **Không** dùng `waitForTimeout`, `networkidle`.
- Tên test bắt đầu bằng TC id (`TC-001 ...`), gắn tag `@AC-x`. Mỗi test độc lập.
- Không hardcode mật khẩu. Dùng `tests/data/`, đọc `process.env` (xem `.env.example`).
- **Không bao giờ sửa expected hay dùng `test.skip`/`fixme` để che bug.**

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
