# Review: test-design, restful-booker-auth-api (RB-101)

- **Ngày**: 2026-11-26 · **Reviewer**: qa-reviewer (vai QC Lead, theo ISTQB) · **Kết luận**: ⚠️ **Cần sửa trước HITL #1**
- **Phạm vi**: `requirement/requirement.md` (5 AC) + `requirement/apidoc.txt`; `spec-review.md` (O-01 → O-23, 3 bảng ma trận, BR-1 → BR-8); `viewpoint.csv` (35 dòng); `q-and-a.md` (Q1 → Q10); `known-issues.md` (BUG-A1 (a), (b), A2, A3, A4); `improvements.md` (IMP-01 → IMP-08).
- **Nguồn đối chiếu**: `CLAUDE.md` (điểm 4: biến thể hay số mới; "không che bug"), `.claude/agents/qa-reviewer.md` (mục 3.8, L1–L16), `.claude/commands/qa-orchestrator.md` ("Soát đủ mà không tốn thừa"), `knowledge-base/q-and-a-archive.md`, RB-102 `qa-runs/restful-booker-booking-api/` (`requirement.md` AC-7, `spec-review.md` O-27 + ma trận 22 kiểu, `q-and-a.md` Q4 / Q11, `viewpoint.csv` TVP-034 / 035 / 037), mẫu SD-103 `qa-runs/saucedemo-checkout-screen/reviews/review-test-design.md`.
- **Cách kiểm**: script Node `fetch` riêng đặt **ngoài repo** (thư mục tạm của hệ điều hành), không theo chuyển hướng, ghi mã / `Content-Type` / header bảo mật / body (token được che khi ghi log). Soát sâu theo rủi ro: BUG-A1 (a), A1 (b), A3, định dạng token, token cũ, token giả, chu kỳ reset, HTTP thường, CORS. **Không** kiểm lại BUG-A2 (ngoài trọng tâm, test-design có 2/2) và BUG-A4 (theo chỉ đạo, không dò thêm). Tổng **31 request**, **5 lần đăng nhập thất bại**, 1 booking tự tạo (firstname `QA-RB101-REV`): booking này bị chính **lần reset 12:11 UTC** của API xóa (GET sau đó `404`), nên không cần `DELETE`. Không sửa file nào của dự án ngoài file này.
- **Tự đếm lại**: `viewpoint.csv` 35 dòng, đủ 8 cột, **29 `in` / 6 `out`** (TVP-019, 020, 021, 022, 029, 034, đều có lý do); trục data 18 · functional 10 · non-functional 5 · flow 2; priority của dòng `in`: high 11 · medium 9 · low 9. AC-1 → AC-5 đều có ≥ 1 viewpoint `in`. `q-and-a.md` 10 câu (6 blocking: Q1, Q2, Q3, Q4, Q6, Q7; 4 non-blocking: Q5, Q8, Q9, Q10), cả 10 `Open`. Quan sát O-01 → O-23 (23). Bug tạm: A1 (a), A1 (b) biến thể, A2, A3, A4. Cải tiến IMP-01 → IMP-08 (8). Khớp số test-design báo.
- **Tóm tắt**: 0 🔴 · 6 🟠 · 8 🟡. Phần khám phá API rất kỹ (3 bảng ma trận, an toàn trên API dùng chung, phát hiện chu kỳ reset). Vấn đề chính: **`POST /auth` nhận cả HTTP thường** (mật khẩu và token đi dạng rõ) chưa được ghi (A1); **BUG-A3 thực ra khớp tài liệu** (tài liệu có dòng `Default HTTP 201 response`) (A2); **BUG-A1 (b) nên cấp số riêng** theo chính quy tắc của dự án (B1); **quy tắc `retries` ở Q6 (d)** dễ che bug (B2); số lần đăng nhập sai đã thiết kế mâu thuẫn quy tắc "một chữ số" (C1); ranh giới RB-101 / RB-102 vừa trùng vừa hở (C2).

