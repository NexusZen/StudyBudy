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
    const logo = page.locator(".brand img");
    await logo.evaluate((img) => img.decode());
    const evidence = await logo.evaluate((img) => {
      const box = img.getBoundingClientRect();
      return {
        src: img.getAttribute("src"),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        width: box.width,
        height: box.height,
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      };
    });
    const workflowCount = await page
      .getByText("How AI designed this workspace", { exact: true })
      .count();
    const homeCount = await page
      .getByRole("link", { name: /^Study Budy/ })
      .count();
    if (
      !evidence.naturalWidth ||
      evidence.width !== evidence.height ||
      evidence.documentWidth > width ||
      workflowCount ||
      !homeCount
    )
      throw new Error(
        JSON.stringify({ width, evidence, workflowCount, homeCount }),
      );
    await page.screenshot({
      path: `reports/logo-final-${width}.png`,
      fullPage: true,
    });
    results.push({ width, ...evidence, workflowCount, homeCount });
  }
  fs.writeFileSync(
    "reports/logo-final-browser-results.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
