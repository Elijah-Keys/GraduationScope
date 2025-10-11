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
function ChecklistModal({
  open,
  onClose,
  children,
  brandBlue = "#20A7EF",
  mobileOffset = 32, // px
}) {
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
          transform: isMobile ? `translateY(${mobileOffset}px)` : undefined,
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
}) {
  const brandBlue = "#20A7EF";
  const edge = { width: "100%", boxSizing: "border-box", marginInline: 0 };

  const [area, setArea] = React.useState(selectedArea || geRequirements?.[0]?.area || "");
  React.useEffect(() => { if (selectedArea && selectedArea !== area) setArea(selectedArea); }, [selectedArea]);

  const [overlayMode, setOverlayMode] = React.useState("all"); // "all" | "easiest"
  const [selectedAllClass, setSelectedAllClass] = React.useState(null);
  const [easiestResults, setEasiestResults] = React.useState({});
  const [easiestLoading, setEasiestLoading] = React.useState({});
  // at top of GETracker (Chico), after other useState/useRef


// put this near the top of your component (after hooks)
const renderAddDelete = (className, areaName) => {
  const taken = classesTaken.some(
    (t) => t.className === className && (!t.area || t.area === areaName)
  );
  return taken ? (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDeleteClass({ className, area: areaName });
      }}
      type="button"
      style={{ background:"#d32f2f", color:"#fff", border:"none", borderRadius:10, padding:"4px 10px", fontSize:"0.85rem", fontWeight:700, cursor:"pointer" }}
    >
      Delete
    </button>
  ) : (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAddClass(className, areaName);
      }}
      type="button"
      style={{ background:"#20a7ef", color:"#fff", border:"none", borderRadius:10, padding:"4px 10px", fontSize:"0.85rem", fontWeight:700, cursor:"pointer" }}
    >
      Add
    </button>
  );
};


  const classesWithProfessors = React.useMemo(
    () => new Set(classDetails.map((d) => d.className)),
    [classDetails]
  );
// ---- SCHEDULE HELPERS (local to SJSUMobileFinder)
// ---- SCHEDULE HELPERS (local to SJSUMobileFinder) ----
// Use function declarations (hoisted) + unique names to avoid TDZ/scope issues.
function getScheduleLinesLocal(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.schedules) && entry.schedules.length) return entry.schedules;
  if (Array.isArray(entry.schedule) && entry.schedule.length) return entry.schedule;
  if (Array.isArray(entry.sections) && entry.sections.length) return entry.sections;

  const raw = entry.schedule || entry.time || entry.days || "";
  if (!raw) return [];
  return String(raw).split(/\s*(?:\n|,|;|•|\/|\|)\s*/).filter(Boolean);
}

