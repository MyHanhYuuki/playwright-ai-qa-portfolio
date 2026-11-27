# Review: test-impl, restful-booker-auth-api (RB-101)

- **Ngày**: 2026-11-26 · **Reviewer**: qa-reviewer (vai QC Lead, theo ISTQB) · **Kết luận**: ⚠️ **Cần sửa trước HITL #2** (1 🔴 sửa trong ghi chú của 13 TC, còn lại là chỉnh nhỏ)
- **Phạm vi**: `test-cases.csv` (30 TC, 16 cột, cả 30 `draft`, cả 30 `automatable`), `test-data.md` (TD-01 → TD-27, MSG-01 → MSG-04). Phần đồng bộ HITL #1 trong `q-and-a.md`, `known-issues.md`, `viewpoint.csv`, `spec-review.md`, `improvements.md` (chưa ai soát).
- **Nguồn đối chiếu**: `requirement/requirement.md` (5 AC), câu trả lời HITL #1 (Q1 → Q12), `reviews/review-test-design.md` (kể cả "Kiểm lại lượt 2"), `CLAUDE.md` (điểm 4, 5; "không che bug"), `knowledge-base/q-and-a-archive.md`, RB-102 `known-issues.md` (BUG-41 → BUG-59), `q-and-a.md` Q1 / Q4, `viewpoint.csv` TVP-035, mẫu SD-103 `reviews/review-test-impl.md`.
- **Cách kiểm**:
  - **Tự đếm lại** bằng script đọc CSV:
    - 30 TC, 16 cột; `viewpoint.csv` 38 dòng, 31 `in` / 7 `out`; 31/31 viewpoint `in` có ≥ 1 TC, không TC nào trỏ vào viewpoint `out` hay viewpoint không tồn tại.
    - AC: AC-1 7 TC · AC-2 10 · AC-3 8 · AC-4 6 · AC-5 5.
    - Endpoint: `POST /auth` 24 · `GET /ping` 4 · `Cả 2` 2. Priority 11 high / 10 medium / 9 low.
    - 13 TC có câu đầu `Bug đã biết …`: TC-004 → 014, 016, 030. Khớp cột "Viewpoint phải bắt" của `known-issues.md`: BUG-37 → TC-004 → 011, 016; BUG-38 → TC-012, 013; BUG-39 → TC-014; BUG-40 → TC-030.
  - **Ngân sách đăng nhập thất bại**: cộng lại từ cột `steps` của từng TC (không chép bảng TD-27) = **30**. Đối chứng bước 0 (đăng nhập đúng) và dấu hiệu (b) của TD-26 **không** tính: đúng.
  - **Đối chiếu bug RB-102** mà TD-18 → TD-20 tránh: BUG-42, 43, 44, 45, 49, 52, 53, 56, 59 đúng số và đúng nội dung trong `restful-booker-booking-api/known-issues.md`.
  - **Không chạy API thật**: không có điểm nào cần kiểm thêm trên sản phẩm (các phát hiện dưới đây là lỗi thiết kế test, kiểm bằng cách đọc).
  - `test-cases.csv` của RB-102 **chưa có** lúc review: chỉ đối chiếu được với `viewpoint.csv` / `spec-review.md` của RB-102.
- **Tóm tắt**: 1 🔴 · 2 🟠 · 6 🟡.
  - Điểm tốt: bộ TC truy vết đủ hai chiều, expected lấy từ quyết định HITL #1, có đối chứng L15 ở mọi TC sai tài khoản, chiến lược reset và dọn dẹp áp dụng đủ.
  - **Vấn đề chính**: cách đặt `test.fail()` cùng `expect.soft` như ghi chú mô tả **không** giữ được bước (a)–(d) màu đỏ. Lỗi thật như "cấp token khi đăng nhập sai" sẽ bị tính là "fail như mong đợi" (D1, bài học L4).
  - TC-009 coi `username ""` là "sai tài khoản" (`401`), lệch quy tắc "rỗng = thiếu" của knowledge-base và RB-102 (C1).

