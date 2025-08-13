import React, { useState, useEffect } from "react";
import { BerkeleyTOPIC_TO_CLASSES } from "./BerkeleyTopic_To_Classes";
import "./ChicoClassRecommendation.css";
import "../pages/GETracker.css";
import { FiSearch } from "react-icons/fi";
import { PiMedal } from "react-icons/pi";
import { BsStars } from "react-icons/bs";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { GoGoal } from "react-icons/go";
console.log("[CR FILE] loaded");

// ==========================
// DATA ARRAYS
// ==========================
const ACADEMIC_AREAS = [
  { id: "science", label: "Science 🧪" },
  { id: "business", label: "Business & Economics 📊" },
  { id: "social", label: "Social Sciences 🧑‍🎓" },
  { id: "health", label: "Health ⛑️" },
  { id: "education", label: "Education 📚" },
  { id: "engineering", label: "Engineering 🏗️" },
  { id: "math", label: "Mathematics ➕" },
  { id: "language", label: "Languages & Linguistics 🗣️" },
  { id: "environment", label: "Environmental Studies 🌴" },
  { id: "communication", label: "Communication & Media 📱" },
  { id: "law", label: "Law & Policy 🧑‍⚖️" },
  { id: "history", label: "History & Culture 🌎" },
  { id: "philosophy", label: "Philosophy & Ethics 🔮" },
  { id: "computer", label: "Computer Science 💻" },
  { id: "psychology", label: "Psychology 🧠" },
  { id: "politics", label: "Politics & Government 🏛️" },
  { id: "art_design", label: "Art 🎨" },
  { id: "music", label: "Music 🎶" },
];

// ==========================
// STYLES
// ==========================
const brandBlue = "#7589F3";

const thStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "1rem",
  color: "#333",
  backgroundColor: "#F9FAFC",
  border: "1px solid #E0E0E0",
};

const tdStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "0.95rem",
  verticalAlign: "top",
  border: "1px solid #E0E0E0",
};

// ==========================
// SMALL UTILS
// ==========================
function getEvenPyramidRows(array, rowCount = 4) {
  const rows = Array.from({ length: rowCount }, () => []);
  let i = 0;
  for (const item of array) {
    rows[i % rowCount].push(item);
    i++;
  }
  rows.sort((a, b) => a.length - b.length);
  return rows;
}

// ===== Day helpers =====
function getClassDays(cls) {
  const texts = [];
  if (typeof cls.days === "string") texts.push(cls.days);
  if (Array.isArray(cls.schedule)) texts.push(...cls.schedule.map(String));

  const days = new Set();
  for (const raw of texts) {
    const t = String(raw)
      .replace(/TTh/gi, "TuTh")
      .replace(/TueThu/gi, "TuTh")
      .replace(/MonWedFri/gi, "MWF")
      .replace(/MonWed/gi, "MW")
      .replace(/MoWeFr/gi, "MWF")
      .replace(/MoWe/gi, "MW");

    if (/\bMWF\b/i.test(t)) { days.add("M"); days.add("W"); days.add("F"); }
    if (/\bMW\b/i.test(t))  { days.add("M"); days.add("W"); }
    if (/\bTuTh\b/i.test(t)) { days.add("Tu"); days.add("Th"); }

    if (/\bMon(day)?\b|(^|[^a-z])Mo([^a-z]|$)/i.test(t)) days.add("M");
    if (/\bTue(s|sday)?\b|(^|[^a-z])Tu([^a-z]|$)/i.test(t)) days.add("Tu");
    if (/\bWed(nesday)?\b|(^|[^a-z])We(d)?([^a-z]|$)/i.test(t)) days.add("W");
    if (/\bThu(r|rs|rsday)?\b|(^|[^a-z])Th([^a-z]|$)/i.test(t)) days.add("Th");
    if (/\bFri(day)?\b|(^|[^a-z])Fr?i?([^a-z]|$)/i.test(t)) days.add("F");
  }
  return days;
}
const meetsAllDays = (cls, codes) => {
  const d = getClassDays(cls);
  return codes.every(c => d.has(c));
};
const meetsAnyDay = (cls, codes) => {
  const d = getClassDays(cls);
  return codes.some(c => d.has(c));
};
function hasFriday(cls) {
  const d = getClassDays(cls);
  return d.has("F");
}
function dayPrefBonus(c, wantMonWed, wantTueThu, wantFridayOff) {
  let bonus = 0;
  if (wantMonWed) {
    if (meetsAllDays(c, ["M", "W"])) bonus += 0.5;
    if (meetsAnyDay(c, ["Tu", "Th"])) bonus -= 0.2;
    if (!wantFridayOff && meetsAnyDay(c, ["F"])) bonus -= 0.4;
  }
  if (wantTueThu) {
    if (meetsAllDays(c, ["Tu", "Th"])) bonus += 0.5;
    if (meetsAnyDay(c, ["M", "W"])) bonus -= 0.2;
    if (!wantFridayOff && meetsAnyDay(c, ["F"])) bonus -= 0.4;
  }
  return bonus;
}