## Kiểm chứng trên API thật (2026-11-26, 12:06 → 12:11 UTC)
| Điểm | Kết quả | Cách kiểm |
|---|---|---|
| BUG-A1 (a): sai mật khẩu trả `200` | ✅ verified | 2/2: `200`, `application/json; charset=utf-8`, body `{"reason":"Bad credentials"}`, không có `token`. Thêm (ngoài danh sách của test-design): tên đăng nhập kiểu SQL `<tên>' OR '1'='1` + mật khẩu `x' OR '1'='1`, và tên đăng nhập có **khoảng trắng cuối** + mật khẩu đúng: cả hai `200` `Bad credentials`, không vượt xác thực |
| BUG-A1 (b): XML với tài khoản đúng | ✅ verified (1/1) | `Content-Type: text/xml`, body `<auth>…</auth>` đúng tài khoản → `200` `{"reason":"Bad credentials"}` |
| BUG-A3: `/ping` trả `201` | ✅ hành vi đúng như ghi, ⚠️ **phân loại sai** (A2) | 2/2 qua HTTPS + 1 qua HTTP: `201`, `text/plain; charset=utf-8`, body `Created`. Lần đầu ~1,2 giây, sau đó ~0,3 giây |
| Định dạng token | ✅ verified | 5 token (4 qua HTTPS, 1 qua HTTP): đều 15 ký tự `[0-9a-f]`, đôi một khác nhau, 3 token cấp liên tiếp **không có tiền tố chung** (không thấy dạng tuần tự / theo thời gian) |
| Token cũ còn dùng được khi đã cấp token mới | ✅ verified | Cấp T1, T2, T3 liên tiếp rồi dùng **T1**: `PATCH` booking tự tạo → `200` (đổi `firstname`); `PATCH /booking/999999999` (GET trước đó `404`) → `405` |
| Token giả bị từ chối | ✅ verified | T1 đổi ký tự cuối → `PATCH /booking/999999999` → `403` `Forbidden` |
| Token và dữ liệu mất khi reset ~10 phút | ✅ verified (lần reset thứ 4) | Mỗi phút: T1 trên `/booking/999999999` + `GET` booking của mình. 12:06:12 → 12:10:18: `405` và booking `200`. **12:11:20: T1 `403`, booking `404`**; token mới T4 cấp lúc 12:11:21 → `405` (reset, không phải bị chặn). Cùng các mốc ~10:51, ~11:01, ~11:11 của test-design: reset **đúng phút x1 của đồng hồ UTC** (A3) |
| HTTP thường | 🆕 **phát hiện mới** (A1) | `GET http://…/ping` → `201`; `POST http://…/auth` tài khoản đúng → **`200` + token**; không `301` / `308`, không `Location`, không `Strict-Transport-Security` |
| CORS, cache | ✅ khớp O-17 | `POST /auth` kèm `Origin`: không có `Access-Control-Allow-Origin`; phản hồi chứa token không có `Cache-Control`; mọi phản hồi có `X-Powered-By: Express` |
| Riêng tư 5 file | ⚠️ gần đạt (C4) | Quét: không có mật khẩu, chuỗi Basic, đường dẫn máy, tên người dùng máy. Có **1 token thật** làm ví dụ ở `spec-review.md:44` (đã hết hạn sau reset) |

## Checklist (mục 5: Phân tích yêu cầu / thiết kế test)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Mọi AC đánh giá testable, từ mơ hồ thành câu hỏi | ✅ Đạt | `spec-review.md` bảng AC: AC-1, AC-3 ✅; AC-2, AC-4, AC-5 ⚠️ có Q2, Q1, Q3. 5 điểm "Chưa rõ" của ticket đều có câu hỏi |
| Quan sát tách khỏi yêu cầu; hành vi đáng ngờ thành câu hỏi / known-issue | ⚠️ Gần đạt | Có đoạn "Hành vi hiện tại lúc phân tích" riêng, BR ghi "chờ Qn". Nhưng TVP-001 ghi "hiện trạng 15 ký tự hex" dễ thành oracle (B5) |
| Viewpoint phủ chức năng, dữ liệu, luồng, phi chức năng; `out` có lý do | ⚠️ Gần đạt | 4 trục, 6 dòng `out` có nguồn. Thiếu HTTP thường (A1), vài lớp input (B4) |
| Luồng chuyển trạng thái (bản API: cấp → dùng → cấp mới → token cũ → reset) | ✅ Đạt | TVP-002, TVP-026, TVP-035 `in`; TVP-022 `out` có lý do; reviewer kiểm lại token cũ và reset trên API thật |
| Kiểm soát truy cập: token giả / bị sửa | ✅ Đạt | O-19 (10 kiểu × 3 method), reviewer kiểm lại 1 kiểu: `403`. Ranh giới với RB-102: C2 |
| Ma trận (bản API: endpoint × phương thức × lớp input × lớp token), mọi ô đã thử | ⚠️ Gần đạt | Bảng 1–3 đủ ô. Thiếu chiều **giao thức** (HTTP / HTTPS) (A1) |
| Câu hỏi có bối cảnh, đề xuất, ảnh hưởng; BR không chứa hành vi chưa xác nhận | ⚠️ Gần đạt | 10 câu đủ cột. Q6 (d) cần sửa (B2); Q1 thiếu dòng tài liệu quan trọng (A2); câu dẫn ghi "Bốn điểm" (C3) |
| Bug thấy sớm ghi vào known-issues kèm mọi biến thể | ❌ Chưa đạt | A1 (b) nên số riêng (B1); A3 nên là lỗi tài liệu (A2); danh sách viewpoint phải bắt A1 thiếu TVP-006, 007, 016 (B3); HTTP thường chưa ghi (A1) |

