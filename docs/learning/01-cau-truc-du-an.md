# Bài 1: Cấu trúc dự án Playwright

> Sổ tay học tập: ghi lại những gì đã làm và đã hiểu, để sau này đọc lại vẫn hiểu.

## 1. Dự án được tạo như thế nào

| Lệnh | Tác dụng |
|---|---|
| `npm init playwright@latest -- --lang=ts --browser=chromium --gha` | Tạo khung dự án Playwright: dùng TypeScript, trình duyệt Chromium, kèm file CI cho GitHub Actions |
| `npx playwright init-agents --loop=claude` | Tạo cấu hình Playwright MCP (`.mcp.json`) + file seed cho AI agent. Sau đó dự án thay 3 agent mặc định bằng pipeline QA 5 agent riêng (xem [sơ đồ](../ai-agent-workflow.md)) |
| `npx playwright test` | Chạy tất cả test |

- **npm**: công cụ quản lý thư viện của Node.js, dùng để tải, cài và cập nhật thư viện.
- **npx**: chạy một công cụ đã cài trong dự án, ví dụ `npx playwright ...`.

## 2. Cây thư mục

```
playwright-ai-qa-portfolio/
├── .claude/
│   ├── agents/              # 5 AI agent của pipeline QA
│   │   ├── test-design.md   # [1] Phân tích yêu cầu → viewpoint
│   │   ├── test-impl.md     # [2] Viết test case + test data
│   │   ├── script-gen.md    # [3] Viết code test (Page Object Model)
│   │   ├── executor.md      # [4] Chạy test + phân loại kết quả
│   │   └── healer.md        # [5] Sửa test viết sai
│   └── commands/
│       └── qa-orchestrator.md   # Lệnh /qa-orchestrator điều phối cả pipeline
├── .github/workflows/
│   └── playwright.yml       # CI: GitHub tự chạy test mỗi khi push code
├── docs/                    # Tài liệu: sơ đồ AI agent, sổ tay học
├── kb/q-and-a-archive.md    # Q&A tích lũy, AI dùng lại cho chức năng sau
├── qa-runs/<feature>/       # Kết quả từng lần chạy pipeline: requirement, test case, triage, bug, RTM
├── tests/
│   ├── pages/               # Page Object: mô tả từng trang web
│   ├── specs/               # File test, đuôi .spec.ts
│   ├── data/                # Test data (vd: users.ts chứa tài khoản test)
│   ├── fixtures/            # Phần chuẩn bị dùng chung (vd: trang đã đăng nhập)
│   └── seed.spec.ts         # Test "hạt giống": điểm bắt đầu để AI agent mở trình duyệt
├── .gitignore               # Danh sách file/thư mục KHÔNG đưa lên git
├── .mcp.json                # Cấu hình MCP server để AI điều khiển trình duyệt
├── package.json             # "Danh sách thư viện" của dự án
├── package-lock.json        # Khóa chính xác phiên bản từng thư viện
├── playwright.config.ts     # Cấu hình chung của Playwright
└── README.md                # Giới thiệu dự án (trang đầu tiên người khác đọc)
```

## 3. Giải thích từng file quan trọng

### `package.json`: danh sách thư viện
```json
"devDependencies": {
  "@playwright/test": "^1.65.1",
  "@types/node": "^26.6.6"
}
```
- **devDependencies**: thư viện chỉ cần khi phát triển và test, không cần khi chạy sản phẩm thật.
- `^1.65.1`: dấu `^` nghĩa là chấp nhận các bản cập nhật nhỏ (1.66, 1.67…) nhưng không nhảy lên 2.x.
- Người khác tải dự án về chỉ cần chạy `npm ci` là có đủ thư viện **đúng y phiên bản** ghi trong `package-lock.json`.

### `node_modules/`: thư viện đã tải về
- Rất nặng (hàng chục, hàng trăm MB) và có thể tải lại bất cứ lúc nào, nên **không đưa lên git**. Thư mục này đã được chặn trong `.gitignore`.

### `playwright.config.ts`: cấu hình chung
| Dòng | Ý nghĩa |
|---|---|
| `testDir: './tests'` | Test nằm trong thư mục `tests/` |
| `fullyParallel: true` | Chạy nhiều test cùng lúc cho nhanh |
| `forbidOnly: !!process.env.CI` | Trên CI, báo lỗi nếu ai đó lỡ để `test.only` (chỉ chạy 1 test) |
| `retries: process.env.CI ? 2 : 0` | Trên CI, test fail thì cho chạy lại tối đa 2 lần. Trên máy mình thì không chạy lại |
| `workers: process.env.CI ? 1 : undefined` | Trên CI chạy 1 luồng, trên máy mình tự chọn theo số CPU |
| `reporter: 'html'` | Xuất báo cáo dạng trang web (mở bằng `npx playwright show-report`) |
| `baseURL: ... 'https://www.saucedemo.com'` | Địa chỉ gốc của web. Trong test chỉ cần `page.goto('/')`. Có thể đổi bằng biến môi trường `BASE_URL` |
| `testIdAttribute: 'data-test'` | SauceDemo đánh dấu phần tử bằng `data-test="..."`, nên `page.getByTestId('...')` sẽ tìm theo thuộc tính này |
| `trace: 'on-first-retry'` | Khi test chạy lại lần đầu, ghi **trace** (ảnh từng bước, network, console) để điều tra lỗi |
| `screenshot: 'only-on-failure'` | Test fail thì tự chụp màn hình, làm bằng chứng cho bug report |
| `projects: [chromium]` | Chạy trên Chrome desktop. Sau này có thể thêm Firefox, WebKit (Safari), mobile |

