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

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    slowMo: 60
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(90_000);

  const saveDebug = async (name) => writeOut(name, await page.content());

  const waitForResults = async () => {
    // wait for overlay to disappear (if present)
    try {
      await page.waitForFunction(() => {
        const el = document.querySelector(".loading-popup");
        return !el || getComputedStyle(el).display === "none";
      }, { timeout: 60_000 });
    } catch {}

    // wait for at least one result card
    const ok = await page
      .waitForSelector("div.view-content article.st", { timeout: 60_000 })
      .then(() => true)
      .catch(() => false);

    if (!ok) {
      await saveDebug("no-results-container.html");
      await page.screenshot({ path: outPath("no-results-container.png") });
      console.warn("No known results container found. Saved no-results-container.html");
    }
    return ok;
  };
const ensureMeetingsVisible = async () => {
  // nudge lazy content
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    window.scrollTo(0, 0);
    await sleep(100);
    window.scrollTo(0, document.body.scrollHeight);
    await sleep(250);
    window.scrollTo(0, 0);
  });

  // try to expand collapsed schedules inside cards
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const cards = Array.from(document.querySelectorAll("div.view-content article.st"));
    for (const c of cards) {
      // if we already see any meeting rows, skip
      if (c.querySelector(".st--meetings, .st--meeting, .st--meeting-row, .st--meeting-body")) continue;

      const toggles = [
        "button[aria-expanded='false']",
        "a[aria-expanded='false']",
        ".st--toggle",
        ".st--expand",
        ".st--more",
        "[data-once='sectionToggle']"
      ];
      const toggle = toggles.map(sel => c.querySelector(sel)).find(Boolean);
      if (toggle) {
        toggle.click();
        await sleep(150);
      }
    }
  });

  // tiny settle wait
await sleep(300);
};
  // Puppeteer doesn’t support Playwright’s ::-p-text(). Use a simple text match.
  const dismissCookiesIfAny = async () => {
    try {
      const handle = await page.evaluateHandle(() => {
        const candidates = Array.from(document.querySelectorAll("button, a, div[role='button']"));
        return candidates.find(el => /accept|agree/i.test((el.textContent || "").trim())) || null;
      });
      if (handle) {
        const el = handle.asElement();
        if (el) await el.click();
        await sleep(300);
      }
    } catch {}
  };

  const gotoFacetByLabel = async (label) => {
    const href = await page.evaluate((lab) => {
      // try exact facet value match
      const anchors = Array.from(document.querySelectorAll("a[data-drupal-facet-item-value]"));
      const byValue = anchors.find(a =>
        a.getAttribute("data-drupal-facet-item-value") === lab ||
        a.getAttribute("data-drupal-facet-item-value") === `general_requirements:${lab}`
      );
      if (byValue) return byValue.getAttribute("href");

      // fallback: match visible text (trim, collapse whitespace)
      const norm = s => (s || "").replace(/\s+/g, " ").trim();
      const byText = anchors.find(a => norm(a.textContent) === norm(lab));
      return byText ? byText.getAttribute("href") : null;
    }, label);

    if (!href) {
      await page.screenshot({ path: outPath(`facet-not-found-${label.replace(/\W+/g, "_")}.png`) });
      throw new Error(`Facet not found: ${label}`);
    }

    const target = toAbs(await page.url(), href);
    await page.goto(target, { waitUntil: "networkidle0", timeout: 60_000 });
    console.log(`After facet "${label}" click:`, page.url());
    await saveDebug(`facet-${label.replace(/\W+/g, "_")}-page1.html`);
    await page.screenshot({ path: outPath(`facet-${label.replace(/\W+/g, "_")}-page1.png`) });
   // instead of: await waitForResults();
await Promise.race([
  waitForResults(), // listing page with cards
  page.waitForSelector("h2, main ul a[href*='search/class']", { timeout: 10_000 }).catch(() => {})
]);
  };

  // ---------- HUB DETECTION & SUBJECT LINKING ----------
  const isSubjectHubPage = async () => {
    return await page.evaluate(() => {
      const h2 = document.querySelector("h2");
      const t = h2 ? h2.textContent.trim() : "";
      if (t.includes("Search by Department Subject")) return true;
      const lists = Array.from(document.querySelectorAll("main ul, main ol"));
      return lists.some((list) => list.querySelectorAll("a").length > 10);
    });
  };

  const getSubjectLinks = async () => {
    const links = await page.evaluate(() => {
      const arr = Array.from(document.querySelectorAll("main a[href*='search/class']"));
      const filtered = arr.filter((a) => {
        const txt = (a.textContent || "").trim();
        const hasCount = /\(\d+\)$/.test(txt);
        const looksSubject = /^[A-Za-z].+/.test(txt) && txt.length < 90;
        return txt && (hasCount || looksSubject);
      });
      return filtered.map((a) => a.getAttribute("href"));
    });
    const uniq = Array.from(new Set(links)).map((href) => new URL(href, window.location.href).toString());
    return uniq;
  };

  // ---------- SCRAPING ----------
