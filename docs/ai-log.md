# Nhật ký dùng AI (AI usage log)

> Ghi lại **AI đã làm gì, sai ở đâu, người kiểm soát thế nào**.
> Mục đích: chứng minh AI được dùng có kiểm soát. Mọi kết quả AI đều được kiểm chứng trước khi chấp nhận.

**Công cụ:** Claude Code (AI trợ lý chính, kèm subagent) · Playwright MCP (AI điều khiển trình duyệt)

## Tổng hợp
| # | Ngày | Việc | AI đóng góp | Sai sót / rủi ro phát hiện | Kiểm soát của người |
|---|---|---|---|---|---|
| 1 | 2026-11-24 | Thiết kế pipeline AI agent | Đề xuất ghép pipeline v1 với 3 agent của Playwright | Bản ghép đầu tiên **trùng vai và lệch định dạng** | Yêu cầu AI cân nhắc lại hiệu quả, chọn phương án ghép có chọn lọc |
| 2 | 2026-11-24 | Script hướng dẫn agent | Viết hướng dẫn cho agent `script-gen` | Hướng dẫn gọi `npx tsc` khi dự án **chưa cài TypeScript** | Phát hiện khi chạy thử, sửa hướng dẫn |
| 3 | 2026-11-24 | Tối ưu CI | Phân tích thời gian từng bước, đề xuất cache | **Kết luận vội từ một lần đo**: lần sau bước apt mất 5,5 phút | Ghi nhận, để Bài 10 đo nhiều lần rồi mới chốt số liệu |
| 4 | 2026-11-24 | Khám phá web (Bài 2) | Khám phá SauceDemo bằng trình duyệt, khoảng 20 tình huống | Lần đầu **báo nhầm 3 user không đăng nhập được** (script-issue) | Chạy lại với phiên sạch, xác nhận không phải bug |
| 5 | 2026-11-24 | Seed test | – | Test seed mặc định **rỗng nhưng vẫn pass**, làm CI xanh giả | Đổi thành smoke check, **chứng minh test fail được** khi đổi URL sai |
| 6 | 2026-11-24 | Review sau bước test-design | Review lại toàn bộ theo vai QC Lead + ISTQB | AI **tự bỏ sót** ở bước trước: lỗ hổng cookie, 4 viewpoint, 2 file câu hỏi trùng, ghi sai kỹ thuật BVA | Người yêu cầu thêm bước review sau mỗi bước, tạo agent `qa-reviewer` |
| 7 | 2026-11-24 | Chạy evidence trên Windows | Viết script chạy evidence | Lệnh có `-g "A\|B"` bị cmd cắt ở dấu `\|`, **0 test chạy** mà vẫn tạo mục lục | Đối chiếu số test đã chạy; script gọi Playwright không qua shell |
| 8 | 2026-11-24 | Bug report SD-101 | Viết BUG-01, tạo RTM | Bug chỉ mô tả **một chiều**; RTM tính test **skip** là đạt | Reviewer thử chiều ngược lại; sửa TC-028 kiểm 2 chiều; thử làm sai dữ liệu để RTM báo |
| 9 | 2026-11-25 | Code test SD-102 | Viết Page Object + 45 test | Test **chỉ chờ URL**: trên CI bấm Back khi trang chưa đổi (TC-043 fail), test đọc nhầm nút của trang cũ mà vẫn pass (TC-022) | Tái hiện bằng CPU giả lập chậm; Page Object tự chờ phần tử riêng của trang đích |
| 10 | 2026-11-25 | Test bug đã biết (`test.fail()`) | – | `test.fail()` tính **mọi lỗi** là "fail như mong đợi": test hết giờ (TC-024), lỗi biến chưa khai báo (TC-025), ảnh evidence treo 120 giây (TC-018) đều bị che | Đọc từng dòng lỗi; thêm `typecheck`, cảnh báo tự động trong `test:run` và evidence (đã thử bằng lỗi cố tình) |
| 11 | 2026-11-25 | Lưu thêm dữ liệu vào kết quả chạy | Thêm `annotations` vào run JSON | Playwright tự gắn **đường dẫn máy** (`location.file`) vào mỗi annotation, suýt bị commit | Quét thông tin cá nhân trước khi commit; script chỉ giữ trường cần, thay đường dẫn repo bằng `<repo>` |
| 12 | 2026-11-25 | Kiểm lại phát hiện của reviewer | Thử tái hiện lỗi console của `error_user` | AI kết luận vội "không tái hiện được" vì chỉ nghe sự kiện `console`, trong khi lỗi là `pageerror` | Người dùng yêu cầu trao đổi lại với reviewer; reviewer kiểm 3 lần, AI kiểm lại: đúng là `pageerror` |
| 13 | 2026-11-25 | Bug report SD-102 (BUG-21) | Báo lỗi console của `error_user` ở trang chi tiết | AI ghi "giao diện vẫn đúng", chấm Low; thực tế **mất mô tả sản phẩm**. Cũng gọi ảnh do script chụp là "tái hiện bằng tay" | Review cuối so với `standard_user` phát hiện; người dùng nâng Medium; TC-046 kiểm thêm mô tả; đổi tên "tái hiện độc lập", lưu script trong repo |
| 14 | 2026-11-25 | Test BUG-01 (SD-101 TC-028) | Viết assertion kiểm ô bị đánh dấu lỗi | Kiểm class `input_error`, class này **luôn có sẵn** trên ô nhập: bước kiểm ô lỗi luôn đúng, bước kiểm ô không lỗi luôn sai, test fail "đúng như dự kiến" vì lý do sai suốt từ Bài 4 | qa-reviewer phát hiện khi review test case SD-103; người dùng cho sửa; đổi sang class `error` + đếm icon, thêm bước đối chứng, bài học L15 |

