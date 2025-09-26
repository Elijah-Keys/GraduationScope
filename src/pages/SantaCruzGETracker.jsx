import React, { useState, useEffect, useRef } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Cookies from "js-cookie";
import './GETracker.css';
import { FiSearch } from "react-icons/fi";
import { LuTarget } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineXCircle } from "react-icons/hi";
import santaCruzGeRequirements from "../data/SantaCruzgeRequirements.json";
import santaCruzClassDetails from "../data/SantaCruzclassDetails.json";



const isMobile = window.innerWidth < 768;

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

// Renders each array item on its own line
const CellList = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <span style={{ color: "#999" }}>N/A</span>;
  }
  return (
    <ul className="cell-list">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
};

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
        <LuTarget style={{ color: "#7589F3", marginRight: 8 }} />
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
          background: "#3a60ff",
          height: "100%",
          width: `${progressPercent}%`,
          transition: "width 0.5s ease"
        }} />
      </div>

      <div style={{
        fontSize: "2.5rem",
        fontWeight: 600,
        color: "#7589F3",
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
const UNIVERSITY_NAMES = {
  santacruz: "UC Santa Cruz"
};




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
   const brandBlue = "#7589F3";
  // Local state declarations (no redeclaration error):
  const [openAreas, setOpenAreas] = useState(new Set());
  const [openMenus, setOpenMenus] = useState(new Set());
  const [easiestResults, setEasiestResults] = useState({});
  const [easiestLoading, setEasiestLoading] = useState({})
  const [a1TextVisible, setA1TextVisible] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [openAllOptions, setOpenAllOptions] = useState({});

  // Your component logic and rest of the code here...


const isMobile = window.innerWidth <= 700;
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
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // Calculate scroll position so element is 10% from top of viewport
    const y = rect.top + scrollTop - window.innerHeight * 0.2 ;

    window.scrollTo({ top: y, behavior: 'smooth' });

    // Open the area if not already open
    setOpenAreas(prev => {
      if (prev.has(area)) return prev;
      const newSet = new Set(prev);
      newSet.add(area);
      return newSet;
    });
  }
};


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
    <div className="ge-container">
      {/* Title/Header */}
    <h1 className="ge-title" style={{ marginTop: '64px' }}>
  {UNIVERSITY_NAMES[university] || "University"}
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
  {isMobile && (
    <>
      {/* Toggle Button */}
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

      {/* Checklist content (toggled open) */}
      {checklistOpen && (
        <ChecklistToggleContent
          geRequirements={geRequirements}
          classesTaken={classesTaken}
          classToAreas={classToAreas}
          c1c2Fulfilled={c1c2Fulfilled}
          scrollToArea={scrollToArea}
        />
      )}
    </>
  )}

  {/* Checklist always visible on desktop */}
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

{/* Search Bar white card container */}
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
          onClick={() => handleAddClass(obj.className, obj.area)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <strong>{obj.className}</strong>{" "}
          <span style={{ color: "#666" }}>({obj.area})</span>
        </li>
      ))}
    </ul>
  )}
