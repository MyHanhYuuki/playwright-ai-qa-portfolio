# Evidence: restful-booker-booking-api

> Mục lục dựng lại bằng `npm run test:evidence -- restful-booker-booking-api --index-only` lúc 2026-11-28T06:02:03.111Z từ evidence có sẵn (không chạy test). Thời điểm chạy của từng test case ghi trong README của nó.
> Feature API: mỗi test case có README liệt kê từng bước, request / response (method, đường dẫn, mã, header chính, trích body) và dòng **"Cần xem"**. Không có ảnh / video.
> Token, cookie, Authorization, mật khẩu đã được che (`***`).

## Bug (theo ticket)
| Ticket_BUG | Endpoint của TC | Nội dung | Thư mục |
|---|---|---|---|
| [id_bug_41]_BUG-41 | POST /booking | TC-004 | [bugs/[id_bug_41]_BUG-41/TC-004](<bugs/[id_bug_41]_BUG-41/TC-004/README.md>) |
| [id_bug_41]_BUG-41 | POST /booking | TC-005 | [bugs/[id_bug_41]_BUG-41/TC-005](<bugs/[id_bug_41]_BUG-41/TC-005/README.md>) |
| [id_bug_41]_BUG-41 | POST /booking | TC-007 | [bugs/[id_bug_41]_BUG-41/TC-007](<bugs/[id_bug_41]_BUG-41/TC-007/README.md>) |
| [id_bug_42]_BUG-42 | POST /booking | TC-012 | [bugs/[id_bug_42]_BUG-42/TC-012](<bugs/[id_bug_42]_BUG-42/TC-012/README.md>) |
| [id_bug_42]_BUG-42 | PUT /booking/:id → GET /booking/:id | TC-045 | [bugs/[id_bug_42]_BUG-42/TC-045](<bugs/[id_bug_42]_BUG-42/TC-045/README.md>) |
| [id_bug_42]_BUG-42 | PATCH /booking/:id → GET /booking/:id | TC-051 | [bugs/[id_bug_42]_BUG-42/TC-051](<bugs/[id_bug_42]_BUG-42/TC-051/README.md>) |
| [id_bug_42]_BUG-42 | POST /booking + PUT /booking/:id + PATCH /booking/:id | TC-058 | [bugs/[id_bug_42]_BUG-42/TC-058](<bugs/[id_bug_42]_BUG-42/TC-058/README.md>) |
| [id_bug_43]_BUG-43 | POST /booking | TC-008 | [bugs/[id_bug_43]_BUG-43/TC-008](<bugs/[id_bug_43]_BUG-43/TC-008/README.md>) |
| [id_bug_43]_BUG-43 | POST /booking → GET /booking/:id | TC-009 | [bugs/[id_bug_43]_BUG-43/TC-009](<bugs/[id_bug_43]_BUG-43/TC-009/README.md>) |
| [id_bug_43]_BUG-43 | PUT /booking/:id → GET /booking/:id | TC-044 | [bugs/[id_bug_43]_BUG-43/TC-044](<bugs/[id_bug_43]_BUG-43/TC-044/README.md>) |
| [id_bug_43]_BUG-43 | PATCH /booking/:id → GET /booking/:id | TC-050 | [bugs/[id_bug_43]_BUG-43/TC-050](<bugs/[id_bug_43]_BUG-43/TC-050/README.md>) |
| [id_bug_44]_BUG-44 | POST /booking | TC-013 | [bugs/[id_bug_44]_BUG-44/TC-013](<bugs/[id_bug_44]_BUG-44/TC-013/README.md>) |
| [id_bug_44]_BUG-44 | POST /booking | TC-014 | [bugs/[id_bug_44]_BUG-44/TC-014](<bugs/[id_bug_44]_BUG-44/TC-014/README.md>) |
| [id_bug_44]_BUG-44 | PATCH /booking/:id → GET /booking/:id | TC-052 | [bugs/[id_bug_44]_BUG-44/TC-052](<bugs/[id_bug_44]_BUG-44/TC-052/README.md>) |
| [id_bug_45]_BUG-45 | PATCH /booking/:id → GET /booking/:id | TC-048 | [bugs/[id_bug_45]_BUG-45/TC-048](<bugs/[id_bug_45]_BUG-45/TC-048/README.md>) |
| [id_bug_46]_BUG-46 | GET /booking | TC-035 | [bugs/[id_bug_46]_BUG-46/TC-035](<bugs/[id_bug_46]_BUG-46/TC-035/README.md>) |
| [id_bug_47]_BUG-47 | GET /booking | TC-033 | [bugs/[id_bug_47]_BUG-47/TC-033](<bugs/[id_bug_47]_BUG-47/TC-033/README.md>) |
| [id_bug_48]_BUG-48 | GET /booking | TC-037 | [bugs/[id_bug_48]_BUG-48/TC-037](<bugs/[id_bug_48]_BUG-48/TC-037/README.md>) |
| [id_bug_48]_BUG-48 | GET /booking | TC-038 | [bugs/[id_bug_48]_BUG-48/TC-038](<bugs/[id_bug_48]_BUG-48/TC-038/README.md>) |
| [id_bug_49]_BUG-49 | POST /booking + GET /booking/:id | TC-062 | [bugs/[id_bug_49]_BUG-49/TC-062](<bugs/[id_bug_49]_BUG-49/TC-062/README.md>) |
| [id_bug_50]_BUG-50 | GET /booking/:id + POST /booking + PUT /booking/:id | TC-061 | [bugs/[id_bug_50]_BUG-50/TC-061](<bugs/[id_bug_50]_BUG-50/TC-061/README.md>) |
| [id_bug_51]_BUG-51 | PUT /booking/:id + PATCH /booking/:id | TC-064 | [bugs/[id_bug_51]_BUG-51/TC-064](<bugs/[id_bug_51]_BUG-51/TC-064/README.md>) |
| [id_bug_52]_BUG-52 | DELETE /booking/:id → PUT /booking/:id + PATCH /booking/:id | TC-055 | [bugs/[id_bug_52]_BUG-52/TC-055](<bugs/[id_bug_52]_BUG-52/TC-055/README.md>) |
| [id_bug_52]_BUG-52 | PUT /booking/:id + PATCH /booking/:id + DELETE /booking/:id | TC-065 | [bugs/[id_bug_52]_BUG-52/TC-065](<bugs/[id_bug_52]_BUG-52/TC-065/README.md>) |
| [id_bug_53]_BUG-53 | PUT /booking/:id → GET /booking/:id | TC-042 | [bugs/[id_bug_53]_BUG-53/TC-042](<bugs/[id_bug_53]_BUG-53/TC-042/README.md>) |
| [id_bug_54]_BUG-54 | GET /booking/:id + PUT /booking/:id + PATCH /booking/:id + DELETE /booking/:id | TC-063 | [bugs/[id_bug_54]_BUG-54/TC-063](<bugs/[id_bug_54]_BUG-54/TC-063/README.md>) |
| [id_bug_55]_BUG-55 | POST /booking | TC-003 | [bugs/[id_bug_55]_BUG-55/TC-003](<bugs/[id_bug_55]_BUG-55/TC-003/README.md>) |
| [id_bug_55]_BUG-55 | POST /booking | TC-017 | [bugs/[id_bug_55]_BUG-55/TC-017](<bugs/[id_bug_55]_BUG-55/TC-017/README.md>) |
| [id_bug_55]_BUG-55 | PATCH /booking/:id → GET /booking/:id | TC-053 | [bugs/[id_bug_55]_BUG-55/TC-053](<bugs/[id_bug_55]_BUG-55/TC-053/README.md>) |
| [id_bug_56]_BUG-56 | POST /booking | TC-016 | [bugs/[id_bug_56]_BUG-56/TC-016](<bugs/[id_bug_56]_BUG-56/TC-016/README.md>) |
| [id_bug_56]_BUG-56 | PUT /booking/:id → GET /booking/:id | TC-046 | [bugs/[id_bug_56]_BUG-56/TC-046](<bugs/[id_bug_56]_BUG-56/TC-046/README.md>) |
| [id_bug_57]_BUG-57 | POST /booking | TC-011 | [bugs/[id_bug_57]_BUG-57/TC-011](<bugs/[id_bug_57]_BUG-57/TC-011/README.md>) |
| [id_bug_58]_BUG-58 | POST /booking | TC-023 | [bugs/[id_bug_58]_BUG-58/TC-023](<bugs/[id_bug_58]_BUG-58/TC-023/README.md>) |
| [id_bug_59]_BUG-59 | POST /booking → GET /booking/:id | TC-019 | [bugs/[id_bug_59]_BUG-59/TC-019](<bugs/[id_bug_59]_BUG-59/TC-019/README.md>) |
| [id_bug_60]_BUG-60 | GET /booking/:id | TC-026 | [bugs/[id_bug_60]_BUG-60/TC-026](<bugs/[id_bug_60]_BUG-60/TC-026/README.md>) |

