# Evidence: restful-booker-auth-api

> Mục lục dựng lại bằng `npm run test:evidence -- restful-booker-auth-api --index-only` lúc 2026-11-28T06:02:02.915Z từ evidence có sẵn (không chạy test). Thời điểm chạy của từng test case ghi trong README của nó.
> Feature API: mỗi test case có README liệt kê từng bước, request / response (method, đường dẫn, mã, header chính, trích body) và dòng **"Cần xem"**. Không có ảnh / video.
> Token, cookie, Authorization, mật khẩu đã được che (`***`). Nhóm `@bad-login` lấy evidence từ lần chạy có nhóm này (mặc định không chạy lại ở đây, TD-27).

## Bug (theo ticket)
| Ticket_BUG | Endpoint của TC | Nội dung | Thư mục |
|---|---|---|---|
| [id_bug_37]_BUG-37 | POST /auth | TC-004 | [bugs/[id_bug_37]_BUG-37/TC-004](<bugs/[id_bug_37]_BUG-37/TC-004/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-005 | [bugs/[id_bug_37]_BUG-37/TC-005](<bugs/[id_bug_37]_BUG-37/TC-005/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-006 | [bugs/[id_bug_37]_BUG-37/TC-006](<bugs/[id_bug_37]_BUG-37/TC-006/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-007 | [bugs/[id_bug_37]_BUG-37/TC-007](<bugs/[id_bug_37]_BUG-37/TC-007/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-008 | [bugs/[id_bug_37]_BUG-37/TC-008](<bugs/[id_bug_37]_BUG-37/TC-008/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-009 | [bugs/[id_bug_37]_BUG-37/TC-009](<bugs/[id_bug_37]_BUG-37/TC-009/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-010 | [bugs/[id_bug_37]_BUG-37/TC-010](<bugs/[id_bug_37]_BUG-37/TC-010/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-011 | [bugs/[id_bug_37]_BUG-37/TC-011](<bugs/[id_bug_37]_BUG-37/TC-011/README.md>) |
| [id_bug_37]_BUG-37 | POST /auth | TC-016 | [bugs/[id_bug_37]_BUG-37/TC-016](<bugs/[id_bug_37]_BUG-37/TC-016/README.md>) |
| [id_bug_38]_BUG-38 | POST /auth | TC-012 | [bugs/[id_bug_38]_BUG-38/TC-012](<bugs/[id_bug_38]_BUG-38/TC-012/README.md>) |
| [id_bug_38]_BUG-38 | POST /auth | TC-013 | [bugs/[id_bug_38]_BUG-38/TC-013](<bugs/[id_bug_38]_BUG-38/TC-013/README.md>) |
| [id_bug_39]_BUG-39 | POST /auth | TC-014 | [bugs/[id_bug_39]_BUG-39/TC-014](<bugs/[id_bug_39]_BUG-39/TC-014/README.md>) |
| [id_bug_40]_BUG-40 | Cả 2 | TC-030 | [bugs/[id_bug_40]_BUG-40/TC-030](<bugs/[id_bug_40]_BUG-40/TC-030/README.md>) |

## Tất cả test case

### GET /ping: kiểm tra hệ thống
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-025 GET /ping trả 201 Created | GET /ping | ✅ Passed | [all-cases/TC-025](all-cases/TC-025/README.md) |
| TC-026 HEAD /ping cùng mã với GET, body rỗng | GET /ping | ✅ Passed | [all-cases/TC-026](all-cases/TC-026/README.md) |
| TC-027 Biến thể URL / header của /ping cho cùng kết quả | GET /ping | ✅ Passed | [all-cases/TC-027](all-cases/TC-027/README.md) |
| TC-028 Sai phương thức trên /ping: 4xx, không trả Created | GET /ping | ✅ Passed | [all-cases/TC-028](all-cases/TC-028/README.md) |

### POST /auth: cấp token, từ chối đăng nhập sai, token dùng được
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-001 Happy path: tài khoản quản trị đúng (JSON) được cấp token | POST /auth | ✅ Passed | [all-cases/TC-001](all-cases/TC-001/README.md) |
| TC-002 Mỗi lần gọi cấp một token mới (5 lần liên tiếp) | POST /auth | ✅ Passed | [all-cases/TC-002](all-cases/TC-002/README.md) |
| TC-003 Biến thể hợp lệ của body / header JSON vẫn cấp token | POST /auth | ✅ Passed | [all-cases/TC-003](all-cases/TC-003/README.md) |
| TC-004 Sai mật khẩu: 401, không cấp token, thông báo Bad credentials | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-004](all-cases/TC-004/README.md) |
| TC-005 Sai tên / tài khoản không tồn tại: giống hệt sai mật khẩu (không lộ tài khoản) | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-005](all-cases/TC-005/README.md) |
| TC-006 Phân biệt hoa thường ở tên đăng nhập và mật khẩu | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-006](all-cases/TC-006/README.md) |
| TC-007 Khoảng trắng ở 4 vị trí (đầu / cuối tên, đầu / cuối mật khẩu) không được cắt | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-007](all-cases/TC-007/README.md) |
| TC-008 Thiếu trường bắt buộc: 400, không cấp token | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-008](all-cases/TC-008/README.md) |
| TC-009 Giá trị rỗng và null coi như thiếu trường: 400, không cấp token | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-009](all-cases/TC-009/README.md) |
| TC-010 Sai kiểu dữ liệu và thử vượt xác thực không cấp token, không 5xx | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-010](all-cases/TC-010/README.md) |
| TC-011 Tên đăng nhập 10 000 ký tự: 401, không 5xx | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-011](all-cases/TC-011/README.md) |
| TC-012 Body quá lớn (~200 KB): 413, phản hồi lỗi là JSON | POST /auth | ❌ Failed · Bug: BUG-38 | [all-cases/TC-012](all-cases/TC-012/README.md) |
| TC-013 Body không phân tích được: 400, phản hồi lỗi là JSON | POST /auth | ❌ Failed · Bug: BUG-38 | [all-cases/TC-013](all-cases/TC-013/README.md) |
| TC-014 Định dạng body không hỗ trợ (tài khoản đúng): 415 JSON, không báo Bad credentials | POST /auth | ❌ Failed · Bug: BUG-39 | [all-cases/TC-014](all-cases/TC-014/README.md) |
| TC-015 Body URL-encoded được cấp token và token đó dùng được | POST /auth | ✅ Passed | [all-cases/TC-015](all-cases/TC-015/README.md) |
| TC-016 Tài khoản trên query string bị từ chối (400), không cấp token | POST /auth | ❌ Failed · Bug: BUG-37 | [all-cases/TC-016](all-cases/TC-016/README.md) |
| TC-017 Header Accept: application/xml không đổi định dạng phản hồi của /auth | POST /auth | ✅ Passed | [all-cases/TC-017](all-cases/TC-017/README.md) |
| TC-018 Sai phương thức trên /auth: 4xx, không token, không 5xx | POST /auth | ✅ Passed | [all-cases/TC-018](all-cases/TC-018/README.md) |
| TC-019 AC-3: token vừa cấp dùng được cho PUT booking tự tạo | POST /auth | ✅ Passed | [all-cases/TC-019](all-cases/TC-019/README.md) |
| TC-020 AC-3: token vừa cấp dùng được cho PATCH booking tự tạo | POST /auth | ✅ Passed | [all-cases/TC-020](all-cases/TC-020/README.md) |
| TC-021 AC-3: token vừa cấp dùng được cho DELETE booking tự tạo | POST /auth | ✅ Passed | [all-cases/TC-021](all-cases/TC-021/README.md) |
| TC-022 Đối chứng âm AC-3: token abc123 và token bị sửa bị từ chối 403, booking không đổi | POST /auth | ✅ Passed | [all-cases/TC-022](all-cases/TC-022/README.md) |
| TC-023 Token cũ vẫn dùng được sau khi đã cấp token mới (cùng chu kỳ reset) | POST /auth | ✅ Passed | [all-cases/TC-023](all-cases/TC-023/README.md) |
| TC-024 Cookie có nhiều giá trị: token vẫn được nhận | POST /auth | ✅ Passed | [all-cases/TC-024](all-cases/TC-024/README.md) |

### Chung: cả 2 endpoint
| Test case | Endpoint của TC | Kết quả | Thư mục |
|---|---|---|---|
| TC-029 Luồng smoke: ping → tạo booking → auth → PATCH bằng token → xóa | Cả 2 | ✅ Passed | [all-cases/TC-029](all-cases/TC-029/README.md) |
| TC-030 HTTP thường bị chuyển hướng sang HTTPS hoặc bị từ chối; HTTPS có HSTS | Cả 2 | ❌ Failed · Bug: BUG-40 | [all-cases/TC-030](all-cases/TC-030/README.md) |
