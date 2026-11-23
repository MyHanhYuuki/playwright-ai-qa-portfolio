# Playwright AI QA Portfolio 🎭🤖

End-to-end & API test automation with **Playwright + TypeScript**, built with an **AI agent workflow**
(Claude Code + Playwright MCP + Playwright Test Agents: planner / generator / healer).

## Systems under test
| App | Type | Scope |
|---|---|---|
| [SauceDemo](https://www.saucedemo.com) | E-commerce UI | Login, inventory, cart, checkout |
| [Restful Booker](https://restful-booker.herokuapp.com) | REST API | Auth, CRUD bookings |
| [The Internet](https://the-internet.herokuapp.com) | UI edge cases | iframes, alerts, uploads, dynamic content |

## Tech stack
- Playwright Test (TypeScript), Page Object Model, fixtures
- Playwright Test Agents (`.claude/agents/`) + MCP
- GitHub Actions CI, HTML report

## Run locally
```bash
npm ci
npx playwright install chromium
npx playwright test          # run all tests
npx playwright show-report   # open HTML report
```

## Project structure
```
docs/        test plan, test cases, bug reports, AI usage log
specs/       AI-generated test plans (planner agent)
tests/       Playwright tests
```

## AI agent workflow
How the AI agents (planner / generator / healer) and the human work together: [docs/ai-agent-workflow.md](docs/ai-agent-workflow.md)

## Learning notes (Vietnamese)
Step-by-step notes written while building this project with an AI agent:
1. [Cấu trúc dự án Playwright](docs/learning/01-cau-truc-du-an.md)

## Progress
- [x] Project setup (Playwright 1.65, Chromium, AI agents)
- [ ] SauceDemo: test plan & test cases
- [ ] SauceDemo: UI tests (POM)
- [ ] Bug reports
- [ ] API tests (Restful Booker)
- [ ] CI + published report