## Tất cả test case

### Endpoint 1: POST /booking
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-001 Happy path: POST booking hợp lệ (JSON) trả 200 và đọc lại giống từng trường | POST /booking → GET /booking/:id | ✅ Passed | [all-cases/TC-001](all-cases/TC-001/README.md) |
| TC-002 additionalneeds là tùy chọn: không gửi hoặc gửi null vẫn tạo được, 6 giá trị còn lại đúng | POST /booking → GET /booking/:id | ✅ Passed | [all-cases/TC-002](all-cases/TC-002/README.md) |
| TC-003 additionalneeds khác chuỗi (số, object, mảng, boolean) bị từ chối 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-55 | [all-cases/TC-003](all-cases/TC-003/README.md) |
| TC-004 Thiếu từng trường bắt buộc (7 biến thể): POST trả 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-41 | [all-cases/TC-004](all-cases/TC-004/README.md) |
| TC-005 Body {} và [] (JSON hợp lệ nhưng sai cấu trúc): POST trả 400 | POST /booking | ❌ Failed · Bug: BUG-41 | [all-cases/TC-005](all-cases/TC-005/README.md) |
| TC-006 Body JSON hỏng và body null: POST trả 400 'Bad Request' | POST /booking | ✅ Passed | [all-cases/TC-006](all-cases/TC-006/README.md) |
| TC-007 null / sai kiểu cấu trúc ở trường bắt buộc: POST trả 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-41 | [all-cases/TC-007](all-cases/TC-007/README.md) |
| TC-008 totalprice sai kiểu (chuỗi chữ, chuỗi số, boolean) ở POST: 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-43 | [all-cases/TC-008](all-cases/TC-008/README.md) |
| TC-009 totalprice số lẻ: tối đa 2 chữ số lẻ lưu đúng, 3 chữ số lẻ bị từ chối | POST /booking → GET /booking/:id | ❌ Failed · Bug: BUG-43 | [all-cases/TC-009](all-cases/TC-009/README.md) |
| TC-010 Biên totalprice hợp lệ (0, 1, -0, 1e20) được nhận và đọc lại đúng; 2^53 + 1 chỉ ghi nhận | POST /booking → GET /booking/:id | ✅ Passed | [all-cases/TC-010](all-cases/TC-010/README.md) |
| TC-011 totalprice âm bị từ chối 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-57 | [all-cases/TC-011](all-cases/TC-011/README.md) |
| TC-012 depositpaid JSON không phải boolean ("false", "true", "abc", 0, 1) ở POST: 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-42 | [all-cases/TC-012](all-cases/TC-012/README.md) |
| TC-013 Ngày sai định dạng / không tồn tại / năm 10000 ở POST: 400, không lưu 0NaN-aN-aN hay ngày bị cuộn | POST /booking | ❌ Failed · Bug: BUG-44 | [all-cases/TC-013](all-cases/TC-013/README.md) |
| TC-014 Ngày có giờ / múi giờ / số mili giây ở POST: 400, không lưu ngày bị lệch | POST /booking | ❌ Failed · Bug: BUG-44 | [all-cases/TC-014](all-cases/TC-014/README.md) |
| TC-015 Ngày hợp lệ đặc biệt (29/02 năm nhuận, năm 0001, năm 9999, quá khứ) được nhận và đọc lại đúng | POST /booking → GET /booking/:id | ✅ Passed | [all-cases/TC-015](all-cases/TC-015/README.md) |
| TC-016 checkout trước hoặc bằng checkin ở POST: 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-56 | [all-cases/TC-016](all-cases/TC-016/README.md) |
| TC-017 firstname / lastname rỗng hoặc chỉ khoảng trắng ở POST: 400, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-55 | [all-cases/TC-017](all-cases/TC-017/README.md) |
| TC-018 Chuỗi hợp lệ đa dạng (tiếng Việt, emoji, HTML, nháy, dấu \) lưu và đọc lại nguyên văn | POST /booking → GET /booking/:id | ✅ Passed | [all-cases/TC-018](all-cases/TC-018/README.md) |
| TC-019 Khoảng trắng đầu cuối được lưu nguyên văn (server không cắt) | POST /booking → GET /booking/:id | ❌ Failed · Bug: BUG-59 | [all-cases/TC-019](all-cases/TC-019/README.md) |
| TC-020 Chuỗi 5000 ký tự ở firstname, lastname, additionalneeds lưu và đọc lại đủ | POST /booking → GET /booking/:id | ✅ Passed | [all-cases/TC-020](all-cases/TC-020/README.md) |
| TC-021 Trường thừa (extra, roomnumber, bookingid) ở POST bị bỏ qua, id do server cấp | POST /booking → GET /booking/:id | ✅ Passed | [all-cases/TC-021](all-cases/TC-021/README.md) |
| TC-022 POST 2 lần cùng body tạo 2 booking khác id, cả 2 đọc lại đúng | POST /booking → GET /booking | ✅ Passed | [all-cases/TC-022](all-cases/TC-022/README.md) |
| TC-023 Thiếu / sai Content-Type (415) và body rỗng (400): không 5xx, không tạo booking | POST /booking | ❌ Failed · Bug: BUG-58 | [all-cases/TC-023](all-cases/TC-023/README.md) |
| TC-024 Content-Type không khớp body: 400 'Bad Request', không tạo booking | POST /booking | ✅ Passed | [all-cases/TC-024](all-cases/TC-024/README.md) |
| TC-025 GET /booking không lọc: 200, mảng [{bookingid}] có id vừa tạo | POST /booking → GET /booking | ✅ Passed | [all-cases/TC-025](all-cases/TC-025/README.md) |

