import React, { useState, useEffect, useMemo } from "react";
import "./ProfessorTable.css";

const RMP_KEY = "score";
const DIFF_KEY = "difficulty";

export default function ProfessorTable({ className, classDetails, compact = false }) {
  const normalize = (str) => str.replace(/\s+/g, " ").trim().toLowerCase();

  // rows for this class
  const professors = useMemo(
    () => classDetails.filter((p) => normalize(p.className) === normalize(className)),
    [classDetails, className]
  );

  const [sortConfig, setSortConfig] = useState({ key: RMP_KEY, direction: "desc" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth <= 700;

  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const getArrow = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  const sorted = [...professors].sort((a, b) => {
    const aVal = typeof a[sortConfig.key] === "number" ? a[sortConfig.key] : -Infinity;
    const bVal = typeof b[sortConfig.key] === "number" ? b[sortConfig.key] : -Infinity;
    return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
  });

  if (!sorted.length) return <div>No professor data for this class.</div>;

  // ---- NEW: helper to break schedules into lines ----
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

  // styles
  const border = "#ccc";
  const thStyle = {
    cursor: "pointer",
    padding: isMobile ? "9px 10px" : "10px 12px",
    borderBottom: `1px solid ${border}`,
    borderRight: `1px solid ${border}`,
    color: "#000",
    textAlign: "left",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
  const tdBaseStyle = {
    padding: isMobile ? "9px 10px" : "10px 12px",
    borderBottom: `1px solid ${border}`,
    color: "#000",
    textAlign: "left",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  };
  const tdLeftBorderStyle = { borderLeft: `1px solid ${border}` };
// tighter padding for number-ish columns
// tighter padding for number-ish columns
// tighter padding for number-ish columns (about 50% tighter)
// tighter padding for number-ish columns
const densePad = isMobile ? "6px 8px" : "6px 8px";
const thDense  = { ...thStyle,    padding: densePad };
const tdDense  = { ...tdBaseStyle, padding: densePad };

// ⬇️ NEW: scale the padding 30% just for the RMP column
const scalePad = (pad, scale) => {
  const [v, h] = pad.split(" ");
  const num = (s) => parseFloat(s.replace(/[^\d.]/g, ""));
  const unit = (s) => s.replace(/[\d.]/g, "") || "px";
  const vNum = num(v), hNum = num(h), vUnit = unit(v), hUnit = unit(h);
  return `${(vNum * scale).toFixed(1)}${vUnit} ${(hNum * scale).toFixed(1)}${hUnit}`;
};
const rmpPad = scalePad(densePad, 1); // ~30% more
const rmpTh  = { ...thDense, padding: rmpPad };
const rmpTd  = { ...tdDense, padding: rmpPad };



  return (
    <div className="professor-table" style={{ backgroundColor: "#fff", width: "100%", overflowX: "hidden" }}>
      <div className="professor-table-scroll" style={{ minWidth: 0 }}>
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            backgroundColor: "#fff",
            border: `1.5px solid ${border}`,
            borderRadius: 12,
            fontSize: compact ? "0.86rem" : isMobile ? "0.86rem" : "0.95rem",
          }}
        >
          {isMobile ? (
  <colgroup>
    <col style={{ width: "55%" }} />  {/* Professor */}
    <col style={{ width: 60 }} />     {/* RMP */}
    <col style={{ width: 72 }} />     {/* Difficulty */}
  </colgroup>
) : (
  <colgroup>
    <col style={{ width: "30%" }} />  {/* Professor */}
    <col style={{ width: 64 }} />     {/* RMP */}
    <col style={{ width: 72 }} />     {/* Difficulty */}
    <col style={{ width: "auto" }} /> {/* Schedule grows */}
  </colgroup>
)}
       <thead>
  <tr>
    <th style={{ ...thStyle, borderLeft: "none" }}>Professor</th>

  <th
  className="clickable"
  onClick={() => handleSort(RMP_KEY)}
  style={{ ...rmpTh, borderRight: `1px solid ${border}` }}   // ⬅️ was thDense
>
  Score{getArrow(RMP_KEY)}
</th>


    <th
      className="clickable"
      onClick={() => handleSort(DIFF_KEY)}
      style={{
        ...thDense,
        borderRight: isMobile ? "none" : `1px solid ${border}` // last on mobile
      }}
    >
      Difficulty{getArrow(DIFF_KEY)}
    </th>

    {!isMobile && (
      <th style={{ ...thStyle, borderRight: "none" /* last on desktop */ }}>
        Schedule
      </th>
    )}
  </tr>
</thead>



          <tbody>
            {sorted.map((prof, idx) => {
              const rmpScore =
                typeof prof[RMP_KEY] === "number" ? prof[RMP_KEY].toFixed(1) : prof[RMP_KEY] ?? "N/A";

              return (
                <tr key={idx} tabIndex={-1}>
                  {/* Professor (bold, and linked if RMP link exists) */}
                  <td
                    style={{
                      ...tdBaseStyle,
                      borderLeft: "none",
                      borderRight: `1px solid ${border}`,
                      fontWeight: 700,
                      whiteSpace: "normal",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={prof.professor}
                  >
                    {prof.link && prof.link !== "N/A" ? (
                      <a
                        href={prof.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontWeight: 700, textDecoration: "underline" }}
                      >
                        {prof.professor}
                      </a>
                    ) : (
                      prof.professor
                    )}
                  </td>

                  {/* RMP Score */}
              {/* RMP Score */}
<td
  style={{
    ...rmpTd,                                  // ⬅️ was tdDense
    ...tdLeftBorderStyle,
    borderRight: `1px solid ${border}`,
    fontWeight: 700,
    whiteSpace: "nowrap",
  }}
  title={rmpScore}
>
  {rmpScore}
</td>


{/* Difficulty */}
<td
  style={{
    ...tdDense,
    ...tdLeftBorderStyle,
    borderRight: isMobile ? "none" : `1px solid ${border}`, // last on mobile
    fontWeight: 700,
    whiteSpace: "nowrap",
  }}
  title={prof[DIFF_KEY]}
>
  {prof[DIFF_KEY] ?? "N/A"}
</td>

{/* Schedule (desktop only) */}
{!isMobile && (
  <td
    style={{
      ...tdBaseStyle,
      ...tdLeftBorderStyle,
      borderRight: "none", // last on desktop
      fontWeight: 400,
      whiteSpace: "normal",
      lineHeight: 1.25,
      fontSize: compact ? "0.78rem" : undefined,
    }}
  >
    {(() => {
      const lines = getScheduleLines(prof);
      if (!lines.length) return "—";
      return lines.map((line, i) => (
        <div
          key={i}
          style={{
            whiteSpace: /^(Mo|Tu|We|Th|Fr|Sa|Su)/.test(line) ? "nowrap" : "normal",
            wordBreak: "keep-all",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
          title={line}
        >
          {line}
        </div>
      ));
    })()}
  </td>
)}

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
