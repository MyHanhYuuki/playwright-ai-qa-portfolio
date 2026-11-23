# Playwright AI QA Portfolio 🎭🤖

End-to-end & API test automation with **Playwright + TypeScript**, driven by an **AI agent QA pipeline**
built on Claude Code subagents + **Playwright MCP** (agents work on a real browser).

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
npx playwright test          # run all tests
npx playwright test --ui     # interactive UI mode
npx playwright show-report   # open HTML report
```

## Project structure
```
.claude/agents/      5 QA agents          .claude/commands/   /qa-orchestrator
qa-runs/<feature>/   requirement, viewpoints, test cases, triage, defects, RTM
tests/               pages/ (POM) · specs/ · data/ · fixtures/
kb/                  Q&A archive reused across features
docs/                workflow diagrams, learning notes
```

## Learning notes (Vietnamese)
Step-by-step notes written while building this project with an AI agent:
1. [Cấu trúc dự án Playwright](docs/learning/01-cau-truc-du-an.md)

## Progress
- [x] Project setup (Playwright 1.65, Chromium, Playwright MCP)
- [x] AI agent QA pipeline (5 agents + orchestrator + 3 HITL)
- [ ] SauceDemo Login: full pipeline run
- [ ] SauceDemo Cart → Checkout
- [ ] Bug reports (problem_user, error_user…)
- [ ] API tests (Restful Booker)
- [ ] CI + published report
