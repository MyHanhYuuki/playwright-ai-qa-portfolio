# Test Data Catalog: RB-102 Quản lý đặt phòng (restful-booker-booking-api)

> **Mật khẩu quản trị không ghi trong test case, tài liệu hay code.** Đọc từ biến môi trường **`RB_ADMIN_USERNAME`** và **`RB_ADMIN_PASSWORD`** (HITL #2 chốt, **cùng tên với RB-101**; base URL: `RB_BASE_URL`). Ghi 3 tên (không có giá trị) vào `.env.example`. Mặc định của cả hai là **giá trị công khai trong tài liệu API** (`requirement/apidoc.txt`), đặt trong `tests/data/` giống `SAUCE_PASSWORD` của SauceDemo. Chuỗi `Authorization: Basic …` **ghép lúc chạy** từ hai biến này, không ghi sẵn ở đâu. Không ghi token thật vào log, annotation, evidence (chỉ ghi độ dài).
> **Ký hiệu**: `<RUN>` = mã lần chạy (TD-02); `X`, `Y`, `A`… = id booking do **chính test** tạo; `<token>` = token lấy bằng `POST /auth` (TD-05). "7 giá trị" = `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout`, `additionalneeds` (spec-review). Expected trong `test-cases.csv` theo **quyết định HITL #1** (400 / 404 / 406 / 415 / 403, `DELETE` 201, lưu nguyên văn…), **không** theo hiện trạng; cột "hiện tại" trong các bảng dưới chỉ để đối chiếu khi đọc lỗi.
> **Kiểm lại trên API thật** (test-impl, 2026-11-26, 35 request, booking `firstname` `QA-RB102-TI` của mình, đã xóa hết, lọc lại `[]`): đúng các giá trị header / thông báo ở mục "Thông báo nguyên văn", cấu trúc XML (TD-19), cú pháp urlencoded có ngoặc vuông (TD-20), `POST` `Accept: text/plain` trả 418 mà vẫn tạo booking ẩn (BUG-49), token mới gọi `PATCH /booking/999999999` nhận **405** (không phải 403: dấu hiệu 2 của TD-26 dùng được), `PUT` bỏ `additionalneeds` vẫn giữ giá trị cũ (BUG-53). Giữa 2 lần chạy cách nhau vài phút, id mới từ `5229` về `14`: **dữ liệu bị đặt lại** đúng như O-04. **Phát hiện mới O-44**: body XML `<depositpaid>false</depositpaid>` lưu `true` (biến thể BUG-42, đã thêm vào `spec-review.md`, `known-issues.md`, `viewpoint.csv` TVP-047; bắt ở TC-058).
> **Kiểm lại lần 2 sau `reviews/review-test-impl.md`** (test-impl, 2026-11-26, 19 request, booking `QA-RB102-TI2` của mình, đã xóa, lọc lại `[]`): `PUT` `totalprice` `"150"` → 200 lưu `150`, `true` → 200 lưu `null` (BUG-43); `PUT` `depositpaid` `0` → 200 lưu `false` (BUG-42); `PUT` body XML `<depositpaid>false</depositpaid>` trên booking đang `true` → lưu `true` (2/2, O-44 mở rộng sang `PUT`, TC-058 biến thể 6). Reviewer đo `PUT` `totalprice: null` → **400**, giữ nguyên (đúng, TC-041) và `PATCH` `totalprice: null` → 200 lưu `null` (bug, TC-050).

| ID | Tên | Dữ liệu | Dùng cho |
|---|---|---|---|
| TD-01 | Kết nối, header JSON chuẩn | Base URL `https://restful-booker.herokuapp.com` (biến môi trường `RB_BASE_URL`, mặc định giá trị này). Header JSON: `Content-Type: application/json` + `Accept: application/json`. Mỗi request độc lập, không giữ cookie giữa các request (`APIRequestContext` riêng, không `storageState`). Chạy **tuần tự** (`workers: 1` cho project API hoặc `test.describe.configure({ mode: 'serial' })`), **không** `retries` (TD-26) | 50 TC: TC-001 → TC-023, TC-025, TC-026, TC-040 → TC-056, TC-062 → TC-069 |
| TD-02 | Mã lần chạy, tên, chủ sở hữu | `<RUN>` = `YYMMDDHHmmss-xxxx` (giờ UTC lúc bắt đầu chạy + 4 ký tự ngẫu nhiên `[a-z0-9]`), vd `261126093015-k3f9`; một giá trị cho **cả lần chạy**. **firstname** = `QA-RB102-<RUN>` (mọi TC). **lastname** = mã TC (`TC-001`) hoặc mã TC + `-<biến thể>` (`TC-004-lastname`). Biến thể **không giữ được firstname** (thiếu / rỗng / sai kiểu): lastname = `QA-RB102-<RUN>-TC-xxx-<biến thể>`. Biến thể có thể **hỏng cả hai tên**: additionalneeds = `QA-RB102-<RUN>-TC-xxx[-<biến thể>]`. **Sổ tên của lần chạy** (review-test-impl B1): mọi giá trị tên test đã gửi (firstname biến thể như `QA-RB102-<RUN>-moi`, `-patch`, `-khac`, `QA-RB102-<RUN> Nguyễn Văn`, chuỗi 5000 ký tự của TC-020; lastname / additionalneeds mang `QA-RB102-<RUN>` của biến thể không giữ được firstname) được ghi vào sổ lần chạy (TD-26). **Chủ sở hữu**: booking là của lần chạy khi `firstname`, `lastname` hoặc `additionalneeds` **khớp chính xác** một giá trị trong sổ; đọc bằng `GET /booking/<id>` **ngay trước** mọi request ghi / xóa (L17). Không dùng id cứng; không lưu id qua test | 64 TC: TC-001 → TC-004, TC-007 → TC-026, TC-028 → TC-036, TC-039 → TC-069 |
| TD-03 | Booking chuẩn (`POST`) | `{"firstname":"QA-RB102-<RUN>","lastname":"<TC>","totalprice":150,"depositpaid":false,"bookingdates":{"checkin":"2031-01-10","checkout":"2031-01-12"},"additionalneeds":"Breakfast"}`. `depositpaid` mặc định `false` để thấy lỗi ép kiểu sang `true`; TC cần `true` ghi rõ | 63 TC: TC-001 → TC-004, TC-007 → TC-026, TC-028 → TC-036, TC-039 → TC-064, TC-066 → TC-069 |
| TD-04 | Booking thay thế (`PUT`) | Khác TD-03 ở **cả 7 giá trị**: `{"firstname":"QA-RB102-<RUN>-moi","lastname":"<TC>-moi","totalprice":275,"depositpaid":true,"bookingdates":{"checkin":"2032-02-01","checkout":"2032-02-05"},"additionalneeds":"Ăn sáng chay"}` (TC-040: lastname `TC-040 Trần`). firstname vẫn bắt đầu bằng `QA-RB102-<RUN>` nên vẫn nhận được chủ sở hữu (TD-02) | 21 TC: TC-040 → TC-046, TC-054 → TC-061, TC-063, TC-065 → TC-069 |
| TD-05 | Token | `POST /auth`, `Content-Type: application/json`, body `{"username": <RB_ADMIN_USERNAME>, "password": <RB_ADMIN_PASSWORD>}` → 200, `{"token": "<chuỗi>"}` (hiện 15 ký tự). Lấy **ngay trước** nhóm request cần quyền trong test; dọn dẹp lấy token riêng; **không** lấy trong `beforeAll`. Dùng: `Cookie: token=<token>` | 28 TC: TC-040 → TC-061, TC-063 → TC-068 |
| TD-06 | `Authorization: Basic` | Đúng: `Basic ` + base64(`<RB_ADMIN_USERNAME>:<RB_ADMIN_PASSWORD>`). Sai mật khẩu (v14): base64(`<RB_ADMIN_USERNAME>:<RB_ADMIN_PASSWORD>x`). Tên đăng nhập viết hoa chữ đầu (v17): base64(`<RB_ADMIN_USERNAME viết hoa chữ đầu>:<RB_ADMIN_PASSWORD>`). Tất cả ghép lúc chạy | TC-066 → TC-068 |
| TD-07 | Ma trận xác thực | Bảng "TD-07" dưới (v01 → v24, cột phạm vi) | TC-066 → TC-068 |
| TD-08 | `totalprice` | Bảng "TD-08" dưới | 9 TC: TC-007 → TC-011, TC-041, TC-044, TC-050, TC-056 |
| TD-09 | `depositpaid` | JSON hợp lệ: `true`, `false` (boolean). JSON lỗi: `"false"`, `"true"`, `"abc"`, `0`, `1` (→ 400; hiện `"false"` → `true`, `"abc"` → `true`, `0` → `false`, `1` → `true`), `null` (TC-007). urlencoded: `depositpaid=true` / `depositpaid=false` phải lưu đúng nghĩa (hiện `false` → `true`). XML: `<depositpaid>true</depositpaid>` / `<depositpaid>false</depositpaid>` phải lưu đúng nghĩa (hiện `false` → `true` ở `POST`, `PUT`, `PATCH`, O-44) | TC-007, TC-012, TC-045, TC-051, TC-056 |
| TD-10 | Ngày không hợp lệ | Bảng "TD-10" dưới | TC-013, TC-014, TC-052 |
| TD-11 | Ngày hợp lệ đặc biệt và quan hệ 2 ngày | Hợp lệ (đọc lại đúng nguyên văn): `2032-02-29` → `2032-03-01` (năm nhuận); `0001-01-01` → `0001-01-02`; `9999-12-30` → `9999-12-31`; `1999-01-01` → `1999-01-05` (quá khứ, Q3 c); `2033-05-01` → `2033-05-03`. Lỗi (→ 400, BUG-56): checkout **trước** checkin (`2031-01-12` → `2031-01-10`; PUT `2032-02-05` → `2032-02-01`); checkout **bằng** checkin (`2031-01-10` → `2031-01-10`; PUT `2032-02-01` → `2032-02-01`) | TC-015, TC-016, TC-046, TC-056 |
| TD-12 | Chuỗi | Hợp lệ, lưu nguyên văn: `TC-018 Nguyễn Thị Hồng`, `Ăn sáng chay 🍜`, `TC-018 <script>alert(1)</script>`, `O'Brien "Jr" a\b` (trong JSON: `"O'Brien \"Jr\" a\\b"`), XML đặc biệt `a<b & c]]>"d'` (TC-028). Khoảng trắng đầu cuối, phải lưu nguyên văn (BUG-59): lastname `␣␣TC-019-Pad␣␣` (14 ký tự), additionalneeds `␣␣Pad␣␣` (7 ký tự). Rỗng / chỉ khoảng trắng (→ 400, BUG-55): `""`, `"   "` (3 khoảng trắng), `"\t"` (1 tab), `null` (`PATCH`) | TC-017 → TC-019, TC-028, TC-053 |
| TD-13 | Chuỗi 5000 ký tự | firstname = `QA-RB102-<RUN>` + `a` tới đủ **5000** ký tự; lastname = `TC-020-` + `b` tới 5000; additionalneeds = `c` × 5000. Không làm BVA độ dài (không giới hạn, TVP-021 `out`) | TC-020 |
| TD-14 | `additionalneeds` | Hợp lệ: chuỗi (`Breakfast`), **không gửi**, `null` (= không có giá trị: không có khóa, `null` hoặc `""` khi đọc lại). Lỗi (→ 400, BUG-55; hiện 200 lưu nguyên kiểu): `42`, `{"a":1}`, `["x","y"]`, `false` | TC-002, TC-003 |
| TD-15 | Thiếu trường | `POST` (TD-03, 7 biến thể, → 400, hiện 500 BUG-41): bỏ `firstname`; `lastname`; `totalprice`; `depositpaid`; `bookingdates`; `bookingdates.checkin`; `bookingdates.checkout`. `PUT` (TD-04, 8 biến thể, → 400, hiện đúng): 7 biến thể trên + body `{}`. Bỏ `additionalneeds` **không** phải lỗi (TD-14) | TC-004, TC-041 |
| TD-16 | Body đặc biệt | Gửi **nguyên văn** (chuỗi thô, không qua `JSON.stringify` của thư viện): `{}`, `[]` (→ 400, hiện 500 BUG-41); `` (chuỗi rỗng, `Content-Type: application/json` → 400, hiện 500 BUG-58); `{"firstname":` (JSON hỏng → 400 `Bad Request`, đúng); `null` (→ 400 `Bad Request`, đúng) | TC-005, TC-006, TC-023 |
| TD-17 | `Content-Type` của request | Hợp lệ: `application/json`, `text/xml` (body XML TD-19), `application/x-www-form-urlencoded` (body TD-20). Lỗi → **415** (hiện 500, BUG-58): **không gửi** header (kiểm request thật sự không có header: thư viện có thể tự thêm), `text/plain` + body JSON, `application/xml` + body XML. Không khớp body → **400** `Bad Request` (đúng): `application/json` + body XML; `text/xml` + body JSON | TC-023, TC-024 |
| TD-18 | `Accept` | Hợp lệ: `application/json`, `application/xml`, `*/*`, không gửi (→ JSON). Không hỗ trợ → **406**, không tạo / sửa (hiện `text/plain` → 418 `I'm a Teapot`; `application/x-www-form-urlencoded` → 200 `text/html` body `formurlencoded is not a function`; cả hai **vẫn tạo** booking, BUG-49). `GET /booking` với `application/xml` → JSON là **đúng** (Q9 c) | TC-026, TC-028, TC-039, TC-060 → TC-062 |
| TD-19 | Body XML | `<booking><firstname>QA-RB102-<RUN></firstname><lastname><TC></lastname><totalprice>150</totalprice><depositpaid>true</depositpaid><bookingdates><checkin>2031-01-10</checkin><checkout>2031-01-12</checkout></bookingdates><additionalneeds>Breakfast</additionalneeds></booking>` (giá trị trong XML được escape; TC-058 dùng `<depositpaid>false</depositpaid>`). `PATCH` XML chỉ gửi phần tử cần đổi trong `<booking>…</booking>` | TC-023, TC-024, TC-058, TC-059 |
| TD-20 | Body urlencoded | `firstname=QA-RB102-<RUN>&lastname=<TC>&totalprice=150&depositpaid=true&bookingdates%5Bcheckin%5D=2031-01-10&bookingdates%5Bcheckout%5D=2031-01-12&additionalneeds=Breakfast` (mọi giá trị mã hóa URL; `bookingdates[checkin]` dạng ngoặc vuông, đã kiểm lại trên API thật). TC-058: `depositpaid=false`. `PATCH`: chỉ gửi cặp cần đổi (`totalprice=310`) | TC-057, TC-058 |
| TD-21 | Id không tồn tại / sai định dạng | Không tồn tại (đọc: → 404 `Not Found`, đúng; ghi `PUT` / `PATCH` / `DELETE`: → 404, hiện 405 BUG-52): `999999999`, `0`, `-1`, `abc`, `%20` (chỉ `GET`). Trước request ghi, `GET` id đó phải 404, khác thì bỏ biến thể (id có thể đã có thật sau đặt lại). Sai định dạng có tiền tố số (→ 404, BUG-54), **chỉ trên booking X của test**: `X.9`, `Xabc`, `00X`, `X.5` (`GET`); `PUT /00X`, `PATCH /Xabc`, `DELETE /X.9`. **Không** dùng `1.5` / id 1 (booking người khác) | TC-027, TC-063, TC-065 |
| TD-22 | Bộ ngày lọc | Ngày xa, riêng từng TC, chỉ khẳng định booking **của test** có / không có trong kết quả (không đếm tổng). Lọc `checkin=2047-05-20`: P1 `2047-05-19` (D-1, không có), P2 `2047-05-21` (D+1, có), P `2047-05-20` (D, có; BUG-47). Lọc `checkout=2047-08-20`: P `2047-08-20` (D, có), Q1 `2047-08-19` (D-1, không có; BUG-46), Q2 `2047-08-21` (D+1, có; BUG-46). Kết hợp (TC-036): P `2048-03-10` → `2048-03-20`; lọc `checkin=2048-03-09` / `2048-03-11`, `checkout=2048-03-20` (bằng đúng checkout của P nên đúng với cả `≤` hiện tại lẫn `≥` mong đợi) | TC-032 → TC-036 |
| TD-23 | Lọc tên | Khớp chính xác, phân biệt hoa thường, không khớp một phần, không cắt khoảng trắng, nhiều tham số là "và" (Q7). Biến thể → `[]`: firstname viết thường toàn bộ; bỏ ký tự cuối; `%20` ở đầu; `firstname=` rỗng; lastname `tc-030`. Tham số lạ `foo=bar` bị bỏ qua. Tên tiếng Việt có dấu cách: firstname `QA-RB102-<RUN> Nguyễn Văn`, mã hóa `%20` và `+` (dấu tiếng Việt mã hóa UTF-8). Booking firstname khác: `QA-RB102-<RUN>-khac` (khớp tiền tố nhưng không khớp chính xác) | TC-029 → TC-031 |
| TD-24 | Tham số lọc sai | → **400**, không 5xx, không trả toàn bộ (BUG-48). Giá trị sai: `checkin=abc`, `checkin=2040-13-45`, `checkout=abc`, `checkin=08/03/2040`, lặp `firstname=a&firstname=b` (hiện 500 / 200). Object / mảng / toán tử: `firstname[$ne]=x`, `firstname[$eq]=QA-RB102-<RUN>-khong-ton-tai`, `lastname[$gt]=zzzz`, `checkin[$gt]=2046-01-01`, `checkout[$lt]=2046-01-01`, `firstname[]=a`, `firstname[$regex]=.*` (hiện 200, trả toàn bộ). Ngoặc vuông gửi nguyên văn trên URL (không để thư viện tự mã hóa thành dạng khác) | TC-037, TC-038 |
| TD-25 | Phương thức không hỗ trợ | `DELETE /booking`, `PUT /booking` (body TD-04), `PATCH /booking` (`{"totalprice":1}`), `POST /booking/X` (body TD-03). **Không gửi thông tin xác thực** (an toàn cho dữ liệu người khác nếu có hồi quy). → 4xx (hiện 404; 405 kèm `Allow` là cải tiến IMP-13), không 5xx, không đổi dữ liệu | TC-069 |
| TD-26 | Chiến lược dữ liệu dùng chung (RB-101 / RB-102) | Mục "TD-26" dưới | 7 TC: TC-001, TC-021, TC-025, TC-054, TC-055, TC-062, TC-064 |
| TD-27 | So sánh, mốc, khôi phục | Mục "TD-27" dưới | 36 TC: TC-001, TC-002, TC-009, TC-010, TC-015, TC-018 → TC-022, TC-026, TC-040 → TC-053, TC-056 → TC-060, TC-063, TC-064, TC-066 → TC-069 |
| TD-28 | Kiểm "không tạo booking" và kiểm chung phản hồi lỗi | Mục "TD-28" dưới | 28 TC: TC-003 → TC-005, TC-007 → TC-009, TC-011 → TC-014, TC-016, TC-017, TC-023, TC-024, TC-037, TC-038, TC-044 → TC-046, TC-050 → TC-053, TC-055, TC-062, TC-063, TC-065, TC-069 |
| TD-29 | Thứ tự kiểm cho TC có bug đã biết (review-test-impl D1, bài học L18; cùng mẫu RB-101 TD-28) | Mục "Ghi chú cho script-gen" bên dưới: soft phần đang đúng của mọi biến thể → chặn cứng `test.info().errors` → `test.fail()` → soft phần dự kiến FAIL. Phần đang đúng / dự kiến FAIL của từng TC ghi ở cuối cột `notes` | 34 TC: TC-003 → TC-005, TC-007 → TC-009, TC-011 → TC-014, TC-016, TC-017, TC-019, TC-023, TC-033, TC-035, TC-037, TC-038, TC-042, TC-044 → TC-046, TC-048, TC-050 → TC-053, TC-055, TC-058, TC-061 → TC-065 |

## TD-07: ma trận xác thực
Mã đúng khi bị từ chối: **403** `Forbidden` (Q4, quyết định chung RB-101 / RB-102). `<token>` = token mới (TD-05). Sau mỗi kiểu bị từ chối: `GET /booking/X` giống hệt mốc (TD-27).

| # | Thông tin xác thực | Mong đợi `PUT` / `PATCH` / `DELETE` | TC |
|---|---|---|---|
| v01 | Không có | 403 / 403 / 403, giữ nguyên | TC-066 |
| v02 | `Cookie: token=wrongtoken123` | 403, giữ nguyên | TC-066 |
| v03 | `Cookie: token=` (rỗng) | 403, giữ nguyên | TC-066 |
| v04 | `Cookie: token=<token>` | 200 / 200 / 201 | RB-101 TC-019 → TC-021 (đối chứng âm RB-101 TC-022); mọi TC RB-102 có quyền dùng v04 (review-test-impl C1) |
| v05 | `Cookie: TOKEN=<token>` (tên cookie viết hoa) | 403, giữ nguyên | TC-067 |
| v06 | `Cookie: token=<token>; foo=bar` | 200 / 200 / 201 | TC-068 |
| v07 | `Cookie: foo=bar; token=<token>` | 200 / 200 / 201 | TC-068 |
| v08 | `Cookie: <token>` (không có tên) | 403, giữ nguyên | TC-067 |
| v09 | `Cookie: token="<token>"` (nháy kép) | 200 / 200 / 201 | TC-068 |
| v10 | `Cookie: token=<token viết hoa>` (chỉ có nghĩa khi token có chữ cái) | 403, giữ nguyên | TC-067 |
| v11 | `Cookie: token=<token bỏ ký tự cuối>` | 403, giữ nguyên | TC-067 |
| v12 | `Authorization: Bearer <token>` | 403, giữ nguyên | TC-067 |
| v13 | `Authorization: Basic` đúng (TD-06) | 200 / 200 / 201 | TC-068 |
| v14 | `Basic` sai mật khẩu (TD-06) | 403, giữ nguyên | TC-066 |
| v15 | `Authorization: Basic !!!notbase64` | 403, giữ nguyên | TC-067 |
| v16 | `basic` (scheme viết thường) đúng | – | `scope=out` (TVP-036, IMP-08) |
| v17 | `Basic` tên đăng nhập viết hoa chữ đầu (TD-06) | 403, giữ nguyên | TC-067 |
| v18 | `?token=<token>` trên URL | 403, giữ nguyên | TC-067 |
| v19 | Header `token: <token>` | 403, giữ nguyên | TC-067 |
| v20 | Token cũ (lấy trước token mới) | – | `scope=out` (TVP-037, RB-101) |
| v21 | `Authorization: Basic ` (rỗng) | 403, giữ nguyên | TC-067 |
| v22 | Cookie đúng + `Basic` sai | – | `scope=out` (TVP-036, IMP-08) |
| v23 | `Cookie: token=abc123` (token ví dụ của tài liệu) | 403, giữ nguyên | TC-067 |
| v24 | `Cookie: token=<token>x` (thừa 1 ký tự) | 403, giữ nguyên | TC-067 |

## TD-08: `totalprice`
Gửi body bằng **chuỗi JSON thô** cho `-0`, `1e20`, `9007199254740993` (số JavaScript không giữ được). Cột "Hiện tại" chỉ để đối chiếu, **không** là expected.

| Giá trị | Phân vùng | Mong đợi (HITL #1) | Hiện tại | TC |
|---|---|---|---|---|
| `150`, `1`, `99`, `275`, `300`, `310`, `333`, `200` | Hợp lệ (số nguyên) | 200, đọc lại đúng | đúng | TC-001, TC-056… |
| `0`, `-0` | Biên dưới hợp lệ | 200, đọc lại `0` | đúng | TC-010 |
| `1e20` | Rất lớn | 200, đọc lại `1e20` | đúng | TC-010 |
| `9007199254740993` (2^53 + 1) | Chưa có giới hạn trên | Chỉ ghi annotation giá trị đọc lại | `9007199254740992` | TC-010 |
| `99.99`, `0.01`, `10.75` (`PATCH`) | Số lẻ ≤ 2 chữ số | 200, đọc lại đúng giá trị | cắt: `99`, `0`, `10` (BUG-43) | TC-009, TC-050 |
| `0.005` | 3 chữ số lẻ | 400 | 200, lưu `0` (BUG-43) | TC-009, TC-050 |
| `-1`, `-100` | Âm | 400 | 200, lưu nguyên (BUG-57) | TC-011 |
| `"abc"`, `"150"`, `true` | Sai kiểu | 400 | 200, `null` / `150` / `null` ở `POST` và `PUT` (BUG-43) | TC-008, TC-044, TC-050 |
| `null` | Thiếu giá trị | 400 | `POST` 500 (BUG-41); `PUT` **400 giữ nguyên (đúng)**; `PATCH` 200 lưu `null` (BUG-43, Q1 d) | TC-007, TC-041, TC-050 |

## TD-10: ngày không hợp lệ (→ 400, BUG-44)
Đặt ở `checkin` (trừ năm 10000 đặt ở `checkout`); trường còn lại giữ hợp lệ, sau ngày kia ít nhất 1 đêm. `PATCH` gửi **đủ 2 trường con** để tách khỏi BUG-45.

| # | Giá trị | Loại | Hiện tại (đối chiếu) | TC |
|---|---|---|---|---|
| 1 | `15/01/2031` | Sai định dạng (DD/MM) | `0NaN-aN-aN` | TC-013 |
| 2 | `10/01/2031` | Sai định dạng (hiểu nhầm MM/DD) | `2031-10-01` | TC-013 |
| 3 | `abc` | Chữ | `0NaN-aN-aN` | TC-013, TC-052 |
| 4 | `""` | Rỗng | `0NaN-aN-aN` | TC-013 |
| 5 | `2031-02-30` (checkout `2031-03-05`) | Ngày không tồn tại | `2031-03-02` (cuộn) | TC-013, TC-052 |
| 6 | `2046-04-31` (checkout `2046-05-05`) | Ngày không tồn tại | `2046-05-01` | TC-013 |
| 7 | `2031-13-45` | Tháng / ngày ngoài khoảng | `0NaN-aN-aN` | TC-013 |
| 8 | `10000-01-01` (ở checkout) | Năm ngoài 0001 → 9999 | `0000-01-01` | TC-013, TC-052 |
| 9 | `2031-01-10T23:30:00Z` | Có giờ | cắt giờ | TC-014 |
| 10 | `2031-01-10T01:00:00+07:00` | Có múi giờ | `2031-01-09` (lùi 1 ngày) | TC-014 |
| 11 | `1925078400000` (số) | Số mili giây | đổi thành ngày | TC-014 |

## TD-26: chiến lược dữ liệu trên máy chủ dùng chung (chung RB-101 / RB-102, Q12)
1. **Tên theo lần chạy và sổ lần chạy** (TD-02, review-test-impl B1): bộ lọc tên **khớp chính xác** (O-30), nên một truy vấn `firstname=QA-RB102-<RUN>` **không** thấy booking có firstname biến thể. Vì vậy mỗi lần chạy giữ một **sổ** (file tạm `test-results/rb102-ledger-<RUN>.json`, thư mục đã bỏ qua trong git): (a) mọi id tạo được (`POST` thành công, id đọc từ phản hồi lỗi có `bookingid`, id tìm thấy theo tên); (b) mọi giá trị tên đã gửi (firstname biến thể, lastname / additionalneeds mang `QA-RB102-<RUN>`).
2. **Không** `retries` của Playwright (đặt `retries: 0` ở describe / project API, vì cấu hình chung đang `retries: 2` trên CI). Chạy tuần tự, `workers: 1`.
3. **Token**: lấy mới ngay trước nhóm request cần quyền; **không** `beforeAll`.
4. **Phát hiện dữ liệu bị đặt lại**: chỉ khi **đủ 3 dấu hiệu**: (a) booking do chính test tạo trả 404 (hoặc đổi chủ sở hữu); (b) token **mới** gọi `PATCH /booking/999999999` (body `{}`) **không bị 403** (hiện 405; sau khi sửa BUG-52 là 404, dấu hiệu vẫn đúng); (c) thời điểm nằm trong cửa sổ **x0:50 → x1:30** (giờ UTC) quanh lần đặt lại ở phút x1. Đủ 3: làm lại **bước chuẩn bị một lần** trong test (tạo lại booking, token mới), thêm annotation **`env-reset`** (ghi thời điểm, không ghi token). Bị đặt lại **lần 2** trong cùng test: test **fail**. Thiếu dấu hiệu nào: xử lý như kết quả thật (fail).
5. **Request có `bookingid` trong body** (TC-021, TC-064) và mọi request ghi / xóa: `GET` **ngay trước** để kiểm chủ sở hữu **cả 2 id**; không đúng thì **không gửi**, áp mục 4.
6. **Dọn dẹp** (`afterEach`, chạy cả khi test fail): với từng id test đã tạo (và id tìm thấy theo tên của test): `GET /booking/<id>` → chỉ khi đúng chủ sở hữu (TD-02) thì `DELETE` với token mới; chấp nhận **201 / 403 / 404** (token / booking mất do đặt lại). Id có thể có nhiều bản ghi (BUG-51): lặp tới khi `GET` trả 404, tối đa 5 lần. **Quét cuối là teardown** của project API (Playwright project `teardown` hoặc `globalTeardown`, không phải TC; TC-070 cũ đã bỏ): đọc sổ, `GET` từng id trong sổ, rồi truy vấn `GET /booking?firstname=<v>` cho **mọi** firstname trong sổ và `GET /booking?lastname=<v>` cho mọi lastname mang `QA-RB102-<RUN>`; với mỗi id tìm được: `GET`, chỉ `DELETE` khi tên **khớp chính xác** giá trị trong sổ; truy vấn lại phải `[]`. Ghi annotation / log "đã dọn n booking sót" (n > 0 chỉ ghi nhận, lỗi dọn dẹp của TC đã báo ở TC đó) và danh sách test có annotation `env-reset`.
7. **Heroku 503** / máy chủ ngủ: **lỗi môi trường**, không phải bug (ghi annotation, không tính vào defect). Lần gọi đầu đặt thời gian chờ đủ lâu (vd 60 giây).
8. **Lọc**: chỉ khẳng định booking **của test** có / không có trong kết quả; không đếm tổng, không dựa vào thứ tự.

## TD-27: so sánh, mốc, khôi phục
- **So 7 giá trị**: so từng giá trị lá với dữ liệu đã gửi, đúng **kiểu** (`totalprice` number, `depositpaid` boolean, ngày là chuỗi `CCYY-MM-DD` đúng nguyên văn) và không có khóa thừa ở cấp 1 (6 khóa) và trong `bookingdates` (2 khóa). So ở **cả** body trả về **và** `GET` đọc lại (L12).
- **Mốc**: chuỗi body thô của `GET /booking/X` (`Accept: application/json`) ngay trước biến thể. **"Giống hệt mốc"** = status 200 và chuỗi body **byte-identical** (không chỉ so đối tượng sau khi phân tích).
- **Khôi phục mốc** (bug làm booking đổi giữa các biến thể): `PUT /booking/X` (token mới) với đúng 7 giá trị của mốc, rồi `GET` làm mốc mới; booking đã bị xóa thì tạo lại booking mới (cùng lastname) và dùng id mới. Mỗi biến thể vì vậy bắt đầu từ trạng thái riêng, không phụ thuộc kết quả biến thể trước. Biến thể **bị từ chối đúng** (booking giống hệt mốc) thì **không** khôi phục, **không** lấy mốc lại: `GET` so mốc sau biến thể này cũng là bước kiểm chủ sở hữu ngay trước biến thể sau (HITL #2, giảm request ở ma trận quyền).

## TD-28: kiểm "không tạo booking"
- **Quanh từng biến thể** (review-test-impl D2): `S0` = `GET /booking?firstname=QA-RB102-<RUN>` **ngay trước** biến thể, `S1` = cùng truy vấn **ngay sau** biến thể (`S1` của biến thể này là `S0` của biến thể sau). Loại khỏi `S1 \ S0` id mà chính biến thể **dự kiến thành công** trả về (vd TC-009 biến thể 1, 2). Phần còn lại phải rỗng; nếu không, `GET` từng id mới để xác nhận lastname của biến thể, ghi vào thông báo lỗi, ghi vào sổ, rồi dọn. Không quy booking của biến thể trước cho biến thể sau.
- Biến thể không giữ firstname của lần chạy: `GET /booking?lastname=<lastname biến thể>` (lastname có `QA-RB102-<RUN>`, TD-02) phải `[]`.
- Body không mang tên (`{}`, `[]`, TD-16): không kiểm được bằng bộ lọc; nếu phản hồi có `bookingid` thì dọn theo id đó.
- Mã trả về và "không tạo booking" là **2 thông báo `expect.soft` riêng** (lưu ý 6 của `known-issues.md`).
- **Kiểm chung phản hồi lỗi** (HITL #2, review-test-impl D4): với **mọi** phản hồi lỗi mã mới theo HITL #1 (400 / 404 / 406 / 415) chỉ kiểm **mã** + **không 5xx** + body **không có dấu hiệu lỗi nội bộ** (MSG-14); không so body vì định dạng lỗi có thể đổi (IMP-01). Lỗi **đã có và đang đúng** (`Not Found`, `Forbidden`, `Bad Request`) vẫn so **nguyên văn** (TC-006, 024, 027, 041, 066, 067…).

## Ghi chú cho script-gen (TD-29: thứ tự kiểm khi có bug đã biết)
`test.fail()` đánh dấu **cả test** là "phải fail", gọi lúc nào cũng vậy: lỗi `expect.soft` ghi **trước** `test.fail()` vẫn bị tính là "fail như mong đợi". Vì vậy các phần **đang đúng** (không tạo booking khi server trả 500, trường không gửi giữ nguyên, 200 + 6 giá trị còn lại đúng, không 5xx, không lộ lỗi nội bộ…) phải qua một **chặn cứng** trước khi gọi `test.fail()` (review-test-impl D1, bài học L18; cùng mẫu RB-101 TD-28). Thứ tự bắt buộc cho **mọi** TC có "Bug đã biết" ở câu đầu `notes` (34 TC); phần đang đúng và phần dự kiến FAIL của từng TC ghi ở cuối cột `notes` ("Thứ tự TD-29: …"):

1. Gửi **mọi** biến thể, lưu phản hồi (bước chuẩn bị / đối chứng dùng `expect` cứng).
2. `expect.soft` **phần đang đúng** của **mọi** biến thể, để thấy đủ lỗi.
3. Chặn cứng: `expect(test.info().errors, 'phần đang đúng phải đạt trước test.fail').toHaveLength(0)`.
4. `test.fail()`.
5. `expect.soft` **phần dự kiến FAIL** của mọi biến thể.

Không được gọi `test.fail()` trong vòng lặp biến thể. Reviewer bước script-gen kiểm bằng cách cố ý làm hỏng một bước của phần đang đúng: test phải **đỏ** (fail thật), không được thành "fail như mong đợi". Dọn dẹp (TD-26) chạy trong `afterEach` / `finally`, không phụ thuộc kết quả các bước trên.

**Body lỗi không lộ lỗi nội bộ** (MSG-14): kiểm ở bước 2 khi đang đạt (vd body `Internal Server Error` của BUG-41 không có stack trace), ở bước 5 khi đang lộ (BUG-49: `formurlencoded is not a function`).

## Thông báo và header nguyên văn
Kiểm lại trên API thật 2026-11-26. MSG ghi "(hiện trạng)" chỉ để đối chiếu khi đọc lỗi, **không** dùng làm expected. Lỗi mới theo HITL #1 (400 / 404 / 406 / 415) **chỉ kiểm mã**, không kiểm body (định dạng lỗi có thể đổi, IMP-01).

| ID | Nội dung |
|---|---|
| MSG-01 | `Not Found` (body 404, `text/plain`) |
| MSG-02 | `Forbidden` (body 403) |
| MSG-03 | `Created` (body 201 của `DELETE`) |
| MSG-04 | `Bad Request` (body 400 hiện có: `PUT` thiếu trường, JSON hỏng, `Content-Type` không khớp body) |
| MSG-05 | `Method Not Allowed` (hiện trạng 405 của id không tồn tại / đã xóa, BUG-52) |
| MSG-06 | `Internal Server Error` (hiện trạng 500, BUG-41, BUG-48, BUG-58) |
| MSG-07 | `I'm a Teapot` (hiện trạng 418 khi `Accept: text/plain`, BUG-49) |
| MSG-08 | `formurlencoded is not a function` (lỗi nội bộ lộ ra, **không được xuất hiện**, BUG-49) |
| MSG-09 | `0NaN-aN-aN` (ngày hỏng, **không được xuất hiện**, BUG-44, BUG-45) |
| MSG-10 | `application/json; charset=utf-8` (header `Content-Type` phản hồi JSON) |
| MSG-11 | `text/plain; charset=utf-8` (header `Content-Type` phản hồi lỗi / `Created`) |
| MSG-12 | `text/html; charset=utf-8` (hiện trạng `Content-Type` của phản hồi XML, BUG-50; **không** được là giá trị này) |
| MSG-13 | XML: mở đầu `<?xml version='1.0'?>`; `GET` / `PUT`: gốc `<booking>` gồm `<firstname>`, `<lastname>`, `<totalprice>`, `<depositpaid>`, `<bookingdates>` (`<checkin>`, `<checkout>`), `<additionalneeds>`; `POST`: gốc `<created-booking>` gồm `<bookingid>` và `<booking>` như trên |
| MSG-14 | Dấu hiệu lỗi nội bộ, **không được xuất hiện** trong body phản hồi lỗi: chuỗi `is not a function`, `Error:`, dòng bắt đầu bằng `at ` (stack trace), đường dẫn mã nguồn (`/app/…`, `node_modules`, `.js:<số>`) |

## Ước lượng số request mỗi lần chạy
Ước lượng (±15 %), tính cả token, `GET` kiểm chủ sở hữu và dọn dẹp, chưa tính làm lại do `env-reset`. **Mặc định** = mọi TC trừ tag `@full`; **`@full`** = thêm TC-013, TC-067 (HITL #2: chạy theo lịch / trước release). "Hiện tại": các bug đang tạo booking ngoài ý muốn nên phải dọn thêm; "Khi đã sửa": các biến thể lỗi trả 4xx, không phải dọn.

| Nhóm describe | Số TC (trong đó `@full`) | Mặc định: hiện tại | Mặc định: khi đã sửa | Cả `@full`: hiện tại | Cả `@full`: khi đã sửa |
|---|---|---|---|---|---|
| `POST /booking` | 25 (1) | ~245 | ~179 | ~278 | ~189 |
| `GET /booking/:id` | 3 (0) | ~15 | ~15 | ~15 | ~15 |
| `GET /booking` | 11 (0) | ~83 | ~83 | ~83 | ~83 |
| `PUT /booking/:id` | 7 (0) | ~79 | ~73 | ~79 | ~73 |
| `PATCH /booking/:id` | 7 (0) | ~91 | ~80 | ~91 | ~80 |
| `DELETE /booking/:id` | 2 (0) | ~24 | ~24 | ~24 | ~24 |
| Chung | 14 (1) | ~226 | ~210 | ~279 | ~263 |
| Teardown (quét sổ lần chạy, TD-26) | – | ~15 | ~15 | ~15 | ~15 |
| **Tổng** | **69 (2)** | **~778** | **~679** | **~864** | **~742** |

Sau HITL #2 (tag `@full` cho TC-013, TC-067; biến thể bị từ chối đúng chỉ 1 `GET` so mốc; bỏ v04 trùng RB-101 ở TC-068) lần chạy mặc định giảm khoảng 11 % so với ~875 ban đầu (~778), vẫn cao hơn mức "dưới ~300" của lưu ý 7: phần lớn là dọn dẹp (2 request mỗi booking, nhiều booking do bug đang tạo ngoài ý muốn) và các TC nhiều biến thể dữ liệu. Chạy trên bản Restful Booker cục bộ qua `RB_BASE_URL` (reviewer gợi ý, chưa thử) sẽ bỏ được giới hạn này.
