import { z } from "zod";
import { configSchema, dateSchema, validateUnits } from "./schemas";
import { progress } from "./progress";
import { AppError } from "./errors";
import type { Plan } from "./types";
const sessionSchema = z
  .object({
    id: z.string().min(1).max(240),
    unitId: z.string().min(1).max(80),
    title: z.string().min(1).max(240),
    date: dateSchema,
    minutes: z.number().int().positive().max(100000),
    status: z.enum(["not_started", "in_progress", "completed"]),
    sourceReference: z.string().min(1).max(500),
    chapter: z.string().max(120).optional(),
    section: z.string().max(120).optional(),
    pageStart: z.number().int().positive().optional(),
    pageEnd: z.number().int().positive().optional(),
  })
  .strict();
const planSchema = z
  .object({
    id: z.string().uuid(),
    config: configSchema,
    units: z.array(z.unknown()),
    sessions: z.array(sessionSchema).max(10000),
    unscheduledMinutes: z.number().int().nonnegative(),
    warnings: z.array(z.string().max(1000)).max(20),
    provider: z.enum(["fake", "gemini"]),
    createdAt: z.string().datetime(),
    progress: z
      .object({
        totalMinutes: z.number().nonnegative(),
        completedMinutes: z.number().nonnegative(),
        remainingMinutes: z.number().nonnegative(),
        percent: z.number().min(0).max(100),
      })
      .strict(),
  })
  .strict();
export function validatePlan(input: unknown): Plan {
  try {
    const data = planSchema.parse(input);
    const units = validateUnits(data.units);
    const ids = new Set<string>();
    for (const session of data.sessions) {
      if (
        ids.has(session.id) ||
        !units.some((u) => u.id === session.unitId) ||
        session.date < data.config.startDate ||
        session.date > data.config.endDate
      )
        throw new Error("Invalid session");
      ids.add(session.id);
    }
    for (const unit of units) {
      if (
        data.sessions
          .filter((s) => s.unitId === unit.id)
          .reduce((n, s) => n + s.minutes, 0) > unit.estimatedMinutes
      )
        throw new Error("Invalid topic total");
    }
    const calculated = progress(units, data.sessions);
    if (
      data.sessions.reduce((n, s) => n + s.minutes, 0) +
        data.unscheduledMinutes !==
        calculated.totalMinutes ||
      Object.entries(calculated).some(
        ([key, value]) =>
          data.progress[key as keyof typeof calculated] !== value,
      )
    )
      throw new Error("Invalid workload accounting");
    return { ...data, units };
  } catch {
    throw new AppError(
      "INVALID_STORAGE",
      "Stored study plan is invalid. Restore a valid local database backup.",
      500,
    );
  }
}
