import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Cookies from "js-cookie";
import "./GETracker.css";
import { FiSearch } from "react-icons/fi";
import { LuTarget } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineXCircle } from "react-icons/hi";
import santaCruzGeRequirements from "../data/SantaCruzgeRequirements.json";
import santaCruzClassDetails from "../data/SantaCruzclassDetails.json";

/** === Hook: useIsMobile (same behavior as SJSU) === */
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

/** === Checklist modal (like SJSU) === */
function ChecklistModal({ open, onClose, children, brandBlue = "#20A7EF",yOffset = 32,                 }) {
  const isMobile = useIsMobile(700);

  useEffect(() => {
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
      transform: isMobile ? `translateY(${yOffset}px)` : undefined, // ← use it
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

/** === Checklist grid === */
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

/** util to split schedule lines (used in mobile + desktop) */
const getScheduleLines = (entry) => {
  if (!entry) return [];
  if (Array.isArray(entry.schedules) && entry.schedules.length) return entry.schedules;
  if (Array.isArray(entry.schedule) && entry.schedule.length) return entry.schedule;
  if (Array.isArray(entry.sections) && entry.sections.length) return entry.sections;
  const raw = entry.schedule || entry.time || entry.days || "";
  if (!raw) return [];
  return String(raw).split(/\s*(?:\n|,|;|•|\/|\|)\s*/).filter(Boolean);
};

/** === Progress Summary === */
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
    <section style={{ width: "100%", backgroundColor: "transparent", padding: 0, boxShadow: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 600, marginBottom: 12, color: "#000" }}>
        <LuTarget style={{ color: "#20A7EF", marginRight: 8 }} />
        Graduation Progress
      </div>

      <div style={{ background: "#e0e0e0", borderRadius: 12, overflow: "hidden", height: 20, marginBottom: 6, width: "100%" }}>
        <div style={{ background: "#3a60ff", height: "100%", width: `${progressPercent}%`, transition: "width 0.5s ease" }} />
      </div>

      <div style={{ fontSize: "2.5rem", fontWeight: 600, color: "#20A7EF", textAlign: "center", marginBottom: 24 }}>
        {progressPercent}% <span style={{ fontSize: "0.8rem", color: "#555" }}>Complete</span>
      </div>

      {!isMobile && (
        <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", fontSize: "1.66rem", fontWeight: 600, color: "#222" }}>
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

/** === Mobile Finder (identical behavior to SJSU) === */
function MobileFinder({
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
  const isMobile = useIsMobile(700);
  // match SJSU/Chico mobile gutters + section heights
const GUTTER = 12;             // horizontal side padding
const MOBILE_BLOCK_MAX = 320;  // max height for sections (same shorter length)
const MOBILE_LIST_MAX = 180;   // max height for dropdown lists

const edge = {
  width: `calc(100% - ${GUTTER * 2}px)`,
  boxSizing: "border-box",
  margin: `0 ${GUTTER}px`,
};

  const [area, setArea] = useState(selectedArea || geRequirements?.[0]?.area || "");
  useEffect(() => {
    if (selectedArea && selectedArea !== area) setArea(selectedArea);
  }, [selectedArea]); // eslint-disable-line

  const [overlayMode, setOverlayMode] = useState("all"); // "all" | "easiest"
  const [selectedAllClass, setSelectedAllClass] = useState(null);

  const [easiestResults, setEasiestResults] = useState({});
  const [easiestLoading, setEasiestLoading] = useState({});

  const classesWithProfessors = useMemo(
    () => new Set(classDetails.map((d) => d.className)),
    [classDetails]
  );

  const chooseAreaForClass = useCallback(
    (className) => {
      const areas = classToAreas[className] || [];
      const takenAreas = new Set(classesTaken.map((c) => c.area));
      return areas.find((a) => !takenAreas.has(a)) || areas[0] || area || geRequirements?.[0]?.area || "";
    },
    [classToAreas, classesTaken, area, geRequirements]
  );

  const allOptionsForArea = useMemo(() => {
    const areaObj = geRequirements.find((a) => a.area === area);
    if (!areaObj) return [];
    return (areaObj.classes || []).filter((cls) => classesWithProfessors.has(cls));
  }, [area, geRequirements, classesWithProfessors]);

  const findEasiestClasses = useCallback(
    (selectedArea) => {
      setEasiestLoading((prev) => ({ ...prev, [selectedArea]: true }));
      const allowedSet = new Set((geRequirements.find((a) => a.area === selectedArea)?.classes || []));
      const allEntries = classDetails.filter(
        (d) => allowedSet.has(d.className) && typeof d.difficulty === "number"
      );
      if (!allEntries.length) {
        setEasiestResults((prev) => ({ ...prev, [selectedArea]: [] }));
        setEasiestLoading((prev) => ({ ...prev, [selectedArea]: false }));
        return;
      }
      allEntries.sort((a, b) => a.difficulty - b.difficulty);
      const cutoff =
        allEntries.length >= 5 ? allEntries[4].difficulty : allEntries[allEntries.length - 1].difficulty;

      const easiest = allEntries
        .filter((c) => c.difficulty <= cutoff)
        .map((c) => ({
          ...c,
          rmpLink: c.rmpLink ?? (c.link && c.link !== "N/A" ? c.link : null),
          rmpScore: c.rmpScore ?? c.score ?? c.rating ?? c.rmp ?? c.RMPScore ?? null,
        }));

      setEasiestResults((prev) => ({ ...prev, [selectedArea]: easiest }));
      setEasiestLoading((prev) => ({ ...prev, [selectedArea]: false }));
    },
    [classDetails, geRequirements]
  );

  useEffect(() => {
    if (overlayMode === "easiest" && area) findEasiestClasses(area);
  }, [area, overlayMode, findEasiestClasses]);

  const searchResults = useMemo(() => {
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
    {/* Search (mobile, guttered + shorter) */}
<div
  style={{
    ...edge,
    backgroundColor: "#fff",          // ← make it a white tile (like SJSU)
    border: "1px solid #e5e7eb",
    borderRadius: 14,                 // ← SJSU uses 14
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
      fontSize: 16,          // keep 16 to avoid iOS zoom
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
        maxHeight: MOBILE_LIST_MAX, // << shorter, matches SJSU/Chico
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


     {/* Classes Taken */}
<div
  style={{
    ...edge,
    backgroundColor: "#fff",          // ← white tile, same as SJSU
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
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

     {/* Pick GE Area (mobile, guttered) */}
<div style={{ ...edge, border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, marginBottom: 12 }}>
  <div style={{ fontWeight: 800, marginBottom: 8 }}>Filter by GE Area</div>
  <select
    value={area}
    onChange={(e) => {
      const v = e.target.value;
      setArea(v);
      onSelectArea?.(v);
      setSelectedAllClass(null);
    }}
    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db" }}
  >
    {geRequirements.map((a) => (
      <option key={a.area} value={a.area}>{a.area}</option>
    ))}
  </select>
</div>


      {/* Panel: All Options / Easiest / Details */}
      <div style={{ ...edge, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: "0.8rem" }}>
            {area} — {selectedAllClass ? "Class Details" : (overlayMode === "easiest" ? "Easiest" : "All Options")}
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            {overlayMode !== "all" && !selectedAllClass && (
              <button
                type="button"
                onClick={() => setOverlayMode("all")}
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
      background: overlayMode === "all" ? brandBlue : "transparent",
      color: overlayMode === "all" ? "#fff" : brandBlue,
      border: `2px solid ${brandBlue}`,
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

        {/* Body */}
<div style={{ overflow: "auto", paddingRight: 12, maxHeight: MOBILE_BLOCK_MAX }}>
          {selectedAllClass ? (
  <div style={{ padding: 4 }}>
   

    {/* Details table with schedule (same vibe as desktop) */}
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table
        style={{
          width: "max-content",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          border: "1.5px solid #e0e5ff",
          borderRadius: 12,
          overflow: "hidden",
          fontSize: "0.9rem",
        }}
      >
        <colgroup>
          <col style={{ width: 200 }} />  {/* Professor */}
          <col style={{ width: 64 }} />   {/* RMP */}
          <col style={{ width: 60 }} />   {/* Diff */}
          <col style={{ width: 300 }} />  {/* Schedule */}
          <col style={{ width: 90 }} />   {/* Action */}
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
            .map((row, idx) => {
              const lines = getScheduleLines(row);
              const rmpScoreRaw = row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? null;
              const rmpScore = typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");
              const rmpLink = row.rmpLink ?? (row.link && row.link !== "N/A" ? row.link : null);

              const taken = classesTaken.some(
                (t) => t.className === selectedAllClass && (t.area === area || !t.area)
              );
              const toDelete = classesTaken.find(
                (t) => t.className === selectedAllClass && (t.area === area || !t.area)
              );

              return (
                <tr key={`${selectedAllClass}-${row.professor || "NA"}-${idx}`}>
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", whiteSpace: "nowrap" }}>
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
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                    {rmpScore}
                  </td>
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                    {typeof row.difficulty === "number" ? row.difficulty : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", fontSize: ".8rem", color: "#555", lineHeight: 1.25 }}>
                    {lines.length ? (
                      lines.map((l, i) => (
                        <div
                          key={i}
                          style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                          title={l}
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
                        onClick={() => onDeleteClass(toDelete || { className: selectedAllClass, area })}
                        type="button"
                        style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 10, padding: "4px 10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddClass(selectedAllClass, area)}
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
    </div>
  </div>
) : overlayMode === "easiest" ? (

            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", touchAction: "pan-x", marginBottom: 2 }}>
              <table
                style={{
                  width: "max-content",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  border: "1.5px solid #e0e5ff",
                  borderRadius: 12,
                  overflow: "hidden",
                  fontSize: "0.92rem",
                }}
              >
                <colgroup>
                  <col style={{ width: 240 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 64 }} />
                  <col style={{ width: 60 }} />
                  <col style={{ width: 260 }} />
                  <col style={{ width: 90 }} />
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
                  {(easiestResults[area] || []).map((row) => {
                    const lines = getScheduleLines(row);
                    const rmpScoreRaw = row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? null;
                    const rmpScore = typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");
                    const taken = classesTaken.some((t) => t.className === row.className && (t.area === area || !t.area));
                    const toDelete = classesTaken.find((t) => t.className === row.className && (t.area === area || !t.area));
                    const rmpLink = row.rmpLink && row.rmpLink !== "N/A" ? row.rmpLink : null;

                    return (
                      <tr key={`${row.className}-${row.professor || "NA"}`}>
                        <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", whiteSpace: "nowrap" }}>
                          <span style={{ fontWeight: 600 }}>{row.className}</span>
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
                        <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                          {rmpScore}
                        </td>
                        <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center", whiteSpace: "nowrap" }}>
                          {typeof row.difficulty === "number" ? row.difficulty : "—"}
                        </td>
                        <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", fontSize: ".8rem", color: "#555", lineHeight: 1.25 }}>
                          {lines.length ? (
                            lines.map((l, i) => (
                              <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={l}>
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
                              onClick={() => onDeleteClass(toDelete || { className: row.className, area })}
                              type="button"
                              style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 10, padding: "4px 10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              onClick={() => onAddClass(row.className, area)}
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
            </div>
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
                  const toDelete = classesTaken.find(
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

/** === Desktop overlay container (used inside cards) === */
function OverlayContainer({ title, headerButtons, children, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        inset: 12,
        background: "#fff",
        border: "2px solid #20A7EF",
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{title}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {headerButtons}
          <button
            onClick={onClose}
            type="button"
            className="ge-btn ge-btn--outline"
            aria-label="Close"
          >
            Close
          </button>
        </div>
      </div>
      <div style={{ overflow: "auto", paddingRight: 6 }}>{children}</div>
    </div>
  );
}

/** === PAGE: UC Santa Cruz (SJSU parity) === */
export default function GETracker({
  geRequirements = santaCruzGeRequirements,
  classDetails = santaCruzClassDetails,
  onAddClass,
  onDeleteClass,
  classesTaken,
  c1c2Fulfilled,
  areaCWarning,
  search,
  setSearch,
  university = "santacruz",
}) {
  const brandBlue = "#20A7EF";
  const isMobile = useIsMobile(700);

  // state
  const [openAreas, setOpenAreas] = useState(new Set());
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);   // which card is open (desktop)
  const [overlayMode, setOverlayMode] = useState("all");    // "all" | "easiest" (desktop)
  const [selectedAllClass, setSelectedAllClass] = useState(null);
  const [easiestResults, setEasiestResults] = useState({});
  const [easiestLoading, setEasiestLoading] = useState({});
  const [mobileArea, setMobileArea] = useState(geRequirements?.[0]?.area || "");

  // refs
  const areaRefs = useRef({});
  geRequirements.forEach((req) => {
    if (!areaRefs.current[req.area]) {
      areaRefs.current[req.area] = React.createRef();
    }
  });
  const finderRef = useRef(null);

  // persist recent school
  useEffect(() => {
    if (university) {
      Cookies.set("recentUniversity", university, { expires: 7, secure: true, sameSite: "strict" });
    }
  }, [university]);

  // build class->areas map
  const classToAreas = useMemo(() => {
    const map = {};
    (geRequirements || []).forEach((areaObj) => {
      (areaObj.classes || []).forEach((className) => {
        if (!map[className]) map[className] = [];
        map[className].push(areaObj.area);
      });
    });
    return map;
  }, [geRequirements]);
  // Choose an area for a class (prefer one not already used in Classes Taken)
  const chooseAreaForClass = React.useCallback((className) => {
    const areas = classToAreas[className] || [];
    const takenAreas = new Set(classesTaken.map((c) => c.area));
    return areas.find((a) => !takenAreas.has(a)) || areas[0] || geRequirements?.[0]?.area || "";
  }, [classToAreas, classesTaken, geRequirements]);

  // Desktop search results (dedup by className)
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

  const classesWithProfessors = useMemo(
    () => new Set(classDetails.map((entry) => entry.className)),
    [classDetails]
  );

  const c1c2Count = classesTaken.filter(
    (obj) => obj.area === "C1 Arts" || obj.area === "C2 Humanities"
  ).length;

  const scrollToFinder = () => {
    requestAnimationFrame(() => {
      if (!finderRef.current) return;
      const rect = finderRef.current.getBoundingClientRect();
      const y = rect.top + window.scrollY - window.innerHeight * 0.15;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  };

  const scrollToArea = (area) => {
    const ref = areaRefs.current[area];
    if (ref && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const y = rect.top + scrollTop - window.innerHeight * 0.2;
      window.scrollTo({ top: y, behavior: "smooth" });
      setOpenAreas((prev) => {
        if (prev.has(area)) return prev;
        const s = new Set(prev);
        s.add(area);
        return s;
      });
    }
  };

  const scrollAndClose = (area) => {
    setMobileArea(area);
    setChecklistOpen(false);
    scrollToFinder();
  };

  // easiest (desktop card overlay)
  const findEasiestClasses = (area) => {
    setEasiestLoading((prev) => ({ ...prev, [area]: true }));
    const classes = geRequirements.find((a) => a.area === area)?.classes || [];
    const allEntries = classDetails.filter(
      (detail) => classes.includes(detail.className) && typeof detail.difficulty === "number"
    );
    if (!allEntries.length) {
      setEasiestResults((prev) => ({ ...prev, [area]: [] }));
      setEasiestLoading((prev) => ({ ...prev, [area]: false }));
      return;
    }
    allEntries.sort((a, b) => a.difficulty - b.difficulty);
    const cutoff =
      allEntries.length >= 5 ? allEntries[4].difficulty : allEntries[allEntries.length - 1].difficulty;

    const easiest = allEntries
      .filter((c) => c.difficulty <= cutoff)
      .map((c) => ({
        ...c,
        rmpLink: c.rmpLink ?? (c.link && c.link !== "N/A" ? c.link : null),
        rmpScore: c.rmpScore ?? c.score ?? c.rating ?? c.rmp ?? c.RMPScore ?? null,
      }));

    setEasiestResults((prev) => ({ ...prev, [area]: easiest }));
    setEasiestLoading((prev) => ({ ...prev, [area]: false }));
  };

  // open/close cards (desktop)
  const handleAreaCardClick = (area) => {
    setSelectedAllClass(null);
    setOverlayMode("all");
    setSelectedArea((prev) => (prev === area ? null : area));
    setOpenAreas((prev) => {
      const s = new Set(prev);
      s.has(area) ? s.delete(area) : s.add(area);
      return s;
    });
  };

  // guards
  if (!Array.isArray(geRequirements) || geRequirements.length === 0) {
    return <div style={{ color: "red" }}>GE Requirements data missing or not loaded.</div>;
  }
  if (!Array.isArray(classDetails)) {
    return <div style={{ color: "red" }}>Class details missing or not loaded.</div>;
  }
  if (!Array.isArray(classesTaken)) {
    return <div style={{ color: "red" }}>Classes taken data missing or not loaded.</div>;
  }

  const CARD_HEIGHT = isMobile ? 300 : 230;

  return (
    <div className="ge-container">
      <h1 className="ge-title" style={{ marginTop: isMobile ? 64 : 96 }}>
        UC Santa Cruz
      </h1>

      {/* Progress + Checklist container (same layout as SJSU) */}
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
        <ProgressSummary
          geRequirements={geRequirements}
          classesTaken={classesTaken}
          classToAreas={classToAreas}
          c1c2Fulfilled={c1c2Fulfilled}
          isMobile={isMobile}
        />

        {/* Mobile: Checklist button + modal (just like SJSU) */}
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
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#20a7ef")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brandBlue)}
                onClick={() => setChecklistOpen((o) => !o)}
                type="button"
                aria-expanded={checklistOpen}
                aria-controls="ge-checklist-content-mobile"
              >
                {checklistOpen ? "Hide Checklist" : "View Checklist"}
              </button>
            </div>

            <ChecklistModal open={checklistOpen} onClose={() => setChecklistOpen(false)} brandBlue={brandBlue} yOffset={40}>
              <ChecklistToggleContent
                geRequirements={geRequirements}
                classesTaken={classesTaken}
                classToAreas={classToAreas}
                c1c2Fulfilled={c1c2Fulfilled}
                scrollToArea={(area) => {
                  setMobileArea(area);
                  setChecklistOpen(false);
                  scrollToFinder();
                }}
              />
            </ChecklistModal>
          </>
        )}

        {/* Desktop: checklist grid always visible */}
        {!isMobile && (
          <div id="ge-checklist-content" style={{ marginTop: 8 }}>
            <ChecklistToggleContent
              geRequirements={geRequirements}
              classesTaken={classesTaken}
              classToAreas={classToAreas}
              c1c2Fulfilled={c1c2Fulfilled}
              scrollToArea={scrollToArea}
            />
          </div>
        )}
      </section>

      {/* Mobile: SJSU-style finder under progress */}
      {isMobile && (
        <div ref={finderRef}>
          <MobileFinder
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

        {/* Desktop: search box (functional) */}
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
            position: "relative",
          }}
          aria-label="Search courses and professors"
        >
          <h2
            className="ge-section-title"
            style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}
          >
            <FiSearch aria-hidden="true" /> Search
          </h2>

          <div style={{ position: "relative" }}>  
            {/* input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course or professor"
              aria-label="Search courses"
              autoComplete="off"
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                padding: "12px 16px 12px 44px",
                fontSize: 16,
                lineHeight: 1.15,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                outline: "none",
                WebkitAppearance: "none",
                appearance: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#20A7EF")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            />

            {/* icon */}
            <FiSearch
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                opacity: 0.6,
                fontSize: 18,
              }}
              aria-hidden="true"
            />

            {/* suggestions */}
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
                  zIndex: 50,
                  borderRadius: "0 0 12px 12px",
                  boxShadow: "0 8px 16px rgba(58, 96, 255, 0.12)",
                }}
              >
                {desktopSearchResults.map((row) => (
                  <li
                    key={row.className}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      fontWeight: 600,
                      color: "#222",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                    // prevent input blur before click handler
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const area = chooseAreaForClass(row.className);
                      onAddClass(row.className, area);
                      setSearch("");
                    }}
                    title={`Add ${row.className}`}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {row.className}
                      </div>
                      <div style={{ color: "#666", fontWeight: 400, fontSize: 13 }}>
                        {(classToAreas[row.className] || []).join(", ") || "—"}
                        {row.professor ? ` • ${row.professor}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ge-btn ge-btn--primary"
                      style={{ padding: "6px 10px", borderRadius: 10 }}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}


      {/* Desktop: classes taken + area cards with overlays (same visual you had) */}
      {!isMobile && (
        <>
          <div className="mobile-main-column" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Classes Taken */}
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
              <h2 className="ge-section-title">Classes Taken</h2>
              <ul
                className="ge-classes-taken-list"
                style={{ textAlign: "left", padding: 0, margin: 0, listStyle: "none", color: "#222", fontSize: "1rem", lineHeight: 1.4, userSelect: "text" }}
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

            {/* Area cards */}
            <div
              className="ge-card-grid mobile-order-5"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 48,
                width: "100%",
                maxWidth: 1200,
                margin: "32px auto 32px",
                justifyItems: "stretch",
              }}
            >
              {geRequirements.map((areaObj) => {
                const isAreaOpen = openAreas.has(areaObj.area);
                const isSelected = selectedArea === areaObj.area;

                const filteredClasses = Array.isArray(areaObj.classes)
                  ? areaObj.classes.filter((cls) => classesWithProfessors.has(cls))
                  : [];

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

                return (
                  <div
                    key={areaObj.area}
                    ref={areaRefs.current[areaObj.area]}
                    className="ge-card"
                    onClick={() => handleAreaCardClick(areaObj.area)}
                    style={{
                      backgroundColor: "#fff",
                      height: CARD_HEIGHT,
                      minHeight: CARD_HEIGHT,
                      maxHeight: CARD_HEIGHT,
                      overflow: "hidden",
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
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = brandBlue; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = isFulfilled ? brandBlue : "#ccc"; }}
                    aria-expanded={isAreaOpen}
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
                      <span aria-hidden="true" style={{ fontSize: "1rem", fontWeight: "bold", color: "#666" }}>
                        {isAreaOpen ? "▲" : "▼"}
                      </span>
                    </div>

                    <div className="card-actions-row" style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
                      <button
                        className="ge-btn ge-btn--primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArea(areaObj.area);
                          setSelectedAllClass(null);
                          setOverlayMode("easiest");
                          findEasiestClasses(areaObj.area);
                        }}
                      >
                        Find Easiest Classes
                      </button>

                      <button
                        className="ge-btn ge-btn--outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArea(areaObj.area);
                          setSelectedAllClass(null);
                          setOverlayMode("all");
                        }}
                      >
                        View All Options
                      </button>
                    </div>

                    {/* Overlay: Easiest */}
                    {isSelected && overlayMode === "easiest" && (
                      <OverlayContainer
                        title={`${areaObj.area} — Easiest`}
                        onClose={() => setSelectedArea(null)}
                        headerButtons={
                          <button
                            onClick={(e) => { e.stopPropagation(); setOverlayMode("all"); }}
                            type="button"
                            className="ge-btn ge-btn--outline"
                          >
                            View All
                          </button>
                        }
                      >
                        <div style={{ overflow: "auto", paddingRight: 6 }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              border: "1.5px solid #e0e5ff",
                              borderRadius: 12,
                              overflow: "hidden",
                            }}
                          >
                            <thead>
                              <tr>
                                <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Class</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Professor</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Schedule</th>
                                <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>RMP</th>
                                <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Diff</th>
                                <th style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #e0e5ff", background: "#fafbff", whiteSpace: "nowrap" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(easiestResults[selectedArea] || []).map((row) => {
                                const lines = getScheduleLines(row);
                                const rmpScoreRaw = row.rmpScore ?? row.score ?? row.rating ?? row.rmp ?? row.RMPScore ?? null;
                                const rmpScore = typeof rmpScoreRaw === "number" ? rmpScoreRaw.toFixed(1) : (rmpScoreRaw || "—");
                                const rmpLink = row.rmpLink && row.rmpLink !== "N/A" ? row.rmpLink : null;

                                const taken = classesTaken.some(
                                  (t) => t.className === row.className && (t.area === areaObj.area || !t.area)
                                );
                                const toDelete = classesTaken.find(
                                  (t) => t.className === row.className && (t.area === areaObj.area || !t.area)
                                ) || { className: row.className, area: areaObj.area };

                                return (
                                  <tr key={`${row.className}-${row.professor || "NA"}`}>
                                    <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff" }}>
                                      <span style={{ fontWeight: 600 }}>{row.className}</span>
                                    </td>
                                    <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff" }}>
                                      {rmpLink ? (
                                        <a href={rmpLink} target="_blank" rel="noreferrer noopener" style={{ fontWeight: 700, textDecoration: "underline" }}>
                                          {row.professor || "—"}
                                        </a>
                                      ) : (
                                        <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
                                      )}
                                    </td>
                                    <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", fontSize: ".8rem", color: "#555", lineHeight: 1.25 }}>
                                      {lines.length ? lines.map((l, i) => <div key={i} title={l}>{l}</div>) : "—"}
                                    </td>
                                    <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center" }}>{rmpScore}</td>
                                    <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "center" }}>
                                      {typeof row.difficulty === "number" ? row.difficulty : "—"}
                                    </td>
                                    <td style={{ padding: "10px 12px", borderTop: "1px solid #e0e5ff", textAlign: "right" }}>
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
                                          onClick={(e) => { e.stopPropagation(); onAddClass(row.className, areaObj.area); }}
                                          type="button"
                                          className="ge-btn ge-btn--primary"
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
                      </OverlayContainer>
                    )}

                    {/* Overlay: All Options */}
                    {isSelected && overlayMode === "all" && (
                      <OverlayContainer
                        title={`${areaObj.area} — ${selectedAllClass ? "Class Details" : "All Options"}`}
                        onClose={() => { setSelectedAllClass(null); setSelectedArea(null); }}
                        headerButtons={
                          selectedAllClass ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedAllClass(null); }}
                              type="button"
                              className="ge-btn ge-btn--outline"
                            >
                              Back
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOverlayMode("easiest");
                                setSelectedAllClass(null);
                                findEasiestClasses(areaObj.area);
                              }}
                              type="button"
                              className="ge-btn ge-btn--outline"
                            >
                              Easiest
                            </button>
                          )
                        }
                      >
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
                                fontSize: "0.95rem",
                              }}
                            >
                              <colgroup>
                                <col style={{ width: "85%" }} />
                                <col style={{ width: "15%" }} />
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
                                {filteredClasses.length === 0 && (
                                  <tr>
                                    <td colSpan={2} style={{ padding: "10px 12px", borderTop: "1px solid #222", color: "#777" }}>
                                      No available classes.
                                    </td>
                                  </tr>
                                )}
                                {filteredClasses.map((cls) => {
                                  const taken = classesTaken.some(
                                    (t) => t.className === cls && (t.area === areaObj.area || !t.area)
                                  );
                                  const toDelete = classesTaken.find(
                                    (t) => t.className === cls && (t.area === areaObj.area || !t.area)
                                  ) || { className: cls, area: areaObj.area };

                                  const c1c2LimitReached =
                                    (areaObj.area === "C1 Arts" || areaObj.area === "C2 Humanities") && c1c2Count >= 3;

                                  return (
                                    <tr key={`${areaObj.area}::${cls}`}>
                                      <td
                                        role="button"
                                        onClick={() => setSelectedAllClass(cls)}
                                        title={cls}
                                        style={{
                                          padding: "10px 12px",
                                          borderTop: "1px solid #222",
                                          cursor: "pointer",
                                          fontWeight: 700,
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                          <span>{cls}</span>
                                          <span aria-hidden="true">▼</span>
                                        </span>
                                      </td>
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

                                        ) : !c1c2LimitReached ? (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); onAddClass(cls, areaObj.area); }}
                                            type="button"
                                            className="ge-btn ge-btn--primary"
                                          >
                                            Add
                                          </button>
                                        ) : (
                                          <span style={{ color: "#999", fontWeight: 600 }}>Max 3</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </OverlayContainer>
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