## A. Phát hiện mới (đã kiểm chứng trên API thật)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | **`POST /auth` chạy cả trên HTTP thường**: tài khoản quản trị gửi đi và token nhận về đều ở dạng rõ, không chuyển hướng sang HTTPS, không có HSTS. Bảng 1 / O-17 chỉ ghi "thiếu `Strict-Transport-Security`" trên HTTPS, không thử `http://`. Đây là rủi ro bảo mật lớn hơn `X-Powered-By` hay `Cache-Control` (IMP-02 đang gộp chung, Low) | Mục kiểm chứng: `POST http://…/auth` → `200` + token, không `Location`; `GET http://…/ping` → `201` | 🟠 | (1) Thêm **O-24** vào `spec-review.md` và cột / dòng "giao thức" ở bảng 1. (2) Mở rộng **Q9** (hoặc thêm Q11): "`/auth` có bắt buộc HTTPS không?", đề xuất: HTTP phải chuyển hướng (`308`) hoặc từ chối, phản hồi HTTPS có HSTS. (3) Ghi bug nghi ngờ mới (Medium, chờ Q9) **hoặc** IMP riêng mức **Medium** tách khỏi IMP-02. (4) Thêm TVP (security, `in`, low cost): `GET http://…/ping` và `POST http://…/auth` với tài khoản **sai** (không gửi mật khẩu thật dạng rõ trong CI) → kỳ vọng không phục vụ trên HTTP (chuyển hướng / từ chối) |
| A2 | **BUG-A3 khớp tài liệu, không phải bug sản phẩm**: `apidoc.txt:728-735` ghi `Success 200` (tiêu đề tự sinh của apidoc) **rồi** `Default HTTP 201 response` và ví dụ `HTTP/1.1 201 Created`. Spec-review O-01, Q1, known-issues, IMP-06 / 07 chỉ trích `Success 200` và ví dụ, bỏ sót dòng `Default HTTP 201 response`. Sản phẩm trả đúng `201` như tài liệu nói 2 lần và đạt AC-4. Ghi là bug sẽ lấy một số chung (BUG-37+) cho thứ thực chất là lỗi trình bày tài liệu | `apidoc.txt:728`, `:732`, `:735`; kiểm lại `201` 3/3 | 🟠 | Chuyển BUG-A3 thành **lỗi tài liệu** trong IMP-06 (mặc định), chỉ cấp số bug nếu PO chốt `200` ở Q1. Sửa Context của Q1 thêm dòng `Default HTTP 201 response`. TVP-030 giữ kiểm đúng `201` + `Created` (đề xuất của Q1 vẫn đúng). Giữ IMP-07 (`200` + JSON cho health check) như cải tiến |
| A3 | **Reset theo đồng hồ, đúng phút x1** (10:51, 11:01, 11:11 của test-design; 12:11 của reviewer, khoảng 12:10:19 → 12:11:20). Booking test tự tạo **cũng bị xóa** khi reset: bước dọn dẹp (`DELETE` trong `afterEach` / `finally`) sẽ gặp `403` / `404` | Mục kiểm chứng: T1 `405` → `403`, booking `200` → `404`, token mới `405` | 🟡 | Ghi vào O-21 + lưu ý của `known-issues.md`: (1) mốc reset dự đoán được, dùng làm **bằng chứng thứ 3** khi phân loại lỗi môi trường (B2); (2) dọn dẹp phải chấp nhận `403` / `404` sau reset (không làm test fail vì bước dọn), nhưng ghi annotation |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **BUG-A1 (b) không phải biến thể của A1 (a)** theo `CLAUDE.md` điểm 4 ("khác điểm kiểm → số mới"). (a) là **mã HTTP khi sai tài khoản**; (b) là **không kiểm định dạng body** (parser bỏ qua XML / multipart / thiếu `Content-Type` nên coi như thiếu trường). Sửa (a) thành `401` thì (b) vẫn sai: tài khoản đúng gửi XML sẽ nhận `401 Bad credentials`, vẫn gây hiểu lầm; expected của (b) là `415`. Câu "sửa chỗ này sửa được cả hai" (`known-issues.md:79`) không đúng, và chính Q4 đã đề xuất `415` (điều kiện mà dòng 79 nói sẽ tách số) → tài liệu tự mâu thuẫn | `known-issues.md:79`, `:88`; Q4; kiểm XML 1/1 | 🟠 | Tách **BUG-A5** (tạm) "định dạng body không hỗ trợ bị báo `Bad credentials`", Low, TVP-014 bắt. Sửa dòng 79, cột "Ảnh hưởng" của Q4, bảng 2 (`BUG-A1 b` → `BUG-A5`), TVP-014 `source`. Nếu PO trả lời Q4 là "`/auth` chỉ nhận JSON, trả gì cũng được miễn không cấp token" thì đóng BUG-A5, không gộp ngược |
| B2 | **Q6 (d) cho phép `retries` cho cả nhóm test có booking**: trái `CLAUDE.md` ("không che bug") và mục 3.8 (flaky phải tìm nguyên nhân, không chạy lại cho xanh). `retries` của Playwright áp cho **mọi** lỗi của test, kể cả lỗi thật (vd token bị thu hồi sớm, `PATCH` sai dữ liệu); lần 2 pass thì cả lần chạy vẫn xanh, chỉ còn nhãn "flaky" dễ bị bỏ qua. Điều kiện nhận biết "`403` + booking của mình `404`" là tốt nhưng mới là 2 dấu hiệu cùng phía (cả hai đều có thể do một bug xóa / thu hồi) | `q-and-a.md` Q6 cột Đề xuất (d); `known-issues.md:109`; A3 | 🟠 | Thay (d) bằng: **không** dùng `retries` trong cấu hình. Trong test, khi token vừa cấp bị `403`: kiểm **đủ 3 dấu hiệu** (a) booking của chính test `404`; (b) lấy token **mới** → `PATCH /booking/999999999` trả `405`; (c) thời điểm lỗi nằm trong cửa sổ reset (phút x0:50 → x1:30 UTC, A3). Đủ 3 thì làm lại phần chuẩn bị **một lần ngay trong test** (token mới + booking mới) và gắn annotation `env-reset`; thiếu một dấu hiệu, hoặc reset lần 2 trong cùng test → **fail** như lỗi thật. Executor báo số test có `env-reset` (không tính là "đạt sạch"). Thêm: không lấy token trong `beforeAll`; giữ khoảng "cấp token → dùng" chỉ vài giây |
| B3 | **Bước kiểm mã HTTP của BUG-A1 chưa có ở mọi viewpoint sai tài khoản**: TVP-006, 007, 009, 010, 011, 016 (đều trả `200` theo O-09, O-13, bảng 2 "🔴 mã") không nhắc "mã HTTP theo Q2"; cột "Viewpoint phải bắt" của A1 (a) chỉ liệt kê TVP-004, 005, 008 → 011, bỏ 006, 007, 016 (bài học L1, L10: mọi biến thể) | `viewpoint.csv` TVP-006/007/009/010/011/016; `known-issues.md:87` | 🟡 | Thêm "mã HTTP theo Q2 (BUG-A1)" vào mô tả 6 viewpoint; sửa cột "Viewpoint phải bắt" thành TVP-004 → TVP-011, TVP-016 |
| B4 | **Thiếu vài lớp input của tên đăng nhập / mật khẩu**: chuỗi kiểu SQL injection ở tên đăng nhập (mới có object / mảng kiểu NoSQL); khoảng trắng mới thử **đầu tên** và **cuối mật khẩu**, thiếu cuối tên / đầu mật khẩu; Unicode (chữ có dấu, ký tự giống chữ Latin) | `viewpoint.csv` TVP-007, TVP-010; reviewer thử SQL + khoảng trắng cuối tên: `200` `Bad credentials`, không vượt xác thực | 🟡 | Gộp vào viewpoint sẵn có (không tăng nhiều TC): TVP-007 ghi đủ 4 vị trí khoảng trắng (chọn 2 đại diện chưa thử nếu bị giới hạn số lần sai, xem C1); TVP-010 thêm 1 chuỗi SQL ở tên đăng nhập. Unicode: low, có thể ghi `out` kèm lý do |
| B5 | **TVP-001 dễ biến hiện trạng thành oracle**: AC-1 chỉ đòi "chuỗi không rỗng"; mô tả ghi "hiện trạng 15 ký tự hex" nên test-impl dễ assert `^[0-9a-f]{15}$` (đổi độ dài token là đỏ dù vẫn đúng AC) | `viewpoint.csv` TVP-001; AC-1 | 🟡 | Ghi rõ: expected = `token` là chuỗi không rỗng + đôi một khác nhau (TVP-002); độ dài / bộ ký tự chỉ ghi annotation. Muốn kiểm độ mạnh token thì thành câu hỏi riêng gắn IMP-03 |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | **Quy tắc "số lần đăng nhập sai trong cả bộ test giữ ở mức một chữ số"** mâu thuẫn với viewpoint `in`: TVP-004 → 011, 014, 016 cần khoảng **25 lần** đăng nhập thất bại mỗi lần chạy (004: 1, 005: 1–2, 006: 2, 007: 2, 008: 4, 009: 3, 010: 4, 011: 1, 014: 5, 016: 1), chưa tính lần chạy lặp (`test:stability`). Test-impl sẽ phải chọn giữa vi phạm quy tắc và bỏ biến thể (trái L13) | `known-issues.md:107`; `viewpoint.csv` | 🟠 | Sửa quy tắc thành con số thực tế: "≤ 30 lần thất bại / lần chạy, gọi tuần tự, không lặp / không retry nhóm này, `test:stability` chỉ chạy với `-g` loại trừ nhóm sai tài khoản". Nêu ở HITL #1 cho người dùng chốt |
| C2 | **Ranh giới RB-101 / RB-102 vừa trùng vừa hở**. Trùng: TVP-028 (token rỗng, viết hoa, bớt 1 ký tự) = RB-102 v03, v10, v11 (TVP-035). Hở: RB-102 **không có** token ví dụ `abc123` của tài liệu và token **thêm 1 ký tự** (bắt lỗi so khớp tiền tố) mà RB-101 O-19 đã thử. Mã từ chối: TVP-028 cố định `403`, trong khi RB-102 Q4 đang hỏi `401` hay `403` | `viewpoint.csv` TVP-028, TVP-029; RB-102 `spec-review.md` bảng v01 → v22, `q-and-a.md` Q4, Q11, `viewpoint.csv` TVP-035, TVP-037 | 🟠 | Sửa đề xuất của Q7 theo mục "Phân chia RB-101 / RB-102" bên dưới: TVP-028 rút còn **đối chứng** (D1), mã "theo RB-102 Q4"; báo orchestrator chuyển `abc123` và "thêm 1 ký tự" sang ma trận RB-102 |
| C3 | Câu dẫn `q-and-a.md:45` ghi "**Bốn** điểm 'Chưa rõ'" nhưng liệt kê 5 (Q1, Q2, Q6, Q5, Q4); ticket cũng có 5 điểm | `q-and-a.md:45`; `requirement.md` mục "Chưa rõ" | 🟡 | Sửa "Bốn" → "Năm" |
| C4 | `spec-review.md:44` (O-04) ghi **một token thật** làm ví dụ. Token đã mất sau reset nhưng trái nguyên tắc riêng tư (không ghi token) | `spec-review.md:44` | 🟡 | Thay bằng `<15 ký tự hex>` |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | **Test dương tính AC-3 cần đối chứng âm** (góc nhìn "test có thể fail không", L15): TVP-023 → 025 chỉ kiểm token đúng được nhận. Nếu API nhận **mọi** token, 3 test vẫn xanh. Đây là lý do RB-101 phải giữ một phần TVP-028, không phải để trùng ma trận RB-102 | `viewpoint.csv` TVP-023 → 025, TVP-028 | 🟡 | Ghi vào TVP-028: mục đích là **đối chứng** cho AC-3 ("token phải do hệ thống cấp"); trong cùng điều kiện (cùng booking, cùng method) token giả bị từ chối và booking không đổi |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | **Phân mức bảo mật**: Q9 / TVP-020 gộp mọi header vào "ngoài phạm vi vì ticket loại trừ kiểm thử xâm nhập". Đọc header và thử `http://` là kiểm **thụ động**, 1–2 request, không phải pentest. Mức đề xuất hiện tại hợp lý cho `X-Powered-By` (Low, lộ công nghệ), `Cache-Control: no-store` cho phản hồi token (Low: POST qua HTTPS mặc định không được cache dùng chung), token ~60 bit (Low: dò 2^60 qua mạng không khả thi). BUG-A4 Medium hợp lý (mật khẩu mặc định đã công khai nên tác động thực tế thấp; với hệ thống thật là High). Riêng HTTP thường (A1) phải cao hơn nhóm này | O-17, Q9, IMP-02, IMP-03, BUG-A4 | 🟡 | Tách IMP-02 thành: (a) HTTPS bắt buộc + HSTS (Medium, A1); (b) header còn lại (Low). Cho TVP kiểm `http://` (A1) và `Cache-Control` của phản hồi token là `in`, low, các header khác giữ `out` |

