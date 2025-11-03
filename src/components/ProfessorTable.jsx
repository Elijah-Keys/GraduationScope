import React, { useState, useEffect, useMemo } from "react";
import "./ProfessorTable.css";

const RMP_KEY = "score";
const DIFF_KEY = "difficulty";

export default function ProfessorTable({
  className: classNameProp,
  selectedClass,
  classDetails,
  compact = false,
}) {
  // pick the real name to use
  const targetClassName = (selectedClass || classNameProp || "").trim();

  const normalize = (str = "") => str.replace(/\s+/g, " ").trim().toLowerCase();

  // pick only rows for this class
  const professors = useMemo(
    () =>
      classDetails.filter(
        (p) => normalize(p.className) === normalize(targetClassName)
      ),
    [classDetails, targetClassName]
  );

  // safe window for mobile or SSR
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth <= 700;

  const [sortConfig, setSortConfig] = useState({
    key: RMP_KEY,
    direction: "desc",
  });

  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const getArrow = (key) =>
    sortConfig.key === key
      ? sortConfig.direction === "asc"
        ? " ▲"
        : " ▼"
      : "";

  const sorted = [...professors].sort((a, b) => {
    const aVal = typeof a[sortConfig.key] === "number" ? a[sortConfig.key] : -Infinity;
    const bVal = typeof b[sortConfig.key] === "number" ? b[sortConfig.key] : -Infinity;
    return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
  });

  if (!sorted.length) {
    return <div>No professor data for this class.</div>;
  }

  // schedule helper
  const getScheduleLines = (entry) => {
    if (!entry) return [];
    if (Array.isArray(entry.schedules) && entry.schedules.length)
      return entry.schedules;
    if (Array.isArray(entry.schedule) && entry.schedule.length)
      return entry.schedule;
    if (Array.isArray(entry.sections) && entry.sections.length)
      return entry.sections;

    const raw = entry.schedule || entry.time || entry.days || "";
    if (!raw) return [];
    const parts = String(raw)
      .split(/\s*(?:\n|,|;|•|\/|\|)\s*/)
      .filter(Boolean);
    return parts.length ? parts : [String(raw)];
  };

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
  const densePad = isMobile ? "6px 8px" : "6px 8px";
  const thDense = { ...thStyle, padding: densePad };
  const tdDense = { ...tdBaseStyle, padding: densePad };

  // keep padding util
  const scalePad = (pad, scale) => {
    const [v, h] = pad.split(" ");
    const num = (s) => parseFloat(s.replace(/[^\d.]/g, ""));
    const unit = (s) => s.replace(/[\d.]/g, "") || "px";
    const vNum = num(v);
    const hNum = num(h);
    const vUnit = unit(v);
    const hUnit = unit(h);
    return `${(vNum * scale).toFixed(1)}${vUnit} ${(hNum * scale).toFixed(1)}${hUnit}`;
  };
  const rmpPad = scalePad(densePad, 1);
  const rmpTh = { ...thDense, padding: rmpPad };
  const rmpTd = { ...tdDense, padding: rmpPad };

  return (
    <div
      className="professor-table"
      style={{ backgroundColor: "#fff", width: "100%", overflowX: "hidden" }}
    >
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
              <col style={{ width: "55%" }} />
              <col style={{ width: 60 }} />
              <col style={{ width: 72 }} />
            </colgroup>
          ) : (
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: 64 }} />
              <col style={{ width: 72 }} />
              <col style={{ width: "auto" }} />
            </colgroup>
          )}
          <thead>
            <tr>
              <th style={{ ...thStyle, borderLeft: "none" }}>Professor</th>
              <th
                className="clickable"
                onClick={() => handleSort(RMP_KEY)}
                style={{ ...rmpTh, borderRight: `1px solid ${border}` }}
              >
                Score{getArrow(RMP_KEY)}
              </th>
              <th
                className="clickable"
                onClick={() => handleSort(DIFF_KEY)}
                style={{
                  ...thDense,
                  borderRight: isMobile ? "none" : `1px solid ${border}`,
                }}
              >
                Difficulty{getArrow(DIFF_KEY)}
              </th>
              {!isMobile && (
                <th style={{ ...thStyle, borderRight: "none" }}>
                  Schedule
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((prof, idx) => {
              const rmpScore =
                typeof prof[RMP_KEY] === "number"
                  ? prof[RMP_KEY].toFixed(1)
                  : prof[RMP_KEY] ?? "N/A";

              return (
                <tr key={idx} tabIndex={-1}>
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

                  <td
                    style={{
                      ...rmpTd,
                      ...tdLeftBorderStyle,
                      borderRight: `1px solid ${border}`,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                    title={rmpScore}
                  >
                    {rmpScore}
                  </td>

                  <td
                    style={{
                      ...tdDense,
                      ...tdLeftBorderStyle,
                      borderRight: isMobile ? "none" : `1px solid ${border}`,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                    title={prof[DIFF_KEY]}
                  >
                    {prof[DIFF_KEY] ?? "N/A"}
                  </td>

                  {!isMobile && (
                    <td
                      style={{
                        ...tdBaseStyle,
                        ...tdLeftBorderStyle,
                        borderRight: "none",
                        fontWeight: 400,
                        whiteSpace: "normal",
                        lineHeight: 1.25,
                        fontSize: compact ? "0.78rem" : undefined,
                      }}
                    >
                      {(() => {
                        const lines = getScheduleLines(prof);
                        if (!lines.length) return "N/A";
                        return lines.map((line, i) => (
                          <div
                            key={i}
                            style={{
                              whiteSpace: /^(Mo|Tu|We|Th|Fr|Sa|Su)/.test(line)
                                ? "nowrap"
                                : "normal",
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
