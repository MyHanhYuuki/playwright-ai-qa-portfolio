> Tiến độ: ✅ Hoàn tất

# Review: test-design, saucedemo-products-cart-screen (SD-102)

- **Ngày**: 2026-11-24 · **Reviewer**: qa-reviewer (vai QC Lead, theo ISTQB) · **Kết luận**: ⚠️ **Cần sửa trước HITL #1**
- **Phạm vi**: `requirement/requirement.md`, `spec-review.md`, `viewpoint.csv`, `q-and-a.md`, `known-issues.md`, `improvements.md`. Đối chiếu mẫu `qa-runs/saucedemo-login-screen/` và `knowledge-base/q-and-a-archive.md`.
- **Kiểm chứng trên web**: Chromium, mỗi tình huống một phiên trình duyệt sạch, chờ URL / phần tử của trang đích trước khi đọc. Đã chạy lại O-04, O-08, O-09, O-16, O-17, O-18, O-24, O-25: **khớp** với `spec-review.md`.
- **Tóm tắt**: 0 🔴 · 9 🟠 · 18 🟡. Đánh số BUG-05 → BUG-17 nối tiếp đúng sau SD-101. Vấn đề chính: tài khoản đặc biệt mới được thử ở **trang danh sách**, chưa thử đủ ở trang chi tiết và trang giỏ (A1, A2); thiếu viewpoint kiểm soát truy cập và `locked_out_user` (B1, B2); BR-2 ghi hành vi lỗi thành quy tắc nghiệp vụ (C1).

