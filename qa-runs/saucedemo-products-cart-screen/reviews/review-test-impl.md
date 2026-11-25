> Tiến độ: ✅ Hoàn tất

# Review: test-impl, saucedemo-products-cart-screen (SD-102)

- **Ngày**: 2026-11-25 · **Reviewer**: qa-reviewer (vai QC Lead, theo ISTQB) · **Kết luận**: ⚠️ **Cần sửa trước HITL #2**
- **Phạm vi**: `test-cases.csv` (45 TC, `draft`), `test-data.md`, `tests/data/products.ts`. Đối chiếu `requirement.md`, `spec-review.md` (kể cả ma trận), `viewpoint.csv`, `q-and-a.md`, `known-issues.md`, `improvements.md`, `review-test-design.md`, mẫu `qa-runs/saucedemo-login-screen/`.
- **Phủ**: 37/37 viewpoint `scope=in` có ≥ 1 TC. 17/17 bug (BUG-05 → BUG-20 + biến thể BUG-02) có TC bắt, expected theo câu trả lời Q&A. Mọi ô ❌ của ma trận có TC. Thứ tự sắp xếp ở TC-006 → TC-009 khớp `sortOrders` trong `products.ts` (cùng giá $15.99: Bolt trước Red ở cả 2 chiều, theo Q6). Không có mật khẩu thật trong TC. Mọi mã TD / MSG được tham chiếu đều có trong `test-data.md`.
- **Kiểm chứng trên web** (Chromium, 1280×720, mỗi tình huống một context mới, chờ phần tử riêng của trang đích, mỗi tình huống chạy 2 lần, kết quả 2 lần giống nhau). **Khớp với TC**: `?id=99` hiện đúng chữ `ITEM NOT FOUND` (MSG-03) và vẫn có nút `Add to cart`; `?id=4.9`, `?id=0x4` mở Backpack, `abc` và rỗng hiện `ITEM NOT FOUND`; đăng xuất ở trang chi tiết rồi Back → `/` với `…'/inventory-item.html' when you are logged in.` (không có `?id`); 2 tab (TC-044): tab B bấm biểu tượng giỏ thấy số 1 và dòng Backpack, tải lại vẫn đúng, nên expected thực tế được; `visual_user` giá sai cả 6 sản phẩm, khác nhau mỗi lần tải, trang giỏ vẫn $29.99; tọa độ bố cục ổn định qua 2 lần (biểu tượng giỏ 1034,39 so với 1220,10; nút Add Red 1029 so với 975; Checkout 1060,0 so với 1045,412, `standard_user` Checkout và Continue Shopping cùng y 412); `problem_user` bấm Add ở Bolt T-Shirt thì không có nút Remove và không có số giỏ; id, giá, khóa ảnh của TD-06 đúng; trang giỏ có `Your Cart`, `QTY`, `Description`.
- **Tóm tắt**: 0 🔴 · 8 🟠 · 18 🟡. Vấn đề chính: thiếu biến thể bug (A1, A2, B1, B2), TC-018/TC-019 không chạy được hết biến thể như đang viết (D1), cách đo xoay biểu tượng ở TC-035 sẽ cho kết quả PASS sai (D2), TC-027 so mô tả với dữ liệu không tồn tại (C1), thiếu cột `screen` theo quy ước mới (D9).

