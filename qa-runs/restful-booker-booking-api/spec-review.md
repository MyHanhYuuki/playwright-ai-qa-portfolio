# Spec Review: RB-102 Quản lý đặt phòng (Booking) của Restful Booker API (restful-booker-booking-api)

## Tóm tắt
Hệ thống đặt phòng gọi Restful Booker API để **tạo** (`POST /booking`), **xem** (`GET /booking/:id`), **tìm** (`GET /booking` có bộ lọc), **sửa toàn bộ** (`PUT`), **sửa một phần** (`PATCH`) và **xóa** (`DELETE`) booking. `PUT`, `PATCH`, `DELETE` cần quyền: token của RB-101 trong `Cookie: token=<token>` hoặc `Authorization: Basic …`.

Feature API không có màn hình: cột `screen` của `viewpoint.csv` ghi **endpoint**. Tên endpoint dùng trong mọi tài liệu của feature:
| Tên trong cột `screen` | Tên trong tài liệu chính thức | Quyền |
|---|---|---|
| `POST /booking` | CreateBooking | Không cần |
| `GET /booking/:id` | GetBooking | Không cần |
| `GET /booking` | GetBookingIds (có bộ lọc `firstname`, `lastname`, `checkin`, `checkout`) | Không cần |
| `PUT /booking/:id` | UpdateBooking | Cần |
| `PATCH /booking/:id` | PartialUpdateBooking | Cần |
| `DELETE /booking/:id` | DeleteBooking | Cần |
| (`POST /auth`) | CreateToken: endpoint của RB-101, chỉ dùng làm bước chuẩn bị (lấy token). **Không** dùng làm giá trị cột `screen` | – |

Nhiều endpoint ghi `A → B` (thao tác ở A, kiểm ở B, vd `POST /booking → GET /booking/:id`) hoặc `A + B` (cùng một kiểm tra áp cho nhiều endpoint). `Cả 6` = cả 6 endpoint.

Một booking có **7 giá trị lá**: `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout`, `additionalneeds` (review C3). "So từng trường" trong mọi tài liệu của feature = so đủ 7 giá trị này.

## Acceptance Criteria
HITL #1 (2026-11-26) đã trả lời: người duyệt chấp nhận **mọi đề xuất** ("theo đề xuất hết"). Các điểm "chưa rõ" đã thành BR-2 → BR-16 bên dưới; mọi bug đã xác nhận (`known-issues.md`, mục "Quyết định HITL #1").

| AC-ID | Mô tả | Testable? | Ghi chú |
|-------|-------|-----------|---------|
| AC-1 | `POST /booking` hợp lệ → 200, `{"bookingid", "booking"}`, `booking` giống từng trường đã gửi | ✅ | Đúng với dữ liệu hợp lệ (O-01). Sau HITL #1: thiếu / sai kiểu → **400** (Q1, Q2, Q3); hiện 500 (BUG-41, BUG-58) hoặc nhận rồi **ép kiểu sai** (BUG-42, BUG-43, BUG-44). Server phải **lưu nguyên văn** (Q1 e); hiện cắt khoảng trắng (O-14, BUG-59) |
| AC-2 | `GET /booking/:id` → 200, đủ 6 trường; id không tồn tại báo không tìm thấy | ✅ | 404 `Not Found` (O-05). Id có tiền tố số (`12abc`, `1.5`) phải 404, hiện vẫn trả booking (O-06, BUG-54 theo knowledge-base) |
| AC-3 | `GET /booking` → 200 `[{"bookingid"}]`; lọc tên đúng; lọc `checkin` / `checkout` **≥** ngày lọc | ✅ | Ngày: hiện `checkin` là **>** (BUG-47), `checkout` bị **đảo chiều** thành ≤ (BUG-46). Sau HITL #1 (Q7): lọc tên khớp chính xác, phân biệt hoa thường, rỗng → `[]`, nhiều điều kiện là "và"; tham số lọc sai / dạng object → **400**, hiện 500 hoặc **bị bỏ qua, trả toàn bộ** (O-34, O-38, BUG-48) |
| AC-4 | `PUT` (có quyền) thay **toàn bộ** booking, 200, `GET` thấy dữ liệu mới | ✅ | Đúng khi gửi đủ 7 trường (O-20). Sau HITL #1 (Q8): bỏ `additionalneeds` thì **xóa** giá trị cũ; hiện vẫn giữ (O-21, BUG-53). Body có `bookingid` phải bị bỏ qua; hiện booking **bị chuyển sang id khác** (O-16, BUG-51) |
| AC-5 | `PATCH` (có quyền) chỉ đổi trường được gửi, trường khác giữ nguyên, 200 | ✅ | Đúng với trường cấp 1 (O-22). Gửi một trường con của `bookingdates` thì trường con kia thành `0NaN-aN-aN` (O-23, BUG-45) |
| AC-6 | `DELETE` (có quyền) xóa, trả mã thành công (tài liệu: 201), sau đó `GET` 404 | ✅ | 201 `Created` (O-26). **Quy tắc chung RB-101 / RB-102** (orchestrator, 2026-11-26): tài liệu vừa có ví dụ `201` vừa ghi "Default HTTP 201 response" cho `DELETE` và `/ping`, nên **201 là hợp đồng đã công bố**; tiêu đề "Success 200" là lỗi tài liệu (IMP-10), không phải bug. Xóa lần 2, id không tồn tại phải **404** (Q5); hiện 405 (O-25, O-26, BUG-52) |
| AC-7 | `PUT`, `PATCH`, `DELETE` bắt buộc có quyền; không có / sai thì bị từ chối, booking **không đổi** | ✅ | 24 kiểu thông tin xác thực × 3 method (O-27, O-43): bị từ chối đều 403, booking không đổi, không bị xóa. **403 là đúng** (Q4, quyết định chung, RB-101 theo); 401 chỉ là cải tiến IMP-02 |
| AC-8 | `Accept` chọn định dạng phản hồi (JSON / XML); `Content-Type` cho biết định dạng gửi (JSON / `text/xml`) | ✅ | XML trả về đúng nội dung, escape đúng (O-41) nhưng `Content-Type: text/html` (O-18, BUG-50). Sau HITL #1 (Q9): `Accept` không hỗ trợ → **406** và không tạo; hiện 418 mà **vẫn tạo booking** (O-19, BUG-49). Thiếu / sai `Content-Type` → **415**; hiện 500 (O-17, BUG-58). Body urlencoded không lưu được `depositpaid=false` (O-37, BUG-42). `GET /booking` chỉ JSON là đúng |
| (chung) | Dữ liệu dùng chung, bị đặt lại định kỳ | ✅ | Thấy đặt lại giữa phiên: id bắt đầu lại từ 1, id cũ thành booking người khác (O-04). Chiến lược chung RB-101 / RB-102 đã chốt (Q12) ở mục Dependencies và `known-issues.md` "Lưu ý cho bước sau" |

