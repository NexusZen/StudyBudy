# Initial QA / correction ledger

2026-10-02; orchestrator QA and fix stages.
T-001: npm test failed before tests: sandbox esbuild spawn EPERM. Environment restriction; rerun escalated, no test change.
T-002: npm audit --json reported moderate Vitest/mocker path traversal GHSA-82fw-gwwq-j7x9 in Vitest3. Resolved by upgrading patched test tooling; verification pending.
FIX-001: upgrade Vitest to patched current major; retain behavior assertions.
Commands and final evidence appended after execution.
T-003: TEST-003 fails because Zod4 record(enum) requires all weekday keys, rejecting valid partial overrides. FIX-002: use partialRecord to accept only provided override weekdays while validating values.
T-004: TEST-031 PDF fixture rendered text beyond 300pt page and extracted truncated words. Test designer routes FIX-003: widen fixture page; retain full exact content assertion.
FIX-001 verified npm installation reports zero vulnerabilities after Vitest5 upgrade.
R-001 → FIX-004: inspect actual PDF page text without synthetic page markers; reject blank content.
R-002 → FIX-005: earliest dependent allocation constrained by prerequisite historical/new session dates; completed prerequisite sessions ordered before same-date new sessions.
R-003 → FIX-006: runtime persisted-plan validation and SQLite reopen/concurrency/failure tests.
R-004 → FIX-007: explicit demo sampling disclosure.
T-005 → FIX-008: Next Link for internal navigation; no lint suppression.
T-007: E2E legitimate same-origin writes returned403. Root cause Next request.url uses internal hostname different from received Host. FIX-009 compares parsed Origin to received Host and protocol; preserves cross-origin rejection. HTTP/browser suite rerun required.
T-008: keyboard-created modal did not focus Plan name. FIX-010 explicitly focus named input; React autoFocus does not guarantee queried autofocus attribute. Preserve keyboard assertion.
T-006: cold PDF worker imports exceeded default5sec under concurrent load. Integration timeout20sec, unchanged content assertions; targeted8tests passed6.61sec per independent test agent.
