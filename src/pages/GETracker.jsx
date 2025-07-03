import React, { useState } from "react";
import ProfessorTable from "../components/ProfessorTable";
import Header from '../components/Header';


export default function GETracker({ geRequirements, classDetails, onAddClass, onDeleteClass, classesTaken, c1c2Fulfilled, areaCWarning,
  search,
  setSearch,
  searchResults,
  handleAddClass }) {
     
     
  // --- Add these state hooks and helpers at the top ---
const [openAreas, setOpenAreas] = useState(new Set());
const [openMenus, setOpenMenus] = useState(new Set());

console.log("geRequirements", geRequirements);
console.log("classDetails", classDetails);
console.log("classesTaken", classesTaken);

 if (!geRequirements || !Array.isArray(geRequirements) || geRequirements.length === 0) {
  return <div style={{color:'red'}}>GE Requirements data missing or not loaded.</div>;
}
if (!classDetails || !Array.isArray(classDetails)) {
  return <div style={{color:'red'}}>Class details missing or not loaded.</div>;
}
if (!classesTaken || !Array.isArray(classesTaken)) {
  return <div style={{color:'red'}}>Classes taken data missing or not loaded.</div>;
}

const getClassKey = (area, className) => `${area}::${className}`;

const classesWithProfessors = new Set(classDetails.map(entry => entry.className));

const classToAreas = {};
geRequirements.forEach(areaObj => {
  areaObj.classes.forEach(className => {
    if (!classToAreas[className]) {
      classToAreas[className] = [];
    }
    classToAreas[className].push(areaObj.area);
  });
});

const c1c2Count = classesTaken.filter(
  obj => obj.area === "C1 Arts" || obj.area === "C2 Humanities"
).length;

const handleAreaClick = (area) => {
  setOpenAreas(prev => {
    const newSet = new Set(prev);
    if (newSet.has(area)) {
      newSet.delete(area);
    } else {
      newSet.add(area);
    }
    return newSet;
  });
};

const handleClassClick = (area, className) => {
  const key = getClassKey(area, className);
  setOpenMenus(prev => {
    const newSet = new Set(prev);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    return newSet;
  });
};
// --- End helpers ---

  return (
     <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "Average", marginTop: "120px" }}>
            <Header />
          <h1>GE Requirements</h1>
    {/* 3. Instruction above search bar */}
    <div style={{ fontSize: "1em", color: "#444", marginBottom: 6 }}>
      Search for a class you have already taken, or plan to take.
    </div>
    {/* Search Bar */}
      <div style={{ marginBottom: 24, position: "relative" }}>
        <input
          type="text"
          placeholder="Search for a class..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            borderRadius: 4,
            border: "1px solid #ccc"
          }}
        />
       {Array.isArray(searchResults) && searchResults.length > 0 && (

          <ul
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
              width: "calc(100% - 2px)",
              zIndex: 2
            }}
          >
            {searchResults.map(obj => (
              <li
                key={obj.className}
                style={{
                  padding: "6px 0",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee"
                }}
                onClick={() => handleAddClass(obj.className, obj.area)}
              >
                <strong>{obj.className}</strong>
                <span style={{ color: "#888", marginLeft: 8 }}>
                  ({obj.area})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
 
      {/* Classes Taken Section */}
      <div style={{ marginBottom: 32 }}>
        <h2>Classes Taken</h2>
  <ul>
    {classesTaken.length === 0 ? (
      <li style={{ color: "#aaa" }}>No classes taken yet.</li>
    ) : (
      classesTaken.map(obj => (
        <li key={obj.className + obj.area}>
          <strong>{obj.className}</strong>
          <span style={{ marginLeft: 8, color: "#555" }}>
            ({obj.area})
          </span>
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
  fontWeight: 600,
  transition: "background 0.2s",
}}
onMouseOver={e => e.currentTarget.style.background = "#b71c1c"}
onMouseOut={e => e.currentTarget.style.background = "#d32f2f"}

            title="Delete class"
          >
            Delete
          </button>
        </li>
      ))
    )}
  </ul>


        {/* Area C Warning */}
        <div style={{ marginTop: 16 }}>
          {areaCWarning && (
            <div style={{ color: "#b8860b", fontWeight: "bold" }}>{areaCWarning}</div>
          )}
        </div>
      </div>
      {/* 5. Instruction below all areas (just before GETracker) */}
<div style={{ fontSize: "0.97em", color: "#888", margin: "8px 0 14px 0" }}>
  Click on a class name to see more information.
</div>

      {/* GE Requirements List (sorted alphabetically by area) */}
   {geRequirements
  .map(areaObj => {
      // Define all area-specific variables inside the map callback
      const isAreaOpen = openAreas.has(areaObj.area);

      // Filter classes that have professors
      const filteredClasses = Array.isArray(areaObj.classes)
  ? areaObj.classes.filter(cls => classesWithProfessors.has(cls))
  : [];
      const classesForArea = classesTaken
  ? classesTaken.filter(obj => {
      const areas =
        classToAreas[obj.className] ||
        classToAreas[obj.className.split(" - ")[0]] ||
        [];
      return areas.includes(areaObj.area);
    })
  : [];
let isFulfilled = false;
if (areaObj.area === "C1 Arts" || areaObj.area === "C2 Humanities") {
  isFulfilled = c1c2Fulfilled;
  } else if (areaObj.area === "D. Social Sciences") {
  isFulfilled = classesForArea.length >= 2; // Must take 2 classes for Area D
} else {
  const requiredCount = areaObj.requiredCount || 1;
  isFulfilled = classesForArea.length >= requiredCount;
}
      // If you want to skip areas with no available classes, uncomment:
      // if (filteredClasses.length === 0 && classesForArea.length === 0) return null;

      return (
        <div key={areaObj.area} style={{ marginBottom: 32 }}>
        <h2
  style={{
    cursor: "pointer",
    background: isFulfilled ? "#21824b" : "#f0f0f0", // green if done, grey if not
    color: isFulfilled ? "#fff" : "#222",         // dark green text if done
    padding: "8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center"
  }}
  onClick={() => {
    setOpenAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaObj.area)) {
        newSet.delete(areaObj.area);
      } else {
        newSet.add(areaObj.area);
      }
      return newSet;
    });
  }}
>
  {areaObj.area}
  {isFulfilled && (
    <span style={{ marginLeft: 8, fontSize: "1.2em", verticalAlign: "middle" }}>
  <svg width="20" height="20" viewBox="0 0 20 20" style={{ display: "inline", verticalAlign: "middle" }}>
    <polyline points="4,11 9,16 16,6" fill="none" stroke="#fff" strokeWidth="2.5" />
  </svg>
</span>
  )}
  <span style={{ marginLeft: "auto" }}>{isAreaOpen ? "▲" : "▼"}</span>
</h2>
          {isAreaOpen && (
            <div>
              {/* Classes Taken */}
          

              {/* Available Classes to Add */}
              <div>
                <strong>Available Classes:</strong>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {filteredClasses.length === 0 ? (
                    <li style={{ color: "#aaa" }}>No available classes.</li>
                  ) : (
                    filteredClasses.map(cls => {
                      const key = getClassKey(areaObj.area, cls);
                      const isMenuOpen = openMenus.has(key);
                      const alreadyTaken = classesTaken && classesTaken.some(
  taken => taken.className === cls
);
 // Step 2: C1/C2 limit check
  const c1c2LimitReached =
    (areaObj.area === "C1 Arts" || areaObj.area === "C2 Humanities") &&
    c1c2Count >= 3;
                      return (
                        <React.Fragment key={cls}>
  <li style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
    {/* Class name button to expand/collapse professor info */}
    <button
      onClick={() => handleClassClick(areaObj.area, cls)}
      style={{
        fontWeight: isMenuOpen ? "bold" : "normal",
        background: isMenuOpen ? "#e0f7fa" : "white",
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "6px 12px",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        flex: 1
      }}
    >
      {cls} {isMenuOpen ? "▲" : "▼"}
    </button>
    {/* Add button */}
    {onAddClass && !alreadyTaken && !c1c2LimitReached && (
  <button
    onClick={() => onAddClass(cls, areaObj.area)}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "green",
      fontSize: "1.3em",
      marginLeft: 8
    }}
    title="Add class"
  >
    ➕
  </button>
)}
{c1c2LimitReached && (
  <span style={{ color: "#888", marginLeft: 8 }}>Max 3</span>
)}
</li>
  {/* Professor info */}
  {isMenuOpen && (
    <li style={{ marginBottom: 8, marginLeft: 16 }}>
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
            </div>
          )}
        </div>
      );
    })}
  </div>
);
}