## Business Rules (rút ra từ requirement, knowledge-base và câu trả lời HITL #1, 2026-11-26)
- BR-1 (AC-1): `POST /booking` hợp lệ trả 200, `Content-Type: application/json`, `bookingid` là số nguyên dương, `booking` giống **từng trường** đã gửi (7 giá trị lá: 6 trường cấp 1 trừ `bookingdates` + 2 trường con của `bookingdates`). Đọc lại bằng `GET /booking/:id` cũng giống từng trường.
- BR-2 (AC-1, Q1 a, b, f; Q9 b): `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout` bắt buộc; `additionalneeds` tùy chọn, là **chuỗi** (khác chuỗi → 400, `null` = không có). Thiếu trường bắt buộc / `null` / sai cấu trúc → **400**, **không** tạo booking (BUG-41). Thiếu hoặc sai `Content-Type` → **415**; body không đọc được → **400** (BUG-58). Lỗi do client gửi sai **không bao giờ** được trả 5xx.
- BR-3 (Q2 a → e): `totalprice` là số, có thể có số lẻ (tối đa 2 chữ số), lưu **đúng giá trị đã gửi**; chuỗi / `null` / boolean → **400**; `0` hợp lệ, **âm → 400** (BUG-57); chưa có giới hạn trên. `depositpaid` JSON chỉ `true` / `false`, khác → **400**; body urlencoded `false` / `true` phải lưu đúng nghĩa (BUG-42, BUG-43).
- BR-4 (Q3 a → d): ngày chỉ nhận `CCYY-MM-DD` là ngày có thật, năm 0001 → 9999; khác (kể cả có giờ / múi giờ) → **400**. Không bao giờ lưu giá trị không phải ngày (`0NaN-aN-aN`) hay ngày khác ngày đã gửi (BUG-44). `checkout` phải **sau** `checkin` ít nhất 1 đêm, trước hoặc bằng → **400** (BUG-56). Ngày quá khứ **được**.
- BR-5 (knowledge-base; Q1 c, d, e): `firstname`, `lastname` rỗng / chỉ khoảng trắng coi như **thiếu** → **400** (quy tắc SD-103 Q4: cắt khoảng trắng **để kiểm**); `PATCH` không được đặt trường bắt buộc thành `null` / rỗng → 400 (BUG-55). Server **lưu nguyên văn**, không cắt khoảng trắng khi lưu (BUG-59). Độ dài coi như không giới hạn: test chuỗi rất dài (5000 ký tự), không làm BVA (quy tắc SD-101).
- BR-6 (AC-2, knowledge-base, Q5): id không tồn tại, đã xóa hoặc **sai định dạng** (không phải số nguyên dương thuần: `1.5`, `12abc`, `0012`) → **404** và không thao tác được, ở cả `GET`, `PUT`, `PATCH`, `DELETE` (BUG-52, BUG-54).
- BR-7 (AC-3, Q7 a → f): lọc `checkin=D` trả booking có `checkin ≥ D`; lọc `checkout=D` trả booking có `checkout ≥ D` (BUG-46, BUG-47). Lọc tên khớp **chính xác**, **phân biệt hoa thường**, không khớp một phần, không cắt khoảng trắng; `firstname=` rỗng → `[]`; nhiều tham số là **"và"**. Giá trị lọc sai, lặp tham số, dạng object / mảng / toán tử → **400**, không 500, **không âm thầm bỏ qua bộ lọc** (BUG-48).
- BR-8 (AC-4, Q8): `PUT` thay toàn bộ: trường tùy chọn không gửi thì **bị xóa** (BUG-53). Trường hệ thống (`bookingid`) trong body **bị bỏ qua** như `POST`, **không** được đổi id của booking (BUG-51).
- BR-9 (AC-5): `PATCH` chỉ đổi trường được gửi, **kể cả trường con** của `bookingdates`: gửi `{"bookingdates":{"checkin":…}}` thì `checkout` giữ nguyên (BUG-45).
- BR-10 (AC-6, quy tắc chung RB-101 / RB-102): `DELETE` thành công trả **201** (hợp đồng tài liệu: ví dụ `201` + "Default HTTP 201 response"), sau đó `GET` 404 và id không còn trong `GET /booking`. Đề xuất đổi sang 204: IMP-03.
- BR-11 (AC-7, Q4): thiếu / sai thông tin xác thực → **403** và booking **giữ nguyên từng trường**, không bị xóa (quyết định chung, RB-101 theo; 401 là cải tiến IMP-02). Kiểu xác thực hợp lệ: `Cookie: token=<token>`, `Authorization: Basic <base64(tên đăng nhập:mật khẩu quản trị)>`. Mật khẩu quản trị lấy **từ biến môi trường** (mặc định: giá trị công khai trong tài liệu), không ghi cứng trong test. RB-102 sở hữu **toàn bộ ma trận quyền** (24 kiểu × `PUT` / `PATCH` / `DELETE`) và `Basic`; hạn token, token cũ thuộc RB-101.
- BR-12 (AC-8, Q9): `Accept: application/json` / `application/xml` trả đúng định dạng **và** đúng header `Content-Type` tương ứng (BUG-50). `Accept` không hỗ trợ → **406**, không tạo / sửa (BUG-49). `GET /booking` chỉ trả JSON (đúng). `Content-Type: application/json` / `text/xml` / `application/x-www-form-urlencoded` (3 định dạng tài liệu công bố) đọc được body và lưu đúng từng trường; `application/xml` cho body là cải tiến IMP-11.
- BR-13 (knowledge-base, SD-103 HITL #2): thao tác tạo **không thành công** (trả mã lỗi) thì **không được để lại dữ liệu**. `POST` trả 418 mà vẫn tạo booking là bug (BUG-49).
- BR-14 (knowledge-base): thao tác ghi dựa trên **dữ liệu hiện tại**; không có cơ chế chống ghi đè (`If-Match`) là cải tiến (IMP-06), không phải bug khi AC không nêu.
- BR-15 (Q10): `POST` 2 lần cùng body tạo **2 booking** khác id là **đúng**; chống trùng là cải tiến IMP-07.
- BR-16 (Q12): chiến lược dữ liệu chung RB-101 / RB-102 (mục Dependencies); Heroku 503 là lỗi môi trường; **kiểm chủ sở hữu cả 2 id ngay trước** mọi request có `bookingid` trong body.

**Hành vi hiện tại đã được HITL #1 xác nhận là đúng**: không có quyền → 403 (Q4); lọc tên phân biệt hoa thường, khớp chính xác, nhiều điều kiện là "và" (Q7); `POST` 2 lần cùng body tạo 2 booking (Q10); `GET /booking` chỉ JSON (Q9 c); `DELETE` → 201 (quy tắc chung, BR-10). Hiện trạng **không** đúng (đã thành bug): id không tồn tại → 405 (BUG-52), cắt khoảng trắng khi lưu (BUG-59), `PUT` giữ `additionalneeds` cũ (BUG-53).

## Quan sát thực tế (khám phá API ngày 2026-11-26, script Node dùng `fetch`, mỗi request độc lập, không cookie phiên)
Quan sát lạ đã chạy lại **≥ 2 lần** (ghi "2/2"); ô nào chỉ 1 lần ghi rõ "1/1". Mọi booking dùng để thử có `firstname` bắt đầu bằng `QA-RB102`; chỉ sửa / xóa booking của mình; đã xóa hết khi xong (O-36). Lần khám phá đầu ~500 request; lần bổ sung sau review (O-37 → O-43, chạy lại ô 1/1) ~140 request với `firstname` cố định theo lần chạy, dọn bằng một truy vấn lọc. Token lấy bằng `POST /auth` với tài khoản quản trị (mật khẩu quản trị từ biến môi trường, mặc định: giá trị công khai trong tài liệu). Cột **Endpoint** dùng tên ở bảng trên.

| # | Endpoint | Thao tác | Kết quả quan sát | Ghi chú |
|---|---|---|---|---|
| O-01 | `POST /booking` | Tạo booking hợp lệ (JSON, `Accept: application/json`) | **200**, `Content-Type: application/json; charset=utf-8`, body `{"bookingid":<số>,"booking":{…}}`; `booking` giống **từng trường** đã gửi (7 giá trị) và cùng thứ tự khóa. Header có `ETag` yếu, `X-Powered-By: Express` | ✅ AC-1 (nhiều lần) |
| O-02 | `POST /booking → GET /booking/:id` | Đọc lại booking vừa tạo; `Accept` là `application/json`, `*/*`, không gửi | 200 JSON, giống từng trường đã gửi (so 7 giá trị). Không có `bookingid` trong body. **Đính chính 2026-11-28** (script-gen, review A2): "không gửi" thật sự (không header `Accept`) → **418**, lúc khám phá công cụ đã tự gửi `Accept: */*`; xem BUG-60 | ✅ AC-1, AC-2 (❌ khi không gửi `Accept`: BUG-60) |
| O-03 | `GET /booking` | Gọi không bộ lọc | 200 JSON `[{"bookingid":1},…]` có id vừa tạo. **Không phân trang**: 1.179 → 2.283 phần tử tùy lúc. Id **không liên tục**: 2 lần tạo liên tiếp của mình cách nhau 3–8 id (người khác tạo song song) | ✅ AC-3. IMP-04 |
| O-04 | Cả 6 | Theo dõi dữ liệu trong phiên | **Dữ liệu bị đặt lại giữa phiên**: `GET /booking` từ 2.283 còn 262 phần tử, id bắt đầu lại từ 1; mọi booking tạo trước đó (của mình và của người khác) mất. Sau đặt lại, id cũ của mình (`1708`, `1982`) đã là booking của người khác. Booking id 1 (không phải của mình) bị người khác sửa trong phiên | Q12 (đã chốt). Dọn dẹp phải **kiểm `firstname` trước khi xóa**, không xóa theo id đã lưu |
| O-05 | `GET /booking/:id` | Id không tồn tại: `999999999`, `0`, `-1`, `abc`, `%20` | **404**, `Content-Type: text/plain`, body `Not Found` | ✅ AC-2 |
| O-06 | `GET /booking/:id` + `PUT /booking/:id` + `PATCH /booking/:id` + `DELETE /booking/:id` | Id có tiền tố là số: `1.5`, `<id>x`, `<id>abc`, `00<id>`, `<id>.9` | `GET /booking/1.5` trả **booking 1**; `<id>abc`, `00<id>`, `<id>.9` trả booking `<id>` (200, 2/2). `PATCH /<id>abc`, `PUT /00<id>` **sửa được** booking `<id>` (200), `DELETE /<id>.9` **xóa** booking `<id>` (201) (3/3 mỗi method, booking của mình) | 🔴 BUG-54 (knowledge-base: id sai định dạng → không tìm thấy) |
| O-07 | `POST /booking` | Bỏ **từng** trường (8 lần) | Thiếu `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates`, `bookingdates.checkin`, `bookingdates.checkout` → **500** `Internal Server Error` (text/plain), không tạo booking (2/2 với `firstname`). Thiếu `additionalneeds` → 200, `GET` không có khóa `additionalneeds` | 🔴 BUG-41 (Q1: phải 400) |
| O-08 | `POST /booking` + `PUT /booking/:id` | Body đặc biệt | `POST`: `{}`, `[]` → **500** (thiếu trường / sai cấu trúc); `""` (không phải JSON) → **500**; JSON hỏng (`{"firstname":`), `null` → 400 `Bad Request`. `PUT` thiếu trường hoặc `{}` → **400** `Bad Request`, booking giữ nguyên (so từng trường) | 🔴 `{}`, `[]`: BUG-41; `""`: BUG-58. Cùng lỗi thiếu trường mà `POST` 500, `PUT` 400 |
| O-09 | `POST /booking` | `null` / kiểu sai cấu trúc | `totalprice: null`, `depositpaid: null`, `firstname: 12345`, `bookingdates: "2031-01-10"` → **500**. `additionalneeds: null` → 200 lưu `null`; `additionalneeds: 42` → 200 lưu số `42` (xem O-40) | 🔴 BUG-41 (biến thể, Q1: phải 400). `additionalneeds`: BUG-55 (Q1 f) |
| O-10 | `POST /booking` + `PUT /booking/:id` + `PATCH /booking/:id` | `totalprice` các kiểu | `"150"` → lưu `150`; `"abc"` → lưu **`null`**; `true` → **`null`**; `99.99` → lưu **`99`** (2/2); `PATCH 10.75` → **`10`**; `0`, `-100`, `1e20` lưu nguyên. Tất cả **200**. `PUT` `"abc"` → `null`; `PUT` `"150"` → `150`, `true` → `null` (test-impl 2026-11-26, 1/1). **`null`**: `PUT` → **400**, booking giữ nguyên (đúng, reviewer 2/2); `PATCH` → 200 lưu `null` (reviewer 2/2). Biên thêm: O-39 | 🔴 BUG-43. Âm: BUG-57 (Q2 c: phải 400); `0`, `1e20` đúng; chuỗi số `"150"`: phải 400 (Q2 b) |
| O-11 | `POST /booking` + `PUT /booking/:id` + `PATCH /booking/:id` | `depositpaid` các kiểu (JSON) | `"true"` → `true`; **`"false"` → `true`** (2/2 `POST`; `PUT` 2/2 reviewer; `PATCH` trên booking đang `false` → `true` 2/2 lần bổ sung); `"abc"` → `true`; `0` → `false`; `1` → `true`. Tất cả 200. Body urlencoded: O-37 | 🔴 BUG-42 (đảo ngược "chưa cọc" thành "đã cọc") |
| O-12 | `POST /booking` + `PATCH /booking/:id` | Ngày các kiểu | `"10/01/2031"` → lưu `"2031-10-01"` (hiểu theo MM/DD); `"15/01/2031"`, `"2031-13-45"`, `"abc"`, `""` → lưu **`"0NaN-aN-aN"`** (2/2); `"2031-02-30"` → **`"2031-03-02"`** (2/2); `"2031-01-15T01:00:00+07:00"` → **`"2031-01-14"`** (lệch ngày theo múi giờ); `"…T23:30:00Z"` → cắt giờ; số mili giây → đổi thành ngày; `"2032-02-29"` (năm nhuận) lưu đúng. Tất cả 200. `PATCH` ngày `"abc"` → `0NaN-aN-aN`. Biên năm, 31/04: O-39 | 🔴 BUG-44 (Q3 a: phải 400) |
| O-13 | `POST /booking` + `PUT /booking/:id` | Quan hệ 2 ngày | `checkout` **trước** `checkin` → 200 (`POST` 3/3, `PUT` 2/2); cùng ngày, ngày quá khứ (1999) → 200 | 🔴 BUG-56 (Q3 b: phải 400). Cùng ngày → 400; ngày quá khứ đúng (Q3 c) |
| O-14 | `POST /booking` + `PATCH /booking/:id` | Chuỗi | `lastname: ""` → lưu `""`; `"   "` → lưu `""`; `"  Pad  "` → lưu `"Pad"` (**server cắt khoảng trắng đầu cuối khi lưu**, body trả về và `GET` khác giá trị đã gửi, 2/2). 5000 ký tự, tiếng Việt + emoji (`Nguyễn Thị Hồng`, `Ăn sáng chay 🍜`), `<script>alert(1)</script>`, nháy đơn / kép, `\` lưu **nguyên văn**. `PATCH firstname: null` → lưu `null`; `PATCH lastname: ""` → `""` | 🔴 Rỗng / `null`: BUG-55 (knowledge-base, Q1 c, d: phải 400). Cắt khi lưu: BUG-59 (Q1 e: phải lưu nguyên văn) |
| O-15 | `POST /booking` + `PATCH /booking/:id` | Trường thừa `extra`, `roomnumber`, `bookingid: 1` (`POST`); `roomnumber` (`PATCH`) | Bỏ qua, không lưu; `POST` vẫn cấp id mới. `PATCH` 200, không có `roomnumber` | ✅ (trừ `bookingid` ở `PUT` / `PATCH`: O-16) |
| O-16 | `PUT /booking/:id` + `PATCH /booking/:id` | Body có `"bookingid": Y` (Y = booking khác **của mình**), gửi tới booking X, token hợp lệ | Trả **405** `Method Not Allowed` nhưng: booking X **mất** (`GET` X → 404), dữ liệu mới nằm ở **id Y**; mỗi lần chuyển thêm **1 bản ghi** trùng id Y (reviewer: 2 bản ghi, phải `DELETE` Y 2 lần; khám phá: `PUT` rồi `PATCH` vào cùng Y → 3 bản ghi); tìm theo tên cũ và tên mới đều ra id Y. `GET` Y trả **một trong** các bản ghi trùng: bản **mới** (2/2 khám phá, 4/4 reviewer), nhưng với id 1 lại trả bản **gốc** của người khác (xem dưới), nên **không xác định**, không được khẳng định theo bản nào (review A3). Đối chứng `PUT` không có `bookingid` → 200 bình thường. Lần đầu (trước khi biết hiện tượng) gửi `bookingid: 1` tới booking của mình: dữ liệu của mình **mang id 1** (`GET /booking?firstname=<tên của mình>` → `[{"bookingid":1}]`), trùng id với booking của người khác; bản ghi này mất khi dữ liệu bị đặt lại (O-04), không phải xóa tay | 🔴 BUG-51 (High). Chỉ tái hiện trên booking của mình, kiểm chủ sở hữu X, Y **ngay trước** request (lưu ý 2 trong `known-issues.md`) |
| O-17 | `POST /booking` + `PUT /booking/:id` + `PATCH /booking/:id` | `Content-Type` các kiểu | `text/xml` + body XML → 200 (cả `PUT`, `PATCH`); `application/x-www-form-urlencoded` → 200 (lưu sai `depositpaid`: O-37); `application/json; charset=utf-8` → 200. **Không có** `Content-Type`, `text/plain`, `application/xml` → **500** (2/2 không có). `application/json` + body XML, `text/xml` + body JSON → 400 | 🔴 BUG-58. `application/xml`: IMP-11 |
| O-18 | `GET /booking/:id` + `POST /booking` + `PUT /booking/:id` + `GET /booking` | `Accept: application/xml` | Body là XML hợp lệ (`<booking>`, `POST` là `<created-booking>` chứa `<bookingid>`) nhưng **`Content-Type: text/html; charset=utf-8`** (2/2). `GET /booking` với `Accept: application/xml` → vẫn **JSON** | 🔴 BUG-50. `GET /booking` chỉ JSON là đúng (Q9 c) |
| O-19 | `POST /booking` + `GET /booking/:id` | `Accept` không hỗ trợ | `text/plain` → **418** `I'm a Teapot`; `application/x-www-form-urlencoded` → **200** `text/html`, body `formurlencoded is not a function` (lỗi nội bộ lộ ra). Với `POST`: **booking vẫn được tạo** (tìm theo `firstname` thấy; 2/2 `text/plain`, 3/3 urlencoded) dù client không nhận được id | 🔴 BUG-49 (Q9 a: phải 406, không tạo) |
| O-20 | `PUT /booking/:id → GET /booking/:id` | `PUT` đủ 7 trường (Cookie và Basic), tiếng Việt `Trần` | 200, body = booking mới, `GET` giống **từng trường** đã gửi | ✅ AC-4 |
| O-21 | `PUT /booking/:id` | `PUT` đủ trường bắt buộc, **bỏ** `additionalneeds` (giá trị cũ `"OLD"`) | 200, `additionalneeds` vẫn là `"OLD"` trong body trả về và `GET` (2/2) | 🔴 BUG-53 (Q8: phải xóa) |
| O-22 | `PATCH /booking/:id → GET /booking/:id` | `PATCH {"firstname":…}`; `PATCH {}` | Chỉ `firstname` đổi, **6 giá trị còn lại giữ nguyên** (so từng trường); `{}` → 200, không đổi; `PATCH` bằng `text/xml` → đổi đúng trường | ✅ AC-5 (trường cấp 1) |
| O-23 | `PATCH /booking/:id` | `{"bookingdates":{"checkin":"…"}}` / `{"bookingdates":{"checkout":"…"}}` | `checkin` đổi đúng nhưng **`checkout` thành `"0NaN-aN-aN"`** (2/2); gửi `checkout` thì `checkin` thành `0NaN-aN-aN` (reviewer 2/2 mỗi chiều) | 🔴 BUG-45 (vi phạm AC-5) |
| O-24 | `PATCH /booking/:id` | Kiểu sai | `totalprice: "abc"` → `null`; `firstname: null` → `null`; `lastname: ""` → `""`; `additionalneeds: null` → `null`; ngày `"abc"` → `0NaN-aN-aN`. Tất cả 200 | Biến thể BUG-43, BUG-44, BUG-55 |
| O-25 | `PUT /booking/:id` + `PATCH /booking/:id` + `DELETE /booking/:id` | Id không tồn tại `999999999`, `abc`, `-1`, token hợp lệ | **405** `Method Not Allowed` (text/plain), không phải 404 | 🔴 BUG-52 (Q5: phải 404) |
| O-26 | `DELETE /booking/:id → GET /booking/:id` | Xóa, rồi xóa lần 2, rồi `PUT` / `PATCH` | `DELETE` → **201**, `text/plain`, body `Created`; `GET` → 404; id không còn trong `GET /booking`. `DELETE` lần 2 → **405**; `PUT`, `PATCH` sau khi xóa → **405**; booking không sống lại (2/2) | ✅ AC-6 (201 là hợp đồng: BR-10). Lần 2 / sau khi xóa phải 404: BUG-52 (Q5) |
| O-27 | `PUT /booking/:id` + `PATCH /booking/:id` + `DELETE /booking/:id` | 22 kiểu thông tin xác thực × 3 method (bảng 2 bên dưới, v01 → v22); sau mỗi lần bị từ chối `GET` lại và so **cả body** | Bị từ chối: **403** `Forbidden` (text/plain), booking **không đổi**, không bị xóa (16 kiểu bị từ chối × 3 method). Được chấp nhận: Cookie `token=<t>` (cả khi có cookie khác trước / sau, cả khi giá trị trong nháy kép), Basic đúng, **token cũ** (token 1 sau khi đã cấp token 2), Cookie đúng **kèm** Basic sai | ✅ AC-7 (403 là đúng, Q4). Token cũ: thuộc RB-101 (TVP-026 của RB-101). Scheme `basic` viết thường bị từ chối: IMP-08 |
| O-28 | `POST /booking → GET /booking` | `POST` 2 lần liên tiếp cùng body | 2 booking, 2 id khác nhau, tìm theo tên thấy cả 2 (2/2) | ✅ đúng (Q10) |
| O-29 | `PUT /booking/:id` | `GET` lấy `ETag`, rồi `PUT` với `If-Match: "stale-etag"` | `ETag` yếu (`W/"…"`); `PUT` vẫn **200**, ghi đè (2/2) | IMP-06 (knowledge-base: dữ liệu hiện tại) |
| O-30 | `GET /booking` | Lọc tên (3 booking cùng `firstname` / `lastname` khác hoa thường, 1 booking tên tiếng Việt có dấu cách) | Khớp **chính xác**, **phân biệt hoa thường** (`Zeta…` ≠ `zeta…` ≠ `ZETA…`), **không** khớp một phần (`QA-RB102-fl` → `[]`), **không** cắt khoảng trắng (`%20QA…` → `[]`); tên tiếng Việt có dấu cách tìm được (`%20` và `+`); `firstname` + `lastname` = **và**; `firstname=` rỗng → `[]`; tham số lạ `foo=bar` bị bỏ qua; lặp `firstname=a&firstname=b` → **500** | ✅ (Q7 a → e). Lặp tham số: BUG-48 (Q7 f: phải 400) |
| O-31 | `GET /booking` | Lọc `checkin=D`, booking có `checkin` = D−1, D, D+1, D+2 | Booking có `checkin` **bằng D bị loại**; chỉ `checkin > D` (2/2: bộ F 2040-03-10, booking G 2041-06-10; reviewer 2/2) | 🔴 BUG-47 (AC-3: ≥) |
| O-32 | `GET /booking` | Lọc `checkout=D`, booking có `checkout` = D−1, D, D+1 | Trả booking có `checkout` **≤ D** (đảo chiều): G có `checkout` 2041-06-20, lọc `…-19` **không** có G, lọc `…-20` và `…-21` **có** G (2/2 với bộ F; reviewer 2/2). `checkout=2040-03-19` trả 2.269 / 2.283 booking | 🔴 BUG-46 (AC-3: ≥) |
| O-33 | `GET /booking` | `checkin` + `checkout` (+ `lastname`) | Kết hợp = **và** theo đúng 2 điều kiện đang có ở O-31, O-32 | ✅ "và" là đúng (Q7 e) |
| O-34 | `GET /booking` | Ngày lọc sai | `checkin=abc`, `checkin=2040-13-45`, `checkout=abc` → **500**; `checkin=08/03/2040` → 200 (hiểu là 2040-08-03) | 🔴 BUG-48 |
| O-35 | Cả 6 | Phản hồi lỗi | Mọi lỗi là `text/plain` một cụm từ (`Not Found`, `Forbidden`, `Bad Request`, `Method Not Allowed`, `Internal Server Error`), không nói trường nào sai | IMP-01 |
| O-36 | `DELETE /booking/:id` | Dọn dẹp cuối phiên khám phá | Lấy `GET /booking`, chỉ xét id mình đã ghi lại còn tồn tại, `GET` từng id và **chỉ xóa khi `firstname` bắt đầu bằng `QA-RB102`**: xóa 12 booking (booking của O-06 đã bị xóa ngay trong lần thử), **bỏ qua 2 id** đã thuộc người khác sau đặt lại (O-04). Kiểm lại theo 16 `firstname` đã dùng: không còn booking nào. Lần bổ sung sau review: `firstname` cố định theo lần chạy, một truy vấn lọc tìm ra 23 booking, xóa hết (kiểm `firstname` trước mỗi lần xóa), lọc lại → `[]` | An toàn dữ liệu dùng chung |
| O-37 | `POST /booking` + `PUT /booking/:id` + `PATCH /booking/:id` | Body **urlencoded** (định dạng tài liệu công bố: "URLencoded example usage") có `depositpaid=false` | `POST` → 200, `GET`: **`depositpaid: true`**, các trường khác đúng (`totalprice` 120, ngày đúng) (2/2; reviewer 2/2). `PUT` urlencoded `depositpaid=false` trên booking đang `false` → **`true`** (2/2). `PATCH` urlencoded `depositpaid=false&totalprice=99` → giá `99` đúng, cọc **`true`** (2/2). Ở định dạng này mọi giá trị là chuỗi nên **không cách nào lưu được "chưa cọc"** | 🔴 BUG-42 (ví dụ chính, review A1) |
| O-38 | `GET /booking` | Tham số lọc dạng **object / toán tử**: `firstname[$ne]=…`, `firstname[$eq]=<tên không tồn tại>`, `lastname[$gt]=zzzz`, `checkin[$gt]=2046-01-01` | Đều **200** và trả **toàn bộ** danh sách (2.117 → 2.125 id). Đối chứng `firstname=<tên không tồn tại>` → `[]`. `$eq` với tên không tồn tại cũng trả hết, nên toán tử **không** được thực thi (không phải NoSQL injection khai thác được) mà bộ lọc bị **bỏ âm thầm** (1/1 mỗi tham số; reviewer 4 truy vấn khác, cùng kết quả) | 🔴 biến thể BUG-48 (review A2) |
| O-39 | `POST /booking` | Biên số và ngày (review D2) | `totalprice` `9007199254740993` (2^53 + 1) → `9007199254740992` (mất chính xác khi đọc JSON); `0.005` → **`0`**; `-0` → `0`. Ngày `0001-01-01`, `9999-12-31` lưu đúng; `10000-01-01` → **`0000-01-01`**; `2046-04-31` → **`2046-05-01`** (cuộn). Tất cả 200 (1/1) | 🔴 `0.005`: BUG-43 (Q2 a: tối đa 2 chữ số lẻ → 400); năm 10000, 31/04: BUG-44 (Q3: phải 400). 2^53 + 1: chỉ ghi nhận (Q2 e) |
| O-40 | `POST /booking` | `additionalneeds` sai kiểu (review B3) | Object `{"a":1}`, mảng `["x","y"]`, boolean `false` → 200, lưu **nguyên kiểu** (không phải chuỗi). Cùng `42` (số), `null` ở O-09 | 🔴 BUG-55 (Q1 f: phải 400) |
| O-41 | `GET /booking/:id` | `Accept: application/xml` với `additionalneeds` = `a<b & c]]>"d'` | XML escape **đúng**: `a&lt;b &amp; c]]&gt;"d'` (1/1) | ✅ AC-8 (nội dung XML) |
| O-42 | `GET /booking` (đường dẫn) + `GET /booking/:id` (đường dẫn) | Phương thức không hỗ trợ (review B2 c) | `DELETE /booking`, `PUT /booking`, `PATCH /booking`, `POST /booking/<id>` → **404** `Not Found` (không tạo / sửa / xóa gì); `HEAD /booking/<id>` → 200; `OPTIONS /booking/<id>` → 200, `Allow: DELETE, GET, HEAD, PATCH, PUT` (1/1) | ✅ không đổi dữ liệu. 404 thay vì 405: IMP-13 |
| O-43 | `PUT /booking/:id` + `PATCH /booking/:id` + `DELETE /booking/:id` | Thêm 2 kiểu xác thực (từ RB-101 O-19): token ví dụ của tài liệu `abc123`; token hợp lệ + 1 ký tự thừa | Cả 2 kiểu × 3 method: **403**, booking giữ nguyên cả body (1/1) | ✅ AC-7. v23, v24 ở bảng 2 |
| O-44 | `POST /booking` + `PUT /booking/:id` + `PATCH /booking/:id` | Body **XML** (`Content-Type: text/xml`) có `<depositpaid>false</depositpaid>` (test-impl kiểm lại trên API thật, 2026-11-26, booking `QA-RB102-TI` của mình, đã xóa) | `POST` → 200, body trả về và `GET`: **`depositpaid: true`**, các trường khác đúng (2/2). `PATCH` XML `<booking><depositpaid>false</depositpaid></booking>` trên booking đang `false` (vừa đặt bằng `PATCH` JSON) → **`true`** (1/1). `PUT` XML đủ trường với `<depositpaid>false</depositpaid>` trên booking đang `true` → **`true`** (2/2, kiểm lại sau review-test-impl). `PATCH` JSON `false` → `false` đúng (đối chứng) | 🔴 biến thể BUG-42 (cùng chỗ ép kiểu chuỗi `"false"`: XML, urlencoded đều gửi chuỗi). Bắt ở TC-058 |

## Ma trận endpoint × lớp đầu vào × quyền
✅ đúng như AC / quyết định HITL #1 · ❌ lỗi (bug) · ⚠️ cải tiến, không phải bug · – không áp dụng. Ô ghi mã HTTP quan sát được; expected đã chốt ghi sau dấu "→ phải".

**Bảng 1: endpoint × lớp đầu vào** (quyền hợp lệ cho `PUT` / `PATCH` / `DELETE`)

| Lớp đầu vào | `POST /booking` | `GET /booking/:id` | `GET /booking` | `PUT /booking/:id` | `PATCH /booking/:id` | `DELETE /booking/:id` |
|---|---|---|---|---|---|---|
| Hợp lệ, so từng trường | ✅ 200 (O-01, O-02) | ✅ 200 (O-02) | ✅ 200 (O-03) | ✅ 200 (O-20) | ✅ 200 trường cấp 1 (O-22) | ✅ 201 rồi `GET` 404 (O-26, BR-10) |
| Thiếu từng trường bắt buộc | ❌ 500 → phải 400 (O-07, BUG-41) | – | – | ✅ 400 (O-08, Q1) | – (trường tùy chọn) | – |
| Thiếu trường tùy chọn `additionalneeds` | ✅ 200, không có khóa | – | – | ❌ 200 giữ giá trị cũ → phải xóa (O-21, BUG-53) | ✅ giữ nguyên | – |
| Body `{}` / `[]` | ❌ 500 → phải 400 (O-08, BUG-41) | – | – | ✅ 400 (O-08) | ✅ `{}` 200 không đổi | – |
| Body không phải JSON (`""`) / JSON hỏng / `null` | ❌ 500 → phải 400 (BUG-58) / ✅ 400 / ✅ 400 (O-08) | – | – | – | – | – |
| `null` cho trường bắt buộc | ❌ 500 → phải 400 (O-09, BUG-41) | – | – | – | ❌ 200 lưu `null` → phải 400 (O-24, BUG-55) | – |
| `additionalneeds` sai kiểu (số, object, mảng, boolean) | ❌ 200 lưu nguyên kiểu → phải 400 (O-09, O-40, BUG-55) | – | – | – | – | – |
| `totalprice` sai kiểu / thập phân | ❌ 200, `null` / cắt `.99`, `0.005` → 0 → phải 400 (sai kiểu, > 2 chữ số lẻ) / lưu đúng (O-10, O-39, BUG-43) | – | – | ❌ 200 `null` → phải 400 (O-10) | ❌ 200 cắt `.75` → phải lưu 10.75 (O-10) | – |
| `totalprice` 0 / âm / rất lớn / 2^53 + 1 | ✅ 0 / rất lớn 200; ❌ âm 200 → phải 400 (BUG-57); 2^53 + 1 ghi nhận (O-10, O-39, Q2) | – | – | – | – | – |
| `depositpaid` chuỗi `"false"` (JSON) | ❌ 200 lưu `true` → phải 400 (O-11, BUG-42) | – | – | ❌ 200 `true` → phải 400 | ❌ 200 `true` → phải 400 | – |
| Body urlencoded (`depositpaid=false`) | ❌ 200 lưu `true` → phải lưu `false` (O-37, BUG-42) | – | – | ❌ 200 `true` → phải `false` | ❌ 200 `true` → phải `false` | – |
| Ngày sai định dạng / không tồn tại / năm 10000 | ❌ 200, `0NaN-aN-aN` / cuộn ngày / `0000` → phải 400 (O-12, O-39, BUG-44) | – | ❌ 500 → phải 400 (O-34, BUG-48) | – | ❌ 200 `0NaN-aN-aN` → phải 400 (O-24) | – |
| Ngày biên `0001-01-01`, `9999-12-31` | ✅ 200 lưu đúng (O-39, Q3 d) | – | – | – | – | – |
| `checkout` trước `checkin` | ❌ 200 → phải 400 (O-13, BUG-56) | – | – | ❌ 200 → phải 400 (O-13) | – | – |
| `PATCH` một trường con `bookingdates` | – | – | – | – | ❌ trường con kia `0NaN-aN-aN` → phải giữ nguyên (O-23, BUG-45) | – |
| Chuỗi rỗng / chỉ khoảng trắng | ❌ 200 lưu `""` → phải 400 (O-14, BUG-55) | – | ✅ `firstname=` → `[]` (Q7 d) | – | ❌ 200 `""` → phải 400 (O-24) | – |
| Khoảng trắng đầu cuối | ❌ 200 lưu đã cắt → phải nguyên văn (O-14, BUG-59) | – | ✅ không cắt khi lọc (O-30, Q7 c) | – | – | – |
| Chuỗi 5000 ký tự / tiếng Việt / HTML | ✅ 200, nguyên văn (O-14) | ✅ XML escape đúng (O-41) | ✅ tìm được tiếng Việt (O-30) | ✅ (O-20) | ✅ | – |
| Trường thừa | ✅ bỏ qua (O-15) | – | ✅ tham số lạ bỏ qua | ❌ `bookingid` → 405 + chuyển id → phải 200, bỏ qua `bookingid` (O-16, BUG-51) | ❌ `bookingid` → 405 + chuyển id → phải 200, bỏ qua (O-16) | – |
| Lọc tên hoa thường / một phần | – | – | ✅ phân biệt, chính xác (O-30, Q7 a, b) | – | – | – |
| Lọc ngày ≥ (giá trị bằng, nhỏ hơn, lớn hơn) | – | – | ❌ `checkin` > (BUG-47), `checkout` ≤ (BUG-46) → phải ≥ cả hai | – | – | – |
| Lặp tham số lọc | – | – | ❌ 500 → phải 400 (O-30, BUG-48) | – | – | – |
| Tham số lọc dạng object / toán tử | – | – | ❌ 200 trả toàn bộ → phải 400 (O-38, BUG-48) | – | – | – |
| `Accept: application/xml` | ❌ XML nhưng `text/html` → phải `Content-Type` XML (O-18, BUG-50) | ❌ như bên trái | ✅ JSON (Q9 c) | ❌ như bên trái | (cùng mã) | – |
| `Accept` không hỗ trợ | ❌ 418 / 200 lỗi nội bộ mà vẫn tạo → phải 406, không tạo (O-19, BUG-49) | ❌ 418 / 200 lỗi nội bộ → phải 406 | – | – | – | – |
| `Content-Type: text/xml` | ✅ 200; ❌ `<depositpaid>false` lưu `true` → phải `false` (O-44, BUG-42) | – | – | ✅ 200 | ✅ 200; ❌ `depositpaid` `false` lưu `true` (O-44) | – |
| Không có / sai `Content-Type` | ❌ 500 → phải 415 (O-17, BUG-58) | – | – | – | – | – |
| Phương thức không hỗ trợ | ✅ `POST /booking/<id>` 404, không tạo (O-42) | ✅ `HEAD` 200, `OPTIONS` 200 | ✅ `DELETE` / `PUT` / `PATCH /booking` 404 (O-42) | – | – | – |
| Id không tồn tại (lớn, 0, âm, chữ) | – | ✅ 404 (O-05) | – | ❌ 405 → phải 404 (O-25, BUG-52) | ❌ 405 → phải 404 | ❌ 405 → phải 404 |
| Id có tiền tố số (`12abc`, `1.5`, `0012`) | – | ❌ 200 → phải 404 (O-06, BUG-54) | – | ❌ 200 sửa được → phải 404 | ❌ 200 sửa được → phải 404 | ❌ 201 xóa được → phải 404 |
| Đã xóa trước đó | – | ✅ 404 (O-26) | ✅ không còn id | ❌ 405 → phải 404 | ❌ 405 → phải 404 | ❌ 405 → phải 404 (BUG-52) |
| Gửi 2 lần cùng body | ✅ 2 booking (O-28, Q10) | – | – | ✅ kết quả như 1 lần | – | ❌ lần 2 405 → phải 404 (BUG-52) |
| Dữ liệu cũ (`If-Match` sai) | – | – | – | ⚠️ 200 ghi đè (O-29, IMP-06) | – | – |

**Bảng 2: thông tin xác thực × method** (O-27, O-43; mỗi ô: mã trả về / booking sau đó. "giữ" = `GET` lại giống cả body trước đó). RB-102 sở hữu toàn bộ ma trận này và `Basic` (quyết định của orchestrator); RB-101 chỉ kiểm cấp token.

| # | Thông tin xác thực | `PUT` | `PATCH` | `DELETE` | Ghi chú |
|---|---|---|---|---|---|
| v01 | Không có | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v02 | `Cookie: token=wrongtoken123` | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v03 | `Cookie: token=` (rỗng) | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v04 | `Cookie: token=<token hợp lệ>` | 200 / đổi | 200 / đổi | 201 / xóa | ✅ dương tính |
| v05 | `Cookie: TOKEN=<token>` (tên viết hoa) | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v06 | `Cookie: token=<token>; foo=bar` | 200 | 200 | 201 | ✅ |
| v07 | `Cookie: foo=bar; token=<token>` | 200 | 200 | 201 | ✅ |
| v08 | `Cookie: <token>` (không có tên) | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v09 | `Cookie: token="<token>"` (nháy kép) | 200 | 200 | 201 | ✅ (cú pháp cookie cho phép) |
| v10 | `Cookie: token=<TOKEN VIẾT HOA>` | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v11 | `Cookie: token=<token thiếu 1 ký tự>` | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v12 | `Authorization: Bearer <token>` | 403 / giữ | 403 / giữ | 403 / còn | ✅ (tài liệu không hỗ trợ Bearer) |
| v13 | `Authorization: Basic <đúng>` | 200 | 200 | 201 | ✅ dương tính |
| v14 | `Basic` sai mật khẩu | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v15 | `Basic !!!notbase64` | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v16 | `basic <đúng>` (scheme viết thường) | 403 / giữ | 403 / giữ | 403 / còn | ⚠️ RFC 7235: scheme không phân biệt hoa thường (IMP-08) |
| v17 | `Basic` tên đăng nhập `Admin` (viết hoa) | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v18 | `?token=<token>` trên URL | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v19 | Header `token: <token>` | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v20 | Token cũ (lấy trước token mới) | 200 | 200 | 201 | Thuộc RB-101 (TVP-026 của RB-101); chỉ ghi tham khảo |
| v21 | `Authorization: Basic ` (rỗng) | 403 / giữ | 403 / giữ | 403 / còn | ✅ |
| v22 | Cookie đúng + `Basic` sai | 200 | 200 | 201 | ⚠️ thông tin mâu thuẫn vẫn qua (IMP-08) |
| v23 | `Cookie: token=abc123` (token ví dụ của tài liệu) | 403 / giữ | 403 / giữ | 403 / còn | ✅ (O-43; từ RB-101 O-19) |
| v24 | `Cookie: token=<token hợp lệ + 1 ký tự thừa>` | 403 / giữ | 403 / giữ | 403 / còn | ✅ (O-43; từ RB-101 O-19) |

Mã từ chối: **403 là đúng** (Q4, HITL #1; quyết định chung cho cả RB-101 và RB-102), 401 chỉ là cải tiến IMP-02. Kiểm soát truy cập thuộc trục `non-functional` (bảo mật), `scope=in` (AC-7 của feature này). **Không có khái niệm chủ sở hữu booking**: mọi token hợp lệ sửa / xóa được mọi booking; ticket không đòi nên ghi `scope=out` (TVP-063).

## Dependencies
- RB-101 (`restful-booker-auth-api`): `POST /auth` cấp token cho `PUT` / `PATCH` / `DELETE`. Hạn token, token cũ sau khi cấp token mới, thu hồi token thuộc RB-101 (RB-101 Q6, TVP-026).
- Biến môi trường cho tên đăng nhập / mật khẩu quản trị (mặc định: giá trị công khai trong tài liệu), dùng cho token và `Authorization: Basic`. Không ghi cứng. `requirement/apidoc.txt` là bản sao nguyên văn tài liệu công khai, có thông tin đăng nhập demo công khai (ghi chú ở đầu `requirement.md`).
- Máy chủ công khai dùng chung (Heroku): người khác tạo / sửa / xóa song song, **dữ liệu bị đặt lại định kỳ** (O-04), có thể ngủ / trả 503. **Chiến lược chung RB-101 / RB-102** (chi tiết ở `known-issues.md` "Lưu ý cho bước sau"): không dùng `retries` của Playwright; chỉ coi là bị đặt lại khi đủ 3 dấu hiệu (booking của chính test trả 404; token mới gọi `PATCH /booking/999999999` **không bị 403** (không dựa vào mã 405 hiện tại: đó là BUG-52, sửa thành 404 thì dấu hiệu vẫn đúng); thời điểm trong cửa sổ x0:50 → x1:30 quanh lần đặt lại ở phút x1, giờ UTC); khi đó làm lại bước chuẩn bị **một lần** trong test và ghi annotation `env-reset`, đặt lại lần 2 thì fail; không lấy token trong `beforeAll`; dọn dẹp chấp nhận 403 / 404; Heroku 503 / máy chủ ngủ là lỗi môi trường. `firstname` cố định theo lần chạy để một truy vấn lọc tìm được mọi booking sót (Q12).
- Playwright `APIRequestContext` (`request` fixture) cho test API; không cần trình duyệt.

## Phạm vi test
- **Trong phạm vi**: AC-1 → AC-8 cho 6 endpoint; so **từng trường** (7 giá trị) khi tạo / đọc lại / sửa; thiếu từng trường; sai kiểu (cả `additionalneeds`); biên giá (0, âm, thập phân, rất lớn, 2^53 + 1, `0.005`) và ngày (`0001`, `9999`, `10000`, 31/04); ngày sai / không tồn tại / có múi giờ / `checkout` trước `checkin`; chuỗi rỗng, khoảng trắng, rất dài, tiếng Việt, HTML; trường thừa (kể cả `bookingid`); `PUT` thiếu trường vs `PATCH`, `PATCH` trường con; 3 định dạng body (JSON, XML, urlencoded); lọc tên (hoa thường, một phần, rỗng, kết hợp), lọc ngày (giá trị bằng, nhỏ hơn, lớn hơn; sai định dạng), tham số lọc dạng object / mảng / toán tử; `Accept` / `Content-Type` (JSON, XML, escape XML, không hỗ trợ, thiếu); phương thức không hỗ trợ; id không tồn tại / sai định dạng / đã xóa; ma trận 24 kiểu xác thực × 3 method và booking không đổi khi bị từ chối; xóa 2 lần, sửa sau khi xóa, `POST` 2 lần.
- **Ngoài phạm vi** (ghi trong `viewpoint.csv` với `scope=out`): cấp / hết hạn / thu hồi token, token cũ (RB-101); hiệu năng, tải, kiểm thử xâm nhập chuyên sâu (ticket); giao diện web; `GET /ping` (RB-101); phân trang (IMP-04); khóa lạc quan `If-Match` (IMP-06); chủ sở hữu booking (ticket không có mô hình chủ sở hữu, TVP-063); `Accept: application/x-www-form-urlencoded` ngoài 2 định dạng của AC-8 (chỉ kiểm "không được tạo booking khi trả lỗi", BUG-49).

## Review checklist
| Mục | Kết quả | Ghi chú |
|---|---|---|
| Chức năng được mô tả đầy đủ? | ✅ | Đủ 6 endpoint, dữ liệu một booking, 2 kiểu xác thực |
| AC đo lường được, testable? | ✅ | Sau HITL #1 (2026-11-26, "theo đề xuất hết"): mã lỗi (Q1 → 400, Q4 → 403, Q5 → 404, Q9 → 406 / 415), lọc tên (Q7), `PUT` xóa trường tùy chọn (Q8), lưu nguyên văn (Q1 e) đã chốt thành BR-2 → BR-16; 201 của `DELETE` theo quy tắc chung |
| Validation và error handling? | ❌ | Ticket ghi rõ là "chưa rõ". Khám phá cho thấy hầu như **không có kiểm tra**: thiếu trường → 500, sai kiểu → ép kiểu thành giá trị khác (O-07 → O-12, O-24, O-37 → O-40) |
| Ràng buộc kỹ thuật / business? | ✅ | Sau HITL #1: `checkout` sau `checkin` ít nhất 1 đêm, giá ≥ 0, tối đa 2 chữ số lẻ, năm 0001 → 9999 (BR-3, BR-4) |
| Dependency được liệt kê? | ✅ | RB-101. Bổ sung: biến môi trường, dữ liệu dùng chung bị đặt lại (O-04), chiến lược chung với RB-101 |
| Edge case, negative? | ✅ | Ticket có mục "Chưa rõ" (đã chốt ở HITL #1). Bổ sung qua khám phá: `bookingid` trong body (O-16), `Accept` không hỗ trợ vẫn tạo (O-19), id có tiền tố số (O-06), `PATCH` trường con (O-23); sau review: urlencoded (O-37), tham số lọc object (O-38), biên (O-39), `additionalneeds` sai kiểu (O-40), escape XML (O-41), phương thức không hỗ trợ (O-42) |
| Kiểm soát truy cập? | ✅ | 24 kiểu × 3 method (O-27, O-43): bị từ chối đều không đổi dữ liệu. 403 là đúng (Q4, chung với RB-101). Không có chủ sở hữu booking: `out` (TVP-063) |
| Có câu hỏi blocking? | ✅ | 10 câu (7 blocking, 3 non-blocking), **cả 10 đã trả lời ở HITL #1** (2026-11-26, theo đề xuất) + 2 dòng tham chiếu (Q6 quy tắc chung 201, Q11 theo RB-101 Q6), xem [`q-and-a.md`](q-and-a.md). Điều đã có quy tắc trong knowledge-base không hỏi lại (id sai định dạng, chỉ khoảng trắng = trống, độ dài không giới hạn, tạo không thành công không để lại dữ liệu) |

**Bug phát hiện sớm**: xem [`known-issues.md`](known-issues.md) (**BUG-41 → BUG-59**, số chính thức cấp ở HITL #1, và **BUG-60** phát hiện ở script-gen; bảng số tạm → số chính thức ở cuối `known-issues.md`). **Cải tiến**: [`improvements.md`](improvements.md) (IMP-01 → IMP-13).
