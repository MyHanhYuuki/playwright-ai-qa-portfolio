# Review: dọn backlog 2026-11-26 (trên `main`, chưa commit)

- **Ngày**: 2026-11-26 · **Reviewer**: qa-reviewer · **Kết luận**: ⚠️ **Cần sửa nhẹ** (0 🔴, 0 🟠, 2 🟡)
- **Phạm vi**: chỉ `git diff` + file chưa track:
  - `tests/utils/evidence.ts` (`ShotOptions.page`), `tests/fixtures/index.ts` (fixture `page` + `CPU_THROTTLE`), `scripts/run-stability.mjs` (`--cpu`);
  - SD-102: TC-013, TC-044 (spec, CSV, `triage.md`, `defects.md`, RTM, evidence), `run-20261126-163230.json`, `stability-20261126-1636.json`;
  - `repro.ts` BUG-29 + README tái hiện;
  - `CLAUDE.md`, `executor.md`, `docs/thuat-ngu.md`.
- **Cách kiểm** (không chạy lại test):
  - đọc diff;
  - đọc run JSON mới và JSON stability;
  - parse CSV (46 dòng × 16 cột);
  - xem README evidence TC-013, TC-044 và 1 ảnh tab B;
  - `git log` của `main`;
  - quét thông tin cá nhân.