## A. Phát hiện mới (đã kiểm chứng trên web)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | `problem_user`: bấm **ảnh** sản phẩm cũng mở sai chi tiết, lệch giống hệt khi bấm tên (O-21). TC-024 chỉ bấm **tên**, bỏ sót biến thể ảnh của BUG-11, dù TVP-008 tách "bằng tên, bằng ảnh" | Bấm `item-<id>-img-link`, chờ `back-to-products`: ảnh Backpack (id 4) → `?id=5` Fleece Jacket; Bike Light (0) → id 1; Bolt (1) → id 2; Onesie (2) → id 3; Red (3) → id 4; Fleece (5) → id 6 `ITEM NOT FOUND`. 2/2 lần | 🟠 | TC-024: bấm cả tên và ảnh của 6 sản phẩm (`expect.soft`), expected URL `?id=<id đúng TD-06>` + tên đúng. Báo test-design bổ sung "tên và ảnh" vào O-21, BUG-11 |
| A2 | `visual_user`: BUG-16 **không chỉ ở danh sách**. Ở trang chi tiết và trang giỏ, biểu tượng giỏ cũng lệch (1034,39 so với 1220,10), biểu tượng menu (`.bm-icon`) cũng xoay. Ngoài ra **biểu tượng giỏ cũng bị xoay** (`.shopping_cart_container`), O-25 chưa ghi. TC-035 chỉ kiểm trang danh sách và chỉ nói xoay ở biểu tượng menu | Computed `transform` của `.bm-icon`, `.bm-cross`, `.shopping_cart_container` = `matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, 0)` (~3°) ở cả 3 trang; `standard_user` là `none`. 2/2 lần | 🟠 | TC-035 phủ 3 trang (danh sách, chi tiết `?id=4`, giỏ) bằng `expect.soft`: vị trí biểu tượng giỏ, không xoay biểu tượng menu và biểu tượng giỏ; nút Add Red chỉ ở danh sách. Báo test-design sửa O-25, BUG-16 ("Màn hình: Cả 3") |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | TC-026 thiếu 2 biến thể của BUG-20: `known-issues.md` liệt kê `4abc`, `04`, `4.9`, `0x4`, TC-026 và TD-08 chỉ có `abc`, rỗng, `4abc`, `04` | Web: `?id=4.9`, `?id=0x4` mở Sauce Labs Backpack (2/2 lần) | 🟠 | Thêm `4.9`, `0x4` vào TD-08 và bước của TC-026 (R7: TC phủ mọi biến thể) |
| B2 | TC-012 (`error_user`, BUG-12) chỉ thử `Price (high to low)`, trong khi TC-011 (`problem_user`) thử cả 3 kiểu. Lỗi xảy ra với cả 3 kiểu | Web: chọn `za`, `lohi`, `hilo` đều bật hộp thoại MSG-01, dropdown vẫn `Name (A to Z)`, sản phẩm đầu vẫn Backpack. 2/2 lần | 🟠 | TC-012 thử 3 kiểu (`expect.soft`), expected mỗi lần: không có hộp thoại, dropdown đúng kiểu đã chọn, thứ tự đúng `sortOrders` (TC-007 → TC-009) |
| B3 | Ô ✅ của tài khoản đặc biệt chưa có TC dương tính: `visual_user` "Sắp xếp ✅" (không TC nào); `visual_user` Add / Remove ở **trang chi tiết** (TC-033 chỉ ở danh sách); `performance_glitch_user` Add / Remove ở chi tiết, Remove ở trang giỏ, 3 kiểu sắp xếp còn lại (TC-034 chỉ `hilo` + Backpack ở danh sách); cột "Bố cục ✅" của `problem_user`, `error_user`, `performance_glitch_user` | Ma trận trong `spec-review.md`; TC-033, TC-034 | 🟡 | Bổ sung bước vào TC-033 (sắp theo tên A→Z / Z→A, vì giá sai; thêm / bỏ ở chi tiết) và TC-034. Cột bố cục: hoặc thêm vào TC dương tính, hoặc ghi rõ trong spec-review là chấp nhận không kiểm (lý do: chi phí so tọa độ) |
| B4 | TC-013 chỉ so giá Backpack giữa danh sách và chi tiết. TVP-024 và BUG-14 nói giá danh sách phải khớp **cả trang giỏ** | `viewpoint.csv` TVP-024; web: giỏ `visual_user` hiện $29.99 | 🟡 | Thêm bước: thêm Backpack, mở giỏ, giá dòng giỏ = $29.99 = giá ở danh sách |
| B5 | AC-5 yêu cầu chi tiết có "ảnh, tên, mô tả, giá giống ở danh sách". TC-020, TC-024 không kiểm **ảnh** ở trang chi tiết; TC-021 chỉ ghi "mở chi tiết Bike Light (id=0)", không nói kiểm gì | `test-cases.csv` cột `expected_result` TC-020, TC-021, TC-024 | 🟡 | Thêm "ảnh chứa khóa ảnh TD-06" vào TC-020; TC-021 ghi URL `?id=0` / `?id=2` + tên sản phẩm |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | TC-027 expected "mô tả, giá **đúng TD-06**" nhưng TD-06 và `products.ts` **không có mô tả**. TC-001 chỉ kiểm "mô tả không rỗng", TC-020 so mô tả trang với trang | `test-data.md` bảng TD-06 (id, tên, giá, khóa ảnh); `products.ts` type `Product` không có `description` | 🟠 | Thêm `description` (lấy từ `standard_user`) vào `products.ts` và TD-06, rồi dùng cho TC-001, TC-020, TC-027. Nếu không thêm thì sửa expected TC-027 cho đúng với dữ liệu có |
| C2 | `known-issues.md` ghi "Cột 'Viewpoint phải bắt': test-impl điền thêm TC id", nhưng chưa điền | Mọi dòng BUG-05 → BUG-20 chỉ có TVP | 🟡 | Điền TC: BUG-05 TC-041, BUG-06 TC-025, BUG-07 TC-040, BUG-08 TC-004, BUG-09 TC-011, BUG-10 TC-018, BUG-11 TC-024, BUG-12 TC-012, BUG-13 TC-019, BUG-14 TC-013, BUG-15 TC-005, BUG-16 TC-035, BUG-17 TC-034, BUG-18 TC-036, BUG-19 TC-030, BUG-20 TC-026, BUG-02 TC-045 |
| C3 | TC-008, TC-009 (sắp theo giá) chỉ gắn TVP-004. TVP-003 là "sắp xếp 4 kiểu", nhưng trên RTM chỉ có TC-006, TC-007, TC-010 (chỉ theo tên) | `test-cases.csv` cột `viewpoint_id` | 🟡 | `viewpoint_id` của TC-008, TC-009 = `TVP-003;TVP-004` |
| C4 | TC-034 có `BUG-17` ở cột `notes`. CLAUDE.md mục 5: TC có BUG thì test dùng `test.fail()`. BUG-17 lại phải **PASS** (Q10). script-gen dễ gắn nhầm `test.fail()` | `test-cases.csv` TC-034 `notes` | 🟡 | Ghi rõ trong `notes`: "KHÔNG dùng `test.fail()`, chỉ ghi lại thời gian (annotation)" |
| C5 | `spec-review.md` O-29 ghi `standard_user` Checkout ở y 392; `review-test-design.md` A2 và web đo được y 412 (cùng hàng Continue Shopping y 412). TC-036 so tương đối nên không sai, nhưng số liệu nguồn lệch | Web 2/2 lần: Checkout (1045, 412), Continue Shopping (15, 412) | 🟡 | Báo test-design sửa O-29 thành y 412 |
| C6 | TD-10 lặp SD-101 TD-08 nhưng thiếu domain / path; MSG-02 lặp SD-101 MSG-05 (đã có `MSG.notLoggedIn` trong `messages.ts`) | `test-data.md` TD-10, MSG-02 | 🟡 | TD-10 ghi đủ "domain `www.saucedemo.com`, path `/`" hoặc trỏ SD-101 TD-08; MSG-02 ghi "dùng `MSG.notLoggedIn(path)`" để script-gen không tạo hằng trùng |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | TC-018, TC-019 không chạy hết biến thể như đang viết. (1) Với Bolt, Fleece, Red, Add không có tác dụng nên **không có nút Remove**: bước 2 "Bấm 'Remove'" chờ hết timeout, là lỗi cứng chứ không phải `expect.soft`, test dừng ở biến thể đầu tiên. Có `test.fail()` thì test vẫn "đạt như dự kiến" nhưng các biến thể sau không được kiểm. (2) Remove ở danh sách không có tác dụng với Backpack, Bike Light, Onesie nên 3 sản phẩm này còn trong giỏ khi sang trang chi tiết, bước 1 "Bấm 'Add to cart'" không tìm thấy nút | Web: `problem_user` bấm `add-to-cart-sauce-labs-bolt-t-shirt` → `remove-sauce-labs-bolt-t-shirt` 0 phần tử, không có số giỏ (2/2 lần) | 🟠 | Viết lại bước để mỗi biến thể độc lập: kiểm Add bắt đầu từ giỏ trống; kiểm Remove bắt đầu từ giỏ đặt sẵn (`cart-contents` = `[<id>]` rồi tải lại); trước khi bấm thì kiểm chữ của nút bằng `expect.soft`, không có nút thì ghi lỗi và sang biến thể sau; xóa giỏ giữa phần danh sách và phần chi tiết. Expected ghi rõ 24 điểm kiểm (6 SP × Add/Remove × 2 trang) |
| D2 | TC-035 expected "biểu tượng menu không bị xoay" chưa nói đo gì. Đo nút `#react-burger-menu-btn` hoặc khung của nó sẽ ra `none` → **PASS sai**. So khung bao (bounding box) với sai số 5 px cũng không bắt được: xoay 3° chỉ làm khung bao của biểu tượng ~24 px đổi khoảng 1 px. Sai số 5 px cho **vị trí** thì hợp lý (lệch thật 186 / 29 px và 54 px, ổn định 2/2 lần) | Web: transform của `#react-burger-menu-btn` và khung cha = `none` ở `visual_user`; xoay nằm ở `.bm-icon` và `.shopping_cart_container` (A2) | 🟠 | Expected: computed `transform` của `.bm-icon` và `.shopping_cart_container` = `none` (hoặc góc ≤ 0,5°), vị trí lệch ≤ 5 px so với `standard_user` sau khi ảnh tải xong |
| D3 | TC-016 ghi BVA, notes "Biên: 0, 1, 6 (tối đa)". 6 không phải biên nghiệp vụ (AC không giới hạn số lượng) và không thử được phía ngoài biên (không có sản phẩm thứ 7). Biên thật 0 ↔ 1 đã nằm ở TC-015, TC-017 | `test-cases.csv` TC-016 `technique`, `notes` | 🟡 | `technique` = `-` (kiểm đếm tăng dần), bỏ ghi chú "biên" |
| D4 | TC-025 expected dạng quan hệ "số trên giỏ = số dòng trong giỏ": với `[4,4]` nếu web sửa thành 2 dòng và số 2 thì vẫn đúng câu này. Bước "bấm 'Add to cart' nếu có" là bước có điều kiện. Kỹ thuật ghi Error Guessing cho cả `6`, `-1` là giá trị biên của khoảng 0–5 | `test-cases.csv` TC-025 | 🟡 | Expected cụ thể từng biến thể: id `6` / `99` / `-1` → `ITEM NOT FOUND`, không có nút `Add to cart` (hoặc bấm rồi vẫn không có số giỏ, giỏ 0 dòng); `[4,4]` → số giỏ 1, 1 dòng Backpack số lượng 1; `[4,"x"]` → số giỏ 1, 1 dòng Backpack. `technique` = `BVA;Error Guessing` |
| D5 | TC-041 "Ở từng trang (danh sách, chi tiết Backpack, giỏ): 1. Thêm Backpack": ở trang giỏ không thêm được sản phẩm. BUG-05 làm giao diện cũ còn sót lại, nên kiểm trang sau ngay trên trang trước dễ bị ảnh hưởng chéo | `test-cases.csv` TC-041 `steps` | 🟡 | Ghi rõ từng trang: trang giỏ = thêm ở danh sách → mở giỏ → Reset. Mỗi trang bắt đầu từ trạng thái sạch (tải lại sau khi xóa `cart-contents`) |
| D6 | TC-006, TC-007 expected chỉ nêu sản phẩm đầu và cuối, không đủ để bắt sai thứ tự ở giữa. TC-008, TC-009 nêu đủ 6 nhưng không kiểm nhãn dropdown như TC-006, TC-007 | `test-cases.csv` `expected_result` | 🟡 | TC-006, TC-007 liệt kê đủ 6 tên theo `sortOrders.az` / `za`; TC-008, TC-009 thêm nhãn `Price (low to high)` / `Price (high to low)` |
| D7 | Expected chưa nguyên văn hoặc chưa có phần tử riêng của trang đích: TC-043, TC-045 ghi "MSG-02 với đường dẫn tương ứng"; TC-029, TC-031, TC-032, TC-033 chỉ ghi URL `/checkout-step-one.html` | Web: thông báo là `…'/cart.html'…` và `…'/inventory-item.html'…` (không có `?id=4`) | 🟡 | Ghi nguyên văn 2 thông báo. Đích Checkout thêm tiêu đề `Checkout: Your Information` |
| D8 | TC-030 expected "nút bị khóa hoặc ở lại trang giỏ" đúng với Q5, nhưng chưa nói kiểm thế nào. Script bấm vào nút bị khóa sẽ chờ hết timeout | `test-cases.csv` TC-030 | 🟡 | Expected: hoặc nút `Checkout` ở trạng thái disabled, hoặc sau khi bấm URL vẫn là `/cart.html` và không có `Checkout: Your Information` |
| D9 | `test-cases.csv` **thiếu cột `screen`**. CLAUDE.md mục 7 (quy ước mới cho feature nhiều màn hình) bắt buộc; `viewpoint.csv` đã có | Header `test-cases.csv`: không có `screen` | 🟠 | Thêm cột `screen` (Danh sách / Chi tiết / Giỏ / Cả 3 / Danh sách → Chi tiết), khớp với cột `screen` của TVP tương ứng |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Biến thể bug bị sót dù `known-issues.md` đã liệt kê (B1) hoặc nhìn sang TC cùng loại là thấy (B2) | B1, B2 | 🟡 | test-impl tự lập bảng BUG → TC → biến thể đã phủ (đối chiếu từng giá trị trong `known-issues.md`) trước khi bàn giao, dán vào cuối `test-data.md` hoặc cột TC của `known-issues.md` (C2) |
| E2 | TC bug nhiều biến thể viết theo dạng bước nối tiếp nên một biến thể lỗi làm hỏng các biến thể sau (D1) | D1 | 🟡 | Thêm vào `.claude/agents/test-impl.md`: mỗi biến thể có trạng thái bắt đầu riêng (đặt bằng `localStorage` / URL), không phụ thuộc kết quả biến thể trước |
| E3 | Expected về giao diện ("không bị xoay", "đúng vị trí") phải nêu phần tử và thuộc tính đo, nếu không script-gen chọn sai phần tử và test PASS sai (D2) | D2 | 🟡 | Quy ước: expected giao diện = phần tử (`data-test` hoặc class) + thuộc tính (tọa độ, `transform`) + sai số |
| E4 | Quy ước cột `screen` được thêm sau khi test-impl chạy xong, nên `test-cases.csv` lệch quy ước (D9) | CLAUDE.md mục 7 | 🟡 | Khi đổi quy ước giữa chừng, orchestrator ghi rõ các file đã tạo cần cập nhật và chạy lại bước liên quan trước HITL |

