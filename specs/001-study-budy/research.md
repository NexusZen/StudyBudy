# Study Budy clarification and research record

Date: 2026-10-02 (Asia/Dhaka). This record distinguishes decisions from external research. The specification agent read the user's attached full project request using PowerShell; no external technical claims were researched by this role. Architecture/tooling investigation belongs to the orchestrator/planner and must be recorded separately.

| Decision | Reason / implication |
|---|---|
| Local single-user release | Simplest maintainable university deliverable. Public authenticated multi-user deployment needs a separate security design. |
| Include rescheduling | Reasonably achievable core extension; enables the mandated completion-preservation regression tests. |
| PDF and TXT | Required PDF plus simple practical basic format; OCR/encrypted PDF support excluded with explicit errors. |
| Date-only inclusive ranges | Avoid UTC-offset/DST calendar drift; no hours-of-day scheduling needed. |
| Workload weighted progress | Splitting sessions must not distort completion percentages. |
| Explicit fake mode | Build/test/demo without live keys; label simulated analysis honestly, never silently downgrade Gemini failures. |
| Finite announced input bounds | Prevent resource exhaustion and avoid claiming arbitrary textbook scale; reject rather than silently truncate. |
| Validated structured AI data | Prose cannot safely drive persistent scheduling; optional defaults differ from malformed required fields. |
| No retained upload bytes | Privacy/data minimization; source metadata remains for usefulness. |
| No partial progress minutes | In Progress is a state; entire session remains unfinished until completed. |
| Work conservation includes overflow | Infeasible plans must retain every remaining minute and give an explicit warning. |

Open architecture decisions: technology/storage choice, exact numeric bounds, official Gemini SDK/model configuration, PDF parser, scheduling tie breaks, prerequisite normalization, revision/buffer formula and error contract. The planner must resolve these before implementation. Credentials/live Gemini access cannot be invented; contract tests substitute only for automated tests and cannot establish a real live-service success claim.

## Architecture decisions (planner, 2026-10-02)

| Decision | Rationale | Alternatives considered |
|---|---|---|
| Next.js TypeScript/Zod | One maintainable typed full-stack app | Separate backend rejected as unnecessary |
| SQLite via sql.js | Pure JS/WASM installation; SQL persistence without Windows native compilation | better-sqlite3 native build, node:sqlite experimental/version constraints; JSON file simpler but loses SQLite direction |
| Official @google/genai adapter | One provider seam plus fake tests | Scattered SDK calls rejected |
| pdf-parse + TXT | Text PDFs required, TXT simple | OCR excluded with explicit message |
| Greedy topological allocation | Explainable deterministic capacity/conservation | Global mathematical optimization unjustified |
| No revision/buffer sessions | Exact study workload conservation; student reserves time via reduced capacity | Additional revision estimates deferred |
| Finite announced bounds | Resource control without silent loss | Silent truncation rejected |
| Plain CSS | Small dashboard does not need Tailwind infrastructure | Tailwind optional recommended alternative |

Numeric bounds: 5 MiB file, 100,000 extracted text characters,200 units,365 inclusive dates,0–720 integer minutes/day,1–120 trimmed name/subject characters. Optional difficulty/importance default3. Prerequisite unknown IDs/cycles reject. Fractional estimated minutes ceil. Missing provenance pages stay absent. Zero capacity becomes explicit full overflow. These are design decisions rather than claims of executed tests or live SDK calls. Exact API usage must be checked against official SDK documentation during implementation and recorded by orchestrator; installed versions belong in lockfile.
