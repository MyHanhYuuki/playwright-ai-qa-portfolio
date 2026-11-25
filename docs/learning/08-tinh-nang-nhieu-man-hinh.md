# Bài 8: Test một tính năng nhiều màn hình (danh sách, chi tiết, giỏ hàng)

> Chạy **trọn pipeline** cho ticket SD-102 trên 3 màn hình. Kết quả: [`qa-runs/saucedemo-products-cart-screen/`](../../qa-runs/saucedemo-products-cart-screen/) · [`defects.md`](../../qa-runs/saucedemo-products-cart-screen/defects.md) (17 bug) · [`rtm.md`](../../qa-runs/saucedemo-products-cart-screen/rtm.md) · review: [`reviews/`](../../qa-runs/saucedemo-products-cart-screen/reviews/)

## 🎯 Tại sao học
- Tính năng thật hiếm khi nằm trên **một** màn hình. Giỏ hàng có mặt ở danh sách, chi tiết, trang giỏ; một lỗi ở chỗ này hay kéo theo chỗ khác.
- Càng nhiều màn hình, càng dễ **nhầm lẫn** (câu hỏi, bug, test thuộc màn hình nào) và càng dễ **bỏ sót biến thể** (bug ở trang A cũng có ở trang B).
- Bài này cũng là lần đầu bộ test lớn (45 test) chạy trên CI, nên lộ ra các lỗi **chập chờn** mà máy mình không thấy.

## 🏭 Ngoài thực tế
- Team thường chia tài liệu theo màn hình **bên trong** một ticket: một thư mục cho ticket, trong đó câu hỏi, bug, test case đều có cột / mục "Màn hình".
- Web hiện đại (React, Vue…) đổi trang **ngay trong trình duyệt**: URL đổi trước, trang mới hiện sau một chút. Test chỉ chờ URL sẽ pass trên máy nhanh, **fail trên CI chậm**.
- Trên các dự án lớn, QC Lead review **theo vòng**: sau mỗi bước, và cả khi bên sửa nói "không tái hiện được".

## 👨‍🏫 Làm mẫu → giải thích

### 1. Chia tài liệu theo màn hình, không tách ticket
| Tài liệu | Cách chia | Ví dụ |
|---|---|---|
| `q-and-a.md`, `known-issues.md`, `defects.md` | Mục theo màn hình + mục **Chung** cho thứ ảnh hưởng nhiều màn hình | BUG-07 (giỏ người trước lộ sang người sau) nằm ở "Chung" |
| `viewpoint.csv`, `test-cases.csv` | Cột `screen` | TC-024: `Danh sách + Giỏ → Chi tiết` |
| Code test | `test.describe` theo màn hình, Page Object theo màn hình, tag `@list` / `@detail` / `@cart` | `npx playwright test --grep @cart` |
| Evidence, RTM | Nhóm / cột theo màn hình | `evidence/README.md`, bảng "Theo màn hình" trong `rtm.md` |

### 2. Ma trận tài khoản × trang × thao tác
SauceDemo có 6 tài khoản. Mình kẻ bảng: mỗi dòng một tài khoản, mỗi cột một thao tác ở một trang. Ô ❌ = có bug phải có TC bắt; ô ✅ của tài khoản đặc biệt = cần **TC dương tính** (để biết khi nó hỏng). Nhờ ma trận, review lần 2 phát hiện cột còn thiếu: **bấm tên sản phẩm ở trang giỏ** (BUG-11 cũng xảy ra ở đó).

### 3. Chờ trang đích, không chờ URL
```ts
// ❌ URL đã đổi nhưng trang cũ còn trên màn hình → đọc nhầm nút của trang cũ
await detail.backButton.click();
await expect(inv.cartButton(backpack)).toHaveText('Remove');

// ✅ Page Object tự chờ phần tử CHỈ trang đích mới có
async backToProducts() {
  await this.backButton.click();
  await this.page.getByTestId('inventory-list').waitFor();
}
```
Mốc chờ phải là thứ **chỉ trang đích có**. `inventory-item` có ở cả 3 trang nên không dùng được làm mốc.