// ===== Time helpers =====
function parseTimeToMinutes(text, meridiemHint) {
  if (!text) return null;
  const m = String(text).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mm = m[2] ? parseInt(m[2], 10) : 0;
  let mer = m[3] ? m[3].toLowerCase() : (meridiemHint ? meridiemHint.toLowerCase() : null);

  if (h < 1 || h > 12 || mm < 0 || mm > 59) return null;
  h = h % 12;
  if (mer === "pm") h += 12;
  if (mer !== "am" && mer !== "pm") return null;
  return h * 60 + mm;
}
function extractWindowsFromText(text) {
  const s = String(text || "");
  const rx = /(\d{1,2}(?::\d{2})?)\s*([AaPp][Mm])?\s*[-–—]\s*(\d{1,2}(?::\d{2})?)\s*([AaPp][Mm])?/g;
  const out = [];
  let m;
  while ((m = rx.exec(s))) {
    const startRaw = m[1];
    const startMer  = m[2] || m[4] || null;
    const endRaw   = m[3];
    const endMer   = m[4] || m[2] || null;
    const start = parseTimeToMinutes(startRaw, startMer);
    const end   = parseTimeToMinutes(endRaw, endMer);
    if (start != null && end != null) out.push({ start, end });
  }
  return out;
}
function getClassTimeWindows(cls) {
  const wins = [];
  if (Array.isArray(cls.schedule)) {
    for (const s of cls.schedule) wins.push(...extractWindowsFromText(s));
  }
  if (typeof cls.time === "string") {
    wins.push(...extractWindowsFromText(cls.time));
  }
  if (typeof cls.startTime === "string" && typeof cls.endTime === "string") {
    wins.push(...extractWindowsFromText(`${cls.startTime}-${cls.endTime}`));
  }
  return wins;
}
const NOON_MIN = 12 * 60;
function classIsEarly(cls) {
  const wins = getClassTimeWindows(cls);
  if (!wins.length) return false;
  return wins.every(w => w.end <= NOON_MIN);
}
function classIsLate(cls) {
  const wins = getClassTimeWindows(cls);
  if (!wins.length) return false;
  return wins.every(w => w.start >= NOON_MIN);
}
function timePrefBonus(c, wantEarly, wantLate) {
  let b = 0;
  const isE = classIsEarly(c);
  const isL = classIsLate(c);
  if (wantEarly) {
    if (isE) b += 0.5; else if (isL) b -= 0.3;
  }
  if (wantLate) {
    if (isL) b += 0.5; else if (isE) b -= 0.3;
  }
  return b;
}

// ==========================
// TOPIC MATCHING – SINGLE SOURCE OF TRUTH
// (No duplicates; robust against names or codes like "COMPSCI 61C")
// ==========================
function normalizeSpaces(s = "") {
  return String(s).replace(/\s+/g, " ").trim();
}
// Common long->short department aliases (expand if your data uses others)
const DEPT_ALIASES = {
  COMPUTERSCIENCE: "COMPSCI",
  INTEGRATIVEBIOLOGY: "INTEGBI",
  MOLECULARCELLBIOLOGY: "MCELLBI",
  ENVIRONMENTALECONOMICS: "ENVECON",
  GEOGRAPHY: "GEOG",
  ECONOMICS: "ECON",
  SOCIOLOGY: "SOCIOL",
  ANTHROPOLOGY: "ANTHRO",
  HISTORYOFART: "HISTART",
  POLITICALSCIENCE: "POLSCI",
  AMERICANSTUDIES: "AMERSTD",
  MEDIASTUDIES: "MEDIAST",
  EASTASIANLANGUAGES: "EALANG",
  ENVIRONMENTALDESIGN: "ENVDES",
  LEGALSTUDIES: "LEGALST",
  PUBLICHEALTH: "PBHLTH",
  GLOBALSTUDIES: "GLOBAL",
  GENDERSWOMENSTUDIES: "GWS",
  CELTICSTUDIES: "CELTIC",
  SLAVICLANGSLIT: "SLAVIC",
  ASTRONOMY: "ASTRON",
  PHILOSOPHY: "PHILOS",
  PSYCHOLOGY: "PSYCH",
  BIOENGINEERING: "BIOENG",
  DATA: "DATA", // no-op but here for consistency
};

// replaces your current extractCourseCode
function extractCourseCode(s = "") {
  const m = String(s).replace(/\s+/g, " ").trim()
    .match(/\b([A-Z][A-Z&\.]{1,15}(?:\s[A-Z]{1,10})?)\s*[-_/ ]?\s*([A-Z]?\d{1,3}[A-Z]{0,3})\b/i);
  if (!m) return null;

  // normalize dept to uppercase + no spaces and strip non-letters to combine multi-words
  const rawDeptNoSpace = m[1].toUpperCase().replace(/\s+/g, "");
  // also try collapsing obvious “OF/AND/…” glue to match tokens from your map
  const collapsed = rawDeptNoSpace.replace(/(OF|AND|THE|LANGUAGES|STUDIES|SCIENCE)/g, "");
  const alias = DEPT_ALIASES[rawDeptNoSpace] || DEPT_ALIASES[collapsed] || rawDeptNoSpace;

  const num = m[2].toUpperCase();
  return `${alias} ${num}`;
}


