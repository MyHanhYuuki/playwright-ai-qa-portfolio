# Bug report: SD-101 Đăng nhập

> Bug đã được người duyệt xác nhận ở **HITL #3** (2026-11-24), từ lần chạy [`run-20261124-150906`](run-results/run-20261124-150906.json). Chạy lại sau khi sửa TC-028 (kiểm tra cả 2 chiều): [`run-20261124-184137`](run-results/run-20261124-184137.json), kết quả không đổi · Phân loại: [`triage.md`](triage.md).
> Ticket chưa log lên hệ thống quản lý bug nên tạm ghi `[id_bug_n]`. Cách thay khi đã log: xem [cuối file](#khi-log-ticket-thật).
> Ảnh evidence tự động lấy từ lần chụp evidence mới nhất (`npm run test:evidence`, 2026-11-24 17:23), cùng code test với lần chạy trên. Ảnh tái hiện bằng tay nằm trong thư mục `manual/` của từng bug.

## Tổng hợp
| Bug | Ticket | Test case | Tiêu đề | Severity | Priority (đề xuất) | Trạng thái |
|---|---|---|---|---|---|---|
| [BUG-01](#bug-01-login-báo-thiếu-một-ô-nhưng-cả-hai-ô-đều-bị-đánh-dấu-lỗi) | `[id_bug_1]` | TC-028 | Báo thiếu một ô nhưng cả hai ô đều bị đánh dấu lỗi | Low | P3 | Open |
| [BUG-02](#bug-02-login-tự-tạo-cookie-là-vào-được-trang-bên-trong-không-cần-đăng-nhập) | `[id_bug_2]` | TC-033 | Tự tạo cookie là vào được trang bên trong, không cần đăng nhập | High | P1 | Open |

> **Severity** (mức nghiêm trọng) do QC đánh giá theo ảnh hưởng. **Priority** (mức ưu tiên sửa) do PO/PM chốt theo kế hoạch, ở đây QC chỉ đề xuất.

---

### BUG-01: [Login] Báo thiếu một ô nhưng cả hai ô đều bị đánh dấu lỗi
| | |
|---|---|
| **Ticket** | `[id_bug_1]` |
| **Severity / Priority** | **Low**: lỗi giao diện, không chặn đăng nhập nhưng gây hiểu nhầm. **P3** (đề xuất): sửa khi tiện, không cần chặn release |
| **Môi trường** | https://www.saucedemo.com · Chromium (Playwright 1.65.1, Desktop Chrome) · 2026-11-24 |
| **Tần suất** | 100%. Chiều 1: mọi lần chạy (run-20261124-150906, chạy lặp ×2, run-20261124-184137, các lần chụp evidence) và tái hiện bằng tay. Chiều 2 (phát hiện sau review): run-20261124-184137, lần chụp evidence 18:14 và tái hiện bằng tay. Kết quả đã lưu: 2 lần chạy trong `run-results/` |
| **Liên quan** | AC-3 · TVP-016 · TC-028 · Q6 · O-03 |

**Điều kiện trước**: chưa đăng nhập, đang ở trang đăng nhập `/`.

Lỗi xảy ra **cả 2 chiều**: với mọi lỗi "required", cả 2 ô đều bị đánh dấu. Khi sửa phải kiểm tra cả 2 chiều.

| | Chiều 1: thiếu Password | Chiều 2: thiếu Username |
|---|---|---|
| **Các bước** | 1. Nhập Username: `standard_user`<br>2. Để trống Password<br>3. Bấm **Login** | 1. Mở lại trang `/`<br>2. Để trống Username, nhập Password hợp lệ (in sẵn trên trang đăng nhập)<br>3. Bấm **Login** |
| **Mong đợi** (AC-3, Q6) | Thông báo `Epic sadface: Password is required`. **Chỉ ô Password** bị đánh dấu lỗi (viền đỏ, icon ✕) | Thông báo `Epic sadface: Username is required`. **Chỉ ô Username** bị đánh dấu lỗi |
| **Thực tế** | Thông báo đúng, nhưng **ô Username đã nhập cũng bị viền đỏ + icon ✕** (thêm class `error`; ô nào cũng luôn có sẵn class `input_error` nên không dùng class đó để kiểm) | Thông báo đúng, nhưng **ô Password đã nhập cũng bị viền đỏ + icon ✕** |
| **Ảnh** | ![chiều 1](<evidence/bugs/[id_bug_1]_BUG-01/TC-028/02-chieu-1-ket-qua-bug.jpg>) | ![chiều 2](<evidence/bugs/[id_bug_1]_BUG-01/TC-028/04-chieu-2-ket-qua-bug.jpg>) |

Người dùng dễ tưởng ô mình đã nhập đúng là bị sai.

**Evidence**: [test tự động, cả 2 chiều: 4 ảnh + video](<evidence/bugs/[id_bug_1]_BUG-01/TC-028/README.md>) · [tái hiện bằng tay, cả 2 chiều](<evidence/bugs/[id_bug_1]_BUG-01/manual/README.md>)

**Test tự động**: TC-028 kiểm tra **cả 2 chiều** (dùng `expect.soft` để chiều 1 fail vẫn chạy tiếp chiều 2), đánh dấu `test.fail()`. Chỉ khi **cả 2 chiều** được sửa, test mới báo để bỏ `test.fail()`.

---

### BUG-02: [Login] Tự tạo cookie là vào được trang bên trong, không cần đăng nhập
| | |
|---|---|
| **Ticket** | `[id_bug_2]` |
| **Severity / Priority** | **High**: vượt qua đăng nhập, vi phạm AC-6. Với hệ thống thật là **Critical**. **P1** (đề xuất): lỗi bảo mật, ai biết tên user là vào được mọi trang kể cả thanh toán, nên sửa trước release |
| **Môi trường** | https://www.saucedemo.com · Chromium (Playwright 1.65.1, Desktop Chrome) · 2026-11-24 |
| **Tần suất** | 100%: mọi lần chạy (run-20261124-150906, chạy lặp ×2, run-20261124-184137, các lần chụp evidence) và tái hiện bằng tay. Kết quả đã lưu: 2 lần chạy trong `run-results/` |
| **Liên quan** | AC-6 · TVP-020 · TC-033 · Q12 · O-21 · tag `@security` |

**Điều kiện trước**: chưa đăng nhập, trình duyệt sạch (vd: mở **cửa sổ ẩn danh** Chrome, Ctrl+Shift+N).

**Các bước tái hiện**
1. Mở https://www.saucedemo.com
2. Mở DevTools (F12) → tab **Console**, gõ: `document.cookie = "session-username=standard_user"` rồi Enter
   (Nếu dán lệnh mà Chrome chặn, gõ `allow pasting` rồi Enter trước, sau đó dán lại)
3. Mở trực tiếp https://www.saucedemo.com/inventory.html

**Kết quả mong đợi** (AC-6, Q12): bị đưa về trang đăng nhập `/`, hiện thông báo `Epic sadface: You can only access '/inventory.html' when you are logged in.`

**Kết quả thực tế**: vào thẳng trang **Products** (thấy 6 sản phẩm) mà không cần nhập mật khẩu. Đã thử thêm, đều vào được: `/cart.html`, `/inventory-item.html?id=4`, `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html`. Tức là **mọi trang bên trong** đều bị ảnh hưởng.

**Nguyên nhân dự đoán**: web chỉ kiểm tra cookie `session-username` ở trình duyệt, không có phiên phía server để đối chiếu. Cookie có `httpOnly: false` nên JavaScript tự ghi được.

**Evidence**: [test tự động: ảnh từng bước + video](<evidence/bugs/[id_bug_2]_BUG-02/TC-033/README.md>) · [tái hiện bằng tay trên 4 trang](<evidence/bugs/[id_bug_2]_BUG-02/manual/README.md>)

![BUG-02](<evidence/bugs/[id_bug_2]_BUG-02/TC-033/02-ket-qua-bug.jpg>)

**Test tự động**: TC-033 đánh dấu `test.fail()`, tag `@security`.

---

## Không đưa vào bug report
| Mã | Lý do |
|---|---|
| BUG-03 | `performance_glitch_user` chậm ~5 giây là hành vi **cố ý** của web demo, chưa có AC về thời gian. Ghi nhận ở IMP-03 trong [`improvements.md`](improvements.md) |
| BUG-04 | Thông báo cũ không tự mất: chỉ là quan sát, không có TC (Q8). Theo dõi trong [`known-issues.md`](known-issues.md) |

## Khi log ticket thật
1. Thay `[id_bug_n]` bằng mã ticket trong `tests/data/bugs.ts` và trong file này.
2. Đổi tên thư mục `evidence/bugs/[id_bug_n]_BUG-xx/` (dùng `git mv`), hoặc chạy lại `npm run test:evidence` rồi chuyển thư mục `manual/` sang.
3. Sửa link trong `triage.md`, chạy lại `npm run rtm`.
4. Kiểm tra: tìm `[id_bug_` trong cả repo phải ra **0 kết quả**.
