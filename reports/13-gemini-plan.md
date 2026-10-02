# Gemini correction architecture and offline test design

Date: 2026-10-02. Role: architecture/test-design agent. Scope: read-only assessment plus this report; no application edits, secret reads, or live calls.

## Evidence inspected

- Constitution and `specs/001-study-budy/spec.md`, including REQ-028.
- `src/lib/analyzer.ts`, `src/lib/http.ts`, `src/lib/errors.ts`, and `tests/analyzer.test.ts`.
- Installed SDK declaration `node_modules/@google/genai/dist/genai.d.ts`: exported `ApiError extends Error` exposes numeric `status`.
- Dashboard request helper already presents sanitized API error messages; no new UI error architecture is necessary.

## Findings before fixes

GEM-ARCH-001: Gemini's catch block merges SDK failures and JSON parsing failures into `ANALYSIS_FAILED`. This prevents students from distinguishing exhausted quota, rejected configuration, unavailable model, and transient service failure. Existing injected-provider tests prove rejection but do not inspect error classification or secret redaction.

GEM-ARCH-002: Service construction is cached globally. Environment changes require a server restart; changing the local environment file alone is insufficient for a running process. The original material validation, server-only key use, structured schema validation, and absence of fake fallback should be preserved.

These findings do not establish the actual external failure cause. The orchestrator must record that cause from a separate explicitly labeled live diagnostic if performed.

## Recommended correction

Use numeric SDK status with fixed user-facing messages; never forward arbitrary SDK error text or serialized request details. Preserve existing `AppError` instances. Distinguish HTTP 429 quota/rate limit (retry later or inspect project quota), 401/403 rejected authorization (inspect key/project permissions), 404 model unavailable (inspect configured model), 400 rejected request/configuration (inspect model and API settings; do not assume all 400 errors mean bad key), and 5xx upstream availability (retry later). Abort/timeout errors may receive a dedicated retry message. Keep unknown errors generic. Explicitly classify malformed JSON as invalid AI output if implementing that refinement.

No automatic switch to fake mode, paid tier, alternate model, or new credential is justified by a diagnostic failure. Keep the 30-second timeout and bounded inputs/outputs. A quota limitation cannot be repaired solely by changing application code; report it accurately with its recovery action.

## Meaningful offline checks

Extend injected `Generate` tests with rejected errors carrying numeric statuses, including 429, 403, 404, 400, and 503. Assert stable `AppError.code`, HTTP status, and actionable message. Include an arbitrary secret sentinel inside the thrown raw message and verify no sentinel appears in the public error. Assert no units are returned on failure, preserving no-fallback behavior. Cover malformed JSON classification and preservation of existing validation errors if changed. Tests must use injected provider functions and never invoke live Gemini or read `.env.local`.

For logo/disclosure UI work, verify original image proportions, accessible product identification, and absence of the removed workflow disclosure. Preserve design provenance in repository documentation. Execute existing lint/typecheck/build and appropriate browser checks after implementation; only report commands actually run.

## Execution record

This agent ran PowerShell reads and searches for the files identified above and wrote this report. It did not execute tests, contact Gemini, inspect environment secrets, or change application code.
