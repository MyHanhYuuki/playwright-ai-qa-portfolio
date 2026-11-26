# Bài 9: Test luồng thanh toán (form, tiền, trạng thái đơn, file biên nhận)

> Chạy **trọn pipeline** cho ticket SD-103 trên 3 màn hình thanh toán (Thông tin → Tổng quan → Hoàn tất). Kết quả: [`qa-runs/saucedemo-checkout-screen/`](../../qa-runs/saucedemo-checkout-screen/) · [`triage.md`](../../qa-runs/saucedemo-checkout-screen/triage.md) (53 TC, 21 bug) · [`defects.md`](../../qa-runs/saucedemo-checkout-screen/defects.md) · [`rtm.md`](../../qa-runs/saucedemo-checkout-screen/rtm.md) · review: [`reviews/`](../../qa-runs/saucedemo-checkout-screen/reviews/)

## 🎯 Tại sao học
- Thanh toán là luồng **mất tiền thật** khi sai: tính tiền sai, đặt được đơn rỗng, đặt trùng đơn. Đây là chỗ QC phải kỹ nhất.
- Luồng có **thứ tự bước** (Thông tin → Tổng quan → Hoàn tất). Bug hay nằm ở chỗ **đi tắt** (mở thẳng URL), **đi lùi** (Back), **đi song song** (2 tab), **bấm lặp** (bấm đúp).
- Có thứ nằm **ngoài trình duyệt** (file PDF biên nhận) và thứ phụ thuộc **múi giờ**: cần biết phần nào tự động được, phần nào phải làm tay.

## 🏭 Ngoài thực tế
- Team tính tiền luôn có **bảng số liệu mong đợi** do QC tự tính từ giá gốc (theo cent nguyên), không đọc số trên trang rồi so với chính trang.
- Bug thanh toán nặng nhất thường không nằm ở "nút có bấm được không" mà ở **trạng thái**: đơn tạo từ dữ liệu cũ, giỏ không được làm trống, bước kiểm tra bị bỏ qua.
- File xuất (PDF, CSV, email) hay bị test sơ sài vì "khó tự động". Thực tế: phần **nội dung** tự động được (đọc chữ trong file), phần **nhìn** (bố cục, chữ đọc được) làm tay có ghi lại bằng chứng.

## 👨‍🏫 Làm mẫu → giải thích

### 1. Form: thử đủ tổ hợp nhỏ, không chỉ "bỏ trống 1 ô"
3 ô bắt buộc (First Name, Last Name, Zip) → chỉ có **7 tổ hợp** thiếu ô: thử **hết** (TC-002, TC-003). Thêm các kiểu "có mà như không": ô chỉ có khoảng trắng, ký tự tab (BUG-34), nhấn **Enter** thay vì bấm Continue (BUG-23: Enter quay về giỏ, mất dữ liệu).

Oracle "ô bị đánh dấu lỗi" phải **phân biệt được** đúng / sai: ô của SauceDemo **luôn** có class `input_error`, trạng thái lỗi thêm class `error` + icon ✕. So **trước và sau** khi bấm (bài học L15):
```ts
const MARKED = /(^|\s)error(\s|$)/;              // nguyên từ "error", không khớp "input_error"
await expect(ip.firstName).not.toHaveClass(MARKED); // đối chứng: trước khi bấm, chưa ô nào bị đánh dấu
await ip.continueButton.click();
await expect.soft(ip.lastName, 'ô đã nhập đúng không bị đánh dấu').not.toHaveClass(MARKED);
```

### 2. Tiền: tính mong đợi từ dữ liệu gốc, theo cent nguyên
```ts
// tests/data/checkout.ts: mong đợi tính từ giá chuẩn (tests/data/products.ts), KHÔNG đọc từ trang
export function expectedTotals(ids: readonly number[]): Totals {
  const item = ids.reduce((sum, id) => sum + cents(productById(id)), 0); // cent nguyên: 2999 + 799
  const tax = Math.round((item * 8) / 100);                               // Q2: thuế 8 %, làm tròn tới cent, tính trên số nguyên
  return { item, tax, total: item + tax };
}

// spec: so bằng assertion web-first (tự chờ, tự thử lại), không đọc innerText() rồi so
const t = totalsText(expectedTotals([4, 2]));   // "Item total: $37.98", "Tax: $3.04", "Total: $41.02"
await expect.soft(ov.subtotal, 'Item total').toHaveText(t.item, QUICK);
await expect.soft(ov.tax, 'Tax').toHaveText(t.tax, QUICK);
await expect.soft(ov.total, 'Total').toHaveText(t.total, QUICK);
```
- Quét **mọi tổ hợp** nhỏ: 6 sản phẩm → 63 tổ hợp; 6 giỏ 1 sản phẩm thử 1 thứ tự, 57 giỏ nhiều sản phẩm thử thêm thứ tự ngược: 6 + 57 × 2 = **120 giỏ** (TC-019, TC-020). Nhờ quét hết mới thấy BUG-25: cộng số thực ra `$59.980000000000004` ở **26/120** giỏ, kể cả `standard_user`.
- Thứ tự thêm hàng ảnh hưởng kết quả cộng số thực → giỏ quét cả 2 thứ tự.