function getScheduleLinesSafeLocal(row) {
  const base = getScheduleLinesLocal(row);
  if (base && base.length) return base;

  const days  = row?.days || row?.Days || row?.day || row?.Day || "";
  const time  = row?.time || row?.Time || row?.hours || row?.Hours || "";
  const where = row?.location || row?.Location || row?.where || row?.Where || "";

  const combo = [days, time, where]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");

  return combo ? [combo] : [];
}



  // gather all schedule lines for a given class (deduped)
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
    getScheduleLinesSafeLocal(e).forEach((line) => {
      const s = String(line).trim();
      if (s) uniq.add(s);
    });
  }
  return Array.from(uniq);
}, [rowsByClass, getScheduleLinesSafeLocal]);

  const chooseAreaForClass = React.useCallback((className) => {
    const areas = classToAreas[className] || [];
    const takenAreas = new Set(classesTaken.map((c) => c.area));
    return areas.find((a) => !takenAreas.has(a)) || areas[0] || area || geRequirements?.[0]?.area || "";
  }, [classToAreas, classesTaken, area, geRequirements]);

  const allOptionsForArea = React.useMemo(() => {
    const areaObj = geRequirements.find((a) => a.area === area);
    if (!areaObj) return [];
    return (areaObj.classes || []).filter((cls) => classesWithProfessors.has(cls));
  }, [area, geRequirements, classesWithProfessors]);

  const findEasiestClasses = React.useCallback((selected) => {
    setEasiestLoading((prev) => ({ ...prev, [selected]: true }));
    const allowedSet = new Set((geRequirements.find((a) => a.area === selected)?.classes || []));
    const allEntries = classDetails.filter(
      (detail) => allowedSet.has(detail.className) && typeof detail.difficulty === "number"
    );
    if (!allEntries.length) {
      setEasiestResults((p) => ({ ...p, [selected]: [] }));
      setEasiestLoading((p) => ({ ...p, [selected]: false }));
      return;
    }
    allEntries.sort((a, b) => a.difficulty - b.difficulty);
    const cutoff = allEntries.length >= 5 ? allEntries[4].difficulty : allEntries[allEntries.length - 1].difficulty;
    const easiest = allEntries
      .filter((c) => c.difficulty <= cutoff)
      .map((c) => ({
        ...c,
        rmpLink: c.rmpLink ?? (c.link && c.link !== "N/A" ? c.link : null),
        rmpScore: c.rmpScore ?? c.score ?? c.rating ?? c.rmp ?? c.RMPScore ?? null,
      }));
    setEasiestResults((p) => ({ ...p, [selected]: easiest }));
    setEasiestLoading((p) => ({ ...p, [selected]: false }));
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

      {/* Filter by GE Area */}
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

      {/* Panel: All Options / Easiest */}
      <div style={{ ...edge, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: "0.8rem" }}>
            {area} — {selectedAllClass ? "Class Details" : (overlayMode === "easiest" ? "Easiest" : "All Options")}
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
         {overlayMode !== "all" && !selectedAllClass && (
  <button
    type="button"
    onClick={() => { setSelectedAllClass(null); setOverlayMode("all"); }}
    style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 8, color: brandBlue, padding: "6px 10px", fontWeight: 700 }}
  >
    View All
  </button>
)}

        {overlayMode !== "easiest" && !selectedAllClass && (
  <button
    type="button"
    onClick={() => { setOverlayMode("easiest"); findEasiestClasses(area); }}
    style={{
      ...(isMobile && overlayMode === "all"
        ? { background: brandBlue, color: "#fff", border: "none" }       // solid on mobile in View All
        : { background: "transparent", border: `2px solid ${brandBlue}`, color: brandBlue }), // outline otherwise
      borderRadius: 8,
      padding: "6px 10px",
      fontWeight: 700,
    }}
  >
    Easiest
  </button>
)}

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

      <div style={{ overflow: "auto", paddingRight: 12, maxHeight: 420 }}>
{selectedAllClass ? (
  <div style={{ padding: 4, overflowX: "auto" }}>
    <table
      style={{
        width: "800px",                  // let wrapper scroll on narrow screens
        tableLayout: "fixed",
        borderCollapse: "collapse",
        border: "1.5px solid #e0e5ff",
        borderRadius: 12,
        overflow: "hidden",
        fontSize: "0.92rem",
      }}
    >
  <colgroup>
  <col style={{ width: isMobile ? 50 : 240 }} />  {/* Professor (tighter) */}
  <col style={{ width: isMobile ? 20  : 70  }} />  {/* RMP (tighter) */}
  <col style={{ width: isMobile ? 34  : 60  }} />  {/* Diff (tighter) */}
  <col style={{ width: isMobile ? 100 : "25%" }} />{/* Schedule (FIXED on mobile) */}
  <col style={{ width: isMobile ? 30  : 100 }} />  {/* Action (tighter) */}
</colgroup>
      <thead>
        <tr>
          <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Professor</th>
          <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>RMP</th>
          <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Diff</th>
          <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Schedule</th>
          <th style={{ padding: "10px 12px",  textAlign: isMobile ? "left" : "right", borderBottom: "1px solid #e0e5ff", background: "#fafbff",...(isMobile ? { paddingLeft: 6 } : {}), }}>Action</th>
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
            const lines = getScheduleLinesSafeLocal(row);

            return (
              <tr key={`${row.className}-${row.professor || "NA"}-${i}`}>
                {/* Professor */}
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", whiteSpace: "nowrap", ...(isMobile ? { paddingRight: 6 } : null), }}>
                  {rmpLink ? (
                    <a
                      href={rmpLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ fontWeight: 700, textDecoration: "underline" }}
                    >
                      {row.professor || "—"}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
                  )}
                </td>

                {/* RMP */}
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap", ...(isMobile ? { paddingLeft: 6, paddingRight: 4 } : null), }}>
                  {rmpScore}
                </td>

                {/* Diff */}
                <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap", ...(isMobile ? { paddingLeft: 6 } : null), }}>
                  {typeof row.difficulty === "number" ? row.difficulty : "—"}
                </td>

                {/* Schedule (wraps fully) */}
             <td
  style={{
    padding: "10px 12px",
    borderTop: "1px solid #e0e5ff",
    color: "#555",
    lineHeight: 1.25,
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "clip",
    wordBreak: "break-word",
    ...(isMobile ? { paddingLeft: 6, paddingRight: 0, borderRight: "none" } : null), // ⬅️ add paddingRight: 0
  }}
>

                  {lines.length
                    ? lines.map((l, j) => <div key={j}>{l}</div>)
                    : "—"}
                </td>

                {/* Action */}
                <td
  style={{
    padding: "10px 12px",
    borderTop: "1px solid #e0e5ff",
    whiteSpace: "nowrap",
    ...(isMobile
      ? {
          textAlign: "left",   // bring button to the left edge
          paddingLeft: 0,      // remove the gap
          borderLeft: "none",
          width: 0,            // shrink-wrap to content
        }
      : { textAlign: "right" }),
  }}
>
  {renderAddDelete(row.className, area)}
</td>

              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
) : overlayMode === "easiest" ? (

    /* --- Easiest (NEW for mobile) --- */
    <div style={{ padding: 4, overflowX: "auto" }}>
      {easiestLoading[area] ? (
        <div style={{ padding: 12, color: "#555" }}>Loading easiest classes…</div>
      ) : (easiestResults[area] || []).length === 0 ? (
        <div style={{ padding: 12, color: "#555" }}>No difficulty data for this area.</div>
      ) : (
        <table
          style={{
            width: "900px",                 // gives breathing room; wrapper scrolls if needed
            tableLayout: "fixed",
            borderCollapse: "collapse",
            border: "1.5px solid #e0e5ff",
            borderRadius: 12,
            overflow: "hidden",
            fontSize: "0.92rem",
          }}
        >
          <colgroup>
            <col style={{ width: 200 }} />   {/* Class */}
            <col style={{ width: 200 }} />   {/* Professor */}
            <col />                           {/* Schedule (flex) */}
            <col style={{ width: 70 }} />     {/* RMP */}
            <col style={{ width: 60 }} />     {/* Diff */}
            <col style={{ width: 100 }} />    {/* Action */}
          </colgroup>
          <thead>
            <tr>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Class</th>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Professor</th>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Schedule</th>
              <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>RMP</th>
              <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Diff</th>
              <th style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #e0e5ff", background: "#fafbff" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(easiestResults[area] || []).map((row, i) => {
              const rmpLink =
                row.rmpLink ?? (row.link && row.link !== "N/A" ? row.link : null);
              const rmpScoreRaw =
                row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? null;
              const rmpScore =
                typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");
              const lines = getScheduleLinesSafeLocal(row); // ✅ local safe helper

              return (
                <tr key={`${row.className}-${row.professor || "NA"}-${i}`}>
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", fontWeight: 700 }}>
                    {row.className}
                  </td>
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", whiteSpace: "nowrap" }}>
                    {rmpLink ? (
                      <a href={rmpLink} target="_blank" rel="noreferrer noopener" style={{ fontWeight: 700, textDecoration: "underline" }}>
                        {row.professor || "—"}
                      </a>
                    ) : (
                      <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
                    )}
                  </td>

                  {/* ✅ Schedule now wraps to full length (no ellipsis) */}
                  <td
                    style={{
                      padding: "10px 12px",
                      borderTop: "1px solid #e0e5ff",
                      color: "#555",
                      lineHeight: 1.25,
                      whiteSpace: "normal",
                      overflow: "visible",
                      textOverflow: "clip",
                      wordBreak: "break-word",
                    }}
                  >
                    {lines.length ? lines.map((l, j) => (
                      <div key={j}>{l}</div>
                    )) : "—"}
                  </td>

                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                    {rmpScore}
                  </td>
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                    {typeof row.difficulty === "number" ? row.difficulty : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "right", whiteSpace: "nowrap" }}>
                    {renderAddDelete(row.className, area)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  ) : (
  /* rest of the panel */

            /* All Options table — same as San José */
     /* All Options table — NO schedule in the menu */
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
      const taken = classesTaken.some((t) => t.className === cls && (t.area === area || !t.area));
      const toDelete = classesTaken.find((t) => t.className === cls && (t.area === area || !t.area)) || { className: cls, area };

      return (
        <tr key={`${area}::${cls}`}>
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
              <span aria-hidden="true" style={{ fontSize: "1.2rem", lineHeight: 1 }}>▾</span>
            </span>
          </td>
          <td style={{ padding: "10px 12px", borderTop: "1px solid #222", textAlign: "right" }}>
            {taken ? (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteClass(toDelete); }}
                type="button"
                style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 10, padding: "4px 10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
              >
                Delete
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAddClass(cls, area); }}
                type="button"
                style={{ background: "#20a7ef", color: "#fff", border: "none", borderRadius: 10, padding: "4px 10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
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

// Main: Fully self-contained GETracker component
 export default function GETracker({
  geRequirements = chicoGeRequirements,
  classDetails = chicoClassDetails,
  c1c2Fulfilled = false,
  areaCWarning = null,
  university = "chico",
}) {
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

// helpers that use the reactive classesTaken
// helpers that use the reactive classesTaken (robust to "CLASS - Subtitle" vs "CLASS")
const normalize = (s) => (typeof s === "string" ? s.split(" - ")[0].trim() : s);

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
  const term = search.trim().toLowerCase();
  if (!term) {
    setSearchResults([]);
    return;
  }


  const filtered = chicoClassDetails.filter(({ className, professor }) => {
    const classNameLower = className.toLowerCase();
    const professorLower = professor ? professor.toLowerCase() : '';
    return classNameLower.includes(term) || professorLower.includes(term);
  });





  // Deduplicate by className
  const uniqueMap = new Map();
  for (const entry of filtered) {
    // Use className as key; if desired, can use className + professor for finer granularity
    if (!uniqueMap.has(entry.className)) {
      uniqueMap.set(entry.className, entry);
    }
  }
  setSearchResults(Array.from(uniqueMap.values()));
}, [search]);

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

  // Other state from your original component
  const [openAreas, setOpenAreas] = useState(new Set());
  const [openMenus, setOpenMenus] = useState(new Set());
  const [easiestResults, setEasiestResults] = useState({});
  const [easiestLoading, setEasiestLoading] = useState({});
  const [a1TextVisible, setA1TextVisible] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [mobileArea, setMobileArea] = useState(geRequirements?.[0]?.area || "");
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
  const [selectedArea, setSelectedArea] = useState(null);
  // which view to show inside the selected card
const [overlayMode, setOverlayMode] = useState("all"); // "all" | "easiest"
// which class row is expanded in the "All Options" overlay table
const [openRowClass, setOpenRowClass] = useState(null);
// which class is open inside "All Options" (full-width detail)
const [selectedAllClass, setSelectedAllClass] = useState(null);

// quick lookup: first detail row for each class (to read schedule)
const firstDetailByClass = useMemo(() => {
  const m = new Map();
  classDetails.forEach(d => { if (!m.has(d.className)) m.set(d.className, d); });
  return m;
}, [classDetails]);

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
const getScheduleLines = (entry) => {
  if (!entry) return [];
  if (Array.isArray(entry.schedules) && entry.schedules.length) return entry.schedules;
  if (Array.isArray(entry.schedule) && entry.schedule.length) return entry.schedule; // your data often uses this
  if (Array.isArray(entry.sections) && entry.sections.length) return entry.sections;

  const raw = entry.schedule || entry.time || entry.days || "";
  if (!raw) return [];

  // Split common delimiters into separate lines
  const parts = String(raw)
    .split(/\s*(?:\n|,|;|•|\/|\|)\s*/)
    .filter(Boolean);

  return parts.length ? parts : [String(raw)];
};
// Safe schedule normalizer for GETracker scope
const getScheduleLinesSafe = (row) => {
  const base = getScheduleLines(row);
  if (base && base.length) return base;

  // extra fallbacks (common alt keys)
  const days  = row?.days || row?.Days || row?.day || row?.Day || "";
  const time  = row?.time || row?.Time || row?.hours || row?.Hours || "";
  const where = row?.location || row?.Location || row?.where || row?.Where || "";

  const combo = [days, time, where]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");

  return combo ? [combo] : [];
};

useEffect(() => {
  if (selectedArea && selectedPanelRef.current) {
    selectedPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, [selectedArea]);
  const isMobile = window.innerWidth <= 700;
  // tighter padding for compact numeric columns
// Helper: is this class already in the cart?



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
    color: "#fff",
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

  // Easiest classes helper
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
    rmpScore: c.rmpScore ?? c.score ?? c.rating ?? c.rmp ?? c.RMPScore ?? null,
  }));



    setEasiestResults((prev) => ({ ...prev, [area]: easiest }));
    setEasiestLoading((prev) => ({ ...prev, [area]: false }));
  };

  const toggleEasiestClasses = (area, event) => {
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

  // Map classes to their GE areas for quick lookup
// Map classes to their GE areas for quick lookup
const classToAreas = useMemo(() => {
  const map = {};
  geRequirements.forEach((areaObj) => {
    (areaObj.classes || []).forEach((className) => {
      if (!map[className]) map[className] = [];
      map[className].push(areaObj.area);
    });
  });
  return map;
}, [geRequirements]);
const chooseAreaForClass = (className) => {
  const areas = classToAreas[className] || [];
  const takenAreas = new Set(classesTaken.map((c) => c.area));
  return areas.find((a) => !takenAreas.has(a)) || areas[0] || "Other";
};


  const c1c2Count = classesTaken.filter(
    (obj) => obj.area === "C1 Arts" || obj.area === "C2 Humanities"
  ).length;

  const handleAreaCardClick = (area) => {
    setSelectedArea(area);
    setOverlayMode("all");
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
        <h1 className="ge-title" style={{ marginTop: isMobile ? '64px' : '80px' }}>
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

    <ChecklistModal open={checklistOpen} onClose={() => setChecklistOpen(false)} mobileOffset={40}>
      <ChecklistToggleContent
        geRequirements={geRequirements}
        classesTaken={classesTaken}
        classToAreas={classToAreas}
        c1c2Fulfilled={c1c2Fulfilled}
        scrollToArea={(a) => {
          setMobileArea(a);
          setChecklistOpen(false);
          scrollToFinder(); // scrolls to Finder (which is OUTSIDE this section)
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
    }}
  >
    <SJSUMobileFinder
      geRequirements={geRequirements}
      classDetails={classDetails}
      classesTaken={classesTaken}
      onAddClass={(className, area) => addClass({ id: className, title: className, area })}
      onDeleteClass={(obj) => removeClass(obj)}
      search={search}
      setSearch={setSearch}
      classToAreas={classToAreas}
      selectedArea={mobileArea}
      onSelectArea={setMobileArea}
    />
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
onClick={() => {
 addClass({ id: obj.className, title: obj.className, area: chooseAreaForClass(obj.className) });
  setSearch("");
  searchInputRef.current?.blur();
}}

            onMouseDown={(e) => e.preventDefault()}
          >
            <strong>{obj.className}</strong>{" "}
            <span style={{ color: "#666" }}>({obj.area})</span>
          </li>
        ))}
      </ul>
    )}
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
  }}
