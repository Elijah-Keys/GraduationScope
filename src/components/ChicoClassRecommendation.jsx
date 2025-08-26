import React, { useState } from "react";

import { ChicoTOPIC_TO_CLASSES } from "./ChicoTopic_To_Classes";
import "./ChicoClassRecommendation.css";
import "../pages/GETracker.css";
import { FiSearch } from "react-icons/fi";
import { PiMedal } from "react-icons/pi";
import { BsStars } from "react-icons/bs";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { GoGoal } from "react-icons/go";



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
// MAIN COMPONENT
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

export default function ClassRecommendationPage({
  geRequirements = [],
  classDetails = [],
 classesTaken = [],              // array: [{ className, area }, ...]
 onAddClass = () => {},          // (className, area) => void
 onRemoveClass = () => {},       // (className, area) => void
  pageTitle = "Smart Class Recommendations Chico",
}) {

  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [dropdownValue, setDropdownValue] = useState(3);
  const [recommendations, setRecommendations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 700 : false;
  const areaRows = isMobile
    ? getEvenPyramidRows(ACADEMIC_AREAS, 19)
    : getEvenPyramidRows(ACADEMIC_AREAS, 4);

  const [search, setSearch] = useState("");



  // -- handlers: recompute recommendations on demand --
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

  // -- handlers: toggle areas/goals --
  const toggle = (id, type) => {
    if (type === "area") {
      setSelectedAreas((prev) =>
        prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
      );
    } else {
      setSelectedGoals((prev) =>
        prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
      );
    }
  };

const handleAdd = (className, area) => {
  onAddClass?.(className, area);
  setSearch("");
};
const handleRemove = (className, area) => {
  onRemoveClass?.(className, area);
};


  // ✅ search filters against the same centralized list
  const searchResults =
    search.trim().length > 0 && classDetails
      ? Array.from(
          new Map(
            classDetails
              .filter(
                (cls) =>
                  cls.className &&
                  cls.className
                    .toLowerCase()
                    .includes(search.trim().toLowerCase()) &&
              !classesTaken.some(
                    (taken) => taken.className === cls.className
                  )
              )
              .map((cls) => [
                cls.className,
                {
                  className: cls.className,
                  area: (cls.areas && cls.areas[0]) || "Other",
                },
              ])
          ).values()
        )
      : [];

  const STUDENT_GOALS = [
    { id: "easy", label: "Easiest Classes ✅" },
    { id: "fridaysoff", label: "Fridays Off🗓️" },
    { id: "MonWed", label: "Monday/Wednesday ⏱️" },
    { id: "TueThu", label: "Tuesday/Thursday ⏱️" },
    { id: "earlyclasses", label: "Early Classes 🌅" },
    { id: "lateclasses", label: "Late Classes 🌙" },
  ];

  // ==========================
  // UTILITY FUNCTIONS (unchanged)
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

  const CARD_WIDTH = 155;
  const CARD_HEIGHT = 38;
  const CARD_STYLE = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    fontWeight: 500,
    textAlign: "center",
    transition: "all 0.14s",
    userSelect: "none",
    fontSize: "1em",
    letterSpacing: "-0.01em",
    lineHeight: 1.15,
    whiteSpace: "normal",
    overflowWrap: "break-word",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    cursor: "pointer",
    padding: 0,
    margin: 0,
  };

  function shuffle(array, seed) {
    let m = array.length,
      t,
      i;
    let s = seed || Math.random();
    while (m) {
      i = Math.floor(Math.abs(Math.sin(s++) * 10000) % m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  // ===== Day helpers (unchanged) =====
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

      if (/\bMWF\b/i.test(t)) {
        days.add("M");
        days.add("W");
        days.add("F");
      }
      if (/\bMW\b/i.test(t)) {
        days.add("M");
        days.add("W");
      }
      if (/\bTuTh\b/i.test(t)) {
        days.add("Tu");
        days.add("Th");
      }

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
    return codes.every((c) => d.has(c));
  };
  const meetsAnyDay = (cls, codes) => {
    const d = getClassDays(cls);
    return codes.some((c) => d.has(c));
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

  // ===== Time helpers (unchanged) =====
  const NOON_MIN = 12 * 60;

  function parseTimeToMinutes(text, meridiemHint) {
    if (!text) return null;
    const m = String(text).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const mm = m[2] ? parseInt(m[2], 10) : 0;
    let mer = m[3] ? m[3].toLowerCase() : meridiemHint ? meridiemHint.toLowerCase() : null;

    if (h < 1 || h > 12 || mm < 0 || mm > 59) return null;
    h = h % 12;
    if (mer === "pm") h += 12;
    if (mer !== "am" && mer !== "pm") return null;
    return h * 60 + mm;
  }

  function extractWindowsFromText(text) {
    const s = String(text || "");
    const rx =
      /(\d{1,2}(?::\d{2})?)\s*([AaPp][Mm])?\s*[-–—]\s*(\d{1,2}(?::\d{2})?)\s*([AaPp][Mm])?/g;
    const out = [];
    let m;
    while ((m = rx.exec(s))) {
      const startRaw = m[1];
      const startMer = m[2] || m[4] || null;
      const endRaw = m[3];
      const endMer = m[4] || m[2] || null;

      const start = parseTimeToMinutes(startRaw, startMer);
      const end = parseTimeToMinutes(endRaw, endMer);
      if (start != null && end != null) {
        out.push({ start, end });
      }
    }
    return out;
  }

  function getClassTimeWindows(cls) {
    const wins = [];
    if (Array.isArray(cls.schedule)) {
      for (const s of cls.schedule) {
        wins.push(...extractWindowsFromText(s));
      }
    }
    if (typeof cls.time === "string") {
      wins.push(...extractWindowsFromText(cls.time));
    }
    if (typeof cls.startTime === "string" && typeof cls.endTime === "string") {
      const w = extractWindowsFromText(`${cls.startTime}-${cls.endTime}`);
      wins.push(...w);
    }
    return wins;
  }

  function getUniqueWindows(cls) {
    const wins = getClassTimeWindows(cls);
    const seen = new Set();
    const unique = [];
    for (const w of wins) {
      if (!w || w.start == null || w.end == null) continue;
      const key = `${w.start}-${w.end}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(w);
      }
    }
    return unique;
  }

  function hasSingleDistinctWindow(cls) {
    const uniq = getUniqueWindows(cls);
    return uniq.length === 1;
  }

  function timesOverlap(a, b) {
    return a && b && a.start < b.end && b.start < a.end;
  }

  function setsIntersect(a, b) {
    for (const x of a) if (b.has(x)) return true;
    return false;
  }

  function hasStrictConflict(a, b) {
    if (!hasSingleDistinctWindow(a) || !hasSingleDistinctWindow(b)) return false;

    const aWins = getUniqueWindows(a);
    const bWins = getUniqueWindows(b);
    if (aWins.length === 0 || bWins.length === 0) return false;

    const aWin = aWins[0];
    const bWin = bWins[0];

    const aDays = getClassDays(a);
    const bDays = getClassDays(b);

    return timesOverlap(aWin, bWin) && setsIntersect(aDays, bDays);
  }

  function wouldConflictIfFixed(picked, candidate) {
    if (!hasSingleDistinctWindow(candidate)) return false;
    for (const p of picked) {
      if (hasStrictConflict(p, candidate)) return true;
    }
    return false;
  }

  function classIsEarly(cls) {
    const wins = getClassTimeWindows(cls);
    if (!wins.length) return false;
    return wins.every((w) => w.end <= NOON_MIN);
  }

  function classIsLate(cls) {
    const wins = getClassTimeWindows(cls);
    if (!wins.length) return false;
    return wins.every((w) => w.start >= NOON_MIN);
  }

  function timePrefBonus(c, wantEarly, wantLate) {
    let b = 0;
    const isE = classIsEarly(c);
    const isL = classIsLate(c);

    if (wantEarly) {
      if (isE) b += 0.5;
      else if (isL) b -= 0.3;
    }
    if (wantLate) {
      if (isL) b += 0.5;
      else if (isE) b -= 0.3;
    }
    return b;
  }

  function remainingDNeeded(classesTakenArr) {
    const takenD = classesTakenArr.filter((c) => isD(c.area)).length;
    return Math.max(0, 2 - takenD);
  }
  const seededShuffle = (arr, seed) => shuffle(arr.slice(), seed);

  // ===== Main algorithm (unchanged) =====
  function recommendClasses({
    classDetails,
    geRequirements,
    selectedAreas,
    selectedGoals,
    numClasses,
    refreshKey,
    classesTaken,
  }) {
    if (typeof recommendClasses._hasRun === "undefined") {
      recommendClasses._hasRun = false;
    }

    const classesTakenNames = new Set(classesTaken.map((c) => c.className));
    const areasTaken = new Set(classesTaken.map((c) => c.area));

    const areaToClasses = {};
    geRequirements.forEach((a) => {
      areaToClasses[a.area] = new Set(a.classes);
    });

    const getAreasForClass = (name) =>
      Object.entries(areaToClasses)
        .filter(([_, set]) => set.has(name))
        .map(([area]) => area);

    let candidates = classDetails.filter((cls) => {
      if (!cls?.className) return false;
      if (classesTakenNames.has(cls.className)) return false;
      const areas = getAreasForClass(cls.className);
      return areas.some((a) => !areasTaken.has(a));
    });

    const wantFridayOff = selectedGoals.includes("fridaysoff");
    const wantMonWed = selectedGoals.includes("MonWed");
    const wantTueThu = selectedGoals.includes("TueThu");
    const wantEarly = selectedGoals.includes("earlyclasses");
    const wantLate = selectedGoals.includes("lateclasses");
    const isVeryEasy = (c) =>
      Number.isFinite(c?.difficulty) && c.difficulty <= 2.9;
    const wantEasy = selectedGoals.includes("easy");
    const hasTopics =
      Array.isArray(selectedAreas) && selectedAreas.length > 0;

    const applyDayTimePrefs = (list) => {
      let out = list;
      if (wantFridayOff) {
        const noFri = out.filter((c) => !hasFriday(c));
        if (noFri.length >= Math.max(6, numClasses)) out = noFri;
      }
      if (wantMonWed && !wantTueThu) {
        const mwOnly = out.filter(
          (c) => meetsAllDays(c, ["M", "W"]) && !meetsAnyDay(c, ["Tu", "Th", "F"])
        );
        if (mwOnly.length >= Math.max(6, numClasses)) out = mwOnly;
      }
      if (wantTueThu && !wantMonWed) {
        const tuthOnly = out.filter(
          (c) => meetsAllDays(c, ["Tu", "Th"]) && !meetsAnyDay(c, ["M", "W", "F"])
        );
        if (tuthOnly.length >= Math.max(6, numClasses)) out = tuthOnly;
      }
      if (wantEarly && !wantLate) {
        const earlyOnly = out.filter(classIsEarly);
        if (earlyOnly.length >= Math.max(6, numClasses)) out = earlyOnly;
      }
      if (wantLate && !wantEarly) {
        const lateOnly = out.filter(classIsLate);
        if (lateOnly.length >= Math.max(6, numClasses)) out = lateOnly;
      }
      return out;
    };

    const TOPIC_MAP =
      (typeof ChicoTOPIC_TO_CLASSES !== "undefined" && ChicoTOPIC_TO_CLASSES) ||
      (typeof window !== "undefined" && window.ChicoTOPIC_TO_CLASSES) ||
      {};
    const inTopic = (name) =>
      classInSelectedTopics(name, selectedAreas, TOPIC_MAP);

    // EASY branch
    if (wantEasy) {
      let pool = hasTopics
        ? candidates.filter((c) => inTopic(c.className))
        : candidates;

      pool = applyDayTimePrefs(pool);

      if (hasTopics && pool.length === 0) {
        const kwMap = {
          business: [
            "bus",
            "acct",
            "acctg",
            "acct.",
            "account",
            "fin",
            "mktg",
            "mgmt",
            "econ",
          ],
          communication: ["comm", "media", "journal", "pr", "advert"],
          psychology: ["psych"],
          computer: ["cs", "comp", "cis", "info", "software"],
          art_design: ["art", "design", "c1"],
          philosophy: ["phil", "ethic", "c2", "humanities"],
          history: ["hist"],
          health: ["hlth", "health", "kin", "nurs"],
        };
        const kws = (selectedAreas || []).flatMap((a) => kwMap[a] || []);
        const rx = kws.length ? new RegExp(`\\b(${kws.join("|")})`, "i") : null;
        pool = rx ? candidates.filter((c) => rx.test(c.className || "")) : candidates;
        pool = applyDayTimePrefs(pool);
      }

      pool = pool.filter((c) => Number.isFinite(c?.difficulty) && c.difficulty <= 2.9);
      if (!pool.length) return [];
      pool = seededShuffle(pool, refreshKey);

      const WINDOW_K = Math.min(Math.max(numClasses * 4, 25), pool.length);
      const topList = pool.slice(0, WINDOW_K);

      const c1Fulfilled = classesTaken.some((c) => isC1(c.area));
      const c2Fulfilled = classesTaken.some((c) => isC2(c.area));
      let dLeft = remainingDNeeded(classesTaken);

      const getUnfulfilledAreas = (cls) =>
        getAreasForClass(cls.className).filter((a) => !areasTaken.has(a));

      const canC1 = topList.some((it) => getUnfulfilledAreas(it).some(isC1));
      const canC2 = topList.some((it) => getUnfulfilledAreas(it).some(isC2));
      const dAvail = topList.filter((it) => getUnfulfilledAreas(it).some(isD)).length;

      let needC1 = !c1Fulfilled && canC1;
      let needC2 = !c2Fulfilled && canC2;
      dLeft = Math.min(dLeft, dAvail);

      const picked = [];
      const usedOtherAreas = new Set();
      const guardMax = topList.length * 2;
      const stride = 7;
      const offset = topList.length
        ? ((((Math.abs(Number(refreshKey || 0)) / 1000) | 0) * stride) %
            topList.length)
        : 0;

      let steps = 0;
      let i = offset;

      while (picked.length < numClasses && steps++ < guardMax) {
        const cls = topList[i % topList.length];
        i++;
        if (picked.includes(cls)) continue;
        if (wouldConflictIfFixed(picked, cls)) continue;

        const unfulfilled = getUnfulfilledAreas(cls);
        if (!unfulfilled.length) continue;

        const hasC1a = unfulfilled.some(isC1);
        const hasC2a = unfulfilled.some(isC2);
        const hasDa = unfulfilled.some(isD);

        if (needC1 && hasC1a && !picked.some((p) => getUnfulfilledAreas(p).some(isC1))) {
          picked.push(cls);
          needC1 = false;
          continue;
        }
        if (needC2 && hasC2a && !picked.some((p) => getUnfulfilledAreas(p).some(isC2))) {
          picked.push(cls);
          needC2 = false;
          continue;
        }
        if (dLeft > 0 && hasDa) {
          picked.push(cls);
          dLeft -= 1;
          continue;
        }

        const firstOther = unfulfilled.find(
          (a) => !isC1(a) && !isC2(a) && !isD(a) && !usedOtherAreas.has(a)
        );
        if (firstOther) {
          picked.push(cls);
          usedOtherAreas.add(firstOther);
        }
      }

      if (picked.length < numClasses) {
        steps = 0;
        while (picked.length < numClasses && steps++ < guardMax) {
          const cls = topList[i % topList.length];
          i++;
          if (!picked.includes(cls) && !wouldConflictIfFixed(picked, cls)) {
            picked.push(cls);
          }
        }
      }

      recommendClasses._hasRun = true;
      return picked.slice(0, numClasses).map((cls) => ({
        ...cls,
        matchedAreas: getUnfulfilledAreas(cls),
      }));
    }

    // NON-easy branch
    const topicSet = new Set();
    if (hasTopics) {
      selectedAreas.forEach((t) => {
        (TOPIC_MAP?.[t] || []).forEach((n) => topicSet.add(n));
      });
    }

    let poolNonEasy = hasTopics
      ? candidates.filter((cls) => topicSet.has(cls.className))
      : candidates;

    poolNonEasy = poolNonEasy.map((cls) => {
      let goalScore = 0;
      if (Array.isArray(cls.goals)) {
        goalScore = selectedGoals.filter((g) => cls.goals.includes(g)).length;
      }
      const fridayPenalty = wantFridayOff && hasFriday(cls) ? 0.6 : 0;
      const score =
        easeScore(cls) * 0.5 +
        goalScore -
        fridayPenalty +
        dayPrefBonus(cls, wantMonWed, wantTueThu, wantFridayOff);
      return { ...cls, __score: score };
    });

    poolNonEasy.sort((a, b) => (b.__score || 0) - (a.__score || 0));

    const startIdx = poolNonEasy.length
      ? Math.abs(Number(refreshKey || 0)) % poolNonEasy.length
      : 0;

    const usedAreaNonEasy = {};
    const out = [];
    for (let k = 0; k < poolNonEasy.length && out.length < numClasses; k++) {
      const cls = poolNonEasy[(startIdx + k) % poolNonEasy.length];

      if (wouldConflictIfFixed(out, cls)) continue;
      const unfulfilled = getAreasForClass(cls.className).filter(
        (a) => !areasTaken.has(a)
      );
      if (unfulfilled.length === 0) continue;
      const area = unfulfilled[0];
      if (!usedAreaNonEasy[area]) usedAreaNonEasy[area] = 0;
      if (usedAreaNonEasy[area] < 1) {
        usedAreaNonEasy[area] += 1;
        out.push({ ...cls, matchedAreas: unfulfilled });
      }
    }

    recommendClasses._hasRun = true;
    return out;
  }

  function easeScore(cls) {
    const hasScore = Number.isFinite(cls.score);
    const hasDiff = Number.isFinite(cls.difficulty);

    const score01 = hasScore ? Math.min(1, Math.max(0, cls.score / 5)) : 0.0;
    const diff01 = hasDiff
      ? Math.min(1, Math.max(0, (5 - (cls.difficulty || 3)) / 4))
      : 0.0;

    const W_SCORE = 0.45;
    const W_DIFF = 0.55;

    let penalty = 0;
    if (!hasScore) penalty += 0.1;
    if (!hasDiff) penalty += 0.2;

    const hintEasy =
      Array.isArray(cls.goals) && cls.goals.includes("easy") ? 0.05 : 0;

    const composite = W_SCORE * score01 + W_DIFF * diff01 + hintEasy - penalty;

    return Math.max(-1, Math.min(1.2, composite));
  }

  function classInSelectedTopics(clsName, selectedAreas, ChicoTOPIC_TO_CLASSES) {
    if (!selectedAreas?.length) return false;
    for (const t of selectedAreas) {
      const list = ChicoTOPIC_TO_CLASSES?.[t] || [];
      if (list.includes(clsName)) return true;
    }
    return false;
  }

  function makeRng(seed) {
    let s = seed || Date.now();
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 2 ** 32;
    };
  }

  function weightedSampleWithoutReplacement(items, weights, k, rng) {
    const picked = [];
    const arr = items.slice();
    const w = weights.slice();
    for (let t = 0; t < k && arr.length > 0; t++) {
      const total = w.reduce((a, b) => a + b, 0) || 1;
      let r = rng() * total;
      let idx = 0;
      while (idx < w.length && r > w[idx]) {
        r -= w[idx];
        idx++;
      }
      if (idx >= arr.length) idx = arr.length - 1;
      picked.push(arr[idx]);
      arr.splice(idx, 1);
      w.splice(idx, 1);
    }
    return picked;
  }
  const isC1 = (a) => /(^|\s)C1\b/i.test(a) || (/Arts/i.test(a) && /C1/i.test(a));
  const isC2 = (a) => /(^|\s)C2\b/i.test(a) || (/Humanities/i.test(a) && /C2/i.test(a));
  const isD = (a) => /^D\b|D\.\s|Social Sciences/i.test(a);

  // ==========================

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
            Smart Class Recommendations Chico
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
            Get personalized course suggestions based on your interests, goals, and academic
            progress
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
                    onClick={() => handleAdd(obj.className, obj.area)}
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
                <li style={{ color: "#aaa", fontStyle: "italic" }}>
                  No classes taken yet.
                </li>
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
                      onClick={() => handleRemove(obj.className, obj.area)}
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
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#a12121")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#d32f2f")
                      }
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
                  <div style={{ fontSize: "1.5em", marginBottom: 6 }}>
                    {area.icon}
                  </div>
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
              {STUDENT_GOALS.map((goal) => (
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
                  <span style={{ fontSize: "1.4em" }}>{goal.icon}</span>
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
              <span style={{ color: "#1AA179", fontWeight: 600 }}>
                {dropdownValue}
              </span>
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

        {/* Recommendations block */}
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
                  <h4
                    style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: "#222" }}
                  >
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
                <div style={{ marginTop: 30 }}>
                  <h3
                    style={{
                      textAlign: "left",
                      fontWeight: 600,
                      marginBottom: 18,
                      fontSize: "1.32em",
                    }}
                  >
                    Recommended Classes
                  </h3>
                  <div
                    style={{
                      width: "100%",
                      overflowX: isMobile ? "auto" : "visible",
                    }}
                  >
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
                         <th style={thStyle}>Schedule</th>
                          <th style={thStyle}>Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations.map((cls, idx) => (
                          <tr
                            key={cls.className + cls.professor + idx}
                            style={{ borderBottom: "1px solid #EAEAEA" }}
                          >
                            <td style={tdStyle}>{cls.className}</td>
                            <td style={tdStyle}>{cls.professor}</td>
                            <td style={tdStyle}>
                              {cls.score !== undefined ? cls.score : "N/A"}
                            </td>
                            <td style={tdStyle}>
                              {cls.difficulty !== undefined ? cls.difficulty : "N/A"}
                            </td>
                          <td style={tdStyle}>
   <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
     {cls.schedule && cls.schedule.length > 0
       ? cls.schedule.map((s, i) => <li key={i}>{s}</li>)
       : <li style={{ color: "#888" }}>Not listed</li>}
   </ul>
 </td>
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