### `tests/*.spec.ts`: file test
- `spec` = specification: đặc tả hành vi cần kiểm tra.
- `.ts` = TypeScript, tức JavaScript có thêm **kiểu dữ liệu**, giúp phát hiện lỗi gõ sai ngay khi viết.

### `.github/workflows/playwright.yml`: CI
- **CI (Continuous Integration)**: mỗi lần push code, GitHub tự dựng máy ảo, cài thư viện, chạy toàn bộ test và lưu báo cáo.
- Nhờ vậy, ai mở repo cũng thấy test đang **pass (xanh)** hay **fail (đỏ)**.
- **Tối ưu thời gian chạy CI.** Lần chạy đầu mất 11 phút, trong đó 10 phút 52 giây là cài trình duyệt. Đã sửa:

| Thay đổi | Tác dụng |
|---|---|
| `npx playwright install --with-deps chromium` thay vì cài cả 3 trình duyệt | Dự án chỉ dùng Chromium, không tải Firefox/WebKit thừa |
| `actions/cache` cho thư mục `~/.cache/ms-playwright`, key theo phiên bản Playwright | Từ lần chạy thứ 2 không phải tải lại Chromium. Nâng cấp Playwright thì key đổi và tự tải bản mới |
| `setup-node` với `cache: npm` | Dùng lại các package npm đã tải |
| `concurrency` + `cancel-in-progress` | Push liên tiếp thì hủy lần chạy cũ, không tốn thời gian vô ích |
| Nâng `checkout`/`setup-node`/`upload-artifact` lên v7 | Hết cảnh báo "Node.js 20 is deprecated" |
| `workflow_dispatch` | Có thể bấm chạy tay trong tab Actions |

### `.mcp.json` và `.claude/agents/`: phần AI
- **MCP (Model Context Protocol)**: giao thức giúp AI (Claude) dùng được công cụ bên ngoài, ở đây là điều khiển trình duyệt thật.
- **AI agent**: AI được giao một vai trò cụ thể, có công cụ riêng và tự làm nhiều bước. Dự án có 5 agent: test-design → test-impl → script-gen → executor → healer.
- **Orchestrator** (`/qa-orchestrator`): "trưởng nhóm" gọi từng agent theo thứ tự và dừng ở 3 điểm cho người duyệt (HITL).
- **HITL (Human-in-the-loop)**: điểm người kiểm tra và duyệt kết quả của AI trước khi đi tiếp.
- Chi tiết xem [Sơ đồ làm việc của AI agent](../ai-agent-workflow.md).

### Commit và push: khác nhau thế nào, khi nào nên push?
| | Commit | Push |
|---|---|---|
| Là gì | Lưu một mốc thay đổi **trên máy mình** | Đẩy các commit **lên GitHub** |
| Ai thấy | Chỉ mình | Mọi người (repo public) |
| Kích hoạt CI | Không | Có, GitHub tự chạy test |

**Nên push khi:**
- Thay đổi đã **hoàn chỉnh và chạy được**, nên không đẩy code đang dở.
- Cần **CI kiểm chứng trên môi trường thật** (Linux), không chỉ trên máy mình.
- Muốn **sao lưu**. Máy hỏng hay máy dùng chung thì việc trên máy dễ mất.
- Muốn người khác (đồng đội, nhà tuyển dụng) **thấy tiến độ**.

**Chưa nên push khi:**
- Còn đang dở, test đang đỏ, hoặc chưa quét thông tin nhạy cảm.
- Muốn tự xem lại hoặc sửa commit. Sửa commit **chưa push** thì dễ, sửa commit **đã push** thì phải ghi đè lịch sử.

> Thói quen tốt: **commit thường xuyên, push theo từng cụm việc đã xong**. Mỗi lần push là một lần CI chạy, nên gom các commit liên quan rồi push một lần.

## 4. Lệnh hay dùng

| Lệnh | Dùng khi |
|---|---|
| `npx playwright test` | Chạy toàn bộ test |
| `npx playwright test tests/login.spec.ts` | Chạy 1 file |
| `npx playwright test --ui` | Mở UI Mode: xem từng bước, chạy lại từng test (**nên dùng khi học**) |
| `npx playwright test --headed` | Chạy và hiện trình duyệt lên màn hình |
| `npx playwright test --debug` | Chạy từng bước để gỡ lỗi |
| `npx playwright show-report` | Mở báo cáo HTML |
| `npx playwright codegen https://www.saucedemo.com` | Thao tác tay trên web, Playwright tự ghi thành code |

