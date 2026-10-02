# 03 — Test design report

Agent: independent test-design subagent. Date: 2026-10-02.

Read the user project request and `.specify/memory/constitution.md`. Coordinated scheduler, analyzer and service contracts with the architecture agent and orchestrator before application implementation. Created `TESTING.md` with layered coverage, deterministic fake-provider strategy, security cases, acceptance journey and honest evidence rules.

This strategy exists before implementation. Executable tests will follow the published numbered requirements and architecture contracts. There are no claimed passing commands at this stage: no application/test runner existed when this report was written.

Created executable Vitest scheduler contracts in `tests/scheduler.test.ts` before application implementation: TEST-001–010 and TEST-013–014 map to REQ-008 through REQ-014 and REQ-017/018. They assert minute conservation, unique sessions, dates/capacities, leap day/year boundaries, dependency rejection/order, priority tie breaking, overflow, completed-session identity preservation and capacity consumed by historical completion. TEST-011–012 in `tests/analyzer.test.ts` cover deterministic fake output/provenance and hostile-data smoke behavior. The hostile-data smoke case is not evidence of real Gemini prompt protection; the latter needs separate adapter/review evidence. The requirement/acceptance baseline was read from `specs/001-study-budy/spec.md` and `acceptance-criteria.md`.

After the orchestrator confirmed shared interfaces, added TEST-015–018 for normalization, strict AI rejection, injected Gemini request separation and provider failures; TEST-019–020 and TEST-031 for real TXT/PDF parsing and invalid/oversized/path-traversal uploads; TEST-021–025 for create/read/list, weighted progress, atomic mutation errors, status persistence, rescheduling and provider failure atomicity. Created a valid one-page PDF entirely in the test fixture without external services.

Playwright TEST-026–027 exercise the fake-mode browser workflow and invalid-upload feedback. TEST-028–030 exercise real HTTP create/retrieve/update/status, malformed input, unsupported files, missing identities and cross-origin rejection. `playwright.config.ts` uses a separate local test database and fake mode. At this design stage these are authored tests, not evidence of passes. Automated tests never use live AI. Test execution is pending implementation and dependency installation.

## QA-driven test corrections and additions

T-004 → FIX-003: actual parser extraction exposed a fixture defect: a 300-point PDF page clipped the expected sentence. Increased fixture width to 600 points and preserved the full-content assertion. Browser journey selectors now match the inspected UI and explicitly open creation/rescheduling dialogs; the journey uses keyboard activation and checks weighted progress increases after completion.

Added TEST-032–034 for SQLite reopen persistence, serialized concurrent completion updates and in-memory rollback after an intentionally failed atomic rename. Converted independent review probes into requirement-traceable regressions TEST-035–036 for preserved prerequisite chronology and blank-PDF rejection. Their original observations remain in the independent review report.

Executed `npm test -- tests/documents.test.ts tests/repository.test.ts`: sandbox startup failed with spawn EPERM; escalated rerun executed six tests, five passed and actual PDF test exceeded the default five-second timeout during cold PDF dependency loading (8.3 seconds). Raised only that integration test timeout to 20 seconds, retaining exact content assertions. Rerun evidence follows.

Rerun `npm test -- tests/documents.test.ts tests/repository.test.ts tests/review-probes.test.ts`: seven of eight passed; documents and all three repository tests passed. Blank-PDF rejection exceeded the five-second timeout during its worker's cold parser import (5.8 seconds). T-006: extended both PDF integration tests to 20 seconds, preserving rejection/content assertions. No application behavior assertion changed. Browser test now captures `reports/dashboard.png` after successfully generated material is visible; artifact exists only after successful execution reaches that point.

Final targeted rerun of the same three files passed: 3 test files, 8 tests, exit code 0, duration 6.61 seconds. This verifies FIX-003 and the independent review regressions plus actual SQLite reopen/concurrent/rollback behavior. It does not replace the orchestrator's complete-suite or independent final verification evidence.
