# Playwright AI QA Portfolio 🎭🤖

[![Playwright Tests](https://github.com/MyHanhYuuki/playwright-ai-qa-portfolio/actions/workflows/playwright.yml/badge.svg)](https://github.com/MyHanhYuuki/playwright-ai-qa-portfolio/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.65-2EAD33?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

End-to-end & API test automation with **Playwright + TypeScript**, driven by an **AI agent QA pipeline**
built on Claude Code subagents + **Playwright MCP** (agents work on a real browser).

📋 **Start here:** [Project overview & test plan (Vietnamese)](docs/tong-quan-du-an.md): goals, tools, systems under test, scope, roadmap, deliverables.

## AI agent QA pipeline
```
requirement → [1] test-design → ⏸ HITL#1 → [2] test-impl → ⏸ HITL#2
            → [3] script-gen → [4] executor ─┬─ script-issue → [5] healer → re-run (max 2 rounds)
                                             ├─ real-bug → ⏸ HITL#3 → defects.md
                                             └─ pass → rtm-report.html (traceability matrix)
```
| Agent | Role | Playwright MCP |
|---|---|---|
| `test-design` | Review requirement, explore the site, build test viewpoints | browser exploration |
| `test-impl` | Design test cases (EP, BVA, decision table, state transition) + test data | – |
| `script-gen` | Generate Page Object Model tests, locators verified on the live site | browser + generator log |
| `executor` | Run tests, triage failures: flaky / script-issue / real-bug | – |
| `healer` | Fix script issues only (never hides real bugs), max 2 rounds | test debug + locator tools |
| `qa-reviewer` | QC-lead review (ISTQB) after every step, before each human checkpoint | verification on the live site |

Run the whole pipeline in Claude Code: `/qa-orchestrator <feature>`
📊 Diagrams: [workflow (Markdown)](docs/ai-agent-workflow.md) · [interactive (HTML)](docs/ai-agent-workflow.html)

> Evolved from v1 [learn-ai-automation-test](https://github.com/MyHanhYuuki/learn-ai-automation-test):
> same QA process, agents upgraded with Playwright MCP for real-browser locator checks and debugging.

## Systems under test
| App | Type | Scope |
|---|---|---|
| [SauceDemo](https://www.saucedemo.com) | E-commerce UI | Login, inventory, cart, checkout |
| [Restful Booker](https://restful-booker.herokuapp.com) | REST API | Auth, CRUD bookings |
| [The Internet](https://the-internet.herokuapp.com) | UI edge cases | iframes, alerts, uploads, dynamic content |

## Run locally
```bash
npm ci
npx playwright install chromium
npm test                     # run all tests
npm run test:smoke           # smoke check only (site is up)
npm run test:ui              # interactive UI mode
npm run report               # open HTML report
```
Optional environment variables: see [.env.example](.env.example).

## Project structure
```
.claude/agents/      5 QA agents          .claude/commands/   /qa-orchestrator
qa-runs/<feature>/   requirement, viewpoints, test cases, triage, defects, RTM
tests/               pages/ (POM) · specs/ · data/ · fixtures/
knowledge-base/                  Q&A archive reused across features
docs/                workflow diagrams, learning notes
```

## AI usage log
How AI was used and **controlled**: what it did, where it was wrong, how it was verified: [docs/ai-log.md](docs/ai-log.md)

## Learning notes (Vietnamese)
📖 Glossary: [docs/thuat-ngu.md](docs/thuat-ngu.md)

Step-by-step notes written while building this project with an AI agent:
0. [Lời dặn trước khi bắt đầu](docs/learning/00-loi-dan-truoc-khi-bat-dau.md)
1. [Cấu trúc dự án Playwright](docs/learning/01-cau-truc-du-an.md)
2. [Phân tích yêu cầu (test-design) và HITL #1](docs/learning/02-phan-tich-yeu-cau.md)
3. [Thiết kế test case (test-impl) và HITL #2](docs/learning/03-thiet-ke-test-case.md)
4. [Viết code test (script-gen) theo Page Object Model](docs/learning/04-viet-code-test.md)
5. [Chạy test và phân loại kết quả (executor)](docs/learning/05-chay-test-va-phan-loai.md)
7. [Viết bug report và RTM](docs/learning/07-bug-report-va-rtm.md) (Bài 6 healer: bỏ qua lần này vì không có test hỏng)

## Progress
- [x] Project setup (Playwright 1.65, Chromium, Playwright MCP)
- [x] AI agent QA pipeline (5 agents + reviewer + orchestrator + 3 HITL)
- [x] SauceDemo Login: full pipeline run ([bug reports](qa-runs/saucedemo-login-screen/defects.md) · [RTM](qa-runs/saucedemo-login-screen/rtm.md))
- [ ] SauceDemo Cart → Checkout
- [ ] Bug reports (problem_user, error_user…)
- [ ] API tests (Restful Booker)
- [ ] CI + published report
