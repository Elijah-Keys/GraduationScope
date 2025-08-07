import React, { useState, useEffect } from "react";


import './ProfessorTable.css'; // Keep your styles or enhance as needed

const RMP_KEY = "score";
const DIFF_KEY = "difficulty";

export default function ProfessorTable({ className, classDetails }) {
  // Normalize class names for case/spacing-insensitive matching
  const normalize = (str) => str.replace(/\s+/g, ' ').trim().toLowerCase();

  // Filter professors matching the className prop
  const professors = classDetails.filter(
    prof => normalize(prof.className) === normalize(className)
  );

  // Sort configuration state (key and direction)
  const [sortConfig, setSortConfig] = useState({
    key: RMP_KEY,
    direction: "desc"
  });

  // Track window width for responsive layout
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 700;

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const getArrow = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  // Sort the professors array according to sortConfig
  const sorted = [...professors].sort((a, b) => {
    const aVal = typeof a[sortConfig.key] === "number" ? a[sortConfig.key] : -Infinity;
    const bVal = typeof b[sortConfig.key] === "number" ? b[sortConfig.key] : -Infinity;
    return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
  });

  if (!sorted.length) {
    return <div>No professor data for this class.</div>;
  }

  // Styles with ~10% smaller font size and padding on mobile
  const thStyle = {
    cursor: "pointer",
    padding: isMobile ? "9px 10px" : "10px 12px",
    borderBottom: "1px solid #ccc",
    borderRight: "1px solid #ccc",
    color: "#000",
    textAlign: "left",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  const tdBaseStyle = {
    padding: isMobile ? "9px 10px" : "10px 12px",
    borderBottom: "1px solid #ccc",
    color: "#000",
    textAlign: "left",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  };

  const tdLeftBorderStyle = {
    borderLeft: "1px solid #ccc",
  };

  return (
    <div className="professor-table" style={{ backgroundColor: "#fff", width: "100%", overflowX: "hidden" }}>
      <div className="professor-table-scroll" style={{ minWidth: 0 }}>
        <table
          style={{
        width: "100%",
    tableLayout: "fixed",        // Ensures no horizontal scroll
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    border: "1.5px solid #ccc",
    fontSize: "0.9rem",
    borderRadius: 12,
    whiteSpace: "normal",  
            fontSize: isMobile ? "0.86rem" : "0.95rem",
           minWidth: "0",

          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, borderLeft: "none" }}>Professor</th>
              <th
                className="clickable"
                onClick={() => handleSort(RMP_KEY)}
                style={{ ...thStyle, borderRight: "1px solid #ccc" }}
              >
                RMP Score{getArrow(RMP_KEY)}
              </th>
              <th
                className="clickable"
                onClick={() => handleSort(DIFF_KEY)}
                style={{ ...thStyle, borderRight: "1px solid #ccc" }} // Added borderRight here to fix vertical line
              >
                Difficulty{getArrow(DIFF_KEY)}
              </th>
              {/* Schedule column only on desktop */}
              {!isMobile && (
                <th style={{ ...thStyle, borderRight: "1px solid #ccc" }}>
                  Schedule
                </th>
              )}
              <th style={{ ...thStyle, borderRight: "none" }}>RMP Link</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((prof, idx) => (
            <tr key={idx} tabIndex={-1}>
                <td
                  style={{
                    ...tdBaseStyle,
                    borderLeft: "none",
                    borderRight: "1px solid #ccc",
                    fontWeight: 700,
                    maxWidth: isMobile ? 120 : undefined,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    wordWrap: "break-word",
whiteSpace: "normal",

                  }}
                  title={prof.professor}
                >
                  {prof.professor}
                </td>

                <td
                  style={{
                    ...tdBaseStyle,
                    ...tdLeftBorderStyle,
                    borderRight: "1px solid #ccc", // Fix missing vertical line here as well
                    fontWeight: 700,
                    maxWidth: isMobile ? 90 : undefined,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    wordWrap: "break-word",
whiteSpace: "normal",

                  }}
                  title={prof[RMP_KEY]}
                >
                  {prof[RMP_KEY] ?? "N/A"}
                </td>

                <td
                  style={{
                    ...tdBaseStyle,
                    ...tdLeftBorderStyle,
                    borderRight: "1px solid #ccc",
                    fontWeight: 700,
                    maxWidth: isMobile ? 90 : undefined,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    wordWrap: "break-word",
whiteSpace: "normal",

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
                      borderRight: "1px solid #ccc",
                      fontWeight: 400,
                      maxWidth: 160,
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      wordWrap: "break-word",
whiteSpace: "normal",

                    }}
                  >
                    {Array.isArray(prof.schedule)
                      ? prof.schedule.join(", ")
                      : "N/A"}
                  </td>
                )}

                <td
                  style={{
                    ...tdBaseStyle,
                    borderRight: "none",
                    borderLeft: isMobile ? "none" : "1px solid #ccc",
                    fontWeight: 400,
                    maxWidth: isMobile ? 160 : undefined,
                    whiteSpace: "nowrap",
                    wordWrap: "break-word",
whiteSpace: "normal",

                  }}
                >
                  {prof.link && prof.link !== "N/A" ? (
                    <a
                      href={prof.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#004ea2", whiteSpace: "nowrap" }}
                      aria-label="View Rate My Professor page"
                      title="View Rate My Professor page"
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
  );
}
