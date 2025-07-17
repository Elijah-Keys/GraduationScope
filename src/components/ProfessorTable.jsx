import React, { useState } from "react";
import './ProfessorTable.css'; // Ensure you have this CSS file for styling

// Change these keys to match your ACTUAL data fields
const RMP_KEY = "score";       // "score" OR "rmpScore", whatever your array uses
const DIFF_KEY = "difficulty"; // probably correct

export default function ProfessorTable({ className, classDetails }) {
  const normalize = str => str.replace(/\s+/g, ' ').trim().toLowerCase();

  const professors = classDetails.filter(
    prof => normalize(prof.className) === normalize(className)
  );

  const [sortConfig, setSortConfig] = useState({
    key: RMP_KEY,
    direction: "desc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

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

  const thStyle = {
    cursor: "pointer",
    padding: "8px",
    borderBottom: "1px solid #ccc",
    color: "#fff"
  };

  const tdStyle = {
    padding: "8px",
    borderBottom: "1px solid #eee",
    color: "#fff"
  };

  return (
  <div className="professor-table">
    <div className="professor-table-scroll">
      <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th className="professor-th">Professor</th>
            <th className="clickable" onClick={() => handleSort(RMP_KEY)}>
              RMP Score {getArrow(RMP_KEY)}
            </th>
            <th className="clickable" onClick={() => handleSort(DIFF_KEY)}>
              Difficulty {getArrow(DIFF_KEY)}
            </th>
            <th className="schedule-header">Schedule</th>
            <th>RMP Link</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((prof, idx) => (
            <tr key={idx}>
              <td>{prof.professor}</td>
              <td>{prof[RMP_KEY] ?? "N/A"}</td>
              <td>{prof[DIFF_KEY] ?? "N/A"}</td>
              <td className="schedule-cell">
                {Array.isArray(prof.schedule)
                  ? prof.schedule.join(", ")
                  : "N/A"}
              </td>
              <td>
                {prof.rmpLink ? (
                  <a
                    href={prof.rmpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#91cdff", textDecoration: "underline" }}
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
);}