## Phân chia RB-101 / RB-102 (đề xuất cho Q7, đối chiếu RB-102 AC-7, Q4, Q11)
| Chủ đề | Thuộc | Lý do |
|---|---|---|
| Cấp token: AC-1, AC-2, AC-5, mọi lớp input của `POST /auth`, định dạng body, phương thức, HTTP / HTTPS của `/auth` | RB-101 | Endpoint của RB-101 |
| Vòng đời token: mỗi lần một token mới, **token cũ còn dùng được** (TVP-026), mất sau reset (TVP-022 `out`), thu hồi / hạn dùng (IMP-04) | RB-101 | RB-102 Q11 và TVP-037 (`out`) đã chuyển sang RB-101. RB-102 v20 (token cũ) nên ghi "tham chiếu RB-101 TVP-026", không viết TC riêng |
| Token cấp qua URL-encoded dùng được (TVP-015) | RB-101 | Phụ thuộc Q4 của RB-101 |
| AC-3 dương tính: token vừa cấp làm được `PUT`, `PATCH`, `DELETE` (TVP-023 → 025, 027, 035) | RB-101 | AC-3 |
| **Đối chứng** của AC-3: token **không do hệ thống cấp** (`abc123` của tài liệu) và token bị sửa 1 ký tự bị từ chối, booking không đổi (TVP-028 rút gọn, 1–2 TC) | RB-101 | D1; mã từ chối theo RB-102 Q4 |
| **Ma trận quyền đầy đủ**: không có thông tin xác thực, token rỗng / viết hoa / thiếu / **thêm** ký tự, `abc123`, `Bearer`, `?token=`, header `token`, tên cookie sai, cookie không tên, nháy kép, nhiều cookie, **Basic** đúng / sai / rỗng / không phải base64 / scheme viết thường, Cookie đúng + Basic sai | RB-102 | AC-7 của RB-102 ghi rõ cả Cookie và Basic; đã có 22 kiểu × 3 method. Cần **bổ sung** `abc123` và "thêm 1 ký tự" từ RB-101 O-19 |
| Mã `401` hay `403` khi bị từ chối | RB-102 (Q4) | Một câu trả lời dùng cho cả hai feature; TVP-028 của RB-101 ghi "mã theo RB-102 Q4" |
| `Authorization: Basic` | RB-102 | Cách thay thế token cho thao tác booking, không đi qua `/auth`. RB-101 TVP-029 `out` là đúng |

