# Bài 2: Phân tích yêu cầu (test-design) và HITL #1

> Chức năng thực hành: **Đăng nhập SauceDemo** (ticket mô phỏng SD-101)
> Kết quả: [`qa-runs/saucedemo-login-screen/`](../../qa-runs/saucedemo-login-screen/)

## 🧭 Chúng ta đang test cái gì?
Cần phân biệt 2 thứ:

| | Là gì | Ở đâu |
|---|---|---|
| **Hệ thống được test** (SUT: System Under Test, hay AUT: Application Under Test) | Web bán hàng **Swag Labs** | https://www.saucedemo.com |
| **Dự án test** (repo này) | Tài liệu test và code test **cho** web đó | `playwright-ai-qa-portfolio` |

> Ngoài thực tế cũng vậy: sản phẩm của công ty (vd: web ngân hàng) là một repo do dev làm. Bộ test automation thường là **repo riêng** do QC làm, hoặc một thư mục riêng trong repo đó.

### SauceDemo (Swag Labs) là gì?
- Web **cửa hàng online demo** do công ty Sauce Labs làm ra **để mọi người luyện test automation**. Miễn phí, hợp pháp, không cần đăng ký.
- Bán đồ lưu niệm: balo, đèn xe đạp, áo thun…
- Luồng chính:
```
Đăng nhập → Danh sách sản phẩm → Chi tiết sản phẩm → Giỏ hàng
          → Thanh toán: nhập thông tin → Xem lại đơn → Hoàn tất → Đăng xuất
```
- Có 6 tài khoản test, mỗi tài khoản **cố ý có hành vi khác nhau** để luyện tìm bug:

| Tài khoản | Đặc điểm |
|---|---|
| `standard_user` | Bình thường, dùng cho happy path |
| `locked_out_user` | Bị khóa, không đăng nhập được |
| `problem_user` | Có bug cố ý (ảnh sản phẩm sai, một số nút không chạy…) |
| `performance_glitch_user` | Chậm bất thường |
| `error_user` | Một số thao tác gây lỗi |
| `visual_user` | Lỗi giao diện (vị trí, màu sắc lệch) |

### Vì sao chọn SauceDemo?
- Có **bug cố ý** để luyện viết bug report thật.
- Có sẵn thuộc tính `data-test` nên locator ổn định.
- Ổn định, ít khi sập. Nhiều người làm QC biết tới web này.

### Lộ trình test
Chi tiết mục đích, công cụ, phạm vi và tiến độ: xem [Tổng quan dự án](../tong-quan-du-an.md).
```
Đăng nhập (Bài 2–7) → Giỏ hàng → Thanh toán (Bài 8) → API Restful Booker (Bài 9)
```

## 🎯 Tại sao học
- Bước này là **nền móng của cả pipeline**. Test case (Bài 3), code (Bài 4) và RTM (Bài 7) đều truy vết về AC và viewpoint làm ở bước này. Sai từ đây thì sai đến cuối.
- Bỏ qua bước này, AI sẽ test **theo những gì web đang làm**. Web có bug thì AI coi bug là đúng, test vẫn xanh.
- Đây là phần **AI không thay được người QC**: phán đoán yêu cầu đã rõ chưa, cái gì là bug, cái gì là tính năng.

## 🏭 Ngoài thực tế
- Ngày đầu nhận ticket, QC giỏi **chưa mở tool viết code**. Việc đầu tiên là đọc requirement, gạch chân chỗ mơ hồ và hỏi lại BA/PO.
- Ticket ngoài đời **hiếm khi hoàn hảo**. AC hay viết kiểu "hiển thị lỗi phù hợp", mà "phù hợp" là bao nhiêu thì không ai biết. QC phải biến nó thành thứ **đo được**.
- Câu hỏi gửi PO nên **kèm đề xuất mặc định**. PO bận, trả lời "OK theo đề xuất" nhanh hơn nhiều so với phải tự nghĩ câu trả lời.

## 👨‍🏫 Làm mẫu: các bước đã làm

### Bước 1: Chuẩn bị requirement
Tạo [`requirement/requirement.md`](../../qa-runs/saucedemo-login-screen/requirement/requirement.md) theo dạng ticket thật: user story + 7 AC. Ticket được **cố ý để lại chỗ mơ hồ** để tập phát hiện.

