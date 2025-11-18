import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Cookies from "js-cookie";
import './GETracker.css';
import chicoGeRequirements from '../data/ChicogeRequirements.json';
import chicoClassDetails from '../data/ChicoclassDetails.json';
import { LuTarget } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineXCircle } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { useClassesTaken } from "../lib/classesTakenStore";

const findCourseInText = (s = "") => {
  const t = String(s).toUpperCase();
  const m = t.match(/([A-Z&/]{2,12})\s*0*([0-9]{1,3})([A-Z]?)/);
  if (!m) return null;
  const dept = m[1].split(/[\/,&]/)[0];
  const num = m[2];
  const suf = m[3] || "";
  return `${dept} ${num}${suf}`;
};
const dropLetter = k => k.replace(TRAIL_SUFFIX_RE, " $1");
const EXCLUDE_A1A2A3 = new Set([
  "ENGL 130", "ENGL 130W", "ENGL 130EW", "JOUR 130W",
  "CMST 131", "CMST 132", "HNRS 100",
  "CMST 255", "PHIL 102", "PSYC 100", "ERTH 104"
]);




  // Course code helpers at module scope
const COURSE_RE = /^([A-Z&/]{2,12})\s*0*([0-9]{1,3})([A-Z]{1,3})?$/;
const TRAIL_SUFFIX_RE = /\s([0-9]{1,3})([A-Z]{1,3})$/; // "ENGL 130W" -> drop letters to "ENGL 130"
const mergeByBaseAndProf = (rows) => {
  const keyOf = r => `${courseKey(r.className).replace(TRAIL_SUFFIX_RE," $1")}::${r.professor||"—"}`;
  const getSched = r =>
    Array.isArray(r.schedule) ? r.schedule :
    Array.isArray(r.schedules) ? r.schedules :
    Array.isArray(r.sections) ? r.sections :
    r.schedule ? [String(r.schedule)] : [];
  const map = new Map();
  for (const r of rows) {
    const k = keyOf(r);
    const sched = getSched(r).map(s => String(s).replace(/[–—]/g,"-"));
    if (map.has(k)) {
      const prev = map.get(k);
      prev.schedule = [...new Set([...(prev.schedule||[]), ...sched])];
      if (prev.rmpScore == null && r.rmpScore != null) prev.rmpScore = r.rmpScore;
      if (prev.difficulty == null && r.difficulty != null) prev.difficulty = r.difficulty;
    } else {
      map.set(k, { ...r, schedule: sched });
    }
  }
  return [...map.values()];
};

// replace your canon with this
const canon = s =>
  String(s || "")
    .replace(/\u2013|\u2014/g, "-")        // normalize en and em dashes
    .replace(/\s*-\s*.*$/, "")             // drop anything after the first dash
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
    const areaCanon = s => String(s || "").replace(/\s+/g, " ").trim();

// NEW: robust course key "DEPT NUMBER[letter]" like "CMST 131" or "ENGL 130W"
// robust "DEPT NUMBER[LETTER]" extractor
const courseKey = (s) => {
  const t = String(s || "")
    .toUpperCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  // dept may include slashes or ampersands, take the first token
  const m = t.match(/^([A-Z&/]{2,12})\s*0*([0-9]{1,3})([A-Z]?)/);
  if (m) {
    const dept = m[1].split(/[\/,&]/)[0];
    const num = m[2];
    const suf = m[3] || "";
    return `${dept} ${num}${suf}`;
  }

  // fallback: strip " - subtitle"
  const cleaned = t.replace(/\s*-\s*.*$/, "");
  const parts = cleaned.split(" ");
  if (
    parts.length >= 2 &&
    /^[A-Z]{2,12}$/.test(parts[0]) &&
    /^[0-9]{1,3}[A-Z]?$/.test(parts[1])
  ) {
    return `${parts[0]} ${parts[1]}`;
  }
  return cleaned;
};

const splitAlternatives = (s) =>
  String(s || "")
    .split(/\s*(?:\/|,|;|\bor\b)\s*/i)
    .map(t => t.trim())
    .filter(Boolean);

    // put near splitAlternatives
// put near splitAlternatives
const getClassTokens = a => {
  // accept multiple field names and shapes
  const raw =
    a.classes ??
    a.classOptions ??
    a.options ??
    a.courses ??
    a.list ??
    a.courseList ??
    [];

  const arr = Array.isArray(raw) ? raw : [];
  // normalize strings and object shapes like {code:'PHIL 102'} or {course:'CMST 255'} or {name:'ENGL 130W'}
  return arr
    .map(x => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object") {
        return (
          x.code ||
          x.course ||
          x.name ||
          x.title ||
          x.id ||
          "" // drop empties later
        );
      }
      return "";
    })
    .filter(Boolean);
};

// put near your other constants
// put near HOTFIX_SEED
const HOTFIX_SEED = {
  "English Composition (GNED 1A)": ["ENGL 130W", "ENGL 130EW", "JOUR 130W"],
  "Critical Thinking (GNED 1B)": ["CMST 255", "PHIL 102", "PSYC 100", "ERTH 104"],
  "Oral Communication (GNED 1C)": ["CMST 131", "CMST 132", "HNRS 100"]
};



const titleCanon = (s) =>
  String(s || "")
    .toUpperCase()
    .replace(/\([^)]*\)/g, "")  // drop things like (W)
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();

const looksLikeCode = (s) => /^[A-Z&/]{2,12}\s*[0-9]{1,3}[A-Z]?$/.test(String(s || "").toUpperCase());


const toNum = v => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).trim().toLowerCase();
  if (s === "n/a" || s === "na" || s === "n\\a" || s === "n.a.") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

// turn "[url](url)" or "[url]" into plain url, drop n/a
const stripMdLink = url => {
  if (typeof url !== "string") return null;
  const t = url.trim();
  if (!t || /^n\/?a$/i.test(t)) return null;
  const md = t.match(/\]\((https?:[^)]+)\)$/);
  if (md) return md[1];
  const br = t.match(/^\[(https?:[^\]]+)\]$/);
  if (br) return br[1];
  return t;
};

// put this near your other helpers
const extractTitle = (s) => {
  const t = String(s || "").replace(/[–—]/g, "-").trim();
  // dept + number + optional letter, followed by optional separator and a title
  const m = t.match(
    /^([A-Z&/]{2,12})\s*0*[0-9]{1,3}[A-Z]?\s*(?:[-:]\s*|\s{2,}|\s+-\s+)?(.*)$/
  );
  const rest = m && m[2] ? m[2].trim() : "";
  return rest; // may be ""
};

// put these near your other helpers
// renamed to avoid clashing with the later `normalize`
const normalizeText = (str = "") => String(str).replace(/\s+/g, " ").trim().toLowerCase();
const slug = s => normalizeText(s).replace(/[^a-z0-9]/g, ""); // drop spaces, dashes, punctuation

const sameClass = (a = "", b = "") => slug(a) === slug(b);



