import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { SqliteRepository } from "../src/lib/repository.js";
import { PlanService } from "../src/lib/service.js";
import type { PlanConfig, StudyUnit } from "../src/lib/types.js";

const paths: string[] = [];
afterEach(async () => {
  for (const path of paths.splice(0)) {
    const target = resolve(path);
    if (
      !target.startsWith(resolve(tmpdir()) + sep) ||
      !target.includes("study-budy-tests-")
    )
      throw new Error("Unsafe test cleanup target");
    await rm(target, { recursive: true, force: true });
  }
});
const config: PlanConfig = {
  name: "Persistence exam",
  subject: "Biology",
  startDate: "2026-10-01",
  endDate: "2026-10-03",
  dailyMinutes: 30,
};
const units: StudyUnit[] = [
  {
    id: "a",
    title: "Cells",
    estimatedMinutes: 90,
    difficulty: 3,
    importance: 3,
    prerequisites: [],
    sourceReference: "notes.txt",
  },
];
async function setup() {
  const dir = await mkdtemp(join(tmpdir(), "study-budy-tests-"));
  paths.push(dir);
  const path = join(dir, "plans.sqlite");
  const repo = new SqliteRepository(path);
  const service = new PlanService(
    repo,
    { analyze: async () => structuredClone(units) },
    "fake",
  );
  return { dir, path, repo, service };
}
describe("SQLite durability and atomic mutation", () => {
  it("TEST-032 REQ-002,016 restores plans and progress after reopening the database", async () => {
    const { path, service } = await setup();
    const created = await service.create(config, {
      text: "Cells",
      fileName: "notes.txt",
    });
    const completed = await service.setStatus(
      created.id,
      created.sessions[0]!.id,
      "completed",
    );
    const reopened = new SqliteRepository(path);
    expect(await reopened.get(created.id)).toEqual(completed);
    expect(await reopened.list()).toEqual([completed]);
  });
  it("TEST-033 REQ-002,016 serializes concurrent status updates without losing completion", async () => {
    const { path, service } = await setup();
    const created = await service.create(config, {
      text: "Cells",
      fileName: "notes.txt",
    });
    await Promise.all(
      created.sessions.map((session) =>
        service.setStatus(created.id, session.id, "completed"),
      ),
    );
    const restored = await new SqliteRepository(path).get(created.id);
    expect(
      restored!.sessions.every((session) => session.status === "completed"),
    ).toBe(true);
    expect(restored!.progress.percent).toBe(100);
    expect(restored!.progress.completedMinutes).toBe(90);
  });
  it("TEST-034 REQ-018 preserves in-memory state after a failed atomic rename", async () => {
    const { dir, path, repo, service } = await setup();
    const created = await service.create(config, {
      text: "Cells",
      fileName: "notes.txt",
    });
    // Turn the known temporary test database target into a directory to make rename fail.
    await rm(path);
    await mkdir(path);
    await expect(
      service.setStatus(created.id, created.sessions[0]!.id, "completed"),
    ).rejects.toThrow();
    expect(await repo.get(created.id)).toEqual(created);
    // Cleanup remains strictly within the freshly generated test directory.
    expect(path.startsWith(dir)).toBe(true);
  });
});
