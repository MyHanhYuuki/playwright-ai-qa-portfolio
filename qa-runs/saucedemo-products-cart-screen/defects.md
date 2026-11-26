# Bug report: SD-102 Danh sách sản phẩm, chi tiết, giỏ hàng

> **Người báo**: MyHanhYuuki (QC) · **Ngày**: 2026-11-25 · **Trạng thái duyệt**: HITL #3 (2026-11-25) duyệt 16 bug, giữ mức đề xuất, riêng BUG-06 nâng Medium; **BUG-21** phát hiện sau đó (review-defects A3), người duyệt chốt là bug Low, sau review cuối (phần mô tả bị mất) **nâng lên Medium**.
> **Lần chạy**: [`run-20261125-150817`](run-results/run-20261125-150817.json) (nội dung lỗi trong `error_details`) · chạy lặp [`stability-20261125-1512`](run-results/stability-20261125-1512.json) · phân loại: [`triage.md`](triage.md).
> **Evidence tự động** chụp ngay sau lần chạy trên, cùng code (`npm run test:evidence`). **Tái hiện độc lập** (2026-11-25): script riêng [`tests/repro/saucedemo-products-cart-screen.repro.ts`](../../tests/repro/saucedemo-products-cart-screen.repro.ts) (`npm run repro`), **không** dùng code test, mỗi tình huống phiên trình duyệt mới, chạy 2 lần; ảnh trong thư mục `manual/` của từng bug. Các bước dưới đây viết để làm **bằng tay**; script làm đúng các bước đó bằng locator riêng.
> Ticket chưa log lên hệ thống quản lý bug nên tạm ghi `[id_bug_n]` (xem `tests/data/bugs.ts`).
> **Tài khoản đặc biệt**: trên SauceDemo, `problem_user`, `error_user`, `visual_user` được làm lỗi **cố ý** để luyện test. Theo Q1, mọi tài khoản đăng nhập được phải hoạt động như `standard_user`, nên các lỗi này được báo như bug thật.

**Môi trường chung**: https://www.saucedemo.com · Chromium (Playwright 1.65.1, Desktop Chrome, 1280×720) · Windows 11 · 2026-11-25.
**Điều kiện trước chung**: phiên trình duyệt mới (cửa sổ ẩn danh), giỏ trống. Mật khẩu hợp lệ in sẵn trên trang đăng nhập. Giỏ lưu ở `localStorage` và còn lại sau đăng xuất, nên **mỗi lần tái hiện phải mở phiên mới**.
**Bước dùng DevTools Console**: F12 → tab Console. Nếu Chrome chặn dán lệnh, gõ `allow pasting` rồi Enter trước.
**Tần suất**: mọi bug **100%**: lần chạy chính thức (đọc `error_details`: fail đúng assertion của bug) và tái hiện độc lập 2/2 lần. Chạy lặp ×2 chỉ ghi "đúng như mong đợi / không", dùng để chứng minh test không chập chờn, không dùng làm bằng chứng nội dung lỗi.