## Câu hỏi đề xuất thêm / sửa cho HITL #1
| # | Nội dung |
|---|---|
| Q1 (sửa) | Thêm vào Context: tài liệu có dòng `Default HTTP 201 response`; đề xuất mặc định: `201` là đúng, lệch là lỗi tài liệu (A2) |
| Q4 (sửa) | Ảnh hưởng: BUG-A5 (tách từ A1 (b)) (B1) |
| Q6 (sửa) | Thay (d) bằng quy tắc 3 dấu hiệu, không dùng `retries` (B2) |
| Q7 (sửa) | Theo bảng phân chia trên (C2, D1) |
| Q9 (sửa) hoặc Q11 (mới) | `/auth` có bắt buộc HTTPS không (A1) |
| Q12 (mới, cho người dùng) | Ngân sách đăng nhập thất bại mỗi lần chạy (C1) |

## Việc cần làm trước khi sang bước sau (xếp theo mức độ)
1. 🟠 A1: thêm O-24, ô HTTP ở bảng 1, câu hỏi HTTPS, bug nghi ngờ hoặc IMP Medium, TVP kiểm `http://` bằng tài khoản sai.
2. 🟠 A2: BUG-A3 → lỗi tài liệu (IMP-06) mặc định; sửa Q1 Context.
3. 🟠 B1: tách BUG-A5 khỏi A1 (b); sửa `known-issues.md:79`, Q4, bảng 2, TVP-014.
4. 🟠 B2: viết lại Q6 (d) và lưu ý token của `known-issues.md` (3 dấu hiệu, không `retries`, annotation `env-reset`).
5. 🟠 C1: sửa ngân sách đăng nhập sai cho khớp số viewpoint, đưa ra HITL #1.
6. 🟠 C2: sửa đề xuất Q7, TVP-028 (đối chứng, mã theo RB-102 Q4); báo orchestrator để RB-102 thêm `abc123` + "thêm 1 ký tự" và tham chiếu TVP-026 ở v20.
7. 🟡 A3, B3, B4, B5, C3, C4, D1, E1: sửa theo cột Đề xuất.