### 3. Trạng thái luồng: đi tắt, đi lùi, đi song song, bấm lặp
| Cách thử | Bug tìm được |
|---|---|
| Mở thẳng URL bước sau | BUG-26: mở `/checkout-step-two.html` là **bỏ qua** bước nhập thông tin; BUG-27: mở `/checkout-complete.html` khi chưa đặt vẫn báo thành công |
| Đặt xong bấm Back rồi Finish lại | BUG-24: đặt được **đơn rỗng** |
| 2 tab: tab 1 đặt xong, tab 2 bấm Finish | BUG-35: tạo đơn từ **Tổng quan đã cũ** (TC-051 phủ 5 biến thể: tab kia đã đặt, Reset, thêm / bỏ hàng, đăng xuất ở tab khác) |
| Bấm đúp Continue / Finish | BUG-36: chạy 2 lần, phải bấm Back 2 lần mới về |

Quy tắc chung cho **mọi thao tác tạo dữ liệu**: thử 2 tab, Back rồi gửi lại, bấm 2 lần, gửi sau khi dữ liệu nguồn đã đổi (bài học L14).

### 4. File biên nhận PDF: tự động phần chữ, làm tay phần nhìn
- **Tự động** (TC-034): tải file, đọc chữ trong luồng nội dung, so **đúng danh sách** dòng sản phẩm (không chỉ "có xuất hiện theo thứ tự": dòng thừa / trùng vẫn lọt), đúng 1 file (chờ thêm 5 giây xem có file thứ 2 không).
- **Làm tay** (TC-035, lý do M2 + M3): mở file bằng trình đọc PDF (pdf.js), chụp trang, đánh giá bố cục, chữ đọc được. Ghi rõ **ai đánh giá** và lưu kết quả vào `run-results/manual-*.json`; RTM gộp kết quả tự động + tay, lấy kết quả **xấu hơn**.
- **Múi giờ**: lúc làm tay TC-035, so ảnh biên nhận với tên file thì thấy lệch 7 giờ. Thử thêm bằng `timezoneId` ở 3 múi giờ (reviewer thử thêm 1): `Order Date` theo giờ máy, còn **tên file luôn theo UTC** (O-47). Chưa có quy định nào → hỏi PO (Q14), PO chốt là **cải tiến**, không phải bug. Sau đó TC-034 mới được thêm bước chạy ở `Asia/Ho_Chi_Minh` để kiểm `Order Date` đúng giờ địa phương (CI chạy UTC nên giờ địa phương và UTC trùng nhau, không phân biệt được); giờ trong tên file chỉ ghi lại, không kiểm.

### 5. Test đi qua trang của tính năng khác
TC-048 (`error_user` dương tính) đặt oracle "0 lỗi JavaScript suốt test", nhưng bước 5 bấm tên sản phẩm → sang **trang chi tiết** (SD-102), trang này dính sẵn **BUG-21**. Test đỏ không phải vì thanh toán sai. Cách làm đúng (bài học L16): liệt kê bug đã biết của trang kia **theo từng tài khoản**; oracle chỉ tính lỗi trên trang của tính năng đang test, lỗi ở trang kia ghi tham khảo. Không dùng `test.fail()` cho cả test: sẽ che ~25 điểm kiểm dương tính.

### 6. Ngân sách thời gian CI
53 test mới, CI chạy 1 worker: cộng dồn ~12 phút, cộng bộ cũ ~19 phút, **sát giới hạn 20 phút**. Hai lựa chọn: thêm worker (nhanh nhưng dễ chập chờn trên máy CI yếu) hoặc nâng giới hạn (chậm nhưng chắc). Người duyệt chọn nâng lên 30 phút, giữ 1 worker. Cần nhanh hơn thì chia job (sharding), mỗi job vẫn 1 worker.

## 👉 Bạn tự làm
1. Mở [`known-issues.md`](../../qa-runs/saucedemo-checkout-screen/known-issues.md), chọn BUG-35. Tự nghĩ thêm **1 cách** làm dữ liệu nguồn đổi giữa lúc xem Tổng quan và lúc bấm Finish, rồi thử trên cửa sổ ẩn danh.
2. Tự tính tay `Item total`, `Tax`, `Total` cho giỏ Bike Light + Fleece Jacket theo cent nguyên. So với số trên trang: thấy gì?
3. Chạy `npx playwright test tests/specs/saucedemo-checkout-screen.spec.ts -g "TC-034"` rồi sửa `RECEIPT_TZ` thành `'UTC'`: test còn phân biệt được biên nhận in giờ UTC không? Vì sao?