## Kết luận từng thay đổi
| # | Thay đổi | Kết luận | Bằng chứng |
|---|---|---|---|
| 1 | `ShotOptions.page`, ảnh tab B ở TC-044 | ✅ | `shot()` dùng `opts.page ?? this.page` cho cả chờ ảnh, vẽ khung, chụp, gỡ lớp phủ; locator khoanh đỏ thuộc tab B nên khung đo đúng trang. Ảnh `01-tab-b-gio-sau-khi-tab-a-them-backpack.jpg`: trang giỏ của tab B, khung đỏ ở số giỏ 1 và dòng Backpack, dòng "Cần xem" đúng. Đóng việc tồn SD-102 B6 (TC-044 tab B) |
| 2 | TC-013 tải lại danh sách | ✅ | Có bước đối chứng: tải lại rồi chờ `inventory-list` (phần tử riêng của trang, L3). Oracle mới "giá giữ nguyên sau khi tải lại" đúng với mô tả BUG-14 "đổi mỗi lần tải". Run `163230`: TC-013 fail đúng dự kiến, **14 lỗi** = 6 giá lần 1 + 1 "giữ nguyên" + 6 giá "Sau khi tải lại" + 1 "danh sách = chi tiết, giỏ". Annotation ghi đủ 2 dãy giá, khớp câu đã thêm vào `triage.md` / `defects.md` (`$12.33 … · $60.35 …`). Tổng 46/46 (29 + 17), RTM trỏ lần chạy mới. CSV: bước 1b + expected mới, parse đúng 16 cột; TC đã duyệt mà sửa thì cần báo người dùng, `triage.md` đã ghi |
| 3 | Fixture `page` + `CPU_THROTTLE`, `--cpu` | ✅ | **Chạy thường và CI không đổi**: `rate = Number(process.env.CPU_THROTTLE ?? 0)`, chỉ gọi CDP khi `rate > 1` và Chromium; không đặt biến (hoặc đặt sai, ra `NaN`) thì fixture chỉ `use(page)`. **Thứ tự fixture không đổi**: ghi đè `page` trong `extend` nên `evidence` (auto), `loginAs`, `loggedInPage`, `loginPage`, các PO đều nhận cùng trang đã giới hạn; `page` vốn đã được tạo cho mọi test (vì `evidence` auto dùng nó), nên không thêm chi phí. `run-stability.mjs`: kiểm `--cpu` > 1, truyền `CPU_THROTTLE` qua env của tiến trình con, JSON ghi `cpu_throttle: 4` và lệnh đầy đủ (6/6, 7,8 giây). Tab 2 / `otherSession` không bị giới hạn: đã ghi trong chú thích |
| 4 | Tài liệu | ✅ | `CLAUDE.md` (2 dòng lệnh), `executor.md` (Phase 3), `thuat-ngu.md` đủ 6 thuật ngữ, ví dụ đúng (PR #1 gộp bằng merge commit, giữ 11 commit: khớp `git log`) |
| 5 | `repro.ts` BUG-29 dòng đối chứng | ✅ | Thao tác ghi giá trị mong đợi thay cho chữ "đối chứng" thừa; README tái hiện đã sinh lại |
| 6 | Evidence `EVIDENCE_KEEP_VIDEOS` | ⚠️ R1 | TC-044 ổn (test pass, không có video). TC-013 xem R1 |
| – | Riêng tư | ✅ | Không có đường dẫn máy, tên máy trong diff và các file chưa track (trừ ảnh) |

## Phát hiện
| # | Vấn đề | Bằng chứng | Mức | Đề xuất |
|---|---|---|---|---|
| R1 | **Dùng `EVIDENCE_KEEP_VIDEOS` cho một test đã đổi code.** Video TC-013 giữ bản quay **2026-11-25**, lúc test **chưa có** bước tải lại. Trong khi README liệt kê 4 bước (gồm "Giá ở danh sách sau khi tải lại"). Lý do dùng cờ này ở bước 9 ("code test không đổi") không còn đúng với TC-013 | `evidence/all-cases/TC-013/README.md` dòng Video; `video.webm` ngày 25/11; spec TC-013 thêm bước tải lại | 🟡 | Quay lại riêng video TC-013: `npm run test:evidence -- saucedemo-products-cart-screen -g "TC-013"` **không** bật cờ (chỉ 1 video nhỏ). Thêm vào `CLAUDE.md` / `executor.md` (dòng `EVIDENCE_KEEP_VIDEOS`): "chỉ dùng khi code của test **không đổi** kể từ lần quay video" |
| R2 | Quan sát giá `$74.2` (thiếu số 0 cuối) chưa ghi ở đâu | Chỉ thấy 1 lần ở lần chạy thử ngoài lần chính thức, không có bằng chứng lưu lại (lần chính thức có `$74.07`) | 🟡 | **Thuộc BUG-14, không phải bug mới, cũng không phải nhiễu**: cùng chỗ sinh giá ngẫu nhiên của `visual_user` (cùng chỗ sửa). Ghi 1 câu trong "Thực tế" của BUG-14 (`defects.md`): "Giá ngẫu nhiên có lúc thiếu số 0 cuối (vd `$74.2`, thấy 1 lần ở lần chạy thử, chưa lưu bằng chứng)". Không thêm assertion riêng: annotation 2 dãy giá mới của TC-013 sẽ tự lưu bằng chứng nếu gặp lại. Không trình bày như kết quả của lần chạy chính thức |

## Xử lý sau review
| # | Mức | Việc | Trạng thái | Ghi chú của bên sửa |
|---|---|---|---|---|
| R1 | 🟡 | Quay lại video TC-013; ghi điều kiện dùng `EVIDENCE_KEEP_VIDEOS` | ✅ | `npm run test:evidence -- saucedemo-products-cart-screen -g "TC-013"` (không bật cờ): video TC-013 quay lại (09:41Z, có bước tải lại), bản copy ở `bugs/[id_bug_14]_BUG-14/TC-013/` giống hệt (`cmp`). `CLAUDE.md` và `executor.md`: `EVIDENCE_KEEP_VIDEOS` **chỉ dùng khi code của test không đổi**, test đã sửa thì quay lại video của test đó bằng `-g` |
| R2 | 🟡 | Ghi quan sát `$74.2` vào BUG-14 (thấy 1 lần, chưa có bằng chứng) | ✅ | `defects.md` BUG-14 phần Thực tế: thêm câu "một lần chạy thử (2026-11-26, không lưu bằng chứng) thấy giá thiếu số 0 cuối (`$74.2`)", cùng bộ sinh giá ngẫu nhiên; annotation 2 lần tải của TC-013 sẽ ghi lại nếu gặp lại |

## Kiểm lại lượt 2 (2026-11-26)
| # | Kết luận | Bằng chứng |
|---|---|---|
| R1 | ✅ OK | README TC-013: thời điểm `09:41:13Z`, dòng Video là `[video.webm](video.webm)` (quay mới, không còn ghi "giữ bản cũ"). `video.webm` 8 967 byte, ngày 26/11; bản ở `bugs/[id_bug_14]_BUG-14/TC-013/` giống hệt cả video lẫn README (`cmp`). Điều kiện "chỉ dùng khi code của test không đổi; test đã sửa thì quay lại video của test đó (bằng `-g`)" đã ghi cạnh `EVIDENCE_KEEP_VIDEOS` ở `CLAUDE.md` (dòng 19-20) và `executor.md` (Phase 3) |
| R2 | ✅ OK | `defects.md` BUG-14 "Thực tế" (dòng 81): câu "một lần chạy thử (2026-11-26, không lưu bằng chứng) … thiếu số 0 cuối (`$74.2`)", nói rõ đó là quan sát chưa có bằng chứng, không phải kết quả lần chạy chính thức |

**Kết luận lượt 2: ✅ Đạt.**
