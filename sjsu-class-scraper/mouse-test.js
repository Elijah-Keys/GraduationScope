const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"]
  });
  const page = await browser.newPage();
  await page.goto("https://example.com");

  // Wait for a second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Move and click at fixed location
  await page.mouse.move(300, 300);
  await page.mouse.click(300, 300);

  console.log("🖱️ Moved and clicked mouse at (300, 300)");
})();