>
  {geRequirements.map((areaObj) => {
    // used only to compute the card border “fulfilled” state
    const classesForArea = classesTaken.filter((obj) => {
      const areas =
        classToAreas[obj.className] ||
        classToAreas[obj.className.split(" - ")[0]] ||
        [];
      return areas.includes(areaObj.area);
    });

    let isFulfilled = false;
    if (areaObj.area === "C1 Arts" || areaObj.area === "C2 Humanities") {
      isFulfilled = c1c2Fulfilled;
    } else if (areaObj.area === "D. Social Sciences") {
      isFulfilled = classesForArea.length >= 2;
    } else {
      const requiredCount = areaObj.requiredCount || 1;
      isFulfilled = classesForArea.length >= requiredCount;
    }

    // classes that belong to this area
    const filteredClasses = Array.isArray(areaObj.classes)
      ? areaObj.classes.filter((cls) => classesWithProfessors.has(cls))
      : [];

    const isSelected = selectedArea === areaObj.area;

    // hover micro-interaction
    const hoverGrow = (e) => { e.currentTarget.style.transform = "scale(1.03)"; };
    const hoverReset = (e) => { e.currentTarget.style.transform = "scale(1)"; };

    return (
      <div
        key={areaObj.area}
        ref={areaRefs.current[areaObj.area]}
        className="ge-card"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") { setSelectedArea(areaObj.area); setOverlayMode("all"); } }}
        onClick={() => { setSelectedArea(areaObj.area); setOverlayMode("all"); }}
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

          {/* View All -> original list in-card (no overlay) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedArea(areaObj.area);
              setOverlayMode("all");
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
      zIndex: 1,               // stays inside the card
      display: "grid",
      gridTemplateRows: "auto 1fr",
      gap: 12,
      overflow: "hidden",      // clip to card bounds
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ margin: 0, fontSize: "1rem" }}>{areaObj.area} — Easiest</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setOverlayMode("all"); }}
          type="button"
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
          View All
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedArea(null); }}
          type="button"
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

    {/* BODY */}
    <div style={{ overflow: "auto", maxHeight: isMobile ? 340 : 420, paddingRight: 6 }}>
      {(() => {
        const easyTh = {
          ...grid.th,
          fontSize: "0.9rem",
          borderRight: "1px solid #e0e5ff",
          background: "#fafbff",
        };
        const easyTd = {
          ...grid.td,
          fontSize: "0.9rem",
          borderRight: "1px solid #eef1ff",
        };
        return (
          <table style={{ ...grid.table, borderColor: "#e0e5ff" }}>
            <colgroup>
  <col style={{ width: "85%" }} />
  <col style={{ width: "15%" }} />
</colgroup>

            <thead>
              <tr>
                <th style={easyTh}>Class</th>
                <th style={easyTh}>Professor</th>
                <th style={easyTh}>Schedule</th>
                <th style={easyTh}>RMP</th>
                <th style={easyTh}>Diff</th>
                <th style={easyTh}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(easiestResults[selectedArea] || []).map((row) => {
                const rmpLink =
                  row.rmpLink ?? (row.link && row.link !== "N/A" ? row.link : null);
                const rmpScoreRaw =
                  row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? row.RMP ?? null;
                const rmpScore =
                  typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");
                const profNode = rmpLink ? (
                  <a href={rmpLink} target="_blank" rel="noreferrer" style={{ fontWeight: 700, textDecoration: "underline" }}>
                    {row.professor || "—"}
                  </a>
                ) : (
                  <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
                );

                return (
                  <tr key={`${row.className}-${row.professor || "NA"}`}>
                    <td style={easyTd}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>{row.className}</span>
                    </td>
                    <td style={easyTd}>{profNode}</td>

                    {/* ⬇️ This is the schedule <td> you asked about (smaller font) */}
                    <td
                      style={{
                        ...easyTd,
                        fontSize: isMobile ? "0.68rem" : "0.78rem", // smaller schedule text
                        color: "#555",
                        lineHeight: 1.25,
                      }}
                    >
                      {(() => {
                        const lines = getScheduleLinesSafe(row);
                        if (!lines.length) return "—";
                        return lines.map((line, i) => (
                          <div
                            key={i}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: /^(Mo|Tu|We|Th|Fr|Sa|Su)/.test(line) ? "nowrap" : "normal",
                              wordBreak: "keep-all",
                            }}
                            title={line}
                          >
                            {line}
                          </div>
                        ));
                      })()}
                    </td>

                    <td style={easyTd}>{rmpScore}</td>
                    <td style={easyTd}>{typeof row.difficulty === "number" ? row.difficulty : "—"}</td>
<td style={easyTd}>
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
        addClass({ id: row.className, title: row.className, area: selectedArea });
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
        );
      })()}
    </div>
  </div>
)}



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
      zIndex: 1,                         // lower is fine since we stay inside the card
      display: "grid",
      gridTemplateRows: "auto 1fr",      // header + scroll area
      gap: 12,
      overflow: "hidden",                // clip overlay contents to the card bounds
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ margin: 0, fontSize: "1rem" }}>
        {areaObj.area} — {selectedAllClass ? "Class Details" : "All Options"}
      </h3>
      <div style={{ display: "flex", gap: 8 }}>
        {!selectedAllClass && (
          <button
            onClick={(e) => { e.stopPropagation(); setOverlayMode("easiest"); setSelectedAllClass(null); findEasiestClasses(areaObj.area); }}
            type="button"
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
            Easiest
          </button>
        )}
        {selectedAllClass && (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedAllClass(null); }}
            type="button"
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
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedAllClass(null); setSelectedArea(null); }}
          type="button"
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

    {/* BODY (scrolls inside the overlay; never escapes the card) */}
    <div style={{ overflow: "auto", paddingRight: 6 }}>
      {selectedAllClass ? (
        <div style={{ padding: 4 }}>
          {/* smaller schedule text inside ProfessorTable */}
          <ProfessorTable className={selectedAllClass} classDetails={classDetails} compact />
        </div>
      ) : (
        (() => {
          const th = {
            padding: "10px 12px",
            textAlign: "left",
            fontWeight: 700,
            borderBottom: "1px solid #222",
            borderRight: "1px solid #222",
            background: "#fafbff",
            whiteSpace: "nowrap",
          };
          const td = {
            padding: "10px 12px",
            borderTop: "1px solid #222",
            borderRight: "1px solid #222",
            verticalAlign: "top",
            background: "#fff",
          };
          return (
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
    <col style={{ width: isMobile ? "60%" : "85%" }} />   {/* Class */}
    {isMobile && <col style={{ width: "25%" }} />}       {/* Schedule (mobile only) */}
    <col style={{ width: "15%" }} />                     {/* Action */}
  </colgroup>

  <thead>
    <tr>
      <th style={th}>Class</th>
      {isMobile && <th style={th}>Schedule</th>}
      <th style={{ ...th, borderRight: "none", textAlign: "right" }}>Action</th>
    </tr>
  </thead>

  <tbody>
    {filteredClasses.length === 0 && (
      <tr>
        <td
          colSpan={isMobile ? 3 : 2}
          style={{ ...td, borderRight: "none", color: "#777" }}
        >
          No available classes.
        </td>
      </tr>
    )}

    {filteredClasses.map((cls) => {
      // collect unique schedule lines for this class
      const uniq = new Set();
      classDetails.forEach((d) => {
        if (d.className === cls) {
          getScheduleLinesSafe(d).forEach((line) => {
            const s = String(line).trim();
            if (s) uniq.add(s);
          });
        }
      });
      const lines = Array.from(uniq);

      return (
        <tr key={`${areaObj.area}::${cls}`}>
          {/* Class (click to open details) */}
          <td
            role="button"
            onClick={() => setSelectedAllClass(cls)}
            title={cls}
            style={{
              ...td,
              cursor: "pointer",
              fontWeight: 700,
              whiteSpace: "normal",
              wordBreak: "break-word",
              borderRight: "1px solid #222",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span>{cls}</span>
              <span aria-hidden="true">▼</span>
            </span>
          </td>

          {/* Schedule (mobile only) */}
          {isMobile && (
            <td
              style={{
                ...td,
                fontSize: "0.85rem",
                color: "#555",
                lineHeight: 1.25,
                paddingRight: 4,
                borderRight: "none",
              }}
              title={lines.join(" • ")}
            >
              {lines.length ? (
                lines.slice(0, 3).map((l, i) => (
                  <div
                    key={i}
                    style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {l}
                  </div>
                ))
              ) : (
                "—"
              )}
            </td>
          )}

          {/* Action */}
          <td
            style={{
              ...td,
              ...(isMobile
                ? {
                    textAlign: "left",
                    paddingLeft: 4,
                    whiteSpace: "nowrap",
                    borderLeft: "none",
                    width: 0,
                  }
                : { textAlign: "right" }),
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
                  borderRadius: 10,
                  padding: isMobile ? "3px 8px" : "4px 10px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  ...(isMobile ? { marginLeft: -2 } : {}),
                }}
              >
                Delete
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addClass({ id: cls, title: cls, area: areaObj.area });
                }}
                type="button"
                style={{
                  background: "#20a7ef",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: isMobile ? "3px 8px" : "4px 10px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  ...(isMobile ? { marginLeft: -2 } : {}),
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
        })()
      )}
    </div>
  </div>
)}


      </div>
    );
  })}
</div>
)}
{/* --- Selected Area details panel (decoupled from cards) --- */}
</div> {/* <-- closes .mobile-main-column */}
</div> )}