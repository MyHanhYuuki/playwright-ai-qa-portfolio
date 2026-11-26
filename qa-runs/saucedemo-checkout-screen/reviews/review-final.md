# Review: toàn bộ pipeline (review cuối), saucedemo-checkout-screen

- **Ngày**: 2026-11-26 · **Reviewer**: qa-reviewer (vai QC Lead, ISTQB) · **Kết luận**: ⚠️ **Cần sửa nhẹ** (0 lỗi 🔴, 0 lỗi 🟠, 3 lỗi 🟡). Số liệu và ID khớp nhau giữa mọi file của feature, các quyết định HITL #1 → #3 đã áp dụng đủ, sẵn sàng gộp vào `main` sau 3 sửa nhỏ về câu chữ.
- **Phạm vi**: nhánh `feat/checkout-sd103` (`git diff main...HEAD`, 8 commit) và các thay đổi chưa commit, gồm:
  - tài liệu feature: requirement, spec-review, viewpoint, q-and-a, known-issues, improvements, test-cases, test-data, triage, defects, rtm, evidence index;
  - code: 3 spec, Page Object, `tests/utils/`, `tests/repro/`;
  - tài liệu dự án: `README.md`, `docs/tong-quan-du-an.md` §7 / §12, bài 9, `.github/workflows/playwright.yml`, `playwright.config.ts`.
- **Nguồn đối chiếu**: 5 file review trước của feature (test-design, test-impl, script-gen, executor, defects) và phần "Kiểm lại" của từng file; `CLAUDE.md`.
- **Cách kiểm** (theo "Soát đủ mà không tốn thừa": chỉ soát cái mà review cuối mới thấy được; không chạy lại test vì không có điểm nghi ngờ):
  - Script đếm chéo trên các file: số TC, viewpoint, Q, IMP, BUG; bug ở câu đầu `notes` so với `defects.md`; severity; chỗ nhắc BUG-37, IMP-11.
  - Script kiểm link tương đối: 285 file `.md` (đã track và chưa track), 1 631 link.
  - `npm run typecheck`.
  - Quét thông tin cá nhân trong `git diff main...HEAD`, `git diff` và các file chưa track; tác giả commit.
  - Ước lượng thời gian CI.
  - Đọc `repro.ts` BUG-11 theo nghi vấn của người dùng.

## Checklist (mục 5)
| Mục | Kết quả |
|---|---|
| Truy vết hai chiều AC → viewpoint → TC → kết quả → bug | ✅ 7/7 AC có TC; 58 viewpoint (47 `in`, 11 `out`), mọi viewpoint `in` có TC, không TC nào trỏ viewpoint `out`; 53 TC đều `approved` (52 `automatable` + 1 `semi-auto`). Bug ở câu đầu `notes` của 22 TC = **21** bug, trùng đúng 21 bug của `defects.md` và 21 "Bug đang mở" của `rtm.md` |
| Số liệu khớp mọi nơi | ✅ 53 TC · 21 bug (8 High / 7 Medium / 6 Low, tự đếm từ bảng tổng hợp `defects.md`) · 15 mới + 6 biến thể + BUG-03 chỉ ghi nhận · 14 câu hỏi (Q1 → Q14, Answered 14) · 11 cải tiến (IMP-01 → 10, IMP-12; IMP-11 ghi rõ "đã chuyển thành BUG-36" ở `known-issues.md`, `improvements.md`, `q-and-a.md`, `defects.md`) · 47 quan sát (O-01 → O-47) · 31 / 22 kết quả · evidence 53 TC + 22 thư mục tự động + 21 thư mục tái hiện. Khớp giữa triage, defects, rtm, evidence index, `tong-quan-du-an.md` §12, bài 9. Một vài câu trong `triage.md` chưa theo kịp (C1) |
| BUG-37 vẫn trống | ✅ Chỉ xuất hiện 4 lần, đều với nghĩa "số trống tiếp theo / chỉ cấp nếu PO coi là bug": `q-and-a.md` Q14, `known-issues.md` HITL #3, `triage.md` N1, `defects.md`. `CLAUDE.md`: feature sau bắt đầu từ BUG-37 |
| Quyết định HITL #1 → #3 áp dụng đủ | ✅ HITL #1: 13 câu trả lời đã vào BR, viewpoint, TC. HITL #2: 9 quyết định + BUG-36 + quy tắc bổ sung Q12 (đã kiểm ở review-script-gen). HITL #3: (1) 21 bug, BUG-29 High (`defects.md`, `known-issues.md`); (2) Q14 = IMP-12 (`q-and-a.md` Answered, `improvements.md`, O-47 "💡 Cải tiến", `defects.md` mục "Không đưa vào"); (3) TC-048, TC-034 đã sửa và được người duyệt biết; (4) CI phương án B (`timeout-minutes: 30`, 1 worker). Riêng `triage.md` còn 2 chỗ viết theo trạng thái trước HITL #3 (C1) |
| Ổn định, không lỗi bị che | ✅ (từ các lượt trước) chạy lặp 106/106; 22 test bug fail đúng assertion, 0 lỗi code test; A2 đóng có theo dõi; D3 kiểm độc lập |
| Riêng tư | ✅ Không có đường dẫn máy, tên máy, email thật trong `git diff main...HEAD`, `git diff` và các file chưa track (trừ ảnh / video / PDF). Mọi commit của nhánh có tác giả `MyHanhYuuki <…@users.noreply.github.com>`. Mật khẩu chỉ ở `tests/data/users.ts` (mật khẩu demo công khai, `SAUCE_PASSWORD` ghi đè được) |
| Link tương đối | ✅ 1 631 link trong 285 file `.md`: **0 link hỏng** (gồm các link evidence dạng `<…[id_bug_n]…>` và link từ `defects.md` sang SD-101 / SD-102) |

