# Study Budy

Turn study material and limited time into a manageable daily plan. Study Budy extracts topics, assigns sessions within your availability, tracks completed workload, and redistributes unfinished work before your deadline. It is a university software-engineering project with an auditable autonomous development workflow.

Live demo: [study-budy-ruddy.vercel.app](https://study-budy-ruddy.vercel.app/)

## Features

- Text-based PDF/TXT upload; source references on every session.
- Server-side Gemini structured topic analysis, or explicitly labeled offline demo analysis.
- Deterministic scheduling with prerequisite/importance/difficulty ordering, session splitting, weekday overrides, unavailable dates and explicit overflow.
- Persistent local plans, workload-weighted progress, three session statuses, and completion-preserving rescheduling.
- Responsive dashboard with today's/upcoming sessions and accessible form controls.

## Setup and running

Requires Node.js 22 and npm. In PowerShell from the repository:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open [Study Budy](http://127.0.0.1:3000). The default `AI_PROVIDER=fake` needs no key. Demo mode samples **the first 12 nonempty lines**, uses **45 minutes per line**, and limits titles to **160 characters**. It demonstrates the workflow; it does not semantically analyze the entire material. Provider identity and sampling limitations are visible before upload and on the dashboard.

For a production build:

```powershell
npm run build
npm start
```

Both development and production commands bind to `127.0.0.1`. This application has no authentication and is intended for one user on a trusted local computer. Do not expose it publicly without additional authentication, authorization, quotas and a deployment/storage security design.

## Gemini setup

Set these values in ignored `.env.local`, then restart the server:

```dotenv
AI_PROVIDER=gemini
GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-3.5-flash-lite
DATABASE_PATH=./data/study-budy.sqlite
```

The official `@google/genai` SDK runs only on the server. Gemini interprets material into locally validated structured topics; a deterministic scheduler generates the calendar. Model output cannot run tools or control storage. Live errors do not silently fall back to demo data. Live Gemini was not exercised during development because a credential was unavailable; mocked adapter tests do not establish live service success.

## Using your plan

Choose New study plan, add a name/subject and material, select inclusive start/deadline dates and daily minutes, then generate. Optional weekday values override the daily default; zero means a rest day. Enter unavailable dates as comma-separated `YYYY-MM-DD` values. Mark each session Not Started, In Progress or Completed. Only completed minutes count toward progress; unscheduled minutes remain part of remaining workload. Edit availability or reschedule from a chosen date; completed sessions retain their original identity and dates.

The scheduler is an explainable greedy allocator, not a claim of globally optimal learning. It applies prerequisites first, then importance/difficulty and stable input order. There is no hidden revision/buffer allocation: reserve revision time by reducing available daily minutes.

## Limits and privacy

Uploads are at most 5 MiB; extracted material at most 100,000 characters; structured analysis at most 200 topics; plans at most 365 inclusive days; daily capacity 0–720 integer minutes. Large inputs are rejected rather than silently truncated. OCR, scanned/image-only PDFs, encrypted PDFs, accounts, notifications and LMS integration are excluded. Page numbers are omitted when provenance cannot reliably establish them.

Original upload bytes and extracted text are processed in memory and not retained in plan storage. Live Gemini mode sends extracted material to Google; choose material you are authorized and comfortable to transmit. Stored local SQLite data includes names, topics, source references and progress. The single-process sql.js repository serializes mutations and writes exported SQLite bytes atomically; multiple server workers/shared storage are unsupported. Local data and environment files are ignored by Git. Back up the configured SQLite file while the server is stopped if needed.

## Testing

```powershell
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
npx playwright install chromium
npm run test:e2e
```

Tests use fake/injected analyzers and do not call paid Gemini. See [TESTING.md](TESTING.md), actual QA results in `reports/06-test-results.md`, and independent verification in `reports/08-final-verification.md` when available. Final gate results must be read from the executed evidence, not inferred from this command list.

## Architecture and repository

Next.js/React serves the dashboard and Node API. `src/lib/` contains schemas, document extraction, AI adapters, scheduler, progress, persistence and service orchestration. `src/app/api/` validates HTTP boundaries. SQLite through sql.js supports portable local persistence. See [ARCHITECTURE.md](ARCHITECTURE.md) and `specs/001-study-budy/contracts/api.md`.

| Path                    | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `.specify/`             | Initialized Spec Kit templates/scripts and constitution            |
| `.agents/skills/`       | Installed Codex Spec Kit integration skills                        |
| `specs/001-study-budy/` | Requirements, acceptance, design, contracts and task IDs           |
| `src/`                  | Application                                                        |
| `tests/`                | Behavior, parser, analyzer, service, persistence and browser tests |
| `reports/`              | Stage evidence, findings, fixes and verification                   |

## Agentic development evidence

The actual workflow was Specification → Planning → Test Design → Implementation → Independent Review → QA → Fixes → Re-review/Re-test → Independent Final Verification. Separate delegated agents produced requirements, architecture and test design; stage roles were explicitly reassigned where appropriate. The orchestrator integrated backend/QA/fixes, and a separate verifier evaluates final evidence. Eight role names do not imply eight distinct process instances.

Start with [PROJECT.md](PROJECT.md), [AGENTS.md](AGENTS.md), [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md), [TOOLING.md](TOOLING.md), the numbered reports, and `FINAL_REPORT.md` when final verification is complete. Reports retain failures and corrections instead of presenting only a final green result.
