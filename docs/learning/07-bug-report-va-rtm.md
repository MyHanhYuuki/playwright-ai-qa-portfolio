# Bài 7: Viết bug report và RTM

> Bước **[6] bug report + RTM** (sau HITL #3). Kết quả: [`defects.md`](../../qa-runs/saucedemo-login-screen/defects.md) · [`rtm.md`](../../qa-runs/saucedemo-login-screen/rtm.md) (bản HTML: `rtm-report.html`) · Review: [`review-defects.md`](../../qa-runs/saucedemo-login-screen/review-defects.md)

## 🎯 Tại sao học
- Tìm ra bug mới được nửa việc. **Bug report viết kém thì bug không được sửa**: dev không tái hiện được, trả về "cannot reproduce", hoặc hiểu sai mức độ.
- **RTM** trả lời câu hỏi mà PM, khách hàng hỏi trước mỗi lần release: *"Yêu cầu nào đã test, đạt hay chưa, còn bug gì?"*

## 🏭 Ngoài thực tế
- Dev đọc bug report trong lúc đang bận việc khác. Nếu **2 phút** không tái hiện được, bug thường bị để đó.
- Bug hay bị trả về vì: thiếu bước, thiếu dữ liệu ("nhập user bất kỳ"), thiếu môi trường, expected là ý kiến riêng của QC chứ không có trong yêu cầu.
- **Severity ≠ Priority**: bug bảo mật nặng (severity cao) mà nằm ở tính năng chưa ra mắt thì có thể chưa cần sửa gấp (priority thấp). Ngược lại, lỗi chính tả trên logo trang chủ: severity thấp nhưng priority cao.

## 👨‍🏫 Làm mẫu

### 1. Khung một bug report
| Phần | Viết thế nào | Ví dụ BUG-02 |
|---|---|---|
| Tiêu đề | `[Chức năng] hành vi sai`, đọc là hiểu | [Login] Tự tạo cookie là vào được trang bên trong |
| Severity / Priority | Kèm lý do. Priority do PO chốt, QC đề xuất | High / P1 (đề xuất) |
| Môi trường | URL, trình duyệt, phiên bản, ngày | saucedemo.com · Chromium · 2026-11-24 |
| Tần suất | Bao nhiêu lần tái hiện / bao nhiêu lần thử | 100% (3/3) |
| Điều kiện trước | Trạng thái trước khi làm | Chưa đăng nhập, trình duyệt sạch |
| Các bước | Đánh số, dữ liệu cụ thể, ai cũng làm theo được | Mở web → F12 → chạy lệnh tạo cookie → mở `/inventory.html` |
| Expected | **Trích từ AC hoặc câu trả lời Q&A** | AC-6, Q12: bị đưa về trang đăng nhập |
| Actual | Đúng cái thấy được, không đoán | Vào thẳng trang Products, 6 sản phẩm |
| Evidence | Ảnh khoanh đỏ + video, link mở được | `evidence/bugs/[id_bug_2]_BUG-02/` |
| Liên quan | AC, viewpoint, TC, câu hỏi | AC-6 · TVP-020 · TC-033 · Q12 |

Mẹo: viết xong thì **tự làm lại theo đúng các bước mình viết**, trên trình duyệt sạch. Mình đã làm thế với BUG-02: chạy đúng lệnh `document.cookie = …` trong Console, kết quả vào được trang Products.

### 2. Không phải gì lạ cũng thành bug report
`known-issues.md` có 4 mục nhưng `defects.md` chỉ có 2. BUG-03 (user chậm 5 giây) là hành vi cố ý của web demo, chưa có AC về thời gian, nên chuyển thành đề xuất cải tiến (IMP-03). BUG-04 là quan sát chưa có TC. Ghi rõ lý do ở cuối `defects.md` để người đọc biết là **đã cân nhắc**, không phải bỏ sót.

### 3. RTM tự động
```bash
npm run rtm
```
Script `scripts/build-rtm.mjs` đọc `requirement.md` (AC), `viewpoint.csv`, `test-cases.csv`, kết quả chạy mới nhất trong `run-results/` và `defects.md`, rồi tạo:
- `rtm.md`: xem trực tiếp trên GitHub
- `rtm-report.html`: mở bằng trình duyệt, có tô màu

Kết quả lần này: **7/7 AC có test case**, **5/7 AC đạt**, 31/33 TC Passed. AC-3 và AC-6 chưa đạt vì BUG-01 và BUG-02.

> 🏭 Ngoài thực tế: RTM làm tay bằng Excel rất hay bị **lệch** với test case thật sau vài lần sửa. Tạo tự động từ chính file nguồn thì luôn khớp. Sửa test case xong chỉ cần chạy lại `npm run rtm`.

### 4. Đọc RTM thế nào
- Cột **TC = 0** ở một AC là **gap** (lỗ hổng): yêu cầu chưa được test. Phải bổ sung trước khi release.
- AC **chưa đạt** thì nhìn cột Bug để biết vì sao, bấm vào xem bug report.
- Phần **viewpoint ngoài phạm vi** cho thấy những gì đã cân nhắc nhưng không test lần này, kèm lý do.

## 👉 Bạn tự làm
1. Mở `defects.md`, làm lại BUG-02 bằng tay theo đúng các bước. Có chỗ nào bạn phải đoán không? Nếu có, đó là chỗ cần viết rõ hơn.
2. Trong `test-cases.csv`, tạm đổi `linked_ac` của TC-001 và TC-002 sang `AC-9`, chạy `npm run rtm`, xem AC-1 hiện **⛔ Chưa có test case**. Rồi sửa lại như cũ và chạy lại.
3. Tự đặt Severity / Priority cho tình huống: "nút Login lệch 2px trên trang chủ trước buổi demo khách hàng ngày mai". Giải thích vì sao.

## ⚠️ Lỗi hay gặp
| Lỗi | Cách tránh |
|---|---|
| Tiêu đề chung chung: "Lỗi đăng nhập" | `[Chức năng] hành vi sai cụ thể` |
| Bước mơ hồ: "nhập user bất kỳ" | Ghi dữ liệu cụ thể, kèm điều kiện trước |
| Expected là ý kiến cá nhân | Trích AC, câu trả lời Q&A, tài liệu thiết kế |
| Gộp nhiều lỗi vào một bug | Mỗi bug một report, để sửa và test lại riêng được |
| QC tự đặt Priority | QC đề xuất, PO/PM chốt |
| RTM làm tay rồi quên cập nhật | Tạo tự động từ file nguồn |
| Chỉ thử đúng một cách là viết report (BUG-01 lần đầu chỉ ghi một chiều, ai-log #8) | Thử biến thể: chiều ngược lại, dữ liệu khác, trang khác |
| Tin báo cáo tổng hợp mà không kiểm tra nó | Cố tình làm sai đầu vào (skip 1 TC) xem RTM có báo không |

## ✅ Checklist
- [ ] Viết được bug report đủ các phần, người khác tái hiện được trong 2 phút
- [ ] Phân biệt được Severity và Priority, mỗi loại một ví dụ
- [ ] Đọc RTM, chỉ ra được AC nào chưa đạt và vì sao
- [ ] Chạy được `npm run rtm` và biết nó lấy dữ liệu từ đâu

## ❓ Câu hỏi liên quan

### Q1. Một bug report tốt cần những gì?
**Trả lời:**
- Tiêu đề rõ, môi trường, điều kiện trước, các bước đánh số với dữ liệu cụ thể, expected (có nguồn), actual, evidence, severity, tần suất.
- Tiêu chí: **người chưa biết gì cũng tái hiện được trong 2 phút**.
- Một bug một report. Tự làm lại theo các bước mình viết trước khi gửi.

### Q2. Severity và Priority khác nhau thế nào? Cho ví dụ.
**Trả lời:**
- **Severity**: mức ảnh hưởng tới hệ thống, QC đánh giá. **Priority**: cần sửa gấp tới đâu, PO/PM quyết định theo kế hoạch kinh doanh.
- Severity cao, priority thấp: app crash ở tính năng ít người dùng, sắp bị bỏ.
- Severity thấp, priority cao: sai tên công ty trên trang chủ.

### Q3. RTM là gì, dùng để làm gì?
**Trả lời:**
- Requirement Traceability Matrix: bảng nối **yêu cầu → test case → kết quả → bug**.
- Dùng để: biết yêu cầu nào chưa có test (gap), quyết định release, đánh giá ảnh hưởng khi yêu cầu thay đổi (đổi AC nào thì phải sửa TC nào).
- Nên tạo tự động từ file nguồn để không bị lệch.

### Q4. Dev trả bug về "cannot reproduce" thì làm gì?
**Trả lời:**
- Làm lại trên **môi trường của dev** hoặc môi trường chung, trình duyệt sạch.
- So sánh khác biệt: dữ liệu, tài khoản, phiên bản, cookie, cache.
- Bổ sung bước còn thiếu, video, log (console, network). Nếu vẫn không tái hiện được thì ghi lại và theo dõi, không đóng vội.
