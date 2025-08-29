const puppeteer = require("puppeteer");
const fs = require("fs");

// ---------- Politeness helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Tune these safely (milliseconds)
const BETWEEN_PAGE_MS = [3500, 8000];   // before/after page loads & between searches
const BETWEEN_ACTION_MS = [200, 900];   // between clicks/typing
const TIMEOUT_BACKOFF_MS = [8000, 15000]; // after timeouts

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      // Keep it modest & stable
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const page = await browser.newPage();
  // Light fingerprint stabilization (polite, not evasive)
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(60000);

  const BASE_URL = "https://registrar-apps.ucdavis.edu/courses/search/index.cfm";
  const allResults = [];

  const geCheckboxes = [
    { id: "arts-and-humanities", label: "Arts & Humanities" },
    { id: "science-and-engineering", label: "Science & Engineering" },
    { id: "social-sciences", label: "Social Sciences" },
    { id: "domestic-diversity", label: "Domestic Diversity" },
    { id: "oral-lit", label: "Oral Literacy" },
    { id: "quantitavive-lit", label: "Quantitative Literacy" }, // typo in ID is correct
    { id: "scientific-lit", label: "Scientific Literacy" },
    { id: "visual-lit", label: "Visual Literacy" },
    { id: "world-culture", label: "World Cultures" },
    { id: "writing-experience", label: "Writing Experience" },
  ];

  const daySelectors = {
    Mon: "#Mon",
    Tue: "#Tue",
    Wed: "#Wed",
    Thu: "#Thu",
    Fri: "#Fri",
    Sat: "#Sat",
  };

  const dayCombos = [
    ["Mon"],
    ["Tue"],
    ["Wed"],
    ["Thu"],
    ["Fri"],
    ["Sat"],
    ["Mon", "Wed"],
    ["Tue", "Thu"],
    ["Mon", "Wed", "Fri"],
  ];

  if (fs.existsSync("results.json")) {
    fs.unlinkSync("results.json");
  }

  for (const ge of geCheckboxes) {
    for (const days of dayCombos) {
      console.log(`🔍 GE: ${ge.label} | Days: ${days.join(", ")}`);

      // Polite pause before a new page load / query
      await sleep(rand(...BETWEEN_PAGE_MS));

      // Load search page
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

      // Small human-like pause
      await sleep(rand(...BETWEEN_ACTION_MS));

      // Ensure checkbox present then check it
      await page.waitForSelector(`#${ge.id}`, { timeout: 30000 });
      const isChecked = await page.$eval(`#${ge.id}`, (el) => el.checked);
      if (!isChecked) {
        await page.click(`#${ge.id}`);
        await sleep(rand(...BETWEEN_ACTION_MS));
      }

      // Clear all days
      for (const sel of Object.values(daySelectors)) {
        const exists = await page.$(sel);
        if (!exists) continue;
        const checked = await page.$eval(sel, (el) => el.checked);
        if (checked) {
          await page.click(sel);
          await sleep(rand(...BETWEEN_ACTION_MS));
        }
      }

      // Select new days
      for (const day of days) {
        await page.click(daySelectors[day]);
        await sleep(rand(...BETWEEN_ACTION_MS));
      }

      // Submit form
      await sleep(rand(...BETWEEN_ACTION_MS));
      await page.click("input[type='button'][value='Search']");

      // Wait for either the results table OR the "no results" message
      let status;
      try {
        status = await Promise.race([
          page
            .waitForSelector("#mc_win tr:nth-child(4) td", { timeout: 60000 })
            .then(() => "table"),
          page
            .waitForFunction(
              () =>
                document.body.innerText.includes(
                  "No courses found with the following search parameters"
                ),
              { timeout: 60000 }
            )
            .then(() => "empty"),
        ]);
      } catch (_) {
        status = "timeout";
      }

      // Debug artifacts (write sparingly)
      try {
        fs.writeFileSync("after-search.html", await page.content());
        await page.screenshot({ path: `debug-ge-${ge.id}.png` });
      } catch {}

      if (status === "empty") {
        console.log(`🚫 No results for GE ${ge.label} — ${days.join(", ")}`);
        // Polite pause before next iteration
        await sleep(rand(...BETWEEN_PAGE_MS));
        continue;
      }

      if (status !== "table") {
        console.warn(
          `⚠️ Timed out waiting for results for ${ge.label} — ${days.join(", ")}`
        );
        // Backoff before next attempt/iteration
        await sleep(rand(...TIMEOUT_BACKOFF_MS));
        continue;
      }

      // Another brief pause before scraping the DOM
      await sleep(rand(...BETWEEN_ACTION_MS));

      // Extract rows
      const currentDayLabel = days.join(", ");
      const results = await page.evaluate(() => {
        const table = document.querySelector("#mc_win");
        if (!table) return [];

        const rows = Array.from(table.querySelectorAll("tr"));
        const data = [];

        const text = (el) => (el?.innerText || "").trim();

        for (const row of rows) {
          const cells = row.querySelectorAll("td");
          if (cells.length < 5) continue;

          const c0 = text(cells[0]); // CRN/Time/Days column (header says "CRN\nTime/Days")
          const c1 = text(cells[1]); // Subject+course (e.g., "AHI 001A")
          const c2 = text(cells[2]); // Title
          const c3 = text(cells[3]); // Section + GE tags
          const c4 = cells[4]; // Instructor + <em>rating</em>

          // Skip header/separator rows
          if (/CRN\s*Time\/Days/i.test(c0) || /Title\s*-\s*Section/i.test(c2)) continue;

          // Time only from c0 (remove CRN prefix and anything after first comma)
          const scheduleTime = c0.replace(/^\d+\s*/, "").split(",")[0].trim();

          // Section code: A01, 001, A1, B12, 010, etc.
          const sectionCodeMatch = c3.match(/\b([A-Z]?\d{2,3})\b/);
          const sectionCode = sectionCodeMatch ? sectionCodeMatch[1] : "";

          // GE tags inside <acronym>
          const geTags = Array.from(cells[3].querySelectorAll("acronym"))
            .map((a) => (a.textContent || "").trim())
            .filter(Boolean);

          // Instructor + rating
          const professor = ((c4.childNodes[0]?.textContent) || "").trim();
          const profRating = c4.querySelector("em")?.textContent.trim() || null;

          data.push({
            courseId: c1,
            classTitle: c2,
            sectionCode,
            scheduleTime,
            geTags,
            professor,
            profRating,
          });
        }
        return data;
      });

      // Attach metadata & group
      for (const r of results) {
        r.ge = ge.label;
        r.days = currentDayLabel;
      }

      const grouped = {};
      for (const r of results) {
        if (!r.classTitle || !r.sectionCode || !r.scheduleTime) continue;
        const cleanClassName = `${r.classTitle} - ${r.sectionCode}`;
        const cleanSchedule = `${currentDayLabel} ${r.scheduleTime}`.replace(/\s+/g, " ").trim();
        const key = `${cleanClassName}__${r.professor}`;
        if (!grouped[key]) {
          grouped[key] = {
            className: cleanClassName,
            professor: r.professor,
            ge: ge.label,
            schedule: [cleanSchedule],
            geTags: Array.from(new Set(r.geTags)),
            profRating: r.profRating,
          };
        } else {
          if (!grouped[key].schedule.includes(cleanSchedule)) {
            grouped[key].schedule.push(cleanSchedule);
          }
        }
      }

      const groupedResults = Object.values(grouped);
      allResults.push(...groupedResults);
      console.log(`✅ Found ${groupedResults.length} result(s)`);
      console.log(`📊 Extracted ${results.length} node(s) from DOM`);

      // Polite pause between iterations
      await sleep(rand(...BETWEEN_PAGE_MS));
    }
  }

  // --- dedupe & final write ---
  const seen = new Set();
  const deduped = [];
  for (const row of allResults) {
    const schedKey = Array.isArray(row.schedule) ? [...row.schedule].sort().join("|") : "";
    const k = `${row.className}__${row.professor}__${row.ge}__${schedKey}`;
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(row);
    }
  }
  fs.writeFileSync("results.json", JSON.stringify(deduped, null, 2));

  await browser.close();
})();