## Sẵn sàng gộp `feat/checkout-sd103` → `main`
| Điểm | Kết luận |
|---|---|
| Kiểm tra kiểu | ✅ `npm run typecheck` sạch |
| SD-101, SD-102 còn chạy như trước | ✅ Không chạy lại. SD-101 không đổi. SD-102: spec đổi ở C3 (dùng `tests/utils/layout.ts`) và đã chạy lại 46/46 đúng dự kiến sau thay đổi đó (review-script-gen lượt 2); TC-035, TC-036 fail đúng giá trị cũ. Các thay đổi sau đó (`evidence.ts`, `playwright.config.ts`) chỉ có tác dụng khi chạy evidence: `Evidence.finish()` thoát ngay khi `!EVIDENCE_ENABLED`, `video` chỉ bật khi có `EVIDENCE`. File dùng chung (`bugs.ts`, `messages.ts`, `fixtures`, `CartPage.ts`) chỉ **thêm** mới, không sửa dòng cũ |
| Test có bị chạy nhầm trên CI | ✅ `tests/repro/*.repro.ts` không khớp `testMatch` mặc định (`*.spec.ts`), CI không chạy |
| Ước lượng thời gian CI (1 worker, `retries: 2`) | ✅ Checkout cộng dồn **12,2 phút** (đo với 9 worker nên hơi cao hơn chạy tuần tự) + SD-101 / SD-102 **7,2 phút** (CI lần gần nhất) ≈ **19,4 phút**, cộng cài đặt 1–2 phút ≈ **21 phút**, dưới giới hạn **30 phút**. Trường hợp xấu: 1 test dương tính chập chờn được chạy lại (+ vài chục giây; TC-019 hết giờ thì + tới 6 phút) vẫn dưới 30 phút |
| CI có đỏ không | ✅ Dự kiến **xanh**: 22 test `test.fail()` fail đúng bug thì Playwright tính "passed"; 31 test dương tính pass 106/106 khi chạy lặp. Hai rủi ro còn lại, đều là tín hiệu đúng, không phải lỗi bộ test: (1) web demo bị sửa một bug thì test `test.fail()` đó báo "pass ngoài mong đợi" (đỏ); (2) TC-045 / TC-047 từng đỏ 2/41 lần (A2, nghi môi trường), CI có `retries: 2` nên nếu gặp sẽ thành flaky chứ không đỏ |
| Việc còn lại trước khi push | Commit các file chưa commit (bug report, repro, RTM, bài 9, review, evidence README, `tong-quan-du-an.md`, `README.md`, `playwright.config.ts`, `evidence.ts`) theo nhóm, hỏi người dùng trước khi commit / push (`CLAUDE.md`) |

## A. Phát hiện mới (đã kiểm chứng trên sản phẩm thật)
Không có. Về nghi vấn BUG-11 của người dùng ("bấm vô vẫn ra đúng sản phẩm"):
- Orchestrator đã kiểm lại trên web thật: `problem_user` mở `?id=5` (Fleece Jacket) khi bấm Backpack, ở cả Tổng quan, giỏ, danh sách.
- Mình soát lại chỗ đọc kết quả: test TC-025 (`openProduct()` chờ nút `Back to products`, chỉ trang chi tiết mới có) và script tái hiện BUG-11 (`repro.ts` dòng 525: chờ `#back-to-products` rồi mới đọc `.inventory_details_name`) đều chờ đúng trang đích (bài học L3). Không tài liệu nào đọc tên sản phẩm quá sớm.
- Nếu người dùng kiểm bằng tay, cần đăng nhập đúng `problem_user` (bước 1 của BUG-11 trong `defects.md` đã ghi) và đọc cả URL `?id=`, vì Backpack → Fleece Jacket là 2 sản phẩm khác hẳn nhau.

## B. Thiếu sót
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| B1 | **Người xem portfolio không thấy phần thanh toán từ `README.md`**. Mục Progress vẫn là `[ ] SauceDemo Cart → Checkout (E2E)`, không có link tới bug report, RTM. Đường duy nhất là danh sách bài học (bài 9 → `qa-runs/`). Hai feature trước đều có dòng `[x] … ([bug reports](…) · [RTM](…))` | `README.md` dòng 91 | 🟡 | Khi đóng feature: `- [x] SauceDemo Checkout (Information → Overview → Complete): 53 TC, 21 bugs ([bug reports](qa-runs/saucedemo-checkout-screen/defects.md) · [RTM](qa-runs/saucedemo-checkout-screen/rtm.md))` |