### Endpoint 2: GET /booking/:id
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-027 GET /booking/:id với id không tồn tại (rất lớn, 0, âm, chữ, khoảng trắng) trả 404 'Not Found' | GET /booking/:id | ✅ Passed | [all-cases/TC-027](all-cases/TC-027/README.md) |
| TC-028 Accept application/xml với ký tự đặc biệt của XML: escape đúng, đọc ra đúng chuỗi đã gửi | GET /booking/:id | ✅ Passed | [all-cases/TC-028](all-cases/TC-028/README.md) |

### Endpoint 3: GET /booking
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-029 Lọc firstname, lastname khớp chính xác, kết hợp là 'và', tham số lạ bị bỏ qua | GET /booking | ✅ Passed | [all-cases/TC-029](all-cases/TC-029/README.md) |
| TC-030 Lọc tên khác hoa thường, khớp một phần, có khoảng trắng đầu, giá trị rỗng: trả [] | GET /booking | ✅ Passed | [all-cases/TC-030](all-cases/TC-030/README.md) |
| TC-031 Lọc tên tiếng Việt có dấu và dấu cách (mã hóa %20 và +): tìm được booking | GET /booking | ✅ Passed | [all-cases/TC-031](all-cases/TC-031/README.md) |
| TC-032 Lọc checkin=D: có booking checkin D+1, không có booking checkin D-1 | GET /booking | ✅ Passed | [all-cases/TC-032](all-cases/TC-032/README.md) |
| TC-033 Lọc checkin=D trả cả booking có checkin bằng đúng D (≥) | GET /booking | ❌ Failed · Bug: BUG-47 | [all-cases/TC-033](all-cases/TC-033/README.md) |
| TC-034 Lọc checkout=D trả booking có checkout bằng đúng D | GET /booking | ✅ Passed | [all-cases/TC-034](all-cases/TC-034/README.md) |
| TC-035 Lọc checkout=D: có booking checkout D+1, không có booking checkout D-1 (≥) | GET /booking | ❌ Failed · Bug: BUG-46 | [all-cases/TC-035](all-cases/TC-035/README.md) |
| TC-036 Lọc kết hợp tên + ngày và checkin + checkout là điều kiện 'và' | GET /booking | ✅ Passed | [all-cases/TC-036](all-cases/TC-036/README.md) |
| TC-037 Giá trị lọc sai (ngày sai định dạng, DD/MM/YYYY, lặp tham số): 400, không 5xx | GET /booking | ❌ Failed · Bug: BUG-48 | [all-cases/TC-037](all-cases/TC-037/README.md) |
| TC-038 Tham số lọc dạng object / mảng / toán tử: 400, không trả toàn bộ danh sách | GET /booking | ❌ Failed · Bug: BUG-48 | [all-cases/TC-038](all-cases/TC-038/README.md) |
| TC-039 GET /booking với Accept application/xml vẫn trả JSON | GET /booking | ✅ Passed | [all-cases/TC-039](all-cases/TC-039/README.md) |