// --- helpers (add these) ---
function stripTitle(s = "") {
  // "ANTHRO 2AC - Archaeology" -> "ANTHRO 2AC"
  return String(s).replace(/\s*[-:–—]\s*.*$/, "").trim();
}

function generateCodeVariants(fromText = "") {
  // Turn any label into multiple code keys that might appear in your data
  const code = extractCourseCode(fromText);
  if (!code) return [];
  const [deptRaw, numRaw] = code.split(/\s+/);
  const deptNoSpace = deptRaw.toUpperCase().replace(/\s+/g, "");
  const num = numRaw.toUpperCase();

  const lead = /^[A-Z]/.test(num) ? num[0] : "";     // e.g., C / R / W
  const numNoLead = lead ? num.slice(1) : num;
  const deptNoX   = deptNoSpace.startsWith("X") ? deptNoSpace.slice(1) : deptNoSpace;

  const out = new Set();
  // original
  out.add(`${deptNoSpace} ${num}`);
  // without leading letter on the number (COMPSCI C100A -> COMPSCI 100A)
  if (lead) out.add(`${deptNoSpace} ${numNoLead}`);
  // without 'X' on the department (XESPM 15 -> ESPM 15)
  if (deptNoSpace !== deptNoX) out.add(`${deptNoX} ${num}`);
  // both transforms
  if (lead && deptNoSpace !== deptNoX) out.add(`${deptNoX} ${numNoLead}`);

  return Array.from(out);
}

function buildTopicSets(TOPIC_MAP, keys) {
  const namesSet = new Set(); // store LOWERCASED canonical names
  const codesSet = new Set(); // store normalized codes like "COMPSCI 61C"

  (keys || Object.keys(TOPIC_MAP || {})).forEach((k) => {
    (TOPIC_MAP[k] || []).forEach((raw) => {
      const full = normalizeSpaces(raw);
      const stripped = stripTitle(full);

      // name variants (lowercased)
      namesSet.add(full.toLowerCase());
      namesSet.add(stripped.toLowerCase());

      // code variants
      for (const v of generateCodeVariants(full)) codesSet.add(v);
      for (const v of generateCodeVariants(stripped)) codesSet.add(v);
    });
  });

  return { namesSet, codesSet };
}

function matchesTopic(cls, namesSet, codesSet) {
  // name match (case-insensitive, with stripped-title fallback)
  const nFull = normalizeSpaces(cls?.className || "");
  const nStripped = stripTitle(nFull);
  if (namesSet.has(nFull.toLowerCase()) || namesSet.has(nStripped.toLowerCase())) return true;

  // code match (try multiple variants from the class string)
  const variants = [
    ...generateCodeVariants(nFull),
    ...generateCodeVariants(nStripped),
  ];

  // also consider precomputed courseCode if you have one
  if (cls.courseCode) {
    variants.push(...generateCodeVariants(cls.courseCode));
  }

  return variants.some(v => codesSet.has(v));
}


function resolveTopicKeys(selectedAreas, TOPIC_MAP) {
  const available = new Set(Object.keys(TOPIC_MAP || {}));
  return (selectedAreas || []).filter((k) => available.has(k));
}

// ===== GE helpers =====




// ===== Scoring =====
function easeScore(cls) {
  const hasScore = Number.isFinite(cls.score);
  const hasDiff  = Number.isFinite(cls.difficulty);

  const score01 = hasScore ? Math.min(1, Math.max(0, cls.score / 5)) : 0.0;
  const diff01  = hasDiff  ? Math.min(1, Math.max(0, (5 - (cls.difficulty || 3)) / 4)) : 0.0;

  const W_SCORE = 0.45;
  const W_DIFF  = 0.55;

  let penalty = 0;
  if (!hasScore) penalty += 0.10;
  if (!hasDiff)  penalty += 0.20;

  const hintEasy = Array.isArray(cls.goals) && cls.goals.includes("easy") ? 0.05 : 0;
  const composite = (W_SCORE * score01) + (W_DIFF * diff01) + hintEasy - penalty;

  return Math.max(-1, Math.min(1.2, composite));
}