</div>

   {/* Mobile main column container */}
      <div
        className="mobile-main-column"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        
         
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
      


   {/* 5. Card Grid for Areas */}
    <div
  className="ge-card-grid mobile-order-5"
  style={{
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: isMobile ? 24 : 48,
    width: "100%",
    maxWidth: 1280,
      margin: isMobile ? "0 auto 32px auto" : "32px auto 0", // ✅ bottom spacing for m
    justifyItems: isMobile ? "center" : "stretch", // ✅ added line  
}}
>

          {geRequirements.map((areaObj) => {
            const isAreaOpen = openAreas.has(areaObj.area);
            const filteredClasses = Array.isArray(areaObj.classes)
              ? areaObj.classes.filter((cls) => classesWithProfessors.has(cls))
              : [];

            const classesForArea = classesTaken.filter((obj) => {
              const areas = 
                classToAreas[obj.className] || 
                classToAreas[obj.className.split(" - ")[0]] || [];
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
                ref={areaRefs.current[areaObj.area]}
                className="ge-card"
                onClick={() => handleAreaCardClick(areaObj.area)}
                style={{
                  backgroundColor: "#fff",
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
                  transition: "border-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = brandBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isFulfilled ? brandBlue : "#ccc";
                }}
                aria-expanded={isAreaOpen}
              >
                {/* Card Header */}
                <div
                  style={{
                    marginBottom: 20,
                  }}
                >
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
                  <span
                    aria-hidden="true"
                    style={{ fontSize: "1rem", fontWeight: "bold", color: "#666" }}
                  >
                    {isAreaOpen ? "▲" : "▼"}
                  </span>
                </div>

                {/* Button Row */}
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
                    className="find-easiest-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEasiestClasses(areaObj.area, e);
                      e.currentTarget.closest(".ge-card").scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    type="button"
                    style={{
                      backgroundColor: brandBlue,
                      border: "none",
                      borderRadius: 16,
                      color: "#fff",
                      padding: "10px 26px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(58, 96, 255, 0.5)",
                      userSelect: "none",
                      minWidth: 140,
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#2a44cc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = brandBlue;
                    }}
                    aria-label={`Find easiest classes for ${areaObj.area}`}
                  >
                    Find Easiest Classes
                  </button>

                  <button
                    className="see-all-options-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const card = e.currentTarget.closest(".ge-card");
                      if (card) {
                        card.scrollIntoView({ behavior: "smooth", block: "start" });
                        handleAreaCardClick(areaObj.area);
                      }
                    }}
                    tabIndex={0}
                    type="button"
                    style={{
                      backgroundColor: "transparent",
                      border: `2px solid ${brandBlue}`,
                      borderRadius: 16,
                      color: brandBlue,
                      padding: "10px 26px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      userSelect: "none",
                      minWidth: 140,
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = brandBlue;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = brandBlue;
                    }}
                    aria-label={`View all class options for ${areaObj.area}`}
                  >
                    View All Options
                  </button>
                </div>

                {/* Easiest Classes Table, loading indicator */}
                {easiestLoading[areaObj.area] && (
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontStyle: "italic",
                      color: "#666",
                      marginBottom: 12,
                      userSelect: "none",
                    }}
                  >
                    Loading...
                  </div>
                )}
                
             {easiestResults[areaObj.area]?.length > 0 && (
<div
  style={{
    overflowX: isMobile ? "auto" : "visible",
    WebkitOverflowScrolling: "touch",
    maxWidth: "100%",
  }}
>
  <table
    className="easiest-table"
    style={{
      width: isMobile ? 650 : "100%",  // force scroll on mobile
      tableLayout: "fixed",
      marginTop: 8,
      borderCollapse: "collapse",
      background: "transparent",
      border: "1.5px solid #ccc",
      fontSize: isMobile ? "0.72rem" : "0.9rem",
      boxShadow: "0 3px 8px rgba(58, 96, 255, 0.1)",
      borderRadius: 12,
      overflow: "hidden",
      userSelect: "none",
    }}
  >
      <thead style={{
        backgroundColor: "#fff",
        outline: "none",
        boxShadow: "none",
        border: "1px solid #ccc",
        borderRadius: "16px",
        overflow: "hidden",
        filter: "none",
      }}>
                     <tr>
                        <th style={{ padding: "10px 12px", borderBottom: "1.5px solid #ccc", textAlign: "left", fontWeight: 700, color: brandBlue }}>
                          Class Name
                        </th>
                        <th style={{ padding: "10px 12px", borderBottom: "1.5px solid #ccc", textAlign: "left", fontWeight: 700, color: brandBlue }}>
                          Professor
                        </th>
                        <th style={{ padding: "10px 12px", borderBottom: "1.5px solid #ccc", textAlign: "center", fontWeight: 700, color: brandBlue }}>
                          RMP Score
                        </th>
                        <th style={{ padding: "10px 12px", borderBottom: "1.5px solid #ccc", textAlign: "center", fontWeight: 700, color: brandBlue }}>
                          Difficulty
                        </th>
                      <th style={{ padding: "10px 12px", borderBottom: "1.5px solid #ccc", textAlign: "center", fontWeight: 700, color: brandBlue }}>
  Schedule
</th>

                        <th style={{ padding: "10px 12px", borderBottom: "1.5px solid #ccc", textAlign: "center", fontWeight: 700, color: brandBlue }}>
                          RMP Link
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{
  backgroundColor: "#fff",
  outline: "none",
  boxShadow: "none",
  border: "1px solid #ccc",
  borderRadius: "16px",
  overflow: "hidden",
  filter: "none",               // ✅ Just in case glow is from a CSS filter
}}
>
                      {easiestResults[areaObj.area].map((entry, idx) => (
                        <tr
                          key={entry.className + entry.professor + idx}
                          style={{
                         
                            borderBottom: idx !== easiestResults[areaObj.area].length - 1 ? "1px solid #eee" : "none",
                            cursor: "default",
                          }}
                        >
                          <td style={{ padding: "10px 12px", color: "#333", fontWeight: 600,whiteSpace: "normal",
wordBreak: "break-word",
maxWidth: "120px",
}}>
                            {entry.className}
                          </td>
                          <td style={{ padding: "10px 12px", color: "#333", fontWeight: 600,whiteSpace: "normal",
wordBreak: "break-word",
maxWidth: "120px",
 }}>
                            {entry.professor}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: "#555",whiteSpace: "normal",
wordBreak: "break-word",
maxWidth: "120px",
 }}>
                            {entry.score ?? "N/A"}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: "#555",whiteSpace: "normal",
wordBreak: "break-word",
maxWidth: "120px",
 }}>
                            {entry.difficulty}
                          </td>
                   <td style={{ padding: "10px 12px", textAlign: "center", color: "#555", whiteSpace: "normal",
wordBreak: "break-word", maxWidth: "120px", verticalAlign: "top", lineHeight: 1.35 }}>
  <CellList items={entry.schedule} />
</td>

                          <td style={{ padding: "10px 12px", textAlign: "center",whiteSpace: "normal",
wordBreak: "break-word",
maxWidth: "120px",
 }}>
                            {entry.rmpLink ? (
                              <a
                                href={entry.rmpLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: brandBlue, fontWeight: 600, userSelect: "none" }}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`View Rate My Professor page for ${entry.professor}`}
                              >
                                RMP
                              </a>
                            ) : (
                              <span style={{ color: "#999" }}>N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               )}
                  {/* Available Classes (only show if open) */}
                {isAreaOpen && (
                  <div
                    style={{
                      marginTop: 22,
                      textAlign: "left",
                      userSelect: "none",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "1.15rem",
                        marginBottom: 12,
                        display: "block",
                        color: "#222",
                      }}
                    >
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
                        <li style={{ color: "#999", fontStyle: "italic" }}>
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
                            (areaObj.area === "C1 Arts" || areaObj.area === "C2 Humanities") &&
                            c1c2Count >= 3;

                          return (
                            <React.Fragment key={key}>
                              <li
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  marginBottom: 12,
                                  flexWrap: "wrap",
                                }}
                              >
                                {!alreadyTaken && !c1c2LimitReached && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddClass(cls, areaObj.area);
                                    }}
                                    style={{
                                      backgroundColor: "#3a60ff",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: 10,
                                      padding: "8px 14px",
                                      cursor: "pointer",
                                      fontWeight: 700,
                                      flexShrink: 0,
                                      userSelect: "none",
                                      boxShadow: "0 2px 8px rgba(58, 96, 255, 0.6)",
                                      transition: "background-color 0.3s ease",
                                    }}
                                    type="button"
                                    aria-label={`Add ${cls} to classes taken`}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2a44cc"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3a60ff"}
                                  >
                                    ➕
                                  </button>
                                )}
                                {c1c2LimitReached && (
                                  <span style={{ color: "#999", flexShrink: 0 }}>
                                    Max 3
                                  </span>
                                )}
                                <button
                                  onClick={(e) => handleClassClick(areaObj.area, cls, e)}
                                  style={{
                                    flex: "1 1 auto",
                                    backgroundColor: isMenuOpen ? "#EAF2FF" : "#f9f9f9",
                                    border: `1.5px solid ${brandBlue}`,
                                    borderRadius: 12,
                                    padding: "12px 20px",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    fontWeight: isMenuOpen ? "700" : "600",
                                    color: "#222",
                                    whiteSpace: "normal",
                                    userSelect: "none",
                                    minWidth: 0,
                                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                                  }}
                                  aria-expanded={isMenuOpen}
                                  type="button"
                                  onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = "#dbeaef";
                                    e.currentTarget.style.borderColor = "#2a44cc";
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = isMenuOpen ? "#EAF2FF" : "#f9f9f9";
                                    e.currentTarget.style.borderColor = brandBlue;
                                  }}
                                >
                                  {cls} {isMenuOpen ? "▲" : "▼"}
                                </button>
                              </li>

                              {/* Professor Table toggle area */}
                              {isMenuOpen && (               
    <li style={{ all: "unset" }}>

  
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
</div> )}