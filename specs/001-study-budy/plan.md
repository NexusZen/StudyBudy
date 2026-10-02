# Implementation Plan: Study Budy

**Branch**: feat/study-budy (feature state 001-study-budy) | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

## Summary

Implement local single-user PDF/TXT study planning, structured Gemini/fake analyzers, deterministic calendar, persistent completion and rescheduling. See ../../ARCHITECTURE.md.

## Technical Context

**Language/Version**: TypeScript, Node.js 22.18.0 and npm 10.9.3 observed.
**Primary Dependencies**: Next.js, React, Zod, official @google/genai, pdf-parse, sql.js. Lockfile records installed versions. Plain CSS replaces optional Tailwind; no ORM for one table.
**Storage**: SQLite via sql.js, serialized writes and atomic file replacement; one server process and persistent disk.
**Testing**: Vitest behavioral tests and practical Playwright journey, injected fake AI only.
**Target Platform**: Local Node web server, modern responsive browsers.
**Project Type**: Full-stack web app.
**Performance Goals**: Bounded 365-day/200-unit allocation, loading feedback during analysis; no invented latency guarantee.
**Constraints**: Upload 5 MiB, text 100,000 characters, 200 units, daily minutes integer 0–720, name/subject 1–120 trimmed characters; no silent truncation, server secrets and transient source text.
**Scale/Scope**: Single local user; no OCR, authentication or distributed deployment.

## Constitution Check

Pre/post-design pass by design: numbered spec exists; test design precedes implementation; independent review/verifier assigned; civil dates/capacity/conservation explicit; Gemini has no tools and validates output; source bytes transient and fake provider labeled. Actual execution gates remain pending tests/review/build.

## Project Structure

src/app/ serves dashboard and validated API. src/core/ contains types, schemas, scheduler and progress. src/server/ contains documents, analyzer, repository and service. tests/ contains behavioral contracts. specs/001-study-budy/contracts/ contains APIs; reports/ preserves lifecycle evidence.

## Phases

0. Resolve assumptions in research without unanswered implementation blockers.
1. Define data model/contracts/quickstart; independent test designer writes tests.
2. Implement setup, core logic, adapters, service/routes and dashboard.
3. Independent review records findings; full QA logs actual failures.
4. Fix root causes, repeat affected checks and independently verify final artifacts.

## Complexity Tracking

No constitution violation. sql.js replaces native SQLite driver to avoid Windows compilation while retaining SQLite. Plain CSS replaces optional Tailwind to reduce tooling. Local-only deployment is an explicit scope limit.