// ==========================
// MAIN COMPONENT
// ==========================
export default function ClassRecommendationPage({
  geRequirements,
  classDetails,
  onDeleteClass,
  pageTitle = "Smart Class Recommendations",
}) {
  // --- STATE (all first) ---
  const [selectedAreas, setSelectedAreas]       = useState([]);
  const [selectedGoals, setSelectedGoals]       = useState([]);
  const [dropdownValue, setDropdownValue]       = useState(3);
  const [recommendations, setRecommendations]   = useState([]);
  const [refreshKey, setRefreshKey]             = useState(Date.now());
  const [search, setSearch]                     = useState("");
  const [classesTaken, setClassesTaken]         = useState([]);
useEffect(() => {
  console.log("[CR] ClassRecommendationPage mounted");
}, []);
useEffect(() => {
  console.log("[CR] selectedAreas:", selectedAreas);
}, [selectedAreas]);
console.log("[CR] render", { pageTitle, time: Date.now() });

useEffect(() => {
  console.log("[CR] mounted");
}, []);

useEffect(() => {
  console.log("[CR] selectedAreas:", selectedAreas);
}, [selectedAreas]);

useEffect(() => {
  console.log("[CR] selectedGoals:", selectedGoals);
}, [selectedGoals]);

  // --- side effects ---
  useEffect(() => {
    document.title = pageTitle || "Smart Class Recommendations";
  }, [pageTitle]);

  // Auto-refresh recommendations whenever inputs change
  useEffect(() => {
    const newKey = Date.now();
    const recs = recommendClasses({
      classDetails,
      geRequirements,
      selectedAreas,
      selectedGoals,
      numClasses: dropdownValue,
      refreshKey: newKey,
      classesTaken,
    });
    setRecommendations(recs);
  }, [selectedAreas, selectedGoals, dropdownValue, classesTaken, classDetails, geRequirements]);

  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 700 : false;
  const areaRows = isMobile
    ? getEvenPyramidRows(ACADEMIC_AREAS, 19)
    : getEvenPyramidRows(ACADEMIC_AREAS, 4);

  const handleRefresh = () => {
    const newKey = Date.now();
    setRefreshKey(newKey);

    const recs = recommendClasses({
      classDetails,
      geRequirements,
      selectedAreas,
      selectedGoals,
      numClasses: dropdownValue,
      refreshKey: newKey,
      classesTaken,
    });

    setRecommendations(recs);
  };

  const toggle = (id, type) => {
       console.log("[CR] toggle", { id, type });
    if (type === "area") {
      setSelectedAreas(prev =>
        prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
    } else {
      setSelectedGoals(prev =>
        prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
      );
    }
  };

  const handleAddClass = (className, area) => {
    if (!classesTaken.some(obj => obj.className === className && obj.area === area)) {
      setClassesTaken([...classesTaken, { className, area }]);
      setSearch("");
    }
  };
  const handleRemoveClass = (className, area) => {
    setClassesTaken(classesTaken.filter(
      obj => !(obj.className === className && obj.area === area)
    ));
  };

  const searchResults = (search.trim().length > 0 && Array.isArray(classDetails))
    ? Array.from(
        new Map(
          classDetails
            .filter(cls =>
              cls.className &&
              cls.className.toLowerCase().includes(search.trim().toLowerCase()) &&
              !classesTaken.some(taken => taken.className === cls.className)
            )
            .map(cls => [cls.className, {
              className: cls.className,
              area: (cls.areas && cls.areas[0]) || "Other"
            }])
        ).values()
      )
    : [];
// ====== Berkeley requirements — DATA DRIVEN from geRequirements.json ======
function buildReqIndex(geReqs) {
  const areaToClasses = new Map();  // area -> Set(className)
  const classToAreas = new Map();   // className -> Set(area)

  const visit = (areaLabel, classes) => {
    const area = normalizeSpaces(areaLabel || "");
    if (!area) return;
    if (!areaToClasses.has(area)) areaToClasses.set(area, new Set());
    (classes || []).forEach((raw) => {
      const name = normalizeSpaces(raw);
      if (!name) return;
      areaToClasses.get(area).add(name);
      if (!classToAreas.has(name)) classToAreas.set(name, new Set());
      classToAreas.get(name).add(area);
    });
  };

  (geReqs || []).forEach((areaObj) => {
    visit(areaObj.area, areaObj.classes);
    (areaObj.subRequirements || []).forEach((sub) => {
      // use sub.area if present; otherwise derive a label
      const label = sub.area || `${areaObj.area}: ${sub.label || "Sub"}`;
      visit(label, sub.classes);
    });
  });

  return { areaToClasses, classToAreas };
}

// try to read "how many needed" from JSON; fallback to 1 each
function computeAreaNeeds(geReqs) {
  const need = new Map(); // area -> count required
  (geReqs || []).forEach((areaObj) => {
    if (Array.isArray(areaObj.subRequirements) && areaObj.subRequirements.length) {
      areaObj.subRequirements.forEach((sub) => {
        const label = normalizeSpaces(sub.area || `${areaObj.area}: ${sub.label || "Sub"}`);
        const req = Number(sub.requiredCount ?? sub.min ?? 1);
        need.set(label, Math.max(1, req));
      });
    } else {
      const label = normalizeSpaces(areaObj.area);
      const req = Number(areaObj.requiredCount ?? areaObj.min ?? 1);
      need.set(label, Math.max(1, req));
    }
  });
  return need;
}

function getUnmetAreas(geReqs, classesTaken) {
  const { areaToClasses } = buildReqIndex(geReqs);
  const need = computeAreaNeeds(geReqs);

  // count completions
  const counts = new Map([...need.keys()].map((k) => [k, 0]));
  (classesTaken || []).forEach((ct) => {
    const className = normalizeSpaces(ct.className);
    areaToClasses.forEach((set, area) => {
      if (set.has(className)) {
        counts.set(area, (counts.get(area) || 0) + 1);
      }
    });
  });

  // figure out remaining
  const unmet = new Set();
  need.forEach((req, area) => {
    if ((counts.get(area) || 0) < req) unmet.add(area);
  });
  return unmet; // Set of area labels that still need more classes
}

  // ==========================
  // RECOMMENDATION ALGORITHM
  // ==========================
  function recommendClasses({
    classDetails,
    geRequirements,
    selectedAreas,
    selectedGoals,
    numClasses,
    refreshKey,
    classesTaken
  }) {
     console.log("[CR] recommendClasses:start", {
  selectedAreas,
  selectedGoals,
  numClasses,
  classDetailsLen: Array.isArray(classDetails) ? classDetails.length : "not array",
});

    // sanitize
    classDetails   = Array.isArray(classDetails) ? classDetails : [];
    geRequirements = Array.isArray(geRequirements) ? geRequirements : [];
    numClasses     = Math.max(1, Number(numClasses) || 3);
const wantFridayOff = selectedGoals.includes("fridaysoff");
const wantMonWed    = selectedGoals.includes("MonWed");
const wantTueThu    = selectedGoals.includes("TueThu");
const wantEarly     = selectedGoals.includes("earlyclasses");
const wantLate      = selectedGoals.includes("lateclasses");
const wantEasy      = selectedGoals.includes("easy");
const hasTopics     = Array.isArray(selectedAreas) && selectedAreas.length > 0;

const TOPIC_MAP = BerkeleyTOPIC_TO_CLASSES || {};

console.log("[CR] classDetails:", Array.isArray(classDetails) ? classDetails.length : "not array");
console.log("[CR] hasTopics:", hasTopics, "selectedAreas:", selectedAreas);
console.log("[CR] TOPIC_MAP keys:", Object.keys(TOPIC_MAP).length);
const reqIndex = buildReqIndex(geRequirements);
const unmetAreas = getUnmetAreas(geRequirements, classesTaken);

if (process.env.NODE_ENV !== "production") {
  console.log("[berkeley-reqs] unmet areas:", Array.from(unmetAreas));
}

    // Precompute codes
    // Precompute codes
const normalized = (Array.isArray(classDetails) ? classDetails : []).map((c) => {
  const dept =
    c.dept || c.subject || c.department || c.subjectCode || null;
  const num  =
    c.number || c.courseNumber || c.catalogNumber || c.catalogNbr || null;
  const fromFields = dept && num ? `${dept} ${num}` : null;

  return {
    ...c,
    courseCode:
      c.courseCode ||
      extractCourseCode(c.className) ||
      (fromFields ? extractCourseCode(fromFields) : null),
    // NEW: coerce to numbers so filtering is reliable
    difficulty: c.difficulty != null ? Number(c.difficulty) : undefined,
    score:      c.score      != null ? Number(c.score)      : undefined,
  };
});

console.log("[CR] normalized sample", normalized.slice(0, 3));




    // Untaken base
    const takenNames = new Set((classesTaken || []).map(c => c.className));
    let base = normalized.filter(c => c?.className && !takenNames.has(c.className));
    if (!base.length) return [];
    console.log("[CR] base size", base.length);


    // Topic filter
  // Topic filter
let pool = base;
if (hasTopics) {
  const topicKeys = resolveTopicKeys(selectedAreas, TOPIC_MAP);
  const { namesSet, codesSet } = buildTopicSets(TOPIC_MAP, topicKeys);

  // DEBUG (won't run in production builds)
  if (process.env.NODE_ENV !== "production") {
    console.log("[topics] selectedAreas:", selectedAreas, "topicKeys:", topicKeys);
    console.log("[topics] namesSet size:", namesSet.size, "codesSet size:", codesSet.size);

    // Probe a handful of classes to see why they do/don't match
    base.slice(0, 12).forEach((c, i) => {
      const nFull = normalizeSpaces(c.className || "");
      const nStrip = stripTitle(nFull);
      const codeFromName = extractCourseCode(nFull);
      const variants = [
        ...generateCodeVariants(nFull),
        ...generateCodeVariants(nStrip),
        ...(c.courseCode ? generateCodeVariants(c.courseCode) : []),
      ];
      const nameHit = namesSet.has(nFull.toLowerCase()) || namesSet.has(nStrip.toLowerCase());
      const codeHit = variants.find(v => codesSet.has(v));
      console.log("[probe]", i, {
        className: c.className,
        courseCode: c.courseCode,
        codeFromName,
        variants,
        nameHit,
        codeHit,
      });
    });
  }

  pool = base.filter((c) => matchesTopic(c, namesSet, codesSet));

  // TEMP: surface failures instead of silently falling back
  if (!pool.length) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[topics] No matches for", topicKeys, "— not falling back so you can see it.");
    }
    return []; // comment this out later if you want the soft fallback again
  }
}
// Hard filter for "Easiest"
if (wantEasy) {
  const before = pool.length;
  pool = pool.filter(c => Number.isFinite(c.difficulty) && c.difficulty <= 2.9);
  if (process.env.NODE_ENV !== "production") {
    console.log("[easy] filtered by difficulty<=2.9:", before, "->", pool.length);
  }

  // If you want to surface the failure (no loosening):
  if (!pool.length) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[easy] No classes <= 2.9 difficulty.");
    }
    return []; // keep strict behavior; remove if you prefer soft fallback
  }
}


    // day/time prefs