## Xử lý sau review (2026-11-25)
**Kiểm chứng lại:** chạy lại A1 (bấm ảnh, `problem_user`), A2 (`transform` ở 3 màn hình), B2 (3 kiểu sắp xếp của `error_user`), C5 (tọa độ Checkout): **cả 4 khớp** với review. Lần đo trước của test-design ra y 392 là đo quá sớm; đo lại 2 lần đều y 412.

| # | Xử lý |
|---|---|
| A1 | ✅ TC-024 bấm cả tên và ảnh (12 điểm kiểm); O-21, BUG-11, TVP-023 ghi "tên hoặc ảnh" |
| A2, D2 | ✅ TC-035 phủ 3 màn hình, đo `transform` của `.bm-icon` và `.shopping_cart_container`, tọa độ ≤ 5 px; O-25, BUG-16 (chuyển sang mục "Chung", màn hình "Cả 3"), TVP-025 |
| B1 | ✅ TC-026 và TD-08 thêm `4.9`, `0x4` |
| B2 | ✅ TC-012 thử cả 3 kiểu |
| B3 | ✅ TC-033 thêm sắp theo tên, thêm / bỏ ở chi tiết; TC-034 thêm 4 kiểu sắp xếp, thêm / bỏ ở chi tiết và giỏ; TC-031, TC-032, TC-034 thêm kiểm bố cục |
| B4 | ✅ TC-013 so giá danh sách = chi tiết = giỏ |
| B5 | ✅ TC-020 kiểm ảnh và mô tả; TC-021 ghi URL + tên |
| C1 | ✅ `products.ts` thêm `description` (lấy từ `standard_user`), TD-06 ghi rõ |
| C2 | ✅ Cột "Viewpoint / TC phải bắt" trong `known-issues.md` có TC id |
| C3 | ✅ TC-008, TC-009 gắn `TVP-003;TVP-004` |
| C4 | ✅ TC-034 ghi "KHÔNG dùng `test.fail()`" |
| C5 | ✅ O-29 sửa y 412 |
| C6 | ✅ TD-10 có domain, path; MSG-02 dùng `MSG.notLoggedIn(path)` có sẵn |
| D1 | ✅ TC-018, TC-019 viết lại: mỗi biến thể bắt đầu từ trạng thái riêng, 24 điểm kiểm |
| D3 | ✅ TC-016 bỏ nhãn BVA |
| D4 | ✅ TC-025 expected cụ thể từng biến thể, kỹ thuật `BVA;Error Guessing` |
| D5 | ✅ TC-041 mỗi màn hình bắt đầu từ giỏ trống, ghi rõ cách thêm ở màn hình giỏ |
| D6 | ✅ TC-006, TC-007 liệt kê đủ 6 tên; TC-008, TC-009 kiểm nhãn dropdown |
| D7 | ✅ TC-043, TC-045 ghi nguyên văn thông báo; đích Checkout có tiêu đề `Checkout: Your Information` |
| D8 | ✅ TC-030 ghi cách kiểm (nút disabled, hoặc vẫn ở `/cart.html`) |
| D9 | ✅ `test-cases.csv` thêm cột `screen` |
| E1 → E3 | ✅ Thêm vào `.claude/agents/test-impl.md` |
| E4 | ✅ Thêm vào `qa-orchestrator.md`: đổi quy ước giữa chừng thì cập nhật file đã tạo trước HITL |
