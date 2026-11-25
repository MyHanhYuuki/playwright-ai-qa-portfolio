# Review: bước executor, SD-102 Sản phẩm, chi tiết, giỏ hàng

- **Ngày**: 2026-11-25 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa** (2 lỗi 🔴, 4 lỗi 🟠, phần còn lại 🟡)
- **Phạm vi**: `triage.md`, `run-results/run-20261125-105852.json` (lần chạy chính thức), `evidence/` (README index, `all-cases/`, `bugs/`). Kiểm lại phần "Xử lý sau review" của `review-script-gen.md`.
- **Nguồn đối chiếu**: `test-cases.csv`, `known-issues.md`, `test-data.md`, `q-and-a.md`, `requirement/requirement.md`, `tests/specs/saucedemo-products-cart.spec.ts`, `tests/pages/*.ts`, `tests/utils/evidence.ts`, `scripts/run-tests.mjs`, `scripts/run-evidence.mjs`, `scripts/build-rtm.mjs`, `.claude/agents/script-gen.md`, `executor.md`, `CLAUDE.md`
- **Cách kiểm**:
  - Tự đếm lại từ run JSON: status, expected_status, số dòng `errors[]`, thời gian từng test.
  - Chạy lại 17 test bug + TC-034 bằng JSON reporter (ra thư mục tạm, không ghi đè `run-results/` hay `evidence/`) để đọc **Expected / Received** đầy đủ của từng lỗi (run JSON chỉ giữ dòng đầu, xem C2).
  - Chạy lặp TC-022, 028, 029, 030, 039, 040, 041, 042, 043 × 3 (`--retries=0`): 27/27 đúng như mong đợi.
  - `npm run typecheck`: sạch.
  - So tự động tag của 45 test (`--list`) với cột `screen`, `linked_ac`, BUG id ở câu đầu `notes` của CSV: khớp 45/45.
  - Mở 20 ảnh evidence của các TC bug (TC-004, 005, 012, 013, 018 ×2, 024, 025, 026, 030, 035, 036, 040, 041 ×2, 045 ×2) và đọc README của TC-012, 034, 041, TC-001.
  - Đọc code `evidence.ts` theo quy định video mới (2026-11-25).

## Checklist (mục 5: kết quả chạy)
| Mục | Kết quả |
|---|---|
| Đọc **từng lỗi** của từng test | ✅ Đã đọc 166 dòng `errors[]` của 16 test, và Expected/Received đầy đủ từ lần chạy lại |
| Số liệu tổng | ✅ 45 test: 29 pass + 16 bug đã biết fail như mong đợi; `summary` khớp (`passed` 45 theo Playwright, `expected_fail` 16); 73,4 giây. Số dòng lỗi từng TC khớp cột "Lỗi bắt được" (3, 11, 2, 24, 24, 7, 13, 6, 6, 6, 9, 1, 24, 4, 1, 2) |
| Test "bug đã biết" fail **đúng assertion của bug** | ❌ 15/16. **TC-025 có 1 lỗi `strict mode violation`** (lỗi code test) bị tính là bug (C1, D1) |
| Phân loại flaky / script-issue / real-bug có bằng chứng | ⚠️ Không có flaky (tự chạy lặp 27/27). script-issue ghi 0 là sai (C1). Cột "Actual (từ errors[])" không truy được về run JSON (C2) |
| Bug đã biết mà bỗng pass phải được điều tra | ✅ Không có. TC-034 (BUG-17) pass đúng thiết kế (Q10) |
| Mọi biến thể của bug trong known-issues được test phủ | ✅ Theo assertion: BUG-10/13 đủ 6 sản phẩm × 2 trang × Add/Remove, BUG-11 đủ 12 điểm, BUG-05 đủ 3 trang, BUG-02 đủ 2 trang, BUG-16 đủ 3 trang. ⚠️ BUG-14 "đổi ngẫu nhiên mỗi lần tải" không có kiểm (D5) |
| Evidence chụp sau thao tác gây lỗi, đủ biến thể, ghi chú đúng | ⚠️ Ảnh chụp đúng trang, không thấy ảnh trang cũ. Nhưng nhiều ảnh **không có khung đỏ** (B1) và nhiều biến thể bug không có ảnh (B2) |
| CI và local khác nhau không | ❓ Triage nhắc CI (S1, S6, N1) nhưng không kèm link run của code hiện tại. Tôi không kiểm được CI |
| Index evidence và cột `screen` khớp `test-cases.csv` | ✅ Cột "Màn hình" lấy trực tiếp từ CSV. ⚠️ Nhóm (theo `test.describe`) lệch với known-issues / triage ở BUG-14, BUG-16 (C3) |
| Quy định video mới (chỉ quay cho TC bug / kết quả bất thường) | ✅ `evidence.ts:105` `keepVideo`, `EVIDENCE_ALL_VIDEOS`, giữ video cũ (dòng 45-47), README ghi "quay ở lần chạy ngày …" (dòng 143-145, đã thấy ở TC-001). ⚠️ `executor.md:114` còn ghi "video cho mọi TC" (E2) |

