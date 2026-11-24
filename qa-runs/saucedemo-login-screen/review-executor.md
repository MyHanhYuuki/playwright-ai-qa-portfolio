# Review: bước executor, SD-101 Đăng nhập

- **Ngày**: 2026-11-24 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ✅ **Đạt**
- **Phạm vi**: `triage.md`, `run-results/run-20261124-150906.json`, đối chiếu `known-issues.md`

## Checklist
| Mục | Kết quả |
|---|---|
| Phân loại có bằng chứng (thông báo lỗi, giá trị nhận được) | ✅ |
| Mọi BUG-xx có test bắt được | ✅ BUG-01 (TC-028), BUG-02 (TC-033). BUG-03 ghi nhận thời gian ở N1. BUG-04 không có TC (đúng theo Q8) |
| Test `test.fail()` fail **đúng assertion của bug**, không phải lỗi khác (lưu ý D2 của review script-gen) | ✅ Đã đọc lỗi chi tiết: TC-028 fail ở `not.toHaveClass`, TC-033 fail ở `toHaveURL` |
| Không có real-bug bị gắn nhầm thành script-issue | ✅ |
| Độ ổn định | ✅ Chạy lặp 2 lần: 66/66 |

## Lưu ý
| # | Vấn đề | Mức | Đề xuất |
|---|---|---|---|
| E1 | TC-006 mất 10,4 giây, sát ngưỡng 10 giây | 🟡 Minor | Theo dõi trên CI. Nếu chập chờn thì tăng timeout cho riêng TC-006 (không tăng `retries`) |
| E2 | "33 passed" trong báo cáo dễ gây hiểu nhầm là không có bug | 🟡 Minor | Khi báo cáo, luôn ghi rõ: **31 pass + 2 bug đã biết (expected fail)** |