### Endpoint 4: PUT /booking/:id
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-040 PUT hợp lệ (Cookie token) thay toàn bộ booking, GET thấy đúng 7 giá trị mới | PUT /booking/:id → GET /booking/:id | ✅ Passed | [all-cases/TC-040](all-cases/TC-040/README.md) |
| TC-041 PUT thiếu trường bắt buộc, body {} hoặc totalprice null: 400, booking giữ nguyên | PUT /booking/:id → GET /booking/:id | ✅ Passed | [all-cases/TC-041](all-cases/TC-041/README.md) |
| TC-042 PUT không gửi additionalneeds thì xóa giá trị cũ | PUT /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-53 | [all-cases/TC-042](all-cases/TC-042/README.md) |
| TC-043 PUT 2 lần cùng body cho kết quả như 1 lần | PUT /booking/:id → GET /booking/:id | ✅ Passed | [all-cases/TC-043](all-cases/TC-043/README.md) |
| TC-044 PUT totalprice sai kiểu (chuỗi chữ, chuỗi số, boolean): 400, booking giữ nguyên | PUT /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-43 | [all-cases/TC-044](all-cases/TC-044/README.md) |
| TC-045 PUT depositpaid không phải boolean ("false", 0): 400, booking giữ nguyên | PUT /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-42 | [all-cases/TC-045](all-cases/TC-045/README.md) |
| TC-046 PUT checkout trước hoặc bằng checkin: 400, booking giữ nguyên | PUT /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-56 | [all-cases/TC-046](all-cases/TC-046/README.md) |