const scrapeOnePage = async () => {
  return await page.evaluate(() => {
    const pick = (el, sel) => el.querySelector(sel)?.textContent.trim() || null;
    const pickOneOf = (root, sels) => {
      for (const s of sels) {
        const el = root.querySelector(s);
        if (el) return el.textContent.trim();
      }
      return null;
    };

    const cards = Array.from(document.querySelectorAll(
      "div.view-content .views-row article.st," +
      "article.node--course, li.search-result, div.search-result, div.st--result, div.search-result__row"
    ));

    const out = [];
    for (const card of cards) {
      const className =
        pick(card, ".st--section-name") ||
        pick(card, ".st--course-title") ||
        pick(card, "h3, h2");

      const professor =
        pick(card, ".st--instructors .st--value") ||
        pick(card, ".st--instructors") ||
        pick(card, "[class*='instructor']");

      // Meeting rows: include lists, rows, tables
      const meetingRows = Array.from(card.querySelectorAll([
        ".st--meetings",
        ".st--meeting",
        ".st--meeting-row",
        ".st--meeting-body",
        ".st--meetings .st--row",
        ".st--meetings li",
        ".st--meetings tr"
      ].join(", "))).flatMap(container => {
        // If we picked a container, prefer its children as rows
        const rows = container.querySelectorAll(".st--meeting, .st--meeting-row, .st--row, li, tr");
        return rows.length ? Array.from(rows) : [container];
      });

      // BEFORE: we built `parts = [kind, days, time, place]` and used all of them
// AFTER: only keep days + time and strip the external-link text
const strip = (s) => (s || "").replace(/\s*\(link is external\)\s*/gi, "").trim();

const meetings = meetingRows.map(row => {
  const days = pickOneOf(row, [
    ".st--meeting-days .st--value",
    "[class*='meeting-days'] .st--value",
    "[class*='meeting-days']",
    ".st--days .st--value",
    ".st--days"
  ]);

  const timeEl = row.querySelector("time");
  const time = timeEl?.textContent.trim() || pickOneOf(row, [
    ".st--meeting-time .st--value",
    "[class*='meeting-time'] .st--value",
    "[class*='meeting-time']",
    ".st--time .st--value",
    ".st--time"
  ]);

  const d = strip(days);
  const t = strip(time);
  if (!d || !t) return null;

  return {
    days: d,
    time: t,
    text: `${d} • ${t}`
  };
}).filter(Boolean);

// Fallback single fields (also strip the token)
let meetingDays =
  strip(pick(card, ".st--meeting-days .st--value") ||
        pick(card, ".st--meeting-days span") ||
        pick(card, "[class*='meeting-days'] span") ||
        pick(card, "[class*='meeting-days']"));

let meetingTime =
  strip(card.querySelector("time")?.textContent.trim() ||
        pick(card, ".st--meeting-time .st--value") ||
        pick(card, ".st--meeting-time span") ||
        pick(card, "[class*='meeting-time'] span") ||
        pick(card, "[class*='meeting-time']"));

if ((!meetingDays || !meetingTime) && meetings.length) {
  meetingDays = meetingDays || meetings[0].days;
  meetingTime = meetingTime || meetings[0].time;
}


      const seats =
        pick(card, ".st--seats .st--value") ||
        pick(card, ".st--seats strong") ||
        pick(card, ".st--seats") ||
        pick(card, "[class*='seats']");

      let units =
        pick(card, ".st--units .st--value") ||
        pick(card, ".st--details-unit") ||
        pick(card, "[class*='unit']");
      if (units) {
        const m = units.match(/Units:\s*([\d.]+)/i);
        if (m) units = m[1];
      }

      if (className) {
        out.push({
          className,
          professor,
          meetingDays: meetingDays || null,
          meetingTime: meetingTime || null,
          schedules: Array.from(new Set(meetings.map(m => m.text))), // dedupe
          seats,
          units
        });
      }
    }
    return out;
  });
};

  const clickNextIfAny = async () => {
    const href = await page.evaluate(() => {
      const byRel = document.querySelector("a[rel~='next']");
      if (byRel && byRel.getAttribute("href")) return byRel.getAttribute("href");

      const byText = Array.from(document.querySelectorAll("a"))
        .find(a => a.textContent.trim() === "Next");
      if (byText && byText.getAttribute("href")) return byText.getAttribute("href");

      const url = new URL(window.location.href);
      const cur = Number(url.searchParams.get("page") || "0");
      const num = Array.from(document.querySelectorAll("a[href*='page=']")).find(a => {
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
    await page.goto(target, { waitUntil: "networkidle0", timeout: 60_000 });
    await waitForResults();
    await ensureMeetingsVisible();   // <— ADD THIS
    await saveDebug(`page-${new URL(target).searchParams.get("page") || "2"}.html`);
    return true;
  };
// Click any per-card expanders and give the DOM a moment to render.


  const scrapeListingPages = async (bucketLabel) => {
    let pageIndex = 0;
    while (true) {
      pageIndex += 1;
      await sleep(400);
await ensureMeetingsVisible();   // <— ADD THIS
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
  await page.goto(TERM_URL, { waitUntil: "networkidle0", timeout: 60_000 });
  await waitForResults();
  await ensureMeetingsVisible();   // <— ADD THIS
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
          await page.goto(href, { waitUntil: "networkidle0", timeout: 60_000 });
          await waitForResults();
          await ensureMeetingsVisible();   // <— ADD THIS
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
    await ensureMeetingsVisible();   // <— ADD THIS
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
    const scheds = Array.isArray(r.schedules) && r.schedules.length
      ? r.schedules
      : (r.meetingDays && r.meetingTime)
+    [`${r.meetingDays} • ${r.meetingTime}`]
+    [];
    for (const s of scheds) {
      if (s && !grouped[key].schedules.includes(s)) grouped[key].schedules.push(s);
    }
  } // <-- close the for...of loop

  const output = Object.values(grouped);
  writeOut("berkeley-classes.json", JSON.stringify(output, null, 2));
  console.log(`Saved ${output.length} unique rows to berkeley-classes.json`);
  console.log(`Folder: ${OUT_DIR}`);

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
