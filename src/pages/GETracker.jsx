import React, { useState, useEffect } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Cookies from "js-cookie";
import './GETracker.css';
import { Link } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { GiBrain } from "react-icons/gi";
import { FaCircleInfo } from "react-icons/fa6";




function ChecklistToggleContent({ geRequirements, classesTaken, classToAreas, c1c2Fulfilled }) {
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
  university
}) {
  const [openAreas, setOpenAreas] = useState(new Set());
  const [openMenus, setOpenMenus] = useState(new Set());
  const [easiestResults, setEasiestResults] = useState({});
  const [easiestLoading, setEasiestLoading] = useState({});
  const [a1TextVisible, setA1TextVisible] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(false);



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

    const easiest = allEntries.filter(
      (c) => c.difficulty <= cutoffDifficulty
    );

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
{true && (
  <div>TEST RENDER - this should always show</div>
)}

 // --- Render ---  
return (
  <div
    className="ge-container"
    style={{
      maxWidth: "1440px",
      margin: "0 auto",
      padding: "60px 24px 40px 80px",
      fontFamily: "Average",
      color: "#000",
      marginTop: "60px",
      position: "relative"
    }}
  >
    {/* --- Title --- */}
    <h1 className="ge-rectangle-title">
      San Jose State Undergraduate Requirements
    </h1>
<div className="ge-title-iconbar">
  <Link to="/">
    <IoIosHome className="titlebar-icon" />
  </Link>
  <Link to="/recommend">
    <GiBrain className="titlebar-icon" />
  </Link>
  <Link to="/about">
    <FaCircleInfo className="titlebar-icon" />
  </Link>
</div>
    {/* --- Search Rectangle --- */}
   <div className="mobile-main-column">
  <div className="ge-search-section mobile-order-1">
      <div className="ge-search-label">
        Search for a class you have already taken, or plan to take.
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          placeholder="Search for a class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ge-search-input"
        />
        {Array.isArray(searchResults) && searchResults.length > 0 && (
          <ul
            className="ge-search-results"
            style={{
              listStyle: "none",
              margin: 0,
              padding: "8px",
              border: "1px solid #ccc",
              borderTop: "none",
              maxHeight: 200,
              overflowY: "auto",
              background: "#fff",
              position: "absolute",
              width: "100%",
              zIndex: 2
            }}
          >
            {searchResults.map((obj) => (
              <li
                key={obj.className}
                style={{
                  padding: "6px 0",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee"
                }}
                onClick={() => handleAddClass(obj.className, obj.area)}
              >
                <strong>{obj.className}</strong>{" "}
                <span style={{ color: "#717171" }}>({obj.area})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

{/* --- Checklist Toggle Button (mobile only) --- */}
{window.innerWidth <= 700 && (
  <div
    className="checklist-toggle-container mobile-order-3"
    style={{
      background: "#fff",
      border: "2px solid #434656",
      borderRadius: 14,
      padding: "12px 20px",
      margin: "12px 0",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      textAlign: "center",
    }}
  >
    <button
      className="ge-checklist-toggle-btn"
      style={{
        margin: "0 auto",
        fontSize: "1.12rem",
        background: "#558EF8",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "11px 26px",
        fontWeight: 700,
        cursor: "pointer",
        width: "86vw",
        maxWidth: 420,
        boxSizing: "border-box",
      }}
      onClick={() => setChecklistOpen(v => !v)}
    >
      {checklistOpen ? "Hide Checklist" : "View Checklist"}
    </button>
  </div>
)}



  {(checklistOpen || window.innerWidth > 700) && (
    <div className="ge-checklist-btn-rect mobile-order-4">
      <ChecklistToggleContent
        geRequirements={geRequirements}
        classesTaken={classesTaken}
        classToAreas={classToAreas}
        c1c2Fulfilled={c1c2Fulfilled}
      />
    </div>
  )}


    {/* --- Classes Taken Rectangle --- */}
     <div className="ge-classes-taken-section mobile-order-2">
      <h2 className="ge-classes-title">Classes Taken</h2>
      <ul className="ge-classes-list">
        {classesTaken.length === 0 ? (
          <li style={{ color: "#aaa" }}>No classes taken yet.</li>
        ) : (
          classesTaken.map((obj) => (
            <li key={obj.className + obj.area}>
              <strong>{obj.className}</strong>{" "}
              <span style={{ color: "#555" }}>({obj.area})</span>
              <button
                onClick={() => onDeleteClass(obj)}
                style={{
                  marginLeft: 8,
                  color: "#fff",
                  background: "#d32f2f",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
      {areaCWarning && (
        <div className="ge-classes-warning">
          {areaCWarning}
        </div>
      )}
    </div>

    <div
    className="ge-card-grid mobile-order-5"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "44px",
    }}
  >





        {geRequirements.map((areaObj) => {
          const isAreaOpen = openAreas.has(areaObj.area);
          const filteredClasses = Array.isArray(areaObj.classes)
            ? areaObj.classes.filter((cls) =>
                classesWithProfessors.has(cls)
              )
            : [];

          const classesForArea = classesTaken.filter((obj) => {
            const areas =
              classToAreas[obj.className] ||
              classToAreas[obj.className.split(" - ")[0]] ||
              [];
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
  className="ge-card"
  onClick={() => handleAreaCardClick(areaObj.area)}
   style={{
    background: "url('/liquid-cheese.svg') center center / cover no-repeat",
    minHeight: 215,
    minWidth: 230,
    borderRadius: 16,
    padding: "24px 28px",
    minHeight: 215,
    fontSize: "1.14rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // center horizontally
    justifyContent: "space-between", // push button to bottom
    color: "#fff",
    border: "2.5px solid #F1F1E6",
    boxShadow: "0 6px 18px 2px rgba(100,116,139,0.17), 0 1.5px 6px 0 rgba(171,178,200,0.13)",boxShadow: "0 6px 18px 2px rgba(0, 0, 0, 0.17), 0 1.5px 6px 0 rgba(171,178,200,0.13)",
    cursor: "pointer",
    position: "relative",
    textAlign: "center" // center all text inside
  }}
>

              {/* Card header */}
      <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginBottom: 18
  }}
>
  <span style={{
    fontWeight: "bold",
    fontSize: "1.32rem",
    color: "#fff",
  }}>
    {areaObj.area}
  </span>
  <span>{isAreaOpen ? "▲" : ""}</span>
</div>

{areaObj.area === "A1 Oral Communication" && a1TextVisible && (
  <div className="a1-desktop-text">
    <div>Click Here</div>
    <div style={{ marginTop: 0 }}>or</div>
  </div>
)}

              {/* Find Easiest Classes button - always visible */}
{!isAreaOpen && (
  <button 
    onClick={(e) => toggleEasiestClasses(areaObj.area, e)}
    style={{
      background: "#558EF8",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "12px 26px",
      fontWeight: 700,
      fontSize: "1.12rem",
      cursor: "pointer",
      marginBottom: 0,
      alignSelf: "center",
      marginTop: "auto",
      marginLeft: "auto",
      marginRight: "auto"
    }}
  >
    Find Easiest Classes
  </button>
)}




              {/* Easiest Classes Table */}
              {easiestLoading[areaObj.area] && (
                <div>Loading...</div>
              )}


  {easiestResults[areaObj.area]?.length > 0 && (
  <table
    style={{
      width: "100%",
      marginTop: 16,
      borderCollapse: "collapse",
      background: "transparent",
      border: "1px solid #ccc",
    }}
  >
    <thead>
      <tr>
        <th style={th}>Professor</th>
        <th style={th}>RMP Score</th>
        <th style={th}>Difficulty</th>
        <th style={th}>Schedule</th>
        <th style={th}>RMP Link</th>
      </tr>
    </thead>
    <tbody>
      {easiestResults[areaObj.area].map((entry, idx) => (
        <tr key={entry.className + entry.professor + idx}>
          <td style={td}>{entry.professor}</td>
          <td style={td}>{entry.score ?? "N/A"}</td>
          <td style={td}>{entry.difficulty}</td>
          <td style={td}>
            {Array.isArray(entry.schedule)
              ? entry.schedule.join(", ")
              : "N/A"}
          </td>
          <td style={td}>
            {entry.rmpLink ? (
              <a
                href={entry.rmpLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#004ea2" }}
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
)}



              {/* Available Classes (only show if open) */}
              {isAreaOpen && (
                <div>
                  <strong>Available Classes:</strong>
                  <ul
                    style={{
                      listStyle: "none",
                      paddingLeft: 0,
                      marginTop: 12
                    }}
                  >
                    {filteredClasses.length === 0 ? (
                      <li style={{ color: "#999" }}>
                        No available classes.
                      </li>
                    ) : (
                      filteredClasses.map((cls) => {
                        const key = getClassKey(areaObj.area, cls);
                        const isMenuOpen = openMenus.has(key);
                        const alreadyTaken = classesTaken.some(
                          (taken) => taken.className === cls
                        );
                        const c1c2LimitReached =
                          (areaObj.area === "C1 Arts" ||
                            areaObj.area === "C2 Humanities") &&
                          c1c2Count >= 3;

                        return (
                          <React.Fragment key={cls}>
                            <li
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: 10
                              }}
                            >
                              {!alreadyTaken && !c1c2LimitReached && (
                                <button
                                  onClick={e => { e.stopPropagation(); onAddClass(cls, areaObj.area); }}
                                  style={{
                                    background: "#fff",
                                    color: "#004ea2",
                                    border: "2px solid #000",
                                    borderRadius: 6,
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    fontWeight: 100
                                  }}
                                >
                                  ➕
                                </button>
                              )}
                              {c1c2LimitReached && (
                                <span style={{ color: "#999" }}>Max 3</span>
                              )}
                              <button
                                onClick={e => handleClassClick(areaObj.area, cls, e)}
                                style={{
                                  flex: 1,
                                  background: isMenuOpen ? "#f1f1f1" : "#fff",
                                  border: "1px solid #ccc",
                                  borderRadius: "6px",
                                  padding: "10px 16px",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  fontWeight: isMenuOpen ? "bold" : "normal",
                                  color: "#000"
                                }}
                              >
                                {cls} {isMenuOpen ? "▲" : "▼"}
                              </button>
                            </li>
                            {isMenuOpen && (
                              <li style={{ marginLeft: 10 }}>
                                <ProfessorTable
                                  className={cls}
                                  classDetails={classDetails}
                                />
                              </li>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
  )}