### Bước 2: Review requirement theo checklist 7 mục
| Mục | Hỏi gì |
|---|---|
| Đầy đủ | Có thiếu luồng nào không? |
| **Testable** | AC có đo được không? ("báo lỗi tương ứng" thì **không** đo được) |
| Validation | Hoa thường? Khoảng trắng? Độ dài tối đa? |
| Business rule | Lỗi nào ưu tiên khi có nhiều lỗi cùng lúc? |
| Dependency | Phụ thuộc cookie, dịch vụ bên ngoài? |
| Edge case | Trường hợp biên, trường hợp sai? |
| Câu hỏi blocking | Điều gì chưa rõ thì chưa viết test được? |

### Bước 3: Khám phá web (exploratory testing) bằng AI + trình duyệt
AI mở SauceDemo bằng Playwright MCP, thử khoảng 20 tình huống và ghi lại **hành vi quan sát được** (O-01 → O-19 trong `spec-review.md`).

**⚠️ Chuyện thật xảy ra trong bài này:** lần khám phá đầu cho thấy 3 user "không đăng nhập được" và thông báo lỗi bị "dính" sang bước sau. Nếu vội kết luận thì đã báo 3 bug **sai**.
Nguyên nhân thật: **script khám phá** dùng chung một trình duyệt cho mọi tình huống (không độc lập, vi phạm lời dặn số 7) và chờ chưa đủ lâu. Chạy lại mỗi tình huống bằng một phiên sạch thì cả 5 user đều đăng nhập được.
> 👉 **Trước khi báo bug, hãy nghi script của mình trước.**

### Bước 4: Tách "quan sát" và "yêu cầu"
Ví dụ: web từ chối `STANDARD_USER` (viết hoa). Đó là **quan sát**. Đúng hay sai thì phải **hỏi** (Q2). Không được tự coi là đúng chỉ vì "web đang chạy như vậy".

### Bước 5: Chia Test Viewpoint theo 4 trục
| Trục | Ý nghĩa | Ví dụ trong bài |
|---|---|---|
| functional | Chức năng chạy đúng không | TVP-003: đăng nhập thành công |
| data | Dữ liệu đúng, sai, biên | TVP-006: bảng quyết định ô trống |
| flow | Luồng nhiều bước, chuyển trạng thái | TVP-015: đăng xuất rồi bấm Back |
| non-functional | Hiệu năng, bảo mật, accessibility | Chưa có AC nên đưa thành câu hỏi (Q5, Q10) |

Kết quả: 15 viewpoint ban đầu. Sau HITL #1 và review thì có **25 viewpoint** (20 trong phạm vi, 5 ngoài phạm vi). **Mỗi AC có ít nhất 1 viewpoint.**

### Bước 6: Viết câu hỏi vào phiếu Q&A (q-and-a.md)
- **Blocking**: không có câu trả lời thì **không viết được expected** (Q1 → Q5).
- **Non-blocking**: vẫn làm tiếp được, nhưng cần làm rõ (Q6 → Q10).
- Mỗi câu gồm: **Context**, **Impact nếu không có**, **Đề xuất mặc định**.

### Bước 7: HITL #1, chốt câu trả lời
- Người duyệt xem gợi ý, **góp ý sửa 4 gợi ý chưa chuẩn** (Q2, Q3, Q5, Q10) và **tự phát hiện thêm 1 vấn đề**: icon ✕ trong ô nhập dễ bị hiểu nhầm là nút xóa (O-20, Q11).
- Kết quả: [`q-and-a.md`](../../qa-runs/saucedemo-login-screen/q-and-a.md). Câu hỏi và câu trả lời nằm **chung một file** (Q&A sheet), mỗi câu có trạng thái Open/Answered và **ảnh hưởng tới test**.
- Câu trả lời làm **thay đổi viewpoint**: Q6 = bug thì thêm **TVP-016**. Q4 làm rõ expected của TVP-011.
- Những điểm không phải bug nhưng nên sửa được gom vào [`improvements.md`](../../qa-runs/saucedemo-login-screen/improvements.md) (5 đề xuất).
- Quy tắc dùng lại được lưu vào [`knowledge-base/q-and-a-archive.md`](../../knowledge-base/q-and-a-archive.md).

