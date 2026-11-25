# Review: bước script-gen, SD-102 Sản phẩm, chi tiết, giỏ hàng

- **Ngày**: 2026-11-25 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa** (2 lỗi 🔴, 4 lỗi 🟠, phần còn lại 🟡)
- **Phạm vi**: `tests/specs/saucedemo-products-cart.spec.ts` (45 test), `tests/pages/AppPage.ts`, `InventoryPage.ts`, `ProductDetailPage.ts`, `CartPage.ts`, `tests/fixtures/index.ts`, `tests/data/products.ts`, `bugs.ts`, `messages.ts`
- **Nguồn đối chiếu**: `test-cases.csv` (đã duyệt ở HITL #2), `test-data.md`, `known-issues.md`, `run-results/run-20261125-002432.json`
- **Cách kiểm**: đọc code từng test, so với từng TC; đối chiếu tag tự động (`--list --reporter=json` so với cột `linked_ac`, `tags`, `notes`, `screen` của CSV); chạy lại riêng TC-024 và TC-043; dùng script Playwright đo trên web thật (có và không có giả lập CPU chậm) cho các nghi vấn race condition.

## Checklist
| Mục | Kết quả |
|---|---|
| Mỗi TC automatable có đúng 1 test, tên bắt đầu bằng TC id, có tag @AC | ✅ 45/45, không trùng, tag @AC khớp `linked_ac` 45/45 |
| Tag @smoke, @security khớp CSV | ✅ smoke: TC-001, 006, 015, 027, 038 · security: TC-040, 043, 045 |
| Tag màn hình (@list / @detail / @cart) khớp cột `screen` | ⚠️ 7 TC lệch, xem C1 |
| Locator theo thứ tự ưu tiên, không XPath, không `.nth()` cố định | ✅ CSS chỉ ở `.shopping_cart_container`, `.bm-icon` (có lý do, BUG-16). `.first()` chỉ dùng làm mốc chờ, xem D5 |
| Không `waitForTimeout`, không `networkidle`, không `skip`/`fixme`/`only` | ✅ (grep cả spec, pages, fixtures) |
| Không hardcode mật khẩu | ✅ lấy từ `tests/data/users.ts` |
| Assertion theo expected của TC, không hạ expected cho khớp bug | ✅ Không thấy chỗ nào hạ expected. Một số TC kiểm **thiếu** một phần expected, xem B |
| `test.fail()` đúng cho TC có BUG cần FAIL | ✅ 16/16 (TC-004, 005, 011, 012, 013, 018, 019, 024, 025, 026, 030, 035, 036, 040, 041, 045). TC-034 (BUG-17) không `test.fail()`, chỉ ghi annotation thời gian ✅. TC-033 nhắc BUG-14 chỉ để giải thích phạm vi, không `test.fail()` ✅ |
| Biến thể bug: `expect.soft` + timeout ngắn, mỗi biến thể từ trạng thái riêng | ⚠️ Đúng ở hầu hết TC. **TC-024 hết giờ, mất 5/12 biến thể** (D1). TC-018/019 bước Add chưa có "không thấy nút thì bỏ qua" (D4) |
| Chờ phần tử riêng của trang đích sau khi chuyển trang | ⚠️ `logout()` đã sửa đúng. Còn nhiều chỗ khác chưa chờ, có 1 chỗ đã chứng minh pass sai (D2, D3) |
| Mỗi test độc lập. Page Object không chứa assertion nghiệp vụ | ✅ Mỗi test một context; `otherSession` tự đóng context. PO chỉ có locator và thao tác |
| Ảnh evidence ở bước quan trọng, ghi chú đúng | ⚠️ Có ở 45/45 test, nhưng nhiều TC nhiều biến thể chỉ chụp 1 biến thể (B6) |

## A. Phát hiện mới (đã kiểm chứng trên web thật)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| A1 | **Chuyển trang trong SauceDemo là phía client và vẽ trang mới trễ hơn lúc URL đổi.** Ngay sau khi `click()` vào link giỏ trả về, URL đã là `/cart.html` nhưng DOM vẫn là trang danh sách | Script đo trên web: bấm biểu tượng giỏ rồi đọc DOM ngay: còn `inventory-list` **5/5 lần ở tốc độ CPU bình thường**, 2/5 ở CPU chậm 4×. Bấm Back to products, Continue Shopping, tên sản phẩm cũng vậy. Cùng nguyên nhân với lỗi TC-043 trên CI | 🟠 | Mọi thao tác chuyển trang phải chờ **phần tử riêng của trang đích**, không chỉ URL (xem D2, D3, E1) |
| A2 | **`data-test="inventory-item"` không riêng của trang danh sách.** Trang chi tiết có 1 phần tử `inventory-item` (bọc tên, mô tả, giá, nút Add/Remove), trang giỏ mỗi dòng cũng là `inventory-item` | Đọc danh sách `data-test` trên `/inventory-item.html?id=4`: `inventory-container, inventory-item, item-sauce-labs-backpack-img, inventory-item-name, inventory-item-desc, inventory-item-price, add-to-cart…`. Locator `inv.item(backpack).getByRole('button', …)` trên trang chi tiết đếm được **1** nút | 🔴 (vì gây D2) | `InventoryPage.items / item() / cartButton()`, `CartPage.items / line()` khớp ở cả 3 trang. Chỉ dùng chúng **sau khi** đã chờ `inventory-list` hoặc `cart-list` |
| A3 | TC-024 hết giờ (30 giây) trước khi kiểm xong 12 điểm | Chạy lại riêng TC-024 hôm nay: `Test timeout of 30000ms exceeded` ở Fleece Jacket (bấm tên), rồi `page.goto: Target page… closed`. Giống hệt run 20261125-002432 | 🔴 | Xem D1 |
| A4 | `AppPage.logout()` sau khi sửa đã ổn | Chạy riêng TC-043: pass (1 lần, máy local). Lỗi cũ trên CI là đúng loại race ở A1 | ✅ | Chạy thêm `--repeat-each=10` cho TC-039, 040, 043 trước khi đóng việc |

## B. Thiếu sót (test chưa kiểm đủ expected của TC)
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | TC-025 biến thể 4, 5: chỉ đếm số dòng, không kiểm dòng đó là **Backpack**, không kiểm **số lượng 1** (biến thể 4) | spec dòng 334-340. CSV: "giỏ 1 dòng Backpack số lượng 1" | 🟡 | Thêm `cart.itemNames` = `[backpack.name]` và `item-quantity` = `1` (soft, QUICK) |
| B2 | TC-033 kiểm thiếu so với "đúng như TC-007, TC-016, TC-017, TC-022": không kiểm nhãn dropdown, không kiểm 6 nút thành Remove rồi về Add to cart, không kiểm danh sách đồng bộ sau khi thêm/bỏ ở chi tiết | spec dòng 467-481 | 🟡 | Thêm `activeSort`, đếm nút `Remove` = 6, sau khi bỏ hết đếm `Add to cart` = 6 |
| B3 | TC-034 không kiểm nhãn dropdown của 4 kiểu sắp xếp (expected "đúng như TC-006 → TC-009", các TC này có kiểm nhãn) | spec dòng 500-505 | 🟡 | Thêm `expect(inv.activeSort).toHaveText(sortLabels[key])` |
| B4 | TC-035 nút Add của Red T-Shirt chỉ so tọa độ **ngang**, expected là "tọa độ lệch ≤ 5 px" (cả 2 chiều). TC cũng ghi "sau khi ảnh tải xong", code không chờ ảnh | spec dòng 236-237 | 🟡 | Thêm so `y`. Chờ ảnh: `expect(img).toHaveJSProperty('complete', true)` trước khi đo |
| B5 | TC-043, TC-045: expected có "**Không thấy nội dung giỏ / chi tiết**" nhưng code chỉ kiểm URL và thông báo | spec dòng 621-623, 630-632, 659-660 | 🟡 | Thêm `expect(cart.cartList).toBeHidden()` / `expect(detail.backButton).toBeHidden()` (TC-045 dùng soft + QUICK) |
| B6 | Evidence chỉ chụp 1 biến thể ở các TC nhiều biến thể / nhiều trang. Người duyệt không thấy bug ở các trang còn lại | TC-041 chỉ chụp danh sách (dòng 580), TC-035 chỉ danh sách (234), TC-013 chỉ danh sách (176), TC-043 chỉ giỏ (624), TC-045 chỉ giỏ (658), TC-044 chỉ chụp tab A dù kiểm tab B (648), TC-030 chụp **trước** khi bấm Checkout nên không thấy đã sang trang thanh toán (407), TC-025 chụp **trước** khi bấm Add nên không thấy số giỏ sai (329), TC-018/019 chỉ chụp 1 lỗi Add ở danh sách (678-681) | 🟡 | Mỗi trang / biến thể của bug một `evidence.shot()`; chụp **sau** thao tác gây bug. TC-044: `evidence` gắn với `page`, cân nhắc chụp tab B bằng `tabB.screenshot()` đính vào `testInfo` |
| B7 | Ghi chú evidence TC-020 sai ý: "Tên, giá, mô tả, ảnh **khớp danh sách**". Code (đúng) so với TD-06, không so với danh sách (lưu ý 4 trong known-issues: không so trang với chính trang) | spec dòng 260 | 🟡 | Đổi thành "khớp dữ liệu chuẩn TD-06" |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | Tag màn hình lệch cột `screen` ở 7 TC. CSV ghi "Cả 3" nhưng test không mở đủ 3 trang (TC-031, 039, 040, 042, 044 không vào chi tiết) hoặc thiếu `@list` dù có assert ở danh sách (TC-037 về `/inventory.html`, TC-043) | So tự động: TC-031, 037, 039, 040, 042, 043, 044 | 🟡 | Sửa cột `screen` trong CSV cho đúng phạm vi thật (vd TC-039 "Danh sách + Giỏ"), thêm `@list` cho TC-037. Lọc `--grep @list` khi đó mới đủ |
| C2 | `messages.ts` chưa có nhóm cho SD-102, spec viết thẳng chuỗi `'ITEM NOT FOUND'` (MSG-03), `'Checkout: Your Information'`; MSG-01 (`Sorting is broken!…`) không có trong code. Comment đầu file `messages.ts` vẫn chỉ nói màn hình đăng nhập | spec dòng 25-26; `tests/data/messages.ts` dòng 1-11. CLAUDE.md mục 6 và script-gen.md yêu cầu thêm nhóm mới cho feature | 🟡 | Thêm nhóm `MSG_PRODUCTS` (MSG-01, MSG-03, tiêu đề trang Checkout) vào `messages.ts`, spec import từ đó |
| C3 | TC-025 code **bấm Add to cart** ở trang sản phẩm không tồn tại (nếu có nút) rồi mới kiểm số giỏ. Bước này không có trong `steps` của CSV (chỉ "mở URL") | spec dòng 331 | 🟡 | Giữ code (đúng là cách tái hiện BUG-06), nhưng bổ sung bước "bấm Add to cart nếu có" vào CSV để người chạy tay làm giống |
| C4 | `build-rtm.mjs` lấy **mọi** BUG id trong `notes`: TC-033 sẽ bị gắn BUG-14, TC-034 gắn BUG-17, dù 2 test này không bắt bug đó (TC-033 chỉ giải thích phạm vi) | `scripts/build-rtm.mjs` dòng 37; CSV notes TC-033, TC-034 | 🟡 | Hoặc đổi cách ghi notes của TC-033 (không nhắc BUG id), hoặc RTM chỉ lấy BUG id theo mẫu "Bug đã biết BUG-xx" |

## D. Sai kỹ thuật / sai chuẩn
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| D1 | **TC-024 hết giờ nên 5/12 biến thể không bao giờ được kiểm** (Fleece Jacket bấm ảnh, Onesie ×2, Red T-Shirt ×2). Vì có `test.fail()`, lần chạy vẫn báo "expected" nên lỗi này bị che. Mỗi điểm lỗi tốn 2 lần QUICK (URL + tên) = 4 giây, 12 điểm ≈ 48 giây > 30 giây mặc định | spec dòng 309-320 không có `test.setTimeout`; run 20261125-002432 và lần chạy lại hôm nay: `Test timeout of 30000ms exceeded` + `page.goto: Target page… closed` | 🔴 | Thêm `test.setTimeout(90_000)` như TC-018/019. Đúng tinh thần "một biến thể không được che biến thể khác". Executor phải coi lỗi timeout trong test `test.fail()` là **script-issue** |
| D2 | **TC-022 bước 3 và bước 5 pass trên trang chi tiết, không phải trang danh sách.** Sau `detail.backButton.click()`, `inv.cartButton(backpack)` khớp ngay nút Add/Remove của trang chi tiết (A2) đang còn trên màn hình (A1). Bước 3 mong `Remove`, trang chi tiết cũng đang là `Remove`; bước 5 mong `Add to cart`, trang chi tiết cũng đang là `Add to cart`. Mục đích của TC (đồng bộ chi tiết → danh sách) **không được kiểm** | spec dòng 284-285, 291-292. Script đo trên web theo đúng thao tác của bước 5: đọc được `Add to cart` **trên trang chi tiết 10/10 lần** | 🔴 | Sau mỗi lần về danh sách, chờ `await expect(inv.inventoryList).toBeVisible()` trước khi đọc nút. Tốt hơn: thêm method `ProductDetailPage.backToProducts()` tự chờ `inventory-list` (giống cách đã sửa `logout()`) |
| D3 | **Mở giỏ rồi thao tác ngay, không chờ `cart-list`.** `cart.line(p)` / `cart.removeButton(p)` cũng khớp dòng sản phẩm của trang trước (A2). TC-028: có thể bấm nhầm Remove **ở danh sách**, giỏ vẫn còn đúng 1 dòng Onesie nên test **pass sai**, Remove ở trang giỏ không được kiểm. TC-029: có thể bấm nhầm tên ở danh sách, vẫn tới chi tiết Backpack nên cũng pass sai. TC-034: có thể bấm nhầm Remove ở trang chi tiết, test fail giả | spec dòng 377-378 (TC-028), 388-389 (TC-029), 516-517 (TC-034); `AppPage.openCart()` dòng 36-38 không chờ gì. Script đo theo thao tác TC-028: bấm nhầm nút ở danh sách **1/8 lần với CPU chậm 6×** (0/8 ở tốc độ thường). Chỗ khác đã chờ đúng: dòng 65, 184, 337 | 🟠 | Thêm `await expect(cart.cartList).toBeVisible()` sau mỗi `openCart()`, hoặc thêm method `CartPage.open()` / sửa `openCart()` tự chờ trang đích (PO nên có 1 chỗ chờ, spec khỏi quên) |
| D4 | TC-018/019: bước **Add** bấm cứng, không có "không thấy nút thì ghi lỗi rồi sang biến thể sau" như CSV yêu cầu. Nếu một nút Add biến mất, `click()` treo tới hết 120 giây và che mọi biến thể sau. Bước Remove đã làm đúng (dòng 686, 701) | spec dòng 675, 693 | 🟠 | Làm giống bước Remove: `expect.soft(addButton).toBeVisible(QUICK)` rồi `if (await addButton.isVisible()) click()` |
| D5 | Mốc chờ "đã về danh sách" dùng `inv.items.first()`, không riêng trang danh sách (A2): trang chi tiết có 1 `inventory-item`, trang giỏ có các dòng. Hiện chưa gây sai vì bước sau tự chờ, nhưng là mốc giả | spec dòng 70, 262, 606 | 🟡 | Đổi thành `inv.inventoryList` |
| D6 | TC-041: biến thể danh sách và chi tiết không kiểm điều kiện trước (đã thêm, số giỏ 1) trước khi Reset. Nếu Add không ăn, các assert "không còn số giỏ / nút Add to cart" vẫn pass mà Reset chưa được thử. Biến thể giỏ đã làm đúng (dòng 595) | spec dòng 578-579, 586-587 | 🟡 | Thêm `await expect(inv.cartBadge).toHaveText('1')` (và `detail.cartBadge`) trước `resetAppState()` |
| D7 | Ngân sách thời gian cho test nhiều soft check: TC-025 đã tốn 20 giây với 9 lỗi × 2 giây. Nếu thêm biến thể lỗi (vd tên `ITEM NOT FOUND` sai) sẽ vượt 30 giây, lặp lại lỗi D1 | run 20261125-002432: TC-025 20 346 ms | 🟡 | Thêm `test.setTimeout(60_000)` cho TC-025, TC-026 |
| D8 | Vệ sinh code: fixture không dùng rồi `void page` (dòng 187, 246, 341); `evidence` trong `checkAddRemoveAllProducts` khai kiểu tạm thay vì `Evidence` (dòng 669); TC-038 dùng locator thô `page.getByRole('button', { name: 'Back to products' })` thay vì `detail.backButton` (dòng 542); TC-045 có `waitForLoadState('load')` thừa vì `goto` đã chờ `load` (dòng 657) | như cột trái | 🟡 | Bỏ fixture không dùng, import kiểu `Evidence`, dùng PO |

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Bài học từ TC-043 mới sửa ở `logout()`, chưa thành quy tắc nên các thao tác chuyển trang khác vẫn hở (D2, D3) | A1, D2, D3 | 🟠 | Thêm vào `script-gen.md` và CLAUDE.md: "Method PO nào làm đổi trang phải tự chờ phần tử **riêng** của trang đích (`inventory-list`, `cart-list`, `back-to-products`, `login-button`). Không dùng `inventory-item` làm mốc vì có ở cả 3 trang" |
| E2 | `test.fail()` biến **mọi** lỗi (kể cả timeout, locator sai) thành "expected". Run 20261125-002432 báo 16/16 expected dù TC-024 có timeout | run-results, TC-024 | 🟠 | Bước executor: với mỗi test `test.fail()`, đọc mảng `errors`; có `Test timeout`, `Target page… closed`, lỗi locator thì phân loại **script-issue**, không phải bug. Có thể thêm kiểm tra tự động trong `run-tests.mjs` |
| E3 | Lỗi race chỉ lộ ra trên CI (máy chậm hơn) | TC-043 fail trên CI, pass local | 🟡 | Trước khi chốt script-gen, chạy các test có chuyển trang với `--repeat-each=10` và giả lập CPU chậm (CDP `Emulation.setCPUThrottlingRate`) trong 1 project riêng, không bật mặc định |
| E4 | Thời gian chạy của test nhiều biến thể không được ước lượng trước | D1, D7 | 🟡 | Quy tắc: số soft check có thể fail × timeout QUICK + 30% → nếu > 30 giây thì đặt `test.setTimeout` |

## Việc cần làm trước khi sang executor
1. 🔴 D1: thêm `test.setTimeout` cho TC-024, chạy lại để thấy đủ 24 lỗi (12 điểm × URL + tên), không có timeout.
2. 🔴 D2: TC-022 chờ `inventory-list` sau mỗi lần bấm Back to products.
3. 🟠 D3, D4, E1, E2: chờ `cart-list` sau `openCart()`; guard bước Add ở TC-018/019; ghi quy tắc vào `script-gen.md`; executor lọc lỗi timeout trong test `test.fail()`.
4. 🟡 còn lại có thể gom vào một lần sửa sau, không chặn bước executor.

## Xử lý sau review (2026-11-25)
**Kiểm chứng lại:** chạy lại TC-024 (hết giờ, đúng như D1). Tự tái hiện race ở A1 bằng cách giả lập CPU chậm 8 lần: không chờ trang đích thì 5/10 lần màn hình còn trang cũ, có chờ thì 0/10. Đọc `data-test` của 3 trang: `inventory-item` có ở cả 3 (A2 đúng).

| # | Xử lý |
|---|---|
| A1, A2, D2, D3, D5, E1 | ✅ Page Object tự chờ phần tử riêng của trang đích: `openCart()` chờ `cart-list`, thêm `ProductDetailPage.backToProducts()` và `CartPage.continueShopping()` chờ `inventory-list`, `logout()` chờ nút Login. Spec dùng các method này ở TC-020, 021, 022, 023, 028, 029, `expectCartFlow`. Mốc `inv.items.first()` đổi thành `inventoryList` (TC-042, TC-044). Quy tắc ghi vào `script-gen.md` và `CLAUDE.md` |
| A3, D1 | ✅ TC-024 `test.setTimeout(90_000)`: chạy đủ 12 điểm, 24 lỗi đúng chỗ, không còn hết giờ |
| A4 | ✅ TC-022, 028, 029, 039, 040, 042, 043 chạy lặp 10 lần: 70/70 pass |
| B1 | ✅ TC-025 biến thể 4, 5 kiểm dòng là Backpack; biến thể 4 kiểm số lượng 1 |
| B2 | ✅ TC-033 kiểm nhãn dropdown, từng nút thành Remove rồi về Add to cart, danh sách đồng bộ sau khi thêm / bỏ ở chi tiết |
| B3 | ✅ TC-034 kiểm nhãn dropdown của 4 kiểu sắp xếp |
| B4 | ✅ TC-035 so cả x và y; chờ mọi ảnh tải xong (cả 2 phiên) trước khi đo |
| B5 | ✅ TC-043 kiểm `cart-list` / nút Back to products bị ẩn; TC-045 kiểm như vậy bằng `expect.soft` |
| B6 | ✅ Chụp thêm: TC-013 (chi tiết, giỏ), TC-035 (chi tiết, giỏ), TC-041 (chi tiết, giỏ), TC-043 (chi tiết), TC-045 (chi tiết), TC-018/019 (**mọi** biến thể sai, không chỉ lỗi đầu tiên). TC-030, TC-025 chụp **sau** thao tác gây lỗi. ⏸ TC-044 tab B: chưa làm (fixture evidence chỉ gắn với trang chính), đưa vào backlog; test không phải bug, kết quả tab B đã được kiểm bằng assertion |
| B7 | ✅ Ghi chú TC-020: "khớp dữ liệu chuẩn TD-06" |
| C1 | ✅ Cột `screen`: TC-031, 039, 040, 042, 044 → "Danh sách + Giỏ"; TC-043 → "Chi tiết + Giỏ". TC-037 thêm tag `@list` |
| C2 | ✅ `messages.ts` thêm nhóm `MSG_SHOP` (MSG-01, MSG-03, tiêu đề Checkout), spec dùng nhóm này |
| C3 | ✅ CSV TC-025 thêm bước "nếu có nút Add to cart thì bấm" |
| C4 | ✅ `build-rtm.mjs` chỉ lấy BUG id ở **câu đầu** của `notes` (TC-033 không còn bị gắn BUG-14). CLAUDE.md mục 5 ghi quy ước. TC-034 vẫn gắn BUG-17 (đúng: TC ghi lại bằng chứng của bug này) |
| D4 | ✅ TC-018/019 bước Add: không thấy nút thì ghi lỗi rồi sang biến thể sau |
| D6 | ✅ TC-041 kiểm số giỏ 1 trước khi Reset ở danh sách và chi tiết |
| D7 | ✅ TC-025, TC-026 `test.setTimeout(60_000)` |
| D8 | ✅ Bỏ `void page` và fixture không dùng; `evidence: Evidence`; TC-038 dùng `detail.backButton`; TC-045 bỏ `waitForLoadState` |
| E2 | ✅ `executor.md`: lỗi hết giờ / đóng trang / lỗi code trong test `test.fail()` là script-issue. `run-tests.mjs` tự cảnh báo (đã thử bằng cách cố tình gây lỗi: cảnh báo hiện đúng) |
| E3 | ⏸ Project chạy với CPU chậm: đưa vào backlog. Thay bằng chạy lặp 10 lần các test có chuyển trang |
| E4 | ✅ Quy tắc ước lượng thời gian ghi vào `script-gen.md` |
| (thêm) | ✅ Thêm `npm run typecheck` (TypeScript) và bước Type check trên CI. Lý do: khi sửa, một biến bị xóa sót (`page`) gây `ReferenceError` ở TC-025, và vì test có `test.fail()` nên lỗi này bị tính là "fail như mong đợi". `tsc` bắt được lỗi này trước khi chạy |

> **Bổ sung 2026-11-25 sau review-executor (bài học L8):** 2 dòng ✅ ở trên chưa đúng hết lúc ghi: B1 (kiểm số lượng TC-025 gặp `strict mode violation`, không đo được gì) và E2 (cảnh báo chỉ đọc dòng đầu của lỗi). C2, B4, E4 mới làm một phần. Đã sửa xong, xem `review-executor.md` mục "Xử lý sau review".
