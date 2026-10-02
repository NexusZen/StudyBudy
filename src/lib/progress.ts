import type { StudyUnit, Session } from "./types";
export function progress(units: StudyUnit[], sessions: Session[]) {
  const totalMinutes = units.reduce((n, u) => n + u.estimatedMinutes, 0),
    completedMinutes = sessions
      .filter((s) => s.status === "completed")
      .reduce((n, s) => n + s.minutes, 0);
  return {
    totalMinutes,
    completedMinutes,
    remainingMinutes: totalMinutes - completedMinutes,
    percent: totalMinutes
      ? Math.round((completedMinutes / totalMinutes) * 100)
      : 0,
  };
}