## Xử lý sau review
| # | Xử lý |
|---|---|
| A1 | ✅ test-design tự kiểm lại 2/2 (chỉ gửi tài khoản **sai** qua HTTP): `GET http://…/ping` `201`, `POST http://…/auth` `200` `Bad credentials`, không `Location`, HTTPS không có HSTS. Thêm **O-24** + dòng `http://` ở bảng 1, dòng "Giao thức" ở bảng 2 (`spec-review.md`); thêm **Q11** (blocking: có bắt buộc HTTPS không); bug nghi ngờ **BUG-A6** (Medium, chờ Q11; không bắt buộc → IMP-09 Medium); thêm **TVP-036** (`in`, medium, chỉ tài khoản sai) |
| A2 | ✅ Theo quyết định chung của orchestrator (quy tắc `201`, cùng RB-102 Q6): **bỏ BUG-A3**, chuyển thành lỗi tài liệu **IMP-06** (1); Q1 viết lại cùng cách viết với RB-102 Q6, thêm dòng `Default HTTP 201 response`, chuyển **non-blocking**; TVP-030 expected **`201`**; AC-4, BR-5, O-01 sửa theo; IMP-07 giữ là cải tiến dài hạn |
| A3 | ✅ O-21 ghi reset **đúng phút x1 UTC** (thêm lần 12:11 của reviewer, booking tự tạo cũng bị xóa); `known-issues.md` "Không phải bug" + "Lưu ý cho bước sau": cửa sổ x0:50 → x1:30 là dấu hiệu thứ 3, bước dọn dẹp chấp nhận `403` / `404` và ghi annotation |
| B1 | ✅ Tách **BUG-A5** (tạm, Low) "định dạng body không hỗ trợ bị báo `Bad credentials`" khỏi BUG-A1 (quyết định chung: lỗi lớp đọc body / `Content-Type` khác chỗ sửa với bước kiểm tài khoản; RB-102 áp dụng cùng quy tắc cho lỗi 500). Sửa câu dẫn `known-issues.md`, Q4 (Đề xuất + Ảnh hưởng), bảng 2 và cột Ghi chú O-13, AC-2, TVP-014 `source`. PO chốt "chỉ nhận JSON, trả gì cũng được" thì đóng BUG-A5, không gộp ngược |
| B2 | ✅ Q6 (d) thay bằng (c) **chiến lược reset dùng chung với RB-102**: không dùng `retries`; không lấy token trong `beforeAll`; đủ **3 dấu hiệu** (booking của test `404`; token mới `PATCH /booking/999999999` → `405`; trong cửa sổ x0:50 → x1:30 UTC) mới làm lại chuẩn bị **một lần trong test** + annotation `env-reset`; thiếu dấu hiệu hoặc reset lần 2 → fail; dọn dẹp chấp nhận `403` / `404`; Heroku `503` / đang ngủ là lỗi môi trường. Cùng đoạn trong `known-issues.md` "Lưu ý cho bước sau" |
| B3 | ✅ Thêm "mã HTTP theo Q2 (BUG-A1)" vào TVP-005, 006, 007, 009, 010, 011, 016 (TVP-004, 008 đã có); cột "Viewpoint phải bắt" của BUG-A1 thành **TVP-004 → TVP-011, TVP-016**; Q2 "Ảnh hưởng" sửa theo |
| B4 | ✅ TVP-007 ghi đủ 4 vị trí khoảng trắng (đã thử đầu tên, cuối tên của reviewer, cuối mật khẩu); TVP-010 thêm chuỗi kiểu SQL ở tên đăng nhập; bảng 2 ghi nguồn "review B4"; Unicode thành **TVP-038** `out` (tài khoản chỉ ASCII, tốn thêm lần đăng nhập sai, Q12) |
| B5 | ✅ TVP-001: expected chỉ là "chuỗi không rỗng" (+ đôi một khác nhau ở TVP-002); độ dài / bộ ký tự chỉ annotation. Sửa AC-1 ở `spec-review.md`, IMP-03, lưu ý "Oracle token" trong `known-issues.md` |
| C1 | ✅ Bỏ quy tắc "một chữ số". Thêm **Q12** (blocking, cho người dùng): **≤ 30 lần thất bại / lần chạy**, tuần tự, nhóm sai tài khoản không chạy lặp / không retry (`test:stability` loại nhóm này). Đếm lại: 27 lần qua bước kiểm tài khoản + 3 lần bị lớp đọc body chặn = 30; để vừa ngân sách, TVP-014 rút còn 3 đại diện (`text/xml`, multipart, thiếu `Content-Type`) |
| C2 | ✅ Q7 viết lại theo bảng "Phân chia RB-101 / RB-102" của review (quyết định của orchestrator): RB-101 giữ cấp token, vòng đời (TVP-026), AC-3 dương tính, TVP-028 rút gọn còn `abc123` + 1 token bị đổi ký tự cuối, mã **theo RB-102 Q4** (không cố định `403`: sửa TVP-028, BR-4, bảng 3, O-19, checklist); RB-102 giữ ma trận đầy đủ + Basic (TVP-029 `out`). Báo orchestrator: RB-102 cần thêm `abc123` + "thêm 1 ký tự" và tham chiếu TVP-026 ở v20 |
| C3 | ✅ `q-and-a.md`: "Bốn" → "Năm" |
| C4 | ✅ O-04 thay token thật bằng `<15 ký tự hex>`; quét lại 5 file + `viewpoint.csv`: không còn chuỗi hex ≥ 12 ký tự, không mật khẩu, không chuỗi Basic, không đường dẫn máy. Thêm lưu ý "không ghi token thật vào tài liệu, log, annotation" |
| D1 | ✅ TVP-028 ghi rõ mục đích **đối chứng âm của AC-3**, cùng booking, cùng method với TVP-023 → TVP-025; TVP-023 → 025 ghi "Đối chứng âm: TVP-028" |
| E1 | ✅ Tách IMP-02: phần HTTPS / HSTS thành **IMP-09** (Medium, dự phòng cho BUG-A6) + Q11; IMP-02 chỉ còn header mức thấp. Thêm **TVP-037** (`in`, low): `Cache-Control: no-store` của phản hồi token, expected theo Q9 (thiếu header là cải tiến, chỉ annotation trừ khi PO chốt là yêu cầu); header khác giữ `out` (TVP-020) |

