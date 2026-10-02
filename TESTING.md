# Study Budy testing

## Strategy established before implementation

Tests use Vitest and injected fake AI providers. No automated test may call Gemini, require an API key, or make paid requests. Scheduler tests assert calendar dates, capacity, dependency order, conservation of minutes, explicit overflow and completed-session preservation. Analyzer tests cover strict schemas, malformed provider responses, provider failures and untrusted document content. Service/API tests cover plan persistence, status transitions, weighted progress, input validation and rescheduling.

Every significant test name includes a requirement ID from `specs/001-study-budy/spec.md`. Tests are written against architecture contracts, independently of implementation. Assertions must not be weakened to make failing behavior pass. Review findings are recorded before fixes.

## Required checks

Run `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Run `npm run test:e2e` for real HTTP and primary browser tests with the fake provider: upload material, configure dates/capacity, generate schedule, mark a session complete, inspect updated progress and reschedule. Playwright starts a local server and uses a separate database. QA records exact commands and outputs in `reports/06-test-results.md`; independent final verification records its own executable evidence in `reports/08-final-verification.md`.

## Test layers

| Layer | Cases |
|---|---|
| Scheduler | Inclusive civil dates; leap day; invalid dates; start after end; one day; unavailable days; weekday overrides; zero capacity; long-topic splits; overflow; prerequisite order/cycles; no lost/duplicated minutes; completed work retained on reschedule |
| Analysis | Valid structured units; missing/invalid fields; duplicate IDs; unknown dependencies; malicious material as data; fake provider determinism; provider rejection; PDF/text parsing failures |
| Service/API | Create/read/update; not found; invalid numeric/date values; empty/unsupported/oversized files; filename safety; complete/in-progress transitions; weighted progress and remaining workload; reschedule persistence |
| Browser | Main journey and visible fake-mode label; validation/error feedback; readable schedule and completion controls |
| Security review | Server-only key usage; no secret-bearing responses; no filesystem path construction from filenames; bounded upload/body/text size; escaped rendering |

## Evidence and limitations

At test-design time no application, dependencies, or test runner exist, so no execution success is claimed. Later reports must distinguish implemented automated coverage, executed browser checks, review-only checks and unresolved limitations. Live Gemini behavior is deliberately excluded from automated tests; its adapter is tested using injected HTTP responses where practical.
