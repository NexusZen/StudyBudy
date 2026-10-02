# Study Budy data model

StudyUnit: unique bounded id, nonempty title, optional description/chapter/section, positive finite estimatedMinutes rounded upward, optional difficulty/importance 1–5 default 3, prerequisite IDs, sourceReference, optional positive integer pageStart/pageEnd (end >= start). At most 200 units; missing pages remain absent.

PlanConfig: name/subject 1–120 trimmed characters; valid ISO startDate/endDate inclusive max365 days; dailyMinutes integer 0–720; optional weekdayMinutes keys 0 Sunday through6 Saturday; optional unavailableDates valid ISO dates.

Session: unique id, unitId, date, positive integer minutes, title/source metadata and status not_started|in_progress|completed.

StudyPlan: opaque id, config, units, sessions, unscheduledMinutes, warnings, provider attribution, created timestamp and sanitized source filename. No file bytes/extracted text retained. Repository validates persisted payload.

Progress: totalMinutes=sum units; completedMinutes=sum completed sessions; remainingMinutes=total-completed; percent completed/total*100 (zero if total zero).

All three status transitions supported. In Progress contributes no completed minutes. Failed mutations preserve previous valid state.
