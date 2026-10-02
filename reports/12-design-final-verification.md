# 12 — Independent design final verification

Date: 2026-10-02. Separate final-verification agent. Read constitution, specification, DESIGN.md, reports 09/10/11, current page/API-test diffs and relevant UI source. No environment-file reads or Gemini requests.

## Findings recorded before fixes

DESIGN-F01 — P2 keyboard recovery: at 390, 768 and 1440px, keyboard Enter on the visible New study plan button opens the dialog and focuses Plan name; Shift+Tab stays within the dialog; Escape closes it. Focus fails to return to the opener, including after a 150ms wait. Reported to orchestrator before any fix. Current verification is conditional on correcting and rechecking this finding.

## Executed evidence

- npm run typecheck: exit 0.
- npm run lint: exit 0.
- GET isolated http://127.0.0.1:3001/api/config returned provider fake. Browser script only used this fake production server; no material submitted or live AI invoked.
- Populated dashboard document widths equal viewport widths 390, 768 and 1440; no horizontal document overflow. Create modal also has no horizontal document overflow at each width.
- Visually inspected final-design-390.png, final-design-768.png, final-design-1440.png: white canvas, navy hero, blue primary CTA, square flat cards and controls, coherent stacking, no observed overlap. At tablet the reschedule label wraps within its button.
- Intercepted GET /api/plans with [] in browser only. Visually inspected final-design-empty-1440.png: clear empty state and available creation actions; no data changed.
- Expanded workflow text names reading BMW DESIGN.md first, then mapping tokens, then implementing/reviewing. It explicitly says this is the development workflow and separately describes Gemini material analysis. Captured final-design-workflow.png.
- Initial browser script targeted a sidebar action hidden at390 and timed out. Corrected verifier to target visible New study plan, then completed all checks. This was a verifier selector issue.

Script: final-design-browser.cjs. Structured results: final-design-browser-results.json. Screenshots retained alongside this report. Build/unit/E2E results in report11 belong to orchestrator; this agent has not independently rerun them. No full contrast audit, exhaustive focus traversal, long-name stress test or live Gemini verification claimed.

## Correction and independent recheck

Orchestrator corrected DESIGN-F01 after the finding: removed input autoFocus because the modal effect already sets initial focus; retained the opener across busy changes through a busy ref. Verifier added a meaningful regression to TEST-026: Escape closes, original create button is focused, Enter reopens and Plan name is focused before the existing creation/status/rescheduling journey.

Reran final-design-browser.cjs against rebuilt fake port3001: all three widths now return initialFocus=true, modalOverflow=true, contained=true, closed=true and restored=true. Document widths remain exactly390/768/1440. Structured JSON and screenshots replaced with final-run evidence. DESIGN-F01 resolved by independent executable recheck.

Independent final E2E: npx playwright test --config playwright.design.config.ts exited0, all5 tests passed in14.5s, including added focus recovery regression. The suite used the explicitly fake isolated production server; no Gemini calls. Final disposition: no remaining blocking finding for the requested design refresh; stylesheet duplication remains the nonblocking maintainability item documented in report10. Live Gemini execution remains unverified.