### 4. `test.fail()` có thể che lỗi của chính code test
Test bug đã biết được đánh dấu `test.fail()`. Playwright coi **mọi lỗi** là "fail như dự kiến": hết giờ, biến chưa khai báo, locator khớp 2 phần tử… Cách phòng:
- Đọc **từng lỗi** (`error_details` trong run JSON), không chỉ con số "16 bug fail".
- `npm run typecheck` trước khi chạy (Playwright không kiểm tra kiểu).
- Script tự cảnh báo khi lỗi giống lỗi code test.
- Ước lượng thời gian: test 18 điểm kiểm cần `test.setTimeout()` đủ lớn, nếu không thì các điểm cuối không bao giờ chạy.

### 5. Thử mọi biến thể của bug
| Biến thể | Ví dụ ở bài này |
|---|---|
| Trang khác, cùng thao tác | BUG-11: bấm tên ở danh sách **và** ở trang giỏ |
| Chiều ngược lại | BUG-07: `standard_user` → `visual_user` **và** ngược lại |
| Đọc, **ghi** và **xóa** | BUG-07: người sau không chỉ **thấy** mà còn **thêm** hàng vào và **bỏ** hàng khỏi giỏ người trước |
| Dữ liệu khác | BUG-20: 10 kiểu id sai định dạng (`4abc`, `-0`, `+4`…) |
| Loại tín hiệu khác | BUG-13: lỗi là `pageerror`, không phải console |
| Lỗi "ngầm" khi chỉ mở trang | BUG-21: `error_user` mở trang chi tiết là có lỗi console, và **mất phần mô tả**. Mình từng kết luận "giao diện vẫn đúng" vì không đặt cạnh `standard_user` để so: review cuối mới bắt được |

### 6. Khi không tái hiện được phát hiện của reviewer
Không tự đóng. Quay lại trao đổi với reviewer, hai bên chốt có bằng chứng, rồi báo người duyệt: khác ở đâu, chốt gì, phương án đề xuất. Ví dụ B5: mình chỉ nghe `console` nên "không tái hiện được"; reviewer kiểm lại 3 lần: lỗi có thật, là `pageerror`.

## 👉 Bạn tự làm
1. Mở [`spec-review.md`](../../qa-runs/saucedemo-products-cart-screen/spec-review.md), tìm ma trận. Tự tìm thêm **1 cột thao tác** chưa có (gợi ý: menu, nút Back của trình duyệt) và thử với `problem_user`.
2. Chọn 1 bug trong [`defects.md`](../../qa-runs/saucedemo-products-cart-screen/defects.md), làm lại đúng các bước trên cửa sổ ẩn danh. Có làm được trong 2 phút không? Bước nào khó hiểu?
3. Mở TC-022 trong spec, xóa dòng chờ `inventory-list` trong `backToProducts()`, chạy lại 10 lần với `--repeat-each=10`: test có còn kiểm đúng trang không?

## ⚠️ Lỗi hay gặp
| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| Chỉ chờ URL sau khi chuyển trang | Pass trên máy, fail trên CI; hoặc pass mà không kiểm gì | Chờ phần tử chỉ trang đích có |
| Tin con số "fail như dự kiến" | Lỗi code test bị tính là bug, biến thể không bao giờ chạy | Đọc từng lỗi, `typecheck`, cảnh báo tự động |
| Báo bug một chiều, một trang | Dev sửa thiếu, test vẫn pass dù bug còn | Thử trang khác, chiều ngược, đọc / ghi |
| Lưu thêm dữ liệu từ công cụ mà không xem | Đường dẫn máy lọt vào file commit | Chỉ giữ trường cần, quét trước khi commit |
| "Không tái hiện được" rồi bỏ qua | Bỏ sót bug thật | Ghi rõ đã thử cách nào, trao đổi với người phát hiện |
| Kết luận "giao diện vẫn đúng" mà không so với tài khoản chuẩn | Chấm sai mức độ (BUG-21 bị chấm Low), test dương tính pass sai | So **từng trường** AC liệt kê với tài khoản chuẩn, ảnh đặt cạnh nhau |

