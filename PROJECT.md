# Study Budy

Study Budy helps a student turn textbooks, lecture notes, and syllabi into a realistic daily study plan before a deadline. Gemini interprets material into validated topics; an explainable deterministic scheduler assigns study minutes to dates. A student can track session completion and reschedule remaining work.

The project has two equally important deliverables: a usable local web application and an auditable specification → planning → test design → implementation → independent review → QA → correction → independent verification workflow. See `specs/001-study-budy/spec.md` for the authoritative requirement IDs and `reports/` for evidence.

## Delivery boundary

The first release serves one student on a trusted local computer. It supports PDF/TXT material, persistent plans, daily and weekday availability, source references, progress, and rescheduling. It uses server-side Gemini when configured and an explicitly selected, visibly labeled deterministic fake provider for demonstrations/tests without credentials. Fake analysis is never represented as Gemini analysis.

No custom model training, account system, public multi-user hosting, OCR, LMS integration, or claims of mathematically optimal learning outcomes are included. Workload estimates are approximate and should be reviewed by the student.

## Success conditions

All mandatory requirements and acceptance cases have implementation/test traceability; automated tests, formatting/lint, type checks, and production build have actual recorded results; independent review and final verification occur; failures and fixes are retained; installation and Gemini configuration are documented; secrets stay server-side and outside Git.

## Assumptions

- Dates are inclusive calendar dates, independent of timezone offsets; today is interpreted using the browser's local calendar.
- Availability is expressed as minutes and can be entered as fractional hours converted to whole minutes.
- Uploaded bytes are processed transiently. Stored plans retain normalized topic metadata and source references, not the original document bytes.
- Missing optional difficulty/importance metadata has documented defaults; missing trustworthy page numbers stays absent.
- Text-based PDFs are required. Image-only, encrypted, corrupt, or excessively large inputs receive explicit actionable errors.
- Revision/buffer allocation is a documented scheduler policy, not an additional AI calendar generation step.