---

## Chi tiết

### #1: Thiết kế pipeline: không ghép máy móc
- **Bối cảnh**: có 2 bộ agent: pipeline QA của repo v1 (5 agent, 3 HITL, RTM) và 3 agent có sẵn của Playwright (planner, generator, healer).
- **AI đề xuất lần đầu**: ghép cả hai thành 7 bước.
- **Vấn đề**: khi được yêu cầu cân nhắc lại, AI chỉ ra `generator` chỉ đọc kế hoạch dạng Markdown của `planner`, không đọc `test-cases.csv`. `planner` trùng vai với `test-design`. `healer` của Playwright tự `test.fixme()` nên giẫm lên bước phân loại lỗi.
- **Quyết định**: giữ khung QA của v1, chỉ lấy **công cụ** Playwright MCP gắn vào các agent cần trình duyệt.
- **Bài học**: hỏi AI "phương án này có hiệu quả không?" thường lộ ra vấn đề mà lần trả lời đầu bỏ qua.

### #2: AI dùng công cụ chưa được cài
- **Chuyện xảy ra**: hướng dẫn của `script-gen` bảo kiểm tra code bằng `npx tsc`. Dự án không cài TypeScript compiler, nên `npx` tải nhầm một package tên `tsc` đã bị bỏ, không liên quan.
- **Xử lý**: đổi sang `npx playwright test --list`, lệnh này tự biên dịch TypeScript.
- **Bài học**: AI hay giả định môi trường có sẵn công cụ. Luôn **chạy thử** hướng dẫn AI viết ra.

### #4: Báo nhầm bug khi khám phá
- **Chuyện xảy ra**: script khám phá dùng **chung một phiên trình duyệt** cho mọi tình huống và chờ cố định 300 ms. Kết quả: `performance_glitch_user`, `error_user`, `visual_user` "không đăng nhập được", và thông báo lỗi cũ dính sang bước sau.
- **Kiểm chứng**: chạy lại, mỗi tình huống một phiên sạch, chờ theo điều kiện (URL đổi hoặc lỗi hiện ra). Cả 5 user đều đăng nhập được. `performance_glitch_user` chỉ chậm (khoảng 5,1 giây).
- **Phân loại**: `script-issue` (false positive), **không** phải bug của web.
- **Bài học**: test phải độc lập (lời dặn số 7). Trước khi báo bug, nghi script của mình trước.