## ⚠️ Lỗi hay gặp
| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| Đọc số trên trang rồi so với chính trang | Bug tính tiền không bao giờ lộ | Tính mong đợi từ dữ liệu gốc theo cent nguyên |
| Chỉ thử vài giỏ "đẹp" | Bỏ sót lỗi chỉ xảy ra ở vài tổ hợp (26/120) | Tổ hợp nhỏ thì quét hết |
| Chỉ test luồng thẳng | Bỏ sót đi tắt, đi lùi, 2 tab, bấm lặp | Checklist 4 cách thử cho mọi thao tác tạo dữ liệu |
| Oracle "0 lỗi suốt test" khi test đi qua trang khác | Test đỏ vì bug của tính năng khác | Tra bug đã biết của trang kia, oracle theo phạm vi trang |
| Test giờ giấc chỉ chạy ở UTC | Không phân biệt được giờ địa phương với UTC | Chạy với `timezoneId` khác UTC |
| `isEnabled()` không có giới hạn chờ | Nút biến mất là test treo tới hết giờ, `test.fail()` che mất các biến thể sau | Truyền `timeout`, bắt lỗi trả `false` |
| Sửa file bằng script mà không đọc lại | Script in "ok" nhưng chèn sai chỗ, đổ lỗi nhầm người khác (ai-log #15) | Đọc lại file ngay sau khi sửa |

## ✅ Checklist
- [ ] Form: đủ tổ hợp ô thiếu, khoảng trắng, Enter, oracle có đối chứng trước / sau
- [ ] Tiền: mong đợi tính từ dữ liệu gốc theo cent; tổ hợp nhỏ quét hết, cả thứ tự
- [ ] Luồng: mở thẳng URL từng bước, Back sau khi xong, 2 tab, bấm đúp
- [ ] File xuất: tự động phần chữ (đúng danh sách), làm tay phần nhìn, có bằng chứng và người đánh giá
- [ ] Thời gian / ngày: chạy với múi giờ khác UTC
- [ ] Test đi qua trang khác: đã đối chiếu bug đã biết của trang đó
- [ ] Ước lượng thời gian CI trước khi gộp vào `main`

## ❓ Câu hỏi liên quan

### Q1. Bạn test phần tính tiền của giỏ hàng thế nào?
**Trả lời:**
- Lấy giá gốc từ dữ liệu chuẩn, **tự tính** mong đợi theo đơn vị nhỏ nhất (cent) để tránh sai số số thực; quy tắc làm tròn thuế hỏi rõ PO.
- Không đọc số trên trang rồi so với chính trang.
- Tổ hợp nhỏ (6 sản phẩm → 63 giỏ) thì quét hết, cả thứ tự thêm hàng; tổ hợp lớn thì phân vùng + giá trị biên.
- Kiểm cả **định dạng** (`$x.xx`) chứ không chỉ giá trị.

### Q2. Một luồng nhiều bước (wizard), bạn tìm bug trạng thái thế nào?
**Trả lời:**
- Mở thẳng URL của từng bước khi chưa đi qua bước trước.
- Xong luồng rồi bấm Back, gửi lại.
- 2 tab cùng phiên: đổi dữ liệu ở tab này, gửi ở tab kia.
- Bấm đúp nút gửi; tải lại trang giữa chừng; đăng xuất ở tab khác.
- Mỗi cách thử với các loại tài khoản khác nhau.

### Q3. Phần nào nên làm tay khi đã có test tự động?
**Trả lời:**
- Khi expected cần **mắt người** (bố cục, chữ đọc được, ảnh đúng nội dung) hoặc kết quả nằm **ngoài trình duyệt** (file mở bằng ứng dụng khác, email).
- Khi test tự động chỉ phủ một phần expected, hoặc kết quả tự động đáng ngờ.
- Làm tay vẫn phải có bằng chứng (ảnh, giá trị đo), ghi rõ người đánh giá, lưu kết quả để báo cáo tổng hợp tính được.

### Q4. Một phát hiện chưa có quy định nào nói đúng hay sai, bạn xử lý thế nào?
**Trả lời:**
- Ghi lại quan sát có bằng chứng (vd tên file PDF theo UTC, kiểm ở 4 múi giờ), phân biệt rõ cái **thấy được** và cái **suy ra**.
- Không tự cấp số bug khi chưa có căn cứ (AC, Q&A, chuẩn chung). Hỏi PO, kèm đề xuất (bug hay cải tiến) và lý do.
- Dù PO chốt thế nào, vẫn thêm kiểm tra cho phần **có** căn cứ (vd `Order Date` phải đúng giờ địa phương).

### Q5. Bộ test làm CI chạy lâu gần chạm giới hạn, bạn làm gì?
**Trả lời:**
- Đo trước: cộng dồn thời gian từng test với số worker của CI.
- Tìm nguyên nhân: chờ cố định trong assertion, bài quét lớn, đăng nhập lặp.
- Lựa chọn: nâng giới hạn (chắc), thêm worker (nhanh nhưng dễ chập chờn), chia job (nhanh, mỗi job vẫn 1 worker), tách bài quét lớn chạy theo lịch.
- Không tăng `retries` để che test chậm hoặc chập chờn.
