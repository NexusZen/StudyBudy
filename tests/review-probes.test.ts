import { describe, it, expect } from "vitest";
import { reschedule, schedule } from "../src/lib/scheduler";
import { extractDocument } from "../src/lib/documents";
const config = {
  name: "Review",
  subject: "Review",
  startDate: "2026-10-01",
  endDate: "2026-10-03",
  dailyMinutes: 60,
};
const units = [
  {
    id: "base",
    title: "Base",
    estimatedMinutes: 60,
    difficulty: 3,
    importance: 3,
    prerequisites: [],
    sourceReference: "r.txt",
  },
  {
    id: "dep",
    title: "Dep",
    estimatedMinutes: 60,
    difficulty: 3,
    importance: 3,
    prerequisites: ["base"],
    sourceReference: "r.txt",
  },
];
describe("independent review regressions", () => {
  it("TEST-035 REQ-013,017 R-002 schedules dependents no earlier than preserved prerequisite completion", () => {
    const old = schedule(units, config);
    const future = {
      ...old.sessions[0]!,
      date: "2026-10-03",
      status: "completed" as const,
    };
    const result = reschedule(units, config, [future], "2026-10-01");
    expect(
      result.sessions
        .filter((s) => s.unitId === "dep")
        .every((s) => s.date >= future.date),
    ).toBe(true);
    expect(result.sessions.find((s) => s.id === future.id)).toEqual(future);
    expect(result.unscheduledMinutes).toBe(60);
  });
  it("TEST-036 REQ-003,018 R-001 rejects a valid blank PDF without treating page counters as material", async () => {
    const stream = "";
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R >>",
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    ];
    let body = "%PDF-1.4\n";
    const offsets: number[] = [];
    objects.forEach((o, i) => {
      offsets.push(Buffer.byteLength(body));
      body += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });
    const xref = Buffer.byteLength(body);
    body += `xref\n0 5\n0000000000 65535 f \n${offsets.map((n) => `${String(n).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    const bytes = new TextEncoder().encode(body);
    await expect(
      extractDocument({
        name: "blank.pdf",
        type: "application/pdf",
        size: bytes.length,
        arrayBuffer: async () => bytes.buffer,
      }),
    ).rejects.toThrow();
  }, 20000);
});