## Đối chiếu "Actual" của triage với lần chạy lại
| Bug | Triage ghi | Received thật (lần chạy lại) | Kết luận |
|---|---|---|---|
| BUG-05 TC-041 | Nút vẫn Remove (danh sách, chi tiết), giỏ còn 1 dòng; số giỏ đã mất cả 3 trang | `Remove`; nút Add không tồn tại; giỏ 1 dòng. 3 assertion số giỏ pass. Ảnh 02, 03 khớp | ✅ |
| BUG-06 TC-025 | id 6/99/-1 có nút Add, bấm thì có số; `[4,4]` "số giỏ, số dòng, **số lượng** sai"; `[4,"x"]` số giỏ sai | Nút Add có (1), số giỏ hiện; `[4,4]` số giỏ 2, 2 dòng. **"số lượng" là `strict mode violation`**: mỗi dòng đều là số lượng 1 (ảnh 02 thấy rõ); `[4,"x"]` số giỏ 2, đúng 1 dòng | ❌ "số lượng sai" không đúng (C1) |
| BUG-07 TC-040 | visual_user thấy số giỏ và giỏ của standard_user | Số giỏ hiện, giỏ 2 dòng. Ảnh: số 2, Backpack + Bike Light là Remove | ✅ |
| BUG-10 / 13 | Remove không ăn (Backpack, Bike Light, Onesie), Add không ăn (Bolt, Fleece, Red) ở cả 2 trang | Đúng 24/24 ở cả hai: Remove → vẫn `Remove` + số giỏ còn; Add → vẫn `Add to cart` + không có số. TC-018 57,6 s, TC-019 57,6 s (giới hạn 120 s) | ✅ |
| BUG-14 TC-013 | Giá 6 sản phẩm sai, chi tiết và giỏ đúng $29.99 | Lần này $32.38, $39.98, $68.5, $1.73, $63.64, $78.06 (ảnh evidence là bộ giá khác: $11.12…). Chi tiết, giỏ pass | ✅ (giá ngẫu nhiên, xem B4) |
| BUG-16 TC-035 | Giỏ lệch ngang, dọc, xoay; menu xoay, cả 3 trang; Red T-Shirt lệch ngang | Lệch ngang 186 px, dọc 29 px, `matrix(0.99863, 0.052336, …)` (≈ 3°) ở cả 3 trang; Red T-Shirt 54 px ngang, dọc pass | ✅ |
| BUG-02 TC-045 | Cookie giả vào được giỏ và chi tiết | URL giữ nguyên `/cart.html`, `/inventory-item.html?id=4`, không có thông báo, nội dung hiện | ✅ |
| BUG-08, 15 | sl-404 cả 6 / chỉ Backpack | `/assets/sl-404-….jpg` | ✅ |
| BUG-09, 12 | Nhãn và thứ tự không đổi; error_user có hộp thoại | Nhãn luôn `Name (A to Z)`. Hộp thoại `Sorting is broken! This error has been reported to Backtrace.` cả 3 lần (chỉ thấy trong annotation, xem C2) | ✅ |
| BUG-11 TC-024 | Tên và ảnh của cả 6 mở sai trang | Lệch id +1: Backpack → id=5 Fleece Jacket, Bike Light → id=1 Bolt, … Red → id=4 Backpack; Fleece → id=6 `ITEM NOT FOUND`. 54 s / 90 s | ✅ |
| BUG-20 TC-026 | 4abc, 04, 4.9, 0x4 mở Backpack; abc, rỗng đúng | Đúng, cả 4 Received `Sauce Labs Backpack` | ✅ (trước đó không có bằng chứng lưu lại cho 04, 4.9, 0x4, xem B2) |
| BUG-18 TC-036 | Checkout không cùng hàng; mốc standard_user pass | Lệch dọc 412 px; mốc pass | ✅ |
| BUG-19 TC-030 | Giỏ trống vẫn sang Checkout | URL `checkout-step-one.html`, tiêu đề `Checkout: Your Information` | ✅ |
| BUG-17 TC-034 | 5 041 / 5 037 / 5 036 / 5 027 ms | Lần chạy lại 5 048 / 5 038 / 5 035 / 5 035 ms. Số của triage **không có trong file nào** của repo (C2) | ⚠️ Khớp cỡ ~5,04 s, không truy được |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | Lỗi BUG-11 có quy luật rõ: bấm sản phẩm id=n mở id=n+1 (cả tên và ảnh), Fleece (id 5) mở id 6 không tồn tại | Received URL của 12 điểm (bảng trên) | 🟡 | Ghi quy luật này vào bug report BUG-11, giúp dev tìm nguyên nhân nhanh |
| A2 | Giá của visual_user đổi giữa 2 lần chạy (ảnh evidence $11.12 cho Backpack, lần chạy lại $32.38) | Ảnh `TC-013/01`, lần chạy lại | 🟡 | Bằng chứng phụ cho "đổi ngẫu nhiên" của BUG-14; nên có assertion riêng (D5) |

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Khung đỏ không được vẽ** khi `highlight` là locator khớp nhiều phần tử: `boundingBox()` ném `strict mode violation`, `.catch(() => null)` nuốt lỗi, ảnh không có khung mà không ai biết. Bị ở TC-004 (BUG-08), TC-013 bước 1 (BUG-14), và TC-002, 003, 007, 008, 009. TC-005 (BUG-15) khung chỉ là một vạch mảnh bên trái ảnh vì đo trước khi ảnh tải xong. Index ghi "Mỗi ảnh có khung đỏ" là không đúng | `evidence.ts:61`; spec dòng 98, 103, 109, 135, 178; ảnh `TC-004/01`, `TC-013/01` (không khung), `TC-005/01` (khung lệch) | 🟠 | `evidence.ts`: với mỗi locator lấy `await m.all()` rồi khoanh từng phần tử; cảnh báo (console + README) khi `highlight` có mà không khoanh được gì. Trước khi chụp ảnh sản phẩm, chờ ảnh tải xong (`imagesLoaded`). Chụp lại TC-004, 005, 013 |
| B2 | **Biến thể bug không có ảnh** (người duyệt HITL #3 chỉ thấy 1 biến thể, mà run JSON lại không lưu Received, xem C2): TC-024 chỉ có "bấm tên Backpack", thiếu bấm **ảnh** và Fleece → `ITEM NOT FOUND` (triệu chứng khác); TC-025 thiếu `[4,"x"]` (số giỏ 2, 1 dòng); TC-026 thiếu 04, 4.9, 0x4; TC-040 không chụp trang giỏ (2 dòng của người trước); TC-011 chỉ chụp Z→A; TC-035 nút Add của Red T-Shirt nằm **ngoài khung hình** (ảnh chụp viewport, nút ở dưới) nên biến thể lệch 54 px không thấy | Danh sách file trong `all-cases/TC-024`, 025, 026, 040, 011; ảnh `TC-035/01`. `script-gen.md:110`: "mỗi biến thể một `evidence.shot()`" | 🟠 | Thêm `evidence.shot()` cho mỗi biến thể có triệu chứng khác (TC-024: bấm ảnh + Fleece; TC-025: `[4,"x"]`; TC-040: trang giỏ; TC-026: có thể gộp bằng 1 ảnh mỗi giá trị). TC-035: `scrollIntoViewIfNeeded()` nút Red T-Shirt rồi chụp thêm 1 ảnh |
| B3 | Nội dung hộp thoại của BUG-12 không có bằng chứng lưu lại: test chỉ kiểm "không có hộp thoại", ảnh không thể chụp hộp thoại, annotation bị run JSON bỏ (C2) | spec dòng 169-170; `MSG_SHOP.sortingBroken` không được dùng ở đâu; ảnh `TC-012/01` chỉ thấy dropdown `Name (A to Z)` | 🟠 | Thêm `expect.soft(dialogs).toEqual([])` giữ nguyên, **và** ghi nội dung hộp thoại vào evidence (ghi chú của `shot()` hoặc README). Ghi chú ảnh TC-012 nói rõ "đã chọn Price (high to low)" để người xem hiểu dropdown sai |
| B4 | Evidence là **một lần chạy khác** (`test:evidence` lúc ~11:00:30) với lần chạy chính thức (10:58:52 → 11:00:06), triage không nói. Với bug có dữ liệu ngẫu nhiên (BUG-14) số trên ảnh khác số trong lần chạy | Thời điểm trong README từng TC; ảnh `TC-013/01` | 🟡 | Triage ghi rõ evidence lấy từ lần chạy nào, kết quả lần đó (45/45 như mong đợi?) |
| B5 | Thiếu môi trường trong triage: phiên bản Playwright, Chromium, hệ điều hành. "9 workers" không có trong run JSON | `triage.md:3` | 🟡 | Thêm 1 dòng môi trường (cần cho bug report ở bước defects) |
| B6 | Kết quả chạy lặp (90/90, 70/70, 6/6) không được lưu thành file, không kiểm lại được. Tôi chỉ tái hiện được một phần (27/27) | `triage.md:5-9` | 🟡 | Chạy lặp bằng `test:run … --repeat-each=N --triggered-by stability` để có file JSON trong `run-results/`, hoặc ghi lệnh + tổng kết dòng cuối |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | **TC-025 có lỗi code test nhưng triage ghi "Fail đúng chỗ ✅", "script-issue 0", "Không có … lỗi code", và Actual "số lượng sai".** Assertion "trùng id: số lượng" dùng `cart.line(backpack)`, với `[4,4]` khớp 2 dòng nên Playwright báo `strict mode violation`, số lượng **không bao giờ được đo**. Thực tế mỗi dòng số lượng 1. Nếu chép sang bug report BUG-06 sẽ thành mô tả sai | Lần chạy lại: `Error: trùng id: số lượng … Error: strict mode violation: … resolved to 2 elements`; spec dòng 352; ảnh `TC-025/02`; `triage.md:10, 18, 28` | 🔴 | Phân loại TC-025 là real-bug **+ 1 script-issue** (→ healer): sửa assertion số lượng (vd kiểm `item-quantity` của dòng đầu, hoặc kiểm mọi dòng `toHaveText(['1'])` khi đã có 1 dòng). Sửa triage: bỏ "số lượng sai", "Lỗi bắt được" 10 + 1 lỗi code, script-issue 1 |
| C2 | **Run JSON chỉ giữ dòng đầu của lỗi và bỏ annotation**, nên cột "Actual (từ errors[])" của triage không đến từ `errors[]` (chỉ có tên assertion, vd `Error: id=04`). Mọi giá trị thực tế (giá sai, URL sai, số px, nội dung hộp thoại BUG-12, thời gian BUG-17) không có trong file nào của repo | `run-tests.mjs:45` (`split('\n')[0]`), không đọc `annotations`; `triage.md:25, 59` | 🟠 | `run-tests.mjs`: lưu thêm `expected` / `received` (các dòng `Expected:`, `Received:`) và `annotations` cho mỗi test. Sửa tiêu đề cột triage thành nguồn thật (lần chạy lại / evidence) cho tới khi script được sửa |
| C3 | Màn hình / nhóm của bug lệch giữa các file: BUG-14 ở known-issues là "Màn hình 1, Danh sách", triage là "Chung, Cả 3", index evidence nhóm "Màn hình 1" nhưng cột "Cả 3". BUG-16 ở known-issues "Chung", TC-035 trong spec và index ở nhóm "Màn hình 1". BUG-07 known-issues "Giỏ (số giỏ ở mọi trang)", CSV/triage "Danh sách + Giỏ" | `known-issues.md:15, 19, 27`; `triage.md:29, 32-33`; `evidence/README.md` nhóm Màn hình 1; spec dòng 175, 231 | 🟡 | Chốt một cách: BUG-14, BUG-16 đều "Chung / Cả 3" (TC kiểm cả 3 trang) → chuyển mục trong known-issues và chuyển TC-013, TC-035 vào `describe` "Chung" (index tự theo). BUG-07 sửa thành "Danh sách + Giỏ" |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | **Lưới bắt lỗi code test (bài học L4) bị mù với mọi `expect.soft(x, 'tên')`.** `SCRIPT_ERROR` chỉ dò dòng đầu, mà khi assertion có tên thì dòng đầu luôn là tên (`Error: trùng id: số lượng`); `strict mode violation`, `element(s) not found`… nằm ở dòng sau. Spec này đặt tên cho **mọi** assertion của biến thể bug, nên cảnh báo gần như không bao giờ bật. Cùng lỗi ở `evidence.ts` | `run-tests.mjs:45, 91-93`; `evidence.ts:130-132`; TC-025 không bị cảnh báo dù có `strict mode violation` | 🔴 | Dò `SCRIPT_ERROR` trên **toàn bộ** message (trước khi cắt dòng). Thử lại bằng cách cố tình gây `strict mode violation` trong một `expect.soft(…, 'tên')` |
| D2 | Ảnh chụp ngay sau thao tác đổi trang mà chưa chờ trang đích (bài học L2/A1): TC-030 chụp ngay sau bấm Checkout, TC-045 chụp ngay sau `goto` (nếu web chuyển về trang đăng nhập bằng JS sau `load`, ảnh sẽ là trang cũ). Lần này ảnh đúng trang | spec dòng 422-423, 691-692 | 🟡 | TC-030: chờ `toHaveURL` hoặc tiêu đề (soft, QUICK) rồi mới chụp; TC-045: chụp sau các assertion |
| D3 | Ảnh TC-041 bước 2, 3 chụp khi menu bên trái còn mở, che mất tên sản phẩm trong giỏ (bước 3 chỉ thấy "…ck") | Ảnh `TC-041/02`, `TC-041/03` | 🟡 | Đóng menu (nút X) trước khi chụp, hoặc khoanh dòng giỏ có tên rõ |
| D4 | TC-035 đo bố cục trang chi tiết, giỏ không chờ ảnh tải xong (CSV: "sau khi ảnh tải xong" ở cả 3 trang). Hiện không ảnh hưởng vì biểu tượng ở header | spec dòng 243-254; `imagesLoaded` chỉ gọi ở dòng 236-237 | 🟡 | Gọi `imagesLoaded` cho cả 2 phiên sau mỗi lần chuyển trang |
| D5 | Biến thể "giá đổi ngẫu nhiên mỗi lần tải" của BUG-14 không có assertion (TC-013 chỉ tải 1 lần) | known-issues BUG-14; spec dòng 175-190 | 🟡 | Tải lại 1 lần, ghi giá lần 2 vào ghi chú evidence (không cần assertion fail riêng) |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Triage ghi "đọc từng dòng `errors[]`" nhưng `errors[]` không có đủ thông tin để phát hiện C1 | C1, C2, D1 | 🟠 | Thêm vào `executor.md` Phase 2: với test `test.fail()`, đọc message **đầy đủ** (HTML report / `--reporter=json`), không chỉ `errors[]` của run JSON, cho tới khi D1 và C2 được sửa |
| E2 | `executor.md:114` còn ghi "video cho mọi TC", lệch quy định mới (chỉ TC bug / kết quả bất thường, `EVIDENCE_ALL_VIDEOS=1` để quay hết) | `executor.md:114`; `evidence.ts:8-9, 105` | 🟡 | Cập nhật câu này trong `executor.md` (và chú thích lệnh `test:evidence` ở `CLAUDE.md:18` nếu muốn) |
| E3 | Tái hiện bằng tay để sau HITL #3. Người duyệt HITL #3 chỉ có ảnh tự động, mà nhiều ảnh thiếu khung / thiếu biến thể (B1, B2) | `triage.md:72` | 🟡 | Sửa B1, B2, chụp lại evidence **trước** HITL #3 |

## Kiểm lại "Xử lý sau review" của review-script-gen (bài học L8)
| # | Ghi ✅ | Kiểm thật | Kết luận |
|---|---|---|---|
| A1, A2, D2, D3, D5, E1 | PO tự chờ trang đích; spec dùng; quy tắc ghi vào docs | `AppPage.openCart` chờ `cart-list`, `backToProducts`/`continueShopping` chờ `inventory-list`, `logout` chờ `login-button`; không còn `items.first()`; `script-gen.md:118`, `CLAUDE.md:40`. Đi hết mọi chỗ đổi trang trong spec: đều chờ phần tử riêng trang đích (trừ chỗ chụp ảnh ở D2) | ✅ |
| A3, D1 | TC-024 `setTimeout(90_000)`, 24 lỗi đúng chỗ | Dòng 318; chạy lại 54 s, 24 lỗi đều là URL/tên | ✅ |
| A4 | 70/70 | Tôi chạy lặp × 3: 27/27 (gồm 7 test này) | ✅ (một phần, nhất quán) |
| **B1** | TC-025 kiểm dòng là Backpack, số lượng 1 | Có code (dòng 350-352) nhưng assertion số lượng **luôn lỗi `strict mode violation`** với `[4,4]`, không đo được số lượng | ❌ **Chưa đạt** (C1) |
| B2, B3 | TC-033, TC-034 bổ sung kiểm | Dòng 484-507, 530 | ✅ |
| **B4** | So x và y; chờ mọi ảnh tải xong (cả 2 phiên) | x, y: ✅ dòng 241-242. Chờ ảnh: chỉ ở trang danh sách, chi tiết và giỏ không chờ | ⚠️ **Một phần** (D4) |
| B5 | TC-043, TC-045 kiểm không thấy nội dung | Dòng 656, 666, 695 | ✅ |
| B6 | Chụp thêm ảnh các TC đã liệt kê | Đúng với danh sách đã nêu (TC-013, 035, 041 3 ảnh; 043, 045 2 ảnh; 018/019 12 ảnh; TC-030, 025 chụp sau thao tác). Còn thiếu ở TC khác: B2 của review này | ✅ (mục mới ở B2) |
| B7, C1, C3, C4 | | Ghi chú TC-020 đúng; tag ↔ CSV khớp 45/45; CSV TC-025 có bước bấm Add; `build-rtm.mjs:40` chỉ đọc câu đầu | ✅ |
| **C2** | `MSG_SHOP` có MSG-01, MSG-03, tiêu đề Checkout; "spec dùng nhóm này" | MSG-03 và tiêu đề được dùng. **MSG-01 `sortingBroken` không được dùng ở đâu**: TC-012 không kiểm nội dung hộp thoại (known-issues lưu ý 7 yêu cầu kiểm) | ⚠️ **Một phần** (B3) |
| D4, D6, D7, D8 | | Dòng 713-714; 606, 616; 332, 360; không còn `void page`, `Evidence` import kiểu, TC-038 dùng `detail.backButton`, TC-045 không còn `waitForLoadState` | ✅ |
| **E2** | `run-tests.mjs` tự cảnh báo, "đã thử bằng cách cố tình gây lỗi" | Cảnh báo chỉ dò dòng đầu, mù với assertion có tên; đã lọt `strict mode violation` ở TC-025 | ❌ **Chưa đạt** (D1) |
| **E4** | Quy tắc ước lượng thời gian trong `script-gen.md` | `script-gen.md:119` chỉ ghi chung "ước lượng thời gian, đặt `test.setTimeout()` đủ dư", không có cách tính (số soft check có thể fail × timeout + dư) như đề xuất | ⚠️ **Một phần** |
| (thêm) typecheck | | `package.json` có `typecheck`, CI `playwright.yml:50` chạy; `tsc --noEmit` sạch | ✅ |

## Việc cần làm trước khi sang HITL #3 (xếp theo mức độ)
1. 🔴 **C1 + D1**: sửa dò lỗi code test trên toàn bộ message (`run-tests.mjs`, `evidence.ts`); sửa assertion số lượng TC-025 (healer); sửa triage (TC-025 có 1 script-issue, bỏ "số lượng sai"). Chạy lại `test:run`.
2. 🟠 **C2**: run JSON lưu Expected/Received và annotation (cần cho BUG-12 nội dung hộp thoại, BUG-17 thời gian, giá trị thực tế của mọi bug ở bước defects).
3. 🟠 **B1, B2, B3**: sửa khoanh đỏ cho locator nhiều phần tử, thêm ảnh cho biến thể còn thiếu, lưu nội dung hộp thoại BUG-12; chạy lại `test:evidence`.
4. 🟠 **E1**: thêm vào `executor.md` yêu cầu đọc message đầy đủ cho test `test.fail()`.
5. 🟡 Còn lại (B4-B6, C3, D2-D5, E2, E3, B4/E4 của script-gen) gom vào một lần sửa, không chặn HITL #3 nếu 1-4 đã xong.

## Xử lý sau review (2026-11-25)
**Kiểm chứng lại:** C1 đúng (chạy riêng TC-025 với cảnh báo mới: `trùng id: số lượng → strict mode violation`). D1 đúng (cảnh báo cũ chỉ đọc dòng đầu). B1 đúng (đọc `evidence.ts`: `boundingBox()` trên locator khớp nhiều phần tử ném lỗi, bị `.catch` nuốt).

| # | Xử lý |
|---|---|
| C1 | ✅ TC-025 kiểm số lượng của **mọi dòng** (`cart.items.getByTestId('item-quantity')` = `['1']`), không còn `strict mode violation`. Triage viết lại |
| D1, E1 | ✅ `run-tests.mjs` và `evidence.ts` dò lỗi code test trong **toàn bộ** nội dung lỗi. Thử lại với TC-025 trước khi sửa: cảnh báo hiện đúng. `executor.md`: test `test.fail()` phải đọc `error_details` |
| C2 | ✅ Run JSON thêm `error_details` (đủ Expected / Received, bỏ call log) và `annotations` (thời gian BUG-17, hộp thoại BUG-12). Schema trong `executor.md` cập nhật |
| B1 | ✅ Evidence khoanh **từng** phần tử khi locator khớp nhiều phần tử; chờ ảnh tải xong (tối đa 3 giây) trước khi đo khung |
| B2 | ✅ Chụp mọi biến thể: TC-024 (mọi điểm mở sai, kể cả bấm ảnh và Fleece → `ITEM NOT FOUND`), TC-025 (`[4,"x"]`), TC-026 (cả 10 giá trị), TC-040 (trang giỏ, 3 biến thể), TC-011 (3 kiểu), TC-035 (cuộn tới nút Red T-Shirt, ghi số px lệch) |
| B3 | ✅ TC-012 kiểm hộp thoại phải là MSG-01 (`MSG_SHOP.sortingBroken`), ghi nội dung vào ghi chú ảnh và `annotations` |
| B4, B5, B6 | ✅ Triage ghi môi trường và nói rõ evidence là lần chạy riêng; chạy lặp lưu thành `run-results/stability-*.json` (chỉ số liệu, không có đường dẫn máy) |
| C3 | ✅ Sửa cùng review-test-impl-r2 C2: BUG-14 sang mục "Chung" (Cả 3), BUG-07 "Danh sách + Giỏ"; TC-013, TC-035 chuyển vào nhóm "Chung" trong spec nên index evidence nhóm đúng; cột index đổi tên "Màn hình của TC" |
| D2 | ✅ TC-030, TC-045 chụp **sau** các bước kiểm (trang đã ổn định) |
| D3 | ✅ TC-041 đóng menu (`closeMenu()` mới trong `AppPage`) trước khi kiểm và chụp |
| D4 | ✅ TC-035 chờ ảnh tải xong ở cả trang chi tiết và giỏ |
| D5, A2 | ⏸ Backlog: TC-013 tải lại để ghi giá lần 2 (bằng chứng "đổi ngẫu nhiên"). Ghi quy luật vào bug report BUG-14 ở bước defects |
| A1 | ⏸ Ghi quy luật "id n mở id n+1" vào bug report BUG-11 ở bước defects |
| E2 | ✅ `executor.md` ghi quy định video mới |
| E3 | ✅ Chụp lại evidence trước HITL #3 |
| Kiểm lại script-gen (L8) | ✅ B1 (TC-025 số lượng) và E2 (cảnh báo) sửa như C1, D1 ở trên. C2: MSG-01 nay được TC-012 dùng. B4: xem D4. E4: `script-gen.md` có công thức tính thời gian (vd TC-024) |
