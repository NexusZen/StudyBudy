import { describe, expect, it } from "vitest";
import { schedule, reschedule } from "../src/lib/scheduler.js";
import type { PlanConfig, StudyUnit } from "../src/lib/types.js";

const unit = (
  id: string,
  minutes: number,
  prerequisites: string[] = [],
): StudyUnit => ({
  id,
  title: id,
  estimatedMinutes: minutes,
  difficulty: 3,
  importance: 3,
  prerequisites,
  sourceReference: "notes.txt",
});
const config = (overrides: Partial<PlanConfig> = {}): PlanConfig => ({
  name: "Biology exam",
  subject: "Biology",
  startDate: "2026-10-01",
  endDate: "2026-10-03",
  dailyMinutes: 60,
  ...overrides,
});
const total = (sessions: { minutes: number }[]) =>
  sessions.reduce((sum, item) => sum + item.minutes, 0);

describe("deterministic scheduling contract", () => {
  it("TEST-001 REQ-010,011,012 splits workload within capacity and conserves minutes", () => {
    const units = [unit("a", 100), unit("b", 80)];
    const result = schedule(units, config());
    expect(result).toEqual(schedule(units, config()));
    expect(total(result.sessions)).toBe(180);
    expect(result.unscheduledMinutes).toBe(0);
    expect(new Set(result.sessions.map((s) => s.id)).size).toBe(
      result.sessions.length,
    );
    for (const date of ["2026-10-01", "2026-10-02", "2026-10-03"]) {
      expect(
        total(result.sessions.filter((s) => s.date === date)),
      ).toBeLessThanOrEqual(60);
    }
    expect(
      result.sessions.every(
        (s) => s.minutes > 0 && s.sourceReference === "notes.txt",
      ),
    ).toBe(true);
  });

  it("TEST-002 REQ-008,011 supports inclusive one-day and leap-day ranges", () => {
    expect(
      schedule(
        [unit("a", 30)],
        config({ startDate: "2028-02-29", endDate: "2028-02-29" }),
      ).sessions.map((s) => s.date),
    ).toEqual(["2028-02-29"]);
    const result = schedule(
      [unit("a", 180)],
      config({ startDate: "2026-12-31", endDate: "2027-01-02" }),
    );
    expect([...new Set(result.sessions.map((s) => s.date))]).toEqual([
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
    ]);
  });

  it("TEST-003 REQ-009,011 honors unavailable dates and weekday overrides", () => {
    const result = schedule(
      [unit("a", 200)],
      config({
        unavailableDates: ["2026-10-02"],
        weekdayMinutes: { "4": 15, "6": 30 },
      }),
    );
    expect(result.sessions.some((s) => s.date === "2026-10-02")).toBe(false);
    expect(
      total(result.sessions.filter((s) => s.date === "2026-10-01")),
    ).toBeLessThanOrEqual(15);
    expect(
      total(result.sessions.filter((s) => s.date === "2026-10-03")),
    ).toBeLessThanOrEqual(30);
    expect(total(result.sessions) + result.unscheduledMinutes).toBe(200);
  });

  it("TEST-004 REQ-014 reports overflow and zero capacity without dropping workload", () => {
    for (const dailyMinutes of [0, 10]) {
      const result = schedule([unit("a", 100)], config({ dailyMinutes }));
      expect(total(result.sessions) + result.unscheduledMinutes).toBe(100);
      expect(result.unscheduledMinutes).toBe(100 - 3 * dailyMinutes);
      expect(result.warnings.length).toBeGreaterThan(0);
    }
  });

  it("TEST-005 REQ-013 schedules full prerequisite workload before dependent work", () => {
    const result = schedule(
      [unit("dependent", 40, ["base"]), unit("base", 80)],
      config(),
    );
    const ids = result.sessions.map((s) => s.unitId);
    expect(ids.lastIndexOf("base")).toBeLessThan(ids.indexOf("dependent"));
    expect(total(result.sessions.filter((s) => s.unitId === "base"))).toBe(80);
  });

  it("TEST-006 REQ-008,009,013 rejects invalid dates, capacity and dependency graphs", () => {
    for (const bad of [
      { startDate: "2026-02-30" },
      { endDate: "2026-09-30" },
      { dailyMinutes: -1 },
      { dailyMinutes: Number.NaN },
    ]) {
      expect(() => schedule([unit("a", 30)], config(bad))).toThrow();
    }
    expect(() => schedule([unit("a", 30, ["missing"])], config())).toThrow();
    expect(() =>
      schedule([unit("a", 30, ["b"]), unit("b", 30, ["a"])], config()),
    ).toThrow();
  });

  it("TEST-007 REQ-017 preserves completed sessions and redistributes unfinished plus overflow", () => {
    const units = [unit("a", 200)];
    const original = schedule(units, config());
    const completed = {
      ...original.sessions[0]!,
      status: "completed" as const,
    };
    const previous = [completed, ...original.sessions.slice(1)];
    const result = reschedule(
      units,
      config({ dailyMinutes: 40 }),
      previous,
      "2026-10-02",
    );
    expect(result.sessions.find((s) => s.id === completed.id)).toEqual(
      completed,
    );
    expect(
      result.sessions
        .filter((s) => s.status !== "completed")
        .every((s) => s.date >= "2026-10-02"),
    ).toBe(true);
    expect(total(result.sessions) + result.unscheduledMinutes).toBe(200);
    expect(result.unscheduledMinutes).toBe(60);
    expect(previous[0]).toEqual(completed);
  });

  it("TEST-008 REQ-010,011,012,014 preserves accounting across a deterministic workload matrix", () => {
    for (const minutes of [1, 59, 60, 61, 179, 180, 181, 500]) {
      for (const dailyMinutes of [0, 1, 30, 60]) {
        const result = schedule([unit("a", minutes)], config({ dailyMinutes }));
        expect(total(result.sessions) + result.unscheduledMinutes).toBe(
          minutes,
        );
        expect(result.unscheduledMinutes).toBe(
          Math.max(0, minutes - dailyMinutes * 3),
        );
        expect(
          result.sessions.every(
            (s) =>
              s.minutes > 0 &&
              s.minutes <= dailyMinutes &&
              s.date >= "2026-10-01" &&
              s.date <= "2026-10-03",
          ),
        ).toBe(true);
      }
    }
  });

  it("TEST-009 REQ-017,018 rejects invalid reschedule dates without mutating original sessions", () => {
    const units = [unit("a", 100)];
    const original = schedule(units, config());
    const snapshot = JSON.stringify(original.sessions);
    for (const fromDate of ["2026-02-30", "bad"]) {
      expect(() =>
        reschedule(units, config(), original.sessions, fromDate),
      ).toThrow();
      expect(JSON.stringify(original.sessions)).toBe(snapshot);
    }
  });

  it("TEST-010 REQ-017 returns residual overflow when rescheduling after the deadline", () => {
    const units = [unit("a", 100)];
    const previous = schedule(units, config()).sessions;
    const result = reschedule(units, config(), previous, "2026-10-04");
    expect(result.sessions).toEqual([]);
    expect(result.unscheduledMinutes).toBe(100);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("TEST-013 REQ-010,013 uses importance then difficulty then stable input order", () => {
    const units: StudyUnit[] = [
      { ...unit("first", 10), importance: 3, difficulty: 2 },
      { ...unit("second", 10), importance: 3, difficulty: 2 },
      { ...unit("hard", 10), importance: 3, difficulty: 5 },
      { ...unit("important", 10), importance: 5, difficulty: 1 },
    ];
    expect(schedule(units, config()).sessions.map((s) => s.unitId)).toEqual([
      "important",
      "hard",
      "first",
      "second",
    ]);
  });

  it("TEST-014 REQ-011,017 subtracts historical completed minutes from same-day capacity", () => {
    const units = [unit("a", 100)];
    const previous = schedule(units, config({ dailyMinutes: 30 })).sessions;
    const completed = { ...previous[0]!, status: "completed" as const };
    const result = reschedule(
      units,
      config({ dailyMinutes: 60 }),
      [completed, ...previous.slice(1)],
      "2026-10-01",
    );
    expect(
      total(result.sessions.filter((s) => s.date === "2026-10-01")),
    ).toBeLessThanOrEqual(60);
    expect(result.sessions.find((s) => s.id === completed.id)).toEqual(
      completed,
    );
    expect(total(result.sessions) + result.unscheduledMinutes).toBe(100);
  });
});
