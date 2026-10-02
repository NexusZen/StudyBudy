# Study Budy architecture

Architecture stage, 2026-10-02. This design targets a local, single-user Node.js web application. It is not a public multi-tenant service.

## Boundaries

Next.js App Router serves the React dashboard and Node runtime API routes. Shared Zod schemas define validated public inputs and structured topic output. Server-only modules implement document parsing, the analyzer, persistence and orchestration; the deterministic scheduler has no SDK, network, storage or current-clock dependency. React receives plan data, never environment secrets.

```text
Dashboard → API validation → Plan service → SQLite repository
                               │
                               ├→ Document parser → Analyzer → Validated units
                               └→ Pure scheduler → Sessions + overflow warning
```

Actual modules: `src/lib/types.ts`, `schemas.ts`, `scheduler.ts`, `progress.ts`, `documents.ts`, `analyzer.ts`, `repository.ts`, `persisted.ts`, `http.ts`, `errors.ts` and `service.ts`; HTTP handlers under `src/app/api/plans/`. The shared lib directory combines the originally planned core/server folders while preserving pure scheduler and server-integration boundaries. Tests inject a fake analyzer and isolated repositories.

## Storage and privacy

Use SQLite through sql.js. It avoids Windows native compilation while retaining a queryable local database. Store each plan as a versioned validated JSON document in a `plans(id PRIMARY KEY, payload)` table using parameter binding. Serialize read-modify-write operations within the single process. Persist exported SQLite bytes with a sibling temporary file and atomic rename; do not acknowledge a mutation before persistence succeeds. An initialization singleton prevents concurrent first-load databases. Production hosting must use one process and persistent local storage. Multiple workers/shared network storage are outside this design; use a conventional SQLite driver or managed database for that deployment.

Keep file bytes and extracted source text in memory during analysis and discard afterward. Retain sanitized source filename, structured topics and schedules only. Ignore local databases and environment files in Git. Do not store real credentials.

## Document and AI boundary

Support PDF and UTF-8 TXT, at most 5 MiB per file. Validate extension, media type and PDF signature, bound extracted text to 100,000 characters, reject empty/non-readable/scanned documents with an actionable error, and never use supplied names as filesystem paths. No OCR is promised. Do not silently truncate textbooks; explain the limit and ask the student to provide smaller sections.

`StudyMaterialAnalyzer.analyze({text,fileName})` returns validated `StudyUnit[]`. `GeminiStudyMaterialAnalyzer` is the only module using the official `@google/genai` SDK. Request JSON structured output, separate developer instructions from clearly labeled untrusted material, give the model no tools, and enforce local schemas regardless of model schema hints. Normalize optional workload metadata explicitly; reject malformed output, duplicate IDs, invalid prerequisite graphs and invalid provenance. Page ranges are optional; omit unsupported pages and never invent them. `FakeStudyMaterialAnalyzer` produces reproducible sample topics and the UI displays a Demo badge whenever it is selected. There is no automatic fallback that conceals a live-provider failure.

The model is configurable with `GEMINI_MODEL`; the API key is server-only `GEMINI_API_KEY`. Provider failures become safe application errors; never return SDK exception objects or credentials. Automatic tests use injected fake providers exclusively.

## Scheduling algorithm

Use inclusive ISO civil dates (`YYYY-MM-DD`) validated by round-trip UTC construction. Reject invalid dates, reversed periods and periods over 365 days. Enumerate calendar days in UTC so daylight saving time cannot change allocation. Weekday overrides take precedence over default daily minutes; explicitly unavailable dates have zero capacity. Capacity is an integer 0–720 minutes/day; wholly zero capacity produces full overflow and an infeasibility warning.

Normalize fractional positive workload estimates upward to whole minutes. Each unit has a fixed workload; `estimatedMinutes` is the workload estimate supplied by semantic analysis. Difficulty and importance are metadata and ordering signals, not multipliers applied twice. Validate unit IDs and prerequisites first, reject unknown dependencies and cycles. A deterministic topological order selects ready units by higher importance, then higher difficulty, then original input order. Consume each unit fully before its dependents; same-day consecutive sessions are valid prerequisite order. Split units across positive-capacity dates using `min(remaining workload, remaining date capacity)`. Never exceed daily capacity. Return residual `unscheduledMinutes` and a clear warning rather than dropping work or assigning beyond the deadline. No mathematical optimality claim is made: this is an explainable greedy allocator.

Sessions retain unit identity, title, source reference, minutes, date and status. All session minutes plus overflow must equal input minutes. Empty dates may be shown in the calendar but do not create sessions. Deterministic session IDs include date, unit identity and sequence. This release adds no automatic revision sessions and reserves no hidden buffer: students can reduce available minutes to reserve revision/rest time; all modeled workload is explicit.

## Progress and rescheduling

Statuses are `not_started`, `in_progress`, `completed`. In progress contributes zero completed minutes. Percent completion is completed session minutes divided by total unit workload, including unscheduled workload; remaining minutes are total minus completed minutes. Zero workload gives zero percent rather than division by zero.

Rescheduling accepts an explicit `fromDate` rather than reading the system clock. Completed sessions keep IDs, dates, minutes and status. Subtract completed minutes per unit, clear unfinished allocations, then allocate residual work on dates at or after `fromDate`, respecting new capacities and existing completed minutes on those dates. Preserve units with residual overflow so they can be scheduled later. Reject malformed completed totals, unknown unit IDs and configurations that put preserved completed sessions beyond changed plan boundaries. In-progress work is treated as unfinished. Rescheduling after the deadline preserves completion and reports remaining work as unscheduled.

## API and security

APIs create/list/retrieve/update plans, update session status and reschedule remaining work. Multipart creation contains one `file` and JSON `config`. JSON error envelope is `{error:{code,message}}`; validation 400, unsupported upload 415, too large 413, missing record 404, provider failure 502/503 and unexpected persistence failures 500 with a safe message. Do not expose raw stack traces. Bound request bodies before analysis, validate every mutation, reject unknown statuses and apply same-origin checks to mutations. IDs are opaque; there is no authentication because deployment is local only. Public deployment would require authentication, authorization, rate limiting, request quotas and durable concurrency support.

## Verification seams

Pure scheduler tests check conservation, capacity, civil dates, dependency order, overflow and rescheduling. Parser tests exercise actual PDF fixture extraction and malformed files. Analyzer tests stub SDK responses at the boundary and validate schema rejection and prompt separation. Service/repository tests use temp databases and fake analyzers. A browser test exercises creation through completion with demo mode. Independent reviewers and final verification are separate roles from this architect and implementation.
