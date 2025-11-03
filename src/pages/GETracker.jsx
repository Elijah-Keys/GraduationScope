import React, { useState, useEffect, useRef } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Cookies from "js-cookie";
import "./GETracker.css";
import { FiSearch } from "react-icons/fi";
import { LuTarget } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineXCircle } from "react-icons/hi";

// 1. single mobile hook
function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

// 2. shared helpers
const normalizeName = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, " ")
    .trim();

const extractBaseCourse = (str) => {
  if (!str) return "";
  let s = str.toLowerCase();
  s = s.split(":")[0];
  s = s.split("(")[0];
  s = s.split("/")[0];
  s = s.split(",")[0];
  s = s.replace(/(\d+)\s*(el|l|s|as)$/i, "$1");
  s = s.replace(/(\d+)\s*[ab]$/i, "$1");
  return s.trim();
};

const classMatchesArea = (detailName, areaClasses) => {
  const dNorm = normalizeName(detailName);
  const dBase = extractBaseCourse(dNorm);
  return (areaClasses || []).some((c) => {
    const cNorm = normalizeName(c);
    const cBase = extractBaseCourse(cNorm);
    return (
      dNorm === cNorm ||
      dNorm.startsWith(cNorm) ||
      cNorm.startsWith(dNorm) ||
      dBase === cBase ||
      dBase.startsWith(cBase) ||
      cBase.startsWith(dBase)
    );
  });
};

