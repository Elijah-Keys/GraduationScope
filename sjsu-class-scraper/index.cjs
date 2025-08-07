require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const { exec } = require("child_process");
const readline = require("readline");

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}


(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"]
    });

    const page = await browser.newPage();
    const loginUrl = "https://cmsweb.cms.sjsu.edu/psp/CSJPRD_1/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_CART.GBL?Page=SSR_SSENRL_CART&Action=A&ExactKeys=Y&TargetFrameName=None";

    console.log(`🔗 Navigating to: ${loginUrl}`);
    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("✋ Please log in manually and approve Duo.");
    console.log("🕐 Log in, click 'Fall 2025', then 'Search'.");
    console.log("⏳ When you're on the class search screen, press ENTER here to continue.");
    await new Promise(resolve => {
      process.stdin.once("data", () => resolve());
    });
// Wait for iframe and switch to it
await page.waitForSelector("iframe[name='TargetContent']", { timeout: 15000 });
const frameHandle = await page.$("iframe[name='TargetContent']");
const frame = await frameHandle.contentFrame();

    const classList = JSON.parse(fs.readFileSync("classes.json", "utf8"));
    const allResults = [];

    for (const entry of classList) {
      const { subject, catalog } = entry;
      console.log(`🔍 Searching: ${subject} ${catalog}`);


      await frame.waitForSelector("#SSR_CLSRCH_WRK_SUBJECT\\$0", { visible: true });
await frame.evaluate(() => {
  document.getElementById("SSR_CLSRCH_WRK_SUBJECT$0").value = "";
  document.getElementById("SSR_CLSRCH_WRK_CATALOG_NBR$1").value = "";
});

await frame.type("#SSR_CLSRCH_WRK_SUBJECT\\$0", subject);
await frame.type("#SSR_CLSRCH_WRK_CATALOG_NBR\\$1", catalog);

// 💡 Trigger pyautogui click
exec("python3 pyclick-test.py", (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ pyautogui click failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ pyautogui stderr: ${stderr}`);
    return;
  }
  console.log("🖱️ Clicked Search button with pyautogui");
});

// 🕐 Wait for the search results to visually load
await new Promise(resolve => setTimeout(resolve, 2000));

await frame.waitForFunction(() => {
  const anchors = Array.from(document.querySelectorAll("a.gh-footer-item"));
  return anchors.some(a => a.textContent.trim().toLowerCase() === "search" &&
    a.getAttribute("onclick")?.includes("CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH"));
}, { timeout: 10000 });

await frame.evaluate(() => {
  submitAction_win1(document.win1, "CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH", new MouseEvent("click"));
});
console.log("🚀 Triggered search with JavaScript");

await new Promise(resolve => setTimeout(resolve, 2000)); // wait for results to load

const iframeBox = await frameHandle.boundingBox();
if (!iframeBox) throw new Error("Iframe bounding box not found");

await page.bringToFront();
await frameHandle.click();
await page.mouse.click(iframeBox.x + 1100, iframeBox.y + 660); // Adjust if needed
console.log("🖱️ Clicked Search button (via coordinates)");

// ✅ Wait until the user manually expands the first course block
console.log("⏳ Expand the course block manually. Then tell me how many results to scrape.");
const answer = await askQuestion(`🔢 How many results should we keep for ${subject} ${catalog}? `);
const maxResults = parseInt(answer) || 25;

// Wait until at least 1 instructor is visible (after user manually expands block)




page.on('console', msg => console.log('🧠 Browser log:', msg.text()));


try {
  await frame.waitForSelector("div[id^='win1divMTG_INSTR$']", { visible: true, timeout: 10000 });

const results = await frame.evaluate((defaultClassName, maxResults) => {
  const classNameRaw = document.querySelector("span.PAGROUPDIVIDER")?.textContent.trim() || defaultClassName;

  const instructors = Array.from(document.querySelectorAll("div[id^='win1divMTG_INSTR$'] span"));
  const schedules = Array.from(document.querySelectorAll("div[id^='win1divMTG_DAYTIME$'] span"));
  const statuses = Array.from(document.querySelectorAll("div[id^='win1divDERIVED_CLSRCH_SSR_STATUS_LONG$']"));

  const entries = [];
  let count = 0;

  for (let i = 0; i < instructors.length; i++) {
    const instructor = instructors[i]?.textContent.trim() || "";
    if (/to be announced/i.test(instructor)) continue;

    const schedule = schedules[i]?.textContent.trim() || "";
    const status = statuses[i]?.textContent.trim() || "";

    entries.push({ className: classNameRaw, instructor, schedule, status });
    count++;
    if (count >= maxResults) break;
  }

  return entries;
}, `${subject} ${catalog}`, maxResults); // ⬅️ Make sure `maxResults` is defined above this line


const grouped = {};
for (const r of results) {
  const key = `${r.className}__${r.instructor}`;
  if (!grouped[key]) {
    grouped[key] = {
      className: r.className,
      professor: r.instructor,
      schedule: [r.schedule],
      status: r.status
    };
  } else {
    if (!grouped[key].schedule.includes(r.schedule)) {
      grouped[key].schedule.push(r.schedule);
    }
  }
}

const groupedResults = Object.values(grouped);
console.log(`✅ Processed ${groupedResults.length} grouped result(s)`);
allResults.push(...groupedResults);


 console.log(`✅ Scraped ${results.length} result(s) for ${subject} ${catalog}`);


// Save after every class
fs.writeFileSync("results.json", JSON.stringify(allResults, null, 2));
console.log(`📁 Saved results so far (${allResults.length}) to results.json`);

await askQuestion("⏭️ Press ENTER when ready for next class...");


} catch (e) {
  console.log(`⚠️ Failed to scrape results for ${subject} ${catalog}`);
}

  const html = await frame.content();
  fs.writeFileSync("debug-ccs74.html", html);
  console.log("📝 Saved raw HTML to debug-ccs74.html");
}


     try {
  await frame.waitForSelector("input[value='New Search'], a[class*='SSSBUTTON_LINK']", { visible: true, timeout: 10000 });
  await frame.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("input[value='New Search'], a[class*='SSSBUTTON_LINK']"));
    const newSearch = buttons.find(btn => btn.textContent?.includes("New Search") || btn.value?.includes("New Search"));
    if (newSearch) newSearch.click();
  });
  await new Promise(resolve => setTimeout(resolve, 1500));
} catch {
  console.log("⚠️ Couldn't return to search (selector-based).");
}




  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
})();
