const { chromium } = require("@playwright/test");
const fs = require("fs");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("http://127.0.0.1:3001/");
    await page.getByRole("button", { name: /New study plan/ }).waitFor();
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    await page.screenshot({
      path: `reports/final-design-${width}.png`,
      fullPage: true,
    });
    const opener = page.getByRole("button", { name: /New study plan/ });
    await opener.focus();
    await page.keyboard.press("Enter");
    await page.getByLabel("Plan name", { exact: true }).waitFor();
    const initialFocus = await page
      .getByLabel("Plan name", { exact: true })
      .evaluate((el) => el === document.activeElement);
    const modalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    );
    await page.keyboard.press("Shift+Tab");
    const contained = await page
      .getByRole("dialog")
      .evaluate((el) => el.contains(document.activeElement));
    await page.keyboard.press("Escape");
    const closed = (await page.getByRole("dialog").count()) === 0;
    await page.waitForTimeout(150);
    const restored = await opener.evaluate(
      (el) => el === document.activeElement,
    );
    results.push({
      width,
      overflow,
      initialFocus,
      modalOverflow,
      contained,
      closed,
      restored,
    });
  }
  await page
    .getByText("How AI designed this workspace", { exact: true })
    .click();
  const workflow = await page.locator(".design-workflow").innerText();
  await page.screenshot({
    path: "reports/final-design-workflow.png",
    fullPage: true,
  });
  await page.route("**/api/plans", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.reload();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "reports/final-design-empty-1440.png",
    fullPage: true,
  });
  const empty = await page.locator(".empty-card").innerText();
  fs.writeFileSync(
    "reports/final-design-browser-results.json",
    JSON.stringify({ results, workflow, empty }, null, 2),
  );
  console.log(JSON.stringify({ results, workflow, empty }, null, 2));
  await browser.close();
})();
