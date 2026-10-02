# 03 — Test design report

Agent: independent test-design subagent. Date: 2026-10-02.

Read the user project request and `.specify/memory/constitution.md`. Coordinated scheduler, analyzer and service contracts with the architecture agent and orchestrator before application implementation. Created `TESTING.md` with layered coverage, deterministic fake-provider strategy, security cases, acceptance journey and honest evidence rules.

This strategy exists before implementation. Executable tests will follow the published numbered requirements and architecture contracts. There are no claimed passing commands at this stage: no application/test runner existed when this report was written.

Created executable Vitest scheduler contracts in `tests/scheduler.test.ts` before application implementation: TEST-001–010 and TEST-013–014 map to REQ-008 through REQ-014 and REQ-017/018. They assert minute conservation, unique sessions, dates/capacities, leap day/year boundaries, dependency rejection/order, priority tie breaking, overflow, completed-session identity preservation and capacity consumed by historical completion. TEST-011–012 in `tests/analyzer.test.ts` cover deterministic fake output/provenance and hostile-data smoke behavior. The hostile-data smoke case is not evidence of real Gemini prompt protection; the latter needs separate adapter/review evidence. The requirement/acceptance baseline was read from `specs/001-study-budy/spec.md` and `acceptance-criteria.md`.

After the orchestrator confirmed shared interfaces, added TEST-015–018 for normalization, strict AI rejection, injected Gemini request separation and provider failures; TEST-019–020 and TEST-031 for real TXT/PDF parsing and invalid/oversized/path-traversal uploads; TEST-021–025 for create/read/list, weighted progress, atomic mutation errors, status persistence, rescheduling and provider failure atomicity. Created a valid one-page PDF entirely in the test fixture without external services.

Playwright TEST-026–027 exercise the fake-mode browser workflow and invalid-upload feedback. TEST-028–030 exercise real HTTP create/retrieve/update/status, malformed input, unsupported files, missing identities and cross-origin rejection. `playwright.config.ts` uses a separate local test database and fake mode. At this design stage these are authored tests, not evidence of passes. Automated tests never use live AI. Test execution is pending implementation and dependency installation.