### Endpoint 5: PATCH /booking/:id
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-047 PATCH một trường cấp 1 chỉ đổi trường đó, 6 giá trị còn lại giữ nguyên | PATCH /booking/:id → GET /booking/:id | ✅ Passed | [all-cases/TC-047](all-cases/TC-047/README.md) |
| TC-048 PATCH một trường con của bookingdates giữ nguyên trường con còn lại | PATCH /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-45 | [all-cases/TC-048](all-cases/TC-048/README.md) |
| TC-049 PATCH {} và PATCH chỉ có trường lạ: 200, booking không đổi | PATCH /booking/:id → GET /booking/:id | ✅ Passed | [all-cases/TC-049](all-cases/TC-049/README.md) |
| TC-050 PATCH totalprice: sai kiểu / null / 3 chữ số lẻ → 400; 2 chữ số lẻ (10.75) lưu đúng | PATCH /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-43 | [all-cases/TC-050](all-cases/TC-050/README.md) |
| TC-051 PATCH depositpaid không phải boolean ("false", 0): 400, booking giữ nguyên | PATCH /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-42 | [all-cases/TC-051](all-cases/TC-051/README.md) |
| TC-052 PATCH ngày không hợp lệ: 400, booking giữ nguyên, không lưu 0NaN-aN-aN | PATCH /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-44 | [all-cases/TC-052](all-cases/TC-052/README.md) |
| TC-053 PATCH firstname / lastname thành null, rỗng, chỉ khoảng trắng: 400, booking giữ nguyên | PATCH /booking/:id → GET /booking/:id | ❌ Failed · Bug: BUG-55 | [all-cases/TC-053](all-cases/TC-053/README.md) |

### Endpoint 6: DELETE /booking/:id
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-054 DELETE hợp lệ (Cookie) trả 201 'Created', sau đó booking không còn và không sống lại | DELETE /booking/:id → GET /booking/:id | ✅ Passed | [all-cases/TC-054](all-cases/TC-054/README.md) |
| TC-055 Sau khi xóa: DELETE lần 2, PUT, PATCH trả 404 | DELETE /booking/:id → PUT /booking/:id + PATCH /booking/:id | ❌ Failed · Bug: BUG-52 | [all-cases/TC-055](all-cases/TC-055/README.md) |

