const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer");

const START_URL = "https://classes.berkeley.edu/";
const TERM_URL = "https://classes.berkeley.edu/search/class?f[]=term:8573"; // Fall 2025

const generalReqs = [
  "1st Half of Reading & Composition",
  "2nd Half of Reading & Composition",
  "American Cultures",
  "American History",
  "American Institutions",
  "Entry Level Writing Requirement",
];

(async () => {
  // ---------- OUTPUT SETUP ----------
  const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
  const CUSTOM_BASE = process.env.BERKELEY_OUT_DIR;
  const BASE_OUT = CUSTOM_BASE || path.join(os.homedir(), "berkeley-scrapes");
  const OUT_DIR = path.join(BASE_OUT, STAMP);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const writeOut = (name, data) => fs.writeFileSync(path.join(OUT_DIR, name), data);
  const outPath = (name) => path.join(OUT_DIR, name);
  console.log("Output folder:", OUT_DIR);
  writeOut("00-start.txt", "created at " + new Date().toISOString());

  // ---------- HELPERS ----------
  const toAbs = (base, href) => new URL(href, base).toString();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, slowMo: 60 });
  const page = await browser.newPage();
  page.setDefaultTimeout(90000);

  const saveDebug = async (name) => writeOut(name, await page.content());

  const waitForResults = async () => {
    const candidates = [
      "ol.search-results",
      "div.search-results",
      "div.view-search-results",
      "div.view-content",
      "div.search-result, li.search-result",
      "h3.search-result__title",
      "article.node--course",
      "div.search-result__row",
    ];
    const sel = candidates.join(", ");
    const ok = await Promise.race([
      page.waitForSelector(sel, { timeout: 30000 }).then(() => true).catch(() => false),
      (async () => {
        await sleep(32000);
        return false;
      })(),
    ]);
    if (!ok) {
      await saveDebug("no-results-container.html");
      await page.screenshot({ path: outPath("no-results-container.png") });
      console.warn("No known results container found. Saved no-results-container.html");
    }
    return ok; // don't throw
  };

  const dismissCookiesIfAny = async () => {
    try {
      const btn = await page.$(`::-p-text(Accept)`);
      if (btn) {
        await btn.click();
        await sleep(300);
      }
    } catch {}
  };

  const clickTermByText = async (termText) => {
    const el = await page.waitForSelector(`::-p-text(${JSON.stringify(termText)})`, { timeout: 30000 });
    const prevUrl = page.url();
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
      el.click(),
    ]);
    console.log("After term click:", page.url());
    if (page.url() === prevUrl) console.warn("URL did not change after term click");
  };

  const gotoFacetByLabel = async (label) => {
    // read facet href and navigate directly (clicks are flaky)
    const href = await page.evaluate((lab) => {
      const a = Array.from(document.querySelectorAll('a[data-drupal-facet-item-value]'))
        .find((el) => el.getAttribute("data-drupal-facet-item-value") === lab);
      return a ? a.getAttribute("href") : null;
    }, label);

    if (!href) {
      await page.screenshot({ path: outPath(`facet-not-found-${label.replace(/\W+/g, "_")}.png`) });
      throw new Error(`Facet not found: ${label}`);
    }

    const target = toAbs(await page.url(), href);
    await page.goto(target, { waitUntil: "networkidle0", timeout: 60000 });
    console.log(`After facet "${label}" click:`, page.url());

    // Save FIRST so we always have a snapshot even if wait fails
    await saveDebug(`facet-${label.replace(/\W+/g, "_")}-page1.html`);
    await page.screenshot({ path: outPath(`facet-${label.replace(/\W+/g, "_")}-page1.png`) });

    await waitForResults();
  };

  // ---------- HUB DETECTION & SUBJECT LINKING ----------
  const isSubjectHubPage = async () => {
    return await page.evaluate(() => {
      const h2 = document.querySelector("h2");
      const t = h2 ? h2.textContent.trim() : "";
      if (t.includes("Search by Department Subject")) return true;

      // Heuristic: a big list with lots of subject links in main content
      const lists = Array.from(document.querySelectorAll("main ul, main ol"));
      return lists.some((list) => list.querySelectorAll("a").length > 10);
    });
  };

  const getSubjectLinks = async () => {
    const links = await page.evaluate(() => {
      // Only pull links from the main content area pointing to /search/class
      const arr = Array.from(document.querySelectorAll("main a[href*='search/class']"));

      // Filter out facet chips or irrelevant links; keep ones with "(N)" counts or obvious subject names
      const filtered = arr.filter((a) => {
        const txt = (a.textContent || "").trim();
        const hasCount = /\(\d+\)$/.test(txt); // e.g. "English (11)"
        const looksSubject = /^[A-Za-z].+/.test(txt) && txt.length < 90;
        return txt && (hasCount || looksSubject);
      });

      return filtered.map((a) => a.getAttribute("href"));
    });

    // de-dupe & absolutize
    const uniq = Array.from(new Set(links)).map((href) => new URL(href, window.location.href).toString());
    return uniq;
  };

  // ---------- SCRAPING ----------
  const scrapeOnePage = async () => {
    return await page.evaluate(() => {
      const pick = (el, sel) => el.querySelector(sel)?.textContent.trim() || null;

      // Try common wrappers
      const list = document.querySelector("ol.search-results");
      const cards = list
        ? Array.from(list.querySelectorAll("li"))
        : Array.from(
            document.querySelectorAll(
              "li.search-result, div.search-result, div.st--result, article.node--course, div.search-result__row"
            )
          );

      const out = [];
      for (const card of cards) {
        const className =
          pick(card, ".st--section-name") ||
          pick(card, "h3.search-result__title") ||
          pick(card, ".st--course-title") ||
          pick(card, "h3, h2");

        const professor =
          pick(card, ".st--instructors") ||
          pick(card, ".instructors") ||
          pick(card, "[class*='instructor']");

        const daysNode =
          card.querySelector(".st--meeting-days span:nth-of-type(2)") ||
          card.querySelector(".st--meeting-days span") ||
          card.querySelector("[class*='meeting-days'] span");

        const timeNode =
          card.querySelector(".st--meeting-time span:nth-of-type(2)") ||
          card.querySelector(".st--meeting-time span") ||
          card.querySelector("[class*='meeting-time'] span");

        const meetingDays = daysNode ? daysNode.textContent.trim() : null;
        const meetingTime = timeNode ? timeNode.textContent.trim() : null;

        let seats = pick(card, ".st--seats strong") || pick(card, ".st--seats") || pick(card, "[class*='seats']");
        let unitsRaw = pick(card, ".st--details-unit") || pick(card, "[class*='details-unit']");
        let units = null;
        if (unitsRaw) {
          const m = unitsRaw.match(/Units:\s*([\d.]+)/i);
          units = m ? m[1] : unitsRaw.replace(/Units:\s*/i, "").trim();
        }

        if (className) out.push({ className, professor, meetingDays, meetingTime, seats, units });
      }
      return out;
    });
  };

  const clickNextIfAny = async () => {
    const href = await page.evaluate(() => {
      const byRel = document.querySelector("a[rel~='next']");
      if (byRel && byRel.getAttribute("href")) return byRel.getAttribute("href");

      const byText = Array.from(document.querySelectorAll("a")).find((a) => a.textContent.trim() === "Next");
      if (byText && byText.getAttribute("href")) return byText.getAttribute("href");

      const url = new URL(window.location.href);
      const cur = Number(url.searchParams.get("page") || "0");
      const num = Array.from(document.querySelectorAll("a[href*='page=']")).find((a) => {
        const href = a.getAttribute("href");
        if (!href) return false;
        const u = new URL(href, window.location.origin);
        const n = Number(new URLSearchParams(u.search).get("page") || "0");
        return n === cur + 1;
      });
      return num ? num.getAttribute("href") : null;
    });

    if (!href) {
      console.log("No next page");
      return false;
    }
    const target = toAbs(await page.url(), href);
    console.log("Next page href:", target);
    await page.goto(target, { waitUntil: "networkidle0", timeout: 60000 });
    await waitForResults();
    await saveDebug(`page-${new URL(target).searchParams.get("page") || "2"}.html`);
    return true;
  };

  const scrapeListingPages = async (bucketLabel) => {
    let pageIndex = 0;
    while (true) {
      pageIndex += 1;
      await sleep(400);

      const results = await scrapeOnePage();
      if (pageIndex === 1 && results.length === 0) {
        await saveDebug(`empty-first-page-${bucketLabel.replace(/\W+/g, "_")}.html`);
        await page.screenshot({ path: outPath(`empty-first-page-${bucketLabel.replace(/\W+/g, "_")}.png`) });
      }
      console.log(`${bucketLabel} — Page ${pageIndex} rows: ${results.length}`);

      results.forEach((r) => (r.generalRequirement = bucketLabel));
      allResults.push(...results);

      await page.screenshot({ path: outPath(`page-${bucketLabel.replace(/\W+/g, "_")}-${pageIndex}.png`) });

      const hasNext = await clickNextIfAny();
      if (!hasNext) break;
    }
  };

  // ---------- RUN ----------
  await page.goto(START_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body");
  await saveDebug("after-start.html");
  await page.screenshot({ path: outPath("after-start.png") });

  await dismissCookiesIfAny();
  await clickTermByText("Fall 2025"); // or: await page.goto(TERM_URL, { waitUntil: "networkidle0" });
  await saveDebug("after-term.html");
  await page.screenshot({ path: outPath("after-term.png") });

  const allResults = [];

  for (const req of generalReqs) {
    console.log(`Filter: ${req}`);
    try {
      await gotoFacetByLabel(req);

      if (await isSubjectHubPage()) {
        console.log(`[${req}] Subject hub detected — collecting department links…`);
        const subjects = await getSubjectLinks();
        console.log(`[${req}] Found ${subjects.length} subject links`);

        for (const [i, href] of subjects.entries()) {
          console.log(`[${req}] Subject ${i + 1}/${subjects.length}: ${href}`);
          await page.goto(href, { waitUntil: "networkidle0", timeout: 60000 });
          await waitForResults();
          await saveDebug(`subject-${req.replace(/\W+/g, "_")}-${i + 1}.html`);
          await scrapeListingPages(req);
        }
      } else {
        // Already on listing results
        await scrapeListingPages(req);
      }
    } catch (e) {
      console.warn(`Skipping "${req}" due to error:`, e.message);
    }

    // Reset back to the term-only results before the next facet
    await page.goto(TERM_URL, { waitUntil: "networkidle0" });
    await waitForResults();
  }

  // ---------- GROUP & WRITE ----------
  const grouped = {};
  for (const r of allResults) {
    const key = `${r.className}__${r.professor || "TBA"}__${r.generalRequirement}`;
    if (!grouped[key]) {
      grouped[key] = {
        className: r.className,
        professor: r.professor || null,
        schedules: [],
        seats: r.seats || null,
        units: r.units || null,
        generalRequirement: r.generalRequirement,
      };
    }
    const sched = `${r.meetingDays || ""} ${r.meetingTime || ""}`.trim();
    if (sched && !grouped[key].schedules.includes(sched)) grouped[key].schedules.push(sched);
  }

  const output = Object.values(grouped);
  writeOut("berkeley-classes.json", JSON.stringify(output, null, 2));
  console.log(`Saved ${output.length} unique rows to berkeley-classes.json`);
  console.log(`Folder: ${OUT_DIR}`);

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