## Checklist (mục 5: Test case)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Mọi viewpoint trong phạm vi có ≥ 1 TC; mọi bug đã biết có TC bắt **mọi biến thể** | ✅ Đạt | 31/31. BUG-37: 9 TC phủ đủ các biến thể của `known-issues.md` (kể cả query string, SQL, 4 vị trí khoảng trắng). BUG-39: 3 đại diện theo Q12; `application/xml`, `text/plain` bỏ có lý do |
| Kỹ thuật ghi đúng, áp dụng đúng | ✅ Đạt | EP cho lớp input, BVA cho rỗng / rất dài / quá lớn, State Transition cho token cũ (TC-023) và luồng smoke (TC-029), Decision Table cho 2 token giả × 3 method (TC-022) |
| Expected cụ thể, đo được, theo quyết định (không theo hiện trạng, L12) | ⚠️ Gần đạt | Mã, `Content-Type`, body nguyên văn, đủ 7 giá trị booking. Hiện trạng chỉ ghi ở `notes`. Lệch: TC-009 biến thể 1, 2 (C1); TC-026 "body rỗng" không thể sai (D2) |
| Mỗi TC một mục đích; điều kiện trước đủ để chạy độc lập | ✅ Đạt | Mỗi TC tự tạo booking (TD-17, TD-18) và tự lấy token mới; không `beforeAll` |
| Dữ liệu đủ, không mật khẩu thật; priority theo rủi ro | ⚠️ Gần đạt | Mật khẩu từ `RB_ADMIN_PASSWORD`, không ghi trong tài liệu. Riêng TC-016 có thể làm mật khẩu lọt vào báo cáo (B1) |
| Bug đã biết: `test.fail()` không che bước đang đạt (L4) | ❌ Chưa đạt | D1 |
| Phần đồng bộ HITL #1 ở 5 file | ✅ Đạt | Mục "Kiểm phần đồng bộ HITL #1" bên dưới |

