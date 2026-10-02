import { AppError } from "./errors";
import { dateSchema, validateConfig, validateUnits } from "./schemas";
import type { PlanConfig, StudyUnit, Session, ScheduleResult } from "./types";
export function capacityOn(config: PlanConfig, date: string) {
  return config.unavailableDates?.includes(date)
    ? 0
    : (config.weekdayMinutes?.[
        String(new Date(date + "T00:00:00Z").getUTCDay())
      ] ?? config.dailyMinutes);
}
function order(units: StudyUnit[]) {
  const done = new Set<string>();
  const pending = units.map((u, index) => ({ u, index }));
  const sorted: StudyUnit[] = [];
  while (pending.length) {
    const ready = pending
      .filter((x) => x.u.prerequisites.every((id) => done.has(id)))
      .sort(
        (a, b) =>
          b.u.importance - a.u.importance ||
          b.u.difficulty - a.u.difficulty ||
          a.index - b.index,
      );
    if (!ready.length)
      throw new AppError("INVALID_DEPENDENCY", "Invalid prerequisites.");
    const chosen = ready[0];
    sorted.push(chosen.u);
    done.add(chosen.u.id);
    pending.splice(pending.indexOf(chosen), 1);
  }
  return sorted;
}
function allocate(
  units: StudyUnit[],
  config: PlanConfig,
  completed: Session[],
  fromDate: string,
): ScheduleResult {
  const sessions = [...completed];
  let unscheduledMinutes = 0;
  const used = new Map<string, number>();
  for (const s of completed)
    used.set(s.date, (used.get(s.date) ?? 0) + s.minutes);
  const dates: string[] = [];
  for (
    let ms = Date.parse(config.startDate + "T00:00:00Z");
    ms <= Date.parse(config.endDate + "T00:00:00Z");
    ms += 86400000
  ) {
    const d = new Date(ms).toISOString().slice(0, 10);
    if (d >= fromDate) dates.push(d);
  }
  let day = 0;
  const ids = new Set(completed.map((s) => s.id));
  for (const u of order(units)) {
    const prerequisiteDates = sessions
      .filter((s) => u.prerequisites.includes(s.unitId))
      .map((s) => s.date);
    const earliest = prerequisiteDates.sort().at(-1) ?? fromDate;
    while (day < dates.length && dates[day] < earliest) day++;
    let remaining =
      u.estimatedMinutes -
      completed
        .filter((s) => s.unitId === u.id)
        .reduce((n, s) => n + s.minutes, 0);
    while (remaining > 0 && day < dates.length) {
      const date = dates[day];
      const available = Math.max(
        0,
        capacityOn(config, date) - (used.get(date) ?? 0),
      );
      if (!available) {
        day++;
        continue;
      }
      const minutes = Math.min(remaining, available);
      let sequence = 0;
      let id: string;
      do {
        id = `${u.id}_${date}_${sequence++}`;
      } while (ids.has(id));
      ids.add(id);
      sessions.push({
        id,
        unitId: u.id,
        title: u.title,
        date,
        minutes,
        status: "not_started",
        sourceReference: u.sourceReference,
        chapter: u.chapter,
        section: u.section,
        pageStart: u.pageStart,
        pageEnd: u.pageEnd,
      });
      used.set(date, (used.get(date) ?? 0) + minutes);
      remaining -= minutes;
    }
    unscheduledMinutes += remaining;
  }
  return {
    sessions,
    unscheduledMinutes,
    warnings: unscheduledMinutes
      ? [
          `${unscheduledMinutes} minutes do not fit before the deadline. Increase availability or extend the study period.`,
        ]
      : [],
  };
}
export function schedule(input: StudyUnit[], settings: PlanConfig) {
  const units = validateUnits(input),
    config = validateConfig(settings);
  return allocate(units, config, [], config.startDate);
}
export function reschedule(
  input: StudyUnit[],
  settings: PlanConfig,
  previous: Session[],
  fromDate: string,
) {
  const units = validateUnits(input),
    config = validateConfig(settings);
  dateSchema.parse(fromDate);
  const completed = previous.filter((s) => s.status === "completed");
  const ids = new Set<string>();
  for (const s of completed) {
    if (
      ids.has(s.id) ||
      !units.some((u) => u.id === s.unitId) ||
      !Number.isInteger(s.minutes) ||
      s.minutes <= 0 ||
      s.date < config.startDate ||
      s.date > config.endDate ||
      !dateSchema.safeParse(s.date).success
    )
      throw new AppError(
        "INVALID_COMPLETION",
        "Completed sessions conflict with the new period.",
      );
    ids.add(s.id);
  }
  for (const u of units) {
    if (
      completed
        .filter((s) => s.unitId === u.id)
        .reduce((n, s) => n + s.minutes, 0) > u.estimatedMinutes
    )
      throw new AppError(
        "INVALID_COMPLETION",
        "Completed work exceeds topic workload.",
      );
  }
  return allocate(units, config, completed, fromDate);
}
