import React, { useState } from "react";
import ProfessorTable from "./ProfessorTable";
const classToAreas = {
  "POLS 15 - Essentials of U.S. & California Government": ["US 2", "US 3"],
  "AMS 11 - Visions of Democracy": ["US 2", "US 3"]
};

export default function GETracker({ geRequirements, classDetails, onAddClass, onDeleteClass, classesTaken, c1c2Fulfilled }) {
  const [openAreas, setOpenAreas] = useState(new Set());
  const [openMenus, setOpenMenus] = useState(new Set());

  // Helper to create a unique key for each class
  const getClassKey = (area, className) => `${area}::${className}`;

  // Set of all class names with professor data
  const classesWithProfessors = new Set(
    classDetails.map(entry => entry.className)
  );
  // Build a mapping from class name to all areas it fulfills
const classToAreas = {};
geRequirements.forEach(areaObj => {
  areaObj.classes.forEach(className => {
    if (!classToAreas[className]) {
      classToAreas[className] = [];
    }
    classToAreas[className].push(areaObj.area);
  });
});
// Calculate how many C1/C2 classes have been taken
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

  return (
  <div>
  
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
    background: isFulfilled ? "#b6f2c1" : "#f0f0f0", // green if done, grey if not
    color: isFulfilled ? "#217a32" : "#222",         // dark green text if done
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
    <span style={{ color: "#217a32", marginLeft: 8, fontSize: "1.2em" }}>✔️</span>
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