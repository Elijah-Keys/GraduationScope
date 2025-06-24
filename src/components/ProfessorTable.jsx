import React, { useState } from "react";

export default function ProfessorTable({ className, classDetails }) {
  // Normalize function for robust matching
  const normalize = str => str.replace(/\s+/g, ' ').trim().toLowerCase();

  // Find all professor entries for this class
  const professors = classDetails.filter(
    entry => normalize(entry.className) === normalize(className)
  );

  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: "score", // "score" or "difficulty"
    direction: "desc", // "asc" or "desc"
  });

  // Sorting logic
  const sorted = [...professors].sort((a, b) => {
    if (sortConfig.key === "score") {
      return sortConfig.direction === "desc"
        ? b.score - a.score
        : a.score - b.score;
    } else if (sortConfig.key === "difficulty") {
      return sortConfig.direction === "asc"
        ? a.difficulty - b.difficulty
        : b.difficulty - a.difficulty;
    }
    return 0;
  });

  // Click handlers for sorting
  const handleSort = key => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Toggle direction
        return {
          key,
          direction:
            prev.direction === "asc" ? "desc" : "asc"
        };
      } else {
        // Set initial direction for each column
        return {
          key,
          direction: key === "score" ? "desc" : "asc"
        };
      }
    });
  };

  if (professors.length === 0) {
    return <div>No professor data available for this class.</div>;
  }

  // Helper to show arrow
  const getArrow = key => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div>
      <table border="1" cellPadding="4" style={{ marginTop: 8, width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Professor</th>
            <th
              style={{ cursor: "pointer", background: "#e0f7fa" }}
              onClick={() => handleSort("score")}
              title="Sort by RMP Score"
            >
              RMP Score{getArrow("score")}
            </th>
            <th
              style={{ cursor: "pointer", background: "#e0f7fa" }}
              onClick={() => handleSort("difficulty")}
              title="Sort by Difficulty"
            >
              Difficulty{getArrow("difficulty")}
            </th>
            <th>Schedule</th>
            <th>RMP Link</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((prof, i) => (
            <tr key={i}>
              <td>{prof.professor}</td>
              <td>{prof.score}</td>
              <td>{prof.difficulty}</td>
              <td>{prof.schedule ? prof.schedule.join(", ") : ""}</td>
              <td>
                <a href={prof.link} target="_blank" rel="noopener noreferrer">
                  Link
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
