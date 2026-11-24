# qa-orchestrator

Chạy QA pipeline đầy đủ cho một chức năng: 5 agent chạy tuần tự, **qa-reviewer soát lại sau mỗi bước**, có 3 điểm dừng HITL để người duyệt.

## Cách dùng
```
/qa-orchestrator <feature>            # vd: /qa-orchestrator saucedemo-login-screen
/qa-orchestrator <feature> --from=<bước>  # chạy tiếp từ bước: design|impl|script|execute|report
```
`<feature>` ứng với thư mục `qa-runs/<feature>/`. Thư mục này phải có `requirement/requirement.md`.

---

## Pipeline
```
requirement
  ↓
[1] test-design ──→ spec-review.md, viewpoint.csv, q-and-a.md, known-issues.md, improvements.md
  ↓
🔍 qa-reviewer ──→ review-test-design.md
  ↓
⏸ HITL #1: người trả lời câu hỏi (cột Trả lời trong q-and-a.md) + xem review
  ↓
[2] test-impl ────→ test-cases.csv, test-data.md
  ↓
🔍 qa-reviewer ──→ review-test-impl.md
  ↓
⏸ HITL #2: người duyệt viewpoint + test case
  ↓
[3] script-gen ───→ tests/pages/*, tests/specs/<feature>.spec.ts
  ↓
🔍 qa-reviewer ──→ review-script-gen.md
  ↓
[4] executor ─────→ run-results/<run_id>.json, triage.md
  ↓
  ├─ script-issue → [5] healer → executor chạy lại subset (tối đa 2 vòng/TC)
  ├─ real-bug     → ⏸ HITL #3: người duyệt bug
  ├─ flaky        → ghi nhận, không chặn
  └─ all pass     → báo cáo
  ↓
[6] bug-report → defects.md      [7] RTM → rtm-report.html
```

**Nguyên tắc**: chỉ orchestrator gọi agent. Agent không gọi nhau, chỉ trao đổi qua file trong `qa-runs/<feature>/`.

---

## State: `qa-runs/<feature>/.qa-state.json`
Chỉ lưu những thứ **không suy ra được từ file kết quả** (file này không commit):
```json
{ "feature": "saucedemo-login-screen", "hitl_pending": null, "heal_counters": {}, "last_run_id": null, "last_error": null }
```
- `hitl_pending`: `"HITL #1"` | `"HITL #2"` | `"HITL #3"` | `null`
- `heal_counters`: `{ "TC-003": 1 }`

Trạng thái từng bước suy ra từ việc file kết quả đã tồn tại hay chưa (xem mục **Resume**).

---

## Bước 1: test-design
Gọi agent `test-design` với: `qa-runs/<feature>/requirement/`, `knowledge-base/q-and-a-archive.md`.
Kiểm tra: `spec-review.md` có nội dung, `viewpoint.csv` có ≥1 dòng, `q-and-a.md` tồn tại, mỗi AC có ≥1 viewpoint.

## 🔍 Review sau mỗi bước
Sau **mỗi** bước test-design, test-impl, script-gen, executor: gọi agent `qa-reviewer` với tên bước.
- Kết luận 🔴 "Phải làm lại": gọi lại bước đó kèm `review-<bước>.md` (tối đa 1 lần), rồi review lại.
- Kết luận ⚠️ hoặc ✅: đưa `review-<bước>.md` vào thông báo HITL kế tiếp để người duyệt quyết định sửa gì.

Đặt `hitl_pending = "HITL #1"`.

## ⏸ HITL #1: trả lời câu hỏi
**Dừng pipeline**, thông báo:
```
⏸ HITL #1: test-design đã xong.
🔍 Review: [kết luận + số phát hiện trong review-test-design.md]
📋 Câu hỏi Open: [liệt kê từ q-and-a.md, kèm "Đề xuất"]
Trả lời trong chat (mình ghi vào cột Trả lời) hoặc tự sửa file, rồi gõ: "HITL #1 done"
```
Khi người dùng xác nhận: ghi câu trả lời vào cột **Trả lời** của `q-and-a.md`, đổi trạng thái thành `Answered`, cập nhật viewpoint/known-issues theo câu trả lời, thêm các câu có giá trị dùng lại vào `knowledge-base/q-and-a-archive.md`, đặt `hitl_pending = null`.

## Bước 2: test-impl
Gọi agent `test-impl` với: `viewpoint.csv`, `q-and-a.md`, `known-issues.md`, `spec-review.md`.
Kiểm tra: `test-cases.csv` có ≥1 TC, mọi TC có `linked_ac`, mọi viewpoint `scope=in` có ≥1 TC, mọi BUG-xx có TC.
Gọi `qa-reviewer` (test-impl).
Đặt `hitl_pending = "HITL #2"`.

## ⏸ HITL #2: duyệt test design
**Dừng pipeline**, thông báo:
```
⏸ HITL #2: test-impl đã xong.
📄 Cần duyệt: viewpoint.csv (X viewpoint), test-cases.csv (X TC: Y automatable)
   [bảng tóm tắt: TC id | title | technique | priority]
Gõ "HITL #2 approved" hoặc "HITL #2 feedback: <ý kiến>"
```
Nếu có feedback thì gọi lại `test-impl` kèm feedback. Nếu approved thì đổi `status` các TC thành `approved` và đặt `hitl_pending = null`.

## Bước 3: script-gen
Gọi agent `script-gen` với: `test-cases.csv`, `test-data.md`, `spec-review.md`, thư mục `tests/`.
Kiểm tra: `npx playwright test --list tests/specs/<feature>.spec.ts` chạy được, số test khớp số TC `automatable`.
Gọi `qa-reviewer` (script-gen).