## Tổng hợp
| Bug | Màn hình | Ticket | Test case | Tiêu đề | Severity | Priority (đề xuất) | Trạng thái |
|---|---|---|---|---|---|---|---|
| [BUG-07](#bug-07) | Danh sách + Giỏ | `[id_bug_7]` | TC-040 | Người đăng nhập sau thấy, sửa, xóa được giỏ của người trước | High | P1 | Open |
| [BUG-14](#bug-14) | Cả 3 | `[id_bug_14]` | TC-013 | `visual_user`: giá ở danh sách sai, đổi mỗi lần tải | Critical | P1 | Open |
| [BUG-10](#bug-10) | Danh sách + Chi tiết | `[id_bug_10]` | TC-018 | `problem_user`: Add / Remove không có tác dụng với 3 + 3 sản phẩm | High | P1 | Open |
| [BUG-13](#bug-13) | Danh sách + Chi tiết | `[id_bug_13]` | TC-019 | `error_user`: Add / Remove không có tác dụng, ném lỗi JavaScript | High | P1 | Open |
| [BUG-11](#bug-11) | Danh sách + Giỏ → Chi tiết | `[id_bug_11]` | TC-024 | `problem_user`: bấm sản phẩm mở trang của sản phẩm id + 1 | High | P1 | Open |
| [BUG-02](#bug-02) | Chi tiết + Giỏ | `[id_bug_2]` | TC-045 | (biến thể) Cookie tự tạo vào được trang giỏ và trang chi tiết | High | P1 | Open (gộp ticket BUG-02) |
| [BUG-05](#bug-05) | Cả 3 | `[id_bug_5]` | TC-041 | Reset App State xóa giỏ nhưng giao diện không cập nhật | Medium | P2 | Open |
| [BUG-06](#bug-06) | Chi tiết + Giỏ | `[id_bug_6]` | TC-025 | Giỏ không kiểm tra dữ liệu: thêm được sản phẩm không tồn tại, hiện dữ liệu trùng, số giỏ sai | Medium | P3 | Open |
| [BUG-16](#bug-16) | Cả 3 | `[id_bug_16]` | TC-035 | `visual_user`: biểu tượng giỏ, menu lệch và bị xoay | Low | P3 | Open |
| [BUG-09](#bug-09) | Danh sách | `[id_bug_9]` | TC-011 | `problem_user`: sắp xếp không hoạt động | High | P2 | Open |
| [BUG-12](#bug-12) | Danh sách | `[id_bug_12]` | TC-012 | `error_user`: sắp xếp báo lỗi, danh sách không đổi | High | P2 | Open |
| [BUG-08](#bug-08) | Danh sách | `[id_bug_8]` | TC-004 | `problem_user`: cả 6 ảnh sản phẩm là ảnh lỗi | Medium | P2 | Open |
| [BUG-15](#bug-15) | Danh sách | `[id_bug_15]` | TC-005 | `visual_user`: ảnh Backpack là ảnh lỗi | Low | P3 | Open |
| [BUG-20](#bug-20) | Chi tiết | `[id_bug_20]` | TC-026 | id sai định dạng vẫn mở sản phẩm | Low | P3 | Open |
| [BUG-21](#bug-21) | Chi tiết | `[id_bug_21]` | TC-046 | `error_user`: trang chi tiết mất mô tả sản phẩm, có lỗi render | Medium | P2 | Open |
| [BUG-18](#bug-18) | Giỏ | `[id_bug_18]` | TC-036 | `visual_user`: nút Checkout bị đẩy lên vùng tiêu đề | Medium | P2 | Open |
| [BUG-19](#bug-19) | Giỏ | `[id_bug_19]` | TC-030 | Giỏ trống vẫn sang được bước thanh toán | Low | P3 | Open |

> **Severity** (mức nghiêm trọng): QC đánh giá theo ảnh hưởng. **Priority** (mức ưu tiên sửa): PO/PM chốt, QC chỉ đề xuất. P1 sửa trước release · P2 nên sửa trong đợt này · P3 sửa khi tiện. Mỗi bug ghi lý do cho cả hai.
> **Cách chọn priority** ở đây: P1 = chặn mua hàng, sai tiền, hoặc lỗ hổng bảo mật; P2 = chức năng sai nhưng vẫn mua được (có cách khác); P3 = giao diện, lỗi ngầm, hoặc phải thao tác bất thường (sửa URL, dữ liệu) mới gặp.

---

## Chung: lỗi ở nhiều màn hình

<a id="bug-07"></a>
### BUG-07: [Giỏ hàng] Người đăng nhập sau thấy, sửa, xóa được giỏ của người trước
| | |
|---|---|
| **Ticket** | `[id_bug_7]` |
| **Severity** | **High**: lộ dữ liệu của người khác và làm hỏng giỏ của họ trên máy dùng chung (với hệ thống thật là lỗi bảo mật, quyền riêng tư) |
| **Priority** | **P1**: lỗi bảo mật / toàn vẹn dữ liệu, xảy ra với mọi tài khoản, chỉ cần đổi người dùng trên cùng trình duyệt |
| **Liên quan** | AC-7 · Q3 (giỏ theo tài khoản) · TVP-018 · TC-040 · O-16 · tag `@security` |

Mỗi biến thể từ một phiên trình duyệt mới.

| | 1. Đọc | 2. Đọc, chiều ngược | 3. Ghi | 4. Xóa |
|---|---|---|---|---|
| **Các bước** | `standard_user` thêm Sauce Labs Backpack, Sauce Labs Bike Light, đăng xuất (☰ → Logout); `visual_user` đăng nhập, mở giỏ | `visual_user` thêm Sauce Labs Onesie, đăng xuất; `standard_user` đăng nhập, mở giỏ | Như biến thể 1; `visual_user` thêm Onesie, đăng xuất; `standard_user` đăng nhập lại, mở giỏ | Như biến thể 1; `visual_user` bấm Remove ở Backpack, đăng xuất; `standard_user` đăng nhập lại, mở giỏ |
| **Mong đợi** (Q3) | Giỏ `visual_user` trống, không có số giỏ | Giỏ `standard_user` trống | Giỏ `standard_user` đúng Backpack, Bike Light | Giỏ `standard_user` vẫn Backpack, Bike Light |
| **Thực tế** | Thấy Backpack, Bike Light của `standard_user` | Thấy Onesie của `visual_user` | **3** dòng (thêm Onesie), số giỏ 3 | Chỉ còn Bike Light, số giỏ 1 |

**Nguyên nhân dự đoán**: giỏ lưu ở `localStorage` khóa `cart-contents` (chung cho trình duyệt), không gắn với tài khoản, không xóa khi đăng xuất.

![BUG-07 biến thể 3](<evidence/bugs/[id_bug_7]_BUG-07/manual/03-nguoi-sau-sua-gio.png>)

**Evidence**: [tự động, 4 biến thể](<evidence/bugs/[id_bug_7]_BUG-07/TC-040/README.md>) · [tái hiện độc lập, 4 biến thể](<evidence/bugs/[id_bug_7]_BUG-07/manual/README.md>)
**Test tự động**: TC-040, 4 biến thể bằng `expect.soft`, `test.fail()`.

---

<a id="bug-14"></a>
### BUG-14: [Giá] `visual_user` thấy giá ở danh sách sai, đổi mỗi lần tải trang
| | |
|---|---|
| **Ticket** | `[id_bug_14]` |
| **Severity** | **Critical**: hiển thị sai giá, người dùng quyết định mua theo giá sai (với hệ thống thật là lỗi tiền, pháp lý) |
| **Priority** | **P1**: sai tiền, ảnh hưởng mọi sản phẩm |
| **Liên quan** | AC-1, AC-5 (giá ở chi tiết phải giống danh sách) · Q1 · TVP-024 · TC-013 · O-24 |

**Các bước**: 1. Đăng nhập `visual_user` · 2. Xem giá 6 sản phẩm · 3. Tải lại trang (F5), xem lại giá · 4. Bấm tên Sauce Labs Backpack · 5. Bấm Add to cart, mở giỏ.

**Mong đợi** (AC-1, AC-5, dữ liệu chuẩn TD-06): Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Red T-Shirt $15.99; giá ở danh sách bằng giá ở chi tiết và giỏ.

**Thực tế**: giá ở danh sách sai **và khác nhau mỗi lần tải** (xem [tái hiện độc lập](<evidence/bugs/[id_bug_14]_BUG-14/manual/README.md>): 2 lần tải cho 2 bộ giá khác nhau). Trang chi tiết và giỏ hiện **đúng** `$29.99`. Một lần chạy thử (2026-11-26, không lưu bằng chứng) còn thấy giá ngẫu nhiên **thiếu số 0 cuối** (`$74.2` thay vì `$74.20`): cùng bộ sinh giá ngẫu nhiên của BUG-14; annotation 2 lần tải của TC-013 sẽ ghi lại nếu gặp lại. Thứ tự khi sắp theo giá vẫn đúng theo giá thật, chỉ phần hiển thị sai.

![BUG-14](<evidence/bugs/[id_bug_14]_BUG-14/manual/01-gia-lan-1.png>)

**Evidence**: [tự động: danh sách, chi tiết, giỏ](<evidence/bugs/[id_bug_14]_BUG-14/TC-013/README.md>) · [tái hiện độc lập: 2 lần tải, chi tiết, giỏ](<evidence/bugs/[id_bug_14]_BUG-14/manual/README.md>)
**Test tự động**: TC-013, `test.fail()`. Từ 2026-11-26 TC-013 tải lại danh sách và ghi giá của 2 lần tải vào annotation (vd lần 1 Backpack `$12.33`, lần 2 `$60.35`): bằng chứng tự động cho "đổi mỗi lần tải".

---

<a id="bug-10"></a>
### BUG-10: [Thêm / bỏ giỏ] `problem_user` thêm hoặc bỏ không được 3 + 3 sản phẩm
| | |
|---|---|
| **Ticket** | `[id_bug_10]` |
| **Severity** | **High**: không mua được 3/6 sản phẩm, không bỏ được 3/6 sản phẩm ở danh sách và chi tiết |
| **Priority** | **P1**: chặn luồng mua hàng chính |
| **Liên quan** | AC-3, AC-4, AC-5 · Q1 · TVP-022 · TC-018 · O-20 |

**Các bước** (mỗi bước từ phiên mới, đăng nhập `problem_user`): 1. Danh sách: bấm **Add to cart** ở Sauce Labs Bolt T-Shirt · 2. Danh sách: thêm Sauce Labs Backpack rồi bấm **Remove** · 3. Mở chi tiết Fleece Jacket (`/inventory-item.html?id=5`), bấm **Add to cart**.

**Mong đợi** (AC-3, AC-4): Add → nút thành `Remove`, số giỏ tăng 1. Remove → nút về `Add to cart`, số giỏ giảm.

**Thực tế**: bấm không có tác dụng. Đủ 12 trường hợp lỗi (test tự động):

| | Danh sách | Chi tiết |
|---|---|---|
| **Add không ăn** | Bolt T-Shirt, Fleece Jacket, Red T-Shirt | Bolt T-Shirt, Fleece Jacket, Red T-Shirt |
| **Remove không ăn** | Backpack, Bike Light, Onesie | Backpack, Bike Light, Onesie |

Đối chứng: bỏ ở **trang giỏ** thì được (đã tái hiện). 3 sản phẩm còn lại thêm / bỏ bình thường.

![BUG-10](<evidence/bugs/[id_bug_10]_BUG-10/manual/01-danh-sach-add-bolt.png>)

**Evidence**: [tự động: 12 ảnh, mỗi biến thể lỗi một ảnh](<evidence/bugs/[id_bug_10]_BUG-10/TC-018/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_10]_BUG-10/manual/README.md>)
**Test tự động**: TC-018, 24 điểm kiểm (6 sản phẩm × Add / Remove × 2 trang), `test.fail()`.

---

<a id="bug-13"></a>
### BUG-13: [Thêm / bỏ giỏ] `error_user` thêm hoặc bỏ không được 3 + 3 sản phẩm, trang ném lỗi JavaScript
| | |
|---|---|
| **Ticket** | `[id_bug_13]` |
| **Severity** | **High**: như BUG-10 |
| **Priority** | **P1**: như BUG-10, chặn luồng mua hàng |
| **Liên quan** | AC-3, AC-4, AC-5 · Q1 · TVP-022 · TC-019 · O-23 · MSG-05, MSG-06 |

**Các bước, mong đợi**: như BUG-10, đăng nhập `error_user`.

**Thực tế**: cùng 3 + 3 sản phẩm như BUG-10, ở cả danh sách và chi tiết; bỏ ở trang giỏ thì được. Mỗi lần bấm không ăn, trang ném **lỗi JavaScript không được bắt** (DevTools hiện ở tab Console, Playwright bắt qua `pageerror`) và gửi 1 request tới `submit.backtrace.io`:
- Add: `Failed to add item to the cart.` (MSG-05)
- Remove: `Failed to remove item from cart.` (MSG-06)

Ở trang chi tiết còn có thêm lỗi lúc mở trang làm mất mô tả sản phẩm (BUG-21, báo riêng).

![BUG-13](<evidence/bugs/[id_bug_13]_BUG-13/manual/02-danh-sach-remove-backpack.png>)

**Evidence**: [tự động: 12 ảnh](<evidence/bugs/[id_bug_13]_BUG-13/TC-019/README.md>) · [tái hiện độc lập, có nội dung lỗi](<evidence/bugs/[id_bug_13]_BUG-13/manual/README.md>) · nội dung lỗi trong `annotations` của TC-019 trong run JSON
**Test tự động**: TC-019, 24 điểm kiểm, `test.fail()`; lỗi JavaScript chỉ ghi làm bằng chứng.

---

<a id="bug-11"></a>
### BUG-11: [Mở chi tiết] `problem_user` bấm sản phẩm mở trang của sản phẩm id + 1
| | |
|---|---|
| **Ticket** | `[id_bug_11]` |
| **Severity** | **High**: người dùng xem và mua nhầm sản phẩm |
| **Priority** | **P1**: ảnh hưởng mọi sản phẩm, ở cả danh sách và giỏ |
| **Liên quan** | AC-5 · Q1 · TVP-023 · TC-024 · O-21 |

**Các bước** (mỗi bước từ phiên mới, đăng nhập `problem_user`): 1. Danh sách: bấm **tên** Sauce Labs Backpack · 2. Danh sách: bấm **ảnh** Sauce Labs Fleece Jacket · 3. Console: `localStorage.setItem("cart-contents","[0]")`, mở `/cart.html`, bấm **tên** Sauce Labs Bike Light trong giỏ.

**Mong đợi** (AC-5): mở đúng chi tiết sản phẩm vừa bấm (`?id=` đúng TD-06).

**Thực tế**: luôn mở sản phẩm có id **lớn hơn đúng 1 đơn vị** (id + 1; quy luật giúp dev tìm nguyên nhân), ở cả tên, ảnh và trang giỏ:

| Bấm | id đúng | Mở | Hiện |
|---|---|---|---|
| Bike Light | 0 | `?id=1` | Bolt T-Shirt |
| Bolt T-Shirt | 1 | `?id=2` | Onesie |
| Onesie | 2 | `?id=3` | Red T-Shirt |
| Red T-Shirt | 3 | `?id=4` | Backpack |
| Backpack | 4 | `?id=5` | Fleece Jacket |
| Fleece Jacket | 5 | `?id=6` | `ITEM NOT FOUND` |

![BUG-11](<evidence/bugs/[id_bug_11]_BUG-11/manual/01-bam-ten-backpack.png>)

**Evidence**: [tự động: 18 ảnh](<evidence/bugs/[id_bug_11]_BUG-11/TC-024/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_11]_BUG-11/manual/README.md>)
**Test tự động**: TC-024, 18 điểm (6 sản phẩm × tên, ảnh ở danh sách, tên ở giỏ), `test.fail()`.

---

<a id="bug-02"></a>
### BUG-02: [Kiểm soát truy cập] (biến thể SD-102) Cookie tự tạo vào được trang giỏ và trang chi tiết
| | |
|---|---|
| **Ticket** | `[id_bug_2]` (**gộp vào ticket BUG-02** của SD-101, không tạo ticket mới) |
| **Severity** | **High** như BUG-02 (với hệ thống thật là Critical) |
| **Priority** | **P1**: lỗ hổng bảo mật, vượt qua đăng nhập |
| **Liên quan** | AC-5, AC-6 · TVP-037 · TC-045 · O-30 · SD-101 [`defects.md`](../saucedemo-login-screen/defects.md) BUG-02 · tag `@security` |

**Các bước**: 1. Mở https://www.saucedemo.com (chưa đăng nhập) · 2. DevTools Console: `document.cookie = "session-username=standard_user"` · 3. Mở `/cart.html`, rồi `/inventory-item.html?id=4`.

**Mong đợi** (AC-6, như BUG-02): về trang đăng nhập, thông báo `Epic sadface: You can only access '/cart.html' when you are logged in.` (tương tự `/inventory-item.html`).

**Thực tế**: vào thẳng trang giỏ và trang chi tiết Backpack, không có thông báo.

![BUG-02 biến thể](<evidence/bugs/[id_bug_2]_BUG-02/manual/01-cookie-gia-mo-gio.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_2]_BUG-02/TC-045/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_2]_BUG-02/manual/README.md>)
**Test tự động**: TC-045, `test.fail()`, tag `@BUG-02`. Khi sửa BUG-02 phải kiểm cả trang giỏ, chi tiết (TC-045) và trang Products (SD-101 TC-033).

---

<a id="bug-05"></a>
### BUG-05: [Menu] Reset App State xóa giỏ nhưng giao diện không cập nhật
| | |
|---|---|
| **Ticket** | `[id_bug_5]` |
| **Severity** | **Medium**: người dùng tưởng giỏ còn hàng, nút hiện sai trạng thái |
| **Priority** | **P2**: chức năng phụ; tải lại trang thì đúng, không mất dữ liệu |
| **Liên quan** | AC-3, AC-4, AC-7 · Q4 · TVP-019 · TC-041 · O-17 |

**Các bước** (đăng nhập `standard_user`, mỗi trường hợp từ phiên mới): 1. Danh sách: bấm Add to cart ở Sauce Labs Backpack, ☰ → **Reset App State** · 2. Chi tiết `?id=4`: bấm Add to cart, Reset App State · 3. **Ở danh sách** thêm Backpack, mở giỏ, Reset App State.

**Mong đợi** (Q4): giỏ trống, mọi nút về `Add to cart`, trang giỏ không còn dòng nào, **không cần tải lại**.

**Thực tế**: số trên giỏ mất (đúng), nhưng nút ở danh sách và chi tiết vẫn `Remove`, trang giỏ vẫn hiện 1 dòng Backpack. Tải lại trang thì đúng (dữ liệu đã xóa, chỉ giao diện không cập nhật).

![BUG-05](<evidence/bugs/[id_bug_5]_BUG-05/manual/01-danh-sach-sau-reset.png>)

**Evidence**: [tự động: 3 trang](<evidence/bugs/[id_bug_5]_BUG-05/TC-041/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_5]_BUG-05/manual/README.md>)
**Test tự động**: TC-041, 3 trang bằng `expect.soft`, `test.fail()`.

---

<a id="bug-06"></a>
### BUG-06: [Dữ liệu giỏ] Giỏ không kiểm tra dữ liệu: thêm được sản phẩm không tồn tại, hiện dữ liệu trùng, số giỏ sai
| | |
|---|---|
| **Ticket** | `[id_bug_6]` |
| **Severity** | **Medium** (HITL #3 nâng từ Low): số giỏ và giỏ hiện sai, người dùng tin giỏ có hàng |
| **Priority** | **P3**: chỉ gặp khi sửa URL hoặc dữ liệu trình duyệt bằng tay |
| **Liên quan** | AC-3, AC-5, AC-6 · Q2 (kèm bổ sung 2026-11-25) · TVP-011, TVP-036 · TC-025 · O-08, O-09, O-31 |

| | A. Sản phẩm không tồn tại | B. Dữ liệu giỏ trùng id | C. Dữ liệu giỏ có id lạ |
|---|---|---|---|
| **Các bước** | 1. Đăng nhập `standard_user`<br>2. Mở `/inventory-item.html?id=99` (cũng thử `?id=6`, `?id=-1`)<br>3. Bấm **Add to cart**, mở giỏ | 1. Đăng nhập `standard_user`<br>2. Console: `localStorage.setItem("cart-contents","[4,4]")`<br>3. Mở `/cart.html` | 1. Đăng nhập `standard_user`<br>2. Console: `localStorage.setItem("cart-contents",'[4,"x"]')`<br>3. Mở `/cart.html` |
| **Mong đợi** | Q2: trang báo `ITEM NOT FOUND` (MSG-03), **không có** nút Add to cart, không có số giỏ | Q2 bổ sung (người duyệt chọn 2026-11-25): **bỏ qua phần trùng**: 1 dòng Backpack, số lượng 1, số giỏ 1 (mỗi sản phẩm tối đa 1) | Q2: số giỏ bằng số dòng thật: số giỏ 1, 1 dòng Backpack |
| **Thực tế** | `ITEM NOT FOUND` nhưng **có** nút Add to cart (cả 3 id); bấm xong số giỏ 1, giỏ 0 dòng | Số giỏ 2, **2 dòng** Backpack (mỗi dòng số lượng 1) | Số giỏ **2**, giỏ 1 dòng Backpack |

![BUG-06](<evidence/bugs/[id_bug_6]_BUG-06/manual/02-gio-sau-id-99.png>)

**Evidence**: [tự động: 3 ảnh (id=99, `[4,4]`, `[4,"x"]`), test kiểm đủ 5 biến thể](<evidence/bugs/[id_bug_6]_BUG-06/TC-025/README.md>) · [tái hiện độc lập: đủ 5 biến thể](<evidence/bugs/[id_bug_6]_BUG-06/manual/README.md>)
**Test tự động**: TC-025, `test.fail()`.

---

<a id="bug-16"></a>
### BUG-16: [Giao diện] `visual_user`: biểu tượng giỏ, menu lệch và bị xoay ở cả 3 màn hình
| | |
|---|---|
| **Ticket** | `[id_bug_16]` |
| **Severity** | **Low**: lỗi giao diện, vẫn dùng được |
| **Priority** | **P3**: thẩm mỹ, không chặn thao tác |
| **Liên quan** | AC-1, AC-3, AC-6 · Q1, Q11 · TVP-025 · TC-035 · O-25 |

**Các bước**: mở danh sách bằng `visual_user` và `standard_user` (2 cửa sổ cùng cỡ 1280×720); đo biểu tượng giỏ bằng DevTools Console: `document.querySelector('.shopping_cart_container').getBoundingClientRect()` (vị trí) và `getComputedStyle(document.querySelector('.shopping_cart_container')).transform` (xoay); tương tự `.bm-icon` (menu ☰). Lặp lại ở trang chi tiết `?id=4` và trang giỏ.

**Mong đợi** (Q11): vị trí như `standard_user` (sai số ≤ 5 px), không xoay (`transform: none`).

**Thực tế** (cả 3 trang): biểu tượng giỏ lệch **186 px** ngang, **29 px** dọc (`standard_user` x=1220, y=10; `visual_user` x=1034, y=39) và xoay ~3° (`matrix(0.99863, 0.052336, …)`); biểu tượng menu xoay ~3°. Riêng danh sách: nút Add của Red T-Shirt lệch 54 px ngang.

![BUG-16](<evidence/bugs/[id_bug_16]_BUG-16/manual/02-visual_user.png>)

**Evidence**: [tự động: 3 trang + nút Red T-Shirt](<evidence/bugs/[id_bug_16]_BUG-16/TC-035/README.md>) · [tái hiện độc lập, so 2 tài khoản](<evidence/bugs/[id_bug_16]_BUG-16/manual/README.md>)
**Test tự động**: TC-035 so tọa độ và `transform` với `standard_user`, `test.fail()`.

---

## Màn hình 1: Danh sách sản phẩm

<a id="bug-09"></a>
### BUG-09: [Sắp xếp] `problem_user` chọn kiểu sắp xếp nhưng danh sách không đổi
| | |
|---|---|
| **Ticket** | `[id_bug_9]` |
| **Severity** | **High**: chức năng chính của AC-2 không dùng được |
| **Priority** | **P2**: không chặn mua hàng (chỉ 6 sản phẩm, vẫn tìm được bằng mắt), khác BUG-10 / BUG-13 (P1, chặn mua) |
| **Liên quan** | AC-2 · Q1 · TVP-021 · TC-011 · O-19 |

**Các bước**: đăng nhập `problem_user`, chọn lần lượt `Name (Z to A)`, `Price (low to high)`, `Price (high to low)`.
**Mong đợi** (AC-2): nhãn dropdown đổi theo lựa chọn, thứ tự đúng TD-06 (vd Z→A: Test.allTheThings() T-Shirt (Red) đứng đầu).
**Thực tế**: cả 3 kiểu, nhãn vẫn `Name (A to Z)`, Sauce Labs Backpack vẫn đứng đầu, không có thông báo.

![BUG-09](<evidence/bugs/[id_bug_9]_BUG-09/manual/01-chon-za.png>)

**Evidence**: [tự động: 3 kiểu](<evidence/bugs/[id_bug_9]_BUG-09/TC-011/README.md>) · [tái hiện độc lập: 3 kiểu](<evidence/bugs/[id_bug_9]_BUG-09/manual/README.md>) · **Test tự động**: TC-011.

---

<a id="bug-12"></a>
### BUG-12: [Sắp xếp] `error_user` chọn kiểu sắp xếp thì hiện hộp thoại lỗi, danh sách không đổi
| | |
|---|---|
| **Ticket** | `[id_bug_12]` |
| **Severity** | **High**: như BUG-09, thêm hộp thoại lỗi chặn màn hình |
| **Priority** | **P2**: như BUG-09, không chặn mua hàng |
| **Liên quan** | AC-2 · Q1 · TVP-021 · TC-012 · O-22 · MSG-01 |

**Các bước**: đăng nhập `error_user`, chọn lần lượt `Name (Z to A)`, `Price (low to high)`, `Price (high to low)`.
**Mong đợi** (AC-2): sắp xếp đúng, không có hộp thoại.
**Thực tế**: cả 3 kiểu, mỗi lần chọn hiện hộp thoại của trình duyệt `Sorting is broken! This error has been reported to Backtrace.` (MSG-01); nhãn và thứ tự không đổi.

![BUG-12](<evidence/bugs/[id_bug_12]_BUG-12/manual/01-chon-za.png>)

**Evidence**: [tự động: 3 kiểu, nội dung hộp thoại ghi trong ảnh](<evidence/bugs/[id_bug_12]_BUG-12/TC-012/README.md>) · [tái hiện độc lập: 3 kiểu](<evidence/bugs/[id_bug_12]_BUG-12/manual/README.md>) · **Test tự động**: TC-012 (kiểm hộp thoại đúng MSG-01).

---

<a id="bug-08"></a>
### BUG-08: [Ảnh sản phẩm] `problem_user`: cả 6 ảnh sản phẩm là ảnh lỗi
| | |
|---|---|
| **Ticket** | `[id_bug_8]` |
| **Severity** | **Medium**: không nhận ra sản phẩm qua ảnh |
| **Priority** | **P2**: vẫn mua được (tên, mô tả đúng), nhưng ảnh hưởng mọi sản phẩm |
| **Liên quan** | AC-1 · Q1 · TVP-020 · TC-004 · O-18 |

**Các bước**: đăng nhập `problem_user`, xem ảnh 6 sản phẩm.
**Mong đợi** (AC-1, Q1): mỗi sản phẩm có ảnh của chính nó (như `standard_user`).
**Thực tế**: cả 6 ảnh là cùng một ảnh lỗi (`sl-404…jpg`).

![BUG-08](<evidence/bugs/[id_bug_8]_BUG-08/manual/01-anh-problem-user.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_8]_BUG-08/TC-004/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_8]_BUG-08/manual/README.md>) · **Test tự động**: TC-004.

---

<a id="bug-15"></a>
### BUG-15: [Ảnh sản phẩm] `visual_user`: ảnh Backpack là ảnh lỗi
| | |
|---|---|
| **Ticket** | `[id_bug_15]` |
| **Severity** | **Low**: 1 ảnh, tên và mô tả vẫn đúng |
| **Priority** | **P3**: thẩm mỹ, 1 sản phẩm |
| **Liên quan** | AC-1 · Q1 · TVP-020 · TC-005 · O-25 |

**Các bước**: đăng nhập `visual_user`, xem ảnh Sauce Labs Backpack.
**Mong đợi** (AC-1: mỗi sản phẩm có ảnh; Q1: như `standard_user`): ảnh balo.
**Thực tế**: ảnh lỗi `sl-404…jpg`; 5 ảnh còn lại đúng.

![BUG-15](<evidence/bugs/[id_bug_15]_BUG-15/manual/01-anh-visual-user.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_15]_BUG-15/TC-005/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_15]_BUG-15/manual/README.md>) · **Test tự động**: TC-005.

---

## Màn hình 2: Chi tiết sản phẩm

<a id="bug-20"></a>
### BUG-20: [Trang chi tiết] id sai định dạng vẫn mở sản phẩm thay vì báo không tìm thấy
| | |
|---|---|
| **Ticket** | `[id_bug_20]` |
| **Severity** | **Low**: phải sửa URL bằng tay mới gặp, không mất dữ liệu |
| **Priority** | **P3**: thao tác bất thường |
| **Liên quan** | AC-5 · Q2 · TVP-035 · TC-026 · O-33 · TD-08 |

**Các bước**: đăng nhập `standard_user`, mở lần lượt `/inventory-item.html?id=` với các giá trị bên dưới.
**Mong đợi** (Q2): id sai định dạng báo `ITEM NOT FOUND` (MSG-03) như id ngoài khoảng.
**Thực tế**: id được đọc như số:

| Giá trị | Hiện |
|---|---|
| `4abc`, `04`, `4.9`, `0x4`, ` 4` (`%204`), `+4` (`%2B4`), `4e0` | Sauce Labs Backpack |
| `-0` | Sauce Labs Bike Light |
| `abc`, rỗng (đối chứng) | `ITEM NOT FOUND` (đúng) |

![BUG-20](<evidence/bugs/[id_bug_20]_BUG-20/manual/01-id-4abc.png>)

**Evidence**: [tự động: 10 giá trị](<evidence/bugs/[id_bug_20]_BUG-20/TC-026/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_20]_BUG-20/manual/README.md>) · **Test tự động**: TC-026.

---

<a id="bug-21"></a>
### BUG-21: [Trang chi tiết] `error_user` mở trang chi tiết thì mất mô tả sản phẩm, console báo lỗi render
| | |
|---|---|
| **Ticket** | `[id_bug_21]` |
| **Severity** | **Medium** (người duyệt nâng từ Low sau review cuối): thiếu thông tin sản phẩm trên trang chi tiết, vi phạm AC-5 |
| **Priority** | **P2**: vẫn mua được (tên, giá, nút đúng) nhưng mọi trang chi tiết đều thiếu mô tả |
| **Liên quan** | AC-5 · Q1 · TVP-045 · TC-046 · O-36 · MSG-07 · phát hiện ở review-defects A3; phần mất mô tả phát hiện ở review-final A1 |

**Các bước**: 1. Đăng nhập `error_user` · 2. Mở DevTools, tab **Console** và tab **Network** · 3. Bấm tên Sauce Labs Backpack (hoặc bất kỳ sản phẩm nào) để mở trang chi tiết · 4. So với cùng trang khi đăng nhập `standard_user`.
**Mong đợi** (AC-5, Q1: như `standard_user`): trang chi tiết có ảnh, tên, **mô tả**, giá; không có lỗi trong console, không có request báo lỗi.
**Thực tế**: mỗi lần mở trang chi tiết (cả 6 sản phẩm): **không có phần mô tả** (vd Backpack thiếu đoạn "carry.allTheThings() with the sleek…"); console báo `Error: This component failed to render!` (MSG-07) và trang gửi 1 request tới `submit.backtrace.io`. Tên, giá, ảnh, nút vẫn đúng. Đối chứng: `standard_user` có đủ mô tả, không lỗi; danh sách, giỏ của `error_user` vẫn có mô tả, không lỗi.

![BUG-21](<evidence/bugs/[id_bug_21]_BUG-21/manual/01-error_user.png>)

**Evidence**: [tự động: 6 ảnh (mỗi trang chi tiết một ảnh), nội dung lỗi ghi trong ảnh và `annotations`](<evidence/bugs/[id_bug_21]_BUG-21/TC-046/README.md>) · [tái hiện độc lập, có đối chứng `standard_user`](<evidence/bugs/[id_bug_21]_BUG-21/manual/README.md>)
**Test tự động**: TC-046 kiểm mô tả, giá, lỗi console, request báo lỗi ở cả 6 trang (18 điểm sai), `test.fail()`. Đã thử test với `standard_user`: test pass, tức là test phân biệt được đúng / sai.

---

## Màn hình 3: Giỏ hàng

<a id="bug-18"></a>
### BUG-18: [Trang giỏ] `visual_user`: nút Checkout bị đẩy lên vùng tiêu đề
| | |
|---|---|
| **Ticket** | `[id_bug_18]` |
| **Severity** | **Medium**: nút chính của trang nằm sai chỗ, khó thấy |
| **Priority** | **P2**: vẫn bấm được nhưng nằm ở nút chính của luồng mua hàng |
| **Liên quan** | AC-6 · Q1, Q11 · TVP-025 · TC-036 · O-29 |

**Các bước**: đăng nhập `visual_user`, thêm Backpack, mở giỏ; so với `standard_user`. Đo bằng Console: `document.querySelector('#checkout').getBoundingClientRect().y` và `#continue-shopping`.
**Mong đợi** (Q11): nút Checkout cùng hàng với Continue Shopping (như `standard_user`: cả 2 ở y=412).
**Thực tế**: Checkout ở y=0 (góc trên phải, đè vùng tiêu đề), lệch 412 px so với Continue Shopping.

![BUG-18](<evidence/bugs/[id_bug_18]_BUG-18/manual/02-visual_user.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_18]_BUG-18/TC-036/README.md>) · [tái hiện độc lập, so 2 tài khoản](<evidence/bugs/[id_bug_18]_BUG-18/manual/README.md>) · **Test tự động**: TC-036.

---

<a id="bug-19"></a>
### BUG-19: [Trang giỏ] Giỏ trống vẫn sang được bước thanh toán
| | |
|---|---|
| **Ticket** | `[id_bug_19]` |
| **Severity** | **Low**: không mất dữ liệu, chỉ vào một bước vô nghĩa |
| **Priority** | **P3**: ít gặp, không chặn ai |
| **Liên quan** | AC-6 · Q5 · TVP-015 · TC-030 · O-13 |

**Các bước**: đăng nhập `standard_user`, không thêm gì, mở giỏ, bấm **Checkout**.
**Mong đợi** (Q5): không cho thanh toán khi giỏ trống (khóa nút hoặc báo lỗi, vẫn ở `/cart.html`).
**Thực tế**: nút bấm được, sang `/checkout-step-one.html`, tiêu đề `Checkout: Your Information`.

![BUG-19](<evidence/bugs/[id_bug_19]_BUG-19/manual/02-sau-khi-bam-checkout.png>)

**Evidence**: [tự động](<evidence/bugs/[id_bug_19]_BUG-19/TC-030/README.md>) · [tái hiện độc lập](<evidence/bugs/[id_bug_19]_BUG-19/manual/README.md>) · **Test tự động**: TC-030.

---

## Không đưa vào bug report
| Mã | Lý do |
|---|---|
| BUG-17 | `performance_glitch_user` sắp xếp mất ~5 giây (TC-034 đo, `standard_user` ~18 ms). Theo Q10: chưa có AC về thời gian nên **chỉ ghi nhận**, không đánh fail. Báo kèm IMP-04 trong [`improvements.md`](improvements.md) |