## ✅ Checklist
- [ ] Mọi tài liệu ghi rõ màn hình; có mục "Chung"
- [ ] Có ma trận tài khoản × trang × thao tác, mọi ô đã thử
- [ ] Page Object tự chờ trang đích sau mỗi lần chuyển trang
- [ ] Đã đọc `error_details` của mọi test bug đã biết; `npm run typecheck` sạch
- [ ] Mỗi bug: đã thử trang khác, chiều ngược, đọc / ghi, dữ liệu khác
- [ ] Chạy lặp ≥ 2 lần cả bộ, test có chuyển trang chạy lặp 10 lần
- [ ] CI xanh trước khi chốt

## ❓ Câu hỏi liên quan

### Q1. Một tính năng trải trên nhiều màn hình, bạn tổ chức tài liệu test thế nào?
**Trả lời:**
- Một thư mục cho cả ticket, **bên trong** chia theo màn hình: mục theo màn hình trong Q&A, known-issues, bug report; cột "Màn hình" trong viewpoint, test case.
- Mục **Chung** cho thứ ảnh hưởng nhiều màn hình (giỏ hàng, tài khoản, menu).
- Code: Page Object theo màn hình, `describe` theo màn hình, tag để chạy riêng một màn hình.
- Báo cáo (evidence, RTM) nhóm theo màn hình để người đọc tìm nhanh.

### Q2. Test pass trên máy nhưng fail trên CI, bạn xử lý thế nào?
**Trả lời:**
- Lấy bằng chứng từ CI: ảnh, trace, page snapshot lúc fail. Đừng sửa mò.
- Tái hiện điều kiện CI: máy chậm (giả lập CPU chậm), chạy lặp nhiều lần, 1 worker.
- Thường gặp nhất: chờ sai thứ (chờ URL thay vì chờ trang hiện ra), phụ thuộc thứ tự test, ngưỡng chờ không áp cho mọi bước.
- Sửa tận gốc (chờ đúng phần tử), **không** tăng retry để che.
- Chạy lặp lại để chứng minh đã ổn (vd 10/10), rồi ghi bài học vào quy tắc chung.

### Q3. `test.fail()` dùng để làm gì, có rủi ro gì?
**Trả lời:**
- Đánh dấu test của **bug đã biết**: CI vẫn xanh nhưng bug vẫn được theo dõi; khi bug được sửa, test báo để bỏ đánh dấu.
- Rủi ro: Playwright coi **mọi** lỗi là "fail như dự kiến", kể cả lỗi của code test. Có thể che: test hết giờ, biến chưa khai báo, locator sai.
- Cách phòng: đọc nội dung từng lỗi, kiểm tra kiểu, cảnh báo tự động, ước lượng thời gian chạy.

### Q4. Khi tìm thấy một bug, bạn làm gì trước khi viết bug report?
**Trả lời:**
- Tái hiện lại trên phiên trình duyệt sạch, cách thao tác khác, ít nhất 2 lần.
- Tìm điều kiện tối thiểu (bỏ bước thừa) và **mọi biến thể**: trang khác cùng thao tác, chiều ngược lại, đọc / ghi, dữ liệu khác, tài khoản khác.
- Tìm quy luật nếu có (vd "luôn mở sản phẩm id + 1"): dev tìm nguyên nhân nhanh hơn.
- Xem đúng loại tín hiệu: màn hình, hộp thoại, lỗi JavaScript, console, mạng.

### Q5. Reviewer báo một lỗi nhưng bạn không tái hiện được, bạn làm gì?
**Trả lời:**
- Không tự đóng. Ghi lại chính xác mình đã thử thế nào (bước, dữ liệu, công cụ, đã theo dõi tín hiệu gì).
- Trao đổi với reviewer: so cách thử của hai bên, reviewer kiểm lại trên sản phẩm thật.
- Chốt có bằng chứng: đúng / đúng một phần / sai, rồi báo người duyệt kèm phương án đề xuất.
- Ví dụ thật ở bài này: lỗi của `error_user` là `pageerror`, mình chỉ nghe `console` nên không thấy.
