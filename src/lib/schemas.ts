import { z } from "zod";
import { AppError } from "./errors";
import type { PlanConfig, StudyUnit } from "./types";
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const ms = Date.parse(value + "T00:00:00Z");
    return (
      Number.isFinite(ms) &&
      new Date(ms).toISOString().slice(0, 10) === value &&
      value >= "1900-01-01" &&
      value <= "2100-12-31"
    );
  }, "Use a valid calendar date between 1900 and 2100.");
const capacity = z.number().int().min(0).max(720);
export const configSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    subject: z.string().trim().min(1).max(120),
    startDate: dateSchema,
    endDate: dateSchema,
    dailyMinutes: capacity,
    weekdayMinutes: z
      .partialRecord(z.enum(["0", "1", "2", "3", "4", "5", "6"]), capacity)
      .optional(),
    unavailableDates: z.array(dateSchema).max(365).optional(),
  })
  .strict()
  .superRefine((v, c) => {
    const days =
      (Date.parse(v.endDate) - Date.parse(v.startDate)) / 86400000 + 1;
    if (days < 1 || days > 365)
      c.addIssue({
        code: "custom",
        message: "Study period must contain 1–365 days.",
      });
  });
export function validateConfig(input: unknown): PlanConfig {
  const result = configSchema.safeParse(input);
  if (!result.success)
    throw new AppError(
      "INVALID_CONFIG",
      result.error.issues.map((i) => i.message).join(" "),
    );
  return result.data;
}
export const unitSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-zA-Z0-9_-]+$/),
    title: z.string().trim().min(1).max(240),
    estimatedMinutes: z.number().positive().max(100000).transform(Math.ceil),
    difficulty: z.number().int().min(1).max(5).default(3),
    importance: z.number().int().min(1).max(5).default(3),
    prerequisites: z.array(z.string().min(1).max(80)).max(200).default([]),
    sourceReference: z.string().trim().min(1).max(500),
    chapter: z.string().max(120).optional(),
    section: z.string().max(120).optional(),
    description: z.string().max(2000).optional(),
    pageStart: z.number().int().positive().max(100000).optional(),
    pageEnd: z.number().int().positive().max(100000).optional(),
  })
  .strict()
  .refine(
    (v) =>
      v.pageEnd === undefined ||
      (v.pageStart !== undefined && v.pageEnd >= v.pageStart),
    "Invalid page range",
  );
export function validateUnits(input: unknown): StudyUnit[] {
  const result = z.array(unitSchema).min(1).max(200).safeParse(input);
  if (!result.success)
    throw new AppError(
      "INVALID_AI_OUTPUT",
      "The analyzer returned invalid study topics.",
      502,
    );
  const units = result.data;
  const ids = new Set(units.map((u) => u.id));
  if (ids.size !== units.length)
    throw new AppError("INVALID_AI_OUTPUT", "Duplicate topic IDs.", 502);
  const visited = new Set<string>(),
    active = new Set<string>();
  const map = new Map(units.map((u) => [u.id, u]));
  function visit(id: string) {
    if (active.has(id))
      throw new AppError(
        "INVALID_AI_OUTPUT",
        "Cyclic topic prerequisites.",
        502,
      );
    if (visited.has(id)) return;
    const u = map.get(id);
    if (!u)
      throw new AppError("INVALID_AI_OUTPUT", "Unknown prerequisite.", 502);
    active.add(id);
    u.prerequisites.forEach(visit);
    active.delete(id);
    visited.add(id);
  }
  units.forEach((u) => visit(u.id));
  return units;
}