### Chung: nhiều endpoint
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-026 Không gửi Accept hoặc Accept */*: GET /booking/:id và POST /booking trả như bình thường (JSON đủ 6 trường) | GET /booking/:id | ❌ Failed · Bug: BUG-60 | [all-cases/TC-026](all-cases/TC-026/README.md) |
| TC-056 Phân vùng hợp lệ đọc lại đúng qua POST, PUT, PATCH (depositpaid true / false, giá nguyên, ngày hợp lệ) | POST /booking + PUT /booking/:id + PATCH /booking/:id | ✅ Passed | [all-cases/TC-056](all-cases/TC-056/README.md) |
| TC-057 Body urlencoded (depositpaid=true) cho POST, PUT, PATCH: đọc lại đúng từng trường | POST /booking + PUT /booking/:id + PATCH /booking/:id | ✅ Passed | [all-cases/TC-057](all-cases/TC-057/README.md) |
| TC-058 depositpaid false gửi bằng body urlencoded / XML phải lưu false (POST, PUT, PATCH) | POST /booking + PUT /booking/:id + PATCH /booking/:id | ❌ Failed · Bug: BUG-42 | [all-cases/TC-058](all-cases/TC-058/README.md) |
| TC-059 Content-Type text/xml (body XML, depositpaid true): POST tạo, PUT / PATCH sửa, đọc lại đúng từng trường | POST /booking + PUT /booking/:id + PATCH /booking/:id | ✅ Passed | [all-cases/TC-059](all-cases/TC-059/README.md) |
| TC-060 Accept application/xml: POST, GET /booking/:id, PUT trả XML đúng dữ liệu | GET /booking/:id + POST /booking + PUT /booking/:id | ✅ Passed | [all-cases/TC-060](all-cases/TC-060/README.md) |
| TC-061 Phản hồi XML có Content-Type là XML (application/xml hoặc text/xml) | GET /booking/:id + POST /booking + PUT /booking/:id | ❌ Failed · Bug: BUG-50 | [all-cases/TC-061](all-cases/TC-061/README.md) |
| TC-062 Accept không hỗ trợ: POST trả 406 và không tạo booking; GET /booking/:id trả 406 | POST /booking + GET /booking/:id | ❌ Failed · Bug: BUG-49 | [all-cases/TC-062](all-cases/TC-062/README.md) |
| TC-063 Id sai định dạng có tiền tố số: GET 404; PUT, PATCH, DELETE không đụng tới booking | GET /booking/:id + PUT /booking/:id + PATCH /booking/:id + DELETE /booking/:id | ❌ Failed · Bug: BUG-54 | [all-cases/TC-063](all-cases/TC-063/README.md) |
| TC-064 PUT / PATCH có bookingid trong body bị bỏ qua: booking giữ id, booking kia không đổi | PUT /booking/:id + PATCH /booking/:id | ❌ Failed · Bug: BUG-51 | [all-cases/TC-064](all-cases/TC-064/README.md) |
| TC-065 PUT / PATCH / DELETE id không tồn tại (lớn, 0, âm, chữ) với quyền hợp lệ: 404 | PUT /booking/:id + PATCH /booking/:id + DELETE /booking/:id | ❌ Failed · Bug: BUG-52 | [all-cases/TC-065](all-cases/TC-065/README.md) |
| TC-066 Không có / sai thông tin xác thực cơ bản (4 kiểu × PUT, PATCH, DELETE): 403 và booking giữ nguyên | PUT /booking/:id + PATCH /booking/:id + DELETE /booking/:id | ✅ Passed | [all-cases/TC-066](all-cases/TC-066/README.md) |
| TC-067 Ma trận 12 kiểu xác thực bị từ chối (abc123, token thừa / thiếu 1 ký tự, Bearer…) × PUT, PATCH, DELETE: 403, booking giữ nguyên | PUT /booking/:id + PATCH /booking/:id + DELETE /booking/:id | ✅ Passed | [all-cases/TC-067](all-cases/TC-067/README.md) |
| TC-068 Kiểu xác thực hợp lệ khác cookie token thường (cookie kèm cookie khác, nháy kép, Basic) × PUT, PATCH, DELETE: được chấp nhận | PUT /booking/:id + PATCH /booking/:id + DELETE /booking/:id | ✅ Passed | [all-cases/TC-068](all-cases/TC-068/README.md) |
| TC-069 Phương thức không hỗ trợ trên /booking và /booking/:id: 4xx, không tạo / sửa / xóa booking | GET /booking + GET /booking/:id | ✅ Passed | [all-cases/TC-069](all-cases/TC-069/README.md) |
