import { expect, test } from "@playwright/test";

const config = {
  name: "API exam",
  subject: "Biology",
  startDate: "2026-10-01",
  endDate: "2026-10-07",
  dailyMinutes: 60,
};
const headers = { Origin: "http://127.0.0.1:3000" };
const file = {
  name: "api-notes.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("Cell structure\nPhotosynthesis\nGenetics"),
};

test("TEST-028 REQ-002,004,016 API create/read/update/status flow persists", async ({
  request,
}) => {
  const created = await request.post("/api/plans", {
    headers,
    multipart: { config: JSON.stringify(config), file },
  });
  expect(created.status()).toBe(201);
  const plan = await created.json();
  expect(plan.provider).toBe("fake");
  expect(plan.sessions.length).toBeGreaterThan(0);
  expect((await request.get(`/api/plans/${plan.id}`)).status()).toBe(200);
  const status = await request.patch(
    `/api/plans/${plan.id}/sessions/${plan.sessions[0].id}`,
    { headers, data: { status: "completed" } },
  );
  expect(status.status()).toBe(200);
  const completed = await status.json();
  expect(
    completed.sessions.find((s: { id: string }) => s.id === plan.sessions[0].id)
      .status,
  ).toBe("completed");
  const update = await request.patch(`/api/plans/${plan.id}`, {
    headers,
    data: { ...config, name: "Updated API exam" },
  });
  expect(update.status()).toBe(200);
  expect((await update.json()).config.name).toBe("Updated API exam");
});

test("TEST-029 REQ-018,020 rejects malformed upload/request/status and unknown identities", async ({
  request,
}) => {
  const invalid = await request.post("/api/plans", {
    headers,
    multipart: { config: "{broken", file },
  });
  expect(invalid.status()).toBe(400);
  expect((await invalid.json()).error.message).toBeTruthy();
  const unsupported = await request.post("/api/plans", {
    headers,
    multipart: {
      config: JSON.stringify(config),
      file: { ...file, name: "bad.exe", mimeType: "application/octet-stream" },
    },
  });
  expect(unsupported.status()).toBe(415);
  const missing = await request.get("/api/plans/nonexistent");
  expect(missing.status()).toBe(404);
  expect(JSON.stringify(await missing.json())).not.toMatch(
    /stack|GEMINI_API_KEY|AIza/,
  );
});

test("TEST-030 REQ-020 rejects cross-origin mutations", async ({ request }) => {
  const response = await request.post("/api/plans", {
    headers: { Origin: "https://untrusted.example" },
    multipart: { config: JSON.stringify(config), file },
  });
  expect([400, 403]).toContain(response.status());
});