## C. Không nhất quán giữa các file
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| C1 | `triage.md` còn 3 câu viết theo trạng thái cũ: (1) dòng Failed "22 bug đã biết" (là 22 **test** của **21** bug; dòng real-bug ngay dưới đã ghi đúng "22 TC / 21 bug"); (2) cột Severity của BUG-29 vẫn "Critical nếu là hệ thống thật", trong khi HITL #3 chốt **High** (đã ghi ở dòng 23 và trong `defects.md`, `known-issues.md`); (3) dòng N1 kết luận vẫn "PO coi là bug thì cấp BUG-37", chưa ghi kết quả Q14 | `triage.md` dòng 16, dòng BUG-29, dòng N1 (dòng 70) | 🟡 | (1) "22 test của 21 bug đã biết"; (2) "**High** (HITL #3; Critical nếu là hệ thống thật)"; (3) thêm "→ HITL #3: cải tiến IMP-12" |

## D. Sai kỹ thuật / sai chuẩn
Không có.

## E. Đề xuất quy trình
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| E1 | Việc đóng feature chưa làm (đúng thứ tự, vì review cuối vừa xong): `tong-quan-du-an.md` §7 dòng 9 vẫn "🔄 Đang review bug report, review cuối"; chưa có số đo CI thật sau khi gộp | `docs/tong-quan-du-an.md` §7 | 🟡 | Sau khi xử lý review này: §7 dòng 9 → "✅ Xong (review cuối đã xử lý)"; sau lần CI đầu trên `main`, ghi thời gian thật vào §12 (dòng "Thanh toán: kết quả chạy") để kiểm lại ước lượng ~21 phút |

## Việc cần làm trước khi đóng feature (xếp theo mức độ)
1. 🟡 C1: sửa 3 câu trong `triage.md`.
2. 🟡 B1, E1: `README.md` Progress, `tong-quan-du-an.md` §7; commit theo nhóm (hỏi người dùng), push, theo dõi lần CI đầu.

## Xử lý sau review
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| B1 | 🟡 | `README.md` Progress: dòng Checkout `[x]` + link bug report, RTM | ✅ | `README.md` Progress: `[x] SauceDemo Checkout (Your Information → Overview → Complete, PDF receipt): 53 TC, 21 bugs` + link bug reports, RTM, lesson 9 |
| C1 | 🟡 | `triage.md`: "22 test của 21 bug", BUG-29 High, N1 ghi kết quả Q14 | ✅ | `triage.md`: dòng Failed "22 test của 21 bug đã biết (BUG-24 có 2 TC)"; BUG-29 "High (HITL #3; Critical nếu là hệ thống thật)"; N1 thêm "Kết quả Q14 (HITL #3): cải tiến IMP-12, không cấp số bug" |
| E1 | 🟡 | `tong-quan-du-an.md` §7 dòng 9 ✅; ghi thời gian CI thật sau lần chạy đầu | ⏳ Một phần | §7 dòng 9 đã ✅ (ghi chú thời gian CI ghi sau). Thời gian CI thật: ghi vào §12 sau lần chạy đầu trên `main` (cần người dùng duyệt gộp nhánh) |

## Kiểm lại lượt 2 (2026-11-26)
Phạm vi: chỉ diff của `README.md`, `triage.md`, `docs/tong-quan-du-an.md`, và kiểm link `README.md` một lần nữa.

| # | Kết luận | Bằng chứng |
|---|---|---|
| B1 | ✅ OK | `README.md` Progress: `[x] SauceDemo Checkout (Your Information → Overview → Complete, PDF receipt): 53 TC, 21 bugs`, kèm link bug reports, RTM, lesson 9. Cùng kiểu dòng của 2 feature trước. Kiểm link `README.md`: 22 link tương đối, **0 hỏng** |
| C1 | ✅ OK | `triage.md` dòng 16: "22 test của 21 bug đã biết (BUG-24 có 2 TC)"; dòng BUG-29: "High (HITL #3; Critical nếu là hệ thống thật)"; dòng N1 (70) thêm "Kết quả Q14 (HITL #3, 2026-11-26): cải tiến IMP-12, không cấp số bug" |
| E1 | ✅ OK phần làm được bây giờ; ⏳ phần còn lại đúng là việc sau khi gộp | `tong-quan-du-an.md` §7 dòng 9: "✅ Xong (review cuối đã xử lý; thời gian CI thật ghi sau lần chạy đầu trên `main`)", mô tả 53 TC, 21 bug khớp. Ghi thời gian CI thật vào §12 chỉ làm được sau khi người dùng duyệt gộp nhánh, nên trạng thái "⏳ Một phần" là đúng, không chặn |

**Kết luận lượt 2: ✅ Đạt.** Feature sẵn sàng gộp vào `main` khi người dùng duyệt; sau lần CI đầu, ghi thời gian thật vào §12 (E1).