## Kiểm phần đồng bộ HITL #1 (5 file)
| File | Kết quả | Bằng chứng |
|---|---|---|
| `q-and-a.md` | ✅ | Tổng hợp "12 câu (7 blocking, 4 non-blocking, 1 tham chiếu Q1) · Answered 11", tự đếm khớp. Mọi câu có cột Trả lời ghi "Theo đề xuất (HITL #1, 2026-11-26)". Q5 theo đính chính: không phải bug, IMP-05 Medium. Q1 là dòng tham chiếu (201 là hợp đồng) |
| `known-issues.md` | ✅ | Có bảng "Số tạm → số chính thức": A1 → 37, A2 → 38, A5 → 39, A6 → 40, A3 bỏ, A4 là IMP-05. Mức khớp q-and-a (37, 40 Medium; 38, 39 Low). Trạng thái "Đã xác nhận (HITL #1, Qn)". Có bảng 12 quyết định. Số tạm chỉ còn ở bảng quy đổi và câu ghi lịch sử |
| `viewpoint.csv` | ✅ | Không còn "chờ Q" hay "đề xuất 4xx". TVP-004 → 011, 016 ghi mã đã chốt + BUG-37. TVP-028 ghi `403` (RB-102 Q4). TVP-036 đã có `AC-1;AC-4` (R1 lượt 2) |
| `spec-review.md` | ✅ | AC-2, AC-4, AC-5 và BR-2, BR-5, BR-6, BR-7 ghi quyết định và số chính thức; O-01 ghi khớp tài liệu |
| `improvements.md` | ✅ | IMP-05 là giới hạn thử sai; IMP-06 nhận phần mã `/ping` từ BUG-A3 cũ; IMP-09 dự phòng BUG-40 |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
Không có. Không chạy API thật ở bước này (mục "Cách kiểm").

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Mật khẩu thật của TC-016 có thể lọt vào báo cáo, dù không tự ghi log.** `TD-14` / TC-016 chỉ cấm "ghi URL vào log / annotation / attachment". ❓ Nhưng mỗi lần gọi `request.post(url)` của Playwright tự sinh một **bước** trong báo cáo, và trace thường chứa URL. Báo cáo HTML, trace, và `run-results/*.json` (JSON reporter có `steps`, **được commit**) đều có thể chứa `…/auth?username=…&password=…`. Mật khẩu là giá trị công khai, nhưng quy ước repo là không commit mật khẩu | `test-data.md` TD-14; TC-016 notes; `CLAUDE.md` mục Git ("không commit … token") | 🟠 | (1) Gửi riêng request này bằng `fetch` / `node:https` **ngoài** `APIRequestContext`, nên không sinh bước, không vào trace. (2) Thêm bước quét `run-results/` và `evidence/` tìm giá trị của `RB_ADMIN_PASSWORD` trước khi commit (executor). Cách kiểm ❓: chạy thử TC-016 một lần, grep chuỗi `password=` trong JSON kết quả và báo cáo HTML |
| B2 | **Ngân sách 30 là "mỗi lần chạy", nhưng một vòng pipeline chạy nhiều lần**: `test:run` + `test:evidence` + `repro` + reviewer chạy lại bằng `-g`. Nhóm `@bad-login` có thể bị gọi 60–120 lần thất bại trong một buổi. Ngân sách không còn chỗ trống, nên executor dễ vượt mà không biết | `test-data.md` TD-27 ("chạy lại nhóm này là một lần chạy mới, tính lại từ 0") | 🟡 | Ghi thêm cho executor: mỗi buổi chạy nhóm `@bad-login` **một lần** cho kết quả và evidence (dùng chung lần chạy). Lần chạy lại chỉ bằng `-g` đúng TC nghi ngờ. `repro` của BUG-37 chỉ 1 request sai |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | **`username ""` / `password ""` được coi là "chuỗi sai" (`401`)**, trong khi các nguồn khác coi giá trị rỗng là thiếu: knowledge-base (SD-103: "chỉ có khoảng trắng = ô trống, báo lỗi như ô trống") và RB-102 Q1 (c) đã chốt (tên rỗng / chỉ khoảng trắng coi như thiếu → `400`). Q2 chốt "thiếu trường → `400`". Hai feature của cùng API sẽ có hai cách hiểu "rỗng" khác nhau. Lỗi này đã có từ TVP-009 ở bước test-design và reviewer chưa bắt được | TC-009 expected (e) biến thể 1, 2: `401`; TVP-009; `test-data.md` TD-07; RB-102 `q-and-a.md` Q1 (c) | 🟠 | Đổi TC-009 biến thể 1, 2 (và TVP-009, TD-07) thành **`400`** (rỗng = thiếu, theo knowledge-base và RB-102 Q1 (c)); giữ `null` → `400`. Nếu muốn giữ `401`, đưa thành câu hỏi HITL #2 thay vì tự chọn |
| C2 | TC-015 gắn `AC-1;AC-3`, nhưng TVP-015 chỉ `AC-1`. TC có kiểm token dùng được (`PATCH`) nên AC-3 là đúng; viewpoint chưa cập nhật | `test-cases.csv` TC-015; `viewpoint.csv` TVP-015 | 🟡 | Sửa TVP-015 `linked_ac` thành `AC-1;AC-3` |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | **`test.fail()` + `expect.soft` che bước (a)–(d), trái mục đích ghi trong chính ghi chú (L4).** 12 TC (TC-004 → 014, 016) ghi: "(a)–(d) kiểm TRƯỚC, không nằm dưới `test.fail()` … Kiểm các biến thể bằng `expect.soft`". Với Playwright, `test.fail()` đánh dấu **cả test** là "phải fail", bất kể gọi lúc nào. Lỗi `expect.soft` ghi **trước** đó vẫn làm test fail, và kết quả được tính là "fail như mong đợi" (xanh). Vậy nếu API **cấp token khi đăng nhập sai** (bước (a), kiểm bảo mật chính của TC-010) thì test vẫn xanh: đúng kiểu lỗi L4. Thêm nữa, với nhiều biến thể, nếu `test.fail()` gọi trong vòng lặp "ngay trước (e)" của **biến thể 1** thì (a)–(d) của biến thể 2 trở đi nằm **sau** `test.fail()`. Chỉ khi (a)–(d) là `expect` **cứng** của **mọi** biến thể, chạy xong trước `test.fail()`, thì lỗi mới đỏ thật | `test-cases.csv` notes TC-004 → 014, 016; TC-010 notes "tuyệt đối không đặt dưới test.fail()" | 🔴 | Ghi thứ tự bắt buộc vào notes (và lưu ý cho script-gen trong `test-data.md` / `known-issues.md`): (1) gửi mọi biến thể; (2) kiểm (a)–(d) của **mọi** biến thể bằng `expect.soft` để thấy đủ lỗi; (3) **chặn cứng** `expect(test.info().errors, '(a)–(d) phải đạt trước test.fail').toHaveLength(0)`; (4) gọi `test.fail()`; (5) kiểm (e) của mọi biến thể bằng `expect.soft`. Cách khác: tách mỗi TC thành 2 test (dương tính AC-2 không `test.fail()`; mã HTTP có `test.fail()`), nhưng tốn gấp đôi lần đăng nhập sai (TD-27) nên không đề xuất. Reviewer bước script-gen sẽ kiểm bằng cách cố ý gây lỗi (a) |
| D2 | **TC-026 "HEAD: body rỗng (0 byte)" không thể sai**: client HTTP không đọc body của phản hồi `HEAD`, nên bước này luôn đúng (L15). Ý nghĩa thật của HEAD là cùng mã và cùng header với GET | TC-026 expected bước 2 | 🟡 | Đổi thành: cùng mã với GET (`201`), header `Content-Length` bằng của GET (hiện `7`), `Content-Type` giống GET. Bỏ assert body hoặc chỉ ghi annotation |
| D3 | **TC-021, TC-029: `404` sau `DELETE` là kết quả mong đợi, nhưng quy tắc reset chung kích hoạt khi "`GET` booking của chính test trả `404`".** Script-gen áp máy móc sẽ chạy kiểm reset (gọi thêm `POST /auth`) ngay ở bước đạt | TC-021 bước 4, TC-029 bước 7; TD-26 mục 2 | 🟡 | Ghi rõ trong TD-26: kiểm reset chỉ khi gặp `403` / `404` **không mong đợi**; sau `DELETE` thành công thì `404` là oracle, không phải dấu hiệu reset |
| D4 | **TC-030 đặt `test.fail()` cho cả TC, kiểm 3 bước bằng `expect.soft`**: nếu `POST http://…/auth` (tài khoản sai) lại trả `token` thì vẫn tính là "fail như mong đợi". Gộp 3 bước dưới một `test.fail()` cũng làm việc sửa **một phần** (vd đã có HSTS nhưng HTTP vẫn phục vụ) không ai thấy | TC-030 notes | 🟡 | Trước `test.fail()`: kiểm **cứng** "bước 2 không có `token`, mã < 500". Ghi annotation kết quả từng bước (mã, `Location`, HSTS) để thấy tiến độ sửa |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | `test-cases.csv` của RB-102 chưa có nên chưa soát được trùng / hở ở mức TC. Ở mức viewpoint đã khớp: RB-102 TVP-035 có thêm `abc123` và "token thừa 1 ký tự" (từ RB-101 O-19); RB-101 TC-022 chỉ giữ 2 kiểu đó làm **đối chứng** cho AC-3 (trùng có chủ đích, Q7). Token cũ: RB-101 TC-023 sở hữu, RB-102 TVP-037 `out` tham chiếu | RB-102 `viewpoint.csv` dòng 36, 38; `spec-review.md:103` | 🟡 | Khi RB-102 có `test-cases.csv`: soát lại 3 điểm (1) RB-102 không viết TC token cũ; (2) mã `403` và `Forbidden` đọc từ cùng dữ liệu dùng chung (TD-25); (3) tên lần chạy `QA-RB101-…` / `QA-RB102-…` không trùng tiền tố (bước dọn của feature này không xóa booking của feature kia) |

