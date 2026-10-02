# Tasks: Study Budy

Input: spec.md, plan.md, research.md, data-model.md and contracts/api.md. TASK IDs preserve user-requested traceability. Test design precedes implementation; independent reviewers/verifier own final gates.

## Phase1 — Setup
- [ ] TASK-001 Create package/config and bounded app skeleton in package.json, tsconfig.json, next.config.ts; REQ-001,023,025.
- [ ] TASK-002 Configure ignored secrets/database and fake/server variables in .gitignore and .env.example; REQ-020,021,025.

## Phase2 — Foundation
- [ ] TASK-003 Implement shared validated types in src/core/types.ts and schemas.ts: name/subject1–120,365 dates,0–720 integer minutes/day,200 units; REQ-006,008,009,018,020.
- [ ] TASK-004 Independently design behavior/security tests in tests/scheduler.test.ts, analyzer.test.ts, service.test.ts and TESTING.md before feature coding; REQ-023,024.
- [ ] TASK-005 Implement SQLite repository with serialized atomic persistence in src/server/repository.ts; REQ-002,018,021.

## Phase3 — US1 Student creates and reads daily plan (P1)
Independent criterion: valid fake-mode TXT/PDF creates persisted capacity-safe plan with sources and overflow; invalid files/AI output never persist.
- [ ] TASK-006 [US1] Implement ISO civil dates and pure split/topological scheduler in src/core/scheduler.ts; REQ-008,009,010,011,012,013,014.
- [ ] TASK-007 [P] [US1] Implement bounded PDF/TXT parsing without source retention in src/server/documents.ts; REQ-003,007,020,021.
- [ ] TASK-008 [P] [US1] Implement injected fake and official Gemini structured analyzers in src/server/analyzer.ts with safe prompt/schema/errors; REQ-004,005,006,007,019,020.
- [ ] TASK-009 [US1] Orchestrate validated analysis/schedule/persistence in src/server/service.ts; REQ-002,004,018,021.
- [ ] TASK-010 [US1] Add create/list/retrieve/update API routes in src/app/api/plans/ with safe error envelope and same-origin mutation checks; REQ-002,018,020.
- [ ] TASK-011 [US1] Build accessible responsive creation/dashboard in src/app/page.tsx and globals.css showing provenance/provider/dates/overflow; REQ-001,015,018,022.

## Phase4 — US2 Student tracks and reschedules (P1)
Independent criterion: status persists and weighted progress updates; reschedule preserves completed work and allocates remaining+overflow without duplication.
- [ ] TASK-012 [US2] Implement weighted progress and completion-preserving reschedule in src/core/progress.ts and scheduler.ts; REQ-012,014,016,017.
- [ ] TASK-013 [US2] Add validated status/reschedule service/API in src/server/service.ts and src/app/api/plans/; REQ-016,017,018,020.
- [ ] TASK-014 [US2] Add status/progress and reschedule controls in src/app/page.tsx; REQ-015,016,017,022.
- [ ] TASK-015 [US2] Add fake browser journey and API regression tests in tests/ and playwright.config.ts; REQ-023.

## Phase5 — US3 Instructor audits development (P1)
Independent criterion: reports cite actual commands/findings/fixes and final traceability, separate verifier executes checks.
- [ ] TASK-016 [US3] Record independent code/security findings before fixes in reports/05-code-review-report.md; REQ-019,020,023,024.
- [ ] TASK-017 [US3] Execute formatter/lint/types/tests/browser/build and record actual failures/results in reports/06-test-results.md; REQ-023,024.
- [ ] TASK-018 [US3] Correct recorded causes and repeat review/checks in reports/07-fixes-report.md; REQ-018,023,024.
- [ ] TASK-019 [US3] Complete run/privacy/tooling/workflow docs in README.md, TOOLING.md, AGENT_WORKFLOW.md and implementation report; REQ-025,024.
- [ ] TASK-020 [US3] Independently execute final gates and traceability in reports/08-final-verification.md and FINAL_REPORT.md; REQ-023,024,025.

## Dependencies and parallel work
001→002→003/004→005;003/004→006/007/008;005/006/007/008→009→010→011;006→012→013→014→015; all implementation→016/017→018→019→020. TASK-007 and008 can run in parallel after schemas/tests because their files differ. Other work remains staged to preserve auditability.

## Delivery strategy
US1 is MVP; validate before US2. US3 evidence is collected throughout and completed after independent checks. Mark a task complete only with actual artifact/command evidence, never an expectation.