const isMobile = window.innerWidth < 768;
// ChecklistToggleContent remains unchanged, just using props
function ChecklistToggleContent({
  geRequirements,
  classesTaken,
  classToAreas,
  c1c2Fulfilled,
  scrollToArea
}) {
 const checklistData = geRequirements.map((req) => {
    const area = req.area;
    
 const taken = classesTaken.filter((c) => {
   // credit immediately if the saved area matches
   if (areaCanon(c.area) === areaCanon(area)) return true;
   // otherwise fall back to name → area mapping
   const k = courseKey(c.className);
   const mappedAreas =
     classToAreas[c.className] ||
     classToAreas[k] ||
     classToAreas[k.replace(TRAIL_SUFFIX_RE, " $1")] ||
     [];
   return mappedAreas.some(a => areaCanon(a) === areaCanon(area));
 });

    const count = req.requiredCount || 1;
    const fulfilled = taken.length >= count;
    return { area, fulfilled };
  });

  return (
    <ul className="ge-checklist-grid">
      {checklistData.map((item, i) => (
        <li
          key={`checklist-${i}`}
          className={`ge-checklist-item${item.fulfilled ? " fulfilled" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => scrollToArea(item.area)}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") scrollToArea(item.area); }}
          role="button"
          aria-pressed={item.fulfilled}
        >
          <span className="ge-checklist-area">{item.area}</span>
          <span className="ge-checklist-status">{item.fulfilled ? "✅" : "❌"}</span>
        </li>
      ))}
    </ul>
  );
}


function ProgressSummary({ geRequirements, classesTaken, classToAreas, c1c2Fulfilled }) {
  const totalReqs = geRequirements.length;

const fulfilledCount = geRequirements.reduce((count, req) => {
    const area = req.area;
const taken = classesTaken.filter((c) => {
   if (areaCanon(c.area) === areaCanon(area)) return true;
   const k = courseKey(c.className);
   const mappedAreas =
     classToAreas[c.className] ||
     classToAreas[k] ||
     classToAreas[k.replace(TRAIL_SUFFIX_RE, " $1")] ||
     [];
   return mappedAreas.some(a => areaCanon(a) === areaCanon(area));
 });

    const requiredCount = req.requiredCount || 1;
    const fulfilled = taken.length >= requiredCount;
    return fulfilled ? count + 1 : count;
  }, 0);

  const progressPercent = totalReqs === 0 ? 0 : Math.round((fulfilledCount / totalReqs) * 100);

  return (
    <section style={{
      width: "100%",
      backgroundColor: "transparent",
      padding: 0,
      boxShadow: "none",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.6rem",
        fontWeight: 600,
        marginBottom: 12,
        color: "#000"
      }}>
        <LuTarget style={{ color: "#20A7EF", marginRight: 8 }} />
        Graduation Progress
      </div>

      <div style={{
        background: "#e0e0e0",
        borderRadius: 12,
        overflow: "hidden",
        height: 20,
        marginBottom: 6,
        width: "100%"
      }}>
        <div style={{
          background: "#20a7ef",
          height: "100%",
          width: `${progressPercent}%`,
          transition: "width 0.5s ease"
        }} />
      </div>

      <div style={{
        fontSize: "2.5rem",
        fontWeight: 600,
        color: "#20A7EF",
        textAlign: "center",
        marginBottom: 24,
      }}>
        {progressPercent}% <span style={{ fontSize: "0.8rem", color: "#555" }}>Complete</span>
      </div>

   {!isMobile && (
  <div
    style={{
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      fontSize: "1.66rem",
      fontWeight: 600,
      color: "#222",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <IoMdCheckmarkCircleOutline style={{ color: "#6FD47F", fontSize: "2rem" }} />
      <span>{fulfilledCount} Completed</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <HiOutlineXCircle style={{ color: "#FF3B30", fontSize: "2rem" }} />
      <span>{totalReqs - fulfilledCount} Remaining</span>
    </div>
  </div>
)}
    </section>
  );
}
function ChecklistModal({ open, onClose, children, brandBlue = "#20A7EF" }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="General Education Checklist"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 92vw)",
          maxHeight: "80vh",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          transform: isMobile ? "translateY(32px)" : undefined, // mobile nudge
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Checklist</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: `2px solid ${brandBlue}`,
              color: brandBlue,
              borderRadius: 10,
              fontWeight: 700,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
        <div style={{ padding: 16, overflow: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function SJSUMobileFinder({
  geRequirements,
  classDetails,
  classesTaken,
  onAddClass,
  onDeleteClass,
  search,
  setSearch,
  classToAreas,
  selectedArea,
  onSelectArea,
  canonToExactName,
  areaToCanonSet,
  scheduleByClass = new Map(),
  onJumpToEasiest,
  isTaken,
  hideResults = false, 
}) {


  const brandBlue = "#20A7EF";
  const edge = { width: "100%", boxSizing: "border-box", marginInline: 0 };

 const [area, setArea] = React.useState(areaCanon(selectedArea || geRequirements?.[0]?.area || ""));
React.useEffect(() => {
  if (selectedArea && areaCanon(selectedArea) !== area) setArea(areaCanon(selectedArea));
}, [selectedArea]);

  const [overlayMode, setOverlayMode] = React.useState("all"); // "all" | "easiest"
  const [selectedAllClass, setSelectedAllClass] = React.useState(null);
  // at top of GETracker (Chico), after other useState/useRef

// owns its own "easiest" state for mobile
const [easiestResults, setEasiestResults] = React.useState({});
const [easiestLoading, setEasiestLoading] = React.useState({});
const [selectedClass, setSelectedClass] = React.useState(null);
// under other local state in SJSUMobileFinder


// Grid styling constants
const GRID = "#e0e5ff";
const thGrid = (isLast = false) => ({
  textAlign: isLast ? "right" : "left",
  padding: "10px 12px",
  fontWeight: 700,
  background: "#fafbff",
  borderBottom: `1px solid ${GRID}`,
  borderRight: isLast ? "none" : `1px solid ${GRID}`,
});
const tdGrid = (isLast = false) => ({
  padding: "10px 12px",
  borderTop: `1px solid ${GRID}`,
  borderRight: isLast ? "none" : `1px solid ${GRID}`,
  verticalAlign: "top",
});

  const grid = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      border: `1px solid ${GRID}`,
      borderRadius: 12,
      overflow: "hidden",
    },
    td: {
      padding: "10px 12px",
      borderTop: `1px solid ${GRID}`,
      verticalAlign: "top",
    },
  };

  const getScheduleLines = React.useCallback((entry) => {
    if (!entry) return [];
    if (Array.isArray(entry.schedules) && entry.schedules.length) return entry.schedules;
    if (Array.isArray(entry.schedule) && entry.schedule.length) return entry.schedule;
    if (Array.isArray(entry.sections) && entry.sections.length) return entry.sections;
    const raw = entry.schedule || entry.time || entry.days || "";
    if (!raw) return [];
    const parts = String(raw).split(/\s*(?:\n|,|;|•|\/|\|)\s*/).filter(Boolean);
    return parts.length ? parts : [String(raw)];
  }, []);
  // Return all rows in normalizedDetails that match this class (ignoring subtitles / dashes)
 
  
  const chooseAreaForClass = React.useCallback((className) => {
    const areas = classToAreas[className] || [];
    const takenAreas = new Set(classesTaken.map((c) => c.area));
    return areas.find((a) => !takenAreas.has(a)) || areas[0] || area || geRequirements?.[0]?.area || "";
  }, [classToAreas, classesTaken, area, geRequirements]);

// was: return (areaObj.classes || []).filter((cls) => classesWithProfessors.has(cls));
const allOptionsForArea = React.useMemo(() => {
  const keySet = areaToCanonSet?.get(areaCanon(area));
  if (keySet && keySet.size) {
    return [...keySet].map(k => canonToExactName.get(k) || k);
  }
  // Fallback: read tokens via getClassTokens
  const areaObj = geRequirements.find(a => areaCanon(a.area) === areaCanon(area));
  if (!areaObj) return [];
  const toks = getClassTokens(areaObj).flatMap(splitAlternatives);
  const keys = new Set(toks.map(courseKey));
  return [...keys].map(k => canonToExactName.get(k) || k);
}, [area, areaToCanonSet, canonToExactName, geRequirements]);

const findEasiestClasses = React.useCallback((selected) => {
  setEasiestLoading(p => ({ ...p, [selected]: true }));

// widen matching: handle ORs and drop trailing letter like 130W -> 130

const expandList = s =>
  String(s || "")
    .split(/\s*(?:\/|,|;|\bor\b)\s*/i)
    .map(t => t.trim())
    .filter(Boolean);

const widenKey = s => {
  const k = courseKey(s);
  const base = k.replace(TRAIL_SUFFIX_RE, " $1");
  return [k, base];
};

const allowedKeys = areaToCanonSet?.get(areaCanon(selected)) ?? new Set();



let rows = classDetails.filter(d => {
  const [k, base] = widenKey(d.className);
  return allowedKeys.has(k) || allowedKeys.has(base);
});


  rows = rows.map(r => ({
    ...r,
    rmpLink: r.rmpLink ?? (r.link && r.link !== "N/A" ? r.link : null),
    rmpScore: Number.isFinite(r.rmpScore) ? r.rmpScore
           : Number.isFinite(r.score) ? r.score
           : null,
    __hasDiff: Number.isFinite(r.difficulty),
    __diffVal: Number.isFinite(r.difficulty) ? r.difficulty : 10
  }));

  rows.sort((a, b) => {
    if (a.__hasDiff !== b.__hasDiff) return a.__hasDiff ? -1 : 1;
    if (a.__diffVal !== b.__diffVal) return a.__diffVal - b.__diffVal;
    if (a.rmpScore != null && b.rmpScore != null) return b.rmpScore - a.rmpScore;
    return String(a.className).localeCompare(String(b.className));
  });

  setEasiestResults(p => ({ ...p, [selected]: rows.slice(0, 5) }));
  setEasiestLoading(p => ({ ...p, [selected]: false }));
}, [classDetails, geRequirements]);

  React.useEffect(() => {
    if (overlayMode === "easiest" && area) findEasiestClasses(area);
  }, [area, overlayMode, findEasiestClasses]);

  const searchResults = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    const filtered = classDetails.filter(({ className, professor }) => {
      const cn = (className || "").toLowerCase();
      const pf = (professor || "").toLowerCase();
      return cn.includes(term) || pf.includes(term);
    });
    const map = new Map();
    for (const row of filtered) if (!map.has(row.className)) map.set(row.className, row);
    return Array.from(map.values());
  }, [search, classDetails]);

  // Map "ENGL 130W" and base "ENGL 130" to a representative detail row
const detailByCourse = React.useMemo(() => {
  const m = new Map();
  for (const r of classDetails) {
    const k = courseKey(r.className);
    const base = k.replace(TRAIL_SUFFIX_RE, " $1");
    if (!m.has(k)) m.set(k, r);
    if (!m.has(base)) m.set(base, r);
  }
  return m;
}, [classDetails]);

const profRowsFor = React.useCallback((cls) => {
  const target = courseKey(cls);
  const targetBase = target.replace(TRAIL_SUFFIX_RE, " $1");

  return classDetails
    .filter(r => {
      const k = courseKey(r.className);
      const base = k.replace(TRAIL_SUFFIX_RE, " $1");
      return k === target || k === targetBase || base === target || base === targetBase;
    })
    .map(r => ({
      ...r,
      rmpLink: r.rmpLink ?? (r.link && r.link !== "N/A" ? r.link : null),
      rmpScore: Number.isFinite(r.rmpScore) ? r.rmpScore
              : Number.isFinite(r.score) ? r.score
              : null
    }));
}, [classDetails]);

// grid lines for mobile detail table

const thCell = (isLast = false) => ({
  textAlign: isLast ? "right" : "left",
  padding: "10px 12px",
  fontWeight: 700,
  background: "#fafbff",
  borderBottom: `1px solid ${GRID}`,
  borderRight: isLast ? "none" : `1px solid ${GRID}`,
});
const tdCell = (isLast = false) => ({
  padding: "10px 12px",
  borderTop: `1px solid ${GRID}`,
  borderRight: isLast ? "none" : `1px solid ${GRID}`,
  verticalAlign: "top",
});
const isMobile = typeof window !== "undefined" && window.innerWidth <= 700;
if (!isMobile) return null;

  return (
    <section
      style={{
        background: "transparent",
        padding: 0,
        borderRadius: 0,
        boxShadow: "none",
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto 24px",
        boxSizing: "border-box",
        position: "relative",
      }}
      aria-label="Course Finder"
    >
      {/* Search */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 10,
          marginBottom: 12,
          position: "relative",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses"
          style={{
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            fontSize: 16,
            lineHeight: 1.15,
            borderRadius: 10,
            border: "1px solid #d1d5db",
            outline: "none",
            WebkitAppearance: "none",
            appearance: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = brandBlue)}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
        />

        {searchResults.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 8,
              border: "1px solid #d1d5db",
              borderTop: "none",
              maxHeight: 240,
              overflowY: "auto",
              backgroundColor: "#fff",
              position: "absolute",
              left: 0,
              right: 0,
              top: "calc(100% + 6px)",
              width: "auto",
              boxSizing: "border-box",
              zIndex: 20,
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 8px 16px rgba(58, 96, 255, 0.12)",
            }}
          >
            {searchResults.map((obj) => (
              <li
                key={obj.className}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  fontWeight: 600,
                  color: "#222",
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                const exact = canonToExactName?.get(courseKey(obj.className)) || obj.className;

                const chosenArea = chooseAreaForClass(exact);
                onAddClass(exact, chosenArea);
                  setSearch("");
                }}
              >
                <strong>{obj.className}</strong>{" "}
                <span style={{ color: "#666" }}>
                  ({(classToAreas[obj.className] || []).join(", ") || "—"})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Classes Taken under search */}
      <div style={{ ...edge, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Classes Taken</div>
        {classesTaken.length === 0 ? (
          <div style={{ color: "#777" }}>No classes yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {classesTaken.map((obj) => (
              <li
                key={`${obj.className}::${obj.area || "NA"}`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
              >
                <div>
                  <strong>{obj.className}</strong>{" "}
                  <span style={{ color: "#555" }}>({obj.area})</span>
                </div>
                <button
                  onClick={() => onDeleteClass(obj)}
                  type="button"
                  style={{
                    background: "#d32f2f", color: "#fff", border: 0,
                    borderRadius: 8, padding: "6px 10px", fontWeight: 700
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filter by GE Area */}
      <div style={{ ...edge, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Filter by GE Area</div>
<select
  value={areaCanon(area)}
  onChange={(e) => {
    const v = areaCanon(e.target.value);
    setArea(v);
    onSelectArea?.(v);
    setSelectedAllClass(null);
  }}
  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db" }}
>
  {geRequirements.map((a) => (
    <option key={a.area} value={areaCanon(a.area)}>{a.area}</option>
  ))}
</select>
      </div>

        {/* BODY: single, valid conditional. No dangling fragments */}
      {selectedAllClass ? (
        <div style={{ padding: 6 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem" }}>{selectedAllClass}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedAllClass(null);
                  onJumpToEasiest?.(area);
                }}
                style={{
                  background: "transparent",
                  border: "2px solid #20A7EF",
                  borderRadius: 10,
                  color: "#20A7EF",
                  padding: "6px 10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Easiest
              </button>
              <button
                type="button"
                onClick={() => setSelectedAllClass(null)}
                style={{
                  background: "transparent",
                  border: "2px solid #20A7EF",
                  borderRadius: 10,
                  color: "#20A7EF",
                  padding: "6px 10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            </div>
          </div>

          <h3 style={{ margin: "0 0 10px 0", fontSize: "1rem" }}>
            {selectedAllClass}
          </h3>

          {(() => {
            const rows = profRowsFor(selectedAllClass);
            if (!rows.length) {
              return (
                <div style={{ color: "#777" }}>No professor data yet.</div>
              );
            }

            return (
              <div
                style={{
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  maxWidth: "100%",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: 720,
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                    border: `1px solid ${GRID}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    fontSize: ".85rem",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "35%" }} />
                    <col style={{ width: "12%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={thGrid(false)}>Professor</th>
                      <th
                        style={{ ...thGrid(false), textAlign: "center" }}
                      >
                        RMP
                      </th>
                      <th
                        style={{ ...thGrid(false), textAlign: "center" }}
                      >
                        Diff
                      </th>
                      <th style={thGrid(false)}>Schedule</th>
                      <th
                        style={{ ...thGrid(true), textAlign: "right" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const lines = getScheduleLines(row);
                      const rmp =
                        typeof row.rmpScore === "number"
                          ? row.rmpScore.toFixed(1)
                          : row.rmpScore || "—";
                      const diff =
                        typeof row.difficulty === "number"
                          ? row.difficulty
                          : "—";
                      const rmpLink =
                        row.rmpLink ??
                        (row.link && row.link !== "N/A" ? row.link : null);
                      const currentArea = areaCanon(selectedArea || area);
                      const taken = classesTaken.some(
                        (t) =>
                          t.className === row.className &&
                          (areaCanon(t.area) === currentArea || !t.area)
                      );
                      const toDelete =
                        classesTaken.find(
                          (t) =>
                            t.className === row.className &&
                            (areaCanon(t.area) === currentArea || !t.area)
                        ) || {
                          id: row.className,
                          className: row.className,
                          area: selectedArea || area,
                        };

                      return (
                        <tr
                          key={`${row.className}-${row.professor || "NA"}-${idx}`}
                        >
                          <td style={tdGrid(false)}>
                            {rmpLink ? (
                              <a
                                href={rmpLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontWeight: 700,
                                  textDecoration: "underline",
                                }}
                              >
                                {row.professor || "—"}
                              </a>
                            ) : (
                              <span style={{ fontWeight: 700 }}>
                                {row.professor || "—"}
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              ...tdGrid(false),
                              textAlign: "center",
                            }}
                          >
                            {rmp}
                          </td>
                          <td
                            style={{
                              ...tdGrid(false),
                              textAlign: "center",
                            }}
                          >
                            {diff}
                          </td>
                          <td
                            style={{
                              ...tdGrid(false),
                              fontSize: ".8rem",
                              color: "#555",
                            }}
                          >
                            {lines.length ? lines.join(" | ") : "—"}
                          </td>
                          <td
                            style={{
                              ...tdGrid(true),
                              textAlign: "right",
                            }}
                          >
                            {taken ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteClass(toDelete);
                                }}
                                type="button"
                                style={{
                                  background: "#d32f2f",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "5px 10px",
                                  fontWeight: 700,
                                  fontSize: ".8rem",
                                  cursor: "pointer",
                                }}
                              >
                                Delete
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const targetArea = chooseAreaForClass(
                                    row.className
                                  );
                                  onAddClass(row.className, targetArea);
                                }}
                                type="button"
                                style={{
                                  background: "#20a7ef",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "5px 10px",
                                  fontWeight: 700,
                                  fontSize: ".8rem",
                                  cursor: "pointer",
                                }}
                              >
                                Add
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            border: "1.5px solid #222",
            borderRadius: 12,
            overflow: "hidden",
            fontSize: "0.85rem",
          }}
        >
          <colgroup>
            <col style={{ width: "80%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>

     
        </table>
      )}
      {/* old View All table removed – mobile overlay handles View All now */}
    </section>
  );
}




  // Main: Fully self-contained GETracker component
  export default function GETracker({

    geRequirements = chicoGeRequirements,
    classDetails = chicoClassDetails,
    c1c2Fulfilled = false,
    areaCWarning = null,
    university = "chico",
  }) {
      const [selectedArea, setSelectedArea] = useState(null);
  const [overlayMode, setOverlayMode] = useState("all"); // "all" or "easiest"
  // Desktop-only "View All" modal state

  const [selectedAllClass, setSelectedAllClass] = useState(null);
  const normalizedDetails = useMemo(() => {


    const arr = Array.isArray(classDetails) ? classDetails : [];
  return arr.map(row => {
    const className = String(row.className || "")
      .replace(/\u2013|\u2014/g, "-")
      .replace(/\s*-\s*/, " - ")
      .trim();
  const professor =
        String(row.professor ?? row.instructor ?? row.Professor ?? row.prof ?? "")
          .trim() || null;
    const score =
      toNum(row.score) ??
      toNum(row.rmpScore) ??
      toNum(row.rating) ??
      toNum(row.RMPScore);

    const diffRaw =
      row.difficulty ??
      row.diff ??
      row.rmpDifficulty ??
      row.difficultyScore ??
      row.Difficulty ??
      row.RMPDifficulty;

    const difficulty = toNum(diffRaw);
    const rmpLink = stripMdLink(row.rmpLink ?? row.link);

    const sched =
      Array.isArray(row.schedule)
        ? row.schedule
        : row.schedule
          ? [String(row.schedule)]
          : Array.isArray(row.schedules)
            ? row.schedules
            : Array.isArray(row.sections)
              ? row.sections
              : [];

    const codeKeyVal = courseKey(className); // e.g., ENGL 130W
  const tPart = extractTitle(className);
      const titleCanonVal = tPart ? titleCanon(tPart) : null;
    return {
      ...row,
      professor,
      className,
      rmpScore: score,
      score,
      difficulty,
      rmpLink,
      link: rmpLink,
      schedule: sched.map(s => String(s).replace(/\u2013|\u2014/g, "-")),
      codeKey: codeKeyVal,
      titleCanon: titleCanonVal,
    };
  });

  }, [classDetails]);

  // Map "ENGL 130W" and base "ENGL 130" to an array of schedule lines
  const scheduleByClass = useMemo(() => {
    const m = new Map();
    for (const row of normalizedDetails) {
      const k = courseKey(row.className);
      const base = k.replace(TRAIL_SUFFIX_RE, " $1");
      const lines = getScheduleLines(row); // already normalizes to array of lines
      if (!m.has(k)) m.set(k, lines);
      if (!m.has(base)) m.set(base, lines);
    }
    return m;
  }, [normalizedDetails]);

  // Map course key/base -> representative detail row
  const detailsByKey = useMemo(() => {
    const m = new Map();
    for (const r of normalizedDetails) {
      const k = courseKey(r.className);
      const base = k.replace(TRAIL_SUFFIX_RE, " $1");
      if (!m.has(k)) m.set(k, r);
      if (!m.has(base)) m.set(base, r);
    }
    return m;
  }, [normalizedDetails]);

  // GETracker-scoped: collect every professor row for a given class label
  const profRowsFor = useCallback((cls) => {
    const target = courseKey(cls);
    const targetBase = target.replace(TRAIL_SUFFIX_RE, " $1");

    return normalizedDetails
      .filter(r => {
        const k = courseKey(r.className);
        const base = k.replace(TRAIL_SUFFIX_RE, " $1");
        return k === target || k === targetBase || base === target || base === targetBase;
      })
      .map(r => ({
        ...r,
        rmpLink: r.rmpLink ?? (r.link && r.link !== "N/A" ? r.link : null),
        rmpScore: Number.isFinite(r.rmpScore) ? r.rmpScore
                : Number.isFinite(r.score) ? r.score
                : null,
      }));
  }, [normalizedDetails]);

  const canonToExactName = useMemo(() => {
    const m = new Map();
    for (const r of normalizedDetails) {
      const k = courseKey(r.className);
      if (!m.has(k)) m.set(k, r.className);
    }
    return m;
  }, [normalizedDetails]);
  const sameCourse = (a, b) => courseKey(a) === courseKey(b);

  const titleCanonToKeys = useMemo(() => {
    const m = new Map();
    for (const r of normalizedDetails) {
      if (!r.codeKey) continue;
      const k = r.codeKey;
      const base = k.replace(TRAIL_SUFFIX_RE, " $1");
      const tcanon = r.titleCanon;
      if (tcanon) {
        if (!m.has(tcanon)) m.set(tcanon, new Set());
        m.get(tcanon).add(k);
        m.get(tcanon).add(base);
      }
    }
    return m;
  }, [normalizedDetails]);

  // GNED alias helpers
  const extractGnedCode = (s) => {
    const m = String(s || "").toUpperCase().match(/\bGNED\s*([0-9][A-Z])\b/);
    return m ? m[1] : null; // e.g., "3B"
  };

  const gnedAliasForms = (code) => {
    if (!code) return [];
    const c = code.toUpperCase();          // "3B"
    const cDash = c.replace(/^(\d)([A-Z])$/, "$1-$2"); // "3-B"
    return [c, cDash, `GNED ${c}`];
  };


  const areaToCanonSet = useMemo(() => {
    const map = new Map();

    geRequirements.forEach(a => {
      let toks = getClassTokens(a).flatMap(splitAlternatives);

      // include seeds by raw or canonical area name
      const seed = HOTFIX_SEED[a.area] || HOTFIX_SEED[areaCanon(a.area)] || [];
      toks = [...toks, ...seed];

      const keys = new Set();

      // map tokens to course keys
  for (const t of toks) {
    // 1) grab code from anywhere in the token (works for "Title - CODE" and "CODE - Title")
    const any = findCourseInText(t);
    if (any) {
      const k = courseKey(any);
      const base = dropLetter(k);
      keys.add(k); keys.add(base);
      continue;
    }
    // 2) fallback to title mapping as before
    const tc = titleCanon(t);
    const fromTitle = titleCanonToKeys.get(tc);
    if (fromTitle && fromTitle.size) {
      for (const k of fromTitle) keys.add(k);
    }
  }


  // safety nets: distinguish Critical Thinking vs Quantitative/Math
  if (keys.size === 0) {
    const ac = titleCanon(a.area);

    // Critical Thinking: do NOT match "reasoning" to avoid colliding with math
    const isCritical = /\bCRIT(ICAL)?\b|\bLOGIC(AL)?\b/.test(ac);

    // Quantitative/Math: pick up MATH/STAT and common quant words
    const isQuant = /\bQUANT(ITATIVE)?\b|\bMATH(EMATICS)?\b|\bSTAT(ISTIC|ISTICS)?\b/.test(ac);

    if (isCritical) {
      for (const r of normalizedDetails) {
        const k = r.codeKey;
        if (!k) continue;
        const base = k.replace(TRAIL_SUFFIX_RE, " $1");

        if (r.titleCanon && (/\bCRIT(ICAL)?\b|\bLOGIC(AL)?\b/.test(r.titleCanon))) {
          keys.add(k); keys.add(base);
        }
        // common Chico A3 candidates
        if ((/^PHIL\s(10[2-9]|12[0-9]|129)\b/.test(k)) || (/^CMST\s255\b/.test(k))) {
          keys.add(k); keys.add(base);
        }
      }
    } else if (isQuant) {
      for (const r of normalizedDetails) {
        const k = r.codeKey;
        if (!k) continue;
        const base = k.replace(TRAIL_SUFFIX_RE, " $1");

        // prefer course codes first
        if (/^(MATH|STAT)\s/.test(k)) {
          keys.add(k); keys.add(base);
          continue;
        }
        // then titles that look like quant/math/stat
        if (
          r.titleCanon &&
          (/\bQUANT(ITATIVE)?\b|\bSTAT(ISTIC|ISTICS)?\b|\bPROBABILIT(Y|IES)\b|\bALGEBRA\b|\bCALCULUS\b|\bNUMERIC(AL)?\b/.test(r.titleCanon))
        ) {
          keys.add(k); keys.add(base);
        }
      }
    }
  }

  // --- Humanities safe fallback if nothing matched ---
  if (keys.size === 0 && /\bHUMANITIES\b/i.test(a.area)) {
    for (const r of normalizedDetails) {
      const k = r.codeKey; if (!k) continue;
      const base = dropLetter(k);
      // narrower pool for 3B
      if (/^(HUMN|RELS|HIST|ITAL|JAPN|GERM|FREN|SPAN|LAST|AIST|CMSD|CMST|TECH|HNRS|ENGL|PHIL)\s/.test(k)) {
        keys.add(k); keys.add(base);
      }
    }
  }

  // Remove A1/A2/A3 codes if this area is GNED 3B
  if (extractGnedCode(a.area) === "3B") {
    for (const code of EXCLUDE_A1A2A3) {
      keys.delete(code);
      keys.delete(dropLetter(code));
    }
  }

  // --- Write primary key and GNED aliases to the same Set ---
  const primaryKey = areaCanon(a.area);
  const aliases = [primaryKey, ...gnedAliasForms(extractGnedCode(a.area))];
  aliases.forEach(name => map.set(name, keys));

    });

    return map;
  }, [geRequirements, titleCanonToKeys, normalizedDetails]);


  const classToAreas = useMemo(() => {
    const map = {};
    const add = (key, area) => {
      if (!key) return;
      if (!map[key]) map[key] = [];
      if (!map[key].includes(area)) map[key].push(area);
    };

  geRequirements.forEach(areaObj => {
    const toks = getClassTokens(areaObj).flatMap(splitAlternatives);
      toks.forEach(cls => {
        if (looksLikeCode(cls)) {
          const k = courseKey(cls);
          const base = k.replace(TRAIL_SUFFIX_RE, " $1");
          add(k, areaObj.area);
          add(base, areaObj.area);
          add(String(cls).trim(), areaObj.area); // for UI echo
        } else {
          const tc = titleCanon(cls);
          const fromTitle = titleCanonToKeys.get(tc);
          if (fromTitle && fromTitle.size) {
            for (const k of fromTitle) add(k, areaObj.area);
          }
          add(String(cls).trim(), areaObj.area); // fallback label
        }
      });
    });
    return map;
  }, [geRequirements, titleCanonToKeys]);

  const areasFor = useCallback(
    name => classToAreas[name] || classToAreas[courseKey(name)] || [],
    [classToAreas]
  );


  // Optional but recommended. Keep it right under classToAreas.
    // ✅ Top-level hook (not in useEffect/handlers/conditionals)
  // before
  // const classesTaken = useClassesTaken();
  // subscribe to store updates
  const { add, remove, list } = useClassesTaken();

  // local “version” to force re-render after store mutations
  const [rev, setRev] = React.useState(0);

  // wrap actions so they bump the version
  const addClass = React.useCallback(
    (payload) => { add(payload); setRev((r) => r + 1); },
    [add]
  );
  useEffect(() => {
    const have = new Set(normalizedDetails.map(d => canon(d.className)));
    const rows = geRequirements.map(a => {
      const total = (a.classes || []).length;
      const matched = (a.classes || []).filter(c => have.has(canon(c))).length;
      return { area: a.area, total, matched };
    });
    console.table(rows);
  }, [normalizedDetails, geRequirements]);

  const removeClass = React.useCallback(
    (idOrObj) => {
      const id = typeof idOrObj === "string" ? idOrObj : (idOrObj?.id || idOrObj?.className);
      if (!id) return;
      remove(id);
      setRev((r) => r + 1);
    },
    [remove]
  );

  // derive the UI shape from the store list (recomputes when rev changes)
  const classesTaken = React.useMemo(() => {
    const arr = list() || [];
    return arr.map((it) => ({
      id: it.id,
      className: it.title || it.id,
      area: it.area || null,
    }));
  }, [list, rev]);

  const chooseAreaForClass = React.useCallback((className) => {
    const k = courseKey(className);
    const base = k.replace(TRAIL_SUFFIX_RE, " $1");
    const takenAreas = new Set(classesTaken.map(c => areaCanon(c.area || "")));
    for (const a of geRequirements) {
      const key = areaCanon(a.area);
      const set = areaToCanonSet.get(key);
      if (set && (set.has(k) || set.has(base))) {
        if (!takenAreas.has(key)) return a.area;
      }
    }
    const mapped = classToAreas[className] || classToAreas[k] || classToAreas[base] || [];
    if (mapped.length) return mapped[0];
    return geRequirements?.[0]?.area || "Other";
  }, [classesTaken, geRequirements, areaToCanonSet, classToAreas]);
  // helpers that use the reactive classesTaken
  // helpers that use the reactive classesTaken (robust to "CLASS - Subtitle" vs "CLASS")
  // replace your normalize with this
  const normalize = s =>
    typeof s === "string"
      ? s.replace(/\u2013|\u2014/g, "-").replace(/\s*-\s*.*$/, "").trim()
      : s;


  const findStoredEntry = React.useCallback(
    (name) => {
      const n = normalize(name);
      return classesTaken.find(
        (t) => normalize(t.id) === n || normalize(t.className) === n
      ) || null;
    },
    [classesTaken]
  );

  const isTaken = React.useCallback(
    (name) => !!findStoredEntry(name),
    [findStoredEntry]
  );

  const removeByName = React.useCallback(
    (name) => {
      const entry = findStoredEntry(name);
      const id = entry?.id || name; // fall back to name if not found
      removeClass(id);
    },
    [findStoredEntry, removeClass]
  );




    // INTERNAL SEARCH STATE AND FILTERING: Chico-only classes filtered here
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null); // ✅ top-level hook
  const selectedPanelRef = useRef(null);


    // Filter Chico classDetails on search input changes
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setSearchResults([]); return; }

    const tokens = q.split(/\s+/);
    const seen = new Map();

    for (const r of normalizedDetails) {
      const hay = `${r.className} ${r.professor || ""}`.toLowerCase();
      if (tokens.every(t => hay.includes(t))) {
        const key = canon(r.className);
        if (!seen.has(key)) {
          const exact = canonToExactName.get(key) || r.className;
          seen.set(key, { className: exact });
        }
      }
    }

    const out = Array.from(seen.values()).map(o => ({
      ...o,
      areas: (classToAreas[o.className] || []).join(", ")
    }));
    setSearchResults(out);
  }, [search, normalizedDetails, classToAreas, canonToExactName]);


  const brandBlue = "#20A7EF";
  // 👇 add once, near your other style constants
  const grid = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #d7dbff",
      borderRadius: 12,
      overflow: "hidden",
    },
    th: {
      padding: "10px 12px",
      textAlign: "left",
      fontWeight: 700,
      borderBottom: "1px solid #d7dbff",
      background: "#fff",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "10px 12px",
      borderTop: "1px solid #eef1ff",
      verticalAlign: "top",
    },
  };
  // ---- shared table cell helpers (module scope) ----
  const GRID_BLUE = "#e0e5ff";
  const thCell = (isLast = false) => ({
    textAlign: isLast ? "right" : "left",
    padding: "10px 12px",
    fontWeight: 700,
    background: "#fafbff",
    borderBottom: `1px solid ${GRID_BLUE}`,
    borderRight: isLast ? "none" : `1px solid ${GRID_BLUE}`,
  });
  const tdCell = (isLast = false) => ({
    padding: "10px 12px",
    borderTop: `1px solid ${GRID_BLUE}`,
    borderRight: isLast ? "none" : `1px solid ${GRID_BLUE}`,
    verticalAlign: "top",
  });

    // Other state from your original component
    const [openAreas, setOpenAreas] = useState(new Set());
    const [openMenus, setOpenMenus] = useState(new Set());
    const [easiestResults, setEasiestResults] = useState({});
    const [easiestLoading, setEasiestLoading] = useState({});
    const [a1TextVisible, setA1TextVisible] = useState(true);
    const [checklistOpen, setChecklistOpen] = useState(false);
    const [mobileArea, setMobileArea] = useState(geRequirements?.[0]?.area || "");

  const jumpToMobileEasiest = useCallback((area) => {
    const key = areaCanon(area);
    setMobileArea(key);
    setSelectedArea(key);
    setOverlayMode("easiest");
    setSelectedAllClass(null);
  }, []);

