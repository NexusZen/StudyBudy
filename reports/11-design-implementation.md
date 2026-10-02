# Design-first UI refresh evidence

The orchestrator opened the requested getdesign.md page, executed `npx --yes getdesign@latest add bmw` (exit 0, installed root DESIGN.md), and read DESIGN.md with Get-Content before the first UI patch. The remaining reference sections were also read before implementation. Next.js bundled CSS guidance, constitution and specification were read. The original reference is retained locally.

Separate agents owned acceptance criteria, architecture/workflow mapping and test design. The orchestrator adapted corporate white/blue/navy colors, flat square controls, system typography fallback, larger readable text and responsive layouts. The expandable development-workflow explanation is truthful about this refresh and distinguishes Gemini material extraction. The local provider was changed from fake to gemini without printing credentials. The committed example was restored with an empty key.

Independent source review precedes corrections in report 10. R01: explicit typography weight overrides added; the old baseline plus adaptation remains a maintainability limitation. R02: actual retrieval/read-before-edit order is preserved here and in tool outputs, rather than inferred from the diff.

QA: npm run typecheck and npm run lint exited 0. npm test: 31 tests in 6 files passed. npm run build exited 0. The first attempt to start port 3001 preceded build completion and failed with missing production build; retry after build succeeded. Isolated production server: AI_PROVIDER=fake, DATABASE_PATH=./data/design-verification.sqlite, port 3001. No live AI calls made.

Initial isolated E2E: 3 passed, 2 failed because API tests hardcoded port 3000 Origin; expected cross-origin guard returned 403. Corrected tests to derive Origin from the configured baseURL, preserving the guard and assertions. Re-run: all 5 passed in 6 seconds.

Browser screenshots reports/design-390.png, design-768.png and design-1440.png captured populated dashboard. Measured document widths match 390, 768 and 1440 viewport widths respectively. Orchestrator visually inspected mobile and desktop screenshots. Expanded development explanation captured in design-workflow.png. Independent final verification follows separately.

Final typography correction was followed by another production build (exit 0), isolated server restart and another full E2E run: 5 passed in 6.9 seconds. Prettier check on changed source, tests, config and reports passed after formatting report 10. The user's existing port-3000 production server was restarted with the final build and configured Gemini provider. GET /api/config returned only provider=gemini; this confirms configuration, not live Gemini extraction success.

The independent verifier then recorded DESIGN-F01 before corrections: dialog closure failed to restore keyboard focus to its opening button. Fix: remove both input autoFocus attributes, allowing the dialog effect to capture the opener before focusing the form; retain the busy guard through a ref so busy-state changes do not recapture form focus. A meaningful Escape/reopen regression was added by the verifier to the existing journey. Rebuilt successfully and lint passed. Both servers were restarted for final verification; report 12 records the final rerun.
