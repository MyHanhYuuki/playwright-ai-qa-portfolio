# Bài 5: Chạy test và phân loại kết quả (executor)

> Bước **[4] executor**. Kết quả: [`triage.md`](../../qa-runs/saucedemo-login-screen/triage.md) · [`run-results/`](../../qa-runs/saucedemo-login-screen/run-results/) · Review: [`review-executor.md`](../../qa-runs/saucedemo-login-screen/review-executor.md)

## 🎯 Tại sao học
Chạy test thì ai cũng bấm được. Giá trị của QC nằm ở việc **đọc đúng kết quả**: test fail là do web lỗi, do test viết sai, hay do môi trường chập chờn? Phân loại sai thì báo nhầm bug, hoặc tệ hơn là bỏ lọt bug.

## 🏭 Ngoài thực tế
- Báo cáo "100% pass" chưa chắc là tin tốt. Phải hỏi: test có kiểm tra đúng không, bug đã biết có bị bắt không?
- Dev mất niềm tin vào QC nhanh nhất khi QC **báo nhầm bug** (thật ra là test sai).

## 👨‍🏫 Làm mẫu

### 1. Chạy test
```bash
npx playwright test tests/specs/saucedemo-login-screen.spec.ts --reporter=line,json,html
```
Kết quả: **33 passed (15,8 giây)**, 9 test chạy song song.

### 2. Đừng vội tin "33 passed"
Trong 33 test có 2 test **bug đã biết** dùng `test.fail()`. "Pass" ở đây nghĩa là "đã fail đúng như dự kiến". Nhưng `test.fail()` cũng tính là pass nếu test fail vì **lỗi khác** (vd: locator sai). Vì vậy phải mở báo cáo, đọc lỗi chi tiết:

| Test | Fail ở đâu | Đúng bug? |
|---|---|---|
| TC-028 | `not.toHaveClass(/input_error/)`: ô Username vẫn có class lỗi | ✅ KI-01 |
| TC-033 | `toHaveURL`: vẫn ở `/inventory.html` dù chỉ có cookie giả | ✅ KI-02 |

Cách báo cáo đúng: **31 pass + 2 bug đã biết**, không phải "33 pass".

### 3. Kiểm tra độ ổn định
Một lần chạy chưa đủ để kết luận (bài học từ vụ đo CI). Chạy lặp:
```bash
npx playwright test tests/specs/saucedemo-login-screen.spec.ts --repeat-each=2
```
**66/66 pass**, không có test chập chờn.

### 4. Phân loại (triage)
| Nhãn | Ý nghĩa | Lần này |
|---|---|---|
| `flaky` | Lúc pass lúc fail, do môi trường hoặc timing | 0 |
| `script-issue` | Code test sai (locator, chờ, logic) → healer sửa | 0 |
| `real-bug` | Web làm sai so với AC → người duyệt ở HITL #3 | **2** (KI-01, KI-02) |

Thêm một ghi nhận: TC-006 mất 10,4 giây, **sát ngưỡng** 10 giây. Đây là nguy cơ chập chờn, cần theo dõi.

### 5. Xem báo cáo HTML
```bash
npm run report
```
Mở từng test để xem các bước, thời gian, lỗi, ảnh chụp lúc fail.

## 👉 Bạn tự làm
1. Chạy `npm run report`, mở **TC-033**, đọc phần lỗi, chỉ ra dòng nào chứng minh bug.
2. Chạy `npx playwright test -g "TC-006" --headed`, đếm xem đăng nhập mất bao lâu.
3. Thử tạo một `script-issue`: sửa locator `getByPlaceholder('Username')` thành `getByPlaceholder('User')`, chạy `-g "TC-003"`, đọc lỗi, rồi sửa lại. So sánh thông báo lỗi này với lỗi của TC-028.

## ⚠️ Lỗi hay gặp
| Lỗi | Cách tránh |
|---|---|
| Báo "100% pass" mà không nói tới expected fail | Báo cáo tách riêng: pass / bug đã biết / flaky |
| Thấy fail là báo bug ngay | Đọc lỗi: locator không tìm thấy thì thường là script-issue |
| Test chập chờn thì tăng `retries` | Tìm nguyên nhân gốc, chỉ tăng timeout đúng chỗ cần |
| Chỉ chạy 1 lần rồi kết luận | Chạy lặp (`--repeat-each`) trước khi kết luận ổn định |

## ✅ Checklist
- [ ] Phân biệt được flaky, script-issue, real-bug, mỗi loại một ví dụ
- [ ] Giải thích được vì sao "33 passed" vẫn có 2 bug
- [ ] Biết mở báo cáo HTML và đọc lỗi của một test

## ❓ Câu hỏi liên quan

### Q1. Làm sao phân biệt test fail do bug hay do test viết sai?
**Trả lời:**
- **Test sai (script-issue)**: lỗi kiểu `locator not found`, `strict mode violation`, timeout khi chờ phần tử. Tức là test **không tìm thấy** thứ cần kiểm tra.
- **Bug (real-bug)**: test tìm thấy phần tử, nhưng **giá trị hoặc hành vi sai** so với expected (vd: nhận "input_error" trong khi mong đợi không có).
- Luôn kiểm chứng: mở trace hoặc ảnh chụp, tự làm lại bằng tay trên web.

### Q2. Flaky test là gì? Xử lý thế nào?
**Trả lời:**
- Test lúc pass lúc fail dù code không đổi. Nguyên nhân hay gặp: chờ chưa đúng, test phụ thuộc nhau, mạng chậm, dữ liệu dùng chung.
- Phát hiện: chạy lặp nhiều lần (`--repeat-each`).
- Xử lý: sửa **nguyên nhân gốc** (chờ theo điều kiện, tách dữ liệu). Không dùng `retries` cao để che giấu.

### Q3. `test.fail()` dùng khi nào? Rủi ro gì?
**Trả lời:**
- Dùng cho test của **bug đã biết, chưa sửa**: test vẫn kiểm tra hành vi đúng, CI không đỏ, và test báo khi bug được sửa.
- Rủi ro: test fail vì **bất kỳ lý do gì** cũng được tính là "đúng dự kiến", kể cả khi script hỏng. Phải kiểm tra test fail **đúng assertion của bug**.