## A. Phát hiện mới (đã kiểm chứng trên web)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | `problem_user` và `error_user`: ở **trang chi tiết**, `Remove` **không có tác dụng** với Backpack, Bike Light, Onesie (nút vẫn `Remove`, số giỏ không giảm, `cart-contents` không đổi). `Add to cart` ở trang chi tiết cũng không có tác dụng với Bolt T-Shirt, Fleece Jacket, Red T-Shirt **của cả `problem_user`** (O-20 không nói tới trang chi tiết; O-23 chỉ nói Add lỗi ở chi tiết, bỏ sót Remove) | Mở thẳng `?id=0…5`, bấm nút 2 lần: id 0, 2, 4 → `[0]`, `[0,2]`, `[0,2,4]` giữ nguyên sau khi bấm `Remove`; id 1, 3, 5 bấm `Add to cart` không đổi. Giống nhau ở 2 tài khoản | 🟠 | Bổ sung O-20, O-23. BUG-10, BUG-13 ghi rõ **3 nơi**: danh sách (lỗi), chi tiết (lỗi), giỏ (được). TVP-022 phủ cả trang chi tiết (R7: bug có biến thể thì TC phủ mọi biến thể) |
| A2 | `visual_user`: ngoài biểu tượng giỏ (O-25) còn **3 lệch bố cục chưa ghi**: (1) trang giỏ, nút **`Checkout` bị đẩy lên góc trên** (x 1060, y 0, vùng header) thay vì cạnh `Continue Shopping` (x 1045, y 412); (2) nút `Add to cart` của Red T-Shirt lệch phải 54 px (x 975 → 1029); (3) biểu tượng menu bị **xoay ~3°** (`transform: matrix(0.99863, 0.052336, …)`) ở cả 3 trang | So tọa độ `data-test` với `standard_user`, viewport 1280×720, chờ ảnh tải xong, lặp 2 lần cho kết quả giống nhau. Nút Checkout lệch vẫn bấm được | 🟠 | Bổ sung O-25. Tách bug cho nút Checkout (trang giỏ, AC-6), vd **BUG-18**; (2), (3) gộp làm biến thể của BUG-16. Q11 hỏi chung "lệch bố cục của `visual_user`", không chỉ biểu tượng giỏ. TVP-025 phủ cả trang giỏ |
| A3 | **Phiên giả mạo** vào được trang giỏ và trang chi tiết: tự tạo cookie `session-username=standard_user` rồi mở `/cart.html`, `/inventory-item.html?id=4` thì **vào được**. SD-101 TC-033 (BUG-02) chỉ kiểm `/inventory.html`. Cookie với tên lạ (`hacker`) hoặc `locked_out_user` thì bị chặn về `/` (web có danh sách tên hợp lệ); cookie `problem_user` vào được và nhận hành vi của `problem_user` | Phiên sạch, `addCookies` rồi mở thẳng URL | 🟠 | Ghi là **biến thể của BUG-02** (không cấp số mới). Thêm viewpoint (xem B1) hoặc bổ sung TC-033 của SD-101 phủ 3 trang. Ghi O-xx mới |
| A4 | Số trên giỏ **đếm thẳng độ dài mảng** `cart-contents`, không đếm sản phẩm thật: `[4,"x"]` → số **2**, giỏ 1 dòng; `[4,4]` → số 2, giỏ có **2 dòng Backpack** (mỗi dòng số lượng 1, trái BR-3) | Sửa `localStorage` rồi mở `/cart.html` | 🟡 | Cùng nguyên nhân với BUG-06: ghi thêm biến thể vào BUG-06 và context Q2. Thêm dữ liệu vào TVP-011 |
| A5 | `cart-contents` hỏng (không phải JSON, vd `abc`) → **cả 3 trang trắng**, console `SyntaxError: … is not valid JSON`. Menu không hiện nên không tự Logout / Reset được, chỉ xóa dữ liệu trình duyệt mới hết | Sửa `localStorage`, mở `/inventory.html`, `/cart.html`, `/inventory-item.html?id=4` | 🟡 | Thêm câu hỏi non-blocking (dữ liệu lưu hỏng thì xử lý thế nào). Đề xuất IMP: bỏ dữ liệu hỏng, coi như giỏ trống |
| A6 | Tham số `id` được đọc **dễ dãi**: `?id=04`, `4abc`, `4.9`, `0x4`, `%204` đều mở Backpack | Mở thẳng URL, chờ tên sản phẩm | 🟡 | Không chắc là bug. Thêm vào context Q2 (id sai định dạng thì 404 hay chấp nhận?) và các phân vùng của TVP-011 |
| A7 | Đã kiểm, **không thấy lỗi**: trang giỏ của `problem_user`, `error_user`, `visual_user`, `performance_glitch_user` (liệt kê, giá $29.99, Remove, Continue Shopping, Checkout đều đúng); Remove trong giỏ rồi Back / Forward của trình duyệt (danh sách về `Add to cart`, giỏ 0 dòng); đăng xuất ở trang giỏ rồi Back (bị chặn, thông báo `…'/cart.html' when you are logged in.`); sắp `hilo` khi có hàng trong giỏ (nút `Remove` đi theo đúng sản phẩm); Enter ở tên sản phẩm mở chi tiết | Phiên sạch từng tình huống | 🟡 | Đưa vào viewpoint làm phủ dương tính (B3, B4). Ghi O-xx để có nguồn |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Không có viewpoint kiểm soát truy cập** cho 3 trang của feature (có / không tham số URL, phiên giả mạo). Checklist test-design yêu cầu. SD-101 đã phủ chưa đăng nhập (TC-023 `/inventory.html`, TC-024 `/cart.html`, TC-032 `/inventory-item.html?id=4`) nhưng phiên giả mạo chỉ phủ `/inventory.html` (TC-033) | `viewpoint.csv` không có dòng nào về truy cập; A3 | 🟠 | Thêm 1 dòng `scope=out` "chưa đăng nhập vào 3 trang: đã phủ ở SD-101 TC-023/024/032" và 1 dòng `scope=in` "phiên giả mạo vào `/cart.html`, `/inventory-item.html?id=4`" (BUG-02, A3) |
| B2 | **`locked_out_user` không xuất hiện** ở viewpoint, Q1, spec-review dù ticket ghi "dùng lại 6 tài khoản" | Q1 chỉ nêu 4 tài khoản đặc biệt; `viewpoint.csv` không có | 🟠 | Thêm dòng `scope=out` có lý do: không đăng nhập được (SD-101 TC), cookie giả `locked_out_user` bị chặn (A3) |
| B3 | Luồng chuyển trạng thái mới phủ **Back từ chi tiết** (TVP-010). Thiếu: thay đổi giỏ rồi Back / Forward; đăng xuất ở trang giỏ / chi tiết rồi Back; sắp xếp khi giỏ có hàng (nút đúng sản phẩm); 2 tab đang mở cùng lúc (TVP-016 chỉ nói "mở tab mới") | `viewpoint.csv`; A7 | 🟠 | Thêm 2–3 TVP `flow`. Đăng xuất rồi Back ở trang giỏ là biến thể của SD-101 TVP-015 (mới kiểm trang danh sách) |
| B4 | Tài khoản đặc biệt chỉ có viewpoint ở **chỗ đã thấy lỗi**. Thiếu ma trận tài khoản × trang × thao tác: Add / Remove ở trang chi tiết (A1), trang giỏ của tài khoản đặc biệt (A7, đang đúng nên cần TC dương tính để phát hiện hồi quy), bố cục trang giỏ của `visual_user` (A2), ảnh / dữ liệu của `error_user`, `performance_glitch_user` | TVP-020 → TVP-026 | 🟠 | Lập bảng ma trận trong `spec-review.md` (5 tài khoản × 3 trang × xem / sắp / thêm / bỏ / mở chi tiết), đánh dấu ô đã thử. Viewpoint sinh ra từ bảng |
| B5 | Phân vùng dữ liệu của tham số `id` và của `cart-contents` chưa tách: TVP-011 gộp mọi id sai thành 1 dòng; không có dòng cho dữ liệu lưu bị sửa / hỏng | O-08 thử `6`, `99`, `-1`, `abc`, rỗng; A4, A5, A6 | 🟡 | Tách EP: id hợp lệ 0–5 / ngoài khoảng / không phải số / số kèm ký tự (A6). Thêm TVP Error Guessing cho `cart-contents` sửa tay, `scope` theo câu trả lời |
| B6 | Thiếu O-xx cho các điều đã thấy mà chưa ghi: liên kết tên và ảnh sản phẩm có `href="#"` (không mở tab mới, không chia sẻ được link) | Thuộc tính `href` của `item-4-title-link`, `item-4-img-link` | 🟡 | Ghi O-xx, gắn vào TVP-033 (accessibility, `scope=out`) hoặc IMP mới |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | **BR-2 ghi hành vi lỗi thành quy tắc nghiệp vụ**: "Giỏ hàng … **không gắn với tài khoản**". Mâu thuẫn với đề xuất Q3 và BUG-07. BR-3 "số lượng luôn là 1" cũng sai với dữ liệu sửa tay (A4). test-impl có thể lấy BR làm expected | `spec-review.md` mục Business Rules | 🟠 | BR chỉ ghi điều rút ra từ requirement. Chuyển BR-2, BR-3 thành "hành vi hiện tại (O-14, O-16), chờ Q3" |
| C2 | Giỏ trống + Checkout có **3 cách xử lý khác nhau**: Q5 đề xuất "ghi bug Low", nhưng `known-issues.md` không có BUG nào cho nó; IMP-03 lại coi "khóa nút Checkout" là cải tiến; TVP-015 `in` không có expected, TVP-031 `out` | `q-and-a.md` Q5, `improvements.md` IMP-03, `viewpoint.csv` TVP-015/031 | 🟠 | Chốt 1 hướng trong đề xuất Q5: hoặc bug (giữ chỗ `BUG-xx` "chờ Q5" trong `known-issues.md`), hoặc cải tiến (bỏ "ghi bug" khỏi Q5). IMP-03 chỉ giữ phần thông báo nếu khóa nút thành bug |
| C3 | Q1 cột "Ảnh hưởng" ghi "~9 bug (BUG-08 → BUG-16)", `known-issues.md` ghi "BUG-08 → BUG-17 phụ thuộc Q1". "~10 TC" không rõ đếm thế nào | `q-and-a.md` Q1; `known-issues.md` dòng ghi chú | 🟡 | Thống nhất BUG-08 → BUG-17 (10 bug, BUG-17 phụ thuộc thêm Q10). Liệt kê TVP thay cho "~10 TC" |
| C4 | `known-issues.md` cột "Test phải bắt" không ghi TVP. Ánh xạ BUG ↔ TVP phải tự suy | BUG-05 ↔ TVP-019, BUG-06 ↔ TVP-011, BUG-07 ↔ TVP-018, BUG-08 ↔ TVP-020, BUG-09/12 ↔ TVP-021, BUG-10/13 ↔ TVP-022, BUG-11 ↔ TVP-023, BUG-14 ↔ TVP-024, BUG-15/16 ↔ TVP-025, BUG-17 ↔ TVP-026 | 🟡 | Thêm TVP id vào cột "Test phải bắt" (test-impl điền TC id sau) |
| C5 | Cùng một kiểm tra "ảnh sản phẩm đúng" nhưng khác trục và mức: `problem_user` ở TVP-020 (`data`, medium), `visual_user` ở TVP-025 (`non-functional`, low, gộp với vị trí biểu tượng giỏ) | `viewpoint.csv` | 🟡 | 1 TVP "ảnh đúng với mọi tài khoản" (`data`). TVP-025 chỉ còn bố cục (A2). Mỗi viewpoint một mục đích |
| C6 | IMP-06 ghi nguồn Q2 nhưng Q2 và O-08 không nhắc IMP-06 | `improvements.md` IMP-06; `q-and-a.md` Q2 | 🟡 | Thêm "IMP-06" vào đề xuất Q2 và ghi chú O-08 |
| C7 | TVP-032, TVP-033 (`scope=out`, menu / accessibility) gắn `linked_ac=AC-1`. RTM sẽ hiện AC-1 có viewpoint ngoài phạm vi không liên quan nội dung AC-1 | `viewpoint.csv` | 🟡 | Để `linked_ac` là `-` hoặc ghi nguồn "ticket: Ngoài phạm vi" giống cách SD-101 xử lý viewpoint ngoài phạm vi |
| C8 | `tests/data/products.ts` (mới, chưa commit) đã viết `sortOrders` theo **đề xuất Q6** ("Same price → by name A→Z (Q6)") trong khi Q6 còn `Open`. `known-issues.md` lưu ý 3 trỏ tới file này | Comment trong `tests/data/products.ts` | 🟡 | Ghi rõ trong Q6 "Ảnh hưởng": nếu trả lời khác thì sửa `sortOrders`. Không tạo dữ liệu test trước HITL #1 (việc của test-impl) |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | Lưu ý 6 sai về Playwright: "nếu không bắt hộp thoại thì test sẽ treo". Thực tế Playwright **tự đóng** (dismiss) hộp thoại khi không có `page.on('dialog')` | `known-issues.md` lưu ý 6 | 🟡 | Sửa: phải bắt hộp thoại để **kiểm nội dung** `Sorting is broken!…`; không bắt thì test vẫn chạy nhưng bỏ sót bằng chứng BUG-12 |
| D2 | TVP-018 gắn AC-7 nhưng AC-7 chỉ nói "giữ giỏ khi tải lại / chuyển trang", không nói giỏ theo tài khoản. Expected đến từ Q3, không từ AC | `viewpoint.csv` TVP-018 | 🟡 | Ghi rõ `source` có Q3 (đã có) và trong spec-review đánh dấu đây là yêu cầu bổ sung từ Q&A, để RTM không hiểu là AC-7 bị vi phạm khi Q3 trả lời "theo trình duyệt" |
| D3 | TVP-021 gộp `problem_user` (lỗi im lặng) và `error_user` (hộp thoại) dù 2 bug, 2 cách kiểm khác nhau (BUG-09, BUG-12). Tương tự TVP-022 (BUG-10, BUG-13) | `viewpoint.csv` | 🟡 | Chấp nhận gộp ở mức viewpoint, nhưng ghi chú để test-impl tách TC theo từng tài khoản, mỗi TC một bug |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Lỗi khám phá do đọc trang quá sớm vẫn dễ lặp lại: khi reviewer chạy thử, `goBack()` ngay sau `waitForURL` (trang chi tiết chưa vẽ xong) cho kết quả **giả** "giữ kiểu sắp xếp"; chờ tên sản phẩm hiện rồi mới Back thì đúng như O-04 | Lần chạy kiểm chứng O-04 | 🟡 | Đưa vào hướng dẫn test-design: sau mỗi lần chuyển trang phải chờ **phần tử riêng của trang đích**, không chỉ URL. Mỗi quan sát lạ chạy lại ≥2 lần |
| E2 | Tài khoản đặc biệt bị bỏ sót biến thể (A1, A2) vì khám phá đi theo triệu chứng, không theo ma trận | B4 | 🟡 | Thêm vào checklist test-design: với tài khoản có hành vi đặc biệt, **thử mọi thao tác trên mọi trang** và ghi bảng ma trận. Thêm vào checklist qa-reviewer |
| E3 | Mỗi feature có trang bên trong đều phải quyết định lại về kiểm soát truy cập | B1 | 🟡 | Mẫu `viewpoint.csv` luôn có sẵn dòng "kiểm soát truy cập + phiên giả mạo" (`in`, hoặc `out` trỏ tới TC đã có) để không quên |