## Đề xuất cho HITL #2 (ý kiến chuyên môn, người dùng quyết)
| # | Điểm test-impl nêu | Ý kiến reviewer |
|---|---|---|
| 1 | Tên biến môi trường `RB_ADMIN_USERNAME` / `RB_ADMIN_PASSWORD` | **Đồng ý.** Rõ nghĩa, cùng kiểu `SAUCE_PASSWORD`. Điều kiện: RB-102 (Basic auth) dùng **đúng 2 tên này** từ `tests/data/users.ts`, không đặt tên thứ hai; thêm vào `.env.example` không kèm giá trị |
| 2 | TC-016: mật khẩu thật trên URL; không log, không attachment, không commit trace | **Đồng ý nhưng chưa đủ** (B1): báo cáo, trace và `run-results/*.json` tự ghi URL của request. Đề xuất gửi request này ngoài `APIRequestContext` (`fetch`) và quét `run-results/`, `evidence/` tìm mật khẩu trước khi commit. Không nên đổi sang tài khoản sai: khi đó `Bad credentials` không chứng minh được API **bỏ qua** query string |
| 3 | TC-030: GET `301` / `308`, POST `307` / `308`, hoặc bị từ chối (lỗi kết nối hoặc 4xx không đến từ bước kiểm tài khoản) | **Đồng ý.** Khớp Q11 và ngữ nghĩa HTTP (`301` / `302` có thể đổi POST thành GET, loại đúng). Thêm 2 điều: `Location` phải đúng `https://` cùng host và cùng đường dẫn; `426 Upgrade Required` tính là "từ chối". Kèm D4 (chặn cứng "không token" trước `test.fail()`) |
| 4 | Body lỗi `400` / `413` / `415`: chỉ kiểm là object JSON, nội dung ghi annotation | **Đồng ý.** Q3 / Q4 chỉ chốt "là JSON", nguyên văn chỉ là ví dụ. Assert nội dung cụ thể là tự đặt oracle. Thêm tối thiểu: body không có `token` (đã có) và không lộ stack trace (không chứa `at ` / đường dẫn file). Ghi IMP đề nghị tài liệu hóa body lỗi |
| 5 | Lưu ý script-gen: Playwright tự thêm `application/octet-stream` (TD-12) | Đồng ý, đúng cách xử lý: kiểm header thật sự gửi đi, không được thì ghi annotation |