// day/time prefs
const friPenaltyFor = (cls) =>
  wantFridayOff && getClassDays(cls).has("F") ? 0.6 : 0;

const scored = pool.map((c) => {
  const baseScore = wantEasy ? easeScore(c) : easeScore(c) * 0.5;

  // GE bonus: prefer classes that fill unmet Berkeley areas
  const classAreas =
    reqIndex.classToAreas.get(normalizeSpaces(c.className)) || new Set();

  const fillsUnmet = Array.from(classAreas).some((a) => unmetAreas.has(a));
  const geBonus = fillsUnmet ? 0.9 : 0;

  const score =
    baseScore +
    dayPrefBonus(c, wantMonWed, wantTueThu, wantFridayOff) +
    timePrefBonus(c, wantEarly, wantLate) -
    friPenaltyFor(c) +
    geBonus;

  return { ...c, __score: score };
});

// ---- selection helpers ----
const canonArea = (s) => normalizeSpaces(String(s || '').split(':')[0]);

const areasFor = (c) => {
  const raw = reqIndex.classToAreas.get(normalizeSpaces(c.className)) || new Set();
  return new Set(Array.from(raw).map(canonArea));
};

const unmetAreasCanon = new Set(Array.from(unmetAreas).map(canonArea));

const normalizeProfessor = (p) =>
  String(p || '').toLowerCase().replace(/\s+/g, ' ').trim();

