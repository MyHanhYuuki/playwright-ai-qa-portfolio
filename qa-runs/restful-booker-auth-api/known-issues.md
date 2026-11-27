# Bug phát hiện sớm và lưu ý khi test: RB-101 Xác thực và kiểm tra hệ thống (restful-booker-auth-api)

> Các bug và vấn đề **đã thấy trong lúc phân tích (khám phá API ngày 2026-11-26), trước khi chạy test**. Mỗi bug phải được test tương ứng bắt được (fail đúng chỗ). Bug nào không bắt được tức là test sai.
> Bug chỉ chính thức thành **defect** sau khi chạy test và duyệt ở HITL #3 (`defects.md`).
> **Số chính thức BUG-37 → BUG-40** (chung cả repo, sau BUG-36 của SD-103) do orchestrator cấp ở HITL #1; RB-102 dùng tiếp BUG-41 → BUG-59. Số tạm dùng lúc phân tích và cách quy đổi: bảng "Số tạm → số chính thức (HITL #1)" bên dưới.
> **HITL #1 (2026-11-26) đã trả lời cả 11 câu** ("theo đề xuất hết", Q1 là dòng tham chiếu): 4 bug dưới đây **đã xác nhận**; giới hạn thử sai **không phải bug** (IMP-05, đính chính của qa-reviewer); `/ping` trả `201` là hợp đồng tài liệu (IMP-06). Quyết định chi tiết: mục "Quyết định HITL #1".
> **Quy tắc biến thể hay số mới** (`CLAUDE.md` điểm 4): cùng thành phần / cùng chỗ sửa → biến thể (giữ số); khác điểm kiểm → số mới.
> - **Đối chiếu bug cũ của repo**: BUG-01 → BUG-36 đều thuộc web SauceDemo (hệ thống khác, chỗ sửa khác), nên **không** có bug nào của RB-101 là biến thể của bug cũ. Riêng **BUG-02** (SD-101: tự tạo cookie phiên là vào được) đã được kiểm **dạng tương tự** trên API này: token tự tạo (`abc123` của tài liệu), token bị sửa 1 ký tự, viết hoa, rỗng đều bị từ chối và booking không đổi (O-19). **Không** có lỗi kiểu BUG-02 ở Restful Booker.
> - **Tách theo chỗ sửa** (quyết định chung của orchestrator, RB-102 áp dụng cùng quy tắc cho lỗi 500): lỗi ở **lớp đọc body / xử lý `Content-Type`** là bug riêng với lỗi ở **bước kiểm tài khoản**. Vì vậy: BUG-37 = mã HTTP khi kiểm tài khoản thất bại; **BUG-39** = định dạng body không hỗ trợ bị coi như thiếu trường rồi báo `Bad credentials` (sửa BUG-37 thành `401` thì BUG-39 vẫn sai: tài khoản đúng gửi XML sẽ nhận `401 Bad credentials`; expected của BUG-39 là `415`); **BUG-38** = lớp đọc body trả lỗi `text/plain` (cùng lớp với BUG-39 nhưng khác điểm kiểm: định dạng của **phản hồi** lỗi, không phải việc **nhận diện** định dạng gửi lên). **BUG-40** = cấu hình giao thức (HTTP / HTTPS), chỗ sửa ở hạ tầng.

## Số tạm → số chính thức (HITL #1)
| Số tạm | Số chính thức | Mức | Ghi chú |
|---|---|---|---|
| BUG-A1 | **BUG-37** | Medium | Đăng nhập thất bại trả `200` |
| BUG-A2 | **BUG-38** | Low | Phản hồi lỗi `400` / `413` là `text/plain` |
| BUG-A3 | – (bỏ) | – | `/ping` trả `201`: khớp tài liệu, bỏ sau `reviews/review-test-design.md` A2, thành lỗi tài liệu **IMP-06** |
| BUG-A4 | – (không phải bug) | – | Không giới hạn thử sai: không có yêu cầu (Q5), thành **IMP-05** (Medium, rủi ro bảo mật) |
| BUG-A5 | **BUG-39** | Low | Định dạng body không hỗ trợ bị báo `Bad credentials` (trước đó là "BUG-A1 (b) biến thể", tách sau review B1) |
| BUG-A6 | **BUG-40** | Medium | API phục vụ trên HTTP thường (thêm sau review A1) |

