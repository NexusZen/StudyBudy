# Study Budy final engineering report

## 1. Project summary

Study Budy is a local web application that turns PDF/TXT study material, dates and availability into a daily study schedule, tracks completion, and reschedules remaining work.

## 2. Original requirements

The request required both a usable Gemini-assisted study planner and an auditable specification-driven multi-agent engineering process. The baseline contains 25 requirements and acceptance criteria in `specs/001-study-budy/`.

## 3. Agentic workflow

Actual roles were assigned to separate Codex subagents: specification; architecture; test design; frontend implementation; independent code/security review; and a fresh final verifier. The orchestrator implemented backend/core, executed QA, and integrated fixes. Some subagents changed roles at explicit stage boundaries; eight separate process identities are not claimed. See `AGENT_WORKFLOW.md` and stage reports for input artifacts, actions and evidence.

## 4. Tooling

GitHub Spec Kit 1.0.14.dev0 was initialized and its planning/task scripts executed. Node/npm, Git, Next.js, React, Zod, official Google GenAI SDK, pdf-parse, sql.js, Vitest, Playwright, ESLint, TypeScript and Prettier were actually used. The installed no-mistakes skill was read; `doctor` executed and `init` attempted. It refused because there is no origin remote. Equivalent local independent gates were executed; no no-mistakes pipeline, remote push, PR, CI or ECC execution is claimed. See `TOOLING.md`.

## 5. Generated artifacts

Constitution, role definitions, requirements, acceptance criteria, architecture, implementation plan, 20 tasks, test strategy, application source, executable tests, review probes converted to regressions, corrections ledger, command evidence, review and final-verification reports, README and tooling/workflow documentation.

## 6. Architecture

Next.js App Router serves React and Node API routes. `src/lib` contains validated schemas, transient document parsing, analyzer adapters, pure scheduler, progress calculation, service and SQLite repository. SQLite uses sql.js with serialized single-process mutation and atomic exported-file replacement. Plans are runtime validated at the persistence boundary. Plain CSS and sql.js are documented deviations from suggested Tailwind/Prisma.

## 7. Gemini usage

The server adapter uses the official SDK to request JSON topics, prerequisite structure and estimates. Input material is untrusted data separated from system instructions; no tools are available. Local validation rejects malformed, excessive, duplicate or cyclic units. Gemini does not authorize actions, control the database, generate the actual calendar or manage completion. Mocked SDK-boundary tests execute; live Gemini remains unverified without a credential. Demo mode is explicitly labeled and samples 12 lines, assigning 45 minutes each; it makes no semantic-analysis claim.

## 8. Scheduling algorithm

Validate inclusive civil dates and enumerate in UTC. Normalize estimated minutes upward. Topologically order topics, selecting ready topics by importance, difficulty and stable input order. Allocate whole-minute sessions into remaining daily capacity, splitting when necessary. Honor weekday overrides and unavailable dates. Return every residual minute as explicit overflow. Rescheduling preserves completed sessions, subtracts their workload and date capacity, and prevents dependent allocations before prerequisite completion dates. No hidden revision/buffer or global optimality claim is made.

## 9. Testing

Actual commands include `npm test`, `npm run typecheck`, `npm run lint`, `npm run format`, `npm run format:check`, `npm run build`, `npm run test:e2e`, and `npm audit --json`. Tests use fake/injected providers only. The latest orchestrator unit run passed 31 cases; independent re-review passed 20 targeted cases. Final complete results are recorded in `reports/08-final-verification.md`; historical failures remain in the correction ledger and QA report.

## 10. Review findings

R-001: blank PDF accepted due to synthetic page markers. R-002: retained future prerequisite could be scheduled after its dependent. R-003: persisted JSON needed runtime validation and durability tests. R-004: demo sampling bounds were not disclosed. All four were independently re-reviewed as resolved.

## 11. Corrections

R-001→FIX-004→actual page text→TEST-036. R-002→FIX-005→prerequisite date constraint→TEST-035. R-003→FIX-006→persisted validation→TEST-032–034. R-004→FIX-007→visible sampling disclosure. Other recorded corrections include patched Vitest, partial weekday schema, valid PDF fixture geometry, Next Link, origin handling and modal focus. Assertions were preserved; actual defects and environmental restrictions were recorded before fixes.

## 12. Traceability

Paths below are repository-relative. Final gate evidence is the independent verification report, not an inference from file existence.