### #5: Test xanh mà không kiểm tra gì
- **Chuyện xảy ra**: `tests/seed.spec.ts` do Playwright tạo sẵn không có bước nào nhưng vẫn **pass**, nên CI xanh mà không test gì.
- **Xử lý**: đổi thành smoke check (mở trang, kiểm tra tiêu đề và nút Login). Chạy với `BASE_URL=https://example.com` thì test **fail đúng như mong đợi**.
- **Bài học**: lời dặn số 4: test không thể fail là test vô dụng.

### #6: AI bỏ sót ở bước trước, chỉ lộ ra khi review lại
- **Chuyện xảy ra**: sau khi chốt HITL #1, người duyệt yêu cầu review lại toàn bộ theo góc nhìn QC Lead. AI phát hiện chính nó đã bỏ sót: **tự tạo cookie là vượt qua được đăng nhập** (lỗi bảo mật, vi phạm AC-6), 4 viewpoint (đăng nhập lại, thử lại sau lỗi, tải lại trang, trang có tham số URL), 2 file câu hỏi trùng nhau, và ghi sai kỹ thuật "BVA" cho TC không có biên.
- **Xử lý**: bổ sung viewpoint, test case, phiếu Q&A gộp, `known-issues.md`. Thêm agent `qa-reviewer` chạy **sau mỗi bước, trước HITL**.
- **Bài học**: AI làm một lượt thường **thiếu chiều sâu ở các luồng chuyển trạng thái và bảo mật**. Một vòng review riêng, có checklist, bắt được nhiều hơn hẳn.

### #7: Lệnh chạy evidence không chạy test nào mà không ai để ý
- **Chuyện xảy ra**: `npm run test:evidence -- -g "TC-028|TC-033"` trên Windows bị cmd cắt ở dấu `|` (hiểu là "nối lệnh"), nên **0 test chạy**. Script vẫn tạo lại mục lục evidence như bình thường, AI chỉ đọc vài dòng cuối nên suýt báo "đã chụp lại xong".
- **Nguyên nhân gốc**: script gọi `npx` qua shell (`shell: true`). Ký tự đặc biệt `| & < > ^` bị shell xử lý trước khi tới Playwright.
- **Xử lý**: gọi thẳng Playwright bằng Node, **không qua shell**, nên tham số đi nguyên vẹn trên mọi hệ điều hành. Thêm cảnh báo khi exit code khác 0 (có test fail hoặc không có test nào chạy).
- **Bài học**: sau mỗi lần chạy, **đối chiếu số test đã chạy với số dự kiến** (chọn 2 TC thì phải thấy "2 passed"). Không thấy dòng đó thì chưa được kết luận gì.

### #8: Bug report chỉ mô tả một chiều của bug
- **Chuyện xảy ra**: AI viết BUG-01 là "thiếu Password thì ô Username cũng bị tô đỏ". qa-reviewer thử chiều ngược lại (thiếu Username) và thấy **ô Password cũng bị tô đỏ**. Nếu dev chỉ sửa một chiều, TC-028 sẽ pass dù bug vẫn còn. Reviewer cũng bắt được lỗi trong script RTM: TC bị **skip** vẫn được tính là AC "Đạt", tức là RTM có thể che việc dùng `test.skip` để giấu bug.
- **Xử lý**: tái hiện lại cả 2 chiều, lưu ảnh vào `manual/`, viết lại BUG-01. Người duyệt chọn sửa TC-028 để kiểm tra **cả 2 chiều** thay vì thêm TC mới, evidence chụp lại cả 2 chiều. Sửa script RTM: skip / flaky / chưa chạy thì AC hiện "Cần xem lại", có cảnh báo khi số TC lệch. Kiểm chứng bằng cách cố tình làm sai dữ liệu chạy (skip 1 TC, xóa 1 TC) và xem RTM có báo không.
- **Bài học**: tìm thấy bug thì **thử các biến thể** (chiều ngược lại, dữ liệu khác, trang khác) trước khi viết report. Báo cáo tổng hợp cũng phải "có thể fail": thử làm sai đầu vào xem nó có báo không.

