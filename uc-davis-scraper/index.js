const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  const allResults = [];

const geCheckboxes = [
  { id: "arts-and-humanities", label: "Arts & Humanities" },
  { id: "science-and-engineering", label: "Science & Engineering" },
  { id: "social-sciences", label: "Social Sciences" },
  { id: "domestic-diversity", label: "Domestic Diversity" },
  { id: "oral-lit", label: "Oral Literacy" },
  { id: "quantitavive-lit", label: "Quantitative Literacy" },  // typo in ID is correct
  { id: "scientific-lit", label: "Scientific Literacy" },
  { id: "visual-lit", label: "Visual Literacy" },
  { id: "world-culture", label: "World Cultures" },
  { id: "writing-experience", label: "Writing Experience" }
];


 const daySelectors = {
  Mon: "#Mon",
  Tue: "#Tue",
  Wed: "#Wed",
  Thu: "#Thu",
  Fri: "#Fri",
  Sat: "#Sat"
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
  ["Mon", "Wed", "Fri"]
];

if (fs.existsSync("results.json")) {
  fs.unlinkSync("results.json");
}

  for (const ge of geCheckboxes) {
    for (const days of dayCombos) {
      console.log(`🔍 GE: ${ge.label} | Days: ${days.join(", ")}`);

      await page.goto("https://registrar-apps.ucdavis.edu/courses/search/index.cfm", {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      // ✅ Interact with top-level page
      await page.waitForSelector(`#${ge.id}`);
      const isChecked = await page.$eval(`#${ge.id}`, el => el.checked);
      if (!isChecked) await page.click(`#${ge.id}`);

      // Clear all days
      for (const sel of Object.values(daySelectors)) {
        const checked = await page.$eval(sel, el => el.checked);
        if (checked) await page.click(sel);
      }

      // Select new days
      for (const day of days) {
        await page.click(daySelectors[day]);
      }

      // Submit form
    await page.click("input[type='button'][value='Search']");
await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
fs.writeFileSync("after-search.html", await page.content());

   await page.waitForSelector("#mc_win", { timeout: 20000 });
const frame = page;


      await page.screenshot({ path: `debug-ge-${ge.id}.png` });
      fs.writeFileSync(`debug-html-${ge.id}.html`, await page.content());
      console.log("📸 Screenshot and HTML saved for debugging");

      // Check for "no results" message
      const noResults = await frame.evaluate(() =>
        document.body.innerText.includes("No courses found with the following search parameters")
      );
      if (noResults) {
        console.log(`🚫 No results for GE ${ge.label} — ${days.join(", ")}`);
        continue;
      }
const currentDayLabel = days.join(" ");
      // Extract rows
const results = await frame.evaluate(() => {
  const table = document.querySelector("#mc_win");
  if (!table) return [];

  const rows = Array.from(table.querySelectorAll("tr")).slice(3);
  const data = [];

  for (const row of rows) {
    const cells = row.querySelectorAll("td");
    if (cells.length < 6) continue;

    const courseId = cells[1]?.innerText.trim();               // AHI 001A
    const schedule = cells[0]?.innerText.trim();               // 9:00 - 9:50 AM, M
    const className = cells[2]?.innerText.trim();              // Ancient Mediterran Art
  const geTags = Array.from(cells[3]?.querySelectorAll("acronym") || [])
      .map(acr => acr.textContent.trim());                     // ['AH', 'VL']
    const section = cells[3]?.innerText.trim();                // A01 (3/0)
    const professor = cells[4]?.childNodes[0]?.textContent.trim(); // Sofroniew, A
   const profRating = cells[4]?.querySelector("em")?.textContent.trim() || null;


    data.push({
      courseId,
      schedule,
      className,
      geTags,
      section,
      professor,
      profRating
    });
  }

  return data; // ✅ THIS is what comes back to the outside world
});
// ✅ Add GE and day info to each result manually
for (const r of results) {
  r.ge = ge.label;
  r.days = days.join(", ");
}



 const grouped = {};

for (const r of results) {
  // Clean schedule like "Mon 9:00 - 9:50 AM"
const cleanSchedule = `${currentDayLabel} ${r.schedule.replace(/^\d+\s*\n?/, "").split(",")[0].trim()}`;

const rawSection = r.section.split("\n")[0].split(/\s+/)[0].trim(); // e.g. "A01"
const cleanTitle = r.className.trim();                              // e.g. "Ancient Mediterran Art"
const cleanClassName = `${rawSection} - ${cleanTitle}`;            // e.g. "A01 - Ancient Mediterran Art"

const key = `${cleanClassName}__${r.professor}`;

if (!grouped[key]) {
  grouped[key] = {
    className: cleanClassName,
    professor: r.professor,
    ge: r.ge,
    schedule: [cleanSchedule],
    geTags: r.geTags,
    profRating: r.profRating
  };
} else {
  if (!grouped[key].schedule.includes(cleanSchedule)) {
    grouped[key].schedule.push(cleanSchedule);
  }
}


const groupedResults = Object.values(grouped);

allResults.push(...groupedResults);
console.log(`✅ Found ${groupedResults.length} result(s)`);
console.log(`📊 Extracted ${results.length} result(s) from DOM`);

     fs.writeFileSync("results.json", JSON.stringify(allResults, null, 2));
    }
     const groupedResults = Object.values(grouped);
    allResults.push(...groupedResults);
    console.log(`✅ Found ${groupedResults.length} result(s)`);
    console.log(`📊 Extracted ${results.length} result(s) from DOM`);
    fs.writeFileSync("results.json", JSON.stringify(allResults, null, 2));
  }
}

await browser.close();
})();