const toNumberDifficulty = (val) => {
  if (typeof val === "number") return val;
  const n = parseFloat(val);
  return Number.isNaN(n) ? null : n;
};
function ChecklistModal({ open, onClose, children, brandBlue = "#20A7EF" }) {
  const isMobile = useIsMobile(700);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

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
          transform: isMobile ? "translateY(32px)" : undefined,
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

function ChecklistToggleContent({
  geRequirements,
  classesTaken,
  classToAreas,
  c1c2Fulfilled,
  scrollToArea,
}) {
  const checklistData = geRequirements.map((req) => {
    const area = req.area;
    const taken = classesTaken.filter((c) => {
      if (c.area === area) return true;

      const norm = normalizeName(c.className);
      const base = extractBaseCourse(norm);

      const mapped = []
        .concat(classToAreas[c.className] || [])
        .concat(classToAreas[norm] || [])
        .concat(classToAreas[base] || []);

      return mapped.includes(area);
    });

    let fulfilled = false;
    if (area === "C1 Arts" || area === "C2 Humanities") {
      fulfilled = c1c2Fulfilled;
    } else if (area === "D. Social Sciences") {
      fulfilled = taken.length >= 2;
    } else {
      const count = req.requiredCount || 1;
      fulfilled = taken.length >= count;
    }
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
        >
          <span className="ge-checklist-area">{item.area}</span>
          <span className="ge-checklist-status">
            {item.fulfilled ? "✅" : "❌"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProgressSummary({
  geRequirements,
  classesTaken,
  classToAreas,
  c1c2Fulfilled,
  isMobile,
}) {
  const totalReqs = geRequirements.length;
  const fulfilledCount = geRequirements.reduce((count, req) => {
    const area = req.area;
    const taken = classesTaken.filter((c) => {
      if (c.area === area) return true;

      const norm = normalizeName(c.className);
      const base = extractBaseCourse(norm);

      const mapped = []
        .concat(classToAreas[c.className] || [])
        .concat(classToAreas[norm] || [])
        .concat(classToAreas[base] || []);

      return mapped.includes(area);
    });

    let fulfilled = false;
    if (area === "C1 Arts" || area === "C2 Humanities") {
      fulfilled = c1c2Fulfilled;
    } else if (area === "D. Social Sciences") {
      fulfilled = taken.length >= 2;
    } else {
      const requiredCount = req.requiredCount || 1;
      fulfilled = taken.length >= requiredCount;
    }

    return fulfilled ? count + 1 : count;
  }, 0);

  const progressPercent =
    totalReqs === 0 ? 0 : Math.round((fulfilledCount / totalReqs) * 100);

  return (
    <section
      style={{
        width: "100%",
        backgroundColor: "transparent",
        padding: 0,
        boxShadow: "none",
      }}
    >
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "1.05rem" : "1.6rem",
    fontWeight: 600,
    marginBottom: isMobile ? 8 : 12,
    color: "#000",
  }}
>
  <LuTarget style={{ color: "#20A7EF", marginRight: 6 }} />
  Graduation Progress
</div>

<div
  style={{
    fontSize: isMobile ? "1.6rem" : "2.5rem",
    fontWeight: 600,
    color: "#20A7EF",
    textAlign: "center",
    marginBottom: isMobile ? 14 : 24,
  }}
>
  {progressPercent}%
  <span style={{ fontSize: "0.7rem", color: "#555" }}> Complete</span>
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
            <IoMdCheckmarkCircleOutline
              style={{ color: "#6FD47F", fontSize: "2rem" }}
            />
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


// Renders each array item on its own line
const CellList = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <span style={{ color: "#999" }}>N/A</span>;
  }
  return (
    <ul className="cell-list">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
};

// Mobile: checklist button right after progress, before search


// ——— Mobile Finder (SJSU) ———
// Replaces the entire previous SJSUMobileFinder
function SJSUMobileFinder({
  geRequirements,
  classDetails,
  classesTaken,
  addClass,
  onDeleteClass,
  search,
  setSearch,
  classToAreas,
  selectedArea,
  onSelectArea,
  findEasiestClasses,
  easiestResults,
}) {
  const brandBlue = "#20A7EF";
  const isMobile = useIsMobile(700);

  // state first
  const [area, setArea] = React.useState(
    selectedArea || geRequirements?.[0]?.area || ""
  );
  React.useEffect(() => {
    if (selectedArea && selectedArea !== area) setArea(selectedArea);
  }, [selectedArea, area]);

  const [overlayMode, setOverlayMode] = React.useState("all"); // "all" or "easiest"
  const [selectedAllClass, setSelectedAllClass] = React.useState(null);

  // now it is safe to compute this
  const isEasiestMobile = isMobile && overlayMode === "easiest";

  const edge = { width: "100%", boxSizing: "border-box", marginInline: 0 };
  // Easiest data cache

const bodyStyle =
  overlayMode === "easiest" && isMobile
    ? {
        overflowY: "auto",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingRight: 12,
      }
    : {
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: 12,
        maxHeight: 420,
      };

  // ----- Helpers -----
const classesWithProfessors = React.useMemo(() => {
  const set = new Set();
  (classDetails || []).forEach((d) => {
    const n = normalizeName(d.className);
    const b = extractBaseCourse(n);
    set.add(n);
    set.add(b);
  });
  return set;
}, [classDetails]);



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

  // Choose the GE area for a class (prefer an area not already used in Classes Taken)
  const chooseAreaForClass = React.useCallback((className) => {
    const areas = classToAreas[className] || [];
    const takenAreas = new Set(classesTaken.map((c) => c.area));
    return areas.find((a) => !takenAreas.has(a)) || areas[0] || area || geRequirements?.[0]?.area || "";
  }, [classToAreas, classesTaken, area, geRequirements]);

  // Compute All Options list for current area (same as Chico's View All overlay)
const allOptionsForArea = React.useMemo(() => {
  const areaObj = geRequirements.find((a) => a.area === area);
  if (!areaObj) return [];
  return (areaObj.classes || []).filter((cls) =>
    classDetails.some((d) => classMatchesArea(d.className, [cls]))
  );
}, [area, geRequirements, classDetails]);

  // Easiest logic (same approach you use elsewhere)



  // If user switches area while in "easiest", refresh that list
React.useEffect(() => {
  if (
    overlayMode === "easiest" &&
    area &&
    !(easiestResults[area] && easiestResults[area].length)
  ) {
    findEasiestClasses(area);
  }
}, [overlayMode, area, findEasiestClasses, easiestResults]);

  // Simple search suggestions (dedup by className) — click to add to Classes Taken
  const searchResults = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    const filtered = classDetails.filter(({ className, professor }) => {
      const cn = (className || "").toLowerCase();
      const pf = (professor || "").toLowerCase();
      return cn.includes(term) || pf.includes(term);
    });
    const map = new Map();
    for (const row of filtered) {
      if (!map.has(row.className)) map.set(row.className, row);
    }
    return Array.from(map.values());
  }, [search, classDetails]);

return (
  <section
  style={{
    background: "transparent",
    padding: 0,
    width: "100%",
    maxWidth: "100vw",
    margin: "0 0 16px 0",
    boxSizing: "border-box",
    position: "relative",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
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
      fontSize: 16,          // prevents iOS zoom
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

  {/* Search suggestions (tap to add) */}
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
  onMouseDown={(e) => {
    e.preventDefault();
    const chosenArea = chooseAreaForClass(obj.className);
    addClass(obj.className, chosenArea);
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
 <div
  style={{
    ...edge,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: isMobile ? 8 : 12,
    marginBottom: 10
  }}
>

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

      {/* Pick GE Area */}
 <div
  style={{
    ...edge,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: isMobile ? 8 : 12,
    marginBottom: 10
  }}
>

        <div style={{ fontWeight: 800, marginBottom: 8 }}>Filter by GE Area</div>
        <select
          value={area}
          onChange={(e) => {
  const v = e.target.value;
  setArea(v);
  onSelectArea?.(v);
  setSelectedAllClass(null);
}}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db" }}
        >
          {geRequirements.map((a) => (
            <option key={a.area} value={a.area}>{a.area}</option>
          ))}
        </select>
      </div>

      {/* ==== PANEL: Always visible — All Options / Easiest (like Chico) ==== */}
<div
  style={{
    ...edge,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: isMobile ? 8 : 12,
    marginBottom: 10
  }}
>

 {/* Header */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: isEasiestMobile ? "flex-start" : "center",
    gap: 8,
    marginBottom: 8,
    maxWidth: "100%",
  }}
>
  <h3
    style={{
      margin: 0,
      fontSize: "0.8rem",
      maxWidth: "65vw",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {area}
    {selectedAllClass
      ? ": Class Details"
      : overlayMode === "easiest"
      ? ": Easiest"
      : ": All Options"}
  </h3>

  <div
    style={{
      display: "flex",
      gap: 6,
      flexWrap: isEasiestMobile ? "wrap" : "nowrap",
      justifyContent: "flex-end",
      maxWidth: "32vw",
    }}
  >
    {overlayMode !== "all" && !selectedAllClass && (
      <button
        type="button"
        onClick={() => setOverlayMode("all")}
        style={{
          background: "transparent",
          border: "2px solid " + brandBlue,
          borderRadius: 8,
          color: brandBlue,
          padding: "5px 8px",
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      >
        View all
      </button>
    )}

    {overlayMode !== "easiest" && !selectedAllClass && (
   <button
  type="button"
  onClick={() => {
    setSelectedAllClass(null);          // force list view
    setOverlayMode("easiest");
    findEasiestClasses(area);
  }}
        style={{
          background: "transparent",
          border: "2px solid " + brandBlue,
          borderRadius: 8,
          color: brandBlue,
          padding: "5px 8px",
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      >
        Easiest
      </button>
    )}

    {selectedAllClass && (
      <button
        type="button"
        onClick={() => setSelectedAllClass(null)}
        style={{
          background: "transparent",
          border: "2px solid " + brandBlue,
          borderRadius: 8,
          color: brandBlue,
          padding: "5px 8px",
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      >
        Back
      </button>
    )}
  </div>
</div>

{/* Body */}
<div style={bodyStyle}>

{selectedAllClass ? (() => {
  const detailRows = classDetails.filter((d) =>
    classMatchesArea(d.className, [selectedAllClass])
  );

  const nameToUse =
    detailRows.length > 0 ? detailRows[0].className : selectedAllClass;

  const cellStyle = {
    border: "1px solid #e0e5ff",
    padding: "8px 10px",
    fontSize: "0.78rem",
    verticalAlign: "top",
    background: "#fff",
  };

  const headStyle = {
    border: "1px solid #e0e5ff",
    padding: "8px 10px",
    textAlign: "left",
    background: "#fafbff",
    fontWeight: 700,
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        paddingBottom: 6,
      }}
    >
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          maxWidth: "100vw",
        }}
      >
        <table
          style={{
            minWidth: 560,
            width: "max-content",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            border: "1px solid #e0e5ff",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={5}
                style={{
                  ...headStyle,
                  background: "#fff",
                  borderBottom: "1px solid #e0e5ff",
                }}
              >
                {nameToUse}
              </th>
            </tr>
            <tr>
              <th style={{ ...headStyle, width: 150 }}>Professor</th>
              <th style={{ ...headStyle, width: 55, textAlign: "center" }}>
                RMP
              </th>
              <th style={{ ...headStyle, width: 55, textAlign: "center" }}>
                Diff
              </th>
              <th
                style={{
                  ...headStyle,
                  minWidth: 200,
                  whiteSpace: "nowrap",
                }}
              >
                Schedule
              </th>
              <th style={{ ...headStyle, width: 95, textAlign: "right" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {detailRows.length === 0 ? (
              <tr>
                <td colSpan={5} style={cellStyle}>
                  No professor data for this class.
                </td>
              </tr>
            ) : (
              detailRows.map((row, i) => {
                const lines = getScheduleLines(row);
                const rmpLink =
                  row.rmpLink && row.rmpLink !== "N/A"
                    ? row.rmpLink
                    : row.link && row.link !== "N/A"
                    ? row.link
                    : null;
                const rmpScoreRaw =
                  row.rmpScore ??
                  row.score ??
                  row.rating ??
                  row.rmp ??
                  row.RMPScore ??
                  null;
                const rmpScore =
                  typeof rmpScoreRaw === "number"
                    ? rmpScoreRaw.toFixed(1)
                    : rmpScoreRaw || "N/A";

                const taken = classesTaken.some(
                  (t) =>
                    t.className === nameToUse &&
                    (t.area === area || !t.area)
                );
                const toDelete =
                  classesTaken.find(
                    (t) =>
                      t.className === nameToUse &&
                      (t.area === area || !t.area)
                  ) || { className: nameToUse, area };

                return (
                  <tr key={i}>
                    <td style={cellStyle}>
                      {rmpLink ? (
                        <a
                          href={rmpLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ fontWeight: 700, textDecoration: "underline" }}
                        >
                          {row.professor || "N/A"}
                        </a>
                      ) : (
                        <span style={{ fontWeight: 700 }}>
                          {row.professor || "N/A"}
                        </span>
                      )}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      {rmpScore}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      {typeof row.difficulty === "number"
                        ? row.difficulty
                        : "N/A"}
                    </td>
                    <td style={{ ...cellStyle, minWidth: 200 }}>
                      {lines.length
                        ? lines.map((l, j) => (
                            <div key={j} style={{ whiteSpace: "nowrap" }}>
                              {l}
                            </div>
                          ))
                        : "N/A"}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>
                      {taken ? (
                        <button
                          onClick={() => onDeleteClass(toDelete)}
                          type="button"
                          style={{
                            background: "#d32f2f",
                            color: "#fff",
                            border: 0,
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => addClass(nameToUse, area)}
                          type="button"
                          style={{
                            background: "#20a7ef",
                            color: "#fff",
                            border: 0,
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        >
                          Add
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
})(): overlayMode === "easiest" ? (
  isMobile ? (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        paddingBottom: 6,
      }}
    >
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          maxWidth: "100vw",
        }}
      >
        <table
          style={{
            minWidth: 560,
            width: "max-content",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            border: "1px solid #e0e5ff",
            borderRadius: 10,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #e0e5ff",
                  padding: "10px 0px",
                  textAlign: "left",
                  width: 140,
                  background: "#fafbff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  whiteSpace: "nowrap",
                }}
              >
                Class
              </th>
              <th
                style={{
                  border: "1px solid #e0e5ff",
                  padding: "10px 0px",
                  textAlign: "left",
                  width: 150,
                  background: "#fafbff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                }}
              >
                Professor
              </th>
              <th
                style={{
                  border: "1px solid #e0e5ff",
                  padding: "10px 10px",
                  textAlign: "left",
                  minWidth: 200,
                  whiteSpace: "nowrap",
                  background: "#fafbff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                }}
              >
                Schedule
              </th>
              <th
                style={{
                  border: "1px solid #e0e5ff",
                  padding: "10px 6px",
                  textAlign: "center",
                  width: 60,
                  background: "#fafbff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                }}
              >
                RMP
              </th>
              <th
                style={{
                  border: "1px solid #e0e5ff",
                  padding: "10px 6px",
                  textAlign: "center",
                  width: 60,
                  background: "#fafbff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                }}
              >
                Diff
              </th>
              <th
                style={{
                  border: "1px solid #e0e5ff",
                  padding: "10px 6px",
                  textAlign: "right",
                  width: 90,
                  background: "#fafbff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {(easiestResults[area] || []).length > 0 ? (
              (easiestResults[area] || []).map((row) => {
                const lines = getScheduleLines(row);
                const rmpLink =
                  row.rmpLink && row.rmpLink !== "N/A"
                    ? row.rmpLink
                    : row.link && row.link !== "N/A"
                    ? row.link
                    : null;
                const rmpScoreRaw =
                  row.rmpScore ??
                  row.score ??
                  row.rating ??
                  row.rmp ??
                  row.RMPScore ??
                  null;
                const rmpScore =
                  typeof rmpScoreRaw === "number"
                    ? rmpScoreRaw.toFixed(1)
                    : rmpScoreRaw || "N/A";

                const taken = classesTaken.some(
                  (t) =>
                    t.className === row.className &&
                    (t.area === area || !t.area)
                );
                const toDelete =
                  classesTaken.find(
                    (t) =>
                      t.className === row.className &&
                      (t.area === area || !t.area)
                  ) || { className: row.className, area };

                return (
                  <tr key={`${row.className}-${row.professor || "NA"}`}>
                    <td
                      style={{
                        border: "1px solid #e0e5ff",
                        padding: "8px 10px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 170,
                        fontWeight: 700,
                        background: "#fff",
                      }}
                    >
                      <span
                        onClick={() => setSearch(row.className)}
                        style={{ cursor: "pointer" }}
                      >
                        {row.className}
                      </span>
                    </td>
                    <td
                      style={{
                        border: "1px solid #e0e5ff",
                        padding: "8px 10px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 150,
                        background: "#fff",
                      }}
                    >
                      {rmpLink ? (
                        <a
                          href={rmpLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ fontWeight: 700, textDecoration: "underline" }}
                        >
                          {row.professor || "N/A"}
                        </a>
                      ) : (
                        <span style={{ fontWeight: 700 }}>
                          {row.professor || "N/A"}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e0e5ff",
                        padding: "8px 10px",
                        minWidth: 200,
                        background: "#fff",
                      }}
                    >
                      {lines.length
                        ? lines.map((l, i) => (
                            <div key={i} style={{ whiteSpace: "nowrap" }}>
                              {l}
                            </div>
                          ))
                        : "N/A"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e0e5ff",
                        padding: "8px 6px",
                        textAlign: "center",
                        background: "#fff",
                      }}
                    >
                      {rmpScore}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e0e5ff",
                        padding: "8px 6px",
                        textAlign: "center",
                        background: "#fff",
                      }}
                    >
                      {typeof row.difficulty === "number"
                        ? row.difficulty
                        : "N/A"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e0e5ff",
                        padding: "8px 6px",
                        textAlign: "right",
                        background: "#fff",
                      }}
                    >
                      {taken ? (
                        <button
                          onClick={() => onDeleteClass(toDelete)}
                          type="button"
                          style={{
                            background: "#d32f2f",
                            color: "#fff",
                            border: 0,
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => addClass(row.className, area)}
                          type="button"
                          style={{
                            background: "#20a7ef",
                            color: "#fff",
                            border: 0,
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        >
                          Add
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #e0e5ff",
                    padding: 12,
                    textAlign: "center",
                    background: "#fff",
                  }}
                >
                  No easiest classes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
 ) : (
  <div
    className="gs-easiest-scroll"
    style={{
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      overscrollBehaviorX: "contain",
      touchAction: "pan-x",
      marginBottom: 2,
    }}
  >
    <table
      style={{
        minWidth: 720,
        width: "max-content",
        tableLayout: "fixed",
        borderCollapse: "collapse",
        border: "1.5px solid #e0e5ff",
        borderRadius: 12,
        overflow: "hidden",
        fontSize: "0.92rem",
        background: "#fff",
      }}
    >
      <colgroup>
        <col style={{ width: 240 }} />  {/* Class */}
        <col style={{ width: 160 }} />  {/* Professor */}
        <col style={{ width: 64 }} />   {/* RMP */}
        <col style={{ width: 60 }} />   {/* Diff */}
        <col style={{ width: 260 }} />  {/* Schedule */}
        <col style={{ width: 90 }} />   {/* Action */}
      </colgroup>
      <thead>
        <tr>
          <th
            style={{
              padding: "10px 12px",
              textAlign: "left",
              borderBottom: "1px solid #e0e5ff",
              background: "#fafbff",
              whiteSpace: "nowrap",
            }}
          >
            Class
          </th>
          <th
            style={{
              padding: "10px 12px",
              textAlign: "left",
              borderBottom: "1px solid #e0e5ff",
              background: "#fafbff",
              whiteSpace: "nowrap",
            }}
          >
            Professor
          </th>
          <th
            style={{
              padding: "10px 12px",
              textAlign: "center",
              borderBottom: "1px solid #e0e5ff",
              background: "#fafbff",
              whiteSpace: "nowrap",
            }}
          >
            RMP
          </th>
          <th
            style={{
              padding: "10px 12px",
              textAlign: "center",
              borderBottom: "1px solid #e0e5ff",
              background: "#fafbff",
              whiteSpace: "nowrap",
            }}
          >
            Diff
          </th>
          <th
            style={{
              padding: "10px 12px",
              textAlign: "left",
              borderBottom: "1px solid #e0e5ff",
              background: "#fafbff",
              whiteSpace: "nowrap",
            }}
          >
            Schedule
          </th>
          <th
            style={{
              padding: "10px 12px",
              textAlign: "right",
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
        {(easiestResults[area] || []).length > 0 ? (
          (easiestResults[area] || []).map((row) => {
            const lines = getScheduleLines(row);
            const rmpLink =
              row.rmpLink && row.rmpLink !== "N/A"
                ? row.rmpLink
                : row.link && row.link !== "N/A"
                ? row.link
                : null;
            const rmpScoreRaw =
              row.rmpScore ??
              row.score ??
              row.rating ??
              row.rmp ??
              row.RMPScore ??
              null;
            const rmpScore =
              typeof rmpScoreRaw === "number"
                ? rmpScoreRaw.toFixed(1)
                : rmpScoreRaw || "N/A";

            const taken = classesTaken.some(
              (t) =>
                t.className === row.className &&
                (t.area === area || !t.area)
            );
            const toDelete =
              classesTaken.find(
                (t) =>
                  t.className === row.className &&
                  (t.area === area || !t.area)
              ) || { className: row.className, area };

            return (
              <tr key={`${row.className}-${row.professor || "NA"}`}>
                {/* Class */}
                <td
                  style={{
                    padding: "8px 10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 210,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setSearch(row.className)}
                  >
                    {row.className}
                  </span>
                </td>

                {/* Professor (RMP link if found) */}
                <td
                  style={{
                    padding: "8px 10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 170,
                  }}
                >
                  {rmpLink ? (
                    <a
                      href={rmpLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ fontWeight: 700, textDecoration: "underline" }}
                    >
                      {row.professor || "N/A"}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 700 }}>
                      {row.professor || "N/A"}
                    </span>
                  )}
                </td>

                {/* RMP */}
                <td
                  style={{
                    padding: "8px 6px",
                    textAlign: "center",
                  }}
                >
                  {rmpScore}
                </td>

                {/* Difficulty */}
                <td
                  style={{
                    padding: "8px 6px",
                    textAlign: "center",
                  }}
                >
                  {typeof row.difficulty === "number"
                    ? row.difficulty
                    : "N/A"}
                </td>

                {/* Schedule */}
                <td
                  style={{
                    padding: "8px 10px",
                    minWidth: 200,
                  }}
                >
                  {lines.length
                    ? lines.map((l, i) => (
                        <div
                          key={i}
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {l}
                        </div>
                      ))
                    : "N/A"}
                </td>

                {/* Action */}
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "right",
                  }}
                >
                  {taken ? (
                    <button
                      onClick={() => onDeleteClass(toDelete)}
                      type="button"
                      style={{
                        background: "#d32f2f",
                        color: "#fff",
                        border: 0,
                        borderRadius: 8,
                        padding: "5px 12px",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => addClass(row.className, area)}
                      type="button"
                      style={{
                        background: "#20a7ef",
                        color: "#fff",
                        border: 0,
                        borderRadius: 8,
                        padding: "5px 12px",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td
              colSpan={6}
              style={{
                padding: 12,
                textAlign: "center",
                color: "#888",
              }}
            >
              No easiest classes yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

) : (
  // All Options
  <table
    style={{
      width: "100%",
      tableLayout: "auto",
      borderCollapse: "collapse",
      border: "1.5px solid #222",
      borderRadius: 12,
      overflow: "hidden",
      fontSize: "0.95rem",
    }}
  >
    {/* your All Options code stays the same here */}

  <colgroup>
    <col />                     {/* Class column expands */}
    <col style={{ width: "1%" }} /> {/* Action shrinks to button */}
  </colgroup>

    <thead>
      <tr>
        <th
          style={{
            padding: "10px 12px",
            textAlign: "left",
            fontWeight: 700,
            borderBottom: "1px solid #222",
            background: "#fafbff",
          }}
        >
          Class
        </th>
        <th
          style={{
            padding: "10px 12px",
            textAlign: "right",
            fontWeight: 700,
            borderBottom: "1px solid #222",
            background: "#fafbff",
            paddingRight: 16,
          }}
        >
          Action
        </th>
      </tr>
    </thead>
    <tbody>
      {allOptionsForArea.map((cls) => {
        const taken = classesTaken.some(
          (t) => t.className === cls && (t.area === area || !t.area)
        );
        const toDelete =
          classesTaken.find(
            (t) => t.className === cls && (t.area === area || !t.area)
          ) || { className: cls, area };

        return (
          <tr key={`${area}::${cls}`}>
            <td
              style={{
                padding: "10px 12px",
                borderTop: "1px solid #222",
                fontWeight: 700,
                whiteSpace: "nowrap", // <— add this
                fontSize: "clamp(0.82rem, 2.6vw, 0.95rem)",
                lineHeight: 1.2,
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                cursor: "pointer",
              }}
              title={cls}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAllClass(cls);   // <— open the NEW details view
              }}
            >
       <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
  <span>{cls}</span>
  <span aria-hidden="true" style={{ fontSize: "1.2rem", lineHeight: 1 }}>▾</span>
</span>

            </td>

            <td
              style={{ padding: "10px 12px", borderTop: "1px solid #222", textAlign: "right" }}
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
                    borderRadius: 10,
                    padding: "4px 10px",
                    fontSize: "0.85rem",
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
                    addClass(cls, area);
                  }}
                  type="button"
                  style={{
                    background: "#20a7ef",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "4px 10px",
                    fontSize: "0.85rem",
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
)}
</div>
</div>
</section>
);
} 


function GEDebugPanel({ geRequirements, classDetails }) {
  if (!Array.isArray(geRequirements) || !Array.isArray(classDetails)) {
    return null;
  }

  // 1. classes that are in GE but never appear in classDetails
  const geToDetailsMisses = [];
  geRequirements.forEach(areaObj => {
    (areaObj.classes || []).forEach(cls => {
      const hit = classDetails.some(d => classMatchesArea(d.className, [cls]));
      if (!hit) {
        geToDetailsMisses.push({
          area: areaObj.area,
           cls
        });
      }
    });
  });

  // 2. classDetails that do not seem to belong to any GE area
  const detailsWithoutArea = [];
  classDetails.forEach(d => {
const inAnyArea = geRequirements.some(a =>
   classMatchesArea(d.className || "", a.classes || [])
 );
    if (!inAnyArea) {
      detailsWithoutArea.push(d);
    }
  });

  // 3. rows with professor but missing rmp link or score
  const rmpProblems = classDetails.filter(d => {
    const hasProf = d.professor && d.professor !== "N/A";
    const hasLink = d.rmpLink && d.rmpLink !== "N/A";
    const hasScore = d.rmpScore || d.score || d.rating || d.rmp || d.RMPScore;
    return hasProf && !hasLink && !hasScore;
  });

  // hide when clean
  if (
    geToDetailsMisses.length === 0 &&
    detailsWithoutArea.length === 0 &&
    rmpProblems.length === 0
  ) {
    return (
      <div style={{ background: "#e7ffe9", padding: 8, borderRadius: 8, marginBottom: 12 }}>
        Data scan ok.
      </div>
    );
  }

  return (
    <div style={{ background: "#fff4d6", padding: 12, borderRadius: 10, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Debug results</h3>

      {geToDetailsMisses.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <strong>GE class names that had no match in classDetails</strong>
          <ul>
            {geToDetailsMisses.map((x, i) => (
              <li key={i}>
                {x.area}: {x.cls}
              </li>
            ))}
          </ul>
        </div>
      )}

      {detailsWithoutArea.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <strong>classDetails that do not map to any GE area</strong>
          <ul>
            {detailsWithoutArea.slice(0, 40).map((d, i) => (
              <li key={i}>{d.className} {d.professor ? `(${d.professor})` : ""}</li>
            ))}
          </ul>
          {detailsWithoutArea.length > 40 && <p>...more</p>}
        </div>
      )}

      {rmpProblems.length > 0 && (
        <div>
          <strong>Rows with professor but missing RMP link and score</strong>
          <ul>
            {rmpProblems.slice(0, 40).map((d, i) => (
              <li key={i}>
                {d.className} with {d.professor}
              </li>
            ))}
          </ul>
          {rmpProblems.length > 40 && <p>...more</p>}
        </div>
      )}
    </div>
  );
}


export default function GETracker({
  geRequirements,
  classDetails,
  onAddClass,
  onDeleteClass,
  classesTaken,
  c1c2Fulfilled,
  areaCWarning,
  search,
  setSearch,
  searchResults,
  handleAddClass,
  university,
}) {

const brandBlue = "#20A7EF";

 const safeClassDetails = React.useMemo(() => {
    if (!Array.isArray(classDetails)) return [];
    return classDetails.filter(
      d =>
        d &&
        typeof d.className === "string" &&
        d.className.trim() !== ""
    );
  }, [classDetails]);

    const resolveProfessorClassName = React.useCallback(
    (rawName) => {
      if (!rawName) return "";
      const match = safeClassDetails.find(d =>
        classMatchesArea(d.className, [rawName])
      );
      return match ? match.className : rawName;
    },
    [safeClassDetails]
  );


const addClass = onAddClass || handleAddClass || (() => {});
const deleteClass = onDeleteClass || (() => {});

 const [mobileTableOpen, setMobileTableOpen] = React.useState(false);
  // Local state declarations (no redeclaration error):
  const [openAreas, setOpenAreas] = useState(new Set());
  const [openMenus, setOpenMenus] = useState(new Set());
  const [easiestResults, setEasiestResults] = useState({});
  const [easiestLoading, setEasiestLoading] = useState({})
  const [a1TextVisible, setA1TextVisible] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [openAllOptions, setOpenAllOptions] = useState({});
// parity with Chico overlays
const [selectedArea, setSelectedArea] = useState(null);
const [overlayMode, setOverlayMode] = useState("all"); // "all" | "easiest"
const [selectedAllClass, setSelectedAllClass] = useState(null);
const [mobileArea, setMobileArea] = useState(geRequirements?.[0]?.area || "");

// shared table styles (like Chico)
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

// break schedules into lines, same logic as Chico
const getScheduleLines = (entry) => {
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
};

  // Your component logic and rest of the code here...


const isMobile = useIsMobile(700);
const areaRefs = useRef({});
const scrollTargetRef = useRef(null);

geRequirements.forEach(req => {
  if (!areaRefs.current[req.area]) {
    areaRefs.current[req.area] = React.createRef();
  }
});
// below: const areaRefs = useRef({}) …
const finderRef = useRef(null);

useEffect(() => {
  const targetArea = scrollTargetRef.current || selectedArea;
  if (!targetArea) return;

  // Give React time to render the overlay
  const timeoutId = setTimeout(() => {
    const ref = areaRefs.current[targetArea];
    if (!ref || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offset = isMobile ? 88 : 120;
    const top = rect.top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
    scrollTargetRef.current = null;
  }, 50); // Small delay ensures DOM is ready

  return () => clearTimeout(timeoutId);
}, [selectedArea, openAreas, isMobile]);

const scrollToFinder = () => {
  // wait a frame so the modal can close first
  requestAnimationFrame(() => {
    if (!finderRef.current) return;
    const rect = finderRef.current.getBoundingClientRect();
    const y = rect.top + window.scrollY - window.innerHeight * 0.15; // 15% from top
    window.scrollTo({ top: y, behavior: "smooth" });
  });
};
// close mobile checklist and jump to the area
// close mobile checklist and jump to the area
const scrollAndClose = (area) => {
  setChecklistOpen(false);

  // tell the mobile finder to show this area
  if (area) {
    setMobileArea(area);          // <- this is the missing piece
    setSearch?.("");              // optional, keeps the list clean
  }

  // give the modal a moment to close, then scroll
  setTimeout(() => {
    if (area) {
      scrollToArea(area);
    }
    scrollToFinder();
  }, 200);
};



const scrollToArea = (area) => {
  // FIRST: Scroll to Classes Taken section immediately (visible feedback!)
  const classesSection = document.querySelector('.ge-section-title');
  if (classesSection) {
    const rect = classesSection.getBoundingClientRect();
    const offset = isMobile ? 88 : 120;
    const top = rect.top + window.scrollY - offset;
    
    window.scrollTo({ top, behavior: "smooth" });
  }
  
  // THEN: Open the card
  setSelectedArea(area);
  setOverlayMode("all");
  setOpenAreas((prev) => {
    const next = new Set(prev);
    next.add(area);
    return next;
  });
  
  // FINALLY: After 600ms (after scroll completes), scroll to the actual card
  setTimeout(() => {
    const ref = areaRefs.current[area];
    if (ref?.current) {
      const rect = ref.current.getBoundingClientRect();
      const offset = isMobile ? 88 : 120;
      const top = rect.top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, 600);
};




// Define shared header cell style with mobile adjustments
const thMobile = {
  textAlign: "left",
  padding: isMobile ? "8px 8px" : "10px",
  borderBottom: "1px solid #ccc", 
  backgroundColor: "transparent",
  fontSize: isMobile ? "0.76rem" : "0.95rem",  // 20% smaller on mobile
  borderRight: "1px solid #ccc",
};

// Define shared data cell style with mobile adjustments
const tdMobile = {
  padding: isMobile ? "6px 8px" : "10px",
  borderBottom: "1px solid #eee",
  fontSize: isMobile ? "0.76rem" : "0.95rem",
  color: "#fff",
};


  useEffect(() => {
    if (university) {
      Cookies.set("recentUniversity", university, {
        expires: 7,
        secure: true,
        sameSite: "strict"
      });
    }
  }, [university]);

  // --- Helper functions ---
  // Your original easiest-classes logic
const findEasiestClasses = React.useCallback(
  (area) => {
    setEasiestLoading((prev) => ({ ...prev, [area]: true }));

    const areaClasses =
      geRequirements.find((a) => a.area === area)?.classes || [];

    const allMatches = classDetails
      .map((detail) => {
        const diff = toNumberDifficulty(detail.difficulty);
        return { ...detail, difficulty: diff };
      })
      .filter((detail) => classMatchesArea(detail.className, areaClasses));

    const withDiff = allMatches.filter((d) => d.difficulty !== null);
    const withoutDiff = allMatches.filter((d) => d.difficulty === null);

    let easiest;

    if (withDiff.length > 0) {
      withDiff.sort((a, b) => a.difficulty - b.difficulty);

      const cutoff =
        withDiff.length >= 5
          ? withDiff[4].difficulty
          : withDiff[withDiff.length - 1].difficulty;

      easiest = withDiff
        .filter((c) => c.difficulty <= cutoff)
        .map((c) => ({
          ...c,
          rmpLink: c.rmpLink ?? (c.link && c.link !== "N/A" ? c.link : null),
          rmpScore:
            c.rmpScore ??
            c.score ??
            c.rating ??
            c.rmp ??
            c.RMPScore ??
            null,
        }));
    } else {
      easiest = withoutDiff
        .sort((a, b) => {
          const ca = (a.className || "").localeCompare(b.className || "");
          if (ca !== 0) return ca;
          return (a.professor || "").localeCompare(b.professor || "");
        })
        .slice(0, 6)
        .map((c) => ({
          ...c,
          rmpLink: c.rmpLink ?? (c.link && c.link !== "N/A" ? c.link : null),
          rmpScore:
            c.rmpScore ??
            c.score ??
            c.rating ??
            c.rmp ??
            c.RMPScore ??
            null,
        }));
    }

    setEasiestResults((prev) => ({ ...prev, [area]: easiest }));
    setEasiestLoading((prev) => ({ ...prev, [area]: false }));
  },
  [geRequirements, classDetails]
);






  const toggleEasiestClasses = (area, event) => {
    // Prevent card click from toggling area open/close when clicking the button
    if (event) event.stopPropagation();

    if (easiestResults[area] && easiestResults[area].length > 0) {
      setEasiestResults((prev) => ({ ...prev, [area]: [] }));
    } else {
      findEasiestClasses(area);
    }
  };

  const getClassKey = (area, className) => `${area}::${className}`;

const classesWithProfessors = new Set(
  classDetails.map((entry) => normalizeName(entry.className))
);


const classToAreas = React.useMemo(() => {
  const map = {};

  const push = (obj, key, area) => {
    if (!key) return;
    if (!obj[key]) obj[key] = [];
    if (!obj[key].includes(area)) obj[key].push(area);
  };

  (geRequirements || []).forEach((areaObj) => {
    (areaObj.classes || []).forEach((className) => {
      const norm = normalizeName(className);
      const base = extractBaseCourse(norm);

      // try to pull out just "dept number", for example "ccs 74"
      const codeMatch = norm.match(/^([a-z]+)\s+(\d+[a-z]?)/i);
      const codeOnly = codeMatch
        ? normalizeName(`${codeMatch[1]} ${codeMatch[2]}`)
        : null;

      // store all variants
      push(map, className, areaObj.area);   // exact from JSON
      push(map, norm, areaObj.area);        // normalized long name
      push(map, base, areaObj.area);        // your current base
      push(map, codeOnly, areaObj.area);    // short form like "ccs 74"
    });
  });

  return map;
}, [geRequirements]);


  const c1c2Count = classesTaken.filter(
    (obj) => obj.area === "C1 Arts" || obj.area === "C2 Humanities"
  ).length;
// --- Desktop helpers (used only in the desktop search UI) ---
const chooseAreaForClassDesktop = React.useCallback((className) => {
  const areas = classToAreas[className] || [];
  const takenAreas = new Set(classesTaken.map(c => c.area));
  return (
    areas.find(a => !takenAreas.has(a)) ||
    areas[0] ||
    geRequirements?.[0]?.area ||
    ""
  );
}, [classToAreas, classesTaken, geRequirements]);

const desktopSearchResults = React.useMemo(() => {
  const term = (search || "").trim().toLowerCase();
  if (!term) return [];
  const filtered = classDetails.filter(({ className, professor }) => {
    const cn = (className || "").toLowerCase();
    const pf = (professor || "").toLowerCase();
    return cn.includes(term) || pf.includes(term);
  });
  const map = new Map();
  for (const row of filtered) {
    if (!map.has(row.className)) map.set(row.className, row);
  }
  return Array.from(map.values());
}, [search, classDetails]);

  // --- Card click toggles area open/close ---
const handleAreaCardClick = (area) => {
  if (area === "A1 Oral Communication") {
    setA1TextVisible(false);
  }
  setOpenAreas((prev) => {
    const newSet = new Set(prev);
    // Don't toggle if this is the selected area - keep it open
    if (area === selectedArea) {
      newSet.add(area);
    } else {
      newSet.has(area) ? newSet.delete(area) : newSet.add(area);
    }
    return newSet;
  });
};


  const handleClassClick = (area, className, event) => {
    // Prevent card click from toggling area open/close when clicking this button
    if (event) event.stopPropagation();

    const key = getClassKey(area, className);
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  // --- Error handling ---
  if (!Array.isArray(geRequirements) || geRequirements.length === 0) {
    return (
      <div style={{ color: "red" }}>
        GE Requirements data missing or not loaded.
      </div>
    );
  }

  if (!Array.isArray(classDetails)) {
    return (
      <div style={{ color: "red" }}>
        Class details missing or not loaded.
      </div>
    );
  }

  if (!Array.isArray(classesTaken)) {
    return (
      <div style={{ color: "red" }}>
        Classes taken data missing or not loaded.
      </div>
    );
  }
const th = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #ccc",
  backgroundColor: "transparent",
  fontSize: "0.95rem",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  fontSize: "0.95rem",
  color: "#fff",
};


console.log("Easiest Results with RMP Links:", easiestResults);
console.log("Class Details with RMP Links:", classDetails.map(c => ({
  className: c.className,
  professor: c.professor,
  rmpLink: c.rmpLink || c.link
})));
const thGrid = {
  ...grid.th,
  boxShadow: "inset 0 -1px 0 #e0e5ff, inset -1px 0 0 #e0e5ff", // bottom + right lines
};

const tdGrid = {
  ...grid.td,
  boxShadow: "inset 0 1px 0 #e0e5ff, inset -1px 0 0 #e0e5ff",  // top + right lines
};

// optional: avoid a darker outer edge on the last column
const thGridLast = { ...thGrid, boxShadow: "inset 0 -1px 0 #e0e5ff" };
const tdGridLast = { ...tdGrid, boxShadow: "inset 0 1px 0 #e0e5ff" };
 // --- Render ---  
return (
  <div className="ge-container">
      {/* Title/Header */}
      <h1
  className="ge-title"
  style={{ marginTop: isMobile ? 64 : 96 }} // +32px on desktop (>=701px)
>
  San Jose State University
</h1>


<section
  style={{
    backgroundColor: "#fff",
    padding: "24px 32px",
    borderRadius: 20,
    boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
width: "100%",
 maxWidth: 1200,
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
    isMobile={isMobile}
  />
  {isMobile && (
  <>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
      <button
        style={{
          backgroundColor: brandBlue,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "12px 28px",
          fontWeight: 700,
          fontSize: "1.05rem",
          cursor: "pointer",
          width: "100%",
          userSelect: "none",
          boxShadow: "0 3px 8px rgba(58, 96, 255, 0.6)",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a44cc")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brandBlue)}
        onClick={() => setChecklistOpen((o) => !o)}   // <-- toggle open/close
        type="button"
        aria-expanded={checklistOpen}
        aria-controls="ge-checklist-content-mobile"
      >
        {checklistOpen ? "Hide Checklist" : "View Checklist"}
      </button>
    </div>

    {/* MOBILE CHECKLIST MODAL (was missing) */}
    <ChecklistModal
      open={checklistOpen}
      onClose={() => setChecklistOpen(false)}
      brandBlue={brandBlue}
    >
      <ChecklistToggleContent
        geRequirements={geRequirements}
        classesTaken={classesTaken}
        classToAreas={classToAreas}
        c1c2Fulfilled={c1c2Fulfilled}
        /* on mobile: pick area + close modal + scroll to finder */
        scrollToArea={scrollAndClose}
      />
    </ChecklistModal>
  </>
)}
 {/* NEW: Mobile-only finder below the progress bar */}
 {isMobile && (
  <div ref={finderRef}>
<SJSUMobileFinder
 onMobileTableOpen={() => setMobileTableOpen(true)}
  onMobileTableClose={() => setMobileTableOpen(false)}
  geRequirements={geRequirements}
classDetails={safeClassDetails}
  classesTaken={classesTaken}
  addClass={addClass}
  onDeleteClass={deleteClass}
  search={search}

  setSearch={setSearch}
  classToAreas={classToAreas}
  selectedArea={mobileArea}
  onSelectArea={setMobileArea}
  findEasiestClasses={findEasiestClasses}
  easiestResults={easiestResults}
/>
  </div>
)}

  {/* Checklist Toggle + Content on Mobile */}
{!isMobile && (
  <>
    {/* Checklist grid (always visible) */}
    <div id="ge-checklist-content" style={{ marginTop: 8 }}>
      <ChecklistToggleContent
        geRequirements={geRequirements}
        classesTaken={classesTaken}
        classToAreas={classToAreas}
        c1c2Fulfilled={c1c2Fulfilled}
        scrollToArea={scrollToArea}
      />
    </div>
  </>
)}

</section>
{!isMobile && (
  <section
    style={{
      backgroundColor: "#fff",
      padding: "20px 24px",
      borderRadius: 20,
      boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
      width: "100%",
      maxWidth: 1200,
      margin: "0 auto 32px",
      boxSizing: "border-box",
    }}
    aria-label="Search courses and professors"
  >
    <h2
      className="ge-section-title"
      style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}
    >
      <FiSearch aria-hidden="true" /> Search
    </h2>

    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 10,
        position: "relative",
      }}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search courses"
        aria-label="Search courses"
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

{desktopSearchResults.length > 0 && (
  <ul
    style={{
      listStyle: "none",
      margin: 0,
      padding: 8,
      border: "1px solid #d1d5db",
      borderTop: "none",
      maxHeight: 260,
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
    {desktopSearchResults.map((obj) => (
      <li
        key={obj.className}
        style={{
          padding: "10px 12px",
          cursor: "pointer",
          borderBottom: "1px solid #eee",
          fontWeight: 600,
          color: "#222",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          const chosenArea = chooseAreaForClassDesktop(obj.className);
          if (addClass) {
            addClass(obj.className, chosenArea);
          }
          setSearch("");
        }}
      >
        <strong>{obj.className}</strong>{" "}
        <span style={{ color: "#666" }}>
          {(classToAreas[obj.className] || []).join(", ") || "—"}
        </span>
      </li>
    ))}
  </ul>
)}

    </div>
  </section>
)}


{!isMobile && (
  <>
    {/* Classes Taken */}
<div
  className={`mobile-main-column ${mobileTableOpen ? "mobile-table-open" : ""}`}
  style={{ display: "flex", flexDirection: "column", gap: "32px" }}
>

      <div
        style={{
  width: "100%",
 maxWidth: 1200,
          margin: "32px auto 0",
          userSelect: "text",
          textAlign: "left",
          backgroundColor: "#fff",
          padding: "20px 24px",
          borderRadius: 20,
          boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
          boxSizing: "border-box",
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
          key={`${obj.className}::${obj.area || "NA"}`}
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
            onClick={() => onDeleteClass(obj)}
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
      


 {/* Area cards grid */}
    <div
      className="ge-card-grid mobile-order-5"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 48,
        width: "100%",
        maxWidth: 1200,
         margin: `32px auto ${isMobile ? 0 : 32}px`, // +32px below on desktop only
        justifyItems: "stretch",
      }}
    >
      {geRequirements.map((areaObj) => {
            const isSelected = selectedArea === areaObj.area;
            const isAreaOpen = openAreas.has(areaObj.area);
          const filteredClasses = Array.isArray(areaObj.classes)
  ? areaObj.classes.filter((cls) =>
      classDetails.some((d) => classMatchesArea(d.className, [cls]))
    )
  : [];


            const classesForArea = classesTaken.filter((obj) => {
              const areas = 
                classToAreas[obj.className] || 
                classToAreas[obj.className.split(" - ")[0]] || [];
              return areas.includes(areaObj.area);
            });

            let isFulfilled = false;
            if (
              areaObj.area === "C1 Arts" ||
              areaObj.area === "C2 Humanities"
            ) {
              isFulfilled = c1c2Fulfilled;
            } else if (areaObj.area === "D. Social Sciences") {
              isFulfilled = classesForArea.length >= 2;
            } else {
              const requiredCount = areaObj.requiredCount || 1;
              isFulfilled = classesForArea.length >= requiredCount;
            }

            return (
          <div  
  key={areaObj.area}
  ref={areaRefs.current[areaObj.area]}
  className="ge-card"
onClick={() => {
  if (selectedArea === areaObj.area) {
    // If already selected, deselect it
    setSelectedArea(null);
    setOpenAreas(prev => {
      const next = new Set(prev);
      next.delete(areaObj.area);
      return next;
    });
  } else {
    // Otherwise, scroll to it using your scrollToArea function
    scrollToArea(areaObj.area);
  }
}}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      setSelectedAllClass(null);
      setOverlayMode("all");
      setSelectedArea(prev => (prev === areaObj.area ? null : areaObj.area));
    }
  }}
  tabIndex={0}
                style={{
                  backgroundColor: "#fff",
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
                  transition: "border-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = brandBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isFulfilled ? brandBlue : "#ccc";
                }}
                aria-expanded={isAreaOpen}
              >
                {/* Card Header */}
                <div
                  style={{
                    marginBottom: 20,
                  }}
                >
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
                  <span
                    aria-hidden="true"
                    style={{ fontSize: "1rem", fontWeight: "bold", color: "#666" }}
                  >
                    {isAreaOpen ? "▲" : "▼"}
                  </span>
                </div>

                {/* Button Row */}
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
             <button
  className="find-easiest-btn"
  onClick={(e) => {
    e.stopPropagation();
    scrollTargetRef.current = areaObj.area;
    setSelectedAllClass(null);          // clear detail view
    setSelectedArea(areaObj.area);
    setOverlayMode("easiest");
    findEasiestClasses(areaObj.area);
  }}


                    type="button"
                    style={{
                      backgroundColor: brandBlue,
                      border: "none",
                      borderRadius: 16,
                      color: "#fff",
                      padding: "10px 26px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(58, 96, 255, 0.5)",
                      userSelect: "none",
                      minWidth: 140,
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#2a44cc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = brandBlue;
                    }}
                    aria-label={`Find easiest classes for ${areaObj.area}`}
                  >
                    Find Easiest Classes
                  </button>

                  <button
                    className="see-all-options-btn"
                // View All Options
onClick={(e) => {
  e.stopPropagation();
  scrollTargetRef.current = areaObj.area;
  setSelectedArea(areaObj.area);
  setOverlayMode("all");
}}


                    tabIndex={0}
                    type="button"
                    style={{
                      backgroundColor: "transparent",
                      border: `2px solid ${brandBlue}`,
                      borderRadius: 16,
                      color: brandBlue,
                      padding: "10px 26px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      userSelect: "none",
                      minWidth: 140,
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = brandBlue;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = brandBlue;
                    }}
                    aria-label={`View all class options for ${areaObj.area}`}
                  >
                    View All Options
                  </button>
                </div>

             {/* ==== OVERLAY: Easiest (prof name is RMP link, no RMP Link col) ==== */}
{isSelected && overlayMode === "easiest" && (() => {
  // always key off this card's area, not selectedArea
  const currentEasiest = easiestResults[areaObj.area] || [];

  return (
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{areaObj.area} Easiest</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOverlayMode("all");
            }}
            style={{
              background: "transparent",
              border: `2px solid ${brandBlue}`,
              borderRadius: 10,
              color: brandBlue,
              padding: "6px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View all
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedArea(null);
            }}
            style={{
              background: "transparent",
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

      <div style={{ overflow: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 760,
            borderCollapse: "collapse",
            border: "1px solid #e0e5ff",
            borderRadius: 12,
            overflow: "hidden",
            fontSize: "0.78rem",
          }}
        >
          <thead>
            <tr>
              <th style={thGrid}>Class</th>
              <th style={thGrid}>Professor</th>
              <th style={thGrid}>Schedule</th>
              <th style={{ ...thGrid, textAlign: "center" }}>RMP</th>
              <th style={{ ...thGrid, textAlign: "center" }}>Diff</th>
              <th style={{ ...thGridLast, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEasiest.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 12, textAlign: "center" }}>
                  No easiest classes for this area.
                </td>
              </tr>
            ) : (
              currentEasiest.map((row) => {
                const lines = getScheduleLines(row);
                const rmpLink =
                  row.rmpLink && row.rmpLink !== "N/A"
                    ? row.rmpLink
                    : row.link && row.link !== "N/A"
                    ? row.link
                    : null;
                const rmpScoreRaw =
                  row.rmpScore ??
                  row.score ??
                  row.rating ??
                  row.rmp ??
                  row.RMPScore ??
                  null;
                const rmpScore =
                  typeof rmpScoreRaw === "number"
                    ? rmpScoreRaw.toFixed(1)
                    : rmpScoreRaw || "N/A";
                const taken = classesTaken.some(
                  (t) => t.className === row.className && (t.area === areaObj.area || !t.area)
                );
                const toDelete =
                  classesTaken.find(
                    (t) => t.className === row.className && (t.area === areaObj.area || !t.area)
                  ) || { className: row.className, area: areaObj.area };

                return (
                  <tr key={`${row.className}-${row.professor || "NA"}`}>
                    <td style={tdGrid}>
                      <strong>{row.className}</strong>
                    </td>
                    <td style={tdGrid}>
                      {rmpLink ? (
                        <a
                          href={rmpLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ fontWeight: 700, textDecoration: "underline" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.professor || "N/A"}
                        </a>
                      ) : (
                        <span style={{ fontWeight: 700 }}>
                          {row.professor || "N/A"}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdGrid, fontSize: "0.7rem" }}>
                      {lines.length
                        ? lines.map((l, i) => <div key={i}>{l}</div>)
                        : "N/A"}
                    </td>
                    <td style={{ ...tdGrid, textAlign: "center" }}>{rmpScore}</td>
                    <td style={{ ...tdGrid, textAlign: "center" }}>
                      {typeof row.difficulty === "number" ? row.difficulty : "N/A"}
                    </td>
                    <td style={{ ...tdGridLast, textAlign: "right" }}>
                      {taken ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClass(toDelete);
                          }}
                          style={{
                            background: "#d32f2f",
                            color: "#fff",
                            border: 0,
                            borderRadius: 10,
                            padding: "4px 10px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addClass(row.className, areaObj.area);
                          }}
                          style={{
                            background: "#20a7ef",
                            color: "#fff",
                            border: 0,
                            borderRadius: 10,
                            padding: "4px 10px",
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
})()}

                  {/* ==== OVERLAY: All Options (80/20 with right-aligned Add) ==== */}
{isSelected && overlayMode === "all" && (
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
      zIndex: 5,
      display: "grid",
      gridTemplateRows: "auto 1fr",
      gap: 12,
      overflow: "hidden",
    }}
  >
    {/* Header */}
    {selectedAllClass ? (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{areaObj.area} — Class Details</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedAllClass(null); }}
            type="button"
            style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
          >
            Back
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedArea(null); }}
            type="button"
            style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
          >
            Close
          </button>
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{areaObj.area} — All Options</h3>
        <div style={{ display: "flex", gap: 8 }}>
<button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedAllClass(null);          // make sure we do not stay in detail mode
    setOverlayMode("easiest");
    findEasiestClasses(areaObj.area);
  }}
            type="button"
            style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
          >
            Easiest
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedArea(null); }}
            type="button"
            style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
          >
            Close
          </button>
        </div>
      </div>
    )}

  <div
  style={{
    overflowX: "auto",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    maxWidth: "100%",
    paddingRight: 4,
  }}
>
{selectedAllClass ? (
  (() => {
    const match = classDetails.find((d) =>
      classMatchesArea(d.className, [selectedAllClass])
    );
    const nameToUse = match ? match.className : selectedAllClass;
    return (
      <div style={{ padding: 4 }}>
        <ProfessorTable
          className={nameToUse}
          classDetails={safeClassDetails}
          compact
          key={nameToUse}
        />
      </div>
    );
  })()
) : (
  (() => {
    const allOptions =
      (geRequirements.find(a => a.area === selectedArea)?.classes || [])
        .filter(cls => classDetails.some(d => classMatchesArea(d.className, [cls])));

    return (
      <table
        style={{
          ...grid.table,
          borderColor: "#e0e5ff",
          minWidth: 560,
          width: "100%",
          tableLayout: "fixed",
          fontSize: "0.78rem",
          lineHeight: 1.15,
        }}
      >
        <colgroup>
          <col style={{ width: "85%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={thGrid}>Class</th>
            <th style={{ ...thGridLast, textAlign: "right" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {allOptions.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ padding: 12, textAlign: "center", color: "#888" }}>
                No classes available for this area.
              </td>
            </tr>
          ) : (
            allOptions.map((cls) => {
              const taken = classesTaken.some(
                t => t.className === cls && (t.area === selectedArea || !t.area)
              );
              const toDelete =
                classesTaken.find(
                  t => t.className === cls && (t.area === selectedArea || !t.area)
                ) || { className: cls, area: selectedArea };

              return (
                <tr key={`${selectedArea}::${cls}`}>
                  <td
                    style={{
                      ...tdGrid,
                      padding: "8px 10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title={cls}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAllClass(cls); // open details table
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span>{cls}</span>
                      <span aria-hidden="true" style={{ fontSize: "1.1rem", lineHeight: 1 }}>▾</span>
                    </span>
                  </td>
                  <td style={{ ...tdGridLast, textAlign: "right" }}>
                    {taken ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteClass(toDelete); }}
                        type="button"
                        style={{
                          background: "#d32f2f",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          padding: "4px 10px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); addClass(cls, selectedArea); }}
                        type="button"
                        style={{
                          background: "#20a7ef",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          padding: "4px 10px",
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
              );
            })
          )}
        </tbody>
      </table>
    );
  })()
)}

</div>

  </div>
)}

                        </div>
            );
          })}
        </div>
      </div>
    </>
  )}
</div>
);
}