## Kiểm lại lượt 2 (2026-11-26)
**Cách kiểm**: 5 file đều chưa track nên không có `git diff`; đọc lại đúng các chỗ mà từng phát hiện chỉ ra (grep theo ID) và đối chiếu với 7 quyết định chung của orchestrator. Tự đếm lại: `viewpoint.csv` 38 dòng, đủ 8 cột, 31 `in` / 7 `out`; `q-and-a.md` 12 câu, 7 blocking (Q2, Q3, Q4, Q6, Q7, Q11, Q12) / 5 non-blocking, khớp dòng "Tổng hợp" và checklist của `spec-review.md:135`. Quét riêng tư 5 file: không có chuỗi hex ≥ 12 ký tự, mật khẩu, chuỗi Basic hay đường dẫn máy. **Không chạy lại API**: không còn điểm nào phải nghi ngờ (O-24 của test-design dùng tài khoản sai, khớp kết quả reviewer đã chạy bằng tài khoản đúng).

| # | Kết luận | Bằng chứng |
|---|---|---|
| A1 | ✅ | O-24, dòng `http://` ở bảng 1 (`spec-review.md:75-76`), dòng "Giao thức" ở bảng 2 (`:98`), Q11 blocking, BUG-A6 Medium (`known-issues.md:16`), IMP-09, TVP-036 chỉ gửi tài khoản sai (quyết định 6). Còn một điểm nhỏ, xem R1 |
| A2 | ✅ | BUG-A3 đã bỏ, chỉ còn tên ở các câu ghi lịch sử (`known-issues.md:5`, `:29`; `spec-review.md:137`; `improvements.md:5`). Q1 non-blocking, có dòng `Default HTTP 201 response`; TVP-030 kiểm `201`; AC-4, BR-5 sửa theo (quyết định 1) |
| A3 | ✅ | Q6 Context ghi 4 lần reset ở phút x1, booking tự tạo bị xóa; phần lưu ý của `known-issues.md` có cửa sổ x0:50 → x1:30 và bước dọn chấp nhận `403` / `404` |
| B1 | ✅ | BUG-A5 (`known-issues.md:22`), quy tắc tách theo chỗ sửa (`:9`, quyết định 2); AC-2 và TVP-014 `source` trỏ về BUG-A5 |
| B2 | ✅ | Q6 (c): không dùng `retries`, không lấy token trong `beforeAll`, đủ 3 dấu hiệu, làm lại chuẩn bị 1 lần + `env-reset`, reset lần 2 thì fail (quyết định 4) |
| B3 | ✅ | TVP-005, 006, 007, 009, 010, 011, 016 đều có "mã HTTP theo Q2 (BUG-A1)" và nguồn BUG-A1 |
| B4 | ✅ | TVP-007 có đủ 4 vị trí khoảng trắng; TVP-010 thêm chuỗi SQL; Unicode thành TVP-038 `out`, có lý do |
| B5 | ✅ | TVP-001: expected "chuỗi không rỗng", độ dài chỉ ghi annotation |
| C1 | ✅ | Q12 blocking: ≤ 30 lần, tuần tự, không chạy lặp, không retry. Tự đếm lại các viewpoint `in` qua bước kiểm tài khoản: khoảng 26–27 lần (tùy số biến thể của TVP-005), khớp con số 27 của test-design. TVP-014 rút còn 3 đại diện: chấp nhận được vì `application/xml` và `text/plain` đã cho cùng kết quả ở O-13 và vẫn được ghi trong BUG-A5 (quyết định 7) |
| C2 | ✅ | Q7 viết lại theo bảng phân chia; TVP-028 rút gọn, mã từ chối theo RB-102 Q4; BR-4 sửa theo (quyết định 3, 5) |
| C3 | ✅ | `q-and-a.md`: "Năm" |
| C4 | ✅ | Quét lại: không còn token thật |
| D1 | ✅ | TVP-028 ghi là đối chứng âm; TVP-023 → 025 trỏ về TVP-028 |
| E1 | ✅ | IMP-02 chỉ còn header mức thấp; IMP-09 Medium; TVP-037 `in`, low, AC-1 |
| **R1 (mới)** | ⚠️ 🟡 | TVP-036 có `scope=in` nhưng `linked_ac=-`. Bước test-impl yêu cầu mọi TC có `linked_ac`, và RTM chỉ đếm TC theo AC (`scripts/build-rtm.mjs:87`), nên TC sinh từ TVP-036 sẽ bị bỏ ra ngoài. **Sửa**: đặt `linked_ac=AC-1;AC-4` (2 endpoint chạy qua HTTP thường) và ghi trong mô tả "rủi ro bảo mật, chưa có AC riêng, chờ Q11" |

**Kết luận lượt 2**: ⚠️ **Gần đạt**. 14/14 phát hiện đã sửa đúng và khớp 7 quyết định chung. Còn 1 điểm 🟡 (R1), sửa trong 1 dòng của `viewpoint.csv`; sửa xong là đủ điều kiện sang HITL #1, không cần review lượt 3.

## Xử lý sau lượt 2
| # | Xử lý |
|---|---|
| R1 | ✅ (orchestrator) `viewpoint.csv` TVP-036: `linked_ac` = `AC-1;AC-4`, mô tả thêm "Chờ Q11 (chưa có AC về HTTPS; tạm gắn AC-1, AC-4 vì là 2 endpoint của ticket)" |
| R1 (RB-102) | ✅ (orchestrator) Theo review RB-102 lượt 2 R1: dấu hiệu (2) của chiến lược reset đổi thành "token mới **không bị `403`**" (không dựa vào `405` của BUG-B12) ở `known-issues.md` và Q6 |
