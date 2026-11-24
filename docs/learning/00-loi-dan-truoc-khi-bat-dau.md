# Bài 0: Lời dặn trước khi bắt đầu

> Những nguyên tắc rút ra từ thực tế làm QC manual và automation, áp dụng cho mọi bài sau.
> Đọc lại file này mỗi khi bí hoặc khi bắt đầu một dự án mới.

## Cách học trong dự án này
Mỗi bài đi theo cùng một khung:

| Phần | Nội dung |
|---|---|
| 🎯 Tại sao học | Học cái này để giải quyết vấn đề gì |
| 🏭 Ngoài thực tế | Tình huống hay gặp ở dự án thật |
| 👨‍🏫 Làm mẫu → giải thích → tự làm | AI làm mẫu, giải thích từng bước, rồi mình tự làm lại |
| ⚠️ Lỗi hay gặp | Những cái bẫy mà người mới hay mắc |
| ✅ Checklist | Tự kiểm tra trước khi chuyển bài |
| ❓ Câu hỏi liên quan | Kiểm tra mình đã hiểu thật chưa |

---

## 12 lời dặn

### Về tư duy test
**1. Automation không thay thế manual. Nó tự động hóa những gì manual đã hiểu.**
Không viết nổi test case manual rõ ràng thì đừng vội viết code. Code chỉ chạy nhanh hơn chứ không nghĩ giỏi hơn.

**2. Không phải cái gì cũng nên tự động hóa.**
Nên tự động hóa khi: chạy lặp lại nhiều lần (smoke, regression), chức năng đã ổn định, kết quả kiểm tra được bằng máy.
Nên để manual khi: UI còn thay đổi liên tục, chỉ test một lần, cần cảm nhận của người (UX, giao diện đẹp hay xấu).
> Quy tắc ngón tay cái: một test sẽ chạy **≥ 3 lần** và chức năng **đã ổn định** thì mới đáng tự động hóa.

**3. Hỏi sớm thì rẻ, phát hiện muộn thì đắt.**
Một câu hỏi ở giai đoạn đọc requirement tốn 5 phút. Cùng lỗi đó lọt lên production có thể tốn vài ngày cùng uy tín của cả team. Thấy mơ hồ thì **hỏi, đừng đoán**.

**4. Test pass không có nghĩa là không có bug.**
Test thiếu assertion, hoặc assertion sai, thì vẫn xanh. Với mỗi test hãy tự hỏi: **"Test này sẽ fail khi nào?"**
> Mẹo: cố tình sửa sai expected một chút rồi chạy. Test **không fail** tức là test vô dụng.

### Về viết test automation
**5. Test chập chờn (flaky) là kẻ thù số 1.**
Một test lúc xanh lúc đỏ làm team mất niềm tin vào **cả bộ test**. Đến lúc test đỏ thật cũng chẳng ai tin nữa.
- Không dùng chờ cứng (`waitForTimeout(3000)`). Hãy chờ theo điều kiện (`expect(...).toBeVisible()`).
- Gặp flaky thì tìm nguyên nhân gốc. Đừng tăng `retries` để che đi.

**6. Locator ổn định là nền móng.**
Ưu tiên: `getByRole` → `getByLabel` → `getByTestId` → CSS. Không dùng XPath dài hay class CSS kiểu `.btn-primary-23`.
> Ngoài thực tế: chủ động nhờ dev thêm `data-testid` vào phần tử khó tìm. Đó là kỹ năng giao tiếp chứ không phải làm phiền.

**7. Mỗi test phải độc lập.**
Test B không được dựa vào việc test A đã chạy trước. Mỗi test tự chuẩn bị dữ liệu và tự dọn sau khi chạy. Có như vậy test mới chạy song song và chạy riêng lẻ được.

**8. Code test cũng là code. Phải gọn và dễ bảo trì.**
UI đổi một chỗ thì chỉ sửa **một chỗ** (Page Object). Tên test đọc lên phải hiểu ngay là test gì. Test hôm nay viết, sáu tháng sau người khác (hoặc chính mình) phải sửa được.

### Về bug và giao tiếp
**9. Bug report tốt là bug report mà dev tái hiện được trong 2 phút.**
Cần có: các bước tái hiện, **Expected** (trích từ AC), **Actual**, bằng chứng (ảnh chụp, trace), môi trường, mức độ nghiêm trọng.
Viết về **hành vi**, không viết về **người**: "Nút Login không phản hồi khi..." chứ không phải "Dev làm lỗi...".

**10. Severity khác Priority.**
- **Severity (mức nghiêm trọng)**: lỗi ảnh hưởng hệ thống nặng tới đâu. Do QC đánh giá.
- **Priority (độ ưu tiên)**: cần sửa gấp tới đâu. Thường do PO/PM quyết định.
> Ví dụ: logo công ty sai chính tả trên trang chủ. Severity thấp nhưng Priority cao.

### Về làm việc với AI
**11. Coi AI như một junior làm rất nhanh nhưng hay tự tin sai.**
- AI viết test case, code, bug report rất nhanh. **Người chịu trách nhiệm vẫn là mình.**
- Luôn review: test có đúng AC không, có thiếu trường hợp biên không, assertion có thật sự kiểm tra gì không.
- Không hiểu đoạn nào AI viết thì **hỏi cho tới khi hiểu**. Đoạn mình không giải thích được là đoạn mình không sở hữu.

**12. Ghi chép và commit nhỏ.**
Mỗi commit làm một việc, message rõ ràng. Người xem repo sẽ đọc lịch sử git để hiểu cách mình làm việc.
Khi trình bày dự án, kể theo **STAR** (Situation, Task, Action, Result) và **có số liệu**.
> Ví dụ: "CI chạy 11 phút (S/T). Mình phân tích thời gian từng bước, chỉ cài Chromium và thêm cache (A). Còn 36 giây, nhanh hơn 18 lần (R)."
