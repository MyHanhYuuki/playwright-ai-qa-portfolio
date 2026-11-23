# qa-orchestrator

Chạy QA pipeline đầy đủ cho một chức năng: 5 agent chạy tuần tự, có 3 điểm dừng HITL để người duyệt.

## Cách dùng
```
/qa-orchestrator <feature>            # vd: /qa-orchestrator saucedemo-login
/qa-orchestrator <feature> --from=<bước>  # chạy tiếp từ bước: design|impl|script|execute|report
```
`<feature>` ứng với thư mục `qa-runs/<feature>/`. Thư mục này phải có `requirement/requirement.md`.

---

## Pipeline
```
requirement
  ↓
[1] test-design ──→ spec-review.md, viewpoint.csv, internal-question.md
  ↓
⏸ HITL #1: người trả lời câu hỏi → qa/q-and-a.md
  ↓
[2] test-impl ────→ test-cases.csv, test-data.md
  ↓
⏸ HITL #2: người duyệt viewpoint + test case
  ↓
[3] script-gen ───→ tests/pages/*, tests/specs/<feature>.spec.ts
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
{ "feature": "saucedemo-login", "hitl_pending": null, "heal_counters": {}, "last_run_id": null, "last_error": null }
```
- `hitl_pending`: `"HITL #1"` | `"HITL #2"` | `"HITL #3"` | `null`
- `heal_counters`: `{ "TC-003": 1 }`

Trạng thái từng bước suy ra từ việc file kết quả đã tồn tại hay chưa (xem mục **Resume**).

---

## Bước 1: test-design
Gọi agent `test-design` với: `qa-runs/<feature>/requirement/`, `kb/q-and-a-archive.md`.
Kiểm tra: `spec-review.md` có nội dung, `viewpoint.csv` có ≥1 dòng, `internal-question.md` tồn tại, mỗi AC có ≥1 viewpoint.
Đặt `hitl_pending = "HITL #1"`.

## ⏸ HITL #1: trả lời câu hỏi
**Dừng pipeline**, thông báo:
```
⏸ HITL #1: test-design đã xong.
📋 Câu hỏi cần trả lời: [liệt kê từ internal-question.md, kèm "đề xuất mặc định"]
Trả lời trong chat (mình ghi vào qa/q-and-a.md) hoặc tự sửa file, rồi gõ: "HITL #1 done"
```
Khi người dùng xác nhận: ghi câu trả lời vào `qa/q-and-a.md`, thêm các câu có giá trị dùng lại vào `kb/q-and-a-archive.md`, đặt `hitl_pending = null`.

## Bước 2: test-impl
Gọi agent `test-impl` với: `viewpoint.csv`, `qa/q-and-a.md`, `spec-review.md`.
Kiểm tra: `test-cases.csv` có ≥1 TC, mọi TC có `linked_ac`, mọi viewpoint có ≥1 TC.
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

## Bước 4: executor
Gọi agent `executor` (phạm vi: cả feature). Đọc `triage.md` (mục mới nhất), lưu `last_run_id`.
- Có `script-issue` → **Vòng lặp healer**
- Có `real-bug` → **HITL #3**
- Tất cả pass hoặc chỉ flaky → **Bước 6/7**

## Vòng lặp healer
1. Với mỗi TC script-issue: nếu `heal_counters[tc] >= 2` thì đánh dấu `needs-manual-fix` và bỏ qua.
2. Gọi agent `healer` với danh sách TC và số vòng. Tăng `heal_counters[tc]`.
3. TC healer báo `reclassify: real-bug` → chuyển sang danh sách real-bug.
4. Gọi `executor` chạy lại subset các TC đã sửa → đọc lại `triage.md` → lặp lại.

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
### BUG-001: [Feature]: [hành vi sai, ngắn gọn]
- **Severity / Priority**: High / P2
- **Môi trường**: Chromium, <baseURL>, user: <username>
- **Steps to reproduce**: 1. … 2. … 3. …
- **Expected** (AC-x): …
- **Actual**: …
- **Evidence**: `test-results/…/test-failed-1.png`, trace
- **Linked**: TC-xxx · AC-x · run_id
```
Đầu file có bảng tổng hợp: `| Bug ID | TC | Title | Severity | Status |`.
Test của bug đã duyệt giữ nguyên trạng thái **fail**. Có thể đánh dấu `test.fail()` kèm comment `// BUG-001` để CI xanh nhưng vẫn theo dõi bug: test sẽ báo lỗi khi bug được sửa.

## Bước 7: RTM → `rtm-report.html`
Ma trận: **AC → viewpoint → TC → kết quả lần chạy cuối → bug**.
Cột: `AC | TVP | TC | Title | Technique | Auto? | Result | Bug`.
Tổng hợp: % AC có ≥1 TC pass, các AC chưa có TC (gap), số bug theo AC, số TC flaky / needs-manual-fix.
HTML tự chứa (CSS inline), có thể mở trực tiếp trong trình duyệt.

Cuối cùng in tóm tắt: số TC, pass/fail, số bug, coverage. Gợi ý commit.

---

## Resume
- `hitl_pending != null` → đang chờ người duyệt HITL đó
- Có `spec-review.md` + `viewpoint.csv` → bước 1 xong
- Có `qa/q-and-a.md` → HITL #1 xong
- Có `test-cases.csv` và các TC ở trạng thái `approved` → HITL #2 xong
- Có `tests/specs/<feature>.spec.ts` → bước 3 xong
- Có `triage.md` → bước 4 xong
- Có `defects.md` → bước 6 xong
- Có `rtm-report.html` → hoàn tất