## Bug đã biết (chia theo endpoint)

### Chung: cả 2 endpoint
| ID | Endpoint | Mô tả | Bằng chứng | Mức | Viewpoint phải bắt | Trạng thái |
|---|---|---|---|---|---|---|
| BUG-40 | Cả 2 | **API phục vụ trên HTTP thường**: `GET http://…/ping` → `201` `Created`; `POST http://…/auth` → được xử lý bình thường (tài khoản sai: `200` `Bad credentials`; reviewer thử tài khoản đúng: `200` + token). Không chuyển hướng `301` / `308`, không có `Location`, phản hồi HTTPS cũng không có `Strict-Transport-Security`. Tài khoản quản trị gửi đi và token nhận về có thể đi dạng rõ. Expected: `http://` chuyển hướng `308` hoặc bị từ chối, HTTPS có HSTS | O-24 (2/2, test-design chỉ gửi tài khoản sai; reviewer 1/1 với tài khoản đúng) | Medium (High nếu là hệ thống thật) | TVP-036 → **TC-030** (3 bước: `GET http://…/ping`, `POST http://…/auth` tài khoản sai, HSTS): chỉ gửi tài khoản **sai** qua HTTP, dự kiến **FAIL** | Đã xác nhận (HITL #1, Q11: bắt buộc HTTPS) |

### Endpoint: POST /auth
| ID | Endpoint | Mô tả | Bằng chứng | Mức | Viewpoint phải bắt | Trạng thái |
|---|---|---|---|---|---|---|
| BUG-37 | POST /auth | **Đăng nhập thất bại trả `200 OK`**: sai mật khẩu, sai tên, sai hoa thường, có khoảng trắng, rỗng, `null`, sai kiểu (mảng, object, chuỗi kiểu SQL), thiếu `username` / `password`, `{}`, body rỗng, tài khoản trên query string đều trả `HTTP 200`, `Content-Type: application/json; charset=utf-8`, body `{"reason":"Bad credentials"}` (28 byte). Không cấp token (AC-2 đạt) nhưng mã HTTP báo **thành công**: client / công cụ giám sát kiểm `res.ok` coi là đăng nhập được. Expected: `401` (sai tài khoản, chuỗi sai), `400` (thiếu trường / sai kiểu), body giữ nguyên văn | O-08 (2/2), O-09, O-10, O-13 (query string); review kiểm lại 2/2 + SQL, khoảng trắng cuối tên | Medium | TVP-004 → TVP-011, TVP-016 → **TC-004 → TC-011, TC-016** (sai mật khẩu TC-004; sai tên TC-005; hoa thường TC-006; khoảng trắng 4 vị trí TC-007; thiếu trường, `{}`, body rỗng TC-008; rỗng, `null` TC-009; mảng, object, body mảng, SQL TC-010; chuỗi rất dài TC-011; query string TC-016): kiểm **không có `token`** (đạt) **và** mã `401` / `400` (dự kiến **FAIL**) | Đã xác nhận (HITL #1, Q2) |
| BUG-39 | POST /auth | **Định dạng body không hỗ trợ bị báo `Bad credentials`**: tài khoản **đúng** gửi dạng `text/xml`, `application/xml`, `multipart/form-data`, không có `Content-Type`, `text/plain` (body JSON) → `200` `{"reason":"Bad credentials"}`. Lớp đọc body bỏ qua các định dạng này nên coi như thiếu trường; người gọi tưởng sai mật khẩu, trong khi lỗi là định dạng. Expected: `415 Unsupported Media Type` (body JSON). Tách khỏi BUG-37 vì khác chỗ sửa (xem trên) | O-13 (2/2); review 1/1 (XML) | Low | TVP-014 → **TC-014** (3 đại diện `text/xml`, multipart, không `Content-Type`; `application/xml`, `text/plain` không viết TC theo Q12), dự kiến **FAIL** | Đã xác nhận (HITL #1, Q4) |
| BUG-38 | POST /auth | **Phản hồi lỗi không phải JSON**, vi phạm AC-5: JSON hỏng hoặc `Content-Type: application/json` mà body XML → `400`, `Content-Type: text/plain; charset=utf-8`, body `Bad Request`; body ~200 KB → `413`, `text/plain`, body `Payload Too Large`. Mã đúng, chỉ sai định dạng body. Expected: mọi phản hồi của `POST /auth` là JSON | O-14 (2/2), O-15 | Low | TVP-012, TVP-013 → **TC-012** (body ~200 KB), **TC-013** (JSON hỏng, XML với `Content-Type` JSON): kiểm mã 400 / 413 (đạt) **và** `Content-Type` JSON (dự kiến **FAIL**) | Đã xác nhận (HITL #1, Q3) |

## Quyết định HITL #1 (người duyệt, 2026-11-26)
Người dùng trả lời "theo đề xuất hết": mọi đề xuất trong `q-and-a.md` được chấp nhận, riêng Q5 theo đính chính của qa-reviewer khi soát phiếu.

| # | Chủ đề | Quyết định | Câu | Ảnh hưởng |
|---|---|---|---|---|
| 1 | Mã HTTP khi đăng nhập thất bại | Sai tài khoản (chuỗi sai) → **`401`**; thiếu trường / sai kiểu → **`400`**; body JSON giữ nguyên văn `{"reason":"Bad credentials"}` | Q2 | BUG-37 xác nhận; TVP-004 → TVP-011, TVP-016 |
| 2 | Mã khi token sai | **`403` là hợp đồng** (chấp nhận hiện trạng); `401` + `WWW-Authenticate` là cải tiến (quyết định chung, RB-102 Q4) | RB-102 Q4 | TVP-028 expected `403` |
| 3 | Định dạng phản hồi lỗi | **Mọi** phản hồi của `POST /auth` là JSON, kể cả `400` / `413` | Q3 | BUG-38 xác nhận; TVP-012, TVP-013 |
| 4 | Định dạng body | Chính thức JSON; URL-encoded được chấp nhận (ghi tài liệu IMP-06); định dạng không hỗ trợ → **`415`** JSON, không báo `Bad credentials`; query string bị từ chối là đúng | Q4 | BUG-39 xác nhận; TVP-014 → TVP-016 |
| 5 | Sai phương thức | Tối thiểu **4xx**, không token / không `Created`, không `5xx`; `405` + `Allow` là cải tiến IMP-01 | Q8 | TVP-018, TVP-033 (hiện trạng `404` đạt) |
| 6 | HTTPS | **Bắt buộc HTTPS**: `http://` chuyển hướng `308` hoặc bị từ chối, HTTPS có HSTS | Q11 | BUG-40 xác nhận; TVP-036 |
| 7 | Giới hạn thử sai | **Không có yêu cầu** → không phải bug, **IMP-05 (Medium, rủi ro bảo mật)**, không kiểm tự động | Q5 | TVP-019 `out` |
| 8 | Thời hạn token và reset | Token hợp lệ trong cùng chu kỳ reset ~10 phút; token cũ dùng được khi đã cấp token mới là đúng; hết hạn sau reset không kiểm tự động (IMP-04); **chiến lược reset 3 dấu hiệu** (mục "Lưu ý cho bước sau") | Q6 | TVP-002, TVP-022, TVP-026, TVP-035, mọi TC có booking |
| 9 | Ngân sách đăng nhập thất bại | **≤ 30 lần / lần chạy**, gọi tuần tự, nhóm sai tài khoản không chạy lặp (`test:stability` loại nhóm này), không retry | Q12 | TVP-004 → TVP-016, TVP-036; TVP-014 3 đại diện, TVP-038 `out` |
| 10 | Phân chia RB-101 / RB-102 | RB-101: cấp token, vòng đời (TVP-026), AC-3 dương tính, đối chứng TVP-028 (`abc123` + 1 token bị sửa). RB-102: ma trận quyền đầy đủ + Basic | Q7 | TVP-026, TVP-028, TVP-029 `out` |
| 11 | Mã của `GET /ping` | **`201` là hợp đồng tài liệu**; tiêu đề `Success 200` là lỗi tài liệu (IMP-06). Quyết định chung với RB-102 Q6 (`DELETE` trả `201`) | Q1 (tham chiếu) | TVP-030 expected `201` |
| 12 | Header bảo mật còn lại, trường thừa | `Cache-Control: no-store` thiếu là cải tiến IMP-02 (TVP-037 chỉ annotation); header khác, CORS ngoài phạm vi. Trường thừa bị bỏ qua là đúng; khóa trùng là cải tiến IMP-08 | Q9, Q10 | TVP-003, TVP-020, TVP-037 |

## Không phải bug (đã kiểm, ghi để bước sau không báo nhầm)
| Điểm | Hành vi | Bằng chứng | Lý do |
|---|---|---|---|
| `GET /ping` trả `201 Created` (lúc phân tích ghi số tạm BUG-A3, đã bỏ) | `201`, `text/plain`, body `Created` | O-01; review A2 | **Hợp đồng tài liệu**: tài liệu ghi 2 lần `201` (dòng `Default HTTP 201 response` và ví dụ `HTTP/1.1 201 Created`); tiêu đề `Success 200` là mâu thuẫn trình bày của tài liệu → cải tiến tài liệu IMP-06. Quy tắc chung với RB-102 (`DELETE` trả `201`, RB-102 Q6). HITL #1 (Q1) |
| Không giới hạn số lần thử sai (lúc phân tích ghi số tạm BUG-A4) | 20 lần đăng nhập thất bại liên tiếp trong ~10 giây không bị `429`, không bị khóa, thời gian phản hồi không tăng; ngay sau đó đăng nhập đúng vẫn được token | O-11 | HITL #1 (Q5): **không có yêu cầu** nên không phải bug; ghi **IMP-05 (Medium, rủi ro bảo mật**: tài khoản quản trị dò được mật khẩu không giới hạn; mật khẩu mặc định đã công khai nên tác động thực tế thấp). Không kiểm tự động (TVP-019 `out`) |
| Token cũ vẫn dùng được khi đã cấp token mới | Token đầu tiên vẫn `PATCH` / `DELETE` được sau hơn 10 lần cấp token mới | O-05; review kiểm lại | Ticket không đòi một phiên duy nhất; HITL #1 (Q6) xác nhận là đúng |
| Token mất hiệu lực khi API reset | API tự reset dữ liệu và xóa mọi token **khoảng 10 phút một lần, đúng phút x1 của đồng hồ UTC** (test-design: ~10:51, ~11:01, ~11:11; reviewer: 12:11); token đang hợp lệ bỗng bị từ chối, booking vừa tạo bị `404` | O-21 | Hành vi của API luyện tập (dữ liệu và token chỉ lưu trong bộ nhớ). Ảnh hưởng test: chiến lược reset bên dưới (Q6) |
| Token sai bị từ chối bằng `403` | `403` `Forbidden` `text/plain` | O-19 | HITL #1 (RB-102 Q4): `403` là hợp đồng, `401` là cải tiến |
| `DELETE /booking/:id` trả `201 Created`; xóa lần 2 trả `405` | `201` `Created` `text/plain`; lần 2 `405 Method Not Allowed` | O-18, O-23 | Thuộc RB-102 (hợp đồng `201` theo tài liệu, RB-102 Q6; `405` cho id không tồn tại là BUG-52 của RB-102); chỉ ghi tham khảo |
| `PATCH` booking không tồn tại với token đúng trả `405`, token sai bị từ chối (`403`) | Kiểm quyền **trước** khi tìm booking | O-22 | Thuộc RB-102 (`405` là BUG-52). Dùng làm **cách kiểm token còn hợp lệ mà không đụng booking của người khác** (dấu hiệu "không bị `403`", không dựa vào `405`) |
| Nhận body URL-encoded | Cấp token, token dùng được | O-12 | HITL #1 (Q4): chấp nhận, ghi tài liệu IMP-06 |

## Lưu ý cho bước sau (test-impl, script-gen)
- **An toàn trên API công khai dùng chung**: chỉ sửa / xóa booking **do test tự tạo** (firstname `QA-RB101…`), xóa ngay trong test (kể cả khi test fail: dọn trong `afterEach` / `finally`). Không load test.
- **Ngân sách đăng nhập thất bại** (HITL #1, Q12): **≤ 30 lần / lần chạy**, gọi **tuần tự** (không song song), nhóm test sai tài khoản **không** chạy lặp (`test:stability` dùng `-g` / `--grep-invert` loại nhóm này) và không retry. Viewpoint `in` cần khoảng **30 lần**: 27 lần qua bước kiểm tài khoản (TVP-004 → TVP-011, TVP-014 3 đại diện, TVP-016, TVP-036) + 3 lần bị lớp đọc body chặn (TVP-012, TVP-013).
- **Không gửi mật khẩu thật qua HTTP thường**: TVP-036 chỉ dùng tài khoản sai.
- **Mật khẩu**: mật khẩu quản trị từ biến môi trường (mặc định: giá trị công khai trong tài liệu), không ghi trong TC / code. Không ghi token thật vào tài liệu, log, annotation (chỉ ghi độ dài / định dạng).
- **Chiến lược reset của API** (đoạn dùng chung với RB-102, orchestrator chốt 2026-11-26, HITL #1 Q6):
  - **Không** dùng `retries` của Playwright cho spec của feature này.
  - **Không** lấy token trong `beforeAll`; mỗi test tự lấy token mới ngay trước khi dùng, khoảng "cấp token → dùng" chỉ vài giây.
  - Khi một bước dùng token vừa cấp bị từ chối (hoặc booking vừa tự tạo bị `404`), test kiểm **đủ 3 dấu hiệu** của lần reset: (1) booking của chính test trả `404`; (2) một token **mới** dùng cho `PATCH /booking/999999999` **không bị `403`** (token mới hợp lệ, tức API không chặn) (không dựa vào mã `405` hiện tại: đó là BUG-52 của RB-102, sửa thành `404` thì dấu hiệu vẫn đúng; review RB-102 lượt 2 R1); (3) thời điểm lỗi nằm trong cửa sổ **x0:50 → x1:30 UTC** quanh lần reset ở phút x1.
  - Đủ 3 dấu hiệu → làm lại phần chuẩn bị **một lần ngay trong test** (token mới + booking mới) và gắn annotation `env-reset`. Thiếu một dấu hiệu, hoặc gặp reset lần 2 trong cùng test → **fail** như lỗi thật. Executor báo số test có `env-reset` (không tính là "đạt sạch").
  - Bước dọn dẹp chấp nhận `403` / `404` (booking đã bị reset xóa), ghi annotation, không làm test fail vì bước dọn. Trước khi xóa, `GET` id và **chỉ xóa khi `firstname` là của test** (sau reset, id cũ có thể đã thuộc người khác), như RB-102.
  - Heroku trả `503` / ứng dụng đang ngủ (lần gọi đầu chậm, lỗi `H1x`) là **lỗi môi trường**, không phải bug.
- **Mã từ chối khi token sai**: **`403`** (HITL #1, RB-102 Q4, một quyết định cho cả 2 feature); TVP-028 đọc expected từ dữ liệu dùng chung với RB-102, không viết số cứng trong test.
- **AC-2 tách hai bước kiểm**: (1) body **không có** `token` (AC-2, hiện đạt), (2) mã `401` / `400` (BUG-37, dự kiến FAIL). Một TC dương tính cho (1) không được dùng `test.fail()` chung với (2); bài học L4, L15: kiểm từng bước riêng để biết bước nào fail. **Thứ tự kiểm bắt buộc** (review-test-impl D1, `test-data.md` TD-28 "Ghi chú cho script-gen"): gửi mọi biến thể → `expect.soft` (1) và các bước đang đạt của mọi biến thể → chặn cứng `expect(test.info().errors).toHaveLength(0)` → `test.fail()` → `expect.soft` (2). `test.fail()` đánh dấu cả test, nên thiếu bước chặn cứng thì lỗi (1) bị tính là "fail như mong đợi".
- **Đối chứng** (bài học L15): TC sai tài khoản phải có bước đối chứng đăng nhập đúng trong cùng điều kiện (cùng header) trả `token`, để chứng minh `Bad credentials` là do dữ liệu sai chứ không do định dạng. TC dương tính AC-3 (TVP-023 → TVP-025) có đối chứng âm TVP-028 trên cùng booking, cùng method.
- **Oracle token** (AC-1): chỉ assert "chuỗi không rỗng" và "đôi một khác nhau"; độ dài / bộ ký tự chỉ ghi annotation (review B5).
- `Content-Type` phản hồi so theo **media type** (`application/json`), không so cả chuỗi `; charset=utf-8`.

## Quyết định HITL #2 (người duyệt, 2026-11-27)
Người duyệt chọn **theo đề xuất của qa-reviewer** cho cả 11 điểm (phiếu đã qua qa-reviewer soát trước khi gửi).
| # | Quyết định | Kết luận |
|---|---|---|
| 1 | Bộ test case | ✅ Duyệt: RB-101 30 TC, RB-102 69 TC, tất cả `automatable`, trạng thái `approved`. TC bug theo mẫu 5 bước (L18) |
| 2 | Tên / mật khẩu rỗng | **400** (rỗng = thiếu), không phải 401 |
| 3 | Dọn dẹp, phân chia | RB-102 TC-070 → teardown có sổ id + tên của lần chạy; RB-102 TC-068 bỏ biến thể token thường, trỏ RB-101 TC-019 → 021 |
| 4 | Biến môi trường | `RB_ADMIN_USERNAME`, `RB_ADMIN_PASSWORD`, `RB_BASE_URL` (dùng chung 2 feature; CI: GitHub Secrets). **Bổ sung 2026-11-27**: người dùng chọn ghi 3 biến vào bảng biến môi trường của `README.md` thay vì `.env.example` (máy này chặn sửa file `.env*`) |
| 5 | RB-101 TC-016 (mật khẩu trên URL) | Gửi bằng `fetch` ngoài `APIRequestContext`, không ghi URL vào annotation / báo cáo, quét mật khẩu trong `run-results/`, `evidence/` trước mỗi commit |
| 6 | RB-101 TC-030 (HTTP) | Đạt khi GET 301/308, POST 307/308 với `Location` = https cùng host + đường dẫn, hoặc bị từ chối (lỗi kết nối, 426, 4xx không đến từ khâu kiểm tài khoản) |
| 7 | Mã lỗi mới (400/404/406/413/415) | Kiểm mã + không 5xx + không lộ lỗi nội bộ; không kiểm câu chữ (RB-101 IMP-10, RB-102 IMP-01). Riêng `/auth` (RB-101) kiểm thêm body là JSON. Lỗi đang có và đúng vẫn so nguyên văn |
| 8 | RB-102 TC-069 (phương thức không hỗ trợ) | Gửi **không** token; 404 / 405 là đạt, 403 là cảnh báo cần xem tay |
| 9 | `retries` | `0` riêng cho project API; web giữ nguyên (CI 2) |
| 10 | Giá `2^53 + 1` | Chỉ annotation, không kiểm |
| 11 | Chạy ở đâu | Không chạy đủ bộ API theo mỗi push / PR. Job CI web chỉ chạy project web. Job CI riêng cho API: chạy tay + theo lịch hằng tuần (đủ bộ, kèm `@full`, nhóm `@bad-login` 1 lần), giờ cron tránh cửa sổ x0:50 → x1:30 UTC. PR: chỉ API `@smoke` ở chế độ không chặn (continue-on-error). Bài 11: xem chạy Restful Booker cục bộ trong CI qua `RB_BASE_URL`. Ước lượng: RB-101 ~140 request / lần (≤ 30 đăng nhập sai, `@bad-login` 1 lần / buổi); RB-102 ~778 mặc định (~679 khi đã sửa bug), `@full` thêm ~86 |
