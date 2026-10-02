# Independent code and security review

Stage: independent review before fixes. Owner: Architecture Agent reassigned as Code/Security Reviewer (did not implement application; not final verifier). Date:2026-10-02 Asia/Dhaka. Input: constitution/specification/architecture and source files src/lib/{scheduler,repository,schemas,service,analyzer,documents,http,types}.ts, API handlers, page.tsx and independent tests. Actual layout src/lib combines planned core/server modules; this is an equivalent boundary arrangement, not itself a defect.

Actions/commands: rg --files src tests; Get-Content source/test files; wrote tests/review-probes.test.ts to reproduce two behaviors without changing application code; npm test -- --run tests/review-probes.test.ts failed startup spawn EPERM in sandbox; retried require_escalated and Vitest reported1 file/2 tests passed,6.84s. Probe assertions deliberately establish existing defects, not correct acceptance behavior. They must be converted into corrected regressions by Fix Agent. No live Gemini was called. No source fix was performed.

## R-001 — Blank/image-only PDF accepted as readable content

Severity:High. File:src/lib/documents.ts. REQ-003,018,021. Status:OPEN.

PDF parser getText() adds synthetic page-number marker text to parsed.text. A valid one-page PDF with empty content stream was accepted by extractDocument; probe asserts returned text contains1. The current Unicode letter/number check passes that marker even when page content contains no readable material. This creates bogus topics/schedule for blank or scanned pages. Use actual page text content or disable/remove parser separators before readable validation. Add real empty-page PDF and scanned-like regression asserting rejection. Existing happy PDF fixture test does not cover this.

## R-002 — Reschedule can invert prerequisite calendar order

Severity:High. File:src/lib/scheduler.ts allocate/reschedule. REQ-013,017. Status:OPEN.

Completed sessions are counted as globally finished without considering their preserved date. A60-minute Base session completed on2026-10-03 plus dependent60-minute Dep and reschedule from2026-10-01 creates Dep on2026-10-01, before Base's preserved calendar session. Executable probe establishes this. Honor retained prerequisite completion dates when placing dependent residual work (same-day sequence only if prerequisite work is earlier), or reject inconsistent historical calendars explicitly. Test preserved future prerequisite and partial prerequisite completion; retain minute conservation and capacity.

## R-003 — Persisted payload lacks schema/invariant validation

Severity:Medium. File:src/lib/repository.ts read/list/save/mutate. REQ-018,020. Status:OPEN.

SQLite payloads are JSON.parse(...) as Plan without runtime validation. Writes likewise accept arbitrary typed values. The architecture/data model explicitly promise validated repository boundaries. A syntactically valid but malformed disk payload can reach dashboard/service with invalid sessions, progress or unit data; malformed JSON becomes a generic error without diagnosing persisted corruption. Add a complete persisted plan schema and relevant accounting/identity checks, safely reject corrupt data without overwriting it; validate outgoing plans. Add SQLite restart/corrupt-payload tests. Existing service tests exclusively use MemoryRepository, so actual restart/persistence rollback and concurrent mutation behavior lack direct unit/integration coverage (browser HTTP journey alone does not prove restart).

## R-004 — Fake interpretation silently samples/truncates material

Severity:Medium. File:src/lib/analyzer.ts FakeStudyMaterialAnalyzer. REQ-004,021,025. Status:OPEN.

Fake uses lines.slice(0,12) and title.slice(0,160) without warning; source material within allowed upload/text bounds can be silently omitted. Labeling demo mode explains AI simulation, but the visible plan does not disclose that only first12 nonempty lines are sampled and45 minutes is invented per topic. Either process all allowed units/reject over-limit sample material, or surface explicit sampling policy/warning in UI and docs so no full-material coverage is implied. Add a13-line and long-line regression for chosen policy. This finding concerns honesty of the offline demo rather than live Gemini semantics.

## Other reviewed boundaries

Structured output validates IDs, workload, finite bounds and dependency graph; prompt separates untrusted data from system instructions with empty tools. SDK key remains server-side; live provider failures do not fallback. Upload filenames are never paths; request-body bounds and cross-site origin checks are present. Civil dates are UTC and initial schedule preserves capacity/overflow. SQLite mutations serialize and attempt rollback on failed file replacement; however direct persistence failure/restart tests are still required. These observations are source inspection, not a full executable security guarantee.

Result:4 open findings routed to orchestrator Fix Agent before any corrections. Next stage: recorded fixes and new regressions, QA, independent re-review and separate final verification. Build/lint/typecheck were not run by this reviewer and are not claimed here.