## Việc cần làm trước khi sang bước sau (xếp theo mức độ)
1. 🔴 D1: ghi thứ tự 5 bước (soft (a)–(d) mọi biến thể → chặn cứng `test.info().errors` → `test.fail()` → soft (e)) vào notes TC-004 → 014, 016 và lưu ý cho script-gen.
2. 🟠 C1: TC-009 / TVP-009 / TD-07: `""` → `400` (hoặc đưa vào HITL #2).
3. 🟠 B1: TC-016 gửi ngoài `APIRequestContext` + quét mật khẩu trong `run-results/`, `evidence/` trước commit.
4. 🟡 B2, C2, D2, D3, D4, E1: sửa theo cột Đề xuất.

## Xử lý sau review
| # | Xử lý |
|---|---|
| D1 | ✅ Theo thứ tự của reviewer (orchestrator chốt). Notes + steps của TC-004 → TC-011, TC-016 (BUG-37) ghi 5 bước: gửi mọi biến thể → `expect.soft` (a)–(d) mọi biến thể → chặn cứng `expect(test.info().errors, …).toHaveLength(0)` → `test.fail()` → `expect.soft` (e); expected thêm "(a)–(d) phải đạt ở bước chặn cứng ③". TC-012, TC-013 (soft (a)–(c) → chặn → `test.fail()` → (d)), TC-014 (soft (a), (b) → chặn → `test.fail()` → (c)–(e)) cùng mẫu. TC-010 bỏ câu "tuyệt đối không đặt dưới test.fail()" thay bằng "phải qua chặn cứng bước 3". Mẫu ghi ở `test-data.md` TD-28 + mục "Ghi chú cho script-gen" (cấm gọi `test.fail()` trong vòng lặp; reviewer script-gen cố ý làm hỏng (a) để kiểm) và `known-issues.md` "Lưu ý cho bước sau" (AC-2). `test_data_ref` 13 TC thêm TD-28 |
| C1 | ✅ Rỗng = thiếu → `400` (knowledge-base, RB-102 Q1 (c); orchestrator chốt, báo người dùng ở HITL #2). TC-009: tiêu đề "coi như thiếu trường: 400", expected (e) `HTTP 400` ở cả 3 biến thể, notes ghi lý do. `viewpoint.csv` TVP-009 và `test-data.md` TD-07 sửa cùng. Số lần đăng nhập thất bại không đổi (TC-009 vẫn 3, tổng 30) |
| B1 | ✅ TC-016 steps: gửi bằng `fetch` của Node **ngoài** `APIRequestContext` (không sinh bước báo cáo, không vào trace / `run-results`), annotation chỉ mã / `Content-Type` / body, lỗi mạng ghi không kèm URL. Notes TC-016 + `test-data.md` TD-14: bước quét `run-results/`, `evidence/` tìm giá trị `RB_ADMIN_PASSWORD` và `password=` trước khi commit (chỉ in tên file, `grep -rlF`), dành cho executor / script-gen |
| B2 | ✅ `test-data.md` TD-27 (bảng + mục TD-27): nhóm `@bad-login` chạy **một lần mỗi buổi** bằng `test:run`; `test:evidence`, `test:stability`, chạy lại loại bằng `--grep-invert @bad-login` trừ khi người dùng yêu cầu; chạy lại chỉ `-g` đúng TC nghi ngờ (tính vào ngân sách buổi); `repro` BUG-37 chỉ 1 request sai |
| C2 | ✅ `viewpoint.csv` TVP-015 `linked_ac` = `AC-1;AC-3` (khớp TC-015) |
| D2 | ✅ TC-026 expected: HEAD cùng mã (201), `Content-Length` bằng của GET (hiện 7, test-impl đã kiểm), `Content-Type` giống GET; body HEAD không assert, chỉ annotation. Notes ghi lý do |
| D3 | ✅ `test-data.md` TD-26 mục 2: kiểm reset chỉ khi `403` / `404` **không mong đợi**; `404` sau `DELETE` 201 là oracle. Câu "Reset" trong steps của 7 TC có booking (TC-015, 019 → 021, 023, 024, 029) ghi cùng điều kiện; notes TC-021 (bước 4), TC-029 (bước 7) ghi rõ "404 là oracle, không kích hoạt kiểm reset" |
| D4 | ✅ TC-030: chặn cứng **trước** `test.fail()` "bước 2 không có `token`, mã bước 1, 2 < 500"; annotation từng bước (mã, `Location`, HSTS); rồi `test.fail()` + `expect.soft` 3 bước. Thêm theo orchestrator: `Location` đúng `https://` cùng host, cùng đường dẫn; `426 Upgrade Required` tính là "từ chối"; POST không nhận 301 / 302 |
| E1 | ✅ RB-102 `test-cases.csv` đã có (70 TC), soát 3 điểm: (1) **đạt**: RB-102 không có TC token cũ (TC-067 notes "v20 token cũ (RB-101) không kiểm"); (2) **khớp expected, chờ code**: RB-102 TC-066, TC-067 expected `403` + `Forbidden` (RB-102 MSG-02), cùng giá trị với RB-101 TD-25 / MSG-03; RB-102 chưa có `test-data.md`, việc đọc từ **cùng** hằng số dùng chung (`tests/data/messages.ts`) giao script-gen của 2 feature; (3) **đạt**: RB-102 tìm / dọn theo `firstname` = `QA-RB102-<RUN>` **khớp chính xác** + kiểm chủ sở hữu (TD-02), RB-101 so khớp chính xác `QA-RB101-<run>` + `lastname` (đã ghi "không so tiền tố" vào TD-26 mục 4 và câu dọn dẹp của 7 TC có booking; TC-021 dọn theo TD-26 mục 4) nên 2 bên không xóa booking của nhau. Ghi chú: RB-102 TC-067 cũng có `abc123` (v23), RB-101 TC-022 giữ `abc123` làm đối chứng AC-3 (trùng có chủ đích, Q7); token "đổi ký tự cuối" chỉ RB-101 có |
| HITL #2 mục 4 | ✅ Thêm IMP-10 (`improvements.md`): tài liệu hóa định dạng body lỗi `POST /auth`, không lộ stack trace. TC-012 → TC-014 thêm assert "body không lộ stack trace" (không có dòng `at `, không có `/app/…`, `.js:<số>`) ở nhóm bước đang đạt (trước chặn cứng); ghi ở TD-28 |

## Kiểm lại lượt 2 (2026-11-26)
**Cách kiểm**: file chưa track nên không có `git diff`. Đọc lại bằng script đúng các cột / mục mà từng phát hiện chỉ ra: `steps`, `expected_result`, `notes`, `test_data_ref` của 13 TC có bug đã biết; TC-009, TC-016, TC-026, TC-030; TD-14, TD-26 → TD-28 và "Ghi chú cho script-gen" trong `test-data.md`; TVP-009, TVP-015; `known-issues.md`, `improvements.md`. Đối chiếu thêm `restful-booker-booking-api/test-cases.csv` (70 TC) và `test-data.md` của RB-102. Không chạy API thật (không còn điểm nghi ngờ).

| # | Kết luận | Bằng chứng |
|---|---|---|
| D1 | ✅ | 12 TC (TC-004 → 014, 016) đều có `TD-28` trong `test_data_ref` và ghi thứ tự ① gửi mọi biến thể → ② `expect.soft` phần đang đạt của **mọi** biến thể → ③ chặn cứng `expect(test.info().errors).toHaveLength(0)` → ④ `test.fail()` → ⑤ `expect.soft` phần bug. TC-012 / 013 (phần bug là (d)) và TC-014 (phần bug là (c)–(e)) ghi đúng phần đang đạt / phần bug. "Ghi chú cho script-gen" giải thích vì sao và **cấm gọi `test.fail()` trong vòng lặp biến thể**; reviewer script-gen sẽ cố ý làm hỏng (a). Không TC nào còn câu mâu thuẫn kiểu "kiểm bằng `expect.soft` + `test.fail()` ngay trước (e)" |
| C1 | ✅ | TC-009: tiêu đề "coi như thiếu trường: 400", (e) `HTTP 400` ở cả 3 biến thể, có lý do; TVP-009, TD-07 sửa cùng. Ngân sách vẫn 30 |
| B1 | ✅ | TC-016 bước 1 gửi bằng `fetch` **ngoài** `APIRequestContext`; annotation chỉ ghi mã / `Content-Type` / body; lỗi mạng ghi không kèm URL. TD-14 và notes TC-016 có bước quét `run-results/`, `evidence/` tìm giá trị `RB_ADMIN_PASSWORD` và `password=` trước commit (chỉ in tên file). Bước 0 vẫn dùng `APIRequestContext` với body JSON: đúng, vì mật khẩu nằm trong body, không nằm trong URL |
| B2 | ✅ | TD-27: `@bad-login` chạy một lần mỗi buổi; `test:evidence`, `test:stability` và lần chạy lại dùng `--grep-invert @bad-login`; chạy lại chỉ `-g` đúng TC và tính vào ngân sách của buổi |
| C2 | ✅ | TVP-015 `AC-1;AC-3` |
| D2 | ✅ | TC-026: cùng mã, `Content-Length` và `Content-Type` như GET; body HEAD chỉ ghi annotation |
| D3 | ✅ | TD-26 mục 2: chỉ kiểm reset khi gặp `403` / `404` **không mong đợi**; TC-021 bước 4 và TC-029 bước 7 ghi "404 là oracle". Thêm TD-26 mục 4: dọn dẹp **so khớp chính xác**, không so tiền tố |
| D4 | ✅ | TC-030 bước 5: chặn cứng **trước** `test.fail()` (bước 2 không có token; mã bước 1, 2 < 500); bước 4 ghi annotation từng bước; `Location` đúng https, cùng host, cùng đường dẫn; `426` tính là từ chối; POST không nhận 301 / 302. Không dùng `test.info().errors` nhưng tương đương, vì trước bước 5 không có `expect.soft` nào: `expect` cứng ném lỗi trước khi tới `test.fail()` |
| E1 | ✅ | Tự kiểm RB-102: 70 TC; TC-067 notes "v20 token cũ (RB-101) không kiểm"; tìm / dọn theo `QA-RB102-<RUN>` (TD-02 của RB-102); RB-102 dùng đúng `RB_ADMIN_USERNAME` / `RB_ADMIN_PASSWORD` (HITL #2 mục 1). `abc123` có ở cả 2 feature, trùng có chủ đích (Q7). Việc đọc `403` / `Forbidden` từ cùng một hằng số dùng chung chuyển sang soát ở bước script-gen |
| HITL #2 mục 4 | ✅ | IMP-10 (body lỗi thống nhất, không lộ stack trace); TC-012 → 014 kiểm "không lộ stack trace" trong nhóm đang đạt, **trước** chặn cứng. Số IMP-09 không dùng lại, có ghi chú |

**Kết luận lượt 2**: ✅ **Đạt**. 9/9 phát hiện và điểm HITL #2 mục 4 đã sửa đủ ở mọi chỗ liên quan. Đủ điều kiện sang HITL #2. Còn một việc chuyển sang review script-gen: cố ý làm hỏng (a) để kiểm chặn cứng của D1, và kiểm hằng số `403` / `Forbidden` dùng chung với RB-102.
