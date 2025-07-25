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
const [openAllOptions, setOpenAllOptions] = useState({});
const isMobile = window.innerWidth <= 700;

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

console.log("Easiest Results with RMP Links:", easiestResults);
console.log("Class Details with RMP Links:", classDetails.map(c => ({
  className: c.className,
  professor: c.professor,
  rmpLink: c.rmpLink || c.link
})));

 // --- Render ---  
return (
  <div
    className="ge-container"
   style={{
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "60px 24px 40px 80px", // <-- left padding is 80px, might cause offset
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
<div className="ge-title-iconbar" style={{ display: "flex", justifyContent: "center", gap: "16px", padding: "10px 0" }}>
  {[
    { to: "/", Icon: IoIosHome, label: "Home" },
    { to: "/recommend", Icon: GiBrain, label: "Recommend" },
    { to: "/about", Icon: FaCircleInfo, label: "About" },
  ].map(({ to, Icon, label }) => (
    <Link
      key={label}
      to={to}
      className="iconbar-link"
      aria-label={label}
    >
      <Icon className="iconbar-icon" />
      <span>{label}</span>
    </Link>
  ))}
</div>
{/* Start of mobile order wrapper */}
<div
  className="mobile-main-column"
  style={{
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* 1. Find Classes section */}
  <div className="ge-search-section mobile-order-1" style={{ textAlign: 'left' }}>
    <h2
      className="ge-classes-title"
      style={{
        display: 'inline-block',
        background: '#A7AABD',
        borderRadius: '22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        fontSize: '1.35rem',
        fontWeight: 700,
        margin: '0 0 14px 0',
        padding: '10px 30px',
        color: '#000',
      
      }}
    >
      Find Classes
    </h2>
    <div
      className="ge-search-label"
      style={{
        textAlign: 'left',
        marginBottom: '12px'
      }}
    >
      Search for a class you have already taken, or plan to take.
    </div>
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        placeholder="Search for a class..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="ge-search-input"
      />
      {/* Your search results list */}
      {Array.isArray(searchResults) && searchResults.length > 0 && (
        <ul
          className="ge-search-results"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '8px',
            border: '1px solid #ccc',
            borderTop: 'none',
            maxHeight: 200,
            overflowY: 'auto',
            background: '#fff',
            position: 'absolute',
            width: '100%',
            zIndex: 2,
          }}
        >
          {searchResults.map((obj) => (
            <li
              key={obj.className}
              style={{
                padding: '6px 0',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
              }}
              onClick={() => handleAddClass(obj.className, obj.area)}
            >
              <strong>{obj.className}</strong>{' '}
              <span style={{ color: '#717171' }}>({obj.area})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>

  {/* 2. Classes Taken section */}
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

  {/* 3. Checklist Toggle Button (mobile only) */}
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
        width:"80vw",
        marginLeft:"10px"
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
          width: "76vw",
          maxWidth: 420,
          boxSizing: "border-box",
        }}
        onClick={() => setChecklistOpen(v => !v)}
      >
        {checklistOpen ? "Hide Checklist" : "View Checklist"}
      </button>
    </div>
  )}

  {/* 4. Checklist Content (show conditionally) */}
  {(checklistOpen || window.innerWidth > 700) && (
    <div className="ge-checklist-btn-rect mobile-order-4" style={{ width: '100%' }}>
      <ChecklistToggleContent
        geRequirements={geRequirements}
        classesTaken={classesTaken}
        classToAreas={classToAreas}
        c1c2Fulfilled={c1c2Fulfilled}
      />
    </div>
  )}

  {/* 5. Card Grid */}
  <div
    className="ge-card-grid mobile-order-5"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "44px",
      width: '100%',
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
 <span
  className="area-title-text"
>
  {areaObj.area}
</span>

  <span>{isAreaOpen ? "▲" : ""}</span>
</div>



              {/* Find Easiest Classes button - always visible */}
<div className="card-actions-row">
  <button
    className="find-easiest-btn"
    onClick={e => {
      e.stopPropagation();
      toggleEasiestClasses(areaObj.area, e);
      // Scroll into view
      e.currentTarget.closest('.ge-card').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }}
    type="button"
  >
    Find Easiest Classes
  </button>
  <button
    className="see-all-options-btn"
    onClick={e => {
      // Simulate card click
      e.stopPropagation(); // Prevent bubbling to parent
      // Find card element and trigger its click
      const card = e.currentTarget.closest('.ge-card');
      if (card) {
        // Scroll to top first (for nice animation)
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Find your card click callback and call it manually
        handleAreaCardClick(areaObj.area);
      }
      // Optionally: If you want to **only** scroll, comment out handleAreaCardClick
    }}
    tabIndex={0}
    type="button"
    style={{ userSelect: 'none' }} // Prevent accidental text highlighting
  >
    View All Options
  </button>
</div>




              {/* Easiest Classes Table */}
              {easiestLoading[areaObj.area] && (
                <div>Loading...</div>
              )}


{easiestResults[areaObj.area]?.length > 0 && (
  <table
    className="easiest-table"
    style={{
      width: "100%",
      marginTop: 16,
      borderCollapse: "collapse",
      background: "transparent",
      border: "1px solid #ccc",
      fontSize: isMobile ? "0.76rem" : "0.95rem", // 20% smaller on mobile
    }}
  >
    <thead>
      <tr>
        <th style={{ ...thMobile, borderLeft: "none" }}>Class Name</th>
        <th style={thMobile}>Professor</th>
        <th style={thMobile}>RMP Score</th>
        <th style={{ ...thMobile, borderRight: "1px solid #ccc" }}>
          Difficulty
        </th>
        {/* SCHEDULE ONLY ON DESKTOP */}
        {!isMobile && (
          <th style={{ ...thMobile, borderRight: "1px solid #ccc" }}>
            Schedule
          </th>
        )}
        <th style={{ ...thMobile, borderRight: "none" }}>RMP Link</th>
      </tr>
    </thead>
    <tbody>
      {easiestResults[areaObj.area].map((entry, idx) => (
        <tr key={entry.className + entry.professor + idx}>
          <td className="strong-font" style={tdMobile}>{entry.className}</td>
          <td className="strong-font" style={tdMobile}>{entry.professor}</td>
          <td className="normal-font" style={tdMobile}>{entry.score ?? "N/A"}</td>
          <td
            className="normal-font"
            style={{ ...tdMobile, borderRight: "1px solid #ccc" }}
          >
            {entry.difficulty}
          </td>
          {/* SCHEDULE ONLY ON DESKTOP */}
          {!isMobile && (
            <td style={tdMobile}>
              {Array.isArray(entry.schedule) ? entry.schedule.join(", ") : "N/A"}
            </td>
          )}
          <td style={tdMobile}>
            {entry.rmpLink ? (
              <a
                href={entry.rmpLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#004ea2" }}
                onClick={e => e.stopPropagation()}
                aria-label={`View Rate My Professor page for ${entry.professor}`}
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



                 {/* ...rest of your card and content */}

    {/* Available Classes (only show if open) */}
    {isAreaOpen && (
      <div>
        <strong style={{ fontSize: "1.15em", marginBottom: 8, display: "block" }}>
          Available Classes:
        </strong>
        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          {filteredClasses.length === 0 ? (
            <li style={{ color: "#999" }}>No available classes.</li>
          ) : (
            filteredClasses.map((cls) => {
              const key = getClassKey(areaObj.area, cls);
              const isMenuOpen = openMenus.has(key);
              const alreadyTaken = classesTaken.some(
                (taken) => taken.className === cls
              );
              const c1c2LimitReached =
                (areaObj.area === "C1 Arts" || areaObj.area === "C2 Humanities") &&
                c1c2Count >= 3;

              // Find details for RMP link etc.
             const classDetail = classDetails.find(
  (detail) => detail.className === cls
);
         {/* RMP Link */}
              const rmpLink =
  classDetail && classDetail.link && classDetail.link !== "N/A"
    ? classDetail.link
    : null;
              return (
                <React.Fragment key={key}>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Add Class Button */}
                    {!alreadyTaken && !c1c2LimitReached && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddClass(cls, areaObj.area);
                        }}
                        style={{
                          background: "#fff",
                          color: "#004ea2",
                          border: "2px solid #000", 
                          borderRadius: 6,
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontWeight: 100,
                          flexShrink: 0,
                          userSelect: "none",
                        }}
                        aria-label={`Add ${cls} to classes taken`}
                        type="button"
                      >
                        ➕
                      </button>
                    )}
                    {/* Max 3 limit message */}
                    {c1c2LimitReached && (
                      <span style={{ color: "#999", flexShrink: 0 }}>Max 3</span>
                    )}

                    {/* Class Name Toggle Button */}
                    <button
                      onClick={(e) => handleClassClick(areaObj.area, cls, e)}
                      style={{
                        flex: "1 1 auto",
                        background: isMenuOpen ? "#f1f1f1" : "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        padding: "10px 16px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: isMenuOpen ? "bold" : "normal",
                        color: "#000",
                        whiteSpace: "normal",
                        userSelect: "none",
                        minWidth: 0,
                      }}
                      aria-expanded={isMenuOpen}
                      type="button"
                    >
                      {cls} {isMenuOpen ? "▲" : "▼"}
                    </button>

           


                
                  </li>

                  {/* Professor Table toggle area */}
                  {isMenuOpen && (
                    <li
                      style={{
                        marginLeft: 10,
                        paddingLeft: 28,
                        borderLeft: "none",
                        marginBottom: 10,
                      }}
                    >
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
</div>)}
