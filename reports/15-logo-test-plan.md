# Logo and Gemini verification plan

Date: 2026-10-03. Role: separate test design. This report records inspection and planned checks; it does not claim execution.

## Evidence inspected

Read the constitution, current specification REQ-026–028, analyzer implementation, injected analyzer tests, primary Playwright journey, browser configuration, and logo references in page/CSS. No environment secrets were read and no live provider request was made.

## Verification criteria

- REQ-026: At 1440px and 390px, the supplied logo loads with nonzero natural dimensions, retains its square aspect ratio, and fits the header without horizontal page overflow. The home link remains named Study Budy through visible text; the accompanying decorative image may have empty alt text. Compare the served asset with the user-supplied PNG or record an exact file hash match.
- REQ-027: The student page contains no disclosure text “How AI designed this workspace” and no accessible disclosure control with that name. Check the DOM as well as the screenshot. DESIGN.md and AGENT_WORKFLOW.md should retain provenance.
- REQ-028: Offline injected generators cover 401/403, 404, 429, 400 and 503 classification. Assert public AppError code, expected HTTP status, and actionable fixed message; include a secret sentinel in raw upstream errors and assert it is absent publicly. Reject failures without returning fake units. Existing tests currently assert code/redaction; status/message assertions would strengthen that new coverage.
- Malformed JSON, empty/oversized responses and invalid units must reject. Preserve existing AppError validation failures. Automated tests use injected generators or explicit fake provider; they must not read .env.local or call Gemini.
- Run existing lint, typecheck, unit checks and build after final changes. Run the fake-provider browser journey in its isolated database/server configuration; do not substitute a live production server for those tests.
- Any live diagnostic is a separate user-authorized manual integration check, not an automated test. Record only model identifier, HTTP status or sanitized fixed error category, and outcome. Successful key loading alone does not prove successful extraction. If quota or authorization blocks the request, report that external cause and retain the distinction between corrected feedback and working live analysis.

## Execution record

This role used shell reads/searches and wrote this report. No application/test edits, test execution, environment inspection, or live calls were performed.