const courseKey = (c) => {
  // prefer real course code; fall back to stripped title
  return (
    extractCourseCode(c.courseCode || '') ||
    extractCourseCode(c.className || '') ||
    extractCourseCode(stripTitle(c.className || '')) ||
    normalizeSpaces(stripTitle(c.className || '')).toUpperCase()
  );
};

const overlaps = (a, b) => {
  const daysA = getClassDays(a);
  const daysB = getClassDays(b);
  // no shared days -> no conflict
  const shareDay = [...daysA].some((d) => daysB.has(d));
  if (!shareDay) return false;

  const wA = getClassTimeWindows(a);
  const wB = getClassTimeWindows(b);
  if (!wA.length || !wB.length) return false; // unknown times -> allow

  for (const x of wA) {
    for (const y of wB) {
      if (x.start < y.end && y.start < x.end) return true; // time window overlaps
    }
  }
  return false;
};

// ---- rank then rotate for variety ----
scored.sort((a, b) => (b.__score || 0) - (a.__score || 0));
const start = scored.length ? Math.abs(Number(refreshKey || 0)) % scored.length : 0;
const candidates = scored.slice(start).concat(scored.slice(0, start));

// ---- greedy pick with constraints ----
const picked = [];
const seenCourses = new Set();
const seenProfs = new Set();
const coveredAreas = new Set();

const canAdd = (item) => {
  const cKey = courseKey(item);
  if (seenCourses.has(cKey)) return false;

  const pKey = normalizeProfessor(item.professor);
  if (pKey && seenProfs.has(pKey)) return false;

  if (picked.some((p) => overlaps(p, item))) return false;

  return true;
};

const accept = (item) => {
  picked.push(item);
  seenCourses.add(courseKey(item));
  const pKey = normalizeProfessor(item.professor);
  if (pKey) seenProfs.add(pKey);
  areasFor(item).forEach((a) => coveredAreas.add(a));
};

// Pass 1: only items that add a *new unmet* Berkeley area
for (const c of candidates) {
  if (picked.length >= numClasses) break;
  if (!canAdd(c)) continue;
  const aSet = areasFor(c);
  const addsUnmet = Array.from(aSet).some((a) => unmetAreasCanon.has(a) && !coveredAreas.has(a));
  if (addsUnmet) accept(c);
}

// Pass 2: items that add any *new* area (even if not unmet)
if (picked.length < numClasses) {
  for (const c of candidates) {
    if (picked.length >= numClasses) break;
    if (!canAdd(c)) continue;
    const aSet = areasFor(c);
    const addsAny = Array.from(aSet).some((a) => !coveredAreas.has(a));
    if (addsAny) accept(c);
  }
}

// Pass 3: fill remaining slots (still no dup course/prof or time conflicts)
if (picked.length < numClasses) {
  for (const c of candidates) {
    if (picked.length >= numClasses) break;
    if (canAdd(c)) accept(c);
  }
}

