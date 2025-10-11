import React, { useState, useEffect, useRef } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Cookies from "js-cookie";
import './GETracker.css';
import { FiSearch } from "react-icons/fi";
import { LuTarget } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineXCircle } from "react-icons/hi";



function useIsMobile(max = 700) {
  const [m, setM] = useState(
    typeof window !== "undefined" ? window.innerWidth <= max : false
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width:${max}px)`);
    const onChange = () => setM(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange) || mq.addListener(onChange);
    return () =>
      mq.removeEventListener?.("change", onChange) || mq.removeListener(onChange);
  }, [max]);
  return m;
}

function ChecklistModal({ open, onClose, children, brandBlue = "#20A7EF" }) {
  const isMobile = useIsMobile(700); // <— add this

  const topOffset = "calc(env(safe-area-inset-top, 0px) + 70px)";

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
        // anchor to top on mobile, center on desktop
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "center",
        padding: 16,
        // ensure we respect the notch/status bar on iOS
        paddingTop: isMobile ? "env(safe-area-inset-top, 0px)" : 16,
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
          // key: push it down on mobile
          marginTop: isMobile ? topOffset : 0,
          // remove the old translate
          // transform: isMobile ? "translateY(32px)" : undefined,
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

function ChecklistToggleContent({ geRequirements, classesTaken, classToAreas, c1c2Fulfilled, scrollToArea }) {
  const checklistData = geRequirements.map((req) => {
    const area = req.area;
    const taken = classesTaken.filter((c) => {
      const mappedAreas = classToAreas[c.className] || [];
      return mappedAreas.includes(area);
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
function ProgressSummary({ geRequirements, classesTaken, classToAreas, c1c2Fulfilled, isMobile }) {
  const totalReqs = geRequirements.length;
  const fulfilledCount = geRequirements.reduce((count, req) => {
    const area = req.area;
    const taken = classesTaken.filter((c) => {
      const mappedAreas = classToAreas[c.className] || [];
      return mappedAreas.includes(area);
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
// Mobile: checklist button right after progress, before search

const padTight   = { padding: "6px 8px" };
const padTightL  = { padding: "6px 6px 6px 8px" };  // tighter on left edge
const padTightR  = { padding: "6px 8px 6px 6px" };  // tighter on right edge

// ——— Mobile Finder (SJSU) ———
// Replaces the entire previous SJSUMobileFinder
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
}) {
const isMobile = useIsMobile(700);
  const brandBlue = "#20A7EF";
const edge = { width: "100%", boxSizing: "border-box", marginInline: 0 };
  // Selected GE area + which panel is showing
  const [area, setArea] = React.useState(selectedArea || geRequirements?.[0]?.area || "");
React.useEffect(() => {
  if (selectedArea && selectedArea !== area) setArea(selectedArea);
}, [selectedArea]);
  const [overlayMode, setOverlayMode] = React.useState("all"); // "all" | "easiest"
  const [selectedAllClass, setSelectedAllClass] = React.useState(null);

  // Easiest data cache
  const [easiestResults, setEasiestResults] = React.useState({});
  const [easiestLoading, setEasiestLoading] = React.useState({});


  // ----- Helpers -----
  const classesWithProfessors = React.useMemo(
    () => new Set(classDetails.map((d) => d.className)),
    [classDetails]
  );

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
    return (areaObj.classes || []).filter((cls) => classesWithProfessors.has(cls));
  }, [area, geRequirements, classesWithProfessors]);

  // After: const allOptionsForArea = React.useMemo(...)

const rowsByClass = React.useMemo(() => {
  const map = new Map();
  for (const d of classDetails) {
    const list = map.get(d.className) || [];
    list.push(d);
    map.set(d.className, list);
  }
  return map;
}, [classDetails]);

const schedulesForClass = React.useCallback((cls) => {
  const entries = rowsByClass.get(cls) || [];
  const uniq = new Set();
  for (const e of entries) {
    getScheduleLines(e).forEach(line => {
      const s = String(line).trim();
      if (s) uniq.add(s);
    });
  }
  return Array.from(uniq);
}, [rowsByClass, getScheduleLines]);

const allRowsForArea = React.useMemo(() => {
  const allowed = new Set(
    (geRequirements.find((a) => a.area === area)?.classes || [])
  );

  return classDetails
    .filter((d) => allowed.has(d.className))
    .map((d) => ({
      ...d,
      rmpLink:
        d.rmpLink ?? (d.link && d.link !== "N/A" ? d.link : null),
      rmpScore:
        d.rmpScore ?? d.score ?? d.rating ?? d.rmp ?? d.RMPScore ?? null,
    }))
    .sort((a, b) => {
      if (a.className !== b.className) {
        return a.className.localeCompare(b.className);
      }
      const ad = typeof a.difficulty === "number" ? a.difficulty : Infinity;
      const bd = typeof b.difficulty === "number" ? b.difficulty : Infinity;
      return ad - bd;
    });
}, [area, geRequirements, classDetails]);

  // Easiest logic (same approach you use elsewhere)
  const findEasiestClasses = React.useCallback((selectedArea) => {
    setEasiestLoading((prev) => ({ ...prev, [selectedArea]: true }));

    const allowedSet = new Set(
      (geRequirements.find((a) => a.area === selectedArea)?.classes || [])
    );

    const allEntries = classDetails.filter(
      (detail) => allowedSet.has(detail.className) && typeof detail.difficulty === "number"
    );

    if (!allEntries.length) {
      setEasiestResults((prev) => ({ ...prev, [selectedArea]: [] }));
      setEasiestLoading((prev) => ({ ...prev, [selectedArea]: false }));
      return;
    }

    allEntries.sort((a, b) => a.difficulty - b.difficulty);
    const cutoff =
      allEntries.length >= 5
        ? allEntries[4].difficulty
        : allEntries[allEntries.length - 1].difficulty;

    const easiest = allEntries
      .filter((c) => c.difficulty <= cutoff)
      .map((c) => ({
        ...c,
        rmpLink: c.rmpLink ?? (c.link && c.link !== "N/A" ? c.link : null),
        rmpScore: c.rmpScore ?? c.score ?? c.rating ?? c.rmp ?? c.RMPScore ?? null,
      }));

    setEasiestResults((prev) => ({ ...prev, [selectedArea]: easiest }));
    setEasiestLoading((prev) => ({ ...prev, [selectedArea]: false }));
  }, [classDetails, geRequirements]);

  // If user switches area while in "easiest", refresh that list
  React.useEffect(() => {
    if (overlayMode === "easiest" && area) {
      findEasiestClasses(area);
    }
  }, [area, overlayMode, findEasiestClasses]);

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
   background: "transparent",   // no inner card
    padding: 0,                   // remove side padding
    borderRadius: 0,
    boxShadow: "none",
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto 24px",
    boxSizing: "border-box",
    position: "relative"
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const chosenArea = chooseAreaForClass(obj.className);
            onAddClass(obj.className, chosenArea);
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

      {/* Pick GE Area */}
 <div style={{ ...edge, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, marginBottom: 12 }}>
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
 <div style={{ ...edge, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: "0.8rem" }}>
            {area} — {selectedAllClass ? "Class Details" : (overlayMode === "easiest" ? "Easiest" : "All Options")}
          </h3>
         <div style={{ display: "flex", gap: 8 }}>
  {/* Show "View All" only when not already on All and not in details */}
  {overlayMode !== "all" && !selectedAllClass && (
    <button
      type="button"
      onClick={() => setOverlayMode("all")}
      style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 8, color: brandBlue, padding: "6px 10px", fontWeight: 700 }}
    >
      View All
    </button>
  )}

  {/* Show "Easiest" only when not already on Easiest and not in details */}
 {overlayMode !== "easiest" && !selectedAllClass && (
 <button
  onClick={(e) => { e.stopPropagation(); setOverlayMode("easiest"); findEasiestClasses(area); }}
  type="button"
  style={{
    background: brandBlue,       // filled
    border: "none",
    borderRadius: 10,
    color: "#fff",
    padding: "6px 12px",
    fontWeight: 700,
    cursor: "pointer",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a44cc")}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brandBlue)}
>
  Easiest
</button>

)}


  {/* In details mode, only show Back */}
  {selectedAllClass && (
    <button
      type="button"
      onClick={() => setSelectedAllClass(null)}
      style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 8, color: brandBlue, padding: "6px 10px", fontWeight: 700 }}
    >
      Back
    </button>
  )}
</div>

        </div>

        {/* Body */}
        <div style={{ overflow: "auto", paddingRight: 12, maxHeight: 420 }}>
{selectedAllClass ? (
  /* === DETAILS (unchanged) === */
  <div
    style={{
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      overscrollBehaviorX: "contain",
      touchAction: "pan-x",
      paddingBottom: 2,
    }}
  >
    <table
      style={{
        width: "max-content",
        tableLayout: "fixed",
        borderCollapse: "collapse",
        border: "1.5px solid #e0e5ff",
        borderRadius: 12,
        overflow: "hidden",
        fontSize: isMobile ? "0.9rem" : "0.95rem",
      }}
    >
    <colgroup>
  <col style={{ width: 200 }} />  {/* Professor (was 220) */}
  <col style={{ width: 56 }} />   {/* RMP (was 64) */}
  <col style={{ width: 56 }} />   {/* Diff (was 60) */}
  <col style={{ width: 150 }} />  {/* Schedule (was 320) */}
  <col style={{ width: 72 }} />   {/* Action (was 90) */}
</colgroup>


      <thead>
        <tr>
          <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Professor</th>
          <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>RMP</th>
          <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Diff</th>
          <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Schedule</th>
          <th style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Action</th>
        </tr>
      </thead>

      <tbody>
        {classDetails
          .filter((row) => row.className === selectedAllClass)
          .map((row, i) => {
            const rmpLink =
              row.rmpLink ?? (row.link && row.link !== "N/A" ? row.link : null);
            const rmpScoreRaw =
              row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? null;
            const rmpScore =
              typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");
            const lines = getScheduleLines(row);

            const taken = classesTaken.some(
              (t) => t.className === row.className && (t.area === area || !t.area)
            );
            const toDelete =
              classesTaken.find(
                (t) => t.className === row.className && (t.area === area || !t.area)
              ) || { className: row.className, area };

            return (
              <tr key={`${row.className}-${row.professor || "NA"}-${i}`}>
                {/* Professor */}
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", whiteSpace: "nowrap" }}>
                  {rmpLink ? (
                    <a
                      href={rmpLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ fontWeight: 700, textDecoration: "underline" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.professor || "—"}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
                  )}
                </td>

                {/* RMP */}
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                  {rmpScore}
                </td>

                {/* Difficulty */}
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                  {typeof row.difficulty === "number" ? row.difficulty : "—"}
                </td>

                {/* Schedule */}
                <td
                  style={{
                    padding: "10px 12px",
                    borderTop: "1px solid #e0e5ff",
                    fontSize: ".8rem",
                    color: "#555",
                    lineHeight: 1.25,
                  }}
                >
                  {lines.length ? (
                    lines.map((l, idx) => (
                      <div
                        key={idx}
                        title={l}
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {l}
                      </div>
                    ))
                  ) : (
                    "—"
                  )}
                </td>

                {/* Action */}
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "right", whiteSpace: "nowrap" }}>
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
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddClass(row.className, area); }}
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
  </div>
) : overlayMode === "easiest" ? (
   <div
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
        width: "max-content",
        tableLayout: "fixed",
        borderCollapse: "collapse",
        border: "1.5px solid #e0e5ff",
        borderRadius: 12,
        overflow: "hidden",
        fontSize: isMobile ? "0.9rem" : "0.95rem",
      }}
    >
   <colgroup>
  <col style={{ width: isMobile ? 210 : 240 }} /> // Class
  <col style={{ width: isMobile ? 140 : 160 }} /> // Professor
  <col style={{ width: isMobile ? 56  : 64  }} /> // RMP
  <col style={{ width: isMobile ? 56  : 60  }} /> // Diff
  <col style={{ width: isMobile ? 150 : 320 }} /> // Schedule
  <col style={{ width: isMobile ? 72  : 90  }} /> // Action
</colgroup>


      <thead>
        <tr>
          <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Class</th>
          <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Professor</th>
          <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>RMP</th>
          <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Diff</th>
          <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Schedule</th>
          <th style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Action</th>
        </tr>
      </thead>

      <tbody>
        {(easiestResults[area] || []).length === 0 ? (
          <tr>
            <td colSpan={6} style={{ padding: "12px 14px", textAlign: "center", color: "#666" }}>
              No classes found.
            </td>
          </tr>
        ) : (
          (easiestResults[area] || []).map((row, i) => {
            const rmpLink =
              row.rmpLink ?? (row.link && row.link !== "N/A" ? row.link : null);
            const rmpScoreRaw =
              row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? null;
            const rmpScore =
              typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");
            const lines = getScheduleLines(row);

            const taken = classesTaken.some(
              (t) => t.className === row.className && (t.area === area || !t.area)
            );
            const toDelete =
              classesTaken.find(
                (t) => t.className === row.className && (t.area === area || !t.area)
              ) || { className: row.className, area };

            return (
              <tr key={`${row.className}-${row.professor || "NA"}-${i}`}>
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", whiteSpace: "nowrap", fontWeight: 600 }}>
                  {row.className}
                </td>
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", whiteSpace: "nowrap" }}>
                  {rmpLink ? (
                    <a
                      href={rmpLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ fontWeight: 700, textDecoration: "underline" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.professor || "—"}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
                  )}
                </td>
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                  {rmpScore}
                </td>
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                  {typeof row.difficulty === "number" ? row.difficulty : "—"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    borderTop: "1px solid #e0e5ff",
                    fontSize: ".8rem",
                    color: "#555",
                    lineHeight: 1.25,
                  }}
                >
                  {lines.length ? (
                    lines.map((l, idx) => (
                      <div
                        key={idx}
                        title={l}
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {l}
                      </div>
                    ))
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "right", whiteSpace: "nowrap" }}>
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
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddClass(row.className, area); }}
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
          })
        )}
      </tbody>
    </table>
  </div>
) : (
  /* === VIEW ALL (move your current table here) === */
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
    <colgroup>
      <col />
      <col style={{ width: "1%" }} />
    </colgroup>
    <thead>
      <tr>
        <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #222", background: "#fafbff" }}>
          Class
        </th>
        <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid #222", background: "#fafbff", paddingRight: 16 }}>
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
                fontSize: "clamp(0.82rem, 2.6vw, 0.95rem)",
                lineHeight: 1.2,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                cursor: "pointer",
              }}
              title={cls}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAllClass(cls);
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span>{cls}</span>
                <span aria-hidden="true" style={{ fontSize: "1.2rem", lineHeight: 1 }}>▾</span>
              </span>
</td>
              {/* If you want the preview lines under the title, keep this block; if not, remove it */}

            <td style={{ padding: "10px 12px", borderTop: "1px solid #222", textAlign: "right" }}>
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
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddClass(cls, area); }}
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
  // Include only props that come from parent, NOT local state variables or their setters:
  // For example, do NOT destructure these here since you manage them locally:
  // openAreas,
  // openMenus,
  // easiestResults,
  // easiestLoading,
  // a1TextVisible,
  // checklistOpen,
  // openAllOptions,
  // scrollToArea,
  // toggleEasiestClasses,
  // getClassKey,
  // classesWithProfessors,
  // classToAreas,
  // c1c2Count,
  // handleAreaCardClick,
  // handleClassClick,
  // setChecklistOpen,
  // areaRefs,
}) {
   const brandBlue = "#20A7EF";
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
geRequirements.forEach(req => {
  if (!areaRefs.current[req.area]) {
    areaRefs.current[req.area] = React.createRef();
  }
});
// below: const areaRefs = useRef({}) …
const finderRef = useRef(null);

const scrollToFinder = () => {
  // wait a frame so the modal can close first
  requestAnimationFrame(() => {
    if (!finderRef.current) return;
    const rect = finderRef.current.getBoundingClientRect();
    const y = rect.top + window.scrollY - window.innerHeight * 0.15; // 15% from top
    window.scrollTo({ top: y, behavior: "smooth" });
  });
};

const scrollToArea = (area) => {
  const ref = areaRefs.current[area];
  if (ref && ref.current) {
    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // Calculate scroll position so element is 10% from top of viewport
    const y = rect.top + scrollTop - window.innerHeight * 0.2 ;

    window.scrollTo({ top: y, behavior: 'smooth' });

    // Open the area if not already open
    setOpenAreas(prev => {
      if (prev.has(area)) return prev;
      const newSet = new Set(prev);
      newSet.add(area);
      return newSet;
    });
  }
};
const scrollAndClose = (area) => {
  setMobileArea(area);       // set filter
  setChecklistOpen(false);   // close modal
  scrollToFinder();          // smooth-scroll to finder/results
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
  const findEasiestClasses = (area) => {     
    setEasiestLoading((prev) => ({ ...prev, [area]: true }));

    const classes = geRequirements.find((a) => a.area === area)?.classes || [];

    const allEntries = classDetails.filter(
      (detail) =>
        classes.includes(detail.className) &&
        typeof detail.difficulty === "number"
    );


    if (!allEntries.length) {
      setEasiestResults((prev) => ({ ...prev, [area]: [] }));
      setEasiestLoading((prev) => ({ ...prev, [area]: false }));
      return;
    }

    allEntries.sort((a, b) => a.difficulty - b.difficulty);

    const cutoffDifficulty =
      allEntries.length >= 5
        ? allEntries[4].difficulty
        : allEntries[allEntries.length - 1].difficulty;

const easiest = allEntries
  .filter(c => c.difficulty <= cutoffDifficulty)
  .map(c => ({
    ...c,
    rmpLink: c.link && c.link !== "N/A" ? c.link : null,
  }));

   
setEasiestResults(prev => ({ ...prev, [area]: easiest }));
setEasiestLoading(prev => ({ ...prev, [area]: false }));
  };

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
    classDetails.map((entry) => entry.className)
  );

  const classToAreas = React.useMemo(() => {
   const map = {};
   (geRequirements || []).forEach((areaObj) => {
     (areaObj.classes || []).forEach((className) => {
       if (!map[className]) map[className] = [];
       map[className].push(areaObj.area);
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
    newSet.has(area) ? newSet.delete(area) : newSet.add(area);
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
      geRequirements={geRequirements}
      classDetails={classDetails}
      classesTaken={classesTaken}
      onAddClass={onAddClass}
      onDeleteClass={onDeleteClass}
      search={search}
      setSearch={setSearch}
      classToAreas={classToAreas}
      selectedArea={mobileArea}
      onSelectArea={setMobileArea}
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
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const chosenArea = chooseAreaForClassDesktop(obj.className);
                onAddClass(obj.className, chosenArea);
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
  </section>
)}


{!isMobile && (
  <>
    {/* Classes Taken */}
    <div
      className="mobile-main-column"
      style={{ display: "flex", flexDirection: "column", gap: 32 }}
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
              ? areaObj.classes.filter((cls) => classesWithProfessors.has(cls))
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
    handleAreaCardClick(areaObj.area);     // keep your existing behavior if you still use the arrow
    setSelectedAllClass(null);             // reset any open class detail
    setOverlayMode("all");                 // default overlay
    setSelectedArea(prev => (prev === areaObj.area ? null : areaObj.area));
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
              // Find Easiest Classes
onClick={(e) => {
  e.stopPropagation();
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
{isSelected && overlayMode === "easiest" && (
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
      <h3 style={{ margin: 0, fontSize: "1rem" }}>{areaObj.area} — Easiest</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setOverlayMode("all"); }}
          type="button"
          style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          View All
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

    <div style={{ overflow: "auto", paddingRight: 6 }}>
     <table style={{ ...grid.table, borderColor: "#e0e5ff" }}>
  <colgroup>
    <col style={{ width: "34%" }} />
    <col style={{ width: "20%" }} />
    <col style={{ width: "26%" }} />
    <col style={{ width: "8%" }} />
    <col style={{ width: "8%" }} />
    <col style={{ width: "4%" }} />
  </colgroup>

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
    {(easiestResults[selectedArea] || []).map((row) => {
      const rmpLink =
        row.rmpLink && row.rmpLink !== "N/A" ? row.rmpLink : null;
      const rmpScoreRaw =
        row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? row.RMP ?? null;
      const rmpScore =
        typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");

      const lines = getScheduleLines(row);

      return (
        <tr key={`${row.className}-${row.professor || "NA"}`}>
          <td style={tdGrid}>
            <span style={{ fontWeight: 600 }}>{row.className}</span>
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
                {row.professor || "—"}
              </a>
            ) : (
              <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
            )}
          </td>

          <td
            style={{
              ...tdGrid,
              fontSize: isMobile ? "0.68rem" : "0.78rem",
              color: "#555",
              lineHeight: 1.25,
            }}
          >
            {lines.length
              ? lines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: /^(Mo|Tu|We|Th|Fr|Sa|Su)/.test(line)
                        ? "nowrap"
                        : "normal",
                      wordBreak: "keep-all",
                    }}
                    title={line}
                  >
                    {line}
                  </div>
                ))
              : "—"}
          </td>

          <td style={{ ...tdGrid, padding: "6px 8px", textAlign: "center" }}>
            {rmpScore}
          </td>

          <td style={{ ...tdGrid, padding: "6px 8px", textAlign: "center" }}>
            {typeof row.difficulty === "number" ? row.difficulty : "—"}
          </td>

       <td style={{ ...tdGridLast, textAlign: "right" }}>
  {(() => {
    const taken = classesTaken.some(
      (t) => t.className === row.className && (t.area === areaObj.area || !t.area)
    );
    if (taken) {
      const toDelete = classesTaken.find(
        (t) => t.className === row.className && (t.area === areaObj.area || !t.area)
      );
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClass(toDelete || { className: row.className, area: areaObj.area });
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
      );
    }
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddClass(row.className, areaObj.area);
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
    );
  })()}
</td>

        </tr>
      );
    })}
  </tbody>
</table>

    </div>
  </div>
)}
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
            onClick={(e) => { e.stopPropagation(); setOverlayMode("easiest"); findEasiestClasses(areaObj.area); }}
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

    {/* Body */}
    <div style={{ overflow: "auto", paddingRight: 6 }}>
      {selectedAllClass ? (
        <div style={{ padding: 4 }}>
          <ProfessorTable className={selectedAllClass} classDetails={classDetails} compact />
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
            fontSize: isMobile ? "0.88rem" : "0.95rem",
          }}
        >
          <colgroup>
            <col style={{ width: "80%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #222", background: "#fafbff" }}>
                Class
              </th>
              <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid #222", background: "#fafbff" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((cls) => (
              <tr key={`${areaObj.area}::${cls}`}>
                <td
                  style={{
                    padding: "10px 12px",
                    borderTop: "1px solid #222",
                    fontWeight: 700,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    cursor: "pointer",
                  }}
                  title={cls}
                  onClick={(e) => { e.stopPropagation(); setSelectedAllClass(cls); }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span>{cls}</span>
                    <span aria-hidden="true">▼</span>
                  </span>
                </td>
             <td style={{ padding: "10px 12px", borderTop: "1px solid #222", textAlign: "right" }}>
  {(() => {
    const taken = classesTaken.some(
      (t) => t.className === cls && (t.area === areaObj.area || !t.area)
    );
    if (taken) {
      const toDelete = classesTaken.find(
        (t) => t.className === cls && (t.area === areaObj.area || !t.area)
      );
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClass(toDelete || { className: cls, area: areaObj.area });
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
      );
    }
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddClass(cls, areaObj.area);
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
    );
  })()}
</td>

              </tr>
            ))}
          </tbody>
        </table>
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
