import { expect, test } from "@playwright/test";

test("TEST-026 REQ-001,002,004,015,016,017,022 primary fake-provider journey", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Study Budy", { exact: true }).first(),
  ).toBeVisible();
  const createButton = page.getByRole("button", {
    name: /Create a study plan/,
  });
  await createButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Plan name", { exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(createButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Plan name", { exact: true })).toBeFocused();
  await expect(page.getByText(/demo|fake/i).first()).toBeVisible();
  await page.getByLabel("Plan name", { exact: true }).fill("Biology exam");
  await page.getByLabel("Course / subject", { exact: true }).fill("Biology");
  await page.getByLabel("Start date", { exact: true }).fill("2026-10-01");
  await page.getByLabel("Deadline", { exact: true }).fill("2026-10-07");
  await page.getByLabel(/Daily study time/).fill("60");
  await page
    .getByLabel("Study material upload", { exact: true })
    .setInputFiles({
      name: "biology.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "Cell structure\nPhotosynthesis\nRespiration\nGenetics",
      ),
    });
  await page
    .getByRole("button", { name: /Analyze material & create plan/ })
    .click();
  await expect(
    page.getByText("Biology exam", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("biology.txt", { exact: false }).first(),
  ).toBeVisible();
  await page.screenshot({ path: "reports/dashboard.png", fullPage: true });
  const status = page.getByLabel(/^Status for /).first();
  await expect(status).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Study completion" }),
  ).toHaveAttribute("aria-valuenow", "0");
  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith("/sessions") &&
      response.request().method() === "PATCH",
  );
  await status.selectOption("completed");
  expect((await saved).status()).toBe(200);
  await expect(status).toHaveValue("completed");
  await expect
    .poll(async () =>
      Number(
        await page
          .getByRole("progressbar", { name: "Study completion" })
          .getAttribute("aria-valuenow"),
      ),
    )
    .toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByLabel(/^Status for /).first()).toHaveValue(
    "completed",
  );
  await page.getByRole("button", { name: /Reschedule remaining work/ }).click();
  await page
    .getByLabel("Start remaining work from", { exact: true })
    .fill("2026-10-03");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reschedule remaining work", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel(/^Status for /).first()).toHaveValue(
    "completed",
  );
});

test("TEST-027 REQ-018,020 invalid upload shows recovery error", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Create a study plan/ }).click();
  await page.getByLabel("Plan name", { exact: true }).fill("Rejected upload");
  await page.getByLabel("Course / subject", { exact: true }).fill("Biology");
  await page.getByLabel("Start date", { exact: true }).fill("2026-10-01");
  await page.getByLabel("Deadline", { exact: true }).fill("2026-10-07");
  await page.getByLabel(/Daily study time/).fill("60");
  await page
    .getByLabel("Study material upload", { exact: true })
    .setInputFiles({
      name: "malware.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("not supported"),
    });
  await page
    .getByRole("button", { name: /Analyze material & create plan/ })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    /PDF|TXT|unsupported|supported/i,
  );
});