## Xử lý sau review (2026-11-24)
**Kiểm chứng lại:** chạy lại A1, A2 (nút Checkout), A3, A4, A6 trên web, phiên sạch: **cả 5 khớp** với review. A5, A7 không chạy lại (A5 cùng cơ chế với A4; A7 là kết quả không lỗi). Không thấy điểm nào của review sai.

| # | Xử lý |
|---|---|
| A1 | ✅ O-20, O-23 thêm trang chi tiết; BUG-10, BUG-13 ghi rõ lỗi ở danh sách và chi tiết, bỏ ở giỏ thì được; TVP-022 phủ cả 2 trang |
| A2 | ✅ O-29 + **BUG-18** (nút Checkout của `visual_user`); nút Add lệch, menu xoay gộp vào BUG-16; Q11 hỏi chung lỗi bố cục; TVP-025 phủ cả trang giỏ |
| A3 | ✅ O-30, biến thể **BUG-02** (không cấp số mới), TVP-037 |
| A4, A6 | ✅ O-31, O-33; biến thể BUG-06; context Q2; TVP-035, TVP-036 |
| A5 | ✅ O-32, Q14 (non-blocking), IMP-07 |
| A7 | ✅ O-34; viewpoint dương tính TVP-034, TVP-040 → TVP-042; TVP-008 thêm bàn phím |
| B1, B2 | ✅ TVP-037 (`in`), TVP-038 (`out`, trỏ SD-101 TC-023/024/032), TVP-039 `locked_out_user` (`out`) |
| B3 | ✅ TVP-040 → TVP-043 (Back/Forward, đăng xuất rồi Back, sắp xếp khi có hàng, 2 tab) |
| B4 | ✅ Bảng ma trận tài khoản × trang × thao tác trong `spec-review.md` |
| B5 | ✅ Tách TVP-011 (id ngoài khoảng), TVP-035 (id sai định dạng), TVP-036 (dữ liệu giỏ sửa tay / hỏng) |
| B6 | ✅ O-35, IMP-08, TVP-033 |
| C1 | ✅ Business Rules chỉ còn BR-1; hành vi giỏ hiện tại ghi riêng "chờ Q2, Q3" |
| C2 | ✅ Chốt 1 hướng: khóa Checkout khi giỏ trống là **BUG-19** (chờ Q5); IMP-03 chỉ còn thông báo giỏ trống; TVP-015 có expected |
| C3 | ✅ Q1 ghi BUG-08 → BUG-18 và liệt kê viewpoint |
| C4 | ✅ Cột "Viewpoint phải bắt" trong `known-issues.md` |
| C5 | ✅ TVP-020 = ảnh của mọi tài khoản; TVP-025 chỉ còn bố cục |
| C6 | ✅ Q2 và O-08 nhắc IMP-06 |
| C7 | ✅ TVP-032, TVP-033, TVP-039 `linked_ac` = `-` |
| C8 | 🟡 Một phần: `tests/data/products.ts` **chưa commit**, giữ lại; Q6 ghi rõ trả lời khác thì phải sửa `sortOrders` |
| D1 | ✅ Lưu ý 7: Playwright tự đóng hộp thoại; phải bắt để kiểm nội dung |
| D2 | ✅ spec-review AC-7 và TVP-018 ghi rõ là yêu cầu bổ sung từ Q3 |
| D3 | ✅ Lưu ý 2 trong `known-issues.md` + ma trận: test-impl tách TC theo tài khoản |
| E1, E2, E3 | ✅ Thêm vào `.claude/agents/test-design.md` (chờ phần tử trang đích, chạy lại ≥ 2 lần, ma trận, dòng kiểm soát truy cập) và checklist test-design của `qa-reviewer.md` |