| Requirement | Task            | Implementation/evidence               | Test/review                      | Fix         | Verification                                |
| ----------- | --------------- | ------------------------------------- | -------------------------------- | ----------- | ------------------------------------------- |
| REQ-001     | 001,011         | src/app/layout.tsx,page.tsx           | TEST-026                         | N/A         | Browser/final gates                         |
| REQ-002     | 005,009,010     | repository.ts,service.ts,API          | TEST-021,028,032                 | FIX-006     | Persistence/API gates                       |
| REQ-003     | 007             | documents.ts                          | TEST-019,020,031,036;R-001       | FIX-003,004 | Parser gates                                |
| REQ-004     | 008,009         | analyzer.ts,http.ts,page.tsx          | TEST-011,018,021,026;R-004       | FIX-007     | Mock/browser gates                          |
| REQ-005     | 008             | analyzer.ts                           | TEST-017                         | N/A         | Mock verified; live unverified              |
| REQ-006     | 003,008         | schemas.ts,analyzer.ts,persisted.ts   | TEST-015,016,018,025;R-003       | FIX-006     | Validation gates                            |
| REQ-007     | 007,008         | documents.ts,analyzer.ts,scheduler.ts | TEST-001,011,019,031             | FIX-004     | Source-reference gates                      |
| REQ-008     | 003,006         | schemas.ts,scheduler.ts               | TEST-002,006,009                 | N/A         | Civil-date gates                            |
| REQ-009     | 003,006         | schemas.ts,scheduler.ts,page.tsx      | TEST-003,004,015                 | FIX-002     | Capacity gates                              |
| REQ-010     | 006             | scheduler.ts,ARCHITECTURE.md          | TEST-001,013                     | N/A         | Determinism gates                           |
| REQ-011     | 006,012         | scheduler.ts                          | TEST-001,003,008,014             | FIX-002,005 | Capacity gates                              |
| REQ-012     | 006,012         | scheduler.ts                          | TEST-001,008,023                 | N/A         | Conservation gates                          |
| REQ-013     | 006             | schemas.ts,scheduler.ts               | TEST-005,006,035;R-002           | FIX-005     | Prerequisite gates                          |
| REQ-014     | 006,012         | scheduler.ts,page.tsx                 | TEST-004,008,010                 | N/A         | Overflow gates                              |
| REQ-015     | 011,014         | page.tsx,progress.ts                  | TEST-026                         | N/A         | Browser gates                               |
| REQ-016     | 012,013         | service.ts,progress.ts,API            | TEST-022,028,033                 | N/A         | Progress/persistence gates                  |
| REQ-017     | 012,013,014     | scheduler.ts,service.ts,page.tsx      | TEST-007,009,010,014,023,026,035 | FIX-005     | Reschedule gates                            |
| REQ-018     | 003,009,013,018 | errors.ts,http.ts,service.ts          | TEST-018,020,024,025,027,029,034 | FIX-009     | Error/recovery gates                        |
| REQ-019     | 008,016         | analyzer.ts,React escaping            | TEST-012,017                     | N/A         | Boundary review; no live LLM efficacy claim |
| REQ-020     | 002,007,010,013 | .gitignore,.env.example,http.ts       | TEST-020,024,029,030             | FIX-009     | Security review/gates                       |
| REQ-021     | 005,007,009     | transient parser,repository,README    | TEST-021,032                     | FIX-006     | Privacy/storage review                      |
| REQ-022     | 011,014         | page.tsx,globals.css                  | TEST-026,027                     | FIX-010     | Keyboard/browser gates                      |
| REQ-023     | 004,015,017     | tests/,configs,TESTING.md             | Full suite                       | FIX-001,003 | Independent executable gates                |
| REQ-024     | 016–020         | specs/,reports/,AGENT_WORKFLOW.md,Git | Independent review/verification  | FIX-004–010 | Audit gates                                 |
| REQ-025     | 019,020         | README,TOOLING,TESTING                | Tooling inspection/commands      | N/A         | Documentation gates                         |

## 13. Final verification

Fresh independent verification **passed**: 31 unit/integration tests across 6 files (4.34 seconds), 5 HTTP/browser tests (25.1 seconds), formatting, lint, TypeScript checking and production build. All four review findings are resolved. Scoped source and optimized browser-bundle scans found no searched secret patterns. Actual command transcripts are in `reports/evidence/`; scope and conclusions are in `reports/08-final-verification.md`. All 20 tasks are complete. The verified production application was started successfully on `http://127.0.0.1:3000`.

## 14. Remaining limitations

Local single-user, single-process deployment only; no authentication, public-host hardening, OCR, notifications or cloud deployment. Live Gemini not called without credentials. Inputs have disclosed bounds; demo mode samples rather than interpreting entire content. Model semantic correctness and resistance to all possible prompt injection cannot be guaranteed by schema tests. No external remote/PR/CI delivery is configured, and no-mistakes could not initialize without origin. These limitations are documented, not hidden behind passing offline checks.
