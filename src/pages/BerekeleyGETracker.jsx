import React, { useState, useEffect, useRef } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Cookies from "js-cookie";
import './GETracker.css';
import BerkeleyGeRequirements from '../data/BerkeleygeRequirements.json';
import BerkeleyClassDetails from '../data/BerekelyclassDetails.json'
import { LuTarget } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineXCircle } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";




const isMobile = window.innerWidth < 768;
/** === Hook: useIsMobile (same behavior as SJSU/Chico/UCSC) === */
/** === Hook: useIsMobile (same behavior as SJSU/Chico/UCSC) === */
function useIsMobile(max = 700) {
  const [m, setM] = React.useState(
    typeof window !== "undefined" ? window.innerWidth <= max : false
  );

  React.useEffect(() => {
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

/** === shared helper used by MobileFinder and GETracker === */
function getScheduleLines(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.schedules) && entry.schedules.length) return entry.schedules;
  if (Array.isArray(entry.schedule) && entry.schedule.length) return entry.schedule;
  if (Array.isArray(entry.sections) && entry.sections.length) return entry.sections;

  const raw = entry.schedule || entry.time || entry.days || "";
  if (!raw) return [];
  const parts = String(raw).split(/\s*(?:\n|,|;|•|\/|\|)\s*/).filter(Boolean);
  return parts.length ? parts : [String(raw)];
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
  const edge = { width: "100%", boxSizing: "border-box", marginInline: 0 };
const isMobile = useIsMobile(700);                       // replaces all window.innerWidth checks
const finderRef = useRef(null);
const [mobileArea, setMobileArea] = useState(geRequirements?.[0]?.area || "");

  const [area, setArea] = React.useState(selectedArea || geRequirements?.[0]?.area || "");
  React.useEffect(() => {
    if (selectedArea && selectedArea !== area) setArea(selectedArea);
  }, [selectedArea]); // eslint-disable-line


  const [overlayMode, setOverlayMode] = React.useState("all"); // "all" | "easiest"
  const [selectedAllClass, setSelectedAllClass] = React.useState(null);

  const [easiestResults, setEasiestResults] = React.useState({});
  const [easiestLoading, setEasiestLoading] = React.useState({});

  const classesWithProfessors = React.useMemo(
    () => new Set(classDetails.map((d) => d.className)),
    [classDetails]
  );

  const chooseAreaForClass = React.useCallback(
    (className) => {
      const areas = classToAreas[className] || [];
      const takenAreas = new Set(classesTaken.map((c) => c.area));
      return areas.find((a) => !takenAreas.has(a)) || areas[0] || area || geRequirements?.[0]?.area || "";
    },
    [classToAreas, classesTaken, area, geRequirements]
  );

  const allOptionsForArea = React.useMemo(() => {
    const areaObj = geRequirements.find((a) => a.area === area);
    if (!areaObj) return [];
    return (areaObj.classes || []).filter((cls) => classesWithProfessors.has(cls));
  }, [area, geRequirements, classesWithProfessors]);

  const findEasiestClasses = React.useCallback(
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

  React.useEffect(() => {
    if (overlayMode === "easiest" && area) findEasiestClasses(area);
  }, [area, overlayMode, findEasiestClasses]);

  const searchResults = React.useMemo(() => {
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
      {/* Search */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 10, marginBottom: 12, position: "relative" }}>
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

      {/* Classes Taken */}
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
                style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 8, color: brandBlue, padding: "6px 10px", fontWeight: 700 }}
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
        <div style={{ overflow: "auto", paddingRight: 12, maxHeight: 420 }}>
          {selectedAllClass ? (
            <div style={{ padding: 4 }}>
              <ProfessorTable className={selectedAllClass} classDetails={classDetails} compact />
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


export default function GETracker({
  geRequirements = BerkeleyGeRequirements,
  classDetails = BerkeleyClassDetails,
  onAddClass,
  onDeleteClass,
  classesTaken,
  c1c2Fulfilled,
  areaCWarning,
  search,
  setSearch,
 
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
  // put near top, after imports
const brandBlue = "#20A7EF";
const hoverGrow = (e) => { e.currentTarget.style.transform = "scale(1.03)"; };
const hoverReset = (e) => { e.currentTarget.style.transform = "scale(1)"; };

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
// --- mobile state/refs owned by the parent ---
const isMobile = useIsMobile(700);     // replace any window.innerWidth uses
const finderRef = useRef(null);
const scrollToFinder = React.useCallback(() => {
  requestAnimationFrame(() => {
    if (!finderRef.current) return;
    const rect = finderRef.current.getBoundingClientRect();
    const y = rect.top + window.scrollY - window.innerHeight * 0.15; // ~15% offset
    window.scrollTo({ top: y, behavior: "smooth" });
  });
}, []);

const [mobileArea, setMobileArea] = useState(
  geRequirements?.[0]?.area || ""
);

  // Local state declarations (no redeclaration error):
 
  const [easiestResults, setEasiestResults] = useState({});
  const [easiestLoading, setEasiestLoading] = useState({})
  
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [openAreas, setOpenAreas] = useState(new Set());
const [openMenus, setOpenMenus] = useState(new Set());
// --- Overlay selections like Chico ---
const [selectedArea, setSelectedArea] = useState(null);
const [overlayMode, setOverlayMode] = useState("all"); // "all" | "easiest"
const [selectedAllClass, setSelectedAllClass] = useState(null);

// Show if the user already added this class (optionally scoped to area)
const isTaken = (cls, area) =>
  classesTaken.some(t => t.className === cls && (!area || t.area === area));

// Delete helper that matches your existing onDeleteClass(object) API
const removeByClassName = (cls) => {
  const existing = classesTaken.find(t => t.className === cls);
  if (existing) onDeleteClass(existing);
};

// Normalize schedule into lines (handles various shapes)



  // Your component logic and rest of the code here...
// --- Build a class index (className -> merged info + areas) ---
const buildBerkeleyIndex = (ge, details) => {
  // class -> areas
  const classToAreas = {};
  ge.forEach(a => {
    (a.classes || []).forEach(cls => {
      (classToAreas[cls] ||= []).push(a.area);
    });
  });

  // quick lookup for details
  const byName = new Map((details || []).map(d => [d.className, d]));

  const allClassNames = Array.from(new Set(Object.keys(classToAreas)));
  return allClassNames.map(className => {
    const d = byName.get(className) || {};
    return {
      className,
      areas: classToAreas[className],
      area: classToAreas[className]?.[0] || "",
      professor: d.professor ?? null,
      score: d.score ?? null,
      difficulty: d.difficulty ?? null,
      schedule: d.schedule ?? [],
      seats: d.seats ?? null,
      link: d.link ?? null,
    };
  });
};

const berkeleyIndex = React.useMemo(
  () => buildBerkeleyIndex(geRequirements, classDetails),
  [geRequirements, classDetails]
);

const [localSearchResults, setLocalSearchResults] = useState([]);

useEffect(() => {
  const q = (search || "").trim().toLowerCase();
  if (!q) return setLocalSearchResults([]);

  const res = berkeleyIndex.filter(item =>
    item.className.toLowerCase().includes(q) ||
    (item.professor || "").toLowerCase().includes(q) ||
    item.areas.some(a => a.toLowerCase().includes(q))
  );

  setLocalSearchResults(res.slice(0, 25));
}, [search, berkeleyIndex]);



const areaRefs = useRef({});
const searchInputRef = useRef(null);

geRequirements.forEach(req => {
  if (!areaRefs.current[req.area]) {
    areaRefs.current[req.area] = React.createRef();
  }
});

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
  // Open the area if not already open
setOpenAreas(prev => {
  if (prev.has(area)) return prev;
  const next = new Set(prev);
  next.add(area);
  return next;
});


  }
};


// Define shared header cell style with mobile adjustments


// Define shared data cell style with mobile adjustments


  useEffect(() => {
    if (university) {
      Cookies.set("recentUniversity", university, {
        expires: 7,
        secure: true,
        sameSite: "strict"
      });
    }
  }, [university]);
const handleAreaCardClick = (area) => {
  setOpenAreas((prev) => {
    const next = new Set(prev);
    next.has(area) ? next.delete(area) : next.add(area);
    return next;
  });
};

const handleClassClick = (area, className, event) => {
  if (event) event.stopPropagation();
  const key = `${area}::${className}`;
  setOpenMenus((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  }); 
};

// --- Helper functions ---
// Find easiest classes (Chico-style), single clean implementation
const findEasiestClasses = (area) => {
  setEasiestLoading((prev) => ({ ...prev, [area]: true }));

  const classesInArea =
    geRequirements.find((a) => a.area === area)?.classes || [];

  const allEntries = classDetails.filter(
    (detail) =>
      classesInArea.includes(detail.className) &&
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
    .filter((c) => c.difficulty <= cutoffDifficulty)
    .map((c) => ({
      ...c,
      rmpLink: c.link && c.link !== "N/A" ? c.link : null,
      rmpScore: c.rmpScore ?? c.score ?? c.rating ?? c.rmp ?? c.RMPScore ?? null,
    }));

  setEasiestResults((prev) => ({ ...prev, [area]: easiest }));
  setEasiestLoading((prev) => ({ ...prev, [area]: false }));
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

  const classToAreas = {};
  geRequirements.forEach((areaObj) => {
    areaObj.classes.forEach((className) => {
      if (!classToAreas[className]) {
        classToAreas[className] = [];
      }
      classToAreas[className].push(areaObj.area);
    });
  });

  const c1c2Count = classesTaken.filter(
    (obj) => obj.area === "C1 Arts" || obj.area === "C2 Humanities"
  ).length;

  // --- Card click toggles area open/close ---




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

 // --- Render ---  
 return (
    <div className="ge-container">
      {/* Title/Header */}
      <h1 className="ge-title" style={{ marginTop: '64px' }}>
  UC Berkeley
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

{/* Checklist Toggle + Content on Mobile (modal) */}
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
          setMobileArea(a);
          setChecklistOpen(false);
          scrollToFinder(); // jump down to the MobileFinder block
        }}
      />
    </ChecklistModal>
  </>
)}
</section>

{/* Search Bar white card container — DESKTOP ONLY */}
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
      marginRight: "auto",
      position: "relative",
      userSelect: "none",
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      margin: isMobile ? "0 auto 32px auto" : "32px auto 0 auto",
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
 {Array.isArray(localSearchResults) && localSearchResults.length > 0 && (
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
      {localSearchResults.map((obj) => (
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
  handleAddClass(obj.className, obj.area);
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
      width: 1200,
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
key={`${obj.id}-${obj.area || ""}`}

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
      
)}
{/* 5. Card Grid (desktop) OR Mobile Finder (mobile) */}
{isMobile ? (
  <div ref={finderRef} style={{ width: "92vw", margin: "0 auto 32px" }}>
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
) : (
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

      const filteredClasses = Array.isArray(areaObj.classes)
        ? areaObj.classes.filter((cls) => classesWithProfessors.has(cls))
        : [];

      const isSelected = selectedArea === areaObj.area;

      return (
        <div
          key={areaObj.area}
          ref={areaRefs.current[areaObj.area]}
          className="ge-card"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") { setSelectedArea(areaObj.area); setOverlayMode("all"); setSelectedAllClass(null); } }}
          onClick={() => { setSelectedArea(areaObj.area); setOverlayMode("all"); setSelectedAllClass(null); }}
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedArea(areaObj.area);
                setSelectedAllClass(null);
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
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(58, 96, 255, 0.5)",
                userSelect: "none",
                minWidth: 140,
              }}
            >
              Find Easiest Classes
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedArea(areaObj.area);
                setSelectedAllClass(null);
                setOverlayMode("all");
              }}
              type="button"
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
              }}
            >
              View All Options
            </button>
          </div>

          {/* === Easiest overlay (desktop) === */}
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
                    onClick={(e) => { e.stopPropagation(); setSelectedArea(null); setSelectedAllClass(null); }}
                    type="button"
                    style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div style={{ overflow: "auto", maxHeight: 420, paddingRight: 6 }}>
                {easiestLoading[selectedArea] ? (
                  <div style={{ fontStyle: "italic", color: "#666" }}>Loading…</div>
                ) : (
                  <table
                    className="easiest-grid"
                    style={{ ...grid.table, borderColor: "#e0e5ff", borderCollapse: "collapse", border: "1.5px solid #e0e5ff" }}
                  >
                    <colgroup>
                      <col style={{ width: "35%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "25%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "7%" }} />
                      <col style={{ width: "5%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ ...grid.th, background: "#fafbff" }}>Class</th>
                        <th style={{ ...grid.th, background: "#fafbff" }}>Professor</th>
                        <th style={{ ...grid.th, background: "#fafbff" }}>Schedule</th>
                        <th style={{ ...grid.th, background: "#fafbff", textAlign: "center" }}>RMP</th>
                        <th style={{ ...grid.th, background: "#fafbff", textAlign: "center" }}>Diff</th>
                        <th style={{ ...grid.th, background: "#fafbff", textAlign: "right" }}>Action</th>
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

                        return (
                          <tr key={`${row.className}-${row.professor || "NA"}`}>
                            <td style={{ ...grid.td, fontWeight: 600 }}>{row.className}</td>
                            <td style={grid.td}>
                              {rmpLink ? (
                                <a href={rmpLink} target="_blank" rel="noreferrer" style={{ fontWeight: 700, textDecoration: "underline" }}>
                                  {row.professor || "—"}
                                </a>
                              ) : (
                                <span style={{ fontWeight: 700 }}>{row.professor || "—"}</span>
                              )}
                            </td>
                            <td style={{ ...grid.td, fontSize: "0.78rem", color: "#555", lineHeight: 1.25 }}>
                              {(() => {
                                const lines = getScheduleLines(row);
                                if (!lines.length) return "—";
                                return lines.map((line, i) => (
                                  <div key={i} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: /^(Mo|Tu|We|Th|Fr|Sa|Su)/.test(line) ? "nowrap" : "normal", wordBreak: "keep-all" }} title={line}>
                                    {line}
                                  </div>
                                ));
                              })()}
                            </td>
                            <td style={{ ...grid.td, textAlign: "center" }}>{rmpScore}</td>
                            <td style={{ ...grid.td, textAlign: "center" }}>
                              {typeof row.difficulty === "number" ? row.difficulty : "—"}
                            </td>
                            <td style={{ ...grid.td, textAlign: "right" }}>
                              {isTaken(row.className, selectedArea) ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeByClassName(row.className); }}
                                  type="button"
                                  style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 10, padding: "6px 10px", fontWeight: 700, cursor: "pointer" }}
                                >
                                  Delete
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onAddClass(row.className, selectedArea); }}
                                  type="button"
                                  style={{ background: "#20a7ef", color: "#fff", border: "none", borderRadius: 10, padding: "6px 10px", fontWeight: 700, cursor: "pointer" }}
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
          )}

          {/* === All options overlay (desktop) === */}
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
                zIndex: 1,
                display: "grid",
                gridTemplateRows: "auto 1fr",
                gap: 12,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>
                  {areaObj.area} — {selectedAllClass ? "Class Details" : "All Options"}
                </h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {!selectedAllClass && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedAllClass(null); setOverlayMode("easiest"); findEasiestClasses(areaObj.area); }}
                      type="button"
                      style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Easiest
                    </button>
                  )}
                  {selectedAllClass && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedAllClass(null); }}
                      type="button"
                      style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedAllClass(null); setSelectedArea(null); }}
                    type="button"
                    style={{ background: "transparent", border: `2px solid ${brandBlue}`, borderRadius: 10, color: brandBlue, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div style={{ overflow: "auto", paddingRight: 6 }}>
                {selectedAllClass ? (
                  <div style={{ padding: 4 }}>
                    <ProfessorTable className={selectedAllClass} classDetails={classDetails} compact />
                  </div>
                ) : (
                  (() => {
                    const th = { padding: "10px 12px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #222", borderRight: "1px solid #222", background: "#fafbff", whiteSpace: "nowrap" };
                    const td = { padding: "10px 12px", borderTop: "1px solid #222", borderRight: "1px solid #222", verticalAlign: "top", background: "#fff" };

                    return (
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
                            <th style={th}>Class</th>
                            <th style={{ ...th, borderRight: "none", textAlign: "right" }}>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredClasses.length === 0 && (
                            <tr>
                              <td colSpan={2} style={{ ...td, borderRight: "none", color: "#777" }}>
                                No available classes.
                              </td>
                            </tr>
                          )}

                          {filteredClasses.map((cls) => {
                            const alreadyTaken = classesTaken.some((t) => t.className === cls);
                            const c1c2LimitReached =
                              (areaObj.area === "C1 Arts" || areaObj.area === "C2 Humanities") &&
                              classesTaken.filter(t => t.area === "C1 Arts" || t.area === "C2 Humanities").length >= 3;

                            return (
                              <tr key={`${areaObj.area}::${cls}`}>
                                <td
                                  role="button"
                                  onClick={() => setSelectedAllClass(cls)}
                                  title={cls}
                                  style={{ ...td, cursor: "pointer", fontWeight: 700, whiteSpace: "normal", wordBreak: "break-word", borderRight: "1px solid #222" }}
                                >
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                    <span>{cls}</span>
                                    <span aria-hidden="true">▼</span>
                                  </span>
                                </td>

                                <td style={{ ...td, borderRight: "none", textAlign: "right" }}>
                                  {isTaken(cls, areaObj.area) ? (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); removeByClassName(cls); }}
                                      type="button"
                                      style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 10, padding: "4px 10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                                    >
                                      Delete
                                    </button>
                                  ) : !c1c2LimitReached ? (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onAddClass(cls, areaObj.area); }}
                                      type="button"
                                      style={{ background: "#20a7ef", color: "#fff", border: "none", borderRadius: 10, padding: "4px 10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
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

</div>
</div>
 )}