## 5. Thuật ngữ trong bài
| Thuật ngữ | Nghĩa ngắn gọn |
|---|---|
| Node.js | Môi trường chạy JavaScript/TypeScript ngoài trình duyệt |
| npm / npx | Cài thư viện / chạy công cụ |
| TypeScript | JavaScript có kiểu dữ liệu |
| Headless / Headed | Chạy trình duyệt ẩn / hiện trên màn hình |
| CI | Tự động chạy test khi push code |
| Trace | "Hộp đen" ghi lại toàn bộ quá trình chạy test |
| MCP | Cầu nối giúp AI dùng công cụ bên ngoài |
| AI agent | AI có vai trò và công cụ riêng, tự làm nhiều bước |

## 6. Câu hỏi liên quan

### Q1. Vì sao không đưa `node_modules` lên git?
**Trả lời:**
- `node_modules` rất nặng (hàng trăm MB) và **tạo lại được** bất cứ lúc nào bằng `npm ci`.
- Thứ cần lưu là **danh sách thư viện** (`package.json`) và **phiên bản chính xác** (`package-lock.json`), không phải bản thân thư viện.
- Đưa lên git sẽ làm repo phình to, clone chậm, và gây xung đột khi máy Windows và Linux cài ra file khác nhau.

### Q2. `package.json` và `package-lock.json` khác nhau thế nào?
**Trả lời:**
- `package.json`: khai báo **cần thư viện gì**, cho phép một khoảng phiên bản (vd `^1.65.1`, tức chấp nhận 1.66, 1.67…).
- `package-lock.json`: ghi **chính xác phiên bản đã cài** của từng thư viện, kể cả thư viện con.
- Nhờ file lock, máy mình, máy đồng đội và CI cài **giống hệt nhau**, tránh lỗi "máy tôi chạy được".
- Vì vậy CI dùng `npm ci` (cài đúng theo file lock) thay vì `npm install`.

### Q3. `retries` dùng để làm gì? Có nên đặt cao không?
**Trả lời:**
- `retries` cho test fail **được chạy lại** tự động. Dùng để giảm fail ngẫu nhiên do mạng hoặc môi trường trên CI.
- **Không nên đặt cao.** Retry nhiều sẽ **che giấu test chập chờn (flaky)**: test lúc pass lúc fail nhưng báo cáo vẫn xanh, nên vấn đề thật không ai thấy.
- Cách đúng: giữ thấp (0 trên máy, 1–2 trên CI), theo dõi test nào phải retry mới pass, rồi **sửa tận gốc** (thường do chờ chưa đúng hoặc test phụ thuộc nhau).

### Q4. Trace dùng để làm gì?
**Trả lời:**
- Trace là "hộp đen" ghi lại toàn bộ lần chạy test: **ảnh chụp từng bước, DOM, request mạng, log console, thời gian**.
- Dùng để **điều tra test fail trên CI mà không cần chạy lại**: tải file `trace.zip` về, mở bằng `npx playwright show-trace`, tua lại từng bước như xem video.
- Cấu hình `trace: 'on-first-retry'`: chỉ ghi trace khi test bị chạy lại, vừa có bằng chứng khi cần, vừa không làm chậm lúc bình thường.

### Q5. Headless và headed khác nhau thế nào? Khi nào dùng cái nào?
**Trả lời:**
- **Headless**: trình duyệt chạy ẩn, không hiện cửa sổ. Nhanh, nhẹ, dùng trên **CI** và khi chạy cả bộ test.
- **Headed** (`--headed`): hiện cửa sổ trình duyệt. Dùng khi **viết hoặc gỡ lỗi test**, để nhìn tận mắt test đang làm gì.
- Khi học hoặc debug, nên dùng **UI mode** (`npm run test:ui`): vừa xem được, vừa chạy lại từng test, vừa tua từng bước.

### Q6. CI là gì? Vì sao test phải chạy trên CI chứ không chỉ trên máy mình?
**Trả lời:**
- CI (Continuous Integration) tự động chạy test **mỗi khi có code mới được push**.
- Máy mình có thể "chạy được" nhờ cấu hình riêng, dữ liệu sẵn có, hệ điều hành khác. CI chạy trên **môi trường sạch**, giống nhau mọi lần, nên kết quả khách quan.
- Ai mở repo cũng thấy ngay trạng thái **xanh hoặc đỏ** (badge), và bug bị chặn **trước khi** vào nhánh chính.

### Q7. MCP và AI agent là gì? Có thay được người viết test không?
**Trả lời:**
- **MCP** là cầu nối để AI dùng công cụ bên ngoài. Ở đây AI dùng nó để **điều khiển trình duyệt thật** (mở trang, click, đọc nội dung).
- **AI agent** là AI được giao một vai trò cụ thể (vd: phân tích yêu cầu, sinh code test), có công cụ riêng và tự làm nhiều bước.
- **Không thay được người.** AI làm nhanh nhưng có thể sai mà trông vẫn rất đúng (xem [nhật ký dùng AI](../ai-log.md)). Người làm QC vẫn phải **quyết định test cái gì, duyệt kết quả, và chịu trách nhiệm**. AI giúp làm nhanh hơn, không phải thay người suy nghĩ.