> ⚠️ Ngoài thực tế, đừng **"OK hết"** theo thói quen. Đề xuất mặc định chỉ để tiết kiệm thời gian. Người duyệt vẫn phải đọc và hiểu từng câu, vì sau này bug lọt thì người ký duyệt là người chịu trách nhiệm.

### Bước 8: Review lại toàn bộ (qa-reviewer)
Sau khi chốt Q&A, review lại toàn bộ theo góc nhìn QC Lead và ISTQB ([`review-test-design.md`](../../qa-runs/saucedemo-login-screen/reviews/review-test-design.md)). Phát hiện thêm:
- 🔴 **Lỗ hổng bảo mật**: tự tạo cookie `session-username` là vào được trang bên trong mà không cần đăng nhập (O-21, BUG-02).
- Thiếu 4 viewpoint: đăng nhập lại sau khi đăng xuất, thử lại sau lỗi, giữ phiên khi tải lại trang, trang chi tiết sản phẩm.
- Hai file câu hỏi bị trùng và lệch nhau, nên **gộp thành một phiếu Q&A**.
- Bug thấy sớm được ghi vào [`known-issues.md`](../../qa-runs/saucedemo-login-screen/known-issues.md), để lúc chạy test không bỏ sót.

> 🏭 Ngoài thực tế: **review chéo (peer review)** sau mỗi bước là cách rẻ nhất để chặn lỗi lan sang bước sau. Theo ISTQB, phát hiện lỗi càng sớm thì chi phí sửa càng thấp.

## 📖 Thuật ngữ: HITL là gì?
**HITL = Human-in-the-loop**, nghĩa là "có con người trong vòng lặp": quy trình tự động **dừng lại ở những điểm quan trọng** để người kiểm tra và duyệt rồi mới đi tiếp.
- Đây là **thuật ngữ chuẩn và phổ biến** trong ngành AI/ML và AI agent. Các framework agent đều có cơ chế này. Claude Code hỏi xin phép trước khi chạy lệnh cũng là một dạng HITL.
- Cách đánh số **HITL #1/#2/#3** là quy ước riêng của dự án, để gọi tên từng điểm dừng cho gọn.

Mỗi điểm HITL trong pipeline ứng với **một hoạt động QC truyền thống** đã có từ lâu:

| Trong dự án | Tên gọi quen thuộc trong nghề QC | Ai thường tham gia |
|---|---|---|
| HITL #1 | **Requirement clarification / Q&A**: làm rõ yêu cầu | QC, BA/PO |
| HITL #2 | **Test case review / Test design sign-off**: duyệt thiết kế test | QC Lead, QC, đôi khi có BA |
| HITL #3 | **Defect triage**: họp phân loại, duyệt bug | QC Lead, Dev Lead, PO |

> Khi trình bày, nên nói cả hai cách: *"Pipeline có 3 human-in-the-loop checkpoint, tương ứng requirement clarification, test design sign-off và defect triage."* Người làm AI hiểu vế đầu, người làm QC hiểu vế sau.

## 👉 Bạn tự làm
1. Đọc `spec-review.md`. Mở https://www.saucedemo.com và **tự thử lại** 3 quan sát bất kỳ (O-03, O-09, O-17), xem có đúng như AI ghi không.
2. Trả lời các câu hỏi Open ở HITL #1. Bạn đóng vai PO, đồng ý hay sửa đề xuất mặc định đều được, nhưng **phải hiểu vì sao**.
3. Tìm thêm **1 viewpoint** mà AI bỏ sót. Gợi ý: copy-paste mật khẩu? Bấm Login 2 lần liên tục? Nhập ký tự đặc biệt?

### Tự chạy agent test-design
Mở terminal **trong thư mục dự án** rồi chạy Claude Code. Agent và lệnh trong `.claude/` chỉ được nạp khi Claude Code mở đúng thư mục dự án:
```bash
cd playwright-ai-qa-portfolio
claude
# trong Claude Code:
/qa-orchestrator saucedemo-login-screen
```