return picked.slice(0, numClasses).map((cls) => ({ ...cls }));
  }

  // ==========================
  // RENDER
  // ==========================
  return (
    <>
      <div>
        {/* Title */}
        <div
          style={{
            margin: isMobile ? "90px auto 12px auto" : "110px auto 12px auto",
            width: "100%",
            textAlign: "center",
            padding: isMobile ? "0 16px" : 0,
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "2.2rem" : "2.8rem",
              fontWeight: 700,
              color: "#1F2A37",
              marginBottom: 8,
              marginTop: isMobile ? 100 : 0,
            }}
          >
            {pageTitle}
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "#6B7280",
              fontSize: "1.1rem",
              maxWidth: 640,
              margin: "0 auto 32px auto",
            }}
          >
            Get personalized course suggestions based on your interests, goals, and academic progress
          </p>
        </div>

        <>
          {/* Search Bar */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px 24px",
              borderRadius: 20,
              boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
              margin: isMobile ? "0 auto 32px auto" : "32px auto 0 auto",
              width: isMobile ? "92vw" : 1200,
              maxWidth: isMobile ? "92vw" : "100%",
              position: "relative",
              userSelect: "none",
              boxSizing: "border-box",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="Search for a class you have already taken, or plan to take."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search for classes"
              style={{
                width: isMobile ? "88vw" : 1150,
                padding: isMobile ? "10px 10px 10px 38px" : "12px 16px 12px 48px",
                fontSize: isMobile ? "0.85rem" : "1rem",
                borderRadius: 20,
                border: "1.8px solid #bbb",
                boxShadow: "0 2px 5px rgba(58, 96, 255, 0.15)",
                outline: "none",
                userSelect: "text",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = brandBlue)}
              onBlur={(e) => (e.target.style.borderColor = "#bbb")}
            />

            <FiSearch
              style={{
                position: "absolute",
                left: isMobile ? 32 : 35,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
                pointerEvents: "none",
                fontSize: isMobile ? 18 : 20,
                userSelect: "none",
              }}
              aria-hidden="true"
            />

            {Array.isArray(searchResults) && searchResults.length > 0 && (
              <ul
                className="ge-search-results"
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 8,
                  border: "1.8px solid #bbb",
                  borderTop: "none",
                  maxHeight: 220,
                  overflowY: "auto",
                  backgroundColor: "#fff",
                  position: "absolute",
                  width: "100%",
                  zIndex: 10,
                  borderRadius: "0 0 20px 20px",
                  boxShadow: "0 8px 16px rgba(58, 96, 255, 0.2)",
                  top: "calc(100% + 4px)",
                  left: 0,
                  userSelect: "none",
                }}
              >
                {searchResults.map((obj) => (
                  <li
                    key={obj.className}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      fontWeight: "600",
                      color: "#222",
                      userSelect: "none",
                    }}
                    onClick={() => handleAddClass(obj.className, obj.area)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <strong>{obj.className}</strong>{" "}
                    <span style={{ color: "#666" }}>({obj.area})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Classes Taken */}
          <div
            style={{
              width: isMobile ? "92vw" : 1200,
              margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
              backgroundColor: "#fff",
              padding: "20px 24px",
              borderRadius: 20,
              boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
              boxSizing: "border-box",
              userSelect: "text",
            }}
          >
            <h2 className="ge-section-title">Classes Taken</h2>

            <ul
              className="ge-classes-taken-list"
              style={{
                padding: 0,
                margin: 0,
                listStyle: "none",
                fontSize: "1rem",
                lineHeight: 1.4,
                color: "#222",
              }}
            >
              {classesTaken.length === 0 ? (
                <li style={{ color: "#aaa", fontStyle: "italic" }}>No classes taken yet.</li>
              ) : (
                classesTaken.map((obj) => (
                  <li
                    key={obj.className + obj.area}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "6px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div>
                      <strong>{obj.className}</strong>{" "}
                      <span style={{ color: "#555" }}>({obj.area})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveClass(obj.className, obj.area)}
                      style={{
                        backgroundColor: "#d32f2f",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 14px",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "background-color 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a12121")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d32f2f")}
                      type="button"
                      aria-label={`Delete ${obj.className} from classes taken`}
                    >
                      Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Academic Areas */}
          <div
            style={{
              width: isMobile ? "92vw" : 1200,
              maxWidth: "92vw",
              margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
              userSelect: "text",
              textAlign: "left",
              backgroundColor: "#fff",
              padding: "20px 24px",
              borderRadius: 20,
              boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HiOutlineAcademicCap size={24} color="#7589F3" />
              Academic Areas
            </h2>

            <p
              style={{
                color: "#555",
                marginBottom: 24,
                fontSize: "1em",
                maxWidth: 600,
              }}
            >
              Select the subjects you’re interested in
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
                gap: 16,
              }}
            >
              {areaRows.flat().map((area) => (
                <div
                  key={area.id}
                  onClick={() => toggle(area.id, "area")}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "18px 8px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: selectedAreas.includes(area.id)
                      ? "2px solid #1976d2"
                      : "1.5px solid #DADDE7",
                    background: selectedAreas.includes(area.id)
                      ? "rgba(117, 137, 243, 0.15)"
                      : "#fff",
                    boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                    fontSize: "1em",
                    fontWeight: 500,
                    userSelect: "none",
                  }}
                >
                  {/* Using label emoji only; no area.icon to avoid undefined */}
                  <div style={{ fontSize: "1.1em", marginBottom: 6 }} />
                  <div>{area.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Goals */}
          <div
            style={{
              width: isMobile ? "92vw" : 1200,
              maxWidth: "92vw",
              margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
              userSelect: "text",
              textAlign: "left",
              backgroundColor: "#fff",
              padding: "20px 24px",
              borderRadius: 20,
              boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GoGoal size={22} color="#7589F3" />
              Student Goals
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)",
                gap: 20,
                marginTop: 20,
              }}
            >
              {[
                { id: "easy", label: "Easiest Classes ✅" },
                { id: "fridaysoff", label: "Fridays Off 🗓️" },
                { id: "MonWed", label: "Monday/Wednesday ⏱️" },
                { id: "TueThu", label: "Tuesday/Thursday ⏱️" },
                { id: "earlyclasses", label: "Early Classes 🌅" },
                { id: "lateclasses", label: "Late Classes 🌙" },
              ].map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggle(goal.id, "goal")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 20px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: selectedGoals.includes(goal.id)
                      ? "2px solid #1976d2"
                      : "1.5px solid #DADDE7",
                    background: selectedGoals.includes(goal.id)
                      ? "rgba(117, 137, 243, 0.15)"
                      : "#fff",
                    boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                    fontSize: "1em",
                    fontWeight: 500,
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{goal.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #DADDE7",
              borderRadius: 16,
              padding: "24px 20px",
              width: isMobile ? "92vw" : 1200,
              maxWidth: "92vw",
              margin: isMobile ? "0 auto 32px auto" : "0 auto",
              marginTop: 40,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              fontFamily: "'Inter', sans-serif",
              boxSizing: "border-box",
            }}
          >
            <h3
              style={{
                fontSize: "1.1em",
                fontWeight: 600,
                marginBottom: 12,
                color: "#1A1A1A",
              }}
            >
              🎯 Recommendation Count
            </h3>

            <p
              style={{
                marginBottom: 12,
                fontSize: "0.95em",
                fontWeight: 500,
                color: "#4A4A4A",
              }}
            >
              Number of classes:{" "}
              <span style={{ color: "#1AA179", fontWeight: 600 }}>{dropdownValue}</span>
            </p>

            <input
              type="range"
              min={1}
              max={6}
              value={dropdownValue}
              onChange={(e) => setDropdownValue(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#F9C645",
                cursor: "pointer",
                marginBottom: 18,
              }}
            />

            <button
              type="button"
              onClick={handleRefresh}
              style={{
                width: "100%",
                padding: "12px 0",
                backgroundColor: "#1AA179",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: "1.05em",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
            >
              Get Recommendations
            </button>
          </div>
        </>

        {/* Recommendations */}
        <div style={{ paddingBottom: isMobile ? 48 : 0 }}>
          <div
            style={{
              width: isMobile ? "92vw" : 1200,
              maxWidth: "92vw",
              margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: isMobile ? "20px 18px" : "28px 32px",
              boxShadow: "0 6px 18px rgba(58, 96, 255, 0.08)",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <PiMedal size={22} color="#EDC239" />
              <h3 style={{ fontSize: "1.12rem", fontWeight: 700, margin: 0 }}>
                Personalized Recommendations
              </h3>
            </div>

            {recommendations.length === 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                  <BsStars size={72} color="#7589F3" />
                </div>
                <div style={{ maxWidth: 500, margin: "0 auto", marginBottom: 24 }}>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: "#222" }}>
                    Ready to Find Your Perfect Classes?
                  </h4>
                  <p style={{ fontSize: "0.95rem", color: "#444", margin: 0 }}>
                    Select your academic interests and goals to receive personalized course
                    recommendations tailored to your needs and preferences.
                  </p>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: 0,
                    margin: 0,
                    fontSize: "0.92rem",
                    color: "#444",
                    lineHeight: 1.7,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: isMobile ? 6 : 8,
                  }}
                >
                  <li>⚡ Instant recommendations</li>
                  <li>⭐ Based on professor ratings</li>
                  <li>🎯 Aligned to your graduation path</li>
                </ul>
              </>
            ) : (
              <>
                <div style={{ marginTop: 30, width: "100%", textAlign: "left" }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 18, fontSize: "1.32em" }}>
                    Recommended Classes
                  </h3>
                  <div style={{ width: "100%", overflowX: isMobile ? "auto" : "visible" }}>
                    <table
                      style={{
                        minWidth: isMobile ? 600 : "100%",
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        background: "#fff",
                        border: "1.5px solid #E0E0E0",
                        borderRadius: 10,
                        overflow: "hidden",
                        fontSize: "0.98rem",
                        color: "#1A1A1A",
                      }}
                    >
                      <thead style={{ backgroundColor: "#F5F7FA" }}>
                        <tr>
                          <th style={thStyle}>Class</th>
                          <th style={thStyle}>Professor</th>
                          <th style={thStyle}>RMP Score</th>
                          <th style={thStyle}>Difficulty</th>
                          {!isMobile && <th style={thStyle}>Schedule</th>}
                          <th style={thStyle}>Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations.map((cls, idx) => (
                          <tr key={cls.className + cls.professor + idx} style={{ borderBottom: "1px solid #EAEAEA" }}>
                            <td style={tdStyle}>{cls.className}</td>
                            <td style={tdStyle}>{cls.professor}</td>
                            <td style={tdStyle}>{cls.score !== undefined ? cls.score : "N/A"}</td>
                            <td style={tdStyle}>{cls.difficulty !== undefined ? cls.difficulty : "N/A"}</td>
                            {!isMobile && (
                              <td style={tdStyle}>
                                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                                  {cls.schedule && cls.schedule.length > 0
                                    ? cls.schedule.map((s, i) => <li key={i}>{s}</li>)
                                    : <li style={{ color: "#888" }}>Not listed</li>}
                                </ul>
                              </td>
                            )}
                            <td style={tdStyle}>
                              {cls.link && cls.link !== "N/A" ? (
                                <a
                                  href={cls.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#1976d2", fontWeight: 500 }}
                                >
                                  RMP
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
