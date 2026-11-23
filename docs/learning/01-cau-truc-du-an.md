# Bài 1: Cấu trúc dự án Playwright

> Sổ tay học tập: ghi lại những gì đã làm và đã hiểu, để sau này đọc lại vẫn hiểu.

## 1. Dự án được tạo như thế nào

| Lệnh | Tác dụng |
|---|---|
| `npm init playwright@latest -- --lang=ts --browser=chromium --gha` | Tạo khung dự án Playwright: dùng TypeScript, trình duyệt Chromium, kèm file CI cho GitHub Actions |
| `npx playwright init-agents --loop=claude` | Tạo 3 AI agent của Playwright để dùng với Claude Code |
| `npx playwright test` | Chạy tất cả test |

- **npm**: công cụ quản lý thư viện của Node.js, dùng để tải, cài và cập nhật thư viện.
- **npx**: chạy một công cụ đã cài trong dự án, ví dụ `npx playwright ...`.

## 2. Cây thư mục

```
playwright-ai-qa-portfolio/
├── .claude/agents/          # Định nghĩa 3 AI agent của Playwright
│   ├── playwright-test-planner.md     # Lập kế hoạch test (khám phá web, liệt kê scenario)
│   ├── playwright-test-generator.md   # Sinh code test từ kế hoạch
│   └── playwright-test-healer.md      # Tự sửa test bị hỏng (khi UI thay đổi)
├── .github/workflows/
│   └── playwright.yml       # CI: GitHub tự chạy test mỗi khi push code
├── docs/                    # Tài liệu: sổ tay học, test case, bug report, nhật ký dùng AI
├── specs/                   # Kế hoạch test do AI planner viết (file .md)
├── tests/                   # File test, đuôi .spec.ts
│   ├── example.spec.ts      # Test mẫu Playwright tạo sẵn (sẽ xóa sau)
│   └── seed.spec.ts         # Test "hạt giống": điểm bắt đầu cho AI agent
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
| `trace: 'on-first-retry'` | Khi test chạy lại lần đầu, ghi **trace** (ảnh từng bước, network, console) để điều tra lỗi |
| `projects: [chromium]` | Chạy trên Chrome desktop. Sau này có thể thêm Firefox, WebKit (Safari), mobile |

### `tests/*.spec.ts`: file test
- `spec` = specification: đặc tả hành vi cần kiểm tra.
- `.ts` = TypeScript, tức JavaScript có thêm **kiểu dữ liệu**, giúp phát hiện lỗi gõ sai ngay khi viết.

### `.github/workflows/playwright.yml`: CI
- **CI (Continuous Integration)**: mỗi lần push code, GitHub tự dựng máy ảo, cài thư viện, chạy toàn bộ test và lưu báo cáo.
- Nhờ vậy, ai mở repo cũng thấy test đang **pass (xanh)** hay **fail (đỏ)**.

### `.mcp.json` và `.claude/agents/`: phần AI
- **MCP (Model Context Protocol)**: giao thức giúp AI (Claude) dùng được công cụ bên ngoài, ở đây là điều khiển trình duyệt thật.
- **AI agent**: AI được giao một vai trò cụ thể, có công cụ riêng và tự làm nhiều bước:
  - `planner`: mở web, tự click khám phá, viết kế hoạch test vào `specs/`
  - `generator`: đọc kế hoạch, sinh code test vào `tests/`
  - `healer`: chạy test, test nào fail vì UI đổi thì tự tìm nguyên nhân và sửa

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
- **Vì sao không đưa `node_modules` lên git?** Vì nó nặng và tải lại được bằng `npm ci`. Phiên bản đã được khóa trong `package-lock.json`.
- **`retries` dùng để làm gì? Có nên đặt cao không?** Để giảm fail ngẫu nhiên trên CI, nhưng đặt cao sẽ **che giấu test chập chờn (flaky)**. Nên giữ thấp và sửa tận gốc.
- **Trace dùng để làm gì?** Để điều tra test fail trên CI mà không cần chạy lại: xem ảnh từng bước, request mạng, log console.
