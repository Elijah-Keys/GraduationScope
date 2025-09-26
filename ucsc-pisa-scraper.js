// ucsc-pisa-scraper.js
const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer");

const START_URL = "https://pisa.ucsc.edu/class_search/index.php";

const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BASE_DIR = path.join(os.homedir(), "ucsc-scrapes", STAMP);
fs.mkdirSync(BASE_DIR, { recursive: true });
const OUT_TIMESTAMP = path.join(BASE_DIR, "ucsc-pisa-classes.json");
const OUT_FIXED = path.join(process.cwd(), "ucsc-latest.json");

// Only these GE codes
const GE_CODES = [
  "CC","ER","IM","MF","SI","SR","TA",
  "PE-E","PE-H","PE-T",
  "PR-E","PR-C",
  "C"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitter = (min, max) => sleep(min + Math.floor(Math.random() * (max - min + 1)));

async function humanBrowse(page) {
  await jitter(500, 900);
  await page.mouse.move(200 + Math.random() * 600, 200 + Math.random() * 400);
  await jitter(300, 700);
  await page.evaluate(async () => {
    const s = ms => new Promise(r => setTimeout(r, ms));
    window.scrollTo({ top: 0, behavior: "instant" });
    await s(200 + Math.random() * 200);
    window.scrollBy({ top: 400 + Math.random() * 400, behavior: "smooth" });
    await s(400 + Math.random() * 400);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  await jitter(400, 800);
}

async function waitForResults(page) {
  await Promise.race([
    page.waitForSelector("a[id^='class_id_']", { timeout: 60000 }),
    page.waitForSelector("#results .row", { timeout: 60000 })
  ]);
}

async function scrapePage(page, geCode) {
  return await page.evaluate((geCode) => {
    const out = [];
    const linkNodes = Array.from(document.querySelectorAll("a[id^='class_id_']"));

    const clean = s => (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

    for (const a of linkNodes) {
      const classText = clean(a.textContent);
      // Example: "ANTH 126 - 01 Contraband"
      let className = classText;
      const m = classText.match(/^([A-Z&]+)\s+(\d+[A-Z]?)/);
      if (m) className = `${m[1]} ${m[2]}`;

      const row = a.closest(".row") || a.parentElement;
      const blockText = clean(row ? row.textContent : "");

      // Extract Instructor and Day and Time by labels
      // Keep the original Last,First format
      let professor = null;
      const instMatch = blockText.match(/Instructor:\s*([^:]+?)(?:\s+Location:|\s+Day and Time:|\s+Class Number:|$)/i);
      if (instMatch) professor = clean(instMatch[1]);

      let schedule = null;
      const timeMatch = blockText.match(/Day and Time:\s*([A-Za-z]{2,3}(?:[A-Za-z]{0,2})?\s+[0-9:APM\-–]+(?:\s*-\s*[0-9:APM]+)?)/i);
      if (timeMatch) schedule = clean(timeMatch[1]);

      if (className && schedule) {
        out.push({
          className,
          professor: professor || "TBA",
          schedule,
          generalEducation: geCode
        });
      }
    }
    return out;
  }, geCode);
}

async function clickNextIfAny(page) {
  const hasNext = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll("a"))
      .find(x => /next/i.test((x.textContent || "").trim()));
    return !!a;
  });
  if (!hasNext) return false;

  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll("a"))
      .find(x => /next/i.test((x.textContent || "").trim()));
    if (a) a.click();
  });
  await jitter(900, 1600);
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  await jitter(600, 1200);
  await humanBrowse(page);
  return true;
}

async function runSearch(page, geCode) {
  await page.select("#reg_status", "all");
  await jitter(600, 1200);

  await page.select("#ge", geCode);
  await jitter(700, 1400);

  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button, input[type='submit'], a"));
    const search = btns.find(b => /search/i.test((b.textContent || b.value || "").trim()));
    if (search) { search.click(); return true; }
    const form = document.querySelector("form");
    if (form) { form.submit(); return true; }
    return false;
  });
  if (!clicked) throw new Error("Search button not found");

  await jitter(900, 1600);
  await waitForResults(page);
  await humanBrowse(page);

  const rows = [];
  let guard = 0;
  while (true) {
    const pageRows = await scrapePage(page, geCode);
    rows.push(...pageRows);
    await jitter(800, 1400);
    const more = await clickNextIfAny(page);
    if (!more) break;
    guard += 1;
    if (guard > 80) break;
  }
  return rows;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1366, height: 900 },
    slowMo: 0,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  await page.goto(START_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#reg_status");
  await humanBrowse(page);

  const results = [];
  for (const ge of GE_CODES) {
    try {
      console.log("GE", ge);
      const r = await runSearch(page, ge);
      results.push(...r);
    } catch (e) {
      console.warn("Skipping GE due to error", ge, e.message);
    }
    await page.goto(START_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#reg_status");
    await humanBrowse(page);
    await jitter(1000, 2200);
  }

  // de-dupe identical entries
  const seen = new Set();
  const output = [];
  for (const row of results) {
    const key = `${row.className}__${row.professor}__${row.schedule}__${row.generalEducation}`;
    if (!seen.has(key)) {
      seen.add(key);
      output.push(row);
    }
  }

  fs.writeFileSync(OUT_FIXED, JSON.stringify(output, null, 2));
  fs.writeFileSync(OUT_TIMESTAMP, JSON.stringify(output, null, 2));

  console.log("Saved", output.length, "rows");
  console.log("Fixed file:", OUT_FIXED);
  console.log("Timestamped file:", OUT_TIMESTAMP);

  await browser.close();
})().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