// Keep mobile selection driving the Easiest overlay on phones,
// but only for the initial selection so it doesn't override user changes.
useEffect(() => {
  if (typeof window === "undefined") return;
  const mobile = window.innerWidth <= 700;
  if (!mobile || !mobileArea) return;

  // Only auto-select the area once, when nothing is selected yet
  if (!selectedArea) {
    setSelectedArea(mobileArea);
    setOverlayMode("easiest");
    setSelectedAllClass(null);
  }
}, [mobileArea, selectedArea]);

  // 👇 IN GETracker (Chico), near other hooks/state
  const finderRef = useRef(null);

  const scrollToFinder = useCallback(() => {
    requestAnimationFrame(() => {
      if (!finderRef.current) return;
      const rect = finderRef.current.getBoundingClientRect();
      const y = rect.top + window.scrollY - window.innerHeight * 0.15; // 15% viewport offset
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  }, []);

    const [openAllOptions, setOpenAllOptions] = useState({});

    // which view to show inside the selected card

  // which class row is expanded in the "All Options" overlay table
  const [openRowClass, setOpenRowClass] = useState(null);
  // which class is open inside "All Options" (full-width detail)

  const firstDetailByClass = useMemo(() => {
    const m = new Map();
    normalizedDetails.forEach(d => { if (!m.has(d.className)) m.set(d.className, d); });
    return m;
  }, [normalizedDetails]);


  // normalize schedule text from a class detail row
  const getScheduleText = (entry) => {
    if (!entry) return "—";
    if (Array.isArray(entry.schedules) && entry.schedules.length) return entry.schedules.join(", ");
    if (Array.isArray(entry.sections) && entry.sections.length) return entry.sections.join(", ");
    if (entry.schedule && String(entry.schedule).trim()) return entry.schedule;
    if (entry.time && String(entry.time).trim()) return entry.time;
    if (entry.days && String(entry.days).trim()) return entry.days;
    return "—";
  };
  // Break schedule into lines for the Easiest table
  function getScheduleLines(entry) {
    if (!entry) return [];
    if (Array.isArray(entry.schedules) && entry.schedules.length) return entry.schedules;
    if (Array.isArray(entry.schedule) && entry.schedule.length) return entry.schedule;
    if (Array.isArray(entry.sections) && entry.sections.length) return entry.sections;

    const raw = entry.schedule || entry.time || entry.days || "";
    if (!raw) return [];

    const parts = String(raw)
      .split(/\s*(?:\n|,|;|•|\/|\|)\s*/)
      .filter(Boolean);

    return parts.length ? parts : [String(raw)];
  }

  useEffect(() => {
    if (selectedArea && selectedPanelRef.current) {
      selectedPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedArea]);
    const isMobile = window.innerWidth <= 700;
    // tighter padding for compact numeric columns
  // Helper: is this class already in the cart?
  // Force mobile to show the Easiest overlay whenever an area is selected
  // Mobile: default to Easiest when an area is chosen, and make sure any View All
  // class selection is cleared so the Easiest overlay doesn't disappear.
useEffect(() => {
  if (typeof window === "undefined") return;
  const mobile = window.innerWidth <= 700;
  if (!mobile || !selectedArea) return;

  // Only scroll to finder when area first becomes selected, not on every state change
  requestAnimationFrame(() => {
    document
      .querySelector('[aria-label="Course Finder"]')
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}, [selectedArea]); // ← Remove overlayMode and selectedAllClass from dependencies
  useEffect(() => {
    if (typeof window !== "undefined") {
    window.__GEDEBUG__ = {
      canon,
      areaCanon,
      courseKey,
      geRequirements,
      normalizedDetails,
      areaToCanonSet,
      classToAreas,
      canonToExactName,
      titleCanonToKeys,
      selectedArea,
      easiestResults,

      // NEW: list exact class labels allowed for a GE area
      classesFor(area) {
        const key = areaCanon(area);
        const set = this.areaToCanonSet.get(key) || new Set();
        return [...set].map(k => this.canonToExactName.get(k) || k);
      },

      // NEW: which GE areas a class can satisfy
      areasForClass(name) {
        const k = courseKey(name);
        const base = k.replace(TRAIL_SUFFIX_RE, " $1");
        return (
          this.classToAreas[k] ||
          this.classToAreas[base] ||
          this.classToAreas[name] ||
          []
        );
      },

      // optional: see the raw tokens configured on that area
      rawAreaTokens(area) {
        const key = areaCanon(area);
        const rec = this.geRequirements.find(a => areaCanon(a.area) === key);
        if (!rec) return [];
        const raw = Array.isArray(rec.classes) ? rec.classes : [];
        return raw.flatMap(s => String(s || "").split(/\s*(?:\/|,|;|\bor\b)\s*/i)).filter(Boolean);
      },

      snapshot() {
        const area = areaCanon(this.selectedArea);
        const setSize = this.areaToCanonSet.get(area)?.size ?? 0;
        const easyRows = this.easiestResults?.[area]?.length ?? 0;
        return { area, setSize, easyRows };
      },
      dump() { console.table(this.snapshot()); }
    };
  }

  }, [selectedArea, easiestResults, geRequirements, normalizedDetails, areaToCanonSet, classToAreas, canonToExactName, titleCanonToKeys]);
    
      console.log("GE debug ready: __GEDEBUG__", window.__GEDEBUG__);
    

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dropLetterSafe = k => k.replace(TRAIL_SUFFIX_RE, " $1");
    const buildAllowedAll = () => {
      const s = new Set();
      for (const set of areaToCanonSet.values()) {
        set.forEach(k => { s.add(k); s.add(dropLetterSafe(k)); });
      }
      return s;
    };

    function audit() {
      const allowedAll = buildAllowedAll();
      const knownKeys = new Set();
      for (const r of normalizedDetails) {
        const k = courseKey(r.className);
        knownKeys.add(k);
        knownKeys.add(dropLetterSafe(k));
      }

      // 1) Class detail rows that never match any GE area
      const orphans = normalizedDetails
        .filter(r => {
          const k = courseKey(r.className);
          const base = dropLetterSafe(k);
          return !allowedAll.has(k) && !allowedAll.has(base);
        })
        .map(r => ({ className: r.className, professor: r.professor || null, codeKey: courseKey(r.className) }));

      // 2) GE areas that point to keys you don’t actually have data for
      const missingByArea = [];
      for (const [area, set] of areaToCanonSet.entries()) {
        const missing = [...set].filter(k => !knownKeys.has(k) && !knownKeys.has(dropLetterSafe(k)));
        if (missing.length) missingByArea.push({ area, missing });
      }

      // 3) Unmatched tokens from the raw GE config (titles or codes that never resolved)
      const unmatchedTokens = [];
      geRequirements.forEach(a => {
        const toks = getClassTokens(a).flatMap(splitAlternatives);
        const misses = [];
        for (const t of toks) {
          const any = findCourseInText(t);
          if (any) {
            const k = courseKey(any);
            if (!knownKeys.has(k) && !knownKeys.has(dropLetterSafe(k))) misses.push(t);
            continue;
          }
          const tc = titleCanon(t);
          const fromTitle = titleCanonToKeys.get(tc);
          if (!fromTitle || fromTitle.size === 0) misses.push(t);
        }
        if (misses.length) unmatchedTokens.push({ area: a.area, tokens: misses });
      });

      // 4) Duplicate rows by base-course + professor
      const byKeyProf = new Map();
      normalizedDetails.forEach(r => {
        const key = `${dropLetterSafe(courseKey(r.className))}::${r.professor || "—"}`;
        byKeyProf.set(key, (byKeyProf.get(key) || 0) + 1);
      });
      const dupsByKeyProf = [...byKeyProf.entries()]
        .filter(([, count]) => count > 1)
        .map(([key, count]) => ({ key, count }));

      return {
        counts: {
          totalDetails: normalizedDetails.length,
          totalAreas: geRequirements.length,
          allowedKeys: [...areaToCanonSet.values()].reduce((n, s) => n + s.size, 0),
          orphans: orphans.length,
          areasWithMissing: missingByArea.length,
          unmatchedTokenAreas: unmatchedTokens.length,
          duplicateKeyProf: dupsByKeyProf.length,
        },
        orphans,            // class rows not used
        missingByArea,      // GE keys with no backing data
        unmatchedTokens,    // raw config tokens that never mapped
        dupsByKeyProf,      // duplicate base+prof entries
      };
    }

    window.__GEDEBUG__ = { ...(window.__GEDEBUG__ || {}), audit };
    console.log("[GE] Added __GEDEBUG__.audit(). Try:", "__GEDEBUG__.audit()");
  }, [normalizedDetails, geRequirements, areaToCanonSet, titleCanonToKeys]);


  // schedule → array of lines
  const getSchedLines = (row) => {
    if (Array.isArray(row.schedule)) return row.schedule;
    if (Array.isArray(row.schedules)) return row.schedules;
    if (Array.isArray(row.sections)) return row.sections;
    if (typeof row.schedule === "string" && row.schedule.trim()) return [row.schedule];
    return [];
  };

  const areaRefs = useRef({});
  geRequirements.forEach(req => {
    if (!areaRefs.current[req.area]) {
      areaRefs.current[req.area] = React.createRef();
    }
  });

  const scrollToArea = (area) => {
    const ref = areaRefs.current[area];
    if (ref && ref.current) {
      const element = ref.current;
      const yOffset = window.innerHeight * 0.2; // 17% vertical offset
      const y = element.getBoundingClientRect().top + window.pageYOffset - yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      setOpenAreas(prev => {
        if (prev.has(area)) return prev;
        const newSet = new Set(prev);
        newSet.add(area);
        return newSet;
      });
    }
  };
    const thMobile = {
      textAlign: "left",
      padding: isMobile ? "8px 8px" : "10px",
      borderBottom: "1px solid #ccc",
      backgroundColor: "transparent",
      fontSize: isMobile ? "0.76rem" : "0.95rem",
      borderRight: "1px solid #ccc",
    };

    const tdMobile = {
      padding: isMobile ? "6px 8px" : "10px",
      borderBottom: "1px solid #eee",
      fontSize: isMobile ? "0.76rem" : "0.95rem",
      color: "#222",
    };

    // Save university to cookie on mount/change
    useEffect(() => {
      if (university) {
        Cookies.set("recentUniversity", university, {
          expires: 7,
          secure: true,
          sameSite: "strict"
        });
      }
    }, [university]);

  // GETracker easiest finder (desktop cards)
  // GETracker easiest finder (desktop + mobile)
  const findEasiestClasses = useCallback((area) => {
    const areaKey = areaCanon(area);          // canonical key
    const rawKey = area;                      // raw label (e.g., "A1 Oral Communication")

    // mark loading for BOTH keys so any lookup pattern sees it
    setEasiestLoading((prev) => ({
      ...prev,
      [areaKey]: true,
      [rawKey]: true,
    }));

    // Primary allowed set
    let allowed = areaToCanonSet.get(areaKey);

    // Fallback: if empty, build from tokens via getClassTokens
    if (!allowed || !allowed.size) {
      const areaObj = geRequirements.find((a) => areaCanon(a.area) === areaKey);
      const toks = getClassTokens(areaObj || {}).flatMap(splitAlternatives);
      allowed = new Set(toks.map(courseKey));
    }

    const dropLetter = (k) => k.replace(TRAIL_SUFFIX_RE, " $1");
    const allowedWide = new Set([
      ...allowed,
      ...[...allowed].map(dropLetter),
    ]);

    let rows = normalizedDetails.filter((d) => {
      const k = courseKey(d.className);
      return allowedWide.has(k) || allowedWide.has(dropLetter(k));
    });

    // no matches → save empty under BOTH keys
    if (!rows.length) {
      setEasiestResults((p) => ({
        ...p,
        [areaKey]: [],
        [rawKey]: [],
      }));
      setEasiestLoading((p) => ({
        ...p,
        [areaKey]: false,
        [rawKey]: false,
      }));
      return;
    }

    // scoring & sorting
    rows = rows.map((r) => {
      const hasDiff = Number.isFinite(r.difficulty);
      return {
        ...r,
        __hasDiff: hasDiff,
        __diffVal: hasDiff ? r.difficulty : 10,
        __scoreVal: Number.isFinite(r.rmpScore) ? r.rmpScore : null,
        rmpLink: r.rmpLink ?? r.link ?? null,
      };
    });

    rows.sort((a, b) => {
      if (a.__hasDiff !== b.__hasDiff) return a.__hasDiff ? -1 : 1;
      if (a.__diffVal !== b.__diffVal) return a.__diffVal - b.__diffVal;
      if (a.__scoreVal != null && b.__scoreVal != null)
        return b.__scoreVal - a.__scoreVal;
      return String(a.className).localeCompare(String(b.className));
    });

    const top = rows.slice(0, 5).map((c) => ({
      ...c,
      rmpScore: Number.isFinite(c.rmpScore) ? c.rmpScore : c.__scoreVal,
    }));

    // ✅ write results for BOTH keys so:
    // - easiestResults[areaCanon(selectedArea)]
    // - easiestResults[selectedArea]
    // both work no matter where they’re read
    setEasiestResults((p) => ({
      ...p,
      [areaKey]: top,
      [rawKey]: top,
    }));

    setEasiestLoading((p) => ({
      ...p,
      [areaKey]: false,
      [rawKey]: false,
    }));
  }, [normalizedDetails, areaToCanonSet, geRequirements]);

  useEffect(() => {
    if (!selectedArea || overlayMode !== "easiest") return;
    const key = areaCanon(selectedArea);
    if (easiestResults[key]?.length) return;
    findEasiestClasses(selectedArea);
  }, [selectedArea, overlayMode, easiestResults, findEasiestClasses]);

    const toggleEasiestClasses = (area, event) => {
      if (event) event.stopPropagation();
      if (easiestResults[area] && easiestResults[area].length > 0) {
        setEasiestResults((prev) => ({ ...prev, [area]: [] }));
      } else {
        findEasiestClasses(area);
      }
    };

    const getClassKey = (area, className) => `${area}::${className}`;

  const classesWithProfessors = React.useMemo(
    () => new Set(classDetails.map(d => courseKey(d.className))),
    [classDetails]
  );

    // Map classes to their GE areas for quick lookup
  // Map classes to their GE areas for quick lookup




    const c1c2Count = classesTaken.filter(
      (obj) => obj.area === "C1 Arts" || obj.area === "C2 Humanities"
    ).length;

  const handleAreaCardClick = (area) => {
    setSelectedArea(area);
  if (!isMobile) setOverlayMode("easiest");
    if (area === "A1 Oral Communication") {
      setA1TextVisible(false);
    }
      setOpenAreas((prev) => {
        const newSet = new Set(prev);
        newSet.has(area) ? newSet.delete(area) : newSet.add(area);
        return newSet;
      });
    };

    const handleClassClick = (area, className, event) => {
      if (event) event.stopPropagation();
      const key = getClassKey(area, className);
      setOpenMenus((prev) => {
        const newSet = new Set(prev);
        newSet.has(key) ? newSet.delete(key) : newSet.add(key);
        return newSet;
      });
    };

    // Sanity error handling for missing data
    if (!Array.isArray(geRequirements) || geRequirements.length === 0) {
      return <div style={{ color: "red" }}>GE Requirements data missing or not loaded.</div>;
    }

    if (!Array.isArray(classDetails)) {
      return <div style={{ color: "red" }}>Class details missing or not loaded.</div>;
    }

    if (!Array.isArray(classesTaken)) {
      return <div style={{ color: "red" }}>Classes taken data missing or not loaded.</div>;
    }

    // --- Render ---  
    return (
        <div className="ge-container">
          {/* Title/Header */}
        <h1
    className="ge-title"
    style={{ marginTop: isMobile ? "64px" : "96px" }}  // +32px on desktop
  >
    Chico State University
  </h1>


    <section
      style={{
        backgroundColor: "#fff",
        padding: "24px 32px",
        borderRadius: 20,
        boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
        width: isMobile ? "92vw" : 1200,
        margin: "32px auto 0 auto", 
        marginBottom: "32px", 
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        boxSizing: "border-box",
      }}
      aria-label="Graduation progress and checklist container"
    >
      {/* Graduation Progress */}
      <ProgressSummary
        geRequirements={geRequirements}
        classesTaken={classesTaken}
        classToAreas={classToAreas}
        c1c2Fulfilled={c1c2Fulfilled}
      />
    
      {/* Checklist Toggle + Content on Mobile */}
  {/* MOBILE: Checklist button + modal */}
  {/* Checklist Toggle + Content on Mobile */}
  {/* MOBILE: Checklist button + modal */}
  {isMobile && (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          style={{
            backgroundColor: brandBlue,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: "pointer",
            width: "100%",
            userSelect: "none",
            boxShadow: "0 3px 8px rgba(58, 96, 255, 0.6)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a44cc")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brandBlue)}
          onClick={() => setChecklistOpen((v) => !v)}
          type="button"
          aria-expanded={checklistOpen}
          aria-controls="ge-checklist-content"
        >
          {checklistOpen ? "Hide Checklist" : "View Checklist"}
        </button>
      </div>

<ChecklistModal open={checklistOpen} onClose={() => setChecklistOpen(false)}>
  <ChecklistToggleContent
    geRequirements={geRequirements}
    classesTaken={classesTaken}
    classToAreas={classToAreas}
    c1c2Fulfilled={c1c2Fulfilled}
    scrollToArea={(a) => {
      // a = requirement label like "A1 Oral Communication"
      setMobileArea(a);          // keep your current behavior
      setSelectedArea(a);        // 🔑 sets the filter / overlay area
      setOverlayMode("easiest"); // show Easiest tab by default on mobile
      setSelectedAllClass(null); // make sure no class subview is open
      setChecklistOpen(false);   // close the checklist modal
      scrollToFinder();          // scroll down to the finder + overlay
    }}
  />
</ChecklistModal>

    </>
  )}

  {/* DESKTOP: checklist always visible */}
  {!isMobile && (
    <ChecklistToggleContent
      geRequirements={geRequirements}
      classesTaken={classesTaken}
      classToAreas={classToAreas}
      c1c2Fulfilled={c1c2Fulfilled}
      scrollToArea={scrollToArea}
    />
  )}
  </section>
  {isMobile && (
    <div
      ref={finderRef}
      style={{
        margin: "16px auto 24px",
        width: "92vw",
        maxWidth: 1200,
        position: "relative",
      }}
    >
      {/* 🔹 Always show the main mobile finder (search, classes taken, filters) */}
      <SJSUMobileFinder
        geRequirements={geRequirements}
        classDetails={normalizedDetails}
        classesTaken={classesTaken}
   onAddClass={(cls) => {
  const area = chooseAreaForClass(cls);
  addClass({ id: cls, title: cls, area });
}}
        onDeleteClass={removeByName}
        search={search}
        setSearch={setSearch}
        classToAreas={classToAreas}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        canonToExactName={canonToExactName}
        areaToCanonSet={areaToCanonSet}
        scheduleByClass={scheduleByClass}
        onJumpToEasiest={jumpToMobileEasiest}
        isTaken={isTaken}
        hideResults={true}
      />

  {/* 🔹 Mobile: shared overlay for Easiest + View All (same space, tabbed) */}
  {selectedArea && (overlayMode === "easiest" || overlayMode === "all") && (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        marginTop: 12,
        background: "#fff",
        border: `2px solid ${brandBlue}`,
        borderRadius: 16,
        boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
        padding: 12,
        zIndex: 1,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
      }}
    >
      {/* Header with tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0, fontSize: "0.95rem" }}>
          {selectedArea}{" "}
          {overlayMode === "easiest" ? "— Easiest Classes" : "— All Classes"}
        </h3>

        <div style={{ display: "flex", gap: 6 }}>
          {/* Easiest tab */} 
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOverlayMode("easiest");
              findEasiestClasses(selectedArea);
            }}
            style={{
              backgroundColor:
                overlayMode === "easiest" ? brandBlue : "transparent",
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              color: overlayMode === "easiest" ? "#fff" : brandBlue,
              padding: "6px 10px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Easiest
          </button>

          {/* View All tab */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOverlayMode("all");
            }}
            style={{
              backgroundColor:
                overlayMode === "all" ? brandBlue : "transparent",
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              color: overlayMode === "all" ? "#fff" : brandBlue,
              padding: "6px 10px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            View All
          </button>

       
        </div>
      </div>

      {/* Body: either Easiest table or View All list, sharing the same space */}
   <div
        style={{
          overflowX: "scroll",
          overflowY: "auto",
          maxHeight: "100%",
          paddingRight: 6,
          WebkitOverflowScrolling: "touch",
          width: "100%",
        }}
      >
        {overlayMode === "easiest" ? (
          /* ===== Mobile Easiest table (your existing logic, just moved here) ===== */
       <table
  style={{
    ...grid.table,
    borderColor: "#e0e5ff",
    minWidth: 900,
    background: "#fff",
    fontSize: "0.8rem",
  }}
>
  <colgroup>
    <col style={{ width: "24%" }} />
    <col style={{ width: "28%" }} />
    <col style={{ width: "10%" }} />
    <col style={{ width: "10%" }} />
    <col style={{ width: "28%" }} />
    <col style={{ width: "14%" }} />
  </colgroup>
  <thead>
    <tr>
      <th style={thMobile}>Professor</th>
      <th style={thMobile}>Class</th>
      <th style={{ ...thMobile, textAlign: "center" }}>RMP</th>
      <th style={{ ...thMobile, textAlign: "center" }}>Diff</th>
      <th style={thMobile}>Schedule</th>
      <th style={{ ...thMobile, textAlign: "right" }}>Action</th>
    </tr>
  </thead>
  <tbody>
    {(easiestResults[areaCanon(selectedArea)] || []).map((row) => {
      const rmpLink =
        row.rmpLink ??
        (row.link && row.link !== "N/A" ? row.link : null);

      const rmpScoreRaw =
        row.rmpScore ??
        row.score ??
        row.rating ??
        row.rmp ??
        row.RMPScore ??
        row.RMP ??
        null;

      const rmpScore =
        typeof rmpScoreRaw === "number"
          ? rmpScoreRaw.toFixed(1)
          : rmpScoreRaw || "—";

      const scheduleLines = getScheduleLines(row) || [];

      return (
        <tr
          key={`${row.className}-${row.professor || "NA"}`}
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Professor */}
          <td style={tdMobile}>
            {rmpLink ? (
              <a
                href={rmpLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                {row.professor || "—"}
              </a>
            ) : (
              <span style={{ fontWeight: 700 }}>
                {row.professor || "—"}
              </span>
            )}
          </td>

          {/* Class */}
          <td style={tdMobile}>
            <span
              style={{
                display: "inline-block",
                fontWeight: 600,
                color: "#222",
              }}
            >
              {row.className}
            </span>
          </td>

          {/* RMP */}
          <td
            style={{
              ...tdMobile,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {rmpScore}
          </td>

          {/* Diff */}
          <td
            style={{
              ...tdMobile,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {typeof row.difficulty === "number"
              ? row.difficulty
              : "—"}
          </td>

          {/* Schedule */}
          <td
            style={{
              ...tdMobile,
              fontSize: "0.75rem",
              color: "#555",
              lineHeight: 1.25,
              verticalAlign: "top",
              whiteSpace: "normal",
              wordBreak: "word-break",
            }}
          >
            {scheduleLines.length ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {scheduleLines.map((ln, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {ln}
                  </span>
                ))}
              </div>
            ) : (
              "TBA"
            )}
          </td>

          {/* Action */}
          <td
            style={{
              ...tdMobile,
              textAlign: "right",
              whiteSpace: "nowrap",
            }}
          >
            {isTaken(row.className) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeByName(row.className);
                }}
                type="button"
                style={{
                  background: "#d32f2f",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "5px 8px",
                  fontWeight: 700,
                  fontSize: ".7rem",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addClass({
                    id: row.className,
                    title: row.className,
                    area: selectedArea,
                  });
                }}
                type="button"
                style={{
                  background: "#20a7ef",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "5px 8px",
                  fontWeight: 700,
                  fontSize: ".7rem",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            )}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

    ) : (
  /* ===== Mobile View All list, same space as Easiest ===== */
  (() => {
    const areaObj =
      geRequirements.find(
        (a) => areaCanon(a.area) === areaCanon(selectedArea)
      ) || { area: selectedArea };
          

      // 🔹 If a class is selected, show its professor menu instead of the class list
      if (selectedAllClass) {
        const rows = profRowsFor(selectedAllClass);

        if (!rows.length) {
          return (
            <div style={{ padding: 12, color: "#777" }}>
              No professor data yet for {selectedAllClass}.
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedAllClass(null)}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${brandBlue}`,
                    padding: "6px 10px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background: "transparent",
                    color: brandBlue,
                    cursor: "pointer",
                  }}
                >
                  Back to class list
                </button>
              </div>
            </div>
          );
        }

        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <strong style={{ fontSize: "0.9rem" }}>
                {selectedAllClass} — Professors
              </strong>
              <button
                type="button"
                onClick={() => setSelectedAllClass(null)}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${brandBlue}`,
                  padding: "6px 10px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: "transparent",
                  color: brandBlue,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            </div>

         <table
  style={{
    width: "100%",
    minWidth: 720,  // ← ADD THIS LINE
    tableLayout: "fixed",
    borderCollapse: "collapse",
    border: "1px solid #e0e5ff",
    borderRadius: 12,
    overflow: "hidden",
    fontSize: "0.8rem",
  }}
><colgroup>
  <col style={{ width: "28%" }} />
  <col style={{ width: "12%" }} />
  <col style={{ width: "12%" }} />
  <col style={{ width: "30%" }} />
  <col style={{ width: "18%" }} />
</colgroup>
              <thead>
  <tr>
    <th style={thMobile}>Professor</th>
    <th style={{ ...thMobile, textAlign: "center" }}>RMP</th>
    <th style={{ ...thMobile, textAlign: "center" }}>Diff</th>
    <th style={thMobile}>Schedule</th>
    <th style={{ ...thMobile, textAlign: "right" }}>Action</th>
  </tr>
</thead>
              <tbody>
                {rows.map((row, idx) => {
                  const scheduleLines = getScheduleLines(row);
                  const rmp =
                    typeof row.rmpScore === "number"
                      ? row.rmpScore.toFixed(1)
                      : row.rmpScore || "—";
                  const diff =
                    typeof row.difficulty === "number"
                      ? row.difficulty
                      : "—";
                  const rmpLink =
                    row.rmpLink ??
                    (row.link && row.link !== "N/A" ? row.link : null);

                  return (
                    <tr
                      key={`${row.className}-${row.professor || "NA"}-${idx}`}
                    >
                      <td style={tdMobile}>
                        {rmpLink ? (
                          <a
                            href={rmpLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontWeight: 700,
                              textDecoration: "underline",
                            }}
                          >
                            {row.professor || "—"}
                          </a>
                        ) : (
                          <span style={{ fontWeight: 700 }}>
                            {row.professor || "—"}
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          ...tdMobile,
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rmp}
                      </td>
                      <td
                        style={{
                          ...tdMobile,
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {diff}
                      </td>
                     {/* Schedule */}
                      <td
                        style={{
                          ...tdMobile,
                          fontSize: "0.7rem",
                          color: "#555",
                          lineHeight: 1.3,
                          verticalAlign: "top",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {scheduleLines.length ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            {scheduleLines.map((ln, i) => (
                              <div key={i} style={{ display: "block" }}>
                                {ln}
                              </div>
                            ))}
                          </div>
                        ) : (
                          "TBA"
                        )}
                      </td>

                      {/* Action */}
                      <td
                        style={{
                          ...tdMobile,
                          textAlign: "right",
                        }}
                      >
                        {isTaken(row.className) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeByName(row.className);
                            }}
                            type="button"
                            style={{
                              background: "#d32f2f",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "5px 8px",
                              fontWeight: 700,
                              fontSize: ".7rem",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addClass({
                                id: row.className,
                                title: row.className,
                                area: areaObj.area,
                              });
                            }}
                            type="button"
                            style={{
                              background: "#20a7ef",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "5px 8px",
                              fontWeight: 700,
                              fontSize: ".7rem",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      // 🔹 Otherwise: normal class list
      const keySet =
        areaToCanonSet.get(areaCanon(areaObj.area)) || new Set();
      let filteredClasses = [...keySet].map(
        (k) => canonToExactName.get(k) || k
      );

      if (!filteredClasses.length) {
        const toks = getClassTokens(areaObj).flatMap(splitAlternatives);
        const dedup = new Set(toks.map(courseKey));
        filteredClasses = [...dedup].map(
          (k) => canonToExactName.get(k) || k
        );
      }

      if (!filteredClasses.length) {
        return (
          <div
            style={{
              padding: 12,
              color: "#777",
              textAlign: "center",
            }}
          >
            No available classes for this area.
          </div>
        );
      }

      return (
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            border: "1px solid #e0e5ff",
            borderRadius: 12,
            overflow: "hidden",
            fontSize: "0.8rem",
          }}
        >
          <colgroup>
            <col style={{ width: "75%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr>
              <th
                style={{
                  padding: "8px 10px",
                  textAlign: "left",
                  fontWeight: 700,
                  borderBottom: "1px solid #e0e5ff",
                  borderRight: "1px solid #e0e5ff",
                  background: "#fafbff",
                  whiteSpace: "nowrap",
                }}
              >
                Class
              </th>
              <th
                style={{
                  padding: "8px 10px",
                  textAlign: "right",
                  fontWeight: 700,
                  borderBottom: "1px solid #e0e5ff",
                  background: "#fafbff",
                  whiteSpace: "nowrap",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((cls) => (
              <tr
                key={`${areaObj.area}::${cls}`}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedArea(areaObj.area);   // keep this area
                  setOverlayMode("all");           // stay on View All
                  setSelectedAllClass(cls);        // 🔑 open professor menu
                }}
              >
                <td
                  title={cls}
                  style={{
                    padding: "8px 10px",
                    borderTop: "1px solid #e0e5ff",
                    borderRight: "1px solid #e0e5ff",
                    fontWeight: 700,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {cls}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    borderTop: "1px solid #e0e5ff",
                    textAlign: "right",
                  }}
                >
                  {isTaken(cls) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeByName(cls);
                      }}
                      type="button"
                      style={{
                        background: "#d32f2f",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addClass({
                          id: cls,
                          title: cls,
                          area: areaObj.area,
                        });
                      }}
                      type="button"
                      style={{
                        background: "#20a7ef",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    })()
  )}

        </div>
      </div>
    )}

      </div>
    )}



    
    {/* Search Bar white card container */}
    {!isMobile && (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px 24px",
        borderRadius: 20,
        boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
        marginBottom: 36,
        marginTop: 32,
        width: isMobile ? "92vw" : 1200,
        maxWidth: "92vw",
        marginLeft: "auto",
        marginRight: "auto", // ✅ Centers the container
        position: "relative",
        userSelect: "none",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center", // ✅ Centers child input
        margin: isMobile ? "0 auto 32px auto" : "32px auto 0 auto", // ✅ adds bottom margin on mobile
      }}
    >
    
    <input
    ref={searchInputRef}
      type="text"
      placeholder="Search for a class you have already taken, or plan to take."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      aria-label="Search for classes"
      style={{
        width: isMobile ? "88vw" : 1150,
        maxWidth: "100%",
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
        left: isMobile ? 32 : 35, // moved 10px right on both views
          top: "50%",
          transform: "translateY(-50%)",
          color: "#999",
          pointerEvents: "none",
          fontSize: isMobile ? 18 : 20,
          userSelect: "none",
        }}
        aria-hidden="true"
      />
    
    
    </div>
      )}
       {/* Desktop search results under the bar (with Add/Delete) */}
  {!isMobile && search.trim() && searchResults.length > 0 && (
    <div
      style={{
        width: 1200,
        maxWidth: "92vw",
        margin: "0 auto 24px auto",
        backgroundColor: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(58, 96, 255, 0.12)",
        padding: "12px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          marginBottom: 8,
        }}
      >
        Search results
      </div>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          maxHeight: 260,
          overflowY: "auto",
        }}
      >
        {searchResults.map((r) => {
          const taken = isTaken(r.className);
          return (
            <li
              key={r.className}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 4px",
                borderBottom: "1px solid #eee",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <strong>{r.className}</strong>
                {r.areas && (
                  <span style={{ color: "#555", marginLeft: 8 }}>
                    ({r.areas})
                  </span>
                )}
              </div>

            <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    if (taken) {
      // remove from Classes Taken
      removeByName(r.className);
    } else {
      // choose the best GE area and add
      const area = chooseAreaForClass(r.className);
      addClass({
        id: r.className,
        title: r.className,
        area,
      });
    }

    // 🔑 close dropdown after action
    setSearch("");
    // optional, if you also want to remove focus:
    // if (searchInputRef.current) searchInputRef.current.blur();
  }}
  style={{
    backgroundColor: taken ? "#d32f2f" : "#20a7ef",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  {taken ? "Delete" : "Add"}
</button>

            </li>
          );
        })}
      </ul>
    </div>
  )}
      {/* Mobile main column container */}
          <div
            className="mobile-main-column"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            
  {!isMobile && (          
    <div
      style={{
        width: isMobile ? "92vw" : 1200,
        margin: "32px auto 0",
        userSelect: "text",
        textAlign: "left",
        backgroundColor: "#fff",
        padding: "20px 24px",
        borderRadius: 20,
        boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
        boxSizing: "border-box",
        margin: isMobile ? "0 auto 32px auto" : "32px auto 0", // ✅ bottom spacing for mobile
      }}
    >
    
      {/* Your existing Classes Taken JSX here */}
      <h2 className="ge-section-title">Classes Taken</h2>
    
      <ul
        className="ge-classes-taken-list"
        style={{
          textAlign: "left",
          padding: 0,
          margin: 0,
          listStyle: "none",
          color: "#222",
          fontSize: "1rem",
          lineHeight: 1.4,
          userSelect: "text",
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
                userSelect: "text",
              }}
            >
              <div>
                <strong>{obj.className}</strong>{" "}
                <span style={{ color: "#555" }}>({obj.area})</span>
              </div>
          <button
    onClick={(e) => {
      e.stopPropagation();
      removeClass(obj.id || obj.className);
    }}
    style={{
      backgroundColor: "#d32f2f",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      padding: "6px 14px",
      cursor: "pointer",
      fontWeight: 600,
      transition: "background-color 0.3s ease",
      userSelect: "none",
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
    
      {areaCWarning && (
        <div
          className="ge-area-warning"
          style={{
            marginTop: 16,
            fontWeight: 700,
            color: "#b00000",
            backgroundColor: "#ffefef",
            border: "1px solid #d32f2f",
            padding: "12px 16px",
            borderRadius: 12,
            userSelect: "none",
          }}
        >
          {areaCWarning}
        </div>
      )}
    </div>
          )}
    
    
  {/* 5. Card Grid for Areas */}
  {!isMobile && (
  <div
    className="ge-card-grid mobile-order-5"
    style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: isMobile ? 24 : 48,
      width: "100%",
      maxWidth: 1280,
      margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
      justifyItems: isMobile ? "center" : "stretch",
      paddingBottom: isMobile ? 0 : 32, // ← adds 32px below last card on desktop
    }}
  >

    {geRequirements.map((areaObj) => {
      // used only to compute the card border “fulfilled” state
  const classesForArea = classesTaken.filter(obj => {
    const areas =
      areasFor(obj.className) ||
      areasFor(obj.className.split(" - ")[0]);
    return areas.includes(areaObj.area);
  });

  const requiredCount = areaObj.requiredCount || 1;
  const isFulfilled = classesForArea.length >= requiredCount;

  const keySet = areaToCanonSet.get(areaCanon(areaObj.area)) || new Set();

  let filteredClasses = [...keySet].map(k => canonToExactName.get(k) || k);

  // Fallback: if mapping set is empty, read tokens via getClassTokens
  if (!filteredClasses.length) {
    const toks = getClassTokens(areaObj).flatMap(splitAlternatives);
    const dedup = new Set(toks.map(courseKey));
    filteredClasses = [...dedup].map(k => canonToExactName.get(k) || k);
  }



  const isSelected = areaCanon(selectedArea) === areaCanon(areaObj.area);

      const hoverGrow = (e) => { e.currentTarget.style.transform = "scale(1.03)"; };
      const hoverReset = (e) => { e.currentTarget.style.transform = "scale(1)"; };

      return (
      <div
    key={areaObj.area}
    ref={areaRefs.current[areaObj.area]}
    className="ge-card"
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        setSelectedAllClass(null);
        setSelectedArea(areaObj.area);   // ⬅ use raw label
        setOverlayMode("all");           // open View All overlay
      }
    }}
    onClick={() => {
      setSelectedAllClass(null);
      setSelectedArea(areaObj.area);     // ⬅ use raw label
      setOverlayMode("all");             // open View All overlay
    }}


          style={{
            backgroundColor: isSelected ? "#F5F8FF" : "#fff",
            minHeight: 230,
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 6px 18px rgba(58, 96, 255, 0.15)",
            cursor: "pointer",
            position: "relative",
            color: "#1a1a1a",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textAlign: "center",
            userSelect: "none",
            border: isFulfilled ? `2.5px solid ${brandBlue}` : "2.5px solid #ccc",
            transition: "border-color 0.3s ease, background-color 0.2s ease",
            outline: isSelected ? `3px solid ${brandBlue}` : "none",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <span
              className="area-title-text"
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                display: "block",
                userSelect: "none",
                marginBottom: 6,
                color: isFulfilled ? brandBlue : "#333",
              }}
            >
              {areaObj.area}
            </span>
          </div>

          <div
            className="card-actions-row"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {/* Easiest -> overlay table */}
            <button
    onClick={(e) => {
    e.stopPropagation();
    setSelectedAllClass(null); // <-- key fix
    setSelectedArea(areaObj.area);
    setOverlayMode("easiest");
    findEasiestClasses(areaObj.area);
  }}

              type="button"
              onMouseEnter={hoverGrow}
              onMouseLeave={hoverReset}
              style={{
                backgroundColor: brandBlue,
                border: "none",
                borderRadius: 16,
                color: "#fff",
                padding: "10px 26px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(58, 96, 255, 0.5)",
                userSelect: "none",
                minWidth: 140,
                transition: "transform 0.15s ease",
              }}
            >
              Find Easiest Classes
            </button>

    {/* View All -> open desktop modal */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setSelectedArea(areaObj.area);   // select this card
      setOverlayMode("all");           // show View All inside the card
      setSelectedAllClass(null);       // no professor subview yet
    }}
    type="button"
    onMouseEnter={hoverGrow}
    onMouseLeave={hoverReset}
    style={{
      backgroundColor: "transparent",
      border: `2px solid ${brandBlue}`,
      borderRadius: 16,
      color: brandBlue,
      padding: "10px 26px",
      fontWeight: 700,
      cursor: "pointer",
      userSelect: "none",
      minWidth: 140,
      transition: "transform 0.15s ease",
    }}
  >
    View All Options
  </button>


          </div>
  {/* ======== VIEW ALL (overlay table like "Easiest") ======== */}
  {/* ======== VIEW ALL (overlay table — no schedule) ======== */}
  {/* ======== VIEW ALL (overlay table — darker grid, bolder class) ======== */}
  {isSelected && !isMobile && !selectedAllClass && (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        inset: 12,
        background: "#fff",
        border: `2px solid ${brandBlue}`,
        borderRadius: 16,
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
        padding: 16,
        zIndex: 1,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 12,
        overflow: "hidden",
      }}
    >
      {/* Header with tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>
          {areaObj.area}{" "}
          {overlayMode === "all" ? "— All Classes" : "— Easiest Classes"}
        </h3>

        <div style={{ display: "flex", gap: 8 }}>
          {/* Easiest tab */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOverlayMode("easiest");
              findEasiestClasses(areaObj.area);
            }}
            style={{
              backgroundColor:
                overlayMode === "easiest" ? brandBlue : "transparent",
              color: overlayMode === "easiest" ? "#fff" : brandBlue,
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              padding: "6px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Easiest
          </button>

          {/* View All tab */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOverlayMode("all");
            }}
            style={{
              backgroundColor:
                overlayMode === "all" ? brandBlue : "transparent",
              color: overlayMode === "all" ? "#fff" : brandBlue,
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              padding: "6px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View All
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedArea(null);
              setSelectedAllClass(null);
              setOverlayMode("easiest");
            }}
            style={{
              backgroundColor: "transparent",
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              color: brandBlue,
              padding: "6px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Body: Easiest or View All */}
      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: 420,
          paddingRight: 6,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {overlayMode === "easiest" ? (
          /* ===== Easiest table (same as before) ===== */
          <table
            style={{
              ...grid.table,
              borderColor: "#e0e5ff",
              minWidth: 1000,
              background: "#fff",
            }}
          >
            <colgroup>
              <col style={{ width: "26%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thCell(false)}>Professor</th>
                <th style={thCell(false)}>Class</th>
                <th style={{ ...thCell(false), textAlign: "center" }}>RMP</th>
                <th style={{ ...thCell(false), textAlign: "center" }}>Diff</th>
                <th style={thCell(false)}>Schedule</th>
                <th style={{ ...thCell(true), textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(easiestResults[areaCanon(selectedArea)] || []).map((row) => {
                const rmpLink =
                  row.rmpLink ??
                  (row.link && row.link !== "N/A" ? row.link : null);
                const rmpScoreRaw =
                  row.rmpScore ??
                  row.score ??
                  row.rating ??
                  row.rmp ??
                  row.RMPScore ??
                  row.RMP ??
                  null;
                const rmpScore =
                  typeof rmpScoreRaw === "number"
                    ? rmpScoreRaw.toFixed(1)
                    : rmpScoreRaw || "—";
                const scheduleLines = getScheduleLines(row) || [];

                return (
                  <tr
                    key={`${row.className}-${row.professor || "NA"}`}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // optional: jump into View All mode focused on this class later
                      setOverlayMode("all");
                    }}
                  >
                    {/* Professor */}
                    <td style={{ ...grid.td }}>
                      {rmpLink ? (
                        <a
                          href={rmpLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontWeight: 700,
                            textDecoration: "underline",
                          }}
                        >
                          {row.professor || "—"}
                        </a>
                      ) : (
                        <span style={{ fontWeight: 700 }}>
                          {row.professor || "—"}
                        </span>
                      )}
                    </td>

                    {/* Class */}
                    <td style={{ ...grid.td }}>
                      <span
                        style={{
                          fontSize: ".9rem",
                          color: "#222",
                          fontWeight: 600,
                        }}
                      >
                        {row.className}
                      </span>
                    </td>

                    {/* RMP */}
                    <td style={{ ...grid.td, textAlign: "center" }}>
                      {rmpScore}
                    </td>

                    {/* Diff */}
                    <td style={{ ...grid.td, textAlign: "center" }}>
                      {typeof row.difficulty === "number"
                        ? row.difficulty
                        : "—"}
                    </td>

                    {/* Schedule */}
                    <td
                      style={{
                        ...grid.td,
                        fontSize: ".85rem",
                        color: "#555",
                        lineHeight: 1.25,
                        verticalAlign: "top",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {scheduleLines.length ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {scheduleLines.map((ln, i) => (
                            <span key={i} style={{ display: "block" }}>
                              {ln}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "TBA"
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ ...grid.td, textAlign: "right" }}>
                      {isTaken(row.className) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeByName(row.className);
                          }}
                          type="button"
                          style={{
                            background: "#d32f2f",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            padding: "6px 10px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addClass({
                              id: row.className,
                              title: row.className,
                              area: selectedArea,
                            });
                          }}
                          type="button"
                          style={{
                            background: "#20a7ef",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            padding: "6px 10px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* ===== View All table (class list) ===== */
          (() => {
            const keySet =
              areaToCanonSet.get(areaCanon(areaObj.area)) || new Set();
            let filteredClasses = [...keySet].map(
              (k) => canonToExactName.get(k) || k
            );

            if (!filteredClasses.length) {
              const toks = getClassTokens(areaObj).flatMap(splitAlternatives);
              const dedup = new Set(toks.map(courseKey));
              filteredClasses = [...dedup].map(
                (k) => canonToExactName.get(k) || k
              );
            }

            if (!filteredClasses.length) {
              return (
                <div
                  style={{
                    padding: 12,
                    color: "#777",
                    textAlign: "center",
                  }}
                >
                  No available classes for this area.
                </div>
              );
            }

            return (
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  border: "1px solid #e0e5ff",
                  borderRadius: 12,
                  overflow: "hidden",
                  fontSize: ".9rem",
                }}
              >
                <colgroup>
                  <col style={{ width: "80%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        borderBottom: "1px solid #e0e5ff",
                        borderRight: "1px solid #e0e5ff",
                        background: "#fafbff",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Class
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        fontWeight: 700,
                        borderBottom: "1px solid #e0e5ff",
                        background: "#fafbff",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((cls) => (
                    <tr
                      key={`${areaObj.area}::${cls}`}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
  e.stopPropagation();
  if (!isMobile) {
    setSelectedArea(areaObj.area);  // ensure this card is selected
    setSelectedAllClass(cls);       // open professor menu for this class
  }
}}


                    >
                      <td
                        title={cls}
                        style={{
                          padding: "10px 12px",
                          borderTop: "1px solid #e0e5ff",
                          borderRight: "1px solid #e0e5ff",
                          fontWeight: 700,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span>{cls}</span>
                          <span
                            aria-hidden="true"
                            style={{ fontSize: "1.1rem" }}
                          >
                            ▸
                          </span>
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          borderTop: "1px solid #e0e5ff",
                          textAlign: "right",
                        }}
                      >
                        {isTaken(cls) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeByName(cls);
                            }}
                            type="button"
                            style={{
                              background: "#d32f2f",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: ".85rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addClass({
                                id: cls,
                                title: cls,
                                area: areaObj.area,
                              });
                            }}
                            type="button"
                            style={{
                              background: "#20a7ef",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: ".85rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()
        )}
      </div>
    </div>
  )}
  {isSelected && !isMobile && selectedAllClass && (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        inset: 12,
        background: "#fff",
        border: `2px solid ${brandBlue}`,
        borderRadius: 16,
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
        padding: 16,
        zIndex: 2,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>
          {selectedAllClass} — Professors
        </h3>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAllClass(null);     // back to class list
            }}
            style={{
              backgroundColor: "transparent",
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              color: brandBlue,
              padding: "6px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAllClass(null);
              setSelectedArea(null);
              setOverlayMode("easiest");
            }}
            style={{
              backgroundColor: "transparent",
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              color: brandBlue,
              padding: "6px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Body: professor table */}
      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: 420,
          paddingRight: 6,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {(() => {
          const rows = profRowsFor(selectedAllClass);
          if (!rows.length) {
            return (
              <div style={{ padding: 12, color: "#777" }}>
                No professor data yet.
              </div>
            );
          }

          return (
            <table
              style={{
                width: "100%",
                minWidth: 900,
                borderCollapse: "collapse",
                tableLayout: "fixed",
                border: "1px solid #e0e5ff",
                borderRadius: 12,
                overflow: "hidden",
                fontSize: ".9rem",
              }}
            >
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={thCell(false)}>Professor</th>
                  <th style={{ ...thCell(false), textAlign: "center" }}>RMP</th>
                  <th style={{ ...thCell(false), textAlign: "center" }}>Diff</th>
                  <th style={thCell(false)}>Schedule</th>
                  <th style={{ ...thCell(true), textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const lines = getScheduleLines(row);
                  const rmp =
                    typeof row.rmpScore === "number"
                      ? row.rmpScore.toFixed(1)
                      : row.rmpScore || "—";
                  const diff =
                    typeof row.difficulty === "number"
                      ? row.difficulty
                      : "—";
                  const rmpLink =
                    row.rmpLink ??
                    (row.link && row.link !== "N/A" ? row.link : null);

                  return (
                    <tr
                      key={`${row.className}-${row.professor || "NA"}-${idx}`}
                    >
                      <td style={tdCell(false)}>
                        {rmpLink ? (
                          <a
                            href={rmpLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontWeight: 700,
                              textDecoration: "underline",
                            }}
                          >
                            {row.professor || "—"}
                          </a>
                        ) : (
                          <span style={{ fontWeight: 700 }}>
                            {row.professor || "—"}
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          ...tdCell(false),
                          textAlign: "center",
                        }}
                      >
                        {rmp}
                      </td>
                      <td
                        style={{
                          ...tdCell(false),
                          textAlign: "center",
                        }}
                      >
                        {diff}
                      </td>
                      <td
                        style={{
                          ...tdCell(false),
                          fontSize: ".82rem",
                          color: "#555",
                          lineHeight: 1.25,
                          verticalAlign: "top",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {lines.length ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            {lines.map((ln, i) => (
                              <span key={i} style={{ display: "block" }}>
                                {ln}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        style={{
                          ...tdCell(true),
                          textAlign: "right",
                        }}
                      >
                        {isTaken(row.className) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeByName(row.className);
                            }}
                            type="button"
                            style={{
                              background: "#d32f2f",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontWeight: 700,
                              fontSize: ".85rem",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addClass({
                                id: row.className,
                                title: row.className,
                                area: areaObj.area,
                              });
                            }}
                            type="button"
                            style={{
                              background: "#20a7ef",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontWeight: 700,
                              fontSize: ".85rem",
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  )}

        </div>
      );
    })}
  </div>
  )}
  {/* --- Selected Area details panel (decoupled from cards) --- */}
  {/* ===== Desktop "View All" modal (global overlay) ===== */}

  </div> {/* <-- closes .mobile-main-column */}
  </div> )}