**Đổi quy ước giữa chừng** (vd thêm cột `screen`): liệt kê các file đã tạo bị ảnh hưởng, cập nhật chúng trước HITL tiếp theo.

## Bước 4: executor
Gọi agent `executor` (phạm vi: cả feature, `npm run test:run -- <feature>`). Đọc `triage.md` (mục mới nhất), lưu `last_run_id`.
Không còn script-issue thì executor chụp evidence: `npm run test:evidence -- <feature>`.
Gọi `qa-reviewer` (executor) để soát phân loại, nhất là đối chiếu với `known-issues.md`.
- Có `script-issue` → **Vòng lặp healer**
- Có `real-bug` → **HITL #3**
- Tất cả pass hoặc chỉ flaky → **Bước 6/7**

## Vòng lặp healer
1. Với mỗi TC script-issue: nếu `heal_counters[tc] >= 2` thì đánh dấu `needs-manual-fix` và bỏ qua.
2. Gọi agent `healer` với danh sách TC và số vòng. Tăng `heal_counters[tc]`.
3. TC healer báo `reclassify: real-bug` → chuyển sang danh sách real-bug.
4. Gọi `executor` chạy lại subset các TC đã sửa (`npm run test:run -- <feature> -g "TC-001|TC-004" --triggered-by healer-round-N`) → đọc lại `triage.md` → lặp lại.

## ⏸ HITL #3: duyệt bug
**Dừng pipeline**, đặt `hitl_pending = "HITL #3"`:
```
⏸ HITL #3: executor đã phân loại xong.
🐛 Real bug cần duyệt: [TC id | tóm tắt | expected vs actual | severity]
Gõ "HITL #3 approved" | "HITL #3 approved: TC-001, TC-003" | "HITL #3 rejected: TC-002 <lý do>"
```
Bug bị từ chối (báo nhầm) thì chuyển lại thành script-issue để healer xử lý.

## Bước 6: bug report → `defects.md`
Mỗi bug đã duyệt ghi theo mẫu:
```markdown
### BUG-01: [Chức năng] hành vi sai, ngắn gọn
- **Ticket**: `[id_bug_n]` (chưa log) · **Severity / Priority**: High / P2 (đề xuất, PO chốt), kèm lý do
- **Môi trường**: <baseURL>, Chromium, ngày · **Tần suất**: x/y lần
- **Liên quan**: AC-x · TVP-xxx · TC-xxx · Qx
- **Điều kiện trước**, **Các bước tái hiện** (đánh số, dữ liệu cụ thể)
- **Kết quả mong đợi** (trích AC / Q&A) · **Kết quả thực tế**
- **Evidence**: `evidence/bugs/[id_bug_n]_BUG-xx/TC-xxx/` (ảnh khoanh đỏ + video)
```
Đầu file có bảng tổng hợp: `| Bug | Ticket | TC | Tiêu đề | Severity | Priority | Trạng thái |`. Cuối file ghi các BUG-xx trong `known-issues.md` **không** đưa vào report, kèm lý do.
Tự làm lại các bước tái hiện trên trình duyệt sạch trước khi ghi. Thử cả **biến thể** (chiều ngược lại, dữ liệu khác, trang khác). Ảnh tái hiện bằng tay lưu riêng vào `evidence/bugs/<ticket>_BUG-xx/manual/` kèm README (thao tác, kết quả, thời điểm).
Có biến thể thì **mở rộng TC đang bắt bug** để kiểm tra mọi biến thể (`expect.soft`), không tạo TC mới, và chụp lại evidence cho mọi biến thể.
Test của bug đã duyệt giữ nguyên trạng thái **fail**: `test.fail(true, 'BUG-xx: …')` + tag `@BUG-xx` để CI xanh nhưng vẫn theo dõi bug (test báo khi bug được sửa). Thêm `'BUG-xx': '[id_bug_n]'` vào `tests/data/bugs.ts`, ghi `BUG-xx` vào cột `notes` của TC (RTM đọc cột này), rồi chụp lại evidence: `npm run test:evidence -- <feature> -g "TC-xxx"`.

## Bước 7: RTM → `npm run rtm` → `rtm.md` + `rtm-report.html`
Ma trận: **AC → viewpoint → TC → kết quả lần chạy cuối → bug**.
Cột: `AC | TVP | TC | Title | Technique | Auto? | Result | Bug`.
Tổng hợp: % AC có TC, % AC đạt (mọi TC liên quan Passed; skip / flaky / chưa chạy thì **không** tính đạt), các AC chưa có TC (gap), số bug đang mở theo AC, số TC flaky / cần làm tay. Có cảnh báo khi lần chạy không full hoặc số TC lệch.
Tạo bằng `npm run rtm -- <feature>` (không làm tay, chỉ feature đang làm): `rtm.md` xem trên GitHub, `rtm-report.html` tự chứa, mở bằng trình duyệt.
Sau bước 6 + 7 gọi `qa-reviewer` với bước `defects` → `review-defects.md`.

Cuối cùng in tóm tắt: số TC, pass/fail, số bug, coverage. Gợi ý commit.

---

## Resume
- `hitl_pending != null` → đang chờ người duyệt HITL đó
- Có `spec-review.md` + `viewpoint.csv` → bước 1 xong
- `q-and-a.md` không còn câu blocking `Open` → HITL #1 xong
- Có `test-cases.csv` và các TC ở trạng thái `approved` → HITL #2 xong
- Có `tests/specs/<feature>.spec.ts` → bước 3 xong
- Có `triage.md` → bước 4 xong
- Có `defects.md` → bước 6 xong
- Có `rtm-report.html` → hoàn tất