## ⚠️ Lỗi hay gặp
| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| Coi hành vi hiện tại của web là "đúng" | Test xác nhận cả bug | Tách quan sát và yêu cầu, hỏi khi chưa rõ |
| Expected kiểu "hiển thị lỗi phù hợp" | Test không bắt được lỗi sai chữ hoặc sai loại lỗi | Ghi **đúng câu chữ**, URL, trạng thái |
| Hỏi mà không đề xuất | PO trả lời chậm, dự án bị chặn | Luôn kèm đề xuất mặc định |
| Vội báo bug khi script khám phá ra kết quả lạ | Báo nhầm, mất uy tín với dev | Chạy lại trong môi trường sạch, nghi script trước |
| Tự thêm test hiệu năng khi không có AC | Tranh cãi "pass hay fail theo tiêu chí nào?" | Đưa thành câu hỏi, đề xuất bổ sung AC |

## ✅ Checklist trước khi qua Bài 3
- [ ] Giải thích được AC là gì, vì sao AC-3/4/5 bị đánh "⚠️ chưa testable"
- [ ] Phân biệt được **quan sát** và **yêu cầu**, cho được 1 ví dụ
- [ ] Kể được 4 trục viewpoint, mỗi trục 1 ví dụ
- [ ] Phân biệt được câu hỏi blocking và non-blocking
- [ ] Đã trả lời HITL #1

## ❓ Câu hỏi liên quan

### Q1. Requirement mơ hồ thì bạn làm gì?
**Trả lời:**
1. Liệt kê các điểm chưa rõ. Với mỗi điểm, nói rõ **ảnh hưởng tới phần test nào** nếu không làm rõ.
2. Gửi câu hỏi cho PO/BA, **kèm đề xuất mặc định** để họ trả lời nhanh ("OK theo đề xuất").
3. Phân loại **blocking** (chưa trả lời thì không viết được expected) và **non-blocking**.
4. Trong lúc chờ, làm tiếp phần đã rõ. **Không tự đoán** rồi coi đó là yêu cầu.

### Q2. Exploratory testing là gì? Khác test theo kịch bản thế nào?
**Trả lời:**
- **Exploratory testing**: vừa tìm hiểu, vừa thiết kế, vừa chạy test **cùng lúc**, dựa trên quan sát và kinh nghiệm. Hay tìm ra những thứ tài liệu không nói tới.
- **Test theo kịch bản (scripted)**: chạy theo test case đã viết sẵn (bước, dữ liệu, expected). Lặp lại được và đo được độ phủ.
- Hai cách **bổ sung cho nhau**: khám phá để hiểu hệ thống và tìm điểm lạ, rồi chuyển thành test case có kịch bản để chạy lặp lại hoặc tự động hóa.

### Q3. Vì sao báo chung "Username and password do not match" cho mọi trường hợp sai là tốt?
**Trả lời:**
- Nếu báo riêng "username không tồn tại" và "sai mật khẩu", kẻ xấu sẽ **dò được username nào có thật** (user enumeration), rồi tập trung đoán mật khẩu.
- Thông báo chung không tiết lộ thông tin gì. Cùng lý do đó, tài khoản bị khóa mà nhập sai mật khẩu cũng chỉ nên báo "không khớp".

### Q4. Test viewpoint khác test case thế nào?
**Trả lời:**
- **Viewpoint** là **góc nhìn**: "cần kiểm tra điều gì" (vd: *các tổ hợp ô trống*).
- **Test case** là **cách kiểm tra cụ thể**: điều kiện trước, các bước, dữ liệu, kết quả mong đợi (vd: *Username trống, Password có → báo "Username is required"*).
- Một viewpoint thường sinh ra **nhiều** test case. Làm viewpoint trước giúp không bỏ sót góc kiểm thử, trước khi đi vào chi tiết.

### Q5. "Quan sát" khác "yêu cầu" thế nào? Vì sao phải tách?
**Trả lời:**
- **Quan sát**: web **đang** làm gì (vd: từ chối `STANDARD_USER`).
- **Yêu cầu**: web **phải** làm gì (do PO/BA quyết định).
- Không tách thì dễ lấy hành vi hiện tại làm expected. Nếu hành vi đó là bug, test sẽ **xác nhận luôn bug** và vẫn xanh. Quan sát nào chưa chắc đúng thì phải đưa thành câu hỏi.
