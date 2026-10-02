# Study Budy API contract

Local same-origin Node runtime routes respond JSON. Errors use {error:{code,message}} without raw SDK exception details.

| Method/path | Input | Success |
|---|---|---|
| GET /api/plans | none | 200 plan list |
| POST /api/plans | multipart file + config JSON | 201 persisted plan incl provider/overflow |
| GET /api/plans/:id | opaque id | 200 plan |
| PATCH /api/plans/:id | config update | 200 updated plan preserving completion |
| PATCH /api/plans/:id/sessions/:sessionId | {status} | 200 updated plan/progress |
| POST /api/plans/:id/reschedule | {fromDate,config?} | 200 updated plan preserving completed sessions |

400 malformed/invalid input;404 missing plan/session;413 oversized;415 unsupported file;502/503 analyzer failure;500 safe storage/internal error. Missing Gemini credentials gives an actionable error in Gemini mode; explicit demo works offline. IDs never become source filenames.

Pure interfaces: schedule(units,config) and reschedule(units,config,sessions,fromDate) return {sessions,unscheduledMinutes,warnings}. StudyMaterialAnalyzer.analyze({text,fileName}) returns Promise<StudyUnit[]>; reconcile exported names with test designer and record adjustments without weakening behavior.
