import { describe, expect, it } from "vitest";
import { PlanService } from "../src/lib/service.js";
import { MemoryRepository } from "../src/lib/repository.js";
import type { PlanConfig, StudyUnit } from "../src/lib/types.js";

const config: PlanConfig = {
  name: "Exam",
  subject: "Biology",
  startDate: "2026-10-01",
  endDate: "2026-10-03",
  dailyMinutes: 30,
};
const units: StudyUnit[] = [
  {
    id: "a",
    title: "Cells",
    estimatedMinutes: 120,
    difficulty: 3,
    importance: 3,
    prerequisites: [],
    sourceReference: "notes.txt",
  },
];
const material = { text: "Cells", fileName: "notes.txt" };
const make = () =>
  new PlanService(
    new MemoryRepository(),
    { analyze: async () => structuredClone(units) },
    "fake",
  );

describe("persisted planning workflow", () => {
  it("TEST-021 REQ-002,004,012 creates, lists and retrieves a provider-attributed plan", async () => {
    const service = make();
    const plan = await service.create(config, material);
    expect(plan.id).toBeTruthy();
    expect(plan.provider).toBe("fake");
    expect(
      plan.sessions.reduce((sum, s) => sum + s.minutes, 0) +
        plan.unscheduledMinutes,
    ).toBe(120);
    expect(await service.get(plan.id)).toEqual(plan);
    expect(await service.list()).toEqual([plan]);
    expect(JSON.stringify(plan)).not.toContain('"text":"Cells"');
  });

  it("TEST-022 REQ-016 persists statuses and weights progress by minutes including overflow", async () => {
    const service = make();
    const plan = await service.create(config, material);
    await service.setStatus(plan.id, plan.sessions[0]!.id, "completed");
    const updated = await service.setStatus(
      plan.id,
      plan.sessions[1]!.id,
      "in_progress",
    );
    expect(updated.progress.completedMinutes).toBe(30);
    expect(updated.progress.remainingMinutes).toBe(90);
    expect(updated.progress.percent).toBe(25);
    expect((await service.get(plan.id)).sessions[0]!.status).toBe("completed");
  });

  it("TEST-023 REQ-017 updates availability and reschedules without duplicating completion", async () => {
    const service = make();
    const plan = await service.create(config, material);
    const complete = await service.setStatus(
      plan.id,
      plan.sessions[0]!.id,
      "completed",
    );
    const historical = complete.sessions[0]!;
    const result = await service.reschedule(plan.id, "2026-10-02", {
      ...config,
      dailyMinutes: 60,
    });
    expect(result.sessions.find((s) => s.id === historical.id)).toEqual(
      historical,
    );
    expect(
      result.sessions
        .filter((s) => s.status !== "completed")
        .every((s) => s.date >= "2026-10-02"),
    ).toBe(true);
    expect(
      result.sessions.reduce((sum, s) => sum + s.minutes, 0) +
        result.unscheduledMinutes,
    ).toBe(120);
    expect(await service.get(plan.id)).toEqual(result);
  });

  it("TEST-024 REQ-016,018,020 invalid mutations preserve stored plan", async () => {
    const service = make();
    const plan = await service.create(config, material);
    await expect(
      service.setStatus(plan.id, "missing", "completed"),
    ).rejects.toThrow();
    await expect(
      service.setStatus(
        plan.id,
        plan.sessions[0]!.id,
        "invalid" as "completed",
      ),
    ).rejects.toThrow();
    await expect(service.reschedule(plan.id, "2026-02-30")).rejects.toThrow();
    await expect(
      service.update(plan.id, { ...config, endDate: "2026-09-01" }),
    ).rejects.toThrow();
    expect(await service.get(plan.id)).toEqual(plan);
    await expect(service.get("missing")).rejects.toThrow();
  });

  it("TEST-025 REQ-006,018 rejects provider failures and bad inputs before persistence", async () => {
    const repo = new MemoryRepository();
    const service = new PlanService(
      repo,
      {
        analyze: async () => {
          throw new Error("provider failed");
        },
      },
      "fake",
    );
    await expect(service.create(config, material)).rejects.toThrow();
    expect(await repo.list()).toEqual([]);
    const good = make();
    for (const bad of [
      { ...config, name: "" },
      { ...config, dailyMinutes: -1 },
      { ...config, startDate: "2026-02-30" },
    ]) {
      await expect(good.create(bad, material)).rejects.toThrow();
    }
    expect(await good.list()).toEqual([]);
  });
});