### #9: Test chỉ chờ URL, đọc nhầm trang cũ
- **Chuyện xảy ra**: SD-102 TC-043 pass trên máy nhưng fail cả 3 lần trên CI. Ảnh lúc fail cho thấy trang giỏ vẫn còn, menu còn mở. qa-reviewer tìm thêm: TC-022 sau khi bấm "Back to products" đọc nút Add/Remove **của trang chi tiết** (trang cũ còn trên màn hình), nên test pass mà không kiểm được gì.
- **Nguyên nhân gốc**: SauceDemo đổi trang phía trình duyệt: URL đổi trước, trang mới hiện sau một chút. Test chỉ chờ URL. Thêm nữa `data-test="inventory-item"` có ở **cả 3 trang**, nên dùng nó làm mốc thì trang nào cũng "đúng".
- **Kiểm chứng**: giả lập CPU chậm 8 lần: không chờ trang đích thì 5/10 lần lỗi, có chờ thì 0/10.
- **Xử lý**: mọi method đổi trang trong Page Object tự chờ phần tử **chỉ trang đích mới có** (`cart-list`, `inventory-list`, nút Login). Quy tắc ghi vào `script-gen.md`, `CLAUDE.md`, `qa-reviewer.md`. Cũng sửa SD-101 TC-006: ngưỡng chờ 10 giây áp cho cả bước chờ tiêu đề, không chỉ bước chờ URL.
- **Bài học**: "pass trên máy mình" chưa đủ. Test có chuyển trang phải chạy lặp nhiều lần, và tự hỏi "nếu web sai thì test này có đỏ không?".

### #10: `test.fail()` che lỗi của chính code test
- **Chuyện xảy ra**: test bug đã biết được đánh dấu `test.fail()`. Playwright coi **mọi** lỗi là "fail như mong đợi", kể cả lỗi của code test. Ba lần bị che: TC-024 hết giờ nên 5/12 biến thể chưa từng chạy; sau khi sửa, một biến bị xóa sót gây `ReferenceError` ở TC-025; khi chụp evidence, TC-018 chờ khoanh đỏ một nút không tồn tại tới hết 120 giây, chỉ chụp được 1/12 ảnh.
- **Phát hiện**: đọc **từng dòng lỗi** trong kết quả chạy, không chỉ con số "16 bug fail như dự kiến".
- **Xử lý**: cài TypeScript, thêm `npm run typecheck` (cả trên CI); `test:run` và chế độ evidence tự cảnh báo khi test bug đã biết có lỗi giống lỗi code test (đã thử bằng cách cố tình gây lỗi); evidence chờ phần tử cần khoanh tối đa 1 giây. Sửa lại ghi chú ở #2: nay dự án đã cài TypeScript nên `npx tsc` dùng được.
- **Bài học**: con số tổng có thể đúng mà lý do sai. Với test bug đã biết, phải đọc **lỗi nằm ở đâu**.

### #11: Dữ liệu mới kéo theo đường dẫn máy
- **Chuyện xảy ra**: để triage trích được giá trị thật (Expected / Received) và thời gian BUG-17, AI cho `run-tests.mjs` lưu thêm `annotations`. Playwright tự thêm `location.file` vào mỗi annotation: đường dẫn tuyệt đối trên máy đang chạy, có cả tên người dùng của máy.
- **Phát hiện**: bước quét thông tin cá nhân trước khi commit (36 chỗ trong 1 file kết quả).
- **Xử lý**: script chỉ giữ `type` và `description`, thay đường dẫn repo trong nội dung lỗi bằng `<repo>`; làm sạch file kết quả đã tạo.
- **Bài học**: mỗi khi lưu **thêm trường** từ công cụ bên ngoài, giả định nó có thể chứa thông tin máy. Chỉ giữ trường cần, và luôn quét trước khi commit.

### #12: Kết luận "không tái hiện được" vì nghe nhầm loại sự kiện
- **Chuyện xảy ra**: review đề xuất ghi lại câu lỗi `Failed to add item to the cart.` của `error_user`. AI thử bằng `page.on('console')`, không thấy, nên ghi "không tái hiện được, không làm".
- **Kiểm soát**: người dùng không chấp nhận ngay, yêu cầu trao đổi lại với qa-reviewer. Reviewer kiểm 24 tình huống × 3 lần: lỗi có thật, nhưng là **lỗi JavaScript không được bắt** (`pageerror`), không phải thông báo console. DevTools in cả hai loại ở tab Console nên khi xem bằng tay rất dễ nhầm.
- **Xử lý**: thêm MSG-05, MSG-06; TC-019 ghi lại `pageerror` làm bằng chứng; sửa O-23, BUG-13 cho đúng loại lỗi.
- **Bài học**: "không tái hiện được" là một kết luận cần bằng chứng như mọi kết luận khác: ghi rõ đã thử **cách nào**, và nghĩ xem cách thử đó có thể bỏ sót gì.

### #13: "Giao diện vẫn đúng" mà chưa so với tài khoản chuẩn
- **Chuyện xảy ra**: review bug report thấy `error_user` có lỗi console khi mở trang chi tiết. AI tách thành BUG-21, ghi "lỗi ngầm, giao diện vẫn đúng" nên đề xuất Low. Review cuối đặt ảnh cạnh `standard_user`: trang chi tiết của `error_user` **không có phần mô tả** ở cả 6 sản phẩm, vi phạm AC-5. Chính ảnh tái hiện của AI đã cho thấy điều này nhưng không ai so.
- **Lỗi kéo theo**: test dương tính TC-032 chỉ kiểm URL và tên ở trang chi tiết nên vẫn pass (bỏ sót, false negative).
- **Xử lý**: người dùng nâng BUG-21 lên Medium; TC-046 kiểm mô tả, giá, lỗi console, request báo lỗi; hàm kiểm trang chi tiết kiểm mặc định cả mô tả, giá; thêm bài học L12 cho qa-reviewer.
- **Cùng đợt**: ảnh "tái hiện bằng tay" thật ra do một script chưa lưu chụp. Đổi tên thành "tái hiện độc lập", lưu script vào `tests/repro/`, ai cũng chạy lại được (`npm run repro -- <feature>`).
- **Bài học**: kết luận về giao diện phải dựa trên **so sánh với chuẩn**, từng trường mà AC liệt kê. Gọi đúng tên việc mình đã làm (script khác bằng tay).

### #14: Oracle luôn đúng / luôn sai mà không ai thấy
- **Chuyện xảy ra**: từ Bài 4, TC-028 (BUG-01) kiểm ô bị đánh dấu lỗi bằng class `input_error`. Thực tế ô nhập của SauceDemo **luôn** có class này, kể cả khi chưa lỗi; trạng thái lỗi thêm class `error` và icon ✕. Vì vậy bước "ô thiếu bị đánh dấu" luôn đúng (vô nghĩa), bước "ô đã nhập không bị đánh dấu" luôn sai: test fail đúng như dự kiến nhưng **vì lý do sai**, và sẽ fail mãi kể cả khi bug được sửa. Cả bug report, triage, ảnh tái hiện và ví dụ trong `script-gen.md` đều ghi theo.
- **Phát hiện**: qa-reviewer khi review test case SD-103 (cùng kiểu form) so class **trước và sau** khi bấm.
- **Xử lý**: TC-028 kiểm class `error` (nguyên từ) + số icon ✕, có bước đối chứng "trước khi bấm: không ô nào bị đánh dấu"; sửa tài liệu SD-101 và ví dụ trong agent; bài học L15. BUG-01 vẫn là bug thật.
- **Bài học**: assertion fail chưa chắc đã đúng. Oracle phải được chứng minh là **phân biệt được** đúng / sai (có trường hợp đối chứng), nhất là với test `test.fail()`.

